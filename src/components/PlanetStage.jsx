import marsLarge from '../assets/bodies/mars-large.jpg'
import moonLarge from '../assets/bodies/moon-large.jpg'

/**
 * PlanetStage — full-bleed crisp planet backdrop for the home page.
 *
 * Replaces the Phase-2 blurred AtmosphericBackdrop + glass-panel pattern with
 * a single cinematic stage: the sharp NASA render rises from the lower frame,
 * tonal overlays keep the header legible and darken the card zone, and the tab
 * content (a bento grid) floats over the planet via the `children` slot.
 *
 * Image framing (per design review):
 *   - Mars (full sphere on a flat #191919 backdrop): stage background is set to
 *     that SAME #191919 so the raised sphere blends with zero seam.
 *   - Moon (crescent on near-black): stage keeps the deep-space radial gradient,
 *     which matches the image's black edges.
 *   The vertical position is `background-position: center <posY>px`; defaults
 *   below were signed off in review (Mars 250, Moon −110).
 *
 * Props:
 *   - activeTab  'mars' | 'moon'
 *   - posY       optional override for the planet's vertical position (px)
 *   - children   the tab content rendered above the planet
 */

const CONFIG = {
  mars: { img: marsLarge, size: '1460px auto', defY: 250, bg: '#191919' },
  moon: {
    img: moonLarge,
    size: '1820px auto',
    defY: -110,
    bg: 'radial-gradient(125% 85% at 50% 2%, #0d1019 0%, #06070d 55%, #020308 100%)',
  },
}

function PlanetStage({ activeTab, posY, children }) {
  const cfg = CONFIG[activeTab] || CONFIG.mars
  const top = posY === undefined ? cfg.defY : posY

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: cfg.bg }}>
      {/* crisp planet */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${cfg.img})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: cfg.size,
          backgroundPosition: `center ${top}px`,
        }}
      />
      {/* tonal overlays: darken header band + clear center + card-zone scrim */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(4,5,10,0.82) 0%, rgba(4,5,10,0.18) 20%, rgba(4,5,10,0) 36%, rgba(4,5,10,0.28) 70%, rgba(4,5,10,0.82) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{ boxShadow: 'inset 0 0 260px 60px rgba(0,0,0,0.72)' }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default PlanetStage
