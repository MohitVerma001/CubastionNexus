const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { query }             = require('../config/database');
const { sendPasswordReset } = require('./email.service');
const { logAudit }          = require('./audit.service');
const config                = require('../config/env');
const { AUDIT_ACTIONS }     = require('../config/constants');

const generateAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role, orgId: user.organisation_id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

const storeRefreshToken = async (userId) => {
  const raw      = crypto.randomBytes(40).toString('hex');
  const hash     = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d

  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hash, expiresAt]
  );
  return raw;
};

const buildOrgObject = (organisation_id, organisation_name) =>
  organisation_id ? { id: organisation_id, name: organisation_name } : null;

const login = async (email, password) => {
  const result = await query(
    `SELECT u.id, u.email, u.name, u.role, u.organisation_id, u.is_active,
            u.password_hash, u.password_changed_at,
            u.failed_login_attempts, u.locked_until,
            o.name AS organisation_name
     FROM users u
     LEFT JOIN organisations o ON o.id = u.organisation_id
     WHERE u.email = $1`,
    [email.toLowerCase()]
  );

  const user = result.rows[0];

  if (!user || !user.is_active) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw { status: 401, message: 'Account temporarily locked. Please try again later.' };
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    await query(
      `UPDATE users
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE WHEN failed_login_attempts + 1 >= 5
                               THEN now() + INTERVAL '15 minutes'
                               ELSE locked_until END
       WHERE id = $1`,
      [user.id]
    );
    throw { status: 401, message: 'Invalid email or password' };
  }

  await query(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = now() WHERE id = $1',
    [user.id]
  );

  const accessToken      = generateAccessToken(user);
  const rawRefreshToken  = await storeRefreshToken(user.id);

  await logAudit({
    action:         AUDIT_ACTIONS.LOGIN,
    actorId:        user.id,
    organisationId: user.organisation_id,
  });

  return {
    token:              accessToken,
    refreshToken:       rawRefreshToken,
    mustChangePassword: user.password_changed_at === null || user.password_changed_at === undefined,
    user: {
      id:              user.id,
      email:           user.email,
      name:            user.name,
      role:            user.role,
      organisation_id: user.organisation_id,
      organisation:    buildOrgObject(user.organisation_id, user.organisation_name),
    },
  };
};

const logout = async (userId, rawRefreshToken) => {
  if (rawRefreshToken) {
    const hash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    await query('DELETE FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2', [userId, hash]);
  }
  await logAudit({ action: AUDIT_ACTIONS.LOGOUT, actorId: userId });
};

const refreshToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) throw { status: 401, message: 'Refresh token required' };

  const hash   = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const result = await query(
    'SELECT user_id FROM refresh_tokens WHERE token_hash = $1 AND expires_at > now()',
    [hash]
  );
  if (!result.rows.length) throw { status: 401, message: 'Invalid or expired refresh token' };

  const { user_id } = result.rows[0];

  await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash]);

  const userRes = await query(
    `SELECT u.id, u.email, u.name, u.role, u.organisation_id, u.is_active,
            o.name AS organisation_name
     FROM users u
     LEFT JOIN organisations o ON o.id = u.organisation_id
     WHERE u.id = $1`,
    [user_id]
  );
  const user = userRes.rows[0];
  if (!user || !user.is_active) throw { status: 401, message: 'User not found or inactive' };

  const accessToken   = generateAccessToken(user);
  const newRawRefresh = await storeRefreshToken(user.id);

  return {
    token:        accessToken,
    refreshToken: newRawRefresh,
    user: {
      id:              user.id,
      email:           user.email,
      name:            user.name,
      role:            user.role,
      organisation_id: user.organisation_id,
      organisation:    buildOrgObject(user.organisation_id, user.organisation_name),
    },
  };
};

const getMe = async (userId) => {
  const result = await query(
    `SELECT u.id, u.email, u.name, u.role, u.organisation_id,
            u.password_changed_at, u.created_at,
            o.name AS organisation_name
     FROM users u
     LEFT JOIN organisations o ON o.id = u.organisation_id
     WHERE u.id = $1`,
    [userId]
  );
  if (!result.rows.length) throw { status: 404, message: 'User not found' };
  const row = result.rows[0];
  return {
    id:                  row.id,
    email:               row.email,
    name:                row.name,
    role:                row.role,
    organisation_id:     row.organisation_id,
    password_changed_at: row.password_changed_at,
    created_at:          row.created_at,
    organisation:        buildOrgObject(row.organisation_id, row.organisation_name),
  };
};

const forgotPassword = async (email) => {
  const result = await query(
    'SELECT id, email, name FROM users WHERE email = $1 AND is_active = true',
    [email.toLowerCase()]
  );
  if (!result.rows.length) return; // silent — prevents email enumeration

  const user      = result.rows[0];
  const rawToken  = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET token_hash = $2, expires_at = $3`,
    [user.id, tokenHash, expiresAt]
  );

  await sendPasswordReset(user.email, user.name, rawToken);
};

const resetPassword = async (rawToken, newPassword) => {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const result = await query(
    'SELECT user_id FROM password_reset_tokens WHERE token_hash = $1 AND expires_at > now()',
    [tokenHash]
  );
  if (!result.rows.length) throw { status: 400, message: 'Invalid or expired reset token' };

  const { user_id } = result.rows[0];
  const hash = await bcrypt.hash(newPassword, 12);

  await query(
    'UPDATE users SET password_hash = $1, password_changed_at = now(), updated_at = now() WHERE id = $2',
    [hash, user_id]
  );
  await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user_id]);

  await logAudit({ action: AUDIT_ACTIONS.PASSWORD_RESET, actorId: user_id });
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  const valid  = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!valid) throw { status: 400, message: 'Current password is incorrect' };

  const hash = await bcrypt.hash(newPassword, 12);
  await query(
    'UPDATE users SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW() WHERE id = $2',
    [hash, userId]
  );

  await logAudit({
    action:         AUDIT_ACTIONS.PASSWORD_CHANGED,
    actorId:        userId,
    organisationId: null,
    ticketId:       null,
    newValue:       { password_changed_at: new Date().toISOString() },
  });
};

module.exports = { login, logout, refreshToken, getMe, forgotPassword, resetPassword, changePassword };
