# Requirements — Planetary Conditions v2.0 (Visual Upgrade)

Derived from `docs/superpowers/specs/2026-05-28-v2-visual-upgrade-design.md`.
REQ-IDs continue from v1.0 (REL continues at 06). Phase numbering continues at 7.

## v2.0 Requirements

### Hero & Atmospheric Backdrop (HERO)

- [x] **HERO-01
**: User sees a sharp, framed hero image of the active body between the tab toggle and the data panel (~16/7, rounded, soft bottom vignette)
- [x] **HERO-02
**: User sees a full-bleed atmospheric backdrop of the active body's image behind the page content, treated for contrast (blurred + dimmed)
- [x] **HERO-03
**: Hero and backdrop both switch to match the active tab (Mars ↔ Moon)
- [x] **HERO-04
**: Data panel and card text remain high-contrast and fully legible over the backdrop (no contrast regression vs v1.0)

### Image Pipeline (IMG)

- [x] **IMG-01
**: Optimized image assets are committed (≈1600px WebP + PNG fallback per body); the multi-MB source PNGs are gitignored, not committed
- [x] **IMG-02
**: A low-quality blur-up placeholder (LQIP) shows instantly and the hero reserves its dimensions (no layout shift / CLS ≈ 0)
- [x] **IMG-03
**: Added image weight served per tab stays within budget (≤ ~300 KB on the WebP path)

### Motion & Transitions (MOTION)

- [x] **MOTION-01**: Backdrop and hero cross-fade when the user switches tabs
- [x] **MOTION-02**: The hero responds to scroll with a gentle parallax (~10px)
- [x] **MOTION-03**: When `prefers-reduced-motion: reduce` is set, cross-fade and parallax are disabled (instant, static)

### Full-Background Layout + Glassmorphic Overlay (LAYOUT)

- [x] **LAYOUT-01
**: Hero image fills the viewport as a full-bleed cinematic layer — the contained 16:7 framed BodyHero box is replaced with a full-background image that spans the full width and a significant portion of the viewport height
- [x] **LAYOUT-02
**: The data panel sits above the full-bleed hero in a glassmorphic overlay card (backdrop-blur + translucent background) — fully legible, no contrast regression vs the contained layout
- [x] **LAYOUT-03
**: Phase 8 cross-fade (MOTION-01) and scroll parallax (MOTION-02) remain functional on the full-bleed hero images; prefers-reduced-motion (MOTION-03) is preserved

### Card & Typography Refresh (THEME)

- [ ] **THEME-01**: DataCard styling is refreshed (spacing, accent rings, value/label hierarchy) consistently across both tabs
- [ ] **THEME-02**: Each body's palette is intensified per tab (amber/rust on Mars, blue/silver on Moon)
- [ ] **THEME-03**: Heading/type scale is refreshed while all existing data states (loading, error, em-dash, freshness) are preserved

### Reliability Carryforward (REL)

- [ ] **REL-06**: A single failed NOAA SWPC sub-query (plasma/mag/kp) degrades per-card — the other Space Weather cards still render live values instead of the whole section blanking

## Future Requirements (deferred)

- Mobile-optimized / responsive polish (still desktop-first through v2)
- Additional bodies or data sources
- Historical charts / timelines, share/screenshot, embeddable widget

## Out of Scope (v2.0)

- Mobile-optimized layout — desktop-first holds; responsive baseline must not break
- New data sources, metrics, or charts — v2.0 is presentation-only
- Component-library rewrite — refresh styling within existing component structure
- Build-time image generation tooling — pre-optimized committed assets instead (no new dep)

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| HERO-01 | Phase 7 | Pending |
| HERO-02 | Phase 7 | Pending |
| HERO-03 | Phase 7 | Pending |
| HERO-04 | Phase 7 | Pending |
| IMG-01 | Phase 7 | Pending |
| IMG-02 | Phase 7 | Pending |
| IMG-03 | Phase 7 | Pending |
| MOTION-01 | Phase 8 | Complete |
| MOTION-02 | Phase 8 | Complete |
| MOTION-03 | Phase 8 | Complete |
| LAYOUT-01 | Phase 8.5 | Pending |
| LAYOUT-02 | Phase 8.5 | Pending |
| LAYOUT-03 | Phase 8.5 | Pending |
| THEME-01 | Phase 9 | Pending |
| THEME-02 | Phase 9 | Pending |
| THEME-03 | Phase 9 | Pending |
| REL-06 | Phase 10 | Pending |
