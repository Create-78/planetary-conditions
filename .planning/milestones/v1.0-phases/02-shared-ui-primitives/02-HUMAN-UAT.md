---
status: partial
phase: 02-shared-ui-primitives
source: [02-VERIFICATION.md]
started: 2026-05-19T13:05:00Z
updated: 2026-05-19T13:05:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Tooltip surfacing on hover
expected: Open the dev server and hover any DataCard value in the Mars tab. After ~150ms, a portal tooltip appears containing the Earth-anchored explainer text from constants/tooltips.js (e.g. "Mars' atmosphere is about 0.6% as dense as Earth's — too thin to breathe, thick enough to drive dust storms."). Tooltip auto-positions above the trigger and flips below if clipped.
result: [pending]

### 2. Per-card state independence
expected: Open the Mars demo gallery and observe the DataCard row with mixed states. Wind Speed (state=loading) renders a Tailwind animate-pulse skeleton block while neighbouring Min Temp / Max Temp / Pressure render their real values, and Humidity (state=error) renders the muted italic string "Data temporarily unavailable" — all three states coexist in the same flex row, proving per-card independence (no neighbour blanking).
result: [pending]

### 3. LastUpdated hover behavior
expected: Hover a LastUpdated chip on either tab. Tooltip surfaces an absolute UTC time formatted "HH:MM:SS UTC" (e.g. "14:32:17 UTC"). The em-dash variant (timestamp=undefined) does NOT show a tooltip on hover — it just displays "Last updated: —" with no hover affordance.
result: [pending]

### 4. Cross-tab palette comparison (semantic vs decorative)
expected: Switch between Mars and Moon tabs and visually compare the StatusBadge severities. Low/Moderate/High badges read identically on both tabs — green/amber/red — proving universal severity colors are NOT palette-tinted. DataCard accent rings and LastUpdated dim text DO differ between tabs (mars-accent amber vs moon-accent silver), proving palette is decorative-only as designed. AlertCard event-type badges (indigo CME, orange FLR, fuchsia GST) also read identically on both tabs.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
