// src/utils/radiationRisk.js
//
// Derived Radiation Risk severity for the Moon tab's Space Weather section.
//
// IMPORTANT: This is an educational heuristic, NOT a scientific risk
// model. Real lunar radiation risk depends on many factors (SEP events,
// solar zenith angle, surface regolith shielding, etc.). The thresholds
// below give the v1 audience a Low / Moderate / High signal that tracks
// loosely with NOAA SWPC's geomagnetic storm scale — enough to make
// space-weather data tangible, not enough to plan an EVA.
//
// Thresholds (per 04-CONTEXT D-15):
//   - high     : kp >= 5 (storm) OR speed >= 700 km/s (fast solar wind)
//   - moderate : kp >= 3 (elevated) OR speed >= 500 km/s
//   - low      : everything else (quiet)
//   - null     : either input is missing — caller renders no badge
//
// Source attribution in tooltips: "NOAA SWPC" (the inputs are SWPC data).
// Tooltip key: 'swpc.radiationRisk'.

export function deriveRadiationRisk({ speed, kp }) {
  if (speed == null || kp == null) return null
  if (kp >= 5 || speed >= 700) return 'high'
  if (kp >= 3 || speed >= 500) return 'moderate'
  return 'low'
}
