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

**Step 8, Lesson 7 (tanween), is built** (2026-09-27, the user, choosing to build it despite the standing "plain no":
lessons 4–6's own tile-size question was still open at the time — see "Step 8 built — Lesson 7" in the step log for
what changed to make a lesson hold more than one mark, and for what is still the user's own to check). **Not yet
previewed.**

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

**Two PCs' work was merged on 2026-09-27** (branch `qaida-merge-otherpc`). `qaida-lesson-3` had built Lesson 6 and
planned Lesson 7; `qaida-home-and-lesson-1-fixes` had built step 7 (say it and listen back), fixed lessons 1–5, and
*separately* planned Lesson 6. The built Lesson 6 was kept and the second plan dropped; Lesson 6 gained the Say it
block. See "Merged" in the step log.

**Step 6, Lesson 6 (paish), is built, and not yet seen in a browser** (2026-09-21, the user: "next lesson plan is up, build it
up"). See "Step 6 built (Lesson 6)" below for what it is and where it differs. **Step 6 is still not done until lessons 4, 5 and
6 have all been previewed.** It was specified the same day ("plan the next lesson"): `docs/lesson-6/`
is the specification, seven files, and it holds only what is new on top of `docs/lesson-4/` and `docs/lesson-5/`. Paish
sits **above** the letter like zabar, so it needs **no new CSS** and carries none of Lesson 5's risk. The one genuinely
new thing: **`after` (one mark) becomes `against` (a list)** — Lesson 6 is told apart from **zabar and zair at once**,
and `marks.js`'s `after: 'kasra'` points at the wrong contrast (paish's hard one is zabar: same place, different shape).
`docs/lesson-6/06` §0 asks whether to build it now or after lessons 4 and 5 have been looked at.

**Step 8, Lesson 7 (tanween), is specified, not built** (2026-09-21, the user: "i guess plan next lesson"; *written as
step 7, renumbered when the voice step moved in*):
`docs/lesson-7/` is the specification, seven files, and it holds only what is new on top of `docs/lesson-4/`,
`docs/lesson-5/` and `docs/lesson-6/`. **It should not be built yet, and this is a plain no rather than a
preference** (`docs/lesson-7/06` §0): Lesson 6's blocking question — *can you tell بَ from بُ at the tile's size?* —
is unanswered, and Lesson 7 asks the student to tell **بَ from بً**, the same stroke once against twice. If the tile
is too small, the fix is in `qaida.css` and `mark-lesson.js`, the two files Lesson 7 leans on hardest. **Four
lessons now wait on one browser session.** What is genuinely new: **a lesson can hold more than one mark**
(three doubled marks, one per part, then all the letters), which Lesson 9 needs again.

**Step 7, saying it out loud, is built, and not yet seen in a browser** (2026-09-24): `docs/your-voice/` is the
specification and the "Step 7 built" entry in the step log below lists where the build differs. It **was step 10**
and moved to step 7 for one reason — lessons 6–14 are not written yet, and a thing that has to be in every lesson is
cheaper to be born with than retrofitted fourteen times. **The catch is still in `docs/your-voice/09` §1:**
`audio/manifest.json` is empty, so there is nothing for a student to match *against* until the teacher records the 29
letter names — one sitting, and it covers lessons 1, 2 and 3 at once. Until then the panel is honestly "record
yourself, hear yourself, keep it." **Step 7 is not done:** the five open questions were all built from their
recommendation, and none of it is seen in a browser yet. Lesson 6 was built on the other branch without it, and gained the
same block at the merge, so all six lesson pages have it.

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
| A letter is "known" | ~~Three right answers in a row *(2026-09-19: "i guess three")*~~ **Revised to two** *(2026-09-23, after using Lesson 2: "why 39 questions!!! if the user is doing good in a row, it means he knows")* |
| "You seem ready" | ~~Four fifths of the letters known~~ **Revised to seven tenths** *(2026-09-23, same note)*, **and no missed letter still shaky** *(2026-09-19: "4 fifth without mistakes, if mistake, repeat the mistake and practice all letters" — Claude's reading; the fraction itself changed 2026-09-23, `clean` did not)*. A mistake repeats the letter (more often, never straight away) and every letter stays in the mix |
| A writing board | **In every lesson, always available** *(2026-09-19: "we don't know when someone would need to write")*. A **Board** button in every lesson's top bar opens a blank board; "Trace it" stays as the shortcut to a letter just missed. Every later lesson copies the button and the tracer dialog |
| Wording | **Never harsh** *(2026-09-19)*. Plain, short, and a wrong answer says what the letter is and nothing more |
| Saying it out loud | **In every lesson** *(2026-09-22: "i want it in every lesson, because thats important")*. The student records their own voice and plays it against the teacher's. **Never scored** — the same rule as the tracing board, for a stronger reason — and **it never leaves the device**. `docs/your-voice/` |
| Lesson 3's length | **Split the big group in two, `target` stays whatever the engine's default is** *(2026-09-20, from three options shown with their numbers; that default was 3, revised to 2 on 2026-09-23 — see "A letter is 'known'" above)*. Six groups: 6 + 2 + 21 + 15 + 24 = 68 shapes, then the table. Position names: start / middle / end **of a word** |

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
| 6 | **Lessons 4–6: zabar, zair, paish,** each with its exercise and mixed review | `ui-ux-pro-max`, `full-output-enforcement` | **Lesson 4 built 2026-09-20, awaiting the user's preview** (`docs/lesson-4/` is the spec; `README.md` there lists where the build differs). **Lesson 5 built 2026-09-20, awaiting the user's preview** (`docs/lesson-5/` — the differences only; it assumes `docs/lesson-4/`; `README.md` there lists where the build differs). **Lesson 6 built 2026-09-21, awaiting the user's preview** ("next lesson plan is up, build it up" — taken as a yes to `docs/lesson-6/06`'s recommendations, including §0: built before 4 and 5 were previewed; `docs/lesson-6/` is the spec, seven files). One page file, `mark-lesson.js`, serves all three lessons. Mixed review carries through every later lesson (2026-09-19). Lesson 6 has the Say it block from step 7, added at the merge (2026-09-27). Checks: `node tools/qaida-check.js`, `qaida-marks-check.js` (Lesson 4's page), `qaida-lesson5-check.js`, `qaida-lesson6-check.js`, `qaida-lesson3-check.js` |
| 7 | **Say it and listen back:** the student records their own voice and plays it against the teacher's, **in every lesson** | `ui-ux-pro-max`, `minimalist-ui` | **Built 2026-09-24, awaiting the user's preview.** Specified in `docs/your-voice/`; the step log below lists where the build differs. *Was step 10;* moved here at the user's request — *"i want it in every lesson, because thats important"* — so lessons 6–14 are born with it instead of being retrofitted. Check: `node tools/qaida-voice-check.js` |
| 8 | **Lessons 7–9: tanween, zabar + alif, standing harakaat** (the two scripts write some of these marks differently) | `ui-ux-pro-max`, `full-output-enforcement` | Was step 7. **Lesson 7 specified 2026-09-21, not built** — `docs/lesson-7/`, seven files, the differences only. **Do not build before lessons 4–6 have been previewed** (`docs/lesson-7/06` §0). The scripts' difference is **font-only**: same three code points, drawn stacked in Indo-Pak and side by side in Madani, so it cannot show until the Indo-Pak font blocker is fixed at step 13 (`docs/lesson-7/02` §5) |
| 9 | **Lessons 10–14: wow and yaa (leen and madd), jazam** | `ui-ux-pro-max`, `full-output-enforcement` | Was step 8. Answered 2026-09-20: **jazam stays last**, after leen |
| 10 | **The rest of the recordings:** the marks in every lesson, and 3–4 example words per exercise | `ui-ux-pro-max`, `full-output-enforcement` | Was step 9. Each lesson adds its rows to the recording list as it's built |
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

**Two fixes after the user's first preview (2026-09-23, `fixes/lesson 2.txt`).** "The second option and the last
option were most likely to be correct, there should be spread": `practice.js`'s `makeQuestion` drew each question's
right-answer button from a fresh shuffle, fair only over the long run. It now draws the slot from a **shuffle bag**
(`drawPosition` — the trick behind Tetris's piece bag): every slot is used once before any repeat, so any run of
`choices` questions in a row covers every position exactly once. `tools/qaida-check.js` gained a check proving it
over 400 questions. "Lesson 2 takes too long… after a certain point, just glow up the button below": the "After the
last letter" behaviour already had a `"glow"` mode (built at step 1) that keeps the Next button pulsing once the
lesson recommends moving on — it just wasn't the default. Lesson 2's `data-finish` is now `"glow"` rather than
`"settle"`; practising stays unlimited, but the Next button no longer goes quiet once it is shown. Checked with
`node tools/qaida-check.js` (all pass) and `node --check`. **Not seen in a browser** — the user previews it.

**Two more, the same day, after the user kept using it.** A screenshot: Sheen's isolated form (a wide bowl that
dips well below the line it sits on) was overlapping `.choices` — `.prompt`, the box the question's big letter sits
in, was sized off `line-height`, and several letters (ش ص ض ع غ ق ن و ي…) draw real ink outside what a font's own
metrics claim. Two things, matching what Lesson 3's `data-band` prompt had already worked out for joined shapes
(`qaida.css`, "a joined shape hangs lower… so the question gets more room"): `.prompt`'s room is now 1.9x the glyph
size, not 1.35x, and a new **`shell.centerInk(box, el)`** (`shell.js`) nudges the glyph to put its *drawn* bounds —
read with `Range.getBoundingClientRect()`, the same idea as `trace.js`'s `measureText`-based centring, just for a
DOM span instead of a canvas — in the middle of the box, not its line box. Wired into `lesson-2.js`; also into
`lesson-3.js` and `mark-lesson.js`, which share `.prompt-glyph` and hadn't been previewed yet either.

And then: *"it still takes too long, like why 39 questions!!! like if the user is doing good in a row, it means he
knows!!!"* — a screenshot showed 13 of 29 known after 39 questions. `target: 3` and `readyAt: 0.8` came to a floor of
24 x 3 = 72 correct answers before the lesson would ever recommend moving on, which the user's own use of it says is
too many. **Revised: `target: 2`, `readyAt: 0.7`** (practice.js's `DEFAULTS`, `shell.js`'s `DRILL_TARGET`, and the
same two numbers duplicated in `shapes.js` and `marks.js`'s `stats()` — all four now agree), a floor of 21 x 2 = 42.
`clean` is untouched: a shaky letter is still advice, never a block. Every place a test hard-coded the old 24 x 3 /
"four fifths" arithmetic (`tools/qaida-check.js`, `qaida-page-check.js`, `qaida-lesson3-check.js`,
`qaida-lesson5-check.js`, `qaida-marks-check.js`) was worked through by hand and updated to 21 x 2 / "seven tenths";
one assertion in `qaida-page-check.js` ("switching script keeps what is known") was also leaning on the old numbers
to avoid a real, pre-existing race in that test (a live `setTimeout` auto-advance racing the test's own polling,
with no seeded random) landing exactly on "all 29 known" — it now checks the count itself rather than a template
string, which is what it meant to test regardless of the numbers. All five check scripts pass, `qaida-page-check.js`
run four times in a row to be sure of that race. Decisions table above updated; the 2026-09-19 numbers are struck
through, not deleted. **Not seen in a browser** — the user previews it.

**A third round, the next day (2026-09-24):** a screenshot — 33 questions, still 8 of 29 known — and *"like if the
user is doing good in a row, it means he knows!!! ask every letter twice randomly, if mistake made, ask one more
time… place these randoms close by so that the progress above moves quickly."* The weighted lottery (still the
engine's only way of choosing what to ask, even after the target/readyAt drop above) never *guarantees* an item gets
drawn — over a short session it can leave several letters untouched by chance, which is what the screenshot shows.
**`practice.js` gained a second way of choosing, opt-in (`deck: true`) and off everywhere except Lesson 2**, which
asked for it explicitly along with **`target: 1`** (`lesson-2.js`): a shuffled deck of every not-yet-known required
item, twice each; `buildDeck()`/`pickFromDeck()` drain it, and a miss splices one more turn back in 2-4 questions
ahead (`answer()`) — close by, never at the very end, never straight back. Once the deck is spent the drill falls
back to the same weighted draw as before, for practising past done. Lessons 3-5 (`shapes.js`/`marks.js`'s pools mix
required and review items, which the deck doesn't understand yet) are **untouched** — `deck` defaults `false`, so
nothing about them changed. `tools/qaida-check.js` gained a section proving a clean run is exactly 58 questions
(29 letters, twice each, none skipped, none repeated) and that one mistake costs exactly one more turn, arriving
5-8 questions later in the seeded runs tried. `qaida-page-check.js`'s "one right answer is not yet known" assertion
was written for the old target: 2 and became "already known" for target: 1. All three suites that touch Lesson 2
(`qaida-check.js`, `qaida-page-check.js`, `qaida-lesson3-check.js`, which shares `practice.js`) pass; `qaida-lesson5-check.js`
and `qaida-marks-check.js` each have one *unrelated* failure ("try again" now appears in the new voice-recorder
wording, tripping the old "no scolding" check) from the Step 7 work landing in the same tree — not touched here, and
not this step's to fix. **Not seen in a browser** — the user previews it.

**A fourth round, from three screenshots (2026-09-24): "remove the words, it looks cluttered… when 'Start again'
comes the entire thing moves down… when the golden words come, the button moves down."** Two faults, both visual,
not the drill:
1. **The "you seem ready" line said the same thing twice** — once gold, under the question (`.advice .ready-note`),
   and again at the very bottom by the star (`.end-line`), both on screen at once. `.ready-note` is now `sr-only` in
   `lesson-2.html`: still announced (the `.advice` region is still `aria-live="polite"`, and `.hidden` still toggles
   the same way it always did), never shown twice. The star and the glowing Next button are now the one and only
   visible "you're ready" moment.
2. **`.progress-row` jumped 44 - 24 = 20px the moment "Start again" appeared**, because the row's `min-height`
   (1.5rem, sized for the text alone) was smaller than `.reset`'s own `.link` min-height (44px, the tap target) — so
   the *row* grew the moment the button had something to clear, shoving the bar and the whole drill down with it.
   `qaida.css`'s `.progress-row` now reserves 44px always, hidden or not — the same trick `.prompt` already uses so
   the answers don't jump between letters. Fixing (1) also fixed the rest of the "button moves down" complaint,
   since the gold line no longer occupies any visible space to begin with. `qaida-page-check.js` still passes (three
   runs, given its real timers). **Not seen in a browser** — the user previews it.

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

### Step 6 built (Lesson 6) — the third mark, and two marks riding along

*2026-09-21. The user: "next lesson plan is up, build it up."*

**Built.** `lesson-6.html` (Lesson 5's page with `data-mark="damma"`, `data-twins="alternate"`, `data-board="quad"`,
`data-arrows="last"` and its own wording), and edits to `marks.js` (`after` → `against`, a list; `othersOf`; `{others}`;
`twinItems` takes `marks`; `reviewKeys` reaches back to lessons 4 *and* 5; `boardRows` returns `others`), `mark-lesson.js`
(`twinMode`, `twinsFor`, `boardMode` learns `quad`, `arrowBefore`, `pairOf` loops the middle cells), `shell.js` (Lesson 6's row),
`qaida.css` (`.pair.quad` and its narrow-screen rule, nothing else — no `[data-sits='above']`, `.mark-tile` untouched),
`qaida-options.js` (the three-way twins row, `quartet` on the board row, an arrows row) and `audio/manifest.json`
(`"damma": {}`). `practice.js` did not change. Lessons 4 and 5 come out identical: their `against` is `[]` and `['fatha']`.

**Where it differs from `docs/lesson-6/`:**
1. **The alternation is by a teaching order, not by position in the open part.** The spec's `others[(i + group) % n]` with `i`
   the index inside the part gives a letter a different `i` in part 2 (ب is 0 of 6, then 1 of 29), so it would not flip.
   `twinsFor` orders the letters as the mark's own six then the rest, and picks `(place + part) % n`: part 1 is balanced
   (three zabar, three zair), and every letter really does meet the other mark in part 2.
2. **`trio` on Lesson 6 shows the nearest mark (zabar)**, since the spec's panel keeps `trio` as a choice and does not say which.
3. **`data-arrows`** is read by the page (`last` for the quartet, `all` otherwise; `none` works anywhere), and the panel row
   appears only on a lesson with two earlier marks.
4. **`boardRows` dropped `other`** for `others` as `03` §7 says; the two Lesson 5 assertions in `qaida-check.js` that read it were
   updated, and are the only existing checks changed.
5. **The line under the title is mine** ("A third mark, and the shape is what tells it apart.") and so is the end line
   ("You can tell all three marks apart."), which is the spec's; both have their own text fields.

**Checked, and passing:** `node --check` on every changed script; `node tools/qaida-check.js` (a new Lesson 6 block: `against`,
the four distinct ids of one letter, 12 twins, counts of 29 not 87, `{others}` in both name sets, review reaching back to lessons 4
and 5, the board's `others`, the engine finding a twin among the wrong answers); the new `node tools/qaida-lesson6-check.js`
(the real page in a hand-made DOM, including alternation and its flip, both/off/`on`, a full run to finished at four fifths of the
29, the name set switching all four columns, and the other script); and lessons 2, 3, 4 and 5's page checks unchanged.
`qaida-lesson3-check.js` failed once on "the table asks about every group" and passed five reruns; it is random and Lesson 3's
code was not touched. **Not seen in a browser** — the user previews it, and `docs/lesson-6/05` §4 is the list. Look first at
whether **بَ and بُ can be told apart at the tile's size** (`05` §4 item 2), then the paish curl on **ث ش ل ج ح خ ع غ و**, then the
quartet as a whole. `recordings.html` should now list 29 damma rows on its own. `design-system/quran-landing/pages/qaida.md` is
not updated: it is written once the user has seen the pages.

### Step 8 built — Lesson 7, tanween

*2026-09-27. The user, asked directly whether "the next in line" meant Lesson 7 despite the standing block
(`docs/lesson-7/06` §0's "plain no" — lessons 4–6's tile-size question was answered "hard to tell apart" earlier the
same day, then a tile-size fix went in, but not yet re-confirmed by the user): "Lesson 7 (tanween)."* Built from
`docs/lesson-7/`, following its build order (`05` §2) exactly, checking after every step.

**The one genuinely new idea, built as specified: a lesson can hold more than one mark.** `marks.js` gained `SETS`
(`data-mark="tanween"` resolves to `[fathatain, kasratain, dammatain]`), `setOf`/`marksOf`, and `partsOf(list)` (one
mark → the same two parts lessons 4–6 already have; several → one part per mark, then a last part covering all 29
letters, one mark each by rotation through the alphabet). Every item gained a `parts` array in place of a single
`group` number, so a letter met in a warm-up *and* drilled again in the last part is one item, not two — `inPart`,
`poolFor`, `sizes` and `stats` all read `.parts` now. **The one-mark case is unchanged by all of it**: `marks.allItems`,
`boardRows` and `sampleOf` all still accept a bare mark object and a plain part number (1 or 2), exactly as lessons
4–6 already call them, so **none of the four existing check scripts needed a rewrite** — only four assertions that
read `item.group` directly became `item.parts.includes(n)` / `item.parts.length === 0`, in `qaida-check.js`.

**`mark-lesson.js`'s `mark` is now the OPEN PART's mark**, not a fixed one, kept current by `setGroup()`: `say()`,
the title glyph, the rail's glyph and every board caption already read from it, so they update correctly across all
four parts with no further change. `twinMarksFor(item)` decides per item, not per page, which marks it is told
apart from: a warm-up part's single counterpart (بً against بَ — "one or two?"), or, in the last part, the OTHER
two doubled marks (بً against بٌ and بٍ — "which two?", `docs/lesson-7/03` §5's whole point). `markTile` writes
`data-sits` per tile (moved off `:root` in `qaida.css`, `.mark-tile[data-sits='below']`), since the last part's
quartet puts marks above *and* below in the same row — the one CSS change this lesson needed. The board's quartet
(`ب بً بٌ بٍ`) needed no new markup: `boardRows`'s `others` argument is `own.slice(1)` in the last part (the two
tanweens besides the row's own/final one) and the single counterpart in a warm-up, so the existing pair/trio/quad
code drew both without a structural change.

**One real bug found and fixed while building, not in the spec:** the last part's rotation (`markAt`, which mark a
letter gets) was keyed to `shell.lettersOf()`'s own order — which differs between Madani and Indo-Pak (و/ه swap) —
so the same letter could land on a different tanween depending on script, breaking "switching script keeps every
letter's credit" for the first time in the Qaida. Fixed by keying the rotation to the letter's place in the
**Madani** order always, resolved separately from which script is currently drawn.

**Where the build differs from `docs/lesson-7/`:**
1. **The halo stays single-mark, not per-tile** (docs `03` §8 suggested `markBox`/`positionHalos` take an explicit
   stroke). Not needed: a halo has only ever appeared on the one `.mark-tile.marked` cell in a row, which is always
   the open part's own mark already — 'other'-kind tiles never had one, on any lesson. Simpler, and provably
   equivalent; noted here rather than silently done.
2. **The quartet's tile order** is bare, then the two other tanweens, then the row's own (the existing pair/trio/quad
   code's order), not literally "bare, then the three doubled marks in lesson order" as `04` §4 pictures it. All
   four are present and correctly labelled either way; only the left-to-right order differs.
3. **The "twins row's label depends on the part" and "board row" panel refinements** (`04` §7, items 2 and 3) are
   built in substance (the Part row is built from the lesson's own parts; "auto" is offered and defaults) but the
   twins row's *title* text still reads the same regardless of which part is open — a cosmetic gap, not a functional
   one, left for a later pass.

**Checked, and passing:** every `node --check`; the full suite (`qaida-check.js` — including a new Lesson 7 block:
the three rows, `against` on all three, `partsOf` for one mark and for the set, the four parts' sizes `[6,6,6,29]`,
the last part's spread `10/10/9`, seven distinct ids for one letter, mastery surviving both a script switch and the
one-part/other-part split, `masteredCount` with `cp` as a list — `qaida-marks-check.js`, `qaida-lesson5-check.js`,
`qaida-lesson6-check.js` (all three unchanged), `qaida-lesson3-check.js`, `qaida-voice-check.js`, `qaida-page-check.js`,
and the new `qaida-lesson7-check.js` (the real page in a hand-made DOM: four rail buttons naming their own mark, a
trio in a warm-up and a quartet in the last part, kasratain's tiles alone carrying `data-sits="below"` even inside a
mixed row, **the one check that matters most — 300 doubled-mark questions in a row, every one offering another
doubled mark among the wrong answers and never the single one** — finishing gated by the last part alone, the name
set changing all four rail names, Indo-Pak, and the markup). `recordings.html` confirmed: 203 rows now (was 116),
the 87 new ones all tanween sounds, none of them a letter's name.

**Seen working in the browser pane** (not by the user): all four parts, the quartet with all three doubled marks
correctly attached and correctly placed above/below, the options panel's Part row (four buttons, named correctly)
and its new "A trio, then all three" board default, and — read directly off a live question — "Ghayn with
fathatain" offered against "Ghayn with kasratain" as a wrong answer, exactly the contrast the lesson is for. **Not
seen by the user.** The blocking browser checklist is `docs/lesson-7/05` §4; item 1 (بَ against بً, and بُ against
بٌ, at the tile's size, in both faces and both themes) is the one that answers the question this lesson was built
ahead of.

### Step 8 planned (Lesson 7) — tanween, and a lesson with three marks

*2026-09-21. The user: "i guess plan next lesson."*

**Specified, not built.** `docs/lesson-7/` is **seven files**, thin like `docs/lesson-5/` and `docs/lesson-6/`: it
assumes all three earlier folders and holds only what is new. Nothing was written to `site/`.

**Lesson 7 is one idea, three shapes.** ً ٌ ٍ (U+064B, U+064C, U+064D) are the marks of lessons 4–6 written twice,
and each adds an *n*: بَ "ba" → بً "ban". Two sit above and one below, on the same six letters their single
counterparts used.

**The one thing genuinely new, and the only part with real code in it: a lesson can hold more than one mark.**
`mark-lesson.js` reads one `mark` for the whole page — `mark.cp`, `mark.sits`, `mark.first`, `mark.audio`,
`marks.COUNT` at two parts, one `cp` suffix in `shell.masteredCount`. So `marks.js` gains `SETS` (`data-mark="tanween"`
resolves to a list), `partsOf` (one mark → the two parts lessons 4–6 already have; three marks → one part each, then
all the letters), and an item carries `parts: [1, 4]` instead of a single `group`. **Lessons 4, 5 and 6 must come out
identical, and that is the test** — the one-mark assertions are written first, before any new row exists.
`docs/lesson-7/03`.

**Four smaller findings**, each written where it happens: the twins change meaning **by part** — the single
counterpart in a warm-up (*one or two?*), the other two tanweens in the last part (*which two?*), and getting that
wrong quietly turns part 4 into part 1; the last part drills **29 letters, not 87** (one tanween each, by alphabet
place; the board still shows all three); `:root[data-sits='below']` has to move to the tile, because part 4's board
row carries marks above *and* below; and `markBox`/the halo must take the stroke they are drawing, or the ring is
drawn correctly for the wrong mark.

**The scripts' difference that step 8's row (then step 7) warns about is font-only.** Both scripts encode the same three
characters; Indo-Pak stacks the two strokes and Madani sets them side by side. The Indo-Pak face here is the Noto
Naskh stand-in (already a launch blocker), so an Indo-Pak student sees Madani tanween and **no code in this lesson
can change that** — it is the font, at step 13. `docs/lesson-7/02` §5.

**Six questions for the teacher.** §0 is the only blocking one and the answer is a plain **no, not yet**: Lesson 6's
own blocking question (بَ against بُ at tile size) is unanswered, and this lesson's whole premise is a harder version
of it. The rest: four parts or two (the arithmetic is the same 47 items either way), the Urdu names (*do zabar*?),
all 29 letters or only the ones that really carry tanween, 87 recordings and whether to record letter-by-letter, and
the "open" tanween (U+08F0–2), which is tajweed and out of this pass. `docs/lesson-7/06`.

`design-system/quran-landing/pages/qaida.md` is untouched: it is written after the code exists and the user has seen it.

### Step 6 planned (Lesson 6) — the third mark, and two marks riding along

*2026-09-21. The user: "plan the next lesson."*

**Specified, not built.** `docs/lesson-6/` is **seven files**, and like `docs/lesson-5/` it is deliberately thin: it
assumes `docs/lesson-4/` (the engine contract, the page, the formats) and `docs/lesson-5/` (twins, `which-mark`, the
board that shows where the stroke moved), and holds only what is new. `MARKS.damma` was written on 2026-09-20 with the
rest. Nothing was written to `site/`.

**Lesson 6 is the cheap one, and the plan says so.** Paish sits **above** the letter, so `[data-sits='below']` simply
does not apply and Lesson 4's tile rules are already the right ones: **no new CSS except one `.pair.quad` rule**, and
none of Lesson 5's below-the-line risk. `mark-lesson.js` still serves it through `<html data-mark="damma">`; there is no
`lesson-6.js`; `practice.js` does not change.

**The one thing that is genuinely new, and the only part with real code in it: `after` becomes `against`.** Today
`marks.js` has `after: 'kasra'` on the damma row and `otherOf()` returns one mark. Both are wrong for this lesson.
Paish's hard contrast is **zabar** — same place, different shape — not the zair that happens to come just before it; a
lesson that rides only zair along is answerable by "is it above or below?", which the student learnt last lesson. And
after Lesson 6 the student has to read بَ بِ بُ cold, which `QAIDA-CONTENT.md` item 6 already asked for ("paish items
mandatory, zabar + zair review"). So `after` (a string) becomes **`against` (a list in lesson order)**, `otherOf` is its
first entry, and lessons 4 and 5 come out identical — `[]` and `['fatha']`. `docs/lesson-6/03`.

**Five smaller findings**, each written where it happens: two sets of twins would be **60% of part 1's questions**
(Lesson 5 measured 45% with one), so the default is **one twin per letter, alternating, flipping between the parts**, with
"both at once" a row in the panel; `{others}` is a second token ("zabar and zair") so one text field serves lines that
name both; `boardRows`'s `other` becomes `others` and the board becomes a **quartet** (ب بَ بِ بُ), which makes `trio`
and `quad` one code path and gives lessons 7, 9 and 14 theirs free; `reviewKeys` reaches back to lessons 4 *and* 5;
and **paish is drawn as a miniature و**, which earns one line on the board and matters again in Lesson 11.

**Six questions for the teacher**, none blocking. The first is the real one: **should Lesson 6 be built now, or after
lessons 4 and 5 have been opened in a browser?** Three unpreviewed lessons share one page file, one stylesheet and one
data file. Claude's recommendation: preview first — but Lesson 6 adds little risk of its own, so if the user wants all
three in one sitting, build it. `docs/lesson-6/06-open-questions.md`.

`design-system/quran-landing/pages/qaida.md` is untouched: it is written after the code exists and the user has seen it.

### Step 7 planned — say it and listen back

*2026-09-22. The user: "i wanted to have a way to record audio, so that the student could play back and match his
pronounciation with the audio. i want it in every lesson, because thats important."*

**Specified, not built.** `docs/your-voice/` is ten files in the shape of `docs/lesson-4/`; its `README.md` gives the
read order and `09-open-questions.md` is the one to read first. Nothing was written to `site/`.

**It was step 10 and is now step 7** (old steps 7, 8 and 9 each move down one; steps 11–13 keep their numbers, so the
options panels and `recordings.html` still go at step 13). The reason is the one that pulled sound and tracing forward
on 2026-09-18: lessons 6–14 are not written, and a thing that must be in *every* lesson is one block copied into nine
new pages if it is built now, or a retrofit of fourteen if it is built at the end. **Recommended order: this, then
Lesson 6** — Lesson 6 is a thin page that `mark-lesson.js` already serves, so it costs nothing to let it be born with
the block.

**What it is.** A `<dialog class="echo">` and `voice.js`, built the way `trace.js` is: a top-bar **Say it** button in
every lesson, a second one beside **Hear it** on whatever letter is in front of you, and a panel with two lanes — the
teacher and you — a big record button, and "One after the other". `practice.js`, `shell.js`, `marks.js` and
`shapes.js` do not change; lessons 2, 3 and the three mark lessons gain one handler each beside their existing
`.hear` one, so `mark-lesson.js`'s single line covers lessons 4, 5 **and 6**.

**Three rules it is built under**, each written where it happens:
1. **Nothing is scored.** No percentage, no tick, no "try again". The honest tools for scoring pronunciation would be
   wrong most often on exactly ع ح ق ص ض ط ظ ء — the letters a beginner most needs encouragement through — and it is
   the same rule `trace.js` already lives under, for a stronger reason. Two waveforms drawn the same way are allowed,
   because they show length and stress without making a claim; a row in the options panel turns them off.
2. **It never leaves the device.** IndexedDB, not `localStorage` (which is where the student's progress lives, and one
   oversized clip would lose it). No upload, no endpoint, no `fetch` in either new file — and the check script asserts
   that by reading them.
3. **The microphone is asked for once, on a tap**, never on load, and every track is stopped and the `AudioContext`
   closed on stop and on close. A recording indicator still lit after the panel closes is the first item on the user's
   preview checklist.

**The catch, and it is the whole of `09-open-questions.md` §1.** `audio/manifest.json` is still empty — `letters: {}`,
`fatha: {}`, `kasra: {}` — so there is nothing to match *against*. Half the feature (record, hear yourself, keep it)
works with an empty manifest; the half the user described does not. The ask is small and specific: **the 29 letter
names, one sitting**, which turns it on across lessons 1, 2 and 3 at once. The teacher's lane then appears per letter
with no release, exactly as `audio.js` already works.

**Five questions, none blocking**, each with a recommendation that is built and is one row from being changed:
where the button lives, whether a student can send a recording to the teacher (**recommended: no** — and if ever,
"save it to my device", not an upload), whether the advice strip gets one, whether the letter tiles get a second mark,
and whether the recordings are easier taken letter by letter than lesson by lesson.

### Step 7 built — say it and listen back

*2026-09-24, built from the recommendations in `docs/your-voice/09-open-questions.md`, none of which were asked.*

**Built.** `voice-store.js` (IndexedDB, no DOM — the counterpart of `shapes.js`/`marks.js`) and `voice.js` (the panel,
the recorder, the level ring, the waveform) are new. `qaida.css` gained one `ECHO` block. All five lesson pages
(`lesson-1.html` … `lesson-5.html`) gained the two `<script>` lines, the top-bar **Say it** button, the
`<dialog class="echo">` block, and a **Say it** button in the after-strip (Lesson 1's `.current` strip; the `.after`
strip on lessons 2–5) — the same block `04-where-it-appears.md` §6 says lessons 6–14 copy in as they are written.
`qaida.js`, `lesson-2.js`, `lesson-3.js` and `mark-lesson.js` each gained one `.say`/`.current-say` handler beside
their existing `.hear` one, and a `lastItem` getter on `window.qaida` so the top-bar button knows what to open on.
`audio.js` gained `urlFor(kind, glyph)`, nothing else. `home.js`'s Start again and the options panel's Clear
everything both now also call `voice-store.clear()` — a no-op today, since `index.html` was left untouched and
doesn't load `voice-store.js` (per the file list in `08-files-and-steps.md` §1), but wired correctly for whenever it
does. `qaida-options.js` gained a "Your voice" section, in the same place on every page `07-options-panel.md` §1
asks for. `tools/qaida-voice-check.js` is the check, 35 checks with no browser: `voice-store.js` against a fake
IndexedDB (the caps, the eviction, re-recording replacing, a damaged record ignored, resolving harmlessly when the
database refuses to open), `voice.js` against the real `lesson-1.html` with a fake microphone and `MediaRecorder`
(the states, both teardown paths, denial, muting, `shell.onChange` closing the panel, no buttons at all with no
`MediaRecorder`), a source-text check that neither file contains a network call of any kind, and that `home.js`'s
Start again reaches `voice-store.clear()`.

**Where it differs from `docs/your-voice/`** — four points, each a deliberate simplification, not an oversight:

1. **The teacher's own clip never gets a waveform.** `03-the-panel.md` §5 says it is "built with `decodeAudioData` …
   on the fetched file," but `08-files-and-steps.md` §3's own check (item 18) demands no network call of any kind in
   either file — the two cannot both be true. Since the same section allows a lane to draw nothing when a decode
   isn't attempted ("a missing picture is not an error message"), that is what happens here: only the student's own
   clip, decoded straight from the recorded `Blob`, ever gets a peak envelope. The play button for the teacher's clip
   is unaffected, and the waveform is scaled against the recording-length cap instead of the teacher's own length, so
   a short clip still visibly fills less of the box.
2. **"The shape of the sound" is On/Off, not "Both voices / Only yours / Off."** Once only the student's clip is ever
   drawn, the first two choices are the same picture — offering them separately would be a control with no observable
   difference, which is worse than not offering it.
3. **The dot on Say it is refreshed by a light poll** (`document.hidden ? skip : check every 600ms`, one indexed
   lookup only when the item actually changed), not by an event fired when "the item in view" changes — no such event
   exists on the four lesson pages today, and adding one to each would be a bigger change than the dot itself.
   `09-open-questions.md` §5 already says nothing is lost if this stays imperfect.
4. **"Delete every recording of my voice" was built in the real Settings dialog (`.chooser`, on all five lesson
   pages) from the start**, exactly as `07-options-panel.md` §4 asks, with the temporary options panel's own copy
   calling the same `qaidaEcho.deleteAll()`. The count line ("{n} recordings, about {size}.") appears in both places.

**Not built, on purpose:** sending a recording to the teacher (§3's own recommendation is no), a Say it in the
advice strip (§4, "leave it"), a second dot on Lesson 1's grid tiles (§5, "not this step"), and the options panel's
own "why there is no Say it button here" line for a browser that cannot record (`06-accessibility-and-privacy.md`
§5 — explicitly step 13, with the rest of the panel).

**Not seen in a browser.** The user previews it (`node serve.js`, then `http://localhost:8777/site/qaida/lesson-1.html`
— needs `https` or `localhost`, never `file://`). `08-files-and-steps.md` §4 is the checklist, in order: the
microphone light going dark after closing the panel matters most; then that the permission is asked for only on the
first tap of Record, not on load; the ring moving with your voice; the top bar still fitting on a phone at four
tools; playback sounding like you, not distorted; whether 0.4s is the right gap for "One after the other"; whether
the waveform reads as a picture or a score; a clip surviving a close-and-reopen; both deletes actually deleting,
after a reload; and the same in dark and light. `design-system/quran-landing/pages/qaida.md` is not updated: it is
written once the user has seen the page.

### Merged — two PCs' work, 2026-09-27

*The user: "i have the zip from my other pc, where the lessons and some fixes are made, but i don't want that there
should be conflicts." Then: "go ahead, and make necessary adjustments."*

Both branches started from `9d37559` (Lesson 3). `qaida-lesson-3` went on to build Lesson 6 and plan Lesson 7;
`qaida-home-and-lesson-1-fixes` built step 7 (say it and listen back), fixed lessons 1–5 (a letter known at **two** in a
row, ready at **seven tenths**, `shell.centerInk` for glyphs whose ink hangs below the line, the Lesson 2 length fix)
and wrote **a second, different plan for Lesson 6**. They were merged on the branch `qaida-merge-otherpc`. Git merged
every code file by itself; only this file and five `docs/lesson-6/` files collided.

**What was decided:**
1. **Lesson 6 keeps the plan it was built from** (`docs/lesson-6/`, 2026-09-21: `after` → `against`). The 2026-09-24
   plan (`after: 'fatha'` plus an `also` field, a `set` board) was dropped, along with its two files of its own
   (`02-the-mark.md`, `03-the-pool-and-review.md`). Both plans found the same thing — paish's hard contrast is zabar,
   not zair — and the built one already does it. The dropped plan is still in git: `git show
   889229e:docs/lesson-6/README.md`.
2. **Lesson 6 gained the Say it block** — the same 104 lines lessons 1–5 got at step 7 (the two `<script>` lines, the
   top-bar button, the after-strip button, `<dialog class="echo">`, the Settings dialog's voice section), copied from
   `lesson-5.html`. `mark-lesson.js`'s one `.say` handler already covered it.
3. **`qaida-lesson6-check.js` moved to the new rule**, exactly as `qaida-lesson5-check.js` did on the other branch:
   `groupCosts()` is 10 and 42 right answers, and the not-finished case is 15 letters under seven tenths.
4. **Steps renumbered to the voice branch's order:** step 7 is say it and listen back, Lesson 7's step is **8**
   (`docs/lesson-7/` and `docs/lesson-6/05` updated to match).

**Carried over from the dropped plan, for the Lesson 6 preview:** paish is taller than zabar, so **ا ل ط ظ ك** may clip
at the top of a tile; the glowing Next button the user asked for on Lesson 2 could go on lessons 4–6; and its §1 —
**how long a mark lesson should take** (Lesson 2 now asks every letter twice and is done; lessons 3–6 keep asking until
enough are known) — is still a real question for the teacher.

**Checked, and passing:** `node --check` on every script in `site/qaida/`; `qaida-check.js`, `qaida-page-check.js`,
`qaida-marks-check.js`, `qaida-lesson3-check.js`, `qaida-lesson5-check.js`, `qaida-lesson6-check.js` and
`qaida-voice-check.js`. Every WebP (166) was identical on both PCs.

### First preview, 2026-09-27 — the tile-size fix, and a new request

*The user previewed lessons 4–6 for the first time and answered `docs/lesson-7/06` §0's blocking question:*
**"بَ and بُ are hard to tell apart at this size."**

**Built.** The quartet board's tiles (`.pair.feature.quad` in `qaida.css`, Lesson 6 only) had been given a smaller
`--tile` than the trio's for no reason tied to legibility — a four-across row measured tighter than a three-across
one. Raised to match the trio (`clamp(4rem, 3.25rem + 3.4vw, 6rem)`, `clamp(4rem, 22vw, 5.5rem)` under 479px), with
the quartet's column floor widened to match (25rem → 27rem). Separately: the options panel's existing **Letter
size: Large** switch had never reached any of the three comparison boards (`.pair.feature`, `.pair.feature.trio`,
`.pair.feature.quad`) — each declares its own `--tile` at the same specificity as the switch's selector, so whichever
rule sat later in the file always won regardless of the setting. Added `:root[data-size='large']` overrides for all
three, scaled by the same ~1.2x the switch already applies to the root tile. **Not yet re-checked by the user** —
this is the fix for the exact question just answered, so the tile-size half of `docs/lesson-7/06` §0 wants a second
look before Lesson 7 is unblocked.

**The bigger ask, the same message:** real words, not just isolated letter+mark tiles — the traditional Qaida
*hijjey* (spelling) method, the user's own example: "kaf zabar ka, ta zabar ta, kata (read from the back), ba zabar
ba, kataba (altogether)." This is now in scope (`QAIDA-CONTENT.md`, "Connected reading").

**Answered in chat, 2026-09-27:** inside each mark lesson, right after the drill (not a separate step at the end).
Scoring was "i don't know" — Claude's call, following the precedent already set: shown only, never scored, the same
rule "Write it" and "Say it" already live under. Words: Claude proposes, the teacher confirms — not supplied blind.

**Built, the same day.** `site/qaida/spell.js`, a new small module (loaded after `mark-lesson.js`, before
`qaida-options.js`), and a `<section class="spell">` block added to `lesson-4.html`, `lesson-5.html` and
`lesson-6.html`, right after `.drill` and before the footer. One word per lesson, real and correctly diacritized —
never invented, the same rule the aayat overlay lives under — built only from marks the student has met by that
lesson:
- **Lesson 4 (fatha):** كَتَبَ, *kataba*, "he wrote" — the user's own example, and the only real Form I pattern that
  is fatha throughout (فَعَلَ).
- **Lesson 5 (kasra):** شَرِبَ, *shariba*, "he drank" — middle letter kasra (this lesson's own mark), outer two
  fatha (already known from Lesson 4), so the word itself is the fatha/kasra contrast the lesson drills.
- **Lesson 6 (damma):** كَرُمَ, *karuma*, "he was generous" — middle letter damma against fatha either side, paish's
  own contrast (`docs/lesson-6/03` §1: paish is told apart from zabar, not zair, so no kasra needed here).

**These three are Claude's candidates, not the teacher's own — check them, the same care as the aayat, before they
ship.** The step-through matches the user's own five stages exactly: name a letter with its mark, and once a second
letter has been named, blend everything revealed so far; the last blend is the whole word, with its meaning. A word
is resolved through `shell.lettersOf()` by key, not a hardcoded glyph, so it still reads correctly in Indo-Pak (moot
for these six letters, none of which differ between the scripts, but it costs nothing to do it the way the rest of
the page does). "Hear it" plays each letter's own recording (or the wordless stand-in hum, exactly as everywhere
else) — there is no whole-word recording yet, so the blend and final steps have no sound button.

Every line is tagged `data-words`/`data-words-attr`, so it picked up a "Words (lesson N)" text field automatically —
no changes to `qaida-options.js` were needed. `marks.js` is untouched; `mark-lesson.js` gained a few lines (below).

**Second round, the same day, before the user had even previewed the first:** four notes from a first look. (1)
**"We should know where we are in the entire words, and keep it separate from the introduction of zabar/zair/paish,
like Part 1 and Part 2"** — one word was never going to be enough to show a real range, and a single "Spell a word"
block bolted on under the drill read as part of the same progression as the Part 1/2 rail, which it isn't. Built: a
small, deliberately distinct tracker (`.spell-words`, numbered circular buttons, class `.word-step` — never `.band`)
showing "Word {n} of {total}", with **three words now walked through per lesson** instead of one, each reachable by
tapping its number. (2) **"2-3 words for the walkthrough and more words"** — added a second, separate list,
**"More words"**, shown whole and never stepped through (no tracker, no controls): four more per lesson, real words
in the same pattern, for a wider look once the walkthrough is done. (3) **"No speech for now"** — the "Hear it"
button is gone from this block entirely; nothing here plays audio until there is a real recording to attach to a
word (Lesson 1–6's own "Hear it" buttons, on individual letters, are untouched). (4) **"There is a next lesson but
no way to go back"** — `mark-lesson.js` gained a `paintPrev()` (called from `render()`, beside `paintNext()`) and
each page gained a `.prev` link in `.onward`, beside "Back to the Qaida": Lesson 4's is a plain link to Lesson 3
("Previous: Letter shapes" — Lesson 3's title has no zabar/fatha variant, so it needs no JS); Lessons 5 and 6's carry
`data-prev-zabar`/`data-prev-fatha`, exactly mirroring how "Next" already works, and are always live links (the
lesson before this one is always built by the time this page is reached, unlike "Next", which may not be).
**Unrelated, filed under the same message:** `qaida-options.js`'s **Options panel now starts closed everywhere** — it
used to auto-open on any screen wider than 767px, which is why it appeared already expanded in a screenshot; now
`panel.open = false` unconditionally.

**Words, walked through and extra, per lesson (all candidates — check every one, the aayat's own rule):**
- **Lesson 4 (fatha):** كَتَبَ *kataba* "he wrote" (the user's own example) → ذَهَبَ *dhahaba* "he went" →
  خَرَجَ *kharaja* "he went out". More: جَلَسَ "he sat", فَتَحَ "he opened", دَخَلَ "he entered", رَجَعَ "he returned".
- **Lesson 5 (kasra):** شَرِبَ *shariba* "he drank" → عَلِمَ *'alima* "he knew" → سَمِعَ *sami'a* "he heard" — all
  fatha/kasra, the lesson's own contrast. More: فَهِمَ "he understood", حَسِبَ "he thought", وَرِثَ "he inherited".
- **Lesson 6 (damma):** كَرُمَ *karuma* "he was generous" → كَبُرَ *kabura* "he was great" → قَرُبَ *qaruba*
  "he was near" — all fatha/damma, paish's own contrast (`docs/lesson-6/03` §1: told apart from zabar, not zair).
  More: صَغُرَ "he was small", بَعُدَ "he was far", حَسُنَ "he was good".

A word is resolved through `shell.lettersOf()` by key, not a hardcoded glyph — load-bearing here, not just tidy:
`dhahaba` and `fahima` both use ه, one of the letters that really differs in Indo-Pak (ہ), so a hardcoded Madani
glyph would have been wrong the moment someone switched scripts. `marks.js` and `mark-lesson.js`'s existing behaviour
are otherwise untouched (`paintPrev()`/`.prev` is the only new surface on the page's own script), so every existing
check still passes (`qaida-check.js`, `qaida-marks-check.js`, `qaida-lesson5-check.js`, `qaida-lesson6-check.js`,
`qaida-lesson3-check.js`, `qaida-voice-check.js`, `qaida-page-check.js`); `spell.js` has no check script of its own
yet. **Seen working in the browser pane:** the tile-size fix (confirmed via computed style, `--tile` changes under
"Large"), the options panel closed on load, all three lessons' word pickers (clicking "2" jumps straight to word 2,
step 0), the full walkthrough of Lesson 4's first word end to end including "Next word" handing off to word 2, the
"More words" list, and Lesson 6's "Previous: Kasra" following the name-set switch.

### Fourth round, the same day — a real font bug found, and the extra words become their own page

*The user's first look at the above, three screenshots and a photo of a printed Qaida's own "mashq" (exercise) page.*

**"The haa in urdu and arabic should be the same."** Checked in the browser pane by forcing the script both ways on
the word دَهَبَ *dhahaba*: in Madani the medial haa shapes normally; **switched to Indo-Pak, it renders broken** —
not a bug in `spell.js` (the letter resolves correctly, ہ against ه, exactly as designed), but the **known font
stand-in** (`WEBSITE-BUILD.md` §8, `QAIDA-CONTENT.md`: "Google Fonts has no true Indo-Pak mushaf font") failing in a
place nothing before this had tested: Noto Naskh Arabic, an Arabic font pressed into service for Urdu, does not join
ہ (U+06C1) properly when it sits between two other letters. Every earlier Indo-Pak surface on the site shows letters
**one at a time** (Lesson 1's tiles, the mark lessons' own tiles), so this is the **first place connected Indo-Pak
text exists at all**, and the first place the gap actually shows. **Confirmed working:** switching **Indo-Pak
lettering** to **Scheherazade New** in Settings joins ہ correctly. Not changed as the site's default — that is a
sitewide choice (every Indo-Pak letter everywhere, not just this feature) already covered by the existing "before
launch, get a licensed Indo-Pak font" blocker; noted here so it isn't lost, with a working stopgap in hand.

**"Don't you think there should be a separate page for the more words... make a table of 12 words, keep the meanings
out"** (with the photo). Agreed, and built that way: a printed Qaida's own exercise page is a real precedent, not
just a tidier layout, and keeping the walkthrough and the reading practice on two different pages stops the lesson
page from reading as one long, mixed activity. **Built:** `exercise.js` (a new, small data layer — glyphs only, no
meanings, no transliteration) and `exercise-4.html`, `exercise-5.html`, `exercise-6.html`, one page per lesson in
exactly mark-lesson.js's own shape (one script, `data-mark` says which). Twelve real words per lesson, in a plain
RTL grid (hairline dividers, no cards), a header reusing the ending's own gold ornament, and a "back to Lesson N"
link. **Deliberately thin:** no drill (no `practice.js`), no audio anywhere (no `audio.js`/`voice*.js`/echo dialog —
"no speech for now" extended to the whole page, not just the walkthrough), and **no options panel** — wiring
`qaida-options.js` into a page with neither `window.qaida` nor `window.qaidaHome` was more than this round's
worth, so it is a known, plainly-stated gap rather than something quietly skipped. Board and Settings still work
(`trace.js`, `shell.js`), since script, names and theme still matter here. `spell.js`'s own "More words" section is
now a single line and a "Practice reading →" link to the matching exercise page; its `more` data and `paintMore()`
are deleted, not left dead.

**Words: nine more per lesson** (three walkthrough + nine new, all real Form I verbs, same three patterns as
before — candidates, check every one): **Lesson 4** adds نَصَرَ "helped", ذَكَرَ "remembered", شَكَرَ "thanked",
سَجَدَ "prostrated", حَمَدَ "praised" to the four already in the walkthrough's "more" list (now folded into the
twelve). **Lesson 5** adds حَفِظَ "memorized", لَبِسَ "wore", تَعِبَ "got tired", رَكِبَ "rode", عَمِلَ "did",
فَرِحَ "was happy". **Lesson 6** adds سَهُلَ "was easy", صَعُبَ "was difficult", جَمُلَ "was beautiful",
عَظُمَ "was great", شَرُفَ "was noble", طَهُرَ "was pure".

**"There is no button for previous lesson"** — checked directly: it is there (`.prev`, "Previous: Letter shapes",
`href="lesson-3.html"`), confirmed present in the DOM and visible on screen at the bottom of the page, right where
"Back to the Qaida" and "Next" already sit. Likely just not scrolled to; flagged here rather than assumed fixed,
since the user should see it for themselves on the next look.

**Checked, and passing:** every `node --check`, and the full suite (`qaida-check.js`, `qaida-marks-check.js`,
`qaida-lesson3-check.js`, `qaida-lesson5-check.js`, `qaida-lesson6-check.js`, `qaida-voice-check.js`,
`qaida-page-check.js`) — none of them touch `spell.js` or `exercise.js`, which still have no check scripts of their
own. **Seen working in the browser pane:** all three exercise pages (twelve words each, correctly diacritized,
Board opens without error, no console errors anywhere), the Indo-Pak font finding (reproduced, then confirmed fixed
by the Scheherazade New option), and the "Practice reading" link. **Not yet seen by the user.**

### Fifth round, the same day — the ring, zair's place, the exercise table, and the ways back

*The user's look at the fourth round, five screenshots, then two more: "there is still no back lesson or previous
lesson button, and no options expand button, and none of the options are selected... add in all lessons"; "when the
meaning is revealed, and we move next, the buttons move up... there should be adequate space"; "the circle stays and
the ba paish rises and intersects with the circle"; "the zair isn't placed good"; "make a perfect table for the
exercise".*

1. **The ring left behind (lessons 4–6; also `fixes/lesson 4 5/`, "circle remains and the letter jumps").** A tapped
   tile gets `.peek`, and `.letter.peek .glyph` is Lesson 1's peek — the letter steps up 20% and shrinks to 75% to make
   room for its name. A mark tile has no name, and its halo is the *tile's* child, not the letter's, so the letter
   moved and the ring stayed. `qaida.css`: `.letter.mark-tile.peek .glyph` (and under any `[data-peek]`) is
   `transform: none; opacity: 1`. The tile's own 1.04 scale still moves both together. Measured on Lesson 6: the
   letter now moves 0px against its ring on a tap.
2. **Zair's place: Madani lettering on the mark pages is now Scheherazade New.** Measured, not eyeballed — each
   letter drawn on a canvas with and without the mark, and the closest distance between the two inks taken, across
   all 29 letters. Amiri Quran's zair swings from 4 to 36 (units of 1/100 of the font size): it touches م and ج and
   falls far below ت د ط ف ك ه; its zabar and paish swing 15–60. Scheherazade New: zair 6–22, zabar 13–32, paish
   11–31, nothing touching. `data-madani-font="scheherazade"` on `lesson-4/5/6.html` and `exercise-4/5/6.html` only;
   lessons 1–3 (no marks) keep Amiri Quran. The options panel's **Madani lettering** row still switches it back. The
   dotted circle's zair (Step 1, "Look at the mark") now sits clearly under the circle instead of against it.
3. **Zair and the answers:** a mark lesson's question (`:root[data-mark] .prompt`) has 1.25rem under it — وِ's zair
   was coming to rest a few pixels above the answer buttons. `shell.centerInk` centres the font's line box, not the
   ink, so it can't see a mark below; the margin is the fix, Lesson 2 unchanged.
4. **The walkthrough's buttons no longer move.** `spell.js` kept the meaning line out of the layout (`[hidden]`)
   until the last step, so the buttons dropped when it appeared and rose when the next word began. It now always
   holds this word's meaning and is only `visibility: hidden` until the last step. More room throughout: the glyph's
   line box 1.6 → 1.9 with 0.75rem under it (سَمِ's zair was touching the caption), the buttons 1.75rem below.
   Measured on Lesson 5: the button row sat at exactly the same height through all 15 steps of all three words.
5. **The exercise table.** `auto-fill` put twelve words in five columns and the grid's line colour showed through
   the two empty cells as grey blocks. Now always a column count twelve divides by — 4, 3 under 640px, 2 under 420px —
   inside a rounded frame, words 1.875–2.5rem with line-height 2 so no mark is clipped.
6. **The exercise pages were half-wired.** `exercise.js` never called `shell.renderSetup()`, so `<html>` had no
   script, names or grouping and the Settings dialog opened with nothing ticked; it does now. It also publishes
   `window.qaida = { kind: 'exercise' }`, so `qaida-options.js` builds a panel: a new "The word table" section
   (words in a row: auto/2/3/4/6; lines: every cell / between rows / none; numbers in the cells: show/hide; word size;
   room around each word; background; room below the buttons), plus Script and names and the page's Words. The
   Lesson 1 branch of the panel now asks for `kind === 'letters'` rather than "not a drill", so an exercise page
   doesn't get Lesson 1's rows. Each exercise page ends with the lesson's own row of ways out: The lessons, Back to
   Lesson N, and Next (Lesson 5/6, the label following the names; exercise 6 has no Next until Lesson 7 exists).
7. **"Previous" on every lesson from 2 on.** Lessons 4–6 had it from the first round; `lesson-2.html` ("Previous: The
   letters") and `lesson-3.html` ("Previous: Letters out of order") now do too, as plain links (neither title has a
   zabar/fatha variant).

**Checked, and passing:** `node --check` on every script; all seven check scripts. **Seen in the browser pane:** the
table (4 × 3, full rows), the panel and its sections, the chooser ticked, the three links on each exercise page,
the walkthrough's buttons, a tapped tile's ring on lessons 5 and 6, zair under ا ب ت ث and the dotted circle in
Scheherazade New. **Not yet seen by the user.**

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
