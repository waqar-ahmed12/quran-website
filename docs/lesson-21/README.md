---
tags: [lesson-21, silent-letters, tap-the-letter, rule-page, built]
---
# Lesson 21 — Letters that are not read: lesson plan

*One-file plan, written 2026-09-28; **built 2026-10-06** (the user: "go ahead and make the next lesson"). The plan below is kept as it was written, with the build's own notes in
[[docs/lesson-21/01-design|01 Design]] and [[docs/lesson-21/02-build-record|02 Build record]]. Read [[docs/pass-2/README|Pass 2]] first, above all
[[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §2, checked against Quran.com, which is this lesson's whole foundation.*

**Part of:** [[MAP]] · [[QAIDA-BUILD]] · before it [[docs/lesson-20/README|Lesson 20, the wavy line]] · after it [[docs/lesson-22/README|Lesson 22, stopping]]

## Status — built (2026-10-06)

Built on the README's recommendations, with **two things the plan did not say**: **thirty items** (18 words, 12 questions about one letter), in **three parts** (tap the letter; read,
or not read?; all together, where "none" is an answer), and **the first question to tap a letter**, which needed the one change to the engine this pass was allowed
(`practice.js`: a format may bring its own answers). **The plan's showpiece words are out** (the word for "those" and the word for prayer with its article), **the alif of *ana* is
out** (a third answer), and **the Indo-Pak rule is stated and measured** against the whole Qur'an: 87% of Madani's circles agree with it, and the teacher still confirms it. The
nine places that differ, and the user's list, are in [[docs/lesson-21/02-build-record|02 Build record]] §2 and §4.

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
