import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { NASA_API_KEY } from '../utils/env.js'

/**
 * useDonkiEvents — TanStack Query hook for NASA DONKI solar events.
 *
 * Three sub-queries fan out via useQueries (TanStack Query v5 batch hook):
 *   - CME (Coronal Mass Ejections)
 *   - FLR (Solar Flares)
 *   - GST (Geomagnetic Storms)
 *
 * Date window: last 7 days. The startDate ('YYYY-MM-DD') is memoized on a
 * stable day-only key so the URL doesn't shift mid-hour and re-trigger
 * fetches.
 *
 * Auth: NASA_API_KEY is imported from src/utils/env.js per project
 * convention — never read the build-time env object directly at the call
 * site. The env module falls back to DEMO_KEY if the build-time variable
 * is unset; rate limits are documented in PROJECT.md if DEMO_KEY hits
 * them in production.
 *
 * Cadence: 15-minute refetchInterval per Discussion.md §3 and 04-CONTEXT D-24.
 * refetchOnWindowFocus disabled (matches Phase 3 silent-refresh lock).
 *
 * Returns a merged result: { events, isLoading, isError, dataUpdatedAt }.
 * events is the union of CME/FLR/GST mapped to a unified shape and sorted
 * reverse-chronologically (most recent first). MoonTab.jsx propagates
 * isLoading / isError through the cardState pattern using the first-mount
 * loading flag — NOT the background-refresh flag — so 15-minute background
 * refetches stay silent (D-43 silent-refresh lock).
 *
 * Empty state ("No significant events in the past 7 days — conditions are
 * calm.") is rendered by the consumer in MoonTab.jsx, not here — empty data
 * is not an error, just a quiet week. See D-25.
 */

const FIFTEEN_MIN_MS = 1000 * 60 * 15

// Helper: 'YYYY-MM-DD' for today minus 7 days.
function sevenDaysAgoISO(now = new Date()) {
  const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 10)
}

// Helper: stable day-only key for useMemo deps so the date string is recomputed
// only when the calendar day changes, not on every render.
function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

async function fetchDonki(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`DONKI fetch failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

// --- Event mappers: API-specific shapes → unified shape ---
// Unified shape:
//   { id: string, type: 'CME'|'FLR'|'GST', time: string (ISO),
//     severity: string, tooltipKey: string }

function mapCme(item) {
  const analyses = item.cmeAnalyses
  const speed = analyses && analyses.length ? analyses[0]?.speed : null
  const severity = speed != null ? `Speed: ${speed} km/s` : 'Speed unknown'
  return {
    id: item.activityID,
    type: 'CME',
    time: item.startTime,
    severity,
    tooltipKey: 'donki.cme',
  }
}

function mapFlr(item) {
  const cls = item.classType
  return {
    id: item.flrID,
    type: 'FLR',
    time: item.beginTime,
    severity: cls ? `Class ${cls}` : 'Class unknown',
    tooltipKey: 'donki.flr',
  }
}

function mapGst(item) {
  const kps = item.allKpIndex
  let severity = 'Kp ongoing'
  if (Array.isArray(kps) && kps.length) {
    const peak = kps.reduce((m, e) => (e.kpIndex > m ? e.kpIndex : m), -Infinity)
    if (Number.isFinite(peak)) severity = `Kp peak: ${peak}`
  }
  return {
    id: item.gstID,
    type: 'GST',
    time: item.startTime,
    severity,
    tooltipKey: 'donki.gst',
  }
}

export function useDonkiEvents() {
  // Memoize the date-window URLs on a stable day-only key. Mid-hour re-renders
  // do not regenerate the URLs, so TanStack Query cache hits remain stable.
  const dayKey = todayKey()
  const { cmeUrl, flrUrl, gstUrl } = useMemo(() => {
    const d = sevenDaysAgoISO()
    return {
      cmeUrl: `https://api.nasa.gov/DONKI/CME?startDate=${d}&api_key=${NASA_API_KEY}`,
      flrUrl: `https://api.nasa.gov/DONKI/FLR?startDate=${d}&api_key=${NASA_API_KEY}`,
      gstUrl: `https://api.nasa.gov/DONKI/GST?startDate=${d}&api_key=${NASA_API_KEY}`,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey])

  const results = useQueries({
    queries: [
      {
        queryKey: ['donki', 'cme', dayKey],
        queryFn: () => fetchDonki(cmeUrl),
        refetchInterval: FIFTEEN_MIN_MS,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ['donki', 'flr', dayKey],
        queryFn: () => fetchDonki(flrUrl),
        refetchInterval: FIFTEEN_MIN_MS,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ['donki', 'gst', dayKey],
        queryFn: () => fetchDonki(gstUrl),
        refetchInterval: FIFTEEN_MIN_MS,
        refetchOnWindowFocus: false,
      },
    ],
  })

  const [cme, flr, gst] = results

  // Unified, reverse-chronological event list (per D-23).
  const events = useMemo(() => {
    const merged = []
    if (Array.isArray(cme.data)) merged.push(...cme.data.map(mapCme))
    if (Array.isArray(flr.data)) merged.push(...flr.data.map(mapFlr))
    if (Array.isArray(gst.data)) merged.push(...gst.data.map(mapGst))
    merged.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    return merged
  }, [cme.data, flr.data, gst.data])

  // Merge per D-11:
  //   isLoading — any sub-query still loading (first mount)
  //   isError   — any sub-query failed
  //   dataUpdatedAt — most recent fetch (Math.max across the three)
  // We deliberately read isLoading, NOT the background-refresh flag, so the
  // 15-minute refetch tick keeps prior events rendered (D-43 silent-refresh lock).
  return {
    events,
    isLoading: cme.isLoading || flr.isLoading || gst.isLoading,
    isError: cme.isError || flr.isError || gst.isError,
    dataUpdatedAt: Math.max(
      cme.dataUpdatedAt || 0,
      flr.dataUpdatedAt || 0,
      gst.dataUpdatedAt || 0,
    ) || 0,
  }
}
