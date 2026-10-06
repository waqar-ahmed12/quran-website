---
tags: [lesson-16, hamza, spec]
---
# 04 — `lesson-16.html`, section by section, and every line of wording

**Part of** [[docs/lesson-16/README|Lesson 16]] · previous [[docs/lesson-16/03-the-rule-page|03]] · next [[docs/lesson-16/05-words|05]] · [[MAP]]

`lesson-16.html` is `lesson-15.html` with the mark-only sections taken out and the grid board put in. Everything the user
has asked for since Lesson 4 carries over: **nothing locked; never harsh; no numbers on the page; a text field for every
line** (`data-words` / `data-words-attr`, so `qaida-options.js` lists it); "Write it" and "Say it" on every item; the
progress bar; a recommendation, never a gate. **Every line below is Claude's candidate, and a text field.** The Arabic on
the page is composed by `rules.js`; none is typed into the HTML (`docs/lesson-4/02` §1).

`<html>` attributes: `data-rule="hamza"`, `data-tiles`, `data-size`, `data-group`, `data-band`, `data-review="0"`,
`data-choices="4"`, `data-advance="auto"`, `data-miss="trace"`, `data-point="none"`, `data-progress="title"`,
`data-bar="line"`, `data-track="show"`, `data-finish="settle"`, `data-bg`, `data-madani-font`, `data-indopak-font`. The
mark lesson's `data-distractors`, `data-twins`, `data-board`, `data-arrows` and `data-ask` are **not** on this page.

## 1. The head

- **Title (h1):** "Hamza" (both name sets: the word has no zabar/fatha form). `<title>`: "Lesson 16: Hamza · Free Qaida".
- **Eyebrow:** "Lesson 16 of 29", with the 29-dash track, the sixteenth in gold.
- **Lede:** "One sound, written on four seats. Read the sound; never read the seat."
- **Title glyph:** the lesson's subject in one glyph, the alif seat with zabar (أَ / اَ), composed by `rules.js`.
- **The setup line** (script, names, grouping, Change): as every page. **The Indo-Pak student sees the same words**; the names
  choice matters only for "zabar/fatha" in the drill.

## 2. The rail: four parts

| # | Name | Sample glyph |
|---|---|---|
| 1 | "On an alif" | أَ (Madani) / اَ (Indo-Pak) |
| 2 | "On the line" | ءَ |
| 3 | "On a wow and a yaa" | ؤَ |
| 4 | "All the forms" | ئِ |

`data-group-done`, `-now`, `-later`, `-label`, `-early` ("This part comes later. You can carry on if you like — each one
builds on the one before."), `-announce`: as Lesson 15's, unchanged in wording.

## 3. The board (step 1)

- **Step label / heading / guide:** "Step 1" · "Look at the seats" · "A hamza can sit on four things. Tap any to hear it."
- **The seat strip** (four tiles, each a seat with the hamza on it, zabar): captions "an alif", "the line", "a wow", "a yaa".
  The line under it: **"The seat only holds the hamza up. It is never read."** (`data-seat-line`)
- **The grid** (`03` §4), row captions **"with {mark}"** (the student's own word) and, in a small second line, the sound:
  "a", "i", "u", "an", "a'" (`data-sound-zabar`… each a field). Column heads: "alif", "the line", "wow", "yaa".
- **The same-sound line**, below the grid, for the row in use (`data-same-line`): **"All of these say “{sound}”. Only the
  hamza is read."** A jazam row: **"All of these say “a'”: a catch in the throat, after a vowel."**
- **Madani line** (`data-script-madani`): **"At the start of a word, a hamza sits on an alif and is drawn أ, or إ under it
  when it has a zair."**
- **Indo-Pak line** (`data-script-indopak`), the decision in the README: **"An alif with a vowel on it is a hamza. You
  have been reading it since the start."** Shown in the Indo-Pak script only; the Madani student never sees it. The
  student's script comes from the shell, as Lesson 11's jazam line does.
- **The lead line** (parts 3 and 4, with the jazam row): **"A jazam has nothing to be read after, so these come after a baa
  with {lead}."**
- **The hint / Practise button:** as Lesson 15's ("You can move on to the other parts whenever you like, but do the
  exercise first: it is what makes it stay." · "Practise this group").

## 4. The drill (step 2)

- **Step label / heading / guide:** "Step 2" · "Now practise" · "This is an exercise. There is no timer, and nothing here is marked."
- **The question (`data-glyph`):** **"What is on this one?"** (glyph → name). Not "which letter", because the answer is not a letter.
- **By ear (`data-sound`):** **"Which one says this?"** → pick a name.
- **Verdict, right:** **"Yes — hamza with {mark}."** A jazam form: **"Yes — hamza with a jazam."** ({mark} is the student's
  word: "zabar" or "fatha".) **Built as "Yes — {name}."** (`data-right`): the form's own name, "Hamza with paish" or "Hamza with a
  jazam", so there is no second wording for the jazam ([[docs/lesson-16/08-build-record|08]] §1).
- **Verdict, wrong:** **"That one is {chosen}. This is hamza with {mark}. The seat is not read."** — the last sentence is the
  lesson, said once and with no scolding. `data-wrong`. **Built as "That one is {chosen}. This is {name}. The seat is not
  read."**, so "Hamza with zair" and "Hamza with paish" are spelt alike in one sentence.
- **Under a wrong answer** (built, `.seat-echo`, `data-line`): **"The same sound on every seat:"** and the row's forms drawn small.
- **The after strip:** the form, its name, Hear it, Say it, **Write it** (opens the writing board on the whole form, with the
  lead for a jazam form), Next.
- **Advice:** `data-struggling` "{name} keeps slipping. Look at it again at the top of the page." · `data-ready-group`
  "You seem to know this part. The next one is ready when you are." · `data-ready-lesson` "You seem to know a hamza on every seat."
- **Names of forms** (`data-name-form`): **"Hamza with {mark}"**, for every form. (`data-name-jazam`: "Hamza with a jazam", because the
  student's own word for the jazam is `{jazam}`.) One template, so a name is edited once and every name follows.
- **Sound line** (`data-none` / `data-some`): "Hearing practice opens when the recordings arrive." · "Hearing practice is open
  for the forms that are recorded."

## 5. The names

The recommended short names are used everywhere: **"Hamza with zabar"**, never "Hamza on an alif with zabar" (`README` §1). The
seat is a caption on the board only, and a caption is what the student learns to look past. **If the teacher wants the seat
named in the answers, that makes a different lesson**: the choices would come out as forms, and the question would ask the
student to read the seat, which is what this lesson exists to stop.

## 6. Spell (step 3) and the end

- **Step 3:** "Spell a word" · "Put letters together, one at a time, to read a real word." The walkthrough is `05` §1.
  The hamza's own step line: **"{name} with {mark}: {sound}."** with `{name}` "hamza".
- **The more-words link:** "Twelve more, each with a hamza — no translations, just reading." → `exercise-16.html`.
- **End line:** before: "Work through all four parts to finish the lesson." · finished: "You can read a hamza on any seat, and you do not
  read the seat. This lesson is marked as done. You can keep practising as long as you like."
- **Previous:** "Previous: Tashdeed" / "Previous: Shadda" (by the student's names), a plain link to `lesson-15.html`.
  **Next:** "Next: The round taa and the end yaa", the note "The next lesson isn't built yet." until Lesson 17 is.
