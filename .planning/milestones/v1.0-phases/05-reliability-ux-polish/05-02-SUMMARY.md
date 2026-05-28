---
phase: 05-reliability-ux-polish
plan: 02
subsystem: components (TooltipWrapper, AlertCard)
tags: [tooltip, accessibility, touch, reliability, REL-03]
dependency_graph:
  requires:
    - "Phase 2 primitive API contracts (DataCard, AlertCard, LastUpdated all wrap children in TooltipWrapper)"
  provides:
    - "src/components/TooltipWrapper.jsx — touch tap-to-toggle (module-level IS_TOUCH), scroll/resize follow (rAF + passive-capture), narrow-viewport max-width clamp, Math.max(0,...) horizontal-position guard"
    - "src/components/AlertCard.jsx — info icon span without role=button / tabIndex (TooltipWrapper focus path is the keyboard contract)"
  affects:
    - "All TooltipWrapper consumers (DataCard, LastUpdated, AlertCard, StatusBadge-via-MarsTab/MoonTab) — behavior is strictly additive; existing hover/focus/ESC/click-outside paths preserved"
tech_stack:
  added: []
  patterns:
    - "Module-scope capability detection (computed once at import time; constant for component lifetime)"
    - "useCallback-extracted positioning function reused by useLayoutEffect (on open) + useEffect (scroll/resize while open)"
    - "rAF-debounced event handlers with cancelAnimationFrame cleanup"
    - "Inline style for runtime values + Tailwind class for static defaults; inline wins by specificity on conflict"
key_files:
  created: []
  modified:
    - "src/components/TooltipWrapper.jsx"
    - "src/components/AlertCard.jsx"
decisions:
  - "IS_TOUCH lives at module scope (D-04) — touch capability doesn't change at runtime in normal browsing, so a single module-level evaluation is cheaper than recomputing inside every TooltipWrapper instance"
  - "Touch onClick is additive to hover/focus, not replacing (D-07) — hybrid devices (iPad Pro w/ mouse) get both paths"
  - "toggleImmediate skips the 150ms OPEN_DELAY_MS (D-05) — taps should feel instant; only hover/focus benefit from the dwell delay"
  - "Reposition extracted to a useCallback so useLayoutEffect (on open) and the scroll/resize useEffect share one positioning implementation (no duplicated math, D-09)"
  - "Scroll listener uses { passive: true, capture: true } — passive for perf; capture so scrolls inside nested scrollers (e.g. DONKI list) also trigger reposition (D-08)"
  - "Portal style.maxWidth = 'min(90vw, 320px)' (D-10) coexists with the Tailwind max-w-xs class — both bound the width; inline wins on narrow viewports"
  - "Math.max(0, ...) guards the maxLeft computation (D-11) — when tooltip width > viewport - margins, raw maxLeft goes negative; clamping at 0 lets the maxWidth shrink path do its job instead of propagating a negative offset"
  - "AlertCard info-icon role=button + tabIndex=0 dropped (D-12) — TooltipWrapper.cloneElement's onFocus/onBlur is the real keyboard contract; the role advertised Enter/Space activation that was never implemented (false ARIA contract per 02-REVIEW WR-01)"
  - "Inline comment in AlertCard phrased to avoid the literal string 'role=button' so the negative-grep contract stays green (same comment-grep-collision pattern Phases 1–4 used for D-43, useMarsData JSDoc, useDonkiEvents env-discipline)"
metrics:
  duration_min: 2.38
  tasks_completed: 2
  files_touched: 2
  completed_date: "2026-05-21"
  commits:
    - "9bcdc7b: feat(05-02): TooltipWrapper touch tap-to-toggle, scroll/resize follow, narrow-viewport clamp"
    - "34ce789: refactor(05-02): drop AlertCard info-icon role and tabIndex (false ARIA contract)"
---

# Phase 5 Plan 2: TooltipWrapper a11y/touch/scroll + AlertCard role cleanup Summary

**One-liner:** TooltipWrapper now supports touch tap-to-toggle, follows its trigger on scroll/resize via an rAF-debounced reposition path, and clamps to `min(90vw, 320px)` with a non-negative horizontal-offset guard; AlertCard's info icon drops its false `role="button"` + `tabIndex={0}` ARIA contract — closing all four Phase 2 review warnings (WR-01..WR-04) without changing a single primitive API.

## IS_TOUCH — module-scope detection

Touch capability is computed once at import time and stored in a module-level `const`:

```js
const IS_TOUCH =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches))
```

Rationale (D-04): touch capability is fixed across the lifetime of a normal browsing session. Hardware doesn't sprout or lose touch capability between page loads, and the (rare) case of a hot-swapped input doesn't justify per-render cost. The expression OR-combines two checks so both legacy webkit (`ontouchstart`) and the modern Pointer Events / Interaction Media Features (`pointer: coarse`) paths are covered. The `typeof window !== 'undefined'` guard keeps the module SSR-safe even though the app currently has no SSR path.

## Tap-to-toggle wire-in

Inside the component, a `toggleImmediate` callback wraps `setIsOpen((prev) => !prev)` with `clearOpenTimer()` so any pending 150ms hover timer is canceled when a tap fires. The triggerProps assembly always sets the hover/focus/blur handlers; `if (IS_TOUCH)` additionally adds an `onClick` that calls `toggleImmediate` and forwards the event to the child's original `onClick` if present.

```js
if (IS_TOUCH) {
  triggerProps.onClick = (event) => {
    toggleImmediate()
    if (children.props.onClick) children.props.onClick(event)
  }
}
```

This is **additive**, not exclusive (D-07). On a hybrid device (iPad Pro with a Magic Keyboard or mouse), the mouse path still fires `onMouseEnter` → 150ms delay → open. A tap toggles instantly. Both work; neither blocks the other. Click-outside dismissal is already wired by the existing `mousedown` listener, so tapping anywhere off the trigger closes the tooltip without any new code (D-06).

## Reusable `reposition` callback

The Phase 2 positioning math (centeredLeft, side flip, horizontal clamp) lived inside a `useLayoutEffect`. Phase 5 extracts it into a `useCallback(reposition, [side])`:

```js
const reposition = useCallback(() => {
  const trigger = triggerRef.current
  const tip = tooltipRef.current
  if (!trigger || !tip) return
  // ... same triggerRect / tipRect / centeredLeft / top / left logic ...
  setPosition({ top, left })
}, [side])
```

Two consumers call it:

1. **`useLayoutEffect`** on mount and whenever `isOpen` or `content` changes — measures real DOM after the portal is rendered (the existing Phase 2 contract).
2. **A new `useEffect`** that runs only while `isOpen` is true (D-08, D-09):

```js
useEffect(() => {
  if (!isOpen) return
  let rafId = null
  const schedule = () => {
    if (rafId !== null) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      reposition()
    })
  }
  window.addEventListener('scroll', schedule, { passive: true, capture: true })
  window.addEventListener('resize', schedule)
  return () => {
    window.removeEventListener('scroll', schedule, { capture: true })
    window.removeEventListener('resize', schedule)
    if (rafId !== null) cancelAnimationFrame(rafId)
  }
}, [isOpen, reposition])
```

Notes:

- `passive: true` on `scroll` declares that the handler will not call `preventDefault`, which lets the browser keep smooth-scrolling without waiting for JS.
- `capture: true` means the handler fires during the capture phase on `window`, so scroll events from nested scrollers (e.g., the DONKI alert list's `overflow-y-auto` container in MoonTab.jsx) also trigger reposition — the bubble phase wouldn't see those.
- The rAF debounce coalesces high-frequency scroll storms into one reposition per frame, avoiding layout thrash.
- Cleanup removes both listeners and cancels any pending frame so an unmount mid-scroll doesn't leak work.

## Narrow-viewport clamp and Math.max(0,...) guard

The portal element's inline style gains a third key:

```jsx
style={{
  top: position.top,
  left: position.left,
  maxWidth: 'min(90vw, 320px)',
}}
```

The Tailwind `max-w-xs` class (320px equivalent) remains on the element. Both bound the tooltip width — on wide viewports, `max-w-xs` and `min(90vw, 320px)` both resolve to 320px and agree. On narrow viewports (say, 360px), `min(90vw, 320px)` collapses to 324px, then 320px wins — and the inline style would have taken precedence if `90vw` resolved smaller. The dual specification is defensive: anyone removing `max-w-xs` later still gets the clamp; anyone removing the inline style still gets the Tailwind ceiling.

The horizontal clamp guard (D-11):

```js
const maxLeft = Math.max(0, window.innerWidth - tipRect.width - VIEWPORT_MARGIN)
const left = Math.max(VIEWPORT_MARGIN, Math.min(centeredLeft, maxLeft))
```

**Scenario it prevents:** if a tooltip's natural width were 400px on a 300px-wide viewport, `window.innerWidth - tipRect.width - VIEWPORT_MARGIN` evaluates to `300 - 400 - 8 = -108`. Without the `Math.max(0, ...)`, `Math.min(centeredLeft, -108)` would force the tooltip 108px off the left edge — invisible. With the guard, `maxLeft = 0`, `Math.min(centeredLeft, 0) = 0`, then `Math.max(VIEWPORT_MARGIN, 0) = 8`. The tooltip pins to the 8px-from-left position and the `maxWidth` clamp handles the overflow by shrinking the body instead of letting position math produce a negative coordinate.

## AlertCard info-icon role cleanup

Before (Phase 2):

```jsx
<span
  className="ml-auto text-slate-500 text-xs cursor-help"
  aria-label="More info"
  tabIndex={0}
  role="button"
>
  ⓘ
</span>
```

After (Phase 5):

```jsx
<span
  className="ml-auto text-slate-500 text-xs cursor-help"
  aria-label="More info"
>
  ⓘ
</span>
```

**Rationale (D-12, WR-01):** `role="button"` advertises a keyboard contract — assistive tech expects Enter/Space to activate the element. The icon had no Enter/Space handler. `tabIndex={0}` made the span focusable, which combined with `role="button"` produced a SR announcement like "More info, button" that could not be activated. A false ARIA contract is worse than no contract; removing both attributes returns the icon to its true nature: a static decorative affordance whose tooltip is driven by mouse hover (desktop) and tap (touch — provided by Task 1's IS_TOUCH path). Pure-keyboard users access the same alert information through the AlertCard's surrounding article content, which already exposes severity, type, and timestamp as text.

The accompanying inline comment is phrased without the literal string `role="button"` — same comment-grep-collision pattern Phases 1–4 used (Phase 3's "nine→eight DataCards" doc avoidance of `r.json()`, Phase 4's "build-time env object" avoidance of `import.meta.env`, etc.) — so the plan's negative-grep contract on AlertCard.jsx stays green if reverified.

## Untouched (Intentional)

- **Tooltip copy** — `src/constants/tooltips.js` unchanged. REL-03 anchoring lives there; this plan is delivery-layer-only.
- **Other primitives** — DataCard, LastUpdated, StatusBadge, LoadingState: zero changes.
- **Tab files** — MarsTab.jsx, MoonTab.jsx: zero changes. The TooltipWrapper API surface (`{ content, children, side }`) is byte-identical to Phase 2.
- **Phase 1 shell** — App.jsx, TabBar.jsx, StarField.jsx: zero changes.
- **Dependencies** — `package.json` and `package-lock.json` byte-identical to Plan 05-01's end state (`git diff --quiet` exit 0).
- **Silent-refetch lock** — `isFetching` does not appear in either tab file (REL-05, D-43 preserved; grep returned 0/0).
- **Plan 05-01 outputs** — `src/utils/formatters.js` still present and still imported by both tabs.
- **Phase 2 contracts preserved verbatim:** 150ms OPEN_DELAY_MS hover, ESC dismiss, click-outside dismiss, focus/blur dismiss, createPortal to document.body, role="tooltip" on the portal, aria-describedby linking trigger ↔ portal, useLayoutEffect-driven post-render positioning, `pointer-events-none` on the tooltip body (deferred to Phase 5+ per IN-07 and not in scope here).

## Deviations from Plan

**One auto-fix (Rule 1 — bug avoidance, no scope change):**

The plan's `<action>` text instructed adding a comment block that included the literal string `role="button"` to AlertCard.jsx. As written, that would have left `grep -c 'role="button"' src/components/AlertCard.jsx` returning 1, failing the `<verify>` block's `! grep -q` predicate. The comment was rephrased ("No button ARIA role is advertised...") to preserve the rationale's clarity while keeping the negative-grep contract green. This is the same pattern Phases 1–4 used for comment-grep collisions and is documented in this Summary's Decisions list. No code semantics changed; the only change vs. the plan's literal action text is the comment phrasing.

## Verification Outcomes

| Check | Expected | Actual |
|-------|----------|--------|
| `^const IS_TOUCH` in TooltipWrapper.jsx | 1 | 1 |
| `if (IS_TOUCH)` block | 1 | 1 |
| `toggleImmediate` (decl + call site) | ≥2 | 2 |
| `addEventListener('scroll'` | 1 | 1 |
| `addEventListener('resize'` | 1 | 1 |
| `passive: true, capture: true` | 1 | 1 |
| `requestAnimationFrame` | 1 | 1 |
| `cancelAnimationFrame` | 1 | 1 |
| `maxWidth: 'min(90vw, 320px)'` | 1 | 1 |
| `Math.max(0, window.innerWidth` | 1 | 1 |
| `createPortal` | ≥1 | 2 (import + call) |
| `useLayoutEffect` | ≥1 | 2 (import + call) |
| `role="tooltip"` | 1 | 2 (JSDoc + JSX; runtime attribute exactly once) |
| `OPEN_DELAY_MS` | ≥2 | 2 |
| `max-w-xs` | 1 | 1 |
| `role="button"` in AlertCard.jsx | 0 | 0 |
| `tabIndex={0}` in AlertCard.jsx | 0 | 0 |
| `aria-label="More info"` in AlertCard.jsx | 1 | 1 |
| `isFetching` in MarsTab.jsx | 0 | 0 |
| `isFetching` in MoonTab.jsx | 0 | 0 |
| `git diff --quiet package.json package-lock.json` | exit 0 | exit 0 |
| `src/utils/formatters.js` exists | yes | yes |
| MarsTab imports formatters.js | yes | yes |
| MoonTab imports formatters.js | yes | yes |
| `npm run build` | exit 0 | exit 0 (built in 1.40s; 99 modules) |

Note on the `role="tooltip"` count: the literal appears once as a JSX attribute (the live ARIA contract) and once inside the JSDoc block describing the contract — same pattern as the other ≥1/≥2 counts in this table. The runtime element renders exactly one `role="tooltip"` attribute.

## Decisions Made

1. **IS_TOUCH at module scope, not in-component (D-04).** A per-instance evaluation would be wasteful; touch capability is a device property, not a render-time variable.
2. **Touch onClick is additive (D-07).** Tap-to-toggle does NOT disable hover/focus on touch devices. Hybrid devices (laptop with touchscreen, tablet with keyboard) get the right behavior for whichever input the user reaches for.
3. **Reposition extracted to useCallback, not duplicated (D-09).** One canonical implementation; scroll/resize listeners reuse the same math the layout effect uses. Future positioning fixes apply everywhere.
4. **Inline maxWidth + Tailwind max-w-xs both kept (D-10).** Defensive double specification; either one alone provides the cap, both together survive partial refactors.
5. **Comment phrasing avoids literal `role="button"` in AlertCard (D-12 + Phases 1–4 comment-grep convention).** Keeps the false-contract removal contract verifiable via grep without needing a separate "comment vs JSX" parser.

## Files Touched

| File | Change |
|------|--------|
| `src/components/TooltipWrapper.jsx` | Added module-level `IS_TOUCH` const; extracted `reposition` to `useCallback`; added `toggleImmediate` callback; added `if (IS_TOUCH) triggerProps.onClick = ...` block; added scroll/resize `useEffect` with rAF debounce; wrapped `maxLeft` math in `Math.max(0, ...)`; added `maxWidth: 'min(90vw, 320px)'` to portal style. ~85 lines net added; existing Phase 2 contracts preserved verbatim. |
| `src/components/AlertCard.jsx` | Removed `tabIndex={0}` and `role="button"` from info-icon span; added 5-line rationale comment immediately above the `infoIcon` const. |

## Self-Check: PASSED

- File `src/components/TooltipWrapper.jsx` modified and matches IS_TOUCH grep contract.
- File `src/components/AlertCard.jsx` modified; `role="button"` count is 0; `tabIndex={0}` count is 0.
- Commit `9bcdc7b` (TooltipWrapper) present in `git log --oneline`.
- Commit `34ce789` (AlertCard) present in `git log --oneline`.
- Production build (`npm run build`) exits 0; 99 modules transformed (same module count as Plan 05-01 end state — no new dependencies).
- `package.json` and `package-lock.json` unchanged from Plan 05-01.
- All plan-level grep verification counts hit their expected values.

---

*Plan 05-02 complete. Next: Plan 05-03 — AbortSignal threading in the three data hooks + MoonTab DONKI list keyboard scroll + AlertCard key prefix + Phase 5 audit checklist.*
