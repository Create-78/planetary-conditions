import marsWebp from '../assets/bodies/mars-1600.webp'
import moonWebp from '../assets/bodies/moon-1600.webp'

// Backdrop reuses the same 1600 WebP as the hero (no separate backdrop asset — D-11).
// CSS filters do all the treatment; rendered via background-image (not <img>) for filter control.
const BACKDROP_ASSETS = {
  mars: marsWebp,
  moon: moonWebp,
}
const BODIES = ['mars', 'moon']

// Two always-mounted body layers cross-fade via opacity (background-image cannot CSS-transition).
// Layers are keyed by body name only — a per-tab remount key would fade in, not cross-fade.
// Transition gated by reducedMotion (MOTION-01/03).
function AtmosphericBackdrop({ activeTab, reducedMotion }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {BODIES.map((body) => (
        <div
          key={body}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${BACKDROP_ASSETS[body]})`,
            backgroundSize: '200%',
            backgroundPosition: 'center',
            filter: 'blur(24px) brightness(35%) saturate(80%)',
            opacity: body === activeTab ? 1 : 0,
            transition: reducedMotion ? 'none' : 'opacity 500ms ease',
          }}
        />
      ))}
      {/* Bottom vignette sits above both layers and does NOT transition — always visible. */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, #020617 0%, transparent 40%)' }}
      />
    </div>
  )
}

export default AtmosphericBackdrop
