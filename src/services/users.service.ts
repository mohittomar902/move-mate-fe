import { api } from './api'

export const updateProfile = (payload: {
  fullName?: string
  email?: string
  profileImage?: string
}) => api.patch('/users/me', payload)

export const getUserById = (id: string) =>
  api.get(`/users/${id}`)
