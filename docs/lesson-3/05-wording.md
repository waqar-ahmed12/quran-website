# 05 — Every line on the page

The user's standing rule: **every line of wording Claude writes gets its own text field in the options panel.**
Tagging the element is the whole job — `qaida-options.js` walks `[data-words]` and `[data-words-attr]` and builds
the field. The wording below is a **stand-in**; the user reads it once they can see it.

**Never harsh** (the user, 2026-09-19). A wrong answer says what the shape is and nothing more. No "incorrect", no
"wrong", no "try again", no exclamation marks anywhere on the page.

The Words section for this page is named **`Words (lesson 3)`**, so an exported settings block can hold several
pages at once (`docs/lesson-2/07-options-panel.md` §1).

## The head

| Element | Tag | Text |
|---|---|---|
| lesson number | `data-words` | `Lesson 3 of 14` |
| title | `data-words` | `Letter shapes` |
| lede | `data-words` | `How a letter changes when it joins the ones beside it.` |
| settings line | inherited from Lesson 2 | unchanged |

## The band rail

| Element | Attribute | Text |
|---|---|---|
| rail label | `aria-label` | `The five groups of letter shapes` |
| band 1 name | `data-band1` | `They never join forward` |
| band 2 name | `data-band2` | `They never change` |
| band 3 name | `data-band3` | `A tooth and a tail` |
| band 4 name | `data-band4` | `They change the most` |
| band 5 name | `data-band5` | `The whole table` |
| a finished band | `data-band-done` | `Done` |
| the current band | `data-band-now` | `You're here` |
| a later band | `data-band-later` | `Comes later` |
| opening a band early | `data-band-early` | `This group comes later. You can carry on if you like — each one builds on the one before.` |

## The board

| Element | Attribute | Text |
|---|---|---|
| heading (sr-only) | `data-words` | `The shapes` |
| column: isolated | `data-col-isolated` | `On its own` |
| column: initial | `data-col-initial` | `Start of a word` |
| column: medial | `data-col-medial` | `Middle of a word` |
| column: final | `data-col-final` | `End of a word` |
| column, back-only pair | `data-col-joined` | `Joined to the letter before` |
| the joined-up demo | `data-demo` | `Joined up` |
| what the demo is | `data-demo-note` | `The same letter three times, not a word.` |
| the `back-only` note | `data-nofwd` | `{name} joins to the letter before it, never to the one after — so a gap follows it.` |
| the ء row | `data-hamzah` | `Hamzah never joins to anything, so it has only one shape.` |
| ط ظ note | `data-nochange` | `{name} barely changes. Look how alike the four are.` |

## The drill

These three build every item's `name` (`03-the-pool-and-formats.md` §1), so they are edited once and 68 item names
follow.

| Element | Attribute | Text |
|---|---|---|
| position: isolated | `data-name-isolated` | `{name}, on its own` |
| position: initial | `data-name-initial` | `{name}, start of a word` |
| position: medial | `data-name-medial` | `{name}, middle of a word` |
| position: final | `data-name-final` | `{name}, end of a word` |
| position: back-only joined | `data-name-joined` | `{name}, joined` |

The question lines, on `.ask`:

| Attribute | Text |
|---|---|
| `data-glyph` | `Which letter is this, and where does it sit?` |
| `data-name` | `Which one is {name}?` |
| `data-sound` | `Listen, then pick the shape.` |

The verdict, on `.verdict`:

| Attribute | Text |
|---|---|
| `data-right` | `Yes — {name}.` |
| `data-wrong` | `That one is {chosen}. This is {name}.` |
| `data-error` | `There aren't enough shapes to ask about here.` |

`data-wrong` names **both** shapes on purpose: in this lesson the two are usually the same letter in different
places, and saying only the right answer leaves the student not knowing what they actually picked.

The strip after an answer (`.after`), copied from Lesson 2 with one changed label:

| Attribute | Text |
|---|---|
| `data-hear` | `Hear it` |
| `data-trace` | `Write it` |
| `data-next` | `Next` |

**"Write it", not "Trace it"** — on this board the thing traced is the isolated letter, not the joined shape the
question asked about (`06-accessibility.md` §4), and "Trace it" would promise the shape on screen.

## The advice

| Element | Attribute | Text |
|---|---|---|
| a form that keeps coming back | `data-template` | `{name} keeps catching you out. Worth looking at it again on the board above.` |
| its button | `data-words` | `Show me` |
| its second button | `data-words` | `Write it` |
| a band's ready line | `data-template` | `You seem to know this group. The next one is ready when you are.` |
| the whole lesson's ready line | `data-template` | `That's all of the shapes. The table below is yours to keep coming back to.` |

## Progress

Two different numbers, two different lines (`03-the-pool-and-formats.md` §2) — neither may be labelled just
"shapes", or they read as contradicting each other.

| Element | Attribute | Text |
|---|---|---|
| this band | `data-template` | `{known} of {total} in this group` |
| this band, done | `data-done` | `All of this group` |
| the whole lesson | `data-template-all` | `{known} of {total} shapes in the lesson` |
| the tally | `data-template` | `{right} right, {wrong} to come back to` |
| the tally, clear | `data-clear` | `{right} right` |
| Start again | `data-label` | `Start again` |
| Start again, armed | `data-confirm` | `Tap again to clear` |

## The end of the lesson

| Element | Attribute | Text |
|---|---|---|
| before | `data-before` | `Work through the five groups to finish the lesson.` |
| after | `data-after` | `Every shape covered.` |
| Next button | `data-words` | `Lesson 4: Zabar` — **must follow the names choice**, so read it from `shell.LESSONS[3].title[state.names]` rather than hardcoding it |
| Next, not built | `data-standin` | `Lesson 4 isn't built yet.` |

## The sound line

Copied from Lesson 2 unchanged, with one wording change, because in this lesson a recording belongs to the letter
and not to the shape:

| Attribute | Text |
|---|---|
| `data-none` | `Hearing practice opens when the recordings arrive.` |
| `data-some` | `{done} of {total} letters recorded so far.` |
