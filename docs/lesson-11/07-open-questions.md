# 07 — Open questions

Eight questions. **None blocks the build.** Each has a recommendation, and the build can start on those, the way
lessons 4–10 did. §1 matters most. §3 is the one only this lesson raises.

## 0. Build now, or after a look at Lesson 10?

**Recommended: a short look at Lesson 10 first. It is not a gate.** Lesson 11 is Lesson 10's page with paish in
place of zabar. If the tile, the halo or the joined block looks wrong on بَوْ, it looks wrong on بُو too, and it is
cheaper to fix once. If the user says build, build.

## 1. The jazam on the long-vowel wow, in Indo-Pak

| | What the Indo-Pak student sees | For | Against |
|---|---|---|---|
| **a. Show it** — *recommended* | بُوْ | how the Indo-Pak mushaf and every printed Indo-Pak Qaida write it (`02` §2); it makes the minimal pair the real Indo-Pak one, zabar against paish | the two scripts look different in one more place |
| b. Leave it off in both scripts | بُو | one spelling to learn | misspells the Indo-Pak mushaf; the student meets بُوْ on the first page they read |

This depends on `02` §2's check. If Quran.com's Indo-Pak text turns out not to mark it, the question is closed.

## 2. Twins: alternate or both?

- **Alternate** — *recommended*: each letter meets **one** twin per part (بُ or بَوْ) and the other in the other
  part. Twins stay near 45% of questions, the size Lesson 5 measured.
- **Both**: every question offers بُ **and** بَوْ. The minimal pair appears in every question, but twins become
  about 60% of the questions. That is Lesson 6's measurement, and it is why Lesson 6 moved to alternate.

It is one attribute (`data-twins`) and already a row in the options panel, so the teacher can try both.

## 3. Ask by ear first, once the recordings exist?

The content plan's words for this lesson are "hear one, pick which". The by-ear format switches itself on as the
`damma-waw` recordings arrive, but only as one format among others (`SOUND_FIRST` is off site-wide,
`mark-lesson.js`). **Recommended: not now.** There are no recordings yet (`audio/manifest.json` is empty), so there is
nothing to see. Decide when the teacher has recorded the 27 "buu" sounds. It is then a two-line change: a
`data-sound-first` attribute read in place of the constant, set on this lesson (and on Lesson 13).

## 4. The same-sound tile

Show بٗ beside بُو on part 1 (**recommended**, and what Lesson 9's plan promised), or leave the comparison to
Lesson 9's own page. If the five-tile row is too crowded (`04` §7), the tile moves to a line of its own; it is not
dropped.

## 5. The names

| | Zabar set | Fatha set |
|---|---|---|
| The lesson | Paish and wow | Damma and waw |
| The mark on the Indo-Pak wow | **jazam** | **sukoon** |

**Recommended: never say "madd"**, as Lesson 8 never did. Would the teacher use the word?

## 6. The silent alif after a plural wow

قَالُوا "they said", كَانُوا "they were": the alif after the wow is written and not read. These are among the most
common words in the Qur'an, and a student reading the Qur'an meets one within a line. **Recommended: leave them out
of this lesson's words** (`05` §1) and ask the teacher where they belong: a line in this lesson, or a later pass
alongside the other silent letters.

## 7. The recordings page: which picture for "buu"?

The recordings page lists the `damma-waw` group once, with one picture per letter. It shows بٗ (ulta paish) today,
because Lesson 9 made the group. **Recommended: بُو** (`03` §6). It is the plainer spelling, and the teacher is
recording a sound, not a mark.

## 8. More words

The fifteen in `05` are candidates. The teacher may prefer others, especially for the three "apart" words (دُونَ،
زُورٌ، دُورٌ).
