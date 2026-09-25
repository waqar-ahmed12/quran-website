# 02 — The three doubled marks

## 1. The characters

| Mark | Code point | Sits | Sound on ب | `fatha` names | `zabar` names |
|---|---|---|---|---|---|
| ◌ً | **U+064B** ARABIC FATHATAN | **above** | بً "ban" | fathatain | **do zabar** |
| ◌ٌ | **U+064C** ARABIC DAMMATAN | **above** | بٌ "bun" | dammatain | **do paish** |
| ◌ٍ | **U+064D** ARABIC KASRATAN | **below** | بٍ "bin" | kasratain | **do zair** |

All three are combining marks, like U+064E, U+064F and U+0650. Everything `docs/lesson-4/02` says about them
applies here without a word changed, and two of its rules are worth repeating because breaking them is silent:

- **Never paste a combining mark into a source file.** It is invisible in every editor and every diff, it survives
  one careless edit and then vanishes. `marks.js` composes with `String.fromCharCode(mark.cp)`; HTML that must
  contain one writes `&#x64B;`. A check in `tools/qaida-check.js` already refuses literal U+064E and U+0650 in the
  source — **extend it to all six**, rather than copying it (`05` §3).
- **The item's id is the Madani letter plus the mark** (`shell.keyOf(glyph) + cp`), so a student who learnt ب with
  do zabar in Indo-Pak keeps the credit after switching script. Three new suffixes, so three new sets of ids, and
  `ب` + U+064B can never collide with `ب` + U+064E. A check says so (`05` §3).

**Names.** `do zabar / do zair / do paish` is what an Indo-Pak Qaida says, and `fathatain / kasratain / dammatain`
is the Arabic. Both are stand-ins until the teacher confirms them (`06` §2) — and as always, both are text fields
in the options panel, so the teacher can change them without touching code. The *lesson's own* name, **tanween**,
is the same word in both sets; `shell.js` already has `{ fatha: 'Tanween', zabar: 'Tanween' }`.

## 2. Where they sit, and why that matters to the code

Two above and one below — the same places their single counterparts occupy, which is exactly what the student
should notice. But it is the **first lesson whose marks do not all sit in the same place**, and
`mark-lesson.js` writes one value to `<html data-sits>` for the whole page:

```js
root.dataset.sits = mark.sits;                    // mark-lesson.js:25
```

```css
:root[data-sits='below'] .mark-tile { … }         /* qaida.css:2981 */
```

In the last part, one row of the board carries **ب بً بٌ بٍ** — three marked tiles, two of them above and one
below — so a rule that hangs off `:root` cannot be right for all three. `03` §7 moves it to the tile. Lessons 4, 5
and 6 come out identical, because on those pages every tile has the same value.

## 3. Which six letters each mark meets

`mark.first` is per-mark already (`docs/lesson-5/02` §3: above and below do not want the same six). The doubled
marks keep their counterparts' six, unchanged, for the reason those six were chosen — the shape stays out of the
mark's way — and because the student has already met the mark on exactly those letters one lesson ago:

| Part | Mark | Six letters | Taken from |
|---|---|---|---|
| 1 | fathatain | ب د ر س م ل | `MARKS.fatha.first` |
| 2 | kasratain | ا د ت ط ك ه | `MARKS.kasra.first` |
| 3 | dammatain | ب د ر س م ل | `MARKS.damma.first` |

`sample` (the letter that stands for the part on the rail and in the title) likewise: ب, د, ب.

**One warning, and it is a real one.** Kasratain's six include **ا** and **ك** and **ه**, chosen because nothing of
theirs dips below the line. Two strokes below take **more room** than one, so the six that were clear for U+0650
are only *probably* clear for U+064D. It is on the browser checklist (`05` §4), not assumed here.

## 4. The two shapes that are genuinely hard to tell apart

Not بً against بَ — that one is the lesson and is meant to be hard. These two are hard by accident:

1. **بٌ (dammatain) against بُ (damma).** In most Naskh faces dammatain is drawn as a damma with a **tail** or a
   second smaller damma tucked beside it, not as two obviously separate curls. At tile size that reads as *a
   slightly messier damma*. This is the single worst pair in the lesson and it is why `05` §4 item 1 asks about it
   before anything else.
2. **بٍ (kasratain) against ب with its own dot.** Two strokes below a letter that already has one dot below sits
   three ink marks in a strip that is a few pixels tall. ب ي ج ن (in its final form) are all in this position, and
   ي has **two** dots below already.

Neither is a reason to change the lesson. Both are reasons to look at it in a browser before believing it works.

## 5. What the two scripts really do differently

`QAIDA-BUILD.md` step 7 carries a warning: *"the two scripts write some of these marks differently"*. Here is what
that amounts to, and it is **less work than it sounds**:

- **It is the same three characters in both scripts.** U+064B, U+064C and U+064D are what an Indo-Pak mushaf and a
  Madani mushaf both encode. There is nothing to fork in `marks.js`, no per-script code point, and no per-script
  item id. **This is the finding**: the difference is real, and it is entirely in the **font**.
- **What differs is the drawing.** An Indo-Pak face typically **stacks** the two strokes of fathatain one above the
  other, where a Madani/Uthmani face sets them **side by side and slanted**; dammatain is commonly drawn in
  Indo-Pak as two small paish side by side, and in Uthmani as a damma with a hooked tail. Same character, two
  traditions of drawing it.
- **Which means the Qaida will not show the difference today.** The Indo-Pak script is set in **Noto Naskh Arabic**
  — a stand-in, and already a launch blocker in `QAIDA-CONTENT.md` ("a licensed one, such as a KFGQPC IndoPak
  font, must replace it before launch"). Noto Naskh draws the Madani shapes. So an Indo-Pak student on Lesson 7
  sees Madani tanween, and **nothing in this lesson can fix that** — the fix is the font, at step 13.

  Write it down rather than working around it: a per-script SVG or a hand-drawn glyph would be a second set of
  shapes to keep in step with a font that is about to be replaced.
- **The "open" tanween** — U+08F0, U+08F1, U+08F2 — exists for the orthographies that mark izhaar with an open
  form and ikhfa/idghaam with the stacked one. That is tajweed notation, out of scope for this pass, and it is
  the one part of this area a teacher may disagree about: `06` §5.

## 6. What the student hears

The recordings are of the **sound**, not the letter's name — "ban", not "Baa with do zabar" — the rule set in
`docs/lesson-4/02` §4. Three new recording groups (`fathatain`, `kasratain`, `dammatain`), and `audio.js` builds
them from `MARKS` on its own, so setting Lesson 7 `built: true` puts **87 new rows** into `recordings.html`
without an edit (`05` §1).

87 is a lot, and the teacher has said they record gradually. Nothing waits for them: an unrecorded item plays the
wordless hum, the by-ear question format stays switched off until a group has recordings, and the line under the
progress bar says how it stands. `06` §4 asks whether the teacher would rather record **letter by letter** — "Baa:
ba, bi, bu, ban, bin, bun" in one sitting — than group by group.
