// server.js
// Main entry point for the Inventory Management System backend.
// Sets up Express, CORS, JSON body parsing, Socket.IO, and mounts route modules.

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { execSync } = require('child_process');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'stockflow_jwt_secret_2024';

// ─── Kill any zombie process on our port before binding ─────────────────────
try {
  const result = execSync(
    `powershell -Command "Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`,
    { encoding: 'utf8', timeout: 5000 }
  ).trim();
  if (result && !isNaN(result)) {
    const pid = parseInt(result);
    if (pid !== process.pid) {
      console.log(`[Startup] Killing zombie process PID ${pid} on port ${port}...`);
      execSync(`taskkill /F /PID ${pid}`, { timeout: 3000 });
      // Wait a moment for the port to be released
      execSync('powershell -Command "Start-Sleep -Milliseconds 800"', { timeout: 3000 });
      console.log(`[Startup] Port ${port} cleared.`);
    }
  }
} catch (_) {
  // No zombie found or kill failed — proceed anyway
}

// Middleware
app.use(cors());
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Socket.IO Setup ─────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// JWT authentication middleware for Socket.IO handshake
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication token missing'));

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Invalid token'));
    socket.user = user; // attach decoded JWT payload
    next();
  });
});

io.on('connection', (socket) => {
  if (socket.user?.id) {
    // Each user joins their own private room: "user:<userId>"
    socket.join(`user:${socket.user.id}`);
    console.log(`[Socket.IO] User ${socket.user.name} (${socket.user.role}) connected → room user:${socket.user.id}`);
  }

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] User ${socket.user?.name} disconnected`);
  });
});

// Inject io into the notify utility so it can push real-time events
const { setIO } = require('./utils/notify');
setIO(io);

// Export io for use in route files if needed
app.set('io', io);

// ─── Route Handlers ───────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stock');
const usersRoutes = require('./routes/users');
const transactionsRoutes = require('./routes/transactions');
const superAdminRoutes = require('./routes/superAdmin');
const leasesRoutes = require('./routes/leases');
const notificationsRoutes = require('./routes/notifications');
const ordersRoutes = require('./routes/orders');
const callbacksRoutes = require('./routes/callbacks');
const inquiriesRoutes = require('./routes/inquiries');

// ─── Mount Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/leases', leasesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/callbacks', callbacksRoutes);
app.use('/api/inquiries', inquiriesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Socket.IO ready for real-time notifications`);
});

process.on('uncaughtException', err => { console.error('UNCAUGHT EXCEPTION:', err); process.exit(1); });
process.on('unhandledRejection', err => { console.error('UNHANDLED REJECTION:', err); process.exit(1); });
