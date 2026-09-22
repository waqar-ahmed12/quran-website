# Say it and listen back — build specification

The student records their own voice, plays it against the teacher's recording, and decides for themselves whether
the two match. **In every lesson**, the user, 2026-09-22: *"i wanted to have a way to record audio, so that the
student could play back and match his pronounciation with the audio. i want it in every lesson, because thats
important."*

Written 2026-09-22 for whoever builds it. It is **not** a design record — that is
`design-system/quran-landing/pages/qaida.md`, written after the code exists and the user has seen it.

## Status — specified, nothing built

| | |
|---|---|
| Built | nothing. No file in `site/` has been touched |
| Where it sits in the plan | `QAIDA-BUILD.md` **step 7**, moved there on 2026-09-22 from step 10 |
| Blocking question | **none.** `09-open-questions.md` has five, all with a recommendation that can be built and changed later |
| The one real dependency | **the teacher's recordings.** `audio/manifest.json` is empty: `letters: {}`, `fatha: {}`, `kasra: {}`. Half of this feature works with nothing recorded; the other half — the half the user asked for — is dark until the teacher records. `01-what-it-is.md` §5 |

## Why it is step 7 and not step 10

It was step 10, at the far end of the queue, for a reason that no longer holds: *"only means something once the
recordings are in."* Two things changed.

1. **The user says it is important and wants it in every lesson.** Lessons 1–5 are built; lessons 6–14 are not. Built
   now, the one markup block is copied into nine pages as they are written. Built at step 10, it is retrofitted into
   fourteen. This is the same argument that pulled sound and tracing forward on 2026-09-18, and it was right then.
2. **Half of it does not need the recordings at all.** Recording yourself, hearing yourself, and hearing yourself
   against the letter on the screen is most of the value, and it works today with an empty manifest. The teacher's
   lane turns on by itself, per letter, the moment a file is listed — the same "switched off until there is a
   recording" pattern `audio.js` already uses everywhere.

**Recommended order:** build this, then Lesson 6. Lesson 6 is a thin page (`mark-lesson.js` already serves it through
`<html data-mark>`), so it costs nothing to let it be born with the block instead of retrofitted. The user's call.

## What gets built

| File | New? | What |
|---|---|---|
| `site/qaida/voice.js` | new | capture, storage, the panel. The counterpart of `trace.js` |
| `site/qaida/voice-store.js` | new | IndexedDB: one clip per item, nothing leaves the device |
| a `<dialog class="echo">` block | new | copied into every lesson page, exactly as `<dialog class="tracer">` is |
| a **Say it** button | new | in the top bar of every lesson, beside **Board**; and in each lesson's own strip |
| `qaida.css` | edit | one `ECHO` block |
| `qaida-options.js` | edit | a "Your voice" section |
| `tools/qaida-voice-check.js` | new | the house-style check: a hand-made DOM, a fake recorder, a fake database |

`practice.js`, `shell.js`, `marks.js`, `shapes.js`, `mark-lesson.js`, `lesson-2.js` and `lesson-3.js` **do not change**
except for one button each in `04-where-it-appears.md` §3. `audio.js` gains one exported helper and nothing else.

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-is.md` | what the student does, and why nothing is ever scored |
| `02-capture-and-storage.md` | `MediaRecorder`, the microphone permission, IndexedDB, the caps, deleting |
| `03-the-panel.md` | the `<dialog class="echo">` markup, its states, the two lanes, the waveform |
| `04-where-it-appears.md` | every lesson: the top bar, Lesson 1's strip, the drill lessons' after-strip, lessons 7–14 |
| `05-wording.md` | every line, with its `data-words` key |
| `06-accessibility-and-privacy.md` | keyboard, screen readers, reduced motion, the mute switch, and a child's voice |
| `07-options-panel.md` | the "Your voice" section, row by row |
| `08-files-and-steps.md` | the file list in build order, the checks, and the user's preview checklist |
| `09-open-questions.md` | what needs the teacher — **read this one first if you read only one** |

Also read, outside this folder: `QAIDA-BUILD.md` (the Decisions table, the step log), `QAIDA-CONTENT.md`,
`WEBSITE-BUILD.md` §0 and §5, and the built `site/qaida/audio.js`, `trace.js` and `shell.js`. `trace.js` is the
closest thing to this and the model to copy: a dialog, a canvas, a top-bar button, no marking.

## Rules that apply to this work

- **This PC is infected.** No `python`, `py`, `pip`, `ffmpeg` or Git Bash; the **Bash tool is broken** — use
  **PowerShell**. `node` is safe. Never `dangerouslyDisableSandbox`. PNG or WebP, never `.jpg`.
- **Never an AI voice.** Nothing here generates speech. The student's own voice and the teacher's, and nothing else.
- **No marking.** `trace.js` refuses to judge handwriting; this refuses to judge pronunciation, for a stronger
  reason — `01-what-it-is.md` §3.
- **Every line of wording gets its own text field** in the options panel (`data-words` / `data-words-attr`).
- **Never ask the user to choose a look in words** — build it as a row in the options panel and let them look.
- **Nothing is locked**, **never harsh**, **no numbers on the page**.
- **The user previews and signs off.** Do not drive a browser.
- **End every reply about the Qaida** with one line: the current step, its skills, and the next step.

## The three things most likely to go wrong

1. **Asking for the microphone on page load.** A permission prompt nobody asked for is how a beginner decides a site
   is not safe. It is asked for once, on the first tap of **Say it**, and never again. `02` §2.
2. **Putting a recording in `localStorage`.** It holds strings, caps out near 5MB, and it is where the student's
   progress lives — one oversized clip and the whole Qaida forgets them. Clips go in IndexedDB. `02` §4.
3. **Leaving the microphone open.** Every track has to be stopped and the `AudioContext` closed, or Firefox and
   Chrome keep the red recording indicator lit after the panel closes. The student thinks they are still being
   listened to, and they are right. `02` §3.
