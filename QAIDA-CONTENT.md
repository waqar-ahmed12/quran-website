# Qaida Module — Content Plan

**Status: draft, content only.** This is the lesson sequence and content rules for the free Qaida module, the
`#qaida` stand-in link on the landing page (see `WEBSITE-BUILD.md`). How it gets built, in what order and with which
skills, is in `QAIDA-BUILD.md`. Change this freely; nothing here is locked.

## Scope for this pass

Alphabet through jazam only: letters, recognition, positional forms, zabar/zair/paish,
tanween, madd, standing harakaat, leen, jazam. Shadda and tajweed rules (noon/meem sakinah,
qalqalah, etc.) are a later pass — **planned 2026-09-28** as lessons 15–29, from shadda to reading whole surahs: see
**"Second pass"** below and `docs/pass-2/` (the user: "okay, plan for shadda too, and the ones that are left for the
quran").

**Connected reading (spelling it out) is now in scope, brought forward 2026-09-27** (the user, after previewing
lessons 4–6: "there should be actual words... an actual exercise, like eg kataba, i teach, kaf zabar ka, ta zabar ta,
kata (read from the back), ba zabar ba, kataba (altogether)"). This is the traditional Qaida *hijjey* (spelling)
method: name each letter with its mark, blend two into a syllable read right to left, then carry on letter by letter
until the whole word is read. Every mark lesson already plans "3–4 example words per exercise" for audio (see
Decided, below); this turns that from a sound clip into a step-through teaching block the student works through
themselves, the same shape as Lesson 1's tracing board — shown, not scored. See `QAIDA-BUILD.md` for where it lands
in the build order; open questions are there too, since they need the teacher's answers before it's built.

## Sequence

1. **Alphabet, isolated forms** — all 29 letters in alphabet order, taught in shape families (ب ت ث together,
   ج ح خ together, and so on), so each shape is learnt once and the dots tell the letters apart. *Claude's call,
   2026-09-14, after the user left it open:* the look-alike letters already sit side by side in alphabet order, and
   keeping that order means the page lines up with a printed Qaida. Seeing the letters out of order is lesson 2's job.
2. **Random recognition drill** — same 29 letters, shown out of sequence, not the
   memorized page order. Catches students who can recite the alphabet in order but can't
   name a letter cold.
3. **Letter shapes** — the user's "beginning shapes for the alphabets, slowly transitioning to the difficult shapes,
   then shapes depending on whether in start, middle or end". **Confirmed by the user, 2026-09-20: five bands, then made
   six the same day** (the long third band split in two, to keep the lesson finishable) — the six that never join
   forward (ا د ذ ر ز و), then the two that never change (ط ظ), then tooth-and-tail in two halves (ب ت ث ن ي س ش, then
   ص ض ف ق ل), then the shape-shifters (ج ح خ ع غ ه ك م), and finish with the full start / middle / end table. Built;
   specified in `docs/lesson-3/`, whose `README.md` lists where the build differs.
4. **Zabar** — lesson + exercise. The first **mark**, and the first page where the student's choice of names changes
   what is written on it. Specified 2026-09-20 in `docs/lesson-4/`, which also lays out `marks.js` and
   `mark-lesson.js`, the two files lessons 5 and 6 reuse. **Blocked on `docs/lesson-4/09-open-questions.md` §1:** the
   answer to "what does بَ say" is a sound, and the Qaida has no recordings and no transliteration.
5. **Zair** — lesson + exercise. Exercise pool mixes in zabar review items; zair items are
   mandatory (must get right), review items aren't the gate.
6. **Paish** — lesson + exercise. Exercise pool mixes in zabar + zair review; paish items
   mandatory. Specified 2026-09-21 in `docs/lesson-6/`, which holds only what is new on top of `docs/lesson-4/` and
   `docs/lesson-5/`. The mixing-in is the lesson: paish sits in the **same place** as zabar and differs only in shape,
   so a pool of paish alone is answerable by last lesson's skill. `docs/lesson-6/06` §0 asks whether to build it before
   lessons 4 and 5 have been previewed.
7. **Tanween** — fathatain / kasratain / dammatain, or do zabar / do zair / do paish. Specified 2026-09-21 in
   `docs/lesson-7/`, which holds only what is new on top of lessons 4–6. One idea, three shapes: **the mark
   written twice adds an *n*** (بَ "ba" → بً "ban"), so it teaches no new place and no new stroke, and it doubles
   as the revision of lessons 4–6. The first lesson with **more than one mark**, one per part, then all the
   letters. The two scripts' difference here is **font-only** — same three code points, stacked in Indo-Pak and
   side by side in Madani — so it cannot show until the Indo-Pak font blocker above is fixed.
   `docs/lesson-7/06` §0 says it should not be built until lessons 4, 5 and 6 have been previewed.
8. **Zabar + alif** (madd — long aa). Built 2026-09-27 from `docs/lesson-8/`, which holds only what is new on top
   of lessons 4–7; see `QAIDA-BUILD.md`, "Step 8 built — Lesson 8" for where it differs. **An alif after zabar makes the sound long** (بَ "ba" → بَا "baa"); the first lesson whose items
   are **two letters**, and the first long vowel. Recommended: **27 letters** (no ا — the long aa there is آ, a
   different sign — and no ء, which the two scripts' mushafs write differently), **لَا met for the first time** (a
   font ligature, not a new letter), and real words at last. Named plainly on the page — "zabar and alif", never
   "madd" (the user, on Lesson 7's names). Its words are ordinary Arabic spelling, **not quotations**: the mushaf
   writes many long-aa words with item 9's standing mark instead of an alif.
9. **Standing harakaat** — khari zabar, khari zair, ulta paish (diacritic-only forms of
   the same three long vowels, no full letter). Built 2026-09-28 from `docs/lesson-9/`, which holds only what is
   new on top of lessons 4–8; see `QAIDA-BUILD.md`, "Step 8 built — Lesson 9" for where it differs. Lesson 7's shape
   (three marks, one part each, then all 27 letters). **The first place the two scripts write different
   characters**, not just different fonts: Indo-Pak بٰ بٖ بٗ, Madani بَٰ بِۦ بُۥ (the short mark plus a small alif,
   yaa or waw). بٰ is the same sound as item 8's بَا, so it is shown beside it, never asked against it. Its words
   are the mushaf's own spellings and are checked against it in both scripts.
10. **Zabar + wow, sakin** (leen — "au" diphthong). Specified 2026-09-28 in `docs/lesson-10/`, not built; the whole
    phase (items 10–14) is mapped in `docs/step-9/README.md`. The jazam appears on the wow as part of the pattern,
    named in one line, four lessons before item 14 teaches it. Named plainly — "zabar and wow", never "leen".
11. **Paish + wow** (madd — long oo). Exercise should minimal-pair against #10 — same
    letter, hear one, pick which — since wow is doing two different jobs one lesson apart. Specified 2026-09-28 in
    `docs/lesson-11/`, **built 2026-09-29** (`lesson-11.html`, `exercise-11.html`; see `QAIDA-BUILD.md`, "Step 9
    built — Lesson 11"). **The scripts disagree about a mark**: Indo-Pak puts a jazam on the long-vowel wow
    (بُوْ), Madani leaves it bare (بُو). So in Indo-Pak the minimal pair is only zabar against paish. The board's
    jazam line is worded once per script. Ulta paish (item 9's spelling of the same "oo") is shown beside it as "the
    same sound", never asked against it. Words for the teacher's check: نُورٌ, رُوحٌ, يَقُولُ (spelling) and twelve
    on the reading page; plurals with a silent alif after the wow (كَفَرُوا) are left out.
12. **Zabar + yaa, sakin** (leen — "ai" diphthong). Specified 2026-09-28 in `docs/lesson-12/`, **built 2026-09-29**
    (`lesson-12.html`, `exercise-12.html`; see `QAIDA-BUILD.md`, "Step 9 built — Lesson 12"). The yaa is a letter
    the scripts write differently (ي / ی, dotless at the end in Indo-Pak), so both scripts draw the tail from
    `forms` while the id stays one. The board says once, in Indo-Pak only, that the end yaa has no dots. No
    same-sound tile. Words for the teacher's check: بَيْتٌ, زَيْتٌ, عَلَيْهِ (spelling) and twelve on the reading page.
13. **Zair + yaa** (madd — long ee). Same minimal-pair treatment against #12. Specified 2026-09-28 in
    `docs/lesson-13/`, **built 2026-09-29** (`lesson-13.html`, `exercise-13.html`; see `QAIDA-BUILD.md`, "Step 9 built
    — Lesson 13"). Lesson 11's shape with Lesson 12's yaa: the same-sound tile is khari zair (item 9's spelling of
    the same "ee"), shown beside it, never asked; Indo-Pak shows the jazam on the yaa and Madani leaves it
    bare. Two marks sit below the line side by side, which needed one CSS fix. Words for the teacher's check: فِيلٌ,
    دِينٌ, كَبِيرٌ (spelling) and twelve on the reading page; فِي "in" alone is left out.
14. **Jazam** — sukoon, generalized to any letter. Specified 2026-09-28 in `docs/lesson-14/`, not built. Each item
    is drawn after a vowelled alif (اَبْ), as a printed Qaida's jazam table is, because a jazam cannot be said on its
    own. **Waits on the user's choice of one lead or three** (`docs/lesson-14/07` §1).

## Second pass — reading the Qur'an (planned 2026-09-28, not built)

The test the pass is built to: **can the student read Al-Fatiha?** After Lesson 14 they still stop at almost every
word of it (`docs/pass-2/README.md` §1). Lesson 15 is specified in full (`docs/lesson-15/`); lessons 16–29 have a
one-file plan each (`docs/lesson-N/README.md`), expanded into a full folder before each is built. **Waiting on the
user's yes to the sequence and to building it before launch** (`docs/pass-2/03` §1–2).

15. **Shadda** (tashdeed): a letter said twice, اَبَّ "ab-ba"; the hum on نّ مّ named once.
16. **Hamza**: one sound on four seats; read the hamza, never the seat. **The rule page is born here.**
17. **The round taa and the end yaa** (ة ى): two end shapes not among the 29. ى is the mushaf's end yaa in both
    scripts.
18. **Al-**: the moon letters (the laam read) and the sun letters (the laam not read, the next letter doubled); the
    name Allah. **The first lesson built on the Qur'an's own words**, copied from Quran.com, never typed.
19. **The joining alif**: read at the start, skipped in the middle; a long vowel before it goes short.
20. **The wavy line** (madd): hold a long vowel longer.
21. **Letters that are not read**: Madani marks them (a small circle), and Indo-Pak marks the letters that *are* read,
    which is why lessons 11 and 13 carry a jazam on the Indo-Pak long-vowel wow and yaa.
22. **Stopping**: how a word changes at a stop, and the stop signs (different sets in the two mushafs).
23. **Al-Fatiha**, read whole. **The verse page is born here**, and the Qur'an fonts must be in.
24. **Noon with jazam, and tanween**: clear, merged, turned into meem, hidden. Madani prints the rule, and Indo-Pak
    mostly doesn't.
25. **Meem with jazam**: merged, hidden before baa, clear.
26. **The bounce** (qalqalah).
27. **Heavy and light letters**: the seven, raa, the laam of Allah.
28. **The opening letters** (الٓمٓ): read by their names.
29. **The last surahs**, 105–114, and then the finish screen and one-to-one lessons.

**How the two scripts print all of this was checked against Quran.com's own text** (22 verses, both scripts,
`docs/pass-2/01`). The finding that shapes the most lessons: **Indo-Pak marks the letters that are read** (a
long-vowel wow or yaa carries a jazam, and a bare one is silent), **while Madani marks the ones that are not** (a
small circle), and **Madani prints the noon and meem rules in its marks, where Indo-Pak mostly doesn't.**

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
- **Audio** *(revised 2026-09-18)*: the player is built and the recordings arrive gradually — the teacher records
  **the lesson's own items, plus 3–4 example words per exercise**, "because there are a lot of words". Nothing
  assumes a file exists: `site/qaida/audio/manifest.json` lists only what has been recorded, and the lesson says
  plainly how many are in. Until a letter has one, it plays a **wordless hum** — a human timbre saying nothing at
  all, never a machine pronouncing the letter. `site/qaida/recordings.html` lists what's still missing.
- **Trace the letters** *(revised 2026-09-18)*: moved out of "later" and into Lesson 1, because the user wants it
  "for learning purpose for people, to practice" — a student traces a letter the moment they've learnt it. Deliberately
  **unmarked**: handwriting recognition on Arabic isn't reliable enough to tell a student they're wrong, and a
  printed Qaida asks them to compare by eye anyway.
- **Extras, later:** record your own voice, finish screen.
- **Finishing a drill lesson is a recommendation, not a gate** *(the user, 2026-09-19)*: "a recommendation that you
  seem okay, let's move on, or if some letters are wrong, repeat them not in a row but increase the frequency, but
  if more frequent, recommend to go back". So a missed item comes back **more often but never straight away**, and
  one missed repeatedly raises "go back and look at it again" — advice with a way back, never a block.
- **Mixed review carries through every later lesson** *(the user, 2026-09-19 — this answers the interleaving
  question that was open at items 5 and 6)*. From lesson 5 on, a lesson's pool is its own items **plus** review
  items from earlier lessons. **The lesson's own items are the gate; the review items never are.**
- **Skipping ahead is allowed** *(the user, 2026-09-19)*: "if the user wanted to skip they can, but they should
  also be advised that if they are new, it is recommended to go with the flow". **Nothing in the Qaida is locked.**
  A lesson reached out of turn advises once and then lets the student through. This overrules the locks built at
  step 1; the full spec is `docs/lesson-2/09-going-in-order.md`.

## Content rules carried over from the landing page

- Any real Quran text used in later reading-practice lessons: exact Uthmani text from
  Tanzil/Quran.com, never generated or typed from memory — same rule as the aayat overlay.
  With both scripts, that means Quran.com's Indo-Pak text as well as its Uthmani text.
- Audio: the user's own recordings or a vetted reciter, never AI voice — mispronunciation
  is the exact thing being taught against.

## Still open

*(Both of the questions that stood here have been answered.)*

- **Jazam after leen (items 10–13 before 14)** — **answered 2026-09-20: keep jazam last.** Leen is memorized as a
  pattern first and jazam then generalizes the rule to any letter, which is also how a printed Qaida orders it.
  The "Ask first" note on `QAIDA-BUILD.md` step 9 (was step 8 until 2026-09-22) is settled.
- **Interleaving scope** — answered 2026-09-19; see **Decided** above.
