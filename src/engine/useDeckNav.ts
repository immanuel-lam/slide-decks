import { useCallback, useEffect, useRef } from 'react'
import { isInteractiveTarget } from './isInteractiveTarget.ts'
import type { Deck } from './types.ts'
import { goTo, parseRoute, useRoute } from './route.ts'

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi)

export interface DeckNav {
  index: number
  count: number
  navigate: (to: number) => void
  next: () => void
  prev: () => void
}

/**
 * Current slide from the hash + navigation that keeps every open window of
 * the same origin in step (presenter ↔ audience) via BroadcastChannel.
 */
export function useDeckNav(deck: Deck): DeckNav {
  const route = useRoute()
  const count = deck.slides.length
  const index = clamp(route.index, 0, count - 1)
  const channel = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    const ch = new BroadcastChannel('slide-decks-nav')
    channel.current = ch
    ch.onmessage = (e: MessageEvent<{ slug: string; index: number }>) => {
      const { slug, index: to } = e.data
      // Follow, don't re-broadcast — the hash change re-renders this window.
      if (slug === deck.slug && to !== parseRoute().index) goTo(slug, to)
    }
    return () => {
      channel.current = null
      ch.close()
    }
  }, [deck.slug])

  const navigate = useCallback(
    (to: number) => {
      const target = clamp(to, 0, count - 1)
      goTo(deck.slug, target)
      channel.current?.postMessage({ slug: deck.slug, index: target })
    },
    [deck.slug, count],
  )

  return {
    index,
    count,
    navigate,
    next: () => navigate(index + 1),
    prev: () => navigate(index - 1),
  }
}

interface KeyOptions {
  onToggleOverview?: () => void
}

/** Shared deck keyboard map (player + presenter). */
export function useDeckKeys(nav: DeckNav, opts: KeyOptions = {}) {
  const { onToggleOverview } = opts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.defaultPrevented || isInteractiveTarget(e.target)) return
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault()
          nav.next()
          break
        case ' ':
          e.preventDefault()
          if (e.shiftKey) nav.prev()
          else nav.next()
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          nav.prev()
          break
        case 'Home':
          e.preventDefault()
          nav.navigate(0)
          break
        case 'End':
          e.preventDefault()
          nav.navigate(nav.count - 1)
          break
        case 'g':
        case 'G':
        case 'Escape':
          if (onToggleOverview) {
            e.preventDefault()
            onToggleOverview()
          }
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nav, onToggleOverview])
}
