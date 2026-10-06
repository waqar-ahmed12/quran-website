---
tags: [lesson-22, stopping, stop-signs, build-record, built]
---
# 02 — Build record: what was built, measured and checked

**Part of** [[docs/lesson-22/README|Lesson 22]] · previous [[docs/lesson-22/01-design|01 Design]] · [[MAP]]

*2026-10-06. The user: "start the next lesson build, also tell how much is left", taken (as lessons 4–21 took theirs) as the yes to the README's recommendations:
a composed stopped form beside the printed word, labelled; the everyday signs, the rest on a line. This note is the one place that says what was **built**;
[[docs/lesson-22/01-design|01]] says what was **decided**.*

## Where it sits

- **Above it:** [[docs/lesson-22/README|Lesson 22]] · [[docs/pass-2/README|Pass 2]] (lessons 15–29) · [[QAIDA-BUILD]] (this is **step P2**, the seventh and last of its lessons) · [[MAP]]
- **Before it:** [[docs/lesson-21/README|Lesson 21, letters that are not read]] · **after it:** [[docs/lesson-23/README|Lesson 23, Al-Fatiha]] (step P3, the verse page)
- **What it stands on:** [[docs/lesson-21/02-build-record|Lesson 21's build record]] (two questions kept apart, one letter lit) · [[docs/lesson-20/02-build-record|Lesson 20's]] (copied words, the kit) · [[docs/lesson-19/02-build-record|Lesson 19's]] (`askGroup`) · [[docs/lesson-18/02-build-record|Lesson 18's]] (the first copied words, the `words` board) · [[docs/lesson-16/08-build-record|Lesson 16's]] (the rule page) · [[docs/lesson-7/README|Lesson 7]] (two zabar and the alif after them, read at a stop) · [[docs/lesson-14/README|Lesson 14]] (the jazam) · [[docs/lesson-17/README|Lesson 17]] (the round taa) · [[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §7 (the signs)

## 1. What was built

| File | New? | What it is |
|---|---|---|
| `site/qaida/stop.js` | new | the seventh rule kit: 27 words by reference (15 stop words in five kinds, 12 sign words in four), the rule of how a word ends (`stopKindOf`) and which sign it carries (`signKindOf`) for each script, the stopped form (`saidUnitsOf`, `saidOf`), the lit places, the names, the board (a sign's list brings its sign), the echo lines, the walkthrough and the reading list |
| `site/qaida/lesson-22.html`, `exercise-22.html` | new | the page and the reading page; no Arabic typed in either (the title glyph, the verse-end sign around a one, as numeric references) |
| `site/qaida/rule-words.js` | regenerated | 177 copied words (the earlier 135 byte-for-byte unchanged, plus 42), by `tools/fetch-qaida-words.js` |
| `tools/fetch-qaida-words.js` | edit | reads `stop.js` too |
| `site/qaida/rule-lesson.js` | edit, additive | `ownLine` (a board line may have one wording a script); list headings and row lines through `say` (tokens like `{fatha}`); a sign's list draws its sign; the samples strip draws "Said at a stop:" and the stopped form; the echo draws printed, "said", stopped; the names span found by `data-name-vowel` |
| `site/qaida/spell.js`, `exercise.js`, `shell.js` | edit | `WORDS.stop` is the kit's `WALK` and `READING`; row 22 built, `progress: 'drill'`, no `cp` |
| `site/qaida/qaida.css` | edit | the shared rule-page rules name `stop` too; two lit roles (`end`, `sign`, the sign's tint drawn high); the stopped form; the large sign; the question's word in the text colour |
| `tools/qaida-lesson22-check.js` | new | data half, engine half and page half in one file, 179 checks |
| `tools/qaida-check.js`, `qaida-lesson18-check.js` to `qaida-lesson21-check.js` | edit | "lessons 1–22 are built"; Lesson 21's Next is a link now; the "nothing else" checks read the fifth kit file |
| `docs/lesson-22/`, `MAP.md`, `QAIDA-BUILD.md` | edit | this folder, the graph, the step log |

**Not edited:** `practice.js` (no engine change), `marks.js`, `mark-lesson.js`, `rules.js`, `ends.js`, `al.js`, `wasl.js`, `madd.js`, `silent.js`, `audio.js`, `voice.js`,
`qaida-options.js`, `recordings.html` and every `lesson-4…21.html`. The fence for lessons 4–15 passes; lessons 16–21 pass unchanged but for the "built" rows and Lesson 21's Next.

## 2. Where the build differs from the plan, and why

1. **Only four signs are drilled, and "better to stop" is a different sign in each script.** The plan assumed the two mushafs print their signs in the same places;
   the whole Qur'an says they mostly do not (Madani's jeem is Indo-Pak's taa in 1,591 words). The four meanings both print in the same places are the drill;
   "salaa" and the three dots are on the Madani line ([[docs/lesson-22/01-design|01]] §2).
2. **The answers are names, not stopped spellings.** The plan's part 1 dealt the word "stopped four ways, one right", wrong spellings of the Qur'an's own words as
   answers. The answers are how the word ends ("Ends with a jazam", "Ends with a long 'aa'", "Ends with an 'h'", "Stays as it is"), and the one right stopped
   form is shown, labelled, under the three words on the board and under a wrong answer. No wrong spelling of a Qur'an word is ever on the page.
3. **The stopped form's jazam is the open head in Madani too**, not the copied text's U+0652, which the Madani face draws as a circle like Lesson 21's "not read" ([[docs/lesson-22/01-design|01]] §4).
4. **Verse ends are in, for the first time**: an Indo-Pak verse end carries an invisible U+200F, which earlier lessons kept out; it is allowed here and lit nowhere.
5. **Twenty-seven items**, not "about a dozen words" (those were the recordings): 15 stop words, three of each kind (a fourth vowel word was taken out: four wrapped
   three and one on a phone), and 12 sign words.
6. **The small rectangle (Madani's "read only at a stop")** is a line on the Madani board, not drilled: no word of the drill holds it.
7. **The title glyph is the end of a verse** (the verse-end sign around a one, drawn as one round mark by the title face), not a sign on a tatweel, which floated far above its stroke.
8. **No new recording**; the recordings page still lists 447 rows.
9. **Ships in both scripts**, with Lesson 18's line about the stand-in font, now "letters and signs".

## 3. The checks, and what was measured

```
node tools/qaida-lesson22-check.js   the copy, the words, the rule in both scripts, the stopped form, the engine, the page (179 checks)
node tools/qaida-lesson21-check.js   Lesson 21, Next now goes to Lesson 22
node tools/qaida-lesson18-check.js   (and 19, 20) the "nothing else" checks read stop.js too
node tools/qaida-check.js            the engine and the data of every lesson, the fence (lessons 4-15), lessons 1-22 built
```

All 24 check scripts in `tools/` pass. The lesson check proves, among others: every reference `stop.js` names (42) is in `rule-words.js` in both scripts and **no reference is named
by two lessons**; every word holds only letters, tatweel, the marks of Lessons 4–21, a stop sign and the spaces and invisible marks Quran.com puts with them; **every stop word ends as
its kind says, by the lesson's rule, in both scripts, and any sign on it allows a stop; every sign word carries one sign, its kind's, in the script's own code point**; the stopped
form is the printed word with **only its end changed**, by the rule, and never the printed word; a question lights exactly one place (the last letter, whatever the kind; or the sign);
the same ids in both scripts and credit kept across a switch; parts of **15, 12 and 27**; **450 questions through the real engine**, four answers each, all of the question's own kind;
the board's nine lists, the sign drawn the script's way, the lines (no number, no token left), the echo, the walkthrough, the ways out, and a text field for every line.

**Self-evaluated in the browser pane by screenshot** (desktop and 375px; both scripts; the board, a question of each kind, a wrong answer of each kind, the reading page). What the
screenshots found, and what was done:
- **The copied Madani jazam is a circle like Lesson 21's "not read"** (Scheherazade New: U+0652 and U+06DF side by side are all but the same). The stopped form now uses the open head.
- **The title glyph** (a small jeem on a tatweel) floated far above its stroke: it is the verse-end sign now.
- **The large signs** in the board's headings were smaller than the heading text at 2.25rem: 4rem, on one tatweel.
- **A lit sign was tinted across the empty space it rides on**, and in Indo-Pak (a zero-width space) not at all; and the question's word was gold, so a gold sign on it stood out only
  by position. The tint is drawn high, where the sign is, and the question's word is in the text colour with only its lit place gold.
- **Nested quotes** in a wrong answer ("Ends with a long "aa""): a name's own quotes are single now.
- **On a phone** the three "said at a stop" forms sat at three heights (the captions were one line or two): two lines' room each, measured level. The vowel list (four words) wrapped
  three and one: three words now, and every list is one row of three.

**Measured at 375px, both scripts, every question of parts 1 and 2 (all 27 words seen in each):** the word never nearer than **83.6px** (Madani, 17:39:7) and **95.8px** (Indo-Pak,
39:10:15) to the prompt's sides; the prompt a steady 127px; no tile, stopped form or page overflows; every board list one row; no console error.

**Not measured, and left for the user:** how the signs sit in the Indo-Pak stand-in face against a printed Indo-Pak mushaf, and the page on a real phone.

## 4. Still the user's

- **The four meanings** and the Indo-Pak small taa read as "better to stop", against the list at the end of the teacher's own mushaf ([[docs/lesson-22/01-design|01]] §9).
- **The Madani circle.** Every copied Madani word since Lesson 18 shows its jazam as a small circle, and since Lesson 21 a small circle also means "not read". The stopped forms here
  avoid it; the words themselves cannot be edited to fit a font. **The fix is the Qur'an font for Madani** ([[docs/pass-2/03-open-questions|pass-2/03]] §3: measure Amiri Quran
  first), which Lesson 23 needs anyway. Recommended: settle it before Lesson 23.
- **A laam-alif on a verse end** (1,117 in Indo-Pak): whether to say a student may stop there anyway.
- **The look**: the lit end and sign on the board, the large signs, the stopped forms, the Indo-Pak words and signs in the stand-in face.
- **The words** (all Claude's candidates, from Quran.com): the 27 of the drill, the 12 of the reading page, the 3 of the walkthrough with their sounds ("ad-dee / n", "asa / faa",
  "ad-dalaala / h").
- **The wording**, every line a text field.
- **Recordings:** one per word, read as it is said at a stop, under its reference, when the teacher is ready.

## 5. What Lesson 23 inherits

**Step P2 is done**: lessons 16–22 are built, and the rule page carries seven kits. Lesson 23 (Al-Fatiha) is **step P3 and a new page type**, the verse page
([[docs/pass-2/02-page-types-and-questions|pass-2/02]] §1), and it is blocked on two decisions this lesson made sharper: **the Qur'an fonts** (the Madani circle above; Quran.com's
Indo-Pak verse-end signs are private-use characters that only its own font draws) and **whose voice reads the verses** ([[docs/pass-2/03-open-questions|pass-2/03]] §3 and §5).
From this lesson it takes `stopKindOf` and `saidOf` (every verse of Al-Fatiha ends in a stop) and the four signs. **Next in line:** [[docs/lesson-23/README|Lesson 23, Al-Fatiha]].
