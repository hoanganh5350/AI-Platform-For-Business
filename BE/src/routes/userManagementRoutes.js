const express = require('express');
const userManagementController = require('../controllers/userManagementController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Tất cả endpoints đều cần auth
router.use(authMiddleware);

// Dashboard (ADMIN_SYSTEM, ADMIN)
router.get('/dashboard', requireRole(['ADMIN_SYSTEM', 'ADMIN']), userManagementController.getDashboardStats);

// Business View (ADMIN_SYSTEM, ADMIN)
router.get('/businesses', requireRole(['ADMIN_SYSTEM', 'ADMIN']), userManagementController.getBusinesses);

// Admin View (ADMIN_SYSTEM only - as per requirements: "request này chỉ có thể phê duyệt bởi ADMIN_SYSTEM", but typically both can view? 
// The prompt says: "Với role ADMIN_SYSTEM và ADMIN: ... Admin View: Hiển bảng danh sách account admin" - so ADMIN can also view, but only SYSTEM can approve.
router.get('/admins', requireRole(['ADMIN_SYSTEM', 'ADMIN']), userManagementController.getAdmins);

// Request update user
router.put('/users/:targetId/request-update', requireRole(['ADMIN_SYSTEM', 'ADMIN']), userManagementController.requestUpdateUser);

// Create ADMIN account request (needs ADMIN_SYSTEM approval to activate)
router.post('/create-admin', requireRole(['ADMIN_SYSTEM', 'ADMIN']), userManagementController.createAdminRequest);

// Approval Requests View (ADMIN_SYSTEM, ADMIN)
router.get('/requests', requireRole(['ADMIN_SYSTEM', 'ADMIN']), userManagementController.getApprovalRequests);

// Handle Request (Approve/Reject)
router.post('/requests/:requestId/handle', requireRole(['ADMIN_SYSTEM', 'ADMIN']), userManagementController.handleRequest);

module.exports = router;
