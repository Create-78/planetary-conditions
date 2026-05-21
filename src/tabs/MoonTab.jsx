import DataCard from '../components/DataCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import AlertCard from '../components/AlertCard.jsx'
import LastUpdated from '../components/LastUpdated.jsx'
import LoadingState from '../components/LoadingState.jsx'
import { useLunarPhase } from '../hooks/useLunarPhase.js'
import { useSolarWind } from '../hooks/useSolarWind.js'
import { useDonkiEvents } from '../hooks/useDonkiEvents.js'
import { deriveRadiationRisk } from '../utils/radiationRisk.js'

/**
 * MoonTab — live wiring for the three Moon-tab sub-sections.
 *
 * Replaces the prior demo gallery with three independently-sourced sections:
 *
 *   1. Lunar Context (useLunarPhase) — pure computation, 30s tick from useNow.
 *   2. Space Weather — Solar Wind (useSolarWind) — NOAA SWPC, 5min refetch.
 *   3. Solar Event Alerts (useDonkiEvents) — NASA DONKI, 15min refetch.
 *
 * Each section computes its own cardState from its own hook's flags. One
 * section's failure never affects the others' render — the section heading
 * and structure remain visible across all states (per 04-CONTEXT D-30, D-41).
 *
 * Background refetches stay silent: each section reads the first-mount
 * loading flag (and ignores the background-refresh flag) so the 5-minute
 * and 15-minute refetch ticks keep prior values rendered (D-43).
 */

// Inline number formatters — kept inline per the prior Mars-tab carry-forward
// note ("extract to src/utils/formatters.js when a second tab needs them").
// This is now the second consumer; deferring extraction to Phase 5 polish so
// MarsTab.jsx and MoonTab.jsx can be refactored together rather than in two
// separate touches.
function formatInt(value) {
  if (value === null || value === undefined) return null
  const n = Number(value)
  if (Number.isNaN(n)) return null
  return Math.round(n).toString()
}

function formatOneDecimal(value) {
  if (value === null || value === undefined) return null
  const n = Number(value)
  if (Number.isNaN(n)) return null
  return n.toFixed(1)
}

function formatSignedInt(value) {
  if (value === null || value === undefined) return null
  const n = Number(value)
  if (Number.isNaN(n)) return null
  const rounded = Math.round(n)
  return rounded >= 0 ? `+${rounded}` : rounded.toString()
}

function formatSignedOneDecimal(value) {
  if (value === null || value === undefined) return null
  const n = Number(value)
  if (Number.isNaN(n)) return null
  const fixed = n.toFixed(1)
  return n >= 0 ? `+${fixed}` : fixed
}

function MoonTab() {
  const lunar = useLunarPhase()
  const swpc = useSolarWind()
  const donki = useDonkiEvents()

  // Per-section cardState — each section is independent. We read isLoading
  // (and ignore the background-refresh flag) so refetches stay silent.
  const swpcCardState = swpc.isLoading ? 'loading' : swpc.isError ? 'error' : 'ok'

  // Timestamps for the per-section LastUpdated chips. Pre-fetch the merged
  // dataUpdatedAt is 0; the guard converts to null so LastUpdated renders an
  // em-dash instead of "N years ago" relative to epoch 0 (prior carry-forward).
  const swpcTimestamp = swpc.dataUpdatedAt ? new Date(swpc.dataUpdatedAt) : null
  const donkiTimestamp = donki.dataUpdatedAt ? new Date(donki.dataUpdatedAt) : null

  // Lunar values — destructured for clarity. No null guards needed: the
  // lunar computation cannot fail.
  const phaseName = lunar.phaseName
  const phasePercent = formatInt(lunar.phaseFraction * 100)
  const dayNight = lunar.dayNightStatus
  const surfaceTemp = formatSignedInt(lunar.surfaceTempC)

  // Radiation Risk severity — null when either input is missing or when
  // the SWPC section is loading/errored. We only render the badge when we
  // have a real severity AND the SWPC card state is 'ok' — StatusBadge
  // requires a valid severity, so omitting it during loading/error is the
  // right call (per 04-CONTEXT D-15 + plan layout_spec).
  const radiationSeverity = deriveRadiationRisk({ speed: swpc.speed, kp: swpc.kp })
  const radiationLabel = radiationSeverity
    ? radiationSeverity[0].toUpperCase() + radiationSeverity.slice(1)
    : null

  return (
    <section
      role="tabpanel"
      aria-label="Moon conditions"
      className="text-moon-50 space-y-12"
    >
      <header>
        <h2 className="text-2xl font-bold mb-1">Moon — Conditions</h2>
        <p className="text-moon-50/60 text-sm italic">
          Live space weather + computed lunar context
        </p>
      </header>

      {/* Section 1: Lunar Context (useLunarPhase, computed locally) */}
      <section aria-label="Lunar context">
        <div className="mb-3">
          <h3 className="text-xs uppercase tracking-wider text-moon-accent/70">
            Lunar Context
          </h3>
          <p className="text-moon-50/60 text-xs">Computed locally</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DataCard
            label="Phase Name"
            value={phaseName}
            tooltipKey="lunar.phase"
            palette="moon"
          />
          <DataCard
            label="Phase Percentage"
            value={phasePercent}
            unit="%"
            tooltipKey="lunar.phase"
            palette="moon"
          />
          <DataCard
            label="Day/Night"
            value={dayNight}
            tooltipKey="lunar.dayNight"
            palette="moon"
          />
          <DataCard
            label="Estimated Surface Temp (visible face)"
            value={surfaceTemp}
            unit="°C"
            tooltipKey="lunar.surfaceTemp"
            palette="moon"
          />
        </div>
      </section>

      {/* Section 2: Space Weather — Solar Wind (useSolarWind, 5min refetch) */}
      <section aria-label="Space weather solar wind">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider text-moon-accent/70">
            Space Weather — Solar Wind
          </h3>
          <LastUpdated timestamp={swpcTimestamp} palette="moon" />
        </div>

        {swpcCardState === 'ok' && radiationSeverity && (
          <div className="mb-4">
            <StatusBadge
              severity={radiationSeverity}
              label="Radiation Risk"
              value={radiationLabel}
              tooltipKey="swpc.radiationRisk"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <DataCard
              label="Solar Wind Speed"
              value={formatInt(swpc.speed)}
              unit="km/s"
              tooltipKey="swpc.speed"
              state={swpcCardState}
              palette="moon"
            />
            <LastUpdated timestamp={swpcTimestamp} palette="moon" />
          </div>
          <div className="flex flex-col gap-2">
            <DataCard
              label="Solar Wind Density"
              value={formatOneDecimal(swpc.density)}
              unit="p/cm³"
              tooltipKey="swpc.density"
              state={swpcCardState}
              palette="moon"
            />
            <LastUpdated timestamp={swpcTimestamp} palette="moon" />
          </div>
          <div className="flex flex-col gap-2">
            <DataCard
              label="Bz"
              value={formatSignedOneDecimal(swpc.bz)}
              unit="nT"
              tooltipKey="swpc.bz"
              state={swpcCardState}
              palette="moon"
            />
            <LastUpdated timestamp={swpcTimestamp} palette="moon" />
          </div>
          <div className="flex flex-col gap-2">
            <DataCard
              label="Kp Index"
              value={formatOneDecimal(swpc.kp)}
              tooltipKey="swpc.kp"
              state={swpcCardState}
              palette="moon"
            />
            <LastUpdated timestamp={swpcTimestamp} palette="moon" />
          </div>
        </div>
      </section>

      {/* Section 3: Solar Event Alerts (useDonkiEvents, 15min refetch) */}
      <section aria-label="Solar event alerts">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider text-moon-accent/70">
            Solar Event Alerts (last 7 days)
          </h3>
          <LastUpdated timestamp={donkiTimestamp} palette="moon" />
        </div>

        {donki.isLoading ? (
          <div className="flex flex-col gap-2">
            <div className="h-14"><LoadingState /></div>
            <div className="h-14"><LoadingState /></div>
            <div className="h-14"><LoadingState /></div>
          </div>
        ) : donki.isError ? (
          <div className="text-sm text-slate-500 italic px-3 py-4 bg-space-900/40 rounded-md">
            Data temporarily unavailable
          </div>
        ) : donki.events.length === 0 ? (
          <div className="text-sm text-moon-50/60 italic py-6 text-center">
            No significant events in the past 7 days — conditions are calm.
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">
            {donki.events.map((ev) => (
              <AlertCard
                key={ev.id}
                eventType={ev.type}
                timeUtc={ev.time}
                severity={ev.severity}
                tooltipKey={ev.tooltipKey}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

export default MoonTab
