# 06 — Open questions, for the teacher

These are **teaching** decisions, not coding ones. Each has a recommendation that can be built and then changed with
one row in the options panel, so the answer can be "look at it and pick".

**Ask them in plain words.** Say what a thing is, and show it, before asking about it. **Looks are never asked in
words**: the board layout and the tile size are rows in the options panel, not questions here.

**None of these blocks the build.** What's worth doing first is previewing lessons 4 and 5 (`README.md`, "Before
building").

---

## 1. How long should a mark lesson take?

This is the question most worth answering, because of what happened with Lesson 2.

Lesson 2 felt too long (*"why 39 questions!!!"*), so on 2026-09-24 it was changed: now it **asks every letter twice,
in a shuffled order, and a mistake adds one more turn a few questions later**. Then it says you're ready. The length
is known in advance, and the progress bar moves steadily.

Lessons 3, 4 and 5 **still work the old way**: keep asking until seven of every ten letters have been answered right
twice in a row, with nothing missed still shaky. That can drag, for the same reason Lesson 2 did: a letter can go
unasked for a long time by bad luck. Lesson 6 would work the old way too.

| | What the student feels |
|---|---|
| **Keep the old way** | no change; may feel as long as Lesson 2 did |
| **Lesson 2's way, for lessons 4, 5 and 6 together** (recommended, after a look) | every letter with the mark comes up twice, the earlier marks ride along between them, and the lesson says "you seem ready" when the letters have all had their turns |

*Claude recommends:* **try Lesson 4 first.** If it feels long, switch all three mark lessons to Lesson 2's way in
one change, since they are one page file. It's a bigger change than it sounds, because Lesson 2's way doesn't yet know
what to do with letters from earlier lessons riding along. So it's worth deciding from the real thing rather than in
advance.

---

## 2. Which letters does the student meet paish on first?

Each mark lesson starts with six letters before opening all 29.

**Option A: the same six as zabar, ب د ر س م ل (recommended)**

Paish sits **above**, exactly where zabar did, so the reasons those six were easy for zabar still hold. And the
student met zabar on these very letters, so the first thing they see is **بَ** (which they know) beside **بُ** (which
they don't). That's the comparison this whole lesson is about.

**Option B: six new letters**, so the student sees paish on letters they haven't practised a mark on yet. This
spreads the practice, but loses the "same letter, new mark" start.

*Claude recommends A.* All 29 come in part 2 either way.

---

## 3. Should zair come back in this lesson?

Your rule is that every lesson mixes in the ones before it. In Lesson 6 that means both **zabar** and **zair** come
back. But they don't help equally:

- **Zabar is the one that teaches.** It sits above, like paish. A student has to look at the *shape* (a straight line
  or a small curl) to tell بَ from بُ. So the same letter with zabar is among the answers **every time**.
- **Zair is easy to tell apart.** It sits below, so a student can spot it without looking closely. It's review, not
  the lesson.

| | What the student sees |
|---|---|
| **Zair in the second half only, on about a third of the letters** (recommended) | first half: paish against zabar only. Second half: zair turns up now and then |
| Zair on every letter, both halves | more review, and roughly half the questions become earlier lessons |
| No zair at all | the lesson is only paish against zabar |

*Claude recommends the first.* There is a row for it in the options panel ("Zair riding along"), so you can
change it while looking at the lesson.

---

## 4. A "which of the three" question: later?

A printed Qaida teaches **بَ بِ بُ** as one row: "ba, bi, bu". A natural question is: *"Which one is Baa with
paish?"* with the answers **بَ بِ بُ ب**, the same letter in all four buttons, so only the mark differs.

The practice engine can't ask that today. It guarantees one look-alike answer, not three. Teaching it to do this is
a small change, but it's a change to the part every lesson shares, and Lesson 2 only just settled.

*Claude recommends:* **not in this build.** The board shows the ba bi bu row, and every question already has the
zabar look-alike. If, after trying Lesson 6, you want the "which of the three" question, it's a good one to add, and
it would work for Lesson 7 (tanween) too.

---

## 5. The recordings: this lesson completes the set

After Lesson 6 there are four recordings per letter that the Qaida wants:

| Group | What it is | How many |
|---|---|---|
| `letters` | the letter's **name**: "Baa" | 29 |
| `fatha` | the **sound** "ba" | 29 |
| `kasra` | the **sound** "bi" | 29 |
| `damma` | the **sound** "bu" | 29 |

**There are still none.** The lessons work without them and say so. But they're also what makes **Say it** (step 7)
useful, since there's nothing yet to compare the student's voice against.

**Would it be easiest to record one letter at a time: "Baa, ba, bi, bu", then the next?** That's how a Qaida is read
aloud anyway. If so, the recordings page should list them **by letter** instead of by group. That's a small change,
and easier before there are files than after. `docs/lesson-5/06` §3 asked this too. It matters more now that the set
is complete.

As always: **your own voice or a vetted reciter, never an AI voice.**

---

## 6. Carried over, still open

- **Hamzah with a mark**: ءُ bare, as now, or ؤ / أُ on a seat as a printed Qaida writes it. Still recommended: bare,
  with hamzah's seats in a pass of their own.
- **The Indo-Pak lettering** is a stand-in (Noto Naskh) and a launch blocker. A printed Indo-Pak Qaida draws paish a
  little differently, so worth a glance when you preview.
- **Example words**: `QAIDA-CONTENT.md` wants 3–4 per exercise, and lessons 4–6 have none. Any real Qur'an text is
  **fetched, never typed from memory**.
- **Screen readers** still can't answer a mark lesson, because naming the letter gives the answer away. The by-ear
  question fixes it, and it needs the recordings.
- **The spelling**: *paish* (also written *pesh*) and *damma* now appear in a lesson title and in 29 item names.
  Worth confirming once.
- **The glowing Next button**: Lesson 2 now glows once you're ready (your note). Lessons 4 and 5 still go quiet. The
  plan gives Lesson 6 the glow. Should 4 and 5 match?

---

## Decided, don't reopen

Everything in `docs/lesson-4/09` and `docs/lesson-5/06`'s "Decided" tables, plus:

| Question | Answer |
|---|---|
| What paish is told apart from | **Zabar**, not zair. Both sit above; the shape is the lesson. `README.md`, `03` §1 |
| Upside-down paish | **Lesson 9** (standing marks), not here |
| Long "oo" (paish and wow) | **Lesson 11**, not here. One letter with one mark only |
| Say it and the Board | in this lesson, as in every lesson (the user, 2026-09-19 and 2026-09-22) |
