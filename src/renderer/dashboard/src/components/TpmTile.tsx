import { useStore } from '../store'

const TPM_MAX = 40

function barColor(tpm: number) {
  if (tpm < 18)  return 'bg-emerald-500'
  if (tpm <= 25) return 'bg-amber-400'
  return 'bg-red-500'
}

export default function TpmTile() {
  const tpm = useStore((s) => s.tpm)
  const pct = Math.min((tpm / TPM_MAX) * 100, 100)

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col gap-4">
      <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">Oil Quality (TPM)</span>
      <div className="flex items-end gap-2">
        <span className="text-white font-bold" style={{ fontSize: '3.5rem', lineHeight: 1 }}>{tpm}</span>
        <span className="text-slate-400 text-2xl font-medium pb-1">%</span>
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor(tpm)}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span className={tpm < 18 ? 'text-emerald-400 font-semibold' : ''}>0–17 Good</span>
          <span className={tpm >= 18 && tpm <= 25 ? 'text-amber-400 font-semibold' : ''}>18–25 Monitor</span>
          <span className={tpm > 25 ? 'text-red-400 font-semibold' : ''}>26+ Change</span>
        </div>
      </div>
    </div>
  )
}
