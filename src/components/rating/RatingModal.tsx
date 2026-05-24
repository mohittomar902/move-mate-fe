'use client'

import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { useCreateRating } from '@/hooks/useRatings'
import { cn } from '@/utils'

interface Props {
  driverId: string
  driverName: string
  tripId: string
  onClose: () => void
}

export default function RatingModal({ driverId, driverName, tripId, onClose }: Props) {
  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [review, setReview] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { mutate: rate, isPending, isError } = useCreateRating()

  const submit = () => {
    if (!stars) return
    rate(
      { toUserId: driverId, tripId, rating: stars, review: review.trim() || undefined },
      {
        onSuccess: () => setSubmitted(true),
      },
    )
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Star size={28} className="fill-green-500 text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Thanks for the feedback!</h3>
          <p className="mt-1 text-sm text-slate-500">Your rating helps improve the community.</p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-400"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:px-4">
      <div className="w-full max-w-sm rounded-t-2xl bg-white px-6 pb-8 pt-5 shadow-2xl sm:rounded-2xl">
        {/* Drag handle on mobile */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Rate your driver</h3>
            <p className="text-sm text-slate-500">How was your trip with {driverName}?</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Stars */}
        <div className="mb-5 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setStars(n)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={36}
                className={cn(
                  'transition-colors',
                  n <= (hovered || stars)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-100 text-slate-200',
                )}
              />
            </button>
          ))}
        </div>

        <p className="mb-3 text-center text-xs font-medium text-slate-500">
          {stars === 0 ? 'Tap a star to rate' : ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][stars]}
        </p>

        {/* Review */}
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Leave a comment (optional)…"
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100"
        />

        {isError && (
          <p className="mt-2 text-center text-xs text-red-500">
            Could not submit rating. You may have already rated this driver.
          </p>
        )}

        <button
          onClick={submit}
          disabled={!stars || isPending}
          className="mt-4 w-full rounded-xl bg-green-500 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-400 disabled:opacity-40"
        >
          {isPending ? 'Submitting…' : 'Submit Rating'}
        </button>
      </div>
    </div>
  )
}
