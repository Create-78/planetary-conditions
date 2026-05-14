---
phase: 01-scaffold-shell
plan: 02-shell
subsystem: shell
tags: [shell, tabs, react, tailwind, typography, responsive]
dependency-graph:
  requires:
    - "01-01-scaffold (Vite + React + Tailwind + TanStack Query foundation; mars/moon/space palettes; Inter via CDN)"
  provides:
    - "Two-tab dark cinematic shell wired into src/App.jsx"
    - "src/constants/tabs.js — single source of truth for TABS, TAB_LIST, DEFAULT_TAB"
    - "src/components/TabBar.jsx — palette-aware ARIA tablist (state-only switching)"
    - "src/components/StarField.jsx — fixed-position CSS-only star-field over bg-space-950"
    - "src/tabs/MarsTab.jsx, src/tabs/MoonTab.jsx — empty role=tabpanel placeholders for Phase 3/4"
    - "Inter typography baseline locked at the body level (defends against first-paint FOUT)"
  affects:
    - "Phase 2 (Shared UI Primitives) — tab placeholders are the mount points for DataCards / panels"
    - "Phase 3 (Mars Tab) — MarsTab.jsx is the file to fill in"
    - "Phase 4 (Moon Tab) — MoonTab.jsx is the file to fill in"
tech-stack:
  added: []
  patterns:
    - "State-only tab switching (useState in App, props down to TabBar) — no <a>, no href, no router"
    - "Decorative background isolated to a single CSS-only component (StarField) at z-0; content at z-10"
    - "Tab metadata centralized in src/constants/tabs.js so App.jsx and TabBar.jsx stay in sync"
    - "Palette-aware active styling via a TAB_STYLES lookup keyed by tab.id (mars-700 vs moon-800)"
    - "Responsive layout: TabBar uses flex-col sm:flex-row to give narrow viewports a single-column fallback"
key-files:
  created:
    - "src/constants/tabs.js"
    - "src/components/TabBar.jsx"
    - "src/components/StarField.jsx"
    - "src/tabs/MarsTab.jsx"
    - "src/tabs/MoonTab.jsx"
    - ".planning/phases/01-scaffold-shell/01-02-shell-SUMMARY.md"
  modified:
    - "src/App.jsx (replaced placeholder with real shell)"
    - "src/index.css (appended body font-family + background-color)"
  deleted:
    - "src/components/.gitkeep (intentional — dir now has real content)"
    - "src/constants/.gitkeep (intentional — dir now has real content)"
    - "src/tabs/.gitkeep (intentional — dir now has real content)"
decisions:
  - "Task 3 (human-verify visual checkpoint) auto-approved per session-wide 'no clarifying questions' instruction. Rollback path: git revert 54c4df3 and cc80790 if the visual outcome is not what the user wants."
  - "Removed src/components/.gitkeep, src/constants/.gitkeep, and src/tabs/.gitkeep — they were empty-dir stubs from Plan 01-01 made redundant by the real files this plan added. src/hooks/.gitkeep is preserved (still no real files there)."
  - "StarField rendered as a fixed-position decorative div (z-0) so content (z-10) can scroll without disturbing the texture. Used pointer-events-none and aria-hidden='true' so it never intercepts clicks or screen-reader focus."
  - "TabBar takes activeTab + onTabChange as props instead of owning state. App.jsx owns the state — this keeps the source of truth in one place and makes the upcoming Phase 2 work (sharing 'which tab is active' to child panels) trivial."
  - "Body-level CSS rule applies Inter and space-950 background as a safety net. Tailwind's font-sans handles the React tree, but the body rule covers first paint before React mounts (no flash of serif text, no flash of white background)."
metrics:
  duration_minutes: 1.85
  completed: 2026-05-14T21:06:50Z
  tasks_completed: 3
  files_created: 5
  files_modified: 2
---

# Phase 01 Plan 02: Shell Summary

Built the two-tab dark cinematic shell on top of the Plan 01 scaffold: state-driven tab switching between Mars and Moon, palette-aware active styling, a CSS-only star-field background behind both tabs, Inter typography app-wide, and a responsive max-w-6xl centered layout that collapses to a single column on narrow viewports.

## What Shipped

| File                              | Role                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/constants/tabs.js`           | Single source of truth — `TABS.MARS`, `TABS.MOON`, `TAB_LIST`, `DEFAULT_TAB = 'mars'`      |
| `src/components/StarField.jsx`    | Fixed-position decorative div with five layered radial-gradients at 0.6 opacity over bg-space-950 |
| `src/components/TabBar.jsx`       | ARIA `role="tablist"` nav; two `role="tab"` buttons; palette-aware active styling          |
| `src/tabs/MarsTab.jsx`            | Empty `role="tabpanel"` placeholder — data lands in Phase 3                                |
| `src/tabs/MoonTab.jsx`            | Empty `role="tabpanel"` placeholder — data lands in Phase 4                                |
| `src/App.jsx`                     | Root layout: header, StarField, TabBar, conditional tab render; `useState` holds activeTab |
| `src/index.css`                   | Appended `body { font-family: Inter ...; background-color: #020617 }` for first-paint     |

## Visual Behavior (would-be visible state at end of Task 3)

What the user would see when running `npm run dev` and opening http://localhost:5173/:

- **Background**: deep black (#020617) with a faint, evenly-distributed dot pattern (five layered radial gradients at 0.6 opacity, scaled at 120–200px tiles). Subtle, not loud — the dots do not compete with content.
- **Typography**: "Planetary Conditions" headline in Inter (loaded via the Google Fonts CDN link in `index.html` from Plan 01-01).
- **Header**: `text-3xl md:text-4xl font-bold tracking-tight` headline; smaller subtitle "Real-time surface and space environment data from Mars and the Moon."
- **Tabs (initial state)**: Mars active — `bg-mars-700` (#991b1b) background with `border-mars-accent` (#f59e0b) amber accent border and an amber drop-shadow glow. Moon inactive — muted slate look (`bg-slate-900/60`, `text-slate-400`).
- **Tab switch**: click Moon → instant state change. Moon becomes active with `bg-moon-800` (#1e293b) background and silver `border-moon-accent` (#cbd5e1) border. URL does not change. No spinner, no network call.
- **Active tab content**: a rounded slate panel (`rounded-lg border border-slate-800/60 bg-slate-950/40 backdrop-blur-sm`) containing either the Mars placeholder ("Curiosity rover surface data lands here in Phase 3.") or the Moon placeholder ("Lunar context, solar wind, and event alerts land here in Phase 4.").
- **Responsive**: At desktop width (>=640px), TabBar is horizontal (Mars left, Moon right). At narrow width (~375px), `flex-col sm:flex-row` collapses TabBar to vertical (Mars on top, Moon below). Padding shrinks (`px-4 sm:px-6 md:px-8`, `py-8 md:py-12`). No horizontal scroll.

## Verification Results

| Check                                                                       | Result |
| --------------------------------------------------------------------------- | ------ |
| Task 1 grep checks (file presence, ARIA tokens, palette classes)            | PASS   |
| TabBar has no forbidden tokens (`useState`, `<a `, `href=`, `fetch`, router) | PASS   |
| Task 2 grep checks (App.jsx imports, layout classes, no anchors)            | PASS   |
| `npm run build` exits 0                                                     | PASS   |
| Production bundle                                                           | 174.38 kB JS gzipped 55.45 kB; 9.85 kB CSS gzipped 2.60 kB; 83 modules in ~1.5s |
| `npm run dev` starts cleanly (`Local: http://localhost:5173/`)              | PASS — boots in 212 ms, no errors |
| End-of-plan confirmation build                                              | PASS — same hashes as initial build (deterministic) |

## SHELL Requirements Coverage

| Req      | Status | Evidence                                                                       |
| -------- | ------ | ------------------------------------------------------------------------------ |
| SHELL-01 | DONE   | TabBar renders Mars/Moon with `bg-mars-700` / `bg-moon-800` palette-distinct active styles |
| SHELL-02 | DONE   | `useState` in App.jsx, props-driven TabBar, no `<a>`, no `href=`, no router — instant switch |
| SHELL-03 | DONE   | StarField (`fixed inset-0 z-0 bg-space-950`) with layered radial-gradients     |
| SHELL-04 | DONE   | `font-sans` on App root + `body { font-family: 'Inter', ... }` in index.css    |
| SHELL-05 | DONE   | `max-w-6xl mx-auto`, responsive padding, TabBar `flex-col sm:flex-row` collapse |

## Commits

| Task | Commit    | Summary                                                                                |
| ---- | --------- | -------------------------------------------------------------------------------------- |
| 1    | `cc80790` | feat(01-02): add tab constants, TabBar, StarField, and tab placeholders                |
| 2    | `54c4df3` | feat(01-02): wire App.jsx with tab state, star-field, and Inter typography baseline    |
| 3    | (no code) | Task 3 was a human-verify checkpoint — auto-approved; no code change needed             |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Cleanup] Removed redundant `.gitkeep` files**
- **Found during:** Task 1
- **Issue:** `src/components/.gitkeep`, `src/constants/.gitkeep`, and `src/tabs/.gitkeep` were empty-dir stubs from Plan 01-01. With this plan adding real source files to all three directories, the gitkeeps were redundant and would have been left as untracked oddities.
- **Fix:** `git rm` the three gitkeeps and included the deletions in the Task 1 commit. `src/hooks/.gitkeep` is preserved because that directory remains empty until Phase 3.
- **Files removed:** `src/components/.gitkeep`, `src/constants/.gitkeep`, `src/tabs/.gitkeep`
- **Commit:** `cc80790`

Plan otherwise executed exactly as written — no other auto-fixes, no architectural changes, no scope expansions.

## Auth Gates

None encountered. The shell does not call any APIs; auth-bearing endpoints arrive in Phase 3+ (DONKI).

## Human-Verify Checkpoint Handling

Task 3 (`checkpoint:human-verify`) was auto-approved per the orchestrator's session-wide instruction "Auto-approve any checkpoint:human-verify task by treating it as if the user replied 'approved'." The user can roll back via `git revert cc80790 54c4df3` if they disagree with any visual outcome described in the "Visual Behavior" section above.

What the auto-approval covered (and what would have been visually verified):
- SHELL-03: star-field is subtle and does not visually compete with content (opacity 0.6 over deep-black bg)
- SHELL-04: Inter renders correctly (the Google Fonts CDN preload from Plan 01-01 is already in place)
- SHELL-01 + SHELL-02: Mars active has warm amber-shadow look; Moon active has cool silver-shadow look; click is instant
- SHELL-05: narrow viewport (~375px) collapses TabBar to vertical; no horizontal overflow; tap targets remain clickable

If any of these don't render as described, the fix is local to a single component file (TabBar styles, StarField opacity, or App layout classes) — not a structural change.

## Known Stubs

The two tab placeholders (`MarsTab.jsx`, `MoonTab.jsx`) are intentional stubs:

| Stub                       | File                  | Reason                                                         | Resolved By |
| -------------------------- | --------------------- | -------------------------------------------------------------- | ----------- |
| Mars data placeholder      | `src/tabs/MarsTab.jsx` | Phase 3 owns Mars data wiring per the roadmap                 | Phase 3     |
| Moon data placeholder      | `src/tabs/MoonTab.jsx` | Phase 4 owns Moon data wiring (lunar / SWPC / DONKI sections) | Phase 4     |

Both placeholders document their resolution path inline via JSX comments and visible copy. They are the deliberate "empty but well-framed" state called for in the plan — not blockers and not unfinished work.

## Notes for Phase 2 (Shared UI Primitives)

- **Where to mount cards:** Phase 2's `DataCard`, `LastUpdated`, `LoadingState`, etc., will live under `src/components/`. The current shell renders a single `rounded-lg border border-slate-800/60 bg-slate-950/40` content panel — Phase 3 and Phase 4 should drop card grids inside that panel (or replace it with a tab-specific layout).
- **Where to read active tab:** `activeTab` lives in `src/App.jsx` as `useState` — passed to `TabBar` via props. If Phase 2 needs to expose this to deeply-nested children, the cleanest path is to lift it to a React context in `src/App.jsx` (the same place it already lives). Don't pass through props by hand more than one level deep.
- **Palette tokens available:** `mars-{50,500-900,accent}`, `moon-{50,400-900,accent}`, `space-{900,950}`, plus standard Tailwind `slate-*` for chrome (borders, muted text).
- **Star-field z-index contract:** StarField is at `z-0`. Anything in the main content area is at `z-10`. Phase 2 components should not set their own `z-` classes unless they intentionally want to stack above/below this baseline (e.g., modal overlays).
- **Tab-id source of truth:** `src/constants/tabs.js` exports `TABS.MARS.id` and `TABS.MOON.id` as `'mars'` and `'moon'`. Phase 2/3/4 components that need to know "am I in the Mars panel?" should import these constants — do not hardcode the strings.

## Notes for Phase 3 (Mars Tab)

- `src/tabs/MarsTab.jsx` is the file to edit. The `<section role="tabpanel" aria-label="Mars conditions">` wrapper is already in place — replace the `<h2>` and `<p>` placeholder content with the real data panels.
- Mars active tab is styled in mars-700 / mars-accent (amber). Use `text-mars-50` for high-readability text on the dark mars-tinted backgrounds, and `text-mars-accent` for the amber accent (timestamps, units, source attribution).
- Source attribution ("From Curiosity Rover / REMS instrument") per MARS-10 should live inside `MarsTab.jsx` near the panel header.
- `src/utils/env.js` already exports `NASA_API_KEY` (DEMO_KEY fallback) — though Phase 3 only needs MAAS2 which is keyless, this is the import path for when DONKI shows up in Phase 4.

## Notes for Phase 4 (Moon Tab)

- `src/tabs/MoonTab.jsx` is the file to edit. Identical wrapper pattern to MarsTab.
- Moon active tab is moon-800 / moon-accent (silver). Use `text-moon-50` for body text and `text-moon-accent` for accents.
- Phase 4 has three sub-sections (Lunar Context / SWPC / DONKI). The plan can either render all three inside `MoonTab.jsx` as nested sections or factor each into its own file under `src/tabs/moon/` — that's a Phase 4 decision.

## Self-Check: PASSED

Verified all claimed files exist and both commits are reachable:

- `src/constants/tabs.js` FOUND
- `src/components/TabBar.jsx` FOUND
- `src/components/StarField.jsx` FOUND
- `src/tabs/MarsTab.jsx` FOUND
- `src/tabs/MoonTab.jsx` FOUND
- `src/App.jsx` FOUND
- `src/index.css` FOUND
- `.planning/phases/01-scaffold-shell/01-02-shell-SUMMARY.md` FOUND
- Commit `cc80790` FOUND
- Commit `54c4df3` FOUND
