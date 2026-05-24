'use client'

import { useState, use, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  Square,
  Wifi,
  WifiOff,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import ChatWindow from '@/components/chat/ChatWindow'
import { useTracking } from '@/hooks/useTracking'
import { useTrip, useUpdateTrip, useStartTripWithOtp } from '@/hooks/useTrips'
import { useMyBookings } from '@/hooks/useBookings'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/utils'
import type { Booking } from '@/types/booking'

const TripMap = dynamic(() => import('@/components/tracking/TripMap'), { ssr: false })

export default function TrackingPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { data: trip } = useTrip(tripId)
  const { data: myBookings } = useMyBookings()
  const { mutate: updateTrip } = useUpdateTrip()
  const { mutate: startWithOtp, isPending: otpPending, isError: otpError, reset: resetOtp } = useStartTripWithOtp()

  const isDriver = trip?.driverId === user?.id

  const {
    driverLocation,
    passengerLocation,
    myLocation,
    isConnected,
    tripStatus,
    messages,
    typingUser,
    startSharingLocation,
    stopSharingLocation,
    emitTripStarted,
    emitTripCompleted,
    sendMessage,
    sendTyping,
  } = useTracking(tripId, { userId: user?.id, driverId: trip?.driverId })

  const [sharing, setSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [otpInput, setOtpInput] = useState('')
  const [showOtpEntry, setShowOtpEntry] = useState(false)

  // Merge DB status with socket-driven status — socket wins once it fires;
  // DB status handles the case where the page loads into an already-started trip.
  const dbStatus =
    trip?.status === 'STARTED' ? 'started' : trip?.status === 'COMPLETED' ? 'completed' : 'idle'
  const effectiveStatus = tripStatus !== 'idle' ? tripStatus : dbStatus

  // Auto-share location as soon as we're connected and trip is loaded
  useEffect(() => {
    if (isConnected && trip && !sharing) {
      startSharingLocation(isDriver)
      setSharing(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, trip?.id])

  const otherName = isDriver ? 'Passenger' : (trip?.driver?.fullName ?? 'Driver')

  // Passenger's booking for this trip (to show their OTP)
  const myBookingForTrip = myBookings?.find(
    (b: Booking) =>
      b.tripId === tripId && b.bookingStatus === 'CONFIRMED' && b.paymentStatus === 'PAID',
  )

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpInput.trim()) return
    startWithOtp(
      { tripId, otp: otpInput.trim() },
      {
        onSuccess: () => {
          setShowOtpEntry(false)
          setOtpInput('')
          emitTripStarted()
        },
      },
    )
  }

  const handleEndTrip = () => {
    updateTrip({ id: tripId, status: 'COMPLETED' })
    emitTripCompleted()
    stopSharingLocation()
    setSharing(false)
  }

  const toggleSharing = () => {
    if (sharing) {
      stopSharingLocation()
      setSharing(false)
    } else {
      startSharingLocation(isDriver)
      setSharing(true)
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      <Navbar />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="relative flex-1 min-w-0">
          <TripMap
            driverLocation={driverLocation}
            passengerLocation={passengerLocation}
            myLocation={myLocation}
            sourceLat={trip?.sourceLat}
            sourceLng={trip?.sourceLng}
            sourceName={trip?.sourceName}
            destLat={trip?.destinationLat}
            destLng={trip?.destinationLng}
            destName={trip?.destinationName}
            tripStatus={effectiveStatus}
          />

          {/* Top bar */}
          <div className="absolute left-3 right-3 top-3 z-[1000] flex items-center gap-2 sm:left-4 sm:right-4 sm:top-4 sm:gap-3">
            <button
              onClick={() => router.back()}
              className="shrink-0 rounded-xl bg-white p-2 shadow-md hover:bg-slate-50"
            >
              <ArrowLeft size={18} className="text-slate-700" />
            </button>

            <div className="flex min-w-0 flex-1 items-center justify-between rounded-xl bg-white px-3 py-2 shadow-md sm:px-4 sm:py-2.5">
              <div className="min-w-0 pr-2">
                <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                  {trip?.sourceName ?? '…'} → {trip?.destinationName ?? '…'}
                </p>
                <p className="text-[10px] text-slate-500 sm:text-xs">
                  {effectiveStatus === 'idle'
                    ? 'Waiting to start'
                    : effectiveStatus === 'started'
                    ? 'Trip in progress'
                    : 'Trip completed'}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold sm:px-2.5 sm:text-xs',
                  isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
                )}
              >
                {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Passenger OTP card — visible to passenger, trip not yet started */}
          {!isDriver && myBookingForTrip?.boardingOtp && effectiveStatus === 'idle' && (
            <div className="absolute left-3 right-3 top-20 z-[1000] sm:left-4 sm:right-auto sm:top-20 sm:w-72">
              <div className="rounded-2xl bg-white px-4 py-4 shadow-xl border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <KeyRound size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Your Boarding OTP</p>
                    <p className="text-[10px] text-slate-400">Share with your driver to start</p>
                  </div>
                </div>
                <div className="flex items-center justify-center rounded-xl bg-green-50 py-3">
                  <span className="text-3xl font-black tracking-[0.3em] text-green-600">
                    {myBookingForTrip.boardingOtp}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Trip underway badge */}
          {effectiveStatus === 'started' && (
            <div className="absolute left-3 top-20 z-[1000] sm:left-4">
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-md">
                <ShieldCheck size={14} className="text-green-500" />
                <span className="text-xs font-semibold text-green-700">Trip is underway</span>
              </div>
            </div>
          )}

          {/* Driver coords chip */}
          {driverLocation && (
            <div className="absolute bottom-24 left-3 z-[1000] rounded-xl bg-white px-3 py-2 shadow-md text-xs text-slate-600 sm:left-4">
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-green-500" />
                Driver: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
              </div>
            </div>
          )}
        </div>

        {/* Desktop chat panel */}
        {showChat && (
          <div className="hidden sm:flex w-80 flex-col border-l border-slate-200 bg-white shadow-xl">
            <ChatWindow
              messages={messages}
              currentUserId={user?.id ?? ''}
              typingUser={typingUser}
              onSend={(text) => sendMessage(user?.id ?? '', user?.fullName ?? 'You', text)}
              onTyping={(isTyping) => sendTyping(user?.id ?? '', user?.fullName ?? 'You', isTyping)}
              onClose={() => setShowChat(false)}
              otherName={otherName}
            />
          </div>
        )}
      </div>

      {/* Mobile chat bottom sheet */}
      {showChat && (
        <div
          className="sm:hidden fixed inset-x-0 bottom-0 z-[2000] flex flex-col rounded-t-2xl bg-white shadow-2xl"
          style={{ height: '65dvh' }}
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-200" />
          <ChatWindow
            messages={messages}
            currentUserId={user?.id ?? ''}
            typingUser={typingUser}
            onSend={(text) => sendMessage(user?.id ?? '', user?.fullName ?? 'You', text)}
            onTyping={(isTyping) => sendTyping(user?.id ?? '', user?.fullName ?? 'You', isTyping)}
            onClose={() => setShowChat(false)}
            otherName={otherName}
          />
        </div>
      )}

      {/* Driver OTP entry sheet */}
      {isDriver && showOtpEntry && effectiveStatus === 'idle' && (
        <div className="fixed inset-x-0 bottom-0 z-[2000] rounded-t-2xl bg-white px-5 pb-6 pt-4 shadow-2xl sm:inset-x-auto sm:bottom-20 sm:right-6 sm:w-80 sm:rounded-2xl">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
              <KeyRound size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Enter Passenger OTP</p>
              <p className="text-[11px] text-slate-400">Ask passenger for their 4-digit code</p>
            </div>
          </div>
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-3">
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              value={otpInput}
              onChange={(e) => {
                setOtpInput(e.target.value.replace(/\D/g, ''))
                if (otpError) resetOtp()
              }}
              placeholder="_ _ _ _"
              className="w-full rounded-xl border border-slate-200 py-3 text-center text-2xl font-black tracking-[0.4em] text-black outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            />
            {otpError && (
              <p className="text-center text-xs font-medium text-red-500">
                Invalid OTP — please try again.
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowOtpEntry(false)
                  setOtpInput('')
                  resetOtp()
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={otpInput.length !== 4 || otpPending}
                className="flex-1 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-green-500/30 hover:bg-green-400 disabled:opacity-40"
              >
                {otpPending ? 'Verifying…' : 'Start Trip'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bottom controls */}
      <div className="border-t border-slate-200 bg-white px-3 py-2.5 shadow-lg sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-2 sm:gap-3">

          {/* Share location toggle */}
          <button
            onClick={toggleSharing}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition sm:gap-2 sm:py-3 sm:text-sm',
              sharing
                ? 'bg-amber-500 text-white hover:bg-amber-400'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
            )}
          >
            <MapPin size={14} />
            <span className="hidden sm:inline">{sharing ? 'Sharing Location' : 'Share Location'}</span>
            <span className="sm:hidden">{sharing ? 'Sharing' : 'Share'}</span>
          </button>

          {/* Driver: OTP to start */}
          {isDriver && effectiveStatus === 'idle' && (
            <button
              onClick={() => setShowOtpEntry(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-500 py-2.5 text-xs font-semibold text-white shadow-md shadow-green-500/30 hover:bg-green-400 sm:gap-2 sm:py-3 sm:text-sm"
            >
              <KeyRound size={14} />
              <span className="hidden sm:inline">Verify OTP & Start</span>
              <span className="sm:hidden">Enter OTP</span>
            </button>
          )}

          {/* Driver: end trip */}
          {isDriver && effectiveStatus === 'started' && (
            <button
              onClick={handleEndTrip}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-xs font-semibold text-white shadow-md shadow-red-500/30 hover:bg-red-400 sm:gap-2 sm:py-3 sm:text-sm"
            >
              <Square size={14} fill="white" />
              <span className="hidden sm:inline">End Trip</span>
              <span className="sm:hidden">End</span>
            </button>
          )}

          {/* Completed state */}
          {isDriver && effectiveStatus === 'completed' && (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-medium text-slate-400 sm:py-3 sm:text-sm">
              <span className="hidden sm:inline">Trip Completed</span>
              <span className="sm:hidden">Done</span>
            </div>
          )}

          {/* Chat */}
          <button
            onClick={() => setShowChat((v) => !v)}
            className={cn(
              'relative flex shrink-0 items-center justify-center rounded-xl p-2.5 transition sm:p-3',
              showChat
                ? 'bg-green-500 text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
            )}
          >
            <MessageCircle size={18} />
            {messages.length > 0 && !showChat && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {messages.length > 9 ? '9+' : messages.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
