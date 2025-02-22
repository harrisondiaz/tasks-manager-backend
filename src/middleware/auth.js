const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, 'SECRET_KEY', (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      
      const dbUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.userId);
      if (!dbUser) {
        return res.sendStatus(403);
      }
      
      req.user = dbUser;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = authenticateJWT;