---
tags: [lesson-22, stopping, stop-signs, rule-page, built]
---
# Lesson 22 — Stopping: lesson plan

*One-file plan, written 2026-09-28; **built 2026-10-06** (the user: "start the next lesson build"). The plan below is kept as it was written, with the
build's own notes in [[docs/lesson-22/01-design|01 Design]] and [[docs/lesson-22/02-build-record|02 Build record]]. Read [[docs/pass-2/README|Pass 2]]
first. The stop signs are [[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §7, checked against Quran.com, and now measured over the whole Qur'an
([[docs/lesson-22/01-design|01]] §2).*

**Part of:** [[MAP]] · [[QAIDA-BUILD]] · before it [[docs/lesson-21/README|Lesson 21, letters that are not read]] · after it [[docs/lesson-23/README|Lesson 23, Al-Fatiha]]

## Status — built (2026-10-06)

Built on the README's recommendations (a composed stopped form beside the printed word, labelled; the everyday signs, the rest on a line), with **two
things the plan did not know**: **the two mushafs put different signs in the same place** (Madani's small jeem is Indo-Pak's small taa in 1,591 words), so
the sign questions use only the **four meanings both print**, each drawn the student's own script's way; and **the Madani face draws the copied jazam as a
circle like Lesson 21's "not read"**, so the stopped form's jazam is the open head the lessons taught. **Twenty-seven items** (15 "how do you stop on this
word?", 12 "what does the lit sign say?"), parts of **15, 12 and 27**, no engine change. Where it differs and what is still the user's:
[[docs/lesson-22/02-build-record|02 Build record]] §2 and §4.

| | |
|---|---|
| **Page** | the rule lesson |
| **Depends on** | Lesson 21 built |
| **Recordings** | about a dozen words **read stopped**, and the same words read on |

## What it teaches

Every verse ends with a stop, so a student reads a stopped word at least once per verse. Two halves:

**How to stop on a word.** The last letter loses its vowel:

| Written | Said at a stop | Example |
|---|---|---|
| a zabar, zair or paish on the last letter | **a jazam** | الرَّحِيْمِ → "ar-raheem" |
| two zair or two paish | **a jazam**, the "n" gone | عَلِيْمٌ → "'aleem" |
| **two zabar** | **a long "aa"** (the silent alif of Lesson 7 is read) | عَلِيْمًا → "'aleemaa"; هُدًى → "hudaa" |
| **ة** with any mark | **"h"** | رَحْمَةٌ → "rahmah" |
| a long vowel on the last letter | stays long | فِيْهِ, قَالُوا |
| the small rectangle (Madani) / the alif of أَنَا | **read** | اَنَا → "anaa" |

**Where you may stop.** At the end of every verse (the round verse marker), and inside a verse where a small sign says
so. The signs differ between the mushafs:

| | Madani (checked: ۖ ۚ ۛ seen) | Indo-Pak (checked: ۖ ۚ ۛ ؕ ۙ seen) |
|---|---|---|
| the set | م (must stop), قلى (stopping is better), ج (either), صلى (going on is better), لا (don't stop), ∴ ∴ (stop at one of the two) | **more**: ط (stop), ج, ز, ص, ق, م, لا, قف, س, and more, and ۙ (لا) often at verse ends |

**Each mushaf prints its own list of signs at its end.** That list, not Claude's memory, is the source for the full
plan's table, and the teacher checks it.

## What is drilled

| Part | Question |
|---|---|
| 1 | **how do you stop on this word?** The word, and choices that are the same word stopped four ways, one right. It is the mark lessons' twins mechanism: the wrong stops are twins |
| 2 | **what does this sign say?** A sign, and its meaning in plain words (name it) |
| 3 | all |

## What is new in the code

**A stopped form is composed, never fetched**: the page shows the word **as printed** (copied), and beside it "how it is
said at a stop", composed from it by rule (drop the last mark, jazam in its place, and so on). **The printed text is
never altered.** The stopped form is labelled as a pronunciation, not as the mushaf. `docs/pass-2/03` does not ask
this, but it is the kind of thing the content rules exist for, so the full plan asks the user once. The stopped
form must also draw in the Qur'an font.

## Examples (from the Qur'an, by reference; candidates)

Verse ends: الرَّحِيْمِ (1:1), الْعٰلَمِيْنَ (1:2), الدِّيْنِ (1:4), اَحَدٌ (112:1), الصَّمَدُ (112:2); two zabar: تَوَّابًا (110:3),
كُفُوًا (112:4, mid-verse, as a stop-practice word); ة: لُّمَزَةٍ (104:1), الْحُطَمَةِ (104:4).

## What is out

Where to begin again after a stop in the middle of a verse (the teacher's job); every Indo-Pak sign's scholarly detail.
The page gives each sign's meaning in one plain line.

## Open questions

1. **A composed "stopped" spelling beside the printed word.** Allowed (**recommended**, labelled "how it is said"), or
   only by ear?
2. **Which signs to teach**: all of each mushaf's list, or the six that matter (stop / don't / either)? **Recommended:
   the everyday ones**, with the full list on a "more" line.
3. **The verse marker**: both mushafs number verses in a round end mark, and Quran.com's Indo-Pak text encodes it as
   private-use characters (`docs/pass-2/01` §9). The verse page (Lesson 23) draws it. Here it is a picture.
