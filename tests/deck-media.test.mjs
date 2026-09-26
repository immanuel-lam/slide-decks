import assert from 'node:assert/strict'
import test from 'node:test'

function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function createImage({ decode } = {}) {
  const image = { onload: null, onerror: null, src: '' }
  Object.defineProperty(image, 'src', {
    set() {},
  })
  if (decode) image.decode = decode
  return image
}

async function waitFor(condition) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (condition()) return
    await new Promise(setImmediate)
  }
  assert.fail('Timed out while waiting for media lifecycle state')
}

test('loads the complete video as a blob', async () => {
  const { preloadVideoBlob } = await import('../src/engine/preloadDeckMedia.ts')
  const expected = new Blob(['video'], { type: 'video/mp4' })
  const loaded = await preloadVideoBlob('/slide.mp4', async () => new Response(expected))
  assert.equal(loaded.type, 'video/mp4')
  assert.equal(await loaded.text(), 'video')
})

test('rejects a failed video response', async () => {
  const { preloadVideoBlob } = await import('../src/engine/preloadDeckMedia.ts')
  await assert.rejects(
    () => preloadVideoBlob('/slide.mp4', async () => new Response('', { status: 503 })),
    /503/,
  )
})

test('loads an image when decode is unavailable', async () => {
  const { preloadDeckImage } = await import('../src/engine/preloadDeckMedia.ts')
  const image = createImage()
  const loading = preloadDeckImage('/slide.png', () => image)
  image.onload()
  await loading
})

test('publishes video URLs only after every deck asset is ready', async () => {
  const { createDeckMediaLifecycle } = await import('../src/engine/preloadDeckMedia.ts')
  const image = createImage()
  const states = []
  const createdUrls = []
  const lifecycle = createDeckMediaLifecycle(
    [
      { kind: 'image', src: '/slide.png' },
      { kind: 'video', src: '/one.mp4' },
      { kind: 'video', src: '/two.mp4' },
    ],
    (state) => states.push(state),
    {
      createImage: () => image,
      fetcher: async (src) => new Response(new Blob([src])),
      createObjectURL: (blob) => {
        const url = `blob:${createdUrls.length + 1}`
        createdUrls.push({ blob, url })
        return url
      },
      revokeObjectURL: () => undefined,
    },
  )

  const loading = lifecycle.start()
  await waitFor(() => createdUrls.length === 2)
  assert.equal(createdUrls.length, 2)
  assert.deepEqual(states.map((state) => state.status), ['loading'])
  assert.deepEqual(lifecycle.getState().videoUrls, {})

  image.onload()
  await loading

  assert.equal(createdUrls.length, 2)
  assert.deepEqual(lifecycle.getState().videoUrls, {
    '/one.mp4': 'blob:1',
    '/two.mp4': 'blob:2',
  })
  assert.equal(lifecycle.getState().status, 'ready')
})

test('releases loaded video URLs when a deck asset fails', async () => {
  const { createDeckMediaLifecycle } = await import('../src/engine/preloadDeckMedia.ts')
  const failedResponse = deferred()
  const createdUrls = []
  const revokedUrls = []
  const lifecycle = createDeckMediaLifecycle(
    [
      { kind: 'video', src: '/good.mp4' },
      { kind: 'video', src: '/bad.mp4' },
    ],
    () => undefined,
    {
      fetcher: (src) =>
        src === '/good.mp4'
          ? Promise.resolve(new Response(new Blob(['good'])))
          : failedResponse.promise,
      createImage: () => createImage(),
      createObjectURL: () => {
        createdUrls.push('blob:good')
        return 'blob:good'
      },
      revokeObjectURL: (url) => revokedUrls.push(url),
    },
  )

  const loading = lifecycle.start()
  await waitFor(() => createdUrls.length === 1)
  failedResponse.reject(new Error('network failed'))
  await loading

  assert.deepEqual(revokedUrls, ['blob:good'])
  assert.equal(lifecycle.getState().status, 'failed')
  assert.deepEqual(lifecycle.getState().videoUrls, {})
})

test('releases video URLs on disposal', async () => {
  const { createDeckMediaLifecycle } = await import('../src/engine/preloadDeckMedia.ts')
  const revokedUrls = []
  const lifecycle = createDeckMediaLifecycle(
    [{ kind: 'video', src: '/slide.mp4' }],
    () => undefined,
    {
      fetcher: async () => new Response(new Blob(['video'])),
      createImage: () => createImage(),
      createObjectURL: () => 'blob:slide',
      revokeObjectURL: (url) => revokedUrls.push(url),
    },
  )

  await lifecycle.start()
  lifecycle.dispose()

  assert.deepEqual(revokedUrls, ['blob:slide'])
})

test('retry clears playback failure and video URLs before the next video is ready', async () => {
  const { createDeckMediaLifecycle } = await import('../src/engine/preloadDeckMedia.ts')
  const nextResponse = deferred()
  const revokedUrls = []
  let fetchCalls = 0
  const lifecycle = createDeckMediaLifecycle(
    [{ kind: 'video', src: '/slide.mp4' }],
    () => undefined,
    {
      fetcher: () => {
        fetchCalls += 1
        return fetchCalls === 1
          ? Promise.resolve(new Response(new Blob(['first'])))
          : nextResponse.promise
      },
      createImage: () => createImage(),
      createObjectURL: () => 'blob:first',
      revokeObjectURL: (url) => revokedUrls.push(url),
    },
  )

  await lifecycle.start()
  lifecycle.reportPlaybackError()
  lifecycle.retry()

  assert.equal(lifecycle.getState().status, 'loading')
  assert.equal(lifecycle.getState().playbackError, false)
  assert.deepEqual(lifecycle.getState().videoUrls, {})
  assert.equal(lifecycle.resolveVideo('/slide.mp4'), '/slide.mp4')
  assert.deepEqual(revokedUrls, ['blob:first'])

  nextResponse.resolve(new Response(new Blob(['second'])))
  await new Promise(setImmediate)
  lifecycle.dispose()
})

test('provider controller restarts media after Strict Mode setup cleanup setup', async () => {
  const { createDeckMediaProviderController } = await import('../src/engine/preloadDeckMedia.ts')
  const states = []
  let fetchCalls = 0
  const controller = createDeckMediaProviderController(
    [{ kind: 'video', src: '/slide.mp4' }],
    (state) => states.push(state),
    {
      fetcher: async () => {
        fetchCalls += 1
        return new Response(new Blob(['video']))
      },
      createImage: () => createImage(),
      createObjectURL: () => 'blob:slide',
      revokeObjectURL: () => undefined,
    },
  )

  const firstSetup = controller.setup()
  controller.cleanup()
  await firstSetup
  await controller.setup()

  assert.equal(fetchCalls, 2)
  assert.equal(controller.getState().status, 'ready')
  assert.equal(controller.resolveVideo('/slide.mp4'), 'blob:slide')
  assert.deepEqual(states.map((state) => state.status), ['loading', 'loading', 'ready'])
})
