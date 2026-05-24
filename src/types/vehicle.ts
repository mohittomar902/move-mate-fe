export interface Vehicle {
  id: string
  userId: string
  type: string
  model: string
  numberPlate: string
  seatCapacity: number
  createdAt: string
}

export interface CreateVehiclePayload {
  type: string
  model: string
  numberPlate: string
  seatCapacity: number
}
