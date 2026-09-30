# Lesson 18 — Al-: the moon letters and the sun letters: lesson plan

*One-file plan, written 2026-09-28. It becomes a full folder before it is built. Read `docs/pass-2/` first. The script
facts are `docs/pass-2/01` §4, checked against Quran.com.*

| | |
|---|---|
| **Page** | the rule lesson, **with the Qur'an's own words for the first time** |
| **Depends on** | Lesson 17 built; `tools/fetch-qaida-words.js` (new, `docs/pass-2/02` §3), run by the user |
| **Recordings** | about a dozen words, each read on its own |

## What it teaches

**"Al-" (ال) at the start of a noun means "the".** Its laam is read, or not, depending on the letter after it:

- **before a "moon" letter, the laam is read**, with a jazam: الْقَمَرُ "al-qamaru", الْحَمْدُ "al-hamdu";
- **before a "sun" letter, the laam is not read**, and the letter after it is doubled (a shadda): الشَّمْسُ
  "ash-shamsu", الرَّحْمٰنِ "ar-rahmaani".

**The student can see which it is**, with no list to learn: a jazam on the laam means moon, and a bare laam with a
shadda after it means sun. The two scripts print this the same way (checked). The fourteen sun letters
(ت ث د ذ ر ز س ش ص ض ط ظ ل ن) are shown once, for the teacher who wants them learnt. The page needs only the marks.

**The name Allah** (اللّٰه, ٱللَّه) is "al-" before a laam, and laam is a sun letter, so the laam doubles: "Allaah". It is
the last example of the lesson, and the word the student will read most. Its laam is *heavy or light* depending on the
word before, which is Lesson 27. This lesson says only "you'll learn how to say it fully in a later lesson".

**At the start of a reading, the alif of "al-" is said "a".** In the middle of a verse it is skipped, and that is the
next lesson. Madani prints this alif with a small mark on it (ٱ) everywhere. Indo-Pak prints it bare, with its zabar
only at a verse's start (اَلْحَمْدُ). The board says in one line: "The small mark on this alif is the next lesson.
At the start, say it *a*."

## The two scripts

The same for moon and sun (a jazam on the laam, or a bare laam and a shadda). They differ on the alif (ٱ against a
bare or zabar'd ا) and on how Allah is marked: Madani ٱللَّهِ (shadda and zabar), Indo-Pak اللّٰهِ (shadda and khari
zabar). **Avoid the basmala's Allah as an example in Indo-Pak**: Quran.com's Indo-Pak text writes it bare there, for
its font to draw whole (`docs/pass-2/01` §4). Use 1:2's لِلّٰهِ, or a verse's own اللّٰهَ.

## What is drilled

| Part | Examples | Question |
|---|---|---|
| 1 | moon: the laam read | name it: "the laam is read" |
| 2 | sun: the laam not read, the next letter doubled | "the laam is not read" |
| 3 | both, mixed, and Allah | **which way is it read?** |

The choices are the two plain answers, so the question is a fair two-way one, and it tests exactly what the page
teaches: jazam on the laam, or shadda after it. **"Tap the laam that isn't read"** is added when Lesson 21 builds that
question (`docs/pass-2/02` §2).

## What is new in the code

- **The Qur'an's own words** (`docs/pass-2/02` §3). `tools/fetch-qaida-words.js` copies each example from Quran.com's
  word-by-word API in both scripts into `site/qaida/rule-words.json`, and `rules.js` names each example **by reference
  only** (`"1:1:3"`). **`tools/qaida-rule-words-check.js`** proves every reference exists in both scripts and that no
  Arabic is typed into `rules.js`.
- **The lit part of a word**: an example says which letters the rule is about (the laam, and the letter after it), by
  position. It uses `Intl.Segmenter` to split the word into letters with their marks, never a hand count of code
  points. The board lights them, as the halo lights a mark.
- **The Indo-Pak font** (`docs/pass-2/01` §9): until it is in, the Indo-Pak side of every copied word draws in the
  stand-in and looks Arabic-style. Build and check in Madani first. **This lesson can ship in Madani before
  Indo-Pak**, which is a decision for the user (`docs/pass-2/03` §3).

## Examples (all from the Qur'an, by reference; candidates)

- **Moon:** الْحَمْدُ (1:2), الْعٰلَمِيْنَ (1:2), الْمُسْتَقِيْمَ (1:6), الْكِتٰبُ (2:2), الْقَمَرُ (54:1), الْفَلَقِ (113:1).
- **Sun:** الرَّحْمٰنِ (1:1), الدِّيْنِ (1:4), الصِّرَاطَ (1:6), الشَّمْسُ (75:9), النَّاسِ (114:1), الصَّمَدُ (112:2).

Each is a word standing on its own in its verse. وَالشَّمْسِ (91:1) and وَالْقَمَرِ (91:2) carry a wow joined to the front,
which is Lesson 19's.
- **Allah:** اللّٰهُ (112:1), لِلّٰهِ (1:2).

**Each example must use only what has been taught by Lesson 18.** Words with a wavy line (الضَّآلِّيْنَ) or a silent
letter wait for their lessons. The full plan's check enforces that with a per-example list of what it contains.

## What is out

The alif skipped mid-verse (Lesson 19); the heavy laam of Allah (Lesson 27); words where the article's laam and the
word's own laam are written as **one** laam with a shadda (ٱلَّيْلِ "the night", ٱلَّذِينَ "those who"). They are
common, but the missing laam is a spelling surprise. Check their exact text when fetched, and teach them as a line in
part 2 or leave them to Lesson 21.

## Open questions

1. **Teach the fourteen sun letters as a list**, or only the marks? **Recommended: the marks**, with the list shown
   once. The printed page already tells the reader, and this is the first rule a student can read straight off the
   page.
2. **"Moon" and "sun"**: the traditional names (from الْقَمَر and الشَّمْس), and plain enough. Keep them?
3. **Ship in Madani first** if the Indo-Pak font is not ready (`docs/pass-2/03` §3)?
