'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTrip,
  searchTrips,
  getTripById,
  getMyTrips,
  getTripBookings,
  updateTrip,
  startTripWithOtp,
} from '@/services/trips.service'
import { QUERY_KEYS } from '@/constants'
import type { CreateTripPayload, SearchTripsParams } from '@/types/trip'

export const useSearchTrips = (params: SearchTripsParams, enabled: boolean) =>
  useQuery({
    queryKey: [...QUERY_KEYS.TRIPS, params],
    queryFn: () => searchTrips(params).then((r) => r.data),
    enabled,
  })

export const useTrip = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.TRIP(id),
    queryFn: () => getTripById(id).then((r) => r.data),
    enabled: !!id,
  })

export const useMyTrips = () =>
  useQuery({
    queryKey: QUERY_KEYS.MY_TRIPS,
    queryFn: () => getMyTrips().then((r) => r.data),
  })

export const useTripBookings = (tripId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['trips', tripId, 'bookings'],
    queryFn: () => getTripBookings(tripId).then((r) => r.data),
    enabled: !!tripId && enabled,
  })

export const useCreateTrip = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTripPayload) => createTrip(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_TRIPS })
    },
  })
}

export const useStartTripWithOtp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tripId, otp }: { tripId: string; otp: string }) =>
      startTripWithOtp(tripId, otp).then((r) => r.data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRIP(vars.tripId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_TRIPS })
    },
  })
}

export const useUpdateTrip = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: Partial<CreateTripPayload> & { id: string; status?: string }) =>
      updateTrip(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRIP(vars.id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_TRIPS })
    },
  })
}
