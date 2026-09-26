import type { Deck } from '../../engine/types.ts'
import { slides } from './slides.tsx'

export const demoDeck: Deck = {
  slug: 'demo',
  title: 'Kit demo — every layout',
  date: '2026-09-26',
  slides,
}
