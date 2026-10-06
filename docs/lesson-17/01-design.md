---
tags: [lesson-17, round-taa, end-yaa, spec]
---
# 01 — Design: the fourteen forms, the two scripts, the words

**Part of** [[docs/lesson-17/README|Lesson 17]] · next [[docs/lesson-17/02-build-record|02 Build record]] · [[MAP]]

*Written 2026-09-30, the day Lesson 17 was built: the plan was one file (the [[docs/lesson-17/README|README]]), and
[[QAIDA-BUILD]] says a rule lesson becomes a full folder before it is built. This note holds the reasons the code comments point at
("docs/lesson-17/01 §N"); [[docs/lesson-17/02-build-record|02]] says what was built and measured.*

## 1. What it teaches

Two shapes that come only at the end of a word: **ة**, read "t" with the mark it carries, and **ى**, a yaa with no dots, read as a
long "ee" after a zair or as a long "aa" after a zabar (and then the yaa itself is not read). The page is Lesson 16's
([[docs/lesson-16/03-the-rule-page|the rule page]]): the same drill, rail, advice, Write it, Say it and words; only the **board** and
the **forms** are new.

## 2. The round taa

- It is read "t" with its mark: ta, ti, tu, tan, tin, tun. At a stop it is read "h" (Lesson 22): said once on the board, never asked.
- **It always follows a zabar**, so every round taa is drawn after a **baa with zabar**, the lead Lesson 16's jazam forms have: drawn,
  never asked, never in an id. The drawing joins to the lead the way it joins in a word, which a bare ة cannot show.
- **With two zabar it takes no alif after it** (جَنَّةً, the exception to the silent alif Lesson 7 left for later). Said on the
  second row's line, and in two reading words (shajaratan, qiblatan).

## 3. The forms, the parts and the questions

**Fourteen forms**, in [[docs/lesson-17/02-build-record|`ends.js`]]:

| | Forms | Met in |
|---|---|---|
| a round taa | with zabar, zair, paish; with two zabar, two zair, two paish (six) | parts 1 and 3 |
| an end yaa read "ee" | after baa, faa, laam, meem (four) | parts 2 and 3 |
| an end yaa read "aa" | after the same four (four) | parts 2 and 3 |

Parts of **6, 8 and 14**: "The round taa", "The end yaa", "Both". The whole map is on the board from part 1 (a form whose part is not
the open one is drawn dim, never hidden), as on Lesson 16.

**Why four letters, not six** (the plan said "on six letters"): each letter is two forms, so six would be twelve, and a part needs
about two thirds of its forms known (two right in a row each) before the page says "you seem ready". Four letters, eight forms, is 12
right answers instead of 18, which is the length the user's standing rule wants ("why 39 questions!!!", `QAIDA-BUILD.md` decisions).
The four are letters that join to what follows and end a short word the student will meet: baa, faa, laam and meem.

**The questions.** Every answer is a *name*, as on Lesson 16: **"Round taa with two paish"**, **"End yaa, read “ee”"**, **"End yaa,
read “aa”"**. The engine never offers one name twice, so part 1 offers four of six names, part 3 four of eight, and **part 2 offers
two: the question is "which way is it read?"**, with the two readings as the two choices. A two-choice question is a coin toss on its
own, so a wrong answer shows **the same letters read both ways** drawn small, and the board's row lights. The reverse question (a name,
pick the picture) is not built, for Lesson 16's reason: two pictures honestly have one name.

**Ids** are the Madani drawing's code points: a round taa is ة and its mark (two characters), an end yaa is the letter, its vowel and
ى (three) plus the small alif for the long "aa" (four). The lead is never in an id, and no id is built from what Indo-Pak draws, so a
switch of script keeps every credit.

## 4. The two scripts

| | Madani | Indo-Pak |
|---|---|---|
| ة | ة | ة, the same (U+0629) |
| ى read "ee" | a bare ى after the zair | **a jazam on the ى** (Lesson 13's rule) |
| ى read "aa" | zabar, ى, **a small alif on the ى** | **a khari zabar on the letter before**, and a bare ى |

The long "aa" is the first form that puts a mark on **the letter before its own**. It is built as two drawings of one form (ends.js
`glyphOf`), and, in a word, as a change to the unit before it (rules.js `wordUnits`, §5). The board's script line says which the
student's own script does, in the student's own word for the marks ("standing fatha" or "khari zabar"). **Both scripts write ى
(U+0649)** at the end of a word (Quran.com's own text, [[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §8), where Lesson 13's
Indo-Pak yaa is U+06CC; it is one constant (`YAA`, and `END_YAA` in rules.js) if the teacher's Qaida says otherwise.

The board also says what the student's own Qaida cannot: **the Qaida's yaa has two dots; at the end of a word the Qur'an writes it with
none** ([[docs/lesson-12/07-open-questions|Lesson 12's open question]], answered by [[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §8).

## 5. The words' hook

A round taa or an end yaa is not one of the 29, so a word writes it as its own key, as Lesson 16's seats are: `['ة', mark]` for a
round taa (any of its six marks), `['ى', 'ee']` or `['ى', 'aa']` for an end yaa. `rules.js` holds three functions and nothing else
knows about them: `endOf(key, id)`, `hasEnd(root)` and `wordUnits(root, letterOf, script)`. `spell.js` and `exercise.js` ask `hasEnd`
first; a word without one is drawn exactly as before, so **no earlier word can change**. `wordUnits` returns one unit per letter, so
the walkthrough can light one at a time, and in Indo-Pak it turns the zabar of the unit before an "aa" yaa into U+0670.

## 6. Words

**Walkthrough** (three; a round taa and an end yaa are each a step of their own, saying what they say): رَحْمَةٌ *rahmatun* (the haa has a
jazam, so it is its own step, as Lesson 14's), عَلَى *'alaa* (the "aa" yaa), فِى *fii* (the "ee" yaa).

**Reading page** (twelve, no meanings): six round taa (three with two paish, two with two zabar and so no alif after them, one with
two zair) and six end yaa (four "aa": إِلَى, حَتَّى, بَلَى, مُوسَى; two "ee": رَبِّى, نَفْسِى). A few meet an earlier lesson's mark in the
same word (a shadda, a long "ee", a long "oo", a hamza on a seat), the ones to look at in both scripts.

**Left out on purpose:** هُدًى (two zabar on the daal, so no small alif: a stop changes it, Lesson 22's), the plan's عِيسَى (whether the
mushaf marks its "aa" is for the teacher to say), صَلَاةٌ (the mushaf's spelling is Lesson 21's) and anything with the article
(Lesson 18). The words check (`tools/qaida-words-check.js`) proves a round taa is only ever the last letter, only after a zabar, with
one of its six marks, and that an end yaa is only the last letter, "ee" after a zair and "aa" after a zabar.

## 7. Recordings

**None new.** A round taa says what a taa with that mark says: it plays Lessons 4–7's recording on ت. An end yaa plays its letter with the
long vowel: Lesson 13's "ee" or Lesson 8's "aa", on its own letter (فِى plays "fii"). The recordings page still lists 447 rows; the check
proves every form's sound is one of them.

## 8. Open questions for the teacher

1. Should the end yaa be drawn ى (as Quran.com prints it, and as here) or ی (Lesson 13's Indo-Pak yaa) in Indo-Pak? One constant.
2. Is a round taa met only after a baa with zabar enough, or should the lead vary? The lead is drawn, never asked, so it is one field.
3. The words are candidates; the two "ee" words (رَبِّى, نَفْسِى) and the walkthrough's three are the ones to look at first.
