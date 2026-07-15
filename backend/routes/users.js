// routes/users.js
// User management endpoints (Admin only).

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../../database/connection');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/users (Protected, Admin only)
// Returns all users, excluding passwords.
router.get('/', verifyToken, requireAdmin, (req, res) => {
  db.all('SELECT id, name, email, role, created_at FROM users ORDER BY name ASC', [], (err, users) => {
    if (err) {
      console.error('Users query error:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(users);
  });
});

// POST /api/users (Protected, Admin only)
// Creates a new user.
router.post('/', verifyToken, requireAdmin, (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, and role are required' });
  }

  if (role !== 'admin' && role !== 'customer') {
    return res.status(400).json({ message: 'Invalid role. Must be admin or customer.' });
  }

  const userId = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
    [userId, name, email, passwordHash, role],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ message: 'Email already exists' });
        }
        console.error('Insert user error:', err.message);
        return res.status(500).json({ message: 'Database error' });
      }

      // Return the created user without the password
      res.status(201).json({
        id: userId,
        name,
        email,
        role,
        created_at: new Date().toISOString()
      });
    }
  );
});

module.exports = router;

