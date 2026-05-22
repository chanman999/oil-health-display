import { useOilStore } from '../store/oilStore'

// Color index 1–10: 1=pale yellow, 10=dark brown
const COLOR_STOPS = [
  '#f9e97a', // 1 – pale yellow
  '#f5d85a', // 2
  '#edbb30', // 3
  '#e09b18', // 4
  '#cc7c0a', // 5
  '#b85e06', // 6
  '#9c4404', // 7
  '#7e2e02', // 8
  '#5c1e01', // 9
  '#3a1000', // 10 – dark brown
]

const LABELS = [
  '', 'Fresh', '', '', '', 'Used', '', '', '', '', 'Dark',
]

export default function ColorTile() {
  const colorIndex = useOilStore((s) => s.colorIndex)
  // Clamp to 1–10
  const idx = Math.max(1, Math.min(10, Math.round(colorIndex)))
  const pct = ((idx - 1) / 9) * 100

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col gap-4">
      <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">
        Oil Color
      </span>
      <div className="flex items-end gap-2">
        <span className="text-white font-bold" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
          {idx}
        </span>
        <span className="text-slate-400 text-2xl font-medium pb-1">/ 10</span>
      </div>

      {/* Gradient strip */}
      <div className="relative">
        <div
          className="w-full h-5 rounded-full"
          style={{
            background: `linear-gradient(to right, ${COLOR_STOPS.join(', ')})`,
          }}
        />
        {/* Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-7 rounded-sm border-2 border-white shadow-lg transition-all duration-500"
          style={{
            left: `calc(${pct}% - 8px)`,
            backgroundColor: COLOR_STOPS[idx - 1],
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500 px-0.5">
        <span>Fresh</span>
        <span>Used</span>
        <span>Dark</span>
      </div>

      <p className="text-slate-500 text-xs mt-auto">
        {LABELS[idx] ? LABELS[idx] : idx <= 3 ? 'Fresh' : idx <= 6 ? 'Getting used' : 'Dark — consider changing'}
      </p>
    </div>
  )
}
