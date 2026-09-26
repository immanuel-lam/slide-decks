import { useEffect, useRef, useState } from 'react'
import styles from './ExportView.module.css'
import { exportSlides, type ExportFormat } from './exportInBrowser.ts'
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

type Job =
  | { state: 'idle' }
  | { state: 'working'; format: ExportFormat; done: number; total: number }
  | { state: 'done'; format: ExportFormat }
  | { state: 'failed'; message: string }

const FORMAT_LABEL: Record<ExportFormat, string> = { pdf: 'PDF', png: 'PNGs' }

/**
 * ?export#/<slug> — every slide at full 1280×720 size. The toolbar downloads
 * a PDF or a zip of PNGs rendered in the browser, or prints (vector PDF via
 * the print dialog). scripts/export-deck.mjs drives the same page headlessly.
 * Slides render in their final, static frame; video slides show their poster.
 */
export function ExportView({ deck }: { deck: Deck }) {
  const pagesRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [job, setJob] = useState<Job>({ state: 'idle' })
  const busy = job.state === 'working'

  const download = async (format: ExportFormat) => {
    const root = pagesRef.current
    if (!root || busy) return
    const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-export-slide]'))
    setJob({ state: 'working', format, done: 0, total: slides.length })
    try {
      await exportSlides(slides, {
        slug: deck.slug,
        format,
        onProgress: ({ done, total }) => setJob({ state: 'working', format, done, total }),
      })
      setJob({ state: 'done', format })
    } catch (error) {
      setJob({ state: 'failed', message: error instanceof Error ? error.message : String(error) })
    }
  }

  const status =
    job.state === 'working'
      ? `rendering slide ${Math.min(job.done + 1, job.total)} of ${job.total}…`
      : job.state === 'done'
        ? `${FORMAT_LABEL[job.format]} downloaded`
        : job.state === 'failed'
          ? `export failed: ${job.message}`
          : ready
            ? 'ready'
            : 'loading slides…'

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
        <span className={styles.status} role="status" data-state={job.state}>
          {status}
        </span>
        <button
          type="button"
          className={styles.primary}
          disabled={!ready || busy}
          onClick={() => void download('pdf')}
        >
          download PDF
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={!ready || busy}
          onClick={() => void download('png')}
        >
          download PNGs (.zip)
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={!ready || busy}
          onClick={() => window.print()}
          title="Vector PDF with selectable text, via the print dialog"
        >
          print…
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
