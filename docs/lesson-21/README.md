# Lesson 21 — Letters that are not read: lesson plan

*One-file plan, written 2026-09-28. It becomes a full folder before it is built. Read `docs/pass-2/` first, above all
`docs/pass-2/01` §2, checked against Quran.com, which is this lesson's whole foundation.*

| | |
|---|---|
| **Page** | the rule lesson; **the "tap the letter" question is born here** (`docs/pass-2/02` §2) |
| **Depends on** | Lesson 20 built |
| **Recordings** | about a dozen words |

## What it teaches

**Some letters are written and never read.** The student has to see them and step over them:

| | Madani | Indo-Pak | Read |
|---|---|---|---|
| the alif after a plural wow | ءَامَنُوا۟ | اٰمَنُوْا | "aamanuu": the alif is silent |
| the wow of "those" | أُو۟لَـٰٓئِكَ | اُولٰٓئِكَ | "ulaa'ika": the wow is silent |
| the alif of "I" | أَنَا۠ | اَنَا | "ana" joined, "anaa" only at a stop |
| a wow carrying "aa" | ٱلصَّلَوٰةَ | الصَّلٰوةَ | "as-salaata": no "w" |

**How each script shows it**, and this is the lesson:

- **Madani marks the silent letter**: a **small circle** (۟) over a letter never read, and a **small rectangle** (۠)
  over one read only at a stop. A letter with no mark after its own vowel is long, as since Lesson 8.
- **Indo-Pak marks the letters that *are* read.** A wow or yaa that is read carries a mark (a vowel, or a jazam when it
  is long or closes a syllable), and **a wow or yaa with no mark is not read.** An alif after zabar is long with no mark
  (an alif never carries a jazam), so **an alif with no zabar before it is not read**.

**This is why lessons 11 and 13 showed a jazam on the Indo-Pak long-vowel wow and yaa.** It was not decoration: in
Indo-Pak the jazam is what separates "read long" from "not read at all". The Indo-Pak half of this lesson is the
payoff of those two, and the board says so.

**The alif of أَنَا is the hard case in Indo-Pak**: printed bare after a zabar, it looks like a long "aa", and is read short
unless you stop. The teacher is asked (below).

## What is drilled

| Part | Question |
|---|---|
| 1 | **tap the letter that is not read**: a word, and its letters as the choices |
| 2 | "read, or not read?" for one lit letter |
| 3 | all, mixed with words where every letter is read, so "none" is sometimes the answer |

**The new question.** "Tap the letter" deals the word's own letters as the choices, not other items. It is one additive
change to `practice.js` (a format may bring its own `choicesFor`, `docs/pass-2/02` §2). The page draws the word with
each letter a button, split by `Intl.Segmenter`, never by counting code points, and shows the whole word joined as it
is printed. That is the one real design problem: **tap targets on a joined Arabic word**, where letters are not
separate boxes. The full plan measures each letter's ink (as the halo does) and lays invisible buttons over it.

## Examples (from the Qur'an, by reference; candidates)

ءَامَنُوا (2:9), كَفَرُوا (2:6), اَقِيمُوا (2:43), اُولٰٓئِكَ (2:5), اَنَا (7:12), الصَّلٰوةَ (2:43), الزَّكٰوةَ (2:43), and for
"none": قَالَ, الرَّحِيْمِ. Each checked against "only what is taught by Lesson 21".

## What is out

Letters dropped in the spelling (the "missing" alif of لِلّٰهِ or of الرَّحْمٰنِ, written as a standing mark, Lesson 9);
the few words with a written letter read differently (the saad read as seen, `docs/pass-2/README.md` §7).

## Open questions

1. **أَنَا in Indo-Pak**: say "the alif of *ana* is short unless you stop" as a one-word exception (**recommended**),
   or leave it to the teacher?
2. **The Indo-Pak rule in words**: "a wow or yaa with no mark is not read" is Claude's summary of what 22 checked verses
   show. **The teacher confirms it before this lesson is written in full**, and the full plan checks it against more
   verses.
3. **Tap the letter on a phone**: letters in a joined word are small. The full plan sets a minimum target (the site's
   44px) and zooms the word if needed. Look at it on a real phone.
