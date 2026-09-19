# 10 — Open questions

Things Claude has guessed at. Each one is a **teaching** decision, not a coding one, so it belongs to the teacher.
Every one of them has a control or a text field in the options panel, so the answer is "look at it and pick",
never "describe what you want in words".

## For the teacher

1. **The confusables table.** Which letters look alike enough to be offered as each other's wrong answers.
   Claude's reading, about *shapes* rather than sounds:

   > ب ت ث ن ي · ج ح خ ع غ · د ذ ر ز و · س ش ص ض · ط ظ · ف ق ك · ل ا · م ه · ء و

   It decides how hard every question is. One text field, Options → The drill.

2. **How many right answers make a letter "known"** — Claude's default is **two in a row**. With four choices, one
   right answer is 25% guessable and two in a row is about 6%. Right for an adult; possibly two questions too many
   for a five-year-old. Slider, 1 to 3.

3. **How much of the alphabet before "you seem ready"** — Claude's default is **all of it**. Lower it and the
   student is invited on sooner, with a few letters still shaky. Slider, Options → The drill → "Ready at".

4. **Four choices per question.** Three is kinder for a young child, six is a sterner test. Buttons.

5. **No red for a wrong answer.** The palette has no failure colour, and this design adds none: gold-versus-dim is
   colourblind-safe where red-versus-green isn't, and a child studies on this page. Red is a fraction faster to
   read. Claude's call; the teacher can overrule it.

6. **Trace it is offered only after a miss** — the moment writing a letter is worth the interruption. Offering it
   on every question would slow down a student who knows them. Buttons.

7. **Screen readers.** A shape-recognition drill has no non-visual equivalent until the recordings exist
   (`06-accessibility.md` §6). Once they do: should the sound format be preferred automatically for assistive
   technology, or should the page simply say plainly that Lesson 2 is a sighted exercise and point back at
   Lesson 1, which is not?

8. **The wording of the two pieces of advice** (`05-wording.md` §2) — "keeps catching you out" and "you seem to
   know these". These are the lines a struggling beginner reads, and the tone matters more than anything else on
   the page. Both have text fields.

## Carried over from step 1, still open

- **The letter names** — Ḥaa for ح, Ṣaad for ص, ʿAyn for ع. The dotted spellings may be more than a beginner wants.
  One list, one field, used by every lesson.
- **The Indo-Pak letter list** — Claude's reading of a printed Qaida (و before ه, the forms ک ہ ی, laam only).
- **The Indo-Pak face** is a stand-in and a **launch blocker**: Google Fonts has no true Indo-Pak mushaf face, so a
  licensed one (such as a KFGQPC IndoPak font) must replace Noto Naskh Arabic before launch.
- **Every recording is still missing.** The player, the manifest and the recording list exist; not one real clip is
  in. Lesson 2's hearing format stays switched off until they arrive, and needs no new recordings of its own.

## Decided, don't reopen

| Question | Answer |
|---|---|
| Finishing Lesson 2 | A **recommendation**, not a gate. The user, 2026-09-19 |
| A missed letter | Comes back **more often, but never straight away**. The user, 2026-09-19 |
| A letter missed repeatedly | The page **recommends going back**. Advice, never a block. The user, 2026-09-19 |
| Mixed review in later lessons | **Every later lesson mixes in**; review items are never the gate. The user, 2026-09-19 |
| Skipping ahead | **Allowed**, with advice. Nothing is locked. The user, 2026-09-19. See `09-going-in-order.md` |
| Marking handwriting in the tracer | **No.** Arabic handwriting recognition isn't reliable enough to tell a student they're wrong. Step 3 |
| An AI voice, ever | **Never.** The teacher's own voice or a vetted reciter. `QAIDA-CONTENT.md` |
| The letters' names under either set of mark names | **Arabic** — Baa, not Be. The user, 2026-09-18 |
