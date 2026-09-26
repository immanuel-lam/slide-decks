import assert from 'node:assert/strict'
import test from 'node:test'
import { validateAllDecks, validateDeckNotes } from '../scripts/validate-decks.mjs'

test('every deck with notes.md validates against its notes.config.ts', async () => {
  const results = await validateAllDecks()
  const demo = results.find((result) => result.slug === 'demo')

  assert.ok(demo, 'the demo deck ships presenter notes')
  assert.equal(demo.notes.length, 17)
  assert.equal(demo.notes[0].startSeconds, 0)
})

test('decks without notes.md are skipped', async () => {
  assert.equal(await validateDeckNotes('arrayah-2026-09-20'), undefined)
})
