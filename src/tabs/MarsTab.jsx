import DataCard from '../components/DataCard.jsx'
import LastUpdated from '../components/LastUpdated.jsx'
import { useMarsData } from '../hooks/useMarsData.js'

/**
 * MarsTab — Phase 3 live wiring.
 *
 * Replaces the Phase 2 demo gallery with a real Curiosity REMS dashboard for
 * the latest Martian sol. One useMarsData() call drives all eight DataCards;
 * isLoading propagates to every card on first mount, isError on failure, and
 * dataUpdatedAt drives both the tab-level chip and per-card chips.
 *
 * Background refetches every 1 hour: we read isLoading (and ignore the
 * background-refresh flag) so the hourly refresh is silent — prior values stay
 * on screen.
 *
 * Source: MAAS2 (https://api.maas2.apollorion.com/) wrapping Curiosity REMS.
 */

// Source attribution string lives as a component-local constant per D-13.
// If Phase 4 ends up needing the same pattern, this is a candidate for
// src/constants/sources.js — but doesn't exist yet and isn't worth pre-extracting.
const SOURCE_LINE = 'From Curiosity Rover · REMS instrument'

// Number formatters — kept inline per D-26 / Claude's discretion. If Phase 4
// needs the same formatters, extract to src/utils/formatters.js then.
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

function MarsTab() {
  const { data, isLoading, isError, dataUpdatedAt } = useMarsData()

  // Shared card state — first-mount loading or hard error covers every card.
  // The background-refresh flag is intentionally NOT consulted: hourly refetches
  // stay silent so prior values remain on screen (D-18).
  const cardState = isLoading ? 'loading' : isError ? 'error' : 'ok'

  // Timestamp prop for LastUpdated: convert epoch ms to Date, but pass null
  // BEFORE the first successful fetch so LastUpdated renders an em-dash instead
  // of "N years ago" relative to epoch 0.
  const timestamp = dataUpdatedAt ? new Date(dataUpdatedAt) : null

  // MAAS2 field bindings (per Discussion.md §5 and 03-CONTEXT D-25, D-26, D-27).
  // When state !== 'ok', DataCard ignores `value` — so passing undefined for
  // the loading/error branches is safe; we still pass formatted values so the
  // post-fetch state needs no further code.
  const sol = data ? formatInt(data.sol) : undefined
  const earthDate = data ? data.terrestrial_date : undefined          // raw string per D-27
  const minTemp = data ? formatOneDecimal(data.min_temp) : undefined
  const maxTemp = data ? formatOneDecimal(data.max_temp) : undefined
  const pressure = data ? formatInt(data.pressure) : undefined        // integer Pa per D-26
  const windSpeed = data ? formatOneDecimal(data.wind_speed) : undefined
  const humidity = data ? formatOneDecimal(data.humidity) : undefined
  const opacity = data ? data.atmo_opacity : undefined                // verbatim categorical per D-15

  return (
    <section
      role="tabpanel"
      aria-label="Mars conditions"
      className="text-mars-50 space-y-8"
    >
      {/* Tab header: title, source attribution, tab-level LastUpdated */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Mars — Surface Conditions</h2>
          <p className="text-mars-50/60 text-sm italic">{SOURCE_LINE}</p>
        </div>
        <LastUpdated timestamp={timestamp} palette="mars" />
      </header>

      {/* Section 1: Sol context */}
      <section aria-label="Sol context">
        <h3 className="text-xs uppercase tracking-wider text-mars-accent/70 mb-3">
          Sol Context
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <DataCard
              label="Sol"
              value={sol}
              tooltipKey="mars.sol"
              state={cardState}
              palette="mars"
            />
            <LastUpdated timestamp={timestamp} palette="mars" />
          </div>
          <div className="flex flex-col gap-2">
            <DataCard
              label="Earth Date"
              value={earthDate}
              tooltipKey="mars.earthDate"
              state={cardState}
              palette="mars"
            />
            <LastUpdated timestamp={timestamp} palette="mars" />
          </div>
        </div>
      </section>

      {/* Section 2: Temperature & atmosphere */}
      <section aria-label="Temperature and atmosphere">
        <h3 className="text-xs uppercase tracking-wider text-mars-accent/70 mb-3">
          Temperature &amp; Atmosphere
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <DataCard
              label="Min Temp"
              value={minTemp}
              unit="°C"
              tooltipKey="mars.minTemp"
              state={cardState}
              palette="mars"
            />
            <LastUpdated timestamp={timestamp} palette="mars" />
          </div>
          <div className="flex flex-col gap-2">
            <DataCard
              label="Max Temp"
              value={maxTemp}
              unit="°C"
              tooltipKey="mars.maxTemp"
              state={cardState}
              palette="mars"
            />
            <LastUpdated timestamp={timestamp} palette="mars" />
          </div>
          <div className="flex flex-col gap-2">
            <DataCard
              label="Pressure"
              value={pressure}
              unit="Pa"
              tooltipKey="mars.pressure"
              state={cardState}
              palette="mars"
            />
            <LastUpdated timestamp={timestamp} palette="mars" />
          </div>
          <div className="flex flex-col gap-2">
            <DataCard
              label="Humidity"
              value={humidity}
              unit="%"
              tooltipKey="mars.humidity"
              state={cardState}
              palette="mars"
            />
            <LastUpdated timestamp={timestamp} palette="mars" />
          </div>
        </div>
      </section>

      {/* Section 3: Wind & sky */}
      <section aria-label="Wind and sky">
        <h3 className="text-xs uppercase tracking-wider text-mars-accent/70 mb-3">
          Wind &amp; Sky
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <DataCard
              label="Wind Speed"
              value={windSpeed}
              unit="m/s"
              tooltipKey="mars.windSpeed"
              state={cardState}
              palette="mars"
            />
            <LastUpdated timestamp={timestamp} palette="mars" />
          </div>
          <div className="flex flex-col gap-2">
            <DataCard
              label="Atmospheric Opacity"
              value={opacity}
              tooltipKey="mars.opacity"
              state={cardState}
              palette="mars"
            />
            <LastUpdated timestamp={timestamp} palette="mars" />
          </div>
        </div>
      </section>
    </section>
  )
}

export default MarsTab
