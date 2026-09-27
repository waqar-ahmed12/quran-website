# 9. For the teacher

Five. **None of them blocks the build** — each has a recommendation that can be built now and changed with one row in
the options panel later. Read §1 even if you read nothing else: it is not about this feature, it is about whether
this feature has anything to match against.

## 1. The recordings — the one thing that decides whether this is worth building

`site/qaida/audio/manifest.json` today is empty: `"letters": {}`, `"fatha": {}`, `"kasra": {}`. **Not one recording
is in.** So "record yourself and match it against the teacher" is, today, "record yourself".

**The ask, and it is small:** the **29 letter names** — "Alif", "Baa", "Taa" — one sitting at a microphone, twenty
minutes. That one batch turns the matching half on across **lessons 1, 2 and 3**, which is three of the five lessons
that exist. `site/qaida/recordings.html` lists every file wanted, checks the folder, and writes out the
`manifest.json` to paste; nothing needs to be rebuilt or redeployed beyond dropping the files in and pasting that.

The mark sounds ("ba", "bi", "bu" — the *sound*, not the letter's name) are 29 per lesson and can keep arriving a few
at a time, exactly as planned.

**Claude's recommendation:** build the panel now regardless, because it is needed in lessons 6–14 as they are written
and retrofitting fourteen pages later is the expensive version. But the feature the user actually described only
exists once the letter names are recorded.

## 2. Is it the top bar, the letter, or both?

**Recommended, and built: both** — a **Say it** in the top bar of every lesson beside **Board**, and a **Say it**
beside **Hear it** on whatever letter is in front of you. The top-bar one is the same reasoning the user gave for the
board (*"we don't know when someone would need to write"*).

The cost is that the top bar is now four tools on a phone. If it is crowded, the row **Say it button** in the options
panel has *Only on the letter* and *Only in the top bar*, and the user can look at all three.

## 3. Should the student be able to send a recording to the teacher?

**Recommended: no, and nothing is built for it.**

It is the obvious next thought and it is a much bigger thing than it looks: children's voice recordings leaving their
own devices and arriving somewhere the user is then responsible for storing, securing, and deleting on request. It
needs a decision, a privacy notice, and somewhere to put them — not a button.

If the user wants it later, the honest shape is not a hidden upload but **"save this recording to my device"**, so
the student or their parent sends it to the teacher themselves, by whatever they already use. That is one button and
no infrastructure. Say the word.

## 4. Should the advice strip get a Say it?

Lessons 2–5 have an advice strip for a letter being missed repeatedly, with its own **Trace it**. It does **not**
get a Say it in this build: that strip is advice about the eye, and a third thing to do there turns gentle advice
into a list of chores. **Recommended: leave it.** One line in `lesson-2.js` if the user disagrees.

## 5. A mark on the letters you have already said?

Lesson 1's grid already carries a speaker mark on letters the teacher has recorded. A second small mark on letters
**you** have recorded would let a student see how far round the alphabet they have been with their own voice — which
is, arguably, the real progress bar for this.

**Not built in this step**, because two marks on one tile is a look the user has to see before it is committed to,
and the tiles are already carrying a letter, a name on tap, and a speaker. The Say it *button* does carry the dot
(`04-where-it-appears.md` §5), so nothing is lost meanwhile.

## 6. Carried over, still unanswered

From `docs/lesson-4/09` and `docs/lesson-5/06`, and touched by this build:

- **Would the recordings be easier taken letter by letter** — "Baa, ba, bi, bu" in one breath — **than lesson by
  lesson?** It is the same 116 clips either way, but four of one letter in a row is quicker to record and quicker to
  check. `recordings.html` can list them in whichever order the user prefers; it is a sort, not a rebuild. This
  question now matters more, because this feature is the thing waiting on the answer.
