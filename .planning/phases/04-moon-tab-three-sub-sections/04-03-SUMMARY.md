---
phase: 04-moon-tab-three-sub-sections
plan: 03
subsystem: moon-tab-ui
tags: [moon, ui, tab, datacard, statusbadge, alertcard, lastupdated, sections]
status: complete
requirements:
  - LUNAR-02
  - LUNAR-03
  - LUNAR-04
  - SWPC-02
  - SWPC-03
  - SWPC-04
  - SWPC-05
  - SWPC-06
  - DONKI-02
  - DONKI-03
  - DONKI-04
  - DONKI-05
dependency_graph:
  requires:
    - "src/utils/radiationRisk.js (Plan 04-01) → deriveRadiationRisk({ speed, kp })"
    - "src/constants/tooltips.js (Plan 04-01) → 11 lunar.* / swpc.* / donki.* keys"
    - "src/hooks/useLunarPhase.js (Plan 04-02) → useLunarPhase()"
    - "src/hooks/useSolarWind.js (Plan 04-02) → useSolarWind()"
    - "src/hooks/useDonkiEvents.js (Plan 04-02) → useDonkiEvents()"
    - "Phase 2 primitives: DataCard, StatusBadge, AlertCard, LastUpdated, LoadingState"
  provides:
    - "src/tabs/MoonTab.jsx → live three-section Moon dashboard (Lunar Context / Space Weather / Solar Event Alerts)"
  affects:
    - "Phase 5 Reliability & UX Polish — consumes the live MoonTab for cross-tab loading/error/freshness audits"
    - "Phase 6 Vercel Deployment — uses MoonTab as the end-to-end DONKI+SWPC verification surface"
tech_stack:
  added: []
  patterns:
    - "Per-section cardState isolation (D-30, D-41): each section computes state from its own hook"
    - "Silent-refresh lock (D-43): read isLoading, ignore background-refresh flag"
    - "Conditional StatusBadge render: gated on cardState === 'ok' && radiationSeverity != null (D-15)"
    - "Universal severity colors on StatusBadge — no palette prop passed (D-16 lock)"
    - "Verbatim empty-state copy in plain div (not AlertCard) per D-25"
    - "Tab-level + per-card LastUpdated chips driven by hook dataUpdatedAt (Phase 3 carry-forward)"
    - "Phase 1 <section role='tabpanel'> wrapper preserved end-to-end"
key_files:
  created: []
  modified:
    - src/tabs/MoonTab.jsx
decisions:
  - "Kept inline number formatters (formatInt, formatOneDecimal, formatSignedInt, formatSignedOneDecimal) — extract to src/utils/formatters.js in Phase 5 polish alongside MarsTab refactor; deferring keeps this plan single-file"
  - "Did NOT extract LunarSection / SolarWindSection / DonkiSection sub-components — D-34 left this to discretion; MoonTab body is ~250 LOC and each section is ~50 LOC, well below the threshold where extraction helps clarity"
  - "StatusBadge rendered conditionally on swpcCardState === 'ok' && radiationSeverity != null — StatusBadge requires a real severity, so 'Risk: —' fallback would violate the prop contract; omitting during loading/error is the cleaner UX"
  - "swpc.dataUpdatedAt | 0 already returned by the hook; the guard `swpc.dataUpdatedAt ? new Date(...) : null` is the LastUpdated em-dash fallback carried forward from Phase 3 D-10"
  - "Used `donki.events.length === 0` (not `events?.length`) — useDonkiEvents always returns an array, never null/undefined, so the optional-chain would be dead code"
metrics:
  duration_minutes: 1.80
  tasks_completed: 1
  files_changed: 1
  commits: 1
  completed_date: "2026-05-21"
---

# Phase 04 Plan 03: Live MoonTab — Three Sub-Sections — Summary

Replaced the Phase 2 demo gallery body of `src/tabs/MoonTab.jsx` with three live, independently-sourced sub-sections (Lunar Context, Space Weather — Solar Wind, Solar Event Alerts) — landing the user-visible deliverable of Phase 4 and satisfying all 5 ROADMAP success criteria.

## What Was Built

`src/tabs/MoonTab.jsx` (MODIFIED — full body replacement, 207 insertions / 106 deletions)

The file now imports five Phase 2 primitives (DataCard, StatusBadge, AlertCard, LastUpdated, LoadingState), three Plan 04-02 hooks (useLunarPhase, useSolarWind, useDonkiEvents), and one Plan 04-01 utility (deriveRadiationRisk) — exactly the contract the plan's `<dont_use_phase_2_demo>` block specified.

### Section structure (as shipped)

**Tab header** (always visible across all states)
- `<h2>Moon — Conditions</h2>`
- `<p>Live space weather + computed lunar context</p>` (italic subtitle)
- No tab-level LastUpdated chip (three sources, three cadences — one chip would lie)

**Section 1 — Lunar Context** (`useLunarPhase`, pure computation)
- Heading + "Computed locally" subtitle (no LastUpdated chip per D-07)
- 4 DataCards in `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`:
  1. Phase Name (`tooltipKey="lunar.phase"`)
  2. Phase Percentage `%` (`tooltipKey="lunar.phase"`)
  3. Day/Night (`tooltipKey="lunar.dayNight"`)
  4. Estimated Surface Temp (visible face) `°C` (`tooltipKey="lunar.surfaceTemp"`)
- All four cards always in `state="ok"` (lunar computation cannot fail).

**Section 2 — Space Weather — Solar Wind** (`useSolarWind`, 5-min cadence)
- Heading row: `Space Weather — Solar Wind` + section-level `<LastUpdated palette="moon">` (flex justify-between)
- Conditional Radiation Risk `StatusBadge` (rendered only when `swpcCardState === 'ok'` AND `radiationSeverity != null`)
- 4 DataCards in `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`, each wrapped in `<div class="flex flex-col gap-2">` with a per-card LastUpdated:
  1. Solar Wind Speed `km/s` (integer)
  2. Solar Wind Density `p/cm³` (1 decimal)
  3. Bz `nT` (1 decimal with sign)
  4. Kp Index (no unit, 1 decimal)
- All four DataCards bound to `swpcCardState = swpc.isLoading ? 'loading' : swpc.isError ? 'error' : 'ok'`.

**Section 3 — Solar Event Alerts (last 7 days)** (`useDonkiEvents`, 15-min cadence)
- Heading row: `Solar Event Alerts (last 7 days)` + section-level `<LastUpdated palette="moon">`
- Four-branch body:
  - `donki.isLoading` → 3 stacked `<LoadingState />` skeletons in `h-14` containers
  - `donki.isError` → muted `Data temporarily unavailable` block
  - `donki.events.length === 0` → verbatim **"No significant events in the past 7 days — conditions are calm."** in a styled `div` (NOT an AlertCard — D-25)
  - Otherwise → `<div class="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">` scrollable list of `<AlertCard eventType={ev.type} timeUtc={ev.time} severity={ev.severity} tooltipKey={ev.tooltipKey} />`

## Counts (Component Census)

| Component | Count | Notes |
|---|---|---|
| `DataCard` | **8** | 4 Lunar Context + 4 Space Weather — matches Phase 3 MarsTab cadence |
| `StatusBadge` | **1** | Radiation Risk — conditionally rendered |
| `AlertCard` | **1 call site** | (Inside `.map()` — renders N cards at runtime, N = `donki.events.length`) |
| `LoadingState` | **3** | DONKI loading skeletons |
| `LastUpdated` | **6** | 1 section-2 header + 4 per-card SWPC + 1 section-3 header. None in Section 1 per D-07. |
| `palette="moon"` total occurrences | **14** | 8 DataCard + 6 LastUpdated = 14 (StatusBadge intentionally omits palette per D-16; AlertCard never accepts palette) |
| `palette="mars"` occurrences | **0** | Negative-grep enforced; no Mars-palette leak into Moon tab |

## Verbatim Copy Locks Confirmed

All locked strings present character-for-character:

- `Moon — Conditions` (h2)
- `Live space weather + computed lunar context` (subtitle)
- `Lunar Context` (Section 1 heading)
- `Computed locally` (Section 1 attribution)
- `Space Weather — Solar Wind` (Section 2 heading)
- `Solar Event Alerts (last 7 days)` (Section 3 heading)
- `Data temporarily unavailable` (DONKI error branch — same canonical string Phase 2 DataCard uses)
- `No significant events in the past 7 days — conditions are calm.` (DONKI empty-state — verbatim D-25, with em-dash U+2014)
- All 8 DataCard labels: `Phase Name`, `Phase Percentage`, `Day/Night`, `Estimated Surface Temp (visible face)`, `Solar Wind Speed`, `Solar Wind Density`, `Bz`, `Kp Index`
- StatusBadge label: `Radiation Risk`

## Tooltip-Key Bindings (all resolve in tooltips.js)

| Component | tooltipKey | Source attribution in tooltips.js |
|---|---|---|
| DataCard "Phase Name" | `lunar.phase` | Computed (lunar phase model) |
| DataCard "Phase Percentage" | `lunar.phase` (reused) | Computed (lunar phase model) |
| DataCard "Day/Night" | `lunar.dayNight` | Computed (lunar phase model) |
| DataCard "Estimated Surface Temp (visible face)" | `lunar.surfaceTemp` | Computed (lunar phase model) |
| DataCard "Solar Wind Speed" | `swpc.speed` | NOAA SWPC |
| DataCard "Solar Wind Density" | `swpc.density` | NOAA SWPC |
| DataCard "Bz" | `swpc.bz` | NOAA SWPC |
| DataCard "Kp Index" | `swpc.kp` | NOAA SWPC |
| StatusBadge "Radiation Risk" | `swpc.radiationRisk` | NOAA SWPC |
| AlertCard (dynamic) | `donki.cme` / `donki.flr` / `donki.gst` (assigned by `useDonkiEvents` mappers) | NASA DONKI |

## Silent-Refresh Lock Confirmation

Per D-43 / Phase 3 carry-forward: the literal string `isFetching` MUST NOT appear in `src/tabs/MoonTab.jsx`.

- `grep -c isFetching src/tabs/MoonTab.jsx` → **0** ✓
- Both `swpcCardState` and the DONKI branch read `.isLoading` only.
- The comment block paraphrases the concept as "the background-refresh flag" wherever it needs to be referenced — same pattern Phase 1 / 2 / 3 established for comment-grep collisions.

## Decisions Made

1. **Inline formatters retained** — Despite this plan being "the second tab that demonstrably needs these helpers," extracting now would require a separate touch on `MarsTab.jsx` (which already inlines identical helpers). The cleaner refactor lands in Phase 5 polish, where MarsTab + MoonTab can be normalized together. The four formatters in `MoonTab.jsx` (`formatInt`, `formatOneDecimal`, `formatSignedInt`, `formatSignedOneDecimal`) are documented inline as "kept inline per the prior Mars-tab carry-forward note."
2. **No sub-component extraction** — D-34 left this to discretion. MoonTab is ~250 LOC; each section is ~50 LOC. Extracting `LunarSection` / `SolarWindSection` / `DonkiSection` would add three new files without meaningful clarity gain. If Phase 5 introduces additional cross-tab reuse (e.g., a generic `Section` wrapper), revisit then.
3. **StatusBadge conditional render** — The plan's `<layout_spec>` was explicit: only render the badge when `swpcCardState === 'ok' && radiationSeverity != null`. The reasoning is that `StatusBadge` requires a valid severity prop (its `SEVERITY_CLASSES` falls back to a slate badge for unknown severities, but that would be a UX downgrade). Omitting the badge during loading/error is more honest than showing "Risk: —".
4. **Used `donki.events.length === 0` not `donki.events?.length`** — `useDonkiEvents` always returns an array (the `useMemo` in the hook initializes `merged = []`), never null or undefined. The optional-chain would be dead code.

## Deviations from Plan

**None.** Plan executed exactly as written:

- Single task, single commit, single file modified
- Every prop, every structural class, every verbatim string from the plan's `<layout_spec>` preserved character-for-character
- All 60+ grep contracts in the task's `<verify>` block + the end-of-plan `<verification>` block pass
- DataCard count = 8 (exact match), `palette="moon"` count = 14 (matches minimum)
- All negative-greps held: `isFetching`, `moon.example`, `TS_JUST_NOW` / `TS_3_MIN_AGO` / `TS_2_HR_AGO` / `TS_CME_DEMO`, `Primitive Demo Gallery`, `import.meta.env`, `palette="mars"` — none present
- `npm run build` exits 0

No authentication gates encountered. No Rule 1/2/3 auto-fixes triggered (the hooks and primitives delivered by Plans 04-01 and 04-02 had matching contracts; no surprises during composition).

## Comment-Grep Collisions

The negative-grep on `isFetching` triggered the comment-grep discipline carried forward from Phase 1/2/3. The doc-block at the top of `MoonTab` paraphrases the concept as "the background-refresh flag" instead of naming the TanStack Query field directly:

> "Background refetches stay silent: each section reads the first-mount loading flag (and ignores the background-refresh flag) so the 5-minute and 15-minute refetch ticks keep prior values rendered (D-43)."

No collisions on `import.meta.env` (the file imports nothing from `env.js` — env access lives in `useDonkiEvents`).
No collisions on `palette="mars"` (the file is unambiguously the Moon tab).
No collisions on `moon.example` or `Primitive Demo Gallery` (both were Phase 2 artifacts intentionally removed).

## Phase 4 Close-Out — ROADMAP Success Criteria

Phase 4's ROADMAP entry lists 5 success criteria. All 5 are now demonstrably satisfied:

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Lunar phase name + percentage + day/night + estimated surface temp | ✓ | Section 1: 4 DataCards bound to `useLunarPhase` outputs |
| 2 | Live SWPC speed/density/Bz/Kp + Low/Moderate/High radiation risk badge | ✓ | Section 2: 4 DataCards + conditional StatusBadge from `useSolarWind` + `deriveRadiationRisk` |
| 3 | Scrollable last-7-day DONKI events as AlertCards with type badge, UTC time, severity, tooltips | ✓ | Section 3: `<div class="...max-h-96 overflow-y-auto">` + AlertCard map over `useDonkiEvents().events` |
| 4 | Verbatim empty-state copy when no events | ✓ | Section 3 empty branch: literal "No significant events in the past 7 days — conditions are calm." string present |
| 5 | Each section refreshes at its own cadence without blanking the UI | ✓ | Per-section independent `cardState` (D-41) + silent-refresh lock (D-43) — `isFetching` not referenced |

Requirements satisfied this plan (12): LUNAR-02, LUNAR-03, LUNAR-04, SWPC-02, SWPC-03, SWPC-04, SWPC-05, SWPC-06, DONKI-02, DONKI-03, DONKI-04, DONKI-05. Combined with Plan 04-01 (LUNAR-05, SWPC-07) and Plan 04-02 (LUNAR-01, SWPC-01, DONKI-01), all 17 Phase 4 requirements are now complete.

## Carry-Forward for Phase 5 (Reliability & UX Polish)

1. **Formatters extraction now justified** — `MarsTab.jsx` and `MoonTab.jsx` both inline the same `formatInt` / `formatOneDecimal` helpers, plus MoonTab adds two signed variants (`formatSignedInt`, `formatSignedOneDecimal`). Phase 5 should extract to `src/utils/formatters.js` and refactor both tabs together. The footnote inside each tab's formatter block already calls this out.
2. **Reliability gaps observed during composition (none blocking)** — all three hooks expose a uniform `{ isLoading, isError, dataUpdatedAt }` surface; cardState propagation is mechanical; the per-section `<LastUpdated palette="moon" />` chips already handle pre-fetch null guards. Phase 5 has a clean baseline.
3. **DONKI empty-state vs. error state distinction** — Phase 5 should preserve the structural difference: empty state uses muted moon-50 palette + italic; error state uses neutral slate + same italic. The two are different signals and shouldn't be conflated.
4. **Sub-component extraction deferred** — `LunarSection` / `SolarWindSection` / `DonkiSection` could be lifted in Phase 5 alongside the formatters extraction if cross-tab consistency demands it. Currently not blocking.
5. **AlertCard scroll affordance** — the scrollable container uses `max-h-96 overflow-y-auto pr-2` (Tailwind). On a quiet space-weather week, the container will be empty/short and the scrollbar won't appear; on a busy week, the user gets a clean vertical scroll. Phase 5 may want to add a fade-out gradient at the bottom edge for affordance.
6. **Tab-level vs section-level LastUpdated decision** — MoonTab does NOT have a tab-level LastUpdated chip (three sources, three cadences). MarsTab does have one (one source). Phase 5 should preserve this asymmetry; it's intentional and matches each tab's data-source cardinality.

## Self-Check: PASSED

- `src/tabs/MoonTab.jsx` exists ✓ (committed at `65ae45d`)
- Commit `65ae45d` present in `git log --oneline` ✓
- All 40+ automated grep assertions in plan's `<verify><automated>` block pass ✓
- DataCard count == 8 ✓
- `palette="moon"` count == 14 (≥14 required) ✓
- All 7 negative-greps hold (isFetching, moon.example, TS_*, Primitive Demo Gallery, import.meta.env, palette="mars") ✓
- `npm run build` exits 0 ✓
- End-of-plan verification block (15+ assertions) passes ✓
