# Lesson 3 — build specification

**Read this folder before writing a line of Lesson 3.** It is a specification, written 2026-09-20, for whoever
builds `QAIDA-BUILD.md` **step 5**: *"Lesson 3, letter shapes. Easy shapes to hard ones, then start / middle / end."*

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, and it is written
*after* the code exists and the user has seen it — the same way steps 1 and 4 were done. When you finish building,
update that file to describe what is actually there, and update `QAIDA-BUILD.md`'s status table and step log.

## Status — specified 2026-09-20, not built

Nothing of Lesson 3 exists yet. `LESSONS[2]` in `shell.js:107` has no `href` and no `built: true`, so the home
correctly shows it as not built.

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
