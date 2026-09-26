---
name: new-deck
description: Build a new slide deck in this repo from a conversation. Use when the user asks for a presentation, deck, talk, pitch or slides.
---

Follow the "When the user asks for a deck" workflow in `AGENTS.md` exactly:

1. Quick chat: one message, at most five questions (topic and audience,
   length, the one takeaway, material, look), each with a default. Skip what
   the user already told you.
2. Outline: one line per slide with layout, headline and time range. Wait for
   approval.
3. Theme, if the user wants their own look (use the `brand-theme` skill).
4. Build in `src/decks/<slug>/`, copying the patterns in `src/decks/demo/`.
5. Verify with `npm run check`, then look at every slide.
6. Hand off: how to open it, the remaining placeholders, how to export.

Read `docs/DESIGN.md` before writing slides and `PRESENTATION_INPUTS.md`
before using any file the user gives you.
