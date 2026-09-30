# 02 — The wow, the two scripts, and which letters

## 1. The characters

| | Code point | Indo-Pak | Madani |
|---|---|---|---|
| paish | U+064F | `cp` | `cp` |
| wow | U+0648 | the first half of the tail | the whole tail |
| jazam | U+0652 | the second half of the tail | **not written** |

So the row is `cp: 0x064F, tail: [0x0648, 0x0652]`, and the Madani form is `{ cp: [0x064F], tail: [0x0648] }`. An
item's id is **four characters** in both scripts: the letter's key, then U+064F U+0648 U+0652. The base row is the
Indo-Pak spelling, which is Lesson 9's rule (`docs/lesson-9/03` §2: the id is the Indo-Pak code points, and `forms`
holds the script that differs).

## 2. Why the two scripts write it differently — check this first (step 1 of the build)

- **Indo-Pak** mushafs, and every printed Indo-Pak Qaida, put a jazam on **any** letter with no vowel of its own,
  including the wow and yaa of a long vowel: نُوْرٌ، يَقُوْلُ، فِیْهِ. A student is taught "jazam: no vowel here".
- **The Madani mushaf** (the Uthmani text Tanzil and Quran.com carry) writes a sukun only on a letter that *stops*
  the sound (بَوْ "au", قُلْ "qul"). It leaves the wow and yaa of a long vowel **bare**: نُورٌ، يَقُولُ، فِيهِ. The
  reader's rule is "a bare wow after paish is long".

This is how Claude understands the two conventions, and it decides the whole lesson's look. **Before any code,
confirm it against the source the content rules name** (`QAIDA-CONTENT.md`, "Content rules": Quran.com's Indo-Pak
text as well as its Uthmani text):

1. In the browser pane, open Quran.com's text for one verse with a long "oo" in it (Al-Fatiha 1:7, الْمَغْضُوبِ, is
   the nearest) in **both** scripts.
2. Note the code points after the wow in each. Look for U+0652 or U+06E1 in the Indo-Pak text and for nothing in
   the Uthmani text.
3. Write the result here, under this list, before building.
4. **If the Indo-Pak text does *not* mark it:** drop the Indo-Pak jazam. The row becomes `tail: [0x0648]` with no
   `forms`, and `README.md`'s "one new thing" is gone. The lesson gets simpler. Nothing else in this folder changes
   except `03` §4 (the per-script line is then one line) and `04` §3.

*Result — checked 2026-09-28, confirmed* (`docs/pass-2/01` §2, a scratch `node` script over 22 verses). Quran.com's
Indo-Pak text writes الْمَغْضُوْبِ (1:7) with U+0648 U+06E1, a jazam on the long-vowel wow, and its Uthmani text
writes ٱلْمَغْضُوبِ with a bare U+0648. The same holds for the yaa (الرَّحِيْمِ, 1:1). So the row stands as written.

Two things the check added, neither of which changes this lesson:
- **The code points are the other way round from `docs/lesson-10/02` §3's assumption.** Quran.com's Indo-Pak jazam
  is U+06E1 and its Uthmani sukun is U+0652. The lessons choose code points by what the *site's fonts* draw (Lesson
  10's measurement), not by Quran.com's encoding, so nothing here moves.
- **Indo-Pak leaves a long-vowel wow bare where it is read short**, before a joining alif (عَمِلُوا الصّٰلِحٰتِ,
  103:3). That is Lesson 19's rule. This lesson's words are all read on their own, so every Indo-Pak wow in them
  carries its jazam.

## 3. Which letters: 27, the same as lessons 8 and 10

`skip: ['ا', 'ء']`, for Lesson 8's reasons: a paish on a bare alif is written أُ in the mushaf, and ء's seat differs
between the two scripts' mushafs.

**Wow on wow (وُو) stays**, as Lesson 10 kept وَوْ. It is rare in real words, but a printed Qaida's table has it, and
it is a fair reading exercise.

**Part 1 is paish's own six**: ب د ر س م ل (`MARKS.damma.first`). Laam and wow are not a ligature. د and ر leave the
wow standing apart and the other four join it, which is what the board's joined block wants. **The sample is ب**, so
the title reads بُو (بُوْ in Indo-Pak).

## 4. Joining

Exactly Lesson 10's. A wow never joins forward: 22 letters join into it (the letter in its start shape, the wow in
its end shape), د ذ ر ز و leave it standing apart, and nothing joins after it. The joined block shows the part's
first joining letter and its first non-joining letter, with **no lam-alif example** (gated on "the tail is an alif").

## 5. The descender

Lesson 10 measured the wow in the wide tile: nothing clips, the closest is 7px clear at the bottom, Madani
(`qaida.css`, the Lesson 10 comment). Lesson 11's Madani tail is **shorter** (no jazam) and its Indo-Pak tail is the
same as Lesson 10's. **No measurement is expected.** Confirm by eye on the checklist (`06` §4).

## 6. The jazam's shape (Indo-Pak only)

U+0652, as Lesson 10's Indo-Pak form. The stand-in Indo-Pak face (Noto Naskh) draws it as a small circle, which is not
the Indo-Pak mushaf's shape. That is the known launch blocker, fixed at step 13. Note it and change nothing.
