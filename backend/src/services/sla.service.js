const { query } = require('../config/database');

// sla_configs is a global table (no organisation_id) — 3 rows: P1, P2, P3
const getSLAConfigs = async () => {
  const result = await query(
    "SELECT * FROM sla_configs ORDER BY CASE priority WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 ELSE 3 END"
  );
  return result.rows;
};

const updateSLAConfig = async (id, data, updatedById) => {
  const result = await query(
    `UPDATE sla_configs
     SET first_response_hours = $1, resolution_hours = $2,
         updated_by_id = $3, updated_at = now()
     WHERE id = $4 RETURNING *`,
    [data.first_response_hours, data.resolution_hours, updatedById, id]
  );
  if (!result.rows.length) throw { status: 404, message: 'SLA config not found' };
  return result.rows[0];
};

const checkSLABreaches = async () => {
  const now = new Date();

  const [responseBreaches, resolutionBreaches] = await Promise.all([
    query(
      `UPDATE tickets SET sla_response_breached = true
       WHERE sla_first_response_due < $1
         AND sla_response_breached = false
         AND status != 'closed'
       RETURNING id, ticket_number, organisation_id, assigned_to_id, subject`,
      [now]
    ),
    query(
      `UPDATE tickets SET sla_resolution_breached = true
       WHERE sla_resolution_due < $1
         AND sla_resolution_breached = false
         AND status != 'closed'
       RETURNING id, ticket_number, organisation_id, assigned_to_id, subject`,
      [now]
    ),
  ]);

  return { responseBreaches: responseBreaches.rows, resolutionBreaches: resolutionBreaches.rows };
};

module.exports = { getSLAConfigs, updateSLAConfig, checkSLABreaches };
