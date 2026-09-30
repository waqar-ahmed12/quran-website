# 05 — Words

**Every word here is Claude's candidate, not the teacher's.** The rule since Lesson 4: real words only, never
invented, checked by the teacher before they ship.

## 1. What a word may use

Only the 29 letters, and the marks the student has met by Lesson 11: zabar, zair, paish (4–6), the doubled marks
(7), zabar and alif (8), the standing marks (9), zabar and wow (10), and paish and wow itself. **A jazam only inside
a tail**: in Lesson 10's wow, and, in Indo-Pak, in this lesson's. `qaida-words-check.js` enforces that without a new
rule.

Left out on purpose:
- **Plural verbs with the silent alif** (قَالُوا، كَانُوا). The alif after the wow is written and never read. It is
  common, but no lesson teaches it (`07` §6).
- **Hamza on a seat** (يُؤْمِنُونَ، رُءُوسٌ): not one of the 29.
- **ة** (not one of the 29) and **shadda** (a later pass).

These are **ordinary Arabic spellings, not quotations** (Lesson 8's rule). Several are in the Qur'an as written, but
the page never says so. In Indo-Pak every one shows a jazam on its long-vowel wow, drawn by the row's own `forms`.

## 2. The walkthrough — three words (`spell.js`)

Chosen, like Lesson 10's three, to show everything the board says:

| # | Word | Root pairs (right to left) | `syll` | Meaning | Shows |
|---|---|---|---|---|---|
| 1 | نُورٌ | `['ن','damma-waw'], ['ر','dammatain']` | `nuu`, `run` | light | the wow **joined** to the letter before it |
| 2 | رُوحٌ | `['ر','damma-waw'], ['ح','dammatain']` | `ruu`, `hun` | a spirit | the wow **standing apart** (ر never joins forward) |
| 3 | يَقُولُ | `['ي','fatha'], ['ق','damma-waw'], ['ل','damma']` | `ya`, `quu`, `lu` | he says | the long "oo" in the **middle** of a longer word |

Step-through (the rule since Lesson 8): a letter is one step with its whole tail. **A wow is never a step of its
own**, so قُو is one step, not قُ then و.

## 3. The reading page — twelve words (`exercise.js`, `exercise-11.html`)

Glyphs only, no meanings on the page (the user, 2026-09-27). The meanings are here for the teacher's check.

| # | Word | Root pairs | Meaning | Joins? |
|---|---|---|---|---|
| 1 | سُوقٌ | `س` damma-waw, `ق` dammatain | a market | joins |
| 2 | حُوتٌ | `ح` damma-waw, `ت` dammatain | a fish (a whale) | joins |
| 3 | طُورٌ | `ط` damma-waw, `ر` dammatain | a mountain | joins |
| 4 | نُوحٌ | `ن` damma-waw, `ح` dammatain | Nuh (the prophet's name) | joins |
| 5 | سُورٌ | `س` damma-waw, `ر` dammatain | a wall | joins |
| 6 | يَكُونُ | `ي` fatha, `ك` damma-waw, `ن` damma | he is, he will be | joins |
| 7 | قُلُوبٌ | `ق` damma, `ل` damma-waw, `ب` dammatain | hearts | joins |
| 8 | ذُنُوبٌ | `ذ` damma, `ن` damma-waw, `ب` dammatain | sins | joins |
| 9 | جُنُودٌ | `ج` damma, `ن` damma-waw, `د` dammatain | soldiers | joins |
| 10 | دُونَ | `د` damma-waw, `ن` fatha | below, other than | **apart** |
| 11 | زُورٌ | `ز` damma-waw, `ر` dammatain | falsehood | **apart** |
| 12 | دُورٌ | `د` damma-waw, `ر` dammatain | houses | **apart** |

Three "apart" words here and one in the walkthrough. Lesson 10 had only one and asked the teacher for more
(`docs/lesson-10/07` §5). Long "oo" has more short words after د ر ز.

## 4. Indo-Pak

يَقُولُ and يَكُونُ start with ي, which is ی in Indo-Pak. It is joined at the start of the word, so it looks the same.
Both go through `shell.lettersOf()` by key, as every word does. Every long-vowel wow in Indo-Pak shows its jazam;
none does in Madani.
