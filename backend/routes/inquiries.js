// routes/inquiries.js
// Customer inquiries management.
// Rule 3: Inquiry requests notify ONLY Super Admins.

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../database/connection');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { notifySuperAdmins } = require('../utils/notify');

// POST /api/inquiries
// Customer submits a lease inquiry — Rule 3: ONLY Super Admin notified
router.post('/', verifyToken, (req, res) => {
  const { fullName, companyName, email, mobile, warehouseRequirement, leaseDuration, message } = req.body;

  if (!fullName || !email || !mobile || !warehouseRequirement || !leaseDuration) {
    return res.status(400).json({ message: 'Full name, email, mobile, warehouse requirement, and lease duration are required.' });
  }

  const inquiryId = 'INQ-' + Math.floor(1000 + Math.random() * 9000);

  db.run(
    `INSERT INTO inquiries (id, customer_id, customer_name, full_name, company_name, email, mobile, warehouse_requirement, lease_duration, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [inquiryId, req.user.id, req.user.name, fullName, companyName || '', email, mobile, warehouseRequirement, leaseDuration, message || ''],
    function (err) {
      if (err) {
        console.error('Inquiry submit error:', err.message);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      // Simulate sending transactional email
      console.log(`[EMAIL SENDING] To: leasing@inventraos.com | Subject: New Inquiry ${inquiryId} from ${fullName} | Message: ${message}`);

      // ─── RULE 3: Notify ONLY Super Admins ─────────────────────────────────
      notifySuperAdmins({
        senderId: req.user.id,
        title: '📧 New Customer Inquiry',
        message: `${fullName} (${companyName || 'Individual'}) submitted inquiry ${inquiryId} for "${warehouseRequirement}" warehouse for ${leaseDuration}. Contact: ${mobile} | ${email}. Message: ${message || 'None'}.`,
        type: 'inquiry',
        referenceType: 'inquiry',
        referenceId: inquiryId,
        priority: 'normal',
      });

      res.status(201).json({ success: true, message: 'Inquiry submitted successfully.', inquiryId });
    }
  );
});

// GET /api/inquiries
// Admin & Seller retrieve all inquiries
router.get('/', verifyToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM inquiries ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json(rows || []);
  });
});

// PATCH /api/inquiries/:id/status
// Admin & Seller update inquiry status
router.patch('/:id/status', verifyToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'contacted', 'closed'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status.' });

  db.run(
    `UPDATE inquiries SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ message: 'Inquiry not found.' });
      res.json({ success: true });
    }
  );
});

module.exports = router;

