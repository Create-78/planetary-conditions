import DataCard from '../components/DataCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import AlertCard from '../components/AlertCard.jsx'
import LastUpdated from '../components/LastUpdated.jsx'

/**
 * MoonTab — Phase 2 primitive demo gallery (Moon palette).
 *
 * Structure mirrors MarsTab.jsx exactly — same four sections, same demo states —
 * but palette swapped to moon and tooltip keys swapped to moon-relevant.
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

function MoonTab() {
  return (
    <section
      role="tabpanel"
      aria-label="Moon conditions"
      className="text-moon-50 space-y-8"
    >
      <header>
        <h2 className="text-2xl font-bold mb-1">Moon — Primitive Demo Gallery</h2>
        <p className="text-moon-50/60 text-sm">
          Every Phase 2 primitive rendered in every state. Replaced with live
          SWPC + DONKI + lunar data in a later phase.
        </p>
      </header>

      {/* Section 1: DataCard states (ok / loading / error) */}
      <section aria-label="DataCard states">
        <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
          DataCard — ok / loading / error
        </h3>
        <div className="flex flex-wrap gap-4">
          <DataCard
            label="Phase"
            value="Waxing Crescent"
            tooltipKey="moon.example"
            state="ok"
            palette="moon"
          />
          <DataCard
            label="Surface Temp"
            value="-120"
            unit="°C"
            tooltipKey="moon.example"
            state="ok"
            palette="moon"
          />
          <DataCard
            label="Solar Wind"
            value="412"
            unit="km/s"
            tooltipKey="swpc.radiationRisk"
            state="ok"
            palette="moon"
          />
          <DataCard
            label="Bz"
            value={null}
            unit="nT"
            state="loading"
            palette="moon"
          />
          <DataCard
            label="Kp Index"
            value={null}
            state="error"
            palette="moon"
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
            label="Radiation Risk"
            value="Low"
            tooltipKey="swpc.radiationRisk"
          />
          <StatusBadge
            severity="moderate"
            label="Radiation Risk"
            value="Moderate"
            tooltipKey="swpc.radiationRisk"
          />
          <StatusBadge
            severity="high"
            label="Radiation Risk"
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
          <LastUpdated timestamp={TS_JUST_NOW} palette="moon" />
          <LastUpdated timestamp={TS_3_MIN_AGO} palette="moon" />
          <LastUpdated timestamp={TS_2_HR_AGO} palette="moon" />
          <LastUpdated timestamp={undefined} palette="moon" />
        </div>
      </section>
    </section>
  )
}

export default MoonTab
