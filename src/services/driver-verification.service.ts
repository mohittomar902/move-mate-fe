import { api } from './api'

export const getMyVerificationStatus = () =>
  api.get('/driver-verification/my-status')

export const uploadDocument = (type: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  form.append('type', type)
  return api.post('/driver-verification/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const saveAadhaar = (aadhaarNumber: string) =>
  api.post('/driver-verification/aadhaar', { aadhaarNumber })

export const submitForReview = () =>
  api.post('/driver-verification/submit')

export const adminGetRequests = (filter?: string) =>
  api.get('/driver-verification/admin/requests', { params: filter ? { filter } : {} })

export const adminApprove = (userId: string) =>
  api.patch(`/driver-verification/admin/approve/${userId}`)

export const adminReject = (userId: string, reason: string) =>
  api.patch(`/driver-verification/admin/reject/${userId}`, { reason })
