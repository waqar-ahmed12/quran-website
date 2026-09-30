# 04 — The page and its wording

`lesson-8.html` is **`lesson-6.html`** with the changes below and nothing else. Lesson 6, not Lesson 7: Lesson 8
teaches one mark, like Lesson 6, and Lesson 6's page has the two things Lesson 7's deliberately left out — the
**Spell a word** block and the **Practice reading** link. Anything not named here — the top bar, the Say it block,
the drill, the tracer dialog, the chooser, the live regions, every `aria-*` — is already right and must not drift.

Every string below is a **candidate**, with its own text field (`data-words` / `data-words-attr`) exactly as the
Lesson 6 line it replaces has. The teacher rewrites any of them without code.

## 1. `<html>` attributes

| Attribute | Lesson 6 | Lesson 8 | Why |
|---|---|---|---|
| `data-mark` | `damma` | **`fatha-alif`** | the new row (`03` §1) |
| `data-board` | `quad` | **`trio`** | ب → بَ → بَا: the letter, short, long. Lesson 8 has one other mark, so a quartet has nothing to put in its fourth column |
| `data-arrows` | `last` | **`all`** | an arrow between each tile: the row reads as a *progression* — bare, then short, then long — which is the lesson |
| `data-twins` | `alternate` | `alternate` | unchanged. With one other mark it means every letter against بَ (`03` §5) |
| `data-titlemark` | `bu` | **`baa`** | the layout choice; the glyph is composed by the script |
| `data-tailfit` | — | **`wide`** | new: the two-letter tiles (`03` §6, §8 below) |
| everything else | | unchanged | `data-distractors="which-mark"`, `data-review="0"`, `data-point="halo"`, `data-ask="mark"`, `data-choices="4"`, `data-madani-font="scheherazade"`, the theme script |

`<title>` → **`Lesson 8: Zabar and alif · Free Qaida`**. The title mark's literal → `&#x628;&#x64E;&#x627;`
(ب, U+064E, U+0627), as numeric references, never pasted. The comment at the top of the file is rewritten to say
what this lesson is (two letters, not one letter and a mark) and where its spec is.

## 2. The head

```html
<p class="eyebrow" data-words="Lesson number">Lesson 8 of 14</p>
```

The `.track` list moves the `now` class to the **eighth** `<li>`.

```html
<h1 data-words-attr="data-title-zabar|Lesson title (zabar);data-title-fatha|Lesson title (fatha)"
    data-title-zabar="Zabar and alif" data-title-fatha="Fatha and alif">Zabar and alif</h1>
<p class="lede" data-words="Line under the title">An alif after the mark makes the sound long.</p>
```

Both titles are taken from `shell.js`'s Lesson 8 row, which already says them. No "madd" anywhere on the page
(the user's plain-names rule, `README`).

## 3. The rail

Two parts, as on Lesson 6, built by `mark-lesson.js` from `marks.partsOf(own)`. Keep Lesson 6's names — **"Meet
the mark"** and **"All the letters"** — and their fields. Part 1's glyph is بَا; part 2's is عَا.

## 4. The board

```html
<section class="marks-board" aria-labelledby="board-title"
         data-mark-alone="This is {mark}."
         data-mark-sits="The {other} sits above the letter, and the alif comes right after it."
         data-mark-does="An alif after {other} makes the sound long: the short a becomes a long aa."
         data-pair-bare="The letter on its own" data-pair-other="With {other}: short"
         data-pair-marked="With {other} and alif: long"
         data-joined="The alif joins the letter before it — unless that letter never joins the next one."
         data-joined-note="The first joins on. The second stands on its own."
         data-lam-alif="After laam, the two join into one shape."
         data-skip-note="Alif and hamza are not here: a long aa after them is written with a different sign, which comes later."
         …>
```

- `{mark}` is "zabar and alif" / "fatha and alif"; `{other}` is "zabar" / "fatha" — the mark it is shown against,
  in the student's own word. So *"This is zabar and alif."*, *"The zabar sits above the letter…"*.
- **`data-joined`, `data-joined-note`** replace Lesson 6's "goes with the letter wherever it sits" / "The same
  letter twice, not a word", because the joined block now shows something different (`03` §8): **بَا دَا** in
  part 1, and **بَا دَا لَا** in part 2.
- **`data-lam-alif`** is new, shown **in part 2 only**, under the joined block, beside the لَا tile. It is the one
  sentence the Qaida says about lam-alif (`02` §4).
- **`data-skip-note`** is new, shown **in part 2 only**, under the table — the 27 explained (`02` §2). If the
  teacher chooses ءَا for Madani (`07` §2) the line changes to say only alif.
- The guide line under the board's heading becomes *"A zabar above the letter, and an alif after it."* — `{other}`
  again, so the fatha set reads "A fatha above…".
- All four new attributes get their entries in `data-words-attr`, described the way Lesson 6's are
  (*"Board: the lam-alif line, part 2 only"*).

**The rows.** `data-board="trio"`: **ب → بَ → بَا**, the tailed tile wider (`03` §6). The feature row at the top is
the same trio for the part's first letter (ب), with the three `data-pair-*` captions under it.

## 5. The drill

**No change.** Lesson 6's lines already read right with the new names:

```html
data-right="Yes — {name} with {mark}."                      → "Yes — Baa with zabar and alif."
data-wrong="That one is {chosen}. This is {name} with {mark}." → "That one is Baa with zabar. This is Baa with zabar and alif."
```

Read the second one aloud before building: it names the difference the student missed and says nothing else.
`data-spot` stays (the `mark-or-not` format, off by default).

## 6. Spell a word, and Practice reading

The `<section class="spell">` block is kept whole, with the same attributes. Its lines already fit:

- `data-letter-line="{name} with {mark}: {sound}."` → *"Qaaf with zabar and alif: qaa."* — the alif is part of
  its syllable, not a step of its own (`05` §2).
- `data-blend-line`, `data-whole-line`, `data-meaning-line` — unchanged.
- The **Practice reading** link → `exercise-8.html`.

**Whatever the pending walkthrough fix does to this block** (`fixes/lesson 4 5/`: the whole word shown, the part
being read highlighted, animated) is done to `lesson-4/5/6.html` first and copied here with it. `06` §2.

## 7. The end, Previous, Next

```html
<p class="end-line"
   data-before="Work through both parts to finish the lesson."
   data-finished="You can tell a short {other} from a long one. This lesson is marked as done. You can keep practising as long as you like."
   …>
```

**No "29" anywhere** — this lesson has 27 (`03` §4). Search the copied file for `29` before calling it done;
Lesson 6's wording may carry the number in a line not listed here.

```html
<a class="button quiet prev" href="lesson-7.html"
   data-prev-zabar="Previous: Tanween" data-prev-fatha="Previous: Tanween" …>
<button class="button primary next" type="button"
        data-next-zabar="Next: Standing harakaat" data-next-fatha="Next: Standing marks"
        data-soon="The next lesson isn’t built yet." …>
```

(Previous follows `shell.js`'s Lesson 7 title and Next its Lesson 9 title — if the Lesson 7 fix renames the
lesson, the Previous label follows it.) **`lesson-7.html`'s Next becomes a real link** to `lesson-8.html`, and
its "isn't built yet" line goes, the way Lesson 6's did for Lesson 7.

## 8. `exercise-8.html`

A copy of **`exercise-6.html`**: `data-mark="fatha-alif"`, *"Lesson 8"* wherever it says Lesson 6, a lede such as
*"Twelve words with the long aa. Read them on your own."* (its field), and **Back to Lesson 8**.

**It gets a Next, like every other exercise page** — the user on 2026-09-27: *"there is no next lesson button in
paish lesson in the exercise! while there is for others."* Lesson 9 is not built, so it is a button carrying
`data-soon`, and `exercise.js` gains the three lines `mark-lesson.js` already has to say *"The next lesson isn't
built yet"* when it is pressed. The same three lines fix exercise 6 once it links to Lesson 7 (`06` §2).

## 9. The options panel

`qaida-options.js`, "The mark" section. One new row, nothing else:

- **Two-letter tiles** — *Wider* (`wide`, default) / *Same width, smaller letters* (`shrink`) → `data-tailfit`.
  Shown only on a page whose mark has a tail, the way the arrows row is shown only where it means something.

Everything else is already built from the lesson: the Part row reads `lesson.parts` (Lesson 7's change), the board
row offers `trio`, and the twins row works as it does on Lesson 5 (one other mark). The exercise page's "The word
table" section needs nothing: it reads the page, not the mark.

## 10. What must not change

- Every element holding a marked letter stays `aria-hidden`, with the name on its container. A screen reader
  reading بَا reads "ba, alif" or worse; the container's "Baa with zabar and alif" is what it should hear.
- No counts on the page. The bar says how it is going in words.
- The Board and Say it buttons stay in the top bar.
- `data-words` / `data-words-attr` on **every** line this page adds.
