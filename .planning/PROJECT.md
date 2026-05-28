# Planetary Conditions

## What This Is

Planetary Conditions is a web app that reports real-time surface and space environment data from Mars and the Moon, pulling from NASA and NOAA sources. It's built for students, teachers, and space enthusiasts — a cinematic dashboard that makes live planetary data accessible to non-experts.

The name is deliberate: the Moon has no atmosphere, so "weather" would be inaccurate. "Planetary Conditions" is more precise and more interesting.

## Core Value

A single cinematic dashboard that shows current environmental conditions on Mars and the Moon, sourced from real NASA/NOAA APIs, presented so non-experts find it compelling and accessible. If everything else fails, **the data must be real, current, and clearly explained.**

## Current Milestone: v2.0 Visual Upgrade

**Goal:** Transform the dashboard from a clean data view into a cinematic body portrait — per-body hero images and atmospheric backdrops, motion, and a themed card/typography system — without compromising data legibility.

**Target features:**
- Per-body hero image (layered with a treated full-bleed atmospheric backdrop)
- Motion & transitions (cross-fade on tab switch, hero scroll parallax, reduced-motion respected)
- Card & typography refresh (body-themed design system)
- Reliability carryforward (`useSolarWind` degrades per-card, not per-section)
- Pre-optimized image pipeline (WebP + PNG fallback + LQIP, ≤~300 KB/tab)

**Spec:** `docs/superpowers/specs/2026-05-28-v2-visual-upgrade-design.md`
**Phases:** 7–10 (continues numbering from v1.0). **Out of scope:** mobile polish, new data sources.

## Requirements

### Validated

- ✓ Mars tab — MAAS2/Curiosity REMS data (sol, Earth date, temp, pressure, wind, humidity, opacity) — v1.0
- ✓ Moon tab — Lunar Context (phase, day/night, modeled surface temp) — v1.0
- ✓ Moon tab — Space Weather (NOAA SWPC speed, density, Bz, Kp, derived radiation-risk badge) — v1.0
- ✓ Moon tab — Solar Event Alerts (NASA DONKI CME/Flare/GST, last 7 days) — v1.0
- ✓ Cinematic dark UI with body-specific palettes (amber/rust Mars, blue/silver Moon) — v1.0
- ✓ Tooltip-driven education layer with Earth-anchored explainers — v1.0
- ✓ Per-source "last updated" timestamps per panel — v1.0
- ✓ Per-card loading/error states (no full-page failures) — v1.0
- ✓ React Query hooks with per-source `refetchInterval` (MAAS2 1hr, SWPC 5min, DONKI 15min) — v1.0
- ✓ Vercel deployment with `VITE_NASA_API_KEY` (auto-deploy from `main`) — v1.0

### Active (v2 — Visual Upgrade)

See `docs/superpowers/specs/2026-05-28-v2-visual-upgrade-design.md`.

- [ ] Per-body hero image between toggle and data, layered with an atmospheric backdrop
- [ ] Atmospheric full-bleed body-image backdrop behind each tab (treated for contrast)
- [ ] Motion & transitions — cross-fade on tab switch + gentle hero scroll parallax (reduced-motion respected)
- [ ] Card & typography refresh — body-themed design system
- [ ] Reliability carryforward — `useSolarWind` degrades per-card, not per-section
- [ ] Image pipeline — pre-optimized WebP + PNG fallback + LQIP, ≤~300 KB/tab

### Out of Scope

- Mobile-optimized layout — still desktop-first through v2; responsive baseline only
- Share / screenshot functionality — not essential for value
- Notifications, alerts, push, email — adds backend complexity, defer
- Earth comparison mode as a UI panel — Earth anchoring lives in tooltips
- Perseverance MEDA / NASA PDS direct ingestion — too complex; future upgrade path
- LRO Diviner live data ingestion — no simple JSON API; computed temp model stays
- Historical data charts / timelines — current-state only
- Embeddable widget mode — not core to the audience
- User accounts or preferences — no personalization
- General backend / server-side proxy — **revised v1.0:** a thin Vercel Edge proxy was needed for MAAS2 (it ships no CORS headers); NOAA SWPC + NASA DONKI remain direct client calls. No general backend.
- Hardcoded API keys — always via env var

## Context

- **Source spec:** `Discussion.md` (May 2026) is the canonical product/architecture document. All decisions below trace back to it.
- **Audience:** Educational and enthusiast — not researchers. Accessibility and Earth comparisons matter more than precision.
- **Data realities:**
  - MAAS2 wraps Curiosity REMS, not Perseverance MEDA (MEDA via PDS is too complex for MVP)
  - LRO Diviner has no simple JSON API; lunar surface temp is modeled from phase position in v1
  - MAAS2 is hosted on GitHub Pages and may return wrong Content-Type — always parse as JSON
- **Why this name:** "Weather" would be inaccurate for the Moon (no atmosphere). "Planetary Conditions" is precise and brand-distinctive.
- **Current state (post v1.0, 2026-05-28):** Shipped and live at https://planetary-conditions.vercel.app. 6 phases, 15 plans, ~1,954 LOC (React/Vite/Tailwind/TanStack Query), 211 kB JS bundle. Both tabs render live data end-to-end. `node:test` harness added in v1.0.
- **Known debt carried into v2:** (1) `useSolarWind` blanks the whole Space Weather section on one failed sub-query — fixed in v2 Phase 4; (2) process debt from v1.0 — phases 1–5 human-UAT/verification never formally closed and no nyquist VALIDATION.md (accepted at milestone close; see `v1.0-MILESTONE-AUDIT.md`).

## Constraints

- **Tech stack**: React + Vite + Tailwind + TanStack Query — Fast iteration, clean per-source refresh handling, no backend overhead for MVP
- **Deployment**: Vercel only — Zero-config GitHub deploys, env vars in dashboard, free tier sufficient
- **Env vars**: `VITE_NASA_API_KEY` — NASA DONKI requires a key (`DEMO_KEY` for dev); Vite exposes `VITE_*` to client (acceptable risk for low-sensitivity NASA keys)
- **Data sources**: MAAS2 (no auth), NOAA SWPC (no auth), NASA DONKI (NASA key), computed lunar phase — All CORS-open from the client
- **Refresh cadence**: MAAS2 1hr, SWPC 5min, DONKI 15min, lunar phase static — Per Discussion.md §3 rationale; respect upstream update rates
- **Display rule**: Always show units; never hide approximations; show "Last updated" per source; never leave empty panels without context
- **Platform**: Desktop-first; mobile must not be completely broken (responsive baseline only)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Name: "Planetary Conditions" not "Weather" | Moon has no atmosphere — "weather" would be inaccurate; deliberate brand precision | ✓ Good |
| MAAS2/Curiosity over Perseverance MEDA for v1 | NASA PDS pipeline too complex for MVP; MAAS2 returns clean JSON, no key | ✓ Validated v1.0 — clean JSON; shipped Mars tab |
| React + Vite + Tailwind + React Query | Fast dev, no backend overhead, clean per-source refresh handling | ✓ Validated v1.0 — 1,954 LOC, 211 kB JS bundle |
| Vercel deployment | Zero-config GitHub deploys, env vars, free tier sufficient | ✓ Validated 2026-05-27 — live at https://planetary-conditions.vercel.app (auto-deploy from main verified) |
| Desktop-first | v1 audience uses dashboards on desktop; mobile is non-broken baseline only | ✓ Validated v1.0 — mobile deferred again in v2 |
| Per-card timestamps (not app-level) | Data sources refresh at different rates; trust requires honesty about each | ✓ Validated v1.0 |
| Tooltips for education, not body copy | Keep dashboard cinematic; education is opt-in on hover | ✓ Validated v1.0 |
| Modeled lunar surface temp (not LRO Diviner) | PDS direct access too complex for MVP; phase-based model is honest if labeled as estimate | ✓ Validated v1.0 — labeled "Estimated"; v2 upgrade path is real LRO data |
| Client-side API calls (no proxy) | NASA/NOAA endpoints are CORS-open and key-safe enough for client exposure | ⚠ Partially revised 2026-05-27 — NOAA SWPC + NASA DONKI are CORS-open and called client-side, but MAAS2 lacks CORS headers in prod and now routes through a Vercel Edge proxy (`api/maas2.js`). Rate limits never hit. |
| Skip research phase | Discussion.md already specifies stack, features, architecture, and pitfalls in detail | — Applied to v1.0 init only |
| MAAS2 Edge proxy (v1.0 deviation) | MAAS2 emits no Access-Control-Allow-Origin in prod; anticipated D-13 contingency | ✓ Validated v1.0 — `api/maas2.js`, 1h edge cache |
| Per-endpoint SWPC parsing (v1.0 fix) | NOAA Kp endpoint is array-of-objects (`Kp`), not tabular like plasma/mag | ✓ Validated v1.0 — fixed via `selectLatestKp`, node:test added |
| v2: Layered hero + atmospheric backdrop | Cinematic immersion while keeping data high-contrast | — Pending (v2 Phase 1) |
| v2: Pre-optimized image pipeline (no build dep) | Keep dep-light; commit WebP+PNG+LQIP, source PNGs gitignored | — Pending (v2 Phase 1) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-28 after v1.0 milestone*
