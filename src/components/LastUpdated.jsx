import { useNow } from '../hooks/useNow.js'
import TooltipWrapper from './TooltipWrapper.jsx'

/**
 * LastUpdated — freshness indicator (relative time primary, absolute UTC in tooltip).
 *
 * Re-renders every 30s via the shared `useNow()` ticker so 10 cards on screen
 * share a single setInterval (per Plan 01 hook contract).
 *
 * Display rules (per 02-CONTEXT `## LastUpdated`):
 *   - timestamp null/undefined/invalid → render "—" (em-dash), no tooltip
 *   - otherwise → "<prefix>: <relative>" in DOM, absolute "HH:MM:SS UTC" in tooltip
 *
 * Palette drives only the dim text color (mars/moon accent or neutral slate).
 *
 * Props:
 *   - timestamp   Date | string | null | undefined
 *   - prefix      string — default "Last updated"
 *   - palette     'mars' | 'moon' | 'neutral' — default 'neutral'
 */

const PALETTE_CLASSES = {
  mars: 'text-mars-accent/70',
  moon: 'text-moon-accent/70',
  neutral: 'text-slate-400',
}

function formatRelative(ts, now) {
  if (ts === null || ts === undefined) return '—'
  const d = ts instanceof Date ? ts : new Date(ts)
  if (isNaN(d.getTime())) return '—'
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.round(diffMs / 1000)
  if (diffSec < 30) return 'just now'
  if (diffSec < 90) return '1 min ago'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin} mins ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`
  const diffDay = Math.round(diffHr / 24)
  return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`
}

function formatAbsoluteUtc(ts) {
  if (ts === null || ts === undefined) return null
  const d = ts instanceof Date ? ts : new Date(ts)
  if (isNaN(d.getTime())) return null
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss} UTC`
}

function LastUpdated({ timestamp, prefix = 'Last updated', palette = 'neutral' }) {
  const now = useNow()
  const relative = formatRelative(timestamp, now)
  const absolute = formatAbsoluteUtc(timestamp)
  const paletteClass = PALETTE_CLASSES[palette] || PALETTE_CLASSES.neutral

  const label = (
    <span className={`text-xs ${paletteClass}`}>
      {prefix}: {relative}
    </span>
  )

  if (absolute === null) {
    return label
  }

  return <TooltipWrapper content={absolute}>{label}</TooltipWrapper>
}

export default LastUpdated
