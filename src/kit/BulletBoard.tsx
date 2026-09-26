import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

export interface BoardItem {
  /** Short lead-in word or phrase, shown in the deck accent. */
  lead: string
  body: string
  /**
   * Optional data-honesty state. Tints the lead with the status tokens so a
   * row can say whether its data is live, scheduled or stale. Omit for the
   * default deck-accent lead.
   */
  state?: 'live' | 'scheduled' | 'stale'
}

/** Ruled rows: an accent lead-in beside body text. 3–5 items. */
export function BulletBoard({
  kicker,
  title,
  items,
}: {
  kicker?: string
  title: string
  items: BoardItem[]
}) {
  return (
    <SlideShell kicker={kicker}>
      <h2 className={styles.slideTitle}>{title}</h2>
      <div className={styles.boardRows}>
        {items.map((item) => (
          <div key={item.lead} className={styles.boardRow} data-state={item.state}>
            <span className={styles.boardLead}>{item.lead}</span>
            <span className={styles.boardBody}>{item.body}</span>
          </div>
        ))}
      </div>
    </SlideShell>
  )
}
