# 2. Capturing the voice, and where it is kept

Two files. `voice.js` is the panel and the recorder; `voice-store.js` is the database and knows nothing about the
DOM — the same split as `shapes.js` / `lesson-3.js` and `marks.js` / `mark-lesson.js`, and for the same reason: the
check script can drive the store with no browser.

## 1. Can this browser do it at all

Three things have to be true, and all three are testable before anything is shown:

```js
const can = Boolean(
  window.MediaRecorder
  && navigator.mediaDevices
  && navigator.mediaDevices.getUserMedia
  && window.isSecureContext
);
```

- **`isSecureContext`** is the one that catches people out. `getUserMedia` is refused outside https, with
  `http://localhost` counted as secure. So `node serve.js` → `http://localhost:8777/site/qaida/` **works**, the
  Netlify preview (https) **works**, and opening `lesson-1.html` by double-clicking it (`file://`) **does not** —
  the same limit `audio.js` already notes for the manifest fetch.
- **`MediaRecorder`** exists in every browser that matters, including Safari since 14.3 and iOS Safari since 14.3.
  Older iPads will fail this test, which is the point of testing it.

**If any of the three is false, the Say it buttons are not rendered at all** — not disabled, not greyed, not there.
A disabled button with a tooltip is a page apologising to a beginner about their browser. The lesson simply does not
offer it. `06-accessibility-and-privacy.md` §5 has the one exception (the options panel's own row says why it is
missing, because the user needs to be able to see the state on purpose).

## 2. Asking for the microphone

**Once, on the first tap of Say it, and never on page load.** A microphone prompt that appears while a child is
reading letters is how a parent closes the tab.

```js
stream = await navigator.mediaDevices.getUserMedia({
  audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
});
```

Those three are on deliberately. They are wrong for a studio and right for a laptop in a kitchen, which is where
this will be used.

Three outcomes, and the panel has a state for each (`03-the-panel.md` §3):

| What happens | What the panel does |
|---|---|
| Allowed | goes straight to the ready state; the prompt is not mentioned again |
| `NotAllowedError` (they said no, or the browser remembers a no) | one plain line, no scolding, and the Say it button stays — tapping again re-asks where the browser allows it. `05-wording.md` §5 |
| `NotFoundError` (no microphone at all) | a different plain line. There is nothing to retry |

**The permission is not remembered by the Qaida.** Whether it was granted is the browser's business and it can be
revoked at any moment; storing "they said yes once" only creates a state that goes stale. Ask, use the answer, forget.

## 3. Recording, and letting go of the microphone

```js
const TYPES = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/mpeg'];
const mime = TYPES.find((t) => MediaRecorder.isTypeSupported(t)) || '';
const recorder = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : {});
```

- Firefox and Chrome take the first; Safari takes `audio/mp4`. Whatever the browser chose is stored **with the clip**,
  because a blob with the wrong type will not play back.
- **Playback is always in the browser that recorded it**, so no conversion is ever needed. The clips are not files the
  teacher collects; nothing leaves the device (§5).
- 32 kbps mono is plenty for one letter and keeps a three-second clip near 12 KB.

**Stopping means stopping everything:**

```js
recorder.stop();
for (const track of stream.getTracks()) track.stop();   // or the tab keeps the recording indicator lit
stream = null;
if (meter) { meter.disconnect(); meter = null; }
if (ctx) { await ctx.close(); ctx = null; }              // a leaked AudioContext is a leaked microphone
```

This runs on **stop, on close, on `visibilitychange` to hidden, and on `pagehide`**. It is the single most important
paragraph in this file: a student who sees the red dot still lit after closing the panel has been given a reason not
to trust the site, and they are right to feel it. **This is item 1 on the user's preview checklist**
(`08-files-and-steps.md` §4).

**A cap on the length.** Six seconds by default, then it stops itself and says so in one line. This is not a rule
about how long a letter takes; it is what stops a forgotten open microphone recording the room. It is a row in the
options panel.

**Nothing autoplays and nothing records by itself.** Both need a tap. This matches the rule already written at the top
of `audio.js`.

## 4. Where the clip is kept

**IndexedDB, in `voice-store.js`. Never `localStorage`.**

`localStorage` holds strings, caps out near 5MB, and — the reason that actually matters — it is where
`qaida:progress` lives. One over-large clip throws `QuotaExceededError` on the next `shell.save()` and the student
silently loses every lesson they have finished. The two must not share a bucket.

```
database  qaida-voice   version 1
store     clips         keyPath 'id'
index     'at'          on the timestamp, for evicting the oldest
```

A record:

```js
{
  id: 'fatha:ب',   // `${kind}:${shell.keyOf(glyph)}` — the same key audio.js looks the teacher's clip up by
  blob,            // what MediaRecorder produced
  mime: 'audio/webm;codecs=opus',
  ms: 2140,        // how long, measured; used to draw the waveform lane at the right width
  at: 1758499200000,
}
```

- **`shell.keyOf` is applied to the glyph**, so ک and ك are one item and a student who switches script keeps their
  voice, exactly as they keep their progress (`shell.js`, and `audio.js`'s slug table).
- **One clip per item, the newest.** Recording again replaces it. Keeping a history is a feature nobody asked for,
  a picker to go with it, and a quota problem; if the user wants "compare with last week" later, the store already
  has `at` and it is a second record with a different id.
- **Caps:** at most **200 clips** and **25 MB**. Both are far above any real use (200 opus clips ≈ 2.5 MB) and exist
  only so a fault cannot fill a disk. Over either, the oldest are dropped first, by the `at` index.
- **Every call is wrapped.** A private window, a browser with site data blocked, and Safari's storage eviction all
  make IndexedDB throw or come back empty. Every failure path ends the same way: **the recorder still records and
  still plays back for this visit, it simply does not keep anything, and the panel says so in one line.** This is the
  same shape as `shell.js`'s `save()`, which swallows its error with the comment *"the lesson still works for this
  visit."*

### The API `voice-store.js` exports

```js
window.qaidaVoiceStore = {
  ready,                       // Promise<boolean> — false when storage is unavailable; nothing else throws
  get(id),                     // Promise<record|null>
  put(id, blob, mime, ms),     // Promise<boolean> — false when it could not be kept
  remove(id),                  // Promise<void>
  has(id),                     // Promise<boolean> — for the dot on a tile (04 §5)
  ids(),                       // Promise<string[]> — the options panel's count, and the check script
  clear(),                     // Promise<void> — "Delete every recording of my voice", and Start again
};
```

## 5. It never leaves the device

**There is no upload, no endpoint, no analytics event, no `fetch` of any kind in `voice.js` or `voice-store.js`.**
A blob URL is created with `URL.createObjectURL` for playback and revoked when the panel closes.

This is a child's voice, recorded in their home, on a page their parent found. The rule is not a privacy posture, it
is the only defensible design, and it is worth being able to say in one sentence to a parent who asks. The panel says
it in one line (`05-wording.md` §6), and `06-accessibility-and-privacy.md` §6 has the rest, including the thing that
line must *not* over-promise: a clip is on that device, and anyone else who uses that browser can play it.

**Deleting:**

| Where | What it clears |
|---|---|
| **Delete** in the panel | this one clip |
| **Delete every recording of my voice**, in Settings | every clip, after one confirming tap — the same two-tap pattern as Lesson 1's "Start again" |
| **Start again** on the Qaida home | progress *and* clips: it already claims to clear everything, and this makes that true |
