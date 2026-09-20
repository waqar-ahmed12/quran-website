# 03 — The pool, the review, and the wrong answers

This is the only file in this folder with real code in it. Everything else is a copy with a different stroke.

## 1. The lesson's own items — unchanged

`marks.allItems(shell, mark, opts)` with the kasra row gives the 29 items, and every field is already right:

| Field | Value | Note |
|---|---|---|
| `id` | `shell.keyOf(glyph) + String.fromCharCode(0x0650)` | folds to Madani, so credit survives a change of script |
| `glyph` | the chosen script's letter + U+0650 | |
| `name` | `'Baa with zair'` | from the template; the word comes from `mark.names[…]` |
| `audio` | `{ kind: 'kasra', glyph }` | the **sound** "bi", not the letter's name. Keyed by `mark.audio`, never by the student's word |
| `base`, `key`, `letterName`, `markName`, `marked`, `group` | as Lesson 4 | |

**No change to `allItems`.** The only reason to touch it is `familyFor` (§3) and `mark.first` (`02` §3).

## 2. The review — the change the lesson turns on

Lesson 4's review is **bare letters**: ب riding along beside بَ, so that "does this carry a mark?" is a real
question. In Lesson 5 that question is already answered — the student did Lesson 4 — and asking it again teaches
nothing. Lesson 5's review has to carry **the other mark**.

### Three kinds of review item, and what each is for

| Kind | Example | `id` | What it makes answerable |
|---|---|---|---|
| **the twin** — the same letter with **zabar** | بَ | `'ب' + U+064E` | **skill D**: above against below. The reason the lesson exists |
| the bare letter | ب | `'ب'` | skill A, one last time: "is there a mark at all?" |
| *(Lesson 6 adds paish twins here, and changes nothing else)* | | | |

**The twins are the default and the bare letters are the slider.** That is the reverse of Lesson 4, on purpose.

### Which letters get a twin

The twin pool is **the open part's own letters**, deterministically — every kasra item in the part has its zabar
twin available to be the wrong answer, which is exactly what `familyFirst` needs to guarantee one. That is the
same rule Lesson 4 uses for `mark-or-not` (`mark-lesson.js` `reviewFor`: `own.length`, not `own.length / 3`).

The **bare** letters keep Lesson 4's rule: `reviewKeys(shell, count, prefer)`, which prefers the letters this
student got wrong in Lesson 2, then spreads across the shape families. Add one line to it: **prefer the letters
they got wrong in Lesson 4 as well** — `shell.drillOf(4)` beside `shell.drillOf(2)` — so mixed review reaches back
two lessons instead of one, which is the user's 2026-09-19 rule read properly.

### A student who skipped Lesson 4

Nothing is locked, so this will happen. The twins are then a letter with a mark they have never seen — and that is
**fine**, for one reason: review is never required and never the gate (the user, 2026-09-19). A twin is only ever a
*wrong answer* here; it is never the thing being asked about unless the student chooses it, in which case the
verdict line names it ("that one is Baa with zabar") and they have learnt something. The board shows the pair from
the first minute, which is where the teaching happens.

**Do not make the twins required, and do not let them count towards finishing.** `poolFor` marks only the lesson's
own items `required: true`; leave it.

### The counts

| Part | Own (required) | Twins | Bare (slider, default 4) | Review as a share of questions |
|---|---|---|---|---|
| 1 | 6 | 6 | up to 2 | ~35% |
| 2 | 29 | 29 | up to 4 | ~35% |

`practice.js` weighs a review item at **half** a required one, so a pool that is half review is about a third of
the questions. That is more review than Lesson 4's roughly one in eight, and it should be: in Lesson 4 review was
a courtesy, here it is the contrast the lesson is made of. **It is a row in the options panel either way** — the
teacher looks at it and decides (`04-page-and-wording.md` §4).

## 3. The wrong answers — a fourth mode

`familyFor(key, distractors, looks)` in `marks.js` gains one value. Today:

| Row value | Tags emitted | The question becomes |
|---|---|---|
| `look-alike` (Lesson 4's default) | `look<n>` | "which letter is this?" |
| `mark-or-not` | `letter:<key>` | "does this one carry the mark?" |
| `any` | none | uniform draw |
| **`which-mark`** *(new, Lesson 5's default)* | `letter:<key>` | **"which mark is this, and where does it sit?"** |

`which-mark` and `mark-or-not` emit **the same tag**. They differ in what is in the pool beside the item —
`mark-or-not` puts the bare twin there, `which-mark` puts the zabar twin there. That is deliberate and it is why
this is a pool change rather than a tagging change: `practice.js`'s `familyFirst` guarantees *one* distractor
shares a tag, and which one it finds depends on what exists, not on the order of the array
(`docs/lesson-3/README.md` "as built" §6).

So the row in the options panel does two things at once — the tag *and* which review items are built — and the
code should be honest about that: one `reviewPlan(distractors)` helper returning `{ twins, bare }`, called from
`poolOf`, rather than two `if` chains drifting apart.

**`look-alike` must stay available**, and probably stays the *second* choice: a beginner's commonest failure is
still misreading the letter. The teacher can click it and look.

## 4. `mark` on the item, and the one field to add

A twin is `marked: true`, the same as a lesson item. Three things in the built page read "is this marked?" and
would now get the wrong answer:

| Where | Today | Fix |
|---|---|---|
| `mark-lesson.js:305` (board tile audio) | `tile.dataset.kind === 'marked' ? mark.audio : 'letters'` | play `item.audio.kind`, which is already correct on every item |
| `mark-lesson.js:538` (`data-missed`) | rebuilds the id as `keyOf(base) + mark.cp` | compare `item.id` directly |
| the verdict line | says what the chosen item is, from `item.name` | already right — `'Baa with zabar'` falls out of the template |

So: **add `mark: mark.id` to the items `allItems` builds, and `mark: <the other mark's id> \| null` to the review
items.** Then "is this one of the lesson's own?" is `item.mark === mark.id`, which is what the page means, and
`marked` stays what it says on the tin.

**`poolFor`, `sizes`, `stats` and `lessonKnown` do not change.** They are only ever handed `items` — the 29 — and
never the review, so their `item.marked` filters are still correct. Do not "fix" them; changing them would be
churn in the three functions `tools/qaida-check.js` checks hardest.

## 5. The formats

The four from `docs/lesson-4/03` §5, with the third rewritten:

| id | prompt | choices | when |
|---|---|---|---|
| `mark-to-name` | بِ, large, `lang="ar" dir="rtl"` | four names, LTR | **default.** `minStreak: 0` |
| `name-to-mark` | "Baa with zair", in Jost | four glyphs, as tiles | `minStreak: 1` |
| **`which-mark`** | **"Which one has zair?"** | **one kasra glyph, three zabar** | replaces Lesson 4's `spot-the-mark`. Still not a fourth descriptor — it is `name-to-mark` with `which-mark` distractors and a different question line |
| `sound-to-mark` | a Play button and the recording of **"bi"** | four glyphs, as tiles | `available:` the base letter has a **`kasra`** recording. **Off by default: there are none** |

`which-mark` is the format that tests skill D directly, and unlike `sound-to-mark` it can be built today. It
should be **on** by default.

**`sound-to-mark`'s `available()` must count `kasra` files, not `fatha` files.** It reads `mark.audio`, so it is
already right if it was written as `docs/lesson-4/03` §5 specifies — check it, because a hardcoded `'fatha'` there
would silently switch the format on for Lesson 5 the day Lesson 4's recordings land, and every prompt would be the
wrong sound.

## 6. Progress and finishing — unchanged

- `drill.progress()` — the open part, for the rail and the "you seem to know these" moment.
- `shell.masteredCount(5, target) / 29` — the whole lesson, for the bar and the home card.
- `setDone(5, true)` when **part 2** is ready: four fifths of the 29 at `target` 3, nothing missed still shaky. Not
  when part 2 is merely opened.

**One carried bug gets worse here.** `docs/lesson-4/README.md`'s "as built" §3: `shell.masteredCount(n)` counts
every id in the lesson's record, so review items inflate the home card. In Lesson 4 that was 8 extra ids out of
29. In Lesson 5 it is **up to 33 extra ids out of 29** — the card would read full while the student is halfway.
The home clamps to the total so nothing displays above 100%, but the card would be wrong for most of the lesson.

Recommended fix, and it is small: give `shell.masteredCount(n, target, ids)` an optional id list and have
`mark-lesson.js` pass `items.map((i) => i.id)`. `shell.js` is shared, so run all three check scripts after.
**This one should be fixed in this step rather than carried again.**
