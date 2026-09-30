# 04 — `lesson-12.html` and its wording

**Copy `lesson-11.html`** (it already has the per-script jazam line), then apply this file. Search the copy for `oo`,
`paish`, `Paish`, `wow`, `same`, `11` and `lesson-10`/`lesson-11`, and look at every hit.

## 1. `<html>`

| Attribute | Lesson 11 | Lesson 12 | Why |
|---|---|---|---|
| `data-mark` | `damma-waw` | `fatha-yaa` | |
| `data-board` | `quad` | `quad` | ب بَ بَوْ بَيْ |
| `data-arrows` | `last` | `last` | |
| `data-twins` | `alternate` | `alternate` | |
| `data-titlemark` | `baa` | `baa` | the glyph becomes بَيْ from `sample` |

The bar's `aria-valuemax` stays **27**.

## 2. Title and lede

| Field | Zabar set | Fatha set |
|---|---|---|
| Title | Zabar and yaa | Fatha and yaa |
| Line under it | "A yaa after the mark, with no sound of its own: together they say “ai”." | the same |

## 3. The board's lines

| Line (`data-…`) | Text (zabar set) | Notes |
|---|---|---|
| `mark-sits` | "The {other} sits above the letter, and the yaa comes right after it." | `{other}` is zabar |
| `pair-marked` | "With {mark}: ai" | |
| `mark-does` | "The {other} you know, then a yaa. Together they say one sound: ai." | |
| `same` | **remove** | Lesson 12's row has no `same` (there is no standing mark for "ai"), so the tile never draws; drop the attribute and its text field |
| `.jazam-note` `data-template-madani` | "The small mark on the yaa is {jazam}, as on the wow: the yaa has no sound of its own, so it runs into the {other}." | |
| `.jazam-note` `data-template-indopak` | the Madani line, then: "At the end, the Indo-Pak yaa has no dots: ی." | the dotless end (`02` §3). The ی is typed as a letter, not a mark, so it may sit in the attribute |
| `joined` | "The yaa joins the letter before it — unless that letter never joins the next one." | |
| `joined-note`, `skip-note` | Lesson 11's, unchanged | |

## 4. Drill wording

"Baa with zabar and yaa" / "Baa with fatha and yaa". Verdicts are unchanged templates.

## 5. The Spell block and the ways out

- The "more words" guide: "Twelve more, using ai — no translations, just reading."
- **Previous:** "Previous: Paish and wow" / "Previous: Damma and waw", `href="lesson-11.html"`.
- **Next:** "Next: Zair and yaa" / "Next: Kasra and yaa", with `data-soon` until Lesson 13 is built.

## 6. `exercise-12.html`

Copy `exercise-11.html`: `data-mark="fatha-yaa"`, "Back to Lesson 12", Next with `data-soon`.

## 7. The feature row

Four tiles, as on Lesson 10 (no same-sound tile). No layout work expected.
