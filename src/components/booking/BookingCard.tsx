'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Clock, Users, IndianRupee, CreditCard, Navigation, CheckCircle, Star } from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import PaymentModal from '@/components/booking/PaymentModal'
import RatingModal from '@/components/rating/RatingModal'
import { useUpdateBookingStatus } from '@/hooks/useBookings'
import type { Booking } from '@/types/booking'

export default function BookingCard({ booking }: { booking: Booking }) {
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus()
  const [showPayment, setShowPayment] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [rated, setRated] = useState(false)

  const trip = booking.trip
  const dep = trip ? new Date(trip.departureTime) : null
  const tripCompleted = trip?.status === 'COMPLETED'
  const canTrack =
    booking.bookingStatus === 'CONFIRMED' &&
    booking.paymentStatus === 'PAID' &&
    !tripCompleted

  const needsPayment =
    booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'PAID' === false &&
    booking.paymentStatus === 'PENDING'

  const cancel = () => updateStatus({ id: booking.id, status: 'CANCELLED' })

  return (
    <>
      <div
        className={`rounded-xl border bg-white p-5 shadow-sm transition ${
          needsPayment ? 'border-green-300 ring-2 ring-green-100' : 'border-slate-200'
        }`}
      >
        {/* Route */}
        {trip && (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-green-500 shrink-0" />
              <p className="font-semibold text-slate-800">
                {trip.sourceName} → {trip.destinationName}
              </p>
            </div>
            <StatusBadge status={booking.bookingStatus} />
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
          {dep && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {dep.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}
              {dep.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <IndianRupee size={14} />
            {booking.totalAmount}
          </span>
        </div>

        {/* Payment badge */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-slate-500">Payment:</span>
          <StatusBadge status={booking.paymentStatus} />
        </div>

        {/* Trip completed banner */}
        {tripCompleted && booking.bookingStatus === 'CONFIRMED' && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 border border-slate-200">
            <CheckCircle size={16} className="text-green-500 shrink-0" />
            <span className="text-sm font-medium text-slate-700">Trip completed</span>
          </div>
        )}

        {/* Pay Now */}
        {needsPayment && (
          <button
            onClick={() => setShowPayment(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
          >
            <CreditCard size={16} />
            Pay Now to Confirm Seat
          </button>
        )}

        {/* Track & Chat — only while trip is active */}
        {canTrack && (
          <Link
            href={`/tracking/${booking.tripId}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <Navigation size={15} />
            Track & Chat
          </Link>
        )}

        {/* Rate Driver — shown after trip completed and paid, not yet rated */}
        {tripCompleted &&
          booking.bookingStatus === 'CONFIRMED' &&
          booking.paymentStatus === 'PAID' &&
          !rated &&
          trip?.driver && (
            <button
              onClick={() => setShowRating(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <Star size={15} className="fill-amber-500 text-amber-500" />
              Rate Your Driver
            </button>
          )}

        {/* Already rated */}
        {rated && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 py-2.5 text-sm text-slate-500">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            Rating submitted — thanks!
          </div>
        )}

        {/* Cancel */}
        {booking.bookingStatus === 'PENDING' && (
          <button
            onClick={cancel}
            disabled={isPending}
            className="mt-4 w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
          >
            {isPending ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        )}
      </div>

      {showPayment && (
        <PaymentModal booking={booking} onClose={() => setShowPayment(false)} />
      )}

      {showRating && trip?.driver && (
        <RatingModal
          driverId={trip.driver.id}
          driverName={trip.driver.fullName ?? 'Driver'}
          tripId={booking.tripId}
          onClose={() => {
            setShowRating(false)
            setRated(true)
          }}
        />
      )}
    </>
  )
}
