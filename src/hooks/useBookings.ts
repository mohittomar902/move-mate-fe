'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
} from '@/services/booking.service'
import { QUERY_KEYS } from '@/constants'
import type { CreateBookingPayload } from '@/types/booking'

export const useMyBookings = () =>
  useQuery({
    queryKey: QUERY_KEYS.MY_BOOKINGS,
    queryFn: () => getMyBookings().then((r) => r.data),
    refetchInterval: 5000,
  })

export const useBooking = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.BOOKING(id),
    queryFn: () => getBookingById(id).then((r) => r.data),
    enabled: !!id,
  })

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_BOOKINGS })
    },
  })
}

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateBookingStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING(vars.id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_BOOKINGS })
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}
