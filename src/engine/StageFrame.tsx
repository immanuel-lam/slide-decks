import type { ReactNode } from 'react'
import styles from './StageFrame.module.css'
import { SlideRenderModeProvider } from './SlideRenderContext.tsx'
import type { SlideRenderMode } from './slideRenderMode.ts'
import { STAGE_W } from './types.ts'

/**
 * Renders children on the fixed 1280×720 logical canvas, visually scaled.
 * Kit layouts use px against this canvas — never viewport units.
 */
export function StageFrame({
  scale,
  renderMode = 'overview',
  children,
}: {
  scale: number
  renderMode?: SlideRenderMode
  children: ReactNode
}) {
  return (
    <div
      className={styles.holder}
      style={{ width: STAGE_W * scale, height: (STAGE_W * scale * 9) / 16 }}
    >
      <div className={styles.canvas} style={{ transform: `scale(${scale})` }}>
        <SlideRenderModeProvider mode={renderMode}>{children}</SlideRenderModeProvider>
      </div>
    </div>
  )
}
