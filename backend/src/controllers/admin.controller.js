const { query }    = require('../config/database');
const { paginate } = require('../utils/pagination');

const extractValue = (jsonValue) => {
  if (!jsonValue) return null;
  try {
    const obj = typeof jsonValue === 'string' ? JSON.parse(jsonValue) : jsonValue;
    const values = Object.values(obj);
    return values[0] || null;
  } catch {
    return null;
  }
};

const getStats = async (req, res, next) => {
  try {
    const orgId     = req.query.organisation_id || null;
    const orgParams = orgId ? [orgId] : [];

    const tWhere = orgId ? 'WHERE t.organisation_id = $1'  : '';
    const tAnd   = orgId ? 'AND t.organisation_id = $1'    : '';
    const plain  = orgId ? 'WHERE organisation_id = $1'    : '';

    const [
      statusCounts,
      slaBreach,
      unassignedRes,
      agentCountRes,
      orgCountRes,
      recentTickets,
      slaWatchlist,
      orgLoad,
    ] = await Promise.all([
      // 1. Ticket counts by status
      query(`SELECT status, COUNT(*)::int AS count FROM tickets ${plain} GROUP BY status`, orgParams),

      // 2. SLA breach count among open tickets
      query(
        `SELECT COUNT(*)::int AS breach_count
         FROM tickets t
         WHERE (sla_response_breached = true OR sla_resolution_breached = true)
           AND status != 'closed'
           ${tAnd}`,
        orgParams
      ),

      // 3. Unassigned open tickets
      query(
        `SELECT COUNT(*)::int AS unassigned
         FROM tickets t
         WHERE assigned_to_id IS NULL
           AND status != 'closed'
           ${tAnd}`,
        orgParams
      ),

      // 4. Active agent count (global)
      query(`SELECT COUNT(*)::int AS agents FROM users WHERE role = 'agent' AND is_active = true`),

      // 5. Active organisation count (global)
      query(`SELECT COUNT(*)::int AS organisations FROM organisations WHERE is_active = true`),

      // 6. Recent 10 tickets
      query(
        `SELECT t.id, t.ticket_number, t.subject, t.priority, t.status,
                t.updated_at, o.name AS organisation_name
         FROM tickets t
         LEFT JOIN organisations o ON o.id = t.organisation_id
         ${tWhere}
         ORDER BY t.updated_at DESC LIMIT 10`,
        orgParams
      ),

      // 7. SLA watchlist — overdue open tickets
      query(
        `SELECT t.id, t.ticket_number, t.subject,
                t.sla_resolution_due, o.name AS organisation_name
         FROM tickets t
         LEFT JOIN organisations o ON o.id = t.organisation_id
         WHERE t.sla_resolution_due < NOW()
           AND t.status NOT IN ('closed', 'pending_customer')
           ${tAnd}
         ORDER BY t.sla_resolution_due ASC LIMIT 10`,
        orgParams
      ),

      // 8. Organisation ticket load breakdown (active orgs only)
      query(
        `SELECT o.id, o.name, o.primary_contact, o.is_active,
                COUNT(t.id)::int AS ticket_count,
                COUNT(CASE WHEN t.status IN ('open','in_progress','escalated') THEN 1 END)::int AS open
         FROM organisations o
         LEFT JOIN tickets t ON t.organisation_id = o.id
         WHERE o.is_active = true
         GROUP BY o.id
         ORDER BY open DESC`
      ),
    ]);

    const byStatus = {};
    statusCounts.rows.forEach(({ status, count }) => { byStatus[status] = count; });

    const total           = Object.values(byStatus).reduce((a, b) => a + b, 0);
    const openCount       = (byStatus.open || 0) + (byStatus.in_progress || 0)
                          + (byStatus.pending_customer || 0) + (byStatus.escalated || 0);
    const escalated       = byStatus.escalated       || 0;
    const resolved        = byStatus.closed          || 0;
    const pendingCustomer = byStatus.pending_customer || 0;

    const shapeTicket = (t) => ({
      ...t,
      organisation: { name: t.organisation_name },
    });

    res.json({
      success:          true,
      total,
      open:             openCount,
      escalated,
      resolved,
      pending_customer: pendingCustomer,
      sla_breach_count: slaBreach.rows[0].breach_count,
      unassigned:       unassignedRes.rows[0].unassigned,
      agents:           agentCountRes.rows[0].agents,
      organisations:    orgCountRes.rows[0].organisations,
      recent_tickets:   recentTickets.rows.map(shapeTicket),
      sla_watchlist:    slaWatchlist.rows.map(shapeTicket),
      org_ticket_load:  orgLoad.rows,
    });
  } catch (err) { next(err); }
};

const getAuditLogsController = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const orgId = req.tenantId || null;

    const conditions = [];
    const params     = [];
    let   idx        = 1;

    if (orgId)               { conditions.push(`al.organisation_id = $${idx++}`); params.push(orgId); }
    if (req.query.action)    { conditions.push(`al.action = $${idx++}`);           params.push(req.query.action); }
    if (req.query.from_date) { conditions.push(`al.created_at >= $${idx++}`);      params.push(req.query.from_date); }
    if (req.query.to_date)   { conditions.push(`al.created_at <= $${idx++}`);      params.push(req.query.to_date); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRes, dataRes] = await Promise.all([
      query(`SELECT COUNT(*) FROM audit_logs al ${where}`, params),
      query(
        `SELECT al.id, al.created_at, al.action, al.old_value, al.new_value,
                t.ticket_number,
                u.name AS actor, u.role AS actor_role
         FROM audit_logs al
         LEFT JOIN tickets t ON t.id = al.ticket_id
         LEFT JOIN users   u ON u.id = al.actor_id
         ${where}
         ORDER BY al.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
    ]);

    const logs = dataRes.rows.map(row => ({
      ...row,
      old_value: extractValue(row.old_value),
      new_value: extractValue(row.new_value),
    }));

    res.json({
      success: true,
      logs,
      total:   parseInt(countRes.rows[0].count, 10),
      page,
      limit,
    });
  } catch (err) { next(err); }
};

const getEmailTemplates = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM email_templates ORDER BY trigger_key');
    res.json({ success: true, templates: result.rows });
  } catch (err) { next(err); }
};

const updateEmailTemplate = async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE email_templates
       SET subject_template = $1, body_template = $2, updated_at = now()
       WHERE id = $3 RETURNING *`,
      [req.body.subject_template, req.body.body_template, req.params.id]
    );
    if (!result.rows.length) throw { status: 404, message: 'Template not found' };
    res.json({ success: true, template: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getStats, getAuditLogsController, getEmailTemplates, updateEmailTemplate };
