'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera,
  Car,
  FileText,
  CreditCard,
  ShieldCheck,
  Upload,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import {
  useVerificationStatus,
  useUploadDocument,
  useSaveAadhaar,
  useSubmitForReview,
} from '@/hooks/useDriverVerification'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/utils'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:3000'

const STEPS = [
  { id: 'SELFIE', label: 'Your Photo', icon: Camera, hint: 'Clear selfie in good lighting' },
  { id: 'CAR_PHOTO', label: 'Car Photos', icon: Car, hint: 'Upload 1–4 photos of your vehicle' },
  { id: 'RC_CARD', label: 'RC Card', icon: FileText, hint: 'Photo of Registration Certificate' },
  { id: 'DRIVING_LICENSE', label: 'Driving License', icon: CreditCard, hint: 'Front side of your license' },
  { id: 'AADHAAR', label: 'Aadhaar / KYC', icon: ShieldCheck, hint: 'Enter your 12-digit Aadhaar number' },
] as const

type StepId = typeof STEPS[number]['id']

export default function VerifyDriverPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { data: status, isLoading } = useVerificationStatus()
  const { mutateAsync: uploadAsync } = useUploadDocument()
  const [uploadingCount, setUploadingCount] = useState(0)
  const { mutate: saveAadhaar, isPending: savingAadhaar, isError: aadhaarError, error: aadhaarErr } = useSaveAadhaar()
  const { mutate: submit, isPending: submitting, isSuccess: submitted } = useSubmitForReview()

  const [activeStep, setActiveStep] = useState<StepId>('SELFIE')
  const [aadhaar, setAadhaar] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const docs: { type: string; fileUrl: string }[] = status?.documents ?? []
  const verificationStatus: string = status?.verificationStatus ?? 'PENDING'

  const getDocsOfType = (type: string) => docs.filter((d) => d.type === type)
  const hasDoc = (type: string) => getDocsOfType(type).length > 0
  const hasAadhaar = !!status?.aadhaarNumber

  const stepComplete = (id: StepId) => {
    if (id === 'CAR_PHOTO') return getDocsOfType('CAR_PHOTO').length >= 1
    if (id === 'AADHAAR') return hasAadhaar
    return hasDoc(id)
  }

  const allComplete = STEPS.every((s) => stepComplete(s.id))

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const fileList = Array.from(files)
    e.target.value = ''
    setUploadingCount(fileList.length)
    for (const file of fileList) {
      await uploadAsync({ type: activeStep, file }).catch(() => null)
      setUploadingCount((n) => Math.max(0, n - 1))
    }
  }

  const handleAadhaarSave = () => {
    if (!/^\d{12}$/.test(aadhaar)) return
    saveAadhaar(aadhaar, {
      onSuccess: () => setAadhaar(''),
    })
  }

  // Already verified or rejected
  if (verificationStatus === 'VERIFIED') {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <ShieldCheck size={36} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">You&apos;re Verified!</h2>
        <p className="mt-2 text-slate-500">Your driver account is approved. You can create trips.</p>
        <button
          onClick={() => router.push('/dashboard/create-trip')}
          className="mt-6 rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-400"
        >
          Create a Trip
        </button>
      </div>
    )
  }

  if (verificationStatus === 'REJECTED') {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle size={36} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Verification Rejected</h2>
        <p className="mt-2 text-slate-500">
          Your documents were not approved. Please re-upload and resubmit.
        </p>
      </div>
    )
  }

  if (verificationStatus === 'PENDING' && submitted) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Loader2 size={36} className="animate-spin text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Under Review</h2>
        <p className="mt-2 text-slate-500">
          Your documents are being verified. You&apos;ll be notified once approved.
        </p>
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400">
          Dev tip: call <code className="font-mono">PATCH /api/driver-verification/admin/{user?.id}</code> with{' '}
          <code className="font-mono">{`{"status":"VERIFIED"}`}</code> to approve.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={28} className="animate-spin text-green-500" />
      </div>
    )
  }

  const activeStepObj = STEPS.find((s) => s.id === activeStep)!

  const statusBanner = {
    PENDING: {
      icon: ShieldCheck,
      bg: 'bg-slate-50 border-slate-200',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-400',
      title: 'Not submitted yet',
      body: 'Complete all steps below and click "Submit for Verification".',
    },
    UNDER_REVIEW: {
      icon: Clock,
      bg: 'bg-blue-50 border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      title: 'Under Review',
      body: 'Your documents are being reviewed by our team. This usually takes up to 24 hours.',
    },
    VERIFIED: {
      icon: CheckCircle,
      bg: 'bg-green-50 border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Verified ✓',
      body: "Your driver account is approved. You can now create and offer trips.",
    },
    REJECTED: {
      icon: XCircle,
      bg: 'bg-red-50 border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      title: 'Verification Failed',
      body: 'Your application was rejected. Re-upload the required documents and resubmit.',
    },
  } as const

  const currentBanner = statusBanner[verificationStatus as keyof typeof statusBanner] ?? statusBanner.PENDING
  const BannerIcon = currentBanner.icon

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Driver Verification</h1>
        <p className="mt-1 text-sm text-slate-500">
          Complete all steps to start offering rides on MoveMate.
        </p>
      </div>

      {/* Status banner */}
      <div className={`mb-6 flex items-start gap-4 rounded-2xl border p-4 ${currentBanner.bg}`}>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${currentBanner.iconBg}`}>
          <BannerIcon size={20} className={currentBanner.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800">{currentBanner.title}</p>
          <p className="mt-0.5 text-xs text-slate-600">{currentBanner.body}</p>
          {verificationStatus === 'REJECTED' && status?.rejectionReason && (
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-red-100 px-3 py-2">
              <AlertCircle size={13} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-xs text-red-700">{status.rejectionReason}</p>
            </div>
          )}
          {verificationStatus === 'REJECTED' && (
            <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
              <RefreshCw size={12} /> Re-upload your documents and resubmit to try again.
            </p>
          )}
        </div>

        {/* Timeline dots */}
        <div className="hidden sm:flex flex-col items-center gap-1">
          {(['PENDING', 'UNDER_REVIEW', 'VERIFIED'] as const).map((s, i) => (
            <div key={s} className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full border-2 ${
                  verificationStatus === 'VERIFIED' || (i === 0 && verificationStatus !== 'PENDING')
                    ? 'border-green-500 bg-green-500'
                    : verificationStatus === s
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-300 bg-white'
                }`}
              />
              {i < 2 && <div className="h-4 w-px bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 lg:gap-6">
        {/* Step list */}
        <div className="flex w-44 shrink-0 flex-col gap-2">
          {STEPS.map((step) => {
            const done = stepComplete(step.id)
            const active = activeStep === step.id
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition',
                  active
                    ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                    : done
                    ? 'bg-green-50 text-green-700'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                {done ? (
                  <CheckCircle size={16} className={active ? 'text-white' : 'text-green-500'} />
                ) : (
                  <step.icon size={16} />
                )}
                <span className="flex-1 leading-tight">{step.label}</span>
                {!active && <ChevronRight size={12} className="opacity-40" />}
              </button>
            )
          })}
        </div>

        {/* Step content */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <activeStepObj.icon size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{activeStepObj.label}</h2>
              <p className="text-xs text-slate-400">{activeStepObj.hint}</p>
            </div>
          </div>

          {/* AADHAAR step */}
          {activeStep === 'AADHAAR' ? (
            <div className="space-y-4">
              {hasAadhaar ? (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    Aadhaar saved: ****&nbsp;****&nbsp;
                    {status.aadhaarNumber?.slice(-4)}
                  </span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Aadhaar Number (12 digits)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={12}
                      value={aadhaar}
                      onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                      placeholder="xxxx xxxx xxxx"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-black tracking-widest outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100"
                    />
                  </div>
                  {aadhaarError && (
                    <p className="text-xs text-red-500">
                      {(aadhaarErr as any)?.response?.data?.message ?? 'Failed to save Aadhaar'}
                    </p>
                  )}
                  <button
                    onClick={handleAadhaarSave}
                    disabled={aadhaar.length !== 12 || savingAadhaar}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-400 disabled:opacity-40"
                  >
                    {savingAadhaar ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                    Save Aadhaar
                  </button>
                </>
              )}
            </div>
          ) : (
            /* Photo upload steps */
            <div className="space-y-4">
              {/* Existing uploads */}
              {getDocsOfType(activeStep).length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {getDocsOfType(activeStep).map((doc, i) => (
                    <div key={i} className="relative overflow-hidden rounded-xl border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${BACKEND_URL}${doc.fileUrl}`}
                        alt={`${activeStep} ${i + 1}`}
                        className="h-24 w-full object-cover"
                      />
                      <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                        <CheckCircle size={12} className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCount > 0}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-slate-400 transition hover:border-green-300 hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
              >
                {uploadingCount > 0 ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Upload size={24} />
                )}
                <span className="text-sm font-medium">
                  {uploadingCount > 0
                    ? uploadingCount > 1
                      ? `Uploading ${uploadingCount} photos…`
                      : 'Uploading…'
                    : 'Click to upload'}
                </span>
                <span className="text-xs opacity-70">JPG, PNG up to 10 MB</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={activeStep === 'CAR_PHOTO'}
                className="hidden"
                onChange={handleFileSelect}
              />

              {activeStep === 'CAR_PHOTO' && (
                <p className="text-center text-xs text-slate-400">
                  Upload at least 1 car photo ({getDocsOfType('CAR_PHOTO').length} uploaded)
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex justify-between gap-2">
            <button
              onClick={() => {
                const idx = STEPS.findIndex((s) => s.id === activeStep)
                if (idx > 0) setActiveStep(STEPS[idx - 1].id)
              }}
              disabled={activeStep === STEPS[0].id}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30"
            >
              Back
            </button>

            {activeStep !== STEPS[STEPS.length - 1].id ? (
              <button
                onClick={() => {
                  const idx = STEPS.findIndex((s) => s.id === activeStep)
                  setActiveStep(STEPS[idx + 1].id)
                }}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => submit()}
                disabled={!allComplete || submitting}
                className="flex items-center gap-1.5 rounded-xl bg-green-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-green-500/20 hover:bg-green-400 disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ShieldCheck size={14} />
                )}
                Submit for Verification
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-green-500 transition-all"
            style={{ width: `${(STEPS.filter((s) => stepComplete(s.id)).length / STEPS.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-400">
          {STEPS.filter((s) => stepComplete(s.id)).length}/{STEPS.length} done
        </span>
      </div>
    </div>
  )
}
