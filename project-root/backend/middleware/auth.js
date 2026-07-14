// middleware/auth.js
// JWT authentication and role-based access middleware.

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'stockflow_jwt_secret_2024';

// Verify JWT from Authorization: Bearer <token> header
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expected "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; // Attach payload { id, name, email, role, permissions }
    next();
  });
}

// Guard middleware for admin-only or seller-only operations
// Super admin, admin, and seller all have dashboard privileges
function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'seller')) {
    return res.status(403).json({ message: 'Access denied. Authorized roles only.' });
  }
  next();
}

// Guard middleware for super admin only routes
function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied. Super Admins only.' });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  requireSuperAdmin,
};
