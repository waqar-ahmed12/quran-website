# Lesson 13 — build specification

**Read `docs/lesson-11/` and `docs/lesson-12/` before this folder** (and, behind them, `docs/lesson-4/` to
`docs/lesson-10/`). Lesson 13 is **Lesson 11's shape with Lesson 12's letter**. From Lesson 11 it takes the long
vowel, the minimal pair against the lesson before, the Indo-Pak jazam that Madani leaves off, and the same-sound tile
pointing back to Lesson 9. From Lesson 12 it takes the yaa that the two scripts write differently, and the id that is
neither script's drawing. **This folder is only what is new on top of those two.**

Written 2026-09-28 (the user: "please plan out every lesson seperately").

## Status — built 2026-09-29

| | |
|---|---|
| **Written** | this folder, 2026-09-28 |
| **Built** | 2026-09-29 (`QAIDA-BUILD.md`, "Step 9 built — Lesson 13"). **Where the build differs from this folder:** `02` §4's measurement found a real fault, so `qaida.css` did change: a wide (`data-tail`) tile in a row with a below-sitting tile was forced to the narrow tile's ratio and came out 1.5× taller. One new rule fixes it (it also repairs Lesson 9's Madani khari zair rows). `data-tail-below` was not needed. |
| **Was blocked on** | Lesson 12 built first: done |
| New page files | `lesson-13.html` and `exercise-13.html`, copies of Lesson 11's |
| New data | one row (`'kasra-yaa'`) with two `forms`. **No new recordings**: `kasra-yaa` is Lesson 9's khari zair group |

## What Lesson 13 is, in a paragraph

**Zair, then a yaa, makes the long "ee".** بِ "bi", بِي "bii", as in فِيلٌ *fiil*, "an elephant", and كَبِيرٌ
*kabiir*, "big". The yaa has no vowel of its own, so it stretches the zair. The minimal pair is Lesson 12's بَيْ "bai":
the same letter after a different mark (`QAIDA-CONTENT.md` item 13, "the same minimal-pair treatment against #12").

## The one thing that is genuinely new

**Two things under the line, side by side.** The zair sits under the letter, and the yaa's bowl hangs below the line
right after it, with two dots under it in Madani. Every earlier lesson put at most one of these in a tile. Lesson 5
learnt what happens to ink below the line in a tile sized for ink above it, and `fixes/lesson 6/` ("why is the zair
box weird") and `fixes/lesson 7/` ("two zair brings the box down") are that same trouble. **Measure before building
anything on the page** (`02` §4).

Everything else is a combination of lessons 11 and 12. In Indo-Pak the minimal pair is the easiest contrast the
Qaida has: بَیْ against بِیْ, one mark above against one below (Lesson 5's).

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | the long "ee", the minimal pair, the same-sound tile |
| `02-the-row-and-the-measurement.md` | the row, the letters, the sample, **the two-things-below measurement** |
| `03-page-words-and-steps.md` | the page, the words, the files, the build order, the checks and the checklist |
| `04-open-questions.md` | what needs the teacher |

Four files, not eight: everything else is in `docs/lesson-11/` and `docs/lesson-12/`, and the build follows those two
line for line. Where this folder is silent, use Lesson 11's file with "wow" read as "yaa" and Lesson 12's rules for
the yaa itself.

## The three things most likely to go wrong

1. **The zair and the yaa's dots colliding**, or the row dropping as Lesson 7's did (`02` §4).
2. **The id built from a drawing**: Lesson 12's risk, again. Madani draws no jazam and Indo-Pak draws ی. The id is
   `key + U+0650 U+064A U+0652` in both scripts.
3. **The same-sound tile with the wrong sits.** Khari zair sits below, so the same cell is a below-sitting tile, and
   the row rule has to grow the whole feature row, not just that one cell.
