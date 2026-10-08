// The free Qaida — the parts both pages share: what the student chose, how far they've reached, the 29/30 letters of
// each script, the fourteen lessons, the first-visit choice, and the light/dark switch.
// Loaded before home.js and qaida.js. QAIDA-BUILD.md step 1; the design is recorded in
// design-system/quran-landing/pages/qaida.md.

(() => {
  const root = document.documentElement;
  const STORE = 'qaida';
  const $ = (selector) => document.querySelector(selector);

  // The letters -------------------------------------------------------------------------------
  // [letter, its name]. The names are the Arabic ones in both sets of mark names (the user, 2026-09-18: "even in
  // zabar zair paish, you have to write in arabic the names, like baa and not be") — what the student's choice of
  // names changes is the marks, and the titles of lessons 4–14. The list is a stand-in the teacher checks
  // (QAIDA-CONTENT.md); it's editable in Options → Script and names.

  // Madani: the 29 in alphabet order, as a printed Madani Qaida.
  const MADANI = [
    ['ا', 'Alif'],
    ['ب', 'Baa'],
    ['ت', 'Taa'],
    ['ث', 'Thaa'],
    ['ج', 'Jeem'],
    ['ح', 'Ḥaa'],
    ['خ', 'Khaa'],
    ['د', 'Daal'],
    ['ذ', 'Dhaal'],
    ['ر', 'Raa'],
    ['ز', 'Zaa'],
    ['س', 'Seen'],
    ['ش', 'Sheen'],
    ['ص', 'Ṣaad'],
    ['ض', 'Ḍaad'],
    ['ط', 'Ṭaa'],
    ['ظ', 'Ẓaa'],
    ['ع', 'ʿAyn'],
    ['غ', 'Ghayn'],
    ['ف', 'Faa'],
    ['ق', 'Qaaf'],
    ['ك', 'Kaaf'],
    ['ل', 'Laam'],
    ['م', 'Meem'],
    ['ن', 'Noon'],
    ['ه', 'Haa'],
    ['و', 'Waaw'],
    ['ء', 'Hamzah'],
    ['ي', 'Yaa'],
  ];

  // Indo-Pak: the same 29 letters in the order of a printed Indo-Pak Qaida — و before ه, and the Indo-Pak forms of
  // kaaf, haa and yaa (ک ہ ی). Laam stays; lam-alif is not taught as a letter of its own (the user, 2026-09-18).
  const INDOPAK = [
    ['ا', 'Alif'],
    ['ب', 'Baa'],
    ['ت', 'Taa'],
    ['ث', 'Thaa'],
    ['ج', 'Jeem'],
    ['ح', 'Ḥaa'],
    ['خ', 'Khaa'],
    ['د', 'Daal'],
    ['ذ', 'Dhaal'],
    ['ر', 'Raa'],
    ['ز', 'Zaa'],
    ['س', 'Seen'],
    ['ش', 'Sheen'],
    ['ص', 'Ṣaad'],
    ['ض', 'Ḍaad'],
    ['ط', 'Ṭaa'],
    ['ظ', 'Ẓaa'],
    ['ع', 'ʿAyn'],
    ['غ', 'Ghayn'],
    ['ف', 'Faa'],
    ['ق', 'Qaaf'],
    ['ک', 'Kaaf'],
    ['ل', 'Laam'],
    ['م', 'Meem'],
    ['ن', 'Noon'],
    ['و', 'Waaw'],
    ['ہ', 'Haa'],
    ['ء', 'Hamzah'],
    ['ی', 'Yaa'],
  ];

  // Shape families: letters that share a shape and differ only by their dots sit together. By position in the list.
  const familiesFor = (letters) => {
    const groups = [[0], [1, 2, 3], [4, 5, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16], [17, 18], [19, 20]];
    for (let i = 21; i < letters.length; i += 1) groups.push([i]);
    return groups;
  };

  const SCRIPTS = {
    madani: { letters: MADANI, families: familiesFor(MADANI) },
    indopak: { letters: INDOPAK, families: familiesFor(INDOPAK) },
  };

  // The fourteen lessons ----------------------------------------------------------------------
  // The sequence is QAIDA-CONTENT.md's. Titles that name a mark change with the student's choice of names.
  // Only lesson 1 is built; the rest say so when tapped.

  const LESSONS = [
    // `progress` says how the home counts a lesson: 'letters' seen, or a 'drill' of letters known. Declared here so the
    // home never has to test a lesson's number.
    { n: 1, title: { fatha: 'The letters', zabar: 'The letters' },
      lede: 'All the letters, in the order of a printed Qaida.', href: 'lesson-1.html', built: true, progress: 'letters' },
    { n: 2, title: { fatha: 'Letters out of order', zabar: 'Letters out of order' },
      lede: 'The same letters, shuffled, so each one is known cold.', href: 'lesson-2.html', built: true, progress: 'drill' },
    { n: 3, title: { fatha: 'Letter shapes', zabar: 'Letter shapes' },
      lede: 'How a letter changes at the start, the middle and the end of a word.',
      href: 'lesson-3.html', built: true, progress: 'drill' },
    // `cp` is the mark a lesson of marks teaches: its own items' ids end in it, and the home counts only those (see
    // masteredCount), because the lesson's review (bare letters, the other mark's twins) is recorded under other ids.
    { n: 4, title: { fatha: 'Fatha', zabar: 'Zabar' }, href: 'lesson-4.html', built: true, progress: 'drill', cp: 0x064E,
      lede: 'The short “a”, written above the letter.' },
    { n: 5, title: { fatha: 'Kasra', zabar: 'Zair' }, href: 'lesson-5.html', built: true, progress: 'drill', cp: 0x0650,
      lede: 'The short “i”, written under the letter.' },
    { n: 6, title: { fatha: 'Damma', zabar: 'Paish' }, href: 'lesson-6.html', built: true, progress: 'drill', cp: 0x064F,
      lede: 'The short “u”, written above the letter.' },
    { n: 7, title: { fatha: 'Tanween', zabar: 'Tanween' }, href: 'lesson-7.html', built: true, progress: 'drill',
      cp: [0x064B, 0x064C, 0x064D], lede: 'The doubled marks: an, in and un at the end of a word.' },
    { n: 8, title: { fatha: 'Fatha and alif', zabar: 'Zabar and alif' }, href: 'lesson-8.html', built: true,
      progress: 'drill', cp: 0x064E, tail: [0x0627], lede: 'The long “aa”: an alif after the mark.' },
    { n: 9, title: { fatha: 'Standing marks', zabar: 'Standing harakaat' }, href: 'lesson-9.html', built: true,
      progress: 'drill', cp: [0x0670, 0x0656, 0x0657], lede: 'The same three long vowels, written as marks on their own.' },
    { n: 10, title: { fatha: 'Fatha and waw', zabar: 'Zabar and wow' }, href: 'lesson-10.html', built: true,
      progress: 'drill', cp: 0x064E, tail: [0x0648, 0x0652],
      lede: 'The “au” sound, where wow carries no mark of its own.' },
    { n: 11, title: { fatha: 'Damma and waw', zabar: 'Paish and wow' }, href: 'lesson-11.html', built: true,
      progress: 'drill', cp: 0x064F, tail: [0x0648, 0x0652],
      lede: 'The long “oo”, told apart from the lesson before.' },
    { n: 12, title: { fatha: 'Fatha and yaa', zabar: 'Zabar and yaa' }, href: 'lesson-12.html', built: true,
      progress: 'drill', cp: 0x064E, tail: [0x064A, 0x0652],
      lede: 'The “ai” sound, where yaa carries no mark of its own.' },
    { n: 13, title: { fatha: 'Kasra and yaa', zabar: 'Zair and yaa' }, href: 'lesson-13.html', built: true,
      progress: 'drill', cp: 0x0650, tail: [0x064A, 0x0652],
      lede: 'The long “ee”, told apart from the lesson before.' },
    // Lesson 14's own ids are two characters ending in the jazam (the lead is drawn, never part of an id), and its
    // twins are two characters ending in a vowel, so masteredCount needs no change (docs/lesson-14/03 §8).
    { n: 14, title: { fatha: 'Sukoon', zabar: 'Jazam' }, href: 'lesson-14.html', built: true, progress: 'drill',
      cp: 0x0652, lede: 'The mark that stops a letter, on any letter at all.' },
    // The second pass (docs/pass-2/): lessons 15-29, from shadda to the last surahs. `part: 2` puts a lesson under the
    // home's second heading; a row with no `part` is in the first. Lesson 15's marks are a vowel and a shadda on one
    // letter, so its `cp` is a list of lists, one suffix per mark (docs/lesson-15/03 §1). Titles and ledes are from
    // docs/pass-2/README.md §2; none of 18-29 is built, so each says so when tapped and nothing is locked.
    { n: 15, part: 2, title: { fatha: 'Shadda', zabar: 'Tashdeed' }, href: 'lesson-15.html', built: true,
      progress: 'drill', cp: [[0x064E, 0x0651], [0x0650, 0x0651], [0x064F, 0x0651]],
      lede: 'A letter said twice: once to close the sound before it, once with its own vowel.' },
    // Lesson 16 is the first RULE lesson (docs/lesson-16/): fifteen forms, each a seat and a mark, on a page of its own
    // (rule-lesson.js). It has no `cp`: every id in its record is one of the fifteen forms (the page has no review items),
    // so masteredCount counts every recorded id, as it always did for a lesson with no `cp` (docs/lesson-16/03 §8).
    { n: 16, part: 2, title: { fatha: 'Hamza', zabar: 'Hamza' }, href: 'lesson-16.html', built: true, progress: 'drill',
      lede: 'One sound written on four seats.' },
    // Lesson 17 is the second RULE lesson (docs/lesson-17/): fourteen forms, a round taa with each of six marks and an end yaa
    // read two ways after four letters, on the rule page with a kit of its own (ends.js). No `cp`, as Lesson 16: every id in its
    // record is one of its fourteen forms, so masteredCount counts every recorded id.
    { n: 17, part: 2, title: { fatha: 'The round taa and the end yaa', zabar: 'The round taa and the end yaa' },
      href: 'lesson-17.html', built: true, progress: 'drill',
      lede: 'Two end shapes that are not among the 29 letters.' },
    // Lesson 18 is the third RULE lesson and the first with the Qur'an's own words (docs/lesson-18/): twelve words, copied and named by
    // reference, on the rule page with a kit of its own (al.js). No `cp`, as Lessons 16 and 17: every id in its record is one of its
    // twelve words, so masteredCount counts every recorded id.
    { n: 18, part: 2, title: { fatha: 'Al-', zabar: 'Al-' }, href: 'lesson-18.html', built: true, progress: 'drill',
      lede: 'The laam that is read before some letters and not before others, and the name Allah.' },
    // Lesson 19 is the fourth RULE lesson and the first with PAIRS of the Qur'an's own words (docs/lesson-19/): twenty-four words and
    // pairs, copied and named by reference, on the rule page with a kit of its own (wasl.js). No `cp`, as 16-18: every id in its record
    // is one of its twenty-four, so masteredCount counts every recorded id.
    { n: 19, part: 2, title: { fatha: 'The joining alif', zabar: 'The joining alif' }, href: 'lesson-19.html', built: true,
      progress: 'drill', lede: 'An alif that is read at the start of a word and skipped in the middle.' },
    // Lesson 20 is the fifth RULE lesson (docs/lesson-20/): twenty-four words and pairs, five kinds, copied and named by reference, on the
    // rule page with a kit of its own (madd.js). No `cp`, as 16-19: every id in its record is one of its twenty-four.
    { n: 20, part: 2, title: { fatha: 'The wavy line', zabar: 'The wavy line' }, href: 'lesson-20.html', built: true,
      progress: 'drill', lede: 'Hold a long vowel a little longer.' },
    // Lesson 21 is the sixth RULE lesson and the first whose question is to TAP a letter (docs/lesson-21/): thirty items by reference, eighteen
    // words (eighteen tapped, twelve asked as "is the lit letter read?"), on the rule page with a kit of its own (silent.js). No `cp`, as 16-20:
    // every id in its record is one of its thirty.
    { n: 21, part: 2, title: { fatha: 'Letters that are not read', zabar: 'Letters that are not read' }, href: 'lesson-21.html', built: true,
      progress: 'drill', lede: 'Written on the page, and left out when it is read.' },
    // Lesson 22 is the seventh RULE lesson (docs/lesson-22/): twenty-seven words by reference, fifteen asked "how do you stop on this word?" and
    // twelve "what does the lit sign say?", on the rule page with a kit of its own (stop.js). No `cp`, as 16-21: every id in its record is one of them.
    { n: 22, part: 2, title: { fatha: 'Stopping', zabar: 'Stopping' }, href: 'lesson-22.html', built: true,
      progress: 'drill', lede: 'How a word changes when you stop on it.' },
    // Lesson 23 is the first VERSE page (docs/lesson-23/): the seven verses of Al-Fatiha, copied and named by reference, read a verse at a time on a page of its
    // own (verses.js). It is not a drill, so it has no `cp` and no drill record: what it keeps is which verses have been read, as Lesson 1 keeps which letters
    // have been seen, and `progress: 'verses'` is how the home counts it.
    { n: 23, part: 2, title: { fatha: 'Al-Fatiha', zabar: 'Al-Fatiha' }, href: 'lesson-23.html', built: true, progress: 'verses', verses: 7,
      lede: 'The first surah, read whole.' },
    { n: 24, part: 2, title: { fatha: 'Noon and tanween', zabar: 'Noon and tanween' },
      lede: 'Four ways to read them: clear, merged, turned into meem, hidden.' },
    { n: 25, part: 2, title: { fatha: 'Meem with jazam', zabar: 'Meem with jazam' }, lede: 'Three ways to read it: merged, hidden, clear.' },
    { n: 26, part: 2, title: { fatha: 'The bounce', zabar: 'The bounce' },
      lede: 'Five letters that echo when they carry a jazam.' },
    { n: 27, part: 2, title: { fatha: 'Heavy and light letters', zabar: 'Heavy and light letters' },
      lede: 'The seven heavy letters, raa, and the laam of Allah.' },
    { n: 28, part: 2, title: { fatha: 'The opening letters', zabar: 'The opening letters' },
      lede: 'Letters read by their names, at the start of twenty-nine surahs.' },
    { n: 29, part: 2, title: { fatha: 'The last surahs', zabar: 'The last surahs' },
      lede: 'Real surahs, 105 to 114, read from the mushaf.' },
  ];

  // What the student chose and how far they've reached, on this device only (no accounts) ------
  // { v, script, names, grouping, chosen, muted, skipped,
  //   lessons: { "1": { seen: ["ا", …], done: false, drill: { total, target, right, wrong, streak } } } }
  // `drill` belongs to the practice engine (practice.js): lifetime right and wrong answers and the current run of right
  // answers, each a map from an item's id to a count. Lesson 1 never has one, so it stays empty there.

  const blank = () => ({
    v: 1, script: 'madani', names: 'fatha', grouping: 'families', chosen: false, muted: false, skipped: false, lessons: {},
  });

  const DRILL_TARGET = 2; // right answers in a row that make an item known, until the lesson says otherwise (2026-09-23: was 3)

  // Maps are built without a prototype: JSON.parse makes a real own "__proto__" key, and putting one on an ordinary
  // object hits the prototype setter instead of making a key.
  const emptyDrill = () => ({
    total: 0, target: DRILL_TARGET, right: Object.create(null), wrong: Object.create(null), streak: Object.create(null),
  });

  // This comes out of localStorage, which an older version of this file, another script on the origin or a damaged
  // profile may have written, so every part of it is checked and capped.
  const counts = (raw) => {
    const out = Object.create(null);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    let kept = 0;
    for (const [id, n] of Object.entries(raw)) {
      if (kept >= 400) break;
      if (typeof id !== 'string' || id.length < 1 || id.length > 24 || id === '__proto__') continue;
      if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) continue;
      out[id] = Math.min(Math.floor(n), 9999);
      kept += 1;
    }
    return out;
  };

  function readDrill(value) {
    const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return {
      total: Number.isInteger(raw.total) && raw.total >= 0 && raw.total <= 999 ? raw.total : 0,
      target: Number.isInteger(raw.target) && raw.target >= 1 && raw.target <= 9 ? raw.target : DRILL_TARGET,
      right: counts(raw.right),
      wrong: counts(raw.wrong),
      streak: counts(raw.streak),
    };
  }

  function read() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORE));
    } catch {
      // nothing saved, or a private window that refuses storage: start fresh
    }
    const state = blank();
    if (!saved || typeof saved !== 'object') return state;

    // Compared by value, not with `in`: a stored "toString" would otherwise pass and there'd be no such script.
    if (saved.script === 'madani' || saved.script === 'indopak') state.script = saved.script;
    if (saved.names === 'fatha' || saved.names === 'zabar') state.names = saved.names;
    if (saved.grouping === 'families' || saved.grouping === 'grid') state.grouping = saved.grouping;
    state.chosen = saved.chosen === true;
    state.muted = saved.muted === true;
    state.skipped = saved.skipped === true;

    // The first draft kept one flat list of lesson-1 positions. Carry it over, once, as letters.
    if (!saved.v && Array.isArray(saved.seen)) {
      const seen = saved.seen
        .filter((i) => Number.isInteger(i) && i >= 0 && i < MADANI.length)
        .map((i) => MADANI[i][0]);
      state.lessons['1'] = { seen: [...new Set(seen)], done: false, drill: emptyDrill() };
      return state;
    }

    if (saved.lessons && typeof saved.lessons === 'object') {
      for (const [key, value] of Object.entries(saved.lessons)) {
        if (!/^\d+$/.test(key) || !value || typeof value !== 'object') continue;
        const seen = Array.isArray(value.seen)
          ? value.seen.filter((g) => typeof g === 'string' && g.length <= 24).slice(0, 400)
          : [];
        state.lessons[key] = { seen: [...new Set(seen)], done: value.done === true, drill: readDrill(value.drill) };
      }
    }
    return state;
  }

  const state = read();

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch {
      // the lesson still works for this visit
    }
  }

  // How far, lesson by lesson -----------------------------------------------------------------

  // Reading a lesson never creates it: the home asks about all fourteen, and thirteen of them have nothing to say.
  const NO_DRILL = Object.freeze({
    total: 0,
    target: DRILL_TARGET,
    right: Object.freeze(Object.create(null)),
    wrong: Object.freeze(Object.create(null)),
    streak: Object.freeze(Object.create(null)),
  });
  const NOTHING = Object.freeze({ seen: Object.freeze([]), done: false, drill: NO_DRILL });
  const lessonState = (n) => state.lessons[String(n)] || NOTHING;

  function ownState(n) {
    const key = String(n);
    if (!state.lessons[key]) state.lessons[key] = { seen: [], done: false, drill: emptyDrill() };
    if (!state.lessons[key].drill) state.lessons[key].drill = emptyDrill();
    return state.lessons[key];
  }

  const scriptOf = (script) => (script === 'indopak' ? SCRIPTS.indopak : SCRIPTS.madani);
  const lettersOf = (script = state.script) => scriptOf(script).letters;

  // The same letter in the two scripts: ک is kaaf, ہ is haa, ی is yaa. A student who has seen kaaf has seen kaaf,
  // whichever form it was written in, so progress is kept under one of them. (Lam-alif has no Madani twin.)
  const SAME_LETTER = { 'ک': 'ك', 'ہ': 'ه', 'ی': 'ي' };
  const keyOf = (glyph) => SAME_LETTER[glyph] || glyph;

  // Seen letters are kept as letters, not positions, so switching script keeps credit for the ones both lists share.
  const seenKeys = (n) => new Set(lessonState(n).seen.map(keyOf));

  function seenCount(n, script = state.script) {
    const seen = seenKeys(n);
    return lettersOf(script).filter(([glyph]) => seen.has(keyOf(glyph))).length;
  }

  function markSeen(n, glyph) {
    const key = keyOf(glyph);
    if (seenKeys(n).has(key)) return false;
    ownState(n).seen.push(key);
    save();
    return true;
  }

  function clearLesson(n) {
    const lesson = lessonState(n);
    if (lesson === NOTHING) return;
    lesson.seen = [];
    lesson.done = false;
    lesson.drill = emptyDrill();
    save();
  }

  // The practice engine's record of a drill lesson (practice.js). Reading never creates anything.
  const drillOf = (n) => lessonState(n).drill || NO_DRILL;

  // How many items are known: those whose current run of right answers has reached the target. The target is the one
  // the lesson wrote down, so the home counts the way the lesson does. Only the lesson's own items count: a lesson of marks
  // records its review too (a bare letter, or the other mark's twin), and Lesson 5 can hold as many review ids as its own.
  // `ids` says exactly which; without it the lesson's row says (a mark lesson's own ids are one letter and its mark), and a
  // lesson with no such row counts everything, as it always did.
  function masteredCount(n, target, ids) {
    const drill = drillOf(n);
    const need = target || drill.target;
    const entry = LESSONS.find((lessonRow) => lessonRow.n === n);
    // `cp` is a code point, or a list of them (Lesson 7's three doubled marks): whichever, an id counts if it is one
    // letter followed by the mark (lessons 4-7) — or, for a lesson whose row carries `tail` (Lesson 8's alif;
    // lessons 10-13's wow/yaa with a sukun), by the mark AND its tail together. Lesson 8 SHARES zabar's code point
    // with Lesson 4, so on `cp` alone its twins ("ba", riding along as review) would count toward Lesson 8's own
    // total; the LENGTH is what keeps them out (docs/lesson-8/03 §3). A lesson with no `cp` at all (not yet a lesson
    // of marks) counts everything, as it always did.
    const tail = entry && entry.tail ? String.fromCharCode(...entry.tail) : '';
    // Lesson 15's marks are two code points on one letter (a vowel and the shadda), so an entry of `cp` may itself be a
    // list: one suffix per mark, each of them the list joined (docs/lesson-15/03 §1).
    const suffixes = entry && entry.cp ? [].concat(entry.cp).map((cp) => String.fromCharCode(...[].concat(cp)) + tail) : [];
    const wanted = ids ? new Set(ids) : null;
    return Object.entries(drill.streak).filter(([id, run]) => {
      if (run < need) return false;
      if (wanted) return wanted.has(id);
      return !suffixes.length || suffixes.some((s) => id.length === 1 + s.length && id.endsWith(s));
    }).length;
  }

  // Right: a run goes up by one. Wrong: the run goes back to nothing. Returns the item's new run.
  function recordAnswer(n, id, right) {
    const drill = ownState(n).drill;
    const bump = (map) => {
      map[id] = Math.min((map[id] || 0) + 1, 9999);
    };
    if (right) {
      bump(drill.right);
      bump(drill.streak);
    } else {
      bump(drill.wrong);
      drill.streak[id] = 0;
    }
    save();
    return drill.streak[id];
  }

  function setDrillTotal(n, total, target) {
    const drill = ownState(n).drill;
    if (drill.total === total && drill.target === target) return;
    drill.total = total;
    drill.target = target;
    save();
  }

  // The student's work on the drill and nothing else: what they have seen and whether the lesson is done stay.
  function clearDrill(n) {
    const lesson = lessonState(n);
    if (lesson === NOTHING) return;
    lesson.drill = emptyDrill();
    save();
  }

  // Lesson 1 is finished when every letter of the script in front of the student has been seen. The flag is kept so
  // later lessons, which won't be counted in letters, can set it themselves.
  function isDone(n) {
    if (n !== 1) return lessonState(n).done;
    return seenCount(1) === lettersOf().length;
  }

  function setDone(n, done) {
    if (lessonState(n).done === done) return;
    ownState(n).done = done;
    save();
  }

  // Every lesson opens (the user, 2026-09-19: "nothing is locked"; docs/lesson-2/09-going-in-order.md). What is kept
  // is which lesson is next up: the first one not finished. The home marks it "Start here", and a lesson opened ahead
  // of it gets a word of advice first — once, then never again (`skipped`).
  const nextUp = () => (LESSONS.find(({ n }) => !isDone(n)) || LESSONS[LESSONS.length - 1]).n;
  const inOrder = (n) => n === nextUp();

  function setSkipped(skipped) {
    if (state.skipped === skipped) return;
    state.skipped = skipped;
    save();
  }

  const doneCount = () => LESSONS.filter(({ n }) => isDone(n)).length;

  // What the student chose --------------------------------------------------------------------

  const listeners = [];
  const onChange = (fn) => listeners.push(fn);

  const setup = $('.setup');

  // A dot belongs between two things on one line. On a phone the line wraps, and a dot can be left starting the next
  // line or ending this one. One that would start a line is taken out (what followed it moves to the line's start); one
  // that ends a line is only made invisible, since taking it out could pull the next thing up beside it with no dot.
  function tidyDots() {
    // No-op outside a real browser (the checks in tools/ hand-make a DOM with no layout to measure).
    if (!setup || typeof setup.getBoundingClientRect !== 'function') return;
    const dots = [...setup.querySelectorAll('.dot')];
    for (const dot of dots) {
      dot.hidden = false;
      dot.style.visibility = '';
    }
    const middle = (el) => {
      const box = el.getBoundingClientRect();
      return box.top + box.height / 2;
    };
    for (const dot of dots) {
      const before = dot.previousElementSibling;
      const after = dot.nextElementSibling;
      if (!before || !after) continue;
      const y = middle(dot);
      if (Math.abs(middle(before) - y) > 2) dot.hidden = true;
      else if (Math.abs(middle(after) - y) > 2) dot.style.visibility = 'hidden';
    }
  }

  if (setup && typeof ResizeObserver === 'function') {
    let width = 0;
    new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === width) return;
      width = entry.contentRect.width;
      tidyDots();
    }).observe(setup);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(tidyDots);
  }

  function renderSetup() {
    root.dataset.script = state.script;
    root.dataset.names = state.names;
    root.dataset.grouping = state.grouping;
    if (setup) {
      const fill = (className, key) => {
        const node = setup.querySelector(className);
        if (node) node.textContent = setup.dataset[key] || '';
      };
      fill('.setup-script', state.script);
      fill('.setup-names', state.names);
      fill('.setup-grouping', state.grouping);
      tidyDots();
    }
    if (chooser) {
      for (const input of chooser.querySelectorAll('input')) input.checked = input.value === state[input.name];
    }
    for (const fn of listeners) fn();
  }

  // The first-visit choice --------------------------------------------------------------------

  const chooser = $('.chooser');
  const chooserButton = chooser && chooser.querySelector('.done');
  let closingChooser = false;
  let chooserTimer = 0;

  function closeChooser() {
    if (!chooser || !chooser.open || closingChooser) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      chooser.close();
      return;
    }
    closingChooser = true;
    chooser.classList.add('closing');

    const done = () => {
      clearTimeout(chooserTimer);
      chooser.removeEventListener('animationend', onEnd);
      chooser.classList.remove('closing');
      closingChooser = false;
      if (chooser.open) chooser.close();
    };

    const onEnd = (event) => {
      if (event.target === chooser) done();
    };

    chooser.addEventListener('animationend', onEnd);
    chooserTimer = setTimeout(done, 300);
  }

  function showChooser() {
    if (!chooser || (chooser.open && !closingChooser)) return;
    clearTimeout(chooserTimer);
    chooser.classList.remove('closing');
    closingChooser = false;
    if (chooserButton) {
      chooserButton.textContent = state.chosen ? chooserButton.dataset.later : chooserButton.dataset.first;
    }
    if (!chooser.open) chooser.showModal();
  }

  if (chooser) {
    const ASKED = ['script', 'names', 'grouping'];
    chooser.addEventListener('change', (event) => {
      if (!ASKED.includes(event.target.name)) return;
      state[event.target.name] = event.target.value;
      save();
      renderSetup();
    });

    chooser.addEventListener('close', () => {
      state.chosen = true;
      save();
      chooser.classList.remove('closing');
      closingChooser = false;
    });

    chooser.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeChooser();
    });

    const form = chooser.querySelector('form');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        closeChooser();
      });
    }

    // A click on the dimmed page around the panel closes it smoothly (the form fills the panel, so only the
    // backdrop is the dialog itself).
    chooser.addEventListener('click', (event) => {
      if (event.target === chooser) closeChooser();
    });
  }

  for (const button of document.querySelectorAll('.open-settings')) button.addEventListener('click', showChooser);

  // A short note at the bottom of the screen, for the lessons that aren't built yet ------------

  const note = $('.note');

  function say(text) {
    if (!note || !text) return;
    note.textContent = text;
    note.classList.add('show');
    clearTimeout(say.timer);
    say.timer = setTimeout(() => note.classList.remove('show'), 3200);
  }

  // Light and dark, shared with the home page --------------------------------------------------

  const themeButton = $('.theme');
  const themeColor = $('meta[name="theme-color"]');

  function applyTheme() {
    const light = root.dataset.theme === 'light';
    if (themeButton) themeButton.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    if (themeColor) themeColor.content = light ? '#F5F4F1' : '#1F1A18';
  }

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const turn = () => {
        const theme = root.dataset.theme === 'light' ? 'dark' : 'light';
        root.dataset.theme = theme;
        try {
          localStorage.setItem('theme', theme);
        } catch {
          // the switch still works for this visit
        }
        applyTheme();
      };
      if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return turn();
      const fade = document.startViewTransition(turn);
      Promise.allSettled([fade.ready, fade.updateCallbackDone, fade.finished]);
    });
  }

  applyTheme();

  // Sound on or off, kept on this device like the theme ------------------------------------------

  const muteButton = $('.mute');

  function applyMute() {
    root.dataset.muted = String(state.muted);
    if (!muteButton) return;
    muteButton.setAttribute('aria-pressed', String(state.muted));
    muteButton.setAttribute('aria-label', state.muted ? muteButton.dataset.on : muteButton.dataset.off);
  }

  if (muteButton) {
    muteButton.addEventListener('click', () => {
      state.muted = !state.muted;
      save();
      applyMute();
      if (state.muted && window.qaidaAudio) window.qaidaAudio.stop();
    });
  }

  applyMute();

  // A big glyph shown on its own — Lesson 2's question, Lesson 3's board, a mark lesson's prompt — is centred by
  // its line box, not by what it actually draws. Several letters (ش ص ض ع غ ق ن و ي…) carry real ink well below
  // the line they sit on, which a fixed-height box built for an average letter doesn't leave room for; the ink
  // then spills into whatever sits under it. `Range.getBoundingClientRect()` gives the true drawn bounds of `el`
  // (unlike a font's own metrics, which several Arabic faces draw well outside of), so it can be nudged to put
  // that, not its line box, in the middle of `box`. Call once the element's text is set and it is in the page.
  function centerInk(box, el, awaitFonts = true) {
    // No-op outside a real browser (the checks in tools/ hand-make a DOM with no Range or layout to measure).
    if (typeof document.createRange !== 'function' || typeof box.getBoundingClientRect !== 'function') return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const ink = range.getBoundingClientRect();
    if (ink.width && ink.height) {
      const frame = box.getBoundingClientRect();
      const shift = frame.top + frame.height / 2 - (ink.top + ink.height / 2);
      el.style.transform = shift ? `translateY(${shift}px)` : '';
    } // else nothing drawn yet (hidden, or empty) — the fonts.ready look below still runs
    // The web font can still be loading (a system fallback measures differently), so it's worth one more look once
    // it has: mark-lesson.js's halo already waits on the same event for the same reason. `awaitFonts` guards against
    // that second look scheduling a third — `document.fonts.ready` is a settled promise once fonts are in, and
    // chaining .then() off it forever would spin the microtask queue.
    if (awaitFonts && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (box.contains(el)) centerInk(box, el, false);
      });
    }
  }

  // The top bar gains its hairline once the page has scrolled.
  const topbar = $('.topbar');
  const sentinel = $('.top-sentinel');
  if (topbar && sentinel) {
    new IntersectionObserver(([entry]) => topbar.classList.toggle('scrolled', !entry.isIntersecting)).observe(sentinel);
  }

  // What the two pages use ---------------------------------------------------------------------

  window.qaidaShell = {
    state,
    save,
    SCRIPTS,
    LESSONS,
    lettersOf,
    familiesOf: (script = state.script) => scriptOf(script).families,
    lessonState,
    keyOf,
    seenKeys,
    seenCount,
    markSeen,
    clearLesson,
    drillOf,
    masteredCount,
    recordAnswer,
    setDrillTotal,
    clearDrill,
    isDone,
    setDone,
    nextUp,
    inOrder,
    setSkipped,
    doneCount,
    renderSetup,
    applyMute,
    centerInk,
    onChange,
    showChooser,
    closeChooser,
    say,
    // The options panel asks for the first-visit choice again, and edits the two lists of names.
    askAgain() {
      state.chosen = false;
      save();
      showChooser();
    },
    setNames(text) {
      const list = text.split(',').map((name) => name.trim());
      lettersOf().forEach((letter, i) => {
        letter[1] = list[i] || '';
      });
      renderSetup();
    },
    namesText: () => lettersOf().map((letter) => letter[1]).join(', '),
  };
})();
