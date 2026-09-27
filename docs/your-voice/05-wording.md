# 5. Every line, and its text field

The standing rule: **every piece of wording Claude writes gets its own text field in the options panel**. So every
string below carries a `data-words` (the element's text) or `data-words-attr` (its attributes), and appears under
**Words (lesson N)** in the panel, ready to be rewritten and exported to `setting.txt`.

Rules these lines are written under, from the Decisions table: **never harsh**, **plain and short**, **no numbers on
the page**, and **never tell the student they are wrong** — which here means never implying their voice was.

`{name}` is filled with the item's name. `{n}` is a count of seconds.

## 1. The buttons

| Where | Words | Key |
|---|---|---|
| Top bar | **Say it** | `Top bar: say it button` |
| Lesson 1's strip, the drills' after-strip | **Say it** | `Say it button` |
| The big button, ready | **Record** | `Record button` |
| The big button, recording | **Stop** | `Record button, while recording` |
| The teacher's lane | **The teacher** | `Say it panel: play the teacher` |
| Your lane | **You** | `Say it panel: play your own` |
| Both | **One after the other** | `Say it panel: play both` |
| Your lane | **Delete** | `Say it panel: delete this recording` |
| Settings | **Delete every recording of my voice** | `Say it panel: delete everything` |
| Settings, asking to be sure | **Tap again to delete them** | `Say it panel: delete everything, asking to be sure` |

**"The teacher"**, not "the model" or "correct" or "the right one". It is a person's voice, and naming it as a person
is what stops the lane reading as a verdict.

**"You"**, not "your attempt", not "your try". Nothing in the panel calls it an attempt, because an attempt is a
thing that can fail.

## 2. The title

| | |
|---|---|
| With a letter | **Say {name}** — `Say it panel: title ({name} is filled in)` |
| With none | **Your voice** — `Say it panel: title with no letter` |

## 3. Which of the two is being asked for

The line under the letter, and the one place this panel teaches something. Lesson 4's whole subject is that بَ is a
*sound*, not a *name*, and a student who records "Baa" against a teacher's "ba" will hear a mismatch and think their
mouth is wrong.

| Lessons | Words | Key |
|---|---|---|
| 1, 2, 3 | **Say its name.** | `Say it panel: when the name is wanted` |
| 4 and later | **Say the sound — not the letter's name.** | `Say it panel: when the sound is wanted` |

Which one shows is decided by the `kind`: `letters` is a name, anything else is a sound. No lesson has to declare it.

## 4. When the teacher has not recorded this one yet

The state every item is in today (`01-what-it-is.md` §5). One line, in `.echo-note`:

> **No recording from the teacher for this one yet. You can still say it and hear yourself back.**

`Say it panel: nothing to match against yet`

It does **not** say "coming soon", and it does not play the wordless stand-in. The stand-in exists so that tapping a
speaker does something; matching your pronunciation against a hum is not a thing, and letting a beginner think the
hum is the model is worse than saying plainly that there is nothing yet.

## 5. When the microphone is refused, or missing

| State | Words | Key |
|---|---|---|
| `denied` | **Your browser is keeping the microphone private. If you want to record, allow it for this page and tap Record again.** | `Say it panel: microphone not allowed` |
| `nomic` | **No microphone found on this device. You can still listen.** | `Say it panel: no microphone` |

Neither blames anyone, neither explains browser settings in detail (they differ per browser and go stale), and the
Record button stays where it is in `denied` so a student who changes their mind has somewhere to tap.

## 6. Where the recordings are kept

The quiet line at the bottom of the panel, always shown:

> **Your recordings stay in this browser, on this device. Nothing is sent anywhere.**

`Say it panel: where recordings are kept`

Accurate and not over-promising: it says *this browser, this device*, which is exactly what is true — not "private to
you", because anyone using this computer can open the page and play them. `06-accessibility-and-privacy.md` §6.

When storage is unavailable (`nostore`), that line is replaced by:

> **This browser will not keep recordings, so this one lasts until you close the page.**

`Say it panel: recordings cannot be kept`

## 7. `.echo-state` — the live line

One live region, one thing at a time.

| When | Words | Key |
|---|---|---|
| asking | **Waiting for you to allow the microphone.** | `Say it panel: waiting for the microphone` |
| recording | **Recording. {n} seconds.** | `Say it panel: while recording ({n} is filled in)` |
| stopped by the cap | **That is as long as one recording goes. Tap Record to try again.** | `Say it panel: the recording stopped itself` |
| saving | **Just a moment.** | `Say it panel: saving` |
| ready, nothing recorded yet | **Tap Record, then say it.** | `Say it panel: before recording` |
| ready, something recorded | **Play them one after the other and listen for the difference.** | `Say it panel: after recording` |
| deleted | **Deleted.** | `Say it panel: deleted` |

The recording counter is the one place a number appears, and it is the number of seconds of an open microphone, which
the student has a right to see. The "no numbers on the page" rule is about not scoring a student, and this scores
nothing.

**Nothing in this list evaluates the recording.** There is no "that sounded close", no "well done", no "try again" —
the last one especially, because it implies a verdict about a thing the page cannot hear.

## 8. When the sound is off

`.echo-state`, with the mute switch on:

> **The sound is off. Turn it on to hear either voice.**

`Say it panel: the sound is off`

Followed by a **Turn the sound on** button in the same line — `Say it panel: turn the sound on` — which flips
`shell.state.muted`, saves, and calls `shell.applyMute()`. One tap, and the student is not left guessing why a play
button does nothing.

## 9. The options panel's own section

Its title and every row label are in `07-options-panel.md`. They are wording too, and they are also fields, but they
live in the temporary panel and are deleted at step 13 along with it.
