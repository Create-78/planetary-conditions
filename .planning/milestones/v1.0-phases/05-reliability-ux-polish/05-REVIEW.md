---
phase: 05-reliability-ux-polish
reviewed: 2026-05-21T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/utils/formatters.js
  - src/components/TooltipWrapper.jsx
  - src/components/AlertCard.jsx
  - src/hooks/useMarsData.js
  - src/hooks/useSolarWind.js
  - src/hooks/useDonkiEvents.js
  - src/tabs/MarsTab.jsx
  - src/tabs/MoonTab.jsx
findings:
  critical: 0
  warning: 0
  info: 3
  total: 3
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-05-21
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found (3 Info-level only — no Critical or Warning issues)

## Summary

Phase 5 reliability + UX polish work is solid. The TooltipWrapper additions
(touch tap-to-toggle, scroll/resize follow with rAF debounce, viewport clamp)
are well-engineered: passive scroll listener with capture phase + correct
removal, rAF cleanup on close/unmount, SSR-safe `typeof window` guard for
`IS_TOUCH`, and the horizontal `Math.max(0, …)` floor paired with the
`max-width: min(90vw, 320px)` style clamp.

AlertCard correctly drops `role="button"` and `tabIndex={0}` (verified
removed, not visually hidden) while preserving `aria-label="More info"`
on the info icon — the false ARIA contract from 02-REVIEW WR-01 is gone.

All three hooks thread `{ signal }` from queryFn context into `fetch`,
and `useMarsData` keeps its text→JSON.parse pattern for MAAS2's
Content-Type quirk. `formatters.js` returns `null` for null/undefined/NaN
inputs, letting `DataCard` render its centralized em-dash fallback.

MoonTab's DONKI region has `tabIndex={0}` + `role="region"` +
`aria-label="Recent solar events"` on the actual overflow container, with
a visible focus ring (`focus-visible:ring-2 focus-visible:ring-moon-accent`)
and stable keys (`${ev.type}-${ev.id}`).

No bugs, no security issues, no performance regressions were found.
The three Info findings below are minor polish notes — none block merge.

## Info

### IN-01: `formatters.js` treats empty string as 0 instead of em-dash

**File:** `src/utils/formatters.js:17-22, 29-34, 43-49`
**Issue:** All three formatters convert via `Number(value)` after the
null/undefined check. `Number('')` returns `0` (not NaN), so an empty
string input would render as `"0"`, `"0.0"`, or `"+0.0"` instead of
falling through to the centralized em-dash fallback. Today's callers
(MarsTab from MAAS2 fields, MoonTab from `useSolarWind`) shouldn't pass
empty strings, but the contract comment at the top of the file claims
"every formatter returns `null` for null/undefined/NaN" — empty string
is a quiet hole in that contract.

**Fix:** Add an empty-string short-circuit before the `Number()` coercion:
```js
if (value === null || value === undefined || value === '') return null
const n = Number(value)
if (Number.isNaN(n)) return null
```
Apply to all three formatters. Cheap, makes the contract honest.

### IN-02: AlertCard's local `formatUtc` duplicates a date-formatting concern

**File:** `src/components/AlertCard.jsx:31-40`
**Issue:** AlertCard defines a private `formatUtc` helper for ISO →
"DD Mon HH:MM UTC" rendering. It's the only place in the codebase that
formats a UTC date for display, so it's not actively duplicated — but
the rest of the formatting concerns moved into `src/utils/formatters.js`
this phase per D-16/D-17/D-18. If a second date display surface lands
(e.g. an event detail row, a future "next sol" caption), the helper
will get duplicated unless it's hoisted now.

**Fix:** Optional. Move `formatUtc` to `src/utils/formatters.js` as
`formatUtcDateTime(iso)`, importing it in AlertCard. Defer until a
second caller appears — premature extraction is its own anti-pattern.

### IN-03: `useLayoutEffect` repositions on every `content` identity change

**File:** `src/components/TooltipWrapper.jsx:130-133`
**Issue:** The layout effect's deps are `[isOpen, content, reposition]`.
When `content` is a `ReactNode` (e.g. `<strong>…</strong> …`) — which is
allowed by the prop contract — its identity changes every render of the
parent, so the effect re-runs reposition on every parent re-render while
the tooltip is open. Reposition is cheap (a single `getBoundingClientRect`
+ a `setPosition` call), and bailing out of `setPosition` when the
position is unchanged would short-circuit the resulting React render,
so the observable impact is near zero. Still worth a note.

**Fix:** Optional. Either (a) document that callers should pass stable
`content` (string or memoized node), or (b) add an internal
`positionsEqual` guard in `reposition` before calling `setPosition` to
avoid the no-op render. Per v1 scope, performance issues are out of
scope unless they cause correctness problems — this one does not.

---

_Reviewed: 2026-05-21_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
