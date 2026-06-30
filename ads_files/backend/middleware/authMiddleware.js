const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      if (decoded.type === 'theatre_user') {
        const result = await query('SELECT id, username, email, theatre_name as name, role FROM theatre_users WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) {
          res.status(401);
          throw new Error('Not authorized, theatre user not found');
        }
        req.user = result.rows[0];
      } else {
        const result = await query('SELECT id, name, username, role FROM users WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) {
          res.status(401);
          throw new Error('Not authorized, user not found');
        }
        req.user = result.rows[0];
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

module.exports = { protect };
