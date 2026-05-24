export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  VERIFY_OTP: '/verify-otp',
  SEARCH: '/search',
  DASHBOARD: '/dashboard',
  MY_TRIPS: '/dashboard/my-trips',
  BOOKINGS: '/dashboard/bookings',
  PROFILE: '/profile',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_TRIPS: '/admin/trips',
  ADMIN_REPORTS: '/admin/reports',
} as const

export const QUERY_KEYS = {
  PROFILE: ['profile'],
  TRIPS: ['trips'],
  MY_TRIPS: ['trips', 'my-trips'],
  TRIP: (id: string) => ['trips', id],
  BOOKINGS: ['bookings'],
  MY_BOOKINGS: ['bookings', 'my-bookings'],
  BOOKING: (id: string) => ['bookings', id],
} as const

export const THEME = {
  PRIMARY: '#0F172A',
  ACCENT: '#22C55E',
  SECONDARY: '#06B6D4',
} as const
