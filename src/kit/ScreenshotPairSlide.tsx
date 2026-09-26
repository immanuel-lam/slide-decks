import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

export interface ScreenshotPanel {
  label: string
  src?: string
  alt?: string
  caption?: string
  fit?: 'contain' | 'cover'
  position?: string
  /**
   * CSS aspect-ratio for the well, e.g. '660 / 1434' for a phone screenshot.
   * Without it the well fills its grid cell, which letterboxes tall shots
   * inside a wide frame. With it the frame hugs the screen it contains.
   * Only the `lead` layout sizes wells this way; without `lead` it is a no-op.
   */
  aspect?: string
}

function ScreenshotFigure({ panel }: { panel: ScreenshotPanel }) {
  return (
    <figure className={styles.screenshotFigure}>
      <div
        className={styles.screenshotWell}
        data-fit={panel.fit ?? 'contain'}
        style={panel.aspect ? { aspectRatio: panel.aspect, width: 'auto' } : undefined}
      >
        {panel.src ? (
          <img
            src={panel.src}
            alt={panel.alt ?? ''}
            style={{ objectPosition: panel.position ?? 'center' }}
          />
        ) : (
          <span className={styles.screenshotPlaceholder}>SCREENSHOT TO BE CAPTURED</span>
        )}
      </div>
      <figcaption className={styles.screenshotMeta}>
        <span className={styles.screenshotLabel}>{panel.label}</span>
        {panel.caption && <span className={styles.screenshotCaption}>{panel.caption}</span>}
      </figcaption>
    </figure>
  )
}

/**
 * Two product screens shown at equal visual weight. `lead` moves the copy to a
 * left column and stands the pair beside it — the layout to reach for when the
 * screens are tall (phones) and need the full slide height.
 */
export function ScreenshotPairSlide({
  kicker,
  title,
  lead,
  left,
  right,
}: {
  kicker?: string
  title: string
  /** Optional supporting sentence. Its presence switches to the aside layout. */
  lead?: string
  left: ScreenshotPanel
  right: ScreenshotPanel
}) {
  if (lead) {
    return (
      <SlideShell kicker={kicker}>
        <div className={styles.screenshotAside}>
          <div className={styles.screenshotAsideCopy}>
            <h2 className={styles.slideTitle}>{title}</h2>
            <p className={styles.screenshotAsideLead}>{lead}</p>
          </div>
          <div className={styles.screenshotPair} data-layout="aside">
            <ScreenshotFigure panel={left} />
            <ScreenshotFigure panel={right} />
          </div>
        </div>
      </SlideShell>
    )
  }

  return (
    <SlideShell kicker={kicker}>
      <h2 className={styles.slideTitle}>{title}</h2>
      <div className={styles.screenshotPair}>
        <ScreenshotFigure panel={left} />
        <ScreenshotFigure panel={right} />
      </div>
    </SlideShell>
  )
}
