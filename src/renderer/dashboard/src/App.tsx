import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import StatusTile from './components/StatusTile'
import TpmTile from './components/TpmTile'
import TemperatureTile from './components/TemperatureTile'
import ColorTile from './components/ColorTile'
import HoursTile from './components/HoursTile'
import ConnectionBadge from './components/ConnectionBadge'
import Clock from './components/Clock'
import ConnectionPopup from './components/ConnectionPopup'

export default function App(): JSX.Element {
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    return window.api.onConnectionDetected(() => setShowPopup(true))
  }, [])

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <Clock />
        <h1 className="text-slate-400 text-sm font-medium tracking-wide">
          Oil Health Monitor
        </h1>
        <ConnectionBadge />
      </header>

      {/* Dashboard grid */}
      <main className="grid grid-cols-2 gap-4 flex-1">
        <StatusTile />
        <TpmTile />
        <TemperatureTile />
        <ColorTile />
        <HoursTile />
      </main>

      {/* Gear button — opens operator window */}
      <footer className="flex justify-end">
        <button
          onClick={() => window.api.openOperatorWindow()}
          aria-label="Open operator controls"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-500 text-xs font-medium hover:bg-slate-700 hover:text-slate-300 hover:border-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1117]"
        >
          <Settings size={13} />
          Operator Controls
        </button>
      </footer>

      {showPopup && <ConnectionPopup onDismiss={() => setShowPopup(false)} />}
    </div>
  )
}
