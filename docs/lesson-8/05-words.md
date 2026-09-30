# 05 — Words: the walkthrough and the exercise page

Lessons 4–6 each have a **Spell a word** walkthrough (`spell.js`, three words stepped through the user's own way —
*"kaf zabar ka, ta zabar ta, kata, ba zabar ba, kataba"*) and a **Practice reading** page of twelve
(`exercise.js`, `exercise-N.html`). Lesson 7 has neither, on purpose: tanween only happens at the end of a word.
Lesson 8 has both, and it is the lesson where words stop being a stretch.

## 1. Why this lesson is where words open up

With three short vowels, the only real words a beginner can read are verbs in one pattern — *kataba*, *shariba*,
*karuma* — which is exactly what lessons 4–6 use. **Add the long aa and the everyday words arrive**: *qaala* (he
said), *kaana* (he was), *baabun* (a door), *kitaabun* (a book), *salaamun* (peace). Several of them are words a
child already knows the sound of. That is worth using, and worth being careful with (§4).

## 2. How a long syllable is spelled out

**The alif belongs to the syllable before it.** It is never named on its own step, because it is never read on
its own: in قَالَ, *qaa* is one syllable, not *qa* and then *a*. So a word is written in `spell.js`'s existing shape
— `[key, markId]` pairs, right to left — and the long syllable simply carries the new mark:

```js
{ root: [['ق', 'fatha-alif'], ['ل', 'fatha']], syll: ['qaa', 'la'], meaning: 'he said' }
```

`marks.glyphOf` appends the alif (`03` §2), so **no new step kind and no change to `stepsFor`**. The steps come out
as the user's own shape:

| Step | Shows | Says |
|---|---|---|
| 1 | قَا | *Qaaf with zabar and alif: qaa.* |
| 2 | لَ | *Laam with zabar: la.* |
| 3 | قَالَ | *The whole word: qaala.* — *It means "he said."* |

and for a three-part word the five steps the user described. The caption is the existing
`data-letter-line="{name} with {mark}: {sound}."`; how the teacher actually says a long syllable out loud — with
the alif named, or not — is `07` §4, and it is one text field.

**A ligature never splits across two steps.** A laam followed by an alif is always the long vowel of that laam's
own syllable (an alif cannot begin a syllable), so لَا is always one step, drawn whole. Worth knowing for the
walkthrough fix below, which will want to highlight "the part being read".

**The pending walkthrough fix comes first** (`fixes/lesson 4 5/`, 2026-09-27: *"should be animated, and be shown in
complete word and the word that is being read is highlighted"*). It changes how `spell.js` draws a step — the whole
word always on screen, the current syllable highlighted — and every word here goes through it. Its one risk that
this lesson makes sharper: **highlighting part of a joined word** means styling part of a run of joined letters,
and a highlighted قَا inside قَالَ must stay joined to the لَ after it. That is the fix's to solve and check, in
lessons 4–6, before these words arrive. `06` §2.

## 3. The walkthrough: three words

```js
'fatha-alif': [
  { root: [['ق', 'fatha-alif'], ['ل', 'fatha']], syll: ['qaa', 'la'], meaning: 'he said' },
  { root: [['ز', 'fatha-alif'], ['ر', 'fatha']], syll: ['zaa', 'ra'], meaning: 'he visited' },
  { root: [['ك', 'kasra'], ['ت', 'fatha-alif'], ['ب', 'dammatain']], syll: ['ki', 'taa', 'bun'], meaning: 'a book' },
],
```

Chosen so the three together show everything the board says:

1. **قَالَ** *qaala*, "he said" — the alif **joins on** after qaaf. The commonest long-aa word there is.
2. **زَارَ** *zaara*, "he visited" — the alif **stands on its own** after zaa, and the raa after it stands on its
   own too: three separate shapes in one word, which is the joined example's second half, in a real word.
3. **كِتَابٌ** *kitaabun*, "a book" — the long vowel **in the middle**, with a zair before it (Lesson 5) and two
   paish after it (Lesson 7). Every lesson of marks so far, in one word.

## 4. The warning: the mushaf spells many of these differently

**These are Arabic words in ordinary spelling. They are not quotations of the Qur'an and must never be labelled
as if they were.**

The Madani mushaf writes a great many long-aa words **without a full alif**, using a small upright alif above the
letter instead (U+0670) — كِتَابٌ is **كِتَٰبٌ** there, سَلَامٌ is **سَلَٰمٌ**, and the same is true of words in the
first page of the mushaf. An Indo-Pak mushaf does the same with its own form of that mark. That mark is **Lesson
9**, and it is the strongest reason Lesson 9 follows this one directly.

So:

- **Never** put "from the Qur'an" or an ayah reference beside any of these words, on this page or the exercise
  page. The rule for real Qur'anic text is unchanged — exact text from Tanzil or Quran.com, never typed
  (`QAIDA-CONTENT.md`, "Content rules") — and that text would carry marks the student has not learnt yet.
- The verbs (*qaala*, *kaana*) are written with a full alif in the mushaf as well. The nouns often are not. None
  of that is a reason to change the list; it is a reason to keep the list honest about what it is.

## 5. `exercise-8.html`: twelve words

In `exercise.js`'s `WORDS`, the same shape as the twelve for lessons 4–6 — glyphs only, no meanings, no
transliteration on the page (the comments are for whoever checks them):

```js
'fatha-alif': [
  [['ق', 'fatha-alif'], ['ل', 'fatha']],                          // qaala, "he said"
  [['ك', 'fatha-alif'], ['ن', 'fatha']],                          // kaana, "he was"
  [['ص', 'fatha-alif'], ['م', 'fatha']],                          // saama, "he fasted"
  [['خ', 'fatha-alif'], ['ف', 'fatha']],                          // khaafa, "he feared"
  [['ز', 'fatha-alif'], ['ر', 'fatha']],                          // zaara, "he visited"
  [['س', 'fatha-alif'], ['ف', 'fatha'], ['ر', 'fatha']],          // saafara, "he travelled"
  [['س', 'fatha-alif'], ['ع', 'fatha'], ['د', 'fatha']],          // saa'ada, "he helped"
  [['ب', 'fatha-alif'], ['ب', 'dammatain']],                      // baabun, "a door"
  [['د', 'fatha-alif'], ['ر', 'dammatain']],                      // daarun, "a house"
  [['ط', 'fatha'], ['ع', 'fatha-alif'], ['م', 'dammatain']],      // ta'aamun, "food"
  [['س', 'fatha'], ['ل', 'fatha-alif'], ['م', 'dammatain']],      // salaamun, "peace"
  [['ك', 'kasra'], ['ت', 'fatha-alif'], ['ب', 'dammatain']],      // kitaabun, "a book"
],
```

What the twelve cover, so the teacher can judge the mix rather than the words one by one:

- **Seven verbs, five nouns.** The verbs are past tense, "he …", like lessons 4–6's; the nouns end in two paish,
  which Lesson 7 taught.
- **The alif joining** (قَالَ, كَانَ…), **standing apart** (زَارَ, دَارٌ — both three separate shapes) and **as one
  shape with laam** (سَلَامٌ).
- **The long vowel first** (most), **in the middle** (طَعَامٌ, سَلَامٌ, كِتَابٌ) and **followed by more letters**
  (سَافَرَ, سَاعَدَ).
- **No ه anywhere, on purpose.** Noto Naskh, the Indo-Pak stand-in, draws ہ broken between letters (`02` §5); a
  word that is broken for half the students is not a good exercise until the font is fixed.
- **Only marks the student has met by Lesson 8**: zabar, zair, two paish, and zabar-and-alif. No sukoon, no
  shadda, no standing mark.

**Every one of these is Claude's candidate, not the teacher's.** Check each word and each spelling before it ships
— the same care as the aayat — and swap any the teacher would not teach. It is a list, not code.

## 6. What does not change

- **`spell.js`** gains a `'fatha-alif'` entry in `WORDS` and nothing else (once the pending fix has reshaped it).
- **`exercise.js`** gains a `'fatha-alif'` entry in `WORDS`, and the three `data-soon` lines for a Next button
  that has nowhere to go yet (`04` §8).
- **No audio** in either, still: "no speech for now" (the user, 2026-09-27) holds until the teacher records words.
