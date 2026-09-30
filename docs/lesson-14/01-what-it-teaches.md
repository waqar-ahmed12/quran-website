# 01 — What Lesson 14 teaches

## 1. The one sentence

**A letter with a jazam has no vowel of its own. It closes the sound before it.** اَ is "a", and اَبْ is "ab": one
syllable, not "a-ba".

A student who knows it can:
- read اَبْ on any of the 27 letters as one closed syllable;
- **tell اَبْ ("ab") from اَبَ ("a-ba"), اَبِ ("a-bi") and اَبُ ("a-bu")**: a jazam against a vowel on the same
  letter. This is the whole lesson in one question;
- read it inside a word: قُلْ, مِنْ, قَلْبٌ, مَسْجِدٌ;
- see that the "au" and "ai" of lessons 10 and 12 were this all along: a wow or yaa with a jazam after zabar.

## 2. The contrast

`against: ['fatha', 'kasra', 'damma']`. The same letter, after the same lead, with a **vowel** instead of the jazam:

| | Item | Twin | What the student must see |
|---|---|---|---|
| sound | اَبْ "ab" | اَبَ "a-ba" | one syllable or two |
| picture | a small closed mark | a stroke above, below, or a curl | which mark the **second** letter carries |

`data-twins="alternate"`: each letter meets **one** of the three vowels as its twin, rotating through the three and
flipping between the parts (`mark-lesson.js`'s `twinsFor` already does this for any number of `against` marks). The
lead is the same in every choice, so it can never give the answer away.

**The board is a trio**, not a quartet: ب → اَبَ → اَبْ ("the letter; with zabar, after the alif: two sounds; with
jazam: one"). A quartet with all three vowels would be five tiles, four of them two letters wide.

## 3. The lead: always اَ in the drill

Every item and every twin is drawn after **alif with zabar**, the first table of a printed Qaida (اَبْ اَتْ اَثْ).
The other two leads (اِبْ, اُبْ) are **shown on the board, one line, and not drilled**: the first letter's vowel is
lessons 4–6's skill, not this lesson's. `07` §1 lays out the alternative (Lesson 7's shape, one part per lead) and
what it would cost.

## 4. What the student has already seen

| Lesson | Where the jazam appeared | Madani | Indo-Pak |
|---|---|---|---|
| 10 | the wow after zabar: "au" | بَوْ | بَوْ |
| 11 | the wow after paish: long "oo" | بُو (no mark) | بُوْ |
| 12 | the yaa after zabar: "ai" | بَيْ | بَیْ |
| 13 | the yaa after zair: long "ee" | بِي (no mark) | بِیْ |

So the board's "you have seen it" line is **per script** (Lesson 11's mechanism, `04` §3). In Madani the jazam has
only ever closed a syllable. In Indo-Pak it has also sat on a long vowel, and the line says the rule is the same one:
**the letter has no vowel of its own**.

**Part 2 holds اَوْ and اَيْ.** Those are Lesson 10's "au" and Lesson 12's "ai" on the alif. A line in part 2 says so
(`04` §3). It is the clearest proof the student has that jazam is one rule.

## 5. What the drill can and cannot test

The name-it drill tests the picture: **which mark is on the second letter**. It is a fair question, harder than
lessons 10–13's "which letter follows", because the jazam and zabar sit in the same place and differ in shape. The
sound, one syllable against two, is only tested by ear, with the teacher's recordings (`07` §5).

## 6. What is out

- **Shadda.** A doubled letter is a jazam and then a vowel on the same letter (رَبَّ). It is the obvious next thing, and
  it is the next pass (`QAIDA-CONTENT.md`, "Scope").
- **Tajweed**, which this lesson runs into more than any other:
  - **qalqalah**: a jazam on ق ط ب ج د is read with a slight bounce. Five of the 27 items have it (`07` §5);
  - **noon and meem with a jazam** before certain letters (ikhfa, idgham, iqlab: مِنْبَرٌ is read "mimbar");
  - **the "al" of the definite article**, whose laam is silent before half the letters (الشَّمْسُ).

  None of it is taught. The words avoid every case where it would change what the student reads (`05` §1).
- **Hamza with a jazam** (يَأْكُلُ): the seat differs between the scripts, as it has since Lesson 8.
- **The alif wasla** (ٱ): Madani writes the article's alif with it and Indo-Pak does not. It is out of the words.
