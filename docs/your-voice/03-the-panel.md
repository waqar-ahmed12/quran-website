# 3. The panel

A `<dialog>`, copied into every lesson page the way `<dialog class="tracer">` already is, and driven by `voice.js`.
Same shape, same close behaviour, same CSS conventions — a student who has met the tracing board has already met this.

**Why a dialog and not a strip under the answer.** Lesson 2's `.after` strip is deliberately *not* a panel, because a
panel would take the keyboard and hide the choices the student is learning from (the comment is in `lesson-2.html`).
That reasoning does not carry here: recording is not a two-second glance, it is a thing the student does for half a
minute with their full attention, it needs a large target to tap and a place for two waveforms, and hiding the drill
while they do it is a feature. The tracing board made the same call for the same reason.

## 1. The markup

Goes at the end of `<main>`, immediately after `<dialog class="tracer">`, in **every** lesson page.

```html
<!-- Say it and listen back. The two clips are played, never compared: a machine grading a beginner's ع would be
     wrong often and wrong in the worst direction. docs/your-voice/01 §3. -->
<dialog class="echo" aria-labelledby="echo-title">
  <div class="echo-head">
    <h2 class="echo-title" id="echo-title" data-template="Say {name}" data-free="Your voice"
        data-words-attr="data-template|Say it panel: title ({name} is filled in);data-free|Say it panel: title with no letter"></h2>
    <button class="tool close-echo" type="button" aria-label="Close">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </div>

  <!-- What is being said. The glyph is aria-hidden and the name beside it carries the meaning, exactly as the
       drill tiles do. -->
  <div class="echo-item">
    <span class="echo-glyph" lang="ar" dir="rtl" aria-hidden="true"></span>
    <span class="echo-name"></span>
    <span class="echo-asks" data-name="Say its name." data-sound="Say the sound — not the letter's name."
          data-words-attr="data-name|Say it panel: when the name is wanted;data-sound|Say it panel: when the sound is wanted"></span>
  </div>

  <!-- Two lanes, drawn the same and coloured the same: this is a comparison, not a verdict. -->
  <div class="echo-lanes">
    <div class="lane teacher" hidden>
      <button class="button quiet play-teacher" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5l11 7-11 7z" /></svg>
        <span data-words="Say it panel: play the teacher">The teacher</span>
      </button>
      <canvas class="wave teacher-wave" aria-hidden="true"></canvas>
    </div>
    <div class="lane mine" hidden>
      <button class="button quiet play-mine" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5l11 7-11 7z" /></svg>
        <span data-words="Say it panel: play your own">You</span>
      </button>
      <canvas class="wave mine-wave" aria-hidden="true"></canvas>
      <button class="link delete-mine" type="button" data-words="Say it panel: delete this recording">Delete</button>
    </div>
  </div>

  <!-- The big one. Tap to start, tap to stop. -->
  <div class="echo-do">
    <button class="record" type="button" aria-describedby="echo-state"
            data-start="Record" data-stop="Stop"
            data-words-attr="data-start|Record button;data-stop|Record button, while recording">
      <span class="dot" aria-hidden="true"></span>
      <span class="record-word"></span>
    </button>
    <button class="button quiet both" type="button" hidden>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 8h9M4 16h9" /><path d="M16 5l4 3-4 3M16 13l4 3-4 3" />
      </svg>
      <span data-words="Say it panel: play both">One after the other</span>
    </button>
  </div>

  <p class="echo-state" id="echo-state" role="status" aria-live="polite"></p>
  <p class="echo-note"></p>
</dialog>
```

`.echo-state` is the one live region, and `05-wording.md` §7 lists every string that lands in it. `.echo-note` is the
quiet line at the bottom that says where recordings are kept.

## 2. What opens it

```js
window.qaidaEcho.open(kind, glyph, name);   // 'fatha', 'ب', 'Baa'
window.qaidaEcho.open();                    // no item: the top-bar button with nothing tapped yet
```

The same shape as `window.qaidaTrace.open(glyph, name)`, and `04-where-it-appears.md` lists every caller.

## 3. The states

One at a time, on `dialog.dataset.state`, so the CSS has one thing to read.

| state | what is on screen |
|---|---|
| `asking` | the microphone prompt is up. Everything is still; the line says what is being asked for |
| `ready` | the record button says **Record**. The teacher's lane shows if there is a clip; yours shows if you have one from before |
| `recording` | the button says **Stop**, the dot pulses, the live level ring moves (§4), the line counts up in seconds |
| `saving` | the half-second between stopping and the clip being playable. The button is disabled, nothing flashes |
| `denied` | the microphone was refused. One line, no scolding; **Record** is still there and tapping asks again |
| `nomic` | there is no microphone. One line. The record button is hidden, the teacher's lane still plays |
| `nostore` | recording works, keeping does not (private window, blocked storage). Everything works for this visit; one line says it will not be kept |

Closing while in `recording` stops the recorder and **keeps** the clip — a student who taps outside has not asked to
throw their voice away. Closing in `asking` cancels.

Close behaviour is copied verbatim from `trace.js`: `cancel` is intercepted and routed through `close()`, a click on
the backdrop closes, the animation is skipped under `prefers-reduced-motion`, focus goes back to whatever opened it,
and `shell.onChange` closes the panel — changing the script changes which letters exist, and the panel must not sit
there showing a letter the lesson no longer has.

## 4. The record button and the level ring

One large round button, at least 56px, in the middle. Tap to start, tap to stop. Not press-and-hold: a hold target is
unusable with a keyboard, hostile on a phone, and a child holding a button while trying to say ض is doing two things
at once.

While recording, the ring around the button **moves with the voice** — an `AnalyserNode` on the stream, RMS over a
1024-sample window, driving one CSS custom property on the button in a `requestAnimationFrame` loop:

```js
button.style.setProperty('--level', String(level));   // 0…1, eased so it does not jitter
```

It is not decoration. It is the only honest answer to "is this thing even hearing me?", and without it a student whose
microphone is muted in the operating system records six seconds of silence and concludes they did something wrong.

**Gated, per the standing rule about effects on weak hardware:**

- `prefers-reduced-motion: reduce` → no ring animation; the dot is simply lit and the line counts the seconds.
- The loop measures its own frame time; if it cannot hold ~50fps over half a second it drops to updating four times a
  second, which still answers the question. It never recovers upward mid-recording — a ring that starts stuttering
  again is worse than a slow steady one.
- The loop is cancelled the instant recording stops. Nothing animates in any other state.

## 5. The waveforms

One canvas per lane, drawn identically: a peak envelope, mid-line, same colour, same height, both scaled to the
**same seconds-per-pixel** so that a clip twice as long is twice as wide. That shared scale is the entire point —
length and stress are what a beginner cannot hear but can see.

- Built with `decodeAudioData` on the blob (yours) and on the fetched file (the teacher's), reduced to about 200 peaks
  and cached per id for as long as the page lives. Decoding happens **when the panel opens**, never on page load.
- If either decode fails — some Safari versions will not decode their own `audio/mp4` blob out of IndexedDB — that
  lane draws nothing and the play button still works. A missing picture is not an error message.
- `aria-hidden`, always: there is nothing here a screen reader can use, and the two play buttons are the real
  interface (`06-accessibility-and-privacy.md` §2).
- A row in the options panel turns both lanes' waveforms off, for the reason in `01-what-it-is.md` §3.

**Nothing is ever drawn overlapping the two clips**, no difference plot, no alignment lines. That is a verdict in a
picture.

## 6. "One after the other"

The button that makes it a comparison instead of two recordings: teacher, a short gap, you. The gap is 400ms by
default and is a row in the options panel. It is shown only when both lanes exist.

A second tap stops it. It does not loop by itself — a loop that keeps going while a child listens is how you end up
with a page that will not be quiet.

## 7. The mute switch

The top bar's mute is about not disturbing a room, and it governs every `audio.js` playback today. In this panel it
would be absurd for the student's own playback to be silent with no explanation, so:

**When the sound is off and the panel is opened, `.echo-state` says so and offers one tap to turn it back on.**
Recording still works while muted — capturing is not playing. Nothing plays until they unmute, and they are told why
rather than tapping a button that does nothing. `05-wording.md` §8.
