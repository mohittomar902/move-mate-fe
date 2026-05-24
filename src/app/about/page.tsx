import Image from 'next/image'
import Link from 'next/link'
import {
  Users, Car, Package, Shield, MapPin, Star, Zap, Clock,
  CheckCircle2, ArrowRight, Phone, HeartHandshake, Globe,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-24 text-white">
        {/* glow blobs */}
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 text-center md:flex-row md:text-left">
          {/* text */}
          <div className="flex-1">
            <span className="mb-4 inline-block rounded-full bg-green-500/20 px-4 py-1.5 text-sm font-semibold text-green-400">
              About MoveMate
            </span>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Connecting India,{' '}
              <span className="text-green-400">One Ride at a Time</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-400">
              MoveMate is India&apos;s trusted carpooling platform that connects drivers with
              empty seats to passengers going the same way — making travel affordable,
              social, and sustainable.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/30 transition hover:bg-green-400"
              >
                Find a Ride <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-300 transition hover:border-green-500 hover:text-white"
              >
                Join MoveMate
              </Link>
            </div>
          </div>

          {/* logo visual */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-3xl bg-green-400/20 blur-3xl" />
            <Image
              src="/logo.png"
              alt="MoveMate"
              width={200}
              height={200}
              className="relative rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-b border-slate-100 bg-slate-50 px-4 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: '10K+', label: 'Happy Users', icon: Users, color: 'text-green-600 bg-green-100' },
            { value: '5K+', label: 'Rides Shared', icon: Car, color: 'text-blue-600 bg-blue-100' },
            { value: '2K+', label: 'Parcels Delivered', icon: Package, color: 'text-purple-600 bg-purple-100' },
            { value: '4.8★', label: 'Average Rating', icon: Star, color: 'text-amber-600 bg-amber-100' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-sm">
              <div className={`rounded-xl p-3 ${s.color}`}>
                <s.icon size={22} />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
              Simple Process
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">How MoveMate Works</h2>
            <p className="mt-3 text-slate-500">Get from point A to B in three easy steps</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <StepCard
              step="01"
              icon={Phone}
              title="Sign Up in Seconds"
              desc="Create your account with just a phone number. OTP verification keeps your account secure."
              color="from-green-400 to-emerald-500"
              visual={<PhoneVisual />}
            />
            <StepCard
              step="02"
              icon={MapPin}
              title="Search or Post a Trip"
              desc="Find rides going your way, or post your own trip and offer empty seats to earn money."
              color="from-blue-400 to-cyan-500"
              visual={<MapVisual />}
            />
            <StepCard
              step="03"
              icon={CheckCircle2}
              title="Ride & Pay Securely"
              desc="Driver accepts your request, you pay online, and travel together. Safe, simple, affordable."
              color="from-purple-400 to-violet-500"
              visual={<PayVisual />}
            />
          </div>

          {/* connector arrows desktop */}
          <div className="mt-4 hidden items-center justify-center gap-4 sm:flex">
            {[0, 1].map((i) => (
              <div key={i} className="flex flex-1 items-center justify-center">
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-slate-300" />
                <ArrowRight size={18} className="mx-2 text-slate-300" />
                <div className="h-px flex-1 bg-gradient-to-r from-slate-300 to-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-600">
              Why MoveMate
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Everything You Need</h2>
            <p className="mt-3 text-slate-500">Built for safe, comfortable, and affordable travel across India</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Shield}
              title="Verified Drivers"
              desc="Every driver on MoveMate is identity-verified. You know who you're riding with before you book."
              iconCls="bg-green-500 shadow-green-500/30"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Booking"
              desc="Search, book, and confirm your seat in under a minute. No phone calls, no waiting."
              iconCls="bg-blue-500 shadow-blue-500/30"
            />
            <FeatureCard
              icon={Globe}
              title="16+ Cities"
              desc="From Indore to Bhopal, Jaipur to Ahmedabad — we cover the routes that matter to you."
              iconCls="bg-purple-500 shadow-purple-500/30"
            />
            <FeatureCard
              icon={HeartHandshake}
              title="Community Driven"
              desc="Ratings and reviews from real passengers and drivers build a trusted community."
              iconCls="bg-pink-500 shadow-pink-500/30"
            />
            <FeatureCard
              icon={Package}
              title="Send Parcels"
              desc="Need to send something? Trusted travelers carry your parcels safely to the destination."
              iconCls="bg-orange-500 shadow-orange-500/30"
            />
            <FeatureCard
              icon={Clock}
              title="Real-time Updates"
              desc="Track your booking status live. Get notified the moment your driver accepts your request."
              iconCls="bg-teal-500 shadow-teal-500/30"
            />
          </div>
        </div>
      </section>

      {/* ── FOR DRIVERS & PASSENGERS ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-2">
          {/* Passengers */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 p-3 text-white shadow-lg shadow-green-400/30">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">For Passengers</h3>
            </div>
            <ul className="space-y-3">
              {[
                'Search trips by city and date in seconds',
                'Compare prices across multiple drivers',
                'Book your seat with secure online payment',
                'Rate your experience after every ride',
                'Track your booking status in real-time',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
            <PassengerIllustration />
          </div>

          {/* Drivers */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 p-3 text-white shadow-lg shadow-cyan-400/30">
                <Car size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">For Drivers</h3>
            </div>
            <ul className="space-y-3">
              {[
                'Post your trip in under 2 minutes',
                'Set your own price per seat',
                'Accept or reject passenger requests',
                'Earn money on trips you already take',
                'Build your driver rating over time',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
            <DriverIllustration />
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="bg-gradient-to-br from-green-50 to-teal-50 px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-3 inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
            Our Mission
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Making Travel Affordable for Every Indian
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            We believe that everyone deserves comfortable, affordable intercity travel.
            By connecting people going the same direction, MoveMate reduces travel costs,
            eases highway congestion, and builds human connections one shared ride at a time.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-green-400/20 blur-xl" />
              <Image
                src="/logo.png"
                alt="MoveMate"
                width={72}
                height={72}
                className="relative rounded-2xl shadow-xl"
              />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-slate-900">MoveMate</p>
              <p className="text-sm text-slate-500">Share the Journey. Save Together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-slate-900 px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold">Ready to Share the Journey?</h2>
          <p className="mt-3 text-slate-400">
            Join thousands of Indians already saving money and making friends on every trip.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/search"
              className="flex items-center gap-2 rounded-xl bg-green-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-green-500/30 transition hover:bg-green-400"
            >
              <Car size={18} /> Find a Ride
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl border border-slate-600 px-8 py-3.5 font-semibold text-slate-300 transition hover:border-green-500 hover:text-white"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ─── Sub-components ─── */

function StepCard({
  step, icon: Icon, title, desc, color, visual,
}: {
  step: string
  icon: React.ElementType
  title: string
  desc: string
  color: string
  visual: React.ReactNode
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="absolute right-4 top-4 text-5xl font-black text-slate-50">{step}</span>
      <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br p-3 text-white shadow-lg ${color}`}>
        <Icon size={22} />
      </div>
      <h3 className="mb-2 font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
      <div className="mt-5 flex justify-center">{visual}</div>
    </div>
  )
}

function FeatureCard({
  icon: Icon, title, desc, iconCls,
}: {
  icon: React.ElementType
  title: string
  desc: string
  iconCls: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className={`mb-4 inline-flex rounded-xl p-3 text-white shadow-md ${iconCls}`}>
        <Icon size={20} />
      </div>
      <h3 className="mb-1.5 font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  )
}

/* ─── Inline illustrations ─── */

function PhoneVisual() {
  return (
    <div className="flex h-28 w-full items-end justify-center">
      <div className="relative flex h-24 w-14 flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 shadow-md">
        <div className="h-3 bg-slate-200" />
        <div className="flex flex-1 flex-col items-center justify-center gap-1 p-1">
          <div className="h-1.5 w-8 rounded-full bg-green-400" />
          <div className="h-1.5 w-6 rounded-full bg-slate-300" />
          <div className="mt-1 flex h-6 w-8 items-center justify-center rounded-lg bg-green-500 text-white">
            <Phone size={12} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MapVisual() {
  return (
    <div className="relative flex h-28 w-full items-center justify-center">
      <svg viewBox="0 0 120 80" className="h-24 w-36">
        <rect x="5" y="5" width="110" height="70" rx="10" fill="#f1f5f9" />
        <path d="M20 60 Q50 20 100 25" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="5 3" fill="none" strokeLinecap="round" />
        <circle cx="20" cy="60" r="5" fill="#22c55e" />
        <circle cx="100" cy="25" r="5" fill="#0ea5e9" />
        <path d="M95 25 Q100 18 105 25 Q100 35 95 25Z" fill="#0ea5e9" />
      </svg>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="flex h-7 w-14 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-cyan-500 shadow-md">
          <Car size={14} className="text-white" />
        </div>
      </div>
    </div>
  )
}

function PayVisual() {
  return (
    <div className="flex h-28 w-full items-center justify-center gap-3">
      <div className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 border border-purple-200 shadow-sm">
        <CheckCircle2 size={22} className="text-purple-500" />
        <span className="text-[10px] font-semibold text-purple-600">Confirmed</span>
      </div>
      <ArrowRight size={16} className="text-slate-300" />
      <div className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 shadow-sm">
        <span className="text-xl font-black text-green-600">₹</span>
        <span className="text-[10px] font-semibold text-green-600">Paid</span>
      </div>
    </div>
  )
}

function PassengerIllustration() {
  return (
    <div className="mt-6 flex items-end justify-center gap-3 rounded-xl bg-green-50 py-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1"
          style={{ marginBottom: i === 2 ? 8 : 0 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-sm font-bold text-white shadow-md">
            {['A', 'B', 'C'][i - 1]}
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
        </div>
      ))}
      <div className="ml-2 flex h-12 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-500 shadow-md">
        <Car size={22} className="text-white" />
      </div>
    </div>
  )
}

function DriverIllustration() {
  return (
    <div className="mt-6 flex items-center justify-between rounded-xl bg-white/10 px-4 py-4">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-white shadow-md">
          D
        </div>
        <div>
          <p className="text-xs font-semibold text-white">Your Trip</p>
          <p className="text-[10px] text-slate-400">Indore → Bhopal</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
          3 seats
        </span>
        <span className="text-sm font-bold text-cyan-400">₹450</span>
      </div>
    </div>
  )
}
