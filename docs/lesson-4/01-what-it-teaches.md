# 01 — What Lesson 4 teaches, and why

## 1. The step the whole Qaida turns on

Lessons 1 to 3 taught the alphabet: the names, the names cold, the shapes. None of them produced a sound a student
could say. A letter on its own is not pronounceable — ب is "Baa" the way *bee* is the name of a letter in English,
not a sound in a word.

**The mark is what makes a letter speak.** بَ is "ba". That is the whole of Lesson 4, and everything from here to
Lesson 14 is more of the same idea: a mark, and what it does to the letter under it.

This is also where the two name sets finally matter. The user's rule (2026-09-18) is that **the letters keep their
Arabic names in both sets** — Baa, not Be — and that **the choice changes the marks**. Lessons 1 to 3 therefore
looked identical whichever set was chosen. Lesson 4 is the first page where picking *zabar* or *fatha* changes what
is written on it, including its own title.

## 2. What "knowing zabar" actually means

Three different skills hide inside "knows zabar", and they are not the same:

| Skill | The question it answers | Testable today? |
|---|---|---|
| **A. Spotting the mark** | "Does this letter carry zabar or not?" | yes — بَ against ب |
| **B. Naming the pair** | "Which letter is this, with which mark?" | yes — "Baa with zabar" |
| **C. Saying the sound** | "What does بَ *say*?" | **only with sound or transliteration** |

**C is the real one.** A and B are the approach to it. The Qaida has no recordings yet
(`QAIDA-CONTENT.md`: the teacher is uploading gradually, and not one clip is in), and the user turned
transliteration **off** on 2026-09-14 — so as of today C cannot be asked at all, and a Lesson 4 built now tests A
and B only.

That is the blocking question, and it belongs to the teacher, not to the build: `09-open-questions.md` §1. The
design in this folder makes C a **format that switches on** the moment recordings exist, so that whichever way the
teacher answers, nothing has to be rebuilt.

## 3. Decisions

### Decision 1 — the pool is the 29 letters, each with the mark

One item per letter of the chosen script, with U+064E on it: **29 items**. Not a subset, because a printed Qaida
runs the whole alphabet under the mark, and because the student has just spent three lessons learning that the
alphabet is 29 things.

**The isolated letter, not the joined shapes.** Putting the mark on all 68 of Lesson 3's shapes would be 68 items,
about 163 right answers, and it would test two things at once — a student who missed ـهَـ would not know whether
they had failed at the shape or at the mark. Lesson 3 taught the shapes; Lesson 4 puts one new thing on top of
something already known. The joined forms appear on the **board**, as a single note ("the mark travels with the
letter"), and are never drilled here (`04-page-and-design.md` §4).

### Decision 2 — mixed review is what makes the lesson answerable

The user's rule, 2026-09-19: **every later lesson mixes in earlier material; the lesson's own items are the gate,
the review items never are.** In Lesson 4 that rule is not a courtesy, it is load-bearing.

A drill whose every item carries zabar can never ask "does this have zabar?", because the answer is always yes. The
**bare letters from Lesson 2, riding along as review items**, are the only thing that makes skill A above a real
question. So Lesson 4's pool is:

- **29 marked items**, `required: true` — the gate;
- **a sample of bare letters**, `required: false` — review, and the wrong answers that make the mark matter.

How many bare letters is a slider (`07-options-panel.md` §3), and which ones is a small piece of taste:
**the letters this student got wrong in Lesson 2**, read off `shell.drillOf(2).wrong`, falling back to a spread
across the shape families when the student never did Lesson 2. That costs four lines and makes the review actually
review something.

### Decision 3 — two groups: meet the mark, then all of them

Lesson 2 is 29 items ≈ 72 right answers, and that length is already on the record as worth a look
(`docs/lesson-2/10-open-questions.md`). Lesson 3 answered the same problem by splitting into six groups.

Lesson 4 is 29 items again. The recommendation is **two groups**, reusing Lesson 3's rail unchanged:

| Group | Letters | Items | Right answers to "ready" |
|---|---|---|---|
| 1 — **Meet the mark** | ا ب د ر س م | 6 | 15 |
| 2 — **All the letters** | all 29 | 29 | 72 for the whole lesson (≈ 57 more) |

Group 1 is six letters with six clearly different shapes, so nothing in the first stretch is about telling ب from
ت — it is about noticing the stroke. It is finishable in a couple of minutes, which is the point: the student gets
one complete piece before the alphabet-sized one.

Group 2 makes **all 29** required, group 1's six included, so the lesson's own number and the home card's number
are the same thing and never disagree.

This is `09-open-questions.md` §2, with the one-group and three-group alternatives and their numbers.

### Decision 4 — finishing is a recommendation, as everywhere else

`setDone(4, true)` fires when group 2 is ready: four fifths of the 29 known at three right in a row, with nothing
missed still shaky (the user, 2026-09-19). The drill stays open afterwards and keeps working. Nothing is locked,
before or after.

### Decision 5 — no real Qur'anic words in this lesson

`QAIDA-CONTENT.md` allows 3–4 example words per exercise once recordings exist, and requires that any real Qur'an
text be **exact, from Tanzil or Quran.com, never typed from memory**. Lesson 4 as specified shows no words: the
board's joined example is a letter beside itself (بَبَ), which is what a printed Qaida shows at this stage and is
explicitly not a word. Adding real words is `09-open-questions.md` §5, and it needs the fetch, not a memory.

## 4. Trade-offs, stated once

1. **The mark is drilled on isolated letters only** — decision 1. The cost: a student meets ـبَـ for the first
   time in a later lesson. The board's note covers it; drilling it would double the lesson and confuse two skills.
2. **Review items are the distractors** — decision 2. The cost: turn the review slider to "none" and skill A
   quietly stops being testable. The options panel says so on the row itself.
3. **Two groups, not six** — decision 3. The cost: group 2 is still Lesson 2-sized. Six groups of five would be
   finishable but would make a 29-letter alphabet feel like six unrelated errands.
4. **One page file for lessons 4, 5 and 6** — `README.md`. The cost: `mark-lesson.js` carries a `data-mark`
   indirection that a single lesson would not need. The alternative is three 40KB copies.
