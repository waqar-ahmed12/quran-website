---
tags: [lesson-16, hamza, spec]
---
# 01 — What the lesson teaches

**Part of** [[docs/lesson-16/README|Lesson 16]] · next [[docs/lesson-16/02-hamza-and-the-scripts|02]] · [[MAP]]

## 1. The one idea

**Hamza (ء) is a letter, the 29th: a short catch in the throat, read with whatever vowel it carries. It is written
either on the line (ء) or on a *seat*, and the seat is never read.**

The seat is an alif (أ إ), a wow (ؤ) or a yaa with no dots (ئ). It only holds the hamza up. أَ ءَ ؤَ ئَ are all "a".

A student who has it can read a hamza on any seat with any mark, and does not read the seat as a letter: سَأَلَ is
"sa-'a-la", not "saa-la", and مُؤْمِنٌ is "mu'-mi-nun", not "moo-min".

**Why now.** Lessons 15–17 are the spellings the 29 letters left out (`docs/pass-2/README.md` §3). Every Qur'an word from
Lesson 18 on uses a hamza somewhere, and a student who reads its seat as a letter will read every one of them wrong.

## 2. The forms: 15, not "a mark on each of 27 letters"

A hamza is not "a mark on each letter", so this lesson does not fit `mark-lesson.js` (`docs/pass-2/02` §1). It is a
**fixed set of forms**, each a seat and a mark. **The seats are alif, the line, wow and yaa.** The alif seat is the same
at the start of a word and in the middle in both scripts (`02` §2), so position is not a part.

| Part | Seat | Forms | Count |
|---|---|---|---|
| 1 | alif | with zabar, zair, paish | 3 |
| 2 | the line (ء) | with zabar, zair, paish, and with two zabar (ءً) | 4 |
| 3 | wow and yaa | wow: zabar, paish, jazam · yaa: zabar, zair, jazam | 6 |
| 4 | every seat | all of the above, and a jazam on the alif and on the line | 15 |

So part 4 holds **fifteen** forms, and its two new ones are the jazam on the alif seat (أْ) and on the line (ءْ). Parts
1–3 are a warm-up in the order the student meets the seats: the one they know (alif), the plain one (the line), then the
two that hide a letter's shape (wow, yaa).

**Why the wow takes paish and the yaa zair, and not the reverse.** They do not have to: ؤِ and ئُ exist and are read the
same. But the *usual* spellings (the seat is the letter that matches the vowel: wow for paish, yaa for zair) are the
ones a student meets, and the fifteen are the ones a Qaida prints. The rest are spelling rules (`§4`).

## 3. What the student does

- **Looks** at the board: the seats, the same mark on all four ("a" on each), and the forms of the open part.
- **Names** a form in the drill: a picture, then "Hamza with zabar / zair / paish / jazam / two zabar" (`03` §3).
  **Many forms share a name** (أَ and ءَ and ؤَ and ئَ are all "hamza with zabar"), so the choices come out as the
  *marks*, one each. The question really asks "read the mark, ignore the seat", which is the lesson.
- **Writes** a form ("Write it"), **says** it ("Say it"), and **spells** three words (the walkthrough), then reads
  twelve (`exercise-16.html`).

**The reverse question (a name, pick the picture) is switched off here.** Two pictures honestly have the same name, and
the engine would mark a right one wrong. This is the first lesson where that is true (`03` §3).

## 4. What is out

- **Which seat a hamza takes** (a spelling rule: the seat follows the strongest neighbouring vowel). It is what a
  writer needs, not what a reader needs. The drill uses the usual spelling and never asks why.
- **The hamza made easy** (tas-heel) in one word of the Qur'an (`docs/pass-2/README.md` §7).
- **The hamza after a long "aa"** (سَمَآءٌ: the wavy line on the alif, then a hamza): Lesson 20. The reading page has
  ordinary spellings (سَمَاءٌ) only.
- **The joining alif** (ٱ), which *looks* like a hamza-less alif and is Lesson 19.
- **ءَا / اٰ across scripts** (`§5`).

## 5. Same sound, two spellings: not shown across scripts

Madani writes a hamza then a long "aa" as ءَا (hamza, zabar, alif) and Indo-Pak as اٰ (an alif with khari zabar). Both
are "'aa". Lesson 9's same-sound tile compared *within* a script. **Recommended: do not compare across scripts.** A
student reads one mushaf, and a tile that shows the other script's spelling is a tile the student has no use for. The
board can say nothing about it at all; Lesson 20 (the wavy line) is where "hamza then aa" is met, and it is met in the
student's own script.

## 6. The forms and their sounds

The sound of every form is one of five: **'a, 'i, 'u, 'an (two zabar), and a closed "'"**. The first three are the sounds
Lessons 4–6 recorded on alif ("a, i, u"), so **`audio` reuses them** (`03` §7). New recordings: **one** for the closed
"'" (`a'` after a vowel), because the seat is never read and so every jazam form is the same sound.
