import { decks } from './decks/index.ts'
import { DeckIndex } from './engine/DeckIndex.tsx'
import { DeckMediaProvider } from './engine/DeckMediaProvider.tsx'
import { DeckPlayer } from './engine/DeckPlayer.tsx'
import { PresenterMode } from './engine/PresenterMode.tsx'
import { ExportView } from './engine/ExportView.tsx'
import { isExport, isPresenter, useRoute } from './engine/route.ts'

export default function App() {
  const route = useRoute()
  const deck = decks.find((d) => d.slug === route.slug)
  if (!deck) return <DeckIndex decks={decks} />
  if (isExport()) return <ExportView deck={deck} />
  return (
    <DeckMediaProvider key={deck.slug} deck={deck}>
      {isPresenter() ? <PresenterMode deck={deck} /> : <DeckPlayer deck={deck} />}
    </DeckMediaProvider>
  )
}
