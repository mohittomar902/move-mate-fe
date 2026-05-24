'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useSendOtp } from '@/hooks/useAuth'

const schema = z.object({
  phone: z
    .string()
    .min(10, 'Enter a valid 10-digit number')
    .max(10, 'Enter a valid 10-digit number')
    .regex(/^\d{10}$/, 'Only digits allowed'),
})

type FormValues = z.infer<typeof schema>

export default function LoginForm() {
  const router = useRouter()
  const { mutate: sendOtp, isPending, error } = useSendOtp()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = ({ phone }: FormValues) => {
    const fullPhone = `+91${phone}`
    sendOtp(fullPhone, {
      onSuccess: () => {
        sessionStorage.setItem('pendingPhone', fullPhone)
        router.push('/verify-otp')
      },
    })
  }

  const apiError =
    error && 'response' in error
      ? (error as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
      : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
        <div className="flex overflow-hidden rounded-lg border border-slate-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
          <span className="flex items-center bg-slate-100 px-3 text-sm text-slate-600">+91</span>
          <input
            {...register('phone')}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9999999999"
            className="w-full px-3 py-3 text-sm text-black outline-none"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
        {apiError && (
          <p className="mt-1 text-xs text-red-500">
            {Array.isArray(apiError) ? apiError[0] : apiError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-400 disabled:opacity-60"
      >
        {isPending ? 'Sending OTP...' : 'Send OTP'}
      </button>
    </form>
  )
}
