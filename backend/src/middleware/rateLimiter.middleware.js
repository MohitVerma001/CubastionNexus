const rateLimit = require('express-rate-limit');

/**
 * authLimiter — login / register endpoints
 * 10 requests per IP per 15 minutes to slow credential-stuffing.
 */
const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            10,
  standardHeaders: true,
  legacyHeaders:  false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
  },
});

/**
 * apiLimiter — all general API routes
 * 300 requests per IP per 15 minutes.
 */
const apiLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            300,
  standardHeaders: true,
  legacyHeaders:  false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

/**
 * strictLimiter — password-reset endpoints
 * 5 requests per IP per hour to limit enumeration and abuse.
 */
const strictLimiter = rateLimit({
  windowMs:       60 * 60 * 1000,
  max:            5,
  standardHeaders: true,
  legacyHeaders:  false,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again in an hour',
  },
});

module.exports = { authLimiter, apiLimiter, strictLimiter };
