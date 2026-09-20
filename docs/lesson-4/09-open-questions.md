# 09 — Open questions, for the teacher

Each of these is a **teaching** decision, not a coding one. Every one has a control or a text field in the options
panel where that is possible, so the answer can be "look at it and pick" rather than "describe what you want".

**Ask them in plain words.** On 2026-09-19 three of Lesson 2's eight questions went unanswered because they were
written in the build's own terms. Say what a thing *is*, and show it, before asking about it.

---

## 1. The blocking one — what does the student have to answer?

**Do not build Lesson 4 before this is answered.** It decides what the lesson is.

In Lesson 2 the page showed **ب** and the student picked **"Baa"**. In Lesson 3 the page showed **ـبـ** and the
student picked **"Baa, middle of a word"**. Both answers were the letter's *name*, in English words.

Lesson 4 shows **بَ**. There are three different things the student could be asked to pick, and they teach
different amounts:

### A — the name of the pair

> **بَ** → `Baa with zabar` · `Taa with zabar` · `Baa` · `Noon with zabar`

Buildable today, no recordings, no transliteration. It teaches the student to **see** the mark and know whose it
is. It does **not** teach them what بَ says — a student could finish this lesson and still not be able to read one
syllable aloud.

### B — the sound, written in English letters

> **بَ** → `ba` · `ta` · `bi` · `na`

This is real reading, and it is what a printed Qaida is driving at. But it is **transliteration**, which was
switched off on 2026-09-14 ("off, tap to peek"), and several letters have no honest English spelling — عَ, حَ, قَ,
صَ, ضَ, طَ, ظَ would come out as ʿa, ḥa, qa, ṣa, ḍa, ṭa, ẓa, which a beginner reads as the wrong sound. It also
risks teaching an English speaker to say "ba" as in *bat*.

### C — by ear

> 🔊 *"ba"* → **بَ** · **تَ** · **بِ** · **نَ**

The true Qaida way, the only version a blind student can use, and the only one that tests pronunciation. It needs
**29 new recordings** — the teacher saying the *sound* "ba", not the letter's name "Baa" — and there are currently
no recordings at all, of anything.

### What is recommended

**A now, C the moment the recordings exist, B never on its own.** A is honest about what it teaches and can be
built this week; C is designed and built alongside it, switched off by `available()` until the files are there,
so switching it on is one line and no rebuild. B could be added as a *peek* — tap the answer to see "ba" — the way
Lesson 1 shows a letter's name, without ever being the thing that is graded.

That is a recommendation, not a decision. **The teacher's call.**

---

## 2. One part or two?

29 letters with the mark, at three right answers in a row across four fifths of them, is **about 72 right
answers** — the same length as Lesson 2, which is already on the record as worth a look.

| Shape | Parts | Right answers to finish the first part | Total |
|---|---|---|---|
| **Two parts** (recommended) — six letters, then all 29 | 2 | **15** | ~72 |
| One part, like Lesson 2 | 1 | 72 | ~72 |
| Three parts of ten | 3 | 24 | ~72 |

The total does not change; what changes is how soon the student reaches something finished. **Two** is
recommended: the first part is a couple of minutes and is about noticing the stroke, not about telling ب from ت.
The rail already exists from Lesson 3, so the cost is close to nothing.

Lesson 3's numbers are the comparison: its parts cost 15, 6, 51, 36 and 60 right answers.

---

## 3. How many letters from before should ride along?

The user's rule (2026-09-19) is that every later lesson mixes in earlier material. In Lesson 4 that has a second
job: the **bare** letters are what make "does this one carry the mark?" a real question — without them, every
answer on the page has a mark on it.

Recommended: **8**, chosen from the letters this student got wrong in Lesson 2. It is a slider, so it can be
looked at. At 0 the contrast question disappears; at 16 the lesson starts to feel like Lesson 2 again.

---

## 4. Hamzah with the mark — ءَ or أَ?

Lesson 1 teaches hamzah as a bare **ء**. With a mark it would be **ءَ**, which is consistent with Lesson 1 but is
not how a printed Qaida usually writes it — there it normally sits on an alif, **أَ**.

- Bare **ءَ** — consistent with lessons 1–3, and the id stays `ءَ`.
- On a seat **أَ** — what a student will actually meet, but it introduces the seat idea, which the Qaida has not
  taught and which properly belongs with hamzah's own rules much later.

Recommended: **bare ءَ now**, with a note on the board, and hamzah's seats left to a later pass. This is a
**look at it** question — it is on the browser checklist (`08-files-and-steps.md` §5).

---

## 5. Should the lesson show 3–4 example words?

`QAIDA-CONTENT.md` says the teacher records "3–4 example words per exercise". Lesson 4 as specified shows **no
words** — only بَبَ, a letter beside itself, which a printed Qaida does show and which is explicitly not a word.

If real words are wanted, two rules bite: any real Qur'an text must be **exact, fetched from Tanzil or Quran.com,
never typed from memory** (there is already `fetch-aayat.js` for this), and a word with only fathas in it is a
short list. Worth deciding **with** the recordings, not before them.

---

## 6. A student using a screen reader cannot answer this lesson

Explained in full in `06-accessibility.md` §2. Both of the formats that can be built today are unanswerable by ear
— naming the prompt or the choices gives the answer away. The format that fixes it is **C above**, which needs the
recordings.

So the question is really §1 again, from a different direction: **until the recordings exist, Lesson 4 teaches
with its board and tests with its eyes only.** That is worth the teacher knowing, and worth not claiming
otherwise.

---

## 7. Carried over, still open

- **The letter names** — Ḥaa, Ṣaad, ʿAyn. Every one of them is now read as "Ṣaad with zabar", four words long.
- **The Indo-Pak face is a launch blocker.** Noto Naskh Arabic is a stand-in; where it puts a fatha is not where a
  printed Indo-Pak Qaida puts it. Lessons 4–6 are the first where the *mark's* placement is the subject, so this
  matters more here than it did.
- **Every recording is still missing** — 29 more per mark, and the ones for lessons 4–6 are a **different kind of
  recording** from Lesson 1's (`08-files-and-steps.md` §3).
- **The mark names themselves** — zabar / fatha are in `marks.js`, and the student's set decides which is shown.
  Worth the teacher confirming the spellings once, since they now appear in a page title.

---

## Decided, don't reopen

| Question | Answer |
|---|---|
| Mixed review in every later lesson | The user, 2026-09-19. The lesson's own items are the gate; review never is |
| Finishing a lesson | A recommendation, never a gate. The user, 2026-09-19 |
| Skipping ahead | Allowed, advised about once. **Nothing is locked.** The user, 2026-09-19 |
| Three right in a row = known | The user, 2026-09-19 |
| Ready at four fifths, with nothing shaky | The user, 2026-09-19 |
| The letters keep their **Arabic** names in both sets | The user, 2026-09-18 — Baa, not Be |
| The name set changes the **marks** and the lesson titles | The user, 2026-09-18 |
| A writing board in every lesson | The user, 2026-09-19 |
| Numbers on the page | **None.** The user, 2026-09-20 |
| An AI voice, ever | **Never.** The teacher's own voice or a vetted reciter |
| Jazam stays last, after leen | The user, 2026-09-20 |
| Drilling the mark on joined shapes | **No** — Lesson 3 taught the shapes; one new thing at a time (`01` decision 1) |
