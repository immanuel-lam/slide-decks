import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldPlayVideo } from '../src/engine/slideRenderMode.ts'

test('plays video in audience mode', () => {
  assert.equal(shouldPlayVideo('audience'), true)
})

test('plays video in the current presenter preview', () => {
  assert.equal(shouldPlayVideo('presenter-current'), true)
})

test('uses a poster in the next presenter preview', () => {
  assert.equal(shouldPlayVideo('presenter-next'), false)
})

test('uses a poster in overview mode', () => {
  assert.equal(shouldPlayVideo('overview'), false)
})
