import api from './api';

export const getComments = (ticketId) =>
  api.get(`/tickets/${ticketId}/comments`);

export const addComment = (ticketId, body, isInternal = false) =>
  api.post(`/tickets/${ticketId}/comments`, { body, is_internal: isInternal });
