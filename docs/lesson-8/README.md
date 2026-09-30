# Lesson 8 — build specification

**Read `docs/lesson-4/` in full, then `docs/lesson-5/`, `docs/lesson-6/` and `docs/lesson-7/`, before this folder.**
Lesson 8 is the fifth customer of `mark-lesson.js` and the seventh of `practice.js`. The engine contract, the page,
the formats, the wording rules and the accessibility limits are in `docs/lesson-4/`; twins and `which-mark` are in
`docs/lesson-5/`; `against` and the trio/quartet board are in `docs/lesson-6/`; `SETS`, `partsOf` and an item's
`parts` are in `docs/lesson-7/`. **This folder is only what is new.** Where it is silent, those four folders are the
specification and the built code is the answer.

Written 2026-09-27, for whoever continues `QAIDA-BUILD.md` **step 8**: *"Lessons 7–9: tanween, zabar + alif,
standing harakaat."* Lesson 7 is built; this is the second of the three.

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, written *after*
the code exists and the user has seen it.

## Status — specified, not built

| | |
|---|---|
| **Written** | this folder only. **Nothing was written to `site/`** |
| **Built** | nothing |
| **Blocked on** | nothing hard. Four fix notes from the evening of 2026-09-27 should land first, because two of them are on this lesson's path (`06` §2) |
| New page files | `lesson-8.html` and `exercise-8.html`, both copies. **No new script** — `mark-lesson.js`, `spell.js` and `exercise.js` serve it |
| New data | one row in `MARKS`, and one new idea: **an item is two letters, not one letter and a mark** (`03`) |

## Should it be built yet?

**Yes, once the pending fixes are in** — and this is a softer answer than Lesson 7 got. Lesson 7 had to wait on a
question about the tile's size that decided whether its lesson worked at all. Lesson 8 has no such question: its
mark is zabar, which sits above the letter and was the first thing the Qaida learnt to draw. Its one drawing risk —
two letters are wider than one — is a tile rule with a row in the options panel, not a reason to wait.

But four notes are sitting in `fixes/` (2026-09-27, evening), and two of them are on this lesson's path:

1. `fixes/lesson 4 5/` — the word walkthrough should show the **whole word**, highlight the part being read, and
   animate. Lesson 8's words go through that walkthrough (`05`). Reshape it once, then add words to it.
2. `fixes/lesson 6/` — "why is the zair box weird": a zair tile is **taller than its neighbours** in Lesson 6's
   quartet. Lesson 8 adds a *wider* tile, and it must follow the same rule the fix sets (a row's tiles share one
   height, `03` §6).

The other two (exercise 6 has no Next button; Lesson 7's names should be "two zabar", not "do zabar" or
"fathatain") are not on the path, but they are one-line fixes to pages this lesson links to. `06` §2.

## What Lesson 8 is, in a paragraph

**An alif after zabar makes the sound long.** بَ is "ba"; **بَا is "baa"**. The zabar is the one the student has
known since Lesson 4, in the same place; what is new is a **letter** after it, the alif, which carries no mark of
its own and stretches the vowel before it. It is the first long vowel in the Qaida, and the first lesson whose
items are written with **two letters**.

## The one thing that is genuinely new

**Every item so far has been one letter and a mark.** Its id is two characters (`shell.keyOf(glyph)` + the mark),
`shell.masteredCount` tests `id.length === 2`, a tile is a portrait card sized for one letter, and the halo finds
the mark by drawing the letter with and without it.

بَا is **ب + U+064E + ا**: a letter, a mark, and a second letter that joins on to the first — or does not, after
د ذ ر ز و — or melts into it, after ل (لَا, the first lam-alif the Qaida has ever shown). So `03` gives a `MARKS`
row a **`tail`**: the letters that follow the mark. `glyphOf` appends it, and everything that composes through
`glyphOf` follows. It pays for itself four more times: **lessons 10–13 are the same shape** — zabar + wow, paish +
wow, zabar + yaa, zair + yaa — each a mark and a letter after it.

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | what "knowing the long aa" is, and why the drill is the easy half of this lesson |
| `02-the-alif.md` | the characters, **which letters** (27, not 29), how the alif joins, **لَا**, and what the two scripts do |
| `03-an-item-of-two-letters.md` | `tail`, the ids, `masteredCount`, the tile, the halo, the joined example, and the exact code changes |
| `04-page-and-wording.md` | `lesson-8.html`: every attribute and every string that differs from `lesson-6.html` |
| `05-words.md` | the word walkthrough and `exercise-8.html`: the first words with a long vowel, and a warning about the mushaf's spelling |
| `06-files-and-steps.md` | the file list in build order, the checks, and the browser checklist |
| `07-open-questions.md` | what needs the teacher — **read this one first if you read only one** |

Also read, outside this folder: **`docs/lesson-4/` to `docs/lesson-7/`**, `QAIDA-BUILD.md` (the Decisions table,
and every "built" and "round" entry of 2026-09-27), `QAIDA-CONTENT.md` item 8, `WEBSITE-BUILD.md` §0 and §5, the
four notes in `fixes/`, and the built `marks.js`, `mark-lesson.js`, `shell.js`, `spell.js`, `exercise.js`,
`lesson-6.html` and `exercise-6.html`.

## Rules that apply to this work

Unchanged since `docs/lesson-4/README.md`. The short version:

- **This PC is infected.** No `python`, `py`, `pip`, `ffmpeg` or Git Bash; the **Bash tool is broken** — use
  **PowerShell**. `node` is safe. Never `dangerouslyDisableSandbox`. PNG or WebP, never `.jpg`.
- **Check with `node --check`** and every script in `tools/`. **Five lessons** now sit behind those scripts, and
  Lesson 8 shares zabar's code point with Lesson 4 — the one place a shared-file edit could quietly double-count.
- **Every line of wording gets its own text field** in the options panel (`data-words` / `data-words-attr`).
- **Never ask the user to choose a look in words** — build it as a row in the options panel and let them look.
- **Plain names, not grammar words.** The user, on Lesson 7 (`fixes/lesson 7/fixes.txt`): no "fathatain", no
  "tathniya", no "do zabar" — "two zabar or two fatha is good". So this lesson is **"zabar and alif"**, never
  "madd", "huroof maddah" or "alif maddah" on the page.
- **Nothing is locked**, **never harsh**, **no numbers on the page**.
- **Real words only, never invented**, and **checked by the teacher before they ship** (`05`).
- **The user previews and signs off.**
- **End every reply about the Qaida** with one line: the current step, its skills, and the next step.

## The three things most likely to go wrong

1. **An id collision with the twin.** بَا and بَ share the letter *and* the mark; only the alif tells them apart,
   and بَ rides along in this lesson as the wrong answer. If an id is still built as `key + cp` anywhere, the
   lesson's own item and its twin get the **same id in the same pool**, and a right answer to "ba" counts as
   knowing "baa". The same mistake in `shell.masteredCount` makes the home card count the twins. `03` §2, and a
   check that asserts both.
2. **Showing a spelling that is never written.** ا + zabar + ا is not how Arabic writes a long aa at the start
   of a word (it is آ, a different sign), and a table that shows it teaches a mistake. `02` §2.
3. **Calling the words Qur'anic.** The mushaf writes many of the most common long-aa words with a *standing* fatha
   instead of an alif — كِتَابٌ in standard spelling is كِتَٰبٌ in the Madani mushaf. That is Lesson 9. Lesson 8's
   words are Arabic words, correctly spelled, and never labelled as quotations. `05` §4.
