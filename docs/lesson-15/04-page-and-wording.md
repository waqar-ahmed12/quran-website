# 04 — `lesson-15.html` and its wording

**Copy `lesson-14.html`** (it has the lead, the leads line and the jazam note), then apply this file. Lesson 15 is a
**set** lesson like Lessons 7 and 9, so copy their rail and part names too. Search the copy for `jazam`, `sukoon`,
`ab`, `14`, `27` and `lesson-13`/`lesson-14`, and look at every hit.

## 1. `<html>`

| Attribute | Lesson 14 | Lesson 15 | Why |
|---|---|---|---|
| `data-mark` | `sukun` | `shadda` | a set of three rows |
| `data-board` | `trio` | `auto` | Lesson 7's: a quartet in the warm-ups (ب اَبَ اَبْ اَبَّ) and in the last part (the other two shaddas) |
| `data-arrows` | `all` | `last` | the quartet's rule |
| `data-twins` | `alternate` | `alternate` | |
| `data-joined` | `off` | `off` | as Lesson 14: a letter twice would be nonsense |
| `data-titlemark` | `baa` | `baa` | اَبَّ |

## 2. Title, lede, rail

| Field | Zabar set | Fatha set |
|---|---|---|
| Title | Tashdeed | Shadda |
| Line under it | "A letter said twice: once to close the sound before it, once with its own vowel." | the same |
| Part 1–3 names (`data-group1`…) | "Meet {mark}" (Lesson 7's pattern: "Meet tashdeed and zabar") | |
| Part 4 | "All of them" | |

## 3. The board's lines

| Line | Text (zabar set) | Shown |
|---|---|---|
| `mark-alone` | "This is {mark}." | always |
| `mark-sits` | "{Set} sits above the letter, with its vowel." | parts 1 and 3 |
| `mark-sits-shadda-kasra` | Indo-Pak: "{Set} sits above the letter, and the zair stays under it." · Madani: "{Set} sits above the letter, and the zair sits just under the {set} — still a zair." | part 2, per script (Lesson 11's mechanism on this line) |
| `pair-bare` | "The letter" | feature row |
| `pair-other` (vowel) | "Once, with {other}: a-ba" | feature row |
| `pair-other` (jazam) | "Once, closed: ab" | feature row |
| `pair-marked` | "Twice: ab-ba" | feature row |
| `mark-does` | "{Set} is the jazam and the vowel together: the letter closes the sound before it, then opens its own." | always |
| `lead-line` | Lesson 14's: "…every letter here comes after an alif with {other}." with "{Set} starts by closing a sound" in place of the jazam's reason | always |
| **`hum-note`** — new | "On noon and meem, {set} is held with a hum through the nose. This is called *ghunna*." | parts with ن or م |
| `skip-note` | "Alif is never doubled, and hamza is not in this table." | part 4 |

The two `pair-other` captions are **per column**: the first is filled from the vowel's name, and the second from
the jazam's. `pairOf` already fills `{other}` per column (`labels.other`). Two columns with different sentences need
the caption keyed by the column's mark: `data-pair-other-sukun` for the jazam column, falling back to `data-pair-other`.
That is the same per-id override Lesson 9 gave `mark-sits`.

## 4. Drill wording

"Baa with tashdeed and zabar" / "Baa with shadda and fatha". Twins: "Baa with zabar", "Baa with jazam". Verdicts
unchanged.

## 5. The Spell block and the ways out

- `data-shadda-line` (`03` §5).
- "More words" guide: "Twelve more, each with a letter said twice — no translations, just reading."
- **Previous:** "Previous: Jazam" / "Previous: Sukoon", `lesson-14.html`.
- **Next:** "Next: Hamza", with `data-soon`.

## 6. `exercise-15.html`

Copy `exercise-14.html`, `data-mark="shadda"`, "Back to Lesson 15". Next is ordinary (Lesson 16 is in `LESSONS`).

## 7. Accessibility

As Lesson 14's (`docs/lesson-14/04` §7): names stay short, and the lead is explained once, at the top. The hum is a
sound: the by-ear question is where a screen-reader user meets it.
