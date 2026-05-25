'use strict';

/**
 * Socket.IO manager for real-time notification delivery to admins.
 * 
 * Pattern:
 *  - Admin clients join a room "admins" upon connecting and authenticating.
 *  - When any approval request is created (register, create-admin, update-user),
 *    the server emits a "new_notification" event to the "admins" room.
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123';

let _io = null;

/**
 * Initialize socket.io instance. Call once after http server is created.
 * @param {import('socket.io').Server} io
 */
const init = (io) => {
  _io = io;

  io.on('connection', (socket) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.disconnect(true);
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { role, userName } = decoded;
      socket.data.role = role;
      socket.data.userName = userName;

      if (role === 'ADMIN' || role === 'ADMIN_SYSTEM') {
        socket.join('admins');
        console.log(`[Socket] Admin connected: ${userName} (${role}) | id=${socket.id}`);
      } else {
        // Non-admin can connect but won't join admin room
        console.log(`[Socket] Client connected: ${userName} (${role}) | id=${socket.id}`);
      }

      socket.on('disconnect', () => {
        console.log(`[Socket] Disconnected: ${userName} | id=${socket.id}`);
      });
    } catch {
      console.warn('[Socket] Invalid token — disconnecting client');
      socket.disconnect(true);
    }
  });
};

/**
 * Emit a new approval request notification to all connected admins.
 * @param {{ requestId: string, action: string, targetType: string, createdBy: string, message: string }} payload
 */
const emitNewRequest = (payload) => {
  if (!_io) return;
  _io.to('admins').emit('new_notification', {
    ...payload,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get the io instance (for advanced usage).
 */
const getIO = () => _io;

module.exports = { init, emitNewRequest, getIO };
