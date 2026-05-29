---
phase: 08-motion-transitions
verified: 2026-05-28T00:00:00Z
status: human_needed
score: 5/5 must-haves verified (automated)
overrides_applied: 0
human_verification:
  - test: "Cross-fade on tab switch (MOTION-01)"
    expected: "Backdrop and hero dissolve from one body to the other over ~500ms — no snap, no blank flash"
    why_human: "Visual animation quality cannot be verified programmatically — requires subjective assessment of smoothness"
  - test: "Parallax depth feel (MOTION-02)"
    expected: "Hero drifts ~10px at ~200px scroll; reads as depth, not jitter; data panel below does not shift"
    why_human: "Perceptual quality of scroll effect requires visual observation"
  - test: "Reduced-motion disables all animation (MOTION-03)"
    expected: "With macOS Reduce Motion ON, tab switches are instant and hero is perfectly static; toggling it back restores animation"
    why_human: "Requires OS setting change and live observation of both on and off states"
---

# Phase 8: Motion & Transitions Verification Report

**Phase Goal:** The dashboard feels alive — backdrop and hero animate on interaction and scroll — while users who request reduced motion get an instant, static experience.
**Verified:** 2026-05-28
**Status:** human_needed
**Re-verification:** No — initial verification

**Context:** The human-verify checkpoint (Plan 08-02 Task 3) was approved 2026-05-28. The user noted that the parallax effect is subtle in the current contained-hero layout and has decided to address this with a new Phase 8.5 (full-background hero + glassmorphic overlay). This is a design improvement decision, not a Phase 8 failure. All automated gates below are green.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `useScrollParallax` exports a pure `parallaxOffset(scrollY, speed)` helper returning `scrollY * speed` | VERIFIED | `parallaxOffset` exported from `useScrollParallax.js` line 4; node:test suite confirms `parallaxOffset(200, 0.05) === 10`, `parallaxOffset(0, 0.05) === 0`, `parallaxOffset(1000, 0.05) === 50` — 3 passing tests |
| 2 | `useScrollParallax` returns a ref and attaches a passive, rAF-throttled scroll listener that is skipped when `disabled=true` | VERIFIED | `passive: true` confirmed in hook; `requestAnimationFrame` + `cancelAnimationFrame` present; `if (disabled \|\| !ref.current) return` early-return on line 14; ticking-ref guard pattern present |
| 3 | `usePrefersReducedMotion` initial state is `false` and updates to `window.matchMedia('(prefers-reduced-motion: reduce)').matches` inside `useEffect` | VERIFIED | `useState(false)` on line 6; `window.matchMedia('(prefers-reduced-motion: reduce)')` inside `useEffect` on line 8; `addEventListener('change', handler)` + cleanup teardown present; 2 passing contract tests |
| 4 | `AtmosphericBackdrop` renders both mars and moon body layers always-mounted with opacity driven by `activeTab` and an opacity transition gated by `reducedMotion` | VERIFIED | `BODIES.map` renders both layers; `opacity: body === activeTab ? 1 : 0` present; `transition: reducedMotion ? 'none' : 'opacity 500ms ease'` present; no `key={activeTab}` (banned pattern absent) |
| 5 | `BodyHero` renders both mars and moon picture layers always-mounted (no `key={activeTab}`), tracks per-body loaded state, and attaches the parallax ref to the active inner `<img>` | VERIFIED | `BODIES.map` renders both layers; `useState({ mars: false, moon: false })` for per-body loaded state; `ref={isActive ? parallaxRef : null}` on inner `<img>`; no `key={activeTab}`; no `imgLoaded` (old single boolean fully replaced) |

**Score:** 5/5 truths verified (automated)

### Deferred Items

None.

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/hooks/usePrefersReducedMotion.js` | Reduced-motion detection hook with change listener | VERIFIED | 15 lines; contains `prefers-reduced-motion: reduce`, `useState(false)`, `addEventListener('change')` |
| `src/hooks/usePrefersReducedMotion.test.js` | Unit test mocking matchMedia true/false (MOTION-03) | VERIFIED | 2 tests — locked query string + both matches branches |
| `src/hooks/useScrollParallax.js` | rAF-throttled scroll parallax hook + pure `parallaxOffset` helper | VERIFIED | 39 lines; both exports present; `requestAnimationFrame`, `cancelAnimationFrame`, `passive: true`, `baseTransform` composition |
| `src/hooks/useScrollParallax.test.js` | Unit test for `parallaxOffset` math (MOTION-02) | VERIFIED | 3 tests — 200px/0px/1000px scroll cases all pass |
| `src/components/AtmosphericBackdrop.jsx` | Two-layer opacity cross-fade backdrop | VERIFIED | Two always-mounted layers via `BODIES.map`; locked filter + vignette values preserved verbatim |
| `src/components/BodyHero.jsx` | Two-layer opacity cross-fade hero with parallax ref | VERIFIED | Two always-mounted layers; per-body loaded state; parallax ref on active `<img>`; LQIP base64 strings `UklGRgIBAAB` (mars) and `UklGRmIAAAB` (moon) preserved |
| `src/App.jsx` | Reduced-motion signal threaded to both motion components | VERIFIED | `usePrefersReducedMotion` imported + called once; `reducedMotion={reducedMotion}` appears exactly twice — once on `AtmosphericBackdrop`, once on `BodyHero` |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/components/BodyHero.jsx` | `src/hooks/useScrollParallax.js` | `import { useScrollParallax }` + hook call returning ref attached to active `<img>` | WIRED | Import on line 6; `useScrollParallax({ speed: 0.05, disabled: reducedMotion, baseTransform: 'translateY(-50%)' })` called on line 27; ref assigned to active `<img>` on line 49 |
| `src/components/AtmosphericBackdrop.jsx` | `activeTab` prop | `opacity: body === activeTab ? 1 : 0` | WIRED | Ternary present on line 28; both body layers receive opacity based on `activeTab` comparison |
| `src/App.jsx` | `src/hooks/usePrefersReducedMotion.js` | `import { usePrefersReducedMotion }` + single hook call | WIRED | Import on line 6; `const reducedMotion = usePrefersReducedMotion()` on line 25 |
| `src/App.jsx` | `AtmosphericBackdrop` / `BodyHero` | `reducedMotion={reducedMotion}` prop pass | WIRED | `reducedMotion={reducedMotion}` on both call sites (lines 29 + 49); confirmed via grep count = 2 |

---

## Data-Flow Trace (Level 4)

Not applicable for motion hooks — these components do not render data from an API or store. Motion behavior (opacity, transform) is driven by props (`activeTab`, `reducedMotion`) and browser APIs (`window.scrollY`, `window.matchMedia`), which are verified via the key links above.

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `parallaxOffset(200, 0.05) === 10` | `npm test` | `tests 8 / pass 8 / fail 0` | PASS |
| `parallaxOffset(0, 0.05) === 0` | `npm test` | included in above | PASS |
| `parallaxOffset(1000, 0.05) === 50` | `npm test` | included in above | PASS |
| matchMedia locked query string contract | `npm test` | included in above | PASS |
| Build produces 107 modules, exits 0 | `npm run build` | `✓ built in 1.47s` | PASS |
| Motion identifiers wired across all expected files | `grep -rl 'reducedMotion' src/` | App.jsx, AtmosphericBackdrop.jsx, BodyHero.jsx confirmed | PASS |
| No motion library introduced | `grep -rE 'framer-motion\|gsap\|react-scroll-parallax' src/ package.json` | no matches | PASS |
| Zero new npm dependencies | `git diff --stat package.json package-lock.json` | empty | PASS |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| MOTION-01 | 08-01-PLAN.md, 08-02-PLAN.md | Backdrop and hero cross-fade when the user switches tabs | SATISFIED | Two-layer opacity cross-fade in AtmosphericBackdrop + BodyHero; `transition: opacity 500ms ease` gated by `reducedMotion`; `body === activeTab ? 1 : 0` pattern present in both; App.jsx threads `activeTab` to both; marked `[x]` in REQUIREMENTS.md |
| MOTION-02 | 08-01-PLAN.md, 08-02-PLAN.md | The hero responds to scroll with a gentle parallax (~10px) | SATISFIED | `useScrollParallax` hook present with `speed: 0.05`; pure `parallaxOffset` confirms 200px scroll = 10px; rAF-throttled passive scroll listener; ref on active `<img>` preserving `-50%` center-crop; `willChange: 'transform'`; marked `[x]` in REQUIREMENTS.md |
| MOTION-03 | 08-01-PLAN.md, 08-02-PLAN.md | With `prefers-reduced-motion: reduce` set, cross-fade and parallax are disabled | SATISFIED | `usePrefersReducedMotion` reads `window.matchMedia('(prefers-reduced-motion: reduce)')`, initial `false` (SSR-safe), subscribes to `change`; `reducedMotion` threaded to both components via App.jsx; `transition: none` when true; parallax hook `disabled: reducedMotion` early-returns; marked `[x]` in REQUIREMENTS.md |

No orphaned requirements — all three Phase 8 requirement IDs (MOTION-01, MOTION-02, MOTION-03) are claimed by both plans and verified above.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | — | — | — |

All banned patterns explicitly absent:
- No `key={activeTab}` on cross-fade layers (AtmosphericBackdrop.jsx or BodyHero.jsx)
- No `background-image` CSS transition
- No `style.top` for parallax (transform used throughout)
- No `framer-motion`, `gsap`, or `react-scroll-parallax`
- No raw setState in scroll handler (rAF + ticking guard used)
- No `window.scrollY` inside render (all inside `useEffect`)
- No scroll listener without `{ passive: true }`
- No `imgLoaded` single boolean (replaced by per-body `{ mars, moon }` state)

---

## Human Verification Required

The human-verify checkpoint (Plan 08-02 Task 3) was approved 2026-05-28 with the following observations:

- MOTION-01 cross-fade: Backdrop and hero dissolve smoothly across ~500ms on tab switch — confirmed.
- MOTION-01 duration feel: Snappy but deliberate at 500ms; reads right against the blurred backdrop — confirmed.
- MOTION-02 parallax: Hero drifts gently (~10px) on scroll; data panel does not shift — confirmed.
- MOTION-03 reduced-motion: With macOS Reduce Motion ON, tab switches are instant and hero is fully static; toggles live without refresh — confirmed.

Per the instructions, the following items are retained as `human_needed` in the frontmatter to accurately reflect that they require visual assessment (status: `human_needed` rather than `passed` per the verification decision tree), but these have already been assessed and approved:

1. **Cross-fade on tab switch (MOTION-01)**
   **Test:** Run `npm run dev`, switch between Mars and Moon tabs
   **Expected:** Backdrop and hero dissolve from one body to the other over ~500ms — no snap, no blank flash
   **Why human:** Visual animation quality; subjective smoothness cannot be verified programmatically
   **Checkpoint status:** APPROVED 2026-05-28

2. **Parallax depth feel (MOTION-02)**
   **Test:** Run `npm run dev`, scroll slowly after opening a tab
   **Expected:** Hero drifts ~10px at ~200px of scroll; data panel below does not move; first scroll pixel does not jump (center-crop preserved)
   **Why human:** Perceptual quality of ~10px effect; data panel isolation requires visual confirmation
   **Checkpoint status:** APPROVED 2026-05-28

3. **Reduced-motion disables all animation (MOTION-03)**
   **Test:** Run `npm run dev`, enable macOS System Settings → Accessibility → Display → "Reduce motion"
   **Expected:** Tab switches are instant (no fade); hero is static on scroll; toggling off restores animation without page refresh
   **Why human:** Requires OS setting change + live observation
   **Checkpoint status:** APPROVED 2026-05-28

---

## Gaps Summary

No gaps. All five automated must-haves are verified. All three requirements (MOTION-01, MOTION-02, MOTION-03) are satisfied. All banned anti-patterns are absent. Build is green. Test suite is 8/0.

Status is `human_needed` per the decision tree (automated checks passed; human verification items exist), however the human-verify checkpoint was already approved on 2026-05-28. The subjective "feels alive" criterion is technically correct per the plan's locked values. A Phase 8.5 layout redesign (full-background hero + glassmorphic overlay) is planned as a design improvement before Phase 9 executes.

---

_Verified: 2026-05-28_
_Verifier: Claude (gsd-verifier)_
