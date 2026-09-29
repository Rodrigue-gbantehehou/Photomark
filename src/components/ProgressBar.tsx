'use client'

interface Props {
  current: number
  total: number
}

export function ProgressBar({ current, total }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="w-full flex flex-col gap-2.5 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-slate-700 text-sm font-medium">Traitement des photos...</span>
        <span className="text-violet-600 text-sm font-mono font-bold tabular-nums">{pct}%</span>
      </div>

      <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full
            bg-gradient-to-r from-violet-600 to-violet-400
            transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-slate-400 text-xs text-center tabular-nums">
        {current} / {total} image{total > 1 ? 's' : ''}
      </p>
    </div>
  )
}
