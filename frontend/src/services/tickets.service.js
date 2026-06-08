import api from './api';

export const getTickets = (filters) =>
  api.get('/tickets', { params: filters });

export const getTicket = (id) =>
  api.get(`/tickets/${id}`);

export const createTicket = (data) =>
  api.post('/tickets', data);

export const updateTicket = (id, data) =>
  api.patch(`/tickets/${id}`, data);

export const escalateTicket = (id) =>
  api.post(`/tickets/${id}/escalate`);

export const closeTicket = (id) =>
  api.post(`/tickets/${id}/close`);

export const reopenTicket = (id) =>
  api.post(`/tickets/${id}/reopen`);

export const uploadAttachment = (ticketId, file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/tickets/${ticketId}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getAttachments = (ticketId) =>
  api.get(`/tickets/${ticketId}/attachments`);

export const bulkUpdateTickets = (ticketIds, action, value) =>
  api.post('/tickets/bulk', { ticketIds, action, value });
