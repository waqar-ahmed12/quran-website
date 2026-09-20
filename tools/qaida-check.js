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
  for (const file of ['shell.js', 'practice.js']) {
    vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file });
  }
  return { shell: ctx.qaidaShell, practice: ctx.qaidaPractice, store };
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

// ---- 8. The engine keeps to its boundaries ----------------------------------------------------------------------

console.log('\nBoundaries');
{
  const source = fs.readFileSync(path.join(dir, 'practice.js'), 'utf8').replace(/\/\/.*$/gm, '');
  check(!/\bdocument\b/.test(source), 'practice.js never touches the DOM');
  check(!/localStorage|sessionStorage/.test(source), 'practice.js never touches storage itself');
  check(!/qaidaAudio/.test(source), 'practice.js does not know about sound; the lesson says what is available');
}

console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
process.exitCode = failed;
