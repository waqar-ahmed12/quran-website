---
tags: [lesson-16, hamza, spec]
---
# 03 — The rule page: `rules.js` and `rule-lesson.js`

**Part of** [[docs/lesson-16/README|Lesson 16]] · previous [[docs/lesson-16/02-hamza-and-the-scripts|02]] · next [[docs/lesson-16/04-page-and-wording|04]] · [[MAP]]

**The rule:** lessons 4–15 come out **byte-identical**. `marks.js`, `mark-lesson.js` and `practice.js` are **not edited**.
The fence in `qaida-check.js` (every glyph and every `masteredCount` of lessons 4–15, both scripts) is kept and must
still pass. This lesson adds files; the only edits to existing ones are two small, additive hooks (`§8`).

## 1. Copy, do not refactor

`rule-lesson.js` needs the drill half of `mark-lesson.js`: the question and its choices, the verdict, the "after" strip
(Hear it, Say it, Write it, Next), the advice, the parts rail, the progress bar, finish, Previous and Next. That is
about 500 of its 1550 lines. **They are copied, not extracted into a shared module.** Extracting them would mean editing
`mark-lesson.js`, which twelve lessons stand on, to serve one that does not exist yet. The copy is stated in a comment at
the top of `rule-lesson.js`; **a later step extracts the shared half once Lesson 18 shows what really is shared**
(`docs/pass-2/02` §1 says the same about `practice.js`), and that step runs behind the same fence.

| Copied (as written, with the names changed where they said "mark") | New | Not needed |
|---|---|---|
| `showQuestion`, `buildPrompt`, `buildChoices`, `labelChoices`, `paintQuestion` | the **grid board** (`§4`) | the halo (`markBox`, `positionHalos`) |
| `showVerdict`, `paintVerdict`, the after strip's four buttons | `rules.js` items | twins, bare review letters |
| `paintAdvice`, `onStruggling`, `paintFinished`, `watchReady` | the **seat strip** | `boardRows`, the quartet, `joined` |
| the rail (`buildRail`, `paintRail`, `setGroup`), progress, reset, Next/Prev | the seat line under a wrong answer | `same`, `forms`-driven tails, `MET_WORDS` |
| the `window.qaida` object (`§6`) | | the lead on the *board* (only the drill and Write it show it) |

## 2. `rules.js`: the data layer

No DOM, no storage, so `tools/qaida-rules-check.js` loads it in node, as `marks.js` is. It reads `qaidaMarks` for the
mark rows (names, code points, the jazam's Madani form), so a change to a mark follows here.

```js
// A form is a seat and a mark. `mark` is a MARKS id (never a code point), so the names, the sounds and the jazam's
// per-script drawing all come from marks.js. `lead` is drawn in front of the tile and never in an id (docs/lesson-16/02 §4).
const SEATS = {
  alif: { id: 'alif', madani: 0x0623, madaniBelow: 0x0625, indopak: 0x0627 }, // Madani zair has its own seat glyph
  line: { id: 'line', madani: 0x0621, indopak: 0x0621 },
  wow:  { id: 'wow',  madani: 0x0624, indopak: 0x0624 },
  yaa:  { id: 'yaa',  madani: 0x0626, indopak: 0x0626 }, // docs/lesson-16/02 §5
};
const HAMZA = {
  id: 'hamza', lesson: 16, parts: 4,
  forms: [
    { seat: 'alif', mark: 'fatha',     parts: [1, 4] }, { seat: 'alif', mark: 'kasra',  parts: [1, 4] },
    { seat: 'alif', mark: 'damma',     parts: [1, 4] }, { seat: 'alif', mark: 'sukun',  parts: [4], lead: [0x0628, 0x064E] },
    { seat: 'line', mark: 'fatha',     parts: [2, 4] }, { seat: 'line', mark: 'kasra',  parts: [2, 4] },
    { seat: 'line', mark: 'damma',     parts: [2, 4] }, { seat: 'line', mark: 'fathatain', parts: [2, 4] },
    { seat: 'line', mark: 'sukun',     parts: [4], lead: [0x0628, 0x064E] },
    { seat: 'wow',  mark: 'fatha',     parts: [3, 4] }, { seat: 'wow',  mark: 'damma',  parts: [3, 4] },
    { seat: 'wow',  mark: 'sukun',     parts: [3, 4], lead: [0x0628, 0x064E] },
    { seat: 'yaa',  mark: 'fatha',     parts: [3, 4] }, { seat: 'yaa',  mark: 'kasra',  parts: [3, 4] },
    { seat: 'yaa',  mark: 'sukun',     parts: [3, 4], lead: [0x0628, 0x064E] },
  ],
};
```

**Parts `[1,4]` say "meet it in part 1, and it comes again in part 4"**, as a mark lesson's item belongs to several
parts (`marks.js`, `inPart`). Sizes: **3, 4, 6, 15** (the 15 forms above).

**The id** is one fixed string, **the Madani drawing's code points with the jazam as U+0652**: seat (Madani, including
the below-form إ for the alif's zair), then the mark's own `suffixOf`. It is never built from what is drawn in Indo-Pak,
so **a script switch keeps every credit** (the rule of every id since Lesson 9). Fifteen ids, all distinct, **all two
characters** (a seat and one mark: every mark here is a single code point).

**The drawing** is `glyphOf(form, script)`: the seat for the script (`SEATS[seat]`, the Indo-Pak alif being the bare ا),
then the mark's own drawn code points (`marks.drawnOf(marks.markOf(mark), script)`, which is where the jazam's Madani
U+06E1 comes from and where a script with no `forms` gets the plain code point). `drawnOf(form)` with a lead is
`leadOf(form) + glyphOf(form)`; the lead is `''` for a form without one.

**Exposed:** `window.qaidaRules = { RULES, SEATS, formsOf, partsOf, idOf, glyphOf, leadOf, drawnOf, itemsFor, gridOf,
seatOf, sizes, stats, poolFor }`. Only `seatOf(key, script)` is used by another file (`§8`).

## 3. The engine, unchanged

`practice.js` is used as it is. **`distractorsFor` never shows the same answer twice** (`taken` is by `name`), so when
five forms are called "hamza with zabar" the choices come out as the *marks*, one each (`docs/pass-2/02` §2). That is the
mechanism, and it is why this lesson's question is "read the mark, ignore the seat". Checked by arithmetic:

| Part | Items | Distinct names | Choices offered |
|---|---|---|---|
| 1 | 3 | 3 (zabar, zair, paish) | 3 |
| 2 | 4 | 4 (adds two zabar) | 4 |
| 3 | 6 | 4 (zabar, zair, paish, jazam) | 4 |
| 4 | 15 | 5 | 4 (of five) |

`makeQuestion` needs at least two choices, so no part can starve.

**Formats (data, not branches):**

| Format | `ask` → `answerWith` | On? |
|---|---|---|
| `FORM_TO_NAME` | glyph → name | **on, always** |
| `SOUND_TO_NAME` | sound → name | **on when the form is recorded** (`§7`). Hearing "a'" and picking "hamza with jazam" is the by-ear question, and it can be asked with names because a name is not a picture |
| `NAME_TO_FORM` | name → glyph | **off, not built.** Two pictures honestly have the same name, so the engine would mark a right picture wrong (`01` §3) |
| `SOUND_TO_FORM` | sound → glyph | **off, not built**, same reason |

`familyFirst` is **off** (`false`): the engine's "one look-alike among the wrong answers" needs a `family` tag, and no
form has a look-alike that matters (the four seats *are* look-alikes, and the point is that they do not matter). `deck`
stays off; the weighted draw is what lessons 4–15 use.

**`target` (2 in a row) and `readyAt` (0.7)** are the engine's defaults. Part 1 has three items, so 70% is all three.
**`spreadFor`** (`noRepeatWithin`): copied, capped at `count − 2`.

## 4. The board

The board is a **grid whose rows are the marks and whose columns are the four seats**. A cell holds the form if the form
exists, and a dash if it does not. Reading a row across, the student sees the same sound on four seats, which is the
lesson.

```
            alif    the line    wow     yaa
  zabar      أَ        ءَ         ؤَ       ئَ        "a"
  zair       إِ        ءِ          –       ئِ        "i"
  paish      أُ        ءُ         ؤُ        –        "u"
  two zabar   –        ءً          –        –        "an"
  jazam      بَأْ      بَءْ        بَؤْ     بَئْ      "'"
```

- **The whole map is on the board from part 1.** Cells whose part is not the open one are drawn dim, "comes later", in
  the rail's own language (`data-state="later"`), so the grid never changes shape and the student sees where the lesson is
  going. The open part's cells are full colour; a cell of a part already done is full colour too.
- **Tapping a cell says it**, exactly as a mark lesson's tile does (`peekTile`), using the form's `audio` (`§7`). A dim
  cell is a button all the same: nothing is locked.
- **Above the grid, the seat strip:** the four seats each with the sentence "is a seat: it is not read". Each seat's
  own caption (its name, "alif", "the line", "wow", "yaa") is a text field.
- **Below the grid, the same-sound line** for the row last tapped, or the first row before any tap: one sentence, with the
  four spellings, "All four say 'a'. The seat is never read." Its wording is `04` §3.
- **A per-script line** (`04` §3): the Indo-Pak student is told "An alif with a vowel on it is a hamza. You have been
  reading it since the start"; the Madani student is told the alif carries a small hamza sign.
- **Tile size** is the mark lesson's (`--tile`), so `data-size` (Comfortable / Large) works. A jazam cell has a lead, so
  it is two letters wide, as Lesson 14's tile was (`data-tail`); the grid's columns are `minmax(0, 1fr)` so nothing
  clips at 375px, **which the build measures** (`06` §4, and `02` §3's list).

## 5. Why there is no halo

A mark lesson's halo rings the mark: "look at what this lesson added". Here the lesson is the opposite, **which part is
not read**, and a ring on the vowel would say the vowel is the point. The row is not offered in the options panel on this
page, and `data-point` is `none`. If the teacher wants the hamza sign itself ringed, that is a measured diff of
"the seat" against "the seat with its hamza sign", which needs the seat to be drawn without the sign, and none of the three
faces draws a hamza-less أ with a hamza-less kasra the way the mushaf does. **Not built.**

## 6. What the options panel needs

`qaida-options.js` reads `window.qaida` when `kind === 'drill'`. `rule-lesson.js` provides **every** member the panel
reads (the list is in `06` §3), and the ones that do not apply say so: `hasOther` `false`, `hasTail` `false`,
`otherCount` `0`, `markCount` `1`, `review` `0`. **A missing member throws in the panel and takes the page down**, so the
first build step diffs the panel's `lesson.*` list against `rule-lesson.js`'s `window.qaida` (`06` §2, step 5).

**New rows the panel gets:** none in v1. The rows that make no sense here (the halo, the twins, the bare review letters,
two-letter tiles) are hidden by those getters, as the panel already hides them where they do not apply.

## 7. Audio

| Form | `audio.kind` | `audio.glyph` | Recorded by |
|---|---|---|---|
| a hamza with zabar / zair / paish (any seat) | `fatha` / `kasra` / `damma` | `ا` | Lessons 4–6 (the alif's sound) |
| a hamza with two zabar (the line) | `fathatain` | `ا` | Lesson 7 |
| a hamza with a jazam (any seat) | **`hamza-jazam`** | **`ء`** | **new: one recording**, "a'" |

**The seat is never read, so every seat of a mark shares one recording.** `audio.js` already lists a kind once (Lesson 9's
shared kind); `manifest.json` gains `"hamza-jazam": {}` and `recordings.html` one row, described "The sound "a'": baa
with zabar, then a hamza with a jazam." Until it is recorded, the jazam forms are asked as pictures only (`SOUND_TO_NAME`'s
`available` is false), like every by-ear question before its recordings.

## 8. The two additive hooks in existing files

1. **`spell.js`**: `unitsFor` resolves a root entry's key through `window.qaidaRules.seatOf(key, script)` *first*; it
   returns a script-correct glyph for the seat keys `أ إ ؤ ئ` and `null` for everything else, so every earlier word is
   unchanged. A walkthrough word can then say `['أ','fatha']` and be drawn أَ in Madani and اَ in Indo-Pak. Hamza on the line
   needs no hook: `ء` is already a letter key (`marks.glyphOf('ء', markOf('dammatain'))`).
2. **`shell.js`**: Lesson 16's `LESSONS` row becomes `built: true`, `href: 'lesson-16.html'`, `progress: 'drill'`, with **no
   `cp`**. `masteredCount` then counts every recorded id, and **every id in Lesson 16's record is one of its fifteen
   forms** (the rule page has no review items). No change to `masteredCount`; the check proves it (`06` §3).

`exercise.js` gains `WORDS.hamza` (`05` §2); `qaida.css` gains the grid, the seat strip and their states.

## 9. What Lessons 17–22 inherit

`rules.js` holds one rule (`HAMZA`) and takes another by adding an entry. `rule-lesson.js` reads `data-rule` from `<html>`
as `mark-lesson.js` reads `data-mark`. **What Lesson 17 needs from it** (a round taa and an end yaa: two forms, not a grid)
and **what Lesson 18 needs** (Qur'an words, not forms) is deliberately not built here: a page is not designed twice from
one example. Lesson 16 proves the page on the smallest, most regular rule, as Lesson 2 proved `practice.js`.
