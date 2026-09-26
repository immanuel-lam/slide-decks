import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

export interface TerminalLine {
  /** 'cmd' gets a $ prompt, 'out' is dimmed output, 'note' is amber. */
  kind: 'cmd' | 'out' | 'note'
  text: string
}

/** Terminal transcript panel: commands, output and notes. */
export function TerminalSlide({
  kicker,
  title,
  header,
  lines,
}: {
  kicker?: string
  title?: string
  /** Header strip inside the panel, e.g. 'local workflow'. */
  header?: string
  lines: TerminalLine[]
}) {
  return (
    <SlideShell kicker={kicker}>
      {title && <h2 className={styles.slideTitle}>{title}</h2>}
      <div className={styles.terminal}>
        {header && <div className={styles.terminalHeader}>{header}</div>}
        {lines.map((line, i) => (
          <p key={i} className={styles.terminalLine} data-kind={line.kind}>
            {line.text}
          </p>
        ))}
      </div>
    </SlideShell>
  )
}
