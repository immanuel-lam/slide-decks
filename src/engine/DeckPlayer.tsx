import { useEffect, useState, type MouseEvent } from 'react'
import { isInteractiveTarget } from './isInteractiveTarget.ts'
import styles from './DeckPlayer.module.css'
import type { Deck } from './types.ts'
import { useDeckKeys, useDeckNav } from './useDeckNav.ts'
import { StageFrame } from './StageFrame.tsx'
import { useFitScale } from './useFitScale.ts'
import { ProgressRail } from './ProgressRail.tsx'
import { OverviewGrid } from './OverviewGrid.tsx'
import { goHome } from './route.ts'
import { deckScopeProps } from './theme.ts'

const TRANSITION_MS = 340

export function DeckPlayer({ deck }: { deck: Deck }) {
  const nav = useDeckNav(deck)
  const [overview, setOverview] = useState(false)
  const [stageRef, scale] = useFitScale<HTMLDivElement>(0.96)
  const [anim, setAnim] = useState<{ cur: number; prev: number | null; dir: 1 | -1 }>({
    cur: nav.index,
    prev: null,
    dir: 1,
  })

  useDeckKeys(nav, { onToggleOverview: () => setOverview((v) => !v) })

  useEffect(() => {
    setAnim((a) =>
      a.cur === nav.index ? a : { cur: nav.index, prev: a.cur, dir: nav.index > a.cur ? 1 : -1 },
    )
  }, [nav.index])

  useEffect(() => {
    if (anim.prev === null) return
    const t = setTimeout(
      () => setAnim((a) => (a.prev === null ? a : { ...a, prev: null })),
      TRANSITION_MS,
    )
    return () => clearTimeout(t)
  }, [anim])

  const onStageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(e.target)) return
    const rect = e.currentTarget.getBoundingClientRect()
    if (e.clientX - rect.left < rect.width / 3) nav.prev()
    else nav.next()
  }

  const counter = `${String(nav.index + 1).padStart(2, '0')} / ${String(nav.count).padStart(2, '0')}`

  return (
    <div className={styles.root} {...deckScopeProps(deck)}>
      <div className={styles.stageArea} ref={stageRef} onClick={onStageClick}>
        {scale > 0 && (
          <>
            {anim.prev !== null && (
              <div
                key={`out-${anim.prev}`}
                className={`${styles.slideLayer} ${anim.dir === 1 ? styles.exitFwd : styles.exitBack}`}
                aria-hidden="true"
              >
                <StageFrame scale={scale} renderMode="overview">
                  {deck.slides[anim.prev].element}
                </StageFrame>
              </div>
            )}
            <div
              key={`in-${anim.cur}`}
              className={`${styles.slideLayer} ${
                anim.prev !== null ? (anim.dir === 1 ? styles.enterFwd : styles.enterBack) : ''
              }`}
            >
              <StageFrame scale={scale} renderMode="audience">
                {deck.slides[anim.cur].element}
              </StageFrame>
            </div>
          </>
        )}
      </div>

      <footer className={styles.chrome}>
        <button type="button" className={styles.deckTitle} onClick={goHome} title="All decks">
          {deck.title}
        </button>
        <ProgressRail
          count={nav.count}
          index={nav.index}
          labels={deck.slides.map((slide) => slide.id)}
          onSelect={nav.navigate}
        />
        <span className={styles.counter}>{counter}</span>
      </footer>

      {overview && (
        <OverviewGrid
          deck={deck}
          current={nav.index}
          onSelect={(i) => {
            nav.navigate(i)
            setOverview(false)
          }}
          onClose={() => setOverview(false)}
        />
      )}
    </div>
  )
}
