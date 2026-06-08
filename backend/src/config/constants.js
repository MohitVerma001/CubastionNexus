// ── Ticket ────────────────────────────────────────────────────────────────────

const TICKET_STATUS = Object.freeze({
  OPEN:             'open',
  IN_PROGRESS:      'in_progress',
  PENDING_CUSTOMER: 'pending_customer',
  CLOSED:           'closed',
  ESCALATED:        'escalated',
});

const TICKET_PRIORITY = Object.freeze({
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
});

const TICKET_CATEGORY = Object.freeze({
  SYSTEM_ISSUE:     'system_issue',
  FUNCTIONAL_ISSUE: 'functional_issue',
  DATA_ISSUE:       'data_issue',
  USER_MANAGEMENT:  'user_management',
  ENHANCEMENT:      'enhancement',
  OTHER:            'other',
});

const TICKET_SOURCE = Object.freeze({
  PORTAL: 'portal',
  EMAIL:  'email',
});

// ── User ──────────────────────────────────────────────────────────────────────

const USER_ROLE = Object.freeze({
  CUSTOMER: 'customer',
  AGENT:    'agent',
  ADMIN:    'admin',
});

// ── SLA ───────────────────────────────────────────────────────────────────────
// Times are in business hours (09:00–18:00 JST, Mon–Fri, excl. Japanese holidays)

const SLA_DEFAULTS = Object.freeze({
  P1: Object.freeze({ first_response_hours: 4,  resolution_hours: 16 }),
  P2: Object.freeze({ first_response_hours: 8,  resolution_hours: 40 }),
  P3: Object.freeze({ first_response_hours: 16, resolution_hours: 80 }),
});

// ── Files ─────────────────────────────────────────────────────────────────────

const ALLOWED_FILE_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/plain',
  'application/zip',
]);

// ── Pagination ────────────────────────────────────────────────────────────────

const PAGINATION = Object.freeze({
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 25,
  MAX_LIMIT:     100,
});

// ── Audit ─────────────────────────────────────────────────────────────────────

const AUDIT_ACTIONS = Object.freeze({
  TICKET_CREATED:   'ticket_created',
  TICKET_UPDATED:   'ticket_updated',
  TICKET_CLOSED:    'ticket_closed',
  TICKET_REOPENED:  'ticket_reopened',
  TICKET_ESCALATED: 'ticket_escalated',
  COMMENT_ADDED:    'comment_added',
  USER_CREATED:     'user_created',
  USER_UPDATED:     'user_updated',
  USER_DEACTIVATED: 'user_deactivated',
  LOGIN:            'login',
  LOGOUT:           'logout',
  PASSWORD_RESET:   'password_reset',
  PASSWORD_CHANGED: 'password_changed',
});

// ── Backward-compatible aliases (used by existing service files) ───────────────

const USER_ROLES       = USER_ROLE;
const TICKET_CATEGORIES = Object.values(TICKET_CATEGORY);

module.exports = {
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_CATEGORY,
  TICKET_SOURCE,
  USER_ROLE,
  USER_ROLES,           // alias
  TICKET_CATEGORIES,    // alias
  SLA_DEFAULTS,
  ALLOWED_FILE_TYPES,
  PAGINATION,
  AUDIT_ACTIONS,
};
