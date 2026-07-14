// routes/notifications.js
// Notification retrieval for all users (customers, admins, super_admins) with proper scoping.

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { verifyToken } = require('../middleware/auth');
const { notifyUser } = require('../utils/notify');

// GET /api/notifications/unread-count — per-user unread count for notification bell
router.get('/unread-count', verifyToken, (req, res) => {
  db.get(
    `SELECT COUNT(*) as count FROM notifications WHERE receiver_id = ? AND is_read = 0`,
    [req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ count: row ? row.count : 0 });
    }
  );
});

// GET /api/notifications/my — per-user notification inbox (scoped dynamically by receiver_id)
router.get('/my', verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM notifications WHERE receiver_id = ? ORDER BY created_at DESC LIMIT 50`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json(rows || []);
    }
  );
});

// POST /api/notifications/mark-read — mark all notifications as read for logged-in user
router.post('/mark-read', verifyToken, (req, res) => {
  db.run(
    `UPDATE notifications SET is_read = 1 WHERE receiver_id = ?`,
    [req.user.id],
    function (err) {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ success: true, count: this.changes });
    }
  );
});

// POST /api/notifications/mark-read/:id — mark a single notification as read
router.post('/mark-read/:id', verifyToken, (req, res) => {
  db.run(
    `UPDATE notifications SET is_read = 1 WHERE id = ? AND receiver_id = ?`,
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ success: true });
    }
  );
});

module.exports = router;
