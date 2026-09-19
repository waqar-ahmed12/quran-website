# Qaida pages — design record

> **Override file.** For the Qaida pages (`site/qaida/`), these rules override `../MASTER.md`. Anything not covered
> here follows MASTER.md and the home page's choices in `WEBSITE-BUILD.md`.

First written 2026-09-14 with the first draft of Lesson 1. **Rewritten 2026-09-18**, when the Qaida home was built
and Lesson 1 repaired (`QAIDA-BUILD.md`, step 1). Everything below describes what is actually in the files; the looks
marked *default* are Claude's picks and the other choices sit in each page's Options panel until the user chooses.

**Still design only:** the letter names are stand-ins, the Indo-Pak face is a stand-in, and there are no recordings,
no tracing and no whiteboard.

Files:

| File | What it is |
|---|---|
| `site/qaida/index.html` | **the home** — the fourteen lessons |
| `site/qaida/lesson-1.html` | **Lesson 1** — the letters |
| `site/qaida/shell.js` | what both pages share: the saved state, the letters, the fourteen lessons, the first-visit choice, light/dark |
| `site/qaida/home.js` | the home's cards and overall progress |
| `site/qaida/qaida.js` | Lesson 1's tiles, peek and progress |
| `site/qaida/audio.js` | the manifest, the player, what has a recording |
| `site/qaida/trace.js` | the tracing board |
| `site/qaida/audio/manifest.json` | what has been recorded — the only thing that knows |
| `site/qaida/audio/placeholder.wav` | the wordless stand-in, made by `make-placeholder-voice.js` at the project root |
| `site/qaida/recordings.html`, `recordings.js` | **temporary** — the teacher's recording list |
| `site/qaida/qaida.css` | every page |
| `site/qaida/qaida-options.js` | **temporary** — the tryouts and the text fields, localhost only |

Preview: `node serve.js`, then `http://localhost:8777/site/qaida/`.

---

## 1. Direction

**The home page's look, made calm enough to study on.** Same gold, same dark and light grounds, same Cinzel and Jost,
same star mark and 4px buttons, so the Qaida feels like the page the visitor came from. But no dust, no moving light
and no scroll-scrubbed motion: a student looks at these letters for a long time. Nothing on either page moves once it
has arrived — see §5.

**Why not the database's pick.** `ui-ux-pro-max`'s data (`products.csv`, `ui-reasoning.csv`) suggests
claymorphism, bright block colours and gamification for "Educational App", "Language Learning" and "Kids Learning".
Rejected: it would break from the home page, the user's direction is "elegant, restrained" (WEBSITE-BUILD.md §1), and
the student can be any age. Kept from those rows: **progress tracking is a must-have**, shown clearly, and "complex
jargon" is an anti-pattern (hence plain words and the student's own choice of names). Its other anti-pattern, dark mode
for learning apps, is answered by the light/dark switch, shared with the home page.

From `minimalist-ui`: macro-whitespace first, one column, flat tiles and cards with no shadow at rest, hairline
dividers, 8px corners, one quiet rise into view, a background that isn't flat but never busy. Its fonts and pastels are
not used; the home page's fonts and gold win.

---

## 2. Tokens

As the home page (`site/styles.css`), plus:

| Token | Dark | Light | Use |
|---|---|---|---|
| `--color-surface` | `#28221F` | `#FFFFFF` | the first-visit choice panel |
| `--line` | foreground at 12% | foreground at 10% | hairlines, card and tile edges |
| `--paper` | `#EDE4D3` | `#FFFFFF` | "Paper" tiles: the cream of the book's pages on the home page |
| `--edge` | `0.55` | same | how strong the gold edge is — the slider in Options sets it |
| `--paper-edge` | `rgb(198 152 62 / var(--edge))` | `rgb(28 25 23 / calc(var(--edge) × 0.36))` | the warm edge framing a paper tile |
| `--tile-scrim` | the tile's own colour, or the page behind an Outline tile | same | what the peeked name fades into |
| `--ink` | `#2B211B` (13:1 on paper) | `#1C1917` | the letter on a paper tile |
| `--ink-muted` | `#5C4F45` (6:1) | `#57534E` | the name on a paper tile |
| `--ink-accent` | `#A16207` (3.8:1, a 6px dot — 3:1 is the bar for a mark) | `#9A5F07` | the seen mark on a paper tile |
| `--tile` | `clamp(4.25rem, 3.6rem + 1.8vw, 5.5rem)` | same | tile width; Large: `clamp(5rem, 4.4rem + 2.2vw, 6.75rem)` |
| `--topbar-h` | `3.75rem` | same | sticky bar, scroll padding |
| `--gutter` | `clamp(1rem, 3.5vw, 2.5rem)` | same | side padding, never under 16px |

**Arabic lettering** (stand-ins until the teacher checks): Madani `Amiri Quran`; Indo-Pak `Noto Naskh Arabic`
(`typography.csv`'s "Arabic Elegant" pairing). **Launch blocker:** Google Fonts has no true Indo-Pak mushaf face, so
the Indo-Pak script is currently set in a Naskh face that is not what a printed Indo-Pak Qaida looks like. A licensed
one (such as a KFGQPC IndoPak font) must replace it before launch. `Scheherazade New` is a tryout for both.

**Type scale.** Title Jost 300, `clamp(2rem, 1.6rem + 1.5vw, 3rem)`, line-height 1.05, −0.015em · lede Jost 300,
`clamp(0.9rem, 0.85rem + 0.2vw, 1.025rem)`, line-height 1.4, 44ch · small gold labels Cinzel 500, 12px, 0.24em,
uppercase · the name on a tile Jost 500, `clamp(13px, tile × 0.2, 15px)` · the letter itself 58% of the tile width ·
progress line 15px, tabular numbers · end line Jost 300, `clamp(14px, 0.82rem + 0.2vw, 16px)`, 32ch, balanced.
On a card: number Cinzel 500, 13px, 0.12em · title Jost 400, 17px · line Jost 300, 13px · state 11px, 0.1em, uppercase.

Widths: the column is **58rem**, centred, on both pages.

---

## 3. The home — `index.html`

The contents page of the Qaida. It exists so the landing page's **Free Qaida** button lands somewhere that shows the
whole course, rather than dropping a beginner straight into a lesson.

1. **Top bar** (sticky, 3.75rem): star + site name (links to the landing page) · a hairline · "Free Qaida" (plain text
   here, a link back on a lesson page) · then **Settings** (icon + word; the word hides under 560px) and the
   half-circle **light/dark switch**. A hairline appears under it once the page scrolls. Under 420px the star stands
   in for the name.
2. **Head:** "FREE QAIDA" in gold caps · title · one-line lede · the **settings line** ("Madani script · Fatha, kasra,
   damma · Shape families · Change") · a **large gold alif** at the right.
3. **Progress through the whole Qaida:** "1 of 14 lessons finished" over the same 3px gold bar, with a quiet
   "Start again" that clears every lesson (and only appears once something has been started).
4. **Fourteen cards**, a grid of `minmax(min(100%, 19rem), 1fr)` — one column on a phone, two or three above — each
   with its number, title, one line of what it teaches, and its state.
5. **End:** the star between two rules, already at rest, and one line pointing at the one-to-one lessons.

**Lesson card** — number, text, and a mark on the right. Three states:
- **Open** — a real `<a>`; gold number and arrow; the arrow leans 3px forward on hover, the card lifts 2px.
- **Finished** — a gold star mark, a gold hairline edge, and "Finished" under the title.
- **Not open yet** — a `<button aria-disabled="true">` with a lock, greyed. It is still reachable by keyboard and
  still says why; a tap says "Finish Lesson 2 first." at the bottom of the screen (`ui-ux-pro-max`: empty-nav-state).

A lesson opens when the one before it is finished; Lesson 1 is always open. Only Lesson 1 is built, so Lesson 2 opens
to a note saying it isn't built yet rather than to a dead link.

*Looks in the Options panel:* cards **Quiet** *(default, a hairline on the page's own ground)* · **Paper** · **Gold
wash**; lesson numbers shown *(default)* or hidden.

---

## 4. Lesson 1 — `lesson-1.html`

1. **Top bar**, as above, with "Free Qaida" a link back to the home.
2. **Lesson head:** "LESSON 1 OF 14" in gold caps beside a **14-lesson track** (14 short bars, this one gold and
   longer) · title "The letters" · one-line lede · the settings line · the large gold alif, centred with the title.
3. **Progress:** "7 of 29 letters seen" with a quiet "Start again", over a 3px bar that fills in gold.
4. **The letters:** every letter of the chosen script, **right to left**, in **shape families** (ا · ب ت ث · ج ح خ ·
   د ذ · ر ز · س ش · ص ض · ط ظ · ع غ · ف ق · then one each), 8px apart inside a family and 10–20px between families.
5. **End of lesson:** the star between two rules, a line, then two ways out: **← The lessons** (a quiet outline) and
   the **Lesson 2** button, locked until every letter has been seen. They stack, next lesson on top, under 420px.
   **Two tokens place these buttons, and they are not the same thing** — a distinction Claude got wrong twice on
   2026-09-18 before the user said plainly "i want that the buttons move up a bit":
   - **`--end-gap`** (`clamp(0.5rem, 1.2vh, 0.875rem)`) is the space *above* them, on `.current` and `.lesson-end`.
     Taking it out **moves the buttons up the screen**. This is the one that answers "they're at the edge".
   - **`--page-foot`** (`clamp(1.5rem, 3vh, 2.5rem)`) is the room *below* them, on both pages' columns. More of it
     only makes the page longer; the buttons don't move.

   Both are sliders in the options panel, and each starts from what the live page actually measures rather than from
   the stylesheet. Nothing overrides either: the short-window rules (`max-height: 740px`) tighten everything *above*
   the letters and leave the end of the lesson to these two tokens.

**Which letters** — the list follows the script (the user, 2026-09-18). 29 either way:
- **Madani** — alphabet order: ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ء ي
- **Indo-Pak** — the order of a printed Indo-Pak Qaida: و before ه, and the Indo-Pak forms ک ہ ی.
  **Laam (ل) only; lam-alif (لا) is not taught as a letter of its own** (the user, 2026-09-18).

**Their names are the Arabic ones in both sets of mark names** — Baa, not Be (the user, 2026-09-18). What the
student's choice of names changes is the *marks*, and with them the titles of lessons 4–14 on the home. One list,
one field in the options panel.

The tiles are built again when the script changes, and the arrival animation replays. **Progress is kept as letters,
not positions**, and ک ہ ی count as the same letters as ك ه ي — a student who has seen kaaf has seen kaaf, whichever
form it was written in. So switching script costs nothing at all.

**Grouping** — **Shape families** *(default)*: look-alikes together, 8px apart inside a family and 10–20px between
them · **Even grid**: the same distance between every letter. Both are the same centred wrap, not a CSS grid — a grid
leaves the last, part-full row hard against one edge.

**Letter tile** — a `<button>`, 5 : 6.3, 8px corners, flat, with 10px of the foot kept clear so the tails of
ج ح خ ع غ م ي aren't cramped and the name has somewhere to rise into. Named for screen readers (`aria-label` = the
letter's name).
Hover (mouse only): lifts 2px, gold edge, a very soft shadow. Press: scale 0.97. Focus: 2px gold ring, 3px out.
- *Looks:* **Paper** *(default)*, cream with dark ink, like the book's pages · **Outline**, a hairline · **Gold ink**,
  gold letter on a faint gold wash.
- *The gold edge:* `--edge` *(0.55 by default, slider 0–1)*. Gold on cream is quiet by nature and reads differently in
  the two themes, so it's a slider rather than a pick; the dark theme's gold is `rgb(198 152 62)`, brighter than the
  first draft's, which barely showed (the user, 2026-09-18).
- *Seen:* **a small gold dot** in the tile's first corner (right, in a right-to-left page) *(default)* · a gold edge ·
  both. Progress is also told in numbers, never by colour alone.

**Tap to peek** — tapping shows the name for 1.6 s *(default; slider 0.8–4 s)*, one letter at a time; tapping again
keeps it up; Escape closes it.
- **Under the letter** *(default)*: the letter steps up and shrinks (−18%, ×0.8), the name rises in beneath.
  ج ح خ ع غ م ي all hang well below the line they sit on, so the lift alone isn't enough — the name carries a band of
  the tile's own colour, fading upward, and the tail goes behind it. A tile that has no colour of its own (Outline)
  fades into the page instead, which is what `--tile-scrim` is for.
- **As a tag above**: a small dark tag with a caret over the tile.
- **Letter turns over**: the letter turns away and the name turns in (180 ms out, 320 ms in).

**Progress bar** — 3px, rounded, gold fill by `transform: scaleX` (no layout work). **Line** *(default)* or **a step
per letter** (one segment per letter, from a `--total` the script sets, because the two scripts don't have the same
number). **Under the title** *(default)* or **stays at the top** (sticks under the top bar).

**Start again** — a gold text link; the first tap changes it to "Tap again to clear" for 3 s, so progress is never
lost to one mis-tap. The home's "Start again" works the same way and clears every lesson.

**The letter last tapped** — a strip under the grid: the letter in gold, its name, **Hear it again** and **Trace
it**, both quiet 40px outlines. It exists because a tile is already a `<button>` and can't hold buttons of its own,
and at tile size they would crowd the letter. Hidden until something is tapped, and emptied when the script changes.

### Sound

Nothing autoplays — browsers block it, and a student working in company wouldn't thank us. **Tapping a letter shows
its name and plays it**, one sound at a time.

The recordings arrive a few at a time, so **nothing assumes a file exists**. `audio/manifest.json` lists only what
has been recorded; everything else has no recording, and the page says so rather than pretending:
- a **speaker mark** in the tile's far corner appears *only* on letters that have a real recording;
- one **line under the progress bar** — "No recordings yet — what you hear is a stand-in" or "7 of 29 letters
  recorded" — which hides itself once they're all in;
- a **mute switch** in the top bar, kept on the device like the theme, greying the speaker marks when it's off.

**The stand-in is a wordless hum, never speech.** `QAIDA-CONTENT.md`'s rule is the teacher's own voice or a vetted
reciter, never an AI voice, because a student believes what they hear. The user asked for "something resembling
voice" rather than a beep, so `make-placeholder-voice.js` writes a WAV by hand: a buzz at a human pitch through two
vowel formants, opening from "mm" to "ah". A human timbre that pronounces nothing.

**Filenames are ASCII slugs** — `letters/alif.mp3` — because Arabic in a filename is fragile across Windows, git and
the server. One recording serves both scripts: `shell.keyOf` already folds ک ہ ی onto ك ه ي.

**The recording list** (`recordings.html`) is a working page for the teacher; nothing on the site links to it. It
lists every clip wanted with what to say and what to call it, checks the folder for files, and writes out a
ready-made manifest to paste. Removed at step 13 with the options panels.

### The tracing board

Opened from **Trace it** on the strip. A `<dialog>` with the letter drawn large and faint on cream — the same paper
as the tiles, in both themes — and a canvas over it.

- Draw with a finger, mouse or pen: pointer events, one code path, `touch-action: none` so a finger drawing doesn't
  scroll the page under it. The stroke colour is the canvas's own `color`, so the ink follows the theme.
- **Undo** (one stroke), **Clear**, and **Hide the letter** — which is the point of practising: trace it, then try it
  from memory.
- **No marking.** Handwriting recognition on Arabic isn't reliable enough, and a machine telling a student "wrong"
  when they are right teaches them to distrust themselves. A printed Qaida asks them to compare by eye; so does this.
- **The guide letter is centred on its ink, not on its text box.** ج ح خ ع غ ي carry most of their weight below the
  line they sit on, so CSS centring left them sitting low in the board — the user spotted it on the first look
  (2026-09-18). It is drawn onto its own canvas instead: `measureText` gives the ink's real bounds, the letter is
  sized to fill about 72% of the board and placed so the middle of the ink is the middle of the square. The
  lettering and the colour still come from CSS (`font-family: var(--font-letter)`), so it follows the chosen script
  and theme, and it is measured again once the web font has actually arrived.
- Changing the script **closes the board**: ك becomes ک, and a board showing a letter the lesson no longer holds
  would be a lie. The lesson's strip empties for the same reason.
- **Honest about keyboards:** tracing needs a pointer. The board opens, closes and is read normally from a keyboard,
  and the line at the bottom says plainly that it needs something to draw with.

---

## 5. What both pages share

**First-visit choice** — a native `<dialog>` (focus trapped and returned by the browser), 36rem, 8px corners, over the
page dimmed to 80%. **Three questions**, each two whole-box choices with a round gold mark in the top right corner.
Everything in a box keeps clear of that corner — including the Arabic samples, which are right-to-left and so *begin*
there: a physical `padding-right`, not a logical one. The questions: **Script** (each box shows
three letters in that script, in that script's own forms, so the student chooses by eye), **Names for the marks**
(which also decides the letter names and the titles of lessons 4–14), and **Letter grouping**. Changes apply behind it
as they're picked. Opens by itself on the first visit, and from Settings or Change after. Escape or a click outside
closes it. It lives on both pages, and so does the choice — one store, one device.

**What's kept on the device** — one key, `qaida`, no accounts:

```
{ v: 1, script, names, grouping, chosen,
  lessons: { "1": { seen: ["ا","ب", …], done: false } } }
```

The first draft's flat `seen: [0, 1, 2]` is read once and carried over as letters. A private window that refuses
storage still works, for that visit.

**Background** — **Soft light** *(default)*: a faint gold glow at the top of the screen · **Star pattern**: the home
page's eight-pointed stars joined by lines, at 9%, fading down the page · **Plain**.

### Motion

| What | How | Time |
|---|---|---|
| Head and progress | rise 12px + fade | 800 ms, `cubic-bezier(0.16, 1, 0.3, 1)` |
| Letters arriving | rise 12px + fade, 35 ms apart (`ui-ux-pro-max`: 30–50 ms stagger) | 700 ms, from 150 ms |
| Lesson cards arriving | the same, 30 ms apart | 700 ms, from 120 ms |
| Peek | see §4 | 200–350 ms |
| Seen dot | scale in with a small overshoot | 400 ms |
| Bar fill | scaleX | 700 ms |
| The last letter | bar sweep, dots pulse in turn, the star turns into place, the button unlocks | 600–2200 ms, **once** |
| Choice panel | enter: rise + backdrop fade (500 / 300 ms); exit: fall + backdrop fade (260 ms) |
| Tracing board | the same, a little quicker in (400 ms) |
| Hovers, colours | | 200 ms |

Only `transform`, `translate`, `scale` and `opacity` animate. **Reduced motion:** no arrival, no pulse or sweep, and
every change is instant.

**After the last letter** *(Options → Progress and page)* — **Settles down** *(default)*: the celebration plays once
and then everything rests · **Keeps glowing**: the star keeps turning and the Lesson 2 button keeps pulsing · **No
fuss**: none of it. The default is the direction in §1; "Keeps glowing" was how the page behaved between 2026-09-17
and 2026-09-18 and is kept only as a tryout.

---

## 6. Accessibility

- Every target at least 44px (tiles 68px and up, buttons 44px, links and the breadcrumb 44px tall).
- Visible 2px gold focus rings; a skip link, and `tabindex="-1"` on its target so focus really moves; scroll padding
  so the sticky bar never hides the focused letter.
- Tiles are buttons named by the letter's name; cards are named "Lesson 3: Letter shapes. Not open yet"; the progress
  bars are `progressbar`s labelled by their progress line; the stand-in note is a `status`.
- Nothing leads nowhere: a lesson that can't be opened is a `<button>` that says why, not a dead link.
- The Arabic is live text with `lang="ar"`, and the letters are `dir="rtl"`.
- Contrast: gold on dark 8:1, deep gold on ivory 4.8:1, ink on paper 13:1, names on paper 6:1.

---

## 7. Stand-ins and open points

- **The letter names** are Claude's (Ḥaa for ح, Ṣaad for ص, ʿAyn for ع — the dotted-letter spellings may be more than
  a beginner wants). One list, editable in Options → Script and names; the teacher checks it.
- **The Indo-Pak face** is a stand-in and a launch blocker — see §2.
- **The Indo-Pak letter list** is Claude's reading of a printed Qaida (و before ه, ک ہ ی). The teacher confirms it.
- **The fourteen lesson titles and lines** are Claude's, and every one has a field in Options → Lesson titles and
  lines. Titles for lessons 4–14 change with the student's choice of names (Fatha / Zabar, Sukoon / Jazam).
- **Every other line of wording** is a stand-in with a field in Options → Words.
- **Every recording** is missing. The player, the manifest and the recording list are built; not one real clip is in
  yet, so every letter plays the wordless stand-in and the lesson says so. The teacher records gradually.
- **Not built:** lessons 2–14, the recordings themselves, record-your-own-voice, the finish screen.

---

## 8. Checked and not checked

Checked: every script passes `node --check`, and a script validates both letter lists (counts, no repeats, every
name filled in, the families covering each list once). **Not seen or heard in a browser** — the user previews it.
Things most worth a look: the fourteen cards at a phone width and at 1440, where Amiri Quran's letters sit vertically
inside a tile, the chooser on a phone, **whether the stand-in hum sounds like a voice clearing its throat rather than
a machine**, and **tracing with a finger on a real phone** — that the page doesn't scroll under the hand.
