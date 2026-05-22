import { Clock } from 'lucide-react'
import { useOilStore } from '../store/oilStore'

export default function HoursTile() {
  const hoursOfUse = useOilStore((s) => s.hoursOfUse)

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Clock className="text-slate-400" size={16} />
        <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">
          Hours in Use
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-white font-bold" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
          {hoursOfUse}
        </span>
        <span className="text-slate-400 text-2xl font-medium pb-1">hrs</span>
      </div>
      <p className="text-slate-500 text-xs mt-auto">Since last change</p>
    </div>
  )
}
