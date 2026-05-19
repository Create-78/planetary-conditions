import TooltipWrapper from './TooltipWrapper.jsx'
import { getTooltip } from '../constants/tooltips.js'

/**
 * StatusBadge — pill-shaped severity indicator.
 *
 * Universal severity colors per 02-CONTEXT: green (low), amber (moderate),
 * red (high). NOT palette-tinted — severity must read consistently across
 * Mars/Moon tabs. Body palette is reserved for tab indicators + accent rings.
 *
 * Props:
 *   - severity    'low' | 'moderate' | 'high' (required)
 *   - label       string (optional) — text BEFORE the badge (e.g. "Radiation Risk:")
 *   - value       string (required) — text INSIDE the badge (e.g. "Moderate")
 *   - tooltipKey  string (optional) — wraps badge in TooltipWrapper if lookup non-null
 */

const SEVERITY_CLASSES = {
  low: 'bg-emerald-700/40 text-emerald-200 ring-emerald-500/30',
  moderate: 'bg-amber-700/40 text-amber-200 ring-amber-500/30',
  high: 'bg-red-700/40 text-red-200 ring-red-500/30',
}

function StatusBadge({ severity, label, value, tooltipKey }) {
  const severityClasses =
    SEVERITY_CLASSES[severity] || 'bg-slate-700/40 text-slate-200 ring-slate-500/30'

  const badge = (
    <span
      className={`rounded-full px-3 py-1 ring-1 text-xs font-medium uppercase tracking-wide ${severityClasses}`}
    >
      {value}
    </span>
  )

  const tip = tooltipKey ? getTooltip(tooltipKey) : null
  const badgeNode = tip ? (
    <TooltipWrapper content={tip.text}>{badge}</TooltipWrapper>
  ) : (
    badge
  )

  return (
    <span className="inline-flex items-center gap-2">
      {label ? (
        <span className="text-xs uppercase tracking-wide text-slate-400">
          {label}
        </span>
      ) : null}
      {badgeNode}
    </span>
  )
}

export default StatusBadge
