# 06 — Open questions

Six questions. **§0 is the one that matters** and it is the only one that blocks the build; the rest have a
recommendation each, and the build can start on those recommendations the way Lessons 4, 5 and 6 did.

## 0. Should Lesson 7 be built before lessons 4, 5 and 6 have been opened in a browser?

**Claude's answer this time is a plain no**, which is a change from `docs/lesson-6/06` §0, where the honest answer
was "your call, and the risk is shared".

Three lessons are now awaiting a preview, and they share one page script, one stylesheet block and one data file.
That was already a lot. But the real reason is narrower:

> **`docs/lesson-6/05` §4 item 2 asks: can you tell بَ from بُ at the tile's size?** Nobody knows. Lesson 7 asks
> the student to tell **بَ from بً** — the same stroke, once against twice, in the same place, at the same size.
> If the answer to Lesson 6's question is "not really", the fix is a bigger tile or a different face or a larger
> drill glyph, in `qaida.css` and `mark-lesson.js` — the two files Lesson 7 leans on hardest, and the two it would
> be built on top of.

Building Lesson 7 first risks specifying four parts around a tile size that is about to change, and then doing the
CSS work twice.

**What the preview costs:** `node serve.js`, then three pages, ten minutes with this list —
`docs/lesson-4/08` §5, `docs/lesson-5/05` §4 and `docs/lesson-6/05` §4. Item 2 of Lesson 6's list is the one that
unblocks this lesson.

**If the user says build it now anyway:** build it. Nothing in this folder assumes the answer — the tile is a
number in one CSS rule, and the four parts, the marks and the twins are the same whatever it is. Say so, build it,
and put the tile question at the top of the checklist (`05` §4 item 1), which is where it already is.

## 1. Four parts, or two?

Four is the recommendation (`03` §3): meet each doubled mark on the six letters its single counterpart used, then
all 29 together. The alternative is two, the shape of lessons 4–6: part 1 is all three marks on six letters, part
2 is all 29.

| | Four parts | Two parts |
|---|---|---|
| Required items | 6 + 6 + 6 + 29 = **47** | 18 + 29 = **47** |
| The gate | the last part, 29 | the last part, 29 |
| Meets three new marks | one at a time | all at once, in part 1 |
| Rail | four buttons | two |
| Code | `partsOf` (which Lesson 9 needs anyway) | `partsOf` (same) |

The same 47 either way — the difference is only whether the warm-up is one part or three. **Four**, because a part
whose items all carry one mark is a part where the question is always *one stroke or two?*, and that is the skill
being taught. A mixed part 1 asks *which mark?* before *is it doubled?* has been learnt.

Either way the gate is the last part alone, so a student who does not want the warm-ups does not do them.

## 2. Are the names right?

The stand-ins are **do zabar / do zair / do paish** and **fathatain / kasratain / dammatain**, with the lesson
itself called **tanween** in both sets (`02` §1). Questions for the teacher:

- Is *do zabar* what the teacher says, or *zabartain*, or *tanween zabar*, or something else?
- Should the `fatha` set say *fathatain* or *tanween fath*?
- The Urdu names are transliterated into English letters here, as "zabar" and "paish" already are. Nothing new,
  but this is the lesson where a teacher might want the Urdu script instead.

Every one of these is a text field in the options panel either way, so a wrong guess costs one edit and no code.
It is worth asking because the *lesson's* name appears on the home page, where the teacher has not seen it yet.

## 3. All 29 letters, or only the ones that really carry tanween?

Tanween happens at the **end of a word**, on a noun. Some letters almost never end an indefinite noun in the
Qur'an, and a few — hamza in particular — are written in ways this lesson does not show.

- **Claude's recommendation: all 29**, which is what a printed Qaida's tanween table does. The lesson is teaching
  a *shape*, and a table with holes in it invites "why not that one?" from a beginner who cannot yet be told why.
- **The teacher may disagree**, and if so the change is one line: the last part's letters come from `shell.lettersOf()`,
  and a list in `MARKS` would replace it.

A second, smaller form of the same question: **should fathatain be shown on a final alif (ـًا)?** That is how "an"
is actually written at the end of a word in both scripts, and it is the one place where tanween genuinely looks
different from "the mark, twice". It is a **word-shaped** thing rather than a letter-shaped one, so it is not in
this lesson as specified. It would fit as one line on the board, shown and never drilled — like the joined example
already there. Ask.

## 4. The recordings: 87 rows, and in what order?

Setting Lesson 7 `built: true` adds **87 rows** to `recordings.html` on its own — 29 letters × three marks, all
of the **sound** ("ban", "bin", "bun"), never the letter's name (`02` §6).

That is the largest single block the teacher has been handed. Nothing waits for it: an unrecorded item plays the
wordless hum and the by-ear question format stays off until a group has files.

**The question:** would the teacher rather record **letter by letter** — "Baa: ba, bi, bu, ban, bin, bun", six
clips in one breath, 29 sittings — than group by group? `recordings.html` lists by group today. It sorts, and a
by-letter view is a sort order, not a new file. This was asked on Lesson 5 (`docs/lesson-5/06`) and has not been
answered; it matters three times as much here.

## 5. The "open" tanween

Some mushafs — including printed Indo-Pak ones — write tanween **two ways**: the two strokes stacked, and the two
strokes "open" (side by side, U+08F0–U+08F2), to say whether the n is pronounced clearly or merged into the next
letter. That is **tajweed notation**, and `QAIDA-CONTENT.md` puts tajweed in a later pass.

**Recommendation: leave it out, and say so in the lesson's design record rather than on the page.** A beginner who
meets both forms before they can read a word learns a distinction they cannot use. When the tajweed pass comes,
this is where it attaches.

**But the teacher should confirm it**, because it is the one place where a Qaida they teach from might visibly
disagree with the page.

## 6. Carried over, still unanswered

From `docs/lesson-4/09`, `docs/lesson-5/06` and `docs/lesson-6/06`, and each one applies here unchanged:

- **How the student answers.** Lesson 7 still answers with the pair's name ("Baa with do zabar"), because there
  are no recordings and transliteration is off. The by-ear format is built and switched off. Unchanged since
  Lesson 4, and it is the question that would change the most if the teacher's answer changed.
- **How much earlier material rides along.** The plain-letter slider is at 0 (the user, 2026-09-20). The twins are
  the review here, and `03` §5 sets them at about a third of the questions.
- **Whether the lesson is too long.** Four parts of a 14-lesson Qaida. The rows to turn down are in `05` §4
  item 7.
