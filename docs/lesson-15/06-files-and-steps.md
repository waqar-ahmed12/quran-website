# 06 — Files, build order, and the checklist

## 1. Every file this lesson touches

| File | New? | What changes |
|---|---|---|
| `site/qaida/marks.js` | edit | `cpsOf`; `suffixOf` and `formOf` read it; `formOf` returns `sits`; the three rows and the `shadda` set; `twinItems` and `boardRows` take the twin's own lead first |
| `site/qaida/mark-lesson.js` | edit | `data-sits` from `formOf`; the hum line; the per-column `pair-other` caption; the per-script `mark-sits` line |
| `site/qaida/shell.js` | edit | `masteredCount` reads lists of lists; Lesson 15's row; **rows 15–29** with a `part` |
| `site/qaida/home.js`, `index.html` | edit | the home in two parts (`03` §7) |
| `site/qaida/spell.js` | edit | the shadda line; the `shadda` words |
| `site/qaida/exercise.js` | edit | the `shadda` words |
| `site/qaida/qaida.css` | edit | the kasra's room per script if measured; the home's two headings; `.hum-note` |
| `site/qaida/audio/manifest.json` | edit | three groups |
| `site/qaida/lesson-15.html`, `exercise-15.html` | **new** | `04` |
| `tools/qaida-words-check.js` | edit | the two shadda rules |
| `tools/qaida-check.js` | edit | the fence for lessons 4–14, and a Lesson 15 block |
| `tools/qaida-lesson15-check.js` | **new** | the page check |
| `QAIDA-BUILD.md`, `QAIDA-CONTENT.md` | edit | status; "Step P1 built — Lesson 15" |

## 2. Build order

0. **Lesson 14 built**, and the user's yes to the second pass.
1. **Measure the kasra's place** (`02` §3) in every face, both themes. Write the result into `02` §3 before any code.
2. **The fence**: every glyph and every `masteredCount` of lessons 4–14, both scripts, snapshotted.
3. **`marks.js`**: `cpsOf` first (the fence must not move), then `sits` in `formOf`, then the twin's lead, then the rows
   and the set.
4. **`shell.js`**: `masteredCount`, then Lesson 15's row. Then every check.
5. **`lesson-15.html`**, then the `mark-lesson.js` lines (§1). Look at it in the browser pane: the quartet at 375px
   (it wraps two by two) and wide, the halo on the shadda, the hum line in parts 1, 3 and 4 only.
6. **`manifest.json`**, then `recordings.html`: **81** new rows, each with the lead.
7. **Words**, the shadda line in `spell.js`, and the words check's rules.
8. **Rows 15–29 and the home in two parts.** Look at the home, light and dark, phone and wide.
9. `qaida-lesson15-check.js`, then hand it to the user.

## 3. The checks

Every earlier check, unchanged, plus `node tools/qaida-lesson15-check.js`.

**The Lesson 15 block in `qaida-check.js`:**
- **the fence** (§2.2);
- `cpsOf` of every earlier row is `[its cp]`, and `suffixOf` is unchanged for every earlier row;
- the three rows: two marks each, **vowel first, shadda last**; `lead`; `against`; 27 letters each, none for ا or ء;
- every own id is three characters (`key`, vowel, U+0651), the same in both scripts;
- parts `[6, 6, 6, 27]`; the last part's spread over the three vowels roughly even (as Lesson 9's `8/10/9`);
- `masteredCount(15)` counts mastered own items and **not** mastered twins (بَ, بْ);
- `formOf(shadda-kasra, script).sits` is whatever `02` §3's measurement decided, per script, and `'above'`/`'below'`
  for every earlier row exactly as its own `sits`;
- 400 questions through the real engine: every warm-up question offers a same-letter twin (the vowel alone or the jazam
  alone), every last-part question offers another shadda on the same letter, and every glyph starts with the lead;
- mastery survives a script switch;
- no literal combining mark in any new or edited file.

**`qaida-lesson15-check.js`**: the rail's four parts with their own glyphs (اَبَّ, اَدِّ, اَبُّ, اَعَّ or whichever the
rotation gives); the quartet's four captions, two of them per column; the hum line in parts 1, 3, 4 and never 2; the
per-script `mark-sits` line in part 2; the skip note in part 4; finishing gated by part 4; the Spell block stepping
مُحَمَّدٌ in seven steps with step 4 on the shadda line; Previous to Lesson 14; Next to Lesson 16 (soon).

## 4. The browser checklist (the user's)

1. **اَبَّ against اَبَ and اَبْ** on the board: does the quartet show the shadda as "both at once"?
2. **The kasra with shadda**, Indo-Pak and Madani: **hold your own printed Qaida next to the screen.** Is the kasra
   where your book puts it?
3. **The halo** rings the shadda, not the vowel and not the lead.
4. **The hum line**: in the parts with noon and meem only.
5. **The home**: two parts, 29 lessons, not crowded on a phone.
6. The walkthrough (مُحَمَّدٌ) and the reading page (رَبِّ, سَبِّحْ in both scripts).
