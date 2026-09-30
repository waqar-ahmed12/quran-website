# Lesson 11 — build specification

**Read `docs/lesson-4/` in full, then `docs/lesson-5/` to `docs/lesson-10/`, before this folder** — and
`docs/step-9/README.md` for where this lesson sits in the phase. Lesson 11 is the eighth customer of `mark-lesson.js`
and the tenth of `practice.js`. `tail`, `suffixOf`, the wide tile and the halo are in `docs/lesson-8/`; `forms`,
`formOf`/`drawnOf` and the same-sound tile are in `docs/lesson-9/`; the wow, its joining and its descender are in
`docs/lesson-10/`. **This folder is only what is new.** Where it is silent, those folders are the specification and
the built code is the answer.

Written 2026-09-28 (the user: "please plan out every lesson seperately"). `docs/step-9/README.md` §2 had said
"Lesson 11 — plan and build together; it is thin". It is still thin, but it now has a plan of its own, like every
lesson before it, and the planning turned up one thing the phase map got wrong (below).

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, written *after*
the code exists and the user has seen it.

## Status — specified, not built

| | |
|---|---|
| **Written** | this folder. **Nothing was written to `site/`** |
| **Built** | nothing |
| **Blocked on** | nothing hard. A look at Lesson 10 first is recommended, not a gate (`07` §0) |
| New page files | `lesson-11.html` and `exercise-11.html`, copies of Lesson 10's. **No new script** |
| New data | one row in `MARKS` (`'damma-waw'`), with one `forms` entry. **No new recordings** |
| Code | one line in `mark-lesson.js` (a board line that differs by script, `03` §4) |

## What Lesson 11 is, in a paragraph

**Paish, then a wow, makes the long "oo".** بُ "bu", بُو "buu", as in نُورٌ *nuur*, "light", and يَقُولُ *yaquulu*,
"he says". The paish is Lesson 6's. The wow is a letter the student knows. It has no vowel of its own here, so it
**stretches** the paish before it. Lesson 10's wow did a different job: after zabar, with a jazam, it made "au". The
content plan's one request for this lesson (`QAIDA-CONTENT.md` item 11) is the **minimal pair**: same letter, بَوْ
against بُو, "since wow is doing two different jobs one lesson apart".

## The one thing that is genuinely new

**The two scripts disagree about a mark, not a character.** The Indo-Pak mushaf puts a jazam on every letter that has
no vowel of its own, long-vowel letters included: **بُوْ**. The Madani mushaf marks only a letter that *stops* the
sound, and leaves a long-vowel letter bare: **بُو**. In Lesson 9 the two scripts drew the same mark with different
characters. Here one script draws a mark that the other leaves out altogether. The machinery is still Lesson 9's
`forms`, so the drawing needs no new code, but **what the lesson's contrast looks like depends on the script**:

| | Lesson 10 | Lesson 11 | What tells them apart |
|---|---|---|---|
| **Indo-Pak** | بَوْ | بُوْ | **only the mark before the wow**: zabar or paish. Same place, different stroke, which is Lesson 6's hardest contrast |
| **Madani** | بَوْ | بُو | the mark before the wow, **and** whether the wow carries a mark at all |

`docs/step-9/README.md` §1 called this lesson "nothing structural — Lesson 8 with paish and a wow". That is wrong on
this one point, and it is corrected there.

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | the long "oo", the minimal pair, what the drill can and cannot test, what is out |
| `02-the-wow-and-the-scripts.md` | the characters, **why the scripts differ and how to check it first**, which letters (27) |
| `03-code-changes.md` | the row, the ids, `masteredCount`, the per-script board line, the same-sound tile, audio |
| `04-page-and-wording.md` | `lesson-11.html`: every attribute and string that differs from `lesson-10.html` |
| `05-words.md` | the walkthrough and `exercise-11.html`: fifteen candidates |
| `06-files-and-steps.md` | the file list in build order, the checks, the browser checklist |
| `07-open-questions.md` | what needs the teacher. **If you read only one file, read this one** |

## Rules that apply to this work

Unchanged since `docs/lesson-4/README.md`:

- **This PC is infected.** No `python`, `py`, `pip`, `ffmpeg` or Git Bash; the **Bash tool is broken**, so use
  **PowerShell**. `node` is safe. Never `dangerouslyDisableSandbox`. PNG or WebP, never `.jpg`.
- **Check with `node --check`** and every script in `tools/`. **Eight lessons** now sit behind those scripts.
- **Every line of wording gets its own text field** in the options panel (`data-words` / `data-words-attr`).
- **Never ask the user to choose a look in words.** Build it as a row in the options panel and let them look.
- **Plain names, not grammar words.** "Paish and wow", never "madd".
- **Nothing is locked**, **never harsh**, **no numbers on the page**.
- **Real words only, never invented**, checked by the teacher before they ship.
- **Compose every mark from code points.** Never paste a combining character into source.
- **The user previews and signs off.** End every reply about the Qaida with the step line.

## The three things most likely to go wrong

1. **The id following the drawing.** Madani draws no jazam, so its glyph is one code point shorter than the id. The
   id comes from `suffixOf` (U+064F U+0648 U+0652 in both scripts), never from `drawnOf`, or a switch of script throws
   every letter's credit away. Lesson 9's rule (`03` §2).
2. **Lesson 10's jazam line copied unchanged.** It says "the small mark on the wow is jazam". On a Madani page of
   this lesson there is no mark on the wow, so the line would describe something that isn't there. The line becomes
   one per script (`03` §4).
3. **The feature row too wide.** A quartet plus the same-sound tile is five tiles on one row, three of them wide.
   Measure it on a phone before touching `qaida.css` (`04` §7).
