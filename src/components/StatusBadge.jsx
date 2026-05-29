import TooltipWrapper from './TooltipWrapper.jsx'
import { getTooltip } from '../constants/tooltips.js'

/**
 * StatusBadge — pill severity indicator. API unchanged from the original
 * (severity 'low'|'moderate'|'high', label, value, tooltipKey); restyled to
 * the glass `.sev` treatment. Severity colors stay universal (green/amber/red)
 * so risk reads consistently across both tabs.
 */

const SEV_CLASS = { low: 'sev-low', moderate: 'sev-mod', high: 'sev-high' }

function StatusBadge({ severity, label, value, tooltipKey }) {
  const cls = SEV_CLASS[severity] || 'sev-low'
  const badge = <span className={`sev ${cls}`}>{value}</span>

  const tip = tooltipKey ? getTooltip(tooltipKey) : null
  const badgeNode = tip ? <TooltipWrapper content={tip.text}>{badge}</TooltipWrapper> : badge

  return (
    <span className="inline-flex items-center gap-2">
      {label ? <span className="telem" style={{ color: 'rgba(241,245,249,0.5)' }}>{label}</span> : null}
      {badgeNode}
    </span>
  )
}

export default StatusBadge
