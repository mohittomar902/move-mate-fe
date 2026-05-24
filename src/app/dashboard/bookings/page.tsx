'use client'

import { useMyBookings } from '@/hooks/useBookings'
import BookingCard from '@/components/booking/BookingCard'
import Spinner from '@/components/common/Spinner'
import Link from 'next/link'
import { Search, Ticket } from 'lucide-react'
import type { Booking } from '@/types/booking'

export default function BookingsPage() {
  const { data: bookings, isLoading, error } = useMyBookings()

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  const list: Booking[] = Array.isArray(bookings) ? bookings : []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-500 p-2.5 text-white shadow-lg shadow-purple-500/30">
            <Ticket size={20} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <Search size={15} /> Find a Ride
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load bookings.
        </div>
      )}

      {!error && list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="font-medium text-slate-500">No bookings yet.</p>
          <p className="mt-1 text-sm text-slate-400">Search for a trip and book your seat.</p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white"
          >
            <Search size={15} /> Find a Ride
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  )
}
