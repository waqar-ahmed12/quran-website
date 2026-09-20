# 10 — Open questions, and what was answered

Each of these is a **teaching** decision, not a coding one, so it belongs to the teacher. Every one has a control or a
text field in the options panel, so the answer is "look at it and pick", never "describe what you want in words".

**Ask them in plain words.** On 2026-09-19 three of the eight went unanswered because they were written in the
build's own terms ("choices per question", "Trace it", "screen readers"). Say what a thing *is* and show an example
before asking about it.

## Answered by the user, 2026-09-19

| Question | Answer | Where it lives |
|---|---|---|
| The look-alike table (which letters are offered as each other's wrong answers) | **"Okay"** — Claude's reading stands. Still one text field | `lesson-2.html` `data-groups`; Options → Words |
| How many right answers make a letter "known" | **Three in a row** | `practice.js` `target: 3`; slider 1–3 |
| When the page says "you seem ready" | **"4 fifth without mistakes, if mistake, repeat the mistake and practice all letters."** Read as: **four fifths of the letters known, and no letter that was missed still shaky**; a missed letter comes back more often, never straight away; and **every** letter stays in the mix rather than only the missed ones | `practice.js` `readyAt: 0.8`, `clean: true`; slider 60–100% |
| Answers per question | The user did not follow the term. It means **how many buttons to pick from** (a letter, and four names to choose between). Left at **four**; a button in the panel (three, four, six) so they can look | `data-choices="4"` |
| No red for a wrong answer | **"Okay"** | `04-page-and-design.md` §5 |
| "Trace it" after a miss | Asked what a trace is (writing over a faint letter, step 3). Which led to the next row | |
| **A writing board in every lesson** | **"Add a board in every lesson — we don't know when someone would need to write."** A **Board** button in the top bar of every lesson opens a blank board at any time; "Trace it" after a miss stays as a shortcut to the letter just missed. **Every later lesson copies the button and the tracer dialog from `lesson-2.html`** | `trace.js` free mode; `.open-board` |
| Screen readers | The user did not know the term (software that reads a page aloud, used by blind and low-vision people). **Claude's call:** nothing switches automatically; the "hear it, pick the letter" format is built and opens for everyone once recordings exist; revisit at step 9 | `06-accessibility.md` §6 |
| Wording | **"Don't make wordings harsh."** All of it rewritten softer; see `05-wording.md`. The user reads them once they can see them | every line has a text field |

## Still open

- **The letter names** — Ḥaa for ح, Ṣaad for ص, ʿAyn for ع. The dotted spellings may be more than a beginner wants.
  One list, one field, used by every lesson.
- **The Indo-Pak letter list** — Claude's reading of a printed Qaida (و before ه, the forms ک ہ ی, laam only).
- **The Indo-Pak face** is a stand-in and a **launch blocker**: Google Fonts has no true Indo-Pak mushaf face, so a
  licensed one (such as a KFGQPC IndoPak font) must replace Noto Naskh Arabic before launch.
- **Every recording is still missing.** The player, the manifest and the recording list exist; not one real clip is
  in. Lesson 2's hearing format stays switched off until they arrive, and needs no new recordings of its own.
- **How long the drill takes.** Three in a row across four fifths of 29 letters is **at least 72 right answers**
  (about 87 questions for someone who never slips). Both numbers are sliders; worth seeing before deciding it is right.

## Decided, don't reopen

| Question | Answer |
|---|---|
| Finishing Lesson 2 | A **recommendation**, not a gate. The user, 2026-09-19 |
| A missed letter | Comes back **more often, but never straight away**. The user, 2026-09-19 |
| A letter missed repeatedly | The page **recommends going back**. Advice, never a block. The user, 2026-09-19 |
| Mixed review in later lessons | **Every later lesson mixes in**; review items are never the gate. The user, 2026-09-19 |
| Skipping ahead | **Allowed**, with advice. Nothing is locked. The user, 2026-09-19. See `09-going-in-order.md` |
| Known | **Three right answers in a row.** The user, 2026-09-19 |
| Ready | **Four fifths known, nothing missed still shaky.** The user, 2026-09-19 (Claude's reading of the wording) |
| A writing board | **On every lesson, always.** The user, 2026-09-19 |
| Marking handwriting in the tracer | **No.** Arabic handwriting recognition isn't reliable enough to tell a student they're wrong. Step 3 |
| An AI voice, ever | **Never.** The teacher's own voice or a vetted reciter. `QAIDA-CONTENT.md` |
| The letters' names under either set of mark names | **Arabic** — Baa, not Be. The user, 2026-09-18 |
