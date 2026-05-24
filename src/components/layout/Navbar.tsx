'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useVerificationStatus } from '@/hooks/useDriverVerification'
import { ROUTES } from '@/constants'
import { cn } from '@/utils'
import { LogOut, Search, Car, Ticket, Plus, ShieldCheck, Shield } from 'lucide-react'

const NAV_LINKS = [
  { href: ROUTES.SEARCH, label: 'Find a Ride', icon: Search },
  { href: '/dashboard/create-trip', label: 'Create Trip', icon: Plus },
  { href: ROUTES.MY_TRIPS, label: 'My Trips', icon: Car },
  { href: ROUTES.BOOKINGS, label: 'My Bookings', icon: Ticket },
  { href: '/dashboard/verify-driver', label: 'Get Verified', icon: ShieldCheck },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const hasHydrated = useAuthStore((s) => s._hasHydrated)
  const { data: verificationData } = useVerificationStatus()
  const isAdmin = verificationData?.isAdmin === true

  const logout = () => {
    clearAuth()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    document.cookie = 'accessToken=; path=/; max-age=0'
    router.push(ROUTES.LOGIN)
  }

  const initials = hasHydrated
    ? (user?.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? 'U')
    : ''

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        {/* Logo */}
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <Image src="/logo.png" alt="MoveMate" width={38} height={38} className="rounded-xl" />
          <span className="text-lg font-bold text-slate-900">
            Move<span className="text-green-500">Mate</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-green-50 text-green-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/verifications"
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Shield size={15} /> Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.PROFILE}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
              {initials}
            </div>
            <span className="hidden sm:inline">{user?.fullName?.split(' ')[0] ?? 'Profile'}</span>
          </Link>
          <button
            onClick={logout}
            title="Logout"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="flex border-t border-slate-100 md:hidden">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'text-green-600'
                : 'text-slate-400',
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin/verifications"
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
              pathname.startsWith('/admin') ? 'text-purple-600' : 'text-slate-400',
            )}
          >
            <Shield size={20} />
            Admin
          </Link>
        )}
      </div>
    </nav>
  )
}
