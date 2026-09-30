# 03 — Code changes

There is little code here: Lesson 8 built the tail, Lesson 9 built `forms` and the same-sound tile, and Lesson 10
built the wow. **The rule that governs every change:** lessons 4–10 come out identical. If
`qaida-marks-check.js` or any of `qaida-lesson5-check.js` to `qaida-lesson10-check.js` changes its answer, the
change was wrong.

## 1. `MARKS` gains one row, in a new fourth statement

Lessons 11–14 each add a row that **borrows from Lesson 9's rows** (`same`, and Lesson 13's `first`). An object
literal cannot see keys added after it, so the rows go in a **fourth `Object.assign`, after Lesson 9's**, not beside
Lesson 10's. Lesson 11 opens it:

```js
// Lessons 11-14 (docs/lesson-11/ to docs/lesson-14/). A fourth statement, after Lesson 9's, because these rows
// borrow from it (`same`, and Lesson 13's `first`).
Object.assign(MARKS, {
  // Lesson 11 (docs/lesson-11/): paish, then a wow - the long "oo". The minimal pair against Lesson 10 is the
  // point of the lesson, so Lesson 10's row is in `against` (docs/lesson-11/01 §2). `same`: Lesson 9's ulta paish is
  // this sound written as a mark, shown beside it on the board and never among the answers (docs/lesson-9/01 §3).
  // The Indo-Pak mushaf puts a jazam on the wow and the Madani mushaf leaves it bare (docs/lesson-11/02 §2): the
  // base row is the Indo-Pak spelling, so the id is the same in both scripts (suffixOf never reads `forms`).
  'damma-waw': {
    id: 'damma-waw', cp: 0x064F, tail: [0x0648, 0x0652], names: { fatha: 'damma and waw', zabar: 'paish and wow' },
    sits: 'above', lesson: 11, audio: 'damma-waw',
    first: MARKS.damma.first, sample: 'ب', against: ['damma', 'fatha-waw'],
    skip: ['ا', 'ء'], same: 'inverted-damma',
    forms: { madani: { cp: [0x064F], tail: [0x0648] } },
  },
});
```

`audio: 'damma-waw'` is **already Lesson 9's** (ulta paish's `audio`), named for this lesson in advance. It is one
recording group for one sound. **No combining mark anywhere in the file, comments included** (`qaida-check.js`
reads `marks.js` for one).

**Check first:** `against` holds a tailed mark from an earlier lesson (`'fatha-waw'`), as Lesson 10's holds
`'fatha-alif'`. `twinItems` builds a twin's id with `suffixOf(other)`, so it works. Assert it: every Lesson 11 twin
of that kind has a four-character id ending U+064E U+0648 U+0652.

## 2. Ids

`key + U+064F U+0648 U+0652`, **in both scripts**, although Madani draws only `key + U+064F U+0648`. The check
switches script and counts: a mastered letter stays mastered.

## 3. `shell.js` and `masteredCount`

Lesson 11's row gains `href: 'lesson-11.html', built: true, progress: 'drill', cp: 0x064F, tail: [0x0648, 0x0652]`.
**Also correct its fatha-set title** from "Damma and wow" to **"Damma and waw"**, as Lesson 10's was corrected
(the fatha set says waw).

`masteredCount` tests the suffix and its length, and needs **no change**. The twins recorded in Lesson 11's own
record are بُ (two characters, ending U+064F) and بَوْ (four characters, ending U+0652 but after U+064E). Neither
matches, so neither is counted. The check masters one of each, plus one own item, and gets 1 from
`masteredCount(11)`.

## 4. The one change to `mark-lesson.js`: a board line that differs by script

Lesson 10's `.jazam-note` reads one template, `data-template`. Lesson 11 needs a different line in each script
(`04` §3), because in Madani there is no mark on the wow to talk about. Read a per-script template first, and fall
back to the shared one:

```js
if (jazamNote) {
  const d = jazamNote.dataset;
  // A line per script where the scripts differ (Lesson 11: Indo-Pak marks the wow, Madani leaves it bare -
  // docs/lesson-11/03 §4). Lesson 10 has only the shared template and reads exactly what it did.
  const template = d[shell.state.script === 'indopak' ? 'templateIndopak' : 'templateMadani'] || d.template;
  jazamNote.textContent = say(template, { jazam: shell.state.names === 'zabar' ? d.jazamZabar : d.jazamFatha });
}
```

`renderBoard` already runs on every change of script, so the line swaps with no more code. Lessons 12, 13 and 14
reuse this. `qaida-lesson10-check.js` must still pass unchanged.

## 5. The same-sound tile

**No change.** `renderBoard` draws it on part 1 for any mark with `same`. It uses `markTile('same', …)`, which reads
`formOf` for the tile's width. In Madani, ulta paish is paish plus a small waw (a tail), so its tile is wide; in
Indo-Pak it is one mark, so the tile is narrow. That is correct in both. What may need work is the **width of the
row** (`04` §7).

## 6. Audio

- `manifest.json`: **no change**. `"damma-waw": {}` has been there since Lesson 9.
- `audio.js`'s `groups()` lists a kind once, so no duplicate group appears.
- **The recordings page's picture.** `markForKind('damma-waw')` returns the first row in `MARKS` with that `audio`.
  That is ulta paish, because the fourth statement comes after Lesson 9's. The teacher would see بٗ beside "the sound
  of Baa with damma and waw". **Recommended, one line:** prefer the row whose `id` is the kind, then fall back:
  ```js
  const all = Object.values(marks.MARKS);
  return all.find((m) => m.id === kind) || all.find((m) => m.audio === kind) || null;
  ```
  Every other kind has exactly one row, whose id *is* the kind, so nothing else moves. `07` §7.

## 7. Words

`spell.js` and `exercise.js` each gain a `'damma-waw'` entry (`05`). `qaida-words-check.js` needs **no new rule**:
the Indo-Pak jazam is inside the tail and reaches a word only through a `damma-waw` pair, whose lesson is 11.

## 8. Options panel

Nothing new. The "Two-letter tiles" row appears (`hasTail` is true in both scripts). The board row offers the
quartet, the trio and the pairs, as on Lesson 10.
