import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parallaxOffset } from './useScrollParallax.js'

test('parallaxOffset: 200px scroll at speed 0.05 yields ~10px (MOTION-02)', () => {
  assert.equal(parallaxOffset(200, 0.05), 10)
})
test('parallaxOffset: zero scroll yields zero', () => {
  assert.equal(parallaxOffset(0, 0.05), 0)
})
test('parallaxOffset: scales linearly with scroll distance', () => {
  assert.equal(parallaxOffset(1000, 0.05), 50)
})
