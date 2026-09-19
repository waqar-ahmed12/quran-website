# 07 — The options panel

`site/qaida/qaida-options.js` is **temporary** — it is deleted at step 13 along with the TRYOUT block of
`qaida.css`. Until then it is how the user chooses, because of their standing rule:

> **Never ask a look-and-feel question in words. Build the choices as buttons on the page and let them look.**

It also generates a text field for every line of wording automatically (`05-wording.md`).

## 1. Export / Import — already there

Added 2026-09-19. Every stateful control registers itself under `"<section> :: <label>"`, **Export settings** turns
the lot into one block of JSON and copies it, **Import settings** reads that block back and applies it. That is how
the user's picks reach `setting.txt`, and how someone else's picks can be checked here.

**What this means for you:** a row built with `option()`, `slider()` or `text()` is exported and imported with no
extra work. A row built with `actions()` holds no state and is correctly not exported. **So build every Lesson 2
choice as an `option`, `slider` or `text`** — if you invent a control that writes straight to the DOM, it silently
falls out of the user's settings file.

Two things to know:

- Nothing in this panel survives a reload except `grouping`. **Export before reloading.**
- The **Words** section is named per page — `Words (lesson 1)`, `Words (lesson 2)`, `Words (home)` — so one
  exported block can hold several pages without the home's "Page title" landing on the lesson's. `Script and names`
  stays unnamed on purpose: it really is one setting for both pages.

## 2. The `window.qaida` contract

`qaida-options.js` reads `window.qaida` on a lesson page and `window.qaidaHome` on the home. Its lesson block
currently assumes Lesson 1: `lesson.peekMs`, `lesson.setPeek`, `lesson.replay`, `lesson.seeAll`, `lesson.clear`.
Lesson 2 publishing `window.qaida` without those would raise a letter-tile panel with a `NaN` slider.

**Use a `kind` discriminator, not stubs.**

- `qaida.js:236` — `window.qaida` gains `kind: 'letters'`.
- `qaida-options.js` — the lesson block's `if (lesson)` becomes `if (lesson && lesson.kind !== 'drill')`, and a new
  `if (lesson && lesson.kind === 'drill')` block is added beside it.

Stubbing `peekMs` and `seeAll` on Lesson 2 would leave this file untouched but show the teacher controls that do
nothing — worse than one edit to a file that is deleted at step 13 anyway.

What `lesson-2.js` must publish:

```js
window.qaida = {
  kind: 'drill',        // required by the gate above
  render,               // required — qaida-options.js's redraw() calls it
  replay,               // re-run the arrival animation
  clear,                // shell.clearLesson(2) + redraw
  setFormat(id),        // 'glyph' | 'name' | 'mix' | 'sound'
  setChoices(n), setTarget(n), setReadyAt(f), setPause(ms),
  next(), again(),
  masterAll(),
  get sound() {},       // how many items have a real recording; the panel disables the sound row at 0
};
```

## 3. The rows

Section **"The drill"** (open):

```js
option('Question', { 'Letter → name': 'glyph', 'Name → letter': 'name', 'Mix both': 'mix', 'Hear it → letter': 'sound' },
       'ask', (v) => lesson.setFormat(v));
option('Choices', { Three: '3', Four: '4', Six: '6' }, 'choices', (v) => lesson.setChoices(Number(v)));
option('Wrong answers offered', { 'A look-alike among them': 'family', 'Any letter': 'any' },
       'distractors', (v) => lesson.set({ familyFirst: v === 'family' }));
option('After a right answer', { 'Move on by itself': 'auto', 'Wait for a tap': 'wait' }, 'advance');
option('After a miss', { 'Offer Trace it': 'trace', 'Just the answer': 'plain' }, 'miss');
option('Choices arrive', { 'One by one': 'stagger', 'All at once': 'all' }, 'arrive', () => lesson.replay());
slider('Right answers needed', 1, 3, 1, 2, (v) => String(v), (v) => lesson.setTarget(v));
slider('Ready at', 0.6, 1, 0.05, 1, (v) => `${Math.round(v * 100)}%`, (v) => lesson.setReadyAt(v));
slider('Pause after a right answer', 0.4, 2.5, 0.1, 0.9, (v) => `${v.toFixed(1)} s`, (v) => lesson.setPause(v * 1000));
actions('Try it', { 'A new question': …, 'Know them all': …, 'Clear progress': …, 'First-visit choice': … });
actions('Sound and tracing', { 'Play the stand-in': …, 'Stop': …, 'Tracing board': … });  // as qaida-options.js's lesson-1 rows
```

**"Ready at"** is the threshold behind decision 1 — how much of the pool must be known before the page says the
student seems ready. It is a slider precisely because it is a teaching judgement, not a look, and the teacher is
the one who should set it.

Section **"Progress and page"** — reuse Lesson 1's rows that still apply: `progress`, `bar`, `track`, `finish`,
`titlemark`, `titlemarkFont`, `bg`, plus `edgeSlider()`, `gapSlider()`, `footSlider()`, and `tiles` and `size`
(which now drive `.choice` too, see `04-page-and-design.md` §3).

Sections **"Script and names"** and **"Words"** are already page-agnostic and need nothing.

## 4. `<html>` attributes `lesson-2.html` must carry

Every `option()` above reads its starting value off `<html>`, so the page's defaults live here:

```
data-tiles="paper" data-size="comfortable" data-ask="glyph" data-choices="4"
data-distractors="family" data-advance="auto" data-miss="trace" data-arrive="stagger"
data-progress="title" data-bar="line" data-track="show" data-finish="settle"
data-titlemark="ba" data-titlemark-font="amiri" data-bg="light"
data-madani-font="amiri" data-indopak-font="noto"
```

## 5. When the user has chosen

Write the chosen values in as the `data-` attributes on `<html>` and the chosen words into the markup. The panel
and the whole TRYOUT block of `qaida.css` are deleted at step 13, together with `recordings.html`.
