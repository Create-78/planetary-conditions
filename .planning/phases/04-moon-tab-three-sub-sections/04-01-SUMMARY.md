---
phase: 04-moon-tab-three-sub-sections
plan: 01
subsystem: utilities-and-tooltips
tags: [moon, utils, tooltips, lunar-phase, radiation-risk]
status: complete
requirements: [LUNAR-05, SWPC-07]
dependency_graph:
  requires: []
  provides:
    - "src/utils/lunarPhase.js → computePhase(date), surfaceTemp(fraction)"
    - "src/utils/radiationRisk.js → deriveRadiationRisk({ speed, kp })"
    - "src/constants/tooltips.js → 11 new/rewritten Moon-tab keys (lunar.*, swpc.*, donki.*)"
  affects:
    - "Plan 04-02 hooks (useLunarPhase, useSolarWind, useDonkiEvents) consume these utilities"
    - "Plan 04-03 MoonTab body binds tooltipKey props against the new keys"
tech_stack:
  added: []
  patterns:
    - "Pure-math utility modules colocated under src/utils/ (no React, no imports)"
    - "Tooltip source-of-truth flat namespaced map with source attribution per Phase 3 D-21"
    - "Heuristic-not-scientific framing documented inline (anti-cargo-cult guardrail)"
key_files:
  created:
    - src/utils/lunarPhase.js
    - src/utils/radiationRisk.js
  modified:
    - src/constants/tooltips.js
decisions:
  - "Kept surfaceTemp() co-located in lunarPhase.js rather than splitting to lunarTemperature.js (D-03 / LUNAR-05)"
  - "Inlined radiation-risk threshold literals (5, 700, 3, 500) — not reused elsewhere in v1"
  - "Did NOT add Vitest — relied on inline node --input-type=module behavioral checks during execution; build + grep contracts are the durable proof"
  - "Removed moon.example tooltip key despite MoonTab.jsx still referencing it (2 sites) — Plan 04-03 replaces MoonTab.jsx body, and getTooltip() returns null on miss so no runtime crash in the interim"
metrics:
  duration_minutes: 2.83
  tasks_completed: 3
  files_changed: 3
  commits: 3
  completed_date: "2026-05-21"
---

# Phase 04 Plan 01: Lunar/Radiation Utilities + Phase 4 Tooltip Copy — Summary

Landed two pure-math utility modules (`lunarPhase.js`, `radiationRisk.js`) and extended `tooltips.js` from 11 keys to 19 to unblock Plan 04-02 hooks and Plan 04-03 MoonTab integration — zero new dependencies, build clean.

## What Was Built

### `src/utils/lunarPhase.js` (NEW)

Pure-math module — no React, no imports. Implements the canonical Julian Date lunar-phase model from 04-CONTEXT D-02 / D-03 / D-04 / D-05.

**Exports:**
- `computePhase(date: Date) → { phaseFraction, phaseName, dayNightStatus, surfaceTempC }`
- `surfaceTemp(fraction: number) → number` (cosine interpolation, °C)

**Canonical constants (verbatim from 04-CONTEXT):**
- Synodic month `SYNODIC = 29.530588853` (days)
- Reference new moon `REF_NEW_MOON_JD = 2451550.1` (2000-01-06 18:14 UTC)
- Unix-epoch JD offset `2440587.5` (in `julianDate()` formula)

**Eight-name phase classifier:** New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent — bands ~2.5% wide for quarter/new/full per the ~18-hour convention.

**Day/night status (D-04):** `'Day side facing Earth'` / `'Night side facing Earth'` / `'Crescent (partial)'` — short descriptive string, not boolean.

**Cosine surface-temperature interpolation:** `-23 - 150 * Math.cos(2π * fraction)` — passes through (0, -173), (0.25, -23), (0.5, 127), (0.75, -23). Returns the temperature of the illuminated face we can see from Earth, not the global average; the UI provides the "Estimated surface temp" label.

**Header documents the model as an estimate, not LRO Diviner data** — honoring LUNAR-04's honesty requirement.

**Behavioral checks at execution time (10/11 pass, 1 expected-noise):**
- Reference date → name='New Moon', dayNight='Night side facing Earth', temp ≈ −173 °C ✓
- Reference + ~15 days → fraction ≈ 0.50, name='Full Moon', dayNight='Day side facing Earth', temp ≈ 127 °C ✓
- Pre-reference date (1999) → valid fraction in [0,1), no NaN (double-modulo guard works) ✓
- `surfaceTemp(0.5)=127`, `surfaceTemp(0)=-173`, `surfaceTemp(0.25)=-23` ✓
- (The "failure" was an over-tight test tolerance asserting phaseFraction ≈ 0 to 0.001 at the exact reference timestamp; actual fraction was 0.0054, still inside the New Moon band <0.025 — name/dayNight/temp all correct.)

### `src/utils/radiationRisk.js` (NEW)

Pure-function module — no React, no imports.

**Export:** `deriveRadiationRisk({ speed, kp }) → 'low' | 'moderate' | 'high' | null`

**Thresholds (D-15):**
- `null` if either input is missing (loose-equality null check catches both `null` and `undefined`)
- `'high'` if `kp >= 5 || speed >= 700`
- `'moderate'` if `kp >= 3 || speed >= 500`
- `'low'` otherwise

**Behavioral checks at execution time: 10/10 pass.** All boundary cases (speed=499/500/700, kp=0/3/5, null/undefined inputs) return the expected severity.

**Header documents the educational-heuristic framing** (the word "heuristic" appears verbatim so future-us doesn't mistake the thresholds for empirical risk).

### `src/constants/tooltips.js` (MODIFIED)

Extended the `TOOLTIPS` map from **11 keys → 19 keys** with all Moon-tab copy locked verbatim from 04-CONTEXT D-35.

**Added (9 keys):**

| Key | Source attribution |
|---|---|
| `lunar.phase` | Computed (lunar phase model) |
| `lunar.surfaceTemp` | Computed (lunar phase model) |
| `lunar.dayNight` | Computed (lunar phase model) |
| `swpc.speed` | NOAA SWPC |
| `swpc.density` | NOAA SWPC |
| `swpc.bz` | NOAA SWPC |
| `swpc.kp` | NOAA SWPC |
| `donki.flr` | NASA DONKI |
| `donki.gst` | NASA DONKI |

**Rewritten (2 Phase 2 placeholders):**
- `swpc.radiationRisk` — final copy: "Derived from solar wind speed + Kp index. Low = quiet; Moderate = elevated; High = storm-level activity that increases surface radiation at the Moon."
- `donki.cme` — final copy: "Coronal Mass Ejection — a burst of plasma and magnetic field from the Sun. Drives geomagnetic storms days after eruption. At the lunar surface: radiation flux can spike for hours to days."

**Removed (1 demo-only key):**
- `moon.example` — was a Phase 2 placeholder. The Phase 2 demo gallery in `src/tabs/MoonTab.jsx` still has 2 `tooltipKey="moon.example"` references that will be wholly removed when Plan 04-03 replaces the MoonTab body. In the interim, `getTooltip('moon.example')` returns `null` and TooltipWrapper renders without the hover affordance — no crash, build clean. This is the planned cross-plan transition.

**Header comment updated:** "Phase 4 (Moon) will add the real lunar.*, swpc.*, donki.* keys." → "Phase 4 (Moon) added the real lunar.*, swpc.*, donki.* keys."

**`getTooltip(key)` accessor unchanged** — same `TOOLTIPS[key] || null` signature.

## Phase 2 Placeholder Fates

| Key | Phase 2 status | Phase 4 disposition |
|---|---|---|
| `moon.example` | Demo-only placeholder | REMOVED (transient `getTooltip → null` until Plan 04-03 replaces MoonTab.jsx body) |
| `swpc.radiationRisk` | Placeholder text | REWRITTEN with final copy (source unchanged: `NOAA SWPC`) |
| `donki.cme` | Placeholder text | REWRITTEN with final copy (source unchanged: `NASA DONKI`) |

## Decisions Made

1. **`surfaceTemp()` co-located in `lunarPhase.js`** — Per D-03 / LUNAR-05. The math is ~3 lines and a header comment; a separate `lunarTemperature.js` would have added a file boundary without separation benefit.
2. **Threshold literals inlined in `deriveRadiationRisk`** — Constants `5`, `700`, `3`, `500` are not reused elsewhere in v1. Extracting them to module-level constants would add ceremony without payoff. If Phase 5 polish introduces a "Severe" tier or scientific-mode toggle, the constants get extracted then.
3. **No Vitest added** — 04-CONTEXT's "Claude's Discretion" section explicitly allowed adding Vitest scoped to these two utility files but did not require it. The behavioral assertions were validated inline at execution time via `node --input-type=module` runs, and the durable verification surface is the build + grep contracts in the plan's `<verify>` block. Adding Vitest now would expand the toolchain without a downstream consumer in the immediate roadmap.
4. **`moon.example` removed despite live references in MoonTab.jsx** — Removed per the plan's explicit instruction. The contract for `getTooltip()` is "missing keys return null instead of crashing" (header doc-comment) — the 2 demo-gallery DataCards now render without a tooltip until Plan 04-03 deletes them.

## Deviations from Plan

**None.** Plan executed exactly as written:
- Three tasks, three commits, three files (2 created + 1 modified)
- All canonical formulas, threshold expressions, and verbatim tooltip strings preserved character-for-character
- Verification block (25+ assertions) passes
- `npm run build` exits 0 after each task and at end of plan
- Zero new npm dependencies

No authentication gates were encountered (the utilities are pure-math; the tooltip change is local constants).

## Commits

| Task | Commit | Files |
|---|---|---|
| 1: lunarPhase.js | `20d73b6` | src/utils/lunarPhase.js |
| 2: radiationRisk.js | `59a3e65` | src/utils/radiationRisk.js |
| 3: tooltips.js extension | `28c732f` | src/constants/tooltips.js |

## Carry-Forward for Plan 04-02

Plan 04-02 will build the three hooks. Imports it should use:

```js
// useLunarPhase.js
import { computePhase, surfaceTemp } from '../utils/lunarPhase'

// useSolarWind.js — radiation risk derivation happens here (or in MoonTab; planner choice)
import { deriveRadiationRisk } from '../utils/radiationRisk'

// All three hooks: getTooltip is consumed via DataCard/StatusBadge/AlertCard tooltipKey props
// in Plan 04-03, not by the hooks themselves
```

**New tooltip keys now available for binding** (Plan 04-03 will wire `tooltipKey={...}` props on the Phase 2 primitives):
- Lunar Context section → `lunar.phase`, `lunar.surfaceTemp`, `lunar.dayNight`
- Solar Wind section → `swpc.speed`, `swpc.density`, `swpc.bz`, `swpc.kp`, `swpc.radiationRisk`
- DONKI section → `donki.cme`, `donki.flr`, `donki.gst`

**`moon.example` transient state warning for Plan 04-03:** The Phase 2 demo MoonTab.jsx body must be fully replaced (per D-29) — its 2 `tooltipKey="moon.example"` references currently resolve to `null` via `getTooltip()`. This is expected mid-phase state, not a bug.

## Requirements Satisfied

- **LUNAR-05** — Math encapsulated in `src/utils/lunarPhase.js`; surface temperature co-located per D-03.
- **SWPC-07** — Radiation Risk derivation encapsulated in `src/utils/radiationRisk.js` as a pure function with documented heuristic framing.

## Self-Check: PASSED

- `src/utils/lunarPhase.js` exists ✓ (commit `20d73b6`)
- `src/utils/radiationRisk.js` exists ✓ (commit `59a3e65`)
- `src/constants/tooltips.js` modified ✓ (commit `28c732f`)
- All 3 commit hashes present in `git log` ✓
- 25+ end-of-plan verification assertions pass ✓
- `npm run build` exits 0 ✓
