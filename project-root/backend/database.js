// database.js
// SQLite database connection and schema setup for Universal Inventory Management System.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.resolve(__dirname, 'inventory.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Helper for status logic
const calculateStatus = (quantity) => {
  if (quantity === 0) return 'out_of_stock';
  if (quantity > 0 && quantity <= 10) return 'low_stock';
  return 'available';
};

db.serialize(() => {
  // 1. Roles table
  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // 2. Permissions table
  db.run(`
    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission TEXT NOT NULL
    )
  `);

  // 3. Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin','customer','super_admin','seller')) DEFAULT 'customer',
      status TEXT CHECK(status IN ('active','inactive')) DEFAULT 'active',
      last_login TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create indexes on users
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);

  // 4. Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      sku TEXT UNIQUE NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'pcs',
      price REAL NOT NULL DEFAULT 0,
      status TEXT CHECK(status IN ('available','low_stock','out_of_stock')) DEFAULT 'available',
      image_url TEXT,
      admin_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Migrate: add admin_id to existing products table if it doesn't exist yet
  db.run(`ALTER TABLE products ADD COLUMN admin_id TEXT REFERENCES users(id) ON DELETE SET NULL`, () => {});

  // Index on product sku
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`);

  // 5. Stock Items View (alias/mirror view for backward compatibility — includes admin_id)
  db.run(`DROP VIEW IF EXISTS stock_items`);
  db.run(`
    CREATE VIEW stock_items AS SELECT 
      id, name, category, description, sku, quantity, unit, price, status, image_url, admin_id, created_at, updated_at
    FROM products
  `);

  // Instead of triggers on stock_items view to forward updates to products
  db.run(`DROP TRIGGER IF EXISTS stock_items_insert`);
  db.run(`
    CREATE TRIGGER stock_items_insert INSTEAD OF INSERT ON stock_items
    BEGIN
      INSERT INTO products (id, name, category, description, sku, quantity, unit, price, status, image_url, admin_id, created_at, updated_at)
      VALUES (new.id, new.name, new.category, new.description, new.sku, new.quantity, new.unit, new.price, new.status, new.image_url, new.admin_id, new.created_at, new.updated_at);
    END;
  `);

  db.run(`DROP TRIGGER IF EXISTS stock_items_update`);
  db.run(`
    CREATE TRIGGER stock_items_update INSTEAD OF UPDATE ON stock_items
    BEGIN
      UPDATE products SET
        name = new.name,
        category = new.category,
        description = new.description,
        sku = new.sku,
        quantity = new.quantity,
        unit = new.unit,
        price = new.price,
        status = new.status,
        image_url = new.image_url,
        admin_id = new.admin_id,
        updated_at = datetime('now')
      WHERE id = old.id;
    END;
  `);

  db.run(`DROP TRIGGER IF EXISTS stock_items_delete`);
  db.run(`
    CREATE TRIGGER stock_items_delete INSTEAD OF DELETE ON stock_items
    BEGIN
      DELETE FROM products WHERE id = old.id;
    END;
  `);

  // 6. Inventory table (records warehouse occupancy/stock location details)
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 0,
      warehouse_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 7. Organizations table
  db.run(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT CHECK(status IN ('active','inactive','suspended')) DEFAULT 'active',
      warehouses_count INTEGER DEFAULT 0,
      admins_count INTEGER DEFAULT 0,
      tenants_count INTEGER DEFAULT 0,
      revenue REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 8. Stock Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS stock_transactions (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      action TEXT CHECK(action IN ('created','updated','deleted','restocked')),
      changed_by_id TEXT NOT NULL,
      changed_by_name TEXT NOT NULL,
      old_quantity INTEGER,
      new_quantity INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 9. Orders table — customer purchase orders
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL REFERENCES users(id),
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      total_amount REAL NOT NULL DEFAULT 0,
      status TEXT CHECK(status IN ('pending','approved','packing','dispatched','delivered','cancelled')) DEFAULT 'pending',
      delivery_name TEXT,
      delivery_phone TEXT,
      delivery_address TEXT,
      delivery_city TEXT,
      delivery_pincode TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Index on customer and status
  db.run(`CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);

  // 10. Order Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL REFERENCES products(id),
      item_name TEXT NOT NULL,
      item_sku TEXT,
      unit_price REAL NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      subtotal REAL NOT NULL DEFAULT 0,
      unit TEXT DEFAULT 'pcs',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 11. Notifications table — full production schema with role-based routing
  // Drop old schema if it exists with wrong columns, then recreate
  db.run(`DROP TABLE IF EXISTS user_notifications`); // Remove legacy duplicate table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_role TEXT NOT NULL DEFAULT 'customer',
      sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('order','lease','inquiry','callback','system','general')) DEFAULT 'general',
      reference_type TEXT,
      reference_id TEXT,
      priority TEXT CHECK(priority IN ('low','normal','high')) DEFAULT 'normal',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Migrate: add new columns to existing notifications table if needed
  db.run(`ALTER TABLE notifications ADD COLUMN receiver_id TEXT`, () => {});
  db.run(`ALTER TABLE notifications ADD COLUMN receiver_role TEXT`, () => {});
  db.run(`ALTER TABLE notifications ADD COLUMN sender_id TEXT`, () => {});
  db.run(`ALTER TABLE notifications ADD COLUMN reference_type TEXT`, () => {});
  db.run(`ALTER TABLE notifications ADD COLUMN reference_id TEXT`, () => {});
  db.run(`ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal'`, () => {});
  db.run(`ALTER TABLE notifications ADD COLUMN updated_at TEXT`, () => {});

  // Indexes for fast per-user notification queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_receiver ON notifications(receiver_id, is_read)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, receiver_role)`);

  // 12. Lease Requests table
  db.run(`
    CREATE TABLE IF NOT EXISTS lease_requests (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES users(id),
      tenant_name TEXT NOT NULL,
      warehouse_id TEXT,
      warehouse_name TEXT NOT NULL,
      organization_id TEXT,
      organization_name TEXT DEFAULT 'Inventra OS HQ',
      start_date TEXT NOT NULL,
      end_date TEXT,
      monthly_rent REAL NOT NULL DEFAULT 0,
      plan TEXT,
      message TEXT,
      rejection_reason TEXT,
      status TEXT CHECK(status IN ('active','expired','terminated','pending','approved','rejected')) DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Legacy leases mapping table
  db.run(`
    CREATE TABLE IF NOT EXISTS leases (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES users(id),
      tenant_name TEXT NOT NULL,
      warehouse_id TEXT,
      warehouse_name TEXT NOT NULL,
      organization_id TEXT,
      organization_name TEXT DEFAULT 'Inventra OS HQ',
      start_date TEXT NOT NULL,
      end_date TEXT,
      monthly_rent REAL NOT NULL DEFAULT 0,
      plan TEXT,
      message TEXT,
      rejection_reason TEXT,
      status TEXT CHECK(status IN ('active','expired','terminated','pending','approved','rejected')) DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 13. Callbacks table
  db.run(`
    CREATE TABLE IF NOT EXISTS callbacks (
      id TEXT PRIMARY KEY,
      customer_id TEXT REFERENCES users(id),
      customer_name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      company_name TEXT,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      preferred_time TEXT,
      message TEXT,
      status TEXT CHECK(status IN ('pending','contacted','closed')) DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 14. Inquiries table
  db.run(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      customer_id TEXT REFERENCES users(id),
      customer_name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      company_name TEXT,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      warehouse_requirement TEXT NOT NULL,
      lease_duration TEXT NOT NULL,
      message TEXT,
      status TEXT CHECK(status IN ('pending','contacted','closed')) DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 15. Tracking table — order shipping milestones
  db.run(`
    CREATE TABLE IF NOT EXISTS tracking (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 16. General notifications log
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications_log (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      sent_by TEXT DEFAULT 'Super Admin',
      recipient_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 17. Audit Logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT NOT NULL,
      user_role TEXT,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT,
      ip_address TEXT DEFAULT '127.0.0.1',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 18. Subscription Plans table
  db.run(`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      price REAL NOT NULL,
      billing_cycle TEXT CHECK(billing_cycle IN ('monthly','yearly')) DEFAULT 'monthly',
      max_warehouses INTEGER DEFAULT 5,
      max_admins INTEGER DEFAULT 2,
      max_tenants INTEGER DEFAULT 20,
      features TEXT,
      status TEXT CHECK(status IN ('active','inactive')) DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Seed default items if users table is empty
  db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
    if (err) {
      console.error("Error checking users count:", err.message);
      return;
    }

    if (row.count === 0) {
      console.log("Database is empty. Seeding roles, permissions, users, products, and initial leases...");

      // Temporarily disable foreign keys for bulk seed safety
      db.run('PRAGMA foreign_keys = OFF', () => {
        // Seed Roles
        const roleIds = {
          super_admin: uuidv4(),
          admin: uuidv4(),
          seller: uuidv4(),
          customer: uuidv4()
        };

        db.run(`INSERT INTO roles (id, name) VALUES (?, 'super_admin')`, [roleIds.super_admin]);
        db.run(`INSERT INTO roles (id, name) VALUES (?, 'admin')`, [roleIds.admin]);
        db.run(`INSERT INTO roles (id, name) VALUES (?, 'seller')`, [roleIds.seller]);
        db.run(`INSERT INTO roles (id, name) VALUES (?, 'customer')`, [roleIds.customer]);

        // Seed Permissions
        const perms = [
          { roleId: roleIds.super_admin, p: 'all' },
          { roleId: roleIds.admin, p: 'manage_inventory' },
          { roleId: roleIds.admin, p: 'manage_leases' },
          { roleId: roleIds.seller, p: 'manage_orders' },
          { roleId: roleIds.seller, p: 'manage_leases' },
          { roleId: roleIds.seller, p: 'manage_inquiries' },
          { roleId: roleIds.seller, p: 'manage_callbacks' },
          { roleId: roleIds.customer, p: 'view_inventory' },
          { roleId: roleIds.customer, p: 'place_order' }
        ];
        perms.forEach(perm => {
          db.run(`INSERT INTO permissions (id, role_id, permission) VALUES (?, ?, ?)`, [uuidv4(), perm.roleId, perm.p], (err) => {
            if (err) console.error('Permission seed error:', err.message);
          });
        });

        // Seed Users
        const superAdminHash = bcrypt.hashSync('superadmin123', 10);
        const adminHash = bcrypt.hashSync('admin123', 10);
        const sellerHash = bcrypt.hashSync('seller123', 10);
        const customerHash = bcrypt.hashSync('customer123', 10);

        db.run(`INSERT INTO users (id, name, email, password, role, status) VALUES (?, 'System Administrator', 'superadmin@inventory.com', ?, 'super_admin', 'active')`, [uuidv4(), superAdminHash]);
        db.run(`INSERT INTO users (id, name, email, password, role, status) VALUES (?, 'Admin User', 'admin@inventory.com', ?, 'admin', 'active')`, [uuidv4(), adminHash]);
        db.run(`INSERT INTO users (id, name, email, password, role, status) VALUES (?, 'Seller Expert', 'seller@inventory.com', ?, 'seller', 'active')`, [uuidv4(), sellerHash]);
        db.run(`INSERT INTO users (id, name, email, password, role, status) VALUES (?, 'Test Customer', 'customer@inventory.com', ?, 'customer', 'active')`, [uuidv4(), customerHash]);

        // Seed Organizations
        const orgs = [
          { name: 'Inventra OS HQ', location: 'Chennai, Tamil Nadu', warehouses: 4, admins: 3, tenants: 18, revenue: 485000 },
          { name: 'Northern Logistics', location: 'Delhi, NCR', warehouses: 6, admins: 5, tenants: 32, revenue: 920000 },
          { name: 'Coastal Warehousing', location: 'Mumbai, Maharashtra', warehouses: 3, admins: 2, tenants: 14, revenue: 340000 }
        ];
        orgs.forEach(org => {
          db.run(
            `INSERT INTO organizations (id, name, location, status, warehouses_count, admins_count, tenants_count, revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), org.name, org.location, 'active', org.warehouses, org.admins, org.tenants, org.revenue]
          );
        });

        // Seed Products & Stock Items — assign admin_id from the seeded admin user
        db.get(`SELECT id FROM users WHERE email = 'admin@inventory.com'`, [], (adminErr, adminRow) => {
          const adminId = adminRow ? adminRow.id : null;

          const stockItems = [
            { name: 'Steel Storage Rack', category: 'Furniture', sku: 'SKU-001', qty: 45, unit: 'pcs', price: 2500, image_url: '/demo-stock/wooden-pallet.png' },
            { name: 'Bubble Wrap Roll', category: 'Packaging', sku: 'SKU-002', qty: 8, unit: 'rolls', price: 350, image_url: '/demo-stock/packing-tape.png' },
            { name: 'Forklift Battery', category: 'Equipment', sku: 'SKU-003', qty: 0, unit: 'pcs', price: 15000, image_url: '/demo-stock/forklift-battery.png' },
            { name: 'Packing Tape', category: 'Packaging', sku: 'SKU-004', qty: 120, unit: 'pcs', price: 45, image_url: '/demo-stock/packing-tape.png' },
            { name: 'Safety Helmet', category: 'Safety', sku: 'SKU-005', qty: 6, unit: 'pcs', price: 800, image_url: '/demo-stock/safety-helmet.png' },
            { name: 'Wooden Pallet', category: 'Logistics', sku: 'SKU-006', qty: 200, unit: 'pcs', price: 650, image_url: '/demo-stock/wooden-pallet.png' },
            { name: 'Hand Truck Trolley', category: 'Equipment', sku: 'SKU-007', qty: 15, unit: 'pcs', price: 3200, image_url: '/demo-stock/hand-truck.png' },
            { name: 'Cargo Net', category: 'Logistics', sku: 'SKU-008', qty: 3, unit: 'pcs', price: 1100, image_url: '/demo-stock/cargo-net.png' }
          ];

          stockItems.forEach(item => {
          const prodId = uuidv4();
          const status = calculateStatus(item.qty);

          // Insert into products with admin_id ownership
          db.run(
            `INSERT INTO products (id, name, category, sku, quantity, unit, price, status, image_url, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [prodId, item.name, item.category, item.sku, item.qty, item.unit, item.price, status, item.image_url, adminId],
            (err) => {
              if (err) {
                console.error('Product seed error:', err.message);
              } else {
                // Insert into inventory
                db.run(
                  `INSERT INTO inventory (id, product_id, quantity, warehouse_id) VALUES (?, ?, ?, ?)`,
                  [uuidv4(), prodId, item.qty, 'WH-001'],
                  (invErr) => {
                    if (invErr) console.error('Inventory seed error:', invErr.message);
                  }
                );
              }
            }
          );
        });
        }); // end db.get admin user

        // Re-enable foreign keys
        db.run('PRAGMA foreign_keys = ON', () => {
          console.log('Seeding process finished and foreign keys re-enabled.');
        });
      });
    }
  });
});

module.exports = db;
