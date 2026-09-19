# 01 — What Lesson 2 teaches, and the decisions behind it

## The skill

`QAIDA-CONTENT.md`, sequence item 2:

> **Random recognition drill** — same 29 letters, shown out of sequence, not the memorized page order. Catches
> students who can recite the alphabet in order but can't name a letter cold.

That is the whole of it. A beginner learns Lesson 1 as a *sequence*: alif, baa, taa… and each letter is remembered
by the one before it. Lesson 2 breaks the sequence and asks for the letter on its own. A student who can only
recite will find out here, gently, rather than three lessons later when the letters start carrying marks.

## What Lesson 2 is not

- **No new letters.** The pool is exactly Lesson 1's, and it follows the student's chosen script — 29 either way.
- **No marks, no joining, no words.** Those are lessons 3 to 14.
- **No timer, no score, no streak badge, no sound effects.** `design-system/quran-landing/pages/qaida.md` §1 sets
  the direction: elegant, restrained, and calm enough to study on for a long time. `ui-ux-pro-max`'s data suggests
  gamification for "Language Learning"; it was considered and rejected at step 1, for a page a child and an adult
  both use. Progress is told plainly, in numbers and in words.
- **Not a test.** Nothing is timed, nothing is failed, and nothing is taken away. See the three decisions below.

## The three decisions the user made, 2026-09-19

These are the reason this folder exists. Quote them back to yourself before designing anything.

### 1. Finishing is a recommendation, not a gate

> *"Like something like a recommendation that you seem okay, let's move on, or if some letters are wrong, repeat
> them not in a row but increase the frequency, but if more frequent, recommend to go back."*

Three separate instructions in one sentence:

- **"Repeat them, not in a row."** A missed letter comes back — but not as the very next question. It sits out a
  couple of questions first, so the student cannot answer from the correction still on the screen.
- **"Increase the frequency."** A missed letter is then asked *more often* than the rest, until it is known. This
  is why the engine draws items by weight rather than walking a shuffled queue: a queue cannot bring anything back
  sooner. See `02-practice-engine.md` §5.
- **"A recommendation that you seem okay, let's move on"** — when enough of the pool is known, the page says the
  student seems ready and marks the lesson finished. It does not hold them until they are perfect.
- **"If more frequent, recommend to go back."** A letter that keeps coming back wrong earns the opposite advice:
  go back to Lesson 1 and look at it again. Offered as a way back, with the tracing board beside it. **Advice,
  never a block.**

### 2. Mixed review carries all the way

`QAIDA-CONTENT.md` left this open at items 5 and 6 and said to ask at build step 4. Asked and answered:

> **Every later lesson mixes in** earlier material.

So from lesson 5 onward, a lesson's pool is its own items *plus* review items from what came before. **The lesson's
own items are what must be got right; the review items ride along and are never the gate.** The engine gets a
`required: true | false` flag on an item now — unused by Lesson 2, one `filter` to build, and a re-plumb of the
completion logic to retrofit later. Build it now.

Fold the answer back into `QAIDA-CONTENT.md`'s "Still open" list and into `QAIDA-BUILD.md`'s steps 6 and 8, both of
which carry an "Ask first" note about it.

### 3. Skipping ahead is allowed, and advised against

> *"If the user wanted to skip they can, but they should also be advised that if they are new, it is recommended
> to go with the flow."*

**Nothing in the Qaida is locked any more.** Every lesson opens; one reached out of turn gives advice first and
then lets the student through. This overrules Claude's step-1 design, which hard-locks. It changes the Qaida home
and every lesson page, not just Lesson 2 — see **`09-going-in-order.md`**, which specifies it in full.

## How the three fit together

The old model was a chain of locks: finish lesson N to unlock lesson N+1. The new model is a **recommended path**
with three kinds of advice, and no locks anywhere:

| Where | What the student sees |
|---|---|
| A lesson reached out of turn | "This one comes later. If you're new, it's best to go in order." — with a way back, and a way on |
| A letter missed repeatedly, inside a drill | "ذ keeps catching you out." — with a way back to Lesson 1 and the tracing board |
| Enough of the pool known | "You seem to know these. Ready for Lesson 3?" — and the lesson is marked finished |

`setDone(2, true)` therefore no longer *unlocks* anything. It records that the student got the recommendation, so
the home stops calling Lesson 3 "later", and the card reads finished. The drill stays open and keeps working
afterwards: practice is never taken away.
