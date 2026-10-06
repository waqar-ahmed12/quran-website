---
tags: [lesson-19, wasl, joining-alif, spec]
---
# 01 — Design: the twenty-four words and pairs, the questions, the lit places, the one engine tag

**Part of** [[docs/lesson-19/README|Lesson 19]] · next [[docs/lesson-19/02-build-record|02 Build record]] · [[MAP]]

*Written 2026-10-05, the day Lesson 19 was built: the plan was one file (the [[docs/lesson-19/README|README]]), and [[QAIDA-BUILD]] says a rule
lesson becomes a full folder before it is built. This note holds the reasons the code comments point at ("docs/lesson-19/01 §N");
[[docs/lesson-19/02-build-record|02]] says what was built and measured. It stands on [[docs/lesson-18/01-design|Lesson 18's design]] (copied words,
the lit parts) and [[docs/lesson-16/03-the-rule-page|the rule page]].*

## 1. What it teaches

Some words start with an alif that is read **only when you start on the word**. Come to one from the word before it and the alif is skipped:
the sound runs straight on from the vowel before it. A **long vowel** just before such an alif is read **short**, so the two sounds do not meet.
And when you do start on one of these words, the vowel you start with is decided by a rule: a word with Al- starts with *zabar*; a verb whose
**third letter has paish** starts with paish; any other starts with zair. The page is [[docs/lesson-16/03-the-rule-page|the rule page]]; the
**kit** ([[docs/lesson-17/01-design|Lesson 17's idea]]) is `wasl.js`.

## 2. The first pairs: copied, named by a range, joined by one space

A word is named by reference only, `"surah:verse:position"`. A **pair** is `"surah:verse:first-last"` (`"2:142:3-4"`), and the fetch tool saves it as
its two words with **one space between them**, each exactly as Quran.com sends it, in both scripts. Two changes to the tool and nothing else: the
reference pattern takes an optional `-last`, and `KIT_FILES` is `['al.js', 'wasl.js']`. **No Arabic is typed** in `wasl.js`, and the check proves
it. The file is the same `rule-words.js` (63 entries now: Lesson 18's 24 and this lesson's 39), and the shared checks read "nothing else" against
every kit file.

**Choosing the words was done from data.** The whole Qur'an (6,236 verses, both scripts) was downloaded once into a scratch file and scanned, and a
word or pair was kept only if, **in both scripts**, it held nothing the student has not met (no madd, no stop sign, no silent-letter circle, no
direction mark), and **neither word was the last of its verse** (a verse's last word carries a stop sign in Indo-Pak). Beyond that:

| Kind | What | How chosen |
|---|---|---|
| **start** (6) | a word you start on, two for each vowel | the **first word of its verse**, where Quran.com's Indo-Pak text prints the vowel on the alif, so the vowel the lesson declares is the one the text itself carries (the check proves it) |
| **read** (4) | a word on its own whose alif is read | other verse-initial words, so part 2 has both answers |
| **joined** (6) | the alif is skipped | five pairs whose first word ends on a **short** vowel (never a jazam: a jazam before a joining alif is another rule), and one printed word with a letter in front of its alif (the usual shape in the Qur'an: wa-, fa-, bi-) |
| **short** (4) | a long vowel read short | a pair whose first word ends on the end yaa, with **no jazam and no small alif** on it in either script |
| **keep** (4) | the same, before an ordinary word, read long | the contrast: the vowel keeps its mark |

**Left out on purpose:** the **basmala** (1:1:1-2). Quran.com's Indo-Pak text writes its Allah with no marks, for its own font to draw whole
([[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §9), so it would teach the wrong thing in Indo-Pak until that font is in. The plan's
**2:27:16-17** (فِى الْأَرْضِ) carries a stop sign in the printed word, so it is replaced by 2:29:6-7, the same words from another verse. Words with
a **silent letter** (Lesson 21) and a pair whose first word ends on **tanween** or a **jazam** (the noon of *min* and the next lesson's rules) are
left alone.

## 3. The parts, and the four questions

Four parts, as the plan said, but **by question**, and each part holds both answers of its question, so nothing has to ride along (Lesson 18's
riders were needed because a part of one kind was one answer; here each part has two kinds):

| Part | Forms | Question | Answers |
|---|---|---|---|
| 1 Starting a word | 6 starts | "How do you start this word?" | three: *Start with zabar / zair / paish* |
| 2 Joining | 4 read + 6 joined | "Is the alif read here?" | *The alif is read* / *The alif is not read* |
| 3 A long vowel before it | 4 short + 4 keep | "Is the long vowel read long here?" | *…is read short* / *…is read long* |
| 4 All together | all 24 | whichever it is | whichever it is |

**The answers to the starting question are the student's own words for the vowels** (`marks.nameOf`, zabar or fatha), never a spelled sound: the
plan said "a / i / u", and spelling a sound on the page is the walkthrough's one job. The same three words fill the board's lines ({fatha},
{kasra}, {damma}, which `say()` in `rule-lesson.js` now knows).

**The one change to the engine.** Part 4 mixes three questions, and `practice.js`'s `distractorsFor` offers any other item's name as a wrong answer,
so "how do you start this?" would be offered "The alif is read". The fix is one **additive** line: an item may carry `askGroup`, and a distractor is
drawn only from items with the same one. An item with no tag, which is every item of every lesson before this, is dealt exactly as before (the
filter is a no-op, and the check proves Lesson 18's items carry none). The plan expected this in `docs/pass-2/02` §2 ("a format may bring its own
`choicesFor(item)`"); a tag on the item was the smaller way to the same end. The check proves that, **without the tag**, part 4 does mix them.

## 4. The lit places

A word or pair is split into letters with their marks (`lettersOf`, as Lesson 18), and the **space is a unit of its own**. Per kind (`unitsOf`):

| Kind | Lit |
|---|---|
| start (Al-) | the alif: `read` |
| start (verb) | the alif `read`, and the **third letter**, which decides the vowel: `carry` |
| read | the alif: `read` |
| joined | the letter before the alif, which the sound runs on from: `carry`; the alif: `silent` |
| short | the long vowel: `short`; the alif: `silent` |
| keep | the long vowel: `long` |

`read`, `carry`, `short` and `long` are drawn like Lesson 18's `read` and `twice` (the accent); `silent` is the dim one, the alif that is not read.
**Never colour alone:** the marks themselves are what the student is learning to read, and the lines under the board say so. Each unit also says
which **piece** of the walkthrough it belongs to (`step`: a pair's first word or its second; a word's alif or the rest).

## 5. What the two scripts print, measured

| | Madani | Indo-Pak |
|---|---|---|
| the joining alif | **ٱ (U+0671)**, everywhere | a bare alif mid-verse; **the vowel on it at a verse's start** |
| a long vowel read short | the end yaa **with no small alif** (عَلَى), or unchanged (فِى) | **no jazam** on the yaa (فِى), against فِىْ before an ordinary word |
| a long vowel read long | a small alif on the end yaa (عَلَىٰ), or unchanged (فِى) | a jazam on the yaa (فِىْ قُلُوبِهِمْ), or a khari zabar on the letter before it |

Two findings that **corrected the plan**: (1) **Madani is not always silent.** The plan said "not marked", and for the end yaa after a zabar it
**drops its small alif** before a joining alif (عَلَى against عَلَىٰ). Only فِى looks the same either way, so for that word the Madani student
tells by what follows it, which the Madani line says. (2) **The Indo-Pak jazam is gone in all but 15 of 896** long-vowel-before-alif pairs that end on
the end yaa (for example 2:60:26-27 keeps it): the plan's claim holds nearly always, so the pairs chosen are ones where it holds, and the check proves
each. Indo-Pak start vowels are printed **only at a verse's start**, and in a few verses (1:3:1) even there the text carries none; every start word
chosen carries its vowel.

## 6. Recordings, the walkthrough, the reading page

**None new**, and none asked for by the recordings page (still 447 rows). A word's sound would be the teacher's own, one each, kept under the group
`words` by reference ([[docs/lesson-18/01-design|Lesson 18 §7]]). Until then the board says nothing when tapped, and hearing practice stays shut.

**Walkthrough** (three items, three steps each): a joined pair (*fadlul-laahi*), a pair with a long vowel shortened (*fil-bahri*) and a word to start
on (*isbir*), each in its first piece, its second and the whole; `spell.js` reads each kind's own lines (`data-first-joined`, `data-second-short`…),
and Lesson 18's lines are used for any entry with none. **Reading page** (`exercise-19.html`): twelve other pairs, no meanings, four of them with a
long vowel read short or long.

## 7. Open questions for the teacher

1. The sounds said in the walkthrough ("fadlu", "l-laahi", "fi", "l-bahri", "i", "sbir") and the three items are Claude's candidates.
2. **"The joining alif" or the class's *hamzat al-wasl*:** built plain, with the class's word once, under the three words on the board.
3. **The starting vowels:** taught as one rule and drilled by the student's own words for them (zabar, zair, paish). The Madani mushaf never prints
   them, so a Madani student learns the rule; an Indo-Pak student can read the vowel on the alif at a verse's start. Is that the right amount?
4. Indo-Pak: ships with the stand-in font and the honest line, as Lesson 18; and **the basmala is out until the Indo-Pak Qur'an font is in.**
