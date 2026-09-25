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

// ---- 4. Ready: four fifths known, nothing missed and still shaky ---------------------------------------------

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
  check(readyAt >= 24 * 3, 'not before four fifths of the letters have three right answers in a row', `24 x 3 = 72`);
  check(events.ready === 1, 'ready fires once, however long they carry on', `${events.ready} times`);
  check(p.known >= 24, 'the bar counts letters known', `${p.known} of ${p.total}`);
}

{
  const { drill, shell } = make({ seed: 5 });
  const ids = shell.lettersOf().map(([g]) => shell.keyOf(g));
  for (const id of ids.slice(0, 24)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(2, id, true);
  check(drill.progress().ready === true, 'twenty-four letters known and nothing missed: ready');

  shell.recordAnswer(2, ids[25], false); // a letter missed and still shaky
  check(drill.progress().ready === false, 'twenty-four known but one missed letter still shaky: not ready', `toFix ${drill.progress().toFix}`);

  for (let k = 0; k < 3; k += 1) shell.recordAnswer(2, ids[25], true);
  check(drill.progress().ready === true, 'once that letter is put right: ready again');
}

{
  const { drill, shell } = make({ seed: 5, options: { readyAt: 1 } });
  const ids = shell.lettersOf().map(([g]) => shell.keyOf(g));
  for (const id of ids.slice(0, 28)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(2, id, true);
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
  check(drill.total === 0 && drill.target === 3, 'a bad total and target become 0 and 3', `${drill.total}, ${drill.target}`);
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
    check(heh && heh.base === 'ہ' && heh.glyph === '' + J + 'ہ' + J + '', 'in Indo-Pak the medial haa is drawn with ہ, and keeps the id ه:medial');
  }

  const noJoin = items.filter((item) => item.band === 1);
  check(noJoin.length === 6 && noJoin.every((item) => item.position === 'joined'), 'a letter that never joins forward has one item, its joined form');
  check(!items.some((item) => shapes.classOf(item.key) === 'back-only' && ['initial', 'medial'].includes(item.position)),
    'a letter that never joins forward never produces an initial or medial item');
  check(!items.some((item) => item.key === 'ء') && every.filter((item) => item.key === 'ء').length === 1,
    "ء produces no item, until every position is drilled, and then only its own shape");
  check(items.filter((item) => item.band === 2).every((item) => item.position === 'medial') && items.filter((item) => item.band === 2).length === 2,
    'ط and ظ have one item each, the middle form');
  check(shapes.FORM.medial('ب') === '' + J + 'ب' + J + '' && shapes.FORM.initial('ب') === 'ب' + J + '' && shapes.FORM.final('ب') === '' + J + 'ب',
    'the joiner sits on the side that joins');
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
  check(items.slice().filter((item) => item.group === 1).map((item) => item.key).sort().join() === mark.first.slice().sort().join(), "and each item knows it is in part 1 by the mark's own list");
  check(fatha.first.every((key) => marks.allItems(shell, fatha, { looks }).find((item) => item.key === key).group === 1), "fatha's own six are unchanged by all this");

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
  check(twins.every((twin) => twin.required === false && twin.group === 0), 'a twin is review: never required, and in no part');
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
  check(both.every((twin) => twin.group === 0 && twin.required === false && twin.marked), 'every twin is review: group 0, never required');
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
