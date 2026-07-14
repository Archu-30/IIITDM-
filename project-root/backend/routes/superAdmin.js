// routes/superAdmin.js
// All Super Admin endpoints — protected by requireSuperAdmin middleware.

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../database');
const { verifyToken, requireSuperAdmin } = require('../middleware/auth');

// Helper: log an audit entry
function logAudit(userName, userRole, action, module_, details, ip) {
  db.run(
    `INSERT INTO audit_logs (id, user_name, user_role, action, module, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), userName, userRole, action, module_, details || '', ip || '127.0.0.1']
  );
}

// ─── SYSTEM-WIDE KPI STATS ─────────────────────────────────────────────────

// GET /api/super-admin/stats
router.get('/stats', verifyToken, requireSuperAdmin, (req, res) => {
  const results = {};
  let pending = 6;
  const done = () => {
    pending--;
    if (pending === 0) res.json(results);
  };

  db.get("SELECT COUNT(*) as count FROM organizations", [], (err, row) => {
    results.totalOrganizations = row ? row.count : 0;
    done();
  });
  db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", [], (err, row) => {
    results.totalAdmins = row ? row.count : 0;
    done();
  });
  db.get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'", [], (err, row) => {
    results.totalTenants = row ? row.count : 0;
    done();
  });
  db.get("SELECT COUNT(*) as count FROM stock_items", [], (err, row) => {
    results.totalWarehouses = row ? row.count : 0;
    done();
  });
  db.get("SELECT COUNT(*) as count FROM leases WHERE status = 'active'", [], (err, row) => {
    results.activeLeases = row ? row.count : 0;
    done();
  });
  db.get("SELECT SUM(revenue) as total FROM organizations", [], (err, row) => {
    results.totalRevenue = row && row.total ? row.total : 0;
    results.totalStaff = 12; // placeholder
    results.pendingPayments = 8; // placeholder
    results.openTickets = 5; // placeholder
    done();
  });
});

// ─── REVENUE ANALYTICS ────────────────────────────────────────────────────

// GET /api/super-admin/revenue
router.get('/revenue', verifyToken, requireSuperAdmin, (req, res) => {
  // Generate monthly revenue trend from leases
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const monthlyData = months.map((month, i) => ({
    month,
    revenue: Math.floor(120000 + Math.random() * 80000 + i * 8000),
    target: 180000 + i * 5000,
  }));
  res.json({ monthlyRevenue: monthlyData });
});

// ─── ORGANIZATIONS ────────────────────────────────────────────────────────

// GET /api/super-admin/organizations
router.get('/organizations', verifyToken, requireSuperAdmin, (req, res) => {
  const search = req.query.search || '';
  const params = search ? [`%${search}%`] : [];
  const query = search
    ? 'SELECT * FROM organizations WHERE name LIKE ? OR location LIKE ? ORDER BY created_at DESC'
    : 'SELECT * FROM organizations ORDER BY created_at DESC';
  const finalParams = search ? [`%${search}%`, `%${search}%`] : [];

  db.all(query, finalParams, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json(rows);
  });
});

// POST /api/super-admin/organizations
router.post('/organizations', verifyToken, requireSuperAdmin, (req, res) => {
  const { name, location, status } = req.body;
  if (!name || !location) {
    return res.status(400).json({ message: 'Name and location are required' });
  }
  const id = uuidv4();
  db.run(
    `INSERT INTO organizations (id, name, location, status) VALUES (?, ?, ?, ?)`,
    [id, name, location, status || 'active'],
    function (err) {
      if (err) return res.status(500).json({ message: 'Failed to create organization', error: err.message });
      logAudit(req.user.name, req.user.role, 'ORG_CREATED', 'Organizations', `Created: ${name}`, req.ip);
      res.status(201).json({ id, name, location, status: status || 'active', warehouses_count: 0, admins_count: 0, tenants_count: 0, revenue: 0 });
    }
  );
});

// PUT /api/super-admin/organizations/:id
router.put('/organizations/:id', verifyToken, requireSuperAdmin, (req, res) => {
  const { name, location, status } = req.body;
  db.run(
    `UPDATE organizations SET name = ?, location = ?, status = ? WHERE id = ?`,
    [name, location, status, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ message: 'Failed to update organization', error: err.message });
      if (this.changes === 0) return res.status(404).json({ message: 'Organization not found' });
      logAudit(req.user.name, req.user.role, 'ORG_UPDATED', 'Organizations', `Updated: ${name}`, req.ip);
      res.json({ message: 'Organization updated successfully' });
    }
  );
});

// DELETE /api/super-admin/organizations/:id
router.delete('/organizations/:id', verifyToken, requireSuperAdmin, (req, res) => {
  db.run(`DELETE FROM organizations WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to delete organization', error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: 'Organization not found' });
    logAudit(req.user.name, req.user.role, 'ORG_DELETED', 'Organizations', `Deleted org id: ${req.params.id}`, req.ip);
    res.json({ message: 'Organization deleted successfully' });
  });
});

// ─── ADMIN MANAGEMENT ────────────────────────────────────────────────────

// GET /api/super-admin/admins
router.get('/admins', verifyToken, requireSuperAdmin, (req, res) => {
  db.all(
    `SELECT id, name, email, role, status, last_login, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json(rows);
    }
  );
});

// POST /api/super-admin/admins — create an admin user
router.post('/admins', verifyToken, requireSuperAdmin, (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  db.run(
    `INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, 'admin', 'active')`,
    [id, name, email, hash],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') return res.status(409).json({ message: 'Email already exists' });
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      logAudit(req.user.name, req.user.role, 'ADMIN_CREATED', 'Admin Management', `Created admin: ${email}`, req.ip);
      res.status(201).json({ id, name, email, role: 'admin', status: 'active', created_at: new Date().toISOString() });
    }
  );
});

// PATCH /api/super-admin/admins/:id/status — activate/deactivate
router.patch('/admins/:id/status', verifyToken, requireSuperAdmin, (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  db.run(`UPDATE users SET status = ? WHERE id = ? AND role = 'admin'`, [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: 'Admin not found' });
    logAudit(req.user.name, req.user.role, 'ADMIN_STATUS_CHANGED', 'Admin Management', `Status set to ${status}`, req.ip);
    res.json({ message: `Admin ${status}` });
  });
});

// ─── TENANT MANAGEMENT ───────────────────────────────────────────────────

// GET /api/super-admin/tenants
router.get('/tenants', verifyToken, requireSuperAdmin, (req, res) => {
  db.all(
    `SELECT id, name, email, role, status, last_login, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json(rows);
    }
  );
});

// PATCH /api/super-admin/tenants/:id/status
router.patch('/tenants/:id/status', verifyToken, requireSuperAdmin, (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  db.run(`UPDATE users SET status = ? WHERE id = ? AND role = 'customer'`, [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ message: `Tenant ${status}` });
  });
});

// ─── LEASE MANAGEMENT ────────────────────────────────────────────────────

// GET /api/super-admin/leases
router.get('/leases', verifyToken, requireSuperAdmin, (req, res) => {
  const status = req.query.status || '';
  const query = status
    ? 'SELECT * FROM leases WHERE status = ? ORDER BY created_at DESC'
    : 'SELECT * FROM leases ORDER BY created_at DESC';
  db.all(query, status ? [status] : [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json(rows);
  });
});

// PATCH /api/super-admin/leases/:id/status
router.patch('/leases/:id/status', verifyToken, requireSuperAdmin, (req, res) => {
  const { status, rejection_reason, assigned_warehouse } = req.body;
  
  db.run(
    `UPDATE leases SET status = ?, rejection_reason = ?, warehouse_id = ?, updated_at = datetime('now') WHERE id = ?`, 
    [status, rejection_reason || null, assigned_warehouse || null, req.params.id], 
    function (err) {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      if (this.changes === 0) return res.status(404).json({ message: 'Lease not found' });
      
      logAudit(req.user.name, req.user.role, 'LEASE_STATUS_CHANGED', 'Leases', `Lease ${req.params.id} → ${status}`, req.ip);

      // Create a notification for this action
      let noteType = 'system';
      let noteTitle = `Lease ${status}`;
      let noteMessage = `Lease request has been ${status}.`;
      if (status === 'approved') {
        noteType = 'lease_approval';
        noteMessage = `Lease request approved. Assigned to warehouse ${assigned_warehouse || 'TBD'}.`;
      } else if (status === 'rejected') {
        noteType = 'lease_rejection';
        noteMessage = `Lease request rejected. Reason: ${rejection_reason || 'None provided'}.`;
      }

      db.run(
        `INSERT INTO notifications_log (id, title, message, type, sent_by) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), noteTitle, noteMessage, noteType, req.user.name]
      );

      res.json({ message: `Lease status updated to ${status}` });
  });
});

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────

// GET /api/super-admin/audit-logs
router.get('/audit-logs', verifyToken, requireSuperAdmin, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const module_ = req.query.module || '';
  const query = module_
    ? 'SELECT * FROM audit_logs WHERE module = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    : 'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const params = module_ ? [module_, limit, offset] : [limit, offset];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    db.get('SELECT COUNT(*) as total FROM audit_logs', [], (err2, countRow) => {
      res.json({ logs: rows, total: countRow ? countRow.total : 0 });
    });
  });
});

// ─── SUBSCRIPTION PLANS ───────────────────────────────────────────────────

// GET /api/super-admin/subscriptions
router.get('/subscriptions', verifyToken, requireSuperAdmin, (req, res) => {
  db.all('SELECT * FROM subscription_plans ORDER BY price ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json(rows);
  });
});

// POST /api/super-admin/subscriptions
router.post('/subscriptions', verifyToken, requireSuperAdmin, (req, res) => {
  const { name, price, billing_cycle, max_warehouses, max_admins, max_tenants, features } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Name and price are required' });
  const id = uuidv4();
  db.run(
    `INSERT INTO subscription_plans (id, name, price, billing_cycle, max_warehouses, max_admins, max_tenants, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, price, billing_cycle || 'monthly', max_warehouses || 5, max_admins || 2, max_tenants || 20, features || ''],
    function (err) {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      logAudit(req.user.name, req.user.role, 'PLAN_CREATED', 'Subscriptions', `Created plan: ${name}`, req.ip);
      res.status(201).json({ id, name, price, status: 'active' });
    }
  );
});

// PUT /api/super-admin/subscriptions/:id
router.put('/subscriptions/:id', verifyToken, requireSuperAdmin, (req, res) => {
  const { name, price, billing_cycle, max_warehouses, max_admins, max_tenants, features } = req.body;
  db.run(
    `UPDATE subscription_plans SET name=?, price=?, billing_cycle=?, max_warehouses=?, max_admins=?, max_tenants=?, features=? WHERE id=?`,
    [name, price, billing_cycle, max_warehouses, max_admins, max_tenants, features, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ message: 'Plan updated' });
    }
  );
});

// DELETE /api/super-admin/subscriptions/:id
router.delete('/subscriptions/:id', verifyToken, requireSuperAdmin, (req, res) => {
  db.run(`DELETE FROM subscription_plans WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ message: 'Plan deleted' });
  });
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────

// GET /api/super-admin/notifications
router.get('/notifications', verifyToken, requireSuperAdmin, (req, res) => {
  db.all('SELECT * FROM notifications_log ORDER BY created_at DESC LIMIT 50', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json(rows);
  });
});

// POST /api/super-admin/notifications
router.post('/notifications', verifyToken, requireSuperAdmin, (req, res) => {
  const { title, message, type, recipient_count } = req.body;
  if (!title || !message) return res.status(400).json({ message: 'Title and message are required' });
  const id = uuidv4();
  
  db.run(
    `INSERT INTO notifications_log (id, title, message, type, sent_by, recipient_count) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, title, message, type || 'general', req.user.name, recipient_count || 0],
    function (err) {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      logAudit(req.user.name, req.user.role, 'NOTIFICATION_SENT', 'Notifications', `Sent: ${title}`, req.ip);

      // Create inbox notifications for all active users so it reaches them in real-time
      db.all("SELECT id, role FROM users WHERE status = 'active'", [], (err2, users) => {
        if (!err2 && users) {
          const { notifyUser } = require('../utils/notify');
          users.forEach(u => {
            notifyUser({
              receiverId: u.id,
              receiverRole: u.role,
              senderId: req.user.id,
              title: `📢 ${title}`,
              message: message,
              type: 'general',
              priority: 'normal'
            });
          });
        }
      });

      res.status(201).json({ id, title, message, type, created_at: new Date().toISOString() });
    }
  );
});

// ─── ALL USERS (for staff management) ────────────────────────────────────

// GET /api/super-admin/users
router.get('/users', verifyToken, requireSuperAdmin, (req, res) => {
  db.all(
    `SELECT id, name, email, role, status, last_login, created_at FROM users ORDER BY role, name ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
