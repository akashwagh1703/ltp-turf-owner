import api from './api';

export const turfService = {
  getTurfs: () => api.get('/turfs'),
  getTurf: (id) => api.get(`/turfs/${id}`),
  requestUpdate: (id, data) => api.post(`/turfs/${id}/request-update`, data),
};
