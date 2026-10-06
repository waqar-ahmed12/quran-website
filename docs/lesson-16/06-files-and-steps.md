---
tags: [lesson-16, hamza, spec]
---
# 06 — Files, build order, and the checklist

**Part of** [[docs/lesson-16/README|Lesson 16]] · previous [[docs/lesson-16/05-words|05]] · next [[docs/lesson-16/07-open-questions|07]] · [[MAP]]

## 1. Every file this lesson touches

| File | New? | What changes |
|---|---|---|
| `site/qaida/rules.js` | **new** | the data layer (`03` §2): seats, the fifteen forms, ids, drawing, items, the grid, sizes, stats |
| `site/qaida/rule-lesson.js` | **new** | the page (`03` §1, §4, §6): copied drill glue, the grid board, the `window.qaida` object |
| `site/qaida/lesson-16.html` | **new** | `04` |
| `site/qaida/exercise-16.html` | **new** | the reading page: `exercise-15.html` with the hamza words |
| `site/qaida/spell.js` | edit | `unitsFor`'s seat hook (`03` §8); `WORDS.hamza` (`05` §1); the hamza step line |
| `site/qaida/exercise.js` | edit | `WORDS.hamza` (`05` §2) |
| `site/qaida/shell.js` | edit | Lesson 16's row: `built: true`, `href`, `progress: 'drill'`, no `cp` |
| `site/qaida/qaida.css` | edit | the grid, the seat strip, dim cells; nothing that touches a mark lesson |
| `site/qaida/audio/manifest.json` | edit | `"hamza-jazam": {}` |
| `site/qaida/audio.js`, `recordings.js` | maybe | the row's description line, and the kind's list entry (`03` §7) |
| `tools/qaida-rules-check.js` | **new** | the rule data and the page check |
| `tools/qaida-words-check.js` | edit | the hamza rules (`05` §3) |
| `tools/qaida-check.js` | edit | the fence extended to lessons 4–15 (`§3`) |
| `docs/pass-2/01…md`, `QAIDA-BUILD.md`, `QAIDA-CONTENT.md` | edit | the alif-jazam correction (already written); status, "Step P2 begun — Lesson 16" in the step log |

**Not edited:** `marks.js`, `mark-lesson.js`, `practice.js`, and every `lesson-4…15.html`.

## 2. Build order

0. **Lesson 15 built** (it is), and the user's yes to this plan.
1. **The fence.** Extend `qaida-check.js`'s hash of every glyph and every `masteredCount` of lessons 4–15 in both scripts, and
   run it *before* anything else changes. It must pass now and after every step below.
2. **`rules.js`**, then `tools/qaida-rules-check.js`'s data half (`§3`). No page yet.
3. **`shell.js`'s row and `spell.js`'s seat hook.** Run the whole check: lessons 4–15 must not move.
4. **`lesson-16.html`** (from `04`), with the grid, empty.
5. **`rule-lesson.js`.** First diff the options panel's `lesson.*` list (36 members, from `qaida-options.js`) against
   `window.qaida`; then the copied glue; then the grid.
6. **`qaida.css`.** Look at the page in the browser pane, **Madani and Indo-Pak, both themes, 375px and wide, Comfortable and
   Large**: the grid never overflows, no cell clips (the jazam cell with its lead is the tightest), no uneven row.
7. **Words**: `spell.js`, `exercise.js`, `exercise-16.html`, the words check.
8. **Recordings**: the manifest group, `recordings.html`'s one new row.
9. Every check; then hand it to the user.

## 3. The checks

Every earlier check, unchanged, plus `node tools/qaida-rules-check.js`.

**The data half** (loads `rules.js` in node, as `qaida-marks-check.js` loads `marks.js`):
- fifteen forms, fifteen distinct ids, **all two characters**, the same in both scripts;
- parts sized **3, 4, 6, 15**; every form in part 4;
- every form's **mark is a real `MARKS` id** with a name in both name sets;
- `glyphOf` for every form in both scripts: no Madani alif seat (U+0623, U+0625) in an Indo-Pak drawing, the Madani jazam is
  U+06E1 and the Indo-Pak one U+0652, and **no literal combining mark in `rules.js`, `rule-lesson.js` or `lesson-16.html`**;
- the lead is drawn in front of every jazam form and only those, and is never in an id;
- 400 questions through the real engine, on every part: never the same answer twice, the right answer's **name** is unique in
  its choices, no part starves, and no question is `NAME_TO_FORM`;
- `masteredCount(16)` counts exactly the mastered forms, none other;
- **mastery survives a script switch**;
- the **fence**: lessons 4–15's glyphs and `masteredCount` are byte-identical to the snapshot.

**The page half** (loads the page in a DOM, as `qaida-lesson15-check.js` does): the rail's four parts and their glyphs; the
grid's 5 × 4 cells, the dash cells, the dim cells for parts not yet open; the same-sound line changes with the row; the
Madani and Indo-Pak lines each show in their own script only; the lead line in parts 3 and 4 only; finishing gated by
part 4; the walkthrough steps سَأَلَ in five steps, with the hamza step on its own line; Previous to Lesson 15; Next to
Lesson 17 (soon); **every `window.qaida` member the panel reads exists**.

## 4. The browser checklist (the user's)

1. **The grid.** Read a row across: does "the same sound on four seats" come across? Is the dim of the other parts
   clear without hiding them?
2. **The Indo-Pak line** ("You have been reading it since the start"), read in Indo-Pak, and the **Madani line** in Madani.
3. **Your own Qaida beside the screen.** Is the yaa seat (ئ) how your book draws it in Indo-Pak, or is it the dotless seat
   with the hamza below (`02` §5)? Is the alif's hamza-with-zair (إ) drawn where your book puts it?
4. **The jazam forms** (بَأْ بَءْ بَؤْ بَئْ): at the tile's size, the tightest case; and the lead's baa.
5. **The three walkthrough words**, and the twelve on the reading page, in both scripts. **Every word is Claude's candidate.**
6. **"The seat is not read"**, under a wrong answer: too much, too little, or right?
