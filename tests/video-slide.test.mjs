import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { startVideoPlayback } from '../src/engine/videoPlayback.ts'

const projectRoot = new URL('../', import.meta.url)

function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

test('reports an active video play rejection', async () => {
  const playback = deferred()
  let errors = 0
  const video = {
    currentTime: 9,
    play: () => playback.promise,
    pause: () => undefined,
  }

  startVideoPlayback(video, () => {
    errors += 1
  })
  playback.reject(new Error('autoplay denied'))
  await new Promise(setImmediate)

  assert.equal(video.currentTime, 0)
  assert.equal(errors, 1)
})

test('cleanup pauses and resets video without reporting a late play rejection', async () => {
  const playback = deferred()
  let pauses = 0
  let errors = 0
  const video = {
    currentTime: 9,
    play: () => playback.promise,
    pause: () => {
      pauses += 1
    },
  }

  const cleanup = startVideoPlayback(video, () => {
    errors += 1
  })
  video.currentTime = 4
  cleanup()
  playback.reject(new Error('stale rejection'))
  await new Promise(setImmediate)

  assert.equal(pauses, 1)
  assert.equal(video.currentTime, 0)
  assert.equal(errors, 0)
})

test('video element reports media errors and keeps the provider retry control', async () => {
  const source = await readFile(new URL('src/engine/VideoSlide.tsx', projectRoot), 'utf8')

  assert.match(source, /onError=\{reportPlaybackError\}/)
  assert.match(source, /onClick=\{\(event\) => \{\s*event\.stopPropagation\(\)\s*retry\(\)/)
})
