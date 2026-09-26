// Validates every deck's timed presenter notes before a build.
//
// A deck opts in by adding two files next to its slides.tsx:
//   notes.md         one `<!-- slide ... -->` block per slide (see AGENTS.md)
//   notes.config.ts  export const notesConfig = { slideCount, allowedSpeakers }
//
// Decks without notes.md are skipped. A notes.md without notes.config.ts fails.
import { access, readdir, readFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parsePresenterNotes, formatTimecode } from '../src/engine/parsePresenterNotes.ts'

const decksDir = new URL('../src/decks/', import.meta.url)

async function exists(url) {
  try {
    await access(url)
    return true
  } catch {
    return false
  }
}

export async function validateDeckNotes(slug) {
  const deckDir = new URL(`${slug}/`, decksDir)
  const notesUrl = new URL('notes.md', deckDir)
  const configUrl = new URL('notes.config.ts', deckDir)

  if (!(await exists(notesUrl))) return undefined
  if (!(await exists(configUrl))) {
    throw new Error(`${slug}: notes.md needs a sibling notes.config.ts exporting notesConfig`)
  }

  const { notesConfig } = await import(configUrl.href)
  if (!notesConfig) throw new Error(`${slug}: notes.config.ts must export notesConfig`)

  const source = await readFile(notesUrl, 'utf8')
  try {
    return parsePresenterNotes(source, notesConfig)
  } catch (error) {
    throw new Error(`${slug}: ${error.message}`, { cause: error })
  }
}

export async function validateAllDecks() {
  const entries = await readdir(decksDir, { withFileTypes: true })
  const results = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const notes = await validateDeckNotes(entry.name)
    if (notes) results.push({ slug: entry.name, notes })
  }
  return results
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const results = await validateAllDecks()
  if (results.length === 0) {
    console.log(`No presenter notes to validate in ${fileURLToPath(decksDir)}.`)
  } else {
    const summary = results
      .map(({ slug, notes }) => `${slug} ${formatTimecode(notes.at(-1).endSeconds)}`)
      .join(' · ')
    console.log(`Validated presenter notes: ${summary}.`)
  }
}
