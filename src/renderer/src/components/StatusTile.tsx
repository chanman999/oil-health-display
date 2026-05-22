import { useOilStore, getEffectiveStatus } from '../store/oilStore'

const STATUS_CONFIG = {
  good: {
    label: 'GOOD',
    bg: 'bg-emerald-950',
    border: 'border-emerald-700',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  monitor: {
    label: 'MONITOR',
    bg: 'bg-amber-950',
    border: 'border-amber-600',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  change_now: {
    label: 'CHANGE NOW',
    bg: 'bg-red-950',
    border: 'border-red-700',
    text: 'text-red-400',
    dot: 'bg-red-500',
  },
}

export default function StatusTile() {
  const state = useOilStore()
  const status = getEffectiveStatus(state)
  const cfg = STATUS_CONFIG[status]

  return (
    <div
      className={`${cfg.bg} ${cfg.border} border-2 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 col-span-2`}
    >
      <div className="flex items-center gap-3">
        <span className={`w-5 h-5 rounded-full ${cfg.dot} shrink-0`} />
        <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">
          Oil Status
        </span>
      </div>
      <div className={`${cfg.text} font-black leading-none text-center`} style={{ fontSize: '5rem' }}>
        {cfg.label}
      </div>
      <p className="text-slate-500 text-sm">Based on current readings</p>
    </div>
  )
}
