---
phase: 05-reliability-ux-polish
plan: 01
subsystem: utils + tabs
tags: [formatters, polish, reliability, REL-02]
dependency_graph:
  requires: []
  provides:
    - "src/utils/formatters.js (formatInt, formatOneDecimal, formatSignedDecimal)"
  affects:
    - "src/tabs/MarsTab.jsx (consumer)"
    - "src/tabs/MoonTab.jsx (consumer; Bz + lunar surfaceTemp now use formatSignedDecimal)"
    - "src/hooks/useMarsData.js (doc-comment polish)"
    - "src/hooks/useDonkiEvents.js (inline eslint-disable rationale)"
tech_stack:
  added: []
  patterns:
    - "Pure-utility module with named exports (mirrors src/utils/env.js shape)"
    - "Em-dash null-handling stays centralized in DataCard.jsx — formatters return null, never '—'"
key_files:
  created:
    - "src/utils/formatters.js"
  modified:
    - "src/tabs/MarsTab.jsx"
    - "src/tabs/MoonTab.jsx"
    - "src/hooks/useMarsData.js"
    - "src/hooks/useDonkiEvents.js"
decisions:
  - "Signed family collapsed from 2 functions (formatSignedInt, formatSignedOneDecimal) to 1 (formatSignedDecimal) per 05-CONTEXT D-17"
  - "Lunar surface temp visual shifts from '+95' → '+95.0'; acceptable because the value is already labeled 'Estimated…'"
  - "Formatters return null (not the em-dash glyph directly) so DataCard.jsx remains the single source of truth for the U+2014 fallback (D-18)"
  - "No Vitest added — pure-utility correctness verified via inline node smoke check (per D-25)"
metrics:
  duration_min: 2.35
  tasks_completed: 2
  files_touched: 5
  completed_date: "2026-05-21"
  commits:
    - "b6b6891: feat(05-01): add centralized number formatters utility"
    - "3bfd89a: refactor(05-01): consume centralized formatters in Mars/Moon tabs; doc polish"
---

# Phase 5 Plan 1: Centralize Number Formatters Summary

**One-liner:** Extracted `formatInt`/`formatOneDecimal`/`formatSignedDecimal` to `src/utils/formatters.js`, replaced inline duplicates in MarsTab.jsx and MoonTab.jsx with imports, and applied two inline doc polish items (useMarsData "nine→eight DataCards"; useDonkiEvents eslint-disable rationale).

## What Was Extracted

Three formatters now live in `src/utils/formatters.js` with a uniform contract: each returns `null` for null/undefined/NaN inputs, letting `DataCard.jsx` render its centralized em-dash (`'—'`, U+2014) fallback.

| Function | Output | Used By |
|----------|--------|---------|
| `formatInt(value)` | Rounded integer string, or null | MarsTab (sol, pressure), MoonTab (phasePercent, solar wind speed) |
| `formatOneDecimal(value)` | `.toFixed(1)` string, or null | MarsTab (min/max temp, wind speed, humidity), MoonTab (density, Kp) |
| `formatSignedDecimal(value)` | One-decimal with explicit `+` for non-negative, or null | MoonTab (Bz, lunar surfaceTemp) |

Smoke check exercised at execution time:
```
formatInt(3.6)            === '4'
formatInt(null)           === null
formatOneDecimal(2.34)    === '2.3'
formatOneDecimal('x')     === null
formatSignedDecimal(1.2)  === '+1.2'
formatSignedDecimal(-1.2) === '-1.2'
formatSignedDecimal(0)    === '+0.0'
```
All pass.

## Signed Family Collapse

MoonTab.jsx previously declared two inline signed formatters:
- `formatSignedInt` (used for lunar surface temp) → rendered "+95"
- `formatSignedOneDecimal` (used for Bz) → rendered "+5.3"

Per 05-CONTEXT D-17, these collapse to a single `formatSignedDecimal` that always produces the one-decimal form.

**Visual consequence:** Lunar surface temp display shifts from "+95" → "+95.0". This is acceptable because the value is a phase-derived estimate already labeled "Estimated Surface Temp (visible face)" in the DataCard label — the extra decimal does not imply false precision; it harmonizes formatting across both signed call sites. Bz formatting is unchanged ("+5.3" / "-3.1").

## Doc-Comment Fixes

**D-22 — `src/hooks/useMarsData.js`:** The JSDoc paragraph that said "propagate state to all nine DataCards" now says "eight DataCards." This corrects drift introduced in Phase 3 when the planner-vs-executor card count diverged; eight is the canonical figure (see STATE.md, Phase 3 Plan 2 decision).

**D-23 — `src/hooks/useDonkiEvents.js`:** Two lines were inserted immediately above the existing `eslint-disable-next-line react-hooks/exhaustive-deps` directive explaining that `NASA_API_KEY` is a Vite build-time constant and is deliberately omitted from the dependency array. The directive itself and the `}, [dayKey])` line below are unchanged.

## Untouched (Intentional)

- **Primitive components** (DataCard, TooltipWrapper, AlertCard, LastUpdated, StatusBadge, LoadingState) — none modified. Phase 2 API surface stays frozen.
- **Silent-refetch lock (D-43 / REL-05)** — `isFetching` does not appear in either MarsTab.jsx or MoonTab.jsx (verified via grep, expected 0, got 0).
- **Dependencies (D-25)** — `package.json` and `package-lock.json` are unchanged. No new npm packages added.
- **AbortSignal threading** — Plan 05-03's job. The three data hooks' `queryFn` signatures are unchanged here.
- **DataCard's em-dash fallback** — formatters return `null`, not the glyph; DataCard remains the single render site for U+2014.

## Deviations from Plan

None — the plan executed exactly as written. The signed-family collapse "+95 → +95.0" delta was pre-disclosed in the plan's `<interfaces>` block and is not a deviation; it is the intended behavior change.

## Verification Outcomes

| Check | Expected | Actual |
|-------|----------|--------|
| `formatters.js` exports count | 3 | 3 |
| MarsTab.jsx `formatters.js` import | 1 | 1 |
| MoonTab.jsx `formatters.js` import | 1 | 1 |
| MarsTab.jsx inline `^function format...` decls | 0 | 0 |
| MoonTab.jsx inline `^function format...` decls | 0 | 0 |
| MoonTab.jsx references to old `formatSignedInt`/`formatSignedOneDecimal` | 0 | 0 |
| `formatSignedDecimal(swpc.bz)` in MoonTab.jsx | 1 | 1 |
| `formatSignedDecimal(lunar.surfaceTempC)` in MoonTab.jsx | 1 | 1 |
| `eight DataCards` in useMarsData.js | 1 | 1 |
| `nine DataCards` in useMarsData.js | 0 | 0 |
| Inline NASA_API_KEY rationale in useDonkiEvents.js | 1 | 1 |
| `isFetching` in MarsTab.jsx | 0 | 0 |
| `isFetching` in MoonTab.jsx | 0 | 0 |
| `git diff --quiet package.json package-lock.json` | exit 0 | exit 0 |
| `npm run build` | exit 0 | exit 0 (built in 1.66s; 99 modules) |

## Decisions Made

1. **Collapsed signed family to one function (D-17).** The two-function split in MoonTab (`formatSignedInt`/`formatSignedOneDecimal`) reflected ad-hoc per-field choices; consolidating to `formatSignedDecimal` removes a pointless decision tree. The lunar surface temp visual changes accordingly and is documented above.
2. **Formatters return `null`, not the em-dash glyph (D-18).** Keeps `DataCard.jsx`'s rendering contract authoritative; if the em-dash policy ever changes (e.g., to a localized minus sign), there is exactly one site to update.
3. **No Vitest introduced (D-25).** Pure utility correctness is small enough that inline `node -e` smoke checks at execution time provide sufficient coverage at this milestone. The deferred Vitest bootstrap remains an option for v1.1+ when total utility surface grows.

## Files Touched

| File | Change |
|------|--------|
| `src/utils/formatters.js` | **Created** — 49 lines; three named exports |
| `src/tabs/MarsTab.jsx` | Added import; deleted 2 inline formatter declarations + their block comment; replaced with 1-line comment |
| `src/tabs/MoonTab.jsx` | Added import; deleted 4 inline formatter declarations + their block comment; replaced with 1-line comment; migrated 2 call sites to `formatSignedDecimal` |
| `src/hooks/useMarsData.js` | Doc comment: "nine" → "eight" DataCards |
| `src/hooks/useDonkiEvents.js` | Added two-line inline comment above existing `eslint-disable-next-line` |

## Self-Check: PASSED

- File `src/utils/formatters.js` exists.
- Commit `b6b6891` (formatters.js add) present in `git log --oneline`.
- Commit `3bfd89a` (refactor + doc polish) present in `git log --oneline`.
- Production build (`npm run build`) exits 0.
- All plan-level verification grep checks return their expected counts.

---

*Plan 05-01 complete. Next: Plan 05-02 — TooltipWrapper a11y/touch/scroll improvements + AlertCard info-icon role cleanup.*
