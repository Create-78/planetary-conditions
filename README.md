# Planetary Conditions

Real-time surface and space environment data from Mars and the Moon — a cinematic, educational dashboard pulling from NASA and NOAA sources, built for students, teachers, and space enthusiasts.

Why not "weather"? The Moon has no atmosphere. "Planetary Conditions" is more precise — and more interesting.

**Live demo:** https://planetary-conditions.vercel.app

---

## Status

| Aspect | Status |
|--------|--------|
| **Overall** | 🟡 In Progress |
| **Phase** | Pre-build — spec complete, scaffold pending |
| **Last Updated** | 2026-05-14 |

---

## Current Priorities

1. [ ] Scaffold Vite + React + Tailwind project
2. [ ] Wire up MAAS2 (Mars) data hook and first data panels
3. [ ] Wire up NOAA SWPC + NASA DONKI hooks for the Moon tab
4. [ ] Implement tooltip system with Earth-anchored explainers
5. [ ] Deploy to Vercel with `VITE_NASA_API_KEY` env var

---

## Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Data:** TanStack Query (React Query) with per-source refresh intervals
- **Deployment:** Vercel (auto-deploy from `main`)
- **APIs:** MAAS2 (Mars/Curiosity), NOAA SWPC (solar wind), NASA DONKI (solar events), computed lunar phase

---

## Deployment

The app deploys to Vercel as a static SPA with auto-deploy from `main`. Vercel auto-detects the Vite framework — no `vercel.json` config needed. Set `VITE_NASA_API_KEY` in the Vercel dashboard (Project → Settings → Environment Variables, Production + Preview scopes).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F<USER>%2Fplanetary-conditions&env=VITE_NASA_API_KEY&envDescription=NASA%20API%20key%20for%20DONKI%20events&envLink=https%3A%2F%2Fapi.nasa.gov%2F)

Full step-by-step instructions: see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Quick Links

- [Product & architecture spec](Discussion.md) — source of truth
- [Claude collaboration context](CLAUDE.md)
- [Getting started](GETTING_STARTED.md)
- [Session log](logs/sessions_log.md)
- [Learnings](logs/learnings_log.md)

---

## Team

| Role | Person |
|------|--------|
| Owner | Will McDermott |

---

## Recent Updates

### 2026-05-14
- Project initialized via `/init`
- CLAUDE.md and README.md populated from `Discussion.md`

---

## Getting Started

1. Read `CLAUDE.md` for AI collaboration context
2. Read `Discussion.md` for the full product and architecture spec
3. Check current priorities above
