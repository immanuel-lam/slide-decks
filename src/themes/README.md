# Themes

A theme changes the palette and fonts of a deck without touching any layout.
The default look (Daylight) lives in `src/styles/tokens.css`; every folder
here is an alternative.

## Add a theme

1. Create `src/themes/<name>/theme.css` (`<name>`: lowercase letters, digits
   and dashes). The folder is registered automatically.
2. Declare only the tokens you change, under `[data-theme='<name>']`:

   ```css
   /* optional: fonts first */
   @import '@fontsource-variable/inter';          /* an npm font package, or */
   @font-face {                                   /* your own licensed files */
     font-family: 'Acme Sans';
     src: url('./fonts/acme-sans.woff2') format('woff2');
     font-weight: 100 900;
     font-display: swap;
   }

   [data-theme='acme'] {
     --bg: #ffffff;
     --bg-raised: #f2f4f7;
     --bg-inset: #f7f8fa;
     --border: #dde1e6;
     --border-bright: #c3c9d1;
     --text: #0f1b2d;
     --text-dim: #4a5566;
     --text-faint: #5f6b7a;
     --accent: #d9480f;
     --accent-dim: #fde4d6;
     --status-good: #1f7a45;
     --status-warn: #8a5a00;
     --font-display: 'Acme Sans', sans-serif;
     --font-body: 'Inter Variable', sans-serif;
   }
   ```

3. Check it: `npm run check:theme -- <name>`. It tests the text, accent,
   status and button colours against WCAG contrast (4.5:1). Colours must be
   hex or `rgb()`.
4. Use it: set `theme: '<name>'` in a deck's `deck.ts`, or preview any deck
   with `?theme=<name>` in the URL (also `npm run export -- <slug> --theme
   <name>`).

## Tokens

| Token | Role |
|---|---|
| `--bg` | Slide background |
| `--bg-raised` | Raised panels |
| `--bg-inset` | Inset wells |
| `--border`, `--border-bright` | Hairlines, stronger rules |
| `--text` | Headings and body |
| `--text-dim` | Secondary text |
| `--text-faint` | Kickers and captions |
| `--accent` | The single accent colour |
| `--accent-dim` | A pale tint of the accent |
| `--status-good`, `--status-warn` | "live" and "scheduled" labels |
| `--font-display`, `--font-body` | Heading and body faces |
| `--font-label`, `--font-code` | Labels and terminal text |

`midnight/` is a complete dark example.

## Logos

Put a logo next to the theme (`src/themes/<name>/logo.svg`), import it in
the deck and pass it to `TitleSlide` or `ClosingSlide` as `logo`.
