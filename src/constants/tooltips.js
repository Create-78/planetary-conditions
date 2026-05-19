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
 * Phase 2 seeds placeholders demonstrating the Earth-anchored style.
 * Phase 3 (Mars) and Phase 4 (Moon) will add the real per-datapoint keys.
 *
 * Lookups go through `getTooltip(key)` so missing keys return null instead of crashing.
 */

export const TOOLTIPS = {
  'mars.example': {
    text:
      "Mars' atmosphere is about 0.6% as dense as Earth's — too thin to breathe, thick enough to drive dust storms.",
    source: 'MAAS2 / REMS',
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
