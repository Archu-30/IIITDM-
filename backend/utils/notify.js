// backend/utils/notify.js
// Centralized, role-scoped notification utility.
// Replaces all scattered notifyAdminsAndSellers() helpers.
// ALL notifications go to exactly the right recipient — no broadcast.

const { v4: uuidv4 } = require('uuid');
const db = require('../../database/connection');

let _io = null;

/** Call once from server.js after Socket.IO is initialized */
function setIO(io) {
  _io = io;
}

/**
 * Emit a real-time event to a specific user's Socket.IO room.
 * Falls back silently if socket not connected.
 */
function emitToUser(userId, notification) {
  if (_io) {
    _io.to(`user:${userId}`).emit('new_notification', notification);
  }
}

/**
 * Core: Insert one notification row and emit real-time event.
 * @param {object} opts
 *   receiverId     - User ID of the recipient
 *   receiverRole   - Role string of the recipient
 *   senderId       - User ID of the actor (null for system)
 *   title          - Short notification title
 *   message        - Full notification message
 *   type           - Category: 'order'|'lease'|'inquiry'|'callback'|'system'
 *   referenceType  - Entity type: 'order'|'lease_request'|'inquiry'|'callback'
 *   referenceId    - ID of the related entity
 *   priority       - 'low'|'normal'|'high' (default 'normal')
 */
function notifyUser({
  receiverId,
  receiverRole,
  senderId = null,
  title,
  message,
  type = 'system',
  referenceType = null,
  referenceId = null,
  priority = 'normal',
}) {
  if (!receiverId || !title || !message) return;

  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO notifications
       (id, user_id, receiver_id, receiver_role, sender_id, title, message, type,
        reference_type, reference_id, priority, is_read, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [id, receiverId, receiverId, receiverRole, senderId, title, message, type,
     referenceType, referenceId, priority, now, now],
    (err) => {
      if (err) {
        console.error('[notify] DB insert error:', err.message);
        return;
      }
      // Real-time push
      emitToUser(receiverId, {
        id, receiver_id: receiverId, receiver_role: receiverRole,
        sender_id: senderId, title, message, type,
        reference_type: referenceType, reference_id: referenceId,
        priority, is_read: 0, created_at: now,
      });
    }
  );
}

/**
 * Notify ALL active Super Admins only.
 * Used for: Lease Requests, Inquiries, Callbacks.
 */
function notifySuperAdmins({ senderId, title, message, type, referenceType, referenceId, priority = 'high' }) {
  db.all(
    `SELECT id FROM users WHERE role = 'super_admin' AND status = 'active'`,
    [],
    (err, rows) => {
      if (err || !rows) return;
      rows.forEach(row => {
        notifyUser({
          receiverId: row.id,
          receiverRole: 'super_admin',
          senderId,
          title,
          message,
          type,
          referenceType,
          referenceId,
          priority,
        });
      });
    }
  );
}

/**
 * Notify the SINGLE admin who owns a product (via products.admin_id).
 * Used for: Buy Now / product orders.
 * Falls back to all admins if admin_id is NULL (legacy products).
 */
function notifyProductAdmin({ productId, senderId, title, message, referenceType, referenceId }) {
  db.get(
    `SELECT admin_id FROM products WHERE id = ?`,
    [productId],
    (err, row) => {
      if (err) return;

      if (row && row.admin_id) {
        // Notify the specific admin who owns this product
        db.get(`SELECT id, role FROM users WHERE id = ? AND status = 'active'`, [row.admin_id], (err2, admin) => {
          if (err2 || !admin) return;
          notifyUser({
            receiverId: admin.id,
            receiverRole: admin.role,
            senderId,
            title,
            message,
            type: 'order',
            referenceType,
            referenceId,
            priority: 'high',
          });
        });
      } else {
        // Fallback: no admin_id set — notify all admins (legacy)
        db.all(
          `SELECT id, role FROM users WHERE role = 'admin' AND status = 'active'`,
          [],
          (err2, admins) => {
            if (err2 || !admins) return;
            admins.forEach(admin => {
              notifyUser({
                receiverId: admin.id,
                receiverRole: admin.role,
                senderId,
                title,
                message,
                type: 'order',
                referenceType,
                referenceId,
                priority: 'high',
              });
            });
          }
        );
      }
    }
  );
}

module.exports = { setIO, notifyUser, notifySuperAdmins, notifyProductAdmin };


