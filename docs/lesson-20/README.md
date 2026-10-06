---
tags: [lesson-20, madd, wavy-line, rule-page, built]
---
# Lesson 20 — The wavy line: hold it longer: lesson plan

*One-file plan, written 2026-09-28; **built 2026-10-05** (the user: "please make the next lesson in line"). The plan below is kept as it was
written, with the build's own notes in [[docs/lesson-20/01-design|01 Design]] and [[docs/lesson-20/02-build-record|02 Build record]]. Read
[[docs/pass-2/README|Pass 2]] first. The script facts are [[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §6, checked against Quran.com.*

**Part of:** [[MAP]] · [[QAIDA-BUILD]] · before it [[docs/lesson-19/README|Lesson 19, the joining alif]] · after it [[docs/lesson-21/README|Lesson 21, letters that are not read]]

## Status — built (2026-10-05)

Built on the README's recommendations: **only the words on the page ("longer", "longest"), no beats**, the next-word case taught as **longer**, and
**both scripts**, with Lesson 18's honest line about the stand-in font. **Nine places differ from this plan**, each with its reason in
[[docs/lesson-20/02-build-record|02 Build record]] §2; the ones that matter most: **a "shadda or jazam" is a shadda** (the only line before a jazam is
the opening letters, Lesson 28's); **الضَّآلِّينَ is out** (it ends its verse, and its Indo-Pak text carries a private-use sign; its sister ٱلضَّآلُّونَ stands
in, and it is Lesson 23's); **the wavy line is one code point, U+0653** though Indo-Pak uses U+06E4 in more than half its wavy lines; and **the
by-ear question is built** as a kit flag (`byEar`), so a recorded word is asked by ear from its first question and nothing waits on a recording.

| | |
|---|---|
| **Page** | the rule lesson |
| **Depends on** | Lesson 19 built |
| **Recordings** | about a dozen words, **the length is the lesson**: the by-ear question is the real test |

## What it teaches

**A wavy line (ٓ) over a long vowel means: hold it longer than a long vowel.** A long vowel (lessons 8, 11, 13) is two
beats, and under the wavy line it is four to six. Three places, one picture:

| Where | Example | Held |
|---|---|---|
| a hamza comes next, **in the same word** | جَآءَ, السَّمَآءِ | four or five beats |
| a hamza comes next, **at the start of the next word** | بِمَآ اُنْزِلَ | four or five (by the Hafs reading most mushafs follow; two is also allowed) |
| a shadda or jazam comes next | الضَّآلِّيْنَ, الٓمٓ | six beats, the longest |

The student reads the line and holds. **The beats are for the teacher's recording to carry.** The page says "longer" and
"longest", and the class's name once (*madd*).

**This is where الضَّآلِّيْنَ, the last word of Al-Fatiha, becomes readable**: sun letter (18), shadda (15), the wavy
line, and two shaddas in one word.

## The two scripts

Both print U+0653. Indo-Pak also uses U+06E4, a smaller high madda, in some words (اِنَّآ, بِهٖۤ). They are two code
points for one sign the student sees as "the wavy line". The Qur'an font decides the shape, so check both code points
render as the student's mushaf prints them. On the Indo-Pak side this waits for the Indo-Pak font (`docs/pass-2/01` §9).

## What is drilled

| Part | Examples | Question |
|---|---|---|
| 1 | a wavy line before a hamza in the word | **by ear**, when recorded: "normal or longer?" Otherwise, name it: "the long vowel is held longer" |
| 2 | before a hamza in the next word | the same |
| 3 | before a shadda or jazam | "longer or longest?" |
| 4 | all, mixed with plain long vowels (no line) | "held normally / longer / longest" |

Part 4's plain long vowels are what make the picture question honest: the student has to *see* the line or its
absence.

## What is new in the code

Nothing structural. **The by-ear question is primary here**, as it will be for lessons 24–27. `docs/lesson-11/07` §3's
"ask by ear first" becomes a page setting worth building, if it was not already.

## Examples (from the Qur'an, by reference; candidates)

- In the word: جَآءَ (110:1), السَّمَآءِ (2:22), سَوَآءٌ (2:6).
- Next word: اِنَّآ اَعْطَيْنٰكَ (108:1, an Indo-Pak U+06E4 example), بِمَآ اُنْزِلَ (2:4).
- Shadda or jazam: الضَّآلِّيْنَ (1:7), دَآبَّةٍ (2:164), الٓمٓ (2:1), which is also Lesson 28's.
- Plain long vowels for part 4: قَالَ, يَقُولُ, فِيهِ.

## What is out

The exact beat counts by type, the optional lengths, and the madd at a stop (a long vowel before the last letter when
you stop, الرَّحِيْمْ, two to six beats). These are tajweed detail for the teacher. Lesson 22 says only "a long vowel
before the last letter can be held longer when you stop".

## Open questions

1. **Beats on the page**, or only "longer / longest"? **Recommended: only the words**, with the teacher's recording
   carrying the length. A number on the page invites counting, and the Qaida has kept numbers off the page.
2. **The next-word case**: teach it as "longer" (Hafs via the Shatibiyyah, as most printed mushafs read it), or say
   it may also be short? **Recommended: "longer"**. That is what the student's mushaf and teacher will do. The teacher
   decides.
3. **Examples**: candidates.
