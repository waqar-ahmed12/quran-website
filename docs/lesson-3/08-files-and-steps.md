# 08 — The files, in build order

Nothing here needs a change to `practice.js`. If a step below tempts you to edit it, the step is wrong.

## 1. The files

| File | New? | What |
|---|---|---|
| `site/qaida/lesson-3.html` | **new** | copied from `lesson-2.html`, plus the band rail and the board (`04`) |
| `site/qaida/lesson-3.js` | **new** | the pool, the bands, the board, everything visible |
| `site/qaida/shell.js` | edit | `LESSONS[2]` gains `href: 'lesson-3.html'`, `built: true`, `progress: 'drill'` |
| `site/qaida/qaida.css` | edit | the band rail, the board table, the band-5 table's scroll container |
| `site/qaida/qaida-options.js` | edit | the four rows of `07`, and `Words (lesson 3)` |
| `site/qaida/lesson-2.js` | edit | **one line**: `next` stops saying "not built yet" and links to `lesson-3.html` |
| `site/qaida/audio/manifest.json` | none | Lesson 3 adds no recordings of its own; it uses the letters' |
| `tools/qaida-check.js` | edit | add Lesson 3's pool checks (§3) |

## 2. The order

1. **`shell.js`** — one line, three fields. The home immediately shows Lesson 3 as a real link, which is the
   cheapest possible proof that the wiring is right.
2. **`lesson-3.js`'s data layer only** — the class table, `FORM`, `allItems()`. No DOM yet.
   `node --check`, then `node tools/qaida-check.js`.
3. **`lesson-3.html`** — copy Lesson 2's page, strip the drill's contents to empty containers, add the rail and
   board markup with static placeholder rows. Look at it in the browser **before** any JS runs on it: this is when
   the ZWJ forms are confirmed (§4), and it is much easier to debug a static page than a generated one.
4. **The board** — render the current band's rows from the data layer. Still no drill.
5. **The rail** — states, fills, band changing, the advice line.
6. **The drill** — copy `lesson-2.js`'s question/verdict/progress half nearly verbatim, point it at the new pool
   and formats, add the `shell.setDrillTotal` re-assert of `03` §2.
7. **Band 5** — the table, the hidden drill, the moved footer.
8. **`qaida-options.js`** and the wording tags.
9. **`lesson-2.js`'s Next**, last, so the path in only opens once there is something behind it.

## 3. `tools/qaida-check.js`

Add a Lesson 3 block. It runs in `node`, with no DOM, so it can only check the data layer and the engine's
behaviour — which is exactly where the expensive mistakes are.

- **Counts.** `allItems()` is 68 with `drilled: 'new'` and 101 with `'all'`; band sizes are `[6, 2, 36, 24, 0]`.
- **Ids.** Every id unique; every id ≤ 24 characters (`shell.js`'s cap); every id's letter part equals
  `shell.keyOf` of it, so Madani and Indo-Pak produce the **same id set**.
- **Forms.** Every `glyph` contains its base letter; a `back-only` letter never produces an `initial` or `medial`
  item; ء produces none.
- **The band trick.** `poolFor(3)` has exactly 36 items with `required: true` and 35 with `required: false`
  (`drilled: 'new'`), and `drill.progress().total === 36`.
- **The total re-assert.** After `setItems(poolFor(3))` **and** the page's `setDrillTotal` call,
  `shell.drillOf(3).total === 68`.
- **Mastery survives a band change.** Master an item in band 1, move to band 3, and
  `shell.drillOf(3).streak[id]` is unchanged.
- **The boundary.** `practice.js` still contains no `qaidaAudio`, no `localStorage`, no `document` — the existing
  check, which must keep passing.

## 4. The browser checklist — the user drives this

Do not mark step 5 done in `QAIDA-BUILD.md` until the user has signed off.

**The blocking one, first:**

- [ ] **Every ZWJ form renders as a real joined shape** — not a dotted circle, not a box, not the isolated form.
      Both faces (Amiri Quran, Noto Naskh), light and dark. Check **ہ / ه**, **ع غ**, **ک / ك**, **م** first, then
      the six `back-only` letters, then everything else.
- [ ] The `back-only` rows show **two** columns, not four, and `بدب` shows a visible gap after the letter.
- [ ] ط ظ's four forms look nearly identical — if they don't, the band-2 premise is wrong and `09` §4 applies.

Then:

- [ ] The rail: every band opens, including band 5 from a standing start; the advice shows once and is not nagged.
- [ ] The two progress numbers never contradict each other — band line and lesson bar, both honest, both labelled.
- [ ] A band's "ready" fires once and its star turns **once**, not forever.
- [ ] Switching script mid-lesson keeps mastery and redraws the board in the other script.
- [ ] Switching the names set changes the Next button's label to the other name for Lesson 4.
- [ ] "Write it" opens the tracer on the **isolated** letter, with no stray joining stroke.
- [ ] Band 5's table scrolls on a phone with the name column stuck, and no tile is under 44px.
- [ ] Keyboard: a full round with no mouse; focus lands on the board heading after a band change; the board's tab
      order is isolated → initial → medial → final.
- [ ] Reduced motion: nothing travels, everything still changes.
- [ ] A screen reader on one board row and one question announces the position, not "zero width joiner".
- [ ] The home shows Lesson 3 as a real link, "Next up" once Lesson 2 is finished, and its card's count matches
      the lesson's own lesson-wide number.

## 5. When it is built

- Update `design-system/quran-landing/pages/qaida.md` — it is the override file for `site/qaida/`, and it must
  describe the rail, the board, the two progress numbers and the ZWJ rule.
- Update `QAIDA-BUILD.md`: step 5's status, the step log, and the decisions table with whatever `09` settles.
- Fold `09`'s answers back into `QAIDA-CONTENT.md`, which still lists item 3's shape grouping as "Claude's reading,
  to confirm at build step 3".
