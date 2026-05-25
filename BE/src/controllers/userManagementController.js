const User = require('../models/User');
const ApprovalRequest = require('../models/ApprovalRequest');
const BusinessConfig = require('../models/BusinessConfig');
const socketManager = require('../utils/socketManager');

const ROLES_HIERARCHY = {
  ADMIN_SYSTEM: 3,
  ADMIN: 2,
  BUSINESS: 1,
};

const userManagementController = {
  // ─── DASHBOARD ─────────────────────────────────────────────────────────────
  getDashboardStats: async (req, res) => {
    try {
      const period = req.query.period || 'month'; // 'day', 'month', 'year'
      
      let dateFrom = new Date();
      let groupId = {};
      
      if (period === 'day') {
        dateFrom.setDate(dateFrom.getDate() - 30); // Last 30 days
        groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
      } else if (period === 'year') {
        dateFrom.setFullYear(dateFrom.getFullYear() - 5); // Last 5 years
        groupId = { year: { $year: '$createdAt' } };
      } else {
        // Default to 'month'
        dateFrom.setMonth(dateFrom.getMonth() - 12); // Last 12 months
        groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
      }

      const signups = await User.aggregate([
        { $match: { role: 'BUSINESS', createdAt: { $gte: dateFrom } } },
        {
          $group: {
            _id: groupId,
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]);

      const formattedSignups = signups.map((item) => {
        let label = '';
        if (period === 'day') {
          label = `${item._id.day}/${item._id.month}/${item._id.year}`;
        } else if (period === 'year') {
          label = `${item._id.year}`;
        } else {
          label = `${item._id.month}/${item._id.year}`;
        }
        return {
          month: label, // keeping the key as 'month' to not break frontend typing heavily, or can change it to 'label'
          count: item.count,
        };
      });

      // 2. Industries Pie Chart
      const industries = await BusinessConfig.aggregate([
        { $group: { _id: '$industry', count: { $sum: 1 } } },
      ]);
      const formattedIndustries = industries.map((item) => ({
        industry: item._id || 'Unknown',
        count: item.count,
      }));

      // 3. Chatbot usage pie chart (Activated vs Not Activated based on existence of businessId)
      const activatedCount = await User.countDocuments({
        role: 'BUSINESS',
        businessId: { $exists: true, $ne: null, $ne: '' }
      });
      const totalBusinessUsers = await User.countDocuments({ role: 'BUSINESS' });
      const chatbotUsage = [
        { label: 'Activated', count: activatedCount },
        { label: 'Not Activated', count: Math.max(0, totalBusinessUsers - activatedCount) },
      ];


      res.json({
        success: true,
        data: {
          signupsPerMonth: formattedSignups,
          industries: formattedIndustries,
          chatbotUsage,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu dashboard' });
    }
  },

  // ─── BUSINESS VIEW ─────────────────────────────────────────────────────────
  getBusinesses: async (req, res) => {
    try {
      const users = await User.find({ role: 'BUSINESS' }).select('-password').sort({ createdAt: -1 }).lean();
      
      const businessIds = users.map(u => u.businessId).filter(Boolean);
      const configs = await BusinessConfig.find({ businessId: { $in: businessIds } }).lean();
      const configMap = new Map(configs.map(c => [c.businessId, c]));

      const enrichedUsers = users.map(user => {
        if (user.businessId) {
          const config = configMap.get(user.businessId);
          if (config) {
            return {
              ...user,
              email: user.email || config.email || '',
              phone: user.phone || config.phone || '',
            };
          }
        }
        return user;
      });

      res.json({ success: true, data: enrichedUsers });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi lấy danh sách business' });
    }
  },

  // ─── ADMIN VIEW ────────────────────────────────────────────────────────────
  getAdmins: async (req, res) => {
    try {
      const admins = await User.find({ role: 'ADMIN' }).select('-password').sort({ createdAt: -1 });
      res.json({ success: true, data: admins });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi lấy danh sách admin' });
    }
  },

  // ─── CREATE UPDATE REQUEST ──────────────────────────────────────────────────
  requestUpdateUser: async (req, res) => {
    try {
      const { targetId } = req.params;
      const payload = req.body;
      const currentUser = req.user;

      const targetUser = await User.findById(targetId);
      if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

      const currentUserLevel = ROLES_HIERARCHY[currentUser.role];
      const targetUserLevel = ROLES_HIERARCHY[targetUser.role];

      if (currentUserLevel <= targetUserLevel && currentUser.userId !== targetId) {
        return res.status(403).json({ success: false, message: 'Không đủ quyền tạo request update user này' });
      }

      const request = new ApprovalRequest({
        requestId: `REQ-${Date.now()}`,
        targetId: targetUser._id,
        targetType: targetUser.role,
        action: 'UPDATE',
        payload,
        createdBy: currentUser.userName,
      });

      await request.save();

      // Notify admins via Socket.IO
      socketManager.emitNewRequest({
        requestId: request.requestId,
        action: 'UPDATE',
        targetType: targetUser.role,
        createdBy: currentUser.userName,
        targetName: targetUser.userName,
        message: `Yêu cầu cập nhật tài khoản "${targetUser.userName}" bởi ${currentUser.userName}`,
      });

      res.json({ success: true, message: 'Tạo request update thành công', data: request });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi tạo request' });
    }
  },

  // ─── REGISTER BUSINESS (Public) ────────────────────────────────────────────
  registerBusiness: async (req, res) => {
    try {
      const { userName, password, businessName } = req.body;
      if (!userName || !password || !businessName) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ: userName, password, businessName' });
      }

      const existing = await User.findOne({ userName });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Tên đăng nhập đã tồn tại' });
      }

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with Inactive status — only activated after approval
      const newUser = new User({
        userName,
        password: hashedPassword,
        role: 'BUSINESS',
        businessName,
        status: 'Inactive',
        createdBy: 'self-register',
      });
      await newUser.save();

      // Create approval request for ADMIN/ADMIN_SYSTEM to review
      const request = new ApprovalRequest({
        requestId: `REG-${Date.now()}`,
        targetId: newUser._id,
        targetType: 'BUSINESS',
        action: 'CREATE',
        payload: { userName, businessName, status: 'Active' },
        createdBy: userName,
      });
      await request.save();

      // Notify admins via Socket.IO
      socketManager.emitNewRequest({
        requestId: request.requestId,
        action: 'CREATE',
        targetType: 'BUSINESS',
        createdBy: userName,
        targetName: userName,
        message: `Doanh nghiệp mới "${businessName}" (${userName}) đã đăng ký, chờ phê duyệt`,
      });

      res.json({ success: true, message: 'Đăng ký thành công! Tài khoản đang chờ phê duyệt từ quản trị viên.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi đăng ký' });
    }
  },

  // ─── CREATE ADMIN REQUEST (by ADMIN/ADMIN_SYSTEM) ──────────────────────────
  createAdminRequest: async (req, res) => {
    try {
      const { userName, password } = req.body;
      const currentUser = req.user;

      if (!userName || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ: userName và password' });
      }

      const existing = await User.findOne({ userName });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Tên đăng nhập đã tồn tại' });
      }

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with Inactive status — only activated after approval
      const newUser = new User({
        userName,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'Inactive',
        createdBy: currentUser.userName,
      });
      await newUser.save();

      // Create approval request — only ADMIN_SYSTEM can approve ADMIN creation
      const request = new ApprovalRequest({
        requestId: `ADM-${Date.now()}`,
        targetId: newUser._id,
        targetType: 'ADMIN',
        action: 'CREATE',
        payload: { userName, status: 'Active' },
        createdBy: currentUser.userName,
      });
      await request.save();

      // Notify admins via Socket.IO
      socketManager.emitNewRequest({
        requestId: request.requestId,
        action: 'CREATE',
        targetType: 'ADMIN',
        createdBy: currentUser.userName,
        targetName: userName,
        message: `Yêu cầu tạo tài khoản Admin "${userName}" bởi ${currentUser.userName}`,
      });

      res.json({ success: true, message: 'Đã tạo request tạo tài khoản ADMIN. Đang chờ ADMIN_SYSTEM phê duyệt.', data: request });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi tạo request' });
    }
  },

  // ─── GET REQUESTS ──────────────────────────────────────────────────────────
  getApprovalRequests: async (req, res) => {
    try {
      const requests = await ApprovalRequest.find().populate('targetId').sort({ createdAt: -1 });
      res.json({ success: true, data: requests });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi lấy danh sách request' });
    }
  },

  // ─── APPROVE / REJECT REQUEST ──────────────────────────────────────────────
  handleRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { action } = req.body; // 'APPROVE' or 'REJECT'
      const currentUser = req.user;

      const request = await ApprovalRequest.findById(requestId);
      if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
      if (request.status !== 'Pending') return res.status(400).json({ success: false, message: 'Request already processed' });

      // Permission Check
      // Request target is ADMIN -> Only ADMIN_SYSTEM can approve
      if (request.targetType === 'ADMIN' && currentUser.role !== 'ADMIN_SYSTEM') {
        return res.status(403).json({ success: false, message: 'Chỉ ADMIN_SYSTEM mới được duyệt request của ADMIN' });
      }
      // Request target is BUSINESS -> ADMIN_SYSTEM and ADMIN can approve
      if (request.targetType === 'BUSINESS' && !['ADMIN_SYSTEM', 'ADMIN'].includes(currentUser.role)) {
        return res.status(403).json({ success: false, message: 'Không đủ quyền duyệt request' });
      }

      if (action === 'REJECT') {
        request.status = 'Rejected';
        request.updatedBy = currentUser.userName;
        await request.save();
        return res.json({ success: true, message: 'Đã từ chối request' });
      }

      if (action === 'APPROVE') {
        if (request.action === 'CREATE') {
          // CREATE action: activate the pending user
          const targetUser = await User.findById(request.targetId);
          if (!targetUser) {
            request.status = 'Rejected';
            await request.save();
            return res.status(404).json({ success: false, message: 'Target user not found' });
          }
          targetUser.status = 'Active';
          targetUser.updatedBy = currentUser.userName;
          await targetUser.save();
        } else {
          // UPDATE action: apply payload fields to user
          const targetUser = await User.findById(request.targetId);
          if (!targetUser) {
            request.status = 'Rejected';
            await request.save();
            return res.status(404).json({ success: false, message: 'Target user not found anymore' });
          }
          Object.assign(targetUser, request.payload);
          targetUser.updatedBy = currentUser.userName;
          await targetUser.save();
        }

        request.status = 'Approved';
        request.updatedBy = currentUser.userName;
        await request.save();
        return res.json({ success: true, message: 'Đã duyệt request thành công' });
      }

      res.status(400).json({ success: false, message: 'Invalid action' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi xử lý request' });
    }
  },
};

module.exports = userManagementController;
