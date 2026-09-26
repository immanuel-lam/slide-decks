import styles from './ProgressRail.module.css'

const pct = (i: number, count: number) => (count > 1 ? (i / (count - 1)) * 100 : 0)

/** 'closing-codes' → 'closing codes' */
const humanise = (id: string) => id.replace(/[-_]+/g, ' ')

/**
 * The deck as a stepper: one dot per slide on a thin track. The track fills
 * in the deck accent up to the current slide, and hovering a dot shows the
 * slide number and id. Accent comes from the inherited --deck-accent.
 */
export function ProgressRail({
  count,
  index,
  labels,
  onSelect,
}: {
  count: number
  index: number
  /** Optional slide ids, shown on hover. */
  labels?: string[]
  onSelect: (i: number) => void
}) {
  const at = pct(index, count)
  return (
    <div className={styles.rail} role="group" aria-label="Slide progress">
      <div className={styles.track} aria-hidden="true" />
      <div className={styles.travelled} style={{ transform: `scaleX(${at / 100})` }} aria-hidden="true" />
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          className={styles.dot}
          data-state={i < index ? 'passed' : i === index ? 'current' : 'upcoming'}
          style={{ left: `${pct(i, count)}%` }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(i)
          }}
          aria-label={`Slide ${i + 1} of ${count}${labels?.[i] ? `: ${humanise(labels[i])}` : ''}`}
          aria-current={i === index ? 'step' : undefined}
        >
          <span className={styles.name} aria-hidden="true">
            <b>{String(i + 1).padStart(2, '0')}</b> {labels?.[i] ? humanise(labels[i]) : ''}
          </span>
        </button>
      ))}
    </div>
  )
}
