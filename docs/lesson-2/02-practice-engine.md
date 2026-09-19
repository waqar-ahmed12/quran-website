# 02 — `practice.js`, the drill engine

The deliverable of step 4. Lessons 4 to 14 are its real customers; Lesson 2 is only the first.

## 1. Shape and load order

A bare IIFE publishing `window.qaidaPractice`, exactly like the other five globals. There is no bundler and no
module system in this project — the files talk through `window`, and `defer` script order is load order.

```
shell.js → audio.js → trace.js → practice.js → lesson-2.js → qaida-options.js
```

**Two hard boundaries. They are the point of the file:**

1. **No DOM.** The engine never creates, reads or writes an element. The page asks it for a question and tells it
   what was answered; everything visible is `lesson-2.js`'s job.
2. **No storage of its own.** It reads and writes progress **through `qaidaShell`** (see `03-storage.md`), and asks
   `qaidaAudio` what recordings exist. It never touches `localStorage` and never knows the key `qaida` exists.

It also must not know that its items are letters. `family` is an opaque tag; `glyph` is a string to display.

Guard clause, matching `qaida.js:6-7`: if `window.qaidaShell` is missing, return without publishing. Tolerate
`window.qaidaAudio` being absent — sound formats simply report themselves unavailable.

## 2. The item

The one object lessons 2 through 14 all speak.

```js
{
  id:       'ا',       // required. Stable, unique-in-pool. Mastery is stored under this.
  glyph:    'ا',       // required. What is shown, in the student's chosen script. Later: 'بَ', or a word.
  name:     'Alif',    // required. The answer in words, LTR.
  family:   'f0',      // optional. Items sharing a family are look-alikes; distractors prefer them.
  audio:    { kind: 'letters', glyph: 'ا' },  // optional. Passed straight to qaidaAudio.play / .has
  required: true,      // optional, default true. false = a review item, not part of the gate.
  traceable: true,     // optional, default Boolean(glyph) && glyph.length <= 2. Offers "Trace it".
}
```

**The engine never transforms `id`.** Folding two glyphs into one identity is the *lesson's* decision, not the
engine's. `lesson-2.js` builds `id: shell.keyOf(glyph)`, exactly as `seen` already folds ک ہ ی onto ك ه ي
(`shell.js:201-205`), so a student who mastered ك keeps the credit after switching to Indo-Pak. Lesson 4 would
build `id: shell.keyOf(base) + 'َ'`. Keep the fold out of the engine and each lesson can decide for itself
when two things are the same thing.

**`required: false`** is decision 2 from `01-what-it-teaches.md`. Lesson 2 sets it on nothing. Build it anyway.

## 3. The format

A format is **data, not a branch**, so lesson 4 can add "see the mark → name it" without editing this file.

```js
{
  id:         'glyph-to-name',
  ask:        'glyph',   // 'glyph' | 'name' | 'sound' — what the prompt shows
  answerWith: 'name',    // 'name'  | 'glyph'          — what the choice buttons show
  minStreak:  0,         // don't use this format on an item until its streak reaches this
  available:  (item) => true,   // per-item gate, re-evaluated for every question
}
```

Lesson 2 ships three, in this preference order:

| id | prompt | choices | when |
|---|---|---|---|
| **`glyph-to-name`** | the letter, large, `lang="ar" dir="rtl"` | four names, LTR | **default.** `minStreak: 0`, always available |
| `name-to-glyph` | the name, in Jost | four letters, as tiles | `minStreak: 1` |
| `sound-to-glyph` | a Play button and the recording | four letters, as tiles | `available: (item) => qaidaAudio.has(item.audio.kind, item.audio.glyph)` |

**`glyph-to-name` is the default** because it is precisely the skill `QAIDA-CONTENT.md` names — naming a letter
cold — and it needs nothing that does not already exist.

**`minStreak: 1` on the reverse format** means recognition always comes before recall, per letter, with no stage or
phase machinery anywhere. It falls out of the descriptor for free.

**The sound format degrades by not existing.** While `audio/manifest.json` holds no real clips, `available()`
returns false for every item and the engine simply never picks it — no special case, no dead question. **The
wordless stand-in hum is never a prompt:** a question whose prompt says nothing is unanswerable, and worse than no
question at all. `sound-to-glyph` requires a real file, not `qaidaAudio`'s fallback. (The hum still plays as
*feedback* after an answer, which is `qaida.js:93`'s existing behaviour and stays.)

`lesson-2.js` counts real recordings after `qaidaAudio.ready` resolves — the manifest arrives after first paint, so
re-check then, exactly as `qaida.js:233` does.

## 4. Public API

```js
window.qaidaPractice = {
  create(options) -> drill    // a factory, not a singleton
};
```

A factory because lessons 5 and 6 will want a core pool and a review pool describable either as one drill or two,
and a factory costs nothing extra now.

### `options`

| key | default | meaning |
|---|---|---|
| `lesson` | — | **required.** The lesson number mastery is stored under. |
| `items` | — | **required.** Array of items (§2). Replaceable later with `setItems`. |
| `formats` | — | **required.** Array of format descriptors (§3), in preference order. |
| `choices` | `4` | buttons per question. Clamped to `[2, 6]` and to the pool size. |
| `target` | `2` | consecutive right answers that master an item. |
| `readyAt` | `1` | fraction of required items that must be known before `ready` fires. `1` = all of them. |
| `strugglingAt` | `3` | lifetime misses on one item before it is reported as struggling. |
| `familyFirst` | `true` | force at least one same-family distractor when one exists. |
| `cooldown` | `2` | questions a just-missed item sits out before it can return. |
| `noRepeatWithin` | `min(3, floor(pool / 3))` | how many recent items are barred from being asked again. |
| `random` | `Math.random` | injectable, so the shuffle can be tested. |
| `on` | `{}` | callbacks, §7. |

### `drill` methods

```js
drill.start()            // read mastery from shell, write drill.total, emit the first question. Idempotent.
drill.question           // getter: the current question, or null
drill.answer(choiceId)   // -> verdict. A second call on the same question returns the same verdict and does nothing.
drill.next()             // advance. No-op while the current question is unanswered.
drill.again()            // re-ask the current item, choices freshly shuffled (options panel only)
drill.progress()         // -> progress object, §8
drill.struggling()       // -> [item, …], required items with lifetime wrong >= strugglingAt and streak < target
drill.setItems(items)    // replace the pool (the script changed). Keeps mastery; drops the current question.
drill.set(partial)       // { choices, target, formats, familyFirst, readyAt } at runtime, for the options panel
drill.masterAll()        // write a full streak for every item (options panel, "Know them all")
drill.reset()            // shell.clearDrill(lesson), then back to question 1
```

### The question

```js
{
  n: 7,                    // question number this session, 1-based
  format,                  // the format descriptor in use
  item,                    // the right answer
  prompt: { mode: 'glyph' | 'name' | 'sound', glyph, name, audio },  // only the fields the mode uses
  choices: [item, …],      // already shuffled into display order; contains `item` exactly once
  answered: false,
}
```

### The verdict

```js
{
  right: true,
  question, item, chosen,  // `chosen` is the item the student picked
  streak: 2,               // this item's new streak
  mastered: true,          // the streak crossed `target` on THIS answer
  unmastered: false,       // a previously-mastered item was just missed
  struggling: false,       // this item has now crossed `strugglingAt`
  ready: false,            // this answer took the lesson over `readyAt`
}
```

## 5. Choosing the next item

**A weighted draw, not a shuffled queue.** This is the direct consequence of decision 1: a queue cannot bring a
missed letter back sooner, which is the whole of what the user asked for.

**Hard exclusions**, applied first:

1. the item asked last — always, except in a pool of one or two;
2. the last `noRepeatWithin` items asked;
3. anything inside its `cooldown` — missed fewer than `cooldown` questions ago. **This is "not in a row."** It
   stops the student answering from the correction still on the screen.

If those three empty the set, drop rule 3, then rule 2, then rule 1, in that order, and draw from what returns.

**Weight**, on what survives:

| condition | factor |
|---|---|
| base | ×1 |
| streak is 0 **and** the item has ever been missed (lifetime `wrong > 0`) | **×4** |
| never asked this session | ×2 |
| streak ≥ `target` (mastered) | ×0.25 |
| `required: false` (a review item) | ×0.5 |

The ×4 is **"increase the frequency."** The ×0.25 is deliberate: a mastered item is still asked, at a quarter
weight, because a drill that stops showing what you know lets it rot — and it keeps the last stretch of the lesson
from being four letters on a loop.

**Choosing the format** for the drawn item: filter `formats` to those whose `available(item)` is true *and* whose
`minStreak <= streak(item)`; pick uniformly from what remains; if nothing remains, fall back to `formats[0]` if it
is available, otherwise draw a different item.

## 6. Distractors

Take the answer's family siblings, minus the answer. If `familyFirst` and at least one exists, **one** distractor
comes from there; fill the rest uniformly from the whole pool.

Exclusions: the answer itself; any duplicate `id`; and **any duplicate of the displayed answer string** — whichever
of `name` or `glyph` this format shows. Two items can legitimately share a glyph in a later lesson, and offering
the same button twice is a bug a student will find in about a minute.

If fewer than `choices - 1` distractors exist the question shrinks. Below two choices, emit `on.error('pool')`
rather than asking an unanswerable question.

**Why one look-alike and not a whole family.** An all-family question turns every answer into counting dots, and
the student learns to *compare* rather than to *know* — the exact failure Lesson 2 exists to catch. The cost is
that some questions come out easier than they could be. That is the right side to err on. It is a tryout either
way (`07-options-panel.md`), so the teacher can look and decide.

**The families themselves.** `shell.familiesOf()` (`shell.js:85-89`) gives ten groups; the rest of the alphabet is
singletons, which would silently degrade to random distractors. So `lesson-2.js` carries a **confusables table**,
merged into the family tag for singletons — Claude's reading of letter *shapes*:

```
ب ت ث ن ي    ج ح خ ع غ    د ذ ر ز و    س ش ص ض    ط ظ    ف ق ك    ل ا    م ه    ء و
```

This is a guess and it belongs to the teacher. Give it its own text field in the options panel, one line,
comma-and-space separated, the way `shell.setNames` works for the letter names. Listed in `10-open-questions.md`.

## 7. Callbacks

Plain functions in `options.on`, matching `shell.onChange`'s style. No `EventTarget`, no bubbling — there is one
consumer per page.

```js
on: {
  question(q),        // a new question is on the board
  verdict(v),         // an answer was judged
  progress(p),        // mastery changed; fires after verdict
  ready(p),           // the pool crossed readyAt. Fires once per session.
  struggling(item),   // an item crossed strugglingAt. Fires once per item per session.
  error(code),        // 'pool' | 'formats'. The lesson shows an honest line, never a broken board.
}
```

`ready` and `struggling` are the two halves of decision 1. The engine only reports; the *wording* and the *way back*
are the page's, in `05-wording.md`.

## 8. Progress

```js
drill.progress() -> {
  total: 29,     // required items in the pool
  known: 17,     // required items with streak >= target
  asked: 41,     // questions this session
  right: 33,     // this session
  wrong: 8,      // this session
  toFix: 3,      // required items with lifetime wrong > 0 and streak < target
  ready: false,  // known / total >= readyAt
}
```

`known` is what the progress bar counts — not questions answered. **It can go down**, because missing a letter you
had mastered un-masters it. That is honest, it is rare (you have to miss something you had twice confirmed), and a
bar that only ever rose would be lying. The alternative, a high-water mark, makes the bar and the recommendation
disagree with each other, which is worse.

## 9. Trade-offs, stated once

1. **One look-alike distractor, not a whole family** — §6. All-family teaches dot-counting; the cost is that some
   questions are easy.
2. **The bar can go backwards** — §8. Honest and rare; the alternative makes the bar and the recommendation
   disagree.
3. **A weighted draw, not a queue** — §5. Costs a little determinism (two students see different question orders);
   buys the "come back more often" the user asked for, which a queue cannot do.
