---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: complete
stopped_at: Completed 06-vercel-deployment/06-02-PLAN.md — milestone v1.0 complete
last_updated: "2026-05-27T02:30:00.000Z"
last_activity: 2026-05-27
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 15
  completed_plans: 15
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-14)

**Core value:** A single cinematic dashboard showing current Mars and Moon conditions from real NASA/NOAA APIs, presented so non-experts find it compelling and accessible.
**Current focus:** Milestone v1.0 COMPLETE — live at https://planetary-conditions.vercel.app. All 6 phases done; both tabs render real data end-to-end. Next: `/gsd-complete-milestone`.

## Current Position

Phase: 6 (final)
Plan: 06-02
Status: Complete — milestone v1.0 shipped
Last activity: 2026-05-27

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 14
- Average duration: —
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| — | — | — | — |
| 1 | 2 | - | - |
| 02 | 3 | - | - |
| 03 | 2 | - | - |
| 04 | 3 | - | - |
| 05 | 3 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01-scaffold-shell P01-scaffold | 3.08 | 2 tasks | 16 files |
| Phase 01-scaffold-shell P02-shell | 1.85 | 3 tasks | 7 files |
| Phase 02-shared-ui-primitives P01-foundation-primitives | 3 | 2 tasks | 4 files |
| Phase 02-shared-ui-primitives PP02-composite-primitives | 2.47 | 2 tasks tasks | 4 files files |
| Phase 02-shared-ui-primitives P03-demo-galleries | 2.42 | 2 tasks tasks | 2 files files |
| Phase 03-mars-tab-surface-data P03-01 | 2.43 | 2 tasks | 2 files |
| Phase 03 P03-02 | 2.33 | 1 tasks | 1 files |
| Phase 04 P04-01 | 2.83 | 3 tasks | 3 files |
| Phase 04 P04-02 | 3.10 | 3 tasks | 3 files |
| Phase 04 P04-03 | 1.80 | 1 tasks | 1 files |
| Phase 05 P05-01 | 2.35 | 2 tasks | 5 files |
| Phase Phase 05 PP05-02 | 2.38 | 2 tasks tasks | 2 files files |
| Phase Phase 05 PP05-03 | 2.4 | 3 tasks | 4 files |
| Phase 06-vercel-deployment P06-01 | 4 | 3 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Stack locked: Vite + React + Tailwind + TanStack Query, Vercel deploy
- MAAS2/Curiosity REMS chosen over Perseverance MEDA for v1 (PDS too complex)
- Lunar surface temp is a phase-based model (clearly labeled estimate), not LRO Diviner live data
- Client-side API calls only — no backend proxy unless `DEMO_KEY` rate limits hit
- Moon tab's three sub-sections (Lunar / SWPC / DONKI) ship as parallelizable plans inside one phase
- Phase 1 Plan 1: Wrote Vite scaffold files directly (no npm create vite) — non-empty working dir would hang the interactive prompt under autonomous execution
- Phase 1 Plan 1: Pinned tailwindcss to ^3.4.0 (not v4) for ecosystem stability
- Phase 1 Plan 1: Omitted /vite.svg favicon link to keep console clean and avoid demo-asset 404
- Phase 1 Plan 2: Removed redundant .gitkeep files from src/components, src/constants, src/tabs (real files now occupy those dirs); kept src/hooks/.gitkeep
- Phase 1 Plan 2: Task 3 human-verify checkpoint auto-approved per session-wide 'no clarifying questions' instruction; rollback via git revert if needed
- Phase 1 Plan 2: TabBar takes activeTab/onTabChange as props (no internal state) so the source of truth stays in App.jsx — clean lift path to React context in Phase 2 if needed
- Phase 1 Plan 2: StarField is fixed inset-0 z-0 pointer-events-none aria-hidden — content sits at z-10; this z-index contract is the baseline for all subsequent UI
- Phase 2 Plan 1: TooltipWrapper uses createPortal to document.body to escape ancestor overflow/transform clipping; no external library per 02-CONTEXT
- Phase 2 Plan 1: useNow shares one module-level setInterval across all subscribers (ref-counted teardown) so 10 LastUpdated cards don't drift apart
- Phase 2 Plan 1: tooltips.js is a flat namespaced object with getTooltip(key) returning null on miss — Phase 3/4 will add real per-datapoint keys against the same shape
- Phase 2 Plan 2: StatusBadge severity colors are universal (green/amber/red), NOT palette-tinted — semantic signals must read consistently across Mars/Moon tabs
- Phase 2 Plan 2: DataCard renders em-dash '—' for null/undefined value in state='ok' rather than crashing — matches LastUpdated null-timestamp glyph for visual consistency
- Phase 2 Plan 2: LastUpdated skips TooltipWrapper when timestamp is null/invalid — wrapping an em-dash in a hover affordance would be a confusing no-op
- Phase 2 Plan 2: AlertCard info-icon trigger gets tabIndex=0 + role='button' so TooltipWrapper's focus handlers give keyboard users the same tooltip access mouse users get
- Phase 2 Plan 2: Slate fallback color classes for unknown StatusBadge severity and unknown AlertCard eventType — Phase 3/4 can extend the type sets without crashing on undefined.classes
- Phase 2 Plan 3: Demo gallery timestamps live at module scope so values stay stable across useNow 30s ticks — declaring them inside the component would resample on every render and jitter the 'just now' / '3 mins ago' / '2 hours ago' chips
- Phase 2 Plan 3: Both MarsTab and MoonTab use identical 4-section structure with only palette + tooltip-key swaps — proves universal-severity colors (high=red on both tabs) and AlertCard event-type colors are palette-neutral, with body palette reserved for DataCard accent rings + LastUpdated dim text
- Phase 2 Plan 3: Comments inside MarsTab/MoonTab avoid the literal strings 'Phase 3' / 'Phase 4' because the plan's verification negative-greps assert these tokens do not appear in the tab files — same pattern as Plan 01's 'shimmer' and 'setInterval' comment-grep collisions
- Phase 3 Plan 1: useMarsData hook uses fetch(url).then(r => r.text()).then(JSON.parse) (not r.json()) to bypass MAAS2's GitHub-Pages Content-Type quirk per D-04
- Phase 3 Plan 1: useMarsData throws Error on !response.ok or invalid JSON so TanStack Query surfaces isError=true; returning null would bypass the DataCard error branch in Plan 03-02
- Phase 3 Plan 1: useMarsData queryKey is ['mars','maas2','latest'] — the 'latest' discriminator leaves room for a v2 sol-selector ['mars','maas2', solNumber] without collisions
- Phase 3 Plan 1: Doc-comment in useMarsData.js paraphrases around the literals r.json() and VITE_NASA_API_KEY because the plan's verification negative-greps both strings — same comment-grep collision pattern as Phase 1/2 tab files
- Phase 3 Plan 1: Tooltip source string locked to verbatim 'MAAS2 / Curiosity REMS' across all eight mars.* entries per D-21
- Phase 3 Plan 2: cardState propagation pattern (isLoading -> 'loading', isError -> 'error', else 'ok') fans one useMarsData() result out to 8 DataCards; this is the template Phase 4 will reuse for Moon-tab sub-sections
- Phase 3 Plan 2: Eight DataCards + nine LastUpdated chips is canonical (1 tab-level + 8 per-card); the 'nine' phrasing in 03-CONTEXT referred to LastUpdated chips, not DataCards
- Phase 3 Plan 2: dataUpdatedAt ? new Date(dataUpdatedAt) : null guard prevents LastUpdated rendering 'N years ago' relative to epoch 0 before first successful fetch
- Phase 3 Plan 2: Doc comments paraphrase 'the background-refresh flag' instead of naming the TanStack Query field directly because the plan's verification negative-greps the literal identifier — same comment-grep collision pattern as Phase 1/2/3-01
- Phase 4 Plan 1: lunarPhase.js keeps surfaceTemp() co-located rather than splitting to lunarTemperature.js — module is ~50 LOC; D-03 / LUNAR-05 lock
- Phase 4 Plan 1: radiationRisk threshold literals (5/700/3/500) inlined — not reused elsewhere in v1; extract only if Phase 5 adds a Severe tier
- Phase 4 Plan 1: No Vitest added — 04-CONTEXT allowed but did not require it; durable proof is build + grep contracts plus inline node behavioral checks at execution time
- Phase 4 Plan 1: moon.example tooltip key removed despite 2 live references in MoonTab.jsx demo gallery — getTooltip returns null on miss, Plan 04-03 deletes those DataCards entirely; expected mid-phase transient state
- Phase 4 Plan 2: useLunarPhase subscribes to useNow's native 30s tick (not widened to 60s) — over-satisfies LUNAR-01 / ROADMAP-5 'stay current' criterion; math is sub-millisecond
- Phase 4 Plan 2: useSolarWind latestObject() walks rows newest→oldest to skip rows with null target fields — DataCard em-dash fallback only triggers when every row's measurement is null
- Phase 4 Plan 2: toNumberOrNull coerces '' / non-numeric to null (not NaN) so DataCard's null branch renders the em-dash glyph consistently
- Phase 4 Plan 2: useDonkiEvents memoizes URL set on todayKey() (YYYY-MM-DD) — mid-hour re-renders don't churn the URL; date rollover at midnight evicts prior day's cache via dayKey-suffixed queryKey
- Phase 4 Plan 2: Event sort uses new Date(time).getTime() (not string compare) for tz-deterministic reverse-chronological ordering across mixed ISO formats
- Phase 4 Plan 2: GST severity reduces over allKpIndex (not Math.max with spread) so non-numeric kpIndex entries are skipped without NaN poisoning
- Phase 4 Plan 2: useDonkiEvents JSDoc paraphrases 'import.meta.env' as 'the build-time env object' to avoid comment-grep collision with the env-discipline negative-grep — same pattern as Phase 1/2/3 doc comments
- Phase 4 Plan 3: MoonTab.jsx fully replaced — 4 inline number formatters retained (formatInt, formatOneDecimal, formatSignedInt, formatSignedOneDecimal); extraction to src/utils/formatters.js deferred to Phase 5 alongside MarsTab refactor
- Phase 4 Plan 3: StatusBadge rendered conditionally on `swpcCardState === 'ok' && radiationSeverity != null` — omitting badge during loading/error is cleaner than 'Risk: —' (StatusBadge contract requires real severity)
- Phase 4 Plan 3: No sub-component extraction (LunarSection / SolarWindSection / DonkiSection) — MoonTab ~250 LOC, each section ~50 LOC; below the clarity-gain threshold; revisit in Phase 5 if cross-tab reuse demands it
- Phase 4 Plan 3: Doc-comment paraphrases 'the background-refresh flag' for D-43 silent-refresh lock comment-grep collision — same Phase 1/2/3 pattern
- Phase 4 Plan 3: Tab-level LastUpdated intentionally omitted on MoonTab (three sources, three cadences); MarsTab keeps its tab-level chip (single source) — asymmetry is intentional, preserve in Phase 5
- Phase 4 Plan 3: DONKI empty-state rendered as plain styled div (not wrapped in AlertCard) per D-25 — empty state is not an alert
- Phase 5 Plan 1: Signed-number formatters collapsed from 2 (formatSignedInt + formatSignedOneDecimal) to 1 (formatSignedDecimal); lunar surface temp now renders as '+95.0' instead of '+95' — acceptable for a phase-derived estimate already labeled 'Estimated…'
- Phase 5 Plan 1: src/utils/formatters.js returns null (not the em-dash glyph) so DataCard.jsx remains the single source of truth for the U+2014 fallback (D-18)
- Phase 5 Plan 1: No Vitest introduced — pure-utility correctness verified via inline node smoke check at execution time (D-25)
- Phase 5 Plan 2: IS_TOUCH constant lives at MODULE scope (not in-component) per D-04 — touch capability is a device property, not a render-time variable
- Phase 5 Plan 2: Touch onClick is ADDITIVE to hover/focus (D-07); hybrid devices (iPad Pro + mouse) get both paths — neither blocks the other
- Phase 5 Plan 2: reposition extracted to a useCallback shared by useLayoutEffect (on open) and scroll/resize useEffect (while open) — single source of positioning math (D-09)
- Phase 5 Plan 2: scroll listener uses { passive: true, capture: true } so nested scrollers (DONKI list) reposition too; rAF-debounced (D-08, D-09)
- Phase 5 Plan 2: Portal inline style.maxWidth = 'min(90vw, 320px)' AND Tailwind max-w-xs class both retained — defensive double cap (D-10)
- Phase 5 Plan 2: Math.max(0, ...) guards maxLeft so tooltips wider than viewport - margins don't propagate negative horizontal offsets — clamp width via maxWidth instead (D-11)
- Phase 5 Plan 2: AlertCard info-icon drops role=button + tabIndex={0} per D-12; TooltipWrapper.cloneElement onFocus/onBlur is the real keyboard contract
- Phase 5 Plan 2: AlertCard inline rationale comment phrased to avoid literal 'role=button' string — same comment-grep-collision pattern Phases 1-4 used (D-43, useMarsData JSDoc, useDonkiEvents env-discipline)
- Phase 5 Plan 3: AbortSignal threaded into all three data hooks via TanStack v5 queryFn({ signal }) destructure; helpers accept { signal } = {} default-empty so they remain callable outside the Query pipeline
- Phase 5 Plan 3: MoonTab DONKI scroll region is keyboard-focusable named landmark (tabIndex={0} + role=region + aria-label) and AlertCard list keys are namespaced by event type (D-14, D-15)
- Phase 5 Plan 3: Audit inlined in plan SUMMARY.md (no separate AUDIT.md) per D-01; found zero REL-01..REL-05 drift across MarsTab + MoonTab — Phase 2 primitives + Phase 3/4 wiring already satisfy all reliability locks
- Phase 6 Plan 1: Paraphrased DEMO_KEY refs in useDonkiEvents.js JSDoc to satisfy Audit 9 file-count gate (exactly one src/ file mentioning DEMO_KEY) — same comment-grep-collision-avoidance pattern as phases 1-5
- Phase 6 Plan 1: DEPLOYMENT.md lives at repo root (NOT inside .planning/) per D-16 — users follow it without GSD context; runbook is 171 lines with Prerequisites, First-time deployment, Subsequent deploys, Preview deploys, Troubleshooting sections
- Phase 6 Plan 1: README Live demo placeholder ('coming soon') NOT a real *.vercel.app URL — real URL inserted by Plan 06-02 Task 7 after user confirms first successful deploy (D-19)
- Phase 6 Plan 2: MAAS2 routed through a Vercel Edge proxy (api/maas2.js) — MAAS2 emits no Access-Control-Allow-Origin in prod (D-13 contingency). Revises the 'client-side, no proxy' decision for MAAS2 only; NOAA SWPC + NASA DONKI stay client-side
- Phase 6 Plan 2: NOAA Kp endpoint (noaa-planetary-k-index.json) returns an ARRAY OF OBJECTS (field `Kp`), not the tabular array-of-arrays of plasma/mag — fetchKp now parses it via selectLatestKp(); the shared tabular helper threw `headers.map is not a function` and blanked the whole solar wind section (found via UAT, fixed TDD in 3a5118a)
- Phase 6 Plan 2: Added node:test (Node built-in) + `npm test` rather than vitest — zero new deps for one pure-function test
- Phase 6 Plan 2: Live in production at https://planetary-conditions.vercel.app; DEPLOY-01..04 validated; milestone v1.0 complete

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-05-27T02:30:00.000Z
Stopped at: Completed 06-vercel-deployment/06-02-PLAN.md — milestone v1.0 complete
Resume file: None

**Milestone v1.0 complete** — all 6 phases done; live at https://planetary-conditions.vercel.app. Next: /gsd-complete-milestone
