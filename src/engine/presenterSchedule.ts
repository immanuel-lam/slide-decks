import type { PresenterNote } from './types.ts'

export type PresenterScheduleState = 'ahead' | 'on-time' | 'wrap-up' | 'behind'

export interface PresenterScheduleSnapshot {
  state: PresenterScheduleState
  expectedSlide: number
  remainingSeconds: number
  targetLabel: string
  deltaLabel: string
}

type ScheduleNote = Pick<PresenterNote, 'slide' | 'startSeconds' | 'endSeconds' | 'warningSeconds'>

/** Format a duration as a zero-padded MM:SS value. */
export function formatDuration(seconds: number): string {
  const wholeSeconds = Math.max(0, Math.floor(Math.abs(seconds)))
  const minutes = Math.floor(wholeSeconds / 60)
  const remainder = wholeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function expectedIndex(
  notes: readonly ScheduleNote[],
  elapsedSeconds: number,
): number {
  if (elapsedSeconds < notes[0].startSeconds) return 0

  const matchingIndex = notes.findIndex((note) => elapsedSeconds < note.endSeconds)
  return matchingIndex === -1 ? notes.length - 1 : matchingIndex
}

function formatDelta(remainingSeconds: number): string {
  return remainingSeconds <= 0
    ? `${formatDuration(remainingSeconds)} OVER`
    : `${formatDuration(remainingSeconds)} LEFT`
}

export function getPresenterSchedule(
  notes: readonly ScheduleNote[],
  currentIndex: number,
  elapsedSeconds: number,
): PresenterScheduleSnapshot {
  if (notes.length === 0) {
    throw new Error('Presenter schedule requires at least one note')
  }

  const safeIndex = Math.max(0, Math.min(notes.length - 1, Math.trunc(currentIndex)))
  const currentNote = notes[safeIndex]
  const remainingSeconds = currentNote.endSeconds - elapsedSeconds

  let state: PresenterScheduleState
  if (elapsedSeconds < currentNote.startSeconds) {
    state = 'ahead'
  } else if (elapsedSeconds >= currentNote.endSeconds) {
    state = 'behind'
  } else if (remainingSeconds <= currentNote.warningSeconds) {
    state = 'wrap-up'
  } else {
    state = 'on-time'
  }

  const expected = notes[expectedIndex(notes, elapsedSeconds)]

  return {
    state,
    expectedSlide: expected.slide,
    remainingSeconds,
    targetLabel: `TARGET ${formatDuration(currentNote.startSeconds)}–${formatDuration(currentNote.endSeconds)}`,
    deltaLabel: formatDelta(remainingSeconds),
  }
}
