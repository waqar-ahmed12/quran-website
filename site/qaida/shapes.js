// The free Qaida, Lesson 3: the data layer. QAIDA-BUILD.md step 5; the specification is docs/lesson-3/.
//
// Which letters take which forms, how a form is written down, which forms are asked about, and which "group" each
// belongs to. No DOM and no storage here, so tools/qaida-check.js can load it in node and check the counts, the ids
// and the band arithmetic without a browser. lesson-3.js is the page and decides nothing in this file.
//
// A joined shape is produced with U+200D ZERO WIDTH JOINER (docs/lesson-3/02-the-forms.md §1): a letter takes its shape
// from its neighbours, so to show one form alone it is given an invisible neighbour. Always written with String.fromCharCode, never as a pasted character, because a literal joiner is invisible in every editor and diff.

(() => {
  const ZWJ = String.fromCharCode(0x200D);
  const POSITIONS = ['isolated', 'initial', 'medial', 'final'];

  const FORM = {
    isolated: (g) => g,
    initial: (g) => g + ZWJ,
    medial: (g) => ZWJ + g + ZWJ,
    final: (g) => ZWJ + g,
  };
  // A letter that never joins forward has one joined shape, and it is the final one.
  FORM.joined = FORM.final;

  // The letter groups ("bands"), easy shapes first. Six, not the five first specified: the user, 2026-09-20, chose to
  // split the big band of joining letters in two rather than shorten the lesson (docs/lesson-3/09-open-questions.md §1).
  // Keys are Madani letters; shell.keyOf folds the Indo-Pak ک ہ ی onto them, so one table serves both scripts.
  const BANDS = [
    { n: 1, keys: ['ا', 'د', 'ذ', 'ر', 'ز', 'و'] }, // never join forward
    { n: 2, keys: ['ط', 'ظ'] }, // barely change
    { n: 3, keys: ['ب', 'ت', 'ث', 'ن', 'ي', 'س', 'ش'] }, // a tooth and a tail
    { n: 4, keys: ['ص', 'ض', 'ف', 'ق', 'ل'] }, // loops and tails
    { n: 5, keys: ['ج', 'ح', 'خ', 'ع', 'غ', 'ه', 'ك', 'م'] }, // the shape-shifters
    { n: 6, keys: [] }, // the whole table: nothing new to drill
  ];
  const TABLE = BANDS.length; // the last band is the reference table
  const DRILLING = BANDS.filter((band) => band.keys.length).map((band) => band.n);

  const BAND_OF = new Map();
  for (const band of BANDS) for (const key of band.keys) BAND_OF.set(key, band.n);
  BAND_OF.set('ء', 1); // shown with the six that never join; only ever an item when every position is drilled

  const NO_JOIN = new Set(['ا', 'د', 'ذ', 'ر', 'ز', 'و']);
  const BARELY_CHANGE = new Set(['ط', 'ظ']);

  // standalone: ء, joins to nothing. back-only: joins to the letter before it and never to the one after. both: the rest.
  const classOf = (key) => (key === 'ء' ? 'standalone' : NO_JOIN.has(key) ? 'back-only' : 'both');

  // Which positions become an item. `new` is only the shapes the student has not already been drilled on: the isolated
  // letter was taught in Lesson 1 and drilled in Lesson 2. `all` drills every position (docs/lesson-3/01 §3).
  function positionsOf(key, drilled) {
    const cls = classOf(key);
    const all = drilled === 'all';
    if (cls === 'standalone') return all ? ['isolated'] : [];
    if (cls === 'back-only') return all ? ['isolated', 'joined'] : ['joined'];
    if (BARELY_CHANGE.has(key)) return all ? POSITIONS.slice() : ['medial'];
    return all ? POSITIONS.slice() : ['initial', 'medial', 'final'];
  }

  // The words for each position; the page overwrites these from its tagged elements, so they can be edited.
  const TEMPLATES = {
    isolated: '{name}, on its own',
    initial: '{name}, start of a word',
    medial: '{name}, middle of a word',
    final: '{name}, end of a word',
    joined: '{name}, joined',
  };

  const fill = (text, values) => String(text || '').replace(/\{(\w+)\}/g, (whole, key) => (key in values ? values[key] : whole));

  // The engine only guarantees that ONE wrong answer shares a tag with the right one, and takes the first sharer it
  // finds, so what the wrong answers look like is decided by which tags exist, not by their order.
  //   position:    the same position, another letter (ـبـ against ـتـ): the sharpest wrong answer.
  //   same-letter: another shape of the same letter: a harder question, offered as a tryout.
  function familyFor(key, position, distractors) {
    if (distractors === 'same-letter') return [`letter:${key}`];
    return [`pos:${position}`];
  }

  const bandOf = (key) => BAND_OF.get(key) || 0;

  // One item per shape that is asked about, in the student's script. Its id is the letter folded to Madani, so a
  // form known in one script is known in the other; the glyph is the chosen script's.
  function allItems(shell, options = {}) {
    const { drilled = 'new', templates = TEMPLATES, distractors = 'position' } = options;
    const items = [];
    for (const [glyph, name] of shell.lettersOf()) {
      const key = shell.keyOf(glyph);
      for (const position of positionsOf(key, drilled)) {
        items.push({
          id: `${key}:${position}`,
          glyph: FORM[position](glyph),
          name: fill(templates[position], { name }),
          family: familyFor(key, position, distractors),
          audio: { kind: 'letters', glyph }, // the LETTER's recording: there is no recording of a shape
          required: false,
          traceable: true, // a medial form is three characters, past the engine's own default of two
          base: glyph, // trace this, not the joined form (docs/lesson-3/06 §4)
          key,
          letterName: name, // "Haa", for the writing board's title: what is written is the letter, not the shape
          position,
          band: bandOf(key),
        });
      }
    }
    return items;
  }

  // What the drill is handed for one group. Only that group's shapes: a student on group 1 is asked about group 1, and the
  // wrong answers are group 1 too (the user, 2026-09-20: "i shouldn't be seeing the letters of other groups"). That
  // overrules the spec's "every band keeps the others in the mix". The table is the mix: it asks about all of them.
  // Still no engine change: `required` and the list it is given are all the engine needs (docs/lesson-3/03 §2).
  const poolFor = (items, band) => (band === TABLE ? items : items.filter((item) => item.band === band))
    .map((item) => ({ ...item, required: true }));

  // The names changed (or the words for a position did): the same items with new names, so the engine keeps them.
  function rename(items, shell, templates = TEMPLATES) {
    const names = new Map(shell.lettersOf().map(([glyph, name]) => [shell.keyOf(glyph), name]));
    for (const item of items) {
      item.letterName = names.get(item.key) || '';
      item.name = fill(templates[item.position], { name: item.letterName });
    }
  }

  const sizes = (items) => BANDS.map((band) => items.filter((item) => item.band === band.n).length);

  // How a band is going, worked out from what the shell holds. The engine only measures the band it was handed, and
  // the rail wants every band at once. The rule is the engine's: ready is enough known and nothing missed still shaky.
  function stats(shell, lesson, items, band, { target = 3, readyAt = 0.8, clean = true } = {}) {
    const record = shell.drillOf(lesson);
    const needed = band === TABLE ? items : items.filter((item) => item.band === band);
    const known = needed.filter((item) => (record.streak[item.id] || 0) >= target).length;
    const toFix = needed.filter((item) => (record.wrong[item.id] || 0) > 0 && (record.streak[item.id] || 0) < target).length;
    const total = needed.length;
    const ready = total > 0 && known / total >= readyAt - 1e-9 && (!clean || toFix === 0);
    return { total, known, toFix, ready };
  }

  // The board: what to show for one letter (docs/lesson-3/04 §3). `cells` is keyed by column; a column with no shape
  // is simply absent, so the page can draw a dash there and never two pairs of identical pictures.
  function rowFor(shell, glyph, name) {
    const key = shell.keyOf(glyph);
    const cls = classOf(key);
    const cells = { isolated: FORM.isolated(glyph) };
    let demo = '';
    if (cls === 'back-only') {
      cells.joined = FORM.joined(glyph);
      demo = `ب${glyph}ب`; // ب joins to it, and it does not join to the ب after: the gap is the lesson
    } else if (cls === 'both') {
      for (const position of ['initial', 'medial', 'final']) cells[position] = FORM[position](glyph);
      demo = glyph.repeat(3); // real neighbours join on their own, so no joiner is needed here
    }
    return { key, glyph, name, cls, cells, demo, barely: BARELY_CHANGE.has(key), band: bandOf(key) };
  }

  // Bands 1 to 5 show their own letters; the table shows all of them, in the order of the chosen script. ء sits with
  // band 1 but is a line of its own there (it has one shape), so it is not one of that band's rows.
  function boardRows(shell, band) {
    const letters = shell.lettersOf();
    const chosen = band === TABLE
      ? letters
      : letters.filter(([glyph]) => bandOf(shell.keyOf(glyph)) === band && classOf(shell.keyOf(glyph)) !== 'standalone');
    return chosen.map(([glyph, name]) => rowFor(shell, glyph, name));
  }

  // A letter of the band, in the chosen script, to stand for it on the rail.
  function sampleOf(shell, band) {
    const key = { 1: 'د', 2: 'ط', 3: 'ب', 4: 'ف', 5: 'ه', 6: 'ع' }[band];
    const found = shell.lettersOf().find(([glyph]) => shell.keyOf(glyph) === key);
    return found ? found[0] : '';
  }

  window.qaidaShapes = {
    ZWJ, POSITIONS, FORM, BANDS, TABLE, DRILLING, TEMPLATES,
    classOf, positionsOf, bandOf, allItems, poolFor, rename, sizes, stats, rowFor, boardRows, sampleOf, fill,
  };
})();
