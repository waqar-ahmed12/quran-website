---
tags: [lesson-21, silent-letters, tap-the-letter, rule-page, spec]
---
# 01 — Design: the eighteen words, the two scripts' opposite rules, the tap question, the thirty items

**Part of** [[docs/lesson-21/README|Lesson 21]] · next [[docs/lesson-21/02-build-record|02 Build record]] · [[MAP]]

*Written 2026-10-06, the day Lesson 21 was built: the plan was one file (the [[docs/lesson-21/README|README]]), and [[QAIDA-BUILD]] says a rule lesson becomes
a full folder before it is built. This note holds the reasons the code comments point at ("docs/lesson-21/01 §N"); [[docs/lesson-21/02-build-record|02]] says
what was built and measured. It stands on [[docs/lesson-20/01-design|Lesson 20's design]] (copied words, the lit places, the kit) and [[docs/pass-2/02-page-types-and-questions|pass-2/02]]
§2, which specified "tap the letter" and left it to this lesson.*

## 1. What it teaches

**Some letters are written and never read**, and the student has to see them and step over them. The page says "not read", never "silent" as a term of art and
no tajweed word at all. Three kinds of such letter are drilled (the fourth kind of word is the contrast):

| Kind | What it is | Examples (by reference) |
|---|---|---|
| `plural` | the alif after the wow that ends a plural verb | 2:10:11 (*kaanuu*), 2:25:19 (*qaaluu*), 2:6:3, 3:11:7, 2:57:8, 2:14:4 |
| `ulee` | the wow after the hamza in the word for "those with" and the words that start the same way | 4:83:15, 4:59:8, 7:145:18, 65:6:13 |
| `aawow` | a wow that only carries a long "aa" and is not read as a wow | 24:58:17, 53:20:1, 9:103:11, 11:87:3 |
| `none` | every letter is read, long vowels included (so "none" is sometimes the answer) | 4:1:26, 3:7:35, 3:13:11, 2:25:15 |

## 2. The two scripts show it in opposite ways, and that is the lesson

| | Madani | Indo-Pak |
|---|---|---|
| a letter not read | **marked**: a small circle (U+06DF) over it | **left bare**: a wow or yaa with no mark at all; an alif with no zabar (or khari zabar) before it |
| a wow carrying "aa" | a **small alif** (U+0670) on the wow, and no vowel | the **khari zabar** on the letter before it, and the wow bare |
| a long vowel that is read | bare (no mark), as since Lesson 8 | wow and yaa carry a **jazam** (U+06E1); this is what lessons 11 and 13 were for |

`silent.js` finds the letter by each script's own rule (`notReadAt`), never by a position, and the check proves that for every word of the lesson both rules find
**the same one letter** (by its base), and that a word of "none" has none under either rule.

**What the whole Qur'an said about the Indo-Pak rule** (77,429 words, both scripts, scanned 2026-10-06 against Quran.com): Madani writes the circle in **3,970**
words. In **3,442 (87%)** the Indo-Pak rule as stated finds exactly as many letters. In the other **528** it does not: **461** are a word where Madani has one circle
and the rule finds two (129 of them hold a joining alif, which Lesson 19 teaches and Madani marks with its own sign, not a circle), **47** where it finds none (13 of
them a wow that carries the wavy line), and **20** with two or three. And the rule finds a bare letter in **3,903** words where Madani writes no circle at all (the joining
alif; the alif after a tanween; the laam of Al-). So the line the Indo-Pak student reads is **true of the words chosen here and a good rule of thumb elsewhere**, and it is
the user's Indo-Pak teacher's to confirm (the README's open question 2). The words of this lesson were chosen so that **both scripts have the same one answer**; the check
proves it, so the page never says a thing the data contradicts.

## 3. The words: chosen from data

Copied by `tools/fetch-qaida-words.js` into `rule-words.js`, in both scripts, unmodified; `silent.js` is its fourth kit file and **no Arabic is typed in it**. The whole Qur'an
was scanned, and a word was kept only if, **in both scripts**, it held nothing the student has not met (the circle, in Madani, is the one addition), was not the last word
of its verse (a private-use verse-end sign in Indo-Pak), and the rule found **exactly one** letter not read (or none, in the contrast words).

**What the scan found, which corrected the plan:**

- **The plan's showpiece words did not survive.** The word for "those" (the one with a hamza on a yaa) is written in Indo-Pak with a dotless seat and a hamza-below mark
  (U+0655), which the student has not met, so it is out. **The word for prayer and for alms with the article is out**: their article starts with a *sun* letter, so the laam is
  not read either, and the joining alif is skipped when joined: two or three letters not read in one word, which no tap question can ask. The same word **without** the
  article (24:58:17) is in.
- **A wow with the small alif is not always silent.** A wow with a *vowel* and the small alif (the plural of "wealth": *amwaal*) is read: *waa*. Only a wow with the small alif
  **alone** carries the "aa" and is not read. Of the words in the whole Qur'an that have one, **four** have no article and hold only what the student has met (24:58:17, 53:20:1,
  9:103:11, 11:87:3); the rest carry the article (Lesson 18's laam, and for the word for prayer and alms a joining alif besides) or the small meem signs of Lesson 24 (U+06ED, U+06E2).
- **The alif of *ana* ("I") is left out**: Madani marks it with a different sign (U+06E0, the small rectangle: "read only at a stop"), so it is a third answer, not "not read".
  The README recommended a one-word exception; it is the user's to add (an item with a third name), and Lesson 22 (stopping) is where it belongs. The check proves no word of
  the lesson holds U+06E0 (or any stop sign).
- **Sukun-wow words are out** (a plural verb whose wow is a consonant, like *yaraw*): the Madani wow carries a sukun and the Indo-Pak a jazam, the same sign as the long wow, so a
  student would learn the wrong thing from the contrast.
- **Words that need only what is met:** every word holds only letters, tatweel and marks of Lessons 4–20; in Madani the circle.

## 4. Thirty items, three parts

| Part | Asks | Items |
|---|---|---|
| 1. Tap the letter | which letter is not read? | the 14 words with a letter not read, tapped |
| 2. Read, or not read? | one letter lit: is it read? | 12 lit-letter questions: for 6 words, the letter not read ("Not read") and a letter beside it ("Read") |
| 3. All together | both, and **"none"** is an answer | 14 + 4 (words with none) + 12 = 30 |

The **read** letter lit beside the one not read is chosen to be the one a student would doubt: the wow before a plural alif; the laam after the wow in "those with"; the laam
before the wow that carries "aa". In Madani it has no circle; in Indo-Pak it has a mark on it (the check proves both for every item).

**Ids** are the reference (a tapped word) and `reference#not` or `reference#read` (a question about one letter): the same in both scripts, never the Arabic, so a switch of
script keeps every credit. `askGroup` is `tap` or `lit` (Lesson 19's way), so an answer to one question is never offered to the other.

## 5. The tap question: the one design problem

**The word is shown with every letter its own span; a span holding only a colour does not break Arabic joining** (Lesson 18, measured), so the word still reads as one word. A
tap target is a letter's own box, widened by an absolutely placed `::before` (out of the flow, so it cannot touch the shaping): `-0.16em` each side. A letter button is a `span`
with `role="button"` and `tabindex="0"`, **not** a `<button>`, which is an inline-block and would break the joining. Enter and Space answer from the keyboard (and a right
answer from the keyboard waits for Next, as on every page). A screen reader hears "Letter 3 of 5", the group is named by the question, and the word is hidden from it in a
lit-letter question (the question and answers carry it).

**Nothing is tinted before the answer**: a lit letter in the question would be the answer. After it, the right letter is gold with a line under it (never colour alone), the one
chosen quiet with a dashed line, the rest dim, and the verdict line says it in words.

**Measured at 375px:** the word was 56px with 83px to spare on each side, and the narrowest letter's target 30px. It now grows with the screen
(`clamp(3.5rem, 3rem + 7vw, 6.5rem)`, 74px at 375px): **54.6px to spare, narrowest target 39.4px**. That is under the 44px the site uses; the plan said to look at it on a real phone, and
that is still the user's ([[docs/lesson-21/02-build-record|02]] §4).

**The engine change** (`practice.js`, additive): a format may bring its own answers, `choicesFor(item)`, and say which is right, `correctFor(item)`. They keep the order the
format gave (here, the order the letters are read in: never shuffled) and a question carries `correct` (an ordinary question's is its item's id). Every other format has no
`choicesFor`, so it is dealt exactly as before; the check proves it, and that the engine judges a tap by `correct` and a lit-letter answer as it always was.

## 6. What is said, and in which script

**The board** (the teaching half) reuses Lesson 18's `words` board: three words on their own, then a list for each kind with the letter not read lit (dim, as Lesson 18's silent
laam), and a list where nothing is lit. Two lines, one a script: the Madani student is told to look for the circle, the Indo-Pak student to look for the letter with
nothing on it. **Under a wrong answer** the same word again with its letter lit, and a line for the word's kind **and the student's script** (nine lines of wording: three
kinds in two scripts, one for none, and one for each script for a lit letter that is read).

**The verdict** says one of five things, each its own text field: the right letter; another letter; a letter tapped in a word of none; "none" in a word that has a letter not read; and
"none" when it is right.

## 7. The walkthrough and the reading page

**Walkthrough** (three items, three steps each): *aaminuu* (2:13:4), the word for "for those with" (38:43:9) and "life" (3:14:19, with the article, a moon letter), each in the
letters before the one not read, that letter and what follows, and the whole. The sounds ("aaminuu", "li-u / lee", "al-haya / aati") are candidates. **Reading page**
(`exercise-21.html`): twelve other words (four plural, two "those with", two that carry "aa", four with none), no meanings.

## 8. Recordings

**No new recording**, and the recordings page still lists 447 rows. A word's sound would be the teacher's own, one each, under its reference (Lesson 18 §7), and both
questions about a word share it. **No question is heard in this lesson**: whether a letter is read is seen, and the page never asks by ear (`byEar` is not set).

## 9. Open questions for the teacher

1. **The Indo-Pak rule in words** ("a wow or yaa with no mark is not read; an alif with no zabar before it is not read"): confirmed by every word chosen and by 87% of the
   Qur'an's circles (§2), not proved. The teacher confirms it before the page ships to Indo-Pak students.
2. **The alif of "I" and the other "read only at a stop" letters** are left to Lesson 22, where a stop is taught.
3. **The words** (all Claude's candidates, from Quran.com): the 18 of the drill, the 12 of the reading page, the 3 of the walkthrough and their sounds.
4. **Tap targets on a real phone** (§5).
5. Indo-Pak: ships with the stand-in font and Lesson 18's honest line about it.
