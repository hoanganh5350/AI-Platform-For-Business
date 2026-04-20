'use strict';

const express = require('express');
const { loadPublicConfig } = require('../controllers/configController');

const router = express.Router();

/**
 * @route   GET /api/config/:businessId
 * @desc    Load public chatbot config for embedding
 * @access  Public
 */
router.get('/:businessId', loadPublicConfig);

module.exports = router;
