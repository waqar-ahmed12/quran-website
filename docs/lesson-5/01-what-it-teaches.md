# 01 — What Lesson 5 teaches

## 1. The lesson in one line

The second mark: **U+0650**, one stroke **under** the letter, called **zair** or **kasra**. It turns a letter into
a sound with an "i" in it — ب is "Baa", بِ is "bi".

## 2. The three skills, and which one is new

Lesson 4 listed three (`docs/lesson-4/01` §2). Lesson 5 has the same three, but their difficulty has moved:

| | Skill | In Lesson 4 | In Lesson 5 |
|---|---|---|---|
| **A** | Notice that a mark is there | the whole lesson | **already learnt.** Free |
| **B** | Know whose letter it is | as hard as Lesson 2 | as hard as Lesson 2. Unchanged |
| **C** | Know what it says | untestable without recordings | untestable without recordings. Unchanged |
| **D** | **Tell this mark from the other one** | did not exist | **the lesson** |

**D is new, and it is the only reason Lesson 5 is a lesson rather than an afterthought.** A student who finishes
Lesson 4 can see a stroke. If Lesson 5 only ever asks them to see a stroke again, they will pass it without once
noticing that this one is underneath, and then fail the first word they meet that has both marks in it — which is
most words.

So the design rule for the whole lesson: **every question a student can answer by noticing "there is a mark" is a
question this lesson should not be asking.** `03-the-pool-and-review.md` is what that costs.

## 3. What "knowing zair" means here

Unchanged from Lesson 4, and unchanged for the same reason: the Qaida has **no recordings**, so *what it says*
cannot be graded. The answer the student picks is the **name of the pair** — "Baa with zair" — which was the
teacher's answer to Lesson 4's blocking question (taken from the recommendation, 2026-09-20).

That decision carries here without being re-asked. `sound-to-mark` is built and switched off by `available()`
exactly as in Lesson 4, and switches on for this lesson the day a `kasra` recording exists. **Nothing in Lesson 5
reopens Lesson 4's §1.** If the teacher changes their mind about it, they change it for both lessons at once, in
`mark-lesson.js`, which is why there is one page file.

## 4. Why zair comes second, and not paish

`QAIDA-CONTENT.md`'s order, which is a printed Qaida's: zabar, zair, paish. It is also the right order for skill
D — zair is the *hardest* contrast against zabar, because it is the same stroke at the same angle in a mirrored
place. Paish (Lesson 6) is a different shape altogether and is told apart by its outline; by the time the student
meets it they have already had to learn to look at *where* a mark sits, which is the skill paish does not teach.

Putting the hard contrast second is deliberate. It is also why Lesson 6 will be shorter to build than this one:
it inherits everything `03` adds here.

## 5. What is deliberately not taught

| Not here | Where it belongs |
|---|---|
| Both marks on a word | later; the Qaida has no words yet (`docs/lesson-4/09` §5) |
| Kasra on a joined shape | Lesson 3 taught the shapes. One new thing at a time — Lesson 4's decision, unchanged |
| Kasra under a letter that already carries something below (hamzah's seat, ٍ tanween) | Lesson 7 and hamzah's own pass |
| The long "ee" (yaa with kasra) | **Lesson 12.** A real distinction, and mixing it in here would teach that a mark and a letter are the same kind of thing |

The last one is worth being firm about: بِي is not bi, and the difference is the whole of Lesson 12. Lesson 5
shows **one letter with one mark**, never a letter followed by yaa.

## 6. Carried decisions

Every row of `QAIDA-BUILD.md`'s Decisions table applies unchanged. The four that shape this lesson:

- **Three right in a row is "known"**, four fifths with nothing shaky is "you seem ready" — a recommendation, never
  a gate.
- **Mixed review in every later lesson.** In Lesson 5 this is load-bearing twice over: it is the user's rule *and*
  it is the only thing that makes skill D testable.
- **Nothing is locked.** Lesson 5 opens whether or not Lesson 4 is finished — including for a student who has
  never seen a zabar, which `03` §2 has to survive.
- **No numbers on the page.**
