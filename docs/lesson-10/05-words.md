# 05 — Words

**Every word here is Claude's candidate, not the teacher's.** The rule since Lesson 4: real words only, never
invented, checked by the teacher before they ship.

## 1. What a word may use

Only the 29 letters and marks the student has met by Lesson 10: zabar, zair, paish (4–6), the three doubled marks
(7), zabar and alif (8), the standing marks (9), and zabar-and-wow itself. **A jazam only as part of a
`fatha-waw` pair** — `qaida-words-check.js` enforces that without a new rule (`03` §7).

Left out on purpose: أ and every hamza on a seat (not one of the 29), ة (not one of the 29), and a two-zabar ending
(it brings a silent alif — fine after Lesson 8, but it muddies a lesson about what comes after a zabar).

These are **ordinary Arabic spellings, not quotations** (Lesson 8's rule). Several are in the Qur'an as written
(يَوْمَ، فَوْقَ، سَوْفَ، قَوْمٌ), but the page never says so.

## 2. The walkthrough — three words (`spell.js`)

Chosen, like Lesson 8's three, to show everything the board says:

| # | Word | Root pairs (right to left) | `syll` | Meaning | Shows |
|---|---|---|---|---|---|
| 1 | قَوْمٌ | `['ق','fatha-waw'], ['م','dammatain']` | `qaw`, `mun` | a people | the wow **joined** to the letter before it |
| 2 | زَوْجٌ | `['ز','fatha-waw'], ['ج','dammatain']` | `zaw`, `jun` | a pair, a spouse | the wow **standing apart** (ز never joins forward) |
| 3 | مَوْعِدٌ | `['م','fatha-waw'], ['ع','kasra'], ['د','dammatain']` | `maw`, `'i`, `dun` | an appointed time | "au" at the start of a longer word with a zair and two paish after it |

Step-through (the walkthrough's rule since Lesson 4): a letter is one step with its whole tail — **a wow with a
jazam is never a step of its own**, the same way Lesson 8's alif never began a syllable. قَوْ is one step, not قَ
then وْ.

## 3. The reading page — twelve words (`exercise.js`, `exercise-10.html`)

Glyphs only, no meanings on the page (the user, 2026-09-27). Meanings here for the teacher's check.

| # | Word | Root pairs | Meaning | Joins? |
|---|---|---|---|---|
| 1 | يَوْمٌ | `ي` fatha-waw, `م` dammatain | a day | joins |
| 2 | خَوْفٌ | `خ` fatha-waw, `ف` dammatain | fear | joins |
| 3 | فَوْقَ | `ف` fatha-waw, `ق` fatha | above | joins |
| 4 | سَوْفَ | `س` fatha-waw, `ف` fatha | will (shall) | joins |
| 5 | لَوْنٌ | `ل` fatha-waw, `ن` dammatain | a colour | joins |
| 6 | نَوْمٌ | `ن` fatha-waw, `م` dammatain | sleep | joins |
| 7 | مَوْتٌ | `م` fatha-waw, `ت` dammatain | death | joins |
| 8 | صَوْتٌ | `ص` fatha-waw, `ت` dammatain | a voice | joins |
| 9 | ثَوْبٌ | `ث` fatha-waw, `ب` dammatain | a garment | joins |
| 10 | حَوْلَ | `ح` fatha-waw, `ل` fatha | around | joins |
| 11 | قَوْلٌ | `ق` fatha-waw, `ل` dammatain | a saying | joins |
| 12 | دَوْرٌ | `د` fatha-waw, `ر` dammatain | a turn | **apart** |

**The teacher may want more "apart" words** (only دَوْرٌ here, and زَوْجٌ in the walkthrough) — real two- and
three-letter words starting دَوْ / ذَوْ / رَوْ / زَوْ are few. رَوْضَةٌ needs ة. Left as is; `07` §5.

## 4. Indo-Pak

يَوْمٌ is the one word here whose letter differs by script (ی in Indo-Pak, joined at the start, so it looks the same
as ي). It goes through `shell.lettersOf()` by key, as every word does.
