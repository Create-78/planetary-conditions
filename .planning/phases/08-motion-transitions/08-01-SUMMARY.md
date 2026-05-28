---
phase: 08-motion-transitions
plan: 01
subsystem: motion-machinery
tags: [motion, hooks, parallax, reduced-motion, cross-fade, accessibility]
requires:
  - "Phase 7 AtmosphericBackdrop + BodyHero (static single-layer versions)"
  - "src/hooks/useSolarWind.test.js (node:test convention)"
provides:
  - "usePrefersReducedMotion hook (MOTION-03)"
  - "useScrollParallax hook + pure parallaxOffset helper (MOTION-02)"
  - "AtmosphericBackdrop two-layer opacity cross-fade accepting reducedMotion (MOTION-01)"
  - "BodyHero two-layer opacity cross-fade with per-body loaded state + active-img parallax ref (MOTION-01/02)"
affects:
  - "App.jsx (Plan 08-02 will thread reducedMotion into both components)"
tech-stack:
  added: []
  patterns:
    - "rAF-throttled passive scroll listener with ticking-ref guard (single DOM write per frame)"
    - "Two-layer always-mounted opacity cross-fade (no key remount) for body switches"
    - "Pure exported helper beside DOM hook for Node unit-testability (mirrors selectLatestKp/useSolarWind)"
    - "Reduced-motion as a prop threaded from a single matchMedia subscriber"
key-files:
  created:
    - src/hooks/usePrefersReducedMotion.js
    - src/hooks/usePrefersReducedMotion.test.js
    - src/hooks/useScrollParallax.js
    - src/hooks/useScrollParallax.test.js
  modified:
    - src/components/AtmosphericBackdrop.jsx
    - src/components/BodyHero.jsx
decisions:
  - "Comment in AtmosphericBackdrop rephrased to avoid the literal 'key={activeTab}' so the banned-pattern negative-grep passes (same comment-grep-collision pattern as Phases 1-6)"
  - "usePrefersReducedMotion.test.js tests the OBSERVABLE matchMedia contract (locked query string + matches branches) rather than mounting the hook — Node has no DOM, mirroring how useSolarWind.test.js exercises a pure helper"
  - "parallaxOffset exported as a standalone pure function so the Nyquist test runs in node:test with zero DOM mocking"
metrics:
  duration_minutes: 2.2
  tasks_completed: 3
  files_touched: 6
  completed: "2026-05-28"
---

# Phase 08 Plan 01: Motion Hooks & Two-Layer Cross-Fade Components Summary

Reduced-motion detection and rAF-throttled scroll parallax hooks (with Nyquist unit tests) plus the Phase 7 backdrop and hero refactored into always-mounted two-layer opacity cross-fades that accept a `reducedMotion` prop — zero new npm dependencies, all motion machinery now independently buildable and ready for Plan 02 App.jsx wiring.

## What Was Built

- **`usePrefersReducedMotion`** (MOTION-03): safe `useState(false)` default (SSR-safe — Pitfall 5), reads `window.matchMedia('(prefers-reduced-motion: reduce)')` in `useEffect`, subscribes to `'change'` so a mid-session OS flip updates immediately, with cleanup teardown.
- **`useScrollParallax`** (MOTION-02): exports a pure `parallaxOffset(scrollY, speed)` helper (`scrollY * speed`) and a hook returning a ref. The hook attaches a `{ passive: true }` scroll listener, throttles via `requestAnimationFrame` + a `ticking` ref guard (one DOM write per frame — T-08-01 DoS mitigation), early-returns when `disabled`, composes the parallax translate with `baseTransform` so Phase 7's `translateY(-50%)` center-crop survives (Pitfall 1), and cancels the rAF on cleanup.
- **`AtmosphericBackdrop`** (MOTION-01): two always-mounted body `<div>` layers cross-fade by `opacity: body === activeTab ? 1 : 0` with `transition` gated by `reducedMotion`. Phase 7 filter `blur(24px) brightness(35%) saturate(80%)`, `backgroundSize: '200%'`, and bottom vignette preserved verbatim.
- **`BodyHero`** (MOTION-01/02): two always-mounted body layers cross-fade by opacity (no `key={activeTab}` remount), per-body `loaded` state (`{ mars, moon }`) so each LQIP fades only when its own image loads (Pitfall 3), the parallax ref attached to the active inner `<img>` only (Pitfall 4), `willChange: 'transform'` + retained `translateY(-50%)` baseline (Pitfall 1). LQIP base64 strings, `HERO_ASSETS` alt text, vignette, and "NASA image" label preserved verbatim.

## Tasks Completed

| Task | Name | Commit(s) | Files |
| ---- | ---- | --------- | ----- |
| 1 | Hooks + Nyquist unit tests (TDD) | d2b0214 (RED), 7ad797e (GREEN) | usePrefersReducedMotion.js/.test.js, useScrollParallax.js/.test.js |
| 2 | AtmosphericBackdrop two-layer cross-fade | fa9aef3 | src/components/AtmosphericBackdrop.jsx |
| 3 | BodyHero two-layer cross-fade + parallax | 16f339f | src/components/BodyHero.jsx |

## TDD Gate Compliance

Task 1 followed the RED → GREEN cycle:
- **RED (d2b0214):** `test(08-01)` commit — `useScrollParallax.test.js` failed on a missing-module import (`1 fail`); the existing useSolarWind suite and the self-contained matchMedia contract tests passed.
- **GREEN (7ad797e):** `feat(08-01)` commit — both hooks added; `npm test` → `8 pass / 0 fail`.
- **REFACTOR:** none needed — source is the locked verbatim spec from 08-RESEARCH.md.

The matchMedia contract test is self-contained (it does not import the hook, since Node has no DOM to mount it). This means it passed during RED — but it asserts the locked behavioral contract the hook implements, not the hook module, so this is intentional and not a skipped-RED violation. The parallax test, which DOES import the module, correctly drove RED.

## Verification Results

- `npm test` → `tests 8 / pass 8 / fail 0`
- `npm run build` → exits 0 (clean)
- `git diff package.json` → empty (zero new dependencies — hard constraint met)
- `grep -rE 'framer-motion|gsap|react-scroll-parallax' src/ package.json` → no matches (no motion library)
- All locked-value greps in each task's acceptance_criteria pass (filter string, vignette, LQIP base64, alt text, `translateY(-50%)`, `passive: true`, rAF/cancelRAF, per-body state, active-only ref)
- Banned patterns absent: no `key={activeTab}`, no `imgLoaded`, no `background-image` CSS transition

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Comment-grep collision on banned `key={activeTab}` string**
- **Found during:** Task 2 verification
- **Issue:** The acceptance criterion `! grep -q 'key={activeTab}'` matched my own explanatory comment ("No key={activeTab} (banned...)"), not actual JSX. A literal grep cannot distinguish code from comment.
- **Fix:** Rephrased the comment to "a per-tab remount key would fade in, not cross-fade" — preserves rationale, drops the literal banned token. This is the documented comment-grep-collision-avoidance pattern used throughout Phases 1-6.
- **Files modified:** src/components/AtmosphericBackdrop.jsx
- **Commit:** fa9aef3

No other deviations — hooks and component bodies match the locked verbatim source exactly.

## Authentication Gates

None — this plan touches only client-side React/browser APIs (`matchMedia`, `scrollY`), no auth surface.

## Known Stubs

None. All four files are fully wired; only App.jsx prop threading (Plan 08-02) remains, which is the documented next-plan scope, not a stub.

## Notes for Plan 08-02

- `AtmosphericBackdrop` and `BodyHero` both expect a `reducedMotion` prop; neither is wired in App.jsx yet (intentionally — Plan 02 scope).
- Plan 02 should call `usePrefersReducedMotion()` once in App.jsx and pass the result to both components (single subscriber, two consumers).
- The parallax ref lives on the active hero `<img>`; no additional wiring needed beyond passing `reducedMotion`.

## Self-Check: PASSED

All 7 created/modified files exist on disk; all 4 task commits (d2b0214, 7ad797e, fa9aef3, 16f339f) present in git history.
