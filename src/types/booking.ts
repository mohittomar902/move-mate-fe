import type { User } from './user'
import type { Trip } from './trip'

export interface Booking {
  id: string
  tripId: string
  passengerId: string
  passenger?: User
  trip?: Trip
  seatsBooked: number
  totalAmount: number
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED'
  boardingOtp?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBookingPayload {
  tripId: string
  seatsBooked: number
}
