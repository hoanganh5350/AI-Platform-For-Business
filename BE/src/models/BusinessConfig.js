'use strict';

const mongoose = require('mongoose');

// ─── UI Flow Node Sub-Schema ─────────────────────────────────────────────────
const uiFlowNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, default: '' },
    path: { type: String, default: '' },
    action: { type: String, default: '' },
    children: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

// ─── Business Config Schema ──────────────────────────────────────────────────
const businessConfigSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    uiFlowTree: {
      type: [uiFlowNodeSchema],
      default: [],
    },
    language: {
      type: String,
      default: 'auto',
      enum: ['auto', 'en', 'vi', 'fr', 'es', 'de', 'ja', 'zh'],
    },
    chatbotName: {
      type: String,
      default: 'AI Assistant',
      maxlength: 100,
    },
    welcomeMessage: {
      type: String,
      default: 'Hello! How can I help you today?',
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

businessConfigSchema.index({ businessId: 1, isActive: 1 });

const BusinessConfig = mongoose.model('BusinessConfig', businessConfigSchema);

module.exports = BusinessConfig;
