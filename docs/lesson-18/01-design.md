---
tags: [lesson-18, al, moon-sun, spec]
---
# 01 — Design: the twelve words, the copy, the lit parts, the riders

**Part of** [[docs/lesson-18/README|Lesson 18]] · next [[docs/lesson-18/02-build-record|02 Build record]] · [[MAP]]

*Written 2026-09-30, the day Lesson 18 was built: the plan was one file (the [[docs/lesson-18/README|README]]), and [[QAIDA-BUILD]] says a rule
lesson becomes a full folder before it is built. This note holds the reasons the code comments point at ("docs/lesson-18/01 §N");
[[docs/lesson-18/02-build-record|02]] says what was built and measured.*

## 1. What it teaches

**Al-** (an alif and a laam) at the front of a noun means "the". Its laam is **read** before a moon letter, and the laam then carries a jazam;
it is **not read** before a sun letter, and the laam is bare while the letter after it carries a shadda. The student reads which it is from the
marks alone. The name **Allah** is Al- and lah: the laam is a sun letter, so it doubles. The page is [[docs/lesson-16/03-the-rule-page|the rule
page]]; the **kit** ([[docs/lesson-17/01-design|Lesson 17's idea]]) is `al.js`.

## 2. The first Qur'an words: copied, never typed

The rules of this pass *are* the mushaf's spelling, so an ordinary spelling would teach the wrong thing ([[docs/pass-2/02-page-types-and-questions|pass 2,
page types]] §3). So a word is **named by reference only**, `"surah:verse:position"`, and its Arabic is in `rule-words.js`, which
`tools/fetch-qaida-words.js` wrote from Quran.com, **unmodified, in both scripts**. The tool reads the references straight out of `al.js`, so a word
is named in one place and the file cannot drift from it. The file is **JS, not JSON** (the plan said `rule-words.json`): a page reads it
synchronously from a `<script>`, and the node checks load it like every other file. Every non-ASCII character is written as a `\uXXXX` escape, so a
combining mark is never invisible in a diff.

**Choosing the words** was done from data, not memory: 212 words that begin with the article were scanned in 29 short surahs, and a word was kept only
if, **in both scripts**, it held nothing the student has not met (no madd, no stop sign, no silent-letter circle, no direction mark, none of Quran.com's
private-use signs) and stood **in the middle of its verse** (a verse's last word carries a stop sign in Indo-Pak). The check proves it, for every word.

| Kind | Words (surah:verse:position) |
|---|---|
| moon (5) | 1:2:1 الحمد · 98:1:7 الكتاب · 95:3:2 البلد · 94:5:3 العسر · 100:8:3 الخير |
| sun (5) | 1:1:3 الرحمن · 75:9:2 الشمس · 99:6:3 الناس · 92:3:3 الذكر · 54:1:2 الساعة |
| Allah (2) | 112:1:3 (mid-verse) · 112:2:1 (a verse's start, where an Indo-Pak alif carries its zabar) |

Five moon letters and five sun letters, each different. **Left out on purpose:** الكتاب at 2:2:2 (Quran.com's Indo-Pak text has a swash kaf there,
U+06AA, [[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §9; 98:1:7 is the same word with a plain kaf), the words where the article's laam and
the word's own laam are one laam with a shadda (الذي, الليل: a spelling surprise, left to Lesson 21), and لِلَّه (no article).

## 3. The parts, the questions, and why the other kind rides along

Parts of **5, 5 and 12**: "Moon letters", "Sun letters", "Both, and Allah". Every answer is one of **two names**, "The laam is read" and "The laam is
not read" (Allah is the second), and the question is "Is the laam read in this word?".

**The plan could not be built as written.** A part of moon words alone has one name, and the engine never offers one name twice, so it cannot build
a question ([[docs/lesson-2/02-practice-engine|the engine]]); and if it could, the answer would never change. Found by measuring, not by reading: the
page showed "Something is missing here", and the check proves it (`part 1 with no riders cannot ask a question at all`). So **parts 1 and 2 are handed
the other kind as well, not required** (`ridersOf` in `al.js`, `usePool` in `rule-lesson.js`): the same `required: false` the mark lessons' review
letters have. They are asked, they are the other answer, and they count for nothing toward "you seem ready", which is still the part's own words.
Part 3 has every word. The check proves the drill's total is still 5, 5 and 12, and that knowing only the riders never makes a part ready.

A wrong answer shows **the same word again with its two places lit**, and the line for its kind says why ("The laam has a jazam, so it is read:" / "The
laam is bare and the next letter has a shadda, so the laam is not read:"). Every answer is a name, never a picture: the reverse question is not built.

## 4. The lit part of a word

A word is split into letters with their marks (`lettersOf`: a base and every combining mark after it; tatweel is a base of its own, and its small alif
attaches to it), and the alif is unit 0, **the laam unit 1, the letter after it unit 2**. A moon word lights its laam (`read`); a sun word and Allah light
the laam (`silent`) and the letter after it (`twice`). The plan said `Intl.Segmenter`; the regex does what the Segmenter does for these texts and does
not depend on a browser that has it (Firefox before 125). The check proves the units, joined, are **the copied word exactly**, in both scripts.

A lit place is a `<span>` holding only a colour and a tint, which does **not** break Arabic joining (measured, both scripts). The tint is a band
across the letters (30% to 80% of the box), not the whole line box, which at this size was a tall stripe. Inside a tile the tile's own colours are
used: the page's muted grey all but vanished on paper.

## 5. The sun letters, once

The fourteen sun letters are shown once, from part 2, for the teacher who wants them learnt, **composed by code point** and hidden from a screen
reader. The page itself needs only the marks ([[docs/lesson-18/README|README]], open question 1).

## 6. The two scripts

| | Madani | Indo-Pak |
|---|---|---|
| the alif of Al- | **ٱ (U+0671)**, always | a bare alif; **with its zabar at a verse's start** |
| a moon laam | a jazam, U+0652 | a jazam, U+06E1 |
| a sun laam | bare, a shadda on the next letter | the same |
| Allah | shadda and zabar on the second laam | shadda and **khari zabar** |

The board says one line per script about the alif ("that mark is the next lesson; at the start, say it "a""), each a text field. **Indo-Pak:** Quran.com's
Indo-Pak text is tied to its own font ([[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §9). Until that font is in, the words draw in the
stand-in and look Arabic-style. The lesson **ships in both**, and the Indo-Pak student is told so in one line (`data-font-note`, hidden for Madani): the
plan's decision "Madani first?" is the user's, and this keeps both open.

## 7. Recordings

**None new**, and none asked for by the recordings page (still 447 rows). A word's sound would be the teacher's own, one each, kept under the group
`words` by reference (`audio/manifest.json`). Until then the board's words say nothing when tapped (no wordless hum on the Qur'an), and hearing
practice stays shut, with the page's usual line.

## 8. Words: the walkthrough and the reading page

**Walkthrough** (three; a moon word, a sun word, and Allah; three steps each: the article, the rest, the whole): الحمد *al-hamdu*, الشمس *ash-shamsu*,
الله *Allaahu*. It is the one place a sound is spelled out. **Reading page** (twelve, no meanings): six moon, four sun, two Allah, twelve other words than
the drill's. `spell.js` and `exercise.js` read an entry with a `ref` as a copied word; no other entry has one, so no earlier word can change.

## 9. Open questions for the teacher

1. The sounds said in the walkthrough ("al", "hamdu", "sh-shamsu", "l-laahu") and the three words are Claude's candidates.
2. Indo-Pak: ship with the stand-in font and the honest line (as built), or hold the Indo-Pak side until the Qur'an font is in?
3. Is the plain "moon" and "sun" enough, or should the teacher's own names for them go on the board?
