import api from './api';

export const getStats = () =>
  api.get('/admin/stats');

export const getAuditLogs = (filters) =>
  api.get('/audit-logs', { params: filters });

export const getSLAConfigs = () =>
  api.get('/sla-configs');

export const updateSLAConfig = (id, data) =>
  api.patch(`/sla-configs/${id}`, data);

export const getEmailTemplates = () =>
  api.get('/email-templates');

export const updateEmailTemplate = (id, data) =>
  api.patch(`/email-templates/${id}`, data);
