# Lesson 2 — build specification

**Read this folder before writing a line of Lesson 2.** It is a specification, written 2026-09-19, for whoever
builds `QAIDA-BUILD.md` **step 4**: *"Lesson 2, the recognition drill. Letters out of order; the practice engine the
later exercises reuse."*

It is **not** a design record. The design record is `design-system/quran-landing/pages/qaida.md`, and it is written
*after* the code exists and the user has seen it — the same way step 1 was done. When you finish building, update
that file to describe what is actually there, and update `QAIDA-BUILD.md`'s status table and step log.

## What Lesson 2 is, in a paragraph

The same 29 letters as Lesson 1, shown **out of order**, one question at a time. It catches the student who can
recite the alphabet straight through but can't name a letter cold — which is the whole reason `QAIDA-CONTENT.md`
puts it second. It teaches no new letters, no marks and no words. Under it sits **`practice.js`**, a drill engine
with no DOM and no storage of its own, because lessons 4 through 14 all reuse it; Lesson 2 is the first customer,
not the only one. Design the engine for the fourteenth lesson, not for this one.

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | why the lesson exists, and the three decisions the user made on 2026-09-19 |
| `02-practice-engine.md` | `practice.js` — the API contract, the item, the formats, how the next question is chosen |
| `03-storage.md` | what goes in `localStorage`, how it is validated, the new `shell` exports |
| `04-page-and-design.md` | `lesson-2.html`, the new CSS, what is copied from Lesson 1 unchanged |
| `05-wording.md` | every string, with its text-field tag |
| `06-accessibility.md` | keyboard, screen readers, targets, reduced motion |
| `07-options-panel.md` | the tryout rows, the `window.qaida` surface, the `<html>` attributes |
| `08-files-and-steps.md` | the exact file list, in build order, with a verification checklist |
| `09-going-in-order.md` | **whole-Qaida change:** nothing is locked any more; a lesson out of turn advises first |
| `10-open-questions.md` | what needs the teacher, not you |

Also read, outside this folder: `QAIDA-BUILD.md`, `QAIDA-CONTENT.md`, `WEBSITE-BUILD.md` §0 and §5, and
`design-system/quran-landing/pages/qaida.md` in full.

## Rules that apply to this work

**This PC is infected** (`CLAUDE.md`, `WEBSITE-BUILD.md` §0). Never run `python`, `py`, `pip`, `ffmpeg`, Git Bash,
or anything under `C:\ffmpeg-8.1.2-essentials_build\` or `%LOCALAPPDATA%\Programs\`. The **Bash tool is broken** —
Git's `bash.exe` is infected. Use **PowerShell**. `node` is validly signed and safe. Never use
`dangerouslyDisableSandbox`. Save images as PNG or WebP, never `.jpg`.

**Check your work with `node --check`**, every script, every time. There is no build step, no bundler and no test
runner in this project.

**Preview:** `node serve.js`, then `http://localhost:8777/site/qaida/lesson-2.html`. The launch config is called
"site". Never `python -m http.server`.

**Every line of wording Claude writes gets its own text field** in the options panel — the user's standing rule.
`05-wording.md` lists them; `qaida-options.js` generates the field automatically from a `data-words` or
`data-words-attr` tag, so tagging the element is the whole job.

**Never ask the user to choose a look in words.** Build the choices as buttons in the options panel and let them
look. That rule is why `07-options-panel.md` exists.

**The user previews in a browser and signs off.** Do not drive a browser yourself, and do not mark step 4 done in
`QAIDA-BUILD.md` until they have said so. One step at a time.

**End every reply about the Qaida** with one line: the current step, its skills, and the next step.

## The one thing most likely to go wrong

Building the drill into `lesson-2.js` and leaving `practice.js` a thin wrapper. The engine is the deliverable of
step 4; the lesson page is the demonstration. If `practice.js` ends up touching the DOM, reading `localStorage`
directly, or knowing that its items are letters, it will have to be rewritten at step 6 — and step 6 is three
lessons at once.
