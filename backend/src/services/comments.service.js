const { query }         = require('../config/database');
const { logAudit }      = require('./audit.service');
const { AUDIT_ACTIONS } = require('../config/constants');
const { onAgentReply }  = require('./notifications.service');

const assertTicketAccess = async (ticketId, tenantId, userId, role) => {
  const conditions = ['id = $1'];
  const params     = [ticketId];
  if (tenantId) { conditions.push('organisation_id = $2'); params.push(tenantId); }

  const res = await query(
    `SELECT id, submitted_by_id FROM tickets WHERE ${conditions.join(' AND ')}`,
    params
  );
  if (!res.rows.length) throw { status: 404, message: 'Ticket not found' };
  if (role === 'customer' && res.rows[0].submitted_by_id !== userId) {
    throw { status: 403, message: 'Access denied' };
  }
};

const getComments = async (ticketId, tenantId, userId, role) => {
  await assertTicketAccess(ticketId, tenantId, userId, role);
  const isStaff = role === 'agent' || role === 'admin';

  const result = await query(
    `SELECT c.*, u.id AS author_id, u.name AS author_name, u.role AS author_role
     FROM ticket_comments c
     LEFT JOIN users u ON u.id = c.author_id
     WHERE c.ticket_id = $1 ${isStaff ? '' : 'AND c.is_internal = false'}
     ORDER BY c.created_at ASC`,
    [ticketId]
  );

  return result.rows.map(row => ({
    id: row.id,
    ticket_id: row.ticket_id,
    body: row.body,
    is_internal: row.is_internal,
    source: row.source,
    created_at: row.created_at,
    author: {
      id: row.author_id,
      name: row.author_name,
      role: row.author_role,
    },
  }));
};

const addComment = async (ticketId, body, isInternal, tenantId, userId, role) => {
  await assertTicketAccess(ticketId, tenantId, userId, role);
  if (isInternal && role === 'customer') {
    throw { status: 403, message: 'Customers cannot post internal notes' };
  }

  // Resolve organisation_id for the comment
  const orgRes = await query('SELECT organisation_id FROM tickets WHERE id = $1', [ticketId]);
  const organisationId = tenantId || orgRes.rows[0]?.organisation_id;

  const result = await query(
    `INSERT INTO ticket_comments (ticket_id, organisation_id, author_id, body, is_internal)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [ticketId, organisationId, userId, body, isInternal || false]
  );

  await query('UPDATE tickets SET updated_at = now() WHERE id = $1', [ticketId]);
  await logAudit({
    action:         AUDIT_ACTIONS.COMMENT_ADDED,
    actorId:        userId,
    organisationId: organisationId,
    ticketId:       ticketId,
  });

  if ((role === 'agent' || role === 'admin') && !isInternal) {
    const ticketRes = await query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (ticketRes.rows.length) {
      onAgentReply(ticketRes.rows[0], ticketRes.rows[0].submitted_by_id);
    }
  }

  return result.rows[0];
};

module.exports = { getComments, addComment };
