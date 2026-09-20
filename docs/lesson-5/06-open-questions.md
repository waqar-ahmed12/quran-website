# 06 — Open questions, for the teacher

Every one of these is a **teaching** decision, not a coding one. Each has a row or a text field in the options
panel wherever that is possible, so the answer can be "look at it and pick" rather than "describe what you want".

**Ask them in plain words.** Three of Lesson 2's eight questions went unanswered on 2026-09-19 because they were
written in the build's own terms. Say what a thing *is*, and show it, before asking about it.

**None of these blocks the build** the way Lesson 4's §1 did. Every one has a recommendation that can be built and
then changed by clicking a row. What *does* block the build is that **Lesson 4 has not been looked at yet**
(`README.md`, "Do not start yet").

---

## 1. Which six letters does the student meet the new mark on?

Lesson 4 starts with six easy letters before opening all 29. Lesson 5 should too — but the six that were easy for
a mark **above** the letter are not the easy ones for a mark **below** it.

**Option A — six letters that keep out of the way (recommended): ا، ت، د، ط، ك، ه**

None of them has a dot underneath and none of them dips below the line, so the new mark sits in clear space and
the student can see exactly where it goes. One of them (د) is also in Lesson 4's six, so they meet at least one
letter they have already seen with the other mark.

**Option B — the same six as Lesson 4: ب، د، ر، س، م، ل**

Every letter is familiar from the lesson before, so the pair بَ / بِ is the very first thing they see. The cost is
that three of those six are the hardest letters on the page for a mark underneath: **ب has a dot under it** (the
mark and the dot land in the same place), and **ر** and **م** have tails that sweep down through where the mark
goes.

**Option C — something in between: ب، د، ت، ط، ك، ل** — familiar letters, but only one awkward one.

*Claude recommends A.* The first two minutes of this lesson are about noticing that the stroke moved; a letter
where the stroke is hard to see is the wrong place to learn that. Every letter is drilled either way in part 2.

---

## 2. How much of the last lesson comes back?

This is the one that decides what Lesson 5 *is*.

Zabar and zair are **the same stroke in a different place**. If the exercise only ever shows zair, a student can
answer every question by noticing that there is a mark at all — which they already learnt in Lesson 4 — and finish
this lesson without ever looking at whether it is above or below.

So the plan is that **the letters with zabar come back as the wrong answers**: the student is shown بِ and has to
pick it out from بَ, not from ب.

| | What the student sees | What that teaches |
|---|---|---|
| **With zabar riding along** (recommended) | بِ against بَ | above against below — the point of the lesson |
| Without it, like Lesson 4 | بِ against ب | "there is a mark", which they already know |

There is a row in the options panel for it, and a second row for how many **bare** letters ride along on top
(recommended: 4 — enough to keep the old question alive, not enough to crowd out the new one).

*Claude recommends both on.* But it does make the exercise harder than Lesson 4's, and it means roughly one
question in three is a letter from an earlier lesson. **If that feels like too much when you try it, turn the bare
letters down first, and the zabar ones down only if the lesson feels like a re-run.**

---

## 3. The recordings: three sounds per letter, and it is worth planning now

There are still **no recordings of anything**. The page works without them and says so honestly, and nothing here
is blocked. But the shape of what is wanted has changed, and it is easier to know now than after Lesson 6:

| Group | What it is | How many |
|---|---|---|
| `letters` | the letter's **name** — "Baa" | 29 |
| `fatha` | the **sound** "ba" | 29 |
| `kasra` | the **sound** "bi" | 29 |
| `damma` (Lesson 6) | the **sound** "bu" | 29 |

**The question: would it be easier to record all four for one letter in one go** — "Baa, ba, bi, bu" — rather than
29 of one kind, then 29 of the next? If so, the recordings page should be re-ordered to list them **by letter**
instead of by group, which is a small change and much easier to make before there are files than after.

The rule does not change either way: **the teacher's own voice or a vetted reciter, never an AI voice**, and the
sound "bi" is a different recording from the name "Baa" — not a substitute for it.

---

## 4. Carried over from Lesson 4, still open

- **Hamzah with a mark** — ءِ, bare, as Lesson 1 teaches it, or ِإ on a seat as a printed Qaida writes it (and with zair the
  seated hamzah moves *under* the alif, which is a second thing to explain). `docs/lesson-4/09` §4. Still recommended: bare for now, hamzah's seats in a pass of their own.
- **The Indo-Pak face is a launch blocker, and it matters more in this lesson than the last one.** Noto Naskh is a
  stand-in, and a printed Indo-Pak Qaida sets zair lower and at a different angle than Noto Naskh does. In a lesson
  whose whole subject is *where the mark sits*, that is worth knowing when you preview it.
- **Example words** — `QAIDA-CONTENT.md` wants 3–4 per exercise; lessons 4 and 5 show none, only a letter beside
  itself. Worth deciding with the recordings. Any real Qur'an text must be **fetched, never typed from memory**.
- **A student using a screen reader still cannot answer this lesson.** Naming the prompt or the choices gives the
  answer away. The format that fixes it is the by-ear one, which needs the recordings. Unchanged from Lesson 4,
  and worth not claiming otherwise.
- **The spellings** — *zair* and *kasra* now appear in a page title and in a hundred item names. Worth confirming
  once.

---

## Decided, don't reopen

Everything in `docs/lesson-4/09`'s "Decided, don't reopen" table, plus:

| Question | Answer |
|---|---|
| How the student answers (the pair's name, not the sound) | The recommendation, taken 2026-09-20 when the user said "please start building". One page file, so it changes for lessons 4, 5 and 6 at once |
| Two parts per mark lesson | The same. Six letters, then all 29 |
| Drilling the mark on joined shapes | **No.** Lesson 3 taught the shapes; one new thing at a time |
| Long "ee" (yaa with zair) | **Lesson 12**, not here. One letter with one mark, never a letter followed by yaa |
