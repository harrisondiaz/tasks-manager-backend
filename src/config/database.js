const Database = require('better-sqlite3');
const path = require('path');
const generateCustomHash = require('../utils/hashGenerator');

const getDbPath = () => {
  if (process.env.NODE_ENV === 'test') {
    return process.env.DB_PATH || ':memory:';
  }
  return path.join(__dirname, '../../database/tasks.db');
};

const db = new Database(getDbPath());

const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      user_id INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  const adminEmail = 'admin@example.com';
  const adminPassword = generateCustomHash('admin123', 2262633264682);
  
  const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);

  try {
    if (adminExists) {
      const updateStmt = db.prepare('UPDATE users SET password = ? WHERE email = ?');
      updateStmt.run(adminPassword.hash, adminEmail);  
    } else {
      const insertStmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
      insertStmt.run('Admin', adminEmail, adminPassword.hash);  
    }
  } catch (error) {
    console.error('Error updating/creating admin:', error);
  }
};

module.exports = { db, initializeDatabase };