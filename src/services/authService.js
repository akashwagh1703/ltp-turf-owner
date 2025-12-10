import api from './api';

export const authService = {
  sendOtp: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};
