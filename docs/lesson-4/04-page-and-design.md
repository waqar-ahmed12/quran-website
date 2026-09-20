# 04 — The page

`lesson-4.html` is **Lesson 3's page with the board changed**. Same top bar, same rail, same two-step shape, same
drill, same tracer, same chooser, same footer. What is new is what sits in Step 1, and it is much simpler than
Lesson 3's table.

Copy `lesson-3.html` and delete rather than write from scratch. Everything in `qaida.css` that Lesson 3 added —
the rail, the sticky behaviour, the tiles, the two-step headings — is reused unchanged.

## 1. The skeleton

```
skip link
topbar        theme · mute · Board · Options            (unchanged)
  h1          Zabar            [ بَ ]                    the title changes with the name set — §2
  lede        The mark that turns a letter into a sound.
  progress    the bar, and a few plain words             no numbers (the user, 2026-09-20)
  rail        two groups, sticky under the top bar       Lesson 3's nav, two items instead of six
  section     Step 1 · Look at the mark                  §3
  section     Step 2 · Now practise                      the drill, unchanged from Lesson 3
  footer      Back to the Qaida · Next: Zair             §5
  dialog      the tracer / writing board                 unchanged
  dialog      the first-visit chooser                    unchanged
```

## 2. The title changes with the name set

The first page in the Qaida where this happens. `shell.LESSONS[3].title` is already
`{ fatha: 'Fatha', zabar: 'Zabar' }`, and the home page already reads it — the lesson page must do the same, rather
than hard-coding either word.

So the `h1` carries **two** text fields, in the one attribute `qaida-options.js` already understands —
`data-words-attr="attribute|label;attribute|label"` (`qaida-options.js:479-494`):

```html
<h1 data-words-attr="data-title-zabar|Lesson title (zabar);data-title-fatha|Lesson title (fatha)"
    data-title-zabar="Zabar" data-title-fatha="Fatha">Zabar</h1>
```

**Not `data-words`.** A `data-words` field edits the element's own `textContent`, and `mark-lesson.js` rewrites
that `textContent` on every name-set change — the two would fight, and the teacher's edit would vanish at the next
switch. Editing an *attribute* calls the panel's `redraw()`, which is exactly the hook that lets the page put the
new word on screen.

Every line that names the mark works this way, which is most of `05-wording.md`: the page fills `{mark}` from
`marks.nameOf()` on load and again on `shell.onChange`.

The large glyph beside the title (`data-titlemark`) is **بَ** — the lesson's subject in one glyph, the same way
Lesson 3 used ـهـ.

## 3. Step 1 — the board

Three things, in this order. All of them are a *look*, none is a drill.

### a. The mark on its own

The mark drawn alone, large, with its name under it.

**Use U+25CC DOTTED CIRCLE as the carrier** — `◌` + the mark. That is what the character is for, it is what
every Arabic font expects when a combining mark appears with no base, and it is what a typography reference shows.
A bare combining mark with nothing before it renders as the browser's own fallback dotted circle in some faces and
as nothing at all in others.

### b. The pair

The same letter twice, bare and marked, with the name under each:

```
ب  →  بَ
Baa    Baa with zabar
```

Then the group's other letters as pairs, or as marked tiles with the bare letter small beneath — one of them looks
better and neither can be chosen in words, so build both and put them on a row in the options panel
(`07-options-panel.md` §3, "The board shows").

**Do not try to colour the mark on its own.** A combining mark wrapped in its own `<span>` to tint it is the
obvious idea and it is fragile: shaping happens across the whole run, and in some faces the span breaks the
attachment and you get ب◌َ. If the mark needs pointing at, draw a **halo** — an absolutely-positioned ring or a
soft highlight over the top third of the tile — which touches no text at all. Offer the tinted version as a tryout
row if the teacher wants to see it, and expect it to look wrong in at least one face.

### c. The note about joined letters

One line and one example: **بَبَ** — the mark travels with the letter wherever it sits. This is the bridge back to
Lesson 3, it is what a printed Qaida shows at this stage, and it is **not drilled**
(`01-what-it-teaches.md` decision 1). Build it from `shapes.js`'s `FORM` helpers rather than pasting a joiner:
Lesson 4 loads `shapes.js` anyway for this one line.

Under it, the note that it is not a word — the same caution `docs/lesson-3/05-wording.md` puts under its
joined-up demo.

### Tap to peek

Every tile on the board is a button. Tapping it shows the name and plays the sound, exactly as Lessons 1 and 3 do:
the marked tiles ask `qaidaAudio` for the **`fatha`** group, the bare ones for `letters`. A speaker mark appears
only where there is a real recording. Today that is nowhere in the `fatha` group, so the board plays the stand-in
hum and the line under the bar says how many recordings are in — unchanged behaviour, no special case.

**A "Practise this group" button** under the board takes the student down to Step 2, as Lesson 3 has
(`docs/lesson-3/README.md` "as built" §15).

## 4. Step 2 — the drill

Lesson 3's drill markup, unchanged. The prompt tile, four choices, the verdict line, "Write it", the advice line,
the finished line.

Two details carry over and must not be lost:

1. **The prompt needs room above and below.** A marked letter is taller than a bare one, and seven letters hang
   below the line (`02-the-mark.md` §4). Lesson 3 already widened `.prompt` for this
   (`:root[data-band] .prompt`); Lesson 4 needs the same, for the opposite end of the glyph.
2. **"Write it" opens the tracer on the letter *with* its mark** — not on the bare letter as Lesson 3 does. See
   `06-accessibility.md` §4 for why, and for what the guide glyph has to be.

## 5. The footer

`Back to the Qaida` · `Next: Zair` (or `Next: Kasra`) — a real link once `lesson-5.html` exists, and the
"not built yet" note until it does, which is how Lesson 2 waited for Lesson 3. The Next label, like everything
else that names a mark, switches with the name set.

## 6. What `qaida.css` needs

Very little. In order of how likely you are to need it:

| Need | Where it comes from |
|---|---|
| the rail, sticky, fills, states | Lesson 3's `.bands`, unchanged — two items instead of six |
| the two step headings and their guides | Lesson 3's, unchanged |
| the board's tiles | Lesson 3's shape tiles, unchanged (`data-tiles`, `data-size` drive them) |
| **the pair layout** (bare → arrow → marked) | new, a few lines of flex |
| **the mark's halo** | new, an `::after` ring positioned over the tile's top third |
| **room above the glyph** | new: the marked tiles and `.prompt` need `padding-block-start`, mirroring what Lesson 3 added at the bottom |

Anything new goes in the same place Lesson 3's additions went, and anything that is a *tryout* goes in the TRYOUT
block, which is deleted at step 13 with the options panel.
