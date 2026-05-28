# Requirements

Source: `Discussion.md` (May 2026) + `PROJECT.md`.

REQ-ID format: `[CATEGORY]-[NUMBER]`.

---

## v1 Requirements

### Project Scaffold (SCAF)

- [x] **SCAF-01
**: Vite + React project initialized with the recommended structure (App.jsx, components/, tabs/, hooks/, utils/, constants/)
- [x] **SCAF-02
**: Tailwind CSS configured with dark theme as default and body-specific color tokens (amber/rust palette for Mars, blue/silver palette for Moon)
- [x] **SCAF-03
**: TanStack Query (React Query) installed and `QueryClientProvider` wraps the app
- [x] **SCAF-04
**: `VITE_NASA_API_KEY` env var wired (reads from `.env`, defaults to `DEMO_KEY` if unset); never hardcoded
- [x] **SCAF-05
**: Repo initialized on GitHub with `.gitignore` excluding `.env` and `node_modules`

### Shell & Navigation (SHELL)

- [x] **SHELL-01
**: Two-tab top-level navigation (Mars / Moon) with prominent visual styling matched to each body's palette
- [x] **SHELL-02
**: Active tab is visually distinct; switching tabs is instant (state-only, no route reload)
- [x] **SHELL-03
**: Subtle star-field background texture applied behind both tabs
- [x] **SHELL-04
**: Typography uses a clean technical sans-serif (Space Grotesk, Inter, or Geist)
- [x] **SHELL-05
**: Layout is desktop-first; mobile renders without breaking (basic responsive baseline, single-column fallback)

### Reusable Data UI (UI)

- [x] **UI-01
**: `DataCard` component renders label, value, unit, and tooltip trigger; supports loading skeleton and error state per card
- [x] **UI-02
**: `TooltipWrapper` shows a plain-language explainer on hover with an Earth comparison where relevant
- [x] **UI-03
**: `StatusBadge` renders a colored badge (e.g., Radiation Risk: Low/Moderate/High) with body-appropriate palette
- [x] **UI-04
**: `AlertCard` renders a DONKI solar event with type badge, UTC time, severity/class, and tooltip
- [x] **UI-05
**: `LastUpdated` component shows "Last updated X mins ago" (or UTC timestamp) per data panel
- [x] **UI-06
**: `LoadingState` skeleton loaders render independently per card — one slow API never blocks a whole tab
- [x] **UI-07
**: Tooltip copy lives in a single `constants/tooltips.js` source-of-truth file

### Mars Tab — Surface Data (MARS)

Data source: MAAS2 API (`https://api.maas2.apollorion.com/`), no auth required, refetch every 1 hour. Parse as JSON regardless of Content-Type header.

- [x] **MARS-01
**: `useMarsData` React Query hook fetches latest sol from MAAS2 with `refetchInterval: 1h`
- [x] **MARS-02
**: Display Sol number (Martian day) with tooltip explaining sol length (~24h 37min)
- [x] **MARS-03
**: Display Earth date (`terrestrial_date`) corresponding to the sol
- [x] **MARS-04
**: Display Min Temperature in °C with tooltip anchoring against Mars overnight lows
- [x] **MARS-05
**: Display Max Temperature in °C with tooltip anchoring against daytime highs
- [x] **MARS-06
**: Display Atmospheric Pressure in Pa with tooltip comparing to Earth (~0.6%)
- [x] **MARS-07
**: Display Wind Speed in m/s with tooltip explaining why high speeds feel gentle on Mars
- [x] **MARS-08
**: Display Humidity (%) with tooltip explaining dryness and water-ice context
- [x] **MARS-09
**: Display Atmospheric Opacity (categorical, e.g., "Sunny" / "Dusty") with tooltip on dust storms
- [x] **MARS-10
**: Source attribution: "From Curiosity Rover / REMS instrument" visible on the tab
- [x] **MARS-11
**: Every data card shows per-card last-updated timestamp and a graceful "Data temporarily unavailable" error state

### Moon Tab — Lunar Context (LUNAR)

No API required — computed via `astronomia` or manual Julian Date math.

- [x] **LUNAR-01**: `useLunarPhase` pure-computation hook returns current phase name, phase percentage, and day/night indicator
- [x] **LUNAR-02**: Display current lunar phase name (New Moon, Waxing Crescent, etc.) with tooltip explaining the ~29.5-day cycle
- [x] **LUNAR-03**: Display approximate surface temperature (daytime face ~+127°C, nightside ~-173°C) interpolated by phase position
- [x] **LUNAR-04**: Temperature is clearly labeled as estimate ("Estimated surface temp") with tooltip on lunar temperature swing
- [x] **LUNAR-05**: `utils/lunarPhase.js` and `utils/lunarTemperature.js` (or co-located) encapsulate the math

### Moon Tab — Space Weather (SWPC)

Data source: NOAA SWPC (no auth, public). Refetch every 5 min.

- [x] **SWPC-01**: `useSolarWind` React Query hook fetches plasma (`plasma-2-hour.json`), mag-field (`mag-2-hour.json`), and Kp (`noaa-planetary-k-index.json`) with `refetchInterval: 5min`
- [x] **SWPC-02**: Display Solar Wind Speed in km/s with tooltip on typical 400–800 km/s range and lunar surface impact
- [x] **SWPC-03**: Display Solar Wind Density in p/cm³ with tooltip on surface interaction
- [x] **SWPC-04**: Display Bz (IMF south component) in nT with tooltip on geomagnetic storm trigger
- [x] **SWPC-05**: Display Kp Index on 0–9 scale with tooltip on Kp ≥ 5 = storm conditions
- [x] **SWPC-06**: Display a derived Radiation Risk badge (Low / Moderate / High) computed from solar wind speed + Kp index, with explanation tooltip
- [x] **SWPC-07**: `utils/radiationRisk.js` encapsulates the derivation logic with test-friendly pure function

### Moon Tab — Solar Event Alerts (DONKI)

Data source: NASA DONKI (CME, FLR, GST endpoints). Requires `VITE_NASA_API_KEY`. Refetch every 15 min. Last 7 days of events.

- [x] **DONKI-01**: `useDonkiEvents` React Query hook fetches CME, Flare, and GST events from the last 7 days with `refetchInterval: 15min`
- [x] **DONKI-02**: Display events as a scrollable list of `AlertCard`s with event-type badge, UTC time, and severity/class
- [x] **DONKI-03**: Tooltips on each card explain what the event type means for lunar surface radiation
- [x] **DONKI-04**: Empty state shows "No significant events in the past 7 days — conditions are calm." (never a bare empty panel)
- [x] **DONKI-05**: Failure state shows "Data temporarily unavailable" per card without crashing the whole panel

### Reliability & UX Polish (REL)

- [x] **REL-01
**: Every data panel surfaces loading, error, and no-data states meaningfully (no blank panels, no full-page failures)
- [x] **REL-02
**: All numerical values display with units (°C, Pa, km/s, nT, p/cm³, %) — never bare numbers
- [x] **REL-03
**: Tooltips anchor Mars/Moon values to Earth equivalents wherever it aids understanding
- [x] **REL-04
**: Per-source timestamps visibly communicate freshness ("Last updated X minutes ago")
- [x] **REL-05
**: Stale-while-revalidate is the default — UI never blanks during background refresh

### Deployment (DEPLOY)

- [x] **DEPLOY-01**: Vercel project connected to the GitHub repo; auto-deploy on push to `main` works
- [x] **DEPLOY-02**: `VITE_NASA_API_KEY` set in Vercel dashboard (Project → Settings → Environment Variables)
- [x] **DEPLOY-03**: CORS verified for all four data sources (MAAS2, NOAA SWPC, NASA DONKI) from the deployed origin
- [x] **DEPLOY-04**: Production preview shows both tabs rendering live data end-to-end

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
| SCAF-01 | Phase 1: Scaffold & Shell | Complete |
| SCAF-02 | Phase 1: Scaffold & Shell | Complete |
| SCAF-03 | Phase 1: Scaffold & Shell | Complete |
| SCAF-04 | Phase 1: Scaffold & Shell | Complete |
| SCAF-05 | Phase 1: Scaffold & Shell | Complete |
| SHELL-01 | Phase 1: Scaffold & Shell | Complete |
| SHELL-02 | Phase 1: Scaffold & Shell | Complete |
| SHELL-03 | Phase 1: Scaffold & Shell | Complete |
| SHELL-04 | Phase 1: Scaffold & Shell | Complete |
| SHELL-05 | Phase 1: Scaffold & Shell | Complete |
| UI-01 | Phase 2: Shared UI Primitives | Complete |
| UI-02 | Phase 2: Shared UI Primitives | Complete |
| UI-03 | Phase 2: Shared UI Primitives | Complete |
| UI-04 | Phase 2: Shared UI Primitives | Complete |
| UI-05 | Phase 2: Shared UI Primitives | Complete |
| UI-06 | Phase 2: Shared UI Primitives | Complete |
| UI-07 | Phase 2: Shared UI Primitives | Complete |
| MARS-01 | Phase 3: Mars Tab — Surface Data | Complete |
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
| LUNAR-01 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-02) |
| LUNAR-02 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| LUNAR-03 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| LUNAR-04 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| LUNAR-05 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-01) |
| SWPC-01 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-02) |
| SWPC-02 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| SWPC-03 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| SWPC-04 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| SWPC-05 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| SWPC-06 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| SWPC-07 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-01) |
| DONKI-01 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-02) |
| DONKI-02 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| DONKI-03 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| DONKI-04 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| DONKI-05 | Phase 4: Moon Tab — Three Sub-Sections | Complete (2026-05-21, 04-03) |
| REL-01 | Phase 5: Reliability & UX Polish | Pending |
| REL-02 | Phase 5: Reliability & UX Polish | Pending |
| REL-03 | Phase 5: Reliability & UX Polish | Pending |
| REL-04 | Phase 5: Reliability & UX Polish | Pending |
| REL-05 | Phase 5: Reliability & UX Polish | Pending |
| DEPLOY-01 | Phase 6: Vercel Deployment | Complete |
| DEPLOY-02 | Phase 6: Vercel Deployment | Complete |
| DEPLOY-03 | Phase 6: Vercel Deployment | Complete |
| DEPLOY-04 | Phase 6: Vercel Deployment | Complete |
