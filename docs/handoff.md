---
tags: [handoff, recordings, status]
---
# Handoff: where the work stands (2026-11-24)

**Part of:** [[MAP]] · [[QAIDA-BUILD]] · [[docs/recordings/letters-build-record|The letter names, recorded]] ·
[[docs/recordings/sounds-build-record|The sounds with zabar, zair and paish]]

Written when the old PC was sold, so cloud sessions (instructed from the user's phone) and the new PC start from here.
The repo is public: nothing private belongs in this file.

## Branch and site

- Work lives on the branch `qaida-home-and-lesson-1-fixes`. Netlify publishes `main` only
  (myqurann.netlify.app), so none of the recordings are live until the user asks for the branch to be merged.
- Qaida build: step 10 (the recordings) is under way; next is step 11 (finish screen). See `QAIDA-BUILD.md`.

## The recordings (teacher's voice, consent given for the public site)

- Originals: `recordings-inbox/19 Nov audios 4 files/` (letter names, zabar, zair, paish as `.m4a`) and the October
  WhatsApp clip. The folder is git-ignored; these files were force-added. Decoded WAVs are not in git.
- **On the site** (`site/qaida/audio/`, listed in `manifest.json`): 29 letter names, 77 of 87 sounds with zabar/zair/paish,
  and the six mark names (zabar, fatha, zair, kasra, paish, damma). All softened at **Gentle**, 22.05 kHz mono WAV.
- **Held back, not on the site, waiting for the user's ear:** zabar dha, ra, za, ʾa; zair mi, ni; paish ẓu, lu, nu
  (long vowels, a whispered one, a run-together pair). Marked `"hold"` in the cut lists.
- **Needs a new take from the teacher:** zabar ʿa (no clean take) and za.
- Choices made for the user, open to change: Gentle softening; the second Laam and second Yaa in the letter names; the
  first take of ya/yi/yu in the sound files; which take of each mark name (see `mark-name-cuts.json`).

## How to rebuild or change them

```
powershell -File tools/m4a-to-wav.ps1 "<file>.m4a" "<file>.wav"      # Windows only: decode with Windows' own decoder
node tools/cut-letters.js "<file>.wav" "<cuts>.json" --compare <dir>   # every softening level, for listening
node tools/cut-letters.js "<file>.wav" "<cuts>.json" --site gentle     # into site/qaida/audio/ and manifest.json
```

On Linux (cloud), decode the `.m4a` with any AAC decoder to 16-bit WAV at the file's own rate (44.1 kHz) instead of the
PowerShell script; the cut lists' times are in seconds from the file's start. Take a sound off its hold by deleting its
`"hold"` line and re-running `--site`.

## In the lessons

- Lessons 1–3: tapping a letter says its name.
- Lessons 4–6: "This is zabar." has a Hear it button (the mark's name, in the student's chosen naming). Tapping a marked
  letter on the board spells it hijje style, "Baa, zabar, ba" (`audio.js` `spell`; checked by `tools/qaida-hijje-check.js`).
  The drill still plays the sound alone. Open question for the user: keep spelling on tap, or move it to its own button.
- Words (later lessons) can spell letter by letter from these pieces, but the joined parts need whole-word recordings.

## Checks

`node tools/<name>-check.js` for every `tools/qaida-*check.js` (26 scripts, all passing on 2026-11-20).
