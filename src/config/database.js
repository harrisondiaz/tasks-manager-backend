const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

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
      user_id INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  
  const adminEmail = 'admin@example.com';
  const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (name, email, password) 
      VALUES (?, ?, ?)
    `).run('Admin', adminEmail, hashedPassword);
  }
};

module.exports = { db, initializeDatabase };