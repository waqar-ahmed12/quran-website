# 4. Where it appears — every lesson

The user's requirement is *"in every lesson, because thats important"*. That is two separate things, and both are
needed:

- **Always reachable**, from the top bar, whether or not a letter is in front of you — the same decision the user
  already made about the writing board (*"we don't know when someone would need to write"*, 2026-09-19).
- **On the letter you are looking at right now**, next to "Hear it" — because a student who has just been told what
  a letter is should be able to say it back in the same breath.

## 1. The top bar — every lesson page

Beside **Board**, before the mute switch. Same `.tool` class, same shape.

```html
<!-- Say it and listen back: on every lesson, at any time. Opens on the letter last looked at, or blank. -->
<button class="tool open-echo" type="button" aria-haspopup="dialog">
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
  </svg>
  <span class="word" data-words="Top bar: say it button">Say it</span>
</button>
```

`voice.js` wires **every** `.open-echo` on the page, exactly as `trace.js` wires every `.open-board`:

```js
for (const button of document.querySelectorAll('.open-echo')) {
  button.addEventListener('click', () => open(...(window.qaida && window.qaida.lastItem ? … : [])));
}
```

Tapped with a letter in view, it opens on that letter. Tapped with nothing in view, it opens the no-item state —
record yourself, hear yourself, kept under nothing. `lastItem` is one line added to each lesson's existing view
object (§3); if a lesson does not expose one, the button still works and opens blank.

**On a phone the top bar is now four tools plus Board's word.** The existing CSS already hides `.tool .word` at the
narrow breakpoint; check that Say it's word goes with it, and that the four icons do not wrap. This is item 4 on the
preview checklist.

## 2. Lesson 1 — the strip under the letters

`lesson-1.html`'s `.current` strip already holds **Hear it again** and **Trace it**. A third button goes between
them, in that order — hear, say, write, which is the order a lesson actually happens in.

```html
<button class="button quiet current-say" type="button" aria-haspopup="dialog">
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
  </svg>
  <span data-words="Say it button">Say it</span>
</button>
```

`qaida.js` gains one handler beside the existing `.current-trace` one:

```js
current.querySelector('.current-say').addEventListener('click', () => {
  if (window.qaidaEcho) window.qaidaEcho.open('letters', view.glyph, view.name);
});
```

Three buttons and a letter is the most the strip can hold. If it crowds on a phone, the strip wraps — it must not
become a scroller.

## 3. Lessons 2, 3, 4, 5 — the after-answer strip

All four already have a `.after` strip holding **Hear it**, **Trace it** / **Write it** and **Next**. The same button
goes in, between Hear and Trace, with `class="say"`. The strip is the same in all four pages, so this is the same
edit four times.

**`lesson-2.js`** — beside the existing `.hear` handler at `lesson-2.js:278`:

```js
after.querySelector('.say').addEventListener('click', () => {
  const v = view.verdict;
  if (v && v.item.audio && window.qaidaEcho) {
    window.qaidaEcho.open(v.item.audio.kind, v.item.audio.glyph, v.item.name);
  }
});
```

**`lesson-3.js`** — the same, and the glyph is `item.audio.glyph`, which is already the **isolated** letter rather
than the joined shape. This is right: "Write it" makes the same choice, and a student cannot be asked to pronounce a
middle form differently from a letter.

**`mark-lesson.js`** — the same, beside the `.hear` handler at `mark-lesson.js:821`. `item.audio.kind` is already the
mark's audio key (`fatha`, `kasra`), so lessons 4, 5 and 6 are correct with no case analysis. The **name** passed is
`item.name` — "Baa with zabar" — and the panel then asks for the *sound*, not the name (`03-the-panel.md` §1,
`.echo-asks`).

**The struggle strip.** Lessons 2–5 also have an advice strip with its own "Trace it" for a letter being missed
repeatedly. It does **not** get a Say it: that strip is advice about the eye, and adding a third thing to do there
makes advice feel like a chore list. `09-open-questions.md` §4 if the user disagrees.

## 4. Lesson 3's board, and lessons 4–6's board

Both pages have a board of tiles above the drill that already plays a sound when tapped (*"Tap a shape to see where it
sits in a word and to hear the letter"*). They do **not** gain a Say it per tile — 68 tiles with two buttons each is a
wall. The top-bar button covers the board, because tapping a tile sets `lastItem`.

## 5. The dot: knowing you have already recorded something

A small mark on the **Say it** button when a clip for the item in view already exists — the counterpart of the speaker
mark `audio.js` already puts on letters that have a real recording. It is how a student finds their way back to the
letters they have already done.

`voice-store.has(id)` is a single indexed lookup and is called when the item changes, not in a loop over tiles.

**Lesson 1's grid does not get per-tile dots** in this step. 29 lookups on load is cheap, but a second mark on every
tile next to the speaker mark needs the user's eye on it before it is built. `09-open-questions.md` §5.

## 6. Lessons 6–14, when they are written

The block is copied in, exactly as the `.tracer` block is copied in today, and that is all. The list to copy:

1. `<script src="voice-store.js" defer></script>` and `<script src="voice.js" defer></script>` in `<head>`, after
   `audio.js`.
2. The `.open-echo` button in the top bar.
3. The `<dialog class="echo">` block after `<dialog class="tracer">`.
4. The `.say` button in the `.after` strip.

Lessons 6, 9, 11, 13 and 14 need nothing else: `mark-lesson.js` carries the one handler for all of them. **This is
the whole reason to build it at step 7 rather than step 10.**

## 7. The Qaida home, and `recordings.html`

**The home gets nothing.** There is no letter on it to say. Its **Start again** already promises to clear everything,
so it calls `voice-store.clear()` too (`02-capture-and-storage.md` §5) — the only change to `home.js`.

**`recordings.html` gets nothing.** It is the teacher's tool for *their* recordings, it is deleted at step 13, and the
student's clips are not files the teacher collects. Keeping the two apart matters: one is published to the site, the
other never leaves the device.
