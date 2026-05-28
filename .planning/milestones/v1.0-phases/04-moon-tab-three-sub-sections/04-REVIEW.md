---
phase: 04-moon-tab-three-sub-sections
reviewed: 2026-05-21T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/utils/lunarPhase.js
  - src/utils/radiationRisk.js
  - src/hooks/useLunarPhase.js
  - src/hooks/useSolarWind.js
  - src/hooks/useDonkiEvents.js
  - src/tabs/MoonTab.jsx
  - src/constants/tooltips.js
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-05-21
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Phase 04 introduces three independently-sourced Moon-tab sub-sections (Lunar
Context, Space Weather, Solar Event Alerts) with strong adherence to the
silent-refresh lock, per-section state isolation, and NASA key discipline
established in earlier phases. The TanStack Query v5 `useQueries` integration
is correct: `queryKey` shape is stable, `refetchInterval` matches the spec
cadence (5 min SWPC, 15 min DONKI), `refetchOnWindowFocus` is disabled
throughout, and `isLoading` (not `isFetching`) gates skeletons in every
section. NASA key handling is clean — only `src/utils/env.js` references
`import.meta.env`, and `useDonkiEvents` imports `NASA_API_KEY` through it.
The SWPC tabular parser correctly guards `response.ok`, validates the
`[headers, ...rows]` shape, walks rows newest-to-oldest looking for non-null
target fields, and coerces NaN to null so cards render em-dashes instead of
"NaN". The pure utilities (`lunarPhase`, `radiationRisk`) are tight and
well-tested by construction. Tooltip key consistency: every `tooltipKey`
prop used in `MoonTab.jsx` (`lunar.phase`, `lunar.dayNight`,
`lunar.surfaceTemp`, `swpc.speed`, `swpc.density`, `swpc.bz`, `swpc.kp`,
`swpc.radiationRisk`) maps to a defined entry in `tooltips.js`; the dynamic
DONKI keys (`donki.cme`, `donki.flr`, `donki.gst`) are also all present.

Two warnings worth fixing before merge: (1) the DONKI alert list is a
scrollable `div` that is not keyboard-reachable (no `tabIndex={0}`), which
breaks the accessibility checklist for the section; and (2) `AlertCard`
list keys use `ev.id` alone, which assumes uniqueness across CME/FLR/GST
namespaces — defensible today but fragile if NASA ever returns colliding
IDs across endpoints. Four info-level items cover minor robustness and
clarity improvements (UTC-day boundary, defensive row-shape guard,
duplicated `formatInt`/`formatOneDecimal` carry-forward, `useMemo` ESLint
suppression).

## Warnings

### WR-01: DONKI alert list is not keyboard-scrollable

**File:** `src/tabs/MoonTab.jsx:238`
**Issue:** The container `<div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">` clips its content with `overflow-y-auto`, but a plain `<div>` is not in the keyboard tab order. A keyboard-only user cannot scroll the alert list once it overflows, which contradicts the accessibility goal called out in the review scope ("AlertCard list keyboard-scrollable"). It also lacks an accessible name so screen readers cannot identify the scroll region.
**Fix:**
```jsx
<div
  className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-moon-accent"
  tabIndex={0}
  role="region"
  aria-label="Solar event alerts list"
>
  {donki.events.map((ev) => (
    <AlertCard
      key={ev.id}
      eventType={ev.type}
      timeUtc={ev.time}
      severity={ev.severity}
      tooltipKey={ev.tooltipKey}
    />
  ))}
</div>
```
Adding `tabIndex={0}` puts the region into the tab order so PageDown / arrow keys can scroll it; `role="region"` + `aria-label` makes it a named landmark.

### WR-02: AlertCard list key collisions possible across DONKI event types

**File:** `src/tabs/MoonTab.jsx:241`
**Issue:** `key={ev.id}` uses the raw `activityID` / `flrID` / `gstID` value from NASA. While these IDs are typically prefixed by date and event class (so collisions are unlikely in practice), the merged `events` array unifies three independent NASA endpoints into a single React list. A future NASA schema change, an unexpected payload, or test fixtures with overlapping IDs would silently produce duplicate keys, which React handles by reusing the wrong DOM node — leading to subtle render bugs (wrong tooltip on the wrong row, etc.).
**Fix:**
```jsx
{donki.events.map((ev) => (
  <AlertCard
    key={`${ev.type}-${ev.id}`}
    ...
  />
))}
```
Namespacing the key with `ev.type` guarantees uniqueness regardless of upstream ID collisions, with no behavioral downside (the key is only used by React for reconciliation).

## Info

### IN-01: Date window uses UTC day boundary; could shift relative to user's local day

**File:** `src/hooks/useDonkiEvents.js:41-50`
**Issue:** Both `sevenDaysAgoISO()` and `todayKey()` derive their day string from `toISOString().slice(0, 10)`, which is UTC. A user in (say) PST (UTC-8) sees their local day rollover 8 hours before UTC's day rollover, meaning the DONKI window "shifts to a new day" mid-evening local time, possibly re-firing fetches at a non-obvious moment. The shift is harmless to data correctness (the 7-day window is approximate), but it can feel surprising during dev/debug.
**Fix:** If matching user-local days is preferred, derive `dayKey` from `Date()` local fields:
```js
function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
```
Otherwise document the UTC choice in the hook header. Either is acceptable; today's behavior is the simpler one.

### IN-02: `latestObject` does not defensively guard against malformed rows

**File:** `src/hooks/useSolarWind.js:49-57`
**Issue:** `latestObject` assumes every entry of `rows` is an array of the same length as `headers`. If SWPC ever returns a string row, a shorter row, or `null` in the rows list, `Object.fromEntries(headers.map((h, idx) => [h, row[idx]]))` will either throw (on `null.row[idx]`) or produce wrong fields (silently). The current shape guard in `fetchTabular` only checks `Array.isArray(payload) && payload.length >= 2`, not per-row shape.
**Fix:** Add a per-row guard inside the loop:
```js
function latestObject({ headers, rows }, targetField) {
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    if (!Array.isArray(row)) continue
    const obj = Object.fromEntries(headers.map((h, idx) => [h, row[idx]]))
    if (obj[targetField] != null) return obj
  }
  const last = rows[rows.length - 1]
  if (!Array.isArray(last)) return {}
  return Object.fromEntries(headers.map((h, idx) => [h, last[idx]]))
}
```
Low risk in practice — NOAA's schema is stable — but cheap to add.

### IN-03: `formatInt` / `formatOneDecimal` / `formatSignedInt` duplicated across Mars and Moon tabs

**File:** `src/tabs/MoonTab.jsx:34-62`
**Issue:** The header comment acknowledges this is now the second consumer of these four formatters and defers extraction to Phase 5 polish. That's a sound call, but the duplication is now real — and `formatSignedOneDecimal` is a fifth formatter introduced here that isn't yet shared with MarsTab. Tracking this debt explicitly in `STATE.md` (or as a TODO in `src/utils/`) will make sure the Phase 5 polish doesn't forget it.
**Fix:** No code change needed in this phase. Add a tracking note (or empty `src/utils/formatters.js` placeholder with a TODO header) so the Phase 5 extraction is concrete.

### IN-04: `useMemo` ESLint suppression in `useDonkiEvents` is correct but slightly opaque

**File:** `src/hooks/useDonkiEvents.js:116-117`
**Issue:** The `// eslint-disable-next-line react-hooks/exhaustive-deps` suppression is needed because `NASA_API_KEY` is a module-level constant (not a dep) and the memo deliberately stays stable on `dayKey` rather than re-running every render. The intent is correct, but future readers may misread it as a missing-dep bug. A one-line code comment immediately before the suppression would clarify intent without changing behavior.
**Fix:**
```js
return {
  cmeUrl: `https://api.nasa.gov/DONKI/CME?startDate=${d}&api_key=${NASA_API_KEY}`,
  flrUrl: `https://api.nasa.gov/DONKI/FLR?startDate=${d}&api_key=${NASA_API_KEY}`,
  gstUrl: `https://api.nasa.gov/DONKI/GST?startDate=${d}&api_key=${NASA_API_KEY}`,
}
// NASA_API_KEY is a module constant — deliberately omitted from deps;
// dayKey is the only value that should re-trigger URL recomputation.
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [dayKey])
```

---

_Reviewed: 2026-05-21_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
