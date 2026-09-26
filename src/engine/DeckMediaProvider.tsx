import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createDeckMediaProviderController,
  type DeckMediaLifecycleState,
  type DeckMediaStatus,
} from './preloadDeckMedia.ts'
import type { Deck } from './types.ts'

export type { DeckMediaStatus } from './preloadDeckMedia.ts'

export interface DeckMediaContextValue {
  status: DeckMediaStatus
  playbackError: boolean
  retryToken: number
  resolveVideo: (src: string) => string
  reportPlaybackError: () => void
  retry: () => void
}

const fallbackState: DeckMediaLifecycleState = {
  status: 'idle',
  playbackError: false,
  retryToken: 0,
  videoUrls: {},
}

const fallbackContext: DeckMediaContextValue = {
  ...fallbackState,
  resolveVideo: (src) => src,
  reportPlaybackError: () => undefined,
  retry: () => undefined,
}

const DeckMediaContext = createContext<DeckMediaContextValue | null>(null)

export function DeckMediaProvider({ deck, children }: { deck: Deck; children: ReactNode }) {
  const [state, setState] = useState<DeckMediaLifecycleState>(fallbackState)
  const controller = useMemo(
    () => createDeckMediaProviderController(deck.media ?? [], setState),
    [deck],
  )

  useEffect(() => {
    void controller.setup()
    return controller.cleanup
  }, [controller])

  const resolveVideo = useCallback((src: string) => controller.resolveVideo(src), [controller])
  const reportPlaybackError = useCallback(() => controller.reportPlaybackError(), [controller])
  const retry = useCallback(() => controller.retry(), [controller])

  const value = useMemo<DeckMediaContextValue>(
    () => ({ ...state, resolveVideo, reportPlaybackError, retry }),
    [state, resolveVideo, reportPlaybackError, retry],
  )

  return <DeckMediaContext.Provider value={value}>{children}</DeckMediaContext.Provider>
}

export function useDeckMedia(): DeckMediaContextValue {
  return useContext(DeckMediaContext) ?? fallbackContext
}
