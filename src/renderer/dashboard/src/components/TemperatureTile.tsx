import { Thermometer } from 'lucide-react'
import { useStore } from '../store'

const WARN_F = 375

export default function TemperatureTile() {
  const temperatureF = useStore((s) => s.temperatureF)
  const isHot = temperatureF > WARN_F

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Thermometer className="text-slate-400" size={16} />
        <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">Frying Temperature</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={`font-bold transition-colors duration-300 ${isHot ? 'text-red-400' : 'text-white'}`} style={{ fontSize: '3.5rem', lineHeight: 1 }}>
          {temperatureF}
        </span>
        <span className={`text-2xl font-medium pb-1 ${isHot ? 'text-red-400' : 'text-slate-400'}`}>°F</span>
      </div>
      {isHot && <p className="text-red-400 text-xs font-semibold uppercase tracking-wide">Above safe limit</p>}
      <p className="text-slate-500 text-xs mt-auto">Target: 350°F</p>
    </div>
  )
}
