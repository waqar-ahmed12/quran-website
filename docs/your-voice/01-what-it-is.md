# 1. What the student does, and why nothing is scored

## 1. The loop, in one paragraph

The student is looking at a letter — ب, or بَ, or the middle form of ع. They tap **Say it**. A panel opens with the
letter large at the top. They hear the teacher say it. They tap the big round button and say it themselves. They hear
themselves. They hear the teacher again, then themselves again, one after the other, as many times as they like. When
they are happy, they close the panel. Their try is kept for that letter, so the next time they open it they hear what
they sounded like last time.

That is the whole feature. Everything below is the detail of making those six sentences true without lying to a
beginner.

## 2. Why this is the exercise the Qaida has been missing

`trace.js` teaches the hand. `practice.js` teaches the eye. Nothing so far has touched the mouth, and a Qaida is a
*reading aloud* book — the entire point of learning ب is being able to say it. A student working alone with the page
as it stands can finish all fourteen lessons having never once said a letter out loud, and can be word-perfect on the
screen and unintelligible in front of a teacher.

The one-to-one lesson this site sells is where that is normally caught. The free Qaida cannot catch it, and should not
pretend to. What it *can* do is what a printed Qaida and a cassette did for a generation: **put the model next to the
attempt and let the student hear the gap.** Ears are good at this. A seven-year-old who hears ع twice in a row — once
from a teacher, once from themselves — knows perfectly well which one is the ع.

## 3. Nothing is scored, and this is not a limitation to work around

The obvious next thought is a percentage: compare the two clips, show "84% match". Do not build it, and do not build
anything that reads as it — no green tick, no red cross, no bar filling up, no "try again".

Three reasons, in order of weight:

1. **It would be wrong often enough to hurt.** The honest tools for this are forced-alignment and phoneme scoring
   against an acoustic model. For Qur'anic Arabic, on a child's voice, on a laptop microphone, in a room with a
   television on, with no calibration — the number would be noise wearing a percentage sign. And the letters it would
   be most wrong about are exactly ع ح ق ص ض ط ظ ء: the ones a non-Arab beginner most needs to be encouraged through.
2. **It is the same rule the tracing board already lives under**, for the same reason, and the reasoning is written at
   the top of `trace.js`: *"a machine telling a student 'wrong' when they are right teaches them to distrust
   themselves."* Handwriting was the weaker case. Pronunciation is the stronger one, because a student who is told
   their ع is wrong will stop trying to say ع.
3. **It is the opposite of what this site is for.** The user is a Qur'an teacher, and judging pronunciation is the
   teacher's job — the one thing a free web page genuinely cannot do and the one-to-one lesson genuinely can. A page
   that claims to grade tajweed is competing with its own teacher and losing.

**The rule, written once so it can be quoted:** the page plays the two clips and says nothing about them. The student
judges. If they want to know for certain, that is what a teacher is for, and the finish screen (step 11) already
points at one.

### What *is* allowed to be shown

A **waveform of each clip, drawn the same way, one above the other** (`03-the-panel.md` §5). This is not scoring. It
is the same service the faint guide letter does on the tracing board: it makes the comparison easier to see without
making a claim about it. It honestly shows two things a beginner often misses by ear alone — **how long** the sound
was, and **where the stress fell**. A student whose مَدّ is half the length of the teacher's can see it. Nothing is
labelled right or wrong, and the two lanes are drawn in the same colour.

If the waveform ever starts to read as a score — the user's eye decides this, not Claude's — the options panel has a
row that turns it off (`07-options-panel.md`), and the two play buttons alone are a complete feature.

## 4. What "an item" is, lesson by lesson

The recorder does not know what a lesson is. It is handed three things — a **kind**, a **glyph** and a **name** — and
those are already exactly what `audio.js` is handed today (`audio.play(kind, glyph)`), so the teacher's clip and the
student's clip are looked up with one key and can never drift apart.

| Lesson | kind | glyph | what the student says |
|---|---|---|---|
| 1 | `letters` | ب | the letter's **name**: "Baa" |
| 2 | `letters` | ب | the letter's name |
| 3 | `letters` | ب | the letter's name (the isolated letter, not the joined shape — as "Write it" already does) |
| 4 | `fatha` | ب | the **sound**: "ba" |
| 5 | `kasra` | ب | the sound: "bi" |
| 6 | `damma` | ب | the sound: "bu" |
| 7–14 | that lesson's `mark.audio` | its base letter | that lesson's sound |

This falls out of `marks.js` for free: every mark already carries an `audio` key, `audio.js` already builds its
`groups()` from the marks whose lesson is built, and `recordings.html` already lists the rows. **The recorder adds no
data of its own.**

The distinction between a letter's *name* and its *sound* is Lesson 4's whole subject and is already written into
`audio.js`'s `say()` line — *"The sound of Baa with zabar — not its name"*. The recorder inherits it, and
`05-wording.md` §3 makes the panel say which of the two is being asked for, because a student who records "Baa" when
the teacher recorded "ba" will hear a mismatch and think they are the one who is wrong.

## 5. The honest state of it on the day it ships

`site/qaida/audio/manifest.json` today:

```json
"letters": {}, "fatha": {}, "kasra": {}
```

**There is not one teacher recording in the Qaida.** So on the day this is built, every item is in the "nothing to
match against yet" state, and what the student gets is: record yourself, hear yourself, keep it. That is worth
building and it is honest — the panel says so in one plain line (`05-wording.md` §4) instead of playing the wordless
hum at them and letting them think that is the model.

**The teacher's lane turns on per letter, with no code change and no release**, the moment a filename appears in
`manifest.json`. That is how `audio.js` already works, and it is why the manifest exists.

**The recommendation for the teacher** is in `09-open-questions.md` §1, and it is small: the **29 letter names** are
one sitting at a microphone, and they unlock this feature across lessons 1, 2 and 3 at once — three of the five
lessons that exist. The mark sounds (29 more per lesson) can keep arriving a few at a time as they always have.
