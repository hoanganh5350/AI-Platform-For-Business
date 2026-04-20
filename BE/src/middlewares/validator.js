'use strict';

const Joi = require('joi');

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

// ─── Schemas ─────────────────────────────────────────────────────────────────

/**
 * UI Flow Node — allow children as Joi.any() to avoid circular reference issues.
 * Deep child structure is validated by the Mongoose schema at DB level.
 */
const uiFlowNodeSchema = Joi.object({
  id: Joi.string().required(),
  label: Joi.string().required(),
  description: Joi.string().allow('', null).default(''),
  path: Joi.string().allow('', null).default(''),
  action: Joi.string().allow('', null).default(''),
  children: Joi.array().items(Joi.any()).default([]),
});

const schemas = {
  upsertConfig: Joi.object({
    businessId: Joi.string().trim().min(3).max(100).required(),
    businessName: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().min(10).max(5000).required(),
    uiFlowTree: Joi.array().items(uiFlowNodeSchema).default([]),
    language: Joi.string().valid('auto', 'en', 'vi', 'fr', 'es', 'de', 'ja', 'zh').default('auto'),
    chatbotName: Joi.string().trim().max(100).default('AI Assistant'),
    welcomeMessage: Joi.string().trim().max(500).default('Hello! How can I help you today?'),
  }),

  sendMessage: Joi.object({
    message: Joi.string().trim().min(1).max(2000).required(),
    sessionId: Joi.string().uuid().optional(),
  }),

  updateDescription: Joi.object({
    description: Joi.string().trim().min(10).max(5000).required(),
  }),

  updateUIFlowTree: Joi.object({
    uiFlowTree: Joi.array().items(uiFlowNodeSchema).required(),
  }),
};

module.exports = { validate, schemas };
