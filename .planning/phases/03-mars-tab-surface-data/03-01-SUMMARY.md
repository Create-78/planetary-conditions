---
phase: 03-mars-tab-surface-data
plan: 01
subsystem: data-layer
tags: [react, tanstack-query, mars, maas2, tooltips, fetch]

# Dependency graph
requires:
  - phase: 01-scaffold-shell
    provides: QueryClientProvider mounted in src/main.jsx; src/hooks/ directory
  - phase: 02-shared-ui-primitives
    provides: src/constants/tooltips.js with TOOLTIPS object and getTooltip(key) accessor
provides:
  - useMarsData TanStack Query hook returning the full query result for MAAS2 latest sol
  - Eight mars.* tooltip entries with verbatim Discussion.md §5 copy under shared TOOLTIPS namespace
  - Locked MAAS2 Content-Type quirk handling (manual text -> JSON.parse) at the hook layer
affects: [03-02 mars-tab-ui-composition, future v2 sol-selector, phase-4 moon-tab pattern reuse]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TanStack Query hook pattern: one hook per data source, returns full query result object so consumers can read data/isLoading/isError/dataUpdatedAt without prop drilling per field"
    - "MAAS2 fetch pattern: fetch().then(r => r.text()).then(JSON.parse) — bypasses GitHub Pages Content-Type quirk"
    - "Tooltip key extension pattern: namespace.datapoint keys appended to flat TOOLTIPS object; no API surface change to getTooltip()"

key-files:
  created:
    - src/hooks/useMarsData.js
  modified:
    - src/constants/tooltips.js

key-decisions:
  - "useMarsData throws on !response.ok and on JSON.parse failure so TanStack Query surfaces isError=true; returning null on failure would break Plan 03-02's DataCard error branch"
  - "queryKey ['mars','maas2','latest'] uses a 'latest' discriminator so a v2 sol-selector can extend with ['mars','maas2', solNumber] without colliding"
  - "Doc-comment rewritten to avoid the literal tokens r.json() and VITE_NASA_API_KEY because the plan's acceptance criteria negative-grep both strings — same comment-grep collision pattern observed in Phase 1/2"
  - "Tooltip source string locked to verbatim 'MAAS2 / Curiosity REMS' across all eight entries per D-21"

patterns-established:
  - "Hook file shape: import useQuery, define module-level URL + interval constants, async queryFn that throws Error, named export of useXyzData wrapping useQuery"
  - "Doc-comment style for hooks: header summary + Data source + Cadence + behavior options + return contract + auth note — matches useNow.js readability"
  - "Tooltip extension policy: never edit other tabs' entries when adding your own; never touch getTooltip(); preserve placeholder keys for tabs you don't own (moon.example, swpc.radiationRisk, donki.cme stay until Phase 4)"

requirements-completed: [MARS-01]

# Metrics
duration: 2.43min
completed: 2026-05-19
---

# Phase 3 Plan 1: Mars Data Layer Summary

**useMarsData TanStack Query hook (1h cadence, manual JSON.parse for MAAS2 Content-Type quirk) plus eight mars.* tooltip keys in the shared TOOLTIPS namespace.**

## Performance

- **Duration:** 2.43 min
- **Started:** 2026-05-19T13:45:52Z
- **Completed:** 2026-05-19T13:48:18Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- New `src/hooks/useMarsData.js` exporting `useMarsData()` — fetches `https://api.maas2.apollorion.com/` via `fetch -> r.text() -> JSON.parse`, refetches every 3,600,000 ms, does not refetch on window focus, throws on non-ok response or invalid JSON.
- Extended `src/constants/tooltips.js` with eight `mars.*` keys (sol, earthDate, minTemp, maxTemp, pressure, windSpeed, humidity, opacity) using verbatim Discussion.md §5 copy and `source: 'MAAS2 / Curiosity REMS'`.
- Removed the Phase 2 `mars.example` placeholder pre-emptively (D-22) so Plan 03-02 sees no stale demo-gallery reference.
- `npm run build` exits 0; module-load smoke test of tooltips.js passes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add mars.* tooltip keys and remove mars.example placeholder** — `6645b92` (feat)
2. **Task 2: Create useMarsData TanStack Query hook** — `6a0fc5d` (feat)

Plan metadata commit (this SUMMARY + STATE + ROADMAP) is created at the end of plan execution.

## Files Created/Modified

- `src/hooks/useMarsData.js` (created) — `useMarsData()` TanStack Query v5 hook for MAAS2 latest sol with locked Content-Type quirk handling.
- `src/constants/tooltips.js` (modified) — added eight `mars.*` entries; removed `mars.example` placeholder; updated header doc comment to reflect Phase 3 realization.

## Decisions Made

- **Manual `r.text() -> JSON.parse(text)`** (D-04, CLAUDE.md): MAAS2 is hosted on GitHub Pages and may return `text/html` or `text/plain`. Using `response.json()` would risk a Content-Type rejection, breaking the hook silently. Parsing the text body manually is the lock and is asserted by negative-greps in both the task and end-of-plan verification blocks.
- **Throw on failure, not return null:** The queryFn surfaces failures as thrown `Error` so TanStack Query sets `isError: true`. Returning `null` would surface as `isError: false, data: null` and bypass the DataCard error branch Plan 03-02 will wire up.
- **No `staleTime` / `retry` / `enabled` overrides:** The 1h `refetchInterval` is the freshness contract; defaults handle the rest. Setting `staleTime` would only matter for cross-component query sharing, which the Mars tab does not have.
- **Tooltip ordering:** mars.* entries placed between `mars.example`'s old slot and `moon.example` to keep namespace grouping conventional; ordering does not affect behavior because the consumer reads by key.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Rewrote `useMarsData.js` doc comment to avoid the literal tokens `r.json()` and `VITE_NASA_API_KEY`**

- **Found during:** Task 2 (verification)
- **Issue:** The plan's `<action>` block specified a doc comment containing the strings "using r.json()" and "VITE_NASA_API_KEY is reserved for Phase 4's DONKI calls". Both strings would have written the file verbatim — but Task 2's `<acceptance_criteria>` includes negative greps `! grep -q "r\.json()"` and `! grep -q "VITE_NASA_API_KEY"`, AND the end-of-plan `<verification>` block includes `! grep -q "\.json()"`. The acceptance criteria are the binding contract; the literal action block contradicted them.
- **Fix:** Reworded the doc comment to preserve the same explanatory content using paraphrase: "the response's built-in JSON shortcut" instead of `r.json()`, and "the project's NASA API key env var (out of scope here)" instead of `VITE_NASA_API_KEY`.
- **Files modified:** `src/hooks/useMarsData.js`
- **Verification:** All twelve grep assertions for Task 2 pass; `npm run build` exits 0.
- **Committed in:** `6a0fc5d` (the Task 2 commit captures the rewritten doc comment — the file was never committed with the conflicting strings).

---

**Total deviations:** 1 auto-fixed (Rule 3 — Blocking; doc-comment vs. verification grep collision)
**Impact on plan:** No scope or contract changes. Behavior, exports, and grep-asserted invariants are unchanged. Same comment-grep collision pattern previously seen in Phase 1 ("shimmer", "setInterval") and Phase 2 ("Phase 3", "Phase 4") tab-file comments.

## Issues Encountered

- None beyond the doc-comment grep collision documented above.

## User Setup Required

None — MAAS2 needs no API key and is CORS-open from the client.

## Next Phase Readiness

Plan 03-02 consumes the hook directly:

```js
import { useMarsData } from '../hooks/useMarsData.js'

function MarsTab() {
  const { data, isLoading, isError, dataUpdatedAt } = useMarsData()
  // ... map data.sol, data.terrestrial_date, data.min_temp, etc. to DataCards
  //     pass isLoading/isError as state, dataUpdatedAt as LastUpdated timestamp
}
```

**Contract reminders for Plan 03-02:**
- The hook returns the full query result; do NOT destructure inside `useMarsData` — let consumers pull what they need.
- `data` is `undefined` until the first successful fetch; guard before reading fields.
- `dataUpdatedAt` is epoch ms; pass as `timestamp` prop to `LastUpdated`.
- `tooltips.js` no longer contains `mars.example` — if any leftover consumer references it, `getTooltip('mars.example')` returns `null` (per the safe-accessor contract). Plan 03-02 will use the eight new `mars.*` keys instead.

**Reference field shape from MAAS2:**

```json
{ "sol": 4521, "terrestrial_date": "2026-05-18", "min_temp": -82.0, "max_temp": -10.0,
  "pressure": 720, "wind_speed": 5.4, "humidity": 12, "atmo_opacity": "Sunny" }
```

No live-test of the endpoint was performed during this plan; the hook will exercise on first mount in Plan 03-02's UAT.

---

## Self-Check: PASSED

- `src/hooks/useMarsData.js` — FOUND
- `src/constants/tooltips.js` — FOUND (modified)
- Commit `6645b92` (Task 1) — FOUND
- Commit `6a0fc5d` (Task 2) — FOUND
- `npm run build` exit 0 — VERIFIED
- All end-of-plan verification greps — PASS

---
*Phase: 03-mars-tab-surface-data*
*Completed: 2026-05-19*
