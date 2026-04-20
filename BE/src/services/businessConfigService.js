'use strict';

const BusinessConfig = require('../models/BusinessConfig');
const logger = require('../utils/logger');

class BusinessConfigService {
  /**
   * Create or update business config
   * @param {Object} data
   */
  async upsertConfig(data) {
    const { businessId, ...rest } = data;
    const config = await BusinessConfig.findOneAndUpdate(
      { businessId },
      { $set: rest },
      { new: true, upsert: true, runValidators: true }
    );
    logger.info(`Business config upserted: ${businessId}`);
    return config;
  }

  /**
   * Get config by businessId
   * @param {string} businessId
   */
  async getConfig(businessId) {
    const config = await BusinessConfig.findOne({ businessId, isActive: true }).lean();
    if (!config) {
      const err = new Error(`Business config not found: ${businessId}`);
      err.statusCode = 404;
      throw err;
    }
    return config;
  }

  /**
   * List all configs (admin)
   */
  async listConfigs({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [configs, total] = await Promise.all([
      BusinessConfig.find({}).skip(skip).limit(limit).lean(),
      BusinessConfig.countDocuments({}),
    ]);
    return { configs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Update UI flow tree only
   */
  async updateUIFlowTree(businessId, uiFlowTree) {
    const config = await BusinessConfig.findOneAndUpdate(
      { businessId },
      { $set: { uiFlowTree } },
      { new: true, runValidators: true }
    );
    if (!config) {
      const err = new Error(`Business config not found: ${businessId}`);
      err.statusCode = 404;
      throw err;
    }
    return config;
  }

  /**
   * Update business description only
   */
  async updateDescription(businessId, description) {
    const config = await BusinessConfig.findOneAndUpdate(
      { businessId },
      { $set: { description } },
      { new: true, runValidators: true }
    );
    if (!config) {
      const err = new Error(`Business config not found: ${businessId}`);
      err.statusCode = 404;
      throw err;
    }
    return config;
  }

  /**
   * Delete (soft-delete) a business config
   */
  async deleteConfig(businessId) {
    const config = await BusinessConfig.findOneAndUpdate(
      { businessId },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!config) {
      const err = new Error(`Business config not found: ${businessId}`);
      err.statusCode = 404;
      throw err;
    }
    return config;
  }
}

module.exports = new BusinessConfigService();
