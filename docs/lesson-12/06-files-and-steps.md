# 06 — Files, build order, and the checklist

## 1. Every file this lesson touches

| File | New? | What changes |
|---|---|---|
| `site/qaida/marks.js` | edit | the `'fatha-yaa'` row (`02` §1); `formOf`'s `cp` fallback (`03` §1, recommended) |
| `site/qaida/shell.js` | edit | Lesson 12's row: `href`, `built`, `progress`, `cp`, `tail` |
| `site/qaida/mark-lesson.js` | edit, **maybe** | `data-tail-below`, only if `03` §3's measurement needs it |
| `site/qaida/qaida.css` | edit | the bowl's row rule if measured, otherwise a comment recording the measurement |
| `site/qaida/lesson-12.html` | **new** | `lesson-11.html` with `04` applied |
| `site/qaida/audio/manifest.json` | edit | `"fatha-yaa": {}` |
| `site/qaida/spell.js`, `exercise.js` | edit | a `'fatha-yaa'` entry each |
| `site/qaida/exercise-12.html` | **new** | `exercise-11.html` with `04` §6 applied |
| `tools/qaida-check.js` | edit | a Lesson 12 block (§3) |
| `tools/qaida-lesson12-check.js` | **new** | `qaida-lesson11-check.js`'s harness, pointed at `lesson-12.html` |
| `QAIDA-BUILD.md`, `QAIDA-CONTENT.md` | edit | status, and a "Step 9 built — Lesson 12" entry |

## 2. Build order

0. **Lesson 11 built.** This lesson assumes its fourth statement and its per-script jazam line.
1. **The fence**: snapshot lessons 4–11's glyphs in both scripts and `masteredCount` for each.
2. **`marks.js`**: `formOf`'s fallback, then the row. Run `qaida-check.js`; the fence must not move.
3. **`shell.js`**: the row. Run every check.
4. **`lesson-12.html`**: copy it and apply `04`.
5. **Look at لَيْ and بَيْ** in both faces (`02` §4). Swap ل for ن in `first` only if a fused shape appears.
6. **Measure the bowl** (`03` §3). Add the row rule only if it clips; record the result in `qaida.css` either way.
7. **`manifest.json`**, then `recordings.html`: **27** new rows.
8. **Words**, then `qaida-words-check.js`.
9. `qaida-lesson12-check.js`, a look in the browser pane, then hand it to the user.

## 3. The checks

Every earlier check, unchanged, plus `node tools/qaida-lesson12-check.js`.

**The Lesson 12 block in `qaida-check.js`:**
- the row: `cp`, `tail` `[U+064A, U+0652]`, `lesson: 12`, `against` `['fatha', 'fatha-waw']`, **two** `forms`; 27
  items, none for ا or ء;
- **the id is identical in both scripts** (`key + U+064E U+064A U+0652`) and contains neither U+06CC nor U+06E1;
- `drawnOf(row, 'madani')` is U+064E U+064A U+06E1 and `drawnOf(row, 'indopak')` is U+064E U+06CC U+0652;
- `formOf` never returns a form without `cp`, for every row, in both scripts;
- `sizes()` is `[6, 27]`;
- a letter's distinct ids across lessons 4–12: **fourteen** for ب;
- `masteredCount(4)`, `(8)`, `(10)`, `(12)` each count only their own;
- **300 questions:** every question offers its twin (بَ or بَوْ), and never a Lesson 13 item;
- mastery survives a script switch, **in both directions**;
- `audio.js`: a `fatha-yaa` group of 27;
- no literal combining mark in the new and edited files.

**`qaida-lesson12-check.js`:** Lesson 11's page checks with the same-sound tile **absent**; the jazam line's Indo-Pak
text includes the dotless-yaa sentence and the Madani text does not; the joined block's examples (a joining letter,
then دَيْ or رَيْ) with no lam-alif; the Spell block stepping بَيْتٌ in two steps; Previous to Lesson 11.

## 4. The browser checklist (the user's)

1. **بَيْ against بَوْ**, on the board and in a question: is the letter after the zabar clear at a glance?
2. **The bowl**: nothing clipped at the bottom of any tile, including the two dots, on all 27, default and Large.
3. **Indo-Pak بَیْ**: the yaa at the end has no dots, the line under the board says so, and it reads as the yaa of
   Lesson 3's end shapes.
4. **لَيْ and بَيْ**: a laam and a yaa, not one fused shape; baa's dot and the yaa's dots readable together.
5. **The halo** rings the yaa (and its dots and jazam), not the zabar.
6. **The jazam** in Madani is the open shape Lesson 10 settled on.
7. The walkthrough: بَيْتٌ lights بَيْ as one step. The reading page: twelve words, the table full.
