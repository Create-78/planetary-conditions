import marsWebp from '../assets/bodies/mars-1600.webp'
import moonWebp from '../assets/bodies/moon-1600.webp'

// Backdrop reuses the same 1600 WebP as the hero (no separate backdrop asset — D-11).
// CSS filters do all the treatment; rendered via background-image (not <img>) for filter control.
const BACKDROP_ASSETS = {
  mars: marsWebp,
  moon: moonWebp,
}

function AtmosphericBackdrop({ activeTab }) {
  const src = BACKDROP_ASSETS[activeTab]
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: '200%',
        backgroundPosition: 'center',
        filter: 'blur(24px) brightness(35%) saturate(80%)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, #020617 0%, transparent 40%)' }}
      />
    </div>
  )
}

export default AtmosphericBackdrop
