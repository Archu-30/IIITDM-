// routes/leases.js
// Manage lease requests for customers and admins.
// Rule 2: Lease requests notify ONLY Super Admins.

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { notifySuperAdmins, notifyUser } = require('../utils/notify');

// POST /api/leases/inquire (Protected, Customer)
// Create a new lease request — Rule 2: ONLY Super Admin notified
router.post('/inquire', verifyToken, (req, res) => {
  const { warehouseName, leaseDuration, companyName, contactPerson, phone, email, message } = req.body;

  if (!warehouseName || !leaseDuration || !phone || !email || !contactPerson) {
    return res.status(400).json({ message: 'Warehouse, duration, contact person, phone, and email are required.' });
  }

  const leaseId = 'LSE-' + Math.floor(1000 + Math.random() * 9000);
  const start = new Date().toISOString().split('T')[0];

  // Insert into lease_requests
  db.run(
    `INSERT INTO lease_requests (id, tenant_id, tenant_name, warehouse_name, organization_name, start_date, plan, message, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [leaseId, req.user.id, contactPerson, warehouseName, companyName || 'None', start, leaseDuration, message || ''],
    function (err) {
      if (err) {
        console.error('Lease request error:', err.message);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      // Replicate to legacy leases table
      db.run(
        `INSERT INTO leases (id, tenant_id, tenant_name, warehouse_name, organization_name, start_date, plan, message, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [leaseId, req.user.id, contactPerson, warehouseName, companyName || 'None', start, leaseDuration, message || '']
      );

      // ─── RULE 2: Notify ONLY Super Admins ─────────────────────────────────
      notifySuperAdmins({
        senderId: req.user.id,
        title: '🏭 New Warehouse Lease Request',
        message: `${contactPerson} from ${companyName || 'Individual'} has requested a lease for "${warehouseName}" (${leaseDuration}). Contact: ${phone} | ${email}. Request ID: ${leaseId}.`,
        type: 'lease',
        referenceType: 'lease_request',
        referenceId: leaseId,
        priority: 'high',
      });

      res.status(201).json({ message: 'Lease request submitted successfully', leaseId });
    }
  );
});

// GET /api/leases/my-leases (Protected, Customer)
router.get('/my-leases', verifyToken, (req, res) => {
  db.all('SELECT * FROM lease_requests WHERE tenant_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows || []);
  });
});

// GET /api/leases (Protected, Admin, Seller & SuperAdmin)
router.get('/', verifyToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM lease_requests ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json(rows || []);
  });
});

// PATCH /api/leases/:id/status (Protected, Admin, Seller & SuperAdmin)
// Notify the customer when their lease status changes
router.patch('/:id/status', verifyToken, requireAdmin, (req, res) => {
  const { status, rejection_reason, assigned_warehouse } = req.body;

  db.get('SELECT * FROM lease_requests WHERE id = ?', [req.params.id], (fetchErr, leaseRow) => {
    if (fetchErr || !leaseRow) return res.status(404).json({ message: 'Lease request not found.' });

    db.run(
      `UPDATE lease_requests SET status = ?, rejection_reason = ?, warehouse_id = ? WHERE id = ?`,
      [status, rejection_reason || null, assigned_warehouse || null, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });

        // Update legacy table
        db.run(
          `UPDATE leases SET status = ?, rejection_reason = ?, warehouse_id = ? WHERE id = ?`,
          [status, rejection_reason || null, assigned_warehouse || null, req.params.id]
        );

        // Notify the customer (tenant) about their lease status
        const title = `🏭 Lease Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        const msg = status === 'approved'
          ? `Your lease request for "${leaseRow.warehouse_name}" has been approved! We will contact you shortly with next steps.`
          : status === 'rejected'
          ? `Your lease request for "${leaseRow.warehouse_name}" was not approved. Reason: ${rejection_reason || 'Not specified'}.`
          : `Your lease request for "${leaseRow.warehouse_name}" status has been updated to: ${status}.`;

        notifyUser({
          receiverId: leaseRow.tenant_id,
          receiverRole: 'customer',
          senderId: req.user.id,
          title,
          message: msg,
          type: 'lease',
          referenceType: 'lease_request',
          referenceId: leaseRow.id,
          priority: 'high',
        });

        res.json({ message: `Lease request updated to ${status}` });
      }
    );
  });
});

module.exports = router;
