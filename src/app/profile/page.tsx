'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { useProfile } from '@/hooks/useAuth'
import { updateProfile } from '@/services/users.service'
import { QUERY_KEYS } from '@/constants'
import Spinner from '@/components/common/Spinner'
import Navbar from '@/components/layout/Navbar'
import { Phone, Star, BadgeCheck } from 'lucide-react'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const { mutate: save, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      setUser(res.data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE })
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const current = profile ?? user

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      fullName: current?.fullName ?? '',
      email: current?.email ?? '',
    },
  })

  const onSubmit = (data: FormValues) =>
    save({ fullName: data.fullName, email: data.email || undefined })

  const initials =
    current?.fullName
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'U'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">My Profile</h1>

        {/* Avatar + basic info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl font-bold text-white">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{current?.fullName}</h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <Phone size={13} />
                {current?.phone}
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm text-amber-500">
                  <Star size={13} fill="currentColor" />
                  {current?.rating ?? '0'}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <BadgeCheck size={13} />
                  {current?.verificationStatus}
                </span>
              </div>
            </div>
          </div>

          {saved && (
            <div className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              Profile updated successfully.
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Full Name</label>
                <input
                  {...register('fullName')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-green-500 py-2.5 text-sm font-semibold text-white transition hover:bg-green-400 disabled:opacity-60"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              <InfoRow label="Email" value={current?.email ?? '—'} />
              <InfoRow label="Member since" value={current?.createdAt ? new Date(current.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'} />
              <button
                onClick={() => setEditing(true)}
                className="mt-2 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  )
}
