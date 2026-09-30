# 03 — Code changes

**The rule:** lessons 4–11 come out identical. Lesson 11 opened the fourth `MARKS` statement and made the jazam line
per-script; this lesson uses both and adds nothing structural.

## 1. `MARKS` gains one row

`02` §1, in the fourth statement, after Lesson 11's row.

**Check first:** `formOf(row, 'indopak')` and `formOf(row, 'madani')` both return a form with `cp` (`02` §1's
warning). A form without `cp` makes `drawnOf` throw on `String.fromCharCode(...undefined)`. That would be the whole
page, not one tile. **Recommended hardening, one line in `formOf`:** `cp: own ? own.cp || [mark.cp] : [mark.cp]`.
The fence proves it changes nothing for lessons 4–11.

## 2. Ids

`key + U+064E U+064A U+0652` in **both** scripts (`02` §2). Nothing reads a yaa's code point from the drawing:

- `allItems` / `twinItems` build ids from `suffixOf` ✓
- `markTile` writes `data-id` from `shell.keyOf(letter) + suffixOf(strokeOf)` ✓ (the letter is folded, the suffix is
  the base row's)
- `reviewKeys` reads earlier lessons' records with `key + suffixOf(m)` ✓

**Assert it:** for every letter, the Madani id equals the Indo-Pak id, and neither contains U+06CC or U+06E1.

## 3. The tile — measure the bowl

As `docs/lesson-10/03` §3, with a deeper descender:

1. Open the board's full 27-letter table in the browser pane, Madani and Indo-Pak, default size and Large.
2. For each tile, compare the glyph's ink box (`Range.getBoundingClientRect`, as `shell.centerInk` does) with the
   tile's box. Look hardest at the five rows where the yaa stands **alone** (after د ذ ر ز و), because the alone
   shape is its widest bowl, and at Large.
3. **If the bowl or its dots clip at the bottom**, add the row rule Lesson 10 held in reserve:
   `data-tail-below` set by `markTile` when a form's tail descends, and `.pair:has(.mark-tile[data-tail-below])` to
   grow **every tile in the row together**. Never make the lone tile taller: that is the "zair box is weird" fault
   (`fixes/lesson 6/`).
4. Record the measurement in `qaida.css` either way, as lessons 9 and 10 did.

## 4. The halo

It rings the tail (the yaa and its jazam), measured against the letter, the zabar and an invisible joiner. **No
change expected.** Look: the ring should sit on the yaa, not on the zabar, and in Madani it should take in the dots
under the bowl.

## 5. `shell.js`

Lesson 12's row gains `href: 'lesson-12.html', built: true, progress: 'drill', cp: 0x064E, tail: [0x064A, 0x0652]`.
`masteredCount` needs no change. The check masters one item each of lessons 4, 8, 10 and 12 on one letter and gets
1, 1, 1, 1.

## 6. Audio

`manifest.json` gains `"fatha-yaa": {}`. `recordings.html` should show **27 new rows**, each showing the composed
glyph in the current script (بَيْ in Madani, بَیْ in Indo-Pak). The keys stay the bare letter, as always.

## 7. The board line

Lesson 11's per-script `.jazam-note` (`docs/lesson-11/03` §4), with Lesson 12's two lines (`04` §3). No code.

## 8. Words

`spell.js` and `exercise.js` each gain a `'fatha-yaa'` entry (`05`). `qaida-words-check.js` needs no new rule. The
yaa in a *word* is a key (`'ي'`), resolved through `shell.lettersOf()` like every other letter, so it is ی in
Indo-Pak with no help from `forms`. The yaa in the *tail* is drawn by `forms`. Both ways end up drawing the same
character in each script.

## 9. Options panel

Nothing new.
