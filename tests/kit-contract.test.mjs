import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const projectRoot = new URL('../', import.meta.url)

async function source(path) {
  return readFile(new URL(path, projectRoot), 'utf8')
}

const KIT_LAYOUTS = [
  'TitleSlide', 'SectionSlide', 'StatementSlide', 'BulletBoard', 'TwoColumn',
  'TimelineSlide', 'DataTable', 'StatBoard', 'TerminalSlide', 'QuoteSlide',
  'ImageSlide', 'ScreenshotPairSlide', 'ClosingSlide',
]

test('title and closing slides render static wordmarks in the display face', async () => {
  const styles = await source('src/kit/kit.module.css')

  assert.match(styles, /\.titleWordmark\s*\{[^}]*font-family:\s*var\(--font-display\)/s)
  assert.match(styles, /\.closingWordmark\s*\{[^}]*font-family:\s*var\(--font-display\)/s)
})

test('every kit layout is exported and shown in the demo deck', async () => {
  const [index, demo] = await Promise.all([
    source('src/kit/index.ts'),
    source('src/decks/demo/slides.tsx'),
  ])

  for (const name of KIT_LAYOUTS) {
    assert.match(index, new RegExp(`export \\{ ${name}\\b`), `${name} is exported from the kit`)
    assert.match(demo, new RegExp(`<${name}\\b`), `${name} appears in the demo deck`)
  }
})

test('the demo deck exercises shared kit states and screen layouts', async () => {
  const demo = await source('src/decks/demo/slides.tsx')

  assert.match(demo, /state: 'live'/)
  assert.match(demo, /state: 'scheduled'/)
  assert.match(demo, /state: 'stale'/)
  assert.match(demo, /lead="/)
  assert.match(demo, /aspect: '/)
  assert.match(demo, /codes=\{\[/)
})

test('the demo deck is always listed on the index', async () => {
  const deck = await source('src/decks/demo/deck.ts')

  assert.doesNotMatch(deck, /hidden:\s*true/)
})

test('the kit has no pinned badge and no hard-coded brand assets', async () => {
  const files = (await readdir(new URL('src/kit/', projectRoot))).filter((file) => /\.(tsx|ts|css)$/.test(file))
  const sources = await Promise.all(files.map((file) => source(`src/kit/${file}`)))

  for (const [i, text] of sources.entries()) {
    assert.doesNotMatch(text, /QrBadge|LineTag|lineColor/, `${files[i]} references a removed component`)
    assert.doesNotMatch(text, /from '\.\.\/assets\//, `${files[i]} imports a shared brand asset`)
  }
})

test('fonts come from npm packages, not undeclared families', async () => {
  const [main, tokens, styles] = await Promise.all([
    source('src/main.tsx'),
    source('src/styles/tokens.css'),
    source('src/kit/kit.module.css'),
  ])

  assert.match(main, /@fontsource-variable\/manrope/)
  assert.match(main, /@fontsource-variable\/hanken-grotesk/)
  assert.match(tokens, /--font-display: 'Manrope Variable'/)
  assert.match(tokens, /--font-body: 'Hanken Grotesk Variable'/)
  assert.doesNotMatch(styles, /IBM Plex|font-family: '(?!Manrope|Hanken)/)
})
