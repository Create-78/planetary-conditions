---
status: partial
phase: 05-reliability-ux-polish
source: [05-VERIFICATION.md]
started: 2026-05-21T17:00:00Z
updated: 2026-05-21T17:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Touch tap-to-toggle on a real touch device
expected: Open the app on an iOS Safari or Android Chrome browser. Tap any DataCard value (e.g., Mars Pressure). Tooltip portal appears immediately (no 150ms hover delay needed for taps). Tap outside the tooltip to dismiss. Tap a second DataCard — its tooltip opens (replaces the first). On a hybrid device (e.g., iPad with mouse), both hover AND tap work additively (per D-07).
result: [pending]

### 2. Scroll/resize tooltip follow
expected: Open a tooltip on the Moon tab. Scroll the page vertically with the wheel/trackpad — the tooltip stays anchored to its trigger (does not stay frozen at original position). Resize the browser window — tooltip repositions to stay in viewport. Open a tooltip inside the DONKI scrollable region; scroll within that nested container — tooltip follows. Animation is smooth (rAF-debounced, no jank).
result: [pending]

### 3. Narrow-viewport tooltip clamp
expected: Resize the browser to ~320px wide (or use DevTools device toolbar at iPhone SE). Open any DataCard tooltip with longer copy (e.g., Pressure or Bz). Tooltip width clamps to `min(90vw, 320px)` — does NOT overflow viewport. The horizontal positioning math guards against negative offsets (Math.max(0,...)).
result: [pending]

### 4. Keyboard navigation + screen reader on DONKI region
expected: Use Tab key to focus the DONKI scrollable region in the Moon tab — a visible focus ring appears (focus-visible:ring-moon-accent). With keyboard focus on the region, press PageDown / arrow keys — the region scrolls. With a screen reader (VoiceOver on macOS, NVDA on Windows), the region is announced as "Recent solar events, region" or equivalent landmark text. Tab and Shift+Tab move through AlertCards and their info icons; pressing Tab to an info icon reveals its tooltip via TooltipWrapper's focus handler.
result: [pending]

### 5. Silent refresh during a real refetch tick
expected: Open the app, leave the Mars tab visible for ~60 seconds. Open DevTools Network panel filtered to api.maas2.apollorion.com. Wait for the 1-hour refetch (or modify the system clock / set a shorter refetchInterval temporarily for testing). When the refetch occurs, the Mars tab DOES NOT flash skeleton loaders. Values update in place silently. Same observation for the Moon tab's SWPC (5min) and DONKI (15min) refetches.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
