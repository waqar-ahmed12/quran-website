# 01 — What the two scripts print (checked against Quran.com)

**Checked 2026-09-28.** A scratch `node` script fetched 22 verses from the Quran.com API (`/quran/verses/uthmani` and
`/quran/verses/indopak`) and printed every word's code points. The verses were 1:1, 1:2, 1:4, 1:5, 1:7, 2:1, 2:2, 2:5,
2:6, 2:9, 2:10, 2:27, 2:43, 7:12, 19:1, 36:1, 97:1, 103:3, 105:4, 108:1, 112:1 and 112:4. What follows is what those
texts contain, not what Claude remembers. "Madani" below is Quran.com's `text_uthmani`, and "Indo-Pak" is its
`text_indopak`.

**The one idea that explains most of this table:**

> **In Indo-Pak, a wow or yaa that is read carries a mark, and a wow or yaa with no mark is not read.** A long-vowel
> wow or yaa carries a jazam. The alif is the one exception: it never carries a jazam, so a bare alif after zabar is
> the long "aa", and an alif with no zabar before it (after a plural wow, say) is not read.
> **In Madani, a wow or yaa with no mark after its own vowel is long, and any letter that is not read carries a small
> circle (or a small rectangle, if it is read only at a stop).**

Lessons 11 and 13 already meet the first half. Lesson 21 teaches the whole, and checks this rule against more
verses than these 22. The alif of أَنَا is the known hard case: Indo-Pak prints it bare, like a long "aa".

## 1. The jazam's code point is not its shape

| | Madani | Indo-Pak |
|---|---|---|
| sukun / jazam | **U+0652** (بِسْمِ: 0633 **0652**) | **U+06E1** (بِسۡمِ: 0633 **06E1**) |

This is **the opposite of what `docs/lesson-10/02` §3 assumed** ("the Madani mushaf's text writes the sukun as
U+06E1"). Lesson 10's *drawing* choice still stands, because it was made by measuring what the site's Madani face
draws. It gives the Madani student the open head-of-khaa the mushaf prints. But it means:
- **the code point decides nothing; the font does.** A Qur'an font draws each script's jazam the way that mushaf
  prints it;
- when real verses arrive (Lesson 23), Quran.com's Madani text (U+0652) in the site's Madani face (Scheherazade New)
  would show a **small circle**, not the shape lessons 10–22 taught. The verse page needs a Qur'an font
  (`docs/lesson-23/`). **The text is never edited to fit a font** (the content rules).

## 2. Long vowels and silent letters

| | Madani | Indo-Pak | Verse |
|---|---|---|---|
| long "oo" wow | bare: ٱلْمَغْضُوبِ (0648) | **jazam**: الْمَغْضُوْبِ (0648 06E1) | 1:7 |
| long "ee" yaa | bare: ٱلرَّحِيمِ (064A) | **jazam**: الرَّحِيْمِ (064A 06E1) | 1:1 |
| long "aa" alif | bare | bare, no jazam on an alif | 1:7 |
| silent plural alif | **small circle**: ءَامَنُوا۟ (0627 **06DF**) | **no mark**: اٰمَنُوْا (0627) | 2:9 |
| silent wow | small circle: أُو۟لَـٰٓئِكَ (0648 06DF) | no mark: اُولٰٓئِكَ (0648) | 2:5 |
| read only at a stop | **small rectangle**: أَنَا۠ (0627 **06E0**) | no mark: اَنَا | 7:12 |
| the wow of the "aa" in ٱلصَّلَوٰةَ | wow + small alif (0648 0670): read "aa" | الصَّلٰوةَ: khari zabar on the laam, wow bare (silent) | 2:43 |
| a long vowel before a joining alif | no change: فِى ٱلْأَرْضِ | **the jazam goes**: فِى الْاَرْضِ (0649, no 06E1), against فِىْ قُلُوْبِهِمْ (0649 06E1) | 2:27, 2:10 |
| the same, on a wow | عَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ | عَمِلُوا الصّٰلِحٰتِ, the wow bare | 103:3 |

**Indo-Pak shows how a word is said in continuous reading.** A long vowel read short because a joining alif follows
loses its jazam. Madani leaves that to the reader.

## 3. Hamza

| | Madani | Indo-Pak | Verse |
|---|---|---|---|
| at the start of a word | **أ / إ**: أَنْعَمْتَ (0623), إِيَّاكَ (0625) | **a bare alif with the vowel**: اَنْعَمْتَ (0627 064E), اِيَّاكَ (0627 0650) | 1:7, 1:5 |
| on the line | ءَامَنُوا۟ (0621 064E 0627) | the same word is اٰمَنُوْا: an alif with khari zabar | 2:9 |
| on a wow | يُؤْمِنُونَ (0624) | يُؤْمِنُوْنَ (0624) | 2:6 |
| on a yaa | أُو۟لَـٰٓئِكَ (0626) | اُولٰٓىِٕكَ: a dotless seat with a hamza below it (066E 0655) | 2:5 |
| two hamzas | ءَأَنذَرْتَهُمْ | ءَاَنْذَرْتَهُمْ | 2:6 |

So **an Indo-Pak student has read hamza since Lesson 4**. Every alif with a vowel on it (اَ اِ اُ) is one. Lesson 14's
bare lead اَ is exactly the Indo-Pak mushaf's spelling.

## 4. Al- and the name Allah

| | Madani | Indo-Pak | Verse |
|---|---|---|---|
| moon letter | ٱلْحَمْدُ: the laam with a sukun | الْحَمْدُ: the laam with a jazam | 1:2 |
| sun letter | ٱلرَّحْمَـٰنِ: the laam bare, shadda on raa | الرَّحْمٰنِ: the same | 1:1 |
| the joining alif | **ٱ (U+0671) always**, even at a verse's start | **a bare ا**; **with its vowel at a verse's start** (اَلْحَمْدُ) | 1:1, 1:2 |
| Allah | ٱللَّهِ: shadda and zabar on the second laam (0644 0651 064E) | اللّٰهِ: shadda and khari zabar (0644 0651 0670), except the basmala, where the Indo-Pak text is bare (its font draws the word whole) | 1:2, 1:1 |

## 5. Noon and meem with jazam, and tanween

| Rule | Madani | Indo-Pak | Verse |
|---|---|---|---|
| noon said clearly | **sukun on the noon**: أَنْعَمْتَ (0646 0652), مِنْهُ | jazam | 1:7, 7:12 |
| noon merged | **noon bare**, shadda on the next letter: مِن نَّارٍ | **jazam kept**, shadda on the next letter | 7:12 |
| noon hidden | **noon bare**: مِن طِينٍ | **jazam kept**, nothing else. *Unmarked* | 7:12 |
| noon turned into meem | **small meem** (U+06E2), no sukun: مِنۢ بَعْدِ | jazam **and** small meem | 2:27 |
| tanween turned into meem | tanween + small meem: أَلِيمٌۢ بِمَا | the same | 2:10 |
| tanween merged into wow | nothing: مَرَضًا وَلَهُمْ | **shadda on the wow**: وَّلَهُمْ | 2:10, 7:12 |
| meem hidden before baa | **meem bare**: تَرْمِيهِم بِحِجَارَةٍ | jazam | 105:4 |
| meem merged into meem | meem bare, shadda on the next: قُلُوبِهِم مَّرَضٌ | jazam, shadda on the next | 2:10 |
| meem said clearly | sukun on the meem: وَلَهُمْ عَذَابٌ | jazam | 2:10 |

**Madani prints the rule; Indo-Pak prints the letters and marks only the merge and the turn.** A Madani student can
read the noon and meem rules off the page. An Indo-Pak student has to know which letters hide a noon. That is the
biggest difference between the scripts in this pass, and Lesson 24 is built around it.

Quran.com's `text_uthmani` does **not** carry the staggered tanween that the Madina mushaf prints for a merged or hidden
tanween (هُدًى لِّلْمُتَّقِينَ is plain U+064B). Lesson 24 cannot rely on it.

## 6. The wavy line (madd)

U+0653 in both (ٱلضَّآلِّينَ, 1:7). Indo-Pak also uses **U+06E4**, a small high madda (اِنَّآ 108:1, بِهٖۤ 2:27). They
are two code points for what a student sees as one sign.

## 7. Stop signs

| | Madani | Indo-Pak |
|---|---|---|
| seen in these verses | ۖ (U+06D6), ۚ (U+06DA), ۛ (U+06DB) | ۖ, ۚ, ۛ, **ؕ (U+0615, small taa: a stop)**, **ۙ (U+06D9, laa)** at many verse ends |

The Indo-Pak mushaf has **more signs**, and signs at verse ends. Each mushaf's own list of signs, printed at its end,
is the source for Lesson 22, and the teacher checks it.

## 8. The opening letters, ة and ى

| | Madani | Indo-Pak | Verse |
|---|---|---|---|
| الٓمٓ | maddah on laam and meem | maddah, **and shadda on the meem** (الٓمّٓ) | 2:1 |
| كٓهيعٓصٓ | maddah on kaaf, ayn, saad | the same, **plus khari zabar on haa and yaa** | 19:1 |
| يسٓ | يسٓ | يٰسٓ (khari zabar on yaa) | 36:1 |
| round taa | ة (U+0629) | ة (U+0629) | 97:1 |
| the end yaa | **ى (U+0649), no dots**: فِى, ٱلَّذِى | **ى (U+0649)** too | 2:27, 97:1 |
| "aa" written with ى | عَلَىٰ: zabar, ى, small alif (064E 0649 0670) | عَلٰى: khari zabar on the laam, then ى (0670 0649) | 2:5 |

**Both mushafs write a word-final yaa without dots.** That answers the question `docs/lesson-12/07` §1 left open:
the dotted ي is the *Qaida's* letter (Lesson 1), and the mushaf's end yaa is ى. Lesson 17 teaches the difference.

## 9. Quran.com's Indo-Pak text is tied to its font

- It uses **standard Arabic letters** (ه ي ك, U+0647 U+064A U+0643) where the lessons use the Indo-Pak ones
  (ہ ی ک), plus **U+06AA (a swash kaf)** in some words (الۡڪِتٰبُ, 2:2).
- It uses **private-use characters** (U+E01B, U+E01C, U+E01E, U+E021, U+E022) for verse-end and section signs. They
  have no meaning without Quran.com's own Indo-Pak font.
- It uses U+200F and U+200B (direction and spacing marks).

Shown in the site's Indo-Pak stand-in (Noto Naskh), it would **not look Indo-Pak** (Arabic-style ه and ي), and the
private-use signs would show as **boxes**. So the licensed Indo-Pak Qur'an font `QAIDA-CONTENT.md` calls a launch
blocker has to be in place **before Lesson 23**. The lessons' own letters (ک ہ ی, composed) are unaffected.

## 10. Order of marks

Quran.com writes **shadda before the vowel** (إِنَّ: 0646 0651 064E). Unicode's canonical order puts the vowel first
(fatha is class 30, shadda class 33), and the two orders draw the same. **Any comparison between a composed string and
a fetched one normalises both first** (`String.prototype.normalize('NFC')`). No such comparison exists today.
