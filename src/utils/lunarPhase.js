// src/utils/lunarPhase.js
//
// Lunar phase, day/night status, and surface-temperature model — pure functions.
//
// Algorithm: Julian Date relative to a known reference new moon, modulo the
// synodic month (~29.53 days). No external dependency (astronomia was
// considered and rejected per 04-CONTEXT D-02 — the math is sub-millisecond).
//
// Surface temperature is an estimate, NOT measured data. We interpolate
// cosine-style between the full-sun face (+127°C, phase ≈ 0.5) and the dark
// side (−173°C, phase ≈ 0.0/1.0). LUNAR-04 requires we label this as an
// estimate in the UI; this module returns the number, the UI provides the
// "Estimated surface temp" label.
//
// Source attribution in tooltips: "Computed (lunar phase model)".

// Synodic month — average period between successive new moons.
const SYNODIC = 29.530588853

// Reference new moon: 2000-01-06 18:14 UTC, Julian Date 2451550.1.
const REF_NEW_MOON_JD = 2451550.1

// JS Date → Julian Date. 2440587.5 = JD of Unix epoch (1970-01-01 00:00 UTC).
function julianDate(date) {
  return date.getTime() / 86400000 + 2440587.5
}

// Phase fraction in [0, 1): 0 = new, 0.5 = full.
// Double modulo handles dates before the reference (negative `days`).
function phaseFraction(date) {
  const days = julianDate(date) - REF_NEW_MOON_JD
  return (((days % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC
}

// Eight-name canonical classifier. Quarter and new/full bands are ~2.5% wide
// each (~18 hours either side of exact); gibbous/crescent bands fill the rest.
function phaseName(fraction) {
  if (fraction < 0.025) return 'New Moon'
  if (fraction < 0.235) return 'Waxing Crescent'
  if (fraction < 0.265) return 'First Quarter'
  if (fraction < 0.475) return 'Waxing Gibbous'
  if (fraction < 0.525) return 'Full Moon'
  if (fraction < 0.735) return 'Waning Gibbous'
  if (fraction < 0.765) return 'Last Quarter'
  if (fraction < 0.975) return 'Waning Crescent'
  return 'New Moon'
}

// Short descriptive string for the day/night DataCard value (D-04).
function dayNightStatus(fraction) {
  if (fraction >= 0.40 && fraction <= 0.60) return 'Day side facing Earth'
  if (fraction <= 0.05 || fraction >= 0.95) return 'Night side facing Earth'
  return 'Crescent (partial)'
}

// Cosine interpolation between full-sun face (+127°C) and dark side (-173°C).
// midpoint = (127 + -173) / 2 = -23
// amplitude = (127 - -173) / 2 = 150
// surfaceTemp(0.5) = -23 - 150*cos(π) = -23 + 150 = 127 ✓
// surfaceTemp(0)   = -23 - 150*cos(0) = -23 - 150 = -173 ✓
// surfaceTemp(0.25)= -23 - 150*cos(π/2) = -23 ✓ (midpoint at first quarter)
export function surfaceTemp(fraction) {
  return -23 - 150 * Math.cos(2 * Math.PI * fraction)
}

// Aggregate: one call from useLunarPhase consumes everything.
export function computePhase(date) {
  const fraction = phaseFraction(date)
  return {
    phaseFraction: fraction,
    phaseName: phaseName(fraction),
    dayNightStatus: dayNightStatus(fraction),
    surfaceTempC: surfaceTemp(fraction),
  }
}
