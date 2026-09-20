// The free Qaida, Lessons 4 to 6: the data layer. QAIDA-BUILD.md step 6; the specification is docs/lesson-4/.
//
// One file for every mark lesson. Zabar (4), zair (5) and paish (6) are the same lesson with a different stroke, so what
// differs is a row of MARKS and the wording; nothing else. No DOM and no storage here, so tools/qaida-check.js can load it
// in node and check the items, the ids and the group arithmetic without a browser. mark-lesson.js is the page and decides
// nothing in this file.
//
// The mark is composed, never pasted (docs/lesson-4/02 §1): a combining mark typed into source is invisible in every
// editor and diff, survives one careless edit and then silently vanishes. Always String.fromCharCode.

(() => {
  // `first`: the six letters a student meets the mark on. They are chosen for THIS mark (docs/lesson-5/02 §3): the ones whose
  // shape stays out of its way. Above and below are not the same six. `sample` is the one letter that stands for the lesson
  // in the title and on the rail. `after`: the mark this lesson is shown against, whose letters ride along as the wrong
  // answers (docs/lesson-5/03 §2); the first mark has none.
  const MARKS = {
    fatha: {
      id: 'fatha', cp: 0x064E, names: { fatha: 'fatha', zabar: 'zabar' }, sits: 'above', lesson: 4, audio: 'fatha',
      first: ['ب', 'د', 'ر', 'س', 'م', 'ل'], sample: 'ب', after: null,
    },
    kasra: {
      id: 'kasra', cp: 0x0650, names: { fatha: 'kasra', zabar: 'zair' }, sits: 'below', lesson: 5, audio: 'kasra',
      // None has a dot underneath and none dips below the line, so the mark sits in clear space. د is also in fatha's six.
      first: ['ا', 'د', 'ت', 'ط', 'ك', 'ه'], sample: 'د', after: 'fatha',
    },
    damma: {
      id: 'damma', cp: 0x064F, names: { fatha: 'damma', zabar: 'paish' }, sits: 'above', lesson: 6, audio: 'damma',
      first: ['ب', 'د', 'ر', 'س', 'م', 'ل'], sample: 'ب', after: 'kasra',
    },
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
  // {other} is the mark this one is shown against ("the same stroke as zabar"), in the student's own word for it.
  const otherOf = (mark) => (mark.after ? MARKS[mark.after] : null);
  function wordsFor(mark, shell) {
    const other = otherOf(mark);
    const otherName = other ? nameOf(other, shell) : '';
    return { mark: nameOf(mark, shell), Mark: cap(nameOf(mark, shell)), other: otherName, Other: cap(otherName) };
  }

  const TEMPLATES = { marked: '{name} with {mark}', bare: '{name}' };

  // The two groups (docs/lesson-4/09 §2, the recommendation): six letters to meet the mark on, then all of them. Which six is
  // the mark's own (`first`). Part 2 is every letter.
  const GROUP_ONE = MARKS.fatha.first; // kept for tools/qaida-check.js, which asks about the first mark's six
  const COUNT = 2;
  const DRILLING = [1, 2];

  const inGroup = (key, group, mark) => group === 2 || mark.first.includes(key);
  const groupOf = (key, mark) => (mark.first.includes(key) ? 1 : 2);

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

  // The 29 marked items, in the chosen script. The id folds to Madani and the glyph does not, so a student who learnt baa with
  // its mark in Indo-Pak keeps the credit after switching (docs/lesson-4/02 §2).
  function allItems(shell, mark, options = {}) {
    const { templates = TEMPLATES, distractors = 'look-alike', looks = [] } = options;
    const words = wordsFor(mark, shell);
    return shell.lettersOf().map(([glyph, name]) => {
      const key = shell.keyOf(glyph);
      return {
        id: key + String.fromCharCode(mark.cp),
        glyph: glyphOf(glyph, mark),
        name: fill(templates.marked, { ...words, name }),
        family: familyFor(key, distractors, looks),
        audio: { kind: mark.audio, glyph }, // the SOUND, "ba", not the letter's name
        required: false,
        traceable: true, // two characters, but say so: the engine's own default is not this lesson's to rely on
        base: glyph, // lesson-only: the tracer, the audio lookup and the bare twin use it
        key,
        letterName: name,
        markName: words.mark,
        marked: true,
        mark: mark.id, // whose stroke this is: "one of the lesson's own" is item.mark === mark.id (docs/lesson-5/03 §4)
        group: groupOf(key, mark),
      };
    });
  }

  // The same letters with the OTHER mark, for the wrong answers: in Lesson 5 the contrast that means something is above
  // against below (baa with zair against baa with zabar), and bare against marked is one the student already has (docs/lesson-5/03 §2). `keys` says
  // which letters, deterministically: the open part's own, so every item has its twin. They are review, never required, and
  // group 0, so sizes(), stats() and poolFor() never count them. The id ends in the other mark, so it cannot collide with an
  // item of this lesson's or with a bare letter.
  function twinItems(shell, mark, options = {}) {
    const { keys = [], templates = TEMPLATES, distractors = 'which-mark', looks = [] } = options;
    const other = otherOf(mark);
    if (!other || !keys.length) return [];
    const words = wordsFor(other, shell);
    const names = new Map(shell.lettersOf().map(([glyph, name]) => [shell.keyOf(glyph), { glyph, name }]));
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
        group: 0,
      };
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

    // Mixed review reaches back two lessons (docs/lesson-5/03 §2): the letters missed in Lesson 2, and, when this mark has
    // one before it, the letters missed there. That lesson's ids are the letter and its mark, so a letter is the first character.
    const before = mark && otherOf(mark) ? shell.drillOf(otherOf(mark).lesson) : null;
    const suffix = mark && otherOf(mark) ? String.fromCharCode(otherOf(mark).cp) : '';
    const shaky = (rec, id) => (rec.wrong[id] || 0) > 0 && (rec.streak[id] || 0) < (rec.target || 3);
    const hard = keys
      .map((key, i) => {
        let wrong = shaky(record, key) ? record.wrong[key] : 0;
        if (before && shaky(before, key + suffix)) wrong += before.wrong[key + suffix];
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
        group: 0,
      };
    });
  }

  // What the drill is handed for one group: that group's marked letters, all required. A student on group 1 is asked about
  // group 1 (the user, 2026-09-20, on Lesson 3: "i shouldn't be seeing the letters of other groups"). The spec's "the rest
  // stay in at half weight" is not built; the bare review letters, which the page adds, are the mix.
  // An item's group is 1 or 2 for the lesson's own, and 0 for review (the bare letters and the other mark's twins), so "is it one
  // of the lesson's own, and is it in this part" is `item.group > 0 && (part === 2 || item.group === 1)`. The functions below
  // are only ever handed the lesson's own items; the group test also keeps them right if they are ever handed more.
  const inPart = (item, group) => item.marked && item.group > 0 && (group === 2 || item.group === 1);
  const poolFor = (items, group) => items.filter((item) => inPart(item, group)).map((item) => ({ ...item, required: true }));

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

  const sizes = (items) => [1, 2].map((group) => items.filter((item) => inPart(item, group)).length);

  // How a group is going, worked out from what the shell holds. The engine only measures the group it was handed and the
  // rail wants both at once. The rule is the engine's: ready is enough known and nothing missed still shaky.
  function stats(shell, lesson, items, group, { target = 3, readyAt = 0.8, clean = true } = {}) {
    const record = shell.drillOf(lesson);
    const needed = items.filter((item) => inPart(item, group));
    const known = needed.filter((item) => (record.streak[item.id] || 0) >= target).length;
    const toFix = needed.filter((item) => (record.wrong[item.id] || 0) > 0 && (record.streak[item.id] || 0) < target).length;
    const total = needed.length;
    const ready = total > 0 && known / total >= readyAt - 1e-9 && (!clean || toFix === 0);
    return { total, known, toFix, ready };
  }

  // The board: one row per letter of the group, the bare letter beside the marked one. `other` is the same letter with the
  // mark this lesson is shown against (empty for the first mark), so the board can show where the stroke moved.
  function boardRows(shell, mark, group) {
    const other = otherOf(mark);
    return shell.lettersOf()
      .filter(([glyph]) => inGroup(shell.keyOf(glyph), group, mark))
      .map(([glyph, name]) => ({
        key: shell.keyOf(glyph), glyph, name, marked: glyphOf(glyph, mark), joined: joinedOf(glyph, mark),
        other: other ? glyphOf(glyph, other) : '',
      }));
  }

  // A letter of the group, in the chosen script, to stand for it on the rail: the mark's own sample for part 1, and a letter
  // that hangs below the line for part 2, which is in every mark's list.
  function sampleOf(shell, mark, group) {
    const key = group === 1 ? mark.sample : 'ع';
    const found = shell.lettersOf().find(([glyph]) => shell.keyOf(glyph) === key);
    return found ? glyphOf(found[0], mark) : '';
  }

  window.qaidaMarks = {
    MARKS, TEMPLATES, GROUP_ONE, COUNT, DRILLING,
    markOf, otherOf, nameOf, glyphOf, aloneOf, joinedOf, wordsFor, fill, cap,
    inGroup, groupOf, allItems, twinItems, reviewItems, reviewKeys, poolFor, rename, sizes, stats, boardRows, sampleOf,
  };
})();
