const { query, getClient }              = require('../config/database');
const { generateTicketId }              = require('../utils/ticketId');
const { addBusinessHours }              = require('../utils/businessHours');
const { logAudit }                      = require('./audit.service');
const { onTicketCreated, onTicketAssigned, onTicketEscalated, onTicketClosed } = require('./notifications.service');
const { TICKET_STATUS, AUDIT_ACTIONS }  = require('../config/constants');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const TICKET_SELECT = `
  SELECT t.*,
         submitter.name  AS submitted_by_name,
         submitter.email AS submitted_by_email,
         agent.name      AS assigned_to_name,
         agent.email     AS assigned_to_email,
         org.name        AS organisation_name
  FROM tickets t
  LEFT JOIN users submitter ON submitter.id = t.submitted_by_id
  LEFT JOIN users agent     ON agent.id     = t.assigned_to_id
  LEFT JOIN organisations org ON org.id     = t.organisation_id`;

const mapTicket = (row) => ({
  ...row,
  organisation: {
    id: row.organisation_id,
    name: row.organisation_name,
  },
  submitted_by: {
    id: row.submitted_by_id,
    name: row.submitted_by_name,
    email: row.submitted_by_email,
  },
  assigned_to: row.assigned_to_id ? {
    id: row.assigned_to_id,
    name: row.assigned_to_name,
    email: row.assigned_to_email,
  } : null,
});

const buildFilters = (filters, tenantId, userId, role) => {
  const conditions = [];
  const params     = [];
  let idx = 1;

  if (tenantId) {
    conditions.push(`t.organisation_id = $${idx++}`);
    params.push(tenantId);
  }
  if (role === 'customer') {
    conditions.push(`t.submitted_by_id = $${idx++}`);
    params.push(userId);
  }
  if (filters.status)      { conditions.push(`t.status = $${idx++}`);          params.push(filters.status); }
  if (filters.priority)    { conditions.push(`t.priority = $${idx++}`);        params.push(filters.priority); }
  if (filters.category)    { conditions.push(`t.category = $${idx++}`);        params.push(filters.category); }
  if (filters.assigned_to) { conditions.push(`t.assigned_to_id = $${idx++}`);  params.push(filters.assigned_to); }
  if (filters.search) {
    conditions.push(`(t.subject ILIKE $${idx} OR t.ticket_number ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx++;
  }
  if (filters.from_date) { conditions.push(`t.created_at >= $${idx++}`); params.push(filters.from_date); }
  if (filters.to_date)   { conditions.push(`t.created_at <= $${idx++}`); params.push(filters.to_date); }

  return { conditions, params, idx };
};

const getTickets = async (filters, tenantId, userId, role) => {
  const { page, limit, offset } = getPagination(filters);
  const { conditions, params, idx } = buildFilters(filters, tenantId, userId, role);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const SORT_COLS = ['created_at', 'updated_at', 'priority', 'status'];
  const sortCol = SORT_COLS.includes(filters.sort_by) ? filters.sort_by : 'created_at';
  const sortDir = filters.sort_dir === 'asc' ? 'ASC' : 'DESC';

  const [countRes, dataRes] = await Promise.all([
    query(`SELECT COUNT(*) FROM tickets t ${where}`, params),
    query(
      `${TICKET_SELECT} ${where} ORDER BY t.${sortCol} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    ),
  ]);

  const total = parseInt(countRes.rows[0].count, 10);
  return {
    tickets:    dataRes.rows.map(mapTicket),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const getTicket = async (ticketId, tenantId, userId, role) => {
  const conditions = ['t.id = $1'];
  const params     = [ticketId];
  if (tenantId) { conditions.push('t.organisation_id = $2'); params.push(tenantId); }

  const result = await query(
    `${TICKET_SELECT} WHERE ${conditions.join(' AND ')}`,
    params
  );
  if (!result.rows.length) throw { status: 404, message: 'Ticket not found' };
  return mapTicket(result.rows[0]);
};

const createTicket = async (data, orgId, userId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const ticketNumber = await generateTicketId((sql, p) => client.query(sql, p));

    const slaRes = await client.query(
      'SELECT first_response_hours, resolution_hours FROM sla_configs WHERE priority = $1',
      [data.priority]
    );

    let slaFirstResponse = null;
    let slaResolution    = null;
    if (slaRes.rows.length) {
      const { first_response_hours, resolution_hours } = slaRes.rows[0];
      slaFirstResponse = addBusinessHours(new Date(), first_response_hours);
      slaResolution    = addBusinessHours(new Date(), resolution_hours);
    }

    const result = await client.query(
      `INSERT INTO tickets
         (ticket_number, organisation_id, submitted_by_id, subject, description,
          priority, category, source, status, sla_first_response_due, sla_resolution_due)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open', $9, $10)
       RETURNING *`,
      [ticketNumber, orgId, userId, data.subject,
       data.description, data.priority, data.category, data.source || 'portal', slaFirstResponse, slaResolution]
    );

    const ticket = result.rows[0];
    await client.query('COMMIT');

    await logAudit({
      action:         AUDIT_ACTIONS.TICKET_CREATED,
      actorId:        userId,
      organisationId: orgId,
      ticketId:       ticket.id,
      newValue:       { subject: ticket.subject, priority: ticket.priority },
    });

    try { onTicketCreated(ticket); } catch (e) {
      require('../utils/logger').error?.('Notification failed', { ticketId: ticket.id });
    }

    return ticket;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateTicket = async (ticketId, data, tenantId, userId, role) => {
  const existing = await getTicket(ticketId, tenantId, userId, role);

  const FIELD_MAP = {
    subject:       'subject',
    description:   'description',
    priority:      'priority',
    category:      'category',
    assigned_to:   'assigned_to_id',
    assigned_to_id:'assigned_to_id',
    status:        'status',
  };

  const setClauses = [];
  const values     = [];
  let   idx        = 1;

  for (const [input, col] of Object.entries(FIELD_MAP)) {
    if (data[input] !== undefined) {
      // deduplicate: skip if the column was already added via an alias
      if (!setClauses.some(c => c.startsWith(`${col} =`))) {
        setClauses.push(`${col} = $${idx++}`);
        values.push(data[input]);
      }
    }
  }
  if (!setClauses.length) throw { status: 400, message: 'No valid fields to update' };

  const conditions = [`id = $${idx++}`];
  values.push(ticketId);
  if (tenantId) { conditions.push(`organisation_id = $${idx++}`); values.push(tenantId); }

  const result = await query(
    `UPDATE tickets SET ${setClauses.join(', ')}, updated_at = now()
     WHERE ${conditions.join(' AND ')} RETURNING *`,
    values
  );

  const ticket = result.rows[0];
  await logAudit({
    action:         AUDIT_ACTIONS.TICKET_UPDATED,
    actorId:        userId,
    organisationId: tenantId || existing.organisation_id,
    ticketId:       ticketId,
    oldValue:       { status: existing.status, assigned_to_id: existing.assigned_to_id },
    newValue:       { status: ticket.status,   assigned_to_id: ticket.assigned_to_id },
  });

  const newAssignee = data.assigned_to_id || data.assigned_to;
  if (newAssignee && newAssignee !== existing.assigned_to_id) {
    onTicketAssigned(ticket, newAssignee);
  }

  return { ticket, oldStatus: existing.status, oldPriority: existing.priority };
};

const escalateTicket = async (ticketId, tenantId, userId, role) => {
  const existing = await getTicket(ticketId, tenantId, userId, role);
  if (existing.status === TICKET_STATUS.CLOSED) {
    throw { status: 400, message: 'Cannot escalate a closed ticket' };
  }

  const conditions = [`id = $1`];
  const params     = [ticketId];
  if (tenantId) { conditions.push('organisation_id = $2'); params.push(tenantId); }

  const result = await query(
    `UPDATE tickets SET status = 'escalated', priority = 'P1', updated_at = now()
     WHERE ${conditions.join(' AND ')} RETURNING *`,
    params
  );
  const ticket = result.rows[0];

  await logAudit({
    action:         AUDIT_ACTIONS.TICKET_ESCALATED,
    actorId:        userId,
    organisationId: tenantId || existing.organisation_id,
    ticketId:       ticketId,
  });
  onTicketEscalated(ticket);
  return ticket;
};

const closeTicket = async (ticketId, tenantId, userId, role) => {
  const existing = await getTicket(ticketId, tenantId, userId, role);
  if (existing.status === TICKET_STATUS.CLOSED) {
    throw { status: 400, message: 'Ticket is already closed' };
  }

  const conditions = ['id = $1'];
  const params     = [ticketId];
  if (tenantId) { conditions.push('organisation_id = $2'); params.push(tenantId); }

  const result = await query(
    `UPDATE tickets SET status = 'closed', closed_at = now(), updated_at = now()
     WHERE ${conditions.join(' AND ')} RETURNING *`,
    params
  );
  const ticket = result.rows[0];

  await logAudit({
    action:         AUDIT_ACTIONS.TICKET_CLOSED,
    actorId:        userId,
    organisationId: tenantId || existing.organisation_id,
    ticketId:       ticketId,
  });
  onTicketClosed(ticket);
  return ticket;
};

const reopenTicket = async (ticketId, tenantId, userId, role) => {
  const existing = await getTicket(ticketId, tenantId, userId, role);
  if (existing.status !== TICKET_STATUS.CLOSED) {
    throw { status: 400, message: 'Only closed tickets can be reopened' };
  }

  const conditions = ['id = $1'];
  const params     = [ticketId];
  if (tenantId) { conditions.push('organisation_id = $2'); params.push(tenantId); }

  const result = await query(
    `UPDATE tickets SET status = 'open', closed_at = NULL, updated_at = now()
     WHERE ${conditions.join(' AND ')} RETURNING *`,
    params
  );

  await logAudit({
    action:         AUDIT_ACTIONS.TICKET_REOPENED,
    actorId:        userId,
    organisationId: tenantId || existing.organisation_id,
    ticketId:       ticketId,
  });
  return result.rows[0];
};

module.exports = { getTickets, getTicket, createTicket, updateTicket, escalateTicket, closeTicket, reopenTicket };
