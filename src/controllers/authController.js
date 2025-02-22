const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const generateCustomHash = require('../utils/hashGenerator');

const register = (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const { hash } = generateCustomHash(password, 2262633264682);

    const result = db.prepare(`
      INSERT INTO users (name, email, password) 
      VALUES (?, ?, ?)
    `).run(name, email, hash);

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const { hash } = generateCustomHash(password, 2262633264682);
    if (hash !== user.password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'SECRET_KEY',
      { expiresIn: '1h' }
    );

    res.json({ 
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = { register, login };