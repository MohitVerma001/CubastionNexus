const jwt    = require('jsonwebtoken');
const config = require('../config/env');
const { query } = require('../config/database');

// Columns we need on req.user — deliberately excludes password_hash.
const USER_COLUMNS = `
  id, email, name, role,
  organisation_id, is_active,
  password_changed_at, failed_login_attempts, locked_until
`;

/**
 * Extract a raw JWT string from the request.
 * Priority: Authorization: Bearer <token>  →  cookie access_token
 */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }
  return null;
};

/**
 * Verify a JWT and return its payload, or throw a categorised error.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const e = new Error('Session expired');
      e.status = 401;
      e.code   = 'TOKEN_EXPIRED';
      throw e;
    }
    const e = new Error('Invalid token');
    e.status = 401;
    e.code   = 'TOKEN_INVALID';
    throw e;
  }
};

/**
 * authenticate
 *
 * Verifies the JWT on every protected route.
 * On success: attaches req.user (full user row) and req.orgId.
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ success: false, message: err.message });
    }

    const result = await query(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
      [payload.sub]
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    req.user  = user;
    req.orgId = user.organisation_id; // null for agent/admin, UUID for customer

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };
