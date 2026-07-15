// routes/orders.js
// Full order lifecycle: create, view, and status updates.
// Notifications are role-scoped: order placed → only product's admin_id admin.
// Order status change → only the customer who placed the order.

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../database/connection');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { notifyProductAdmin, notifyUser } = require('../utils/notify');

// Helper to generate order number: ORD-YYYY-XXXX
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${year}-${rand}`;
};

// Helper to ensure uniqueness of order number
const getUniqueOrderNumber = (cb) => {
  const num = generateOrderNumber();
  db.get('SELECT id FROM orders WHERE order_number = ?', [num], (err, row) => {
    if (err || row) return getUniqueOrderNumber(cb); // retry on collision
    cb(num);
  });
};

// POST /api/orders
// Customer places a "Buy Now" order
// Rule 1 & 7: Notification goes ONLY to the admin who owns the product (product.admin_id)
router.post('/', verifyToken, (req, res) => {
  const {
    item_id,
    quantity,
    delivery_name,
    delivery_phone,
    delivery_address,
    delivery_city,
    delivery_pincode,
    notes
  } = req.body;

  if (!item_id || !quantity || !delivery_name || !delivery_phone || !delivery_address || !delivery_city || !delivery_pincode) {
    return res.status(400).json({ message: 'All delivery fields and item details are required.' });
  }

  const purchaseQty = parseInt(quantity);
  if (purchaseQty <= 0) {
    return res.status(400).json({ message: 'Quantity must be at least 1.' });
  }

  // Fetch product including admin_id for ownership-based notification
  db.get('SELECT * FROM products WHERE id = ?', [item_id], (err, item) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (!item) return res.status(404).json({ message: 'Product not found.' });
    if (item.quantity < purchaseQty) {
      return res.status(400).json({ message: `Only ${item.quantity} ${item.unit} available in stock.` });
    }

    const unitPrice = parseFloat(item.price);
    const subtotal = unitPrice * purchaseQty;

    getUniqueOrderNumber((orderNumber) => {
      const orderId = uuidv4();

      // Insert order
      db.run(
        `INSERT INTO orders (id, order_number, customer_id, customer_name, customer_email, total_amount, status, delivery_name, delivery_phone, delivery_address, delivery_city, delivery_pincode, notes)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
        [orderId, orderNumber, req.user.id, req.user.name, req.user.email || '', subtotal,
         delivery_name, delivery_phone, delivery_address, delivery_city, delivery_pincode, notes || ''],
        function (err) {
          if (err) return res.status(500).json({ message: 'Failed to create order.', error: err.message });

          // Insert order item
          const orderItemId = uuidv4();
          db.run(
            `INSERT INTO order_items (id, order_id, item_id, item_name, item_sku, unit_price, quantity, subtotal, unit)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [orderItemId, orderId, item.id, item.name, item.sku, unitPrice, purchaseQty, subtotal, item.unit]
          );

          // Decrement stock
          const newQty = item.quantity - purchaseQty;
          const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= 10 ? 'low_stock' : 'available';
          db.run(
            `UPDATE products SET quantity = ?, status = ?, updated_at = datetime('now') WHERE id = ?`,
            [newQty, newStatus, item.id]
          );

          // Log stock transaction
          db.run(
            `INSERT INTO stock_transactions (id, item_id, item_name, action, changed_by_id, changed_by_name, old_quantity, new_quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), item.id, item.name, 'updated', req.user.id, req.user.name, item.quantity, newQty, `Order ${orderNumber}`]
          );

          // Record in tracking table
          db.run(
            `INSERT INTO tracking (id, order_id, status, description) VALUES (?, ?, 'pending', 'Order placed successfully.')`,
            [uuidv4(), orderId]
          );

          // ─── RULE 1 & 7: Notify ONLY the product's owning admin ───────────
          notifyProductAdmin({
            productId: item.id,
            senderId: req.user.id,
            title: '📦 New Product Order',
            message: `${req.user.name} placed order ${orderNumber} for ${purchaseQty} × ${item.name}. Total: ₹${subtotal.toLocaleString('en-IN')}. Delivery to: ${delivery_city} — ${delivery_pincode}. Est. delivery: 10–15 Days.`,
            referenceType: 'order',
            referenceId: orderId,
          });

          res.status(201).json({
            success: true,
            order_number: orderNumber,
            order_id: orderId,
            total: subtotal,
            estimated_delivery: '10-15 Days'
          });
        }
      );
    });
  });
});

// GET /api/orders/my-orders — Customer's own orders
router.get('/my-orders', verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC`,
    [req.user.id],
    (err, orders) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      if (!orders || orders.length === 0) return res.json([]);

      let remaining = orders.length;
      const result = [];

      orders.forEach(order => {
        db.all(
          `SELECT * FROM order_items WHERE order_id = ?`,
          [order.id],
          (err2, items) => {
            db.all(
              `SELECT * FROM tracking WHERE order_id = ? ORDER BY created_at ASC`,
              [order.id],
              (err3, trackItems) => {
                result.push({ ...order, items: items || [], tracking: trackItems || [] });
                remaining--;
                if (remaining === 0) {
                  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                  res.json(result);
                }
              }
            );
          }
        );
      });
    }
  );
});

// GET /api/orders — Admin & Seller view of all orders
router.get('/', verifyToken, requireAdmin, (req, res) => {
  // Sellers see all orders; filtered by their product ownership on the client if needed
  db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, orders) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (!orders || orders.length === 0) return res.json([]);

    let remaining = orders.length;
    const result = [];

    orders.forEach(order => {
      db.all(`SELECT * FROM order_items WHERE order_id = ?`, [order.id], (err2, items) => {
        db.all(`SELECT * FROM tracking WHERE order_id = ? ORDER BY created_at ASC`, [order.id], (err3, trackItems) => {
          result.push({ ...order, items: items || [], tracking: trackItems || [] });
          remaining--;
          if (remaining === 0) {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            res.json(result);
          }
        });
      });
    });
  });
});

// PATCH /api/orders/:id/status — Admin & Seller update order status
// Rule 5: Customer is notified on each milestone change
router.patch('/:id/status', verifyToken, requireAdmin, (req, res) => {
  const { status, description } = req.body;
  const validStatuses = ['pending', 'approved', 'packing', 'dispatched', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, order) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    db.run(
      `UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [status, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ message: 'Database error' });

        // Add milestone to tracking
        db.run(
          `INSERT INTO tracking (id, order_id, status, description) VALUES (?, ?, ?, ?)`,
          [uuidv4(), order.id, status, description || `Order marked as ${status}`]
        );

        // ─── RULE 5: Notify ONLY the customer ────────────────────────────────
        const statusTitles = {
          approved: '✅ Order Approved',
          packing: '📦 Order Being Packed',
          dispatched: '🚚 Order Dispatched',
          delivered: '🎉 Order Delivered',
          cancelled: '❌ Order Cancelled',
        };

        const statusMessages = {
          approved: `Your order ${order.order_number} has been approved and is being prepared.`,
          packing: `Your order ${order.order_number} is currently being packed at the warehouse.`,
          dispatched: `Your order ${order.order_number} has been dispatched. Estimated delivery: 10–15 Days.`,
          delivered: `Your order ${order.order_number} has been successfully delivered. Thank you!`,
          cancelled: `Your order ${order.order_number} has been cancelled. Please contact support if this is unexpected.`,
        };

        if (statusTitles[status]) {
          notifyUser({
            receiverId: order.customer_id,
            receiverRole: 'customer',
            senderId: req.user.id,
            title: statusTitles[status],
            message: statusMessages[status],
            type: 'order',
            referenceType: 'order',
            referenceId: order.id,
            priority: status === 'cancelled' ? 'high' : 'normal',
          });
        }

        res.json({ success: true, message: `Order updated to ${status}` });
      }
    );
  });
});

module.exports = router;

