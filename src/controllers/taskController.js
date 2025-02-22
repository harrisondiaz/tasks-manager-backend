const { db } = require('../config/database');

const getTasks = (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT * FROM tasks 
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
      INSERT INTO tasks (title, description, user_id) 
      VALUES (?, ?, ?)
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

module.exports = { getTasks, createTask, deleteTask };