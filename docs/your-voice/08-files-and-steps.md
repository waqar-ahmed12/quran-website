# 8. The files, the order, the checks

## 1. The file list

| File | New / edit | What |
|---|---|---|
| `site/qaida/voice-store.js` | **new**, ~150 lines | IndexedDB. No DOM. The API in `02-capture-and-storage.md` §4 |
| `site/qaida/voice.js` | **new**, ~450 lines | the panel, the recorder, the level ring, the waveforms |
| `site/qaida/qaida.css` | edit | one `ECHO` block: the dialog, the lanes, the record button, the ring, `[data-say]` |
| `site/qaida/lesson-1.html` … `lesson-5.html` | edit ×5 | two `<script>` lines, the top-bar button, the `<dialog class="echo">` block, the strip button |
| `site/qaida/qaida.js` | edit | one handler for `.current-say` (Lesson 1) and `lastItem` |
| `site/qaida/lesson-2.js`, `lesson-3.js`, `mark-lesson.js` | edit ×3 | one handler each for `.say`, beside the existing `.hear` one; `lastItem` |
| `site/qaida/home.js` | edit | **Start again** also calls `voice-store.clear()` |
| `site/qaida/audio.js` | edit | export `fileFor` as `urlFor(kind, glyph)` so the panel can fetch the teacher's clip to draw it. **Nothing else changes** |
| `site/qaida/qaida-options.js` | edit | the "Your voice" section |
| `tools/qaida-voice-check.js` | **new** | the check |

**Not touched:** `practice.js`, `shell.js` (except nothing at all — `home.js` carries the Start again change),
`marks.js`, `shapes.js`, `recordings.js`, `recordings.html`, `index.html`, and everything under `site/` outside
`site/qaida/`.

## 2. Build order

Each step leaves the site working.

1. **`voice-store.js` alone**, with `tools/qaida-voice-check.js` driving it against a fake IndexedDB. No page loads
   it yet. Get the caps, the eviction and the every-call-wrapped behaviour right here, where it is testable.
2. **`voice.js` and the dialog block in `lesson-1.html` only**, plus the CSS. One page, one lesson, the `letters`
   kind. **Stop here and let the user look** — this is the point at which the microphone permission, the ring, the
   playback and the close behaviour are either right or not, and everything after it is copying.
3. **The rest of Lesson 1**: the `.current-say` button, the dot, `lastItem`.
4. **Lessons 2 and 3**: the block, the `.say` button, the one handler each.
5. **Lessons 4 and 5**: the block and the one handler in `mark-lesson.js` — which is lessons 4, 5 **and 6** at once.
6. **`home.js`**'s Start again, and the options panel section.
7. **The check script** grows a page block as each page is wired.

## 3. Checks

Run all of these from `C:\Users\Waqar Ahmed\Desktop\Claude\Planning`, in PowerShell. **`node` is safe on this PC;
`python`, `py`, `ffmpeg` and Git Bash are not** (`WEBSITE-BUILD.md` §0).

```powershell
node --check site/qaida/voice.js; node --check site/qaida/voice-store.js; node tools/qaida-voice-check.js; node tools/qaida-check.js; node tools/qaida-marks-check.js; node tools/qaida-lesson3-check.js; node tools/qaida-lesson5-check.js; node tools/qaida-page-check.js
```

**What `tools/qaida-voice-check.js` covers** — the house pattern is a hand-made DOM and hand-made fakes, no browser,
no network (see `qaida-marks-check.js`):

*The store, against a fake IndexedDB:*
1. a clip put and got back, with its mime and length intact;
2. `shell.keyOf` folding — a clip saved under ک comes back under ك;
3. re-recording replaces rather than adds;
4. the 200-clip cap drops the oldest first, by `at`;
5. the 25MB cap does the same;
6. `clear()` empties it, and `ids()` is then empty;
7. **every method resolves rather than throwing when the database refuses to open** — the `nostore` path;
8. a record with a damaged shape (no blob, a string where a number goes) is ignored, not returned.

*The panel, against a hand-made DOM and a fake `MediaRecorder` / `getUserMedia`:*
9. `open('letters', 'ب', 'Baa')` fills the title, the glyph, the name and the "say its name" line;
10. `open('fatha', 'ب', 'Baa with zabar')` shows the **sound** line, not the name line;
11. the states run `ready → recording → saving → ready`, and `.echo-state` says one thing at a time;
12. stopping stops **every track** on the stream and closes the `AudioContext` — assert both, this is the leak;
13. closing while recording keeps the clip; closing while `asking` does not;
14. a rejected `getUserMedia` lands in `denied` with the Record button still present;
15. no `MediaRecorder` at all → the Say it buttons are not rendered;
16. `shell.onChange` closes an open panel;
17. muted → the "sound is off" line and its button, and the button unmutes;
18. **no `fetch`, no `XMLHttpRequest`, and no string containing `http` in `voice.js` and `voice-store.js`** — read the
    two files and assert it. The privacy claim in `06-accessibility-and-privacy.md` §6 is only worth making if
    something checks it;
19. `voice-store.clear()` is reached from the home's Start again.

## 4. What the user looks at, in this order

**Preview:** `node serve.js`, then `http://localhost:8777/site/qaida/lesson-1.html`. Not `file://` — recording needs
https or localhost (`02-capture-and-storage.md` §1). Firefox 156 is the browser to check first; it is the user's.

1. **The microphone light goes out.** Record something, stop, close the panel. The browser's recording indicator
   (the red dot in the tab, or the system one) must go dark. This is the one that matters most.
2. **The permission is asked for once, when Say it is tapped** — not when the lesson loads.
3. **The ring moves while you speak**, and stays still when you are quiet. If it never moves, the microphone is not
   being heard and the rest of the panel is a lie.
4. **The top bar still fits on a phone** — four tools now. Narrow the window until the words drop.
5. **Playback sounds like you**, not distorted or half-speed. (A wrong stored mime is what causes that.)
6. **"One after the other"** — is 0.4s the right gap, or is it too quick to hear the difference? The slider is there.
7. **The two waveforms**: do they help, or do they read as a score? If they read as a score, turn them off in the
   panel and say so — `01-what-it-is.md` §3 says the buttons alone are a complete feature.
8. **Close it mid-recording**, reopen, and check your clip is there.
9. **Delete**, then **Delete every recording of my voice** in Settings, and check they are gone after a reload.
10. **The same in dark and light**, and on a phone if one is to hand.

And the thing to judge that no check can: **with nothing recorded by the teacher, is the panel still worth having?**
That is the state every letter is in today (`01-what-it-is.md` §5), and if the answer is no, the honest conclusion is
that this waits on the recordings after all — which is what step 10 originally said.

## 5. After sign-off

- `design-system/quran-landing/pages/qaida.md` gains the panel: the tokens, the states, every tryout and what is a
  stand-in. **Written after the user has seen it**, never before.
- `QAIDA-BUILD.md`'s step log gains a "Step 7 built" entry listing where the build differs from this folder, in the
  shape `docs/lesson-5/README.md` uses.
- Lessons 6–14 copy the four-item list in `04-where-it-appears.md` §6 as they are written.
