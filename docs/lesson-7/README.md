# Lesson 7 — build specification

**Read `docs/lesson-4/` in full, then `docs/lesson-5/` and `docs/lesson-6/`, before this folder.** Lesson 7 is the
fourth customer of `mark-lesson.js` and the sixth of `practice.js`. The engine contract, the page, the formats, the
wording rules and the accessibility limits are written in `docs/lesson-4/`; the review machinery — twins,
`which-mark`, the board that shows where the stroke moved — is in `docs/lesson-5/`; `against`, the quartet board and
the alternating twins are in `docs/lesson-6/`. **This folder is only what is new.** Where it is silent, those three
folders are the specification and the built code is the answer.

Written 2026-09-21, for whoever starts `QAIDA-BUILD.md` **step 7**: *"Lessons 7–9: tanween, zabar + alif, standing
harakaat (the two scripts write some of these marks differently)."* Lesson 7 is the first of the three.

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, written *after*
the code exists and the user has seen it.

## Status — specified, not built

| | |
|---|---|
| **Written** | this folder only. **Nothing was written to `site/`** |
| **Built** | nothing |
| **Blocked on** | **the browser.** See "Should it be built yet?" — this time the answer is a real no, and `06` §0 says why |
| New page file | **none.** `mark-lesson.js` serves it, the way it serves lessons 4, 5 and 6 |
| New data | three rows in `MARKS`, and one new idea: **a lesson can hold more than one mark** (`03`) |

## Should it be built yet?

**No — not before lessons 4, 5 and 6 have been opened in a browser.** This is a harder no than `docs/lesson-6/`
gave, and for one reason:

> `docs/lesson-6/05` §4 item 2 asks the user: **can you tell بَ from بُ at the tile's size?** That question is
> unanswered. Lesson 7 asks the student to tell **بَ from بً** — the same stroke once against the same stroke
> twice, in the same place, at the same size. If the tile is too small for Lesson 6, it is certainly too small for
> Lesson 7, and the fix (a bigger tile, a different face, a larger drill glyph) lands in `qaida.css` and
> `mark-lesson.js`, which are the two files this lesson leans on hardest.

Building Lesson 7 first would mean specifying a lesson around a tile size that may be about to change. Everything
in this folder stays true either way — it is the *building* that should wait, not the planning.

## What Lesson 7 is, in a paragraph

The doubled marks: **ً U+064B**, **ٌ U+064C** and **ٍ U+064D** — *fathatain, dammatain, kasratain*, or *do zabar,
do paish, do zair*. Each is the mark the student already knows, written **twice**, and each adds an **n** to the
sound: بَ is "ba" and **بً is "ban"**; بُ is "bu" and **بٌ is "bun"**; بِ is "bi" and **بٍ is "bin"**. Two of the
three sit above the letter and one below, exactly as their single counterparts do. The lesson teaches no words.

## The one thing that is genuinely new

**Every lesson so far has taught one mark. This one teaches three.**

`mark-lesson.js` is driven by `<html data-mark="damma">` and reads a single `mark` everywhere: `mark.cp` composes
the glyph, `mark.sits` is written to `<html data-sits>`, `mark.first` is the six letters of part 1, `mark.audio` is
the recording group, `marks.COUNT` is two parts for every lesson, and `shell.js` counts the lesson's own items by a
single `cp` suffix. None of that is wrong — it is just built for one.

So `03-a-lesson-with-three-marks.md` makes a lesson's marks a **list**, with one entry for lessons 4, 5 and 6 and
three for Lesson 7, and gives each **part** its own mark. It is the only file in this folder with real code in it,
and it pays for itself twice: **Lesson 9 (standing harakaat) is the same shape again** — three marks, one lesson —
and lessons 10–13 are pairs.

The second new thing is smaller and is in the same file: the mark a tanween is told apart from changes **by part**.
In parts 1–3 it is its own single counterpart (بً against بَ: *one or two?*). In the last part it is the other two
tanweens (بً against بٌ and بٍ: *which two?*). Today `twinsFor` reads one list, `mark.against`, for every part.

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | what "knowing tanween" is, and the one sentence the whole lesson rests on |
| `02-the-three-doubled-marks.md` | the three characters, where each sits, which six letters each meets, and **what the two scripts really do differently** |
| `03-a-lesson-with-three-marks.md` | a lesson with a list of marks, parts that each own one, twins by part, and the exact `marks.js` / `mark-lesson.js` / `shell.js` / CSS changes |
| `04-page-and-wording.md` | `lesson-7.html`: every attribute and every string that differs from `lesson-6.html`, and the panel rows |
| `05-files-and-steps.md` | the file list in build order, and the verification checklist |
| `06-open-questions.md` | what needs the teacher — **read this one first if you read only one** |

Also read, outside this folder: **`docs/lesson-4/`, `docs/lesson-5/` and `docs/lesson-6/` in full**,
`QAIDA-BUILD.md` (the Decisions table and the four "Step 6 built" log entries, which list where each build differs
from its own spec), `QAIDA-CONTENT.md` item 7, `WEBSITE-BUILD.md` §0 and §5, and the built `marks.js`,
`mark-lesson.js`, `shell.js` and `lesson-6.html`.

## Rules that apply to this work

Unchanged since `docs/lesson-4/README.md`. The short version:

- **This PC is infected.** No `python`, `py`, `pip`, `ffmpeg` or Git Bash; the **Bash tool is broken** — use
  **PowerShell**. `node` is safe. Never `dangerouslyDisableSandbox`. PNG or WebP, never `.jpg`.
- **Check with `node --check`** and every script in `tools/`; they are the only thing standing between a
  shared-file edit and a lesson that is awaiting sign-off. **Four lessons** now sit behind those scripts.
- **Every line of wording gets its own text field** in the options panel (`data-words` / `data-words-attr`).
- **Never ask the user to choose a look in words** — build it as a row in the options panel and let them look.
- **Nothing is locked**, **never harsh**, **no numbers on the page**.
- **The user previews and signs off.** Do not drive a browser.
- **End every reply about the Qaida** with one line: the current step, its skills, and the next step.

## The three things most likely to go wrong

1. **Building it before the tile size is settled.** See above, and `06` §0. It is the only blocking item.
2. **Making the three marks three separate lessons inside one page.** They are one skill — *doubled means n* —
   learnt once and applied three times. If part 1 teaches it and parts 2 and 3 feel like homework, the lesson is
   too long; `03` §3 keeps the gate on the last part alone so the warm-ups can be skipped.
3. **Riding the wrong twin along in the last part.** If بً is only ever shown beside بَ, the last part asks
   *one or two?* again, which parts 1–3 already taught. It has to ask *which two?*. `03` §5.
