# Qaida build — steps and skills

Started 2026-09-14. The free Qaida is a page of its own, `site/qaida/`, which the landing page's **Free Qaida** links
will point at. What it teaches is in `QAIDA-CONTENT.md`; this file is how it gets built. `WEBSITE-BUILD.md` still
applies: the PC safety rules (§0), the tokens and fonts (§5), previewing with `node serve.js`, and the user's standing
rule that every piece of wording Claude writes gets its own text field in an options panel.

**The user asked (2026-09-14):** keep the steps and skills in a file, and keep reminding them. End every reply about the
Qaida with one line: the current step, its skills, and the next step.

## Where we are

**Steps 1–5 of 13 built, awaiting sign-off** — the Qaida home, Lesson 1, sound and tracing, Lesson 2 with the
practice engine (`practice.js`) that lessons 4–14 reuse, and Lesson 3, letter shapes. Steps 4 and 5 have not been seen
in a browser yet.

**Step 5, Lesson 3, is built** (2026-09-20): `docs/lesson-3/` is the specification and its `README.md` lists where the
build differs. It needed no change to `practice.js`. **Six groups, not five** — the user split the big one in two.

**Step 6, Lesson 4, is built, and not yet seen in a browser** (2026-09-20): `docs/lesson-4/` is the specification. The user
said "please start building", which was taken as a yes to the recommendations in `docs/lesson-4/09-open-questions.md`: §1 answered by
the pair's name (the sound format is built and switched off until there are recordings), §2 two parts. **Step 6 is not
done**: lessons 5 and 6 are still to come, and the user has to preview Lesson 4 first.

**Step 6, Lesson 5 (zair), is built, and not yet seen in a browser** (2026-09-20, the user: "please start building lesson 5"):
`docs/lesson-5/` is the specification, and it holds only the *differences* from `docs/lesson-4/`; its `README.md` lists where
the build differs. Lesson 5's mark sits *below* the letter, in the same strip as the dots below and the descenders, so
**the first thing to look at is whether the mark renders attached, under the letter** (`docs/lesson-5/05` §4). The one
thing genuinely new is that **Lesson 4's zabar items ride along as the wrong answers** — without them the lesson is
answerable by noticing that a mark exists, which the student learnt last lesson. **Step 6 is still not done:** Lesson 6
(paish) is to come, and the user has to preview lessons 4 and 5.

## Decisions

| Question | Answer (the user, 2026-09-14) |
|---|---|
| Script | **Both, with a switch:** Indo-Pak and Madani. *2026-09-18:* the switch changes the **letters**, not just the font — 29 either way, Indo-Pak with و before ه and the forms ک ہ ی. Laam only, no lam-alif |
| Names | **Both, the student picks:** zabar, zair, paish, jazam, or fatha, kasra, damma, sukoon. *2026-09-18:* the **letters** keep their Arabic names in both (Baa, not Be); the choice changes the marks and the titles of lessons 4–14 |
| Transliteration | **Off, tap to peek:** tapping a letter shows its name for a moment |
| Progress | **A progress bar** showing how far the student has reached, kept on the device (no accounts) |
| Recordings | **Left out for now.** No sound until the user brings it back. Never an AI voice |
| Extras | **All of them, later:** record your own voice, trace the letters, finish screen. Not in step 1 |
| Letter order | **Claude's call** (the user: "do what you like best"): alphabet order, taught in shape families. See `QAIDA-CONTENT.md` |
| Match a printed Qaida | The user wasn't sure. Alphabet order keeps the page in step with a printed Qaida anyway |
| Finishing a drill lesson | **A recommendation, not a gate** *(2026-09-19)*: "a recommendation that you seem okay, let's move on". A missed letter **comes back more often but never straight away**; one missed repeatedly earns "go back and look at it again" — advice, never a block |
| Mixed review | **Every later lesson mixes in** earlier material *(2026-09-19)*. The lesson's own items are the gate; review items ride along and never are. Answers the "ask first" on steps 6 and 8 |
| Skipping ahead | **Allowed** *(2026-09-19)*: "if the user wanted to skip they can, but they should also be advised that if they are new, it is recommended to go with the flow". **Nothing is locked.** A lesson out of turn advises once, then lets them through. Overrules step 1's locks — see `docs/lesson-2/09-going-in-order.md` |
| A letter is "known" | **Three right answers in a row** *(2026-09-19: "i guess three")* |
| "You seem ready" | **Four fifths of the letters known, and no missed letter still shaky** *(2026-09-19: "4 fifth without mistakes, if mistake, repeat the mistake and practice all letters" — Claude's reading)*. A mistake repeats the letter (more often, never straight away) and every letter stays in the mix |
| A writing board | **In every lesson, always available** *(2026-09-19: "we don't know when someone would need to write")*. A **Board** button in every lesson's top bar opens a blank board; "Trace it" stays as the shortcut to a letter just missed. Every later lesson copies the button and the tracer dialog |
| Wording | **Never harsh** *(2026-09-19)*. Plain, short, and a wrong answer says what the letter is and nothing more |
| Lesson 3's length | **Split the big group in two, `target` stays 3** *(2026-09-20, from three options shown with their numbers)*. Six groups: 6 + 2 + 21 + 15 + 24 = 68 shapes, then the table. Position names: start / middle / end **of a word** |

## Steps

One step at a time, with the user's sign-off before the next.

**Reordered 2026-09-18.** Sound and tracing were at the end (old steps 7 and 9). The user asked where they were and
said the whiteboard is *"for learning purpose for people, to practice"* — which the end of the queue doesn't serve.
Both attach to Lesson 1, which already exists, so doing them now makes Lesson 1 a complete example of what a lesson
is, and lessons 2–14 get built against it instead of being retrofitted.

| # | Step | Skills | Status |
|---|---|---|---|
| 1 | **The Qaida page, Lesson 1 and the Qaida home.** The 14 lessons (only lesson 1 open) and the progress bar; a first-visit choice of script, names and grouping, changeable any time; Lesson 1, the letters, tap to peek; progress kept on this device; the landing page's look, light and dark; an options panel with tryouts and a text field for every line | `minimalist-ui`, `ui-ux-pro-max`, `full-output-enforcement` | **Built, awaiting sign-off** |
| 2 | **Sound in Lesson 1.** The player, `audio/manifest.json`, the wordless stand-in, the mute switch, and the recording list at `recordings.html` | `ui-ux-pro-max`, `full-output-enforcement` | **Built, awaiting sign-off.** The teacher records gradually (2026-09-18) |
| 3 | **Trace the letters** with a finger, mouse or pen, inside Lesson 1 | `minimalist-ui`, `high-end-visual-design` | **Built, awaiting sign-off.** Was step 9 |
| 4 | **Lesson 2, the recognition drill.** Letters out of order; the practice engine the later exercises reuse | `ui-ux-pro-max`, `minimalist-ui` | **Built, awaiting sign-off** (2026-09-19). Specified in `docs/lesson-2/`; `README.md` there lists where the code differs. Check: `node tools/qaida-check.js` |
| 5 | **Lesson 3, letter shapes.** Easy shapes to hard ones, then start / middle / end | `minimalist-ui`, `ui-ux-pro-max` | **Built, awaiting sign-off** (2026-09-20). Six groups and a table; `docs/lesson-3/README.md` lists where the code differs. Checks: `node tools/qaida-check.js`, `node tools/qaida-lesson3-check.js`. **The joined shapes have not been seen rendering** — that is the first thing to look at |
| 6 | **Lessons 4–6: zabar, zair, paish,** each with its exercise and mixed review | `ui-ux-pro-max`, `full-output-enforcement` | **Lesson 4 built 2026-09-20, awaiting the user's preview** (`docs/lesson-4/` is the spec; `README.md` there lists where the build differs). **Lesson 5 built 2026-09-20, awaiting the user's preview** (`docs/lesson-5/` — the differences only; it assumes `docs/lesson-4/`; `README.md` there lists where the build differs). Lesson 6 not started. One page file, `mark-lesson.js`, serves all three lessons. Mixed review carries through every later lesson (2026-09-19). Checks: `node tools/qaida-check.js`, `qaida-marks-check.js` (Lesson 4's page), `qaida-lesson5-check.js`, `qaida-lesson3-check.js` |
| 7 | **Lessons 7–9: tanween, zabar + alif, standing harakaat** (the two scripts write some of these marks differently) | `ui-ux-pro-max`, `full-output-enforcement` | |
| 8 | **Lessons 10–14: wow and yaa (leen and madd), jazam** | `ui-ux-pro-max`, `full-output-enforcement` | Answered 2026-09-20: **jazam stays last**, after leen |
| 9 | **The rest of the recordings:** the marks in every lesson, and 3–4 example words per exercise | `ui-ux-pro-max`, `full-output-enforcement` | Each lesson adds its rows to the recording list as it's built |
| 10 | **Record your own voice** and play it back against the teacher's | `ui-ux-pro-max`, `minimalist-ui` | Only means something once the recordings are in |
| 11 | **Finish screen:** a mark for each finished lesson, and a last screen pointing to one-to-one lessons | `minimalist-ui` | |
| 12 | **Polish:** spacing, lettering, motion | `high-end-visual-design` | |
| 13 | **Audit and connect:** keyboard, screen readers, phones, MASTER.md's checklist; options panels and `recordings.html` removed; a licensed Indo-Pak font in place of the Noto Naskh stand-in | `web-design-guidelines` | The landing page's three Free Qaida links were pointed at `qaida/` early, 2026-09-18 |

## Skills on this PC

Only the project skills in `.claude/skills/` are installed here. The user-level plugins earlier chats used
(`taste-skill`, `agent-skills`, `ponytail`) are not. Two project skills are the same files under other names:
`minimalist-ui` is `taste-skill:minimalist-skill`, and `high-end-visual-design` is `taste-skill:soft-skill`. Don't run
`ui-ux-pro-max`'s search script (it needs Python, see `WEBSITE-BUILD.md` §0); read its `references/` and `data/*.csv`
directly.

## Step log

### Step 1 — the Qaida page and Lesson 1

*Started 2026-09-14.*

- **First draft, design only (2026-09-14, the user: "goal is the design, not the content… just the first lesson").**
  Built with `ui-ux-pro-max` (references and data read directly) and `minimalist-ui`: `site/qaida/index.html`,
  `qaida.css`, `qaida.js`, and the temporary `qaida-options.js`. Lesson 1 only: the 29 letters right to left in shape
  families, tap to peek, a progress bar kept on this device, a first-visit choice of script and names, light and dark
  shared with the home page, a locked Lesson 2 button. No recordings or whiteboard. The Qaida home with all 14 lessons
  is not built yet. **The design is recorded in `design-system/quran-landing/pages/qaida.md`**, with the reasons,
  tokens, every tryout and what's a stand-in. Preview: `http://localhost:8777/site/qaida/`. Not seen in a browser.

- **Repaired, and the Qaida home built (2026-09-18).** The user asked what was there and what was broken. Nine faults,
  three of them choices that silently did nothing. Fixed:
  - **The names choice did nothing** — both name lists held the same strings. The South Asian list now carries the
    Urdu letter names (Be, Te, Se, Jeem, Hey…), and it also decides the titles of lessons 4–14 on the home.
  - **The script choice only swapped a font.** It now changes the letters: Madani 29 in alphabet order, Indo-Pak 30
    in the printed-Qaida order (و before ه, لا included, ک ہ ی). *The user's call, 2026-09-18.*
  - **Progress is kept as letters, not positions**, so switching script keeps credit for the letters both lists share.
  - **Storage reshaped for fourteen lessons** — `{ v: 1, …, lessons: { "1": { seen: […], done } } }`, with the first
    draft's flat list carried over once.
  - **The finished lesson stopped moving forever.** The star turning and the button pulsing were `infinite` and
    restarted on every later visit; they're now one of three choices in Options → "After the last letter", default
    *Settles down*. Also fixed the arrow hover the infinite animation had been overriding.
  - Small things: `tabindex="-1"` so the skip link really moves focus, the Lesson 2 dead anchor is now a button, the
    chooser's script samples align to the start of their box and show each script's own forms (ک ہ ی).
  - **The Qaida home** (`site/qaida/index.html`): the fourteen lessons as cards — open, finished, or locked with the
    reason — one progress bar for the whole Qaida, and "Start again" for everything. Lesson 1 moved to
    `lesson-1.html`; what the two pages share moved into `shell.js`.
  - **The landing page's three Free Qaida links now point at `qaida/`.** They pointed at `#qaida`, which is nothing —
    no such section and no handler, so a click did nothing at all.
  - **The design record was rewritten** to match the files; it had drifted through commit `ae193b3`.

  Checked with `node --check`. **Not seen in a browser** — the user previews it.

- **After the user's first look (2026-09-18).** Seven notes from the screenshots:
  - **Even grid wasn't centred** — it was a CSS grid, which leaves the last, part-full row hard against one edge.
    Now the same centred wrap as shape families, only with one even gap.
  - **Indo-Pak: laam only, no lam-alif.** Both lists are 29 again, so switching script now costs nothing at all.
  - **The letters keep their Arabic names in both sets of mark names** — Baa, not Be. One list, one field in Options.
  - **The gold edge was too faint in the dark theme.** The dark gold is brighter (`rgb(198 152 62)`) and there's a
    **Gold edge strength** slider (`--edge`, 0.55 by default) on both pages.
  - **The name overlapped ج ح خ ع غ م ي when tapped** — they hang below the line they sit on. The letter now lifts
    and shrinks further, and the name carries a band of the tile's own colour that the tail goes behind.

  Still open from that look: whether the brighter gold is enough, and whether Ḥaa / Ṣaad / ʿAyn should lose their
  dots for a beginner.

### Steps 2 and 3 — sound and tracing in Lesson 1

*Built 2026-09-18, after the user asked where the whiteboard and the audio were in the plan.*

**Sound.** `audio.js` plus `audio/manifest.json`. The manifest lists **only what has been recorded**, because the
teacher is uploading gradually ("there are a lot of words") — anything not listed simply has no recording, and the
page says so instead of breaking. Filenames are ASCII slugs (`letters/alif.mp3`), since Arabic in a filename is
fragile across Windows, git and the server; one recording serves both scripts, because `shell.keyOf` already folds
ک ہ ی onto ك ه ي. Tapping a letter shows its name and plays it; a speaker mark appears only on letters that have a
real recording; a line under the progress bar says how many are in. A mute switch sits in the top bar, kept on the
device like the theme. Nothing autoplays.

**The stand-in is a wordless hum, not speech** (`make-placeholder-voice.js` writes the WAV by hand — no ffmpeg, no
Python). The user asked for "something resembling voice" rather than a beep; a human timbre that says nothing keeps
that feel without breaking the rule that a student must never hear a machine pronounce a letter.

**The recording list** (`recordings.html`) is for the teacher only — nothing on the site links to it. It lists every
clip wanted, checks the folder for files, and writes out a ready-made `manifest.json` to paste. Each later lesson
adds its rows as it's built. Removed at step 13.

**Tracing.** `trace.js` — tapping a letter now also fills a strip under the grid (the letter, its name, "Hear it
again", "Trace it"), because a tile is itself a button and can't hold buttons of its own. "Trace it" opens a board
with the letter faint underneath, drawn with a finger, mouse or pen; undo, clear, and hide the letter to try from
memory. **No marking:** handwriting recognition on Arabic isn't reliable enough to tell a student they're wrong.

**After the user's look (2026-09-18):** the guide letter sat low for ج ح خ ع غ ي. CSS centres a letter's *text box*,
and those letters carry most of their weight below the line they sit on. It's now drawn onto its own canvas and
centred on its **ink**, measured with `measureText`, so every letter sits in the middle of the square whatever its
shape. The lettering and colour still come from CSS, so it follows the script and the theme.

Checked with `node --check`. **Not seen in a browser** — the user previews it.

### Step 4 built — Lesson 2 and the practice engine

*2026-09-19, after the user answered the open questions ("i guess start building").*

**What exists.** `practice.js` is the drill engine: no DOM, no storage of its own, and it doesn't know its items are
letters or that sound exists. `lesson-2.html` and `lesson-2.js` are its first customer: a letter (or a name) and
answers to pick from, one question at a time, no timer, no score, no red. A missed letter comes back **more often but
never straight away** (a weighted draw, not a queue); one missed again and again earns "look at it in Lesson 1" advice;
and at **four fifths known with nothing missed still shaky** the page says *you seem to know these* and marks the
lesson finished — a recommendation, and the drill carries on. Storage gained a validated `drill` per lesson; the home
counts "N of 29 letters known" for it by declaring `progress: 'drill'` on the lesson rather than testing its number.

**The user's answers** are in the Decisions table above and in `docs/lesson-2/10-open-questions.md`. Three of the eight
questions weren't understood ("choices per question", "trace", "screen readers"): ask in plain words next time.

**The board.** The user asked for a writing board in every lesson. `trace.js` gained a blank mode, opened from a **Board**
button now in the top bar of Lessons 1 and 2 (and every later lesson, by copying the markup). It has no guide letter, so it
can never give away a drill answer, and what is written stays until Clear or a reload.

**Also changed.** Lesson 1's Next is a real link to Lesson 2. A global `[hidden]` rule was missing, so any element whose class
set `display` ignored the attribute: by the CSS cascade, Lesson 1's "Start again" and its empty letter strip would have shown
before anything was tapped. Fixed for both lessons; not confirmed in a browser.
The options panel has a "The drill" section, and every choice in it exports to `setting.txt`.

**Checked.** `node tools/qaida-check.js` runs 50 checks on the engine and storage, with no browser, and all pass; every script passes
`node --check`. **Not seen in a browser** — the user previews it. **Not built:** `docs/lesson-2/09-going-in-order.md`
(nothing locked, advice at the door), which the spec says to ask about. Lesson 2 opens from the home once Lesson 1 is finished.
`design-system/quran-landing/pages/qaida.md` is **not yet updated**: it is written after the user has seen the page.

### Step 5 built — Lesson 3, letter shapes

*2026-09-20, after the user answered the two open questions that blocked it (length, and the position names).*

**What exists.** `lesson-3.html`, `lesson-3.js` and `shapes.js`. The page is Lesson 2's page with a **rail of six groups**
and a **board of shapes** above the drill: the board teaches, the drill tests. A joined shape is a letter with an invisible
neighbour (U+200D), so every element holding one is `aria-hidden` and its container carries the name ("Haa, middle of a
word"). The six groups — the six that never join forward, the two that never change, then tooth-and-tail in two halves, the
shape-shifters, and the whole table — are an *order*, never locks: any group opens at any time and one opened out of turn is
advised about once. The engine is `practice.js`, **unchanged**: the pool is always all 68 shapes and the open group is the
`required` ones. Two progress numbers, each labelled: the bar is the whole lesson, the line under it is this group; the
page re-asserts the lesson's total after the engine overwrites it with the group's. "Write it" opens the tracer on the
isolated letter, not the joined shape.

**Where it differs from `docs/lesson-3/`** — twelve points, in that folder's `README.md`. The three that matter most:
six groups (the user's choice); the engine's `ready` event can't serve per-group readiness, so the page measures each group
itself; and the lesson is marked finished when all five drilling groups are ready, not when the table is opened.

**Also changed.** Lesson 2's Next is a real link to Lesson 3. The options panel gained a "Letter shapes" section (group,
shapes drilled, wrong answers offered, what the board shows) that also prints what each group asks for, so the teacher can see
the length instead of picturing it. Group 5 (24 shapes, about 60 right answers) is now the longest.

**Checked.** `node tools/qaida-check.js` (the data layer: 68 and 101 shapes, both scripts, the ids, the group trick, mastery
surviving a change of group) and `node tools/qaida-lesson3-check.js` (the page and the options panel in a hand-made DOM,
including a full run through a group, the whole lesson, a change of script, and Start again) both pass, and so do the
Lesson 2 page check and every `node --check`. **Not seen in a browser** — the user previews it. Look first at whether every
joined shape renders as a joined shape (not a dotted circle, not the bare letter) in both faces and both themes: **ہ / ه,
ع غ, ک / ك, م**, then the six that never join forward. Then whether ط ظ's four shapes look alike enough for group 2's premise
(`docs/lesson-3/09` §3). `design-system/quran-landing/pages/qaida.md` describes the page but is the "as built, not yet seen" kind.

### Step 6 built (Lesson 4 only) — the first mark

*2026-09-20. The user: "please start building."*

**Built.** `marks.js` (the data layer for every mark lesson: the marks table, the 29 items, the bare review letters, the
two parts), `mark-lesson.js` (the page, driven by `<html data-mark>`; there is no `lesson-4.js`), `lesson-4.html`, a block
in `qaida.css`, a "The mark" section in the options panel, and the `fatha` recording group in `audio.js`, `recordings.js`,
`recordings.html` and `manifest.json` (recordings of the *sound* "ba", not the letter's name). `practice.js` did not change.
The home shows Lesson 4 as a real link, and Lesson 3's Next reaches it.

**The user's answers were taken from the recommendations, not asked.** §1: the student answers with the pair's name
("Baa with zabar"); the by-ear format exists and switches on when a `fatha` recording does. §2: two parts, six letters
(ب د ر س م ل) then all 29. Both are one row in the options panel from being changed.

**Where it differs from the spec** (each is written where it happens, and is the user's to overrule):
1. **Part 1 asks about part 1's letters only**, not "the other 23 at half weight" — the user's 2026-09-20 line on Lesson 3,
   "i shouldn't be seeing the letters of other groups". The bare review letters are the mix.
2. **No plain letters in the practice** (the user, 2026-09-20, after previewing: "don't add simple alphabets without symbols").
   The "Letters from before" slider now starts at 0; it is still in the options panel, and "the same letter, with and
   without the mark" needs it above 0. Also after the preview: a letter is not asked again until the others have had a
   turn (`noRepeatWithin`), and the halo waits for a changed font to load and is measured again. What follows describes the
   review *when it is switched on*: **review is capped by the part's size** (a third as many as it has letters; as many as it has letters when the wrong
   answers are "the same letter, bare", so every letter has a twin). Eight bare letters beside six required ones were 53%
   of the questions; now about 19% in part 1 and 17% in part 2.
3. **`shell.masteredCount(4)` counts review letters too** (it counts every id the lesson holds), so the home's card can
   read a little high. The home already clamps it to the total, and the page's own bar counts only the 29. Fixing it means
   touching `shell.js`; not done.
4. `data-titlemark` stays `"ba"` (the layout choice, as on Lesson 3) and the glyph is composed by the script.

**Checked.** `node tools/qaida-check.js` (a Lesson 4 block: the counts, the ids, the glyph, no literal combining mark, the
groups, the total re-assert, review, mastery across a change of group and script), `node tools/qaida-marks-check.js` (new:
the real page and options in a hand-made DOM, including the name set switching with no reload), plus the Lesson 3 and Lesson 2
page checks, all pass. **Not seen in a browser.** The blocking check is `docs/lesson-4/08` §5: does every marked letter
render with the mark *attached* — **ا ء ط ظ ک ہ** and one dotted letter — in both faces and both themes. Then whether the halo
sits on the mark, and whether "Write it" shows the mark in the guide. `design-system/quran-landing/pages/qaida.md` is not
updated yet: it is written once the user has seen the page.

### Step 6 built (Lesson 5) — the mark below

*2026-09-20. The user: "please start building lesson 5." Taken as a yes to the recommendations in `docs/lesson-5/06`.*

**Built.** `lesson-5.html` (Lesson 4's page with `data-mark="kasra"`, `data-distractors="which-mark"`, `data-board="trio"`
and its own wording), and edits to `marks.js` (per-mark `first`, `sample` and `after`; `twinItems`; `which-mark`; `{other}`;
`item.mark`), `mark-lesson.js` (`reviewPlan`, the trio, `data-sits`, verdicts that name what the letter really carries),
`shell.js` (Lesson 5's row, and the `masteredCount` fix), `qaida.css` (one `[data-sits="below"]` block and the trio row),
`qaida-options.js` (three rows), and `audio/manifest.json` (`"kasra": {}`). `practice.js` did not change. `recordings.html`
lists the 29 kasra rows on its own (`built: true`).

**What the lesson does that Lesson 4 did not.** The same letters with **zabar** ride along — as wrong answers, and asked in
their own right (they are review: never required, never counted, never advice). A question about zair always has the same
letter with zabar among the answers, so the student cannot pass by noticing that a mark is there; they have to look at
whether it is above or below. The plain letters are the slider and start at 0 (the user, on Lesson 4). The board is a trio:
the letter, with zabar, with zair.

**Where it differs from `docs/lesson-5/`** — eleven points, in that folder's `README.md`. The ones that matter most: the
`{other}` token in place of two-attribute pairs; the `masteredCount` fix (which also corrects Lesson 4's home card); the twins
come to about 45% of part 1's questions and 35% of part 2's, not a third; and the halo is not allowed to spill out of the tile.

**Checked.** `node --check` on every script; `node tools/qaida-check.js` (a Lesson 5 block: 46 checks on the data layer,
including that every zair question has its zabar twin among the answers), the new `node tools/qaida-lesson5-check.js` (the
real page and options in a hand-made DOM), `qaida-marks-check.js` (Lesson 4's page, unchanged apart from a flake fix) and
`qaida-lesson3-check.js` all pass. **Not seen in a browser** — the user previews it, and `docs/lesson-5/05` §4 is the list. Look
first at whether the mark renders *attached, under the letter* — **ب ي ج** (dots below), **ر و م ن ص ق** (tails), **ا**, **ء**,
and **ط ظ**, which should be the cleanest — in both faces and both themes; then whether anything is clipped at the bottom of a
tile, and whether the halo sits on the mark. `design-system/quran-landing/pages/qaida.md` is not updated: it is written once the
user has seen the page.

### Step 6 planned (Lesson 5) — the mark below

*2026-09-20. The user: "please plan lesson 5, i guess that is the next lesson."*

**Specified, not built.** `docs/lesson-5/` is **six files, not ten**, and it is deliberately thin: Lesson 5 is Lesson 4
with a different stroke, `mark-lesson.js` already serves it through `<html data-mark="kasra">`, and `MARKS.kasra` was
written on 2026-09-20 with the rest. A ten-file clone of `docs/lesson-4/` would be a second copy of a specification
that is already right. The folder says so on its first line: read `docs/lesson-4/` in full, this holds the differences.

**It should not be built yet.** Lesson 4 has not been seen in a browser, and its blocking check — does the mark render
*attached* to the letter — is the same check here, in a harder place. U+0650 sits **below**, in the strip already
occupied by the dots below (ب ي ج) and by every tail and bowl that crosses the line (ر و م ن ص ق). Building Lesson 5
first would mean fixing the same fault twice, in two files.

**The one thing that is genuinely new**, and the only part of the plan with real code in it: Lesson 4's contrast was
*marked against bare*, and here that is worthless â€” a student who has done Lesson 4 can already see a stroke. The
contrast that makes Lesson 5 a lesson is **above against below**, so **the zabar items ride along as the wrong
answers**. That means a fourth `distractors` value (`which-mark`), review items that carry the *other* mark, and a
`mark` field on every item so the page can tell whose it is. `practice.js` still does not change.

**Six smaller findings**, each written where it happens: `GROUP_ONE` is shared and its six letters were chosen for a
mark *above* (three of them are the worst letters for one below, so `first` becomes per-mark); `sits: 'below'` is
declared and read by nothing; `titleMark` and `sampleOf` hardcode ب, which is the one letter with a dot where this
mark goes; the board wants three columns, not two; and `shell.masteredCount`'s over-count (carried from Lesson 4,
"as built" 3) grows from 8 stray ids to 33 and should be fixed in this step rather than carried again.

**Four questions for the teacher**, none blocking: which six letters part 1 uses, how much of Lesson 4 rides along,
whether the recordings would be easier taken letter-by-letter ("Baa, ba, bi, bu") than group-by-group, and the ones
carried over from Lesson 4. `docs/lesson-5/06-open-questions.md`.

Nothing was written to `site/`. `design-system/quran-landing/pages/qaida.md` is untouched: it is written after the
code exists and the user has seen it.

### Step 6 planned — Lesson 4, the first mark

*2026-09-20. The user: "please plan the lesson 4."*

**Specified, not built.** `docs/lesson-4/` holds ten files in the same shape as `docs/lesson-3/`: what the lesson
teaches, the mark data, the pool and formats, the page, every line of wording, accessibility, the options panel, the
file list and build order, and the open questions. `README.md` gives the read order.

**Lesson 4 is the first of three, and the plan is built around that.** Lesson 5 (zair) and Lesson 6 (paish) are the
same lesson with a different stroke, and lessons 7, 9 and 14 are marks again. So step 6 produces **`marks.js`** (the
data layer, a table of marks, no DOM — `shapes.js`'s counterpart) and **`mark-lesson.js`** (the page, driven by
`<html data-mark="fatha">`), with `lesson-4/5/6.html` as three thin pages. There is deliberately **no `lesson-4.js`**:
`lesson-3.js` is 41KB, and copying it twice would be three places to fix every bug. `practice.js` still does not change.

**Two things are new to the Qaida in this lesson.** The name set finally *does* something on a lesson page — the
title, the rail and all 29 item names say zabar or fatha — so every such line is a `{mark}` token re-filled on
`shell.onChange`. And **mixed review is load-bearing rather than a courtesy**: a pool where every item carries the mark
can never ask "does this carry the mark?", so the bare letters riding along from Lesson 2 are both the review the user
asked for and the only wrong answers that make the mark matter. They are chosen from the letters this student got
wrong in Lesson 2.

**Blocked on the user, and this is the whole point of the plan.** `09-open-questions.md` §1: lessons 2 and 3 were
answered with a letter's *name*; Lesson 4 is about a *sound*, and the Qaida has no recordings and transliteration is
switched off. The three ways out are laid out with examples — name the pair (buildable now, teaches seeing not
reading), write the sound in English letters (real reading, but transliteration the user turned off, and ʿa / ḥa / ṣa
are dishonest spellings), or by ear (the true Qaida way and the only one a screen reader can use — 29 new recordings,
of the *sound* "ba", not the letter name "Baa"). Claude's recommendation: build the first, build the third alongside
it switched off, never grade the second. §2 asks one part or two, with the numbers.

Nothing was written to `site/`. `design-system/quran-landing/pages/qaida.md` is untouched: it is written after the
code exists and the user has seen it.

### Step 4 planned, and Export settings added to the Qaida panel

*2026-09-19. The user: "plan the next lesson, do add the export settings… make a folder of md of lesson 2, so that
other models look at it for dev."*

**Lesson 2 is specified, not built.** `docs/lesson-2/` holds eleven files — the pedagogy, the `practice.js` API,
the storage extension and its validation, the page and its CSS, every line of wording, accessibility, the options
panel, the file list and build order, and the open questions. `README.md` in that folder gives the read order. It
is a specification another model builds from; the design record in `design-system/quran-landing/pages/qaida.md` is
written afterwards, once the code exists and the user has seen it.

**Three decisions, all in the Decisions table above.** Finishing is a **recommendation** rather than a gate; mixed
review **carries through every later lesson**; and **skipping ahead is allowed**, with advice, which overrules step
1's locks across the whole Qaida (`docs/lesson-2/09-going-in-order.md` — not built yet either).

**Export settings** now sit at the top of the Qaida options panel, the same as the landing page's
(`site/main.js:806-959`): every control registers under `"<section> :: <label>"`, **Export** turns the lot into one
block and copies it, **Import** reads that block back. That is how the Qaida's picks reach `setting.txt`. Two
things went with it: the **Words** section is named per page (`Words (home)`, `Words (lesson 1)`) so one block can
hold several pages without a title landing on the wrong one, and the **localhost gate was dropped**, so the panel
shows on the hosted preview the way the landing page's already does — the whole point of an Export button is that
someone else can send their picks back. One line, easily put back.

Checked with `node --check`. **Not seen in a browser** — the user previews it.
