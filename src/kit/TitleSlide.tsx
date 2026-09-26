import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

/** Deck opener: kicker, large wordmark, subtitle and a date line. */
export function TitleSlide({
  kicker,
  title,
  subtitle,
  date,
  logo,
}: {
  kicker: string
  /** Short display wordmark. */
  title: string
  subtitle?: string
  date?: string
  /** Optional brand logo (imported image URL), shown above the kicker. */
  logo?: string
}) {
  return (
    <SlideShell kicker={kicker}>
      {logo && <img className={styles.brandLogo} src={logo} alt="" />}
      <h1 className={styles.titleWordmark}>{title}</h1>
      {subtitle && <p className={styles.titleSubtitle}>{subtitle}</p>}
      {date && <p className={styles.titleDate}>{date}</p>}
    </SlideShell>
  )
}
