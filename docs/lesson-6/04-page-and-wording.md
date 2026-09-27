# 04 — The page and its wording

`lesson-6.html` is **`lesson-5.html` copied**, with the changes below. Everything not listed stays as it is,
including the Say it block from step 7 (`docs/your-voice/04-where-it-appears.md` §6). Lesson 5 already carries it,
so the copy brings it along, and `mark-lesson.js`'s one `.say` handler already covers the page.

Every string below keeps its `data-words` / `data-words-attr` field. **A new attribute gets a new field**, in the same
list, with a label saying which `{tokens}` are filled in.

## 1. `<html>` attributes

| Attribute | Lesson 5 | Lesson 6 | Why |
|---|---|---|---|
| `data-mark` | `kasra` | **`damma`** | the whole lesson |
| `data-board` | `trio` | **`set`** | the ba bi bu row, §3 |
| `data-also` | *(none)* | **`part-2`** | new, `03` §2 |
| `data-titlemark` | `bi` | **`bu`** | the title glyph's layout choice |
| `data-finish` | `settle` | **`glow`** | the user on Lesson 2, 2026-09-23: *"after a certain point, just glow up the button below"*. Lessons 4 and 5 still say `settle`, since they were built before that note. Recommend changing them to match in the same build (one attribute each) |
| `data-distractors`, `data-twins`, `data-review`, everything else | | unchanged | `which-mark`, `on`, `0` |

`mark-lesson.js` sets `data-sits` itself from the mark (`above`), so the page does not.

## 2. Wording that changes

Written in the zabar set; the fatha set is the same line with `{mark}` / `{other}` / `{also}` filled differently. Plain,
short, never harsh, nothing that names a score.

| Where | Lesson 5 says | Lesson 6 says |
|---|---|---|
| `<title>` | Lesson 5: Zair · Free Qaida | **Lesson 6: Paish · Free Qaida** |
| `h1` | `data-title-zabar="Zair"` `data-title-fatha="Kasra"` | **`"Paish"`** / **`"Damma"`** |
| lede | The same mark, written under the letter. | **A small curl above the letter.** |
| `.title-mark` fallback | `&#x62F;&#x650;` (دِ) | **`&#x628;&#x64F;`** (بُ). The script composes it anyway; this is only what shows before it runs |
| `data-mark-sits` | {Mark} sits under the letter. | **{Mark} sits above the letter, like {other}.** |
| `data-mark-does` | {Mark} is the same stroke as {other}, written under the letter instead of over it. | **{Other} is a straight line. {Mark} is a small curl, like a tiny wow.** |
| `data-pair-other` | The same letter with {other} | unchanged |
| `data-pair-also` | *(new)* | **The same letter with {also}**. Its own field: "Board: the row, the {also} column ({also} is filled in)" |
| `data-glyph` (question) | Which letter is this, and what is under it? | **Which letter is this, and which mark is on it?** |
| `data-spot` (question) | Which one has {mark} under it? | **Which one has {mark}?** It no longer says where: both marks are above, and the shape is the question |
| `data-finished` | You can tell {other} from {mark}. This lesson is marked as done… | **You can read {other}, {also} and {mark}. This lesson is marked as done. You can keep practising as long as you like.** |
| Next button | `<button>` + `data-soon` | **still a `<button>`, still `data-soon`**, because Lesson 7 is not built. Labels: `data-next-zabar="Next: Tanween"`, `data-next-fatha="Next: Tanween"` |

Everything else (the verdicts, the advice, the rail, the item names) is already written with `{mark}` and `{name}`
and needs no edit. Check `data-right-bare` / `data-wrong-bare` still make sense: they only appear if the teacher turns
the plain-letters slider up.

**`{also}` is new.** `marks.wordsFor` fills it (`03` §4). `mark-lesson.js`'s `say()` already spreads `wordsFor`, so
every line gets it for free. On lessons 4 and 5 it is empty; don't use it in their wording.

## 3. The board: the ba bi bu row

The printed Qaida's paish page is rows of **بَ بِ بُ**, one letter per row, read aloud as "ba, bi, bu". That is the
board's `set` mode: **the letter, then with zabar, with zair, with paish**, left to right in reading order of the
Qaida (the letters themselves are Arabic and right-to-left inside each tile, as now).

| Mode | Cells per row | What it is for |
|---|---|---|
| `pairs` | letter, paish | Lesson 4's board |
| `trio` | letter, zabar, paish | just the contrast |
| **`set`** (default) | **letter, zabar, zair, paish** | the whole family, the way a printed Qaida shows it |
| `marked` | paish, small bare letter under it | the compact one |

In `set` mode **drop the arrows** between cells. In Lesson 5 an arrow meant "the stroke moved"; across four cells
it reads as a sequence of steps, and on a phone four tiles and three arrows won't fit in a row. A plain row, like
the printed page.

**CSS:** one block, `.pairs[data-board="set"] .pair` as a four-column grid, and at phone width
(`max-width: 480px`) the cells shrink rather than wrap: a row broken in two is no longer a row. That is the only
new layout in this lesson, and it goes on the user's checklist. The mode is **a row in the options panel**
(the existing "The board" row gains `set`), so the user picks by looking, not by being asked.

The featured row at the top of the board (the big one with captions) uses the same four cells, with
`data-pair-bare`, `data-pair-other`, `data-pair-also` and `data-pair-marked` as captions.

## 4. The options panel

`qaida-options.js`, in the existing "The mark" section. Nothing new on lessons 4 and 5 except where noted.

| Row | Choices | Sets |
|---|---|---|
| The board | pairs / trio / **set** / marked | `data-board`. `set` only offered when the mark has an `also` |
| **Zair riding along** *(new)* | Off / **In part 2** / Every letter | `data-also`. Only shown when the mark has an `also` |
| After the last letter | settle / **glow** / … | already exists; Lesson 6's default is `glow` |

The row label uses the student's word: "Zair riding along" or "Kasra riding along", from `wordsFor(mark).also`.
Every choice exports to `setting.txt` the way the rest do.

## 5. Elsewhere

| File | Change |
|---|---|
| `lesson-5.html` | Next becomes an **`<a class="button primary next" href="lesson-6.html">`**, the same way Lesson 4's Next became a link when Lesson 5 was built. `data-soon` goes |
| `shell.js` | Lesson 6's row: `href: 'lesson-6.html', built: true, progress: 'drill', cp: 0x064F` |
| `audio/manifest.json` | `"damma": {}` after `"kasra": {}` |
| `recordings.html` | **no edit**. Setting `built: true` adds the 29 damma rows by itself (`docs/lesson-5/05` §1). Check that it did |
