import { useEffect, useRef } from 'react'

// Pure, testable: parallax pixels = scrollY * speed. Default speed 0.05 → 200px scroll = 10px (MOTION-02).
export function parallaxOffset(scrollY, speed = 0.05) {
  return scrollY * speed
}

export function useScrollParallax({ speed = 0.05, disabled = false, baseTransform = 'translateY(-50%)' } = {}) {
  const ref = useRef(null)
  const ticking = useRef(false)
  const rafHandle = useRef(null)

  useEffect(() => {
    if (disabled || !ref.current) return

    function update() {
      if (ref.current) {
        const py = parallaxOffset(window.scrollY, speed)
        // Compose with baseTransform left-to-right so the -50% center-crop survives (Pitfall 1).
        ref.current.style.transform = `translateY(${py}px) ${baseTransform}`
      }
      ticking.current = false
    }
    function onScroll() {
      if (!ticking.current) {
        rafHandle.current = requestAnimationFrame(update)
        ticking.current = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafHandle.current) cancelAnimationFrame(rafHandle.current)
    }
  }, [disabled, speed, baseTransform])

  return ref
}
