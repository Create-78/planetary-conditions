import TooltipWrapper from './TooltipWrapper.jsx'
import LoadingState from './LoadingState.jsx'
import { getTooltip } from '../constants/tooltips.js'

/**
 * DataCard — the workhorse primitive for every data panel in Phases 3 and 4.
 *
 * Layout: label above (small, dim), value below (large, bright), optional unit
 * to the right of the value (smaller, palette-tinted dim). Compact, fixed-min
 * width, flex-shrink-0 so card grids wrap cleanly on narrow viewports.
 *
 * Composition (per 02-CONTEXT locks):
 *   - When `state === 'loading'` → renders <LoadingState /> in the value slot,
 *     no unit, no tooltip.
 *   - When `state === 'error'` → renders the exact muted string
 *     "Data temporarily unavailable" in the value slot, no unit, no tooltip.
 *   - When `state === 'ok'` → renders `value` (em-dash for null/undefined) +
 *     optional unit. If `tooltipKey` resolves via getTooltip, the value+unit
 *     span becomes the trigger inside a <TooltipWrapper>.
 *
 * Palette drives only the accent ring + glow halo and the unit-text dim color.
 * Background stays neutral (space-900) so cards read consistently across tabs.
 *
 * Props:
 *   - label        string (required) — small annotation above the value
 *   - value        string | number | ReactNode — focal value (ignored when state != 'ok')
 *   - unit         string (optional) — rendered after value, palette-tinted dim
 *   - tooltipKey   string (optional) — key into TOOLTIPS via getTooltip
 *   - state        'ok' | 'loading' | 'error' (default 'ok')
 *   - palette      'mars' | 'moon' (required) — drives accent ring + unit dim color
 */

// Base layout — applied in every state.
const BASE_CLASSES =
  'relative flex flex-col gap-2 rounded-lg p-4 min-w-[140px] flex-shrink-0 bg-space-900/60 ring-1 ring-slate-800/60'

// Palette glow rings (verbatim from 02-CONTEXT.md `## Glow / cinematic effects`).
const PALETTE_GLOW = {
  mars:
    ' ring-1 ring-[#f59e0b]/20 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_30px_-15px_rgba(245,158,11,0.25)]',
  moon:
    ' ring-1 ring-[#cbd5e1]/20 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_30px_-15px_rgba(203,213,225,0.20)]',
}

// Palette-tinted dim for the unit text (per `## Visual conventions`).
const PALETTE_UNIT = {
  mars: 'text-mars-accent/70',
  moon: 'text-moon-accent/70',
}

function DataCard({ label, value, unit, tooltipKey, state = 'ok', palette }) {
  const outerClasses = BASE_CLASSES + (PALETTE_GLOW[palette] || '')

  let valueSlot
  if (state === 'loading') {
    valueSlot = <LoadingState />
  } else if (state === 'error') {
    valueSlot = (
      <span className="text-sm text-slate-500 italic">
        Data temporarily unavailable
      </span>
    )
  } else {
    // state === 'ok'
    const displayValue = value === null || value === undefined ? '—' : value
    const unitClass = PALETTE_UNIT[palette] || 'text-slate-500'

    // Single React element so TooltipWrapper.cloneElement has one valid trigger.
    const valueAndUnit = (
      <span className="inline-flex items-baseline">
        <span className="text-3xl font-semibold text-slate-100">
          {displayValue}
        </span>
        {unit ? (
          <span className={`text-base ml-1 ${unitClass}`}>{unit}</span>
        ) : null}
      </span>
    )

    const tip = tooltipKey ? getTooltip(tooltipKey) : null
    valueSlot = tip ? (
      <TooltipWrapper content={tip.text}>{valueAndUnit}</TooltipWrapper>
    ) : (
      valueAndUnit
    )
  }

  return (
    <div className={outerClasses}>
      <span className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="flex items-baseline">{valueSlot}</div>
    </div>
  )
}

export default DataCard
