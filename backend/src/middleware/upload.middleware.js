const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');

const config              = require('../config/env');
const { ALLOWED_FILE_TYPES } = require('../config/constants');

const ALLOWED_MIME_SET = new Set(ALLOWED_FILE_TYPES);

// Ensure the upload directory exists at startup
const uploadDir = path.resolve(process.cwd(), config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Storage ───────────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req,  file, cb) => {
    // uuid + original extension; avoids collisions and path-traversal via dots
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ── File filter ───────────────────────────────────────────────────────────────

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_SET.has(file.mimetype)) {
    return cb(null, true);
  }
  const err  = new Error(
    `Unsupported file type: '${file.mimetype}'. ` +
    `Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}.`
  );
  err.code   = 'INVALID_FILE_TYPE'; // caught by errorHandler
  cb(err, false);
};

// ── Multer instance ───────────────────────────────────────────────────────────

const multerBase = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

// ── Wrap so multer errors reach Express's error-handler via next(err) ─────────

const wrap = (fn) => (req, res, next) => fn(req, res, (err) => {
  if (err) return next(err);
  next();
});

/**
 * uploadSingle — accepts one file in the field named "file"
 * uploadMultiple — accepts up to 5 files in the field named "files"
 */
const uploadSingle   = wrap(multerBase.single('file'));
const uploadMultiple = wrap(multerBase.array('files', 5));

module.exports = { uploadSingle, uploadMultiple };
