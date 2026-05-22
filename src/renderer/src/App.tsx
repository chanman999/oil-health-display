import { useEffect } from 'react'
import StatusTile from './components/StatusTile'
import TpmTile from './components/TpmTile'
import TemperatureTile from './components/TemperatureTile'
import ColorTile from './components/ColorTile'
import HoursTile from './components/HoursTile'
import ConnectionBadge from './components/ConnectionBadge'
import OperatorPanel from './components/OperatorPanel'
import { useOperatorPanel } from './hooks/useOperatorPanel'
import { useOilStore } from './store/oilStore'

export default function App(): JSX.Element {
  const { open, setOpen } = useOperatorPanel()
  const setBoardDetected = useOilStore((s) => s.setBoardDetected)

  useEffect(() => {
    const unsubscribe = window.api.onBoardDetectionChange((detected) => {
      setBoardDetected(detected)
    })
    return unsubscribe
  }, [setBoardDetected])

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-slate-300 text-lg font-semibold tracking-wide">
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

      {/* Operator panel — triggered by Cmd/Ctrl+Shift+O */}
      <OperatorPanel open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
