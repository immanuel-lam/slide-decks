import assert from 'node:assert/strict'
import test from 'node:test'
import { listDeckSlugs, parseArgs } from '../scripts/export-deck.mjs'

test('export defaults to PDF and PNG at 2x', () => {
  const options = parseArgs(['demo'])

  assert.deepEqual(options.slugs, ['demo'])
  assert.equal(options.pdf, true)
  assert.equal(options.png, true)
  assert.equal(options.scale, 2)
  assert.equal(options.out, 'exports')
})

test('export flags narrow the output and pick a theme', () => {
  const options = parseArgs(['demo', '--png', '--scale', '1', '--theme', 'midnight', '--out', 'build/talk'])

  assert.equal(options.pdf, false)
  assert.equal(options.png, true)
  assert.equal(options.scale, 1)
  assert.equal(options.theme, 'midnight')
  assert.equal(options.out, 'build/talk')
})

test('export rejects bad input', () => {
  assert.throws(() => parseArgs([]), /name a deck slug or pass --all/)
  assert.throws(() => parseArgs(['demo', '--scale', '9']), /--scale/)
  assert.throws(() => parseArgs(['demo', '--theme', '../x']), /--theme/)
  assert.throws(() => parseArgs(['demo', '--jpg']), /unknown option/)
})

test('export finds every registered deck slug', async () => {
  const slugs = await listDeckSlugs()

  assert.ok(slugs.includes('demo'))
  assert.ok(slugs.includes('arrayah-2026-09-20'))
})
