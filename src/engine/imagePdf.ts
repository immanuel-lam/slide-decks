/**
 * A minimal PDF writer: one JPEG per page, each page filled edge to edge.
 * Enough for slide exports without pulling in a PDF library. Text is not
 * selectable; `npm run export` produces vector PDFs when that matters.
 */

export interface PdfImagePage {
  /** Baseline or progressive JPEG bytes (no alpha). */
  jpeg: Uint8Array
  /** Pixel size of the JPEG. */
  width: number
  height: number
}

export interface PdfPageSize {
  /** Page size in PDF points (1/72 inch). */
  width: number
  height: number
}

/** 1280×720 CSS px at 96 dpi, the same page size Chromium prints. */
export const SLIDE_PAGE_POINTS: PdfPageSize = { width: 960, height: 540 }

const encoder = new TextEncoder()

export function buildImagePdf(pages: PdfImagePage[], size: PdfPageSize = SLIDE_PAGE_POINTS): Uint8Array {
  if (pages.length === 0) throw new Error('A PDF needs at least one page')

  const chunks: Uint8Array[] = []
  const offsets: number[] = []
  let length = 0
  const push = (chunk: Uint8Array | string) => {
    const bytes = typeof chunk === 'string' ? encoder.encode(chunk) : chunk
    chunks.push(bytes)
    length += bytes.length
  }
  const object = (id: number, body: () => void) => {
    offsets[id] = length
    push(`${id} 0 obj\n`)
    body()
    push('\nendobj\n')
  }

  // Object ids: 1 catalog, 2 page tree, then three per page (page, content, image).
  const pageId = (i: number) => 3 + i * 3
  const total = 2 + pages.length * 3

  push('%PDF-1.4\n')
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a])) // binary marker comment

  object(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'))
  object(2, () =>
    push(`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${pageId(i)} 0 R`).join(' ')}] >>`),
  )

  pages.forEach((page, i) => {
    if (!Number.isInteger(page.width) || !Number.isInteger(page.height) || page.width <= 0 || page.height <= 0) {
      throw new Error(`Page ${i + 1} has an invalid image size`)
    }
    if (page.jpeg[0] !== 0xff || page.jpeg[1] !== 0xd8) {
      throw new Error(`Page ${i + 1} is not a JPEG`)
    }
    const id = pageId(i)
    const content = `q ${size.width} 0 0 ${size.height} 0 0 cm /Im0 Do Q`

    object(id, () =>
      push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${size.width} ${size.height}] ` +
          `/Resources << /XObject << /Im0 ${id + 2} 0 R >> >> /Contents ${id + 1} 0 R >>`,
      ),
    )
    object(id + 1, () => {
      push(`<< /Length ${encoder.encode(content).length} >>\nstream\n`)
      push(content)
      push('\nendstream')
    })
    object(id + 2, () => {
      push(
        `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} ` +
          `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`,
      )
      push(page.jpeg)
      push('\nendstream')
    })
  })

  const xrefOffset = length
  push(`xref\n0 ${total + 1}\n0000000000 65535 f \n`)
  for (let id = 1; id <= total; id += 1) {
    push(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`)
  }
  push(`trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`)

  const out = new Uint8Array(length)
  let at = 0
  for (const chunk of chunks) {
    out.set(chunk, at)
    at += chunk.length
  }
  return out
}
