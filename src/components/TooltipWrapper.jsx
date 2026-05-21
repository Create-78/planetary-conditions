import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

// Open delay tuned to feel intentional, not laggy. Close is immediate.
const OPEN_DELAY_MS = 150
const VIEWPORT_MARGIN = 8

// Touch capability is detected once at module load — it does not change at
// runtime in normal browsing (per 05-CONTEXT D-04). Hybrid devices (e.g.
// iPad Pro with mouse) report touch true; the hover/focus desktop path
// still fires on them, so touch behavior is additive (D-07).
const IS_TOUCH =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches))

/**
 * Custom hover/focus tooltip.
 *
 * No external library. Renders the tooltip via a portal anchored to
 * document.body so it isn't clipped by ancestor overflow/transform contexts.
 *
 * Props:
 *   - content:  string | ReactNode — tooltip body. Falsy = pass children through.
 *   - children: a single React element acting as the trigger. We clone it to
 *               attach mouse/focus handlers, a ref, and aria-describedby —
 *               no extra DOM is introduced around the trigger.
 *   - side:     'top' | 'bottom' — default position. Auto-flips if clipped.
 *
 * Behavior:
 *   - 150ms open delay on mouseenter/focus, 0ms close.
 *   - Touch devices: tap toggles tooltip (no open delay) — per 05-CONTEXT D-05.
 *   - Esc dismisses; click outside dismisses; focus loss dismisses.
 *   - Scroll / resize while open: tooltip re-positions to track its trigger
 *     (rAF-debounced, passive scroll, capture phase) — per 05-CONTEXT D-08, D-09.
 *   - Narrow viewports: portal element clamped to max-width min(90vw, 320px)
 *     and horizontal-position math floored at 0 (no negative offsets) —
 *     per 05-CONTEXT D-10, D-11.
 *   - Tooltip element has role="tooltip" and id linked from the trigger's
 *     aria-describedby, so screen readers announce it.
 */
function TooltipWrapper({ content, children, side = 'top' }) {
  const tooltipId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: -9999, left: -9999 })

  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const openTimerRef = useRef(null)

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }, [])

  const open = useCallback(() => {
    clearOpenTimer()
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null
      setIsOpen(true)
    }, OPEN_DELAY_MS)
  }, [clearOpenTimer])

  const close = useCallback(() => {
    clearOpenTimer()
    setIsOpen(false)
  }, [clearOpenTimer])

  // Touch tap-to-toggle is synchronous — no 150ms delay; taps should feel immediate.
  const toggleImmediate = useCallback(() => {
    clearOpenTimer()
    setIsOpen((prev) => !prev)
  }, [clearOpenTimer])

  // Clean up any pending open timer on unmount.
  useEffect(() => () => clearOpenTimer(), [clearOpenTimer])

  // Reusable position calculator — called both from layout effect (on open)
  // and from scroll/resize listeners (while open). Pulled out of the layout
  // effect body so the scroll/resize path doesn't duplicate the math.
  const reposition = useCallback(() => {
    const trigger = triggerRef.current
    const tip = tooltipRef.current
    if (!trigger || !tip) return

    const triggerRect = trigger.getBoundingClientRect()
    const tipRect = tip.getBoundingClientRect()

    const centeredLeft =
      triggerRect.left + triggerRect.width / 2 - tipRect.width / 2

    let top
    if (side === 'bottom') {
      top = triggerRect.bottom + VIEWPORT_MARGIN
      // Flip up if it would clip the bottom edge.
      if (top + tipRect.height > window.innerHeight - VIEWPORT_MARGIN) {
        top = triggerRect.top - tipRect.height - VIEWPORT_MARGIN
      }
    } else {
      top = triggerRect.top - tipRect.height - VIEWPORT_MARGIN
      // Flip down if it would clip the top edge.
      if (top < VIEWPORT_MARGIN) {
        top = triggerRect.bottom + VIEWPORT_MARGIN
      }
    }

    // Clamp horizontally to the viewport so tooltips near edges stay visible.
    // Floor at 0: when the tooltip is wider than the viewport minus margins,
    // maxLeft would otherwise go negative; Math.max(0, ...) keeps the offset
    // safe (per 05-CONTEXT D-11). The inline maxWidth on the portal element
    // (D-10) is what actually shrinks the tooltip in that case.
    const maxLeft = Math.max(0, window.innerWidth - tipRect.width - VIEWPORT_MARGIN)
    const left = Math.max(VIEWPORT_MARGIN, Math.min(centeredLeft, maxLeft))

    setPosition({ top, left })
  }, [side])

  // Position the tooltip relative to the trigger AFTER it's rendered so we
  // can measure its real size. Default to `side`, flip if it would clip.
  useLayoutEffect(() => {
    if (!isOpen) return
    reposition()
  }, [isOpen, content, reposition])

  // Esc to close; click-outside to close.
  useEffect(() => {
    if (!isOpen) return

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        close()
      }
    }
    function onMouseDown(event) {
      const target = event.target
      const inTrigger = triggerRef.current && triggerRef.current.contains(target)
      const inTooltip = tooltipRef.current && tooltipRef.current.contains(target)
      if (!inTrigger && !inTooltip) {
        close()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [isOpen, close])

  // Scroll / resize follow: while the tooltip is open, re-run the positioning
  // logic so the tooltip tracks its trigger instead of floating where the
  // trigger USED to be (per 05-CONTEXT D-08). rAF-debounced to avoid layout
  // thrash during scroll storms (D-09). Passive scroll for perf; capture
  // phase so scroll inside nested scrollers (e.g. DONKI list) also triggers.
  useEffect(() => {
    if (!isOpen) return
    let rafId = null
    const schedule = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        reposition()
      })
    }
    window.addEventListener('scroll', schedule, { passive: true, capture: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule, { capture: true })
      window.removeEventListener('resize', schedule)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [isOpen, reposition])

  // No content? Render the trigger unchanged.
  if (!content) {
    return children
  }

  // Combine our ref with whatever ref the original trigger element had.
  const childRef = children.ref
  const setRef = (node) => {
    triggerRef.current = node
    if (typeof childRef === 'function') {
      childRef(node)
    } else if (childRef && typeof childRef === 'object') {
      childRef.current = node
    }
  }

  const triggerProps = {
    ref: setRef,
    'aria-describedby': isOpen ? tooltipId : undefined,
    onMouseEnter: (event) => {
      open()
      if (children.props.onMouseEnter) children.props.onMouseEnter(event)
    },
    onMouseLeave: (event) => {
      close()
      if (children.props.onMouseLeave) children.props.onMouseLeave(event)
    },
    onFocus: (event) => {
      open()
      if (children.props.onFocus) children.props.onFocus(event)
    },
    onBlur: (event) => {
      close()
      if (children.props.onBlur) children.props.onBlur(event)
    },
  }

  // Touch tap-to-toggle (additive — desktop hover/focus still works on hybrid
  // devices per 05-CONTEXT D-07). Click-outside dismiss is already wired by
  // the existing onMouseDown listener above, so tapping elsewhere closes.
  if (IS_TOUCH) {
    triggerProps.onClick = (event) => {
      toggleImmediate()
      if (children.props.onClick) children.props.onClick(event)
    }
  }

  const trigger = cloneElement(children, triggerProps)

  const tooltipPortal = isOpen
    ? createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className="fixed z-50 max-w-xs rounded-md bg-space-900/95 px-3 py-2 text-xs text-slate-100 ring-1 ring-slate-700/60 shadow-lg pointer-events-none"
          style={{
            top: position.top,
            left: position.left,
            maxWidth: 'min(90vw, 320px)',
          }}
        >
          {content}
        </div>,
        document.body
      )
    : null

  return (
    <>
      {trigger}
      {tooltipPortal}
    </>
  )
}

export default TooltipWrapper
