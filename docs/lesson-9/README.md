# Lesson 9 — build specification

**Read `docs/lesson-4/` in full, then `docs/lesson-5/` to `docs/lesson-8/`, before this folder.** Lesson 9 is the
sixth customer of `mark-lesson.js` and the eighth of `practice.js`. The engine contract, the page, the formats, the
wording rules and the accessibility limits are in `docs/lesson-4/`; twins and `which-mark` are in `docs/lesson-5/`;
`against` and the trio/quartet board are in `docs/lesson-6/`; `SETS`, `partsOf` and an item's `parts` are in
`docs/lesson-7/`; `tail`, `suffixOf` and the wide tile are in `docs/lesson-8/`. **This folder is only what is new.**
Where it is silent, those five folders are the specification and the built code is the answer.

Written 2026-09-28, for whoever continues `QAIDA-BUILD.md` **step 8**: *"Lessons 7–9: tanween, zabar + alif,
standing harakaat."* Lessons 7 and 8 are built; this is the last of the three.

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, written *after*
the code exists and the user has seen it.

## Status — specified, not built

| | |
|---|---|
| **Written** | this folder only. **Nothing was written to `site/`** |
| **Built** | nothing |
| **Blocked on** | nothing hard. `07` §0 recommends a look at lessons 7 and 8 first, because neither has been seen by the user and this lesson leans on both |
| New page files | `lesson-9.html` and `exercise-9.html`, both copies. **No new script** — `mark-lesson.js`, `spell.js` and `exercise.js` serve it |
| New data | three rows in `MARKS`, one in `SETS`, and one new idea: **a mark that the two scripts write with different characters** (`03`) |

## What Lesson 9 is, in a paragraph

**The long vowels, written as marks instead of letters.** بٰ says "baa" — the same sound as Lesson 8's بَا, with
the alif shrunk to a small upright stroke over the letter. بٖ says "bii" and بٗ says "buu". An Indo-Pak Qaida calls
them **khari zabar, khari zair and ulta paish** — the *standing* zabar, the *standing* zair, the *upside-down*
paish — and a student will meet them on almost every page of an Indo-Pak mushaf: هٰذَا, ذٰلِكَ, بِهٖ, لَهٗ.

## The one thing that is genuinely new

**Until now, both scripts wrote the same characters.** Indo-Pak and Madani differed in their letters (ک ہ ی) and in
their fonts (Lesson 7's tanween), never in the marks. Here they differ in the marks themselves:

| Sound | Indo-Pak writes | Madani (the mushaf's Uthmani text) writes |
|---|---|---|
| baa | بٰ — the letter and U+0670 alone | بَٰ — **zabar and** U+0670 |
| bii | بٖ — U+0656 alone | بِۦ — **zair and** a small yaa, U+06E6 |
| buu | بٗ — U+0657 alone | بُۥ — **paish and** a small waw, U+06E5 |

Measured in the browser pane on 2026-09-28 (`02` §3): every one of these draws in all three faces the site loads,
and the Madani small yaa and small waw are **spacing letters** (Unicode Lm), not marks — they take room after the
letter, the way Lesson 8's alif did.

So `03` splits **what an item is** from **how it is drawn**. The id stays one code point per mark, the same in both
scripts (the Indo-Pak one), so switching script keeps every letter's credit and `shell.masteredCount` needs no
change beyond the row. The glyph goes through a new `formOf(mark, script)`, and a mark row gains `forms` for the
script that writes it differently. **Lessons 4–8 have no `forms` and must come out byte-identical** — that is the
fence, written first (`06` §2, step 1).

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | what "knowing the standing marks" is, the contrast the drill asks about, and what it must never ask |
| `02-the-standing-marks.md` | the six characters, **which letters** (27), where the Qur'an really uses them, and the font measurements |
| `03-one-mark-two-spellings.md` | `forms`, `formOf`, the ids, the tile, the halo, the board's "same sound" tile, and the exact code changes |
| `04-page-and-wording.md` | `lesson-9.html`: every attribute and every string that differs from `lesson-7.html` |
| `05-words.md` | the walkthrough and `exercise-9.html`: fifteen candidates, **and why these ones must be checked against the mushaf** |
| `06-files-and-steps.md` | the file list in build order, the checks, and the browser checklist |
| `07-open-questions.md` | what needs the teacher — **read this one first if you read only one** |

Also read, outside this folder: **`docs/lesson-4/` to `docs/lesson-8/`**, `QAIDA-BUILD.md` (the Decisions table,
"Step 8 built — Lesson 7" and "Step 8 built — Lesson 8"), `QAIDA-CONTENT.md` item 9, `WEBSITE-BUILD.md` §0 and §5,
and the built `marks.js`, `mark-lesson.js`, `shell.js`, `audio.js`, `spell.js`, `exercise.js`, `lesson-7.html` and
`exercise-8.html`.

## Rules that apply to this work

Unchanged since `docs/lesson-4/README.md`. The short version:

- **This PC is infected.** No `python`, `py`, `pip`, `ffmpeg` or Git Bash; the **Bash tool is broken** — use
  **PowerShell**. `node` is safe. Never `dangerouslyDisableSandbox`. PNG or WebP, never `.jpg`.
- **Check with `node --check`** and every script in `tools/`. **Six lessons** now sit behind those scripts.
- **Every line of wording gets its own text field** in the options panel (`data-words` / `data-words-attr`).
- **Never ask the user to choose a look in words** — build it as a row in the options panel and let them look.
- **Plain names, not grammar words** (`fixes/lesson 7/fixes.txt`). Khari zabar, khari zair and ulta paish are what
  a Qaida class calls them, not grammar; the other name set is `07` §2's question.
- **Nothing is locked**, **never harsh**, **no numbers on the page**.
- **Real words only, never invented**, and **checked by the teacher before they ship** — and here, checked against
  the mushaf's own text too (`05` §1).
- **The user previews and signs off.**
- **End every reply about the Qaida** with one line: the current step, its skills, and the next step.

## The three things most likely to go wrong

1. **The id following the drawing.** If an id is built from what is drawn, the Madani بَٰ gets a three-character
   id that *starts with Lesson 4's* بَ, the Indo-Pak بٰ gets another, and a switch of script throws away every
   letter's credit. Ids come from `suffixOf` (one code point, both scripts); glyphs come from `formOf`. `03` §2,
   and a check that switches script and counts.
2. **A missed call site drawing the wrong script.** `glyphOf` is called from `mark-lesson.js`, `spell.js`,
   `exercise.js` and `audio.js`. If the script has to be passed in, one forgotten argument draws Madani marks on an
   Indo-Pak page and nothing fails. `formOf` reads the current script from the shell by default, so a call site that
   forgets cannot be wrong. `03` §3.
3. **Offering بَا as a wrong answer.** بٰ and بَا are **the same sound spelled two ways**. In the name-it drill that
   would pass, and in the by-ear drill it would mark a right answer wrong. Lesson 8's item belongs on the board as
   "the same sound", never among the answers. `01` §3.
