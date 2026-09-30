# Lesson 29 — The last surahs: lesson plan

*One-file plan, written 2026-09-28. It becomes a full folder before it is built. Read `docs/lesson-23/` first. This
lesson is its page with more surahs.*

| | |
|---|---|
| **Page** | the verse page (Lesson 23's) |
| **Depends on** | Lesson 28 built; the voice decision (`docs/pass-2/03` §5) |
| **Recordings** | **48 verses** (surahs 105–114), and each hard word alone |

## What it is

**The last lesson of the Qaida: reading real surahs, all ten from Al-Fil to An-Nas (105–114).** They are the ones
most learners memorise first for prayer, short enough for a sitting each, and together they use nearly every rule in
the second pass:

| Surah | Verses | Worth noticing |
|---|---|---|
| 105 Al-Fil | 5 | the meem hidden before baa (105:4, checked) |
| 106 Quraysh | 4 | |
| 107 Al-Ma'un | 7 | |
| 108 Al-Kawthar | 3 | the wavy line in the next word (اِنَّآ اَعْطَيْنٰكَ, 108:1, checked) |
| 109 Al-Kafirun | 6 | |
| 110 An-Nasr | 3 | two zabar at a stop (تَوَّابًا) |
| 111 Al-Masad | 5 | the bounce at a stop (تَبَّ) |
| 112 Al-Ikhlas | 4 | the bounce at every verse end; Allah's heavy laam |
| 113 Al-Falaq | 5 | |
| 114 An-Nas | 6 | النَّاسِ (a sun letter) ends five verses and الْخَنَّاسِ (a moon letter) the sixth: both kinds of "al-" side by side |

The surah list is a recommendation (`docs/pass-2/03` §7).

## The page

Lesson 23's verse page with a **surah picker** (ten cards, in the mushaf's order or from An-Nas back, `open question
1`). Everything else carries over: verse by verse, word by word with notes pointing to the lessons, play, "Say it", no
drill, no meanings. **Each surah is "done" when the student has read every verse once**, marked by the student ("I
read it"), never measured. It is a recommendation, never a gate, as everything in the Qaida.

## The end of the Qaida

- **The last lesson's Next** takes Lesson 14's `data-last` (`docs/lesson-14/03` §8): "Back to the Qaida".
- **The finish screen** (`QAIDA-BUILD.md` step 11) comes here: a mark for each finished lesson, and **one-to-one
  lessons** as the way on. That is where the landing page's offer and the free Qaida meet. The things left out of the
  Qaida (`docs/pass-2/README.md` §7) are exactly what those lessons teach, and the finish screen can say so in one
  line.

## What is new in the code

A surah picker on the verse page; `fetch-qaida-verses.js` run for 105–114; the word notes for 48 verses. That is the
biggest piece of wording in the pass, and every note is checked against the lessons.

## Open questions

1. **The order of the ten**: from An-Nas back to Al-Fil, the order most children learn them (shortest-feeling first),
   or the mushaf's order (105 to 114)? **Recommended: from An-Nas back**, with the mushaf's number shown.
2. **More surahs later** (the rest of Juz 'Amma) as lessons 30–31, or leave the rest to one-to-one lessons?
   **Recommended: leave it.** Ten surahs read with understanding of every mark is the Qaida's end, and more is the
   teacher's.
3. **"I read it"** as the only progress on this page? **Recommended: yes.** A verse is not a drill item.
