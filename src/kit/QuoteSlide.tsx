import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

/** Large quote with a small attribution line. */
export function QuoteSlide({
  kicker,
  quote,
  attribution,
}: {
  kicker?: string
  quote: string
  attribution: string
}) {
  return (
    <SlideShell kicker={kicker} align="center">
      <blockquote className={styles.quote}>{quote}</blockquote>
      <p className={styles.quoteAttribution}>
        {attribution}
      </p>
    </SlideShell>
  )
}
