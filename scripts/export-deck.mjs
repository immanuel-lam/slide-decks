// Exports decks to PDF and/or PNG with headless Chromium.
//
//   npm run export -- <slug>                 PDF + PNGs for one deck
//   npm run export -- --all                  every deck
//   npm run export -- <slug> --pdf           PDF only
//   npm run export -- <slug> --png --scale 1 PNGs at 1280×720 (default scale 2)
//   npm run export -- <slug> --theme midnight
//   npm run export -- <slug> --out ~/Desktop/talk
//
// Output: exports/<slug>/<slug>.pdf and exports/<slug>/slide-01.png, ...
// First run needs the browser: npx playwright install chromium
import { mkdir, readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const STAGE = { width: 1280, height: 720 }

function usage(message) {
  if (message) console.error(`error: ${message}\n`)
  console.error(
    'usage: npm run export -- <slug...|--all> [--pdf] [--png] [--scale 2] [--theme <name>] [--out exports]',
  )
  process.exit(1)
}

export function parseArgs(argv) {
  const options = { slugs: [], all: false, pdf: false, png: false, scale: 2, theme: undefined, out: 'exports' }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--all') options.all = true
    else if (arg === '--pdf') options.pdf = true
    else if (arg === '--png') options.png = true
    else if (arg === '--scale') options.scale = Number(argv[(i += 1)])
    else if (arg === '--theme') options.theme = argv[(i += 1)]
    else if (arg === '--out') options.out = argv[(i += 1)]
    else if (arg.startsWith('--')) throw new Error(`unknown option ${arg}`)
    else options.slugs.push(arg)
  }
  if (!options.pdf && !options.png) options.pdf = options.png = true
  if (!Number.isFinite(options.scale) || options.scale < 1 || options.scale > 4) {
    throw new Error('--scale must be between 1 and 4')
  }
  if (options.theme !== undefined && !/^[a-z0-9-]+$/.test(options.theme)) {
    throw new Error('--theme must be a theme folder name')
  }
  if (!options.out) throw new Error('--out needs a directory')
  if (!options.all && options.slugs.length === 0) throw new Error('name a deck slug or pass --all')
  return options
}

/** Deck slugs, read from each src/decks/<folder>/deck.ts(x). */
export async function listDeckSlugs() {
  const decksDir = join(root, 'src/decks')
  const slugs = []
  for (const entry of await readdir(decksDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    for (const file of ['deck.ts', 'deck.tsx']) {
      const text = await readFile(join(decksDir, entry.name, file), 'utf8').catch(() => null)
      const match = text && /slug:\s*['"]([^'"]+)['"]/.exec(text)
      if (match) slugs.push(match[1])
    }
  }
  return slugs
}

async function loadChromium() {
  try {
    const { chromium } = await import('@playwright/test')
    return chromium
  } catch {
    usage('Playwright is missing. Run npm install first.')
  }
}

async function exportDeck(context, baseUrl, slug, options) {
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))

  const query = options.theme ? `?export&theme=${options.theme}` : '?export'
  await page.goto(`${baseUrl}/${query}#/${slug}`)
  const ready = page.locator('[data-export-ready="true"]')
  try {
    await ready.waitFor({ timeout: 30_000 })
  } catch {
    throw new Error(`${slug}: the export view never became ready${errors.length ? ` (${errors[0]})` : ''}. Is the slug right?`)
  }

  const slides = page.locator('[data-export-slide]')
  const count = await slides.count()
  const outDir = resolve(root, options.out, slug)
  await mkdir(outDir, { recursive: true })
  const written = []

  if (options.png) {
    for (let i = 0; i < count; i += 1) {
      const file = join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`)
      const slide = slides.nth(i)
      await slide.scrollIntoViewIfNeeded()
      const box = await slide.boundingBox()
      // Clip to the exact canvas: layout can leave the page at a fractional
      // offset, which would otherwise add a pixel row to the image.
      await page.screenshot({
        path: file,
        animations: 'disabled',
        clip: { x: Math.round(box.x), y: Math.round(box.y), ...STAGE },
      })
      written.push(file)
    }
  }

  if (options.pdf) {
    const file = join(outDir, `${slug}.pdf`)
    await page.emulateMedia({ media: 'print' })
    await page.pdf({
      path: file,
      width: `${STAGE.width}px`,
      height: `${STAGE.height}px`,
      printBackground: true,
      preferCSSPageSize: true,
    })
    written.push(file)
  }

  await page.close()
  if (errors.length) throw new Error(`${slug}: page errors during export: ${errors.join('; ')}`)
  return { slug, count, written }
}

async function main() {
  let options
  try {
    options = parseArgs(process.argv.slice(2))
  } catch (error) {
    usage(error.message)
  }

  const known = await listDeckSlugs()
  const slugs = options.all ? known : options.slugs
  const unknown = slugs.filter((slug) => !known.includes(slug))
  if (unknown.length) usage(`unknown deck ${unknown.join(', ')}. Known decks: ${known.join(', ')}`)

  const chromium = await loadChromium()
  const { createServer } = await import('vite')
  const server = await createServer({ root, logLevel: 'error', server: { port: 0, host: '127.0.0.1' } })
  await server.listen()
  const baseUrl = server.resolvedUrls.local[0].replace(/\/$/, '')

  let browser
  try {
    browser = await chromium.launch()
  } catch (error) {
    await server.close()
    usage(`could not start Chromium. Run: npx playwright install chromium\n${error.message.split('\n')[0]}`)
  }

  try {
    const context = await browser.newContext({
      viewport: { width: STAGE.width + 200, height: STAGE.height + 200 },
      deviceScaleFactor: options.scale,
      reducedMotion: 'reduce',
    })
    for (const slug of slugs) {
      const result = await exportDeck(context, baseUrl, slug, options)
      console.log(`${result.slug}: ${result.count} slides`)
      for (const file of result.written) console.log(`  ${file}`)
    }
  } finally {
    await browser.close()
    await server.close()
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
