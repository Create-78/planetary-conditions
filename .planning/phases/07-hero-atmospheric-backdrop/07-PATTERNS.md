# Phase 7: Hero + Atmospheric Backdrop — Pattern Map

**Mapped:** 2026-05-28
**Files analyzed:** 6 new/modified files
**Analogs found:** 6 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/AtmosphericBackdrop.jsx` | component (decorative backdrop) | transform (activeTab → background-image + CSS filter) | `src/components/StarField.jsx` | exact — same fixed inset-0 z-0 aria-hidden pattern |
| `src/components/BodyHero.jsx` | component (content image) | transform (activeTab → picture src) | `src/components/TabBar.jsx` | role-match — activeTab prop drives conditional rendering |
| `src/App.jsx` | layout root (modified) | request-response (mount order, prop wiring) | `src/App.jsx` itself | self-reference — small surgical insertion |
| `src/constants/tabs.js` | config (modified) | transform (id → asset paths + LQIP) | `src/constants/tabs.js` itself | self-reference — extend existing TABS entries |
| `src/assets/bodies/` (directory + 6 committed files) | static asset | file-I/O (build-time committed) | none — first asset directory in project | no analog |
| `.gitignore` (modified) | config | — | `.gitignore` itself | self-reference — append two lines |

---

## Pattern Assignments

### `src/components/AtmosphericBackdrop.jsx` (component, decorative backdrop)

**Analog:** `src/components/StarField.jsx`

**Imports pattern** — StarField has no imports (no external deps). AtmosphericBackdrop similarly needs none; asset URLs come from the `activeTab` prop via an internal map.

**Fixed-backdrop shell pattern** (StarField.jsx lines 5–25):
```jsx
function StarField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-space-950"
      style={{
        backgroundImage: `...`,
        backgroundSize: '...',
        opacity: 0.6,
      }}
    />
  )
}

export default StarField
```

Copy this shell verbatim for AtmosphericBackdrop. Replace:
- `style` block with `background-image: url(assetMap[activeTab].webp)`, `background-size: 'cover'`, `background-position: 'center'`, and CSS filter `blur(24px) brightness(35%) saturate(80%)`
- Remove `opacity` (filter handles darkening)
- Add `overflow: 'hidden'` to prevent blur edge bleed
- Accept `activeTab` prop; derive `backgroundImage` from internal map (see constants section below)
- Add a child `<div>` for the gradient overlay (`linear-gradient(to top, #020617 0%, transparent 40%)`) positioned `absolute inset-0` so it composites on top of the blurred image

**Gradient overlay child pattern** — modeled after inline `style` usage in StarField (no Tailwind gradient classes used for `fixed` layers; keeps filter + gradient in the same `style` prop scope):
```jsx
// child div for bottom gradient anchor — applied over the blurred background-image
<div
  className="absolute inset-0"
  style={{ background: 'linear-gradient(to top, #020617 0%, transparent 40%)' }}
/>
```

**Full component target shape:**
```jsx
import marsWebp from '../assets/bodies/mars-1600.webp'
import moonWebp from '../assets/bodies/moon-1600.webp'

const BACKDROP_ASSETS = {
  mars: marsWebp,
  moon: moonWebp,
}

function AtmosphericBackdrop({ activeTab }) {
  const src = BACKDROP_ASSETS[activeTab]
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(24px) brightness(35%) saturate(80%)',
        overflow: 'hidden',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, #020617 0%, transparent 40%)' }}
      />
    </div>
  )
}

export default AtmosphericBackdrop
```

Note on blur edge artifact: `overflow: 'hidden'` on the backdrop container clips the blur bleed at viewport edges. If artifact persists, extend the container by a few px with a negative margin (`margin: '-8px'`, `width: 'calc(100% + 16px)'`, `height: 'calc(100% + 16px)'`) and keep `overflow: 'hidden'` on the parent — this extends the image beyond the viewport before blur is applied.

---

### `src/components/BodyHero.jsx` (component, in-flow image)

**Analog:** `src/components/TabBar.jsx` — best existing match for: (1) accepts `activeTab` prop, (2) maintains an internal lookup map keyed by tab id, (3) drives conditional rendering from that map.

**Prop + internal map pattern** (TabBar.jsx lines 6–15):
```jsx
// Palette-aware styles per tab id.
const TAB_STYLES = {
  mars: { active: '...', inactive: '...' },
  moon: { active: '...', inactive: '...' },
}

function TabBar({ activeTab, onTabChange }) {
  // derive per-tab values from the map
  const styles = TAB_STYLES[tab.id]
  ...
}
```

Copy this map pattern for BodyHero's asset lookup. The map replaces style strings with asset import objects.

**DataCard pattern for internal state flag** (DataCard.jsx lines 54–86) — DataCard's `loaded` state flag pattern applies directly to LQIP fade-out: track `imgLoaded` boolean in `useState`, set it to `true` via `onLoad` on the `<img>`, conditionally hide the LQIP background-image when loaded.

**Full component target shape:**
```jsx
import { useState } from 'react'
import marsWebp from '../assets/bodies/mars-1600.webp'
import marsPng from '../assets/bodies/mars-1600.png'
import moonWebp from '../assets/bodies/moon-1600.webp'
import moonPng from '../assets/bodies/moon-1600.png'

// LQIP data URIs — inline base64 strings generated during asset pipeline step.
// Replace placeholder strings with real base64 after running the image pipeline.
const LQIP = {
  mars: 'data:image/webp;base64,REPLACE_WITH_MARS_LQIP_BASE64',
  moon: 'data:image/webp;base64,REPLACE_WITH_MOON_LQIP_BASE64',
}

const HERO_ASSETS = {
  mars: { webp: marsWebp, png: marsPng, alt: "Mars — artist's impression" },
  moon: { webp: moonWebp, png: moonPng, alt: "Moon — artist's impression" },
}

function BodyHero({ activeTab }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const asset = HERO_ASSETS[activeTab]
  const lqip = LQIP[activeTab]

  return (
    <div className="relative w-full aspect-[16/7] rounded-lg overflow-hidden mb-4">
      {/* LQIP layer — shown until full image loads */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
        style={{
          backgroundImage: `url(${lqip})`,
          filter: 'blur(8px)',
          opacity: imgLoaded ? 0 : 1,
        }}
      />

      {/* Full-res hero image */}
      <picture>
        <source srcSet={asset.webp} type="image/webp" />
        <img
          src={asset.png}
          alt={asset.alt}
          width={1600}
          height={700}
          loading="eager"
          onLoad={() => setImgLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </picture>

      {/* Bottom vignette — soft handoff into data panel */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: 'linear-gradient(to top, #020617 0%, transparent 100%)' }}
      />

      {/* Artist's impression label */}
      <span
        className="absolute bottom-2 right-2 text-xs text-white bg-black/50 rounded px-2 py-1"
        aria-label="This is an artist's impression, not a photograph"
      >
        Artist's impression
      </span>
    </div>
  )
}

export default BodyHero
```

Note: `aspect-[16/7]` + explicit `width`/`height` on `<img>` ensures CLS ≈ 0 (D-13). `loading="eager"` is required — this is above the fold (D-UI-SPEC).

---

### `src/App.jsx` (layout root, modified)

**Analog:** `src/App.jsx` itself — the modification is a surgical insertion following the existing mount pattern.

**Existing mount pattern** (App.jsx lines 1–6, 13–14):
```jsx
import StarField from './components/StarField.jsx'
// ...
<StarField />
```

**Target mount pattern — add AtmosphericBackdrop before StarField, BodyHero between TabBar div and data panel div:**
```jsx
// New imports (add alongside existing component imports):
import AtmosphericBackdrop from './components/AtmosphericBackdrop.jsx'
import BodyHero from './components/BodyHero.jsx'

// Inside the return, replace the two-child shell (lines 12–34) with:
<div className="relative min-h-screen w-full font-sans text-slate-100 antialiased">
  <AtmosphericBackdrop activeTab={activeTab} />   {/* NEW — z-0, below StarField */}
  <StarField />                                    {/* EXISTING — opacity reduced to 0.4 */}

  <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-8 md:py-12">
    <header className="mb-8 md:mb-12">
      {/* unchanged */}
    </header>

    <div className="mb-8 md:mb-10">
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>

    <BodyHero activeTab={activeTab} />              {/* NEW — in-flow between TabBar and panel */}

    <div className="rounded-lg border border-slate-800/60 bg-slate-950/30 backdrop-blur-md p-6 md:p-8">
      {/* data panel — bg changed: /40 → /30; blur changed: sm → md (D-07) */}
      {activeTab === TABS.MARS.id && <MarsTab />}
      {activeTab === TABS.MOON.id && <MoonTab />}
    </div>
  </main>
</div>
```

Two values change on the data panel div:
- `bg-slate-950/40` → `bg-slate-950/30` (D-07: slightly more translucent)
- `backdrop-blur-sm` → `backdrop-blur-md` (D-07: slightly more blur)

Apply D-06 contrast guardrail during execution: if body text fails 4.5:1, reverse these toward `/40` and `backdrop-blur-sm`.

StarField opacity edit: in `src/components/StarField.jsx` line 19, change `opacity: 0.6` to `opacity: 0.4` (D-09).

---

### `src/constants/tabs.js` (config, modified)

**Analog:** `src/constants/tabs.js` itself — extend each tab entry with an `assets` key following the existing object shape.

**Existing shape** (tabs.js lines 4–15):
```js
export const TABS = {
  MARS: {
    id: 'mars',
    label: 'Mars',
    paletteKey: 'mars',
  },
  MOON: {
    id: 'moon',
    label: 'Moon',
    paletteKey: 'moon',
  },
}
```

**Target shape — add `heroAlt` per tab (assets themselves imported directly in each component; LQIP base64 strings live in BodyHero.jsx):**

The CONTEXT (D-47, Claude's Discretion) gives executor latitude on where asset mapping lives. The recommended approach: keep asset imports co-located in `AtmosphericBackdrop.jsx` and `BodyHero.jsx` (avoids circular imports and keeps each component self-contained). `tabs.js` only needs the `alt` text string per tab to stay consistent with the existing constants pattern:

```js
export const TABS = {
  MARS: {
    id: 'mars',
    label: 'Mars',
    paletteKey: 'mars',
    heroAlt: "Mars — artist's impression",    // NEW
  },
  MOON: {
    id: 'moon',
    label: 'Moon',
    paletteKey: 'moon',
    heroAlt: "Moon — artist's impression",    // NEW
  },
}
```

If executor prefers centralizing all asset paths in `tabs.js` (or a new `src/constants/bodyAssets.js`), that is equally valid — the pattern is the same TABS object extension.

---

### `src/assets/bodies/` (static assets, new directory)

**Analog:** None — first asset directory in this project.

**Asset pipeline contract (not a code pattern — an execution sequence):**

```bash
# Generate from source PNGs at repo root.
# Run once; commit outputs; gitignore sources.

mkdir -p src/assets/bodies

# WebP — target ≤ 150 KB each
cwebp -q 80 mars-image.png -o src/assets/bodies/mars-1600.webp
cwebp -q 80 moon-image.png -o src/assets/bodies/moon-1600.webp

# PNG fallback — target ≤ 400 KB each (use pngquant to compress)
cp mars-image.png src/assets/bodies/mars-1600.png
cp moon-image.png src/assets/bodies/moon-1600.png
pngquant --force --quality=65-80 src/assets/bodies/mars-1600.png --output src/assets/bodies/mars-1600.png
pngquant --force --quality=65-80 src/assets/bodies/moon-1600.png --output src/assets/bodies/moon-1600.png

# LQIP — 24px wide, blurred, base64-encode the result for inline use
cwebp -q 20 -resize 24 0 mars-image.png -o /tmp/mars-lqip.webp
cwebp -q 20 -resize 24 0 moon-image.png -o /tmp/moon-lqip.webp
base64 /tmp/mars-lqip.webp   # paste output into LQIP.mars in BodyHero.jsx
base64 /tmp/moon-lqip.webp   # paste output into LQIP.moon in BodyHero.jsx
```

Verify sizes before committing:
```bash
du -sh src/assets/bodies/*
# WebP files should each be ≤ 150 KB; PNG fallbacks ≤ 400 KB.
# If WebP exceeds budget: re-run cwebp at -q 70 or lower.
```

Committed files: `mars-1600.webp`, `mars-1600.png`, `moon-1600.webp`, `moon-1600.png` (4 files — LQIP strings are inlined in BodyHero.jsx, not committed as files).

---

### `.gitignore` (config, modified)

**Analog:** `.gitignore` itself — append two lines following the existing comment-then-rule convention.

**Existing pattern** (representative block):
```
# Dependencies
node_modules
```

**Lines to append:**
```
# Phase 7 — source PNGs (multi-MB design masters, not committed)
mars-image.png
moon-image.png
```

---

## Shared Patterns

### Fixed decorative backdrop shell
**Source:** `src/components/StarField.jsx` lines 5–25
**Apply to:** `AtmosphericBackdrop.jsx`
```jsx
// Shell: aria-hidden, pointer-events-none, fixed inset-0 z-0, no imports needed.
// All visual work done in `style` prop — CSS properties not available as Tailwind utilities.
<div
  aria-hidden="true"
  className="pointer-events-none fixed inset-0 z-0"
  style={{ /* background-image, filter, overflow */ }}
/>
```

### activeTab prop → internal lookup map
**Source:** `src/components/TabBar.jsx` lines 6–15, 17, 26–27
**Apply to:** `AtmosphericBackdrop.jsx`, `BodyHero.jsx`
```jsx
// Per-tab constant map at module scope; derive value inside function body.
const PER_TAB_MAP = { mars: { ...marsValues }, moon: { ...moonValues } }

function Component({ activeTab }) {
  const config = PER_TAB_MAP[activeTab]
  // ...
}
```

### useState for visual-only component state
**Source:** `src/components/DataCard.jsx` lines 51–96 (state-flag pattern for conditional slot rendering)
**Apply to:** `BodyHero.jsx` (imgLoaded flag for LQIP fade-out)
```jsx
// DataCard uses state to switch between loading/error/ok slots.
// BodyHero uses the same pattern for LQIP → full-res transition.
const [imgLoaded, setImgLoaded] = useState(false)
// onLoad={() => setImgLoaded(true)} on the <img>
```

### Tailwind `style` prop for non-utility CSS
**Source:** `src/components/StarField.jsx` lines 11–18
**Apply to:** `AtmosphericBackdrop.jsx`, `BodyHero.jsx` (gradient overlays, filter values)
```jsx
// Use inline style for: CSS filter, custom gradient strings, and values that
// change dynamically (opacity tied to state). Use className for static layout.
style={{
  backgroundImage: `radial-gradient(...)`,
  backgroundSize: '...',
  opacity: 0.6,
}}
```

### Vite static asset import (relative path)
**Source:** No existing example in codebase — this is the first asset import.
**Apply to:** `AtmosphericBackdrop.jsx`, `BodyHero.jsx`
```jsx
// Vite resolves relative imports to hashed URLs at build time.
// Import from src/assets/bodies/ using a relative path from the component file.
import marsWebp from '../assets/bodies/mars-1600.webp'
// Results in a URL string at runtime — safe to use in backgroundImage or src.
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/assets/bodies/` (directory + image files) | static asset | file-I/O | No image assets exist in the project yet; asset pipeline is new |

---

## Metadata

**Analog search scope:** `src/components/`, `src/constants/`, `src/App.jsx`, `.gitignore`
**Files scanned:** 10 (StarField.jsx, App.jsx, TabBar.jsx, DataCard.jsx, TooltipWrapper.jsx, LoadingState.jsx, AlertCard.jsx, StatusBadge.jsx, tabs.js, tooltips.js)
**Pattern extraction date:** 2026-05-28
