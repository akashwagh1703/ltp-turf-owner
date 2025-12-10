import api from './api';

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentBookings: () => api.get('/dashboard/recent-bookings'),
};
