# 04 — `lesson-2.html`: the page, the look, the motion

Read `design-system/quran-landing/pages/qaida.md` first — §1 (direction), §2 (tokens), §4 (Lesson 1) and §5
(motion). Nothing here overrides it; this file says how the drill fits inside it.

## 1. Build it from `lesson-1.html`, not from scratch

Copy these blocks **verbatim**. They are already right, already checked by the user, and re-authoring them is how
two pages drift apart.

| `lesson-1.html` lines | What |
|---|---|
| 18-24 | the inline pre-paint theme script |
| 25-28 | the Google Fonts preconnect and link |
| 42-80 | the whole `<header class="topbar">`, including the mute button and its `data-off` / `data-on` |
| 83-110 | `.lesson-head` — but the eyebrow reads "Lesson 2 of 14", and `class="now"` moves to the **second** `<li>` of `.track` |
| 113-131 | the whole `.progress` block, including `.sound-note` |
| 198 | `<p class="note" role="status">` |
| 202-226 | the whole `<dialog class="tracer">` — `trace.js` bails silently if it is missing (`trace.js:10-11`) |
| 229-285 | the whole `<dialog class="chooser">` |
| 160-195 | `.lesson-end` — the ornament, `.end-line`, and `.onward` with its two buttons |

The `<span class="title-mark">` should hold **ب** rather than ا, so the two lessons don't look identical at a
glance; `data-titlemark="ba"` accordingly.

Script tags, `defer`, in this order:

```html
<script defer src="shell.js"></script>
<script defer src="audio.js"></script>
<script defer src="trace.js"></script>
<script defer src="practice.js"></script>
<script defer src="lesson-2.js"></script>
<script defer src="qaida-options.js"></script>
```

## 2. What replaces the letter grid

Lesson 1's `<section class="letters-wrap">` and its `.current` strip come out. In their place:

```
<section class="drill">
  <h2 class="sr-only">…</h2>
  <p class="ask" id="ask">              the question, changes per question
  <div class="prompt">                  the large glyph, or the name, or a Play button
  <div class="choices" role="group" aria-labelledby="ask">
    <button class="choice">  ×4         data-face="glyph|name", data-verdict="right|wrong|dim"
  <p class="verdict" role="status" aria-live="polite" aria-atomic="true">
  <div class="after" hidden>            after a miss: the letter, Hear it, Trace it, Next
  <p class="tally">                     the quiet session line
</section>
```

`.after` is a strip, not a dialog — a dialog would take focus and hide the choices the student is trying to learn
from. It exists for the same reason Lesson 1's `.current` does: a choice is itself a `<button>` and cannot hold
buttons of its own.

## 3. New CSS — seven classes

| class | what |
|---|---|
| `.drill` | the section wrapping question, choices and verdict |
| `.ask` | the question line |
| `.prompt` | the large glyph, the name, or the Play button |
| `.choices` | the 2×2 / 1×4 grid |
| `.choice` | one answer button |
| `.after` | the strip under a wrong answer |
| `.tally` | the quiet session line |

**The one reuse worth naming.** Do **not** restate the tile look for `.choice`. Add `.choice` to the three selector
lists that *define the tile tokens* — `qaida.css:647` (`--tile-bg`, `--tile-scrim`, `--tile-ink`, `--tile-muted`,
`--tile-mark`, `--tile-edge`), `:681` (`[data-tiles='line']`) and `:690` (`[data-tiles='gold']`). The existing
**Paper / Outline / Gold ink** tryout then governs the drill's letter buttons with no duplication, and Options →
Letter tiles keeps working across both lessons. `.choice`'s own block sets size, layout and the verdict states,
nothing else.

**Reused unchanged, no edit:** `.lesson`, `.lesson-head`, `.head-text`, `.course`, `.eyebrow`, `.track`, `.lede`,
`.setup`, `.link`, `.title-mark`, `.progress`, `.progress-row`, `.progress-text`, `.bar`, `.fill`, `.reset`,
`.sound-note`, `.lesson-end`, `.ornament`, `.end-line`, `.onward`, `.button`, `.button.primary`, `.button.quiet`,
`.back`, `.next`, `.note`, `.complete`, `.just-finished`, `.sr-only`, `.topbar` and every child, `.chooser` and
every child, `.tracer` and every child, and the keyframes `rise`, `pulse`, `shine`.

## 4. Sizes and targets

- `.choice` at least **56px** tall; glyph choices use the existing `--tile` sizing and come out 68px and up.
- At 320px a 2×2 grid gives roughly 140px per choice — comfortably over the 44px floor `qaida.md` §6 sets.
- **Hear it / Trace it / Next** reuse `.button.quiet` (40px, `qaida.css:1817`); the end-of-lesson buttons stay
  `.button` (44px).
- The column stays **58rem**, centred, as both existing pages.

## 5. Motion — against `qaida.md` §5

| What | How | Time |
|---|---|---|
| Head and progress arriving | rise 12px + fade, as now | 800 ms, `cubic-bezier(0.16, 1, 0.3, 1)` |
| Choices arriving | rise + fade, 40 ms apart, via `--i` | 700 ms, from 120 ms |
| Question changing | cross-fade out then in | 150 ms out, 250 ms in |
| A right answer lighting | colour and edge only | 200 ms |
| `.after` sliding in | rise 8px + fade | 300 ms |
| Bar fill | `scaleX`, as now | 700 ms |
| Ready | the existing `.complete` / `.just-finished` choreography | 600–2200 ms, **once** |

Only `transform`, `translate`, `scale` and `opacity` animate. The choice stagger belongs **inside** the existing
`no-preference` block at `qaida.css:1380`. Add `.choice`, `.choices`, `.prompt` and `.after` to the reduced-motion
kill-switch list at `qaida.css:1428` — under `prefers-reduced-motion: reduce` there is no arrival and no fade;
every change is instant.

**No red, and no shake.** The palette has no failure colour and this design deliberately adds none. A child studies
on this page, `qaida.md` §1 is "elegant, restrained", and gold-versus-dim is colourblind-safe where red-versus-green
is not. The wording carries the meaning. It is listed for the teacher in `10-open-questions.md`.

## 6. Reading the three states

All three are told in **words as well as** in the bar — progress is never colour alone (`qaida.md` §4).

- **Still going** — the bar counts `known / total` from `drill.progress()`. `aria-valuenow = known`,
  `aria-valuemax = total`, and `aria-valuetext` carries the sentence, so a screen reader hears "17 of 29 letters
  known" rather than "17". `.tally` carries the session: questions asked, letters still to fix.
- **Struggling** — `on.struggling(item)` raises a quiet line naming the letter, with **Look at it in Lesson 1** and
  **Trace it**. It does not interrupt the drill and it does not stack: one line, the most-missed letter.
- **Ready** — `on.ready` fires once. `lesson-2.js` calls `shell.setDone(2, true)`, adds `.complete` and
  `.just-finished` to `.lesson` (reusing `qaida.css:909-931`, `:1092-1172` and `:1411-1418` wholesale, governed by
  the existing `data-finish` tryout), and swaps `.end-line` from `data-before` to `data-after`. **Drilling
  continues** — nothing is disabled, nothing is hidden, and re-entering a finished lesson still drills.

## 7. The Qaida home

`home.js:45` hard-codes `n === 1` for the live "12 of 29 letters seen" line. Widen it by **declaring the kind on
the lesson entry** rather than testing the number, so lessons 3 to 14 never need another `home.js` edit:

- `shell.js` — `LESSONS[0]` gains `progress: 'letters'`; `LESSONS[1]` (`shell.js:103-104`) gains
  `href: 'lesson-2.html', built: true, progress: 'drill'`.
- `home.js` — the branch reads `entry.progress`:

```js
else if (entry.progress === 'letters') { /* the existing seenCount(1) / words.progress line */ }
else if (entry.progress === 'drill') {
  const known = shell.masteredCount(n);
  const total = shell.drillOf(n).total || letters;   // `|| letters` keeps it sensible before the first start()
  meta = known > 0 ? words.known.replaceAll('{known}', known).replaceAll('{total}', total) : words.open;
}
```

- `index.html:108-111` — `<ol class="lessons">` gains `data-known="{known} of {total} letters known"`, and its
  label is appended to the `data-words-attr` string on line 111.

The same `home.js` pass carries `09-going-in-order.md`'s change: the lock goes, and every built lesson's card
becomes a real link.

## 8. `qaida.js` and `lesson-1.html`

Lesson 1's Next button is currently a stand-in that only says "Lesson 2 isn't built yet." (`qaida.js:175-183`,
`lesson-1.html:182-193`). Point it at `lesson-2.html` and drop `data-standin` and its `data-words-attr` entry.
`lesson-1.html:172`'s `data-after` already reads "Every letter seen. Lesson 2 is open." and needs no change.
