/**
 * LoadingState — neutral skeleton block sized for a DataCard value slot.
 *
 * Style is intentionally minimal: Tailwind's animate-pulse on a slate block.
 * No gradient sweep / fancy keyframes (deferred to Phase 5 polish).
 *
 * Props:
 *   - className: optional override appended to the default classes so callers
 *               can re-size the skeleton (e.g. AlertCard list row).
 *
 * Accessibility:
 *   - aria-hidden="true" — the skeleton is decorative. The surrounding data
 *     container should expose loading state via aria-live / aria-busy.
 */
function LoadingState({ className = '' }) {
  const classes = ['animate-pulse rounded-md bg-slate-700/40 h-8 w-24', className]
    .filter(Boolean)
    .join(' ')

  return <div aria-hidden="true" className={classes} />
}

export default LoadingState
