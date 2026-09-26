import assert from 'node:assert/strict'
import test from 'node:test'
import { SLIDE_PAGE_POINTS, buildImagePdf } from '../src/engine/imagePdf.ts'

// Smallest byte sequence the writer accepts as a JPEG (SOI marker + filler).
const fakeJpeg = (fill) => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, fill, fill, 0xff, 0xd9])
const text = (bytes) => new TextDecoder('latin1').decode(bytes)

test('writes one page per image at the slide page size', () => {
  const pdf = text(buildImagePdf([
    { jpeg: fakeJpeg(1), width: 2560, height: 1440 },
    { jpeg: fakeJpeg(2), width: 2560, height: 1440 },
  ]))

  assert.match(pdf, /^%PDF-1\.4\n/)
  assert.match(pdf, /\/Type \/Pages \/Count 2 \/Kids \[3 0 R 6 0 R\]/)
  assert.equal(pdf.match(/\/Type \/Page /g).length, 2)
  assert.equal(pdf.match(/\/MediaBox \[0 0 960 540\]/g).length, 2)
  assert.match(pdf, /\/Width 2560 \/Height 1440 .*\/Filter \/DCTDecode/)
  assert.deepEqual(SLIDE_PAGE_POINTS, { width: 960, height: 540 })
  assert.match(pdf, /%%EOF\n$/)
})

test('the xref table points at every object', () => {
  const bytes = buildImagePdf([{ jpeg: fakeJpeg(7), width: 10, height: 10 }])
  const pdf = text(bytes)
  const startxref = Number(/startxref\n(\d+)\n/.exec(pdf)[1])

  assert.equal(pdf.slice(startxref, startxref + 4), 'xref')
  const offsets = [...pdf.slice(startxref).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]))
  assert.equal(offsets.length, 5)
  offsets.forEach((offset, i) => {
    assert.equal(pdf.slice(offset, offset + `${i + 1} 0 obj`.length), `${i + 1} 0 obj`)
  })
})

test('rejects empty input, non-JPEG data and bad sizes', () => {
  assert.throws(() => buildImagePdf([]), /at least one page/)
  assert.throws(() => buildImagePdf([{ jpeg: new Uint8Array([0x89, 0x50]), width: 1, height: 1 }]), /not a JPEG/)
  assert.throws(() => buildImagePdf([{ jpeg: fakeJpeg(1), width: 0, height: 1 }]), /invalid image size/)
})
