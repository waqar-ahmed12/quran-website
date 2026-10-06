---
tags: [lesson-16, hamza, rule-page, built]
---
# Lesson 16 — Hamza: the full plan

*Written 2026-09-30 (the user: "please build the next lesson in line"). `docs/lesson-16/` was one plan file; it is now a
folder in the shape of `docs/lesson-15/`, because **Lesson 16 is the first lesson on a new kind of page** (the rule
lesson, `docs/pass-2/02` §1) and `QAIDA-BUILD.md` says it needs its full folder before it is built. Read
`docs/pass-2/` first. Nothing was written to `site/` until the user said yes: **"please build the lesson 16 if that is in
line. be sure to document in graph thingy obsidian"** (2026-09-30), taken as the yes to `07` §1 and to every recommendation in
this folder.*

**Part of:** [[MAP]] · [[QAIDA-BUILD]] · [[docs/pass-2/README|Pass 2]] · before it [[docs/lesson-15/README|Lesson 15, shadda]] · after it
[[docs/lesson-17/README|Lesson 17, round taa and end yaa]] · what was built: [[docs/lesson-16/08-build-record|the build record]]

## Status — built (2026-09-30)

Built in `06` §2's order, and recorded in [[docs/lesson-16/08-build-record|08 Build record]] and in `QAIDA-BUILD.md` ("Step P2 built
— Lesson 16"). Everything this folder decides was built as written **except these ten places** (the reason for each is in `08`):

1. The verdicts say `{name}`: "Yes — Hamza with paish." and "That one is Hamza with zair. This is Hamza with paish. The seat is
   not read.", not the lower-case "hamza with {mark}" of `04` §4, so a choice reads the same in the answer as on its button, and
   the jazam needs no wording of its own.
2. **Reading word 10 is مُؤْلِمٌ, not لُؤْلُؤٌ** (`05` §2): the last hamza of لؤلؤ sits on a wow with *two paish*, which is not one of
   the fifteen forms. The words check now proves every seat key is one of the fifteen.
3. **The grid's jazam cells carry the lead** (a baa with zabar): `03` §1 listed "the lead on the board" as not needed, and `03` §4's
   own picture shows it; a jazam has nothing to be read after.
4. **The options panel gained one branch** (`lesson.rule`): the rows about letters from before, another mark riding along, the halo
   and two-letter tiles are not offered, and the Question row offers Form → name, Mix, and Hear it → name. `03` §6 said getters would
   hide them; they do not.
5. **The prompt is taller on this page** (2.3 times the glyph, not 1.9): the tallest Madani stack was 1.8px from the top edge.
6. **The seat line under a wrong answer is built** as the same sound on every seat, drawn small (`.seat-echo`).
7. **The data half and the page half of the check are one file**, `tools/qaida-rules-check.js` (163 checks), and the fence for lessons
   4–15 is `tools/qaida-check.js` §9f7 (2604 lines, `5496ff23143f…`).
8. `spell.js` and `exercise.js` read `data-rule` beside `data-mark`, and the words check knows the hamza rules.
9. The home's row 16 is built and has no `cp`.
10. `audio.js` lists **one** new row, `hamza-jazam`, shown as baa with zabar then a hamza with a jazam: the recordings page has 447 rows.

## The notes in this folder

| Note | What it settles |
|---|---|
| [[docs/lesson-16/01-what-it-teaches\|01 What it teaches]] | the one idea, the 15 forms, the four parts, what is out |
| [[docs/lesson-16/02-hamza-and-the-scripts\|02 Hamza and the scripts]] | what each mushaf prints (checked), what the faces draw (measured) |
| [[docs/lesson-16/03-the-rule-page\|03 The rule page]] | `rules.js`, `rule-lesson.js`, and what a rule page copies and why |
| [[docs/lesson-16/04-page-and-wording\|04 Page and wording]] | every section of `lesson-16.html` and every line as a text field |
| [[docs/lesson-16/05-words\|05 Words]] | the walkthrough words, the twelve reading words |
| [[docs/lesson-16/06-files-and-steps\|06 Files and steps]] | every file, the build order, the checks, the user's checklist |
| [[docs/lesson-16/07-open-questions\|07 Open questions]] | what the user and the teacher decide |
| [[docs/lesson-16/08-build-record\|08 Build record]] | **what was built, measured and checked, and where it differs** |

**What was checked first (2026-09-30), and what it changed:**

1. **How the Indo-Pak mushaf writes a hamza in the middle of a word** (the open check in the one-file plan), copied
   from Quran.com's own text, code point by code point: **a bare alif that carries the vowel or the jazam** (سَاَلَ,
   يَاۡكُلُوۡنَ). `02` §2.
2. **`docs/pass-2/01` §2 was wrong on one line:** "the alif never carries a jazam". The *long-vowel* alif never does.
   An Indo-Pak alif with a jazam **is a hamza with a jazam** (يَاۡكُلُوۡنَ, U+0627 U+06E1). `02` §2 corrects it, and so
   does `pass-2/01`.
3. **The site's faces draw every hamza form** (Scheherazade New, Noto Naskh Arabic, Amiri Quran), in the browser pane.
   `02` §3.
4. **The alif seat is the same at the start of a word and in the middle** (Madani أ, إ; Indo-Pak a bare ا, both
   places), so the lesson's parts are by *seat*, not by position. `01` §2.

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | the one idea, the 15 forms, the four parts, what is out |
| `02-hamza-and-the-scripts.md` | what each mushaf prints (checked), what the site's faces draw (measured), the jazam and its lead |
| `03-the-rule-page.md` | **the new page type**: `rules.js` (data), `rule-lesson.js` (page), how the engine is used, what is copied from `mark-lesson.js` and why |
| `04-page-and-wording.md` | every section of `lesson-16.html`, and every line of wording as a text field |
| `05-words.md` | the walkthrough words, the twelve reading words, the words check |
| `06-files-and-steps.md` | every file, the build order, the checks, the user's browser checklist |
| `07-open-questions.md` | what the user and the teacher decide |

## The decisions this plan takes (the recommendations, as lessons 4–15 took theirs)

| | Decision | Where |
|---|---|---|
| 1 | The names are the short ones: "Hamza with zabar", never "Hamza on an alif, with zabar". The seat is what the student must learn to ignore | `04` §5 |
| 2 | The Indo-Pak board says it: "An alif with a vowel on it is a hamza. You have been reading it since the start" | `04` §3 |
| 3 | Madani ءَا and Indo-Pak اٰ are **not** compared across scripts. A student reads one mushaf | `01` §5 |
| 4 | **No halo on this page.** The halo rings a mark on a letter; here the lesson is which part is *not* read, and a ring on the vowel would say the wrong thing | `03` §5 |
| 5 | The jazam forms are drawn after a **lead** (baa with zabar), as Lesson 14's were after an alif, never asked and never in an id | `02` §4 |
| 6 | The rule page **copies** the drill glue from `mark-lesson.js` and does not refactor it, so lessons 4–15 stay byte-identical (the fence) | `03` §1 |
| 7 | Indo-Pak's yaa seat is drawn ئ (U+0626), not Quran.com's U+066E U+0655, until the teacher's Qaida says otherwise | `02` §5, `07` §3 |

## Build order, in one line

`rules.js` and its check → `lesson-16.html` and `rule-lesson.js` → wording and CSS → words (`spell.js`,
`exercise.js`, `exercise-16.html`) → the recordings page → every check → the browser pane, both scripts, both themes,
375px and wide → the user. Full order: `06` §2.
