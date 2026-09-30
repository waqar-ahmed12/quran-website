# 05 — Words: the walkthrough and `exercise-9.html`

## 1. Why these words need a second check

Lesson 8's words were ordinary Arabic spelling, and `docs/lesson-8/05` §4 was careful never to call them Qur'anic.
**This lesson is the other side of that line.** Standing marks are how the mushaf spells: an ordinary Arabic book
writes هذا and ذلك with no mark at all, and كتاب with its alif. The words a student meets these marks in are, very
nearly by definition, words as the mushaf writes them.

So the rule is stricter than Lesson 8's:

- **Every word below is checked against the mushaf's own text** — Tanzil's Uthmani text for the Madani drawing,
  Quran.com's Indo-Pak text for the Indo-Pak one — the rule `QAIDA-CONTENT.md` already sets for any Quran text.
  Checked **word by word, both scripts**: does the mushaf write this word with this mark on this letter?
- **A word is still a word, not a quotation.** No surah and ayah on the page, no "from the Qur'an" label. If the
  teacher wants the page to say where they come from, that is `07` §4.
- **Claude's candidates, as every word list so far has been.** The spellings below are Claude's reading of the
  Indo-Pak mushaf; §4 lists the ones Claude is least sure of.

A word's letters are `[key, markId]` pairs, as in `spell.js` today, so **one entry draws correctly in both
scripts**: `['ه', 'standing-fatha']` is هٰ in Indo-Pak and هَٰ in Madani, through `formOf` (`03` §3). Nothing is
stored twice.

## 2. The walkthrough — three words

| Word | Letters | Syllables | Meaning | Why this one |
|---|---|---|---|---|
| **هٰذَا** | `['ه','standing-fatha'], ['ذ','fatha-alif']` | haa · dhaa | this | **the two spellings of the long aa side by side in one word** — the standing mark on the first letter, Lesson 8's alif on the second. The lesson in four letters |
| **بِهٖ** | `['ب','kasra'], ['ه','standing-kasra']` | bi · hii | with it | khari zair where the Qur'an puts it: on ه, after a letter with a vowel |
| **كِتٰبَهٗ** | `['ك','kasra'], ['ت','standing-fatha'], ['ب','fatha'], ['ه','inverted-damma']` | ki · taa · ba · huu | his book | a longer word with two of the three; and كِتٰب is Lesson 8's كِتَابٌ as the mushaf writes it, which `docs/lesson-8/05` §4 promised this lesson would show |

The walkthrough itself needs nothing new: the whole word is drawn from the first step, the part being read is lit,
and a standing mark is part of its own letter's step — it never takes a step of its own (unlike Lesson 8's alif,
which rode on the letter before it; here there is no second letter to ride).

The caption line reads *"Haa with khari zabar: haa."* — `{name} with {mark}: {sound}` as every lesson has it.

## 3. `exercise-9.html` — twelve words

In a 4 × 3 table, no meanings, as every exercise page. Meanings here are for the teacher checking them.

| # | Word | Meaning | Marks it uses |
|---|---|---|---|
| 1 | ذٰلِكَ | that | khari zabar, zair, zabar |
| 2 | هٰذِهٖ | this (f.) | khari zabar, **khari zair** |
| 3 | مٰلِكِ | master of | khari zabar, zair |
| 4 | سَمٰوٰتٌ | heavens | zabar, **two khari zabar**, two paish |
| 5 | ظُلُمٰتٌ | darknesses | paish, khari zabar, two paish |
| 6 | كَلِمٰتٌ | words | zabar, zair, khari zabar, two paish |
| 7 | بِيَدِهٖ | in his hand | zair, zabar, **khari zair** |
| 8 | وَلَدِهٖ | his child's | zabar, zair, **khari zair** |
| 9 | لَهٗ | for him | zabar, **ulta paish** |
| 10 | مَعَهٗ | with him | zabar, **ulta paish** |
| 11 | مَالُهٗ | his wealth | zabar and alif, paish, **ulta paish** — both long-vowel spellings again |
| 12 | دَاوٗدَ | Dawud | zabar and alif, **ulta paish on و**, zabar — the one word where it is not on ه (`02` §5) |

Khari zabar in six, khari zair in three, ulta paish in four; every one built from marks taught by Lesson 9 (the
words check proves it, `06` §3). No jazam, no shadda, no ة, no ى — none of them is taught yet, and the most common
standing-mark words (الرَّحْمٰنِ, اِلٰهٌ, لٰكِنْ, عَلَيْهِ) all need one, which is why they are not here.

## 4. The ones to look at hardest

- **هٰذِهٖ** — before a word starting with *al-*, the mushaf drops the long vowel and writes plain zair
  (هٰذِهِ الشَّجَرَةَ); before other words it keeps khari zair (هٰذِهٖ نَاقَةُ). On its own, as here, which does the
  teacher expect?
- **مَالُهٗ** — often printed with a madd sign after the ulta paish where a hamza follows in the ayah. On its own it
  has none. Same question.
- **دَاوٗدَ** — Claude's reading is that the Indo-Pak mushaf writes ulta paish here and the Madani writes paish with
  a small waw (دَاوُۥدَ). Worth one look in each.
- **كِتٰبَهٗ** — accusative, as the mushaf most often has it with ه (the "given his book" ayat). If the teacher
  prefers كِتٰبُهٗ, it is one mark.

## 5. What `spell.js` and `exercise.js` gain

- A `standing` entry in each `WORDS` (§2, §3), keyed by the page's `data-mark`.
- The lookup change in `04` §6: `marks.markOf(id) || marks.setOf(id)`, so a set page draws its words.
- Nothing else. `formOf` draws each letter in the page's script; the walkthrough fix already shows the whole word.
