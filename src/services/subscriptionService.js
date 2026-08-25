import api from './api';

export const subscriptionService = {
  get: () => api.get('/subscription'),
  markPaid: (planId) => api.post('/subscription/mark-paid', planId ? { plan_id: planId } : {}),
};
