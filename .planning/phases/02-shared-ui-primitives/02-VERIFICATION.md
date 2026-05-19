---
phase: 02-shared-ui-primitives
verified: 2026-05-19T00:00:00Z
status: human_needed
score: 12/12 must-haves verified (automated); 4 visual/UAT items require human confirmation
overrides_applied: 0
re_verification: null
human_verification:
  - test: "Open the dev server and hover any DataCard value in the Mars tab"
    expected: "After ~150ms, a portal tooltip appears containing the Earth-anchored explainer text from constants/tooltips.js (e.g. 'Mars\\' atmosphere is about 0.6% as dense as Earth\\'s — too thin to breathe, thick enough to drive dust storms.'). Tooltip auto-positions above the trigger and flips below if clipped."
    why_human: "Hover/focus interaction, portal rendering, 150ms delay timing, and viewport-aware positioning require a running browser and visual perception; static greps confirm the wiring exists but not the rendered behavior."
  - test: "Open the Mars demo gallery and observe the DataCard row with mixed states"
    expected: "Wind Speed (state=loading) renders a Tailwind animate-pulse skeleton block while neighbouring Min Temp / Max Temp / Pressure render their real values, and Humidity (state=error) renders the muted italic string 'Data temporarily unavailable' — all three states coexist in the same flex row, proving per-card independence (no neighbour blanking)."
    why_human: "Per-card render-pass independence and animate-pulse animation are visual behaviors; static greps verify the branches exist but not that they render correctly side-by-side."
  - test: "Hover a LastUpdated chip on either tab"
    expected: "Tooltip surfaces an absolute UTC time formatted 'HH:MM:SS UTC' (e.g. '14:32:17 UTC'). The em-dash variant (timestamp=undefined) does NOT show a tooltip on hover — it just displays 'Last updated: —' with no hover affordance."
    why_human: "Tooltip hover behavior and 'no-tooltip on em-dash' rule require browser interaction to verify."
  - test: "Switch between Mars and Moon tabs and visually compare the StatusBadge severities"
    expected: "Low/Moderate/High badges read identically on both tabs — green/amber/red — proving universal severity colors are NOT palette-tinted. DataCard accent rings and LastUpdated dim text DO differ between tabs (mars-accent amber vs moon-accent silver), proving palette is decorative-only as designed. AlertCard event-type badges (indigo CME, orange FLR, fuchsia GST) also read identically on both tabs."
    why_human: "Cross-tab palette correctness and the semantic-vs-decorative color split are visual judgments; static greps confirm class strings but not rendered chroma."
---

# Phase 2: Shared UI Primitives — Verification Report

**Phase Goal:** A developer (and by extension every later data card) can render a labeled value with a unit, a hover tooltip, a freshness timestamp, a status badge, an event alert card, and per-card loading/error states — all from a shared component library.

**Verified:** 2026-05-19
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (merged from ROADMAP success criteria + 3 PLAN must_haves)

| #  | Truth                                                                                                                                                                  | Status                                    | Evidence |
| -- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------- |
| 1  | User hovering any data value sees a plain-language tooltip with an Earth comparison where relevant (ROADMAP SC-1)                                                       | ? UNCERTAIN (wiring VERIFIED)             | `DataCard.jsx` composes `TooltipWrapper` + `getTooltip(tooltipKey)`; both Mars and Moon demo galleries pass `tooltipKey="mars.example" / "moon.example" / "swpc.radiationRisk" / "donki.cme"` to DataCards/StatusBadges/AlertCard; `TOOLTIPS['mars.example'].text` resolves to the Earth-anchored copy at runtime (Node import check). Visual hover surfacing is human-only. |
| 2  | User sees a "Last updated X mins ago" timestamp on every panel where a `LastUpdated` instance is mounted (ROADMAP SC-2)                                                  | ✓ VERIFIED                                | `LastUpdated.jsx` imports `useNow` from `../hooks/useNow.js`, computes `formatRelative(ts, now)` covering thresholds `just now / 1 min ago / N mins ago / 1 hour ago / N hours ago / 1 day ago / N days ago`. Both demo galleries mount 4 LastUpdated instances (just-now / 3-min / 2-hr / undefined). |
| 3  | User sees independent per-card skeleton loaders — a slow component never blanks neighbouring cards (ROADMAP SC-3)                                                       | ? UNCERTAIN (wiring VERIFIED)             | `DataCard.jsx` branches `state === 'loading'` to `<LoadingState />` inline; `LoadingState.jsx` is an `animate-pulse` div. Both demo galleries put a loading card in the same flex row as ok/error cards. Side-by-side rendering independence is human-only. |
| 4  | User sees colored status badges (Low/Moderate/High) and alert cards (event-type badge, UTC time, severity) rendered consistently with the body's palette (ROADMAP SC-4) | ? UNCERTAIN (wiring VERIFIED)             | `StatusBadge.jsx` ships universal severity colors `bg-emerald-700/40` (low) / `bg-amber-700/40` (moderate) / `bg-red-700/40` (high) — explicitly NOT palette-tinted (semantic vs decorative split). `AlertCard.jsx` ships event-type colors `bg-indigo-700/40` (CME) / `bg-orange-700/40` (FLR) / `bg-fuchsia-700/40` (GST) plus formatted UTC time via inline `formatUtc`. Both galleries render all three severities + all three event types. Visual chroma verification is human-only. |
| 5  | All tooltip copy lives in `constants/tooltips.js` and updating it there updates the UI everywhere (ROADMAP SC-5)                                                         | ✓ VERIFIED                                | `src/constants/tooltips.js` is the only source of tooltip copy in `src/` (`grep -r "TOOLTIPS\\b\\|getTooltip" src/` returns only the file itself + its 3 consumers DataCard/StatusBadge/AlertCard). All UI tooltip lookups go through `getTooltip(key)` rather than inline strings. |
| 6  | TooltipWrapper renders trigger element and exposes its tooltip text via ARIA on hover/focus (PLAN 01 truth)                                                              | ✓ VERIFIED                                | `TooltipWrapper.jsx` clones the trigger child to attach mouse + focus handlers, sets `aria-describedby={tooltipId}` when open, and renders the portal element with `role="tooltip"` + `id={tooltipId}`. 150ms open delay literal present. |
| 7  | LoadingState renders an animate-pulse skeleton block (no shimmer) sized to a DataCard footprint (PLAN 01 truth)                                                          | ✓ VERIFIED                                | `LoadingState.jsx` renders `<div aria-hidden="true" className="animate-pulse rounded-md bg-slate-700/40 h-8 w-24 ..." />`; `grep -c "shimmer"` returns 0. |
| 8  | useNow() returns the current Date and re-renders consumers every 30 seconds via a single shared interval (PLAN 01 truth)                                                 | ✓ VERIFIED                                | `useNow.js` declares module-level `let now`, `const listeners = new Set()`, `let intervalId = null`; `startInterval()` is ref-counted (only one `setInterval(...)` call, period `TICK_MS = 30000`); teardown clears interval when last subscriber unmounts. `grep -c "setInterval" src/hooks/useNow.js` returns 1. |
| 9  | tooltips.js exports a flat keyed object including 'mars.example' that downstream tooltips can look up (PLAN 01 truth)                                                    | ✓ VERIFIED                                | Node ESM import resolves `TOOLTIPS['mars.example']`, `TOOLTIPS['moon.example']`, `TOOLTIPS['swpc.radiationRisk']`, `TOOLTIPS['donki.cme']`; `getTooltip` is a function returning `{ text, source? } \| null`. |
| 10 | DataCard composes TooltipWrapper + LoadingState + getTooltip with correct state branching (PLAN 02 truth)                                                                | ✓ VERIFIED                                | `DataCard.jsx` imports all three (TooltipWrapper from `./TooltipWrapper.jsx`, LoadingState from `./LoadingState.jsx`, getTooltip from `../constants/tooltips.js`), branches on `state === 'loading' \| 'error' \| 'ok'`, renders the exact string `"Data temporarily unavailable"` for error, wraps value+unit span in TooltipWrapper when `tooltipKey` resolves. Both palette glow strings (`rgba(245,158,11,0.25)` and `rgba(203,213,225,0.20)`) present verbatim. |
| 11 | StatusBadge/AlertCard/LastUpdated ship the locked Tailwind class strings + use Wave-1 primitives (PLAN 02 truth)                                                          | ✓ VERIFIED                                | StatusBadge: 3 emerald/amber/red ring strings (grep count = 3). AlertCard: 3 indigo/orange/fuchsia ring strings (grep count = 3), inline `formatUtc` produces "DD Mon HH:MM UTC". LastUpdated: imports `useNow`, has `formatRelative` + `formatAbsoluteUtc`, wraps in TooltipWrapper unless timestamp invalid. |
| 12 | Both demo galleries render every primitive in every state with mirrored Mars/Moon structure (PLAN 03 truth)                                                              | ✓ VERIFIED                                | Both `MarsTab.jsx` and `MoonTab.jsx` import all 4 composites, preserve `<section role="tabpanel">`, render 5 DataCards (3 ok + 1 loading + 1 error) × 3 StatusBadges (low/moderate/high) × 3 AlertCards (CME/FLR/GST) × 4 LastUpdated chips (just-now/3-min/2-hr/undefined). Only differences are palette + a few tooltip-key swaps + header copy. `npm run build` exits 0 (91 modules, 186.90 kB / 58.88 kB gzipped). |

**Score:** 8/12 fully VERIFIED programmatically; 4/12 structurally VERIFIED but require human visual confirmation (truths 1, 3, 4 from ROADMAP success criteria + cross-tab palette comparison).

### Required Artifacts

| Artifact                              | Expected                                                                              | Status      | Details |
| ------------------------------------- | ------------------------------------------------------------------------------------- | ----------- | ------- |
| `src/components/TooltipWrapper.jsx`   | Custom portal-mounted hover/focus tooltip with role=tooltip + aria-describedby        | ✓ VERIFIED  | 192 lines; default export; imports `createPortal` from `react-dom`; renders portal `<div role="tooltip" id={tooltipId} className="fixed z-50 ...">`; 150ms open delay literal; ESC/click-outside/blur dismiss; useLayoutEffect-driven viewport-aware top/bottom flip + horizontal clamp. |
| `src/components/LoadingState.jsx`     | Tailwind animate-pulse skeleton (no shimmer)                                          | ✓ VERIFIED  | 24 lines; default export; `<div aria-hidden="true" className="animate-pulse rounded-md bg-slate-700/40 h-8 w-24 ${className}" />`; no "shimmer" keyword anywhere. |
| `src/hooks/useNow.js`                 | Shared 30s ticker — single module-level setInterval, ref-counted teardown             | ✓ VERIFIED  | 65 lines; named export `useNow`; module-level `now` / `listeners` / `intervalId`; `setInterval` called exactly once (grep count = 1); period `TICK_MS = 30000` ms; teardown clears interval when last subscriber unmounts. |
| `src/constants/tooltips.js`           | Flat namespaced TOOLTIPS object + getTooltip safe accessor                            | ✓ VERIFIED  | 55 lines; exports `TOOLTIPS` with seeded keys `mars.example` / `moon.example` / `swpc.radiationRisk` / `donki.cme`; exports `getTooltip(key)` returning `{text, source?}` or null. Node import resolves all 4 keys correctly. |
| `src/components/DataCard.jsx`         | Label/value/unit card with state branching + tooltip composition + palette glow       | ✓ VERIFIED  | 99 lines; default export; imports TooltipWrapper + LoadingState + getTooltip; branches on `state === 'ok'/'loading'/'error'`; exact "Data temporarily unavailable" string; em-dash fallback for null value; both palette glow shadow strings (mars rgba(245,158,11,0.25) / moon rgba(203,213,225,0.20)) present verbatim. |
| `src/components/StatusBadge.jsx`      | Pill-shaped universal severity badge (green/amber/red)                                | ✓ VERIFIED  | 56 lines; default export; three SEVERITY_CLASSES strings exact-match plan (`bg-emerald-700/40 text-emerald-200 ring-emerald-500/30` etc.); fallback slate for unknown severity; wraps in TooltipWrapper when `tooltipKey` resolves. |
| `src/components/AlertCard.jsx`        | Compact horizontal event row with type-specific badge color + UTC time + severity     | ✓ VERIFIED  | 79 lines; default export; three EVENT_CLASSES strings exact-match plan (`bg-indigo-700/40` CME / `bg-orange-700/40` FLR / `bg-fuchsia-700/40` GST); slate fallback for unknown event type; inline `formatUtc(iso)` produces "DD Mon HH:MM UTC"; info-icon trigger is `tabIndex={0}` + `role="button"` for keyboard parity. |
| `src/components/LastUpdated.jsx`      | Freshness indicator (relative + absolute UTC tooltip), consumes useNow                | ✓ VERIFIED  | 74 lines; default export; imports `useNow` and TooltipWrapper; inline `formatRelative` covers just-now/min/hour/day thresholds; inline `formatAbsoluteUtc` returns "HH:MM:SS UTC"; renders unwrapped when timestamp invalid (no empty-tooltip on em-dash); palette-tinted dim color via `text-mars-accent/70 / text-moon-accent/70 / text-slate-400`. |
| `src/tabs/MarsTab.jsx`                | Mars-palette demo gallery showing every primitive in every state                      | ✓ VERIFIED  | 158 lines; default export; preserves `<section role="tabpanel">`; imports all 4 composites; module-scope demo timestamps; renders 5 DataCards / 3 StatusBadges / 3 AlertCards / 4 LastUpdated chips; all palette-eligible use `palette="mars"`. No "Phase 3" or "Phase 4" string. |
| `src/tabs/MoonTab.jsx`                | Moon-palette demo gallery (mirrored structure)                                        | ✓ VERIFIED  | 155 lines; default export; preserves `<section role="tabpanel">`; identical section structure to MarsTab; tooltip keys swapped to `moon.example` for body-relevant DataCards; all palette-eligible use `palette="moon"`. No "Phase 3" or "Phase 4" string. |

### Key Link Verification

| From                                   | To                                          | Via                                                                 | Status     | Details |
| -------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------- | ---------- | ------- |
| `src/components/TooltipWrapper.jsx`    | `document.body`                             | `createPortal(<div role="tooltip" ...>, document.body)`             | ✓ WIRED    | Line ~169: `createPortal(<div ref={tooltipRef} id={tooltipId} role="tooltip" ... />, document.body)`. |
| `src/components/TooltipWrapper.jsx`    | trigger element                             | `cloneElement` + `aria-describedby={tooltipId}` + `role="tooltip"`  | ✓ WIRED    | Trigger cloned with `aria-describedby: isOpen ? tooltipId : undefined`; tooltip element has matching `id={tooltipId}` + `role="tooltip"`. |
| `src/components/DataCard.jsx`          | `src/components/TooltipWrapper.jsx`         | `import TooltipWrapper from './TooltipWrapper.jsx'` + JSX wrap      | ✓ WIRED    | Imported at line 1; conditionally wraps value+unit span when `tooltipKey` resolves. |
| `src/components/DataCard.jsx`          | `src/components/LoadingState.jsx`           | `import LoadingState from './LoadingState.jsx'` + render on loading | ✓ WIRED    | Imported at line 2; `state === 'loading'` renders `<LoadingState />`. |
| `src/components/DataCard.jsx`          | `src/constants/tooltips.js`                 | `import { getTooltip } from '../constants/tooltips.js'`              | ✓ WIRED    | Imported at line 3; `tooltipKey ? getTooltip(tooltipKey) : null` controls tooltip wrap. |
| `src/components/StatusBadge.jsx`       | `src/components/TooltipWrapper.jsx` + tooltips.js | imports + conditional wrap                                          | ✓ WIRED    | Both imports present; `getTooltip(tooltipKey)` lookup wraps badge in TooltipWrapper when non-null. |
| `src/components/AlertCard.jsx`         | `src/components/TooltipWrapper.jsx` + tooltips.js | imports + info-icon wrap                                            | ✓ WIRED    | Both imports present; info-icon trigger wrapped in TooltipWrapper when `tooltipKey` resolves. |
| `src/components/LastUpdated.jsx`       | `src/hooks/useNow.js`                       | `import { useNow } from '../hooks/useNow.js'` + `const now = useNow()` | ✓ WIRED    | Imported at line 1; called inside the component body so re-renders flow on every 30s tick. |
| `src/components/LastUpdated.jsx`       | `src/components/TooltipWrapper.jsx`         | imports + conditional wrap of relative-time label                   | ✓ WIRED    | Imported at line 2; `<TooltipWrapper content={absolute}>{label}</TooltipWrapper>` when absolute is non-null; raw label when invalid. |
| `src/tabs/MarsTab.jsx`                 | All 4 composite primitives                  | imports + JSX composition (DataCard ×5 / StatusBadge ×3 / AlertCard ×3 / LastUpdated ×4) | ✓ WIRED | All four imports present; every primitive appears in JSX with locked props (state/severity/eventType/timestamp). |
| `src/tabs/MoonTab.jsx`                 | All 4 composite primitives                  | imports + JSX composition (mirrored counts)                          | ✓ WIRED    | Same structure as MarsTab with palette="moon" + tooltip keys swapped. |
| `src/App.jsx`                          | `src/tabs/MarsTab.jsx` + `MoonTab.jsx`     | conditional render based on `activeTab` state (carried from Phase 1) | ✓ WIRED    | App.jsx unchanged from Phase 1: `{activeTab === TABS.MARS.id && <MarsTab />}` / `MOON.id && <MoonTab />`. |

### Data-Flow Trace (Level 4)

Phase 2 is intentionally **prop-driven, no live data wiring** — that's Phase 3 (Mars) and Phase 4 (Moon) territory. The only runtime "data flow" in Phase 2 is the `useNow` ticker and the module-scope demo timestamps.

| Artifact              | Data Variable          | Source                                                       | Produces Real Data | Status        |
| --------------------- | ---------------------- | ------------------------------------------------------------ | ------------------ | ------------- |
| `LastUpdated.jsx`     | `now`                  | `useNow()` — shared module-level setInterval(30s)            | Yes — Date         | ✓ FLOWING     |
| `LastUpdated.jsx`     | `relative` / `absolute`| `formatRelative(timestamp, now)` / `formatAbsoluteUtc(ts)`  | Yes — strings      | ✓ FLOWING     |
| `MarsTab.jsx`         | `TS_*` (timestamps)    | Module-scope `new Date()` arithmetic                         | Yes — Dates        | ✓ FLOWING     |
| `MoonTab.jsx`         | `TS_*` (timestamps)    | Module-scope `new Date()` arithmetic                         | Yes — Dates        | ✓ FLOWING     |
| `DataCard.jsx`        | None (passive)         | Pure prop-driven                                             | Intentional — Phase 3/4 wires real data | N/A (Phase 2 scope) |
| `StatusBadge.jsx`     | None (passive)         | Pure prop-driven                                             | Intentional — Phase 3/4 wires real data | N/A (Phase 2 scope) |
| `AlertCard.jsx`       | None (passive)         | Pure prop-driven                                             | Intentional — Phase 4 wires DONKI data  | N/A (Phase 2 scope) |

No HOLLOW or DISCONNECTED findings — Phase 2's contract is "ship the primitive library, not the data wiring."

### Behavioral Spot-Checks

| Behavior                                              | Command                                                               | Result                                | Status   |
| ----------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------- | -------- |
| Production build succeeds                              | `npm run build`                                                       | Exit 0, 91 modules, 1.69s, 186.90 kB / 58.88 kB gzipped | ✓ PASS   |
| Tooltips module exports resolve at runtime             | `node --input-type=module -e "import('./src/constants/tooltips.js')…"` | `keys: true helper: true sample: "Mars' atmosphere is about 0.6% as dense as Earth's"` | ✓ PASS   |
| Single setInterval in useNow                           | `grep -c "setInterval" src/hooks/useNow.js`                            | 1                                     | ✓ PASS   |
| 30s tick period                                        | `grep "30000" src/hooks/useNow.js`                                     | `const TICK_MS = 30000`               | ✓ PASS   |
| StatusBadge has 3 severity ring colors                 | `grep -E "ring-emerald\|ring-amber\|ring-red" src/components/StatusBadge.jsx \| wc -l` | 3                              | ✓ PASS   |
| AlertCard has 3 event-type ring colors                 | `grep -E "ring-indigo\|ring-orange\|ring-fuchsia" src/components/AlertCard.jsx \| wc -l` | 3                            | ✓ PASS   |
| All composite components import TooltipWrapper         | `grep -l "from './TooltipWrapper" src/components/*.jsx`               | DataCard, StatusBadge, AlertCard, LastUpdated (all 4) | ✓ PASS   |
| DataCard / StatusBadge / AlertCard look up getTooltip  | `grep -l "getTooltip" src/components/*.jsx`                            | DataCard, StatusBadge, AlertCard      | ✓ PASS   |
| LastUpdated consumes useNow                            | `grep -c "useNow" src/components/LastUpdated.jsx`                      | 3 (import + JSDoc + call)             | ✓ PASS   |
| No external tooltip library                            | `grep -E "from ['\\\"]@radix" src/components/*.jsx`                    | No matches                            | ✓ PASS   |
| No shimmer in LoadingState                             | `grep -c "shimmer" src/components/LoadingState.jsx`                    | 0                                     | ✓ PASS   |
| No "Phase 3" / "Phase 4" in tab files                  | `grep -E "Phase 3\|Phase 4" src/tabs/MarsTab.jsx src/tabs/MoonTab.jsx` | No matches                            | ✓ PASS   |
| Both tab files preserve tabpanel ARIA wrapper          | `grep -E 'role="tabpanel"' src/tabs/MarsTab.jsx src/tabs/MoonTab.jsx`  | Both files match                      | ✓ PASS   |
| App.jsx still imports both tabs                        | `grep -E "MarsTab\|MoonTab" src/App.jsx`                               | Both imports + conditional render     | ✓ PASS   |

### Requirements Coverage

| Requirement | Source Plan            | Description                                                                                       | Status      | Evidence |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------------- | ----------- | -------- |
| UI-01       | 02-02 + 02-03          | DataCard renders label/value/unit + tooltip trigger; supports loading skeleton + error state      | ✓ SATISFIED | DataCard.jsx ships all 3 states + tooltip composition; both tabs demo all 3 states. |
| UI-02       | 02-01 + 02-03          | TooltipWrapper shows plain-language explainer on hover with Earth comparison                      | ✓ SATISFIED | TooltipWrapper.jsx (portal + ARIA + 150ms delay); tooltips.js seeded with Earth-anchored copy in `mars.example` / `moon.example`. |
| UI-03       | 02-02 + 02-03          | StatusBadge renders colored badge (Low/Moderate/High) with body-appropriate palette                | ✓ SATISFIED (with note) | StatusBadge.jsx ships universal severity colors per 02-CONTEXT semantic-vs-decorative split (NOT body-palette-tinted). The CONTEXT explicitly overrides the literal "body-appropriate palette" wording in REQUIREMENTS.md with a documented decision: severity must read consistently across tabs. Body palette is still applied to the surrounding DataCard accent ring + LastUpdated dim text. Spirit of the requirement met; literal wording adjusted by design lock. |
| UI-04       | 02-02 + 02-03          | AlertCard renders DONKI event with type badge, UTC time, severity/class, tooltip                  | ✓ SATISFIED | AlertCard.jsx ships event-type color map (CME/FLR/GST + slate fallback) + inline `formatUtc` ("DD Mon HH:MM UTC") + severity text + optional info-icon tooltip. Demo gallery renders all three event types. |
| UI-05       | 02-02 + 02-03          | LastUpdated shows "Last updated X mins ago" (or UTC timestamp) per data panel                     | ✓ SATISFIED | LastUpdated.jsx renders `"<prefix>: <relative>"` in DOM + absolute "HH:MM:SS UTC" in TooltipWrapper hover. Demo galleries mount 4 instances (just-now / 3-mins / 2-hours / undefined em-dash). |
| UI-06       | 02-01 + 02-03          | LoadingState skeleton loaders render independently per card                                       | ✓ SATISFIED | LoadingState.jsx is a self-contained animate-pulse div; DataCard embeds it per-card; demo galleries show a loading card sharing a flex row with ok + error cards. |
| UI-07       | 02-01 + 02-03          | Tooltip copy lives in a single `constants/tooltips.js` source-of-truth file                       | ✓ SATISFIED | Only `src/constants/tooltips.js` defines tooltip strings; all consumers go through `getTooltip(key)` (3 components: DataCard, StatusBadge, AlertCard). No inline tooltip-copy strings in component files. |

All 7 phase requirement IDs are accounted for in PLAN frontmatter and verified in source.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (none) | — | — | — | — |

`grep -E "TODO|FIXME|XXX|HACK"` returns no hits in any Phase 2 source. `grep -E "console\\.log"` returns no hits. `grep -E "return null;"` returns no hits. The single `placeholder` token in `src/constants/tooltips.js` is in a JSDoc comment explaining the intentional Phase-2-vs-Phase-3/4 seeding contract (per 02-CONTEXT "Locked tooltips for Phase 2") — informational, not a code smell.

### Human Verification Required

See the YAML frontmatter `human_verification` block. Four items require browser-based confirmation:

1. **Tooltip surfacing on hover** — 150ms delay + portal + Earth-anchored copy.
2. **Per-card state independence** — loading skeleton + error string + ok values all coexisting in one row.
3. **LastUpdated hover behavior** — absolute UTC in tooltip; em-dash variant has no tooltip.
4. **Cross-tab palette comparison** — severity colors universal (green/amber/red on both tabs); accent rings palette-specific (mars amber vs moon silver).

These are visual / interactive checks that static greps cannot perform.

### Gaps Summary

No gaps. All artifacts exist, are substantive, are wired correctly, and pass `npm run build`. All 7 UI requirement IDs are satisfied. The single design lock affecting UI-03 (universal severity colors vs body palette) is explicitly decided in 02-CONTEXT.md and documented in the composite SUMMARY — this is a deliberate design clarification, not a deviation from intent.

The four human-verification items are not gaps — they are visual / interactive behaviors that require a running browser (analogous to the Phase 1 visual UAT items) and represent the natural division between static and dynamic verification.

---

_Verified: 2026-05-19_
_Verifier: Claude (gsd-verifier)_
