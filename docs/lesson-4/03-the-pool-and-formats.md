# 03 — The pool, the review, and the formats

**`practice.js` does not change.** Not one line — for the third lesson running. Everything Lesson 4 needs already
exists: `required` gives it groups, `family` gives it the bare/marked contrast, `available()` gives it the sound
format that switches itself on. If you are about to add a `mark` option to the engine, stop and read §2 and §3.

## 1. The item

Built from `shell.lettersOf()` and the mark row (`02-the-mark.md` §5):

```js
{
  id:        'بَ',                      // keyOf(letter) + the mark. Stable across scripts
  glyph:     'بَ',                      // the chosen script's letter + the mark
  name:      'Baa with zabar',          // built from a template, never typed — 05-wording.md
  family:    ['look1'],                 // the look-alike letters. See §4
  audio:     { kind: 'fatha', glyph: 'ب' },   // the MARK's recording group, keyed by the base letter
  required:  true,                      // this group's letters — see §2
  traceable: true,
  base:      'ب', letterName: 'Baa', markName: 'zabar', marked: true,   // lesson-only fields
}
```

**`name` is built, not typed.** `fill('{name} with {mark}', { name: 'Baa', mark: 'zabar' })`. One template in the
options panel, and 29 item names follow — and the student's choice of name set is respected for free, because
`{mark}` comes from `marks.nameOf()`. Lesson 3 proved this pattern on 68 names; do not hand-write 29.

**`audio.kind` is the mark's group, not `'letters'`.** `audio/manifest.json` gains a `"fatha"` group beside
`"letters"`, keyed by the base letter, holding a recording of the **sound** "ba" — not the letter's name "Baa".
`audio.js`'s `fileFor(kind, glyph)` already takes an arbitrary kind and already folds ک ہ ی, so **`audio.js` needs
no change for playback**; it needs one for the recordings page (`08-files-and-steps.md` §1).

## 2. The groups, with no engine change

Lesson 3's one-liner, unchanged:

```js
const poolFor = (items, group) => items.map((item) => ({ ...item, required: GROUPS[group].has(item.id) }));
```

Group 1's set is six letters; group 2's is all 29. `docs/lesson-3/03-the-pool-and-formats.md` §2 has the table of
what this buys from the engine for free — per-group readiness, earlier items staying in the mix at ×0.5, mastery
surviving the move — and every line of it applies here.

**The same wart, the same fix.** `writeTotal()` stores `items.filter(isRequired).length`, so while group 1 is open
the stored `drill.total` is 6 and the home would draw "3 of 6" for a lesson of 29. After every `start()` and every
`setItems()`, re-assert the whole-lesson total through the shell:

```js
shell.setDrillTotal(LESSON, MARKED_ITEMS.length, drill.settings.target);
```

Then the group line and the lesson bar each mean one honest thing. **Review items are never counted in either** —
they are not `required`, so `progress().total` ignores them, and `MARKED_ITEMS` is the 29 by construction.

## 3. Mixed review — the part that is load-bearing

`01-what-it-teaches.md` decision 2: the bare letters are both the review **and** the only thing that makes "does
this carry zabar?" a real question.

```js
function reviewItems(shell, mark, { count = 8, from = 2 } = {}) {
  // The letters this student actually found hard in Lesson 2, hardest first; then a spread across the
  // shape families, so a student who skipped Lesson 2 still gets a fair sample.
  // Each is a bare letter: no mark, marked: false, required: false, id = shell.keyOf(glyph).
}
```

| Field | Value | Why |
|---|---|---|
| `id` | `shell.keyOf(glyph)` — `'ب'` | **No mark in the id**, so it can never collide with `'بَ'` |
| `name` | `'Baa'` | Lesson 2's name, so the two choices differ by exactly the words that matter |
| `family` | `['letter:ب', …look tags]` | pairs it with its own marked twin — §4 |
| `required` | `false` | the user's rule: review is never the gate |
| `audio` | `{ kind: 'letters', glyph: 'ب' }` | the letter's *name*, which is what Lesson 2 recorded |

**Mastery of a review item is stored under lesson 4, not lesson 2.** `shell.recordAnswer(4, 'ب', …)` writes into
lesson 4's own record; Lesson 2's numbers are read once, to choose the sample, and never written. That is correct:
a review item's streak is not a claim about Lesson 2, and letting Lesson 4 edit Lesson 2's progress bar would make
the home page move for reasons the student cannot see.

**The count is a slider**, default 8 (`07-options-panel.md` §3). At 8 review items among 29 required, review is
roughly one question in eight — enough to keep the contrast alive, not enough to make the lesson feel like Lesson 2
again. **At zero, skill A stops being testable**, and the options row says so on itself.

## 4. Families — what a wrong answer should be

Two tags, and an item may hold both:

| Tag | Example | What it tests |
|---|---|---|
| `look<n>` | `look1` | **the letter.** The look-alike table Lesson 2 already carries (ب ت ث ن ي, ج ح خ ع غ, …): بَ against تَ |
| `letter:<key>` | `letter:ب` | **the mark.** بَ against bare ب — the same letter, one of them marked |

`familyFirst` guarantees **one** distractor shares a tag (`practice.js`, and note `sharesFamily` is `some` /
`includes` — `docs/lesson-3/README.md` "as built" §6: *which* tag is not controllable by ordering the array, only
by which tags exist). So the options row chooses by **emitting different tags**, not by reordering:

| Row value | Tags emitted | The question becomes |
|---|---|---|
| `look-alike` (default) | `look<n>` only | "which letter is this?" — the mark is constant, so it is about the letter |
| `mark-or-not` | `letter:<key>` only | "does this one carry the mark?" — needs review items in the pool |
| `any` | none, and `familyFirst: false` | uniform draw |

**`look-alike` is the default** because a beginner's first failure at this stage is still misreading the letter,
and because `mark-or-not` is only as good as the review slider, which the teacher may turn down. Both are one
click apart in the panel, which is how the user decides such things.

## 5. The formats

Four, in preference order. The first two are Lesson 2's with new items behind them; the third is new; the fourth
is the one that matters and cannot be switched on yet.

| id | prompt | choices | when |
|---|---|---|---|
| **`mark-to-name`** | بَ, large, `lang="ar" dir="rtl"` | four names, LTR | **default.** `minStreak: 0` |
| `name-to-mark` | "Baa with zabar", in Jost | four glyphs, as tiles | `minStreak: 1` |
| `spot-the-mark` | "Which one carries zabar?" | one marked glyph, three bare | falls out of `name-to-mark` + `mark-or-not` — see below |
| `sound-to-mark` | a Play button and the recording of **"ba"** | four glyphs, as tiles | `available:` the base letter has a **`fatha`** recording. **Off by default: there are none** |

**`spot-the-mark` is not a fourth descriptor.** It is `name-to-mark` with the `mark-or-not` distractors and a
different question line. Writing it as its own format would mean a fourth thing to keep in step; writing it as a
wording change on an existing one costs a `data-` attribute. `05-wording.md` carries the line.

**`sound-to-mark` is the only format that tests what the lesson is for** (`01-what-it-teaches.md` §2, skill C). It
is built now, guarded by `available()` exactly as Lesson 2's sound format is, so it is dead weight — no dead
questions, no special cases — until the teacher records the syllables, and then it is one switch. **The stand-in
hum is never a prompt**: an unanswerable question is worse than no question (`docs/lesson-2/02-practice-engine.md`
§3), so `available()` requires a real file in the `fatha` group, not `qaidaAudio`'s fallback.

Count the real recordings after `qaidaAudio.ready` resolves — the manifest arrives after first paint, exactly as
`qaida.js:233` and both earlier lessons do.

## 6. Progress, and what "finished" means

- **`drill.progress()`** — the open group. Drives the group line on the rail and the "you seem to know these"
  moment.
- **`shell.masteredCount(4, target) / 29`** — the whole lesson. Drives the bar and the home card.

`setDone(4, true)` fires when **group 2 is ready**: four fifths of the 29 known at `target` 3, with no missed item
still shaky (`clean`). It is a recommendation, not a gate — the drill stays open and Lesson 5 opens whether or not
it ever fires.

**Do not fire it when group 2 is merely opened.** Lesson 3 hit this: a student who opens the last group from a
standing start would finish a lesson having learnt nothing (`docs/lesson-3/README.md` "as built" §5).
