# Chat log — Qaida build, step 1 start, 2026-09-14

A summary of this session so it can be picked up on another PC. The decisions themselves live in `QAIDA-BUILD.md`
(steps, skills, decisions) and `QAIDA-CONTENT.md` (lesson content).

## What the user asked

1. Look at the Qaida md file and list the skills.
2. `/minimalist-ui` "start building the qaida, ASK CLARIFYING QUESTIONS, save the steps and skills in a file and keep
   reminding me."
3. "Please backup chat, I will continue at home."

## Answers the user gave

- Script: **both Indo-Pak and Madani, with a switch.**
- Names: **both, the student picks** (zabar/zair/paish/jazam or fatha/kasra/damma/sukoon, with matching letter names).
- Printed Qaida order: didn't know — **and asked for a progress bar showing how far the student has reached.**
- Extras (record own voice, trace letters, remember progress, finish screen): **all, but for now only the Qaida page
  and the first lesson. Don't do the rest yet.**
- Recordings: **leave this feature out for now.**
- Transliteration: **off, tap to peek.**
- "Beginning shapes → difficult shapes" meaning: **"do what you like best"** → Claude's call: lesson 1 in alphabet order,
  in shape families; easy-to-hard shapes becomes lesson 3 (see `QAIDA-CONTENT.md`).

## Done so far

- `QAIDA-BUILD.md` created: 12 steps with skills, decisions table. Current: **step 1, the Qaida page and Lesson 1.**
- `QAIDA-CONTENT.md` updated with the decisions.
- `CLAUDE.md`: reminder rule added (end every Qaida reply with current step, skills, next step).
- Found: this PC has no user-level plugins; only project skills. `minimalist-ui` = `taste-skill:minimalist-skill`,
  `high-end-visual-design` = `taste-skill:soft-skill`.

## Research findings (for step 1)

- **Indo-Pak font:** "Indopak Nastaleeq" on QUL (https://qul.tarteel.ai/resources/font/242), in TTF/WOFF/WOFF2; licence
  not yet confirmed. Alternatives: DigitalKhatt indopakfont (https://github.com/DigitalKhatt/indopakfont), PakType
  fonts, "Al Qalam Quran Majeed" (a Google Fonts issue says OFL: https://github.com/google/fonts/issues/7055).
  **Check the licence and ask the user before downloading any font file.**
- **Madani font:** Amiri Quran, already on the site (Google Fonts, OFL).
- **Quran.com code points** (node probe, works from this PC): Indo-Pak text uses sukoon U+06E1, plain alif/lam for
  Allah, U+06AA (swash kaf) in 2:2, ordinary ي U+064A and ه U+0647 — not ک ہ ی. Uthmani uses U+0652 sukoon, U+0671 alif
  wasla. So the Indo-Pak look comes mainly from the font and marks, not different letters.
- Letter names seen in English Noorani Qaida guides: Alif, Ba, Ta, Tha, Jeem, Haa, Kha, Daal, Dhaal, Ra, Za, Seen,
  Sheen, Saad, Daad, Taah, Zaah, Ain, Ghain… The teacher should check both name lists (text fields on the page).

## Next, at home

Build step 1: `site/qaida/` (index.html, qaida.css, qaida.js, qaida-options.js) — home with 14 lessons and progress bar,
first-visit script/names choice, Lesson 1 (29 letters, tap to peek), progress in localStorage, site tokens and
light/dark, options panel with text fields. Pick the Indo-Pak font first.
