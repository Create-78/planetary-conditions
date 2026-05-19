import { useEffect, useState } from 'react'

/**
 * Shared 30-second ticker.
 *
 * All consumers share a single module-level interval so 10 LastUpdated cards
 * on screen don't each spin up their own timer and drift apart.
 *
 * Mechanism:
 *   - One module-level `now` value, one Set of listener setters.
 *   - The interval starts lazily on the first subscribe and is cleared when
 *     the last subscriber unmounts (reference-counted teardown).
 *   - On each tick the module updates `now` and notifies every listener with
 *     the same Date instance, keeping all consumers in lockstep.
 *
 * Returns the current Date. Consumers re-render every 30s.
 */

const TICK_MS = 30000

let now = new Date()
const listeners = new Set()
let intervalId = null

function startInterval() {
  if (intervalId !== null) return
  intervalId = setInterval(() => {
    now = new Date()
    for (const listener of listeners) {
      listener(now)
    }
  }, TICK_MS)
}

function stopInterval() {
  if (intervalId === null) return
  clearInterval(intervalId)
  intervalId = null
}

export function useNow() {
  const [value, setValue] = useState(now)

  useEffect(() => {
    listeners.add(setValue)
    startInterval()

    // Realign this consumer to the shared `now` on subscribe — covers the
    // edge case where the module-level value advanced between renders.
    if (value !== now) {
      setValue(now)
    }

    return () => {
      listeners.delete(setValue)
      if (listeners.size === 0) {
        stopInterval()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return value
}
