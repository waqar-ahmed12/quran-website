// The free Qaida, Lesson 19: THE JOINING ALIF. QAIDA-BUILD.md step P2; the specification is docs/lesson-19/ (01 is this file). Some words
// start with an alif that is read only when you START on the word. In the middle of a reading you skip it, and the sound runs on from the
// last vowel of the word before. A long vowel just before such an alif gives way and is read short. This is the alif of Al- (Lesson 18) and
// of a few other words, mostly verbs.
//
// The fourth RULE kit, and the first whose items are PAIRS of the Qur'an's own words: copied, never typed (docs/pass-2/02 §3). A word, or a
// pair of neighbouring words, is named by REFERENCE ONLY, "surah:verse:position" or "surah:verse:first-last", and its Arabic is in
// rule-words.js, which tools/fetch-qaida-words.js wrote from Quran.com in both scripts, unmodified; a pair is its two words with one space
// between. So no Arabic is typed in this file, and no combining mark either. The fetch tool reads the references straight out of this file
// (any quoted reference of that shape), so a word is named in one place only, and no other string of that shape may be quoted here.
//
// Registered in rules.js's KITS as `wasl`, so rule-lesson.js reads a kit and never a rule's own functions (docs/lesson-17/01 §3). No DOM
// and no storage here, so tools/qaida-lesson19-check.js loads it in node. marks.js, mark-lesson.js, rules.js, ends.js, al.js and every
// earlier lesson are untouched: the fence in tools/qaida-check.js.

(() => {
  const marks = window.qaidaMarks;
  const rules = window.qaidaRules;
  if (!marks || !rules) return;

  const cc = (...codes) => String.fromCharCode(...codes);
  const fill = marks.fill;
  const scriptNow = () => (window.qaidaShell && window.qaidaShell.state.script) || 'madani';

  // The six words that START a reading with the alif, two for each vowel it takes (docs/lesson-19/01 §3). Every one is the first word of
  // its verse, which is where the Indo-Pak mushaf prints the vowel on the alif, so the vowel declared here is the one Quran.com's own
  // Indo-Pak text carries (the check proves it). The Madani mushaf never prints it. The rule: a word with Al- starts with zabar; a verb
  // whose THIRD letter has paish starts with paish; any other starts with zair. `decide` is that third letter (a position in the word).
  const START = [
    { ref: '25:26:1', vowel: 'fatha' }, { ref: '40:46:1', vowel: 'fatha' },
    { ref: '1:6:1', vowel: 'kasra', decide: 2 }, { ref: '20:24:1', vowel: 'kasra', decide: 2 },
    { ref: '16:125:1', vowel: 'damma', decide: 2 }, { ref: '29:45:1', vowel: 'damma', decide: 2 },
  ];
  // Four more words said on their own, for part 2's other answer: the alif IS read (a different word from every one above).
  const READ = ['5:5:1', '2:197:1', '21:1:1', '28:32:1'];
  // Six where the alif is skipped. Five are a word and the word after it; the last is one printed word with a letter in front of the alif
  // (`alifAt` says which letter, counting from 0), which is how most of them come in the Qur'an.
  const JOINED = [
    { ref: '2:142:3-4' }, { ref: '2:80:10-11' }, { ref: '2:105:6-7' }, { ref: '2:22:3-4' }, { ref: '2:126:4-5' },
    { ref: '91:1:1', alifAt: 1 },
  ];
  // Four where a long vowel stands just before the joining alif and is read short, and four where it stands before an ordinary word and is
  // read long (docs/lesson-19/01 §3). Every pair is the same two words in a different order of kind: the lesson is what FOLLOWS the vowel.
  const SHORT = ['2:29:6-7', '2:143:7-8', '2:196:39-40', '2:139:3-4'];
  const KEEP = ['2:10:1-2', '2:164:2-3', '2:20:22-23', '2:97:8-9'];

  // `pair` says the tile is a WIDE one (two words, or a word with a letter in front of its alif: both are longer than a word on its own).
  // Which parts meet a form, and the board's row for it. `parts` is "meet it in these parts" (parts [2, 4]: met in part 2, and again in the
  // last). `row` is the board's row: a word said on its own is in the same row whether its alif is asked about by vowel or by "read".
  // `ask` is the question the form answers: one drill never offers an answer to another question (practice.js, `askGroup`).
  const forms = [
    ...START.map((w) => ({ ...w, kind: 'start', row: 'start', parts: [1, 4], ask: 'start' })),
    ...READ.map((ref) => ({ ref, kind: 'read', row: 'start', parts: [2, 4], ask: 'alif' })),
    ...JOINED.map((w) => ({ ...w, kind: 'joined', row: 'joined', parts: [2, 4], ask: 'alif', pair: true })),
    ...SHORT.map((ref) => ({ ref, kind: 'short', row: 'short', parts: [3, 4], ask: 'long', pair: true })),
    ...KEEP.map((ref) => ({ ref, kind: 'keep', row: 'keep', parts: [3, 4], ask: 'long', pair: true })),
  ];
  const WASL = { id: 'wasl', lesson: 19, parts: 4, forms };
  rules.RULES.wasl = WASL;

  // The words for the lesson's reading page (exercise-19.html): more of the Qur'an's own, none of them in the drill.
  const READING = [
    '2:23:16-17', '2:20:20-21', '2:127:5-6', '2:96:18-19', '2:154:6-7', '91:2:1', // joined
    '2:196:51-52', '2:247:33-34', '2:221:31-32', // a long vowel read short
    '2:154:5-6', '2:23:7-8', '2:142:16-17', // a long vowel read long
  ];

  // The walkthrough (spell.js): a pair joined, a pair with a long vowel shortened, and a word to start on, each in three steps. `sounds` are
  // the first piece's and the second's, and `whole` the whole said. The one place a sound is spelled out, as it has been since Lesson 4.
  const WALK = [
    { ref: '2:64:7-8', kind: 'joined', sounds: ['fadlu', 'l-laahi'], whole: 'fadlul-laahi', meaning: 'the favour of Allah' },
    { ref: '2:164:12-13', kind: 'short', sounds: ['fi', 'l-bahri'], whole: 'fil-bahri', meaning: 'in the sea' },
    { ref: '38:17:1', kind: 'start', sounds: ['i', 'sbir'], whole: 'isbir', meaning: 'be patient' },
  ];

  const data = () => (window.qaidaRuleWords && window.qaidaRuleWords.words) || {};
  const textOf = (ref, script = scriptNow()) => {
    const word = data()[ref];
    if (!word) return '';
    return script === 'indopak' ? word.indopak : word.madani;
  };

  // A word or a pair as letters with their marks: a base and every combining mark after it. Quran.com's texts hold nothing else in these
  // words (the check proves it), the space between a pair's words is a base of its own, and tatweel is a base too (its small alif attaches
  // to it). This is what Intl.Segmenter does for these texts, without depending on a browser that has it.
  const lettersOf = (text) => text.match(/\P{M}\p{M}*/gu) || [];

  const formOf = (ref) => forms.find((form) => form.ref === ref) || WALK.find((entry) => entry.ref === ref) || null;
  const kindOf = (ref) => (formOf(ref) || { kind: '' }).kind;

  // The parts of a word the lesson is about, by position (docs/lesson-19/01 §4): the alif that is or is not read, the letter the sound
  // runs on from or the long vowel before it, and for a verb the third letter, which decides the vowel it starts with. A pair's alif is
  // the first letter after its space; a word said alone has it first, and a word with a letter in front of it says where (`alifAt`).
  //   read   - the alif of a word you START on
  //   silent - the alif that is not read
  //   carry  - the letter a joined sound runs on from, and the third letter that decides a verb's first vowel
  //   short  - the long vowel read short;  long - the long vowel read long
  function unitsOf(ref, script = scriptNow(), kind = kindOf(ref)) {
    const meta = formOf(ref) || {};
    const units = lettersOf(textOf(ref, script)).map((text) => ({ text, role: '', step: 0 }));
    const space = units.findIndex((unit) => unit.text === ' ');
    const pair = space >= 0;
    const alif = pair ? space + 1 : meta.alifAt || 0;
    const before = pair ? space - 1 : alif - 1;
    const mark = (at, role) => { if (units[at]) units[at].role = role; };
    if (kind === 'start' || kind === 'read') {
      mark(alif, 'read');
      if (meta.decide) mark(meta.decide, 'carry');
    } else if (kind === 'joined') {
      mark(before, 'carry');
      mark(alif, 'silent');
    } else if (kind === 'short') {
      mark(before, 'short');
      mark(alif, 'silent');
    } else if (kind === 'keep') {
      mark(before, 'long');
    }
    // Which piece of the walkthrough a unit belongs to: a pair's first word and its second; a word's alif and the rest.
    units.forEach((unit, i) => { unit.step = pair ? (i <= space ? 0 : 1) : (i === 0 ? 0 : 1); });
    return units;
  }

  // The id is the reference: one fixed string, the same in both scripts (the rule of every id since Lesson 9), and never a word's Arabic, so a
  // switch of script keeps every credit.
  const idOf = (form) => form.ref;
  const glyphOf = (form, script = scriptNow()) => textOf(form.ref, script);
  const drawnOf = glyphOf;

  // The recordings would be the teacher's own words, one each, kept under the reference (audio/manifest.json, group `words`). None yet:
  // the page hears nothing until they arrive, and says so (docs/lesson-19/01 §7).
  const audioOf = (form) => ({ kind: 'words', glyph: form.ref });

  // The names: one template each, so a name is edited once and every name follows. The vowel of a start is the student's own word for it
  // (zabar or fatha), never a spelled sound.
  const TEMPLATES = {
    start: 'Start with {mark}',
    read: 'The alif is read',
    joined: 'The alif is not read',
    short: 'The long vowel is read short',
    keep: 'The long vowel is read long',
  };
  const markNameOf = (form, shell) => (form.vowel ? marks.nameOf(marks.markOf(form.vowel), shell) : '');
  const nameOf = (form, shell, templates = TEMPLATES) => fill(templates[form.kind], { mark: markNameOf(form, shell) });
  const templatesOf = (d) => ({
    start: d.nameStart, read: d.nameRead, joined: d.nameJoined, short: d.nameShort, keep: d.nameKeep,
  });

  // One item per form, in the order above. `marked: true` and `parts` are what marks.poolFor, marks.stats and marks.sizes read, so the
  // engine's arithmetic is the mark lessons' own. `mark` is the word's ROW on the board, which the page's same-sound line follows. `askGroup`
  // is what keeps a question about the starting vowel from being offered the answers of a question about the alif (practice.js).
  function itemsFor(shell, options = {}) {
    const { templates = TEMPLATES, script = scriptNow() } = options;
    return forms.map((form) => ({
      id: idOf(form),
      glyph: drawnOf(form, script),
      name: nameOf(form, shell, templates),
      family: [], // the answers are told apart by what the alif or the vowel does, not by a look-alike
      audio: audioOf(form),
      required: false,
      traceable: true,
      marked: true,
      mark: form.row,
      kind: form.kind,
      ref: form.ref,
      markName: markNameOf(form, shell),
      askGroup: form.ask,
      parts: form.parts.slice(),
    }));
  }

  // The names changed: the same items with new names, so the engine keeps them.
  function rename(items, shell, templates = TEMPLATES) {
    const byId = new Map(forms.map((form) => [idOf(form), form]));
    for (const item of items) {
      const form = byId.get(item.id);
      if (!form) continue;
      item.markName = markNameOf(form, shell);
      item.name = nameOf(form, shell, templates);
    }
  }

  // The board: a list of words for each row (on its own, joined, a long vowel read short, a long vowel read long), so the page can draw each
  // with its own heading. The whole map is on the board from part 1 (a word whose part is not open is drawn dim, never hidden), as on Lesson 18.
  const ROWS = ['start', 'joined', 'short', 'keep'];
  const boards = () => ROWS.map((id) => ({ id, cells: forms.filter((form) => form.row === id) }));

  // The three words the strip shows on their own, one for each vowel a word can start with: the simplest of each (docs/lesson-19/01 §3).
  // `caption` is which of the board's text fields says it.
  const samples = () => [
    { ...forms[0], caption: 'startFatha' },
    { ...forms[2], caption: 'startKasra' },
    { ...forms[4], caption: 'startDamma' },
  ];

  // Under a wrong answer: the same word again, with the places to look lit, and the line that says what they say. A start says which vowel
  // and why; the other kinds each have one line.
  const VOWEL_LINE = { fatha: 'lineStartFatha', kasra: 'lineStartKasra', damma: 'lineStartDamma' };
  const echoOf = (item) => ({
    line: item.kind === 'start' ? VOWEL_LINE[(formOf(item.ref) || {}).vowel] : `line${item.kind[0].toUpperCase()}${item.kind.slice(1)}`,
    units: unitsOf(item.ref, scriptNow(), item.kind),
  });
  // The question each item answers, for the line above the word (the page keeps one wording per question).
  const askOf = (item) => item.askGroup;

  // The rail's sample for each part: the front of a real word, copied and cut at a letter (an alif and its laam; the letter a joined sound
  // runs on from, the space and the alif; a long vowel, the space and the alif; and a start's own first letter).
  const SAMPLES = [{ ref: START[0].ref }, { ref: JOINED[0].ref, pair: true }, { ref: SHORT[0], pair: true }, { ref: START[2].ref, one: true }];
  const partsOf = (rule = WASL) => Array.from({ length: rule.parts }, (_, i) => ({ n: i + 1, sample: SAMPLES[i] }));
  function sampleOf(part, script = scriptNow()) {
    const at = SAMPLES[Math.max(1, Math.min(WASL.parts, part)) - 1];
    const letters = lettersOf(textOf(at.ref, script));
    if (at.pair) {
      const space = letters.indexOf(' ');
      return letters.slice(space - 1, space + 3).join('');
    }
    return letters.slice(0, at.one ? 1 : 2).join('');
  }
  const inPart = (form, n) => form.parts.includes(n);
  const firstPartOf = (form) => form.parts[0];

  // The row the page's same-sound line starts on in each part, and whether a row is one of a part's own.
  const firstRow = (part) => ['start', 'joined', 'short', 'start'][Math.max(1, Math.min(WASL.parts, part)) - 1];
  const rowInPart = (row, part) => forms.some((form) => form.row === row && inPart(form, part));
  // The title's glyph is an alif, in the script's own: Madani's wasla, Indo-Pak's plain alif.
  const titleGlyph = () => cc(scriptNow() === 'indopak' ? 0x0627 : 0x0671);

  rules.KITS.wasl = {
    board: 'words', formsOf: () => forms, partsOf, sampleOf, idOf, drawnOf, glyphOf, audioOf, itemsFor, rename, inPart, firstPartOf,
    templatesOf, titleGlyph, echoOf, askOf, boards, samples, unitsOf, lettersOf, firstRow, rowInPart, TEMPLATES,
    START, READ, JOINED, SHORT, KEEP, READING, WALK, textOf, kindOf, nameOf,
  };
  // What spell.js and exercise.js read: a copied word or pair, drawn for the script in use.
  rules.wordText = textOf;
  rules.copiedUnits = unitsOf;
})();
