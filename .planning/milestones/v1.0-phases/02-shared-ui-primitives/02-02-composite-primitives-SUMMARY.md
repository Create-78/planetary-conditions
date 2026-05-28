---
phase: 02-shared-ui-primitives
plan: 02
subsystem: ui
tags: [ui, datacard, statusbadge, alertcard, lastupdated, composite, palette, severity, freshness]

# Dependency graph
requires:
  - phase: 02-shared-ui-primitives
    plan: 01
    provides: TooltipWrapper (portal-mounted), LoadingState (animate-pulse skeleton), useNow (shared 30s ticker), tooltips.js (flat TOOLTIPS + getTooltip accessor)
  - phase: 01-scaffold-shell
    provides: Tailwind palette tokens (mars-accent, moon-accent, space-900/950), default-export functional component pattern, ESM module type
provides:
  - DataCard — label-above-value workhorse with state branching (ok/loading/error), tooltip composition, palette accent + glow halo
  - StatusBadge — pill-shaped universal severity indicator (green/amber/red); NOT palette-tinted by design
  - AlertCard — compact horizontal event row with type-specific badge colors (indigo CME, orange FLR, fuchsia GST), UTC time, severity, optional info tooltip
  - LastUpdated — relative-time freshness indicator backed by shared useNow; absolute "HH:MM:SS UTC" in TooltipWrapper
affects: [03-mars-tab, 04-moon-tab]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Composite primitive pattern — single-element trigger wrapped in TooltipWrapper so cloneElement has one valid child
    - State-branched value-slot in DataCard (LoadingState | error-string | value+unit)
    - Universal-severity color contract (not palette-tinted) for cross-tab semantic consistency
    - Palette-tinted dim text (text-{mars,moon}-accent/70) for unit + LastUpdated affordances
    - Inline UTC time formatter using Intl `toLocaleString` with `timeZone: 'UTC'` for month name
    - Defensive `isNaN(d.getTime())` invalid-date guard returning em-dash / null

key-files:
  created:
    - src/components/DataCard.jsx
    - src/components/StatusBadge.jsx
    - src/components/AlertCard.jsx
    - src/components/LastUpdated.jsx
  modified: []

key-decisions:
  - "DataCard wraps value+unit in a single <span> so TooltipWrapper.cloneElement (which expects exactly one element) gets a valid trigger when tooltipKey is provided"
  - "DataCard renders em-dash '—' for null/undefined value in state='ok' rather than crashing — matches LastUpdated's null-timestamp glyph for visual consistency"
  - "StatusBadge severity color map is universal (green/amber/red) — explicitly NOT palette-tinted, per 02-CONTEXT semantic-vs-decorative split"
  - "AlertCard's info-icon trigger gets tabIndex=0 + role='button' so keyboard users get the same tooltip access mouse users do (TooltipWrapper attaches focus handlers)"
  - "LastUpdated does NOT wrap in TooltipWrapper when timestamp is null/undefined/invalid — showing an em-dash inside a tooltip would be a confusing no-op"
  - "Fallback color classes for unknown severity (StatusBadge) and unknown eventType (AlertCard) use slate so Phase 3/4 can extend without crashes"

patterns-established:
  - "Composite primitive: import Wave-1 dep + getTooltip → render branched value/state slot → conditionally wrap in TooltipWrapper"
  - "Universal-severity color tokens vs palette-tinted text — same project, two distinct conventions, documented in component headers"
  - "Inline date formatter helpers (formatUtc, formatRelative, formatAbsoluteUtc) live in the component file that needs them (no shared util) — they're a few lines, project is small"
  - "Empty-state copy lives in the consumer, not the primitive (AlertCard has no 'no events' fallback — DONKI hook will)"

requirements-completed: [UI-01, UI-03, UI-04, UI-05]

# Metrics
duration: 2.47min
completed: 2026-05-19
---

# Phase 2 Plan 2: Composite Primitives Summary

**Four composite primitives — DataCard (TooltipWrapper + LoadingState + tooltips.js + palette glow), StatusBadge (universal severity colors), AlertCard (event-type colors + UTC time), and LastUpdated (useNow + absolute UTC tooltip) — the user-visible layer Phase 3 (Mars) and Phase 4 (Moon) will mount against live data.**

## Performance

- **Duration:** ~2.5 min
- **Started:** 2026-05-19T12:52:03Z
- **Completed:** 2026-05-19T12:54:31Z
- **Tasks:** 2
- **Files created:** 4
- **Files modified:** 0

## Accomplishments

- DataCard composes the Wave-1 leaf primitives end-to-end: TooltipWrapper trigger, LoadingState skeleton in the value slot, getTooltip lookup, palette-driven accent ring + glow halo, em-dash null fallback. Three distinct state branches (`'ok' | 'loading' | 'error'`) each verified.
- StatusBadge ships universal severity colors (emerald/amber/red) per 02-CONTEXT's semantic-vs-palette split — severity reads identically on Mars and Moon tabs.
- AlertCard renders a compact horizontal row with type-specific badge colors (indigo CME, orange FLR, fuchsia GST), UTC clock time in `DD Mon HH:MM UTC` format, bold severity, optional description, optional info-icon tooltip with keyboard focus support.
- LastUpdated subscribes to the shared `useNow()` ticker, computes relative time (`just now` / `1 min ago` / `N mins ago` / `1 hour ago` / `N hours ago` / `1 day ago` / `N days ago`), and exposes absolute `HH:MM:SS UTC` via TooltipWrapper. Em-dash glyph for null/invalid timestamps (no tooltip in that case).
- `npm run build` passes (83 modules transformed, 0 errors). Tailwind JIT picks up all new utility classes (emerald, indigo, fuchsia presence confirmed in compiled CSS).
- No new npm dependencies. All four files import only `react` (transitively) plus project-local files.

## Task Commits

Each task was committed atomically on `main`:

1. **Task 1: DataCard composite primitive** — `24bfccd` (feat)
2. **Task 2: StatusBadge + AlertCard + LastUpdated** — `1909efb` (feat)

**Plan metadata commit:** *(appended at end of this plan execution)*

## Component Signatures

### `src/components/DataCard.jsx`

```jsx
function DataCard({
  label,       // string (required) — small annotation above the value
  value,       // string | number | ReactNode — focal text (ignored in non-ok states)
  unit,        // string (optional) — palette-tinted dim text after value
  tooltipKey,  // string (optional) — key into TOOLTIPS via getTooltip
  state,       // 'ok' | 'loading' | 'error' (default 'ok')
  palette,     // 'mars' | 'moon' (required) — drives accent ring + unit dim
})
```

**State branching:**
- `'loading'` → `<LoadingState />` in value slot, no unit, no tooltip
- `'error'` → exact string `"Data temporarily unavailable"` (text-sm text-slate-500 italic)
- `'ok'` → value + optional unit; if `tooltipKey` resolves, value+unit wrapped in `<TooltipWrapper>`

**Palette glow strings (verbatim from 02-CONTEXT, paste-protected):**
- mars: `ring-1 ring-[#f59e0b]/20 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_30px_-15px_rgba(245,158,11,0.25)]`
- moon: `ring-1 ring-[#cbd5e1]/20 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_30px_-15px_rgba(203,213,225,0.20)]`

**Base classes:** `relative flex flex-col gap-2 rounded-lg p-4 min-w-[140px] flex-shrink-0 bg-space-900/60 ring-1 ring-slate-800/60`

### `src/components/StatusBadge.jsx`

```jsx
function StatusBadge({
  severity,    // 'low' | 'moderate' | 'high' (required)
  label,       // string (optional) — text BEFORE the badge
  value,       // string (required) — text INSIDE the badge
  tooltipKey,  // string (optional) — wraps badge in TooltipWrapper
})
```

**Severity color map (universal, NOT palette-tinted):**
```js
{
  low:      'bg-emerald-700/40 text-emerald-200 ring-emerald-500/30',
  moderate: 'bg-amber-700/40 text-amber-200 ring-amber-500/30',
  high:     'bg-red-700/40 text-red-200 ring-red-500/30',
}
```

**Badge shape:** `rounded-full px-3 py-1 ring-1 text-xs font-medium uppercase tracking-wide`

### `src/components/AlertCard.jsx`

```jsx
function AlertCard({
  eventType,    // 'CME' | 'FLR' | 'GST' (extensible) — drives badge color
  timeUtc,      // ISO 8601 string — formatted as "DD Mon HH:MM UTC"
  severity,     // string — e.g. "M2.3", "G2", "Halo CME"
  description,  // string (optional) — short freeform context
  tooltipKey,   // string (optional) — for the info-icon explainer
})
```

**Event-type color map:**
```js
{
  CME: 'bg-indigo-700/40 text-indigo-200 ring-indigo-500/30',
  FLR: 'bg-orange-700/40 text-orange-200 ring-orange-500/30',
  GST: 'bg-fuchsia-700/40 text-fuchsia-200 ring-fuchsia-500/30',
}
// fallback: 'bg-slate-700/40 text-slate-200 ring-slate-500/30'
```

**Layout:** `<article className="flex items-center gap-3 rounded-md bg-space-900/60 ring-1 ring-slate-800/60 px-3 py-2">` with event badge, vertical stack (severity / UTC time / optional description), and optional `ml-auto`-pushed info-icon tooltip trigger (tabIndex=0 + role="button" for keyboard parity).

**Time formatter:** Inline `formatUtc(iso)` returns `DD Mon HH:MM UTC` using `Intl.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })`; returns `'—'` on null/invalid input.

### `src/components/LastUpdated.jsx`

```jsx
function LastUpdated({
  timestamp,   // Date | string | null | undefined
  prefix,      // string — default 'Last updated'
  palette,     // 'mars' | 'moon' | 'neutral' — default 'neutral'
})
```

**Palette → dim text color:**
```js
{
  mars:    'text-mars-accent/70',
  moon:    'text-moon-accent/70',
  neutral: 'text-slate-400',
}
```

**Relative formatter thresholds:**
- diff < 30s → `just now`
- diff < 90s → `1 min ago`
- diff < 60min → `N mins ago`
- diff < 24h → `1 hour ago` / `N hours ago`
- diff ≥ 24h → `1 day ago` / `N days ago`

**Absolute formatter:** `HH:MM:SS UTC` via padded `getUTCHours/Minutes/Seconds`.

**Null/invalid behavior:** Relative becomes `'—'`; absolute becomes `null`; component renders the label span unwrapped (no empty-tooltip).

## Dependency Graph (back to Plan 01)

```
                                ┌─────────────────────┐
                                │  src/constants/      │
                                │   tooltips.js        │  (Plan 01)
                                │   • TOOLTIPS         │
                                │   • getTooltip()     │
                                └─────────┬───────────┘
                                          │
              ┌───────────────────────────┼────────────────────────────┐
              │                           │                            │
              ▼                           ▼                            ▼
  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
  │  DataCard.jsx       │    │  StatusBadge.jsx    │    │  AlertCard.jsx      │
  │  (Plan 02)          │    │  (Plan 02)          │    │  (Plan 02)          │
  └──────┬──────────────┘    └──────┬──────────────┘    └──────┬──────────────┘
         │                          │                          │
         │     ┌────────────────────┴──────────────────────────┘
         │     │
         ▼     ▼
  ┌─────────────────────┐         ┌─────────────────────┐
  │  TooltipWrapper.jsx │         │  LoadingState.jsx   │
  │  (Plan 01)          │◀────────│  (Plan 01)          │
  │  • portal + flip    │         │  • animate-pulse    │
  └─────────────────────┘         └─────────────────────┘

  ┌─────────────────────┐         ┌─────────────────────┐
  │  LastUpdated.jsx    │────────▶│  useNow.js          │
  │  (Plan 02)          │         │  (Plan 01)          │
  │  • relative + UTC   │         │  • shared 30s ticker│
  └──────┬──────────────┘         └─────────────────────┘
         │
         ▼
  ┌─────────────────────┐
  │  TooltipWrapper.jsx │
  │  (Plan 01)          │
  └─────────────────────┘
```

## Files Created/Modified

- `src/components/DataCard.jsx` — Composite workhorse. Composes TooltipWrapper + LoadingState + getTooltip. State-branched value slot. Palette-driven accent ring + glow halo. Em-dash null fallback.
- `src/components/StatusBadge.jsx` — Pill-shaped universal severity indicator. Three Tailwind class strings for low/moderate/high. Optional tooltip wrap. Slate fallback for unknown severity.
- `src/components/AlertCard.jsx` — Compact horizontal event row. Inline `formatUtc` helper. Type-specific badge colors (CME/FLR/GST + slate fallback). Optional info-icon tooltip with keyboard focus support.
- `src/components/LastUpdated.jsx` — Shared-ticker freshness indicator. Inline `formatRelative` + `formatAbsoluteUtc` helpers. Palette-tinted dim text. No tooltip wrap when timestamp is null/invalid.

## Decisions Made

- **Severity colors are universal, palette colors are decorative.** StatusBadge severity always reads as green/amber/red regardless of tab — semantic meaning must not depend on which planetary body is active. Body palette (mars/moon) stays reserved for tab indicators, DataCard accent rings, and dim-text affordances on LastUpdated/unit.
- **AlertCard's info-icon is fully keyboard-accessible.** Added `tabIndex={0}` and `role="button"` so screen reader / keyboard users get the same tooltip access mouse users do. TooltipWrapper attaches focus handlers, so this turns into a real interactive affordance.
- **LastUpdated skips the tooltip wrap when timestamp is invalid.** Wrapping an em-dash in a tooltip would create a confusing no-op affordance (hover → empty tooltip). Better UX: just render the dash. This also means TooltipWrapper's "falsy content passes children through" path isn't relied on for this case — we make the structural decision in LastUpdated itself.
- **Inline date helpers, no shared util module.** `formatUtc`, `formatRelative`, `formatAbsoluteUtc` are short, file-local, and have no foreseeable second consumer outside their respective components. Extracting them to a shared `lib/time.js` would be premature abstraction for v1.
- **Slate fallback for unknown severity / eventType.** Phase 3/4 may pass values from API data that don't match the seeded set (e.g. a new DONKI event type). Falling back to slate keeps the UI rendering instead of crashing on `undefined.classes`.
- **DataCard accumulates classes via string concatenation, not a className helper.** Two palette branches, one base string — `clsx`/`classnames` would add a dep for no real benefit. The 02-CONTEXT lock on "no new npm dependencies" makes this the only sensible choice.

## Deviations from Plan

None — plan executed exactly as written. All four files match the plan signatures, the verification block, and the success criteria. No deviation rules (1, 2, 3, or 4) triggered.

## Issues Encountered

None.

## Self-Check

- `src/components/DataCard.jsx`: FOUND
- `src/components/StatusBadge.jsx`: FOUND
- `src/components/AlertCard.jsx`: FOUND
- `src/components/LastUpdated.jsx`: FOUND
- Commit `24bfccd`: present in `git log`
- Commit `1909efb`: present in `git log`
- Plan end-to-end verification block:
  - All 4 component files import TooltipWrapper — PASS
  - LastUpdated imports useNow — PASS
  - DataCard / StatusBadge / AlertCard import getTooltip — PASS
  - StatusBadge severity ring count = 3 — PASS
  - AlertCard event-type ring count = 3 — PASS
- `npm run build` passes (83 modules, 0 errors); Tailwind JIT compiled emerald/indigo/fuchsia utilities into CSS bundle.

## Self-Check: PASSED

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The Phase 2 primitive library is now complete: TooltipWrapper, LoadingState, useNow, tooltips.js (Plan 01) + DataCard, StatusBadge, AlertCard, LastUpdated (Plan 02).
- Plan 03 (demo gallery wiring inside MarsTab/MoonTab) is unblocked and can compose all four composite primitives against mock props for the visual checkpoint.
- Phase 3 (Mars) and Phase 4 (Moon) live-data wiring can target these stable component contracts directly — no further primitive work needed.

---
*Phase: 02-shared-ui-primitives*
*Completed: 2026-05-19*
