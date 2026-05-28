---
phase: 03-mars-tab-surface-data
reviewed: 2026-05-19T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/hooks/useMarsData.js
  - src/constants/tooltips.js
  - src/tabs/MarsTab.jsx
findings:
  critical: 0
  warning: 0
  info: 3
  total: 3
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-05-19
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found (info-only)

## Summary

Three source files reviewed against the Phase 3 contract (single-fetch shared hook, 8 DataCards, MAAS2 Content-Type workaround, tooltip parity, palette tokens). The implementation is clean: no bugs, no security exposure, no warnings, and every Phase 3 contract verifies.

Specifically verified:

- **TanStack Query v5 hook correctness:** Stable array `queryKey: ['mars', 'maas2', 'latest']`, `refetchInterval: 1h`, `refetchOnWindowFocus: false`. v5's default `retry: 3` with exponential backoff resolves well inside the 1h window — no conflict with the cadence. TanStack Query handles unmount-cancellation internally; no manual abort wiring needed for correctness.
- **MAAS2 fetch hardening:** `response.ok` is checked before reading the body; the body is read as text and parsed manually (bypassing the GitHub-Pages Content-Type quirk); `JSON.parse` is wrapped in try/catch and rethrown as a descriptive Error so it surfaces as `isError`. Errors from `fetch()` itself propagate naturally because `fetchMarsData` is `async`.
- **React correctness in MarsTab:** `cardState` is derived deterministically from `isLoading`/`isError` on each render — no stale closure path. No `useEffect`, no event handlers, no manual subscriptions; nothing that needs memoization. `useMarsData()` returns the same query result across all 8 DataCards via TanStack's internal cache (one shared subscription).
- **Null-guard correctness:** Every field binding uses `data ? formatX(data.field) : undefined`. When `state !== 'ok'`, DataCard ignores `value` (verified in DataCard.jsx lines 55–66). When `state === 'ok'`, DataCard's `displayValue` substitutes `'—'` for null/undefined (line 65). `formatInt`/`formatOneDecimal` also guard against `null`/`undefined`/`NaN` and return `null`, which DataCard then renders as em-dash. Safe end-to-end.
- **Tooltip key parity:** Exactly 8 `mars.*` keys (`sol`, `earthDate`, `minTemp`, `maxTemp`, `pressure`, `windSpeed`, `humidity`, `opacity`) — 1:1 match with the 8 `tooltipKey` props in MarsTab. The Phase 2 placeholder `mars.example` is already gone; only `moon.example` remains (Phase 4's seed).
- **Tailwind class strings:** All class strings are static literals. DataCard's `outerClasses` concatenation reads from a `PALETTE_GLOW` literal map keyed by a literal `palette` prop (`"mars"` / `"moon"`) — JIT-safe (no dynamic class string construction). MarsTab uses tokens from `tailwind.config.js` (`text-mars-50`, `text-mars-accent`, etc.) — no purge-defeating patterns.
- **Security:** No raw-HTML injection sinks (no `innerHTML` assignment, no React unsafe-HTML prop, no `eval`), no `target="_blank"` with user-controlled URLs. MAAS2 values render through React text nodes (auto-escaped). Tooltip text is static project-authored copy from `tooltips.js`, not user-supplied. No injection surface.
- **Performance:** 8 DataCards each calling `getTooltip` once per render is constant-time object lookup. Formatters run once per field per render — trivial. `useNow` ticks every 30s and re-renders LastUpdated subtrees; with 9 LastUpdated instances on the Mars tab this is well within budget. Nothing to flag.
- **Accessibility (heading hierarchy):** `<h2>` for the tab title, three `<h3>` section headings — correct nesting. The outer `<section role="tabpanel">` provides an accessible name via `aria-label="Mars conditions"`; the three inner sections use `aria-label` too. Hierarchy is sound.

Three Info-level items below are stylistic/consistency notes, not bugs.

## Info

### IN-01: Doc comment says "nine DataCards" but implementation has eight

**File:** `src/hooks/useMarsData.js:17-19`
**Issue:** The JSDoc header in `useMarsData.js` reads:

> "Returns the full TanStack Query result object so the consumer (MarsTab.jsx) can read { data, isLoading, isError, dataUpdatedAt, ... } and propagate state to all nine DataCards from a single fetch (per 03-CONTEXT D-01, D-02)."

The shipped Mars tab renders 8 DataCards (sol, earthDate, minTemp, maxTemp, pressure, windSpeed, humidity, opacity). 03-CONTEXT.md D-01 originally said "nine" but the planning narrowed to eight; `MarsTab.jsx` is internally consistent (the inline comment on line 9 says "eight"), but the hook's docstring is stale.

**Fix:** Update `src/hooks/useMarsData.js:17-19` to read "all eight DataCards" (or simply "the Mars-tab DataCards"). No code change needed.

```js
// Returns the full TanStack Query result object so the consumer (MarsTab.jsx)
// can read { data, isLoading, isError, dataUpdatedAt, ... } and propagate state
// to all eight DataCards from a single fetch (per 03-CONTEXT D-01, D-02).
```

### IN-02: TanStack Query `signal` not threaded into `fetch`

**File:** `src/hooks/useMarsData.js:28-41`
**Issue:** TanStack Query v5 passes an `AbortSignal` to query functions for in-flight cancellation when a query is unsubscribed or refetched. `fetchMarsData()` doesn't accept the context object, so the underlying `fetch()` keeps running until the network resolves (it's then ignored by the cache). Not a correctness bug — TanStack Query handles the result-side cancellation, and at 1h cadence the in-flight window is tiny — but threading the signal is the idiomatic v5 pattern and avoids wasted bytes when the user navigates away mid-fetch.

**Fix:**

```js
async function fetchMarsData({ signal } = {}) {
  const response = await fetch(MAAS2_URL, { signal })
  if (!response.ok) {
    throw new Error(`MAAS2 fetch failed: ${response.status} ${response.statusText}`)
  }
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (err) {
    throw new Error(`MAAS2 response was not valid JSON: ${err.message}`)
  }
}

export function useMarsData() {
  return useQuery({
    queryKey: ['mars', 'maas2', 'latest'],
    queryFn: fetchMarsData, // TanStack passes { signal, queryKey, ... }
    refetchInterval: ONE_HOUR_MS,
    refetchOnWindowFocus: false,
  })
}
```

### IN-03: `<LastUpdated />` duplicated 8x in markup — extract a wrapper if Phase 4 repeats the pattern

**File:** `src/tabs/MarsTab.jsx:88-190`
**Issue:** Each DataCard is wrapped in:

```jsx
<div className="flex flex-col gap-2">
  <DataCard ... />
  <LastUpdated timestamp={timestamp} palette="mars" />
</div>
```

…repeated 8 times. Not a bug, and per D-13/D-24 it's explicitly Claude's discretion whether to extract sub-components. Flagging for Phase 4: if the Moon tab uses the same pattern, extract a `<DataCardWithFreshness>` (or similar) wrapper in `src/components/` to halve the JSX and ensure visual consistency across tabs.

**Fix:** No action for Phase 3. If Phase 4 repeats this layout, extract:

```jsx
function DataCardWithFreshness({ timestamp, palette, ...cardProps }) {
  return (
    <div className="flex flex-col gap-2">
      <DataCard {...cardProps} palette={palette} />
      <LastUpdated timestamp={timestamp} palette={palette} />
    </div>
  )
}
```

---

_Reviewed: 2026-05-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
