# 07 — Open questions

Nine questions. **§1 needs the user's answer before anything is built**, because it decides the code. The rest have
recommendations and can be answered by the teacher during or after the build, the way lessons 4–13's were.

## 0. When to build it

After lessons 11–13 are built, and with the user's sign-off on §1. The user decided on 2026-09-20 that jazam comes
last, and `docs/step-9/README.md` §2 says "full plan first, sign-off, then build".

## 1. The shape of an item — **needs the user's answer**

| | What the student drills | Parts | Ids | Recordings | Code |
|---|---|---|---|---|---|
| **a. One lead, اَ** — *recommended* | اَبْ اَتْ… (the first table of a printed Qaida). اِبْ and اُبْ shown on the board, not drilled | 2: six letters, then 27 | letter + jazam (2 chars). `masteredCount` unchanged | **27** | `leadOf` and the eight draw sites (`03` §2) |
| b. Three leads, Lesson 7's shape | اَبْ in part 1, اِبْ in part 2, اُبْ in part 3, then all 27 with the lead rotating | 4 | letter + jazam + **the lead's vowel** (3 chars), or the three would share one id. `masteredCount` then needs a list of suffixes: a real change to `shell.js` | **81** | (a), plus three rows sharing one `cp`, and ids that carry a vowel they don't draw |
| c. No lead | بْ alone | 2 | unchanged | none possible: بْ has no sound | the least, but no printed Qaida does it, and it teaches that a jazam can be said alone |

**Why (a):** the lesson is the jazam, not the vowel before it (that was lessons 4–6). A printed Qaida's first jazam
table uses one lead. And (b) triples the teacher's recordings for a skill the student already has. If the teacher
wants the full three-lead table later, (a) is a step towards (b), not a detour: the lead is already a field.

## 2. The twins

**Recommended: all three vowels, alternating** (اَبَ, اَبِ or اَبُ against اَبْ, one per letter). The alternative is
zabar only, which makes the board and the drill match exactly (the trio shows only zabar), but every wrong answer is
then the same stroke in the same place.

## 3. The lead in Madani: bare alif or with hamza?

**Recommended: bare, اَ, in both scripts**, as lessons 4–6 already draw a vowelled alif. The Madani mushaf would write
أَ at the start of a word. If the teacher wants that, it is one line in the Madani form (`02` §2).

## 4. Say that اَلْ is "al"?

Part 1 holds اَلْ, the shape of the Arabic article "al-", the jazam a student will read more than any other.
**Recommended: not yet.** In a real verse the article's alif is usually silent, and its laam is silent before half the
letters (`01` §6). A line saying "this is al-" invites the student to read ٱلشَّمْسِ as "al-shams". Tajweed's pass
can say it properly.

## 5. The recordings: 27 closed syllables

**27 sounds**: "ab, at, ath… ay", each the alif's "a" and the letter closed. Two things for the teacher:
- **Would you read a closed syllable on its own?** (`docs/lesson-10/07` §8 first asked this.) If not, the by-ear
  format stays off for this lesson and nothing else changes.
- **Five of them have qalqalah** (اَقْ اَطْ اَبْ اَجْ اَدْ): read with the bounce, as a Qur'an teacher would? The
  page says nothing about it either way, and the recording should be how the teacher reads it.

## 6. The walkthrough: the jazam as its own step?

**Recommended: its own step** ("Laam with jazam: no vowel of its own — it closes the sound before it", then "qal"),
the traditional spelling order, because the jazam is this lesson's subject. The alternative folds it into the letter
before ("qal" in one step), as lessons 10 and 12 fold their wow and yaa. That is consistent, but it hides the thing
being taught.

## 7. The last Next

**Recommended: "Back to the Qaida"**, going to the Qaida home, with one line saying this is the last lesson in this
part, until step 11's finish screen exists. Would the teacher want it to point to one-to-one lessons already (the
finish screen's job, `QAIDA-BUILD.md` step 11)?

**If the second pass is adopted** (`docs/pass-2/`, planned 2026-09-28), Lesson 14 is no longer the last lesson.
Lessons 15–29 join `shell.js`'s `LESSONS`, so Lesson 14's Next becomes an ordinary one ("Next: Shadda"), and `data-last`
moves to **Lesson 29** (`docs/lesson-29/README.md`). Build `data-last` anyway: it is the same code, needed then.

## 8. The names

"Jazam" / "Sukoon", as the home has had them since step 1. The Madani student sees "sukoon" if they chose the fatha
names. Is "sukoon" the spelling the teacher uses ("sukun", "sukoon")?

## 9. Words

Fifteen candidates (`05`). The commonest jazam words (أَنْ، إِنْ، قَدْ، الْ…) are left out, for hamza, qalqalah and the
article. The teacher may want some back once tajweed has a pass of its own.
