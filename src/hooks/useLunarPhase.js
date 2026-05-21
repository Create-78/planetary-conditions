import { useNow } from './useNow.js'
import { computePhase } from '../utils/lunarPhase.js'

/**
 * useLunarPhase — pure-computation hook for the Moon tab's Lunar Context section.
 *
 * No fetch, no React Query — the math is sub-millisecond. We subscribe to the
 * shared useNow() ticker (30s) so the day/night indicator and phase fraction
 * stay current over long sessions without each consumer spinning up its own
 * timer.
 *
 * Returns the full result of computePhase() plus a `computedAt` timestamp the
 * UI can use for the "Computed locally" subtitle (no LastUpdated chip — this
 * section's freshness is "right now" by construction).
 *
 * Consumer surface mirrors the Phase 3 useMarsData pattern (one hook → values
 * the consumer destructures), but there's no isLoading / isError because the
 * computation cannot fail.
 *
 * Tooltip namespace: 'lunar.*' (Plan 04-01 added the keys).
 */
export function useLunarPhase() {
  const now = useNow()
  const phase = computePhase(now)
  return {
    phaseName: phase.phaseName,                // string, e.g. 'Waxing Crescent'
    phaseFraction: phase.phaseFraction,        // number in [0, 1)
    dayNightStatus: phase.dayNightStatus,      // string per D-04
    surfaceTempC: phase.surfaceTempC,          // number, cosine-interpolated
    computedAt: now,                           // Date — for any future freshness UI
  }
}
