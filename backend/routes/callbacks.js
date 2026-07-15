// routes/callbacks.js
// Customer callback requests.
// Rule 4: Callback requests notify ONLY Super Admins.

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../database/connection');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { notifySuperAdmins } = require('../utils/notify');

// POST /api/callbacks
// Customer submits a callback request — Rule 4: ONLY Super Admin notified
router.post('/', verifyToken, (req, res) => {
  const { full_name, company_name, email, mobile, preferred_time, message } = req.body;

  if (!full_name || !email || !mobile) {
    return res.status(400).json({ message: 'Full name, email, and mobile are required.' });
  }

  const callbackId = 'CB-' + Math.floor(1000 + Math.random() * 9000);

  db.run(
    `INSERT INTO callbacks (id, customer_id, customer_name, full_name, company_name, email, mobile, preferred_time, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [callbackId, req.user.id, req.user.name, full_name, company_name || '', email, mobile, preferred_time || '', message || ''],
    function (err) {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });

      // ─── RULE 4: Notify ONLY Super Admins ─────────────────────────────────
      notifySuperAdmins({
        senderId: req.user.id,
        title: '📞 New Callback Request',
        message: `${full_name} (${company_name || 'Individual'}) has requested a callback. Phone: ${mobile}. Preferred time: ${preferred_time || 'Anytime'}. Remarks: ${message || 'None'}. ID: ${callbackId}.`,
        type: 'callback',
        referenceType: 'callback',
        referenceId: callbackId,
        priority: 'normal',
      });

      res.status(201).json({ success: true, message: 'Callback request submitted. We will contact you shortly.', callbackId });
    }
  );
});

// GET /api/callbacks — Admin & Seller retrieve all callbacks
router.get('/', verifyToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM callbacks ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json(rows || []);
  });
});

// PATCH /api/callbacks/:id/status — Admin & Seller update callback status
router.patch('/:id/status', verifyToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'contacted', 'closed'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status.' });

  db.run(
    `UPDATE callbacks SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ message: 'Callback not found.' });
      res.json({ success: true });
    }
  );
});

module.exports = router;

