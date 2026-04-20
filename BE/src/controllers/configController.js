'use strict';

const businessConfigService = require('../services/businessConfigService');

/**
 * GET /api/config/:businessId
 * Public endpoint to load chatbot config for embedding
 */
const loadPublicConfig = async (req, res) => {
  const { businessId } = req.params;
  const config = await businessConfigService.getConfig(businessId);

  // Return only public-safe fields
  return res.status(200).json({
    success: true,
    data: {
      businessId: config.businessId,
      businessName: config.businessName,
      chatbotName: config.chatbotName,
      welcomeMessage: config.welcomeMessage,
      language: config.language,
      uiFlowTree: config.uiFlowTree,
    },
  });
};

module.exports = { loadPublicConfig };
