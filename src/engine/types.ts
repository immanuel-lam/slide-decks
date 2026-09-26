import type { ReactNode } from 'react'

export interface PresenterNote {
  slide: number
  startSeconds: number
  endSeconds: number
  warningSeconds: number
  speakers: string[]
  body: string
}

export interface Slide {
  /** Stable id — used for keys and overview captions. */
  id: string
  /** Speaker notes shown in presenter mode. */
  notes?: string
  presenter?: PresenterNote
  element: ReactNode
}

export interface DeckMediaAsset {
  kind: 'image' | 'video'
  src: string
}

export interface Deck {
  /** URL segment: #/<slug>/<n> */
  slug: string
  title: string
  /** Keep internal/reference decks off the index until the viewer reveals them. */
  hidden?: boolean
  /** Display date, e.g. '2026-07-19'. */
  date: string
  /**
   * Optional CSS colour for this deck's accent (progress rail, kickers, leads,
   * `<em>` in statements). Defaults to `var(--accent)` from tokens.css.
   */
  accent?: string
  /**
   * Optional theme folder name from src/themes (e.g. 'midnight'). Omit for
   * the default tokens. `?theme=<name>` in the URL overrides it.
   */
  theme?: string
  media?: DeckMediaAsset[]
  slides: Slide[]
}

/** Logical slide canvas. Kit layouts are designed against these px and scaled to fit. */
export const STAGE_W = 1280
export const STAGE_H = 720
