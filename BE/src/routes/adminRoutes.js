'use strict';

const express = require('express');
const adminAuth = require('../middlewares/adminAuth');
const { validate, schemas } = require('../middlewares/validator');
const {
  upsertConfig,
  listConfigs,
  getConfig,
  updateDescription,
  updateUIFlowTree,
  deleteConfig,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require API key auth
router.use(adminAuth);

/**
 * @route   POST /api/admin/config
 * @desc    Create or update business config
 */
router.post('/config', validate(schemas.upsertConfig), upsertConfig);

/**
 * @route   GET /api/admin/config
 * @desc    List all business configs
 */
router.get('/config', listConfigs);

/**
 * @route   GET /api/admin/config/:businessId
 * @desc    Get single business config
 */
router.get('/config/:businessId', getConfig);

/**
 * @route   PATCH /api/admin/config/:businessId/description
 * @desc    Update business description
 */
router.patch('/config/:businessId/description', validate(schemas.updateDescription), updateDescription);

/**
 * @route   PATCH /api/admin/config/:businessId/ui-flow
 * @desc    Update UI flow tree
 */
router.patch('/config/:businessId/ui-flow', validate(schemas.updateUIFlowTree), updateUIFlowTree);

/**
 * @route   DELETE /api/admin/config/:businessId
 * @desc    Soft-delete business config
 */
router.delete('/config/:businessId', deleteConfig);

module.exports = router;
