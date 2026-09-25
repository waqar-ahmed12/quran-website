# 04 — The page and its wording

`lesson-7.html` is `lesson-6.html` with the changes below and **nothing else**. Copy the file, then work down this
list. Anything not named here — the top bar, the board's structure, the drill, the tracer dialog, the chooser, the
live regions, every `aria-*` — is already right and must not drift, because four pages now share one stylesheet
and one script and a silent difference between them is the expensive kind.

## 1. `<html>` attributes

| Attribute | Lesson 6 | Lesson 7 | Why |
|---|---|---|---|
| `data-mark` | `damma` | **`tanween`** | names a *set* now (`03` §2) |
| `data-board` | `quad` | **`auto`** | a trio in a warm-up part, a quartet in the last one (§3). `trio`, `quad`, `pairs`, `marked` still force one |
| `data-twins` | `alternate` | `alternate` | unchanged, and it now means two different things by part (`03` §5) |
| `data-arrows` | `last` | `last` | unchanged |
| `data-titlemark` | `bu` | **`ban`** | the layout choice; the glyph is composed by the script |
| `data-group`, `data-band` | `1` | `1` | unchanged |
| everything else | | unchanged | `data-distractors="which-mark"`, `data-review="0"`, `data-point="halo"`, `data-ask="mark"`, `data-choices="4"`, the fonts, the theme script |

`<title>` → **`Lesson 7: Tanween · Free Qaida`**. The title mark's literal → `&#x628;&#x64B;` (ب + U+064B), still
written as a numeric reference and never pasted.

## 2. The head

```html
<p class="eyebrow" data-words="Lesson number">Lesson 7 of 14</p>
```

and the `.track` list moves the `now` class to the **seventh** `<li>`.

```html
<h1 data-words-attr="data-title-zabar|Lesson title (zabar);data-title-fatha|Lesson title (fatha)"
    data-title-zabar="Tanween" data-title-fatha="Tanween">Tanween</h1>
<p class="lede" data-words="Line under the title">The same three marks, written twice — and the sound ends in n.</p>
```

**Tanween is the same word in both name sets.** It is still two fields: the teacher may want "Tanween" in one and
"Do zabar, do zair, do paish" in the other, and finding that out costs nothing if the field is there.

## 3. The rail: four parts

`mark-lesson.js` builds the buttons from `marks.partsOf(own)` (`03` §3), so the markup only supplies the names:

```html
<nav class="bands" aria-label="The four parts of this lesson"
     data-group1="Meet do zabar" data-group2="Meet do zair" data-group3="Meet do paish" data-group4="All the letters"
     …>
```

Two things follow:

- **The part names contain a mark name**, which changes with the student's choice of names. So they are
  `{mark}` templates filled per part — `data-group1="Meet {mark}"` — and the fourth is plain. `buildRail` already
  calls `say()`; it passes the part's mark (`03` §6).
- `aria-label` and every `data-group*` gets its own field in `data-words-attr`, as Lesson 6's four do.

The rail's glyph per part is `marks.sampleOf(shell, part.mark, part)`: بً, دٍ, بٌ, and for the last part the letter
that hangs below the line (ع) with the first of the three.

## 4. The board

The three lines that name a place have to work for a mark **above** and a mark **below**, so they take a
`{where}` token filled from the part's mark:

```html
<section class="marks-board" aria-labelledby="board-title"
         data-mark-alone="This is {mark}."
         data-mark-sits="{Mark} sits {where}, in the same place as {other}."
         data-where-above="above the letter" data-where-below="under the letter"
         data-mark-does="{Mark} is {other} written twice. Two of them, and the sound ends in n."
         data-pair-bare="The letter on its own" data-pair-other="The same letter with {other}"
         data-pair-marked="The letter with {mark}"
         data-joined="{Mark} goes with the letter wherever it sits."
         data-joined-note="The same letter twice, not a word."
         …>
```

with `data-where-above` and `data-where-below` two more fields in `data-words-attr`. The guide line under the
heading is per part as well — "Two small strokes above the letter" / "Two small strokes under the letter" — so it
is a `{where}` template too.

**The rows.** `data-board="auto"` gives:

- **Parts 1–3, a trio:** ب → بَ → بً. The bare letter, the single mark, the doubled one. It says *this is the
  stroke you know, written twice*, which is the lesson in three tiles.
- **Part 4, a quartet:** ب → بً بٌ بٍ. The bare letter and the three doubled marks side by side, which is the
  only place in the Qaida where all three are together. `arrowBefore` with `last` draws one arrow, after the bare
  letter; the three doubled tiles read as a set rather than a sequence.

The quartet's three marked cells are `pairCell('marked', …)` with a stroke each, where Lesson 6's middle cells
were `'other'`. That is the one structural difference in `pairOf`, and it is why `markTile` must take the stroke
for `marked` too (`03` §8).

## 5. The drill

Only the verdict needs a thought. Lesson 6's:

```html
data-right="Yes — {name} with {mark}."
data-wrong="That one is {chosen}. This is {name} with {mark}."
```

is already right — `{mark}` is the item's own mark's word (`marks.rename` sets `markName` from `item.mark`), so a
twin answered wrongly says "That one is Baa with zabar. This is Baa with do zabar." **Read that sentence aloud
before building it.** It is correct, it is not harsh, and it is the one place a student learns that the difference
they just missed has a name. The `-bare` variants stay for the plain letters the slider can add.

`data-spot` ("Which one has {mark} on it?") stays; it is the `mark-or-not` format, which is off by default.

## 6. The end, and Next

```html
<p class="end-line"
   data-before="Work through the parts to finish the lesson."
   data-finished="You can read all three doubled marks. This lesson is marked as done. You can keep practising as long as you like."
   …>
```

("Both parts" → "the parts": there are four now, and the lesson is finished on the last one alone.)

```html
<button class="button primary next" type="button"
        data-next-zabar="Next: Zabar and alif" data-next-fatha="Next: Fatha and alif"
        data-soon="The next lesson isn’t built yet.">
```

(taken from `shell.js`'s Lesson 8 row, which is `{ fatha: 'Fatha and alif', zabar: 'Zabar and alif' }`), and
**`lesson-6.html`'s own Next button becomes a real link** to `lesson-7.html`, the way Lesson 5's became one — the
line in `lesson-6.html` that says "Lesson 7 isn't built yet" is deleted with it.

## 7. The options panel

`qaida-options.js`, the "The mark" section. Four changes, all small:

1. **The Part row is hardcoded to two** (`qaida-options.js:357`):
   ```js
   option('Part', { 'Meet the mark': '1', 'All the letters': '2' }, 'group', …);
   ```
   Build it from `lesson.parts` instead — the names the rail uses — so lessons 4–6 render the same two entries and
   Lesson 7 renders four.
2. **The twins row's label depends on the part.** In a warm-up it is *"the single mark riding along"*; in the last
   part it is *"the other doubled marks riding along"*. Its `title` should say what each value does, as Lesson 6's
   does.
3. **The board row gains `auto`**, first in the list and the default: *"A trio, then all three"*.
4. **A tryout worth having:** the halo is doing more work in this lesson than in any before it (`01` §5), so leave
   `Point at the mark` where it is and make sure `Tint it` still works with three marks — it composes a
   `<span class="tinted">` from `mark.cp` (`mark-lesson.js:397`) and must take the item's own mark.

No new *look* is asked for in words anywhere. Everything above is a row the user can look at.

## 8. What must not change

- Every element holding a marked letter stays `aria-hidden`, with the name on its container. Two combining marks
  are read out by a screen reader even less usefully than one (`docs/lesson-4/06` §1).
- No counts on the page (the user, 2026-09-20). The bar says how it is going in words.
- The Board button stays in the top bar, on this page as on every other.
- `data-words` / `data-words-attr` on **every** line this file adds. A line without a field is a line the teacher
  has to ask Claude to change.
