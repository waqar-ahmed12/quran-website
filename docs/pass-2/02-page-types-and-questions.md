# 02 — Page types, questions, and where the examples come from

The first pass has one kind of lesson page for marks: `mark-lesson.js`, driven by `marks.js`. An item is a **letter
with something on it** (بَ, بَا, اَبْ), and the question is "which is this?". This pass needs two more kinds of page,
because from Lesson 18 the thing being taught is no longer on one letter. It is **how a word is read**.

## 1. Three page types

| Page | Lessons | Item | Built in |
|---|---|---|---|
| **Mark lesson** (`mark-lesson.js`, `marks.js`), existing | 15 | a letter with marks, after Lesson 14's lead | exists; Lesson 15 adds `cp` as a list and a per-script place |
| **Rule lesson** (`rule-lesson.js`, `rules.js`), **new** | 16–22, 24–28 | a small fixed set of forms (16, 17: a hamza on its seat, a round taa); then **a Qur'an word or word pair** (from 18), with the part the rule is about marked | **Lesson 16**, with the full treatment Lesson 4 gave `mark-lesson.js` |
| **Verse page** (`verses.js`, `verses.json`), **new** | 23, 29 | a whole verse, word by word | **Lesson 23** |

**Why not stretch `mark-lesson.js`:** its items are (letter, mark) pairs, its board is a table of the 27 letters, and
its twins are the same letter with another mark. None of that fits "مِن نَّارٍ, the noon merges". The rule lesson
reuses what is not about letters: `practice.js` (unchanged, `§2`), the rail of parts, the advice, "Write it", "Say it",
the Spell block, the options panel, the progress bar. Only the board and the items are new. That is the same split
Lesson 4 made from Lesson 2.

**The rule lesson's board**, in outline (Lesson 16's full plan specifies it):
- **before and after**: the word as written, and the part the rule is about lit (the halo idea, on a word);
- **the rule in one line**, plain words, the traditional name once;
- **the table**: every example of the part, in its script, with its reference (surah:verse) small beneath;
- **per-script lines** where the two mushafs print the rule differently (`01` §5), using Lesson 11's mechanism.

## 2. Four kinds of question

| Question | Asks | Engine | Where it is used |
|---|---|---|---|
| **Name it** | a picture, pick its name | exists (on the rule page, the same format with a different board) | 15, 16, 17, 28 |
| **Which way is it read?** | a word, pick the rule's plain name ("the laam is read" / "the laam is not read") | **exists.** `practice.js`'s `distractorsFor` never shows the same answer twice, so if many examples share a rule name, the choices come out as the rule names, one each | 18, 19, 20, 24, 25, 27 |
| **Tap the letter** — **new** | a word, tap the letter the question is about ("Which letter is not read?", "Where is the bounce?") | **a new format, and the one change `practice.js` needs in this pass.** Its choices are the word's own letters, not other items, and today `makeQuestion` only deals items. The change is additive: a format may bring its own `choicesFor(item)`, and every existing format has none. That is in the spirit of the engine's own comment, "a format is data, not a branch" (`practice.js` line 128). Specified and built with Lesson 21 | 21, 26; lessons 18 and 19 can gain it afterwards (tap the laam or the alif that is not read) |
| **By ear** | hear it, pick the picture | exists, and switches on as recordings arrive | every lesson. **For 24–27 it is the only question that tests the lesson**, because the rule changes a sound, not a shape |

**Stopping** (22) also needs a picture answer: show a word and pick how it is said at a stop (الرَّحِيْمِ → الرَّحِيْمْ). The
wrong answers are the same word stopped wrongly, which is exactly the twins mechanism of the mark lessons.

**Transliteration stays off** (the user's decision, 2026-09-14). No question needs it. The walkthrough's syllables
(`qa`, `la`) stay the one place a sound is spelled out, as they have been since Lesson 4.

## 3. Where the examples come from

**Lessons 15–17: ordinary Arabic spellings**, composed from code points, as every lesson since 8 ("real words, not
quotations"). A shadda, a hamza and a round taa look the same in a dictionary as in the mushaf, apart from the
hamza's seat, which is script-dependent and is Lesson 16's subject. So the rule page must take **composed** items
(16, 17) as well as **copied** ones (18 on).

**From Lesson 18: the Qur'an's own words, copied, never typed.** The rules of this pass *are* the mushaf's spelling
(the joining alif, silent letters, the madd sign, the stop signs), so an ordinary spelling would teach the wrong thing.
So:

- **`tools/fetch-qaida-words.js`** (new, in P2, on `fetch-aayat.js`'s pattern) copies each example from Quran.com's
  word-by-word API (`/verses/by_key/{key}?words=true`) **in both scripts**, unmodified, with its reference (surah,
  verse, word position), into `site/qaida/rule-words.json`. A lesson names its examples by reference only, as
  `"1:1:3"`, never as text.
- **`tools/qaida-rule-words-check.js`** proves that every reference a lesson names exists in the saved file in both
  scripts, and that no Arabic text is typed into `rules.js`.
- The user runs the fetch script themselves and pastes the output (`CLAUDE.md`: "The user prefers to run scripts
  themselves"). `node` is safe on this PC.

**Lessons 23 and 29: whole verses**, fetched the same way by `tools/fetch-qaida-verses.js`: `text_uthmani` and
`text_indopak` for every verse, with the surah's name.

**Quran.com's Indo-Pak text needs Quran.com's Indo-Pak font** (`01` §9). Until a licensed Indo-Pak Qur'an font is in
place, the Indo-Pak side of every *Qur'an* example shows Arabic-style letters and, in whole verses, boxes. The rule
lessons can be built and checked in Madani first, but **Lesson 23 cannot ship in Indo-Pak without the font.**

## 4. What carries over unchanged

Every rule of the first pass: nothing locked; never harsh; no numbers on the page; a text field for every line; looks
shown in the options panel, never asked about in words; "Write it" and "Say it" in every lesson; the progress bar; a
recommendation, never a gate; mixed review (a lesson's own items are the gate, and review rides along). **Mixed
review becomes more valuable here.** The second pass is where a student forgets the first, and the rule pages can
carry first-pass items as review at no cost.
