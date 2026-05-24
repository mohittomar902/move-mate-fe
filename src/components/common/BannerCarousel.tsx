'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Users, Package, Shield, Car, Star, MapPin, Clock, Truck, BadgeCheck } from 'lucide-react'
import { cn } from '@/utils'

const slides = [
  {
    id: 1,
    bg: 'from-emerald-50 via-green-50 to-teal-50',
    accentBar: 'from-green-400 to-teal-400',
    dot: 'bg-green-500',
    badge: { label: 'Ride Sharing', color: 'bg-green-100 text-green-700' },
    headline: ['Share the Journey.', 'Save Together.'],
    headlineColors: ['text-slate-900', 'text-green-500'],
    sub: 'MoveMate connects people going your way. Share seats, split costs, travel smarter.',
    features: [
      { icon: Users, label: 'Share Rides', desc: 'Travel together, spend less', color: 'text-green-600 bg-green-100' },
      { icon: Package, label: 'Send Parcels', desc: 'Deliver quickly and safely', color: 'text-teal-600 bg-teal-100' },
      { icon: Shield, label: 'Trusted Community', desc: 'Verified users, secure transactions', color: 'text-blue-600 bg-blue-100' },
    ],
    visual: 'ride',
  },
  {
    id: 2,
    bg: 'from-blue-50 via-indigo-50 to-violet-50',
    accentBar: 'from-blue-400 to-indigo-500',
    dot: 'bg-blue-500',
    badge: { label: 'Community', color: 'bg-blue-100 text-blue-700' },
    headline: ['Your Ride.', 'Better Together.'],
    headlineColors: ['text-slate-900', 'text-blue-500'],
    sub: 'Join MoveMate and be part of a smarter, kinder way to travel across India.',
    stats: [
      { icon: Users, value: '10K+', label: 'Happy Users', color: 'text-blue-600' },
      { icon: Car, value: '5K+', label: 'Rides Shared', color: 'text-indigo-600' },
      { icon: Package, value: '2K+', label: 'Parcels Delivered', color: 'text-violet-600' },
      { icon: Star, value: '4.8', label: 'Average Rating', color: 'text-amber-500' },
    ],
    visual: 'stats',
  },
  {
    id: 3,
    bg: 'from-orange-50 via-amber-50 to-yellow-50',
    accentBar: 'from-orange-400 to-amber-400',
    dot: 'bg-orange-500',
    badge: { label: 'Parcel Delivery', color: 'bg-orange-100 text-orange-700' },
    headline: ['Need to send', 'something important?'],
    headlineColors: ['text-slate-900', 'text-orange-500'],
    sub: "Fast, reliable and secure parcel delivery through trusted travelers. We've got a MoveMate for that.",
    features: [
      { icon: Clock, label: 'On-time Delivery', desc: 'Track your parcel live', color: 'text-orange-600 bg-orange-100' },
      { icon: Shield, label: 'Safe & Secure', desc: 'Insured shipments', color: 'text-amber-600 bg-amber-100' },
      { icon: MapPin, label: 'Real-time Tracking', desc: 'Know where it is', color: 'text-yellow-700 bg-yellow-100' },
      { icon: BadgeCheck, label: 'Affordable Rates', desc: 'Best price guaranteed', color: 'text-green-600 bg-green-100' },
    ],
    visual: 'parcel',
  },
]

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 4500)
    return () => clearInterval(id)
  }, [paused, next])

  const slide = slides[current]

  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${slide.accentBar} transition-all duration-700`} />

      {/* Slide — fixed height so all slides are identical */}
      <div className={`bg-gradient-to-br ${slide.bg} h-[220px] overflow-hidden px-6 transition-all duration-500 md:px-10`}>
        <div className="flex h-full flex-row items-center justify-between gap-6">

          {/* Left content */}
          <div className="flex-1">
            {/* Badge */}
            <span className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${slide.badge.color}`}>
              {slide.badge.label}
            </span>

            {/* Headline */}
            <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
              <span className={slide.headlineColors[0]}>{slide.headline[0]} </span>
              <span className={slide.headlineColors[1]}>{slide.headline[1]}</span>
            </h2>

            {/* Sub */}
            <p className="mt-2 max-w-sm text-sm text-slate-500">{slide.sub}</p>

            {/* Features / Stats */}
            <div className="mt-5">
              {slide.features && (
                <div className="flex flex-wrap gap-3">
                  {slide.features.map((f) => (
                    <div key={f.label} className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3 py-2 backdrop-blur-sm">
                      <div className={`rounded-lg p-1.5 ${f.color}`}>
                        <f.icon size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{f.label}</p>
                        <p className="text-[10px] text-slate-400">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {slide.stats && (
                <div className="flex flex-wrap gap-4">
                  {slide.stats.map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1 rounded-xl border border-white/80 bg-white/70 px-4 py-3 backdrop-blur-sm">
                      <s.icon size={18} className={s.color} />
                      <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] font-medium text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right visual */}
          <div className="shrink-0 flex items-center justify-center">
            <SlideVisual type={slide.visual} bar={slide.accentBar} />
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur-sm transition hover:bg-white"
      >
        <ChevronLeft size={18} className="text-slate-600" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur-sm transition hover:bg-white"
      >
        <ChevronRight size={18} className="text-slate-600" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            className={cn(
              'rounded-full transition-all duration-300',
              i === current ? `${slide.dot} h-2 w-6` : 'h-2 w-2 bg-slate-300',
            )}
          />
        ))}
      </div>
    </div>
  )
}

function SlideVisual({ type, bar }: { type: string; bar: string }) {
  if (type === 'ride') {
    return (
      <div className="relative flex h-36 w-48 items-end justify-center">
        {/* Road */}
        <div className="absolute bottom-0 h-4 w-full rounded-full bg-slate-200/80" />
        {/* Route line */}
        <svg className="absolute inset-0" viewBox="0 0 192 144" fill="none">
          <path d="M40 120 Q70 60 96 40 Q122 20 152 30" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" />
          <circle cx="40" cy="120" r="5" fill="#22c55e" />
          <circle cx="152" cy="30" r="5" fill="#0ea5e9" />
        </svg>
        {/* Car */}
        <div className="relative z-10 mb-4 flex h-14 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 shadow-lg shadow-green-400/40">
          <Car size={32} className="text-white" />
        </div>
        {/* Pin top */}
        <div className="absolute right-6 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 shadow-md shadow-blue-400/40">
          <MapPin size={16} className="text-white" />
        </div>
      </div>
    )
  }

  if (type === 'stats') {
    return (
      <div className="flex h-36 w-48 flex-col items-center justify-center gap-3">
        <div className="flex gap-3">
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-400/40 text-white">
            <Users size={22} />
            <span className="mt-1 text-xs font-bold">10K+</span>
          </div>
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 shadow-lg shadow-indigo-400/40 text-white">
            <Car size={22} />
            <span className="mt-1 text-xs font-bold">5K+</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-violet-400/40 text-white">
            <Package size={22} />
            <span className="mt-1 text-xs font-bold">2K+</span>
          </div>
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg shadow-amber-400/40 text-white">
            <Star size={22} fill="white" />
            <span className="mt-1 text-xs font-bold">4.8</span>
          </div>
        </div>
      </div>
    )
  }

  // parcel
  return (
    <div className="relative flex h-36 w-48 items-end justify-center">
      {/* Stack of boxes */}
      <div className="relative z-10 mb-4 flex flex-col items-center gap-1.5">
        <div className="flex gap-1.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-300 to-amber-400 shadow-md" />
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-400 shadow-md" />
        </div>
        <div className="h-10 w-24 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-400/40 flex items-center justify-center">
          <Package size={20} className="text-white" />
        </div>
      </div>
      {/* Truck */}
      <div className="absolute right-2 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 shadow-lg shadow-orange-400/40">
        <Truck size={22} className="text-white" />
      </div>
      {/* Pin */}
      <div className="absolute left-4 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-md">
        <MapPin size={14} className="text-white" />
      </div>
    </div>
  )
}
