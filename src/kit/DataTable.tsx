import type { ReactNode } from 'react'
import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

/**
 * Ruled table: small label headers, hairline dividers. The first column is
 * set as row keys. accentCol highlights one column.
 */
export function DataTable({
  kicker,
  title,
  columns,
  rows,
  accentCol,
}: {
  kicker?: string
  title: string
  columns: string[]
  rows: ReactNode[][]
  /** 0-based index of a column to render in the deck accent colour. */
  accentCol?: number
}) {
  return (
    <SlideShell kicker={kicker}>
      <h2 className={styles.slideTitle}>{title}</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} data-accent={c === accentCol || undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </SlideShell>
  )
}
