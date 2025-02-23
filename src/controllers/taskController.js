const { db } = require('../config/database');

const getTasks = (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT id, title, description, completed
      FROM tasks 
      WHERE user_id = ?
    `).all(req.user.id);
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

const createTask = (req, res) => {
  const { title, description } = req.body;
  
  try {
    const result = db.prepare(`
      INSERT INTO tasks (title, description, completed, user_id) 
      VALUES (?, ?, false, ?)
    `).run(title, description, req.user.id);
    
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tarea' });
  }
};

const deleteTask = (req, res) => {
  const taskId = req.params.id;
  
  try {
    const result = db.prepare(`
      DELETE FROM tasks 
      WHERE id = ? AND user_id = ?
    `).run(taskId, req.user.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
};

const updateTask = (req, res) => {
  const taskId = req.params.id;
  const { title, description, completed } = req.body;

  const newCompleted = completed ? 0 : 1;

  try {
    const result = db.prepare(`
      UPDATE tasks 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          completed = COALESCE(?, completed)
      WHERE id = ? AND user_id = ?
    `).run(title, description, newCompleted, taskId, req.user.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json({ message: 'Tarea actualizada' });
  } catch (error) {
    
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
};

const toggleTaskComplete = (req, res) => {
  const taskId = req.params.id;
  try {
    const task = db.prepare(`
      SELECT completed FROM tasks
      WHERE id = ? AND user_id = ?
    `).get(taskId, req.user.id);

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const newCompleted = task.completed ? 0 : 1;
    const result = db.prepare(`
      UPDATE tasks 
      SET completed = ?
      WHERE id = ? AND user_id = ?
    `).run(newCompleted, taskId, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json({ message: 'Tarea actualizada', completed: !!newCompleted });
  } catch (error) {
    
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
};

module.exports = { getTasks, createTask, deleteTask, updateTask, toggleTaskComplete };