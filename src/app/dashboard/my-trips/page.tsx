'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronDown, ChevronUp, MapPin, Clock, Users, Car, Play, Square, Navigation } from 'lucide-react'
import { useMyTrips, useTripBookings, useUpdateTrip } from '@/hooks/useTrips'
import { useUpdateBookingStatus } from '@/hooks/useBookings'
import StatusBadge from '@/components/common/StatusBadge'
import Spinner from '@/components/common/Spinner'
import type { Trip } from '@/types/trip'
import type { Booking } from '@/types/booking'

export default function MyTripsPage() {
  const { data: trips, isLoading } = useMyTrips()
  const [expanded, setExpanded] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  const tripList: Trip[] = Array.isArray(trips) ? trips : []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500 p-2.5 text-white shadow-lg shadow-cyan-500/30">
            <Car size={20} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
        </div>
        <Link
          href="/dashboard/create-trip"
          className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-green-500/30 transition hover:bg-green-400"
        >
          <Plus size={16} /> Create Trip
        </Link>
      </div>

      {tripList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="font-medium text-slate-500">No trips yet.</p>
          <p className="mt-1 text-sm text-slate-400">Create your first trip to get started.</p>
          <Link
            href="/dashboard/create-trip"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} /> Create Trip
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tripList.map((trip) => (
            <TripRow
              key={trip.id}
              trip={trip}
              isExpanded={expanded === trip.id}
              onToggle={() => setExpanded(expanded === trip.id ? null : trip.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TripRow({
  trip,
  isExpanded,
  onToggle,
}: {
  trip: Trip
  isExpanded: boolean
  onToggle: () => void
}) {
  const { data: bookings, isLoading } = useTripBookings(trip.id, isExpanded)
  const { mutate: updateTrip, isPending: updatingTrip } = useUpdateTrip()

  const dep = new Date(trip.departureTime)

  const cancelTrip = () => {
    if (!confirm('Cancel this trip? All bookings will be affected.')) return
    updateTrip({ id: trip.id, status: 'CANCELLED' })
  }

  const endTrip = () => updateTrip({ id: trip.id, status: 'COMPLETED' })

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Trip summary */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <div className="h-5 w-px bg-slate-200" />
              <MapPin size={12} className="text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{trip.sourceName}</p>
              <p className="mt-2 font-semibold text-slate-900">{trip.destinationName}</p>
            </div>
          </div>
          <div className="text-right">
            <StatusBadge status={trip.status} />
            <p className="mt-2 text-xl font-bold text-green-600">₹{trip.pricePerSeat}</p>
            <p className="text-xs text-slate-400">per seat</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {dep.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' · '}
            {dep.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            {trip.availableSeats} seats left
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Booking Requests
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Track & Start (OTP verification happens on the tracking page) */}
          {trip.status === 'OPEN' && (
            <Link
              href={`/tracking/${trip.id}`}
              className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-400"
            >
              <Play size={12} fill="white" /> Track & Start
            </Link>
          )}

          {/* End Trip */}
          {trip.status === 'STARTED' && (
            <>
              <button
                onClick={endTrip}
                disabled={updatingTrip}
                className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-400 disabled:opacity-50"
              >
                <Square size={12} fill="white" /> End Trip
              </button>
              <Link
                href={`/tracking/${trip.id}`}
                className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-400"
              >
                <Navigation size={12} /> Track Live
              </Link>
            </>
          )}

          {trip.status === 'OPEN' && (
            <button
              onClick={cancelTrip}
              disabled={updatingTrip}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
              Cancel Trip
            </button>
          )}
        </div>
      </div>

      {/* Booking requests */}
      {isExpanded && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : !Array.isArray(bookings) || bookings.length === 0 ? (
            <p className="text-sm text-slate-400">No booking requests yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b: Booking) => (
                <BookingRequest key={b.id} booking={b} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BookingRequest({ booking }: { booking: Booking }) {
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus()

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-700">
          {booking.passenger?.fullName ?? 'Passenger'}
        </p>
        <p className="text-xs text-slate-400">
          {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''} · ₹{booking.totalAmount}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={booking.bookingStatus} />
        {booking.bookingStatus === 'PENDING' && (
          <>
            <button
              onClick={() => updateStatus({ id: booking.id, status: 'CONFIRMED' })}
              disabled={isPending}
              className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-400 disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() => updateStatus({ id: booking.id, status: 'REJECTED' })}
              disabled={isPending}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}
