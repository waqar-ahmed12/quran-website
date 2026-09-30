# 05 — Words

**Every word here is Claude's candidate, not the teacher's.** Real words only, never invented, checked by the
teacher before they ship.

## 1. What a word may use, and the traps it avoids

Every mark through Lesson 14. **A jazam may now sit on any letter** except the first of a word, one right after
another jazam, or ا (`03` §7's rules). These are ordinary spellings, not quotations.

Jazam is where tajweed starts changing what a letter sounds like, and this pass teaches no tajweed. So the words
**avoid every case where a rule would make the student's plain reading wrong**:

| Left out | Why | Example |
|---|---|---|
| noon with a jazam **before another letter in the word** | ikhfa, idgham, iqlab change the noon's sound | مِنْبَرٌ is read "mimbar" |
| meem with a jazam before ب or م | ikhfa shafawi, idgham | |
| the article's laam before a sun letter | the laam is silent | الشَّمْسُ |
| any shadda | a later pass | رَبٌّ |
| hamza with a jazam | the seat differs by script | يَأْكُلُ |
| the alif wasla (ٱ) and the article at the start | the scripts write it differently | ٱلْحَمْدُ |

Noon or meem with a jazam **at the end** of a word, read on its own (مِنْ، لَمْ), is plain.

**Qalqalah** (the slight bounce of ق ط ب ج د with a jazam) does not make a plain reading wrong, only unpolished. It
is still avoided where it costs nothing. One word below has it, and it is marked for the teacher.

## 2. The walkthrough — three words (`spell.js`)

| # | Word | Root pairs (right to left) | `syll` | Meaning | Shows |
|---|---|---|---|---|---|
| 1 | قُلْ | `['ق','damma'], ['ل','sukun']` | `qu`, `l` | say! | two letters, the jazam **closing the word** |
| 2 | قَلْبٌ | `['ق','fatha'], ['ل','sukun'], ['ب','dammatain']` | `qa`, `l`, `bun` | a heart | the jazam **in the middle**, and the word going on after it |
| 3 | مَسْجِدٌ | `['م','fatha'], ['س','sukun'], ['ج','kasra'], ['د','dammatain']` | `ma`, `s`, `ji`, `dun` | a mosque | a longer word; the closed syllable is the first of three |

A jazam letter's `syll` is just its consonant (`l`, `s`). The blend step after it joins it to the syllable before
("qal"), and the jazam step's own line never shows it (`03` §6).

## 3. The reading page — twelve words (`exercise.js`, `exercise-14.html`)

| # | Word | Root pairs | Meaning | Notes |
|---|---|---|---|---|
| 1 | لَمْ | `ل` fatha, `م` sukun | did not | meem, at the end |
| 2 | مِنْ | `م` kasra, `ن` sukun | from | noon, at the end |
| 3 | عَنْ | `ع` fatha, `ن` sukun | about | noon, at the end |
| 4 | بَلْ | `ب` fatha, `ل` sukun | rather | |
| 5 | هَلْ | `ه` fatha, `ل` sukun | is…? (a question) | |
| 6 | كَمْ | `ك` fatha, `م` sukun | how many | |
| 7 | شَمْسٌ | `ش` fatha, `م` sukun, `س` dammatain | a sun | meem before س: plain |
| 8 | بَحْرٌ | `ب` fatha, `ح` sukun, `ر` dammatain | a sea | |
| 9 | نَفْسٌ | `ن` fatha, `ف` sukun, `س` dammatain | a soul | |
| 10 | يَعْلَمُ | `ي` fatha, `ع` sukun, `ل` fatha, `م` damma | he knows | |
| 11 | نَعْبُدُ | `ن` fatha, `ع` sukun, `ب` damma, `د` damma | we worship | |
| 12 | مَكْتُوبٌ | `م` fatha, `ك` sukun, `ت` damma-waw, `ب` dammatain | written | **a jazam and a long vowel in one word**: lessons 11 and 14 together |

None of the twelve has qalqalah. **The walkthrough's قَلْبٌ does not either**: its ب carries two paish, not a jazam.
قَدْ ("indeed", a very common word) was left out because its د is a qalqalah letter with a jazam.

## 4. Indo-Pak

يَعْلَمُ starts with ی and كَمْ and مَكْتُوبٌ with ک. Both resolve by key. In Indo-Pak, مَكْتُوبٌ's long-vowel wow shows a
jazam too (مَکْتُوْبٌ) while its ك shows the lesson's own. **Two jazams in one word, doing the two jobs `01` §4
describes.** It is worth a look on the checklist, and it is why this word is on the page.
