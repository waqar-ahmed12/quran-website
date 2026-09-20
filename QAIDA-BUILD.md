# Qaida build — steps and skills

Started 2026-09-14. The free Qaida is a page of its own, `site/qaida/`, which the landing page's **Free Qaida** links
will point at. What it teaches is in `QAIDA-CONTENT.md`; this file is how it gets built. `WEBSITE-BUILD.md` still
applies: the PC safety rules (§0), the tokens and fonts (§5), previewing with `node serve.js`, and the user's standing
rule that every piece of wording Claude writes gets its own text field in an options panel.

**The user asked (2026-09-14):** keep the steps and skills in a file, and keep reminding them. End every reply about the
Qaida with one line: the current step, its skills, and the next step.

## Where we are

**Steps 1–4 of 13 built, awaiting sign-off** — the Qaida home, Lesson 1, sound and tracing, and Lesson 2 with the
practice engine (`practice.js`) that lessons 4–14 reuse. Step 4 has not been seen in a browser yet.

**Step 5, Lesson 3, is specified but not built** (2026-09-20): `docs/lesson-3/`, in the same shape as
`docs/lesson-2/`. It needs no change to `practice.js`. One thing is settled with the teacher before any code —
`docs/lesson-3/09-open-questions.md` §1, the lesson's length.

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
| Finishing a drill lesson | **A recommendation, not a gate** *(2026-09-19)*: "a recommendation that you seem okay, let's move on". A missed letter **comes back more often but never straight away**; one missed repeatedly earns "go back and look at it again" — advice, never a block |
| Mixed review | **Every later lesson mixes in** earlier material *(2026-09-19)*. The lesson's own items are the gate; review items ride along and never are. Answers the "ask first" on steps 6 and 8 |
| Skipping ahead | **Allowed** *(2026-09-19)*: "if the user wanted to skip they can, but they should also be advised that if they are new, it is recommended to go with the flow". **Nothing is locked.** A lesson out of turn advises once, then lets them through. Overrules step 1's locks — see `docs/lesson-2/09-going-in-order.md` |
| A letter is "known" | **Three right answers in a row** *(2026-09-19: "i guess three")* |
| "You seem ready" | **Four fifths of the letters known, and no missed letter still shaky** *(2026-09-19: "4 fifth without mistakes, if mistake, repeat the mistake and practice all letters" — Claude's reading)*. A mistake repeats the letter (more often, never straight away) and every letter stays in the mix |
| A writing board | **In every lesson, always available** *(2026-09-19: "we don't know when someone would need to write")*. A **Board** button in every lesson's top bar opens a blank board; "Trace it" stays as the shortcut to a letter just missed. Every later lesson copies the button and the tracer dialog |
| Wording | **Never harsh** *(2026-09-19)*. Plain, short, and a wrong answer says what the letter is and nothing more |

## Steps

One step at a time, with the user's sign-off before the next.

**Reordered 2026-09-18.** Sound and tracing were at the end (old steps 7 and 9). The user asked where they were and
said the whiteboard is *"for learning purpose for people, to practice"* — which the end of the queue doesn't serve.
Both attach to Lesson 1, which already exists, so doing them now makes Lesson 1 a complete example of what a lesson
is, and lessons 2–14 get built against it instead of being retrofitted.

| # | Step | Skills | Status |
|---|---|---|---|
| 1 | **The Qaida page, Lesson 1 and the Qaida home.** The 14 lessons (only lesson 1 open) and the progress bar; a first-visit choice of script, names and grouping, changeable any time; Lesson 1, the letters, tap to peek; progress kept on this device; the landing page's look, light and dark; an options panel with tryouts and a text field for every line | `minimalist-ui`, `ui-ux-pro-max`, `full-output-enforcement` | **Built, awaiting sign-off** |
| 2 | **Sound in Lesson 1.** The player, `audio/manifest.json`, the wordless stand-in, the mute switch, and the recording list at `recordings.html` | `ui-ux-pro-max`, `full-output-enforcement` | **Built, awaiting sign-off.** The teacher records gradually (2026-09-18) |
| 3 | **Trace the letters** with a finger, mouse or pen, inside Lesson 1 | `minimalist-ui`, `high-end-visual-design` | **Built, awaiting sign-off.** Was step 9 |
| 4 | **Lesson 2, the recognition drill.** Letters out of order; the practice engine the later exercises reuse | `ui-ux-pro-max`, `minimalist-ui` | **Built, awaiting sign-off** (2026-09-19). Specified in `docs/lesson-2/`; `README.md` there lists where the code differs. Check: `node tools/qaida-check.js` |
| 5 | **Lesson 3, letter shapes.** Easy shapes to hard ones, then start / middle / end | `minimalist-ui`, `ui-ux-pro-max` | **Specified 2026-09-20, not built.** `docs/lesson-3/`; read `09-open-questions.md` §1 first — the lesson is too long as drawn, and that is settled before building |
| 6 | **Lessons 4–6: zabar, zair, paish,** each with its exercise and mixed review | `ui-ux-pro-max`, `full-output-enforcement` | Answered 2026-09-19: mixed review carries through **every** later lesson |
| 7 | **Lessons 7–9: tanween, zabar + alif, standing harakaat** (the two scripts write some of these marks differently) | `ui-ux-pro-max`, `full-output-enforcement` | |
| 8 | **Lessons 10–14: wow and yaa (leen and madd), jazam** | `ui-ux-pro-max`, `full-output-enforcement` | Answered 2026-09-20: **jazam stays last**, after leen |
| 9 | **The rest of the recordings:** the marks in every lesson, and 3–4 example words per exercise | `ui-ux-pro-max`, `full-output-enforcement` | Each lesson adds its rows to the recording list as it's built |
| 10 | **Record your own voice** and play it back against the teacher's | `ui-ux-pro-max`, `minimalist-ui` | Only means something once the recordings are in |
| 11 | **Finish screen:** a mark for each finished lesson, and a last screen pointing to one-to-one lessons | `minimalist-ui` | |
| 12 | **Polish:** spacing, lettering, motion | `high-end-visual-design` | |
| 13 | **Audit and connect:** keyboard, screen readers, phones, MASTER.md's checklist; options panels and `recordings.html` removed; a licensed Indo-Pak font in place of the Noto Naskh stand-in | `web-design-guidelines` | The landing page's three Free Qaida links were pointed at `qaida/` early, 2026-09-18 |

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

### Steps 2 and 3 — sound and tracing in Lesson 1

*Built 2026-09-18, after the user asked where the whiteboard and the audio were in the plan.*

**Sound.** `audio.js` plus `audio/manifest.json`. The manifest lists **only what has been recorded**, because the
teacher is uploading gradually ("there are a lot of words") — anything not listed simply has no recording, and the
page says so instead of breaking. Filenames are ASCII slugs (`letters/alif.mp3`), since Arabic in a filename is
fragile across Windows, git and the server; one recording serves both scripts, because `shell.keyOf` already folds
ک ہ ی onto ك ه ي. Tapping a letter shows its name and plays it; a speaker mark appears only on letters that have a
real recording; a line under the progress bar says how many are in. A mute switch sits in the top bar, kept on the
device like the theme. Nothing autoplays.

**The stand-in is a wordless hum, not speech** (`make-placeholder-voice.js` writes the WAV by hand — no ffmpeg, no
Python). The user asked for "something resembling voice" rather than a beep; a human timbre that says nothing keeps
that feel without breaking the rule that a student must never hear a machine pronounce a letter.

**The recording list** (`recordings.html`) is for the teacher only — nothing on the site links to it. It lists every
clip wanted, checks the folder for files, and writes out a ready-made `manifest.json` to paste. Each later lesson
adds its rows as it's built. Removed at step 13.

**Tracing.** `trace.js` — tapping a letter now also fills a strip under the grid (the letter, its name, "Hear it
again", "Trace it"), because a tile is itself a button and can't hold buttons of its own. "Trace it" opens a board
with the letter faint underneath, drawn with a finger, mouse or pen; undo, clear, and hide the letter to try from
memory. **No marking:** handwriting recognition on Arabic isn't reliable enough to tell a student they're wrong.

**After the user's look (2026-09-18):** the guide letter sat low for ج ح خ ع غ ي. CSS centres a letter's *text box*,
and those letters carry most of their weight below the line they sit on. It's now drawn onto its own canvas and
centred on its **ink**, measured with `measureText`, so every letter sits in the middle of the square whatever its
shape. The lettering and colour still come from CSS, so it follows the script and the theme.

Checked with `node --check`. **Not seen in a browser** — the user previews it.

### Step 4 built — Lesson 2 and the practice engine

*2026-09-19, after the user answered the open questions ("i guess start building").*

**What exists.** `practice.js` is the drill engine: no DOM, no storage of its own, and it doesn't know its items are
letters or that sound exists. `lesson-2.html` and `lesson-2.js` are its first customer: a letter (or a name) and
answers to pick from, one question at a time, no timer, no score, no red. A missed letter comes back **more often but
never straight away** (a weighted draw, not a queue); one missed again and again earns "look at it in Lesson 1" advice;
and at **four fifths known with nothing missed still shaky** the page says *you seem to know these* and marks the
lesson finished — a recommendation, and the drill carries on. Storage gained a validated `drill` per lesson; the home
counts "N of 29 letters known" for it by declaring `progress: 'drill'` on the lesson rather than testing its number.

**The user's answers** are in the Decisions table above and in `docs/lesson-2/10-open-questions.md`. Three of the eight
questions weren't understood ("choices per question", "trace", "screen readers"): ask in plain words next time.

**The board.** The user asked for a writing board in every lesson. `trace.js` gained a blank mode, opened from a **Board**
button now in the top bar of Lessons 1 and 2 (and every later lesson, by copying the markup). It has no guide letter, so it
can never give away a drill answer, and what is written stays until Clear or a reload.

**Also changed.** Lesson 1's Next is a real link to Lesson 2. A global `[hidden]` rule was missing, so any element whose class
set `display` ignored the attribute: by the CSS cascade, Lesson 1's "Start again" and its empty letter strip would have shown
before anything was tapped. Fixed for both lessons; not confirmed in a browser.
The options panel has a "The drill" section, and every choice in it exports to `setting.txt`.

**Checked.** `node tools/qaida-check.js` runs 50 checks on the engine and storage, with no browser, and all pass; every script passes
`node --check`. **Not seen in a browser** — the user previews it. **Not built:** `docs/lesson-2/09-going-in-order.md`
(nothing locked, advice at the door), which the spec says to ask about. Lesson 2 opens from the home once Lesson 1 is finished.
`design-system/quran-landing/pages/qaida.md` is **not yet updated**: it is written after the user has seen the page.

### Step 4 planned, and Export settings added to the Qaida panel

*2026-09-19. The user: "plan the next lesson, do add the export settings… make a folder of md of lesson 2, so that
other models look at it for dev."*

**Lesson 2 is specified, not built.** `docs/lesson-2/` holds eleven files — the pedagogy, the `practice.js` API,
the storage extension and its validation, the page and its CSS, every line of wording, accessibility, the options
panel, the file list and build order, and the open questions. `README.md` in that folder gives the read order. It
is a specification another model builds from; the design record in `design-system/quran-landing/pages/qaida.md` is
written afterwards, once the code exists and the user has seen it.

**Three decisions, all in the Decisions table above.** Finishing is a **recommendation** rather than a gate; mixed
review **carries through every later lesson**; and **skipping ahead is allowed**, with advice, which overrules step
1's locks across the whole Qaida (`docs/lesson-2/09-going-in-order.md` — not built yet either).

**Export settings** now sit at the top of the Qaida options panel, the same as the landing page's
(`site/main.js:806-959`): every control registers under `"<section> :: <label>"`, **Export** turns the lot into one
block and copies it, **Import** reads that block back. That is how the Qaida's picks reach `setting.txt`. Two
things went with it: the **Words** section is named per page (`Words (home)`, `Words (lesson 1)`) so one block can
hold several pages without a title landing on the wrong one, and the **localhost gate was dropped**, so the panel
shows on the hosted preview the way the landing page's already does — the whole point of an Export button is that
someone else can send their picks back. One line, easily put back.

Checked with `node --check`. **Not seen in a browser** — the user previews it.
