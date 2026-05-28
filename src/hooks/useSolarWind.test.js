import { test } from 'node:test'
import assert from 'node:assert/strict'

import { selectLatestKp } from './useSolarWind.js'

// NOAA's noaa-planetary-k-index.json returns an ARRAY OF OBJECTS (newest last),
// NOT the tabular array-of-arrays that plasma-2-hour.json / mag-2-hour.json use.
// The field is `Kp` (capital K). This fixture mirrors the live shape.
const KP_OBJECT_PAYLOAD = [
  { time_tag: '2026-05-21T00:00:00', Kp: 3, a_running: 15, station_count: 8 },
  { time_tag: '2026-05-27T18:00:00', Kp: 2.67, a_running: 12, station_count: 8 },
  { time_tag: '2026-05-27T21:00:00', Kp: 3.33, a_running: 18, station_count: 8 },
]

test('selectLatestKp reads the latest Kp from NOAA array-of-objects shape', () => {
  assert.equal(selectLatestKp(KP_OBJECT_PAYLOAD), 3.33)
})

test('selectLatestKp walks back past a trailing null Kp to the latest real value', () => {
  const withTrailingNull = [
    ...KP_OBJECT_PAYLOAD,
    { time_tag: '2026-05-28T00:00:00', Kp: null, a_running: null, station_count: 0 },
  ]
  assert.equal(selectLatestKp(withTrailingNull), 3.33)
})

test('selectLatestKp does not throw on the object shape (regression for headers.map crash)', () => {
  assert.doesNotThrow(() => selectLatestKp(KP_OBJECT_PAYLOAD))
})
