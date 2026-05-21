/**
 * Tooltip copy — source-of-truth for every hoverable explainer in the app.
 *
 * Naming convention:
 *   Keys are flat, lowercase, and namespaced as `{tab|source}.{datapoint}`.
 *   Examples:
 *     - 'mars.pressure'        — Mars-tab datapoint
 *     - 'swpc.bz'              — NOAA SWPC source-specific
 *     - 'donki.cme'            — NASA DONKI source-specific
 *     - 'lunar.phase'          — Computed lunar context
 *
 * Value shape:
 *   { text: string, source?: string }
 *     - text:   Plain-language explainer. Earth-anchored where it aids understanding.
 *     - source: Optional attribution string (e.g., 'MAAS2 / REMS', 'NOAA SWPC').
 *
 * Phase 2 seeded placeholders demonstrating the Earth-anchored style.
 * Phase 3 added the real mars.* per-datapoint keys (Curiosity REMS).
 * Phase 4 (Moon) added the real lunar.*, swpc.*, donki.* keys.
 *
 * Lookups go through `getTooltip(key)` so missing keys return null instead of crashing.
 */

export const TOOLTIPS = {
  'mars.sol': {
    text:
      'A Martian day (sol) is about 24 hours and 37 minutes — slightly longer than an Earth day.',
    source: 'MAAS2 / Curiosity REMS',
  },
  'mars.earthDate': {
    text:
      'The equivalent Earth calendar date for this Martian sol.',
    source: 'MAAS2 / Curiosity REMS',
  },
  'mars.minTemp': {
    text:
      'Overnight lows at Gale Crater. Mars nights can plunge to -80°C or colder.',
    source: 'MAAS2 / Curiosity REMS',
  },
  'mars.maxTemp': {
    text:
      'Daytime highs. Even the warmest Mars days rarely exceed 0°C at the surface.',
    source: 'MAAS2 / Curiosity REMS',
  },
  'mars.pressure': {
    text:
      "Mars' atmosphere is about 0.6% as dense as Earth's — too thin to breathe, thick enough to drive dust storms.",
    source: 'MAAS2 / Curiosity REMS',
  },
  'mars.windSpeed': {
    text:
      'Average near-surface wind. Mars winds feel gentle despite high speeds due to the thin atmosphere.',
    source: 'MAAS2 / Curiosity REMS',
  },
  'mars.humidity': {
    text:
      'Relative humidity. Mars air is extremely dry — water ice exists but liquid water cannot persist on the surface.',
    source: 'MAAS2 / Curiosity REMS',
  },
  'mars.opacity': {
    text:
      "Describes dust loading in the atmosphere. 'Sunny' means clear skies; 'Dusty' can signal regional or global storms.",
    source: 'MAAS2 / Curiosity REMS',
  },
  'lunar.phase': {
    text:
      "The Moon takes ~29.5 days to complete one cycle. The lunar 'day' (sunrise to sunrise) lasts about 29.5 Earth days.",
    source: 'Computed (lunar phase model)',
  },
  'lunar.surfaceTemp': {
    text:
      'Lunar surface temperatures swing more than 300°C between day and night — the Moon has no atmosphere to moderate temperature.',
    source: 'Computed (lunar phase model)',
  },
  'lunar.dayNight': {
    text:
      'We see the lit half of the Moon based on where it sits relative to the Sun. The dark side faces away from the Sun, not always away from Earth.',
    source: 'Computed (lunar phase model)',
  },
  'swpc.speed': {
    text:
      'The constant flow of charged particles from the Sun. Typical speed is 400–800 km/s. High speeds can intensify radiation at the lunar surface.',
    source: 'NOAA SWPC',
  },
  'swpc.density': {
    text:
      'Number of protons per cubic centimeter. Higher density = stronger interaction with the lunar surface.',
    source: 'NOAA SWPC',
  },
  'swpc.bz': {
    text:
      'When the interplanetary magnetic field points south (negative Bz), it can trigger geomagnetic storms. Strongly negative = elevated radiation risk.',
    source: 'NOAA SWPC',
  },
  'swpc.kp': {
    text:
      'A global measure of geomagnetic disturbance. Kp ≥ 5 = geomagnetic storm conditions.',
    source: 'NOAA SWPC',
  },
  'swpc.radiationRisk': {
    text:
      'Derived from solar wind speed + Kp index. Low = quiet; Moderate = elevated; High = storm-level activity that increases surface radiation at the Moon.',
    source: 'NOAA SWPC',
  },
  'donki.cme': {
    text:
      'Coronal Mass Ejection — a burst of plasma and magnetic field from the Sun. Drives geomagnetic storms days after eruption. At the lunar surface: radiation flux can spike for hours to days.',
    source: 'NASA DONKI',
  },
  'donki.flr': {
    text:
      "Solar Flare — a sudden burst of X-ray/UV radiation from the Sun's surface. At the Moon: instantaneous radiation increase, lasting minutes to hours. Classes M and X are notable; class X is extreme.",
    source: 'NASA DONKI',
  },
  'donki.gst': {
    text:
      "Geomagnetic Storm — large-scale disturbance of Earth's magnetic field caused by solar activity. At the Moon: elevated radiation from trapped energetic particles.",
    source: 'NASA DONKI',
  },
}

/**
 * Safe accessor for tooltip entries.
 * @param {string} key - Namespaced tooltip key, e.g. 'mars.pressure'.
 * @returns {{ text: string, source?: string } | null}
 */
export function getTooltip(key) {
  return TOOLTIPS[key] || null
}
