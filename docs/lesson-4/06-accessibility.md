# 06 — Accessibility

Lesson 3's rules apply unchanged: keyboard order, focus after a group change, reduced motion, 44px targets,
`aria-live` on the verdict, the skip link, and `tabindex="-1"` on the headings focus moves to. Read
`docs/lesson-3/06-accessibility.md` and follow it. This file is only what is **different**, and one thing that is
worse.

## 1. A combining mark is not reliably announced

`بَ` is two characters. What a screen reader says for them is not predictable:

- some read the base letter and **ignore the mark entirely** — "beh", which is the answer with the question thrown
  away;
- some read the mark as its Unicode name — "arabic letter beh, arabic fatha";
- some read the pair as a syllable — "ba".

The same class of problem as Lesson 3's zero-width joiner, and the same rule follows: **the glyph is
`aria-hidden`, and its container carries the accessible name** — "Baa with zabar", built from the same template the
sighted student reads.

This applies to the board tiles, the choice buttons and the prompt.

## 2. The honest limit — say it out loud

For a student using a screen reader, Lesson 4 **as it stands cannot be answered**:

| Format | Prompt | Choices | Usable? |
|---|---|---|---|
| `mark-to-name` | a glyph | names | no — naming the prompt gives the answer away |
| `name-to-mark` | a name | glyphs | no — naming each choice gives it away |
| `sound-to-mark` | **a recording** | glyphs | **yes** — the prompt is audio, the choices need names only to be told apart |

Lesson 3 hit the first two and accepted them ("inherent to a question about a shape",
`docs/lesson-3/README.md` "as built" §9). Lesson 4 is the same, with one difference that matters: **the format that
fixes it already exists and is waiting on recordings.** `sound-to-mark` is the accessible path, and it is also the
format that teaches what the lesson is actually for (`03-the-pool-and-formats.md` §5).

So:

1. Build `sound-to-mark` now, guarded, as specified.
2. Put it first in the preference order **the moment the `fatha` recordings exist** — one line in
   `mark-lesson.js`, and it should be a one-line change rather than a restructure.
3. Until then, the board's tiles still work with a screen reader (name and, once recorded, sound), so the
   *teaching* half of the page is usable even while the *testing* half is not.

Do not paper over this with a hidden "the answer is Baa with zabar" label, and do not claim in
`design-system/quran-landing/pages/qaida.md` that the lesson is accessible. It is a real gap with a known fix, and
it is listed in `09-open-questions.md` §6.

## 3. The two progress numbers, each labelled

As Lesson 3: the bar is the whole lesson, the line under the rail is this group, and each says which it is. A
screen reader user must never meet two unexplained numbers that disagree — which is also why neither is spoken as
a number any more (`05-wording.md`, progress in plain words).

## 4. The tracer opens the letter **with** its mark

The one place Lesson 4 deliberately differs from Lesson 3, which opens the isolated letter.

Writing the mark **is** the lesson. A student who writes ب and stops has not written what they were asked for, and
the mark is the part with a real chance of being drawn in the wrong place or the wrong direction.

Two consequences for `trace.js`, which already takes a glyph and a title:

- **The guide glyph is `letter + mark`.** `trace.js` draws the guide onto its own canvas and centres it on its
  *ink*, measured with `measureText` (step 3, 2026-09-18) — so it centres the pair, not the letter, and the letter
  will sit slightly lower in the square than it does in Lesson 1. That is correct and needs no change.
- **The title says both**: "Trace Baa with zabar", from the item's `name`.

Check in a browser that the mark is actually in the guide and has not been dropped by the canvas measurement — it
is a small, faint stroke at the top of the ink box, and it is exactly the thing a measuring bug loses.

## 5. Reduced motion

Unchanged. Nothing travels; the board still swaps, the rail still fills, the verdict still changes — instantly
instead of gliding. Lesson 3's `still()` helper is copied with the rest of the page.

## 6. Colour is never the only signal

Relevant here because of `04-page-and-design.md` §3's halo: if the mark is pointed at with a ring or a tint, the
same information is in the words under the tile ("The letter with zabar"). A student who cannot see the halo loses
nothing.
