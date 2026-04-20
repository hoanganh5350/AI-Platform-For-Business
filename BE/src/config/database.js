'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');

let _memoryServer = null;

/**
 * Start an in-memory MongoDB server (dev/test only)
 */
const startMemoryServer = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  _memoryServer = await MongoMemoryServer.create();
  const uri = _memoryServer.getUri();
  logger.warn('⚡ Using in-memory MongoDB (no persistent storage). Set MONGO_URI for production.');
  return uri;
};

const connectDB = async () => {
  let uri = process.env.MONGO_URI || '';
  const isDev = process.env.NODE_ENV !== 'production';

  // If no real URI configured, use in-memory server in dev mode
  const useMemory = !uri || uri.includes('localhost:27017') || uri.includes('127.0.0.1:27017');

  mongoose.connection.on('connected', () => logger.info('✅ MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
  mongoose.connection.on('disconnected', () => logger.warn('⚠️  MongoDB disconnected'));

  if (isDev && useMemory) {
    try {
      // Try real MongoDB first
      await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/ai_chatbot_platform', {
        serverSelectionTimeoutMS: 2000,
        socketTimeoutMS: 5000,
      });
      return;
    } catch {
      // Real MongoDB not available → use in-memory
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      uri = await startMemoryServer();
    }
  }

  await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/ai_chatbot_platform', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
};

/**
 * Gracefully stop in-memory server if running
 */
const stopMemoryServer = async () => {
  if (_memoryServer) {
    await mongoose.disconnect();
    await _memoryServer.stop();
    logger.info('In-memory MongoDB stopped');
  }
};

process.on('SIGINT', async () => {
  await stopMemoryServer();
  process.exit(0);
});

module.exports = connectDB;
