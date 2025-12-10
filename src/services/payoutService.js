import api from './api';

export const payoutService = {
  getPayouts: () => api.get('/payouts'),
  getPayout: (id) => api.get(`/payouts/${id}`),
};
