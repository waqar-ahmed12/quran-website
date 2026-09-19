# Qaida Module — Content Plan

**Status: draft, content only.** This is the lesson sequence and content rules for the free Qaida module, the
`#qaida` stand-in link on the landing page (see `WEBSITE-BUILD.md`). How it gets built, in what order and with which
skills, is in `QAIDA-BUILD.md`. Change this freely; nothing here is locked.

## Scope for this pass

Alphabet through jazam only: letters, recognition, positional forms, zabar/zair/paish,
tanween, madd, standing harakaat, leen, jazam. Shadda, tajweed rules (noon/meem sakinah,
qalqalah, etc.), and connected reading are a later pass — not in this document yet.

## Sequence

1. **Alphabet, isolated forms** — all 29 letters in alphabet order, taught in shape families (ب ت ث together,
   ج ح خ together, and so on), so each shape is learnt once and the dots tell the letters apart. *Claude's call,
   2026-09-14, after the user left it open:* the look-alike letters already sit side by side in alphabet order, and
   keeping that order means the page lines up with a printed Qaida. Seeing the letters out of order is lesson 2's job.
2. **Random recognition drill** — same 29 letters, shown out of sequence, not the
   memorized page order. Catches students who can recite the alphabet in order but can't
   name a letter cold.
3. **Letter shapes** — the user's "beginning shapes for the alphabets, slowly transitioning to the difficult shapes,
   then shapes depending on whether in start, middle or end". *Claude's reading, to confirm at build step 3:* start
   with the letters that barely change when joined (ا د ذ ر ز و), then the ones that only lose their tail
   (ب ت ث ن ي), then the ones that change most (such as ع غ ه ك), and finish with the full start / middle / end table.
4. **Zabar** — lesson + exercise.
5. **Zair** — lesson + exercise. Exercise pool mixes in zabar review items; zair items are
   mandatory (must get right), review items aren't the gate.
6. **Paish** — lesson + exercise. Exercise pool mixes in zabar + zair review; paish items
   mandatory.
7. **Tanween** — fathatain / kasratain / dammatain.
8. **Zabar + alif** (madd — long aa).
9. **Standing harakaat** — khari zabar, khari zair, ulta paish (diacritic-only forms of
   the same three long vowels, no full letter).
10. **Zabar + wow, sakin** (leen — "au" diphthong).
11. **Paish + wow** (madd — long oo). Exercise should minimal-pair against #10 — same
    letter, hear one, pick which — since wow is doing two different jobs one lesson apart.
12. **Zabar + yaa, sakin** (leen — "ai" diphthong).
13. **Zair + yaa** (madd — long ee). Same minimal-pair treatment against #12.
14. **Jazam** — sukoon, generalized to any letter.

## Decided (the user, 2026-09-14)

- **Script:** both Indo-Pak and Madani, with a switch. Wherever the two scripts write something differently, the
  lesson shows the chosen script's version.
- **The letter list follows the script** *(the user, 2026-09-18)*. 29 either way. Lesson 1 teaches:
  - **Madani** — alphabet order: ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ء ي
  - **Indo-Pak** — the order of a printed Indo-Pak Qaida: ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ک ل م ن **و ہ**
    ء ی — و before ه, and the Indo-Pak forms ک ہ ی. **Laam (ل) only: lam-alif (لا) is not taught as a letter of its
    own** (the user, 2026-09-18).

  Progress is kept as letters rather than positions, and ک ہ ی count as the same letters as ك ه ي, so switching
  script costs the student nothing. *To confirm with the teacher:* the Indo-Pak order is Claude's reading of a
  printed Qaida. A Noorani Qaida that also teaches پ چ ڈ ڑ ٹ ژ گ would be a different list again — those letters are
  Urdu, not Qur'anic, so they are left out.
- **Launch blocker:** the Indo-Pak script is set in Noto Naskh Arabic, which is not what a printed Indo-Pak Qaida
  looks like. Google Fonts has no true Indo-Pak mushaf face; a licensed one (such as a KFGQPC IndoPak font) must
  replace it before launch.
- **Names:** both, and the student picks: zabar, zair, paish, jazam, or fatha, kasra, damma, sukoon.
  **The letters keep their Arabic names in both sets** *(the user, 2026-09-18: "even in zabar zair paish, you have to
  write in arabic the names, like baa and not be")* — Baa, Taa, Thaa, not Be, Te, Se. So the choice changes the
  **marks**, and with them the titles of lessons 4–14 on the Qaida home. One list of letter names, which the teacher
  checks before launch.
- **Transliteration:** off; tapping a letter shows its name for a moment. Whether it stays once real words start is
  for a later pass.
- **Progress bar:** shows how far the student has reached.
- **Audio:** left out for now. When it comes back, the rule below applies.
- **Extras, later:** record your own voice, trace the letters, finish screen.

## Content rules carried over from the landing page

- Any real Quran text used in later reading-practice lessons: exact Uthmani text from
  Tanzil/Quran.com, never generated or typed from memory — same rule as the aayat overlay.
  With both scripts, that means Quran.com's Indo-Pak text as well as its Uthmani text.
- Audio: the user's own recordings or a vetted reciter, never AI voice — mispronunciation
  is the exact thing being taught against.

## Still open

- **Interleaving scope** — does the mixed-review pattern in items 5/6 carry forward through
  every later lesson (tanween re-includes harakat, madd re-includes tanween, etc.), or was
  it meant only for the zabar/zair/paish trio? Ask at build step 4.
- **Jazam after leen (items 10–13 before 14)** — deliberate (leen memorized as a pattern
  first, generalized to the jazam rule after), or should jazam move earlier so leen is
  taught as "jazam on wow/yaa after zabar" instead of a standalone exception? Ask at build step 6.
