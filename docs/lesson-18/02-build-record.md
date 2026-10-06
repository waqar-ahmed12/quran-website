---
tags: [lesson-18, al, moon-sun, build-record, built]
---
# 02 — Build record: what was built, measured and checked

**Part of** [[docs/lesson-18/README|Lesson 18]] · previous [[docs/lesson-18/01-design|01 Design]] · [[MAP]]

*2026-09-30. The user: "make the lesson 18 if it is next, be sure to do the obsidian graph, also do the thing that you self evaluate by taking
screenshots for overall feel". Taken as the yes to the README's three recommendations, as lessons 4–17 took theirs. This note is the one place that
says what was **built**; [[docs/lesson-18/01-design|01]] says what was **decided**.*

## Where it sits

- **Above it:** [[docs/lesson-18/README|Lesson 18]] · [[docs/pass-2/README|Pass 2]] (lessons 15–29) · [[QAIDA-BUILD]] (this is **step P2**, third of its lessons) · [[MAP]]
- **Before it:** [[docs/lesson-17/README|Lesson 17, the round taa and the end yaa]] (the second kit) · **after it:** [[docs/lesson-19/README|Lesson 19, the joining alif]] (the alif of Al-, skipped mid-verse)
- **What it stands on:** [[docs/lesson-16/08-build-record|Lesson 16's build record]] (the rule page) · [[docs/lesson-17/02-build-record|Lesson 17's]] (the `KITS` registry) · [[docs/lesson-14/README|Lesson 14]] (the jazam) and [[docs/lesson-15/README|Lesson 15]] (the shadda), the two marks the lesson reads · [[docs/your-voice/README|Say it and listen back]]

## 1. What was built

| File | New? | What it is |
|---|---|---|
| `tools/fetch-qaida-words.js` | new | copies every reference named in `al.js` from Quran.com, both scripts, unmodified, into `rule-words.js` |
| `site/qaida/rule-words.js` | new | the 24 copied words (12 of the drill, 12 of the reading page), ASCII with `\u` escapes |
| `site/qaida/al.js` | new | the third rule kit: twelve words by reference, the lit parts, names, board, echo, riders, walkthrough and reading list |
| `site/qaida/lesson-18.html`, `exercise-18.html` | new | the page and the reading page; no Arabic typed in either |
| `site/qaida/rule-lesson.js` | edit | a `words` board (two samples, a list per kind, the lit word, the sun letters), the lit echo, riders in `usePool`, a word's own titles |
| `site/qaida/spell.js`, `exercise.js` | edit | an entry with a `ref` is a copied word (three steps; twelve references); no other entry has one |
| `site/qaida/voice.js` | edit | `open(kind, glyph, name, shown)`: an optional 4th argument, so a word is kept under its reference and shown as its text |
| `site/qaida/shell.js` | edit | row 18 built, `progress: 'drill'`, no `cp` |
| `site/qaida/qaida.css` | edit | the word tile, the lit band, the five-across list, the sun letters |
| `tools/qaida-lesson18-check.js` | new | data half and page half in one file, 206 checks |
| `tools/qaida-check.js`, `qaida-lesson17-check.js` | edit | "lessons 1–18 are built"; Lesson 17's Next is a link now |
| `docs/lesson-18/`, `MAP.md`, `QAIDA-BUILD.md` | edit | this folder, the graph, the step log |

**Not edited:** `marks.js`, `mark-lesson.js`, `practice.js`, `audio.js`, `rules.js`, `ends.js`, `qaida-options.js`, `recordings.html` and every
`lesson-4…17.html`. The fence for lessons 4–15 passes; Lessons 16 and 17 pass unchanged but for Lesson 17's Next.

## 2. Where the build differs from the plan, and why

1. **The other kind rides along in parts 1 and 2.** One kind is one answer, so the engine could not ask ([[docs/lesson-18/01-design|01]] §3). Found by
   looking at the page, then proved by the check.
2. **`rule-words.js`, not `rule-words.json`.** A page reads it synchronously and the checks load it like any file ([[docs/lesson-18/01-design|01]] §2).
3. **The lit parts are found by a letter-and-marks regex, not `Intl.Segmenter`** ([[docs/lesson-18/01-design|01]] §4).
4. **No new recording**, though the plan said a dozen words. The words are the teacher's to record, under their references; none are asked of the
   recordings page (still 447 rows).
5. **Ships in both scripts**, with one honest line for the Indo-Pak student, where the plan asked whether to ship Madani first.
6. **Two lines added that the plan did not name:** "Trace this word" and "Say this word" (a word's name is what the laam does, not what is written), and a
   per-word verse mark ("1:2") under each tile, so the copy is always visible.

## 3. The checks, and what was measured

```
node tools/qaida-lesson18-check.js   the copy, the words, the engine, the page (206 checks)
node tools/qaida-lesson17-check.js   Lesson 17, Next now goes to Lesson 18
node tools/qaida-rules-check.js      Lesson 16, unchanged
node tools/qaida-check.js            the engine and the data of every lesson, and the fence (lessons 4-15)
```

All 20 scripts in `tools/` pass. The lesson check proves, among others: every reference `al.js` names is in `rule-words.js` in both scripts, and the file
holds nothing else; every word holds only letters, tatweel and marks the student has met; every word begins with an alif and a laam; **a moon word has a
jazam on the laam and a moon letter after it, and a sun word a bare laam and a shadda on a sun letter, in both scripts**; the units of every word,
joined, are the copied word **exactly**; five moon letters and five sun letters, all different; parts of 5, 5 and 12; the same ids in both scripts and
credit kept across a switch; 300 questions through the real engine, always two choices; **part 1 with no riders cannot ask at all, and the riders
count for nothing toward "ready"**; the board, its dim words in each part, every line in both scripts and both name sets; the walkthrough and the
reading page; and that every line of wording has a text field.

**Self-evaluated in the browser pane by screenshot** (desktop pane and 375px; both scripts; all three parts; the board, the question, a wrong answer,
"Write it", "Say it", the walkthrough, the reading page). What the screenshots found, and what was done:
- **Parts 1 and 2 showed "Something is missing here"**: the riders (§2 item 1).
- **The lit band was a tall stripe** across the whole line box; it is a band across the letters now.
- **The silent laam all but vanished on the paper tile** (the page's grey is made for the dark page); a tile uses its own colours now.
- **A raw `{jazam}` token** showed in a row's label; every label goes through the student's own words now.
- **Five words wrapped four and one** on the list; five across where it fits, and the last line centred.
- **The writing board and the Say it panel were titled with the answer** ("Trace The laam is read"); they say "this word".

Measured at **375px**, both scripts, all parts: no horizontal overflow; the tightest side clearance of a word in its tile was **18.9px** (Madani,
1:1:3) and the question's word was never nearer than **99px** to the prompt's sides. The word fills the writing board and is centred on its ink.
**Not measured, and left for the user:** the page on a real phone, and how the Indo-Pak words feel in the stand-in face.

## 4. Still the user's

- **The look:** the lit band on the laam and the letter after it, in both scripts; and the **Indo-Pak words in the stand-in face**, against a printed
  Indo-Pak Qur'an. The decision "ship with the stand-in, or hold Indo-Pak until the Qur'an font is in" ([[docs/lesson-18/01-design|01]] §9).
- **The words** (all Claude's candidates, from Quran.com): the twelve of the drill, the twelve of the reading page, and the three of the walkthrough with
  their sounds ("al", "hamdu", "sh-shamsu", "l-laahu").
- **The wording**, every line a text field: the two names, the two echo lines, the verdict, the three same-lines, the two script lines, the font note.
- **Recordings:** one per word, under its reference, when the teacher is ready; hearing practice opens by itself for the words that have one.

## 5. What Lesson 19 inherits

`rule-words.js` and its fetch tool: Lesson 19 (the joining alif) adds its kit file to `KIT_FILES` and names its words by reference. The lit-part
machinery (`unitsOf`, the `unit[data-role]` band) is ready for "the alif that is not read". The drill glue `rule-lesson.js` still copies from
`mark-lesson.js` has **not** been extracted: Lesson 18 needed only the riders and the words board, so the extraction waits for a lesson that
really needs to share it.
