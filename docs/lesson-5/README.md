# Lesson 5 — build specification

**Read `docs/lesson-4/` in full before this folder.** Lesson 5 is the same lesson with a different stroke, and
almost everything about it — the engine contract, the page, the formats, the wording rules, the accessibility
limits — is already written there and already built. **This folder is only the differences.** Where it is silent,
`docs/lesson-4/` is the specification and the built code is the answer.

Written 2026-09-20, for whoever continues `QAIDA-BUILD.md` **step 6**: *"Lessons 4–6: zabar, zair, paish, each
with its exercise and mixed review."* Step 6 is not one lesson; Lesson 4 is built, Lesson 5 and Lesson 6 are not.

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, written *after*
the code exists and the user has seen it.

## Status — built 2026-09-20, awaiting the user's preview

| | |
|---|---|
| **Built** | `lesson-5.html` (new), and small changes to `marks.js`, `mark-lesson.js`, `shell.js`, `qaida.css`, `qaida-options.js`, `manifest.json`. `practice.js` did not change |
| **Not seen in a browser** | Nothing here has been looked at. `05-files-and-steps.md` §4 is the user's checklist, and the first item on it (does the mark render *attached*, *under* the letter) decides whether the tile CSS is right |
| Open questions for the teacher | `06-open-questions.md` — four, none of them blocking; the recommendations were built and each is a row in the options panel |
| New page code | **none.** `mark-lesson.js` serves lessons 4, 5 and 6 through `<html data-mark>` |

**Why it was built before the user's first look at Lesson 4:** the user had already previewed Lesson 4 (their note
"don't add simple alphabets without symbols" came from it), and asked for Lesson 5 next. What they had *not* confirmed
is the below-the-line rendering, which is Lesson 5's own risk and is on the checklist.

## As built — where it differs from this folder

Each one is the user's to overrule.

1. **The plain-letters slider starts at 0, not 4** (`data-review="0"`, `04` §1). The user said on Lesson 4, after
   previewing, *"don't add simple alphabets without symbols"*; that stands here. The twins are not this slider and are
   on by default, so the lesson still asks above against below.
2. **`{other}` is a token, not a two-attribute pair.** `04` §3 gave `data-pair-other-zabar` / `-fatha` and the same for
   `data-mark-does`. Instead `wordsFor()` fills `{other}` / `{Other}` with the *other* mark's name in the student's set, so
   each of those lines is **one** text field ("The same letter with {other}", "{Mark} is the same stroke as {other}, written
   under the letter instead of over it."), and so is the end line ("You can tell {other} from {mark}."). The next-lesson
   buttons keep the existing `data-next-zabar` / `-fatha` pair.
3. **The rail's part-1 glyph and the title glyph are `mark.sample`** (`'د'` for kasra, `'ب'` for fatha). `02` §5 said
   `mark.first[0]` for the rail, which is `'ا'` (alif with a mark under its foot, the awkward one) for kasra.
4. **`masteredCount` is fixed in `shell.js` by the lesson's row, not only by an id list.** The home cannot load
   `marks.js`, so each mark lesson's row in `LESSONS` declares `cp` (the mark) and the home counts only ids of a letter
   plus that mark. `masteredCount(n, target, ids)` also takes an explicit list, as `03` §6 said. **This also fixes Lesson
   4's home card** (`docs/lesson-4/README.md` "as built" §3), and one assertion in `tools/qaida-check.js` that had asserted
   the old over-count (8) now asserts 0.
5. **`which-mark` guarantees one zabar letter among the wrong answers, not three.** `03` §5 describes "one kasra glyph,
   three zabar". The engine only guarantees that one wrong answer shares a tag with the right one; the rest are drawn
   from the pool, which is half zabar letters. Measured: every question about zair has its zabar twin among the answers
   (checked, 100%); the other two are usually other letters, sometimes other zabar letters.
6. **The twins are 35–45% of the questions, not a third.** About 35% in part 2 (29 letters), about **45% in part 1**: the
   rule that a letter is not asked again until the others have had a turn flattens the engine's half weight in a small
   pool. The no-repeat rule was kept, because repeats were the user's complaint. If it is too much, the row *"The other
   mark riding along"* turns it off, and `spreadFor()` in `mark-lesson.js` is where to tune it.
7. **Board tiles carry `data-audio`**, not `item.audio.kind` (`03` §4): a board tile is not an engine item. Its `data-id`
   is now the engine's id for that letter and mark, so a missed item is found by comparing ids.
8. **A missed twin lights the zabar tile in the middle column** (not specified): the board points at where the stroke was.
9. **`[data-sits="below"]` CSS is `aspect-ratio: 5 / 7.4` and more bottom padding, and no more.** `04` §7 also asked for
   the halo's ring to be allowed below the baseline; `.letter` clips with `overflow: hidden` and letting tails spill out is
   a look decision that needs eyes on it, so the ring is left inside the tile. **If the ring or a tail is clipped at the
   bottom, that is where to look** (checklist item 2).
10. **Checks.** `tools/qaida-lesson5-check.js` is a new file (the harness of `qaida-marks-check.js`, which still tests
    Lesson 4), not a block inside it. Both page checks used to fail about one run in six, because a random wrong answer
    earlier in the run could leave one part-1 letter shaky; each now clears the lesson's record first.
11. **The home still opens Lesson 5 only once Lesson 4 is marked finished** (`shell.isOpen`), exactly as it opens Lesson 4
    only after Lesson 3. That is step 1's lock, and `docs/lesson-2/09-going-in-order.md` (nothing locked, advice at the
    door) is still not built. Lesson 4's *Next* button links straight to `lesson-5.html` regardless.

## What Lesson 5 is, in a paragraph

The same stroke, under the letter instead of over it. U+0650, called **zair** or **kasra** depending on the
student's chosen names: ب is a letter called "Baa", بَ is the sound "ba", بِ is the sound "bi". Underneath it is
`practice.js`, unchanged, and `mark-lesson.js`, unchanged — Lesson 5 is the fourth customer of the one and the
second of the other.

## The one thing that is genuinely new

**Lesson 4 taught "a mark is there". Lesson 5 has to teach "which mark, and where it sits".**

That is not the same lesson with a new glyph, and it is the only place where copying Lesson 4 exactly would build
the wrong thing. In Lesson 4 the contrast that made the mark matter was **marked against bare** — بَ against ب,
which the bare review letters supplied. In Lesson 5 that contrast is worthless: a student who has done Lesson 4
knows a stroke when they see one, and بِ against ب is answerable by anyone who can see *any* mark at all.

The contrast that makes Lesson 5 mean something is **بِ against بَ** — the same letter, the other mark, above
against below. So Lesson 5's mixed review is not a courtesy and not a copy: **the zabar items from Lesson 4 ride
along, and they are the wrong answers.** `03-the-pool-and-review.md` is that change, and it is the only part of
this build with real code in it.

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | what "knowing zair" means when the student already knows zabar |
| `02-the-mark-below.md` | U+0650, the below-the-line problem, and why Lesson 4's part 1 letters are the wrong six |
| `03-the-pool-and-review.md` | the zabar items as review, the `which-mark` wrong answers, and the exact `marks.js` changes |
| `04-page-and-wording.md` | `lesson-5.html`: every attribute and every string that differs from `lesson-4.html` |
| `05-files-and-steps.md` | the file list in build order, and the verification checklist |
| `06-open-questions.md` | what needs the teacher — **read this one first if you read only one** |

Also read, outside this folder: **`docs/lesson-4/` in full** (this folder assumes all of it), `QAIDA-BUILD.md`
(the Decisions table and the "Step 6 built" log, which lists where Lesson 4 differs from its own spec),
`QAIDA-CONTENT.md`, `WEBSITE-BUILD.md` §0 and §5, and the built `marks.js`, `mark-lesson.js` and `lesson-4.html`.

## Rules that apply to this work

They have not changed since `docs/lesson-4/README.md`, and they are not repeated here in full. The short version:

- **This PC is infected.** No `python`, `py`, `pip`, `ffmpeg` or Git Bash; the **Bash tool is broken** — use
  **PowerShell**. `node` is safe. Never `dangerouslyDisableSandbox`. PNG or WebP, never `.jpg`.
- **Check with `node --check`, `node tools/qaida-check.js` and `node tools/qaida-marks-check.js`** — the last one
  already exists and gains a Lesson 5 block.
- **Every line of wording gets its own text field** in the options panel (`data-words` / `data-words-attr`).
- **Never ask the user to choose a look in words** — build it as a row in the options panel and let them look.
- **Nothing is locked**, **never harsh**, **no numbers on the page**.
- **The user previews and signs off.** Do not drive a browser. Do not mark step 6 done until lessons 5 *and* 6
  are built and seen.
- **End every reply about the Qaida** with one line: the current step, its skills, and the next step.

## The two things most likely to go wrong

1. **Copying Lesson 4's review.** Bare letters as the only review makes this lesson answerable without ever
   looking at where the stroke sits. `03` §2.
2. **Copying Lesson 4's part 1.** Its six letters (ب د ر س م ل) were chosen for a mark *above*. Three of them are
   the worst possible letters for a mark below: ب carries a dot there, ر and م hang below the line. `02` §3.
