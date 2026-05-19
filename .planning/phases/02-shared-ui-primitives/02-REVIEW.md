---
phase: 02-shared-ui-primitives
reviewed: 2026-05-19T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - src/components/AlertCard.jsx
  - src/components/DataCard.jsx
  - src/components/LastUpdated.jsx
  - src/components/LoadingState.jsx
  - src/components/StatusBadge.jsx
  - src/components/TooltipWrapper.jsx
  - src/constants/tooltips.js
  - src/hooks/useNow.js
  - src/tabs/MarsTab.jsx
  - src/tabs/MoonTab.jsx
findings:
  critical: 0
  warning: 4
  info: 7
  total: 11
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-05-19
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

The Phase 2 primitive library is in solid shape: prop contracts match the locked specs in `02-CONTEXT.md`, palette/severity class strings are static enough for Tailwind JIT to pick up, color tokens (`mars-accent`, `moon-accent`, `space-900`, etc.) all exist in `tailwind.config.js`, and the shared `useNow()` ticker correctly reference-counts its `setInterval`. No critical security or correctness bugs.

The findings cluster around two real areas:

1. **TooltipWrapper accessibility + repositioning gaps.** The portal-positioned tooltip does not reposition on scroll/resize, has no touch-device affordance, and one trigger (`AlertCard`'s info icon) advertises `role="button"` without a keyboard activation handler. None block the Phase 2 demo, but they should be tracked before Phase 5 polish.
2. **Defensive correctness around external content paths.** Phase 2 content comes from a constants file (safe), but the typing on `content` (`string | ReactNode`) means any later wiring that pipes API text through `<TooltipWrapper content={apiText} />` should stay on the string path — flagged as Info since the call sites today are constants-only.

No source files were modified during review.

## Warnings

### WR-01: AlertCard info icon advertises `role="button"` but has no keyboard activation

**File:** `src/components/AlertCard.jsx:46-57`
**Issue:** The info icon `<span>` carries `role="button"` and `tabIndex={0}`, which tells AT users "this is a button — press Enter/Space to activate it." But no `onClick` or `onKeyDown` handler exists; the tooltip is opened only via the `onFocus`/`onMouseEnter` injected by `TooltipWrapper.cloneElement`. So a screen-reader user who tabs to it and presses Enter gets no observable response, which violates the contract `role="button"` implies. The visible affordance (hover/focus = tooltip) doesn't need the button role at all.
**Fix:** Drop `role="button"` and keep `tabIndex={0}` so the focus-driven tooltip path still works. The semantic is closer to a static info affordance than a button. Suggested replacement:
```jsx
<span
  className="ml-auto text-slate-500 text-xs cursor-help"
  aria-label="More info"
  tabIndex={0}
>
  ⓘ
</span>
```
If you want to keep `role="button"` (e.g. for click-to-pin tooltip later), add an `onKeyDown` that toggles the tooltip on Enter/Space and an `onClick` to match — but that's a Phase 5 feature, not a Phase 2 requirement.

### WR-02: TooltipWrapper does not reposition on scroll or resize

**File:** `src/components/TooltipWrapper.jsx:69-101`
**Issue:** Position is computed once in `useLayoutEffect` keyed on `[isOpen, side, content]`. The tooltip is portaled to `document.body` with `position: fixed`, so scrolling the page leaves the tooltip floating where the trigger *was*, not where it *is*. Same problem on viewport resize. For a tooltip that only opens on hover this is mostly cosmetic (the user has to keep hovering), but on focus-driven opens (keyboard nav, AlertCard info icon) the user can scroll while focused and the tooltip will visibly detach from its trigger.
**Fix:** Add scroll/resize listeners while open and re-run positioning. Throttle with `requestAnimationFrame` to avoid layout thrash. Or, simpler: close the tooltip on scroll, mirroring what most native browser tooltips do.
```jsx
useEffect(() => {
  if (!isOpen) return
  const onMove = () => close()  // simplest: dismiss on scroll/resize
  window.addEventListener('scroll', onMove, { passive: true, capture: true })
  window.addEventListener('resize', onMove)
  return () => {
    window.removeEventListener('scroll', onMove, { capture: true })
    window.removeEventListener('resize', onMove)
  }
}, [isOpen, close])
```

### WR-03: TooltipWrapper horizontal clamp can produce negative `maxLeft`

**File:** `src/components/TooltipWrapper.jsx:97-98`
**Issue:** When `tipRect.width > window.innerWidth - 2 * VIEWPORT_MARGIN` (very narrow viewport or very wide tooltip), `maxLeft` becomes negative. Then `Math.max(VIEWPORT_MARGIN, Math.min(centeredLeft, maxLeft))` collapses to `VIEWPORT_MARGIN` but the tooltip still overflows the right edge — clipped instead of clamped. The `max-w-xs` class on the tooltip (line 174 ≈ 320px) makes this unlikely on desktop but reachable on small mobile viewports.
**Fix:** When the tooltip cannot fit, shrink it explicitly. Add an inline `maxWidth` to bound it to the viewport:
```jsx
const availableWidth = window.innerWidth - 2 * VIEWPORT_MARGIN
const tipMaxWidth = Math.min(320, availableWidth)
// ...
<div
  style={{ top: position.top, left: position.left, maxWidth: tipMaxWidth }}
  ...
>
```
Then `maxLeft` is guaranteed `>= VIEWPORT_MARGIN`. Lower priority than WR-02 since Phase 2 is desktop-first per CLAUDE.md, but worth a defensive guard.

### WR-04: TooltipWrapper has no touch-device affordance

**File:** `src/components/TooltipWrapper.jsx:145-164`
**Issue:** Only `onMouseEnter/Leave/Focus/Blur` are wired. Touch devices fire neither hover nor focus on a tap-to-not-activate trigger like a `<span>`. The result: tooltip content (which is the project's primary education layer per CLAUDE.md) is invisible to any mobile user who lands on the deployed app, even in the "non-broken baseline" v1 spec. This may be acceptable per the desktop-first scope, but is worth flagging because tooltips carry the educational copy this whole product is built around.
**Fix:** Add tap-to-open by wiring an `onClick` that toggles `isOpen` and dismissing on subsequent click-outside (the existing `onMouseDown` document listener already covers this). Optional but cheap:
```jsx
onClick: (event) => {
  isOpen ? close() : setIsOpen(true)
  if (children.props.onClick) children.props.onClick(event)
},
```
If touch support is explicitly out-of-scope for v1, leave a comment in the file noting the deferred decision so it isn't re-discovered later.

## Info

### IN-01: `useNow()` realignment uses stale `value` from closure

**File:** `src/hooks/useNow.js:50-52`
**Issue:** The mount-time realignment compares `value !== now`. Since the effect's dep array is `[]`, `value` is captured from the initial render's closure. This is fine in practice — if the module-level `now` has advanced between component construction and effect run, `setValue(now)` corrects it, and the eslint-disable on line 60 makes the intent explicit. Calling out because the closure-staleness pattern is the kind of thing future readers will second-guess. A short comment beside line 50 explaining "compares against the initial-render snapshot of `now`, not the latest" would save future-you a re-derivation.
**Fix:** Add a one-line comment above the `if (value !== now)` block, or read `now` only and drop the comparison entirely (always call `setValue(now)` — React bails out of equal updates anyway).

### IN-02: `useNow()` module-level mutable state leaks across HMR / tests

**File:** `src/hooks/useNow.js:21-24`
**Issue:** `now`, `listeners`, and `intervalId` are module-scoped. Vite HMR will preserve module identity across reloads, which is correct, but unit tests that import the hook in multiple test files without an explicit module reset will share the same `listeners` Set. Not a production bug; flagging for when Phase 6 adds tests.
**Fix:** When tests arrive, either reset via `vi.resetModules()` between suites or add a `__resetForTests()` export gated behind `import.meta.env.MODE === 'test'`. No action needed in Phase 2.

### IN-03: `TooltipWrapper.content` is typed `string | ReactNode` — future API-text path needs care

**File:** `src/components/TooltipWrapper.jsx:35,177`
**Issue:** Today all `content` values flow from `src/constants/tooltips.js` (safe). The JSDoc allows `ReactNode`, and `{content}` on line 177 will render whatever React node it gets. React's default JSX text rendering escapes string content safely, so passing API-derived strings is fine. The risk is downstream: a maintainer who sees the `ReactNode` type may be tempted to pre-build JSX (or use a raw-HTML escape hatch) containing API strings without sanitisation. Flagging so future call sites stay on the string-only path.
**Fix:** Tighten the JSDoc to `content: string` (or `string | { text: string }`) since Phase 2's actual usage only ever passes strings. Future rich content can re-widen the type with a deliberate code change and a sanitiser step.

### IN-04: `AlertCard.formatUtc` and `LastUpdated.formatRelative` duplicate parsing logic

**File:** `src/components/AlertCard.jsx:31-40` and `src/components/LastUpdated.jsx:28-52`
**Issue:** Both files independently handle `null/undefined`, `new Date(...)`, and `isNaN(d.getTime())`. Same pattern, three call sites (formatRelative, formatAbsoluteUtc, formatUtc). Not a bug — just a candidate for a `src/utils/time.js` extraction in Phase 3 when more components start consuming timestamps.
**Fix:** Defer until at least three real consumers exist. Phase 3's MAAS2 wiring will probably add the third use case; bundle the extraction then.

### IN-05: MarsTab / MoonTab module-level `new Date()` will visibly stale over long sessions

**File:** `src/tabs/MarsTab.jsx:18-22` and `src/tabs/MoonTab.jsx:17-21`
**Issue:** Each tab samples `NOW = new Date()` at module load. The comment correctly explains the rationale (stable demo timestamps), but if the dev keeps the app open for hours, the "2 hours ago" label becomes "5 hours ago", which can look confusing in the demo. Acceptable for Phase 2 scaffolding since these are replaced by real data hooks in Phase 3/4.
**Fix:** No action. Just confirming the trade-off is intentional and noted in the SUMMARY.

### IN-06: `TooltipWrapper` uses `children.ref` (legacy access pattern)

**File:** `src/components/TooltipWrapper.jsx:135`
**Issue:** `children.ref` accesses the legacy `ref` property on a React element, which works in React 18.3 (the version in `package.json`). In React 19, refs are passed as a regular prop and this access path is deprecated. Not actionable today, but the file will need a small update at the React 19 upgrade.
**Fix:** When upgrading to React 19, replace with `children.props.ref` and the new ref-as-prop convention. Add a TODO so the upgrade catches it:
```jsx
// TODO(react-19): refs become regular props — use children.props.ref
const childRef = children.ref
```

### IN-07: TooltipWrapper tooltip body has `pointer-events-none` — blocks text selection in tooltip

**File:** `src/components/TooltipWrapper.jsx:174`
**Issue:** `pointer-events-none` on the tooltip simplifies click-outside (any click is "outside") but prevents users from selecting or copying tooltip text. Some of the educational copy in `tooltips.js` (e.g., "+127°C in direct sun to -173°C in shadow") is exactly the kind of factoid a student would want to copy. Low priority — this is a deliberate trade-off and Phase 2 doesn't require copyable tooltips.
**Fix:** If copy-from-tooltip becomes a requirement, drop `pointer-events-none` and tighten click-outside detection to ignore clicks on `tooltipRef.current`. The existing `onMouseDown` handler already has that check (line 115), so removing `pointer-events-none` alone would suffice. Defer to Phase 5.

---

_Reviewed: 2026-05-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
