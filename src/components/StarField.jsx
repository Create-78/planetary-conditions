// CSS-only star-field background. Two layered radial-gradient patterns at low opacity.
// Fixed position so the texture stays put while content scrolls.
// Sits behind all content (z-0) — App.jsx places tab content at z-10.

function StarField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-space-950"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0.5px, transparent 1px),
          radial-gradient(circle at 75% 60%, rgba(255,255,255,0.3) 0.5px, transparent 1px),
          radial-gradient(circle at 45% 80%, rgba(255,255,255,0.35) 0.5px, transparent 1px),
          radial-gradient(circle at 90% 15%, rgba(255,255,255,0.25) 0.5px, transparent 1px),
          radial-gradient(circle at 10% 70%, rgba(255,255,255,0.3) 0.5px, transparent 1px)
        `,
        backgroundSize: '120px 120px, 180px 180px, 150px 150px, 200px 200px, 160px 160px',
        opacity: 0.6,
      }}
    />
  )
}

export default StarField
