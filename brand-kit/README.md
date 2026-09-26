# brand-kit/

Drop your brand files here, then ask your coding agent to "make a theme from
my brand kit". Useful things to include:

- **Logo** — SVG preferred, PNG is fine.
- **Colours** — a brand guide (PDF or images), design tokens (JSON/CSS), or
  just a text file with hex codes and what each is for.
- **Fonts** — font files (`.woff2`, `.woff`, `.ttf`, `.otf`) **only if your
  licence allows web embedding**. Otherwise just write the font names.
- **Rules** — anything from the brand guide the slides should respect
  (clear space around the logo, colours never to combine, tone of voice).

The agent turns these into a theme in `src/themes/<name>/` and checks its
contrast. Everything in this folder except this README is git-ignored, so
private brand files stay on your machine; the generated theme is what gets
committed.
