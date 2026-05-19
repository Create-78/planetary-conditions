# Phase 3: Mars Tab — Surface Data — Context

**Gathered:** 2026-05-19
**Status:** Ready for planning
**Source:** Auto-discuss (session-wide "no clarifying questions" instruction). Synthesized from Discussion.md §5 (Mars Tab — Data Panels), §3 (Refresh Cadence), §9 (API Quick Reference), REQUIREMENTS.md MARS-01..MARS-11, Phase 2 primitive contracts, and ROADMAP.md Phase 3 success criteria.

<domain>
## Phase Boundary

Wire the Mars tab to live MAAS2/Curiosity REMS data and render it through the Phase 2 primitive library. Replace the Phase 2 demo gallery in `src/tabs/MarsTab.jsx` with a real, prop-driven layout backed by a React Query hook (`useMarsData`) that pulls the latest sol from `https://api.maas2.apollorion.com/` every hour.

**In scope (Phase 3):**
- One React Query hook (`useMarsData`) that fetches MAAS2 latest sol, handles the wrong-Content-Type quirk, refetches every 1h
- Nine data cards mapped to the MAAS2 fields per Discussion.md §5
- Per-card and tab-level freshness via `LastUpdated` consuming the React Query `dataUpdatedAt`
- Source attribution "From Curiosity Rover / REMS instrument" visible on the tab
- Earth-anchored tooltip copy added to `src/constants/tooltips.js` under the `mars.*` namespace
- Per-card loading skeletons (first mount) and error states (when MAAS2 fails), silent background refetches afterward

**Out of scope (Phase 4+):**
- Moon tab (separate phase)
- Historical sol charts / sparklines (v2)
- Perseverance MEDA / NASA PDS ingestion (v2)
- Sol selector / arbitrary-sol fetching (v2)
- Retry-on-click UI affordance (planner decides; default off)

**Carrying forward from prior phases:**
- Tech stack: React 18 + Vite + Tailwind 3 + TanStack Query (Phase 1)
- Palette tokens: `mars-{500,700,900}`, `mars-accent` (amber-500), `space-{900,950}` — do not introduce new palette tokens
- Primitive library complete (Phase 2): `DataCard`, `StatusBadge`, `AlertCard`, `LastUpdated`, `TooltipWrapper`, `LoadingState`, `useNow`, `tooltips.js`
- `DataCard` accepts `state="loading" | "error" | "ok"` and `palette="mars" | "moon"`; loading renders `LoadingState`, error renders "Data temporarily unavailable" verbatim
- `LastUpdated` consumes `useNow` (30s ticker) and shows relative time + absolute UTC tooltip
- `tooltips.js` is the single source of truth for tooltip copy; consumers reference by key (e.g. `tooltipKey="mars.pressure"`)
- `tooltips.js` already has a placeholder `mars.example` key from Phase 2 — Phase 3 adds the real keys and removes the placeholder if unused

</domain>

<decisions>
## Implementation Decisions

### Data layer — one shared hook, not per-card hooks

- **D-01:** A single `useMarsData()` hook fetches the entire MAAS2 latest-sol payload in one request. All nine DataCards read from the same query result. Per-card hooks would multiply HTTP requests for the same JSON blob and serve no purpose — MAAS2 returns a flat object containing all fields.
- **D-02:** Hook lives at `src/hooks/useMarsData.js`. Returns the full TanStack Query result object (`{ data, isLoading, isError, dataUpdatedAt, refetch, ... }`) so the tab can read individual fields and propagate state to DataCards.
- **D-03:** `refetchInterval: 1000 * 60 * 60` (1 hour) per Discussion.md §3 (MAAS2 underlying data updates ~once per Martian sol ≈ 24.6 h). Also set `refetchOnWindowFocus: false` — hourly background refresh is sufficient and avoids visible jumps when users tab back.
- **D-04:** **MAAS2 Content-Type quirk:** the endpoint is GitHub Pages-hosted and may return `text/html` or `text/plain`. Use `fetch().then(r => r.text()).then(JSON.parse)` rather than `r.json()` to bypass any Content-Type rejection. Wrap in try/catch and surface parse errors as `isError`.
- **D-05:** No backend proxy. Client-side fetch direct to `https://api.maas2.apollorion.com/`. MAAS2 is CORS-open. Per CLAUDE.md: do not add a proxy unless rate limits force it.
- **D-06:** No API key required for MAAS2 — `VITE_NASA_API_KEY` is unused in this phase (it's needed for Phase 4's DONKI calls).

### Card layout — three sections, responsive grid

- **D-07:** Three logical groupings on the tab, top to bottom:
  1. **Sol header** (Sol number + Earth date) — single-row pair anchoring "what day on Mars" at the top
  2. **Temperature & atmosphere** (Min Temp, Max Temp, Pressure, Humidity) — 4 cards in a responsive grid
  3. **Wind & sky** (Wind Speed, Atmospheric Opacity) — 2 cards
- **D-08:** Grid is Tailwind responsive: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4` for the main bands. Sol header uses `grid grid-cols-1 sm:grid-cols-2`. Cards use the existing `DataCard` `palette="mars"` accent.
- **D-09:** Section headings ("Sol Context", "Temperature & Atmosphere", "Wind & Sky") are small uppercase subtitles in `mars-accent/70` color, above each band. Quiet — the values are the focal point per Phase 2 design language.

### Per-card vs tab-level freshness

- **D-10:** Both. Each DataCard gets a `LastUpdated` chip below its value, fed from the same React Query `dataUpdatedAt`. A larger tab-level `LastUpdated` lives in the tab header beside the source attribution. Per-card chips are honest because they all share the same `dataUpdatedAt` (one fetch → one timestamp); they're rendered per-card so the freshness signal travels with each value, matching success criterion #4.
- **D-11:** `LastUpdated` uses `palette="mars"` everywhere on this tab — palette is decorative, not semantic (Phase 2 lock).

### Source attribution — tab subheader

- **D-12:** Source line "From Curiosity Rover · REMS instrument" appears as a small italicized subtitle directly under the "Mars" tab heading, color `mars-50/60`. Same row also shows the tab-level `LastUpdated` chip (right-aligned). Matches success criterion #3.
- **D-13:** The source string lives as a constant in the component file (or `src/constants/sources.js` if Phase 4 ends up sharing the pattern). Plain text — no link in v1.

### Atmospheric opacity — render as DataCard with categorical value

- **D-14:** `atmo_opacity` is categorical ("Sunny" / "Dusty" / "Sunny - Dusty" / etc.). Render as a `DataCard` with `value={opacity}` and no `unit`. Do NOT use `StatusBadge` — StatusBadge is reserved for severity (low/moderate/high). Opacity is descriptive, not a severity ranking.
- **D-15:** If MAAS2 returns a value not in the expected set, render it verbatim — never silently rewrite or invent labels (per CLAUDE.md: "never invent data, fabricate values, or hide approximations").

### Error & loading state — shared, not per-card-isolated

- **D-16:** When `useMarsData().isLoading` is true (first mount only), every DataCard receives `state="loading"` and renders `<LoadingState />`. Section subtitles + source attribution remain visible. Tab is never blank.
- **D-17:** When `useMarsData().isError` is true, every DataCard receives `state="error"` and renders the canonical "Data temporarily unavailable" string. Tab heading, section subtitles, and source attribution remain visible. Per success criterion #4: "the tab never goes fully blank."
- **D-18:** **Silent background refetch:** during the 1-hour interval refetches, `isFetching` is true but `isLoading` is false. DataCards continue rendering prior values — no skeleton flash. Per success criterion #5: "refreshes silently in the background on a 1-hour cadence without blanking the UI."
- **D-19:** No retry button in v1. React Query's `retry: 3` default handles transient failures. Manual retry is a v2 UX consideration.

### Tooltip copy — verbatim from Discussion.md §5

- **D-20:** Tooltip copy for each Mars data point comes verbatim from the Discussion.md §5 table. Added to `src/constants/tooltips.js` under namespaced keys:
  - `mars.sol`, `mars.earthDate`, `mars.minTemp`, `mars.maxTemp`, `mars.pressure`, `mars.windSpeed`, `mars.humidity`, `mars.opacity`
- **D-21:** Each tooltip entry includes an optional `source` field set to `"MAAS2 / Curiosity REMS"` so DataCard's tooltip footer can display attribution per tooltip.
- **D-22:** The Phase 2 placeholder `mars.example` key is removed from `tooltips.js` if it's no longer referenced (the demo gallery is being replaced). If a stray reference exists, planner flags it.

### MarsTab.jsx replacement strategy

- **D-23:** Phase 3 fully replaces the body of `src/tabs/MarsTab.jsx`. The Phase 2 demo gallery is deleted — it served its purpose. The `<section role="tabpanel" aria-labelledby="tab-mars">` wrapper from Phase 1 is preserved (App.jsx and TabBar.jsx contracts haven't changed).
- **D-24:** No new top-level component; the data fetching happens in `MarsTab.jsx` via `useMarsData()`. Sub-components (e.g., `MarsSection`, `MarsHeader`) may be extracted by the planner if it improves clarity — Claude's discretion.

### Unit & formatting conventions

- **D-25:** Units are explicit and rendered through `DataCard`'s `unit` prop (Phase 2 contract):
  - Temperature: `°C`
  - Pressure: `Pa`
  - Wind: `m/s`
  - Humidity: `%`
  - Sol: no unit (the value is the day number)
  - Earth date: no unit
  - Opacity: no unit (categorical)
- **D-26:** Numeric formatting: integers for sol and pressure (Pa); one decimal for temperatures, wind speed, humidity. If MAAS2 returns null/undefined for a field, render em-dash via `DataCard`'s existing null-handling.
- **D-27:** Earth date is rendered as the raw `terrestrial_date` string from MAAS2 (format `YYYY-MM-DD`). Don't re-parse/reformat — the source is the source of truth.

### Claude's Discretion (planner & executor may decide)

- Exact section heading copy and visual spacing inside the responsive grid
- Whether to extract `MarsSection` / `MarsHeader` sub-components or keep MarsTab.jsx flat
- Number formatting helper location (inline in MarsTab.jsx vs `src/utils/formatters.js`) — `formatters.js` doesn't exist yet; create only if needed by Phase 4 too
- Whether to surface `isFetching` (background refetch) as a subtle UI cue (e.g., dimmed ring) or stay completely silent
- Test strategy — project has no test runner yet; planner may add Vitest if useful, otherwise rely on `npm run build` + visual UAT (Phase 1/2 pattern)

</decisions>

<specifics>
## Specific Ideas

- **MAAS2 raw payload shape** (per Discussion.md §5):
  ```json
  { "sol": 4521, "terrestrial_date": "2026-05-18", "min_temp": -82.0, "max_temp": -10.0,
    "pressure": 720, "wind_speed": 5.4, "humidity": 12, "atmo_opacity": "Sunny" }
  ```
  Field names match MAAS2 1:1; no remapping needed. (Planner should verify by hitting the live endpoint during research.)
- **Tooltip copy**: use the exact strings from Discussion.md §5 — they were authored deliberately for the educational layer. Don't rewrite.
- **Aesthetic anchor**: Phase 2's MarsTab demo gallery uses `palette="mars"` (amber-accent glow). Keep that visual language — Phase 3 should feel like the demo gallery "came alive" with real numbers, not like a new design.
- **No empty-state special case**: MAAS2 always returns a latest sol. If the API returns malformed/empty data, it's an error (D-17), not an empty state.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product spec & decisions
- `Discussion.md` §5 (Mars Tab — Data Panels) — Data points, units, tooltip copy, MAAS2 quirks
- `Discussion.md` §3 (Refresh Cadence Strategy) — 1h cadence for MAAS2, rationale
- `Discussion.md` §9 (API Quick Reference) — MAAS2 endpoint, no auth
- `CLAUDE.md` — Project guardrails: never invent data, env-var keys only, parse MAAS2 as JSON regardless of Content-Type

### Requirements (must-haves)
- `.planning/REQUIREMENTS.md` lines 58-68 — MARS-01..MARS-11 (one-line each)
- `.planning/REQUIREMENTS.md` traceability table lines 169-179 — Phase 3 mapping

### Roadmap
- `.planning/ROADMAP.md` — Phase 3 section: goal, depends-on, success criteria

### Prior-phase decisions (locked, do not re-litigate)
- `.planning/phases/02-shared-ui-primitives/02-CONTEXT.md` — Primitive contracts (DataCard / StatusBadge / AlertCard / LastUpdated / TooltipWrapper / LoadingState / useNow / tooltips.js)
- `.planning/phases/02-shared-ui-primitives/02-02-composite-primitives-SUMMARY.md` — Final composite primitive APIs as shipped
- `.planning/phases/01-scaffold-shell/01-02-shell-SUMMARY.md` — App.jsx / TabBar.jsx contracts; `role="tabpanel"` wrapper

### External APIs
- MAAS2: `https://api.maas2.apollorion.com/` — latest sol JSON; no auth; CORS-open; GH Pages may send wrong Content-Type
- MAAS2 (specific sol): `https://api.maas2.apollorion.com/{sol_number}` — not used in v1 but documented for v2 reference

### Library docs
- TanStack Query v5 — `useQuery`, `refetchInterval`, `refetchOnWindowFocus`, `dataUpdatedAt`, `isLoading` vs `isFetching` (planner: confirm v5 API; project uses `@tanstack/react-query@^5.100.10`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/DataCard.jsx` — Drop-in for all 9 numeric/categorical fields. State branching (ok/loading/error), tooltip composition, palette accent all done.
- `src/components/LastUpdated.jsx` — Drop-in per-card freshness chip; consume `useMarsData().dataUpdatedAt` and pass as `timestamp` prop.
- `src/components/TooltipWrapper.jsx` — Already wired through DataCard via `tooltipKey`. No direct consumer in MarsTab.
- `src/constants/tooltips.js` — Extend with `mars.*` keys; do not duplicate the file.
- `src/hooks/useNow.js` — Consumed transitively via LastUpdated; no direct use needed.
- TanStack Query is already configured in `src/main.jsx` (Phase 1 set up the QueryClientProvider).

### Established Patterns
- Tailwind palette tokens are extended in `tailwind.config.js` (`mars-*`, `moon-*`, `space-*`) — Phase 3 uses these directly; no new tokens.
- Per CLAUDE.md / Discussion.md: client-side fetch only; no proxy.
- Tab routing is state-only (no router); App.jsx mounts `<MarsTab />` when `activeTab === 'mars'`.
- Error display strings are canonical: "Data temporarily unavailable" (Phase 2 DataCard contract).

### Integration Points
- `src/tabs/MarsTab.jsx` — Existing file from Phase 1 (placeholder text) and Phase 2 (demo gallery). Phase 3 replaces its body.
- `src/hooks/` — Currently only `useNow.js`. Add `useMarsData.js` here.
- `src/constants/tooltips.js` — Extend the existing `TOOLTIPS` object with `mars.*` keys.
- `src/main.jsx` — QueryClientProvider already mounted; no changes expected.

</code_context>

<deferred>
## Deferred Ideas

- **Sol selector / historical-sol fetching** — MAAS2 supports `/{sol_number}` endpoint. Not in v1 scope. Add to backlog for a future "Mars history" milestone.
- **Sparklines / 7-sol min-max trends** — Visually appealing but requires multiple fetches per render. Phase 3 is single-sol only. Defer to v2 milestone.
- **Manual retry button** — If users find background-only retry frustrating in real use, add a small "Retry" link to error state in v2.
- **Perseverance MEDA / NASA PDS** — Documented in Discussion.md and PROJECT.md as v2 upgrade. PDS ingestion is its own milestone.
- **Source attribution as link** — Plain text in v1. Could link to NASA's Curiosity mission page in v2.
- **Test runner setup** — Project has no Vitest/Jest yet. If Phase 3 introduces enough logic (e.g., MAAS2 parse + formatters) to merit unit tests, planner may add Vitest; otherwise defer to Phase 5 (Polish).

</deferred>

---

*Phase: 03-mars-tab-surface-data*
*Context gathered: 2026-05-19*
