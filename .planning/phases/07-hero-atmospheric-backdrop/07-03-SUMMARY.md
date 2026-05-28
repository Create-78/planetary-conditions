---
phase: 07-hero-atmospheric-backdrop
plan: 03
subsystem: ui
tags: [integration, wiring, contrast, cls, webp-budget, glassmorphism, starfield, wcag-aa]

# Dependency graph
requires:
  - "07-02 — src/components/AtmosphericBackdrop.jsx + src/components/BodyHero.jsx"
  - "07-01 — src/assets/bodies/*-1600.webp (already in dist)"
provides:
  - "src/App.jsx — mounted AtmosphericBackdrop + BodyHero in locked z-order with glass data panel"
  - "src/components/StarField.jsx — opacity reduced to 0.4 so backdrop reads through"
affects: [App.jsx, StarField.jsx, HERO-03, HERO-04, IMG-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "WCAG contrast computed via Node WCAG relative-luminance formula — worst-case compositing model"
    - "Glassmorphism: bg-slate-950/30 backdrop-blur-md over fixed blurred+dimmed backdrop"
    - "Synchronized activeTab prop threads through AtmosphericBackdrop + BodyHero from single App.jsx state"

key-files:
  created:
    - ".planning/phases/07-hero-atmospheric-backdrop/07-03-SUMMARY.md"
  modified:
    - "src/components/StarField.jsx"
    - "src/App.jsx"

key-decisions:
  - "D-06 guardrail: No tuning levers applied — worst-case computed contrast ratio (12.60:1 for white source, 11.72:1 for Moon, 14.16:1 for Mars) passes WCAG AA body text (>=4.5:1) with enormous headroom; bg-slate-950/30 + backdrop-blur-md retained as shipped values"
  - "Task 3 produced no file changes (verification-only, no tuning needed) — no separate commit"

# Metrics
duration: ~2.5min
completed: 2026-05-28
---

# Phase 7 Plan 03: Integration + Acceptance Summary

**AtmosphericBackdrop + BodyHero wired into App.jsx in the locked z-order; StarField dimmed to 0.4; glass data panel applied; WCAG AA contrast computed at 11.72:1–14.16:1 (no tuning required); per-tab WebP weight 39KB/63KB (both well within ~300KB budget); CLS=0 reserved by aspect-[16/7] + explicit img dimensions; human checkpoint pending visual sign-off**

## Performance

- **Duration:** ~2.5 minutes
- **Started:** 2026-05-28T17:23:04Z
- **Completed:** 2026-05-28T17:25:32Z
- **Tasks:** 3 automated + 1 human-verify checkpoint (pending)
- **Files modified:** 2

## Accomplishments

- Reduced StarField opacity from 0.6 to 0.4 (D-09) so the atmospheric backdrop reads through without washing out body images
- Added two import lines to App.jsx (AtmosphericBackdrop, BodyHero) and mounted both components with the locked z-order: backdrop → StarField → content z-10
- Inserted `<BodyHero activeTab={activeTab} />` between the TabBar div and the data panel (in-flow framed hero position)
- Applied glassmorphism to the data panel: `bg-slate-950/30 backdrop-blur-md` (D-07 target values; retained after contrast check)
- Production build exits 0 with all four WebP/PNG assets resolving correctly
- Computed WCAG AA contrast ratios via Node WCAG formula — all worst-case scenarios pass AA body text and large text thresholds with significant headroom

## Contrast Measurement (HERO-04 / D-06 Guardrail)

**Method:** Node.js WCAG relative-luminance formula. Composited effective background = `panel_rgb * 0.30 + backdrop_pixel * 0.70`. Three worst-case scenarios computed:

| Scenario | Backdrop pixel (brightest plausible after brightness 35%) | Composited bg | Contrast ratio | WCAG AA body (>=4.5:1) | WCAG AA large (>=3.0:1) |
|----------|----------------------------------------------------------|---------------|----------------|------------------------|-------------------------|
| Worst case A (pure white source at 35%) | rgb(70,70,70) | rgb(50,51,56) | **12.60:1** | PASS | PASS |
| Worst case Mars (bright orange surface at 35%) | rgb(74,56,35) | rgb(52,41,31) | **14.16:1** | PASS | PASS |
| Worst case Moon (bright grey surface at 35%) | rgb(77,77,74) | rgb(55,56,59) | **11.72:1** | PASS | PASS |

**D-06 Outcome:** No tuning levers applied. `brightness(35%)` in AtmosphericBackdrop.jsx and `bg-slate-950/30` in App.jsx retained as shipped. Human checkpoint (Task 4) is the final legibility backstop per plan design.

## Per-Tab WebP Budget (IMG-03)

| Asset (dist/assets/) | Size | Budget (307,200 bytes) | Status |
|----------------------|------|------------------------|--------|
| mars-1600-DogAaXtI.webp | 39,576 bytes (39 KB) | 307,200 bytes | PASS |
| moon-1600-D_wZWGZF.webp | 62,896 bytes (63 KB) | 307,200 bytes | PASS |

Both per-tab WebP weights are under 21% of the ~300 KB budget — ample headroom.

## CLS Behavior (IMG-02)

- `src/components/BodyHero.jsx` has `aspect-[16/7]` on the container (reserves slot immediately)
- `<img>` carries `width={1600}` and `height={700}` (intrinsic dimensions for browser CLS accounting)
- `key={activeTab}` on `<picture>` remounts on body switch, triggering LQIP blur-up for the new body
- Data panel below cannot jump: hero reserves full space before the full-res image loads
- **Observed CLS:** Not yet visually confirmed — Task 4 human-verify checkpoint confirms via hard-refresh (Cmd+Shift+R) that no panel jump occurs

## Final Shipped Values

| Component | Property | Value | Notes |
|-----------|----------|-------|-------|
| AtmosphericBackdrop.jsx | CSS filter | `blur(24px) brightness(35%) saturate(80%)` | No change from Plan 02 starting values |
| App.jsx data panel | opacity + blur | `bg-slate-950/30 backdrop-blur-md` | D-07 target; no dial-back needed |
| StarField.jsx | opacity | `0.4` | Changed from 0.6 (D-09) |

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Reduce StarField opacity | dcca0da | src/components/StarField.jsx |
| 2 | Wire AtmosphericBackdrop + BodyHero into App.jsx | bbc7c57 | src/App.jsx |
| 3 | Verify build, contrast, WebP weight, CLS | (no commit — verification only, no files changed, no tuning required) | — |

## Deviations from Plan

None — plan executed exactly as written. The contrast check passed all three worst-case models without requiring any D-06 tuning levers. The shipped values (brightness 35%, bg-slate-950/30, backdrop-blur-md) are the D-07 target values from the plan spec.

## Known Stubs

None. Both new components render real imported assets from Plan 01. The app is functionally wired with real activeTab-driven switching.

## Threat Flags

None found beyond what is in the plan's threat register (T-07-10 through T-07-14). All T-07-10 mitigations applied: contrast computed at 11.72:1–14.16:1 (worst case), well above the 4.5:1 AA floor. T-07-11 (layer desync) verified structurally: both AtmosphericBackdrop and BodyHero receive the same `activeTab={activeTab}` prop from one state source. Task 4 human checkpoint is the final T-07-11 + T-07-10 verification.

## Phase 7 Completion Note

This is the last automated plan of Phase 7 (hero-atmospheric-backdrop). Once Task 4 human checkpoint is approved:
- HERO-01 (framed hero image between toggle and panel) — LIVE
- HERO-02 (treated full-bleed backdrop of active body) — LIVE
- HERO-03 (synchronized Mars↔Moon swap of both layers) — LIVE (pending human verify)
- HERO-04 (no contrast regression, data fully legible) — computed PASS (pending human visual confirm)
- IMG-01 (pre-optimized committed assets) — LIVE (Plan 01)
- IMG-02 (LQIP blur-up, CLS ≈ 0) — LIVE (pending visual confirm)
- IMG-03 (per-tab WebP weight within budget) — LIVE (39KB / 63KB)

Phase 8 (Motion & Transitions) will animate the now-static layers — cross-fade on tab switch and hero parallax are scoped there.

## Human Checkpoint Status

Task 4 (human-verify) is the blocking gate for this plan. The checkpoint requires the user to:
1. Open `http://localhost:5173` and verify Mars tab shows correct backdrop + framed hero
2. Click MOON and confirm both backdrop AND hero swap to Moon (HERO-03)
3. Confirm data text legibility on both tabs (HERO-04 visual backstop)
4. Confirm no layout shift on hard-refresh (IMG-02)
5. Confirm star texture still reads faintly over backdrop

Status: **AWAITING HUMAN VERIFICATION**

## Self-Check: PASSED

Files confirmed:
- src/components/StarField.jsx: FOUND (opacity: 0.4)
- src/App.jsx: FOUND (AtmosphericBackdrop + BodyHero mounted, bg-slate-950/30 backdrop-blur-md)
- .planning/phases/07-hero-atmospheric-backdrop/07-03-SUMMARY.md: FOUND

Commits confirmed:
- dcca0da: FOUND (StarField opacity)
- bbc7c57: FOUND (App.jsx wiring)

Build: npm run build exits 0
WebP budget: mars 39KB, moon 63KB — both PASS
Contrast: 11.72:1–14.16:1 worst-case — PASS

---
*Phase: 07-hero-atmospheric-backdrop*
*Completed (automated tasks): 2026-05-28*
