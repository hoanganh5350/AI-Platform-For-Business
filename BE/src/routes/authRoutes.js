const express = require('express');
const authController = require('../controllers/authController');
const userManagementController = require('../controllers/userManagementController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/seed', authController.seedSystemAdmin);
router.post('/register-business', userManagementController.registerBusiness); // Public — no auth needed
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
