import assert from 'node:assert/strict'
import test from 'node:test'

async function loadDeckIndexModel() {
  try {
    return await import('../src/engine/deckIndexModel.ts')
  } catch (error) {
    assert.fail(`Deck-index model is not implemented: ${error.message}`)
  }
}

test('hidden decks do not appear in the default deck list', async () => {
  const { getVisibleDecks } = await loadDeckIndexModel()
  const decks = [
    { slug: 'public', hidden: false },
    { slug: 'kit-demo', hidden: true },
  ]

  assert.deepEqual(getVisibleDecks(decks).map((deck) => deck.slug), ['public'])
})

test('the deck list can reveal hidden decks', async () => {
  const { getVisibleDecks } = await loadDeckIndexModel()
  const decks = [
    { slug: 'public', hidden: false },
    { slug: 'kit-demo', hidden: true },
  ]

  assert.deepEqual(getVisibleDecks(decks, true).map((deck) => deck.slug), [
    'public',
    'kit-demo',
  ])
})

test('deck-index links open the first slide in presenter view', async () => {
  const { deckIndexHref } = await loadDeckIndexModel()

  assert.equal(deckIndexHref?.('kit-demo'), '?presenter#/kit-demo/1')
})
