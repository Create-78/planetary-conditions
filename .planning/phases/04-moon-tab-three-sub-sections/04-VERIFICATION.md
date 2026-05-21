---
phase: 04-moon-tab-three-sub-sections
verified: 2026-05-21T12:00:00Z
status: human_needed
score: 17/17 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Open the Moon tab in a running dev server and confirm three section headings are visible — Lunar Context, Space Weather — Solar Wind, Solar Event Alerts (last 7 days) — across initial load, post-fetch, and after a forced API error"
    expected: "Tab heading + all three section headings remain visible across loading / ok / error states; no blank tab; per-section failures do not blank the other sections"
    why_human: "Per-section error isolation is a runtime UI behavior — exercising it requires triggering a real network error (e.g., DevTools offline mode) and visually confirming the other sections remain intact"
  - test: "Hover each DataCard label and the Radiation Risk badge to verify tooltips appear with the locked copy + source attribution"
    expected: "All 9 tooltip keys (lunar.phase, lunar.surfaceTemp, lunar.dayNight, swpc.speed, swpc.density, swpc.bz, swpc.kp, swpc.radiationRisk, donki.cme/flr/gst) resolve to plain-language explainers with proper source line"
    why_human: "TooltipWrapper hover-trigger requires real DOM + pointer events; visual readability of tooltip placement cannot be greped"
  - test: "Wait ≥ 5 minutes on the Moon tab and confirm SWPC values either refresh silently or remain visible (no skeleton flash)"
    expected: "5-minute SWPC refetch and 15-minute DONKI refetch occur without blanking cards (silent-refresh lock per D-43)"
    why_human: "Requires elapsed real-time observation; build-time grep cannot verify the runtime refetch tick remains silent"
  - test: "Open the Moon tab during a quiet space-weather week (or with mocked empty DONKI responses) and verify the verbatim empty-state copy renders centered, italic, NOT inside an AlertCard"
    expected: "Literal string 'No significant events in the past 7 days — conditions are calm.' renders as a centered muted div"
    why_human: "Conditional empty-state rendering requires runtime data shape verification — depends on real DONKI response or fixture"
  - test: "Trigger a DONKI fetch error (e.g., block api.nasa.gov in DevTools network panel) and verify Section 3 shows 'Data temporarily unavailable' WITHOUT blanking Sections 1 and 2"
    expected: "DONKI section displays the canonical error string; Lunar Context + Space Weather sections continue rendering normally"
    why_human: "Per-section error isolation requires runtime failure injection and visual inspection of independent section state"
  - test: "Visually confirm the Moon tab uses blue/silver moon palette accents — no amber/rust Mars-palette leak"
    expected: "All accent text uses text-moon-accent/* tokens; no Mars styling visible"
    why_human: "Visual styling / palette discipline requires rendered DOM inspection beyond grep checks"
---

# Phase 4: Moon Tab — Three Sub-Sections Verification Report

**Phase Goal:** A user can open the Moon tab and see three coherent sections — current lunar context (phase + modeled temperature), live NOAA solar wind with a derived radiation risk badge, and recent NASA DONKI solar event alerts.
**Verified:** 2026-05-21
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User opening the Moon tab sees current lunar phase name, phase percentage, day/night indicator, and clearly-labeled estimated surface temperature (ROADMAP SC-1) | VERIFIED | MoonTab.jsx lines 117-144: 4 DataCards bound to `phaseName`, `phasePercent` with `%`, `dayNightStatus`, and `formatSignedInt(surfaceTempC)` with `°C`; label = "Estimated Surface Temp (visible face)" satisfies LUNAR-04 honesty |
| 2 | User sees live NOAA SWPC speed, density, Bz, Kp — each with units — plus derived Low/Moderate/High radiation risk badge with tooltip (ROADMAP SC-2) | VERIFIED | MoonTab.jsx lines 156-211: 4 DataCards (km/s, p/cm³, nT, dimensionless Kp); StatusBadge conditionally rendered when `swpcCardState === 'ok' && radiationSeverity`; `swpc.radiationRisk` tooltipKey bound |
| 3 | User sees scrollable list of last-7-days DONKI events as AlertCards with type badge, UTC time, severity, and tooltips on lunar surface radiation meaning (ROADMAP SC-3) | VERIFIED | MoonTab.jsx lines 238-249: `max-h-96 overflow-y-auto` container; AlertCard maps over `useDonkiEvents().events` with `eventType={ev.type}`, `timeUtc={ev.time}`, `severity`, `tooltipKey`; tooltipKeys (`donki.cme`/`donki.flr`/`donki.gst`) defined in tooltips.js with lunar-radiation copy |
| 4 | User during a quiet space-weather week sees verbatim empty-state copy (ROADMAP SC-4) | VERIFIED | MoonTab.jsx line 235: literal `No significant events in the past 7 days — conditions are calm.` rendered in muted `<div>`, NOT inside AlertCard; verified `grep -B2 -A2` output |
| 5 | User's Moon tab refreshes each section on its own cadence (SWPC 5min, DONKI 15min, lunar static) without blanking the UI (ROADMAP SC-5) | VERIFIED | useSolarWind.js line 31 (`FIVE_MIN_MS = 1000 * 60 * 5`); useDonkiEvents.js line 38 (`FIFTEEN_MIN_MS = 1000 * 60 * 15`); useLunarPhase rides useNow's shared 30s ticker; silent-refresh lock confirmed (zero `isFetching` occurrences across all 5 files) |
| 6 | `useLunarPhase` returns documented contract from `useNow` + lunarPhase utility | VERIFIED | useLunarPhase.js: imports `useNow` from `./useNow.js` and `computePhase` from `../utils/lunarPhase.js`; returns `{ phaseName, phaseFraction, dayNightStatus, surfaceTempC, computedAt }` |
| 7 | `useSolarWind` uses useQueries fan-out, parses SWPC tabular JSON, 5min refetch, no window focus | VERIFIED | useSolarWind.js: imports `useQueries`; 3 sub-queries; `[headers, ...rows]` + `Object.fromEntries`; `refetchInterval: FIVE_MIN_MS`; `refetchOnWindowFocus: false` on all 3 queries |
| 8 | `useDonkiEvents` uses useQueries fan-out, 7-day window memoized, NASA key via env.js, 15min refetch | VERIFIED | useDonkiEvents.js: imports `useQueries`, `useMemo`, `NASA_API_KEY` from `../utils/env.js`; URLs memoized on `dayKey` via `useMemo`; `refetchInterval: FIFTEEN_MIN_MS`; `refetchOnWindowFocus: false` |
| 9 | `radiationRisk.js` thresholds: kp>=5 \|\| speed>=700 → high; kp>=3 \|\| speed>=500 → moderate; else low | VERIFIED | radiationRisk.js lines 22-25 contain exact literal expressions; behavioral spot-check confirms all 6 boundary cases (low/mod-kp/mod-speed/high-kp/high-speed/null) |
| 10 | `lunarPhase.js` uses manual Julian Date math (no `astronomia` npm dep) | VERIFIED | lunarPhase.js: all constants present (`29.530588853`, `2451550.1`, `2440587.5`); no imports; package.json contains no `astronomia` dependency |
| 11 | MoonTab renders 3 sections; 8 DataCards (4 lunar + 4 swpc); 1 StatusBadge; scrollable AlertCard list | VERIFIED | `grep -c '<DataCard'` = 8; `grep -c '<StatusBadge'` = 1; `grep -c '<AlertCard'` = 1 (call site inside `.map()`); 3 `<section>` blocks with aria-labels |
| 12 | Verbatim empty-state copy present and NOT inside AlertCard | VERIFIED | Verified via `grep -B2 -A2`: copy appears in `<div className="text-sm text-moon-50/60 italic py-6 text-center">`, not in any `<AlertCard>` |
| 13 | Per-section state isolation — each section has its own cardState/loading/error | VERIFIED | MoonTab.jsx line 71: `swpcCardState` derived from `swpc.isLoading`/`swpc.isError` only; DONKI branch at lines 223-249 uses `donki.isLoading`/`donki.isError`/`donki.events.length`; lunar section has no cardState (cannot fail) |
| 14 | All skeleton triggers use `isLoading` NOT `isFetching` (silent refetch lock D-43) | VERIFIED | `grep -rn "isFetching" src/` returned 0 matches across all 7 hook/tab/util files |
| 15 | No inline `import.meta.env` in any hook or component (env discipline D-20) | VERIFIED | `grep -rn "import.meta.env" src/hooks/ src/tabs/` returned 0 matches; only env.js (Phase 1) reads `import.meta.env.VITE_NASA_API_KEY` |
| 16 | StatusBadge has no `palette` prop (universal severity colors per Phase 2 + D-16) | VERIFIED | StatusBadge.jsx prop signature: `{ severity, label, value, tooltipKey }` — no palette; MoonTab.jsx line 158-163 omits palette prop on StatusBadge |
| 17 | `npm run build` passes; tab heading + 3 section headings remain visible across loading/error states | VERIFIED | `npm run build` exits 0; produces dist/index.html + dist/assets/index-*.js (211 KB) + CSS; structural HTML in MoonTab.jsx renders header + 3 `<section>` blocks unconditionally before any state branches |

**Score:** 17/17 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/utils/lunarPhase.js` | Pure-math module: computePhase + surfaceTemp, no imports | VERIFIED | All canonical constants (29.530588853, 2451550.1, 2440587.5), all 8 phase names, all 3 day/night strings, Math.cos interpolation; no imports |
| `src/utils/radiationRisk.js` | deriveRadiationRisk pure function with documented heuristic | VERIFIED | Exact threshold literals `kp >= 5 \|\| speed >= 700` and `kp >= 3 \|\| speed >= 500`; null guard; header documents "heuristic" framing |
| `src/utils/env.js` | NASA_API_KEY accessor (Phase 1) | VERIFIED | Single source of `import.meta.env.VITE_NASA_API_KEY \|\| 'DEMO_KEY'` |
| `src/constants/tooltips.js` | 11 new/rewritten keys (lunar.*, swpc.*, donki.*) with source attribution | VERIFIED | All 11 keys present with locked verbatim copy; `moon.example` removed; `swpc.radiationRisk` + `donki.cme` rewritten |
| `src/hooks/useLunarPhase.js` | Pure-computation hook, no fetch, no useQuery | VERIFIED | Imports useNow + computePhase; returns 5-field object; no useQuery, no fetch |
| `src/hooks/useSolarWind.js` | useQueries fan-out, 3 SWPC URLs, 5min cadence, tabular parse | VERIFIED | 3 URLs, FIVE_MIN_MS, refetchOnWindowFocus:false x3, Object.fromEntries, bz_gsm + kp_index field names, Math.max merge, no isFetching token |
| `src/hooks/useDonkiEvents.js` | useQueries fan-out, 3 DONKI URLs, 15min cadence, NASA_API_KEY via env.js | VERIFIED | 3 URLs, FIFTEEN_MIN_MS, refetchOnWindowFocus:false x3, NASA_API_KEY from env.js, useMemo with dayKey, reverse-chronological sort, no isFetching, no import.meta.env |
| `src/tabs/MoonTab.jsx` | Live 3-section dashboard with all primitives wired | VERIFIED | All 4 hook/util imports present; all 5 primitive imports; 8 DataCards; 1 StatusBadge; 1 AlertCard call site; 3 LoadingStates; 6 LastUpdated chips; 14 palette="moon" occurrences; no palette="mars" leak |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| useLunarPhase.js | utils/lunarPhase.js | `import { computePhase } from '../utils/lunarPhase.js'` | WIRED | Direct named import; computePhase invoked at line 24 |
| useLunarPhase.js | hooks/useNow.js | `import { useNow } from './useNow.js'` | WIRED | useNow() called at line 23; subscribes to shared 30s ticker |
| useSolarWind.js | services.swpc.noaa.gov | useQueries with 3 sub-queries | WIRED | All 3 URL constants reference services.swpc.noaa.gov; fetchPlasma/fetchMag/fetchKp invoked from queryFns |
| useDonkiEvents.js | utils/env.js | `import { NASA_API_KEY } from '../utils/env.js'` | WIRED | NASA_API_KEY interpolated into all 3 DONKI URLs at lines 112-114 |
| useDonkiEvents.js | api.nasa.gov/DONKI | useQueries with 3 sub-queries (CME/FLR/GST) | WIRED | All 3 endpoint URLs constructed and used as queryFns |
| MoonTab.jsx | hooks/useLunarPhase.js | `import { useLunarPhase }` + invocation | WIRED | Hook called at line 65; returns destructured for 4 DataCards |
| MoonTab.jsx | hooks/useSolarWind.js | `import { useSolarWind }` + invocation | WIRED | Hook called at line 66; values feed 4 DataCards + Radiation Risk derivation |
| MoonTab.jsx | hooks/useDonkiEvents.js | `import { useDonkiEvents }` + invocation | WIRED | Hook called at line 67; events array drives AlertCard list |
| MoonTab.jsx | utils/radiationRisk.js | `import { deriveRadiationRisk }` + invocation | WIRED | Called at line 91 with `{ speed: swpc.speed, kp: swpc.kp }`; result gates StatusBadge render |
| MoonTab.jsx | tooltips.js (11 keys) | `tooltipKey="..."` props on DataCards/StatusBadge + dynamic on AlertCard | WIRED | All 9 static keys + 3 dynamic keys all resolve in tooltips.js |
| App.jsx | tabs/MoonTab.jsx | `import MoonTab from './tabs/MoonTab.jsx'` + conditional render | WIRED | App.jsx line 5 + line 31: `{activeTab === TABS.MOON.id && <MoonTab />}` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|---------------------|--------|
| MoonTab Lunar Context cards | `phaseName`, `phaseFraction`, `dayNightStatus`, `surfaceTempC` | useLunarPhase → computePhase(useNow()) | Yes — behavioral check confirms `computePhase(new Date('2000-01-21T11:14:00Z'))` returns Full Moon, +127°C | FLOWING |
| MoonTab SWPC cards | `swpc.speed`, `swpc.density`, `swpc.bz`, `swpc.kp` | useSolarWind → 3 SWPC fetches with `Object.fromEntries` parsing | Yes — real NOAA endpoints, tabular parse, NaN→null coercion via toNumberOrNull | FLOWING |
| Radiation Risk badge | `radiationSeverity` | deriveRadiationRisk({speed, kp}) | Yes — pure function tested with 6 boundary cases (all expected outputs) | FLOWING |
| MoonTab DONKI AlertCards | `donki.events` (id, type, time, severity, tooltipKey) | useDonkiEvents → 3 DONKI fetches mapped through mapCme/mapFlr/mapGst → sorted reverse-chronologically | Yes — real NASA DONKI endpoints; mappers extract real fields (activityID, startTime, classType, allKpIndex) | FLOWING |
| Per-section LastUpdated chips | `swpcTimestamp`, `donkiTimestamp` | Hook `.dataUpdatedAt` → `new Date(...)` with null guard | Yes — TanStack Query sets dataUpdatedAt on each fetch success; guarded to null pre-fetch | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| deriveRadiationRisk returns expected severity for all 6 input cases | `node --input-type=module -e 'import("./src/utils/radiationRisk.js").then(...)'` | low, moderate, moderate, high, high, null — all match expected | PASS |
| computePhase(Full Moon reference date) returns correct phase name + temp | `node --input-type=module ...` | `phaseName: 'Full Moon'`, `surfaceTempC: 126.96` | PASS |
| surfaceTemp boundary values match cosine formula | `node --input-type=module ...` | surface(0.5)=127, surface(0)=-173, surface(0.25)=-23 | PASS |
| npm run build exits 0 | `npm run build` | "✓ built in 1.74s"; dist/index.html + 211KB JS bundle produced | PASS |
| DataCard count in MoonTab.jsx = 8 | `grep -c '<DataCard' src/tabs/MoonTab.jsx` | 8 | PASS |
| palette="moon" count >= 14 | `grep -c 'palette="moon"' src/tabs/MoonTab.jsx` | 14 | PASS |
| No isFetching token anywhere in Phase 4 source | `grep -rn "isFetching" src/` | 0 matches | PASS |
| No import.meta.env in hooks/tabs | `grep -rn "import.meta.env" src/hooks/ src/tabs/` | 0 matches | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| LUNAR-01 | 04-02 | `useLunarPhase` pure-computation hook returns phase name, percentage, day/night | SATISFIED | src/hooks/useLunarPhase.js exports useLunarPhase returning all required fields |
| LUNAR-02 | 04-03 | Display current lunar phase name with tooltip on 29.5-day cycle | SATISFIED | MoonTab.jsx Phase Name DataCard + tooltipKey="lunar.phase" → tooltip text "The Moon takes ~29.5 days..." |
| LUNAR-03 | 04-03 | Display approximate surface temperature interpolated by phase position | SATISFIED | DataCard "Estimated Surface Temp (visible face)" bound to `formatSignedInt(lunar.surfaceTempC)` from cosine interpolation |
| LUNAR-04 | 04-03 | Temperature clearly labeled as estimate with tooltip on lunar temperature swing | SATISFIED | Label includes "Estimated"; tooltipKey="lunar.surfaceTemp" → "Lunar surface temperatures swing more than 300°C..." |
| LUNAR-05 | 04-01 | `utils/lunarPhase.js` encapsulates the math (surface temp co-located per D-03) | SATISFIED | src/utils/lunarPhase.js contains computePhase + surfaceTemp; co-located per D-03 |
| SWPC-01 | 04-02 | `useSolarWind` hook fetches plasma/mag/Kp with 5min refetch | SATISFIED | src/hooks/useSolarWind.js fans out 3 useQueries with FIVE_MIN_MS interval |
| SWPC-02 | 04-03 | Display Solar Wind Speed in km/s with tooltip on 400-800 km/s range | SATISFIED | DataCard "Solar Wind Speed" with unit="km/s" + tooltipKey="swpc.speed" (tooltip text mentions 400-800 km/s) |
| SWPC-03 | 04-03 | Display Density in p/cm³ with tooltip on surface interaction | SATISFIED | DataCard "Solar Wind Density" with unit="p/cm³" + tooltipKey="swpc.density" |
| SWPC-04 | 04-03 | Display Bz in nT with tooltip on geomagnetic storm trigger | SATISFIED | DataCard "Bz" with unit="nT" + tooltipKey="swpc.bz" |
| SWPC-05 | 04-03 | Display Kp Index on 0-9 scale with tooltip on Kp ≥ 5 = storm | SATISFIED | DataCard "Kp Index" + tooltipKey="swpc.kp" (tooltip mentions "Kp ≥ 5 = geomagnetic storm conditions") |
| SWPC-06 | 04-03 | Display derived Radiation Risk badge (Low/Moderate/High) | SATISFIED | StatusBadge conditionally rendered with severity from deriveRadiationRisk; tooltipKey="swpc.radiationRisk" |
| SWPC-07 | 04-01 | `utils/radiationRisk.js` encapsulates derivation with test-friendly pure function | SATISFIED | src/utils/radiationRisk.js exports deriveRadiationRisk pure function |
| DONKI-01 | 04-02 | `useDonkiEvents` hook fetches CME/FLR/GST last 7 days with 15min refetch | SATISFIED | src/hooks/useDonkiEvents.js fans out 3 useQueries with FIFTEEN_MIN_MS; 7-day window via sevenDaysAgoISO |
| DONKI-02 | 04-03 | Display events as scrollable AlertCards with type badge, UTC time, severity | SATISFIED | `max-h-96 overflow-y-auto` scroll container; AlertCard map with eventType/timeUtc/severity props |
| DONKI-03 | 04-03 | Tooltips on each card explain event type for lunar surface radiation | SATISFIED | AlertCard binds tooltipKey={ev.tooltipKey}; donki.cme/flr/gst tooltips all reference lunar surface radiation effects |
| DONKI-04 | 04-03 | Empty state shows verbatim "No significant events..." copy | SATISFIED | MoonTab.jsx line 235: literal string present, rendered as muted div, not AlertCard |
| DONKI-05 | 04-03 | Failure state shows "Data temporarily unavailable" per card without crashing panel | SATISFIED | DONKI error branch renders the canonical string; per-section isolation prevents whole-tab crash |

**Requirements coverage:** 17/17 SATISFIED. No orphaned requirements; no requirements missing.

Note: REQUIREMENTS.md traceability table still shows LUNAR-01, LUNAR-05, SWPC-01, SWPC-07, DONKI-01 as "Pending" (these were the Plan 04-01 and 04-02 requirements that were not updated when Plan 04-03 closed out). This is documentation lag — the code itself satisfies all 17 requirements. Recommend a separate REQUIREMENTS.md update task to mark them Complete (informational only; does not affect verification status).

### Anti-Patterns Found

No blocker anti-patterns detected. Scan results:

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | TODO/FIXME/PLACEHOLDER | — | Zero matches across 7 Phase-4 files |
| (none) | — | `isFetching` token | — | Zero matches (silent-refresh lock honored) |
| (none) | — | Inline `import.meta.env` in hooks/tabs | — | Zero matches (env discipline honored) |
| (none) | — | `palette="mars"` leak in MoonTab | — | Zero matches |
| (none) | — | `moon.example` reference | — | Zero matches (Phase 2 demo key cleanly removed) |
| (none) | — | `TS_JUST_NOW` / `TS_3_MIN_AGO` / `TS_2_HR_AGO` / `TS_CME_DEMO` (Phase 2 demo constants) | — | Zero matches |

### Human Verification Required

6 items need human testing — see frontmatter `human_verification` section for full list. Summary:

1. **Three section headings visible across loading/ok/error states** — exercising per-section error isolation requires runtime DevTools network manipulation
2. **Tooltip hover behavior on all 9 keys** — requires real DOM pointer events; placement readability not greppable
3. **Silent refresh after 5min SWPC + 15min DONKI tick** — requires elapsed real-time observation
4. **DONKI empty-state copy rendering** — requires real or mocked empty response
5. **DONKI error isolation** — requires blocking api.nasa.gov to confirm Sections 1+2 keep rendering
6. **Visual palette discipline (moon blue/silver, no Mars amber leak)** — requires rendered DOM inspection

### Gaps Summary

No blocking gaps. All 17 must-haves verified against codebase. All 17 Phase-4 requirements satisfied via code. Build clean (`npm run build` exits 0). Behavioral spot-checks pass for both utility functions. All key links wired.

The only outstanding work is human UI/UX verification of runtime behaviors that cannot be programmatically verified — tooltip hover affordances, per-section error isolation under real failure injection, silent-refresh observation across the 5min/15min refetch boundary, and visual palette consistency. These are routine UAT items typical of any tab-completion phase, not gaps in implementation.

Documentation lag: REQUIREMENTS.md traceability table needs LUNAR-01, LUNAR-05, SWPC-01, SWPC-07, DONKI-01 flipped from "Pending" to "Complete" — these were missed when Plan 04-03 closed out the phase. Code is correct; only the tracking table needs updating.

---

*Verified: 2026-05-21*
*Verifier: Claude (gsd-verifier)*
