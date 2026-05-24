import { api } from './api'

export const sendOtp = (phone: string) =>
  api.post<{ message: string; devOtp?: string }>('/auth/send-otp', { phone })

export const verifyOtp = (phone: string, otp: string) =>
  api.post<{ accessToken: string; refreshToken: string }>('/auth/verify-otp', { phone, otp })

export const refreshToken = (token: string) =>
  api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh-token', {
    refreshToken: token,
  })

export const getMyProfile = () => api.get('/users/me')
