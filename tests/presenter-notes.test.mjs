import assert from 'node:assert/strict'
import test from 'node:test'
import { formatTimecode, parsePresenterNotes, parseTimecode } from '../src/engine/parsePresenterNotes.ts'

const valid = `<!-- slide
slide: 1
start: 00:00
end: 00:30
speakers: Alex
warning: 00:10
-->

Opening line.

<!-- slide
slide: 2
start: 00:30
end: 01:05
speakers: Alex|Sam
warning: 00:10
-->

Second line.`

const options = { slideCount: 2, allowedSpeakers: ['Alex', 'Sam'] }

function replaceFirst(source, from, to) {
  return source.replace(from, to)
}

test('parses hidden slide metadata and escaped note text', () => {
  assert.deepEqual(parsePresenterNotes(valid, options), [
    { slide: 1, startSeconds: 0, endSeconds: 30, warningSeconds: 10, speakers: ['Alex'], body: 'Opening line.' },
    { slide: 2, startSeconds: 30, endSeconds: 65, warningSeconds: 10, speakers: ['Alex', 'Sam'], body: 'Second line.' },
  ])
})

test('preserves HTML-looking strings as plain body data', () => {
  const source = replaceFirst(valid, 'Opening line.', '<script>alert(1)</script>')
  assert.equal(parsePresenterNotes(source, options)[0].body, '<script>alert(1)</script>')
})

test('parses strict MM:SS values', () => {
  assert.equal(parseTimecode('09:35'), 575)
  assert.throws(() => parseTimecode('9:5'), /MM:SS/)
  assert.equal(formatTimecode(575), '09:35')
})

test('rejects invalid presenter-note sources', () => {
  const cases = [
    ['unknown key', replaceFirst(valid, 'warning: 00:10', 'title: Opening\nwarning: 00:10')],
    ['duplicate key', replaceFirst(valid, 'warning: 00:10', 'warning: 00:10\nwarning: 00:11')],
    ['missing key', replaceFirst(valid, 'warning: 00:10', 'speakers: Alex')],
    ['bad timestamp', replaceFirst(valid, 'start: 00:30', 'start: 0:30')],
    ['first start not zero', replaceFirst(valid, 'start: 00:00', 'start: 00:01')],
    ['gap', replaceFirst(valid, 'start: 00:30', 'start: 00:31')],
    ['overlap', replaceFirst(valid, 'start: 00:30', 'start: 00:29')],
    ['duplicate slide', replaceFirst(valid, 'slide: 2', 'slide: 1')],
    ['bad speaker', replaceFirst(valid, 'speakers: Alex|Sam', 'speakers: Alex|Unknown')],
    ['zero warning', replaceFirst(valid, 'warning: 00:10', 'warning: 00:00')],
    ['warning longer than slide', replaceFirst(valid, 'warning: 00:10', 'warning: 00:31')],
    ['empty body', replaceFirst(valid, 'Opening line.', '   ')],
    ['extra HTML comment', replaceFirst(valid, 'Opening line.', 'Opening line.\n<!-- not allowed -->')],
    ['unterminated block', valid.replace('<!-- slide\nslide: 2', '<!-- slide\nslide: 2').replace('\n-->\n\nSecond line.', '\n\nSecond line.')],
    ['NUL character', `${valid}\u0000`],
    ['DEL character', `${valid}\u007F`],
    ['C1 control character', `${valid}\u0085`],
  ]

  for (const [name, source] of cases) {
    assert.throws(() => parsePresenterNotes(source, options), undefined, name)
  }
})
