# 02 — The yaa in two scripts, and which letters

## 1. The characters

| | The id (`suffixOf`) | Madani draws | Indo-Pak draws |
|---|---|---|---|
| zabar | U+064E | U+064E | U+064E |
| yaa | **U+064A** ي (the key's fold) | U+064A ي | **U+06CC** ی |
| jazam | **U+0652** (Lesson 10's id) | **U+06E1** (Lesson 10's measurement) | U+0652 |

```js
// Lesson 12 (docs/lesson-12/): zabar, then a yaa with a jazam - "ai". Lesson 10 with a yaa for the wow. The yaa is a
// letter the two scripts write differently (Madani U+064A, Indo-Pak U+06CC, dotless at the end), so the base row
// is the id and BOTH scripts draw from `forms` (docs/lesson-12/02 §2): the letter folds to Madani, as every key
// does, and the jazam is the Indo-Pak code point, as every mark is.
'fatha-yaa': {
  id: 'fatha-yaa', cp: 0x064E, tail: [0x064A, 0x0652], names: { fatha: 'fatha and yaa', zabar: 'zabar and yaa' },
  sits: 'above', lesson: 12, audio: 'fatha-yaa',
  first: MARKS.fatha.first, sample: 'ب', against: ['fatha', 'fatha-waw'],
  skip: ['ا', 'ء'],
  forms: {
    madani: { cp: [0x064E], tail: [0x064A, 0x06E1] },
    indopak: { cp: [0x064E], tail: [0x06CC, 0x0652] },
  },
},
```

It goes in the fourth `MARKS` statement that Lesson 11 opens. **Every form carries its own `cp`**: `formOf` reads
`own.cp` with no fallback. Lessons 9–11's forms all carry it, and this row must too.

## 2. Why the id is neither script's drawing

Two rules, both older than this lesson, meet in one tail:

- **Letters fold to Madani** (`shell.keyOf`: ک→ك, ہ→ه, ی→ي, docs/lesson-4/02 §2). A student who knows baa in Indo-Pak
  keeps the credit in Madani. The yaa in the tail is a letter, so it folds: U+064A.
- **Marks are the Indo-Pak code point** (docs/lesson-9/03 §2). The jazam is a mark, so it is U+0652, as Lesson 10's
  id already is.

So the id is `key + U+064E U+064A U+0652` whichever script is on screen, and **both scripts draw from `forms`**. It
looks odd written down, and it is the only way both rules hold at once. The check proves that `suffixOf` gives one
id, that `drawnOf` gives two different drawings, and that a script switch keeps the credit.

## 3. The dotless yaa at the end (Indo-Pak)

U+06CC has **no dots in its end and alone shapes**, and two dots at the start and in the middle. The font does
this, not the code. So:

- the item بَیْ ends in a dotless yaa in Indo-Pak, and a dotted one in Madani;
- a yaa in the **middle** of a word has its dots in both (بَیْتٌ);
- the student has seen this already: Lesson 3's Indo-Pak table shows ی's end shape without dots.

The board says so once, in Indo-Pak only (`04` §3).

**The Madani mushaf also writes a word-final yaa without dots** (فِى، شَىْءٍ, as ى, U+0649). *Checked 2026-09-28:*
Quran.com's text writes فِى with U+0649 **in both scripts** (`docs/pass-2/01` §8), and **Lesson 17 teaches ى** as the
mushaf's end yaa. A Madani *Qaida*'s table
is another matter, and Lesson 1 teaches ي with its dots. **Recommended: keep U+064A**, dotted, in Madani, the letter
the student learnt. `07` §1 asks the teacher. If the answer is "dotless", it is one code point in the Madani form
(U+0649), and the id does not change.

## 4. Which letters: 27, and part 1

`skip: ['ا', 'ء']`, Lesson 8's reasons. **Yaa on yaa (يَيْ) stays**, as Lesson 10 kept وَوْ: rare, but in a printed
table.

**Part 1 is zabar's own six**: ب د ر س م ل. د and ر leave the yaa standing apart (دَيْ), and the other four join
it. **Two to look at in the browser** (`06` §4):
- **لَيْ.** Laam and yaa have no *required* ligature. Some Naskh faces have an *optional* one, and a browser
  applies it only if the font turns it on by default. Scheherazade New and Noto Naskh should draw a plain laam and
  yaa. If either draws one fused shape, swap ل for ن in `first`, as Lesson 8 did for the alif.
- **بَيْ.** Baa's dot and the yaa's two dots all sit under the line in Madani, close together. It should be
  readable. Look.

## 5. Joining

A yaa **does** join forward, unlike the alif and wow. It is the last letter of the item, though, so nothing follows
it, and the item behaves exactly like Lesson 10's: 22 letters join into the yaa (the letter in its start shape, the
yaa in its end shape), and د ذ ر ز و leave it alone (the yaa in its alone shape). The joined block and `NEVER_JOIN`
need no change. There is still no lam-alif example: the tail is not an alif.

## 6. The bowl — measure it (`03` §3)

The yaa's end and alone shapes drop **below the line** in a wide bowl, with two dots under it in Madani. It is deeper
than the wow, which Lesson 10 measured at 7px clear. Measure; don't assume.
