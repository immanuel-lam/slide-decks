import type { DeckMediaAsset } from './types.ts'

export type DeckMediaStatus = 'idle' | 'loading' | 'ready' | 'failed'

export interface DeckMediaLifecycleState {
  status: DeckMediaStatus
  playbackError: boolean
  retryToken: number
  videoUrls: Record<string, string>
}

export interface DeckImage {
  src: string
  onload: ((event: Event) => unknown) | null
  onerror: ((event: Event | string) => unknown) | null
  decode?: () => Promise<void>
}

export interface DeckMediaDependencies {
  fetcher: typeof fetch
  createImage: () => DeckImage
  createObjectURL: (blob: Blob) => string
  revokeObjectURL: (url: string) => void
}

export async function preloadVideoBlob(
  src: string,
  fetcher: typeof fetch = fetch,
): Promise<Blob> {
  const response = await fetcher(src)
  if (!response.ok) throw new Error(`Could not preload video ${src}: ${response.status}`)
  return response.blob()
}

export function preloadDeckImage(
  src: string,
  createImage: () => DeckImage = () => new Image(),
): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = createImage()
    image.onload = () => {
      if (typeof image.decode !== 'function') {
        resolve()
        return
      }
      image.decode().then(resolve, resolve)
    }
    image.onerror = () => reject(new Error(`Could not preload image ${src}`))
    image.src = src
  })
}

export interface DeckMediaLifecycle {
  getState: () => DeckMediaLifecycleState
  resolveVideo: (src: string) => string
  reportPlaybackError: () => void
  retry: () => void
  start: () => Promise<void>
  dispose: () => void
}

export function createDeckMediaLifecycle(
  media: readonly DeckMediaAsset[],
  onStateChange: (state: DeckMediaLifecycleState) => void,
  dependencies: Partial<DeckMediaDependencies> = {},
): DeckMediaLifecycle {
  const resolvedDependencies: DeckMediaDependencies = {
    fetcher: dependencies.fetcher ?? fetch,
    createImage: dependencies.createImage ?? (() => new Image()),
    createObjectURL: dependencies.createObjectURL ?? ((blob) => URL.createObjectURL(blob)),
    revokeObjectURL: dependencies.revokeObjectURL ?? ((url) => URL.revokeObjectURL(url)),
  }
  let disposed = false
  let attemptToken = 0
  let objectUrls: string[] = []
  let state: DeckMediaLifecycleState = {
    status: 'idle',
    playbackError: false,
    retryToken: 0,
    videoUrls: {},
  }

  const emit = (nextState: DeckMediaLifecycleState) => {
    state = nextState
    onStateChange(state)
  }

  const revokeObjectUrls = () => {
    objectUrls.forEach((objectUrl) => resolvedDependencies.revokeObjectURL(objectUrl))
    objectUrls = []
  }

  const load = (isRetry: boolean): Promise<void> => {
    if (disposed) return Promise.resolve()

    const attempt = ++attemptToken
    let failed = false
    revokeObjectUrls()
    emit({
      status: media.length === 0 ? 'ready' : 'loading',
      playbackError: false,
      retryToken: isRetry ? state.retryToken + 1 : state.retryToken,
      videoUrls: {},
    })

    if (media.length === 0) return Promise.resolve()

    const nextVideoUrls: Record<string, string> = {}
    return Promise.all(
      media.map(async (asset) => {
        if (asset.kind === 'image') {
          await preloadDeckImage(asset.src, resolvedDependencies.createImage)
          return
        }

        const blob = await preloadVideoBlob(asset.src, resolvedDependencies.fetcher)
        if (disposed || failed || attempt !== attemptToken) return
        const objectUrl = resolvedDependencies.createObjectURL(blob)
        objectUrls.push(objectUrl)
        nextVideoUrls[asset.src] = objectUrl
      }),
    ).then(
      () => {
        if (disposed || attempt !== attemptToken) return
        emit({ ...state, status: 'ready', videoUrls: nextVideoUrls })
      },
      () => {
        if (disposed || attempt !== attemptToken) return
        failed = true
        revokeObjectUrls()
        emit({ ...state, status: 'failed', videoUrls: {} })
      },
    )
  }

  return {
    getState: () => state,
    resolveVideo: (src) => state.videoUrls[src] ?? src,
    reportPlaybackError: () => {
      if (!disposed) emit({ ...state, playbackError: true })
    },
    retry: () => {
      void load(true)
    },
    start: () => load(false),
    dispose: () => {
      disposed = true
      attemptToken += 1
      revokeObjectUrls()
    },
  }
}

export interface DeckMediaProviderController {
  getState: () => DeckMediaLifecycleState
  resolveVideo: (src: string) => string
  reportPlaybackError: () => void
  retry: () => void
  setup: () => Promise<void>
  cleanup: () => void
}

export function createDeckMediaProviderController(
  media: readonly DeckMediaAsset[],
  onStateChange: (state: DeckMediaLifecycleState) => void,
  dependencies: Partial<DeckMediaDependencies> = {},
): DeckMediaProviderController {
  let lifecycle: DeckMediaLifecycle | null = null

  return {
    getState: () =>
      lifecycle?.getState() ?? {
        status: 'idle',
        playbackError: false,
        retryToken: 0,
        videoUrls: {},
      },
    resolveVideo: (src) => lifecycle?.resolveVideo(src) ?? src,
    reportPlaybackError: () => lifecycle?.reportPlaybackError(),
    retry: () => lifecycle?.retry(),
    setup: () => {
      lifecycle?.dispose()
      lifecycle = createDeckMediaLifecycle(media, onStateChange, dependencies)
      return lifecycle.start()
    },
    cleanup: () => {
      lifecycle?.dispose()
      lifecycle = null
    },
  }
}
