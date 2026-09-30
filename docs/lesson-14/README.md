# Lesson 14 — build specification

**Read `docs/lesson-4/` in full, then `docs/lesson-5/` to `docs/lesson-13/`, before this folder.** Lesson 14 is the
last lesson of the Qaida's first pass (`QAIDA-CONTENT.md`, "Scope": alphabet through jazam). Like Lesson 4 and
Lesson 7, it gets the full treatment, because **it has real new code**. `docs/step-9/README.md` §2: *"full plan first,
sign-off, then build."*

Written 2026-09-28 (the user: "please plan out every lesson seperately").

It is **not** a design record. That is `design-system/quran-landing/pages/qaida.md`, written after the user has seen
the page.

## Status — BUILT 2026-09-29, on `07` §1's recommendation (a), without a separate sign-off

The user said "go ahead and build next lesson if it is planned", and it was planned, so `07` §1 was taken as answered by
its own recommendation, **(a) one lead, ا with zabar**, as lessons 4–13 took theirs. The step log in `QAIDA-BUILD.md`
("Step 9 built — Lesson 14") lists where the build differs from this folder. **If the teacher wants (b) or (c), say so:**
(a) is a step towards (b), since the lead is already a field, but (c) removes it. Differences from the spec, in brief:
- **`markBox`'s halo needed a fix the spec did not foresee** (`03` §3): in Madani, Scheherazade New draws laam differently
  when the jazam follows, so the "draw with, draw without, diff" rang the whole letter. Fixed for a tile with a lead only.
- **`exercise.js` needed the same `data-last` as the lesson** (`04` §6 says the reading page's Next goes to the home; it
  needed code to do it).
- **`audio.js`'s description line** says "The one closed sound: alif with fatha, then {name} with sukoon", not the
  `"ab"` example in `03` §9, because the sound of every letter cannot be derived from its name.
- **`data-joined="off"` is on the board section, not on `<html>`** (`04` §1's table puts it on `<html>`; the code reads it
  from the section, as Lesson 9 does).

| | |
|---|---|
| **Written** | this folder |
| **Built** | `lesson-14.html`, `exercise-14.html`, and everything in `06` §1's table |
| **Was blocked on** | the user's sign-off on `07` §1, the shape of an item |
| Depends on | lessons 11–13 built (the fourth `MARKS` statement, the per-script board line), though nothing in the design needs them |
| New page files | `lesson-14.html` and `exercise-14.html` |
| New code | `marks.leadOf`, and the lead drawn at every place an item is drawn (`03` §2); a jazam step in `spell.js`; three rules in the words check; the last lesson's Next |
| New data | one row (`'sukun'`), one audio group (**27 new recordings**, `07` §5) |

## What Lesson 14 is, in a paragraph

**A jazam means the letter has no vowel of its own: it closes the sound before it.** اَ "a", اَبْ "ab" (one syllable,
not "a-ba"), as in قُلْ *qul*, "say", مِنْ *min*, "from", and قَلْبٌ *qalb*, "a heart". The student has seen the mark
already, on the wow and yaa of lessons 10 and 12 ("au", "ai"), and in Indo-Pak on the long vowels of lessons 11 and
13. This lesson takes it to **every letter**, and that is the whole of what "jazam" means.

## The one thing that is genuinely new

**The item has a letter in front of it that is not being asked about.** A jazam cannot be said on its own: بْ has no
sound. So every item is written after a vowelled alif, exactly as a printed Qaida's jazam table is: اَبْ اَتْ اَثْ…
The alif is **the lead**. `docs/step-9/README.md` described this as "the item is a pair, and the page has to know
which letter it is asking about". **This spec's answer is that the page never has to know:**

- the lead is **drawn, never asked**. The item is still "Baa with jazam", and its id is still the letter and its mark
  (بْ, two characters);
- so every rule so far holds unchanged: `masteredCount`, the twins, the ids, a script switch keeping the credit;
- what changes is **every place that draws an item**, which now draws the lead in front of it (`03` §2 lists all of
  them).

Two more new things, smaller:

- **The walkthrough meets a letter with no sound of its own.** `spell.js` has named every letter with its vowel since
  Lesson 4. A jazam letter gets its own line (`03` §6).
- **The jazam's shape on every letter**, including the tall ones, in both scripts (`02` §4).

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | what "knowing jazam" is, the contrast (a vowel against no vowel), what is out |
| `02-the-jazam-and-the-lead.md` | the characters, **the lead**, which letters (27), the shape on every letter |
| `03-code-changes.md` | `leadOf`, **every draw site**, the halo, `spell.js`, the words check, the last Next, audio |
| `04-page-and-wording.md` | `lesson-14.html`: attributes, every line, accessibility |
| `05-words.md` | the walkthrough and `exercise-14.html`: fifteen candidates, and the tajweed traps they avoid |
| `06-files-and-steps.md` | files in build order, the checks, the browser checklist |
| `07-open-questions.md` | **§1 needs the user's answer before building.** The rest are for the teacher |

## Rules that apply to this work

Unchanged: the PC rules (PowerShell, `node`, no Python, no Git Bash, never `dangerouslyDisableSandbox`, PNG/WebP);
every check in `tools/`; a text field for every line; looks shown in the options panel rather than asked in words;
plain names ("jazam", which is what a Qaida class says, or "sukoon"); nothing locked; never harsh; no numbers on the
page; real words only; marks composed from code points; the user previews and signs off; the step line at the end of
every reply about the Qaida.

## The three things most likely to go wrong

1. **A draw site missed.** There are eight (`03` §2). One without the lead shows a bare بْ that has no sound, in the
   middle of a page of اَبْ. The page check asserts that **every** Arabic glyph the page draws for an item starts with
   the lead: board tiles, rail, title, prompt, choices, the verdict's glyph.
2. **The lead leaking into the id.** Then `masteredCount(14)`, which counts two-character ids ending in U+0652,
   counts nothing, and the home shows the lesson untouched however much is done. Ids come from `suffixOf`, never
   from a drawn string.
3. **The halo ringing the lead.** It should ring the jazam alone. `markBox`'s "before" string has to include the lead
   (`03` §3).
