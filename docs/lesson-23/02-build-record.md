---
tags: [lesson-23, al-fatiha, verse-page, build-record, built]
---
# 02 — Build record: what was built, measured and checked

**Part of** [[docs/lesson-23/README|Lesson 23]] · previous [[docs/lesson-23/01-design|01 Design]] · [[MAP]]

*2026-10-06. The user: "do the next lesson". It was taken as the yes to the README's recommendations: Al-Fatiha before the tajweed lessons, shown and never scored.
This note is the one place that says what was **built**; [[docs/lesson-23/01-design|01]] says what was **decided**.*

## Where it sits

- **Above it:** [[docs/lesson-23/README|Lesson 23]] · [[docs/pass-2/README|Pass 2]] (lessons 15–29) · [[QAIDA-BUILD]] (this is **step P3**, the first verse page) · [[MAP]]
- **Before it:** [[docs/lesson-22/README|Lesson 22, stopping]] · **after it:** [[docs/lesson-24/README|Lesson 24, noon and tanween]] (step P4, the first rule lesson after the Fatiha)
- **What it stands on:** [[docs/lesson-22/02-build-record|Lesson 22's build record]] (the stop signs the notes point to) · [[docs/lesson-18/02-build-record|Lesson 18's]] (the first copied words, `fetch-qaida-words.js`, which this lesson's fetch tool is modelled on) · [[docs/lesson-21/02-build-record|Lesson 21's]] (the title glyph, the home's progress kinds) · Lesson 1 (keeps which letters have been seen, as this keeps which verses have been read) · [[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §9 (Quran.com's Indo-Pak text is tied to its font) · [[docs/pass-2/03-open-questions|pass-2/03]] §3 and §5 (the fonts, whose voice)

## 1. What was built

| File | New? | What it is |
|---|---|---|
| `tools/fetch-qaida-verses.js` | new | copies a surah from Quran.com, both scripts, word by word, unmodified, into `verse-words.js` with a SHA-256; prints references and code points, never the words; takes `1` or `105-114` for Lesson 29 |
| `site/qaida/verse-words.js` | new, generated | Al-Fatiha: 29 words in 7 verses, ASCII with `\u` escapes, hash `e194009bf5d9…`; **never edited by hand** |
| `site/qaida/fatiha.js` | new | the kit: 20 kinds (each a test of the word's text and the lesson that taught it), the notes of all 29 words by reference, and the three words spelled through |
| `site/qaida/verses.js` | new | the verse page: the verse, its words as buttons, a word's card, the whole surah, the spell-through, progress, Say it and Write it |
| `site/qaida/lesson-23.html` | new | the page; no Arabic typed (the title glyph is numeric references); a text field for every line |
| `site/qaida/shell.js`, `home.js`, `index.html` | edit | row 23 built, `progress: 'verses'`, `verses: 7`; the home card says "3 of 7 verses read" in its own words |
| `site/qaida/qaida.css` | edit | the verse page's rules (the Qur'an face variable, the verse line, word buttons at 44px, the card, the surah, the spell-through) |
| `site/qaida/qaida-options.js` | edit | a "The verse" section for a page that is read: verse size, line space, how a picked word looks, the surah run-on or a verse to a line |
| `tools/qaida-lesson23-check.js` | new | data half, kit half and page half in one file, 110 checks |
| `tools/qaida-check.js`, `qaida-lesson18-check.js` to `qaida-lesson22-check.js` | edit | "lessons 1–23 are built"; Lesson 22's Next is a link now |
| `docs/lesson-23/`, `MAP.md`, `QAIDA-BUILD.md` | edit | this folder, the graph, the step log |

**Not edited:** `practice.js`, `rule-lesson.js`, `rules.js`, `marks.js`, `mark-lesson.js`, `stop.js` and every other kit, `audio.js`, `voice.js`, `recordings.html` and every
`lesson-4…22.html`. This page loads **no drill and no rule page**; the check proves it.

## 2. Where the build differs from the plan, and why

1. **The notes depend on the script.** The plan's table gave one list of notes a word. The copy says the two mushafs print some words differently (a standing zabar or an
   alif; a jazam on a yaa; a stop sign at a verse's end), so a note is **listed once and shown only where it is true of the word in the student's own script**
   ([[docs/lesson-23/01-design|01]] §4). The check proves every note is true somewhere and nothing printed goes unexplained.
2. **Two private-use characters in the copy** (Indo-Pak 1:7:4 and 1:7:9). Left out at draw time, kept in the copy. The plan expected the Qur'an font to draw them.
3. **A new kind, `sign`** (a small stop sign after the word, pointing to Lesson 22), because Indo-Pak prints one at most verse ends and the page would otherwise leave a mark unexplained.
4. **Two of the plan's notes were wrong as written:** 1:7:2 is a shadda on the laam, not "Al- before a sun letter"; and the Indo-Pak name of Allah has no shadda to point at, so the note
   says "run together, said as one doubled laam".
5. **The laam of Allah (light or heavy) is not noted**, though the plan listed it under Lesson 27: the heavy-letters test is the seven heavy letters, and the laam is Lesson 27's to explain.
6. **No hearing yet.** *Hear the verse* and *Hear the word* are hidden where there is no recording, and a line says so; *Say it* works. Whose voice reads the verses is still open.
7. **The Madani face is Amiri Quran, not the lesson font**; Indo-Pak stays in the stand-in with an honest line. No Qur'an font was added or downloaded.
8. **No exercise page** (nothing to practise), so there is no `exercise-23.html` and no recordings-page row; the recordings page still lists 447 rows.
9. **A verse counts as read** when a word is tapped, it is heard or said, or the student moves on, because reading cannot be checked.

## 3. The checks, and what was measured

```
node tools/qaida-lesson23-check.js   the copy, the kit, the page (110 checks)
node tools/qaida-lesson22-check.js   Lesson 22, Next now goes to Lesson 23
node tools/qaida-check.js            the engine and the data of every lesson, lessons 1-23 built
```

All 25 check scripts in `tools/` pass (exit code 0). The lesson check proves, among others: the copy is exact (**the hash is recomputed**), is ASCII, and holds private-use characters
**only** in the two named words; every reference `fatiha.js` names is a word of the copy and **no Arabic is typed** in the kit, the page or `verses.js`; the units of every word joined
are the word exactly in both scripts; every note is true somewhere, none is idle, every word shows a note in each script, nothing printed goes unexplained; the joining alif, the
start, the hamza, the article and the stop are in place by position; every kind points to the lesson that taught it and a note about a later lesson says so and leads nowhere; the wording
holds no number, tajweed word or meaning; every verse is drawn **as the copy minus its private-use signs, in both scripts**; reading all seven marks the lesson done; Start again asks
twice; the whole surah is the copy; Say it opens on the verse or the word under its reference; the three words are cut without losing a letter; the home links to the page and counts it.

**Looked at in the browser pane** (desktop and 375px; both scripts): the page draws; verse 7 draws in both scripts; the word card, with its links; the spell-through; the home card. **At 375px:
no overflow in any of the seven verses in either script, and no word button under 44px** (one was 37px until `.verse-word` was given `min-width: 44px`). No console errors.
The checks cannot see how a face draws a verse; that was looked at by eye, not measured.

## 4. Still the user's

1. **Look at the Madani verses** against a printed mushaf: the open-head jazam in Amiri Quran, the verse-end sign around its number, the wavy line on الضآلين.
2. **The Indo-Pak look.** It is the stand-in (Noto Naskh): its yaa and haa are the Arabic ones. A licensed Indo-Pak Qur'an face is **still the launch blocker**.
3. **Whose voice reads the verses**, and one recording per verse and per word ([[docs/pass-2/03-open-questions|pass-2/03]] §5). Hear opens by itself when a recording is in.
4. **The words:** every note, the lines on the page and **the sounds in the three spelled words** ("ra / bbi", "as-si / raa / ta", "ad-da / aa / llee / na") are Claude's candidates.
5. **Whether a stop sign at a verse's end needs a fuller line** than "it tells you whether to stop here": Indo-Pak's small laam-alif ("do not stop") at a verse's end is the case a teacher will have a view on.
