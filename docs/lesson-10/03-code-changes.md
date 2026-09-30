# 03 — Code changes

This is the only file in this folder with real code in it, and there is little of it: Lesson 8 built the tail and
Lesson 9 built `forms`. **The rule that governs every change:** lessons 4–9 come out identical. If any of
`qaida-marks-check.js`, `qaida-lesson5-check.js` to `qaida-lesson9-check.js` changes its answer, the change was wrong.

## 1. `MARKS` gains one row

Beside `'fatha-alif'`, in the second statement (it reads `MARKS.fatha`):

```js
// Lesson 10 (docs/lesson-10/): zabar, then a wow with a jazam — "au" (leen). The jazam is Lesson 14's mark, carried
// here inside the TAIL as part of the pattern, never as a mark of its own (docs/lesson-10/README.md). `first` is
// zabar's own six, laam included: laam and wow are not a ligature (docs/lesson-10/02 §2). `against` puts Lesson 8's
// zabar-and-alif first — the same shape, a different letter after the zabar (docs/lesson-10/01 §3).
'fatha-waw': {
  id: 'fatha-waw', cp: 0x064E, tail: [0x0648, 0x0652], names: { fatha: 'fatha and waw', zabar: 'zabar and wow' },
  sits: 'above', lesson: 10, audio: 'fatha-waw',
  first: MARKS.fatha.first, sample: 'ب', against: ['fatha-alif', 'fatha'],
  skip: ['ا', 'ء'],
  // forms: { madani: { tail: [0x0648, 0x06E1] } }, — ONLY if 02 §3's measurement says so
},
```

The Arabic letters in `first`/`skip` are keys, as on every other row. **No combining mark anywhere in the file,
comments included** — `qaida-check.js` reads `marks.js` for one, so a composed example in a comment fails it.

**Check first:** does `against` accept a tailed mark (`'fatha-alif'`)? Lesson 9's rows use single marks there.
`twinItems` builds a twin's id with `suffixOf(other)` since Lesson 8, so it should — assert it: every Lesson 10
twin of the first kind is a three-character id ending in U+0627.

## 2. Ids

Unchanged rule, Lesson 9's: **ids come from `suffixOf`, glyphs from `drawnOf`**. `suffixOf` never reads `forms`, so
the id is `key + U+064E U+0648 U+0652` in both scripts even if Madani draws U+06E1. A script switch keeps every
letter's credit — the check switches and counts.

## 3. The tile

`markTile` already writes `data-tail` for a tailed mark. **Measure, then decide:**

1. Open the board's full 27-letter table in the browser pane, Madani and Indo-Pak, default size and Large.
2. For each tile, compare the glyph's ink box (`Range.getBoundingClientRect`, as `shell.centerInk` does) with the
   tile's box. Lesson 9 recorded its measurement in `qaida.css` in place of a rule it did not need; do the same.
3. **If the wow clips at the bottom**, the fix is the one Lesson 8's step 0 settled for zair: a row rule
   (`.pair:has(.mark-tile[data-tail-below])`) so every tile in the row grows together, and `data-tail-below` set by
   `markTile` when a mark's tail descends. Do not make the lone tile taller — that is the "zair box is weird" fault.

## 4. The halo

Rings the tail — wow and jazam — measured against the letter, its zabar and an invisible joiner, the "before"
string Lesson 8 built and Lesson 9 generalised to read a form's `cp`/`tail`. **No change expected.** Look at it:
the ring should sit on the wow, not on the zabar and not on the whole item.

## 5. `shell.js`

Lesson 10's row gains `href: 'lesson-10.html', built: true, progress: 'drill', cp: 0x064E, tail: [0x0648, 0x0652]`.
`masteredCount` tests the suffix by length (Lesson 8) — **no change**, but a check that masters one item of Lesson
4, one of 8 and one of 10 on the same letter and gets 1, 1, 1 from `masteredCount(4)`, `(8)`, `(10)`.

## 6. Audio

`audio.js`'s `wanted()` already honours `skip` and composes `display` (Lesson 8). `manifest.json` gains
`"fatha-waw": {}`. `recordings.html` should show **27 new rows**, each displaying بَوْ-style composed glyphs, keys
still the bare letter.

## 7. Words

`spell.js` and `exercise.js` gain a `'fatha-waw'` entry (`05`). **`qaida-words-check.js` needs no new rule:** the
jazam is inside `fatha-waw`'s tail, so a word can only carry it through a `fatha-waw` root pair — whose lesson is
10. A stray jazam anywhere else would need a sukun row, which will not exist until Lesson 14, so it cannot be
written by accident.

## 8. Options panel

Nothing new. The "Two-letter tiles" row appears already (`hasTail`). If §3 adds `data-tail-below`, no row for it —
it is a fix, not a look.
