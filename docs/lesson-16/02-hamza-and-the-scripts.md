---
tags: [lesson-16, hamza, spec]
---
# 02 — Hamza and the two scripts

**Part of** [[docs/lesson-16/README|Lesson 16]] · previous [[docs/lesson-16/01-what-it-teaches|01]] · next [[docs/lesson-16/03-the-rule-page|03]] · [[MAP]]

## 1. What each mushaf prints (checked against Quran.com, 2026-09-28 and 2026-09-30)

"Madani" is Quran.com's `text_uthmani`, "Indo-Pak" is its `text_indopak`. Code points in brackets.

| | Madani | Indo-Pak | Verse |
|---|---|---|---|
| alif seat, zabar | أَ (0623 064E) | **a bare alif with the vowel**: اَ (0627 064E) | 1:7 |
| alif seat, zair | إِ (0625 0650) | اِ (0627 0650) | 1:5 |
| alif seat, paish | أُ (0623 064F) | اُ (0627 064F) | 5:6 |
| alif seat, **jazam** (in the middle) | يَأْكُلُونَ (0623 0652) | **يَاۡكُلُوۡنَ (0627 06E1): an alif with a jazam** | 2:174 |
| alif seat, zabar (in the middle) | سَأَلَ (0623 064E) | سَاَلَ (0627 064E) | 70:1 |
| on the line | شَىْءٍ (0621 064D) | شَىۡءٍ (0621 064D) | 2:20 |
| on a wow | يُؤْمِنُونَ (0624 0652) | يُؤۡمِنُوۡنَ (0624 06E1) | 2:6 |
| on a yaa | بِئْسَمَا (0626 0652) | بِئۡسَمَا (0626 06E1) | 2:90 |
| on a yaa, in a word's middle with a long vowel | أُو۟لَـٰٓئِكَ (0626) | اُولٰٓٮِٕكَ: **a dotless seat with a hamza below it (066E 0655)** | 2:5 |
| hamza then a long "aa" | ءَامَنُوا۟ (0621 064E 0627) | اٰمَنُوْا | 2:9 |

So: **an Indo-Pak student has read hamza since Lesson 4.** Every alif with a vowel on it (اَ اِ اُ) is one, and Lesson
14's lead اَ is exactly the Indo-Pak spelling. The Madani student meets a new sign, the small hamza on an alif.

## 2. The two findings

**The alif seat does not depend on position.** Both scripts write the same alif seat at the start and in the middle of a
word (Madani أ إ; Indo-Pak a bare ا). The one-file plan's "at a word's start" was a guess about the Indo-Pak mushaf that
the text does not support. **So the parts are by seat.** (Madani has a third mid-word form for a hamza with paish on
an alif, أُ; it is the same one.)

**An Indo-Pak alif can carry a jazam, and then it is a hamza.** `docs/pass-2/01` §2 said "the alif is the one exception:
it never carries a jazam". That is true of the *long-vowel* alif (a bare alif after a zabar is "aa") and was written
about that. An alif with a jazam (يَاۡكُلُوۡنَ, تَاۡخُذُهٗ, اِقۡرَاۡ) is a hamza with a jazam. **So `docs/pass-2/01` is corrected** (a
line under its §3), and Lesson 21's "letters not read" (the plural alif, which Indo-Pak leaves bare) is not affected.

## 3. What the site's faces draw (measured, browser pane, 2026-09-30)

The forms were drawn in **Scheherazade New, Noto Naskh Arabic and Amiri Quran** at 38px: أَ إِ أُ, اَ اِ اُ, ءَ ءِ ءُ ءً,
ؤَ ؤُ ؤْ (0652 and 06E1), ئَ ئِ ئْ (0652 and 06E1), the Quran.com Indo-Pak seat (066E 0655 0650), an alif with 0652 and
with 06E1, and the words سَأَلَ, يَأْكُلُ (both spellings), مُؤْمِنٌ, سَمَاءٌ, بِئْرٌ (both spellings) and شَيْءٌ.

| | Result |
|---|---|
| every Madani and every Indo-Pak form above | **draws in all three faces**: no box, no fallback face, the hamza and the vowel both visible |
| kasra on the alif seat (إِ) | drawn **below** the alif, in all three |
| the Indo-Pak yaa seat (066E 0655 0650) | draws as a dotless bowl with the hamza below it, **a different shape from ئ**, so it is a real choice (`§5`) |

**Not measured yet, and left for the page** (`06` §4): the clearances (a screenshot at 38px shows that the forms draw,
not how many pixels apart the hamza and the vowel are), the wow seat with a jazam at 375px (the tightest case, as Lesson
13's yaa was), the jazam's shape per face (Lesson 10 measured that Scheherazade New draws U+0652 as a small circle and
U+06E1 as the open head of khaa; this lesson relies on that and does not re-measure it), and both themes. **This is a
first look, not a fence**: the build measures clearances in the page, as lessons 13 and 14 did.

## 4. The jazam forms and their lead

A jazam has no sound on its own, and a hamza with a jazam is "'" *after a vowel*: مُؤْمِنٌ, يَأْكُلُ. So, as Lesson 14 did,
**every jazam form on the page is drawn after a lead**: the tile shows بَ then the form (بَؤْ, بَأْ, بَئْ, بَءْ),
"drawn, never asked, never part of an id".

**Why baa and not Lesson 14's alif.** An alif then an alif-seat hamza (اَأْ) is two alifs in a row, which reads as "aa" to
a beginner. Baa joins into every seat (بَؤْ بَئْ بَأْ) and into the line (بَءْ), and each of those is a real spelling
(`مَأْ`, `بَئْسَ`, `شَيْءٌ`). The lead is a code-point list on the form, `lead: [0x0628, 0x064E]`, drawn by `rules.js`.

**The jazam's drawing follows Lesson 14.** Madani draws U+06E1 (the open head of khaa the Madina mushaf prints, measured
by Lesson 10), Indo-Pak draws U+0652. **The id never contains either** (`03` §2), so a script switch keeps the credit.

## 5. The Indo-Pak yaa seat

Quran.com's Indo-Pak text writes the hamza on a yaa as a dotless seat with the hamza *below* (066E 0655), in the words
where the seat is in the middle of a word. The ordinary Arabic ئ (0626) is what a Urdu-medium printed Qaida commonly uses,
and what Quran.com's Indo-Pak text writes in words like بِئۡسَ (0626 06E1). **Recommended: draw ئ (0626) in both
scripts**, because it is drawn by both faces, is a single code point, and is in Quran.com's own Indo-Pak text as well.
The 066E-0655 seat is a font-specific spelling (`docs/pass-2/01` §9) and belongs to the Qur'an-font work of Lesson 23. **The
teacher's Qaida decides** (`07` §3).

## 6. The keys

`ء` is already a key in the shell, and Lesson 1 teaches it. The seats أ ؤ ئ are not keys: they are **the forms of this
lesson**, not letters of the 29, so the keys stay the 29 and `keyOf` is untouched. A form's id is one fixed string
(`03` §2).
