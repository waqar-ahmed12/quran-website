# 02 — The wow, the jazam, and which letters

## 1. The characters

| | Code point | Role |
|---|---|---|
| zabar | U+064E | `cp` — Lesson 4's, unchanged |
| wow | U+0648 | the first half of the tail, a letter |
| jazam (sukun) | U+0652 | the second half of the tail, a mark on the wow |

So the row is `cp: 0x064E, tail: [0x0648, 0x0652]` and an item's id is **four characters**: the letter's key, then
those three. Composed from code points, never pasted (`docs/lesson-8/03` §1 already said lessons 10 and 12's tails
carry a sukun, which is why `tail` was code points from the start).

## 2. Which letters — 27, the same as Lesson 8

`skip: ['ا', 'ء']`, Lesson 8's reasons unchanged: a bare alif never carries a zabar in the mushaf's spelling of
these syllables (اَوْ is written أَوْ, with hamza on the alif), and ء's seat is written differently by the two
scripts' mushafs.

**Wow on wow (وَوْ) stays.** It is rare in real words but a printed Qaida's table has it, and it is a fair reading
exercise: the first wow carries the zabar, the second the jazam. `07` §3 asks.

**Laam is back in part 1.** Lesson 8 swapped ل for ن because لَا is a ligature. لَوْ is not — the laam just joins
the wow like any other letter — so `first` is **Lesson 4's six unchanged**: ب د ر س م ل. That keeps two letters
that leave the wow standing apart (د ر) and four that join it, which is what the board's joined block wants.

## 3. The jazam's shape — measure it, then decide (step 1 of the build)

**The Madani mushaf's text writes the sukun as U+06E1** (a small, open, head-of-khaa shape) — this is how Tanzil's
Uthmani text encodes it, the source Lesson 9 checked its words against. Standard Arabic text, and most Indo-Pak
digital text, uses **U+0652**, which fonts draw as a small circle or, in some faces, the same open shape.

This is the Lesson 9 question at a smaller size, and the answer is the same machinery — **but measure before
building it**:

1. In the browser pane, draw بَوْ with U+0652 and with U+06E1, in each face the site loads (Scheherazade New — the
   mark pages' Madani face — Amiri Quran, and the Noto Naskh Indo-Pak stand-in), both themes. Screenshot the six.
2. **If Scheherazade New draws both the same** → nothing to do; U+0652 everywhere.
3. **If they differ, and U+06E1 is the Madani mushaf's shape** → one line on the row, exactly Lesson 9's pattern:
   `forms: { madani: { tail: [0x0648, 0x06E1] } }`. The id stays U+0652 (`03` §2).
4. **Indo-Pak:** the mushaf's jazam is drawn by the font, not chosen by a code point, and the Indo-Pak face is the
   Noto Naskh stand-in — the known launch blocker fixed at step 13. Note what it draws; change nothing.

**Correction, 2026-09-28** (`docs/pass-2/01` §1, checked against Quran.com's text): the opening sentence of this
section has the encoding backwards. **Quran.com's Uthmani text writes the sukun as U+0652, and its Indo-Pak text as
U+06E1.** The *decision* above still stands, because it was made by measuring what the site's Madani face draws: U+06E1
gives the open head-of-khaa the Madina mushaf prints. But a code point is not a shape. When real verses arrive
(Lesson 23), their U+0652 needs a Qur'an font to draw the same shape.

**Why do it now rather than at Lesson 14:** Lesson 12 has the same tail shape (yaa and jazam), and Lesson 14 puts a
jazam on every letter. Deciding it on one lesson, with a screenshot, is cheaper than deciding it on three.

## 4. Joining

**Exactly Lesson 8's alif**, because a wow, like an alif, never joins forward:

- 22 letters join into the wow: the letter is in its **start** shape, the wow in its end shape (قَوْ);
- د ذ ر ز و leave it standing apart (دَوْ) — `NEVER_JOIN` already lists them;
- nothing joins after the wow, so the item always ends cleanly.

`renderBoard`'s joined block, built for Lesson 8, shows "the part's first joining letter and first non-joining
letter side by side" — correct here with no change. **Its lam-alif example must not appear**: it is gated on "the
tail is exactly an alif", which a wow is not. A check (`06` §3).

## 5. The descender

The wow's tail drops **below the line**, which the alif never did. Lesson 8's wide tile (`--tile * 1.5` wide, same
height) was measured with an alif. Lesson 5 learnt what happens to ink below the line in a tile sized for ink above
it. **Measure the 27, both faces, before touching `qaida.css`** (`03` §3).
