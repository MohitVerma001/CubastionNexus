import api from './api';

export const getUsers = (filters) =>
  api.get('/users', { params: filters });

export const createUser = (data) =>
  api.post('/users', data);

export const updateUser = (id, data) =>
  api.patch(`/users/${id}`, data);

export const deactivateUser = (id) =>
  api.delete(`/users/${id}`);

export const resetUserPassword = (id) =>
  api.post(`/users/${id}/reset-password`);
