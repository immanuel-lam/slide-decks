// Generates a QR code SVG for a slide. Dark modules on a light tile, because
// inverted (light-on-dark) codes scan unreliably.
//
//   node scripts/gen-qr.mjs <url> <output.svg>
//   node scripts/gen-qr.mjs https://example.com src/decks/my-deck/assets/site-qr.svg
//
// Then import the SVG in the deck and pass it to ClosingSlide `codes`.
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import QRCode from 'qrcode'

const [target, output] = process.argv.slice(2)

if (!target || !output) {
  console.error('usage: node scripts/gen-qr.mjs <url> <output.svg>')
  process.exit(1)
}
if (!/^https?:\/\//.test(target)) {
  console.error(`refusing to encode a non-http(s) target: ${target}`)
  process.exit(1)
}
if (!output.endsWith('.svg')) {
  console.error('output must be an .svg file')
  process.exit(1)
}

const svg = await QRCode.toString(target, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2,
  color: { dark: '#252521', light: '#f7f6f2' },
})

const path = resolve(output)
await mkdir(dirname(path), { recursive: true })
await writeFile(path, svg)
console.log(`wrote ${output} for ${target}`)
