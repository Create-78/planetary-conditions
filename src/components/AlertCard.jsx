import TooltipWrapper from './TooltipWrapper.jsx'
import { getTooltip } from '../constants/tooltips.js'

/**
 * AlertCard — compact horizontal row for a single space-weather event.
 *
 * Layout (per 02-CONTEXT `## Alert card`):
 *   [event-type badge] [severity (bold) + UTC time (dim) + optional description]   [info icon]
 *
 * Event-type badge colors are neutral / type-specific (indigo CME, orange FLR,
 * fuchsia GST) so severity reads as the primary signal, not the type chrome.
 *
 * Empty-state copy lives in the DONKI feature consumer (Phase 4 §4c), not here.
 *
 * Props:
 *   - eventType    'CME' | 'FLR' | 'GST' (extensible)
 *   - timeUtc      ISO 8601 string — formatted as "DD Mon HH:MM UTC"
 *   - severity     string — e.g. "M2.3", "G2", "Halo CME"
 *   - description  string (optional) — short freeform context line
 *   - tooltipKey   string (optional) — key into TOOLTIPS for the info icon
 */

const EVENT_CLASSES = {
  CME: 'bg-indigo-700/40 text-indigo-200 ring-indigo-500/30',
  FLR: 'bg-orange-700/40 text-orange-200 ring-orange-500/30',
  GST: 'bg-fuchsia-700/40 text-fuchsia-200 ring-fuchsia-500/30',
}

const FALLBACK_EVENT_CLASS = 'bg-slate-700/40 text-slate-200 ring-slate-500/30'

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
  const eventClasses = EVENT_CLASSES[eventType] || FALLBACK_EVENT_CLASS
  const tip = tooltipKey ? getTooltip(tooltipKey) : null

  // The info icon is a static visual affordance — hover (desktop) and tap
  // (touch, per TooltipWrapper IS_TOUCH path) drive the tooltip. No button
  // ARIA role is advertised because we do not implement Enter/Space
  // activation (per 05-CONTEXT D-12 / 02-REVIEW WR-01 — a false ARIA
  // contract is worse than no contract).
  const infoIcon = tip ? (
    <TooltipWrapper content={tip.text}>
      <span
        className="ml-auto text-slate-500 text-xs cursor-help"
        aria-label="More info"
      >
        ⓘ
      </span>
    </TooltipWrapper>
  ) : null

  return (
    <article className="flex items-center gap-3 rounded-md bg-space-900/60 ring-1 ring-slate-800/60 px-3 py-2">
      <span
        className={`rounded-full px-2.5 py-0.5 ring-1 text-[10px] font-bold uppercase tracking-wider ${eventClasses}`}
      >
        {eventType}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-100">{severity}</span>
        <span className="text-xs text-slate-400">{formatUtc(timeUtc)}</span>
        {description ? (
          <span className="text-xs text-slate-300 mt-0.5">{description}</span>
        ) : null}
      </div>
      {infoIcon}
    </article>
  )
}

export default AlertCard
