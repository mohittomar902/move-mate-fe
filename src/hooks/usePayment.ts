'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPaymentOrder, verifyPayment } from '@/services/payment.service'
import { QUERY_KEYS } from '@/constants'

export const usePayment = () => {
  const queryClient = useQueryClient()

  const createOrder = useMutation({
    mutationFn: (bookingId: string) =>
      createPaymentOrder(bookingId).then((r) => r.data),
  })

  const verify = useMutation({
    mutationFn: verifyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_BOOKINGS })
    },
  })

  return { createOrder, verify }
}
