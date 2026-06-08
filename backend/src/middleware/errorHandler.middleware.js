const multer = require('multer');
const logger  = require('../utils/logger');

const isProd = () => process.env.NODE_ENV === 'production';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extract the duplicate field name from a PostgreSQL 23505 detail string.
 * Detail example: "Key (email)=(foo@bar.com) already exists."
 */
const extractDuplicateField = (detail = '') => {
  const match = detail.match(/Key \(([^)]+)\)/);
  return match ? match[1] : 'field';
};

/**
 * Strip any sensitive keys from the object before logging it.
 * (logger.js also scrubs these, but this adds a defence-in-depth layer here.)
 */
const SENSITIVE = new Set(['password', 'password_hash', 'token', 'authorization']);

const sanitiseForLog = (obj = {}) => {
  const safe = { ...obj };
  for (const key of Object.keys(safe)) {
    if (SENSITIVE.has(key.toLowerCase())) safe[key] = '[REDACTED]';
  }
  return safe;
};

// ── Global error handler ──────────────────────────────────────────────────────

/**
 * errorHandler
 *
 * Must be the last middleware registered in app.js:
 *   app.use(errorHandler);
 *
 * Covers:
 *   422  express-validator ValidationError    (err.array is a function)
 *   401  JWT errors                           (TokenExpiredError | JsonWebTokenError)
 *   409  PostgreSQL unique violation          (err.code === '23505')
 *   400  PostgreSQL foreign-key violation     (err.code === '23503')
 *   413  Multer file-size limit               (MulterError LIMIT_FILE_SIZE)
 *   415  Multer / custom file-type rejection  (err.code === 'INVALID_FILE_TYPE')
 *   500  Everything else
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {

  // ── 1. express-validator validation errors ─────────────────────────────────
  if (typeof err.array === 'function') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors:  err.array(),
    });
  }

  // ── 2. JWT errors ──────────────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Session expired' });
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // ── 3. PostgreSQL — unique constraint (23505) ──────────────────────────────
  if (err.code === '23505') {
    const field = extractDuplicateField(err.detail);
    return res.status(409).json({
      success: false,
      message: `A record with that ${field} already exists.`,
    });
  }

  // ── 4. PostgreSQL — foreign key violation (23503) ─────────────────────────
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'The referenced record does not exist.',
    });
  }

  // ── 5. Multer — file too large ─────────────────────────────────────────────
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    const limitMB = (require('../config/env').upload.maxFileSize / 1024 / 1024).toFixed(0);
    return res.status(413).json({
      success: false,
      message: `File too large. Maximum allowed size is ${limitMB} MB.`,
    });
  }

  // ── 6. Custom file-type rejection ─────────────────────────────────────────
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(415).json({
      success: false,
      message: err.message, // already human-readable from upload middleware
    });
  }

  // ── 7. Other Multer errors (unexpected field, too many files, etc.) ────────
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // ── 8. Errors with an explicit HTTP status set by route handlers ───────────
  const status = err.status || err.statusCode;
  if (status && status >= 400 && status < 500) {
    return res.status(status).json({ success: false, message: err.message });
  }

  // ── 9. Unhandled / server errors — always log, never expose internals ──────
  logger.error('Unhandled server error', {
    message:  err.message,
    path:     req.path,
    method:   req.method,
    userId:   req.user?.id,
    orgId:    req.orgId,
    headers:  sanitiseForLog(req.headers),
    // stack only in dev; production logs have it via winston errors format
    ...(isProd() ? {} : { stack: err.stack }),
  });

  return res.status(500).json({
    success: false,
    message: isProd()
      ? 'An unexpected error occurred. Please try again later.'
      : err.message,
  });
};

module.exports = { errorHandler };
