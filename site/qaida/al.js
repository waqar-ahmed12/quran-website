// The free Qaida, Lesson 18: AL-, the moon letters and the sun letters. QAIDA-BUILD.md step P2; the specification is docs/lesson-18/
// (01 is this file). "Al-" (an alif and a laam) at the start of a noun means "the", and its laam is read before a MOON letter (it carries a jazam)
// and not read before a SUN letter (it is bare, and the letter after it is doubled by a shadda). The name Allah is Al- and lah: the
// laam is a sun letter, so it doubles. The student can see which it is from the marks alone; there is no list to learn.
//
// This is the third RULE kit, and the first whose items are the Qur'an's own words: COPIED, never typed (docs/pass-2/02 §3). A word is
// named by REFERENCE ONLY, "surah:verse:position", and its Arabic is in rule-words.js, which tools/fetch-qaida-words.js wrote from
// Quran.com in both scripts, unmodified. So no Arabic is typed in this file, and no combining mark either. The fetch tool reads the
// references straight out of this file (any quoted "1:2:1"), so a word is named in one place only.
//
// Registered in rules.js's KITS as `al`, so rule-lesson.js reads a kit and never a rule's own functions (docs/lesson-17/01 §3). No DOM
// and no storage here, so tools/qaida-lesson18-check.js loads it in node. marks.js, mark-lesson.js, practice.js and every earlier
// lesson are untouched: the fence in tools/qaida-check.js.

(() => {
  const marks = window.qaidaMarks;
  const rules = window.qaidaRules;
  if (!marks || !rules) return;

  const cc = (...codes) => String.fromCharCode(...codes);
  const fill = marks.fill;
  const scriptNow = () => (window.qaidaShell && window.qaidaShell.state.script) || 'madani';

  // Twelve words, by reference. Moon letters and sun letters, five each, then the name Allah twice: once in the middle of a verse and
  // once at a verse's start, where an Indo-Pak alif carries its zabar (docs/lesson-18/01 §3). Every one is a word standing on its own,
  // in the middle of its verse, so its Indo-Pak side carries no stop sign, and every mark on it is one the student has met.
  const MOON = ['1:2:1', '98:1:7', '95:3:2', '94:5:3', '100:8:3'];
  const SUN = ['1:1:3', '75:9:2', '99:6:3', '92:3:3', '54:1:2'];
  const ALLAH = ['112:1:3', '112:2:1'];

  // The kinds are the board's rows. `parts` says "meet it in these parts": moon in 1 and 3, sun in 2 and 3, Allah in 3 alone.
  const forms = [
    ...MOON.map((ref) => ({ ref, kind: 'moon', parts: [1, 3] })),
    ...SUN.map((ref) => ({ ref, kind: 'sun', parts: [2, 3] })),
    ...ALLAH.map((ref) => ({ ref, kind: 'allah', parts: [3] })),
  ];
  const AL = { id: 'al', lesson: 18, parts: 3, forms };
  rules.RULES.al = AL;

  // The words for a lesson's reading page (exercise-18.html): more of the Qur'an's own, not the twelve of the drill.
  const READING = [
    '55:9:2', '2:20:2', '55:12:3', '93:9:2', '101:5:2', '114:6:2', // moon
    '2:24:7', '2:22:15', '55:5:1', '2:8:2', // sun
    '110:1:4', '95:8:2', // Allah
  ];

  // The walkthrough (spell.js): one moon word, one sun word and the name Allah, each in three steps. `sounds` are the article's and the
  // rest's, and `whole` the word said. The one place a sound is spelled out, as it has been since Lesson 4.
  const WALK = [
    { ref: '1:2:1', kind: 'moon', sounds: ['al', 'hamdu'], whole: 'al-hamdu', meaning: 'the praise' },
    { ref: '75:9:2', kind: 'sun', sounds: ['a', 'sh-shamsu'], whole: 'ash-shamsu', meaning: 'the sun' },
    { ref: '112:1:3', kind: 'allah', sounds: ['a', 'l-laahu'], whole: 'Allaahu', meaning: 'Allah' },
  ];

  const data = () => (window.qaidaRuleWords && window.qaidaRuleWords.words) || {};
  const textOf = (ref, script = scriptNow()) => {
    const word = data()[ref];
    if (!word) return '';
    return script === 'indopak' ? word.indopak : word.madani;
  };

  // A word as letters with their marks: a base and every combining mark after it. Quran.com's texts hold nothing else in these
  // words (the check proves it), and tatweel is a base of its own (its small alif attaches to it). This is what Intl.Segmenter does
  // for these texts, without depending on a browser that has it.
  const lettersOf = (text) => text.match(/\P{M}\p{M}*/gu) || [];

  // The parts of a word the lesson is about, by position: the alif is 0, the laam of Al- is 1 and the letter after it is 2. A moon
  // word lights its laam ("read"); a sun word and Allah light the laam ("silent": not read) and the letter after it ("twice": said
  // twice, by its shadda). Everything else is plain.
  const roleOf = (kind, i) => {
    if (i === 1) return kind === 'moon' ? 'read' : 'silent';
    if (i === 2 && kind !== 'moon') return 'twice';
    return '';
  };
  const kindOf = (ref) => (forms.find((f) => f.ref === ref) || { kind: (WALK.find((w) => w.ref === ref) || {}).kind || '' }).kind;
  function unitsOf(ref, script = scriptNow(), kind = kindOf(ref)) {
    return lettersOf(textOf(ref, script)).map((text, i) => ({ text, role: roleOf(kind, i) }));
  }

  // The id is the reference: one fixed string, the same in both scripts (the rule of every id since Lesson 9), and never a word's
  // Arabic, so a switch of script keeps every credit.
  const idOf = (form) => form.ref;
  const glyphOf = (form, script = scriptNow()) => textOf(form.ref, script);
  const drawnOf = glyphOf;

  // The recordings would be the teacher's own words, one each, kept under the reference (audio/manifest.json, group `words`). None yet:
  // the page hears nothing until they arrive, and says so (docs/lesson-18/01 §7).
  const audioOf = (form) => ({ kind: 'words', glyph: form.ref });

  // The names: two, one template each, so a name is edited once and every name follows. Allah's laam is not read, so it is a sun word.
  const TEMPLATES = { moon: 'The laam is read', sun: 'The laam is not read' };
  const nameOf = (form, templates = TEMPLATES) => fill(form.kind === 'moon' ? templates.moon : templates.sun, {});
  const templatesOf = (d) => ({ moon: d.nameMoon, sun: d.nameSun });

  // One item per word, in the order above. `marked: true` and `parts` are what marks.poolFor, marks.stats and marks.sizes read, so the
  // engine's arithmetic is the mark lessons' own. `mark` is the word's ROW on the board (moon, sun, allah): what the page's same-sound
  // line follows.
  function itemsFor(shell, options = {}) {
    const { templates = TEMPLATES, script = scriptNow() } = options;
    return forms.map((form) => ({
      id: idOf(form),
      glyph: drawnOf(form, script),
      name: nameOf(form, templates),
      family: [], // the two answers are told apart by the marks, not by a look-alike
      audio: audioOf(form),
      required: false,
      traceable: true,
      marked: true,
      mark: form.kind,
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
      if (form) item.name = nameOf(form, templates);
    }
  }

  // The board: a list of words for each row (moon, sun, Allah), so the page can draw each with its own heading. The whole map is on
  // the board from part 1 (a word whose part is not open is drawn dim, never hidden), as on Lesson 16.
  const boards = () => ['moon', 'sun', 'allah'].map((id) => ({ id, cells: forms.filter((f) => f.kind === id) }));

  // The two words the strip shows on their own, a moon word and a sun word: the simplest of each (docs/lesson-18/01 §3).
  const samples = () => [{ kind: 'moon', ref: MOON[0] }, { kind: 'sun', ref: SUN[1] }];

  // Under a wrong answer: the word again, with the two places to look lit, and the line that says what they say.
  const echoOf = (item) => ({ line: item.kind === 'moon' ? 'lineMoon' : 'lineSun', units: unitsOf(item.ref, scriptNow(), item.kind) });

  // The rail's sample for each part: the front of a real word, copied and cut at a letter (alif and laam with its jazam; alif, laam and
  // the shadda letter; and the same for Allah).
  const SAMPLES = [{ ref: MOON[0], upto: 2 }, { ref: SUN[1], upto: 3 }, { ref: ALLAH[0], upto: 3 }];
  const partsOf = (rule = AL) => Array.from({ length: rule.parts }, (_, i) => ({ n: i + 1, sample: SAMPLES[i] }));
  const sampleOf = (part, script = scriptNow()) => {
    const at = SAMPLES[Math.max(1, Math.min(AL.parts, part)) - 1];
    return lettersOf(textOf(at.ref, script)).slice(0, at.upto).join('');
  };
  const inPart = (form, n) => form.parts.includes(n);
  const firstPartOf = (form) => form.parts[0];

  // The words that RIDE ALONG in a part (docs/lesson-18/01 §3). A part of moon words alone has one answer, "the laam is read", so no
  // question could be asked (the engine never offers one name twice) and, if one could, the answer would never change. So parts 1 and 2 are
  // handed the other kind as well, not required: they are asked and offered as the other answer, and count for nothing toward "you seem
  // ready" (the same `required: false` the mark lessons' review letters have). Part 3 has every word already.
  const ridersOf = (items, part) => items.filter((item) => (part === 1 && item.kind === 'sun') || (part === 2 && item.kind === 'moon'));

  // The row the page's same-sound line starts on in each part, and whether a row is one of a part's own.
  const firstRow = (part) => (part === 2 ? 'sun' : 'moon');
  const rowInPart = (row, part) => forms.some((f) => f.kind === row && inPart(f, part));
  // The title's glyph is the article itself: an alif and a laam, in the script's own alif (Madani's wasla, Indo-Pak's plain alif).
  const titleGlyph = () => cc(scriptNow() === 'indopak' ? 0x0627 : 0x0671, 0x0644);

  // The sun letters, once, for the teacher who wants them learnt (docs/lesson-18/01 §5): composed, never typed.
  const SUN_LETTERS = [0x062A, 0x062B, 0x062F, 0x0630, 0x0631, 0x0632, 0x0633, 0x0634, 0x0635, 0x0636, 0x0637, 0x0638, 0x0644, 0x0646];
  const sunLetters = () => SUN_LETTERS.map((code) => cc(code));

  rules.KITS.al = {
    board: 'words', formsOf: () => forms, partsOf, sampleOf, idOf, drawnOf, glyphOf, audioOf, itemsFor, rename, inPart, firstPartOf,
    templatesOf, titleGlyph, echoOf, boards, samples, unitsOf, lettersOf, firstRow, rowInPart, sunLetters, ridersOf, TEMPLATES,
    MOON, SUN, ALLAH, READING, WALK, textOf, kindOf, nameOf,
  };
  // What spell.js and exercise.js read: a copied word, drawn for the script in use.
  rules.wordText = textOf;
  rules.copiedUnits = unitsOf;
})();
