import { api } from './api'
import type { CreateVehiclePayload } from '@/types/vehicle'

export const createVehicle = (payload: CreateVehiclePayload) =>
  api.post('/vehicles', payload)

export const getMyVehicles = () =>
  api.get('/vehicles')

export const updateVehicle = (id: string, payload: Partial<CreateVehiclePayload>) =>
  api.patch(`/vehicles/${id}`, payload)

export const deleteVehicle = (id: string) =>
  api.delete(`/vehicles/${id}`)
