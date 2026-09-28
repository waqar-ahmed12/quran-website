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
    fathatain: {
      id: 'fathatain', cp: 0x064B, names: { fatha: 'fathatain', zabar: 'do zabar' }, sits: 'above', lesson: 7,
      audio: 'fathatain', first: MARKS.fatha.first, sample: 'ب', against: ['fatha'],
    },
    kasratain: {
      id: 'kasratain', cp: 0x064D, names: { fatha: 'kasratain', zabar: 'do zair' }, sits: 'below', lesson: 7,
      audio: 'kasratain', first: MARKS.kasra.first, sample: 'د', against: ['kasra'],
    },
    dammatain: {
      id: 'dammatain', cp: 0x064C, names: { fatha: 'dammatain', zabar: 'do paish' }, sits: 'above', lesson: 7,
      audio: 'dammatain', first: MARKS.damma.first, sample: 'ب', against: ['damma'],
    },
  });

  // A lesson usually teaches one mark. Lesson 7 teaches three (the doubled marks), in the order they are drilled,
  // and Lesson 9 (standing harakaat) will teach three more the same way. A page naming a single mark
  // (`data-mark="damma"`) gets a list of one, which is exactly what lessons 4, 5 and 6 already are.
  const SETS = {
    tanween: {
      id: 'tanween', lesson: 7, names: { fatha: 'tanween', zabar: 'tanween' },
      marks: ['fathatain', 'kasratain', 'dammatain'],
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
  const glyphOf = (letter, mark) => letter + String.fromCharCode(mark.cp);
  // A bare combining mark has nothing to sit on, so the dotted circle (U+25CC) is its base: what the character is for.
  const aloneOf = (mark) => String.fromCharCode(0x25CC) + String.fromCharCode(mark.cp);
  // The same letter twice, beside itself, so the mark can be seen to travel with it (docs/lesson-4/04 §3c). Neighbours
  // join on their own, so no joiner is needed; it is a letter beside itself and not a word.
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
      const id = key + String.fromCharCode(mark.cp);
      let item = byId.get(id);
      if (!item) {
        const found = names.get(key) || { glyph: key, name: '' };
        const words = wordsFor(mark, shell);
        item = {
          id,
          glyph: glyphOf(found.glyph, mark),
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
        const item = itemFor(key, markAt(list, at < 0 ? 0 : at));
        if (!item.parts.includes(last.n)) item.parts.push(last.n);
      });
    }
    // Every warm-up part: its own mark, on its own six letters. Already-seen (letter, mark) pairs just gain this
    // part; a pair the last part did not happen to land on becomes a new item, appended after the 29 (Lesson 7's
    // ب, say, needs both a fathatain item and a dammatain item, and at most one of them is the rotated one).
    for (const part of parts) {
      if (!part.first) continue;
      for (const key of part.mark.first) {
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
          id: key + String.fromCharCode(other.cp),
          glyph: glyphOf(glyph, other),
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
    const earlier = (mark ? othersOf(mark) : []).map((m) => ({ rec: shell.drillOf(m.lesson), suffix: String.fromCharCode(m.cp) }));
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
    return shell.lettersOf()
      .filter(([glyph]) => !keys || keys.includes(shell.keyOf(glyph)))
      .map(([glyph, name]) => ({
        key: shell.keyOf(glyph), glyph, name, marked: glyphOf(glyph, mark), joined: joinedOf(glyph, mark),
        others: others.map((m) => ({ id: m.id, glyph: glyphOf(glyph, m), name: nameOf(m, shell) })),
      }));
  }

  // A letter of the part, in the chosen script, to stand for it on the rail: the mark's own sample for a warm-up, and a
  // letter that hangs below the line for the last part (in every mark's list), so the taller stroke has always been seen
  // before it matters.
  function sampleOf(shell, mark, part) {
    const p = typeof part === 'object' ? part : { first: part === 1, every: part !== 1 };
    const key = p.every || !p.first ? 'ع' : mark.sample;
    const found = shell.lettersOf().find(([glyph]) => shell.keyOf(glyph) === key);
    return found ? glyphOf(found[0], mark) : '';
  }

  window.qaidaMarks = {
    MARKS, TEMPLATES, GROUP_ONE, COUNT, DRILLING,
    SETS, setOf, marksOf, partsOf, markAt,
    markOf, otherOf, othersOf, nameOf, glyphOf, aloneOf, joinedOf, wordsFor, fill, cap,
    allItems, twinItems, reviewItems, reviewKeys, poolFor, inPart, rename, sizes, stats, boardRows, sampleOf,
  };
})();
