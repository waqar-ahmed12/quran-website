// Checks for the Qaida's practice engine and its storage, without a browser (QAIDA-BUILD.md step 4).
//
//   node tools/qaida-check.js
//
// It loads the real shell.js and practice.js into a scratch context with an in-memory stand-in for localStorage, so
// nothing on this machine is touched. Prints PASS or FAIL per check; the exit code is the number that failed.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.join(__dirname, '..', 'site', 'qaida');
let failed = 0;

const check = (ok, what, extra = '') => {
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${extra ? `  (${extra})` : ''}`);
};

// A seeded random number generator, so a failure can be repeated.
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function boot(saved) {
  const store = new Map();
  if (saved !== undefined) store.set('qaida', typeof saved === 'string' ? saved : JSON.stringify(saved));
  const ctx = vm.createContext({
    document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
    matchMedia: () => ({ matches: false }),
    setTimeout,
    clearTimeout,
  });
  ctx.window = ctx;
  for (const file of ['shell.js', 'practice.js', 'shapes.js', 'marks.js']) {
    vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file });
  }
  return { shell: ctx.qaidaShell, practice: ctx.qaidaPractice, shapes: ctx.qaidaShapes, marks: ctx.qaidaMarks, store };
}

// The look-alike table, as lesson-2.html carries it, so the check reads the real thing.
const html = fs.readFileSync(path.join(dir, 'lesson-2.html'), 'utf8');
const found = html.match(/data-groups="([^"]+)"/);
const GROUPS = found ? found[1] : '';

function poolOf(shell) {
  const groups = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean).map(shell.keyOf));
  const shapes = shell.familiesOf();
  return shell.lettersOf().map(([glyph, name], i) => {
    const id = shell.keyOf(glyph);
    const family = [];
    shapes.forEach((members, n) => members.includes(i) && family.push(`f${n}`));
    groups.forEach((members, n) => members.includes(id) && family.push(`c${n}`));
    return { id, glyph, name, family, required: true };
  });
}

const FORMATS = [
  { id: 'glyph-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0 },
  { id: 'name-to-glyph', ask: 'name', answerWith: 'glyph', minStreak: 1 },
];

function make(opts = {}) {
  const world = boot(opts.saved);
  const events = { ready: 0, struggling: [], errors: [] };
  const drill = world.practice.create({
    lesson: 2,
    items: poolOf(world.shell),
    formats: opts.formats || FORMATS,
    random: seeded(opts.seed || 7),
    on: {
      ready: () => { events.ready += 1; },
      struggling: (item) => events.struggling.push(item.id),
      error: (code) => events.errors.push(code),
    },
    ...(opts.options || {}),
  });
  drill.start();
  return { ...world, drill, events };
}

const wrongChoice = (q) => q.choices.find((c) => c.id !== q.item.id);

// ---- 1. The look-alike table and the pool ---------------------------------------------------------------------

console.log('\nThe pool');
{
  const { shell } = boot();
  const table = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  check(GROUPS.length > 0, 'lesson-2.html carries the look-alike table (data-groups)');
  for (const script of ['madani', 'indopak']) {
    const letters = shell.lettersOf(script);
    const ids = letters.map(([g]) => shell.keyOf(g));
    check(letters.length === 29, `${script}: 29 letters`, String(letters.length));
    check(new Set(ids).size === ids.length, `${script}: no id repeated`);
    check(letters.every(([, name]) => name && name.trim()), `${script}: every name filled in`);
    const listed = new Set(table.flat().map(shell.keyOf));
    const missing = ids.filter((id) => !listed.has(id));
    check(missing.length === 0, `${script}: every letter is in a look-alike group`, missing.join(' '));
  }
  const both = new Set(shell.lettersOf('madani').map(([g]) => shell.keyOf(g)));
  check(shell.lettersOf('indopak').every(([g]) => both.has(shell.keyOf(g))), 'the two scripts share every id, so mastery survives a switch');
}

// ---- 2. Every question is well formed ---------------------------------------------------------------------------

console.log('\nQuestions');
{
  const { drill } = make({ options: { choices: 4 } });
  let bad = 0;
  let asked = 0;
  for (let i = 0; i < 400; i += 1) {
    const q = drill.question;
    if (!q) { bad += 1; break; }
    const face = q.format.answerWith;
    const shown = q.choices.map((c) => c[face]);
    const ok = q.choices.length === 4
      && q.choices.filter((c) => c.id === q.item.id).length === 1
      && new Set(shown).size === shown.length;
    if (!ok) bad += 1;
    asked += 1;
    drill.answer(i % 3 === 0 ? wrongChoice(q).id : q.item.id);
    drill.next();
  }
  check(bad === 0, `${asked} questions: four choices, the answer once, no button repeated`, `${bad} bad`);
}

{
  const three = make({ options: { choices: 3 } });
  const six = make({ options: { choices: 6 } });
  check(three.drill.question.choices.length === 3, 'three choices when asked for three');
  check(six.drill.question.choices.length === 6, 'six choices when asked for six');
}

// ---- 2c. The deck (`deck: true`, Lesson 2's own opt-in): every item twice, a miss adds one more nearby
//          (fixes/lesson 2.txt, 2026-09-24: "33 questions in a row and still 8 letters… ask every letter twice
//          randomly, if mistake made, ask one more time… place these randoms close by") --------------------------

console.log('\nThe deck (deck: true, Lesson 2 only)');
{
  const { drill } = make({ seed: 9, options: { deck: true, target: 1 } });
  const counts = new Map();
  // target: 1 credits a letter "known" the moment it is first answered right, well before the deck (29 letters,
  // twice each) is spent — so counting to a fixed 58 is the way to see the deck itself run out, not `progress()`.
  for (let n = 0; n < 58; n += 1) {
    const q = drill.question;
    counts.set(q.item.id, (counts.get(q.item.id) || 0) + 1);
    drill.answer(q.item.id); // nothing missed: nothing should come back
    drill.next();
  }
  const uneven = [...counts.entries()].filter(([, c]) => c !== 2);
  check(uneven.length === 0, 'a clean run: every letter asked exactly twice in 58 questions, none skipped, none repeated', JSON.stringify(uneven));
  check(drill.progress().known === 29, 'and every one of them known', `${drill.progress().known} of 29`);
  check(drill.question.fromDeck === false, 'the 59th question is free practice, not owed to anyone any more');
}

{
  const { drill } = make({ seed: 4, options: { deck: true, target: 1 } });
  const counts = new Map();
  let missedId = '';
  let missedAt = 0;
  let backAt = 0;
  // 59 = the 58-question deck plus the one extra turn a single mistake owes: exactly the count the rule promises,
  // never open-ended, whichever of the missed letter's two remaining copies (its own second turn, or the one just
  // added) happens to come up first.
  for (let n = 1; n <= 59; n += 1) {
    const q = drill.question;
    counts.set(q.item.id, (counts.get(q.item.id) || 0) + 1);
    if (n === 1) {
      missedId = q.item.id; // miss the very first letter drawn, once, and only once
      missedAt = n;
      drill.answer(wrongChoice(q).id);
    } else {
      if (q.item.id === missedId && !backAt) backAt = n;
      drill.answer(q.item.id);
    }
    drill.next();
  }
  check(backAt > missedAt, 'the missed letter is asked again');
  check(backAt - missedAt <= 8, 'and soon — close by, not spread out across the session', `${backAt - missedAt} questions later`);
  check((counts.get(missedId) || 0) === 3, 'that one letter got three turns in all: missed once, asked twice more', String(counts.get(missedId)));
  check([...counts.entries()].filter(([id]) => id !== missedId).every(([, c]) => c === 2), 'every other letter still just twice');
  check(drill.progress().known === 29, 'it still ends with every letter known', `${drill.progress().known} of 29`);
}

{
  // `deck` is opt-in and off by default: a drill that never asks for it (every other lesson, and this file's other
  // checks) draws exactly the way it always has.
  const { drill } = make({ seed: 9 });
  check(drill.question.fromDeck === false, 'deck off by default: an ordinary drill\'s questions are never "from the deck"', String(drill.question.fromDeck));
}

// ---- 2b. The right answer's position is spread, not clustered (fixes/lesson 2.txt: "the second option and the
//          last option were most likely to be correct") ------------------------------------------------------------

console.log('\nWhere the right answer lands');
{
  const { drill } = make({ options: { choices: 4 }, seed: 11 });
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < 400; i += 1) {
    const q = drill.question;
    counts[q.choices.findIndex((c) => c.id === q.item.id)] += 1;
    drill.answer(wrongChoice(q).id);
    drill.next();
  }
  check(counts.every((n) => n === 100), 'four choices, 400 questions: every position holds the right answer exactly 100 times', counts.join(','));
}

// ---- 3. A missed letter: not straight away, then more often ------------------------------------------------------

console.log('\nA missed letter');
{
  let straightBack = 0;
  let sittingOut = 0;
  const gapsMissed = [];
  const gapsOthers = [];
  const trials = 40;

  for (let seed = 1; seed <= trials; seed += 1) {
    const { drill } = make({ seed });
    const lastSeen = new Map(); // id -> question number it was last asked on
    const missedAt = new Map(); // id -> question number of the miss it has not yet come back from
    let n = 0;
    let missesLeft = 6;

    for (let i = 0; i < 260; i += 1) {
      const q = drill.question;
      if (!q) break;
      n += 1;
      const id = q.item.id;

      if (lastSeen.has(id)) {
        const gap = n - lastSeen.get(id);
        if (missedAt.has(id)) {
          gapsMissed.push(gap);
          if (gap < 3) sittingOut += 1; // came back before it had sat out two questions
          if (gap === 1) straightBack += 1;
          missedAt.delete(id);
        } else if (drill.progress().known < 24) {
          gapsOthers.push(gap);
        }
      }
      lastSeen.set(id, n);

      // The student misses a handful of letters, once each, early on; everything else is right.
      const miss = missesLeft > 0 && i > 5 && i % 7 === 0 && !missedAt.has(id);
      if (miss) {
        missesLeft -= 1;
        missedAt.set(id, n);
        drill.answer(wrongChoice(q).id);
      } else {
        drill.answer(q.item.id);
      }
      drill.next();
    }
  }
  const mean = (list) => list.reduce((a, b) => a + b, 0) / (list.length || 1);
  check(straightBack === 0, 'a missed letter is never the very next question', `${straightBack} times`);
  check(sittingOut === 0, 'a missed letter sits out at least two questions', `${sittingOut} early`);
  check(gapsMissed.length > 20, 'missed letters do come back', `${gapsMissed.length} returns`);
  check(mean(gapsMissed) < mean(gapsOthers),
    'a missed letter comes back sooner than the letters not yet known',
    `missed ${mean(gapsMissed).toFixed(1)} vs others ${mean(gapsOthers).toFixed(1)} questions`);
}

// ---- 4. Ready: seven tenths known, nothing missed and still shaky (2026-09-23: was four fifths, three in a row —
//        fixes/lesson 2.txt, "why 39 questions!!!") -----------------------------------------------------------

console.log('\nReady');
{
  const { drill, events } = make({ seed: 3 });
  let n = 0;
  let readyAt = 0;
  for (let i = 0; i < 600; i += 1) {
    const q = drill.question;
    if (!q) break;
    n += 1;
    const v = drill.answer(q.item.id);
    if (v.ready) readyAt = readyAt || n;
    drill.next();
  }
  const p = drill.progress();
  check(readyAt > 0, 'a perfect student is told they seem ready', `at question ${readyAt}`);
  check(readyAt >= 21 * 2, 'not before seven tenths of the letters have two right answers in a row', `21 x 2 = 42`);
  check(events.ready === 1, 'ready fires once, however long they carry on', `${events.ready} times`);
  check(p.known >= 21, 'the bar counts letters known', `${p.known} of ${p.total}`);
}

{
  const { drill, shell } = make({ seed: 5 });
  const ids = shell.lettersOf().map(([g]) => shell.keyOf(g));
  for (const id of ids.slice(0, 21)) for (let k = 0; k < 2; k += 1) shell.recordAnswer(2, id, true);
  check(drill.progress().ready === true, 'twenty-one letters known and nothing missed: ready');

  shell.recordAnswer(2, ids[25], false); // a letter missed and still shaky
  check(drill.progress().ready === false, 'twenty-one known but one missed letter still shaky: not ready', `toFix ${drill.progress().toFix}`);

  for (let k = 0; k < 2; k += 1) shell.recordAnswer(2, ids[25], true);
  check(drill.progress().ready === true, 'once that letter is put right: ready again');
}

{
  const { drill, shell } = make({ seed: 5, options: { readyAt: 1 } });
  const ids = shell.lettersOf().map(([g]) => shell.keyOf(g));
  for (const id of ids.slice(0, 28)) for (let k = 0; k < 2; k += 1) shell.recordAnswer(2, id, true);
  check(drill.progress().ready === false, 'readyAt 1: twenty-eight of twenty-nine is not ready');
  drill.masterAll();
  check(drill.progress().ready === true && drill.progress().known === 29, 'masterAll: every letter known, ready');
}

// ---- 5. Known can go down, and struggling is reported once -----------------------------------------------------

console.log('\nKnown, and struggling');
{
  const { drill, shell, events } = make({ seed: 9 });
  const id = shell.keyOf('ذ');
  for (let k = 0; k < 3; k += 1) shell.recordAnswer(2, id, true);
  check(drill.progress().known === 1, 'three in a row makes a letter known');
  shell.recordAnswer(2, id, false);
  check(drill.progress().known === 0, 'missing a known letter makes it unknown again (the bar can go down)');

  // Force questions about one letter and miss it repeatedly.
  const target = 'ذ';
  let missed = 0;
  for (let i = 0; i < 4000 && missed < 5; i += 1) {
    const q = drill.question;
    if (q.item.id === shell.keyOf(target)) {
      drill.answer(wrongChoice(q).id);
      missed += 1;
    } else {
      drill.answer(q.item.id);
    }
    drill.next();
  }
  check(events.struggling.filter((s) => s === shell.keyOf(target)).length === 1,
    'a letter missed again and again is reported as struggling once', events.struggling.join(','));
  check(drill.struggling().some((item) => item.id === shell.keyOf(target)), 'struggling() lists it');
}

// ---- 6. Formats -----------------------------------------------------------------------------------------------

console.log('\nFormats');
{
  const world = boot();
  const drill = world.practice.create({
    lesson: 2,
    items: poolOf(world.shell),
    formats: [{ id: 'sound', ask: 'sound', answerWith: 'glyph', minStreak: 0, available: () => false }],
    random: seeded(1),
    on: { error: (code) => (world.error = code) },
  });
  drill.start();
  check(drill.question === null && world.error === 'formats', 'a sound-only drill with no recordings says so instead of asking nothing');

  const both = make({
    formats: [
      FORMATS[0],
      { id: 'sound', ask: 'sound', answerWith: 'glyph', minStreak: 0, available: () => false },
    ],
  });
  let sound = 0;
  for (let i = 0; i < 100; i += 1) {
    if (both.drill.question.format.id === 'sound') sound += 1;
    both.drill.answer(both.drill.question.item.id);
    both.drill.next();
  }
  check(sound === 0, 'a format with no recordings is simply never chosen');

  const mix = make({ seed: 11 });
  let early = 0;
  for (let i = 0; i < 30; i += 1) {
    const q = mix.drill.question;
    if (q.format.id === 'name-to-glyph' && (mix.shell.drillOf(2).streak[q.item.id] || 0) < 1) early += 1;
    mix.drill.answer(q.item.id);
    mix.drill.next();
  }
  check(early === 0, 'name-to-letter is only asked of a letter already answered once the other way round');
}

// ---- 7. Storage ---------------------------------------------------------------------------------------------------

console.log('\nStorage');
{
  const hostile = '{"v":1,"lessons":{"2":{"seen":["ا"],"done":true,"drill":{"total":"x","target":99,'
    + '"right":{"__proto__":5,"ا":-1,"ب":"3","ت":2.7,"":4,"ث":3,"ج":1e99,"الطويل الطويل الطويل الطويل":2},'
    + '"wrong":[1,2],"streak":null}}}}';
  const { shell } = boot(hostile);
  const drill = shell.drillOf(2);
  check(shell.lessonState(2).done === true && shell.lessonState(2).seen.length === 1, 'the rest of the lesson survives a damaged drill');
  check(drill.total === 0 && drill.target === 2, 'a bad total and target become 0 and 2', `${drill.total}, ${drill.target}`);
  check(Object.getPrototypeOf(drill.right) === null, 'maps have no prototype, so "__proto__" cannot poison them');
  check(JSON.stringify(Object.keys(drill.right)) === JSON.stringify(['ت', 'ث', 'ج']), 'only sound keys are kept', Object.keys(drill.right).join(' '));
  check(drill.right['ت'] === 2 && drill.right['ث'] === 3 && drill.right['ج'] === 9999, 'counts are whole numbers, capped at 9999');
  check(Object.keys(drill.wrong).length === 0 && Object.keys(drill.streak).length === 0, 'an array or null becomes an empty map');

  const big = {};
  for (let i = 0; i < 900; i += 1) big[`k${i}`] = 1;
  const capped = boot({ v: 1, lessons: { 2: { seen: [], done: false, drill: { right: big } } } }).shell.drillOf(2);
  check(Object.keys(capped.right).length === 400, 'a map is capped at 400 keys', String(Object.keys(capped.right).length));

  const old = boot({ v: 1, lessons: { 1: { seen: ['ا'], done: false } } }).shell;
  check(old.drillOf(1).total === 0 && old.masteredCount(1) === 0, 'saved data from before drills reads as an empty drill');
  check(old.drillOf(9).total === 0, 'a lesson never opened reads as empty without creating anything', String(Object.keys(old.state.lessons)));
}

{
  const { shell, drill, store } = make({ seed: 2 });
  const id = shell.keyOf('ك');
  for (let k = 0; k < 3; k += 1) shell.recordAnswer(2, id, true);
  shell.state.script = 'indopak';
  check(shell.masteredCount(2) === 1, 'the home counts letters known with the lesson\'s own target');
  const next = poolOf(shell);
  drill.setItems(next);
  check(drill.progress().known === 1 && next.find((i) => i.glyph === 'ک').id === id, 'switching script keeps a known letter known (ك stays known as ک)');

  const saved = JSON.parse(store.get('qaida')).lessons['2'];
  check(saved.drill.streak[id] === 3 && saved.drill.total === 29, 'it is written to the one key, with the total');

  shell.setDone(2, true);
  shell.clearDrill(2);
  check(shell.masteredCount(2) === 0 && shell.isDone(2) === true && shell.lessonState(2).seen.length > 0, 'clearDrill wipes mastery and keeps seen and done');
  shell.clearLesson(2);
  check(shell.isDone(2) === false && shell.lessonState(2).seen.length === 0, 'clearLesson wipes everything about the lesson');
}

// ---- 8. Lesson 3: the shapes ------------------------------------------------------------------------------------
// Six groups, not the five first specified (docs/lesson-3/09 §1). Counts: 6 + 2 + 21 + 15 + 24 = 68 shapes drilled.

console.log('\nLesson 3: the shapes');
{
  const J = String.fromCharCode(0x200D);
  const T = String.fromCharCode(0x0640);
  const NEW = [6, 2, 21, 15, 24, 0];
  const ALL = [13, 8, 28, 20, 32, 0];
  const sum = (list) => list.reduce((a, b) => a + b, 0);
  const idsOf = (shell, shapes, drilled) => shapes.allItems(shell, { drilled }).map((item) => item.id).sort();

  const { shell, shapes } = boot();
  const items = shapes.allItems(shell, { drilled: 'new' });
  const every = shapes.allItems(shell, { drilled: 'all' });
  check(items.length === 68, "68 shapes are drilled ('new')", String(items.length));
  check(every.length === 101, "101 shapes are drilled ('all')", String(every.length));
  check(JSON.stringify(shapes.sizes(items)) === JSON.stringify(NEW), 'the six groups hold 6, 2, 21, 15, 24, 0', shapes.sizes(items).join(','));
  check(JSON.stringify(shapes.sizes(every)) === JSON.stringify(ALL), "and 13, 8, 28, 20, 32, 0 when every position is drilled", shapes.sizes(every).join(','));
  check(sum(NEW) === 68 && sum(ALL) === 101, 'the group sizes add up');

  for (const script of ['madani', 'indopak']) {
    const world = boot();
    world.shell.state.script = script;
    const list = world.shapes.allItems(world.shell, { drilled: 'new' });
    const ids = list.map((item) => item.id);
    check(new Set(ids).size === ids.length, `${script}: every id is unique`);
    check(ids.every((id) => id.length <= 24), `${script}: every id fits the shell's 24-character cap`);
    check(list.every((item) => item.glyph.includes(item.base)), `${script}: every glyph contains its base letter`);
    check(list.every((item) => world.shell.keyOf(item.base) === item.key && item.id.startsWith(`${item.key}:`)),
      `${script}: every id starts with its letter folded to Madani`);
    check(list.every((item) => !item.name.includes(J) && item.traceable === true && item.audio.glyph === item.base),
      `${script}: names carry no joiner, every form can be written, sound belongs to the letter`);
  }
  {
    const madani = boot();
    const indopak = boot();
    indopak.shell.state.script = 'indopak';
    check(JSON.stringify(idsOf(madani.shell, madani.shapes, 'new')) === JSON.stringify(idsOf(indopak.shell, indopak.shapes, 'new')),
      'Madani and Indo-Pak produce the same ids, so mastery survives a switch');
    check(JSON.stringify(idsOf(madani.shell, madani.shapes, 'all')) === JSON.stringify(idsOf(indopak.shell, indopak.shapes, 'all')),
      "and the same ids when every position is drilled");
    const heh = indopak.shapes.allItems(indopak.shell).find((item) => item.id === 'ه:medial');
    check(heh && heh.base === 'ہ' && heh.glyph === T + 'ہ' + T, 'in Indo-Pak the medial haa is drawn with ہ, and keeps the id ه:medial');
  }

  const noJoin = items.filter((item) => item.band === 1);
  check(noJoin.length === 6 && noJoin.every((item) => item.position === 'joined'), 'a letter that never joins forward has one item, its joined form');
  check(!items.some((item) => shapes.classOf(item.key) === 'back-only' && ['initial', 'medial'].includes(item.position)),
    'a letter that never joins forward never produces an initial or medial item');
  check(!items.some((item) => item.key === 'ء') && every.filter((item) => item.key === 'ء').length === 1,
    "ء produces no item, until every position is drilled, and then only its own shape");
  check(items.filter((item) => item.band === 2).every((item) => item.position === 'medial') && items.filter((item) => item.band === 2).length === 2,
    'ط and ظ have one item each, the middle form');
  check(shapes.FORM.medial('ب') === T + 'ب' + T && shapes.FORM.initial('ب') === 'ب' + T && shapes.FORM.final('ب') === T + 'ب',
    'the connecting stroke sits on the side that joins, so every join is visible (fixes/aunn.txt)');
  check(shapes.FORM.joined('و') === 'بو' && shapes.FORM.joined('ا') === 'با', 'a letter that never joins forward is shown after a baa: بو، با');
  for (const file of ['shapes.js', 'lesson-3.js', 'lesson-3.html']) {
    const where = path.join(dir, file);
    if (fs.existsSync(where)) check(!fs.readFileSync(where, 'utf8').includes('' + J + ''), `${file} writes the joiner as an escape, never as a pasted character`);
  }

  // The bands need no engine change: `required` alone does it.
  const ids = new Set(items.map((item) => item.id));
  const pool3 = shapes.poolFor(items, 3);
  check(pool3.length === 21 && pool3.every((item) => item.required && item.band === 3),
    "poolFor(3): the group's 21 shapes and no others, all required", `${pool3.length} items`);
  check(pool3.every((item) => ids.has(item.id)), 'poolFor hands over only real shapes');
  const pool6 = shapes.poolFor(items, 6);
  check(pool6.length === 68 && pool6.every((item) => item.required), 'poolFor(6), the table: every shape, so it is the mixed practice');
  check([1, 2, 3, 4, 5].every((n) => shapes.poolFor(items, n).every((item) => item.band === n)), 'no group is ever asked about another group\'s shapes');

  const world = boot();
  const drill = world.practice.create({
    lesson: 3,
    items: world.shapes.poolFor(world.shapes.allItems(world.shell), 3),
    formats: [{ id: 'form-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0 }],
    random: seeded(4),
    on: {},
  });
  drill.start();
  check(drill.progress().total === 21, 'the engine counts only the group it was handed: drill.progress().total is 21', String(drill.progress().total));
  check(world.shell.drillOf(3).total === 21, 'the engine writes the GROUP total to the shell (the wart in docs/lesson-3/03 §2)', String(world.shell.drillOf(3).total));
  world.shell.setDrillTotal(3, world.shapes.allItems(world.shell).length, drill.settings.target);
  check(world.shell.drillOf(3).total === 68, "the page's setDrillTotal puts the whole lesson's 68 back", String(world.shell.drillOf(3).total));

  // Mastery survives a change of group: it is stored per id by the shell.
  const one = world.shapes.allItems(world.shell).find((item) => item.band === 1);
  for (let k = 0; k < 3; k += 1) world.shell.recordAnswer(3, one.id, true);
  const before = world.shell.drillOf(3).streak[one.id];
  drill.setItems(world.shapes.poolFor(world.shapes.allItems(world.shell), 3));
  world.shell.setDrillTotal(3, 68, 3);
  check(before === 3 && world.shell.drillOf(3).streak[one.id] === 3, 'mastery in group 1 is unchanged after moving to group 3');
  check(drill.progress().known === 0 && world.shell.drillOf(3).total === 68, 'and group 3 counts only its own, with the lesson total intact');
  check(world.shapes.stats(world.shell, 3, world.shapes.allItems(world.shell), 1).known === 1, 'stats() counts a group from the shell, whichever group the engine holds');

  // stats(): the engine's rule, for a group the engine is not holding.
  const rule = boot();
  const list = rule.shapes.allItems(rule.shell);
  for (const item of list.filter((it) => it.band === 2)) for (let k = 0; k < 3; k += 1) rule.shell.recordAnswer(3, item.id, true);
  check(rule.shapes.stats(rule.shell, 3, list, 2).ready === true, 'stats(): every shape known is ready');
  const six = list.filter((it) => it.band === 1);
  for (const item of six.slice(0, 5)) for (let k = 0; k < 3; k += 1) rule.shell.recordAnswer(3, item.id, true);
  check(rule.shapes.stats(rule.shell, 3, list, 1).ready === true, 'stats(): five of six known is ready at four fifths');
  rule.shell.recordAnswer(3, six[5].id, false);
  check(rule.shapes.stats(rule.shell, 3, list, 1).ready === false, 'stats(): one missed shape still shaky is not ready');

  // The board.
  const rowsOf = (band) => shapes.boardRows(shell, band);
  check(rowsOf(6).length === 29, 'the table has all 29 letters', String(rowsOf(6).length));
  check(rowsOf(1).length === 6 && !rowsOf(1).some((row) => row.key === 'ء'), 'band 1 has its six letters (ء is a note, not a row)', String(rowsOf(1).length));
  check(rowsOf(1).every((row) => row.cls === 'back-only' && Object.keys(row.cells).join() === 'isolated,joined' && row.demo === `ب${row.glyph}ب`),
    'a letter that never joins forward shows two shapes, and is flanked by ب in its demo');
  check(rowsOf(3).every((row) => Object.keys(row.cells).join() === 'isolated,initial,medial,final' && row.demo === row.glyph.repeat(3)),
    'the joining letters show four shapes, and the letter three times as their demo');
}

// ---- 9. Lesson 4: the mark ----------------------------------------------------------------------------------------
// docs/lesson-4/08 §4. The data layer only: marks.js in node, no page.

console.log('\nLesson 4: the mark');
{
  const FATHA = String.fromCharCode(0x064E);
  const looks = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const world = () => {
    const w = boot();
    w.mark = w.marks.MARKS.fatha;
    w.items = w.marks.allItems(w.shell, w.mark, { looks });
    return w;
  };
  const madani = world();
  const indopak = world();
  indopak.shell.state.script = 'indopak';
  indopak.items = indopak.marks.allItems(indopak.shell, indopak.mark, { looks });
  const { shell, marks, mark, items } = madani;

  // Counts and ids.
  check(items.length === 29, 'allItems() is 29 in Madani', String(items.length));
  check(indopak.items.length === 29, 'and 29 in Indo-Pak', String(indopak.items.length));
  check(new Set(items.map((item) => item.id)).size === 29, 'every id is unique');
  check(items.every((item) => item.id.length === 2 && item.id === shell.keyOf(item.base) + FATHA), 'every id is 2 characters: the letter, folded to Madani, then the mark');
  check(JSON.stringify(items.map((item) => item.id).sort()) === JSON.stringify(indopak.items.map((item) => item.id).sort()),
    'Madani and Indo-Pak produce the same id set (ک ہ ی fold onto ك ه ي)');
  check(items.every((item) => item.glyph === item.base + FATHA), 'every glyph is exactly base + U+064E');
  check(indopak.items.find((item) => item.key === 'ك').glyph === 'ک' + FATHA, 'and in Indo-Pak the glyph is the Indo-Pak letter, while the id stays Madani');

  // The mark is composed, never pasted.
  const source = fs.readFileSync(path.join(dir, 'marks.js'), 'utf8');
  check(!/[ً-ْ]/.test(source), 'marks.js holds no literal combining mark: it is composed with fromCharCode');
  check(marks.aloneOf(mark) === String.fromCharCode(0x25CC) + FATHA, 'the mark on its own sits on U+25CC, the dotted circle');
  check(marks.MARKS.kasra.cp === 0x0650 && marks.MARKS.damma.cp === 0x064F && marks.MARKS.kasra.sits === 'below', 'zair and paish are already in the table');

  // The names come from the student's set; the recordings from the mark's own key.
  check(items[1].name === 'Baa with fatha' && items[1].markName === 'fatha', 'a marked item is "Baa with fatha" in the fatha set', items[1].name);
  const zabar = world();
  zabar.shell.state.names = 'zabar';
  zabar.items = zabar.marks.allItems(zabar.shell, zabar.mark, { looks });
  check(zabar.items[1].name === 'Baa with zabar', 'and "Baa with zabar" in the zabar set, the letter still Baa', zabar.items[1].name);
  check(items.every((item) => item.audio.kind === 'fatha' && item.audio.glyph === item.base), "every item's recording is the mark's own group, keyed by the base letter");
  marks.rename(items, shell, mark, { marked: '{Mark}: {name}', bare: '{name}' });
  check(items[1].name === 'Fatha: Baa', 'rename() rebuilds the words and keeps the items', items[1].name);
  marks.rename(items, shell, mark);

  // The groups.
  check(JSON.stringify(marks.sizes(items)) === '[6,29]', 'the two groups hold 6 and 29', marks.sizes(items).join(','));
  const one = marks.poolFor(items, 1);
  const two = marks.poolFor(items, 2);
  check(one.length === 6 && one.every((item) => item.required && marks.GROUP_ONE.includes(item.key)), 'poolFor(1): the six letters, all required, and no others');
  check(two.length === 29 && two.every((item) => item.required), 'poolFor(2): all 29, all required');
  check(items.every((item) => item.required === false), 'poolFor never edits the items it is given');

  // Review.
  check(marks.reviewItems(shell, mark, { count: 8 }).length === 8, 'reviewItems({ count: 8 }) is 8');
  check(marks.reviewItems(shell, mark, { count: 0 }).length === 0, 'and 0 at count 0');
  check(marks.reviewItems(shell, mark, { count: 16 }).length === 16, 'and 16 at the top of the slider');
  const review = marks.reviewItems(shell, mark, { count: 8 });
  check(review.every((item) => item.id === item.key && item.id.length === 1 && item.marked === false && item.required === false), 'review items are bare, unmarked and never required');
  check(review.every((item) => !items.some((marked) => marked.id === item.id)), 'no review id collides with a marked id');
  check(review.every((item) => item.name === item.letterName && item.audio.kind === 'letters'), "a review item is the letter's plain name, with Lesson 2's recording");
  check(JSON.stringify(marks.reviewItems(shell, mark, { count: 8 }).map((i) => i.id)) === JSON.stringify(review.map((i) => i.id)), 'the sample is the same every time it is asked for');

  const seeded2 = boot();
  for (const key of ['ج', 'غ', 'ض']) seeded2.shell.recordAnswer(2, key, false);
  const hard = seeded2.marks.reviewItems(seeded2.shell, seeded2.marks.MARKS.fatha, { count: 8 }).map((item) => item.id);
  check(['ج', 'غ', 'ض'].every((key) => hard.includes(key)), 'the review sample follows Lesson 2: three wrong letters are all in it', hard.join(''));
  const pairs = marks.reviewItems(shell, mark, { count: 8, prefer: marks.GROUP_ONE }).map((item) => item.id);
  check(marks.GROUP_ONE.every((key) => pairs.includes(key)), 'asked for the pair, the open group\'s own letters come first, so each has a bare twin');

  // The wrong answers are decided by which tags exist.
  const tagsOf = (list) => list.map((item) => item.family.join('|'));
  const sameLetter = marks.allItems(shell, mark, { distractors: 'mark-or-not' });
  check(sameLetter.every((item) => item.family.length === 1 && item.family[0] === `letter:${item.key}`), "'mark-or-not' tags the letter, and only that");
  check(marks.reviewItems(shell, mark, { count: 8, distractors: 'mark-or-not' }).every((item) => item.family[0] === `letter:${item.key}`), 'and the bare twin carries the same tag');
  check(marks.allItems(shell, mark, { distractors: 'any' }).every((item) => item.family.length === 0), "'any' carries no tags");
  check(tagsOf(items).some((tags) => tags.startsWith('look')), "'look-alike' tags the letter's look-alikes", tagsOf(items)[1]);

  // Progress through the engine and the shell.
  const w = world();
  const drill = w.practice.create({
    lesson: 4,
    items: [...marks.poolFor(w.items, 1), ...marks.reviewItems(w.shell, w.mark, { count: 8 })],
    formats: FORMATS,
    random: seeded(3),
  });
  drill.start();
  check(drill.progress().total === 6, 'the group line is 6 in group 1, review items not counted', String(drill.progress().total));
  w.shell.setDrillTotal(4, w.items.length, drill.settings.target);
  check(w.shell.drillOf(4).total === 29, 'after the page re-asserts the total, the home reads 29', String(w.shell.drillOf(4).total));
  const first = marks.poolFor(w.items, 1)[0];
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(4, first.id, true);
  drill.setItems([...marks.poolFor(w.items, 2), ...marks.reviewItems(w.shell, w.mark, { count: 8 })]);
  check(drill.progress().total === 29 && drill.progress().known === 1, 'moving to group 2 keeps mastery, and counts 29', `${drill.progress().known}/${drill.progress().total}`);
  const switched = boot();
  const inMadani = switched.marks.allItems(switched.shell, switched.marks.MARKS.fatha, { looks }).find((item) => item.key === 'ك');
  for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(4, inMadani.id, true);
  switched.shell.state.script = 'indopak';
  const inIndoPak = switched.marks.allItems(switched.shell, switched.marks.MARKS.fatha, { looks }).find((item) => item.key === 'ك');
  check(switched.marks.stats(switched.shell, 4, [inIndoPak], 2).known === 1, 'mastery survives a change of script');

  // Review never counts towards the lesson.
  const counted = boot();
  const list = counted.marks.allItems(counted.shell, counted.marks.MARKS.fatha, { looks });
  for (const item of counted.marks.reviewItems(counted.shell, counted.marks.MARKS.fatha, { count: 8 })) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(4, item.id, true);
  check(counted.marks.stats(counted.shell, 4, list, 2).known === 0, 'mastering review letters moves the lesson\'s own count by nothing');
  check(counted.shell.masteredCount(4, 3) === 0, "and the home's count ignores them too: only ids that end in the lesson's mark are the lesson's own (docs/lesson-5/03 §6)", String(counted.shell.masteredCount(4, 3)));
  for (const item of list.slice(0, 2)) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(4, item.id, true);
  check(counted.shell.masteredCount(4, 3) === 2 && counted.shell.masteredCount(4, 3, list.slice(0, 1).map((item) => item.id)) === 1,
    'two of its own known counts two, and an explicit id list narrows it', String(counted.shell.masteredCount(4, 3)));

  // stats(): the engine's rule, for a group the engine is not holding.
  const rule = boot();
  const all = rule.marks.allItems(rule.shell, rule.marks.MARKS.fatha, { looks });
  for (const item of all.filter((it) => rule.marks.GROUP_ONE.includes(it.key)).slice(0, 5)) for (let k = 0; k < 3; k += 1) rule.shell.recordAnswer(4, item.id, true);
  check(rule.marks.stats(rule.shell, 4, all, 1).ready === true, 'stats(): five of six known is ready at four fifths');
  check(rule.marks.stats(rule.shell, 4, all, 2).ready === false, 'and group 2 is not ready on the strength of group 1');
  rule.shell.recordAnswer(4, all.find((it) => it.key === rule.marks.GROUP_ONE[5]).id, false);
  check(rule.marks.stats(rule.shell, 4, all, 1).ready === false, 'stats(): one missed letter still shaky is not ready');

  // The board.
  check(marks.boardRows(shell, mark, 1).length === 6 && marks.boardRows(shell, mark, 2).length === 29, 'the board has 6 rows, then 29');
  check(marks.boardRows(shell, mark, 1).every((row) => row.marked === row.glyph + FATHA && row.joined === row.marked + row.marked), 'each row is the letter, the letter with the mark, and the pair beside itself');
}

// ---- 9b. Lesson 5: the mark below ---------------------------------------------------------------------------------
// docs/lesson-5/05 §3. The data layer only, again: marks.js in node, no page.

console.log('\nLesson 5: the mark below');
{
  const FATHA = String.fromCharCode(0x064E);
  const KASRA = String.fromCharCode(0x0650);
  const looks = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const world = (script) => {
    const w = boot();
    if (script) w.shell.state.script = script;
    w.mark = w.marks.MARKS.kasra;
    w.items = w.marks.allItems(w.shell, w.mark, { looks, distractors: 'which-mark' });
    return w;
  };
  const madani = world();
  const indopak = world('indopak');
  const { shell, marks, mark, items } = madani;
  const fatha = marks.MARKS.fatha;

  // Part 1 is this mark's own six, and not the first mark's.
  check(mark.first.length === 6 && mark.first.join() !== fatha.first.join(), "kasra's part 1 is six letters, and they are not fatha's six");
  check(!['ب', 'ي', 'ج', 'ر', 'م', 'س'].some((key) => mark.first.includes(key)), 'none of them carries a dot below or hangs below the line (docs/lesson-5/02 §3)', mark.first.join(''));
  check(mark.first.includes('د') && fatha.first.includes('د'), 'and د is in both, so the student meets a letter they have already seen with the other mark');
  check(JSON.stringify(marks.sizes(items)) === '[6,29]', 'the two parts still hold 6 and 29', marks.sizes(items).join(','));
  const one = marks.poolFor(items, 1);
  check(one.length === 6 && one.every((item) => item.required && mark.first.includes(item.key)), 'poolFor(1) is the six letters of kasra, all required');
  check(items.slice().filter((item) => item.parts.includes(1)).map((item) => item.key).sort().join() === mark.first.slice().sort().join(), "and each item knows it is in part 1 by the mark's own list");
  check(fatha.first.every((key) => marks.allItems(shell, fatha, { looks }).find((item) => item.key === key).parts.includes(1)), "fatha's own six are unchanged by all this");

  // Ids and glyphs.
  check(items.length === 29 && indopak.items.length === 29, 'allItems() is 29 in both scripts');
  check(items.every((item) => item.id.length === 2 && item.id === shell.keyOf(item.base) + KASRA && item.glyph === item.base + KASRA), 'every id is a letter and U+0650; every glyph is the letter and the same mark');
  check(items.every((item) => item.mark === 'kasra' && item.marked), 'every item says whose stroke it is: mark "kasra"');
  check(JSON.stringify(items.map((item) => item.id).sort()) === JSON.stringify(indopak.items.map((item) => item.id).sort()), 'Madani and Indo-Pak produce the same id set');
  check(items.every((item) => item.audio.kind === 'kasra' && item.audio.glyph === item.base), "every item's recording is the kasra group, keyed by the base letter");
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'marks.js'), 'utf8')), 'marks.js still holds no literal combining mark');
  check(marks.MARKS.kasra.sits === 'below' && marks.MARKS.fatha.sits === 'above', 'zair sits below and zabar above');

  // The twins: the same letter with the other mark.
  const twins = marks.twinItems(shell, mark, { keys: one.map((item) => item.key), looks, distractors: 'which-mark' });
  check(twins.length === 6 && marks.twinItems(shell, fatha, { keys: ['ب'] }).length === 0, 'six twins for six letters, and the first mark has none to carry');
  check(twins.every((twin) => twin.id === twin.key + FATHA && twin.glyph === twin.base + FATHA && twin.mark === 'fatha' && twin.marked), 'a twin is the letter with U+064E, and says it is zabar\'s');
  check(twins.every((twin) => twin.required === false && twin.parts.length === 0), 'a twin is review: never required, and in no part');
  check(twins.every((twin) => twin.audio.kind === 'fatha'), "a twin plays the other mark's recording, not this lesson's");
  const bare = marks.reviewItems(shell, mark, { count: 8 });
  const ids = [...items, ...twins, ...bare].map((item) => item.id);
  check(new Set(ids).size === ids.length, 'the lesson\'s own ids, the twins and the bare letters can never collide');
  check(bare.every((item) => item.id.length === 1) && twins.every((item) => item.id.length === 2), 'a bare id has no mark in it; a twin\'s ends in the other one');
  check(twins.every((twin) => twin.name === `${twin.letterName} with fatha`) && items.every((item) => item.name === `${item.letterName} with kasra`),
    'in the fatha names a twin is "with fatha" and an item "with kasra"', `${twins[0].name} / ${items[0].name}`);
  const zabarNames = world();
  zabarNames.shell.state.names = 'zabar';
  const zItems = zabarNames.marks.allItems(zabarNames.shell, zabarNames.mark, { looks });
  const zTwins = zabarNames.marks.twinItems(zabarNames.shell, zabarNames.mark, { keys: ['د'] });
  check(zItems[1].name === 'Baa with zair' && zTwins[0].name === 'Daal with zabar', 'in the zabar names it is "with zair" and "with zabar": each says its own', `${zItems[1].name} / ${zTwins[0].name}`);
  const all3 = [...zItems, ...zTwins];
  zabarNames.shell.state.names = 'fatha';
  zabarNames.marks.rename(all3, zabarNames.shell, zabarNames.mark);
  check(all3[1].name === 'Baa with kasra' && all3[all3.length - 1].name === 'Daal with fatha', 'rename() gives a twin the other mark\'s word, not this lesson\'s', `${all3[1].name} / ${all3[all3.length - 1].name}`);
  const withOther = marks.wordsFor(mark, shell);
  check(withOther.other === 'fatha' && withOther.Other === 'Fatha' && marks.wordsFor(fatha, shell).other === '', '{other} is the mark this one is shown against, and empty for the first');

  // which-mark: the same tag as mark-or-not, and the twin carries it.
  const familyOf = (list) => list.map((item) => item.family.join('|'));
  check(items.every((item) => item.family.length === 1 && item.family[0] === `letter:${item.key}`), "'which-mark' tags the letter, and only that");
  check(twins.every((twin) => twin.family.length === 1 && twin.family[0] === `letter:${twin.key}`), 'and the twin carries the same tag, so the engine can find it');
  check(familyOf(marks.allItems(shell, mark, { looks, distractors: 'look-alike' })).some((tags) => tags.startsWith('look')), "'look-alike' still tags the look-alikes, and stays available");
  check(marks.allItems(shell, mark, { distractors: 'any' }).every((item) => item.family.length === 0), "'any' still carries no tags");

  // The engine is handed the twins, and one of them is always among the wrong answers.
  const w = world();
  const engineItems = () => [...marks.poolFor(w.items, 1), ...marks.twinItems(w.shell, w.mark, { keys: mark.first, looks, distractors: 'which-mark' })];
  const drill = w.practice.create({ lesson: 5, items: engineItems(), formats: FORMATS, random: seeded(11), noRepeatWithin: 4 });
  drill.start();
  check(drill.progress().total === 6, 'the engine counts 6 required, twins not included', String(drill.progress().total));
  let ownAsked = 0;
  let withTwin = 0;
  let twinAsked = 0;
  for (let i = 0; i < 200; i += 1) {
    const q = drill.question;
    if (!q) break;
    if (q.item.mark === 'kasra') {
      ownAsked += 1;
      if (q.choices.some((c) => c.id === q.item.key + FATHA)) withTwin += 1;
    } else twinAsked += 1;
    drill.answer(q.item.id);
    drill.next();
  }
  check(ownAsked > 0 && withTwin === ownAsked, 'every question about zair has the same letter with zabar among the wrong answers', `${withTwin} of ${ownAsked}`);
  check(twinAsked > 0 && twinAsked / (ownAsked + twinAsked) > 0.2 && twinAsked / (ownAsked + twinAsked) < 0.5, 'and roughly one question in three is about a twin', `${Math.round((100 * twinAsked) / (ownAsked + twinAsked))}%`);

  // Counting: the lesson's own items, whatever rides along.
  const pooled = [...items, ...twins, ...bare];
  check(JSON.stringify(marks.sizes(pooled)) === '[6,29]', 'sizes() with twins and bare letters in the list is still 6 and 29');
  check(marks.stats(shell, 5, pooled, 2).total === 29 && marks.poolFor(pooled, 2).length === 29, 'stats() and poolFor() count only the lesson\'s own');
  const counted = world();
  for (const item of [...twins, ...bare]) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(5, item.id, true);
  check(counted.marks.stats(counted.shell, 5, [...counted.items, ...twins, ...bare], 2).known === 0, 'knowing the twins and the bare letters moves the lesson by nothing');
  check(counted.shell.masteredCount(5, 3) === 0, "and neither does the home's card: 12 review ids known, the card reads nothing", String(counted.shell.masteredCount(5, 3)));
  for (const item of counted.items.slice(0, 3)) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(5, item.id, true);
  check(counted.shell.masteredCount(5, 3) === 3, 'three of its own known reads three', String(counted.shell.masteredCount(5, 3)));

  // Mastery survives a change of script and of part.
  const switched = boot();
  const inMadani = switched.marks.allItems(switched.shell, kasra(switched), { looks }).find((item) => item.key === 'ك');
  for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(5, inMadani.id, true);
  switched.shell.state.script = 'indopak';
  const inIndoPak = switched.marks.allItems(switched.shell, kasra(switched), { looks }).find((item) => item.key === 'ك');
  check(inIndoPak.glyph === 'ک' + KASRA && switched.marks.stats(switched.shell, 5, [inIndoPak], 2).known === 1, 'the Indo-Pak kaaf keeps its credit, and is written in the Indo-Pak form');
  drill.setItems([...marks.poolFor(w.items, 2), ...marks.twinItems(w.shell, w.mark, { keys: w.items.map((item) => item.key) })]);
  check(drill.progress().total === 29, 'moving to part 2 counts 29 with 29 twins in the pool', String(drill.progress().total));

  // Review reaches back two lessons.
  const seeded4 = boot();
  seeded4.shell.recordAnswer(2, 'غ', false);
  seeded4.shell.recordAnswer(4, 'ج' + FATHA, false);
  seeded4.shell.recordAnswer(4, 'ض' + FATHA, false);
  const back = seeded4.marks.reviewItems(seeded4.shell, seeded4.marks.MARKS.kasra, { count: 3 }).map((item) => item.id);
  check(['غ', 'ج', 'ض'].every((key) => back.includes(key)), 'the bare sample follows Lesson 2 and Lesson 4: a letter missed in either is in it', back.join(''));
  const forFatha = seeded4.marks.reviewItems(seeded4.shell, seeded4.marks.MARKS.fatha, { count: 3 }).map((item) => item.id);
  check(!forFatha.includes('ج') && !forFatha.includes('ض'), 'and the first mark, with nothing before it, does not look at Lesson 4 for itself', forFatha.join(''));

  // The board and the rail.
  const rows = marks.boardRows(shell, mark, 1);
  check(rows.length === 6 && rows.every((row) => row.marked === row.glyph + KASRA && row.others.length === 1 && row.others[0].glyph === row.glyph + FATHA && row.others[0].id === 'fatha'),
    'the board has six rows; each carries the letter with zair and, in `others`, with zabar');
  check(marks.boardRows(shell, marks.MARKS.fatha, 2).every((row) => row.others.length === 0), "and the first mark's board has no other column");
  check(marks.boardRows(shell, mark, 2).length === 29 && rows.map((row) => row.key).sort().join('') === mark.first.slice().sort().join(''), 'part 2 is all 29, part 1 is the mark\'s own six');
  check(marks.sampleOf(shell, mark, 1) === 'د' + KASRA && marks.sampleOf(shell, mark, 2) === 'ع' + KASRA, "the rail shows the mark's own sample (not baa), and a hanging letter for part 2");
  check(marks.sampleOf(shell, fatha, 1) === 'ب' + FATHA, "and baa for fatha, as before");

  // The lesson's row on the home.
  const row = shell.LESSONS.find((entry) => entry.n === 5);
  check(row.built === true && row.href === 'lesson-5.html' && row.progress === 'drill' && row.cp === 0x0650, 'the home has Lesson 5 as a real link that counts the drill by its mark');
}
function kasra(w) { return w.marks.MARKS.kasra; }

// ---- 9c. Lesson 6: the third mark, and two marks riding along ----------------------------------------------------
// docs/lesson-6/05 §3. The data layer only: marks.js in node, no page. The page is tools/qaida-lesson6-check.js.

console.log('\nLesson 6: the third mark');
{
  const FATHA = String.fromCharCode(0x064E);
  const KASRA = String.fromCharCode(0x0650);
  const DAMMA = String.fromCharCode(0x064F);
  const looks = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const world = (script) => {
    const w = boot();
    if (script) w.shell.state.script = script;
    w.mark = w.marks.MARKS.damma;
    w.items = w.marks.allItems(w.shell, w.mark, { looks, distractors: 'which-mark' });
    return w;
  };
  const madani = world();
  const indopak = world('indopak');
  const { shell, marks, mark, items } = madani;
  const { fatha, kasra: zair } = marks.MARKS;

  // `against`: a list, in lesson order, and otherOf is its first entry.
  check([fatha, zair, mark].every((m) => Array.isArray(m.against)), '`against` is a list on every mark');
  check(fatha.against.length === 0 && zair.against.join() === 'fatha' && mark.against.join() === 'fatha,kasra', 'fatha has none, kasra has fatha, damma has fatha and kasra, in lesson order');
  check(marks.otherOf(fatha) === null && marks.otherOf(zair).id === 'fatha' && marks.otherOf(mark).id === 'fatha',
    "otherOf is the first of the list: paish's nearest contrast is zabar, not the zair before it");
  check(marks.othersOf(mark).map((m) => m.id).join() === 'fatha,kasra', 'othersOf(paish) is zabar then zair');

  // Ids and glyphs.
  check(mark.sits === 'above' && mark.cp === 0x064F && mark.lesson === 6, 'paish sits above, is U+064F, and is lesson 6');
  check(items.length === 29 && indopak.items.length === 29, 'allItems() is 29 in both scripts');
  check(items.every((item) => item.id.length === 2 && item.id.endsWith(DAMMA) && item.glyph === item.base + DAMMA && item.mark === 'damma' && item.marked), 'every id is a letter and U+064F, and says it is damma\'s');
  check(JSON.stringify(items.map((item) => item.id).sort()) === JSON.stringify(indopak.items.map((item) => item.id).sort()), 'Madani and Indo-Pak produce the same id set');
  check(items.every((item) => item.audio.kind === 'damma' && item.audio.glyph === item.base), "every item's recording is the damma group, keyed by the base letter");
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'marks.js'), 'utf8')), 'marks.js holds no literal combining mark: not one of the three');
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'lesson-6.html'), 'utf8')), 'and lesson-6.html holds none either: the title glyph is a numeric reference');
  check(JSON.stringify(marks.sizes(items)) === '[6,29]', 'the two parts hold 6 and 29');
  check(mark.first.join() === fatha.first.join(), "paish's part 1 is zabar's six: the pair بَ / بُ is on the board from the first minute");

  // The four ids of one letter are distinct, so credit for one mark can never be credited for another.
  const ba = [ 'ب', 'ب' + FATHA, 'ب' + KASRA, 'ب' + DAMMA ];
  check(new Set(ba).size === 4, 'the four ids of one letter are four distinct strings');

  // Two sets of twins.
  const keys = marks.poolFor(items, 1).map((item) => item.key);
  const both = marks.twinItems(shell, mark, { keys, looks, distractors: 'which-mark' });
  check(both.length === 12, 'twinItems with the default gives both marks: 2 x 6 twins', String(both.length));
  check(both.every((twin) => twin.parts.length === 0 && twin.required === false && twin.marked), 'every twin is review: in no part, never required');
  check(both.filter((twin) => twin.mark === 'fatha').length === 6 && both.filter((twin) => twin.mark === 'kasra').length === 6, 'six of each mark');
  check(both.every((twin) => twin.id === twin.key + String.fromCharCode(marks.MARKS[twin.mark].cp) && twin.audio.kind === marks.MARKS[twin.mark].audio), 'each carries its own mark id and its own recording');
  check(both.every((twin) => twin.name === `${twin.letterName} with ${twin.mark}`), 'and its own mark\'s word', both[0].name);
  check(marks.twinItems(shell, mark, { keys, marks: [zair] }).length === 6 && marks.twinItems(shell, mark, { keys, marks: [] }).length === 0, 'the page can say which marks: one gives six, none gives none');
  const bare = marks.reviewItems(shell, mark, { count: 8 });
  const ids = [...items, ...both, ...bare].map((item) => item.id);
  check(new Set(ids).size === ids.length, 'the lesson\'s own ids, both sets of twins and the bare letters never collide');

  // Counting is unchanged by them.
  const pooled = [...items, ...both, ...bare];
  check(JSON.stringify(marks.sizes(pooled)) === '[6,29]' && marks.stats(shell, 6, pooled, 2).total === 29 && marks.poolFor(pooled, 2).length === 29, 'sizes, stats and poolFor still count 29, not 87');
  const counted = world();
  const bothAll = counted.marks.twinItems(counted.shell, counted.mark, { keys: counted.items.map((item) => item.key) });
  for (const item of [...bothAll, ...bare]) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(6, item.id, true);
  check(counted.marks.stats(counted.shell, 6, [...counted.items, ...bothAll, ...bare], 2).known === 0, 'knowing 58 twins and the bare letters moves the lesson by nothing');
  check(counted.shell.masteredCount(6, 3) === 0, "and neither does the home's card", String(counted.shell.masteredCount(6, 3)));
  for (const item of counted.items.slice(0, 4)) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(6, item.id, true);
  check(counted.shell.masteredCount(6, 3) === 4, 'four of its own known reads four', String(counted.shell.masteredCount(6, 3)));

  // {others}.
  const words = marks.wordsFor(mark, shell);
  check(words.other === 'fatha' && words.others === 'fatha and kasra' && words.Others === 'Fatha and kasra', '{others} is "fatha and kasra" in the fatha names');
  const zabarNames = world();
  zabarNames.shell.state.names = 'zabar';
  const zw = zabarNames.marks.wordsFor(zabarNames.mark, zabarNames.shell);
  check(zw.mark === 'paish' && zw.other === 'zabar' && zw.others === 'zabar and zair', '{others} is "zabar and zair" in the zabar names', zw.others);
  check(marks.wordsFor(zair, shell).others === 'fatha' && marks.wordsFor(fatha, shell).others === '' && marks.wordsFor(fatha, shell).other === '', '{others} is one name on Lesson 5 and empty on Lesson 4');

  // Review reaches back to lessons 4 and 5.
  const missed = boot();
  missed.shell.recordAnswer(4, 'ج' + FATHA, false);
  missed.shell.recordAnswer(5, 'ض' + KASRA, false);
  missed.shell.recordAnswer(2, 'غ', false);
  const back = missed.marks.reviewItems(missed.shell, missed.marks.MARKS.damma, { count: 3 }).map((item) => item.id);
  check(['غ', 'ج', 'ض'].every((key) => back.includes(key)), 'the bare sample follows lessons 2, 4 and 5: a letter missed in any is in it', back.join(''));
  const forZair = missed.marks.reviewItems(missed.shell, missed.marks.MARKS.kasra, { count: 3 }).map((item) => item.id);
  check(!forZair.includes('ض'), "and Lesson 5 does not look at its own lesson for itself", forZair.join(''));

  // The board: the letter, then one entry per earlier mark.
  const rows = marks.boardRows(shell, mark, 1);
  check(rows.length === 6 && rows.every((row) => row.marked === row.glyph + DAMMA && row.others.map((o) => o.glyph).join() === [row.glyph + FATHA, row.glyph + KASRA].join()),
    'the board has six rows, each with zabar then zair in `others`');
  check(rows.every((row) => row.others.map((o) => o.name).join() === 'fatha,kasra'), 'each entry carries its own name, for its own caption', rows[0].others.map((o) => o.name).join());
  check(marks.boardRows(shell, mark, 2).length === 29, 'part 2 is all 29');
  check(marks.sampleOf(shell, mark, 1) === 'ب' + DAMMA && marks.sampleOf(shell, mark, 2) === 'ع' + DAMMA, 'the rail shows baa with paish, and ain with paish');

  // The engine, told the alternate, still finds the same letter with the other mark among the wrong answers.
  const w = world();
  const engineItems = () => [
    ...marks.poolFor(w.items, 1),
    ...marks.twinItems(w.shell, w.mark, { keys: keys.filter((_, i) => i % 2 === 0), marks: [fatha], looks, distractors: 'which-mark' }),
    ...marks.twinItems(w.shell, w.mark, { keys: keys.filter((_, i) => i % 2 === 1), marks: [zair], looks, distractors: 'which-mark' }),
  ];
  const drill = w.practice.create({ lesson: 6, items: engineItems(), formats: FORMATS, random: seeded(13), noRepeatWithin: 4 });
  drill.start();
  check(drill.progress().total === 6, 'the engine counts 6 required, twins not included', String(drill.progress().total));
  let ownAsked = 0;
  let withTwin = 0;
  for (let i = 0; i < 200; i += 1) {
    const q = drill.question;
    if (!q) break;
    if (q.item.mark === 'damma') {
      ownAsked += 1;
      if (q.choices.some((c) => c.id !== q.item.id && c.key === q.item.key)) withTwin += 1;
    }
    drill.answer(q.item.id);
    drill.next();
  }
  check(ownAsked > 0 && withTwin === ownAsked, 'every question about paish has the same letter with another mark among the wrong answers', `${withTwin} of ${ownAsked}`);

  // The lesson's row on the home.
  const row = shell.LESSONS.find((entry) => entry.n === 6);
  check(row.built === true && row.href === 'lesson-6.html' && row.progress === 'drill' && row.cp === 0x064F, 'the home has Lesson 6 as a real link that counts the drill by its mark');
}

// ---- 9d. Lesson 7: the doubled marks, and a lesson with more than one mark ----------------------------------------
// docs/lesson-7/05 §3. The data layer only: marks.js in node, no page. The page is tools/qaida-lesson7-check.js.
// Written first, per the spec: the one-mark case (lessons 4-6) must come out of every change below exactly as it
// always has, so that assertion is not new — it is every check already above, still passing.

console.log('\nLesson 7: the doubled marks');
{
  const FATHA = String.fromCharCode(0x064E);
  const KASRA = String.fromCharCode(0x0650);
  const DAMMA = String.fromCharCode(0x064F);
  const FATHATAIN = String.fromCharCode(0x064B);
  const KASRATAIN = String.fromCharCode(0x064D);
  const DAMMATAIN = String.fromCharCode(0x064C);
  const looks = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const world = (script) => {
    const w = boot();
    if (script) w.shell.state.script = script;
    w.own = w.marks.marksOf('tanween');
    w.items = w.marks.allItems(w.shell, w.own, { looks, distractors: 'which-mark' });
    return w;
  };
  const madani = world();
  const indopak = world('indopak');
  const { shell, marks, own, items } = madani;
  const [fathatain, kasratain, dammatain] = own;
  const { fatha, kasra, damma } = marks.MARKS;

  check(marks.setOf('tanween').marks.join() === 'fathatain,kasratain,dammatain', 'the tanween set names its three marks, in lesson order');
  check(own.map((m) => m.id).join() === 'fathatain,kasratain,dammatain', 'marksOf resolves the set to the same three, as mark objects');
  check(marks.marksOf('damma').length === 1 && marks.marksOf('damma')[0] === damma, 'a single mark still resolves to a list of one, unchanged');

  // The three rows themselves.
  check(fathatain.cp === 0x064B && kasratain.cp === 0x064D && dammatain.cp === 0x064C, 'the three code points are right');
  check(fathatain.sits === 'above' && dammatain.sits === 'above' && kasratain.sits === 'below', 'two sit above, one below, exactly as their single counterparts do');
  check([fathatain, kasratain, dammatain].every((m) => m.lesson === 7), 'all three belong to lesson 7');
  check(fathatain.against.join() === 'fatha' && kasratain.against.join() === 'kasra' && dammatain.against.join() === 'damma',
    'against is the single counterpart on all three, not every earlier mark');
  check(fathatain.first === fatha.first && dammatain.first === damma.first, "first is BORROWED from the single mark's own row, not copied");
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'marks.js'), 'utf8')), 'marks.js holds no literal combining mark: none of the six');
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'lesson-7.html'), 'utf8')), 'and lesson-7.html holds none either: the title glyph is a numeric reference');

  // partsOf: the one-mark case is unchanged, and the tanween set is four parts.
  const onePart = marks.partsOf([damma]);
  check(onePart.length === 2 && onePart[0].first === true && onePart[0].mark === damma && onePart[1].mark === damma,
    "partsOf for a single mark is still two parts, the one-mark case lessons 4-6 already are");
  const parts = marks.partsOf(own);
  check(parts.length === 4 && parts.slice(0, 3).every((p, i) => p.first && p.mark === own[i]), 'partsOf for the tanween set is four parts, the first three carrying one mark each in lesson order');
  check(parts[3].first === false && parts[3].mark === fathatain, "the last part's mark is the lesson's first (its own word, {set}, is what names the lesson)");

  // allItems: every id is two characters, distinct, and the last part has 29 required, spread across the three marks.
  check(items.length >= 29 && items.length <= 47, 'allItems() for the tanween set is between 29 (all shared) and 47 (none shared)', String(items.length));
  check(items.every((item) => item.id.length === 2), 'every id is two characters: the letter, folded to Madani, then the mark');
  check(new Set(items.map((item) => item.id)).size === items.length, 'every id is unique');
  check(JSON.stringify(items.map((item) => item.id).sort()) === JSON.stringify(indopak.items.map((item) => item.id).sort()), 'Madani and Indo-Pak produce the same id set');
  const sizes = marks.sizes(items, parts);
  check(JSON.stringify(sizes) === '[6,6,6,29]', 'the four parts hold 6, 6, 6 and 29', sizes.join(','));
  const lastKeys = items.filter((item) => marks.inPart(item, 4)).map((item) => item.mark);
  const spread = ['fathatain', 'kasratain', 'dammatain'].map((id) => lastKeys.filter((m) => m === id).length);
  check(spread.reduce((a, b) => a + b, 0) === 29 && spread.every((n) => n >= 9 && n <= 10), 'the last part spreads its 29 across the three marks evenly (10, 10, 9)', spread.join(','));

  // Six distinct ids for one letter (docs/lesson-7/05 §3): bare, and each of the six marks.
  const ba = ['ب', 'ب' + FATHA, 'ب' + KASRA, 'ب' + DAMMA, 'ب' + FATHATAIN, 'ب' + KASRATAIN, 'ب' + DAMMATAIN];
  check(new Set(ba).size === 7, 'a letter has seven distinct ids: bare, and each of the six marks');

  // A pair belonging to a warm-up part AND the last part is the SAME item, not two.
  const bothParts = items.filter((item) => item.parts.length > 1);
  check(bothParts.length > 0 && bothParts.every((item) => item.parts.includes(4)), 'a letter whose rotation lands on its warm-up mark gains a second part, on the same item');

  // sizes()/stats() count each id once, whichever parts it is in.
  const recorded = world();
  for (const item of bothParts.length ? [items.find((i) => i.parts.length > 1)] : []) {
    for (let k = 0; k < 3; k += 1) recorded.shell.recordAnswer(7, item.id, true);
  }
  if (bothParts.length) {
    const doubleCounted = recorded.marks.stats(recorded.shell, 7, recorded.items, 4, { target: 2 }).known
      + recorded.marks.stats(recorded.shell, 7, recorded.items, bothParts[0].parts.find((n) => n !== 4), { target: 2 }).known;
    check(doubleCounted === 2, 'stats counts a pair known in two parts as known in each, not twice in one', String(doubleCounted));
  }

  // {set}: "tanween" in both name sets, empty on lessons 4-6.
  check(marks.setOf('tanween').names.fatha === 'tanween' && marks.setOf('tanween').names.zabar === 'tanween', '{set} is "tanween" in both name sets');
  check(marks.setOf('damma') === null, 'and lessons 4-6 have no set of their own — data-mark names a single mark');

  // The home's row.
  const row = shell.LESSONS.find((entry) => entry.n === 7);
  check(row.built === true && row.href === 'lesson-7.html' && row.progress === 'drill' && JSON.stringify(row.cp) === JSON.stringify([0x064B, 0x064C, 0x064D]),
    'the home has Lesson 7 as a real link, its cp a list of three');
  const homeCounted = world();
  for (const item of homeCounted.items.slice(0, 4)) for (let k = 0; k < 3; k += 1) homeCounted.shell.recordAnswer(7, item.id, true);
  check(homeCounted.shell.masteredCount(7, 3) === 4, "masteredCount accepts cp as a list: four of the lesson's own known reads four", String(homeCounted.shell.masteredCount(7, 3)));
}

// ---- 9e. Lesson 8: an item of two letters -----------------------------------------------------------------------
// docs/lesson-8/06 §3. The data layer only: marks.js and shell.js's masteredCount, in node. The page is
// tools/qaida-lesson8-check.js. Written per the spec: the no-tail case (lessons 4-7) must come out of every change
// here exactly as it always has — every check above, still passing, is that assertion.

console.log('\nLesson 8: an item of two letters');
{
  const FATHA = String.fromCharCode(0x064E);
  const KASRA = String.fromCharCode(0x0650);
  const DAMMA = String.fromCharCode(0x064F);
  const FATHATAIN = String.fromCharCode(0x064B);
  const KASRATAIN = String.fromCharCode(0x064D);
  const DAMMATAIN = String.fromCharCode(0x064C);
  const ALIF = String.fromCharCode(0x0627);
  const looks = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const world = (script) => {
    const w = boot();
    if (script) w.shell.state.script = script;
    w.mark = w.marks.MARKS['fatha-alif'];
    w.items = w.marks.allItems(w.shell, w.mark, { looks, distractors: 'which-mark' });
    return w;
  };
  const madani = world();
  const indopak = world('indopak');
  const { shell, marks, mark, items } = madani;
  const fatha = marks.MARKS.fatha;

  // suffixOf: the no-tail case (step 1, written before any of §2's code exists) is exactly today's single character.
  check(marks.suffixOf(fatha) === FATHA, 'suffixOf with no tail is exactly the mark, unchanged — the no-tail case');
  check(marks.suffixOf(mark) === FATHA + ALIF, 'suffixOf with a tail is the mark AND what follows it');
  check(marks.glyphOf('ب', mark) === 'ب' + FATHA + ALIF, 'glyphOf composes the mark and the tail, never pasted');
  check(marks.aloneOf(mark) === String.fromCharCode(0x25CC) + FATHA + ALIF, 'aloneOf carries the tail too: a dotted circle, zabar, alif');

  // The row itself.
  check(mark.cp === 0x064E && JSON.stringify(mark.tail) === JSON.stringify([0x0627]), "zabar's code point, and an alif as the tail");
  check(JSON.stringify(mark.skip) === JSON.stringify(['ا', 'ء']), 'alif and hamza are skipped');
  check(mark.against.join() === 'fatha' && mark.lesson === 8 && mark.sits === 'above', 'against is fatha alone, lesson 8, sits above');
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'marks.js'), 'utf8')), 'marks.js holds no literal combining mark: not the tail either');
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'lesson-8.html'), 'utf8')), 'and lesson-8.html holds none either');

  // 27 items, none for alif or hamza; every id is three characters, ending zabar then alif.
  check(items.length === 27, '27 items, not 29: no alif, no hamza', String(items.length));
  check(!items.some((item) => item.key === 'ا' || item.key === 'ء'), 'neither skipped letter has an item at all');
  check(items.every((item) => item.id.length === 3 && item.id.endsWith(FATHA + ALIF)), 'every id is three characters, ending zabar then alif');
  check(JSON.stringify(items.map((item) => item.id).sort()) === JSON.stringify(indopak.items.map((item) => item.id).sort()), 'Madani and Indo-Pak produce the same id set');

  // Parts: [6, 27]; part 1 is fatha's six with laam swapped for noon, laam only in part 2.
  const parts = marks.partsOf([mark]);
  check(JSON.stringify(marks.sizes(items, parts)) === '[6,27]', 'sizes() is [6, 27]', JSON.stringify(marks.sizes(items, parts)));
  check(JSON.stringify(mark.first) === JSON.stringify(['ب', 'د', 'ر', 'س', 'م', 'ن']), "part 1 is fatha's six with laam swapped for noon");
  check(!items.some((item) => item.key === 'ل' && item.parts.includes(1)), 'laam is never in part 1');
  check(items.some((item) => item.key === 'ل' && item.parts.includes(2)), 'laam is in part 2');

  // ب has distinct ids across every lesson: bare, and each of the seven marks (six single/doubled, and now the long aa).
  const ba = ['ب', 'ب' + FATHA, 'ب' + KASRA, 'ب' + DAMMA, 'ب' + FATHATAIN, 'ب' + KASRATAIN, 'ب' + DAMMATAIN, 'ب' + FATHA + ALIF];
  check(new Set(ba).size === 8, 'a letter has eight distinct ids: bare, each of the six single/doubled marks, and now the long aa');

  // Twins: every Lesson 8 item's twin is the same letter with zabar and no alif, and the engine offers it among the answers.
  const twins = marks.twinItems(shell, mark, { keys: mark.first, marks: [fatha], looks, distractors: 'which-mark' });
  check(twins.length === 6 && twins.every((twin) => twin.id.length === 2 && twin.id.endsWith(FATHA)), 'every twin is the same letter with zabar, no alif');
  const engineItems = [
    ...marks.poolFor(items, 1),
    ...marks.twinItems(shell, mark, { keys: mark.first, marks: [fatha], looks, distractors: 'which-mark' }),
  ];
  const drill = madani.practice.create({ lesson: 8, items: engineItems, formats: FORMATS, random: seeded(17), noRepeatWithin: 4 });
  drill.start();
  let ownAsked = 0;
  let withTwin = 0;
  for (let i = 0; i < 300; i += 1) {
    const q = drill.question;
    if (!q) break;
    if (q.item.mark === 'fatha-alif') {
      ownAsked += 1;
      if (q.choices.some((c) => c.id !== q.item.id && c.key === q.item.key)) withTwin += 1;
    }
    drill.answer(q.item.id);
    drill.next();
  }
  check(ownAsked > 0 && withTwin === ownAsked, "every question about a Lesson 8 item has its OWN TWIN (the same letter with zabar, no alif) among the answers", `${withTwin} of ${ownAsked}`);

  // masteredCount: a suffix, not a code point (docs/lesson-8/03 §3). Lesson 8 shares zabar's cp with Lesson 4.
  const counted = world();
  for (const item of counted.items.slice(0, 3)) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(8, item.id, true);
  for (const twin of counted.marks.twinItems(counted.shell, counted.mark, { keys: ['د'], marks: [fatha] })) {
    for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(8, twin.id, true);
  }
  check(counted.shell.masteredCount(8, 3) === 3, "masteredCount(8) counts its own three, not the twin riding along in the same record", String(counted.shell.masteredCount(8, 3)));
  const lesson4 = world();
  for (let k = 0; k < 3; k += 1) lesson4.shell.recordAnswer(4, 'ب' + FATHA, true);
  check(lesson4.shell.masteredCount(4, 3) === 1, "masteredCount(4) is unchanged by Lesson 8's row: they share a code point, the LENGTH tells them apart");

  // glyphOf on Indo-Pak; ids fold to Madani.
  const kaf = 'ک'; // Indo-Pak kaf, folds to ك
  check(marks.glyphOf(kaf, mark) === kaf + FATHA + ALIF, 'glyphOf draws the Indo-Pak letter, unchanged by the tail');
  const indoItem = indopak.items.find((item) => item.key === 'ك');
  check(Boolean(indoItem) && indoItem.glyph.startsWith('ک'), "an Indo-Pak item's glyph is the Indo-Pak letter, while its id folds to Madani");

  // Mastery survives a change of script: the id it is recorded under does not change with it.
  const survive = world();
  const survivor = survive.items[0];
  for (let k = 0; k < 3; k += 1) survive.shell.recordAnswer(8, survivor.id, true);
  survive.shell.state.script = 'indopak';
  check((survive.shell.drillOf(8).streak[survivor.id] || 0) === 3, 'the record is kept under the id, which does not change with the script');

  // NEVER_JOIN: the five letters that leave the alif standing apart (docs/lesson-8/02 §3), a copy of Lesson 3's own
  // "never joins forward" group less the alif itself.
  check(JSON.stringify(marks.NEVER_JOIN) === JSON.stringify(['د', 'ذ', 'ر', 'ز', 'و']), 'NEVER_JOIN is the five non-joining letters, alif itself left out');

  // No literal combining mark in the two files that now carry the most Arabic on the site (docs/lesson-8/06 §3).
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'spell.js'), 'utf8')), 'spell.js holds no literal combining mark');
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'exercise.js'), 'utf8')), 'exercise.js holds no literal combining mark');
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'exercise-8.html'), 'utf8')), 'exercise-8.html holds no literal combining mark');

  // The home's row.
  const row = shell.LESSONS.find((entry) => entry.n === 8);
  check(row.built === true && row.href === 'lesson-8.html' && row.progress === 'drill' && row.cp === 0x064E && JSON.stringify(row.tail) === JSON.stringify([0x0627]),
    "the home has Lesson 8 as a real link, sharing zabar's code point and carrying its own tail");
}

// ---- 9f. The fence: formOf/drawnOf must not move lessons 4-8 -----------------------------------------------------
// docs/lesson-9/06 §2, step 1: written FIRST, before any of Lesson 9's own rows exist, so it holds regardless of
// build order. `drawnOf` is the general case `glyphOf`/`aloneOf` now go through; for every mark with no `forms` of
// its own it must equal `suffixOf` exactly, character for character, in both scripts.

console.log('\nThe fence: lessons 4-8 draw exactly as they always have');
{
  const { marks } = boot();
  const noForms = Object.values(marks.MARKS).filter((m) => m.lesson <= 8);
  check(noForms.length === 7, 'seven marks belong to lessons 4-8 (fatha, kasra, damma, the three doubled, fatha-alif)', String(noForms.length));
  for (const mark of noForms) {
    check(marks.drawnOf(mark, 'madani') === marks.suffixOf(mark), `${mark.id}: drawnOf(madani) is exactly suffixOf`, marks.drawnOf(mark, 'madani'));
    check(marks.drawnOf(mark, 'indopak') === marks.suffixOf(mark), `${mark.id}: drawnOf(indopak) is exactly suffixOf`, marks.drawnOf(mark, 'indopak'));
  }
  // Every item's glyph, in both scripts, byte-for-byte what it was before formOf existed.
  for (const [name, mark] of Object.entries(marks.MARKS)) {
    if (mark.lesson > 8) continue;
    for (const script of ['madani', 'indopak']) {
      const world = boot();
      world.shell.state.script = script;
      const items = world.marks.allItems(world.shell, world.marks.MARKS[name]);
      check(items.every((item) => item.glyph === item.base + marks.suffixOf(mark)), `Lesson ${mark.lesson} (${name}) in ${script}: every glyph is still base + suffixOf, untouched by formOf`);
    }
  }
}

// ---- 9f2. The fence for lessons 4-10, written before Lesson 11's row existed --------------------------------------
// docs/lesson-11/06 §2, step 2. The hash is of every item (mark, script, id, glyph, key) of every mark with `lesson
// <= 10`, in both scripts, taken with Lesson 11 not yet in MARKS. Adding the fourth `Object.assign` must not move it.

console.log('\nThe fence: lessons 4-10 come out identical after Lesson 11');
{
  const crypto = require('crypto');
  const probe = boot();
  const lines = [];
  for (const [name, mark] of Object.entries(probe.marks.MARKS)) {
    if (mark.lesson > 10) continue;
    for (const script of ['madani', 'indopak']) {
      const w = boot();
      w.shell.state.script = script;
      for (const it of w.marks.allItems(w.shell, w.marks.MARKS[name])) lines.push([name, script, it.id, it.glyph, it.key].join('|'));
    }
  }
  const hash = crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
  check(lines.length === 618 && hash === '1b200e317daccb0a22369cf16efbf232ae95656e0359d71cdd9f843668be7a4f',
    'every item of lessons 4-10, in both scripts, is exactly what it was before Lesson 11', `${lines.length} ${hash.slice(0, 12)}`);
  const world = boot();
  for (const n of [4, 6, 8, 10]) {
    const mark = Object.values(world.marks.MARKS).find((m) => m.lesson === n);
    for (let k = 0; k < 3; k += 1) world.shell.recordAnswer(n, 'ب' + world.marks.suffixOf(mark), true);
    check(world.shell.masteredCount(n) === 1, `masteredCount(${n}) counts one mastered item of its own`, String(world.shell.masteredCount(n)));
  }
}

// ---- 9f3. The fence for lessons 4-11, written before Lesson 12's row existed --------------------------------------
// docs/lesson-12/06 §2, step 1. The same hash, over `lesson <= 11`, taken with Lesson 12 not yet in MARKS, and
// `formOf`'s `cp` fallback (docs/lesson-12/03 §1) not yet added. Adding the row and the fallback must not move it.

console.log('\nThe fence: lessons 4-11 come out identical after Lesson 12');
{
  const crypto = require('crypto');
  const probe = boot();
  const lines = [];
  for (const [name, mark] of Object.entries(probe.marks.MARKS)) {
    if (mark.lesson > 11) continue;
    for (const script of ['madani', 'indopak']) {
      const w = boot();
      w.shell.state.script = script;
      for (const it of w.marks.allItems(w.shell, w.marks.MARKS[name])) lines.push([name, script, it.id, it.glyph, it.key].join('|'));
    }
  }
  const hash = crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
  check(lines.length === 672 && hash === '1b0a47fe01aa48ef50e75a6967440086062c2bdb49d2b152d370525e36a272eb',
    'every item of lessons 4-11, in both scripts, is exactly what it was before Lesson 12', `${lines.length} ${hash.slice(0, 12)}`);
  const world = boot();
  for (const n of [4, 6, 8, 10, 11]) {
    const mark = Object.values(world.marks.MARKS).find((m) => m.lesson === n);
    for (let k = 0; k < 3; k += 1) world.shell.recordAnswer(n, 'ب' + world.marks.suffixOf(mark), true);
    check(world.shell.masteredCount(n) === 1, `masteredCount(${n}) counts one mastered item of its own`, String(world.shell.masteredCount(n)));
  }
}

// ---- 9f4. The fence for lessons 4-12, written before Lesson 13's row existed --------------------------------------
// docs/lesson-13/03 §4, step 2. The same hash, over `lesson <= 12`, taken with Lesson 13 not yet in MARKS. Adding the
// row must not move it.

console.log('\nThe fence: lessons 4-12 come out identical after Lesson 13');
{
  const crypto = require('crypto');
  const probe = boot();
  const lines = [];
  for (const [name, mark] of Object.entries(probe.marks.MARKS)) {
    if (mark.lesson > 12) continue;
    for (const script of ['madani', 'indopak']) {
      const w = boot();
      w.shell.state.script = script;
      for (const it of w.marks.allItems(w.shell, w.marks.MARKS[name])) lines.push([name, script, it.id, it.glyph, it.key].join('|'));
    }
  }
  const hash = crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
  check(lines.length === 726 && hash === 'b3bfd9e8c8b96ab284a89f0fcd1002893b1603082b1b547f23165547aa2550b9',
    'every item of lessons 4-12, in both scripts, is exactly what it was before Lesson 13', `${lines.length} ${hash.slice(0, 12)}`);
  const world = boot();
  for (const n of [4, 5, 6, 8, 10, 11, 12]) {
    const mark = Object.values(world.marks.MARKS).find((m) => m.lesson === n);
    for (let k = 0; k < 3; k += 1) world.shell.recordAnswer(n, 'ب' + world.marks.suffixOf(mark), true);
    check(world.shell.masteredCount(n) === 1, `masteredCount(${n}) counts one mastered item of its own`, String(world.shell.masteredCount(n)));
  }
}

// ---- 9f5. The fence for lessons 4-13, written before Lesson 14's `lead` existed -----------------------------------
// docs/lesson-14/06 §2, step 1. The hash is of every glyph that `allItems`, `twinItems`, `boardRows` and `sampleOf`
// return for every mark with `lesson <= 13`, in both scripts, taken before `leadOf` and the eight draw sites existed.
// `leadOf` is '' for every row but Lesson 14's, so none of it may move.

console.log('\nThe fence: lessons 4-13 come out identical after Lesson 14');
{
  const crypto = require('crypto');
  const probe = boot();
  const lines = [];
  for (const [name, mark] of Object.entries(probe.marks.MARKS)) {
    if (mark.lesson > 13) continue;
    for (const script of ['madani', 'indopak']) {
      const w = boot();
      w.shell.state.script = script;
      const own = w.marks.MARKS[name];
      for (const it of w.marks.allItems(w.shell, own)) lines.push(['item', name, script, it.id, it.glyph, it.key].join('|'));
      const keys = own.first;
      for (const it of w.marks.twinItems(w.shell, own, { keys })) lines.push(['twin', name, script, it.id, it.glyph, it.key].join('|'));
      for (const n of [1, 2]) {
        for (const row of w.marks.boardRows(w.shell, own, n)) {
          lines.push(['row', name, script, n, row.key, row.marked, row.joined, row.others.map((o) => `${o.id}:${o.glyph}`).join(',')].join('|'));
        }
        lines.push(['sample', name, script, n, w.marks.sampleOf(w.shell, own, n)].join('|'));
      }
    }
  }
  const hash = crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
  check(lines.length === 2000 && hash === 'b32e84f6ba17c4b315f99b78c3aed8377abdc618c50dc42b9d4ba95a7854d540',
    'every item, twin, board row and sample of lessons 4-13, in both scripts, is exactly what it was before Lesson 14', `${lines.length} ${hash.slice(0, 12)}`);
  const world = boot();
  for (const n of [4, 5, 6, 8, 10, 11, 12, 13]) {
    const mark = Object.values(world.marks.MARKS).find((m) => m.lesson === n);
    for (let k = 0; k < 3; k += 1) world.shell.recordAnswer(n, 'ب' + world.marks.suffixOf(mark), true);
    check(world.shell.masteredCount(n) === 1, `masteredCount(${n}) counts one mastered item of its own`, String(world.shell.masteredCount(n)));
  }
}

// ---- 9f6. The fence for lessons 4-14, written before Lesson 15's `cp` list and `sits` existed --------------------
// docs/lesson-15/06 §2, step 2. The same recipe as 9f5, over `lesson <= 14`, taken with Lesson 15 not yet in MARKS and
// `cpsOf`, `formOf`'s `sits` and the twin's own lead not yet added. Adding them must not move it.

console.log('\nThe fence: lessons 4-14 come out identical after Lesson 15');
{
  const crypto = require('crypto');
  const probe = boot();
  const lines = [];
  for (const [name, mark] of Object.entries(probe.marks.MARKS)) {
    if (mark.lesson > 14) continue;
    for (const script of ['madani', 'indopak']) {
      const w = boot();
      w.shell.state.script = script;
      const own = w.marks.MARKS[name];
      for (const it of w.marks.allItems(w.shell, own)) lines.push(['item', name, script, it.id, it.glyph, it.key].join('|'));
      for (const it of w.marks.twinItems(w.shell, own, { keys: own.first })) lines.push(['twin', name, script, it.id, it.glyph, it.key].join('|'));
      for (const n of [1, 2]) {
        for (const row of w.marks.boardRows(w.shell, own, n)) {
          lines.push(['row', name, script, n, row.key, row.marked, row.joined, row.others.map((o) => `${o.id}:${o.glyph}`).join(',')].join('|'));
        }
        lines.push(['sample', name, script, n, w.marks.sampleOf(w.shell, own, n)].join('|'));
      }
    }
  }
  const hash = crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
  check(lines.length === 2160 && hash === '68ab91f52e224ed1f2b168c1323b44a9e7427fe85cf0c44d0116653458665396',
    'every item, twin, board row and sample of lessons 4-14, in both scripts, is exactly what it was before Lesson 15', `${lines.length} ${hash.slice(0, 12)}`);
  const world = boot();
  for (const n of [4, 5, 6, 8, 10, 11, 12, 13, 14]) {
    const mark = Object.values(world.marks.MARKS).find((m) => m.lesson === n);
    for (let k = 0; k < 3; k += 1) world.shell.recordAnswer(n, 'ب' + world.marks.suffixOf(mark), true);
    check(world.shell.masteredCount(n) === 1, `masteredCount(${n}) counts one mastered item of its own`, String(world.shell.masteredCount(n)));
  }
}

// ---- 9f7. The fence for lessons 4-15, written before Lesson 16's rules.js and rule-lesson.js existed -------------------
// docs/lesson-16/06 §2, step 1. The same recipe as 9f6, over `lesson <= 15`, taken with rules.js not yet written. Lesson 16
// is a rule page and adds files; marks.js, mark-lesson.js and practice.js are not edited, so this must not move.

console.log('\nThe fence: lessons 4-15 come out identical after Lesson 16');
{
  const crypto = require('crypto');
  const probe = boot();
  const lines = [];
  for (const [name, mark] of Object.entries(probe.marks.MARKS)) {
    if (mark.lesson > 15) continue;
    for (const script of ['madani', 'indopak']) {
      const w = boot();
      w.shell.state.script = script;
      const own = w.marks.MARKS[name];
      for (const it of w.marks.allItems(w.shell, own)) lines.push(['item', name, script, it.id, it.glyph, it.key].join('|'));
      for (const it of w.marks.twinItems(w.shell, own, { keys: own.first })) lines.push(['twin', name, script, it.id, it.glyph, it.key].join('|'));
      for (const n of [1, 2]) {
        for (const row of w.marks.boardRows(w.shell, own, n)) {
          lines.push(['row', name, script, n, row.key, row.marked, row.joined, row.others.map((o) => `${o.id}:${o.glyph}`).join(',')].join('|'));
        }
        lines.push(['sample', name, script, n, w.marks.sampleOf(w.shell, own, n)].join('|'));
      }
    }
  }
  const hash = crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
  check(lines.length === 2604 && hash === '5496ff23143fa6ff798359d0185ea40383ba38d5b3616ada5e5f6345686eca01',
    'every item, twin, board row and sample of lessons 4-15, in both scripts, is exactly what it was before Lesson 16', `${lines.length} ${hash}`);
  const world = boot();
  for (const n of [4, 5, 6, 8, 10, 11, 12, 13, 14]) {
    const mark = Object.values(world.marks.MARKS).find((m) => m.lesson === n);
    for (let k = 0; k < 3; k += 1) world.shell.recordAnswer(n, 'ب' + world.marks.suffixOf(mark), true);
    check(world.shell.masteredCount(n) === 1, `masteredCount(${n}) counts one mastered item of its own`, String(world.shell.masteredCount(n)));
  }
  const shadda = world.marks.marksOf('shadda')[0];
  for (let k = 0; k < 3; k += 1) world.shell.recordAnswer(15, 'ب' + world.marks.suffixOf(shadda), true);
  check(world.shell.masteredCount(15) === 1, 'masteredCount(15) counts one mastered item of its own', String(world.shell.masteredCount(15)));
}

// ---- 9g. Lesson 9: a mark the two scripts write with different characters -----------------------------------------
// docs/lesson-9/06 §3. The data layer only: marks.js, shell.js's masteredCount and audio.js's groups(), in node. The
// page is tools/qaida-lesson9-check.js.

console.log('\nLesson 9: one mark, two spellings');
{
  const FATHA = String.fromCharCode(0x064E);
  const KASRA = String.fromCharCode(0x0650);
  const DAMMA = String.fromCharCode(0x064F);
  const FATHATAIN = String.fromCharCode(0x064B);
  const KASRATAIN = String.fromCharCode(0x064D);
  const DAMMATAIN = String.fromCharCode(0x064C);
  const ALIF = String.fromCharCode(0x0627);
  const STANDING_FATHA = String.fromCharCode(0x0670);
  const STANDING_KASRA = String.fromCharCode(0x0656);
  const INVERTED_DAMMA = String.fromCharCode(0x0657);
  const SMALL_YEH = String.fromCharCode(0x06E6);
  const SMALL_WAW = String.fromCharCode(0x06E5);
  const looks = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const world = (script) => {
    const w = boot();
    if (script) w.shell.state.script = script;
    w.own = w.marks.marksOf('standing');
    w.items = w.marks.allItems(w.shell, w.own, { looks, distractors: 'which-mark' });
    return w;
  };
  const madani = world();
  const indopak = world('indopak');
  const { shell, marks, own, items } = madani;
  const [standingFatha, standingKasra, invertedDamma] = own;
  const { fatha, kasra, damma } = marks.MARKS;
  const fathaAlif = marks.MARKS['fatha-alif'];

  // The rows.
  check(marks.setOf('standing').marks.join() === 'standing-fatha,standing-kasra,inverted-damma', 'the standing set names its three marks, in lesson order');
  check(standingFatha.cp === 0x0670 && standingKasra.cp === 0x0656 && invertedDamma.cp === 0x0657, 'the three code points are the Indo-Pak ones');
  check(standingFatha.sits === 'above' && invertedDamma.sits === 'above' && standingKasra.sits === 'below', 'khari zabar and ulta paish sit above; khari zair below');
  check([standingFatha, standingKasra, invertedDamma].every((m) => m.lesson === 9), 'all three belong to lesson 9');
  check(standingFatha.against.join() === 'fatha' && standingKasra.against.join() === 'kasra' && invertedDamma.against.join() === 'damma',
    'against is the single short counterpart on all three');
  check(JSON.stringify(standingFatha.skip) === JSON.stringify(['ا', 'ء']) && JSON.stringify(standingKasra.skip) === JSON.stringify(['ا', 'ء'])
    && JSON.stringify(invertedDamma.skip) === JSON.stringify(['ا', 'ء']), 'alif and hamza are skipped on all three, as Lesson 8');
  check(standingFatha.audio === 'fatha-alif' && standingKasra.audio === 'kasra-yaa' && invertedDamma.audio === 'damma-waw',
    'khari zabar plays Lesson 8\'s "baa" sound; the other two are named for the lessons that will share them');
  check(standingFatha.same === 'fatha-alif' && standingKasra.same === undefined && invertedDamma.same === undefined,
    'only khari zabar has a same-sound counterpart: the long aa Lesson 8 already teaches');
  check(standingFatha.first === fathaAlif.first, "khari zabar's part 1 is BORROWED from Lesson 8's own six, not copied");
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'marks.js'), 'utf8')), 'marks.js holds no literal combining mark: none of the three new ones either');
  check(!/[ً-ْ]/.test(fs.readFileSync(path.join(dir, 'lesson-9.html'), 'utf8')), 'and lesson-9.html holds none either: the title glyph is a numeric reference');

  // The ids never change with the script; the drawing does.
  check(marks.suffixOf(standingFatha) === STANDING_FATHA && marks.suffixOf(standingKasra) === STANDING_KASRA && marks.suffixOf(invertedDamma) === INVERTED_DAMMA,
    'suffixOf (the id) is the Indo-Pak code point alone, for all three, in either script');
  check(marks.drawnOf(standingFatha, 'indopak') === STANDING_FATHA, 'drawnOf in Indo-Pak is the bare standing mark');
  check(marks.drawnOf(standingFatha, 'madani') === FATHA + STANDING_FATHA, 'drawnOf in Madani is zabar AND the standing mark');
  check(marks.drawnOf(standingKasra, 'madani') === KASRA + SMALL_YEH, 'khari zair in Madani is kasra and a small yaa');
  check(marks.drawnOf(invertedDamma, 'madani') === DAMMA + SMALL_WAW, 'ulta paish in Madani is damma and a small waw');
  check(marks.glyphOf('ب', standingFatha, 'indopak') === 'ب' + STANDING_FATHA && marks.glyphOf('ب', standingFatha, 'madani') === 'ب' + FATHA + STANDING_FATHA,
    'glyphOf draws the two scripts differently for the same item');

  // Parts: [6, 6, 6, 27]; the last part spreads 8, 10, 9 across the three marks.
  const parts = marks.partsOf(own);
  check(parts.length === 4, 'four parts: one per mark, then all the letters');
  check(JSON.stringify(marks.sizes(items, parts)) === '[6,6,6,27]', 'the four parts hold 6, 6, 6 and 27 (not 29: no alif, no hamza)', JSON.stringify(marks.sizes(items, parts)));
  const lastKeys = items.filter((item) => marks.inPart(item, 4)).map((item) => item.mark);
  const spread = ['standing-fatha', 'standing-kasra', 'inverted-damma'].map((id) => lastKeys.filter((m) => m === id).length);
  check(JSON.stringify(spread) === '[8,10,9]', 'the last part spreads its 27 across the three marks as 8, 10, 9', spread.join(','));

  // Ids: two characters, both scripts, and the same set in both — the thing a script switch must not change.
  check(items.every((item) => item.id.length === 2), 'every id is two characters in both scripts');
  check(JSON.stringify(items.map((item) => item.id).sort()) === JSON.stringify(indopak.items.map((item) => item.id).sort()),
    'Madani and Indo-Pak produce the same id set: the glyphs differ, the ids do not');
  check(!items.some((item) => item.key === 'ا' || item.key === 'ء'), 'neither skipped letter has an item at all');

  // ب has eleven distinct ids across every lesson built so far.
  const ba = ['ب', 'ب' + FATHA, 'ب' + KASRA, 'ب' + DAMMA, 'ب' + FATHATAIN, 'ب' + KASRATAIN, 'ب' + DAMMATAIN,
    'ب' + FATHA + ALIF, 'ب' + STANDING_FATHA, 'ب' + STANDING_KASRA, 'ب' + INVERTED_DAMMA];
  check(new Set(ba).size === 11, 'a letter has eleven distinct ids: bare, and each of the ten marks built so far', String(new Set(ba).size));

  // Mastery survives a script switch — the check that matters most, since the glyph changes and the id must not.
  const switched = boot();
  const ownSw = switched.marks.marksOf('standing');
  const inMadani = switched.marks.allItems(switched.shell, ownSw).find((item) => item.key === 'ك' && item.mark === 'standing-fatha');
  for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(9, inMadani.id, true);
  switched.shell.state.script = 'indopak';
  const inIndoPak = switched.marks.allItems(switched.shell, ownSw).find((item) => item.key === 'ك' && item.mark === 'standing-fatha');
  check(inIndoPak.id === inMadani.id && switched.marks.stats(switched.shell, 9, [inIndoPak], 4, { target: 3 }).known === 1,
    'the Indo-Pak kaaf keeps its credit after a switch, though it is drawn without the zabar Madani shows');

  // masteredCount: Lesson 9 counts its own three rows and nothing shared with lessons 4, 6 or 8.
  const counted = world();
  const twins = counted.own.flatMap((m) => counted.marks.twinItems(counted.shell, m, { keys: ['ب'], marks: [fatha] }));
  for (const item of counted.items.slice(0, 3)) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(9, item.id, true);
  for (const twin of twins) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(9, twin.id, true);
  check(counted.shell.masteredCount(9, 3) === 3, 'masteredCount(9) counts its own three, not the twins riding along in the same record', String(counted.shell.masteredCount(9, 3)));
  const lesson4 = world();
  for (let k = 0; k < 3; k += 1) lesson4.shell.recordAnswer(4, 'ب' + FATHA, true);
  check(lesson4.shell.masteredCount(4, 3) === 1, 'masteredCount(4) is unaffected by any of Lesson 9\'s rows');
  const lesson8 = world();
  for (let k = 0; k < 3; k += 1) lesson8.shell.recordAnswer(8, 'ب' + FATHA + ALIF, true);
  check(lesson8.shell.masteredCount(8, 3) === 1, 'masteredCount(8) is unaffected too: its own suffix is three characters long, Lesson 9\'s are two');

  // No Lesson 9 question ever offers a Lesson 8 item (an id ending zabar-then-alif): the same-sound tile is on the
  // board, never among the answers. A warm-up offers the single short twin; the last part offers another standing mark.
  const w = world();
  const engineForPart = (n) => {
    const ownItems = w.marks.poolFor(w.items, n);
    const twinsHere = ownItems.flatMap((item) => {
      const self = w.marks.markOf(item.mark);
      const wanted = n === 4 ? w.own.filter((m) => m !== self) : w.marks.othersOf(self);
      return w.marks.twinItems(w.shell, self, { keys: [item.key], marks: wanted, looks, distractors: 'which-mark' });
    });
    return [...ownItems, ...twinsHere];
  };
  let checkedQuestions = 0;
  let foundLesson8 = 0;
  let warmupMissingTwin = 0;
  let lastMissingStanding = 0;
  for (const n of [1, 2, 3, 4]) {
    const drill = w.practice.create({ lesson: 9, items: engineForPart(n), formats: FORMATS, random: seeded(21 + n), noRepeatWithin: 4 });
    drill.start();
    for (let i = 0; i < 150; i += 1) {
      const q = drill.question;
      if (!q) break;
      checkedQuestions += 1;
      const otherIds = q.choices.map((c) => c.id).filter((id) => id !== q.item.id);
      if (otherIds.some((id) => id.length === 3 && id.endsWith(FATHA + ALIF))) foundLesson8 += 1;
      // Only a question about one of the PART's OWN items (required: true) is a "one or two?" / "which two?"
      // question at all — a twin coming up (required: false) is asked in its own right, with no such promise.
      if (q.item.required && n < 4) {
        const shortTwin = q.item.key + String.fromCharCode([fatha, kasra, damma][n - 1].cp);
        if (!otherIds.includes(shortTwin)) warmupMissingTwin += 1;
      } else if (q.item.required) {
        const standingIds = own.map((m) => q.item.key + marks.suffixOf(m)).filter((id) => id !== q.item.id);
        if (!otherIds.some((id) => standingIds.includes(id))) lastMissingStanding += 1;
      }
      drill.answer(q.item.id);
      drill.next();
    }
  }
  check(checkedQuestions > 0 && foundLesson8 === 0, 'no Lesson 9 question ever offers a Lesson 8 item among the wrong answers', `${foundLesson8} of ${checkedQuestions}`);
  check(warmupMissingTwin === 0, 'every warm-up question offers its short twin (one or two?)', `${warmupMissingTwin} missing`);
  check(lastMissingStanding === 0, 'every last-part question offers another standing mark (which two?)', `${lastMissingStanding} missing`);

  // audio.js: 'fatha-alif' is listed once (Lesson 8's, shared), and the two new kinds are 27 each. audio.js needs
  // its own vm context with document/fetch stubs; boot() above doesn't load it, so build one directly.
  const audioCtx = vm.createContext({
    document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: async () => ({ ok: false }),
    setTimeout, clearTimeout,
  });
  audioCtx.window = audioCtx;
  for (const file of ['shell.js', 'marks.js', 'audio.js']) {
    vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  }
  const wanted = audioCtx.qaidaAudio.wanted();
  const kindCounts = wanted.reduce((counts, row) => ({ ...counts, [row.kind]: (counts[row.kind] || 0) + 1 }), {});
  // wanted() dedupes across scripts (shell.keyOf folds ک ہ ی onto ك ه ي, and the same recording serves both), so a
  // 27-letter group is 27 rows, not 54: one clip per letter, never per script.
  check((kindCounts['fatha-alif'] || 0) === 27, "'fatha-alif' is listed once, 27 rows, not doubled by khari zabar sharing it", String(kindCounts['fatha-alif']));
  check((kindCounts['kasra-yaa'] || 0) === 27 && (kindCounts['damma-waw'] || 0) === 27, "'kasra-yaa' and 'damma-waw' are new, 27 rows each", `${kindCounts['kasra-yaa']} / ${kindCounts['damma-waw']}`);

  // No literal combining mark anywhere Lesson 9 touches, including the two new spacing-letter tails.
  for (const file of ['mark-lesson.js', 'spell.js', 'exercise.js', 'exercise-9.html', 'audio.js', 'shell.js']) {
    check(!/[ً-ْ٠-٩ۦۥ]/.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')),
      `${file} holds no literal combining mark or small letter`);
  }

  // The home's row.
  const row = shell.LESSONS.find((entry) => entry.n === 9);
  check(row.built === true && row.href === 'lesson-9.html' && row.progress === 'drill' && JSON.stringify(row.cp) === JSON.stringify([0x0670, 0x0656, 0x0657]),
    'the home has Lesson 9 as a real link, its cp the three Indo-Pak code points');
}

// ---- 9h. Lesson 11: paish and wow, and a mark whose two scripts disagree about the wow -------------------------------
// docs/lesson-11/06 §3. The data layer only: marks.js, shell.js's masteredCount and audio.js's groups(), in node. The
// page is tools/qaida-lesson11-check.js.

console.log('\nLesson 11: the long oo');
{
  const FATHA = String.fromCharCode(0x064E);
  const DAMMA = String.fromCharCode(0x064F);
  const INVERTED_DAMMA = String.fromCharCode(0x0657);
  const WAW = String.fromCharCode(0x0648);
  const JAZAM = String.fromCharCode(0x0652);
  const YAA = String.fromCharCode(0x064A);
  const ALIF = String.fromCharCode(0x0627);
  const WOW = WAW + JAZAM;
  const looks = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const world = (script) => {
    const w = boot();
    if (script) w.shell.state.script = script;
    w.mark = w.marks.MARKS['damma-waw'];
    w.items = w.marks.allItems(w.shell, w.mark, { looks, distractors: 'which-mark' });
    return w;
  };
  const madani = world();
  const indopak = world('indopak');
  const { shell, marks, mark, items } = madani;
  const { damma } = marks.MARKS;
  const wowMark = marks.MARKS['fatha-waw'];

  // The row.
  check(mark && mark.cp === 0x064F && mark.tail.length === 2 && mark.tail[0] === 0x0648 && mark.tail[1] === 0x0652, 'the row: damma, then wow and jazam as its tail');
  check(mark.lesson === 11 && mark.sits === 'above' && mark.audio === 'damma-waw', 'lesson 11, above the letter, sharing the "damma-waw" recordings');
  check(mark.against.join() === 'damma,fatha-waw', 'against is damma then fatha-waw, in the order they were taught', mark.against.join());
  check(mark.same === 'inverted-damma' && marks.MARKS['inverted-damma'].lesson === 9, 'same names ulta paish, Lesson 9\'s spelling of the same sound');
  check(mark.first === damma.first, 'part 1 is damma\'s own six, borrowed, not copied');
  check(JSON.stringify(mark.skip) === JSON.stringify(['ا', 'ء']), 'alif and hamza are skipped');

  // 27 items, and ids that never change with the script; the drawing does.
  check(items.length === 27 && !items.some((item) => item.key === 'ا' || item.key === 'ء'), '27 items, none for alif or hamza', String(items.length));
  check(items.every((item) => item.id.length === 4 && item.id.endsWith(DAMMA + WAW + JAZAM)), 'every id is four characters: the letter, damma, wow, jazam');
  check(JSON.stringify(items.map((item) => item.id).sort()) === JSON.stringify(indopak.items.map((item) => item.id).sort()), 'Madani and Indo-Pak produce the same id set');
  check(indopak.items.every((item) => item.id.endsWith(DAMMA + WAW + JAZAM)), 'and the Indo-Pak ids end the same way');
  check(marks.suffixOf(mark) === DAMMA + WOW, 'suffixOf is damma, wow, jazam');
  check(marks.drawnOf(mark, 'madani') === DAMMA + WAW, 'Madani draws it with a bare wow, no jazam');
  check(marks.drawnOf(mark, 'indopak') === marks.suffixOf(mark), 'Indo-Pak draws exactly the id');
  check(JSON.stringify(marks.sizes(items, marks.partsOf([mark]))) === '[6,27]', 'the parts hold 6 and 27', JSON.stringify(marks.sizes(items, marks.partsOf([mark]))));

  // ب has thirteen distinct ids across lessons 4-11.
  const ba = ['ب', 'ب' + FATHA, 'ب' + String.fromCharCode(0x0650), 'ب' + DAMMA, 'ب' + String.fromCharCode(0x064B), 'ب' + String.fromCharCode(0x064D),
    'ب' + String.fromCharCode(0x064C), 'ب' + FATHA + ALIF, 'ب' + String.fromCharCode(0x0670), 'ب' + String.fromCharCode(0x0656), 'ب' + INVERTED_DAMMA,
    'ب' + FATHA + WOW, 'ب' + DAMMA + WOW];
  check(new Set(ba).size === 13, 'a letter has thirteen distinct ids: bare and each of the twelve marks built so far', String(new Set(ba).size));

  // Mastery survives a script switch.
  const switched = boot();
  const inMadani = switched.marks.allItems(switched.shell, switched.marks.MARKS['damma-waw']).find((item) => item.key === 'ك');
  for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(11, inMadani.id, true);
  switched.shell.state.script = 'indopak';
  const inIndoPak = switched.marks.allItems(switched.shell, switched.marks.MARKS['damma-waw']).find((item) => item.key === 'ك');
  check(inIndoPak.id === inMadani.id && switched.marks.stats(switched.shell, 11, [inIndoPak], 2, { target: 3 }).known === 1, 'the Indo-Pak kaaf keeps its credit after a switch');

  // masteredCount: each lesson counts only its own suffix.
  const counted = boot();
  for (const [n, id] of [[6, 'ب' + DAMMA], [10, 'ب' + FATHA + WOW], [11, 'ب' + DAMMA + WOW]]) {
    for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(n, id, true);
  }
  check([6, 10, 11].every((n) => counted.shell.masteredCount(n) === 1), 'masteredCount(6), (10) and (11) each count only their own one item',
    [6, 10, 11].map((n) => counted.shell.masteredCount(n)).join());

  // 300 questions through the real engine: the twin is always offered, and never ulta paish or a later lesson.
  const w = world();
  const engineForPart = (n) => {
    const ownItems = w.marks.poolFor(w.items, n);
    // data-twins="alternate": one twin per letter, damma or fatha-waw by turns, flipping between the parts.
    const wanted = [damma, wowMark];
    const every = w.shell.lettersOf().map(([glyph]) => w.shell.keyOf(glyph));
    const order = [...w.mark.first, ...every.filter((key) => !w.mark.first.includes(key))];
    const twinsHere = wanted.flatMap((m, mi) => {
      const keys = ownItems.map((item) => item.key).filter((key) => (order.indexOf(key) + n) % wanted.length === mi);
      return w.marks.twinItems(w.shell, w.mark, { keys, marks: [m], looks, distractors: 'which-mark' });
    });
    return [...ownItems, ...twinsHere];
  };
  let asked = 0;
  let own = 0;
  let missingTwin = 0;
  let ulta = 0;
  let later = 0;
  for (const n of [1, 2]) {
    const drill = w.practice.create({ lesson: 11, items: engineForPart(n), formats: FORMATS, random: seeded(31 + n), noRepeatWithin: 4 });
    drill.start();
    for (let i = 0; i < 150; i += 1) {
      const q = drill.question;
      if (!q) break;
      asked += 1;
      const otherIds = q.choices.map((c) => c.id).filter((id) => id !== q.item.id);
      if (q.item.mark === 'damma-waw' && q.item.required) {
        own += 1;
        if (!otherIds.includes(q.item.key + DAMMA) && !otherIds.includes(q.item.key + FATHA + WOW)) missingTwin += 1;
      }
      if (otherIds.some((id) => id.endsWith(INVERTED_DAMMA))) ulta += 1;
      if (otherIds.some((id) => id.endsWith(FATHA + YAA + JAZAM) || id.endsWith(String.fromCharCode(0x0650) + YAA + JAZAM))) later += 1;
      drill.answer(q.item.id);
      drill.next();
    }
  }
  check(asked === 300 && own > 0 && missingTwin === 0, 'every "oo" question offers its twin (bu or au), across 300 questions', `${asked} asked, ${own} own, ${missingTwin} missing`);
  check(ulta === 0, 'no question offers ulta paish among the wrong answers: it is the same-sound tile\'s job', String(ulta));
  check(later === 0, 'and none offers a Lesson 12 item', String(later));
  const twinIds = w.marks.twinItems(w.shell, w.mark, { keys: ['ب'], marks: [wowMark] }).map((t) => t.id);
  check(twinIds.length > 0 && twinIds.every((id) => id.length === 4 && id.endsWith(FATHA + WOW)), 'the au twin\'s ids are four characters ending zabar, wow, jazam', twinIds.join());

  // audio.js: 'damma-waw' is listed once, 27 rows, and shown as baa with paish and wow.
  const audioCtx = vm.createContext({
    document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: async () => ({ ok: false }),
    setTimeout, clearTimeout,
  });
  audioCtx.window = audioCtx;
  for (const file of ['shell.js', 'marks.js', 'audio.js']) {
    vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  }
  const rows = audioCtx.qaidaAudio.wanted().filter((row) => row.kind === 'damma-waw');
  check(rows.length === 27, "'damma-waw' is one recording group of 27 rows, though two lessons share it", String(rows.length));
  check(rows.length > 0 && rows[0].display.endsWith(DAMMA + WAW), 'and its rows are shown as the letter with paish and wow, not Lesson 9\'s ulta paish', rows[0] && rows[0].display);
  check(/damma and waw/.test(rows[0].say), 'and the teacher reads "damma and waw" beside them', rows[0].say);

  // No literal combining mark anywhere Lesson 11 touches.
  for (const file of ['marks.js', 'lesson-11.html', 'spell.js', 'exercise.js', 'exercise-11.html']) {
    check(!/[\u064B-\u0652\u0657\u0660-\u0669\u06E5\u06E6]/.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')),
      `${file} holds no literal combining mark or small letter`);
  }

  // The home's row.
  const row = shell.LESSONS.find((entry) => entry.n === 11);
  check(row.built === true && row.href === 'lesson-11.html' && row.progress === 'drill' && row.cp === 0x064F && row.tail.length === 2,
    'the home has Lesson 11 as a real link, with its two-character tail');
}

// ---- 9i. Lesson 12: zabar and yaa, and an id that is neither script's drawing --------------------------------------------
// docs/lesson-12/06 §3. The data layer only: marks.js, shell.js's masteredCount and audio.js's groups(), in node. The
// page is tools/qaida-lesson12-check.js.

console.log('\nLesson 12: ai');
{
  const FATHA = String.fromCharCode(0x064E);
  const KASRA = String.fromCharCode(0x0650);
  const DAMMA = String.fromCharCode(0x064F);
  const INVERTED_DAMMA = String.fromCharCode(0x0657);
  const WAW = String.fromCharCode(0x0648);
  const YAA = String.fromCharCode(0x064A); // the letter as the id spells it
  const YAA_IP = String.fromCharCode(0x06CC); // the Indo-Pak yaa: a drawing only
  const JAZAM = String.fromCharCode(0x0652); // the mark as the id spells it
  const JAZAM_M = String.fromCharCode(0x06E1); // the mark as Madani draws it: a drawing only
  const ALIF = String.fromCharCode(0x0627);
  const WOW = WAW + JAZAM;
  const TAIL = YAA + JAZAM;
  const looks = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const world = (script) => {
    const w = boot();
    if (script) w.shell.state.script = script;
    w.mark = w.marks.MARKS['fatha-yaa'];
    w.items = w.marks.allItems(w.shell, w.mark, { looks, distractors: 'which-mark' });
    return w;
  };
  const madani = world();
  const indopak = world('indopak');
  const { shell, marks, mark, items } = madani;
  const { fatha } = marks.MARKS;
  const wowMark = marks.MARKS['fatha-waw'];

  // The row.
  check(mark && mark.cp === 0x064E && mark.tail.length === 2 && mark.tail[0] === 0x064A && mark.tail[1] === 0x0652, 'the row: fatha, then yaa and jazam as its tail, spelt as an id spells them');
  check(mark.lesson === 12 && mark.sits === 'above' && mark.audio === 'fatha-yaa', 'lesson 12, above the letter, with its own "fatha-yaa" recordings');
  check(mark.against.join() === 'fatha,fatha-waw', 'against is fatha then fatha-waw, in the order they were taught', mark.against.join());
  check(mark.same === undefined, 'no same-sound mark: "ai" has no standing spelling');
  check(mark.first === fatha.first, 'part 1 is fatha\'s own six, borrowed, not copied');
  check(JSON.stringify(mark.skip) === JSON.stringify(['ا', 'ء']), 'alif and hamza are skipped');
  check(Object.keys(mark.forms).sort().join() === 'indopak,madani', 'TWO forms: the first row where both scripts draw from `forms`');

  // formOf never hands back a form without a `cp`, for any row, in either script; and a form that omits it borrows the row's.
  const cpless = Object.values(marks.MARKS).flatMap((m) => ['madani', 'indopak'].map((script) => [m, script])).filter(([m, script]) => {
    const f = marks.formOf(m, script);
    return !Array.isArray(f.cp) || f.cp.length === 0 || f.cp.some((c) => !Number.isInteger(c));
  });
  check(cpless.length === 0, 'formOf returns a cp for every row in both scripts', cpless.map(([m, s]) => `${m.id}/${s}`).join());
  check(JSON.stringify(marks.formOf({ cp: 0x064E, tail: [1], forms: { madani: { tail: [2] } } }, 'madani')) === JSON.stringify({ cp: [0x064E], tail: [2] }),
    'and a form that leaves `cp` out draws the row\'s, instead of throwing');

  // 27 items, and ids that never change with the script; the drawing does.
  check(items.length === 27 && !items.some((item) => item.key === 'ا' || item.key === 'ء'), '27 items, none for alif or hamza', String(items.length));
  check(items.every((item) => item.id.length === 4 && item.id.endsWith(FATHA + TAIL)), 'every id is four characters: the letter, fatha, yaa, jazam');
  check(JSON.stringify(items.map((item) => item.id).sort()) === JSON.stringify(indopak.items.map((item) => item.id).sort()), 'Madani and Indo-Pak produce the same id set');
  check(indopak.items.every((item) => item.id.endsWith(FATHA + TAIL)), 'and the Indo-Pak ids end the same way');
  check(![...items, ...indopak.items].some((item) => item.id.includes(YAA_IP) || item.id.includes(JAZAM_M)),
    'no id holds U+06CC or U+06E1: neither script\'s drawing is the id');
  check(marks.suffixOf(mark) === FATHA + TAIL, 'suffixOf is fatha, yaa, jazam');
  check(marks.drawnOf(mark, 'madani') === FATHA + YAA + JAZAM_M, 'Madani draws U+064A and U+06E1');
  check(marks.drawnOf(mark, 'indopak') === FATHA + YAA_IP + JAZAM, 'Indo-Pak draws U+06CC and U+0652');
  check(marks.drawnOf(mark, 'madani') !== marks.drawnOf(mark, 'indopak') && marks.drawnOf(mark, 'madani') !== marks.suffixOf(mark) && marks.drawnOf(mark, 'indopak') !== marks.suffixOf(mark),
    'the two drawings differ from each other and from the id: neither is the id');
  check(items.every((item) => item.glyph === item.base + marks.drawnOf(mark, 'madani')) && indopak.items.every((item) => item.glyph === item.base + marks.drawnOf(mark, 'indopak')),
    'every item is drawn from `forms` in its own script');
  check(JSON.stringify(marks.sizes(items, marks.partsOf([mark]))) === '[6,27]', 'the parts hold 6 and 27', JSON.stringify(marks.sizes(items, marks.partsOf([mark]))));

  // ب has fourteen distinct ids across lessons 4-12.
  const ba = ['ب', 'ب' + FATHA, 'ب' + KASRA, 'ب' + DAMMA, 'ب' + String.fromCharCode(0x064B), 'ب' + String.fromCharCode(0x064D),
    'ب' + String.fromCharCode(0x064C), 'ب' + FATHA + ALIF, 'ب' + String.fromCharCode(0x0670), 'ب' + String.fromCharCode(0x0656), 'ب' + INVERTED_DAMMA,
    'ب' + FATHA + WOW, 'ب' + DAMMA + WOW, 'ب' + FATHA + TAIL];
  check(new Set(ba).size === 14, 'a letter has fourteen distinct ids: bare and each of the thirteen marks built so far', String(new Set(ba).size));

  // Mastery survives a script switch, in BOTH directions.
  for (const [from, to] of [['madani', 'indopak'], ['indopak', 'madani']]) {
    const switched = boot();
    switched.shell.state.script = from;
    const before = switched.marks.allItems(switched.shell, switched.marks.MARKS['fatha-yaa']).find((item) => item.key === 'ك');
    for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(12, before.id, true);
    switched.shell.state.script = to;
    const after = switched.marks.allItems(switched.shell, switched.marks.MARKS['fatha-yaa']).find((item) => item.key === 'ك');
    check(after.id === before.id && after.glyph !== before.glyph && switched.marks.stats(switched.shell, 12, [after], 2, { target: 3 }).known === 1,
      `the kaaf keeps its credit going ${from} to ${to}, though it is drawn differently`);
  }

  // masteredCount: each lesson counts only its own suffix.
  const counted = boot();
  for (const [n, id] of [[4, 'ب' + FATHA], [8, 'ب' + FATHA + ALIF], [10, 'ب' + FATHA + WOW], [12, 'ب' + FATHA + TAIL]]) {
    for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(n, id, true);
  }
  check([4, 8, 10, 12].every((n) => counted.shell.masteredCount(n) === 1), 'masteredCount(4), (8), (10) and (12) each count only their own one item',
    [4, 8, 10, 12].map((n) => counted.shell.masteredCount(n)).join());

  // 300 questions through the real engine: the twin is always offered, and never a Lesson 13 item or a standing "baa".
  const w = world();
  const engineForPart = (n) => {
    const ownItems = w.marks.poolFor(w.items, n);
    // data-twins="alternate": one twin per letter, fatha or fatha-waw by turns, flipping between the parts.
    const wanted = [fatha, wowMark];
    const every = w.shell.lettersOf().map(([glyph]) => w.shell.keyOf(glyph));
    const order = [...w.mark.first, ...every.filter((key) => !w.mark.first.includes(key))];
    const twinsHere = wanted.flatMap((m, mi) => {
      const keys = ownItems.map((item) => item.key).filter((key) => (order.indexOf(key) + n) % wanted.length === mi);
      return w.marks.twinItems(w.shell, w.mark, { keys, marks: [m], looks, distractors: 'which-mark' });
    });
    return [...ownItems, ...twinsHere];
  };
  let asked = 0;
  let own = 0;
  let missingTwin = 0;
  let longAlif = 0;
  let later = 0;
  for (const n of [1, 2]) {
    const drill = w.practice.create({ lesson: 12, items: engineForPart(n), formats: FORMATS, random: seeded(41 + n), noRepeatWithin: 4 });
    drill.start();
    for (let i = 0; i < 150; i += 1) {
      const q = drill.question;
      if (!q) break;
      asked += 1;
      const otherIds = q.choices.map((c) => c.id).filter((id) => id !== q.item.id);
      if (q.item.mark === 'fatha-yaa' && q.item.required) {
        own += 1;
        if (!otherIds.includes(q.item.key + FATHA) && !otherIds.includes(q.item.key + FATHA + WOW)) missingTwin += 1;
      }
      if (otherIds.some((id) => id.endsWith(FATHA + ALIF))) longAlif += 1;
      if (otherIds.some((id) => id.endsWith(KASRA + TAIL))) later += 1;
      drill.answer(q.item.id);
      drill.next();
    }
  }
  check(asked === 300 && own > 0 && missingTwin === 0, 'every "ai" question offers its twin (ba or au), across 300 questions', `${asked} asked, ${own} own, ${missingTwin} missing`);
  check(longAlif === 0, 'no question offers a zabar-and-alif item: "baa" is not a twin', String(longAlif));
  check(later === 0, 'and none offers a Lesson 13 item', String(later));
  const twinIds = w.marks.twinItems(w.shell, w.mark, { keys: ['ب'], marks: [wowMark] }).map((t) => t.id);
  check(twinIds.length > 0 && twinIds.every((id) => id.length === 4 && id.endsWith(FATHA + WOW)), 'the au twin\'s ids are four characters ending zabar, wow, jazam', twinIds.join());

  // audio.js: 'fatha-yaa' is a new group of 27 rows, shown as baa with zabar and yaa in the script in use.
  const audioCtx = vm.createContext({
    document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: async () => ({ ok: false }),
    setTimeout, clearTimeout,
  });
  audioCtx.window = audioCtx;
  for (const file of ['shell.js', 'marks.js', 'audio.js']) {
    vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  }
  const rows = audioCtx.qaidaAudio.wanted().filter((row) => row.kind === 'fatha-yaa');
  check(rows.length === 27, "'fatha-yaa' is one recording group of 27 rows", String(rows.length));
  check(rows.length > 0 && rows.every((row) => row.key === row.glyph) && rows[0].display.endsWith(FATHA + YAA + JAZAM_M),
    'keyed by the bare letter, and shown to the teacher as the letter with zabar and yaa', rows[0] && rows[0].display);
  check(/fatha and yaa/.test(rows[0].say), 'and the teacher reads "fatha and yaa" beside them', rows[0].say);
  check(JSON.parse(fs.readFileSync(path.join(dir, 'audio', 'manifest.json'), 'utf8'))['fatha-yaa'] !== undefined, 'manifest.json has an empty "fatha-yaa" group, ready for the recordings');

  // No literal combining mark anywhere Lesson 12 touches. (The yaa is a letter, not a mark, and may be typed.)
  for (const file of ['marks.js', 'lesson-12.html', 'spell.js', 'exercise.js', 'exercise-12.html']) {
    check(!/[ً-ْٗ٠-٩ۡۥۦ]/.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')),
      `${file} holds no literal combining mark or small letter`);
  }

  // The home's row.
  const row = shell.LESSONS.find((entry) => entry.n === 12);
  check(row.built === true && row.href === 'lesson-12.html' && row.progress === 'drill' && row.cp === 0x064E && row.tail.length === 2 && row.tail[0] === 0x064A && row.tail[1] === 0x0652,
    'the home has Lesson 12 as a real link, its tail spelt as the id spells it');
}

// ---- 9j. Lesson 13: zair and yaa, the long ee, with two marks below the line ---------------------------------------------
// docs/lesson-13/03 §5. The data layer only: marks.js, shell.js's masteredCount and audio.js's groups(), in node. The
// page is tools/qaida-lesson13-check.js. Lesson 11's block with Lesson 12's letter.

console.log('\nLesson 13: the long ee');
{
  const FATHA = String.fromCharCode(0x064E);
  const KASRA = String.fromCharCode(0x0650);
  const DAMMA = String.fromCharCode(0x064F);
  const STANDING_KASRA = String.fromCharCode(0x0656);
  const INVERTED_DAMMA = String.fromCharCode(0x0657);
  const WAW = String.fromCharCode(0x0648);
  const YAA = String.fromCharCode(0x064A); // the letter as the id spells it
  const YAA_IP = String.fromCharCode(0x06CC); // the Indo-Pak yaa: a drawing only
  const JAZAM = String.fromCharCode(0x0652); // the mark as the id spells it
  const JAZAM_M = String.fromCharCode(0x06E1); // the mark as Madani draws it: a drawing only
  const ALIF = String.fromCharCode(0x0627);
  const WOW = WAW + JAZAM;
  const TAIL = YAA + JAZAM;
  const looks = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const world = (script) => {
    const w = boot();
    if (script) w.shell.state.script = script;
    w.mark = w.marks.MARKS['kasra-yaa'];
    w.items = w.marks.allItems(w.shell, w.mark, { looks, distractors: 'which-mark' });
    return w;
  };
  const madani = world();
  const indopak = world('indopak');
  const { shell, marks, mark, items } = madani;
  const { kasra } = marks.MARKS;
  const yaaMark = marks.MARKS['fatha-yaa'];

  // The row.
  check(mark && mark.cp === 0x0650 && mark.tail.length === 2 && mark.tail[0] === 0x064A && mark.tail[1] === 0x0652, 'the row: kasra, then yaa and jazam as its tail, spelt as an id spells them');
  check(mark.lesson === 13 && mark.sits === 'below' && mark.audio === 'kasra-yaa', 'lesson 13, below the letter, sharing the "kasra-yaa" recordings');
  check(mark.against.join() === 'kasra,fatha-yaa', 'against is kasra then fatha-yaa, in the order they were taught', mark.against.join());
  check(mark.same === 'standing-kasra' && marks.MARKS['standing-kasra'].lesson === 9 && marks.MARKS['standing-kasra'].sits === 'below',
    'same names khari zair, Lesson 9\'s spelling of the same sound, which also sits below');
  check(mark.first === marks.MARKS['standing-kasra'].first && mark.first.length === 6 && !mark.first.includes('ا'), 'part 1 is khari zair\'s six, borrowed, not copied, and has no alif');
  check(mark.sample === 'ف', 'the sample is faa: the title shows the word "in"');
  check(JSON.stringify(mark.skip) === JSON.stringify(['ا', 'ء']), 'alif and hamza are skipped');
  check(Object.keys(mark.forms).sort().join() === 'indopak,madani', 'TWO forms, as in Lesson 12: both scripts draw from `forms`');

  // 27 items, and ids that never change with the script; the drawing does.
  check(items.length === 27 && !items.some((item) => item.key === 'ا' || item.key === 'ء'), '27 items, none for alif or hamza', String(items.length));
  check(items.every((item) => item.id.length === 4 && item.id.endsWith(KASRA + TAIL)), 'every id is four characters: the letter, kasra, yaa, jazam');
  check(JSON.stringify(items.map((item) => item.id).sort()) === JSON.stringify(indopak.items.map((item) => item.id).sort()), 'Madani and Indo-Pak produce the same id set');
  check(indopak.items.every((item) => item.id.endsWith(KASRA + TAIL)), 'and the Indo-Pak ids end the same way');
  check(![...items, ...indopak.items].some((item) => item.id.includes(YAA_IP) || item.id.includes(JAZAM_M)),
    'no id holds U+06CC or U+06E1: neither script\'s drawing is the id');
  check(marks.suffixOf(mark) === KASRA + TAIL, 'suffixOf is kasra, yaa, jazam');
  check(marks.drawnOf(mark, 'madani') === KASRA + YAA, 'Madani draws U+0650 U+064A, no jazam');
  check(marks.drawnOf(mark, 'indopak') === KASRA + YAA_IP + JAZAM, 'Indo-Pak draws U+0650 U+06CC U+0652');
  check(marks.drawnOf(mark, 'madani') !== marks.suffixOf(mark) && marks.drawnOf(mark, 'indopak') !== marks.suffixOf(mark),
    'neither drawing is the id');
  check(items.every((item) => item.glyph === item.base + marks.drawnOf(mark, 'madani')) && indopak.items.every((item) => item.glyph === item.base + marks.drawnOf(mark, 'indopak')),
    'every item is drawn from `forms` in its own script');
  check(JSON.stringify(marks.sizes(items, marks.partsOf([mark]))) === '[6,27]', 'the parts hold 6 and 27', JSON.stringify(marks.sizes(items, marks.partsOf([mark]))));

  // ب has fifteen distinct ids across lessons 4-13.
  const ba = ['ب', 'ب' + FATHA, 'ب' + KASRA, 'ب' + DAMMA, 'ب' + String.fromCharCode(0x064B), 'ب' + String.fromCharCode(0x064D),
    'ب' + String.fromCharCode(0x064C), 'ب' + FATHA + ALIF, 'ب' + String.fromCharCode(0x0670), 'ب' + STANDING_KASRA, 'ب' + INVERTED_DAMMA,
    'ب' + FATHA + WOW, 'ب' + DAMMA + WOW, 'ب' + FATHA + TAIL, 'ب' + KASRA + TAIL];
  check(new Set(ba).size === 15, 'a letter has fifteen distinct ids: bare and each of the fourteen marks built so far', String(new Set(ba).size));

  // Mastery survives a script switch, in BOTH directions.
  for (const [from, to] of [['madani', 'indopak'], ['indopak', 'madani']]) {
    const switched = boot();
    switched.shell.state.script = from;
    const before = switched.marks.allItems(switched.shell, switched.marks.MARKS['kasra-yaa']).find((item) => item.key === 'ك');
    for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(13, before.id, true);
    switched.shell.state.script = to;
    const after = switched.marks.allItems(switched.shell, switched.marks.MARKS['kasra-yaa']).find((item) => item.key === 'ك');
    check(after.id === before.id && after.glyph !== before.glyph && switched.marks.stats(switched.shell, 13, [after], 2, { target: 3 }).known === 1,
      `the kaaf keeps its credit going ${from} to ${to}, though it is drawn differently`);
  }

  // masteredCount: each lesson counts only its own suffix. Lessons 5, 12 and 13 share a code point or a tail.
  const counted = boot();
  for (const [n, id] of [[5, 'ب' + KASRA], [12, 'ب' + FATHA + TAIL], [13, 'ب' + KASRA + TAIL]]) {
    for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(n, id, true);
  }
  check([5, 12, 13].every((n) => counted.shell.masteredCount(n) === 1), 'masteredCount(5), (12) and (13) each count only their own one item',
    [5, 12, 13].map((n) => counted.shell.masteredCount(n)).join());

  // 300 questions through the real engine: the twin is always offered, and never a khari zair item.
  const w = world();
  const engineForPart = (n) => {
    const ownItems = w.marks.poolFor(w.items, n);
    // data-twins="alternate": one twin per letter, kasra or fatha-yaa by turns, flipping between the parts.
    const wanted = [kasra, yaaMark];
    const every = w.shell.lettersOf().map(([glyph]) => w.shell.keyOf(glyph));
    const order = [...w.mark.first, ...every.filter((key) => !w.mark.first.includes(key))];
    const twinsHere = wanted.flatMap((m, mi) => {
      const keys = ownItems.map((item) => item.key).filter((key) => (order.indexOf(key) + n) % wanted.length === mi);
      return w.marks.twinItems(w.shell, w.mark, { keys, marks: [m], looks, distractors: 'which-mark' });
    });
    return [...ownItems, ...twinsHere];
  };
  let asked = 0;
  let own = 0;
  let missingTwin = 0;
  let khari = 0;
  for (const n of [1, 2]) {
    const drill = w.practice.create({ lesson: 13, items: engineForPart(n), formats: FORMATS, random: seeded(51 + n), noRepeatWithin: 4 });
    drill.start();
    for (let i = 0; i < 150; i += 1) {
      const q = drill.question;
      if (!q) break;
      asked += 1;
      const otherIds = q.choices.map((c) => c.id).filter((id) => id !== q.item.id);
      if (q.item.mark === 'kasra-yaa' && q.item.required) {
        own += 1;
        if (!otherIds.includes(q.item.key + KASRA) && !otherIds.includes(q.item.key + FATHA + TAIL)) missingTwin += 1;
      }
      if (otherIds.some((id) => id.endsWith(STANDING_KASRA))) khari += 1;
      drill.answer(q.item.id);
      drill.next();
    }
  }
  check(asked === 300 && own > 0 && missingTwin === 0, 'every "ee" question offers its twin (bi or ai), across 300 questions', `${asked} asked, ${own} own, ${missingTwin} missing`);
  check(khari === 0, 'no question offers khari zair among the wrong answers: it is the same-sound tile\'s job', String(khari));
  const twinIds = w.marks.twinItems(w.shell, w.mark, { keys: ['ب'], marks: [yaaMark] }).map((t) => t.id);
  check(twinIds.length > 0 && twinIds.every((id) => id.length === 4 && id.endsWith(FATHA + TAIL)), 'the ai twin\'s ids are four characters ending zabar, yaa, jazam', twinIds.join());

  // audio.js: 'kasra-yaa' is listed once, 27 rows, though Lesson 9's khari zair shares it; shown as the letter with zair and yaa.
  const audioCtx = vm.createContext({
    document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: async () => ({ ok: false }),
    setTimeout, clearTimeout,
  });
  audioCtx.window = audioCtx;
  for (const file of ['shell.js', 'marks.js', 'audio.js']) {
    vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  }
  const rows = audioCtx.qaidaAudio.wanted().filter((row) => row.kind === 'kasra-yaa');
  check(rows.length === 27, "'kasra-yaa' is one recording group of 27 rows, though two lessons share it", String(rows.length));
  check(rows.length > 0 && rows[0].display.endsWith(KASRA + YAA), 'and its rows are shown as the letter with zair and yaa, not Lesson 9\'s khari zair', rows[0] && rows[0].display);
  check(/kasra and yaa/.test(rows[0].say), 'and the teacher reads "kasra and yaa" beside them', rows[0].say);
  check(JSON.parse(fs.readFileSync(path.join(dir, 'audio', 'manifest.json'), 'utf8'))['kasra-yaa'] !== undefined, 'manifest.json has the "kasra-yaa" group, since Lesson 9');

  // No literal combining mark anywhere Lesson 13 touches. (The yaa is a letter, not a mark, and may be typed.)
  for (const file of ['marks.js', 'lesson-13.html', 'spell.js', 'exercise.js', 'exercise-13.html']) {
    check(!/[ً-ْٗ٠-٩ۡۥۦ]/.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')),
      `${file} holds no literal combining mark or small letter`);
  }

  // The home's row.
  const row = shell.LESSONS.find((entry) => entry.n === 13);
  check(row.built === true && row.href === 'lesson-13.html' && row.progress === 'drill' && row.cp === 0x0650 && row.tail.length === 2 && row.tail[0] === 0x064A && row.tail[1] === 0x0652,
    'the home has Lesson 13 as a real link, its tail spelt as the id spells it');
}

// ---- 9k. Lesson 14: the jazam on any letter, drawn after a lead --------------------------------------------------------
// docs/lesson-14/06 §3. The data layer only: marks.js, shell.js's masteredCount and audio.js's groups(), in node. The
// page is tools/qaida-lesson14-check.js. The new thing is the LEAD: a vowelled alif drawn in front of every item and
// never part of an id, so every check here is one of "the lead is in every glyph" or "the lead is in no id".

console.log('\nLesson 14: the jazam, after a lead');
{
  const FATHA = String.fromCharCode(0x064E);
  const KASRA = String.fromCharCode(0x0650);
  const DAMMA = String.fromCharCode(0x064F);
  const ALIF = String.fromCharCode(0x0627);
  const JAZAM = String.fromCharCode(0x0652); // the mark as the id spells it
  const JAZAM_M = String.fromCharCode(0x06E1); // the mark as Madani draws it: a drawing only
  const LEAD = ALIF + FATHA;
  const looks = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const world = (script) => {
    const w = boot();
    if (script) w.shell.state.script = script;
    w.mark = w.marks.MARKS.sukun;
    w.items = w.marks.allItems(w.shell, w.mark, { looks, distractors: 'which-mark' });
    return w;
  };
  const madani = world();
  const indopak = world('indopak');
  const { shell, marks, mark, items } = madani;
  const { fatha, kasra, damma } = marks.MARKS;

  // The row.
  check(mark && mark.cp === 0x0652 && !mark.tail && mark.lesson === 14 && mark.sits === 'above' && mark.audio === 'sukun',
    'the row: the jazam, U+0652, no tail, lesson 14, above the letter, its own "sukun" recordings');
  check(mark.against.join() === 'fatha,kasra,damma', 'against is the three vowels, in the order they were taught', mark.against.join());
  check(JSON.stringify(mark.lead) === JSON.stringify([0x0627, 0x064E]), 'the lead is alif and fatha, as code points');
  check(mark.first === marks.MARKS.fatha.first && mark.first.length === 6, 'part 1 is zabar\'s own six, borrowed, not copied');
  check(JSON.stringify(mark.skip) === JSON.stringify(['ا', 'ء']), 'alif and hamza are skipped');
  check(Object.keys(mark.forms).join() === 'madani' && JSON.stringify(mark.forms.madani.cp) === JSON.stringify([0x06E1]),
    'only Madani has a form, and it draws U+06E1');

  // The lead: '' everywhere but here.
  const others = Object.values(marks.MARKS).filter((m) => m.lesson <= 13);
  check(others.length > 0 && others.every((m) => marks.leadOf(m, 'madani') === '' && marks.leadOf(m, 'indopak') === ''),
    'leadOf is empty for every mark of lessons 4-13, in both scripts', String(others.length));
  check(marks.leadOf(mark, 'madani') === LEAD && marks.leadOf(mark, 'indopak') === LEAD, 'and it is alif with fatha for the jazam, in both');
  check(marks.leadOf({ lead: [0x0627], forms: { madani: { lead: [0x0623] } } }, 'madani') === String.fromCharCode(0x0623)
    && marks.leadOf({ lead: [0x0627], forms: { madani: { lead: [0x0623] } } }, 'indopak') === ALIF,
    'a form\'s own lead is read before the row\'s (the Madani hamza alternative)');
  check(marks.leadOf(null) === '' && marks.leadOf({}) === '', 'and leadOf never throws on nothing');

  // 27 items, ids that never hold the lead, glyphs that always do.
  check(items.length === 27 && !items.some((item) => item.key === 'ا' || item.key === 'ء'), '27 items, none for alif or hamza', String(items.length));
  check(items.some((item) => item.key === 'و') && items.some((item) => item.key === 'ي'), 'and wow and yaa are in: they are Lesson 10\'s au and Lesson 12\'s ai');
  check([...items, ...indopak.items].every((item) => item.id.length === 2 && item.id.endsWith(JAZAM) && item.id === item.key + JAZAM),
    'every id is two characters, the letter\'s key then U+0652, in both scripts');
  check(![...items, ...indopak.items].some((item) => item.id.includes(ALIF) || item.id.includes(JAZAM_M)),
    'no id holds the lead\'s alif or the Madani jazam: neither the lead nor a drawing is the id');
  check(JSON.stringify(items.map((item) => item.id).sort()) === JSON.stringify(indopak.items.map((item) => item.id).sort()), 'Madani and Indo-Pak produce the same id set');
  check(items.every((item) => item.glyph.startsWith(LEAD + item.base) && item.glyph.endsWith(JAZAM_M) && item.glyph === LEAD + item.base + JAZAM_M),
    'every Madani glyph is the lead, the letter, then U+06E1');
  check(indopak.items.every((item) => item.glyph === LEAD + item.base + JAZAM), 'every Indo-Pak glyph is the lead, the letter, then U+0652');
  check(items.every((item) => item.base.length === 1 && item.audio.glyph === item.base), 'the item\'s own base and audio glyph are the bare letter: the lead is not asked');
  check(marks.drawnOf(mark, 'madani') === JAZAM_M && marks.drawnOf(mark, 'indopak') === JAZAM && marks.suffixOf(mark) === JAZAM,
    'Madani draws U+06E1, Indo-Pak U+0652, and the id spells U+0652');
  check(JSON.stringify(marks.sizes(items, marks.partsOf([mark]))) === '[6,27]', 'the parts hold 6 and 27', JSON.stringify(marks.sizes(items, marks.partsOf([mark]))));

  // The other three drawing sites in marks.js: twins, the board, the rail.
  const twins = marks.twinItems(shell, mark, { keys: ['ب', 'ت'] });
  check(twins.length === 6 && twins.every((t) => t.glyph.startsWith(LEAD + t.base) && t.id.length === 2 && !t.id.endsWith(JAZAM)),
    'the twins (baa and taa, against all three vowels) are drawn after the lead, with a vowel and no jazam in the id', String(twins.length));
  check(new Set(twins.map((t) => t.glyph)).size === twins.length, 'and no two twins are the same drawing');
  const rows1 = marks.boardRows(shell, mark, 1);
  check(rows1.length === 6 && rows1.every((r) => r.marked.startsWith(LEAD) && r.others.every((o) => o.glyph.startsWith(LEAD)) && r.glyph === r.key),
    'part 1\'s board rows: the marked tile and every other tile after the lead, the bare letter without it');
  check(marks.boardRows(shell, mark, 2).length === 27, 'part 2\'s board has 27 rows');
  check(marks.sampleOf(shell, mark, 1).startsWith(LEAD + 'ب') && marks.sampleOf(shell, mark, 2).startsWith(LEAD + 'ع'), 'the rail\'s samples are baa and ain, after the lead');

  // Mastery survives a script switch, in BOTH directions.
  for (const [from, to] of [['madani', 'indopak'], ['indopak', 'madani']]) {
    const switched = boot();
    switched.shell.state.script = from;
    const before = switched.marks.allItems(switched.shell, switched.marks.MARKS.sukun).find((item) => item.key === 'ك');
    for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(14, before.id, true);
    switched.shell.state.script = to;
    const after = switched.marks.allItems(switched.shell, switched.marks.MARKS.sukun).find((item) => item.key === 'ك');
    check(after.id === before.id && after.glyph !== before.glyph && switched.marks.stats(switched.shell, 14, [after], 2, { target: 3 }).known === 1,
      `the kaaf keeps its credit going ${from} to ${to}, though it is drawn differently`);
  }

  // masteredCount: one own item counts, mastered twins do not.
  const counted = boot();
  for (const id of ['ب' + JAZAM]) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(14, id, true);
  check(counted.shell.masteredCount(14) === 1, 'masteredCount(14) counts one mastered own item', String(counted.shell.masteredCount(14)));
  for (const vowel of [FATHA, KASRA, DAMMA]) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(14, 'ب' + vowel, true);
  check(counted.shell.masteredCount(14) === 1, 'and not the three mastered twins (baa with each vowel, recorded in Lesson 14)', String(counted.shell.masteredCount(14)));
  check([4, 5, 6, 7, 8, 9, 10, 11, 12, 13].every((n) => counted.shell.masteredCount(n) === 0), 'and none of it counts toward another lesson');

  // 300 questions through the real engine: every question offers a same-letter twin with a vowel, all three vowels come
  // up as twins, every choice starts with the lead, and no two choices differ only in the lead.
  const w = world();
  const engineForPart = (n) => {
    const ownItems = w.marks.poolFor(w.items, n);
    // data-twins="alternate": one twin per letter, one of the three vowels by turns, flipping between the parts.
    const wanted = [fatha, kasra, damma];
    const every = w.shell.lettersOf().map(([glyph]) => w.shell.keyOf(glyph));
    const order = [...w.mark.first, ...every.filter((key) => !w.mark.first.includes(key))];
    const twinsHere = wanted.flatMap((m, mi) => {
      const keys = ownItems.map((item) => item.key).filter((key) => (order.indexOf(key) + n) % wanted.length === mi);
      return w.marks.twinItems(w.shell, w.mark, { keys, marks: [m], looks, distractors: 'which-mark' });
    });
    return [...ownItems, ...twinsHere];
  };
  let asked = 0;
  let own = 0;
  let missingTwin = 0;
  let noLead = 0;
  let leadOnly = 0;
  const vowels = new Set();
  for (const n of [1, 2]) {
    const drill = w.practice.create({ lesson: 14, items: engineForPart(n), formats: FORMATS, random: seeded(61 + n), noRepeatWithin: 4 });
    drill.start();
    for (let i = 0; i < 150; i += 1) {
      const q = drill.question;
      if (!q) break;
      asked += 1;
      const otherIds = q.choices.map((c) => c.id).filter((id) => id !== q.item.id);
      if (q.item.mark === 'sukun' && q.item.required) {
        own += 1;
        const twin = [FATHA, KASRA, DAMMA].find((v) => otherIds.includes(q.item.key + v));
        if (!twin) missingTwin += 1;
        else vowels.add(twin);
      }
      if (q.format.answerWith === 'glyph' && q.choices.some((c) => !c.glyph.startsWith(LEAD))) noLead += 1;
      if (new Set(q.choices.map((c) => c.glyph.slice(LEAD.length))).size !== q.choices.length) leadOnly += 1;
      drill.answer(q.item.id);
      drill.next();
    }
  }
  check(asked === 300 && own > 0 && missingTwin === 0, 'every jazam question offers its twin (a vowel on the same letter), across 300 questions', `${asked} asked, ${own} own, ${missingTwin} missing`);
  check(vowels.size === 3, 'and all three vowels come up as twins', [...vowels].length + ' of 3');
  check(noLead === 0, 'every choice on a glyph question starts with the lead', String(noLead));
  check(leadOnly === 0, 'and no two choices differ only in the lead', String(leadOnly));

  // audio.js: a 'sukun' group of 27 rows, each shown with the lead, and the teacher told to say the alif.
  const audioCtx = vm.createContext({
    document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: async () => ({ ok: false }),
    setTimeout, clearTimeout,
  });
  audioCtx.window = audioCtx;
  for (const file of ['shell.js', 'marks.js', 'audio.js']) {
    vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  }
  const rows = audioCtx.qaidaAudio.wanted().filter((row) => row.kind === 'sukun');
  check(rows.length === 27, "'sukun' is one recording group of 27 rows", String(rows.length));
  check(rows.length > 0 && rows.every((row) => row.display.startsWith(LEAD + row.key) && row.glyph === row.key), 'each is shown with the lead, and keyed by the bare letter', rows[0] && rows[0].display);
  check(rows.length > 0 && /alif with fatha, then .+ with sukoon/.test(rows[0].say), 'and the teacher is told to say the alif and then the closed letter', rows[0] && rows[0].say);
  const earlier = audioCtx.qaidaAudio.wanted().filter((row) => row.kind === 'kasra-yaa' || row.kind === 'fatha');
  check(earlier.every((row) => !row.display.startsWith(ALIF + FATHA) || row.key === 'ا'), 'no earlier group is shown with a lead');
  check(JSON.parse(fs.readFileSync(path.join(dir, 'audio', 'manifest.json'), 'utf8')).sukun !== undefined, 'manifest.json has the "sukun" group');

  // No literal combining mark anywhere Lesson 14 touches.
  for (const file of ['marks.js', 'lesson-14.html', 'spell.js', 'exercise.js', 'exercise-14.html', 'audio.js', 'mark-lesson.js']) {
    check(!/[ً-ْٗ٠-٩ۡۥۦ]/.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')),
      `${file} holds no literal combining mark or small letter`);
  }

  // The home's row.
  const row = shell.LESSONS.find((entry) => entry.n === 14);
  check(row.built === true && row.href === 'lesson-14.html' && row.progress === 'drill' && row.cp === 0x0652 && !row.tail,
    'the home has Lesson 14 as a real link, counting ids that end in the jazam');
}

// ---- 9l. Lesson 15: the shadda, a vowel and a shadda on one letter, drawn after the lead -------------------------------
// docs/lesson-15/06 §3. The data layer only: marks.js, shell.js's masteredCount and rows, and audio.js's groups(), in node.
// The page is tools/qaida-lesson15-check.js. The new things are `cp` as a LIST (two marks on one letter, the vowel first
// and the shadda last so the halo rings the shadda) and the home's second part; the fence (9f6) proves lessons 4-14 did
// not move.

console.log('\nLesson 15: the shadda');
{
  const FATHA = String.fromCharCode(0x064E);
  const KASRA = String.fromCharCode(0x0650);
  const DAMMA = String.fromCharCode(0x064F);
  const SHADDA = String.fromCharCode(0x0651);
  const ALIF = String.fromCharCode(0x0627);
  const JAZAM = String.fromCharCode(0x0652);
  const LEAD = ALIF + FATHA;
  const looks = GROUPS.split(',').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const world = (script) => {
    const w = boot();
    if (script) w.shell.state.script = script;
    w.own = w.marks.marksOf('shadda');
    w.items = w.marks.allItems(w.shell, w.own, { looks, distractors: 'which-mark' });
    return w;
  };
  const madani = world();
  const indopak = world('indopak');
  const { shell, marks, own, items } = madani;
  const [sFatha, sKasra, sDamma] = own;
  const plain = [marks.MARKS.fatha, marks.MARKS.kasra, marks.MARKS.damma];

  // The rows and the set.
  check(own.length === 3 && marks.setOf('shadda').marks.join() === 'shadda-fatha,shadda-kasra,shadda-damma', 'the shadda set names its three rows, in lesson order');
  check(own.every((m, i) => JSON.stringify(m.cp) === JSON.stringify([[0x064E, 0x0650, 0x064F][i], 0x0651])), 'each row\'s cp is a LIST: the vowel first, the shadda last');
  check(own.every((m) => m.lesson === 15 && m.sits === 'above' && m.audio === m.id && !m.tail && !m.forms), 'lesson 15, above the letter, its own recordings, no tail and no forms');
  check(own.every((m) => JSON.stringify(m.lead) === JSON.stringify([0x0627, 0x064E])), 'all three carry Lesson 14\'s lead, alif and fatha');
  check(own.every((m, i) => m.against.join() === `${plain[i].id},sukun`), 'against is the plain vowel, then the jazam: the two halves of a shadda', own.map((m) => m.against.join()).join(' / '));
  check(sFatha.first === marks.MARKS.fatha.first && sDamma.first === marks.MARKS.damma.first && sKasra.first === marks.MARKS['standing-kasra'].first,
    'part 1 and 3 borrow zabar\'s and paish\'s own six; part 2 borrows khari zair\'s (none has a dot underneath)');
  check(own.every((m) => JSON.stringify(m.skip) === JSON.stringify(['ا', 'ء'])), 'alif and hamza are skipped on all three');

  // cpsOf and suffixOf: a list stays a list, a number becomes one, nothing earlier moves.
  check(marks.cpsOf({ cp: 0x064E }).join() === '1614' && marks.cpsOf(sFatha).join() === '1614,1617', 'cpsOf makes a list of a number and keeps a list');
  check(Object.values(marks.MARKS).filter((m) => m.lesson <= 14).every((m) => marks.suffixOf(m) === String.fromCharCode(m.cp, ...(m.tail || []))), 'suffixOf is unchanged for every row of lessons 4-14');
  check(marks.suffixOf(sFatha) === FATHA + SHADDA && marks.suffixOf(sKasra) === KASRA + SHADDA && marks.suffixOf(sDamma) === DAMMA + SHADDA, 'and for the new ones it is the vowel then the shadda');
  check(marks.formOf(sKasra, 'madani').cp.join() === '1616,1617' && marks.formOf(sKasra, 'indopak').cp.join() === '1616,1617' && marks.formOf(sKasra).tail.length === 0,
    'formOf gives the same two marks in both scripts, and no tail');

  // 27 items, three-character ids that hold the shadda and never the lead.
  check(marks.partsOf(own).length === 4, 'four parts: one per shadda, then all the letters');
  check(JSON.stringify(marks.sizes(items, marks.partsOf(own))) === '[6,6,6,27]', 'the parts hold 6, 6, 6 and 27', JSON.stringify(marks.sizes(items, marks.partsOf(own))));
  const lastItems = items.filter((item) => marks.inPart(item, 4));
  const spread = own.map((m) => lastItems.filter((item) => item.mark === m.id).length);
  check(lastItems.length === 27 && spread.every((n) => n >= 8 && n <= 10), 'the last part spreads its 27 across the three shaddas, roughly evenly', spread.join('/'));
  check(!items.some((item) => item.key === 'ا' || item.key === 'ء'), 'no item for alif or hamza');
  check([...items, ...indopak.items].every((item) => item.id.length === 3 && item.id.endsWith(SHADDA) && !item.id.includes(ALIF)),
    'every id is three characters, ending in the shadda, and never holds the lead\'s alif, in both scripts');
  check(JSON.stringify(items.map((item) => item.id).sort()) === JSON.stringify(indopak.items.map((item) => item.id).sort()), 'Madani and Indo-Pak produce the same id set');
  check(items.every((item) => item.glyph === LEAD + item.base + item.id.slice(1)), 'every glyph is the lead, the letter, the vowel, then the shadda: the id after the lead');
  check(items.every((item) => { const other = indopak.items.find((x) => x.id === item.id); return other && item.glyph.slice(LEAD.length + item.base.length) === other.glyph.slice(LEAD.length + other.base.length); }), 'and the two scripts draw the marks the same (a shadda has no second spelling); only the letters differ');

  // The other drawing sites: twins (each mark\'s own lead, else the lesson\'s), the board and the rail.
  const twins = marks.twinItems(shell, sFatha, { keys: ['ب', 'ت'], marks: [marks.MARKS.fatha, marks.MARKS.sukun, sKasra] });
  check(twins.length === 6 && twins.every((t) => t.glyph.startsWith(LEAD + t.base)), 'twins are drawn after the lead: a plain vowel takes the lesson\'s, the jazam and the other shaddas their own');
  check(twins.filter((t) => t.mark === 'fatha').every((t) => t.id.length === 2 && t.glyph === LEAD + t.base + FATHA), 'baa with zabar alone is two characters and no shadda');
  const rows1 = marks.boardRows(shell, sFatha, 1);
  check(rows1.length === 6 && rows1.every((r) => r.marked === LEAD + r.key + FATHA + SHADDA && r.others.length === 2 && r.others.every((o) => o.glyph.startsWith(LEAD))),
    'part 1\'s board: each row\'s marked tile and both other tiles after the lead');
  check(marks.boardRows(shell, sFatha, marks.partsOf(own)[3], { others: own.slice(1) }).length === 27, 'part 4\'s board has 27 rows');
  check(marks.sampleOf(shell, sFatha, 1) === LEAD + 'ب' + FATHA + SHADDA && marks.sampleOf(shell, sKasra, marks.partsOf(own)[1]) === LEAD + 'د' + KASRA + SHADDA,
    'the rail\'s samples: baa with zabar, and daal with zair');

  // Mastery survives a script switch, both ways.
  for (const [from, to] of [['madani', 'indopak'], ['indopak', 'madani']]) {
    const switched = boot();
    switched.shell.state.script = from;
    const set = switched.marks.marksOf('shadda');
    const before = switched.marks.allItems(switched.shell, set).find((item) => item.key === 'ك');
    for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(15, before.id, true);
    switched.shell.state.script = to;
    const after = switched.marks.allItems(switched.shell, set).find((item) => item.key === 'ك');
    check(after.id === before.id && switched.marks.stats(switched.shell, 15, [after], 4, { target: 3 }).known === 1, `the kaaf keeps its credit going ${from} to ${to}`);
  }

  // masteredCount: a list of lists.
  const counted = boot();
  const first = counted.marks.allItems(counted.shell, counted.marks.marksOf('shadda'))[0];
  for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(15, first.id, true);
  check(counted.shell.masteredCount(15) === 1, 'masteredCount(15) counts one mastered own item', String(counted.shell.masteredCount(15)));
  for (const twin of ['ب' + FATHA, 'ب' + JAZAM, 'ب' + KASRA]) for (let k = 0; k < 3; k += 1) counted.shell.recordAnswer(15, twin, true);
  check(counted.shell.masteredCount(15) === 1, 'and not three mastered twins (baa with zabar, with a jazam, with zair: two characters each)', String(counted.shell.masteredCount(15)));
  check([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].every((n) => counted.shell.masteredCount(n) === 0), 'and none of it counts toward another lesson');

  // 400 questions through the real engine: every own question offers a twin, every choice has the lead, no two choices
  // differ only in the lead.
  const w = world();
  const twinsFor = (n, ownItems) => {
    // data-twins="alternate": one twin per letter by turns. A warm-up part: its plain vowel or the jazam. The last part: the other two shaddas.
    const wanted = n < 4 ? [plain[n - 1], marks.MARKS.sukun] : null;
    return ownItems.flatMap((item, at) => {
      const list = wanted || own.filter((m) => m.id !== item.mark);
      return w.marks.twinItems(w.shell, own[0], { keys: [item.key], marks: [list[(at + n) % list.length]], looks, distractors: 'which-mark' });
    });
  };
  let asked = 0;
  let ownAsked = 0;
  let missing = 0;
  let noLead = 0;
  let leadOnly = 0;
  for (const n of [1, 2, 3, 4]) {
    const ownItems = w.marks.poolFor(w.items, n);
    const drill = w.practice.create({ lesson: 15, items: [...ownItems, ...twinsFor(n, ownItems)], formats: FORMATS, random: seeded(71 + n), noRepeatWithin: 4 });
    drill.start();
    for (let i = 0; i < 100; i += 1) {
      const q = drill.question;
      if (!q) break;
      asked += 1;
      const otherIds = q.choices.map((c) => c.id).filter((id) => id !== q.item.id);
      if (q.item.required) {
        ownAsked += 1;
        if (!otherIds.some((id) => id.startsWith(q.item.key) && id !== q.item.id)) missing += 1;
      }
      if (q.format.answerWith === 'glyph' && q.choices.some((c) => !c.glyph.startsWith(LEAD))) noLead += 1;
      if (new Set(q.choices.map((c) => c.glyph.slice(LEAD.length))).size !== q.choices.length) leadOnly += 1;
      drill.answer(q.item.id);
      drill.next();
    }
  }
  check(asked === 400 && ownAsked > 0 && missing === 0, 'every question about an item offers a twin on the same letter, across 400 questions', `${asked} asked, ${ownAsked} own, ${missing} without`);
  check(noLead === 0, 'every choice on a glyph question starts with the lead', String(noLead));
  check(leadOnly === 0, 'and no two choices differ only in the lead', String(leadOnly));

  // audio.js: three groups of 27, each shown with the lead, the teacher told the sound is twice.
  const audioCtx = vm.createContext({
    document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: async () => ({ ok: false }),
    setTimeout, clearTimeout,
  });
  audioCtx.window = audioCtx;
  for (const file of ['shell.js', 'marks.js', 'audio.js']) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  const wantedRows = audioCtx.qaidaAudio.wanted();
  for (const m of own) {
    const rows = wantedRows.filter((row) => row.kind === m.audio);
    check(rows.length === 27 && rows.every((row) => row.display.startsWith(LEAD + row.key) && row.display.endsWith(String.fromCharCode(...marks.cpsOf(m))) && row.glyph === row.key),
      `'${m.audio}' is one recording group of 27 rows, each shown with the lead and the letter's two marks`, String(rows.length));
    check(rows.length > 0 && /"ab-ba".*alif with fatha, then .+ with .+, said twice/.test(rows[0].say), `and the teacher is told the sound is said twice`, rows[0] && rows[0].say);
  }
  // Lesson 16 adds one more row (the closed "a'", `hamza-jazam`), but only where rules.js is loaded: this context has not
  // loaded it, so it is still Lesson 15's 446. The row itself is checked in tools/qaida-rules-check.js.
  check(wantedRows.length === 365 + 81, 'the recordings page (without rules.js) lists 81 more rows: 446 in all', String(wantedRows.length));
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'audio', 'manifest.json'), 'utf8'));
  check(['shadda-fatha', 'shadda-kasra', 'shadda-damma'].every((k) => manifest[k] !== undefined), 'manifest.json has the three shadda groups');

  // The words: a shadda is never on a first letter or on alif is checked in qaida-words-check.js; here, no literal mark.
  for (const file of ['marks.js', 'lesson-15.html', 'exercise-15.html', 'spell.js', 'exercise.js', 'audio.js', 'mark-lesson.js', 'shell.js', 'home.js', 'index.html']) {
    check(!/[ً-ْٗ٠-٩ۡۥۦ]/.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')), `${file} holds no literal combining mark or small letter`);
  }

  // The home: 29 rows in two parts, only 1-15 built, and Lesson 15's row counts the shadda's ids.
  check(shell.LESSONS.length === 29 && shell.LESSONS.every((entry, i) => entry.n === i + 1), 'the home lists 29 lessons, in order');
  check(shell.LESSONS.filter((entry) => entry.part === 2).map((entry) => entry.n).join() === Array.from({ length: 15 }, (_, i) => i + 15).join()
    && shell.LESSONS.filter((entry) => !entry.part).length === 14, 'lessons 15-29 are the second part; 1-14 have no `part` and so are the first');
  check(shell.LESSONS.filter((entry) => entry.built).length === 22 && shell.LESSONS.find((entry) => entry.n === 22).built === true, 'only lessons 1-22 are built');
  check(shell.LESSONS.filter((entry) => entry.n > 22).every((entry) => !entry.href && !entry.built && entry.title.fatha && entry.lede), 'and each later lesson has a title and a line, and leads nowhere');
  const hamzaRow = shell.LESSONS.find((entry) => entry.n === 16);
  check(hamzaRow.href === 'lesson-16.html' && hamzaRow.progress === 'drill' && hamzaRow.part === 2 && hamzaRow.cp === undefined && !hamzaRow.tail,
    'Lesson 16 is a real link in the second part, with no `cp`: every id in its record is one of its fifteen forms (docs/lesson-16/03 §8)');
  const row = shell.LESSONS.find((entry) => entry.n === 15);
  check(row.href === 'lesson-15.html' && row.progress === 'drill' && JSON.stringify(row.cp) === JSON.stringify([[0x064E, 0x0651], [0x0650, 0x0651], [0x064F, 0x0651]]) && !row.tail,
    'the home has Lesson 15 as a real link, counting ids that end in a vowel and the shadda');
}

// ---- 10. The engine keeps to its boundaries ---------------------------------------------------------------------

console.log('\nBoundaries');
{
  const source = fs.readFileSync(path.join(dir, 'practice.js'), 'utf8').replace(/\/\/.*$/gm, '');
  check(!/\bdocument\b/.test(source), 'practice.js never touches the DOM');
  check(!/localStorage|sessionStorage/.test(source), 'practice.js never touches storage itself');
  check(!/qaidaAudio/.test(source), 'practice.js does not know about sound; the lesson says what is available');
}

console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
process.exitCode = failed;
