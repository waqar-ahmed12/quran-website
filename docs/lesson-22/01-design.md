---
tags: [lesson-22, stopping, stop-signs, rule-page, spec]
---
# 01 — Design: how a word ends at a stop, the four signs, the twenty-seven words

**Part of** [[docs/lesson-22/README|Lesson 22]] · next [[docs/lesson-22/02-build-record|02 Build record]] · [[MAP]]

*Written 2026-10-06, the day Lesson 22 was built: the plan was one file (the [[docs/lesson-22/README|README]]), and [[QAIDA-BUILD]] says a rule lesson becomes
a full folder before it is built. This note holds the reasons the code comments point at ("docs/lesson-22/01 §N"); [[docs/lesson-22/02-build-record|02]] says
what was built and measured. It stands on [[docs/lesson-21/01-design|Lesson 21's design]] (copied words, the lit places, two questions kept apart) and on
[[docs/pass-2/01-what-the-two-scripts-print|pass-2/01]] §7, which first listed the signs each script prints.*

## 1. What it teaches

**Every verse ends with a stop**, so a student stops on a word at least once a verse, and the word changes when they do. Two things:

**How to stop on a word.** The last letter loses what it was carrying:

| Kind | What is on the last letter | Said at a stop | Answer (the item's name) |
|---|---|---|---|
| `vowel` | a zabar, zair or paish | with a jazam | Ends with a {jazam} |
| `tanween` | two zair or two paish | with a jazam, the "n" gone | Ends with a {jazam} (the same answer) |
| `fathatain` | two zabar, before the alif of Lesson 7 | a long "aa": the alif is read | Ends with a long 'aa' |
| `taa` | a round taa, whatever is on it (two zabar too) | "h" | Ends with an 'h' |
| `long` | a long vowel | as it is | Stays as it is |

**Where you may stop**: at the end of every verse (the round verse mark, the page's title glyph), and inside a verse where a small sign over the word says so.

The page says "stop" and "said at a stop", and never a tajweed word ("waqf" is not on the page). {jazam} is the student's own word for it (jazam or sukoon).

## 2. The signs: what the whole Qur'an said

**Measured over the whole Qur'an** (77,429 words, both scripts, Quran.com's text as `tools/fetch-qaida-words.js` copies it, scanned 2026-10-06). Madani prints six
signs as ordinary code points: the small jeem (U+06DA, 1,972 words), "salaa" (U+06D6, 1,682), "qalaa" (U+06D7, 603), the laam-alif (U+06D9, 68), the meem
(U+06D8, 22) and the three dots (U+06DB, 12). Indo-Pak prints the small taa (U+0615, 3,540), the jeem (1,693), the laam-alif (1,549, **1,117 of them on a
verse's last word**), "salaa" (269), the meem (88), the three dots (68), and **seven private-use characters** (U+E01A to U+E022, about 1,300 words) that mean
nothing without Quran.com's own Indo-Pak font.

**The two mushafs do not put the same sign in the same place.** Where Madani prints its small jeem, Indo-Pak prints its small taa in **1,591** words; where
Madani prints "salaa", Indo-Pak prints the taa in 675 and the jeem in 609. A sign question whose right answer changed with the script would teach each
student the other's mushaf, so **the drill uses only words where both print the same meaning**, and there are four such meanings:

| Kind | Madani | Indo-Pak | Means (the answer) | Words that qualify |
|---|---|---|---|---|
| `must` | small meem U+06D8 | small meem U+06D8 | Always stop here | 7 |
| `better` | small "qalaa" U+06D7 | **small taa U+0615** | Better to stop | 361 |
| `either` | small jeem U+06DA | small jeem U+06DA | Stop or go on | 132 |
| `no` | small laam-alif U+06D9 | small laam-alif U+06D9 | Do not stop here | 39 |

("Qualify": mid-verse, one sign, the same meaning in both scripts, and nothing else the student has not met, in both. "Salaa" in both scripts: 29 words,
every one holding something not yet met; the three dots in both: none.)

"Salaa" (better to read on) and the three dots (stop at one of two, not both) are **on the Madani script line only**: no word carries the same one in both
scripts and holds only what the student has met. The Indo-Pak student is told their mushaf prints more, and that **the list of every sign is printed at
the end of their Qur'an** (the README's own rule: that list, not Claude's memory, is the source), for the teacher to go through.

**How each sign is drawn**: the board shows each sign large, as the student's own script prints it (the "better" list shows "qalaa" in Madani and the
small taa in Indo-Pak, and names it so). Quran.com puts a sign after a **space** in both scripts (and in Indo-Pak often after a zero-width space too), so a
sign is a unit of its own and can be lit alone; at one Indo-Pak verse end (1:4) it sits on the last letter itself.

## 3. The words: chosen from data

Copied by `tools/fetch-qaida-words.js` into `rule-words.js`, in both scripts, unmodified; `stop.js` is the fifth kit file and **no Arabic is typed in it**.
A word was kept only if, **in both scripts**, it held nothing the student has not met (letters, tatweel, the marks of Lessons 4–21; a stop sign; the spaces
and invisible marks a sign or a verse end brings), and its end was the same kind in both by the lesson's own rule (`stopKindOf`). Verse ends were
allowed for the first time: an Indo-Pak verse's last word ends in an invisible U+200F in 6,218 of 6,236 verses, which earlier lessons kept out.

- **Stop words (15)**: a verse's last word (7), or a word carrying a sign that allows a stop, the same in both scripts (8). Three of each kind, so each
  list on the board is one row of three on a phone (four wrapped three and one at 375px, so a fourth vowel word, 2:13:19, was taken out): vowel (zair,
  paish, zabar), tanween, two zabar, round taa (one with two zabar, the trap: it says "h", not "aa"), long vowel.
- **Sign words (12)**: three for each of the four signs, mid-verse, the sign the only one on the word.
- **Kept out**: a shadda on the last letter (a stop keeps the doubling: a later point); a final haa (often a pronoun, and told apart from the round taa
  only by its dots); a wavy line at the end (its length changes at a stop: Lesson 20's "longer" is gone, the teacher's to explain); any word with a
  private-use sign; the small rectangle (Madani's "read only at a stop", U+06E0): it is on the Madani line in words, and no drill word holds it.

## 4. The stopped form: composed, labelled, never the printed word

The README's open question 1 (a composed spelling beside the printed word) is taken as recommended: **the page shows the word as printed, and beside it
"Said at a stop:" with the stopped form**, composed by `saidOf` from the printed word by the rule of §1: the sign and anything after the last letter left
off (a sign is not said), then a vowel or a tanween replaced by a jazam, a round taa by "h" with a jazam, two zabar by one zabar before the alif (a long
"aa"), and a long vowel left as it is. **The printed word is never changed**; the check proves the stopped form differs from it only at its end.

**The jazam is the open head (U+06E1) in both scripts.** In Indo-Pak that is what the copied text itself writes. In Madani it is the shape lessons 10–15
taught, **not** the copied text's U+0652: measured in the browser pane, the site's Madani face (Scheherazade New) draws U+0652 as a small circle all but
identical to **Lesson 21's small circle (U+06DF, "not read")**. On a stopped form that would say the last letter is not read, which is the opposite of the
lesson. The copied words keep their U+0652 (the text is never edited to fit a font); see [[docs/lesson-22/02-build-record|02]] §4.

Where it is shown: under each of the three words on their own at the top of the board, and under a wrong answer about a stop word (printed, "said",
stopped). Not on every tile of the board (it would double every row), and not on the reading page (saying it is the student's exercise).

## 5. Twenty-seven items, three parts, two questions

| Part | Asks | Items |
|---|---|---|
| 1. How to stop | How do you stop on this word? | the 15 stop words |
| 2. The signs | What does the lit sign say? | the 12 sign words |
| 3. All together | both | 27 |

Two ordinary name questions, each with four answers, kept apart by `askGroup` (`stop` or `sign`, Lesson 19's way), so **the engine is not changed**. The
question lights **one place**: the last letter of a stop word (whatever its kind, so the light never tells two zabar from a vowel), or the sign. The ids are
the references, the same in both scripts.

## 6. What is said, and in which script

The board reuses Lesson 21's `words` board: three words on their own (a vowel, two zabar and a round taa at the end, the three that change most), then
nine lists, five ways a word ends and four signs. Three small additions to the page, each additive and unused by every earlier lesson: a board line may
have one wording a script (`ownLine`: "a small 'qalaa'" / "a small taa"), the list headings take the student's own names ("A zabar, zair or paish at the
end"), and a sign's list draws its sign. Under a wrong answer: one line a kind, and the "better" sign one a script.

**No transliteration** outside the walkthrough (it stays off, [[docs/pass-2/02-page-types-and-questions|pass-2/02]] §2): the board's lines say what changes
in words, and the stopped form shows it.

## 7. The walkthrough and the reading page

**Walkthrough** (three words, three steps each): *ad-deen* (1:4, a vowel), *asafaa* (18:6, two zabar), *ad-dalaalah* (7:30, a round taa): the word up to its
end, the end as it is said at a stop, and the whole, stopped. The sounds are candidates. **Reading page** (`exercise-22.html`): twelve other places to stop,
seven verse ends and five with a sign, every kind of end; no meanings, no stopped forms.

## 8. Recordings

**No new recording**; the recordings page still lists 447 rows. A word's sound would be the teacher's own, **read as it is said at a stop** (the README's
ask), under its reference. When recordings arrive the by-ear question opens for the words that have one, as on every rule page.

## 9. Open questions for the teacher

1. **The four meanings** in plain words ("Always stop here", "Better to stop", "Stop or go on", "Do not stop here"), and the Indo-Pak small taa read as
   "better to stop" beside Madani's "qalaa": the teacher checks them against the list at the end of their own mushaf.
2. **A laam-alif on a verse end** (1,117 Indo-Pak verse ends): the page says only that a student may stop at a verse's end. Whether to add "even under a
   laam-alif" is the teacher's.
3. **The Madani jazam drawn as a circle in copied words** (§4): a font matter, and the Lesson 23 font decision.
4. **The words** (all Claude's candidates, from Quran.com), the walkthrough's sounds, and the wording.
5. Indo-Pak: ships with the stand-in font and Lesson 18's honest line about it, now naming "letters and signs".
