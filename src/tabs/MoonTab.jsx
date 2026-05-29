import DataCard from '../components/DataCard.jsx'
import Gauge from '../components/Gauge.jsx'
import Icon from '../components/Icon.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import AlertCard from '../components/AlertCard.jsx'
import LastUpdated from '../components/LastUpdated.jsx'
import { useLunarPhase } from '../hooks/useLunarPhase.js'
import { useSolarWind } from '../hooks/useSolarWind.js'
import { useDonkiEvents } from '../hooks/useDonkiEvents.js'
import { deriveRadiationRisk } from '../utils/radiationRisk.js'
import { formatInt, formatOneDecimal, formatSignedDecimal } from '../utils/formatters.js'

/**
 * MoonTab — computed lunar context + live NOAA SWPC + NASA DONKI in the glass
 * bento layout. Each data source keeps its own state (one failing never blanks
 * the others) and background refetches stay silent — same locks as the
 * original. Layout mirrors the signed-off "C" direction: hero phase readout ·
 * SWPC tiles · Kp gauge + radiation risk · solar-event feed.
 */

function MoonTab() {
  const lunar = useLunarPhase()
  const swpc = useSolarWind()
  const donki = useDonkiEvents()

  const swpcState = swpc.isLoading ? 'loading' : swpc.isError ? 'error' : 'ok'
  const swpcTs = swpc.dataUpdatedAt ? new Date(swpc.dataUpdatedAt) : null

  const phaseName = lunar.phaseName
  const phasePercent = formatInt(lunar.phaseFraction * 100)
  const dayNight = lunar.dayNightStatus
  const surfaceTemp = formatSignedDecimal(lunar.surfaceTempC)

  const radiationSeverity = deriveRadiationRisk({ speed: swpc.speed, kp: swpc.kp })
  const radiationLabel = radiationSeverity
    ? radiationSeverity[0].toUpperCase() + radiationSeverity.slice(1)
    : null

  return (
    <section role="tabpanel" aria-label="Moon conditions" className="flex h-full flex-col text-moon-50">
      {/* hero phase readout */}
      <div className="mt-12">
        <div className="telem" style={{ color: 'var(--moon-accent)', opacity: 0.85, marginBottom: 14 }}>
          Near side · Computed lunar context + NOAA SWPC
        </div>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <div className="telem mb-2.5 text-slate-400">Current Phase</div>
            <div className="flex items-baseline gap-3.5">
              <span className="stat-num text-white" style={{ fontSize: 60 }}>{phaseName}</span>
              <span className="stat-num" style={{ fontSize: 38, color: 'var(--moon-accent)' }}>{phasePercent}%</span>
            </div>
          </div>
          <span className="chip mb-2.5" style={{ color: 'var(--moon-accent)' }}>
            <Icon name="moon" size={15} />
            <span className="text-[13px] font-semibold">{dayNight}</span>
          </span>
        </div>
      </div>

      {/* spacer pushes the bento grid into the lower frame so the planet reads above it */}
      <div className="flex-1 min-h-[300px]" />

      {/* bento grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DataCard label="Solar Wind" value={formatInt(swpc.speed)} unit="km/s" icon="wind" sub="Bulk speed" tooltipKey="swpc.speed" state={swpcState} palette="moon" />
        <DataCard label="Wind Density" value={formatOneDecimal(swpc.density)} unit="p/cm³" icon="activity" sub="Proton" tooltipKey="swpc.density" state={swpcState} palette="moon" />
        <DataCard label="Bz Component" value={formatSignedDecimal(swpc.bz)} unit="nT" icon="magnet" sub="IMF N/S" tooltipKey="swpc.bz" state={swpcState} palette="moon" />
        <DataCard label="Surface Temp" value={surfaceTemp} unit="°C" icon="thermo" sub="Visible face" tooltipKey="lunar.surfaceTemp" palette="moon" />

        {/* Kp gauge + radiation risk feature */}
        <div className="glass rim-moon flex flex-col justify-between lg:row-span-2" style={{ padding: 24 }}>
          <div className="flex items-center justify-between">
            <span className="telem text-slate-400">Geomagnetic · Kp</span>
            <span style={{ color: 'var(--moon-accent)' }}><Icon name="radio" size={18} /></span>
          </div>
          <div className="flex justify-center py-1.5">
            <Gauge
              value={swpcState === 'ok' ? (formatOneDecimal(swpc.kp) ?? '—') : '—'}
              numericValue={swpc.kp ?? 0}
              min={0}
              max={9}
              unit="Kp"
              accent="#cbd5e1"
              size={176}
            />
          </div>
          <div className="flex items-center justify-between" style={{ padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
            <span className="telem text-slate-400">Radiation risk</span>
            {swpcState === 'ok' && radiationSeverity ? (
              <StatusBadge severity={radiationSeverity} value={radiationLabel} tooltipKey="swpc.radiationRisk" />
            ) : (
              <span className="telem text-slate-500">—</span>
            )}
          </div>
        </div>

        {/* solar event feed */}
        <div className="glass flex flex-col gap-3 lg:col-span-3 lg:row-span-2" style={{ padding: '20px 22px' }}>
          <div className="flex items-center justify-between">
            <span className="telem text-slate-400">Solar Event Alerts · last 7 days · NASA DONKI</span>
            <LastUpdated timestamp={donki.dataUpdatedAt ? new Date(donki.dataUpdatedAt) : null} palette="moon" />
          </div>

          {donki.isLoading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse" style={{ height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : donki.isError ? (
            <div className="text-sm italic text-slate-500">Data temporarily unavailable</div>
          ) : donki.events.length === 0 ? (
            <div className="py-6 text-center text-sm italic text-moon-50/60">
              No significant events in the past 7 days — conditions are calm.
            </div>
          ) : (
            <div
              className="thin-scroll flex flex-col gap-2"
              style={{ overflowY: 'auto', paddingRight: 4 }}
              tabIndex={0}
              role="region"
              aria-label="Recent solar events"
            >
              {donki.events.map((ev) => (
                <AlertCard
                  key={`${ev.type}-${ev.id}`}
                  eventType={ev.type}
                  timeUtc={ev.time}
                  severity={ev.severity}
                  tooltipKey={ev.tooltipKey}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default MoonTab
