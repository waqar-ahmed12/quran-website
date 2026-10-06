---
tags: [lesson-19, wasl, joining-alif, rule-page, built]
---
# Lesson 19 — The joining alif: lesson plan

*One-file plan, written 2026-09-28; **built 2026-10-05** (the user: "there should be a new lesson plan, please start building"). The plan below
is kept as it was written, with the build's own notes in [[docs/lesson-19/01-design|01 Design]] and [[docs/lesson-19/02-build-record|02 Build record]].
Read [[docs/pass-2/README|Pass 2]] first. The script facts are [[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §2 and §4, checked
against Quran.com.*

**Part of:** [[MAP]] · [[QAIDA-BUILD]] · before it [[docs/lesson-18/README|Lesson 18, Al-]] · after it [[docs/lesson-20/README|Lesson 20, the wavy line]]

## Status — built (2026-10-05)

Built on the README's recommendations: the plain name with the class's word once, the starting vowel as one line and one example each, and
**Madani and Indo-Pak both**, with Lesson 18's honest line about the stand-in font. **Eight places differ from this plan**, each with its reason
in [[docs/lesson-19/02-build-record|02 Build record]] §2; the ones that matter most: **the starting vowels are answered in the student's own words**
(zabar, zair, paish) and not as "a / i / u"; **one additive engine tag (`askGroup`)** was needed because part 4 mixes three questions; **the basmala is
out** (Quran.com's Indo-Pak text for it is unmarked); and **the plan's claim that the Indo-Pak jazam is always gone was nearly, not quite, right**
(15 of 896 pairs keep it), while **Madani does mark the shortened vowel** (the end yaa drops its small alif).

| | |
|---|---|
| **Page** | the rule lesson; **word pairs** for the first time (the word before and the word with the alif) |
| **Depends on** | Lesson 18 built |
| **Recordings** | about a dozen **pairs**, read joined |

## What it teaches

**Some words start with an alif that is read only when you start there.** In the middle of a sentence you skip it.
The sound runs from the last vowel of the word before, straight on:

- بِسْمِ اللّٰهِ is "bis-mil-laah", not "bismi allaah";
- وَالشَّمْسِ is "wash-shamsi".

This is the alif of "al-" (Lesson 18), and of a few other words: اِسْمٌ, اِبْنٌ, and verbs like اِهْدِنَا (1:6).

**And a long vowel just before it is read short**: فِى الْاَرْضِ is "fil-ardi", not "fii al-ardi". Two sounds with no
vowel between them cannot both be said, so the long vowel gives way.

**Starting on such a word** (at the beginning of a verse, or after a stop): "al-" starts with "a"; most others with
"i"; a verb whose third letter has paish starts with "u" (اُدْعُ). This is one line and one example. A beginner mostly
starts at a verse's beginning, where the Indo-Pak mushaf prints the vowel.

## The two scripts

This is the lesson where the scripts differ most in **how much they tell the reader**:

| | Madani | Indo-Pak |
|---|---|---|
| the joining alif | **ٱ** (a small saad-like mark on the alif), everywhere | **bare ا** in the middle of a verse; **with its vowel** at a verse's start |
| a long vowel shortened before it | **not marked**: فِى ٱلْأَرْضِ | **its jazam is gone**: فِى الْاَرْضِ, against فِىْ قُلُوْبِهِمْ where it is read long |

So **the Madani student learns one sign** (ٱ: "skip me when joining") **and one rule** (a long vowel before me is
short). **The Indo-Pak student learns to trust the marks**: a letter with no mark is not read (Lesson 21 says it in full),
and the Indo-Pak mushaf has already taken the jazam off the shortened vowel. The board has one line per script
(Lesson 11's mechanism).

## What is drilled

| Part | Examples | Question |
|---|---|---|
| 1 | a word alone that starts with the alif | "how do you start it?" (a / i / u) |
| 2 | a pair, the alif skipped | "is the alif read?" (yes, starting here / no, joined) |
| 3 | a pair with a long vowel before the alif | "is the long vowel read long?" (long / short) |
| 4 | all | all three |

Every answer is a plain phrase. The choices come out as the two or three phrases (`docs/pass-2/02` §2).

## What is new in the code

**Word pairs.** An example is two consecutive words by reference (`"1:1:1-2"`), fetched and saved together. The board
lights the joining alif (unread) and the sound it runs from. The pair's recording is read joined.

## Examples (from the Qur'an, by reference; candidates)

- **Skipped:** بِسْمِ اللّٰهِ (1:1:1–2), وَالشَّمْسِ (91:1:1, where the wow is itself the word before), وَالْقَمَرِ (91:2:1),
  رَبِّ الْعٰلَمِيْنَ (1:2:3–4), اِهْدِنَا الصِّرَاطَ (1:6:1–2).
- **A long vowel shortened:** فِى الْاَرْضِ (2:27:16–17). Another one in the full plan.
- **Started:** اَلْحَمْدُ (1:2:1, at a verse's start), اِهْدِنَا (1:6:1).

Each checked against "only what is taught by Lesson 19". A pair with a silent letter (عَمِلُوا الصّٰلِحٰتِ) waits for
Lesson 21. **The basmala in Indo-Pak**: Quran.com's Indo-Pak text writes its Allah with no marks, for its own font to
draw whole (`docs/pass-2/01` §4). So بِسْمِ اللّٰهِ is shown in Indo-Pak only once that font is in. Until then, the
Indo-Pak example is رَبِّ الْعٰلَمِيْنَ.

## What is out

The rare cases where the first vowel of a started verb is not the rule's (a handful of nouns); joining across a verse
end (a stop is Lesson 22's).

## Open questions

1. **"The joining alif"**, or the class's word, *hamzat al-wasl*? **Recommended: plain, with the class's word once.**
2. **The starting-vowel rule** (a / i / u): teach it, or say only "the mushaf shows it at a verse's start"?
   **Recommended: one line and one example each.** The Madani mushaf never shows it.
3. **Examples**: the eight are candidates. Every pair must be two whole words as printed.
