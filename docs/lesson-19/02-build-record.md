---
tags: [lesson-19, wasl, joining-alif, build-record, built]
---
# 02 — Build record: what was built, measured and checked

**Part of** [[docs/lesson-19/README|Lesson 19]] · previous [[docs/lesson-19/01-design|01 Design]] · [[MAP]]

*2026-10-05. The user: "okay, there should be a new lesson plan, please start building", taken as the yes to the README's three recommendations
(the plain name with the class's word once; the starting vowel as one rule; examples chosen from data), as lessons 4–18 took theirs. This note is the
one place that says what was **built**; [[docs/lesson-19/01-design|01]] says what was **decided**.*

## Where it sits

- **Above it:** [[docs/lesson-19/README|Lesson 19]] · [[docs/pass-2/README|Pass 2]] (lessons 15–29) · [[QAIDA-BUILD]] (this is **step P2**, fourth of its lessons) · [[MAP]]
- **Before it:** [[docs/lesson-18/README|Lesson 18, Al-]] (the third kit, the first copied words) · **after it:** [[docs/lesson-20/README|Lesson 20, the wavy line]]
- **What it stands on:** [[docs/lesson-18/02-build-record|Lesson 18's build record]] (copied words, the lit parts) · [[docs/lesson-16/08-build-record|Lesson 16's]] (the rule page) · [[docs/lesson-17/02-build-record|Lesson 17's]] (the `KITS` registry and the end yaa) · [[docs/lesson-14/README|Lesson 14]] (the jazam) · [[docs/your-voice/README|Say it and listen back]]

## 1. What was built

| File | New? | What it is |
|---|---|---|
| `site/qaida/wasl.js` | new | the fourth rule kit: 24 forms by reference (6 to start on, 4 read on their own, 6 joined, 4 shortened, 4 kept long), the lit places, four questions, names, board, echo, walkthrough and reading list |
| `site/qaida/lesson-19.html`, `exercise-19.html` | new | the page and the reading page; no Arabic typed in either |
| `site/qaida/rule-words.js` | regenerated | 63 copied words and pairs (Lesson 18's 24 unchanged, plus 39), by `tools/fetch-qaida-words.js` |
| `tools/fetch-qaida-words.js` | edit | reads `wasl.js` too; a reference may be a range (`2:142:3-4`), saved as the two words with one space |
| `site/qaida/practice.js` | edit | **one additive line**: an item's `askGroup` limits its wrong answers to its own question's |
| `site/qaida/rule-lesson.js` | edit | a per-question ask line (`kit.askOf`), `{fatha}` `{kasra}` `{damma}` tokens, a wide tile for a pair, a sample's own caption |
| `site/qaida/spell.js`, `exercise.js` | edit | a pair's three steps (first word, second, whole) with a kind's own lines; the reading list for `wasl` |
| `site/qaida/shell.js` | edit | row 19 built, `progress: 'drill'`, no `cp` |
| `site/qaida/qaida.css` | edit | the `carry` / `short` / `long` places, the wide pair tile, three words across on a phone, a bigger question |
| `tools/qaida-lesson19-check.js` | new | data half and page half in one file, 200 checks |
| `tools/qaida-check.js`, `qaida-lesson18-check.js` | edit | "lessons 1–19 are built"; Lesson 18's Next is a link now, and its copy checks read only its own words |
| `docs/lesson-19/`, `MAP.md`, `QAIDA-BUILD.md` | edit | this folder, the graph, the step log |

**Not edited:** `marks.js`, `mark-lesson.js`, `rules.js`, `ends.js`, `al.js`, `audio.js`, `voice.js`, `qaida-options.js`, `recordings.html` and every
`lesson-4…18.html`. The fence for lessons 4–15 passes; Lessons 16, 17 and 18 pass unchanged but for Lesson 18's Next.

## 2. Where the build differs from the plan, and why

1. **The starting question's answers are the student's own words for the vowel** ("Start with zabar"), not "a / i / u" ([[docs/lesson-19/01-design|01]] §3).
2. **No riders.** Each part holds both answers of its question (part 2 has the four words read on their own beside the six joined; part 3 has the four
   kept long beside the four shortened), so Lesson 18's workaround was not needed.
3. **One additive engine tag, `askGroup`**, because part 4 mixes three questions ([[docs/lesson-19/01-design|01]] §3). The plan expected an engine change
   here; this is the smallest, and Lesson 18's items carry none.
4. **The basmala is out**, and the plan's 2:27:16-17 is replaced by 2:29:6-7 (a stop sign is inside the printed word) ([[docs/lesson-19/01-design|01]] §2).
5. **Madani is not silent about the shortened vowel** (the end yaa drops its small alif), and **the Indo-Pak jazam is gone in all but 15 of 896**
   pairs, not all ([[docs/lesson-19/01-design|01]] §5). Each pair chosen is proved to show it.
6. **Twenty-four items, not "about a dozen pairs":** 14 of them are pairs; the rest are the words you start on and the four read on their own.
7. **No new recording**, though the plan said a dozen pairs. The words are the teacher's to record, under their references; the recordings page still
   lists 447 rows.
8. **Ships in both scripts**, with Lesson 18's one honest line for the Indo-Pak student about the stand-in font.

## 3. The checks, and what was measured

```
node tools/qaida-lesson19-check.js   the copy, the words, the engine, the page (200 checks)
node tools/qaida-lesson18-check.js   Lesson 18, Next now goes to Lesson 19
node tools/qaida-lesson17-check.js   Lesson 17, unchanged
node tools/qaida-rules-check.js      Lesson 16, unchanged
node tools/qaida-check.js            the engine and the data of every lesson, and the fence (lessons 4-15)
```

All 21 check scripts in `tools/` pass. The lesson check proves, among others: every reference `wasl.js` names (39) is in `rule-words.js` in both
scripts and the file holds nothing else; every word and pair holds only letters, tatweel, one space and the marks the student has met; **the marks
say what the lesson says, for every form, in both scripts** (the alif; the letter before it carries a short vowel; the Indo-Pak start vowel is the
declared one; a verb's third letter decides it; a shortened vowel has no jazam and no small alif; a kept one has one of them); the units of every
word and pair, joined, are the copied text exactly; two start words for each vowel; parts of **6, 10, 8 and 24**; the same ids in both scripts and
credit kept across a switch; **480 questions through the real engine, never an answer offered to another question** (and that, without the tag, part
4 does mix them); the board, the three captions, every line in both scripts and both name sets; the walkthrough's three kinds of step; and that every
line of wording has a text field.

**Self-evaluated in the browser pane by screenshot** (900px desktop and 375px; both scripts; the board, a question in parts 1, 3 and 4, a wrong
answer, "Write it", the walkthrough, the reading page). What the screenshots found, and what was done:
- **The three words on their own wrapped two and one on a phone**, because their captions were wider than their tiles; the caption is now as wide as
  its tile, and all three stay across at 375px.
- **A pair's tile was one to a row on a phone** (172px against 343px of room); it is 164px now, two across.
- **The one printed word with a letter before its alif (91:1:1) had a narrow tile and its letters touched the edge**; it has the wide one.
- **The question's pair filled half the line**; it is a third larger now.
- The semicolon in one field's label (found by the check, not the eye) had split its `data-words-attr` entry.

Measured at **375px**, both scripts: no horizontal overflow; the tightest side clearance of a word in its tile **24.3px**; the question's pair never
nearer than **53px** to the prompt's sides (Madani, 2:105:6-7); and on the reading page **25px**. **Not measured, and left for the user:** the page on
a real phone, and how the Indo-Pak pairs feel in the stand-in face.

## 4. Still the user's

- **The look:** the lit places on the pairs, in both scripts, and the **Indo-Pak pairs in the stand-in face**, against a printed Indo-Pak Qur'an.
- **The words** (all Claude's candidates, from Quran.com): the 24 of the drill, the twelve of the reading page, and the three of the walkthrough with
  their sounds ("fadlu", "l-laahi", "fi", "l-bahri", "i", "sbir").
- **The rule for the starting vowel** and whether the Madani student should be taught it at all, since the Madani mushaf never prints it
  ([[docs/lesson-19/01-design|01]] §7, question 3).
- **The wording**, every line a text field: the seven names, the three questions, the seven echo lines, the four same-lines, the three captions, the two
  script lines, the walkthrough's six lines.
- **Recordings:** one per word or pair, under its reference, when the teacher is ready; hearing practice opens by itself for the ones that have one.

## 5. What Lesson 20 inherits

`rule-words.js` and its fetch tool now take **ranges**, so a later lesson can name a pair or a short run of words by reference. The **pair machinery**
(`unitsOf` with a space unit and a `step`, the wide tile, a kind's own lines in `spell.js`) is ready for any lesson whose item is more than a word.
`askGroup` is there for any lesson that mixes questions in its last part. The drill glue `rule-lesson.js` still copies from `mark-lesson.js` and has
**not** been extracted: Lesson 19 needed only an ask line per question and a wide tile, so the extraction waits for a lesson that really needs to
share it. **Next in line:** [[docs/lesson-20/README|Lesson 20, the wavy line (madd)]].
