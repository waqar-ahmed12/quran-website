# 03 — An item of two letters

This is the only file in this folder with real code in it.

**The rule that governs every change below:** lessons 4, 5, 6 and 7 must come out **identical**. Every change here
has a no-tail case, and the no-tail case is what those four pages already do. If `tools/qaida-marks-check.js`,
`qaida-lesson5-check.js`, `qaida-lesson6-check.js` or `qaida-lesson7-check.js` changes its answer at all, the change
was wrong. Write that assertion first (`06` §3).

## 1. `MARKS` gains one row

In the second statement, beside Lesson 7's rows (an object literal cannot reference itself, `docs/lesson-7/03` §1):

```js
// Lesson 8 (docs/lesson-8/): zabar, and an alif after it — the long aa. The first mark followed by a LETTER: `tail`
// is what comes after the mark, as code points (composed, never pasted: lessons 10 and 12's tails carry a sukun,
// so the field is composed everywhere, docs/lesson-8/02 §1). `skip`: the letters this mark is never written on
// (docs/lesson-8/02 §2). `first` is zabar's own six with laam swapped out, because لَا is one joined shape and part
// 1 should show the alif doing its ordinary thing (docs/lesson-8/02 §4).
'fatha-alif': {
  id: 'fatha-alif', cp: 0x064E, tail: [0x0627], names: { fatha: 'fatha and alif', zabar: 'zabar and alif' },
  sits: 'above', lesson: 8, audio: 'fatha-alif',
  first: MARKS.fatha.first.map((key) => (key === 'ل' ? 'ن' : key)), sample: 'ب', against: ['fatha'],
  skip: ['ا', 'ء'],
},
```

- **The id has a hyphen, on purpose.** It is also the recording group, which is a **folder** (`audio/fatha-alif/ba.mp3`).
  Lower-case ASCII survives Windows, git and Netlify's case-sensitive server; `fathaAlif` would work on this PC and
  break the day a file is saved as `fathaalif/`. `MARKS['fatha-alif']` and `data-mark="fatha-alif"` both work.
- **`against: ['fatha']`**, and only it: short against long is the lesson (`§5`).
- **`first` is borrowed and adjusted**, not copied, so a change to Lesson 4's six follows here — except laam.
- `sits: 'above'`: the zabar is where it always was. Nothing in this lesson sits below.

## 2. The suffix, and every id built from it

Today the mark is the only thing after the letter, so `String.fromCharCode(mark.cp)` is written out wherever an
id or a glyph is built. Give it one name:

```js
// What follows the letter: its mark, and — for a mark followed by a letter (Lesson 8's alif; lessons 10-13's wow
// and yaa) — that letter too. An item's id is the letter's key plus this, so it is one character on lessons 4-7
// (unchanged) and longer wherever there is a tail.
const suffixOf = (mark) => String.fromCharCode(mark.cp, ...(mark.tail || []));
const glyphOf = (letter, mark) => letter + suffixOf(mark);
const aloneOf = (mark) => String.fromCharCode(0x25CC) + suffixOf(mark);
```

Then **every place an id is built** uses it. Today there are four:

| Where | Today | Becomes |
|---|---|---|
| `marks.js` `allItems` → `itemFor` | `key + String.fromCharCode(mark.cp)` | `key + suffixOf(mark)` |
| `marks.js` `twinItems` | `key + String.fromCharCode(other.cp)` | `key + suffixOf(other)` |
| `marks.js` `reviewKeys` (`earlier`) | `suffix: String.fromCharCode(m.cp)` | `suffix: suffixOf(m)` |
| `mark-lesson.js` `markTile` | `shell.keyOf(letter) + String.fromCharCode(strokeOf.cp)` | `shell.keyOf(letter) + marks.suffixOf(strokeOf)` |

**Search before believing the table:** `Select-String -Path site\qaida\*.js -Pattern 'fromCharCode'` and look at
every hit. The one in `markTile`'s "tint" branch (`el('span', 'tinted', String.fromCharCode(strokeOf.cp))`) is a
glyph, not an id — it becomes `suffixOf(strokeOf)` too, so the alif is tinted with its zabar (`§7`).

**Why it matters more here than it looks:** Lesson 8's twin is بَ — the same letter and the same mark, less the
alif. If any one of these four still builds `key + cp`, the lesson's own item and its twin share an id **in the
same pool**. `practice.js` keys everything by id: a right answer to "ba" would count as knowing "baa", and the
board's gold edge for "the letter just missed" would light the wrong tile.

Export `suffixOf` on `window.qaidaMarks`.

## 3. `shell.masteredCount`: a suffix, not a code point

Lesson 8's row in `shell.js`:

```js
{ n: 8, title: { fatha: 'Fatha and alif', zabar: 'Zabar and alif' }, href: 'lesson-8.html', built: true,
  progress: 'drill', cp: 0x064E, tail: [0x0627], lede: 'The long “aa”: an alif after the mark.' },
```

It **shares `cp` with Lesson 4.** Today's test — `id.length === 2 && cps.includes(id[1])` — would count every
**twin** in Lesson 8's record (بَ, two characters ending in U+064E) and **none of its own items** (three
characters). The home card would read the student's zabar review as their long-vowel progress. So:

```js
// An id counts if it is one letter followed by one of the lesson's suffixes: the mark (lessons 4-7, and Lesson 7's
// three) or the mark and what follows it (Lesson 8's alif). Lesson 8 shares zabar's code point with Lesson 4, so
// the LENGTH is what keeps its twins (بَ, riding along) out of its count.
const tail = entry && entry.tail ? String.fromCharCode(...entry.tail) : '';
const suffixes = entry && entry.cp ? [].concat(entry.cp).map((cp) => String.fromCharCode(cp) + tail) : [];
…
return !suffixes.length || suffixes.some((s) => id.length === 1 + s.length && id.endsWith(s));
```

On lessons 4–7, `tail` is empty and this is exactly today's test. **The check:** the home card's number equals
the page's bar, with the record holding own items *and* twins.

## 4. Parts, and the 27

One mark, so `partsOf` gives the two parts lessons 4–6 have, with no change:

| Part | Name | Letters | Required |
|---|---|---|---|
| 1 | Meet it | **ب د ر س م ن** — Lesson 4's six, ن for ل. Four show the alif joined, two (د ر) show it standing apart | 6 |
| 2 | All the letters | the **27** — every letter but ا and ء | 27 |

`skip` is read in **two** places, and nowhere else needs to know:

- `allItems` — the last-part loop and the warm-up loop both go through `itemFor(key, mark)`; return early when
  `(mark.skip || []).includes(key)`. (No warm-up six contains a skipped letter today, but the guard belongs in
  one place, not in the data.)
- `boardRows` — filter the rows the same way, so the board shows 27.

`sizes()` then says `[6, 27]`, `stats()` measures against 27, and the page's `setDrillTotal` writes 27, which is
what the home card reads (`home.js`: `shell.drillOf(n).total || letters`). **Any wording that says "29" is now
wrong on this page** (`04` §7). `sampleOf` needs nothing: part 2's letter is ع, and عَا is fine.

## 5. Twins: *short or long?*

`against: ['fatha']` and the existing machinery does the rest: `twinItems` builds **بَ** beside every **بَا** —
same letter, same mark, no alif. With one other mark, `alternate` and `both` are the same thing: one twin per
letter, six in part 1 and 27 in part 2, about a third of the questions at the engine's half weight for review —
the share Lesson 5 measured and every mark lesson since has kept. `data-distractors="which-mark"` is unchanged.

Three things to know:

- **The twins are Lesson 4's own ids**, recorded in *Lesson 8's* drill record. They are review: never required,
  never counted (§3), never the gate. That is how Lesson 5's zabar twins already work.
- **`reviewKeys` reaches back through `othersOf(mark)`**, so the letters this student missed with zabar in
  Lesson 4 come first if the plain-letter slider is ever turned up. No change needed — it is the right choice.
- **The verdict reads correctly with no change**: *"That one is Baa with zabar. This is Baa with zabar and
  alif."* It names the difference the student just missed. Read it aloud once before building.

**The check that matters:** every question about a Lesson 8 item has **its own twin (بَ) among the answers**. A
question without it is a question about *which letter*, which Lesson 2 already asked.

**Not built, and asked:** a second contrast, **بًا** — two zabar and an alif, "ban" — which is how tanween on a
fatha is actually written at the end of a word, and looks like بَا with one stroke more. It is a real, useful
contrast and it doubles as Lesson 7's review, but it is a spelling Lesson 7 deliberately left out. `07` §7.

## 6. The tile: two letters wide, one row high

The mark tile is a portrait card: `width: var(--tile)` (`qaida.css:673`) and `aspect-ratio: 5 / 6.6`
(`qaida.css:2899`), sized for one letter. بَا is two, and سَا or دَا is well over one and a half letter-widths.

`markTile` marks a tile whose stroke has a tail:

```js
button.toggleAttribute('data-tail', Boolean(strokeOf && strokeOf.tail));
```

and the stylesheet makes it **wider, never taller**:

```css
/* Two letters side by side (Lesson 8's بَا; lessons 10-13 the same shape). WIDER, never taller: the tiles of one
   row share one height, or the row looks broken — fixes/lesson 6 ("why is the zair box weird") is that fault. */
.mark-tile[data-tail] { width: calc(var(--tile) * 1.5); aspect-ratio: 7.5 / 6.6; }
```

The glyph's size is `calc(var(--tile) * 0.58)` and does not change, so a tailed letter is the same size as its
bare neighbour. **Check the height, not the look:** a tailed tile and a bare tile in the same row report the same
`offsetHeight`.

**Every board that sets its own `--tile` inherits this** (`.pair.feature`, `.trio`, `.quad` and their
`:root[data-size='large']` overrides), because the rule multiplies whatever `--tile` is. A trio with one wide tile
is 3.5 tiles across; below 479px the trio already has its own `--tile`, and it is on the checklist.

**A row in the panel, not a guess** (`04` §8): *Two-letter tiles* — **Wider** (the default above) / **Same width,
smaller letters** (`data-tailfit="shrink"`: the tile keeps its width and a tailed glyph drops to about 0.72 of its
size). The user looks at both.

**Other places a two-letter glyph lands, and what they need:**

- **The drill's question** (`.prompt`) is full width, and `shell.centerInk` centres the drawn ink. Nothing.
- **"Write it"** — `trace.js` already scales the guide to fit (`room.width / wide`), so two letters shrink to fit
  the board. Nothing; it is on the checklist.
- **Answers as glyphs** (the name-to-mark format, off by default; the panel's *The drill → Question → Mix both*
  turns it on) — two letters in a two-column grid on a phone. On the checklist.

## 7. The halo points at the alif

`markBox(letter, spec)` finds the ring's place by drawing the letter **with and without** the mark on a canvas,
centred, and ringing what changed. With a tail that breaks three ways at once: بَا is wider so everything shifts
when centred; ب changes from its alone shape to its start shape; and the whole pair differs from the bare letter.
The ring would go round everything.

**What the ring should say here is "look at the alif"** — the zabar is the student's since Lesson 4; the alif is
the lesson. So for a tailed mark, draw the **head** and the **whole**, both anchored at the right-hand edge
(Arabic starts there, so the first letter lands in the same place in both), and ring the difference:

```js
// A mark with a tail (docs/lesson-8/03 §7): the ring goes round what the tail added, not round the mark. The head
// is the letter with its mark and an invisible joiner (U+200D — Lesson 3's trick for a start shape), so the letter
// is already in the shape it takes before the alif; the difference is the alif alone. Both are drawn from the right
// edge, and positionHalos measures from the glyph's right edge for these tiles.
const head = letter + String.fromCharCode(mark.cp) + (mark.tail ? String.fromCharCode(0x200D) : '');
```

- The cache key gains the stroke: `` `${letter}|${spec}|${stroke.id}` `` — Lesson 7's spec asked for it
  (`docs/lesson-7/03` §8) and the build skipped it as unneeded then; it is needed now, because a page can hold
  a tailed and an untailed stroke (بَا and its twin بَ) at once.
- `positionHalos` uses `g.right` instead of the glyph's centre for a `[data-tail]` tile.
- **After a non-joiner** (دَا) the joiner does nothing and the difference is still the alif. **On لَا** the head
  (laam in its start shape) and the whole (one joined shape) differ almost entirely, so the ring goes round the
  whole of لا — which is honest: the whole shape is what is new. Both are on the checklist.
- **If it looks wrong in a browser**, the panel already has *Point at the mark* → *Tint it*, which tints
  `suffixOf(mark)` — the zabar and the alif together (§2). Whether a tint across a joined letter keeps the join
  is a browser question; "tint" has been marked fragile since Lesson 4.

## 8. Small things

- **`aloneOf`** gains the tail through `suffixOf`: the board's "This is zabar and alif" shows **◌َا** — the dotted
  circle with its zabar, and the alif after it.
- **The joined example.** `joinedOf` is the glyph twice ("the same letter twice, not a word"), which for a tailed
  mark would be بَابَا — a made-up word. For a tailed mark, the board's joined block shows **how the alif joins**
  instead: the part's first joining letter and first non-joining letter side by side (part 1: **بَا دَا**), and in
  part 2 **لَا** as the third. `04` §4 has the wording. Implement it in `mark-lesson.js`'s `renderBoard`, from
  `NEVER_JOIN` in `marks.js` (`02` §3); `joinedOf` stays as it is for lessons 4–7.
- **`audio.js`'s `groups()`/`wanted()`** list all 29 letters for every mark group. Honour `mark.skip`, and show
  the composed glyph (`glyphOf`) in the row's glyph cell rather than the bare key, so the teacher sees **بَا** and
  not ب beside "the sound of Baa with fatha and alif". Two lines. Then `recordings.html` lists **27** rows, not 29.
- **`audio/manifest.json`** gains `"fatha-alif": {}`.

## 9. What does not change

- **`practice.js`.** Again.
- **`partsOf`, `SETS`, `twinMarksFor`, `twinsFor`.** One mark, the one-mark path, untouched.
- **Storage.** A `drill` per lesson; ids are strings. A three-character id is still an id.
- **`trace.js`, `voice.js`, `voice-store.js`.** The tracer scales to fit. Say it keys a student's clip by the
  recording group and the letter (`voice.js:77`, `` `${kind}:${key}` ``), so Lesson 8's is `fatha-alif:ب` and can
  never overwrite Lesson 4's `fatha:ب` — the new group name is all it needs.
- **`shapes.js`.** Not loaded on a mark page; `NEVER_JOIN` is a copy of five letters, commented back to it.
