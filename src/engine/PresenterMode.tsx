import { useEffect, useReducer, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { exportUrl, goHome } from './route.ts'
import { deckScopeProps } from './theme.ts'
import styles from './PresenterMode.module.css'
import type { Deck } from './types.ts'
import { useDeckKeys, useDeckNav } from './useDeckNav.ts'
import { StageFrame } from './StageFrame.tsx'
import { useFitScale } from './useFitScale.ts'
import { getPresenterSchedule } from './presenterSchedule.ts'
import { useDeckMedia } from './DeckMediaProvider.tsx'

const SCHEDULE_STATE_LABEL = {
  ahead: 'AHEAD',
  'on-time': 'ON TIME',
  'wrap-up': 'WRAP UP',
  behind: 'BEHIND',
} as const

function formatElapsed(total: number): string {
  const elapsedSeconds = Math.max(0, Math.floor(total))
  const h = Math.floor(elapsedSeconds / 3600)
  const m = Math.floor((elapsedSeconds % 3600) / 60)
  const s = elapsedSeconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function audienceUrl(): string {
  const url = new URL(window.location.href)
  url.searchParams.delete('presenter')
  return url.toString()
}

/** ?presenter — current + next slide, speaker notes, elapsed timer. */
export function PresenterMode({ deck }: { deck: Deck }) {
  const nav = useDeckNav(deck)
  useDeckKeys(nav)
  const [mainRef, mainScale] = useFitScale<HTMLDivElement>(0.97)
  const [nextRef, nextScale] = useFitScale<HTMLDivElement>(0.97)

  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [, tick] = useReducer((n: number) => n + 1, 0)
  const notesRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const slide = deck.slides[nav.index]
  const next = deck.slides[nav.index + 1]
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
  const presenterNotes = deck.slides.flatMap((candidate) =>
    candidate.presenter ? [candidate.presenter] : [],
  )
  const schedule = presenterNotes.length === deck.slides.length
    ? getPresenterSchedule(presenterNotes, nav.index, elapsedSeconds)
    : undefined
  const presenter = slide.presenter
  const prompt = presenter?.body ?? slide.notes ?? '—'
  const { playbackError, retry, status } = useDeckMedia()
  const mediaState = playbackError || status === 'failed'
    ? 'failed'
    : status === 'ready'
      ? 'ready'
      : 'loading'

  useEffect(() => {
    if (notesRef.current) notesRef.current.scrollTop = 0
  }, [nav.index])

  return (
    <div className={styles.root} {...deckScopeProps(deck)}>
      <section className={styles.main}>
        <header className={styles.label}>
          <Button variant="outline" onClick={goHome} style={{ marginRight: 8 }}>← all decks</Button>
          <Button variant="outline" onClick={() => window.open(exportUrl(deck.slug), '_blank')} style={{ marginRight: 20 }}>
            export ↗
          </Button>
          CURRENT — {String(nav.index + 1).padStart(2, '0')} / {String(nav.count).padStart(2, '0')}
        </header>
        <div className={styles.stage} ref={mainRef}>
          {mainScale > 0 && (
            <StageFrame scale={mainScale} renderMode="presenter-current">
              {slide.element}
            </StageFrame>
          )}
        </div>
      </section>

      <aside className={styles.side}>
        <div className={styles.nextBlock}>
          <header className={styles.label}>NEXT</header>
          <div className={styles.nextStage} ref={nextRef}>
            {next && nextScale > 0 ? (
              <StageFrame scale={nextScale} renderMode="presenter-next">
                {next.element}
              </StageFrame>
            ) : (
              <span className={styles.endOfDeck}>END OF DECK</span>
            )}
          </div>
        </div>

        <div className={styles.notesBlock}>
          <header className={styles.label}>NOTES</header>
          <div className={styles.notes} ref={notesRef}>
            {presenter && schedule && (
              <div className={styles.promptMeta}>
                <span className={styles.promptMetaLabel}>SPEAKERS</span>
                <strong className={styles.speakers}>{presenter.speakers.join(' / ')}</strong>
                <span className={styles.promptTarget}>{schedule.targetLabel}</span>
              </div>
            )}
            <p className={styles.promptBody}>{prompt}</p>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.timing} data-state={schedule?.state}>
            <span className={styles.timingLabel}>TOTAL</span>
            <strong className={styles.timer}>{formatElapsed(elapsedSeconds)}</strong>
            {schedule && (
              <>
                <strong className={styles.paceState}>{SCHEDULE_STATE_LABEL[schedule.state]}</strong>
                <span className={styles.target}>{schedule.targetLabel}</span>
                <span className={styles.delta}>{schedule.deltaLabel}</span>
                {schedule.state === 'behind' && schedule.expectedSlide !== nav.index + 1 && (
                  <span className={styles.expectedSlide}>
                    SHOULD BE SLIDE {String(schedule.expectedSlide).padStart(2, '0')}
                  </span>
                )}
              </>
            )}
            <span className={styles.mediaStatus} data-state={mediaState}>MEDIA {mediaState.toUpperCase()}</span>
            {mediaState === 'failed' && (
              <button type="button" className={styles.button} onClick={retry}>
                RETRY VIDEO
              </button>
            )}
          </div>
          <button type="button" className={styles.button} onClick={() => setStartedAt(Date.now())}>
            RESET
          </button>
          <span className={styles.spacer} />
          <button type="button" className={styles.button} onClick={nav.prev}>
            ← PREV
          </button>
          <button type="button" className={styles.button} onClick={nav.next}>
            NEXT →
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => window.open(audienceUrl(), '_blank')}
          >
            AUDIENCE ↗
          </button>
        </div>
      </aside>
    </div>
  )
}
