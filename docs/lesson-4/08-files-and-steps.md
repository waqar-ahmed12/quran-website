# 08 — The files, in build order

Nothing here needs a change to `practice.js`. If a step below tempts you to edit it, the step is wrong.

## 1. The files

| File | New? | What |
|---|---|---|
| `site/qaida/marks.js` | **new** | the data layer for **every** mark lesson (`02-the-mark.md`). No DOM, no storage |
| `site/qaida/mark-lesson.js` | **new** | the page, driven by `<html data-mark>`. **Serves lessons 4, 5 and 6** |
| `site/qaida/lesson-4.html` | **new** | copied from `lesson-3.html`; the board of `04`, the rail cut to two |
| `site/qaida/shell.js` | edit | `LESSONS[3]` gains `href: 'lesson-4.html'`, `built: true`, `progress: 'drill'` |
| `site/qaida/qaida.css` | edit | the pair layout, the halo, room above the glyph (`04` §6) |
| `site/qaida/qaida-options.js` | edit | the five rows of `07`, and `Words (lesson 4)` |
| `site/qaida/audio.js` | edit | `wanted()` gains the mark groups, so the recordings page lists them (§3) |
| `site/qaida/audio/manifest.json` | edit | a `"fatha": {}` group beside `"letters"` |
| `site/qaida/recordings.html` | edit | a section for the syllables, with the warning of §3 |
| `site/qaida/lesson-3.js` | edit | **one line**: `next` stops saying "not built yet" and links to `lesson-4.html` |
| `tools/qaida-check.js` | edit | Lesson 4's data-layer checks (§4) |
| `tools/qaida-marks-check.js` | **new** | the page and the options panel in the hand-made DOM, as `qaida-lesson3-check.js` does |

**There is no `lesson-4.js`.** If one appears, the three-lesson plan has already been lost — see `README.md`.

## 2. The order

1. **`shell.js`** — one line, three fields. The home immediately shows Lesson 4 as a real link, which is the
   cheapest possible proof that the wiring is right.
2. **`marks.js`, the data only** — the marks table, `allItems`, `reviewItems`, `poolFor`, `GROUPS`, `stats`.
   `node --check`, then the new checks in `tools/qaida-check.js`. **Do this before any HTML**: the counts, the ids
   and the review sample are where the expensive mistakes are, and none of them needs a browser.
3. **`lesson-4.html`** — copy Lesson 3's page, cut the rail to two, replace the table with static placeholder
   markup for the three board pieces. **Look at it in the browser before any JS runs on it.** This is when the
   combining marks are confirmed (§5), and a static page is far easier to debug than a generated one.
4. **`mark-lesson.js`, the board half** — the mark alone, the pairs, the joined note, tap to peek. No drill yet.
5. **The rail** — two states, fills, the group change, the advice line. Lesson 3's code, shortened.
6. **The drill** — Lesson 3's question/verdict/progress half nearly verbatim, pointed at the new pool and formats,
   with the `shell.setDrillTotal` re-assert of `03` §2 and the bare/marked verdict wording of `05`.
7. **The review items** — last of the drill work, because they are the part with a real decision in them
   (`03` §3), and the drill must already work without them.
8. **`audio.js`, `manifest.json`, `recordings.html`** — the `fatha` group and its rows.
9. **`qaida-options.js`** and the wording tags.
10. **`lesson-3.js`'s Next**, last, so the path in only opens once there is something behind it.

**Lessons 5 and 6 are then two HTML files and their wording.** If they are not, stop and fix `mark-lesson.js`
before building them — that is the whole reason step 6 is one step and not three.

## 3. The recordings this lesson wants

New to the Qaida, and easy to get wrong: the `fatha` group is **the sound, not the name**.

| Group | Key | The teacher says | File |
|---|---|---|---|
| `letters` | `ب` | "Baa" — the letter's name | `letters/ba.mp3` |
| `fatha` | `ب` | **"ba"** — the letter with the mark on it | `fatha/ba.mp3` |

`recordings.html` must say that on the section itself, or the two sets will be recorded the same way and the
distinction the lesson teaches will be lost in the audio. 29 clips per mark; 87 for lessons 4, 5 and 6 together.

`audio.js`'s `wanted()` currently hard-codes `kind: 'letters'`. Generalise it to walk a list of groups
(`letters`, then each mark in `qaidaMarks.MARKS` whose lesson is built) and keep its existing shape, so
`recordings.js` and the manifest-builder need no change beyond the extra rows.

## 4. `tools/qaida-check.js` — the data layer

Runs in `node`, no DOM. Add a Lesson 4 block:

- **Counts.** `allItems()` is **29** in both scripts. `reviewItems({ count: 8 })` is 8, and 0 at `count: 0`.
- **Ids.** Every id unique; every id is 2 characters; every id's letter part equals `shell.keyOf` of it, so Madani
  and Indo-Pak produce the **same id set**; no marked id collides with a bare review id.
- **The glyph.** Every `glyph` is exactly `base + String.fromCharCode(0x064E)`, and the file contains **no literal
  combining mark** — grep `marks.js` for U+064E, U+0650, U+064F outside a `fromCharCode` call and fail if found.
- **The group trick.** `poolFor(items, 1)` has 6 `required: true` and 23 `false`; `poolFor(items, 2)` has 29 and 0;
  `drill.progress().total` is 6 then 29.
- **The total re-assert.** After `setItems(poolFor(items, 1))` **and** the page's `setDrillTotal`,
  `shell.drillOf(4).total === 29`.
- **Mastery survives a group change**, and survives a change of script.
- **Review items never count.** With 8 review items in the pool, `progress().total` is still the group's size, and
  mastering a review item does not move `shell.masteredCount(4, target)` past 29.
- **The review sample follows Lesson 2.** Seed `shell`'s lesson-2 record with three wrong letters and check all
  three are in an 8-item sample.
- **The boundary.** `practice.js` still contains no `qaidaAudio`, no `localStorage`, no `document` — the existing
  check, which must keep passing.

## 5. The browser checklist — the user drives this

Do not mark step 6 done in `QAIDA-BUILD.md` until the user has signed off, and note that step 6 is not done until
lessons 5 and 6 exist too.

**The blocking one, first:**

- [ ] **Every marked letter renders with the mark attached** — not a dotted circle beside it, not a box, not a
      mark sitting on the wrong letter. Both faces (Amiri Quran, Noto Naskh), light and dark. Check **ا**, **ء**,
      **ط ظ**, **ک / ك**, **ہ / ه**, and one dotted letter (**ث** or **ق**) first.
- [ ] The mark on its own (U+25CC + mark) shows a dotted circle with the stroke on it, in both faces.
- [ ] Nothing is clipped at the top of a tile, and nothing collides with a tail at the bottom (ج ح خ ع غ م ي).

Then:

- [ ] The title, the rail, the board and every choice change word for word when the name set is switched — with no
      reload, and with the letters still called Baa, not Be.
- [ ] The rail: both parts open, the advice shows once and is not nagged.
- [ ] A review question appears roughly one in eight, its verdict line says "with no mark", and its name is the
      plain letter name.
- [ ] With "Wrong answers offered" on "the same letter, with and without the mark", every question really does
      offer the pair — and the row is unavailable at review 0.
- [ ] The two progress numbers never contradict each other; the bar counts 29, not 6.
- [ ] "You seem to know these" fires once per group and the star turns once, not forever.
- [ ] Switching script mid-lesson keeps mastery and redraws the board.
- [ ] "Write it" opens the tracer with **the mark in the guide**, centred on the ink (`06` §4).
- [ ] Keyboard: a full round with no mouse; focus lands on the board heading after a group change.
- [ ] Reduced motion: nothing travels, everything still changes.
- [ ] The home shows Lesson 4 as a real link, "Next up" once Lesson 3 is finished, and its card's count matches the
      lesson's own number.
- [ ] Lesson 3's Next reaches Lesson 4.

## 6. When it is built

- Update `design-system/quran-landing/pages/qaida.md` — the rail, the board, the `{mark}` rule, the two progress
  numbers, and the fact that one page file serves three lessons.
- Update `QAIDA-BUILD.md`: step 6's status, the step log, and the decisions table with whatever `09` settles.
- Fold `09`'s answers back into `QAIDA-CONTENT.md`.
- **Then build lessons 5 and 6**, which is two HTML files, their wording, `kasra` and `damma` in
  `MARKS`, and their review pools mixing in the marks already taught (`03` §3 — the user's 2026-09-19 rule).
