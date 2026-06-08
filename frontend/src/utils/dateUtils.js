export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}

export function formatRelative(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function getSLAStatus(dueAt, pausedAt) {
  if (!dueAt) return 'normal';
  if (pausedAt) return 'paused';
  const now = new Date();
  const due = new Date(dueAt);
  const diffHours = (due - now) / 3600000;
  if (diffHours < 0) return 'breached';
  if (diffHours < 4) return 'critical';
  if (diffHours < 16) return 'warning';
  return 'normal';
}

export function getTimeRemaining(dueAt) {
  if (!dueAt) return null;
  const now = new Date();
  const due = new Date(dueAt);
  const diffMs = due - now;
  if (diffMs < 0) {
    const hours = Math.abs(Math.floor(diffMs / 3600000));
    if (hours < 24) return `${hours}h overdue`;
    return `${Math.floor(hours / 24)}d overdue`;
  }
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return `${Math.floor(diffMs / 60000)}m left`;
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  if (remainHours === 0) return `${days}d left`;
  return `${days}d ${remainHours}h left`;
}
