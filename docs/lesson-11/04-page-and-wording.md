# 04 — `lesson-11.html` and its wording

**Copy `lesson-10.html`**, then apply this file line by line. Every line of wording keeps its `data-words` field.
After copying, search the file for `au`, `zabar`, `Zabar`, `10`, `lesson-9` and `lesson-10`, and look at every hit.

## 1. `<html>`

| Attribute | Lesson 10 | Lesson 11 | Why |
|---|---|---|---|
| `data-mark` | `fatha-waw` | `damma-waw` | |
| `data-board` | `quad` | `quad` | two `against` entries: ب بُ بَوْ بُو |
| `data-arrows` | `last` | `last` | the quartet's rule |
| `data-twins` | `alternate` | `alternate` | one twin per letter, flipping between the parts. `07` §2 asks about `both` |
| `data-titlemark` | `baa` | `baa` | layout for a wide glyph. The glyph is composed from `sample`: بُو, or بُوْ in Indo-Pak |
| `data-joined` | on | on | the wow joins, as on Lesson 10 |

The bar's `aria-valuemax` stays **27**.

## 2. Title and lede

| Field | Zabar set | Fatha set |
|---|---|---|
| Title | Paish and wow | Damma and waw |
| Line under it | "Paish, then a wow: the sound is long — oo." | "Damma, then a waw: the sound is long — oo." |

The titles come from `shell.js`'s Lesson 11 row (with the fatha title corrected, `03` §3).

## 3. The board's lines — new or changed

| Line (`data-…`) | Text (zabar set) | Notes |
|---|---|---|
| `mark-sits` | "The {other} sits above the letter, and the wow comes right after it." | Lesson 10's line. `{other}` is now paish |
| `pair-marked` | "With {mark}: oo" | |
| `mark-does` | "The {other} you know, then a wow. Together they make it long: oo." | |
| `same` — **new on this page** | "The same sound: {name} with {sameMark}" | Lesson 9's wording. The tile is بٗ (Madani بُۥ). Part 1 only |
| `.jazam-note`'s **`data-template-indopak`** | "The wow carries a {jazam} here too, as in the last lesson. What changed is the mark before it: after {other}, the wow makes the sound long." | new attribute (`03` §4) |
| `.jazam-note`'s **`data-template-madani`** | "Here the wow has no mark on it. After {other}, a bare wow makes the sound long. In the last lesson the wow had a {jazam}, and said au." | new attribute |
| `.jazam-note`'s `data-template` | *keep Lesson 10's as the fallback*, with its "zabar" turned into `{other}` | never shown on this page while both per-script lines exist |
| `joined`, `joined-note`, `skip-note` | Lesson 10's, unchanged ("the wow joins the letter before it…") | |

Every new attribute is listed in its element's `data-words-attr`, so it gets a text field in the options panel.

**Lesson 10 has a small bug of the same kind.** Its jazam line ends "so it runs into the zabar", written as a literal
word, so the fatha set also reads "zabar". Fix it at the same time: `{other}`, which is "zabar" or "fatha" on
Lesson 10 (`06` §2, step 0).

## 4. Drill wording

Only the item name changes, through the row's `names`: "Baa with paish and wow" / "Baa with damma and waw". The
right and wrong verdicts are Lesson 8's templates, which name what the letter really carries. A twin's verdict says
"Baa with zabar and wow" or "Baa with paish", because that is what it carries.

## 5. The Spell block and the ways out

- The Spell block reads `'damma-waw'` from `spell.js`. The only markup change is the "more words" guide:
  "Twelve more, using oo — no translations, just reading."
- **Previous:** "Previous: Zabar and wow" / "Previous: Fatha and waw", `href="lesson-10.html"`.
- **Next:** "Next: Zabar and yaa" / "Next: Fatha and yaa", a `<button>` with `data-soon` until Lesson 12 is built.
- `lesson-10.html` and `exercise-10.html` need **no edit**: their Next reads `shell.LESSONS` and becomes a link the
  moment the row says `built: true`.

## 6. `exercise-11.html`

Copy `exercise-10.html`: `data-mark="damma-waw"`, "Back to Lesson 11", Next with `data-soon`. Twelve words from
`exercise.js` (`05` §3).

## 7. The feature row: five tiles

Part 1's feature row is ب → بُ → بَوْ → بُو, then **=** and بٗ. That is five tiles, three of them wide in Madani (بَوْ,
بُو and the Madani بُۥ). Lesson 9 had four on this row, and Lesson 10 had four.

**Measure it before changing anything**, in the browser pane, at 375px and at 1280px, default size and Large, both
scripts. The quartet already wraps two by two under 480px (`qaida.css`, `.pair.quad`). The same-sound cell then sits
alone on a third line, which is acceptable.

- **If the row overflows on a wide screen:** the fix is CSS only. The `=` and the same cell wrap onto a line of their
  own under the quartet (`.pair.feature.quad:has(.pair-cell.same)` with `flex-wrap: wrap`).
- **Do not shrink the tiles.** Telling zabar from paish at the tile's size is the Lesson 6 problem the user already
  raised, and this lesson's Indo-Pak contrast is exactly that problem (`01` §4).

## 8. Accessibility

Nothing new. The tiles' names come from the same templates the sighted student reads ("Baa with paish and wow"). The
same-sound tile's name is its caption. The per-script line is plain text and is read in place.
