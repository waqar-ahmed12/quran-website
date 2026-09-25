# 02 — The third mark, and what it does *not* break

## 1. The data already exists, and one word of it is wrong

`marks.js` was written for all three lessons on 2026-09-20. The row is there:

```js
damma: {
  id: 'damma', cp: 0x064F, names: { fatha: 'damma', zabar: 'paish' }, sits: 'above', lesson: 6, audio: 'damma',
  first: ['ب', 'د', 'ر', 'س', 'م', 'ل'], sample: 'ب', after: 'kasra',
},
```

Everything in it is right **except `after: 'kasra'`**, which is right about chronology and wrong about teaching.
It becomes `against: ['fatha', 'kasra']` — see `03` §1, which is where the change lives.

U+064F is the same codepoint in both scripts, exactly as U+064E and U+0650 are, so Lesson 6 needs **no per-script
data**. Compose it — `String.fromCharCode(mark.cp)`, never a pasted combining mark. There would now be three
invisible characters in one file to confuse if this rule were bent.

## 2. `sits: 'above'` means there is no CSS work

This is the cheap part of Lesson 6 and it is worth saying plainly, because Lesson 5 spent most of its risk here.

`mark-lesson.js` already sets `root.dataset.sits = mark.sits` on first paint (`shell.js`-era change, Lesson 5),
and `qaida.css` has exactly one rule keyed off it:

```css
:root[data-sits='below'] .mark-tile { … }
:root[data-sits='below'] .mark-tile .glyph { … }
```

Lesson 6 is `above`, so **both rules simply do not apply** and the tile falls back to Lesson 4's — which is the
right answer, because Lesson 4's tile was measured for a mark above a letter.

**Do not add a `[data-sits='above']` block.** If Lesson 6 looks wrong in the tile, the fault is Lesson 4's tile and
it is Lesson 4's fix, in a rule both lessons already share. The one thing paish has that fatha does not is
**height**: the curl stands taller than the stroke. If it is clipped at the top, that is `.mark-tile`'s top padding
and it is a shared edit — which means Lesson 4 goes back in the queue, so it is the user's call, not the builder's.

## 3. The six letters a student meets it on

`mark.first` is per-mark since Lesson 5. Damma's can stay **fatha's six**: **ب، د، ر، س، م، ل**.

The reasoning `marks.js` gives for those six — *"ones whose shape stays out of the mark's way: no dots above, no
tall stroke beside the top, nothing that crowds"* — was written for a mark above, and damma is a mark above. So
unlike Lesson 5, the copy is the correct answer and not a mistake waiting to happen.

It is also the answer that serves skill E best: **every one of these six is a letter the student already drilled
with zabar**, so the pair بَ / بُ — the contrast the whole lesson is about — is on the board and in the drill from
the first minute, with no letter-recognition load on top of it.

| Letter | With a mark above | |
|---|---|---|
| **ب** | clear space above; the dot is below, out of the way | the best letter on the page for this mark |
| **د** | clear; also in all three lessons' six | the one letter a student meets with every mark |
| **ر** | clear above; the tail is below and irrelevant here | fine |
| **س** | wide and flat, all the room in the world | fine |
| **م** | clear above | fine |
| **ل** | **a tall stroke**. The curl lands beside or over the ascender | the one to look at (`05` §4) |

**Part 2 is all 29, unchanged.** `06-open-questions.md` §1 asks the teacher whether to swap ل for a flatter letter;
the recommendation is to keep it, because it is in Lesson 4's six too and the two lessons should agree.

## 4. Paish is drawn like a small wow, and that is a real problem

U+064F is, in every naskh face, a miniature **و**. A beginner who has just spent five lessons learning that shapes
are letters will ask whether that is a wow sitting on top of the letter — and in Lesson 11 they will meet بُو,
where a damma *and* a wow are both on the page doing different jobs.

This is not a rendering problem, it is a teaching one, and the answer is one line on the board rather than a
feature: **`data-mark-does` should say it.** Something like *"{Mark} is a small curl above the letter. It is not a
wow, even though it looks like one."* — a text field like every other line, which the teacher can rewrite or empty
(`04` §3).

The board's own defence is the quartet: seen beside زبر's flat stroke and زیر's, the curl reads as a member of the
same family rather than as a letter. That is what the fourth column is for.

## 5. The letters to watch, above

This replaces `docs/lesson-5/02` §4's table. Every row is a **look at it in a browser** item, not a code item, and
they are on the checklist in `05-files-and-steps.md`. The list is shorter than Lesson 5's, which is the point.

| Letter | What to watch with U+064F |
|---|---|
| **ت ث ن ق ف ز ذ خ ض ظ غ ش** | **dots above.** The curl and the dots compete for the same strip. ث and ش (three dots) are the worst; ت and ق (two) next |
| **ا ل ك ط ظ** | **tall strokes.** Does the curl sit over the letter, or beside the ascender as though it belonged to the next letter? ل is in part 1, so this shows up in the first minute |
| **ه / ہ** | the Indo-Pak ہ is a different shape and sits high; check the curl is not touching it |
| **ك / ک** | the Indo-Pak ک has a longer upstroke with its own hamza-like stroke above in some faces — check the two do not collide |
| **ء** | ءُ. Hamzah is already a small mark-like shape; a curl above it makes two small shapes stacked. `docs/lesson-4/09` §4 is still open |
| **ج ح خ ع غ** | hang below the line, so the tile is already tight vertically; a taller mark above may clip. This is the one place Lesson 6 could need `.mark-tile` room (`02` §2) |
| **و** | وُ — a wow with a small wow on it. Worth one honest look: if it reads as two wows, §4's board line is earning its place |

## 6. The Indo-Pak face, and ulta paish

Noto Naskh Arabic is still a stand-in and a licensed Indo-Pak face is a launch blocker (`QAIDA-CONTENT.md`).
Two things about this lesson in particular:

1. **A printed Indo-Pak Qaida draws damma larger and rounder** than a Naskh face sets it, and sets it closer to the
   letter. In a lesson whose subject is the mark's *shape*, the stand-in is showing the student a shape that is not
   quite the one in their own book.
2. **A printed Indo-Pak Qaida also shows ulta paish (U+0657) near here** — the inverted damma, which marks the long
   "oo". A student with the book open will see it on the same page and ask. It is **Lesson 9's** (standing
   harakaat) and Lesson 6 should not teach it, but the teacher should know it will be asked; `06` §4.

Neither is Lesson 6's to fix. Both are worth one honest line when the user previews.

## 7. Nothing else in `marks.js` is hardcoded for a mark any more

Lesson 5 removed the two hardcoded ب's (`docs/lesson-5/02` §5): the title glyph is `mark.sample` and the rail's
part-1 glyph is `mark.sample` too, with `'ع'` fixed for part 2. Damma's `sample` is `'ب'`, which is in its six and
is the right glyph for the top bar.

So the only `marks.js` work in this lesson is `03`. That is the whole saving of having built Lesson 5 properly.
