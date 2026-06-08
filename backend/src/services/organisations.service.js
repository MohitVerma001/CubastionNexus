const { query }      = require('../config/database');
const { USER_ROLE }  = require('../config/constants');

const getOrganisations = async (userId, role) => {
  if (role === USER_ROLE.ADMIN) {
    const result = await query(
      `SELECT o.*,
              COUNT(t.id)::int AS ticket_count,
              COUNT(CASE WHEN t.status IN ('open','in_progress','escalated') THEN 1 END)::int AS open
       FROM organisations o
       LEFT JOIN tickets t ON t.organisation_id = o.id
       GROUP BY o.id
       ORDER BY o.name ASC`
    );
    return result.rows;
  }

  const result = await query(
    `SELECT o.* FROM organisations o
     JOIN users u ON u.organisation_id = o.id
     WHERE u.id = $1`,
    [userId]
  );
  return result.rows;
};

const createOrganisation = async (data) => {
  const result = await query(
    `INSERT INTO organisations (name, inbound_email, primary_contact)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.name, data.inbound_email || null, data.primary_contact || null]
  );
  return result.rows[0];
};

const updateOrganisation = async (id, data) => {
  const ALLOWED = ['name', 'inbound_email', 'primary_contact', 'is_active'];
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

  const result = await query(
    `UPDATE organisations SET ${setClauses.join(', ')}
     WHERE id = $${idx} RETURNING *`,
    [...values, id]
  );
  if (!result.rows.length) throw { status: 404, message: 'Organisation not found' };
  return result.rows[0];
};

module.exports = { getOrganisations, createOrganisation, updateOrganisation };
