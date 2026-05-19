---
status: partial
phase: 03-mars-tab-surface-data
source: [03-VERIFICATION.md]
started: 2026-05-19T14:00:00Z
updated: 2026-05-19T14:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Live MAAS2 fetch & populated cards
expected: Run `npm run dev`, open the Mars tab. After the first fetch (under 2 seconds with normal connection), all 8 DataCards show real Curiosity REMS values: Sol (integer), Earth Date (YYYY-MM-DD), Min Temp / Max Temp (°C, 1 decimal), Pressure (Pa, integer), Wind Speed (m/s, 1 decimal), Humidity (%, 1 decimal), Atmospheric Opacity (string e.g. "Sunny"). Section subtitles ("Sol Context", "Temperature & Atmosphere", "Wind & Sky") are visible. Source line "From Curiosity Rover · REMS instrument" appears under the Mars heading with the tab-level LastUpdated chip beside it. Each DataCard has its own LastUpdated chip below the value. All 17 `palette="mars"` instances render with amber/rust accents.
result: [pending]

### 2. Tooltip hover surfacing
expected: Hover any DataCard value (e.g. Pressure). After ~150ms a tooltip portal appears with the Earth-anchored copy from Discussion.md §5 (e.g. for Pressure: "Mars' atmosphere is about 0.6% as dense as Earth's — too thin to breathe, thick enough to drive dust storms."). The tooltip shows "MAAS2 / Curiosity REMS" attribution. The em-dash variant on LastUpdated (initial mount before first fetch completes, if visible) does NOT show a tooltip.
result: [pending]

### 3. Error state + silent background refetch
expected: Open DevTools Network tab, block `api.maas2.apollorion.com` (right-click request → Block request URL), then reload. All 8 DataCards render "Data temporarily unavailable" (muted italic). Tab heading, section subtitles, source attribution, and LastUpdated chips remain visible — tab is NOT blank. After unblocking and waiting 1 hour (or manually clicking refetch via React Query devtools if available), the tab updates silently with no skeleton flash — values change in place. The browser console shows no errors during the background refetch.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
