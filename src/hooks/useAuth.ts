'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { sendOtp, verifyOtp, getMyProfile } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { QUERY_KEYS, ROUTES } from '@/constants'

export const useSendOtp = () =>
  useMutation({
    mutationFn: (phone: string) => sendOtp(phone),
  })

export const useVerifyOtp = () => {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) => verifyOtp(phone, otp),
    onSuccess: (res) => {
      const { accessToken, refreshToken } = res.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`
      setAuth(null, accessToken, refreshToken)
      // full navigation so the middleware sees the cookie on the very first request
      window.location.href = ROUTES.DASHBOARD
    },
  })
}

export const useProfile = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: () => getMyProfile().then((r) => r.data),
    enabled: isAuthenticated,
  })
}
