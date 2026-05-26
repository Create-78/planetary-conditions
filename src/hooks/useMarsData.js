import { useQuery } from '@tanstack/react-query'

/**
 * useMarsData — TanStack Query hook for the latest Martian sol from MAAS2.
 *
 * Data source: same-origin /api/maas2 endpoint (Vercel Edge Function) which
 * server-side-proxies https://api.maas2.apollorion.com/. MAAS2 itself does
 * not emit Access-Control-Allow-Origin headers, so direct browser fetches
 * are blocked by CORS in production; the Edge proxy fixes that and also
 * normalizes the Content-Type to application/json (upstream returns text/html).
 * See Plan 06-02 Task 5 deviation + D-13 contingency.
 *
 * Cadence: 1-hour refetchInterval. Underlying MAAS2 data refreshes ~once per
 * Martian sol (~24.6 h), so hourly is generous and matches Discussion.md §3.
 * The Edge proxy adds its own s-maxage=3600 + stale-while-revalidate=86400
 * cache so most requests are served at the CDN edge without hitting upstream.
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

const MAAS2_URL = '/api/maas2'
const ONE_HOUR_MS = 1000 * 60 * 60

async function fetchMarsData({ signal } = {}) {
  // The Edge proxy returns proper application/json with valid JSON body, so
  // we could use response.json() directly — but keeping the text → JSON.parse
  // pipeline preserves explicit error messages if the proxy ever returns a
  // 502 payload (e.g., upstream MAAS2 unreachable).
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
