import type { Deck } from '../engine/types.ts'
import { arrayahDeck } from './arrayah-2026-09-20/deck.tsx'
import { demoDeck } from './demo/deck.ts'

/** Every deck on the site, in index order. Register new decks here. */
export const decks: Deck[] = [arrayahDeck, demoDeck]
