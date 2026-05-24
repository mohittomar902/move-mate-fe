import { api } from './api'

export const createPaymentOrder = (bookingId: string) =>
  api.post('/payments/create-order', { bookingId })

export const verifyPayment = (payload: {
  bookingId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}) => api.post('/payments/verify', payload)
