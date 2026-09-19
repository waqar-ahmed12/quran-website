# 06 — Accessibility

Against `design-system/quran-landing/pages/qaida.md` §6, which Lesson 2 must not weaken.

## 1. Structure

`<h2 class="ask">` carries the question and changes with it. The choices are plain `<button>`s inside:

```html
<div class="choices" role="group" aria-labelledby="ask">
```

Not a `radiogroup`. A group of buttons that answer immediately is not a set of radios, and giving it radio
semantics promises arrow-key navigation and a separate submit that don't exist.

## 2. Keyboard

- **Plain Tab order.** Four choices, four tab stops, Enter or Space answers. No roving `tabindex` — see above. No
  digit shortcuts; they are undiscoverable and nothing on the page could advertise them without clutter.
- After a verdict, focus moves to **Next** — **except** on pointer-driven auto-advance, where focus is left alone
  and the new question is announced instead.
- **A right answer auto-advances after a short pause — unless it was answered from the keyboard.** Moving focus out
  from under someone mid-thought is the classic drill accessibility bug. Key the behaviour off the click event's
  `detail` / `pointerType` rather than off a setting, so it is right by default for everyone.
- **A wrong answer never auto-advances.** The student decides when they have finished looking at it.
- Escape does nothing at drill level. The tracer (`trace.js:222`) and the chooser (`shell.js:331`) keep their own
  handling, and a drill-level Escape would fight them.
- The global `button:focus-visible` ring (`qaida.css:100-103`) covers everything new: 2px gold, 3px out.
- The skip link and `tabindex="-1"` on `.lesson` are copied from Lesson 1 and must keep working — `tabindex="-1"`
  is what makes focus actually move, and it was a real bug in the first draft.

## 3. Announcements

Two live regions, **both present and empty at first paint**. A region inserted at the moment of its first message
is not announced — that is the mistake to avoid.

```html
<p class="verdict" role="status" aria-live="polite" aria-atomic="true"></p>
<p class="sr-only" role="status" aria-live="polite"></p>
```

- The **verdict** region carries "Right — Alif." / "That one is Baa. This is Taa."
- The **second** region carries one short line per new question: "Question 8." The question heading is *not* a live
  region — announcing the whole board on every question is noise, and it fights the verdict.
- `.note` (`role="status"`, `qaida.css:1185`) stays for stand-in messages only, as on the other pages.

## 4. Names and labels

- Each `.choice` is named by what it shows: the name for a name choice; for a glyph choice, `aria-label` = the
  letter's name, with the glyph `aria-hidden` — the same pattern as Lesson 1's tiles (`qaida.js:220`).
- The progress bar is a `progressbar` labelled by its progress line, with `aria-valuenow`, `aria-valuemax` and an
  `aria-valuetext` carrying the sentence, so it reads "17 of 29 letters known" and not "17".
- Decorative SVG is `aria-hidden="true" focusable="false"`.
- Arabic is live text with `lang="ar"`, and `dir="rtl"` wherever letters are shown.

## 5. Targets, contrast, motion

- Every target at least 44px. `.choice` at least 56px tall; glyph choices 68px and up. **Hear it / Trace it /
  Next** reuse `.button.quiet` at 40px — that is the existing exception, already in the design record.
- Contrast is unchanged: gold on dark 8:1, deep gold on ivory 4.8:1, ink on paper 13:1, names on paper 6:1.
- **Right and wrong are never colour alone.** The verdict sentence says which, in words, every time.
- **Reduced motion:** add `.choice`, `.choices`, `.prompt` and `.after` to the kill-switch list at
  `qaida.css:1428`. No arrival, no stagger, no cross-fade; every change instant.

## 6. The honest problem

`glyph-to-name` asks the student to look at a shape; `name-to-glyph` asks them to pick one out. **Neither has a
non-visual equivalent**, and a screen reader voicing `lang="ar"` text may simply read the prompt aloud — which is
the answer.

`sound-to-glyph`, with name-labelled choices, **is** fully answerable without sight. It is the real accessible
path, and it needs recordings that do not exist yet.

There is no honest fix available now. Do not paper over it: do not disable the screen reader's access to the
Arabic, and do not claim in the markup that the drill is something it isn't. Two things to do instead:

1. Build `sound-to-glyph` now, so the day the recordings land it works.
2. Put the question in `10-open-questions.md` for the teacher: once recordings exist, should the sound format be
   preferred for assistive technology automatically, or should the page simply say plainly that Lesson 2 is a
   sighted exercise and point at Lesson 1, which is not?
