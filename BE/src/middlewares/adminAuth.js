'use strict';

/**
 * Admin API key authentication middleware
 */
const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    return res.status(500).json({ success: false, message: 'Admin API key not configured' });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API key' });
  }

  next();
};

module.exports = adminAuth;
