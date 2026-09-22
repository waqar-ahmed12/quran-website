# 6. Reach, and a child's voice

## 1. The keyboard

The whole panel works from a keyboard, which is more than can be said for the tracing board (it needs something to
draw with, and says so).

- `<dialog>` + `showModal()` traps the tab ring; the close button is first in the markup, as in `.tracer`.
- **Space or Enter on the record button starts and stops it.** No hold-to-record, for this reason among others.
- `Escape` closes, through the intercepted `cancel` event, the same as `.tracer`.
- Focus returns to whatever opened the panel, tracked as `opener` — copied from `trace.js`.
- **Focus is never moved while recording.** Moving focus out from under a keyboard mid-task is the classic drill bug,
  and `lesson-2.js` already guards against it in the drill (`view.input === 'key'`).

## 2. Screen readers

- `.echo-state` is the single `role="status" aria-live="polite"` region, and every state change writes one short
  sentence to it. One region, never two competing.
- **The glyph is `aria-hidden` and the name beside it carries the meaning** — the rule the whole Qaida already
  follows, because a joined shape is a letter plus U+200D and reads as gibberish.
- **The waveform canvases are `aria-hidden`.** There is nothing in a peak envelope a screen reader can convey, and
  the two play buttons are the real interface. A canvas with a described "shape of the sound" would be inventing a
  judgement.
- The record button carries `aria-describedby="echo-state"`, so the counter and the prompts are read as its
  description rather than as free-floating announcements.
- **This is the one exercise in the Qaida that works better without sight than with it.** A blind student can do all
  of it: hear the teacher, say it, hear themselves, compare. That is worth not breaking — and it is the answer to the
  question left open at `docs/lesson-2/10-open-questions.md` about what screen-reader users get from a drill that is
  all glyphs.

## 3. Motion

`prefers-reduced-motion: reduce` turns off the level ring (the dot is simply lit), the panel's open and close
animations (as `.tracer` already does), and any transition on the waveform. Nothing in this panel is animated in any
other state — the effects rule is *rich where it helps, measured, stepped down on weak hardware*, and a pulsing ring
while nothing is recording helps nobody. `03-the-panel.md` §4 has the fps gate.

## 4. Touch and small screens

- The record button is at least 56px across; every other control at least 44px, per the Qaida's existing tile sizes.
- The two lanes stack on a narrow screen. The waveform is the thing that shrinks; the play buttons keep their size.
- The panel does not become a full-screen sheet on a phone: it is a dialog with a backdrop like `.tracer`, so the
  letter behind it stays visible in the corner of the eye.

## 5. When it cannot be offered

`02-capture-and-storage.md` §1: if the browser cannot record, the **Say it** buttons are not rendered at all. No
disabled button, no explanation, no apology — the lesson is complete without it.

**The one exception** is the options panel's own section, which shows a plain line saying the browser cannot record
and why (`file://`, an old browser, no https). That is for the user, who needs to be able to tell "switched off" from
"broken" while previewing. It goes at step 13 with the rest of the panel.

## 6. A child's voice

This is the part to get right, and it is short because the design does most of the work.

**What is true:**

- The recording is made by `MediaRecorder` in the page, kept as a blob in IndexedDB in that browser's own storage, and
  played back through an object URL. **There is no upload, no endpoint, no third party, no analytics.**
  `02-capture-and-storage.md` §5 says there is no `fetch` in either file, and that is a thing a reviewer can check
  by searching for the word.
- The microphone is asked for **once, on a tap**, never on load, and the stream is stopped the moment recording ends.
- Nothing is recorded without a deliberate tap, and the level ring makes an open microphone visible.

**What is also true and must not be papered over:** a clip is on that device, and **anyone else who opens that
browser can play it.** A shared family laptop is the normal case here. So the wording is *"stays in this browser, on
this device"* and never *"private"* (`05-wording.md` §6), and deleting is one tap in the panel and one tap in
Settings, not buried.

**What is deliberately not built:** no account, no sync, no sending a clip to the teacher, no "share your recording".
The teacher hearing the student is what the one-to-one lesson is for, and building a pipe that carries children's
voices off their own devices into this site is a serious thing that needs the user's explicit decision, a privacy
notice, and a place to put them. `09-open-questions.md` §3 asks, and recommends against.

## 7. Language

The panel is in English, like the rest of the site. Two lines in it name things in Arabic (the letter's name, the
mark's name), and those come from the existing name lists, which already follow the student's fatha / zabar choice —
so `voice.js` fills them through the same `shell.onChange` path every other page uses, and nothing in the panel
hardcodes a name.
