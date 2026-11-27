---
tags: [recordings, audio, build-record, lesson-1, lesson-2, lesson-3]
---
# The letter names, recorded (2026-11-19)

**Part of:** [[MAP]] · [[QAIDA-BUILD]] (step 10, the recordings) · [[docs/recordings/README|Recordings]] ·
[[docs/recordings/how-to-record|How to record on a phone]] · used by [[docs/lesson-2/README|Lesson 2]] and Lessons 1 and 3

*The user, 2026-11-19: "Yes, cut them".* The teacher re-recorded the 29 letter names on a phone, following
[[docs/recordings/how-to-record|How to record]], because the October recording (a WhatsApp voice note) hissed. The same
sitting also recorded the sounds with zabar, zair and paish (Lessons 4–6) and the marks' own names; those are not cut yet.

## What is on the site

- `site/qaida/audio/letters/`: 29 files, `alif.wav` … `ya.wav`, named by the slugs `audio.js` already had.
- `site/qaida/audio/manifest.json`: the `letters` list, keyed by the Madani letter (`shell.keyOf()` folds ک ہ ی to ك ه ي,
  so one file serves both scripts).
- Nothing else changed: Lessons 1–3, the recordings page (now "29 of 447 recorded") and "Say it and listen back" read the
  manifest and pick the files up.

## How the files were made

Nothing unsafe was run: ffmpeg and python are off limits on this PC (`CLAUDE.md`).

1. **Decode.** `tools/m4a-to-wav.ps1` turns the phone's .m4a (AAC, 44.1 kHz, 96 kbps) into a WAV with Windows' own media
   decoder. Its output lines up sample for sample with the browser's decode of the same file (checked on four onsets).
2. **Find the letters.** A check page measured every item in the recording (pitch, vowel shape, hiss, pauses) and placed
   each one; the times went into a cut list beside the recording in `recordings-inbox/` (git ignores it). Every cut was
   then checked to fall in quiet, and seven were nudged (a breath before ʿAyn and Haa, the soft start of ث and ذ, the
   breath after Ḍaad and Yaa, Ghayn's start).
3. **Cut and clean.** `tools/cut-letters.js`, the same cleaning as the October compare page: a 75 Hz rumble filter; the
   hiss above 3 kHz turned down only in the moments it is louder than a typical letter's (a de-esser); every letter set to
   one loudness (−20 dB on its loud part, peaks never above −1 dBFS); fades in and out; mono 16-bit WAV at 22.05 kHz,
   since nothing here can safely make mp3 and every browser plays WAV.

## Choices made

- **Softening: Gentle.** It changes only Seen, Sheen and Ṣaad (4–5 dB) and the z in Hamzah (3 dB); every other letter is
  as recorded. Stronger settings dull the "s", and the Qaida needs س and ث told apart by ear. This recording already has
  3–20 dB less "s" against the voice than the October one (Seen's hiss lasts 0.4 s instead of 1.2 s).
- **Takes:** the second Laam (the first was said before Kaaf by mistake, then put right) and the second Yaa (the last take,
  as the recording script asks). The first Yaa is cut too, as an alternate.
- **Alif's final f** is held for half a second in the recording; it is kept to 0.4 s with a slow fade.

## Measured

| | |
|---|---|
| Files | 29, 0.79–2.29 s, 35–101 KB, 1.9 MB in all |
| Loudness | −19.9 to −20.6 dB: within 0.7 dB of each other |
| Peaks | −3.9 dBFS at most, no clipping |
| Edges | silent at both ends (no clicks) |
| In the lessons | a tapped tile in Lesson 1 fetches its file (200), no CSP or console error; Lesson 2 finds all forms |
| Checks | `qaida-check`, `qaida-rules-check`, `qaida-voice-check`, `qaida-page-check`, `qaida-lesson3-check`: pass |

## Changing it

Another level, or the other Yaa, is one command (the levels are off, gentle, medium, strong, verystrong):

```
node tools/cut-letters.js "recordings-inbox/19 Nov audios 4 files/Arabic alphabet.wav" "recordings-inbox/19 Nov audios 4 files/letter-cuts.json" --site medium --use ya=ya-take1
```

`--compare <folder>` writes every version of every letter instead, for a before-and-after page.

## Still open

- The user's listen, and Gentle kept or another level named.
- The zabar, zair and paish recordings: cut the same day, see [[docs/recordings/sounds-build-record|The sounds with zabar, zair and paish]];
  two zabar sounds (ʿa and za) to re-take.
- Where the marks' own spoken names (zabar/fatha, zair/kasra, paish/damma, recorded in those files) go in Lessons 4–6:
  `manifest.json` has no group for them yet.
