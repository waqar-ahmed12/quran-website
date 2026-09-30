# 02 — The shadda, its order, its place, and which letters

## 1. The characters

| | Code point |
|---|---|
| shadda | U+0651 |
| the vowel on it | U+064E zabar / U+0650 zair / U+064F paish |
| the lead | U+0627 U+064E (Lesson 14's) |

The same code points in both scripts (`docs/pass-2/01` §10). Only the *drawing* of the kasra differs (§3).

## 2. The order of the two marks: vowel first, shadda last

Unicode's canonical order puts the vowel before the shadda (fatha is class 30, kasra 32, shadda 33). Quran.com's text
writes the shadda first. **The two draw the same.** Every shaping engine reorders marks by class before drawing. So
the order is chosen for the code, and this lesson composes **vowel, then shadda**, because:

- **the halo rings the last mark a form draws** (`markBox`, `docs/lesson-9/03` §5), so with the shadda last, the ring
  goes round the shadda, the lesson's own mark, and not round the vowel the student already knows;
- it is the order `String.prototype.normalize('NFC')` produces, so an id is already in its normal form.

**The id is fixed forever:** `key + vowel + U+0651`. Nothing in the Qaida compares an id with fetched Qur'an text.
If anything ever does, it normalises both first.

## 3. The kasra's place — measure first (step 1 of the build)

| | Indo-Pak mushaf | Madina mushaf |
|---|---|---|
| shadda and zabar | both above | both above |
| shadda and paish | both above | both above |
| **shadda and zair** | **shadda above, kasra under the letter** | **kasra under the shadda, both above the letter** |

This is how the two mushafs print it. It is also why a Madani reader sees what looks like "a shadda with a small
zabar under it" and must learn it is a kasra. **The fonts decide it, not the code points.** So:

1. In the browser pane, draw اَبِّ, اَدِّ, اَهِّ in each face the site loads: **Scheherazade New** (the mark pages'
   Madani face), **Amiri Quran**, **Noto Naskh** (the Indo-Pak stand-in). Use both themes and screenshot them.
2. For each, note where the kasra lands. **SIL's fonts (Scheherazade New) have a character variant for exactly
   this, "shadda+kasra placement".** Look up its feature tag in Scheherazade New's own documentation. Don't guess it.
3. Decide per script:
   - **Madani** wants the kasra under the shadda. If Scheherazade does that by default, nothing to do.
   - **Indo-Pak** wants it under the letter. If Noto Naskh raises it, look for a feature. If it has none, **note it
     and change nothing**: the licensed Indo-Pak font (`docs/pass-2/03` §3) is the fix, and it is already a blocker
     for Lesson 23.
4. Write the result into this section before any code.

*Result, measured 2026-09-29 in the browser pane* (canvas ink boxes of دَّ, بَّ and هَّ with a kasra, in em units, plus a look at
each face on screen):

| Face | Kasra with a shadda | Feature |
|---|---|---|
| **Scheherazade New** (the site's Madani face) | **above the letter, tucked under the shadda** (ink −0.81 to −0.42 em on baa; nothing below the line) | SIL's *Shadda+kasra placement* is `cv62`: 0 default, 1 lowered, 2 raised (software.sil.org/scheherazade/features). **All three values keep the kasra above** in the copy Google Fonts serves; none puts it below the letter |
| **Noto Naskh Arabic** (the Indo-Pak stand-in) | **above as well**, the same stack | it has no such feature |
| **Amiri Quran** | **below the letter**, the shadda above | the only face the site loads that does it |

So the spec's premise for Indo-Pak (kasra under the letter) is **not what the Indo-Pak face draws**, and nothing in the
code can move it: with the faces the site has, both scripts draw the kasra above. Decisions taken at the build:
- **`sits` is `'above'` on all three rows, in both scripts.** The tile has to match what the font draws, and both fonts
  draw it above, so **the per-script `sits` of `03` §2 was not built**; it is one field, added the day a face draws
  a kasra below a shadda (for instance a licensed Indo-Pak face, `docs/pass-2/03` §3).
- **The part-2 board line says so honestly**, in both scripts: "Shadda sits above the letter, and the zair sits just under
  the shadda — still a zair. Some printed Qaidas write it under the letter instead." One text field
  (`data-mark-sits-shadda-kasra`), so the teacher can say what their own Qaida does.
- **Amiri Quran was not switched in for Indo-Pak.** It is a Madina-style face, and the Indo-Pak lettering is the whole
  site's choice, not this lesson's. Note for the checklist: **Amiri Quran drawing the kasra below the letter suggests the
  Madina mushaf may print it below too**, which is the opposite of what `pass-2/01` and this section assumed for the
  Madani script. Only a printed mushaf settles it: `06` §4 item 2 is the teacher's.

**Whatever the fonts do, the tile must match.** A kasra drawn above needs room at the top, and one drawn below needs
room at the bottom. The row `shadda-kasra` therefore says where it sits **per script** (`03` §2).

## 4. Which letters: 27

`skip: ['ا', 'ء']`. An alif is never doubled. ء's seat differs by script (Lesson 8's reason), and a hamza with shadda
is rare (Lesson 16 is hamza's own lesson).

**و and ي stay**: اَوَّ and اَيَّ are common (اَوَّلُ "first", اِيَّاكَ "you alone" in Al-Fatiha).

**ن and م stay, and matter**: they carry the hum (`01` §4). م is in part 1 and part 3; ن only in part 4.

**Part 1 and part 3** use zabar's six, ب د ر س م ل. **اَلَّ** is the shape of the start of the name Allah. That is worth
a look on the checklist, and nothing more here: Allah is Lesson 18's.

**Part 2** uses khari zair's six (ه د ت ط ك ف, `docs/lesson-9/02` §4). None has dots underneath, so in Indo-Pak the
kasra under the letter sits in clear space, and in Madani nothing sits below at all.

## 5. The lead

Lesson 14's اَ, bare in both scripts, **on all three parts**, recommended. A printed table often matches the lead's
vowel to the shadda's (اَبَّ اِبِّ اُبُّ). That is one field per row (`lead`), so it costs nothing to try, and `07` §2
asks.
