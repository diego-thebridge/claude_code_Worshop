// auth.middleware.js
// Authentication and authorization middleware

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🐛 INTENTIONAL VULNERABILITY: Hardcoded secret (should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-12345';

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// 🐛 INTENTIONAL VULNERABILITY: Broken access control
// The admin check only verifies the role from the JWT payload
// without checking the database, so a modified JWT could bypass this
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden: Admin access required' });
}

// FIX (for reference, don't use in workshop):
/*
async function requireAdmin(req, res, next) {
  // Always verify role from database, not just from JWT
  const user = await User.findById(req.userId);

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
}
*/

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

module.exports = {
  authenticate,
  requireAdmin,
  requireAuth
};
