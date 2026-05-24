import Image from 'next/image'
import { Search, Car, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-500/15 blur-3xl" />

        {/* Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-3xl bg-green-400/30 blur-2xl" />
          <Image
            src="/logo.png"
            alt="MoveMate"
            width={100}
            height={100}
            className="relative rounded-3xl shadow-2xl"
          />
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Move<span className="text-green-400">Mate</span>
        </h1>
        <p className="mt-4 max-w-md text-lg text-slate-400">
          Share rides, split costs, travel smarter. India&apos;s most trusted carpooling platform.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="/search"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-green-500/30 transition hover:bg-green-400"
          >
            <Search size={18} />
            Find a Ride
          </a>
          <a
            href="/login"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-8 py-3.5 font-semibold text-slate-300 transition hover:border-green-500 hover:text-white"
          >
            Sign In
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={Search}
            iconCls="bg-green-500/20 text-green-400"
            title="Find Rides Instantly"
            desc="Search trips across 16+ cities in India with real-time seat availability."
          />
          <FeatureCard
            icon={Car}
            iconCls="bg-cyan-500/20 text-cyan-400"
            title="Offer Your Seats"
            desc="Post your trip, set your price, and earn money on rides you're already taking."
          />
          <FeatureCard
            icon={Shield}
            iconCls="bg-purple-500/20 text-purple-400"
            title="Safe & Verified"
            desc="All drivers are verified. Secure payments. Trusted by thousands."
          />
        </div>
      </section>
    </main>
  )
}

function FeatureCard({
  icon: Icon,
  iconCls,
  title,
  desc,
}: {
  icon: React.ElementType
  iconCls: string
  title: string
  desc: string
}) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-6 backdrop-blur-sm">
      <div className={`mb-4 inline-flex rounded-xl p-3 ${iconCls}`}>
        <Icon size={22} />
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-400">{desc}</p>
    </div>
  )
}
