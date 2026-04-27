'use strict';

const Joi = require('joi');

// ─── Validation Middleware ────────────────────────────────────────────────────

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return res.status(422).json({ success: false, message, errors: error.details });
  }

  req.body = value;
  next();
};

// ─── UI Flow Node Schema ──────────────────────────────────────────────────────

/**
 * Supports both v2 schema (name / url / actionType / parentId)
 * and v1 backward-compat (label / path / action).
 * children uses Joi.any() to avoid circular reference issues with Joi.
 */
const uiFlowNodeSchema = Joi.object({
  // Required
  id: Joi.string().trim().required(),

  // v2 primary name field; v1 backward-compat label
  name: Joi.string().trim().allow('', null).default(''),
  label: Joi.string().trim().allow('', null).default(''),

  // v2 new fields
  parentId: Joi.string().trim().allow('', null).default(null),
  actionType: Joi.string().valid('navigate', 'action', 'info').default('navigate'),
  url: Joi.string().trim().allow('', null).default(''),

  // v1 backward-compat
  path: Joi.string().trim().allow('', null).default(''),
  action: Joi.string().trim().allow('', null).default(''),

  description: Joi.string().trim().allow('', null).default(''),

  // Allow deep nesting — validated at DB schema level
  children: Joi.array().items(Joi.any()).default([]),
});

// ─── Request Schemas ──────────────────────────────────────────────────────────

const schemas = {
  /**
   * Create or update full business config (admin)
   */
  upsertConfig: Joi.object({
    businessId: Joi.string().trim().min(3).max(100).required(),
    businessName: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().min(10).max(5000).required(),

    // v2 new fields (optional)
    industry: Joi.string().trim().max(100).allow('', null).default(''),
    contact: Joi.string().trim().max(500).allow('', null).default(''),
    website: Joi.string().trim().max(300).allow('', null).default(''),
    tone: Joi.string()
      .valid('professional', 'friendly', 'casual', 'formal', 'neutral')
      .default('professional'),

    uiFlowTree: Joi.array().items(uiFlowNodeSchema).default([]),
    language: Joi.string()
      .valid('auto', 'en', 'vi', 'fr', 'es', 'de', 'ja', 'zh')
      .default('auto'),
    chatbotName: Joi.string().trim().max(100).default('AI Assistant'),
    welcomeMessage: Joi.string().trim().max(500).default('Hello! How can I help you today?'),
  }),

  /**
   * Send a chat message
   */
  sendMessage: Joi.object({
    message: Joi.string().trim().min(1).max(2000).required(),
    sessionId: Joi.string().uuid().optional(),
  }),

  /**
   * Update business description only
   */
  updateDescription: Joi.object({
    description: Joi.string().trim().min(10).max(5000).required(),
  }),

  /**
   * Update UI flow tree only
   */
  updateUIFlowTree: Joi.object({
    uiFlowTree: Joi.array().items(uiFlowNodeSchema).required(),
  }),

  /**
   * Update business info fields (v2)
   */
  updateBusinessInfo: Joi.object({
    businessName: Joi.string().trim().min(1).max(200),
    industry: Joi.string().trim().max(100).allow('', null),
    contact: Joi.string().trim().max(500).allow('', null),
    website: Joi.string().trim().max(300).allow('', null),
    tone: Joi.string().valid('professional', 'friendly', 'casual', 'formal', 'neutral'),
    chatbotName: Joi.string().trim().max(100),
    welcomeMessage: Joi.string().trim().max(500),
    language: Joi.string().valid('auto', 'en', 'vi', 'fr', 'es', 'de', 'ja', 'zh'),
  }).min(1),
};

module.exports = { validate, schemas };
