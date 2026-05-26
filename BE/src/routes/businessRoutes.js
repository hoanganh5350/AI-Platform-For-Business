'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { authMiddleware, requireRole } = require('../middlewares/auth');
const businessConfigService = require('../services/businessConfigService');
const BusinessConfig = require('../models/BusinessConfig');
const { GoogleGenAI } = require('@google/genai');
const User = require('../models/User');

const router = express.Router();

// Multer — store in memory (max 50MB), filter by MIME type
const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`Định dạng file không hỗ trợ: ${file.mimetype}`));
  },
});

// Gemini client for File API
const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// Helper: verify BUSINESS user owns the given businessId (uses DB to handle stale JWTs)
const checkBusinessOwnership = async (req, businessId) => {
  if (req.user.role !== 'BUSINESS') return true; // ADMIN/ADMIN_SYSTEM always allowed
  const user = await User.findById(req.user.userId).select('businessId');
  return (user?.businessId || req.user.businessId) === businessId;
};

// All routes require JWT auth
router.use(authMiddleware);

/**
 * @route   GET /api/business/my-config
 * @desc    Get the config for the currently logged-in BUSINESS user.
 *          Always looks up the User from DB in case the JWT businessId is stale.
 * @access  BUSINESS role only
 */
router.get('/my-config', requireRole(['BUSINESS']), async (req, res) => {
  try {
    // Always fetch fresh User from DB — JWT businessId may be stale if setup just completed
    const user = await User.findById(req.user.userId).select('businessId');
    const businessId = user?.businessId || req.user.businessId;

    if (!businessId) {
      return res.status(404).json({ success: false, message: 'Tài khoản này chưa liên kết với một doanh nghiệp nào' });
    }
    const config = await businessConfigService.getConfig(businessId);
    return res.json({ success: true, data: config });
  } catch (err) {
    return res.status(404).json({ success: false, message: 'Chưa có cấu hình doanh nghiệp. Vui lòng thiết lập lần đầu.' });
  }
});

/**
 * @route   GET /api/business/config/:businessId
 * @desc    Get config by businessId for the currently logged-in user
 * @access  BUSINESS, ADMIN, ADMIN_SYSTEM roles
 */
router.get('/config/:businessId', requireRole(['BUSINESS', 'ADMIN', 'ADMIN_SYSTEM']), async (req, res) => {
  try {
    const { businessId } = req.params;
    if (req.user.role === 'BUSINESS') {
      // Fetch fresh User from DB to avoid stale JWT businessId
      const user = await User.findById(req.user.userId).select('businessId');
      const userBusinessId = user?.businessId || req.user.businessId;
      if (userBusinessId !== businessId) {
        return res.status(403).json({ success: false, message: 'Không có quyền truy cập config này' });
      }
    }
    const config = await businessConfigService.getConfig(businessId);
    return res.json({ success: true, data: config });
  } catch (err) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy cấu hình doanh nghiệp' });
  }
});

/**
 * @route   PATCH /api/business/config/:businessId/business-info
 * @desc    Update business info fields via JWT (replaces /admin/config/:id/business-info for BUSINESS users)
 */
router.patch('/config/:businessId/business-info', requireRole(['BUSINESS', 'ADMIN', 'ADMIN_SYSTEM']), async (req, res) => {
  try {
    const { businessId } = req.params;
    if (!await checkBusinessOwnership(req, businessId)) {
      return res.status(403).json({ success: false, message: 'Không có quyền cập nhật config này' });
    }
    const config = await businessConfigService.upsertConfig({ businessId, ...req.body });
    return res.json({ success: true, message: 'Cập nhật thông tin doanh nghiệp thành công', data: config });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật thông tin' });
  }
});

/**
 * @route   PATCH /api/business/config/:businessId/description
 * @desc    Update AI description via JWT
 */
router.patch('/config/:businessId/description', requireRole(['BUSINESS', 'ADMIN', 'ADMIN_SYSTEM']), async (req, res) => {
  try {
    const { businessId } = req.params;
    if (!await checkBusinessOwnership(req, businessId)) {
      return res.status(403).json({ success: false, message: 'Không có quyền cập nhật config này' });
    }
    const { description } = req.body;
    const config = await businessConfigService.updateDescription(businessId, description);
    return res.json({ success: true, message: 'Cập nhật mô tả thành công', data: config });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật mô tả' });
  }
});

/**
 * @route   PATCH /api/business/config/:businessId/ui-flow
 * @desc    Update UI flow tree via JWT
 */
router.patch('/config/:businessId/ui-flow', requireRole(['BUSINESS', 'ADMIN', 'ADMIN_SYSTEM']), async (req, res) => {
  try {
    const { businessId } = req.params;
    if (!await checkBusinessOwnership(req, businessId)) {
      return res.status(403).json({ success: false, message: 'Không có quyền cập nhật config này' });
    }
    const { uiFlowTree } = req.body;
    const config = await businessConfigService.updateUIFlowTree(businessId, uiFlowTree);
    return res.json({ success: true, message: 'Cập nhật UI Flow thành công', data: config });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật UI Flow' });
  }
});

/**
 * @route   POST /api/business/setup
 * @desc    Create initial business config for a BUSINESS user (first-time setup).
 *          Ensures businessId in config = businessId in User model = businessId in JWT.
 * @access  BUSINESS role only
 */
router.post('/setup', requireRole(['BUSINESS']), async (req, res) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123';
  try {
    let finalBusinessId = req.user.businessId;

    if (!finalBusinessId) {
      // User has no businessId yet — use the one sent from frontend (generated in SetupWizard)
      finalBusinessId = req.body.businessId;
      if (!finalBusinessId) {
        return res.status(400).json({ success: false, message: 'Thiếu businessId' });
      }
      // Persist the new businessId to the User record so future JWTs are consistent
      await User.findByIdAndUpdate(req.user.userId, { businessId: finalBusinessId });
    }

    // Always save config with the authoritative businessId (from JWT or updated User)
    const payload = { ...req.body, businessId: finalBusinessId };
    const config = await businessConfigService.upsertConfig(payload);

    // Issue a new JWT with the confirmed businessId so the client can update its token
    const updatedUser = await User.findById(req.user.userId).select('-password');
    const newToken = jwt.sign(
      { userId: updatedUser._id, userName: updatedUser.userName, role: updatedUser.role, businessId: finalBusinessId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      message: 'Business config saved successfully',
      data: config,
      token: newToken,                  // Frontend should save this as the new token
      businessId: finalBusinessId,      // Frontend should save this as currentBusinessId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi tạo cấu hình doanh nghiệp' });
  }
});

/**
 * @route   PATCH /api/business/update-config
 * @desc    Update business config fields (business info, description, uiFlow) via JWT
 * @access  BUSINESS role only
 */
router.patch('/update-config/:businessId', requireRole(['BUSINESS']), async (req, res) => {
  try {
    const { businessId } = req.params;
    // Security: BUSINESS can only update their own config
    if (req.user.businessId && req.user.businessId !== businessId) {
      return res.status(403).json({ success: false, message: 'Không có quyền cập nhật config này' });
    }
    const config = await businessConfigService.upsertConfig({ businessId, ...req.body });
    return res.json({ success: true, message: 'Cập nhật thành công', data: config });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật cấu hình' });
  }
});

/**
 * @route   POST /api/business/config/:businessId/documents
 * @desc    Upload a document to Gemini File API and save URI in DB
 * @access  BUSINESS, ADMIN, ADMIN_SYSTEM
 */
router.post(
  '/config/:businessId/documents',
  requireRole(['BUSINESS', 'ADMIN', 'ADMIN_SYSTEM']),
  upload.single('file'),
  async (req, res) => {
    try {
      const { businessId } = req.params;
      if (!await checkBusinessOwnership(req, businessId)) {
        return res.status(403).json({ success: false, message: 'Không có quyền cập nhật config này' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Không có file được gửi lên' });
      }

      const config = await BusinessConfig.findOne({ businessId });
      if (!config) return res.status(404).json({ success: false, message: 'Không tìm thấy cấu hình' });

      // Enforce document limit (max 10)
      if ((config.documents || []).length >= 10) {
        return res.status(400).json({ success: false, message: 'Đã đạt giới hạn tối đa 10 tài liệu' });
      }

      // Upload to Gemini File API
      const fileBuffer = req.file.buffer;
      const mimeType = req.file.mimetype;
      const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

      const uploadedFile = await geminiClient.files.upload({
        file: new Blob([fileBuffer], { type: mimeType }),
        config: {
          mimeType,
          displayName: originalName,
        },
      });

      const newDoc = {
        name: originalName,
        mimeType,
        size: req.file.size,
        uri: uploadedFile.uri,
        geminiName: uploadedFile.name || '',
        uploadedAt: new Date(),
      };

      config.documents = [...(config.documents || []), newDoc];
      await config.save();

      return res.json({ success: true, message: 'Tải lên tài liệu thành công', data: newDoc });
    } catch (err) {
      console.error('[Document Upload Error]', err);
      return res.status(500).json({ success: false, message: err.message || 'Lỗi tải lên tài liệu' });
    }
  }
);

/**
 * @route   DELETE /api/business/config/:businessId/documents/:docIndex
 * @desc    Remove a document from DB (and optionally from Gemini File API)
 * @access  BUSINESS, ADMIN, ADMIN_SYSTEM
 */
router.delete(
  '/config/:businessId/documents/:docIndex',
  requireRole(['BUSINESS', 'ADMIN', 'ADMIN_SYSTEM']),
  async (req, res) => {
    try {
      const { businessId, docIndex } = req.params;
      if (!await checkBusinessOwnership(req, businessId)) {
        return res.status(403).json({ success: false, message: 'Không có quyền xóa tài liệu này' });
      }

      const config = await BusinessConfig.findOne({ businessId });
      if (!config) return res.status(404).json({ success: false, message: 'Không tìm thấy cấu hình' });

      const idx = parseInt(docIndex, 10);
      if (isNaN(idx) || idx < 0 || idx >= (config.documents || []).length) {
        return res.status(400).json({ success: false, message: 'Index tài liệu không hợp lệ' });
      }

      const doc = config.documents[idx];

      // Try to delete from Gemini (best-effort, non-blocking)
      if (doc.geminiName) {
        geminiClient.files.delete({ name: doc.geminiName }).catch((e) => {
          console.warn('[Gemini Delete Warning]', e.message);
        });
      }

      config.documents.splice(idx, 1);
      await config.save();

      return res.json({ success: true, message: 'Xóa tài liệu thành công' });
    } catch (err) {
      console.error('[Document Delete Error]', err);
      return res.status(500).json({ success: false, message: 'Lỗi xóa tài liệu' });
    }
  }
);

module.exports = router;
