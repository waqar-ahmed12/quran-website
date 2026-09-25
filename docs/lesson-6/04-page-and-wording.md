# 04 — `lesson-6.html`: what differs

`mark-lesson.js` is the page, and for Lesson 6 it changes in three places only: `reviewPlan` / `poolOf` (`03` §4),
the board's middle cells become a loop (`03` §7), and `boardMode()` learns one value (§3 below). **`lesson-6.html`
is `lesson-5.html` with a different set of `data-` attributes and a different set of strings**, and nothing else.
Copy it, change what is in this file, change nothing else.

## 1. The `<html>` attributes

| Attribute | Lesson 5 | Lesson 6 | Why |
|---|---|---|---|
| `data-mark` | `"kasra"` | **`"damma"`** | the whole switch. Everything else follows from `MARKS.damma` |
| `data-distractors` | `"which-mark"` | **unchanged** | still the lesson's point; what changed is which twins exist (`03` §5) |
| `data-twins` | `"on"` | **`"alternate"`** | `03` §4. `"on"` keeps working and means `"both"` — see §6 |
| `data-board` | `"trio"` | **`"quad"`** | §3 below |
| `data-review` | `"0"` | **unchanged** | the bare slider, still off (the user, 2026-09-20) |
| `data-titlemark` | `"bi"` | **`"bu"`** | a layout slug for the top-bar glyph, not the glyph |
| `data-ask` `data-choices` `data-advance` `data-miss` `data-point` `data-arrive` `data-peek` `data-tiles` `data-size` `data-bg` `data-madani-font` `data-indopak-font` `data-titlemark-font` `data-progress` `data-bar` `data-track` `data-finish` | | **unchanged** | the look is Lesson 4's, and **no one has seen it yet**. Do not redesign a page that has not been signed off |

`data-group` / `data-band` stay `"1"` in the markup; the script overwrites them on first paint. `data-sits` is not
in the markup at all — the script writes it, and for this lesson it writes `above` (`02` §2).

## 2. `<title>` and the heading

```html
<title>Lesson 6: Paish · Free Qaida</title>
…
<h1 data-words-attr="data-title-zabar|Lesson title (zabar);data-title-fatha|Lesson title (fatha)"
    data-title-zabar="Paish" data-title-fatha="Damma">Paish</h1>
```

`paintHead()` rewrites `document.title` from the heading on every name change, so the literal in `<title>` is only
what a search engine and a cold load see. Match it to the default name set (`zabar`), as lessons 4 and 5 do.

## 3. The board — a quartet

Lesson 5's board is **bare | with zabar | with zair**. Lesson 6's has to hold the whole family:

```
  ب        بَ        بِ        بُ
the letter  with zabar  with zair  with paish
```

`boardMode()` today is:

```js
const boardMode = () => (root.dataset.board === 'marked' ? 'marked' : root.dataset.board === 'trio' && other ? 'trio' : 'pairs');
```

It gains `quad`, which needs **two** other marks and otherwise falls back to `trio` and then to `pairs`, so a
teacher who types `quad` into Lesson 5's panel gets Lesson 5's board rather than a broken one. `pairOf` then loops
over `row.others` instead of reading `row.other`, and the number of middle cells is whatever the list holds — which
makes `trio` and `quad` the same code path with a different length, and lessons 7, 9 and 14 get theirs free.

### The arrows

`pairOf` puts an `ARROW` before every non-bare cell. Three arrows in one row is noise. **In a quad, draw the arrow
only before the last cell** — the row already reads left to right, and the one arrow marks the mark the lesson is
about. It is a look decision, so it is also a row in the options panel (§6) and the user settles it by looking.

### The layout

`.pair.trio` exists in `qaida.css` (around line 2996) and sets the trio's columns and arrow. **Add `.pair.quad`
beside it, and touch nothing else** — four tiles across on a wide screen, **two by two on a narrow one** (the
existing `@media` block at 2954/3011 is where the trio does its own narrow-screen change; follow it exactly).

A quad row is four tiles per letter, so part 2's board is 29 × 4 = 116 tiles. That is a long page and it is the
same shape Lesson 3's table already has; the board is scrolled past, not read end to end. If it feels heavy when
the user looks at it, the panel's board row is the answer: `trio`, or `marked`.

### The strings

| Attribute | Lesson 5 | Lesson 6 |
|---|---|---|
| `data-mark-alone` | `"This is {mark}."` | unchanged |
| `data-mark-sits` | `"{Mark} sits under the letter."` | **`"{Mark} sits above the letter, in the same place as {other}."`** — the place is no longer the news; the shape is |
| `data-pair-bare` | `"The letter on its own"` | unchanged |
| `data-pair-other` | `"The same letter with {other}"` | **unchanged text, filled per column** — `{other}` is that column's mark, so one field captions both middle cells (`03` §7) |
| `data-pair-marked` | `"The letter with {mark}"` | unchanged |
| `data-mark-does` | `"{Mark} is the same stroke as {other}, written under the letter instead of over it."` | **`"{Mark} is a different shape from {others}, in the same place as {other}. It is a small curl, not a wow."`** (`02` §4) |
| `data-joined` | `"{Mark} goes with the letter wherever it sits."` | unchanged |
| `data-joined-note` | `"The same letter twice, not a word."` | unchanged |
| `.section-guide` (board) | `"The same small stroke, written under the letter. Tap any of them to hear it."` | **`"A small curl above the letter. Tap any of them to hear it."`** |

**Every one of these keeps its `data-words-attr` tag**, with the label updated where the tokens changed (the
existing labels name which tokens are filled in, e.g. *"Board: what the mark does ({Mark} and {other} are filled
in)"* → *"…({Mark}, {other} and {others} are filled in)"*). That is the standing rule and it is the whole reason
the strings live in the markup.

## 4. The question lines

`mark-lesson.js` reads four: `data-glyph`, `data-name`, `data-spot`, `data-sound`.

| Attribute | Lesson 5 | Lesson 6 |
|---|---|---|
| `data-glyph` | `"Which letter is this, and what is under it?"` | **`"Which letter is this, and what is on it?"`** — Lesson 4's line, back again |
| `data-name` | `"Which one is this?"` | unchanged |
| `data-spot` | `"Which one has {mark} under it?"` | **`"Which one has {mark} on it?"`** |
| `data-sound` | `"Which one says this?"` | unchanged |

Do not write *"which one carries the curl"* or any other description of the shape into the question. The student
is being asked to tell three marks apart by name; describing one of them in the question answers it.

## 5. The advice, and the end

| Attribute | Lesson 5 | Lesson 6 |
|---|---|---|
| `data-struggling` | `"{name} keeps slipping. Look at it again at the top of the page."` | unchanged |
| `data-ready-group` | `"You seem to know this part. The next one is ready when you are."` | unchanged |
| `data-ready-lesson` | `"You seem to know {mark} on every letter."` | unchanged |
| the end line, finished | Lesson 5's `"You can tell zabar from zair."` | **`"You can tell all three marks apart."`** — the honest claim, and the one the student actually earned. Token form: `"You can tell {mark} from {others}."` |
| next lesson | `data-next-zabar="Next: Paish"` / `data-next-fatha="Next: Damma"` | **`"Next: Tanween"` in both name sets** (the lesson is called Tanween either way, `shell.js`), and **`data-soon` will be what is shown** — Lesson 7 is not built |

`data-soon` is *"The next lesson isn't built yet."*, unchanged. Lesson 5's own `data-next-*` already points at this
lesson, so **`lesson-5.html` needs no edit** when Lesson 6 lands; it stops showing `data-soon` on its own, because
the button reads `shell.LESSONS` for whether the next one is built.

**Never harsh** still applies to all of it: a wrong answer says what the thing is and stops. With two marks riding
along, "what the thing is" now has three possible answers, which the verdict already handles — `rename()` looks up
`MARKS[item.mark]`, so a twin says *"that one is Baa with zair"* with no change at all.

## 6. The options panel

The panel is inline in each page, so `lesson-6.html` carries its own copy. Sections, in Lesson 5's order:

| Section | Row | Lesson 6 |
|---|---|---|
| **The mark** | which part is open | unchanged |
| | how many right in a row (`target`) | unchanged |
| | ready at (`readyAt`) | unchanged |
| | wrong answers | unchanged — `which-mark` is still the default and still the point |
| | plain letters riding along (`data-review`) | unchanged, still 0 |
| | **the other marks riding along** | **On/Off becomes three: "One at a time" (`alternate`, default), "Both at once" (`both`), "Off"**. The row prints what each does to the length, as the panel's other rows print their counts — this is the row most likely to be turned down, so it must be legible (`03` §4) |
| | what the board shows | **gains `quartet`, which is the default**: pairs / trio / **quartet** / marked only |
| | *(new)* **arrows on the board** | all / **just the last one** (default) / none. §3 |
| | where the mark is pointed out (`data-point`) | unchanged |
| **Words (lesson 6)** | every string above | the section is named per page, as `docs/lesson-2/` set out |

`qaida-options.js` builds these rows from `twinned` (whether the mark has an other at all). It gains a second
flag — how many others — and the three-way row appears only when there are two. Lessons 4 and 5 must come out of
that file unchanged: Lesson 4 with no twin row, Lesson 5 with the On/Off it has today.

**`data-twins="on"` must keep working.** It is in `lesson-5.html` and it may be sitting in a teacher's exported
`setting.txt`. Read it as `both`, which is what it means on a lesson with one other mark.

And **Export settings** stays at the top of the panel, unchanged, so the teacher's picks reach `setting.txt`.

## 7. The stylesheet

**One new rule, `.pair.quad`, beside `.pair.trio`, plus its narrow-screen twin.** Nothing else.

In particular: **no `[data-sits='above']` block** (`02` §2), and **do not touch `.mark-tile`** — it is shared with
lessons 4 and 5, both of which are awaiting sign-off, and an edit there puts them back in the queue. If paish's
curl is clipped at the top, write it down for the user and let them decide; it is Lesson 4's rule, not this
lesson's.
