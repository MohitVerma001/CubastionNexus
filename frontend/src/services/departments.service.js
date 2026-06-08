import api from './api';

export const getDepartments = () =>
  api.get('/departments');

export const createDepartment = (data) =>
  api.post('/departments', data);

export const updateDepartment = (id, data) =>
  api.patch(`/departments/${id}`, data);
