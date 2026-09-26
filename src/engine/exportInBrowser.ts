// In-browser export: renders each slide to a canvas and packages the result.
// The heavy libraries load on first use, so they never weigh on presenting.
import { buildImagePdf, type PdfImagePage } from './imagePdf.ts'

export type ExportFormat = 'pdf' | 'png'

export interface ExportProgress {
  done: number
  total: number
}

const pad = (n: number) => String(n).padStart(2, '0')

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the slide image'))), type, quality)
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

/**
 * Renders `slides` (1280×720 elements) at `scale` and downloads either one
 * PDF or a zip of PNGs named slide-01.png, slide-02.png, …
 */
export async function exportSlides(
  slides: HTMLElement[],
  { slug, format, scale = 2, onProgress }: {
    slug: string
    format: ExportFormat
    scale?: number
    onProgress?: (progress: ExportProgress) => void
  },
) {
  const { domToCanvas } = await import('modern-screenshot')
  const total = slides.length
  const pdfPages: PdfImagePage[] = []
  const pngFiles: Record<string, Uint8Array> = {}

  for (const [index, slide] of slides.entries()) {
    onProgress?.({ done: index, total })
    const background = getComputedStyle(slide).backgroundColor
    const canvas = await domToCanvas(slide, { scale, backgroundColor: background })
    if (format === 'pdf') {
      const jpeg = new Uint8Array(await (await canvasBlob(canvas, 'image/jpeg', 0.92)).arrayBuffer())
      pdfPages.push({ jpeg, width: canvas.width, height: canvas.height })
    } else {
      pngFiles[`slide-${pad(index + 1)}.png`] = new Uint8Array(await (await canvasBlob(canvas, 'image/png')).arrayBuffer())
    }
  }
  onProgress?.({ done: total, total })

  if (format === 'pdf') {
    downloadBlob(new Blob([buildImagePdf(pdfPages) as BlobPart], { type: 'application/pdf' }), `${slug}.pdf`)
  } else {
    const { zipSync } = await import('fflate')
    // PNGs are already compressed; store them as-is.
    const zip = zipSync(pngFiles, { level: 0 })
    downloadBlob(new Blob([zip as BlobPart], { type: 'application/zip' }), `${slug}-slides.zip`)
  }
}
