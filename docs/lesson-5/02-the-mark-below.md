# 02 — The mark below, and what it breaks

## 1. The data already exists

`marks.js` was written for all three lessons on 2026-09-20. The row is there and is correct:

```js
kasra: { id: 'kasra', cp: 0x0650, names: { fatha: 'kasra', zabar: 'zair' }, sits: 'below', lesson: 5, audio: 'kasra' },
```

**Nothing needs adding to `MARKS`.** U+0650 is the same codepoint in both scripts, exactly as U+064E is
(`docs/lesson-4/02` §3), so Lesson 5 needs no per-script data either. Compose it — `String.fromCharCode(mark.cp)`,
never a pasted combining mark. That rule is not softer here; a pasted U+0650 is just as invisible as a pasted
U+064E, and now there are two of them in the same file to confuse.

## 2. `sits` is declared and consumed by nothing

`sits: 'below'` is in the table and **no code reads it.** Lesson 4 got away with that because "above" was the only
value and the page's wording carries it (`data-mark-sits="{Mark} sits above the letter."`). Lesson 5 is where it
has to do work, in two places:

1. **`mark-lesson.js` sets `root.dataset.sits = mark.sits`** on first paint, beside `data-group` and `data-band`.
   One line. It is the hook the stylesheet needs, and it costs nothing on Lesson 4.
2. **`qaida.css` gives the tile room at the bottom under `[data-sits="below"]`.** Today's `.mark-tile` padding was
   measured against a mark above a letter. Below, the mark lands in the same strip as the descenders, so the tile
   needs the room Lesson 4 gave the top *and* the room it already needed at the bottom.

**Do not flip the padding**, and do not assume a below mark frees up the space above. Several of these letters are
tall (ا ل ك ط) and the tile still has to hold them.

## 3. Part 1's six letters are wrong for this mark

`marks.js` has one `GROUP_ONE`, shared:

```js
const GROUP_ONE = ['ب', 'د', 'ر', 'س', 'م', 'ل'];
```

Its comment says why those six: *"ones whose shape stays out of the mark's way: no dots above, no tall stroke
beside the top, nothing that crowds."* Every word of that is about a mark **above**. Below the line, three of the
six are the worst letters on the page:

| Letter | With a mark below |
|---|---|
| **ب** | carries **a dot below**. The kasra lands under, beside or on top of the dot — the one letter in part 1 where a student cannot tell the mark from the letter |
| **ر** | the tail sweeps below the line, straight through where the mark goes |
| **م** | the tail hangs below the line, same problem |
| **س** | the bowl dips below the line; tighter than it looks at small sizes |
| د ل | fine |

So **`GROUP_ONE` becomes per-mark.** The smallest honest change:

```js
// Part 1's letters are chosen for THIS mark: ones whose shape stays out of its way. Above and below are not the
// same six (docs/lesson-5/02 §3).
first: ['ب', 'د', 'ر', 'س', 'م', 'ل'],   // in the fatha row
first: ['ا', 'د', 'ت', 'ط', 'ك', 'ه'],   // in the kasra row
```

with `GROUPS`, `inGroup`, `groupOf` and `sizes` reading `mark.first` instead of the module-level constant. They all
take `mark` already or are called from somewhere that has it; `inGroup(key, group)` and `groupOf(key)` are the two
signatures that change, and `tools/qaida-check.js` calls them.

**Why those six for kasra:** none of them carries a dot below, none of them hangs below the line, and between them
they cover four shape families, a tall stroke (ا ل ك ط — ط is in), a letter with dots *above* (ت, which shows the
student that dots above have nothing to do with this mark), and **د, which is in Lesson 4's six as well** — so the
student meets at least one letter whose zabar they already drilled, and the pair دَ / دِ is available on the board
from the first minute. That overlap is deliberate; `06-open-questions.md` §1 asks whether the teacher wants more
of it.

**Part 2 is all 29, unchanged.** The hard letters are not removed from the lesson; they are removed from the first
two minutes of it.

## 4. The letters to watch, below

This replaces `docs/lesson-4/02` §4's table. Every row is a **look at it in a browser** item, not a code item, and
they are on the checklist in `05-files-and-steps.md`.

| Letter | What to watch with U+0650 |
|---|---|
| **ب** | the mark against **the dot below**. The single most likely rendering fault in this lesson |
| **ي** | **two dots below**, and a bowl below the line. Worse than ب |
| **ج** | **a dot below**, inside a bowl that is itself below the line. Worst of the three |
| **ر ز و م ن ق ص ض ش س ل** | tails and bowls that cross the mark's space. Does the mark sit under the letter, or inside its bowl? |
| **ع غ ح خ** | hang below the line already (the fault step 1 and step 3 both hit). The tile needs room at both ends |
| **ا** | اِ. A bare vertical stroke with a mark beside its foot — does it read as attached, or as a speck on the floor? |
| **ء** | ءِ. Hamzah sits above the line; its mark below has nothing to hang from. `docs/lesson-4/09` §4 is still open |
| **ط ظ** | tall stroke above, mark below, and a flat body between. Should be the cleanest pair on the page — if these look wrong, the CSS is wrong, not the font |
| **ه / ۀ** | the Indo-Pak ہ is a different shape; check the mark sits under the body |
| **ك / ک** | the Indo-Pak ک has a longer upstroke; the mark below is unaffected, but the tile's height is not |

## 5. Two hardcoded ب's in the built code

Both are Lesson 4 choices that were fine for a mark above and are wrong for this one. Both take `mark`, so the fix
is a field, not a branch:

| Where | Today | For kasra |
|---|---|---|
| `mark-lesson.js:930` | `titleMark.textContent = marks.glyphOf('ب', mark)` — the lesson's subject in one glyph, in the top bar | **بِ puts the mark under the dot** in the one glyph that is meant to show what the lesson is. Use `mark.sample` — `'ب'` for fatha, `'د'` for kasra |
| `marks.js` `sampleOf` | `const key = group === 1 ? 'ب' : 'ع'` — the rail's glyph per part | ب is not in kasra's part 1 at all, so the rail would show a letter the part does not contain. Use `mark.first[0]` for part 1 and keep a fixed hard letter for part 2 (`'ع'` is fine — it is in both) |

`data-titlemark="ba"` in `lesson-4.html` is a *layout* attribute (which face and size the top-bar glyph uses), not
the glyph itself. `lesson-5.html` keeps it as `"bi"` for the same reason Lesson 4 used `"ba"` — it is a slug, and
`05-wording.md`'s field list in `docs/lesson-4/` explains the pattern.

## 6. The Indo-Pak face, again

Noto Naskh Arabic is still a stand-in; a licensed Indo-Pak face is a launch blocker (`QAIDA-CONTENT.md`). This
matters **more** in Lesson 5 than it did in Lesson 4: a printed Indo-Pak Qaida draws zair as a slanted stroke set
well under the letter, and a Naskh face sets it closer and flatter. So a student on `data-script="indopak"` will
see something that is not what their own Qaida shows — and in this lesson the mark's *place* is the subject.

That is a font problem, already on the record, and it is not Lesson 5's to fix. It is worth one honest line to the
teacher when they preview, which is why it is also in `06-open-questions.md` §4.
