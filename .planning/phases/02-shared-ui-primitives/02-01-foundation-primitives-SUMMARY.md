---
phase: 02-shared-ui-primitives
plan: 01
subsystem: ui
tags: [ui, tooltip, loading, skeleton, hook, portal, aria, react]

# Dependency graph
requires:
  - phase: 01-scaffold-shell
    provides: Tailwind palette tokens (mars/moon/space), default-export functional component pattern, src/components and src/hooks scaffolding, ESM module type
provides:
  - TooltipWrapper — custom portal-mounted hover/focus tooltip with role=tooltip + aria-describedby linkage
  - LoadingState — Tailwind animate-pulse skeleton block sized to DataCard value slot
  - useNow — shared 30-second ticker hook backed by a single module-level setInterval
  - tooltips.js — flat TOOLTIPS object + getTooltip() helper, seeded with Phase 2 placeholder keys
affects: [02-shared-ui-primitives, 03-mars-tab, 04-moon-tab]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Portal-mounted tooltip via createPortal(document.body) with viewport-aware top/bottom flip
    - Shared-subscription hook pattern (module-level state + listener Set + ref-counted interval teardown)
    - Flat namespaced constants object with safe accessor returning null on miss
    - Decorative skeleton with aria-hidden so live regions live on the data container, not the placeholder

key-files:
  created:
    - src/components/TooltipWrapper.jsx
    - src/components/LoadingState.jsx
    - src/hooks/useNow.js
    - src/constants/tooltips.js
  modified: []

key-decisions:
  - "TooltipWrapper uses createPortal to document.body so ancestor overflow/transform contexts don't clip the tooltip (matches 02-CONTEXT 'no external library' decision)"
  - "useNow uses a single module-level setInterval with a ref-counted teardown — verified by grep returning exactly 1 setInterval call in the file"
  - "tooltips.js exports a flat namespaced object (mars.example, moon.example, swpc.radiationRisk, donki.cme); getTooltip(key) returns null for misses so consumers never crash"
  - "LoadingState exposes a className override so it can size to non-DataCard slots (AlertCard list rows in Phase 4) without forking the component"

patterns-established:
  - "Portal tooltip: createPortal + role=tooltip + aria-describedby + useLayoutEffect-driven flip-on-clip positioning"
  - "Shared interval hook: module-level state + Set of subscribers + ref count to start/stop interval lazily"
  - "Tooltip-copy constants: flat object keyed `{tab|source}.{datapoint}`, value `{ text, source? }`"
  - "Skeleton component: `aria-hidden` + Tailwind `animate-pulse` only — no shimmer/gradient"

requirements-completed: [UI-02, UI-06, UI-07]

# Metrics
duration: 3min
completed: 2026-05-19
---

# Phase 2 Plan 1: Foundation Primitives Summary

**Portal-mounted custom TooltipWrapper, animate-pulse LoadingState, shared 30-second useNow ticker hook, and seeded tooltips.js source-of-truth — the Phase 2 leaf primitives.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-19T12:45:36Z
- **Completed:** 2026-05-19T12:48:31Z
- **Tasks:** 2
- **Files created:** 4
- **Files modified:** 0

## Accomplishments

- Custom portal-mounted TooltipWrapper with `role="tooltip"`, `aria-describedby`, 150ms open delay, ESC/click-outside/blur dismiss, and viewport-aware top/bottom flip — no external library
- LoadingState renders an `aria-hidden` Tailwind `animate-pulse` skeleton with a `className` override slot for non-DataCard use cases
- useNow exposes a shared 30-second ticker backed by a single module-level `setInterval` (ref-counted start/stop) so N consumers share one timer
- tooltips.js exports a flat `TOOLTIPS` object plus a safe `getTooltip(key)` accessor, seeded with the four Phase 2 demo keys (`mars.example`, `moon.example`, `swpc.radiationRisk`, `donki.cme`)
- `npm run build` passes (83 modules transformed, no errors)

## Task Commits

Each task was committed atomically on `main`:

1. **Task 1: Seed tooltips.js + useNow ticker** — `1f9ce86` (feat)
2. **Task 2: TooltipWrapper portal + LoadingState skeleton** — `41b1e8a` (feat)

**Plan metadata commit:** *(appended at end of this plan execution)*

## Exact Exports

### `src/constants/tooltips.js`

- `export const TOOLTIPS` — flat object keyed by namespaced strings.
  - Seeded keys:
    - `'mars.example'` → `{ text: "Mars' atmosphere is about 0.6% as dense as Earth's …", source: 'MAAS2 / REMS' }`
    - `'moon.example'` → `{ text: 'The Moon has no atmosphere — daytime surface temperature swings…', source: 'Computed' }`
    - `'swpc.radiationRisk'` → `{ text: 'Derived from solar wind speed and Kp index. Low = quiet conditions; …', source: 'NOAA SWPC' }`
    - `'donki.cme'` → `{ text: 'Coronal Mass Ejection — a burst of plasma and magnetic field from the Sun. …', source: 'NASA DONKI' }`
- `export function getTooltip(key)` → `{ text, source? } | null`

### `src/hooks/useNow.js`

- `export function useNow()` → `Date`
- Internal contract: one module-level `setInterval` (period `30000` ms) started lazily on first subscribe; cleared when the last subscriber unmounts via reference counting. All consumers receive the same `Date` instance on each tick.

### `src/components/TooltipWrapper.jsx`

- `function TooltipWrapper({ content, children, side = 'top' })` — default export.
  - `content`: `string | ReactNode` — falsy passes `children` through unchanged.
  - `children`: a single React element. Cloned via `cloneElement` to attach mouse/focus handlers, a forwarded callback ref, and `aria-describedby` (only when open).
  - `side`: `'top' | 'bottom'` — preferred side; auto-flips if it would clip the viewport.
- Behavior: 150ms open delay, 0ms close. Esc key, click-outside, and blur all dismiss. Tooltip rendered via `createPortal(<div role="tooltip" id={tooltipId} className="fixed z-50 max-w-xs rounded-md bg-space-900/95 …" />, document.body)`. Positioning measured in a `useLayoutEffect` after first render; clamped horizontally to keep edges visible.

### `src/components/LoadingState.jsx`

- `function LoadingState({ className = '' })` — default export.
- Renders `<div aria-hidden="true" className="animate-pulse rounded-md bg-slate-700/40 h-8 w-24 {className}" />`. Caller-supplied `className` is appended so size/shape can be overridden without forking.

## Files Created/Modified

- `src/constants/tooltips.js` — Flat namespaced TOOLTIPS object + `getTooltip` accessor. Seeded with four Phase 2 placeholder keys.
- `src/hooks/useNow.js` — Shared 30-second ticker. Module-level state + listener Set + ref-counted interval teardown.
- `src/components/TooltipWrapper.jsx` — Portal-mounted hover/focus tooltip. role=tooltip + aria-describedby; ESC/click-outside/blur dismiss; auto-flip on viewport clip.
- `src/components/LoadingState.jsx` — `animate-pulse` skeleton block with optional `className` override.

## Decisions Made

- **No external tooltip library.** Custom React + portal implementation per 02-CONTEXT lock. Saves ~12 kB gzipped vs. Radix; keeps Phase 2 free of new dependencies.
- **`useNow` uses module-level state, not React Context.** A context-based ticker would be tied to the provider tree, complicating any future testing-library or storybook use. Module-level keeps the hook self-contained.
- **`getTooltip` returns `null`, not `undefined` or a throwaway object,** so consumers can do `getTooltip(key) ?? fallback` without ambiguity.
- **`aria-describedby` is set only when the tooltip is open.** This avoids the SR announcing a non-existent element id during the 150ms pre-open window.
- **Horizontal clamping added beyond plan spec.** The plan called for vertical flip; tooltips near the left/right edges of the viewport would still clip without horizontal clamping. Tracked as a tiny enhancement, not a deviation — same trust-boundary, same surface, just more robust positioning.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Comment containing literal "shimmer" broke verification grep**
- **Found during:** Task 2 verification block (`! grep -q "shimmer" src/components/LoadingState.jsx`)
- **Issue:** Initial JSDoc comment said "No shimmer animation (deferred to Phase 5 polish)" — the verify rule treats *any* `shimmer` token as a failure to keep code free of shimmer keyframes/utility names. The intent was a negation, so the comment defeated its own assertion.
- **Fix:** Rephrased the comment to "No gradient sweep / fancy keyframes (deferred to Phase 5 polish)". Same intent, no grep collision.
- **Files modified:** `src/components/LoadingState.jsx`
- **Verification:** `! grep -q "shimmer" src/components/LoadingState.jsx` now passes.
- **Committed in:** Same Task 2 commit `41b1e8a` (caught during pre-commit verification).

**2. [Rule 1 - Bug] Initial useNow comment containing "setInterval" tripped the single-interval grep**
- **Found during:** Task 1 verification block (`grep -c "setInterval" src/hooks/useNow.js` returned 2 instead of 1)
- **Issue:** Threat T-02-03's mitigation states only one `setInterval` call should exist in the file; my initial JSDoc said "10 LastUpdated cards on screen don't each spin up their own setInterval". Comment text counted toward the grep.
- **Fix:** Reworded comment to "don't each spin up their own timer".
- **Files modified:** `src/hooks/useNow.js`
- **Verification:** `grep -c "setInterval" src/hooks/useNow.js` now returns `1`.
- **Committed in:** Same Task 1 commit `1f9ce86` (caught during pre-commit verification).

---

**Total deviations:** 2 auto-fixed (both Rule 1 / comment-grep collisions, no behavioral change).
**Impact on plan:** None — both fixes were doc-comment rewordings to keep verification greps honest. No code paths changed.

## Issues Encountered

None.

## Self-Check

- `src/constants/tooltips.js`: FOUND
- `src/hooks/useNow.js`: FOUND
- `src/components/TooltipWrapper.jsx`: FOUND
- `src/components/LoadingState.jsx`: FOUND
- Commit `1f9ce86`: present in `git log`
- Commit `41b1e8a`: present in `git log`
- Overall verification block passes (`createPortal` present, `setInterval` count = 1, `TOOLTIPS['mars.example']` resolves)
- `npm run build` passes (83 modules transformed, 0 errors)

## Self-Check: PASSED

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 02 (DataCard composing TooltipWrapper + LoadingState, LastUpdated consuming useNow) is unblocked: all four leaf primitives ship stable contracts.
- Plan 03 (demo galleries in MarsTab/MoonTab) can compose against these primitives as soon as Plan 02's composite components land.
- No blockers or carried-over concerns.

---
*Phase: 02-shared-ui-primitives*
*Completed: 2026-05-19*
