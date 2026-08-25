import api from './api';

export const turfService = {
  getTurfs: () => api.get('/turfs'),
  getTurf: (id) => api.get(`/turfs/${id}`),
  requestUpdate: (id, updates) => api.post(`/turfs/${id}/request-update`, { updates }),
  getUpdateRequests: () => api.get('/turf-update-requests'),
};
