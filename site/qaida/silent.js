// The free Qaida, Lesson 21: LETTERS THAT ARE NOT READ. QAIDA-BUILD.md step P2; the specification is docs/lesson-21/ (01 is this file). Some letters are
// written and never said: the alif after a plural wow (kaanuu, "they were"), the wow after the hamza in the word that means "those with", the wow
// that only carries a long "aa" (the wow of the word for prayer). The student has to see them and step over them.
//
// THE TWO SCRIPTS SHOW IT IN OPPOSITE WAYS (docs/pass-2/01 §2, measured over the whole Qur'an, docs/lesson-21/01 §2): Madani MARKS the letter that
// is not read (a small circle over it; a wow with only a small alif on it carries "aa" and is not read as a wow), and Indo-Pak marks the letters
// that ARE read, so a wow or yaa with no mark at all, and an alif with no zabar before it, is the one that is not. This is what lessons 11 and 13's
// jazam on the Indo-Pak long wow and yaa was for. `notReadAt` below finds the letter by each script's own rule, never by a position.
//
// The sixth RULE kit, on Lesson 20's page and with its machinery: copied words, never typed (docs/pass-2/02 §3). A word is named by REFERENCE
// ONLY, "surah:verse:position", and its Arabic is in rule-words.js, which tools/fetch-qaida-words.js wrote from Quran.com in both scripts,
// unmodified. So no Arabic is typed in this file, and no combining mark either. The fetch tool reads the references straight out of this file (any
// quoted reference of that shape), so a word is named in one place only, and no other string of that shape may be quoted here.
//
// THE NEW QUESTION: "tap the letter" (docs/pass-2/02 §2). Its answers are the word's own letters, which the engine could not deal until a format
// was allowed to bring its own `choicesFor` (practice.js, one additive change). A word asked this way is an item with `tap: true`, its letters in
// `units` and the right one in `answerId`. The other question is "is the lit letter read, or not?", an ordinary two-name question, so an item
// says which it is in `askGroup` ('tap' or 'lit') and an answer to one is never offered to the other (Lesson 19's way).
//
// Registered in rules.js's KITS as `silent`, so rule-lesson.js reads a kit and never a rule's own functions (docs/lesson-17/01 §3). No DOM and no
// storage here, so tools/qaida-lesson21-check.js loads it in node. marks.js, mark-lesson.js, rules.js, ends.js, al.js, wasl.js, madd.js and every
// earlier lesson are untouched: the fence in tools/qaida-check.js.

(() => {
  const marks = window.qaidaMarks;
  const rules = window.qaidaRules;
  if (!marks || !rules) return;

  const cc = (...codes) => String.fromCharCode(...codes);
  const fill = marks.fill;
  const scriptNow = () => (window.qaidaShell && window.qaidaShell.state.script) || 'madani';

  // What the page is about, as code points. U+06DF is Madani's small circle; U+0670 the small alif (Madani) or the khari zabar (Indo-Pak).
  const ALIF = 0x0627;
  const WAW = 0x0648;
  const YAA = 0x064A;
  const TATWEEL = 0x0640;
  const FATHA = 0x064E;
  const SMALL_ALIF = 0x0670;
  const CIRCLE = 0x06DF;

  // The words, in four kinds (docs/lesson-21/01 §3). Every one is a mid-verse word, in both scripts, holding only marks the student has met (and,
  // in Madani, the circle), and each has exactly the letters the lesson says are not read: one, or none. The check proves it for every word.
  //   plural - the alif after a plural wow, at the end of the word (kaanuu, qaaluu, kafaruu)
  //   ulee   - the wow after the hamza, in the word that means "those with" and the words that start the same way
  //   aawow  - a wow that carries only the long "aa" and is not read as a wow (the word for prayer, a goddess's name)
  //   none   - every letter is read, long vowels included: the contrast, so "none" is sometimes the answer
  const PLURAL = ['2:10:11', '2:25:19', '2:6:3', '3:11:7', '2:57:8', '2:14:4'];
  const ULEE = ['4:83:15', '4:59:8', '7:145:18', '65:6:13'];
  const AAWOW = ['24:58:17', '53:20:1', '9:103:11', '11:87:3'];
  const NONE = ['4:1:26', '3:7:35', '3:13:11', '2:25:15'];

  // Which words also come as "is the lit letter read?": the letter that is not read, and a letter beside it that is (the wow before a plural
  // alif; the laam after the wow in "those with"; the laam before the wow that carries "aa"). Three plural words, two ulee, one aawow.
  const LIT_FROM = { plural: PLURAL.slice(0, 3), ulee: [ULEE[0], ULEE[2]], aawow: [AAWOW[0]] };

  // A form is one question's worth of word. `ask: 'tap'` is the whole word, its letters tappable; `ask: 'lit'` is the word with one letter lit.
  // `parts` is "meet it in these parts" (a word with a letter not read: tapped in part 1, and again in the last; asked as lit in 2 and in the
  // last); a word with none is only in the last, where "none" is an answer. `row` is the word's row on the board.
  const taps = [
    ...PLURAL.map((ref) => ({ ref, kind: 'plural', wordKind: 'plural', row: 'plural', ask: 'tap', parts: [1, 3] })),
    ...ULEE.map((ref) => ({ ref, kind: 'ulee', wordKind: 'ulee', row: 'ulee', ask: 'tap', parts: [1, 3] })),
    ...AAWOW.map((ref) => ({ ref, kind: 'aawow', wordKind: 'aawow', row: 'aawow', ask: 'tap', parts: [1, 3] })),
    ...NONE.map((ref) => ({ ref, kind: 'none', wordKind: 'none', row: 'none', ask: 'tap', parts: [3] })),
  ];
  const lits = [];
  for (const wordKind of ['plural', 'ulee', 'aawow']) {
    for (const ref of LIT_FROM[wordKind]) {
      for (const kind of ['not', 'read']) lits.push({ ref, kind, wordKind, row: wordKind, ask: 'lit', parts: [2, 3] });
    }
  }
  const forms = [...taps, ...lits];
  const SILENT = { id: 'silent', lesson: 21, parts: 3, forms };
  rules.RULES.silent = SILENT;

  // The words for the lesson's reading page (exercise-21.html): more of the Qur'an's own, none of them in the drill.
  const READING = [
    '2:80:1', '2:89:10', '2:59:3', '2:39:3', // an alif after a plural wow
    '3:13:28', '65:4:15', // the wow after the hamza
    '2:86:4', '3:185:19', // a wow that carries "aa"
    '2:118:1', '2:34:11', '2:91:12', '4:97:11', // every letter read
  ];

  // The walkthrough (spell.js): one word of each kind in three steps, the letters before the one not read, that letter and what follows, and the
  // whole. `sounds` are the first piece's and the second's (the second's of a plural word is nothing: its piece is only the silent alif), and
  // `whole` the whole said. The one place a sound is spelled out, as it has been since Lesson 4: candidates for the teacher.
  const WALK = [
    { ref: '2:13:4', kind: 'plural', sounds: ['aaminuu', ''], whole: 'aaminuu', meaning: 'believe' },
    { ref: '38:43:9', kind: 'ulee', sounds: ['li-u', 'lee'], whole: 'li-ulee', meaning: 'for those with' },
    { ref: '3:14:19', kind: 'aawow', sounds: ['al-haya', 'aati'], whole: 'al-hayaati', meaning: 'life' },
  ];

  const data = () => (window.qaidaRuleWords && window.qaidaRuleWords.words) || {};
  const textOf = (ref, script = scriptNow()) => {
    const word = data()[ref];
    if (!word) return '';
    return script === 'indopak' ? word.indopak : word.madani;
  };

  const wordKindOf = (ref) => {
    const found = taps.find((form) => form.ref === ref) || WALK.find((entry) => entry.ref === ref);
    return found ? found.kind : '';
  };
  const kindOf = wordKindOf;

  // A word as its letters with their marks: a base and every combining mark after it, and a tatweel joined to the letter before it (it is the
  // stretch of that letter, not a letter of its own, and a student never taps it). The same cut as Lesson 19's and 20's, with that one addition.
  const lettersOf = (text) => text.match(/\P{M}\p{M}*/gu) || [];
  function lettersOfWord(text) {
    const out = [];
    for (const unit of lettersOf(text)) {
      if (unit.codePointAt(0) === TATWEEL && out.length) out[out.length - 1] += unit;
      else out.push(unit);
    }
    return out;
  }
  const baseOf = (unit) => unit.codePointAt(0);
  const marksOf = (unit) => [...unit].slice(1).map((ch) => ch.codePointAt(0)).filter((c) => c !== TATWEEL);

  // THE RULE (docs/lesson-21/01 §2), one for each script, and the whole of the lesson.
  //   Madani:  a letter with the small circle is not read; and a wow with only the small alif on it (no vowel) carries the long "aa", and is not
  //            read as a wow.
  //   Indo-Pak: a wow or yaa with no mark at all is not read; and an alif with no zabar (or khari zabar) before it is not read. The word's first
  //            letter is never one (a letter is not read after something).
  // Returns the place of the letter not read, or -1 where there is none or, for a word the lesson has not been checked on, more than one.
  function notReadAt(texts, script, kind) {
    if (kind === 'none') return -1;
    const found = [];
    texts.forEach((unit, i) => {
      const base = baseOf(unit);
      const own = marksOf(unit);
      if (script === 'indopak') {
        if (i === 0) return;
        const before = marksOf(texts[i - 1]);
        if (base === ALIF && own.length === 0 && !before.includes(FATHA) && !before.includes(SMALL_ALIF)) found.push(i);
        else if ((base === WAW || base === YAA) && own.length === 0) found.push(i);
      } else if (kind === 'aawow') {
        if (base === WAW && own.length === 1 && own[0] === SMALL_ALIF) found.push(i);
      } else if (own.includes(CIRCLE)) {
        found.push(i);
      }
    });
    return found.length === 1 ? found[0] : -1;
  }

  // The letter lit in "is this letter read?" when the answer is "read": the one beside the silent letter that a student would doubt (docs/lesson-21/01 §4).
  const readNextTo = { plural: -1, ulee: 1, aawow: -1 };

  // The letters of a word the lesson is about, by position. `role` is 'silent' for the letter not read, `step` which piece of the walkthrough a
  // letter belongs to (before the silent letter; it and after it), as Lessons 19 and 20's do. `kind` is the word's own kind, or 'not' or 'read' for
  // an item that asks about one letter, where the lit letter is `ask`, never `silent`: a question must not give its answer away.
  function unitsOf(ref, script = scriptNow(), kind = kindOf(ref)) {
    const wordKind = kind === 'not' || kind === 'read' ? kindOf(ref) : kind;
    const texts = lettersOfWord(textOf(ref, script));
    const at = notReadAt(texts, script, wordKind);
    const units = texts.map((text, i) => ({ text, role: at === i && kind !== 'not' && kind !== 'read' ? 'silent' : '', step: at >= 0 && i >= at ? 1 : 0 }));
    return units;
  }

  // The place of the letter lit in a question about one letter.
  function litAt(ref, script = scriptNow(), as = 'not') {
    const wordKind = kindOf(ref);
    const at = notReadAt(lettersOfWord(textOf(ref, script)), script, wordKind);
    if (at < 0) return -1;
    return as === 'not' ? at : at + readNextTo[wordKind];
  }

  // What a question shows: the word's letters, with the lit one marked 'ask'. A tap question shows them with none lit.
  function promptUnitsOf(form, script = scriptNow()) {
    const units = lettersOfWord(textOf(form.ref, script)).map((text) => ({ text, role: '', step: 0 }));
    if (form.ask === 'lit') {
      const at = litAt(form.ref, script, form.kind);
      if (units[at]) units[at].role = 'ask';
    }
    return units;
  }

  // The id is the reference (and `#not` or `#read` for the question about one letter): fixed strings, the same in both scripts, and never a
  // word's Arabic, so a switch of script keeps every credit.
  const idOf = (form) => (form.ask === 'lit' ? `${form.ref}#${form.kind}` : form.ref);
  const glyphOf = (form, script = scriptNow()) => textOf(form.ref, script);
  const drawnOf = glyphOf;

  // The recordings would be the teacher's own words, one each, kept under the reference (audio/manifest.json, group `words`). None yet.
  const audioOf = (form) => ({ kind: 'words', glyph: form.ref });

  // The names. A word's name is what is not read in it, and is only said back: "Yes — the alif after the wow is not read." The two answers to
  // "is the lit letter read?" are "Read" and "Not read".
  const TEMPLATES = {
    plural: 'the alif after the wow',
    ulee: 'the wow after the hamza',
    aawow: 'the wow that carries the long “aa”',
    none: 'every letter',
    not: 'Not read',
    read: 'Read',
  };
  const nameOf = (form, shell, templates = TEMPLATES) => fill(templates[form.kind], {});
  const templatesOf = (d) => ({
    plural: d.namePlural, ulee: d.nameUlee, aawow: d.nameAawow, none: d.nameNone, not: d.nameNot, read: d.nameRead,
  });

  // One item per form, in the order above. `marked: true` and `parts` are what marks.poolFor, marks.stats and marks.sizes read, so the
  // engine's arithmetic is the mark lessons' own. `mark` is the word's ROW on the board, which the page's same-sound line follows.
  function itemsFor(shell, options = {}) {
    const { templates = TEMPLATES, script = scriptNow() } = options;
    return forms.map((form) => {
      const units = promptUnitsOf(form, script);
      const at = notReadAt(units.map((unit) => unit.text), script, form.wordKind);
      return {
        id: idOf(form),
        boardId: form.ref,
        glyph: drawnOf(form, script),
        name: nameOf(form, shell, templates),
        family: [], // the answers are told apart by what is written on the letter, not by a look-alike
        audio: audioOf(form),
        required: false,
        traceable: true,
        marked: true,
        mark: form.row,
        kind: form.kind,
        wordKind: form.wordKind,
        ref: form.ref,
        markName: '',
        parts: form.parts.slice(),
        askGroup: form.ask,
        tap: form.ask === 'tap',
        units,
        answerId: at >= 0 ? String(at) : 'none',
      };
    });
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

  // What a tap question's answers are: the word's letters, in the order they are read, and where the lesson allows it a last answer, "none".
  // The engine asks for this (a format's `choicesFor`) and never reads what is in it but `id`.
  function tapChoices(item, withNone) {
    const list = item.units.map((unit, i) => ({ id: String(i), text: unit.text, tap: true }));
    if (withNone) list.push({ id: 'none', text: '', none: true });
    return list;
  }

  // Which question line a word is asked with: tapped with no "none" until the last part, then with it; or the lit letter.
  const askOf = (item, group) => (item.tap ? (group >= 3 ? 'tapnone' : 'tap') : 'lit');

  // The board: a list of words for each row (the alif after a plural wow; the wow after the hamza; the wow that carries "aa"; every letter read),
  // so the page can draw each with its own heading. The whole map is on the board from part 1 (a word whose part is not open is drawn dim,
  // never hidden), as on Lessons 18 to 20.
  const ROWS = ['plural', 'ulee', 'aawow', 'none'];
  const boards = () => ROWS.map((id) => ({ id, cells: taps.filter((form) => form.row === id) }));

  // The three words on their own, one for each kind of letter that is not read (the simplest of each, docs/lesson-21/01 §3).
  const samples = () => [taps[0], taps[PLURAL.length], taps[PLURAL.length + ULEE.length]];

  // Under a wrong answer: the same word again, with the letter that is not read lit (or the lit letter, in a question about one), and the line
  // that says what shows it, in the student's own script. One line for each kind and script; a word with none has one line for both.
  const pascalOf = (id) => id.replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());
  const scriptWord = (script) => (script === 'indopak' ? 'Indopak' : 'Madani');
  function echoOf(item) {
    const script = scriptNow();
    if (item.tap) {
      return { line: item.kind === 'none' ? 'lineNone' : `line${pascalOf(item.kind)}${scriptWord(script)}`, units: unitsOf(item.ref, script, item.kind) };
    }
    const units = lettersOfWord(textOf(item.ref, script)).map((text) => ({ text, role: '', step: 0 }));
    const at = litAt(item.ref, script, item.kind);
    if (units[at]) units[at].role = item.kind === 'not' ? 'silent' : 'read';
    // "Not read" says what shows it for the word's own kind (the same line as when that letter is tapped); "read" has one line for a script.
    const line = item.kind === 'not' ? `line${pascalOf(item.wordKind)}${scriptWord(script)}` : `lineRead${scriptWord(script)}`;
    return { line, units };
  }

  // The rail's sample for each part: a piece of a real word, copied (the end of a plural word with the alif; the front of the word for "those with";
  // the front of a word with every letter read).
  const SAMPLES = [{ ref: PLURAL[0], from: -3, to: 0 }, { ref: ULEE[0], from: 0, to: 3 }, { ref: NONE[0], from: 0, to: 3 }];
  const partsOf = (rule = SILENT) => Array.from({ length: rule.parts }, (_, i) => ({ n: i + 1, sample: SAMPLES[i] }));
  function sampleOf(part, script = scriptNow()) {
    const at = SAMPLES[Math.max(1, Math.min(SILENT.parts, part)) - 1];
    const texts = lettersOfWord(textOf(at.ref, script));
    return (at.from < 0 ? texts.slice(at.from) : texts.slice(at.from, at.to)).join('');
  }
  const inPart = (form, n) => form.parts.includes(n);
  const firstPartOf = (form) => form.parts[0];

  // The row the page's same-sound line starts on in each part, and whether a row is one of a part's own.
  const firstRow = (part) => ['plural', 'ulee', 'none'][Math.max(1, Math.min(SILENT.parts, part)) - 1];
  const rowInPart = (row, part) => forms.some((form) => form.row === row && inPart(form, part));
  // The title's glyph is an alif with the small circle, composed.
  const titleGlyph = () => cc(ALIF, CIRCLE);

  rules.KITS.silent = {
    board: 'words', tapFormat: true, formsOf: () => forms, partsOf, sampleOf, idOf, drawnOf, glyphOf, audioOf, itemsFor, rename, inPart, firstPartOf,
    templatesOf, titleGlyph, echoOf, boards, samples, unitsOf, lettersOf: lettersOfWord, firstRow, rowInPart, TEMPLATES, tapChoices, askOf, promptUnitsOf,
    PLURAL, ULEE, AAWOW, NONE, READING, WALK, textOf, kindOf, nameOf, notReadAt, litAt,
  };
  // What spell.js and exercise.js read: a copied word, drawn for the script in use.
  rules.wordText = textOf;
  rules.copiedUnits = unitsOf;
})();
