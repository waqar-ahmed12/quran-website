# 06 — Accessibility

The baseline is `design-system/quran-landing/pages/qaida.md` §6 and `docs/lesson-2/06-accessibility.md`, both of
which still apply. This file covers only what Lesson 3 adds — and it adds the worst accessibility problem in the
whole Qaida.

## 1. The ZWJ problem, and the rule that fixes it

A joined form is not a word, not a letter, and not pronounceable. `\u200Dه\u200D` reaches a screen reader as haa
wrapped in two invisible control characters. Depending on the reader it is announced as "haa", as nothing at all,
or as a stream of "zero width joiner".

**The rule: every element containing a ZWJ form is `aria-hidden="true"`, and its container carries the name.**

```html
<button class="letter" aria-label="Haa, middle of a word">
  <span class="glyph" lang="ar" dir="rtl" aria-hidden="true">&#x200D;&#x647;&#x200D;</span>
</button>
```

This is exactly what Lesson 1's tiles and Lesson 2's glyph choices already do (`lesson-2.js:154-158`) — the pattern
exists, and Lesson 3 must not be the page that forgets it. The label comes from the item's `name`, which is built
from the position templates in `05-wording.md`, so a screen-reader user hears "Haa, middle of a word" and a sighted
user sees the shape. Neither is told less than the other.

**Write the ZWJ as `&#x200D;` in HTML and `'\u200D'` in JS.** A literal character is invisible in review.

The board's **column headings** are real text and are not hidden — they are how a screen-reader user navigates the
row at all.

## 2. The board as a table

Band 5's board **is** a table and must be marked up as one: `<table>`, a `<caption>`, `<th scope="col">` for the
four positions and `<th scope="row">` for each letter's name. That gives row/column announcement for free, which
no amount of `aria-label` on a grid of buttons will match.

Bands 1 to 4 show two to twelve rows of the same shape and should use the same table markup, for consistency and so
the column headings are associated. The tiles inside the cells stay `<button>`s — they are tappable and they peek.

Where the table scrolls horizontally (`04-page-and-design.md` §6) its container needs `tabindex="0"` and
`role="region"` with an `aria-label`, or a keyboard user cannot scroll it.

## 3. The band rail

- A real `<nav>` with an `aria-label`, containing an `<ol>` — it is an ordered sequence and saying so is free.
- The current band carries **`aria-current="page"`**, not a class alone.
- Every band button is **enabled**. Nothing is `aria-disabled`, because nothing is locked
  (`01-what-it-teaches.md` §1). A disabled control here would be a lie about the design.
- Each button's accessible name includes its state, so it does not rely on the gold: `"Group 3, a tooth and a tail,
  you're here"`.
- The band's progress fill is decorative; the numbers are in the text. Never colour alone.

## 4. Tracing the right thing

`window.qaidaTrace.open(glyph, name)` draws the glyph it is given. **Pass `item.base`, not `item.glyph`** — the
isolated letter, not the ZWJ form:

```js
qaidaTrace.open(item.base, item.name);
```

Two reasons. A ZWJ form's leading joiner produces a stray connecting stroke in the tracer's outline, which the
student would faithfully copy. And a beginner learning to write forms the letter body first; the joining strokes
come from the neighbours. The button therefore says **"Write it"**, not "Trace it" (`05-wording.md`).

`item.traceable` must be set explicitly to `true`. The engine's default is
`Boolean(glyph) && glyph.length <= 2` (`docs/lesson-2/02-practice-engine.md` §2), and a medial form is three
characters long, so every medial form would silently lose its Write button.

## 5. Keyboard

Everything Lesson 2 settled carries over unchanged: Enter and Space answer, focus never moves out from under the
keyboard on a right answer (`lesson-2.js:254`), Next takes focus to the first choice of the new question.

New here:

- The rail is reachable by Tab and its buttons work with Enter and Space. **Arrow keys are not required** — five
  buttons is not enough to justify a roving tabindex, and `ui-ux-pro-max`'s rule is that a custom key handler must
  be worth the surprise.
- Changing band moves focus to the board's heading (`tabindex="-1"`), not to the first tile — the student needs to
  be told where they landed before being put inside a grid.
- The board's tiles are in DOM order **isolated → initial → medial → final**, matching the visual order in an RTL
  container. Check this with the keyboard, not by eye; it is the easiest thing in this lesson to get backwards.

## 6. Announcements

`.announce` is the existing polite live region. It announces the question number, as Lesson 2 does. Lesson 3 adds
exactly one more announcement: **the band changed**, as `"Group 3, a tooth and a tail. 12 shapes."` Do not announce
the board redrawing, the rail fill, or each peek — a live region that speaks on every interaction is noise, and the
student has a drill to concentrate on.

## 7. Targets and contrast

Unchanged and non-negotiable: every tappable thing at least 44px (tiles 72px and up), 2px gold focus rings 3px out,
gold on dark 8:1, ink on paper 13:1. The band rail's buttons are 44px tall including their fill.

The one new risk is the band-5 table on a phone: four columns of 72px tiles plus a name column does not fit in
375px. It scrolls (`04-page-and-design.md` §6) rather than shrinking the tiles below 44px. **Do not shrink the
tiles to make it fit.**
