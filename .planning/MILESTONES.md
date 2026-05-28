# Milestones — Planetary Conditions

## v1.0 — MVP ✅

**Shipped:** 2026-05-28 · **Live:** https://planetary-conditions.vercel.app
**Phases:** 6 · **Plans:** 15 · **Commits:** 84 · **src:** ~1,954 LOC (211 kB JS bundle)
**Timeline:** 2026-05-14 → 2026-05-28 (14 days)
**Tag:** v1.0

**Delivered:** A live, cinematic dashboard showing real-time Mars (Curiosity REMS) and Moon (lunar phase, NOAA solar wind, NASA DONKI events) conditions from real NASA/NOAA APIs, with tooltip-driven education and per-card freshness/error states — deployed on Vercel.

**Key accomplishments:**
1. **Scaffold & Shell** — Vite + React + Tailwind cinematic dark shell with Mars/Moon tab switching and a starfield backdrop.
2. **Shared UI primitives** — reusable DataCard, TooltipWrapper, StatusBadge, AlertCard, LastUpdated, LoadingState library.
3. **Mars tab** — live Curiosity REMS surface data (8 DataCards) with units, Earth-anchored tooltips, source attribution, and per-card freshness.
4. **Moon tab** — three sections: lunar context (phase + modeled temp), NOAA SWPC solar wind with a derived radiation-risk badge, and NASA DONKI solar-event alerts.
5. **Reliability & UX polish** — per-card loading/error/no-data states, tooltip repositioning, AbortSignal threading; no full-page failures.
6. **Vercel deployment** — live production with server-side NASA key, auto-deploy from `main`, and a Vercel Edge proxy (`api/maas2.js`) working around MAAS2's missing CORS headers.

**Audit:** `tech_debt` (functionally complete, integration PASS, no functional blockers). See `milestones/v1.0-MILESTONE-AUDIT.md`.

**Known deferred items at close** (see STATE.md → Deferred Items):
- Process debt: phases 1–5 human-UAT (`partial`) and VERIFICATION.md (`human_needed`) never formally closed; no nyquist `VALIDATION.md` in any phase. Accepted on an already-live MVP.
- `useSolarWind` per-section error fragility → scoped as **v2 Phase 4** (reliability carryforward).

**Notable mid-milestone fixes (found via UAT):**
- MAAS2 prod CORS block → Vercel Edge proxy.
- NOAA Kp endpoint shape mismatch (array-of-objects, field `Kp`) crashed the solar wind section → fixed via `selectLatestKp` + `node:test` coverage.
