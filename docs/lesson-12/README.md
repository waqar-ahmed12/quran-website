# Lesson 12 — build specification

**Read `docs/lesson-4/` in full, then `docs/lesson-5/` to `docs/lesson-11/`, before this folder** — and
`docs/step-9/README.md` for where this lesson sits. Lesson 12 is Lesson 10 with a yaa in place of the wow. `tail`,
the wide tile and the halo are in `docs/lesson-8/`; `forms` is in `docs/lesson-9/`; the jazam in the tail and its
Madani shape (U+06E1) are in `docs/lesson-10/`; the fourth `MARKS` statement and the per-script board line are in
`docs/lesson-11/`. **This folder is only what is new.**

Written 2026-09-28 (the user: "please plan out every lesson seperately").

## Status — built 2026-09-29

| | |
|---|---|
| **Written** | this folder, 2026-09-28 |
| **Built** | 2026-09-29 (the user: "build the next lesson in like, i will check them out later for mistakes"). `lesson-12.html`, `exercise-12.html`, the `fatha-yaa` row, the words, the fence and the checks. **Where the build differs: only that `qaida.css` was not touched** (nothing clipped, `03` §3) and `07` §7's swap did not arise (laam + yaa is two letters in both faces). See `QAIDA-BUILD.md`, "Step 9 built — Lesson 12" |
| **Was blocked on** | Lesson 11 built first. It was |
| New page files | `lesson-12.html` and `exercise-12.html`, copies of Lesson 11's. **No new script** |
| New data | one row (`'fatha-yaa'`) with **two** `forms` entries, one audio group (**27 new recordings**) |

## What Lesson 12 is, in a paragraph

**A yaa with a jazam after zabar makes "ai".** بَ "ba", بَيْ "bai", as in بَيْتٌ *bayt*, "a house", and خَيْرٌ
*khayr*, "good". It is Lesson 10 exactly, with a different letter after the zabar: the yaa has no vowel of its own,
the jazam on it says so, and it glides into the zabar. The page names it plainly, "zabar and yaa", never "leen", and
the home already does.

## The one thing that is genuinely new

**The tail is a letter the two scripts write differently.** Madani writes ي (U+064A). Indo-Pak writes ی (U+06CC), and
**at the end of a word the Indo-Pak yaa has no dots**, so the item reads بَیْ. Lessons 10 and 11 put a wow in the tail,
which is the same letter in both scripts. So:

- **Neither script draws the id.** Ids fold the *letters* to Madani (`shell.keyOf`, since Lesson 4) and the *marks*
  to Indo-Pak (Lesson 9's rule). A tail holding both a letter and a mark gets one of each: `U+064E U+064A U+0652`.
  The Madani drawing has U+06E1 for the jazam, and the Indo-Pak drawing has U+06CC for the yaa.
- **Both scripts get a `forms` entry**, the first row with two. `formOf` already reads `forms[script]` for any script
  name, so this needs no new code. `02` §2 explains, and the check proves the id is the same in both.

**The second thing to watch:** the yaa's end shape is a **bowl below the line**, with two dots under it in Madani. It
drops lower and reaches wider than Lesson 10's wow. Measure the tile (`03` §3).

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | "ai", the contrast against Lesson 10's "au", what is out |
| `02-the-yaa-in-two-scripts.md` | the characters, **the id that is neither script's drawing**, the dotless Indo-Pak end, which letters |
| `03-code-changes.md` | the row, the ids, the tile's bowl, the halo, audio |
| `04-page-and-wording.md` | `lesson-12.html` against `lesson-11.html` |
| `05-words.md` | fifteen candidates |
| `06-files-and-steps.md` | build order, checks, browser checklist |
| `07-open-questions.md` | what needs the teacher. **Read this one first if you read only one** |

## Rules that apply to this work

The same as `docs/lesson-11/README.md`: the PC rules (PowerShell, `node`, no Python, no Git Bash), every check in
`tools/`, a text field for every line, looks shown in the options panel rather than asked in words, plain names,
nothing locked, never harsh, no numbers, real words only, marks composed from code points, the user signs off.

## The three things most likely to go wrong

1. **The id built from a drawing.** If any call site builds an id from `drawnOf` (or from a key looked up through
   `shell.lettersOf()` in Indo-Pak without `keyOf`), the Indo-Pak id ends in U+06CC and a switch of script loses the
   credit. `suffixOf` only; the check switches and counts.
2. **The yaa's bowl clipped** at the bottom of the wide tile, or the two dots under it cut off. Measure all 27
   (`03` §3).
3. **A ligature where none was meant.** Some Naskh faces have an optional laam-yaa or baa-yaa form. The drawing must
   show the laam and the yaa, as a student reads them. Look at لَيْ and بَيْ in both faces (`02` §4).
