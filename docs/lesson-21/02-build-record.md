---
tags: [lesson-21, silent-letters, tap-the-letter, build-record, built]
---
# 02 — Build record: what was built, measured and checked

**Part of** [[docs/lesson-21/README|Lesson 21]] · previous [[docs/lesson-21/01-design|01 Design]] · [[MAP]]

*2026-10-06. The user: "go ahead and make the next lesson, tell me what lesson number that is", taken (as lessons 4–20 took theirs) as the yes to the README's recommendations
and to the engine change `docs/pass-2/02` §2 left for this lesson. This note is the one place that says what was **built**; [[docs/lesson-21/01-design|01]] says what was
**decided**.*

## Where it sits

- **Above it:** [[docs/lesson-21/README|Lesson 21]] · [[docs/pass-2/README|Pass 2]] (lessons 15–29) · [[QAIDA-BUILD]] (this is **step P2**, sixth of its lessons) · [[MAP]]
- **Before it:** [[docs/lesson-20/README|Lesson 20, the wavy line]] (the fifth kit, the first heard question) · **after it:** [[docs/lesson-22/README|Lesson 22, stopping]]
- **What it stands on:** [[docs/lesson-20/02-build-record|Lesson 20's build record]] (copied words, the lit places, the kit) · [[docs/lesson-19/02-build-record|Lesson 19's]] (`askGroup`, the lit parts) · [[docs/lesson-18/02-build-record|Lesson 18's]] (the first copied words; the silent laam's dim style) · [[docs/lesson-16/08-build-record|Lesson 16's]] (the rule page) · [[docs/lesson-17/02-build-record|Lesson 17's]] (the `KITS` registry) · [[docs/lesson-11/README|Lesson 11]] and [[docs/lesson-13/README|Lesson 13]] (the jazam on the Indo-Pak long wow and yaa, which this lesson is the payoff of) · [[docs/your-voice/README|Say it and listen back]]

## 1. What was built

| File | New? | What it is |
|---|---|---|
| `site/qaida/silent.js` | new | the sixth rule kit: 18 words by reference (6 + 4 + 4 + 4) in four kinds, 12 questions about one letter, the rule for each script (`notReadAt`), the lit places, the names, the board, the echo lines, the answers a tap question deals (`tapChoices`), the walkthrough and the reading list |
| `site/qaida/lesson-21.html`, `exercise-21.html` | new | the page and the reading page; no Arabic typed in either |
| `site/qaida/rule-words.js` | regenerated | 135 copied words (the earlier 102 unchanged, plus 33), by `tools/fetch-qaida-words.js` |
| `tools/fetch-qaida-words.js` | edit | reads `silent.js` too (one word in the list of kit files) |
| `site/qaida/practice.js` | edit | **the one engine change**: a format may bring its own answers (`choicesFor`, `correctFor`); a question carries `correct`; `answer()` judges by it. Every other format is dealt as before |
| `site/qaida/rule-lesson.js` | edit | the tap question's page: the word's letters as buttons (`tapWord`), the "none" button, the two formats (`tapFormat`), the verdict's four tap lines, the marks on the letters after an answer, the keyboard, `askOf(item, group)`, and the gold edge on a word's own tile for a question about one letter (`boardId`) |
| `site/qaida/spell.js`, `exercise.js`, `shell.js` | edit | `WORDS.silent` is the kit's `WALK` and `READING`; row 21 built, `progress: 'drill'`, no `cp` |
| `site/qaida/qaida.css` | edit | the shared rules Lesson 20 wrote now name `silent` too; and the tap rules (target, hover, after-answer marks, an empty answers box takes no room, the word's size) |
| `tools/qaida-lesson21-check.js` | new | data half, engine half and page half in one file, 225 checks |
| `tools/qaida-check.js`, `qaida-lesson18-check.js`, `qaida-lesson19-check.js`, `qaida-lesson20-check.js` | edit | "lessons 1–21 are built"; Lesson 20's Next is a link now; the "nothing else" checks read the fourth kit file |
| `docs/lesson-21/`, `MAP.md`, `QAIDA-BUILD.md` | edit | this folder, the graph, the step log |

**Not edited:** `marks.js`, `mark-lesson.js`, `rules.js`, `ends.js`, `al.js`, `wasl.js`, `madd.js`, `audio.js`, `voice.js`, `qaida-options.js`, `recordings.html` and every
`lesson-4…20.html`. The fence for lessons 4–15 passes; lessons 16–20 pass unchanged but for the "built" rows and Lesson 20's Next.

## 2. Where the build differs from the plan, and why

1. **The plan's showpiece words are out** ([[docs/lesson-21/01-design|01]] §3): the word for "those" (an Indo-Pak hamza-below sign the student has not met) and the word for prayer *with
   its article* (a sun letter: the laam is not read either, and a joining alif besides). The same word without the article is in.
2. **Not four rows but four kinds on three parts**, and **two questions, not one with a third**: the plan's parts 1 and 3 are "tap the letter" and its part 2 "read, or not read?";
   all three are built, with "none" an answer only in the last part.
3. **The alif of *ana* is out**: Madani marks it with U+06E0 ("read only at a stop"), which is a third answer; left to Lesson 22 and the user.
4. **Thirty items, not "about a dozen words"**: the plan's dozen were the recordings; the drill needs 18 words and 12 questions about one letter.
5. **A wow carrying "aa" is not read as a wow in either script**, so the lesson says so in both and the Madani line for it is the small alif, not the circle (the plan's table
   said "no 'w'" for Madani too, and left the sign out).
6. **The tap target is the letter's own box, widened by a pseudo-element**, not invisible buttons laid over measured ink: a span's box already follows the letter in a joined word, and
   the measuring the plan proposed would have needed the halo's ink measuring on every font ([[docs/lesson-21/01-design|01]] §5).
7. **The word is bigger than Lesson 20's**, on purpose (the target).
8. **No new recording**, and the recordings page still lists 447 rows.
9. **Ships in both scripts**, with Lesson 18's one honest line for the Indo-Pak student about the stand-in font.

## 3. The checks, and what was measured

```
node tools/qaida-lesson21-check.js   the copy, the words, the rule in both scripts, the engine, the page (225 checks)
node tools/qaida-lesson20-check.js   Lesson 20, Next now goes to Lesson 21
node tools/qaida-lesson19-check.js   Lesson 19, the "nothing else" check reads silent.js too
node tools/qaida-lesson18-check.js   Lesson 18, the same
node tools/qaida-check.js            the engine and the data of every lesson, and the fence (lessons 4-15)
```

All 23 check scripts in `tools/` pass. The lesson check proves, among others: every reference `silent.js` names (33) is in `rule-words.js` in both scripts and **no reference is named by
two lessons**; every word holds only letters, tatweel and the marks the student has met, plus the circle **in Madani only**; **the rule finds the same one letter in both scripts** for
every word of the drill, the reading page and the walkthrough (and none in a word of "none", which holds a long vowel that is read); the letters of every item, joined, are the copied word
exactly; a tap question lights nothing and a question about one letter lights exactly one; **"read" lights a letter with no circle (Madani) and a mark on it (Indo-Pak)**; the same ids
in both scripts and credit kept across a switch; parts of **14, 12 and 30**; **450 questions through the real engine** (tap with the letters in reading order and "none" only in
part 3, lit letters with exactly "Read" and "Not read"), the engine judging a tap by `correct`; an ordinary question's `correct` still its item's id; the board, its lines (none holds
a number), the five verdict lines, the nine echo lines, the walkthrough's three steps for each of its three items, the keyboard, and that every line of wording has a text field.

**Self-evaluated in the browser pane by screenshot** (desktop and 375px; both scripts; the board, a tap question in parts 1 and 3, a wrong tap, a lit-letter question, the reading page).
What the screenshots found, and what was done:
- **The right letter's highlight was a tall stripe** (the whole line box, 164px): the same thing Lesson 18 fixed. It is the band now (30% to 80% of the box), also on hover.
- **"Not that one. the alif…"** read badly: the sentence now says "Not that one. In this word, the alif after the wow is not read."
- **The tap targets were too small on a phone** (the narrowest letter 29.8px at a 56px word): the word now grows with the screen; **at 375px 74px, the narrowest target 39.4px**, the word never
  nearer than **54.6px** to the prompt's sides across 80 questions in each of parts 1 and 2, no horizontal overflow, the prompt a steady 145px tall.

**Not measured, and left for the user:** the page on a real phone (a finger on a 39px target), how the circle and the bare letters sit in the Indo-Pak stand-in face, and the
Indo-Pak rule against a printed Indo-Pak Qaida.

## 4. Still the user's

- **The Indo-Pak rule in words**: "a wow or yaa with no mark is not read; an alif with no zabar before it is not read" (87% of the Qur'an's circles agree, [[docs/lesson-21/01-design|01]] §2). The
  teacher confirms it.
- **Tap targets**: 39px at the narrowest on a 375px phone; the site's own minimum is 44px.
- **The look**: the lit places on the board, the dim letter in the tile, the letters after an answer, and the Indo-Pak words in the stand-in face.
- **The words** (all Claude's candidates, from Quran.com): the 18 of the drill, the 12 of the reading page, the 3 of the walkthrough with their sounds ("aaminuu", "li-u / lee",
  "al-haya / aati").
- **The wording**, every line a text field: the six names, the question's three lines, the seven verdict lines, the nine echo lines, the two script lines, the board's lines, the
  walkthrough's six lines.
- **Recordings:** one per word, under its reference, when the teacher is ready (no question is heard here).
- **The alif of *ana***, if it should be taught (a third answer, "read only when you stop").

## 5. What Lesson 22 inherits

**`tapFormat`** is there for Lesson 26 (the bounce: "where is the bounce?") and the "tap the letter" for lessons 18 and 19 to gain afterwards (the laam, the alif) at no cost to the engine.
`item.units` + `answerId` + `tapChoices` is the whole recipe: any rule whose answer is *a letter of the word* needs a kit that says so and nothing in the page. The drill glue
`rule-lesson.js` still copies from `mark-lesson.js` and has **not** been extracted. **Next in line:** [[docs/lesson-22/README|Lesson 22, stopping]], which also teaches the signs Madani and Indo-Pak print for a
stop, and the letters "read only at a stop" this lesson left out.
