import Image from 'next/image'
import OtpForm from '@/components/forms/OtpForm'

export default function VerifyOtpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/20 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Image src="/logo.png" alt="MoveMate" width={64} height={64} className="rounded-2xl shadow-md" />
          <h1 className="text-xl font-bold text-slate-900">
            Move<span className="text-green-500">Mate</span>
          </h1>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Verify OTP</h2>
        <p className="mt-1 text-sm text-slate-500">Enter the 6-digit code sent to your phone</p>
        <OtpForm />
      </div>
    </main>
  )
}
