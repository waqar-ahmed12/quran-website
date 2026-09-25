# 05 — Files, build order, and the checklist

## 1. Every file this lesson touches

There is **no `lesson-7.js`**, for the reason `docs/lesson-4/README.md` gives: `mark-lesson.js` is the page for
every lesson of marks, and a fourth copy would be a fourth place to fix every bug.

| File | New? | What changes |
|---|---|---|
| `site/qaida/marks.js` | edit | three rows in `MARKS`; `SETS`, `setOf`, `marksOf`; `partsOf`; `parts` on an item and `inPart`; `twinItems` unchanged; `boardRows` takes the marks to show; `sampleOf` takes a part (`03`) |
| `site/qaida/mark-lesson.js` | edit | `own` / `set` / the part's mark; `twinMarksFor`; `markTile` and `markBox` take the stroke; `boardMode` learns `auto`; `{set}` and `{where}`; the rail from `partsOf` |
| `site/qaida/lesson-7.html` | **new** | `lesson-6.html` with `04-page-and-wording.md` applied |
| `site/qaida/lesson-6.html` | edit | its Next button becomes a real link to `lesson-7.html` (`04` §6) |
| `site/qaida/shell.js` | edit | Lesson 7's row gains `href`, `built: true`, `progress: 'drill'`, `cp: [0x064B, 0x064C, 0x064D]`; `masteredCount` accepts a list (`03` §9) |
| `site/qaida/qaida.css` | edit | **two selectors move from `:root` to the tile** (`03` §7). Nothing else — `.pair.quad` already exists |
| `site/qaida/qaida-options.js` | edit | the Part row built from the lesson's parts; the twins row's label; `auto` on the board row (`04` §7) |
| `site/qaida/audio/manifest.json` | edit | add `"fathatain": {}`, `"kasratain": {}`, `"dammatain": {}` |
| `tools/qaida-check.js` | edit | a Lesson 7 block beside the Lesson 4, 5 and 6 ones (§3) |
| `tools/qaida-lesson7-check.js` | **new** | the harness of `qaida-lesson6-check.js`, pointed at `lesson-7.html` |
| `QAIDA-BUILD.md` | edit | the status table and a "Step 7 built — Lesson 7" log entry |
| `design-system/quran-landing/pages/qaida.md` | **after the user has seen it** | not before |

**Nothing else.** `practice.js` does not change. `audio.js`, `recordings.js` and `recordings.html` need no edit:
`groups()` walks `MARKS` and takes any mark whose lesson is built, so the three rows plus `built: true` put **87
new rows** in the teacher's recording list on their own. **Check that they appeared** — it is one look at
`recordings.html` and the cheapest confirmation that the three `MARKS` rows are right.

## 2. Build order

Strictly this order. Each step is provable by a script before the next one starts, and the three lessons already
awaiting sign-off are the reason.

1. **`marks.js`, the three `MARKS` rows only.** Run `node tools/qaida-check.js`. Nothing consumes them yet, so
   this step cannot break anything — it proves the code points, the ids and the names.
2. **`marks.js`, `SETS` / `marksOf` / `partsOf`.** Still nothing consumes them. Prove `partsOf([damma])` is the
   two parts lessons 4–6 already have.
3. **`marks.js`, `parts` on an item and `inPart`.** This one *can* break lessons 4–6: `sizes()`, `stats()`,
   `poolFor()` and `boardRows()` all read the old `group`. Run **all four** page checks after it and do not go on
   until they pass unchanged.
4. **`shell.js`** — the lesson row and `masteredCount`'s list. Every page in the Qaida shares this file: all the
   checks again.
5. **`mark-lesson.js`** — in this order: the part's mark and `say()`, then the rail, then `twinMarksFor`, then the
   board, then the halo and `markBox`. Lessons 4, 5 and 6 must pass their own checks **after every one of them**.
   If they do not, the change was not as small as it looked.
6. **`qaida.css`** — the two selectors. Lesson 5 is the one to look at: every tile on that page must still get the
   rule it gets today.
7. **`lesson-7.html`** — copy `lesson-6.html`, apply `04` line by line. Then `lesson-6.html`'s Next.
8. **`qaida-options.js`** — the four rows.
9. **`manifest.json`**, then open `recordings.html` and confirm the 87 rows appeared.
10. **The checks**, then hand it to the user.

## 3. The checks that run without a browser

```
node --check site/qaida/marks.js
node --check site/qaida/mark-lesson.js
node --check site/qaida/shell.js
node --check site/qaida/qaida-options.js
node tools/qaida-check.js
node tools/qaida-marks-check.js
node tools/qaida-lesson5-check.js
node tools/qaida-lesson6-check.js
node tools/qaida-lesson7-check.js
node tools/qaida-lesson3-check.js
```

All of them, every time. Lessons 2, 3, 4, 5 and 6 share `shell.js` and `practice.js` with this one, and the whole
point of the check scripts is that a shared-file edit cannot quietly break a lesson that is awaiting sign-off.
(`qaida-lesson3-check.js` has flaked once on "the table asks about every group"; it is random and unrelated. Rerun
it before believing it.)

**What to add to `tools/qaida-check.js`:**

- **The one-mark case is unchanged.** `partsOf([MARKS.damma])` is two parts; `sizes()` for Lesson 6 is `[6, 29]`;
  `allItems` gives 29 items, six of them in part 1. This is the assertion that protects lessons 4–6, and it should
  be written **first**, before any of the new rows exist.
- Three new marks, ids two characters, ending in U+064B / U+064C / U+064D, and **no literal combining mark in the
  source** — extend the existing check to all six code points rather than copying it.
- **Six distinct ids for one letter**: ب bare, and ب with each of U+064E, U+0650, U+064F, U+064B, U+064C, U+064D.
  A collision gives a student credit for a mark they never saw.
- `partsOf` for the tanween set is **four** parts, the first three carrying one mark each in lesson order.
- The last part has **29** required items, not 87, and their marks are spread 10 / 10 / 9.
- **`against` is the single counterpart on all three**: fathatain → fatha, kasratain → kasra, dammatain → damma.
  Not "every earlier mark" — the check that would catch the `03` §1 mistake.
- **In the last part, every item's twin carries another tanween** — never the single mark. The check that would
  catch the `03` §5 mistake, which is the one that quietly turns part 4 into part 1.
- In a warm-up part, every item's twin carries **the single counterpart**.
- `stats` and the bar count **each id once**, when a pair is in a warm-up part *and* the last part.
- `{set}` fills as "tanween" in both name sets and is empty on lessons 4, 5 and 6.
- Mastery survives a change of script and a change of part, as the Lesson 4, 5 and 6 blocks check.

**What to add to `tools/qaida-lesson7-check.js`** (the Lesson 6 suite, pointed at `lesson-7.html`), plus:

- the rail builds **four** buttons, each with its part's name and glyph, and the name set switches all four;
- the board draws a **trio** in parts 1–3 and a **quartet** in part 4, and part 4's three marked cells carry
  U+064B, U+064C and U+064D in that order;
- in part 2 the kasratain tiles carry `data-sits="below"` and the others do not;
- a full run through part 4 finishes the lesson at four fifths of the **29**, and parts 1–3 never gate it;
- opening part 4 first works and advises once (nothing is locked);
- the home card's number equals the page's bar, with items from all three marks in the record;
- `data-twins="both"` gives two twins per letter in part 4 and one in a warm-up; `off` gives none and the lesson
  still runs.

The check scripts cannot see what a page looks like. Everything in §4 is the user's.

## 4. The blocking browser checklist — the user's, not yours

**Do not drive a browser, do not sign this off.** Preview with `node serve.js`, then
`http://localhost:8777/site/qaida/lesson-7.html`, and hand the user this list. The first item decides whether the
lesson works at all.

1. **Can you tell بَ from بً at the tile's size, and بُ from بٌ?** In **both faces** and **both themes**. This is
   the whole lesson: one stroke against two, in the same place. بُ against بٌ is the harder of the two
   (`02` §4) — dammatain is drawn as a damma with a tail in most faces, not as two clear curls. If either pair is
   a squint, the tile or the drill glyph is too small and that is a `qaida.css` change, not a Lesson 7 change.
2. **Do two strokes fit where one did?** The letters that decide it: **ي ب ج ن** (dots below, with kasratain
   under them), **ا ل ك ط** (tall, with fathatain above), **ث ش** (three dots above already), **ج ح خ ع غ**
   (hanging below, so the tile is tight at both ends), and **و** (dammatain on a wow is a wow with two small wows
   on it). Nothing clipped at the top or the bottom of a tile.
3. **The quartet in part 4** — does ب بً بٌ بٍ read as one family, or as a wall? The panel has `trio`, `pairs`
   and `marked only` if it is too much, and an arrows row if that is the noise.
4. **The mixed row's heights.** Part 4 puts marks above and below in the same row (`03` §7). Do the four tiles
   line up, or does the kasratain one sit differently? This is the one thing the CSS change could get wrong.
5. **The halo** sits on the mark and not on the letter, on **both** strokes — including the below one — and it
   follows a change of lettering in the panel.
6. **In the drill, is a doubled-against-single question actually hard?** If every question is obvious, the twins
   are not pairing and part 4 has become part 1 (`03` §5).
7. **Does the lesson feel too long?** Four parts. The rows to turn down first are *the other marks riding along*
   and the board.
8. **"Write it"** opens the tracer on the letter **with its doubled mark**, and the guide is still centred on its
   ink.
9. **The name set**: switch zabar ↔ fatha mid-question and confirm the title, the rail's four names, the board's
   captions and every item name change with no reload and no lost progress.
10. **Lessons 4, 5 and 6 still work.** Open each, run one question, and check the home card's number against the
    page's bar. `marks.js`, `mark-lesson.js`, `shell.js` and `qaida.css` were all edited under them.
11. **The Indo-Pak shapes are the Madani ones** (`02` §5). Confirm it, so it is a known stand-in and not a
    surprise at step 13.

## 5. When it is done

Update `QAIDA-BUILD.md` — the status table and a "Step 7 built — Lesson 7" entry listing **where the build differs
from this folder**, the way the Lesson 3, 4, 5 and 6 entries do. Leave
`design-system/quran-landing/pages/qaida.md` until the user has seen the page.

**Step 7 is lessons 7–9: tanween, zabar + alif, standing harakaat.** Lesson 8 (madd) is the first lesson where the
mark is joined by a **letter** — the alif — so its items are two letters and a mark, and `twinItems` will want a
pair rather than a letter. **Lesson 9 is the one to read this folder for:** standing harakaat are three marks in
one lesson, exactly as here, and `SETS` / `partsOf` / `twinMarksFor` were built for it. It is also the first
lesson in the Qaida with **no ordinary letter on the page at all**, and that needs its own plan rather than a copy.
