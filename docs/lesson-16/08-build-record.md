---
tags: [lesson-16, hamza, build-record, built]
---
# 08 — Build record: what was built, measured and checked

**Part of** [[docs/lesson-16/README|Lesson 16]] · previous [[docs/lesson-16/07-open-questions|07]] · [[MAP]]

*2026-09-30. The user: "please build the lesson 16 if that is in line. be sure to document in graph thingy obsidian." Taken as
the yes to [[docs/lesson-16/07-open-questions|07]] §1 and to every recommendation in this folder, as lessons 4–15 took theirs.
This note is the one place that says what was **built**; the other notes say what was **decided**.*

## Where it sits

- **Above it:** [[docs/lesson-16/README|Lesson 16]] · [[docs/pass-2/README|Pass 2]] (the second pass, lessons 15–29) · [[QAIDA-BUILD]] (steps and skills; this is **step P2**, first of its lessons) · [[MAP]]
- **Before it:** [[docs/lesson-15/README|Lesson 15, shadda]] (the last mark lesson) · **after it:** [[docs/lesson-17/README|Lesson 17, round taa and end yaa]] (the next rule page)
- **What it stands on:** [[docs/lesson-4/README|Lesson 4]] (the practice engine's first mark lesson, whose drill half this page copies) · [[docs/lesson-14/README|Lesson 14]] (a lead drawn and never asked, which the jazam forms reuse) · [[docs/your-voice/README|Say it and listen back]] (every lesson has it)
- **What it teaches:** [[docs/lesson-16/01-what-it-teaches|01]] · what the scripts print: [[docs/lesson-16/02-hamza-and-the-scripts|02]] · how the page is built: [[docs/lesson-16/03-the-rule-page|03]] · wording: [[docs/lesson-16/04-page-and-wording|04]] · words: [[docs/lesson-16/05-words|05]] · files and checks: [[docs/lesson-16/06-files-and-steps|06]]

## What was built

| File | New? | What it is |
|---|---|---|
| `site/qaida/rules.js` | new | the rule data layer: four seats, fifteen forms, ids, drawing per script, names, the grid, the seat hook (`03` §2) |
| `site/qaida/rule-lesson.js` | new | the page: the drill half of `mark-lesson.js` **copied**, the grid board, the seat strip, the line under a wrong answer, `window.qaida` |
| `site/qaida/lesson-16.html` | new | the page (`04`); no Arabic typed in it: every form is composed by `rules.js` |
| `site/qaida/exercise-16.html` | new | the reading page, twelve words (`05` §2) |
| `site/qaida/spell.js`, `exercise.js` | edit | read `data-rule`; a seat key is drawn by `rules.seatOf`; `WORDS.hamza` |
| `site/qaida/shell.js` | edit | row 16 built, `progress: 'drill'`, no `cp` |
| `site/qaida/audio.js`, `audio/manifest.json`, `recordings.html` | edit | one new recording, `hamza-jazam`, one row on the recordings page |
| `site/qaida/qaida.css` | edit | the grid, the seat strip, dim cells, the seat line, a taller prompt on this page |
| `site/qaida/qaida-options.js` | edit | one `lesson.rule` branch: the rows that do nothing on a rule page are not offered |
| `tools/qaida-rules-check.js` | new | data half and page half in one file |
| `tools/qaida-check.js`, `qaida-words-check.js`, `qaida-lesson15-check.js` | edit | the fence for 4–15, the hamza rules, Lesson 15's Next is a link now |
| `docs/lesson-16/`, `MAP.md`, `QAIDA-BUILD.md` | edit | this folder, the graph, the step log |

**Not edited** (the rule of `03`): `marks.js`, `mark-lesson.js`, `practice.js`, and every `lesson-4…15.html`. The fence proves the
lessons they draw did not move: **2604 lines** (every item, twin, board row and sample of lessons 4–15, both scripts, sha256
`5496ff23143f…`) and `masteredCount` for lessons 4, 5, 6, 8 and 10–15.

## The decisions taken (the README's seven)

The names are the short ones ("Hamza with zabar"; the seat is what the student must learn to ignore) · the Indo-Pak line says an alif
with a vowel is a hamza · no comparing Madani ءَا with Indo-Pak اٰ · **no halo** · the jazam forms after a lead, baa with zabar, never
asked and never in an id · the rule page **copies** the drill glue and does not refactor · Indo-Pak's yaa seat is ئ (U+0626), not the
dotless seat with a hamza below.

## Where the build differs from the plan, and why

1. **Verdict wording.** `{name}` fills both ("Yes — Hamza with paish." · "That one is Hamza with zair. This is Hamza with paish. The seat
   is not read."). The plan's lower-case "hamza with {mark}" put "Hamza with zair" and "hamza with paish" in one sentence, and needed
   a separate jazam wording for the article. Both are text fields, so the teacher can put it back.
2. **Reading word 10.** لُؤْلُؤٌ ends in a hamza on a wow with two paish. That is not one of the fifteen forms, so the check would have
   let a form through that the lesson never teaches. **مُؤْلِمٌ** ("painful") is in its place: a wow seat with a jazam, then a laam.
   Every seat key in every word is now proved to be one of the fifteen (`qaida-words-check.js`). *A candidate: the teacher checks it.*
3. **The grid's jazam cells carry the lead** (a baa with zabar). `03` §1 said the lead was "not needed on the board"; `03` §4's picture
   and the tile-width sentence both show it, and a bare jazam cell has nothing to be read after.
4. **The options panel.** `03` §6 said the rows that make no sense here "are hidden by getters". They are not: the panel always drew
   them. One `if (!lesson.rule)` around them, and a three-way Question row (Form → name, Mix, Hear it → name), is the whole edit.
5. **The prompt is 2.3 times the glyph tall, not 1.9.** `shell.centerInk` centres the line box, not the ink, and at 375px the paish on
   an alif seat came within **1.8px** of the top of the clipping prompt. Now 12.7px.
6. **The seat line under a wrong answer** (`03` §1's "the seat line") is built: the same sound on every seat that has it, small.
7. **One check file** for the data and the page halves, 163 checks.
8. **`spell.js` and `exercise.js`** read `data-rule`, and name the hamza "Hamza" on its own line (`data-hamza-line`).
9. **The home:** row 16 is built, with no `cp`, so `masteredCount` counts every id in the record: all fifteen forms, nothing else.
10. **Recordings:** `audio.js` lists **one** row for the new sound, not one per seat: 447 rows in all (Lesson 15's 446 and this).

## What was measured (the browser pane, 2026-09-30)

Ink against the tile or the prompt, for every form, in **both scripts**: canvas `measureText` bounds against each box.

| | Tightest gap | Where |
|---|---|---|
| the board, 375px: 19 tiles (4 seats and 15 cells) | **7.1px** top, 8.0px sides, 18.5px bottom (Madani) · 11.5px sides, 13.7px top (Indo-Pak) | a hamza on an alif with zabar, at the top |
| the drill's prompt, 375px, before the fix | **1.8px** top (Madani) | a hamza on an alif with paish |
| the drill's prompt, 375px, after | **12.7px** top, 18.6px bottom (Madani) · 32.8px (Indo-Pak) | the same |
| the board, 1280px, default size: 19 tiles | 14.5px top, 13.9px sides, 30.1px bottom (Madani) · 19.2px sides, 24.2px top (Indo-Pak) | the same |
| the board, 1280px, **Large**: cells 102 × 151px | 15.4px top, 14.8px sides, 33.2px bottom (Madani) · 20.8px sides (Indo-Pak) | the same |

Nothing clipped; no horizontal overflow at 375px (`scrollWidth` 375) or at 1280px; every grid row the same height; the jazam cell with
its lead fits at 58px. **At 375px "Large" is the same as the default**: the phone's own rule (`.marks-board`, under 600px) fixes the
tile size for both, as it does on every lesson. The **light theme** was looked at (part 3, desktop): the rail, the grid and the
prompt read well, and the later parts' cells are dimmed, not hidden. **Not measured, and left for the user:** how the hamza and its
vowel *feel* at the tile's size, and the page on a real phone. A screenshot shows that the forms draw, not how they read.

## The checks

```
node tools/qaida-rules-check.js      the data layer, the engine, the recordings, and the page (163 checks)
node tools/qaida-check.js            the engine and the data of every lesson, and the fence (lessons 4-15)
node tools/qaida-words-check.js      every word of every lesson, with the hamza rules
```

All 18 scripts in `tools/` pass. The rules check proves, among others: fifteen forms and ids, all two characters and the same in both
scripts; parts of 3, 4, 6 and 15; 400 questions through the real engine on every part with **never the same name twice** (so the
choices are the marks, one each) and no reverse question; mastery surviving a script switch, both ways; the grid, its five dashes and
its dim cells in each part; the two scripts' lines each shown to its own script only; every `window.qaida` member the options panel
reads; no literal combining mark in any file of the lesson; the walkthrough (five steps, seven steps, the hamza its own line).

## Still the user's

The list in [[docs/lesson-16/06-files-and-steps|06]] §4, with two additions: **مُؤْلِمٌ** in place of لُؤْلُؤٌ, and the verdict wording. And the
three questions only a teacher can settle, each with a one-line change waiting: the Indo-Pak yaa seat, the jazam's lead, and whether
to keep the two-zabar hamza on the line ([[docs/lesson-16/07-open-questions|07]] §3–5).

## What Lessons 17–22 inherit

`rules.js` holds one rule and takes another by adding an entry; `rule-lesson.js` reads `data-rule`. **What Lesson 17 needs** (two end
forms, not a grid) and **what Lesson 18 needs** (Qur'an words, not forms) was deliberately not built here. **The shared half of
`mark-lesson.js` and `rule-lesson.js` is extracted once Lesson 18 shows what is really shared**, behind the same fence
([[docs/lesson-16/03-the-rule-page|03]] §1, [[docs/pass-2/02-page-types-and-questions|pass 2, page types]]).
