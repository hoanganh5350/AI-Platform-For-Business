'use strict';

const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const aiService = require('../services/aiService');
const businessConfigService = require('../services/businessConfigService');
const chatSessionService = require('../services/chatSessionService');
const logger = require('../utils/logger');

// ─── Multer — memory storage for chat file uploads ─────────────────────────
const ALLOWED_CHAT_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const chatUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_CHAT_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`Định dạng file không hỗ trợ: ${file.mimetype}`));
  },
});

const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Upload a user-attached file to Gemini File API.
 * Returns { uri, mimeType, name } — valid for 48h.
 */
async function uploadUserFileToGemini(file) {
  const uploaded = await geminiClient.files.upload({
    file: new Blob([file.buffer], { type: file.mimetype }),
    config: {
      mimeType: file.mimetype,
      displayName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
    },
  });
  return { uri: uploaded.uri, mimeType: file.mimetype, name: uploaded.name };
}

/**
 * POST /api/chat/:businessId
 * Send a message (with optional file attachment) and get AI response.
 * Accepts both application/json (text-only) and multipart/form-data (text + file).
 */
const sendMessage = [
  // 1. Multer middleware — parses multipart/form-data, optional file
  chatUpload.single('file'),

  // 2. Multer error handler — catches file filter / size errors
  (err, req, res, next) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  },

  // 3. Main handler
  async (req, res) => {
    const { businessId } = req.params;
    const { message, sessionId } = req.body;

    // Guard — must have at least text or file
    if (!message?.trim() && !req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tin nhắn hoặc đính kèm file.' });
    }

    // Get or create session
    const resolvedSessionId = sessionId || uuidv4();
    await chatSessionService.getOrCreateSession(resolvedSessionId, businessId, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Load business config
    const businessConfig = await businessConfigService.getConfig(businessId);

    // Get conversation history
    const history = await chatSessionService.getHistory(resolvedSessionId, 20);

    let userMessageContent = '';
    if (req.file) {
      userMessageContent = `[File: ${req.file.originalname}]`;
      if (message?.trim()) {
        userMessageContent += `\n${message.trim()}`;
      }
    } else {
      userMessageContent = message?.trim() || '';
    }

    // Save user message to DB
    await chatSessionService.appendMessage(resolvedSessionId, {
      role: 'user',
      content: userMessageContent,
    });

    // Upload user file to Gemini (if attached and not docx)
    let userFileRef = null;
    let userMessage = message?.trim() || (req.file ? `Hãy phân tích file tôi vừa gửi: ${req.file.originalname}` : '');

    if (req.file) {
      if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          const mammoth = require('mammoth');
          const parseResult = await mammoth.extractRawText({ buffer: req.file.buffer });
          userMessage = `${userMessage}\n\n[Nội dung file đính kèm "${req.file.originalname}":]\n${parseResult.value}`;
          logger.info(`[Chat] Extracted text from user docx file: ${req.file.originalname} | session: ${resolvedSessionId}`);
        } catch (extractErr) {
          logger.warn(`[Chat] Extracted text from docx failed: ${extractErr.message}`);
        }
      } else {
        try {
          userFileRef = await uploadUserFileToGemini(req.file);
          logger.info(`[Chat] User file → Gemini: ${userFileRef.uri} | session: ${resolvedSessionId}`);
        } catch (uploadErr) {
          logger.warn(`[Chat] Gemini file upload failed: ${uploadErr.message}`);
        }
      }
    }

    // Generate AI response — userFileRef injected as extra multimodal part
    const aiResponse = await aiService.generateResponse({
      userMessage,
      businessConfig,
      conversationHistory: [...history, { role: 'user', content: userMessageContent }],
      userFileRef,
    });

    // Save assistant response to DB
    await chatSessionService.appendMessage(resolvedSessionId, {
      role: 'assistant',
      content: aiResponse.message,
      suggestion: aiResponse.suggestion,
    });

    // Best-effort: delete user file from Gemini after response (non-blocking)
    if (userFileRef?.name) {
      geminiClient.files.delete({ name: userFileRef.name }).catch(() => {});
    }

    logger.info(`[Chat] Response sent | business: ${businessId} | session: ${resolvedSessionId}`);

    return res.status(200).json({
      success: true,
      data: { sessionId: resolvedSessionId, ...aiResponse },
    });
  },
];

/**
 * GET /api/chat/:businessId/history/:sessionId
 */
const getHistory = async (req, res) => {
  const { businessId, sessionId } = req.params;
  const { limit = 50 } = req.query;

  const messages = await chatSessionService.getHistory(sessionId, parseInt(limit, 10));

  return res.status(200).json({
    success: true,
    data: { sessionId, businessId, messages },
  });
};

/**
 * DELETE /api/chat/:businessId/session/:sessionId
 */
const clearSession = async (req, res) => {
  const { sessionId } = req.params;
  const ChatSession = require('../models/ChatSession');
  await ChatSession.findOneAndDelete({ sessionId });

  return res.status(200).json({ success: true, message: 'Session cleared' });
};

module.exports = { sendMessage, getHistory, clearSession };
