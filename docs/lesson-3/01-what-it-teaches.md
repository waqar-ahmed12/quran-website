# 01 — What Lesson 3 teaches, and the decisions behind it

## The skill

`QAIDA-CONTENT.md`, sequence item 3, quoting the user:

> **Letter shapes** — "beginning shapes for the alphabets, slowly transitioning to the difficult shapes, then shapes
> depending on whether in start, middle or end".

A student who has finished Lesson 2 can name any letter on its own. That is not yet reading. In a real word the
letters are joined, and a joined letter can lose almost everything that made it recognisable: ه on its own and ـهـ
in the middle of a word share no visible feature at all. Lesson 3 is where the alphabet stops being 29 pictures and
becomes 29 letters that behave.

## What Lesson 3 is not

- **No new letters.** The pool is Lesson 1's and Lesson 2's, in the student's chosen script.
- **No marks, no sounds to read, no words.** A joined form is shown bare. Lessons 4 to 14 add the marks; real words
  come later still (`QAIDA-CONTENT.md`, "Scope for this pass").
- **Not real Qur'anic text.** Where the lesson shows a letter joined up, it is the letter joined **to itself** —
  ببب, تتت — which is exactly what a printed Qaida page does at this stage. It invents no words, so the rule about
  exact Uthmani text never comes into play.
- **No timer, no score, no badge.** As Lesson 2 (`docs/lesson-2/01-what-it-teaches.md`), and for the same reason.

## The five bands

Confirmed by the user, 2026-09-20, from three options. Easy shapes first, hardest last, then the whole table.

| Band | Letters | What it teaches | Drilled forms |
|---|---|---|---|
| **1** | ا د ذ ر ز و · (ء shown, not drilled) | **The six that never join forward.** They join to the letter before them and never to the one after, which is *why* a written word has gaps in it. Two shapes only | **6** |
| **2** | ط ظ | **The two that never change.** Four positions, one shape. A deliberate easy beat after band 1, and proof that "joined" does not always mean "different" | **2** |
| **3** | ب ت ث ن ي س ش ص ض ف ق ل | **Tooth-and-tail.** Joined, the body shrinks to a tooth or a small loop; the tail comes back at the end. The bulk of the alphabet, and one rule covers all of it | **36** |
| **4** | ج ح خ ع غ ه ك م | **The shape-shifters.** Genuinely different in each position. ه and ع are the hardest shapes in the whole Qaida | **24** |
| **5** | all 29 | **The full start / middle / end table** — the user's original ask, reached only after the four bands above have earned it | **0 new** |

**Why band 1 first and not the easiest-looking letters.** ا د ذ ر ز و are easiest *and* they explain the gaps, so
one band buys a shape rule and a reading rule together. Nothing else in the lesson does that.

**Why ط ظ get a band of their own.** Two letters is a small band, and that is the point: it comes straight after the
only band that teaches a rule about gaps, and it says "this one is free". A student who has just been told letters
change shape needs to meet the exception early, or they start hunting for changes that aren't there.

**Why band 5 drills nothing new.** By the time it is reached, every form in it has already been drilled in bands 1
to 4. Band 5 is the **reference table** — all 29 letters, four columns, in one place, to look at and come back to.
It is the thing a student photographs. Making it a drill as well would be asking the same 68 questions a second time.

## The decisions

### 1. The bands are an order, not a chain of locks

`docs/lesson-2/09-going-in-order.md` settled this for the whole Qaida, on the user's instruction of 2026-09-19:
nothing is locked; a student who goes out of turn is advised once and then let through.

That applies **inside** this lesson too. The band rail shows all five bands; any of them can be opened at any time.
The band the student is up to is marked, and a band opened early says so once — the same wording pattern, one level
down. See `04-page-and-design.md` §4.

It also means a band's "ready" moment does not unlock the next band. It moves the marker along, and it says so.

### 2. Every band keeps the earlier bands in the mix

The user, 2026-09-19: **every later lesson mixes in earlier material; the lesson's own items are the gate and the
review items ride along.** Inside Lesson 3 the bands work the same way, and it costs nothing to build: the pool is
always *all* the forms, and the current band's forms are the `required: true` ones. Everything else rides along at
the engine's review weight. See `03-the-pool-and-formats.md` §2 — there is no engine change and no stage machinery.

The practical effect is the one the user asked for in a different context: **every letter stays in the mix**, so a
band-4 letter has been glimpsed a few times before its band arrives, and a band-1 letter does not rot.

### 3. What is drilled is the *new* shape, not all four

The isolated form of every letter was taught in Lesson 1 and drilled cold in Lesson 2. Drilling it a third time here
is busywork. So an item exists for a **position whose shape is new**, and the counts in the table above follow from
that:

- **Band 1** — for ا د ذ ر ز و, initial is the isolated shape and medial is the final shape, so there is exactly
  **one** new shape each: the joined form. Six items.
- **Band 2** — ط ظ change so little that four items would be four pictures of the same thing. **One** each, asked as
  a confirmation that nothing changed. Two items.
- **Bands 3 and 4** — initial, medial and final are all new. **Three** each.
- **ء** — has no joined forms at all. Shown on band 1's board with a line saying so; never drilled, because there is
  nothing to tell apart.

This is what brings the lesson from 101 naive items down to **68**. It is still too many; see
`09-open-questions.md` §1, which is the first thing to settle.

### 4. The script switch changes the data here, not just the font

Already decided on 2026-09-18 and recorded in `QAIDA-BUILD.md`: the script choice changes the **letters**, not only
the typeface — Indo-Pak puts و before ه and writes ک ہ ی. Lesson 3 is where that bites hardest, because those three
substituted letters are exactly the ones with the most position-dependent shapes. `02-the-forms.md` §4 covers it,
and it is why the Indo-Pak column of the table is listed as a launch blocker in `09-open-questions.md`.
