'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRating } from '@/services/rating.service'
import { QUERY_KEYS } from '@/constants'

export const useCreateRating = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      toUserId: string
      tripId: string
      rating: number
      review?: string
    }) => createRating(payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_BOOKINGS })
    },
  })
}
