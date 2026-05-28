---
phase: 8
slug: motion-transitions
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-28
---

# Phase 8 — UI Design Contract: Motion & Transitions

> Visual and interaction contract for Phase 8. This phase is motion-only — no new layout, no new colors, no typography changes. All locked values are drawn directly from RESEARCH.md. The contract is purely about motion behavior.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | none (no new icons) |
| Font | Inter (existing, unchanged) |

Source: RESEARCH.md Standard Stack — zero new dependencies confirmed.

---

## Motion Contract

This section replaces the standard Spacing / Typography / Color sections for this phase. Phase 8 introduces no new visual design. The motion contract is the primary deliverable.

---

### MOTION-01: Cross-Fade on Tab Switch

**Requirement:** Backdrop and hero cross-fade when the user switches tabs.

| Property | Locked Value | Source |
|----------|-------------|--------|
| Transition property | `opacity` | RESEARCH.md Pattern 1 |
| Duration | `500ms` | RESEARCH.md open question Q1 — recommendation accepted |
| Easing | `ease` | RESEARCH.md "Don't Hand-Roll" table — `ease` is visually indistinguishable from spring at this displacement |
| CSS shorthand | `transition: opacity 500ms ease` | RESEARCH.md Pattern 1 code example |
| Tailwind equivalent | `transition-opacity duration-500 motion-reduce:transition-none` | RESEARCH.md Pattern 3 note |

**What fades — AtmosphericBackdrop:**
- Both body layers (`mars` and `moon`) are always mounted as absolutely-stacked `div`s inside a single fixed container.
- `opacity: body === activeTab ? 1 : 0` — active body is opacity 1, inactive body is opacity 0.
- Both layers carry `transition: opacity 500ms ease` (or `none` when `reducedMotion=true`).
- The bottom-vignette overlay `div` sits on top of both layers and does NOT transition — it is always visible.
- The existing CSS filter (`blur(24px) brightness(35%) saturate(80%)`) is applied per-layer, not to the container.

**What fades — BodyHero:**
- Both body `<picture>` elements (mars and moon) are always mounted, absolutely positioned inside the same `aspect-[16/7]` container.
- Active body: `opacity: 1`. Inactive body: `opacity: 0`. Both carry `transition: opacity 500ms ease`.
- The `key={activeTab}` prop on `<picture>` is REMOVED. The two-layer pattern handles switching without remount.
- Per-body loaded state (`{ mars: false, moon: false }`) replaces the single `imgLoaded` boolean. LQIP for each body fades out once that body's full-res image has loaded at least once. LQIP `transition: opacity 300ms ease` (shorter than cross-fade — existing value, unchanged).
- The bottom-vignette overlay and the "NASA image" label sit above both layers at `z-index` above the picture layers — they do NOT transition.

**Trigger:** `activeTab` prop change (driven by `setActiveTab` in `App.jsx`). No additional event or timer.

**Fast-switch behavior:** Both bodies are always mounted; CSS `transition: opacity` reverses naturally mid-animation when `activeTab` flips back before 500ms completes. No intermediate state management required.

---

### MOTION-02: Scroll Parallax on Hero

**Requirement:** The hero responds to scroll with a gentle parallax (~10px).

| Property | Locked Value | Source |
|----------|-------------|--------|
| Speed multiplier | `0.05` | RESEARCH.md Pattern 2 — "At speed=0.05, scrolling 200px produces 10px of translateY" |
| Max displacement (at 200px scroll) | ~10px | ROADMAP Phase 8 success criterion |
| Transform property | `transform: translateY(${parallaxY}px) translateY(-50%)` | RESEARCH.md Pitfall 1 fix — must preserve Phase 7's `-50%` center-crop |
| Listener type | `window.scroll` with `{ passive: true }` | RESEARCH.md Pattern 2 — required to avoid blocking scroll optimization |
| Throttle mechanism | `requestAnimationFrame` with `ticking` guard | RESEARCH.md Pattern 2 |
| `willChange` | `transform` | RESEARCH.md Pattern 2 — promotes element to compositing layer, avoids layout reflow |
| Ref target | Inner `<img>` element inside `<picture>` | RESEARCH.md Pitfall 4 — NEVER the outer `aspect-[16/7]` container div |

**Scope:** Parallax is applied to `BodyHero` inner `<img>` only. `AtmosphericBackdrop` is `position: fixed` and already reads as a separate depth plane — no parallax applied to it.

**Hook:** `useScrollParallax({ speed: 0.05, disabled: reducedMotion, baseTransform: 'translateY(-50%)' })` — returns a `ref` attached to the hero `<img>`. Lives at `src/hooks/useScrollParallax.js`.

**SSR guard:** All `window.scrollY` access is inside `useEffect` only. Safe default on first render: no transform applied (element retains Phase 7's static `translateY(-50%)`).

---

### MOTION-03: Reduced-Motion Guard

**Requirement:** With `prefers-reduced-motion: reduce` set, both cross-fade and parallax are disabled — tab switches are instant and the hero is static.

| Property | Locked Value | Source |
|----------|-------------|--------|
| Media query | `(prefers-reduced-motion: reduce)` | RESEARCH.md Pattern 3 — MDN verified |
| Hook | `usePrefersReducedMotion()` — lives at `src/hooks/usePrefersReducedMotion.js` | RESEARCH.md Pattern 3 code example |
| Initial state | `false` (animate) | RESEARCH.md Pitfall 5 — safe SSR default; updated in `useEffect` |
| Dynamic update | `mq.addEventListener('change', handler)` — responds to OS setting changes mid-session | RESEARCH.md Pattern 3 |
| Placement | Once in `App.jsx`; threaded as `reducedMotion` prop to both `AtmosphericBackdrop` and `BodyHero` | RESEARCH.md Pattern 3 — cleaner than reading `matchMedia` independently in each component |

**When `reducedMotion=true`:**
- `AtmosphericBackdrop`: `transition: none` on both body layers. Tab switch is an instant opacity flip.
- `BodyHero`: `transition: none` on both body picture layers. Tab switch is an instant opacity flip.
- `useScrollParallax`: `disabled=true` — scroll listener is never attached, no `translateY` is applied. Hero `<img>` stays at its static `translateY(-50%)` baseline from Phase 7.
- LQIP blur-up transition (`transition-opacity duration-300`) is UNAFFECTED — this is an image-loading concern, not a motion effect. It is retained regardless of `prefers-reduced-motion`.

**Tailwind belt-and-suspenders:** Any Tailwind transition class on `<picture>` or backdrop `<div>` carries the `motion-reduce:transition-none` variant in addition to the JS `reducedMotion` guard.

---

## Files Touched

| File | Change Type | Summary |
|------|-------------|---------|
| `src/components/AtmosphericBackdrop.jsx` | Refactor | Single-div swap → two always-mounted body layers with opacity transition |
| `src/components/BodyHero.jsx` | Refactor | `key={activeTab}` remount → two always-mounted body layers; per-body loaded state; parallax ref on inner `<img>` |
| `src/hooks/useScrollParallax.js` | New file | rAF-throttled scroll → `translateY` ref; `disabled` prop for reduced-motion path |
| `src/hooks/usePrefersReducedMotion.js` | New file | `window.matchMedia` at mount + change listener; safe SSR default |
| `src/App.jsx` | Additive | Import and call `usePrefersReducedMotion()`; pass `reducedMotion` prop to `AtmosphericBackdrop` and `BodyHero` |

No other files are touched. Data panel, DataCard, StatusBadge, tooltip behavior, and all data states are completely unchanged.

---

## Spacing Scale

No new spacing values introduced in this phase. Existing scale is unchanged.

| Token | Value | Usage in this phase |
|-------|-------|---------------------|
| (all existing) | (unchanged) | Motion affects opacity/transform only — no layout changes |

Exceptions: none.

---

## Typography

No typography changes in this phase. Existing type scale is unchanged.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| (all existing) | (unchanged) | (unchanged) | (unchanged) |

---

## Color

No color changes in this phase. Existing palette is unchanged.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#020617` (space-950) | Background — unchanged |
| Secondary (30%) | `#0f172a` (moon-900) | Cards, nav — unchanged |
| Accent (10%) | `#f59e0b` (mars.accent) / `#cbd5e1` (moon.accent) | Per-body DataCard rings — unchanged |
| Destructive | `#dc2626` (mars-500 semantic) | Destructive actions — unchanged |

Accent reserved for: DataCard accent rings per body tab (unchanged from prior phases).

---

## Copywriting Contract

This phase introduces no new user-facing copy. No CTAs, empty states, error states, or destructive confirmations are added. The "NASA image" artist label on `BodyHero` is unchanged.

| Element | Copy |
|---------|------|
| Primary CTA | none — this phase has no CTAs |
| Empty state | none — not applicable |
| Error state | none — not applicable |
| Destructive confirmation | none — not applicable |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party | none | not applicable |

No shadcn components, no third-party registries. This phase uses only browser-native APIs and existing React hooks.

---

## Anti-Patterns Prohibited

These specific patterns are explicitly banned for this phase, per RESEARCH.md:

| Pattern | Prohibited Because |
|---------|--------------------|
| `key={activeTab}` on `<picture>` or backdrop `div` | Causes unmount/remount — produces fade-in only, not cross-fade |
| `background-image` CSS transition on single `div` | `background-image` is not CSS-interpolatable — it snaps |
| `CSS cross-fade()` function | Safari-only as of 2026 |
| `style.top` for parallax (instead of `transform`) | Forces layout reflow on every scroll tick |
| `setState` in raw scroll handler without rAF | Triggers 60+ renders/second |
| Reading `window.scrollY` inside render | Layout thrashing |
| Scroll listener without `{ passive: true }` | Blocks browser scroll optimization |
| `transform: translateY(Xpx)` alone on hero `<img>` | Overwrites Phase 7's `translateY(-50%)` center-crop — hero jumps on first scroll |
| framer-motion, GSAP, react-scroll-parallax, or any motion library | Zero new dependencies hard constraint |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
