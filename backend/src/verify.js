// Standalone startup verification script.
// Run with: node src/verify.js
require('./config/env'); // validate env vars early

const { pool } = require('./config/database');

const PASS = '\x1b[32m✓ PASS\x1b[0m';
const FAIL = '\x1b[31m✗ FAIL\x1b[0m';

const check = (label, passed, detail = '') => {
  const icon = passed ? PASS : FAIL;
  const suffix = detail ? ` (${detail})` : '';
  console.log(`${icon}  ${label}${suffix}`);
  return passed;
};

const run = async () => {
  console.log('\n=== Cubastion Nexus — Startup Verification ===\n');
  let allPassed = true;

  // ── 1. Database connection ──────────────────────────────────────────────────
  let client;
  try {
    client = await pool.connect();
    allPassed &= check('Database connection', true);
  } catch (err) {
    allPassed &= check('Database connection', false, err.message);
    console.log('\nCannot proceed — database is unreachable.\n');
    process.exit(1);
  }

  const q = (sql, params) => client.query(sql, params);

  // ── 2. Table row counts ─────────────────────────────────────────────────────
  const tables = [
    'organisations',
    'users',
    'tickets',
    'ticket_comments',
    'attachments',
    'sla_configs',
    'email_templates',
    'audit_logs',
    'notifications',
    'password_reset_tokens',
    'refresh_tokens',
  ];

  console.log('\n--- Table row counts ---');
  for (const table of tables) {
    try {
      const res = await q(`SELECT COUNT(*) AS n FROM ${table}`);
      const n   = parseInt(res.rows[0].n, 10);
      console.log(`   ${table.padEnd(25)} ${n} row(s)`);
    } catch (err) {
      allPassed &= check(`Table exists: ${table}`, false, err.message);
    }
  }

  // ── 3. SLA configs (must be exactly 3: P1, P2, P3) ────────────────────────
  console.log('\n--- SLA configs ---');
  try {
    const res = await q("SELECT priority FROM sla_configs ORDER BY priority");
    const priorities = res.rows.map(r => r.priority);
    const ok = priorities.length === 3 && ['P1','P2','P3'].every(p => priorities.includes(p));
    allPassed &= check('SLA configs (P1, P2, P3)', ok, priorities.join(', ') || 'none found');
  } catch (err) {
    allPassed &= check('SLA configs', false, err.message);
  }

  // ── 4. Email templates ─────────────────────────────────────────────────────
  console.log('\n--- Email templates ---');
  try {
    const res = await q("SELECT trigger_key FROM email_templates ORDER BY trigger_key");
    const keys = res.rows.map(r => r.trigger_key);
    allPassed &= check(`Email templates exist (${keys.length})`, keys.length > 0, keys.join(', ') || 'none found');
  } catch (err) {
    allPassed &= check('Email templates', false, err.message);
  }

  // ── 5. Test users ──────────────────────────────────────────────────────────
  console.log('\n--- Test users ---');
  const expectedUsers = [
    'admin@cubastion.com',
    'agent@cubastion.com',
    'tanaka@fujikura.co.jp',
  ];
  for (const email of expectedUsers) {
    try {
      const res = await q('SELECT email, role, is_active FROM users WHERE email = $1', [email]);
      const u = res.rows[0];
      const ok = u && u.is_active;
      allPassed &= check(`User: ${email}`, ok, u ? `role=${u.role}` : 'not found');
    } catch (err) {
      allPassed &= check(`User: ${email}`, false, err.message);
    }
  }

  // ── 6. Organisations ───────────────────────────────────────────────────────
  console.log('\n--- Organisations ---');
  try {
    const res = await q('SELECT name FROM organisations LIMIT 5');
    const names = res.rows.map(r => r.name);
    allPassed &= check('Organisations exist', names.length > 0, names.join(', ') || 'none');
  } catch (err) {
    allPassed &= check('Organisations', false, err.message);
  }

  client.release();
  await pool.end();

  console.log('\n' + '='.repeat(48));
  if (allPassed) {
    console.log('\x1b[32mAll checks passed — backend is ready.\x1b[0m\n');
    process.exit(0);
  } else {
    console.log('\x1b[31mSome checks failed — review output above.\x1b[0m\n');
    process.exit(1);
  }
};

run().catch((err) => {
  console.error('Verification script error:', err.message);
  process.exit(1);
});
