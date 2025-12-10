import api from './api';

export const bookingService = {
  getBookings: (params) => api.get('/bookings', { params }),
  createOffline: (data) => api.post('/bookings/offline', data),
  getStats: () => api.get('/bookings/stats'),
};
