# 09 — Open questions, and what was answered

Each of these is a **teaching** decision, not a coding one, so it belongs to the teacher. Every one has a control or
a text field in the options panel, so the answer is "look at it and pick", never "describe what you want in words".

**Ask them in plain words.** On 2026-09-19 three of Lesson 2's eight questions went unanswered because they were
written in the build's own terms. Say what a thing *is* and show an example before asking about it.

## The one to settle first

### 1. The lesson is too long

Lesson 2 is 29 items and needs about **72 right answers** at three-in-a-row across four fifths of the pool. That
number is already on the record as worth a look (`docs/lesson-2/10-open-questions.md`).

Lesson 3, drilling only the **new** shapes, is **68 items ≈ 163 right answers**. Drilling all four positions of
every letter is 101 items ≈ 242. Neither is a sitting; band 3 alone is 36 items ≈ 86 right answers, which is a
whole Lesson 2 hiding inside one band.

The five bands already break it into five finishable pieces, and that is most of the answer. What is left is
band 3. Three remedies, all of them one control:

| Remedy | Control | Cost |
|---|---|---|
| **Split band 3 in two** — ب ت ث ن ي س ش, then ص ض ف ق ل | a sixth band | six bands instead of the five the user confirmed |
| **Lower `target` to 2 for this lesson** | the existing "Right answers needed" slider | 68 items ≈ 109 right answers. Weaker mastery than Lesson 2's |
| **Lower `readyAt` to 0.7** | the existing "Ready at" slider | finishes a band sooner; more forms left shaky |

**Claude's recommendation: split band 3, and leave `target` at 3.** The bands are the lesson's pacing mechanism and
adding one costs nothing structurally; weakening `target` changes what "known" means, and it would then mean
something different in Lesson 3 than in Lesson 2, which the home's progress counting would quietly inherit.

**Show the teacher the numbers before asking.** `bandTotals()` exists for this (`07-options-panel.md` §2).

## The rest

### 2. Is the five-band grouping right?

Confirmed by the user on 2026-09-20 from three options, but confirmed **in words**, from a description — not by
looking at a built page. Worth re-asking once band 1 and band 4 exist side by side on screen, because band 4 is
where a beginner either copes or doesn't.

The specific thing to watch: **ك / ک sits in band 4 with ج ح خ ع غ ه م.** It changes a lot, but not as violently as
ه. It may belong in band 3, which would move one letter and rebalance both bands.

### 3. Does ط ظ's band hold up?

Band 2's whole premise is that ط and ظ barely change across the four positions. That is true of the letter body and
not quite true of the connecting strokes. If, on screen in the chosen face, the four forms look *different enough*
that a student would doubt the claim, band 2 should be folded into band 3 and the lesson goes to four bands.

This is a **look at it** question and cannot be answered from the code. It is on the browser checklist
(`08-files-and-steps.md` §4).

### 4. "Hear it → shape" is a weak question here

In Lesson 2, hearing "haa" identifies the letter. In Lesson 3 it narrows the answer to *the four shapes of haa* and
no further, so the question only works when the wrong answers are other letters. It is built, it is guarded, and it
is **off by default** (`07-options-panel.md` §4).

Worth the teacher hearing once recordings exist, then either keeping it as an occasional format or dropping it from
Lesson 3 entirely. Dropping it costs one line.

### 5. The position names

`on its own` · `start of a word` · `middle of a word` · `end of a word`. Plain, and they avoid "initial / medial /
final", which are the terms a grammar book uses and not the ones a beginner has.

But **"word"** is doing work the lesson has not earned: the student has not met a word yet, and `ببب` is explicitly
not one (`05-wording.md`). The alternative — `start`, `middle`, `end`, with no "of a word" — is shorter and honest
but vaguer. One text field either way; the teacher reads both on the page.

### 6. Carried over from Lesson 2, still open

- **The letter names** — Ḥaa, Ṣaad, ʿAyn. In this lesson every name is used four times over, so if the dotted
  spellings are too much for a beginner, Lesson 3 is where it will show.
- **The Indo-Pak letter list** — و before ه, the forms ک ہ ی. Lesson 3 is the first lesson where a wrong reading of
  a printed Indo-Pak Qaida produces a *visibly wrong shape*, not just a wrong order. The teacher should check the
  Indo-Pak column of band 5's table specifically.
- **The Indo-Pak face is a launch blocker.** Google Fonts has no true Indo-Pak mushaf face; Noto Naskh Arabic is a
  stand-in. Its positional forms are Naskh's, not an Indo-Pak Qaida's, so **this lesson is the one that is most
  wrong until a licensed face (such as KFGQPC IndoPak) replaces it.**
- **Every recording is still missing.** The player, the manifest and the recording list exist; not one real clip is
  in.

## Decided, don't reopen

| Question | Answer |
|---|---|
| The five bands, easy shapes first, table last | The user, 2026-09-20 |
| Mixed review inside the lesson | Every band keeps the others in the mix. Follows the user's 2026-09-19 rule |
| Locks between bands | **None.** Nothing in the Qaida is locked. The user, 2026-09-19 |
| Finishing the lesson | Reaching band 5 is the recommendation. Not a gate |
| Drilling the isolated form again | **No** — Lessons 1 and 2 did it. Only new shapes become items |
| ZWJ over presentation forms and tatweel | `02-the-forms.md` §1. Tatweel draws a stroke that isn't in a real word |
| What the tracer opens | The **isolated** letter, so the button says "Write it" |
| Marking handwriting | **No.** Arabic handwriting recognition isn't reliable enough. Step 3 |
| An AI voice, ever | **Never.** The teacher's own voice or a vetted reciter |
| Real Qur'anic text in this lesson | **None.** The letter joined to itself, which is what a printed Qaida shows |
