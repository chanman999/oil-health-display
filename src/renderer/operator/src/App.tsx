import { useStore } from './store'
import { OilStatus, DEFAULT_STATE } from '../../../shared/types'

// ── Focus ring shared style ────────────────────────────────────────────────
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'

// ── Presets ────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: 'Fresh Oil',     tpm: 4,  temperatureF: 350, colorIndex: 1,  hoursOfUse: 0  },
  { label: 'Mid-Shift',     tpm: 14, temperatureF: 355, colorIndex: 4,  hoursOfUse: 6  },
  { label: 'Getting Tired', tpm: 20, temperatureF: 360, colorIndex: 6,  hoursOfUse: 12 },
  { label: 'End of Day',    tpm: 26, temperatureF: 365, colorIndex: 8,  hoursOfUse: 16 },
  { label: 'Critical',      tpm: 32, temperatureF: 370, colorIndex: 10, hoursOfUse: 22 },
]

// ── Sub-components ─────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{title}</h3>
}

function Divider() {
  return <div className="border-t border-slate-700/60 my-5" />
}

function SliderRow({ label, value, min, max, step, onChange, onDragStart, onDragEnd }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-slate-300">{label}</label>
        <input
          type="number" min={min} max={max} step={step} value={value}
          onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))) }}
          onFocus={onDragStart}
          onBlur={onDragEnd}
          className={`w-20 bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-sm text-slate-100 text-right ${FOCUS} focus-visible:ring-offset-slate-800`}
        />
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onPointerDown={onDragStart}
        onPointerUp={onDragEnd}
        onBlur={onDragEnd}
        className={`w-full accent-slate-400 cursor-pointer rounded ${FOCUS}`}
      />
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App(): JSX.Element {
  const state = useStore()
  const update = window.api.updateState

  function applyPreset(p: typeof PRESETS[number]) {
    update({ tpm: p.tpm, temperatureF: p.temperatureF, colorIndex: p.colorIndex, hoursOfUse: p.hoursOfUse, statusMode: 'auto' })
  }

  const startTpmInteract = () => window.api.setTpmInteracting(true)
  const endTpmInteract   = () => window.api.setTpmInteracting(false)

  return (
    <div className="min-h-screen bg-[#13151f] text-slate-100 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-700/60">
        <h1 className="text-slate-100 font-semibold text-base">Operator Controls</h1>
        <p className="text-slate-500 text-xs mt-0.5">Changes update the dashboard in real time</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">

        {/* ── Global Controls ── */}
        <SectionHeader title="Global Controls" />
        <button
          onClick={() => update({ scrollCaptureActive: !state.scrollCaptureActive })}
          className={[
            'w-full py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200',
            state.scrollCaptureActive
              ? 'border-emerald-500 bg-emerald-950 text-emerald-400 scroll-capture-on'
              : `border-slate-600 bg-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-500 ${FOCUS}`,
          ].join(' ')}
        >
          Scroll Capture: {state.scrollCaptureActive ? 'ON' : 'OFF'}
        </button>
        <p className="text-slate-500 text-xs mt-2 mb-0">
          {state.scrollCaptureActive
            ? 'Mouse wheel adjusts TPM globally — even outside this app. Toggle off with Cmd/Ctrl+J.'
            : 'Activate to use the mouse wheel as a global TPM knob. Shortcut: Cmd/Ctrl+J.'}
        </p>

        <Divider />

        {/* ── Live Drift toggle ── */}
        <label className={`flex items-center gap-3 mb-5 cursor-pointer select-none group`}>
          <div className="relative">
            <input
              type="checkbox"
              checked={state.tpmFluctuation}
              onChange={(e) => update({ tpmFluctuation: e.target.checked })}
              className={`sr-only peer`}
            />
            {/* Custom toggle pill */}
            <div className="w-9 h-5 bg-slate-700 rounded-full peer-checked:bg-emerald-600 transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-900" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
            Live drift <span className="text-slate-500">(simulates sensor noise)</span>
          </span>
        </label>

        {/* ── Presets ── */}
        <SectionHeader title="Preset Scenarios" />
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-300 text-xs font-medium hover:bg-slate-700 hover:border-slate-500 hover:text-slate-100 transition-colors ${FOCUS}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <Divider />

        {/* ── Manual Controls ── */}
        <SectionHeader title="Manual Controls" />
        {/* TPM slider pauses fluctuation while being dragged */}
        <SliderRow
          label="TPM"
          value={state.tpm}
          min={0} max={40} step={0.5}
          onChange={(v) => update({ tpm: v })}
          onDragStart={startTpmInteract}
          onDragEnd={endTpmInteract}
        />
        <SliderRow label="Temperature (°F)" value={state.temperatureF} min={250} max={400} step={1}   onChange={(v) => update({ temperatureF: v })} />
        <SliderRow label="Color Index"      value={state.colorIndex}   min={1}   max={10}  step={1}   onChange={(v) => update({ colorIndex: v })} />
        <SliderRow label="Hours of Use"     value={state.hoursOfUse}   min={0}   max={48}  step={0.5} onChange={(v) => update({ hoursOfUse: v })} />

        <Divider />

        {/* ── Status Override ── */}
        <SectionHeader title="Status Override" />
        <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-3 text-sm">
          {(['auto', 'manual'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => update({ statusMode: mode })}
              className={`flex-1 py-2 font-medium transition-colors ${state.statusMode === mode ? 'bg-slate-600 text-slate-100' : 'bg-slate-800 text-slate-400 hover:text-slate-200'} ${FOCUS}`}
            >
              {mode === 'auto' ? 'Auto (derive from TPM)' : 'Manual'}
            </button>
          ))}
        </div>
        {state.statusMode === 'manual' && (
          <div className="flex gap-3">
            {(['good', 'monitor', 'change_now'] as OilStatus[]).map((s) => {
              const meta: Record<OilStatus, { label: string; color: string; active: string; ring: string }> = {
                good:       { label: 'Good',       color: 'border-emerald-600 text-emerald-400', active: 'bg-emerald-950', ring: 'focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900' },
                monitor:    { label: 'Monitor',    color: 'border-amber-500 text-amber-400',     active: 'bg-amber-950',   ring: 'focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900'   },
                change_now: { label: 'Change Now', color: 'border-red-600 text-red-400',         active: 'bg-red-950',     ring: 'focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900'     },
              }
              const m = meta[s]
              return (
                <label key={s} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${m.color} ${state.status === s ? m.active : 'bg-slate-800/50'} ${m.ring}`}>
                  <input type="radio" name="manual-status" value={s} checked={state.status === s} onChange={() => update({ status: s })} className="sr-only" />
                  {m.label}
                </label>
              )
            })}
          </div>
        )}

        <Divider />

        {/* ── Connection Override ── */}
        <SectionHeader title="Connection Override" />
        <div className="flex rounded-lg overflow-hidden border border-slate-600 text-sm">
          {(['auto', 'force_disconnected'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => update({ connectionOverride: mode })}
              className={`flex-1 py-2 font-medium transition-colors ${state.connectionOverride === mode ? 'bg-slate-600 text-slate-100' : 'bg-slate-800 text-slate-400 hover:text-slate-200'} ${FOCUS}`}
            >
              {mode === 'auto' ? 'Auto (use USB detection)' : 'Force Disconnected'}
            </button>
          ))}
        </div>

        <Divider />

        {/* ── Reset ── */}
        <SectionHeader title="Reset" />
        <button
          onClick={() => update({ ...DEFAULT_STATE })}
          className={`w-full py-2.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:text-slate-100 hover:border-slate-500 transition-colors ${FOCUS}`}
        >
          Reset to Defaults
        </button>

        <div className="h-6" />
      </div>
    </div>
  )
}
