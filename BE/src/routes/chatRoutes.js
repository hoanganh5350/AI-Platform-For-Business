'use strict';

const express = require('express');
const { sendMessage, getHistory, clearSession } = require('../controllers/chatController');
const { validate, schemas } = require('../middlewares/validator');

const router = express.Router();

/**
 * @route   POST /api/chat/:businessId
 * @desc    Send a chat message and get AI response
 * @access  Public
 */
router.post('/:businessId', validate(schemas.sendMessage), sendMessage);

/**
 * @route   GET /api/chat/:businessId/history/:sessionId
 * @desc    Get chat history for a session
 * @access  Public
 */
router.get('/:businessId/history/:sessionId', getHistory);

/**
 * @route   DELETE /api/chat/:businessId/session/:sessionId
 * @desc    Clear a chat session
 * @access  Public
 */
router.delete('/:businessId/session/:sessionId', clearSession);

module.exports = router;
