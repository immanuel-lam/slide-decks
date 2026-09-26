import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

export interface Stat {
  value: string
  label: string
  /** Optional CSS colour for the value, e.g. 'var(--status-good)'. */
  color?: string
}

/** Hairline-divided stat grid. 2–4 stats. */
export function StatBoard({
  kicker,
  title,
  stats,
}: {
  kicker?: string
  title?: string
  stats: Stat[]
}) {
  return (
    <SlideShell kicker={kicker}>
      {title && <h2 className={styles.slideTitle}>{title}</h2>}
      <div className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span
              className={styles.statValue}
              style={stat.color ? { color: stat.color } : undefined}
            >
              {stat.value}
            </span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
    </SlideShell>
  )
}
