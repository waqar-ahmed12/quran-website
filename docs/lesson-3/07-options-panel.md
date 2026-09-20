# 07 — The options panel

`site/qaida/qaida-options.js` is **temporary** — deleted at step 13 with the TRYOUT block of `qaida.css` and
`recordings.html`. Until then it is how the user chooses, because of their standing rule:

> **Never ask a look-and-feel question in words. Build the choices as buttons on the page and let them look.**

## 1. Lesson 3 is a `drill` page

`qaida-options.js` branches on `window.qaida.kind` (`docs/lesson-2/07-options-panel.md` §2). Lesson 3 publishes
**`kind: 'drill'`**, so it gets Lesson 2's drill block for free — Question, Choices, Wrong answers offered, After a
right answer, After a miss, Choices arrive, Right answers needed, Ready at, Pause, and the two `actions` rows.

**Every stateful row must be an `option()`, `slider()` or `text()`**, never a bare DOM write, or it silently falls
out of Export settings and never reaches `setting.txt`.

## 2. What `lesson-3.js` publishes

Lesson 2's surface, plus four rows of its own:

```js
window.qaida = {
  kind: 'drill',          // required — gets the whole drill block
  render, replay, clear,  // required
  setFormat(id),          // 'form' | 'name' | 'mix' | 'sound'
  setChoices(n), setTarget(n), setReadyAt(f), setPause(ms),
  next(), again(), masterAll(),
  get sound() {},         // letters with a real recording

  // Lesson 3's own
  get band() {},          // 1–5
  setBand(n),             // move the drill and the board; no lock, so any n works
  bandTotals(),           // [6, 2, 36, 24, 0] — so the panel can show what a band costs
  setDrilled(which),      // 'new' | 'all' — see §3, the row that matters most
};
```

## 3. The four new rows

Section **"Letter shapes"**, open, placed above Lesson 2's "The drill" section.

```js
option('Group', { One: '1', Two: '2', Three: '3', Four: '4', Five: '5' }, 'band',
       (v) => lesson.setBand(Number(v)));

option('Shapes drilled', { 'Only the new ones': 'new', 'All four positions': 'all' }, 'drilled',
       (v) => lesson.setDrilled(v));

option('Wrong answers offered', { 'Same position, another letter': 'position',
                                  'Another shape of the same letter': 'same-letter',
                                  'Any shape': 'any' }, 'distractors',
       (v) => lesson.set({ familyFirst: v !== 'any' }));

option('The board shows', { 'This group': 'band', 'Every letter': 'all' }, 'board');
```

**"Shapes drilled" is the row that decides whether this lesson is finishable.** `'new'` is
`01-what-it-teaches.md`'s decision 3 — 68 items. `'all'` drills every position of every letter — 101 items, about
242 right answers. It exists so the teacher can see the difference rather than be asked to imagine it, and so
`09-open-questions.md` §1 can be settled by looking. **Default `'new'`.**

**"Wrong answers offered" replaces Lesson 2's two-value row** with three, adding the harder same-letter question
(`03-the-pool-and-formats.md` §4). `'position'` is the default. Note that `'same-letter'` and `'any'` both map to
`familyFirst` plus a change to which tag the lesson puts first in `item.family` — the engine only guarantees *one*
distractor shares *a* tag, so the lesson controls which tag that is by ordering the array.

**"The board shows"** lets the teacher see the full table at any band without moving the drill, which is how they
will want to check the Indo-Pak column.

## 4. Rows that must be switched off by default

- **"Question" → "Hear it → shape"** starts disabled, as in Lesson 2, because `sound` is 0 until recordings arrive.
  It stays *weaker* than Lesson 2's even then (`03-the-pool-and-formats.md` §3), so leave the default at
  `'form'` and let the teacher try it deliberately.

## 5. Reused rows

Section **"Progress and page"** — reuse Lesson 1 and 2's rows that still apply: `progress`, `bar`, `track`,
`finish`, `titlemark`, `titlemarkFont`, `bg`, `edgeSlider()`, `gapSlider()`, `footSlider()`, and `tiles` and `size`,
which now drive the board's form tiles as well as `.choice`.

Sections **"Script and names"** and **"Words"** are already page-agnostic and need nothing. The Words section is
named `Words (lesson 3)`.

## 6. `<html>` attributes `lesson-3.html` must carry

Every `option()` reads its starting value off `<html>`, so the defaults live here:

```
data-tiles="paper" data-size="comfortable" data-band="1" data-drilled="new"
data-board="band" data-ask="form" data-choices="4" data-distractors="position"
data-advance="auto" data-miss="trace" data-arrive="stagger"
data-progress="title" data-bar="line" data-track="show" data-finish="settle"
data-titlemark="ba" data-titlemark-font="amiri" data-bg="light"
data-madani-font="amiri" data-indopak-font="noto"
```

`data-titlemark` is the large letter beside the title. **Use `ـهـ`** (medial haa) rather than a bare letter — it is
the lesson's subject in one glyph, and it is the shape the student will come back for.

## 7. When the user has chosen

Write the chosen values in as the `data-` attributes on `<html>` and the chosen words into the markup. The panel
and the TRYOUT block of `qaida.css` are deleted at step 13.
