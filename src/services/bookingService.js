import api from './api';

export const bookingService = {
  getBookings: (params) => api.get('/bookings', { params }),
  createOfflineBooking: (data) => api.post('/bookings/offline', data),
  cancelBooking: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
  completeBooking: (id) => api.post(`/bookings/${id}/complete`),
  markNoShow: (id) => api.post(`/bookings/${id}/no-show`),
  confirmPayment: (id) => api.post(`/bookings/${id}/confirm-payment`),
  getStats: () => api.get('/bookings/stats'),
};
