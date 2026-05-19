import DataCard from '../components/DataCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import AlertCard from '../components/AlertCard.jsx'
import LastUpdated from '../components/LastUpdated.jsx'

/**
 * MarsTab — Phase 2 primitive demo gallery (Mars palette).
 *
 * Every Phase 2 primitive rendered in every state, prop-driven, no data hooks.
 * This is scaffolding for the visual checkpoint AND a working reference for how
 * a later live-data wiring (Curiosity REMS) will compose the same primitives.
 *
 * Module-scope timestamps so values don't drift on re-render. They are sampled
 * once at module load; LastUpdated's shared useNow() ticker still re-renders the
 * relative copy every 30s, but the source timestamps stay stable.
 */

const NOW = new Date()
const TS_JUST_NOW = new Date(NOW.getTime() - 5 * 1000) // 5 seconds ago
const TS_3_MIN_AGO = new Date(NOW.getTime() - 3 * 60 * 1000) // 3 minutes ago
const TS_2_HR_AGO = new Date(NOW.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
const TS_CME_DEMO = new Date(NOW.getTime() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago (per 02-CONTEXT `## Specific Ideas`)

function MarsTab() {
  return (
    <section
      role="tabpanel"
      aria-label="Mars conditions"
      className="text-mars-50 space-y-8"
    >
      <header>
        <h2 className="text-2xl font-bold mb-1">Mars — Primitive Demo Gallery</h2>
        <p className="text-mars-50/60 text-sm">
          Every Phase 2 primitive rendered in every state. Replaced with live
          Curiosity REMS data in a later phase.
        </p>
      </header>

      {/* Section 1: DataCard states (ok / loading / error) */}
      <section aria-label="DataCard states">
        <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
          DataCard — ok / loading / error
        </h3>
        <div className="flex flex-wrap gap-4">
          <DataCard
            label="Min Temp"
            value="-78"
            unit="°C"
            tooltipKey="mars.example"
            state="ok"
            palette="mars"
          />
          <DataCard
            label="Max Temp"
            value="-12"
            unit="°C"
            tooltipKey="mars.example"
            state="ok"
            palette="mars"
          />
          <DataCard
            label="Pressure"
            value="745"
            unit="Pa"
            tooltipKey="mars.example"
            state="ok"
            palette="mars"
          />
          <DataCard
            label="Wind Speed"
            value={null}
            unit="m/s"
            state="loading"
            palette="mars"
          />
          <DataCard
            label="Humidity"
            value={null}
            unit="%"
            state="error"
            palette="mars"
          />
        </div>
      </section>

      {/* Section 2: StatusBadge severities (low / moderate / high) */}
      <section aria-label="StatusBadge severities">
        <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
          StatusBadge — low / moderate / high
        </h3>
        <div className="flex flex-wrap items-center gap-6">
          <StatusBadge
            severity="low"
            label="Dust Risk"
            value="Low"
            tooltipKey="swpc.radiationRisk"
          />
          <StatusBadge
            severity="moderate"
            label="Dust Risk"
            value="Moderate"
            tooltipKey="swpc.radiationRisk"
          />
          <StatusBadge
            severity="high"
            label="Dust Risk"
            value="High"
            tooltipKey="swpc.radiationRisk"
          />
        </div>
      </section>

      {/* Section 3: AlertCard event types (CME / FLR / GST) */}
      <section aria-label="AlertCard event types">
        <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
          AlertCard — CME / FLR / GST
        </h3>
        <div className="flex flex-col gap-2 max-w-2xl">
          <AlertCard
            eventType="CME"
            timeUtc={TS_CME_DEMO}
            severity="Halo CME"
            description="Earth-directed plasma cloud"
            tooltipKey="donki.cme"
          />
          <AlertCard
            eventType="FLR"
            timeUtc={TS_CME_DEMO}
            severity="M2.3"
            description="Mid-class solar flare"
          />
          <AlertCard
            eventType="GST"
            timeUtc={TS_CME_DEMO}
            severity="G2"
            description="Moderate geomagnetic storm"
          />
        </div>
      </section>

      {/* Section 4: LastUpdated variants (just now / 3 mins / 2 hours / undefined) */}
      <section aria-label="LastUpdated variants">
        <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
          LastUpdated — just now / 3 mins / 2 hours / undefined
        </h3>
        <div className="flex flex-wrap items-center gap-6">
          <LastUpdated timestamp={TS_JUST_NOW} palette="mars" />
          <LastUpdated timestamp={TS_3_MIN_AGO} palette="mars" />
          <LastUpdated timestamp={TS_2_HR_AGO} palette="mars" />
          <LastUpdated timestamp={undefined} palette="mars" />
        </div>
      </section>
    </section>
  )
}

export default MarsTab
