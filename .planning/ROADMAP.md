# Roadmap: Planetary Conditions

## Overview

A cinematic dashboard surfacing real-time Mars and Moon environmental data from NASA and NOAA. The build progresses foundation-first: scaffold the Vite/React/Tailwind/TanStack Query app shell, then land the shared UI primitives every data card depends on, then ship the Mars tab as a self-contained vertical slice, then assemble the three-section Moon tab in parallel, then sweep loading/error/freshness states across the whole app, and finally deploy to Vercel with the NASA API key wired in and CORS verified end-to-end.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Scaffold & Shell** — Vite/React/Tailwind/Query app boots with two-tab dark UI and env vars wired
- [x] **Phase 2: Shared UI Primitives** — Reusable DataCard/TooltipWrapper/StatusBadge/AlertCard/LastUpdated/LoadingState ready for data tabs
- [x] **Phase 3: Mars Tab — Surface Data** — Mars tab shows live MAAS2/Curiosity REMS data with tooltips and timestamps
- [x] **Phase 4: Moon Tab — Three Sub-Sections** — Moon tab shows lunar context, NOAA solar wind, and NASA DONKI alerts end-to-end
- [ ] **Phase 5: Reliability & UX Polish** — Every panel has loading/error/freshness states; no blank panels, no full-page failures
- [ ] **Phase 6: Vercel Deployment** — App ships on Vercel with VITE_NASA_API_KEY and CORS verified from production origin

## Phase Details

### Phase 1: Scaffold & Shell
**Goal**: A user can open the app and switch between Mars and Moon tabs in a dark, cinematic shell — even before any data is wired up.
**Depends on**: Nothing (first phase)
**Requirements**: SCAF-01, SCAF-02, SCAF-03, SCAF-04, SCAF-05, SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05
**Success Criteria** (what must be TRUE):
  1. User can run the dev server and load the app at localhost with no console errors.
  2. User sees a dark cinematic shell with a subtle star-field background and a clean technical sans-serif typeface.
  3. User can click between two prominent tabs (Mars / Moon) and the active tab is visually distinct using each body's palette (amber/rust vs blue/silver).
  4. User on desktop sees the intended layout; user on a narrow viewport sees a non-broken single-column fallback.
  5. User's NASA API key is read from `VITE_NASA_API_KEY` (defaulting to `DEMO_KEY`) without ever being hardcoded, and `.env` is gitignored.
**Plans**: 2 plans
- [x] 01-01-scaffold-PLAN.md — Vite + React + Tailwind + TanStack Query scaffold; env-var accessor; .gitignore (SCAF-01..05)
- [x] 01-02-shell-PLAN.md — Two-tab dark shell with star-field, Inter typography, palette-aware TabBar, responsive baseline (SHELL-01..05)
**UI hint**: yes

### Phase 2: Shared UI Primitives
**Goal**: A developer (and by extension every later data card) can render a labeled value with a unit, a hover tooltip, a freshness timestamp, a status badge, an event alert card, and per-card loading/error states — all from a shared component library.
**Depends on**: Phase 1
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07
**Success Criteria** (what must be TRUE):
  1. User hovering any data value sees a plain-language tooltip with an Earth comparison where relevant.
  2. User sees a "Last updated X mins ago" timestamp on every panel where a `LastUpdated` instance is mounted.
  3. User sees independent per-card skeleton loaders — a slow component never blanks neighbouring cards.
  4. User sees colored status badges (e.g., Low/Moderate/High) and alert cards (event-type badge, UTC time, severity) rendered consistently with the body's palette.
  5. All tooltip copy lives in `constants/tooltips.js` and updating it there updates the UI everywhere.
**Plans**: 3 plans
- [x] 02-01-foundation-primitives-PLAN.md — TooltipWrapper, LoadingState, useNow hook, tooltips.js source-of-truth (UI-02, UI-06, UI-07)
- [x] 02-02-composite-primitives-PLAN.md — DataCard, StatusBadge, AlertCard, LastUpdated (UI-01, UI-03, UI-04, UI-05)
- [x] 02-03-demo-galleries-PLAN.md — MarsTab and MoonTab demo galleries rendering every primitive in every state
**UI hint**: yes

### Phase 3: Mars Tab — Surface Data
**Goal**: A user can open the Mars tab and see live Curiosity REMS conditions for the latest sol with units, tooltips, source attribution, and per-card freshness.
**Depends on**: Phase 2
**Requirements**: MARS-01, MARS-02, MARS-03, MARS-04, MARS-05, MARS-06, MARS-07, MARS-08, MARS-09, MARS-10, MARS-11
**Success Criteria** (what must be TRUE):
  1. User opening the Mars tab sees real MAAS2 data for the latest sol — sol number, Earth date, min/max temperature, pressure, wind speed, humidity, and atmospheric opacity — each with its unit.
  2. User hovering any Mars value sees an Earth-anchored plain-language tooltip (e.g., pressure compared to Earth's ~0.6%, why wind feels gentle, what dust opacity means).
  3. User sees "From Curiosity Rover / REMS instrument" source attribution visible on the tab.
  4. User sees per-card last-updated timestamps and a graceful "Data temporarily unavailable" message if MAAS2 fails — the tab never goes fully blank.
  5. User's Mars tab refreshes silently in the background on a 1-hour cadence without blanking the UI.
**Plans**: 2 plans
- [x] 03-01-PLAN.md — useMarsData TanStack Query hook (MAAS2 + Content-Type quirk + 1h cadence) + mars.* tooltip copy in tooltips.js (MARS-01)
- [x] 03-02-PLAN.md — Live MarsTab.jsx: 8 DataCards bound to MAAS2 fields, source attribution, tab-level + per-card LastUpdated, shared loading/error state (MARS-02..11)
**UI hint**: yes

### Phase 4: Moon Tab — Three Sub-Sections
**Goal**: A user can open the Moon tab and see three coherent sections — current lunar context (phase + modeled temperature), live NOAA solar wind with a derived radiation risk badge, and recent NASA DONKI solar event alerts.
**Depends on**: Phase 2
**Requirements**: LUNAR-01, LUNAR-02, LUNAR-03, LUNAR-04, LUNAR-05, SWPC-01, SWPC-02, SWPC-03, SWPC-04, SWPC-05, SWPC-06, SWPC-07, DONKI-01, DONKI-02, DONKI-03, DONKI-04, DONKI-05
**Success Criteria** (what must be TRUE):
  1. User opening the Moon tab sees the current lunar phase name, phase percentage, day/night indicator, and a clearly-labeled estimated surface temperature interpolated from phase position.
  2. User sees live NOAA SWPC solar wind speed, density, Bz, and Kp index — each with units — plus a derived Low/Moderate/High radiation risk badge with an explanation tooltip.
  3. User sees a scrollable list of last-7-days DONKI events (CME / Flare / GST) rendered as alert cards with type badge, UTC time, severity/class, and tooltips on what each means for lunar surface radiation.
  4. User who opens the Moon tab during a quiet space-weather week sees "No significant events in the past 7 days — conditions are calm." instead of an empty panel.
  5. User's Moon tab refreshes each section on its own cadence (SWPC every 5 min, DONKI every 15 min, lunar phase static) without blanking the UI.
**Plans**: 3 plans
- [x] 04-01-PLAN.md — Pure utilities + tooltip copy: src/utils/lunarPhase.js, src/utils/radiationRisk.js, 11-key extension to tooltips.js (LUNAR-05, SWPC-07)
- [x] 04-02-PLAN.md — Three data hooks: useLunarPhase (pure math), useSolarWind (3 NOAA endpoints @ 5min), useDonkiEvents (3 NASA DONKI endpoints @ 15min) (LUNAR-01, SWPC-01, DONKI-01)
- [x] 04-03-PLAN.md — Live MoonTab.jsx: three independently-sourced sections (Lunar Context, Space Weather, Solar Event Alerts) with per-section cardState, scrollable AlertCard list, verbatim empty-state copy (LUNAR-02..04, SWPC-02..06, DONKI-02..05)
**UI hint**: yes

### Phase 5: Reliability & UX Polish
**Goal**: A user trusts the dashboard — every panel meaningfully communicates loading, error, no-data, units, and freshness, and a single slow or failing API never breaks the whole experience.
**Depends on**: Phase 4
**Requirements**: REL-01, REL-02, REL-03, REL-04, REL-05
**Success Criteria** (what must be TRUE):
  1. User looking at any panel sees a meaningful state — loading skeleton, error message, no-data context, or real data — never a blank panel and never a full-page failure.
  2. User sees units on every numerical value (°C, Pa, km/s, nT, p/cm³, %) — never a bare number.
  3. User hovering Mars or Moon values gets Earth-anchored comparisons in tooltips wherever it aids understanding.
  4. User sees a freshness signal ("Last updated X minutes ago") on every data panel that fetches from an upstream source.
  5. User watching a panel during a background refetch sees existing data stay on screen (stale-while-revalidate) — the UI never blanks mid-refresh.
**Plans**: 3 plans
- [x] 05-01-PLAN.md — Centralize number formatters in src/utils/formatters.js; refactor MarsTab/MoonTab to import; fix useMarsData "nine"→"eight" doc + useDonkiEvents eslint-disable rationale comment (REL-02)
- [x] 05-02-PLAN.md — TooltipWrapper touch tap-to-toggle (module-level IS_TOUCH) + scroll/resize follow (rAF) + narrow-viewport clamp + Math.max(0,...) guard; AlertCard info-icon role="button" + tabIndex={0} removal (REL-03)
- [ ] 05-03-PLAN.md — Thread TanStack v5 AbortSignal through useMarsData/useSolarWind/useDonkiEvents; MoonTab DONKI list keyboard a11y (tabIndex/role/aria-label) + AlertCard key namespacing; Phase 5 audit checklist in SUMMARY.md (REL-01, REL-04, REL-05)
**UI hint**: yes

### Phase 6: Vercel Deployment
**Goal**: A user can visit the production Vercel URL and see the same live, end-to-end experience that runs locally — with the NASA API key configured server-side in Vercel and CORS verified from the deployed origin.
**Depends on**: Phase 5
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04
**Success Criteria** (what must be TRUE):
  1. User pushing to `main` triggers a Vercel auto-deploy that completes successfully.
  2. User visiting the production URL sees both Mars and Moon tabs rendering live data — MAAS2, NOAA SWPC, and NASA DONKI all return successfully from the deployed origin (CORS verified).
  3. User's NASA DONKI calls use the `VITE_NASA_API_KEY` set in the Vercel dashboard, not `DEMO_KEY`.
  4. User on a production preview deploy sees the same end-to-end experience as local development.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold & Shell | 2/2 | Complete    | 2026-05-14 |
| 2. Shared UI Primitives | 3/3 | Complete    | 2026-05-19 |
| 3. Mars Tab — Surface Data | 2/2 | Complete    | 2026-05-19 |
| 4. Moon Tab — Three Sub-Sections | 3/3 | Complete    | 2026-05-21 |
| 5. Reliability & UX Polish | 2/3 | In progress | - |
| 6. Vercel Deployment | 0/TBD | Not started | - |
