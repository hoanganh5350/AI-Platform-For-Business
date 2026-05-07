'use strict';

const express = require('express');
const authRoutes = require('./authRoutes');
const chatRoutes = require('./chatRoutes');
const adminRoutes = require('./adminRoutes');
const configRoutes = require('./configRoutes');
const userManagementRoutes = require('./userManagementRoutes');
const businessRoutes = require('./businessRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/config', configRoutes);
router.use('/users-management', userManagementRoutes);
router.use('/business', businessRoutes);

module.exports = router;
