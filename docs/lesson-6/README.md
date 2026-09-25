# Lesson 6 — build specification

**Read `docs/lesson-4/` in full, then `docs/lesson-5/`, before this folder.** Lesson 6 is the third customer of
`mark-lesson.js` and the fifth of `practice.js`. The engine contract, the page, the formats, the wording rules and
the accessibility limits are written in `docs/lesson-4/`; the review machinery — twins, `which-mark`, the board
that shows where the stroke moved — is written in `docs/lesson-5/`. **This folder is only what is new.** Where it
is silent, those two folders are the specification and the built code is the answer.

Written 2026-09-21, for whoever finishes `QAIDA-BUILD.md` **step 6**: *"Lessons 4–6: zabar, zair, paish, each with
its exercise and mixed review."* Lessons 4 and 5 are built. Lesson 6 is the last one, and it closes the step.

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, written *after*
the code exists and the user has seen it.

## Status — specified, not built

| | |
|---|---|
| **Written** | this folder only. **Nothing was written to `site/`** |
| **Built** | nothing |
| **Blocked on** | nothing in the code. See "Should it be built yet?" below — that is a question for the user, not a fault in the plan |
| New page code | **none.** `mark-lesson.js` already serves lessons 4, 5 and 6 through `<html data-mark>` |
| New data | one word in `MARKS.damma`, and one field that becomes a list (`03`) |

## Should it be built yet?

Honestly: **lessons 4 and 5 have never been looked at in a browser.** Building Lesson 6 makes that three unpreviewed
lessons sharing one page file, one stylesheet block and one data layer. If the mark does not render attached in
Lesson 4, the same fault is in all three and gets fixed three times.

Against that: Lesson 6 is the **cheapest** of the three and it sits *above* the letter, like Lesson 4 — so it needs
**no new CSS at all** and carries none of Lesson 5's below-the-line risk. It also finishes step 6, which is the
thing the user has been signing off in blocks.

**Claude's reading:** the safe order is *preview 4 and 5 → build 6*. If the user says build it now, build it — it
is a small lesson and the risk it adds is shared with lessons already waiting, not new.

## What Lesson 6 is, in a paragraph

The third mark: **U+064F**, a small curl **above** the letter, called **paish** or **damma**. ب is a letter called
"Baa", بَ is the sound "ba", بِ is "bi", **بُ is "bu"**. It sits in the same place as zabar and is told apart by its
shape, not by where it is — which is the reverse of Lesson 5 and is why it is a lesson of its own.

## The one thing that is genuinely new

**Lesson 4 taught "a mark is there". Lesson 5 taught "which mark, and where it sits". Lesson 6 has to teach
"all three, cold."**

After this lesson a student meets بَ بِ بُ in real words within a page or two of a printed Qaida, in any order. So
Lesson 6 is the first lesson whose review reaches back **two** lessons at once, and `marks.js` is built for one:
`after: 'kasra'` is a single string and `otherOf()` returns a single mark.

That single string is also **pointing at the wrong mark**. Damma's hard contrast is not kasra — kasra is below the
line and a student who finished Lesson 5 can tell above from below in a glance. Damma's hard contrast is **fatha**:
same place, different shape. If Lesson 6 rides zair along as its only wrong answer, the whole lesson is answerable
by the skill the student learnt last week, which is exactly the trap `docs/lesson-5/01` §2 was written to avoid.

So: **`after` (a string) becomes `against` (a list, in lesson order), and `otherOf` returns the first of it.**
Lessons 4 and 5 come out identical — `fatha` has none, `kasra` has `['fatha']` — and Lesson 6 gets
`['fatha', 'kasra']`, both riding along. `03-the-two-marks-riding-along.md` is that change, and it is the only
part of this build with real code in it. `practice.js` still does not change.

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | what "knowing paish" means when the student already knows two marks |
| `02-the-third-mark.md` | U+064F, why it needs no new CSS, which six letters, and the small-wow problem |
| `03-the-two-marks-riding-along.md` | `against`, two sets of twins, the arithmetic that stops them drowning the lesson, and the exact `marks.js` changes |
| `04-page-and-wording.md` | `lesson-6.html`: every attribute and every string that differs from `lesson-5.html` |
| `05-files-and-steps.md` | the file list in build order, and the verification checklist |
| `06-open-questions.md` | what needs the teacher — **read this one first if you read only one** |

Also read, outside this folder: **`docs/lesson-4/` and `docs/lesson-5/` in full**, `QAIDA-BUILD.md` (the Decisions
table and the three "Step 6 built" log entries, which list where each build differs from its own spec),
`QAIDA-CONTENT.md` item 6, `WEBSITE-BUILD.md` §0 and §5, and the built `marks.js`, `mark-lesson.js` and
`lesson-5.html`.

## Rules that apply to this work

Unchanged since `docs/lesson-4/README.md` and `docs/lesson-5/README.md`. The short version:

- **This PC is infected.** No `python`, `py`, `pip`, `ffmpeg` or Git Bash; the **Bash tool is broken** — use
  **PowerShell**. `node` is safe. Never `dangerouslyDisableSandbox`. PNG or WebP, never `.jpg`.
- **Check with `node --check`** and every script in `tools/`; they are the only thing standing between a
  shared-file edit and a lesson that is awaiting sign-off.
- **Every line of wording gets its own text field** in the options panel (`data-words` / `data-words-attr`).
- **Never ask the user to choose a look in words** — build it as a row in the options panel and let them look.
- **Nothing is locked**, **never harsh**, **no numbers on the page**.
- **The user previews and signs off.** Do not drive a browser. **Step 6 is not done until lessons 4, 5 and 6 have
  all been seen.**
- **End every reply about the Qaida** with one line: the current step, its skills, and the next step.

## The two things most likely to go wrong

1. **Riding zair along and calling it the contrast.** `after: 'kasra'` is in `marks.js` today and looks right. It
   makes every question answerable by "is it above or below?", which is last lesson's skill. `03` §1.
2. **Riding both marks along at full strength.** Two twins for every letter makes review two thirds of the
   questions, and the user has already said once that a lesson felt repetitive. `03` §4 is the arithmetic and the
   rule that fixes it.
