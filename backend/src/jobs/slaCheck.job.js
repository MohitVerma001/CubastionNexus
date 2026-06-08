const cron   = require('node-cron');
const { query } = require('../config/database');
const logger    = require('../utils/logger');

const runCheck = async () => {
  try {
    // ── 1. Mark response-SLA breaches ─────────────────────────────────────────
    const responseBreaches = await query(
      `UPDATE tickets
       SET sla_response_breached = true
       WHERE sla_first_response_due < now()
         AND sla_response_breached  = false
         AND status                 != 'closed'
         AND sla_paused_at          IS NULL
       RETURNING id, ticket_number`
    );

    // ── 2. Mark resolution-SLA breaches ───────────────────────────────────────
    const resolutionBreaches = await query(
      `UPDATE tickets
       SET sla_resolution_breached = true
       WHERE sla_resolution_due < now()
         AND sla_resolution_breached = false
         AND status                  != 'closed'
         AND sla_paused_at           IS NULL
       RETURNING id, ticket_number`
    );

    // ── 3. Warn on tickets with less than 20% of SLA resolution window left ───
    const warnings = await query(
      `SELECT id, ticket_number, sla_resolution_due, created_at
       FROM tickets
       WHERE sla_resolution_due IS NOT NULL
         AND sla_resolution_due > now()
         AND sla_resolution_breached = false
         AND status                  != 'closed'
         AND sla_paused_at           IS NULL
         AND EXTRACT(EPOCH FROM (sla_resolution_due - now()))
             < EXTRACT(EPOCH FROM (sla_resolution_due - created_at)) * 0.2`
    );

    const rb = responseBreaches.rowCount;
    const ab = resolutionBreaches.rowCount;
    const w  = warnings.rowCount;

    if (rb)  logger.warn(`SLA response breached: ${rb} ticket(s)`);
    if (ab)  logger.warn(`SLA resolution breached: ${ab} ticket(s)`);
    if (w)   logger.warn(`SLA warning (<20% window remaining): ${w} ticket(s)`);

    if (!rb && !ab && !w) {
      logger.info('SLA check: no breaches or warnings');
    } else {
      logger.info('SLA check complete', { responseBreached: rb, resolutionBreached: ab, warnings: w });
    }
  } catch (err) {
    // Never throw — log and continue so the cron stays alive
    logger.error('SLA check job error', { message: err.message });
  }
};

// Runs every 15 minutes; scheduled: false so startSLACheckJob controls the start
const job = cron.schedule('*/15 * * * *', runCheck, { scheduled: false });

const startSLACheckJob = () => {
  job.start();
  // Run once immediately at startup so we don't wait up to 15 minutes
  runCheck();
};

module.exports = { startSLACheckJob };
