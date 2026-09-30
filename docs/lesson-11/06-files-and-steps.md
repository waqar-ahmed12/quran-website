# 06 — Files, build order, and the checklist

## 1. Every file this lesson touches

| File | New? | What changes |
|---|---|---|
| `site/qaida/marks.js` | edit | the fourth statement and the `'damma-waw'` row (`03` §1) |
| `site/qaida/shell.js` | edit | Lesson 11's row: `href`, `built`, `progress`, `cp`, `tail`, and the fatha title |
| `site/qaida/mark-lesson.js` | edit | the per-script template on `.jazam-note` (`03` §4): one line |
| `site/qaida/audio.js` | edit, **recommended** | `markForKind` prefers the row whose id is the kind (`03` §6) |
| `site/qaida/qaida.css` | edit, **maybe** | only if the five-tile feature row overflows (`04` §7) |
| `site/qaida/lesson-11.html` | **new** | `lesson-10.html` with `04` applied |
| `site/qaida/lesson-10.html` | edit | its jazam line's literal "zabar" becomes `{other}` (`04` §3) |
| `site/qaida/spell.js`, `exercise.js` | edit | a `'damma-waw'` entry each (`05`) |
| `site/qaida/exercise-11.html` | **new** | `exercise-10.html` with `04` §6 applied |
| `tools/qaida-check.js` | edit | a Lesson 11 block (§3) |
| `tools/qaida-lesson11-check.js` | **new** | `qaida-lesson10-check.js`'s harness, pointed at `lesson-11.html` |
| `QAIDA-BUILD.md`, `QAIDA-CONTENT.md` | edit | status, and a "Step 9 built — Lesson 11" entry |

**Unchanged:** `practice.js`, `trace.js`, `voice.js`, `voice-store.js`, `qaida-options.js`, `home.js`, `index.html`,
`audio/manifest.json` (the group already exists), `lesson-9.html`, `exercise-10.html`.

## 2. Build order

0. **Lesson 10's jazam line** (`04` §3): "zabar" becomes `{other}`. One attribute. `qaida-lesson10-check.js` must
   still pass.
1. ~~**Check the two scripts' spelling** (`02` §2).~~ **Done 2026-09-28: confirmed**, and the result is in `02` §2.
   Indo-Pak marks the wow, Madani leaves it bare, so the `forms` entry stays.
2. **The fence**, in `qaida-check.js`, before the row exists: snapshot every glyph of lessons 4–10 in both scripts
   and `masteredCount` for 4, 6, 8, 10. They must not move.
3. **`marks.js`**: the fourth statement and the row. Run `qaida-check.js`.
4. **`mark-lesson.js`**: the per-script template. Run `qaida-lesson10-check.js`, which must be unchanged.
5. **`shell.js`**: the row and the fatha title. Run every check, because every page reads this file.
6. **`lesson-11.html`**: copy it, apply `04`, and search for `au`/`zabar`/`10`/`lesson-10`.
7. **Measure the feature row** (`04` §7) in the browser pane. Touch `qaida.css` only if it overflows.
8. **`audio.js`** (recommended): then open `recordings.html`. There should be **no new rows**, and the `damma-waw`
   group should show بُو.
9. **Words**: `spell.js`, `exercise.js`, `exercise-11.html`, then `qaida-words-check.js`.
10. `qaida-lesson11-check.js`, a look in the browser pane, then hand it to the user.

## 3. The checks

Every `node --check` on the edited scripts, then:

```
node tools/qaida-check.js
node tools/qaida-marks-check.js
node tools/qaida-lesson5-check.js
node tools/qaida-lesson6-check.js
node tools/qaida-lesson7-check.js
node tools/qaida-lesson8-check.js
node tools/qaida-lesson9-check.js
node tools/qaida-lesson10-check.js
node tools/qaida-lesson11-check.js
node tools/qaida-words-check.js
node tools/qaida-lesson3-check.js
node tools/qaida-voice-check.js
node tools/qaida-page-check.js
```

**The Lesson 11 block in `qaida-check.js`:**
- the row: `cp`, a two-code-point `tail`, `lesson: 11`, `against` in taught order, `same: 'inverted-damma'`,
  `audio: 'damma-waw'`; 27 items, none for ا or ء;
- every id is four characters, ending U+064F U+0648 U+0652, **in both scripts**;
- `drawnOf(row, 'madani')` is U+064F U+0648 (no jazam) and `drawnOf(row, 'indopak')` equals `suffixOf(row)`;
- `sizes()` is `[6, 27]`;
- a letter's distinct ids across lessons 4–11 (**thirteen** for ب, one more than Lesson 10 counted);
- `masteredCount(6)`, `(10)` and `(11)` each count only their own, with one mastered item of each on one letter;
- **300 questions through the real engine:** every question offers its twin (بُ or بَوْ, by the alternation),
  **never an ulta paish item** (no id ending U+0657), and never a Lesson 12 item;
- mastery survives a script switch;
- `audio.js`: the `damma-waw` group appears once, with 27 rows, and (if §2.8 was done) its display is بُو;
- no literal combining mark in `marks.js`, `lesson-11.html`, `spell.js`, `exercise.js`, `exercise-11.html`.

**`qaida-lesson11-check.js`** (the real page in a hand-made DOM): the quartet and its arrow; the same-sound tile on
part 1's feature row only, never among the answers, with no halo; the jazam note showing the **Madani line in Madani
and the Indo-Pak line in Indo-Pak**, swapping on a switch of script without moving the bar; `{jazam}` and `{other}`
filled in both name sets; the joined block's two examples and no lam-alif example; the skip note in part 2; 250
questions with the twin check at page level; finishing gated by part 2 at seven tenths of 27; the Spell block
stepping نُورٌ in two steps (never splitting نُ from و); Previous to Lesson 10; no "29" on the page.

## 4. The browser checklist (the user's)

1. **Indo-Pak: بَوْ against بُوْ**, on the board and in a question. Can you tell zabar from paish at the tile's size?
   This is Lesson 6's question again, and this lesson depends on it.
2. **Madani: بُو** has a bare wow. It reads as long, and nothing looks missing next to Lesson 10's بَوْ.
3. **The feature row**: five tiles fit on a phone and on a wide screen, default and Large.
4. **The same-sound tile**: بٗ (Madani بُۥ), with an `=` sign, no halo, never an answer.
5. **The halo** rings the wow (and its jazam, in Indo-Pak), not the paish and not the whole item.
6. **دُو** and the other four: the wow stands apart and looks it.
7. **The per-script line** changes when you switch script, and reads right in both name sets.
8. The walkthrough: نُورٌ lights نُو as one step, then the whole word. The reading page: twelve words, nothing
   clipped, the table full.
