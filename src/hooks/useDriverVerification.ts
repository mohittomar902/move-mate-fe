'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMyVerificationStatus,
  uploadDocument,
  saveAadhaar,
  submitForReview,
  adminGetRequests,
  adminApprove,
  adminReject,
} from '@/services/driver-verification.service'

export const useVerificationStatus = () =>
  useQuery({
    queryKey: ['driver-verification'],
    queryFn: () => getMyVerificationStatus().then((r) => r.data),
  })

export const useUploadDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ type, file }: { type: string; file: File }) =>
      uploadDocument(type, file).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-verification'] })
    },
  })
}

export const useSaveAadhaar = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (aadhaarNumber: string) => saveAadhaar(aadhaarNumber).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-verification'] })
    },
  })
}

export const useSubmitForReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => submitForReview().then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-verification'] })
    },
  })
}

export const useAdminRequests = (filter?: string) =>
  useQuery({
    queryKey: ['admin-requests', filter],
    queryFn: () => adminGetRequests(filter).then((r) => r.data),
  })

export const useAdminApprove = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => adminApprove(userId).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-requests'] }),
  })
}

export const useAdminReject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminReject(userId, reason).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-requests'] }),
  })
}
