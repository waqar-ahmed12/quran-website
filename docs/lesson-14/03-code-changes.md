# 03 — Code changes

**The rule that governs every change:** lessons 4–13 come out byte-identical. `leadOf` returns `''` for every row
but this lesson's, so every call site below draws exactly what it drew before, **unless the page is Lesson 14**.
Write the fence first (`06` §2): every glyph every earlier lesson draws, in both scripts, snapshotted before `lead`
exists.

## 1. `marks.js`: the row and `leadOf`

The row is in `02` §1, in the fourth statement after Lesson 13's. Then, beside `drawnOf`:

```js
// What is drawn IN FRONT of every item on a lesson's page (docs/lesson-14/02 §2): Lesson 14's vowelled alif, because a
// jazam has no sound on its own. Drawn, never asked, never part of an id. A form may carry its own (docs/lesson-14/07
// §3), read first. Every other row has none, so this is '' and every glyph of lessons 4-13 is unchanged (the fence).
const leadOf = (mark, script = scriptNow()) => {
  const own = mark && mark.forms && mark.forms[script];
  const lead = (own && own.lead) || (mark && mark.lead);
  return lead ? String.fromCharCode(...lead) : '';
};
```

Export it beside `glyphOf`. **`glyphOf` itself does not change.** `spell.js`, `exercise.js`, `MET_WORDS` and
`audio.js` call it for words and for other lessons' items, and none of them wants a lead in front of a letter in the
middle of a word.

## 2. Every place an item is drawn — eight

| # | File | Where | Today | On Lesson 14 |
|---|---|---|---|---|
| 1 | `marks.js` | `allItems`, `itemFor` | `glyphOf(found.glyph, mark)` | `leadOf(mark) + glyphOf(…)`: the prompt, the choices, the verdict's glyph and "Write it" all read `item.glyph`, so this one line covers four places on the page |
| 2 | `marks.js` | `twinItems` | `glyphOf(glyph, other)` | `leadOf(mark) + glyphOf(glyph, other)`. **The lead of `mark`, the lesson's own**, never `other`'s: the twin is "baa with zabar, after the alif", drawn on *this* page |
| 3 | `marks.js` | `boardRows` | `marked: glyphOf(glyph, mark)`, `others[].glyph: glyphOf(glyph, m)` | both prefixed with `leadOf(mark)`. `joined` unchanged (the block is off, `04` §1) |
| 4 | `marks.js` | `sampleOf` | `glyphOf(found[0], mark)` | prefixed: the rail shows اَبْ and اَعْ |
| 5 | `mark-lesson.js` | `markTile` | `glyphOf(letter, strokeOf)`; in "tint" mode `letter` + a tinted span | prefixed with `marks.leadOf(mark)` for every kind **but `bare`**. In tint mode the lead is its own text node before the letter. `data-tail` is also set when there is a lead: two letters, a wide tile |
| 6 | `mark-lesson.js` | `markBox` (the halo) | `head` = letter (+ marks), whole = `glyphOf(letter, mark)` | both prefixed with the lead, and drawn **right-anchored** as a tailed mark is (§3) |
| 7 | `mark-lesson.js` | `paintHead`, the title glyph | `glyphOf(mark.sample, mark)` | prefixed: اَبْ |
| 8 | `audio.js` | `wanted()`, `display` | `glyphOf(key, mark)` | prefixed, so the recordings page shows the teacher اَبْ, which is what they will say |

**Not a draw site:** `voice.js` shows `item.audio.glyph`, which is the **bare letter** on every mark lesson since
Lesson 4. Lesson 14 shows ب there too, as lessons 4–13 do. Unchanged. `reviewItems` (bare letters, off by default)
draws bare letters and takes no lead.

`twinsFor` in `mark-lesson.js` already passes the page's own `mark` to `twinItems`, so (2) needs nothing from the
page. The check (`06` §3) asserts every item, twin, board tile, rail glyph and title on Lesson 14 **starts with the
lead**, and that no glyph on any other lesson's page does.

## 3. The halo

`markBox` measures what the mark adds by drawing the "before" string and the whole, and diffing the two. On
Lesson 14:

- `head` = lead + letter. The jazam is the form's only mark, so `form.cp.slice(0, -1)` is empty;
- whole = lead + letter + jazam;
- **anchor right** when there is a lead (`const wide = tailed || Boolean(lead)`, in place of `tailed` for `X` and
  `textAlign`). The lead is on the right and the letter to its left. Right-anchored, the shared "lead + letter"
  lands on the same pixels in both draws, and the diff is the jazam alone;
- `positionHalos` already anchors right when the tile has `data-tail`, which (5) sets. So the two agree.

The cache key already holds the mark id and the script. **Look at it in the browser:** the ring should sit on the
jazam, not on the alif and not on the whole tile.

## 4. The leads line — a new board element

`01` §3: the other two leads are shown, not drilled. There is a new `<p class="leads-note">` on the board, in the
joined block's place (the joined block is off):

- text: `data-template`, "The first letter can carry any mark: {example}."
- `{example}` is **composed in code**, never typed: the open part's first row's letter after اَ, اِ and اُ, joined
  by two spaces. In part 1 that is اَبْ  اِبْ  اُبْ. It uses `leadOf`'s alif with fatha's, kasra's and damma's own
  `cp`, then `glyphOf(letter, mark)`.
- shown in both parts; `null` on every other page (`$('.leads-note')`), so no other lesson changes.

## 5. The per-script "you have seen it" line

Lesson 11's `.jazam-note` with `data-template-madani` and `data-template-indopak` (`docs/lesson-11/03` §4). The
lines are in `04` §3. No new code.

## 6. `spell.js`: a letter with no sound of its own

Every letter in a walkthrough so far carried a vowel, and a letter step says "{name} with {mark}: {sound}". A jazam
letter has no sound to say. **The change, in `paint()`:** a letter step whose mark is `'sukun'` uses a new template,
`data-jazam-line`: "{name} with {mark}: no vowel of its own — it closes the sound before it." It has no `{sound}`.
**The blend step right after it** then reads the closed syllable, which the student can now hear. `stepsFor` is
unchanged. So قَلْبٌ steps:

1. Qaaf with zabar: qa
2. Laam with jazam: no vowel of its own — it closes the sound before it.
3. qal
4. Baa with two paish: bun
5. qalbun

That is the traditional spelling order ("qaaf zabar qa, laam jazam qal…"). `07` §6 asks whether to fold the jazam into
the letter before, as lessons 10 and 12 fold a wow or yaa with a jazam into its letter's step. **Recommended: its own
step**, because here the jazam is the lesson.

Lessons 4–13's words carry no `sukun` letter (the words check proves it), so no earlier walkthrough changes.

## 7. `qaida-words-check.js`: three new rules

The lesson-number rule already keeps `sukun` out of lessons 4–13's words. Three structural rules are new, on every
word of every lesson:

1. **never on a word's first letter** (a word cannot begin with a closed syllable);
2. **never right after another `sukun`** (two closed letters in a row are a tajweed matter, and not this pass);
3. **never on ا** (`skip`, again, for words).

## 8. `shell.js`, and the last lesson's Next

- Lesson 14's row gains `href: 'lesson-14.html', built: true, progress: 'drill', cp: 0x0652`. `masteredCount` needs
  **no change**: own ids are two characters ending U+0652, and twins are two characters ending in a vowel. The check
  masters one own item and one twin of each vowel and gets 1.
- **Next has nowhere to go.** `nextEntry()` finds no Lesson 15, so today the button would be blank, and a tap would
  say "not built yet". The fix is a `data-last` attribute on Lesson 14's Next. In `paintNext` and the click handler:
  with no next lesson and `data-last` present, the label is `data-last` ("Back to the Qaida") and the button goes to
  `index.html`. It stays that way until step 11's finish screen gives it somewhere better. No other page has
  `data-last`, and no other page lacks a next lesson. **With the second pass** (`docs/pass-2/`), `data-last` moves
  to Lesson 29, and Lesson 14's Next becomes ordinary once rows 15–29 are in `LESSONS` (`07` §7).
- **The twin's lead, for Lesson 15:** write `twinItems`' and `boardRows`' lead as `leadOf(other) || leadOf(mark)`
  from the start. Lesson 14's twins carry no lead, so it draws the same. Lesson 15's twins will
  (`docs/lesson-15/03` §3).

## 9. Audio

`manifest.json` gains `"sukun": {}`. `recordings.html` should show **27 new rows** reading اَبْ, اَتْ… (draw site 8).
`groups()`'s description line reads "The sound of Baa with sukoon — not its name", which does not tell the teacher to
say the alif. **Give a row with a lead its own line:** `The sound "ab": alif with fatha, then ${name} with sukoon`,
built from the row's own names. `07` §5 asks the teacher how they will read these.

## 10. The options panel

- **"Two-letter tiles"** should appear: widen the `hasTail` getter to `own.some((m) => marks.formOf(m).tail.length > 0 || Boolean(marks.leadOf(m)))`.
- The board row offers trio and pairs (`otherCount` is 3, so the quartet is offered too; it works, with five wide
  tiles). Nothing new to build.
- Every new line of wording (`04`) gets its text field through `data-words-attr`.
