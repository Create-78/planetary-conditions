---
phase: 06-vercel-deployment
plan: 02
subsystem: infra
tags: [vercel, deployment, github, cors, edge-function, noaa-swpc, react-query]

# Dependency graph
requires:
  - phase: 06-vercel-deployment (06-01)
    provides: "Hygiene-clean repo, DEPLOYMENT.md runbook, README deploy button"
  - phase: 04-moon-tab-three-sub-sections
    provides: "useSolarWind hook (the Kp parse bug fixed here originated in Phase 4)"
provides:
  - "Live production deployment at https://planetary-conditions.vercel.app (auto-deploy from main)"
  - "Vercel Edge proxy (api/maas2.js) working around MAAS2's missing CORS headers in prod"
  - "Fixed NOAA Kp parse (solar wind section renders end-to-end)"
  - "node:test harness + npm test script (zero new deps)"
  - "DEPLOY-01..04 validated; README/PROJECT/REQUIREMENTS updated"
affects: [future deployment milestones, any phase touching useSolarWind or NOAA SWPC parsing]

# Tech tracking
tech-stack:
  added: []  # no runtime deps; node:test is built in
  patterns:
    - "Vercel Edge Function proxy for CORS-less upstreams (api/maas2.js)"
    - "Per-endpoint parse strategy in useSolarWind: tabular for plasma/mag, object-array for Kp"
    - "node:test unit tests for pure parse helpers (npm test → node --test)"

key-files:
  created:
    - "api/maas2.js (prior session — MAAS2 Edge proxy)"
    - "src/hooks/useSolarWind.test.js (Kp parse coverage)"
    - ".planning/phases/06-vercel-deployment/06-HUMAN-UAT.md"
  modified:
    - "src/hooks/useSolarWind.js (selectLatestKp; fetchKp rewritten)"
    - "src/hooks/useMarsData.js (prior session — same-origin /api/maas2)"
    - "vite.config.js (prior session — dev proxy parity)"
    - "package.json (test script)"
    - "README.md (live demo URL)"
    - ".planning/PROJECT.md (Vercel decision validated; client-side-proxy decision revised)"
    - ".planning/REQUIREMENTS.md (DEPLOY-01..04 complete)"

key-decisions:
  - "MAAS2 routed through a Vercel Edge proxy (api/maas2.js) because it emits no Access-Control-Allow-Origin header — the D-13 contingency the planner anticipated. Revises the original 'client-side, no proxy' decision for MAAS2 only."
  - "Kp endpoint parsed as an array-of-objects (field `Kp`), separate from the tabular plasma/mag path — the shared tabular helper threw on it."
  - "Added node:test (built-in) rather than vitest to keep zero new dependencies."

patterns-established:
  - "Edge proxy pattern for any future CORS-less upstream"
  - "UAT-driven bug discovery → systematic-debugging → TDD fix → push (auto-deploy re-verifies)"

requirements-completed: [DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04]

# Metrics
duration: ~spanned 2 sessions
completed: 2026-05-27
---

# Phase 6 Plan 2: Vercel Deployment Summary

**Planetary Conditions is live at https://planetary-conditions.vercel.app — auto-deploying from main with a server-side NASA key, a MAAS2 Edge proxy working around prod CORS, and a UAT-found NOAA Kp parse bug fixed so both tabs render end-to-end.**

## Performance

- **Completed:** 2026-05-27
- **Tasks:** User-gated deploy (GitHub push, Vercel import, env var, smoke test) + Task 7 docs sweep + 1 UAT-found bug fix
- **Note:** Executed across two sessions — initial deploy + MAAS2 CORS fix in a prior session; verification (UAT), the Kp fix, and the docs sweep in this session.

## Accomplishments
- **Production deploy live:** `https://planetary-conditions.vercel.app`, auto-deploy on push to `main` confirmed (DEPLOY-01).
- **Server-side NASA key:** DONKI requests use the registered key (`api_key=gMX…`), not `DEMO_KEY`; no 429s (DEPLOY-02).
- **CORS verified:** All upstream fetches return 200 with zero console CORS errors (DEPLOY-03). MAAS2 required a Vercel Edge proxy (`api/maas2.js`) because it ships no CORS header in prod.
- **Both tabs live end-to-end:** Mars (8 REMS cards) and Moon (lunar context + solar wind + DONKI) all render real data (DEPLOY-04) — after fixing the solar wind Kp parse.
- **Docs sweep (Task 7):** README live-demo URL set; PROJECT.md Vercel decision → Validated; REQUIREMENTS.md DEPLOY-01..04 → Complete.

## Task Commits
1. **MAAS2 Edge proxy (prior session)** — `2c1d863` (fix)
2. **NOAA Kp parse fix + node:test** — `3a5118a` (fix, TDD)
3. **Phase 6 UAT record** — `3a6b365` (test)
4. **Task 7 docs sweep + this summary** — committed after this file (docs)

## Files Created/Modified
- `api/maas2.js` — Vercel Edge proxy re-emitting MAAS2 JSON with `access-control-allow-origin: *` (prior session).
- `src/hooks/useSolarWind.js` — new `selectLatestKp()`; `fetchKp` rewritten to parse the array-of-objects Kp shape directly.
- `src/hooks/useSolarWind.test.js` — node:test coverage for Kp parse + regression for the `headers.map` crash.
- `package.json` — `npm test` → `node --test "src/**/*.test.js"`.
- `README.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md` — deployment status finalized.

## Decisions Made
- **MAAS2 Edge proxy over pure client-side fetch** — MAAS2 lacks CORS headers in prod; the proxy (cached 1h, stale-while-revalidate 24h) is the cleanest fix and was an anticipated contingency (D-13). The "client-side, no proxy" project decision is now accurate only for NOAA SWPC + NASA DONKI.
- **node:test over vitest** — zero new dependencies for a single pure-function test.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] MAAS2 CORS block in production (prior session)**
- **Found during:** First production smoke test
- **Issue:** `api.maas2.apollorion.com` emits no `Access-Control-Allow-Origin`, so direct browser fetches from the Vercel origin were blocked — Mars cards blank in prod.
- **Fix:** Added `api/maas2.js` Edge Function proxy; `useMarsData` now fetches same-origin `/api/maas2`; `vite.config.js` dev proxy mirrors it.
- **Verification:** Mars cards render in prod; `/api/maas2` returns 200, no CORS error.
- **Committed in:** `2c1d863`

**2. [Rule 3 - Blocking] NOAA Kp parse crash blanked the whole solar wind section (this session, found via UAT Test 3)**
- **Found during:** `/gsd-verify-work 6`, Test 3 (Moon tab)
- **Issue:** `noaa-planetary-k-index.json` returns an array-of-objects (`{…,"Kp":3.33,…}`), not the tabular array-of-arrays of plasma/mag. `fetchKp` reused the tabular helper, which calls `headers.map(...)` and threw `TypeError: headers.map is not a function` on every response → `kp.isError = true` → the merged `swpc.isError` blanked the entire Space Weather section even though speed/density/Bz were fine. Secondary: code read `kp_index`, real field is `Kp`.
- **Fix:** New exported `selectLatestKp()` parses the object-array (walks newest→oldest for non-null `Kp`); `fetchKp` rewritten to use it. Plasma/Mag tabular path untouched. TDD: failing node:test first, then fix.
- **Verification:** `npm test` 3/3 green; `npm run build` green; user re-verified live (Kp ≈ 3.3, radiation badge visible).
- **Committed in:** `3a5118a`

---

**Total deviations:** 2 auto-fixed (both blocking, both CORS/parse robustness). 
**Impact on plan:** Both essential for the "both tabs live end-to-end" goal. The MAAS2 proxy revised one architecture decision (documented). No scope creep.

## Issues Encountered
- The plan's `must_haves` assumed all data sources were CORS-open and all SWPC endpoints tabular. Reality: MAAS2 needed a proxy, and the Kp endpoint uses a different JSON shape. Both surfaced only against live prod data — exactly what UAT is for.

## User Setup Required
Completed by the user during execution: GitHub repo (`github.com/Create-78/planetary-conditions`), Vercel project import, `VITE_NASA_API_KEY` set in the Vercel dashboard, and the live smoke test. See [DEPLOYMENT.md](../../../DEPLOYMENT.md).

## Next Phase Readiness
- Milestone v1.0 goal met: live production dashboard, both tabs rendering real data, auto-deploy working.
- Ready for `/gsd-complete-milestone`.
- v2 candidates noted: harden `useSolarWind` so one failed sub-query no longer blanks the whole section; Perseverance MEDA / LRO Diviner ingestion (already in Out of Scope).

---
*Phase: 06-vercel-deployment*
*Completed: 2026-05-27*
