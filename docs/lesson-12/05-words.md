# 05 — Words

**Every word here is Claude's candidate, not the teacher's.** Real words only, checked by the teacher before they
ship.

## 1. What a word may use

The 29 letters and every mark through Lesson 12. A jazam only inside a tail (lessons 10 and 12, and Indo-Pak's
Lesson 11). Left out: shadda (سَيِّدٌ), hamza (شَيْءٌ), ة. These are ordinary Arabic spellings, not quotations.

**No word ends in the yaa.** Every yaa below has a letter after it, so it is in its middle shape and dotted in both
scripts. The item itself already shows the dotless Indo-Pak end (`02` §3). Words that raised it again would ask the
same question twice.

## 2. The walkthrough — three words (`spell.js`)

| # | Word | Root pairs (right to left) | `syll` | Meaning | Shows |
|---|---|---|---|---|---|
| 1 | بَيْتٌ | `['ب','fatha-yaa'], ['ت','dammatain']` | `bay`, `tun` | a house | the yaa **joined** to the letter before it |
| 2 | زَيْتٌ | `['ز','fatha-yaa'], ['ت','dammatain']` | `zay`, `tun` | oil | the yaa **standing apart** (ز never joins forward) |
| 3 | عَلَيْهِ | `['ع','fatha'], ['ل','fatha-yaa'], ['ه','kasra']` | `'a`, `lay`, `hi` | on him | "ai" in the **middle** of a longer word |

Word 3 is also the mushaf's own spelling: after a yaa with a jazam, the haa takes a plain zair, not a standing one.

A yaa with a jazam is never a step of its own: بَيْ is one step.

## 3. The reading page — twelve words (`exercise.js`, `exercise-12.html`)

| # | Word | Root pairs | Meaning | Joins? |
|---|---|---|---|---|
| 1 | عَيْنٌ | `ع` fatha-yaa, `ن` dammatain | an eye | joins |
| 2 | خَيْرٌ | `خ` fatha-yaa, `ر` dammatain | good | joins |
| 3 | غَيْبٌ | `غ` fatha-yaa, `ب` dammatain | the unseen | joins |
| 4 | لَيْلٌ | `ل` fatha-yaa, `ل` dammatain | night | joins |
| 5 | سَيْفٌ | `س` fatha-yaa, `ف` dammatain | a sword | joins |
| 6 | طَيْرٌ | `ط` fatha-yaa, `ر` dammatain | birds | joins |
| 7 | شَيْخٌ | `ش` fatha-yaa, `خ` dammatain | an old man | joins |
| 8 | كَيْفَ | `ك` fatha-yaa, `ف` fatha | how | joins |
| 9 | لَيْسَ | `ل` fatha-yaa, `س` fatha | is not | joins |
| 10 | رَيْبٌ | `ر` fatha-yaa, `ب` dammatain | doubt | **apart** |
| 11 | دَيْنٌ | `د` fatha-yaa, `ن` dammatain | a debt | **apart** |
| 12 | وَيْلٌ | `و` fatha-yaa, `ل` dammatain | woe | **apart** |

## 4. Indo-Pak

كَيْفَ starts with ک in Indo-Pak and عَلَيْهِ ends with ہ. Both resolve by key. Every medial yaa is ی with its dots,
which is how Indo-Pak draws U+06CC in the middle of a word.
