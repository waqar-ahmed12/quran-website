# 03 — Code changes

**The rule:** lessons 4–14 come out byte-identical. The fence (`06` §2) snapshots every glyph and every
`masteredCount` of lessons 4–14, in both scripts, before anything changes.

## 1. `cp` may be a list

A row's `cp` is one code point today. Lesson 15's own mark is **two marks on one letter** (a vowel and the shadda).
Lesson 9's `forms` already allow a list (`cp: [0x064E, 0x0670]`), so the base row catches up:

```js
// A row's own marks: one code point, or (Lesson 15, docs/lesson-15/03 §1) a list of them on the same letter.
const cpsOf = (mark) => [].concat(mark.cp);
const suffixOf = (mark) => String.fromCharCode(...cpsOf(mark), ...(mark.tail || []));
```

and in `formOf`, `cp: own ? own.cp || cpsOf(mark) : cpsOf(mark)` (the `|| cpsOf(mark)` is Lesson 12's recommended
hardening; if Lesson 12 already added `|| [mark.cp]`, change it to `cpsOf(mark)`). Every existing row has a number
there, and `[].concat(n)` is `[n]`, so **nothing earlier changes**.

**`shell.js`'s `masteredCount`** reads the lesson row's `cp` the same way: a number, a list of numbers (Lesson 7),
and now **a list of lists** (one suffix per mark, each two code points):

```js
const suffixes = entry && entry.cp ? [].concat(entry.cp).map((cp) => String.fromCharCode(...[].concat(cp)) + tail) : [];
```

Lesson 15's row: `cp: [[0x064E, 0x0651], [0x0650, 0x0651], [0x064F, 0x0651]]`. The length test then counts only
three-character ids (a letter and two marks). The twins (بَ بْ, two characters) are never counted.

## 2. The rows, and `sits` per script

In the fourth `MARKS` statement, after Lesson 14's `sukun`:

```js
// Lesson 15 (docs/lesson-15/): the shadda, a letter said twice. Three rows, one per vowel, as Lesson 7's doubled marks:
// the vowel FIRST and the shadda last (docs/lesson-15/02 §2), so the halo rings the shadda. Every item is drawn after
// Lesson 14's lead. `against`: the same letter once with the vowel and once with a jazam, the two halves of a shadda
// (docs/lesson-15/01 §3). The Madina mushaf draws a kasra under a shadda ABOVE the letter; the Indo-Pak mushaf under
// the letter (docs/lesson-15/02 §3), so that row says where it sits per script. The code points are the same.
'shadda-fatha': {
  id: 'shadda-fatha', cp: [0x064E, 0x0651], names: { fatha: 'shadda and fatha', zabar: 'tashdeed and zabar' },
  sits: 'above', lesson: 15, audio: 'shadda-fatha', lead: [0x0627, 0x064E],
  first: MARKS.fatha.first, sample: 'ب', against: ['fatha', 'sukun'], skip: ['ا', 'ء'],
},
'shadda-kasra': {
  id: 'shadda-kasra', cp: [0x0650, 0x0651], names: { fatha: 'shadda and kasra', zabar: 'tashdeed and zair' },
  sits: 'below', lesson: 15, audio: 'shadda-kasra', lead: [0x0627, 0x064E],
  first: MARKS['standing-kasra'].first, sample: 'د', against: ['kasra', 'sukun'], skip: ['ا', 'ء'],
  forms: { madani: { cp: [0x0650, 0x0651], sits: 'above' } }, // ONLY if 02 §3's measurement confirms it
},
'shadda-damma': {
  id: 'shadda-damma', cp: [0x064F, 0x0651], names: { fatha: 'shadda and damma', zabar: 'tashdeed and paish' },
  sits: 'above', lesson: 15, audio: 'shadda-damma', lead: [0x0627, 0x064E],
  first: MARKS.damma.first, sample: 'ب', against: ['damma', 'sukun'], skip: ['ا', 'ء'],
},
```

and a set, beside `tanween` and `standing`:

```js
shadda: { id: 'shadda', lesson: 15, names: { fatha: 'shadda', zabar: 'tashdeed' },
  marks: ['shadda-fatha', 'shadda-kasra', 'shadda-damma'] },
```

**`sits` per script:** `formOf` returns `sits: (own && own.sits) || mark.sits` beside `cp` and `tail`, and
`markTile` reads `marks.formOf(strokeOf).sits` for `data-sits`. It is one field in each place. Every earlier row has
no `forms.*.sits`, so every earlier tile sits exactly where it did.

## 3. The twin's lead

Lesson 14's `twinItems` draws every twin with the page's lead (`leadOf(mark)`). In Lesson 15's last part the twins
are the **other two shadda rows**, which carry their own lead. So the rule becomes `leadOf(other) || leadOf(mark)`:
a twin with its own lead draws it, and one without (the plain vowels, the jazam) takes the page's. Lesson 14 is
unchanged, because its twins have none. The same in `boardRows` for `others[].glyph`.

## 4. The hum line

A `<p class="hum-note">` on the board: "On noon and meem, a {set} is held with a hum through the nose. This is called
*ghunna*." It is shown **when the open part's rows include ن or م** (parts 1, 3 and 4), and `null` on every other page.
It uses `renderBoard`'s existing `say()`, so `{set}` is "tashdeed" or "shadda".

## 5. `spell.js`: a letter said twice

A walkthrough letter carrying a shadda row gets its own line, as Lesson 14's jazam did: `data-shadda-line`, "{name}
with {mark}: said twice — it closes the sound before it and starts its own: {sound}". Its `syll` is the doubled
consonant with its vowel (`rra`), and the blend step after it reads the whole ("marra"). The traditional order is
"meem zabar ma, raa tashdeed zabar marra". No change to `stepsFor`.

## 6. `qaida-words-check.js`: two rules

- a shadda row is **never on a word's first letter** (that is the article's shadda, Lesson 18, in copied Qur'an words);
- a shadda row is **never on ا**.

## 7. `shell.js`: the second pass arrives on the home

- **Lessons 15–29 join `LESSONS`**, with titles and ledes from `docs/pass-2/README.md` §2, and `built: false` except
  15. Every one gets a card, "Comes later", and nothing is locked.
- **`home.js`**: two headed groups, "Learning to read" (1–14) and "Reading the Qur'an" (15–29). A `part` field on each
  row says which. The progress bar measures all 29, and "how far the student has reached" still reads right.
- **Lesson 14's Next becomes ordinary**: `nextEntry()` now finds Lesson 15, so its `data-last` is never read, and it
  moves to Lesson 29 when that is built (`docs/lesson-14/03` §8).

## 8. Audio

`manifest.json` gains `"shadda-fatha": {}`, `"shadda-kasra": {}` and `"shadda-damma": {}`. `recordings.html` shows **81**
rows, 27 per group, each drawn with the lead (Lesson 14's draw site 8). Lesson 14's description line for a row with a
lead covers these: "The sound "ab-ba": alif with fatha, then Baa with shadda and fatha."

## 9. Options panel

Nothing new. The board row offers "auto" (the quartet in the warm-ups and the last part, as Lesson 7), and `hasTail`
is true because of the lead.
