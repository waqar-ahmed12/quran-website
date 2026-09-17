# Qaida page — design record

> **Override file.** For the Qaida pages (`site/qaida/`), these rules override `../MASTER.md`. Anything not covered
> here follows MASTER.md and the home page's choices in `WEBSITE-BUILD.md`.

Written 2026-09-14, with the first draft of Lesson 1 (`QAIDA-BUILD.md`, step 1). **Design only:** the letter names
are stand-ins and there are no recordings or whiteboard yet. The looks marked *default* are Claude's picks; the other
choices are in the page's Options panel until the user chooses.

Files: `site/qaida/index.html`, `qaida.css`, `qaida.js`, and the temporary `qaida-options.js`.
Preview: `node serve.js`, then `http://localhost:8777/site/qaida/`.

---

## 1. Direction

**The home page's look, made calm enough to study on.** Same gold, same dark and light grounds, same Cinzel and Jost,
same star mark and 4px buttons, so the Qaida feels like the page the visitor came from. But no dust, no moving light
and no scroll-scrubbed motion: a student looks at these letters for a long time.

**Why not the database's pick.** `ui-ux-pro-max`'s data (`products.csv`, `ui-reasoning.csv`) suggests
claymorphism, bright block colours and gamification for "Educational App", "Language Learning" and "Kids Learning".
Rejected: it would break from the home page, the user's direction is "elegant, restrained" (WEBSITE-BUILD.md §1), and
the student can be any age. Kept from those rows: **progress tracking is a must-have**, shown clearly, and "complex
jargon" is an anti-pattern (hence plain words and the student's own choice of names). Its other anti-pattern, dark mode
for learning apps, is answered by the light/dark switch, shared with the home page.

From `minimalist-ui`: macro-whitespace first, one column, flat tiles with no shadow at rest, hairline dividers,
8px corners on tiles, one quiet rise into view, a background that isn't flat but never busy. Its fonts and pastels
are not used; the home page's fonts and gold win.

---

## 2. Tokens

As the home page (`site/styles.css`), plus:

| Token | Dark | Light | Use |
|---|---|---|---|
| `--color-surface` | `#28221F` | `#FFFFFF` | the first-visit choice panel |
| `--line` | foreground at 12% | foreground at 10% | hairlines, outlines |
| `--paper` | `#EDE4D3` | `#FFFFFF` | "Paper" tiles: the cream of the book's pages on the home page |
| `--paper-edge` | none | `rgb(28 25 23 / 0.1)` | tile edge on ivory |
| `--ink` | `#2B211B` (13:1 on paper) | `#1C1917` | the letter on a paper tile |
| `--ink-muted` | `#5C4F45` (6:1) | `#57534E` | the name on a paper tile |
| `--ink-accent` | `#A16207` (3.8:1) | `#9A5F07` | the seen mark on a paper tile |
| `--tile` | `clamp(4.5rem, 3.7rem + 2.6vw, 6.25rem)` | same | tile width; Large: `clamp(5.25rem, 4.2rem + 3.4vw, 7.75rem)` |
| `--topbar-h` | `4.5rem` | same | sticky bar, scroll padding |
| `--gutter` | `clamp(1rem, 4vw, 2.5rem)` | same | side padding, never under 16px |

**Arabic lettering** (stand-ins until the teacher checks): Madani `Amiri Quran`; Indo-Pak `Noto Naskh Arabic`
(`typography.csv`'s "Arabic Elegant" pairing). Google Fonts has no true Indo-Pak mushaf face; a licensed one (such as
a KFGQPC IndoPak font) should replace it before launch. `Scheherazade New` is a tryout for both.

**Type scale:** title Jost 300, `clamp(2.5rem, 1.8rem + 3vw, 4rem)`, line-height 1.05, −0.015em · lede Jost 300,
17–19px, line-height 1.65, 38ch · small gold labels Cinzel 500, 12px, 0.24em, uppercase · names on tiles Jost 400,
15px · progress line 15px, tabular numbers · end line Jost 300, 20–28px, balanced.

---

## 3. Layout, top to bottom

1. **Top bar** (sticky, 4.5rem): star + site name (links home) · a hairline · "Free Qaida" · then **Settings** (icon
   + word; the word hides under 560px) and the half-circle **light/dark switch** from the home page. A hairline appears
   under it once the page scrolls. Under 420px the star stands in for the name.
2. **Lesson head:** "LESSON 1 OF 14" in gold caps beside a **14-lesson track** (14 short bars, this one gold and
   longer) · title "The letters" · one-line lede · a **settings line** ("Madani script · Fatha, kasra, damma · Change").
   A **large gold alif** sits at the right of the head (centered with the title block, rendered in classical *Amiri Quran* calligraphy).
3. **Progress:** "7 of 29 letters seen" with a quiet "Start again" link, over a 3px bar that fills in gold.
4. **The letters:** 29 tiles, **right to left**, in **shape families** (ا · ب ت ث · ج ح خ · د ذ · ر ز · س ش · ص ض ·
   ط ظ · ع غ · ف ق · then one each), 10px apart inside a family and 20–44px between families.
5. **End of lesson:** the home page's star between two rules, a line ("See every letter to open Lesson 2."), and a
   **Lesson 2** button, locked until every letter has been seen.

Widths: content at most 60rem, centred. Checked by reasoning at 375 / 768 / 1024 / 1440 (not in a browser, see §8).

---

## 4. Components

**Letter tile** — a `<button>`, 5:6, 8px corners, flat. Letter at 52% of the tile width. Named for screen readers
(`aria-label` = the letter's name). Hover (mouse only): lifts 2px, gold edge, a very soft shadow. Press: scale 0.97.
Focus: 2px gold ring, 3px out.
- *Looks:* **Paper** *(default)*, cream with dark ink, like the book's pages · **Outline**, a hairline · **Gold ink**,
  gold letter on a faint gold wash.
- *Seen:* **a small gold dot** in the tile's first corner (right, in a right-to-left page) *(default)* · a gold edge ·
  both. Progress is also told in numbers, never by colour alone.

**Tap to peek** — tapping shows the name for 1.6 s *(default; slider 0.8–4 s)*, one letter at a time; tapping again
keeps it up; Escape closes it.
- **Under the letter** *(default)*: the letter steps up and shrinks a little, the name rises in beneath.
- **As a tag above**: a small dark tag with a caret over the tile.
- **Letter turns over**: the letter turns away and the name turns in (180 ms out, 320 ms in).

**Progress bar** — 3px, rounded, gold fill by `transform: scaleX` (no layout work). **Line** *(default)* or **a step per
letter** (29 segments). **Under the title** *(default)* or **stays at the top** (sticks under the top bar). When the last
letter is seen: light sweeps the bar once, each seen dot pulses in turn, the end star turns into place.

**Start again** — a gold text link; the first tap changes it to "Tap again to clear" for 3 s, so progress is never
lost to one mis-tap.

**First-visit choice** — a native `<dialog>` (focus trapped and returned by the browser), 36rem, 8px corners, over the
lesson dimmed to 80%. Two questions, each two whole-box choices with a round gold mark: **Script** (each box shows
three letters in that script, so the student chooses by eye) and **Names for the marks**. Changes apply behind it as
they're picked. Opens by itself on the first visit ("Start the lesson"), and from Settings or Change after ("Done").
Escape or a click outside closes it.

**Lesson 2 button** — solid gold 48px button with an arrow once open; before that, a grey outline with a lock, and the
line above says why (`ui-ux-pro-max`: empty-nav-state). A click while locked flashes that line gold. Lesson 2 isn't
built, so an open click shows a short note at the bottom of the screen.

**Background** — **Soft light** *(default)*: a faint gold glow at the top of the screen · **Star pattern**: the home
page's eight-pointed stars joined by lines, at 9%, fading down the page · **Plain**.

---

## 5. Motion

| What | How | Time |
|---|---|---|
| Head and progress | rise 12px + fade | 800 ms, `cubic-bezier(0.16, 1, 0.3, 1)` |
| Letters arriving | rise 12px + fade, 35 ms apart (`ui-ux-pro-max`: 30–50 ms stagger) | 700 ms, from 150 ms |
| Peek | see §4 | 200–350 ms |
| Seen dot | scale in with a small overshoot | 400 ms |
| Bar fill | scaleX | 700 ms |
| Finished | bar sweep, dots pulse in turn, star turns in | 600–1200 ms, once |
| Choice panel | enter: rise + backdrop fade (500 / 300 ms); exit: fall + backdrop fade (260 ms) |
| Hovers, colours | | 200 ms |

Only `transform`, `translate`, `scale` and `opacity` animate. **Reduced motion:** no arrival, no pulse or sweep, and
every change is instant.

---

## 6. Accessibility

- Every target at least 44px (tiles 72px and up, buttons 48px, links 44px tall).
- Visible 2px gold focus rings; a skip link to the lesson; scroll padding so the sticky bar never hides the focused
  letter.
- Tiles are buttons named by the letter's name; the progress bar is a `progressbar` labelled by the progress line; the
  stand-in note is a `status`.
- The Arabic is live text with `lang="ar"`, and the grid is `dir="rtl"`.
- Contrast: gold on dark 8:1, deep gold on ivory 4.8:1, ink on paper 13:1, names on paper 6:1.

---

## 7. Stand-ins and open points

- **Letter names**, both lists, are Claude's (for example Ḥaa / Haa for ح, Haa / Ha for ه). The teacher checks
  them; both are editable in Options → Script and names.
- **Indo-Pak lettering** needs a proper Indo-Pak mushaf font. Indo-Pak Qaidas may also write some letters with other
  forms (ک ہ ی) and put و before ه; both are content questions for the teacher.
- **Every line of wording** is a stand-in with a field in Options → Words.
- **Not in this draft:** the Qaida home with all 14 lessons, recordings, record-your-voice, whiteboard, tracing.

---

## 8. Checked and not checked

Checked: the two scripts pass `node --check`. **Not seen in a browser** (the user previews it). Things most worth a
look: where Amiri Quran's letters sit vertically inside a tile, the "Letter turns over" peek, and the chooser on a phone.
