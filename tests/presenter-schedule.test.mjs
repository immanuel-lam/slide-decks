import assert from 'node:assert/strict'
import test from 'node:test'
import { formatDuration, getPresenterSchedule } from '../src/engine/presenterSchedule.ts'

const notes = [
  { slide: 1, startSeconds: 0, endSeconds: 30, warningSeconds: 10 },
  { slide: 2, startSeconds: 30, endSeconds: 65, warningSeconds: 10 },
  { slide: 3, startSeconds: 65, endSeconds: 100, warningSeconds: 10 },
]

test('classifies schedule state using end-exclusive slide ranges', () => {
  assert.equal(getPresenterSchedule(notes, 1, 20).state, 'ahead')
  assert.equal(getPresenterSchedule(notes, 1, 30).state, 'on-time')
  assert.equal(getPresenterSchedule(notes, 1, 55).state, 'wrap-up')
  assert.equal(getPresenterSchedule(notes, 1, 65).state, 'behind')
  assert.equal(getPresenterSchedule(notes, 0, 66).expectedSlide, 3)
  assert.equal(getPresenterSchedule(notes, 2, 101).remainingSeconds, -1)
})

test('formats the target range and delta labels exactly', () => {
  assert.deepEqual(getPresenterSchedule(notes, 1, 55), {
    state: 'wrap-up',
    expectedSlide: 2,
    remainingSeconds: 10,
    targetLabel: 'TARGET 00:30–01:05',
    deltaLabel: '00:10 LEFT',
  })
  assert.equal(getPresenterSchedule(notes, 2, 101).deltaLabel, '00:01 OVER')
})

test('provides visible label data for each presenter pace state', () => {
  const cases = [
    [29, 'ahead', 1, 'TARGET 00:30–01:05', '00:36 LEFT'],
    [30, 'on-time', 2, 'TARGET 00:30–01:05', '00:35 LEFT'],
    [55, 'wrap-up', 2, 'TARGET 00:30–01:05', '00:10 LEFT'],
    [65, 'behind', 3, 'TARGET 00:30–01:05', '00:00 OVER'],
  ]

  for (const [elapsedSeconds, state, expectedSlide, targetLabel, deltaLabel] of cases) {
    assert.deepEqual(getPresenterSchedule(notes, 1, elapsedSeconds), {
      state,
      expectedSlide,
      remainingSeconds: 65 - elapsedSeconds,
      targetLabel,
      deltaLabel,
    })
  }
})

test('advances the expected slide at each end-exclusive boundary', () => {
  const boundaries = [
    [0, 0, 1, 'TARGET 00:00–00:30', '00:30 LEFT'],
    [29, 0, 1, 'TARGET 00:00–00:30', '00:01 LEFT'],
    [30, 1, 2, 'TARGET 00:30–01:05', '00:35 LEFT'],
    [64, 1, 2, 'TARGET 00:30–01:05', '00:01 LEFT'],
    [65, 2, 3, 'TARGET 01:05–01:40', '00:35 LEFT'],
    [99, 2, 3, 'TARGET 01:05–01:40', '00:01 LEFT'],
    [100, 2, 3, 'TARGET 01:05–01:40', '00:00 OVER'],
  ]

  for (const [elapsedSeconds, currentIndex, expectedSlide, targetLabel, deltaLabel] of boundaries) {
    const snapshot = getPresenterSchedule(notes, currentIndex, elapsedSeconds)
    assert.equal(snapshot.expectedSlide, expectedSlide)
    assert.equal(snapshot.targetLabel, targetLabel)
    assert.equal(snapshot.deltaLabel, deltaLabel)
  }
})

test('clamps expected slides before and after the schedule', () => {
  assert.equal(getPresenterSchedule(notes, 1, -5).expectedSlide, 1)
  assert.equal(getPresenterSchedule(notes, 1, 500).expectedSlide, 3)
})

test('formats elapsed durations and overtime without a sign', () => {
  assert.equal(formatDuration(0), '00:00')
  assert.equal(formatDuration(65), '01:05')
  assert.equal(formatDuration(-65), '01:05')
})
