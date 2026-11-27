---
tags: [recordings, audio, build-record, lesson-4, lesson-5, lesson-6]
---
# The sounds with zabar, zair and paish, recorded (2026-11-19)

**Part of:** [[MAP]] · [[QAIDA-BUILD]] (step 10, the recordings) · [[docs/recordings/README|Recordings]] ·
[[docs/recordings/how-to-record|How to record on a phone]] · follows [[docs/recordings/letters-build-record|The letter names, recorded]]

*2026-11-19, the user: "please continue".* The same sitting as the letter names recorded each letter's sound with zabar,
zair and paish ("ba, ta, tha…", "bi, ti…", "bu, tu…"), Lessons 4–6, and at the start of each file the mark's own names
(zabar and fatha, zair and kasra, paish and damma). This note is the sounds; the marks' names are not cut yet.

## What is on the site

| Group (lesson) | On the site | Kept off, to be listened to first | Not usable |
|---|---|---|---|
| `fatha` (Lesson 4) | 24 of 29 | dha (vowel 0.47 s), ra (joined to za), za (vowel 0.6 s), ʾa (barely voiced) | ʿa: several tries, none clean |
| `kasra` (Lesson 5) | 27 of 29 | mi, ni (held ~0.6 s: might sound like Lesson 13's "mee", "nee") | |
| `damma` (Lesson 6) | 26 of 29 | ẓu (vowel 0.54 s), lu, nu (held ~0.6 s: might sound like "loo", "noo") | |

77 files in `site/qaida/audio/fatha/`, `kasra/` and `damma/` (2.5 MB), and the three lists in `manifest.json`, keyed by the
Madani letter like the names. A lesson plays the stand-in for a sound with no file, as it always has. The recordings page
now says 106 of 447.

## How they were made

The letter names' pipeline ([[docs/recordings/letters-build-record|The letter names, recorded]]), with three additions:

- **Placing each sound.** The check page placed every item (pitch, vowel shape, hiss, and each syllable inside items said
  without a pause). Five items held two or three sounds run together (ra + za, ṭa + ẓa; li + mi + ni; ju + ḥu;
  ṣu + ḍu + ṭu): each was split at the quietest point between them, and each sound then cut at its own start and end.
- **Where a short vowel ends.** In the zabar file most syllables end in a creaky tail the pitch tracker calls unvoiced; a
  first cut ended nine of them inside the vowel. The end now follows the sound while it is still a vowel's (its spectrum,
  and within 30 dB of its peak), then allows a short breath. Every start and end was then checked to fall in quiet.
- **`tools/cut-letters.js` learned groups and holds.** A cut list names its manifest group; an entry with `"hold"` is cut
  for the compare page but kept off the site; `"missing"` lists sounds with no usable take.

The first take of the last letter is used in all three files (ya, yi, yu); the second take, cut as an alternate, measures
rougher each time, and in the zabar file its vowel is closer to "e".

## Measured

| | |
|---|---|
| Format | mono 16-bit WAV, 22.05 kHz, 0.45–1.1 s each |
| Loudness | within ~1.5 dB, except sa, si, su (2–4 dB lower: Gentle softens their "s", the vowel is at the common level) |
| Peaks | −4.7 dBFS at most; no clicks at either end |
| In the lessons | Lesson 4 plays `fatha/ba.wav` (200); held and missing sounds fall back to the stand-in; ک ہ ی fold to the same files |
| Checks | `qaida-check`, `qaida-marks-check`, `qaida-lesson5-check`, `qaida-lesson6-check`, `qaida-rules-check`, `qaida-voice-check`, `qaida-page-check`, `qaida-lesson3-check`: pass |

## The marks' names, and spelling the teacher's way (added the same day)

The user teaches the Indo-Pak way, by spelling (*hijje*): "Kaaf zabar ka, Taa zair ti: kati, Baa zabar ba: katiba". The
recordings make that possible without a single new take, because each piece was recorded on its own: the letter's name
(Lessons 1–3), the mark's name, and the sound.

- **The six names** are in `audio/mark-names/` (the manifest group `mark-names`, keyed by the word): zabar (the clearest
  of five; every take rises, said as "zabar, fatha?"), fatha (first of four), zair (the one said flat, of six), kasra (the
  only one of six not mostly whispered), paish and damma (the fifth "paish damma", split at the d's silence).
- **Lessons 4–6:** "This is zabar." has a Hear it button that says the student's own word for the mark; a marked tile on
  the board spells itself, "Baa, zabar, ba". The drill keeps the sound alone. `tools/qaida-hijje-check.js` checks it.
- **Words** spell the same way letter by letter, but the joined parts ("kati", then "katiba") cannot be stitched from
  syllables without sounding broken: the teacher records each word once (step 10's "3–4 example words per exercise").

## Still open

- The user's listen, on the private compare page (before, after and what was removed; the held sounds in red; a tab for
  the mark names with every take).
- A new take of zabar's ʿa and za, and any held sound that turns out wrong.
- Whether hijje on tap is right, or wanted on a separate button; and the example words, recorded whole.
