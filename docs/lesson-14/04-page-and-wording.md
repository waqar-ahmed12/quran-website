# 04 — `lesson-14.html` and its wording

**Copy `lesson-13.html`** (it has the per-script jazam line, which this page keeps), then apply this file. Remove what
belongs to a long vowel: the same-sound tile's `data-same`, and the "ee" lines. Then search the copy for `yaa`,
`ee`, `same`, `13`, `27` and `lesson-12`/`lesson-13`, and look at every hit.

## 1. `<html>`

| Attribute | Lesson 13 | Lesson 14 | Why |
|---|---|---|---|
| `data-mark` | `kasra-yaa` | `sukun` | |
| `data-board` | `quad` | **`trio`** | ب → اَبَ → اَبْ. A quartet would be five tiles, four of them wide (`01` §2) |
| `data-arrows` | `last` | **`all`** | the trio's rule since Lesson 5 |
| `data-twins` | `alternate` | `alternate` | one vowel per letter, rotating through three |
| `data-joined` | on | **`off`** | "the same letter twice" would be بْبْ, which is nothing. The leads line takes its place (`03` §4), as Lesson 9's notes did |
| `data-titlemark` | `baa` | `baa` | a wide glyph: اَبْ |

The bar's `aria-valuemax` stays **27**.

## 2. Title and lede

| Field | Zabar set | Fatha set |
|---|---|---|
| Title | Jazam | Sukoon |
| Line under it | "A letter with no vowel of its own: it closes the sound before it." | the same |

The home already has both titles and the lede (`shell.js`).

## 3. The board's lines

| Line (`data-…`) | Text (zabar set) | Shown |
|---|---|---|
| `mark-alone` | "This is {mark}." | always |
| `mark-sits` | "{Mark} sits above the letter." | always |
| `pair-bare` | "The letter on its own" | feature row |
| `pair-other` | "With {other}: two sounds" | feature row: اَبَ |
| `pair-marked` | "With {mark}: one sound" | feature row: اَبْ |
| `mark-does` | "A letter with {mark} has no vowel of its own. It closes the sound before it: a, then ab." | always |
| **`lead-line`** — new | "{Mark} can't be said on its own, so every letter here comes after an alif with {other}." | always, first line under the feature row. It says why the alif is there |
| `.leads-note` `data-template` — new | "The first letter can carry any mark: {example}." | both parts (`03` §4) |
| `.jazam-note` `data-template-madani` | "You have met {mark} already, on the wow and the yaa: au and ai. It does the same on every letter." | both parts |
| `.jazam-note` `data-template-indopak` | "You have met {mark} already, on the wow and the yaa. After zabar they said au and ai; after paish and zair they made the sound long. Either way the letter had no vowel of its own, and that is what {mark} means on every letter." | both parts |
| **`wy-note`** — new | "With wow and yaa, this is the au and ai you have already read." | part 2 only, where اَوْ and اَيْ are in the table |
| `skip-note` | "Alif never carries {mark}, and hamza is not in this table." | part 2 only |

`{other}` is the first of `against`, zabar or fatha. `{mark}`/`{Mark}` is jazam or sukoon. The two new lines
(`lead-line`, `wy-note`) are plain `<p>`s filled by `renderBoard` with `say()`, `null` on every other page.

## 4. Drill wording

The item name comes from the page's `data-name-marked` template ("{name} with {mark}"): **"Baa with jazam"**. The lead
is not named in the answers. It is identical in every choice, and naming it would add the same four words to every
button. The twins say "Baa with zair" and the rest, because that is what the second letter carries. Verdicts are
unchanged templates.

## 5. The Spell block and the ways out

- The Spell block reads `'sukun'`. It gains **`data-jazam-line`**: "{name} with {mark}: no vowel of its own — it
  closes the sound before it." (`03` §6), with its own text field.
- The "more words" guide: "Twelve more, each with a letter that closes a sound — no translations, just reading."
- **Previous:** "Previous: Zair and yaa" / "Previous: Kasra and yaa", `href="lesson-13.html"`.
- **Next:** `data-last="Back to the Qaida"` (`03` §8), and a line above it, `data-words`: "That is the last lesson in
  this part of the Qaida." It says nothing about what comes next until step 11's finish screen exists.

## 6. `exercise-14.html`

Copy `exercise-13.html`: `data-mark="sukun"`, "Back to Lesson 14". Next goes to the Qaida home, labelled "Back to
the Qaida".

## 7. Accessibility

- **The tiles' names don't mention the lead.** A tile reads "Baa with jazam" while showing two letters. The `lead-line`
  sits at the top of the board and says why the alif is there, and a screen reader reaches it first. **Recommended:
  leave the names short**, for the same reason as the choices (§4). The teacher can hear the page with a screen
  reader before launch (step 13's audit).
- The leads line's example is Arabic in a `<span lang="ar" dir="rtl">`, as every example on a board is.
- The by-ear format is the one a screen-reader user can answer, and it waits for the recordings (`07` §5).
- Keyboard: unchanged. The trio is Lesson 5's board.
