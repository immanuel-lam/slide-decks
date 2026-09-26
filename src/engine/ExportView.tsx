import { useEffect, useRef, useState } from 'react'
import styles from './ExportView.module.css'
import { goHome } from './route.ts'
import { StageFrame } from './StageFrame.tsx'
import { deckScopeProps } from './theme.ts'
import type { Deck } from './types.ts'

/** Resolves once every image inside `root` has loaded (or failed). */
function imagesSettled(root: HTMLElement): Promise<void> {
  const pending = Array.from(root.querySelectorAll('img')).filter((img) => !img.complete)
  return Promise.all(
    pending.map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        }),
    ),
  ).then(() => undefined)
}

/**
 * ?export#/<slug> — every slide at full 1280×720 size, one per printed page.
 * Print it (or "save as PDF") from the browser, or let scripts/export-deck.mjs
 * drive it headlessly for PDF and PNG output. Slides render in their final,
 * static frame; video slides show their poster.
 */
export function ExportView({ deck }: { deck: Deck }) {
  const pagesRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const root = pagesRef.current
    if (!root) return
    void Promise.all([document.fonts.ready, imagesSettled(root)]).then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [deck])

  return (
    <div className={styles.root} {...deckScopeProps(deck)} data-export-ready={ready}>
      <header className={styles.toolbar}>
        <button type="button" className={styles.button} onClick={goHome}>
          ← all decks
        </button>
        <span className={styles.title}>
          {deck.title} · {deck.slides.length} slides
        </span>
        <span className={styles.hint}>
          PNGs and exact PDFs: npm run export -- {deck.slug}
        </span>
        <button
          type="button"
          className={styles.primary}
          disabled={!ready}
          onClick={() => window.print()}
        >
          {ready ? 'print / save as PDF' : 'loading…'}
        </button>
      </header>
      <div className={styles.pages} ref={pagesRef}>
        {deck.slides.map((slide, index) => (
          <section
            key={slide.id}
            className={styles.page}
            data-export-slide={index + 1}
            aria-label={`Slide ${index + 1}: ${slide.id}`}
          >
            <StageFrame scale={1} renderMode="overview">
              {slide.element}
            </StageFrame>
          </section>
        ))}
      </div>
    </div>
  )
}
