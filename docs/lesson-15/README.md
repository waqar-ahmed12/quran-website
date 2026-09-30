# Lesson 15 — Shadda: build specification

**Read `docs/pass-2/` first** (the second pass: why it exists, the fifteen lessons, what the two scripts print). Then
`docs/lesson-4/` in full, and `docs/lesson-7/`, `docs/lesson-9/` and **`docs/lesson-14/`**, whose lead this lesson
reuses. **This folder is only what is new.** Where it is silent, those folders and the built code are the answer.

Written 2026-09-28 (the user: "okay, plan for shadda too, and the ones that are left for the quran"). The first lesson
of the second pass, and the only one planned in full so far. `docs/lesson-16/` to `docs/lesson-29/` are one-file plans.

## Status — built (2026-09-29)

Built as `QAIDA-BUILD.md`'s "Step P1 built — Lesson 15" records. **Where the build differs from this folder:** the kasra with
a shadda was measured (`02` §3) and **both** faces the site uses draw it above the letter, so `sits` is `above` on all
three rows and the per-script `sits` (`03` §2) was **not built**; the twin's own lead (`03` §3) was already in `marks.js`
from Lesson 14; the captions take a `{c}` consonant token because part 2's featured letter is taa, not baa; the last
part's middle captions all say "Twice"; and `.leads-note`, `.wy-note` and `.jazam-note` are not on the page.

| | |
|---|---|
| **Written** | this folder, then `site/qaida/lesson-15.html` and `exercise-15.html` |
| **Blocked on** | **Lesson 14 built** (the lead: `leadOf` and its eight draw sites). The user's yes to the second pass (`docs/pass-2/03` §1–2) |
| New page files | `lesson-15.html`, `exercise-15.html` |
| New code | `cp` may be a **list** (two marks on one letter); a form may say where it **sits**; the twin's lead; the home in two parts; a hum line |
| New data | a set of three rows (`'shadda'`), three audio groups (**up to 81** recordings) |

## What Lesson 15 is, in a paragraph

**A shadda means the letter is said twice**: once with no vowel, closing the syllable before it, then again with its
own vowel. اَبَ is "a-ba", اَبْ is "ab", and **اَبَّ is "ab-ba"**, both at once. So a shadda is a jazam and a vowel on
one letter, which is why it comes straight after Lesson 14. It is in the basmala (اللّٰهِ, الرَّحْمٰنِ) and in almost
every verse of the Qur'an. On noon and meem it is held with a hum through the nose (نّ مّ), which the page names once.

## The one thing that is genuinely new

**A mark whose *place* differs by script, with the same code points.** A kasra with a shadda: the **Indo-Pak** mushaf
writes the kasra **under the letter**, and the Madina mushaf, in most Arab printing, **under the shadda**, above the
letter. Both are U+0650 U+0651. So Lesson 9's `forms` cannot help: there is no other character to draw. It is the
**font's** placement. So:

1. **measure first** what each face the site loads does with shadda and kasra (`02` §3);
2. a form can say where it **sits** in a script (`sits: 'above'` in Madani), so the tile gets room at the right end;
3. if a face places the kasra the wrong way for its script, the answer is that face's own feature switch (CSS
   `font-feature-settings`) or a different face, never moving the mark by hand.

Two smaller new things:
- **two marks on one letter as the lesson's own mark**: `cp` becomes "a code point or a list", in two lines of
  `marks.js` and one of `shell.js` (`03` §1);
- **Lesson 7's three-part shape with Lesson 14's lead**: shadda with zabar, with zair, with paish, then every
  letter. The twins in the warm-ups are the same letter with only the vowel, and with only the jazam, so the board
  reads **ب → اَبَ → اَبْ → اَبَّ**: the shadda as the sum of the two before it.

## Read in this order

| File | What it settles |
|---|---|
| `01-what-it-teaches.md` | "said twice", the contrasts, the hum, what is out |
| `02-the-shadda-and-the-scripts.md` | the characters, their order, **the kasra's place, measured**, which letters |
| `03-code-changes.md` | `cp` as a list, `sits` per script, the twin's lead, the hum line, `spell.js`, the words check, the home |
| `04-page-and-wording.md` | `lesson-15.html` |
| `05-words.md` | fifteen candidates |
| `06-files-and-steps.md` | build order, checks, browser checklist |
| `07-open-questions.md` | the names, the leads, what the teacher records |

## The three things most likely to go wrong

1. **The kasra drawn in the other script's place**, and nobody notices, because both look "fine". The checklist
   (`06` §4) puts Indo-Pak's اَبِّ next to a photograph of the student's own Qaida page.
2. **The halo ringing the vowel, not the shadda.** `markBox` rings what a form's *last* mark adds. So the marks are
   composed **vowel first, shadda last** (`02` §2), and the check asserts the ring's box is the shadda's.
3. **The id changing with the order of marks.** The id is one fixed order (vowel, then shadda, Unicode's own), in
   both scripts, forever. Quran.com writes the other order (`docs/pass-2/01` §10), and the two are never compared
   without normalising.
