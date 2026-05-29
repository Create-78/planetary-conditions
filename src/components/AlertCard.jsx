import TooltipWrapper from './TooltipWrapper.jsx'
import { getTooltip } from '../constants/tooltips.js'

/**
 * AlertCard — glass feed row for a single space-weather event (NASA DONKI).
 *
 * API unchanged (eventType, timeUtc, severity, description, tooltipKey).
 * Layout: [type badge] [severity (bold) + UTC time + optional description] [ⓘ].
 * Type badge tint is event-specific so severity still reads as the primary
 * signal; the row sits on a faint glass fill consistent with the feed cards.
 */

const TYPE_TINT = {
  CME: { color: '#a5b4fc', bg: 'rgba(99,102,241,0.14)', border: 'rgba(99,102,241,0.32)' },
  FLR: { color: '#fdba74', bg: 'rgba(249,115,22,0.14)', border: 'rgba(249,115,22,0.32)' },
  GST: { color: '#f0abfc', bg: 'rgba(217,70,239,0.14)', border: 'rgba(217,70,239,0.32)' },
  HSS: { color: '#7dd3fc', bg: 'rgba(56,189,248,0.14)', border: 'rgba(56,189,248,0.32)' },
  SEP: { color: '#fcd34d', bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.32)' },
}
const FALLBACK_TINT = { color: '#cbd5e1', bg: 'rgba(148,163,184,0.14)', border: 'rgba(148,163,184,0.3)' }

function formatUtc(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mon = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  return `${dd} ${mon} ${hh}:${mm} UTC`
}

function AlertCard({ eventType, timeUtc, severity, description, tooltipKey }) {
  const tint = TYPE_TINT[eventType] || FALLBACK_TINT
  const tip = tooltipKey ? getTooltip(tooltipKey) : null

  const infoIcon = tip ? (
    <TooltipWrapper content={tip.text}>
      <span className="ml-auto text-slate-500 text-xs cursor-help" aria-label="More info">ⓘ</span>
    </TooltipWrapper>
  ) : null

  return (
    <article
      className="flex items-center gap-4"
      style={{
        padding: '12px 16px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <span
        className="sev"
        style={{ minWidth: 50, justifyContent: 'center', color: tint.color, background: tint.bg, border: `1px solid ${tint.border}` }}
      >
        {eventType}
      </span>
      <div className="flex flex-col">
        <span className="text-[15px] font-semibold text-slate-100">{severity}</span>
        <span className="telem" style={{ color: 'rgba(241,245,249,0.4)', marginTop: 4 }}>{formatUtc(timeUtc)}</span>
        {description ? <span className="text-xs text-slate-300 mt-1">{description}</span> : null}
      </div>
      {infoIcon}
    </article>
  )
}

export default AlertCard
