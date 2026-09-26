import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

/** Chapter divider: big number + title + accent bar. */
export function SectionSlide({
  number,
  title,
  kicker,
}: {
  /** e.g. '01' */
  number: string
  title: string
  kicker?: string
}) {
  return (
    <SlideShell kicker={kicker} align="center">
      <p className={styles.sectionNumber}>{number}</p>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sectionBar} aria-hidden="true" />
    </SlideShell>
  )
}
