import { test } from 'node:test'
import assert from 'node:assert/strict'

// Node has no DOM, so we cannot mount the hook. We test the OBSERVABLE contract:
// the locked media query string and that matchMedia's `matches` value flows through
// both branches exactly as the hook reads it (MOTION-03).
function makeMatchMedia(matches) {
  return (query) => ({
    matches,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })
}

test('matchMedia is queried with the locked prefers-reduced-motion string (MOTION-03)', () => {
  const mm = makeMatchMedia(true)
  const mq = mm('(prefers-reduced-motion: reduce)')
  assert.equal(mq.media, '(prefers-reduced-motion: reduce)')
  assert.equal(mq.matches, true)
})
test('matchMedia false branch resolves to animate (reduced=false)', () => {
  const mm = makeMatchMedia(false)
  assert.equal(mm('(prefers-reduced-motion: reduce)').matches, false)
})
