/**
 * Tooltip copy — source-of-truth for every hoverable explainer in the app.
 *
 * Naming convention:
 *   Keys are flat, lowercase, and namespaced as `{tab|source}.{datapoint}`.
 *   Examples:
 *     - 'mars.pressure'        — Mars-tab datapoint
 *     - 'moon.example'         — Moon-tab datapoint
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
 * Phase 4 (Moon) will add the real moon.*, swpc.*, donki.*, lunar.* keys.
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
  'moon.example': {
    text:
      'The Moon has no atmosphere — daytime surface temperature swings from about +127°C in direct sun to -173°C in shadow.',
    source: 'Computed',
  },
  'swpc.radiationRisk': {
    text:
      'Derived from solar wind speed and Kp index. Low = quiet conditions; High = storm-level activity that elevates surface radiation.',
    source: 'NOAA SWPC',
  },
  'donki.cme': {
    text:
      'Coronal Mass Ejection — a burst of plasma and magnetic field from the Sun. Can drive geomagnetic storms days after eruption.',
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
