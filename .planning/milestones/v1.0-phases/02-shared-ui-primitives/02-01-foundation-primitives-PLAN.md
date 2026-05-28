---
phase: 02-shared-ui-primitives
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/TooltipWrapper.jsx
  - src/components/LoadingState.jsx
  - src/hooks/useNow.js
  - src/constants/tooltips.js
autonomous: true
requirements:
  - UI-02
  - UI-06
  - UI-07
tags: [ui, tooltip, loading, skeleton, hook]

must_haves:
  truths:
    - "TooltipWrapper renders trigger element and exposes its tooltip text via ARIA on hover/focus"
    - "LoadingState renders an animate-pulse skeleton block (no shimmer) sized to a DataCard footprint"
    - "useNow() returns the current Date and re-renders consumers every 30 seconds via a single shared interval"
    - "tooltips.js exports a flat keyed object including 'mars.example' that downstream tooltips can look up"
  artifacts:
    - path: "src/components/TooltipWrapper.jsx"
      provides: "Custom portal-mounted hover tooltip with role=tooltip and aria-describedby"
      exports: ["default"]
    - path: "src/components/LoadingState.jsx"
      provides: "Tailwind animate-pulse skeleton block"
      exports: ["default"]
    - path: "src/hooks/useNow.js"
      provides: "Shared 30s ticker returning current Date"
      exports: ["useNow"]
    - path: "src/constants/tooltips.js"
      provides: "Flat source-of-truth object for all tooltip copy"
      contains: "mars.example"
  key_links:
    - from: "src/components/TooltipWrapper.jsx"
      to: "document.body"
      via: "createPortal"
      pattern: "createPortal"
    - from: "src/components/TooltipWrapper.jsx"
      to: "trigger element"
      via: "aria-describedby + role=tooltip"
      pattern: "role=\"tooltip\"|aria-describedby"
---

<objective>
Create the leaf-level Phase 2 primitives that have no dependencies on other Phase 2 components: the custom hover/focus TooltipWrapper, the Tailwind animate-pulse LoadingState skeleton, the shared 30-second useNow ticker hook, and the flat tooltips.js copy source-of-truth. These four artifacts unblock the composite primitives in Plan 02 (DataCard composes TooltipWrapper + LoadingState; LastUpdated consumes useNow) and the demo galleries in Plan 03.

Purpose: Establish the foundation layer so DataCard, LastUpdated, and the demo galleries in subsequent waves can compose against stable, tested contracts without re-deriving tooltip/loading/clock semantics inline.

Output: 4 new files under src/components/, src/hooks/, and src/constants/. No existing files modified.
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
@Discussion.md
@tailwind.config.js
@src/components/TabBar.jsx
@src/index.css

<interfaces>
<!-- Existing patterns this plan must match (from Phase 1) -->

From `src/components/TabBar.jsx` (component pattern):
- Default export at bottom: `export default TabBar`
- Functional component, props destructured in signature
- Tailwind classes composed in arrays joined with `' '` when conditional
- ARIA attributes inline (`role="tablist"`, `aria-selected`)

From `src/constants/tabs.js` (constants pattern):
- Named exports for objects + arrays
- Plain JS object literal, no TypeScript
- Single source of truth — consumers import, never duplicate

Tailwind palette tokens available (do NOT introduce new ones):
- `mars-{50,500,600,700,800,900,accent}` — accent = `#f59e0b`
- `moon-{50,400,500,600,700,800,900,accent}` — accent = `#cbd5e1`
- `space-{900,950}` — 900 = `#0a0a0f`, 950 = `#020617`

Z-index contract from Phase 1:
- StarField at z-0, main content at z-10
- Tooltip portal should sit at z-50 (above content; below any future modal layer)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Seed tooltips.js source-of-truth and useNow 30s ticker hook</name>
  <files>src/constants/tooltips.js, src/hooks/useNow.js</files>
  <read_first>
    - .planning/phases/02-shared-ui-primitives/02-CONTEXT.md (LOCKED — `## Tooltip copy source-of-truth` and `## LastUpdated` sections)
    - Discussion.md (§5 component architecture; §6 UX details on freshness)
    - src/constants/tabs.js (project convention for constants files — named exports, plain object literal)
  </read_first>
  <action>
    Create two new files.

    **File 1: `src/constants/tooltips.js`**
    Export a single named const `TOOLTIPS` — a flat object keyed by stable namespaced string IDs. Each value is an object `{ text: string, source?: string }`. Seed at minimum these keys (placeholders are fine per 02-CONTEXT.md `## Locked tooltips for Phase 2`):
    - `'mars.example'`: text = `"Mars' atmosphere is about 0.6% as dense as Earth's — too thin to breathe, thick enough to drive dust storms."`, source = `"MAAS2 / REMS"` (this exact string is in 02-CONTEXT.md `## Specific Ideas`)
    - `'moon.example'`: text = `"The Moon has no atmosphere — daytime surface temperature swings from about +127°C in direct sun to -173°C in shadow."`, source = `"Computed"`
    - `'swpc.radiationRisk'`: text = `"Derived from solar wind speed and Kp index. Low = quiet conditions; High = storm-level activity that elevates surface radiation."`, source = `"NOAA SWPC"`
    - `'donki.cme'`: text = `"Coronal Mass Ejection — a burst of plasma and magnetic field from the Sun. Can drive geomagnetic storms days after eruption."`, source = `"NASA DONKI"`

    Also export a helper function `getTooltip(key)` that returns `TOOLTIPS[key] || null` so consumers never crash on a missing key.

    Add a top-of-file JSDoc comment that explains the namespacing convention (`{tab|source}.{datapoint}`) and the `{ text, source }` shape — Phase 3 and Phase 4 will add real keys here.

    **File 2: `src/hooks/useNow.js`**
    Export a named function `useNow()` that returns the current `Date`. Implementation must use a **module-level shared subscription** (not one `setInterval` per hook caller) — per 02-CONTEXT.md `## LastUpdated > Update frequency`: "single setInterval for the whole tree, not one per LastUpdated instance".

    Pattern:
    - Module-level `let now = new Date()` and module-level `const listeners = new Set()`.
    - Module-level `setInterval` started lazily on first subscribe; cleared when last subscriber unsubscribes (use a ref count). Interval period: `30_000` ms.
    - `useNow()` uses `useState`/`useEffect` to subscribe: on mount add a setter to `listeners`; on unmount remove it; tick handler calls every listener with `new Date()`.
    - Return the current `now` value.

    Add a JSDoc comment explaining: "Shared 30-second ticker. All consumers share a single interval so 10 LastUpdated cards on screen don't drift."

    Use ES modules (`import { useEffect, useState } from 'react'`).
  </action>
  <verify>
    <automated>test -f src/constants/tooltips.js && test -f src/hooks/useNow.js && grep -q "mars.example" src/constants/tooltips.js && grep -q "moon.example" src/constants/tooltips.js && grep -q "swpc.radiationRisk" src/constants/tooltips.js && grep -q "donki.cme" src/constants/tooltips.js && grep -q "export function getTooltip" src/constants/tooltips.js && grep -q "export function useNow" src/hooks/useNow.js && grep -qE "30[_]?000" src/hooks/useNow.js && grep -q "setInterval" src/hooks/useNow.js</automated>
  </verify>
  <done>
    - `src/constants/tooltips.js` exists and exports `TOOLTIPS` (named) and `getTooltip` (named function).
    - `TOOLTIPS` contains keys `mars.example`, `moon.example`, `swpc.radiationRisk`, `donki.cme`, each with `text` populated.
    - `src/hooks/useNow.js` exists and exports a named `useNow` function.
    - `useNow` uses a module-level shared interval of 30000ms (not per-call setInterval).
    - No external library imports beyond `react`.
  </done>
</task>

<task type="auto">
  <name>Task 2: Build TooltipWrapper (custom portal + ARIA) and LoadingState skeleton</name>
  <files>src/components/TooltipWrapper.jsx, src/components/LoadingState.jsx</files>
  <read_first>
    - .planning/phases/02-shared-ui-primitives/02-CONTEXT.md (LOCKED — `## Tooltip approach — TooltipWrapper` and `## Loading state — LoadingState` sections)
    - Discussion.md (§2 Design Decisions; §6 Key UX Details — loading state independence)
    - src/components/TabBar.jsx (default-export functional component pattern; props destructure; conditional Tailwind class composition)
    - src/constants/tooltips.js (the source-of-truth this wrapper will eventually be paired with — wrapper itself accepts inline `content`, but Plan 02's DataCard will look up keys via `getTooltip`)
  </read_first>
  <action>
    Create two new files. Both default-export their component (matches Phase 1 convention).

    **File 1: `src/components/TooltipWrapper.jsx`**

    Custom React tooltip — NO external library. Per 02-CONTEXT.md `## Tooltip approach`:

    Signature: `function TooltipWrapper({ content, children, side = 'top' })`
    - `content`: string | ReactNode — the tooltip body
    - `children`: a single React element (the trigger)
    - `side`: `'top' | 'bottom'` — default `'top'`, flips if it would clip the viewport

    Implementation details:
    - Import `useState`, `useRef`, `useEffect`, `useId` from `'react'` and `createPortal` from `'react-dom'`.
    - State: `isOpen` (boolean), `position` (`{ top, left }`).
    - Generate a stable id with `useId()` — use it as the tooltip element's `id` and as the trigger's `aria-describedby`.
    - **Open delay 150ms, close delay 0ms** (per CONTEXT). Use a ref to hold the open `setTimeout` handle; clear it on `mouseleave`/`blur`.
    - **Trigger handlers**: clone `children` with `React.cloneElement` adding `onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur`, and `aria-describedby={tooltipId}` and `ref` (use a forwarded callback ref). Do NOT add extra DOM around the trigger — wrap with `cloneElement` only.
    - **Positioning**: on open, read `triggerRef.current.getBoundingClientRect()`. Default position above the trigger (`top = rect.top - tooltipHeight - 8`, `left = rect.left + rect.width / 2 - tooltipWidth / 2`). If `top < 8`, flip to below (`top = rect.bottom + 8`). Use a simple measurement after first render (set `isOpen`, then in a `useLayoutEffect` measure the tooltip ref and adjust). No positioning library.
    - **Portal**: render the tooltip via `createPortal(<div ...>, document.body)`. The portal `<div>` has:
      - `role="tooltip"`
      - `id={tooltipId}`
      - `className="fixed z-50 max-w-xs rounded-md bg-space-900/95 px-3 py-2 text-xs text-slate-100 ring-1 ring-slate-700/60 shadow-lg pointer-events-none"`
      - inline `style={{ top: position.top, left: position.left }}`
    - **ESC key closes**: add a `keydown` listener on `document` while open; on `Escape`, set `isOpen` false.
    - **Click outside closes**: while open, listen for `mousedown` on `document`; if target is not the trigger or the tooltip, close.
    - If `content` is falsy, render `children` unchanged (no wrapping, no portal).

    All tooltip content must be rendered as React children (auto-escaped). Do NOT use raw HTML injection APIs.

    Default export at bottom.

    **File 2: `src/components/LoadingState.jsx`**

    Skeleton block per 02-CONTEXT.md `## Loading state`:

    Signature: `function LoadingState({ className = '' })`
    - Renders a single `<div>` with Tailwind classes: `animate-pulse rounded-md bg-slate-700/40 h-8 w-24` (intrinsic DataCard value-sized footprint per CONTEXT — caller can override with `className` to size to its own slot).
    - Final className composes the default base + caller-provided override: `[`animate-pulse rounded-md bg-slate-700/40 h-8 w-24`, className].join(' ')`.
    - `aria-hidden="true"` on the div (decorative — screen readers should announce the live region from the data container, not the skeleton).
    - **No shimmer animation** — only Tailwind's `animate-pulse` per CONTEXT.

    Default export at bottom.
  </action>
  <verify>
    <automated>test -f src/components/TooltipWrapper.jsx && test -f src/components/LoadingState.jsx && grep -q "export default TooltipWrapper" src/components/TooltipWrapper.jsx && grep -q "export default LoadingState" src/components/LoadingState.jsx && grep -q "createPortal" src/components/TooltipWrapper.jsx && grep -q 'role="tooltip"' src/components/TooltipWrapper.jsx && grep -q "aria-describedby" src/components/TooltipWrapper.jsx && grep -qE "150" src/components/TooltipWrapper.jsx && grep -q "animate-pulse" src/components/LoadingState.jsx && ! grep -q "shimmer" src/components/LoadingState.jsx && ! grep -qE "from ['\"]@radix-ui" src/components/TooltipWrapper.jsx</automated>
  </verify>
  <done>
    - `src/components/TooltipWrapper.jsx` default-exports a functional component using `createPortal` from `react-dom`.
    - Tooltip portal element has `role="tooltip"` and is linked to the trigger via `aria-describedby`.
    - Open delay 150ms hardcoded in the open-timeout (search shows the literal `150`).
    - No Radix or other external tooltip library imported.
    - `src/components/LoadingState.jsx` default-exports a component that renders an `animate-pulse` div.
    - No `shimmer` keyword anywhere in LoadingState.
    - Both files use Phase 1's `function Foo() { ... } export default Foo` pattern.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| User input -> tooltip content | Tooltip `content` prop is rendered as-is. In Phase 2 all content is hardcoded in `tooltips.js` or passed from trusted demo code — no user input. Phase 3/4 may pass API-derived strings; mitigation deferred to those phases. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-01 | Tampering | TooltipWrapper portal | accept | All content rendered as React children (auto-escaped). No raw HTML injection APIs used; verified by code review. |
| T-02-02 | Information Disclosure | tooltips.js | accept | Static placeholder text only; no PII, no secrets. The `source` field names public data providers. |
| T-02-03 | Denial of Service | useNow shared interval | mitigate | Single module-level interval serves N consumers; reference-counted teardown prevents interval leaks on unmount. Verified by grep — only one `setInterval` call in the file. |
</threat_model>

<verification>
After both tasks complete:
- `grep -l "createPortal" src/components/TooltipWrapper.jsx` returns the file
- `grep -c "setInterval" src/hooks/useNow.js` returns exactly `1` (single shared interval)
- `node -e "import('./src/constants/tooltips.js').then(m => { if (!m.TOOLTIPS['mars.example']) process.exit(1) })"` exits 0 (will work after build; otherwise verify via grep)
- All tooltip content rendered via React children (auto-escaped) — no raw HTML APIs used
</verification>

<success_criteria>
- 4 new files exist: `src/components/TooltipWrapper.jsx`, `src/components/LoadingState.jsx`, `src/hooks/useNow.js`, `src/constants/tooltips.js`
- TooltipWrapper is portal-mounted with ARIA `role="tooltip"` + `aria-describedby` linkage
- LoadingState uses Tailwind `animate-pulse` and nothing else for animation
- useNow uses a single module-level shared 30s interval
- `tooltips.js` contains at minimum `mars.example`, `moon.example`, `swpc.radiationRisk`, `donki.cme`
- No new npm dependencies added (no Radix, no positioning library)
- UI-02, UI-06, UI-07 satisfied
</success_criteria>

<output>
After completion, create `.planning/phases/02-shared-ui-primitives/02-01-foundation-primitives-SUMMARY.md` documenting the exact exports (signatures, prop shapes), the tooltip keys seeded, the useNow subscription pattern, and any deviations from this plan.
</output>
