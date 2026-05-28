import { useQueries } from '@tanstack/react-query'

/**
 * useSolarWind — TanStack Query hook for NOAA SWPC solar wind + Kp data.
 *
 * Three sub-queries fan out via useQueries (TanStack Query v5 batch hook):
 *   - Plasma:  https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json
 *   - Mag:     https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json
 *   - Kp:      https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json
 *
 * No auth required (NOAA SWPC is CORS-open and serves correct Content-Type;
 * no MAAS2-style quirk here).
 *
 * Response shapes differ by endpoint:
 *   - Plasma & Mag: tabular JSON — first array element is the headers row,
 *     subsequent elements are data rows. We pull the latest row whose target
 *     field is non-null (NOAA occasionally writes null measurements).
 *   - Kp: array of OBJECTS (newest last) with a capital-K `Kp` field — NOT
 *     tabular. Parsed separately via selectLatestKp (see fetchKp below).
 *
 * Cadence: 5-minute refetchInterval per Discussion.md §3 and 04-CONTEXT D-12.
 * refetchOnWindowFocus disabled (matches Phase 3 silent-refresh lock).
 *
 * Returns a merged result: { speed, density, bz, kp, isLoading, isError,
 * dataUpdatedAt }. The consumer in MoonTab.jsx propagates isLoading/isError
 * to its four DataCards via the cardState pattern from Phase 3, using the
 * first-mount loading flag — NOT the background-refresh flag — so 5-minute
 * background refetches stay silent (D-43 silent-refresh lock).
 */

const PLASMA_URL = 'https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json'
const MAG_URL = 'https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json'
const KP_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'
const FIVE_MIN_MS = 1000 * 60 * 5

// Tabular-JSON helper: fetch + validate shape.
async function fetchTabular(url, { signal } = {}) {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`SWPC fetch failed: ${response.status} ${response.statusText}`)
  }
  const payload = await response.json()
  if (!Array.isArray(payload) || payload.length < 2) {
    throw new Error('SWPC response had no data rows')
  }
  const [headers, ...rows] = payload
  return { headers, rows }
}

// Walk rows from newest to oldest; return the first row whose targetField is non-null.
// Fall back to the very last row if no row has a non-null target.
function latestObject({ headers, rows }, targetField) {
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    const obj = Object.fromEntries(headers.map((h, idx) => [h, row[idx]]))
    if (obj[targetField] != null) return obj
  }
  const last = rows[rows.length - 1]
  return Object.fromEntries(headers.map((h, idx) => [h, last[idx]]))
}

// Number coercion that converts NaN to null so DataCard renders an em-dash, not "NaN".
function toNumberOrNull(v) {
  if (v == null) return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

async function fetchPlasma({ signal } = {}) {
  const table = await fetchTabular(PLASMA_URL, { signal })
  const latest = latestObject(table, 'speed')
  return {
    speed: toNumberOrNull(latest.speed),
    density: toNumberOrNull(latest.density),
  }
}

async function fetchMag({ signal } = {}) {
  const table = await fetchTabular(MAG_URL, { signal })
  const latest = latestObject(table, 'bz_gsm')
  return {
    bz: toNumberOrNull(latest.bz_gsm),
  }
}

// Kp is the odd one out: noaa-planetary-k-index.json returns an ARRAY OF OBJECTS
// (newest last), NOT the tabular array-of-arrays that plasma/mag use, and the
// field is `Kp` (capital K). So it can't go through fetchTabular/latestObject
// (which call headers.map and would throw on an object). Parse it directly.
// Walk newest -> oldest for the first non-null Kp (NOAA occasionally trails nulls).
export function selectLatestKp(payload) {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('SWPC Kp response had no data rows')
  }
  for (let i = payload.length - 1; i >= 0; i--) {
    const point = payload[i]
    if (point && point.Kp != null) return toNumberOrNull(point.Kp)
  }
  return toNumberOrNull(payload[payload.length - 1]?.Kp)
}

async function fetchKp({ signal } = {}) {
  const response = await fetch(KP_URL, { signal })
  if (!response.ok) {
    throw new Error(`SWPC fetch failed: ${response.status} ${response.statusText}`)
  }
  const payload = await response.json()
  return {
    kp: selectLatestKp(payload),
  }
}

export function useSolarWind() {
  const results = useQueries({
    queries: [
      {
        queryKey: ['swpc', 'plasma'],
        queryFn: fetchPlasma,
        refetchInterval: FIVE_MIN_MS,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ['swpc', 'mag'],
        queryFn: fetchMag,
        refetchInterval: FIVE_MIN_MS,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ['swpc', 'kp'],
        queryFn: fetchKp,
        refetchInterval: FIVE_MIN_MS,
        refetchOnWindowFocus: false,
      },
    ],
  })

  const [plasma, mag, kp] = results

  // Merge per D-11:
  //   isLoading — any sub-query still loading (first mount)
  //   isError   — any sub-query failed
  //   dataUpdatedAt — most recent fetch (Math.max across the three)
  // We deliberately read isLoading, NOT the background-refresh flag, so the
  // 5-minute refetch tick keeps prior values rendered (D-43 silent-refresh lock).
  return {
    speed: plasma.data?.speed ?? null,
    density: plasma.data?.density ?? null,
    bz: mag.data?.bz ?? null,
    kp: kp.data?.kp ?? null,
    isLoading: plasma.isLoading || mag.isLoading || kp.isLoading,
    isError: plasma.isError || mag.isError || kp.isError,
    dataUpdatedAt: Math.max(
      plasma.dataUpdatedAt || 0,
      mag.dataUpdatedAt || 0,
      kp.dataUpdatedAt || 0,
    ) || 0,
  }
}
