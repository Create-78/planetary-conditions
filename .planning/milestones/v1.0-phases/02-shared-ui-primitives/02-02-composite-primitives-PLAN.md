---
phase: 02-shared-ui-primitives
plan: 02
type: execute
wave: 2
depends_on:
  - 02-01
files_modified:
  - src/components/DataCard.jsx
  - src/components/StatusBadge.jsx
  - src/components/AlertCard.jsx
  - src/components/LastUpdated.jsx
autonomous: true
requirements:
  - UI-01
  - UI-03
  - UI-04
  - UI-05
tags: [ui, datacard, badge, alertcard, lastupdated, composite]

must_haves:
  truths:
    - "DataCard renders label-above-value layout with optional unit and tooltip trigger"
    - "DataCard with state='loading' renders the LoadingState skeleton inline (no neighbour blanks)"
    - "DataCard with state='error' renders 'Data temporarily unavailable' as muted value text"
    - "StatusBadge renders one of three universal severity colors: green (low), amber (moderate), red (high)"
    - "AlertCard renders event-type badge with type-specific color (indigo CME, orange FLR, fuchsia GST), UTC time, and severity"
    - "LastUpdated renders 'X mins ago' relative format with absolute UTC in a tooltip"
    - "LastUpdated re-renders every 30s via useNow without per-instance timers"
  artifacts:
    - path: "src/components/DataCard.jsx"
      provides: "Label/value/unit data card with loading + error states, tooltip trigger, palette accent"
      exports: ["default"]
    - path: "src/components/StatusBadge.jsx"
      provides: "Pill-shaped universal severity badge (low/moderate/high)"
      exports: ["default"]
    - path: "src/components/AlertCard.jsx"
      provides: "Horizontal event card with type badge, UTC time, severity"
      exports: ["default"]
    - path: "src/components/LastUpdated.jsx"
      provides: "Freshness indicator (relative + absolute UTC tooltip), uses useNow"
      exports: ["default"]
  key_links:
    - from: "src/components/DataCard.jsx"
      to: "src/components/TooltipWrapper.jsx"
      via: "import + JSX composition when tooltipKey prop is present"
      pattern: "from ['\"].*TooltipWrapper"
    - from: "src/components/DataCard.jsx"
      to: "src/components/LoadingState.jsx"
      via: "import + render when state=='loading'"
      pattern: "from ['\"].*LoadingState"
    - from: "src/components/DataCard.jsx"
      to: "src/constants/tooltips.js"
      via: "getTooltip(tooltipKey) lookup"
      pattern: "getTooltip"
    - from: "src/components/LastUpdated.jsx"
      to: "src/hooks/useNow.js"
      via: "useNow() subscription"
      pattern: "useNow"
---

<objective>
Build the four composite Phase 2 primitives that consume the Wave 1 foundation: DataCard (the workhorse — composes TooltipWrapper + LoadingState + tooltips.js + palette accent), StatusBadge (universal severity colors), AlertCard (event-type colors + UTC time + severity), and LastUpdated (relative time using useNow + absolute UTC tooltip).

Purpose: Ship the four user-visible primitives that Phase 3 (Mars) and Phase 4 (Moon) will consume directly. Every visual decision is locked in 02-CONTEXT.md — this plan executes them with no re-deciding.

Output: 4 new files under `src/components/`. No modifications to Plan 01's foundation files.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-shared-ui-primitives/02-CONTEXT.md
@.planning/phases/02-shared-ui-primitives/02-01-foundation-primitives-SUMMARY.md
@Discussion.md
@tailwind.config.js
@src/components/TabBar.jsx
@src/components/TooltipWrapper.jsx
@src/components/LoadingState.jsx
@src/hooks/useNow.js
@src/constants/tooltips.js

<interfaces>
<!-- From Plan 01 (Wave 1 outputs) — use these directly, do not re-derive -->

`src/components/TooltipWrapper.jsx`:
```jsx
// Default export
function TooltipWrapper({ content, children, side = 'top' })
// content: string | ReactNode (falsy => children rendered unchanged)
// children: single React element (the trigger)
// side: 'top' | 'bottom' (auto-flips if clipped)
```

`src/components/LoadingState.jsx`:
```jsx
// Default export
function LoadingState({ className = '' })
// Renders animate-pulse div sized h-8 w-24 by default
```

`src/hooks/useNow.js`:
```jsx
// Named export
export function useNow(): Date
// Returns current Date; re-renders consumer every 30s via shared interval
```

`src/constants/tooltips.js`:
```jsx
// Named exports
export const TOOLTIPS // { [key]: { text: string, source?: string } }
export function getTooltip(key): { text, source } | null
// Seeded keys: 'mars.example', 'moon.example', 'swpc.radiationRisk', 'donki.cme'
```

<!-- Palette tokens (from tailwind.config.js — DO NOT introduce new ones) -->
- `mars-accent` = `#f59e0b` (used for DataCard palette="mars" accent ring + unit dim)
- `moon-accent` = `#cbd5e1` (used for DataCard palette="moon" accent ring + unit dim)
- `space-{900,950}` for backgrounds
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build DataCard (composes TooltipWrapper + LoadingState + tooltips.js, with palette accent + glow)</name>
  <files>src/components/DataCard.jsx</files>
  <read_first>
    - .planning/phases/02-shared-ui-primitives/02-CONTEXT.md (LOCKED — `## Component API shape — DataCard`, `## Error state — embedded in DataCard`, `## Visual conventions`, `## Glow / cinematic effects`)
    - .planning/phases/02-shared-ui-primitives/02-01-foundation-primitives-SUMMARY.md (exact TooltipWrapper / LoadingState / getTooltip signatures from Wave 1)
    - Discussion.md (§2 cinematic aesthetic; §4 data panel structure; §6 error state copy)
    - src/components/TabBar.jsx (functional + default-export pattern)
    - src/components/TooltipWrapper.jsx (the import target)
    - src/components/LoadingState.jsx (the import target)
    - src/constants/tooltips.js (the source-of-truth for tooltipKey lookups)
  </read_first>
  <action>
    Create `src/components/DataCard.jsx`. Default export at bottom. Functional component.

    **Signature (per 02-CONTEXT.md `## Component API shape — DataCard`):**
    ```jsx
    function DataCard({ label, value, unit, tooltipKey, state = 'ok', palette })
    ```
    - `label`: string (required) — the small annotation above the value
    - `value`: string | number | ReactNode — the focal-point value (ignored when state is loading/error)
    - `unit`: string | undefined — rendered to the right of value, smaller and dimmer
    - `tooltipKey`: string | undefined — looked up via `getTooltip(tooltipKey)` from `src/constants/tooltips.js`
    - `state`: `'ok' | 'loading' | 'error'` (default `'ok'`)
    - `palette`: `'mars' | 'moon'` (required) — drives accent only

    **Imports:**
    ```jsx
    import TooltipWrapper from './TooltipWrapper.jsx'
    import LoadingState from './LoadingState.jsx'
    import { getTooltip } from '../constants/tooltips.js'
    ```

    **Layout (label-above-value per CONTEXT):**
    - Outer `<div>` with classes (compose all into one className string):
      - Base: `relative flex flex-col gap-2 rounded-lg p-4 min-w-[140px] flex-shrink-0 bg-space-900/60 ring-1 ring-slate-800/60`
      - Palette accent ring (concat based on `palette` prop):
        - mars: append ` ring-1 ring-[#f59e0b]/20 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_30px_-15px_rgba(245,158,11,0.25)]`
        - moon: append ` ring-1 ring-[#cbd5e1]/20 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_30px_-15px_rgba(203,213,225,0.20)]`
      - These exact box-shadow strings come from 02-CONTEXT.md `## Glow / cinematic effects`. Paste verbatim.
    - Label row: `<span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>`
    - Value row: a flex baseline row containing:
      - Value text (or skeleton, or error string — see below)
      - Unit text (only when state==='ok' AND unit truthy): `<span className="text-base text-slate-500 ml-1">{unit}</span>` for palette neutrality, OR use palette-tinted: for `palette==='mars'` use `text-mars-accent/70 ml-1`, for `palette==='moon'` use `text-moon-accent/70 ml-1`. Pick the palette-tinted version per CONTEXT `## Visual conventions` ("unit-text dim color" driven by palette).

    **State branching:**
    - `state === 'loading'`: render `<LoadingState />` in the value slot. No unit shown. No tooltip wrapper.
    - `state === 'error'`: render the literal string `"Data temporarily unavailable"` in the value slot with className `text-sm text-slate-500 italic`. No unit shown. No tooltip wrapper. (Per 02-CONTEXT.md `## Error state — embedded in DataCard`.)
    - `state === 'ok'`: render the `value` prop as the focal text — `text-3xl font-semibold text-slate-100` (large, bright), followed by the unit span. If `tooltipKey` is truthy AND `getTooltip(tooltipKey)` returns non-null, wrap the value+unit span with `<TooltipWrapper content={getTooltip(tooltipKey).text}>...</TooltipWrapper>` so the value itself is the tooltip trigger. If `tooltipKey` is null/undefined or the lookup returns null, render the value+unit unwrapped (no tooltip).

    **Edge cases:**
    - If `value` is `null` or `undefined` (and state is `'ok'`), render an em-dash `"—"` instead of crashing.
    - The tooltip trigger element passed to `TooltipWrapper` must be a single React element (since TooltipWrapper uses `cloneElement`). Wrap value+unit in a single `<span>` so the trigger is one element.

    **Do NOT introduce motion**, hover lifts, or value-change pulses — Phase 2 is static (per CONTEXT `## Glow / cinematic effects > No motion in Phase 2`).
  </action>
  <verify>
    <automated>test -f src/components/DataCard.jsx && grep -q "export default DataCard" src/components/DataCard.jsx && grep -q "from './TooltipWrapper" src/components/DataCard.jsx && grep -q "from './LoadingState" src/components/DataCard.jsx && grep -q "getTooltip" src/components/DataCard.jsx && grep -q "Data temporarily unavailable" src/components/DataCard.jsx && grep -qE "state === ['\"]loading['\"]" src/components/DataCard.jsx && grep -qE "state === ['\"]error['\"]" src/components/DataCard.jsx && grep -q "rgba(245,158,11,0.25)" src/components/DataCard.jsx && grep -q "rgba(203,213,225,0.20)" src/components/DataCard.jsx</automated>
  </verify>
  <done>
    - `src/components/DataCard.jsx` exists with default export.
    - Imports `TooltipWrapper`, `LoadingState`, and `getTooltip`.
    - Branches on `state` prop with all three values (`'ok'`, `'loading'`, `'error'`) producing distinct output.
    - Error state renders the exact string `"Data temporarily unavailable"`.
    - Loading state renders `<LoadingState />`.
    - Ok state with `tooltipKey` wraps the value in `<TooltipWrapper content=...>`.
    - Mars and moon glow box-shadow strings present verbatim (verified by RGB literals).
    - No motion utilities used (no `transition-`, `animate-`, except `animate-pulse` lives only in LoadingState).
  </done>
</task>

<task type="auto">
  <name>Task 2: Build StatusBadge (universal severity), AlertCard (event-type colors + UTC time), and LastUpdated (relative + UTC tooltip via useNow)</name>
  <files>src/components/StatusBadge.jsx, src/components/AlertCard.jsx, src/components/LastUpdated.jsx</files>
  <read_first>
    - .planning/phases/02-shared-ui-primitives/02-CONTEXT.md (LOCKED — `## Status badge — StatusBadge`, `## Alert card — AlertCard`, `## LastUpdated`)
    - .planning/phases/02-shared-ui-primitives/02-01-foundation-primitives-SUMMARY.md (TooltipWrapper signature, useNow signature)
    - Discussion.md (§2 design decisions; §4 data panel structures — DONKI alert cards specifically)
    - src/components/TooltipWrapper.jsx (import target)
    - src/hooks/useNow.js (import target)
    - src/constants/tooltips.js (for getTooltip lookups when tooltipKey is provided)
  </read_first>
  <action>
    Create three new files. Each default-exports a functional component.

    ---

    **File 1: `src/components/StatusBadge.jsx`**

    Per 02-CONTEXT.md `## Status badge — StatusBadge`. **Universal severity colors — NOT body-palette.**

    Signature: `function StatusBadge({ severity, label, value, tooltipKey })`
    - `severity`: `'low' | 'moderate' | 'high'` (required)
    - `label`: string — the text BEFORE the badge (e.g., `"Radiation Risk:"`). Optional — if absent, only badge renders.
    - `value`: string — text inside the badge (e.g., `"Moderate"`). Required.
    - `tooltipKey`: string | undefined — wraps the badge in TooltipWrapper if a lookup returns non-null.

    Imports:
    ```jsx
    import TooltipWrapper from './TooltipWrapper.jsx'
    import { getTooltip } from '../constants/tooltips.js'
    ```

    Color mapping (paste verbatim from CONTEXT):
    ```js
    const SEVERITY_CLASSES = {
      low: 'bg-emerald-700/40 text-emerald-200 ring-emerald-500/30',
      moderate: 'bg-amber-700/40 text-amber-200 ring-amber-500/30',
      high: 'bg-red-700/40 text-red-200 ring-red-500/30',
    }
    ```

    Render structure:
    - Outer `<span className="inline-flex items-center gap-2">`
    - If `label`: `<span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>`
    - Badge `<span>` with className `rounded-full px-3 py-1 ring-1 text-xs font-medium uppercase tracking-wide ${SEVERITY_CLASSES[severity]}` containing `{value}`.
    - If `tooltipKey && getTooltip(tooltipKey)`, wrap the badge `<span>` in `<TooltipWrapper content={getTooltip(tooltipKey).text}>`.

    ---

    **File 2: `src/components/AlertCard.jsx`**

    Per 02-CONTEXT.md `## Alert card — AlertCard`. Compact horizontal row.

    Signature: `function AlertCard({ eventType, timeUtc, severity, description, tooltipKey })`
    - `eventType`: `'CME' | 'FLR' | 'GST'` (extensible) — controls badge color
    - `timeUtc`: ISO 8601 string — formatted as UTC clock time
    - `severity`: string — e.g., `"M2.3"`, `"G2"`, `"Halo CME"`
    - `description`: string | undefined — short freeform context
    - `tooltipKey`: string | undefined — for the info icon explainer

    Imports:
    ```jsx
    import TooltipWrapper from './TooltipWrapper.jsx'
    import { getTooltip } from '../constants/tooltips.js'
    ```

    Event-type color mapping (paste verbatim from CONTEXT `## Alert card > Event-type badge palette`):
    ```js
    const EVENT_CLASSES = {
      CME: 'bg-indigo-700/40 text-indigo-200 ring-indigo-500/30',
      FLR: 'bg-orange-700/40 text-orange-200 ring-orange-500/30',
      GST: 'bg-fuchsia-700/40 text-fuchsia-200 ring-fuchsia-500/30',
    }
    ```
    Fallback for unknown eventType: `'bg-slate-700/40 text-slate-200 ring-slate-500/30'`.

    Time formatting helper (inline in this file — keep it simple):
    ```js
    function formatUtc(iso) {
      if (!iso) return '—'
      const d = new Date(iso)
      if (isNaN(d.getTime())) return '—'
      const hh = String(d.getUTCHours()).padStart(2, '0')
      const mm = String(d.getUTCMinutes()).padStart(2, '0')
      const dd = String(d.getUTCDate()).padStart(2, '0')
      const mon = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
      return `${dd} ${mon} ${hh}:${mm} UTC`
    }
    ```

    Render structure (horizontal flex row):
    - Outer `<article className="flex items-center gap-3 rounded-md bg-space-900/60 ring-1 ring-slate-800/60 px-3 py-2">`
    - Event-type badge `<span className="rounded-full px-2.5 py-0.5 ring-1 text-[10px] font-bold uppercase tracking-wider ${EVENT_CLASSES[eventType] || fallback}">{eventType}</span>`
    - Vertical stack `<div className="flex flex-col">` containing:
      - Severity (bold, prominent): `<span className="text-sm font-semibold text-slate-100">{severity}</span>`
      - UTC time (small, dim): `<span className="text-xs text-slate-400">{formatUtc(timeUtc)}</span>`
      - If `description`: `<span className="text-xs text-slate-300 mt-0.5">{description}</span>`
    - If `tooltipKey && getTooltip(tooltipKey)`, append an info trigger at the right (`<span className="ml-auto text-slate-500 text-xs cursor-help" aria-label="More info">ⓘ</span>`) wrapped in `<TooltipWrapper content={getTooltip(tooltipKey).text}>...</TooltipWrapper>`. The `ml-auto` pushes it to the right edge of the flex row.

    ---

    **File 3: `src/components/LastUpdated.jsx`**

    Per 02-CONTEXT.md `## LastUpdated`. Relative time primary, absolute UTC in a hover tooltip. Uses `useNow()` for re-renders.

    Signature: `function LastUpdated({ timestamp, prefix = 'Last updated', palette = 'neutral' })`
    - `timestamp`: `Date | string | null | undefined`
    - `prefix`: string, default `'Last updated'`
    - `palette`: `'mars' | 'moon' | 'neutral'`, default `'neutral'`

    Imports:
    ```jsx
    import { useNow } from '../hooks/useNow.js'
    import TooltipWrapper from './TooltipWrapper.jsx'
    ```

    Color mapping (drives dim text color per CONTEXT):
    ```js
    const PALETTE_CLASSES = {
      mars: 'text-mars-accent/70',
      moon: 'text-moon-accent/70',
      neutral: 'text-slate-400',
    }
    ```

    Relative format helper (inline):
    ```js
    function formatRelative(ts, now) {
      if (ts === null || ts === undefined) return '—'
      const d = ts instanceof Date ? ts : new Date(ts)
      if (isNaN(d.getTime())) return '—'
      const diffMs = now.getTime() - d.getTime()
      const diffSec = Math.round(diffMs / 1000)
      if (diffSec < 30) return 'just now'
      if (diffSec < 90) return '1 min ago'
      const diffMin = Math.round(diffSec / 60)
      if (diffMin < 60) return `${diffMin} mins ago`
      const diffHr = Math.round(diffMin / 60)
      if (diffHr < 24) return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`
      const diffDay = Math.round(diffHr / 24)
      return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`
    }

    function formatAbsoluteUtc(ts) {
      if (ts === null || ts === undefined) return null
      const d = ts instanceof Date ? ts : new Date(ts)
      if (isNaN(d.getTime())) return null
      return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} UTC`
    }
    ```

    Component body:
    - Call `const now = useNow()` first.
    - Compute `const relative = formatRelative(timestamp, now)` and `const absolute = formatAbsoluteUtc(timestamp)`.
    - Render `<span className={`text-xs ${PALETTE_CLASSES[palette]}`}>{prefix}: {relative}</span>`.
    - If `absolute` is non-null, wrap the span in `<TooltipWrapper content={absolute}>`.
    - If `absolute` is null (i.e., timestamp is null/undefined/invalid), render the span unwrapped — no tooltip on an em-dash.

    Default exports at bottom of each file.
  </action>
  <verify>
    <automated>test -f src/components/StatusBadge.jsx && test -f src/components/AlertCard.jsx && test -f src/components/LastUpdated.jsx && grep -q "export default StatusBadge" src/components/StatusBadge.jsx && grep -q "export default AlertCard" src/components/AlertCard.jsx && grep -q "export default LastUpdated" src/components/LastUpdated.jsx && grep -q "bg-emerald-700/40" src/components/StatusBadge.jsx && grep -q "bg-amber-700/40" src/components/StatusBadge.jsx && grep -q "bg-red-700/40" src/components/StatusBadge.jsx && grep -q "bg-indigo-700/40" src/components/AlertCard.jsx && grep -q "bg-orange-700/40" src/components/AlertCard.jsx && grep -q "bg-fuchsia-700/40" src/components/AlertCard.jsx && grep -q "useNow" src/components/LastUpdated.jsx && grep -qE "just now|mins ago" src/components/LastUpdated.jsx && grep -q "UTC" src/components/AlertCard.jsx</automated>
  </verify>
  <done>
    - 3 new files exist with default exports.
    - StatusBadge contains the three exact universal-severity Tailwind class strings.
    - AlertCard contains the three event-type Tailwind class strings (indigo/orange/fuchsia for CME/FLR/GST).
    - LastUpdated imports `useNow` from `../hooks/useNow.js` and calls it.
    - LastUpdated relative formatter handles `just now`, `mins ago`, `hours ago`, `days ago`, and `—` for null/undefined/invalid.
    - LastUpdated absolute formatter outputs `HH:MM:SS UTC` and is delivered via TooltipWrapper.
    - AlertCard formats `timeUtc` to a human-readable UTC string.
    - None of these files import any external library beyond `react` (StatusBadge and AlertCard import only project-local files; LastUpdated imports `useNow` and `TooltipWrapper`).
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| API data -> DataCard `value` prop | Phase 3/4 will pass values derived from MAAS2 / SWPC / DONKI JSON. In Phase 2 the value is hardcoded demo data — no untrusted input crosses this boundary yet. |
| API data -> AlertCard `severity`/`description` strings | Same as above — Phase 3/4 concern. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-04 | Tampering | DataCard value rendering | accept | Values rendered as React children (auto-escaped); no raw HTML APIs. Phase 3/4 must add explicit type coercion when wiring API data. |
| T-02-05 | Information Disclosure | AlertCard timeUtc | accept | Time formatter falls back to em-dash on invalid input — no crash, no leakage. |
| T-02-06 | Denial of Service | LastUpdated per-instance timer | mitigate | Uses shared `useNow()` from Plan 01 — 10 LastUpdated instances share one 30s interval. |
| T-02-07 | Repudiation | LastUpdated relative time | accept | Always presented alongside absolute UTC (in tooltip) — user can verify exact time on hover. |
</threat_model>

<verification>
After both tasks complete, end-to-end grep proof that the composite layer is wired:
- `grep -l "from './TooltipWrapper" src/components/*.jsx` returns DataCard, StatusBadge, AlertCard, LastUpdated (all four)
- `grep -l "useNow" src/components/LastUpdated.jsx` returns the file
- `grep -l "getTooltip" src/components/*.jsx` returns DataCard, StatusBadge, AlertCard (LastUpdated uses inline absolute time, not a tooltip key lookup)
- `grep -E "ring-emerald|ring-amber|ring-red" src/components/StatusBadge.jsx | wc -l` returns `3`
- `grep -E "ring-indigo|ring-orange|ring-fuchsia" src/components/AlertCard.jsx | wc -l` returns `3`
</verification>

<success_criteria>
- 4 new files exist: `DataCard.jsx`, `StatusBadge.jsx`, `AlertCard.jsx`, `LastUpdated.jsx`
- DataCard composes TooltipWrapper + LoadingState + getTooltip
- DataCard has all three states (`'ok'`, `'loading'`, `'error'`) producing distinct visible output
- DataCard error renders the exact string `"Data temporarily unavailable"`
- StatusBadge severity colors are the three universal Tailwind class strings (NOT palette tokens)
- AlertCard event-type colors are the three Tailwind class strings (indigo/orange/fuchsia for CME/FLR/GST)
- LastUpdated calls `useNow()` and renders both relative time (in DOM) and absolute UTC (in TooltipWrapper)
- No new npm dependencies
- UI-01, UI-03, UI-04, UI-05 satisfied
</success_criteria>

<output>
After completion, create `.planning/phases/02-shared-ui-primitives/02-02-composite-primitives-SUMMARY.md` documenting the four component signatures, the exact Tailwind class strings used for severities/event-types/palette glows, and the dependency graph back to Plan 01.
</output>
