'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createVehicle, getMyVehicles, deleteVehicle } from '@/services/vehicles.service'
import type { CreateVehiclePayload } from '@/types/vehicle'

const VEHICLES_KEY = ['vehicles']

export const useMyVehicles = () =>
  useQuery({
    queryKey: VEHICLES_KEY,
    queryFn: () => getMyVehicles().then((r) => r.data),
  })

export const useCreateVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY })
    },
  })
}

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY })
    },
  })
}
