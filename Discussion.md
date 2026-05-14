# Planetary Conditions — Project Discussion

> Source material for agent build planning. This document captures all product decisions, architecture choices, and API specifications agreed upon with the founder.

---

## 1. Product Overview

**App Name:** Planetary Conditions
**Tagline:** Real-time surface and space environment data from Mars and the Moon.

**Why "Planetary Conditions" not "Weather":** The Moon has no atmosphere, so calling it weather would be inaccurate. "Planetary Conditions" is both more precise and more interesting — a small but deliberate product detail.

**Primary Audience:** Space enthusiasts and educational users (students, educators, curious public).

**Core Value Proposition:** A single cinematic dashboard that shows the current environmental conditions on Mars and the Moon, pulling from real NASA and NOAA data sources, presented in a way that's compelling and accessible to non-experts.

---

## 2. Design Decisions

### Visual Style
- **Dark and cinematic** — deep space aesthetic
- Deep blacks and near-blacks as the base
- **Mars tab:** amber, rust, and red tones
- **Moon tab:** cool blues, silvers, and greys
- Subtle star field background texture
- Glowing data panel aesthetic — think NASA control room meets The Expanse
- Typography: clean, technical sans-serif (e.g., Space Grotesk, Inter, or Geist)

### Platform
- **Desktop-first** for v1
- Mobile is not a priority but should not be completely broken (basic responsive baseline is fine)

### Data Display Format
- Raw numbers with clear units (no approximations hidden from the user)
- **Tooltip on hover** for each data point providing a brief plain-language explainer
  - Example: hovering over "610 Pa" shows "About 0.6% of Earth's atmospheric pressure — too thin to breathe, but enough to create dust storms."
- No dense educational copy cluttering the dashboard itself

### Timestamps
- Each data panel shows a "Last updated: X minutes ago" or exact UTC timestamp
- Different data sources update at different rates — this must be per-source, not a single app-level timestamp

---

## 3. Technical Architecture

### Stack
| Layer | Choice | Rationale |
|---|---|---|
| Framework | React + Vite | Fast dev, component-friendly for data panels, no backend overhead for MVP |
| Styling | Tailwind CSS | Utility-first, easy dark theme, fast iteration |
| Deployment | Vercel | Zero-config deploys from GitHub, env vars in dashboard, free tier sufficient |
| State / Data | React Query (TanStack Query) | Handles periodic refresh, stale-while-revalidate, per-query refresh intervals cleanly |

### Environment Variables
All API keys must be managed as environment variables — never hardcoded.

```
VITE_NASA_API_KEY=DEMO_KEY   # swap for real key post-validation
```

**Note:** Vercel env vars are set in the Vercel dashboard under Project → Settings → Environment Variables. With Vite, env vars prefixed with `VITE_` are exposed to the client bundle. For the MVP this is acceptable (NASA API keys are low-sensitivity). If rate limiting becomes an issue, move to a lightweight serverless proxy (Vercel Edge Function) to keep the key server-side.

### Data Refresh Strategy
Use **React Query** with per-source `refetchInterval` values:

| Data Source | Refresh Interval | Rationale |
|---|---|---|
| MAAS2 (Mars) | 1 hour | Underlying data updates ~once per Martian sol (~24.6 hrs) |
| NOAA SWPC Solar Wind | 5 minutes | Feed updates frequently; most relevant for space weather |
| NASA DONKI (CME/Flares) | 15 minutes | Events catalogued with some delay; 15 min is adequate |
| Lunar Phase Calculation | Static/computed | Pure math, no API needed |

---

## 4. App Structure

### Tab Layout
Two top-level tabs:
1. **Mars** — Surface environmental conditions from Curiosity rover
2. **Moon** — Lunar surface context + space weather environment

Tab switcher should be prominent, styled to match each body's color palette (warm for Mars, cool for Moon).

### Mars Tab — Data Panels

**Primary Data Source:** MAAS2 API (wraps NASA REMS/Curiosity data in clean JSON)
- Endpoint: `https://api.maas2.apollorion.com/` (returns latest sol)
- Specific sol: `https://api.maas2.apollorion.com/{sol_number}`
- No API key required
- Content-Type note: MAAS2 is hosted on GitHub Pages and may return wrong Content-Type header — treat all responses as `application/json`

**⚠️ Important Data Source Note:** MAAS2 wraps data from the **Curiosity rover** (REMS instrument), not Perseverance (MEDA). The original architecture proposed Perseverance MEDA via NASA PDS as primary, but the PDS data pipeline is complex and not readily accessible as a simple JSON API. For v1, use MAAS2/Curiosity as the data source. The UI can label the source transparently ("From Curiosity Rover / REMS instrument"). Perseverance MEDA via PDS can be a v2 upgrade when direct PDS ingestion is scoped.

**Data Points to Display:**

| Field | API Key | Unit | Tooltip Content |
|---|---|---|---|
| Sol (Martian Day) | `sol` | Sol # | "A Martian day (sol) is about 24 hours and 37 minutes — slightly longer than an Earth day." |
| Earth Date | `terrestrial_date` | Date | "The equivalent Earth calendar date for this Martian sol." |
| Min Temperature | `min_temp` | °C | "Overnight lows at Gale Crater. Mars nights can plunge to -80°C or colder." |
| Max Temperature | `max_temp` | °C | "Daytime highs. Even the warmest Mars days rarely exceed 0°C at the surface." |
| Atmospheric Pressure | `pressure` | Pa | "Mars' atmosphere is about 0.6% as dense as Earth's — too thin to breathe, thick enough to drive dust storms." |
| Wind Speed | `wind_speed` | m/s | "Average near-surface wind. Mars winds feel gentle despite high speeds due to the thin atmosphere." |
| Humidity | `humidity` | % | "Relative humidity. Mars air is extremely dry — water ice exists but liquid water cannot persist on the surface." |
| UV Index / Opacity | `atmo_opacity` | Categorical | "Describes dust loading in the atmosphere. 'Sunny' means clear skies; 'Dusty' can signal regional or global storms." |

### Moon Tab — Data Panels

The Moon tab has three distinct sub-sections:

---

#### 4a. Lunar Context (Computed / Static Model)

**Lunar Day/Night Status**
- Computed from current lunar phase using standard astronomical calculations (no API needed)
- Libraries: `astronomia` npm package or manual calculation from Julian Date
- Display: Current phase name (New Moon, Waxing Crescent, etc.), phase percentage, and a simple day/night indicator
- Tooltip: "The Moon takes ~29.5 days to complete one cycle. The lunar 'day' (sunrise to sunrise) lasts about 29.5 Earth days."

**Approximate Surface Temperature (Model-Based)**
- LRO Diviner data is not available as a simple live JSON API — it requires PDS archive access
- For v1: Use a simplified temperature model based on lunar phase:
  - Lunar noon (full sun): ~+127°C
  - Lunar midnight (dark side): ~-173°C
  - Interpolate based on current phase position
- Display with appropriate uncertainty framing: "Estimated surface temp (daytime face)" and "Estimated surface temp (nightside)"
- Tooltip: "Lunar surface temperatures swing more than 300°C between day and night — the Moon has no atmosphere to moderate temperature."
- **v2 upgrade path:** Direct LRO Diviner PDS data ingestion for actual measured temps

---

#### 4b. Space Weather — Solar Wind (NOAA SWPC)

**Primary Data Source:** NOAA SWPC Services JSON (no API key required, public)

Key endpoints:
- Solar wind plasma: `https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json`
- Solar wind magnetic field: `https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json`
- Geomagnetic K-index: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json`

**Data Points to Display:**

| Field | Source | Unit | Tooltip |
|---|---|---|---|
| Solar Wind Speed | SWPC plasma | km/s | "The constant flow of charged particles from the Sun. Typical speed is 400–800 km/s. High speeds can intensify radiation at the lunar surface." |
| Solar Wind Density | SWPC plasma | p/cm³ | "Number of protons per cubic centimeter. Higher density = stronger interaction with the lunar surface." |
| Bz (IMF South component) | SWPC mag | nT | "When the interplanetary magnetic field points south (negative Bz), it can trigger geomagnetic storms. Strongly negative = elevated radiation risk." |
| Kp Index | SWPC Kp | 0–9 scale | "A global measure of geomagnetic disturbance. Kp ≥ 5 = geomagnetic storm conditions." |

**Radiation Risk Level:** Derive a simple 3-level indicator (Low / Moderate / High) from solar wind speed + Kp index for the educational audience. Show as a colored badge.

---

#### 4c. Solar Event Alerts (NASA DONKI)

**Primary Data Source:** NASA DONKI API (requires NASA API key — use DEMO_KEY)

Key endpoints:
- CME events: `https://api.nasa.gov/DONKI/CME?startDate={7_days_ago}&api_key={KEY}`
- Solar flares: `https://api.nasa.gov/DONKI/FLR?startDate={7_days_ago}&api_key={KEY}`
- Geomagnetic storms: `https://api.nasa.gov/DONKI/GST?startDate={7_days_ago}&api_key={KEY}`

**Display:** A scrollable list of recent events (last 7 days), styled as alert cards:
- Event type badge (CME / Flare / Geomagnetic Storm)
- Event time (UTC)
- Severity/class (e.g., flare class M2.3, storm class G2)
- Tooltip explaining what each event type means for lunar surface radiation

If no events in the last 7 days: show "No significant events in the past 7 days — conditions are calm." (Never show an empty panel without context.)

---

## 5. Component Architecture (Suggested)

```
src/
├── App.jsx                    # Root, tab state
├── components/
│   ├── TabBar.jsx             # Mars / Moon switcher
│   ├── DataCard.jsx           # Reusable card with label, value, unit, tooltip
│   ├── TooltipWrapper.jsx     # Hover tooltip component
│   ├── StatusBadge.jsx        # Colored badge (e.g., Radiation: Low/Moderate/High)
│   ├── AlertCard.jsx          # DONKI event alert card
│   ├── LastUpdated.jsx        # "Last updated X mins ago" display
│   └── LoadingState.jsx       # Skeleton loader for data panels
├── tabs/
│   ├── MarsTab.jsx
│   └── MoonTab.jsx
├── hooks/
│   ├── useMarsData.js         # React Query hook for MAAS2
│   ├── useSolarWind.js        # React Query hook for NOAA SWPC
│   ├── useDonkiEvents.js      # React Query hook for NASA DONKI
│   └── useLunarPhase.js       # Pure computation hook, no API
├── utils/
│   ├── lunarPhase.js          # Lunar phase and temperature model
│   ├── radiationRisk.js       # Kp + solar wind → risk level calc
│   └── formatters.js          # Date, unit, number formatting
└── constants/
    └── tooltips.js            # All tooltip copy in one place
```

---

## 6. Key UX Details

- **Loading states:** Each data card should show a skeleton loader independently — don't block the whole tab on one API call
- **Error states:** If an API fails, show "Data temporarily unavailable" per card, not a full-page error
- **No empty panels:** Every panel should have a meaningful state for loading, error, and no-data conditions
- **Timestamps are mandatory:** Every data section must show when it was last fetched — this is a trust signal for users
- **Units:** Always show units (°C, Pa, km/s, nT) — never bare numbers
- **Earth comparisons in tooltips:** Where relevant, anchor Martian/lunar values to an Earth equivalent (e.g., Mars pressure vs. Earth pressure) — this is the educational hook

---

## 7. v1 Scope Boundary (What is NOT in v1)

The following are explicitly out of scope for the initial build:

- Mobile-optimized layout
- Share / screenshot functionality
- Notifications or alerts (push or email)
- Earth comparison mode as a UI panel
- Perseverance MEDA / NASA PDS direct data ingestion
- LRO Diviner live data ingestion
- Historical data charts or timelines
- Embeddable widget mode
- User accounts or preferences
- Any backend / server-side proxy (unless DEMO_KEY rate limits force it)

---

## 8. Deployment Checklist

- [ ] GitHub repo initialized
- [ ] Vite + React scaffolded
- [ ] Tailwind CSS configured
- [ ] Vercel project connected to GitHub repo
- [ ] `VITE_NASA_API_KEY=DEMO_KEY` set in Vercel environment variables
- [ ] Vercel auto-deploy on push to `main` confirmed
- [ ] CORS confirmed on all API endpoints (MAAS2, NOAA SWPC, NASA DONKI are all public/CORS-open)

---

## 9. API Quick Reference

| Source | Endpoint | Auth | Refresh |
|---|---|---|---|
| MAAS2 (Mars/Curiosity) | `https://api.maas2.apollorion.com/` | None | 1 hr |
| NOAA SWPC Plasma | `https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json` | None | 5 min |
| NOAA SWPC Mag Field | `https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json` | None | 5 min |
| NOAA SWPC Kp Index | `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json` | None | 5 min |
| NASA DONKI CME | `https://api.nasa.gov/DONKI/CME?startDate={date}&api_key={KEY}` | NASA Key | 15 min |
| NASA DONKI Flares | `https://api.nasa.gov/DONKI/FLR?startDate={date}&api_key={KEY}` | NASA Key | 15 min |
| NASA DONKI Storms | `https://api.nasa.gov/DONKI/GST?startDate={date}&api_key={KEY}` | NASA Key | 15 min |
| Lunar Phase | Computed (astronomia or manual Julian Date math) | None | Static |

**NASA API Key:** Use `DEMO_KEY` for development. Register at [api.nasa.gov](https://api.nasa.gov) for a free production key (1,000 req/hr per IP). Store as `VITE_NASA_API_KEY` in `.env` and Vercel dashboard.

---

*Document created: May 2026. Ready for agent build planning.*
