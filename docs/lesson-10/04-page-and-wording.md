# 04 — `lesson-10.html` and its wording

**Copy `lesson-8.html`**, then apply this file line by line. Every line of wording keeps its `data-words` field.
After copying, search the file for `alif`, `27`, `29`, `8` and `lesson-8`/`lesson-9` and look at every hit.

## 1. `<html>`

| Attribute | Lesson 8 | Lesson 10 | Why |
|---|---|---|---|
| `data-mark` | `fatha-alif` | `fatha-waw` | |
| `data-board` | `trio` | `quad` | two `against` entries: ب بَ بَا بَوْ, the whole road from bare to "au" (Lesson 6's quartet code). `trio` stays a panel choice |
| `data-arrows` | `all` | `last` | the quartet's rule since Lesson 6 |
| `data-twins` | `alternate` | `alternate` | unchanged — one twin per letter, flipping between parts |
| `data-titlemark` | `baa` | `baa` | unchanged: it is a layout choice for a wide glyph (CSS). The glyph itself is composed from `sample` (`mark-lesson.js`, `marks.glyphOf(mark.sample, mark)`), so it becomes بَوْ with no edit |
| `data-tailfit`, `data-madani-font`, the rest | | unchanged | |

The bar's `aria-valuemax` stays **27**.

## 2. Title and lede

| Field | Zabar set | Fatha set |
|---|---|---|
| Title | Zabar and wow | Fatha and waw |
| Line under it | "A wow with a jazam after zabar: the sound runs on — au." | the same with fatha / waw / sukoon |

The titles already exist in `shell.js`'s Lesson 10 row; the page reads them.

## 3. The board's lines — new or changed

| Line | Text (zabar set) | Shown |
|---|---|---|
| What is new | "The zabar you know, then a wow. Together they say one sound: *au*." | always |
| **The jazam line** — new | "The small mark on the wow is **jazam**. It means the wow has no sound of its own, so it runs into the zabar. You'll meet jazam on every letter in Lesson 14." | always, once, under the feature row. A `{jazam}` token so the fatha set says "sukoon" |
| Joining | Lesson 8's two lines with "alif" → "wow": "Most letters join the wow…", "These five leave it standing apart: د ذ ر ز و" | as in Lesson 8 |
| Left out | "Alif and hamza are not in this table." (Lesson 8's skip note, re-worded) | as in Lesson 8 |
| **Lam-alif note** | — | **never** (the tail is not an alif) |

**"Lesson 14" is a number on the page.** The "no numbers" rule is about scores, not lesson names, but the page's
links use titles rather than numbers. The field makes it one edit either way ("…in a later lesson"). `07` §6.

## 4. Drill wording

Only the item name changes, via the mark's `names`: "Baa with zabar and wow" / "Baa with fatha and waw". Right and
wrong verdicts are Lesson 8's templates, which name what the letter really carries — they already read `{mark}`.

## 5. The Spell block and the ways out

- The Spell block reads `'fatha-waw'` from `spell.js` — no markup change beyond the copy.
- "Previous: Zabar and alif" → **"Previous: Standing harakaat"** (`data-prev-zabar`/`data-prev-fatha` from Lesson
  9's titles), `href="lesson-9.html"`.
- Next: a `<button>` with `data-soon` until Lesson 11 is built, as Lesson 9's was.
- `lesson-9.html` and `exercise-9.html` need no edit — their Next reads `shell.LESSONS`.

## 6. `exercise-10.html`

Copy `exercise-9.html`: `data-mark="fatha-waw"`, "Back to Lesson 10", Next with `data-soon`. Twelve words from
`exercise.js` (`05` §3).
