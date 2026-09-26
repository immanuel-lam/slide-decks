// Checks that a theme's colours are readable on the slide canvas.
//
//   npm run check:theme                 every theme, plus the default tokens
//   npm run check:theme -- acme         one theme (src/themes/acme/theme.css)
//
// A theme only lists the tokens it changes; the rest come from
// src/styles/tokens.css. Colours must be hex (#rgb, #rrggbb) or rgb().
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = new URL('..', import.meta.url)
export const DEFAULT_THEME = 'default'

/** [foreground, background, minimum WCAG contrast ratio, what it is] */
export const CONTRAST_RULES = [
  ['--text', '--bg', 4.5, 'body text on the slide'],
  ['--text-dim', '--bg', 4.5, 'secondary text on the slide'],
  ['--text-faint', '--bg', 4.5, 'kickers and captions on the slide'],
  ['--accent', '--bg', 4.5, 'accent labels and leads on the slide'],
  ['--status-good', '--bg', 4.5, '"live" status label'],
  ['--status-warn', '--bg', 4.5, '"scheduled" status label'],
  ['--text', '--bg-raised', 4.5, 'text on raised panels'],
  ['--text-dim', '--bg-inset', 4.5, 'terminal output on the inset panel'],
  ['--bg', '--accent', 4.5, 'button text on the accent colour'],
]

export const REQUIRED_TOKENS = [...new Set(CONTRAST_RULES.flat().filter((v) => typeof v === 'string' && v.startsWith('--')))]

/** Custom properties declared in a CSS block that matches `selector`. */
export function readTokens(css, selector) {
  const tokens = {}
  const blocks = css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)
  for (const [, head, body] of blocks) {
    if (!head.split(',').some((part) => part.trim() === selector)) continue
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[name] = value.trim()
    }
  }
  return tokens
}

export function parseColour(value) {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value)
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join('') : hex[1]
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16))
  }
  const rgb = /^rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*\)$/i.exec(value)
  if (rgb) return rgb.slice(1, 4).map(Number)
  return null
}

function luminance([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

async function loadDefaults() {
  const css = await readFile(new URL('src/styles/tokens.css', root), 'utf8')
  return readTokens(css, ':root')
}

export async function loadTheme(name) {
  const defaults = await loadDefaults()
  if (name === DEFAULT_THEME) return defaults
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`theme names are lowercase letters, digits and dashes: ${name}`)
  const css = await readFile(new URL(`src/themes/${name}/theme.css`, root), 'utf8').catch(() => {
    throw new Error(`no theme at src/themes/${name}/theme.css`)
  })
  const own = readTokens(css, `[data-theme='${name}']`)
  if (Object.keys(own).length === 0) {
    throw new Error(`src/themes/${name}/theme.css must declare tokens under [data-theme='${name}']`)
  }
  return { ...defaults, ...own }
}

/** Returns a list of problems; empty means the theme passes. */
export function checkTokens(tokens) {
  const problems = []
  for (const [fg, bg, min, what] of CONTRAST_RULES) {
    const a = parseColour(tokens[fg] ?? '')
    const b = parseColour(tokens[bg] ?? '')
    if (!a || !b) {
      for (const [name, parsed] of [[fg, a], [bg, b]]) {
        if (!parsed) problems.push(`${name} must be a hex or rgb() colour, got ${tokens[name] ?? 'nothing'}`)
      }
      continue
    }
    const ratio = contrastRatio(a, b)
    if (ratio < min) {
      problems.push(`${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1 (${what})`)
    }
  }
  return [...new Set(problems)]
}

export async function listThemes() {
  const entries = await readdir(new URL('src/themes/', root), { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const requested = process.argv[2]
  const names = requested ? [requested] : [DEFAULT_THEME, ...(await listThemes())]
  let failed = false
  for (const name of names) {
    let problems
    try {
      problems = checkTokens(await loadTheme(name))
    } catch (error) {
      problems = [error.message]
    }
    if (problems.length === 0) {
      console.log(`✓ ${name}`)
    } else {
      failed = true
      console.log(`✗ ${name}`)
      for (const problem of problems) console.log(`    ${problem}`)
    }
  }
  if (failed) {
    console.log(`\nFix the colours in the theme file (tokens: ${fileURLToPath(new URL('src/styles/tokens.css', root))}).`)
    process.exit(1)
  }
}
