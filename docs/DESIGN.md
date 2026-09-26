# Design

The default look is **Daylight**: warm paper, near-black ink and one
burnt-red accent. Manrope sets the headings and Hanken Grotesk everything
else. Layouts are open and carried by type, whitespace and thin rules. There
are no cards, gradients or drop shadows. Real screenshots and real numbers
are the evidence.

Everything below is expressed as tokens, so a theme (see
`src/themes/README.md`) can change the palette and fonts without touching a
layout.

## The canvas

- Every slide is a fixed **1280×720 px** logical canvas. The engine scales
  it to the window, the presenter view, the overview grid and exports.
- Size everything in `px` inside slides. Viewport units and media queries
  don't work there, because the stage is scaled with a transform.
- Kit slides have `72px 96px` padding and a `36px` vertical gap between
  blocks (`SlideShell`).

## Tokens

Defined in `src/styles/tokens.css`. Themes override them.

| Token | Default | Use |
|---|---|---|
| `--bg` | `#f7f6f2` | Slide background |
| `--bg-raised` | `#eeece5` | Raised panels, image backdrops |
| `--bg-inset` | `#f0eee8` | Inset wells (terminal, screenshot frames) |
| `--border` | `#dad8cf` | Default 1px rule |
| `--border-bright` | `#c4c1b7` | Stronger rules, tracks, table header line |
| `--text` | `#252521` | Headings and body |
| `--text-dim` | `#62625b` | Secondary text |
| `--text-faint` | `#706f67` | Kickers, dates, captions |
| `--accent` | `#b93723` | The one accent colour |
| `--accent-dim` | `#f3e1d9` | Halo behind the current timeline stop |
| `--status-good` | `#237349` | "live" |
| `--status-warn` | `#93600b` | "scheduled", tags, terminal notes |
| `--font-display` | Manrope | Headings, wordmarks, big numbers |
| `--font-body` | Hanken Grotesk | Body text |
| `--font-label` | = body | Kickers, captions, table headers |
| `--font-code` | system monospace | Terminal lines |

Each deck can also set `accent` in `deck.ts` (any CSS colour). That becomes
`--deck-accent`, which the progress rail, kickers, leads and `<em>` use.

shadcn/ui colours (`--primary`, `--muted`, `--ring`, …) are derived from these
tokens in `src/styles/global.css`, so embedded controls follow the theme too.

## Type scale (px on the 1280×720 canvas)

| Element | Size | Weight / tracking |
|---|---|---|
| Title wordmark | 92 | 600, −0.065em |
| Section title | 88 | 600, −0.05em |
| Closing wordmark | 72 | 600, −0.06em |
| Stat value | 64 | 600, −0.045em |
| Statement | 58 | 600, −0.038em |
| Quote | 48 | 600, −0.032em |
| Slide title | 46 | 600, −0.035em |
| Title subtitle | 27 | body, dim |
| Bullet body | 25 | body |
| Two-column text | 24 | body |
| Bullet lead, table cell | 23 | accent / body |
| Timeline label | 22 | display 600 |
| Terminal line | 18 | code |
| Kicker, caption, labels | 15 | label, faint |

Headings use tight negative tracking. Kickers and labels are plain: no
uppercase, no letter-spacing.

## Using colour

- The accent is used sparingly: a word, a label, a single rule, the filled
  part of a track. Never a large fill.
- Status colours mean something. Use `live` / `scheduled` / `stale` only when
  the room needs to know how fresh a number is.
- Structure comes from type size, whitespace and 1px rules, not boxes.

## Motion

Slides change with a short slide transition; that is the only motion.
`prefers-reduced-motion` turns it off. Keep it that way: an animation library
is not part of the kit.

## The kit

Import from `src/kit/index.ts`. `src/decks/demo/slides.tsx` shows every
layout in use.

| Layout | Props | Use it for |
|---|---|---|
| `TitleSlide` | `kicker`, `title`, `subtitle?`, `date?`, `logo?` | The opener |
| `SectionSlide` | `number`, `title`, `kicker?` | A change of topic |
| `StatementSlide` | `kicker?`, `children`, `attribution?` | One sentence. `<em>` takes the accent |
| `BulletBoard` | `kicker?`, `title`, `items: { lead, body, state? }[]` | 3–5 points. `state`: `live` / `scheduled` / `stale` |
| `TwoColumn` | `kicker?`, `title?`, `left`, `right`, `ratio?` | A story plus context |
| `TimelineSlide` | `kicker?`, `title`, `stops: { date, label, detail?, state? }[]` | Up to ~6 milestones; `state`: `past` / `current` / `future` |
| `DataTable` | `kicker?`, `title`, `columns`, `rows`, `accentCol?` | A small comparison |
| `StatBoard` | `kicker?`, `title?`, `stats: { value, label, color? }[]` | 2–4 numbers you can support |
| `TerminalSlide` | `kicker?`, `title?`, `header?`, `lines: { kind, text }[]` | Commands (`cmd`), output (`out`), notes (`note`) |
| `QuoteSlide` | `kicker?`, `quote`, `attribution` | A real quote with a real source |
| `ImageSlide` | `kicker?`, `title?`, `src?`, `alt?`, `caption?`, `fullBleed?` | One image |
| `ScreenshotPairSlide` | `kicker?`, `title`, `lead?`, `left`, `right` | Two screens; `lead` adds copy and sizes by `aspect` |
| `ClosingSlide` | `kicker?`, `title`, `contact?`, `cta?`, `codes?`, `logo?` | The close; `codes` adds QR codes |
| `SlideShell` | `kicker?`, `align?`, `className?`, `children` | The frame for a custom slide |

Keep text short enough to fit. Rough limits: slide titles ≤ 45 characters,
statements ≤ 90, bullet bodies ≤ 80, stat labels ≤ 30.

### Custom slides

When no layout fits, write a component that renders inside `SlideShell` and
style it with a CSS module in the deck folder, using tokens and px.
`src/decks/demo/InteractiveDemo.tsx` is an example with live shadcn/ui
controls. Mark interactive areas with `data-slide-interactive` so clicks and
keys work the control instead of changing slide.

For a completely different layout system, see
`src/decks/arrayah-2026-09-20`. It authors on a 1600×900 canvas, scales it by
0.8 and scopes all of its CSS under one class with `@scope`.

### Images and QR codes

- Put images in `src/decks/<slug>/assets/` and import them. Vite then
  fingerprints them and the build fails if one is missing.
- Phone screenshots look best in `ScreenshotPairSlide` with `lead` and
  `aspect` (e.g. `'1206 / 2622'`).
- `node scripts/gen-qr.mjs <url> src/decks/<slug>/assets/<name>.svg` makes a
  QR code in the theme's ink and paper colours. Pass it to `ClosingSlide`
  `codes`, and always spell out the URL as the caption.
