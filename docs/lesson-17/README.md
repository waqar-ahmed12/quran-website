---
tags: [lesson-17, round-taa, end-yaa, rule-page, built]
---
# Lesson 17 — The round taa and the end yaa

*One-file plan written 2026-09-28; **built 2026-09-30** (the user: "build the next lesson in line"). The plan below is kept as it was
written, with the build's own notes in [[docs/lesson-17/01-design|01 Design]] and [[docs/lesson-17/02-build-record|02 Build record]].
Read [[docs/pass-2/README|Pass 2]] first. The script facts are [[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §8, checked
against Quran.com.*

**Part of:** [[MAP]] · [[QAIDA-BUILD]] · before it [[docs/lesson-16/README|Lesson 16, hamza]] · after it [[docs/lesson-18/README|Lesson 18, Al-]]

## Status — built (2026-09-30)

Built on Lesson 16's rule page with a second **kit** (`ends.js`); what changed from the plan below is listed in
[[docs/lesson-17/02-build-record|02 Build record]] §2. The short version: **part 2 has four letters, not six** (eight forms, so the drill
is not longer than it has to be), **no new recording** (the lesson plays what Lessons 4–13 recorded), and **هُدًى is not in the reading
list** (the plan listed it under the small-alif yaa; it is a two-zabar word and a stop changes it, so it is Lesson 22's).

| Note | What it settles |
|---|---|
| [[docs/lesson-17/01-design\|01 Design]] | what it teaches, the fourteen forms, what each script prints, the words and the recordings |
| [[docs/lesson-17/02-build-record\|02 Build record]] | what was built, where it differs from this plan, what was measured and checked, what is still the user's |

| | |
|---|---|
| **Page** | the rule lesson (Lesson 16's) |
| **Depends on** | Lesson 16 built |
| **Recordings** | none new: a round taa plays what a taa with that mark says, and an end yaa what its letter says with the long vowel |

## What it teaches

Two shapes that come **only at the end of a word** and are not among the 29 letters:

1. **ة, the round taa** (*taa marbuta*): a taa, read "t" with its mark (رَحْمَةٌ "rahmatun"). **At a stop it is read
   "h"** (Lesson 22 teaches stopping; this lesson says it in one line). It always follows a zabar. **With two zabar it
   takes no alif after it** (جَنَّةً), the one exception to the silent alif Lesson 7 left for later.
2. **ى, the end yaa with no dots**: both mushafs write a yaa at the very end of a word without dots. It is read
   two ways:
   - **after zair: a long "ii"**, the yaa of Lesson 13 at the end of a word: فِى, ٱلَّذِى;
   - **after zabar, with a small standing alif: a long "aa"**, and the yaa itself is *not* read. It is only a seat:
     عَلَى "'alaa", هُدًى "hudan".

## The two scripts

| | Madani | Indo-Pak |
|---|---|---|
| ة | ة | ة (both U+0629) |
| ى read "ii" | فِى, zair before a bare ى | فِىْ, the same, **with a jazam on it** (the long-vowel rule of Lesson 13) |
| ى read "aa" | عَلَىٰ: **zabar, ى, then a small alif on the ى** | عَلٰى: **khari zabar on the letter before**, then a bare ى |

The "aa" is marked in both, differently. The Madani student reads the small alif on the yaa, and the Indo-Pak student
reads the khari zabar on the letter before, then a yaa with no mark, which Lesson 21 will call "not read". **Lesson 9
taught both marks**, so nothing here is a new mark, only a new place for one.

**This answers `docs/lesson-12/07` §1.** The dotted ي is the *Qaida's* letter (Lesson 1). The mushaf's word-final yaa is
ى, in both scripts. The board says so plainly, so a student who compares the Qaida with their mushaf is not confused.

## What is drilled

| Part | Forms | Question |
|---|---|---|
| 1 | ة with each mark: ـَةٌ ـَةً ـَةٍ ـَةُ ـَةَ ـَةِ | name it: "Round taa with two paish" |
| 2 | ى after zair, and ى after zabar with its "aa" mark, on six letters | **which way is it read?** "a long ee" / "a long aa, the yaa not read" |
| 3 | all | both |

Part 2 is the first use of the "which way is it read?" question (`docs/pass-2/02` §2): a picture, and the answer is
how it sounds, in plain words. The engine already supports it.

## What is new in the code

Very little on top of Lesson 16's page: ة as a new base (not a key among the 29, so a key of its own that the words
check allows from this lesson on); ى likewise. The "aa" form carries per-script `forms`, Madani ىٰ and Indo-Pak ٰى on
the letter before. That is the first form that puts a mark on the **letter before** its own. It is recorded in the full
plan as the one real design question here.

## Examples (ordinary spellings, candidates)

Walkthrough: رَحْمَةٌ (mercy), عَلَى (on), فِى (in).
Reading page: جَنَّةٌ, شَجَرَةٌ, مَدِينَةٌ, نِعْمَةٌ, سُورَةٌ, قِبْلَةٌ (ة); إِلَى, حَتَّى, بَلَى, مُوسَى, عِيسَى, هُدًى (ى).

**Left out on purpose:** صَلَاةٌ, spelled ٱلصَّلَوٰةَ in the Madina mushaf (a wow with a small alif) and الصَّلٰوةَ in the
Indo-Pak one (`docs/pass-2/01` §2). Its ordinary spelling is a trap, and it belongs to Lesson 21. Also ٱلَّذِى, which
needs the article (Lesson 18).

## What is out

Stopping on ة (Lesson 22, where "h" is taught properly, not in one line); the words where ى carries a tanween at a
stop (هُدًى at a stop is "hudaa"), also Lesson 22.

## Open questions

1. **The titles**: "The round taa and the end yaa", or *taa marbuta* and *alif maqsura*, the class's words?
   **Recommended: plain, with the class's word once on the board.** *(Taken: the seat note under the two shapes says it once.)*
2. **"A yaa that is not read"** after zabar: say it here, or leave it for Lesson 21 (letters that are not read)?
   **Recommended: say it here, in one line**, since the student meets it on the first page. *(Taken: every "aa" row says "the yaa is not read".)*
3. **Words**: candidates, for the teacher.
