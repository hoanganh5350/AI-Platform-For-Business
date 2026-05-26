'use strict';

const mongoose = require('mongoose');

// ─── UI Flow Node Sub-Schema (v2 — Admin-driven) ─────────────────────────────
const uiFlowNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },

    // v2: primary display name
    name: { type: String, default: '' },
    // v1 backward-compat alias for 'name'
    label: { type: String, default: '' },

    // optional parent reference for flat-list representations
    parentId: { type: String, default: null },

    description: { type: String, default: '' },

    // actionType: how this node behaves
    actionType: {
      type: String,
      enum: ['navigate', 'action', 'info'],
      default: 'navigate',
    },

    // v2: canonical URL / route
    url: { type: String, default: '' },
    // v1 backward-compat alias for 'url'
    path: { type: String, default: '' },

    // v1 backward-compat: inline action string
    action: { type: String, default: '' },

    // Nested children (v1 tree structure — still supported)
    children: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

// ─── Document Sub-Schema (Gemini File API) ────────────────────────────────────
const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    uri: { type: String, required: true },     // Gemini File API URI
    geminiName: { type: String, default: '' }, // Gemini internal file name (for deletion)
    uploadedAt: { type: Date, default: Date.now },
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
    // ── v2 new fields ──
    industry: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      maxlength: 255,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 50,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    tone: {
      type: String,
      enum: ['professional', 'friendly', 'casual', 'formal', 'neutral'],
      default: 'professional',
    },
    // ── core fields ──
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
    // ── Internet Search (Gemini Search Grounding) ──
    enableInternetSearch: {
      type: Boolean,
      default: false,
    },
    // ── Knowledge Documents (Gemini File API) ──
    documents: {
      type: [documentSchema],
      default: [],
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
