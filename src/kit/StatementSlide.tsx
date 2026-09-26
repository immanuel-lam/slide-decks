import type { ReactNode } from 'react'
import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

/** One big claim, centered. Wrap key words in <em> for the accent colour. */
export function StatementSlide({
  kicker,
  children,
  attribution,
}: {
  kicker?: string
  children: ReactNode
  attribution?: string
}) {
  return (
    <SlideShell kicker={kicker} align="center">
      <p className={styles.statement}>{children}</p>
      {attribution && <p className={styles.statementAttribution}>{attribution}</p>}
    </SlideShell>
  )
}
