---
tags: [lesson-23, al-fatiha, verse-page, spec]
---
# 01 — Design: the verse page, the notes, and what a note may claim

**Part of** [[docs/lesson-23/README|Lesson 23]] · next [[docs/lesson-23/02-build-record|02 Build record]] · [[MAP]]

*Written 2026-10-06, the day Lesson 23 was built (the user: "do the next lesson"). The plan was one file (the [[docs/lesson-23/README|README]]), and
[[QAIDA-BUILD]] says a lesson becomes a full folder before it is built. The code comments point here ("docs/lesson-23/01 §N"); [[docs/lesson-23/02-build-record|02]]
says what was built and measured. It stands on [[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] (what the two scripts print) and on
[[docs/lesson-22/01-design|Lesson 22's design]] (copied words, a kit that says which lesson explains what).*

## 1. What it is: a page that is read, not drilled

Every lesson since Lesson 4 asks a question and marks the answer. **This one asks nothing.** It is the first **verse page** (`verses.js`, `<html data-surah="1">`, as
a rule page says `data-rule`): it shows the surah the student prays with, in the Qur'an's own text and the student's own script, and says **why each word is read the way
it is**. No question, no score, no wrong answer, no `practice.js`. It is "shown, never scored", like Spell, Say it and Write it.

What is on it, in the order the student meets it:

1. **A verse at a time, large.** Seven numbered buttons, Previous and Next, "Say the verse". Every word is a button.
2. **A word's card**: the word, large; Say it; Write it (the whole word, on the board); and **one line a reason**, each pointing to the lesson that taught it.
3. **The whole surah**, run on as printed, each verse-end sign a way back to its verse.
4. **Three words spelled through a piece at a time** (a doubled letter, the article with a heavy letter, the longest word), the Spell block's method with Qur'an text.
5. **No meanings and no translation**, as every reading page since 2026-09-27. The notes are the Qaida's own wording and never a comment on what a word means.

## 2. The words are copied, never typed

`tools/fetch-qaida-verses.js` reads the surah from Quran.com, **both scripts, word by word, unmodified**, into `site/qaida/verse-words.js` with a SHA-256 of what it saved
(the check recomputes it, so a hand edit is found). A word is named **by reference only**, `"1:6:2"`, in `fatiha.js` and everywhere else. **The verse-end sign is not
saved**: Quran.com sends it as one more "word" (`char_type_name: end`), whose Indo-Pak form is a private-use character, so the page draws its own (U+06DD around the
number in Arabic-Indic digits, as the title glyphs of Lessons 22 and 23 do). 29 words, 7 verses (4, 4, 2, 3, 4, 3, 9; the basmala is verse 1, as Quran.com counts it).

**What the copy holds that a student could see as a box** (found by running the fetch, not by reading the plan): two Indo-Pak words carry **private-use characters** —
1:7:4 (U+E021, after a space, then the small laam-alif) and 1:7:9 (U+E022). They are Quran.com's own signs and only its own font draws them. **The copy keeps them; what
is drawn leaves out exactly those code points (U+E000–U+F8FF) and nothing else.** The check proves both halves: the copy has them in those two words and nowhere else, and
every verse is drawn as the copy minus them.

## 3. The Qur'an fonts

| Script | Drawn in | Status |
|---|---|---|
| Madani | **Amiri Quran** (already loaded by the site) | Seen in the browser pane (by eye, not measured): its jazam is an **open head** like the Madina mushaf's, not the closed circle Scheherazade New draws (the circle that looked like Lesson 21's "not read"). It looks like the better Qur'an face. **Still the user's to look at against the printed mushaf.** |
| Indo-Pak | the stand-in (Noto Naskh) | **Not solved.** A licensed Indo-Pak Qur'an face is not in. The page says so once, in the Indo-Pak student's own line ("drawn in a stand-in, so a few letters and signs may look a little different"). Nothing is blocked: the words are the copied Indo-Pak words and they read. |

The launch blocker `QAIDA-CONTENT.md` names (a licensed Indo-Pak face) is **still open**; this lesson does not close it and does not pretend to.

## 4. A note is only said where it is true: the kit

`fatiha.js` is the kit: for each of the 29 words, a list of **kinds** (a jazam, a shadda, a hamza on an alif, Al- before a sun or moon letter, the name of Allah, the joining
alif read or skipped, a standing zabar, a long "aa", "oo", "ee", "aw", "ai", the wavy line, a stop sign, the stop at a verse end, and the three that come in a later lesson),
and for each kind **a test of the word's own text** (`has`) and **the lesson that taught it**. The wording of each kind is a line in `lesson-23.html`, a text field each.

**The two mushafs print some words differently, so one list cannot be true of both.** Measured on the copy:

- **A standing zabar in Madani is a zabar and an alif in Indo-Pak** (1:6:2, 1:7:1). Both notes are listed; the page shows the one that is true.
- **Indo-Pak puts a jazam on the yaa** (`ذِيْنَ`) and **a stop sign at most verse ends** (U+06D9, U+0615); Madani prints neither. A new kind, `sign`, says "a small stop sign follows this word" and points to Lesson 22.
- **Indo-Pak writes the name of Allah with no shadda** when it stands alone (1:1:2), and with one after the preposition (1:2:2). The note names no mark: "the two laams run together and are said as one doubled laam".
- **Indo-Pak prints a verse-opening Al- with a bare alif** (1:3:1), where Madani has the joining alif. The starting vowel of Al- is a zabar by rule, so `start` is true of an Al- word without the mark being on it.
- **1:7:2 (ٱلَّذِينَ) is a shadda on the laam, not "Al- before a sun letter"**: the written laam carries it, so it says "shadda" and not "sun".
- **A hamza can sit on the second letter** (1:5:3, `وَإِيَّاكَ`): every unit of the word is looked at.
- **A doubled yaa after a hamza is not a long "ee"** (1:5:1): the long-vowel tests refuse a second letter that carries a shadda or a vowel of its own.

**What the check proves:** every note listed is true in at least one script (none is idle); every word shows at least one note in each script; **nothing a script's text
carries goes without its note there**; every kind points to the lesson that taught it; a note about a later lesson says so and leads nowhere; no note holds a number, a
tajweed word, or the meaning of a word; the only tokens are the student's own words for a mark.

## 5. What the student keeps: which verses have been read

Lesson 1 keeps which letters have been seen; this keeps **which verses have been read** (`shell.markSeen(23, "1:5")`). A verse counts as read once a word of it is tapped,
it is heard or said, or the student moves on from it. Reading can't be checked, so the lesson takes the student's own word for it, as the Qaida only ever recommends.
Seven of seven marks the lesson done and the star draws. The home says "3 of 7 verses read" on the card (`progress: 'verses'`).

## 6. The three words spelled through

رَبِّ (a doubled letter), الصِّرَاطَ (the article, a sun letter, a heavy saad) and الضَّآلِّينَ (the longest word, two shaddas, the wavy line). Cut by unit, in each script,
where `fatiha.js` says (the two texts are not cut at the same place). **The sounds said aloud in each piece ("ra", "bbi"…) are Claude's candidates, the one place the Qaida
spells a sound out — the teacher's to check.**

## 7. What it does not do

- **No recording of the verses.** *Hear the verse* and *Hear the word* are **not shown** where there is no recording (a hum in place of a verse would not be a verse),
  and a line says hearing opens when they are recorded. **Whose voice reads them is still open** ([[docs/pass-2/03-open-questions|pass-2/03]] §5). *Say it* works now.
- **No meanings, no translation, no tafsir.**
- **No exercise page.** There is nothing to practise: the lesson is the reading.
- **The laam of Allah (light or heavy), the heavy letters' sound and the noon and meem rules** are named and sent forward ("Comes in Lesson 24 / 25 / 27"): the page
  does not teach them early.

## 8. Wording is the teacher's

Every line a student reads that is not the Qur'an's is a text field in the options panel (a `data-words` line, or one `data-note-*` a kind), as the user asked for every
lesson. The panel also gets a **"The verse"** section (verse size, the space between lines, how a picked word looks, the whole surah run-on or a verse to a line).
