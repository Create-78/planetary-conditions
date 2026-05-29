/**
 * Gauge — 270° radial dial used for single bounded readings (pressure, Kp).
 *
 * Pure SVG, no dependency. The accent arc + glow are palette-driven; the track
 * is neutral. Renders an em-dash-friendly value: pass a pre-formatted string
 * for `value` and a numeric `fraction` source via min/max + numericValue.
 *
 * Props:
 *   - value         display string/number shown in the center (required)
 *   - numericValue  number used to compute the arc fill (defaults to Number(value))
 *   - min, max      numeric bounds for the arc (default 0..9)
 *   - unit          small label under the value
 *   - band          optional qualitative label (e.g. "Stable", "Quiet")
 *   - accent        arc color (CSS color string)
 *   - size          px (default 176)
 */

function Gauge({ value, numericValue, min = 0, max = 9, unit, band, accent, size = 176 }) {
  const r = size / 2 - 16
  const cx = size / 2
  const cy = size / 2
  const start = 135
  const sweep = 270

  const n = numericValue === undefined ? Number(value) : numericValue
  const frac = Number.isNaN(n) ? 0 : Math.max(0, Math.min(1, (n - min) / (max - min)))

  const polar = (deg) => {
    const a = ((deg - 90) * Math.PI) / 180
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }
  const arc = (a0, a1) => {
    const [x0, y0] = polar(a0)
    const [x1, y1] = polar(a1)
    const large = a1 - a0 > 180 ? 1 : 0
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
  }

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <path d={arc(start, start + sweep)} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="9" strokeLinecap="round" />
        <path
          d={arc(start, start + sweep * frac)}
          fill="none"
          stroke={accent}
          strokeWidth="9"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${accent}88)` }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <span className="stat-num" style={{ fontSize: 40, color: '#f8fafc' }}>{value}</span>
        {unit ? <span className="telem" style={{ color: accent }}>{unit}</span> : null}
        {band ? <span className="telem" style={{ color: 'rgba(241,245,249,0.45)', marginTop: 4 }}>{band}</span> : null}
      </div>
    </div>
  )
}

export default Gauge
