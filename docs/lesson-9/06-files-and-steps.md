# 06 — Files, build order, and the checklist

## 1. Every file this lesson touches

There is **no `lesson-9.js`**: `mark-lesson.js` is the page for every lesson of marks, and `spell.js` and
`exercise.js` serve every lesson's words.

| File | New? | What changes |
|---|---|---|
| `site/qaida/marks.js` | edit | three rows and the `standing` set; `formOf`, `drawnOf`; `glyphOf`/`aloneOf` through `drawnOf` (`03` §1, §3) |
| `site/qaida/mark-lesson.js` | edit | `markTile`'s `data-tail` and tint through `formOf`; `markBox`'s `head` and cache key; the same-sound tile, `data-joined="off"`, the met and Madani lines (`03` §4–7) |
| `site/qaida/shell.js` | edit | Lesson 9's row gains `href`, `built`, `progress`, `cp` (`03` §2). **`masteredCount` does not change** |
| `site/qaida/audio.js` | edit | `groups()` lists a shared `audio` kind once (`03` §8) |
| `site/qaida/audio/manifest.json` | edit | `"kasra-yaa": {}`, `"damma-waw": {}` |
| `site/qaida/qaida.css` | edit, **maybe** | the `=` sign; the `above-tall` height rule **only if** the Madani khari zabar clips (`03` §4) |
| `site/qaida/lesson-9.html` | **new** | `lesson-8.html` with `04` applied |
| `site/qaida/spell.js` | edit | set lookup; a `standing` entry (`05` §2) |
| `site/qaida/exercise.js` | edit | set lookup; a `standing` entry (`05` §3) |
| `site/qaida/exercise-9.html` | **new** | `exercise-8.html` with `04` §8 applied |
| `site/qaida/qaida-options.js` | edit | `hasTail` per script; the optional *The same sound* row (`04` §9) |
| `tools/qaida-check.js` | edit | a Lesson 9 block (§3) |
| `tools/qaida-lesson9-check.js` | **new** | the harness of `qaida-lesson7-check.js`, pointed at `lesson-9.html` |
| `tools/qaida-words-check.js` | edit | picks up `standing` from both files; nothing else if it already reads every key |
| `QAIDA-BUILD.md`, `QAIDA-CONTENT.md` | edit | the status and a "Step 8 built — Lesson 9" log entry |
| `design-system/quran-landing/pages/qaida.md` | **after the user has seen it** | not before |

**Nothing else.** `practice.js`, `trace.js`, `voice.js`, `voice-store.js`, `home.js` and `index.html` do not
change. `lesson-8.html` and `exercise-8.html` need nothing: their Next buttons read `shell.LESSONS`.

## 2. Build order

Strictly this order. Each step is provable by a script before the next; seven lessons now sit behind these files.

1. **The fence, before any code.** In `tools/qaida-check.js`: for every mark of lessons 4–8, `drawnOf(mark, 'madani')`
   and `drawnOf(mark, 'indopak')` both equal `suffixOf(mark)`; every item's `glyph` for lessons 4–8 is byte-for-byte
   what it is today, in both scripts (snapshot them first). They fail until `drawnOf` exists; then they are the fence.
2. **`marks.js` — `formOf`, `drawnOf`**, and `glyphOf`/`aloneOf` through them. No new row. **Run every page check**:
   lessons 4–8 must not notice.
3. **`marks.js` — the rows and the set.** Run `qaida-check.js`.
4. **`shell.js`** — the row. All checks again (every page shares this file).
5. **`mark-lesson.js`**, lessons 4–8's checks after each: `markTile`, then `markBox`/the cache key, then the board
   (same-sound tile, joined off, met and Madani lines).
6. **`lesson-9.html`** — copy `lesson-8.html`, apply `04` line by line, search it for `29` and `27`.
7. **`audio.js`** and **`manifest.json`**; open `recordings.html` and confirm **54** new rows, and that the
   "fatha and alif" group did **not** double.
8. **Words** — `spell.js` and `exercise.js` (the set lookup first, then the entries), `exercise-9.html`.
9. **`qaida-options.js`**, and **`qaida.css`** — the `=` sign, and the `above-tall` rule only if a look in the
   browser pane shows a clipped Madani khari zabar.
10. The checks, a look in the browser pane, then hand it to the user.

## 3. The checks that run without a browser

```
node --check site/qaida/marks.js
node --check site/qaida/mark-lesson.js
node --check site/qaida/shell.js
node --check site/qaida/audio.js
node --check site/qaida/spell.js
node --check site/qaida/exercise.js
node --check site/qaida/qaida-options.js
node tools/qaida-check.js
node tools/qaida-marks-check.js
node tools/qaida-lesson5-check.js
node tools/qaida-lesson6-check.js
node tools/qaida-lesson7-check.js
node tools/qaida-lesson8-check.js
node tools/qaida-lesson9-check.js
node tools/qaida-words-check.js
node tools/qaida-lesson3-check.js
node tools/qaida-page-check.js
node tools/qaida-voice-check.js
```

All of them, every time. (`qaida-lesson3-check.js` has flaked before; rerun it before believing it.)

**What to add to `tools/qaida-check.js`:**

- **The fence** (step 1) — written first.
- The rows: `cp` U+0670 / U+0656 / U+0657; `forms.madani` as `03` §1; `against` `['fatha']` / `['kasra']` /
  `['damma']`; `lesson: 9`; `skip` ا and ء; `audio` `fatha-alif` / `kasra-yaa` / `damma-waw`; `same` on the first.
- `partsOf(marksOf('standing'))` is four parts; `sizes()` is **`[6, 6, 6, 27]`**; the last part spreads **8 / 10 / 9**.
- **Every id is two characters in both scripts**, and **the same set of ids in both** — the thing a script switch
  must not change.
- **The glyphs do change**: بٰ بٖ بٗ in Indo-Pak; بَٰ بِۦ بُۥ in Madani (code points, not pasted).
- **ب has distinct ids across every lesson**: bare, U+064E, U+0650, U+064F, U+064B, U+064C, U+064D, U+064E U+0627,
  U+0670, U+0656, U+0657 — **eleven**.
- **Mastery survives a script switch** — the check that matters most.
- `masteredCount(9)` counts own items only on a record that also holds twins; `masteredCount(4)` and
  `masteredCount(8)` are unchanged by Lesson 9's rows.
- **No Lesson 9 question ever offers a Lesson 8 item** (an id ending U+064E U+0627) — a few hundred questions
  through the real engine, as Lesson 7's check ran its own contrast. And every warm-up question offers its short
  twin; every last-part question offers another standing mark.
- `audio.js`'s `wanted()` lists `fatha-alif` **once**, and has `kasra-yaa` and `damma-waw` of 27 each.
- No literal U+0670, U+0656, U+0657, U+06E5, U+06E6 in any source file (extend the existing check).

**`tools/qaida-lesson9-check.js`** (Lesson 7's suite, pointed at `lesson-9.html`), plus:

- four rail buttons naming their own mark, in both name sets;
- a trio in each warm-up, the quartet in part 4;
- **the same-sound tile on part 1's feature row only**, holding بَا, and never a `.choices` button holding it;
- the joined block hidden; the met line showing its part's own mark; the Madani line present in Madani and absent
  in Indo-Pak;
- **switch script with the page open**: the tiles redraw (a Madani tile's text contains U+064E before U+0670;
  an Indo-Pak one does not), the drill keeps its place, the bar does not move;
- `data-tail` on the Madani khari zair and ulta paish tiles only, never on Indo-Pak;
- finishing gated by part 4 alone at seven tenths of 27;
- the Spell block steps هٰذَا in the right number of steps; Previous goes to Lesson 8.

## 4. The browser checklist — the user's

Preview with `node serve.js`, then `http://localhost:8777/site/qaida/lesson-9.html`, and hand the user this list.

1. **Can you tell بٰ from بَ, and بٗ from بُ, at the tile's size?** Both faces, both themes. The second is the
   smallest difference in the Qaida (`02` §3.3). If it is too hard, try *Letter size → Large* and say so.
2. **Madani: does the khari zabar fit?** Zabar with a small alif on top is the tallest thing any tile has held
   — look at **ل ط ظ ك**, the tall letters, in part 4. Nothing clipped at the top.
3. **Khari zair: nothing clipped at the bottom**, and the row the same height across (**ج ع م ي** in part 4).
4. **Madani khari zair and ulta paish**: the small yaa / waw sit after the letter, the tile is wider, and every tile
   in the row is the same height.
5. **Switch script while a part is open.** The marks change shape; your progress does not.
6. **The same-sound tile** — بٰ = بَا on part 1. Does it read as "the same", not "which one"?
7. **The halo**: on the standing stroke in Indo-Pak; on the **small alif** in Madani, not the zabar under it.
8. **The words**: هٰذَا, بِهٖ, كِتٰبَهٗ in the walkthrough; twelve on the exercise page — **and the teacher's check
   of every spelling against the mushaf** (`05` §1, §4).
9. **Indo-Pak ہ with khari zair / ulta paish** in Noto Naskh, then in Scheherazade New — ه is the letter these
   marks live on, and Noto Naskh has drawn ہ badly before.
10. **Lessons 4–8 still work.** Open each, answer one question, compare the home card with the page's bar.

## 5. When it is done

Update `QAIDA-BUILD.md` — the step 8 row, "Where we are", and a **"Step 8 built — Lesson 9"** entry listing where the
build differs from this folder — and `QAIDA-CONTENT.md` item 9. **Step 8 is then built** (lessons 7, 8 and 9), and
awaiting the user's look.

**Next is step 9, lessons 10–14**: zabar + wow and paish + wow (leen and the long oo), zabar + yaa and zair + yaa,
then jazam. Lesson 8's `tail` carries all four of the first ones, and lessons 11 and 13 point their `same` back at
this lesson's ulta paish and khari zair. **But lessons 10 and 12 write a sukun on the wow and yaa, and jazam is
Lesson 14** — so they show a mark two lessons before it is taught. That is step 9's first question, not this one's.
