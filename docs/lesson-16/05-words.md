---
tags: [lesson-16, hamza, spec]
---
# 05 — Words

**Part of** [[docs/lesson-16/README|Lesson 16]] · previous [[docs/lesson-16/04-page-and-wording|04]] · next [[docs/lesson-16/06-files-and-steps|06]] · [[MAP]]

**Ordinary spellings, composed from code points, as every lesson since 8 ("real words, not quotations").** From Lesson 18
the examples are the Qur'an's own words, copied (`docs/pass-2/02` §3); Lesson 16 is not, because a hamza on its seat
looks the same in a dictionary as in the mushaf. Every word is **a candidate for the teacher's check**.

## 1. The walkthrough: three words (`spell.js`)

A root entry is `[key, markId]`. A seat is written as its Madani letter (`أ ؤ ئ`) and resolved by `qaidaRules.seatOf`
(`03` §8), so **one entry draws سَأَلَ in Madani and سَاَلَ in Indo-Pak**. The hamza on the line is the ordinary letter
`ء`.

| Word | Roots | Steps | Meaning | What it shows |
|---|---|---|---|---|
| **سَأَلَ** | `['س','fatha'], ['أ','fatha'], ['ل','fatha']` | sa · 'a · la | he asked | an alif seat **in the middle**: the seat is not read, so it is "sa-'a-la" and never "saa-la" |
| **مُؤْمِنٌ** | `['م','damma'], ['ؤ','sukun'], ['م','kasra'], ['ن','dammatain']` | mu · ' · mi · nun | a believer | a wow seat with a jazam: "mu'-mi-nun", and the wow is not "oo" |
| **سَمَاءٌ** | `['س','fatha'], ['م','fatha-alif'], ['ء','dammatain']` | sa · maa · 'un | a sky | the hamza on the line, after a long "aa", with two paish |

A hamza with a jazam is **its own step**, as Lesson 14's jazam letters are (`syll` is just the catch), and the blend step
after it joins it to the syllable before ("mu'"). `data-hamza-line`: "{name} with {mark}: {sound}."

## 2. The reading page: twelve words (`exercise-16.html`, `exercise.js`)

No walkthrough, no meanings, as every mark lesson's page since Lesson 4.

| # | Word | Seat | Note |
|---|---|---|---|
| 1 | أَكَلَ | alif | he ate |
| 2 | أَخَذَ | alif | he took |
| 3 | أَبٌ | alif | a father |
| 4 | إِذَا | alif, zair | when |
| 5 | قَرَأَ | alif, at the end | he read |
| 6 | يَأْكُلُ | alif, jazam | he eats. **Indo-Pak: يَاْكُلُ, an alif with a jazam** (`02` §2) |
| 7 | سُئِلَ | yaa | he was asked |
| 8 | بِئْرٌ | yaa, jazam | a well |
| 9 | ذِئْبٌ | yaa, jazam | a wolf |
| 10 | ~~لُؤْلُؤٌ~~ → **مُؤْلِمٌ** | wow, jazam | painful. **Built as مُؤْلِمٌ** (2026-09-30): لُؤْلُؤٌ ends in a hamza on a wow with two paish, which is not one of the fifteen forms, and the words check now proves every seat key is (see [[docs/lesson-16/08-build-record\|08]]) |
| 11 | شَيْءٌ | the line, jazam | a thing |
| 12 | جَزَاءً | the line, two zabar | a reward |

**Ordering:** the alif words first (the seat the student knows), the yaa and wow seats next, the line last.

## 3. What the words check adds (`tools/qaida-words-check.js`)

- a hamza with a **jazam** comes after a vowelled letter, never first in a word (the lead's reason);
- every word uses **only the fifteen forms** or a mark row from Lessons 4–15; nothing from Lesson 18 on (no article, no
  joining alif, no wavy line);
- **the Indo-Pak drawing of every word contains no U+0623 or U+0625** (the Madani alif seats), so the seat hook cannot
  leave a Madani glyph on the Indo-Pak page.
