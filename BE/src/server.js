'use strict';

// Force Node.js to use Google DNS for Atlas SRV record resolution
// (Fixes: querySrv ECONNREFUSED _mongodb._tcp.cluster0...)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const logger = require('./utils/logger');
const connectDB = require('./config/database');
const socketManager = require('./utils/socketManager');

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

const startServer = async () => {
  try {
    await connectDB();

    // Wrap express app in http.Server so Socket.IO can share the same port
    const httpServer = http.createServer(app);

    // Attach Socket.IO
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'development' ? '*' : allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    socketManager.init(io);

    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`📋 API Docs: http://localhost:${PORT}/api/health`);
      logger.info(`🔌 Socket.IO enabled on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();

