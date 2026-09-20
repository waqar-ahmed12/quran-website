# 05 — Every line on the page

The user's standing rule: **every line of wording Claude writes gets its own text field in the options panel.**
Tagging the element is the whole job — `qaida-options.js` walks `[data-words]` and `[data-words-attr]` and builds
the field. The wording below is a **stand-in**; the user reads it once they can see it.

**Never harsh** (the user, 2026-09-19). A wrong answer says what the thing is and nothing more. No "incorrect", no
"wrong", no "try again", no exclamation marks anywhere on the page.

**No numbers** (the user, 2026-09-20). Plain words for progress; the counts stay in the options panel.

The Words section for this page is named **`Words (lesson 4)`**.

## `{mark}` — the token that makes one page serve three lessons

Almost every line below contains **`{mark}`**, filled with `zabar` or `fatha` from
`marks.nameOf(mark, shell)` (`02-the-mark.md` §1). It is re-filled on load and on every `shell.onChange`, so
switching the name set rewrites the page without a reload.

`{Mark}` — capitalised — is the same word with its first letter upper-cased, for the start of a sentence and for
the title. Build it, do not add a second field.

**Any line the page rewrites at runtime lives in an attribute, not in the element's text** —
`data-words-attr="attribute|label;attribute|label"` (`qaida-options.js:479-494`), because a `data-words` field
edits `textContent` and the page would overwrite the teacher's edit on the next name-set change
(`04-page-and-design.md` §2). Every row below whose text contains `{mark}`, `{name}` or `{sound}` is therefore an
attribute; the plain ones may stay `data-words`.

Two other tokens, both from Lesson 3's pattern: **`{name}`** is a letter's name (Baa), and **`{sound}`** is what
the pair says, used only by the lines that exist for `09-open-questions.md` §1 and are empty until it is answered.

## The head

| Element | Tag | Text |
|---|---|---|
| lesson number | `data-words` | `Lesson 4 of 14` |
| title (zabar set) | `data-title-zabar` | `Zabar` |
| title (fatha set) | `data-title-fatha` | `Fatha` |
| lede | `data-words` | `The mark that turns a letter into a sound.` |
| the large glyph | `data-titlemark` | `بَ` |
| settings line | inherited from Lesson 3 | unchanged |

## Progress

Lesson 3's plain words, unchanged — `Just starting` → `Getting going` → `Getting there` → `Nearly there` →
`All known`. The group line says nothing until the group is done, then `All of this group`.

## The rail

| Element | Attribute | Text |
|---|---|---|
| rail label | `aria-label` | `The two parts of this lesson` |
| group 1 name | `data-group1` | `Meet the mark` |
| group 2 name | `data-group2` | `All the letters` |
| a finished group | `data-group-done` | `Done` |
| the current group | `data-group-now` | `You're here` |
| a later group | `data-group-later` | `Comes later` |
| opening one early | `data-group-early` | `This part comes later. You can carry on if you like — each one builds on the one before.` |

## The board

| Element | Attribute | Text |
|---|---|---|
| step heading | `data-words` | `Step 1 · Look at the mark` |
| step guide | `data-words` | `A small stroke above the letter. Tap any of them to hear it.` |
| the mark alone, label | `data-mark-alone` | `This is {mark}.` |
| where it sits | `data-mark-sits` | `{Mark} sits above the letter.` |
| the pair, bare side | `data-pair-bare` | `The letter on its own` |
| the pair, marked side | `data-pair-marked` | `The letter with {mark}` |
| what the mark does | `data-mark-does` | `A letter on its own has a name. With {mark} it has a sound.` |
| the joined example | `data-joined` | `{Mark} goes with the letter wherever it sits.` |
| what the example is not | `data-joined-note` | `The same letter twice, not a word.` |
| the practise button | `data-words` | `Practise this group` |

**`data-mark-sits` must be editable and it must not be a lie for lessons 5 and 6.** Zair sits *below*. The text
field is per page, so `lesson-5.html` carries `{Mark} sits under the letter.` — that is why this is a field and
not a sentence assembled from `mark.sits`.

## The drill

The item names, built once and used 29 times (`03-the-pool-and-formats.md` §1):

| Element | Attribute | Text |
|---|---|---|
| a marked item | `data-name-marked` | `{name} with {mark}` |
| a bare review item | `data-name-bare` | `{name}` |

The question lines, on `.ask`:

| Attribute | Asked when | Text |
|---|---|---|
| `data-glyph` | `mark-to-name` | `Which letter is this, and what is on it?` |
| `data-name` | `name-to-mark` | `Which one is this?` |
| `data-spot` | `name-to-mark` + `mark-or-not` distractors | `Which one carries {mark}?` |
| `data-sound` | `sound-to-mark` | `Which one says this?` |

## After an answer

| Attribute | Text |
|---|---|
| `data-right` | `Yes — {name} with {mark}.` |
| `data-right-bare` | `Yes — {name}, with no mark.` |
| `data-wrong` | `That one is {chosen}. This is {name} with {mark}.` |
| `data-wrong-bare` | `That one is {chosen}. This is {name}, with no mark.` |
| `data-trace` | `Write it` |
| `data-next` | `Next` |

The bare variants exist because "Yes — Baa with zabar" under a bare ب would be wrong, and a review item is in the
pool one question in eight.

## Advice, readiness, finishing

| Attribute | Text |
|---|---|
| `data-struggling` | `{name} keeps slipping. Look at it again at the top of the page.` |
| `data-ready-group` | `You seem to know this part. The next one is ready when you are.` |
| `data-ready-lesson` | `You seem to know {mark} on every letter.` |
| `data-finished` | `This lesson is marked as done. You can keep practising as long as you like.` |
| `data-pool-error` | `Something is missing here — reload the page and it should come back.` |

## The footer

| Element | Attribute | Text |
|---|---|---|
| back | `data-words` | `Back to the Qaida` |
| next, zabar set | `data-next-zabar` | `Next: Zair` |
| next, fatha set | `data-next-fatha` | `Next: Kasra` |
| next, not built | `data-next-soon` | `The next lesson isn't built yet.` |

## Waiting on `09-open-questions.md` §1

If the teacher chooses to teach the **sound** rather than the pair's name, these fields carry it, and the item
template above changes from `{name} with {mark}` to `{sound}`:

| Attribute | Text |
|---|---|
| `data-name-sound` | `{sound}` |
| `data-sounds-like` | `{name} with {mark} says “{sound}”.` |
| the 29 sounds | one text field, comma-separated, the way `shell.setNames` works | `a, ba, ta, tha, ja, …` |

**Do not write that list of 29 without the teacher.** It is transliteration, which the user switched off, and
several of them (ع ح ق ص ض ط ظ) have no honest spelling in plain Latin letters. `09` §1 is the question.
