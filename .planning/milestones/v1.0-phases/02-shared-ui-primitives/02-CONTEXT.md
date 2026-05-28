# Phase 2: Shared UI Primitives — Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** Auto-discuss (session-wide "no clarifying questions" instruction). Synthesized from Discussion.md §2, §5, §6, Phase 1 codebase patterns, and ROADMAP.md Phase 2 success criteria.

<domain>
## Phase Boundary

Build the **shared component library** that every data panel in Phases 3 and 4 will consume. The primitives are: `DataCard`, `TooltipWrapper`, `StatusBadge`, `AlertCard`, `LastUpdated`, `LoadingState`, plus the canonical tooltip-copy source-of-truth (`src/constants/tooltips.js`).

This phase ships **no live data wiring** — only the components, with deterministic prop-driven demo states. Phase 3 (Mars) and Phase 4 (Moon) will mount these against live React Query hooks.

**Carrying forward from Phase 1:**
- Tech stack locked: React 18 + Vite + Tailwind 3 + TanStack Query (already wired).
- Tailwind color tokens already shipped: `mars-{500-900,accent}`, `moon-{400-900,accent}`, `space-{900,950}`. **Use these tokens — do not introduce new palette tokens.**
- Inter font is the app-wide default via `body { font-family }` in `src/index.css`.
- State-only rendering pattern (no router) — primitives are pure components driven by props.
- `src/components/` already houses `TabBar.jsx` and `StarField.jsx` — new primitives live alongside them.
- `src/constants/` already houses `tabs.js` — `tooltips.js` lives alongside.

</domain>

<decisions>
## Implementation Decisions

### Component API shape — DataCard

- **Layout:** Label above, value below. Large numeric/categorical value as the visual focal point. Unit immediately to the right of the value (smaller, dimmer).
- **Props:** `label` (string), `value` (string | number | ReactNode), `unit` (string, optional), `tooltipKey` (string, optional, looks up in `tooltips.js`), `state` ("loading" | "error" | "ok", default "ok"), `palette` ("mars" | "moon", required — drives accent color).
- **Sizing:** Fixed minimum width; flex-shrink-0; grids wrap on narrow viewports.
- **Why not label-side-of-value:** Discussion.md §2 calls for a "glowing data panel aesthetic — NASA control room meets The Expanse." Large values dominate; labels read as quiet annotations. Top-label pattern matches.

### Tooltip approach — TooltipWrapper

- **Library:** **No external library.** Custom React component using a portal + delay-on-hover + ESC-to-dismiss + click-outside. Keep the bundle lean.
- **Why not Radix UI Tooltip:** Adds ~12 kB gzipped for one component. Phase 2's tooltip needs (hover-only, single-trigger, plain text with optional rich content) are simple enough for a custom solution. If we later need keyboard nav across multiple tooltip groups or popover composition, Radix can be added incrementally.
- **Accessibility:** Tooltip element gets `role="tooltip"` and an `aria-describedby` link from the trigger. Keyboard users get the same content via `focus` event (same as hover).
- **Position:** Above the trigger by default; flips below if it would clip the viewport. Use a simple `getBoundingClientRect()` check, not a positioning library.
- **Delay:** 150ms open, 0ms close. Long enough to feel intentional, fast enough to not feel laggy.
- **Trigger pattern:** `<TooltipWrapper content={...}>{trigger}</TooltipWrapper>`. `trigger` can be any element — the wrapper attaches handlers without adding DOM.

### Tooltip copy source-of-truth — constants/tooltips.js

- **Structure:** Flat object keyed by stable string IDs, namespaced by tab/source: `mars.pressure`, `mars.opacity`, `swpc.bz`, `swpc.kp`, `donki.cme`, `lunar.phase`, etc.
- **Value:** Plain object `{ text: "...", source: "MAAS2 / REMS" }` so the same `tooltips[id]` can render the explainer text AND attribution if needed (DataCard renders `text`; the source is optional and used by Mars-tab attribution).
- **Earth-anchored:** Every tooltip should anchor the value against Earth where it aids understanding (e.g., "0.6% of Earth's atmospheric pressure").
- **Locked tooltips for Phase 2:** Seed `tooltips.js` with **placeholder content** for the keys used by the demo states in this phase. Real Mars/Moon tooltip copy will be authored in Phase 3 and Phase 4. **Keys to seed in this phase (placeholders are fine):** at minimum two example keys so DataCard's storybook-like demo renders end-to-end.
- **Why flat, not nested:** Lookups are O(1) and refactoring keys is grep-friendly. Nesting saves nothing once you have 20+ keys.

### Status badge — StatusBadge

- **Severity mapping (universal, not palette-dependent):**
  - "Low" → green (`bg-emerald-700/40 text-emerald-200 ring-emerald-500/30`)
  - "Moderate" → amber (`bg-amber-700/40 text-amber-200 ring-amber-500/30`)
  - "High" → red (`bg-red-700/40 text-red-200 ring-red-500/30`)
- **Why universal, not body-palette:** Severity is a semantic signal that must read consistently across tabs. A "High" radiation warning on the Moon tab in moon-silver would be ambiguous. Reserve the body palette for the active tab indicator + accent borders, not status semantics.
- **Props:** `severity` ("low" | "moderate" | "high"), `label` (string — e.g., "Radiation Risk"), `value` (string — the label shown inside the badge, e.g., "Moderate"). Optional `tooltipKey`.
- **Shape:** Pill — `rounded-full px-3 py-1 ring-1 text-xs font-medium uppercase tracking-wide`.

### Alert card — AlertCard

- **Layout:** Horizontal — event-type badge on the left, then a vertical stack of UTC time (small, dim) + severity/class (bold, prominent) + a short description. Optional info icon at right opens the tooltip explaining what the event type means.
- **Density:** Compact. AlertCard is rendered inside a scrollable list (last 7 days of events). 3–8 items typical; layout must not waste vertical space.
- **Props:** `eventType` ("CME" | "FLR" | "GST" — extensible), `timeUtc` (ISO 8601 string), `severity` (string — e.g., "M2.3", "G2", "Halo CME"), `description` (string, optional), `tooltipKey` (string, optional).
- **Event-type badge palette:** Use neutral colors so the visual signal is the severity, not the badge:
  - CME → indigo (`bg-indigo-700/40 text-indigo-200 ring-indigo-500/30`)
  - FLR (Solar Flare) → orange (`bg-orange-700/40 text-orange-200 ring-orange-500/30`)
  - GST (Geomagnetic Storm) → fuchsia (`bg-fuchsia-700/40 text-fuchsia-200 ring-fuchsia-500/30`)
- **Empty state copy:** Lives in the DONKI feature later, NOT in AlertCard. AlertCard renders one item; the consumer handles the "no events" message per Discussion.md §4c.

### LastUpdated — freshness indicator

- **Display:** Relative ("3 mins ago", "just now", "5 hours ago") with absolute UTC ("21:00:00 UTC") shown in a hover tooltip.
- **Update frequency:** Re-render every 30 seconds via a shared `useNow()` hook (single `setInterval` for the whole tree, not one per `LastUpdated` instance) so 10 cards on screen don't drift.
- **Props:** `timestamp` (Date | ISO 8601 string | null/undefined for "never updated"), `prefix` (string, default "Last updated"), `palette` ("mars" | "moon" | "neutral", optional — drives the dim text color).
- **Null/undefined timestamp:** Render "—" (em-dash) instead of an error or "never". Phase 3/4 hooks pass `data?.timestamp` and on first load this will be undefined — the dash is the loading state.
- **Why relative + absolute combo:** Discussion.md §2 says "Last updated: X minutes ago OR exact UTC timestamp." Doing both (relative primary, absolute on hover) satisfies both. No setting needed.

### Loading state — LoadingState

- **Style:** Tailwind `animate-pulse` on a neutral-gray skeleton block matching the DataCard's intrinsic size. No shimmer animation (more polish-work for marginal benefit in v1).
- **Composition:** `<DataCard state="loading" ...>` renders `<LoadingState />` internally — callers don't import `LoadingState` separately for the common case. But it is exported for any custom non-DataCard usage (e.g., AlertCard list skeleton).
- **Per-card independence:** Each DataCard owns its own loading state — no global "is anything loading" indicator. Discussion.md §6 explicitly: "Each data card should show a skeleton loader independently — don't block the whole tab on one API call."

### Error state — embedded in DataCard, not a separate component

- **Display:** "Data temporarily unavailable" as the value, dim/muted styling, no big alert chrome. Discussion.md §6 says "If an API fails, show 'Data temporarily unavailable' per card, not a full-page error."
- **Trigger:** `<DataCard state="error" />` passes through. No separate `ErrorCard` component.
- **No retry button in v1:** React Query handles retries silently with stale-while-revalidate; surfacing a manual retry would compete with the auto-refresh cadence and confuse users.

### Visual conventions — body-palette accent application

- **Mars tab accent:** `mars-accent` (amber `#f59e0b`) for active borders, glowing focus rings, key value highlights. Base panel background remains `space-900` / `space-950`. Mars-* reds are reserved for the tab indicator and large hero highlights, not every card.
- **Moon tab accent:** `moon-accent` (silver `#cbd5e1`) for active borders, glowing focus rings, dim type. Base panel background same `space-*` family.
- **DataCard palette prop:** `palette="mars"` and `palette="moon"` — drives only the accent ring color and the unit-text dim color. Background stays neutral so cards read consistently across tabs.

### Glow / cinematic effects

- **Subtle box-shadow:** Each DataCard gets `shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_30px_-15px_rgba(245,158,11,0.25)]` (or moon equivalent — `rgba(203,213,225,0.20)`). Almost-invisible inner ring + a soft outer halo in the body's accent color. Drives the "NASA control room glow" without being garish.
- **No motion in Phase 2:** No on-mount fades, no hover lifts, no value-change pulses. Phase 5 (Polish) can layer in motion if needed. Static cards are correctness-first.

### File structure

```
src/
├── components/
│   ├── TabBar.jsx              (already exists from Phase 1)
│   ├── StarField.jsx           (already exists from Phase 1)
│   ├── DataCard.jsx            ← new
│   ├── TooltipWrapper.jsx      ← new
│   ├── StatusBadge.jsx         ← new
│   ├── AlertCard.jsx           ← new
│   ├── LastUpdated.jsx         ← new
│   └── LoadingState.jsx        ← new
├── constants/
│   ├── tabs.js                 (already exists)
│   └── tooltips.js             ← new (seeded with a few example keys; filled in Phase 3/4)
├── hooks/
│   └── useNow.js               ← new (shared 30s ticker for LastUpdated)
└── tabs/
    ├── MarsTab.jsx             (placeholder from Phase 1 — update to render a demo gallery of primitives)
    └── MoonTab.jsx             (placeholder from Phase 1 — same)
```

### Demo / verification approach (this phase ships no live data)

- **Update MarsTab.jsx and MoonTab.jsx** to render a small **demo gallery** of every primitive with mock props. This gives the visual checkpoint a concrete page to look at and gives later phases a working reference of how to compose primitives.
- **What the demos show:**
  - `DataCard` in ok / loading / error states, with and without tooltip
  - `StatusBadge` in low / moderate / high
  - `AlertCard` for CME, FLR, GST with sample dates
  - `LastUpdated` with: just now, 3 mins ago, 2 hours ago, undefined
- **Phase 3/4 will REPLACE these demo galleries** with real data wiring. The demo content is intentional scaffolding, not waste.

### Claude's Discretion (no decision needed from user)

- Exact px values for padding, gap, border-radius — pick consistent values within Tailwind's scale (`p-4`, `gap-3`, `rounded-lg`).
- Z-index stacking for the tooltip portal (a single layer above content is enough).
- Naming of internal helper functions inside each component.
- Whether to use named exports vs default exports (project convention from Phase 1: default exports).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product / design spec
- `Discussion.md` — full canonical spec; especially §2 (Design Decisions), §4 (data panels — informs DataCard structure), §5 (Component Architecture — file layout), §6 (Key UX Details — loading/error/timestamp/empty-state rules)

### Project planning
- `.planning/PROJECT.md` — core value, constraints
- `.planning/REQUIREMENTS.md` — UI-01..UI-07 with traceability
- `.planning/ROADMAP.md` — Phase 2 goal + success criteria

### Phase 1 outputs (build on these)
- `.planning/phases/01-scaffold-shell/01-01-scaffold-SUMMARY.md` — what's already scaffolded (Tailwind tokens, env accessor, QueryClient)
- `.planning/phases/01-scaffold-shell/01-02-shell-SUMMARY.md` — App.jsx, TabBar, StarField patterns to extend
- `tailwind.config.js` — `mars-*`, `moon-*`, `space-*` palette tokens
- `src/components/TabBar.jsx` — established component pattern (default export, props-driven, semantic ARIA)
- `src/index.css` — global font + bg conventions

### External (no specs/ADRs in this project yet)

No external library docs need to be canonical for Phase 2 — the primitives are built with plain React + Tailwind, no new dependencies.

</canonical_refs>

<specifics>
## Specific Ideas

- **Tooltip example for the demo gallery:** seed `mars.example` → `"Mars' atmosphere is about 0.6% as dense as Earth's — too thin to breathe, thick enough to drive dust storms."` (this is from Discussion.md §4 — using it as the placeholder demonstrates the Earth-anchored style we want for real copy later).
- **AlertCard sample event for the demo:** Use a fictional but plausible CME entry with severity "Halo CME" and a UTC time from "3 hours ago" — this lets the demo prove both the layout AND the `LastUpdated` integration in one shot.
- **Radiation Risk badge example:** "Moderate" — sits between Low (most common) and High (alarming). Good middle-state demo.

</specifics>

<deferred>
## Deferred Ideas

- **Motion / animations** — value-change pulses, on-mount fades, tab-transition glows. Phase 5 (Reliability & UX Polish) territory.
- **Real tooltip copy for every data point** — Mars panels in Phase 3, Moon panels in Phase 4. Phase 2 only seeds placeholders.
- **Radix UI Tooltip migration** — only if a future phase needs popover composition or complex keyboard nav. Not a v1 concern.
- **Shimmer animation on loading skeletons** — Phase 5 polish if static pulse feels too dead.
- **Manual retry buttons on error states** — explicitly deferred (Discussion.md §6 + React Query stale-while-revalidate makes this unnecessary in v1).
- **Earth comparison mode as a UI panel** — already in PROJECT.md's Out of Scope; tooltips are the Earth-anchor surface.

</deferred>

---

*Phase: 02-shared-ui-primitives*
*Context gathered: 2026-05-15 via auto-discuss (no-questions session instruction)*
