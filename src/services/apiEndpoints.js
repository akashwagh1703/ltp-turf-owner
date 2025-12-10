// API Endpoints for Owner App
export const API_ENDPOINTS = {
  // Auth
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  LOGOUT: '/auth/logout',
  GET_PROFILE: '/me',
  UPDATE_PROFILE: '/auth/profile',

  // Dashboard
  GET_DASHBOARD_STATS: '/dashboard/stats',
  GET_RECENT_BOOKINGS: '/dashboard/recent-bookings',

  // Turfs
  GET_TURFS: '/turfs',
  GET_TURF_DETAILS: (id) => `/turfs/${id}`,
  REQUEST_TURF_UPDATE: (id) => `/turfs/${id}/request-update`,

  // Slots
  GENERATE_SLOTS: '/slots/generate',
  GET_SLOTS: '/slots',

  // Bookings
  GET_BOOKINGS: '/bookings',
  CREATE_OFFLINE_BOOKING: '/bookings/offline',
  GET_BOOKING_STATS: '/bookings/stats',

  // Payouts
  GET_PAYOUTS: '/payouts',
  GET_PAYOUT_DETAILS: (id) => `/payouts/${id}`,

  // Reviews
  GET_REVIEWS: '/reviews',

  // Notifications
  GET_NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: (id) => `/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/read-all',
};
