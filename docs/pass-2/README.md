# The second pass — from jazam to reading the Qur'an

Written 2026-09-28. The user: *"okay, plan for shadda too, and the ones that are left for the quran."*
`QAIDA-CONTENT.md`'s "Scope" said the first pass stops at jazam, and "shadda and tajweed rules … are a later pass".
This folder is that pass: **lessons 15 to 29**, from shadda to reading whole surahs.

**Nothing was written to `site/`.** This folder is the map. Each lesson has its own plan:

- **`docs/lesson-15/`** (shadda, the next lesson) is a **full build specification**, in the shape of
  `docs/lesson-14/`.
- **`docs/lesson-16/` to `docs/lesson-29/`** each hold **one file**, a lesson plan: what it teaches, what is drilled,
  what the two scripts print, what is new in the code, the examples, the recordings and the open questions. Each one
  becomes a full folder before it is built, as lessons 10–14 did. They are planned this far ahead so the user can see
  the whole road and change it. Specifying every attribute of Lesson 27 before Lesson 18's new page exists would
  be guessing.

| File | What it settles |
|---|---|
| `README.md` | the test the pass has to pass, the fifteen lessons, their order, the steps, what it costs |
| `01-what-the-two-scripts-print.md` | **checked against Quran.com's own text**: how each mushaf prints every rule this pass teaches |
| `02-page-types-and-questions.md` | the three kinds of page the pass needs, the four kinds of question, where examples come from |
| `03-open-questions.md` | what the user and the teacher decide for the whole pass |

## 1. The test: can the student read Al-Fatiha?

A student who has finished Lesson 14 can read every letter with every mark. Put the opening of the Qur'an in front
of them and they still stop at almost every word:

| In Al-Fatiha | What they have not been taught | Lesson |
|---|---|---|
| بِسْمِ **اللّٰهِ** | the doubled letter; the alif not read; the name Allah | 15, 18, 19 |
| **الرَّحْمٰنِ** | the laam of "al-" not read before raa | 18 |
| **اَلْحَمْدُ** | the laam read before haa | 18 |
| **اِيَّاكَ** | the hamza (written ا in Indo-Pak, إ in Madani), and the shadda | 16, 15 |
| **اَنْعَمْتَ** | the hamza again; the noon said clearly | 16, 24 |
| **الصِّرَاطَ** | a heavy letter; the joining alif | 27, 19 |
| **الضَّآلِّيْنَ** | the wavy line: hold it longer; two shaddas | 20, 15 |
| every verse's end | how to stop: الرَّحِيْمِ is read "raheem", not "raheemi" | 22 |

So the pass is built to one test: **read Al-Fatiha (Lesson 23), then the last surahs of the Qur'an (Lesson 29)**.
Every lesson before them teaches one thing a real page of the mushaf needs.

## 2. The fifteen lessons

| # | Lesson (plain title) | The one idea | Page | Plan |
|---|---|---|---|---|
| **15** | **Shadda** (tashdeed) | a letter written once and read twice: اَبَّ "ab-ba" | mark lesson | **full**, `docs/lesson-15/` |
| 16 | **Hamza** | one sound on four seats (أ إ ؤ ئ ء). Read the hamza, never the seat | **rule lesson (new, born here)** | `docs/lesson-16/` |
| 17 | **The round taa and the end yaa** (ة ى) | two end shapes that are not among the 29 | rule lesson | `docs/lesson-17/` |
| 18 | **Al-** (moon and sun letters) | the laam of "al-" is read before some letters and becomes the next letter before others; **Allah** | rule lesson, **first Qur'an words** | `docs/lesson-18/` |
| 19 | **The joining alif** | an alif read at the start and skipped in the middle; a long vowel before it goes short | rule lesson | `docs/lesson-19/` |
| 20 | **The wavy line** (madd) | hold a long vowel longer | rule lesson | `docs/lesson-20/` |
| 21 | **Letters that are not read** | written, not read: the plural alif, the wow of أُولٰٓئِكَ. **Each script marks them its own way** | rule lesson | `docs/lesson-21/` |
| 22 | **Stopping** | how a word changes when you stop on it, and the signs that say where | rule lesson | `docs/lesson-22/` |
| 23 | **Al-Fatiha** | the first surah, read whole | **verse page (new)** | `docs/lesson-23/` |
| 24 | **Noon with jazam, and tanween** | four ways it is read: clear, merged, turned into meem, hidden | rule lesson | `docs/lesson-24/` |
| 25 | **Meem with jazam** | three ways: merged, hidden before baa, clear | rule lesson | `docs/lesson-25/` |
| 26 | **The bounce** (qalqalah) | ق ط ب ج د with jazam echo | rule lesson | `docs/lesson-26/` |
| 27 | **Heavy and light letters** | the seven heavy letters; raa; the laam of Allah | rule lesson | `docs/lesson-27/` |
| 28 | **The opening letters** | الٓمٓ: letters read by their names, at the start of 29 surahs | rule lesson | `docs/lesson-28/` |
| 29 | **The last surahs** | reading real surahs, 105 to 114 | verse page | `docs/lesson-29/` |

**Plain titles**, with the traditional word named once on the page, as Lesson 10 named "jazam". The user asked for
plain names over grammar words (`fixes/lesson 7/fixes.txt`). Tajweed words (izhar, idgham, ikhfa, qalqalah) are what
a Qaida class says, though, so `03` §4 puts it to the teacher.

## 3. Why this order

1. **Shadda first** (15). It is a mark, like everything in the first pass, so it runs on the first pass's own page
   (`mark-lesson.js`) and Lesson 14's lead. It is also the thing the student meets most: it is in the basmala.
2. **Then the spellings the 29 letters left out** (16, 17): hamza's seats, ة and ى. Every Qur'anic example from
   Lesson 18 on uses them. They are not "a mark on each of 27 letters", so they don't fit the mark-lesson page, and
   **the new rule page (`02` §1) is born here**, on a small, fixed set of items. That is the gentlest first job a new
   page can have, as Lesson 2 was for `practice.js`.
3. **Then what the mushaf prints but does not read the way it looks** (18–22). This is the turn from *letters* to
   *words*: al-, the joining alif, the wavy line, silent letters, stopping. The rule page gets its first **Qur'an
   words** in Lesson 18 and its "tap the letter" question in Lesson 21. **The wavy line comes before silent letters** because the best silent-letter example, أُولٰٓئِكَ, carries one.
4. **Al-Fatiha as soon as it can be read** (23). After 22, every word of it has been taught except the
   finer points of sound. That is the point of the whole Qaida, and it is a reason to keep going. `03` §6 asks
   whether it should wait until after 27 instead.
5. **Then the tajweed you hear** (24–27). The rules that change a sound without changing the page, or that one
   script prints and the other doesn't.
6. **The opening letters** (28), a small lesson of their own. None of the last surahs has them, so they can wait.
7. **The last surahs** (29), with everything.

**Jazam before shadda was the user's own order** (2026-09-20), and a shadda is a jazam and a vowel on one letter, so
the pass starts from exactly where the first one ends.

## 4. What changes for the whole Qaida

- **The home.** It lists fourteen lessons today (`shell.js`'s `LESSONS`). It will list 29, so it needs two parts:
  "Learning to read" (1–14) and "Reading the Qur'an" (15–29). The rows are added **when the pass starts** (step P1).
  Nothing is locked, as always, and the order advice (`docs/lesson-2/09`) carries on.
- **Lesson 14's Next** becomes an ordinary Next ("Next: Shadda"). Its `data-last` (`docs/lesson-14/03` §8) moves to
  **Lesson 29**, the new last lesson.
- **The finish screen** (`QAIDA-BUILD.md` step 11) comes after Lesson 29, not after 14.
- **The Indo-Pak font** stops being "a launch blocker at step 13" and becomes **a blocker for Lesson 23**, the first
  page of real Qur'an text (`01` §9). The Madani face needs a look too: Quran.com's Madani text writes the sukun as
  U+0652, which the site's Madani face draws as a small circle (`01` §1).

## 5. Steps

`QAIDA-BUILD.md` has steps 1–13. Steps 10–13 (recordings, finish screen, polish, audit) finish the Qaida, and they
should run **once, after this pass**. **Proposed:** name this pass's steps **P1–P5**, and leave 10–13 where they are
in the table but after P5 in time. That keeps every existing reference to "step 13" true.

| Step | Lessons | What is new | Skills |
|---|---|---|---|
| **P1** | 15 | `cp` as a list (two marks on one letter), a mark whose *place* differs by script, the home in two parts | `ui-ux-pro-max`, `full-output-enforcement` |
| **P2** | 16–22 | **`rule-lesson.js` and `rules.js`**, the second page type (born in 16); the Qur'an word fetch (18); the "tap the letter" question (21) | `ui-ux-pro-max`, `full-output-enforcement` |
| **P3** | 23 | **the verse page**; the verse fetch in both scripts; **the Qur'an fonts** | `ui-ux-pro-max`, `high-end-visual-design` |
| **P4** | 24–28 | tajweed on the rule page; recordings become the heart of it | `ui-ux-pro-max`, `full-output-enforcement` |
| **P5** | 29 | the verse page, many surahs; the last lesson's Next | `minimalist-ui` |

`03` §2 asks whether to launch the first pass before this one is built. **Recommended: no.** A student who cannot
read the basmala has not been taught to read the Qur'an, and the landing page promises exactly that.

## 6. What it costs the teacher

| Lessons | Recordings | Notes |
|---|---|---|
| 15 | up to **81** (27 letters × three vowels, "ab-ba, ab-bi, ab-bu"); fewer if only the items used are recorded | ghunna on نّ مّ |
| 16–17 | **few**: a hamza with a vowel is the sound Lessons 4–6 recorded on alif | |
| 18–22, 24–28 | **about a dozen examples each**, whole words | the by-ear question is the only real test of 24–27 |
| 23, 29 | **whole verses**: 7 for Al-Fatiha, about 50 for the last ten surahs | the teacher's own recitation, or a vetted reciter (`03` §5) |

And **every example is the Qur'an's own words** from Lesson 18 on, copied, never typed (`02` §3), so the teacher's
check is of the *choice* of examples, not their spelling.

## 7. What stays out, even after this pass

These are left to one-to-one lessons, which is what the landing page offers:
- the handful of words Hafs reads irregularly (the imala of مَجْرٜىٰهَا, the ishmam of تَأْمَنَّا, the eased hamza of
  ءَا۬عْجَمِىٌّ, the small seen over a saad);
- the exact counts of each madd, beyond "longer" and "longest" (`docs/lesson-20/`);
- every rule of *where* to begin again after a stop, beyond the signs;
- any reading other than Hafs;
- memorising, and the meanings (no translations on these pages, as on every reading page since 2026-09-27).
