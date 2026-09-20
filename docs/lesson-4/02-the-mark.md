# 02 — The mark, and the table lessons 4 to 6 share

## 1. `marks.js` — the data layer

The same shape as `shapes.js` (Lesson 3): a bare IIFE publishing `window.qaidaMarks`, **no DOM and no storage**, so
`tools/qaida-check.js` can load it in node and check the items, the ids and the group arithmetic without a browser.

It is written for **all** the mark lessons from the start, because lessons 5, 6, 7, 9 and 14 are the same lesson
with a different stroke. Lesson 4 fills in one row and uses it; lessons 5 and 6 fill in two more and change nothing
else.

```js
const MARKS = {
  fatha: {
    id:     'fatha',
    cp:     0x064E,                        // ARABIC FATHA
    names:  { fatha: 'fatha', zabar: 'zabar' },   // keyed by shell.state.names
    sits:   'above',                       // where it sits on the letter — drives the board's arrow and the wording
    lesson: 4,
    audio:  'fatha',                       // the manifest group; never the student's chosen name
  },
  kasra: { id: 'kasra', cp: 0x0650, names: { fatha: 'kasra', zabar: 'zair'  }, sits: 'below', lesson: 5, audio: 'kasra' },
  damma: { id: 'damma', cp: 0x064F, names: { fatha: 'damma', zabar: 'paish' }, sits: 'above', lesson: 6, audio: 'damma' },
};
```

**The mark is composed, never pasted.** Exactly the rule `shapes.js` follows for U+200D, and for the same reason:

```js
const MARK = String.fromCharCode(mark.cp);   // yes
const MARK = 'َ';                             // no — invisible in every editor, diff and code review
```

A combining mark pasted into source is indistinguishable from nothing at all. It survives one careless edit and
then silently disappears, and the bug looks like a font problem. Compose it.

**The mark's name comes from two places and they must not be confused:**

| Use | Source | Example |
|---|---|---|
| what the **student** reads | `mark.names[shell.state.names]` | `zabar` or `fatha` |
| what the **manifest** is keyed by | `mark.audio` | always `fatha` |

The recordings are global and the name set is per student. A manifest keyed by "zabar" would need renaming the day
someone switches, which is a bug waiting in a JSON file.

## 2. The item glyph

`letter + MARK`, in that order — the base character first, the combining mark after it. Unicode renders the mark
above or below the letter according to its own class; nothing in the page positions it.

```js
const glyphOf = (letter, mark) => letter + String.fromCharCode(mark.cp);
```

Two characters, so `id` is two characters and well inside `shell.js`'s 24-character cap
(`shell.js:160`). `docs/lesson-2/02-practice-engine.md` §2 already predicted this id:

> Lesson 4 would build `id: shell.keyOf(base) + 'َ'`.

Which gives, per letter: `id: shell.keyOf(glyph) + MARK`, and `glyph: glyph + MARK` in the student's own script. As
in Lesson 3, **the id folds to Madani and the glyph does not**, so a student who learns بَ in Indo-Pak keeps the
credit after switching, and ک ہ ی fold onto ك ه ي for free through `shell.keyOf`.

## 3. Per script

U+064E is **the same codepoint in both scripts**. There is no Indo-Pak fatha and no Madani fatha; there is one
character drawn differently by two faces. So, unlike Lesson 3's positional forms, Lesson 4 needs no per-script
data at all — only the letters change, and `shell.lettersOf()` already handles that.

What *does* differ is how it is drawn: an Indo-Pak mushaf face slants the stroke and sets it closer to the letter
than a Naskh face does. **The Indo-Pak face is still a stand-in** (Noto Naskh Arabic; a licensed Indo-Pak face such
as KFGQPC IndoPak is a launch blocker, `QAIDA-CONTENT.md`), so what a student sees under `data-script="indopak"` is
not yet what a printed Indo-Pak Qaida shows. That is a font problem, not a data problem, and it is already on the
record.

Later marks are not so lucky: **standing harakaat (lesson 9) and tanween (lesson 7) really are written differently
in the two scripts**, and `MARKS` will need a per-script `cp` then. Leave room for it — a `cp` that may be an
object — but do not build it now.

## 4. The letters that need watching

Every one of these is a **look at it in a browser** item, not a code item. They are on the checklist in
`08-files-and-steps.md` §4.

| Letter | What to watch |
|---|---|
| **ا** | اَ. Alif is a bare vertical stroke; the mark sits beside the top of it and can look detached |
| **ء** | ءَ. Hamzah on its own with a mark. In a printed Qaida hamzah normally sits on a seat (أَ) — `09` §4 |
| **ت ث ن خ ذ ز ض ظ غ ف ق** | the mark sits **above the dots**, which crowds in some faces at small sizes |
| **ط ظ** | the mark lands beside a tall vertical stroke; check it does not collide |
| **ہ / ه** | the Indo-Pak ہ is a different shape; check the mark sits over the body, not the tail |
| **ک / ك** | kaaf's upstroke reaches the mark's height |
| **ج ح خ ع غ م ي** | these hang *below* the line (the problem step 1 and step 3 both hit). The mark is above, so the tile needs room at **both** ends |

## 5. What the student is shown, per item

```js
{
  id:        'بَ',                    // keyOf(letter) + MARK  — stable across scripts
  glyph:     'بَ',                    // the chosen script's letter + MARK
  base:      'ب',                     // lesson-only. The tracer, the audio lookup and the bare/marked pair use it
  letterName:'Baa',                   // lesson-only. From shell.lettersOf()
  markName:  'zabar',                 // lesson-only. From mark.names[shell.state.names]
  name:      'Baa with zabar',        // built from a template — 05-wording.md
  marked:    true,                    // lesson-only. false for the bare review items
}
```

`base` matters more here than it did in Lesson 3. It is what the tracer opens (a student writes the letter and
adds the mark; `06-accessibility.md` §4), what `qaidaAudio` is asked about, and what pairs بَ with ب when the
review items are built.

## 6. What `marks.js` publishes

```js
window.qaidaMarks = {
  MARKS,                         // the table above
  markOf(id),                    // 'fatha' -> the row, or null
  nameOf(mark, shell),           // the student's word for it: 'zabar' | 'fatha'
  glyphOf(letter, mark),         // letter + String.fromCharCode(mark.cp)
  allItems(shell, mark, opts),   // the 29 marked items, in the chosen script
  reviewItems(shell, mark, opts),// the bare letters that ride along — 03 §3
  poolFor(items, group),         // required: true for this group's letters (Lesson 3's one-liner)
  GROUPS, groupOf(key), sizes, stats,   // the rail, measured the way the engine measures
  boardRows(shell, mark, group), sampleOf(shell, group),
  rename(items, shell, templates),      // the names or the mark set changed; keep the items, rebuild the words
};
```

Every one of these except `MARKS`, `markOf`, `nameOf` and `glyphOf` is `shapes.js`'s function with the same name
and the same contract. Read `shapes.js` before writing any of them — the group arithmetic, the `stats` rule and the
`rename` trick are all worth copying exactly rather than reinventing.
