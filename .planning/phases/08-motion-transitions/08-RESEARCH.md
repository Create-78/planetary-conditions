# Phase 8: Motion & Transitions — Research

**Researched:** 2026-05-28
**Domain:** CSS transitions, scroll parallax, prefers-reduced-motion — React, no new dependencies
**Confidence:** HIGH

---

## Summary

Phase 8 animates two components that Phase 7 shipped as static: `AtmosphericBackdrop` (fixed full-bleed `div`) and `BodyHero` (in-flow `<picture>` frame). The goal is cross-fade on tab switch and gentle scroll parallax on the hero, with `prefers-reduced-motion: reduce` fully disabling both.

The stack constraint — zero new dependencies, CSS transitions + React hooks + `window.matchMedia` — is entirely sufficient for the scope. Both techniques are well-established, baseline-widely-supported browser features. No library is needed and none should be added.

The central implementation insight: the `AtmosphericBackdrop` currently swaps `backgroundImage` on the same `div`, so a background cross-fade cannot be achieved with a single-element opacity transition. The correct pattern is two absolutely-stacked `div`s — one for the current body (opacity 1), one for the incoming body (opacity 0 → 1) — so CSS `transition: opacity` produces a genuine cross-fade rather than a pop. `BodyHero` already remounts on `activeTab` change via `key={activeTab}`; this remount is replaced with a controlled opacity swap using the same two-layer pattern. Scroll parallax is a `useEffect` + `requestAnimationFrame` + `translateY` pattern on the hero `<img>` element, reading `window.scrollY`.

**Primary recommendation:** Two-layer stacked opacity swap for cross-fade; `useScrollParallax` custom hook with `rAF` throttle and `window.matchMedia` guard for parallax; Tailwind `motion-reduce:` variant for CSS-side reduced-motion fallback.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Cross-fade (tab switch) | Browser / Client | — | Pure CSS transition on React state; no server involvement |
| Scroll parallax | Browser / Client | — | `window.scrollY` listener + `requestAnimationFrame`; DOM mutation |
| Reduced-motion guard | Browser / Client | — | `window.matchMedia('(prefers-reduced-motion: reduce)')` read at mount |
| Tab state (trigger) | Browser / Client (App.jsx) | — | `activeTab` already lives in `App.jsx` — no new state needed |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MOTION-01 | Backdrop and hero cross-fade when the user switches tabs | Two-layer stacked `div` opacity swap; `transition: opacity 500ms ease` |
| MOTION-02 | Hero responds to scroll with a gentle parallax (~10px) | `useScrollParallax` hook: `rAF`-throttled `window.scrollY` → `translateY` on hero `<img>` |
| MOTION-03 | `prefers-reduced-motion: reduce` disables cross-fade and parallax | `window.matchMedia` at hook mount; early-return skips listener; Tailwind `motion-reduce:transition-none` variant on CSS classes |
</phase_requirements>

---

## Standard Stack

### Core (no new installs)

| Library / API | Version | Purpose | Why Standard |
|--------------|---------|---------|--------------|
| CSS `transition` (opacity) | Baseline | Cross-fade between body images | All modern browsers; no JS animation loop needed for fades |
| `window.matchMedia` | Baseline (2020) | Detect `prefers-reduced-motion` at mount + dynamic change | [VERIFIED: MDN] Widely available since January 2020; no polyfill needed |
| `requestAnimationFrame` | Baseline | Throttle scroll listener for parallax | Browser-native 60fps cap; avoids scroll-jank |
| React `useEffect` + `useRef` | 18.x (already installed) | Manage scroll listener lifecycle; store rAF handle | Already in repo; no new dep |
| Tailwind `motion-reduce:` variant | 3.4.x (already installed) | CSS-side reduced-motion fallback for transition classes | [VERIFIED: Tailwind v3 docs] Available as built-in responsive variant |

### No New Dependencies Required

The full scope is achievable with what the project already has. Do NOT add framer-motion, GSAP, react-scroll-parallax, or any motion library. [ASSUMED: project spec mandates zero new dependencies — verified by the additional context supplied to this research task.]

---

## Architecture Patterns

### System Architecture Diagram

```
activeTab (App.jsx state)
        │
        ▼
  [Two-layer AtmosphericBackdrop]          [Two-layer BodyHero]
  ┌─────────────────────────────┐          ┌──────────────────────────────────────┐
  │  div.layer-prev (opacity→0) │          │  picture.layer-prev (opacity→0)      │
  │  div.layer-next (opacity→1) │          │  picture.layer-next (opacity→1)      │
  │  transition: opacity 500ms  │          │  transition: opacity 500ms           │
  └─────────────────────────────┘          │  + scroll translateY via rAF hook    │
           fixed / z-0                     └──────────────────────────────────────┘
                                                    in-flow / z-10

  window.matchMedia('(prefers-reduced-motion: reduce)')
        │ matches=true → skip transitions + skip scroll listener
        │ matches=false → normal animated path
        ▼
  Both components read the same reduced-motion signal at mount;
  dynamic changes handled via mediaQuery.addEventListener('change', ...)
```

### Recommended Project Structure (files touched)

```
src/
├── components/
│   ├── AtmosphericBackdrop.jsx   # Replace single-div swap with two-layer fade
│   └── BodyHero.jsx              # Replace key={activeTab} remount with two-layer fade + parallax
├── hooks/
│   └── useScrollParallax.js      # New: rAF-throttled scroll → translateY ref
└── App.jsx                       # No changes needed — activeTab already threaded correctly
```

### Pattern 1: Two-Layer Opacity Cross-Fade

**What:** Render both the "leaving" body and the "entering" body as absolutely-positioned layers; transition opacity on the entering layer from 0 to 1. When complete, the leaving layer can be dropped (or left at opacity 0 underneath).

**When to use:** Any time you need to cross-fade between two background-image or two image sources. `background-image` on a single element cannot be CSS-transitioned — opacity on a wrapping element is the canonical workaround. [CITED: css3.bradshawenterprises.com/cfimg/]

**Implementation approach for `AtmosphericBackdrop`:**

```jsx
// Source: pattern derived from MDN CSS transitions + Phase 7 code
// Keep both Mars and Moon divs mounted; drive opacity via activeTab prop.
// The 'leaving' body stays at opacity:0 in the DOM so the next switch also fades.

function AtmosphericBackdrop({ activeTab, reducedMotion }) {
  const BODIES = ['mars', 'moon']
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {BODIES.map((body) => (
        <div
          key={body}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${BACKDROP_ASSETS[body]})`,
            backgroundSize: '200%',
            backgroundPosition: 'center',
            filter: 'blur(24px) brightness(35%) saturate(80%)',
            opacity: body === activeTab ? 1 : 0,
            transition: reducedMotion ? 'none' : 'opacity 500ms ease',
          }}
        />
      ))}
      {/* Bottom vignette always on top */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #020617 0%, transparent 40%)' }} />
    </div>
  )
}
```

**Why not CSS `cross-fade()`:** Safari-only as of 2025; do not use. [CITED: css-tricks.com/almanac/functions/c/cross-fade/]

**Why not `key=` remount:** `key={activeTab}` causes an unmount/remount — React destroys and recreates the DOM node. There is no "old" node to fade out from; the transition fires from the initial render (opacity:0 → opacity:1 of the new node only), producing a fade-in not a cross-fade. Keep both body layers mounted permanently.

### Pattern 2: `useScrollParallax` Hook

**What:** A custom React hook that attaches a `scroll` listener (passive), reads `window.scrollY`, and applies `translateY` to a ref'd element via `requestAnimationFrame`. Returns a `ref` to attach to the element.

**When to use:** Any element needing subtle scroll-driven depth. Max displacement should be small (~10px per spec) so it reads as depth rather than content movement.

```jsx
// Source: pattern from builder.io/blog/parallax-scrolling-effect + scroll-aware-components-react
// [VERIFIED: consistent across multiple 2025/2026 sources]

import { useEffect, useRef } from 'react'

export function useScrollParallax({ speed = 0.05, disabled = false } = {}) {
  const ref = useRef(null)
  const rafHandle = useRef(null)
  const ticking = useRef(false)

  useEffect(() => {
    if (disabled || !ref.current) return

    function update() {
      if (ref.current) {
        const y = window.scrollY * speed
        ref.current.style.transform = `translateY(${y}px) translateY(-50%)`
        // Note: hero img already has translateY(-50%) for center-crop;
        // combine into one transform string to avoid clobbering Phase 7 value.
      }
      ticking.current = false
    }

    function onScroll() {
      if (!ticking.current) {
        rafHandle.current = requestAnimationFrame(update)
        ticking.current = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafHandle.current) cancelAnimationFrame(rafHandle.current)
    }
  }, [disabled, speed])

  return ref
}
```

**`speed` calibration:** At `speed = 0.05`, scrolling 200px produces 10px of translateY — matches the "~10px" spec for a subtle parallax. This is the correct starting value.

**`willChange: 'transform'`:** Add to the hero `<img>` element to promote it to its own compositing layer, avoiding layout reflow on scroll. [CITED: builder.io/blog/parallax-scrolling-effect]

### Pattern 3: `prefers-reduced-motion` Guard

**What:** Read `window.matchMedia('(prefers-reduced-motion: reduce)').matches` once at hook/component mount. Pass as a `disabled` prop or `reducedMotion` boolean. Subscribe to `change` events for dynamic toggles (user changes OS setting mid-session).

**Implementation:**

```jsx
// Source: MDN prefers-reduced-motion docs [VERIFIED]
import { useState, useEffect } from 'react'

export function usePrefersReducedMotion() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const [reduced, setReduced] = useState(mq.matches)

  useEffect(() => {
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return reduced
}
```

Place this hook once in `App.jsx` and thread `reducedMotion` as a prop to both `AtmosphericBackdrop` and `BodyHero`. This is cleaner than reading `window.matchMedia` independently in each component.

**Tailwind `motion-reduce:` variant:** For any Tailwind transition classes (e.g. `transition-opacity duration-500`) add the variant:

```
transition-opacity duration-500 motion-reduce:transition-none
```

This is belt-and-suspenders alongside the JS guard — useful if inline styles are replaced with Tailwind classes.

### Anti-Patterns to Avoid

- **`key={activeTab}` for cross-fade:** Causes unmount/remount. Only produces a fade-in (new node), not a cross-fade (old fades out simultaneously). Remove it from `BodyHero`'s `<picture>` when switching to the two-layer approach.
- **`background-image` CSS transition:** `background-image` is not interpolatable in CSS — it snaps. Always use opacity on a wrapping element instead.
- **`CSS cross-fade()`:** Safari-only. Not suitable here.
- **Inline `style.top` for parallax:** Forces layout reflow on every scroll tick. Always use `transform: translateY()` — GPU-composited, no reflow.
- **Direct state updates in scroll handler:** `setState` in a scroll handler without rAF batching can trigger 60+ renders per second. Always rAF-gate.
- **Reading `window.scrollY` inside render:** Causes layout thrashing. Read in `useEffect` only.
- **Missing `passive: true`:** Scroll listener without `{ passive: true }` blocks the browser's scroll optimization. Always pass it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animation orchestration | Custom timeline/sequencer | CSS `transition` (opacity) | Tab switch is a simple binary state change — no sequence needed |
| Cross-fade between images | `cross-fade()` CSS function | Two-layer opacity pattern | `cross-fade()` is Safari-only; two-layer works everywhere |
| Spring physics / easing curves | Custom bezier math | CSS `ease` / `ease-in-out` | `transition: opacity 500ms ease` is visually indistinguishable from spring at this displacement |
| Scroll position tracking | Complex IntersectionObserver | `window.scrollY` + `rAF` | Hero is always in the viewport when scroll starts; IO is overkill |

**Key insight:** This phase's scope is entirely within CSS transitions + a 20-line hook. Any impulse to reach for a library signals scope creep, not a real requirement gap.

---

## Common Pitfalls

### Pitfall 1: Transform Clobbering on Parallax

**What goes wrong:** The hero `<img>` already has `style={{ height: '200%', top: '50%', transform: 'translateY(-50%)' }}` from Phase 7's center-crop. If the parallax hook sets `ref.style.transform = 'translateY(Xpx)'`, it overwrites the `-50%` and the image jumps to the wrong crop position.

**Why it happens:** CSS `transform` is a single property — assigning a new value replaces all prior transforms on the element.

**How to avoid:** Combine both values in one string: `translateY(calc(${parallaxY}px - 50%))` or `translateY(${parallaxY}px) translateY(-50%)` (the second form is valid CSS — transforms compose left-to-right). The hook must know it is augmenting a baseline transform, not replacing it. Pass a `baseTransform` option or hardcode the `-50%` into the hook's output.

**Warning signs:** Hero image snaps to wrong vertical position as soon as the user scrolls even 1px.

### Pitfall 2: Cross-Fade Flashing During Fast Tab Switches

**What goes wrong:** If the user clicks Mars → Moon → Mars faster than the transition duration (500ms), intermediate opacity states can stack. The "old" layer may still be fading out when it becomes the "new" layer.

**Why it happens:** Opacity transitions don't cancel — they resume from current value. With a two-layer "both bodies always mounted" pattern, this is actually handled correctly: the Mars layer is always at 1 when Mars is active, and the opacity transition just reverses naturally mid-animation.

**How to avoid:** Use the always-both-mounted pattern (Pattern 1) rather than mounting/unmounting individual layers. CSS opacity transitions handle reversal correctly when the target value changes mid-transition.

**Warning signs:** Only appears if using an animate-in/animate-out pattern with explicit "leaving" state management.

### Pitfall 3: LQIP Blur-Up Breaking on Tab Switch

**What goes wrong:** `BodyHero` currently uses `key={activeTab}` to remount on tab switch, which resets `imgLoaded` state (triggering LQIP blur-up on every switch). If `key={activeTab}` is removed for the cross-fade pattern, `imgLoaded` stays `true` after the first load and the LQIP layer disappears permanently — even when the new body's full-res image hasn't loaded yet.

**Why it happens:** `imgLoaded` is component-level state. Without remount, it persists across tab changes.

**How to avoid:** Replace the single `imgLoaded` boolean with a per-body loaded state: `const [loaded, setLoaded] = useState({ mars: false, moon: false })`. The `onLoad` handler marks the specific body as loaded. LQIP for each body shows until that body's full-res image has loaded at least once. After first load, LQIP can remain hidden because the cached image loads instantly.

**Warning signs:** On first switch to the second tab, the full-res image appears with no LQIP (blank frame) while the browser re-fetches.

### Pitfall 4: Parallax Causing Layout Shift Below the Hero

**What goes wrong:** Applying `translateY` to the hero image moves it visually, but since it uses `position: absolute` within a reserved `aspect-[16/7]` container, the container height is static — the scroll effect should not affect layout. However, if transform is accidentally applied to the container `div` rather than the inner `<img>`, the container itself moves and the data panel below shifts.

**Why it happens:** Attaching the `ref` to the outer container div instead of the inner `<img>`.

**How to avoid:** The parallax `ref` must be attached to the inner `<img>`, not to the outer `aspect-[16/7]` container div. The container is what reserves the layout space.

**Warning signs:** Data panel shifts position as the user scrolls.

### Pitfall 5: `window` Access During SSR / Prerender

**What goes wrong:** Vite projects can be prerendered. `window.matchMedia` and `window.scrollY` are not available during SSR/prerender and will throw `ReferenceError: window is not defined`.

**Why it happens:** Server-side environments have no `window` object.

**How to avoid:** All `window` access must live inside `useEffect` (or a `typeof window !== 'undefined'` guard). The `usePrefersReducedMotion` hook must initialise state with a safe default (`false`) and read `window.matchMedia` inside `useEffect` only. [ASSUMED: this project does not currently use SSR/prerender, but the guard is cheap and future-proofs the code.]

---

## Code Examples

### Complete `useScrollParallax` hook

```js
// src/hooks/useScrollParallax.js
// Source: pattern verified against builder.io/blog/parallax-scrolling-effect + MDN scroll events

import { useEffect, useRef } from 'react'

/**
 * Attaches a passive scroll listener and applies a subtle translateY
 * to the returned ref element via requestAnimationFrame.
 *
 * @param {object} options
 * @param {number} options.speed  - Multiplier: scrollY * speed = parallax pixels. Default 0.05.
 * @param {boolean} options.disabled - When true, no listener is attached (reduced motion path).
 * @param {string} options.baseTransform - CSS transform to combine with parallax. Default 'translateY(-50%)'.
 */
export function useScrollParallax({ speed = 0.05, disabled = false, baseTransform = 'translateY(-50%)' } = {}) {
  const ref = useRef(null)
  const ticking = useRef(false)
  const rafHandle = useRef(null)

  useEffect(() => {
    if (disabled || !ref.current) return

    function update() {
      if (ref.current) {
        const py = window.scrollY * speed
        ref.current.style.transform = `translateY(${py}px) ${baseTransform}`
      }
      ticking.current = false
    }

    function onScroll() {
      if (!ticking.current) {
        rafHandle.current = requestAnimationFrame(update)
        ticking.current = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafHandle.current) cancelAnimationFrame(rafHandle.current)
    }
  }, [disabled, speed, baseTransform])

  return ref
}
```

### `usePrefersReducedMotion` hook

```js
// src/hooks/usePrefersReducedMotion.js
// Source: MDN prefers-reduced-motion docs [VERIFIED: developer.mozilla.org]

import { useState, useEffect } from 'react'

export function usePrefersReducedMotion() {
  // Safe default: false (animate). Updated in useEffect (after mount) to real OS value.
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
```

### Threading `reducedMotion` in `App.jsx`

```jsx
// App.jsx — add one hook call, two prop passes; no other changes
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js'

function App() {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB)
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div ...>
      <AtmosphericBackdrop activeTab={activeTab} reducedMotion={reducedMotion} />
      <StarField />
      <main ...>
        ...
        <BodyHero activeTab={activeTab} reducedMotion={reducedMotion} />
        ...
      </main>
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framer Motion for React animations | CSS transitions + `window.matchMedia` for simple cases | Always applicable | No library needed for opacity fades and small transforms |
| `key=` remount for image swaps | Two-layer always-mounted opacity pattern | Phase 7 → Phase 8 | Enables genuine cross-fade instead of fade-in-only |
| JS-driven animation loops | CSS `transition` for state-change animations | 2020+ | Browser handles interpolation, reduced-motion, and GPU compositing |
| View Transitions API | Viable modern alternative, but React 18 support is limited without React 19's `<ViewTransition>` | 2025 | Out of scope for this phase; CSS transitions achieve the same result without the React 19 requirement |

**Deprecated/outdated:**
- `css cross-fade()` function: Still Safari-only in 2025; do not use in cross-browser code. [CITED: css-tricks.com/almanac/functions/c/cross-fade/]
- React `<ViewTransition>`: Requires React 19+; this project is on React 18.3.1. Not applicable. [ASSUMED: React 19 docs reviewed; `<ViewTransition>` is a React 19 feature]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Zero new dependencies is a hard constraint for this phase | Standard Stack | Low — even if wrong, CSS transitions are still the right tool |
| A2 | The project does not use SSR/prerender, but `window` guards are still good practice | Pitfall 5 | Low — guards are 2 lines and cause no harm |
| A3 | React `<ViewTransition>` requires React 19+ | State of the Art | Low — even if backported, CSS transitions are simpler for this scope |

---

## Open Questions

1. **Transition duration for cross-fade**
   - What we know: ROADMAP says "cross-fade smoothly" — no specific ms value stated.
   - What's unclear: Whether 300ms or 500ms reads better against the backdrop's filter (blur+brightness takes a frame to settle).
   - Recommendation: Default to 500ms (`duration-500` in Tailwind); adjust via human-verify checkpoint.

2. **Parallax on `AtmosphericBackdrop` too?**
   - What we know: MOTION-02 specifies "the hero responds to scroll" — only BodyHero is mentioned.
   - What's unclear: Whether the spec intends the backdrop to also parallax (creating a depth difference between layers).
   - Recommendation: Implement parallax on BodyHero only per spec; the backdrop is fixed — it already reads as a separate depth plane.

3. **`imgLoaded` reset strategy for BodyHero tab switch**
   - What we know: Current `key={activeTab}` will be removed; `imgLoaded` must reset per-body.
   - What's unclear: Whether images will be browser-cached on second visit to a body (making per-body tracking invisible anyway).
   - Recommendation: Implement per-body `loaded` state (`{ mars: false, moon: false }`) — correctness regardless of cache.

---

## Environment Availability

Step 2.6: SKIPPED — phase is pure code/state changes within the existing React + Tailwind + Vite stack. No external tools, services, databases, or CLI utilities beyond what is already installed. Node 22.20.0 and npm 10.9.3 confirmed present. [VERIFIED: `node --version` + `npm --version` run during research]

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node built-in test runner (`node:test`) |
| Config file | none — invoked via `npm test` → `node --test "src/**/*.test.js"` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MOTION-01 | Backdrop and hero opacity transitions on tab switch | manual-only | n/a — requires visual browser verification | — |
| MOTION-02 | Hero translateY changes with scrollY (speed=0.05, ~10px at 200px scroll) | unit | `npm test` (test the `useScrollParallax` math: given scrollY=200, speed=0.05, expect py=10) | ❌ Wave 0 |
| MOTION-03 | When `prefers-reduced-motion: reduce`, no scroll listener attached, transitions disabled | unit | `npm test` (mock `window.matchMedia` returning true; verify listener not added) | ❌ Wave 0 |

**MOTION-01 is manual-only:** CSS transition correctness requires a running browser; it cannot be unit-tested in Node. The human-verify checkpoint covers it.

### Sampling Rate

- **Per task commit:** `npm test` (runs all `*.test.js` files)
- **Per wave merge:** `npm test` + `npm run build` (build exit-0 check)
- **Phase gate:** Full suite green + human visual verify before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/hooks/useScrollParallax.test.js` — covers MOTION-02 math (parallaxY = scrollY × speed)
- [ ] `src/hooks/usePrefersReducedMotion.test.js` — covers MOTION-03 (mock matchMedia, verify `reduced=true`)

---

## Security Domain

This phase introduces no authentication, session management, input validation, cryptography, or data persistence. No ASVS categories apply. The only new runtime surface is `window.matchMedia` and `window.scrollY`, both read-only browser APIs — no user input, no external data, no secrets.

**Security domain: NOT APPLICABLE for this phase.**

---

## Project Constraints (from CLAUDE.md)

The following directives from `CLAUDE.md` apply to this phase:

| Directive | Impact on Phase 8 |
|-----------|-------------------|
| React + Vite + Tailwind + React Query — no backend overhead | Confirmed: no backend work in this phase |
| No hardcoding API keys | Not applicable — no API calls in this phase |
| Do not invent data or fabricate values | Not applicable — no data display in this phase |
| `VITE_NASA_API_KEY` env var for all key use | Not applicable |
| Out of scope: new dependencies not approved | **Directly applies:** no framer-motion, no GSAP, no new npm packages |
| Desktop-first | Parallax and cross-fade should work on desktop; must not break on mobile |
| Per-card loading/error states preserved | Not modified by this phase — data panel is untouched |

---

## Sources

### Primary (HIGH confidence)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) — values, browser support (Baseline 2020), `window.matchMedia` API verified
- [MDN: CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions) — opacity transition behavior verified
- Phase 7 shipped code (`AtmosphericBackdrop.jsx`, `BodyHero.jsx`, `App.jsx`) — exact current DOM structure, existing transforms, z-index contract verified by direct file read

### Secondary (MEDIUM confidence)
- [builder.io/blog/parallax-scrolling-effect](https://www.builder.io/blog/parallax-scrolling-effect) — rAF-throttled scroll parallax pattern, `willChange: transform` guidance
- [css3.bradshawenterprises.com/cfimg](http://css3.bradshawenterprises.com/cfimg/) — layered opacity cross-fade pattern (the canonical pre-View-Transitions approach)
- [css-tricks.com: cross-fade()](https://css-tricks.com/almanac/functions/c/cross-fade/) — confirmation that `cross-fade()` CSS function is Safari-only

### Tertiary (LOW confidence)
- Multiple 2025/2026 blog sources (builder.io, openreplay.com, lo-victoria.com) on scroll-aware React components — consistent pattern across sources elevates confidence to MEDIUM for the core hook shape

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new deps; existing CSS + React APIs verified
- Architecture: HIGH — both component structures read from actual source files
- Cross-fade pattern: HIGH — standard layered-opacity technique, verified across multiple sources
- Parallax hook: MEDIUM — pattern consistent across sources; exact `speed` value is a tunable (verify at human checkpoint)
- Pitfalls: HIGH — derived directly from Phase 7 code structure (transform clobbering, LQIP state reset)

**Research date:** 2026-05-28
**Valid until:** 2026-06-28 (stable APIs — no churn expected)
