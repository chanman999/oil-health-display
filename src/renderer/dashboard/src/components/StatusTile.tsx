import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { getEffectiveStatus } from '../../../../shared/types'
import { OilStatus } from '../../../../shared/types'

const STATUS_CONFIG = {
  good:       { label: 'GOOD',       bg: 'bg-emerald-950', border: 'border-emerald-700', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  monitor:    { label: 'MONITOR',    bg: 'bg-amber-950',   border: 'border-amber-600',   text: 'text-amber-400',   dot: 'bg-amber-400'   },
  change_now: { label: 'CHANGE NOW', bg: 'bg-red-950',     border: 'border-red-700',     text: 'text-red-400',     dot: 'bg-red-500'     },
}

export default function StatusTile() {
  const state = useStore()
  const status = getEffectiveStatus(state)
  const cfg = STATUS_CONFIG[status]

  // Scale pulse on every status transition (skip mount)
  const [scalePulsing, setScalePulsing] = useState(false)
  const prevStatusRef = useRef<OilStatus | null>(null)
  useEffect(() => {
    if (prevStatusRef.current === null) { prevStatusRef.current = status; return }
    if (prevStatusRef.current !== status) {
      prevStatusRef.current = status
      setScalePulsing(false)
      requestAnimationFrame(() => setScalePulsing(true))
    }
  }, [status])

  // Border glow after change_now persists for 10 s
  const [borderPulsing, setBorderPulsing] = useState(false)
  useEffect(() => {
    if (status !== 'change_now') { setBorderPulsing(false); return }
    const t = setTimeout(() => setBorderPulsing(true), 10_000)
    return () => { clearTimeout(t); setBorderPulsing(false) }
  }, [status])

  return (
    <div
      onAnimationEnd={() => setScalePulsing(false)}
      className={[
        cfg.bg, cfg.border,
        'border-2 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 col-span-2',
        scalePulsing  ? 'status-scale-pulse' : '',
        borderPulsing ? 'border-glow-pulse'  : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        <span className={`w-5 h-5 rounded-full ${cfg.dot} shrink-0`} />
        <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">Oil Status</span>
      </div>
      <div className={`${cfg.text} font-black leading-none text-center`} style={{ fontSize: '5rem' }}>
        {cfg.label}
      </div>
      <p className="text-slate-500 text-sm">Based on current readings</p>
    </div>
  )
}
