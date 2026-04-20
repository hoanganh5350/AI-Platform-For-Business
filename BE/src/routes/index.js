'use strict';

const express = require('express');
const chatRoutes = require('./chatRoutes');
const adminRoutes = require('./adminRoutes');
const configRoutes = require('./configRoutes');

const router = express.Router();

router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/config', configRoutes);

module.exports = router;
