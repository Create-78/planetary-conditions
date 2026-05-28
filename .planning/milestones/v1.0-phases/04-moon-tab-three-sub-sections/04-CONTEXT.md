# Phase 4: Moon Tab — Three Sub-Sections — Context

**Gathered:** 2026-05-19
**Status:** Ready for planning
**Source:** Auto-discuss (session-wide "no clarifying questions" instruction). Synthesized from Discussion.md §4b–4c, §3 (Refresh Cadence), §6 (UX details), §9 (API Quick Reference), REQUIREMENTS.md LUNAR-01..05 / SWPC-01..07 / DONKI-01..05, Phase 2 primitive contracts, Phase 3 CONTEXT (`useMarsData` pattern), and ROADMAP.md Phase 4 success criteria.

<domain>
## Phase Boundary

Build the Moon tab as **three independently-sourced sections** stacked in one tab:

1. **Lunar Context** (LUNAR-01..LUNAR-05) — Computed from a pure-math hook (`useLunarPhase`). Phase name, phase percentage, day/night status, and a model-based surface-temperature estimate (interpolated between +127°C daytime face and −173°C nightside).
2. **Space Weather — Solar Wind** (SWPC-01..SWPC-07) — Live NOAA SWPC fetch (`useSolarWind`). Solar wind speed, density, Bz, Kp index, plus a derived **Radiation Risk** badge (Low / Moderate / High) computed from solar wind speed + Kp.
3. **Solar Event Alerts** (DONKI-01..DONKI-05) — Live NASA DONKI fetch (`useDonkiEvents`). Last-7-day CME / Flare / GST events rendered as `AlertCard`s, sorted reverse-chronologically. Empty-state copy "No significant events in the past 7 days — conditions are calm."

**In scope (Phase 4):**
- Three hooks: `useLunarPhase` (pure math), `useSolarWind` (3 SWPC endpoints merged), `useDonkiEvents` (3 DONKI endpoints merged)
- Two pure utility modules: `src/utils/lunarPhase.js` (+ co-located surface-temp interpolation), `src/utils/radiationRisk.js`
- `MoonTab.jsx` body fully replaced — Phase 2 demo gallery removed (matches Phase 3 precedent)
- Tooltip copy added under `moon.*`, `swpc.*`, `donki.*` namespaces; existing Phase 2 placeholders (`moon.example`, `swpc.radiationRisk`, `donki.cme`) extended/replaced
- Per-section LastUpdated chips reflecting each section's underlying source cadence
- Per-section loading / error / empty-state handling (one section's failure never blanks the other two)
- Use of `import.meta.env.VITE_NASA_API_KEY` (via existing `src/utils/env.js` accessor) for DONKI calls — never hardcode

**Out of scope (Phase 5+):**
- LRO Diviner live data ingestion (v2)
- Lunar phase graphic / SVG illustration (defer to backlog)
- DONKI event detail drill-down or external links (v2)
- Historical SWPC time-series charts (v2)
- Backend proxy for DONKI rate limits (only if DEMO_KEY hits limits in production)
- Cross-section unified "Moon status" summary (v2 polish)

**Carrying forward from prior phases:**
- Tech stack: React 18 + Vite + Tailwind 3 + TanStack Query (Phase 1)
- Palette tokens: `moon-{400,500,700,900}`, `moon-accent` (blue/silver tones), `space-{900,950}` — do not introduce new palette tokens
- Primitive library (Phase 2): `DataCard`, `StatusBadge`, `AlertCard`, `LastUpdated`, `TooltipWrapper`, `LoadingState`, `useNow`, `tooltips.js`
- `useMarsData` pattern (Phase 3): single hook returning full TanStack Query result; consumer reads `{ data, isLoading, isError, dataUpdatedAt }` and propagates to cards. Phase 4 hooks follow this contract.
- `src/utils/env.js` already exports `NASA_API_KEY` — Phase 4 imports it (no hardcoded keys, no `import.meta.env.*` access outside this module per Phase 1 convention)
- `tooltips.js` is the single source of truth — extend, don't fork
- `<section role="tabpanel">` wrapper preserved (Phase 1 contract)

</domain>

<decisions>
## Implementation Decisions

### Section 1 — Lunar Context (no API)

- **D-01:** `src/hooks/useLunarPhase.js` is a **pure-computation hook** — no fetch, no React Query. It returns `{ phaseName, phaseFraction, dayNightStatus, surfaceTemp, computedAt }`. The hook calls into `src/utils/lunarPhase.js` and re-evaluates **on every render plus every 30s via `useNow()` from Phase 2** (cheap; the math is sub-millisecond and re-rendering every 30s — useNow's native cadence — keeps the day/night indicator and phase fraction accurate over long sessions; the 30s tick over-satisfies the "stay current over long sessions" intent).
- **D-02:** Lunar phase math uses **manual Julian Date computation** — no new dependency (no `astronomia` package). Algorithm: J2000-based Julian Date → modulo synodic month (29.530588853 days) → phase fraction [0, 1) → phase angle [0, 2π) → phase name from canonical 8-name set (New, Waxing Crescent, First Quarter, Waxing Gibbous, Full, Waning Gibbous, Last Quarter, Waning Crescent).
- **D-03:** Surface temperature is a **cosine interpolation** between full-sun face (+127°C) and dark-side (−173°C), driven by phase angle. Function lives in `src/utils/lunarPhase.js` co-located with the phase math (per LUNAR-05; no separate `lunarTemperature.js` file unless the math grows large enough to justify splitting). The returned temperature is the temperature of the **illuminated face we can see from Earth**, not the global average — labeled accordingly in the UI.
- **D-04:** "Day/night status" is a **short descriptive string**, not a boolean: `"Day side facing Earth"` (phase 0.4–0.6, near full), `"Night side facing Earth"` (phase 0.95–0.05, near new), `"Crescent (partial)"` (everything else). Rendered as a `DataCard` value with no unit.
- **D-05:** Surface temperature is rendered with the label **"Estimated surface temp (visible face)"** to honor LUNAR-04 (clearly labeled as estimate). The DataCard's tooltip copy emphasizes the modeled-not-measured framing.
- **D-06:** Section heading: `"Lunar Context"`. Three DataCards in this section: Phase Name (no unit), Phase Percentage (`%`), Day/Night Status (no unit), Estimated Surface Temp (`°C`). That's **four cards**.
- **D-07:** No `LastUpdated` chip for this section — the data is computed locally and refreshes per minute. Instead, render a small "Computed locally" attribution under the section heading (same visual size and color as Phase 3's source line, color `moon-50/60`).

### Section 2 — Space Weather (NOAA SWPC)

- **D-08:** `src/hooks/useSolarWind.js` is a **single hook** that internally fans out three TanStack Query subqueries (plasma, mag, Kp) via `useQueries` (TanStack Query v5 batch hook). Returns one merged result: `{ speed, density, bz, kp, isLoading, isError, dataUpdatedAt }`. Three queries → one consumer surface. Hook lives at `src/hooks/useSolarWind.js`.
- **D-09:** Endpoints (no auth, CORS-open):
  - Plasma: `https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json`
  - Mag field: `https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json`
  - Kp index: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json`
- **D-10:** **SWPC response shape is tabular JSON:** first array element is the column header row (string array); subsequent elements are data rows. The hook must parse this — extract the latest non-null row from each endpoint, map by header name to the desired fields. Examples:
  - Plasma: `time_tag`, `density`, `speed`, `temperature` → grab `density`, `speed`
  - Mag: `time_tag`, `bx_gsm`, `by_gsm`, `bz_gsm`, `bt`, `lon_gsm`, `lat_gsm` → grab `bz_gsm` (the Bz GSM component)
  - Kp: rows of `[time_tag, kp_index, observed]` → grab the latest `kp_index`
- **D-11:** `isLoading` is the OR of all three sub-queries (any still loading → section shows loading skeletons). `isError` is the OR of all three (any failed → section shows error). `dataUpdatedAt` is the MAX of the three (most recent fetch time).
- **D-12:** `refetchInterval: 1000 * 60 * 5` (5 minutes) for all three SWPC queries. `refetchOnWindowFocus: false` (consistent with Phase 3 D-03 lock).
- **D-13:** No Content-Type workaround needed — SWPC sends correct `application/json`. Use TanStack Query's default `.json()` path (`fetch(url).then(r => r.json())`). Verify with `response.ok` guard.
- **D-14:** Four `DataCard`s in this section: Solar Wind Speed (`km/s`), Solar Wind Density (`p/cm³`), Bz (`nT`), Kp Index (no unit — it's already a dimensionless 0–9 scale). Each gets a `LastUpdated` chip fed from `useSolarWind().dataUpdatedAt`.
- **D-15:** **Radiation Risk badge** is a separate `StatusBadge` rendered above or to the right of the four DataCards. The severity is derived in `src/utils/radiationRisk.js`:
  ```
  function deriveRadiationRisk({ speed, kp }) {
    if (speed == null || kp == null) return null
    if (kp >= 5 || speed >= 700) return 'high'
    if (kp >= 3 || speed >= 500) return 'moderate'
    return 'low'
  }
  ```
  Tested through pure-function unit tests if a test runner is added (otherwise verified via inline grep on the threshold literals).
- **D-16:** `StatusBadge` uses `severity="low"|"moderate"|"high"` (Phase 2 universal severity colors — green/amber/red, NOT palette-tinted) with `tooltipKey="swpc.radiationRisk"`. The Phase 2 placeholder tooltip key `swpc.radiationRisk` is rewritten with the final copy in Phase 4.
- **D-17:** Section heading: `"Space Weather — Solar Wind"`. One tab-level `LastUpdated` chip in the section header right-aligned, fed from the merged `dataUpdatedAt`.

### Section 3 — Solar Event Alerts (NASA DONKI)

- **D-18:** `src/hooks/useDonkiEvents.js` is a **single hook** that fans out three DONKI endpoints (CME, FLR, GST) via `useQueries`. Returns one merged result: `{ events, isLoading, isError, dataUpdatedAt }` where `events` is a unified, reverse-chronologically sorted array of `{ id, type: 'CME'|'FLR'|'GST', time, severity, tooltipKey }`.
- **D-19:** Endpoints (require `VITE_NASA_API_KEY`):
  - CME: `https://api.nasa.gov/DONKI/CME?startDate={d}&api_key={KEY}`
  - FLR: `https://api.nasa.gov/DONKI/FLR?startDate={d}&api_key={KEY}`
  - GST: `https://api.nasa.gov/DONKI/GST?startDate={d}&api_key={KEY}`
  - `{d}` = today minus 7 days in `YYYY-MM-DD` format (computed once at hook mount and memoized via `useMemo` on a stable day-only key so it doesn't shift mid-hour).
- **D-20:** `import.meta.env.VITE_NASA_API_KEY` is accessed **only through `src/utils/env.js`** (already exists from Phase 1, exports `NASA_API_KEY` with `DEMO_KEY` fallback). The hook imports `{ NASA_API_KEY } from '../utils/env'`. Never inline the env var or interpolate into a string at the call site.
- **D-21:** **DONKI response shape varies by endpoint:**
  - CME: array of objects with `activityID`, `startTime`, `note`, `cmeAnalyses[].speed`, etc. Severity string: `Speed: {speed} km/s` (from first analysis if present) or `"Speed unknown"` if no analyses.
  - FLR: array with `flrID`, `beginTime`, `classType` (e.g., "M2.3", "X1.5"). Severity string: `Class {classType}`.
  - GST: array with `gstID`, `startTime`, `allKpIndex[].kpIndex` (array of Kp observations). Severity string: `Kp peak: {max kpIndex}` or `"Kp ongoing"` if array is empty.
- **D-22:** Each event maps to an `AlertCard` from the Phase 2 primitive library with: `eventType="CME" | "FLR" | "GST"` (drives badge color — indigo/orange/fuchsia per Phase 2 lock), `time={iso8601_string}`, `severity={derived_string}`, `tooltipKey="donki.cme" | "donki.flr" | "donki.gst"`.
- **D-23:** Events are sorted **reverse-chronologically** (most recent first) in the unified array. The render is a vertical scrollable list with `max-h-96 overflow-y-auto` (Tailwind), so long event-rich weeks remain compact.
- **D-24:** `refetchInterval: 1000 * 60 * 15` (15 minutes) for all three DONKI queries. `refetchOnWindowFocus: false`.
- **D-25:** **Empty state (DONKI-04):** When all three event arrays are empty (post-fetch, not still-loading), render the literal copy **"No significant events in the past 7 days — conditions are calm."** as a centered muted text div (NOT an AlertCard — an empty state isn't an alert). Styling: `text-sm text-moon-50/60 italic py-6 text-center`.
- **D-26:** **Loading state:** While `isLoading`, render 3 `LoadingState` skeletons stacked (sized to roughly match AlertCard height — pass a `className` to size them appropriately). When data arrives, the skeletons are replaced.
- **D-27:** **Error state (DONKI-05):** When `isError`, render a single muted card-shaped block with the copy "Data temporarily unavailable" (same canonical string Phase 2 DataCard uses for error). Phase 2 AlertCard doesn't have a built-in error state, so the section composes one inline — DOES NOT swallow errors silently.
- **D-28:** Section heading: `"Solar Event Alerts (last 7 days)"`. One tab-level `LastUpdated` chip in the section header right-aligned, fed from the merged `useDonkiEvents().dataUpdatedAt`.

### MoonTab.jsx structure

- **D-29:** Phase 4 fully replaces the body of `src/tabs/MoonTab.jsx`. The Phase 2 demo gallery is deleted. The `<section role="tabpanel" aria-labelledby="tab-moon">` wrapper from Phase 1 is preserved.
- **D-30:** Three sections render unconditionally and independently. One section's `isError` never affects another section's render. Tab heading + per-section headings remain visible across all states (per success criterion 1 across all three sections — never blank).
- **D-31:** Section order (top → bottom): Lunar Context → Space Weather — Solar Wind → Solar Event Alerts. Rationale: the user's "where am I in the lunar cycle" anchor comes first; then current space environment; then recent events. This matches Discussion.md §4 ordering (4a, 4b, 4c).
- **D-32:** Within each section: section heading (with attribution/LastUpdated subtitle) → primary content (DataCards or AlertCard list). Section dividers are achieved with margin (`mb-12`), not horizontal rules.
- **D-33:** `palette="moon"` on every DataCard, every LastUpdated, every StatusBadge tooltip wrapper. The Moon palette accent is silver (`moon-accent`) per Phase 2 token (Discussion.md §2: "blue/silver for Moon").
- **D-34:** No new top-level components. Sub-components (`LunarSection`, `SolarWindSection`, `DonkiSection`) MAY be extracted by the planner if it improves clarity — Claude's discretion (matches Phase 3 D-24).

### Tooltip copy — extend tooltips.js

- **D-35:** Phase 4 adds the following keys to `src/constants/tooltips.js` (and REWRITES the three Phase 2 placeholder keys `moon.example`, `swpc.radiationRisk`, `donki.cme` to their final copy):
  - `lunar.phase` — "The Moon takes ~29.5 days to complete one cycle. The lunar 'day' (sunrise to sunrise) lasts about 29.5 Earth days." (LUNAR-02)
  - `lunar.surfaceTemp` — "Lunar surface temperatures swing more than 300°C between day and night — the Moon has no atmosphere to moderate temperature." (LUNAR-04)
  - `lunar.dayNight` — "We see the lit half of the Moon based on where it sits relative to the Sun. The dark side faces away from the Sun, not always away from Earth."
  - `swpc.speed` — "The constant flow of charged particles from the Sun. Typical speed is 400–800 km/s. High speeds can intensify radiation at the lunar surface." (SWPC-02)
  - `swpc.density` — "Number of protons per cubic centimeter. Higher density = stronger interaction with the lunar surface." (SWPC-03)
  - `swpc.bz` — "When the interplanetary magnetic field points south (negative Bz), it can trigger geomagnetic storms. Strongly negative = elevated radiation risk." (SWPC-04)
  - `swpc.kp` — "A global measure of geomagnetic disturbance. Kp ≥ 5 = geomagnetic storm conditions." (SWPC-05)
  - `swpc.radiationRisk` — REWRITTEN — "Derived from solar wind speed + Kp index. Low = quiet; Moderate = elevated; High = storm-level activity that increases surface radiation at the Moon." (SWPC-06)
  - `donki.cme` — REWRITTEN — "Coronal Mass Ejection — a burst of plasma and magnetic field from the Sun. Drives geomagnetic storms days after eruption. At the lunar surface: radiation flux can spike for hours to days." (DONKI-03)
  - `donki.flr` — "Solar Flare — a sudden burst of X-ray/UV radiation from the Sun's surface. At the Moon: instantaneous radiation increase, lasting minutes to hours. Classes M and X are notable; class X is extreme."
  - `donki.gst` — "Geomagnetic Storm — large-scale disturbance of Earth's magnetic field caused by solar activity. At the Moon: elevated radiation from trapped energetic particles."
- **D-36:** Each new key includes a `source:` field per Phase 3 D-21 pattern:
  - lunar.* → `source: 'Computed (lunar phase model)'`
  - swpc.* → `source: 'NOAA SWPC'`
  - donki.* → `source: 'NASA DONKI'`
- **D-37:** The Phase 2 placeholder `moon.example` is removed if it has no remaining consumers after Phase 4 wiring (it was a demo-only key).

### Unit & formatting conventions (cross-section)

- **D-38:** Numeric formatting:
  - Solar Wind Speed: integer (e.g., `420 km/s`)
  - Solar Wind Density: 1 decimal (e.g., `3.2 p/cm³`)
  - Bz: 1 decimal with sign (e.g., `-2.4 nT`)
  - Kp Index: 1 decimal (e.g., `3.7`)
  - Phase Percentage: integer (e.g., `74%`)
  - Surface Temp: integer (e.g., `-145 °C` or `+88 °C` — sign shown for cold values)
- **D-39:** Em-dash fallback for any null/undefined value via DataCard's existing null handling.
- **D-40:** UTC time on AlertCards uses Phase 2's built-in `formatUtc()` inside AlertCard.jsx (no further formatting needed at the call site).

### Error & loading isolation across sections

- **D-41:** Each section's hook produces independent `isLoading`/`isError`. The MoonTab orchestrator does NOT compute a tab-level `cardState` — each section computes its own and propagates only to its own cards. Failing DONKI doesn't change anything in Lunar Context or Solar Wind.
- **D-42:** First-mount loading: each section independently shows skeleton/placeholder until its hook resolves. Tab heading + all three section headings remain visible.
- **D-43:** Silent background refetch (per success criterion 5): each section uses `isLoading` (NOT `isFetching`) for its skeleton trigger, so 5-min SWPC refreshes and 15-min DONKI refreshes don't blank cards.

### Claude's Discretion

- Exact JSX layout inside each section (grid columns, spacing, alignment) — planner may use 2×2 / 4×1 / 1×4 grids per section based on visual balance with the existing Mars tab
- Whether to extract `LunarSection` / `SolarWindSection` / `DonkiSection` sub-components or keep MoonTab flat
- Whether to memoize `useDonkiEvents`' date-window calculation with `useMemo` (recommended) or compute it inline (acceptable)
- Whether to alphabetize / re-order the `useQueries` query keys for SWPC and DONKI
- Test strategy — no test runner exists; planner MAY add Vitest specifically for the two pure utility files (`radiationRisk.js`, `lunarPhase.js`) since they are tdd-suitable per the GSD-tdd heuristic. If Vitest is added, it stays scoped to those two files. Otherwise rely on `npm run build` + grep proofs + human-UAT.

</decisions>

<specifics>
## Specific Ideas

- **SWPC tabular JSON parsing pattern:**
  ```js
  // First row is headers, remaining rows are data:
  const [headers, ...rows] = await response.json()
  const latest = rows[rows.length - 1]
  const obj = Object.fromEntries(headers.map((h, i) => [h, latest[i]]))
  // Now read obj.speed, obj.density, etc.
  ```
- **DONKI 7-day window date string:**
  ```js
  function sevenDaysAgoISO() {
    const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10) // 'YYYY-MM-DD'
  }
  ```
- **Lunar phase J2000 calc (canonical algorithm):**
  ```js
  // Synodic month period = 29.530588853 days
  // Reference new moon: 2000-01-06 18:14 UTC (Julian Date 2451550.1)
  const SYNODIC = 29.530588853
  const REF_NEW_MOON_JD = 2451550.1
  function julianDate(date) { return date.getTime() / 86400000 + 2440587.5 }
  function phaseFraction(date) {
    const days = julianDate(date) - REF_NEW_MOON_JD
    return ((days % SYNODIC) + SYNODIC) % SYNODIC / SYNODIC
  }
  ```
- **Radiation Risk thresholds (D-15)** — Educational, not scientific. The Discussion.md §4b language ("simple 3-level indicator … for the educational audience") authorizes these heuristic thresholds. Document the choice in `radiationRisk.js` header so future-us doesn't think they're empirical.
- **Aesthetic anchor:** The Moon palette is blue + silver (per Discussion.md §2 + Phase 2 `moon-accent`). The Mars tab's "amber glow" should NOT leak into the Moon tab. All accent text uses `text-moon-accent/*`.
- **Section dividers:** No `<hr>` between sections. Vertical margin (`mb-12`) handles separation. Each section heading is the visual anchor.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product spec & decisions
- `Discussion.md` §4a (Lunar Context — computed model)
- `Discussion.md` §4b (Space Weather — Solar Wind / NOAA SWPC)
- `Discussion.md` §4c (Solar Event Alerts / NASA DONKI)
- `Discussion.md` §3 (Refresh Cadence — 5min SWPC, 15min DONKI, static lunar)
- `Discussion.md` §6 (UX Details — per-card states, units, Earth-anchored tooltips)
- `Discussion.md` §9 (API Quick Reference — endpoints + auth)
- `CLAUDE.md` — Project guardrails: never invent data, env-var keys only, no proxy, MAAS2 Content-Type workaround (informational — does NOT apply to SWPC/DONKI which send correct headers)

### Requirements (must-haves)
- `.planning/REQUIREMENTS.md` LUNAR-01..LUNAR-05 (Lunar Context)
- `.planning/REQUIREMENTS.md` SWPC-01..SWPC-07 (Solar Wind + Radiation Risk)
- `.planning/REQUIREMENTS.md` DONKI-01..DONKI-05 (Event Alerts + empty state + error state)

### Roadmap
- `.planning/ROADMAP.md` Phase 4 section — goal, depends-on, 5 success criteria

### Prior-phase decisions (locked — do not re-litigate)
- `.planning/phases/02-shared-ui-primitives/02-CONTEXT.md` — Primitive contracts (DataCard / StatusBadge / AlertCard / LastUpdated / TooltipWrapper / LoadingState / useNow / tooltips.js)
- `.planning/phases/02-shared-ui-primitives/02-02-composite-primitives-SUMMARY.md` — Final composite primitive APIs (StatusBadge severity values; AlertCard eventType values + UTC formatting; LastUpdated palette behavior)
- `.planning/phases/03-mars-tab-surface-data/03-CONTEXT.md` — Tab-pattern reference: single hook → shared state → 8 cards + 9 LastUpdated; per-card freshness; silent background refetch; source attribution placement
- `.planning/phases/03-mars-tab-surface-data/03-02-SUMMARY.md` — Tab integration pattern as actually shipped
- `.planning/phases/01-scaffold-shell/01-02-shell-SUMMARY.md` — App.jsx / TabBar.jsx contracts; `<section role="tabpanel">` wrapper

### External APIs
- NOAA SWPC plasma: `https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json` (no auth, CORS-open, tabular JSON — headers row + data rows)
- NOAA SWPC mag: `https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json` (no auth, CORS-open, tabular JSON)
- NOAA SWPC Kp: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json` (no auth, CORS-open, tabular JSON)
- NASA DONKI CME: `https://api.nasa.gov/DONKI/CME?startDate={d}&api_key={KEY}` (NASA key, returns array of objects)
- NASA DONKI FLR: `https://api.nasa.gov/DONKI/FLR?startDate={d}&api_key={KEY}` (NASA key, returns array of objects)
- NASA DONKI GST: `https://api.nasa.gov/DONKI/GST?startDate={d}&api_key={KEY}` (NASA key, returns array of objects)

### Library docs
- TanStack Query v5 — `useQueries` (batch hook for fan-out) + `useQuery` + `dataUpdatedAt` + `isLoading` vs `isFetching` (project uses `@tanstack/react-query@^5.100.10` per package.json)
- No new npm dependencies expected — manual Julian Date math replaces the `astronomia` package option

### Env handling
- `src/utils/env.js` — already exports `NASA_API_KEY` (from `import.meta.env.VITE_NASA_API_KEY`, falls back to `DEMO_KEY`). All DONKI calls import from this module.
- `.env.example` — already exists, documents the `VITE_NASA_API_KEY=DEMO_KEY` default

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/DataCard.jsx` — 4 Lunar cards + 4 Solar Wind cards. `palette="moon"` accent already wired.
- `src/components/StatusBadge.jsx` — Radiation Risk badge (severity="low|moderate|high"). Universal severity colors (green/amber/red) per Phase 2 lock — do NOT palette-tint.
- `src/components/AlertCard.jsx` — Each DONKI event. eventType="CME|FLR|GST" drives badge color (indigo/orange/fuchsia per Phase 2 lock).
- `src/components/LastUpdated.jsx` — Section-level chips for SWPC and DONKI sections. Lunar section uses static "Computed locally" text instead.
- `src/components/LoadingState.jsx` — DONKI section's loading skeletons.
- `src/constants/tooltips.js` — Extend with `lunar.*`, `swpc.*`, `donki.*` keys. Three Phase 2 placeholders to rewrite.
- `src/utils/env.js` — `NASA_API_KEY` import for DONKI hook.
- `src/hooks/useNow.js` — Drives the 60s tick for `useLunarPhase` to keep day/night status fresh over long sessions.
- TanStack Query v5 `useQueries` — Batch hook for SWPC and DONKI fan-outs.

### Established Patterns
- Single hook → full TanStack Query result → consumer maps to card states (Phase 3 `useMarsData` pattern).
- `palette` prop on DataCard / StatusBadge / LastUpdated for decorative theming.
- `tooltipKey` prop on DataCard / StatusBadge / AlertCard for tooltip wiring.
- Source attribution as subtitle under section heading; LastUpdated chip beside it (Phase 3 D-12 pattern).
- No proxy; client-side fetch only; CORS confirmed for all three sources.
- Error display string is canonical: "Data temporarily unavailable" (Phase 2 DataCard contract).
- `isLoading` (NOT `isFetching`) for skeleton trigger (Phase 3 D-18 silent refetch lock).

### Integration Points
- `src/tabs/MoonTab.jsx` — Existing file from Phase 1 (placeholder) + Phase 2 (demo gallery). Phase 4 replaces its body.
- `src/hooks/` — Currently has `useMarsData.js` and `useNow.js`. Add `useLunarPhase.js`, `useSolarWind.js`, `useDonkiEvents.js`.
- `src/utils/` — Currently has `env.js`. Add `lunarPhase.js` and `radiationRisk.js`. No `lunarTemperature.js` — keep co-located in `lunarPhase.js` per D-03.
- `src/constants/tooltips.js` — Extend `TOOLTIPS` with 11 new keys (3 lunar, 5 swpc, 3 donki) and rewrite 3 Phase 2 placeholders.
- `src/main.jsx` — QueryClientProvider already mounted (Phase 1).

</code_context>

<deferred>
## Deferred Ideas

- **Lunar phase graphic / SVG illustration** — A small visual showing the current illuminated fraction. Could be hand-drawn or computed via CSS clip-path. Nice-to-have, not in v1 scope. Defer to backlog.
- **LRO Diviner live temperature data** — Documented in Discussion.md as v2 upgrade. Requires PDS archive access. Own milestone.
- **DONKI event detail drill-down** — Click an event card → modal with full DONKI metadata (instruments, observatories, links to NASA missions). Not in v1. Defer.
- **DONKI event filtering** — User toggles to show only CMEs, only flares, etc. Out of scope for v1's "see everything that happened in the last week" frame.
- **Historical solar-wind sparklines** — Plot the last 2 hours of speed/density/Bz. SWPC's `*-2-hour.json` endpoints contain the time series. Visually appealing but adds a chart library dependency. Defer.
- **Auto-refresh visual indicator** — A subtle "refreshing..." pulse during SWPC's 5-min background fetch. Discussion held back per D-43 silent-refetch lock. Possible Phase 5 polish.
- **Manual refresh button per section** — If DONKI rate limits hit in production (DEMO_KEY has 30 req/IP/hr), a user-triggered refetch could help. Defer until evidence of need.
- **Backend proxy for DONKI** — Documented in PROJECT.md as a contingency if `DEMO_KEY` rate limits force it. Not building speculatively.
- **Lunar libration / parallax** — More accurate "which face are we seeing" math accounting for the Moon's wobble. Out of scope; the v1 model is the simplified phase-driven approximation.
- **Cross-source unified "Moon status" summary** — A top-level "All systems quiet" / "Storm watch" composite indicator. Compelling but requires a composite ruleset. Defer to Phase 5 reliability/polish or to a future v2 enrichment milestone.

</deferred>

---

*Phase: 04-moon-tab-three-sub-sections*
*Context gathered: 2026-05-19*
