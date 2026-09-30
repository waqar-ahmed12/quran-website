# Lesson 10 — build specification

**Read `docs/lesson-4/` in full, then `docs/lesson-5/` to `docs/lesson-9/`, before this folder** — and
`docs/step-9/README.md` for where this lesson sits in the phase. Lesson 10 is the seventh customer of
`mark-lesson.js` and the ninth of `practice.js`. `tail`, `suffixOf`, the wide tile and the halo that rings a tail
are in `docs/lesson-8/`; `forms`, `formOf`/`drawnOf` and the same-sound tile are in `docs/lesson-9/`. **This folder
is only what is new.** Where it is silent, those folders are the specification and the built code is the answer.

Written 2026-09-28, for whoever starts `QAIDA-BUILD.md` **step 9**: *"Lessons 10–14: wow and yaa (leen and madd),
jazam."* This is the first of the five.

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, written *after*
the code exists and the user has seen it.

## Status — built 2026-09-28, awaiting the user's look

Built as specified, with the differences listed in `QAIDA-BUILD.md`, "Step 9 built — step 0 and Lesson 10":
`against` in taught order, Madani draws the jazam as U+06E1 (measured), the tile needed no change (measured). The
table below is the plan as it was written.

## Status as planned — specified, not built

| | |
|---|---|
| **Written** | this folder and `docs/step-9/README.md`. **Nothing was written to `site/`** |
| **Built** | nothing |
| **Blocked on** | nothing hard. `docs/step-9/README.md` §0 lists five loose ends to land first; two of them (Lesson 7's words, the home's locks) are the user's own notes |
| New page files | `lesson-10.html` and `exercise-10.html`, both copies of Lesson 8's. **No new script** |
| New data | one row in `MARKS` (`'fatha-waw'`), possibly one `forms` entry (`02` §3), one audio group |

## What Lesson 10 is, in a paragraph

**A wow with a jazam after zabar makes "au".** بَ "ba", بَوْ "bau" — as in يَوْمٌ *yawm*, "a day", and قَوْمٌ
*qawm*, "a people". The zabar is Lesson 4's; the wow is a letter the student knows; what is new is that **the wow
has no vowel of its own** — the small mark on it (the jazam) says so — and it slides into the zabar before it.
A printed Qaida calls it *leen*; the page calls it plainly "zabar and wow" (the user's plain-names rule,
`fixes/lesson 7/fixes.txt`), and the home already does (`shell.js`, Lesson 10's row).

## The one thing that is genuinely new

**A mark the student has not been taught yet appears on every item.** The jazam is Lesson 14. Every mark on every
item so far was the lesson's own mark or one already taught. Here the jazam is part of the *pattern* — the student
learns "zabar, wow, jazam: au" as one shape, the way a printed Qaida teaches leen before jazam, which is why the user
kept jazam last (2026-09-20). So:

- the jazam lives **inside the tail** (`tail: [0x0648, 0x0652]`), never as a mark of its own — so the words check's
  rule "no mark from a later lesson" holds automatically, and no word can carry a jazam anywhere else (`03` §5);
- the board **names it once, in one line**, and does not teach it (`04` §3);
- **its drawing may differ by script** — the Madani mushaf's text writes the sukun as U+06E1, not U+0652. If the
  Madani face draws the two differently, Lesson 9's `forms` carries it and the id does not change (`02` §3).

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | what "knowing zabar and wow" is, the contrast the drill asks about, and what it must never ask |
| `02-the-wow-and-the-jazam.md` | the characters, **which letters** (27), joining, and the sukun-shape measurement |
| `03-code-changes.md` | the row, the ids, `masteredCount`, the tile's descender, the halo, audio, the words check |
| `04-page-and-wording.md` | `lesson-10.html`: every attribute and string that differs from `lesson-8.html` |
| `05-words.md` | the walkthrough and `exercise-10.html`: fifteen candidates |
| `06-files-and-steps.md` | the file list in build order, the checks, the browser checklist |
| `07-open-questions.md` | what needs the teacher — **read this one first if you read only one** |

## Rules that apply to this work

Unchanged since `docs/lesson-4/README.md`:

- **This PC is infected.** No `python`, `py`, `pip`, `ffmpeg` or Git Bash; the **Bash tool is broken** — use
  **PowerShell**. `node` is safe. Never `dangerouslyDisableSandbox`. PNG or WebP, never `.jpg`.
- **Check with `node --check`** and every script in `tools/`. **Seven lessons** now sit behind those scripts.
- **Every line of wording gets its own text field** in the options panel (`data-words` / `data-words-attr`).
- **Never ask the user to choose a look in words** — build it as a row in the options panel and let them look.
- **Plain names, not grammar words.** "Zabar and wow", not "leen"; "jazam", which is what a Qaida class says.
- **Nothing is locked**, **never harsh**, **no numbers on the page**.
- **Real words only, never invented**, checked by the teacher before they ship.
- **Compose every mark from code points** — never paste a combining character into source (every earlier lesson's
  check asserts it).
- **The user previews and signs off.** End every reply about the Qaida with the step line.

## The three things most likely to go wrong

1. **Lesson 4 or Lesson 8 counting Lesson 10's items.** Lesson 10 shares zabar's code point with both. Its suffix is
   three code points (zabar, wow, jazam), so its ids are four characters; `masteredCount`'s suffix-and-length test
   from Lesson 8 must keep `masteredCount(4)` at two-character ids and `(8)` at three. A check that masters one
   item of each and counts all three (`06` §3).
2. **The wow's descender clipped.** The alif of Lesson 8 stands on the line; the wow hangs below it, like ر. The wide
   tile was sized for an alif. Measure before assuming (`03` §3).
3. **The id following the drawing.** If the Madani face gets `forms` with U+06E1, the id must still be built from
   `suffixOf` (U+0652) or a switch of script throws every letter's credit away — Lesson 9's rule, `03` §2.
