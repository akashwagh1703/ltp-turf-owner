import api from './api';

export const slotService = {
  generateSlots: (data) => api.post('/slots/generate', data),
  getSlots: (params) => api.get('/slots', { params }),
  updatePrices: (data) => api.post('/slots/update-prices', data),
};
