# Step 9 — lessons 10 to 14, the whole phase at a glance

Written 2026-09-28 (the user: "jsut plan the next phase, ill check later on"). `QAIDA-BUILD.md` step 9 is
*"Lessons 10–14: wow and yaa (leen and madd), jazam"*. This file is the map; **`docs/lesson-10/` is the full
specification of the first lesson**, in the same shape as `docs/lesson-8/` and `docs/lesson-9/`. Lessons 11–14 get
their own folders when they come up, one at a time, as every lesson so far has.

Nothing was written to `site/`.

**Updated later the same day** (the user: "please plan out every lesson seperately"): **every lesson now has its own
folder**, `docs/lesson-11/`, `docs/lesson-12/`, `docs/lesson-13/` and `docs/lesson-14/`, instead of "plan and build
together" for the thin ones. Planning them one by one corrected this map in three places, marked *(corrected)* below:
Lesson 11 is not "nothing structural", Lesson 13 has a real layout risk, and Lesson 14's pair is answered without the
page ever needing to know which letter it asks about.

## 0. Before step 9 starts — five loose ends

None of these is Lesson 10's own work, but each is either on its path or a note the user already wrote. The same
move Lesson 8 made with its "step 0": land them first, so Lesson 10 is built on a clean tree.

| # | What | Why now | Size |
|---|---|---|---|
| 1 | **Commit lessons 8 and 9.** The working tree holds two built lessons, their exercise pages, three new check scripts and edits to twelve files, none committed | Step 9 edits the same `marks.js`, `mark-lesson.js` and `shell.js`; a commit is the line to go back to if Lesson 10 breaks lessons 4–9 | the user's call — Claude commits only when asked |
| 2 | **A look at lessons 7, 8 and 9 in the browser.** None of the three has been seen by the user | Lesson 10 is Lesson 8's machinery with a longer tail; if the wide tile or the halo is wrong on بَا, it is wrong on بَوْ too, and cheaper to fix once. **Not a gate** — the same "ten minutes, not a gate" as `docs/lesson-9/07` §0 | 10–20 min, the user |
| 3 | **Lesson 7 has no words.** `fixes/lesson 7/fixes.txt`: "there is no walkthrough words for all tanween". `spell.js` has no `tanween` entry and there is no `exercise-7.html` | The only mark lesson without the walkthrough and the reading page. **One real snag:** a word ending in two zabar is written with a silent alif after it (وَلَدًا), and the alif is Lesson 8. Recommended: two paish and two zair words only (قَلَمٌ، رَجُلٌ، بَلَدٍ…), and one line saying two-zabar words come after Lesson 8 — `docs/lesson-10/07` §7 asks | half a session |
| 4 | **The home still locks lessons.** `home.js` draws a lock and "Finish Lesson N first" on every lesson after the first unfinished one | Overrules the user's own decision (2026-09-19, "Skipping ahead: allowed… nothing is locked"), asked again in `fixes/aunn.txt` problem 3 ("what difference does it even make???"). `fixes/qaida interface/` ("i came back from zair exercise, and cannot access") is very likely the same lock. `docs/lesson-2/09-going-in-order.md` is the specification and was never built | small: `shell.isOpen` and the advice-once line |
| 5 | **Lesson 3's notes.** `fixes/aunn.txt` problem 1 (options too obvious; a joined wow drawn the same as a lone one — show بو; the board's joined examples should be با بد بذ) and `fixes/lesson 3/` (too long for the easiest group; "if I know this group, move me to the next"; the tick touches the text; repeated words) | **Not found in the step log as fixed.** They may have been done on the other PC before the merge — check each against the page first, fix what is still there | check first, then small |

## 1. The five lessons

| # | Lesson | Item | What is genuinely new | Recordings |
|---|---|---|---|---|
| 10 | **Zabar and wow** (leen, "au") | بَوْ — letter, zabar, wow, jazam | **The jazam appears, four lessons before it is taught** — on the wow only, as part of the pattern. The tail is two code points and one of them is a mark. Possibly the first mark whose *shape* the two mushafs print differently (`docs/lesson-10/02` §3) | **27 new** (`fatha-waw`) |
| 11 | **Paish and wow** (madd, long "oo") — `docs/lesson-11/` | بُو | *(corrected)* **The scripts disagree about a mark:** Indo-Pak puts a jazam on the long-vowel wow (بُوْ), Madani leaves it bare (بُو) — Lesson 9's `forms` again, and a board line per script. **The minimal pair against Lesson 10** — `against: ['damma', 'fatha-waw']` (taught order, as Lesson 10's build settled). In Indo-Pak the pair differs *only* in zabar against paish. Same-sound tile the other way round (بُو = بٗ) | **none** — shares `damma-waw` with ulta paish |
| 12 | **Zabar and yaa** (leen, "ai") — `docs/lesson-12/` | بَيْ | **The tail is itself a letter the scripts write differently**: Madani ي, Indo-Pak ی (dotless at the end). The id folds the letter to ي and keeps the Indo-Pak jazam, so it is **neither script's drawing**, and both scripts get a `forms` entry. The yaa's bowl is deeper than the wow's: measure the tile | **27 new** (`fatha-yaa`) |
| 13 | **Zair and yaa** (madd, long "ee") — `docs/lesson-13/` | بِي | Lesson 11's shape with Lesson 12's letter: minimal pair against 12, same-sound tile against khari zair (بِي = بٖ). *(corrected)* **Not risk-free:** the zair and the yaa's bowl sit below the line side by side, the first tile with two things there — measure before building | **none** — shares `kasra-yaa` with khari zair |
| 14 | **Jazam** — `docs/lesson-14/` | اَبْ — a vowelled alif, then a letter with jazam | *(corrected)* The item needs a letter in front of it (a jazam cannot be said alone), but **the page never has to know which letter it asks about**: the alif is a *lead*, drawn in front of every item and never asked, and the id stays the letter and its jazam, so `masteredCount`, the twins and the scripts are unchanged. The new code is drawing the lead at eight places, a jazam step in the walkthrough, and the last lesson's Next. **Needs the user's sign-off on `docs/lesson-14/07` §1 before building** | **27** "ab, at…" (one lead, recommended) or 81 (three leads) |

**The shape of the phase:** 10–13 are four near-identical lessons on Lesson 8's machinery (`tail`, `suffixOf`, the
wide tile, the halo that rings the tail) plus Lesson 9's (`forms`, the same-sound tile). **Each should be a short
build.** Lesson 14 is the one with real new code, and gets the same full treatment Lesson 4 and Lesson 7 did.

## 2. Order

1. Step 0 above (1 and 2 are the user's; 3, 4, 5 are Claude's).
2. **Lesson 10** — `docs/lesson-10/`. Answers the jazam and sukun-shape questions once, for 10 and 12. *Built.*
3. **Lesson 11** — `docs/lesson-11/`. Opens the fourth `MARKS` statement and makes the jazam line per-script; 12, 13
   and 14 use both. **Build first.**
4. **Lesson 12** — `docs/lesson-12/`. The yaa's two spellings, and the bowl. Needs 11.
5. **Lesson 13** — `docs/lesson-13/`. Needs 12 (its minimal pair). Measure the two-things-below first.
6. **Lesson 14** — `docs/lesson-14/`. Full plan written; **the user's sign-off on its `07` §1, then build**. Last,
   as the user decided on 2026-09-20.

## 3. What the phase costs the teacher

**54 new recordings** for lessons 10–13 (bau and bai, 27 each), because 11 and 13 share Lesson 9's. Lesson 14 adds
**27** closed syllables ("ab, at…") with one lead, the recommendation (`docs/lesson-14/07` §1 and §5). Every word each
lesson proposes is Claude's candidate and needs the teacher's check, the rule since Lesson 4.
