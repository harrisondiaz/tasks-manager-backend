const request = require('supertest');
const { app } = require('../src/server'); 
const { db } = require('../src/config/database');

describe('Tasks Endpoints', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    await db.exec('DELETE FROM tasks');
    await db.exec('DELETE FROM users WHERE email = \'tasktest@test.com\'');

    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        name: 'Task Test User',
        email: 'tasktest@test.com',
        password: 'password123'
      });
    expect(registerRes.statusCode).toBe(201);

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'tasktest@test.com',
        password: 'password123'
      });
    expect(loginRes.statusCode).toBe(200);
    authToken = loginRes.body.token;
    userId = loginRes.body.user.id;
  });

  afterEach(async () => {
    await db.exec("DELETE FROM tasks");
    await db.exec("DELETE FROM users WHERE email = 'tasktest@test.com'");
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('should not create task without title', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Test Description' });
      expect(res.statusCode).toBe(500);
    });

    it('should not create task without authentication', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description'
        });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /tasks', () => {
    beforeEach(async () => {
      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task 1',
          description: 'Description 1'
        });
      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task 2',
          description: 'Description 2'
        });
    });

    it('should get all tasks for authenticated user', async () => {
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('id');
    });

    it('should return empty array when no tasks exist', async () => {
      await db.exec('DELETE FROM tasks');
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('PUT /tasks/:id', () => {
    let taskId;
    beforeEach(async () => {
      const createRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task to Update',
          description: 'Will be updated'
        });
      taskId = createRes.body.id;
    });

    it('should update a task', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task',
          description: 'Updated Description',
          completed: 1
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Tarea actualizada');
    });

    it('should not update non-existent task', async () => {
      const res = await request(app)
        .put('/tasks/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task',
          description: 'Updated Description'
        });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /tasks/:id/toggle', () => {
    let taskId;
    beforeEach(async () => {
      const createRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task to Toggle',
          description: 'Initial state false'
        });
      taskId = createRes.body.id;
    });

    it('should toggle the completion status of a task', async () => {
      const res1 = await request(app)
        .put(`/tasks/${taskId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res1.statusCode).toBe(200);
      expect(res1.body).toHaveProperty('message', 'Tarea actualizada');
      expect(res1.body).toHaveProperty('completed', true);

      const res2 = await request(app)
        .put(`/tasks/${taskId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res2.statusCode).toBe(200);
      expect(res2.body).toHaveProperty('message', 'Tarea actualizada');
      expect(res2.body).toHaveProperty('completed', false);
    });

    it('should return 404 when toggling non-existent task', async () => {
      const res = await request(app)
        .put('/tasks/999999/toggle')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId;
    beforeEach(async () => {
      const createRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task to Delete',
          description: 'Will be deleted'
        });
      taskId = createRes.body.id;
    });

    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Tarea eliminada');

      const getRes = await request(app)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(getRes.statusCode).toBe(404);
    });

    it('should not delete task from another user', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Other User',
          email: 'other@test.com',
          password: 'password123'
        });

      const otherLoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'other@test.com',
          password: 'password123'
        });

      const res = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherLoginRes.body.token}`);
      expect(res.statusCode).toBe(404);
    });

    it('should not delete non-existent task', async () => {
      const res = await request(app)
        .delete('/tasks/999999')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(404);
    });
  });
});
