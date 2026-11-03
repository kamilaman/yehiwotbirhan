/**
 * Authentication & Session Verification Middleware
 * Stateless JWT Verification with jsonwebtoken
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin bearer token required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid or corrupted authentication token. Please log in again.' });
  }
}

module.exports = {
  requireAdminAuth
};

