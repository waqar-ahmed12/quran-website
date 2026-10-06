// The free Qaida, Lesson 16 onward: the RULE data layer. QAIDA-BUILD.md step P2; the specification is
// docs/lesson-16/ (03 §2 is this file). Lessons 4-15 teach a MARK on a letter (marks.js); a rule lesson teaches a
// fixed set of FORMS, each a seat and a mark, and the point of the lesson is what is NOT read. Hamza is the first:
// fifteen forms on four seats, and the seat is never read.
//
// No DOM and no storage here, so tools/qaida-rules-check.js can load it in node, as marks.js is loaded. rule-lesson.js
// is the page and decides nothing in this file. marks.js, mark-lesson.js and practice.js are not edited by this lesson:
// a form's `mark` is a MARKS id, so the names, the sounds and the jazam's per-script drawing all come from marks.js, and
// the ids of lessons 4-15 are untouched (the fence in tools/qaida-check.js).
//
// A hamza's seat and its mark are composed, never pasted (docs/lesson-4/02 §1): a combining mark typed into source is
// invisible in every editor and diff. Always String.fromCharCode.

(() => {
  const marks = window.qaidaMarks;
  if (!marks) return;

  // The four seats (docs/lesson-16/02 §1, §5). Madani writes the alif seat as a hamza on the alif, and puts a hamza with
  // zair under it in its own glyph (madaniBelow); Indo-Pak writes it as a bare alif that carries the vowel, above or
  // below (docs/lesson-16/02 §2). The yaa seat is the ordinary letter (U+0626) in both scripts, until the teacher's
  // printed Qaida says otherwise (docs/lesson-16/07 §3): a `forms` entry on the seat would be the one-line change.
  const SEATS = {
    alif: { id: 'alif', madani: 0x0623, madaniBelow: 0x0625, indopak: 0x0627 },
    line: { id: 'line', madani: 0x0621, indopak: 0x0621 },
    wow: { id: 'wow', madani: 0x0624, indopak: 0x0624 },
    yaa: { id: 'yaa', madani: 0x0626, indopak: 0x0626 },
  };
  const SEAT_ORDER = ['alif', 'line', 'wow', 'yaa'];

  // What a walkthrough or reading word may write in place of a seat (docs/lesson-16/03 §8): the Madani alif seats, the
  // wow seat and the yaa seat, as code points. The hamza on the line is the ordinary letter, so it is not here.
  const SEAT_KEYS = {
    0x0623: { seat: 'alif' },
    0x0625: { seat: 'alif', below: true },
    0x0624: { seat: 'wow' },
    0x0626: { seat: 'yaa' },
  };

  // The lead a jazam form is drawn after (docs/lesson-16/02 §4): baa with zabar. A jazam has no sound on its own, and
  // an alif then an alif-seat hamza is two alifs in a row, which a beginner reads as "aa". Drawn, never asked, never in an id.
  const LEAD = [0x0628, 0x064E];

  // A form is a seat and a mark; `parts` says "meet it in these parts" (parts [1, 4]: met in part 1, and again in part 4).
  const HAMZA = {
    id: 'hamza', lesson: 16, parts: 4, sample: { alif: 'alif' },
    forms: [
      { seat: 'alif', mark: 'fatha', parts: [1, 4] },
      { seat: 'alif', mark: 'kasra', parts: [1, 4] },
      { seat: 'alif', mark: 'damma', parts: [1, 4] },
      { seat: 'alif', mark: 'sukun', parts: [4], lead: LEAD },
      { seat: 'line', mark: 'fatha', parts: [2, 4] },
      { seat: 'line', mark: 'kasra', parts: [2, 4] },
      { seat: 'line', mark: 'damma', parts: [2, 4] },
      { seat: 'line', mark: 'fathatain', parts: [2, 4] },
      { seat: 'line', mark: 'sukun', parts: [4], lead: LEAD },
      { seat: 'wow', mark: 'fatha', parts: [3, 4] },
      { seat: 'wow', mark: 'damma', parts: [3, 4] },
      { seat: 'wow', mark: 'sukun', parts: [3, 4], lead: LEAD },
      { seat: 'yaa', mark: 'fatha', parts: [3, 4] },
      { seat: 'yaa', mark: 'kasra', parts: [3, 4] },
      { seat: 'yaa', mark: 'sukun', parts: [3, 4], lead: LEAD },
    ],
  };
  const RULES = { hamza: HAMZA };

  // The rail's sample glyph for each part (docs/lesson-16/04 §2): the alif seat with zabar, the line, the wow, then a yaa with zair.
  const SAMPLES = [
    { seat: 'alif', mark: 'fatha' },
    { seat: 'line', mark: 'fatha' },
    { seat: 'wow', mark: 'fatha' },
    { seat: 'yaa', mark: 'kasra' },
  ];

  // Which mark is on which row of the board, in the order a student meets them, and the audio each one plays. The seat is
  // never read, so every seat of a mark shares one recording (docs/lesson-16/03 §7): zabar, zair, paish and two zabar reuse
  // the sounds Lessons 4-7 recorded on alif; the closed "a'" is the one new recording, 'hamza-jazam', recorded on hamza.
  const ROWS = ['fatha', 'kasra', 'damma', 'fathatain', 'sukun'];
  const AUDIO = {
    fatha: ['fatha', 0x0627],
    kasra: ['kasra', 0x0627],
    damma: ['damma', 0x0627],
    fathatain: ['fathatain', 0x0627],
    sukun: ['hamza-jazam', 0x0621],
  };

  // The names, one template (docs/lesson-16/04 §4): a name is edited once and every name follows. The jazam has its own
  // because the student's word for it takes an article ("a jazam"), which two zabar and zair do not.
  const TEMPLATES = { form: 'Hamza with {mark}', jazam: 'Hamza with a {mark}' };

  const scriptNow = () => (window.qaidaShell && window.qaidaShell.state.script) || 'madani';
  const fill = marks.fill;

  const formsOf = () => HAMZA.forms;
  const markOf = (form) => marks.markOf(form.mark);

  // The seat as a script draws it. Only the Madani alif seat with zair has a glyph of its own (the hamza below the alif).
  const seatCode = (form, script) => {
    const seat = SEATS[form.seat];
    if (script === 'indopak') return seat.indopak;
    return form.mark === 'kasra' && seat.madaniBelow ? seat.madaniBelow : seat.madani;
  };

  // The id is one fixed string, the same in both scripts (the rule of every id since Lesson 9): the MADANI seat, then the
  // mark's own suffixOf (the jazam as U+0652). Never built from what is drawn in Indo-Pak, so a switch keeps every credit.
  const idOf = (form) => String.fromCharCode(seatCode(form, 'madani')) + marks.suffixOf(markOf(form));

  // The form as a script draws it: its seat, then the mark's own drawn code points (which is where the jazam's Madani
  // U+06E1 comes from, and where a mark with no `forms` gets its plain code point).
  const glyphOf = (form, script = scriptNow()) => String.fromCharCode(seatCode(form, script)) + marks.drawnOf(markOf(form), script);
  const leadOf = (form) => (form.lead ? String.fromCharCode(...form.lead) : '');
  // What the tile, the prompt and the writing board show: the lead (jazam forms only), then the form.
  const drawnOf = (form, script = scriptNow()) => leadOf(form) + glyphOf(form, script);

  // A hamza-seat key a word uses in place of a letter: the script's glyph for it, or null for anything that is not one (so
  // every earlier word is unchanged: the hook in spell.js and exercise.js reads null as "not mine").
  function seatOf(key, script = scriptNow()) {
    const at = typeof key === 'string' && key.length === 1 ? SEAT_KEYS[key.charCodeAt(0)] : null;
    if (!at) return null;
    const seat = SEATS[at.seat];
    return String.fromCharCode(script === 'indopak' ? seat.indopak : at.below ? seat.madaniBelow : seat.madani);
  }

  const audioOf = (form) => {
    const [kind, glyph] = AUDIO[form.mark];
    return { kind, glyph: String.fromCharCode(glyph) };
  };

  const nameOf = (form, shell, templates = TEMPLATES) => {
    const mark = marks.nameOf(markOf(form), shell);
    return fill(form.mark === 'sukun' ? templates.jazam : templates.form, { mark, Mark: marks.cap(mark), jazam: mark });
  };

  // One item per form, the 15, in the order above. `marked: true` and `parts` are what marks.poolFor, marks.stats and
  // marks.sizes read, so the engine's arithmetic is the mark lessons' own (docs/lesson-16/03 §3).
  function itemsFor(shell, options = {}) {
    const { templates = TEMPLATES, script = scriptNow() } = options;
    return formsOf().map((form) => ({
      id: idOf(form),
      glyph: drawnOf(form, script),
      name: nameOf(form, shell, templates),
      family: [], // no form has a look-alike that matters: the four seats ARE look-alikes, and the point is that they do not matter
      audio: audioOf(form),
      required: false,
      traceable: true,
      marked: true,
      mark: form.mark,
      seat: form.seat,
      markName: marks.nameOf(markOf(form), shell),
      parts: form.parts.slice(),
    }));
  }

  // The names changed: the same items with new names, so the engine keeps them.
  function rename(items, shell, templates = TEMPLATES) {
    const byId = new Map(formsOf().map((form) => [idOf(form), form]));
    for (const item of items) {
      const form = byId.get(item.id);
      if (!form) continue;
      item.markName = marks.nameOf(markOf(form), shell);
      item.name = nameOf(form, shell, templates);
    }
  }

  // The board: a row per mark, a column per seat, a form in a cell if the form exists and null if it does not
  // (docs/lesson-16/03 §4). Reading a row across is the lesson: the same sound on four seats.
  const gridOf = () => ROWS.map((mark) => ({
    mark,
    cells: SEAT_ORDER.map((seat) => formsOf().find((form) => form.seat === seat && form.mark === mark) || null),
  }));

  // The four parts (the rail's own shape, marks.partsOf's): `n` and the form that stands for the part.
  const partsOf = (rule = HAMZA) => Array.from({ length: rule.parts }, (_, i) => ({ n: i + 1, sample: SAMPLES[i] }));
  const sampleOf = (part, script = scriptNow()) => {
    const sample = SAMPLES[Math.max(1, Math.min(HAMZA.parts, part)) - 1];
    return glyphOf({ seat: sample.seat, mark: sample.mark }, script);
  };
  // The forms that make up one row or one part.
  const inPart = (form, n) => form.parts.includes(n);
  // The board dims a cell until its part is reached ("comes later"): a form is met in the first part it belongs to.
  const firstPartOf = (form) => form.parts[0];

  // What the rule page needs of a rule, as one object (docs/lesson-17/01 §3): rule-lesson.js reads `KITS[data-rule]` and never
  // a rule's own functions. The hamza's is the functions above, unchanged; Lesson 17's is registered by ends.js (the round taa
  // and the end yaa are not a seat and a mark, so they have their own forms and their own board). `board` says which of the
  // page's two boards to draw: the seat grid, or the ends.
  const KITS = {
    hamza: {
      board: 'grid', formsOf, partsOf, sampleOf, idOf, drawnOf, glyphOf, audioOf, itemsFor, rename, inPart, firstPartOf,
      templatesOf: (d) => ({ form: d.nameForm, jazam: d.nameJazam }),
      // The title's one glyph: the alif seat with zabar.
      titleGlyph: () => glyphOf(formsOf().find((f) => f.seat === 'alif' && f.mark === 'fatha')),
      // Under a wrong answer: the same sound on every seat that has it, and which of the page's lines says so.
      echoOf: (item) => ({ line: 'line', forms: gridOf().find((r) => r.mark === item.mark).cells.filter(Boolean) }),
    },
  };

  // A round taa (ة) or an end yaa (ى) in a WORD (Lesson 17, docs/lesson-17/01 §5). Neither is one of the 29 letters, so a word
  // writes them as their own key, the way the hamza seats are written: ['ة', mark] is a round taa with any of the six marks a
  // word ends in, and ['ى', 'ee'] or ['ى', 'aa'] is an end yaa read as a long "ee" or a long "aa". `wordUnits` draws a whole word
  // that holds one, for the script in use, and returns null for every other key, so no earlier word can change (the hook in
  // spell.js and exercise.js reads `hasEnd` first). The long "aa" is the one form that touches the letter BEFORE it: Madani puts a
  // small alif on the yaa and leaves the zabar where it is; Indo-Pak turns the zabar of the letter before into a khari zabar
  // (U+0670) and leaves the yaa bare (docs/pass-2/01 §8, checked against Quran.com).
  const TAA_MARBUTA = 0x0629;
  const END_YAA = 0x0649;
  const SMALL_ALIF = 0x0670;
  const FATHA = 0x064E;
  const ENDS = { taa: String.fromCharCode(TAA_MARBUTA), yaa: String.fromCharCode(END_YAA) };
  const endOf = (key, id) => {
    if (key === ENDS.taa) return { kind: 'taa' };
    if (key === ENDS.yaa && (id === 'ee' || id === 'aa')) return { kind: 'yaa', read: id };
    return null;
  };
  const hasEnd = (root) => Array.isArray(root) && root.some(([key, id]) => endOf(key, id));
  function wordUnits(root, letterOf, script = scriptNow()) {
    const units = [];
    root.forEach(([key, id]) => {
      const end = endOf(key, id);
      if (!end) {
        const seat = seatOf(key, script);
        units.push(seat ? seat + marks.drawnOf(marks.markOf(id), script) : marks.glyphOf(letterOf(key), marks.markOf(id), script));
      } else if (end.kind === 'taa') {
        units.push(ENDS.taa + marks.drawnOf(marks.markOf(id), script));
      } else if (end.read === 'ee') {
        // Indo-Pak marks the long "ee" yaa with a jazam (Lesson 13's rule); Madani leaves it bare.
        units.push(ENDS.yaa + (script === 'indopak' ? marks.drawnOf(marks.markOf('sukun'), 'indopak') : ''));
      } else if (script === 'indopak') {
        const before = units.length - 1;
        if (before >= 0) units[before] = units[before].replace(String.fromCharCode(FATHA), String.fromCharCode(SMALL_ALIF));
        units.push(ENDS.yaa);
      } else {
        units.push(ENDS.yaa + String.fromCharCode(SMALL_ALIF));
      }
    });
    return units;
  }

  window.qaidaRules = {
    RULES, SEATS, SEAT_ORDER, ROWS, TEMPLATES, LEAD, KITS, ENDS, endOf, hasEnd, wordUnits,
    formsOf, partsOf, idOf, glyphOf, leadOf, drawnOf, nameOf, audioOf, itemsFor, rename, gridOf, seatOf, sampleOf, inPart, firstPartOf,
    // The engine's arithmetic is the mark lessons' own: the same three functions, on items that carry `marked` and `parts`.
    sizes: marks.sizes, stats: marks.stats, poolFor: marks.poolFor,
  };
})();
