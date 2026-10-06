---
tags: [lesson-20, madd, wavy-line, build-record, built]
---
# 02 — Build record: what was built, measured and checked

**Part of** [[docs/lesson-20/README|Lesson 20]] · previous [[docs/lesson-20/01-design|01 Design]] · [[MAP]]

*2026-10-05. The user: "please make the next lesson in line", taken as the yes to the README's recommendations (no beats on the page; the next-word case
taught as "longer"; the words chosen from data), as lessons 4–19 took theirs. This note is the one place that says what was **built**;
[[docs/lesson-20/01-design|01]] says what was **decided**.*

## Where it sits

- **Above it:** [[docs/lesson-20/README|Lesson 20]] · [[docs/pass-2/README|Pass 2]] (lessons 15–29) · [[QAIDA-BUILD]] (this is **step P2**, fifth of its lessons) · [[MAP]]
- **Before it:** [[docs/lesson-19/README|Lesson 19, the joining alif]] (the fourth kit, the first pairs of words) · **after it:** [[docs/lesson-21/README|Lesson 21, letters that are not read]]
- **What it stands on:** [[docs/lesson-19/02-build-record|Lesson 19's build record]] (copied words and pairs, the lit parts, the wide tile) · [[docs/lesson-18/02-build-record|Lesson 18's]] (the first copied words) · [[docs/lesson-16/08-build-record|Lesson 16's]] (the rule page) · [[docs/lesson-17/02-build-record|Lesson 17's]] (the `KITS` registry) · [[docs/lesson-15/README|Lesson 15]] (the shadda) · [[docs/lesson-16/README|Lesson 16]] (the hamza) · [[docs/your-voice/README|Say it and listen back]]

## 1. What was built

| File | New? | What it is |
|---|---|---|
| `site/qaida/madd.js` | new | the fifth rule kit: 24 forms by reference (5 plain, 5 with a line before a hamza in the word, 4 plain pairs, 5 with a line before the next word's hamza, 5 with a line before a shadda), the lit places, one question, three names, board, echo, walkthrough and reading list; `byEar: true` |
| `site/qaida/lesson-20.html`, `exercise-20.html` | new | the page and the reading page; no Arabic typed in either |
| `site/qaida/rule-words.js` | regenerated | 102 copied words and pairs (Lessons 18 and 19's 63 unchanged, plus 39), by `tools/fetch-qaida-words.js` |
| `tools/fetch-qaida-words.js` | edit | reads `madd.js` too (one word in the list of kit files) |
| `site/qaida/rule-lesson.js` | edit | **two small additive edits**: the names' hidden span is also found by `data-name-plain`; and a kit may say `byEar`, which starts the page in the mixed way with a recorded word asked by ear from its first question (`formatsFor`) |
| `site/qaida/spell.js`, `exercise.js` | edit | one line each: `WORDS.madd` is the kit's `WALK` and `READING` |
| `site/qaida/shell.js` | edit | row 20 built, `progress: 'drill'`, no `cp` |
| `site/qaida/qaida.css` | edit | the seven rules written for Lesson 19's page now name `madd` as well (the prompt, the three words on their own, the pair in its caption); and one new rule that stops the three tiles of the strip being different heights |
| `tools/qaida-lesson20-check.js` | new | data half and page half in one file, 201 checks |
| `tools/qaida-check.js`, `qaida-lesson18-check.js`, `qaida-lesson19-check.js` | edit | "lessons 1–20 are built"; Lesson 19's Next is a link now (as Lesson 18's became when 19 was built); the "nothing else" checks read the third kit file |
| `docs/lesson-20/`, `MAP.md`, `QAIDA-BUILD.md` | edit | this folder, the graph, the step log |

**Not edited:** `marks.js`, `mark-lesson.js`, `practice.js` (no engine change: Lesson 19's `askGroup` is not even used here), `rules.js`, `ends.js`,
`al.js`, `wasl.js`, `audio.js`, `voice.js`, `qaida-options.js`, `recordings.html` and every `lesson-4…19.html`. The fence for lessons 4–15 passes;
Lessons 16 to 19 pass unchanged but for the "built" rows and Lesson 19's Next.

## 2. Where the build differs from the plan, and why

1. **Five kinds, not four rows.** The plan's four parts needed a plain word beside every line, so each part holds both its answers. The plain
   long vowels are in parts 1 and 2 (and 4), not only in part 4, and part 2 has **plain pairs** so the next-word case has its contrast in the same
   shape ([[docs/lesson-20/01-design|01]] §2, §3).
2. **"A shadda or jazam" is a shadda** ([[docs/lesson-20/01-design|01]] §2): no word the student can read has a line before a jazam; the opening letters are Lesson 28's.
3. **الضَّآلِّينَ (1:7) is out**, because it ends its verse and the Indo-Pak text carries a private-use verse-end sign on it; ٱلضَّآلُّونَ (56:51) stands in. It is Lesson 23's.
4. **بِمَآ أُنزِلَ is out** (its second word has an unmarked noon, Lesson 24's).
5. **The wavy line is one code point, U+0653, in every word**, though Indo-Pak uses U+06E4 in **more than half** of its wavy lines (2,718 words against
   2,380): the plan's "also" understated it ([[docs/lesson-20/01-design|01]] §2). It is the first of the user's open questions below.
6. **The by-ear question is built as a kit flag** (`byEar`), not as a setting on every page: the lesson that needs it says so, and nothing else changes
   ([[docs/lesson-20/01-design|01]] §7). With **no recording**, no hearing question is asked at all; the check proves both halves.
7. **Twenty-four items, not "about a dozen words":** the plan's dozen were the recordings; the drill needs both answers in every part.
8. **No new recording**, and the recordings page still lists 447 rows.
9. **Ships in both scripts**, with Lesson 18's one honest line for the Indo-Pak student about the stand-in font.

## 3. The checks, and what was measured

```
node tools/qaida-lesson20-check.js   the copy, the words, the engine, the hearing, the page (201 checks)
node tools/qaida-lesson19-check.js   Lesson 19, Next now goes to Lesson 20
node tools/qaida-lesson18-check.js   Lesson 18, unchanged but for the "built" row
node tools/qaida-rules-check.js      Lesson 16, unchanged
node tools/qaida-check.js            the engine and the data of every lesson, and the fence (lessons 4-15)
```

All 22 check scripts in `tools/` pass. The lesson check proves, among others: every reference `madd.js` names (39) is in `rule-words.js` in both
scripts and the file holds nothing else, and **no reference is named by two lessons**; every word and pair holds only letters, tatweel, one space and the
marks the student has met, plus the wavy line **only in the three kinds that have one** and always as U+0653; **the marks say what the lesson says, for every
form, in both scripts** (a long vowel with no line; a line on a bare alif after a zabar; a hamza or a shadda right after it; the next word's hamza, an
alif seat in Madani and a bare alif with a vowel in Indo-Pak); the units of every word and pair, joined, are the copied text exactly; each kind lights
exactly its places; parts of **10, 9, 10 and 24**; the same ids in both scripts and credit kept across a switch; **480 questions through the real
engine**, each offering exactly its part's answers (two in parts 1 to 3, three in part 4); the hearing question, with a stand-in for the recordings;
the board, its lines (none holds a number), the wrong-answer line for each of the five kinds, the walkthrough's three steps for each of its three
items, and that every line of wording has a text field.

**Self-evaluated in the browser pane by screenshot** (900px desktop and 375px; both scripts; the board, a question in parts 1, 2 and 4, a wrong
answer, "Write it", the walkthrough, the reading page). What the screenshots found, and what was done:
- **The three tiles on their own were different heights on a phone** (81px, 81px and 73.5px), because a grid cell stretches its tile to the row the
  tallest caption makes. One rule for this page keeps each tile its own height (`align-content: start`, `qaida.css`); all three are 73.5px now.
  **Lesson 19's strip has the same quirk** and was left as it was: it is an approved page, and the rule is one line to add if the user wants it.
- A `madd` in the page's markup counted twice in the "no tajweed word" check (the script's name and the rule's); the check strips both, and the one
  place the class's word is said is the line under the three words.

Measured at **375px**, both scripts: no horizontal overflow; the tightest side clearance of a word in its tile **18.8px** (Madani, ٱلضَّآلُّونَ) and
**19.2px** (Indo-Pak); the question's word never nearer than **56.7px** to the prompt's sides across 48 questions in every part; the reading page has no
overflow. **Not measured, and left for the user:** the page on a real phone, how the wavy line sits in the Indo-Pak stand-in face at tile size, and
the hearing question with a real recording (only the stand-in was exercised).

## 4. Still the user's

- **The look:** the lit places on the words and pairs in both scripts, and the **Indo-Pak words in the stand-in face**, against a printed Indo-Pak Qur'an.
- **Which wavy line your Indo-Pak Qaida draws** ([[docs/lesson-20/01-design|01]] §8, question 2): the words here use the sign both scripts share (U+0653).
- **The words** (all Claude's candidates, from Quran.com): the 24 of the drill, the 12 of the reading page, and the three of the walkthrough with their sounds
  ("jaaaa", "akum", "kamaaaa", "arsalna", "haaaaaa", "jjaka"), where the number of letters is a guess at the length.
- **The wording**, every line a text field: the five names, the question, the five echo lines, the five same-lines, the three captions, the two script
  lines, the walkthrough's six lines.
- **Recordings:** one per word or pair, under its reference, when the teacher is ready. The **length is the lesson**: hearing practice opens by itself for the
  words that have one, and is then the first way a recorded word is asked.

## 5. What Lesson 21 inherits

The `madd` kit is a template for any rule whose words come in **five kinds on four parts**: `forms` with `kind`, `row` and `parts`, a `unitsOf` that finds
the lit places by rule and not by position, and a `WALK` with a line of its own for each kind. `byEar` is there for lessons 24–27, whose point is also
heard. The drill glue `rule-lesson.js` still copies from `mark-lesson.js` and has **not** been extracted: Lesson 20 needed one extra selector and one flag.
Lesson 21 teaches the letters that are written and not read, which **both scripts mark differently** ([[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §2): a
small circle in Madani and *no mark at all* in Indo-Pak. **Next in line:** [[docs/lesson-21/README|Lesson 21, letters that are not read]].
