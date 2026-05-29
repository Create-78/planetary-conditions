/**
 * SolLogFeed — Mars analog of the Moon tab's solar-event feed.
 *
 * Renders a list of recent Curiosity REMS sols. MAAS2's public endpoint only
 * returns the LATEST sol, so MarsTab passes a single live entry today; this
 * component is built to render 1..N rows so wiring history later (see
 * INTEGRATION.md → "Mars sol history") needs no layout change. When only the
 * live sol is present we show a muted tail line instead of faking history.
 *
 * Props:
 *   - items   array of { sol, earthDate, condition, tempRange, pressure, severity }
 *             severity is a `.sev-*` modifier driving the sol-badge tint.
 *   - state   'ok' | 'loading' | 'error' (mirrors DataCard)
 */

function SolLogFeed({ items = [], state = 'ok' }) {
  if (state === 'loading') {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse" style={{ height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    )
  }
  if (state === 'error') {
    return <div className="text-sm text-slate-500 italic">Data temporarily unavailable</div>
  }

  return (
    <div className="thin-scroll flex flex-col gap-2" style={{ overflowY: 'auto', paddingRight: 4 }}>
      {items.map((e, i) => (
        <div
          key={e.sol ?? i}
          className="flex items-center gap-4"
          style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.035)', border: '1px solid var(--glass-border)' }}
        >
          <span
            className="telem"
            style={{
              minWidth: 56,
              justifyContent: 'center',
              display: 'inline-flex',
              color: 'var(--mars-accent)',
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.3)',
              padding: '5px 9px',
              borderRadius: 999,
            }}
          >
            {e.sol}
          </span>
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-slate-100">
              {e.earthDate}{e.condition ? ` · ${e.condition}` : ''}
            </div>
            <div className="telem" style={{ color: 'rgba(241,245,249,0.4)', marginTop: 4 }}>{e.tempRange}</div>
          </div>
          {e.pressure ? <span className="telem" style={{ color: 'rgba(241,245,249,0.5)' }}>{e.pressure}</span> : null}
        </div>
      ))}
      {items.length <= 1 ? (
        <div className="telem" style={{ color: 'rgba(241,245,249,0.32)', padding: '10px 4px' }}>
          Earlier sols load as the rover archive is wired in
        </div>
      ) : null}
    </div>
  )
}

export default SolLogFeed
