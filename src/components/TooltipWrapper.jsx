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
 *   - Esc dismisses; click outside dismisses; focus loss dismisses.
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

  // Clean up any pending open timer on unmount.
  useEffect(() => () => clearOpenTimer(), [clearOpenTimer])

  // Position the tooltip relative to the trigger AFTER it's rendered so we
  // can measure its real size. Default to `side`, flip if it would clip.
  useLayoutEffect(() => {
    if (!isOpen) return
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
    const maxLeft = window.innerWidth - tipRect.width - VIEWPORT_MARGIN
    const left = Math.max(VIEWPORT_MARGIN, Math.min(centeredLeft, maxLeft))

    setPosition({ top, left })
  }, [isOpen, side, content])

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

  const trigger = cloneElement(children, triggerProps)

  const tooltipPortal = isOpen
    ? createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className="fixed z-50 max-w-xs rounded-md bg-space-900/95 px-3 py-2 text-xs text-slate-100 ring-1 ring-slate-700/60 shadow-lg pointer-events-none"
          style={{ top: position.top, left: position.left }}
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
