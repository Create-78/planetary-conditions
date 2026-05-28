---
phase: 07-hero-atmospheric-backdrop
plan: 01
subsystem: ui
tags: [images, webp, png, lqip, sips, sharp-cli, assets, gitignore, image-pipeline]

# Dependency graph
requires: []
provides:
  - "src/assets/bodies/mars-1600.webp — 1600x873 Mars hero WebP (39KB), VP8 encoding"
  - "src/assets/bodies/mars-1600.png — 800x436 Mars PNG fallback (402KB)"
  - "src/assets/bodies/moon-1600.webp — 1600x873 Moon hero WebP (63KB), VP8 encoding"
  - "src/assets/bodies/moon-1600.png — 800x436 Moon PNG fallback (400KB)"
  - ".planning/phases/07-hero-atmospheric-backdrop/07-01-LQIP.md — two LQIP base64 data URIs for Plan 02 blur-up"
  - ".gitignore — mars-image.png and moon-image.png excluded from version control"
affects: [07-02, 07-03, AtmosphericBackdrop.jsx, BodyHero.jsx]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "npx sharp-cli (ephemeral) for image pipeline — satisfies D-11 no-new-build-dependency rule"
    - "sips (macOS native) for PNG resize fallback"
    - "LQIP base64 data URIs captured in planning artifact for Plan 02 to inline"

key-files:
  created:
    - "src/assets/bodies/mars-1600.webp"
    - "src/assets/bodies/mars-1600.png"
    - "src/assets/bodies/moon-1600.webp"
    - "src/assets/bodies/moon-1600.png"
    - ".planning/phases/07-hero-atmospheric-backdrop/07-01-LQIP.md"
  modified:
    - ".gitignore"

key-decisions:
  - "npx sharp-cli used (not sips) for WebP encoding — sips on macOS 26.5 fails with 'Can't write format: org.webmproject.webp' despite listing webp in --formats"
  - "sips used for PNG resize (macOS native) — but sharp-cli Node API used for final PNG generation to strip RGBA alpha (PNG RGBA at 1600px ~1.9MB, well over 409600 budget)"
  - "PNG fallbacks at 800x436px (not 1600px) — RGBA source images compress to ~1.9MB at 1600px; removing alpha + 800px yields 401-402KB within budget; WebP path gets full 1600px"
  - "LQIP generated at 24x13px, quality 20 WebP via sharp Node API — 104/102 bytes pre-encode; data URIs are 163/159 chars (well under 4KB target)"

patterns-established:
  - "Image pipeline: npx sharp-cli (ephemeral, no package.json dep) for WebP; sharp Node API for PNG+alpha-strip"
  - "LQIP handoff: planning artifact 07-01-LQIP.md holds exact base64 data URIs for subsequent plans to inline"
  - "Gitignore: named exclusions only (not *.png glob) so committed optimized assets stay tracked"

requirements-completed: [IMG-01, IMG-03]

# Metrics
duration: 5min
completed: 2026-05-28
---

# Phase 7 Plan 01: Hero Image Asset Pipeline Summary

**Pre-optimized WebP + PNG fallback + LQIP hero assets for Mars and Moon committed under src/assets/bodies/, source PNGs gitignored, using ephemeral npx sharp-cli (no package.json change)**

## Performance

- **Duration:** ~5 minutes
- **Started:** 2026-05-28T17:09:06Z
- **Completed:** 2026-05-28T17:14:00Z
- **Tasks:** 3 (2 with commits, 1 verification-only)
- **Files modified:** 6

## Accomplishments

- Gitignored mars-image.png and moon-image.png (multi-MB source masters) so they cannot be accidentally committed
- Generated 4 committed image assets: Mars+Moon WebP at 1600px (39KB/63KB) and PNG fallback at 800px (402KB/400KB) — all within byte budgets
- Captured two 24px LQIP base64 data URIs (163/159 chars each) in 07-01-LQIP.md for Plan 02 blur-up inline
- Verified production build exits 0, package.json/package-lock.json unchanged (D-11 satisfied)

## Final Asset Sizes

| File | Dimensions | Size | Budget | Status |
|------|-----------|------|--------|--------|
| mars-1600.webp | 1600x873 | 39,576 bytes (39KB) | 153,600 bytes | PASS |
| moon-1600.webp | 1600x873 | 62,896 bytes (63KB) | 153,600 bytes | PASS |
| mars-1600.png | 800x436 | 401,735 bytes (402KB) | 409,600 bytes | PASS |
| moon-1600.png | 800x436 | 399,533 bytes (400KB) | 409,600 bytes | PASS |

Combined per-tab WebP weight: 39KB or 63KB (whichever body) — well within ~300KB budget.

## Generation Commands (Reproducibility)

**WebP (primary — 1600px, Q80):**
```
npx --yes sharp-cli --input <body>-image.png --output src/assets/bodies/<body>-1600.webp --format webp --quality 80 resize 1600
```

**PNG fallback (800px, RGB, max compression):**
```
node -e "
const sharp = require('/path/to/npx/sharp/module');
sharp('<body>-image.png').removeAlpha().resize(800, null, {fit:'inside'}).png({compressionLevel:9}).toFile('src/assets/bodies/<body>-1600.png')
  .then(i => console.log(i));
"
```

**LQIP (24px, Q20 WebP):**
```
node -e "
const sharp = require('/path/to/npx/sharp/module');
sharp('<body>-image.png').resize(24, null, {fit:'inside'}).webp({quality:20}).toFile('/tmp/<body>-lqip.webp')
  .then(i => console.log(i));
"
printf 'data:image/webp;base64,'; base64 -i /tmp/<body>-lqip.webp | tr -d '\n'
```

## Task Commits

Each task was committed atomically:

1. **Task 1: Gitignore source PNG masters** - `6e837dd` (chore)
2. **Task 2: Generate optimized assets + LQIP** - `e995b7e` (feat)
3. **Task 3: Build verification** - (no commit — verification only, no files modified)

## Files Created/Modified

- `.gitignore` — Added named exclusions for mars-image.png and moon-image.png
- `src/assets/bodies/mars-1600.webp` — Mars hero WebP, 1600x873 VP8, 39KB
- `src/assets/bodies/mars-1600.png` — Mars PNG fallback, 800x436 RGB, 402KB
- `src/assets/bodies/moon-1600.webp` — Moon hero WebP, 1600x873 VP8, 63KB
- `src/assets/bodies/moon-1600.png` — Moon PNG fallback, 800x436 RGB, 400KB
- `.planning/phases/07-hero-atmospheric-backdrop/07-01-LQIP.md` — LQIP handoff for Plan 02

## Decisions Made

1. **sips WebP write broken on macOS 26.5:** Despite `sips --formats` listing `org.webmproject.webp`, sips returns error 13 ("Can't write format: org.webmproject.webp") on this OS version. Fell back to `npx sharp-cli` per the plan's documented fallback path. D-11 satisfied — npx is ephemeral, package.json unchanged.

2. **PNG fallbacks at 800px (not 1600px):** Source images are 2816x1536 RGBA. Even after resize to 1600px, PNG with RGBA channels is ~1.9MB, far over the 409KB budget. Stripping alpha and resizing to 800px yields 401-402KB, within budget. PNG fallback is a compatibility path for non-WebP browsers — 800px is still acceptable resolution for a background image. WebP path delivers the full 1600px.

3. **sharp Node API for PNG alpha strip:** `npx sharp-cli` CLI subcommand chaining doesn't support combining `removeAlpha` and `resize` in one invocation. Used the sharp Node module directly (located via npx cache) to chain `.removeAlpha().resize(800).png({compressionLevel:9})`. No permanent dependency added.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] sips WebP write unavailable on macOS 26.5**
- **Found during:** Task 2 (Generate optimized WebP assets)
- **Issue:** `sips -s format webp` fails with "Can't write format: org.webmproject.webp" on macOS 26.5 (sips-316), despite the environment_facts stating sips DOES support WebP. The planner verified against an earlier OS version; macOS 26.5 (Tahoe) behaves differently.
- **Fix:** Used the plan's documented fallback: `npx --yes sharp-cli` for WebP generation. For PNG with alpha strip, used sharp Node module directly from npx cache.
- **Files modified:** None (pipeline tool switch, not a code file change)
- **Verification:** All four assets pass byte-budget checks; `npm run build` exits 0; package.json unchanged
- **Committed in:** e995b7e (Task 2 commit)

**2. [Rule 1 - Bug] PNG budget requires 800px downscale (not 1400px)**
- **Found during:** Task 2 (PNG budget verification)
- **Issue:** Plan said "re-run with --resampleHeightWidthMax 1400" if PNG exceeds budget, but even 1400px RGBA PNG is ~1.4MB (still over 409KB). The plan didn't account for RGBA channels doubling file size vs RGB.
- **Fix:** Reduced to 800px AND stripped alpha channel (RGB only) using sharp's `removeAlpha()`. This yields 401-402KB within the 409KB budget. PNG fallback dimensions "need only match the WebP closely, not exactly" per the plan — 800px is the compliant minimum.
- **Files modified:** `src/assets/bodies/mars-1600.png`, `src/assets/bodies/moon-1600.png`
- **Verification:** Both PNGs pass `wc -c ≤ 409600` check
- **Committed in:** e995b7e (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug/size-calibration)
**Impact on plan:** Both auto-fixes required for plan completion. No scope creep. D-11 (no new build dep) satisfied. IMG-01 and IMG-03 requirements met.

## Known Stubs

None. All assets are real optimized images from the source PNG masters.

## Issues Encountered

- sips WebP write broken on macOS 26.5 — handled via documented fallback (npx sharp-cli)
- PNG RGBA channels make 1400px PNG ~1.4MB (well over budget) — resolved by alpha strip + 800px scale

## User Setup Required

None — no external service configuration required. All assets are committed to the repo.

## Next Phase Readiness

- Plan 02 (BodyHero.jsx) can import `src/assets/bodies/mars-1600.webp` and `src/assets/bodies/moon-1600.webp` directly
- Plan 02 should inline the LQIP data URIs from `.planning/phases/07-hero-atmospheric-backdrop/07-01-LQIP.md`
- Plan 03 (AtmosphericBackdrop.jsx) can import the same WebP assets as CSS background-image sources
- PNG fallback path ready for `<picture>` element `<source type="image/webp">` / `<img>` pattern in Plan 02/03

---
*Phase: 07-hero-atmospheric-backdrop*
*Completed: 2026-05-28*
