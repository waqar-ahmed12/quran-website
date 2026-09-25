# 01 — What Lesson 6 teaches

## 1. The lesson in one line

The third mark: **U+064F**, a small curl **above** the letter, called **paish** or **damma**. It turns a letter
into a sound with a "u" in it — ب is "Baa", بُ is "bu".

## 2. The skills, and which one is new

`docs/lesson-4/01` §2 listed three and `docs/lesson-5/01` §2 added a fourth. Lesson 6 adds the last one:

| | Skill | In Lesson 4 | In Lesson 5 | In Lesson 6 |
|---|---|---|---|---|
| **A** | Notice that a mark is there | the whole lesson | free | free |
| **B** | Know whose letter it is | as hard as Lesson 2 | unchanged | unchanged |
| **C** | Know what it says | untestable without recordings | unchanged | unchanged |
| **D** | Tell this mark from the other one, by **where it sits** | did not exist | the lesson | half free — zair is still below |
| **E** | Tell this mark from the other one, by **what it looks like** | did not exist | did not exist | **the lesson** |

**E is new, and it is a different skill from D, not a harder version of it.** Zabar and zair are the same stroke
in two places; the student learns to look *where*. Paish is a different shape in a place they have already seen;
the student has to stop looking where and start looking *what*. A student who has only been trained on D will read
بُ as بَ — same place, mark present, done — and that is the commonest real mistake in a Qaida class.

So the design rule for the lesson: **every question a student can answer by noticing where the mark sits is a
question this lesson should not be asking.** The consequence is `03-the-two-marks-riding-along.md`, and it is why
zabar — not zair — is the wrong answer that matters here.

## 3. The three-way, which is the real point

Lessons 4, 5 and 6 are not three lessons about three marks. They are one lesson about **the three short vowels**,
taught in three sittings, and Lesson 6 is where they finally meet:

```
    بَ      بِ      بُ
    ba      bi      bu
```

A printed Qaida puts these three on one page for exactly this reason. Nothing in lessons 7 to 14 works if the
student cannot do this line cold, because every later lesson builds on it: tanween is these three doubled (Lesson
7), the long vowels are these three stretched (8, 11, 13), and the standing harakaat are these three written
without their letters (Lesson 9).

**That is what "paish items mandatory, zabar + zair review" in `QAIDA-CONTENT.md` item 6 means**, and it is a
decision already made — the content plan wrote it before any of this was built. Lesson 6 implements it.

## 4. What "knowing paish" means here

Unchanged from lessons 4 and 5, and unchanged for the same reason: the Qaida has **no recordings**, so *what it
says* cannot be graded. The answer the student picks is the **name of the pair** — "Baa with paish". That was the
teacher's answer to `docs/lesson-4/09` §1, taken 2026-09-20, and it is one page file, so it is still their answer
here without being re-asked.

`sound-to-mark` is built and switched off by `available()`, and switches on for this lesson the day a `damma`
recording exists. **Nothing in Lesson 6 reopens `docs/lesson-4/09` §1.**

## 5. Why paish comes third

`QAIDA-CONTENT.md`'s order, which is a printed Qaida's: zabar, zair, paish. It is also right for the skills:

- Putting the **hard place-contrast** second (zair) meant the student had to learn to look at *where* before they
  had anything else to think about.
- Putting the **shape-contrast** third means paish arrives when "a mark has a place" is already automatic, so the
  new thing — "and it also has a shape" — is the only new thing.
- Paish against zabar is the contrast; paish against zair mostly is not. Lesson 5 could not have been taught
  third without wasting its own lesson, and Lesson 6 could not have been taught second without wasting this one.

## 6. What is deliberately not taught

| Not here | Where it belongs |
|---|---|
| The long "oo" (wow with damma) | **Lesson 11.** بُو is not bu, and the difference is the whole of that lesson |
| **Ulta paish** (the inverted damma, U+0657), which a printed Indo-Pak Qaida shows near here | **Lesson 9**, standing harakaat. A student may have seen it in their own book — `02` §6 and `06` §4 |
| Dammatain / tanween (ٌ) | **Lesson 7.** It is two of this mark, and the student should own one first |
| Paish on a joined shape | Lesson 3 taught the shapes. One new thing at a time — Lesson 4's decision, unchanged |
| Both marks on a word | later; the Qaida has no words yet (`docs/lesson-4/09` §5) |

The first row is worth being as firm about as `docs/lesson-5/01` §5 was about yaa: Lesson 6 shows **one letter
with one mark**, never a letter followed by wow — which matters more here than it did there, because **paish is
drawn like a small wow** (`02` §4) and a student who sees بُو early will fuse the two.

## 7. Carried decisions

Every row of `QAIDA-BUILD.md`'s Decisions table applies unchanged. The four that shape this lesson:

- **Three right in a row is "known"**, four fifths with nothing shaky is "you seem ready" — a recommendation,
  never a gate.
- **Mixed review in every later lesson.** Here it is load-bearing for the third time, and it is the first lesson
  where "earlier lessons" is plural.
- **Nothing is locked.** Lesson 6 opens for a student who has done neither Lesson 4 nor Lesson 5, and `03` §3 has
  to survive that.
- **No numbers on the page.**
