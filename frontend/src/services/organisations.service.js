import api from './api';

export const getOrganisations = () =>
  api.get('/organisations');

export const createOrganisation = (data) =>
  api.post('/organisations', data);

export const updateOrganisation = (id, data) =>
  api.patch(`/organisations/${id}`, data);
