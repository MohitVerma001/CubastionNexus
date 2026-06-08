const { query } = require('../config/database');
const logger    = require('../utils/logger');
const { paginate, paginatedResponse } = require('../utils/pagination');

/**
 * logAudit — fire-and-forget audit entry.
 * Never throws; errors are logged and swallowed so they don't affect the request.
 */
const logAudit = async ({ action, actorId, organisationId, ticketId, oldValue, newValue }) => {
  try {
    await query(
      `INSERT INTO audit_logs (action, actor_id, organisation_id, ticket_id, old_value, new_value)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        action,
        actorId        || null,
        organisationId || null,
        ticketId       || null,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
      ]
    );
  } catch (err) {
    logger.error('Audit log write failed', { message: err.message });
  }
};

const getAuditLogs = async (filters, tenantId) => {
  const { page, limit, offset } = paginate(filters);
  const conditions = [];
  const params     = [];
  let   idx        = 1;

  if (tenantId) { conditions.push(`al.organisation_id = $${idx++}`); params.push(tenantId); }
  if (filters.ticket_id) { conditions.push(`al.ticket_id = $${idx++}`);   params.push(filters.ticket_id); }
  if (filters.action)    { conditions.push(`al.action    = $${idx++}`);   params.push(filters.action);    }
  if (filters.actor_id)  { conditions.push(`al.actor_id  = $${idx++}`);   params.push(filters.actor_id);  }
  if (filters.from_date) { conditions.push(`al.created_at >= $${idx++}`); params.push(filters.from_date); }
  if (filters.to_date)   { conditions.push(`al.created_at <= $${idx++}`); params.push(filters.to_date);   }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRes, dataRes] = await Promise.all([
    query(`SELECT COUNT(*) FROM audit_logs al ${where}`, params),
    query(
      `SELECT al.*, u.name AS actor_name, u.email AS actor_email
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.actor_id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    ),
  ]);

  return paginatedResponse(
    dataRes.rows,
    parseInt(countRes.rows[0].count, 10),
    page,
    limit
  );
};

module.exports = { logAudit, getAuditLogs };
