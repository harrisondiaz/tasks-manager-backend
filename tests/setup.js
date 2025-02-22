process.env.NODE_ENV = 'test';
const { db, initializeDatabase } = require('../src/config/database');

beforeAll(() => {
  initializeDatabase();
});

afterAll(() => {
  db.close();
});

beforeEach(() => {
  db.exec('DELETE FROM tasks');
  db.exec('DELETE FROM users WHERE email != \'admin@example.com\'');
});
