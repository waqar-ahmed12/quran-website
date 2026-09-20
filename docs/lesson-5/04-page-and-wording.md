# 04 — `lesson-5.html`: what differs

`mark-lesson.js` is the page and it does not change for Lesson 5 (except the two lines in `02` §2 and `02` §5 and
the three in `03` §4). **`lesson-5.html` is `lesson-4.html` with a different set of `data-` attributes and a
different set of strings**, and nothing else. Copy it, change what is in this file, change nothing else.

## 1. The `<html>` attributes

| Attribute | Lesson 4 | Lesson 5 | Why |
|---|---|---|---|
| `data-mark` | `"fatha"` | **`"kasra"`** | the whole switch. Everything else follows from `MARKS.kasra` |
| `data-distractors` | `"look-alike"` | **`"which-mark"`** | `03` §3. The lesson's point |
| `data-review` | `"8"` | **`"4"`** | the **bare** slider only; the twins are not counted by it (`03` §2) |
| `data-titlemark` | `"ba"` | **`"bi"`** | a layout slug for the top-bar glyph, not the glyph |
| `data-board` | `"pairs"` | **`"trio"`** | §3 below |
| `data-ask` `data-choices` `data-advance` `data-miss` `data-point` `data-arrive` `data-peek` `data-tiles` `data-size` `data-bg` `data-madani-font` `data-titlemark-font` | | **unchanged** | the look is Lesson 4's, and the user has not seen it yet. Do not redesign a page that has not been signed off |

`data-group` / `data-band` stay `"1"` in the markup; the script overwrites them on first paint.

## 2. `<title>` and the heading

```html
<title>Lesson 5: Zair · Free Qaida</title>
…
<h1 data-words-attr="data-title-zabar|Lesson title (zabar);data-title-fatha|Lesson title (fatha)"
    data-title-zabar="Zair" data-title-fatha="Kasra">Zair</h1>
```

`paintHead()` rewrites `document.title` from the heading on every name change, so the literal in `<title>` is only
what a search engine and a cold load see. Match it to the default name set (`zabar`), as Lesson 4 does.

## 3. The board — a trio, not a pair

Lesson 4's board row is **bare | marked**. Lesson 5's has to show **where the mark moved**, which needs the zabar
in the row:

```
  ب        بَ        بِ
the letter   with zabar   with zair
```

`marks.boardRows(shell, mark, group)` returns `{ key, glyph, name, marked, joined }` — add **`other`**, the same
letter with the previous lesson's mark, built the same way (`glyphOf(glyph, MARKS[mark.after])`). A `after: 'fatha'`
field on the kasra row says which mark a row is shown against; `fatha` has none, so Lesson 4's board is unchanged
and `data-board="trio"` simply has nothing to draw there.

The options row (`04` §4) offers **pairs** (Lesson 4's), **trio** (default here) and **marked only**, because this
is a look question and the teacher decides it by looking.

### The strings

| Attribute | Lesson 4 | Lesson 5 |
|---|---|---|
| `data-mark-alone` | `"This is {mark}."` | unchanged |
| `data-mark-sits` | `"{Mark} sits above the letter."` | **`"{Mark} sits under the letter."`** |
| `data-pair-bare` | `"The letter on its own"` | unchanged |
| `data-pair-marked` | `"The letter with {mark}"` | unchanged |
| *(new)* `data-pair-other` | — | **`"The same letter with zabar"`** — and it must follow the name set, so: `data-pair-other-zabar="The same letter with zabar"` / `data-pair-other-fatha="The same letter with fatha"`, the same two-attribute pattern the title uses |
| `data-mark-does` | `"A letter on its own has a name. With {mark} it has a sound."` | **`"{Mark} is the same stroke as zabar, written under the letter instead of over it."`** — and the same two-attribute pattern, because it names the other mark |
| `data-joined` | `"{Mark} goes with the letter wherever it sits."` | unchanged |
| `data-joined-note` | `"The same letter twice, not a word."` | unchanged |
| `.section-guide` (board) | `"A small stroke above the letter. Tap any of them to hear it."` | **`"The same small stroke, written under the letter. Tap any of them to hear it."`** |

**Every one of these keeps its `data-words-attr` tag**, with the new ones added to the list, so the teacher gets a
text field for each. That is the standing rule and it is the whole reason the strings live in the markup.

## 4. The question lines

`mark-lesson.js` reads four: `data-glyph`, `data-name`, `data-spot`, `data-sound`. The format that tests skill D is
still the `spot` one — it is `name-to-mark` with different distractors and a different line, not a new format
(`docs/lesson-4/03` §5). Only the line changes:

| Attribute | Lesson 4 | Lesson 5 |
|---|---|---|
| `data-glyph` | `"Which letter is this, and what is on it?"` | **`"Which letter is this, and what is under it?"`** |
| `data-name` | `"Which one is this?"` | unchanged |
| `data-spot` | `"Which one carries {mark}?"` | **`"Which one has {mark} under it?"`** |
| `data-sound` | `"Which one says this?"` | unchanged |

## 5. The advice, and the end

| Attribute | Lesson 4 | Lesson 5 |
|---|---|---|
| `data-struggling` | as built ({name} filled in) | unchanged |
| `data-ready-group` | `"You seem to know this part. The next one is ready when you are."` | unchanged |
| `data-ready-lesson` | `"You seem to know {mark} on every letter."` | unchanged |
| the end line, before / finished | as built | unchanged, except that "finished" may name the pair: **`"You can tell zabar from zair."`** — the honest claim, and the one the student actually earned |
| next lesson | `data-next-zabar="Next: Zair"` `data-next-fatha="Next: Kasra"` | **`"Next: Paish"` / `"Next: Damma"`**, and `data-soon` for before Lesson 6 exists |

**Never harsh** still applies to all of it: a wrong answer says what the thing is and stops.

## 6. The options panel

The panel is inline in each page, so `lesson-5.html` carries its own copy. Sections, in Lesson 4's order:

| Section | Row | Lesson 5 |
|---|---|---|
| **The mark** | which part is open | unchanged |
| | how many right in a row (`target`) | unchanged |
| | ready at (`readyAt`) | unchanged |
| | **wrong answers** | **gains `which-mark`, which is the default.** The row prints what each one makes the question, as Lesson 4's does |
| | **bare letters riding along** (`data-review`) | **relabelled**: it is now the bare slider only. The row says on itself that at 0 the "is there a mark at all" check disappears, and that the **twins are not this slider** |
| | *(new)* **the other mark riding along** | on / off. Off turns Lesson 5 back into Lesson 4 with a different stroke, and the row should say so in those words |
| | what the board shows | **gains `trio`, which is the default** |
| | where the mark is pointed out (`data-point`) | unchanged — but see `05`'s checklist: the halo is measured, and below-the-line letters are where it will look wrong |
| **Words (lesson 5)** | every string above | the section is named per page, as `docs/lesson-2/` set out |

And **Export settings** stays at the top of the panel, unchanged, so the teacher's picks reach `setting.txt`.

## 7. The stylesheet

One new block in `qaida.css`, keyed off `[data-sits="below"]` (`02` §2): room under the tile, and the halo's
ring allowed to sit below the baseline without being clipped. **Do not touch Lesson 4's `.mark-tile` rules** —
they are awaiting sign-off, and a shared-rule edit puts them back in the queue.
