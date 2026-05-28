---
phase: 04-moon-tab-three-sub-sections
plan: 02
subsystem: moon-tab-data-hooks
tags: [moon, hooks, tanstack-query, useQueries, swpc, donki, lunar-phase]
status: complete
requirements: [LUNAR-01, SWPC-01, DONKI-01]
dependency_graph:
  requires:
    - "src/utils/lunarPhase.js (Plan 04-01) → computePhase(date)"
    - "src/utils/env.js (Phase 1) → NASA_API_KEY"
    - "src/hooks/useNow.js (Phase 2) → 30s shared ticker"
  provides:
    - "src/hooks/useLunarPhase.js → useLunarPhase() — pure-computation hook"
    - "src/hooks/useSolarWind.js → useSolarWind() — NOAA SWPC fan-out, 5min cadence"
    - "src/hooks/useDonkiEvents.js → useDonkiEvents() — NASA DONKI fan-out, 15min cadence"
  affects:
    - "Plan 04-03 MoonTab.jsx consumes all three hooks; applies Phase 3 cardState pattern per-section"
tech_stack:
  added: []
  patterns:
    - "useQueries v5 batch hook for fan-out across multiple endpoints in one hook"
    - "Tabular-JSON parsing via [headers, ...rows] + Object.fromEntries + latest-non-null-row walker"
    - "Date-window memoization on stable day-only useMemo key (prevents mid-hour URL churn)"
    - "Number coercion → null (not NaN) for em-dash fallback in DataCard"
    - "Merge semantics: isLoading=OR, isError=OR, dataUpdatedAt=Math.max"
    - "D-43 silent-refresh lock: read isLoading (first-mount), not the background-refresh flag"
key_files:
  created:
    - src/hooks/useLunarPhase.js
    - src/hooks/useSolarWind.js
    - src/hooks/useDonkiEvents.js
  modified: []
decisions:
  - "useLunarPhase subscribes to useNow's native 30s cadence, not a widened 60s — 30s over-satisfies the 'stay current over long sessions' criterion and the math is sub-millisecond (matches CONTEXT D-01 footnote in 04-02-PLAN)"
  - "useSolarWind's latest-non-null-row walker iterates rows[] from newest→oldest; falls back to the absolute last row if every row's targetField is null (DataCard then renders em-dash)"
  - "toNumberOrNull coerces empty strings ('') and non-numeric values to null instead of NaN so DataCard's null branch (em-dash) triggers consistently"
  - "useDonkiEvents memoizes the URL set on todayKey() (YYYY-MM-DD), not on the full minute or hour — re-renders at 14:59 → 15:00 within the same day don't invalidate cache or refetch"
  - "Event sort uses new Date(time).getTime() instead of string compare for deterministic ordering across mixed-tz ISO strings"
  - "queryKeys include dayKey ('donki', type, dayKey) so date rollover at midnight evicts the previous day's cache automatically"
  - "GST severity uses .reduce() to find max kpIndex (not Math.max(...spread)) so non-numeric kpIndex entries are safely skipped"
  - "Hooks return the merged object directly, not the raw useQueries results array — keeps MoonTab.jsx's per-section cardState propagation as a simple destructure"
metrics:
  duration_minutes: 3.10
  tasks_completed: 3
  files_changed: 3
  commits: 3
  completed_date: "2026-05-21"
---

# Phase 04 Plan 02: Moon Tab Data Hooks — Summary

Landed three Moon-tab data hooks — one pure-computation (`useLunarPhase`) and two TanStack Query v5 `useQueries` fan-outs (`useSolarWind`, `useDonkiEvents`) — exposing a uniform `{ ..., isLoading, isError, dataUpdatedAt }` consumer surface for Plan 04-03's MoonTab integration. Build clean, all three D-43 silent-refresh and env-discipline negative-greps satisfied.

## What Was Built

### `src/hooks/useLunarPhase.js` (NEW)

Pure-computation hook — no fetch, no React Query. Subscribes to the shared `useNow()` 30s ticker and delegates to `computePhase()` from Plan 04-01.

**Signature:**
```js
useLunarPhase() → {
  phaseName: string,              // e.g. 'Waxing Crescent'
  phaseFraction: number,          // [0, 1)
  dayNightStatus: string,         // D-04 short descriptive string
  surfaceTempC: number,           // cosine-interpolated °C
  computedAt: Date,               // the `now` value useNow returned
}
```

**No `isLoading` / `isError`** — the computation cannot fail. Plan 04-03 may still branch on `phaseName == null` defensively (it won't be null in practice).

**Re-render cadence:** 30s (useNow's native tick). The 04-CONTEXT D-01 phrasing said "60s" but the plan's `<interfaces>` block explicitly notes 30s over-satisfies the intent and matches what useNow actually emits — no widening needed.

### `src/hooks/useSolarWind.js` (NEW)

TanStack Query v5 `useQueries` fan-out across three NOAA SWPC endpoints.

**Signature:**
```js
useSolarWind() → {
  speed: number | null,           // km/s
  density: number | null,         // p/cm³
  bz: number | null,              // nT
  kp: number | null,              // dimensionless 0–9
  isLoading: boolean,             // OR across plasma/mag/kp first-mount loading
  isError: boolean,               // OR across plasma/mag/kp
  dataUpdatedAt: number,          // Math.max(...timestamps), 0 if all pre-fetch
}
```

**Endpoints (no auth, CORS-open, correct Content-Type — no MAAS2 workaround needed):**
- `https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json` → `speed`, `density`
- `https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json` → `bz_gsm` (mapped to `bz`)
- `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json` → `kp_index` (mapped to `kp`)

**Tabular parse pattern:**
1. `[headers, ...rows] = await response.json()`
2. Walk rows newest→oldest; return first row whose target field is non-null
3. `Object.fromEntries(headers.map(...))` zip into a header-keyed object
4. `Number(value)` with NaN→null coercion via `toNumberOrNull` helper

**Cadence:** `refetchInterval: 1000 * 60 * 5` (5 min) per all three sub-queries. `refetchOnWindowFocus: false` (D-43).

**Merge semantics:** isLoading=OR, isError=OR, dataUpdatedAt=Math.max with `|| 0` guard for pre-fetch undefined.

### `src/hooks/useDonkiEvents.js` (NEW)

TanStack Query v5 `useQueries` fan-out across three NASA DONKI endpoints, with a 7-day window memoized on a stable day-only key.

**Signature:**
```js
useDonkiEvents() → {
  events: Array<{
    id: string,                   // activityID | flrID | gstID
    type: 'CME' | 'FLR' | 'GST',
    time: string,                 // ISO 8601 — startTime | beginTime | startTime
    severity: string,             // see mappers below
    tooltipKey: string,           // 'donki.cme' | 'donki.flr' | 'donki.gst'
  }>,                             // reverse-chronological
  isLoading: boolean,
  isError: boolean,
  dataUpdatedAt: number,
}
```

**Endpoints (NASA_API_KEY via `import { NASA_API_KEY } from '../utils/env.js'`):**
- `https://api.nasa.gov/DONKI/CME?startDate=${d}&api_key=${NASA_API_KEY}`
- `https://api.nasa.gov/DONKI/FLR?startDate=${d}&api_key=${NASA_API_KEY}`
- `https://api.nasa.gov/DONKI/GST?startDate=${d}&api_key=${NASA_API_KEY}`

**Date window:** `sevenDaysAgoISO()` → YYYY-MM-DD, memoized on `todayKey()` (today's YYYY-MM-DD). Re-renders within the same calendar day do not regenerate URLs. queryKeys include dayKey so a date rollover evicts the prior day's cache automatically.

**Per-type severity mappers:**
- CME: `cmeAnalyses[0]?.speed` → `Speed: ${speed} km/s` or `'Speed unknown'`
- FLR: `classType` → `Class ${cls}` or `'Class unknown'`
- GST: `allKpIndex[].kpIndex` max → `Kp peak: ${peak}` or `'Kp ongoing'` (uses `.reduce()` not `Math.max(...spread)` so non-numeric entries are skipped gracefully)

**Merge + sort:** Unified events array sorted via `new Date(b.time).getTime() - new Date(a.time).getTime()` — deterministic across mixed-tz ISO strings. Memoized on `[cme.data, flr.data, gst.data]` so referential identity is stable across mid-fetch re-renders.

**Cadence:** `refetchInterval: 1000 * 60 * 15` (15 min). `refetchOnWindowFocus: false` (D-43).

## Decisions Made

1. **useLunarPhase rides useNow's native 30s tick, not a widened 60s.** The plan's `<interfaces>` block flagged this explicitly: 30s over-satisfies LUNAR-01 / ROADMAP-5's "stay current" criterion, and the math is sub-millisecond. No new ticker module needed.
2. **Latest-non-null-row walker preferred over plain "last row".** NOAA occasionally writes a row with `null` measurements; grabbing the absolute last row would dump em-dashes into DataCards even though valid data sits one row earlier. The walker iterates newest→oldest until it finds a row whose target field is non-null. Falls back to the absolute last row only if every row is null (so DataCard's em-dash fallback still triggers).
3. **`toNumberOrNull` instead of bare `Number(v)`.** Empty strings, `null`, `undefined`, and non-numeric values all collapse to `null`, NOT `NaN`. DataCard's null branch renders an em-dash; rendering `"NaN"` would be a UX regression.
4. **Date-window memo keyed on `todayKey()` (YYYY-MM-DD), not on the full ISO timestamp.** A `useMemo` with deps that change every render would be useless. A day-only string changes once per local midnight, which is the cadence we actually care about for cache invalidation.
5. **queryKeys include `dayKey`.** `['donki', 'cme', '2026-05-21']` rather than `['donki', 'cme']`. On date rollover, TanStack Query treats the new dayKey-suffixed query as a fresh entry and silently evicts the previous day's cache without bespoke gc code.
6. **Event sort uses `Date.getTime()`, not string compare.** ISO 8601 string comparison is correct for same-Z strings but fragile if any endpoint ever returned timezone-suffixed strings (e.g., `+0000`). `getTime()` is unambiguous.
7. **`useQueries` results destructured into named locals before merging.** `const [plasma, mag, kp] = results` reads better than `results[0].isLoading || results[1].isLoading || ...`. The cost is one line of destructure; the benefit is the merge expressions read like English.
8. **Pre-fetch `dataUpdatedAt` guarded with `|| 0`.** `Math.max(undefined, undefined, undefined)` returns NaN. The `|| 0` on each operand plus the outer `|| 0` ensures the consumer always sees `0` before any sub-query resolves, which the `dataUpdatedAt ? new Date(dataUpdatedAt) : null` pattern in Phase 3 D-?? correctly handles as "no fresh timestamp yet → no LastUpdated chip yet".

## Comment-Grep Collisions

**One collision encountered** (Task 3, `useDonkiEvents.js`):

- The JSDoc header originally contained the prose phrase "never inline import.meta.env access at the call site" to explain the env-var discipline. The plan's `<verify>` block negative-greps `import.meta.env`, which caught the comment.
- **Resolution:** Paraphrased to "never read the build-time env object directly at the call site" — same meaning, no token collision. This follows the established Phase 1/2/3 pattern noted in STATE.md ("doc-comments paraphrase the literal because the verification negative-greps it").
- No collision in `useSolarWind.js` (the hook never references env at all) or `useLunarPhase.js` (no fetch, no env).
- No collision on `isFetching` — the JSDoc in `useSolarWind` and `useDonkiEvents` consistently uses the phrase "the background-refresh flag" instead of naming the TanStack Query field directly.

## Deviations from Plan

**None.** Plan executed exactly as written:
- Three tasks, three commits, three files created
- Verbatim implementations from each task's `<action>` block (only the JSDoc paraphrase noted above as a comment-grep collision resolution, which the plan explicitly anticipated in Task 3's `<output>` carry-forward instruction: "did any task have to paraphrase to avoid the `isFetching` or `VITE_NASA_API_KEY` negative greps?")
- All grep contracts and negative greps in the end-of-plan verification block pass
- `npm run build` exits 0 after each task and at end of plan
- Zero new npm dependencies (TanStack Query v5 already installed; `useQueries` is exported by the v5 entrypoint)

No authentication gates encountered (DONKI uses `DEMO_KEY` fallback in dev; rate limit risk is documented in PROJECT.md, not blocking here).

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | useLunarPhase.js — pure-computation hook | `3071e39` | src/hooks/useLunarPhase.js |
| 2 | useSolarWind.js — SWPC useQueries fan-out | `2b20f4e` | src/hooks/useSolarWind.js |
| 3 | useDonkiEvents.js — DONKI useQueries fan-out | `ca1becb` | src/hooks/useDonkiEvents.js |

## Carry-Forward for Plan 04-03

Plan 04-03 (MoonTab body) consumes all three hooks. Drop-in usage:

```js
import { useLunarPhase } from '../hooks/useLunarPhase.js'
import { useSolarWind } from '../hooks/useSolarWind.js'
import { useDonkiEvents } from '../hooks/useDonkiEvents.js'

function MoonTab() {
  const lunar = useLunarPhase()                             // never fails, no isLoading
  const sw = useSolarWind()                                 // { speed, density, bz, kp, isLoading, isError, dataUpdatedAt }
  const donki = useDonkiEvents()                            // { events, isLoading, isError, dataUpdatedAt }
  // Apply Phase 3 cardState pattern per-section (D-41):
  //   sw.isLoading -> SWPC section's 4 DataCards show 'loading'
  //   donki.isLoading -> DONKI section shows 3 LoadingState skeletons
  //   sw.isError -> SWPC section shows 'error' state on all 4 cards
  //   etc.
}
```

**Radiation Risk badge note for Plan 04-03:** Per 04-CONTEXT D-15, derive in the consumer (MoonTab), not in `useSolarWind`. The hook does NOT call `deriveRadiationRisk` — that import lives in MoonTab.jsx alongside the StatusBadge render.

**Empty-state copy for DONKI section:** When `donki.events.length === 0` AND `!donki.isLoading` AND `!donki.isError`, render the literal copy `"No significant events in the past 7 days — conditions are calm."` (D-25). Not an AlertCard — a centered muted div.

**Tooltip keys ready for binding** (Plan 04-01 added all of these):
- Lunar Context → `lunar.phase`, `lunar.surfaceTemp`, `lunar.dayNight`
- Solar Wind → `swpc.speed`, `swpc.density`, `swpc.bz`, `swpc.kp`, `swpc.radiationRisk`
- DONKI → `donki.cme`, `donki.flr`, `donki.gst`

**Per-section LastUpdated cadence:**
- Lunar Context — no LastUpdated chip; render static "Computed locally" subtitle (D-07)
- Solar Wind — `<LastUpdated timestamp={sw.dataUpdatedAt ? new Date(sw.dataUpdatedAt) : null} palette="moon" />` driven by the merged SWPC dataUpdatedAt
- DONKI — same pattern using `donki.dataUpdatedAt`

## Requirements Satisfied

- **LUNAR-01** — `useLunarPhase` hook returns phase/day-night/temp from a model-based computation (delegates to Plan 04-01's `computePhase`).
- **SWPC-01** — `useSolarWind` hook returns live NOAA SWPC speed/density/Bz/Kp data merged from three endpoints.
- **DONKI-01** — `useDonkiEvents` hook returns last-7-day CME/FLR/GST events as a unified reverse-chronological array.

## Self-Check: PASSED

- `src/hooks/useLunarPhase.js` exists ✓
- `src/hooks/useSolarWind.js` exists ✓
- `src/hooks/useDonkiEvents.js` exists ✓
- Commit `3071e39` in git log ✓
- Commit `2b20f4e` in git log ✓
- Commit `ca1becb` in git log ✓
- End-of-plan verification block passes (file existence + 3 hook contracts + silent-refetch lock + env-var discipline + build) ✓
- `npm run build` exits 0 ✓
