const { createLogger, format, transports } = require('winston');
const path = require('path');

const SENSITIVE_FIELDS = new Set([
  'password', 'password_hash', 'token',
  'description', 'body', 'email_body',
]);

// Remove or redact sensitive keys anywhere they appear in the log info object.
const redactSensitive = format((info) => {
  const scrub = (obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    for (const key of Object.keys(obj)) {
      if (SENSITIVE_FIELDS.has(key)) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        scrub(obj[key]);
      }
    }
  };
  scrub(info);
  return info;
});

const baseFormat = format.combine(
  redactSensitive(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat()
);

const isDev = process.env.NODE_ENV !== 'production';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(baseFormat, format.json()),
  transports: [
    new transports.File({
      filename: path.join('logs', 'error.log'),
      level:    'error',
    }),
    new transports.File({
      filename: path.join('logs', 'app.log'),
    }),
    new transports.Console({
      format: isDev
        ? format.combine(baseFormat, format.colorize(), format.simple())
        : format.combine(baseFormat, format.simple()),
    }),
  ],
});

module.exports = logger;
