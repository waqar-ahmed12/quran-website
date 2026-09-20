# 02 — The forms: how a joined shape is produced

This file is the data layer. It settles how a positional form is written in HTML, which forms exist, and what
changes when the script changes. Everything here belongs to `lesson-3.js`; **none of it goes in `practice.js`**,
which must not learn that its items are letters (`docs/lesson-2/02-practice-engine.md` §1).

## 1. Use ZWJ, not presentation forms, not tatweel

A letter's shape comes from its neighbours. To show one form *on its own*, give it an invisible neighbour:
**U+200D ZERO WIDTH JOINER**.

| Form | String | For ب |
|---|---|---|
| isolated | `ب` | ب |
| initial | `ب\u200D` | بـ |
| medial | `\u200Dب\u200D` | ـبـ |
| final | `\u200Dب` | ـب |

**Why this and not the alternatives:**

- **Presentation forms (U+FE70–U+FEFF)** — `ﺑ` *is* initial baa, and it works. But there is one codepoint per
  form per letter, so it is a 116-entry hand-typed table, it does not exist for the Indo-Pak forms ک ہ ی in any
  useful way, and a typo produces a *different valid letter* rather than a visible error. Keep it as the fallback if
  a specific font misrenders a specific ZWJ form, and say in a comment which letter forced it.
- **Tatweel (U+0640, `ـب`)** — this is what print uses, and it is what most people reach for first. It draws a real
  kashida stroke, so the student is shown a connecting line that will not be there in a word. It also changes the
  letter's width, which breaks the four-column table. Do not use it.

**Write them as escapes, not as literal characters.** `'\u200D' + glyph` in the source, never a pasted ZWJ. A
literal ZWJ is invisible in every editor and diff; the next person to touch the file will delete one by accident.

```js
const ZWJ = '\u200D';
const FORM = {
  isolated: (g) => g,
  initial:  (g) => g + ZWJ,
  medial:   (g) => ZWJ + g + ZWJ,
  final:    (g) => ZWJ + g,
};
```

## 2. Which letters take which forms

Three classes. The class is a property of the letter and is the same in both scripts.

| Class | Letters (Madani) | Joins forward? | New shapes to drill |
|---|---|---|---|
| `standalone` | ء | no, and no backward join either | **none** |
| `back-only` | ا د ذ ر ز و | **no** | **1** — the back-joined form |
| `both` | everything else (22 letters: bands 3 and 4, plus ط ظ) | yes | **3** — initial, medial, final |

**`back-only` is the whole of band 1.** For these six, `initial` renders identically to `isolated`, and `medial`
renders identically to `final`, because there is nothing after them to join to. Showing four columns would show two
pairs of identical pictures and teach the student to doubt their own eyes. Show **two** columns — *on its own* and
*joined to the letter before* — and drill the one new shape.

**ء is shown and never drilled.** It sits on band 1's board with a line of its own saying it never joins to
anything. There is no second shape, so there is nothing to tell apart, so there is no question to ask.

**ط ظ are `both`, but only one item each** (`01-what-it-teaches.md` §3, decision 3). Their four forms differ only
in the connecting strokes; three questions about them would be three pictures of the same loop. The board still
shows all four columns — the point being made is "look how little changes" — but only the medial form becomes an
item.

## 3. The joined-up demo

Beside each letter's forms, the board shows it joined up, the way a printed Qaida does. Two cases:

- **`both` letters — joined to itself, three times.** `glyph.repeat(3)` — `'ببب'` — with no ZWJ at all: real
  adjacent letters join on their own. One string shows initial + medial + final at once, which is the whole point.
- **`back-only` letters — flanked by baa: `'ب' + glyph + 'ب'`.** For د that is `بدب`, which renders with ب–د joined
  and **د–ب not joined**. That gap is band 1's entire lesson, shown rather than described. `ببب` would be useless
  here, because ددد joins nowhere and just looks like three loose letters.

ب is the carrier because it is the most regular connector in the alphabet and the student has known it since
Lesson 1. It is **not** a word and must never be presented as one; `05-wording.md` gives the line that says so.

## 4. The two scripts

The script choice changes the letters themselves (`QAIDA-BUILD.md`, decided 2026-09-18), and Lesson 3 is where that
costs the most:

| Madani | Indo-Pak | Why it matters here |
|---|---|---|
| ك | ک | Different isolated shape; the initial/medial "small kaf" differs too |
| ه | ہ | The hardest letter in the lesson in **both** scripts, and they disagree about all four forms |
| ي | ی | Indo-Pak drops the two dots in the isolated and final forms |
| order: … ه و ء ي | order: … و ہ ء ی | و comes before ه/ہ |

**Build the form table from `shell.lettersOf()`, never from a hardcoded list.** `shell.lettersOf(script)` already
returns the right 29 in the right order for the chosen script; the class table in §2 is keyed by
`shell.keyOf(glyph)`, which folds ک ہ ی onto ك ه ي, so one class table serves both scripts.

**Item ids must be folded the same way**, exactly as `lesson-2.js:80` does:

```js
const id = shell.keyOf(glyph) + ':' + position;   // 'ه:medial'
```

so a student who masters ـهـ in Madani keeps the credit after switching to Indo-Pak. The *glyph* shown comes from
the chosen script; the *id* is the fold. Ids stay well under `shell.js`'s 24-character cap.

## 5. What has to be looked at in a browser

The ZWJ forms are the one part of this lesson that cannot be checked by reading the code. Every form must be
confirmed to render as a real joined shape — **not** a dotted circle, not a box, not the isolated form with a gap —
in **both** Arabic faces and in light and dark. `08-files-and-steps.md` has this as a blocking checklist item. The
ones to look at first, in order: **ہ / ه**, **ع غ**, **ک / ك**, **م**, then the `back-only` six.
