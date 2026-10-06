// The free Qaida, Lesson 17: the ROUND TAA and the END YAA. QAIDA-BUILD.md step P2; the specification is docs/lesson-17/ (01 is
// this file). Two shapes that come only at the end of a word and are not among the 29 letters: ة, read "t" with the mark it
// carries (and "h" when you stop on it, which is Lesson 22's), and ى, a yaa without dots, read as a long "ee" after a zair or as a
// long "aa" after a zabar, in which case the yaa itself is not read (docs/pass-2/01 §8, checked against Quran.com).
//
// This is the second RULE kit. rules.js holds the hamza's and the registry (`KITS`); rule-lesson.js reads `KITS[data-rule]` and
// never a rule's own functions, so this file adds a rule by adding an entry, as rules.js says a rule lesson should. No DOM and no
// storage here, so tools/qaida-lesson17-check.js loads it in node. marks.js, mark-lesson.js, practice.js and every earlier lesson
// are not edited: a form's `mark` is a MARKS id, so the names, the sounds and the jazam's per-script drawing come from marks.js,
// and the ids of lessons 4-16 are untouched (the fence in tools/qaida-check.js).
//
// A form is composed, never pasted (docs/lesson-4/02 §1): a combining mark typed into source is invisible in every editor and
// diff. Always String.fromCharCode.

(() => {
  const marks = window.qaidaMarks;
  const rules = window.qaidaRules;
  if (!marks || !rules) return;

  const cc = (...codes) => String.fromCharCode(...codes);
  const TAA = 0x0629; // ة
  const YAA = 0x0649; // ى: the same code point in both scripts (docs/pass-2/01 §8); one constant so a change is one line
  const SMALL_ALIF = 0x0670;
  const KASRA = 0x0650;
  const FATHA = 0x064E;
  // The letter before a round taa is always a zabar (docs/lesson-17/01 §2), so every round taa is drawn after a baa with zabar:
  // drawn, never asked, never in an id. Lesson 16's jazam forms have the same lead.
  const TAA_LEAD = [0x0628, 0x064E];

  // The marks a round taa is met with, in a Qaida's order: one mark, then two. A part's rows are these two lines.
  const TAA_ROWS = { single: ['fatha', 'kasra', 'damma'], double: ['fathatain', 'kasratain', 'dammatain'] };
  // The four letters an end yaa is met after: baa, faa, laam and meem. All four join to what comes after them, and each ends a
  // short word the student will meet ("fii", "bii", "lii", "'alaa"): docs/lesson-17/01 §3 gives the reason and the size.
  const LEADS = [0x0628, 0x0641, 0x0644, 0x0645];
  const READS = ['ee', 'aa'];

  // The forms. `parts` says "meet it in these parts": the round taa in part 1 and again in part 3, the end yaa in parts 2 and 3.
  const forms = [];
  for (const row of ['single', 'double']) {
    for (const mark of TAA_ROWS[row]) forms.push({ kind: 'taa', row, mark, parts: [1, 3] });
  }
  for (const read of READS) {
    for (const lead of LEADS) forms.push({ kind: 'yaa', row: read, read, lead, parts: [2, 3] });
  }

  const ENDS = { id: 'ends', lesson: 17, parts: 3, forms };
  rules.RULES.ends = ENDS;

  const scriptNow = () => (window.qaidaShell && window.qaidaShell.state.script) || 'madani';
  const fill = marks.fill;
  const markOf = (form) => marks.markOf(form.mark);

  // The id is one fixed string, the same in both scripts (the rule of every id since Lesson 9): a round taa is the letter and its
  // mark's own `suffixOf`; an end yaa is the letter before, its vowel, the yaa, and — for the long "aa" — the small alif, which is
  // the MADANI drawing's code points. Never built from what Indo-Pak draws, so a switch of script keeps every credit.
  const idOf = (form) => {
    if (form.kind === 'taa') return cc(TAA) + marks.suffixOf(markOf(form));
    return cc(form.lead, form.read === 'ee' ? KASRA : FATHA, YAA) + (form.read === 'aa' ? cc(SMALL_ALIF) : '');
  };

  // The form as a script draws it, without its lead. The long "aa" is where the scripts differ (docs/lesson-17/01 §4): Madani puts
  // a small alif on the yaa; Indo-Pak puts a khari zabar on the letter before and leaves the yaa bare. The long "ee": Madani leaves
  // the yaa bare, Indo-Pak puts a jazam on it (Lesson 13's rule).
  const glyphOf = (form, script = scriptNow()) => {
    if (form.kind === 'taa') return cc(TAA) + marks.drawnOf(markOf(form), script);
    if (form.read === 'ee') return cc(form.lead, KASRA, YAA) + (script === 'indopak' ? marks.drawnOf(marks.markOf('sukun'), script) : '');
    return script === 'indopak' ? cc(form.lead, SMALL_ALIF, YAA) : cc(form.lead, FATHA, YAA, SMALL_ALIF);
  };
  const leadOf = (form) => (form.kind === 'taa' ? cc(...TAA_LEAD) : '');
  const drawnOf = (form, script = scriptNow()) => leadOf(form) + glyphOf(form, script);

  // The recordings are the ones the earlier lessons made (docs/lesson-17/01 §7): a round taa says what a taa with that mark says
  // ("ta", "tun"), and an end yaa says what its letter says with the long vowel ("fii", "faa"), so this lesson needs no new row on
  // the recordings page.
  const audioOf = (form) => {
    if (form.kind === 'taa') return { kind: markOf(form).audio, glyph: cc(0x062A) };
    return { kind: form.read === 'ee' ? 'kasra-yaa' : 'fatha-alif', glyph: cc(form.lead) };
  };

  // Names: one template each, so a name is edited once and every name follows. The round taa's takes the student's own word for
  // the mark; the end yaa's two are fixed words (there is no mark to name).
  const TEMPLATES = { taa: 'Round taa with {mark}', yaaEe: 'End yaa, read “ee”', yaaAa: 'End yaa, read “aa”' };
  const nameOf = (form, shell, templates = TEMPLATES) => {
    if (form.kind === 'taa') {
      const mark = marks.nameOf(markOf(form), shell);
      return fill(templates.taa, { mark, Mark: marks.cap(mark) });
    }
    return fill(form.read === 'ee' ? templates.yaaEe : templates.yaaAa, {});
  };
  const templatesOf = (d) => ({ taa: d.nameTaa, yaaEe: d.nameYaaEe, yaaAa: d.nameYaaAa });

  // One item per form, in the order above. `marked: true` and `parts` are what marks.poolFor, marks.stats and marks.sizes read, so
  // the engine's arithmetic is the mark lessons' own. `mark` is the form's ROW on the board (single, double, ee, aa): what the
  // page's same-sound line follows.
  function itemsFor(shell, options = {}) {
    const { templates = TEMPLATES, script = scriptNow() } = options;
    return forms.map((form) => ({
      id: idOf(form),
      glyph: drawnOf(form, script),
      name: nameOf(form, shell, templates),
      family: [], // the two readings are told apart by what is around the yaa, not by a look-alike
      audio: audioOf(form),
      required: false,
      traceable: true,
      marked: true,
      mark: form.row,
      kind: form.kind,
      lead: form.lead ? cc(form.lead) : '',
      markName: form.kind === 'taa' ? marks.nameOf(markOf(form), shell) : '',
      parts: form.parts.slice(),
    }));
  }

  // The names changed: the same items with new names, so the engine keeps them.
  function rename(items, shell, templates = TEMPLATES) {
    const byId = new Map(forms.map((form) => [idOf(form), form]));
    for (const item of items) {
      const form = byId.get(item.id);
      if (!form) continue;
      item.markName = form.kind === 'taa' ? marks.nameOf(markOf(form), shell) : '';
      item.name = nameOf(form, shell, templates);
    }
  }

  // The board is two grids, one per shape, so the page can draw the round taa's (two rows of three, one mark then two) and the
  // end yaa's (two rows of four, one reading each) with the same rows and cells. `heads` are the columns' own words, if any: the
  // round taa's columns are the marks, and the two under one column are the single and the doubled one.
  const boards = () => [
    {
      id: 'taa', columns: 3, heads: TAA_ROWS.single,
      rows: ['single', 'double'].map((row) => ({ row, cells: forms.filter((form) => form.kind === 'taa' && form.row === row) })),
    },
    {
      id: 'yaa', columns: 4, heads: null,
      rows: READS.map((row) => ({ row, cells: forms.filter((form) => form.kind === 'yaa' && form.row === row) })),
    },
  ];

  // The two shapes on their own, for the strip above the boards: the bare letters, as the hamza's four seats are.
  const shapes = () => [{ id: 'taa', glyph: cc(TAA) }, { id: 'yaa', glyph: cc(YAA) }];

  // Under a wrong answer: the same shape, read the other way, or with every mark (docs/lesson-17/01 §3).
  const echoOf = (item) => {
    if (item.kind === 'taa') return { line: 'lineTaa', forms: forms.filter((form) => form.kind === 'taa') };
    return { line: 'lineYaa', forms: forms.filter((form) => form.kind === 'yaa' && cc(form.lead) === item.lead) };
  };

  // The rail's sample glyph for each part: a round taa with two paish, an end yaa after laam read "aa", an end yaa after faa read "ee".
  const SAMPLES = [
    { kind: 'taa', row: 'double', mark: 'dammatain' },
    { kind: 'yaa', row: 'aa', read: 'aa', lead: LEADS[2] },
    { kind: 'yaa', row: 'ee', read: 'ee', lead: LEADS[1] },
  ];
  const partsOf = (rule = ENDS) => Array.from({ length: rule.parts }, (_, i) => ({ n: i + 1, sample: SAMPLES[i] }));
  const sampleOf = (part, script = scriptNow()) => drawnOf(SAMPLES[Math.max(1, Math.min(ENDS.parts, part)) - 1], script);
  const inPart = (form, n) => form.parts.includes(n);
  const firstPartOf = (form) => form.parts[0];

  // The row the page's same-sound line starts on in each part, and whether a row is one of a part's own: a tap on the yaa's row
  // then a jump to part 1 must not leave a line about a shape that is not on the board's open half.
  const firstRow = (part) => (part === 2 ? 'ee' : 'single');
  const rowInPart = (row, part) => forms.some((form) => form.row === row && inPart(form, part));
  // Which of the lead line's three wordings a part shows.
  const leadKey = (part) => (part === 1 ? 'leadTaa' : part === 2 ? 'leadYaa' : 'leadBoth');

  rules.KITS.ends = {
    board: 'ends', formsOf: () => forms, partsOf, sampleOf, idOf, drawnOf, glyphOf, audioOf, itemsFor, rename, inPart, firstPartOf,
    templatesOf, titleGlyph: () => cc(TAA), echoOf, boards, shapes, firstRow, rowInPart, leadKey, TEMPLATES, LEADS, READS, TAA_ROWS, TAA_LEAD,
    nameOf, leadOf,
  };
})();
