import { api } from './api'
import type { CreateTripPayload, SearchTripsParams } from '@/types/trip'

export const createTrip = (payload: CreateTripPayload) =>
  api.post('/trips', payload)

export const searchTrips = (params: SearchTripsParams) =>
  api.get('/trips/search', { params })

export const getTripById = (id: string) =>
  api.get(`/trips/${id}`)

export const getMyTrips = () =>
  api.get('/trips/my-trips')

export const updateTrip = (
  id: string,
  payload: Partial<CreateTripPayload> & { status?: string },
) => api.patch(`/trips/${id}`, payload)

export const deleteTrip = (id: string) =>
  api.delete(`/trips/${id}`)

export const getTripBookings = (tripId: string) =>
  api.get(`/trips/${tripId}/bookings`)

export const startTripWithOtp = (tripId: string, otp: string) =>
  api.post(`/trips/${tripId}/start`, { otp })
