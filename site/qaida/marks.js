// The free Qaida, Lessons 4 to 7: the data layer. QAIDA-BUILD.md step 6 (lessons 4-6) and step 8 (lesson 7); the
// specifications are docs/lesson-4/ through docs/lesson-7/. One file for every mark lesson. Zabar (4), zair (5) and
// paish (6) are the same lesson with a different stroke; tanween (7) is the same three strokes written twice. What
// differs is a row of MARKS and the wording; nothing else. No DOM and no storage here, so tools/qaida-check.js can
// load it in node and check the items, the ids and the part arithmetic without a browser. mark-lesson.js is the
// page and decides nothing in this file.
//
// The mark is composed, never pasted (docs/lesson-4/02 §1): a combining mark typed into source is invisible in
// every editor and diff, survives one careless edit and then silently vanishes. Always String.fromCharCode.

(() => {
  // `first`: the six letters a student meets the mark on. They are chosen for THIS mark (docs/lesson-5/02 §3): the
  // ones whose shape stays out of its way. Above and below are not the same six. `sample` is the one letter that
  // stands for the lesson in the title and on the rail. `against`: the mark(s) this one is shown against, in the
  // order they were taught; their letters ride along as the wrong answers (docs/lesson-5/03 §2, docs/lesson-6/03
  // §1). The first mark has none, the third has two, and the FIRST of the list is the nearest contrast: paish's is
  // zabar (same place, another shape), not the zair that happens to come just before it.
  const MARKS = {
    fatha: {
      id: 'fatha', cp: 0x064E, names: { fatha: 'fatha', zabar: 'zabar' }, sits: 'above', lesson: 4, audio: 'fatha',
      first: ['ب', 'د', 'ر', 'س', 'م', 'ل'], sample: 'ب', against: [],
    },
    kasra: {
      id: 'kasra', cp: 0x0650, names: { fatha: 'kasra', zabar: 'zair' }, sits: 'below', lesson: 5, audio: 'kasra',
      // None has a dot underneath and none dips below the line, so the mark sits in clear space. د is also in fatha's six.
      first: ['ا', 'د', 'ت', 'ط', 'ك', 'ه'], sample: 'د', against: ['fatha'],
    },
    damma: {
      id: 'damma', cp: 0x064F, names: { fatha: 'damma', zabar: 'paish' }, sits: 'above', lesson: 6, audio: 'damma',
      first: ['ب', 'د', 'ر', 'س', 'م', 'ل'], sample: 'ب', against: ['fatha', 'kasra'],
    },
  };

  // The doubled marks (Lesson 7, docs/lesson-7/02 §1): the same three strokes, written twice, each adding an "n" to
  // the sound — one fatha is "ba", two is "ban". A second statement, because an object literal cannot reference
  // itself (docs/lesson-7/03 §1): `first` is BORROWED, not copied, from the single mark's own row, so a later
  // change to Lesson 4's six letters follows here too. `against` is the single counterpart, and only it — the
  // doubled fatha is told from the single fatha, not from kasra or damma; the other two tanweens are a different
  // list, built per part in mark-lesson.js (docs/lesson-7/03 §5), not from `against`.
  Object.assign(MARKS, {
    // fixes/lesson 7/fixes.txt, 2026-09-27: "i don't want fathatain, like no tathnia, and no 'do zabar' — two zabar
    // or two fatha is good." The `id`/`audio` stay the Arabic technical terms (folder and key names, never shown);
    // only what the student reads changed.
    fathatain: {
      id: 'fathatain', cp: 0x064B, names: { fatha: 'two fatha', zabar: 'two zabar' }, sits: 'above', lesson: 7,
      audio: 'fathatain', first: MARKS.fatha.first, sample: 'ب', against: ['fatha'],
    },
    kasratain: {
      id: 'kasratain', cp: 0x064D, names: { fatha: 'two kasra', zabar: 'two zair' }, sits: 'below', lesson: 7,
      audio: 'kasratain', first: MARKS.kasra.first, sample: 'د', against: ['kasra'],
    },
    dammatain: {
      id: 'dammatain', cp: 0x064C, names: { fatha: 'two damma', zabar: 'two paish' }, sits: 'above', lesson: 7,
      audio: 'dammatain', first: MARKS.damma.first, sample: 'ب', against: ['damma'],
    },
    // Lesson 8 (docs/lesson-8/): zabar, and an alif after it — the long aa. The first mark followed by a LETTER:
    // `tail` is what comes after the mark, as code points (composed, never pasted: lessons 10 and 12's tails carry
    // a sukun, so the field is composed everywhere, docs/lesson-8/02 §1). `skip`: the letters this mark is never
    // written on (docs/lesson-8/02 §2). `first` is zabar's own six with laam swapped out, because laam and alif
    // together (never pasted here either — the same rule, one Arabic ligature) is one joined
    // shape and part 1 should show the alif doing its ordinary thing (docs/lesson-8/02 §4).
    'fatha-alif': {
      id: 'fatha-alif', cp: 0x064E, tail: [0x0627], names: { fatha: 'fatha and alif', zabar: 'zabar and alif' },
      sits: 'above', lesson: 8, audio: 'fatha-alif',
      first: MARKS.fatha.first.map((key) => (key === 'ل' ? 'ن' : key)), sample: 'ب', against: ['fatha'],
      skip: ['ا', 'ء'],
    },
    // Lesson 10 (docs/lesson-10/): zabar, then a wow with a jazam — "au". The jazam is Lesson 14's mark, carried
    // here inside the TAIL as part of the pattern, never as a mark of its own (docs/lesson-10/README.md). `first` is
    // zabar's own six, laam included: laam and wow are not a ligature (docs/lesson-10/02 §2). `against` is in the
    // order taught — zabar, then zabar and alif — so the board reads the whole road, short to long to "au", and
    // {other} is "zabar" (docs/lesson-10/01 §3 put the alif first; with the twins alternating per letter, the order
    // only decides which comes first).
    'fatha-waw': {
      id: 'fatha-waw', cp: 0x064E, tail: [0x0648, 0x0652], names: { fatha: 'fatha and waw', zabar: 'zabar and wow' },
      sits: 'above', lesson: 10, audio: 'fatha-waw',
      first: MARKS.fatha.first, sample: 'ب', against: ['fatha', 'fatha-alif'],
      skip: ['ا', 'ء'],
      // Measured 2026-09-28 (docs/lesson-10/02 §3): Scheherazade New draws U+0652 as a small circle and U+06E1 as
      // the open head-of-khaa the Madani mushaf prints, so Madani draws U+06E1. The id stays U+0652 (suffixOf never
      // reads `forms`), so a switch of script keeps every letter's credit. Indo-Pak draws U+0652, whatever the font.
      forms: { madani: { cp: [0x064E], tail: [0x0648, 0x06E1] } },
    },
  });

  // Lesson 9 (docs/lesson-9/): the long vowels again, written as a MARK instead of a letter — khari zabar, khari
  // zair, ulta paish. The id stays one code point, the Indo-Pak one, the same in both scripts (docs/lesson-9/03 §2):
  // `cp` never changes with the script, only the DRAWING does. `forms` holds only the script that writes it
  // differently (docs/lesson-9/02 §2) — a script with no entry here draws `cp` (and `tail`) exactly as every row
  // always has, which is why lessons 4-8 need no `forms` at all and come out byte-identical (the fence in
  // tools/qaida-check.js). `same` is new (docs/lesson-9/03 §7): the mark whose SOUND this one shares — khari zabar
  // is Lesson 8's "baa" again, so its board shows that spelling beside it, never among the answers (docs/lesson-9/01 §3).
  Object.assign(MARKS, {
    'standing-fatha': {
      id: 'standing-fatha', cp: 0x0670, names: { fatha: 'standing fatha', zabar: 'khari zabar' }, sits: 'above',
      lesson: 9, audio: 'fatha-alif', first: MARKS['fatha-alif'].first, sample: 'ب', against: ['fatha'],
      skip: ['ا', 'ء'], same: 'fatha-alif',
      forms: { madani: { cp: [0x064E, 0x0670] } },
    },
    'standing-kasra': {
      id: 'standing-kasra', cp: 0x0656, names: { fatha: 'standing kasra', zabar: 'khari zair' }, sits: 'below',
      lesson: 9, audio: 'kasra-yaa', first: ['ه', 'د', 'ت', 'ط', 'ك', 'ف'], sample: 'ه', against: ['kasra'],
      skip: ['ا', 'ء'],
      forms: { madani: { cp: [0x0650], tail: [0x06E6] } },
    },
    'inverted-damma': {
      id: 'inverted-damma', cp: 0x0657, names: { fatha: 'inverted damma', zabar: 'ulta paish' }, sits: 'above',
      lesson: 9, audio: 'damma-waw', first: ['ب', 'د', 'ر', 'س', 'م', 'ه'], sample: 'ه', against: ['damma'],
      skip: ['ا', 'ء'],
      forms: { madani: { cp: [0x064F], tail: [0x06E5] } },
    },
  });

  // Lessons 11-14 (docs/lesson-11/ to docs/lesson-14/). A fourth statement, after Lesson 9's, because these rows
  // borrow from it (`same`, and Lesson 13's `first`).
  Object.assign(MARKS, {
    // Lesson 11 (docs/lesson-11/): paish, then a wow - the long "oo". The minimal pair against Lesson 10 is the point
    // of the lesson, so Lesson 10's row is in `against` (docs/lesson-11/01 §2). `same`: Lesson 9's ulta paish is this
    // sound written as a mark, shown beside it on the board and never among the answers (docs/lesson-9/01 §3). The
    // Indo-Pak mushaf puts a jazam on the wow and the Madani mushaf leaves it bare (docs/lesson-11/02 §2): the base
    // row is the Indo-Pak spelling, so the id is the same in both scripts (suffixOf never reads `forms`).
    'damma-waw': {
      id: 'damma-waw', cp: 0x064F, tail: [0x0648, 0x0652], names: { fatha: 'damma and waw', zabar: 'paish and wow' },
      sits: 'above', lesson: 11, audio: 'damma-waw',
      first: MARKS.damma.first, sample: 'ب', against: ['damma', 'fatha-waw'],
      skip: ['ا', 'ء'], same: 'inverted-damma',
      forms: { madani: { cp: [0x064F], tail: [0x0648] } },
    },
    // Lesson 12 (docs/lesson-12/): zabar, then a yaa with a jazam - "ai". Lesson 10 with a yaa for the wow. The yaa is
    // a letter the two scripts write differently (Madani U+064A, Indo-Pak U+06CC, dotless at the end of a word), so
    // BOTH scripts draw from `forms` (docs/lesson-12/02 §2) - the first row with two. The id follows the two rules
    // every earlier id already does: the letter folds to Madani (U+064A, as shell.keyOf folds ی) and the mark is the
    // Indo-Pak code point (U+0652). So suffixOf gives one id in both scripts and neither script's drawing is it.
    // `against`: short "ba", then Lesson 10's "au" - the nearest contrast, one letter apart (docs/lesson-12/01 §2).
    'fatha-yaa': {
      id: 'fatha-yaa', cp: 0x064E, tail: [0x064A, 0x0652], names: { fatha: 'fatha and yaa', zabar: 'zabar and yaa' },
      sits: 'above', lesson: 12, audio: 'fatha-yaa',
      first: MARKS.fatha.first, sample: 'ب', against: ['fatha', 'fatha-waw'],
      skip: ['ا', 'ء'],
      forms: {
        madani: { cp: [0x064E], tail: [0x064A, 0x06E1] },
        indopak: { cp: [0x064E], tail: [0x06CC, 0x0652] },
      },
    },
    // Lesson 13 (docs/lesson-13/): zair, then a yaa - the long "ee". Lesson 11's shape with Lesson 12's letter: the
    // minimal pair is Lesson 12's row, `same` is Lesson 9's khari zair (shown beside it, never an answer), Indo-Pak
    // marks the yaa with a jazam and Madani leaves it bare, and the yaa itself differs by script, so both scripts draw
    // from `forms` and the id is the Madani letter with the Indo-Pak mark (docs/lesson-12/02 §2). `first` is khari
    // zair's six (docs/lesson-9/02 §4): zair's own six less the alif, which never carries this.
    'kasra-yaa': {
      id: 'kasra-yaa', cp: 0x0650, tail: [0x064A, 0x0652], names: { fatha: 'kasra and yaa', zabar: 'zair and yaa' },
      sits: 'below', lesson: 13, audio: 'kasra-yaa',
      first: MARKS['standing-kasra'].first, sample: 'ف', against: ['kasra', 'fatha-yaa'],
      skip: ['ا', 'ء'], same: 'standing-kasra',
      forms: {
        madani: { cp: [0x0650], tail: [0x064A] },
        indopak: { cp: [0x0650], tail: [0x06CC, 0x0652] },
      },
    },
    // Lesson 14 (docs/lesson-14/): the jazam on any letter. A jazam has no sound on its own, so every item on this
    // lesson's page is drawn after a vowelled alif, the LEAD (docs/lesson-14/02 §2): drawn, never asked, never part of
    // an id. The id is the letter and the jazam, two characters, so masteredCount needs no change. `against`: the same
    // letter with a vowel instead, "a-ba" against "ab" (docs/lesson-14/01 §2). `skip`: alif is always long or silent and
    // never a closed consonant, and hamza's seat differs by script (docs/lesson-14/02 §3). The id and `audio` are the
    // Arabic technical term, like `fathatain`: folder and key names, never shown. Madani draws U+06E1, the head-of-khaa
    // Lesson 10 measured; the id stays U+0652 because suffixOf never reads `forms`.
    sukun: {
      id: 'sukun', cp: 0x0652, names: { fatha: 'sukoon', zabar: 'jazam' }, sits: 'above', lesson: 14, audio: 'sukun',
      first: MARKS.fatha.first, sample: 'ب', against: ['fatha', 'kasra', 'damma'],
      skip: ['ا', 'ء'], lead: [0x0627, 0x064E],
      forms: { madani: { cp: [0x06E1] } },
    },
    // Lesson 15 (docs/lesson-15/): the shadda, a letter said twice. Three rows, one per vowel, as Lesson 7's doubled marks.
    // `cp` is a LIST: the vowel FIRST and the shadda last (docs/lesson-15/02 §2), so the halo rings the shadda, and the id
    // is the letter, the vowel and U+0651 - three characters, the same in both scripts. Every item is drawn after Lesson
    // 14's lead (the first half of a shadda closes the syllable before it). `against`: the same letter once with the vowel
    // and once with a jazam, the two halves of a shadda (docs/lesson-15/01 §3). `sits`: 'above' on all three, kasra
    // included - measured 2026-09-29 (docs/lesson-15/02 §3): Scheherazade New AND Noto Naskh both draw a kasra under a
    // shadda ABOVE the letter, and only Amiri Quran keeps it below, so no per-script `sits` is needed with the faces the
    // site has. Lesson 14's sukun (a jazam) is `against` here, so its Madani form is drawn from its own `forms`.
    'shadda-fatha': {
      id: 'shadda-fatha', cp: [0x064E, 0x0651], names: { fatha: 'shadda and fatha', zabar: 'tashdeed and zabar' },
      sits: 'above', lesson: 15, audio: 'shadda-fatha', lead: [0x0627, 0x064E],
      first: MARKS.fatha.first, sample: 'ب', against: ['fatha', 'sukun'], skip: ['ا', 'ء'],
    },
    'shadda-kasra': {
      id: 'shadda-kasra', cp: [0x0650, 0x0651], names: { fatha: 'shadda and kasra', zabar: 'tashdeed and zair' },
      sits: 'above', lesson: 15, audio: 'shadda-kasra', lead: [0x0627, 0x064E],
      first: MARKS['standing-kasra'].first, sample: 'د', against: ['kasra', 'sukun'], skip: ['ا', 'ء'],
    },
    'shadda-damma': {
      id: 'shadda-damma', cp: [0x064F, 0x0651], names: { fatha: 'shadda and damma', zabar: 'tashdeed and paish' },
      sits: 'above', lesson: 15, audio: 'shadda-damma', lead: [0x0627, 0x064E],
      first: MARKS.damma.first, sample: 'ب', against: ['damma', 'sukun'], skip: ['ا', 'ء'],
    },
  });

  // The letters that never join the one after them (QAIDA-CONTENT.md's Lesson 3 group, less the alif — د ذ ر ز و,
  // docs/lesson-8/02 §3): after one of these, an alif stands on its own instead of joining on. Used only to pick
  // which letters illustrate the joined/apart contrast on a board (mark-lesson.js); it changes no shape — Arabic
  // fonts already join or don't on their own.
  const NEVER_JOIN = ['د', 'ذ', 'ر', 'ز', 'و'];

  // A lesson usually teaches one mark. Lesson 7 teaches three (the doubled marks), in the order they are drilled,
  // and Lesson 9 (standing harakaat) will teach three more the same way. A page naming a single mark
  // (`data-mark="damma"`) gets a list of one, which is exactly what lessons 4, 5 and 6 already are.
  const SETS = {
    tanween: {
      id: 'tanween', lesson: 7, names: { fatha: 'tanween', zabar: 'tanween' },
      marks: ['fathatain', 'kasratain', 'dammatain'],
    },
    standing: {
      id: 'standing', lesson: 9, names: { fatha: 'standing marks', zabar: 'standing harakaat' },
      marks: ['standing-fatha', 'standing-kasra', 'inverted-damma'],
    },
    shadda: {
      id: 'shadda', lesson: 15, names: { fatha: 'shadda', zabar: 'tashdeed' },
      marks: ['shadda-fatha', 'shadda-kasra', 'shadda-damma'],
    },
  };
  const setOf = (id) => SETS[id] || null;
  // What data-mark names: a set (several marks, in lesson order) or a single mark (a list of one).
  const marksOf = (id) => {
    const set = SETS[id];
    if (set) return set.marks.map((key) => MARKS[key]).filter(Boolean);
    return MARKS[id] ? [MARKS[id]] : [];
  };

  const markOf = (id) => MARKS[id] || null;
  // What the STUDENT reads. The recordings are keyed by mark.audio and never by this: the names are per student.
  const nameOf = (mark, shell) => mark.names[shell.state.names === 'zabar' ? 'zabar' : 'fatha'];
  // What follows the letter: its mark, and — for a mark followed by a letter (Lesson 8's alif; lessons 10-13's wow
  // and yaa) — that letter too. An item's id is the letter's key plus this, so it is one character on lessons 4-7
  // (unchanged) and longer wherever there is a tail (docs/lesson-8/03 §2).
  // A row's own marks: one code point, or (Lesson 15, docs/lesson-15/03 §1) a list of them on the same letter - a vowel
  // and a shadda. `[].concat(n)` is `[n]`, so every earlier row reads exactly as it did.
  const cpsOf = (mark) => [].concat(mark.cp);
  const suffixOf = (mark) => String.fromCharCode(...cpsOf(mark), ...(mark.tail || []));

  // Which script is drawn right now. Read from the shell rather than passed in, so a call site that forgets to pass
  // it still draws the page's own script (docs/lesson-9/README.md's second likely mistake) — glyphOf has four
  // callers outside this file and none of them needs to change.
  const scriptNow = () => (window.qaidaShell && window.qaidaShell.state.script) || 'madani';

  // What a mark looks like in a script: its own marks (combining, on the letter) and its tail (letters after it).
  // Only Lesson 9 has a script that draws differently (docs/lesson-9/03 §3): every other mark has no `forms`, so
  // this is `[mark.cp]` and `mark.tail || []` for every script, and drawnOf(mark) === suffixOf(mark) exactly — the
  // fence tools/qaida-check.js proves for lessons 4-8.
  const formOf = (mark, script = scriptNow()) => {
    const own = mark.forms && mark.forms[script];
    return {
      // A form without its own `cp` draws the row's (docs/lesson-12/03 §1): without this fallback a form that omits
      // it would throw in drawnOf and take the whole page down, not one tile.
      cp: own ? own.cp || cpsOf(mark) : cpsOf(mark),
      tail: own ? own.tail || [] : mark.tail || [],
    };
  };
  const drawnOf = (mark, script) => {
    const f = formOf(mark, script);
    return String.fromCharCode(...f.cp, ...f.tail);
  };
  const glyphOf = (letter, mark, script) => letter + drawnOf(mark, script);
  // What is drawn IN FRONT of every item on a lesson's page (docs/lesson-14/02 §2): Lesson 14's vowelled alif, because
  // a jazam has no sound on its own. Drawn, never asked, never part of an id. A form may carry its own (docs/lesson-14/
  // 07 §3), read first. Every other row has none, so this is '' and every glyph of lessons 4-13 is unchanged (the
  // fence in tools/qaida-check.js). glyphOf itself does not change: spell.js, exercise.js and audio.js call it for words
  // and for other lessons' items, and none of them wants a lead in front of a letter in the middle of a word.
  const leadOf = (mark, script = scriptNow()) => {
    const form = mark && mark.forms && mark.forms[script];
    const lead = (form && form.lead) || (mark && mark.lead);
    return lead ? String.fromCharCode(...lead) : '';
  };
  // A bare combining mark has nothing to sit on, so the dotted circle (U+25CC) is its base: what the character is for.
  const aloneOf = (mark, script) => String.fromCharCode(0x25CC) + drawnOf(mark, script);
  // The same letter twice, beside itself, so the mark can be seen to travel with it (docs/lesson-4/04 §3c). Neighbours
  // join on their own, so no joiner is needed; it is a letter beside itself and not a word. Unchanged for a tailed
  // mark's own sake (docs/lesson-8/03 §8): mark-lesson.js's renderBoard draws Lesson 8's joined example differently,
  // from NEVER_JOIN, rather than call this with a tail and get "baa" repeated as if it were one made-up word.
  const joinedOf = (letter, mark) => glyphOf(letter, mark).repeat(2);

  const cap = (text) => (text ? text[0].toUpperCase() + text.slice(1) : '');
  // {mark} zabar, {Mark} Zabar, {name} Baa. Anything else is left as written, so a stray brace shows itself.
  const fill = (text, values) => String(text || '').replace(/\{(\w+)\}/g, (whole, key) => (key in values ? values[key] : whole));
  // {other} is the mark this one is shown against ("the same stroke as zabar"), in the student's own word for it; {others} is all
  // of them, "zabar and zair". The joiner is English and lives here so that one text field serves a line naming both.
  const othersOf = (mark) => (mark.against || []).map((id) => MARKS[id]).filter(Boolean);
  const otherOf = (mark) => othersOf(mark)[0] || null;
  function wordsFor(mark, shell) {
    const names = othersOf(mark).map((m) => nameOf(m, shell));
    const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] || '';
    const first = names[0] || '';
    return {
      mark: nameOf(mark, shell), Mark: cap(nameOf(mark, shell)), other: first, Other: cap(first), others: list, Others: cap(list),
    };
  }

  const TEMPLATES = { marked: '{name} with {mark}', bare: '{name}' };

  // The two groups (docs/lesson-4/09 §2, the recommendation): six letters to meet the mark on, then all of them. Which six is
  // the mark's own (`first`). Part 2 is every letter. Kept for tools/qaida-check.js, which asks about the first mark's six,
  // and as the one-mark default everywhere below: COUNT and DRILLING are the one-mark case (lessons 4, 5 and 6); a lesson
  // with several marks (Lesson 7) works out its own from partsOf(), below.
  const GROUP_ONE = MARKS.fatha.first;
  const COUNT = 2;
  const DRILLING = [1, 2];

  // The parts of a lesson, in order (docs/lesson-7/03 §3). One mark: meet it on six letters, then all of them —
  // lessons 4, 5 and 6, unchanged. Several marks: meet each one on its own six, one part per mark, then all the
  // letters with all of them in the mix. The last part's `mark` is the lesson's first (its own word, "tanween",
  // comes from the page's `{set}` token, not from any one part).
  function partsOf(list) {
    if (list.length < 2) return [{ n: 1, mark: list[0], first: true }, { n: 2, mark: list[0], first: false }];
    return [
      ...list.map((m, i) => ({ n: i + 1, mark: m, first: true })),
      { n: list.length + 1, mark: list[0], first: false, every: true },
    ];
  }

  // Which mark a letter carries in an "every" part: its place in the alphabet, modulo the number of marks the
  // lesson has. Deterministic (the pool must not reshuffle when the page redraws), and it spreads the marks evenly
  // over the letters (docs/lesson-7/03 §4). With one mark this always returns that one mark — the one-mark case
  // needs no special path at all.
  const markAt = (list, index) => list[index % list.length];

  // The engine only guarantees that ONE wrong answer shares a tag with the right one, so what the wrong answers look like
  // is decided by which tags exist, not by their order (docs/lesson-4/03 §4).
  //   look-alike:  another letter that looks like it, the mark being the same on both: "which letter is this?"
  //   mark-or-not: the same letter, bare: "does this one carry the mark?"
  //   which-mark:  the same letter, the other mark: "which mark is this, and where does it sit?" It emits the same tag as
  //                mark-or-not; what differs is which twin is built beside the item (reviewPlan in mark-lesson.js).
  //   any:         no tags
  function familyFor(key, distractors, looks) {
    if (distractors === 'mark-or-not' || distractors === 'which-mark') return [`letter:${key}`];
    if (distractors === 'any') return [];
    const tags = [];
    looks.forEach((members, n) => members.includes(key) && tags.push(`look${n}`));
    return tags;
  }

  // The 29 marked items, in the chosen script, for the marks (and parts) a lesson holds. `own` is usually a single
  // mark object (lessons 4, 5 and 6 — the one-mark case, still the common path) but may be a list (Lesson 7's three
  // doubled marks); either way it is turned into a list of parts (partsOf) and every (letter, mark) pair the lesson
  // actually uses becomes one item, carrying every part it belongs to (docs/lesson-7/03 §4): a letter met in a
  // warm-up AND drilled again in the last part is the SAME item, the same id, so the credit is not split. The id
  // folds to Madani and the glyph does not, so a student who learnt baa with its mark in Indo-Pak keeps the credit
  // after switching (docs/lesson-4/02 §2).
  function allItems(shell, own, options = {}) {
    const { templates = TEMPLATES, distractors = 'look-alike', looks = [] } = options;
    const list = Array.isArray(own) ? own : [own];
    const parts = partsOf(list);
    const names = new Map(shell.lettersOf().map(([glyph, name]) => [shell.keyOf(glyph), { glyph, name }]));
    const byId = new Map();

    const itemFor = (key, mark) => {
      const id = key + suffixOf(mark);
      let item = byId.get(id);
      if (!item) {
        const found = names.get(key) || { glyph: key, name: '' };
        const words = wordsFor(mark, shell);
        item = {
          id,
          glyph: leadOf(mark) + glyphOf(found.glyph, mark), // the lead is '' on every lesson but 14 (docs/lesson-14/03 §2)
          name: fill(templates.marked, { ...words, name: found.name }),
          family: familyFor(key, distractors, looks),
          audio: { kind: mark.audio, glyph: found.glyph }, // the SOUND, "ba", not the letter's name
          required: false,
          traceable: true, // two characters, but say so: the engine's own default is not this lesson's to rely on
          base: found.glyph, // lesson-only: the tracer, the audio lookup and the bare twin use it
          key,
          letterName: found.name,
          markName: words.mark,
          marked: true,
          mark: mark.id, // whose stroke this is: "one of the lesson's own" is item.parts.includes(n) (docs/lesson-5/03 §4)
          parts: [],
        };
        byId.set(id, item);
      }
      return item;
    };

    // The last part first, in alphabet order (shell.lettersOf()'s own order), so the common one-mark case returns
    // exactly what it always has: 29 items, in alphabet order, most of them gaining a second part below. One mark:
    // that mark, for all 29 (markAt degenerates to it). Several: the rotation docs/lesson-7/03 §4 sets out — a
    // letter that lands on its warm-up mark is not a bug, it is the same item gaining a second part.
    const last = parts[parts.length - 1];
    if (!last.first || last.every) {
      // The rotation index is the letter's place in the MADANI order, always — never the active script's own order
      // (which can differ, docs/lesson-7/03 §4's own warning about Indo-Pak's و/ه swap): otherwise the same letter
      // could land on a different tanween depending on the script, and Madani/Indo-Pak would produce different id
      // sets, breaking the one thing every mark lesson promises (switching script keeps every letter's credit).
      const madaniOrder = shell.lettersOf('madani').map(([glyph]) => shell.keyOf(glyph));
      const keys = shell.lettersOf().map(([glyph]) => shell.keyOf(glyph));
      keys.forEach((key) => {
        const at = madaniOrder.indexOf(key);
        const mark = markAt(list, at < 0 ? 0 : at);
        // A letter this mark is never written on (Lesson 8's ا and ء, docs/lesson-8/02 §2): no item at all, not a
        // required one that never appears. `skip` is read here and in boardRows, nowhere else needs to know.
        if ((mark.skip || []).includes(key)) return;
        const item = itemFor(key, mark);
        if (!item.parts.includes(last.n)) item.parts.push(last.n);
      });
    }
    // Every warm-up part: its own mark, on its own six letters. Already-seen (letter, mark) pairs just gain this
    // part; a pair the last part did not happen to land on becomes a new item, appended after the 29 (Lesson 7's
    // ب, say, needs both a fathatain item and a dammatain item, and at most one of them is the rotated one).
    for (const part of parts) {
      if (!part.first) continue;
      for (const key of part.mark.first) {
        if ((part.mark.skip || []).includes(key)) continue;
        const item = itemFor(key, part.mark);
        if (!item.parts.includes(part.n)) item.parts.push(part.n);
      }
    }

    return [...byId.values()];
  }

  // The same letters with an OTHER mark, for the wrong answers: in Lesson 5 the contrast that means something is above
  // against below (baa with zair against baa with zabar), and bare against marked is one the student already has (docs/lesson-5/03 §2). `keys` says
  // which letters, deterministically: the open part's own, so every item has its twin. They are review, never required, and
  // in no part, so sizes(), stats() and poolFor() never count them. The id ends in the other mark, so it cannot collide with an
  // item of this lesson's or with a bare letter. `marks` says which of the other marks to build from: the page decides (a lesson
  // with two of them may want one twin per letter, docs/lesson-6/03 §4, or a doubled mark's own twins by part, docs/lesson-7/03
  // §5) and this builds what it is told. Default: all of them, against the mark passed in (kept for the one-mark call sites).
  function twinItems(shell, mark, options = {}) {
    const { keys = [], templates = TEMPLATES, distractors = 'which-mark', looks = [], marks: wanted = othersOf(mark) } = options;
    if (!wanted.length || !keys.length) return [];
    const names = new Map(shell.lettersOf().map(([glyph, name]) => [shell.keyOf(glyph), { glyph, name }]));
    return wanted.flatMap((other) => {
      const words = wordsFor(other, shell);
      return keys.filter((key) => names.has(key)).map((key) => {
        const { glyph, name } = names.get(key);
        return {
          id: key + suffixOf(other),
          // The twin is "baa with zabar, after the alif", drawn on THIS page: the other mark's own lead if it has one
          // (Lesson 15's twins will), else the lesson's (docs/lesson-14/03 §2, §8). Lesson 14's twins carry none of their
          // own, so they draw the lesson's.
          glyph: (leadOf(other) || leadOf(mark)) + glyphOf(glyph, other),
          name: fill(templates.marked, { ...words, name }),
          family: familyFor(key, distractors, looks),
          audio: { kind: other.audio, glyph }, // the other mark's SOUND, "ba", not the letter's name
          required: false,
          traceable: true,
          base: glyph,
          key,
          letterName: name,
          markName: words.mark, // the OTHER mark's word: the verdict names what the letter actually carries
          marked: true,
          mark: other.id,
          parts: [], // review: in no part
        };
      });
    });
  }

  // Which letters ride along, bare. Deterministic on purpose: the pool must not reshuffle every time the page redraws.
  // In order of use: the open group's own letters when the question is "does this carry the mark?" (so a bare twin exists to
  // be the wrong answer), then the ones this student found hard in Lesson 2, then a spread across the shape families so a
  // student who skipped Lesson 2 still gets a fair sample (docs/lesson-4/03 §3).
  function reviewKeys(shell, count, prefer = [], mark = null) {
    const letters = shell.lettersOf();
    const keys = letters.map(([glyph]) => shell.keyOf(glyph));
    const record = shell.drillOf(2);
    const chosen = [];
    const take = (key) => {
      if (chosen.length < count && keys.includes(key) && !chosen.includes(key)) chosen.push(key);
    };
    prefer.forEach(take);

    // Mixed review reaches back (docs/lesson-5/03 §2, docs/lesson-6/03 §6): the letters missed in Lesson 2, and, when this mark
    // has others before it, the letters missed in each of those lessons. Their ids are the letter and its mark, so a letter is
    // the first character.
    const earlier = (mark ? othersOf(mark) : []).map((m) => ({ rec: shell.drillOf(m.lesson), suffix: suffixOf(m) }));
    const shaky = (rec, id) => (rec.wrong[id] || 0) > 0 && (rec.streak[id] || 0) < (rec.target || 3);
    const hard = keys
      .map((key, i) => {
        let wrong = shaky(record, key) ? record.wrong[key] : 0;
        for (const { rec, suffix } of earlier) if (shaky(rec, key + suffix)) wrong += rec.wrong[key + suffix];
        return { key, i, wrong };
      })
      .filter((entry) => entry.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong || a.i - b.i);
    hard.forEach((entry) => take(entry.key));

    // Round-robin over the shape families, one letter from each in turn.
    const families = shell.familiesOf().map((members) => members.map((i) => keys[i]).filter(Boolean));
    for (let round = 0; chosen.length < count && round < 4; round += 1) {
      for (const family of families) take(family[round]);
    }
    keys.forEach(take);
    return chosen;
  }

  // The bare letters that ride along. `id` has no mark in it, so it can never collide with the marked letter; `required` is false because
  // review is never the gate (the user, 2026-09-19).
  function reviewItems(shell, mark, options = {}) {
    const { count = 8, prefer = [], templates = TEMPLATES, distractors = 'look-alike', looks = [] } = options;
    const wanted = Math.max(0, Math.min(Math.round(Number(count)) || 0, 29));
    if (!wanted) return [];
    const names = new Map(shell.lettersOf().map(([glyph, name]) => [shell.keyOf(glyph), { glyph, name }]));
    const words = wordsFor(mark, shell);
    return reviewKeys(shell, wanted, prefer, mark).map((key) => {
      const { glyph, name } = names.get(key);
      return {
        id: key,
        glyph,
        name: fill(templates.bare, { ...words, name }),
        // Its own marked twin, and the look-alike tags: either way of choosing wrong answers finds it.
        family: familyFor(key, distractors, looks),
        audio: { kind: 'letters', glyph }, // Lesson 2's recording: the letter's NAME, which is what this item is
        required: false,
        traceable: true,
        base: glyph,
        key,
        letterName: name,
        markName: words.mark,
        marked: false,
        mark: null,
        parts: [],
      };
    });
  }

  // What the drill is handed for one part: that part's marked letters, all required. A student on part 1 is asked about
  // part 1 (the user, 2026-09-20, on Lesson 3: "i shouldn't be seeing the letters of other groups"). An item can belong to
  // more than one part (docs/lesson-7/03 §4: a letter met in a warm-up and drilled again in the last part is one item), so
  // "is it one of the lesson's own, and is it in this part" is simply item.marked && item.parts.includes(n).
  const inPart = (item, n) => item.marked && item.parts.includes(n);
  const poolFor = (items, n) => items.filter((item) => inPart(item, n)).map((item) => ({ ...item, required: true }));

  // The names changed (or the mark set, or a line of wording): the same items with new names, so the engine keeps them. A twin
  // carries the other mark, so its words are that mark's.
  function rename(items, shell, mark, templates = TEMPLATES) {
    const names = new Map(shell.lettersOf().map(([glyph, name]) => [shell.keyOf(glyph), name]));
    for (const item of items) {
      const own = item.mark && MARKS[item.mark] ? MARKS[item.mark] : mark;
      const words = wordsFor(own, shell);
      item.letterName = names.get(item.key) || '';
      item.markName = words.mark;
      item.name = fill(item.marked ? templates.marked : templates.bare, { ...words, name: item.letterName });
    }
  }

  // How big each part is. `parts` is a list of part numbers (the one-mark default, [1, 2]) or of part objects
  // (partsOf()'s own return, which mark-lesson.js already holds) — either works, since only `.n` is read.
  const sizes = (items, parts = [1, 2]) => parts.map((p) => (typeof p === 'object' ? p.n : p))
    .map((n) => items.filter((item) => inPart(item, n)).length);

  // How a group is going, worked out from what the shell holds. The engine only measures the group it was handed and the
  // rail wants both at once. The rule is the engine's: ready is enough known and nothing missed still shaky.
  function stats(shell, lesson, items, group, { target = 2, readyAt = 0.7, clean = true } = {}) {
    const record = shell.drillOf(lesson);
    const needed = items.filter((item) => inPart(item, group));
    const known = needed.filter((item) => (record.streak[item.id] || 0) >= target).length;
    const toFix = needed.filter((item) => (record.wrong[item.id] || 0) > 0 && (record.streak[item.id] || 0) < target).length;
    const total = needed.length;
    const ready = total > 0 && known / total >= readyAt - 1e-9 && (!clean || toFix === 0);
    return { total, known, toFix, ready };
  }

  // The board: one row per letter shown, the bare letter beside the marked one(s). `part` says which letters (its own six
  // in a warm-up, all 29 in the last part — docs/lesson-7/03 §8 lets the page pass either a part object or a plain
  // number, 1 or 2, for the one-mark case). `others` is supplied by the page: the mark(s) this row is shown against, in
  // display order — the nearer contrast in a warm-up (docs/lesson-6), or the OTHER doubled marks in Lesson 7's last part
  // (docs/lesson-7/03 §8), never assumed here.
  function boardRows(shell, mark, part, options = {}) {
    const p = typeof part === 'object' ? part : { n: part, first: part === 1, every: part !== 1 };
    const { others = othersOf(mark) } = options;
    const keys = p.every || !p.first ? null : mark.first;
    const skip = mark.skip || [];
    // The lead goes in front of the marked tile and every "other" tile, never the bare letter (docs/lesson-14/03 §2).
    const lead = leadOf(mark);
    return shell.lettersOf()
      .filter(([glyph]) => !keys || keys.includes(shell.keyOf(glyph)))
      .filter(([glyph]) => !skip.includes(shell.keyOf(glyph)))
      .map(([glyph, name]) => ({
        key: shell.keyOf(glyph), glyph, name, marked: lead + glyphOf(glyph, mark), joined: joinedOf(glyph, mark),
        others: others.map((m) => ({ id: m.id, glyph: (leadOf(m) || lead) + glyphOf(glyph, m), name: nameOf(m, shell) })),
      }));
  }

  // A letter of the part, in the chosen script, to stand for it on the rail: the mark's own sample for a warm-up, and a
  // letter that hangs below the line for the last part (in every mark's list), so the taller stroke has always been seen
  // before it matters.
  function sampleOf(shell, mark, part) {
    const p = typeof part === 'object' ? part : { first: part === 1, every: part !== 1 };
    const key = p.every || !p.first ? 'ع' : mark.sample;
    const found = shell.lettersOf().find(([glyph]) => shell.keyOf(glyph) === key);
    return found ? leadOf(mark) + glyphOf(found[0], mark) : '';
  }

  window.qaidaMarks = {
    MARKS, TEMPLATES, GROUP_ONE, COUNT, DRILLING, NEVER_JOIN,
    SETS, setOf, marksOf, partsOf, markAt,
    markOf, otherOf, othersOf, nameOf, cpsOf, suffixOf, formOf, drawnOf, glyphOf, leadOf, aloneOf, joinedOf, wordsFor, fill, cap,
    allItems, twinItems, reviewItems, reviewKeys, poolFor, inPart, rename, sizes, stats, boardRows, sampleOf,
  };
})();
