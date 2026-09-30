# Lesson 16 — Hamza: lesson plan

*One-file plan, written 2026-09-28 (the user: "plan for shadda too, and the ones that are left for the quran"). It
becomes a full folder, like `docs/lesson-15/`, before it is built. Read `docs/pass-2/` first. The facts about the two
scripts below are from `docs/pass-2/01` §3, checked against Quran.com.*

| | |
|---|---|
| **Page** | **the rule lesson, born here** (`rule-lesson.js`, `rules.js`, `docs/pass-2/02` §1). Its full plan is the biggest part of this lesson's full folder, as Lesson 4's was for `mark-lesson.js` |
| **Depends on** | Lesson 15 built |
| **Recordings** | **few new.** A hamza with a vowel is the sound Lessons 4–6 recorded on alif ("a, i, u"). New: a hamza with jazam, after a vowel ("a'", as in يَأْ), about 3 |

## What it teaches

**Hamza (ء) is a letter, the 29th: a short catch in the throat, read with whatever vowel it carries.** It is written on
the line (ء) or on a **seat**: an alif (أ إ), a wow (ؤ), or a yaa with no dots (ئ). **The seat is never read.** It only
holds the hamza up. أَ ءَ ؤَ ئَ are all "a".

A student who knows it can read a hamza on any seat with any mark, and does not read the seat as a letter: سَأَلَ is
"sa-'a-la", not "saa-la".

## The two scripts

**This is where they differ most so far.**

| | Madani | Indo-Pak |
|---|---|---|
| at the start of a word | أَ أُ إِ, the hamza sign on the alif | **a bare alif with the vowel**: اَ اُ اِ |
| on the line | ءَ | ءَ |
| on a wow | ؤ | ؤ |
| on a yaa | ئ | a dotless seat with a hamza under it (Quran.com's Indo-Pak text: U+066E U+0655) |
| a hamza then a long "aa" | ءَا (hamza, zabar, alif) | اٰ (an alif with khari zabar) |

**The Indo-Pak student has been reading hamza since Lesson 4.** Every alif with a vowel on it is one: اِ in zair's
first six, the lead اَ in lessons 14 and 15. The board says so in Indo-Pak ("An alif with a vowel on it is a hamza.
You have been reading it since the start"). **The Madani student meets a new sign on a familiar letter.**

**To check before the full plan:** how the Indo-Pak mushaf writes a hamza *in the middle* of a word, on an alif, with
a vowel or a jazam (يَأْكُلُ, سَأَلَ). The likely answer is an alif carrying the mark with no hamza sign. Check it in the
fetched text, as `docs/pass-2/01` was.

**Same sound, two spellings**, as Lesson 9's same-sound tile: Madani ءَا and Indo-Pak اٰ are both "'aa". The tile
shows the other script's spelling beside it only if the teacher wants the two scripts compared (`docs/pass-2/03`, by
analogy with Lesson 9, where the tile compared spellings within one script). **Recommended: not across scripts.** A
student reads one mushaf.

## What is drilled

A **fixed set of about 15 forms**, not "a mark on each of 27 letters". That is why this lesson needs the rule page:

| Part | Forms |
|---|---|
| 1 | on an alif, at a word's start: أَ أُ إِ (Indo-Pak اَ اُ اِ) |
| 2 | on the line: ءَ ءِ ءُ, and with two zabar (ءً) |
| 3 | on a wow and a yaa: ؤَ ؤُ ؤْ ئَ ئِ ئْ |
| 4 | all of them, with a jazam on each seat (أْ ؤْ ئْ) |

**The question is "name it"**: a form, then pick "Hamza with zabar / zair / paish / jazam". Many forms share a name
(أَ and ءَ are both "hamza with zabar"), and the engine never shows the same answer twice (`docs/pass-2/02` §2), so the
choices come out as the **marks**. So the question really asks "read the mark, ignore the seat", which is the lesson.

**The reverse question (a name, pick the picture) is switched off here.** Two pictures honestly have the same name,
and the engine would mark a right one wrong. This is the first lesson where that is true.

## What is new in the code

- **`rule-lesson.js` and `rules.js`** (the second page type, `docs/pass-2/02` §1): a board of forms and examples, the
  parts rail, the drill, the Spell block, "Write it", "Say it", the options panel. The full plan specifies them the
  way `docs/lesson-4/` specified `mark-lesson.js`.
- **Items composed per script**: a hamza form's drawing differs by script (the start-of-word alif), so each form
  carries a `forms` entry, Lesson 9's idea on a new page. Its **id is one fixed string** (the Madani code points), so a
  script switch keeps the credit.
- **The key `ء`** finally gets items. Every lesson since 8 skipped it.

## Examples (ordinary spellings, candidates)

Walkthrough: سَأَلَ (he asked), مُؤْمِنٌ (a believer), سَمَاءٌ (a sky: the hamza on the line after a long "aa").
Reading page, twelve: أَكَلَ, أَخَذَ, قَرَأَ, بَدَأَ, يَأْكُلُ, سُئِلَ, بِئْرٌ, ذِئْبٌ, لُؤْلُؤٌ, شَيْءٌ, جَزَاءٌ, أَبٌ. Each needs
the teacher's check, and each has an Indo-Pak spelling (اَكَلَ…) drawn by the forms.

## What is out

The rules for *which seat* a hamza takes (spelling, not reading); the hamza "made easy" (tas-heel) in one word of the
Qur'an (`docs/pass-2/README.md` §7); the joining alif, which *looks* like a hamza-less alif and is Lesson 19.

## Open questions

1. **The names**: "Hamza on an alif, with zabar", or just "Hamza with zabar"? **Recommended: the short one.** The seat
   is what the student must learn to ignore.
2. **The Indo-Pak line** ("you have been reading it since the start"): say it (**recommended**), or leave the
   Indo-Pak student to notice?
3. **ءَا against اٰ** across scripts: not shown (**recommended**).
4. **Words**: the fifteen are candidates.
