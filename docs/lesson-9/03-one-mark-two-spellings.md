# 03 — One mark, two spellings: the code

Everything here is a change to a built file. Line numbers are as of 2026-09-28 and will drift; the function names
will not.

## 1. The rows

Three rows in `MARKS` and one in `SETS`, in `marks.js`. The rows go in a **third** `Object.assign`, after the one
holding `'fatha-alif'`, because khari zabar borrows that row's `first` and an object literal cannot read itself
(the same reason Lesson 7's rows are a second statement):

```js
'standing-fatha': {
  id: 'standing-fatha', cp: 0x0670, names: { fatha: 'standing fatha', zabar: 'khari zabar' }, sits: 'above',
  lesson: 9, audio: 'fatha-alif', first: MARKS['fatha-alif'].first, sample: 'ب', against: ['fatha'],
  skip: ['ا', 'ء'], same: 'fatha-alif',
  forms: { madani: { cp: [0x064E, 0x0670] } },
},
'standing-kasra': {
  id: 'standing-kasra', cp: 0x0656, names: { fatha: 'standing kasra', zabar: 'khari zair' }, sits: 'below',
  lesson: 9, audio: 'kasra-yaa', first: ['ه', 'د', 'ت', 'ط', 'ك', 'ف'], sample: 'ه', against: ['kasra'],
  skip: ['ا', 'ء'],
  forms: { madani: { cp: [0x0650], tail: [0x06E6] } },
},
'inverted-damma': {
  id: 'inverted-damma', cp: 0x0657, names: { fatha: 'inverted damma', zabar: 'ulta paish' }, sits: 'above',
  lesson: 9, audio: 'damma-waw', first: ['ب', 'د', 'ر', 'س', 'م', 'ه'], sample: 'ه', against: ['damma'],
  skip: ['ا', 'ء'],
  forms: { madani: { cp: [0x064F], tail: [0x06E5] } },
},
```

```js
standing: {
  id: 'standing', lesson: 9, names: { fatha: 'standing marks', zabar: 'standing harakaat' },
  marks: ['standing-fatha', 'standing-kasra', 'inverted-damma'],
},
```

- **`cp` is the Indo-Pak code point, and it is the id.** One code point per mark, the same in both scripts.
- **`forms`** holds only the script that writes it *differently*. A script with no entry draws `cp` (and `tail`)
  as every row always has. Lessons 4–8 have no `forms`, so nothing about them changes.
- **`audio`**: khari zabar's sound *is* Lesson 8's — "baa" — so it points at `'fatha-alif'` and costs no new
  recordings. The other two are named for the lessons that will share them (`kasra-yaa` is Lesson 13's long ee,
  `damma-waw` Lesson 11's long oo). `07` §6.
- **`same`** is new and read in one place, the board (§7): the mark whose sound this one shares.
- `ه` is `sample` for the two that the Qur'an writes almost only on ه (`02` §5).

`partsOf` and `markAt` need nothing: three marks give four parts, and the last part's rotation over the Madani
order, less ا and ء, lands **8 / 10 / 9** (standing fatha / standing kasra / inverted damma) — about nine each.

## 2. The ids do not change

`suffixOf(mark)` stays exactly as it is: `String.fromCharCode(mark.cp, ...(mark.tail || []))`. It is the **id**
suffix, and it never reads `forms`. So:

- بٰ, and the Madani بَٰ, are both item **`ب` + U+0670**, two characters.
- Its twin بَ is `ب` + U+064E — Lesson 4's id, as every twin has always been.
- Lesson 8's بَا is `ب` + U+064E + U+0627. Nothing collides.
- **A switch of script keeps every letter's credit**, because the id never saw the script.

`shell.js`: Lesson 9's row gains `href: 'lesson-9.html'`, `built: true`, `progress: 'drill'`,
`cp: [0x0670, 0x0656, 0x0657]`. `masteredCount` needs **no change** — its suffix test already takes a list of code
points (Lesson 7's), and none of the three is anyone else's.

## 3. Drawing: `formOf`, and `glyphOf` through it

```js
// Which script is drawn right now. Read from the shell rather than passed in, so a call site that forgets to pass
// it still draws the page's own script (the second thing README.md says is likely to go wrong).
const scriptNow = () => (window.qaidaShell && window.qaidaShell.state.script) || 'madani';

// What a mark looks like in a script: its marks (combining, on the letter) and its tail (letters after it).
const formOf = (mark, script = scriptNow()) => {
  const own = mark.forms && mark.forms[script];
  return {
    cp: own ? own.cp : [mark.cp],
    tail: own ? own.tail || [] : mark.tail || [],
  };
};
const drawnOf = (mark, script) => {
  const f = formOf(mark, script);
  return String.fromCharCode(...f.cp, ...f.tail);
};
const glyphOf = (letter, mark, script) => letter + drawnOf(mark, script);
const aloneOf = (mark, script) => String.fromCharCode(0x25CC) + drawnOf(mark, script);
```

For every mark without `forms`, `drawnOf(mark) === suffixOf(mark)`, character for character — **that equality is
the first check written** (`06` §2, step 1). Export `formOf` and `drawnOf`.

`glyphOf` already has four callers outside `marks.js` — `mark-lesson.js`, `spell.js`, `exercise.js`, `audio.js` —
and none of them needs to change: they draw the page's script without being told.

One thing does need care: **everything that caches a glyph must re-read it on a change of script.** `allItems`
builds `item.glyph` once. Find where `mark-lesson.js` rebuilds its items on `shell.onChange` (it must already, for
ک ہ ی) and confirm the rebuild covers a script change on this page; `qaida-lesson9-check.js` switches script and
reads a tile.

## 4. The tile

`mark-lesson.js`, `markTile`:

- `data-tail` becomes `formOf(strokeOf).tail.length > 0` instead of `Boolean(strokeOf.tail)`. So the Madani khari
  zair and ulta paish get Lesson 8's wide tile (the small yaa and waw take room after the letter), and the Indo-Pak
  ones do not. Lesson 8 is unchanged: its `tail` is its form's tail.
- The tint mode's span holds `drawnOf(strokeOf)` instead of `suffixOf(strokeOf)`.
- `data-id` keeps `suffixOf` — it is the id.

`qaida.css`: nothing new is expected. The khari zair sits below, so a row holding one gets the whole row's
below-sitting height from Lesson 8's step-0 rule (`.pair:has(.mark-tile[data-sits='below']) .mark-tile`). The
Madani khari zabar is the tallest stack yet (`02` §3.1): **if it clips at the top**, add the mirror rule — a
`data-sits='above-tall'` on the tile when the form has more than one mark above, and the same one-height-per-row
treatment. Measure first; do not add it blind.

## 5. The halo

`markBox` and its comment already say the ring should circle **what this lesson added**, not everything that
changed. Generalise `head` from Lesson 8's special case:

```js
const f = marks.formOf(mark);
const tailed = f.tail.length > 0;
const head = tailed
  ? letter + String.fromCharCode(...f.cp) + String.fromCharCode(0x200D) // Lesson 8's rule, unchanged
  : letter + String.fromCharCode(...f.cp.slice(0, -1));                 // everything but the last mark
```

| Lesson | form | head | the ring circles |
|---|---|---|---|
| 4–7 | `[cp]` | the letter | the mark — as today |
| 8 | `[064E]` + tail `[0627]` | letter + zabar + joiner | the alif — as today |
| 9, Indo-Pak | `[0670]` | the letter | the standing mark |
| 9, Madani khari zabar | `[064E, 0670]` | letter + zabar | the small alif, not the zabar |
| 9, Madani khari zair / ulta paish | `[0650]` + tail `[06E6]` | letter + zair + joiner | the small yaa / waw |

**The cache key gains the script**: `${letter}|${spec}|${mark.id}|${script}`. The spec (the font) usually differs
between scripts, but not when the teacher sets Indo-Pak lettering to Scheherazade New — the same face as Madani's —
and then ب with the same mark id would hit the other script's box.

## 6. Twins: no change

`twinMarksFor` already does exactly this lesson: in a warm-up, the single counterpart from `against` (khari zabar
against zabar); in the last part, the other two marks of the set. `twinsFor`, `reviewKeys` and `reviewPlan` need
nothing. The one thing to prove is the negative: **no Lesson 9 question ever offers a Lesson 8 item** (`01` §3).
Nothing builds one today; the check makes sure nothing starts to.

## 7. The board

- **Trio, then quartet** — Lesson 7's board unchanged: ب بَ بٰ in part 1, ب بِ بٖ, ب بُ بٗ, then ب and all three
  in part 4 (`data-board` as `lesson-7.html` has it).
- **The same-sound tile, new.** On the feature row only, when the open part's mark has `same`, one more cell after
  the marked one: Lesson 8's glyph (بَا), captioned from a new field — *"The same sound: {name} with zabar and
  alif"* — joined by an `=` sign in place of the arrow (a new `EQUALS` beside `ARROW`, `aria-hidden`). It is a
  plain `pair-cell` of kind `same`: a tile with `data-tail`, no halo, and **not an answer anywhere**. Only part 1
  shows it; lessons 11 and 13 will give their rows `same` pointing back here.
- **The joined block is switched off** for this lesson (`data-joined="off"` on the board, read in `renderBoard`).
  "The same letter twice" does not work for the Madani small yaa and waw, which do not join (`joinedOf` would draw
  two separate letters), and the walkthrough right below shows these marks in real joined words — a better picture
  than a letter beside itself.
- **"Where you will meet it"**, new, one line per mark in its warm-up part (`02` §5): three text fields,
  `data-met-standing-fatha` and so on, in the place the joined block was.
- **A Madani note**, shown only when the script is Madani: *"In the Madani mushaf this is written as {mark} with a
  small alif after it"* — one field per mark. It is the line that stops a student who switches script from
  thinking the lesson changed.

## 8. Audio and the recording list

`audio.js`: `groups()` must **not list a kind twice** — khari zabar and Lesson 8 share `'fatha-alif'`. Skip a
`kind` already pushed. `markForKind('fatha-alif')` finds Lesson 8's row first, which is right: the list shows بَا
beside "Baa with fatha and alif", the recording both lessons play.

`manifest.json` gains `"kasra-yaa": {}` and `"damma-waw": {}`. `recordings.html` should then list **54 new rows**,
not 81.

## 9. What does not change

`practice.js`, `shell.masteredCount`, `suffixOf`, `partsOf`, `markAt`, `twinMarksFor`, `twinsFor`, `reviewKeys`,
`trace.js`, `voice.js`, `voice-store.js`, `home.js`, `index.html`.
