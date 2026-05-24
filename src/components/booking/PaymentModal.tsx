'use client'

import { useState } from 'react'
import { X, IndianRupee, MapPin, Users, CheckCircle2, Loader2 } from 'lucide-react'
import { usePayment } from '@/hooks/usePayment'
import type { Booking } from '@/types/booking'

interface Props {
  booking: Booking
  onClose: () => void
}

type Step = 'summary' | 'processing' | 'success'

export default function PaymentModal({ booking, onClose }: Props) {
  const [step, setStep] = useState<Step>('summary')
  const { createOrder, verify } = usePayment()
  const trip = booking.trip

  const handlePay = async () => {
    setStep('processing')
    try {
      const order = await createOrder.mutateAsync(booking.id)
      await verify.mutateAsync({
        bookingId: booking.id,
        razorpayOrderId: order.providerOrderId,
        razorpayPaymentId: `pay_dev_${Date.now()}`,
        razorpaySignature: 'dev_signature',
      })
      setStep('success')
    } catch {
      setStep('summary')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {step === 'success' ? 'Payment Successful' : 'Complete Payment'}
          </h2>
          {step !== 'processing' && (
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Success state */}
        {step === 'success' && (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">Payment Done!</p>
              <p className="mt-1 text-sm text-slate-500">
                Your seat is confirmed. Have a great trip!
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600"
            >
              Done
            </button>
          </div>
        )}

        {/* Processing state */}
        {step === 'processing' && (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <Loader2 size={40} className="animate-spin text-green-500" />
            <p className="font-medium text-slate-700">Processing your payment…</p>
          </div>
        )}

        {/* Summary + pay */}
        {step === 'summary' && (
          <div className="px-6 py-5">
            {/* Driver accepted banner */}
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3">
              <CheckCircle2 size={18} className="shrink-0 text-green-500" />
              <p className="text-sm font-medium text-green-800">
                Driver accepted your request! Pay now to confirm your seat.
              </p>
            </div>

            {/* Trip info */}
            {trip && (
              <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-green-500" />
                  <p className="font-semibold text-slate-800">
                    {trip.sourceName} → {trip.destinationName}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Users size={13} />
                    {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IndianRupee size={13} />
                    {booking.totalAmount}
                  </span>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Amount</span>
              <span className="flex items-center gap-0.5 text-2xl font-bold text-slate-900">
                <IndianRupee size={20} strokeWidth={2.5} />
                {booking.totalAmount}
              </span>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={createOrder.isPending || verify.isPending}
              className="mt-5 w-full rounded-xl bg-green-500 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 disabled:opacity-60"
            >
              Pay ₹{booking.totalAmount}
            </button>

            {(createOrder.isError || verify.isError) && (
              <p className="mt-3 text-center text-xs text-red-500">
                Payment failed. Please try again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
