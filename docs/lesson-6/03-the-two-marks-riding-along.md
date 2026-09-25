# 03 — Two marks riding along

This is the only file in this folder with real code in it. Everything else is a copy with a different stroke.

## 1. `after` becomes `against`, a list in lesson order

Today `marks.js` has:

```js
const otherOf = (mark) => (mark.after ? MARKS[mark.after] : null);
```

One mark in, one mark out, and every consumer — `wordsFor`, `twinItems`, `reviewKeys`, `boardRows`,
`mark-lesson.js`'s `other` — assumes it. Lesson 6 needs two. The smallest honest change:

```js
// `against`: the marks this lesson is shown against, in the order they were taught. Their letters ride along as the
// wrong answers, so the student has to tell this mark from the ones they already know (docs/lesson-6/03 §1). The first
// mark has none; the third has two. `otherOf` is the nearest contrast, which is the FIRST of the list and not the last:
// damma's hard contrast is fatha (same place, different shape), not the kasra that happens to come just before it.
const othersOf = (mark) => (mark.against || []).map((id) => MARKS[id]).filter(Boolean);
const otherOf = (mark) => othersOf(mark)[0] || null;
```

with the rows becoming:

| Mark | Today | After |
|---|---|---|
| `fatha` | `after: null` | `against: []` |
| `kasra` | `after: 'fatha'` | `against: ['fatha']` |
| `damma` | `after: 'kasra'` | **`against: ['fatha', 'kasra']`** |

**Lessons 4 and 5 come out byte-identical in behaviour.** `otherOf(kasra)` is still `fatha`; `otherOf(fatha)` is
still `null`. That is the test: if `tools/qaida-marks-check.js` or `tools/qaida-lesson5-check.js` changes its
answer at all, the change was wrong.

### Why `against[0]` is fatha and not kasra

It is the same list read two ways and both readings want fatha first:

- **Lesson order** — fatha was taught before kasra, so `['fatha', 'kasra']` is chronological, which is the order
  the board draws its columns in (`04` §3).
- **Hardness** — `otherOf` is used wherever the page wants *one* other mark: the `{other}` token, the trio board,
  and the `which-mark` fallback. The one that should win there is the one the student will actually confuse with
  paish, which is zabar.

They agree here, so nothing has to choose between them. If a later lesson needs them to disagree, that is the
moment to add a second field — not now.

## 2. `{others}`, a second token

`wordsFor` returns `{mark} {Mark} {other} {Other}`. Add two:

```js
function wordsFor(mark, shell) {
  const others = othersOf(mark).map((m) => nameOf(m, shell));
  const list = others.length > 1 ? `${others.slice(0, -1).join(', ')} and ${others[others.length - 1]}` : others[0] || '';
  return { …, other: others[0] || '', Other: cap(others[0] || ''), others: list, Others: cap(list) };
}
```

So on Lesson 6, in the student's own names: `{other}` is *zabar*, `{others}` is *"zabar and zair"* (or *"fatha and
kasra"*). On Lesson 5 `{others}` is just *"zabar"*, and on Lesson 4 both are empty — which is already how `{other}`
behaves there, and the Lesson 4 wording never uses it.

**The joiner is English and it is in the code, not in a text field.** That is a small dishonesty against the
standing rule and it is the right trade: a teacher editing *"{Mark} is a different shape from {others}"* wants one
field, not three, and the alternative is the two-attribute pattern `docs/lesson-5/README.md` §2 already replaced
once.

## 3. Two sets of twins

`twinItems(shell, mark, { keys, … })` builds the other mark's letters. Today it takes `otherOf(mark)` itself:

```js
const other = otherOf(mark);
if (!other || !keys.length) return [];
```

It becomes a loop over a **given** list, so the page decides which marks ride along and the data layer only builds
what it is told:

```js
// `marks`: which other marks to build twins from, in board order. The page decides (reviewPlan in mark-lesson.js);
// the default is all of them, which is what a lesson with one other mark has always done.
function twinItems(shell, mark, options = {}) {
  const { keys = [], marks: wanted = othersOf(mark), … } = options;
  …
  return wanted.flatMap((other) => keys.filter(…).map((key) => ({ …, id: key + String.fromCharCode(other.cp), mark: other.id, … })));
}
```

Every field inside the map stays exactly as it is. The ids cannot collide: a letter's three ids are `ب`,
`ب` + U+064E, `ب` + U+0650 and `ب` + U+064F — four distinct two-character strings, and the bare one is one
character. That is worth a check (`05` §3).

**Keep `group: 0` and `required: false`.** Twins are review. They are never the gate, they never count towards
finishing, and they never raise the "go back and look at it again" advice, no matter how many of them there are
(the user, 2026-09-19). `poolFor`, `sizes`, `stats` and `lessonKnown` filter on `item.marked && item.group > 0`, so
they stay correct untouched — **do not "fix" them**.

### A student who skipped lessons 4 and 5

Nothing is locked, so this will happen, and now it means twins carrying *two* marks the student has never seen.
Still fine, and for the same reason as Lesson 5: a twin is only ever a wrong answer, never the thing being asked
about, and if the student picks one the verdict names what it really is ("that one is Baa with zabar") and they
have learnt something. The board shows all three from the first minute, which is where the teaching happens.

## 4. The arithmetic, which is the part that can go wrong

`practice.js` weighs a review item at **half** a required one, and `mark-lesson.js` sets
`noRepeatWithin: spreadFor(pool.length)` — at most 8 — which flattens that weighting in a small pool, because
every item has to have had a turn before any can repeat. Lesson 5 measured the result and it is the only
trustworthy number available:

| Lesson 5, as built | Pool | Twins as a share of questions |
|---|---|---|
| part 1 | 6 own + 6 twins | **~45%** (measured) |
| part 2 | 29 own + 29 twins | **~35%** (measured) |

Lesson 6 with **both** marks' twins doubles the twin half of that pool: 6 + 12, and 29 + 58. Predicted share:
**around 60% in part 1 and 50% in part 2** — more than half the questions about marks the lesson is not teaching,
in a lesson the user has already once called repetitive ("a lot of repetitions", 2026-09-20).

So the default is **one twin per letter, alternating deterministically**, and the teacher gets a row for the rest:

| `data-twins` | What rides along | Twins in part 1 / part 2 | Predicted share |
|---|---|---|---|
| **`alternate`** *(default)* | one twin per letter, zabar or zair, alternating by position — **and the alternation flips between part 1 and part 2**, so across the lesson every letter is seen against both | 6 / 29 | ~45% / ~35% — **exactly Lesson 5's proven shape** |
| `both` | both twins for every letter. Every question is the full three-way | 12 / 58 | ~60% / ~50% |
| `off` | none. Lesson 6 becomes Lesson 4 with a different stroke, and skill E is untested | 0 / 0 | 0 |

The alternation, in `mark-lesson.js` where the pool is built and not in `marks.js`:

```js
// One twin per letter, so the review stays the size Lesson 5 measured. Which mark alternates by the letter's position
// and flips with the part, so a letter drilled against zabar in part 1 is drilled against zair in part 2 (docs/lesson-6/03 §4).
const twinsFor = (own, group) => others.filter((_, i) => i === 0).length && ...
```

— stated properly: for each own item at index `i`, take `others[(i + group) % others.length]`, collect the
`{ mark, keys }` pairs, and call `twinItems` once per mark with that mark's keys. One `reviewPlan` change and one
`poolOf` change; `marks.js` does not know about any of it.

**Every own item still has exactly one same-letter twin in the pool**, which is what `practice.js`'s `familyFirst`
needs to guarantee that one wrong answer is the same letter with a different mark. That guarantee is the lesson.

## 5. The wrong answers — no new mode

`familyFor(key, distractors, looks)` does **not** change. `which-mark` already emits `letter:<key>`, the twins
already carry the same tag, and the engine already guarantees one of them is among the wrong answers. What differs
between Lesson 5 and Lesson 6 is only *which* twins exist in the pool — which is `reviewPlan`'s job, exactly as
`docs/lesson-5/03` §3 said it would be.

The four `distractors` values stay as they are, and `which-mark` stays the default. Its fallback is unchanged: a
mark with nothing to be told apart from falls back to `look-alike`, which only Lesson 4 hits.

## 6. `reviewKeys` reaches back three lessons now

`reviewKeys(shell, count, prefer, mark)` prefers the letters this student got wrong — Lesson 2's, then, since
Lesson 5, the one mark lesson before this one:

```js
const before = mark && otherOf(mark) ? shell.drillOf(otherOf(mark).lesson) : null;
const suffix = mark && otherOf(mark) ? String.fromCharCode(otherOf(mark).cp) : '';
```

Two lessons ride along now, so that becomes a loop over `othersOf(mark)`, each with its own suffix, summing the
wrong counts. Six lines, and the shape is already there. Lessons 4 and 5 come out unchanged: one entry in the
list, or none.

This only affects the **bare** letters, which `data-review` starts at **0** (the user, 2026-09-20: *"don't add
simple alphabets without symbols"*). So it changes nothing unless the teacher turns the slider up — which is why
it is worth doing now, cheaply, rather than being the thing that is wrong the day they do.

## 7. The board's row gains a list

`boardRows` returns `{ key, glyph, name, marked, joined, other }`. `other` becomes **`others`**, an array in
`against` order:

```js
others: othersOf(mark).map((m) => ({ id: m.id, glyph: glyphOf(glyph, m), name: nameOf(m, shell) })),
```

One consumer (`pairOf` in `mark-lesson.js`, which builds the trio's middle cell) and the check scripts. Dropping
the singular `other` rather than keeping both is deliberate: two fields that must agree is how the `sits` field sat
unread for a whole lesson (`docs/lesson-5/02` §2).

Each entry carries its own `name` so the caption can say *"The same letter with zabar"* and *"…with zair"* from one
text field with `{other}` filled per column (`04` §3).

## 8. Progress and finishing — unchanged

- `drill.progress()` — the open part, for the rail and the "you seem to know these" moment.
- `shell.masteredCount(6, target, ids)` — the whole lesson, for the bar and the home card. The id list is already
  passed by `mark-lesson.js` (Lesson 5's fix), so the twins cannot inflate it. **Nothing to do**, but check it: with
  two marks riding along there are now up to 58 stray ids in the record instead of 29, so if that fix were ever
  reverted this is the lesson where it would be obvious.
- `setDone(6, true)` when **part 2** is ready: four fifths of the 29 at `target` 3, nothing missed still shaky.
  Not when part 2 is merely opened.

`shell.js` needs the lesson row (`href`, `built`, `progress: 'drill'`, `cp: 0x064F`) and nothing else — `cp` is
what makes the home count only this lesson's own items.
