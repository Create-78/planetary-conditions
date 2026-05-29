import TooltipWrapper from './TooltipWrapper.jsx'
import LoadingState from './LoadingState.jsx'
import Icon from './Icon.jsx'
import { getTooltip } from '../constants/tooltips.js'

/**
 * DataCard — glass stat tile. The workhorse primitive for every data panel.
 *
 * API is unchanged from the original (so the tabs' loading/error/tooltip wiring
 * still works); the redesign adds the frosted-glass treatment plus two optional
 * props: `icon` (a telemetry glyph, top-right) and `sub` (a small caption).
 *
 * State composition (preserved from the original lock):
 *   - state === 'loading' → <LoadingState /> in the value slot, no unit/tooltip
 *   - state === 'error'   → "Data temporarily unavailable", no unit/tooltip
 *   - state === 'ok'      → value (em-dash for null/undefined) + optional unit;
 *                           wrapped in a tooltip when tooltipKey resolves.
 *
 * Props:
 *   - label       string (required)
 *   - value       string | number | ReactNode (ignored unless state === 'ok')
 *   - unit        string (optional)
 *   - icon        Icon name (optional)
 *   - sub         string (optional) — small caption under the value
 *   - tooltipKey  string (optional)
 *   - state       'ok' | 'loading' | 'error' (default 'ok')
 *   - palette     'mars' | 'moon' (required)
 *   - className   appended to the root (e.g. col-span utilities)
 */

const ACCENT = { mars: 'var(--mars-accent)', moon: 'var(--moon-accent)' }

function DataCard({ label, value, unit, icon, sub, tooltipKey, state = 'ok', palette = 'mars', className = '' }) {
  const accent = ACCENT[palette] || ACCENT.mars

  let valueSlot
  if (state === 'loading') {
    valueSlot = <LoadingState />
  } else if (state === 'error') {
    valueSlot = <span className="text-sm text-slate-500 italic">Data temporarily unavailable</span>
  } else {
    const displayValue = value === null || value === undefined ? '—' : value
    const valueAndUnit = (
      <span className="inline-flex items-baseline gap-1.5">
        <span className="stat-num" style={{ fontSize: 32, color: '#f8fafc' }}>{displayValue}</span>
        {unit ? <span className="stat-num" style={{ fontSize: 14, fontWeight: 500, color: accent }}>{unit}</span> : null}
      </span>
    )
    const tip = tooltipKey ? getTooltip(tooltipKey) : null
    valueSlot = tip ? <TooltipWrapper content={tip.text}>{valueAndUnit}</TooltipWrapper> : valueAndUnit
  }

  return (
    <div className={`glass flex flex-col justify-between gap-2.5 ${className}`} style={{ padding: '18px 20px' }}>
      <div className="flex items-center justify-between">
        <span className="telem" style={{ color: 'rgba(241,245,249,0.5)' }}>{label}</span>
        {icon ? <span style={{ color: accent, opacity: 0.8 }}><Icon name={icon} size={15} /></span> : null}
      </div>
      <div className="flex items-baseline">{valueSlot}</div>
      {sub ? <div className="telem" style={{ color: 'rgba(241,245,249,0.4)', letterSpacing: '0.06em' }}>{sub}</div> : null}
    </div>
  )
}

export default DataCard
