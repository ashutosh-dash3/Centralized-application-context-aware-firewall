require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const logRoutes = require('./routes/logRoutes');
const policyRoutes = require('./routes/policyRoutes');
const endpointRoutes = require('./routes/endpointRoutes');
const testRoute = require('./routes/testRoute');

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO for WebSocket communication
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/logs', logRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/endpoints', endpointRoutes);
app.use('/api/test-db', testRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint Firewall Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      logs: '/api/logs',
      policies: '/api/policies',
      endpoints: '/api/endpoints',
      testDB: '/api/test-db'
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('WebSocket client connected:', socket.id);

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected:', socket.id);
  });

  // Join a room based on deviceId for targeted updates
  socket.on('joinDevice', (deviceId) => {
    socket.join(`device:${deviceId}`);
    console.log(`Client joined device room: ${deviceId}`);
  });

  // Leave a room
  socket.on('leaveDevice', (deviceId) => {
    socket.leave(`device:${deviceId}`);
    console.log(`Client left device room: ${deviceId}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Endpoint Firewall Management Server                     ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║   WebSocket: Enabled                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
