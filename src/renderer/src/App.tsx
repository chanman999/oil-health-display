import StatusTile from './components/StatusTile'
import TpmTile from './components/TpmTile'
import TemperatureTile from './components/TemperatureTile'
import ColorTile from './components/ColorTile'
import HoursTile from './components/HoursTile'
import ConnectionBadge from './components/ConnectionBadge'

export default function App(): JSX.Element {
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
        {/* Row 1: Status tile spans both columns */}
        <StatusTile />

        {/* Row 2: TPM + Temperature */}
        <TpmTile />
        <TemperatureTile />

        {/* Row 3: Color + Hours */}
        <ColorTile />
        <HoursTile />
      </main>
    </div>
  )
}
