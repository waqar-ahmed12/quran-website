---
tags: [lesson-20, madd, wavy-line, rule-page, spec]
---
# 01 — Design: the twenty-four words and pairs, the five kinds, the one question, the lit places, the hearing

**Part of** [[docs/lesson-20/README|Lesson 20]] · next [[docs/lesson-20/02-build-record|02 Build record]] · [[MAP]]

*Written 2026-10-05, the day Lesson 20 was built: the plan was one file (the [[docs/lesson-20/README|README]]), and [[QAIDA-BUILD]] says a rule
lesson becomes a full folder before it is built. This note holds the reasons the code comments point at ("docs/lesson-20/01 §N");
[[docs/lesson-20/02-build-record|02]] says what was built and measured. It stands on [[docs/lesson-19/01-design|Lesson 19's design]] (copied words and
pairs, the lit parts) and [[docs/lesson-16/03-the-rule-page|the rule page]].*

## 1. What it teaches

**A wavy line over a long vowel says: hold it longer.** A long vowel with no line is held for its usual length. With the line it is held
**longer** before a hamza (in the same word, or at the start of the next word) and **longest** before a shadda. The page says "longer" and
"longest" and the class's own word, *madd*, once, in the line under the three words on their own. **No number is on the page**: the beats are the
teacher's recording to carry, as the README recommended (its open question 1), and the check proves that no line of the board holds a digit. The
kit is `madd.js` (the fifth, after [[docs/lesson-17/01-design|Lesson 17's]], [[docs/lesson-18/01-design|18's]] and [[docs/lesson-19/01-design|19's]]).

## 2. The words: copied, chosen from data, five kinds

The words are the Qur'an's own, named by reference and copied by `tools/fetch-qaida-words.js` into `rule-words.js`, in both scripts, unmodified
([[docs/lesson-19/01-design|Lesson 19 §2]]); `madd.js` is the fetch tool's third kit file. **No Arabic is typed in it**, and the check proves it.
**Choosing the words was done from data**: the whole Qur'an (6,236 verses, both scripts) was scanned, and a word or pair was kept only if, **in both
scripts**, it held nothing the student has not met (no stop sign, no silent-letter circle, no direction mark, no private-use sign), the wavy line was
the same code point in both, and **no word was the last of its verse**.

| Kind | What | Count | Held |
|---|---|---|---|
| `plain` | a long vowel, no line (an alif after a zabar, a wow after a paish, a yaa after a zair) | 5 | normally |
| `word` | a line, then a hamza in the same word | 5 | longer |
| `plain-next` | a pair: a long vowel ends the first word with **no** line, the next word is an ordinary word | 4 | normally |
| `next` | a pair: a line on the last letter of the first word, the next word starts with a hamza | 5 | longer |
| `heavy` | a line, then a letter with a shadda | 5 | longest |

The words: جَآءَ (110:1), ٱلسَّمَآءِ (2:22), سَوَآءٌ (2:6), شُهَدَآءَ (2:133), يَشَآءُ (6:133); the pairs مَآ أَمَرَ (2:27), مَآ أَلْفَيْنَا
(2:170), بِهَآ إِلَّا (2:99), بِهَآ إِلَى (2:188), فَمَآ أَصْبَرَهُمْ (2:175); and حَآجَّ (2:258), دَآبَّةٍ (11:56), ٱلطَّآمَّةُ (79:34), ٱلْجَآنِّ (55:15),
ٱلضَّآلُّونَ (56:51). For the contrast, five plain words (قَالَ, كَانَ, عَذَابٌ, دُونِ, فِيهِ) and four plain pairs (مَا خَلَقَ, مَا كَسَبَتْ, مَا حَرَّمَ, وَمَا رَبُّكَ), the
same shape as the pairs with a line, so what differs is the line and nothing else. Each lesson's words are its own: the check proves no
reference is named by two lessons (one plain word, ٱلنَّاسِ, was Lesson 18's and was replaced).

**What the scan found, which corrected the plan:**

- **الضَّآلِّينَ (1:7) cannot be used.** It is the last word of its verse, and 705 of the 6,236 verse-final words carry a private-use verse-end sign in
  Quran.com's Indo-Pak text (this one does: U+E022, then U+200F), which would draw as a box in the stand-in font ([[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §9).
  Its sister **ٱلضَّآلُّونَ (56:51)** stands mid-verse and has the same letters; الضَّآلِّينَ waits for Lesson 23 (Al-Fatiha, whole).
- **The plan's "a shadda or jazam" is a shadda.** No word the student can read has a line followed by a jazam: the only lines before a jazam are in the
  opening letters (الٓمٓ), which are Lesson 28's. Part 3 is a shadda, and the plan's third row says so.
- **Two code points, and the second is the commoner in Indo-Pak.** The plan said Indo-Pak "also" uses U+06E4. Counted over the whole Qur'an: Madani
  carries U+0653 in 5,291 words (and the precomposed alif-with-madda U+0622 in 3); Indo-Pak carries **U+0653 in 2,380 words and U+06E4 in 2,718**,
  more than half. Every word chosen is one that both scripts write with U+0653, so the student meets one sign and the check proves it (no U+06E4
  anywhere). What the student's own printed Indo-Pak Qaida draws is the teacher's to say ([[docs/lesson-20/02-build-record|02]] §4).
- **The plan's بِمَآ أُنزِلَ is out.** Its second word has a noon with no mark in Madani (a hidden noon, Lesson 24); every pair here has second words
  with nothing the student has not met.
- **The Madani wavy line is a mark on a bare alif after a zabar** in every word chosen (U+0627 U+0653), and the hamza after it is a letter (U+0621,
  or an alif seat: U+0623, U+0625). In Indo-Pak the pair's second word starts with a bare alif that carries the vowel (U+0627 and a short vowel).

## 3. The parts, and the one question

One question is asked all the way through: **"How long is the long vowel held here?"** Its three answers are the lengths: *Held normally*,
*Held longer*, *Held longest*. A part holds the answers it teaches, **both of them** (so nothing has to ride along, as Lesson 18's did):

| Part | Name | Forms | Answers |
|---|---|---|---|
| 1 | A hamza in the word | 5 `word` + 5 `plain` | longer, normally |
| 2 | A hamza in the next word | 5 `next` + 4 `plain-next` | longer, normally |
| 3 | A shadda after it | 5 `heavy` + the 5 `word` again | longest, longer |
| 4 | All together | all 24 | all three |

Parts of **10, 9, 10 and 24**. Every form is met in the part named for it and again in the last; the `word` forms are met in parts 1, 3 and 4 (part 3
asks "longer or longest?", as the README said, and the `word` forms are its "longer"). Part 4 is the honest picture question, as the README said:
the student has to *see* the line or its absence. **No engine change at all**: one question means no `askGroup` (Lesson 19's one engine tag is not
used), and the check proves that no item carries one. The answers are *names* of lengths, never pictures: `practice.js` never offers one name twice,
and two kinds share each of two names (`plain` and `plain-next`; `word` and `next`), which is what lets a part have exactly two choices.

## 4. The lit places

A word or pair is split into letters with their marks (`lettersOf`, as Lessons 18 and 19), and the **space is a unit of its own**. Per kind
(`unitsOf`):

| Kind | Lit |
|---|---|
| `plain` | the long vowel alone: `long` |
| `plain-next` | the long vowel ending the first word: `long` |
| `word` | the long vowel with its line: `long`; the hamza after it: `carry` |
| `next` | the long vowel with its line, the last letter of the first word: `long`; the first letter of the second word, the hamza: `carry` |
| `heavy` | the long vowel with its line: `long`; the letter after it, which has the shadda: `carry` |

`long` and `carry` are drawn the same (the accent, as Lesson 19's): the tint says *look here*, and the **marks themselves** are what the student is
learning to read, with the lines under the board saying so. The long vowel with no line is found by rule (`longVowelAt`: an alif after a zabar, a wow
after a paish, a yaa after a zair, the wow and the yaa bare in Madani and carrying a jazam in Indo-Pak), so no position is typed. Each unit also says
which **piece** of the walkthrough it belongs to (`step`): a pair's first word or its second; a word's long vowel (and what comes before it) or the
rest.

## 5. What the two scripts print

| | Madani | Indo-Pak |
|---|---|---|
| the wavy line | U+0653 on a bare alif after a zabar | U+0653 here (and U+06E4 in more than half of its wavy lines elsewhere, none in this lesson) |
| a long "oo" or "ee" with no line | wow or yaa **bare** | wow or yaa **with a jazam** |
| a hamza at the start of the next word | an alif seat, أ or إ | a bare alif carrying the vowel |
| the shadda after the line | U+0651 on the next letter | the same |

Two board lines say it, one a script (the Madani student sees one, the Indo-Pak student the other, with Lesson 18's honest line about the stand-in
font). Both say the same useful thing: **look for the line first**; with no line, a long vowel is held for its usual length, whatever comes next.

## 6. The walkthrough and the reading page

**Walkthrough** (three items, three steps each, `WALK`): a word with a hamza (جَآءَكُمْ, 2:87), a pair (كَمَآ أَرْسَلْنَا, 2:151) and a word with a shadda
(حَآجَّكَ, 3:61), each in its first piece, its second and the whole; `spell.js` reads each kind's own lines (`data-first-word`, `data-second-next`…).
The sounds ("jaaaa", "akum", "kamaaaa", "haaaaaa", "jjaka") spell the length with more letters, longer for longer and longest for longest: the one place
a sound is spelled out, a candidate for the teacher to check. **Reading page** (`exercise-20.html`): twelve other words and pairs (three with a
hamza, two pairs, three with a shadda, two plain words and two plain pairs), no meanings.

## 7. Recordings, and "by ear first"

**No new recording**, and none is asked for by the recordings page (still 447 rows). A word's sound would be the teacher's own, one each, kept under
the group `words` by reference ([[docs/lesson-18/01-design|Lesson 18 §7]]). **This is the lesson where the question is really heard**: how long a
vowel is held cannot be seen. So the kit says `byEar: true` and the page, which until now offered hearing practice only from the options panel,
**starts in the mixed way** (`rule-lesson.js`, `formatsFor`): a word that has a recording is asked by ear from its very first question ("How long is
the long vowel held in this one?", a play button and the same three answers), and one that has none is asked by its picture, so **nothing waits on a
recording**. The check proves both halves with a stand-in for the recordings: with none, no question is a hearing one; with every word recorded, both
kinds come up, and the right length is right. The plan's "ask by ear first" as a page setting is therefore built, for a lesson that says so; every
other lesson is unchanged (`byEar` is read nowhere else).

## 8. Open questions for the teacher

1. **The sounds** said in the walkthrough and the three items are Claude's candidates, as are the 24 words of the drill and the 12 of the reading page.
2. **Which wavy line does the Indo-Pak student's printed Qaida draw?** U+0653 is the one used here in both scripts; Quran.com's Indo-Pak text uses U+06E4
   more often. If the teacher's Indo-Pak Qaida prints the other, a word list with it is one more set of references.
3. **The next-word case taught as "longer"** (the README's open question 2, recommended): built so. The teacher decides.
4. **No beats on the page** (the README's open question 1, recommended): built so. A recording carries the length.
5. Indo-Pak: ships with the stand-in font and the honest line, as Lessons 18 and 19.
