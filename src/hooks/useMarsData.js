import { useQuery } from '@tanstack/react-query'

/**
 * useMarsData — TanStack Query hook for the latest Martian sol from MAAS2.
 *
 * Data source: https://api.maas2.apollorion.com/ (no auth; CORS-open; GitHub Pages
 * hosted — may return a wrong Content-Type header, so we read the response body
 * as text and feed it through JSON.parse manually rather than using the response's
 * built-in JSON shortcut).
 *
 * Cadence: 1-hour refetchInterval. Underlying MAAS2 data refreshes ~once per
 * Martian sol (~24.6 h), so hourly is generous and matches Discussion.md §3.
 *
 * refetchOnWindowFocus: false — hourly background refresh is sufficient; avoiding
 * focus-driven refetches keeps the UI stable when users tab back into the app.
 *
 * Returns the full TanStack Query result object so the consumer (MarsTab.jsx)
 * can read { data, isLoading, isError, dataUpdatedAt, ... } and propagate state
 * to all eight DataCards from a single fetch (per 03-CONTEXT D-01, D-02).
 *
 * No API key required for MAAS2 — Phase 4's DONKI calls will use the project's
 * NASA API key env var (out of scope here).
 */

const MAAS2_URL = 'https://api.maas2.apollorion.com/'
const ONE_HOUR_MS = 1000 * 60 * 60

async function fetchMarsData({ signal } = {}) {
  // Manual text → JSON.parse to bypass any wrong Content-Type header from
  // MAAS2's GitHub Pages host (per CLAUDE.md and 03-CONTEXT D-04).
  // TanStack Query v5 passes the abort signal in the queryFn context object;
  // forwarding it to fetch lets v5 cancel in-flight requests on unmount or
  // when a refetch supersedes this one (per 05-CONTEXT D-19, D-20).
  const response = await fetch(MAAS2_URL, { signal })
  if (!response.ok) {
    throw new Error(`MAAS2 fetch failed: ${response.status} ${response.statusText}`)
  }
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (err) {
    throw new Error(`MAAS2 response was not valid JSON: ${err.message}`)
  }
}

export function useMarsData() {
  return useQuery({
    queryKey: ['mars', 'maas2', 'latest'],
    queryFn: fetchMarsData,
    refetchInterval: ONE_HOUR_MS,
    refetchOnWindowFocus: false,
  })
}
