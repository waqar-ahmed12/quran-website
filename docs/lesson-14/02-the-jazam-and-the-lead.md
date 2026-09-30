# 02 — The jazam, the lead, and which letters

## 1. The characters

| | Code point | Role |
|---|---|---|
| jazam (Indo-Pak, and the id) | U+0652 | `cp` |
| jazam (Madani) | U+06E1 | the Madani form's `cp`: Lesson 10 measured Scheherazade New drawing U+0652 as a small circle and U+06E1 as the open head-of-khaa the Madani mushaf prints (`site/qaida/marks.js`, the `fatha-waw` comment) |
| alif | U+0627 | the lead's letter |
| zabar | U+064E | the lead's vowel |

```js
// Lesson 14 (docs/lesson-14/): the jazam on any letter. A jazam has no sound on its own, so every item on this
// lesson's page is drawn after a vowelled alif, the LEAD (docs/lesson-14/02 §2): drawn, never asked, never part
// of an id. The id is the letter and the jazam, two characters, so masteredCount needs no change. `against`: the
// same letter with a vowel instead, "a-ba" against "ab" (docs/lesson-14/01 §2).
sukun: {
  id: 'sukun', cp: 0x0652, names: { fatha: 'sukoon', zabar: 'jazam' }, sits: 'above', lesson: 14, audio: 'sukun',
  first: MARKS.fatha.first, sample: 'ب', against: ['fatha', 'kasra', 'damma'],
  skip: ['ا', 'ء'], lead: [0x0627, 0x064E],
  forms: { madani: { cp: [0x06E1] } },
},
```

The row's `id` and `audio` are the Arabic technical term, like `fathatain`. They are folder and key names, never
shown. The student reads `names`.

## 2. The lead

**What:** alif with zabar, drawn in front of every item and every twin on this lesson's page, and nowhere else. The
bare letter's own tile (the first of the trio) has no lead: it is the letter as Lesson 1 taught it.

**Why alif:** a printed Qaida's jazam table is built on it. Alif also **never joins forward**, so the letter after it
keeps its alone shape, the one Lesson 1 taught, and the student has nothing new to read about joining.

**Why zabar, and only zabar:** `01` §3, and `07` §1 for the alternative.

**Checked 2026-09-28** (`docs/pass-2/01` §3): Quran.com's Indo-Pak text writes اَنْعَمْتَ (1:7) as U+0627 U+064E, a bare
alif with zabar, so **the bare lead is exactly the Indo-Pak mushaf's spelling**. Its Uthmani text writes أَنْعَمْتَ with
U+0623.

**In Madani:** the Madani mushaf writes a vowelled alif at the start of a word with a hamza on it (أَ). The Qaida has
never done that. Lessons 4–6 already draw اَ اِ اُ **bare in both scripts** (zair's first six begins with ا), so the
lead follows them: **bare in both**. `07` §3 asks the teacher. If the answer is أَ in Madani, it is one line in the
form (`lead: [0x0627, 0x0654, 0x064E]`), and `leadOf` reads the form before the row (`03` §1).

## 3. Which letters: 27

`skip: ['ا', 'ء']`:
- **ا** never carries a jazam. An alif is always long or silent, never a closed consonant.
- **ء**: its seat is written differently by the two scripts' mushafs, Lesson 8's reason, unchanged.

**و and ي stay.** اَوْ and اَيْ are exactly Lesson 10's "au" and Lesson 12's "ai". In part 2 a line says so
(`01` §4).

**Part 1 is zabar's six:** ب د ر س م ل, giving اَبْ اَدْ اَرْ اَسْ اَمْ اَلْ. The jazam sits above, where these six
have clear space. **اَلْ is "al"**, the most common jazam there is: the Arabic "the". `07` §4 asks whether the board
should say so.

## 4. The jazam's shape on every letter — measure it

Lesson 10 settled the Madani shape (U+06E1) on the wow only. Here it sits on all 27, including the **tall** letters
(ل ط ظ ك, and ك's Indo-Pak form ک), where a mark above is pushed high:

1. In the browser pane, draw part 2's full table in both scripts, default and Large.
2. Compare every glyph's ink box with its tile, as lessons 9 and 10 did. Lesson 9 measured laam under khari zabar,
   the tallest stack the Qaida draws, and found it clear. The jazam is smaller, so expect clear.
3. Record the result in `qaida.css`, as lessons 9 and 10 did, with a rule only if something clips.

**Indo-Pak:** the stand-in face (Noto Naskh) draws U+0652 as a small circle, which is not the Indo-Pak mushaf's
jazam. That is the known launch blocker, fixed at step 13. Note it and change nothing.

## 5. The tile is two letters wide

Every item and twin tile holds the lead and the letter, so it is wide, like lessons 8–13's. Lesson 8's wide tile
(`data-tail`) is the answer (`03` §2). The lead ا never descends, so the only descenders are the letters' own
(ج ح خ ع غ ر ز و م ن ق ي in their alone shapes), which Lesson 1's tiles already hold.
