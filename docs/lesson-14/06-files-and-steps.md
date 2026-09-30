# 06 — Files, build order, and the checklist

## 1. Every file this lesson touches

| File | New? | What changes |
|---|---|---|
| `site/qaida/marks.js` | edit | the `sukun` row (`02` §1); `leadOf`; the lead in `allItems`, `twinItems`, `boardRows`, `sampleOf` (`03` §1–2) |
| `site/qaida/mark-lesson.js` | edit | the lead in `markTile`, `markBox`, `paintHead`; the leads line, `lead-line`, `wy-note`; `hasTail`; the last Next (`03` §2–4, §8, §10) |
| `site/qaida/spell.js` | edit | the jazam step (`03` §6) and the `sukun` words |
| `site/qaida/exercise.js` | edit | the `sukun` words; Next on the last lesson |
| `site/qaida/audio.js` | edit | `display` with the lead; the description line for a row with a lead (`03` §9) |
| `site/qaida/shell.js` | edit | Lesson 14's row |
| `site/qaida/qaida.css` | edit, **maybe** | only if `02` §4's measurement needs it, otherwise a comment recording it; `.leads-note` spacing |
| `site/qaida/audio/manifest.json` | edit | `"sukun": {}` |
| `site/qaida/lesson-14.html`, `exercise-14.html` | **new** | `04` |
| `site/qaida/lesson-13.html`, `exercise-13.html` | none | their Next reads `shell.LESSONS` |
| `tools/qaida-words-check.js` | edit | the three jazam rules (`03` §7) |
| `tools/qaida-check.js` | edit | a Lesson 14 block, and **the fence** |
| `tools/qaida-lesson14-check.js` | **new** | the page check |
| `QAIDA-BUILD.md`, `QAIDA-CONTENT.md` | edit | status, and a step-log entry. **Step 9 is then built in full** |

**Unchanged:** `practice.js`, `trace.js`, `voice.js`, `voice-store.js`, `qaida-options.js` (the rows it shows come
from `window.qaida`'s getters), `home.js`, `index.html`.

## 2. Build order

0. **The user's sign-off on `07` §1.** Then, ideally, lessons 11–13 built. Their fourth `MARKS` statement and
   per-script line are assumed below.
1. **The fence**, in `qaida-check.js`, before anything else: every glyph `allItems`, `twinItems`, `boardRows` and
   `sampleOf` return for **every lesson 4–13**, in both scripts, as a snapshot. `masteredCount` for each lesson on a
   hand-made record. This must pass unchanged after every later step.
2. **`marks.js`**: `leadOf` first (unused yet), then the row, then the four draw sites. Run `qaida-check.js`; the
   fence must not move.
3. **`mark-lesson.js`**: the three draw sites, then `hasTail`. Run every lesson's page check (lessons 4–13), which
   must be unchanged.
4. **`shell.js`**: the row. Run every check.
5. **`lesson-14.html`**: `04`. Then the leads line, `lead-line`, `wy-note` and the last Next in `mark-lesson.js`.
6. **Measure** in the browser pane: the jazam on all 27 (`02` §4), the halo on the jazam alone (`03` §3), and the
   trio's wide tiles at 375px.
7. **`audio.js`** and `manifest.json`, then `recordings.html`: **27** new rows reading اَبْ…
8. **`spell.js`**'s jazam step, then the words (`spell.js`, `exercise.js`, `exercise-14.html`), then the words check's
   three new rules. `qaida-words-check.js` must pass for **every** lesson.
9. `qaida-lesson14-check.js`, a look in the browser pane, then hand it to the user.

## 3. The checks

Every earlier check, unchanged, plus `node tools/qaida-lesson14-check.js`.

**The Lesson 14 block in `qaida-check.js`:**
- **the fence** (§2.1): every glyph of lessons 4–13 unchanged, both scripts; `leadOf` is `''` for every row but `sukun`;
- the row: `cp` U+0652, `lesson: 14`, `against` the three vowels, `lead` `[U+0627, U+064E]`, the Madani form's `cp`
  U+06E1; 27 items, none for ا or ء, **و and ي included**;
- **every id is two characters**, the letter's key then U+0652, in both scripts, **with no lead in it**;
- every item's and twin's glyph starts with the lead; the Madani glyph ends U+06E1 and the Indo-Pak one U+0652;
- `sizes()` is `[6, 27]`;
- `masteredCount(14)` counts one mastered own item, and **not** mastered twins (بَ بِ بُ recorded in Lesson 14's
  record);
- **300 questions:** every question offers a same-letter twin with a vowel, all three vowels appear as twins across
  the run, every choice's glyph starts with the lead, and no two choices differ only in the lead;
- mastery survives a script switch;
- `audio.js`: a `sukun` group of 27, each `display` starting with the lead;
- no literal combining mark in any new or edited file.

**`qaida-words-check.js`:** the three rules (`03` §7) on every word of every lesson, and a deliberately bad word
(a jazam on the first letter) fails it.

**`qaida-lesson14-check.js`** (the real page in a hand-made DOM): the trio with its arrows; the bare tile with no lead
and every other tile with it; `data-tail` on every tile but the bare one; the title and both rail glyphs with the
lead; the joined block hidden and the leads line in its place, with three examples; `lead-line`, the jazam note (the
Madani line in Madani, the Indo-Pak line in Indo-Pak), the `wy-note` and the skip note in part 2 only; the prompt
and every choice with the lead; finishing gated by part 2 at seven tenths of 27; the Spell block stepping قَلْبٌ in
five steps, with step 2 using the jazam line; **Next reading "Back to the Qaida" and going to `index.html`**;
Previous to Lesson 13; no "29" on the page.

## 4. The browser checklist (the user's)

1. **اَبْ against اَبَ, اَبِ, اَبُ**, on the board and in a question: can you see which mark the second letter
   carries, at the tile's size? The jazam and zabar sit in the same place.
2. **The jazam's shape** on all 27, both scripts, both themes: a mark, not a dot or a smudge; the Madani one the
   shape your mushaf prints; nothing clipped over ل ط ظ ك.
3. **The lead**: does اَ in front of every letter read naturally, or does it crowd the page? Is the alif too
   heavy, or too light?
4. **The halo** rings the jazam only.
5. **The leads line** (اَبْ اِبْ اُبْ) and the three lines under the board: too many words, or the right few?
6. **Part 2's اَوْ and اَيْ**, and the line saying they are "au" and "ai".
7. **The walkthrough**: قَلْبٌ in five steps, the jazam step's line, "qal" on the step after it.
8. **The reading page**: twelve words; in Indo-Pak, مَكْتُوبٌ with its two jazams.
9. **The end**: Next says "Back to the Qaida" and goes there.
