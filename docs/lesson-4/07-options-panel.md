# 07 — The options panel

`site/qaida/qaida-options.js` is **temporary** — deleted at step 13 with the TRYOUT block of `qaida.css` and
`recordings.html`. Until then it is how the user chooses, because of their standing rule:

> **Never ask a look-and-feel question in words. Build the choices as buttons on the page and let them look.**

## 1. Lesson 4 is a `drill` page

`qaida-options.js` branches on `window.qaida.kind`. Lesson 4 publishes **`kind: 'drill'`**, so it gets Lesson 2's
drill block for free — Question, Choices, Wrong answers offered, After a right answer, After a miss, Choices
arrive, Right answers needed, Ready at, Pause, and the two `actions` rows.

**Every stateful row must be an `option()`, `slider()` or `text()`**, never a bare DOM write, or it silently falls
out of Export settings and never reaches `setting.txt`.

The Words section is named `Words (lesson 4)`, and lessons 5 and 6 will be `Words (lesson 5)` and
`Words (lesson 6)` — which is why the per-page naming exists.

## 2. What `mark-lesson.js` publishes

Lesson 3's surface, with `band` renamed and two rows of its own:

```js
window.qaida = {
  kind: 'drill',          // required — gets the whole drill block
  render, replay, clear,  // required
  setFormat(id),          // 'mark' | 'name' | 'mix' | 'sound'
  setChoices(n), setTarget(n), setReadyAt(f), setPause(ms),
  next(), again(), masterAll(),
  get sound() {},         // letters with a real recording in THIS lesson's manifest group

  // the mark lessons' own
  get group() {},         // 1 | 2
  setGroup(n),            // moves the drill and the board; no lock, so any n works
  groupCosts(),           // [{ n, items, answers }, …] — so the panel can print what a part asks for
  setReview(n),           // how many bare letters ride along. 0 = none
  setDistractors(v),      // 'look-alike' | 'mark-or-not' | 'any'
};
```

`groupCosts()` is Lesson 3's `bandTotals()` with the arithmetic done for the teacher instead of left to them
(`docs/lesson-3/README.md` "as built" §11). **Print the numbers in the panel** — that is what settles
`09-open-questions.md` §2.

## 3. The new rows

Section **"The mark"**, open, placed above Lesson 2's "The drill" section.

```js
option('Part', { 'Meet the mark': '1', 'All the letters': '2' }, 'group',
       (v) => lesson.setGroup(Number(v)));

slider('Letters from before', 0, 16, 1, 'review',
       (n) => lesson.setReview(n));            // default 8 — see the note below

option('Wrong answers offered', { 'A letter that looks like it': 'look-alike',
                                  'The same letter, with and without the mark': 'mark-or-not',
                                  'Any letter': 'any' }, 'distractors',
       (v) => lesson.setDistractors(v));

option('The board shows', { 'The pairs': 'pairs', 'Just the marked letters': 'marked' }, 'board');

option('Point at the mark', { 'A halo': 'halo', 'Nothing': 'none', 'Tint it': 'tint' }, 'point');
```

**"Letters from before" is the row that decides whether half the lesson works.** It is the mixed review
(`03-the-pool-and-formats.md` §3) and it is also where every "does this carry the mark?" wrong answer comes from.
Put that sentence on the row as its hint, and **grey out "The same letter, with and without the mark"** when the
slider is at 0, rather than letting the teacher pick a combination that produces a drill with no contrast in it.

**"Point at the mark" is a look-at-it row** (`04-page-and-design.md` §3). `tint` is expected to be fragile in at
least one face; it is a row precisely so the teacher can see that rather than be told.

## 4. Rows that must be switched off by default

- **"Question" → "Hear it → the letter"** starts disabled, as in Lessons 2 and 3, because `sound` is 0 until the
  teacher records the syllables. The difference here is that this format is the one the lesson is *for*
  (`03` §5) and the only one a screen reader can use (`06` §2) — so when it is enabled it should become the
  **first** format, not an occasional one. That is a one-line change and it is called out in
  `08-files-and-steps.md` §5.

## 5. Reused rows

Section **"Progress and page"** — Lesson 3's rows apply unchanged: `progress`, `bar`, `track`, `finish`,
`titlemark`, `titlemarkFont`, `bg`, `edgeSlider()`, `gapSlider()`, `footSlider()`, `tiles`, `size`.

Sections **"Script and names"** and **"Words"** are page-agnostic and need nothing — but **"Script and names" is
where the mark name set now visibly matters**, so check that switching it there rewrites the title, the rail, the
board and every item name without a reload (`05-wording.md`).

## 6. `<html>` attributes `lesson-4.html` must carry

Every `option()` reads its starting value off `<html>`, so the defaults live here:

```
data-mark="fatha" data-tiles="paper" data-size="comfortable"
data-group="1" data-review="8" data-distractors="look-alike" data-board="pairs" data-point="halo"
data-ask="mark" data-choices="4" data-advance="auto" data-miss="trace" data-arrive="stagger"
data-progress="title" data-bar="line" data-track="show" data-finish="settle"
data-titlemark="بَ" data-titlemark-font="amiri" data-bg="light"
data-madani-font="amiri" data-indopak-font="noto"
```

**`data-mark` is what makes one page file serve three lessons** (`README.md`). `lesson-5.html` carries
`data-mark="kasra"` and `data-titlemark="بِ"`; `lesson-6.html` carries `data-mark="damma"` and
`data-titlemark="بُ"`. Everything else on those two pages is wording.

## 7. When the user has chosen

Write the chosen values in as the `data-` attributes on `<html>` and the chosen words into the markup. The panel
and the TRYOUT block of `qaida.css` are deleted at step 13.
