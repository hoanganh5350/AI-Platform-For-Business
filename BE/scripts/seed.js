/**
 * Seed script — creates a demo business config in MongoDB
 * Usage: node BE/scripts/seed.js
 */
'use strict';

require('dotenv').config({ path: `${__dirname}/../.env` });
const mongoose = require('mongoose');
const BusinessConfig = require('../src/models/BusinessConfig');

const DEMO_CONFIG = {
  businessId: 'demo-business',
  businessName: 'TechCorp Solutions',

  // ── v2 business info ──
  industry: 'Enterprise Software',
  contact: 'Email: support@techcorp.example.com | Sales: sales@techcorp.example.com | Phone: +1 (800) 555-0199',
  website: 'https://techcorp.example.com',
  tone: 'professional',

  description: `TechCorp Solutions is a leading enterprise software company founded in 2010.
We provide cloud-based ERP systems, CRM platforms, and data analytics tools for mid-to-large enterprises.

Our flagship products:
- TechCorp ERP: Full-suite enterprise resource planning supporting up to 10,000 concurrent users.
- TechCorp CRM: Customer relationship management with AI-powered insights and sales pipeline tracking.
- TechCorp Analytics: Real-time business intelligence dashboard with 200+ pre-built reports.

Pricing: Plans start at $299/month (Starter), $799/month (Professional), $1999/month (Enterprise).
All plans include a 14-day free trial. Annual billing saves 20%.

Support: 24/7 email support for all plans. Business-hours live chat for Professional+.
Dedicated account manager and SLA guarantee for Enterprise customers.

Headquarters: 123 Market Street, San Francisco, CA 94105.
Remote-first company with teams in 12 countries worldwide.`,

  // ── v2 UI Flow Tree (name / actionType / url / parentId) ──
  uiFlowTree: [
    {
      id: 'home',
      name: 'Home',
      actionType: 'navigate',
      url: '/',
      description: 'Main landing page',
      children: [
        {
          id: 'products',
          name: 'Products',
          actionType: 'navigate',
          url: '/products',
          description: 'Overview of all software products',
          children: [
            { id: 'erp', name: 'TechCorp ERP', actionType: 'navigate', url: '/products/erp', description: 'Enterprise resource planning software', children: [] },
            { id: 'crm', name: 'TechCorp CRM', actionType: 'navigate', url: '/products/crm', description: 'Customer relationship management', children: [] },
            { id: 'analytics', name: 'TechCorp Analytics', actionType: 'navigate', url: '/products/analytics', description: 'Business intelligence & reporting', children: [] },
          ],
        },
        {
          id: 'pricing',
          name: 'Pricing',
          actionType: 'navigate',
          url: '/pricing',
          description: 'Subscription plans and pricing details',
          children: [],
        },
        {
          id: 'contact',
          name: 'Contact Sales',
          actionType: 'action',
          url: '/contact',
          action: 'open_contact_form',
          description: 'Open contact form to reach the sales team',
          children: [],
        },
        {
          id: 'demo',
          name: 'Request a Demo',
          actionType: 'action',
          url: '/demo',
          action: 'open_demo_form',
          description: 'Schedule a live product demonstration',
          children: [],
        },
        {
          id: 'support',
          name: 'Support Center',
          actionType: 'navigate',
          url: '/support',
          description: 'Help articles, support tickets, and live chat',
          children: [
            { id: 'docs', name: 'Documentation', actionType: 'navigate', url: '/support/docs', description: 'Product documentation and guides', children: [] },
            { id: 'ticket', name: 'Submit a Ticket', actionType: 'action', url: '/support/ticket', action: 'open_ticket_form', description: 'Create a support request', children: [] },
          ],
        },
        {
          id: 'trial',
          name: 'Start Free Trial',
          actionType: 'action',
          url: '/trial',
          action: 'open_trial_form',
          description: 'Begin a 14-day free trial — no credit card required',
          children: [],
        },
      ],
    },
  ],

  chatbotName: 'TechBot',
  welcomeMessage: "Hi! I'm TechBot, your AI assistant for TechCorp Solutions. How can I help you today?",
  language: 'auto',
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_chatbot_platform');
    console.log('✅ Connected to MongoDB');

    await BusinessConfig.findOneAndUpdate(
      { businessId: DEMO_CONFIG.businessId },
      DEMO_CONFIG,
      { upsert: true, new: true, runValidators: true }
    );

    console.log('✅ Demo business config seeded successfully!');
    console.log(`   Business ID:   ${DEMO_CONFIG.businessId}`);
    console.log(`   Business Name: ${DEMO_CONFIG.businessName}`);
    console.log(`   Industry:      ${DEMO_CONFIG.industry}`);
    console.log(`   Tone:          ${DEMO_CONFIG.tone}`);
    console.log(`   UI Nodes:      ${DEMO_CONFIG.uiFlowTree[0].children.length + 1} top-level nodes`);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
