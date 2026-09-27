# 05 — Files, build order, and the checklist

## 1. Every file this lesson touches

There is **no `lesson-6.js`**. `mark-lesson.js` is the page for lessons 4, 5 and 6.

| File | New? | What changes |
|---|---|---|
| `site/qaida/marks.js` | edit | `damma.after: 'fatha'`; `also` on every mark; `alsoOf`; `wordsFor` gains `{also}`; `twinItems` gains `as` and `tagged`; `reviewKeys` reaches back over every earlier mark; `boardRows` gains `also` (`03` §4) |
| `site/qaida/mark-lesson.js` | edit | `alsoMode()`, `reviewPlan` and `poolOf` build the passengers, `boardMode` gains `set`, `pairOf` loops, the shape key, `setAlso` (`03` §5) |
| `site/qaida/lesson-6.html` | **new** | `lesson-5.html` with `04` applied |
| `site/qaida/lesson-5.html` | edit | Next becomes a link to `lesson-6.html` |
| `site/qaida/lesson-4.html`, `lesson-5.html` | edit, **if the user agrees** | `data-finish="glow"`, to match Lesson 2 (`04` §1) |
| `site/qaida/shell.js` | edit | Lesson 6's row |
| `site/qaida/qaida.css` | edit | the `set` board block. **Nothing for the mark's height until it has been seen** (`02` §2) |
| `site/qaida/qaida-options.js` | edit | `set` in the board row; the "riding along" row |
| `site/qaida/audio/manifest.json` | edit | `"damma": {}` |
| `tools/qaida-check.js` | edit | a Lesson 6 block |
| `tools/qaida-lesson6-check.js` | **new** | `qaida-lesson5-check.js`'s harness pointed at `lesson-6.html` |
| `QAIDA-BUILD.md` | edit | the status table, "Where we are", and a "Step 6 built — Lesson 6" entry |
| `design-system/quran-landing/pages/qaida.md` | **after the user has seen it** | not before |

`practice.js`, `audio.js`, `recordings.js`, `recordings.html`, `voice.js` and `voice-store.js` **do not change**.

## 2. Build order

1. **Run every check in §3** and confirm they're all green before anything changes. Otherwise a new failure can hide
   behind an old one.
2. **`marks.js`**, running `node tools/qaida-check.js` after each change. Lesson 5's block must stay green: kasra's
   row does not change, and `twinItems`'s new options default to what it does today.
3. **`shell.js`**, then all the check scripts, since `shell.js` is shared by every page.
4. **`mark-lesson.js`**. Lessons 4 and 5 must pass their page checks **unchanged** after every edit. `set` and the
   passengers are only reachable when a mark has an `also`, and only damma does.
5. **`lesson-6.html`**, by copying and then applying `04` line by line. Then `lesson-5.html`'s Next.
6. **`qaida.css`**, the one block. **`qaida-options.js`**, the two rows.
7. **`manifest.json`**, then open `recordings.html` and confirm the damma rows appeared.
8. **Measure the review share** (`03` §2) over a few hundred seeded questions in each part, and write the numbers
   into `README.md`'s "as built" list.
9. **The checks**, then hand it to the user.

## 3. The checks that run without a browser

```
node --check site/qaida/marks.js
node --check site/qaida/mark-lesson.js
node --check site/qaida/shell.js
node tools/qaida-check.js
node tools/qaida-page-check.js
node tools/qaida-lesson3-check.js
node tools/qaida-marks-check.js
node tools/qaida-lesson5-check.js
node tools/qaida-lesson6-check.js
node tools/qaida-voice-check.js
```

All of them, every time.

**What to add to `tools/qaida-check.js`:**

- `otherOf(damma)` is **fatha**, not kasra. This is the check that would have caught the bug `README.md` describes.
- `alsoOf(damma)` is `[kasra]`; `alsoOf` of fatha and kasra is empty.
- 29 damma items, every id two characters ending in U+064F; no literal combining mark in the source (extend the
  existing check to U+064F).
- part 1 is Lesson 4's six: `MARKS.damma.first` equals `MARKS.fatha.first`.
- the three kinds of review item have three different last characters, and none collides with a paish id.
- under `which-mark`, a paish item and its zabar twin share `letter:<key>`; the zair passenger has `family: []`.
- `twinItems` called with no new options returns exactly what it did for kasra before (Lesson 5 unchanged).
- `reviewKeys` for damma prefers a letter missed in Lesson 5 over one that wasn't.
- `wordsFor(damma)` gives `other: 'zabar'`, `also: 'zair'` in the zabar set, and `fatha` / `kasra` in the other.
- `sizes`, `stats` and `poolFor` count only the 29 when twins and passengers are both in the pool.

**What `tools/qaida-lesson6-check.js` checks:** the whole Lesson 5 page suite, pointed at `lesson-6.html`, plus

- every paish question in 500 seeded questions has its zabar twin among the answers (100%);
- part 1's pool holds no zair passenger; part 2's holds ten with `data-also="part-2"`, 29 with `all`, none with `off`;
- the board draws four cells per row in `set` mode, no arrows, in the order bare / U+064E / U+0650 / U+064F;
- a missed zair passenger lights its own tile;
- a full run through part 1 then part 2 finishes the lesson at seven tenths of the **29**, not of the pool;
- the home card's number equals the page's bar;
- switching the name set mid-question rewrites `{other}` and `{also}` everywhere with no reload.

## 4. The browser checklist: the user's, not yours

**Do not drive a browser, do not sign this off.** Preview with `node serve.js`, then
`http://localhost:8777/site/qaida/lesson-6.html`, and hand the user this list, in this order:

1. **Is paish attached, above the letter, and not cut off at the top?** In both scripts and both themes. The letters
   that decide it: **ا ل ط ظ ك / ک** (tallest), **ث ش** (three dots under the mark), **ت ن ق ف** (dots), then **ب د**
   (should be the cleanest).
2. **Can you tell paish from zabar at a glance, at tile size?** Look at a row of the board. If the curl reads as a
   blob, the tiles or the lettering are too small for this lesson, and the fix is the size row, not the wording.
3. **Does the ba bi bu row fit on a phone** in one line, four across, without wrapping?
4. **Is the drill actually asking paish against zabar?** Answer ten questions: the same letter with zabar should be
   among the answers every time.
5. **Does it feel too long, or like too much of the last two lessons?** The "riding along" row turns zair down. See
   `06-open-questions.md` §1 before changing anything else.
6. **The halo** sits on the curl, not above it in empty space.
7. **Write it** shows paish in the guide letter, centred on its ink, mark included.
8. **Say it** opens on the letter in front of you, and the microphone light goes off when it closes.
9. **The name set**: switch zabar ↔ fatha mid-question. The title, the rail, the board captions, the question and
   every item name change, with no reload and no lost progress.
10. **Lessons 4 and 5 still work.** Open each and answer one question.

## 5. When it is done

Update `QAIDA-BUILD.md`: the status table, "Where we are", and a "Step 6 built — Lesson 6" entry listing **where the
build differs from this folder**. **Step 6 is done** once the user has seen lessons 4, 5 and 6 and signed them off.
The next step is **step 8, lessons 7–9** (tanween, zabar and alif, standing marks). Lesson 7 is the first mark lesson
that is not one stroke on one letter, so it will need more than a thin page, and `also` (`03` §2) is where its review
starts.
