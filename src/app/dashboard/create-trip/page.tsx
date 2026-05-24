'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTrip } from '@/hooks/useTrips'
import { useMyVehicles, useCreateVehicle } from '@/hooks/useVehicles'
import { useVerificationStatus } from '@/hooks/useDriverVerification'
import VerificationGateModal from '@/components/verification/VerificationGateModal'
import { CITIES } from '@/constants/cities'
import Spinner from '@/components/common/Spinner'
import { ArrowLeft, Plus } from 'lucide-react'
import type { CreateTripPayload } from '@/types/trip'

const tripSchema = z.object({
  vehicleId: z.string().min(1, 'Select a vehicle'),
  sourceName: z.string().min(1, 'Select source city'),
  destinationName: z.string().min(1, 'Select destination city'),
  departureDate: z.string().min(1, 'Select date'),
  departureTime: z.string().min(1, 'Select time'),
  availableSeats: z.string().min(1),
  pricePerSeat: z.string().min(1, 'Enter a price'),
})

const vehicleSchema = z.object({
  type: z.string().min(1),
  model: z.string().min(2, 'Enter model name'),
  numberPlate: z.string().min(5, 'Enter number plate'),
  seatCapacity: z.string().min(1),
})

type TripForm = z.infer<typeof tripSchema>
type VehicleForm = z.infer<typeof vehicleSchema>

export default function CreateTripPage() {
  const router = useRouter()
  const { data: vehicles, isLoading: loadingVehicles } = useMyVehicles()
  const { mutate: createTrip, isPending: creatingTrip } = useCreateTrip()
  const { mutate: createVehicle, isPending: creatingVehicle } = useCreateVehicle()
  const { data: verificationData } = useVerificationStatus()
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [showVerificationGate, setShowVerificationGate] = useState(false)

  const verificationStatus = verificationData?.verificationStatus ?? 'PENDING'
  const isVerified = verificationStatus === 'VERIFIED'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tripForm = useForm<TripForm>({ resolver: zodResolver(tripSchema) as any })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vehicleForm = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: { type: 'car', seatCapacity: '4' },
  })

  const vehicleList = Array.isArray(vehicles) ? vehicles : []

  const onAddVehicle = (data: VehicleForm) => {
    createVehicle({ ...data, seatCapacity: Number(data.seatCapacity) }, {
      onSuccess: () => {
        setShowVehicleForm(false)
        vehicleForm.reset()
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message ?? 'Failed to add vehicle.')
      },
    })
  }

  const onCreateTrip = (data: TripForm) => {
    if (!isVerified) {
      setShowVerificationGate(true)
      return
    }
    const src = CITIES.find((c) => c.name === data.sourceName)
    const dst = CITIES.find((c) => c.name === data.destinationName)
    if (!src || !dst) return

    const departureTime = new Date(`${data.departureDate}T${data.departureTime}:00`).toISOString()

    const payload: CreateTripPayload = {
      vehicleId: data.vehicleId,
      sourceName: src.name,
      sourceLat: src.lat,
      sourceLng: src.lng,
      destinationName: dst.name,
      destinationLat: dst.lat,
      destinationLng: dst.lng,
      departureTime,
      availableSeats: Number(data.availableSeats),
      pricePerSeat: Number(data.pricePerSeat),
    }

    createTrip(payload, {
      onSuccess: () => router.push('/dashboard/my-trips'),
      onError: (err: any) => {
        alert(err?.response?.data?.message ?? 'Failed to create trip.')
      },
    })
  }

  const today = new Date().toISOString().split('T')[0]
  const src = tripForm.watch('sourceName')

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Create a Trip</h1>
      </div>

      {/* Subtle verification status chip — clicking opens the modal */}
      {!isVerified && (
        <button
          onClick={() => setShowVerificationGate(true)}
          className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left hover:bg-amber-100 transition"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
            {verificationStatus === 'UNDER_REVIEW' ? (
              <span className="text-lg">⏳</span>
            ) : verificationStatus === 'REJECTED' ? (
              <span className="text-lg">❌</span>
            ) : (
              <span className="text-lg">🔒</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {verificationStatus === 'UNDER_REVIEW'
                ? 'Verification under review — pending approval'
                : verificationStatus === 'REJECTED'
                ? 'Verification rejected — action required'
                : 'Driver verification required to create trips'}
            </p>
            <p className="text-xs text-amber-600">Tap to view details →</p>
          </div>
        </button>
      )}

      {/* Vehicle section */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800">Your Vehicle</h2>

        {loadingVehicles ? (
          <Spinner />
        ) : vehicleList.length === 0 && !showVehicleForm ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center">
            <p className="text-sm text-slate-500">No vehicles added yet.</p>
            <button
              onClick={() => setShowVehicleForm(true)}
              className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white mx-auto"
            >
              <Plus size={15} /> Add Vehicle
            </button>
          </div>
        ) : !showVehicleForm ? (
          <div className="flex items-center justify-between">
            <select
              {...tripForm.register('vehicleId')}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none"
            >
              <option value="">Select vehicle</option>
              {vehicleList.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.model} · {v.numberPlate}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowVehicleForm(true)}
              className="ml-3 flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Plus size={13} /> Add
            </button>
          </div>
        ) : null}

        {tripForm.formState.errors.vehicleId && (
          <p className="mt-1 text-xs text-red-500">{tripForm.formState.errors.vehicleId.message}</p>
        )}

        {/* Add vehicle form */}
        {showVehicleForm && (
          <form onSubmit={vehicleForm.handleSubmit(onAddVehicle)} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
                <select
                  {...vehicleForm.register('type')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none"
                >
                  <option value="car">Car</option>
                  <option value="suv">SUV</option>
                  <option value="van">Van</option>
                  <option value="bike">Bike</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Model</label>
                <input
                  {...vehicleForm.register('model')}
                  placeholder="Hyundai i20"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none"
                />
                {vehicleForm.formState.errors.model && (
                  <p className="mt-0.5 text-xs text-red-500">{vehicleForm.formState.errors.model.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Number Plate</label>
                <input
                  {...vehicleForm.register('numberPlate')}
                  placeholder="MP09AB1234"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none"
                />
                {vehicleForm.formState.errors.numberPlate && (
                  <p className="mt-0.5 text-xs text-red-500">{vehicleForm.formState.errors.numberPlate.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Seat Capacity</label>
                <input
                  {...vehicleForm.register('seatCapacity')}
                  type="number"
                  min={1}
                  max={9}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creatingVehicle}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-400 disabled:opacity-60"
              >
                {creatingVehicle ? 'Saving...' : 'Save Vehicle'}
              </button>
              <button
                type="button"
                onClick={() => setShowVehicleForm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Trip form */}
      <form onSubmit={tripForm.handleSubmit(onCreateTrip)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-slate-800">Trip Details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">From</label>
            <select
              {...tripForm.register('sourceName')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none"
            >
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            {tripForm.formState.errors.sourceName && (
              <p className="mt-1 text-xs text-red-500">{tripForm.formState.errors.sourceName.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">To</label>
            <select
              {...tripForm.register('destinationName')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none"
            >
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c.name} value={c.name} disabled={c.name === src}>{c.name}</option>
              ))}
            </select>
            {tripForm.formState.errors.destinationName && (
              <p className="mt-1 text-xs text-red-500">{tripForm.formState.errors.destinationName.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Departure Date</label>
            <input
              {...tripForm.register('departureDate')}
              type="date"
              min={today}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none"
            />
            {tripForm.formState.errors.departureDate && (
              <p className="mt-1 text-xs text-red-500">{tripForm.formState.errors.departureDate.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Departure Time</label>
            <input
              {...tripForm.register('departureTime')}
              type="time"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none"
            />
            {tripForm.formState.errors.departureTime && (
              <p className="mt-1 text-xs text-red-500">{tripForm.formState.errors.departureTime.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Available Seats</label>
            <input
              {...tripForm.register('availableSeats')}
              type="number"
              min={1}
              max={7}
              defaultValue={1}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none"
            />
            {tripForm.formState.errors.availableSeats && (
              <p className="mt-1 text-xs text-red-500">{tripForm.formState.errors.availableSeats.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Price per Seat (₹)</label>
            <input
              {...tripForm.register('pricePerSeat')}
              type="number"
              min={1}
              placeholder="450"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none"
            />
            {tripForm.formState.errors.pricePerSeat && (
              <p className="mt-1 text-xs text-red-500">{tripForm.formState.errors.pricePerSeat.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={creatingTrip}
          className="mt-6 w-full rounded-lg bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-400 disabled:opacity-60"
        >
          {creatingTrip ? 'Creating Trip...' : 'Create Trip'}
        </button>
      </form>

      {showVerificationGate && (
        <VerificationGateModal
          status={verificationStatus as any}
          rejectionReason={verificationData?.rejectionReason}
          onClose={() => setShowVerificationGate(false)}
        />
      )}
    </div>
  )
}
