# 07 — Open questions

Eight questions. **None blocks the build** — each has a recommendation, and the build can start on those the way
lessons 4–7 did. §1 is the one that matters most, and §2–§4 are the ones a teacher is most likely to answer
differently from Claude.

## 0. Build now, or after the pending fixes?

**After them — they are small, and two are on the path.** `06` §2, step 0: the walkthrough fix (`fixes/lesson 4
5/`) reshapes `spell.js` before Lesson 8's words go into it, and the tile-height fix (`fixes/lesson 6/`) settles
the rule Lesson 8's wide tile follows. The other two (exercise 6's Next, Lesson 7's names) are one-line fixes to
pages this lesson links to.

Unlike Lesson 7, there is **no browser question in the way**: zabar above the letter is the first thing the Qaida
learnt to draw, and the one new drawing risk — two letters on a tile — has its own row in the panel.

## 1. What should the drill test, when the difference is a whole letter?

Lessons 4–7 asked the student to name what they see — "Baa with zabar" — because a mark is a picture, and there
are no recordings yet. **Here the picture is easy**: an alif is a full letter, not a stroke, and "is there an alif
after it?" is answered at a glance. What the lesson is really about — *hearing and saying* "ba" against "baa" —
the drill cannot test without the teacher's voice.

| | What the student does | Tests | Buildable |
|---|---|---|---|
| **a. Name it** (as lessons 4–7) | sees بَا, picks "Baa with zabar and alif" | seeing the alif; the name | **now — the default** |
| **b. Find it** (panel: *The drill → Question → Mix both*) | also reads "Baa with zabar and alif", picks بَا from بَ بَا تَا … | the same, the other way round | **now** — already built, off by default |
| **c. By ear** | hears "baa", picks بَا from بَ بَا … | **the lesson itself** | **built, off until there are recordings** |
| **d. Sound it out** | sees بَا, picks "baa" from "ba" / "baa" | the sound, spelled in English letters | transliteration — **off by the user's own rule** (2026-09-14) |

**Recommendation: (a), with (c) switched on the moment recordings exist** — the same answer as every mark
lesson, for the same reasons. Let this lesson be the quick one; after four parts of tanween, a short lesson is not
a bad thing. **But of all the lessons so far, this is the one where (c) matters most**, which is §6's request.

(d) is listed because it is the obvious fix and the wrong one: "ba" and "baa" in English letters would test the
lesson without any recordings, but the user turned transliteration off, and the walkthrough's syllable line
(*"qaa"*) is the only place it appears.

## 2. Which letters: 27, 28, or 29?

**Recommendation: 27 — no alif, no hamza — in both scripts** (`02` §2), with one line on the board saying why.

- **Alif** is out either way: اَا is never written. The long aa at the start of a word is آ, a different sign.
- **Hamza** is the real question. The Madani mushaf writes ءَا (ءَامَنُوا۟ is one of its commonest words); an
  Indo-Pak mushaf writes the same word differently. The choices:
  - **27 in both** (recommended): the same table in both scripts, and the gap explained.
  - **ءَا in Madani only**: 28 and 27. Credit survives a switch (the ids fold), but the bar's total and the board
    change with the script.
  - **ءَا in both**: shows Indo-Pak students a spelling their mushaf does not use.

It is one field (`skip` in `marks.js`) whichever way it goes.

## 3. Laam: keep لَا in the table?

**Recommendation: yes** — in part 2, not part 1, with one line on the board (`02` §4). On 2026-09-18 the user
decided lam-alif is not a *letter*, and that stands. But ل followed by ا is drawn as one shape by every Arabic font,
the zabar does not change that, and drawing them apart would be a misspelling. It will appear in the first word
with *laa* in it (سَلَامٌ, in the exercise) whether this lesson mentions it or not — better that the board says
it first.

**The question for the teacher:** is one line enough, or does a student meeting لا for the first time need a row
of its own on the board (لَ → لَا, "laam, then laam with an alif")?

## 4. The names, and how the teacher spells it out loud

- **The mark**: "zabar and alif" / "fatha and alif", so an item is **"Baa with zabar and alif"**. Plain, as the
  user asked on Lesson 7. Is there a word the teacher uses instead — and would the student understand it?
- **Out loud**: the walkthrough says *"Qaaf with zabar and alif: qaa."* A teacher spelling it the traditional way
  might say the alif differently — *"qaaf, alif, zabar: qaa"*, or name the alif after the sound, or not name it at
  all. **How do you say it?** It is the one caption line (`data-letter-line`), and it should match the classroom.
- **How long is long?** The board says *long*. A teacher often says "stretch it", "pull it for one alif", or "two
  counts". Any of those can go into the `data-mark-does` field; Claude left the count out because it is a tajweed
  measure (`01` §3), not because it is wrong.

## 5. The words

Fifteen words — three walked through, twelve on the exercise page (`05` §3, §5). All real, all in ordinary
spelling, all using only marks the student has met. **Every one is Claude's candidate** and should be checked the
way the aayat are. Two things to look at in particular:

- **Are any of these words the teacher would not choose** — too uncommon, or with a meaning they would rather
  not start with?
- **Should the page say where the words come from?** Recommendation: no — they are Arabic words, not quotations,
  and the mushaf spells several of them with Lesson 9's mark instead of an alif (`05` §4).

## 6. The recordings: this lesson's 27 first?

Setting Lesson 8 built adds **27 rows** to `recordings.html` — the sound "baa", "taa", "thaa"… never the name.

**The request:** if the teacher records anything soon, **record these before the 87 tanween sounds**, together
with Lesson 4's "ba, ta, tha…" (29 clips, already listed). The pair — short and long, same letter, one breath —
switches on the by-ear question (§1c) here, where it is the lesson rather than a nicety. Recording **letter by
letter** ("ba, baa") rather than group by group is a sort order in `recordings.html`, not a new file, and it has
been asked since Lesson 5.

**Something the teacher may like:** for twelve letters, this lesson's sound is the letter's own name as a Qaida
recites it — Baa, Taa, Thaa, Ḥaa, Khaa, Raa, Zaa, Ṭaa, Ẓaa, Faa, Haa, Yaa (`02` §6). Two questions:

- **Should the board say so?** One line on the feature row — *"You have said this since Lesson 1: Baa is the
  letter's name."* — is a friendly way in. It is not written into `04`; it is a field if the teacher wants it.
- **Is the recording the same clip?** Claude's recommendation is **no**, record them separately: a recited name
  often ends in a catch (*baa'*) that the long vowel does not have. The teacher's ear decides.

## 7. A second contrast: بًا, "ban"?

At the end of a word, two zabar is written on the letter **with an alif after it** — كِتَابًا, *kitaaban*. So
**بًا ("ban") looks like بَا ("baa") with one stroke more** — a genuine, common, easily-missed difference, and it
doubles as Lesson 7's review.

`docs/lesson-7/06` §3 asked whether Lesson 7 should show ـًا and left it out; no answer came. **Recommendation:
not in this lesson's first build.** It would need a second review-only row in `MARKS` (two zabar with a tail) and a
second twin, and it asks the student to hold *two* new ideas in one question. If the teacher wants it, it is a row
in the panel ("Also ride along: two zabar and alif") and about a day's work, not a rebuild.

## 8. Carried over, still unanswered

From `docs/lesson-4/09` to `docs/lesson-7/06`, and each applies here unchanged:

- **Recording order** — letter by letter or group by group (§6).
- **How much earlier material rides along** — the plain-letter slider is at 0 (the user, 2026-09-20).
- **The Indo-Pak font** — Noto Naskh is a stand-in and draws ہ broken between letters; a licensed Indo-Pak face is
  step 13's, and a launch blocker.
- **Lesson 7's open tanween (U+08F0–2)** — out of scope, still.
