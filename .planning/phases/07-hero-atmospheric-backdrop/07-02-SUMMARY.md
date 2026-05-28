---
phase: 07-hero-atmospheric-backdrop
plan: 02
subsystem: ui
tags: [hero, atmospheric-backdrop, lqip, blur-up, webp, picture-element, artist-label, aspect-ratio, cls]

# Dependency graph
requires:
  - "07-01 — src/assets/bodies/mars-1600.webp + mars-1600.png + moon-1600.webp + moon-1600.png"
  - "07-01 — 07-01-LQIP.md base64 data URIs (mars + moon)"
provides:
  - "src/components/AtmosphericBackdrop.jsx — fixed full-bleed blurred+dimmed backdrop (not yet mounted)"
  - "src/components/BodyHero.jsx — 16/7 framed hero with LQIP blur-up + artist label (not yet mounted)"
  - "src/constants/tabs.js — extended with heroAlt strings per tab"
affects: [07-03, App.jsx]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "LQIP blur-up: inline data:image/webp;base64 as background-image on absolute-positioned div, opacity driven by imgLoaded useState flag, CSS transition-opacity 300ms"
    - "picture + source type=image/webp + img PNG fallback — WebP-first with PNG graceful degradation (D-11)"
    - "key={activeTab} on picture element — remounts img on body switch, resetting imgLoaded so LQIP shows again for new body"
    - "AtmosphericBackdrop: CSS filter (blur/brightness/saturate) via inline style — background-image not <img>, so filter applies to the whole element"
    - "overflow-hidden on AtmosphericBackdrop container clips blur edge bleed at viewport edges"

key-files:
  created:
    - "src/components/AtmosphericBackdrop.jsx"
    - "src/components/BodyHero.jsx"
  modified:
    - "src/constants/tabs.js"

key-decisions:
  - "Components created but NOT mounted in App.jsx — Plan 03 wires them and runs live contrast/CLS/perf verification"
  - "AtmosphericBackdrop filter starting values: blur(24px) brightness(35%) saturate(80%) — tunable; Plan 03 may dial brightness toward 25% under live contrast check (D-05/D-06)"
  - "BodyHero bottom vignette uses transparent 100% (not transparent 40%) — full fade over bottom third for a stronger data-panel handoff than the backdrop's 40% stop"
  - "Real LQIP base64 strings inlined verbatim from 07-01-LQIP.md (mars: 163 chars, moon: 159 chars) — no REPLACE_WITH placeholders remain"
  - "width={1600} height={700} on img reserves intrinsic dimensions for CLS=0 even before CSS aspect-ratio locks it — belt-and-suspenders IMG-02 compliance"

# Metrics
duration: 2min
completed: 2026-05-28
---

# Phase 7 Plan 02: Hero Components Summary

**AtmosphericBackdrop (fixed full-bleed CSS-filter backdrop) and BodyHero (16/7 LQIP blur-up hero with artist label) built and verified; tabs.js extended with heroAlt strings; both components unmounted pending Plan 03 wiring**

## Performance

- **Duration:** ~2 minutes
- **Started:** 2026-05-28T17:17:53Z
- **Completed:** 2026-05-28T17:19:51Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Extended `src/constants/tabs.js` with `heroAlt` strings per tab (U+2014 em-dash, honest alt text per D-02)
- Created `AtmosphericBackdrop.jsx`: fixed inset-0 z-0 pointer-events-none aria-hidden decorative shell, CSS filter `blur(24px) brightness(35%) saturate(80%)`, bottom gradient anchor to #020617
- Created `BodyHero.jsx`: aspect-[16/7] rounded container, instant LQIP blur-up (two real base64 URIs inlined), picture+source+img with WebP+PNG fallback, reserved dimensions (CLS=0), key={activeTab} remount, "Artist's impression" honesty label with aria-label
- `npm run build` exits 0 — all three Vite asset imports resolve cleanly

## Task Commits

1. **Task 1: Extend tabs.js with heroAlt strings** — `32ba8a6`
2. **Task 2: Create AtmosphericBackdrop.jsx** — `7c8b73d`
3. **Task 3: Create BodyHero.jsx** — `780faf4`

## Key Implementation Details

### AtmosphericBackdrop.jsx

- Shell: `pointer-events-none fixed inset-0 z-0 overflow-hidden` (mirrors StarField pattern)
- Background source: `BACKDROP_ASSETS[activeTab]` — Vite-resolved URL from static WebP import
- CSS filter (inline style): `blur(24px) brightness(35%) saturate(80%)` — tunable starting values
- No `opacity:` override (brightness handles darkening — D-05)
- Child div: `absolute inset-0` with `linear-gradient(to top, #020617 0%, transparent 40%)` gradient
- No "Artist's impression" text (D-03 — label belongs only on the hero)

### BodyHero.jsx

- Container: `relative w-full aspect-[16/7] rounded-lg overflow-hidden mb-4`
- LQIP layer: `absolute inset-0 bg-cover bg-center transition-opacity duration-300`, `filter: blur(8px)`, `opacity: imgLoaded ? 0 : 1`
- LQIP data URIs inlined (mars 163 chars, moon 159 chars — validated in Plan 01 T-07-04)
- `<picture key={activeTab}>` with `<source srcSet={asset.webp} type="image/webp">` and `<img src={asset.png}>`
- `<img>` attributes: `width={1600}` `height={700}` `loading="eager"` `onLoad={() => setImgLoaded(true)}`
- Bottom vignette: `absolute inset-x-0 bottom-0 h-1/3` with `linear-gradient(to top, #020617 0%, transparent 100%)`
- Artist label: `absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white` + `aria-label="This is an artist's impression, not a photograph"`

## Deviations from Plan

None — plan executed exactly as written. All starting filter values, aspect ratios, LQIP data URIs, and class names match the plan's target spec precisely.

## Known Stubs

None. Both components render real imported assets from Plan 01. LQIP data URIs are real validated base64 — not placeholders. The only "pending" state is that the components are not yet mounted in App.jsx — that wiring is Plan 03's explicit scope.

## Threat Flags

None. Per the plan's threat register (T-07-06 through T-07-09):
- T-07-06 (malformed base64): Two `data:image/webp;base64,` strings verified present; no `REPLACE_WITH` placeholder remains
- T-07-07 (inline style injection): All filter/background-image values are static string literals; activeTab only indexes a 2-key object, never interpolated into CSS
- T-07-08 (image misread as data): Artist's impression label + aria-label + alt text all carry honest "artist's impression" language (D-01/D-02/D-03)
- T-07-09 (asset size): No new asset bytes — components reference Plan 01 committed files

## Next Phase Readiness

- Plan 03 (App.jsx wiring) can mount `<AtmosphericBackdrop activeTab={activeTab} />` and `<BodyHero activeTab={activeTab} />` with two import lines each
- AtmosphericBackdrop sits at z-0; StarField (also z-0) follows it in DOM → visual layering and blur filter starting values verified under live contrast check in Plan 03
- BodyHero's LQIP blur-up and CLS behavior verified under live Lighthouse audit in Plan 03

## Self-Check: PASSED

Files confirmed:
- src/components/AtmosphericBackdrop.jsx: FOUND
- src/components/BodyHero.jsx: FOUND
- src/constants/tabs.js: FOUND (heroAlt added)

Commits confirmed:
- 32ba8a6: FOUND (tabs.js heroAlt)
- 7c8b73d: FOUND (AtmosphericBackdrop.jsx)
- 780faf4: FOUND (BodyHero.jsx)

Build: npm run build exits 0

---
*Phase: 07-hero-atmospheric-backdrop*
*Completed: 2026-05-28*
