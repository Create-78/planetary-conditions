# v2 — Visual Upgrade Milestone — Design

**Status:** Approved direction (brainstorm), pending spec review
**Date:** 2026-05-28
**Author:** Will McDermott + Claude
**Supersedes:** none — first milestone after v1.0 shipped (live at https://planetary-conditions.vercel.app)

---

## Overview

v2 transforms Planetary Conditions from a clean data dashboard into a **cinematic body portrait**: the celestial body you're viewing fills the page as an atmospheric backdrop, a sharp framed hero image sits between the tab toggle and the data, and the whole surface gains motion and typographic polish — without ever compromising the legibility of the live data that is the product's core value.

It is explicitly a **visual/design** milestone. No new data sources, no new metrics.

## Goals

- A user opening either tab sees that body's image as a full-bleed atmospheric backdrop and as a sharp framed hero between the toggle and the data panel.
- The dashboard feels alive: backdrop and hero cross-fade on tab switch, and the hero responds subtly to scroll.
- Cards and typography read as a deliberate, body-themed design system (amber/rust on Mars, blue/silver on Moon).
- Images load fast — the visual upgrade must not regress the load performance v1 enjoys.
- One pre-existing reliability weakness (solar wind section) is hardened.

## Non-Goals (v2)

- **Mobile-optimized layout** — v1's desktop-first stance holds; responsive baseline must not break, but phone-class polish is out.
- New data sources, metrics, historical charts, or share/screenshot (still v2+/out of scope per `Discussion.md`).
- A component-library rewrite. We refresh styling within the existing component structure.

## Layout Architecture — "Layered"

Applies to both tabs; only the image source and palette accent change.

```
<body>
  AtmosphericBackdrop   ← full-bleed, fixed, body image, blur(24px)
                          brightness(35%) saturate(80%); behind StarField
  StarField             ← kept, opacity lowered to ~40% so it reads over backdrop

  <main max-w-6xl>
    Header (title + subtitle)
    TabBar (Mars | Moon)
    BodyHero            ← NEW: sharp body image, ~aspect-[16/7], rounded-lg,
                          soft bottom inner-vignette for handoff to data
    Data panel          ← existing container; cards restyled in Phase 3
  </main>
</body>
```

**Two roles, one source file per body.** `AtmosphericBackdrop` (heavily treated, immersive) and `BodyHero` (sharp, focal) both derive from the same per-body asset. The data panel retains its current solid/blur background so contrast is never image-dependent.

## Components

- **`AtmosphericBackdrop`** — fixed, `inset-0`, `z-0` (below StarField). Renders the active body's backdrop variant with CSS filters and a dark gradient overlay at the bottom to anchor content. `aria-hidden`. Cross-fades on `activeTab` change.
- **`BodyHero`** — in-flow banner between `TabBar` and the data panel. `<picture>` with WebP + PNG fallback, width/height set to reserve layout space (no CLS), `loading="eager"` (above the fold), LQIP blur-up placeholder. `alt` describes the body (e.g., "Mars, full disc").
- **Image assets** — committed under `src/assets/bodies/`:
  - `mars-1600.webp`, `mars-1600.png` (fallback), `mars-lqip.webp` (~24px blurred)
  - `moon-1600.webp`, `moon-1600.png`, `moon-lqip.webp`
  - Backdrop reuses the 1600 asset (CSS-filtered) — no separate backdrop file.

## Image Pipeline

- **Decision:** pre-optimized, committed assets — no new build dependency.
- Source 6 MB PNGs (`mars-image.png`, `moon-image.png`) are the design masters; they are **kept out of the repo** (added to `.gitignore`; optionally archived in a `design-assets/` folder that is gitignored).
- Each body produces: a ~1600px-wide WebP (target ~100–150 KB), a same-size PNG fallback, and a tiny (~24px) blurred WebP LQIP inlined or referenced for instant first paint.
- **Performance budget:** total added image weight served per tab ≤ ~300 KB (WebP path). This is a phase success criterion, measured against v1's ~211 KB JS baseline.
- Generation is a one-time manual step (documented in the phase plan) using a standard CLI (e.g., `sharp`/`cwebp`); the tool is not added as a project dependency.

## Motion (Phase 2) — "Moderate"

- Backdrop + hero **cross-fade** on tab switch (~300–400ms).
- Hero **scroll parallax** (~10px translate) for depth.
- **`prefers-reduced-motion: reduce`** disables parallax and cross-fade (instant swap) — non-negotiable.
- rAF-debounced scroll handling, consistent with the v1 tooltip-reposition pattern.

## Phase Breakdown

Each phase is independently shippable to production (the v1 cadence).

### Phase 1 — Hero + Atmospheric Backdrop
- **Deliver:** `AtmosphericBackdrop` + `BodyHero` components; committed optimized image assets (WebP + PNG + LQIP); per-tab image switching wired to `activeTab`; StarField opacity reduced; `.gitignore` for source PNGs.
- **Success:** Both tabs show the correct body backdrop + sharp hero; data panel contrast unchanged; added image weight within budget; no layout shift (CLS ~0).

### Phase 2 — Motion & Transitions
- **Deliver:** cross-fade on tab switch, hero scroll parallax, reduced-motion handling.
- **Success:** Switching tabs cross-fades smoothly; hero parallaxes on scroll; with reduced-motion enabled, transitions are instant and parallax is off.

### Phase 3 — Card & Typography Refresh
- **Deliver:** restyled DataCard (spacing, accent rings, value/label hierarchy), body-palette intensification (amber/rust Mars, blue/silver Moon), heading scale.
- **Success:** Cards read as a cohesive themed system on both tabs; all existing data/states (loading/error/em-dash/freshness) preserved; build green.

### Phase 4 — Reliability Carryforward
- **Deliver:** harden `useSolarWind` so a single failed sub-query (plasma/mag/kp) degrades **per-card** instead of blanking the whole Space Weather section. (Lifts the deferred item from `06-02-SUMMARY.md`.)
- **Success:** Simulating a failure in one SWPC sub-query leaves the other cards rendering live values; only the failed metric shows its error/em-dash state.

## Risks & Considerations

- **Contrast over imagery** — atmospheric backdrop must stay dark enough (brightness ≤ ~35% + bottom gradient) that white data text always passes contrast. Verify during Phase 1 UAT.
- **Performance regression** — large images are the main risk; the pipeline + budget mitigate it. Measure, don't assume.
- **Repo bloat** — source PNGs must not be committed; enforce via `.gitignore`.
- **MAAS2 Edge proxy** (from v1) is unaffected; this milestone touches presentation only.

## Open Questions

None — all resolved during brainstorming (sequencing, scope, hero/backdrop relationship, motion intensity, image pipeline, Phase 4 inclusion).

## Transition to Build (GSD)

This project uses GSD, so implementation flows through the milestone pipeline rather than a single plan:
1. `/gsd-complete-milestone` — archive v1.0.
2. `/gsd-new-milestone` — seed v2 from this spec; it becomes REQUIREMENTS + ROADMAP with the 4 phases above.
3. Plan/execute each phase per the normal GSD loop.
