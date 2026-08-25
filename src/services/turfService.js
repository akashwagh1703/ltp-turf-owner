import api from './api';

export const turfService = {
  getTurfs: () => api.get('/turfs'),
  getTurf: (id) => api.get(`/turfs/${id}`),
  createDraft: () => api.post('/turfs'),
  updateTurf: (id, data) => api.post(`/turfs/${id}`, data),
  submitTurf: (id) => api.post(`/turfs/${id}/submit`),
  uploadPhoto: (id, formData) => api.post(`/turfs/${id}/images`, formData),
  deletePhoto: (id, imageId) => api.delete(`/turfs/${id}/images/${imageId}`),
  requestUpdate: (id, updates) => api.post(`/turfs/${id}/request-update`, { updates }),
  getUpdateRequests: () => api.get('/turf-update-requests'),
};
