# 05 — Words

**Every word here is Claude's candidate, not the teacher's.** Real words only, checked before they ship.

## 1. What a word may use

Every mark through Lesson 15. **A shadda only in the middle or at the end of a word** (`03` §6). Ordinary spellings,
not quotations (the second pass switches to the Qur'an's own words at Lesson 18, `docs/pass-2/02` §3).

Left out: the article (الْ, and its shadda: Lesson 18); hamza on a seat (إِنَّ, أُمٌّ: Lesson 16); ة (Lesson 17); a shadda
with two zabar/zair/paish (كُلٌّ, حَقٌّ, `01` §6), because it would need rows of its own.

## 2. The walkthrough — three words (`spell.js`)

| # | Word | Root pairs (right to left) | `syll` | Meaning | Shows |
|---|---|---|---|---|---|
| 1 | مَرَّ | `['م','fatha'], ['ر','shadda-fatha']` | `ma`, `rra` | he passed | two letters, the second said twice |
| 2 | عَلَّمَ | `['ع','fatha'], ['ل','shadda-fatha'], ['م','fatha']` | `'a`, `lla`, `ma` | he taught | the shadda in the middle. It is also in the Qur'an as written (عَلَّمَ, 55:2 and 96:5, both already in `site/aayat.json`) |
| 3 | مُحَمَّدٌ | `['م','damma'], ['ح','fatha'], ['م','shadda-fatha'], ['د','dammatain']` | `mu`, `ha`, `mma`, `dun` | Muhammad | a meem with shadda: **the hum**, in the word a student will want to read most |

The walkthrough steps for مُحَمَّدٌ: "Meem with paish: mu" → "Haa with zabar: ha" → "muha" → "Meem with tashdeed and
zabar: said twice…: mma" → "muhamma" → "Daal with two paish: dun" → "muhammadun".

## 3. The reading page — twelve words (`exercise.js`, `exercise-15.html`)

| # | Word | Root pairs | Meaning | Shows |
|---|---|---|---|---|
| 1 | شَدَّ | `ش` fatha, `د` shadda-fatha | he pulled tight | |
| 2 | رَدَّ | `ر` fatha, `د` shadda-fatha | he gave back | |
| 3 | عَدَّ | `ع` fatha, `د` shadda-fatha | he counted | |
| 4 | ظَنَّ | `ظ` fatha, `ن` shadda-fatha | he thought | the hum |
| 5 | ثُمَّ | `ث` damma, `م` shadda-fatha | then | the hum |
| 6 | رَبِّ | `ر` fatha, `ب` shadda-kasra | my Lord | **shadda and zair**: the kasra's place |
| 7 | كَبَّرَ | `ك` fatha, `ب` shadda-fatha, `ر` fatha | he said "Allahu akbar" | |
| 8 | قَدَّمَ | `ق` fatha, `د` shadda-fatha, `م` fatha | he sent ahead | |
| 9 | سَبِّحْ | `س` fatha, `ب` shadda-kasra, `ح` sukun | glorify! | **a shadda and a jazam** (lessons 14 and 15) |
| 10 | يُعَلِّمُ | `ي` damma, `ع` fatha, `ل` shadda-kasra, `م` damma | he teaches | shadda and zair in a longer word |
| 11 | سُكَّرٌ | `س` damma, `ك` shadda-fatha, `ر` dammatain | sugar | |
| 12 | يَرُدُّ | `ي` fatha, `ر` damma, `د` shadda-damma | he gives back | **shadda and paish** |

Words 6, 9, 10 and 12 carry the zair and paish shaddas, which ordinary Arabic uses far less at word-ends than the zabar
one. The teacher may know better ones.

## 4. Indo-Pak

كَبَّرَ and سُكَّرٌ start or carry ک. يُعَلِّمُ and يَرُدُّ start with ی. All resolve by key. **رَبِّ, سَبِّحْ and يُعَلِّمُ are the
three to look at in both scripts**: the kasra under the letter (Indo-Pak) or under the shadda (Madani).
