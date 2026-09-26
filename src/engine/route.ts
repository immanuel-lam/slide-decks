import { useSyncExternalStore } from 'react'

export interface Route {
  slug: string | null
  /** 0-based slide index (hash carries it 1-based). */
  index: number
}

export function parseRoute(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '')
  if (!raw) return { slug: null, index: 0 }
  const [slug, n] = raw.split('/')
  const parsed = Number.parseInt(n ?? '1', 10)
  return {
    slug: slug || null,
    index: Number.isFinite(parsed) && parsed > 0 ? parsed - 1 : 0,
  }
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

// useSyncExternalStore needs a referentially stable snapshot between changes.
let cached: Route = { slug: null, index: 0 }
function getSnapshot(): Route {
  const next = parseRoute()
  if (next.slug !== cached.slug || next.index !== cached.index) cached = next
  return cached
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function goTo(slug: string, index: number) {
  window.location.hash = `#/${slug}/${index + 1}`
}

export function goHome() {
  window.location.hash = '#/'
}

export const isPresenter = () =>
  new URLSearchParams(window.location.search).has('presenter')

export const isExport = () =>
  new URLSearchParams(window.location.search).has('export')

/** URL of the printable export view for a deck, keeping any ?theme=. */
export function exportUrl(slug: string): string {
  const url = new URL(window.location.href)
  url.searchParams.delete('presenter')
  url.searchParams.set('export', '')
  url.hash = `#/${slug}`
  return url.toString().replace('export=', 'export')
}
