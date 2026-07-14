// routes/transactions.js
// Transaction log endpoint for administrative tracking.

const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/transactions (Protected, Admin only)
// Supports pagination and filters by item_id, action, and date range (from/to).
router.get('/', verifyToken, requireAdmin, (req, res) => {
  const itemId = req.query.item_id || '';
  const action = req.query.action || '';
  const from = req.query.from || '';
  const to = req.query.to || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM stock_transactions WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as count FROM stock_transactions WHERE 1=1';
  const params = [];

  if (itemId) {
    query += ' AND item_id = ?';
    countQuery += ' AND item_id = ?';
    params.push(itemId);
  }

  if (action) {
    query += ' AND action = ?';
    countQuery += ' AND action = ?';
    params.push(action);
  }

  if (from) {
    query += ' AND created_at >= ?';
    countQuery += ' AND created_at >= ?';
    params.push(from);
  }

  if (to) {
    query += ' AND created_at <= ?';
    countQuery += ' AND created_at <= ?';
    params.push(to);
  }

  // Get total count
  db.get(countQuery, params, (err, row) => {
    if (err) {
      console.error('Transactions count error:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }

    const total = row ? row.count : 0;
    const totalPages = Math.ceil(total / limit);

    // Get paginated transactions ordered by date descending
    const paginatedParams = [...params, limit, offset];
    const paginatedQuery = query + ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    db.all(paginatedQuery, paginatedParams, (err, transactions) => {
      if (err) {
        console.error('Transactions list error:', err.message);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        transactions,
        total,
        page,
        totalPages
      });
    });
  });
});

module.exports = router;
