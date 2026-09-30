# Lesson 23 — Al-Fatiha: lesson plan

*One-file plan, written 2026-09-28. It becomes a full folder before it is built. Read `docs/pass-2/` first.*

| | |
|---|---|
| **Page** | **the verse page, born here** (`verses.js`, `site/qaida/verses.json`, `docs/pass-2/02` §1) |
| **Depends on** | Lesson 22 built; **the Qur'an fonts in place** (`docs/pass-2/03` §3); the decision on whose voice (`docs/pass-2/03` §5) |
| **Recordings** | **the seven verses**, recited; and each hard word alone |

## What it is

**The first surah of the Qur'an, read whole, verse by verse.** Everything in it has been taught by now, except the
finer sound of its heavy letters (Lesson 27), which the recording carries. It is the reason the pass exists
(`docs/pass-2/README.md` §1), and it is placed here, before the tajweed lessons, so the student reads the surah they
pray with as soon as they can (`docs/pass-2/03` §6 asks whether to wait).

## The page

**Not a drill.** It is shown, never scored, like the Spell block and the reading pages since Lesson 4. What is on it:

1. **The surah, as printed**, in the student's script, from Quran.com's text, unmodified, in the Qur'an font. The verse
   end marks and their numbers are drawn as that mushaf draws them.
2. **Verse by verse**: one verse large, with Previous / Next. Play the verse. "Say it" records the student's own
   reading of the verse, for them alone, never scored (step 7's rule).
3. **Word by word**: tap a word to hear it alone, and to see **why it is read that way**, one line pointing back to the
   lesson that taught it ("the laam is not read: Lesson 18"). That is the "word notes" table below. The notes are the
   Qaida's own wording, never commentary on the meaning.
4. **The hard words spelled out**: الضَّآلِّيْنَ, the spell-through the Spell block has always done, one step per piece,
   with Qur'an text.
5. **No meanings, no translation**, as every reading page since 2026-09-27. `03` below asks whether this page is the
   exception.

## Word notes (the full plan checks each one)

| Word | Its hard part | Lesson |
|---|---|---|
| بِسْمِ | a jazam | 14 |
| اللّٰهِ | the joining alif skipped; al- before laam; its laam | 19, 18, 27 |
| الرَّحْمٰنِ / الرَّحِيْمِ | a sun letter; the standing mark / the long ee; the stop at the verse end | 18, 9, 13, 22 |
| اَلْحَمْدُ | a moon letter; starting on a joining alif | 18, 19 |
| لِلّٰهِ | the laam of Allah, light after zair | 27 |
| رَبِّ | a shadda with zair | 15 |
| الْعٰلَمِيْنَ | a moon letter; the standing mark; the long ee; the stop | 18, 9, 13, 22 |
| مٰلِكِ | the standing mark (the Madani text: zabar and a small alif) | 9 |
| يَوْمِ | zabar and wow | 10 |
| الدِّيْنِ | a sun letter; the stop | 18, 22 |
| اِيَّاكَ | hamza; a shadda | 16, 15 |
| نَعْبُدُ / نَسْتَعِيْنُ | a jazam | 14 |
| اِهْدِنَا | starting on a joining alif | 19 |
| الصِّرَاطَ | a sun letter; the heavy saad | 18, 27 |
| الْمُسْتَقِيْمَ | a moon letter; the stop | 18, 22 |
| اَنْعَمْتَ | hamza; the noon said clearly | 16, 24 |
| عَلَيْهِمْ | zabar and yaa; the meem said clearly | 12, 25 |
| الْمَغْضُوْبِ | a moon letter; the heavy letters | 18, 27 |
| الضَّآلِّيْنَ | a sun letter; the wavy line; two shaddas; the stop | 18, 20, 15, 22 |

Lessons 24, 25 and 27 are **after** this one. Their notes say "you'll meet this in a later lesson", which is the page's
honest answer and a reason to go on.

## What is new in the code

- **`tools/fetch-qaida-verses.js`**: `fetch-aayat.js`'s pattern, both `text_uthmani` and `text_indopak`, word by
  word, saved to `site/qaida/verses.json` with the surah name and each word's position. **Never edited by hand.**
- **`verses.js`**: the page. It draws the verse in the Qur'an font, the word buttons (split by the API's own words,
  not by counting), the notes, and the player.
- **The Qur'an fonts** (`docs/pass-2/03` §3). **Quran.com's Indo-Pak text uses private-use characters for its signs**
  (`docs/pass-2/01` §9), so without its matching font the Indo-Pak page shows boxes. The page does not ship in
  Indo-Pak without it.
- **A check**, `tools/qaida-verses-check.js`: every word in `verses.json` matches the API's text at fetch time (the
  fetch script writes a hash), and every word note points to a real lesson.

## What is out

Meanings and tafsir; memorisation tools; any recitation style but the one chosen.

## Open questions

1. **Before or after the tajweed lessons** (`docs/pass-2/03` §6). **Recommended: here.**
2. **Whose voice** (`docs/pass-2/03` §5).
3. **A meaning line** for Al-Fatiha, the one surah most learners want to understand? **Recommended: no**, as every
   reading page. A single line linking to a translation elsewhere is the most the Qaida should do, and it is the
   user's call.
4. **The basmala as verse 1**: in the Hafs count Al-Fatiha's basmala *is* its first verse, and Quran.com numbers it
   1:1. Show it as verse 1 (**recommended**, matching the student's mushaf).
