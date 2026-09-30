# 04 — The page and its wording

`lesson-9.html` is **`lesson-8.html`** with the changes below, and **Lesson 7's multi-mark attributes** laid over
it. Lesson 8, not Lesson 7, as the file to copy: Lesson 8's page has the **Spell a word** block, the **Practice
reading** link and the latest fixes (the walkthrough, Previous, the exercise link); Lesson 7's deliberately has no
words. What Lesson 9 takes from Lesson 7 is only its `<html>` attributes and the rail's part names. Anything not
named here — the top bar, the Say it block, the drill, the tracer dialog, the chooser, the live regions, every
`aria-*` — is already right and must not drift.

Every string below is a **candidate**, with its own text field (`data-words` / `data-words-attr`). The teacher
rewrites any of them without code.

## 1. `<html>` attributes

| Attribute | Lesson 8 | Lesson 9 | Why |
|---|---|---|---|
| `data-mark` | `fatha-alif` | **`standing`** | the set (`03` §1) |
| `data-board` | `trio` | **`auto`** | Lesson 7's: a trio in each warm-up, the quartet in the last part |
| `data-arrows` | `all` | **`last`** | Lesson 7's |
| `data-titlemark` | `baa` | **`baa`** | unchanged as a layout choice; the glyph is بٰ, composed by the script (Madani draws بَٰ) |
| `data-tailfit` | `wide` | `wide` | kept: the Madani khari zair and ulta paish are wide tiles (`03` §4) |
| everything else | | unchanged | `data-twins="alternate"`, `data-distractors="which-mark"`, `data-review="0"`, `data-point="halo"`, `data-madani-font="scheherazade"`, `data-indopak-font="noto"` |

`<title>` → **`Lesson 9: Standing harakaat · Free Qaida`**. The title mark's literal → `&#x628;&#x670;` as numeric
references, never pasted; the page's script replaces it on load anyway. The comment at the top of the file says
what this lesson is and where its spec is.

## 2. The head

```html
<p class="eyebrow" data-words="Lesson number">Lesson 9 of 14</p>
<h1 data-words-attr="data-title-zabar|Lesson title (zabar);data-title-fatha|Lesson title (fatha)"
    data-title-zabar="Standing harakaat" data-title-fatha="Standing marks">Standing harakaat</h1>
<p class="lede" data-words="Line under the title">The long vowels again, written as a mark instead of a letter.</p>
```

The `.track` list moves `now` to the **ninth** `<li>`. Both titles are `shell.js`'s Lesson 9 row, which already
says them.

## 3. The rail

Four parts, as Lesson 7: `data-group1="Meet {mark}" data-group2="Meet {mark}" data-group3="Meet {mark}"
data-group4="All the letters"` → *Meet khari zabar*, *Meet khari zair*, *Meet ulta paish*, *All the letters*. Part
glyphs: بٰ, هٖ, هٗ, then عٰ-shaped — `sampleOf`'s own choice.

## 4. The board

```html
<section class="marks-board" aria-labelledby="board-title"
         data-mark-alone="This is {mark}."
         data-mark-sits="{Mark} sits {where}, where {other} sits — standing up."
         data-mark-does="{Mark} makes the sound long, as if a letter came after it."
         data-pair-bare="The letter on its own" data-pair-other="With {other}: short"
         data-pair-marked="With {mark}: long"
         data-same="The same sound: {name} with zabar and alif"
         data-joined="off"
         data-met-standing-fatha="You will see this all through the Qur'an: هٰذَا, ذٰلِكَ."
         data-met-standing-kasra="In the Qur'an you will see this almost only on ه, meaning “him” or “it”: بِهٖ."
         data-met-inverted-damma="In the Qur'an you will see this almost only on ه, meaning “him” or “it”: لَهٗ."
         data-madani-standing-fatha="The Madani mushaf writes this as {other} with a small alif above it."
         data-madani-standing-kasra="The Madani mushaf writes this as {other} with a small yaa after the letter."
         data-madani-inverted-damma="The Madani mushaf writes this as {other} with a small waw after the letter."
         …>
```

- `{mark}` is the open part's mark in the student's word ("khari zabar" / "standing fatha"); `{other}` is its short
  twin ("zabar" / "fatha"). *"Khari zabar sits above the letter, where zabar sits — standing up."*
- The `ulta paish` line needs its own `data-mark-sits` — it is not standing, it is **turned over**. Give the board
  per-mark overrides, `data-mark-sits-inverted-damma="{Mark} sits above the letter, where {other} sits — turned
  over."`, and fall back to `data-mark-sits` when a mark has none.
- **`data-same`** is the same-sound tile's caption (`03` §7), part 1 only. `{name}` is the letter; "zabar and alif"
  follows the name set the same way Lesson 8's title does — use `{sameMark}`, filled from the `same` row's name.
- **The Arabic in the `data-met-*` lines is not typed.** A combining mark in an attribute is exactly what
  `docs/lesson-4/02` §1 forbids. Write the lines with a `{example}` token, and let `mark-lesson.js` fill it from
  `spell.js`'s words by key — هٰذَا from the walkthrough, بِهٖ and لَهٗ from the exercise list — composed per script.
  (The attributes above show the words for reading, not for pasting.)
- **The Madani lines show only when the script is Madani**, one per mark, in its warm-up part.
- The joined block is off (`03` §7), so Lesson 8's `data-joined-note`, `data-lam-alif` and `data-skip-note` go —
  except the skip note, which stays: *"Alif and hamza are not here: a long vowel after them is written another
  way."*

## 5. The drill

**No change.** The lines read right with the new names:

```html
data-right="Yes — {name} with {mark}."                         → "Yes — Baa with khari zabar."
data-wrong="That one is {chosen}. This is {name} with {mark}." → "That one is Baa with zabar. This is Baa with khari zabar."
```

## 6. Spell a word, and Practice reading

Kept whole from `lesson-8.html`. The **Practice reading** link → `exercise-9.html`.

One code change: **`spell.js` and `exercise.js` look up their words by `root.dataset.mark`, and resolve it with
`marks.markOf`** — which returns `null` for a set, so on this page both would silently draw nothing (this is why
Lesson 7 has no words). Resolve with `marks.markOf(id) || marks.setOf(id)`, and key `WORDS` by the page's
`data-mark` (`'standing'`). A word's letters already name their own mark (`[key, markId]`), so nothing else about
a word changes.

## 7. The end, Previous, Next

```html
<p class="end-line"
   data-before="Work through all four parts to finish the lesson."
   data-finished="You can read the long vowels as marks. This lesson is marked as done. You can keep practising as long as you like."
   …>
<a class="button quiet prev" href="lesson-8.html"
   data-prev-zabar="Previous: Zabar and alif" data-prev-fatha="Previous: Fatha and alif" …>
<button class="button primary next" type="button"
        data-next-zabar="Next: Zabar and wow" data-next-fatha="Next: Fatha and wow"
        data-soon="The next lesson isn’t built yet." …>
```

**No "29" and no "27" on the page** — search the copied file for both. `lesson-8.html` and `exercise-8.html`'s
Next already read `shell.LESSONS`, and go live the moment the row says `built: true`.

## 8. `exercise-9.html`

A copy of **`exercise-8.html`**: `data-mark="standing"`, *"Lesson 9"* wherever it says Lesson 8, a lede such as
*"Twelve words with the standing marks. Read them on your own."* (its field), **Back to Lesson 9**, and a Next
carrying `data-soon`.

## 9. The options panel

`qaida-options.js`, "The mark" section. **Nothing new is required**: the Part row reads the lesson's parts, the
board row offers auto/trio/quartet, and the *Two-letter tiles* row shows when `lesson.hasTail` — which must become
"any of this page's marks has a tail **in the current script**" (`formOf`), so it appears on Madani and not on
Indo-Pak. The new `data-same`, `data-met-*` and `data-madani-*` fields appear on their own, through
`data-words-attr`.

**One optional row**, if the teacher wants to compare: *The same sound* — *Show* / *Hide* — for the part 1 tile.

## 10. What must not change

- Every element holding a marked letter stays `aria-hidden`, with the name on its container.
- No counts on the page.
- The Board and Say it buttons stay in the top bar.
- `data-words` / `data-words-attr` on **every** line this page adds.
