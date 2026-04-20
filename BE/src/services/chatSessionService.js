'use strict';

const { v4: uuidv4 } = require('uuid');
const ChatSession = require('../models/ChatSession');
const logger = require('../utils/logger');

class ChatSessionService {
  /**
   * Get or create a chat session
   */
  async getOrCreateSession(sessionId, businessId, meta = {}) {
    let session = await ChatSession.findOne({ sessionId });

    if (!session) {
      session = await ChatSession.create({
        sessionId: sessionId || uuidv4(),
        businessId,
        messages: [],
        ...meta,
      });
      logger.info(`New chat session created: ${session.sessionId}`);
    }

    return session;
  }

  /**
   * Append a message to session
   */
  async appendMessage(sessionId, { role, content, suggestion }) {
    const session = await ChatSession.findOne({ sessionId });
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    const message = { role, content };
    if (suggestion) message.suggestion = suggestion;

    session.messages.push(message);
    await session.save();
    return session;
  }

  /**
   * Get session history (last N messages for context)
   */
  async getHistory(sessionId, limit = 20) {
    const session = await ChatSession.findOne({ sessionId }).lean();
    if (!session) return [];
    return session.messages.slice(-limit);
  }

  /**
   * Generate a new session ID
   */
  generateSessionId() {
    return uuidv4();
  }
}

module.exports = new ChatSessionService();
