'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Clock, Users, Star, Car, ArrowLeft } from 'lucide-react'
import { useTrip } from '@/hooks/useTrips'
import { useCreateBooking } from '@/hooks/useBookings'
import { useAuthStore } from '@/store/auth.store'
import StatusBadge from '@/components/common/StatusBadge'
import Spinner from '@/components/common/Spinner'
import Navbar from '@/components/layout/Navbar'

export default function TripPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data: trip, isLoading, error } = useTrip(id)
  const { mutate: book, isPending: isBooking } = useCreateBooking()

  const [seats, setSeats] = useState(1)
  const [booked, setBooked] = useState(false)

  const isOwnTrip = trip?.driverId === user?.id
  const canBook = isAuthenticated && !isOwnTrip && trip?.status === 'OPEN' && trip?.availableSeats > 0

  const handleBook = () => {
    if (!trip) return
    book(
      { tripId: trip.id, seatsBooked: seats },
      {
        onSuccess: () => setBooked(true),
        onError: (err: any) => {
          alert(err?.response?.data?.message ?? 'Booking failed. Please try again.')
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <p className="text-slate-500">Trip not found.</p>
        </div>
      </div>
    )
  }

  const dep = new Date(trip.departureTime)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Route header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div className="h-8 w-px bg-slate-300" />
                <MapPin size={14} className="text-slate-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{trip.sourceName}</p>
                <p className="mt-5 text-lg font-bold text-slate-900">{trip.destinationName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">₹{trip.pricePerSeat}</p>
              <p className="text-xs text-slate-400">per seat</p>
              <div className="mt-2">
                <StatusBadge status={trip.status} />
              </div>
            </div>
          </div>

          {/* Trip meta */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={16} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Departure</p>
                <p className="font-medium">
                  {dep.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs">
                  {dep.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users size={16} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Seats available</p>
                <p className="font-medium">{trip.availableSeats}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver */}
        {trip.driver && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Driver
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
                {trip.driver.fullName?.[0]?.toUpperCase() ?? 'D'}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{trip.driver.fullName}</p>
                <div className="mt-0.5 flex items-center gap-1 text-sm text-amber-500">
                  <Star size={12} fill="currentColor" />
                  <span>{trip.driver.rating}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle */}
        {trip.vehicle && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Vehicle
            </p>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2.5">
                <Car size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{trip.vehicle.model}</p>
                <p className="text-sm text-slate-500 capitalize">
                  {trip.vehicle.type} · {trip.vehicle.numberPlate}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {booked ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 text-xl">
                ✓
              </div>
              <p className="font-semibold text-green-700">Booking Confirmed!</p>
              <p className="mt-1 text-sm text-slate-500">Check My Bookings for details.</p>
              <button
                onClick={() => router.push('/dashboard/bookings')}
                className="mt-4 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-400"
              >
                View My Bookings
              </button>
            </div>
          ) : canBook ? (
            <>
              <p className="mb-4 text-sm font-semibold text-slate-700">Book Your Seat</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-slate-500">Seats</label>
                  <input
                    type="number"
                    min={1}
                    max={trip.availableSeats}
                    value={seats}
                    onChange={(e) => setSeats(Math.min(trip.availableSeats, Math.max(1, Number(e.target.value))))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-black focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-xl font-bold text-green-600">₹{seats * trip.pricePerSeat}</p>
                </div>
              </div>
              <button
                onClick={handleBook}
                disabled={isBooking}
                className="mt-4 w-full rounded-lg bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-400 disabled:opacity-60"
              >
                {isBooking ? 'Booking...' : `Book ${seats} Seat${seats > 1 ? 's' : ''}`}
              </button>
            </>
          ) : isOwnTrip ? (
            <p className="py-2 text-center text-sm text-slate-500">This is your trip.</p>
          ) : !isAuthenticated ? (
            <div className="text-center">
              <p className="text-sm text-slate-500">Sign in to book this trip.</p>
              <a
                href="/login"
                className="mt-3 inline-block rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white"
              >
                Sign In
              </a>
            </div>
          ) : (
            <p className="py-2 text-center text-sm text-slate-500">
              {trip.availableSeats === 0 ? 'No seats available.' : 'Booking not available.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
