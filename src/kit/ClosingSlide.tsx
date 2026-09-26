import styles from './kit.module.css'
import { SlideShell } from './SlideShell.tsx'

export interface ClosingCode {
  /** QR SVG made with scripts/gen-qr.mjs and imported into the deck. */
  src: string
  /** Small label under the code, e.g. 'get the app'. */
  label: string
  /** The destination, spelled out so the room can type it instead. */
  caption?: string
  /** Short status word beside the caption, e.g. 'Beta'. Uses --status-warn. */
  tag?: string
  alt: string
}

/** Deck closer: wordmark, contact lines, accent CTA, optional QR codes. */
export function ClosingSlide({
  kicker,
  title,
  contact = [],
  cta,
  codes = [],
  logo,
}: {
  kicker?: string
  /** Short display wordmark. */
  title: string
  contact?: string[]
  cta?: string
  /** Scannable codes, shown in a row under the CTA. */
  codes?: ClosingCode[]
  /** Optional brand logo (imported image URL), shown above the title. */
  logo?: string
}) {
  return (
    <SlideShell kicker={kicker} align="center">
      {logo && <img className={styles.brandLogo} src={logo} alt="" />}
      <p className={styles.closingWordmark}>{title}</p>
      {contact.length > 0 && (
        <div className={styles.closingLines}>
          {contact.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      )}
      {cta && <p className={styles.closingCta}>{cta}</p>}
      {codes.length > 0 && (
        <div className={styles.closingCodes}>
          {codes.map((code) => (
            <figure key={code.label} className={styles.closingCode}>
              <img src={code.src} alt={code.alt} />
              <figcaption>
                <span className={styles.closingCodeLabel}>{code.label}</span>
                {code.caption && (
                  <span className={styles.closingCodeCaption}>
                    {code.caption}
                    {code.tag && <span className={styles.closingCodeTag}>{code.tag}</span>}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </SlideShell>
  )
}
