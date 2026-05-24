'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchTrips } from '@/hooks/useTrips'
import { CITIES } from '@/constants/cities'
import TripCard from '@/components/ride/TripCard'
import Spinner from '@/components/common/Spinner'
import type { SearchTripsParams } from '@/types/trip'
import type { Trip } from '@/types/trip'
import Navbar from '@/components/layout/Navbar'

export default function SearchPage() {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [seats, setSeats] = useState(1)
  const [searchParams, setSearchParams] = useState<SearchTripsParams | null>(null)

  const { data: trips, isLoading, error } = useSearchTrips(searchParams ?? {}, !!searchParams)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const src = CITIES.find((c) => c.name === source)
    const dst = CITIES.find((c) => c.name === destination)
    if (!src || !dst) return
    setSearchParams({
      sourceLat: src.lat,
      sourceLng: src.lng,
      destinationLat: dst.lat,
      destinationLng: dst.lng,
      seats,
      departureAfter: date ? new Date(date + 'T00:00:00').toISOString() : undefined,
      limit: 20,
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-green-500 p-2.5 shadow-lg shadow-green-500/30 text-white">
            <Search size={20} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Find a Ride</h1>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">From</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name} disabled={c.name === destination}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">To</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name} disabled={c.name === source}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Seats</label>
              <input
                type="number"
                min={1}
                max={7}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-400"
          >
            <Search size={16} />
            Search Trips
          </button>
        </form>

        {/* Results */}
        <div className="mt-8">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Failed to load trips. Please try again.
            </div>
          )}

          {!isLoading && trips && (
            <>
              <p className="mb-4 text-sm text-slate-500">
                {Array.isArray(trips) ? trips.length : 0} trip
                {Array.isArray(trips) && trips.length !== 1 ? 's' : ''} found
              </p>
              {Array.isArray(trips) && trips.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
                  <p className="font-medium text-slate-500">No trips found for this route.</p>
                  <p className="mt-1 text-sm text-slate-400">Try a different date or city.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {Array.isArray(trips) &&
                    trips.map((trip: Trip) => <TripCard key={trip.id} trip={trip} />)}
                </div>
              )}
            </>
          )}

          {!isLoading && !trips && !error && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <p className="font-medium text-slate-500">Select source, destination and search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
