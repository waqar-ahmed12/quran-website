# 02 — The standing marks: characters, letters, fonts

## 1. The characters

Six code points, composed with `String.fromCharCode` and never pasted (`docs/lesson-4/02` §1):

| Code point | Name in Unicode | Category | Used by | Drawn |
|---|---|---|---|---|
| U+0670 | ARABIC LETTER SUPERSCRIPT ALEF | Mn (a mark) | both scripts | an upright stroke over the letter |
| U+0656 | ARABIC SUBSCRIPT ALEF | Mn | Indo-Pak | an upright stroke under the letter |
| U+0657 | ARABIC INVERTED DAMMA | Mn | Indo-Pak | paish turned over, over the letter |
| U+06E6 | ARABIC SMALL YEH | **Lm (a spacing letter)** | Madani | a small yaa *after* the letter |
| U+06E5 | ARABIC SMALL WAW | **Lm** | Madani | a small waw *after* the letter |
| U+064E, U+0650, U+064F | fatha, kasra, damma | Mn | Madani, before the three above | lessons 4–6's marks |

The categories were checked in node on 2026-09-28 (`/\p{Lm}/u`). They matter: a mark sits *on* the letter and a
tile's width is the letter's; a spacing letter takes room *after* it, which is Lesson 8's wide tile again.

## 2. What each script writes

| | Indo-Pak | Madani |
|---|---|---|
| **khari zabar** | letter + U+0670 | letter + U+064E + U+0670 |
| **khari zair** | letter + U+0656 | letter + U+0650 + U+06E6 |
| **ulta paish** | letter + U+0657 | letter + U+064F + U+06E5 |

The Madani column is how the Tanzil and Quran.com Uthmani text encodes these (هَٰذَا, بِهِۦ, لَهُۥ): the short
mark stays, and the small letter after it makes it long. **Claude's reading, to be confirmed against Tanzil's
Uthmani text when the words are checked** (`05` §1) — it decides only what `forms` holds, one row each.

So a Madani student is taught **what their own mushaf prints**, and an Indo-Pak student what theirs prints. The
alternative — one set of marks for both — is `07` §1.

## 3. The fonts, measured

Drawn on a canvas at 120px in the browser pane (2026-09-28), ink bounds on ب in pixels from the top; the bare
letter's ink starts at about 206 (Scheherazade New) and 201 (Noto Naskh Arabic). Lower number = taller.

| | Scheherazade New (Madani on mark pages) | Noto Naskh Arabic (Indo-Pak default) | Amiri Quran |
|---|---|---|---|
| zabar — top | 183 | 180 | 130 |
| **khari zabar** — top | 162 | 163 | 110 |
| **Madani khari zabar** (zabar + U+0670) — top | **141**, the tallest stack the Qaida has drawn | 146 | 101 |
| paish — top | 168 | 170 | 116 |
| **ulta paish** — top | 161 | 174 | 114 |
| zair — bottom | 304 | 292 | 308 |
| **khari zair** — bottom | **330**, the deepest | 310 | 326 |
| Madani small yaa / small waw | +50px / +19px wide | +35 / +24 | +49 / +40 |

**Every form draws, in every face** — none fell back to a missing-glyph box. What the numbers say:

1. **The Madani khari zabar is tall.** Zabar over a small alif stands about three times as high over the letter as
   zabar alone. Lesson 6's merge note already warned that paish might clip at the top of a tile on ا ل ط ظ ك;
   this is taller than paish. The browser checklist's first item (`06` §4).
2. **The khari zair is deep** — nearly twice zair's depth below the letter. The `.pair:has([data-sits='below'])`
   rule from Lesson 8's step 0 gives the row its room; it has to be enough for this.
3. **Ulta paish against paish is the smallest difference in the Qaida.** In Noto Naskh the two tops differ by 4px
   at 120px; at a tile's size, one curl against the same curl turned over. This is the Lesson 6 question
   (بَ against بُ, "hard to tell apart at this size") in a harder form.
4. **Amiri Quran draws the khari zair into ب's dot.** Harmless today: Madani never writes U+0656, and Madani mark
   pages have been Scheherazade New since the fifth round. Recorded so nobody switches it back for this lesson.

Seen by eye, in the pane, at 56px: upright against slanted is clear in all three faces; ulta paish against paish
is clear in Scheherazade New and readable, not obvious, in the other two.

## 4. Which letters: 27

**No ا and no ء, in both scripts** — Lesson 8's answer (`docs/lesson-8/02` §2), for the same reasons:

- **Alif** never carries a standing mark. A long vowel at the start of a word is written another way (آ for aa).
- **Hamza** takes its long vowels in ways the two mushafs write differently; leaving it out keeps one table for
  both scripts.

The same `skip: ['ا', 'ء']` on each row, so the last part holds **27 items** and the bar's total is 27, as
Lesson 8's.

**Part 1 letters** (a mark's `first`), chosen the way Lesson 5 chose its six — letters whose shape keeps out of the
mark's way:

| Mark | Six | Why |
|---|---|---|
| khari zabar | ب د ر س م ن | Lesson 8's six: the sound is the same, so the letters are too |
| khari zair | ه د ت ط ك ف | zair's six (`docs/lesson-5/02` §3) with ا, which is skipped, replaced by ف (no dot below, no tail) — and **ه first**, since the Qur'an writes this mark almost only on ه (§5) |
| ulta paish | ب د ر س م ه | paish's six with ل, the tallest of them under the tallest mark, replaced by ه, for the same reason |

## 5. Where the student will really meet them

This goes on the board as one line each, because it makes the lesson make sense:

- **Khari zabar is everywhere** in an Indo-Pak mushaf: هٰذَا, ذٰلِكَ, الرَّحْمٰنِ, السَّمٰوٰتِ. It is the reason a
  student who can read بَا still stumbles on the first page of the Qur'an.
- **Khari zair and ulta paish are almost always on ه** — "his", "him" — after a letter with a vowel: بِهٖ "with
  it", لَهٗ "for him". A few other words carry them (دَاوٗدَ, Dawud).

**Claude's reading, for the teacher to confirm** (`07` §5). A printed Indo-Pak Qaida drills all three on every
letter anyway, and so does this lesson; the line tells the student where the practice pays off.

## 6. The name set

| Name set | khari zabar | khari zair | ulta paish |
|---|---|---|---|
| zabar | khari zabar | khari zair | ulta paish |
| fatha | standing fatha | standing kasra | inverted damma |

The fatha set is a translation, not a name a teacher necessarily uses, and a Madani teacher is likelier to say
"small alif", "small yaa", "small waw" — which is also what a Madani page draws. `07` §2.
