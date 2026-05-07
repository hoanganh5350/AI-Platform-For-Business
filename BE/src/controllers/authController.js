const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123';

const authController = {
  login: async (req, res) => {
    try {
      const { userName, password } = req.body;
      if (!userName || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp userName và password' });
      }

      const user = await User.findOne({ userName });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' });
      }

      if (user.status !== 'Active') {
        return res.status(403).json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' });
      }

      const token = jwt.sign(
        { userId: user._id, userName: user.userName, role: user.role, businessId: user.businessId },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            userName: user.userName,
            role: user.role,
            businessId: user.businessId,
          },
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  seedSystemAdmin: async (req, res) => {
    try {
      // Endpoint để tự động tạo tài khoản ADMIN_SYSTEM ban đầu (chỉ dùng một lần)
      const existingSystemAdmin = await User.findOne({ role: 'ADMIN_SYSTEM' });
      if (existingSystemAdmin) {
        return res.status(400).json({ success: false, message: 'System Admin already exists' });
      }

      const hashedPassword = await bcrypt.hash('admin@123', 10);
      const newAdmin = new User({
        userName: 'system_admin',
        password: hashedPassword,
        role: 'ADMIN_SYSTEM',
        createdBy: 'system',
      });

      await newAdmin.save();
      return res.json({ success: true, message: 'Created system_admin successfully', userName: 'system_admin', password: 'admin@123' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error creating system admin' });
    }
  },

  getCurrentUser: async (req, res) => {
    return res.json({ success: true, data: req.user });
  }
};

module.exports = authController;
