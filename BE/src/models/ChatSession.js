'use strict';

const mongoose = require('mongoose');

// ─── Chat Session Schema ─────────────────────────────────────────────────────
const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    suggestion: {
      type: {
        type: String,
        enum: ['navigate', 'action'],
      },
      target: String,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    businessId: {
      type: String,
      required: true,
      index: true,
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    userAgent: String,
    ipAddress: String,
  },
  {
    timestamps: true,
  }
);

// Auto-expire sessions after 24 hours of inactivity
chatSessionSchema.index({ lastActivityAt: 1 }, { expireAfterSeconds: 86400 });

chatSessionSchema.pre('save', function (next) {
  this.lastActivityAt = new Date();
  next();
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;
