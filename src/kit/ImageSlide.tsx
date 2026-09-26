import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

/**
 * Framed (default) or full-bleed image. Without src it renders a striped
 * placeholder — drop the asset into src/assets and import it for the src.
 */
export function ImageSlide({
  kicker,
  title,
  src,
  alt = '',
  caption,
  fullBleed = false,
}: {
  kicker?: string
  title?: string
  src?: string
  alt?: string
  caption?: string
  fullBleed?: boolean
}) {
  const img = src ? (
    <img src={src} alt={alt} />
  ) : (
    <span className={styles.imagePlaceholder}>IMAGE — {caption ?? 'TO BE CAPTURED'}</span>
  )

  if (fullBleed) {
    return (
      <SlideShell>
        <div className={styles.imageFull}>{img}</div>
        {caption && <p className={styles.imageCaption}>{caption}</p>}
      </SlideShell>
    )
  }

  return (
    <SlideShell kicker={kicker}>
      {title && <h2 className={styles.slideTitle}>{title}</h2>}
      <div className={styles.imageFrame}>{img}</div>
      {caption && <p className={styles.imageCaption}>{caption}</p>}
    </SlideShell>
  )
}
