'use strict';

const businessConfigService = require('../services/businessConfigService');
const logger = require('../utils/logger');

/**
 * POST /api/admin/config
 * Create or update a business config
 */
const upsertConfig = async (req, res) => {
  const config = await businessConfigService.upsertConfig(req.body);
  return res.status(200).json({
    success: true,
    message: 'Business config saved successfully',
    data: config,
  });
};

/**
 * GET /api/admin/config
 * List all business configs
 */
const listConfigs = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await businessConfigService.listConfigs({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });
  return res.status(200).json({ success: true, data: result });
};

/**
 * GET /api/admin/config/:businessId
 * Get a single business config
 */
const getConfig = async (req, res) => {
  const config = await businessConfigService.getConfig(req.params.businessId);
  return res.status(200).json({ success: true, data: config });
};

/**
 * PATCH /api/admin/config/:businessId/description
 * Update business description
 */
const updateDescription = async (req, res) => {
  const { description } = req.body;
  const config = await businessConfigService.updateDescription(req.params.businessId, description);
  return res.status(200).json({
    success: true,
    message: 'Description updated',
    data: config,
  });
};

/**
 * PATCH /api/admin/config/:businessId/ui-flow
 * Update UI flow tree
 */
const updateUIFlowTree = async (req, res) => {
  const { uiFlowTree } = req.body;
  const config = await businessConfigService.updateUIFlowTree(
    req.params.businessId,
    uiFlowTree
  );
  return res.status(200).json({
    success: true,
    message: 'UI flow tree updated',
    data: config,
  });
};

/**
 * DELETE /api/admin/config/:businessId
 * Soft-delete a business config
 */
const deleteConfig = async (req, res) => {
  await businessConfigService.deleteConfig(req.params.businessId);
  return res.status(200).json({
    success: true,
    message: 'Business config deactivated',
  });
};

module.exports = { upsertConfig, listConfigs, getConfig, updateDescription, updateUIFlowTree, deleteConfig };
