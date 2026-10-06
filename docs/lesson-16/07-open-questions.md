---
tags: [lesson-16, hamza, spec]
---
# 07 — Open questions

**Part of** [[docs/lesson-16/README|Lesson 16]] · previous [[docs/lesson-16/06-files-and-steps|06]] · next [[docs/lesson-16/08-build-record|08]] · [[MAP]]

**The first is the user's.** The rest are the teacher's, and every one has a recommendation that the build takes.

## 1. Build Lesson 16 from this plan? *(the user's)*

The plan is a **new page type**: two new files (`rules.js`, `rule-lesson.js`) and a page, and it copies about 500 lines of
`mark-lesson.js` rather than touching it (`03` §1). **Recommended: yes**, taken as `README` §"decisions". The build then runs
`06` §2 and stops at the user's browser checklist (`06` §4), as every lesson has.

**What to know before saying yes:** this is the largest single build since `mark-lesson.js` (Lesson 4). It is the first lesson
that cannot be finished by editing one row and one page. If the wish is a smaller step first, the alternative is a Lesson 16
built as a **mark lesson** (`marks.js` row, `mark-lesson.js`, no new page type): hamza on each of the four seats as four
"marks". That is much smaller, and it works for lessons 15–16 only. It cannot carry Lesson 17's two end forms or Lesson 18's
Qur'an words (`docs/pass-2/02` §1 says why), so the rule page would have to be built at Lesson 17 instead, with less to
learn from. **Not recommended.**

## 2. The names *(the teacher)*

"Hamza with zabar" (recommended) or "Hamza on an alif, with zabar" (`README` §1, `04` §5). The seat is what the student
must learn to ignore, so it is not in the names. Text fields either way.

## 3. The Indo-Pak yaa seat *(the teacher)*

ئ (U+0626, recommended) or the dotless seat with the hamza below it (U+066E U+0655, Quran.com's Indo-Pak text in some words)
(`02` §5). **Hold your own printed Indo-Pak Qaida next to the screen.** If it prints the dotless seat, that is a `forms`
entry on the yaa seat, a one-line change.

## 4. The two-zabar hamza on the line *(the teacher)*

ءً is in the fifteen (part 2), as the one-file plan had it. The alternative is to leave every tanween on a hamza to Lesson 7's
tanween (they are the same marks) and drop the row: the fifteen become **fourteen** and part 2 has three forms. The reading
page has شَيْءٌ (two paish) and جَزَاءً either way. **Recommended: keep it.** A student meets ءً in real words often.

## 5. The jazam's lead *(the teacher)*

Baa with zabar (recommended, `02` §4) or Lesson 14's alif with zabar. The alif gives two alifs in a row for the alif seat
(اَأْ), which reads as "aa". Baa is drawn by every lesson already. It is a code-point list on each form, so changing it is one
line.

## 6. The Indo-Pak line and the across-scripts tile *(decided by recommendation)*

The Indo-Pak line is said (recommended, `04` §3). The across-scripts same-sound tile (ءَا against اٰ) is not built
(`01` §5). Say so if either should change.

## 7. The words *(the teacher)*

The three walkthrough words and the twelve on the reading page are all Claude's candidates (`05`). **Each needs the teacher's
check.** The words check proves each is built from the fifteen forms and the marks the student has met; it cannot prove it is
a word.

## 8. The recording *(the teacher)*

**One new recording:** the closed "a'" (`03` §7). Hamza with zabar, zair and paish reuse Lessons 4–6's alif recordings, and
the two-zabar one reuses Lesson 7's. If those are not the sound the teacher wants for a hamza (a hamza is a harder catch
than an alif's opening), they can be re-recorded under `hamza-jazam`'s companions later; nothing in the code changes.
