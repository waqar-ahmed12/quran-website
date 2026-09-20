# 03 — The pool, the bands, and the formats

**`practice.js` does not change.** Not one line. Lesson 3's bands, which look like stage machinery, fall out of the
`required` flag the engine already has. If you are about to add a `stage` or `band` option to the engine, stop and
read §2.

## 1. The item

One item per **new shape** (`01-what-it-teaches.md` §3), built from `shell.lettersOf()` and the class table in
`02-the-forms.md` §2.

```js
{
  id:        'ه:medial',                 // shell.keyOf(glyph) + ':' + position. Stable across scripts.
  glyph:     '\u200Dه\u200D',            // the ZWJ form, in the student's chosen script
  name:      'Haa, middle of a word',    // the answer in words, LTR. Built from the letter's name + the position
  family:    ['pos:medial', 'band:4', 'look3'],
  audio:     { kind: 'letters', glyph: 'ه' },   // the LETTER's recording; there is no recording of a shape
  required:  false,                      // true only for the current band — see §2
  traceable: true,                       // but trace the isolated letter, not the ZWJ form — see §4
  base:      'ه',                        // lesson-only field; the engine ignores it. Used by trace and the board
  position:  'medial',                   // lesson-only field
}
```

**`name` is built, not typed.** `fill(positionLine, { name })` from three templates in `05-wording.md` —
`'{name}, on its own'`, `'{name}, start of a word'`, and so on — so editing a letter's name in the options panel
updates 68 item names at once, and the fatha/zabar name set is respected for free.

**`audio` points at the letter, not the shape.** There will never be a recording of "medial haa"; a letter sounds
the same wherever it sits, which is itself worth the student knowing. `qaidaAudio.has()` is asked about the base
letter, exactly as Lesson 2 does, and the sound format opens for a form as soon as its letter is recorded.

## 2. The bands, with no engine change

**The pool is always all 68 items. The band decides which ones are `required`.**

```js
function poolFor(band) {
  return allItems().map((item) => ({ ...item, required: item.band === band }));
}
```

That single line buys every behaviour the bands need, because of what the engine already does:

| What the band needs | What the engine already does |
|---|---|
| Only this band's forms count towards finishing | `progress()` counts `items.filter(isRequired)` (`practice.js:76`) |
| "You seem ready" fires per band | `readyAt` is measured against the required items only |
| Earlier and later bands stay in the mix | a non-required item still gets drawn, at `×0.5` weight (`practice.js:125`) |
| A repeatedly-missed form is only *advised* about if it is this band's business | `struggling()` filters on `isRequired` (`practice.js:338`) |
| Changing band keeps everything learnt | mastery is stored per `id` by `shell`, and `setItems` keeps it (`practice.js:343`) |

So moving to the next band is **`drill.setItems(poolFor(next))`** and nothing else.

**The ×0.5 review weight is the reason band 5 works.** By the time the student reaches the table, every form has
been in the draw for the whole lesson, so band 5 has nothing left to teach and is correctly a reference board rather
than a drill.

### The one wart: `total` on the home page

`writeTotal()` (`practice.js:88`) writes `items.filter(isRequired).length`, so after `setItems` the stored
`drill.total` is the **current band's** size — 36 while band 3 is open. The home reads `drillOf(3).total` to draw
its card, and would show "12 of 36" for a lesson of 68 forms.

**Fix it in the page, not the engine.** After every `start()` and every `setItems()`, re-assert the whole-lesson
total through the exported shell function:

```js
shell.setDrillTotal(LESSON, ALL_ITEMS.length, drill.settings.target);
```

Then the two numbers mean two honest things, and each is labelled as such in `05-wording.md`:

- **`drill.progress()`** — this band. Drives the band line and the "ready" moment.
- **`shell.masteredCount(3, target)` / `ALL_ITEMS.length`** — the whole lesson. Drives the lesson progress bar and
  the home card.

Do **not** "fix" this by adding a `countTotal` option to the engine. It is one line in the page, and the engine
stays a thing that knows only about the pool it was handed.

## 3. The formats

Three, in preference order. The first is new to Lesson 3; the other two are Lesson 2's, re-pointed.

| id | prompt | choices | when |
|---|---|---|---|
| **`form-to-name`** | the joined form, large, `lang="ar" dir="rtl"` | four names-with-position, LTR | **default.** `minStreak: 0` |
| `name-to-form` | the name and position, in Jost | four joined forms, as tiles | `minStreak: 1` |
| `sound-to-form` | a Play button and the letter's recording | four joined forms, as tiles | `available:` the base letter is recorded |

These are **exactly** Lesson 2's `glyph-to-name` / `name-to-glyph` / `sound-to-glyph` descriptors with different
items behind them — `ask: 'glyph'` renders `item.glyph`, which here happens to be a ZWJ form. Copy the three
descriptors from `lesson-2.js:93-95` and change only their ids.

**`minStreak: 1` on the reverse format** does the same job as in Lesson 2: a shape is recognised before it is
recalled, per form, with no extra machinery.

**`sound-to-form` is weaker here than in Lesson 2 and that is fine.** Hearing "haa" narrows the answer to the four
forms of haa, not to one of them — so when the distractors are all the same letter it is unanswerable. Guard it:
`available` returns false unless the pool can supply distractors from *other* letters. In practice `familyFirst`
already prefers a same-`pos:` sibling, so set this format's availability to require a recording **and** leave it
switched off by default in the options panel until the teacher has heard it. Listed in `09-open-questions.md`.

## 4. Families — what counts as a look-alike

`family` carries three kinds of tag, and an item may hold all three:

| Tag | Example | Why |
|---|---|---|
| `pos:<position>` | `pos:medial` | the sharpest distractor in this lesson: **the same position, a different letter**. ـبـ against ـتـ against ـنـ |
| `band:<n>` | `band:4` | keeps a wrong answer inside the difficulty the student is working at |
| `look<n>` | `look3` | the teacher's look-alike table, reused from Lesson 2 unchanged |

`familyFirst` guarantees **one** distractor from a shared tag, as in Lesson 2, and for the same reason: a question
whose four choices are all the same letter in four positions teaches the student to compare rather than to know.

**The other-forms-of-the-same-letter question is deliberately not the default.** "Which of these is *medial* haa?"
with all four haa forms offered is a good question and a harder one. It is built as an options-panel row
(`07-options-panel.md`, "Wrong answers offered" gains a third value, `same-letter`) so the teacher can look at both
and choose, rather than being asked to picture it in words.

## 5. Progress, and what "finished" means

`setDone(3, true)` fires when **band 5 is reached**, not when every form is mastered — consistent with
`docs/lesson-2/01-what-it-teaches.md` decision 1, where finishing is a recommendation. Reaching the table means the
student has been through all four drilling bands at `readyAt`; holding the lesson open until 68 forms are each
right three times running would be the gate the user explicitly rejected.

The drill stays open and keeps working afterwards. Practice is never taken away.
