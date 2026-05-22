import { stateManager } from './state'

/** Box-Muller-free normal approximation: mean 0, std ≈ 0.015. */
function normalDelta(): number {
  return (Math.random() + Math.random() + Math.random() - 1.5) * 0.03
}

export function startFluctuationTimer(): ReturnType<typeof setInterval> {
  return setInterval(() => {
    const state = stateManager.get()

    if (!state.tpmFluctuation) return
    if (stateManager.isUserInteractingWithTpm()) return

    const baseline = stateManager.getTpmBaseline()
    const delta = normalDelta()
    const pull = (baseline - state.tpm) * 0.05
    const raw = state.tpm + delta + pull
    const newTpm = Math.round(Math.min(40, Math.max(0, raw)) * 100) / 100

    stateManager.update({ tpm: newTpm })
  }, 400)
}
