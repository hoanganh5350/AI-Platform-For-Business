'use strict';

const businessConfigService = require('../services/businessConfigService');

/**
 * GET /api/config/:businessId
 * Public endpoint to load chatbot config for frontend embedding.
 * Returns only non-sensitive, display-safe fields.
 */
const loadPublicConfig = async (req, res) => {
  const { businessId } = req.params;
  const config = await businessConfigService.getConfig(businessId);

  return res.status(200).json({
    success: true,
    data: {
      // Identity
      businessId: config.businessId,
      businessName: config.businessName,

      // v2 new public fields
      industry: config.industry || '',
      website: config.website || '',
      tone: config.tone || 'professional',

      // Chatbot UI config
      chatbotName: config.chatbotName,
      welcomeMessage: config.welcomeMessage,
      language: config.language,

      // Navigation structure
      uiFlowTree: config.uiFlowTree,
    },
  });
};

module.exports = { loadPublicConfig };
