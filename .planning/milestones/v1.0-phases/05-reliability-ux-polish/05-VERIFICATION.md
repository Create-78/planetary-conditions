---
phase: 05-reliability-ux-polish
verified: 2026-05-21T00:00:00Z
status: human_needed
score: 5/5 truths verified (programmatic) + 5 success criteria require human UX validation
overrides_applied: 0
re_verification: null
human_verification:
  - test: "Open the dashboard on a real touch device (iOS Safari, Android Chrome) and tap each info icon (ⓘ) on every DataCard, AlertCard, and StatusBadge. Tap the trigger again to dismiss; tap outside to dismiss."
    expected: "Tooltip appears immediately on tap (no 150ms delay), shows tooltip copy, and dismisses on second tap or outside tap. No tooltip ghosting at stale coordinates."
    why_human: "IS_TOUCH module-level detection and triggerProps.onClick wiring are present in source, but actual touch-event delivery, dismiss timing, and visual rendering can only be validated on a physical touch device or accurate emulator. Module-level capability detection in jsdom or headless environments returns false."
  - test: "Open the dashboard in a desktop browser, hover any info icon to open a tooltip, then scroll the page while the tooltip is open. Repeat with the DONKI event list scrolled while a tooltip on an AlertCard info icon is open. Resize the viewport from wide to narrow while a tooltip is open."
    expected: "Tooltip tracks its trigger smoothly during scroll (rAF debounce — no jank), repositions on resize, and re-anchors correctly. The tooltip does NOT detach and float over stale screen coordinates."
    why_human: "scroll/resize listeners with rAF debounce are wired in source (`{ passive: true, capture: true }` + `requestAnimationFrame`). Visual smoothness, capture-phase nested-scroller behavior, and the actual repositioning math under user-driven scrolling cannot be verified without a live browser session."
  - test: "Narrow the browser viewport to ~320px wide and trigger a tooltip on each tab — pick a tooltip near the left edge, the right edge, and the center."
    expected: "Each tooltip is clamped to fit on screen (max-width: min(90vw, 320px)), never overflows the right or left edge, and never produces a negative left offset (Math.max(0,...) guard). Body text wraps inside the clamped width."
    why_human: "maxWidth inline style and Math.max(0,...) guard are present in code. Visual confirmation of clamp behavior at edge cases requires actual rendering at narrow viewport widths."
  - test: "Tab through every interactive element on the Moon tab (TabBar → headers → DONKI scroll region). Once focus is on the DONKI scroll region, use PgDn / arrow keys / spacebar to scroll the list."
    expected: "DONKI scroll region receives focus indicator (focus-visible ring in moon-accent color), screen reader announces 'Recent solar events region', and keyboard scrolling works within the region."
    why_human: "tabIndex={0}, role='region', aria-label='Recent solar events', and focus-visible:ring-moon-accent are all in source. Screen-reader announcement, focus ring rendering, and keyboard scroll behavior are interactive concerns that require a real assistive-tech session."
  - test: "Open the app, wait through a background refetch tick (5min for SWPC, 15min for DONKI, 1h for Mars) OR simulate by mocking the network. While a refetch is in-flight, observe each panel."
    expected: "Existing data stays on screen during the entire refetch — no skeleton flash, no blanking, no 'loading' state. The 'Last updated X ago' chip updates only after successful refetch."
    why_human: "Code-level grep proves `isFetching` is absent from the entire src/ tree (REL-05 silent-refetch lock holds). However, observing the actual UI during a real refetch tick — and confirming no transient blanking occurs in TanStack v5's default stale-while-revalidate behavior — requires waiting for or simulating a refetch."
---

# Phase 5: Reliability & UX Polish Verification Report

**Phase Goal:** A user trusts the dashboard — every panel meaningfully communicates loading, error, no-data, units, and freshness, and a single slow or failing API never breaks the whole experience.

**Verified:** 2026-05-21
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Every panel shows a meaningful state — loading skeleton, error message, no-data context, or real data — never a blank panel and never a full-page failure (SC-1, REL-01) | ✓ VERIFIED | DataCard.jsx implements three-state contract (loading → `<LoadingState />`, error → "Data temporarily unavailable", ok → value or em-dash for null). MoonTab DONKI section has explicit branches for loading (3 skeletons), error ("Data temporarily unavailable"), empty ("No significant events in the past 7 days — conditions are calm."), and the AlertCard list. Per-section cardState in MoonTab isolates failures (one section's error never blanks others). |
| 2 | Every numerical value has units (°C, Pa, km/s, nT, p/cm³, %) — never a bare number (SC-2, REL-02) | ✓ VERIFIED | MarsTab: Min/Max Temp `unit="°C"`, Pressure `unit="Pa"`, Humidity `unit="%"`, Wind Speed `unit="m/s"`. MoonTab: Phase Percentage `unit="%"`, Estimated Surface Temp `unit="°C"`, Solar Wind Speed `unit="km/s"`, Solar Wind Density `unit="p/cm³"`, Bz `unit="nT"`. Formatters return null for invalid input → DataCard renders em-dash sentinel (no unit shown for null values). |
| 3 | Tooltips give Earth-anchored comparisons where it aids understanding (SC-3, REL-03) | ✓ VERIFIED (programmatic, copy needs human review) | tooltips.js has 24 tooltip keys covering mars.*, lunar.*, swpc.*, donki.*. Every DataCard / AlertCard / StatusBadge passes `tooltipKey` referencing this single source-of-truth. TooltipWrapper now supports hover (desktop), focus (keyboard), and tap (touch) — closing REL-03's delivery-layer gap. Copy quality vs "Earth-anchored" — see human verification items. |
| 4 | Every fetching panel shows a freshness signal; computed-locally panels show "Computed locally" subtitle (SC-4, REL-04) | ✓ VERIFIED | MarsTab: tab-level LastUpdated + per-card LastUpdated chips (8 cards). MoonTab: per-section LastUpdated chips for Space Weather and Solar Event Alerts. Lunar Context section has "Computed locally" subtitle (line 83: `<p className="text-moon-50/60 text-xs">Computed locally</p>`) in lieu of a freshness chip — correct per phase decisions D-30/D-42. |
| 5 | Background refetches keep prior data on screen — UI never blanks mid-refresh (SC-5, REL-05) | ✓ VERIFIED | Project-wide `grep -rn "isFetching" src/` returns ZERO matches. All hooks (useMarsData, useSolarWind, useDonkiEvents) and consumers (MarsTab, MoonTab) read `isLoading` (first-mount only) — never the background-refresh flag. TanStack v5's default stale-while-revalidate behavior keeps prior data rendered during 1h / 5min / 15min refetch ticks. |

**Score:** 5/5 truths verified (programmatic)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/utils/formatters.js` | Centralized number formatters (formatInt, formatOneDecimal, formatSignedDecimal) with em-dash fallback contract | ✓ VERIFIED | File exists, 50 lines. Three named exports confirmed via `grep -E "^export function"` (count=3). Each formatter returns null for null/undefined/NaN; DataCard.jsx renders em-dash (U+2014) for null values. |
| `src/tabs/MarsTab.jsx` | Imports formatters from utils/formatters.js; no inline formatter declarations | ✓ VERIFIED | Line 4: `import { formatInt, formatOneDecimal } from '../utils/formatters.js'`. Line 26 comment "Number formatters live in src/utils/formatters.js (per 05-CONTEXT D-16)". Zero inline `^function format*` declarations. |
| `src/tabs/MoonTab.jsx` | Imports formatters from utils/formatters.js; uses formatSignedDecimal for Bz; DONKI scroll region tabIndex+role+aria-label; key={`${ev.type}-${ev.id}`} | ✓ VERIFIED | Line 10: `import { formatInt, formatOneDecimal, formatSignedDecimal } from '../utils/formatters.js'`. Line 161: `value={formatSignedDecimal(swpc.bz)}`. Line 207-210: scroll region has `tabIndex={0}`, `role="region"`, `aria-label="Recent solar events"`, `focus-visible:ring-moon-accent`. Line 214: `key={`${ev.type}-${ev.id}`}`. Zero inline `^function format*` declarations. Zero `formatSignedInt` / `formatSignedOneDecimal` references. |
| `src/components/TooltipWrapper.jsx` | Module-level IS_TOUCH; tap-to-toggle (additive); scroll/resize follow with rAF debounce; max-width clamp; Math.max(0,...) guard | ✓ VERIFIED | Line 20-23: `const IS_TOUCH` at module scope, includes both `'ontouchstart' in window` and `window.matchMedia('(pointer: coarse)').matches`. Line 225-230: `if (IS_TOUCH) triggerProps.onClick = ...` block adds tap toggle additively (hover/focus paths preserved unchanged on lines 204-219). Line 166-183: new useEffect attaches `scroll` ({ passive: true, capture: true }) + `resize` with rAF debounce; cleanup calls cancelAnimationFrame. Line 122: `Math.max(0, window.innerWidth - tipRect.width - VIEWPORT_MARGIN)`. Line 244: `maxWidth: 'min(90vw, 320px)'` in portal inline style. Tailwind `max-w-xs` class still present on portal element (line 240). |
| `src/components/AlertCard.jsx` | Info icon span without role="button" and tabIndex={0} | ✓ VERIFIED | `grep -c 'role="button"' src/components/AlertCard.jsx` = 0. `grep -c 'tabIndex={0}' src/components/AlertCard.jsx` = 0. `aria-label="More info"` preserved (count=1). Inline rationale comment present (line 46-50) explaining the false-ARIA-contract removal. |
| `src/hooks/useMarsData.js` | queryFn destructures { signal } and forwards to fetch; doc says "eight DataCards" | ✓ VERIFIED | Line 28: `async function fetchMarsData({ signal } = {}) {`. Line 34: `const response = await fetch(MAAS2_URL, { signal })`. Line 19: doc comment says "all eight DataCards" (not "nine"). queryKey, refetchInterval (ONE_HOUR_MS), refetchOnWindowFocus:false preserved. |
| `src/hooks/useSolarWind.js` | All three sub-fetches thread { signal } | ✓ VERIFIED | Line 34: `async function fetchTabular(url, { signal } = {})`. Line 66/75/83: fetchPlasma/fetchMag/fetchKp all `({ signal } = {})` and forward to `fetchTabular(URL, { signal })`. Three `refetchInterval: FIVE_MIN_MS` and three `refetchOnWindowFocus: false` preserved on queries. |
| `src/hooks/useDonkiEvents.js` | All three sub-fetches thread { signal } via queryFn arrows; inline comment above eslint-disable | ✓ VERIFIED | Line 52: `async function fetchDonki(url, { signal } = {})`. Lines 125/131/137: queryFn arrows `({ signal }) => fetchDonki(<url>, { signal })`. Line 116-118: two-line inline comment "NASA_API_KEY is a module-level constant baked in at build time by Vite; it is deliberately omitted from deps..." immediately above the eslint-disable directive. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| MarsTab.jsx | utils/formatters.js | named import (`formatInt`, `formatOneDecimal`) | ✓ WIRED | Line 4 import + 6 call sites: `formatInt(data.sol)`, `formatOneDecimal(data.min_temp)`, etc. |
| MoonTab.jsx | utils/formatters.js | named import (`formatInt`, `formatOneDecimal`, `formatSignedDecimal`) | ✓ WIRED | Line 10 import + 5 call sites (phasePercent, surfaceTemp, swpc.speed, swpc.density, swpc.bz, swpc.kp). |
| TooltipWrapper.jsx triggerProps | IS_TOUCH-gated onClick | toggleImmediate via cloneElement | ✓ WIRED | Module-level IS_TOUCH guards the onClick assignment (line 225-230). Existing hover/focus/blur handlers preserved unconditionally. |
| TooltipWrapper.jsx useEffect | window.addEventListener('scroll'/'resize') | rAF-debounced schedule fn; passive+capture for scroll | ✓ WIRED | useEffect (lines 166-183) only attaches while isOpen=true. Cleanup removes both listeners + cancels pending RAF. |
| useMarsData.js queryFn | fetch(MAAS2_URL, { signal }) | TanStack v5 context destructure | ✓ WIRED | `queryFn: fetchMarsData` — v5 invokes with context object; fetchMarsData destructures `{ signal }`. |
| useSolarWind.js queryFns | fetchTabular(URL, { signal }) | { signal } forwarded through helper chain | ✓ WIRED | fetchPlasma/Mag/Kp registered directly as queryFn entries; v5 passes context; each forwards to fetchTabular. |
| useDonkiEvents.js queryFns | fetchDonki(url, { signal }) | { signal } in arrow function destructure | ✓ WIRED | Three explicit `({ signal }) => fetchDonki(cmeUrl/flrUrl/gstUrl, { signal })` arrows. |
| MoonTab.jsx DONKI container | role="region" + aria-label="Recent solar events" | div with tabIndex={0} | ✓ WIRED | Lines 207-210 — all four attributes on the same div containing the AlertCard list. focus-visible:ring-moon-accent uses existing palette token. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| MarsTab DataCards | `data` (from useMarsData) | `fetch(MAAS2_URL, { signal })` → JSON.parse | yes (live MAAS2 API) | ✓ FLOWING |
| MoonTab Lunar Context | `lunar` (from useLunarPhase) | Pure computation (Julian Date math), tick from useNow | yes (deterministic) | ✓ FLOWING |
| MoonTab Solar Wind | `swpc` (from useSolarWind) | Three fetches: PLASMA_URL, MAG_URL, KP_URL — each with { signal } | yes (live NOAA SWPC) | ✓ FLOWING |
| MoonTab DONKI events | `donki.events` (from useDonkiEvents) | Three fetches: cmeUrl, flrUrl, gstUrl — each with { signal } and dayKey memoization | yes (live NASA DONKI) | ✓ FLOWING |
| Tooltip content | `content` prop → `getTooltip(tooltipKey).text` | constants/tooltips.js (24 keys) | yes (static copy, real content) | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Production build succeeds | `npm run build` | "✓ built in 1.33s; 99 modules transformed; dist/assets/index-*.js 211.62 kB" | ✓ PASS |
| formatters.js smoke check | Documented in 05-01-SUMMARY: formatInt(3.6)='4', formatInt(null)=null, formatOneDecimal(2.34)='2.3', formatSignedDecimal(1.2)='+1.2', formatSignedDecimal(-1.2)='-1.2', formatSignedDecimal(0)='+0.0' | All six pass per SUMMARY claim; build links and uses these exports | ✓ PASS |
| REL-05 silent-refetch lock | `grep -rn "isFetching" src/` | 0 matches project-wide | ✓ PASS |
| No new dependencies | `git diff --stat 7af5018..ba38778 -- package.json package-lock.json` | empty diff (no changes) | ✓ PASS |
| Touch-tap rendering on touch device | (would require real device or device emulation) | — | ? SKIP (routed to human verification) |
| Scroll-follow visual behavior | (would require running browser session and observing) | — | ? SKIP (routed to human verification) |
| Narrow-viewport clamp visual | (would require browser at <360px width) | — | ? SKIP (routed to human verification) |
| Keyboard navigation through DONKI region | (would require real keyboard + screen reader) | — | ? SKIP (routed to human verification) |
| Background refetch behavior | (would require waiting through 5min/15min/1h tick or network mocking) | — | ? SKIP (routed to human verification) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| REL-01 | 05-03-PLAN | Every data panel surfaces loading, error, and no-data states meaningfully | ✓ SATISFIED | DataCard three-state contract + MoonTab DONKI four-branch render + per-section cardState isolation. Audit checklist in 05-03-SUMMARY confirms zero drift. |
| REL-02 | 05-01-PLAN | All numerical values display with units — never bare numbers | ✓ SATISFIED | Formatters centralized + every DataCard with a numeric value passes a `unit` prop. Em-dash sentinel for null prevents bare numbers in invalid states. |
| REL-03 | 05-02-PLAN | Tooltips anchor Mars/Moon values to Earth equivalents wherever it aids understanding | ✓ SATISFIED (delivery) / NEEDS HUMAN (copy quality) | tooltips.js has 24 keys; TooltipWrapper now delivers on hover/focus/tap. Copy quality (Earth-anchoring) is a content concern best validated by reading rendered tooltips — see human verification. |
| REL-04 | 05-03-PLAN | Per-source timestamps visibly communicate freshness | ✓ SATISFIED | LastUpdated chips on Mars (tab-level + per-card) and Moon (per-section). Lunar Context shows "Computed locally" subtitle (per D-30/D-42). |
| REL-05 | 05-03-PLAN | Stale-while-revalidate default — UI never blanks during background refresh | ✓ SATISFIED | `grep -rn "isFetching" src/` returns 0 matches. AbortSignal threading prevents wasted in-flight requests on unmount/refetch supersession. Behavioral confirmation via real refetch tick → human verification. |

**No orphaned requirements.** All 5 phase-mapped REL requirements appear in at least one of the three plans' frontmatter `requirements:` field.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | No TODO/FIXME/PLACEHOLDER/HACK in any Phase 5 modified file | ✓ | No code-quality blockers found. |
| (none) | — | No `return null` / empty handlers / stub patterns in modified files | ✓ | All modifications add behavior or fix behavior; nothing was stubbed. |
| (none) | — | No hardcoded empty data flowing to UI | ✓ | All rendered data flows from live hooks or deterministic computation. |

### Human Verification Required

See frontmatter `human_verification:` section above for 5 detailed items. Summary:

1. **Touch tap-to-toggle on real touch device** — Required to confirm IS_TOUCH detection fires and onClick toggle works as designed on iOS Safari / Android Chrome.
2. **Scroll/resize tooltip follow during user-driven scroll** — Required to confirm rAF debounce produces smooth tracking and capture-phase listener picks up nested-scroller events (DONKI list).
3. **Narrow-viewport tooltip clamp visual** — Required to confirm max-width clamp and Math.max(0,...) guard prevent overflow at ~320px viewports.
4. **Keyboard navigation + screen reader on DONKI region** — Required to confirm tabIndex={0} + role="region" + aria-label produce an accessible landmark with working keyboard scroll.
5. **Background refetch silent-refresh observation** — Required to confirm that during real refetch ticks (1h/5min/15min) the UI keeps prior data on screen — the code-level lock is proven, the runtime observation is not.

### Gaps Summary

**No code-level gaps found.** Every must-have, every artifact, every key link, every data flow, and every requirement is verifiable in the source. The Phase 5 audit checklist in 05-03-SUMMARY independently corroborates these findings.

The phase ships verified contracts (IS_TOUCH module-level, AbortSignal threading, formatters centralization, AlertCard role removal, DONKI a11y, AlertCard key namespacing) and a proven silent-refetch lock (REL-05). Build passes; no new dependencies; primitive APIs unchanged; tooltip copy unchanged.

What remains are **behavioral verifications that require a human in front of the browser** — touch interaction, scroll/resize visual smoothness, narrow-viewport rendering, keyboard/screen-reader experience, and observation through a real refetch tick. These are explicitly the kind of REL ("trust the dashboard") concerns that the ROADMAP's success criteria describe in user-facing terms ("a user looking at any panel sees...", "a user watching a panel during a background refetch sees..."), and the verifier cannot stand in for the user.

---

*Verified: 2026-05-21*
*Verifier: Claude (gsd-verifier)*
