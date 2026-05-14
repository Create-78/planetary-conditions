# Requirements

Source: `Discussion.md` (May 2026) + `PROJECT.md`.

REQ-ID format: `[CATEGORY]-[NUMBER]`.

---

## v1 Requirements

### Project Scaffold (SCAF)

- [ ] **SCAF-01**: Vite + React project initialized with the recommended structure (App.jsx, components/, tabs/, hooks/, utils/, constants/)
- [ ] **SCAF-02**: Tailwind CSS configured with dark theme as default and body-specific color tokens (amber/rust palette for Mars, blue/silver palette for Moon)
- [ ] **SCAF-03**: TanStack Query (React Query) installed and `QueryClientProvider` wraps the app
- [ ] **SCAF-04**: `VITE_NASA_API_KEY` env var wired (reads from `.env`, defaults to `DEMO_KEY` if unset); never hardcoded
- [ ] **SCAF-05**: Repo initialized on GitHub with `.gitignore` excluding `.env` and `node_modules`

### Shell & Navigation (SHELL)

- [ ] **SHELL-01**: Two-tab top-level navigation (Mars / Moon) with prominent visual styling matched to each body's palette
- [ ] **SHELL-02**: Active tab is visually distinct; switching tabs is instant (state-only, no route reload)
- [ ] **SHELL-03**: Subtle star-field background texture applied behind both tabs
- [ ] **SHELL-04**: Typography uses a clean technical sans-serif (Space Grotesk, Inter, or Geist)
- [ ] **SHELL-05**: Layout is desktop-first; mobile renders without breaking (basic responsive baseline, single-column fallback)

### Reusable Data UI (UI)

- [ ] **UI-01**: `DataCard` component renders label, value, unit, and tooltip trigger; supports loading skeleton and error state per card
- [ ] **UI-02**: `TooltipWrapper` shows a plain-language explainer on hover with an Earth comparison where relevant
- [ ] **UI-03**: `StatusBadge` renders a colored badge (e.g., Radiation Risk: Low/Moderate/High) with body-appropriate palette
- [ ] **UI-04**: `AlertCard` renders a DONKI solar event with type badge, UTC time, severity/class, and tooltip
- [ ] **UI-05**: `LastUpdated` component shows "Last updated X mins ago" (or UTC timestamp) per data panel
- [ ] **UI-06**: `LoadingState` skeleton loaders render independently per card — one slow API never blocks a whole tab
- [ ] **UI-07**: Tooltip copy lives in a single `constants/tooltips.js` source-of-truth file

### Mars Tab — Surface Data (MARS)

Data source: MAAS2 API (`https://api.maas2.apollorion.com/`), no auth required, refetch every 1 hour. Parse as JSON regardless of Content-Type header.

- [ ] **MARS-01**: `useMarsData` React Query hook fetches latest sol from MAAS2 with `refetchInterval: 1h`
- [ ] **MARS-02**: Display Sol number (Martian day) with tooltip explaining sol length (~24h 37min)
- [ ] **MARS-03**: Display Earth date (`terrestrial_date`) corresponding to the sol
- [ ] **MARS-04**: Display Min Temperature in °C with tooltip anchoring against Mars overnight lows
- [ ] **MARS-05**: Display Max Temperature in °C with tooltip anchoring against daytime highs
- [ ] **MARS-06**: Display Atmospheric Pressure in Pa with tooltip comparing to Earth (~0.6%)
- [ ] **MARS-07**: Display Wind Speed in m/s with tooltip explaining why high speeds feel gentle on Mars
- [ ] **MARS-08**: Display Humidity (%) with tooltip explaining dryness and water-ice context
- [ ] **MARS-09**: Display Atmospheric Opacity (categorical, e.g., "Sunny" / "Dusty") with tooltip on dust storms
- [ ] **MARS-10**: Source attribution: "From Curiosity Rover / REMS instrument" visible on the tab
- [ ] **MARS-11**: Every data card shows per-card last-updated timestamp and a graceful "Data temporarily unavailable" error state

### Moon Tab — Lunar Context (LUNAR)

No API required — computed via `astronomia` or manual Julian Date math.

- [ ] **LUNAR-01**: `useLunarPhase` pure-computation hook returns current phase name, phase percentage, and day/night indicator
- [ ] **LUNAR-02**: Display current lunar phase name (New Moon, Waxing Crescent, etc.) with tooltip explaining the ~29.5-day cycle
- [ ] **LUNAR-03**: Display approximate surface temperature (daytime face ~+127°C, nightside ~-173°C) interpolated by phase position
- [ ] **LUNAR-04**: Temperature is clearly labeled as estimate ("Estimated surface temp") with tooltip on lunar temperature swing
- [ ] **LUNAR-05**: `utils/lunarPhase.js` and `utils/lunarTemperature.js` (or co-located) encapsulate the math

### Moon Tab — Space Weather (SWPC)

Data source: NOAA SWPC (no auth, public). Refetch every 5 min.

- [ ] **SWPC-01**: `useSolarWind` React Query hook fetches plasma (`plasma-2-hour.json`), mag-field (`mag-2-hour.json`), and Kp (`noaa-planetary-k-index.json`) with `refetchInterval: 5min`
- [ ] **SWPC-02**: Display Solar Wind Speed in km/s with tooltip on typical 400–800 km/s range and lunar surface impact
- [ ] **SWPC-03**: Display Solar Wind Density in p/cm³ with tooltip on surface interaction
- [ ] **SWPC-04**: Display Bz (IMF south component) in nT with tooltip on geomagnetic storm trigger
- [ ] **SWPC-05**: Display Kp Index on 0–9 scale with tooltip on Kp ≥ 5 = storm conditions
- [ ] **SWPC-06**: Display a derived Radiation Risk badge (Low / Moderate / High) computed from solar wind speed + Kp index, with explanation tooltip
- [ ] **SWPC-07**: `utils/radiationRisk.js` encapsulates the derivation logic with test-friendly pure function

### Moon Tab — Solar Event Alerts (DONKI)

Data source: NASA DONKI (CME, FLR, GST endpoints). Requires `VITE_NASA_API_KEY`. Refetch every 15 min. Last 7 days of events.

- [ ] **DONKI-01**: `useDonkiEvents` React Query hook fetches CME, Flare, and GST events from the last 7 days with `refetchInterval: 15min`
- [ ] **DONKI-02**: Display events as a scrollable list of `AlertCard`s with event-type badge, UTC time, and severity/class
- [ ] **DONKI-03**: Tooltips on each card explain what the event type means for lunar surface radiation
- [ ] **DONKI-04**: Empty state shows "No significant events in the past 7 days — conditions are calm." (never a bare empty panel)
- [ ] **DONKI-05**: Failure state shows "Data temporarily unavailable" per card without crashing the whole panel

### Reliability & UX Polish (REL)

- [ ] **REL-01**: Every data panel surfaces loading, error, and no-data states meaningfully (no blank panels, no full-page failures)
- [ ] **REL-02**: All numerical values display with units (°C, Pa, km/s, nT, p/cm³, %) — never bare numbers
- [ ] **REL-03**: Tooltips anchor Mars/Moon values to Earth equivalents wherever it aids understanding
- [ ] **REL-04**: Per-source timestamps visibly communicate freshness ("Last updated X minutes ago")
- [ ] **REL-05**: Stale-while-revalidate is the default — UI never blanks during background refresh

### Deployment (DEPLOY)

- [ ] **DEPLOY-01**: Vercel project connected to the GitHub repo; auto-deploy on push to `main` works
- [ ] **DEPLOY-02**: `VITE_NASA_API_KEY` set in Vercel dashboard (Project → Settings → Environment Variables)
- [ ] **DEPLOY-03**: CORS verified for all four data sources (MAAS2, NOAA SWPC, NASA DONKI) from the deployed origin
- [ ] **DEPLOY-04**: Production preview shows both tabs rendering live data end-to-end

---

## v2 Requirements (deferred)

- Perseverance MEDA via NASA PDS direct ingestion (replaces or augments Curiosity REMS)
- LRO Diviner live lunar surface temperature ingestion (replaces phase-based model)
- Historical data charts / timelines per data point
- Earth comparison mode as a UI panel (not just tooltips)
- Mobile-optimized layout (beyond responsive baseline)
- Share / screenshot functionality
- Notifications or alerts (push, email)
- Embeddable widget mode
- User accounts and preferences
- Serverless proxy (Vercel Edge Function) if DEMO_KEY rate limits hit

---

## Out of Scope (v1)

- **Mobile-first layout** — desktop is the primary v1 target; basic responsive baseline only
- **Backend / server-side proxy** — all four APIs are CORS-open and key exposure risk is acceptable for `DEMO_KEY` and free NASA tier
- **User accounts** — no personalization in v1; the app is read-only
- **Historical data** — v1 is current-state only
- **Hardcoded API keys** — always via env var (`VITE_NASA_API_KEY`)
- **Inventing data / hiding approximations** — every estimate must be labeled honestly (especially lunar temperature model)
- **Empty panels** — every panel must have a meaningful loading, error, and no-data state

---

## Traceability

Every v1 REQ-ID is mapped to exactly one phase. Coverage: 54/54 ✓

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCAF-01 | Phase 1: Scaffold & Shell | Pending |
| SCAF-02 | Phase 1: Scaffold & Shell | Pending |
| SCAF-03 | Phase 1: Scaffold & Shell | Pending |
| SCAF-04 | Phase 1: Scaffold & Shell | Pending |
| SCAF-05 | Phase 1: Scaffold & Shell | Pending |
| SHELL-01 | Phase 1: Scaffold & Shell | Pending |
| SHELL-02 | Phase 1: Scaffold & Shell | Pending |
| SHELL-03 | Phase 1: Scaffold & Shell | Pending |
| SHELL-04 | Phase 1: Scaffold & Shell | Pending |
| SHELL-05 | Phase 1: Scaffold & Shell | Pending |
| UI-01 | Phase 2: Shared UI Primitives | Pending |
| UI-02 | Phase 2: Shared UI Primitives | Pending |
| UI-03 | Phase 2: Shared UI Primitives | Pending |
| UI-04 | Phase 2: Shared UI Primitives | Pending |
| UI-05 | Phase 2: Shared UI Primitives | Pending |
| UI-06 | Phase 2: Shared UI Primitives | Pending |
| UI-07 | Phase 2: Shared UI Primitives | Pending |
| MARS-01 | Phase 3: Mars Tab — Surface Data | Pending |
| MARS-02 | Phase 3: Mars Tab — Surface Data | Pending |
| MARS-03 | Phase 3: Mars Tab — Surface Data | Pending |
| MARS-04 | Phase 3: Mars Tab — Surface Data | Pending |
| MARS-05 | Phase 3: Mars Tab — Surface Data | Pending |
| MARS-06 | Phase 3: Mars Tab — Surface Data | Pending |
| MARS-07 | Phase 3: Mars Tab — Surface Data | Pending |
| MARS-08 | Phase 3: Mars Tab — Surface Data | Pending |
| MARS-09 | Phase 3: Mars Tab — Surface Data | Pending |
| MARS-10 | Phase 3: Mars Tab — Surface Data | Pending |
| MARS-11 | Phase 3: Mars Tab — Surface Data | Pending |
| LUNAR-01 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| LUNAR-02 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| LUNAR-03 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| LUNAR-04 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| LUNAR-05 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| SWPC-01 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| SWPC-02 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| SWPC-03 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| SWPC-04 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| SWPC-05 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| SWPC-06 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| SWPC-07 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| DONKI-01 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| DONKI-02 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| DONKI-03 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| DONKI-04 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| DONKI-05 | Phase 4: Moon Tab — Three Sub-Sections | Pending |
| REL-01 | Phase 5: Reliability & UX Polish | Pending |
| REL-02 | Phase 5: Reliability & UX Polish | Pending |
| REL-03 | Phase 5: Reliability & UX Polish | Pending |
| REL-04 | Phase 5: Reliability & UX Polish | Pending |
| REL-05 | Phase 5: Reliability & UX Polish | Pending |
| DEPLOY-01 | Phase 6: Vercel Deployment | Pending |
| DEPLOY-02 | Phase 6: Vercel Deployment | Pending |
| DEPLOY-03 | Phase 6: Vercel Deployment | Pending |
| DEPLOY-04 | Phase 6: Vercel Deployment | Pending |
