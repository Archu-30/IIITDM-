// backend/routes/auth.js
// Authentication routes using sqlite3 async driver (database.js)
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database'); // async sqlite3 DB instance
const { verifyToken } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'stockflow_jwt_secret_2024';

// Register a new user
router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  const userRole = role || 'customer';
  const validRoles = ['admin', 'customer', 'super_admin', 'seller'];
  if (!validRoles.includes(userRole)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  // Check if email already exists
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, existing) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password and insert user
    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    db.run(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, name, email, passwordHash, userRole],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Failed to register user', error: err.message });
        }

        // Get permissions
        db.all(
          'SELECT p.permission FROM permissions p JOIN roles r ON p.role_id = r.id WHERE r.name = ?',
          [userRole],
          (errPerms, perms) => {
            const permissions = perms ? perms.map(x => x.permission) : [];
            const user = { id: userId, name, email, role: userRole, permissions };
            const token = jwt.sign(user, JWT_SECRET, { expiresIn: '12h' });
            res.status(201).json({ token, user });
          }
        );
      }
    );
  });
});

// Login existing user
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (!row) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = bcrypt.compareSync(password, row.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last_login
    db.run('UPDATE users SET last_login = datetime(\'now\') WHERE id = ?', [row.id]);

    // Get permissions
    db.all(
      'SELECT p.permission FROM permissions p JOIN roles r ON p.role_id = r.id WHERE r.name = ?',
      [row.role],
      (errPerms, perms) => {
        const permissions = perms ? perms.map(x => x.permission) : [];
        const user = { id: row.id, name: row.name, email: row.email, role: row.role, permissions };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, user });
      }
    );
  });
});

// Protected route to get current user info
router.get('/me', verifyToken, (req, res) => {
  db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get permissions
    db.all(
      'SELECT p.permission FROM permissions p JOIN roles r ON p.role_id = r.id WHERE r.name = ?',
      [row.role],
      (errPerms, perms) => {
        const permissions = perms ? perms.map(x => x.permission) : [];
        const user = { id: row.id, name: row.name, email: row.email, role: row.role, permissions };
        res.json(user);
      }
    );
  });
});

module.exports = router;
