# 06 — Open questions, for the teacher

Every one of these is a **teaching** decision, not a coding one. Each has a row or a text field in the options
panel wherever that is possible, so the answer can be "look at it and pick" rather than "describe what you want".

**Ask them in plain words.** Three of Lesson 2's eight questions went unanswered on 2026-09-19 because they were
written in the build's own terms. Say what a thing *is*, and show it, before asking about it.

**None of these blocks the build.** Every one has a recommendation that can be built and then changed by clicking
a row. The only real question is §0.

---

## 0. Should Lesson 6 be built now, or after you have looked at lessons 4 and 5?

Lessons 4 and 5 are written but **nobody has opened them in a browser yet**. They share one page file, one
stylesheet and one data file with this lesson. If something is wrong in the way a mark sits on a letter, it is
wrong in all three, and building the third first means fixing it three times.

Lesson 6 is also the cheapest of the three — its mark sits **above** the letter, like Lesson 4's, so it needs no
new layout work at all and carries none of Lesson 5's risk.

*Claude recommends: open lessons 4 and 5 first, even briefly.* Ten minutes there is worth more than ten minutes
here. But if you would rather have all three to look at in one sitting, say so and it gets built.

---

## 1. Which six letters does the student meet paish on?

**Option A — the same six as zabar (recommended): ب، د، ر، س، م، ل**

Paish sits in the same place as zabar, so the six letters that were easy for one are easy for the other — and
because they are the *same* six, the student sees بَ beside بُ from the first minute, which is the whole lesson.
The one to watch is **ل**, where the curl lands next to a tall stroke.

**Option B — swap ل for a flat letter: ب، د، ر، س، م، ف** — one less crowded letter, but the six no longer match
Lesson 4's, so the pairs are not all familiar.

*Claude recommends A.* Every letter is drilled either way in part 2, and matching Lesson 4's six is worth more than
avoiding one tall stroke. If ل looks bad when you preview it, that is a reason to change the letter, not the plan.

---

## 2. How much of the last two lessons comes back?

This is the one that decides what Lesson 6 *is*, and it is the same question as Lesson 5's §2, one lesson on.

Paish and zabar sit in the **same place** and differ only in **shape** — one is a flat stroke, one is a small curl.
If the exercise only ever shows paish, a student can answer every question by noticing that the mark is on top —
which they learnt in Lesson 4 — and finish without ever looking at its shape.

So the letters with zabar (and zair) come back as the wrong answers: the student is shown بُ and has to pick it out
from بَ and بِ.

| | What the student sees | What that teaches | How long the lesson feels |
|---|---|---|---|
| **One at a time** (recommended) | بُ against بَ, or against بِ, and the other way round in part 2 | shape and place, one at a time | the same as Lesson 5 |
| Both at once | بُ against بَ **and** بِ, every question | the full three-way, which is what real words need | **noticeably longer** — more than half the questions are about earlier marks |
| Off | بُ against plain ب | "there is a mark", which they already know twice over | shortest, and it does not teach the lesson |

*Claude recommends "one at a time".* It keeps the exercise the length you have already seen, and because it flips
between the two parts, every letter is still met against both marks before the lesson ends. **"Both at once" is one
click away** if it turns out the three-way is what you want — and it is the honest answer to what a printed Qaida
asks of a student on that page.

---

## 3. Should the board show all four, or would three be enough?

The board at the top of the lesson teaches; the exercise below tests. The plan is for the board to show the whole
family in one row:

```
ب        بَ        بِ        بُ
```

That is four tiles per letter, and in part 2 that is 29 rows of four. It may read as a wall.

The alternatives are already rows in the panel: **three** (drop zair), **two** (Lesson 4's, just the letter and
paish), or **just the marked letters**.

*Claude recommends all four*, because the one thing this lesson is for is seeing the three marks side by side —
and the board is the only place where they are shown rather than tested. **Look at it and say.**

---

## 4. Two things a student with a printed Qaida open beside them will ask

Neither changes the build; both are worth knowing before you preview.

- **"Isn't that a wow?"** Paish is drawn as a miniature و. The plan puts one line on the board saying it is a curl
  and not a wow (`02` §4) — it is a text field, so it can be reworded or emptied. In Lesson 11 the student meets
  بُو, where a paish and a real wow are both on the page.
- **"My book has an upside-down one."** A printed Indo-Pak Qaida shows **ulta paish** (the inverted damma) near
  here. It marks the long "oo" and it is **Lesson 9's**, not this one. The plan does not teach it. If you would
  rather it were at least named in passing when they meet paish, say so — it is one line of wording.

Also, as in Lesson 5: **the Indo-Pak face is a stand-in**, and a printed Indo-Pak Qaida draws damma rounder and
closer to the letter than Noto Naskh does. In a lesson about a mark's *shape*, that is worth knowing while you look.

---

## 5. Carried over, still open

These were asked in lessons 4 and 5 and have not been answered. None of them blocks Lesson 6.

- **The recordings, by letter or by group.** There are still none of anything. Four groups are wanted: the letter's
  name ("Baa"), then the sounds "ba", "bi" and **"bu"**. `docs/lesson-5/06` §3 asked whether it would be easier to
  record all four for one letter in one go — "Baa, ba, bi, bu" — and re-order the recordings page by letter
  instead of by group. **With Lesson 6 built, all four groups exist, so this is the moment it becomes cheap to
  change.** The rule does not change either way: your own voice or a vetted reciter, never an AI voice.
- **Hamzah with a mark** — ءُ, bare, as Lesson 1 teaches it, or on a seat as a printed Qaida writes it.
  `docs/lesson-4/09` §4. Still recommended: bare for now, hamzah's seats in a pass of their own.
- **Example words** — `QAIDA-CONTENT.md` wants 3–4 per exercise; lessons 4, 5 and 6 show none, only a letter beside
  itself. Worth deciding with the recordings. Any real Qur'an text must be **fetched, never typed from memory**.
- **A student using a screen reader still cannot answer these lessons.** Naming the prompt or the choices gives the
  answer away. The format that fixes it is the by-ear one, which needs the recordings. Unchanged since Lesson 4,
  and worth not claiming otherwise.
- **The spellings** — *paish* and *damma* now join zabar/fatha and zair/kasra in a page title and a hundred item
  names. Worth confirming all six at once.

---

## Decided, don't reopen

Everything in `docs/lesson-4/09` and `docs/lesson-5/06`'s "Decided, don't reopen" tables, plus:

| Question | Answer |
|---|---|
| How the student answers (the pair's name, not the sound) | The recommendation, taken 2026-09-20. One page file, so it is the same for lessons 4, 5 and 6 |
| Two parts per mark lesson | The same. Six letters, then all 29 |
| Drilling the mark on joined shapes | **No.** Lesson 3 taught the shapes; one new thing at a time |
| The long "oo" (wow with paish) | **Lesson 11**, not here. One letter with one mark, never a letter followed by wow |
| Ulta paish | **Lesson 9** (standing harakaat), not here |
| Tanween (two of this mark) | **Lesson 7**, not here |
| Jazam last, after leen | The user, 2026-09-20 |
