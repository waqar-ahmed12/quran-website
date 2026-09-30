# 02 — The row, the letters, and the measurement

## 1. The row

In the fourth `MARKS` statement, after Lesson 12's:

```js
// Lesson 13 (docs/lesson-13/): zair, then a yaa - the long "ee". Lesson 11's shape with Lesson 12's letter: the
// minimal pair is Lesson 12's row, `same` is Lesson 9's khari zair (shown beside it, never an answer), Indo-Pak
// marks the yaa with a jazam and Madani leaves it bare, and the yaa itself differs by script, so both scripts draw
// from `forms` and the id is the Madani letter with the Indo-Pak mark (docs/lesson-12/02 §2). `first` is khari
// zair's six (docs/lesson-9/02 §4): zair's own six less the alif, which never carries this.
'kasra-yaa': {
  id: 'kasra-yaa', cp: 0x0650, tail: [0x064A, 0x0652], names: { fatha: 'kasra and yaa', zabar: 'zair and yaa' },
  sits: 'below', lesson: 13, audio: 'kasra-yaa',
  first: MARKS['standing-kasra'].first, sample: 'ف', against: ['kasra', 'fatha-yaa'],
  skip: ['ا', 'ء'], same: 'standing-kasra',
  forms: {
    madani: { cp: [0x0650], tail: [0x064A] },
    indopak: { cp: [0x0650], tail: [0x06CC, 0x0652] },
  },
},
```

- **The id**: `key + U+0650 U+064A U+0652` in both scripts. Madani draws `U+0650 U+064A` and Indo-Pak draws
  `U+0650 U+06CC U+0652`.
- **`audio: 'kasra-yaa'`** is khari zair's group, named for this lesson in advance. There are no new recordings.
  Lesson 11's `markForKind` change makes the recordings page show بِي for the group.
- **`sits: 'below'`**: the tile and the row take the below-sitting rule automatically (`qaida.css`, Lesson 5's row
  rule).

## 2. Which letters, and the sample

**27**, with `skip: ['ا', 'ء']`. Yaa on yaa (يِي) stays, as in lessons 10–12.

**Part 1** borrows khari zair's six: ه د ت ط ك ف. These are zair's own six (none has a dot underneath or dips below
the line) with ف in place of the alif. On the board they appear in alphabet order: ت د ط ف ك ه. **د** leaves the yaa
standing apart and the other five join it.

**The sample is ف**, so the title and part 1's rail show **فِي**, which is also the word "in". It is Claude's choice,
not a rule: zair's own sample is د, which would show the yaa standing apart, and ت (the first on the board) is
another fair choice. `04` §1 asks.

## 3. The same-sound tile

`same: 'standing-kasra'`: part 1's feature row ends **= تٖ** (Madani تِۦ), because `rows[0]` is ت, the first of
part 1 in alphabet order. Five tiles, as on Lesson 11. Use Lesson 11's measurement and fix (`docs/lesson-11/04` §7).
This row is also **taller**, because both marks sit below.

## 4. Two things below the line — measure first (step 1 of the build)

In بِي the zair sits under the letter, and right beside it the yaa's end shape drops below the line: a bowl, with two
dots under it in Madani and none in Indo-Pak. Three things can go wrong:

1. **They collide.** In some Naskh faces a final yaa after a joining letter sweeps back to the *right*, under the
   letter before it (the "returning yaa"). There it would meet the zair. Scheherazade New (Madani) and Noto Naskh
   (the Indo-Pak stand-in) are expected to draw a plain bowl to the left, but **look**.
2. **The tile clips.** The zair and the bowl stack the deepest ink any tile has held so far.
3. **The row drops** (Lesson 7's "two zair brings the box down"). The row rule grows every tile in a row that holds a
   below-sitting tile. It was written for a mark below, not for a mark *and* a tail below.

**How:** in the browser pane, draw the full 27-letter table and part 1's feature row, both scripts, default and Large.
Compare each glyph's ink box with its tile (as `docs/lesson-12/03` §3), and look at the zair and the yaa's dots on
every joining letter. **If Lesson 12 added `data-tail-below`**, it applies here with no more work. If not, and this
lesson clips, add it now, exactly as Lesson 12's `03` §3 describes. Record the measurement in `qaida.css` either way.

## 5. The per-script board line

Lesson 11's mechanism, with the yaa (`03` §1).
