const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query }         = require('../config/database');
const { logAudit }      = require('./audit.service');
const { sendWelcomeEmail, sendPasswordReset, sendEmail } = require('./email.service');
const config = require('../config/env');
const { AUDIT_ACTIONS } = require('../config/constants');
const { paginate }      = require('../utils/pagination');

const mapUser = (row) => ({
  ...row,
  organisation: row.organisation_id
    ? { id: row.organisation_id, name: row.organisation_name }
    : null,
  department: row.department_id
    ? { id: row.department_id, name: row.department_name }
    : null,
});

const getUser = async (userId, tenantId) => {
  const conditions = ['u.id = $1'];
  const params     = [userId];
  if (tenantId) { conditions.push('u.organisation_id = $2'); params.push(tenantId); }

  const result = await query(
    `SELECT u.id, u.email, u.name, u.role, u.is_active,
            u.organisation_id, u.department_id, u.last_login_at, u.created_at,
            o.name AS organisation_name,
            d.name AS department_name
     FROM users u
     LEFT JOIN organisations o ON o.id = u.organisation_id
     LEFT JOIN departments   d ON d.id = u.department_id
     WHERE ${conditions.join(' AND ')}`,
    params
  );
  if (!result.rows.length) throw { status: 404, message: 'User not found' };
  return mapUser(result.rows[0]);
};

const getUsers = async (filters, tenantId) => {
  const { page, limit, offset } = paginate(filters);
  const conditions = [];
  const params     = [];
  let idx = 1;

  if (tenantId)              { conditions.push(`u.organisation_id = $${idx++}`);                       params.push(tenantId); }
  if (filters.role)          { conditions.push(`u.role = $${idx++}`);                                  params.push(filters.role); }
  if (filters.organisation_id) { conditions.push(`u.organisation_id = $${idx++}`);                    params.push(filters.organisation_id); }
  if (filters.is_active !== undefined) {
    conditions.push(`u.is_active = $${idx++}`);
    params.push(filters.is_active === 'true' || filters.is_active === true);
  }
  if (filters.search) {
    conditions.push(`(u.name ILIKE $${idx} OR u.email ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRes, dataRes] = await Promise.all([
    query(`SELECT COUNT(*) FROM users u ${where}`, params),
    query(
      `SELECT u.id, u.email, u.name, u.role, u.is_active,
              u.organisation_id, u.department_id, u.last_login_at, u.created_at,
              o.name AS organisation_name,
              d.name AS department_name
       FROM users u
       LEFT JOIN organisations o ON o.id = u.organisation_id
       LEFT JOIN departments   d ON d.id = u.department_id
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    ),
  ]);

  return {
    users: dataRes.rows.map(mapUser),
    total: parseInt(countRes.rows[0].count, 10),
  };
};

const createUser = async (data, createdBy, tenantId) => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  const plainPassword = data.password ||
    Array.from({ length: 12 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  const hash = await bcrypt.hash(plainPassword, 12);
  const deptId = (data.role === 'agent' && data.department_id &&
    data.department_id.trim() !== '')
    ? data.department_id
    : null;
  const orgId = (data.organisation_id && data.organisation_id.trim() !== '')
    ? data.organisation_id
    : (tenantId || null);

  const result = await query(
    `INSERT INTO users (email, name, role, organisation_id, department_id, password_hash, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, true)
     RETURNING id, email, name, role, organisation_id, department_id, is_active, created_at`,
    [data.email.toLowerCase(), data.name, data.role, orgId, deptId, hash]
  );

  const user = result.rows[0];
  await logAudit({
    action:         AUDIT_ACTIONS.USER_CREATED,
    actorId:        createdBy,
    organisationId: tenantId || orgId,
    newValue:       { email: user.email, role: user.role },
  });
  await sendWelcomeEmail(user.email, user.name, plainPassword);
  return user;
};

const updateUser = async (userId, data, tenantId, updatedBy) => {
  const conditions = ['id = $1'];
  const checkParams = [userId];
  if (tenantId) { conditions.push('organisation_id = $2'); checkParams.push(tenantId); }

  const existing = await query(
    `SELECT * FROM users WHERE ${conditions.join(' AND ')}`,
    checkParams
  );
  if (!existing.rows.length) throw { status: 404, message: 'User not found' };

  const ALLOWED = ['name', 'role', 'is_active', 'department_id'];
  const setClauses = [];
  const values     = [];
  let   idx        = 1;

  for (const field of ALLOWED) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = $${idx++}`);
      values.push(data[field]);
    }
  }
  if (!setClauses.length) throw { status: 400, message: 'No valid fields to update' };

  const whereConditions = [`id = $${idx++}`];
  values.push(userId);
  if (tenantId) { whereConditions.push(`organisation_id = $${idx++}`); values.push(tenantId); }

  const result = await query(
    `UPDATE users SET ${setClauses.join(', ')}
     WHERE ${whereConditions.join(' AND ')}
     RETURNING id, email, name, role, is_active, organisation_id, department_id`,
    values
  );

  await logAudit({
    action:         AUDIT_ACTIONS.USER_UPDATED,
    actorId:        updatedBy,
    organisationId: tenantId,
    oldValue:       { name: existing.rows[0].name, role: existing.rows[0].role },
    newValue:       { name: result.rows[0].name,   role: result.rows[0].role },
  });
  return result.rows[0];
};

const deactivateUser = async (userId, tenantId, deactivatedBy) => {
  const conditions = ['id = $1'];
  const params     = [userId];
  if (tenantId) { conditions.push('organisation_id = $2'); params.push(tenantId); }

  const result = await query(
    `UPDATE users SET is_active = false
     WHERE ${conditions.join(' AND ')} RETURNING id`,
    params
  );
  if (!result.rows.length) throw { status: 404, message: 'User not found' };

  await logAudit({
    action:         AUDIT_ACTIONS.USER_DEACTIVATED,
    actorId:        deactivatedBy,
    organisationId: tenantId,
  });
};

const resetUserPassword = async (userId, tenantId) => {
  const conditions = ['id = $1', 'is_active = true'];
  const params     = [userId];
  if (tenantId) { conditions.push('organisation_id = $2'); params.push(tenantId); }

  const userRes = await query(
    `SELECT email, name FROM users WHERE ${conditions.join(' AND ')}`,
    params
  );
  if (!userRes.rows.length) throw { status: 404, message: 'User not found' };

  const { email, name } = userRes.rows[0];

  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  const tempPassword = Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  const hash = await bcrypt.hash(tempPassword, 12);

  await query(
    `UPDATE users SET password_hash = $1, password_changed_at = NULL, updated_at = now()
     WHERE id = $2`,
    [hash, userId]
  );

  await sendEmail(
    email,
    'Your Cubastion Nexus password has been reset',
    `<p>Hi ${name},</p>
     <p>Your password has been reset by an administrator.</p>
     <p>Your temporary password is: <strong>${tempPassword}</strong></p>
     <p>Please <a href="${config.server.frontendUrl}/login">log in</a> and change your password immediately.</p>
     <p>If you did not expect this change, please contact your administrator.</p>`
  );
};

module.exports = { getUser, getUsers, createUser, updateUser, deactivateUser, resetUserPassword };
