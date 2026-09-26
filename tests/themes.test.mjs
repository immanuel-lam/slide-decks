import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_THEME, checkTokens, contrastRatio, listThemes, loadTheme, parseColour, readTokens,
} from '../scripts/check-theme.mjs'

test('the default tokens and every shipped theme pass the contrast checks', async () => {
  for (const name of [DEFAULT_THEME, ...(await listThemes())]) {
    assert.deepEqual(checkTokens(await loadTheme(name)), [], `${name} has contrast problems`)
  }
})

test('a low-contrast palette is reported with the failing pair', async () => {
  const tokens = { ...(await loadTheme(DEFAULT_THEME)), '--text-faint': '#d0d0d0' }
  const problems = checkTokens(tokens)

  assert.equal(problems.length, 1)
  assert.match(problems[0], /--text-faint on --bg/)
})

test('non-hex colours are rejected with a clear message', async () => {
  const tokens = { ...(await loadTheme(DEFAULT_THEME)), '--accent': 'oklch(0.6 0.2 30)' }

  assert.ok(checkTokens(tokens).some((problem) => /--accent must be a hex or rgb\(\) colour/.test(problem)))
})

test('colour parsing and contrast follow WCAG', () => {
  assert.deepEqual(parseColour('#fff'), [255, 255, 255])
  assert.deepEqual(parseColour('rgb(1, 2, 3)'), [1, 2, 3])
  assert.equal(parseColour('red'), null)
  assert.equal(contrastRatio([0, 0, 0], [255, 255, 255]).toFixed(1), '21.0')
})

test('theme tokens are read only from the matching selector', () => {
  const css = ":root { --bg: #fff; } [data-theme='acme'] { --bg: #000; /* note */ --text: #eee; }"

  assert.deepEqual(readTokens(css, "[data-theme='acme']"), { '--bg': '#000', '--text': '#eee' })
})
