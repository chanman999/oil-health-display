import { useStore } from '../store'
import { getEffectiveConnection } from '../../../../shared/types'

export default function ConnectionBadge() {
  const state = useStore()
  const connected = getEffectiveConnection(state)

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
      connected
        ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
        : 'bg-slate-800 border-slate-600 text-slate-400'
    }`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${connected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
      {connected ? 'Sensor Connected' : 'Sensor Disconnected'}
    </div>
  )
}
