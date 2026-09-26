import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const projectRoot = new URL('../', import.meta.url)

async function source(path) {
  return readFile(new URL(path, projectRoot), 'utf8')
}

test('each open deck owns a media provider while the index stays unwrapped', async () => {
  const app = await source('src/App.tsx')

  assert.match(app, /import \{ DeckMediaProvider \} from '\.\/engine\/DeckMediaProvider\.tsx'/)
  assert.match(app, /if \(!deck\) return <DeckIndex decks=\{decks\} \/>/)
  assert.match(
    app,
    /<DeckMediaProvider key=\{deck.slug\} deck=\{deck\}>\s*\{isPresenter\(\) \? <PresenterMode deck=\{deck\} \/> : <DeckPlayer deck=\{deck\} \/>\}\s*<\/DeckMediaProvider>/,
  )
})

test('presentation surfaces select the correct media render mode', async () => {
  const [player, overview, presenter] = await Promise.all([
    source('src/engine/DeckPlayer.tsx'),
    source('src/engine/OverviewGrid.tsx'),
    source('src/engine/PresenterMode.tsx'),
  ])

  assert.match(player, /<StageFrame scale=\{scale\} renderMode="overview">\s*\{deck\.slides\[anim\.prev\]\.element\}\s*<\/StageFrame>/)
  assert.match(player, /<StageFrame scale=\{scale\} renderMode="audience">\s*\{deck\.slides\[anim\.cur\]\.element\}\s*<\/StageFrame>/)
  assert.match(overview, /<StageFrame scale=\{THUMB_SCALE\} renderMode="overview">\s*\{slide\.element\}\s*<\/StageFrame>/)
  assert.match(presenter, /<StageFrame scale=\{mainScale\} renderMode="presenter-current">\s*\{slide\.element\}\s*<\/StageFrame>/)
  assert.match(presenter, /<StageFrame scale=\{nextScale\} renderMode="presenter-next">\s*\{next\.element\}\s*<\/StageFrame>/)
})
