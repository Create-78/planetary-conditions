import { useState, useEffect } from 'react'

// Safe default: false (animate). Updated in useEffect (after mount) to real OS value.
// Subscribes to 'change' so an OS-setting flip mid-session updates immediately (MOTION-03).
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}
