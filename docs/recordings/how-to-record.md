---
tags: [recordings, audio, guide]
---
# How to record on a phone (Infinix Note 50 Pro)

*Written 2026-10-29 for the redo of the letter names (Lessons 1–3). Use the same setup for every later lesson so all the
clips sound alike.*

**Part of:** [[docs/recordings/README|Recordings]] · [[QAIDA-BUILD]] (step 10) · the script: `docs/recordings/recording-script.html`

## Why the first take hissed

The first recording was a WhatsApp voice note. Four things made some letters (Seen, Sheen, Ṣaad, Zaa, Thaa, Ḥaa…) sharp
and uncomfortable:

1. **WhatsApp squeezes the sound** into a very small file. The "s" sounds suffer most and come out fizzy.
2. **The mouth was close to the mic and pointing straight at it.** "S" and "sh" are a jet of air; aimed at the mic they
   land as hiss.
3. **The phone tries to help:** noise reduction and automatic volume push quiet hiss up between words.
4. **A bare room:** hard walls bounce the "s" back a second time.

Filtering afterwards can soften it a little. Only the recording can fix it properly.

## 1. The app

- Use the phone's own **Recorder** app, not WhatsApp. In its settings choose the **highest quality** it offers (WAV if it
  has it; otherwise the highest-quality setting, 48 kHz if shown). Turn **off** any "noise reduction" or "denoise" option.
- If the Recorder has no quality setting, install **ASR Voice Recorder** from the Play Store and set it to **WAV,
  48 kHz, mono**, with noise reduction and gain control off.
- Put the phone in **airplane mode** and **Do Not Disturb**. A notification or call ruins a take.

## 2. The room

- The best cheap studio is **a wardrobe full of clothes**: stand or sit facing into the hanging clothes. Second best: a
  bedroom with a bed, curtains and carpet. Never a kitchen, bathroom or tiled hall.
- Turn off fans, AC, and anything humming. Record when the house and the street are quiet (late evening is good).
- No wardrobe? Make a **blanket fort**: a thick duvet over the speaker's head and the phone together. It looks silly
  and works very well.

## 3. The phone

- **Don't hold it.** Fingers on the case make rumble. Stand it on a pile of books with a **folded towel underneath**, so
  table bumps don't reach it.
- The main mic is the **small hole on the bottom edge**. Point the bottom edge at the speaker's **chin**, not the mouth.
- **Distance: one hand-span to a forearm (20–30 cm).** Always the same distance, for every clip.
- **Speak past the phone, not into it:** turn it about 45° to the side, so the breath goes beside the mic. This is the
  biggest single fix for the hiss.

## 4. A pop screen (the cloth hack)

Don't wrap the phone itself; that muffles everything. Put a thin cloth **between** the mouth and the phone instead:

- Bend a **wire coat hanger** into a loop and stretch **one layer of an old pair of tights or a thin T-shirt** over it,
  or stretch a **thin sock** over an embroidery hoop or the rim of a cut-off plastic cup.
- Stand it about **5–10 cm in front of the mouth**, the phone behind it.

It catches the bursts of air on Baa, Daal, Ṭaa and Qaaf, and takes the edge off the "s" sounds.

## 5. Test first (2 minutes)

Record **Seen, Sheen, Ṣaad, Baa, ʿAyn**. Listen **with earphones**:

- **Hiss or sharp "s"?** Move the phone further away or turn it more to the side.
- **Thumps on Baa?** Move the cloth closer to the mouth.
- **Sounds far away or roomy?** Move a bit closer, or add more blankets.
- **Background hum?** Find what's switched on.

Only then record the real thing.

## 6. Reading the letters

- Say each name **twice**, with a **2-second gap** after each one: "Alif … Alif … Baa … Baa …". The gaps let the clips be
  cut cleanly and the better one kept.
- Say each one **as if it were the only word**, ending low and calm. In a list the voice tends to rise ("Alif? Baa?
  Taa?"); a learner hears that.
- **Normal speaking volume**, not loud. A steady, slightly slow pace, the same all the way through.
- Don't over-press the throat letters. ʿAyn and Ḥaa should be clear but natural, not strained.
- A mistake? Stop, wait two seconds, and **say the letter again**. Don't restart the whole list; just carry on.
- Drink water before. Avoid dairy just before; it makes mouth clicks.

## 7. Getting the file to the PC

- **Not through WhatsApp** (it squeezes the file again). Use a **USB cable**, or upload to Google Drive and download it.
- Put it in `recordings-inbox/` (git ignores that folder; the repo is public).
- Name it by what it is, e.g. `letters-names-2026-10-29.wav`.

Then Claude cuts the clips, softens any leftover "s" sharpness (a de-esser) and evens the volume. A compare page, like
`recordings-inbox/compare.html`, plays each letter before and after, so you choose how much.

The tools (2026-11-19): `tools/m4a-to-wav.ps1` decodes a phone's .m4a without ffmpeg, and `tools/cut-letters.js` cuts,
cleans and writes the files. How the letter names went: [[docs/recordings/letters-build-record|The letter names, recorded]].
