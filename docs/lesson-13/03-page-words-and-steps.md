# 03 — The page, the words, the files and the checks

## 1. `lesson-13.html`

**Copy `lesson-11.html`** (it has the same-sound tile and the per-script line), then change:

| Where | Lesson 11 | Lesson 13 |
|---|---|---|
| `data-mark` | `damma-waw` | `kasra-yaa` |
| Title | Paish and wow / Damma and waw | **Zair and yaa / Kasra and yaa** |
| Lede | "Paish, then a wow: the sound is long — oo." | "Zair, then a yaa: the sound is long — ee." |
| `mark-sits` | "…above the letter, and the wow comes right after it." | "The {other} sits **under** the letter, and the yaa comes right after it." |
| `pair-marked` | "With {mark}: oo" | "With {mark}: ee" |
| `mark-does` | "…then a wow. Together they make it long: oo." | "The {other} you know, then a yaa. Together they make it long: ee." |
| `same` | "The same sound: {name} with {sameMark}" | unchanged |
| jazam line, Indo-Pak | "The wow carries a {jazam} here too…" | "The yaa carries a {jazam} here too, as in the last lesson. What changed is the mark before it: after {other}, the yaa makes the sound long." |
| jazam line, Madani | "Here the wow has no mark on it…" | "Here the yaa has no mark on it. After {other}, a bare yaa makes the sound long. In the last lesson the yaa had a {jazam}, and said ai." |
| `joined` | "The wow joins the letter before it…" | "The yaa joins the letter before it — unless that letter never joins the next one." |
| More words guide | "…using oo…" | "Twelve more, using ee — no translations, just reading." |
| Previous | Zabar and wow, `lesson-10.html` | **Zabar and yaa / Fatha and yaa, `lesson-12.html`** |
| Next | Zabar and yaa, `data-soon` | **Jazam / Sukoon**, `data-soon` until Lesson 14 is built |

The Indo-Pak jazam line does not mention the dotless end. The student met that in Lesson 12, and the line is long
enough.

`exercise-13.html`: a copy of `exercise-11.html` with `data-mark="kasra-yaa"` and "Back to Lesson 13".

`shell.js`: Lesson 13's row gains `href: 'lesson-13.html', built: true, progress: 'drill', cp: 0x0650,
tail: [0x064A, 0x0652]`.

## 2. Words — fifteen candidates

The rules are `docs/lesson-12/05` §1's, with every mark through Lesson 13. **No word ends in the yaa**, so فِي "in"
is left out as a word (`01` §4). Ordinary spellings, not quotations. In Indo-Pak every long-vowel yaa shows its jazam
(كَبِیْرٌ), and in Madani none does.

**Walkthrough (`spell.js`):**

| # | Word | Root pairs | `syll` | Meaning | Shows |
|---|---|---|---|---|---|
| 1 | فِيلٌ | `['ف','kasra-yaa'], ['ل','dammatain']` | `fii`, `lun` | an elephant | the yaa **joined** |
| 2 | دِينٌ | `['د','kasra-yaa'], ['ن','dammatain']` | `dii`, `nun` | a religion, a way | the yaa **standing apart** |
| 3 | كَبِيرٌ | `['ك','fatha'], ['ب','kasra-yaa'], ['ر','dammatain']` | `ka`, `bii`, `run` | big | the long "ee" in the **middle** of a word |

**Reading page (`exercise.js`), twelve:**

| # | Word | Root pairs | Meaning | Joins? |
|---|---|---|---|---|
| 1 | تِينٌ | `ت` kasra-yaa, `ن` dammatain | figs | joins |
| 2 | طِينٌ | `ط` kasra-yaa, `ن` dammatain | clay | joins |
| 3 | عَظِيمٌ | `ع` fatha, `ظ` kasra-yaa, `م` dammatain | great | joins |
| 4 | رَحِيمٌ | `ر` fatha, `ح` kasra-yaa, `م` dammatain | merciful | joins |
| 5 | عَلِيمٌ | `ع` fatha, `ل` kasra-yaa, `م` dammatain | all-knowing | joins |
| 6 | سَمِيعٌ | `س` fatha, `م` kasra-yaa, `ع` dammatain | all-hearing | joins |
| 7 | حَكِيمٌ | `ح` fatha, `ك` kasra-yaa, `م` dammatain | wise | joins |
| 8 | بَعِيدٌ | `ب` fatha, `ع` kasra-yaa, `د` dammatain | far | joins |
| 9 | جَمِيلٌ | `ج` fatha, `م` kasra-yaa, `ل` dammatain | beautiful | joins |
| 10 | قَرِيبٌ | `ق` fatha, `ر` kasra-yaa, `ب` dammatain | near | **apart** (after ر) |
| 11 | كَرِيمٌ | `ك` fatha, `ر` kasra-yaa, `م` dammatain | generous | **apart** (after ر) |
| 12 | رِيحٌ | `ر` kasra-yaa, `ح` dammatain | a wind | **apart** |

Seven of the twelve are words the Qur'an uses of Allah (رَحِيمٌ، عَلِيمٌ…). They are ordinary words and chosen for
their shape. The page says nothing about it, as with every lesson's words.

## 3. Files

| File | What changes |
|---|---|
| `site/qaida/marks.js` | the `'kasra-yaa'` row (`02` §1) |
| `site/qaida/shell.js` | Lesson 13's row |
| `site/qaida/qaida.css` | only if `02` §4's measurement needs it, otherwise a comment recording it |
| `site/qaida/mark-lesson.js` | `data-tail-below` only if Lesson 12 did not add it and this lesson needs it |
| `site/qaida/lesson-13.html`, `exercise-13.html` | **new** |
| `site/qaida/spell.js`, `exercise.js` | a `'kasra-yaa'` entry each |
| `tools/qaida-check.js`, `tools/qaida-lesson13-check.js` (**new**) | §5 |
| `QAIDA-BUILD.md`, `QAIDA-CONTENT.md` | status and a step-log entry |

**Unchanged:** `audio/manifest.json` (the `kasra-yaa` group has existed since Lesson 9), `audio.js` (Lesson 11's
`markForKind` change already covers this), everything else.

## 4. Build order

0. **Lesson 12 built.**
1. **Measure the two things below the line** (`02` §4), drawing بِي with a throwaway row in the browser pane, before
   the page exists. Decide on `data-tail-below` first.
2. The fence: lessons 4–12's glyphs and `masteredCount`.
3. `marks.js`, then `qaida-check.js`.
4. `shell.js`, then every check.
5. `lesson-13.html`, and look at the feature row (five tiles, taller) at 375px and wide.
6. Words, then `qaida-words-check.js`.
7. `qaida-lesson13-check.js`, a look in the browser pane, then hand it to the user.

## 5. The checks

**The Lesson 13 block in `qaida-check.js`**: Lesson 11's block with the yaa. The row, `sits: 'below'`, `same`,
`against` `['kasra', 'fatha-yaa']`; the id is identical in both scripts and contains neither U+06CC nor U+06E1;
`drawnOf` is U+0650 U+064A in Madani and U+0650 U+06CC U+0652 in Indo-Pak; `sizes()` is `[6, 27]`; **fifteen**
distinct ids for ب across lessons 4–13; `masteredCount(5)`, `(12)` and `(13)` each count only their own; 300
questions with the twin check, **never a khari zair item** (no id ending U+0656); mastery survives a switch; the
`kasra-yaa` group appears once, with 27 rows.

**`qaida-lesson13-check.js`**: Lesson 11's page checks, with the yaa. The same-sound tile on part 1 only, with
`data-sits="below"`; the per-script line; the joined block's examples (a joining letter, then دِي); the Spell block
stepping فِيلٌ in two steps; Previous to Lesson 12.

## 6. The browser checklist (the user's)

1. **The zair and the yaa** side by side under the line, on every joining letter: no collision, nothing clipped, the
   row not dropping. Both scripts, default and Large.
2. **Indo-Pak بَیْ against بِیْ** and **Madani بَيْ against بِي**, on the board and in a question.
3. **The feature row**: five tiles, taller than usual, on a phone and wide.
4. **The same-sound tile**: تٖ (Madani تِۦ), no halo, never an answer.
5. **The halo** rings the yaa, not the zair.
6. The walkthrough (فِيلٌ in two steps) and the reading page.
