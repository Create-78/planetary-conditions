// Number formatters for data displays across Mars and Moon tabs.
//
// Contract: every formatter returns `null` for null/undefined/NaN inputs,
// letting DataCard.jsx render its centralized em-dash fallback (U+2014, '—')
// for the empty state. Centralizing here eliminates the inline duplicates
// that lived in MarsTab.jsx and MoonTab.jsx through Phases 3 and 4
// (per 05-CONTEXT D-16, D-17, D-18).
//
// No external dependencies. Pure functions. Add new variants here when
// additional display formats are needed.

/**
 * Round to nearest integer; em-dash sentinel for null/undefined/NaN.
 * @param {number|string|null|undefined} value
 * @returns {string|null}
 */
export function formatInt(value) {
  if (value === null || value === undefined) return null
  const n = Number(value)
  if (Number.isNaN(n)) return null
  return Math.round(n).toString()
}

/**
 * One-decimal fixed; em-dash sentinel for null/undefined/NaN.
 * @param {number|string|null|undefined} value
 * @returns {string|null}
 */
export function formatOneDecimal(value) {
  if (value === null || value === undefined) return null
  const n = Number(value)
  if (Number.isNaN(n)) return null
  return n.toFixed(1)
}

/**
 * Signed one-decimal: explicit '+' for non-negative values.
 * Used for Bz (IMF south component) where direction matters as much
 * as magnitude. Em-dash sentinel for null/undefined/NaN.
 * @param {number|string|null|undefined} value
 * @returns {string|null}
 */
export function formatSignedDecimal(value) {
  if (value === null || value === undefined) return null
  const n = Number(value)
  if (Number.isNaN(n)) return null
  const fixed = n.toFixed(1)
  return n >= 0 ? `+${fixed}` : fixed
}
