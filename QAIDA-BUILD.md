# Qaida build — steps and skills

Started 2026-09-14. The free Qaida is a page of its own, `site/qaida/`, which the landing page's **Free Qaida** links
will point at. What it teaches is in `QAIDA-CONTENT.md`; this file is how it gets built. `WEBSITE-BUILD.md` still
applies: the PC safety rules (§0), the tokens and fonts (§5), previewing with `node serve.js`, and the user's standing
rule that every piece of wording Claude writes gets its own text field in an options panel.

**The user asked (2026-09-14):** keep the steps and skills in a file, and keep reminding them. End every reply about the
Qaida with one line: the current step, its skills, and the next step.

## Where we are

**Step 1 of 12 — the Qaida page and Lesson 1.** In progress.

## Decisions

| Question | Answer (the user, 2026-09-14) |
|---|---|
| Script | **Both, with a switch:** Indo-Pak and Madani. *2026-09-18:* the switch changes the **letters**, not just the font — 29 either way, Indo-Pak with و before ه and the forms ک ہ ی. Laam only, no lam-alif |
| Names | **Both, the student picks:** zabar, zair, paish, jazam, or fatha, kasra, damma, sukoon. *2026-09-18:* the **letters** keep their Arabic names in both (Baa, not Be); the choice changes the marks and the titles of lessons 4–14 |
| Transliteration | **Off, tap to peek:** tapping a letter shows its name for a moment |
| Progress | **A progress bar** showing how far the student has reached, kept on the device (no accounts) |
| Recordings | **Left out for now.** No sound until the user brings it back. Never an AI voice |
| Extras | **All of them, later:** record your own voice, trace the letters, finish screen. Not in step 1 |
| Letter order | **Claude's call** (the user: "do what you like best"): alphabet order, taught in shape families. See `QAIDA-CONTENT.md` |
| Match a printed Qaida | The user wasn't sure. Alphabet order keeps the page in step with a printed Qaida anyway |

## Steps

One step at a time, with the user's sign-off before the next.

| # | Step | Skills | Status |
|---|---|---|---|
| 1 | **The Qaida page and Lesson 1.** A home with the 14 lessons (only lesson 1 open) and the progress bar; a first-visit choice of script and names, changeable any time; Lesson 1, the 29 letters, tap to peek; progress kept on this device; the landing page's look, light and dark; an options panel with tryouts and a text field for every line | `minimalist-ui`, `ui-ux-pro-max`, `full-output-enforcement` | **In progress** |
| 2 | **Lesson 2, the recognition drill.** Letters out of order; the practice engine the later exercises reuse | `ui-ux-pro-max`, `minimalist-ui` | |
| 3 | **Lesson 3, letter shapes.** Easy shapes to hard ones, then start / middle / end | `minimalist-ui`, `ui-ux-pro-max` | |
| 4 | **Lessons 4–6: zabar, zair, paish,** each with its exercise and mixed review | `ui-ux-pro-max`, `full-output-enforcement` | Ask first: mixed review in every later lesson? |
| 5 | **Lessons 7–9: tanween, zabar + alif, standing harakaat** (the two scripts write some of these marks differently) | `ui-ux-pro-max`, `full-output-enforcement` | |
| 6 | **Lessons 10–14: wow and yaa (leen and madd), jazam** | `ui-ux-pro-max`, `full-output-enforcement` | Ask first: jazam before or after leen? |
| 7 | **Sound:** the user's recordings in every lesson | `ui-ux-pro-max`, `full-output-enforcement` | Left out for now |
| 8 | **Record your own voice** and play it back | `ui-ux-pro-max`, `minimalist-ui` | |
| 9 | **Trace the letters** with a finger or mouse | `minimalist-ui`, `high-end-visual-design` | |
| 10 | **Finish screen:** a mark for each finished lesson, and a last screen pointing to one-to-one lessons | `minimalist-ui` | |
| 11 | **Polish:** spacing, lettering, motion | `high-end-visual-design` | |
| 12 | **Audit and connect:** keyboard, screen readers, phones, MASTER.md's checklist; options panels removed; a licensed Indo-Pak font in place of the Noto Naskh stand-in | `web-design-guidelines` | The landing page's three Free Qaida links were pointed at `qaida/` early, 2026-09-18 |

## Skills on this PC

Only the project skills in `.claude/skills/` are installed here. The user-level plugins earlier chats used
(`taste-skill`, `agent-skills`, `ponytail`) are not. Two project skills are the same files under other names:
`minimalist-ui` is `taste-skill:minimalist-skill`, and `high-end-visual-design` is `taste-skill:soft-skill`. Don't run
`ui-ux-pro-max`'s search script (it needs Python, see `WEBSITE-BUILD.md` §0); read its `references/` and `data/*.csv`
directly.

## Step log

### Step 1 — the Qaida page and Lesson 1

*Started 2026-09-14.*

- **First draft, design only (2026-09-14, the user: "goal is the design, not the content… just the first lesson").**
  Built with `ui-ux-pro-max` (references and data read directly) and `minimalist-ui`: `site/qaida/index.html`,
  `qaida.css`, `qaida.js`, and the temporary `qaida-options.js`. Lesson 1 only: the 29 letters right to left in shape
  families, tap to peek, a progress bar kept on this device, a first-visit choice of script and names, light and dark
  shared with the home page, a locked Lesson 2 button. No recordings or whiteboard. The Qaida home with all 14 lessons
  is not built yet. **The design is recorded in `design-system/quran-landing/pages/qaida.md`**, with the reasons,
  tokens, every tryout and what's a stand-in. Preview: `http://localhost:8777/site/qaida/`. Not seen in a browser.

- **Repaired, and the Qaida home built (2026-09-18).** The user asked what was there and what was broken. Nine faults,
  three of them choices that silently did nothing. Fixed:
  - **The names choice did nothing** — both name lists held the same strings. The South Asian list now carries the
    Urdu letter names (Be, Te, Se, Jeem, Hey…), and it also decides the titles of lessons 4–14 on the home.
  - **The script choice only swapped a font.** It now changes the letters: Madani 29 in alphabet order, Indo-Pak 30
    in the printed-Qaida order (و before ه, لا included, ک ہ ی). *The user's call, 2026-09-18.*
  - **Progress is kept as letters, not positions**, so switching script keeps credit for the letters both lists share.
  - **Storage reshaped for fourteen lessons** — `{ v: 1, …, lessons: { "1": { seen: […], done } } }`, with the first
    draft's flat list carried over once.
  - **The finished lesson stopped moving forever.** The star turning and the button pulsing were `infinite` and
    restarted on every later visit; they're now one of three choices in Options → "After the last letter", default
    *Settles down*. Also fixed the arrow hover the infinite animation had been overriding.
  - Small things: `tabindex="-1"` so the skip link really moves focus, the Lesson 2 dead anchor is now a button, the
    chooser's script samples align to the start of their box and show each script's own forms (ک ہ ی).
  - **The Qaida home** (`site/qaida/index.html`): the fourteen lessons as cards — open, finished, or locked with the
    reason — one progress bar for the whole Qaida, and "Start again" for everything. Lesson 1 moved to
    `lesson-1.html`; what the two pages share moved into `shell.js`.
  - **The landing page's three Free Qaida links now point at `qaida/`.** They pointed at `#qaida`, which is nothing —
    no such section and no handler, so a click did nothing at all.
  - **The design record was rewritten** to match the files; it had drifted through commit `ae193b3`.

  Checked with `node --check`. **Not seen in a browser** — the user previews it.

- **After the user's first look (2026-09-18).** Seven notes from the screenshots:
  - **Even grid wasn't centred** — it was a CSS grid, which leaves the last, part-full row hard against one edge.
    Now the same centred wrap as shape families, only with one even gap.
  - **Indo-Pak: laam only, no lam-alif.** Both lists are 29 again, so switching script now costs nothing at all.
  - **The letters keep their Arabic names in both sets of mark names** — Baa, not Be. One list, one field in Options.
  - **The gold edge was too faint in the dark theme.** The dark gold is brighter (`rgb(198 152 62)`) and there's a
    **Gold edge strength** slider (`--edge`, 0.55 by default) on both pages.
  - **The name overlapped ج ح خ ع غ م ي when tapped** — they hang below the line they sit on. The letter now lifts
    and shrinks further, and the name carries a band of the tile's own colour that the tail goes behind.

  Still open from that look: whether the brighter gold is enough, and whether Ḥaa / Ṣaad / ʿAyn should lose their
  dots for a beginner.
