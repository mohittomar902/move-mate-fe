const configs = {
  OPEN: 'bg-green-100 text-green-700',
  STARTED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-600',
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-600',
} as const

type Status = keyof typeof configs

export default function StatusBadge({ status }: { status: string }) {
  const cls = configs[status as Status] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}
