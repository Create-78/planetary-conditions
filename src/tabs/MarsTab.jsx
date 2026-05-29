import DataCard from '../components/DataCard.jsx'
import Gauge from '../components/Gauge.jsx'
import Icon from '../components/Icon.jsx'
import SolLogFeed from '../components/SolLogFeed.jsx'
import LastUpdated from '../components/LastUpdated.jsx'
import { useMarsData } from '../hooks/useMarsData.js'
import { formatInt, formatOneDecimal } from '../utils/formatters.js'

/**
 * MarsTab — Curiosity REMS conditions in the glass bento layout.
 *
 * One useMarsData() call drives the whole tab; cardState propagates the
 * first-mount loading / hard-error state to every card (hourly background
 * refetches stay silent, per the original D-18 lock). Tooltips, LastUpdated
 * and the formatters are unchanged from the original wiring.
 *
 * Layout (the signed-off "C" direction):
 *   hero high/low readout · 4 context tiles · pressure gauge · REMS sol log.
 *
 * NOTE: MAAS2 returns only the latest sol, so the sol-log feed shows one live
 * row today. See INTEGRATION.md → "Mars sol history" to wire multiple sols.
 */

const SOURCE = 'Gale Crater · 4.6°S 137.4°E · Curiosity REMS'

function opacitySeverity(opacity) {
  if (!opacity) return 'sev-low'
  return /sunny|clear/i.test(opacity) ? 'sev-low' : 'sev-mod'
}

function MarsTab() {
  const { data, isLoading, isError, dataUpdatedAt } = useMarsData()
  const cardState = isLoading ? 'loading' : isError ? 'error' : 'ok'
  const timestamp = dataUpdatedAt ? new Date(dataUpdatedAt) : null

  const sol = data ? formatInt(data.sol) : null
  const earthDate = data ? data.terrestrial_date : null
  const minTemp = data ? formatOneDecimal(data.min_temp) : null
  const maxTemp = data ? formatOneDecimal(data.max_temp) : null
  const pressure = data ? formatInt(data.pressure) : null
  const windSpeed = data ? formatOneDecimal(data.wind_speed) : null
  const humidity = data ? formatOneDecimal(data.humidity) : null
  const opacity = data ? data.atmo_opacity : null

  // Single live sol → one feed row. Built as an array so adding history later
  // (INTEGRATION.md) requires no layout change.
  const solHistory = data
    ? [{
        sol: sol,
        earthDate: earthDate,
        condition: opacity || undefined,
        tempRange: `${maxTemp ?? '—'}° / ${minTemp ?? '—'}°C`,
        pressure: pressure ? `${pressure} Pa` : undefined,
        severity: opacitySeverity(opacity),
      }]
    : []

  return (
    <section role="tabpanel" aria-label="Mars conditions" className="flex h-full flex-col text-mars-50">
      {/* hero readout — floats over the sky above the planet */}
      <div className="mt-12">
        <div className="telem" style={{ color: 'var(--mars-accent)', opacity: 0.85, marginBottom: 14 }}>{SOURCE}</div>
        <div className="flex flex-wrap items-end gap-7">
          <div>
            <div className="telem mb-2.5 text-slate-400">
              {sol ? `Sol ${sol} · ${earthDate}` : 'Surface conditions'}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="stat-num text-white" style={{ fontSize: 84 }}>{maxTemp ?? '—'}</span>
              <span className="stat-num" style={{ fontSize: 34, color: 'var(--mars-accent)' }}>°C</span>
              <span className="stat-num ml-2.5" style={{ fontSize: 40, color: 'rgba(241,245,249,0.35)' }}>/ {minTemp ?? '—'}°</span>
            </div>
          </div>
          <span className="chip mb-3" style={{ color: 'var(--mars-accent)', borderColor: 'rgba(245,158,11,0.32)' }}>
            <Icon name="sun" size={15} />
            <span className="text-[13px] font-semibold">{opacity || 'Sky clarity'}</span>
          </span>
          <LastUpdated timestamp={timestamp} palette="mars" />
        </div>
      </div>

      {/* spacer pushes the bento grid into the lower frame so the planet reads above it */}
      <div className="flex-1 min-h-[300px]" />

      {/* bento grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DataCard label="Min Temp" value={minTemp} unit="°C" icon="thermo" sub="Pre-dawn" tooltipKey="mars.minTemp" state={cardState} palette="mars" />
        <DataCard label="Max Temp" value={maxTemp} unit="°C" icon="thermo" sub="Afternoon" tooltipKey="mars.maxTemp" state={cardState} palette="mars" />
        <DataCard label="Wind Speed" value={windSpeed} unit="m/s" icon="wind" sub="Surface" tooltipKey="mars.windSpeed" state={cardState} palette="mars" />
        <DataCard label="Humidity" value={humidity} unit="%" icon="drop" sub="Relative" tooltipKey="mars.humidity" state={cardState} palette="mars" />

        {/* pressure gauge feature */}
        <div className="glass rim-mars flex flex-col justify-between lg:row-span-2" style={{ padding: 24 }}>
          <div className="flex items-center justify-between">
            <span className="telem text-slate-400">Surface Pressure</span>
            <span style={{ color: 'var(--mars-accent)' }}><Icon name="gauge" size={18} /></span>
          </div>
          <div className="flex justify-center py-1.5">
            <Gauge
              value={pressure ?? '—'}
              numericValue={data ? Number(data.pressure) : 0}
              min={600}
              max={900}
              unit="Pa"
              band="Surface"
              accent="#f59e0b"
              size={176}
            />
          </div>
          <div className="flex items-center justify-between" style={{ padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
            <span className="telem text-slate-400">Sky opacity</span>
            <span className={`sev ${opacitySeverity(opacity)}`}>{cardState === 'ok' ? (opacity || '—') : '—'}</span>
          </div>
        </div>

        {/* REMS sol log */}
        <div className="glass flex flex-col gap-3 lg:col-span-3 lg:row-span-2" style={{ padding: '20px 22px' }}>
          <div className="flex items-center justify-between">
            <span className="telem text-slate-400">REMS Sol Log · Curiosity</span>
            <span className="telem flex items-center gap-1.5" style={{ color: 'var(--mars-accent)' }}>
              {solHistory.length} sol{solHistory.length === 1 ? '' : 's'} <Icon name="arrow" size={12} />
            </span>
          </div>
          <SolLogFeed items={solHistory} state={cardState} />
        </div>
      </div>
    </section>
  )
}

export default MarsTab
