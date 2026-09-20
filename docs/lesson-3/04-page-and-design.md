# 04 — `lesson-3.html` and its design

The page is **Lesson 2's page with a board above the drill and a band rail above that.** Copy
`site/qaida/lesson-2.html` and change what this file names; do not start from a blank document, and do not start
from `lesson-1.html`.

## 1. Copied from Lesson 2 unchanged

Take these across as they are. They are already built, already checked, and already have their wording fields.

| Part | Note |
|---|---|
| `<header class="topbar">` with **Board**, **Mute**, **Settings**, **Theme** | the Board button is required in every lesson (the user, 2026-09-19) |
| `<dialog class="tracer">` and its `.board` / `.board-tools` | copied verbatim; `trace.js` needs no change |
| `<dialog class="chooser">` | verbatim |
| `.drill` — `.ask`, `.prompt`, `.choices`, `.verdict`, `.after`, `.struggle`, `.announce` | verbatim; only the wording changes |
| `.progress` — text, bar, "Start again" | verbatim |
| `<footer class="lesson-end">` — ornament, end line, Next button | Next points at Lesson 4 and says "not built yet" |
| `.note`, `.top-sentinel`, the skip link, the theme script in `<head>` | verbatim |

`.ask` stays a `<p>`, not an `<h2>` — `docs/lesson-2/README.md` settled that, and the heading order stays h1 → h2.

## 2. What is new: the band rail

Directly under the lesson head, above the progress bar. It is the spine of the lesson and the only genuinely new
component.

```html
<nav class="bands" aria-label="The five groups of letter shapes">
  <ol>
    <li><button class="band" type="button" data-band="1" aria-current="true">…</button></li>
    …
  </ol>
</nav>
```

Five buttons in a row, right to left is **not** required here — the bands are an English-language sequence, so the
rail runs left to right like the rest of the page furniture. Each button carries:

- the band's **number**, in Cinzel gold caps, as the `eyebrow` elsewhere on the site;
- its **short name** ("Never join forward", "Never change", "Tooth and tail", "Shape-shifters", "The whole table");
- a **sample glyph** in the chosen script — د · ط · ب · ه · ﻻ-free, one letter, at the tile's ink colour;
- a thin **fill** showing that band's known-of-required, the same gold as the main bar, at 2px.

States, using the vocabulary the home already uses (`docs/lesson-2/09-going-in-order.md`):

| State | When | Look |
|---|---|---|
| **Finished** | every required form in it is known, or the band has been passed | gold hairline, small gold star |
| **Now** | the band the drill is set to | gold number, gold 2px underline, `aria-current="page"` |
| **Later** | after the current one | quiet, **still a real button** |

**No locks.** Every band button is enabled at all times (`01-what-it-teaches.md` §1). Tapping a band that is not the
next one shows the advice line once — reuse the `.struggle` strip's look, not a dialog; a dialog inside a lesson for
something this small is heavier than the decision deserves.

At 560px and under the rail scrolls horizontally with `scroll-snap-type: x mandatory`, the current band snapped into
view, and the sample glyph is dropped before the name is.

## 3. What is new: the shapes board

Between the rail and the drill. This is the *teaching* half; the drill below it is the *testing* half. It shows the
current band's letters only — except on band 5, where it shows all 29 and the drill is hidden.

Per letter, one row:

```
 [ letter name ]   on its own │ start │ middle │ end        ببب
```

- **Columns** are `isolated · initial · medial · final` for `both` letters; **two columns** — *on its own* and
  *joined to the letter before* — for the six `back-only` letters (`02-the-forms.md` §2). Never show four columns
  containing two pairs of identical shapes.
- **Each form is a tile**, reusing `.letter` from Lesson 1 — same paper/outline/gold-ink looks, same `--tile` width,
  same 8px corners, same focus ring. Tap to peek shows the position under it, exactly as Lesson 1 peeks the name.
- **The joined-up demo** sits at the end of the row, at the same size, in a tile with no edge, so it reads as an
  example and not as a fifth form.
- **Column headings** appear once at the top of the board, not per row, and are `sr-only` below 560px where the
  order alone carries it.
- The board is `dir="rtl"` so the forms run in the direction the script does; the row's name label sits outside it,
  `dir="ltr"`.

**ء gets a row with one tile and a line instead of columns** (`05-wording.md`).

**Band 5's board is the table.** All 29 letters, four columns, sticky column headings, and nothing else — no demo
column, to keep it photographable. The drill section is `hidden`, and the end-of-lesson footer moves up under it.

## 4. Motion, and what not to animate

From `design-system/quran-landing/pages/qaida.md` §5, unchanged: only `transform` and `opacity`; 700–800ms
`cubic-bezier(0.16, 1, 0.3, 1)` for arrivals; 200ms for hovers and colour.

| What | How |
|---|---|
| Band change | the board's rows leave at 150ms and the new band's arrive staggered 35ms apart, the same replay as `.choices` |
| The rail's fill | `scaleX`, 700ms |
| A band reaching "ready" | its rail button's star turns in once, 600ms. **Once** — not `infinite`; that bug is on the record from step 1 |
| Peek on a form tile | Lesson 1's `data-peek` behaviour, inherited |

**Reduced motion:** no arrival, no stagger, no star turn; every change instant. The board still changes, it just
does not travel.

## 5. Colour, and the wrong answer

No new tokens. The wrong answer stays as Lesson 2 built it and as the user approved on 2026-09-19: **gold against
dim, with a tick on the right one — never a failure colour, and never colour alone** (`lesson-2.js:243`).

The one addition: on the board, the form the student just missed keeps a gold edge until the next question, so the
eye is sent back to the teaching half rather than only to the correction. That reuses `data-seen`'s `edge` look; no
new CSS colour is introduced.

## 6. Widths

Content at most 60rem, as the rest of the Qaida. The band-5 table is the only thing on the site allowed to exceed
it: it may go to 72rem, and below 900px it scrolls horizontally inside its own container with the letter-name
column stuck to the start edge. Checked by reasoning at 375 / 768 / 1024 / 1440; confirmed in a browser by the user.
