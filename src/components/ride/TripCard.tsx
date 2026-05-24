import Link from 'next/link'
import { MapPin, Clock, Users, Star, ArrowRight } from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import type { Trip } from '@/types/trip'

export default function TripCard({ trip }: { trip: Trip }) {
  const dep = new Date(trip.departureTime)
  const dateStr = dep.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const timeStr = dep.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <Link
      href={`/trip/${trip.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-green-300 hover:shadow-lg"
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-green-400 to-cyan-400" />

      <div className="p-5">
        {/* Route */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex flex-col items-center gap-1">
              <div className="h-3 w-3 rounded-full border-2 border-green-500 bg-green-100" />
              <div className="h-7 w-px bg-gradient-to-b from-green-400 to-slate-300" />
              <MapPin size={14} className="text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{trip.sourceName}</p>
              <div className="my-1 flex items-center gap-1 text-xs text-slate-400">
                <ArrowRight size={10} />
                <span>{dateStr} · {timeStr}</span>
              </div>
              <p className="font-semibold text-slate-900">{trip.destinationName}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold text-green-600">₹{trip.pricePerSeat}</p>
            <p className="text-xs text-slate-400">per seat</p>
            <div className="mt-1.5">
              <StatusBadge status={trip.status} />
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-4 flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
            <Users size={12} className="text-green-500" />
            {trip.availableSeats} seat{trip.availableSeats !== 1 ? 's' : ''} left
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
            <Clock size={12} className="text-cyan-500" />
            {timeStr}
          </span>
        </div>

        {/* Driver */}
        {trip.driver && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-cyan-500 text-sm font-bold text-white shadow-sm">
                {trip.driver.fullName?.[0]?.toUpperCase() ?? 'D'}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{trip.driver.fullName}</p>
                <span className="flex items-center gap-0.5 text-xs text-amber-500">
                  <Star size={10} fill="currentColor" />
                  {trip.driver.rating}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-green-600 group-hover:underline">
              View →
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
