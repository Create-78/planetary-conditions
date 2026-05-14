# Planetary Conditions

## What This Is

Planetary Conditions is a web app that reports real-time surface and space environment data from Mars and the Moon, pulling from NASA and NOAA sources. It's built for students, teachers, and space enthusiasts — a cinematic dashboard that makes live planetary data accessible to non-experts.

The name is deliberate: the Moon has no atmosphere, so "weather" would be inaccurate. "Planetary Conditions" is more precise and more interesting.

## Core Value

A single cinematic dashboard that shows current environmental conditions on Mars and the Moon, sourced from real NASA/NOAA APIs, presented so non-experts find it compelling and accessible. If everything else fails, **the data must be real, current, and clearly explained.**

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Mars tab displaying MAAS2/Curiosity REMS data (sol, Earth date, min/max temp, pressure, wind speed, humidity, atmospheric opacity)
- [ ] Moon tab — Lunar Context section (current phase, day/night status, model-based surface temperature estimates)
- [ ] Moon tab — Space Weather section (NOAA SWPC solar wind speed, density, Bz, Kp index, derived radiation risk badge)
- [ ] Moon tab — Solar Event Alerts section (NASA DONKI CME/Flare/GST events, last 7 days)
- [ ] Cinematic dark UI with body-specific color palettes (amber/rust for Mars, blue/silver for Moon)
- [ ] Tooltip-driven education layer with Earth-anchored plain-language explainers on every data point
- [ ] Per-source "last updated" timestamps on each data panel
- [ ] Per-card loading skeletons and error states (no full-page failures)
- [ ] React Query hooks with per-source `refetchInterval` (MAAS2: 1hr, SWPC: 5min, DONKI: 15min)
- [ ] Vercel deployment with `VITE_NASA_API_KEY` env var (auto-deploy from `main`)

### Out of Scope

- Mobile-optimized layout — desktop-first v1; basic responsive baseline only
- Share / screenshot functionality — not essential for v1 value
- Notifications, alerts, push, email — adds backend complexity, defer to v2+
- Earth comparison mode as a UI panel — Earth anchoring lives in tooltips, not as a separate panel
- Perseverance MEDA / NASA PDS direct ingestion — PDS pipeline too complex for MVP; v2 upgrade
- LRO Diviner live data ingestion — same PDS access issue; v1 uses computed temperature model
- Historical data charts / timelines — v1 is current-state only
- Embeddable widget mode — not core to v1 audience
- User accounts or preferences — no personalization in v1
- Backend / server-side proxy — public APIs are CORS-open; add only if DEMO_KEY rate limits hit
- Hardcoded API keys — always via env var

## Context

- **Source spec:** `Discussion.md` (May 2026) is the canonical product/architecture document. All decisions below trace back to it.
- **Audience:** Educational and enthusiast — not researchers. Accessibility and Earth comparisons matter more than precision.
- **Data realities:**
  - MAAS2 wraps Curiosity REMS, not Perseverance MEDA (MEDA via PDS is too complex for MVP)
  - LRO Diviner has no simple JSON API; lunar surface temp is modeled from phase position in v1
  - MAAS2 is hosted on GitHub Pages and may return wrong Content-Type — always parse as JSON
- **Why this name:** "Weather" would be inaccurate for the Moon (no atmosphere). "Planetary Conditions" is precise and brand-distinctive.

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
| MAAS2/Curiosity over Perseverance MEDA for v1 | NASA PDS pipeline too complex for MVP; MAAS2 returns clean JSON, no key | — Pending validation |
| React + Vite + Tailwind + React Query | Fast dev, no backend overhead, clean per-source refresh handling | — Pending |
| Vercel deployment | Zero-config GitHub deploys, env vars, free tier sufficient | — Pending |
| Desktop-first | v1 audience uses dashboards on desktop; mobile is non-broken baseline only | — Pending |
| Per-card timestamps (not app-level) | Data sources refresh at different rates; trust requires honesty about each | — Pending |
| Tooltips for education, not body copy | Keep dashboard cinematic; education is opt-in on hover | — Pending |
| Modeled lunar surface temp (not LRO Diviner) | PDS direct access too complex for MVP; phase-based model is honest if labeled as estimate | — Pending; v2 upgrade path is real LRO data |
| Client-side API calls (no proxy) | NASA/NOAA endpoints are CORS-open and key-safe enough for client exposure | — Pending; revisit if rate limits hit |
| Skip research phase | Discussion.md already specifies stack, features, architecture, and pitfalls in detail | — Decision applies to this init only |

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
*Last updated: 2026-05-14 after initialization*
