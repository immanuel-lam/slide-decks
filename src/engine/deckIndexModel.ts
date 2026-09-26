export function getVisibleDecks<T extends { hidden?: boolean }>(
  decks: T[],
  showHidden = false,
): T[] {
  return showHidden ? decks : decks.filter((deck) => !deck.hidden)
}

export function deckIndexHref(slug: string): string {
  return `?presenter#/${slug}/1`
}
