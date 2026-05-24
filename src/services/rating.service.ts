import { api } from './api'

export const createRating = (payload: {
  toUserId: string
  tripId: string
  rating: number
  review?: string
}) => api.post('/ratings', payload)
