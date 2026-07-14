// routes/stock.js
// CRUD operations and custom endpoints for stock items.

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/products/'));
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG and WEBP are allowed.'));
    }
  }
});
// Helper to determine status based on quantity
const calculateStatus = (quantity) => {
  if (quantity === 0) return 'out_of_stock';
  if (quantity > 0 && quantity <= 10) return 'low_stock';
  return 'available';
};

// GET /api/stock (Protected, both roles)
// Supports pagination, search, category, and status filters.
router.get('/', verifyToken, (req, res) => {
  const search = req.query.search || '';
  const category = req.query.category || '';
  const status = req.query.status || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM stock_items WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as count FROM stock_items WHERE 1=1';
  const params = [];

  if (search) {
    const searchFilter = ' AND (name LIKE ? OR sku LIKE ? OR category LIKE ?)';
    query += searchFilter;
    countQuery += searchFilter;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (category) {
    const categoryFilter = ' AND category = ?';
    query += categoryFilter;
    countQuery += categoryFilter;
    params.push(category);
  }

  if (status) {
    const statusFilter = ' AND status = ?';
    query += statusFilter;
    countQuery += statusFilter;
    params.push(status);
  }

  // Get total count
  db.get(countQuery, params, (err, row) => {
    if (err) {
      console.error('Count query error:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }

    const total = row ? row.count : 0;
    const totalPages = Math.ceil(total / limit);

    // Get paginated items
    const paginatedParams = [...params, limit, offset];
    const paginatedQuery = query + ' ORDER BY name ASC LIMIT ? OFFSET ?';

    db.all(paginatedQuery, paginatedParams, (err, items) => {
      if (err) {
        console.error('Items query error:', err.message);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        items,
        total,
        page,
        totalPages
      });
    });
  });
});

// GET /api/stock/:id (Protected, both roles)
// Returns single item details + last 10 transactions.
router.get('/:id', verifyToken, (req, res) => {
  const itemId = req.params.id;

  db.get('SELECT * FROM stock_items WHERE id = ?', [itemId], (err, item) => {
    if (err) {
      console.error('Fetch item error:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }
    if (!item) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    // Get last 10 transactions for this item
    db.all(
      'SELECT * FROM stock_transactions WHERE item_id = ? ORDER BY created_at DESC LIMIT 10',
      [itemId],
      (err, transactions) => {
        if (err) {
          console.error('Fetch transactions error:', err.message);
          return res.status(500).json({ message: 'Database error' });
        }

        // Return combined object to support both formats: flat (with transactions property) and nested.
        res.json({
          ...item,
          item,
          transactions
        });
      }
    );
  });
});

// POST /api/stock (Protected, Admin only)
// Create a new stock item and log transaction.
router.post('/', verifyToken, requireAdmin, upload.single('productImage'), (req, res) => {
  const { name, category, description, sku, quantity, unit, price } = req.body;

  if (!name || !category || quantity === undefined || price === undefined) {
    return res.status(400).json({ message: 'name, category, quantity, and price are required' });
  }

  const finalQuantity = parseInt(quantity) || 0;
  const finalPrice = parseFloat(price) || 0;
  const finalUnit = unit || 'pcs';
  const status = calculateStatus(finalQuantity);
  const itemId = uuidv4();

  let imageUrl = null;
  if (req.file) {
    imageUrl = `/uploads/products/${req.file.filename}`;
  }

  // Handle SKU auto-generation if not provided
  let finalSku = sku;
  if (!finalSku) {
    finalSku = `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // Insert stock item with admin_id ownership
  db.run(
    `INSERT INTO stock_items (id, name, category, description, sku, quantity, unit, price, status, image_url, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [itemId, name, category, description || '', finalSku, finalQuantity, finalUnit, finalPrice, status, imageUrl, req.user.id],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ message: 'SKU already exists' });
        }
        console.error('Insert stock item error:', err.message);
        return res.status(500).json({ message: 'Database error' });
      }

      // Log transaction (action: 'created')
      const transId = uuidv4();
      db.run(
        `INSERT INTO stock_transactions (id, item_id, item_name, action, changed_by_id, changed_by_name, old_quantity, new_quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transId, itemId, name, 'created', req.user.id, req.user.name, 0, finalQuantity, 'Initial creation'],
        (transErr) => {
          if (transErr) console.error('Failed to log creation transaction:', transErr.message);
        }
      );

      // Return the created item
      db.get('SELECT * FROM stock_items WHERE id = ?', [itemId], (fetchErr, item) => {
        if (fetchErr) return res.status(500).json({ message: 'Database error' });
        res.status(201).json(item);
      });
    }
  );
});

// PUT /api/stock/:id (Protected, Admin only)
// Update stock item fields and log transaction.
router.put('/:id', verifyToken, requireAdmin, upload.single('productImage'), (req, res) => {
  const itemId = req.params.id;
  const { name, category, description, sku, quantity, unit, price, removeImage } = req.body;

  // Retrieve current stock item details first
  db.get('SELECT * FROM stock_items WHERE id = ?', [itemId], (err, currentItem) => {
    if (err) {
      console.error('Fetch current item error:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }
    if (!currentItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    const finalName = name !== undefined ? name : currentItem.name;
    const finalCategory = category !== undefined ? category : currentItem.category;
    const finalDescription = description !== undefined ? description : currentItem.description;
    const finalSku = sku !== undefined ? sku : currentItem.sku;
    const finalQuantity = quantity !== undefined ? parseInt(quantity) : currentItem.quantity;
    const finalUnit = unit !== undefined ? unit : currentItem.unit;
    const finalPrice = price !== undefined ? parseFloat(price) : currentItem.price;
    const finalStatus = calculateStatus(finalQuantity);

    let imageUrl = currentItem.image_url;
    if (req.file) {
      imageUrl = `/uploads/products/${req.file.filename}`;
      // delete old image
      if (currentItem.image_url && currentItem.image_url.startsWith('/uploads/products/')) {
        const oldPath = path.join(__dirname, '..', currentItem.image_url);
        fs.unlink(oldPath, err => { if(err) console.error('Failed to delete old image:', err); });
      }
    } else if (removeImage === 'true' || removeImage === true) {
      imageUrl = null;
      if (currentItem.image_url && currentItem.image_url.startsWith('/uploads/products/')) {
        const oldPath = path.join(__dirname, '..', currentItem.image_url);
        fs.unlink(oldPath, err => { if(err) console.error('Failed to delete old image:', err); });
      }
    }

    // Update item
    db.run(
      `UPDATE stock_items SET name = ?, category = ?, description = ?, sku = ?, quantity = ?, unit = ?, price = ?, status = ?, image_url = ?, updated_at = datetime('now') WHERE id = ?`,
      [finalName, finalCategory, finalDescription, finalSku, finalQuantity, finalUnit, finalPrice, finalStatus, imageUrl, itemId],
      function (updateErr) {
        if (updateErr) {
          if (updateErr.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ message: 'SKU already exists' });
          }
          console.error('Update item error:', updateErr.message);
          return res.status(500).json({ message: 'Database error' });
        }

        // Log transaction if quantity or price changed
        const qtyChanged = currentItem.quantity !== finalQuantity;
        if (qtyChanged) {
          const transId = uuidv4();
          db.run(
            `INSERT INTO stock_transactions (id, item_id, item_name, action, changed_by_id, changed_by_name, old_quantity, new_quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [transId, itemId, finalName, 'updated', req.user.id, req.user.name, currentItem.quantity, finalQuantity, 'Details updated'],
            (transErr) => {
              if (transErr) console.error('Failed to log update transaction:', transErr.message);
            }
          );
        }

        // Return updated item
        db.get('SELECT * FROM stock_items WHERE id = ?', [itemId], (fetchErr, item) => {
          if (fetchErr) return res.status(500).json({ message: 'Database error' });
          res.json(item);
        });
      }
    );
  });
});

// POST /api/stock/:id/purchase (Protected, Customer)
// Purchase stock item, decrease quantity, and log transaction + notifications.
router.post('/:id/purchase', verifyToken, (req, res) => {
  const itemId = req.params.id;
  const { quantity } = req.body;

  if (quantity === undefined || parseInt(quantity) <= 0) {
    return res.status(400).json({ message: 'Purchase quantity must be positive' });
  }

  const purchaseQty = parseInt(quantity);

  db.get('SELECT * FROM stock_items WHERE id = ?', [itemId], (err, item) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!item) return res.status(404).json({ message: 'Stock item not found' });
    
    if (item.quantity < purchaseQty) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const newQuantity = item.quantity - purchaseQty;
    const newStatus = calculateStatus(newQuantity);

    // Update quantity
    db.run(
      'UPDATE stock_items SET quantity = ?, status = ?, updated_at = datetime(\'now\') WHERE id = ?',
      [newQuantity, newStatus, itemId],
      function (updateErr) {
        if (updateErr) return res.status(500).json({ message: 'Database error' });

        // Log transaction (action: 'updated' or 'purchased')
        const transId = uuidv4();
        db.run(
          `INSERT INTO stock_transactions (id, item_id, item_name, action, changed_by_id, changed_by_name, old_quantity, new_quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [transId, itemId, item.name, 'updated', req.user.id, req.user.name, item.quantity, newQuantity, 'Customer purchase']
        );

        // Purchase Notification
        db.run(
          `INSERT INTO notifications_log (id, title, message, type, sent_by) VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), 'New Purchase', `${req.user.name} purchased ${purchaseQty} ${item.unit} of ${item.name}.`, 'purchase', 'System']
        );

        // Low Stock Alert Automation (Threshold = 10)
        if (newQuantity <= 10 && item.quantity > 10) {
          db.run(
            `INSERT INTO notifications_log (id, title, message, type, sent_by) VALUES (?, ?, ?, ?, ?)`,
            [uuidv4(), 'Low Stock Alert', `${item.name} stock is below minimum threshold. Only ${newQuantity} left. Refill required.`, 'low_stock', 'System']
          );
        }

        db.get('SELECT * FROM stock_items WHERE id = ?', [itemId], (fetchErr, updatedItem) => {
          if (fetchErr) return res.status(500).json({ message: 'Database error' });
          res.json(updatedItem);
        });
      }
    );
  });
});

// DELETE /api/stock/:id (Protected, Admin only)
// Delete stock item and log transaction.
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  const itemId = req.params.id;

  db.get('SELECT * FROM stock_items WHERE id = ?', [itemId], (err, item) => {
    if (err) {
      console.error('Fetch item for delete error:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }
    if (!item) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    // Delete item
    db.run('DELETE FROM stock_items WHERE id = ?', [itemId], (deleteErr) => {
      if (deleteErr) {
        console.error('Delete item error:', deleteErr.message);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (item.image_url && item.image_url.startsWith('/uploads/products/')) {
        const oldPath = path.join(__dirname, '..', item.image_url);
        fs.unlink(oldPath, err => { if(err) console.error('Failed to delete image on delete:', err); });
      }

      // Log transaction (action: 'deleted')
      const transId = uuidv4();
      db.run(
        `INSERT INTO stock_transactions (id, item_id, item_name, action, changed_by_id, changed_by_name, old_quantity, new_quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transId, itemId, item.name, 'deleted', req.user.id, req.user.name, item.quantity, 0, 'Item deleted'],
        (transErr) => {
          if (transErr) console.error('Failed to log delete transaction:', transErr.message);
        }
      );

      res.json({ success: true });
    });
  });
});

// PATCH /api/stock/:id/restock (Protected, Admin only)
// Restock item, update quantity, status and log transaction.
router.patch('/:id/restock', verifyToken, requireAdmin, (req, res) => {
  const itemId = req.params.id;
  const { quantity, notes } = req.body;

  if (quantity === undefined || parseInt(quantity) <= 0) {
    return res.status(400).json({ message: 'Restock quantity must be positive' });
  }

  const restockQty = parseInt(quantity);

  db.get('SELECT * FROM stock_items WHERE id = ?', [itemId], (err, item) => {
    if (err) {
      console.error('Fetch item for restock error:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }
    if (!item) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    const newQuantity = item.quantity + restockQty;
    const newStatus = calculateStatus(newQuantity);

    // Update quantity
    db.run(
      'UPDATE stock_items SET quantity = ?, status = ?, updated_at = datetime(\'now\') WHERE id = ?',
      [newQuantity, newStatus, itemId],
      function (updateErr) {
        if (updateErr) {
          console.error('Restock update error:', updateErr.message);
          return res.status(500).json({ message: 'Database error' });
        }

        // Log transaction (action: 'restocked')
        const transId = uuidv4();
        db.run(
          `INSERT INTO stock_transactions (id, item_id, item_name, action, changed_by_id, changed_by_name, old_quantity, new_quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [transId, itemId, item.name, 'restocked', req.user.id, req.user.name, item.quantity, newQuantity, notes || 'Manual restock'],
          (transErr) => {
            if (transErr) console.error('Failed to log restock transaction:', transErr.message);
          }
        );

        // Return updated item
        db.get('SELECT * FROM stock_items WHERE id = ?', [itemId], (fetchErr, updatedItem) => {
          if (fetchErr) return res.status(500).json({ message: 'Database error' });
          res.json(updatedItem);
        });
      }
    );
  });
});

module.exports = router;
