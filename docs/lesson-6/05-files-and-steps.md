# 05 — Files, build order, and the checklist

## 1. Every file this lesson touches

There is **no `lesson-6.js`**, for the reason `docs/lesson-4/README.md` gives: `mark-lesson.js` is the page for
lessons 4, 5 and 6, and a third copy would be a third place to fix every bug.

| File | New? | What changes |
|---|---|---|
| `site/qaida/marks.js` | edit | `after` → `against` on all three rows; `othersOf`; `otherOf` reads the list; `{others}` in `wordsFor`; `twinItems` takes a `marks` list; `reviewKeys` loops the others; `boardRows` returns `others` |
| `site/qaida/mark-lesson.js` | edit | `reviewPlan` / `poolOf` build one twin per letter, alternating (`03` §4); `boardMode()` learns `quad`; `pairOf` loops `row.others`; the arrow rule |
| `site/qaida/lesson-6.html` | **new** | `lesson-5.html` with `04-page-and-wording.md` applied |
| `site/qaida/shell.js` | edit | Lesson 6's row gains `href: 'lesson-6.html'`, `built: true`, `progress: 'drill'`, `cp: 0x064F`. **Nothing else** — `masteredCount` is already right (`03` §8) |
| `site/qaida/qaida.css` | edit | `.pair.quad` and its narrow-screen rule, beside `.pair.trio`. **Nothing else** (`04` §7) |
| `site/qaida/qaida-options.js` | edit | the three-way twins row, the board row's fourth value, the arrows row (`04` §6) |
| `site/qaida/audio/manifest.json` | edit | add `"damma": {}`, to match `"fatha"` and `"kasra"` |
| `tools/qaida-check.js` | edit | a Lesson 6 block beside the Lesson 4 and Lesson 5 ones (§3) |
| `tools/qaida-lesson6-check.js` | **new** | the harness of `qaida-lesson5-check.js`, pointed at `lesson-6.html` |
| `QAIDA-BUILD.md` | edit | the status table and a "Step 6 built — Lesson 6" log entry |
| `design-system/quran-landing/pages/qaida.md` | **after the user has seen it** | not before |

**Nothing else.** `practice.js` does not change — if it looks as though it must, the work belongs in the page
(`docs/lesson-2/02-practice-engine.md`, and `tools/qaida-check.js` will say so).

`audio.js`, `recordings.js` and `recordings.html` need **no edit at all**: `audio.js`'s `groups()` walks `MARKS` and
includes any mark whose lesson is `built`, and `recordings.html` already loads `marks.js`. Setting `built: true` in
`shell.js` adds all 29 damma rows to the teacher's recording list on its own. **Check that it did** — it is one
look at `recordings.html`, and it is the cheapest confirmation in the whole build that the lesson row is right.

## 2. Build order

1. **`marks.js`** first, and run `node tools/qaida-check.js` after each change. It is the file the checks can see
   without a browser, so every mistake here is cheap. Do `against` / `otherOf` / `othersOf` as **one** commit-sized
   step and prove lessons 4 and 5 are unchanged before going on — that is the whole risk of this lesson.
2. **`shell.js`** — the lesson row, four fields. Run all four check scripts: `shell.js` is shared by every page in
   the Qaida.
3. **`mark-lesson.js`** — the pool change, then the board. Lessons 4 and 5 must still pass `qaida-marks-check.js`
   and `qaida-lesson5-check.js` unchanged after **every one** of them; if they do not, the change was not as small
   as it looked.
4. **`lesson-6.html`** — copy `lesson-5.html`, then apply `04-page-and-wording.md` line by line.
5. **`qaida.css`** — the one rule and its narrow-screen twin.
6. **`qaida-options.js`** — the three rows.
7. **`manifest.json`**, then open `recordings.html` and confirm the damma rows appeared.
8. **The checks**, then hand it to the user.

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
node tools/qaida-lesson3-check.js
```

All of them, every time — lessons 2, 3, 4 and 5 share `shell.js` and `practice.js` with this one, and the whole
point of the check scripts is that a shared-file edit cannot quietly break a lesson that is awaiting sign-off.

**What to add to `tools/qaida-check.js`:**

- `against` is a list on every mark, in lesson order, and `otherOf` is its first entry: `fatha` → none,
  `kasra` → fatha, `damma` → **fatha** (the check that would have caught `03` §1).
- 29 damma items, every id two characters, every one ending in U+064F, and **no literal combining mark in the
  source** — the check exists for U+064E and U+0650; extend it to all three rather than copying it.
- **The four ids of one letter are distinct**: `ب`, ب+U+064E, ب+U+0650, ب+U+064F. A collision here would silently
  give a student credit for a mark they never saw.
- `twinItems` with two marks returns 2 × `keys.length` items, all `group: 0`, all `required: false`, each carrying
  its own `mark` id and its own mark's word in `markName`.
- `sizes`, `stats` and `poolFor` still count **29**, not 87, with two sets of twins in the pool.
- `{others}` fills as "zabar and zair" in one name set and "fatha and kasra" in the other, and is empty on Lesson 4.
- mastery survives a change of script and a change of part, as the Lesson 4 and Lesson 5 blocks check.

**What to add to `tools/qaida-lesson6-check.js`** (the Lesson 5 suite, pointed at `lesson-6.html`), plus:

- the board draws **four** columns, and the two middle ones carry U+064E and U+0650 in that order;
- `data-sits="above"` reaches `<html>`, and no `[data-sits='below']` rule matches;
- with `data-twins="alternate"`, **every one of the part's own items has exactly one same-letter twin in the pool**,
  and across part 1 and part 2 each letter meets both marks (the flip);
- with `data-twins="both"`, it has two; with `off`, none, and the lesson still runs;
- a full run through part 1 and then the lesson still finishes at four fifths of the **29** — not of the pool;
- the home card's number equals the page's bar;
- the name set switches with no reload: the title, the rail, the board's third **and fourth** columns, and every
  item name.

The check scripts cannot see what a page looks like. Everything in §4 is the user's.

## 4. The blocking browser checklist — the user's, not yours

Same rule as lessons 4 and 5: **do not drive a browser, do not sign this off.** Preview with `node serve.js`, then
`http://localhost:8777/site/qaida/lesson-6.html`, and hand the user this list.

1. **Does the curl render above the letter, attached, and not clipped?** In **both faces** (Madani, Indo-Pak) and
   **both themes**. The letters that decide it: **ث ش** (three dots above), **ت ق** (two), **ل ا ك ط** (tall
   strokes), **ج ح خ ع غ** (already hanging below, so the tile is tight), and **و** (a wow with a small wow on it).
2. **Can you tell بَ from بُ at a glance, at the tile's size?** If not, the tile is too small for this lesson and
   that is worth knowing before lessons 7 to 14 are built on it. This is the single most important item.
3. **On the board, do the four columns read as one family** — the letter, then three marks — or as a wall? The
   panel has `trio`, `pairs` and `marked only` if it is too much, and an arrows row if that is the noise.
4. **In the drill, is a زبر/پیش pair actually hard?** If every question is obvious, the twins are not pairing
   (`03` §5) — which the check scripts cannot see, because they do not know what "looks similar" means.
5. **Does the lesson feel too long or too repetitive?** Two marks ride along now. The row to turn down first is
   *"the other marks riding along"* → **Off**, then the board (`03` §4).
6. **"Write it"** opens the tracer on the letter **with its mark**, and the guide letter is still centred on its
   ink, curl included.
7. **The name set**: switch zabar ↔ fatha with the drill mid-question and confirm the title, the rail, all four
   board columns and every item name change with no reload and no lost progress.
8. **Lessons 4 and 5 still work.** Open each after, run one question, and check the home card's number against the
   page's bar. `marks.js` and `mark-lesson.js` were edited under them.

## 5. When it is done

Update `QAIDA-BUILD.md` — the status table and a "Step 6 built — Lesson 6" entry listing **where the build differs
from this folder**, the way the Lesson 3, 4 and 5 entries do. Leave
`design-system/quran-landing/pages/qaida.md` until the user has seen the page.

**Step 6 is done when lessons 4, 5 and 6 have all been previewed and signed off** — not when Lesson 6 is written.
Three lessons are waiting on one browser session.

**Step 7 is lessons 7–9: tanween, zabar + alif, standing harakaat.** Tanween is this mark doubled and reuses
everything built here, including `against` (its contrast is the single marks, all three of them). Lesson 9 is the
first lesson in the Qaida with **no letter on the page at all**, and that will need its own plan rather than a
copy.
