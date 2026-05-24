'use client'

import { useEffect, useRef, useState } from 'react'
import { useVerifyOtp } from '@/hooks/useAuth'

export default function OtpForm() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const [phone, setPhone] = useState('')
  const { mutate: verifyOtp, isPending, error } = useVerifyOtp()

  useEffect(() => {
    const stored = sessionStorage.getItem('pendingPhone')
    if (stored) setPhone(stored)
    inputs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputs.current[5]?.focus()
    }
    e.preventDefault()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6 || !phone) return
    verifyOtp({ phone, otp: code })
  }

  const apiError =
    error && 'response' in error
      ? (error as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
      : null

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {phone && (
        <p className="text-sm text-slate-500">
          Sent to <span className="font-medium text-slate-800">{phone}</span>
        </p>
      )}

      <div className="flex justify-between gap-2">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="h-12 w-12 rounded-lg border border-slate-300 text-center text-lg font-semibold text-black focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        ))}
      </div>

      {apiError && (
        <p className="text-xs text-red-500">
          {Array.isArray(apiError) ? apiError[0] : apiError}
        </p>
      )}

      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Dev OTP: <span className="font-bold">123456</span>
      </p>

      <button
        type="submit"
        disabled={isPending || otp.join('').length < 6}
        className="w-full rounded-lg bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-400 disabled:opacity-60"
      >
        {isPending ? 'Verifying...' : 'Verify OTP'}
      </button>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="w-full text-sm text-slate-500 hover:text-slate-700"
      >
        ← Change phone number
      </button>
    </form>
  )
}
