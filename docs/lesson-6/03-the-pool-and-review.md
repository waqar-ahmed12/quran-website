# 03 — The pool, the review, and the wrong answers

This is the only file in this folder with real code in it. Lesson 5 went from **no** earlier mark to **one**. Lesson
6 goes from one to **two**, and the two do different jobs.

## 1. Which mark is "the other one": zabar, not zair

`marks.js` gives each mark an `after`: the mark whose letters ride along as the wrong answers. `otherOf(mark)` reads
it, and everything in `docs/lesson-5/03` (`twinItems`, `{other}`, the trio board, `which-mark`) is built on it.

| Mark | `after` as built | `after` as it should be | Why |
|---|---|---|---|
| fatha | `null` | `null` | the first mark |
| kasra | `'fatha'` | `'fatha'` | same stroke, other side: **position** tells them apart |
| damma | **`'kasra'`** | **`'fatha'`** | same side, other shape: **shape** tells them apart. Zair is told apart by position, which Lesson 5 already taught |

**Change `MARKS.damma.after` to `'fatha'`.** That one edit makes `{other}` say "zabar", the trio board show
بَ beside بُ, and every paish question carry its zabar twin. Lesson 5 is untouched, since kasra's row does not change.

## 2. Zair comes along too, as a passenger

`QAIDA-CONTENT.md` item 6 and the user's 2026-09-19 rule both say zair's letters come back in Lesson 6. They do, but
as **review that is not the contrast**. Add a second field:

```js
damma: { …, after: 'fatha', also: ['kasra'] },
// fatha and kasra: also: []
const alsoOf = (mark) => (mark.also || []).map((id) => MARKS[id]).filter(Boolean);
```

`also` is a list so that Lesson 7 (tanween) and later lessons can use it without another change to the model. Export
`alsoOf` beside `otherOf`.

### The three kinds of review item in Lesson 6

| Kind | Example | `id` | Tag under `which-mark` | Default |
|---|---|---|---|---|
| **the twin**, zabar | بَ | `'ب' + U+064E` | `letter:ب` (the same as the paish item) | **on**, every letter of the part |
| **the passenger**, zair | بِ | `'ب' + U+0650` | **none** | **on in part 2 only**, a third of the part's letters |
| the bare letter | ب | `'ب'` | as Lesson 5 | the slider, **0** |

The three ids end in different marks, so they can never collide with each other or with a paish item (`'ب' + U+064F`).

### How much zair

Review is weighted at half a required item, and the page's no-repeat rule flattens that in a small pool. Lesson 5
measured its twins at **~45% of part 1's questions and ~35% of part 2's** (`docs/lesson-5/README.md` "as built" §6).
Adding a zair twin for every letter on top of that would make review more than half of the lesson, and the lesson is
about paish.

So:

- **Part 1: no zair.** Six letters, their paish and their zabar: the first minutes are about one contrast only.
- **Part 2: a third of the letters** (`Math.ceil(own.length / 3)`, so 10 of 29), chosen by `reviewKeys` with
  `drillOf(5)` preferred, so the letters this student missed in Lesson 5 come back first.

**Measure it when built**, the way Lesson 5 did, and write the numbers into this folder's "as built" list. If part 2
comes out above ~45% review, halve the passengers before touching the twins.

The options panel gets one row: **"Zair riding along"**, with the choices *Off / In part 2 (default) / Every letter*.
It sets `<html data-also>`.

## 3. The tag: why only zabar carries it

`practice.js` `distractorsFor()` (line 236) walks a shuffled list and takes the **first** item that shares a tag, then
fills the rest from anywhere. If the zabar twin and the zair passenger both carried `letter:ب`, the guaranteed wrong
answer would be zair about half the time, which is the easy one, because it sits on the other side.

So **the passenger gets `family: []` under `which-mark`**, and only the zabar twin is guaranteed. The zair passenger can
still turn up as one of the other two wrong answers, by chance, and that is the right amount.

Under `look-alike` and `any` the passenger gets whatever `familyFor` gives, like every other item. This is only about
the `which-mark` case.

`practice.js` does not change. Asking **all three** at once ("Which one is Baa with paish?", answers بَ بِ بُ ب) would need
the engine to take *every* item sharing a tag, not one. That is a real format and a good one, but it is an engine
change, and it is `06-open-questions.md` §4, not this build.

## 4. `marks.js` changes, exactly

| Function | Change |
|---|---|
| `MARKS` | `damma.after: 'fatha'`; `also: []` on fatha and kasra, `also: ['kasra']` on damma |
| `alsoOf` | **new**, as above; exported |
| `wordsFor` | gains `also` / `Also`: the first `also` mark's name in the student's set, or `''`. So wording can say "zabar" and "zair" without hardcoding either |
| `twinItems` | gains two options: `as` (which mark to put on the letters; default `otherOf(mark)`, so every current caller is unchanged) and `tagged` (default `true`; `false` gives `family: []`). Everything else it builds already reads the mark it is given |
| `reviewKeys` | "reaches back" over **every** earlier mark (`[otherOf(mark), ...alsoOf(mark)]`), not only `otherOf`, so Lesson 6 prefers the letters missed in lessons 2, 4 **and** 5. Each lesson's ids end in its own mark, so the suffix is per mark, as it already is for one |
| `boardRows` | each row gains `also: alsoOf(mark).map((m) => glyphOf(glyph, m))` |
| `rename` | **no change.** It already looks a twin's words up from `item.mark` |
| `allItems`, `poolFor`, `sizes`, `stats`, `inPart` | **no change.** They are only handed the lesson's own 29. Same warning as `docs/lesson-5/03` §4: don't "fix" them |

## 5. `mark-lesson.js` changes, exactly

| Where | Change |
|---|---|
| near `other` (line 103) | `const also = marks.alsoOf(mark);` and `alsoMode()`, which reads `data-also` (`off` / `part-2` / `all`; anything else is `part-2`). Off whenever `twinsOn()` is off: the passenger never rides without the twin |
| `reviewPlan(own)` | returns `also`: how many passenger letters. `0` for `off`, `0` in part 1 for `part-2`, `Math.ceil(own.length / 3)` in part 2, `own.length` for `all` |
| `poolOf(n)` | builds the passengers with `twinItems(…, { as: m, tagged: distractors() !== 'which-mark', keys })`, where `keys` is `reviewKeys` limited to the part's own letters, and appends them after the twins |
| `boardMode()` | a fourth value, **`set`**: the letter, then every earlier mark, then this one. Needs `also.length`; falls back to `trio` without it |
| `pairOf` | the `trio` branch becomes a loop over `[other, ...also]` when the mode is `set`, one `pairCell('also', …)` per passenger mark. **No arrows in `set` mode** (`04` §3) |
| the shape key (line 1044) | add `alsoMode()`, so changing the row rebuilds the pool |
| `window.qaida` | a `setAlso` beside `setTwins`, for the options panel |

The board tiles already carry `data-id` and `data-audio` per tile (`docs/lesson-5/README.md` "as built" §7) and
`data-missed` compares ids, so **a missed zair passenger lights its own tile with no further change**, once the `also`
cell carries its id.

`isOwn`, the verdict line, the `spot` question and the advice rules already key on `item.mark === mark.id`, so they
are right for a third kind of item with no edit. **Check that; don't assume it.**

## 6. Progress and finishing: unchanged

- `setDone(6, true)` when **part 2** is ready: seven tenths of the 29 at `target` 2, nothing missed still shaky.
- `shell.masteredCount(6, …)` counts only ids of a letter plus U+064F, through the row's `cp` (Lesson 5's fix). The
  passengers and twins cannot inflate the home card.
- Lesson 2's newer "deck" (every letter twice, then done) is **not** used here, the same as lessons 3–5. Whether the
  mark lessons should switch to it is `06-open-questions.md` §1, and it would change all three at once.
