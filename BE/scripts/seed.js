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
  description: `TechCorp Solutions is a leading enterprise software company founded in 2010.
We provide cloud-based ERP systems, CRM platforms, and data analytics tools for mid-to-large enterprises.

Our flagship products:
- TechCorp ERP: Full-suite enterprise resource planning
- TechCorp CRM: Customer relationship management with AI-powered insights
- TechCorp Analytics: Real-time business intelligence dashboard

Pricing: Plans start at $299/month (Starter), $799/month (Professional), $1999/month (Enterprise).
Support: 24/7 email support, business-hours live chat, dedicated account manager for Enterprise.
Office: San Francisco, CA. Remote-first company with teams in 12 countries.

Contact: support@techcorp.example.com | sales@techcorp.example.com | +1 (800) 555-0199`,
  uiFlowTree: [
    {
      id: 'home',
      label: 'Home',
      description: 'Main landing page',
      path: '/',
      children: [
        {
          id: 'products',
          label: 'Products',
          description: 'Overview of all products',
          path: '/products',
          children: [
            { id: 'erp', label: 'TechCorp ERP', description: 'Enterprise resource planning', path: '/products/erp', children: [] },
            { id: 'crm', label: 'TechCorp CRM', description: 'Customer relationship management', path: '/products/crm', children: [] },
            { id: 'analytics', label: 'TechCorp Analytics', description: 'Business intelligence', path: '/products/analytics', children: [] },
          ],
        },
        {
          id: 'pricing',
          label: 'Pricing',
          description: 'Subscription plans and pricing',
          path: '/pricing',
          children: [],
        },
        {
          id: 'contact',
          label: 'Contact Us',
          description: 'Get in touch with our team',
          path: '/contact',
          action: 'open_contact_form',
          children: [],
        },
        {
          id: 'demo',
          label: 'Request Demo',
          description: 'Schedule a product demo',
          path: '/demo',
          action: 'open_demo_form',
          children: [],
        },
        {
          id: 'support',
          label: 'Support Center',
          description: 'Help articles, tickets, and live chat',
          path: '/support',
          children: [
            { id: 'docs', label: 'Documentation', path: '/support/docs', children: [] },
            { id: 'ticket', label: 'Submit Ticket', path: '/support/ticket', action: 'open_ticket_form', children: [] },
          ],
        },
      ],
    },
  ],
  chatbotName: 'TechBot',
  welcomeMessage: 'Hi! I\'m TechBot, your AI assistant for TechCorp Solutions. How can I help you today?',
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
    console.log(`   Business ID: ${DEMO_CONFIG.businessId}`);
    console.log(`   Business Name: ${DEMO_CONFIG.businessName}`);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
