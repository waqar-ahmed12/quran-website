# 09 — Going in order: nothing is locked any more

**This applies to the whole Qaida, not only to Lesson 2.** It is in this folder because it was decided on the same
day, and because it changes what "finishing Lesson 2" is *for*.

## The decision (the user, 2026-09-19)

> *"If the user wanted to skip they can, but they should also be advised that if they are new, it is recommended to
> go with the flow."*

So: **every lesson opens.** A lesson reached out of turn gives advice first, and then lets the student through.

## What is there now, and why it goes

Step 1 built a chain of locks. That was Claude's call, not the user's, and it is overruled:

- `shell.js:242` — `const isOpen = (n) => n === 1 || isDone(n - 1);`
- `home.js:36-38` — `open` decides the card's state: `done` / `open` / **`locked`**
- `home.js:58-68` — anything not open is rendered as a `<button aria-disabled="true">` with a **lock icon**
  (`home.js:18`), and a tap only says "Finish Lesson 2 first."
- `design-system/quran-landing/pages/qaida.md` §3 and §6 record it: *"a lesson that can't be opened is a `<button>`
  that says why, not a dead link."*

The intention was good — nothing leads nowhere — but it decides for the student. A parent who wants to see lesson
10 before starting, or a returning student who only needs the jazam lesson, is simply stopped.

## What replaces it

**Three honest card states, and no lock:**

| State | When | Card |
|---|---|---|
| **Finished** | `isDone(n)` | gold star, gold hairline, "Finished" |
| **Next up** | the first lesson that isn't finished | gold number and arrow, "Start here" |
| **Later** | anything after that | quiet, reachable, "Comes later" |

Every card for a **built** lesson is a real `<a>`. A card for a lesson that **isn't built yet** stays a
`<button aria-disabled="true">` saying so — that part was always right, because there is genuinely nothing behind
it. The lock icon is only ever about *not built*, never about *not earned*.

**The advice, at the door.** Opening a lesson that isn't the next one shows this before the lesson:

> **This one comes later.**
> If you're new, it's best to go in order — each lesson builds on the one before.
>
> **Take me to Lesson 1** · **Carry on anyway**

- Built on the existing `<dialog>` pattern (`.chooser`, `shell.js:331`), with a quieter look — this is advice, not
  a choice the page needs before it can work.
- **Never shown for Lesson 1**, and never shown for the lesson the student is actually up to.
- **Shown once.** Once "Carry on anyway" is chosen, it is remembered and not asked again. A student who has decided
  is not nagged.
- "Take me to Lesson 1" goes to the **next unfinished** lesson, which is usually Lesson 1 and is named in the
  button so it is never a surprise.
- Escape or a click outside behaves like "Carry on anyway" — the lesson is behind it either way, and a dialog you
  can't dismiss is a lock with extra steps.

## The changes

| File | Edit |
|---|---|
| `shell.js:242` | `isOpen` stops deciding what can be *reached*. Keep it (or rename it `inOrder(n)`) as *"is this the next one to do?"* — the home still needs to know which card is "Next up" |
| `shell.js:134-136` | `blank()` gains `skipped: false`; `read()` validates it with `=== true` like `chosen` and `muted` |
| `shell.js` exports | add `inOrder`, `skipped` / `setSkipped` |
| `home.js:36-38` | the state becomes `done` / `next` / `later`, from `isDone` and `inOrder` |
| `home.js:58-68` | a built lesson is always an `<a>`; only *not built* stays a disabled button |
| `home.js:18, 82` | the `lock` icon is used only for *not built* |
| `index.html:107-111` | three wording changes — `data-locked` becomes "Comes later", `data-locked-note` goes, and the advice's three lines arrive — each with its `data-words-attr` label |
| every lesson page | the advice dialog, copied like the chooser is |
| `qaida.css` | the advice dialog's look, and the "later" card state where `[data-state='locked']` is now (`:1650-1704`) |
| `qaida.md` §3, §6 | *"Nothing leads nowhere"* stays true, but becomes: **every lesson opens; one that comes early says so first** |

## What this does to Lesson 2

Almost nothing — and that is the point. `setDone(2, true)` still fires when the student seems ready. What changes is
what it is *for*: it no longer **unlocks** Lesson 3, because Lesson 3 was reachable all along. It records that the
recommendation was reached, so the home moves "Next up" along and the card reads finished.

The drill engine does not change at all.

## Wording

| Element | Attribute | Text |
|---|---|---|
| the dialog's title | `data-words` | `This one comes later` |
| the dialog's line | `data-words` | `If you're new, it's best to go in order — each lesson builds on the one before.` |
| the back button | `data-template` | `Take me to Lesson {n}` |
| the carry-on button | `data-words` | `Carry on anyway` |
| `<ol class="lessons">` | `data-later` | `Comes later` |
| `<ol class="lessons">` | `data-next` | `Start here` |
| `<ol class="lessons">` | `data-soon` | `Not built yet` (unchanged) |

## Checklist

- [ ] Every built lesson's card on the home is a link; only "not built yet" cards are disabled buttons
- [ ] Opening a lesson out of turn shows the advice, with both ways out working
- [ ] "Carry on anyway" is not asked a second time
- [ ] Lesson 1 never shows it, and neither does the lesson the student is up to
- [ ] Escape and a click outside behave like "Carry on anyway"
- [ ] The card for a lesson that isn't built still says so and still leads nowhere
- [ ] Keyboard: the dialog traps and returns focus (a native `<dialog>` does this for free — use one)
- [ ] `qaida.md` §3 and §6 updated, so the design record stops describing locks
