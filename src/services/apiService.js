import api from './api';
import { API_ENDPOINTS } from './apiEndpoints';

// Auth Services
export const authService = {
  sendOtp: (phone) => api.post(API_ENDPOINTS.SEND_OTP, { phone }),
  verifyOtp: (phone, otp) => api.post(API_ENDPOINTS.VERIFY_OTP, { phone, otp }),
  logout: () => api.post(API_ENDPOINTS.LOGOUT),
  getProfile: () => api.get(API_ENDPOINTS.GET_PROFILE),
  updateProfile: (data) => api.put(API_ENDPOINTS.UPDATE_PROFILE, data),
};

// Dashboard Services
export const dashboardService = {
  getStats: () => api.get(API_ENDPOINTS.GET_DASHBOARD_STATS),
  getRecentBookings: () => api.get(API_ENDPOINTS.GET_RECENT_BOOKINGS),
};

// Turf Services
export const turfService = {
  getTurfs: () => api.get(API_ENDPOINTS.GET_TURFS),
  getTurfDetails: (id) => api.get(API_ENDPOINTS.GET_TURF_DETAILS(id)),
  requestUpdate: (id, updates) => 
    api.post(API_ENDPOINTS.REQUEST_TURF_UPDATE(id), { updates }),
};

// Slot Services
export const slotService = {
  generateSlots: (turfId, date) => 
    api.post(API_ENDPOINTS.GENERATE_SLOTS, { turf_id: turfId, date }),
  getSlots: (turfId, date) => 
    api.get(API_ENDPOINTS.GET_SLOTS, { params: { turf_id: turfId, date } }),
};

// Booking Services
export const bookingService = {
  getBookings: (params) => api.get(API_ENDPOINTS.GET_BOOKINGS, { params }),
  createOfflineBooking: (data) => api.post(API_ENDPOINTS.CREATE_OFFLINE_BOOKING, data),
  getStats: () => api.get(API_ENDPOINTS.GET_BOOKING_STATS),
};

// Payout Services
export const payoutService = {
  getPayouts: () => api.get(API_ENDPOINTS.GET_PAYOUTS),
  getPayoutDetails: (id) => api.get(API_ENDPOINTS.GET_PAYOUT_DETAILS(id)),
};

// Review Services
export const reviewService = {
  getReviews: () => api.get(API_ENDPOINTS.GET_REVIEWS),
};

// Notification Services
export const notificationService = {
  getNotifications: () => api.get(API_ENDPOINTS.GET_NOTIFICATIONS),
  markAsRead: (id) => api.post(API_ENDPOINTS.MARK_NOTIFICATION_READ(id)),
  markAllAsRead: () => api.post(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ),
};
