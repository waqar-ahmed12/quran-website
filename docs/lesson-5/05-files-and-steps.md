# 05 — Files, build order, and the checklist

## 1. Every file this lesson touches

There is **no `lesson-5.js`**, for the reason `docs/lesson-4/README.md` gives: `mark-lesson.js` is the page for
lessons 4, 5 and 6, and a second copy would be a second place to fix every bug.

| File | New? | What changes |
|---|---|---|
| `site/qaida/marks.js` | edit | `first`, `after`, `sample` per mark; `familyFor` gains `which-mark`; `reviewItems` builds twins; `reviewKeys` prefers Lesson 4's misses too; `boardRows` gains `other`; `sampleOf` stops hardcoding ب; `mark` on every item |
| `site/qaida/mark-lesson.js` | edit | `root.dataset.sits`; `titleMark` from `mark.sample`; `reviewPlan()`; board audio from `item.audio.kind`; `data-missed` by id; pass `items` ids to `masteredCount` |
| `site/qaida/lesson-5.html` | **new** | `lesson-4.html` with `04-page-and-wording.md` applied |
| `site/qaida/shell.js` | edit | Lesson 5's row gains `href: 'lesson-5.html'`, `built: true`, `progress: 'drill'`; `masteredCount` gains an optional id list (`03` §6) |
| `site/qaida/qaida.css` | edit | one `[data-sits="below"]` block. **Nothing else** |
| `site/qaida/audio/manifest.json` | edit | add `"kasra": {}`, to match `"fatha": {}` |
| `tools/qaida-check.js` | edit | a Lesson 5 block beside the Lesson 4 one |
| `tools/qaida-marks-check.js` | edit | run the same page checks against `lesson-5.html`, plus the twin-review and `which-mark` checks |
| `QAIDA-BUILD.md` | edit | the status table and a "Step 6 built — Lesson 5" log entry |
| `design-system/quran-landing/pages/qaida.md` | **after the user has seen it** | not before |

**Nothing else.** `practice.js` does not change — if it looks as though it must, the work belongs in the page
(`docs/lesson-2/02-practice-engine.md`, and `tools/qaida-check.js` will say so).

`audio.js`, `recordings.js` and `recordings.html` need **no edit at all**: `audio.js`'s `groups()` walks `MARKS`
and includes any mark whose lesson is `built`, and `recordings.html` already loads `marks.js`. Setting
`built: true` in `shell.js` adds all 29 kasra rows to the teacher's recording list on its own. Check that it did.

## 2. Build order

1. **`marks.js`** first, and run `node tools/qaida-check.js` after each change. It is the file the checks can see
   without a browser, so every mistake here is cheap.
2. **`shell.js`** — the lesson row and `masteredCount`. Run all three check scripts: `shell.js` is shared by every
   page in the Qaida.
3. **`mark-lesson.js`** — the six small changes. Lesson 4 must still pass `qaida-marks-check.js` unchanged after
   every one of them; if it does not, the change was not as small as it looked.
4. **`lesson-5.html`** — copy, then apply `04-page-and-wording.md` line by line.
5. **`qaida.css`** — the one block.
6. **`manifest.json`**, then open `recordings.html` and confirm the kasra rows appeared.
7. **The checks**, then hand it to the user.

## 3. The checks that run without a browser

```
node --check site/qaida/marks.js
node --check site/qaida/mark-lesson.js
node --check site/qaida/shell.js
node tools/qaida-check.js
node tools/qaida-marks-check.js
node tools/qaida-lesson3-check.js
```

All of them, every time — Lessons 2, 3 and 4 share `shell.js` and `practice.js` with this one, and the whole point
of the check scripts is that a shared-file edit cannot quietly break a lesson that is awaiting sign-off.

**What to add to `tools/qaida-check.js`:**

- kasra's part 1 is **six letters, and they are not fatha's six** — the check that would have caught `02` §3.
- the ids: 29 kasra items, every id two characters, every one ending in U+0650, **no literal combining mark in the
  source** (the check already exists for U+064E — extend it rather than copying it).
- a twin's id ends in U+064E and a bare review item's id has no mark in it, so the three can never collide.
- `which-mark` emits `letter:<key>` and the twin carries the same tag.
- mastery survives a change of script and a change of part, as Lesson 4's block checks.
- `sizes`, `stats` and `poolFor` still count only the lesson's own items when twins are in the pool.

**What to add to `tools/qaida-marks-check.js`:** the whole Lesson 4 suite, pointed at `lesson-5.html`, plus

- the board draws three columns and the middle one carries U+064E;
- `data-sits="below"` reaches `<html>`;
- a full run through part 1 and then the lesson, with twins in the pool, still finishes the lesson at four fifths
  of the **29** — not of the pool;
- the home card's number equals the page's bar (the `masteredCount` fix).

## 4. The blocking browser checklist — the user's, not yours

Same rule as Lesson 4: **do not drive a browser, do not sign this off.** Preview with `node serve.js`, then
`http://localhost:8777/site/qaida/lesson-5.html`, and hand the user this list.

1. **Does the mark render *attached*, under the letter?** In **both faces** (Madani, Indo-Pak) and **both themes**.
   The letters that decide it: **ب ي ج** (dots below), **ر و م ن ص ق** (tails through the mark's space), **ا** (a
   stroke with nothing to hang from), **ء**, **ط ظ** (which should be the cleanest).
2. **Is anything clipped at the bottom of a tile** — the mark, a tail, or the halo's ring?
3. **Does the halo sit on the mark** for below-the-line letters, or does it ring the letter's tail instead?
   (`data-point` → `tint` and `none` are the fallbacks if it does.)
4. **On the board, can you see the mark move** between the zabar column and the zair column at a glance? That is
   the one thing the board exists for.
5. **In the drill, is a زبر/زیر pair actually hard?** If every question is obvious, the distractors are not
   pairing (`03` §3) — which the check scripts cannot see, because they do not know what "looks similar" means.
6. **"Write it"** opens the tracer on the letter **with its mark** (Lesson 4's choice, `docs/lesson-4/06` §4) —
   and the guide letter should still be centred on its ink, mark included.
7. **The name set**: switch zabar ↔ fatha with the drill mid-question and confirm the title, the rail, the board's
   third column and every item name change with no reload and no lost progress.
8. **Lesson 4 still works.** Open it after, and run one question.

## 5. When it is done

Update `QAIDA-BUILD.md` — the status table and a "Step 6 built — Lesson 5" entry listing **where the build differs
from this folder**, the way the Lesson 3 and Lesson 4 entries do. Leave
`design-system/quran-landing/pages/qaida.md` until the user has seen the page.

**Step 6 is still not done after this.** Lesson 6 is the last of the three, and it is the cheap one: paish is
`MARKS.damma` with `after: 'kasra'`, its own six letters, and a page copied from this one.
