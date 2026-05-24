'use client'

import { useRouter } from 'next/navigation'
import { ShieldCheck, X, Clock, ShieldX, AlertCircle } from 'lucide-react'

type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED'

interface Props {
  status: VerificationStatus
  rejectionReason?: string
  onClose: () => void
}

const statusConfig = {
  PENDING: {
    icon: ShieldCheck,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
    title: "You're not verified yet",
    body: 'Complete driver verification to start creating trips. It takes less than 5 minutes.',
    cta: 'Get Verified',
    ctaStyle: 'bg-green-500 hover:bg-green-400',
  },
  UNDER_REVIEW: {
    icon: Clock,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    title: 'Verification is under review',
    body: 'Our team is reviewing your documents. You can create trips once approved. This usually takes 24 hours.',
    cta: 'View Status',
    ctaStyle: 'bg-blue-500 hover:bg-blue-400',
  },
  REJECTED: {
    icon: ShieldX,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    title: 'Verification was rejected',
    body: 'Your application was not approved. Please re-upload your documents and resubmit.',
    cta: 'Re-upload Documents',
    ctaStyle: 'bg-red-500 hover:bg-red-400',
  },
  VERIFIED: {
    icon: ShieldCheck,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
    title: "You're verified!",
    body: 'Your driver account is approved.',
    cta: '',
    ctaStyle: '',
  },
}

export default function VerificationGateModal({ status, rejectionReason, onClose }: Props) {
  const router = useRouter()
  const cfg = statusConfig[status]
  const Icon = cfg.icon

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        {/* Top */}
        <div className="relative px-6 pb-5 pt-8 text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>

          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${cfg.iconBg}`}>
            <Icon size={30} className={cfg.iconColor} />
          </div>

          <h3 className="text-lg font-bold text-slate-800">{cfg.title}</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{cfg.body}</p>

          {/* Rejection reason */}
          {status === 'REJECTED' && rejectionReason && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-left">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-xs text-red-600">{rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
          {cfg.cta && (
            <button
              onClick={() => {
                onClose()
                router.push('/dashboard/verify-driver')
              }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition ${cfg.ctaStyle}`}
            >
              {cfg.cta}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
