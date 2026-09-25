# 03 — A lesson with three marks

This is the only file in this folder with real code in it. Everything else is a page with different words on it.

**The rule that governs every change below:** lessons 4, 5 and 6 must come out **identical**. Every generalisation
here has a one-mark case, and the one-mark case is what those three pages already do. If
`tools/qaida-marks-check.js`, `qaida-lesson5-check.js` or `qaida-lesson6-check.js` changes its answer at all, the
change was wrong. That is the test, and it is cheap to run.

## 1. `MARKS` gains three rows

```js
fathatain: {
  id: 'fathatain', cp: 0x064B, names: { fatha: 'fathatain', zabar: 'do zabar' }, sits: 'above', lesson: 7,
  audio: 'fathatain', first: MARKS.fatha.first, sample: 'ب', against: ['fatha'],
},
kasratain: {
  id: 'kasratain', cp: 0x064D, names: { fatha: 'kasratain', zabar: 'do zair' }, sits: 'below', lesson: 7,
  audio: 'kasratain', first: MARKS.kasra.first, sample: 'د', against: ['kasra'],
},
dammatain: {
  id: 'dammatain', cp: 0x064C, names: { fatha: 'dammatain', zabar: 'do paish' }, sits: 'above', lesson: 7,
  audio: 'dammatain', first: MARKS.damma.first, sample: 'ب', against: ['damma'],
},
```

Three notes on the fields:

- **`against` is the single counterpart, and only it.** Not "every mark taught so far". بً has to be told from
  بَ; being told from بِ is last lesson's skill, and `docs/lesson-6/03` §1 is the whole argument, in the same
  words. The *other tanweens* are a different list and arrive in §5.
- **`first` is borrowed, not copied.** `MARKS.fatha.first` by reference, so if the teacher changes the six letters
  of Lesson 4 the warm-up of Lesson 7 follows. They were chosen for a stroke in that place, and two strokes go in
  the same place.
- **The object literal cannot reference itself**, so either declare `MARKS` in two statements (the three doubled
  rows added after) or repeat the arrays. Two statements, with a comment saying why — a repeated array is a thing
  that silently drifts.

## 2. A lesson's marks are a list

Today `mark-lesson.js:18` is:

```js
const mark = marks.markOf(root.dataset.mark);
```

and 40 lines below it every `mark.cp`, `mark.sits`, `mark.first`, `mark.audio` and `mark.against` reads from that
one object. The smallest honest change is to let `data-mark` name **a set** as well as a mark:

```js
// A lesson usually teaches one mark. Lesson 7 teaches three (the doubled marks) and Lesson 9 will teach three
// more (the standing harakaat), so a lesson's marks are a list, in the order the parts drill them. A page naming a
// single mark gets a list of one, which is exactly what lessons 4, 5 and 6 are.
const SETS = {
  tanween: {
    id: 'tanween', lesson: 7, names: { fatha: 'tanween', zabar: 'tanween' },
    marks: ['fathatain', 'kasratain', 'dammatain'],
  },
};
const setOf = (id) => SETS[id] || null;
const marksOf = (id) => {
  const set = SETS[id];
  if (set) return set.marks.map((key) => MARKS[key]).filter(Boolean);
  return MARKS[id] ? [MARKS[id]] : [];
};
```

`<html data-mark="tanween">`, and in `mark-lesson.js`:

```js
const own = marks.marksOf(root.dataset.mark);   // [fathatain, kasratain, dammatain] — or [damma] on Lesson 6
const set = marks.setOf(root.dataset.mark);     // null on lessons 4–6
const mark = own[0];                            // the lesson's headline mark, and the ONLY mark on lessons 4–6
```

Everywhere `mark-lesson.js` uses `mark` today, ask which of three things it means, and it is nearly always the
first:

| Use | Becomes |
|---|---|
| `mark.cp` when composing a glyph for a tile or a choice | **the item's own mark** (`marks.markOf(item.mark)`) — the item already carries it |
| `root.dataset.sits` | per tile, §7 |
| `say(…)`, the `{mark}` token | **the open part's mark**, §6 |
| `mark.audio`, the recording group | the item's own mark; `item.audio.kind` already says |
| `LESSON = mark.lesson` | unchanged — every mark of a set carries the same `lesson` |
| the title mark, the rail glyph | the part's mark, §8 |

## 3. Parts

`marks.js` has, module-wide:

```js
const COUNT = 2;
const DRILLING = [1, 2];
```

and `mark-lesson.js` reads `LAST = marks.COUNT` and loops `marks.DRILLING`. Make them per-lesson:

```js
// The parts of a lesson, in order. One mark: meet it on six letters, then all of them — which is lessons 4, 5
// and 6 unchanged. Three marks: meet each one on its own six, then all the letters with all three in the mix.
function partsOf(list) {
  if (list.length < 2) return [{ n: 1, mark: list[0], first: true }, { n: 2, mark: list[0], first: false }];
  return [
    ...list.map((m, i) => ({ n: i + 1, mark: m, first: true })),
    { n: list.length + 1, mark: list[0], first: false, every: true },
  ];
}
```

`COUNT` and `DRILLING` stay exported, with a comment that they are the one-mark case, so nothing that reads them
today has to change in the same commit as everything else.

**Lesson 7 has four parts:**

| Part | Name | Mark | Items | Required |
|---|---|---|---|---|
| 1 | Meet do zabar | fathatain | ب د ر س م ل, each with ً | 6 |
| 2 | Meet do zair | kasratain | ا د ت ط ك ه, each with ٍ | 6 |
| 3 | Meet do paish | dammatain | ب د ر س م ل, each with ٌ | 6 |
| 4 | All the letters | all three | all 29, one tanween each (§4) | 29 |

**The gate stays on the last part alone.** `mark-lesson.js`'s `allReady()` is already `stat(LAST).ready` and
`upTo()` is already "the first part that is not ready" — so parts 1–3 are warm-ups that advise and never block,
which is the user's rule from 2026-09-19 and the answer to "is four parts too long?". A student who goes straight
to part 4 finishes the lesson there. **47 required items in all, of which 29 are the gate**; Lesson 6's were 35 of
which 29. The lesson is the same length as Lesson 6 plus three optional six-letter warm-ups.

## 4. The last part: 29 letters, not 87

Every letter with every tanween is **87 items**, which at three right answers apiece is upwards of 260 questions.
The user has already said once that a lesson felt repetitive (2026-09-20). So:

> **The board shows all three. The drill asks one.**

The board in part 4 draws a quartet for every letter — ب بً بٌ بٍ — so all 87 combinations are on the page to be
looked at and tapped and heard. The **drill** gives each letter one tanween, by its place in the alphabet:

```js
// Which tanween a letter carries in the last part: its place in the alphabet, modulo the number of marks. It is
// deterministic (the pool must not reshuffle when the page redraws), it spreads the three marks evenly over the
// letters — 10, 10, 9 of the 29 — and most letters meet a mark they did not meet in the warm-up parts.
const markAt = (list, index) => list[index % list.length];
```

A letter whose rotation lands on the mark it already met in its warm-up is **not a bug**: it is the same id, the
same item and the same credit, and the engine and the bar both count it once. `allItems` returns one item per
(letter, mark) pair the lesson uses, with the parts it belongs to:

```js
// `parts` rather than a single `group`: a pair can belong to a warm-up part AND to the last part, and they are the
// same item — the same id, so a student who knows بً from part 1 is not asked to learn it twice.
{ …, parts: [1, 4] }
const inPart = (item, n) => item.parts.includes(n);
```

On a one-mark lesson this returns exactly what it does today: 29 items, the six with `parts: [1, 2]` and the other
23 with `parts: [2]`. `sizes()` still says `[6, 29]`. **That is the check** (`05` §3).

## 5. Twins: *one or two?*, then *which two?*

`twinsFor(own, n, options)` builds, for each of the part's items, the same letter with another mark, so the engine
always has one wrong answer that differs **only in the mark**. It reads one list today —
`others = marks.othersOf(mark)` — fixed for the whole page. Lesson 7 needs it to depend on the part:

```js
// Which marks a part's items are told apart from. A warm-up part is the doubled mark against its own single one
// ("one stroke or two?"), which is what `against` has always been. The last part of a lesson with several marks is
// each of them against the others ("which two?") — the skill the warm-ups cannot teach, because inside a warm-up
// every item carries the same mark. docs/lesson-7/03 §5.
function twinMarksFor(item, part) {
  const self = marks.markOf(item.mark);
  if (!part.every || own.length < 2) return marks.othersOf(self);
  return own.filter((m) => m !== self);
}
```

Lesson 6's **alternation** applies unchanged on top of it (`docs/lesson-6/03` §4): with `data-twins="alternate"`,
one twin per letter, chosen by the letter's place in the teaching order plus the part number, so no letter gets
two twins and the review does not drown the lesson. With `both`, every twin; with `off`, none.

**The arithmetic**, at the engine's half weight for a review item:

| Part | Required | Twins (alternate) | Twins' share of questions |
|---|---|---|---|
| 1–3 | 6 | 6 | ≈ 33% |
| 4 | 29 | 29 | ≈ 33% |

The same share Lesson 5 measured and Lesson 6 kept. Bare letters stay at **0** by default (the user, 2026-09-20:
"don't add simple alphabets without symbols"); the slider is still there.

**The one thing to get right:** in part 4 a question about بً must have **بٌ or بٍ** among the answers, not بَ.
If it has بَ, part 4 is part 1 again. A check asserts it (`05` §3), because it is invisible from the page and
fatal to the lesson.

## 6. `{mark}` is the part's mark, and `{set}` is the lesson's

`wordsFor(mark, shell)` fills `{mark} {Mark} {other} {Other} {others} {Others}`. Lesson 7's page says "tanween" in
the title and "do zabar" in part 1, so:

- `say()` in `mark-lesson.js` fills from **the open part's mark**, not from `own[0]`. One line: it already takes a
  values object.
- **`{set}`** is a new token — the lesson's own word, from `SETS[id].names`, empty on lessons 4–6. It is what the
  lede, the end line and the Next button on Lesson 6 say.
- `{other}` in a warm-up part is the single counterpart ("the same stroke as zabar, written twice"). In part 4 it
  is the first of the *siblings*, which is what the quartet board's captions want.

Every one of those strings is a `data-words` field, so the teacher can rewrite any of them without code.

## 7. `sits` moves from the page to the tile

```css
/* qaida.css today */
:root[data-sits='below'] .mark-tile { aspect-ratio: 5 / 7.4; padding: 0.375rem 0 0.875rem; }
:root[data-sits='below'] .mark-tile .glyph { line-height: 1.85; }
```

Becomes, with **no other change to the two rules**:

```css
.mark-tile[data-sits='below'] { aspect-ratio: 5 / 7.4; padding: 0.375rem 0 0.875rem; }
.mark-tile[data-sits='below'] .glyph { line-height: 1.85; }
```

and `markTile()` sets `button.dataset.sits = strokeOf ? strokeOf.sits : 'above'`. On Lesson 5 every tile says
`below` and every tile gets the rule, exactly as today; on Lesson 7's quartet the kasratain tile gets it and the
other three do not. `<html data-sits>` stays as it is — it is the stylesheet's hook for anything page-wide, and
the drill's choices, which are not `.mark-tile`s, still read it. **In part 4 it should be the open part's mark's
value**, which for a mixed part means `above`; the drill's choices are one item's glyph each, so if a below mark is
ever clipped there, the fix is a `data-sits` on the choice button and not a page-wide attribute (`05` §4 item 4).

## 8. The halo, `markBox`, and the board's columns

Three places read `mark` where they must now read *the stroke being drawn*:

1. **`markBox(letter, spec)`** (`mark-lesson.js:422`) draws the letter twice on a canvas — plain, and with
   `marks.glyphOf(letter, mark)` — and takes the difference as the box the ring goes round. It must take the
   stroke: `markBox(letter, spec, stroke)`, and the cache key becomes `` `${letter}|${spec}|${stroke.id}` ``. A
   missed cache key here is the worst kind of bug in this file: the ring is drawn in the *right* place for the
   *wrong* mark, which looks like a rendering fault in the font.
2. **`positionHalos()`** loops `.mark-tile.marked` and passes `tile.dataset.base`; it now also passes the tile's
   stroke, which `markTile` can write as `tile.dataset.mark = strokeOf.id`.
3. **`boardRows(shell, mark, group)`** builds each row's `others` from `othersOf(mark)`. It takes the list
   instead — `boardRows(shell, mark, group, { others })` — and the page decides: `othersOf(part.mark)` in a
   warm-up part (a trio: ب بَ بً) and **the other tanweens** in part 4 (a quartet: ب بً بٌ بٍ).

**`.pair.quad` already exists** — Lesson 6 built it and its narrow-screen rule (`qaida.css:3023`). Part 4's board
is a quartet of *marked* tiles rather than one bare and three marked, which is one more `pairCell(kind …)` call
and no new CSS. The bare letter stays as the first cell; `04` §3 draws it.

## 9. `shell.js`: a lesson row with three marks

```js
{ n: 7, title: { fatha: 'Tanween', zabar: 'Tanween' }, href: 'lesson-7.html', built: true, progress: 'drill',
  cp: [0x064B, 0x064C, 0x064D], lede: 'The doubled marks: an, in and un at the end of a word.' },
```

`masteredCount` (`shell.js:290`) tests `id.length === 2 && id.endsWith(suffix)`. Let `cp` be a number **or** a
list — three lines, and lessons 4, 5 and 6 keep their rows untouched:

```js
const cps = entry && entry.cp ? [].concat(entry.cp).map((n) => String.fromCharCode(n)) : [];
…
return !cps.length || (id.length === 2 && cps.includes(id[1]));
```

Without it the home card reads 0 for Lesson 7 while the page's own bar reads correctly — the same class of fault
`docs/lesson-5/06` found, in the same function, and the same check catches it: **the home card's number equals the
page's bar**.

## 10. What does not change

- **`practice.js`.** Again. Nothing here is a change to how a drill runs — it is which items go into one. If it
  looks as though the engine must change, the work belongs in the page
  (`docs/lesson-2/02-practice-engine.md`), and `tools/qaida-check.js` will say so.
- **`audio.js`, `recordings.js`, `recordings.html`.** `groups()` walks `MARKS` and takes any mark whose lesson is
  built, so three rows in `MARKS` plus `built: true` in `shell.js` give the teacher 87 new recording rows with no
  edit. **Check that it did** — one look at `recordings.html`, and the cheapest confirmation in the build that the
  three rows are right.
- **`trace.js`.** "Write it" opens the letter with its mark; the guide is drawn on a canvas and centred on its ink,
  so two strokes are handled the same way one is.
- **Storage.** A `drill` per lesson, ids that are a letter and a mark. Nothing new.
