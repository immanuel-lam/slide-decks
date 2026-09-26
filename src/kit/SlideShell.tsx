import type { ReactNode } from 'react'
import styles from './kit.module.css'

/**
 * Base frame every kit layout renders into. The canvas is a fixed logical
 * 1280×720 px — size type in px in here, never viewport units (the stage
 * is scaled with a transform, which vw/vh ignore).
 */
export function SlideShell({
  kicker,
  align = 'start',
  className,
  children,
}: {
  /** Small eyebrow line at the top of the slide. */
  kicker?: string
  align?: 'start' | 'center'
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`${styles.slide} ${className ?? ''}`} data-align={align}>
      {kicker && <p className={styles.kicker}>{kicker}</p>}
      {children}
    </section>
  )
}
