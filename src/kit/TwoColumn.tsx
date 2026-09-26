import type { ReactNode } from 'react'
import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

/**
 * Generic split layout. Children per side are arbitrary — text, a <ul>
 * (styled with accent square bullets), an image, a nested table.
 */
export function TwoColumn({
  kicker,
  title,
  left,
  right,
  ratio = [1, 1],
}: {
  kicker?: string
  title?: string
  left: ReactNode
  right: ReactNode
  /** Column width ratio, e.g. [3, 2]. */
  ratio?: [number, number]
}) {
  return (
    <SlideShell kicker={kicker}>
      {title && <h2 className={styles.slideTitle}>{title}</h2>}
      <div
        className={styles.columns}
        style={{ gridTemplateColumns: `minmax(0, ${ratio[0]}fr) minmax(0, ${ratio[1]}fr)` }}
      >
        <div className={styles.column}>{left}</div>
        <div className={styles.column}>{right}</div>
      </div>
    </SlideShell>
  )
}
