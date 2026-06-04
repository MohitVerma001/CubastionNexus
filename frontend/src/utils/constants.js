export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  PENDING_CUSTOMER: 'pending_customer',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
};

export const TICKET_PRIORITY = {
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  AGENT: 'agent',
  ADMIN: 'admin',
};

export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  pending_customer: 'Pending Customer',
  closed: 'Closed',
  escalated: 'Escalated',
};

export const PRIORITY_LABELS = {
  P1: 'P1 Critical',
  P2: 'P2 High',
  P3: 'P3 Normal',
};

export const TICKET_CATEGORIES = [
  { value: 'system_issue', label: 'System Issue' },
  { value: 'functional_issue', label: 'Functional Issue' },
  { value: 'data_issue', label: 'Data Issue' },
  { value: 'user_management', label: 'User Management' },
  { value: 'enhancement', label: 'Enhancement Request' },
  { value: 'other', label: 'Other' },
];
