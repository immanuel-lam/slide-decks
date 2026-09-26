import styles from './OverviewGrid.module.css'
import type { Deck } from './types.ts'
import { STAGE_W } from './types.ts'
import { StageFrame } from './StageFrame.tsx'

const THUMB_W = 284
const THUMB_SCALE = THUMB_W / STAGE_W

/** All slides as live miniatures — g/Esc from the player, click to jump. */
export function OverviewGrid({
  deck,
  current,
  onSelect,
  onClose,
}: {
  deck: Deck
  current: number
  onSelect: (i: number) => void
  onClose: () => void
}) {
  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-label="Slide overview">
      <div className={styles.grid} onClick={(e) => e.stopPropagation()}>
        {deck.slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            className={styles.cell}
            data-current={i === current || undefined}
            onClick={() => onSelect(i)}
          >
            <span className={styles.thumb} aria-hidden="true">
              <StageFrame scale={THUMB_SCALE} renderMode="overview">
                {slide.element}
              </StageFrame>
            </span>
            <span className={styles.caption}>
              {String(i + 1).padStart(2, '0')} — {slide.id}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
