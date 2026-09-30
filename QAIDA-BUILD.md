# Qaida build — steps and skills

Started 2026-09-14. The free Qaida is a page of its own, `site/qaida/`, which the landing page's **Free Qaida** links
will point at. What it teaches is in `QAIDA-CONTENT.md`; this file is how it gets built. `WEBSITE-BUILD.md` still
applies: the PC safety rules (§0), the tokens and fonts (§5), previewing with `node serve.js`, and the user's standing
rule that every piece of wording Claude writes gets its own text field in an options panel.

**The user asked (2026-09-14):** keep the steps and skills in a file, and keep reminding them. End every reply about the
Qaida with one line: the current step, its skills, and the next step.

## Where we are

**Step P1, Lesson 15 (shadda / tashdeed), is built — the first lesson of the second pass** (2026-09-29, the user:
"please build the next lesson", taken as the yes to the second pass and to building it before launch that
`docs/pass-2/03` §1–2 waited on). `lesson-15.html` and `exercise-15.html`; the rows are `shadda-fatha`, `shadda-kasra` and
`shadda-damma` in `marks.js` (a set, `shadda`), the first with **two marks on one letter as `cp`** (a list; vowel first,
shadda last, so the halo rings the shadda). Lessons 4–14 are proved identical by a fifth hash fence (2160 lines, both
scripts). **The spec's kasra premise did not survive measuring:** Scheherazade New and Noto Naskh both draw a kasra under a
shadda **above** the letter, and only Amiri Quran draws it below (`docs/lesson-15/02` §3, filled in). So `sits` is above
in both scripts and the per-script `sits` was not built; the board says printed Qaidas differ. **The home is now two
parts and 29 lessons** (`shell.js` rows 15–29, `part: 2`; `home.js` headings; 16–29 say "Not built yet"). Lesson 14's Next
is an ordinary Next to Lesson 15 (its `data-last` is gone). All 17 check scripts pass. **Still the user's:** the kasra with
the shadda against a printed Qaida, the halo on the shadda, the hum line, the words, and see "Step P1 built — Lesson 15" in
the step log. **Left undone, and a decision:** the first-pass pages still say "Lesson N of 14" with a 14-dash track.
**Next: Lesson 16 (hamza)**, which needs its full folder first (`docs/lesson-16/` is one plan file) and is the first
lesson on a new page type (`docs/pass-2/02` §1).
**Steps 1–5 of 13 built, awaiting sign-off** — the Qaida home, Lesson 1, sound and tracing, Lesson 2 with the
practice engine (`practice.js`) that lessons 4–14 reuse, and Lesson 3, letter shapes. Steps 4 and 5 have not been seen
in a browser yet.

**The second pass is planned: lessons 15–29, from shadda to reading the last surahs** (2026-09-28, the user: "okay,
plan for shadda too, and the ones that are left for the quran"). `docs/pass-2/` is the map, and **Lesson 15 (shadda)
is specified in full** in `docs/lesson-15/`. Lessons 16–29 have one plan file each. Every claim about how the two
scripts print a rule was **checked against Quran.com's own text** (`docs/pass-2/01`). Nothing was written to `site/`.
**Waiting on the user:** yes to the fifteen lessons, and whether to build them before launch (`docs/pass-2/03` §1–2,
recommended). See **"Second pass planned — lessons 15 to 29"** in the step log.

**Lessons 11, 12, 13 and 14 are each planned in a folder of their own** (2026-09-28, the user: "please plan out
every lesson seperately"): `docs/lesson-11/` to `docs/lesson-14/`. Nothing was written to `site/`. Planning them one
by one corrected the phase map in three places: **Lesson 11's two scripts disagree about a mark** (Indo-Pak puts a
jazam on the long-vowel wow, Madani leaves it bare); **Lesson 13 puts the zair and the yaa's bowl below the line side
by side**, which must be measured first; and **Lesson 14's item needs a lead** (اَبْ) that is drawn but never asked,
so the ids and `masteredCount` stay as they are. **Build order: 11, 12, 13, then 14 after the user signs off on
`docs/lesson-14/07` §1.** See **"Step 9 planned — lessons 11 to 14, one folder each"** in the step log.

**Step 9, Lesson 14 (the jazam), is built — step 9 is now built in full** (2026-09-29, the user: "go ahead and build
next lesson if it is planned, if not, just tell"). It was planned, but **waiting on the user's sign-off on `docs/lesson-14/07`
§1** (one lead or three). "Build it" was taken as a yes to that section's recommendation, as lessons 4–13 took theirs:
**(a), one lead, ا with zabar, drawn in front of every item, never asked, never in an id.** If the teacher wants option
(b) (three leads, 81 recordings), (a) is a step towards it: the lead is already a field. `lesson-14.html` and
`exercise-14.html`; the row is `sukun` in `marks.js`, with `lead: [U+0627, U+064E]` and a new `leadOf`. **The lead is
the new code:** eight draw sites, a fourth fence (2000 lines of items, twins, board rows and samples of lessons 4–13,
hashed before `leadOf` existed and unchanged after it), and the Madani jazam (U+06E1) on all 27 letters. Measured in the
browser pane: nothing clips (tightest 13.9px at 1100px, 9.2px at 375px), no overflow, no uneven row, both scripts, default
and Large. **Two things found:** in Madani, Scheherazade New re-draws laam when the jazam follows it, so the halo's
before-and-after diff rang the whole letter (0.47 × 1.03em instead of 0.26 × 0.17em) — fixed in `markBox` for a tile with
a lead only; and the halo on Madani laam is now 0.35 × 0.20em, a little large. **Yours to look at:** اَبْ against اَبَ
at the tile's size, the halo on laam, the leads line, and every word. See **"Step 9 built — Lesson 14"** in the step log.
**Next: nothing in this part.** The first pass is done; steps 10–13 (recordings, finish screen, polish, audit) or the
second pass (`docs/pass-2/`, Lesson 15 shadda) come next, the user's choice.

**Step 9, Lesson 13 (zair and yaa, the long "ee"), is built** (2026-09-29, the user: "continue building. i guess we
are on lesson 13"). `lesson-13.html` and `exercise-13.html`; the row is `kasra-yaa` in `marks.js` — Lesson 11's shape
(same-sound tile: Lesson 9's khari zair, never an answer; minimal pair against Lesson 12) with Lesson 12's letter
(two `forms`, id `letter + U+0650 U+064A U+0652`, neither script's drawing). Lessons 4–12 are proved identical by a
third hash fence (726 items). **The spec's warning came true, and is fixed in `qaida.css`:** the below-the-line row
rule forced the tall ratio onto the wide tail tile, so it came out 1.5× taller than its neighbours (176px against
117px), the "row drops" trap. One new rule fixes it — and **also repairs Lesson 9's Madani khari zair rows, all 7 of
which were uneven** (the same bug, found by accident). Measured after the fix, in the browser pane: no uneven row,
nothing clipped, no overflow, both scripts, default and Large, at 1280px and 375px; the zair and the yaa never touch.
Tightest: 4px in the drill's prompt (Madani, عِي, Large, phone). **Yours to look at:** that tightest case, the
words (all Claude's candidates), and the halo on the yaa. See **"Step 9 built — Lesson 13"** in the step log.
**Next: Lesson 14 (jazam)** — it waits on your choice of one lead or three (`docs/lesson-14/07` §1).

**Step 9, Lesson 12 (zabar and yaa, "ai"), is built** (2026-09-29, the user: "build the next lesson in like, i will
check them out later for mistakes. if there is none, tell me"). `lesson-12.html` and `exercise-12.html`; the row is
`fatha-yaa` in `marks.js`, **the first with two `forms` entries** — the yaa is a letter the scripts write differently
(Madani ي, Indo-Pak ی, dotless at the end), so both scripts draw the tail from `forms` while the id stays one
(`letter + U+064E U+064A U+0652`, neither script's drawing). Lessons 4–11 are proved identical by a second hash fence
(672 items). Measured in the browser pane: nothing clips (tightest 11.9px clear, Madani, at default and Large), and
laam + yaa is two letters, not a fused shape, in both faces. **Two things it cannot tell you, which are yours:** the
words (all Claude's candidates) and whether the halo sits well on the yaa. See **"Step 9 built — Lesson 12"** in the
step log. **Next: build Lesson 13 (zair and yaa)** from `docs/lesson-13/` (it needs Lesson 12's row and puts
بِي against بَيْ), then Lesson 14 after the user signs off on `docs/lesson-14/07` §1.

**Step 9, Lesson 11 (paish and wow, the long "oo"), is built** (2026-09-29, the user: "please build the next lesson
in line"). `lesson-11.html` and `exercise-11.html`; the row is `damma-waw` in `marks.js` (a fourth `Object.assign`,
since it borrows Lesson 9's `same` and damma's `first`). Three new things, all checked: the **same-sound tile**
(ulta paish, Lesson 9's spelling of the same "oo") sits on part 1's feature row and is never an answer; the board's
**jazam line has one wording per script** (Madani writes بُو with a bare wow, Indo-Pak بُوْ with a jazam), which
lessons 12–14 reuse; and `audio.js` lets Lessons 9 and 11 share one recording group. Lessons 4–10 are proved
identical by a hash fence in `qaida-check.js`. See **"Step 9 built — Lesson 11"** in the step log. **Next: build
Lesson 12 (zabar and yaa)** from `docs/lesson-12/`, after the user's look at Lesson 11.

**Step 9, Lesson 10 (zabar and wow), is built, and step 0's loose ends are landed** (2026-09-28, the user: "go
ahead, and build the next step or lesso"). The home no longer locks anything; Lesson 7 has its words and
`exercise-7.html`; Lesson 3's joined shapes are visibly joined (با، بد، بو; بـ ـبـ ـب) and group 1 has a next-group
button. Lessons 8 and 9 are still **not committed** — the user's call. See **"Step 9 built — step 0 and Lesson 10"**
in the step log.

**Step 9 was planned: Lesson 10 (zabar and wow) was specified** (2026-09-28, the user: "jsut plan the next
phase, ill check later on"). `docs/step-9/README.md` maps the whole phase (lessons 10–14) and lists **five loose ends
to land first** — commit lessons 8 and 9, a look at lessons 7–9, Lesson 7's missing words, the home's locks (still
there, against the user's own "nothing is locked"), and Lesson 3's notes. `docs/lesson-10/` is the full spec. See
**"Step 9 planned — Lesson 10"** in the step log.

**Step 8, Lesson 9 (standing harakaat), is built** (2026-09-28, the user: "start building the next lesson in line" —
taken as a yes to `docs/lesson-9/07` §0's recommendation, built without waiting for a separate look at lessons 7 and
8 first, since neither the browser checklist blocks the build). The one new idea, built as specified: **the two
scripts write these marks with different characters** (Indo-Pak بٰ بٖ بٗ; Madani بَٰ بِۦ بُۥ) — `marks.js` gained
`forms`, `formOf` and `drawnOf`, and every call site that draws a glyph (`mark-lesson.js`, `spell.js`, `exercise.js`)
goes through them, while `suffixOf` (the id) stays the Indo-Pak code point alone, unread by any of it. See **"Step 8
built — Lesson 9"** in the step log for where the build differs and what is still the user's own to check.

**Step 8, Lesson 8 (zabar and alif), is built** (2026-09-27, the user: "there should be lesson 8 plan, start
building" — the plan already existed; this session did the four pending fix notes first, `docs/lesson-8/06` §2's
own step 0, then the ten build steps in order). See **"Step 8 built — Lesson 8"** in the step log below for what
changed, where the build differs from the spec, and what is still the user's own to check in a browser.

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
| 8 | **Lessons 7–9: tanween, zabar + alif, standing harakaat** (the two scripts write some of these marks differently) | `ui-ux-pro-max`, `full-output-enforcement` | Was step 7. **Lesson 7 built 2026-09-27, awaiting the user's look** (`docs/lesson-7/`; see "Step 8 built — Lesson 7"). The scripts' tanween difference is **font-only**, so it cannot show until the Indo-Pak font blocker is fixed at step 13 (`docs/lesson-7/02` §5). **Lesson 8 built 2026-09-27, awaiting the user's look** — `docs/lesson-8/`, eight files; see "Step 8 built — Lesson 8" for where the build differs and the four pending fixes it was built after. Checks: `node tools/qaida-check.js`, `qaida-lesson8-check.js`, `qaida-words-check.js` (new). **Lesson 9 built 2026-09-28, awaiting the user's look** — `docs/lesson-9/`, eight files; see "Step 8 built — Lesson 9" for where the build differs. **Step 8 is now built in full** (lessons 7, 8 and 9). Checks: `node tools/qaida-check.js`, `qaida-lesson9-check.js` (new), `qaida-words-check.js` |
| 9 | **Lessons 10–14: wow and yaa (leen and madd), jazam** | `ui-ux-pro-max`, `full-output-enforcement` | Was step 8. Answered 2026-09-20: **jazam stays last**, after leen. **Planned 2026-09-28:** `docs/step-9/README.md` (the phase, and a step 0 of five loose ends), `docs/lesson-10/` (Lesson 10's full spec). **Step 0 landed and Lesson 10 built 2026-09-28, awaiting the user's look** — see "Step 9 built — step 0 and Lesson 10". Checks: `node tools/qaida-lesson10-check.js` (new), and every other one. **Lesson 11 built 2026-09-29, awaiting the user's look** — see "Step 9 built — Lesson 11"; `node tools/qaida-lesson11-check.js` (new). **Lesson 12 built 2026-09-29, awaiting the user's look** — see "Step 9 built — Lesson 12"; `node tools/qaida-lesson12-check.js` (new). **Lesson 13 built 2026-09-29, awaiting the user's look** — see "Step 9 built — Lesson 13"; `node tools/qaida-lesson13-check.js` (new). **Lessons 11–14 planned 2026-09-28, one folder each** (`docs/lesson-11/` to `docs/lesson-14/`), see "Step 9 planned — lessons 11 to 14". **Lesson 14 built 2026-09-29, awaiting the user's look — step 9 is now built in full** (built on `07` §1's recommendation, one lead, without a separate sign-off: see "Step 9 built — Lesson 14"); `node tools/qaida-lesson14-check.js` (new) |
| 10 | **The rest of the recordings:** the marks in every lesson, and 3–4 example words per exercise | `ui-ux-pro-max`, `full-output-enforcement` | Was step 9. Each lesson adds its rows to the recording list as it's built |
| 11 | **Finish screen:** a mark for each finished lesson, and a last screen pointing to one-to-one lessons | `minimalist-ui` | |
| 12 | **Polish:** spacing, lettering, motion | `high-end-visual-design` | |
| 13 | **Audit and connect:** keyboard, screen readers, phones, MASTER.md's checklist; options panels and `recordings.html` removed; a licensed Indo-Pak font in place of the Noto Naskh stand-in | `web-design-guidelines` | The landing page's three Free Qaida links were pointed at `qaida/` early, 2026-09-18 |

**The second pass** (planned 2026-09-28, `docs/pass-2/README.md` §5) is **steps P1–P5**, lessons 15–29. **Proposed:**
they run after step 9 and **before** steps 10–13, which finish the whole Qaida once (the recordings, the finish screen
after Lesson 29, polish, the audit). The numbers 10–13 stay as they are, so every existing reference to them stays
true. **The Indo-Pak Qur'an font moves from step 13 to P3** (Lesson 23, the first real verses). Not adopted until the
user says so.

| Step | Lessons | What is new | Skills |
|---|---|---|---|
| P1 | 15 shadda | two marks on one letter; a mark whose place differs by script; the home in two parts | `ui-ux-pro-max`, `full-output-enforcement` |
| P2 | 16–22 | the rule page (`rule-lesson.js`, born in 16); the Qur'an's own words (18); "tap the letter" (21) | `ui-ux-pro-max`, `full-output-enforcement` |
| P3 | 23 Al-Fatiha | the verse page; the Qur'an fonts | `ui-ux-pro-max`, `high-end-visual-design` |
| P4 | 24–28 | tajweed on the rule page; recordings become the test | `ui-ux-pro-max`, `full-output-enforcement` |
| P5 | 29 the last surahs | a surah picker; the last lesson | `minimalist-ui` |

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

### Step 8 built — Lesson 8, zabar and alif

*2026-09-27. The user: "there should be lesson 8 plan, start building" (the plan already existed, `docs/lesson-8/`
below). Built in the order `docs/lesson-8/06` §2 sets out: the four pending fixes first (step 0), then the lesson
itself, checking after each step.*

**Step 0 — the four pending fixes, first.**

1. **The walkthrough's reshape** (`fixes/lesson 4 5/`, "should be animated, and be shown in complete word and the
   word that is being read is highlighted"). `spell.js`'s `paint()` used to slice the word down to the current
   step (`glyphFor(names, entry, upto)`); it now draws the WHOLE word every step, as one span per letter
   (`unitsFor`), and gives each a state — `active` (the part being read right now, lit and animated in),
   `read` (already covered), `unread` (not reached yet, dimmed). A `letter` step lights one letter; a `blend`
   step lights the whole run just put together, as one piece, so a highlighted syllable inside a longer word stays
   visually joined to what comes after it; the FINAL blend settles every letter to plain `read` rather than
   staying lit. `qaida.css` gained the three states and one `@keyframes` entrance (opacity only — no `transform`
   and no `inline-block`, since either would risk breaking the Arabic shaping across the span boundary; kept
   `prefers-reduced-motion`-aware). Verified live: `کَتَبَ` steps through all five states correctly (letter, letter,
   blend-both-active, letter, blend-final-all-read) and the full word is visible from the first step.
2. **The zair tile's height** (`fixes/lesson 6/`, "why is the zair box is weird", and `fixes/lesson 7/`, "two zair
   brings the box down" / "two zair out of place" — all three the same fault). Diagnosed in `docs/lesson-8/06` §2:
   Lesson 7 moved `[data-sits='below']` from `:root` to the tile itself, so a mixed row (Lesson 6's quartet, Lesson
   7's last part) gave its one below-sitting tile a taller `aspect-ratio` alone — a flex row doesn't stretch
   siblings to match, so the taller tile jutted past its neighbours and the row after it visibly dropped. Fixed by
   reading the whole row: `.pair:has(.mark-tile[data-sits='below']) .mark-tile` applies the taller sizing to EVERY
   tile in a row that holds a below-sitting mark, not just that one tile. Measured live on Lesson 6 and Lesson 7's
   last part: every tile in a mixed row now reports the same `offsetHeight`.
3. **Exercise 6's missing Next** (`fixes/lesson 6/bugs.txt`, "there is no next lesson button in paish lesson in
   the excercise"). `exercise-6.html` had no Next element at all. `exercise.js` gained the same "real link once
   built, a note until then" mechanism `mark-lesson.js`'s own Next button already has (reads `shell.LESSONS`, only
   wired for a `<button>`, so exercise-4/5's already-working static `<a href>` links are untouched); exercise-6.html
   gained the button, exercise-8.html was built with one from the start.
4. **Lesson 7's mark names** (`fixes/lesson 7/fixes.txt`, "i don't want fathatain, like no tathnia, and no 'do
   zabar' — two zabar or two fatha is good"). `marks.js`: fathatain/kasratain/dammatain's `names` became
   `{fatha: 'two fatha', zabar: 'two zabar'}` etc (and `'two kasra'`/`'two zair'`, `'two damma'`/`'two paish'`);
   `id`/`audio` kept the Arabic technical terms (folder and key names, never shown to a student).
   `tools/qaida-lesson7-check.js`'s two literal-name assertions updated to match; both still pass.

**Checked (step 0):** every `node --check`; `qaida-check.js`, `qaida-lesson7-check.js` and the whole existing suite,
unchanged and passing. **Seen live in the browser pane:** the walkthrough's five states on Lesson 4, uniform tile
heights on Lesson 6's quartet and Lesson 7's last part, exercise-6 and exercise-8's Next buttons both correctly
linking or showing "not built yet", and the renamed tanween rail ("Meet two fatha" etc).

**Steps 1–10 — Lesson 8 itself, in the order `docs/lesson-8/06` §2 sets out.** Matches the spec closely; where it
differs:

- **`marks.js`**: the `'fatha-alif'` row exactly as specified — `cp: 0x064E`, `tail: [0x0627]`, `skip: ['ا', 'ء']`,
  `against: ['fatha']`, `first` is fatha's six with laam swapped for noon. `suffixOf`/`glyphOf`/`aloneOf` compose
  the tail; every place an id is built (`itemFor`, `twinItems`, `reviewKeys`'s `earlier`) goes through `suffixOf`
  now, so the no-tail case (lessons 4–7) is provably unchanged. `allItems` and `boardRows` both honour `skip`.
  `NEVER_JOIN` (`['د', 'ذ', 'ر', 'ز', 'و']`) is exported for the joined-block example and the board's caption logic.
- **`shell.js`**: `masteredCount` now tests a SUFFIX (the mark, plus its tail if it has one) rather than a bare code
  point, matched by id LENGTH — Lesson 8 shares zabar's `cp` with Lesson 4, so without the length test its twins
  (`بَ`, riding along as review) would count toward Lesson 8's own total. Lessons 4–7 (no `tail`) read exactly as
  before. Lesson 8's row: `href`, `built: true`, `progress: 'drill'`, `cp: 0x064E`, `tail: [0x0627]`.
- **`mark-lesson.js`**: `markTile` gained `data-tail` and routes its id/tint through `suffixOf`. The halo
  (`markBox`/`positionHalos`) draws a tailed mark's two comparison strings from the RIGHT edge, not centred (a
  tailed glyph is wider, so centring each draw independently would slide the shared letter sideways and the diff
  would see the whole letter move); the "before" string is the letter with its mark and an invisible joiner
  (U+200D, Lesson 3's start-shape trick), so the ring isolates the alif alone, not the mark, not the shape change.
  The cache key gained the stroke's id. `renderBoard`'s joined block, for a tailed mark, shows the part's first
  joining letter and first non-joining letter side by side (and, only where the tail is exactly an alif, a third
  example — laam, once it is in the part — for the lam-alif ligature) instead of `joinedOf`'s "same letter twice"
  (which would draw a made-up word for a tailed mark). Two new elements, `.lam-alif-note` and `.skip-note`
  (`null` on lessons 4–7, which don't have them), shown once the part holds every letter — a bug found while
  building: that part has `first: false` but never `every: true` in the one-mark case (only a multi-mark lesson's
  own last part gets that flag), so the gate is `currentPart().every || !currentPart().first`, not `.every` alone.
- **`qaida.css`**: `.mark-tile[data-tail]` is wider (`--tile * 1.5`), never taller, at the SAME `aspect-ratio`
  formula scaled to match — verified live, a tailed tile and its bare/other row-mates report the same height.
  `:root[data-tailfit='shrink']` is the panel's other choice: ordinary width, the glyph at 0.72 of its size.
- **`lesson-8.html`**: `lesson-6.html` with `docs/lesson-8/04` applied — `data-board="trio"`, `data-arrows="all"`,
  `data-titlemark="baa"`, `data-tailfit="wide"`, the board's new `data-lam-alif`/`data-skip-note` attributes and
  the bar's `aria-valuemax="27"`. `lesson-7.html` needed no change: its Next button already reads `shell.LESSONS`
  and picked up the new row the moment it said `built: true`.
- **`audio.js`**: `wanted()` now skips a mark's `skip` letters and carries a `display` field — the COMPOSED glyph
  (بَا), so the teacher sees it beside "Baa with fatha and alif" rather than the bare letter — kept separate from
  `glyph`, which stays the bare letter because `recordings.js` also uses it as the manifest's own key
  (`groups[kind][glyph] = file`); changing what `glyph` itself held would have silently changed the manifest's key
  scheme for every mark group, not just this one. `recordings.js` reads `display` for its cell text only.
  `audio/manifest.json` gained `"fatha-alif": {}`. Verified live: 27 rows, composed glyphs, no ا or ء, manifest
  keys still bare.
- **`spell.js`**: a `'fatha-alif'` entry in `WORDS` (قَالَ, زَارَ, كِتَابٌ — the three the spec names, docs
  `05` §3) went through the walkthrough fix above rather than needing a change of its own. `exercise.js`: the
  twelve-word `'fatha-alif'` entry from `05` §5, unchanged from the spec's own list. Both files now also expose
  their `WORDS` table on `window` (`qaidaSpellWords` / `qaidaExerciseWords`, moved above their own DOM guards so
  the data exists even off a page with no `.spell`/`.mashq`), for the new `tools/qaida-words-check.js`.
- **`qaida-options.js`**: one new row, "Two-letter tiles" (Wider / Same width, smaller letters → `data-tailfit`),
  shown only when `lesson.hasTail` — a new getter on `mark-lesson.js`'s `window.qaida`.
- **`exercise-8.html`**: `exercise-6.html` with `docs/lesson-8/04` §8 applied — twelve words (verified live:
  قَالَ كَانَ صَامَ خَافَ زَارَ سَافَرَ سَاعَدَ بَابٌ دَارٌ طَعَامٌ سَلَامٌ كِتَابٌ, all composed
  correctly, no rendering errors), a Next button with `data-soon` since Lesson 9 doesn't exist yet.
- **Not built, as the spec itself recommends leaving for later:** the by-ear question format (waits for
  recordings, `07` §1); بًا as a second contrast (`07` §7); the teacher's own wording for how "long" is said out
  loud and how the alif is named when spelling out loud (`07` §4) — all text fields, none of them code.

**Checked, and passing:** every `node --check`; the full existing suite (`qaida-check.js` — including a new Lesson
8 block: `suffixOf` with and without a tail, the row itself, 27 items none for ا or ء, every id three characters,
`sizes()` `[6, 27]`, laam only in part 2, eight distinct ids for one letter across every lesson, **300 questions
run through the real engine — every one about a Lesson 8 item offered its own twin (بَ) among the answers**,
`masteredCount(8)` counting three known against a record that also holds a mastered twin, `masteredCount(4)`
unchanged, Indo-Pak glyphs and id-folding, mastery surviving a script switch, `NEVER_JOIN`, no literal combining
mark in `marks.js`, `lesson-8.html`, `spell.js`, `exercise.js` or `exercise-8.html`, and the home's row —
`qaida-marks-check.js`, `qaida-lesson5-check.js`, `qaida-lesson6-check.js`, `qaida-lesson7-check.js` (all four
unchanged), `qaida-lesson3-check.js`, `qaida-voice-check.js`, `qaida-page-check.js`, the new
`tools/qaida-lesson8-check.js` (the real page in a hand-made DOM: the trio and its arrows, `data-tail` on only the
marked tile, both new notes hidden in part 1 and shown with real text in part 2, the joined block's two examples
in part 1 and three in part 2, 250 questions with the twin check again at the page level, right/wrong wording,
finishing gated by part 2 alone at seven tenths of 27 — part 1 known never finishes it — the name set changing the
title/board/choices, Indo-Pak, the Spell block stepping قَالَ correctly with Previous going to Lesson 7, the
options row, and no "29" anywhere on the page), and the new `tools/qaida-words-check.js` (recommended by the spec:
every word in `spell.js` and `exercise.js`, on every lesson including this one, uses only the 29 letters and only
marks that lesson has already taught — all pass, three words a lesson in the walkthrough, twelve in the exercise).

**Seen working in the browser pane** (not by the user): the trio and its wider tailed tile (same height as its
row-mates, verified by measurement), the joined block's two-then-three examples, both new notes appearing only in
part 2, the halo positioned without error, a live drill question always offering the twin, right and wrong verdicts
in both name sets, the Indo-Pak kaaf with its tail, the walkthrough's five states, exercise-8's twelve words, the
home page's card (title, lede, and the "Finish Lesson 7 first" advisory on a locked click), and lessons 4 and 7
still answering questions with no console errors. **Not seen by the user.** The blocking browser checklist is
`docs/lesson-8/06` §4 — in particular whether two letters fit a tile at every width, whether لَا reads as one
shape in both faces and both themes, whether the halo really rings the alif and not the whole pair, and the
Indo-Pak ہ-joining-to-alif font question `02` §5 already flagged.

### Second pass planned — lessons 15 to 29

*2026-09-28. The user: "okay, plan for shadda too, and the ones that are left for the quran."* **Specified, not built.
Nothing was written to `site/`.**

- **`docs/pass-2/`**: the map (four files). The test the pass is built to is *can the student read Al-Fatiha?*, and
  the sequence is shadda → hamza → ة/ى → al- → the joining alif → the wavy line → silent letters → stopping →
  **Al-Fatiha** → noon/tanween → meem → the bounce → heavy and light → the opening letters → **the last ten surahs**.
- **`docs/lesson-15/`** (shadda), a full specification, eight files. It is Lesson 7's three-part shape with Lesson 14's
  lead. The board reads **ب → اَبَ → اَبْ → اَبَّ**: the shadda as the jazam and the vowel together. New: `cp` as a
  list; a mark whose **place** differs by script with the same code points (a kasra under a shadda: under the letter
  in Indo-Pak, under the shadda in Madani), which must be measured first.
- **`docs/lesson-16/` to `docs/lesson-29/`**, one plan file each, expanded into a full folder before each is built.
- **Three page types** (`docs/pass-2/02`): the mark lesson (15), a new **rule lesson** (born in 16, the Qur'an's own
  words from 18, a "tap the letter" question from 21, the one change `practice.js` needs), and a new **verse page**
  (23, 29).
- **Checked against Quran.com, not memory**: a scratch `node` script fetched 22 verses in both scripts and printed
  their code points (`docs/pass-2/01`). What it settled:
  - **Indo-Pak marks the letters that are read** (a long-vowel wow or yaa carries a jazam, and a bare one is not read).
    **Madani marks the ones that are not** (a small circle). This confirms lessons 11 and 13, whose check is now
    done (`docs/lesson-11/02` §2).
  - **Madani prints the noon and meem rules in its marks; Indo-Pak mostly doesn't** (Lesson 24's whole shape).
  - **Indo-Pak writes a word-start hamza as a bare alif with its vowel** (اَنْعَمْتَ), exactly Lesson 14's lead.
  - **Both mushafs end a word with a dotless ى**, which answers `docs/lesson-12/07` §1 (Lesson 17 teaches it).
  - **A correction to Lesson 10:** Quran.com writes the Uthmani sukun as U+0652 and the Indo-Pak as U+06E1, the
    reverse of `docs/lesson-10/02` §3's assumption. Lesson 10's drawing choice stands (it was measured), and a note
    is added there.
  - **Quran.com's Indo-Pak text is tied to its own font** (private-use signs, Arabic-style letters), so **the Indo-Pak
    Qur'an font is a blocker for Lesson 23**, not only for launch.
- **Proposed steps P1–P5**, before steps 10–13 (see the note under the steps table). Waiting on the user.

### Step 9 planned — lessons 11 to 14, one folder each

*2026-09-28. The user: "please plan out every lesson seperately."* `docs/step-9/README.md` had planned only Lesson 10
in full and said the thin lessons (11, 13) would be "planned and built together". Now **every lesson has its own
folder**, in the shape `docs/lesson-10/` set. **Specified, not built. Nothing was written to `site/`.**

| Folder | Files | The genuinely new thing | Recordings |
|---|---|---|---|
| `docs/lesson-11/` (paish and wow) | 8 | **The scripts disagree about a mark:** Indo-Pak writes بُوْ, Madani بُو. `forms` again, and the board's jazam line becomes **one per script** (a one-line change to `mark-lesson.js`, which lessons 12–14 reuse). In Indo-Pak the minimal pair against Lesson 10 is *only* zabar against paish, Lesson 6's hard contrast. Opens a **fourth `MARKS` statement** so lessons 11–14 can borrow from Lesson 9's rows | none |
| `docs/lesson-12/` (zabar and yaa) | 8 | **The id is neither script's drawing**: the yaa folds to ي (a letter) and the jazam is U+0652 (a mark), so both scripts draw from `forms`, the first row with two. The Indo-Pak yaa is dotless at the end. The yaa's bowl is deeper than the wow's: measure the tile | 27 (`fatha-yaa`) |
| `docs/lesson-13/` (zair and yaa) | 5 | Lesson 11's shape with Lesson 12's letter. **The zair and the yaa's bowl below the line side by side**, the first tile with two things there. It is the "zair box" family of bugs, so measure first | none |
| `docs/lesson-14/` (jazam) | 8 | **A lead**: every item is drawn after اَ (a jazam cannot be said alone), and the lead is never asked and never part of an id. `leadOf` plus the lead at eight draw sites; the walkthrough's first letter with no sound of its own; three structural rules in the words check; the last lesson's Next goes back to the Qaida home | 27 (one lead) |

**Three corrections to the phase map**, made in `docs/step-9/README.md`: Lesson 11 is not "nothing structural";
Lesson 13 is not risk-free; Lesson 14's "pair" is answered by the lead, so the page never needs to know which letter
it asks about.

**Two small bugs found on the way**, both folded into Lesson 11's build (`docs/lesson-11/06` §2): Lesson 10's jazam
line says "zabar" as a literal word, so the fatha set reads it too (it should be `{other}`); and `shell.js`'s Lesson 11
fatha title is "Damma and wow" (it should be "waw", as Lesson 10's was corrected).

**Build order:** 11 (opens the fourth statement and the per-script line), 12, 13 (needs 12's row), then 14. **Lesson
14 needs the user's answer to `docs/lesson-14/07` §1 first** (one lead, recommended, or three), because it decides
the ids and whether `masteredCount` changes. Every word in every folder is Claude's candidate, for the teacher's check.

### Step 9 built — step 0 and Lesson 10

*2026-09-28. The user: "go ahead, and build the next step or lesso."* Taken as a yes to `docs/lesson-10/07`'s
recommendations, and to building without a separate look at lessons 7–9 first (§0 is "not a gate").

**Step 0 (`docs/step-9/README.md` §0), items 3–5.** Items 1 (commit) and 2 (a look) are the user's.
- **Nothing is locked** (`docs/lesson-2/09-going-in-order.md`, finally built). `shell.isOpen` is gone; `nextUp()` /
  `inOrder(n)` say which lesson is next, and `state.skipped` remembers "Carry on anyway". The home's cards are
  *Finished* / *Start here* / *Comes later*, every built lesson a link; the lock icon means only "not built yet".
  A "later" card opens **the advice once** (`.order-advice` dialog on `index.html`: "This one comes later… Take me to
  Lesson N · Carry on anyway"; Escape and a click outside count as carry on). **Differs from the spec:** the advice
  is at the home's door, not on every lesson page — a lesson reached by its URL goes straight in. One dialog, not
  fourteen copies. *Named `.order-advice` because lesson pages already use `.advice` for the drill's advice strip.*
- **Lesson 7's words:** a Spell block on `lesson-7.html` (qalamun, rajulun, baladin) and `exercise-7.html`, twelve
  nouns in two paish and two zair, with one line saying two-zabar words come after the next lesson (`07` §7's
  recommendation). Candidates, for the teacher's check.
- **Lesson 3's notes** (`fixes/aunn.txt` problem 1, `fixes/lesson 3/`), none of which had been fixed:
  - joined shapes drew no join (an invisible joiner), so تـ looked like ـتـ and a joined alif like a lone one.
    `shapes.FORM` now uses the connecting stroke (U+0640) — بـ ـبـ ـب — and a letter that never joins forward is
    shown after a baa, as the user asked: با، بد، بذ، بر، بز، بو;
  - "only 1 of the options show waaw": group 1 is handed each letter's lone shape as a **wrong answer only**
    (`shapes.wrongOnly`, never asked, never counted), so every question offers "Waaw, joined" beside "Waaw, on its
    own". No engine change;
  - "if I know this group… move to the next": a **Go to the next group** button beside "You seem to know this group";
  - the tick overlapping a two-line name: the name keeps clear of the corner.
  - *Not changed:* "some words are repeated" ("…, end of a word" on every button) — the position wording is a text
    field each, and shortening it is the user's call. "Too long for the easiest group" is answered by the button,
    not by changing the target.

**Lesson 10**, built as `docs/lesson-10/` specifies, with these differences:
- **`against: ['fatha', 'fatha-alif']`**, taught order, not the spec's alif-first. The quartet then reads the road
  ب بَ بَا بَوْ, and `{other}` is "zabar" so the board's wording works in both name sets. The drill is unaffected:
  twins alternate per letter (`data-twins="alternate"`), and the check confirms every "au" question offers its twin.
- **The jazam was measured** (`02` §3): Scheherazade New draws U+0652 as a small circle and U+06E1 as the Madani
  mushaf's open head-of-khaa, so **Madani draws U+06E1** through `forms`; ids stay U+0652 (a script switch keeps the
  credit — checked). Noto Naskh (Indo-Pak stand-in) draws a small circle; unchanged, as `02` §3.4 says.
- **The tile was measured** (`03` §3): all 27 tiles, both scripts, default and Large — nothing clips; the closest is
  7px clear. Recorded in `qaida.css`; no rule added.
- **The lam-alif line** was gated on "has a tail", so it would have shown here: now on "the tail is an alif".
- **The jazam line** says "in a later lesson" (`07` §6's recommendation), with `{jazam}` = jazam / sukoon.
- Lesson 10's fatha-set title is "Fatha and waw" on the home too (was "Fatha and wow").

**Still the user's** (`docs/lesson-10/06` §4): does the jazam read as a mark on the wow, and is it the shape your
mushaf prints; does the halo sit on the wow (it behaves as Lesson 8's does, and at this size wraps most of the item);
دَوْ standing apart; the walkthrough; the reading page. And the words — every one is Claude's candidate.

### Step P1 built — Lesson 15 (shadda)

*2026-09-29. The user: "please build the next lesson, also tell me where we are in the grand scheme of things".* Built in
`docs/lesson-15/06` §2's order (page copied from `lesson-14.html`, the lead and all):
- **The fence first** (`qaida-check.js` §9f6): sha256 of every item, twin, board row and sample of lessons 4–14, both
  scripts (2160 lines, `68ab91f52e22…`), taken before any change and unchanged after every step; plus `masteredCount` for
  lessons 4, 5, 6, 8 and 10–14.
- **The kasra's place was measured before any code** (`02` §3, now filled in): Scheherazade New and Noto Naskh both put a
  kasra with a shadda **above** the letter, under the shadda; Amiri Quran alone puts it below. SIL's `cv62` (0 / lowered /
  raised) keeps it above at all three values in Google's copy. Decision: `sits: 'above'` on all three rows, no per-script
  `sits`, one honest sentence on the board (`data-mark-sits-shadda-kasra`). **This contradicts the spec's assumption about
  both mushafs; only the teacher's printed Qaida settles which is right.**
- **`marks.js`:** `cpsOf` (a row's `cp` may be a list; `suffixOf` and `formOf` read it), the three rows and the `shadda`
  set. The twin's own lead (`leadOf(other) || leadOf(mark)`) was already there from Lesson 14, so `03` §3 needed nothing.
  Ids are three characters, the letter, the vowel and U+0651, the same in both scripts.
- **`mark-lesson.js`:** per-mark captions (`data-pair-other-{id}` beats `data-pair-other`; `data-pair-marked-{id}`), a
  `{c}` token (the featured letter's consonant, so the quartet reads a-ba / ab / ab-ba on baa and a-ti / at / at-ti on
  taa), `{Set}`, `{jazam}` and `{lead}` tokens, and the hum line (parts with noon or meem only: 1, 3, 4).
- **The board is a quartet in every part** (`data-board="auto"`, one arrow, before the last tile): the letter, once with a
  vowel, once closed, twice. In part 4 the middle two are the other two shaddas, all captioned "Twice".
- **`shell.js` / `home.js` / `index.html`:** `masteredCount` reads a list of lists; rows 15–29; the home in two parts with a
  heading per part (each its own text field); the title and bar say 29. `.track li` may shrink so 29 dashes fit a phone.
- **`spell.js` / `exercise.js`:** three walkthrough words (مَرَّ, عَلَّمَ, مُحَمَّدٌ, seven steps, the shadda its own line) and twelve
  reading words, Claude's candidates as `05` says. `qaida-words-check.js` gained the two shadda rules and proof they fail.
- **Audio:** three groups in `manifest.json`; `recordings.html` lists 81 more rows (446), each with the lead and told to
  say the sound twice.
- **Measured** in the browser pane (every tile of all four parts, prompts and choices, both scripts, 375px and desktop):
  nothing clips or overflows. One CSS rule was needed: a lesson-only taller tile (`5 / 7.3`), because the phone's tightest
  gap above a tile was **1.4px** (taa with shadda and paish, Madani) and is now 4.1px at worst. Row heights within a row are
  even; part 2's rows differ by a wrapped caption on a phone, not by tiles.
- **Lesson 14's page, exercise and check** were edited: Next is "Next: Shadda" / "Next: Tashdeed" and goes to Lesson 15.
- **Checks:** `node tools/qaida-lesson15-check.js` (new, 101 checks), the Lesson 15 block and fence in `qaida-check.js`
  (§9f6, §9l), the words check. All 17 scripts pass.

**Still the user's** (`docs/lesson-15/06` §4): اَبَّ against اَبَ and اَبْ (does the quartet say "both at once"?); **the kasra
with the shadda against your own printed Qaida**, in both scripts; the halo on the shadda; the hum line in the right parts;
the home in two parts on a phone; the walkthrough and the reading page; and every word. **A decision left open:** the 14
first-pass pages say "Lesson N of 14" and draw 14 dashes, which now disagrees with the home's 29.
### Step 9 built — Lesson 14

*2026-09-29. The user: "go ahead and build next lesson if it is planned, if not, just tell".* It was planned
(`docs/lesson-14/`, eight files), but the spec said **"needs the user's sign-off on `07` §1 before anything is built"**.
The instruction to build was taken as a yes to §1's recommendation, **(a) one lead, ا with zabar** — and this is the
one decision in the build that was not the user's own, so it is recorded here. Built in `06` §2's order:
- **A fourth fence first** (`qaida-check.js` §9f5): the sha256 of every glyph `allItems`, `twinItems`, `boardRows` and
  `sampleOf` return for lessons 4–13, both scripts (2000 lines, `b32e84f6ba17…`), taken before `leadOf` existed and
  unchanged after every later step; plus `masteredCount` for lessons 4, 5, 6, 8, 10–13.
- **The row** (`marks.js`, fourth `Object.assign`): `sukun`, cp U+0652, `against: ['fatha','kasra','damma']`, `skip` alif
  and hamza, `lead: [U+0627, U+064E]`, `forms.madani` drawing U+06E1 (Lesson 10's measurement). `id` and `audio` are the
  Arabic term, never shown. Ids are the letter and U+0652, two characters, **with no lead in them**, so `masteredCount`
  needed no change: its own ids end in U+0652 and the twins end in a vowel.
- **`leadOf(mark, script)`** returns `''` for every row but this one, reading a form's own `lead` first (the Madani
  hamza alternative, `07` §3). It is drawn at every place an item is drawn: `allItems`, `twinItems` (the twin's own lead,
  else the lesson's), `boardRows`, `sampleOf`, `markTile`, `markBox`, the title glyph, and `audio.js`'s recordings list.
  `glyphOf` itself did not change. **Two things the spec left out:** `exercise.js` needed the same last-lesson Next as
  the lesson, and `qaida-words-check.js`'s rules are run through a function that can be shown to fail.
- **The board** is a trio (بـ → اَبَ → اَبْ), the joined block off, and four new lines: `lead-line` (why the alif is
  there), `leads-note` (the other two leads, composed in code from the alif and each vowel's own code point), `wy-note`
  and `skip-note` (part 2 only), and a jazam line per script (Madani: it has only closed a syllable; Indo-Pak: it has also
  sat on a long vowel; the rule is the same). Every one has its text field through `data-words-attr`.
- **The walkthrough**: a letter with a jazam gets its own step ("Laam with sukoon: no vowel of its own — it closes the
  sound before it."), then the blend reads the closed syllable. قَلْبٌ is five steps, as the spec says.
- **The last Next**: `data-last="Back to the Qaida"` on the lesson and the reading page; it goes to `index.html`. Lesson
  13's Next, which said "not built yet", now goes to Lesson 14.
- **Measured** in the browser pane (`02` §4), all 27 letters, both scripts, default and Large, at 1100px and 375px:
  nothing clips (tightest 13.9px, and 9.2px at 375px), no horizontal overflow, no uneven row, the trio fits a phone (24px
  minimum gap), and the drill's prompt and choices fit at 375px with the lead. `qaida.css` gained only the new lines' own
  rules — no tile rule was needed.
- **A real finding, and its fix.** In Madani, Scheherazade New draws laam differently when the jazam follows it (the string
  is 6.35px wider at 100px), so `markBox`'s "draw with, draw without, diff" ringed the whole letter: 0.47 × 1.03em, where
  every other letter is 0.26 × 0.17em. Not a font-loading race (checked: one Arabic subset holds both characters). Fixed
  for a tile with a lead only, by keeping the highest 0.2em of the new ink; laam is now 0.35 × 0.20em, on the mark and
  slightly large. Lessons 4–13's halos are measured exactly as before (the branch is gated on `lead`).
- **Words** (`spell.js`: قُلْ, قَلْبٌ, مَسْجِدٌ; `exercise.js`: twelve, ending in مَكْتُوبٌ, which in Indo-Pak shows two
  jazams doing the two jobs) are Claude's candidates. None has qalqalah, a noon or meem a tajweed rule changes, a hamza, a
  shadda or the article.
- **Audio:** `manifest.json` gains `"sukun": {}`; `recordings.html` lists **27 new rows** (اَبْ, اَتْ…), 338 → 365, each
  with a line telling the teacher to say the alif and then the closed letter.
- **Checks:** `node tools/qaida-lesson14-check.js` (new, 91 checks), the Lesson 14 block in `qaida-check.js` (§9f5,
  §9k), and three new rules in `qaida-words-check.js` (no jazam on a first letter, after another jazam, or on alif). All
  sixteen scripts pass. No console errors on the lesson, the reading page, the home or the recordings list.

**Still the user's** (`docs/lesson-14/06` §4): بَ against اَبْ and اَبَ at the tile's size (the jazam and zabar sit in the
same place); the jazam's shape on all 27, both scripts, both themes (Indo-Pak is still Noto Naskh's circle, the known
launch blocker for step 13); whether the lead reads naturally or crowds the page; the halo on laam in Madani; the leads
line and the lines under the board; part 2's اَوْ and اَيْ; the walkthrough and the reading page; and every word.
**Screenshots did not render in this session's browser pane** (the frame came back stale), so nothing above was looked at
by eye, only measured.

### Step 9 built — Lesson 13

*2026-09-29. The user: "continue building. i guess we are on lesson 13. if there is no plan let me know?"* There was
a plan (`docs/lesson-13/`, four files). Built in its `03` §4 order, page copied from `lesson-11.html` by script:
- **A third fence first** (`qaida-check.js` §9f4): the sha256 of every item of lessons 4–12 in both scripts (726
  lines), taken before the row existed, unchanged after it; plus `masteredCount` for lessons 4, 5, 6, 8, 10, 11, 12.
- **The row** (`marks.js`, fourth `Object.assign`): `kasra-yaa`, cp U+0650, tail `[U+064A, U+0652]`, `sits: 'below'`,
  `against: ['kasra', 'fatha-yaa']`, `same: 'standing-kasra'`, `first` khari zair's six (borrowed), `sample: 'ف'` (the
  title shows فِي), two `forms`: Madani `[U+0650]` + `[U+064A]` (a bare yaa), Indo-Pak `[U+0650]` + `[U+06CC, U+0652]`.
  Shares the `kasra-yaa` recordings with Lesson 9: **no new rows** (recordings stay at 338), no `audio.js` change.
- **Measured first, as the spec said** (`02` §4), and it found a real bug. The rule that grows a row holding a
  below-sitting tile (`.pair:has(.mark-tile[data-sits='below'])`, Lesson 5/7) sets `aspect-ratio: 5 / 7.4` on every
  tile in the row, **including the wide `data-tail` tile**, which is 1.5× as wide: it came out 176px tall against 117px
  for its neighbours, the row dropped, in both scripts. `qaida.css` gains one rule (`7.5 / 7.4` for a tail tile in a
  below row, and the counterpart for the "shrink" option). **The same rule repairs Lesson 9's Madani khari zair part**
  (checked: 7 of 7 rows uneven with the old ratio, 0 with the new). Nothing else in `qaida.css` changed.
- **After the fix**, every tile of parts 1 and 2 in both scripts, default and Large, at 1280px and 375px: no uneven
  row, nothing clipped, no horizontal overflow. Tightest ink-to-edge gap 13.2px (1280px) and 8.3px (375px); the drill's
  prompt is tightest at **4px** (Madani, عِي, Large, 375px): fits, but close. Zair and yaa never touch (no returning
  yaa in Scheherazade New or Noto Naskh). No `data-tail-below` rule and no `mark-lesson.js` change was needed.
- **Words** (`spell.js`: فِيلٌ, دِينٌ, كَبِيرٌ; `exercise.js`: twelve, three with the yaa standing apart after ر) are
  Claude's candidates, as the spec lists them. No word ends in the yaa, so فِي "in" is not a word here.
- **Pages:** `lesson-13.html`, `exercise-13.html`; Previous goes to Lesson 12, Next reads "Jazam / Sukoon" and shows the
  "not built yet" note until Lesson 14 exists. Lesson 12's stale "Lesson 13 is not built yet" comment is fixed.
- **Checks:** `node tools/qaida-lesson13-check.js` (new, 70 checks) and the Lesson 13 blocks in `qaida-check.js` (§9f4,
  §9j); all fifteen scripts pass. No console errors on the lesson or the exercise.

**Still the user's** (`docs/lesson-13/03` §6): the halo on the yaa rather than the zair; that 4px prompt case; بَيْ
against بِي at a glance (and Indo-Pak بَیْ against بِیْ); the same-sound tile wrapped alone on a phone; the
walkthrough and the reading page; and every word (seven of the twelve are words the Qur'an uses of Allah,
`docs/lesson-13/04` §2).

### Step 9 built — Lesson 12

*2026-09-29. The user: "build the next lesson in like, i will check them out later for mistakes. if there is none,
tell me."* Built as `docs/lesson-12/` specifies, in its `06` §2 order (page copied from `lesson-11.html`):
- **A second fence first** (`qaida-check.js` §9f3): the sha256 of every item of lessons 4–11 in both scripts (672
  lines), taken before the row existed, unchanged after it; plus `masteredCount` for lessons 4, 6, 8, 10, 11.
- **The row** (`marks.js`, in the fourth `Object.assign`): `fatha-yaa`, cp U+064E, tail `[U+064A, U+0652]`,
  `against: ['fatha', 'fatha-waw']`, no `same`, `skip` alif and hamza, and **two** `forms`: Madani `[U+064E]` +
  `[U+064A, U+06E1]`, Indo-Pak `[U+064E]` + `[U+06CC, U+0652]`. `suffixOf` never reads `forms`, so a switch of script
  keeps every letter's credit in both directions (checked). `formOf` gained the one-line `cp` fallback
  (`docs/lesson-12/03` §1); the fence proves it moves nothing.
- **The board's jazam line** reuses Lesson 11's two attributes: the Madani line, and the same line plus "At the end of
  a word, the Indo-Pak yaa has no dots: ی." for Indo-Pak. The ی is a letter, so it sits in the attribute.
- **Measured** (`03` §3), in the browser pane, all 27 letters, both scripts, default and Large: nothing clips or
  overflows. Tightest clearance below the ink is 11.9px (Madani, baa) and 29.9px (Indo-Pak); no `data-tail-below`
  rule was needed, so `qaida.css` was **not touched**. **Laam + yaa** (`02` §4) is two letters in Scheherazade New
  and Noto Naskh, so `first` stays and `07` §7's swap did not arise.
- **Words** (`spell.js`: بَيْتٌ, زَيْتٌ, عَلَيْهِ; `exercise.js`: twelve, three with the yaa standing apart) are Claude's
  candidates. No word ends in the yaa.
- **Audio:** `manifest.json` gains `"fatha-yaa": {}`; `recordings.html` lists **27 new rows**, 311 → 338.
- **Checks:** `node tools/qaida-lesson12-check.js` (new, 60 checks) and the Lesson 12 block in `qaida-check.js`
  (§9i); all fourteen scripts pass. No console errors on the lesson, the exercise, the home or the recordings list.
- **Also fixed:** Lesson 11's two "Lesson 12 is not built yet" comments.

**Still the user's** (`docs/lesson-12/06` §4): بَيْ against بَوْ at a glance; the halo on the yaa; the Indo-Pak
dotless end and the line under the board; the walkthrough and the reading page; and every word.

### Step 9 built — Lesson 11

*2026-09-29. The user: "please build the next lesson in line."* Built as `docs/lesson-11/` specifies (page copied from
`lesson-10.html`), with these differences and additions:
- **The row** (`marks.js`, a fourth `Object.assign` after Lesson 9's): `damma-waw`, cp U+064F, tail wow + jazam,
  `against: ['damma', 'fatha-waw']` (taught order, so `{other}` is damma/paish in both name sets), `same:
  'inverted-damma'`, `forms.madani` drawing the wow bare. Ids are letter + U+064F U+0648 U+0652 in both scripts.
- **A fence first** (`qaida-check.js` §9f2): a sha256 of every item of lessons 4–10 in both scripts (618 lines),
  taken before the row existed and unchanged after it; plus `masteredCount` for lessons 4, 6, 8, 10.
- **The jazam line is one per script** (`mark-lesson.js`): `data-template-indopak` / `data-template-madani`, falling
  back to `data-template`. Madani: "Here the wow has no mark on it…"; Indo-Pak: "The wow carries a {jazam} here too…".
  Lessons 12–14 will use the same two attributes.
- **The same-sound tile** ("The same sound: Baa with ulta paish", `data-same`) is on part 1's feature row, after an
  equals sign, with no halo, and never among the answers (checked over 800 questions). Five tiles in the row.
- **Two small bugs folded in:** Lesson 10's jazam line said "zabar" as a literal word (now `{other}`); Lesson 11's
  fatha-set title is "Damma and waw" on the home and on the page.
- **`audio.js`:** Lessons 9 and 11 share the `damma-waw` recording group (27 rows, no new ones). `markForKind` prefers
  the row whose id is the kind, so the teacher sees بُو and "damma and waw", not Lesson 9's ulta paish.
- **Words** (`spell.js`: نُورٌ, رُوحٌ, يَقُولُ; `exercise.js`: twelve, including three with the wow standing apart)
  are Claude's candidates. Words with a silent alif after the wow (كَفَرُوا) are left out on purpose.
- **In the browser pane** (375px and 1280px, default and Large, both scripts): nothing overflows; at phone width the
  feature row wraps 2 / 2 / 1, the same-sound tile alone on the last line. `qaida.css` was not touched. No console
  errors on the lesson, the exercise or the recordings list.
- **Checks:** `node tools/qaida-lesson11-check.js` (new) and the Lesson 11 block in `qaida-check.js` (§9h); all
  thirteen scripts pass.

**Still the user's** (`docs/lesson-11/06` §4): can paish and zabar be told apart at the tile's size in Indo-Pak; the
same-sound tile and its wrapped position on a phone; the jazam line per script; the halo; the words; the walkthrough.

### Step 9 planned — Lesson 10, and the phase

*2026-09-28. The user: "im a bit busy, jsut plan the next phase, ill check later on."*

**Specified, not built.** Nothing was written to `site/`. Two things:

1. **`docs/step-9/README.md`** — the phase map. Lessons 10–13 are four near-identical lessons on Lesson 8's `tail`
   and Lesson 9's `forms` and same-sound tile, so each should be a short build; **Lesson 14 (jazam) is the one with
   real new code** — its item is a *pair* (اَبْ) and the letter asked about is the second one — and gets a full plan
   of its own. Lessons 11 and 13 need **no new recordings** (they are the same sounds as Lesson 9's ulta paish and
   khari zair), so the phase costs the teacher 54. **Step 0, before Lesson 10:** commit lessons 8–9; a look at
   lessons 7–9; Lesson 7's missing words (`fixes/lesson 7/fixes.txt`); the home's locks, still built despite the
   2026-09-19 decision and `fixes/aunn.txt` problem 3 (and very likely `fixes/qaida interface/`); and Lesson 3's notes
   in `fixes/aunn.txt` and `fixes/lesson 3/`, which the step log never records as fixed.
2. **`docs/lesson-10/`** — seven files and a README, thin like `docs/lesson-8/` and `docs/lesson-9/`. One row
   (`'fatha-waw'`: zabar, `tail: [wow, jazam]`, 27 letters, `against: ['fatha-alif', 'fatha']`, a quartet board).
   **The one genuinely new thing: the jazam appears four lessons before it is taught**, carried inside the tail as
   part of the pattern and named in one line on the board — which also means the words check needs no new rule. Two
   things to **measure before building**: whether the Madani face draws the mushaf's sukun (U+06E1) differently from
   U+0652 (if so, Lesson 9's `forms` carries it and the id does not change), and whether the wow's descender clips in
   Lesson 8's wide tile.

**Eight questions for the teacher**, none blocking: `docs/lesson-10/07-open-questions.md`. The words (three walked
through, twelve for `exercise-10.html`) are Claude's candidates.

### Step 8 built — Lesson 9, standing harakaat

*2026-09-28. The user: "start building the next lesson in line."* `docs/lesson-9/07` §0 recommended a short look at
lessons 7 and 8 in the browser first (neither had been seen by the user); nothing in the plan depended on that
answer, only the browser checklist, so the build went ahead. Followed `docs/lesson-9/06` §2's order exactly,
checking after every step: the fence first, then `formOf`/`drawnOf`, then the three rows, then `shell.js`,
`mark-lesson.js`, `lesson-9.html`, audio, the words, the options panel, `qaida.css`.

**The one genuinely new idea, built as specified: a mark the two scripts write with different characters.**
`marks.js` gained `forms` (only on the three new rows — every earlier mark has none), and `formOf`/`drawnOf`
generalise `suffixOf`/`glyphOf`/`aloneOf`: `suffixOf` (the id) never reads `forms` and stays exactly the Indo-Pak
code point, so a switch of script keeps every letter's credit with no change to `shell.masteredCount`. **The fence
written first, before any of the three rows existed** (`tools/qaida-check.js`), proves `drawnOf(mark, script) ===
suffixOf(mark)` for all seven marks of lessons 4–8, in both scripts, and that every one of their glyphs is
byte-for-byte what it was before `formOf` existed — it still passes, unchanged, after everything else below.

**Where the build differs from `docs/lesson-9/`:**

1. **The "where you will meet it" line's example word is a small local table in `mark-lesson.js`** (`MET_WORDS`),
   not a reach into `spell.js`'s own word list by key as `04` §4 suggested. Three short `[key, markId]` pairs — the
   same words the walkthrough and the exercise page already use — composed through `marks.glyphOf` exactly as
   `spell.js` does its own. Simpler than resolving a specific word out of another file's array by position, and
   there was nothing to keep in sync: if a word changes, the three lines here can be revisited independently.
2. **`data-mark-sits` gained a per-mark override** (`data-mark-sits-{mark-id}`, read with a fallback to the shared
   line) that `docs/lesson-9/04` §4 asked for but didn't say how to wire — ulta paish needed its own line ("turned
   over", not "standing up"), so `mark-lesson.js`'s `aloneSits` line now looks for
   `words[`markSits${pascalOf(mark.id)}`]` before falling back to `words.markSits`.
3. **The same-sound tile's caption** uses `{sameMark}`, filled from the `same` row's own name (`marks.nameOf`), as
   `04` §4 revised it to — not the literal "zabar and alif" text `03` §7's first draft showed.
4. **The optional options-panel row** (`04` §9's "The same sound: Show / Hide") **was not built.** It is a nice-to-have
   comparison toggle, not load-bearing, and every other row `04` §9 asks for needed no change at all — `hasTail`
   already reads `own`/`formOf` per script, once its getter was generalised (see below).
5. **`mark-lesson.js`'s `hasTail` getter now asks "does ANY of this page's marks have a tail in the CURRENT
   script"**, not "does the open part's mark have a tail" — the old getter would have flickered the options panel's
   "Two-letter tiles" row on and off as the student moved between parts on this lesson, instead of once, on a
   change of script (`04` §9). Lessons 4–8 keep exactly the same answer as before, since `own.length` is 1 there.
6. **`markBox`'s cache key gained the script**, and its `head`/`tailed` logic was generalised from Lesson 8's own
   special case to read a form's `cp`/`tail` generally (`03` §5) — the halo now rings whatever a form's *last* mark
   adds: the whole standing mark in Indo-Pak, the small alif alone in Madani's khari zabar (not the zabar under it,
   which the student already has from Lesson 4), the small yaa/waw in Madani's khari zair and ulta paish.
7. **`audio.js`'s `groups()` now skips a `kind` already listed**, so khari zabar sharing Lesson 8's `'fatha-alif'`
   recording group does not appear twice in the recording list — the fix `03` §8 asked for.

**Checked, and passing:** every `node --check`; the full existing suite — `qaida-check.js` (a new Lesson 9 block:
the three rows, `forms`, `suffixOf` unchanged by any of it, `drawnOf` differing correctly per script, the four parts
`[6,6,6,27]`, the last part's spread `8/10/9` exactly as `02` §3 predicted, eleven distinct ids for one letter across
every lesson built so far, mastery surviving a script switch, `masteredCount(9)`/`(4)`/`(8)` each counting only their
own, 600 questions through the real engine — no Lesson 9 question ever offers a Lesson 8 item, every warm-up offers
its short twin, every last-part question offers another standing mark — `audio.js`'s recording counts, and no
literal combining mark or small letter anywhere the lesson touches), `qaida-marks-check.js`, `qaida-lesson5-check.js`,
`qaida-lesson6-check.js`, `qaida-lesson7-check.js`, `qaida-lesson8-check.js` (all five unchanged), `qaida-lesson3-check.js`,
`qaida-voice-check.js`, `qaida-page-check.js`, `qaida-words-check.js` (now resolving a page's `data-mark` through
`setOf` as well as `markOf`, so Lesson 9's own three walkthrough and twelve exercise words are checked the same way
every earlier lesson's are), and the new `tools/qaida-lesson9-check.js` (Lesson 7's suite, pointed at `lesson-9.html`
and with `spell.js` added: four rail buttons naming their own mark, a trio in each warm-up and a quartet in the last
part, the same-sound tile on part 1's feature row only and nowhere else, no halo on it, the joined block hidden
throughout with the met-note and Madani-note taking its place, the Madani note disappearing in Indo-Pak while the
met-note does not, switching script redrawing every tile without moving the bar, finishing gated by part 4 alone at
seven tenths of 27, the Spell block stepping هٰذَا correctly with Previous going to Lesson 8, and `hasTail` true in
Madani and false in Indo-Pak).

**Seen working in the browser pane** (not by the user): the same-sound tile (بَا, an `=` sign, no halo, never an
answer), the halo correctly ringing the small alif on khari zabar's Madani form and the bare standing mark in
Indo-Pak, the met-note and Madani-note appearing and disappearing correctly across parts and scripts, the Indo-Pak
haa correctly drawn with khari zair (ہٖ) and the exercise page's twelve words all composing without error. **Measured
rather than assumed** (`03` §4's own instruction): with the page's full 27-letter table open, no row's glyph overlaps
the row above or below it, in either script, at the default tile size and font — including laam's row, the tallest
letter under the tallest stack the Qaida draws (Madani's khari zabar) — so the `above-tall` mirror rule `docs/lesson-9/03`
§4 flagged as a possibility was **not added**; `qaida.css` records the measurement in place of the rule. **Not seen
by the user.** The blocking browser checklist is `docs/lesson-9/06` §4, in particular whether khari zabar against
zabar, and ulta paish against paish, can really be told apart at the tile's size, and the teacher's check of every
word's spelling against the mushaf (`05` §1, §4).

**Step 8 is now built in full**, all three of lessons 7, 8 and 9, and none of the three has been previewed by the
user yet.

### Step 8 planned (Lesson 8) — zabar and alif, and an item of two letters

*2026-09-27. The user: "go ahead and plan the next milestone if it is not planned."*

**Specified, not built.** `docs/lesson-8/` is **eight files**, thin like `docs/lesson-5/` to `docs/lesson-7/`: it
assumes all four earlier folders and holds only what is new. Nothing was written to `site/`.

**Lesson 8 is one sentence: an alif after zabar makes the sound long** — بَ "ba", بَا "baa". The zabar is Lesson 4's,
in the same place; what is new is a **letter** after it.

**The one thing genuinely new, and the only part with real code in it: an item is two letters.** Every item so far
was a letter and a mark — two-character ids, `masteredCount`'s `id.length === 2`, a portrait tile, a halo found by
drawing the letter with and without its mark. `docs/lesson-8/03` gives a `MARKS` row a **`tail`** (code points,
composed, never pasted), one `suffixOf(mark)` that every id and glyph goes through, and `masteredCount` a suffix
test — **Lesson 8 shares zabar's code point with Lesson 4**, and its twins (بَ) are Lesson 4's ids, so without the
length rule the home card would count the twins and not the lesson. Lessons 10–13 (wow and yaa) are the same shape.

**Findings, each written where it happens:**
- **27 letters, not 29** (`02` §2): اَا is never written (a long aa there is آ, a different sign), and ءَا is how the
  Madani mushaf writes it but not an Indo-Pak one. Recommended: leave both out, in both scripts, with a line on the
  board saying why.
- **لَا arrives uninvited** (`02` §4): the user's 2026-09-18 "no lam-alif as a letter" stands, but every font draws
  ل + ا as one shape and drawing them apart would be a misspelling. Laam stays, out of part 1, with one line.
- **The alif joins or stands apart** as Lesson 3 taught — 22 letters in their *start* shape, the first mark lesson
  where letters are not drawn alone; د ذ ر ز و leave it standing. The tile gets **wider, never taller** (the rule the
  pending "zair box is weird" fix settles).
- **The halo should ring the alif**, measured against the letter + zabar + an invisible joiner (Lesson 3's trick).
- **The drill is the easy half** (`01` §2, `07` §1): an alif is a whole letter, so "name it" tests little; the
  lesson is a *sound*. The by-ear format matters here more than anywhere, so `07` §6 asks the teacher to record this
  lesson's 27 "baa" sounds, with Lesson 4's "ba", before the 87 tanween ones.
- **Words open up** (`05`): three walked through (قَالَ, زَارَ, كِتَابٌ) and twelve for `exercise-8.html`, all
  Claude's candidates. **The mushaf spells many long-aa nouns with Lesson 9's standing mark instead of an alif**
  (كِتَٰبٌ), so these are never labelled Qur'anic — and that is the case for Lesson 9 coming straight after.

**Build after the four fix notes of 2026-09-27 evening** (`06` §2, step 0): the walkthrough's reshape (`fixes/lesson
4 5/`, on the path — the words go through it), the zair tile's height (`fixes/lesson 6/`, on the path — diagnosed as
Lesson 7's move of `[data-sits]` to the tile, which makes a zair tile in a mixed row taller alone), exercise 6's
missing Next, and Lesson 7's names ("two zabar", not "do zabar" or "fathatain").

**Eight questions for the teacher**, none blocking: `07-open-questions.md`. `design-system/quran-landing/pages/qaida.md`
is untouched: it is written after the code exists and the user has seen it.

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
