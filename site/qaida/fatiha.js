// The free Qaida, Lesson 23: Al-Fatiha. The kit of the VERSE page (verses.js): which note each word of the surah carries and which lesson
// taught it, and the three words the page spells through. QAIDA-BUILD.md step P3; docs/lesson-23/01-design.md is the reason for every line.
//
// NO ARABIC IS TYPED HERE. A word is named by reference, "surah:verse:position", and the page draws it from verse-words.js, which
// tools/fetch-qaida-verses.js copied from Quran.com in both scripts, unmodified (docs/pass-2/02 §3). What this file adds to a word is only
// what the Qaida says about it: the lessons that explain it. The notes are the Qaida's own wording (data-note-* on lesson-23.html, a text
// field each) and never a comment on the meaning.
//
// Every note carries a test of the word's own text, `has`, so tools/qaida-lesson23-check.js can prove a note is TRUE of the word in both
// scripts, and that no mark in a word goes unexplained (docs/lesson-23/01 §4). The tests read the text only: they are not used to draw it.

(() => {
  const SURAHS = (window.qaidaSurahs = window.qaidaSurahs || {});

  // A word split into the units a student sees: a letter with every mark that sits on it (and a tatweel it is stretched over). Only a letter
  // starts a unit, so a joined word is never cut through a join and a mark is never alone. Used by the page, the walk-through and the check.
  SURAHS.unitsOf = SURAHS.unitsOf || ((text) => {
    const out = [];
    for (const ch of text) {
      if (!out.length || /\p{Lo}/u.test(ch)) out.push(ch);
      else out[out.length - 1] += ch;
    }
    return out;
  });
  const unitsOf = SURAHS.unitsOf;

  const codes = (text) => [...text].map((c) => c.codePointAt(0));
  const hasAny = (text, list) => codes(text).some((c) => list.includes(c));
  const follows = (text, first, next) => {
    const c = codes(text);
    return c.some((code, i) => code === first && next.includes(c[i + 1]));
  };

  const FATHA = 0x064E;
  const KASRA = 0x0650;
  const DAMMA = 0x064F;
  const SHADDA = 0x0651;
  const SMALL_ALIF = 0x0670;
  const ALIF = 0x0627;
  const ALIF_WASLA = 0x0671;
  const LAAM = 0x0644;
  const MEEM = 0x0645;
  const NOON = 0x0646;
  const HAA = 0x0647;
  const WAW = [0x0648];
  const YAA = [0x064A, 0x06CC];
  const JAZAM = { madani: 0x0652, indopak: 0x06E1 }; // Quran.com's two code points for the one mark (docs/pass-2/01 §1)
  const VOWEL = { fatha: FATHA, kasra: KASRA, damma: DAMMA };
  // The seven heavy letters of Lesson 27: khaa, saad, daad, taa, zaa, ghayn, qaaf.
  const HEAVY = [0x062E, 0x0635, 0x0636, 0x0637, 0x0638, 0x063A, 0x0642];
  const HAMZA_LETTERS = [0x0621, 0x0623, 0x0624, 0x0625, 0x0626];
  const MADDA = [0x0622, 0x0653, 0x06E4];
  const STOP_SIGNS = [0x06D6, 0x06D7, 0x06D8, 0x06D9, 0x06DA, 0x06DB, 0x0615]; // the signs stop.js (Lesson 22) teaches

  const isLetter = (unit) => /^\p{Lo}/u.test(unit);
  const letterOf = (unit) => codes(unit)[0];
  const lettersOnly = (text) => unitsOf(text).map(letterOf);
  const afterFirst = (text) => unitsOf(text).slice(1); // the word without its first unit, as units
  // A first mark followed by a second that is a bare letter: no shadda and no vowel of its own on it (a doubled yaa after a hamza is not a long "ee").
  const longOf = (text, first, next) => {
    const c = codes(text);
    return c.some((code, i) => code === first && next.includes(c[i + 1]) && ![SHADDA, FATHA, KASRA, DAMMA].includes(c[i + 2]));
  };
  // A first mark, a letter, and the jazam on it, which is how "aw" and "ai" are written in either script.
  const closedBy = (text, first, next, script) => {
    const c = codes(text);
    return c.some((code, i) => code === first && next.includes(c[i + 1]) && c[i + 2] === JAZAM[script]);
  };

  // Al- : a word that begins with the alif and the laam of the article. Madani writes the alif as one sign of its own (the joining alif);
  // Indo-Pak writes an ordinary alif, bare when the word is joined to the one before and with its vowel when you start on it.
  const hasArticle = (text) => {
    const u = unitsOf(text);
    return u.length > 2 && letterOf(u[1]) === LAAM && [ALIF, ALIF_WASLA].includes(letterOf(u[0]));
  };
  // The vowel written on the first letter, in Indo-Pak, where the alif carries it when a word is started on.
  const startMarked = (text, mark) => codes(unitsOf(text)[0]).slice(1).includes(mark);

  // KINDS: the lesson that taught it, and whether it is TRUE of a word's text in a script (`arg` is a vowel for the kinds that take one).
  const KINDS = {
    standing: { lesson: 9, has: (t) => hasAny(t, [SMALL_ALIF]) },
    zabarWaw: { lesson: 10, has: (t, s) => closedBy(t, FATHA, WAW, s) },
    longOo: { lesson: 11, has: (t) => longOf(t, DAMMA, WAW) },
    zabarYaa: { lesson: 12, has: (t, s) => closedBy(t, FATHA, YAA, s) },
    longEe: { lesson: 13, has: (t) => longOf(t, KASRA, YAA) },
    longAa: { lesson: 8, has: (t) => follows(t, FATHA, [ALIF]) },
    jazam: { lesson: 14, has: (t, s) => hasAny(t, [JAZAM[s]]) },
    shadda: { lesson: 15, has: (t) => hasAny(t, [SHADDA]) },
    // A hamza on an alif: Madani draws the hamza on its seat, Indo-Pak leaves the alif bare with the hamza's vowel on it (docs/lesson-16).
    // The hamza can sit on any unit of the word (a word that opens with "wa" has it second), so every unit is looked at.
    hamza: {
      lesson: 16,
      has: (t, s, arg) => unitsOf(t).some((u) => (s === 'indopak' ? letterOf(u) === ALIF : HAMZA_LETTERS.includes(letterOf(u))) && codes(u).slice(1).includes(VOWEL[arg])),
    },
    // The name of Allah: the two laams, and the haa. Madani writes the shadda on the second laam; Indo-Pak leaves the name of Allah with no shadda when it
    // stands alone (rule-words.js holds it both ways), so the note says the laams run together and does not name the mark.
    allah: { lesson: 18, has: (t) => { const l = lettersOnly(t); return l.length >= 3 && l[l.length - 1] === HAA && l[l.length - 2] === LAAM && l[l.length - 3] === LAAM; } },
    // Al- before a sun letter: the next letter carries the shadda and the laam is not read. Before a moon letter the laam has a jazam and is read.
    sun: { lesson: 18, has: (t) => hasArticle(t) && afterFirst(t).length > 1 && codes(afterFirst(t)[1]).includes(SHADDA) },
    moon: { lesson: 18, has: (t, s) => hasArticle(t) && codes(afterFirst(t)[0]).includes(JAZAM[s]) },
    // The joining alif: a word that begins with it and stands inside a verse is joined to the word before, so its alif is skipped (Lesson 19). A
    // word that opens a verse starts on its alif, and Lesson 19 says with which vowel (`arg`).
    joined: { lesson: 19, has: (t, s) => (s === 'madani' ? letterOf(unitsOf(t)[0]) === ALIF_WASLA : letterOf(unitsOf(t)[0]) === ALIF && !startMarked(t, FATHA) && !startMarked(t, KASRA) && !startMarked(t, DAMMA)) },
    // Indo-Pak marks the vowel of the alif you start on, except on Al-, which is always started with a zabar and which it prints bare when the verse opens
    // with it (Quran.com's 1:3:1), so the zabar of an Al- is true of the word and not marked on it.
    start: {
      lesson: 19,
      has: (t, s, arg) => (s === 'madani' ? letterOf(unitsOf(t)[0]) === ALIF_WASLA
        : letterOf(unitsOf(t)[0]) === ALIF && (startMarked(t, VOWEL[arg]) || (arg === 'fatha' && hasArticle(t)))),
    },
    madd: { lesson: 20, has: (t) => hasAny(t, MADDA) },
    // Every verse ends with a stop (Lesson 22). True of the last word of a verse; the check proves the position, not the text.
    stop: { lesson: 22, has: () => true, atVerseEnd: true },
    // A small stop sign printed after the word: Indo-Pak puts one at most verse ends (and one inside verse 7). Lesson 22's list says what each means.
    sign: { lesson: 22, has: (t) => hasAny(t, STOP_SIGNS) },
    // The three that come in a later lesson: the page says so, and the check only proves the word has the letter they are about.
    noonClear: { lesson: 24, has: (t) => hasAny(t, [NOON]) },
    meemClear: { lesson: 25, has: (t) => { const u = unitsOf(t); return letterOf(u[u.length - 1]) === MEEM; } },
    heavy: { lesson: 27, has: (t) => lettersOnly(t).some((c) => HEAVY.includes(c)) },
  };

  // The notes, by reference. An entry is a kind, or [kind, vowel] for the kinds that name one. Listed in the order a student would meet them
  // reading the word: its beginning, then its middle, then its end. A note is listed once, and the page shows it only where it is TRUE of the word in the
  // student's own script (`has`): the two mushafs print some words differently (a standing zabar in one is an alif in the other, and Indo-Pak puts a jazam
  // on a yaa and a stop sign at most verse ends where Madani prints neither), so this is what a word can carry and the script picks.
  const NOTES = {
    '1:1:1': ['jazam'],
    '1:1:2': ['joined', 'allah'],
    '1:1:3': ['joined', 'sun', 'standing', 'jazam'],
    '1:1:4': ['joined', 'sun', 'longEe', 'jazam', 'stop'],
    '1:2:1': [['start', 'fatha'], 'moon', 'jazam'],
    '1:2:2': ['allah', 'standing'],
    '1:2:3': ['shadda'],
    '1:2:4': ['joined', 'moon', 'jazam', 'standing', 'longEe', 'sign', 'stop'],
    '1:3:1': [['start', 'fatha'], 'sun', 'standing', 'jazam'],
    '1:3:2': ['joined', 'sun', 'longEe', 'jazam', 'sign', 'stop'],
    '1:4:1': ['standing'],
    '1:4:2': ['zabarWaw', 'jazam'],
    '1:4:3': ['joined', 'sun', 'longEe', 'jazam', 'sign', 'stop'],
    '1:5:1': [['hamza', 'kasra'], 'shadda', 'longAa'],
    '1:5:2': ['jazam'],
    '1:5:3': [['hamza', 'kasra'], 'shadda', 'longAa'],
    '1:5:4': ['jazam', 'longEe', 'sign', 'stop'],
    '1:6:1': [['start', 'kasra'], 'jazam', 'longAa'],
    '1:6:2': ['joined', 'sun', 'standing', 'longAa', 'heavy'],
    '1:6:3': ['joined', 'moon', 'jazam', 'longEe', 'heavy', 'sign', 'stop'],
    '1:7:1': ['standing', 'longAa', 'heavy'],
    '1:7:2': ['joined', 'shadda', 'longEe', 'jazam'],
    '1:7:3': [['hamza', 'fatha'], 'jazam', 'noonClear'],
    '1:7:4': ['zabarYaa', 'jazam', 'meemClear', 'sign'],
    '1:7:5': ['zabarYaa', 'jazam', 'heavy'],
    '1:7:6': ['joined', 'moon', 'jazam', 'longOo', 'heavy'],
    '1:7:7': ['zabarYaa', 'jazam', 'meemClear'],
    '1:7:8': ['longAa'],
    '1:7:9': ['joined', 'sun', 'heavy', 'longAa', 'madd', 'shadda', 'longEe', 'jazam', 'stop'],
  };

  // The three words the page spells through, one piece at a time (docs/lesson-23/01 §6): a doubled letter, the article with a heavy letter, and
  // the longest word of the surah. `cuts` are the unit indices where a new piece begins, per script (the two texts are not cut the same way);
  // `sounds` has one entry for every piece, and `whole` is the word said through. These sounds are candidates, to be checked by the teacher, and
  // the one place the Qaida spells a sound out.
  const WALK = [
    { ref: '1:2:3', sounds: ['ra', 'bbi'], whole: 'rab-bi', cuts: { madani: [1], indopak: [1] } },
    { ref: '1:6:2', sounds: ['as-si', 'raa', 'ta'], whole: 'as-si-raa-ta', cuts: { madani: [3, 4], indopak: [3, 4] } },
    { ref: '1:7:9', sounds: ['ad-da', 'aa', 'llee', 'na'], whole: 'ad-daa-llee-na', cuts: { madani: [3, 4, 6], indopak: [3, 4, 6] } },
  ];

  SURAHS['1'] = { lesson: 23, kinds: KINDS, notes: NOTES, walk: WALK };
})();
