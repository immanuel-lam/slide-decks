import { useState } from 'react'
import styles from './DeckIndex.module.css'
import type { Deck } from './types.ts'
import { deckIndexHref, getVisibleDecks } from './deckIndexModel.ts'
import { exportUrl } from './route.ts'

/** Landing page: every deck in a ruled list. */
export function DeckIndex({ decks }: { decks: Deck[] }) {
  const [showHidden, setShowHidden] = useState(false)
  const visibleDecks = getVisibleDecks(decks, showHidden)
  const hasHiddenDecks = decks.some((deck) => deck.hidden)

  return (
    <main className={`container ${styles.page}`}>
      <header className={styles.header}>
        <p className="eyebrow">presentations</p>
        <h1 className={styles.wordmark}>
          slides<span style={{color:"var(--accent)"}}>.</span>
        </h1>
      </header>

      <section className={styles.board} aria-label="Decks">
        <div className={styles.headRow} aria-hidden="true">
          <span>Deck</span>
          <span>Date</span>
          <span>Slides</span>
          <span>Status</span>
          <span />
        </div>
        {visibleDecks.map((deck) => (
          <div key={deck.slug} className={styles.row}>
            <span className={styles.titleCell}>
              {/* Stretched link: the whole row opens the deck. */}
              <a className={styles.title} href={deckIndexHref(deck.slug)}>
                {deck.title}
              </a>
            </span>
            <span className={styles.mono}>{deck.date}</span>
            <span className={styles.mono}>{String(deck.slides.length).padStart(2, '0')}</span>
            <span className={styles.status} aria-hidden="true">open ↗</span>
            <a
              className={styles.export}
              href={exportUrl(deck.slug)}
              target="_blank"
              rel="noopener"
              aria-label={`Export ${deck.title} as PDF or PNG`}
            >
              export
            </a>
          </div>
        ))}
        {visibleDecks.length === 0 && (
          <div className={styles.emptyRow} role="status">
            <span>NO DECKS SHOWN</span>
            <span>STANDBY</span>
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <span className={styles.hint}>
          open a deck to present. use audience ↗ for the display window.
        </span>
        {hasHiddenDecks && (
          <button
            type="button"
            className={styles.toggle}
            aria-pressed={showHidden}
            onClick={() => setShowHidden((shown) => !shown)}
          >
            {showHidden ? 'hide hidden decks' : 'show hidden decks'}
          </button>
        )}
      </footer>
    </main>
  )
}
