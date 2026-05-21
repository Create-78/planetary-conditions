---
status: partial
phase: 04-moon-tab-three-sub-sections
source: [04-VERIFICATION.md]
started: 2026-05-21T13:30:00Z
updated: 2026-05-21T13:30:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Three sections render across all states (per-section error isolation)
expected: Run `npm run dev`, open the Moon tab. All three section headings render: "Lunar Context", "Space Weather — Solar Wind", "Solar Event Alerts (last 7 days)". Tab heading "Moon — Conditions" and aria-label="Moon conditions" are present. After initial load: Section 1 shows 4 lunar DataCards with real phase data; Section 2 shows 4 SWPC DataCards + Radiation Risk StatusBadge; Section 3 shows the AlertCard list or empty-state copy. Block `api.nasa.gov` in DevTools Network panel and reload: Section 3 shows "Data temporarily unavailable" but Sections 1 and 2 continue rendering normally. Now block `services.swpc.noaa.gov` too: Section 2 shows error state, but Section 1 (lunar — local computation) remains live.
result: [pending]

### 2. Tooltip hover surfacing across all 9 tooltip keys
expected: Hover each DataCard value in Section 1 and 2: tooltip portal appears after ~150ms with the Earth-anchored copy from Discussion.md §4 (e.g., for Bz: "When the interplanetary magnetic field points south (negative Bz), it can trigger geomagnetic storms..."). Hover the Radiation Risk StatusBadge: tooltip surfaces the swpc.radiationRisk copy. Hover an AlertCard info icon (if present): donki.cme/flr/gst copy appears. Tooltips include "Computed (lunar phase model)" / "NOAA SWPC" / "NASA DONKI" attribution footers per source.
result: [pending]

### 3. Silent background refetch (5min SWPC + 15min DONKI cadences)
expected: Open DevTools Network panel filtered to SWPC. Wait 5 minutes (or modify clock) — observe new fetches to plasma-2-hour.json, mag-2-hour.json, and noaa-planetary-k-index.json. Values in Section 2 update silently with NO skeleton flash. Same observation for DONKI at 15 minutes: 3 new requests to api.nasa.gov, list updates in place with no blanking. The browser console shows no errors during background refetch.
result: [pending]

### 4. DONKI empty-state in a quiet space-weather week
expected: When DONKI returns empty arrays for all three event types (a quiet week — observable by manually mocking the response in DevTools, or by waiting for a naturally quiet week), Section 3 renders the verbatim copy "No significant events in the past 7 days — conditions are calm." as muted italic centered text. This text is NOT wrapped in an AlertCard. Tab heading + Section 1 + Section 2 + Section 3 heading remain visible.
result: [pending]

### 5. DONKI error isolation
expected: Block `api.nasa.gov` in DevTools Network panel and reload. Section 3 renders a single "Data temporarily unavailable" muted block (NOT 8 cards' worth). Section 1 (lunar) and Section 2 (SWPC) continue rendering live data. The tab is never blank; all three section headings remain visible.
result: [pending]

### 6. Cross-section palette discipline
expected: Switch between Mars and Moon tabs. Mars values render with amber/rust accent (mars-accent). Moon values render with blue/silver accent (moon-accent). NO Mars palette leakage on Moon tab. Status colors (Radiation Risk low/moderate/high) remain universal (green/amber/red) on both tabs — they are NOT palette-tinted. AlertCard event-type colors (indigo CME, orange FLR, fuchsia GST) also remain consistent across both tabs.
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
