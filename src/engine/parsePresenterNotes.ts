import type { PresenterNote } from './types.ts'

export interface ParsePresenterNotesOptions {
  slideCount: number
  allowedSpeakers: readonly string[]
}

const METADATA_KEYS = ['slide', 'start', 'end', 'speakers', 'warning'] as const
const METADATA_BLOCK = /<!-- slide\n([\s\S]*?)\n-->/g
const TIMECODE = /^(\d{2}):([0-5]\d)$/

function fail(message: string): never {
  throw new Error(`Invalid presenter notes: ${message}`)
}

function assertSafeText(source: string): void {
  for (const character of source) {
    const code = character.charCodeAt(0)
    if (
      (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) ||
      code === 0x7f ||
      (code >= 0x80 && code <= 0x9f)
    ) {
      fail('control characters are not allowed')
    }
  }
}

export function parseTimecode(value: string): number {
  if (typeof value !== 'string') fail('timecode must be a string')
  const match = TIMECODE.exec(value)
  if (!match) fail(`timecode must use MM:SS format: ${value}`)

  return Number(match[1]) * 60 + Number(match[2])
}

export function formatTimecode(totalSeconds: number): string {
  if (!Number.isInteger(totalSeconds) || totalSeconds < 0) {
    fail('total seconds must be a non-negative integer')
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function parseMetadata(content: string, blockIndex: number): Record<(typeof METADATA_KEYS)[number], string> {
  const values: Partial<Record<(typeof METADATA_KEYS)[number], string>> = {}
  const lines = content.split('\n')

  for (const line of lines) {
    const match = /^(\w+):[ \t]*(.*)$/.exec(line)
    if (!match || !METADATA_KEYS.includes(match[1] as (typeof METADATA_KEYS)[number])) {
      fail(`unknown or malformed key in metadata block ${blockIndex}`)
    }

    const key = match[1] as (typeof METADATA_KEYS)[number]
    if (key in values) fail(`duplicate key ${key} in metadata block ${blockIndex}`)
    values[key] = match[2].trim()
  }

  for (const key of METADATA_KEYS) {
    if (!(key in values)) fail(`missing key ${key} in metadata block ${blockIndex}`)
  }

  return values as Record<(typeof METADATA_KEYS)[number], string>
}

function parsePositiveInteger(value: string, label: string): number {
  if (!/^\d+$/.test(value)) fail(`${label} must be a positive integer`)
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) fail(`${label} must be a positive integer`)
  return parsed
}

function parseSpeakers(value: string, allowedSpeakers: readonly string[], blockIndex: number): string[] {
  if (!value) fail(`speakers are required in metadata block ${blockIndex}`)
  const speakers = value.split('|').map((speaker) => speaker.trim())
  if (speakers.some((speaker) => !speaker || !allowedSpeakers.includes(speaker))) {
    fail(`speaker is not in the allowlist in metadata block ${blockIndex}`)
  }
  return speakers
}

export function parsePresenterNotes(
  source: string,
  options: ParsePresenterNotesOptions,
): PresenterNote[] {
  if (typeof source !== 'string') fail('source must be a string')
  if (!Number.isSafeInteger(options.slideCount) || options.slideCount <= 0) {
    fail('slideCount must be a positive integer')
  }

  assertSafeText(source)
  const normalized = source.replaceAll('\r\n', '\n')
  const notes: PresenterNote[] = []
  let cursor = 0
  let match: RegExpExecArray | null
  let expectedStart = 0
  let expectedSlide = 1

  const blocks = Array.from(normalized.matchAll(METADATA_BLOCK))
  for (const [blockIndex, block] of blocks.entries()) {
    match = block
    const prefix = normalized.slice(cursor, match.index)
    if (prefix.includes('<!--') || prefix.includes('-->')) {
      fail('unrecognized HTML comment')
    }
    if (notes.length === 0 && prefix.trim()) fail('text before first metadata block is not allowed')

    const metadataBlockIndex = blockIndex + 1
    const values = parseMetadata(match[1], metadataBlockIndex)
    const slide = parsePositiveInteger(values.slide, 'slide')
    if (slide !== expectedSlide) fail(`expected slide ${expectedSlide}`)

    const startSeconds = parseTimecode(values.start)
    const endSeconds = parseTimecode(values.end)
    const warningSeconds = parseTimecode(values.warning)
    if (startSeconds !== expectedStart) fail(`slide ${slide} does not start at ${formatTimecode(expectedStart)}`)
    if (endSeconds <= startSeconds) fail(`slide ${slide} must have a positive duration`)
    if (warningSeconds === 0) fail(`warning must be positive for slide ${slide}`)
    if (warningSeconds > endSeconds - startSeconds) fail(`warning exceeds slide duration for slide ${slide}`)

    const bodyStart = match.index + match[0].length
    const nextBlock = blocks[blockIndex + 1]
    const bodyEnd = nextBlock ? nextBlock.index : normalized.length
    const body = normalized.slice(bodyStart, bodyEnd).trim()
    if (!body) fail(`slide ${slide} has an empty body`)
    if (body.includes('<!--') || body.includes('-->')) fail('unrecognized HTML comment')

    notes.push({
      slide,
      startSeconds,
      endSeconds,
      warningSeconds,
      speakers: parseSpeakers(values.speakers, options.allowedSpeakers, metadataBlockIndex),
      body,
    })

    cursor = bodyEnd
    expectedStart = endSeconds
    expectedSlide += 1
  }

  if (normalized.slice(cursor).includes('<!--') || normalized.slice(cursor).includes('-->')) {
    fail('unrecognized or unterminated HTML comment')
  }
  if (notes.length !== options.slideCount) fail(`expected ${options.slideCount} slide metadata blocks`)
  return notes
}
