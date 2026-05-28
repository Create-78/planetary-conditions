---
phase: 08-motion-transitions
depth: standard
reviewed: 2026-05-28T00:00:00Z
reviewer: Claude (gsd-code-reviewer, claude-sonnet-4-6)
files_reviewed: 7
files_reviewed_list:
  - src/hooks/usePrefersReducedMotion.js
  - src/hooks/usePrefersReducedMotion.test.js
  - src/hooks/useScrollParallax.js
  - src/hooks/useScrollParallax.test.js
  - src/components/AtmosphericBackdrop.jsx
  - src/components/BodyHero.jsx
  - src/App.jsx
findings:
  critical: 0
  high: 1
  medium: 3
  low: 2
  info: 2
  total: 8
status: issues_found
---

# Phase 8: Motion & Transitions — Code Review

**Reviewed:** 2026-05-28
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Executive Summary

Phase 8 is a clean, well-reasoned implementation of three motion behaviors — cross-fade backdrop (MOTION-01), scroll parallax (MOTION-02), and `prefers-reduced-motion` guard (MOTION-03) — with zero new runtime dependencies. The architecture correctly applies the two always-mounted opacity-layer pattern, rAF throttling, the passive scroll listener, and the SSR-safe `false` default for reduced-motion. One high-severity bug exists: `useScrollParallax` attaches only to the **active** image, so when the tab switches the parallax ref re-attaches but the previous scroll position has already been applied as an inline `style.transform` on the now-hidden layer, and — more importantly — the newly active image starts with whatever CSS default transform is on it rather than the composed value, producing a visible position jump on first scroll after a tab switch. The remaining findings are medium-to-info in severity: a missing `{ passive: true }` option on the `removeEventListener` call (harmless in current browsers but technically incorrect), a `ticking` ref that is never reset to `false` when the rAF is cancelled on cleanup (can suppress the first scroll event after a fast tab switch), two test-coverage gaps, and two minor style/naming observations.

---

## Findings

| ID | Severity | File | Line | Title | Description | Recommendation |
|----|----------|------|------|-------|-------------|----------------|
| F-01 | high | `src/components/BodyHero.jsx` | 49 | Parallax ref only on active image — stale transform on tab switch | `parallaxRef` is passed to the active `<img>` and `null` to the inactive one. When the tab switches, the inactive image's `style.transform` retains the last composed value written by the rAF callback (`translateY(Xpx) translateY(-50%)`). Because opacity snaps back to 0 this is invisible, but the newly active image has never had its transform written by the hook yet (the scroll listener only fires on scroll), so on the next scroll it starts from the CSS-rule default `translateY(-50%)` (line 57) rather than the composed position. If the user has scrolled 100 px before switching tabs the hero jumps by `100 * 0.05 = 5 px` on the first scroll after the switch. | On tab switch, reset the outgoing image's transform and prime the incoming image's transform immediately. The cleanest fix: keep `parallaxRef` always attached (mount once), track `activeTab` in the hook callback to decide which element to mutate, or call `update()` once synchronously when `disabled` transitions from `true` to `false`. Simpler alternative: use a single wrapper `<div>` for the transform target placed outside the opacity layers, since the two images are always in the same position anyway. |
| F-02 | medium | `src/hooks/useScrollParallax.js` | 32–35 | `removeEventListener` missing `{ passive: true }` option | The `addEventListener` at line 31 uses `{ passive: true }`. The matching `removeEventListener` at line 32 omits the options object. Per spec, the `capture` flag is the only distinguishing attribute for listener identity; `passive` is not used for matching, so removal works correctly today. However it is inconsistent and could confuse future maintainers into thinking these are different listeners. | Add `{ passive: true }` to `removeEventListener` to mirror the `addEventListener` call: `window.removeEventListener('scroll', onScroll, { passive: true })`. |
| F-03 | medium | `src/hooks/useScrollParallax.js` | 25–28 | `ticking` ref not reset to `false` when pending rAF is cancelled on cleanup | On effect cleanup (disabled toggle or prop change), `cancelAnimationFrame(rafHandle.current)` is called but `ticking.current` is left `true`. If the effect re-runs quickly (e.g., rapid tab switching), the new scroll listener will see `ticking.current === true` and silently drop the first scroll event. The user will not see the parallax move until a second scroll event fires. | Reset `ticking.current = false` in the cleanup function, after `cancelAnimationFrame`. |
| F-04 | medium | `src/hooks/usePrefersReducedMotion.test.js` | 1–25 | Test does not exercise the hook — only validates the mock factory | The test file acknowledges that the DOM-less environment prevents mounting the hook. The two tests only confirm that a hand-rolled `makeMatchMedia` mock returns correct values — they do not cover `usePrefersReducedMotion` at all (no import of the hook, no call to it). This means a regression in the hook (e.g., wrong query string, missing `addEventListener` call) would not be caught. | Add a contract test that at minimum imports and invokes the hook in a mocked `window.matchMedia` environment (jsdom or a `globalThis.window` shim). At a minimum, test that the module exports a function named `usePrefersReducedMotion`. The existing tests are fine as documentation but should be labelled as "mock-factory sanity checks" rather than "hook tests". |
| F-05 | medium | `src/hooks/useScrollParallax.test.js` | 1–13 | Hook path not tested — only the pure helper function | `useScrollParallax.test.js` tests `parallaxOffset` (the pure math helper) but not `useScrollParallax` itself. The rAF throttling logic, passive listener registration, cleanup, and `baseTransform` composition are untested. A regression in any of those would be invisible. | Add at least one test that mounts the hook (or exercises `onScroll` / `update` in isolation) using a lightweight DOM stub. `parallaxOffset` tests are valuable; they just should not be the only coverage. |
| F-06 | low | `src/components/BodyHero.jsx` | 42–44 | LQIP `transition-opacity duration-300` not gated by `reducedMotion` — intentional but undocumented | The comment on line 41 says "duration-300 retained regardless of reducedMotion" and presents it as intentional (image-loading concern, not motion). This is a defensible product decision, but WCAG 2.3.3 Success Criterion (AAA) recommends suppressing all non-essential animation for users who opt out. | Add a brief inline note citing the product decision authority (e.g., "D-11: LQIP fade is an image-loading cue, retained per Discussion.md §X") so future reviewers understand this is a deliberate choice, not an oversight. If stricter accessibility compliance is ever required, `reducedMotion` can be forwarded to the LQIP `transition` class as well. |
| F-07 | low | `src/components/AtmosphericBackdrop.jsx` | 6–9 | `BODIES` constant duplicated between `AtmosphericBackdrop.jsx` and `BodyHero.jsx` | Both files define `const BODIES = ['mars', 'moon']` independently. A future addition of a third body (e.g., Europa) would require touching two files. | Extract `BODIES` (and potentially `BACKDROP_ASSETS`) to `src/constants/bodies.js` or an existing constants module and import in both components. |
| F-08 | info | `src/hooks/useScrollParallax.js` | 8 | `baseTransform` default value in hook signature creates hidden coupling | The hook defaults `baseTransform` to `'translateY(-50%)'` — the specific Phase 7 value. This is fine for the current single usage but means any second usage of the hook must explicitly override it or silently inherit a transform that may not apply. | Document the default in a comment: `// Default matches Phase 7 center-crop; callers with different layout must override.` |

---

## Severity Counts

| Severity | Count |
|----------|-------|
| critical | 0 |
| high | 1 |
| medium | 3 |
| low | 2 |
| info | 2 |
| **total** | **8** |

---

## Sign-off

This review is advisory only and does not block execution. All findings are recommendations; the implementor decides which to act on.

_Reviewer: Claude (gsd-code-reviewer, claude-sonnet-4-6)_
_Depth: standard_
_Reviewed: 2026-05-28_
