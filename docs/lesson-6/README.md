# Lesson 6 — build specification

**Read `docs/lesson-4/` in full, then `docs/lesson-5/`, before this folder.** Lesson 6 is the third lesson with a
different stroke. The engine contract, the page, the formats, the wording rules and the accessibility limits are
written in `docs/lesson-4/`; the twin review, `which-mark` and `{other}` are written in `docs/lesson-5/`; all of it is
built. **This folder is only the differences.** Where it is silent, those two folders are the specification and the
built code is the answer.

Written 2026-09-24, for whoever continues `QAIDA-BUILD.md` **step 6**: *"Lessons 4–6: zabar, zair, paish, each with
its exercise and mixed review."* Lessons 4 and 5 are built and not yet previewed; this is the last of the three.

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, written *after* the
code exists and the user has seen it.

## Status — planned 2026-09-24, not built

| | |
|---|---|
| **Planned** | this folder. Nothing written to `site/` |
| **Blocks the build** | nothing. But see "Before building" below |
| Open questions for the teacher | `06-open-questions.md` — four, none blocking; each recommendation can be built and changed with one row in the options panel |
| New page code | **none.** `mark-lesson.js` already serves lessons 4, 5 and 6 through `<html data-mark>` |
| New data code | small: `marks.js` learns that a mark can be shown against **two** earlier marks, not one (`03`) |

## What Lesson 6 is, in a paragraph

The third short vowel. U+064F, called **paish** or **damma** depending on the student's chosen names: a small curl,
shaped like a tiny و, written **above** the letter. ب is "Baa", بَ is "ba", بِ is "bi", بُ is "bu". Underneath it is
`practice.js`, unchanged, and `mark-lesson.js`, with small changes. After this lesson the student can read the row a
printed Qaida is famous for: **بَ بِ بُ — ba, bi, bu.**

## The one thing that is genuinely new

**Lesson 5 taught "above or below". Lesson 6 has to teach "which shape, above".**

Lesson 5's twins made sense because zabar and zair are the same stroke in two places, so *where* it sits was the
whole question. Paish breaks that pattern. It sits **above, like zabar**, so position no longer tells them apart.
What tells them apart is the **shape**: a straight slanted line against a small curl.

That means the mark Lesson 6 is shown against is **zabar**, not zair, which is the lesson just before it.

**`marks.js` currently has this wrong.** `MARKS.damma` was written on 2026-09-20 with `after: 'kasra'`, following
`docs/lesson-5/05` §5 ("paish is `MARKS.damma` with `after: 'kasra'`"). Built as it stands, `lesson-6.html` would
ask بُ against بِ, and a student who did Lesson 5 would answer every question by noticing that the mark is on top.
They would finish the lesson without ever telling paish from zabar, which is the only confusion a beginner really has
here. `03-the-pool-and-review.md` is the fix:

- **zabar** is the mark it is shown against (`after: 'fatha'`). Its twins carry the tag, so **every** paish question
  has the same letter with zabar among the wrong answers;
- **zair** rides along as well (`also: ['kasra']`), without the tag. It completes the set, and it keeps Lesson 5's
  question alive, but it is never the one the lesson is built around.

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | what "knowing paish" means when the student already knows zabar and zair |
| `02-the-mark.md` | U+064F, why it is taller than zabar, and which letters it collides with |
| `03-the-pool-and-review.md` | zabar as the contrast, zair as a passenger, and the exact `marks.js` / `mark-lesson.js` changes |
| `04-page-and-wording.md` | `lesson-6.html`: every attribute and every string that differs from `lesson-5.html`, and the "ba bi bu" board |
| `05-files-and-steps.md` | the file list in build order, the checks, and the user's browser checklist |
| `06-open-questions.md` | what needs the teacher. **Read this one first if you read only one** |

Also read, outside this folder: `docs/lesson-4/` and `docs/lesson-5/` in full, `QAIDA-BUILD.md` (the Decisions table
and every "Step 6 built" entry), `QAIDA-CONTENT.md` item 6, `docs/your-voice/04-where-it-appears.md` §6 (the Say it
block every new lesson copies), and the built `marks.js`, `mark-lesson.js` and `lesson-5.html`.

## Before building

**Lessons 4 and 5 have not been seen in a browser.** Lesson 6's rendering risk is the strip *above* the letter, which
is Lesson 4's strip with a taller mark in it (`02` §2). If Lesson 4's zabar is clipped at the top of a tile or lands on
a dot, Lesson 6's paish will be worse, and it is one fix if found in Lesson 4 and two if found after Lesson 6 exists.
**Recommended: the user previews lessons 4 and 5 first.** It is not a hard block; the user asked for Lesson 5 before
seeing Lesson 4 and that was fine.

**Run every check script before starting** (`05` §3). They all passed on 2026-09-24, when this was written. The
"try again" failure from the voice work that `QAIDA-BUILD.md`'s Lesson 2 log mentions had been fixed by then. If one
is red when you start, fix it first, so a new failure can't hide behind an old one.

## Rules that apply to this work

They have not changed since `docs/lesson-4/README.md`. The short version:

- **This PC is infected.** No `python`, `py`, `pip`, `ffmpeg` or Git Bash; the **Bash tool is broken**, so use
  **PowerShell**. `node` is safe. Never `dangerouslyDisableSandbox`. PNG or WebP, never `.jpg`.
- **Every line of wording gets its own text field** in the options panel (`data-words` / `data-words-attr`).
- **Never ask the user to choose a look in words.** Build it as a row in the options panel and let them look.
- **Nothing is locked**, **never harsh**, **no numbers on the page**, **nothing is scored** (the voice panel).
- **The user previews and signs off.** Do not drive a browser. Step 6 is done only when lessons 4, 5 **and** 6 are
  built and seen.
- **End every reply about the Qaida** with one line: the current step, its skills, and the next step.

## The three things most likely to go wrong

1. **Building it as it stands in `marks.js`**, with `after: 'kasra'`. The lesson becomes "above or below" a second
   time. `03` §1.
2. **Giving both twins the same tag.** `practice.js` guarantees *one* wrong answer that shares a tag, chosen at
   random among those that do. With zabar and zair both tagged, half the questions would get the easy one. Only zabar
   carries it. `03` §3.
3. **A mark clipped at the top of the tile.** Paish is taller than zabar, and ا ل ط ظ ك are the tallest letters. `02` §2.
