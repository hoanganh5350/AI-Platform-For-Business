'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');
const aiConfig = require('../config/ai');
const { authMiddleware, requireRole } = require('../middlewares/auth');
const businessConfigService = require('../services/businessConfigService');
const BusinessConfig = require('../models/BusinessConfig');
const User = require('../models/User');

// Lazy Gemini client for OCR fallback (only instantiated when needed)
let _geminiOcrClient = null;
const getGeminiClient = () => {
  if (!_geminiOcrClient) _geminiOcrClient = new GoogleGenAI({ apiKey: aiConfig.gemini.apiKey });
  return _geminiOcrClient;
};

/**
 * OCR fallback: Upload PDF to Gemini File API → extract all text → delete from Gemini.
 * Used when pdf-parse cannot extract sufficient text (scanned/image PDFs).
 */
const extractTextViaGeminiOCR = async (fileBuffer, mimeType, fileName) => {
  const gemini = getGeminiClient();
  let uploadedFile = null;
  try {
    // Upload to Gemini File API (temporary, will be deleted after extraction)
    const blob = new Blob([fileBuffer], { type: mimeType });
    uploadedFile = await gemini.files.upload({
      file: blob,
      config: { mimeType, displayName: fileName },
    });

    // Wait for file to be ACTIVE
    let fileStatus = uploadedFile;
    let retries = 0;
    while (fileStatus.state === 'PROCESSING' && retries < 10) {
      await new Promise(r => setTimeout(r, 2000));
      fileStatus = await gemini.files.get(uploadedFile.name);
      retries++;
    }

    if (fileStatus.state !== 'ACTIVE') {
      throw new Error(`Gemini file processing failed: ${fileStatus.state}`);
    }

    // Ask Gemini to extract all text from the document
    const chat = gemini.chats.create({ model: aiConfig.gemini.model || 'gemini-2.5-flash' });
    const response = await chat.sendMessage({
      message: [
        { fileData: { mimeType, fileUri: fileStatus.uri } },
        { text: 'Please extract ALL text content from this document verbatim. Return only the extracted text, no commentary, no formatting markers. Preserve paragraphs and line breaks as found in the original.' },
      ],
    });

    return response.text || '';
  } finally {
    // Always clean up: delete from Gemini immediately after extraction
    if (uploadedFile?.name) {
      try {
        await gemini.files.delete(uploadedFile.name);
        console.info(`[OCR] Deleted temporary Gemini file: ${uploadedFile.name}`);
      } catch (delErr) {
        console.warn(`[OCR] Could not delete Gemini file ${uploadedFile.name}: ${delErr.message}`);
      }
    }
  }
};

const router = express.Router();

// Multer — store in memory (max 50MB), filter by MIME type
const ALLOWED_MIME = [
  'application/pdf',
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
 * @desc    Upload a document and extract its text content for permanent storage in MongoDB.
 *          All formats (PDF, DOCX, TXT) are extracted server-side — NO Gemini File API dependency.
 *          This ensures knowledge base documents never expire (Gemini File API deletes after 48h).
 *
 *          Extraction strategy:
 *            - DOCX → mammoth (extracts clean raw text from Word documents)
 *            - PDF  → pdf-parse (extracts text layer from PDF files)
 *            - TXT  → UTF-8 decode from buffer directly
 *
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

      const fileBuffer = req.file.buffer;
      const mimeType = req.file.mimetype;
      const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

      let extractedText = '';

      // ── DOCX: extract via mammoth ─────────────────────────────────────────────
      if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value || '';
        console.info(`[DocumentUpload] DOCX extracted ${extractedText.length} chars from "${originalName}"`);

      // ── PDF: extract via pdf-parse, fallback to Gemini OCR for scanned PDFs ──────
      } else if (mimeType === 'application/pdf') {
        const parsed = await pdfParse(fileBuffer);
        const numPages = parsed.numpages || 1;
        extractedText = parsed.text || '';
        console.info(`[DocumentUpload] PDF (pdf-parse) extracted ${extractedText.length} chars from "${originalName}" (${numPages} pages)`);

        // Heuristic: < 50 chars/page likely means scanned/image-based PDF → use Gemini OCR
        const charsPerPage = extractedText.trim().length / numPages;
        if (charsPerPage < 50) {
          console.info(`[DocumentUpload] PDF appears scanned (${Math.round(charsPerPage)} chars/page). Falling back to Gemini OCR for "${originalName}"...`);
          const ocrText = await extractTextViaGeminiOCR(fileBuffer, mimeType, originalName);
          if (ocrText.trim().length > extractedText.trim().length) {
            extractedText = ocrText;
            console.info(`[DocumentUpload] Gemini OCR extracted ${extractedText.length} chars from "${originalName}"`);
          }
        }

      // ── TXT: decode buffer directly ───────────────────────────────────────────
      } else if (mimeType === 'text/plain') {
        extractedText = fileBuffer.toString('utf8');
        console.info(`[DocumentUpload] TXT decoded ${extractedText.length} chars from "${originalName}"`);
      }

      if (!extractedText.trim()) {
        return res.status(422).json({
          success: false,
          message: 'Không thể trích xuất nội dung từ tài liệu này. File có thể bị scan dạng ảnh hoặc bị bảo vệ.',
        });
      }

      const newDoc = {
        name: originalName,
        mimeType,
        size: req.file.size,
        extractedText,           // ✅ Stored permanently in MongoDB — no expiry
        uploadedAt: new Date(),
      };

      config.documents = [...(config.documents || []), newDoc];
      await config.save();

      // Return doc info without the full extractedText (may be very large)
      const { extractedText: _omit, ...docInfo } = newDoc;
      return res.json({
        success: true,
        message: `Tải lên và trích xuất tài liệu thành công (${extractedText.length.toLocaleString()} ký tự)`,
        data: { ...docInfo, charCount: extractedText.length },
      });
    } catch (err) {
      console.error('[Document Upload Error]', err);
      return res.status(500).json({ success: false, message: err.message || 'Lỗi tải lên tài liệu' });
    }
  }
);

/**
 * @route   DELETE /api/business/config/:businessId/documents/:docIndex
 * @desc    Remove a document from DB by index.
 *          Documents are stored as extractedText in MongoDB — no Gemini File API cleanup needed.
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
