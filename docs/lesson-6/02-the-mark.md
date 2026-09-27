# 02 — The mark: U+064F

## 1. The character

| | |
|---|---|
| Code point | **U+064F ARABIC DAMMA** |
| Composed as | `letter + String.fromCharCode(0x064F)`, never pasted into source (`marks.js` line 8's rule; the "no literal combining mark" check covers it) |
| Names | `damma` / `paish` (`MARKS.damma.names`, already written) |
| Sits | **above**, like fatha (`sits: 'above'`, already written) |
| Sound | a short **"u"**, as in *put*. The sound "bu", never the name "Baa" |
| Audio group | `damma` (`audio: 'damma'`, already written). `manifest.json` has no `"damma": {}` line yet |
| Shape | a small curl, like a tiny و. Madani and Indo-Pak write it the same way closely enough that one lesson serves both. The **upside-down** paish is a different mark, and belongs to Lesson 9 |

## 2. Why it is harder to draw than zabar

Zabar is a thin slanted line. Paish is a **small و**: it has a loop and a tail, and in Noto Naskh it is noticeably
**taller** than zabar. Two places where that matters:

**The top of the tile.** The tallest letters are **ا ل ط ظ ك** (and Indo-Pak **ک**, whose top bar reaches just as
high). A mark above them sits higher than anywhere else. Lesson 4's tiles are sized for zabar. If they are only just big
enough for zabar, paish will be clipped. `.letter` clips with `overflow: hidden` (`docs/lesson-5/README.md` "as
built" §9), so a clipped mark shows as a mark with its top cut off. It will not spill over.

**Dots above.** **ت ث ن ق ف ش ز ذ خ غ ض ظ** all have dots where the mark goes. The font stacks the mark above the
dots, which makes the letter taller still, so **ث ش** (three dots) with paish are the tallest things in the lesson.

**Do not build CSS for this in advance.** Lesson 5 did the same thing for the strip below: build nothing, put it on
the checklist, and fix it once seen. If the preview shows clipping, the fix is one block:
`[data-mark="damma"] .letter { padding-top: … }` or a taller `aspect-ratio`, the counterpart of Lesson 5's
`[data-sits="below"]` block. It belongs in `qaida.css`, keyed to the mark rather than to `sits`, because zabar sits
above too and must not change.

## 3. The six letters of part 1

`MARKS.damma.first` is already `['ب', 'د', 'ر', 'س', 'م', 'ل']`, Lesson 4's six. **This plan keeps it.**

Lesson 5 had to change its six, because three of Lesson 4's letters (ب ر م) put a dot or a tail where zair goes.
Paish goes **above**, where zabar went, so the argument that chose Lesson 4's six still holds: none of them has a dot
above, and the mark sits in clear space.

There is a stronger reason. The contrast this lesson teaches is **paish against zabar, on the same letter**. The student
met zabar on exactly these six letters, so the first thing they see is بَ, which they know, beside بُ, which they
don't. Nothing else changes on the page.

The one letter to watch is **ل**. Its tall stem puts the mark as high as it goes in part 1. If it clips (§2), keep
it and fix the tile, because ل will be in part 2 regardless.

`sample: 'ب'` stays: بُ in the title and on the rail.

## 4. Hamzah, alif, and the letters that don't take the mark alone

Carried from `docs/lesson-4/09` §4 and unchanged: ءُ is shown **bare**, not on a seat (أُ / ؤ). And ا with a mark is
something a printed Qaida handles with hamzah. Lessons 4 and 5 both show اَ and اِ as they are; Lesson 6 does the same,
so the three lessons stay consistent. Hamzah's seats get a pass of their own.

## 5. Nothing in `glyphOf`, `aloneOf` or `joinedOf` changes

They are all driven by `mark.cp`, so ◌ُ (the mark on its own), بُ and بُبُ come out right with no edit. Check them, don't
rewrite them.
