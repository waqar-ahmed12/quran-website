// The free Qaida, Lesson 20: THE WAVY LINE (madd). QAIDA-BUILD.md step P2; the specification is docs/lesson-20/ (01 is this file). A wavy line
// over a long vowel says: hold it longer. A long vowel with no line is held for its usual length. With the line, it is held LONGER before
// a hamza (in the same word, or at the start of the next word), and LONGEST before a shadda. The page says "longer" and "longest" and the
// class's own name once (madd). The length itself is the teacher's recording to carry: no number is ever on the page.
//
// The fifth RULE kit, on Lesson 19's page and with its machinery: copied words and pairs of the Qur'an's own, never typed (docs/pass-2/02 §3).
// A word, or a pair of neighbouring words, is named by REFERENCE ONLY, "surah:verse:position" or "surah:verse:first-last", and its Arabic is
// in rule-words.js, which tools/fetch-qaida-words.js wrote from Quran.com in both scripts, unmodified; a pair is its two words with one space
// between. So no Arabic is typed in this file, and no combining mark either. The fetch tool reads the references straight out of this file
// (any quoted reference of that shape), so a word is named in one place only, and no other string of that shape may be quoted here.
//
// Registered in rules.js's KITS as `madd`, so rule-lesson.js reads a kit and never a rule's own functions (docs/lesson-17/01 §3). No DOM and no
// storage here, so tools/qaida-lesson20-check.js loads it in node. marks.js, mark-lesson.js, rules.js, ends.js, al.js, wasl.js and every
// earlier lesson are untouched: the fence in tools/qaida-check.js.

(() => {
  const marks = window.qaidaMarks;
  const rules = window.qaidaRules;
  if (!marks || !rules) return;

  const cc = (...codes) => String.fromCharCode(...codes);
  const fill = marks.fill;
  const scriptNow = () => (window.qaidaShell && window.qaidaShell.state.script) || 'madani';

  // What the page is about, as code points. U+0653 is the wavy line in both scripts; Indo-Pak also uses U+06E4 in some words, which no word
  // in this lesson holds (the check proves it), so a student meets one sign here and the other is left to the font note.
  const ALIF = 0x0627;
  const WAW = 0x0648;
  const YAA = 0x064A;
  const FATHA = 0x064E;
  const KASRA = 0x0650;
  const DAMMA = 0x064F;
  const JAZAM_I = 0x06E1; // Indo-Pak's jazam, which a long-vowel wow or yaa carries there (docs/pass-2/01 §2)
  const MADDAH = [0x0653, 0x06E4];

  // The five kinds of word (docs/lesson-20/01 §3). Every one is a mid-verse word or pair, in both scripts, holding only marks the student has met
  // and, in three kinds, the wavy line (the check proves each). `row` is the board's row; `parts` is "meet it in these parts" (parts [1, 3, 4]:
  // met in part 1, again in part 3 and in the last). `pair` says the tile is a WIDE one: two words are longer than one.
  //   plain      - a long vowel and no line: held for its usual length
  //   word       - a line, then a hamza in the same word: held longer
  //   plain-next - a long vowel at the end of a word and NO line, the next word an ordinary one: held for its usual length
  //   next       - a line on the last letter of a word, then a hamza at the start of the next word: held longer
  //   heavy      - a line, then a letter with a shadda: held longest
  const PLAIN = ['2:30:2', '2:75:6', '2:7:11', '2:23:16', '2:19:5'];
  const WORD = ['110:1:2', '2:22:10', '2:6:4', '2:133:3', '6:133:12'];
  const PLAIN_NEXT = ['2:228:11-12', '2:134:6-7', '3:93:8-9', '6:132:5-6'];
  const NEXT = ['2:27:9-10', '2:170:11-12', '2:99:8-9', '2:188:7-8', '2:175:8-9'];
  const HEAVY = ['2:258:5', '11:56:9', '79:34:3', '55:15:2', '56:51:4'];

  const forms = [
    ...PLAIN.map((ref) => ({ ref, kind: 'plain', row: 'plain', parts: [1, 4] })),
    ...WORD.map((ref) => ({ ref, kind: 'word', row: 'word', parts: [1, 3, 4] })),
    ...PLAIN_NEXT.map((ref) => ({ ref, kind: 'plain-next', row: 'plain-next', parts: [2, 4], pair: true })),
    ...NEXT.map((ref) => ({ ref, kind: 'next', row: 'next', parts: [2, 4], pair: true })),
    ...HEAVY.map((ref) => ({ ref, kind: 'heavy', row: 'heavy', parts: [3, 4] })),
  ];
  const MADD = { id: 'madd', lesson: 20, parts: 4, forms };
  rules.RULES.madd = MADD;

  // The words for the lesson's reading page (exercise-20.html): more of the Qur'an's own, none of them in the drill.
  const READING = [
    '2:101:18', '2:85:29', '5:66:22', // a line, then a hamza in the word
    '2:143:18-19', '2:106:9-10', // a line, then a hamza in the next word
    '3:65:4', '8:22:3', '2:233:23', // a line, then a shadda
    '2:31:9', '2:94:3', '2:116:8-9', '2:255:28-29', // no line
  ];

  // The walkthrough (spell.js): a word with a hamza, a pair and a word with a shadda, each in three steps. `sounds` are the first piece's and the
  // second's, and `whole` the whole said, a long vowel written with more letters where it is held longer. The one place a sound is spelled out,
  // as it has been since Lesson 4. Candidates: the teacher's own recording is what carries the length.
  const WALK = [
    { ref: '2:87:18', kind: 'word', sounds: ['jaaaa', 'akum'], whole: 'jaaaa-akum', meaning: 'came to you' },
    { ref: '2:151:1-2', kind: 'next', sounds: ['kamaaaa', 'arsalna'], whole: 'kamaaaa arsalna', meaning: 'just as We sent' },
    { ref: '3:61:2', kind: 'heavy', sounds: ['haaaaaa', 'jjaka'], whole: 'haaaaaa-jjaka', meaning: 'argues with you' },
  ];

  const data = () => (window.qaidaRuleWords && window.qaidaRuleWords.words) || {};
  const textOf = (ref, script = scriptNow()) => {
    const word = data()[ref];
    if (!word) return '';
    return script === 'indopak' ? word.indopak : word.madani;
  };

  // A word or a pair as letters with their marks: a base and every combining mark after it (the same cut as Lesson 19's: no dependence on a
  // browser that has Intl.Segmenter). The space between a pair's words is a base of its own, and tatweel is too.
  const lettersOf = (text) => text.match(/\P{M}\p{M}*/gu) || [];

  const formOf = (ref) => forms.find((form) => form.ref === ref) || WALK.find((entry) => entry.ref === ref) || null;
  const kindOf = (ref) => (formOf(ref) || { kind: '' }).kind;

  const baseOf = (unit) => unit.codePointAt(0);
  const marksOfUnit = (unit) => [...unit].slice(1).map((ch) => ch.codePointAt(0));
  const hasMadd = (unit) => marksOfUnit(unit).some((c) => MADDAH.includes(c));

  // The long vowel of a word with no line: an alif after a zabar, a wow after a paish or a yaa after a zair. In Indo-Pak the wow and the yaa
  // carry a jazam (docs/pass-2/01 §2); in Madani they are bare. A word's own first letter is never one (a long vowel follows a letter).
  function longVowelAt(units, to = units.length) {
    for (let i = 1; i < to; i += 1) {
      const base = baseOf(units[i]);
      const own = marksOfUnit(units[i]);
      const before = marksOfUnit(units[i - 1]);
      if (base === ALIF && own.length === 0 && before.includes(FATHA)) return i;
      if (base === WAW && before.includes(DAMMA) && own.every((c) => c === JAZAM_I)) return i;
      if (base === YAA && before.includes(KASRA) && own.every((c) => c === JAZAM_I)) return i;
    }
    return -1;
  }

  // The parts of a word the lesson is about, by position (docs/lesson-20/01 §4): the long vowel (with its line, where it has one) and what
  // comes after it that decides its length. A pair's second word is told by its space.
  //   long  - the long vowel
  //   carry - what follows it: the hamza, or the letter with the shadda
  function unitsOf(ref, script = scriptNow(), kind = kindOf(ref)) {
    const units = lettersOf(textOf(ref, script)).map((text) => ({ text, role: '', step: 0 }));
    const space = units.findIndex((unit) => unit.text === ' ');
    const pair = space >= 0;
    const mark = (at, role) => { if (units[at]) units[at].role = role; };
    let cut = -1;
    if (kind === 'plain') {
      cut = longVowelAt(units.map((unit) => unit.text));
      mark(cut, 'long');
    } else if (kind === 'plain-next') {
      mark(longVowelAt(units.map((unit) => unit.text), space), 'long');
    } else {
      const line = units.findIndex((unit) => hasMadd(unit.text));
      cut = line;
      mark(line, 'long');
      mark(kind === 'next' ? space + 1 : line + 1, 'carry');
    }
    // Which piece of the walkthrough a unit belongs to: a pair's first word and its second; a word's long vowel (and all before it) and the rest.
    units.forEach((unit, i) => { unit.step = pair ? (i <= space ? 0 : 1) : (i <= cut ? 0 : 1); });
    return units;
  }

  // The id is the reference: one fixed string, the same in both scripts (the rule of every id since Lesson 9), and never a word's Arabic, so a
  // switch of script keeps every credit.
  const idOf = (form) => form.ref;
  const glyphOf = (form, script = scriptNow()) => textOf(form.ref, script);
  const drawnOf = glyphOf;

  // The recordings would be the teacher's own words, one each, kept under the reference (audio/manifest.json, group `words`). None yet: the page
  // hears nothing until they arrive, and says so (docs/lesson-20/01 §7). When they do, the by-ear question ("which one says this?") opens by
  // itself for the words that have one, and this is the lesson where that question is the real test: the length is what is heard.
  const audioOf = (form) => ({ kind: 'words', glyph: form.ref });

  // The names: how long the long vowel is held. Three answers, five kinds (two kinds share "held normally" and two "held longer"); a word's
  // own letters are never in a name.
  const TEMPLATES = {
    plain: 'Held normally',
    word: 'Held longer',
    'plain-next': 'Held normally',
    next: 'Held longer',
    heavy: 'Held longest',
  };
  const nameOf = (form, shell, templates = TEMPLATES) => fill(templates[form.kind], {});
  const templatesOf = (d) => ({
    plain: d.namePlain, word: d.nameWord, 'plain-next': d.namePlainNext, next: d.nameNext, heavy: d.nameHeavy,
  });

  // One item per form, in the order above. `marked: true` and `parts` are what marks.poolFor, marks.stats and marks.sizes read, so the
  // engine's arithmetic is the mark lessons' own. `mark` is the word's ROW on the board, which the page's same-sound line follows. One question
  // is asked all through the lesson, so no `askGroup`.
  function itemsFor(shell, options = {}) {
    const { templates = TEMPLATES, script = scriptNow() } = options;
    return forms.map((form) => ({
      id: idOf(form),
      glyph: drawnOf(form, script),
      name: nameOf(form, shell, templates),
      family: [], // the answers are told apart by the wavy line and what follows it, not by a look-alike
      audio: audioOf(form),
      required: false,
      traceable: true,
      marked: true,
      mark: form.row,
      kind: form.kind,
      ref: form.ref,
      markName: '',
      parts: form.parts.slice(),
    }));
  }

  // The names changed: the same items with new names, so the engine keeps them.
  function rename(items, shell, templates = TEMPLATES) {
    const byId = new Map(forms.map((form) => [idOf(form), form]));
    for (const item of items) {
      const form = byId.get(item.id);
      if (!form) continue;
      item.name = nameOf(form, shell, templates);
    }
  }

  // The board: a list of words for each row (no line; a hamza in the word; no line before the next word; a hamza in the next word; a shadda),
  // so the page can draw each with its own heading. The whole map is on the board from part 1 (a word whose part is not open is drawn dim, never
  // hidden), as on Lessons 18 and 19.
  const ROWS = ['plain', 'word', 'plain-next', 'next', 'heavy'];
  const boards = () => ROWS.map((id) => ({ id, cells: forms.filter((form) => form.row === id) }));

  // The three words the strip shows on their own, one for each length: no line, a line before a hamza, a line before a shadda (the simplest of
  // each, docs/lesson-20/01 §3).
  const samples = () => [forms[0], forms[PLAIN.length], forms[forms.length - HEAVY.length + 1]];

  // Under a wrong answer: the same word again, with the places to look lit, and the line that says what they say. One line for each kind.
  const pascalOf = (id) => id.replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());
  const echoOf = (item) => ({
    line: `line${pascalOf(item.kind)}`,
    units: unitsOf(item.ref, scriptNow(), item.kind),
  });

  // The rail's sample for each part: the front of a real word, copied and cut at a letter (a word up to its long vowel with the line; the line, the
  // space and the first letter of the next word; the line and the letter with the shadda; a plain long vowel).
  const SAMPLES = [{ ref: WORD[0], to: 'line' }, { ref: NEXT[0], to: 'next' }, { ref: HEAVY[1], to: 'carry' }, { ref: PLAIN[0], to: 'plain' }];
  const partsOf = (rule = MADD) => Array.from({ length: rule.parts }, (_, i) => ({ n: i + 1, sample: SAMPLES[i] }));
  function sampleOf(part, script = scriptNow()) {
    const at = SAMPLES[Math.max(1, Math.min(MADD.parts, part)) - 1];
    const units = unitsOf(at.ref, script, kindOf(at.ref));
    const texts = units.map((unit) => unit.text);
    if (at.to === 'next') {
      const line = units.findIndex((unit) => hasMadd(unit.text));
      return texts.slice(line, line + 3).join('');
    }
    const last = units.findIndex((unit) => unit.role === (at.to === 'carry' ? 'carry' : 'long'));
    const first = at.to === 'carry' ? last - 1 : 0;
    return texts.slice(Math.max(0, first), last + 1).join('');
  }
  const inPart = (form, n) => form.parts.includes(n);
  const firstPartOf = (form) => form.parts[0];

  // The row the page's same-sound line starts on in each part, and whether a row is one of a part's own.
  const firstRow = (part) => ['word', 'next', 'heavy', 'plain'][Math.max(1, Math.min(MADD.parts, part)) - 1];
  const rowInPart = (row, part) => forms.some((form) => form.row === row && inPart(form, part));
  // The title's glyph is an alif with the wavy line, composed.
  const titleGlyph = () => cc(ALIF, MADDAH[0]);

  rules.KITS.madd = {
    board: 'words', byEar: true, formsOf: () => forms, partsOf, sampleOf, idOf, drawnOf, glyphOf, audioOf, itemsFor, rename, inPart, firstPartOf,
    templatesOf, titleGlyph, echoOf, boards, samples, unitsOf, lettersOf, firstRow, rowInPart, TEMPLATES,
    PLAIN, WORD, PLAIN_NEXT, NEXT, HEAVY, READING, WALK, textOf, kindOf, nameOf, longVowelAt, hasMadd,
  };
  // What spell.js and exercise.js read: a copied word or pair, drawn for the script in use.
  rules.wordText = textOf;
  rules.copiedUnits = unitsOf;
})();
