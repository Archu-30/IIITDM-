// database.js
// SQLite database connection and schema setup for Universal Inventory Management System.
// Extended with super_admin role and additional tables.

const sqlite3 = require('../backend/node_modules/sqlite3').verbose();
const path = require('path');
const bcrypt = require('../backend/node_modules/bcryptjs');
const { v4: uuidv4 } = require('../backend/node_modules/uuid');

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

// Initialize schema and seed data
db.serialize(() => {
  // Users table — extended to include super_admin role
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin','customer','super_admin')) DEFAULT 'customer',
      status TEXT CHECK(status IN ('active','inactive')) DEFAULT 'active',
      last_login TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Organizations table
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

  // Stock Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS stock_items (
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Stock Transactions table
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

  // Leases table
  db.run(`
    CREATE TABLE IF NOT EXISTS leases (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      tenant_name TEXT NOT NULL,
      warehouse_id TEXT,
      warehouse_name TEXT NOT NULL,
      organization_id TEXT,
      organization_name TEXT DEFAULT 'StockFlow HQ',
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

  // Audit Logs table
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

  // Subscription Plans table
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

  // Notifications Log table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications_log (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('system','payment','maintenance','lease','general')) DEFAULT 'general',
      sent_by TEXT DEFAULT 'Super Admin',
      recipient_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // ---- Seed initial data if users table is empty ----
  db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
    if (err) {
      console.error("Error checking users count:", err.message);
      return;
    }
    if (row.count === 0) {
      console.log("Database empty. Seeding initial data...");

      const superAdminId = uuidv4();
      const adminId = uuidv4();
      const customerId = uuidv4();

      const superAdminHash = bcrypt.hashSync('superadmin123', 10);
      const adminPasswordHash = bcrypt.hashSync('admin123', 10);
      const customerPasswordHash = bcrypt.hashSync('customer123', 10);

      // Seed Super Admin
      db.run(
        `INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [superAdminId, 'System Administrator', 'superadmin@inventory.com', superAdminHash, 'super_admin', 'active']
      );

      // Seed Admin
      db.run(
        `INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [adminId, 'Admin User', 'admin@inventory.com', adminPasswordHash, 'admin', 'active']
      );

      // Seed Customer
      db.run(
        `INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [customerId, 'Test Customer', 'customer@inventory.com', customerPasswordHash, 'customer', 'active']
      );

      // Seed Organizations
      const orgs = [
        { name: 'StockFlow HQ', location: 'Chennai, Tamil Nadu', warehouses: 4, admins: 3, tenants: 18, revenue: 485000 },
        { name: 'Northern Logistics', location: 'Delhi, NCR', warehouses: 6, admins: 5, tenants: 32, revenue: 920000 },
        { name: 'Coastal Warehousing', location: 'Mumbai, Maharashtra', warehouses: 3, admins: 2, tenants: 14, revenue: 340000 },
        { name: 'South India Storage', location: 'Bengaluru, Karnataka', warehouses: 5, admins: 4, tenants: 26, revenue: 670000 },
      ];
      orgs.forEach(org => {
        const orgId = uuidv4();
        db.run(
          `INSERT INTO organizations (id, name, location, status, warehouses_count, admins_count, tenants_count, revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [orgId, org.name, org.location, 'active', org.warehouses, org.admins, org.tenants, org.revenue]
        );
      });

      // Seed Subscription Plans
      const plans = [
        { name: 'Starter', price: 999, cycle: 'monthly', warehouses: 2, admins: 1, tenants: 10, features: 'Basic dashboard,Inventory management,Email support' },
        { name: 'Professional', price: 2999, cycle: 'monthly', warehouses: 10, admins: 5, tenants: 50, features: 'Advanced analytics,API access,Priority support,Audit logs' },
        { name: 'Enterprise', price: 9999, cycle: 'monthly', warehouses: 999, admins: 999, tenants: 999, features: 'Unlimited everything,Dedicated support,Custom integrations,SLA guarantee,White labeling' },
      ];
      plans.forEach(plan => {
        db.run(
          `INSERT INTO subscription_plans (id, name, price, billing_cycle, max_warehouses, max_admins, max_tenants, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), plan.name, plan.price, plan.cycle, plan.warehouses, plan.admins, plan.tenants, plan.features]
        );
      });

      // Seed Leases
      const leaseData = [
        { tenant: 'Rajesh Traders', warehouse: 'Block A - Floor 1', org: 'StockFlow HQ', rent: 25000, status: 'active', start: '2025-01-01', end: '2025-12-31' },
        { tenant: 'Meena Exports', warehouse: 'Block B - Floor 2', org: 'Northern Logistics', rent: 32000, status: 'active', start: '2025-03-01', end: '2026-02-28' },
        { tenant: 'KL Industries', warehouse: 'Block C - Floor 1', org: 'Coastal Warehousing', rent: 18000, status: 'expired', start: '2024-06-01', end: '2025-05-31' },
        { tenant: 'Sunrise Pharma', warehouse: 'Block A - Floor 3', org: 'South India Storage', rent: 45000, status: 'active', start: '2025-02-01', end: '2026-01-31' },
        { tenant: 'TechStore Ltd', warehouse: 'Block D - Floor 1', org: 'StockFlow HQ', rent: 28000, status: 'pending', start: '2025-07-01', end: '2026-06-30' },
      ];
      leaseData.forEach(l => {
        db.run(
          `INSERT INTO leases (id, tenant_id, tenant_name, warehouse_name, organization_name, start_date, end_date, monthly_rent, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), uuidv4(), l.tenant, l.warehouse, l.org, l.start, l.end, l.rent, l.status]
        );
      });

      // Seed Audit Logs
      const auditEntries = [
        { user: 'System Administrator', role: 'super_admin', action: 'USER_CREATED', module: 'Users', details: 'Created admin user admin@inventory.com' },
        { user: 'Admin User', role: 'admin', action: 'STOCK_UPDATED', module: 'Inventory', details: 'Updated quantity for Steel Storage Rack' },
        { user: 'System Administrator', role: 'super_admin', action: 'ORG_CREATED', module: 'Organizations', details: 'Created organization: Northern Logistics' },
        { user: 'Admin User', role: 'admin', action: 'USER_LOGIN', module: 'Auth', details: 'Successful login from 192.168.1.10' },
        { user: 'System Administrator', role: 'super_admin', action: 'PLAN_CREATED', module: 'Subscriptions', details: 'Created Enterprise subscription plan' },
      ];
      auditEntries.forEach(entry => {
        db.run(
          `INSERT INTO audit_logs (id, user_name, user_role, action, module, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), entry.user, entry.role, entry.action, entry.module, entry.details, '127.0.0.1']
        );
      });

      // Seed Stock Items
      const stockItems = [
        { name: 'Steel Storage Rack', category: 'Furniture', sku: 'SKU-001', qty: 45, unit: 'pcs', price: 2500, image_url: '/demo-stock/wooden-pallet.png' }, // reusing image for demo
        { name: 'Bubble Wrap Roll', category: 'Packaging', sku: 'SKU-002', qty: 8, unit: 'rolls', price: 350, image_url: '/demo-stock/packing-tape.png' }, // reusing image for demo
        { name: 'Forklift Battery', category: 'Equipment', sku: 'SKU-003', qty: 0, unit: 'pcs', price: 15000, image_url: '/demo-stock/forklift-battery.png' },
        { name: 'Packing Tape', category: 'Packaging', sku: 'SKU-004', qty: 120, unit: 'pcs', price: 45, image_url: '/demo-stock/packing-tape.png' },
        { name: 'Safety Helmet', category: 'Safety', sku: 'SKU-005', qty: 6, unit: 'pcs', price: 800, image_url: '/demo-stock/safety-helmet.png' },
        { name: 'Wooden Pallet', category: 'Logistics', sku: 'SKU-006', qty: 200, unit: 'pcs', price: 650, image_url: '/demo-stock/wooden-pallet.png' },
        { name: 'Hand Truck Trolley', category: 'Equipment', sku: 'SKU-007', qty: 15, unit: 'pcs', price: 3200, image_url: '/demo-stock/hand-truck.png' },
        { name: 'Cargo Net', category: 'Logistics', sku: 'SKU-008', qty: 3, unit: 'pcs', price: 1100, image_url: '/demo-stock/cargo-net.png' },
      ];

      stockItems.forEach(item => {
        const itemId = uuidv4();
        const status = calculateStatus(item.qty);
        db.run(
          `INSERT INTO stock_items (id, name, category, sku, quantity, unit, price, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [itemId, item.name, item.category, item.sku, item.qty, item.unit, item.price, status, item.image_url],
          (err) => {
            if (err) {
              console.error(`Failed to seed stock item ${item.name}:`, err.message);
            } else {
              const transId = uuidv4();
              db.run(
                `INSERT INTO stock_transactions (id, item_id, item_name, action, changed_by_id, changed_by_name, old_quantity, new_quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [transId, itemId, item.name, 'created', adminId, 'Admin User', 0, item.qty, 'Initial seed data']
              );
            }
          }
        );
      });

      console.log("Seeding completed successfully.");
    } else {
      // DB already has data — just ensure super_admin user exists
      db.get("SELECT id FROM users WHERE email = ?", ['superadmin@inventory.com'], (err, row) => {
        if (!err && !row) {
          const superAdminId = uuidv4();
          const superAdminHash = bcrypt.hashSync('superadmin123', 10);
          db.run(
            `INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [superAdminId, 'System Administrator', 'superadmin@inventory.com', superAdminHash, 'super_admin', 'active'],
            (err) => {
              if (!err) console.log('Super Admin user seeded successfully.');
            }
          );
        }
      });

      // Ensure new tables exist (safe to run on existing DB)
      db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN last_login TEXT`, () => {});
    }
  });
});

module.exports = db;


