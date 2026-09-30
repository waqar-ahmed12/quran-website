# 06 — Files, build order, and the checklist

## 1. Every file this lesson touches

| File | New? | What changes |
|---|---|---|
| `site/qaida/marks.js` | edit | the `'fatha-waw'` row (`03` §1); `forms` only if `02` §3 says so |
| `site/qaida/shell.js` | edit | Lesson 10's row: `href`, `built`, `progress`, `cp`, `tail` |
| `site/qaida/mark-lesson.js` | edit, **maybe** | nothing expected. The `{jazam}` token for the new board line, if the existing token filler does not already know it; `data-tail-below` only if `03` §3's measurement needs it |
| `site/qaida/qaida.css` | edit, **maybe** | the row rule for a descending tail, only if measured (`03` §3); otherwise a comment recording the measurement |
| `site/qaida/lesson-10.html` | **new** | `lesson-8.html` with `04` applied |
| `site/qaida/audio/manifest.json` | edit | `"fatha-waw": {}` |
| `site/qaida/spell.js`, `exercise.js` | edit | a `'fatha-waw'` entry each (`05`) |
| `site/qaida/exercise-10.html` | **new** | `exercise-9.html` with `04` §6 applied |
| `tools/qaida-check.js` | edit | a Lesson 10 block (§3) |
| `tools/qaida-lesson10-check.js` | **new** | `qaida-lesson8-check.js`'s harness, pointed at `lesson-10.html` |
| `QAIDA-BUILD.md`, `QAIDA-CONTENT.md` | edit | status and a "Step 9 built — Lesson 10" entry |

**Unchanged:** `practice.js`, `trace.js`, `voice.js`, `voice-store.js`, `audio.js` (Lesson 8 already made it honour
`skip` and composed `display`), `qaida-options.js`, `home.js`, `index.html`, `lesson-9.html`, `exercise-9.html`.

## 2. Build order

0. **`docs/step-9/README.md` §0 first**, at least items 3 and 4 (Lesson 7's words, the home's locks) — they touch
   `spell.js`, `exercise.js` and `shell.js`, which this lesson also edits.
1. **Measure the jazam** (`02` §3): six screenshots, write the result into `02` §3 before any code.
2. **The fence**, in `qaida-check.js`, before the row exists: `masteredCount(4)`, `(8)` and `(9)` on a record, and
   every glyph of lessons 4–9 in both scripts, snapshotted. They must not move.
3. **`marks.js`** — the row. `qaida-check.js`.
4. **`shell.js`** — the row. Every check (every page reads this file).
5. **`lesson-10.html`** — copy, apply `04`, search for `alif`/`27`/`29`/`lesson-8`.
6. **Measure the tile** (`03` §3) in the browser pane; `qaida.css` only if it clips.
7. **`manifest.json`**, then open `recordings.html`: **27** new rows.
8. **Words** — `spell.js`, `exercise.js`, `exercise-10.html`; `qaida-words-check.js`.
9. `qaida-lesson10-check.js`, a look in the browser pane, then hand it to the user.

## 3. The checks

Every `node --check` on the edited scripts, then:

```
node tools/qaida-check.js
node tools/qaida-marks-check.js
node tools/qaida-lesson5-check.js
node tools/qaida-lesson6-check.js
node tools/qaida-lesson7-check.js
node tools/qaida-lesson8-check.js
node tools/qaida-lesson9-check.js
node tools/qaida-lesson10-check.js
node tools/qaida-words-check.js
node tools/qaida-lesson3-check.js
node tools/qaida-voice-check.js
node tools/qaida-page-check.js
```

**The Lesson 10 block in `qaida-check.js`:**
- the row: `cp`, `tail` of two, `lesson: 10`, `against` in that order; 27 items, none for ا or ء;
- every id four characters, ending U+064E U+0648 U+0652, **in both scripts**;
- `sizes()` is `[6, 27]`, laam in part 1;
- a letter's distinct ids across lessons 4–10 (twelve for ب, one more than Lesson 9 counted);
- `masteredCount(4)`, `(8)`, `(10)` each count only their own, with one mastered item of each on the same letter;
- **300 questions through the real engine: every Lesson 10 question offers its twin** (بَا or بَ, by the
  alternation) among the answers, and **never a Lesson 11 item**;
- mastery survives a script switch;
- if `forms` was added: `drawnOf` differs by script, `suffixOf` does not;
- no literal combining mark in `marks.js`, `lesson-10.html`, `spell.js`, `exercise.js`, `exercise-10.html`.

**`qaida-lesson10-check.js`** (the real page in a hand-made DOM): the quartet and its arrows; `data-tail` on the
marked tile only; the jazam line present with `{jazam}` filled in both name sets; the joined block's two examples
and **no lam-alif example in either part**; the skip note in part 2; 250 questions with the twin check at page
level; finishing gated by part 2 at seven tenths of 27; Indo-Pak; the Spell block stepping قَوْمٌ in two steps
(never splitting قَ from وْ); Previous to Lesson 9; no "29" on the page.

## 4. The browser checklist — the user's

1. **بَوْ against بَا on the board, and in a question** — does the student see at once which letter follows?
2. **The jazam**: does it read as a mark on the wow (not a dot, not a smudge), both faces, both themes? Is the
   Madani one the shape the student's mushaf prints?
3. **The wow's tail**: nothing clipped at the bottom of a tile, on the table's 27, default and Large.
4. **The halo** rings the wow, not the zabar and not the whole item.
5. **دَوْ** and the other four: the wow stands apart and looks it.
6. The Indo-Pak face on the whole table (the stand-in font — note what it does, change nothing).
7. The walkthrough: قَوْمٌ lights قَوْ as one step, then the whole word.
8. The reading page: twelve words, no mark clipped, the table full (4 × 3).
