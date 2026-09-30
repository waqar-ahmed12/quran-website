# 06 — Files, build order, and the checklist

## 1. Every file this lesson touches

There is **no `lesson-8.js`**: `mark-lesson.js` is the page for every lesson of marks, and `spell.js` and
`exercise.js` serve every lesson's words.

| File | New? | What changes |
|---|---|---|
| `site/qaida/marks.js` | edit | the `'fatha-alif'` row; `suffixOf`, and `glyphOf`/`aloneOf` through it; every id through it; `skip` in `allItems` and `boardRows`; `NEVER_JOIN` (`03` §1–4) |
| `site/qaida/mark-lesson.js` | edit | `markTile`'s id, `data-tail` and tint; `markBox`/`positionHalos` for a tail; the joined block, the lam-alif and skip lines (`03` §6–8) |
| `site/qaida/shell.js` | edit | Lesson 8's row gains `href`, `built`, `progress`, `cp`, `tail`; `masteredCount` by suffix (`03` §3) |
| `site/qaida/audio.js` | edit | `groups()`/`wanted()` honour `skip` and show the composed glyph (`03` §8) |
| `site/qaida/qaida.css` | edit | `.mark-tile[data-tail]` wider, same height; `[data-tailfit='shrink']` (`03` §6) |
| `site/qaida/lesson-8.html` | **new** | `lesson-6.html` with `04` applied |
| `site/qaida/lesson-7.html` | edit | Next becomes a real link to `lesson-8.html` (`04` §7) |
| `site/qaida/spell.js` | edit | a `'fatha-alif'` entry in `WORDS` — **after** the pending walkthrough fix (`05`) |
| `site/qaida/exercise.js` | edit | a `'fatha-alif'` entry in `WORDS`; Next with `data-soon` (`04` §8) |
| `site/qaida/exercise-8.html` | **new** | `exercise-6.html` with `04` §8 applied |
| `site/qaida/qaida-options.js` | edit | the *Two-letter tiles* row (`04` §9) |
| `site/qaida/audio/manifest.json` | edit | `"fatha-alif": {}` |
| `tools/qaida-check.js` | edit | a Lesson 8 block (§3) |
| `tools/qaida-lesson8-check.js` | **new** | the harness of `qaida-lesson6-check.js`, pointed at `lesson-8.html` |
| `tools/qaida-words-check.js` | **new, recommended** | every word on every page uses only marks taught by then (§3) |
| `QAIDA-BUILD.md`, `QAIDA-CONTENT.md` | edit | the status and a "Step 8 built — Lesson 8" log entry |
| `design-system/quran-landing/pages/qaida.md` | **after the user has seen it** | not before |

**Nothing else.** `practice.js`, `trace.js`, `voice.js`, `voice-store.js`, `home.js` and `index.html` do not
change: the home card comes from `shell.js`, and its total from the drill record the page writes.

## 2. Build order

### Step 0 — the pending fixes, first

Four notes from the evening of 2026-09-27. None is a Lesson 8 question, but they touch the files Lesson 8 is
built on, and doing them after would mean doing parts of this lesson twice.

1. **`fixes/lesson 4 5/`** — the walkthrough shows the whole word, highlights the part being read, and animates.
   `spell.js` and the `.spell` block of `lesson-4/5/6.html`. **Lesson 8's words go through it** (`05` §2).
2. **`fixes/lesson 6/`, the image** — a zair tile is taller than its neighbours in Lesson 6's quartet. Cause:
   Lesson 7 moved `[data-sits='below']` from `:root` to the tile (`qaida.css:3262`), so on Lesson 6 — where the
   page used to say `above` — the zair tile in a mixed row now gets the taller `aspect-ratio: 5 / 7.4` alone.
   Lesson 7's part 4 has the same row. The fix is **one height per row**; Lesson 8's wide tile is written to the
   same rule (`03` §6), so settle the rule first.
3. **`fixes/lesson 6/bugs.txt`** — exercise 6 has no Next. Lesson 7 exists now: link it. The same `data-soon`
   lines `exercise-8.html` needs (`04` §8) belong in `exercise.js` from this fix.
4. **`fixes/lesson 7/fixes.txt`** — *"i don't want fathatain, like no tathnia, and no 'do zabar'; two zabar or two
   fatha is good."* Lesson 7's mark names in `marks.js` (and the lines that repeat them). Lesson 8's words use
   two paish (كِتَابٌ), so its captions read whatever this fix decides.

Each gets its own check run and its own line in `QAIDA-BUILD.md`, as every round of fixes has.

### Steps 1–10 — Lesson 8

Strictly this order. Each is provable by a script before the next starts; five lessons are awaiting sign-off.

1. **The no-tail assertions, before any code.** In `tools/qaida-check.js`: for every mark of lessons 4–7,
   `suffixOf(mark) === String.fromCharCode(mark.cp)`, every item id is two characters, and `masteredCount` for
   lessons 4–7 returns what it returns today on a record holding own items and twins. They fail until `suffixOf`
   exists; then they are the fence.
2. **`marks.js` — `suffixOf`**, and `glyphOf`, `aloneOf` and every id through it (`03` §2). No new row yet.
   **Run all the page checks**: lessons 4–7 must not notice.
3. **`marks.js` — the row**, `skip` in `allItems` and `boardRows`, `NEVER_JOIN`. Run `qaida-check.js`.
4. **`shell.js`** — the row and `masteredCount`. Every page shares this file: all the checks again.
5. **`mark-lesson.js`** — in this order, lessons 4–7's checks after each: `markTile` (id, `data-tail`, tint), then
   the joined block and the two new lines, then `markBox`/`positionHalos`.
6. **`qaida.css`** — the wide tile and `shrink`.
7. **`lesson-8.html`** — copy `lesson-6.html`, apply `04` line by line, search it for `29`. Then `lesson-7.html`'s
   Next.
8. **`audio.js`** and **`manifest.json`**, then open `recordings.html` and confirm **27** "fatha and alif" rows,
   each showing بَا-shaped glyphs, none for ا or ء.
9. **Words** — `spell.js` and `exercise.js` entries, `exercise-8.html`.
10. **`qaida-options.js`** — the one row. Then the checks, then hand it to the user.

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
node tools/qaida-lesson3-check.js
node tools/qaida-page-check.js
node tools/qaida-voice-check.js
```

All of them, every time. (`qaida-lesson3-check.js` has flaked on "the table asks about every group"; rerun it
before believing it.)

**What to add to `tools/qaida-check.js`:**

- **The no-tail case is unchanged** (step 1 above) — written first.
- The row: `cp` U+064E, `tail` `[0x0627]`, `against: ['fatha']`, `lesson: 8`, `sits: 'above'`, `skip` ا and ء.
- **27 items, none for ا or ء**; ids **three characters**, ending U+064E U+0627; `sizes()` is `[6, 27]`; part 1 is
  ب د ر س م ن and **ل is in part 2 only**.
- **ب has distinct ids across every lesson**: bare, and with each of U+064E, U+0650, U+064F, U+064B, U+064C,
  U+064D, and U+064E U+0627 — eight. A collision is credit for something never seen.
- **Every Lesson 8 item's twin is the same letter with zabar and no alif** (a two-character id ending U+064E), and
  **every question the engine builds for a Lesson 8 item has that twin among its answers** — run a few hundred, as
  Lesson 7's check did for its own contrast.
- **`masteredCount(8)`** counts own items only, on a record that also holds twins; **`masteredCount(4)`** is
  unchanged by Lesson 8's row. They share a code point; this is the check that proves the length rule works.
- `glyphOf` on each script: کَا ہَا یَا in Indo-Pak, their ids folding to ك ه ي.
- Mastery survives a change of script and of part.
- `audio.js`'s `wanted()` has a `fatha-alif` group of 27 rows.
- No literal U+064E–U+0650 or U+064B–U+064D in any source file (extend the existing check to `spell.js` and
  `exercise.js`, which now carry the most Arabic in the site).

**`tools/qaida-lesson8-check.js`** (Lesson 6's suite, pointed at `lesson-8.html`), plus:

- the board draws a **trio** per row — bare, بَ, بَا — with arrows between all three, the tailed tile carrying
  `data-tail` and the others not;
- the joined block holds **two** glyphs in part 1 and **three** in part 2, the third being لَا, and the lam-alif and
  skip lines show in part 2 only;
- a full run through part 2 finishes the lesson at seven tenths of **27**, part 1 never gates it, and the home
  card's number equals the page's bar;
- the name set switches the title, the rail, the board captions and every item name with no reload;
- the Spell block steps قَالَ in three steps, the first showing قَا; Previous goes to Lesson 7.

**`tools/qaida-words-check.js`** (recommended — the rule "built only from marks the student has met" is written in
`spell.js`'s comments and checked nowhere): every word in `spell.js` and `exercise.js`, for every lesson, uses only
keys among the 29 and only marks whose `lesson` is at most that page's; the walkthrough has three words and the
exercise twelve. It needs each file to expose its `WORDS` (one line each, `window.qaidaSpellWords` /
`window.qaidaExerciseWords`), since both are private today.

The check scripts cannot see the page. Everything in §4 is the user's.

## 4. The browser checklist — the user's

Preview with `node serve.js`, then `http://localhost:8777/site/qaida/lesson-8.html`, and hand the user this list.

1. **Do two letters fit a tile?** The widest: **سَا شَا صَا ضَا**, and the ones with a gap — **دَا ذَا رَا زَا وَا**.
   Nothing clipped at either side, and **every tile in a row the same height**. Try *Two-letter tiles → Same
   width, smaller letters* and say which reads better.
2. **لَا** — laam and alif as **one shape**, not two, in both faces and both themes. Where does the zabar sit on it,
   and is it clearly on the laam?
3. **The alif joins where it should**: after ب س ع… it is attached; after د ذ ر ز و it stands apart.
4. **The halo** rings the alif (and the whole of لا), follows a change of lettering, and is not on the zabar.
   If it looks wrong, try *Point at the mark → Tint it*, and check the tinted alif stays joined.
5. **Indo-Pak**: **ہَا** (the start shape of ہ, joined to an alif) in Noto Naskh, then in Scheherazade New —
   the font that drew ہ broken between letters (`02` §5). Also کَا and یَا.
6. **Is the drill too easy?** Expected, and `07` §1 is about it. Say whether it feels like a waste of time or a
   welcome breather after Lesson 7.
7. **The walkthrough**: قَالَ in three steps, the long syllable highlighted as one piece; كِتَابٌ in five; the
   buttons do not move. **The exercise page**: twelve words, 4 × 3, laam-alif in سَلَامٌ drawn as one shape.
8. **"Write it"** on سَا — the guide fits the board with both letters.
9. **Say it** on بَا opens with *Baa with zabar and alif*, and a clip kept here does not appear on Lesson 4's بَ.
10. **Lessons 4–7 still work.** Open each, answer one question, and compare the home card's number with the
    page's bar — **Lesson 4 especially**, which shares its code point with this lesson.

## 5. When it is done

Update `QAIDA-BUILD.md` — the step 8 row, "Where we are", and a **"Step 8 built — Lesson 8"** entry listing where
the build differs from this folder — and `QAIDA-CONTENT.md` item 8. Leave
`design-system/quran-landing/pages/qaida.md` until the user has seen the page.

**Next is Lesson 9, the standing harakaat** — the last of step 8, and a different animal: three marks in one lesson
(Lesson 7's `SETS` and `partsOf` were built for it), **and the same long aa as this lesson, written without the
alif**. Its natural comparison for the standing fatha is **this lesson's item**: بٰ beside بَا, the same sound
spelled two ways — which is the whole point of `05` §4. (On the board, not necessarily as a twin: two spellings of
one sound are not a wrong answer by ear, and Lesson 9's plan has to decide what its drill asks.) It is also the
first lesson whose marks stand in for a letter, and it needs its own plan, not a copy of this one.
