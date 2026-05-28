---
status: complete
phase: 06-vercel-deployment
source: [06-02-PLAN.md must_haves, 06-01-SUMMARY.md]
started: 2026-05-27T00:00:00Z
updated: 2026-05-27T02:00:00Z
---

## Current Test

[testing complete]

<!-- prod URL confirmed: https://planetary-conditions.vercel.app -->
production_url: https://planetary-conditions.vercel.app

## Tests

### 1. Production URL loads
expected: Open your production Vercel URL in a browser. The Planetary Conditions UI loads — dark cinematic shell, app title, Mars/Moon tab switcher. Switching tabs works. No blank page, build-error screen, or 404. (DEPLOY-01)
result: pass
note: User confirmed https://planetary-conditions.vercel.app loads fine.

### 2. Mars tab — live MAAS2 data via Edge proxy
expected: On the Mars tab, the Curiosity REMS DataCards render real values with units (temperature, pressure, etc.) — NOT em-dashes or "—". This is the card set that needed the new Vercel Edge proxy (api/maas2.js) to bypass the prod CORS block. In DevTools → Network, a request to `/api/maas2` (same-origin) returns 200. (DEPLOY-03, DEPLOY-04)
result: pass
note: User confirmed all Mars cards display latest data.

### 3. Moon tab — all three sections render live
expected: On the Moon tab, all three sections show real data: (1) lunar context — current phase + modeled temperature, (2) NOAA SWPC solar wind values with the derived radiation-risk badge, (3) recent NASA DONKI solar-event alerts (or a clean "no significant events" empty state). No section is stuck on skeleton/error. (DEPLOY-04)
result: pass
note: Initially failed (solar wind Kp crash — see Gaps). Fixed in 3a5118a; user re-verified live that all three Moon sections render, Kp ≈ 3.3, radiation badge shows.
severity: major (resolved)

### 4. No CORS errors — production fetches succeed
expected: With DevTools → Network + Console open on the production origin, reload. The upstream fetches all return 200: 1 MAAS2 (via /api/maas2 proxy) + 3 NOAA SWPC (plasma, mag, planetary-k-index) + 3 NASA DONKI (CME, FLR, GST). The browser console shows ZERO CORS errors (no "blocked by CORS policy", no "Access-Control-Allow-Origin"). (DEPLOY-03)
result: pass
note: Network panel screenshot — all fetches 200 (maas2, plasma-2-hour, mag-2-hour, noaa-planetary-k-index, CME, FLR, GST). No CORS errors. CRITICAL: solar-wind fetches (plasma 1.9 kB, mag 3.0 kB) return 200 with payload, yet Test 3 section shows "unavailable" → confirms a client-side parse/render bug, not infra. 4 console errors present (root cause).

### 5. DONKI uses the real NASA key (not DEMO_KEY)
expected: In DevTools → Network, the three DONKI requests (CME/FLR/GST) carry `api_key=` set to your registered NASA key — NOT `DEMO_KEY`. They return 200, not 429 (rate-limited). DONKI events load without hitting the demo-key rate cap. (DEPLOY-02)
result: pass
note: DONKI requests show api_key=gMXhnAetu5… (registered key, not DEMO_KEY); all 200, no 429.

### 6. Auto-deploy on push to main
expected: Push any commit to the `main` branch of github.com/Create-78/planetary-conditions. In the Vercel dashboard (Project → Deployments), a new build triggers automatically within ~1 min and reaches "Ready", and the production URL reflects the change. (DEPLOY-01)
result: pass
note: The fix push (3a6b365) auto-triggered a Vercel build that reached Ready; user confirmed.

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0
note: 1 issue found and resolved during the session (solar wind Kp parse — fixed in 3a5118a, re-verified live).

## Gaps

- truth: "Moon tab NOAA SWPC solar-wind section renders live data with the derived radiation-risk badge"
  status: resolved
  fix_commit: 3a5118a
  reason: "User reported: On Moon all displays except space weather solar wind section. It says data temporarily unavailable"
  severity: major
  test: 3
  root_cause: |
    The Kp endpoint (noaa-planetary-k-index.json) returns an ARRAY OF OBJECTS
    (e.g. {"time_tag":...,"Kp":3.33,"a_running":18,"station_count":8}), NOT the
    tabular array-of-arrays that plasma-2-hour.json and mag-2-hour.json return.
    fetchKp routes through the shared fetchTabular + latestObject helpers, which
    assume tabular shape and call headers.map(...). Because `headers` is an object
    for Kp, this throws `TypeError: headers.map is not a function` on EVERY
    response (confirmed by reproduction against live data). The throw sets
    kp.isError = true, and useSolarWind merges isError as
    plasma.isError || mag.isError || kp.isError (useSolarWind.js:129), so the
    single Kp failure flips the ENTIRE Space Weather section to its error state
    even though speed/density/bz are arriving fine (all three NOAA fetches 200).
    Secondary bug: even with correct shape handling, the code reads `kp_index`
    but the real field name is `Kp`.
  artifacts:
    - path: "src/hooks/useSolarWind.js"
      issue: "fetchKp uses tabular fetchTabular/latestObject on an array-of-objects endpoint (throws headers.map is not a function); also reads wrong field name `kp_index` instead of `Kp`"
  missing:
    - "Parse noaa-planetary-k-index.json as an array of objects: take the last (or last non-null) element and read its `Kp` field; coerce via toNumberOrNull"
    - "Keep plasma/mag on the existing tabular path (their shape is unchanged and correct)"
  debug_session: "diagnosed inline during /gsd-verify-work 6 (systematic-debugging); reproduced TypeError against live endpoints"
  proposed_fix: |
    Rewrite fetchKp to not use fetchTabular/latestObject:
      async function fetchKp({ signal } = {}) {
        const response = await fetch(KP_URL, { signal })
        if (!response.ok) throw new Error(`SWPC fetch failed: ${response.status} ${response.statusText}`)
        const payload = await response.json()
        if (!Array.isArray(payload) || payload.length < 2) throw new Error('SWPC Kp response had no data rows')
        // payload is array-of-objects with header object at [0]; walk newest→oldest for non-null Kp
        for (let i = payload.length - 1; i >= 1; i--) {
          if (payload[i] && payload[i].Kp != null) return { kp: toNumberOrNull(payload[i].Kp) }
        }
        return { kp: toNumberOrNull(payload[payload.length - 1]?.Kp) }
      }
