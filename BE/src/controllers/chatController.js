'use strict';

const { v4: uuidv4 } = require('uuid');
const aiService = require('../services/aiService');
const businessConfigService = require('../services/businessConfigService');
const chatSessionService = require('../services/chatSessionService');
const logger = require('../utils/logger');

/**
 * POST /api/chat/:businessId
 * Send a message and get AI response
 */
const sendMessage = async (req, res) => {
  const { businessId } = req.params;
  const { message, sessionId } = req.body;

  // Get or create session
  const resolvedSessionId = sessionId || uuidv4();
  const session = await chatSessionService.getOrCreateSession(resolvedSessionId, businessId, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  // Load business config
  const businessConfig = await businessConfigService.getConfig(businessId);

  // Get conversation history for context
  const history = await chatSessionService.getHistory(resolvedSessionId, 20);

  // Save user message to session
  await chatSessionService.appendMessage(resolvedSessionId, {
    role: 'user',
    content: message,
  });

  // Generate AI response
  const aiResponse = await aiService.generateResponse({
    userMessage: message,
    businessConfig,
    conversationHistory: [...history, { role: 'user', content: message }],
  });

  // Save assistant response to session
  await chatSessionService.appendMessage(resolvedSessionId, {
    role: 'assistant',
    content: aiResponse.message,
    suggestion: aiResponse.suggestion,
  });

  logger.info(`Chat response sent | business: ${businessId} | session: ${resolvedSessionId}`);

  return res.status(200).json({
    success: true,
    data: {
      sessionId: resolvedSessionId,
      ...aiResponse,
    },
  });
};

/**
 * GET /api/chat/:businessId/history/:sessionId
 * Get conversation history for a session
 */
const getHistory = async (req, res) => {
  const { businessId, sessionId } = req.params;
  const { limit = 50 } = req.query;

  const messages = await chatSessionService.getHistory(sessionId, parseInt(limit, 10));

  return res.status(200).json({
    success: true,
    data: {
      sessionId,
      businessId,
      messages,
    },
  });
};

/**
 * DELETE /api/chat/:businessId/session/:sessionId
 * Clear a chat session
 */
const clearSession = async (req, res) => {
  const { sessionId } = req.params;
  const ChatSession = require('../models/ChatSession');
  await ChatSession.findOneAndDelete({ sessionId });

  return res.status(200).json({
    success: true,
    message: 'Session cleared',
  });
};

module.exports = { sendMessage, getHistory, clearSession };
