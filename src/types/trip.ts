import type { User } from './user'
import type { Vehicle } from './vehicle'

export interface Trip {
  id: string
  vehicleId: string
  driverId: string
  driver?: User
  vehicle?: Vehicle
  sourceName: string
  sourceLat: number
  sourceLng: number
  destinationName: string
  destinationLat: number
  destinationLng: number
  departureTime: string
  availableSeats: number
  pricePerSeat: number
  status: 'OPEN' | 'STARTED' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export interface CreateTripPayload {
  vehicleId: string
  sourceName: string
  sourceLat: number
  sourceLng: number
  destinationName: string
  destinationLat: number
  destinationLng: number
  departureTime: string
  availableSeats: number
  pricePerSeat: number
}

export interface SearchTripsParams {
  sourceLat?: number
  sourceLng?: number
  destinationLat?: number
  destinationLng?: number
  seats?: number
  departureAfter?: string
  departureBefore?: string
  limit?: number
}
