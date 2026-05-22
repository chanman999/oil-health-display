import { useStore } from '../store'

const COLOR_STOPS = [
  '#f9e97a','#f5d85a','#edbb30','#e09b18','#cc7c0a',
  '#b85e06','#9c4404','#7e2e02','#5c1e01','#3a1000',
]

export default function ColorTile() {
  const colorIndex = useStore((s) => s.colorIndex)
  const idx = Math.max(1, Math.min(10, Math.round(colorIndex)))
  const pct = ((idx - 1) / 9) * 100

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col gap-4">
      <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">Oil Color</span>
      <div className="flex items-end gap-2">
        <span className="text-white font-bold" style={{ fontSize: '3.5rem', lineHeight: 1 }}>{idx}</span>
        <span className="text-slate-400 text-2xl font-medium pb-1">/ 10</span>
      </div>
      <div className="relative">
        <div className="w-full h-5 rounded-full" style={{ background: `linear-gradient(to right, ${COLOR_STOPS.join(', ')})` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-7 rounded-sm border-2 border-white shadow-lg transition-all duration-500"
          style={{ left: `calc(${pct}% - 8px)`, backgroundColor: COLOR_STOPS[idx - 1] }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 px-0.5">
        <span>Fresh</span><span>Used</span><span>Dark</span>
      </div>
      <p className="text-slate-500 text-xs mt-auto">
        {idx <= 3 ? 'Fresh' : idx <= 6 ? 'Getting used' : 'Dark — consider changing'}
      </p>
    </div>
  )
}
