import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

export interface TimelineStop {
  /** Label above the track: a date ('may 2026') or a phase ('beta'). */
  date: string
  label: string
  detail?: string
  state?: 'past' | 'current' | 'future'
}

/**
 * Milestones as dots on a horizontal track. The 'current' stop gets an
 * accent halo. Keep it to about 6 stops.
 */
export function TimelineSlide({
  kicker,
  title,
  stops,
}: {
  kicker?: string
  title: string
  stops: TimelineStop[]
}) {
  const pct = (i: number) =>
    stops.length > 1 ? 8 + (i / (stops.length - 1)) * 84 : 50

  return (
    <SlideShell kicker={kicker}>
      <h2 className={styles.slideTitle}>{title}</h2>
      <div className={styles.timeline}>
        <div className={styles.timelineTrack} aria-hidden="true" />
        {stops.map((stop, i) => (
          <div
            key={stop.label}
            className={styles.timelineStop}
            data-state={stop.state ?? 'future'}
            style={{ left: `${pct(i)}%` }}
          >
            <span className={styles.timelineDate}>{stop.date}</span>
            <span className={styles.timelineDot} aria-hidden="true" />
            <span className={styles.timelineLabel}>{stop.label}</span>
            {stop.detail && <span className={styles.timelineDetail}>{stop.detail}</span>}
          </div>
        ))}
      </div>
    </SlideShell>
  )
}
