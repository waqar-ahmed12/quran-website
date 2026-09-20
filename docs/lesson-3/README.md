# Lesson 3 — build specification

**Read this folder before writing a line of Lesson 3.** It is a specification, written 2026-09-20, for whoever
builds `QAIDA-BUILD.md` **step 5**: *"Lesson 3, letter shapes. Easy shapes to hard ones, then start / middle / end."*

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, and it is written
*after* the code exists and the user has seen it — the same way steps 1 and 4 were done. When you finish building,
update that file to describe what is actually there, and update `QAIDA-BUILD.md`'s status table and step log.

## Status — built 2026-09-20, awaiting the user's sign-off

Built the same day it was specified, after the user answered `09-open-questions.md` §1 and §5 (below). **Not seen in a
browser** — the user previews it, and the ZWJ forms (`02-the-forms.md` §5) are the one thing nothing but a browser can
confirm. Checked without a browser by `node tools/qaida-check.js` and `node tools/qaida-lesson3-check.js` (below).

The rest of this folder is the specification as written, and where the build differs it is listed here. Read the
list before you trust a number or a file name in the other files.

### As built — where the code differs from the specification

1. **Six groups, not five.** The user chose "split band 3 in two" (2026-09-20). Group 3 is ب ت ث ن ي س ش (21 shapes),
   group 4 is ص ض ف ق ل (15), the shape-shifters are group 5 (24) and **the table is group 6**. Drilled shapes are
   `[6, 2, 21, 15, 24, 0]` = 68 (`101` with every position drilled: `[13, 8, 28, 20, 32, 0]`). `target` stays 3.
   Everywhere the other files say "band 3" for the tooth-and-tail letters or "band 5" for the table, read 3+4 and 6.
   "Finishing" is therefore group 6. The rail label is "The six groups of letter shapes".
2. **"Start / middle / end of a word"** stays as the position names (`09` §5, the user's pick).
3. **A new file, `shapes.js`** — the data layer of `02` and `03` (the class table, `FORM`, `allItems()`, `poolFor()`,
   the board's rows and each group's stats). It has no DOM, so `tools/qaida-check.js` loads it in node. `lesson-3.js`
   is only the page.
4. **The engine's `ready` event is not used.** It fires once per visit and `setItems` does not re-arm it, so it cannot
   tell group 3 from group 4. `lesson-3.js` measures every group itself (`shapes.stats`, the engine's own rule) and
   fires "you seem to know this group" once, when a group crosses the line. Still no change to `practice.js`.
5. **`setDone(3, true)` fires when all five drilling groups are ready**, not when the table is merely opened. Opening
   the table first would otherwise finish the lesson with nothing learnt. It is still only a recommendation: every
   group, the table included, opens at any time.
6. **Wrong answers are chosen by which tags exist, not by their order.** `03` §4 and `07` §3 say the order of the
   `family` array decides which tag the engine uses; it does not (`sharesFamily` is `some`/`includes`). So
   `position` gives items only `pos:<position>`, `same-letter` gives only `letter:<key>`, and `any` turns
   `familyFirst` off. The teacher's look-alike table is not used in this lesson.
7. **Two notes, not seven.** `data-nofwd` and `data-nochange` are one sentence for the group ("These letters join to
   the one before them…"), not one per letter, so they carry no `{name}`. Only hamzah's line has one.
8. **Column headings stay visible on a phone.** The spec makes them `sr-only` under 560px; with the table scrolling
   sideways there, position by order alone would be lost. The letter's name is stuck to the start edge below 900px.
9. **The prompt is `aria-hidden`.** By the rule in `06` §1 a joined form is never read out, so a screen reader hears the
   question and the four named answers but not the shape itself. That is inherent to a question about a shape.
10. **`window.qaida` gained `setDistractors()`** (the panel's "Wrong answers offered" is Lesson 3's own three-way row)
    and an `onCosts` hook the panel sets, so its "What each group asks for" line follows the sliders.
11. **The panel shows the cost of every group** ("1: 6 shapes, 15 right · …") in the "Letter shapes" section, as `09` §1
    asked ("show the teacher the numbers before asking"). At `target` 3 and ready at 80% they are 15, 6, 51, 36 and 60
    right answers, so **group 5 is now the longest** (24 shapes), where group 3 was.
12. **Lesson 2's Next is now a real link** (`<a>` to `lesson-3.html`), and its `standin` wording and script line are gone.

13. **No counts on the page** *(the user, 2026-09-20, after seeing it: "68 shapes and 21 … produce stress")*. The lesson line
    is a few plain words ("Just starting" → "Getting going" → "Getting there" → "Nearly there" → "All known"), the group line
    shows only "All of this group" once it is done, the session tally is gone, and the announcements carry no numbers. The
    numbers still drive the bar, the rail's fills and the home's card. Only the options panel, which is the teacher's, still
    prints them. `05-wording.md`'s progress table is superseded by this.
14. **The rail is sticky** under the top bar, so a group can be chosen from anywhere down the shapes. Choosing one glides the
    page back up to the start of the new group's shapes — only if the student had scrolled past them, and only after the
    board has been swapped (asked for earlier, the change in height cancels the scroll).
15. **Each half says what it is for**: "Step 1 · Look at the shapes" and "Step 2 · Now practise", each with a one-line guide,
    and a **"Practise this group"** button under the shapes that takes the student down to the exercise (hidden on the table).
    The two headings replace the screen-reader-only ones in `04`.
16. Headings and the drill's question get more room (`:root[data-band] .prompt`), because a joined shape hangs lower than a
    bare letter and sat on the answers.

17. **Each group is practised on its own shapes only** *(the user, 2026-09-20, seeing Group 1 ask about ك and م)*. `poolFor(items,
    band)` now hands the engine just that group's shapes, so the questions and the wrong answers are that group's. This
    **overrules `01` decision 2 and `03` §2** ("every band keeps the others in the mix", the ×0.5 review weight). The
    engine is still unchanged. A group of two (ط ظ) asks a two-answer question.
18. **The table has a practice too**: group 6 hands the engine all 68 shapes, so it is the mixed review the other groups no
    longer carry. "Practise this group" and the exercise show on it as on the others. It does not count towards finishing:
    the lesson is finished when groups 1–5 are ready.
19. **The column headings stick** in a bar of their own under the rail (`.shapes-heads`), set over their columns by
    `positionHeads()`; a heading inside a table that scrolls sideways cannot stick. The table's own headings stay for a screen
    reader and are visually empty. The last column is named for what it shows: **"All three together"** (the letter joined
    three times, read from the right: start, middle, end) or **"Between two letters"** (group 1, where the letter sits between
    two baa so the gap shows), each with a note under the board saying so.
20. **Madani lettering for this page is Noto Naskh Arabic** (`data-madani-font="noto"`), because Amiri Quran draws taa's two dots
    as one joined mark in the start and middle shapes, which read as vertical; Noto draws two separate dots side by side. It is a
    third choice in Options → Script and names, and one attribute per page. Lessons 1 and 2 are still Amiri Quran.

21. **Nothing scrolls sideways on a phone** *(the user, 2026-09-20)*. Below 600px, with the shapes and their example, each letter's
    name gets a line of its own above its shapes (`<tbody>` per letter, `th scope="rowgroup"`), so five columns of tiles fit
    the window: 62px at 375px, 51px at 320px, never under 44px. The table of every letter has no example, so it keeps its name
    column with four tiles beside it (60px at 375px). Turned or resized across 600px, the board re-renders. The horizontal scroll
    is left only as a safety net. Measured in a browser at 375 and 320px: no overflow in any group.
22. **The settings panel fits a phone.** At 375×667 the whole first-visit choice fits without scrolling, and below 560px the
    "Done" button is pinned to the bottom of the panel, so at 320×568, where it does scroll, the button is still in view. (This is
    `.chooser`, shared with Lessons 1 and 2, so they get it too.)
23. **A line under the shapes says you may move on, but should do the exercise first**, just above "Practise this group".

### Checks

```
node tools/qaida-check.js          the engine, storage and the data layer (counts, ids, both scripts, the group trick)
node tools/qaida-page-check.js     Lesson 2's page, in a hand-made DOM
node tools/qaida-lesson3-check.js  Lesson 3's page and options panel, in the same DOM
```

None of them draws anything. They cannot tell whether a joined shape renders as a joined shape.

## What Lesson 3 is, in a paragraph

The same letters a third time, now **joined**. A letter the student can name cold (Lesson 2) still stops them dead
when it turns up in the middle of a word, because ـهـ and ه share almost nothing to look at. Lesson 3 teaches the
four positions — on its own, at the start, in the middle, at the end — in **five bands, easy shapes first**, and
ends with the full start/middle/end table for all 29. It teaches no marks and no words; those are lessons 4 to 14.
Underneath it is **`practice.js`**, unchanged — Lesson 3 is its second customer and needs no new engine code.

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | why the lesson exists, the five bands, and the decisions behind them |
| `02-the-forms.md` | the positional-form data: how a joined shape is produced, per script, and what is drilled |
| `03-the-pool-and-formats.md` | how the bands drive `practice.js` with **no engine change** — items, formats, families, progress |
| `04-page-and-design.md` | `lesson-3.html`, the band rail, the board, what is copied from Lesson 2 unchanged |
| `05-wording.md` | every string, with its text-field tag |
| `06-accessibility.md` | the ZWJ problem, keyboard, screen readers, reduced motion |
| `07-options-panel.md` | the tryout rows, the `window.qaida` surface, the `<html>` attributes |
| `08-files-and-steps.md` | the exact file list, in build order, with a verification checklist |
| `09-open-questions.md` | what needs the teacher, not you — **read this one first if you read only one** |

Also read, outside this folder: **`docs/lesson-2/` in full** (Lesson 3 copies its page, its engine contract and its
wording rules), `QAIDA-BUILD.md`, `QAIDA-CONTENT.md`, `WEBSITE-BUILD.md` §0 and §5, and
`design-system/quran-landing/pages/qaida.md`.

## Rules that apply to this work

**This PC is infected** (`CLAUDE.md`, `WEBSITE-BUILD.md` §0). Never run `python`, `py`, `pip`, `ffmpeg`, Git Bash,
or anything under `C:\ffmpeg-8.1.2-essentials_build\` or `%LOCALAPPDATA%\Programs\`. The **Bash tool is broken** —
Git's `bash.exe` is infected. Use **PowerShell**. `node` is validly signed and safe. Never use
`dangerouslyDisableSandbox`. Save images as PNG or WebP, never `.jpg`.

**Check your work with `node --check`**, every script, every time, and run **`node tools/qaida-check.js`** — it
checks the engine's boundaries and will fail if Lesson 3 pushes work into `practice.js` that belongs in the page.

**Preview:** `node serve.js`, then `http://localhost:8777/site/qaida/lesson-3.html`. The launch config is called
"site". Never `python -m http.server`.

**Every line of wording Claude writes gets its own text field** in the options panel — the user's standing rule.
`05-wording.md` lists them; `qaida-options.js` generates the field automatically from a `data-words` or
`data-words-attr` tag, so tagging the element is the whole job.

**Never ask the user to choose a look in words.** Build the choices as buttons in the options panel and let them
look. That rule is why `07-options-panel.md` exists.

**Nothing is locked.** `docs/lesson-2/09-going-in-order.md` applies to this lesson: the five bands are a
*recommended order*, not a chain of locks. See `01-what-it-teaches.md` §3.

**The user previews in a browser and signs off.** Do not drive a browser yourself, and do not mark step 5 done in
`QAIDA-BUILD.md` until they have said so. One step at a time.

**End every reply about the Qaida** with one line: the current step, its skills, and the next step.

## The one thing most likely to go wrong

**Making the lesson too long to finish.** Lesson 2 is 29 items and already needs about 72 right answers. Lesson 3
has **68 drillable forms** if you drill every one of them — roughly 163 right answers, which no beginner will sit
through. The bands exist partly to break that into five finishable pieces, but band 3 is still 36 items on its own.
`09-open-questions.md` puts this first and offers two remedies. Decide it with the teacher **before** building, not
after.

The second most likely: **adding stage machinery to `practice.js`.** The bands need no engine change at all —
`03-the-pool-and-formats.md` shows how `required` alone does it. If you find yourself adding a `stage` option to
the engine, stop and re-read that file.
