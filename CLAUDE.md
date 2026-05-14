# CLAUDE.md

Instructions and context for Claude Code when working on this project.

---

## Project Summary

**Planetary Conditions** is a web app that reports real-time surface and space environment data from Mars and the Moon, pulling from NASA and NOAA data sources. It's designed for students, teachers, and space enthusiasts — a single cinematic dashboard that makes live planetary data accessible and engaging for non-experts.

The name is deliberate: the Moon has no atmosphere, so "weather" would be inaccurate. "Planetary Conditions" is more precise and more interesting.

**Full product spec:** See `Discussion.md` for complete product decisions, architecture, and API specs.

---

## File Structure

```
/
├── CLAUDE.md                      # AI context (this file)
├── README.md                      # Project overview
├── Discussion.md                  # Full product/architecture spec — source of truth
├── GETTING_STARTED.md             # Setup notes
│
├── .planning/                     # GSD workflow artifacts (canonical for build planning)
│   ├── PROJECT.md                 # Living project context
│   ├── REQUIREMENTS.md            # v1 requirements with REQ-IDs + traceability
│   ├── ROADMAP.md                 # 6-phase build plan
│   ├── STATE.md                   # Workflow memory
│   └── config.json                # GSD workflow preferences (YOLO, standard, balanced)
│
├── .claude/                       # Claude Code configuration
│   ├── commands/                  # Slash commands
│   ├── rules/                     # Auto-loaded guidelines
│   ├── skills/                    # Specialized capabilities
│   └── templates/                 # Document templates
│
└── logs/                          # Session tracking
    ├── sessions_log.md
    └── learnings_log.md
```

## GSD Workflow

This project uses the **Get Shit Done (GSD)** workflow. Planning artifacts in `.planning/` are the source of truth for what to build and in what order:

- `.planning/PROJECT.md` — what we're building and why
- `.planning/REQUIREMENTS.md` — every v1 requirement with REQ-ID and phase mapping
- `.planning/ROADMAP.md` — 6 phases (Scaffold → Shared UI → Mars Tab → Moon Tab → Polish → Deploy)
- `.planning/STATE.md` — current workflow state

**Next step:** `/gsd-plan-phase 1` to detail the first phase before execution.

**Common commands:** `/gsd-progress` (where am I?), `/gsd-plan-phase N`, `/gsd-execute-phase N`, `/gsd-next` (auto-route).

---

## In Scope

- Build the Planetary Conditions web app per `Discussion.md` (React + Vite + Tailwind, deployed on Vercel)
- Implement Mars tab (MAAS2 / Curiosity rover data) and Moon tab (NOAA SWPC + NASA DONKI + computed lunar phase)
- React Query hooks with per-source refresh intervals
- Cinematic dark UI with body-specific color palettes (amber/rust for Mars, blue/silver for Moon)
- Tooltip-driven education layer (hover for plain-language explainers with Earth comparisons)
- Per-card loading, error, and "last updated" states

## Out of Scope (v1)

- Mobile-optimized layout (basic responsive baseline only)
- Share / screenshot functionality
- Notifications, alerts, or user accounts
- Perseverance MEDA / NASA PDS direct ingestion (v2)
- LRO Diviner live data ingestion (v2)
- Historical charts / timelines
- Embeddable widget mode
- Backend / server-side proxy (unless DEMO_KEY rate limits force it)
- Hardcoding API keys — always use `VITE_NASA_API_KEY` env var
- Inventing data, fabricating values, or hiding approximations from the user

---

## How to Help

### High-Value Tasks

1. **Scaffold & build the app** — Set up Vite + React + Tailwind, build the component architecture proposed in Discussion.md §5, wire up React Query hooks for each data source.
2. **Implement data panels** — Build `DataCard`, `TooltipWrapper`, `StatusBadge`, `AlertCard`, and per-source hooks (`useMarsData`, `useSolarWind`, `useDonkiEvents`, `useLunarPhase`).
3. **Tooltip & copy quality** — Write/refine plain-language explainers in `constants/tooltips.js` with Earth-anchored comparisons. Accuracy matters: this is an educational product.
4. **Deployment & env setup** — Vercel config, env vars, GitHub auto-deploy verification.
5. **Edge-case handling** — Empty-state copy ("No significant events…"), API failure fallbacks, MAAS2 Content-Type quirk.

### Example Prompts

```
"Scaffold the Vite + React + Tailwind project per Discussion.md"
"Build the Mars tab data panels using the MAAS2 API"
"Write the useSolarWind React Query hook"
"Draft tooltip copy for the Bz (IMF) data point"
"Set up the Vercel deployment with env vars"
```

---

## Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Name: "Planetary Conditions" not "Weather" | Moon has no atmosphere — "weather" would be inaccurate | May 2026 |
| MAAS2/Curiosity over Perseverance MEDA for v1 | NASA PDS pipeline too complex for MVP; MAAS2 returns clean JSON, no key | May 2026 |
| React + Vite + Tailwind + React Query | Fast dev, no backend overhead, clean handling of per-source refresh intervals | May 2026 |
| Vercel deployment | Zero-config GitHub deploys, env vars, free tier sufficient | May 2026 |
| Desktop-first | v1 audience uses dashboards on desktop; mobile is non-broken baseline only | May 2026 |
| Per-card timestamps (not app-level) | Data sources refresh at different rates; trust requires honesty about each | May 2026 |
| Tooltips for education, not body copy | Keep dashboard cinematic; education is opt-in on hover | May 2026 |

---

## Resources

- `Discussion.md` — complete product, design, and architecture spec (source of truth)
- MAAS2 API: https://api.maas2.apollorion.com/
- NOAA SWPC: https://services.swpc.noaa.gov/
- NASA DONKI: https://api.nasa.gov/DONKI/
- NASA API key registration: https://api.nasa.gov

---

## Notes

- API keys are managed via `VITE_NASA_API_KEY` env var. `DEMO_KEY` is acceptable during dev; register a real key for production.
- MAAS2 may return wrong Content-Type — always parse as JSON.
- All four data sources (MAAS2, NOAA SWPC, NASA DONKI) are CORS-open and callable from the client — no proxy needed unless rate limits hit.
- Discussion.md was written May 2026 and is the canonical spec. When in doubt, defer to it. Update it (and note the update here) if product decisions change.
