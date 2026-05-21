# Phase 5: Reliability & UX Polish — Context

**Gathered:** 2026-05-21
**Status:** Ready for planning
**Source:** Auto-discuss (session-wide "no clarifying questions" instruction). Synthesized from ROADMAP.md Phase 5 success criteria, REQUIREMENTS.md REL-01..REL-05, Discussion.md §6 (Key UX Details), and accumulated code review findings from Phases 2/3/4 (REVIEW.md artifacts).

<domain>
## Phase Boundary

Phase 5 is the **trust pass** — most of the reliability contracts (loading/error states, units, freshness, stale-while-revalidate) are already shipped via Phase 2 primitive locks and Phase 3/4 wirings. Phase 5's job is twofold:

1. **Audit** the existing Mars + Moon tabs against REL-01..REL-05 and produce gap-closure fixes for any drift
2. **Address accumulated UX/a11y warnings** from prior code reviews — touch-device tooltips, keyboard focus management on the DONKI event list, tooltip scroll/resize follow, narrow-viewport clamp — plus small consistency wins (extract duplicated number formatters, thread TanStack v5 `AbortSignal` into fetch calls)

**In scope (Phase 5):**
- Audit pass: enumerate every numerical/text value on both tabs, verify each has its unit, tooltip, freshness chip, and loading/error fallback
- Touch-device tooltip support: tap-to-toggle on touch, hover/focus preserved on desktop (Phase 2 WR-04)
- Tooltip scroll/resize follow: reposition on viewport scroll & resize, not just on mount (Phase 2 WR-02)
- Tooltip narrow-viewport clamp: `max-width: min(90vw, 320px)` + correct flip when `maxLeft < 0` (Phase 2 WR-03)
- AlertCard a11y cleanup: drop bogus `role="button"`+`tabIndex` on info icon since TooltipWrapper already handles focus (Phase 2 WR-01)
- DONKI list keyboard scroll: `tabIndex={0}` + `role="region"` + `aria-label` on the overflow container (Phase 4 WR-01)
- AlertCard React key safety: `key={\`${ev.type}-${ev.id}\`}` to prevent cross-endpoint id collisions (Phase 4 WR-02)
- Extract number formatters to `src/utils/formatters.js` (Phase 3 IN-03, Phase 4 IN-03) — duplicated in MarsTab.jsx + MoonTab.jsx
- Thread TanStack v5 `AbortSignal` through all three data hooks' fetch calls (Phase 3 IN-02) — idiomatic v5; prevents leaked requests on unmount/refetch
- Verify each panel has a `LastUpdated` chip OR a "Computed locally" subtitle (REL-04)
- Optional inline comment cleanups flagged by checkers (Phase 3 IN-01 doc-count drift, Phase 4 IN-04 missing eslint-disable rationale)

**Out of scope (Phase 6+):**
- Vercel deployment / production env config (Phase 6)
- Mobile-optimized layout (out of v1 scope per PROJECT.md — only baseline non-broken)
- Share / screenshot functionality (v2)
- Test runner (Vitest) setup — utility correctness verified via inline node smoke checks; introducing a test runner just for 3 pure modules adds scaffolding without compensating value at this milestone. If the app grows, add later.
- New data sources or panels (Phases 3/4 locked the data surface)
- Visual redesigns of the cinematic dashboard aesthetic
- Backend proxy (still no rate-limit pressure observed)

**Carrying forward from prior phases:**
- Tech stack locked: React 18 + Vite + Tailwind 3 + TanStack Query v5
- Primitive library is final: any changes here are bug-fixes, NOT API changes — Phases 3/4 consumers must continue working
- Tailwind palette tokens limited to existing `mars-*`/`moon-*`/`space-*`
- Tooltip copy source-of-truth is `src/constants/tooltips.js` (19 keys total)
- D-43 (silent refetch lock) and D-18 (silent background refetch — `isLoading` not `isFetching`) apply project-wide and are preserved

</domain>

<decisions>
## Implementation Decisions

### Audit scope and methodology

- **D-01:** The audit produces a single inline checklist (in the audit-task SUMMARY.md) enumerating every DataCard, StatusBadge, and AlertCard on MarsTab + MoonTab. For each: confirm `unit` if numeric (REL-02), confirm `tooltipKey` if educational anchoring helps (REL-03), confirm a `LastUpdated` chip or "Computed locally" subtitle (REL-04), confirm loading/error rendering (REL-01).
- **D-02:** The audit does NOT modify code on its own — it produces findings. Any drift is fixed by a follow-up plan task within Phase 5 (not deferred to a 5.1 gap-closure phase, since v1 scope is small enough to bundle).
- **D-03:** Stale-while-revalidate (REL-05) is verified by a static grep: no `isFetching` should appear anywhere in Phase 3+4 source files (already enforced by prior phases). Phase 5 reverifies and documents the result in the audit summary.

### Tooltip — touch support (Phase 2 WR-04)

- **D-04:** Detect touch capability via `'ontouchstart' in window` once at module load (or `window.matchMedia('(pointer: coarse)').matches`). Memoize as a module-level boolean.
- **D-05:** On touch devices, the trigger element gets an `onClick` handler that toggles the tooltip's open state. Desktop hover/focus behavior is preserved unchanged on non-touch.
- **D-06:** When the tooltip is open via tap, tapping anywhere outside dismisses it (the existing click-outside handler already covers this). ESC also still dismisses.
- **D-07:** Mixed input devices (e.g., iPad Pro with mouse) get both — tap-to-toggle AND hover-to-show. The behaviors are additive, not mutually exclusive.

### Tooltip — scroll/resize follow (Phase 2 WR-02)

- **D-08:** When the tooltip is open, attach `window.addEventListener('scroll', reposition, { passive: true, capture: true })` and `window.addEventListener('resize', reposition)` for the duration the tooltip is visible. Clean up on close/unmount.
- **D-09:** The reposition function reuses the existing positioning logic (single function, no duplication). Use `requestAnimationFrame` to debounce against scroll storms.

### Tooltip — narrow-viewport clamp (Phase 2 WR-03)

- **D-10:** Add `style={{ maxWidth: 'min(90vw, 320px)' }}` to the portal element. The existing flip logic continues to work; the clamp prevents horizontal overflow on narrow screens.
- **D-11:** When the natural tooltip width exceeds viewport width minus margins, the horizontal clamp will produce a `maxLeft < 0` value — guard the existing positioning math to `Math.max(0, ...)` so it never produces negative offsets.

### AlertCard info-icon a11y cleanup (Phase 2 WR-01)

- **D-12:** Remove `role="button"` and `tabIndex={0}` from the info icon. Rationale: the info icon is wrapped in `TooltipWrapper`, which already attaches focus handlers to the trigger child via `cloneElement`. Adding `role="button"` advertised a keyboard contract (Enter/Space) that wasn't implemented, which is worse than no contract. The focus-handler path that TooltipWrapper provides IS the keyboard contract — Tab to focus the trigger reveals the tooltip.
- **D-13:** No other changes to AlertCard. The visual rendering and tooltip wiring are correct as-is.

### DONKI list keyboard scrollability (Phase 4 WR-01)

- **D-14:** The scrollable container (`max-h-96 overflow-y-auto` div in MoonTab.jsx) gets `tabIndex={0}` + `role="region"` + `aria-label="Recent solar events"`. This makes the list a keyboard-focusable landmark; users can Tab onto it and use arrow keys / PgDn to scroll.

### AlertCard React key safety (Phase 4 WR-02)

- **D-15:** Change MoonTab.jsx's AlertCard list `key={ev.id}` to `key={\`${ev.type}-${ev.id}\`}`. Rationale: DONKI returns IDs scoped per endpoint (CME, FLR, GST) — a hypothetical collision between, say, a CME `2026-001` and a GST `2026-001` would silently cause React reconciliation bugs. Type-prefixing guarantees uniqueness across the merged stream.

### Number formatter extraction (Phase 3 IN-03 / Phase 4 IN-03)

- **D-16:** Create `src/utils/formatters.js` exporting `formatInt(n)` (rounds to integer, em-dash on null/undefined/NaN) and `formatOneDecimal(n)` (1 decimal, em-dash on null/undefined/NaN). MarsTab.jsx and MoonTab.jsx import from here instead of declaring inline duplicates.
- **D-17:** Optional sign-prefix variant for Bz: `formatSignedDecimal(n)` (renders explicit `+` for non-negative). MoonTab uses this for Bz (per Phase 4 D-38).
- **D-18:** The em-dash fallback character is `'—'` (EM DASH, U+2014) — consistent with the existing DataCard null handling.

### AbortSignal threading (Phase 3 IN-02)

- **D-19:** All three data hooks (`useMarsData`, `useSolarWind`, `useDonkiEvents`) thread TanStack v5's `queryFn({ signal })` parameter into the `fetch(url, { signal })` call. This lets v5 cancel in-flight requests when a component unmounts mid-fetch or when a refetch supersedes a pending request.
- **D-20:** The MAAS2 Content-Type workaround in `useMarsData` becomes:
  ```js
  queryFn: async ({ signal }) => {
    const r = await fetch(URL, { signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const text = await r.text()
    return JSON.parse(text)
  }
  ```
- **D-21:** SWPC and DONKI use the standard pattern: `fetch(url, { signal }).then(r => { if (!r.ok) throw ...; return r.json() })`.

### Inline comment polish

- **D-22:** Fix the "nine DataCards" doc-comment drift in `useMarsData.js` (Phase 3 IN-01) — change to "eight DataCards".
- **D-23:** Add an inline comment above the `eslint-disable-next-line` in `useDonkiEvents.js` (Phase 4 IN-04) explaining that `NASA_API_KEY` is intentionally omitted from the dependency array because it's a build-time constant baked into the bundle by Vite (not a runtime reactive value).

### What stays the same

- **D-24:** No API contract changes — primitives keep their existing props; tab-level layouts unchanged; tooltip copy unchanged (only A11Y behavior added).
- **D-25:** No new dependencies. `formatters.js` is hand-written. No test runner introduced (utility correctness verified via existing inline node smoke checks documented in 04-01-SUMMARY.md and 03-01-SUMMARY.md).
- **D-26:** Existing locked decisions from Phases 2/3/4 are preserved verbatim:
  - D-43 (Phase 4) silent refetch lock
  - D-18 (Phase 3) silent background refetch
  - Phase 2: universal severity colors, palette is decorative not semantic
  - Phase 3/4: tooltip-key tooltips.js source-of-truth

### Plan decomposition guidance

- **D-27:** Phase 5 naturally splits into ~3 sequential plans:
  - **Plan 05-01 (Wave 1):** `src/utils/formatters.js` creation + DataCard/MarsTab/MoonTab consumers refactored to import from it + Phase 3 IN-01 doc-comment fix in useMarsData.js + Phase 4 IN-04 inline comment in useDonkiEvents.js. Leaf-level, no dependencies on Wave 2/3 work.
  - **Plan 05-02 (Wave 2):** TooltipWrapper a11y/touch/scroll improvements (D-04..D-11) + AlertCard info-icon role cleanup (D-12). Touches `src/components/TooltipWrapper.jsx` and `src/components/AlertCard.jsx`. Depends on nothing else in Phase 5; could be Wave 1 if waves were parallel, but kept sequential after Wave 1 to avoid concurrent edits to overlapping primitive files.
  - **Plan 05-03 (Wave 3):** AbortSignal threading in all three data hooks (D-19..D-21) + MoonTab.jsx DONKI list keyboard scroll (D-14) + MoonTab.jsx AlertCard key prefix (D-15) + final audit task producing the audit checklist in the plan SUMMARY.md. Depends on 05-01 (uses the new formatters.js if any audit drift requires re-rendering numbers).

  The planner has authority to merge or split; this is guidance, not a lock.

### Claude's Discretion (planner & executor may decide)

- Whether to split Plan 05-03 into "data hook polish" + "MoonTab polish" + "audit" if it grows too large
- Whether the audit task produces a separate AUDIT.md artifact or inlines the checklist in the plan SUMMARY.md (recommend: inline in SUMMARY.md to avoid artifact sprawl)
- Whether to memoize the touch-detection boolean at module level or inside the TooltipWrapper component (recommend: module-level — touch capability doesn't change at runtime in normal browsing)
- Whether to add tooltip `aria-live` for tap-to-open touch flows so screen readers announce the tooltip on activation
- Exact wording of any inline JSDoc comments added during the polish pass

</decisions>

<specifics>
## Specific Ideas

- **Audit checklist seed** — Cards to verify against REL-01..REL-04:
  - MarsTab: 8 DataCards (sol, earthDate, minTemp, maxTemp, pressure, humidity, windSpeed, opacity) + 1 tab-level + 8 per-card LastUpdated + source attribution
  - MoonTab Lunar Context: 4 DataCards (phaseName, phasePercentage, dayNight, surfaceTemp) + "Computed locally" subtitle (no LastUpdated by design)
  - MoonTab Solar Wind: 4 DataCards (speed, density, bz, kp) + 1 Radiation Risk StatusBadge + 1 section-level LastUpdated
  - MoonTab Solar Event Alerts: AlertCard list (variable count) + 1 section-level LastUpdated + empty-state copy
- **Touch detection literal** — `const IS_TOUCH = typeof window !== 'undefined' && ('ontouchstart' in window || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches))`. Lives at module scope in `src/components/TooltipWrapper.jsx`.
- **AbortSignal pattern** — TanStack Query v5 passes `{ signal }` to every `queryFn`. The signal is automatically aborted on unmount or when a refetch supersedes a pending request. No manual cleanup needed beyond passing it to `fetch`.
- **formatters.js export shape** (anticipated):
  ```js
  // src/utils/formatters.js
  export function formatInt(n) { /* ... em-dash on null/undefined/NaN, else Math.round */ }
  export function formatOneDecimal(n) { /* ... em-dash on null/undefined/NaN, else .toFixed(1) */ }
  export function formatSignedDecimal(n) { /* ... explicit + for non-negative, 1 decimal */ }
  ```
- **Aesthetic anchor** — Phase 5 ships ZERO new visual elements. The dashboard looks identical before and after Phase 5 to a casual observer; the changes are behavioral (touch, keyboard, scroll-following tooltips) and consistency (shared formatters, signal-aware fetches).

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product spec
- `Discussion.md` §6 (Key UX Details — loading states, error states, no empty panels, mandatory timestamps, units, Earth comparisons)
- `Discussion.md` §3 (Refresh cadence — per-source rates that drive the silent-refetch lock)
- `CLAUDE.md` — Project guardrails

### Requirements
- `.planning/REQUIREMENTS.md` REL-01..REL-05 (the five reliability locks)

### Roadmap
- `.planning/ROADMAP.md` Phase 5 section — goal, depends on Phase 4, 5 success criteria

### Prior-phase decisions (locked — Phase 5 preserves, audits, polishes)
- `.planning/phases/02-shared-ui-primitives/02-CONTEXT.md` — Primitive contracts (DataCard / TooltipWrapper / StatusBadge / AlertCard / LastUpdated / LoadingState)
- `.planning/phases/03-mars-tab-surface-data/03-CONTEXT.md` — Mars tab pattern (single hook → shared state → cards)
- `.planning/phases/04-moon-tab-three-sub-sections/04-CONTEXT.md` — Moon tab three-section pattern + per-section isolation
- `.planning/phases/02-shared-ui-primitives/02-REVIEW.md` — Code review findings WR-01..WR-04 (touch tooltips, scroll follow, narrow viewport, AlertCard role)
- `.planning/phases/03-mars-tab-surface-data/03-REVIEW.md` — Code review findings IN-01..IN-03 (doc-count drift, AbortSignal, formatter extraction)
- `.planning/phases/04-moon-tab-three-sub-sections/04-REVIEW.md` — Code review findings WR-01..WR-02 + IN-01..IN-04 (DONKI list a11y, AlertCard key collision, formatter extraction, eslint-disable rationale)

### Library docs
- TanStack Query v5 — `queryFn({ signal })` parameter, automatic abort on unmount/refetch supersession (project uses `@tanstack/react-query@^5.100.10`)
- DOM APIs — `window.matchMedia('(pointer: coarse)')`, scroll/resize listeners with `passive: true`, requestAnimationFrame debouncing

### Source files Phase 5 will touch
- `src/components/TooltipWrapper.jsx` (touch + scroll/resize + narrow-viewport)
- `src/components/AlertCard.jsx` (info-icon role cleanup)
- `src/hooks/useMarsData.js` (AbortSignal + doc-comment fix)
- `src/hooks/useSolarWind.js` (AbortSignal)
- `src/hooks/useDonkiEvents.js` (AbortSignal + eslint-disable comment)
- `src/tabs/MarsTab.jsx` (consume formatters.js)
- `src/tabs/MoonTab.jsx` (consume formatters.js + DONKI list a11y + AlertCard key)
- `src/utils/formatters.js` (NEW)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- All Phase 2 primitives are already wired into Phase 3/4 tabs — Phase 5 polish doesn't change consumer code (other than the formatter import paths and one AlertCard `key` prop on MoonTab).
- `src/utils/env.js` proves the "utility-with-fallback" pattern; `formatters.js` follows it.
- `src/components/TooltipWrapper.jsx` already has `useLayoutEffect`-driven positioning + ESC/click-outside/blur dismiss — Phase 5 adds touch + scroll/resize handlers to the existing structure, not a rewrite.
- TanStack Query v5's `queryFn` signature `({ signal, queryKey }) => Promise<T>` is already what the three hooks use — adding `signal` to the destructured arg + the fetch call is a small targeted change.

### Established Patterns
- Tailwind palette tokens only — no new tokens in Phase 5.
- `src/utils/*.js` pure functions, named exports.
- Hooks return TanStack Query result objects (Phase 3 pattern preserved through Phase 4).
- Tooltip copy in `src/constants/tooltips.js` (no new keys added in Phase 5; existing 19 keys remain authoritative).

### Integration Points
- `src/tabs/MarsTab.jsx` lines ~34-62 contain `formatInt` + `formatOneDecimal` inline definitions — these get replaced with imports from `src/utils/formatters.js`.
- `src/tabs/MoonTab.jsx` lines ~34-62 contain similar inline formatters — replaced with the same imports.
- `src/tabs/MoonTab.jsx` ~line 238: DONKI scrollable container needs `tabIndex`/`role`/`aria-label` additions.
- `src/tabs/MoonTab.jsx` ~line 241: AlertCard `key={ev.id}` becomes `key={\`${ev.type}-${ev.id}\`}`.
- `src/components/TooltipWrapper.jsx` ~line 65-101: positioning logic gets the touch + scroll/resize + narrow-viewport additions.
- `src/components/AlertCard.jsx` ~line 46-57: info icon loses `role="button"` + `tabIndex={0}`.
- `src/hooks/useMarsData.js`, `useSolarWind.js`, `useDonkiEvents.js`: queryFn signatures add `{ signal }`, fetch calls receive it.

</code_context>

<deferred>
## Deferred Ideas

- **Vitest test runner setup** — Pure utilities (`lunarPhase.js`, `radiationRisk.js`, the new `formatters.js`) are TDD-eligible per the GSD heuristic. Inline node smoke checks have been sufficient through v1. Defer to a v1.1 or v2 milestone when the app's logic complexity warrants it.
- **Tooltip `aria-live` on tap-to-open** — Could announce tooltip content to screen readers when activated via touch. Defer — adds complexity without a clear win for the educational audience that's primarily on desktop.
- **Tooltip dismiss button on touch** — Some patterns add an explicit close X for taps. Not needed; tap-outside dismisses and the existing ESC handler still works.
- **Skeleton-shimmer animation** — Phase 2 chose flat `animate-pulse`. Could add a gradient shimmer for fancy. Defer — the flat pulse honors the cinematic dark aesthetic.
- **Visual `isFetching` indicator** — A subtle "refreshing..." pulse during background refetch. Phase 3/4 deliberately locked this to silent (D-18 / D-43). Defer unless user feedback says the absence is confusing.
- **Per-card retry buttons** — Manual refetch UX. Defer until evidence of need (none observed).
- **Background-refresh animation** — A "this just updated" highlight when a value changes. Nice but adds visual noise. Defer.
- **Formatter utility extras** — `formatPercent`, `formatDuration`, `formatTemperature` (auto-Celsius/Fahrenheit) variants. The current v1 surface needs only 3 formatters. Add more in v2 if needed.
- **Cross-cutting consistency component** — Some patterns extract a `<SectionShell>` wrapper that owns heading + LastUpdated + loading branch. Could DRY up Mars/Moon tabs. Defer — the current duplication is small (3 sites) and clear; over-abstracting hurts readability.
- **Mobile-optimized layout** — Already deferred per PROJECT.md.
- **Vercel deployment** — Phase 6.

</deferred>

---

*Phase: 05-reliability-ux-polish*
*Context gathered: 2026-05-21*
