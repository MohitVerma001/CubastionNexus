const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_CATEGORIES = ['system_issue', 'functional_issue', 'data_issue', 'user_management', 'enhancement', 'other'];
const VALID_PRIORITIES = ['P1', 'P2', 'P3'];
const VALID_ROLES = ['customer', 'agent', 'admin'];

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!email || !email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!password || !password.trim()) {
    errors.password = 'Password is required.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validatePasswordForm({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  if (!currentPassword) {
    errors.currentPassword = 'Current password is required.';
  }
  if (!newPassword) {
    errors.newPassword = 'New password is required.';
  } else {
    if (newPassword.length < 10) {
      errors.newPassword = 'Password must be at least 10 characters.';
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter.';
    } else if (!/[0-9]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one number.';
    } else if (!/[!@#$%^&*]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one special character (!@#$%^&*).';
    }
  }
  if (newPassword && confirmPassword !== newPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  } else if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateTicketForm({ subject, description, category, priority }) {
  const errors = {};
  if (!subject || !subject.trim()) {
    errors.subject = 'Subject is required.';
  } else if (subject.trim().length > 120) {
    errors.subject = 'Subject cannot exceed 120 characters.';
  }
  if (!description || !description.trim()) {
    errors.description = 'Description is required.';
  } else if (description.trim().length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters.';
  }
  if (!category) {
    errors.category = 'Category is required.';
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.category = 'Invalid category selected.';
  }
  if (!priority) {
    errors.priority = 'Priority is required.';
  } else if (!VALID_PRIORITIES.includes(priority)) {
    errors.priority = 'Invalid priority selected.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateUserForm({ name, email, role, organisation_id }) {
  const errors = {};
  if (!name || !name.trim()) {
    errors.name = 'Name is required.';
  }
  if (!email || !email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!role) {
    errors.role = 'Role is required.';
  } else if (!VALID_ROLES.includes(role)) {
    errors.role = 'Invalid role selected.';
  }
  if (role === 'customer' && !organisation_id) {
    errors.organisation_id = 'Organisation is required for customer accounts.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
