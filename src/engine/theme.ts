import type { Deck } from './types.ts'

/**
 * The theme a deck renders in. `?theme=<name>` in the URL wins, so any deck
 * can be previewed or exported in another theme; otherwise the deck's own
 * `theme`, otherwise the default tokens in src/styles/tokens.css.
 */
export function resolveTheme(deck: Pick<Deck, 'theme'>): string | undefined {
  const fromUrl = new URLSearchParams(window.location.search).get('theme')
  if (fromUrl && /^[a-z0-9-]+$/.test(fromUrl)) return fromUrl
  return deck.theme
}

/** Props for the element that scopes a deck: theme + deck accent. */
export function deckScopeProps(deck: Pick<Deck, 'theme' | 'accent'>) {
  return {
    'data-theme': resolveTheme(deck),
    style: { ['--deck-accent' as never]: deck.accent ?? 'var(--accent)' },
  }
}
