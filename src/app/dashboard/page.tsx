'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search, Car, Ticket, Plus, TrendingUp, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useMyTrips } from '@/hooks/useTrips'
import { useMyBookings } from '@/hooks/useBookings'
import { ROUTES } from '@/constants'
import BannerCarousel from '@/components/common/BannerCarousel'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: trips } = useMyTrips()
  const { data: bookings } = useMyBookings()

  const activeTrips = Array.isArray(trips) ? trips.filter((t: any) => t.status === 'OPEN').length : 0
  const pendingBookings = Array.isArray(bookings)
    ? bookings.filter((b: any) => b.bookingStatus === 'PENDING').length
    : 0
  const confirmedBookings = Array.isArray(bookings)
    ? bookings.filter((b: any) => b.bookingStatus === 'CONFIRMED').length
    : 0

  const firstName = user?.fullName?.split(' ')[0] ?? 'there'

  return (
    <div>
      {/* Carousel */}
      <div className="mb-6">
        <BannerCarousel />
      </div>

      {/* Welcome banner */}
      <div className="mb-8 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg">
        <Image src="/logo.png" alt="MoveMate" width={52} height={52} className="rounded-2xl shadow-md shrink-0" />
        <div>
          <h1 className="text-2xl font-bold">Hello, {firstName} 👋</h1>
          <p className="mt-0.5 text-slate-400 text-sm">Welcome back to MoveMate</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Trips"
          value={activeTrips}
          icon={Car}
          gradient="from-green-500 to-emerald-600"
          glow="shadow-green-500/20"
        />
        <StatCard
          label="Pending Bookings"
          value={pendingBookings}
          icon={Clock}
          gradient="from-amber-500 to-orange-500"
          glow="shadow-amber-500/20"
        />
        <StatCard
          label="Confirmed"
          value={confirmedBookings}
          icon={TrendingUp}
          gradient="from-blue-500 to-cyan-500"
          glow="shadow-blue-500/20"
        />
        <StatCard
          label="Total Bookings"
          value={Array.isArray(bookings) ? bookings.length : 0}
          icon={Ticket}
          gradient="from-purple-500 to-violet-600"
          glow="shadow-purple-500/20"
        />
      </div>

      {/* Quick Actions */}
      <h2 className="mb-4 text-base font-semibold text-slate-700">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard href={ROUTES.SEARCH} icon={Search} title="Find a Ride" desc="Search available trips" iconCls="bg-green-500 shadow-green-500/30" />
        <ActionCard href="/dashboard/create-trip" icon={Plus} title="Create Trip" desc="Offer seats in your ride" iconCls="bg-blue-500 shadow-blue-500/30" />
        <ActionCard href={ROUTES.MY_TRIPS} icon={Car} title="My Trips" desc="Manage your posted trips" iconCls="bg-cyan-500 shadow-cyan-500/30" />
        <ActionCard href={ROUTES.BOOKINGS} icon={Ticket} title="My Bookings" desc="View your booked rides" iconCls="bg-purple-500 shadow-purple-500/30" />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  glow,
}: {
  label: string
  value: number
  icon: React.ElementType
  gradient: string
  glow: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg ${glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{label}</p>
          <p className="mt-1 text-4xl font-extrabold">{value}</p>
        </div>
        <div className="rounded-xl bg-white/20 p-2.5">
          <Icon size={20} />
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
    </div>
  )
}

function ActionCard({
  href,
  icon: Icon,
  title,
  desc,
  iconCls,
}: {
  href: string
  icon: React.ElementType
  title: string
  desc: string
  iconCls: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className={`rounded-xl p-2.5 text-white shadow-lg ${iconCls} transition group-hover:scale-110`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
      </div>
    </Link>
  )
}
