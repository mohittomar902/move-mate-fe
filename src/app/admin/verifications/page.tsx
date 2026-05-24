'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ShieldCheck,
  ShieldX,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useAdminRequests, useAdminApprove, useAdminReject } from '@/hooks/useDriverVerification'
import { useVerificationStatus } from '@/hooks/useDriverVerification'
import { cn } from '@/utils'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:3000'

type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED'

const FILTERS: { label: string; value?: string; status: VerificationStatus | 'ALL' }[] = [
  { label: 'All Requests', value: undefined, status: 'ALL' },
  { label: 'Under Review', value: 'under_review', status: 'UNDER_REVIEW' },
  { label: 'Pending', value: 'pending', status: 'PENDING' },
  { label: 'Verified', value: 'verified', status: 'VERIFIED' },
  { label: 'Rejected', value: 'rejected', status: 'REJECTED' },
]

const DOC_LABELS: Record<string, string> = {
  SELFIE: 'Selfie',
  CAR_PHOTO: 'Car Photo',
  RC_CARD: 'RC Card',
  DRIVING_LICENSE: 'Driving License',
  AADHAAR: 'Aadhaar',
}

function StatusChip({ status }: { status: VerificationStatus }) {
  const map = {
    PENDING: { label: 'Not Started', color: 'bg-slate-100 text-slate-500', icon: Clock },
    UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
    VERIFIED: { label: 'Verified', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-600', icon: XCircle },
  }
  const { label, color, icon: Icon } = map[status]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', color)}>
      <Icon size={12} /> {label}
    </span>
  )
}

function RejectModal({
  userName,
  onConfirm,
  onClose,
  isPending,
}: {
  userName: string
  onConfirm: (reason: string) => void
  onClose: () => void
  isPending: boolean
}) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-base font-bold text-slate-800">Reject {userName}&apos;s Application</h3>
        <p className="mt-1 text-sm text-slate-500">This will notify the driver to re-upload documents.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (required)…"
          rows={3}
          className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100"
        />
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isPending}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-40"
          >
            {isPending ? <Loader2 size={14} className="mx-auto animate-spin" /> : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DriverCard({ driver }: { driver: any }) {
  const [expanded, setExpanded] = useState(false)
  const [showReject, setShowReject] = useState(false)

  const { mutate: approve, isPending: approving } = useAdminApprove()
  const { mutate: reject, isPending: rejecting } = useAdminReject()

  const docs: any[] = driver.documents ?? []
  const canAct = driver.verificationStatus !== 'VERIFIED'

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-sm font-bold text-white shadow-sm">
              {driver.fullName?.[0]?.toUpperCase() ?? driver.phone[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{driver.fullName ?? 'No name'}</p>
              <p className="text-xs text-slate-400">{driver.phone}</p>
              {driver.aadhaarNumber && (
                <p className="text-xs text-slate-400">Aadhaar: ****&nbsp;{driver.aadhaarNumber.slice(-4)}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <StatusChip status={driver.verificationStatus} />
            {canAct && (
              <>
                <button
                  onClick={() => approve(driver.id)}
                  disabled={approving}
                  className="flex items-center gap-1.5 rounded-xl bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-400 disabled:opacity-40"
                >
                  {approving ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                  Approve
                </button>
                <button
                  onClick={() => setShowReject(true)}
                  disabled={rejecting}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-40"
                >
                  <ShieldX size={12} /> Reject
                </button>
              </>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Rejection reason */}
        {driver.rejectionReason && (
          <div className="mx-5 mb-3 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
            <p className="text-xs text-red-600">{driver.rejectionReason}</p>
          </div>
        )}

        {/* Documents grid */}
        {expanded && (
          <div className="border-t border-slate-100 px-5 pb-5 pt-4">
            {docs.length === 0 ? (
              <p className="text-sm text-slate-400">No documents uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex flex-col gap-1">
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <Image
                        src={`${BACKEND_URL}${doc.fileUrl}`}
                        alt={DOC_LABELS[doc.type] ?? doc.type}
                        width={200}
                        height={112}
                        className="h-28 w-full object-cover"
                      />
                      <a
                        href={`${BACKEND_URL}${doc.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/30 hover:opacity-100"
                      >
                        <Eye size={20} className="text-white" />
                      </a>
                    </div>
                    <p className="text-center text-[10px] font-medium text-slate-500">
                      {DOC_LABELS[doc.type] ?? doc.type}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showReject && (
        <RejectModal
          userName={driver.fullName ?? driver.phone}
          onConfirm={(reason) =>
            reject(
              { userId: driver.id, reason },
              { onSuccess: () => setShowReject(false) },
            )
          }
          onClose={() => setShowReject(false)}
          isPending={rejecting}
        />
      )}
    </>
  )
}

export default function AdminVerificationsPage() {
  const [activeFilter, setActiveFilter] = useState<string | undefined>(undefined)
  const { data: me } = useVerificationStatus()
  const { data: requests, isLoading } = useAdminRequests(activeFilter)

  const drivers: any[] = Array.isArray(requests) ? requests : []

  if (!me?.isAdmin) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <ShieldX size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
        <p className="mt-2 text-sm text-slate-500">You need admin privileges to view this page.</p>
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400">
          Dev tip: call{' '}
          <code className="font-mono">PATCH /api/driver-verification/admin/make-admin/{me?.id}</code>{' '}
          to grant yourself admin.
        </p>
      </div>
    )
  }

  const counts = FILTERS.map((f) => ({
    ...f,
    count:
      f.status === 'ALL'
        ? drivers.length
        : drivers.filter((d) => d.verificationStatus === f.status).length,
  }))

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white shadow-md shadow-green-500/30">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Driver Verifications</h1>
          <p className="text-sm text-slate-500">Review and approve driver applications</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {counts.map((f) => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition',
              activeFilter === f.value
                ? 'border-green-500 bg-green-500 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {f.label}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                activeFilter === f.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
              )}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-green-500" />
        </div>
      ) : drivers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <p className="text-slate-400">No requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drivers.map((d) => (
            <DriverCard key={d.id} driver={d} />
          ))}
        </div>
      )}
    </div>
  )
}
