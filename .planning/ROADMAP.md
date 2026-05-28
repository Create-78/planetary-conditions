# Roadmap: Planetary Conditions

## Milestones

- ✅ **v1.0 MVP** — Phases 1–6 (shipped 2026-05-28) — live at https://planetary-conditions.vercel.app
- 📋 **v2.0 Visual Upgrade** — Phases 7–10 (planned) — hero images, atmospheric backdrops, motion, card/type refresh, reliability carryforward

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–6) — SHIPPED 2026-05-28</summary>

- [x] Phase 1: Scaffold & Shell (2/2 plans) — completed 2026-05-14
- [x] Phase 2: Shared UI Primitives (3/3 plans) — completed 2026-05-19
- [x] Phase 3: Mars Tab — Surface Data (2/2 plans) — completed 2026-05-19
- [x] Phase 4: Moon Tab — Three Sub-Sections (3/3 plans) — completed 2026-05-21
- [x] Phase 5: Reliability & UX Polish (3/3 plans) — completed 2026-05-21
- [x] Phase 6: Vercel Deployment (2/2 plans) — completed 2026-05-27

Full detail archived: `milestones/v1.0-ROADMAP.md` · Audit: `milestones/v1.0-MILESTONE-AUDIT.md`

</details>

### 📋 v2.0 Visual Upgrade (Planned)

Design spec: `docs/superpowers/specs/2026-05-28-v2-visual-upgrade-design.md`.

- [x] **Phase 7: Hero + Atmospheric Backdrop** — Per-body sharp hero image and treated full-bleed backdrop, fed by a committed pre-optimized image pipeline (WebP + PNG + LQIP) — completed 2026-05-28
- [ ] **Phase 8: Motion & Transitions** — Cross-fade on tab switch and gentle hero scroll parallax, with reduced-motion respected
- [ ] **Phase 9: Card & Typography Refresh** — Body-themed DataCard and type system, intensified per-tab palettes, all data states preserved
- [ ] **Phase 10: Reliability Carryforward** — `useSolarWind` degrades per-card so one failed SWPC sub-query no longer blanks the whole Space Weather section

## Phase Details

### Phase 7: Hero + Atmospheric Backdrop
**Goal**: A user opening either tab sees that body as a sharp framed hero between the toggle and the data, and as a treated full-bleed atmospheric backdrop behind the page — loaded fast and without compromising data legibility.
**Depends on**: v1.0 (Phases 1–6, shipped)
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04, IMG-01, IMG-02, IMG-03
**Success Criteria** (what must be TRUE):
  1. On each tab, the user sees a sharp framed hero image (~16/7, rounded, soft bottom vignette) of the active body sitting between the tab toggle and the data panel.
  2. The user sees a full-bleed, blurred-and-dimmed atmospheric backdrop of the active body behind the page content, and switching tabs (Mars ↔ Moon) swaps both hero and backdrop to the matching body.
  3. Data panel and card text stay high-contrast and fully legible over the backdrop — no contrast regression versus v1.0.
  4. The hero shows an instant LQIP blur-up and reserves its dimensions so there is no layout shift (CLS ≈ 0).
  5. Committed assets are optimized (≈1600px WebP + PNG fallback per body) with multi-MB source PNGs gitignored, and added image weight served per tab stays within ~300 KB on the WebP path.
**Plans**: 3 plans (3 waves)
- [x] 07-01-PLAN.md — Image pipeline: optimize ≈1600px WebP + PNG per body, capture LQIP base64, gitignore source PNGs (IMG-01, IMG-03)
- [x] 07-02-PLAN.md — Build AtmosphericBackdrop + BodyHero components (LQIP blur-up, artist label) + tabs.js heroAlt (HERO-01, HERO-02, IMG-02)
- [x] 07-03-PLAN.md — Wire layered frame into App.jsx, reduce StarField opacity, enforce contrast/CLS/perf + human verify (HERO-03, HERO-04, IMG-03)
**UI hint**: yes

### Phase 8: Motion & Transitions
**Goal**: The dashboard feels alive — backdrop and hero animate on interaction and scroll — while users who request reduced motion get an instant, static experience.
**Depends on**: Phase 7 (hero + backdrop assets and components must exist before they can animate)
**Requirements**: MOTION-01, MOTION-02, MOTION-03
**Success Criteria** (what must be TRUE):
  1. When the user switches tabs, the backdrop and hero cross-fade smoothly rather than snapping.
  2. As the user scrolls, the hero responds with a gentle parallax (~10px) that reads as depth, not jitter.
  3. With `prefers-reduced-motion: reduce` enabled, both cross-fade and parallax are disabled — tab switches are instant and the hero is static.
**Plans**: 2 plans (2 waves)
- [x] 08-01-PLAN.md — Create useScrollParallax + usePrefersReducedMotion hooks (with Nyquist unit tests); refactor AtmosphericBackdrop + BodyHero to two-layer opacity cross-fade with parallax ref (MOTION-01, MOTION-02, MOTION-03)
- [ ] 08-02-PLAN.md — Thread reducedMotion through App.jsx; full-suite verification + human visual check of cross-fade, parallax, reduced-motion (MOTION-01, MOTION-02, MOTION-03)
**UI hint**: yes

### Phase 9: Card & Typography Refresh
**Goal**: Cards and typography read as a deliberate, body-themed design system on both tabs, with every existing data behavior preserved.
**Depends on**: Phase 7 (the layered hero/backdrop frame sets the visual context the cards are restyled against)
**Requirements**: THEME-01, THEME-02, THEME-03
**Success Criteria** (what must be TRUE):
  1. DataCards read as one cohesive themed system across both tabs — consistent spacing, accent rings, and clear value/label hierarchy.
  2. Each body's palette is visibly intensified per tab (amber/rust on Mars, blue/silver on Moon).
  3. The heading/type scale is refreshed while all existing data states — loading, error, em-dash, and freshness — still render correctly.
**Plans**: TBD
**UI hint**: yes

### Phase 10: Reliability Carryforward
**Goal**: A single failed NOAA SWPC sub-query no longer blanks the whole Space Weather section; failure is isolated to the affected card.
**Depends on**: Nothing (independent of the visual phases — can run any time in v2.0)
**Requirements**: REL-06
**Success Criteria** (what must be TRUE):
  1. When one SWPC sub-query (plasma, mag, or kp) fails, the other Space Weather cards still render live values.
  2. Only the card whose sub-query failed shows its error / em-dash state — the section as a whole does not blank.
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Scaffold & Shell | v1.0 | 2/2 | Complete | 2026-05-14 |
| 2. Shared UI Primitives | v1.0 | 3/3 | Complete | 2026-05-19 |
| 3. Mars Tab — Surface Data | v1.0 | 2/2 | Complete | 2026-05-19 |
| 4. Moon Tab — Three Sub-Sections | v1.0 | 3/3 | Complete | 2026-05-21 |
| 5. Reliability & UX Polish | v1.0 | 3/3 | Complete | 2026-05-21 |
| 6. Vercel Deployment | v1.0 | 2/2 | Complete | 2026-05-27 |
| 7. Hero + Atmospheric Backdrop | v2.0 | 3/3 | Complete | 2026-05-28 |
| 8. Motion & Transitions | v2.0 | 1/2 | In Progress | - |
| 9. Card & Typography Refresh | v2.0 | 0/— | Planned | - |
| 10. Reliability Carryforward | v2.0 | 0/— | Planned | - |
