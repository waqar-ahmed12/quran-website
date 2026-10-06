---
tags: [lesson-17, round-taa, end-yaa, build-record, built]
---
# 02 — Build record: what was built, measured and checked

**Part of** [[docs/lesson-17/README|Lesson 17]] · previous [[docs/lesson-17/01-design|01 Design]] · [[MAP]]

*2026-09-30. The user: "build the next lesson in line". Taken as the yes to the README's three recommendations, as lessons 4–16 took
theirs. This note is the one place that says what was **built**; [[docs/lesson-17/01-design|01]] says what was **decided**.*

## Where it sits

- **Above it:** [[docs/lesson-17/README|Lesson 17]] · [[docs/pass-2/README|Pass 2]] (lessons 15–29) · [[QAIDA-BUILD]] (this is **step P2**, second of its lessons) · [[MAP]]
- **Before it:** [[docs/lesson-16/README|Lesson 16, hamza]] (the first rule page, whose page this one runs on) · **after it:** [[docs/lesson-18/README|Lesson 18, Al-]] (the first Qur'an words)
- **What it stands on:** [[docs/lesson-16/08-build-record|Lesson 16's build record]] (the rule page) · [[docs/lesson-13/README|Lesson 13]] (the long "ee") and [[docs/lesson-8/README|Lesson 8]] (the long "aa"), whose recordings it plays · [[docs/lesson-9/README|Lesson 9]] (khari zabar, the Indo-Pak "aa") · [[docs/your-voice/README|Say it and listen back]]

## 1. What was built

| File | New? | What it is |
|---|---|---|
| `site/qaida/ends.js` | new | the second rule kit: fourteen forms, ids, the drawing per script, names, audio, the two grids, the echo, the parts |
| `site/qaida/rules.js` | edit | `KITS` (the hamza's kit, as the functions it already had), `ENDS`, `endOf`, `hasEnd`, `wordUnits`. The hamza's own functions are untouched |
| `site/qaida/rule-lesson.js` | edit | reads `KITS[data-rule]` and never a rule's own functions; a board for `kit.board === 'ends'` (two shapes, two grids, per-row lines); nothing about the hamza's board moved |
| `site/qaida/lesson-17.html` | new | the page ([[docs/lesson-17/01-design\|01]]), no Arabic typed in it: every form is composed by `ends.js` |
| `site/qaida/exercise-17.html` | new | the reading page, twelve words |
| `site/qaida/spell.js`, `exercise.js` | edit | `WORDS.ends`; a word with an end shape is drawn by `rules.wordUnits`; the walkthrough names a round taa and an end yaa |
| `site/qaida/shell.js` | edit | row 17 built, `progress: 'drill'`, no `cp` |
| `site/qaida/qaida.css` | edit | `--cols` on a grid row (four when unset, so Lesson 16 is unchanged), and a small heading over each grid |
| `tools/qaida-lesson17-check.js` | new | data half and page half in one file, 168 checks |
| `tools/qaida-words-check.js`, `qaida-rules-check.js`, `qaida-check.js` | edit | the round taa and end yaa rules, Lesson 16's Next is a link now, "lessons 1–17 are built" |
| `docs/lesson-17/`, `MAP.md`, `QAIDA-BUILD.md` | edit | this folder, the graph, the step log |

**Not edited:** `marks.js`, `mark-lesson.js`, `practice.js`, `audio.js`, `qaida-options.js`, `recordings.html` and every `lesson-4…16.html`.
The fence for lessons 4–15 passes, and Lesson 16's 163 checks pass unchanged (apart from its Next, which is a link now).

## 2. Where the build differs from the plan, and why

1. **Part 2 is four letters (eight forms), not six.** Twelve forms would need about 18 right answers before "you seem ready"; eight need 12
   ([[docs/lesson-17/01-design|01]] §3).
2. **No new recording.** The plan said "a handful". The lesson plays what Lessons 4–13 recorded on ت, and on the yaa's letter with the long vowel,
   so the recordings page is still 447 rows and the check proves each form's sound is one of them.
3. **The round taa's board is two rows of three** (one mark, two marks; zabar, zair, paish across), not six rows: six tall rows would be about
   900px, and reading a row across says "ta, ti, tu" then "tan, tin, tun".
4. **هُدًى and عِيسَى are not in the reading list** (the plan named both). The first is two zabar and a stop changes it; whether the mushaf marks the
   second's "aa" is the teacher's to say. Two "ee" words (رَبِّى, نَفْسِى) take their places, since the plan had no "ee" example on the reading page.
5. **The rule page was changed once, not copied.** Lesson 16 said "a later step extracts the shared half once Lesson 18 shows what really is shared".
   Lesson 17 needed less: a `KITS` registry, so a rule brings its own forms, names, audio, board and echo, and the page reads them. The drill glue
   is still the copy it was; extracting it is still Lesson 18's step.
6. **A yaa's two names are fixed words** ("End yaa, read “ee”" and "…“aa”"); there is no mark to name. Each is a text field, as every name is.
7. **Both scripts draw the end yaa as ى (U+0649)**, as Quran.com prints it, though Lesson 13's Indo-Pak yaa is U+06CC. One constant.

## 3. The checks, and what was measured

```
node tools/qaida-lesson17-check.js   the data layer, the engine, the recordings, and the page (168 checks)
node tools/qaida-words-check.js      every word of every lesson, with the round taa and end yaa rules
node tools/qaida-rules-check.js      Lesson 16, unchanged (163 checks)
node tools/qaida-check.js            the engine and the data of every lesson, and the fence (lessons 4-15)
```

All 19 scripts in `tools/` pass. The lesson check proves, among others: fourteen forms and ids, distinct and the same in both scripts; parts of 6, 8
and 14; both scripts' drawing of every form, by code point (the small alif on the yaa in Madani, on the letter before in Indo-Pak; the jazam on the
"ee" yaa in Indo-Pak only); 300 questions through the real engine on every part with **never the same name twice**, four choices on parts 1 and 3
and **two on part 2**; mastery surviving a script switch, both ways; the board, its dim cells in each part and its per-row lines; the round taa's
line shown in part 1 and never a yaa's; each script's line shown to its own script only; every `window.qaida` member the options panel reads; no
literal combining mark in any file of the lesson; the walkthrough's steps and captions; and that the recordings page is still 447 rows.

**Measured in the browser pane (2026-09-30):** ink against each tile and the prompt, canvas `measureText` bounds, all fourteen forms, **both scripts**,
all three parts. At **1100px** the tightest clearance was 27.8px at the top, 35px at the bottom and 20.9px at the sides. At **375px**: 17.1px at the
top (Indo-Pak, laam with a khari zabar), 13.4px at the sides, and the prompt (70 questions through part 3) never nearer than 56px at the top or
36px at the bottom. **No horizontal overflow** at 375px or 1100px on either page, and the reading page's twelve words draw in both scripts. Nothing
clips. **Not measured, and left for the user:** how the small alif and the khari zabar *feel* at the tile's size, and the page on a real phone.

## 4. Still the user's

- **The look**, in both scripts: the small alif on the yaa (Madani), the khari zabar on the letter before (Indo-Pak) and the jazam on the "ee" yaa
  (Indo-Pak), against a printed Qaida of each kind.
- **The words** (all Claude's candidates): the three of the walkthrough and the twelve of the reading page, and the two that were swapped in.
- **The wording**, every line a text field: the three lead lines, the two script lines and the yaa rows' "the yaa is (not) read".
- The two questions only a teacher can settle, each with a one-line change waiting ([[docs/lesson-17/01-design|01]] §8): the yaa's code point in
  Indo-Pak, and whether the lead of the round taa should vary.
- **Recordings:** none are asked for by this lesson. A "ta" / "tun" recorded for Lesson 7's tanween on ت is what its tanween forms play.

## 5. What Lesson 18 inherits

`rule-lesson.js` reads a kit, so **Lesson 18 (Al-) is one more entry in `KITS`** plus a board of its own: the first rule lesson whose items are Qur'an
words (copied, never typed: [[docs/pass-2/02-page-types-and-questions|pass 2, page types]] §3). That is the moment to extract the drill glue the rule
page still copies from `mark-lesson.js`, behind the same fence ([[docs/lesson-16/08-build-record|Lesson 16's note]]).
