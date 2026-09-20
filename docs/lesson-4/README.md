# Lesson 4 — build specification

**Read this folder before writing a line of Lesson 4.** It is a specification, written 2026-09-20, for whoever
builds `QAIDA-BUILD.md` **step 6**: *"Lessons 4–6: zabar, zair, paish, each with its exercise and mixed review."*

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, and it is written
*after* the code exists and the user has seen it — the same way steps 1, 4 and 5 were done. When you finish
building, update that file to describe what is actually there, and update `QAIDA-BUILD.md`'s status table and step
log.

## Status — Lesson 4 built 2026-09-20, not yet seen in a browser

Built on the recommendations below (the user said "please start building"): the pair's name as the answer, two parts.
Where the build differs from this folder is in `QAIDA-BUILD.md`, "Step 6 built". Lessons 5 and 6 are not built.

**Was blocked on two answers from the teacher**, both in `09-open-questions.md` — still the teacher's to confirm or change:

1. **§1 — how the student answers.** Lessons 2 and 3 answered in the letter's *name*. Lesson 4 is about a *sound*,
   and the Qaida has no recordings and no transliteration. This changes what the whole lesson is. **Do not build
   until it is answered.**
2. **§2 — one group or two.** 29 items is Lesson 2's length again. Two groups make the first stretch short.

Everything else in this folder is a recommendation with its reasoning, and can be built as written.

## What Lesson 4 is, in a paragraph

The first **mark**. Until now every lesson has been about letters: their names (1), their names cold (2), their
shapes when joined (3). Lesson 4 puts one small stroke above a letter — U+064E, called **zabar** or **fatha**
depending on what the student chose — and that stroke is what turns a letter into a sound: ب is a letter called
"Baa", بَ is the sound "ba". A student who knows all 29 letters still cannot read a single word until they know
this. Underneath it is **`practice.js`**, unchanged: Lesson 4 is its third customer.

## The one decision that matters beyond this lesson

**Lesson 4 is not one lesson, it is the first of three.** Lesson 5 (zair / kasra, the same stroke below the letter)
and Lesson 6 (paish / damma, a small waw above it) are the *same lesson with a different mark*. Lessons 7, 9 and 14
are marks again. So the build must produce two shared files and three thin pages, not three copies of a 40KB page:

| File | What |
|---|---|
| `site/qaida/marks.js` | the data layer: the marks table, the items, the board rows, the group stats. No DOM |
| `site/qaida/mark-lesson.js` | the page, driven by `<html data-mark="fatha">`. One file serves lessons 4, 5 and 6 |
| `lesson-4.html` `lesson-5.html` `lesson-6.html` | three pages that differ in their `data-` attributes and wording |

`lesson-3.js` is 41KB and Lesson 3 is a one-off. Copying it twice more would be 120KB of near-identical page code
and three places to fix every bug. `02-the-mark.md` §1 and `08-files-and-steps.md` §1 are written around this.

**Do not refactor Lessons 1–3 to match.** They work, they are awaiting sign-off, and a refactor would put them back
in the queue.

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | why the lesson exists, what "knowing zabar" means, and the decisions behind it |
| `02-the-mark.md` | the mark data: U+064E, the marks table lessons 4–6 share, per-letter edge cases, per script |
| `03-the-pool-and-formats.md` | items, formats, mixed review, and why **`practice.js` does not change** |
| `04-page-and-design.md` | `lesson-4.html`, the board, what is copied from Lesson 3 unchanged |
| `05-wording.md` | every string, with its text-field tag |
| `06-accessibility.md` | the combining-mark problem, and the honest limit this lesson has |
| `07-options-panel.md` | the tryout rows, the `window.qaida` surface, the `<html>` attributes |
| `08-files-and-steps.md` | the exact file list, in build order, with a verification checklist |
| `09-open-questions.md` | what needs the teacher, not you — **read this one first if you read only one** |

Also read, outside this folder: **`docs/lesson-2/` and `docs/lesson-3/` in full** (Lesson 4 copies the engine
contract, the page and the wording rules from both), `QAIDA-BUILD.md`, `QAIDA-CONTENT.md`, `WEBSITE-BUILD.md`
§0 and §5, and `design-system/quran-landing/pages/qaida.md`.

## Rules that apply to this work

**This PC is infected** (`CLAUDE.md`, `WEBSITE-BUILD.md` §0). Never run `python`, `py`, `pip`, `ffmpeg`, Git Bash,
or anything under `C:\ffmpeg-8.1.2-essentials_build\` or `%LOCALAPPDATA%\Programs\`. The **Bash tool is broken** —
Git's `bash.exe` is infected. Use **PowerShell**. `node` is validly signed and safe. Never use
`dangerouslyDisableSandbox`. Save images as PNG or WebP, never `.jpg`.

**Check your work with `node --check`**, every script, every time, and run **`node tools/qaida-check.js`** — it
checks the engine's boundaries and will fail if Lesson 4 pushes work into `practice.js` that belongs in the page.

**Preview:** `node serve.js`, then `http://localhost:8777/site/qaida/lesson-4.html`. The launch config is called
"site". Never `python -m http.server`.

**Every line of wording Claude writes gets its own text field** in the options panel — the user's standing rule.
`05-wording.md` lists them; `qaida-options.js` generates the field automatically from a `data-words` or
`data-words-attr` tag, so tagging the element is the whole job.

**Never ask the user to choose a look in words.** Build the choices as buttons in the options panel and let them
look. That rule is why `07-options-panel.md` exists.

**Nothing is locked.** `docs/lesson-2/09-going-in-order.md` applies: the groups are a *recommended order*, not a
chain of locks, and Lesson 4 itself opens whether or not Lesson 3 is finished.

**Never harsh.** A wrong answer says what the thing is and nothing more. No "incorrect", no exclamation marks.

**No numbers on the page** (the user, 2026-09-20: "68 shapes and 21 … produce stress"). Counts drive the bar and
the rail fills; only the options panel, which is the teacher's, prints them.

**The user previews in a browser and signs off.** Do not drive a browser yourself, and do not mark step 6 done in
`QAIDA-BUILD.md` until they have said so. One step at a time.

**End every reply about the Qaida** with one line: the current step, its skills, and the next step.

## The two things most likely to go wrong

1. **Building Lesson 4 as a one-off.** See "the one decision that matters" above. If you find yourself about to
   write `lesson-4.js`, stop and read `08-files-and-steps.md` §1.
2. **Teaching the mark's name instead of the mark's sound.** It is easy to build a drill where the right answer is
   "Baa with zabar" and never once ask the student what بَ *says*. That drill is answerable by anyone who can see a
   stroke above a letter, and it teaches nothing a printed Qaida would recognise. `09-open-questions.md` §1 is that
   problem, and it is the reason this folder is blocked rather than built.
