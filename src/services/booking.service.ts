import { api } from './api'
import type { CreateBookingPayload } from '@/types/booking'

export const createBooking = (payload: CreateBookingPayload) =>
  api.post('/bookings', payload)

export const getMyBookings = () =>
  api.get('/bookings/my-bookings')

export const getBookingById = (id: string) =>
  api.get(`/bookings/${id}`)

export const updateBookingStatus = (id: string, bookingStatus: string) =>
  api.patch(`/bookings/${id}/status`, { bookingStatus })
