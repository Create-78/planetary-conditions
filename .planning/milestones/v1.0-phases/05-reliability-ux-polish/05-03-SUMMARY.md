---
phase: 05-reliability-ux-polish
plan: 03
subsystem: hooks + tabs + audit
tags: [abortsignal, accessibility, audit, reliability, REL-01, REL-04, REL-05]
completed: "2026-05-21T16:46:51Z"
status: complete
requirements:
  - REL-01
  - REL-04
  - REL-05
dependency_graph:
  requires:
    - "Plan 05-01 (formatters.js + doc-comment polish in useMarsData/useDonkiEvents)"
    - "Plan 05-02 (TooltipWrapper IS_TOUCH/scroll-follow/clamp; AlertCard role removal)"
  provides:
    - "TanStack v5 AbortSignal threaded through useMarsData, useSolarWind, useDonkiEvents"
    - "MoonTab DONKI scroll region as named keyboard landmark"
    - "MoonTab AlertCard list keys namespaced by event type"
    - "Inline Phase 5 audit checklist (per 05-CONTEXT D-01) covering MarsTab + MoonTab × REL-01..REL-05"
  affects:
    - "Any future hook (Phase 6+) — pattern locked as queryFn: async ({ signal }) => fetch(url, { signal })"
tech_stack:
  added: []
  patterns:
    - "queryFn destructures { signal } from TanStack v5 context object"
    - "Helper functions accept { signal } = {} (default-empty so non-Query callers don't break)"
    - "Scrollable lists become named keyboard regions via tabIndex={0} + role='region' + aria-label"
    - "React list keys prefixed by source-type when multiple endpoints feed a merged stream"
key_files:
  created:
    - ".planning/phases/05-reliability-ux-polish/05-03-SUMMARY.md"
  modified:
    - "src/hooks/useMarsData.js"
    - "src/hooks/useSolarWind.js"
    - "src/hooks/useDonkiEvents.js"
    - "src/tabs/MoonTab.jsx"
decisions:
  - "queryFn helpers use { signal } = {} default-empty destructure so they remain callable outside the TanStack pipeline (e.g., future inline smoke tests) without crashing on undefined arg"
  - "DONKI focus ring uses the existing moon-accent palette token — no new Tailwind tokens introduced (D-25 cross-plan invariant)"
  - "Audit checklist inlined in SUMMARY.md per D-01 — no separate AUDIT.md artifact to avoid sprawl"
  - "Audit found zero drift — no follow-up fix tasks; Phase 2 primitives + Phase 3/4 wiring already satisfy REL-01..REL-05"
metrics:
  duration_min: 2.4
  tasks_completed: 3
  files_touched: 4
  completed_date: "2026-05-21"
  commits:
    - "9da7b68: feat(05-03): thread TanStack v5 AbortSignal into all three data hooks"
    - "c133d55: feat(05-03): MoonTab DONKI scroll region keyboard a11y + AlertCard key prefix"
---

# Phase 5 Plan 03 — Summary

**One-liner:** Threaded TanStack v5's AbortSignal through every `fetch` in the three data hooks, made MoonTab's DONKI scroll region a named keyboard landmark, namespaced AlertCard list keys to prevent cross-endpoint ID collisions, and produced an inline audit checklist that confirms zero REL-01..REL-05 drift across both tabs.

## What shipped in this plan

- **AbortSignal threading (D-19, D-20, D-21):** `useMarsData`, `useSolarWind` (plasma/mag/kp), and `useDonkiEvents` (cme/flr/gst) now destructure `{ signal }` from TanStack v5's queryFn context and forward it to `fetch(url, { signal })`. TanStack v5 cancels in-flight requests on unmount or when a refetch supersedes a pending one. Closes 03-REVIEW IN-02.
- **MoonTab DONKI scroll region keyboard a11y (D-14):** The `max-h-96 overflow-y-auto` container is now a named keyboard-focusable region — `tabIndex={0}` + `role="region"` + `aria-label="Recent solar events"` + `focus-visible:ring-moon-accent`. Closes 04-REVIEW WR-01.
- **MoonTab AlertCard key prefix (D-15):** `key={ev.id}` → `key={`${ev.type}-${ev.id}`}` guards against the theoretical case where DONKI's per-endpoint ID namespaces (CME / FLR / GST) collide in the merged event stream. Closes 04-REVIEW WR-02.
- **Phase 5 audit checklist (D-01, D-02, D-03):** Inline in this SUMMARY.md (no separate AUDIT.md). Covers every DataCard / StatusBadge / AlertCard / freshness chip on both tabs × REL-01..REL-05. Findings: **no drift detected.**

## Phase 5 audit checklist (per 05-CONTEXT D-01)

Legend: ✓ = present, N/A = not applicable to this panel, — = no value to display in this state.

### Mars tab

Source: `useMarsData` (MAAS2 / Curiosity REMS) — single fetch fanning out to 8 DataCards via shared `cardState` (REL-05 silent refresh: reads `isLoading` only, never the background-refresh flag).

| Panel | Unit (REL-02) | Tooltip (REL-03) | Freshness chip (REL-04) | Loading / Error fallback (REL-01) |
|-------|---------------|-------------------|-------------------------|-----------------------------------|
| Sol | N/A (integer count) | mars.sol | per-card LastUpdated + tab-level | state='loading' → skeleton; state='error' → DataCard error UI |
| Earth Date | N/A (date string) | mars.earthDate | per-card LastUpdated + tab-level | same |
| Min Temp | °C | mars.minTemp | per-card LastUpdated + tab-level | same |
| Max Temp | °C | mars.maxTemp | per-card LastUpdated + tab-level | same |
| Pressure | Pa | mars.pressure | per-card LastUpdated + tab-level | same |
| Humidity | % | mars.humidity | per-card LastUpdated + tab-level | same |
| Wind Speed | m/s | mars.windSpeed | per-card LastUpdated + tab-level | same |
| Atmospheric Opacity | N/A (categorical) | mars.opacity | per-card LastUpdated + tab-level | same |
| Tab header | N/A | source attribution ("From Curiosity Rover · REMS instrument") | tab-level LastUpdated | header always visible |

All Mars-tab cells satisfy REL-01..REL-04. ✓

### Moon tab — Lunar Context (computed locally; no fetch)

Source: `useLunarPhase` (pure computation, ticks at 30s via `useNow`). No fetch → no `LastUpdated` chip by design; replaced by "Computed locally" subtitle per REL-04.

| Panel | Unit (REL-02) | Tooltip (REL-03) | Freshness chip (REL-04) | Loading / Error fallback (REL-01) |
|-------|---------------|-------------------|-------------------------|-----------------------------------|
| Phase Name | N/A | lunar.phase | "Computed locally" subtitle | N/A (pure computation cannot fail) |
| Phase Percentage | % | lunar.phase | "Computed locally" subtitle | N/A |
| Day/Night | N/A | lunar.dayNight | "Computed locally" subtitle | N/A |
| Estimated Surface Temp (visible face) | °C | lunar.surfaceTemp | "Computed locally" subtitle | N/A |

All Lunar Context cells satisfy REL-01..REL-04. ✓

### Moon tab — Space Weather: Solar Wind (useSolarWind, 5min refetch)

Source: `useSolarWind` (NOAA SWPC plasma/mag/Kp). Shared `swpcCardState` propagates `isLoading`/`isError` to all four DataCards and gates the Radiation Risk StatusBadge.

| Panel | Unit (REL-02) | Tooltip (REL-03) | Freshness chip (REL-04) | Loading / Error fallback (REL-01) |
|-------|---------------|-------------------|-------------------------|-----------------------------------|
| Solar Wind Speed | km/s | swpc.speed | per-card LastUpdated + section-level | state='loading' → skeleton; state='error' → DataCard error UI |
| Solar Wind Density | p/cm³ | swpc.density | per-card LastUpdated + section-level | same |
| Bz | nT | swpc.bz | per-card LastUpdated + section-level | same |
| Kp Index | N/A (0–9 scale) | swpc.kp | per-card LastUpdated + section-level | same |
| Radiation Risk badge | N/A | swpc.radiationRisk | section-level LastUpdated | hidden when `swpcCardState !== 'ok'` OR severity is null (StatusBadge contract requires real severity; D-15 from 04-CONTEXT) |

All Solar Wind cells satisfy REL-01..REL-04. ✓

### Moon tab — Solar Event Alerts (useDonkiEvents, 15min refetch)

Source: `useDonkiEvents` (NASA DONKI CME/FLR/GST merged 7-day window). Three branches: 3-skeleton loading, "Data temporarily unavailable" error, "No significant events…" empty, and the AlertCard list with the keyboard-focusable scroll region.

| Panel | Unit (REL-02) | Tooltip (REL-03) | Freshness chip (REL-04) | Loading / Error fallback (REL-01) |
|-------|---------------|-------------------|-------------------------|-----------------------------------|
| AlertCard list (CME) | N/A | donki.cme on each card | section-level LastUpdated | loading → 3 skeletons; error → "Data temporarily unavailable"; empty → "No significant events in the past 7 days — conditions are calm." |
| AlertCard list (FLR) | N/A | donki.flr on each card | section-level LastUpdated | same as above |
| AlertCard list (GST) | N/A | donki.gst on each card | section-level LastUpdated | same as above |
| Scroll region (this plan) | N/A | N/A | covered by section-level chip | keyboard-focusable named region (tabIndex={0} + role="region" + aria-label="Recent solar events") |

All Solar Event Alerts cells satisfy REL-01..REL-04. ✓

## REL-05 silent-refetch lock proof (project-wide)

`grep -rn "isFetching" src/` output:

```
isFetching: no matches (PASS)
```

`isFetching` is intentionally absent from every Phase 3/4 source file. All hooks and consumers read `isLoading` (first-mount loading) only; background refetches at 1h / 5min / 15min cadences keep prior values rendered. The D-43 silent-refresh lock locked in Phase 4 is preserved verbatim and reverified by Phase 5.

## AbortSignal proofs

`grep -n "{ signal }" src/hooks/useMarsData.js`:

```
28:async function fetchMarsData({ signal } = {}) {
34:  const response = await fetch(MAAS2_URL, { signal })
```

`grep -n "{ signal }" src/hooks/useSolarWind.js`:

```
34:async function fetchTabular(url, { signal } = {}) {
35:  const response = await fetch(url, { signal })
66:async function fetchPlasma({ signal } = {}) {
67:  const table = await fetchTabular(PLASMA_URL, { signal })
75:async function fetchMag({ signal } = {}) {
76:  const table = await fetchTabular(MAG_URL, { signal })
83:async function fetchKp({ signal } = {}) {
84:  const table = await fetchTabular(KP_URL, { signal })
```

`grep -n "{ signal }" src/hooks/useDonkiEvents.js`:

```
52:async function fetchDonki(url, { signal } = {}) {
53:  const response = await fetch(url, { signal })
125:        queryFn: ({ signal }) => fetchDonki(cmeUrl, { signal }),
131:        queryFn: ({ signal }) => fetchDonki(flrUrl, { signal }),
137:        queryFn: ({ signal }) => fetchDonki(gstUrl, { signal }),
```

Every `fetch` call in the three Phase 3/4 data hooks now receives the TanStack v5 abort signal. v5 cancels these requests on unmount or when a refetch supersedes a pending one — no manual cleanup needed.

## DONKI a11y proofs

`grep -n 'tabIndex={0}\|role="region"\|aria-label="Recent solar events"' src/tabs/MoonTab.jsx`:

```
208:            tabIndex={0}
209:            role="region"
210:            aria-label="Recent solar events"
```

`grep -nF 'key={`${ev.type}-${ev.id}`}' src/tabs/MoonTab.jsx`:

```
214:                key={`${ev.type}-${ev.id}`}
```

The DONKI scroll region is now a keyboard landmark; AlertCard keys are type-namespaced.

## Phase 5 cross-plan invariants verified

- **No new npm dependencies (D-25):** `git diff --quiet package.json package-lock.json` returns exit 0 across all three Phase 5 plans. Plan 05-03 added none.
- **No new Tailwind palette tokens:** Plan 05-03 uses only `moon-accent` (existing). Only `mars-*`, `moon-*`, `space-*`, and standard Tailwind colors appear in Phase 5 edits.
- **Primitive APIs unchanged from Phase 2 contracts:** DataCard, TooltipWrapper, AlertCard, LastUpdated, StatusBadge, LoadingState all keep their Phase 2 prop shapes byte-identical. Plan 05-02 added module-internal behavior to TooltipWrapper (touch tap-to-toggle, scroll/resize follow, narrow-viewport clamp) without changing the prop surface.
- **Tooltip copy unchanged:** `src/constants/tooltips.js` is byte-identical to Phase 4 final state (19 keys total). Phase 5 added no copy.
- **REL-05 silent-refetch lock holds project-wide:** `grep -rn "isFetching" src/` returns zero matches.
- **`npm run build` exits 0** after every Phase 5 task (final build: 99 modules, 1.36s — same module count as Plan 05-01 and 05-02 end states, confirming no dependency drift).

## Findings → fixes

**The audit found NO drift.** Every Mars/Moon panel already meets REL-01..REL-05 thanks to Phase 2 primitive design (DataCard's three-state contract, LastUpdated's relative-time chip, StatusBadge's loading omission, AlertCard's tooltip+severity contract) and Phase 3/4 wiring (shared `cardState` propagation, per-section dataUpdatedAt timestamps, silent-refresh lock).

No follow-up fix tasks were created. Plans 05-01 and 05-02 closed the carry-forward warning/info items from prior phase reviews (formatter extraction, doc-comment drift, eslint-disable rationale, touch/scroll/clamp tooltip a11y, AlertCard false-button-role); this plan (05-03) closed the remaining three items (AbortSignal threading, DONKI list keyboard a11y, AlertCard key collision safety).

## Untouched (Intentional)

- **Primitive components** (DataCard, TooltipWrapper, AlertCard, LastUpdated, StatusBadge, LoadingState) — none modified in 05-03. Phase 2 API surface stays frozen since Plan 05-02 closed.
- **Tooltip copy** — `src/constants/tooltips.js` unchanged.
- **`src/utils/formatters.js`** — created in Plan 05-01, unchanged here.
- **`src/utils/lunarPhase.js`, `src/utils/radiationRisk.js`, `src/utils/env.js`** — all frozen.
- **`src/tabs/MarsTab.jsx`** — audit confirmed full REL-01..REL-05 coverage; zero changes needed.
- **`package.json` / `package-lock.json`** — byte-identical to Plan 05-02 end state.
- **Doc comments / Plan 05-01 polish** — "eight DataCards" in useMarsData.js, NASA_API_KEY rationale in useDonkiEvents.js: both preserved through the AbortSignal edits.
- **Tab-level LastUpdated on MoonTab intentionally omitted** — three sources at three cadences; per-section chips are the right granularity (preserved from Phase 4 D-30 / D-42).

## Deviations from Plan

None — the plan executed exactly as written. All three tasks landed with their grep contracts green on the first edit. One transient shell-quoting wrinkle during verification (backticks inside a single-quoted `grep` argument were interpreted as command substitution) was resolved by re-running the same check with `grep -F` against the fixed string; the file content itself was correct.

## Verification Outcomes

| Check | Expected | Actual |
|-------|----------|--------|
| `async function fetchMarsData({ signal } = {})` in useMarsData.js | 1 | 1 |
| `fetch(MAAS2_URL, { signal })` in useMarsData.js | 1 | 1 |
| `async function fetchTabular(url, { signal } = {})` in useSolarWind.js | 1 | 1 |
| `fetch(url, { signal })` in useSolarWind.js | 1 | 1 |
| `async function fetchPlasma/Mag/Kp({ signal } = {})` in useSolarWind.js | 3 | 3 |
| `fetchTabular(PLASMA_URL/MAG_URL/KP_URL, { signal })` in useSolarWind.js | 3 | 3 |
| `async function fetchDonki(url, { signal } = {})` in useDonkiEvents.js | 1 | 1 |
| `({ signal }) => fetchDonki(<url>, { signal })` queryFn arrows in useDonkiEvents.js | 3 | 3 |
| `eight DataCards` in useMarsData.js (Plan 05-01 preserved) | 1 | 1 |
| `NASA_API_KEY is a module-level constant baked in at build time` in useDonkiEvents.js (Plan 05-01 preserved) | 1 | 1 |
| `queryKey: ['mars', 'maas2', 'latest']` in useMarsData.js | 1 | 1 |
| `refetchInterval: FIVE_MIN_MS` in useSolarWind.js | 3 | 3 |
| `refetchInterval: FIFTEEN_MIN_MS` in useDonkiEvents.js | 3 | 3 |
| `refetchOnWindowFocus: false` in useSolarWind.js | 3 | 3 |
| `refetchOnWindowFocus: false` in useDonkiEvents.js | 3 | 3 |
| `tabIndex={0}` in MoonTab.jsx | 1 | 1 |
| `role="region"` in MoonTab.jsx | 1 | 1 |
| `aria-label="Recent solar events"` in MoonTab.jsx | 1 | 1 |
| `focus-visible:ring-moon-accent` in MoonTab.jsx | 1 | 1 |
| `` key={`${ev.type}-${ev.id}`} `` in MoonTab.jsx | 1 | 1 |
| `key={ev.id}` in MoonTab.jsx | 0 | 0 |
| `Data temporarily unavailable` in MoonTab.jsx | 1 | 1 |
| `No significant events in the past 7 days` in MoonTab.jsx | 1 | 1 |
| `from '../utils/formatters.js'` in MoonTab.jsx (Plan 05-01 preserved) | 1 | 1 |
| `isFetching` in MoonTab.jsx | 0 | 0 |
| `isFetching` in MarsTab.jsx | 0 | 0 |
| `grep -rn "isFetching" src/` (project-wide) | 0 matches | 0 matches |
| `^const IS_TOUCH` in TooltipWrapper.jsx (Plan 05-02 preserved) | 1 | 1 |
| `role="button"` in AlertCard.jsx (Plan 05-02 preserved as removed) | 0 | 0 |
| `git diff --quiet package.json package-lock.json` | exit 0 | exit 0 |
| `src/utils/formatters.js` exists | yes | yes |
| `npm run build` | exit 0 | exit 0 (built in 1.36s; 99 modules) |

## Files Touched

| File | Change |
|------|--------|
| `src/hooks/useMarsData.js` | `fetchMarsData()` → `fetchMarsData({ signal } = {})`; `fetch(MAAS2_URL)` → `fetch(MAAS2_URL, { signal })`; added 3-line doc comment explaining the v5 abort-signal forwarding |
| `src/hooks/useSolarWind.js` | `fetchTabular(url)` → `fetchTabular(url, { signal } = {})`; `fetchPlasma/Mag/Kp` each destructure `{ signal } = {}` and forward to `fetchTabular(URL, { signal })`; queryFn entries remain unchanged (still reference the named functions; v5 passes the context object directly) |
| `src/hooks/useDonkiEvents.js` | `fetchDonki(url)` → `fetchDonki(url, { signal } = {})`; three queryFn arrows updated to `({ signal }) => fetchDonki(<url>, { signal })`; URL memoization + dayKey + eslint-disable rationale all unchanged |
| `src/tabs/MoonTab.jsx` | DONKI scroll-region div: added `tabIndex={0}`, `role="region"`, `aria-label="Recent solar events"`, and `focus:outline-none focus-visible:ring-2 focus-visible:ring-moon-accent`; AlertCard `key={ev.id}` → `` key={`${ev.type}-${ev.id}`} `` |
| `.planning/phases/05-reliability-ux-polish/05-03-SUMMARY.md` | **Created** — this file |

## Decisions Made

1. **Helpers accept `{ signal } = {}` (default-empty), not bare `{ signal }`.** This lets the helpers stay callable outside the TanStack pipeline — e.g., from a future inline node smoke check — without crashing on undefined arg. Cost: zero. Benefit: defensive future-proofing.
2. **useSolarWind's queryFn entries still reference named functions, not arrows.** `queryFn: fetchPlasma` works in v5 because v5 invokes the function with `(context)` and our destructure picks up `signal`. No need to wrap in `({ signal }) => fetchPlasma({ signal })` — equivalent semantics, less noise.
3. **DONKI focus ring uses `moon-accent` palette token.** The cross-plan invariant "no new Tailwind tokens" (D-25) is preserved. The existing palette already provides the right contrast — no new color decisions required.
4. **Audit inlined in SUMMARY.md (no AUDIT.md).** Per D-01 / D-02. A separate audit artifact would have created sprawl without value at v1 scale; downstream phases (Phase 6 deploy) will reference this section directly.
5. **No drift → no fix tasks.** The audit is a passive verification, not a forcing function. Where Phase 2 primitives + Phase 3/4 wiring already covered the requirements, the right deliverable is documented evidence, not new code.

## Self-Check: PASSED

- File `.planning/phases/05-reliability-ux-polish/05-03-SUMMARY.md` exists.
- Commit `9da7b68` (AbortSignal threading) present in `git log --oneline`.
- Commit `c133d55` (MoonTab DONKI a11y + AlertCard key) present in `git log --oneline`.
- Production build (`npm run build`) exits 0; 99 modules transformed (same module count as Plan 05-01 + 05-02 end states — no dependency drift across the entire phase).
- `grep -rn "isFetching" src/` returns zero matches project-wide (REL-05 lock holds).
- `git diff --quiet package.json package-lock.json` returns exit 0 across the phase.
- All audit checklist cells filled; no drift entries.

---

*Plan 05-03 complete. Phase 5 — Reliability & UX Polish — is now complete pending checker review. Next: Phase 6 — Vercel Deployment (the final phase).*
