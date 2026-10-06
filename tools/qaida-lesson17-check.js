// Checks for Lesson 17's end-shape layer (ends.js, on rules.js) and, below it, the rule page (rule-lesson.js against the real
// lesson-17.html in a small hand-made DOM). QAIDA-BUILD.md step P2; docs/lesson-17/02 §3.
//
//   node tools/qaida-lesson17-check.js
//
// The data half loads the real shell.js, practice.js, marks.js, rules.js and ends.js into a scratch context with an in-memory
// stand-in for localStorage, as tools/qaida-rules-check.js does. The page half is at the foot of this file.
//
// The same limits as every other page check: nothing is drawn and no CSS runs, so it cannot tell whether a round taa and its
// marks, or a yaa and its small alif, are clear of the tile's edge at the tile's size, whether the grids overflow at 375px, or how
// any face draws a form. Those were measured in the browser pane at the build (docs/lesson-17/02 §4 is the user's list). What it
// proves: the scripts load against the markup, and that the forms, the ids, the two scripts, the engine's questions, the grids,
// the lines and the ways out do what they say. Prints PASS or FAIL per check; the exit code is the number that failed.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.join(__dirname, '..', 'site', 'qaida');
let failed = 0;
const check = (ok, what, extra = '') => {
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${extra ? `  (${extra})` : ''}`);
};

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
  for (const file of ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'ends.js']) {
    vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file });
  }
  return { shell: ctx.qaidaShell, practice: ctx.qaidaPractice, marks: ctx.qaidaMarks, rules: ctx.qaidaRules, kit: ctx.qaidaRules.KITS.ends, store };
}

const cc = (...codes) => String.fromCharCode(...codes);
const FATHA = cc(0x064E);
const KASRA = cc(0x0650);
const DAMMA = cc(0x064F);
const FATHATAIN = cc(0x064B);
const DAMMATAIN = cc(0x064C);
const KASRATAIN = cc(0x064D);
const JAZAM = cc(0x0652); // as Indo-Pak draws it
const JAZAM_M = cc(0x06E1); // as Madani draws it
const SMALL_ALIF = cc(0x0670);
const TAA = cc(0x0629);
const YAA = cc(0x0649);
const BAA = cc(0x0628);
const FAA = cc(0x0641);
const LAAM = cc(0x0644);
const MEEM = cc(0x0645);
const LEAD = BAA + FATHA;
const LEADS = [BAA, FAA, LAAM, MEEM];

const FORM_TO_NAME = { id: 'form-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0 };

console.log('The data layer: ends.js');
{
  const { shell, marks, rules, kit } = boot();
  const forms = kit.formsOf();

  // The fourteen forms, the parts.
  check(rules.RULES.ends.id === 'ends' && rules.RULES.ends.lesson === 17 && rules.RULES.ends.parts === 3, 'a second rule, "ends", lesson 17, three parts');
  check(Object.keys(rules.RULES).join() === 'hamza,ends' && rules.KITS.hamza.board === 'grid' && kit.board === 'ends', 'the registry holds the hamza\'s kit and this one, each with its own board');
  check(forms.length === 14, 'fourteen forms', String(forms.length));
  const taa = forms.filter((f) => f.kind === 'taa');
  const yaa = forms.filter((f) => f.kind === 'yaa');
  check(taa.map((f) => f.mark).join() === 'fatha,kasra,damma,fathatain,kasratain,dammatain' && yaa.length === 8, 'six round taa (one mark, then two) and eight end yaa');
  check(taa.every((f) => marks.markOf(f.mark) && ['fatha', 'zabar'].every((set) => marks.markOf(f.mark).names[set])), 'every round taa\'s mark is a real MARKS id with a name in both name sets');
  check(yaa.map((f) => f.read).join() === 'ee,ee,ee,ee,aa,aa,aa,aa' && yaa.slice(0, 4).map((f) => cc(f.lead)).join('') === LEADS.join(''), 'the yaa forms are four letters (baa, faa, laam, meem) read "ee", then the same four read "aa"');
  const items = kit.itemsFor(shell);
  check(JSON.stringify(marks.sizes(items, [1, 2, 3])) === '[6,8,14]', 'the three parts hold 6, 8 and 14', JSON.stringify(marks.sizes(items, [1, 2, 3])));
  check(taa.every((f) => f.parts.join() === '1,3') && yaa.every((f) => f.parts.join() === '2,3'), 'the round taa is met in parts 1 and 3, the end yaa in parts 2 and 3');

  // Ids: fourteen, distinct, the same in both scripts, and never the lead.
  const ids = forms.map((f) => kit.idOf(f));
  check(new Set(ids).size === 14, 'fourteen distinct ids');
  check(ids.slice(0, 6).every((id) => id.length === 2 && id[0] === TAA) && ids.slice(6, 10).every((id) => id.length === 3 && id.endsWith(KASRA + YAA))
    && ids.slice(10).every((id) => id.length === 4 && id.endsWith(FATHA + YAA + SMALL_ALIF)), 'a round taa\'s id is two characters, an "ee" yaa\'s three, an "aa" yaa\'s four');
  check(ids.slice(0, 6).every((id) => !id.includes(BAA)), 'and no round taa\'s id holds the lead (the baa is drawn, never part of an id)');
  const madani = boot();
  const indopak = boot();
  indopak.shell.state.script = 'indopak';
  const idsIn = (w) => w.kit.itemsFor(w.shell).map((item) => item.id);
  check(JSON.stringify(idsIn(madani)) === JSON.stringify(idsIn(indopak)), 'the same ids in both scripts: the glyphs differ, the ids do not');

  // The drawing, per script.
  const at = (w, kind, sel) => w.kit.formsOf().find((f) => f.kind === kind && sel(f));
  const drawn = (w, form) => w.kit.drawnOf(form, w.shell.state.script);
  const taaOf = (mark) => (w) => at(w, 'taa', (f) => f.mark === mark);
  check(['fatha', 'kasra', 'damma', 'fathatain', 'kasratain', 'dammatain'].every((mark, i) => {
    const code = [FATHA, KASRA, DAMMA, FATHATAIN, KASRATAIN, DAMMATAIN][i];
    return drawn(madani, taaOf(mark)(madani)) === LEAD + TAA + code && drawn(indopak, taaOf(mark)(indopak)) === LEAD + TAA + code;
  }), 'a round taa is a baa with zabar, then ة, then its mark: the same in both scripts');
  const yaaOf = (read, lead) => (w) => at(w, 'yaa', (f) => f.read === read && cc(f.lead) === lead);
  check(LEADS.every((lead) => drawn(madani, yaaOf('ee', lead)(madani)) === lead + KASRA + YAA), 'Madani: the long "ee" yaa is the letter, a zair, and a bare ى');
  check(LEADS.every((lead) => drawn(indopak, yaaOf('ee', lead)(indopak)) === lead + KASRA + YAA + JAZAM), 'Indo-Pak: the long "ee" yaa carries a jazam (U+0652), as in Lesson 13');
  check(LEADS.every((lead) => drawn(madani, yaaOf('aa', lead)(madani)) === lead + FATHA + YAA + SMALL_ALIF), 'Madani: the long "aa" is the letter, a zabar, ى and a small alif on the yaa');
  check(LEADS.every((lead) => drawn(indopak, yaaOf('aa', lead)(indopak)) === lead + SMALL_ALIF + YAA), 'Indo-Pak: the long "aa" is a khari zabar (U+0670) on the letter before, and a bare ى');
  check(kit.itemsFor(madani.shell).every((item) => !item.glyph.includes(JAZAM) && !item.glyph.includes(JAZAM_M)), 'no jazam in any Madani drawing of this lesson (the "ee" is bare)');
  const indopakGlyphs = indopak.kit.itemsFor(indopak.shell).map((item) => item.glyph);
  check(indopakGlyphs.filter((g) => g.includes(SMALL_ALIF)).length === 4 && indopakGlyphs.every((g) => !g.endsWith(SMALL_ALIF)), 'Indo-Pak: four forms carry U+0670 and none has it after the yaa');
  const madaniGlyphs = madani.kit.itemsFor(madani.shell).map((item) => item.glyph);
  check(madaniGlyphs.filter((g) => g.endsWith(SMALL_ALIF)).length === 4, 'Madani: four forms end in a small alif');

  // The lead: in front of the round taa and only that.
  check(taa.every((f) => kit.leadOf(f) === LEAD) && yaa.every((f) => kit.leadOf(f) === ''), 'the lead (baa with zabar) is on the six round taa and nothing else: a yaa\'s letter is part of the form');

  // Names: one template each, eight distinct.
  const names = items.map((item) => item.name);
  check(new Set(names).size === 8, 'eight distinct names across the fourteen: six round taa, two yaa', [...new Set(names)].join(' | '));
  check(names.slice(0, 6).every((n) => /^Round taa with /.test(n)) && names[6] === 'End yaa, read “ee”' && names[10] === 'End yaa, read “aa”', 'the names: "Round taa with …", "End yaa, read “ee”", "End yaa, read “aa”"');
  check(names.every((n) => !/baa|faa|laam|meem/i.test(n)), 'and the letter a yaa comes after is never in a name');
  const zn = boot({ v: 1, chosen: true, script: 'madani', names: 'zabar', grouping: 'families' });
  const znames = zn.kit.itemsFor(zn.shell).map((i) => i.name);
  check(['Round taa with zabar', 'Round taa with zair', 'Round taa with paish', 'Round taa with two zabar', 'Round taa with two zair', 'Round taa with two paish'].every((n) => znames.includes(n)), 'in the zabar set: zabar, zair, paish, two zabar, two zair, two paish');
  const fn = boot({ v: 1, chosen: true, script: 'madani', names: 'fatha', grouping: 'families' });
  const fnames = fn.kit.itemsFor(fn.shell).map((i) => i.name);
  check(['Round taa with fatha', 'Round taa with kasra', 'Round taa with damma', 'Round taa with two fatha', 'Round taa with two kasra', 'Round taa with two damma'].every((n) => fnames.includes(n)), 'in the fatha set: fatha, kasra, damma, two fatha, two kasra, two damma');
  fn.shell.state.names = 'zabar';
  fn.kit.rename(items, fn.shell);
  check(new Set(items.map((i) => i.name)).size === 8 && items[0].name === 'Round taa with zabar', 'rename() rewrites every name in place');

  // Audio: the recordings of Lessons 4-13 are reused, so this lesson adds no row.
  const audioOf = (i) => `${i.audio.kind}/${i.audio.glyph}`;
  check(items.slice(0, 6).map(audioOf).join() === ['fatha', 'kasra', 'damma', 'fathatain', 'kasratain', 'dammatain'].map((k) => `${k}/${cc(0x062A)}`).join(),
    'a round taa plays what a taa with that mark says: the sound of Lessons 4-7 on ت');
  check(items.slice(6, 10).every((i) => i.audio.kind === 'kasra-yaa') && items.slice(10).every((i) => i.audio.kind === 'fatha-alif')
    && items.slice(6, 10).every((i, n) => i.audio.glyph === LEADS[n]) && items.slice(10).every((i, n) => i.audio.glyph === LEADS[n]),
  'an end yaa plays its letter with the long vowel: Lesson 13\'s "ee" or Lesson 8\'s "aa", on its own letter');

  // The boards: a round taa grid of 2 by 3, an end yaa grid of 2 by 4.
  const boards = kit.boards();
  check(boards.length === 2 && boards[0].id === 'taa' && boards[0].columns === 3 && boards[0].rows.map((r) => r.row).join() === 'single,double' && boards[0].rows.every((r) => r.cells.length === 3),
    'the round taa board is two rows (one mark, two marks) of three');
  check(boards[0].heads.join() === 'fatha,kasra,damma', 'whose columns are zabar, zair, paish, with the doubled one under each');
  check(boards[1].id === 'yaa' && boards[1].columns === 4 && boards[1].heads === null && boards[1].rows.map((r) => r.row).join() === 'ee,aa' && boards[1].rows.every((r) => r.cells.length === 4),
    'the end yaa board is two rows (read "ee", read "aa") of four, with no heads');
  check(boards.flatMap((b) => b.rows.flatMap((r) => r.cells)).length === 14, 'fourteen cells in all');
  check(kit.shapes().map((s) => s.glyph).join('') === TAA + YAA, 'the two shapes on their own: ة and ى');

  // The echo under a wrong answer.
  const echoOf = (item) => kit.echoOf(item);
  check(echoOf(items[0]).forms.length === 6 && echoOf(items[0]).line === 'lineTaa', 'under a wrong answer about a round taa: all six, with their own line');
  check(echoOf(items[7]).forms.length === 2 && echoOf(items[7]).line === 'lineYaa' && echoOf(items[7]).forms.every((f) => f.lead === items[7].lead.charCodeAt(0))
    && echoOf(items[7]).forms.map((f) => f.read).join() === 'ee,aa', 'and about an end yaa: the same letter read "ee" and read "aa"');

  // The words' hook.
  check(rules.ENDS.taa === TAA && rules.ENDS.yaa === YAA, 'rules.js knows the two keys');
  check(JSON.stringify(rules.endOf(TAA, 'dammatain')) === '{"kind":"taa"}' && rules.endOf(YAA, 'aa').read === 'aa' && rules.endOf(YAA, 'ee').read === 'ee' && rules.endOf(YAA, 'fatha') === null && rules.endOf('ب', 'fatha') === null,
    'endOf knows a round taa, an end yaa read either way, and nothing else (a yaa with a real mark is not one)');
  const letters = shell.lettersOf('madani').map(([g]) => g).concat(shell.lettersOf('indopak').map(([g]) => g));
  check(letters.every((g) => !rules.hasEnd([[g, 'fatha']])) && !rules.hasEnd([['ب', 'fatha'], ['ت', 'kasra']]), 'and no word of the 29 letters has an end shape, so no earlier word can change');
  const names2 = new Map(shell.lettersOf('madani').map(([g]) => [shell.keyOf(g), g]));
  const letterOf = (key) => names2.get(key) || key;
  const rahma = [['ر', 'fatha'], ['ح', 'sukun'], ['م', 'fatha'], [TAA, 'dammatain']];
  const alaa = [['ع', 'fatha'], ['ل', 'fatha'], [YAA, 'aa']];
  check(rules.wordUnits(rahma, letterOf, 'madani').join('') === 'ر' + FATHA + 'ح' + JAZAM_M + 'م' + FATHA + TAA + DAMMATAIN, 'rahmatun in Madani: the round taa carries two paish, the haa the Madani jazam');
  check(rules.wordUnits(alaa, letterOf, 'madani').join('') === 'ع' + FATHA + 'ل' + FATHA + YAA + SMALL_ALIF, '\'alaa in Madani: a zabar on the laam, then ى with a small alif');
  check(rules.wordUnits(alaa, letterOf, 'indopak').join('') === 'ع' + FATHA + 'ل' + SMALL_ALIF + YAA, '\'alaa in Indo-Pak: the laam\'s zabar becomes a khari zabar, and the yaa is bare');
  check(rules.wordUnits([['ف', 'kasra'], [YAA, 'ee']], letterOf, 'indopak').join('') === 'ف' + KASRA + YAA + JAZAM && rules.wordUnits([['ف', 'kasra'], [YAA, 'ee']], letterOf, 'madani').join('') === 'ف' + KASRA + YAA,
    'fii: bare in Madani, with a jazam in Indo-Pak');
  check(rules.wordUnits(alaa, letterOf, 'indopak').length === 3 && rules.wordUnits(rahma, letterOf, 'indopak').length === 4, 'one unit per letter, so the walkthrough can light one at a time');

  // No literal combining mark in any file of the lesson.
  const MARK_RE = new RegExp('[\\u064B-\\u0652\\u0670\\u0657\\u0660-\\u0669\\u06E1\\u06E5\\u06E6]'); // a combining mark or small letter, by code point
  check(MARK_RE.test(FATHA) && MARK_RE.test(SMALL_ALIF) && MARK_RE.test(JAZAM_M) && !MARK_RE.test(TAA), 'the literal-mark pattern can fail (it catches a zabar, a small alif and U+06E1, and not a letter)');
  for (const file of ['ends.js', 'rules.js', 'rule-lesson.js', 'lesson-17.html', 'exercise-17.html']) {
    check(!MARK_RE.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')), `${file} holds no literal combining mark or small letter`);
  }
}

console.log('\nMastery');
{
  const w = boot();
  const items = w.kit.itemsFor(w.shell);
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(17, items[0].id, true);
  check(w.shell.masteredCount(17) === 1, 'masteredCount(17) counts one mastered form', String(w.shell.masteredCount(17)));
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(17, items[11].id, true);
  check(w.shell.masteredCount(17) === 2, 'and two, when two are mastered', String(w.shell.masteredCount(17)));
  check([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].every((n) => w.shell.masteredCount(n) === 0), 'none of it counts toward another lesson');
  const switched = boot();
  const inMadani = switched.kit.itemsFor(switched.shell).find((item) => item.mark === 'aa' && item.lead === LAAM);
  for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(17, inMadani.id, true);
  switched.shell.state.script = 'indopak';
  const inIndoPak = switched.kit.itemsFor(switched.shell).find((item) => item.mark === 'aa' && item.lead === LAAM);
  check(inIndoPak.id === inMadani.id && inIndoPak.glyph !== inMadani.glyph && switched.rules.stats(switched.shell, 17, [inIndoPak], 3, { target: 3 }).known === 1,
    'the long "aa" yaa after laam keeps its credit after a switch to Indo-Pak, though it is drawn with another mark');
  const back = boot();
  back.shell.state.script = 'indopak';
  const fromIndo = back.kit.itemsFor(back.shell).find((item) => item.mark === 'ee' && item.lead === FAA);
  for (let k = 0; k < 3; k += 1) back.shell.recordAnswer(17, fromIndo.id, true);
  back.shell.state.script = 'madani';
  const toMadani = back.kit.itemsFor(back.shell).find((item) => item.mark === 'ee' && item.lead === FAA);
  check(toMadani.id === fromIndo.id && back.rules.stats(back.shell, 17, [toMadani], 3, { target: 3 }).known === 1, 'and the long "ee" yaa after faa going the other way, Indo-Pak to Madani');
}

console.log('\nThe recordings: none new');
{
  const audioCtx = vm.createContext({
    document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: async () => ({ ok: false }),
    setTimeout, clearTimeout,
  });
  audioCtx.window = audioCtx;
  for (const file of ['shell.js', 'marks.js', 'rules.js', 'ends.js', 'audio.js']) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  const rows = audioCtx.qaidaAudio.wanted();
  const items = audioCtx.qaidaRules.KITS.ends.itemsFor(audioCtx.qaidaShell);
  check(rows.length === 447, 'the recordings page still lists 447 rows: Lesson 17 adds none', String(rows.length));
  const wanted = (kind, key) => rows.some((row) => row.kind === kind && row.key === key);
  check(items.every((item) => wanted(item.audio.kind, audioCtx.qaidaShell.keyOf(item.audio.glyph))), 'and every form\'s sound is one of those rows, so the teacher\'s existing recordings reach it');
}

console.log('\nThe engine: questions on every part');
{
  const w = boot();
  const items = w.kit.itemsFor(w.shell);
  const expectNames = { 1: 6, 2: 2, 3: 8 };
  const expectChoices = { 1: 4, 2: 2, 3: 4 };
  let asked = 0;
  let sameAnswer = 0;
  let sameName = 0;
  let notOwn = 0;
  let starved = 0;
  let wrongCount = 0;
  let reversed = 0;
  let rightMissing = 0;
  for (const n of [1, 2, 3]) {
    const pool = w.rules.poolFor(items, n);
    check(new Set(pool.map((i) => i.name)).size === expectNames[n], `part ${n}: ${pool.length} forms and ${expectNames[n]} distinct names`, `${pool.length} / ${new Set(pool.map((i) => i.name)).size}`);
    const drill = w.practice.create({
      lesson: 17, items: pool, formats: [FORM_TO_NAME], random: seeded(41 + n), familyFirst: false,
      noRepeatWithin: Math.max(1, Math.min(8, pool.length - 2)),
    });
    drill.start();
    for (let i = 0; i < 100; i += 1) {
      const q = drill.question;
      if (!q) { starved += 1; break; }
      asked += 1;
      const ids = q.choices.map((c) => c.id);
      const names = q.choices.map((c) => c.name);
      if (new Set(ids).size !== ids.length) sameAnswer += 1;
      if (new Set(names).size !== names.length) sameName += 1;
      if (q.choices.length !== expectChoices[n]) wrongCount += 1;
      if (q.format.ask !== 'glyph' || q.format.answerWith !== 'name') reversed += 1;
      if (!ids.includes(q.item.id)) rightMissing += 1;
      if (!pool.some((p) => p.id === q.item.id)) notOwn += 1;
      drill.answer(q.item.id);
      drill.next();
    }
  }
  check(asked === 300 && starved === 0, '300 questions through the real engine, on all three parts, and no part starves', `${asked} asked, ${starved} starved`);
  check(sameAnswer === 0 && sameName === 0, 'never the same answer twice, and never two choices with one name', `${sameAnswer} / ${sameName}`);
  check(wrongCount === 0, 'four choices on parts 1 and 3, and two on part 2 (two readings, so two names: the question is "which way is it read?")', String(wrongCount));
  check(reversed === 0, 'no question is NAME_TO_FORM or SOUND_TO_FORM: two pictures honestly have one name', String(reversed));
  check(rightMissing === 0 && notOwn === 0, 'the right answer is always among the choices, and always one of the part\'s own forms');
}

//// The page half: a small DOM (copied from qaida-lesson15-check.js, which copied it from qaida-lesson6-check.js) -------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const VOID = new Set(['meta', 'link', 'input', 'br', 'img', 'hr', 'path', 'rect', 'circle', 'line']);
const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
let doc = null; // the page being run: El.focus() reads it

class El {
  constructor(tag = 'div', attrs = {}) {
    this.tag = tag;
    this.attrs = { ...attrs };
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this._text = '';
    this.style = { props: {}, setProperty(k, v) { this.props[k] = v; } };
    this.open = false;
    const self = this;
    this.dataset = new Proxy({}, {
      get: (_, key) => (typeof key === 'string' ? self.attrs[`data-${kebab(key)}`] : undefined),
      set: (_, key, value) => { self.attrs[`data-${kebab(key)}`] = String(value); return true; },
      has: (_, key) => `data-${kebab(key)}` in self.attrs,
    });
    this.classList = {
      contains: (c) => self.classes().includes(c),
      add: (...cs) => self.setClasses([...new Set([...self.classes(), ...cs])]),
      remove: (...cs) => self.setClasses(self.classes().filter((c) => !cs.includes(c))),
      toggle: (c, force) => {
        const on = force === undefined ? !self.classes().includes(c) : force;
        self.setClasses(on ? [...new Set([...self.classes(), c])] : self.classes().filter((x) => x !== c));
        return on;
      },
    };
  }
  classes() { return (this.attrs.class || '').split(/\s+/).filter(Boolean); }
  setClasses(list) { this.attrs.class = list.join(' '); }
  set className(v) { this.attrs.class = v; }
  get className() { return this.attrs.class || ''; }
  get hidden() { return 'hidden' in this.attrs; }
  set hidden(v) { if (v) this.attrs.hidden = ''; else delete this.attrs.hidden; }
  set lang(v) { this.attrs.lang = v; }
  set dir(v) { this.attrs.dir = v; }
  set type(v) { this.attrs.type = v; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this.children = []; this._text = String(v); }
  set innerHTML(html) { this.children = []; this._text = ''; for (const node of parse(html)) this.append(node); }
  insertAdjacentHTML(position, html) { for (const node of parse(html)) this.append(node); }
  get firstChild() { return this.children[0] || null; }
  get lastChild() { return this.children[this.children.length - 1] || null; }
  get lastElementChild() { return this.children[this.children.length - 1] || null; }
  get isConnected() { return true; }
  get offsetWidth() { return 0; }
  append(...nodes) {
    for (const n of nodes) {
      if (typeof n === 'string') { this._text += n; continue; }
      n.parent = this;
      this.children.push(n);
    }
  }
  after(node) {
    if (!this.parent) return;
    node.parent = this.parent;
    this.parent.children.splice(this.parent.children.indexOf(this) + 1, 0, node);
  }
  select() {}
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  toggleAttribute(k, force) { if (force) this.attrs[k] = ''; else delete this.attrs[k]; }
  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
  removeEventListener() {}
  focus() { doc.activeElement = this; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  descendants() { return this.children.flatMap((c) => [c, ...c.descendants()]); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  querySelectorAll(sel) { return this.descendants().filter((el) => sel.split(',').some((one) => matches(el, one.trim()))); }
  closest(sel) {
    for (let n = this; n; n = n.parent) if (matches(n, sel)) return n;
    return null;
  }
}

function compound(el, text) {
  const tag = text.match(/^[a-zA-Z][\w-]*/);
  if (tag && el.tag !== tag[0].toLowerCase()) return false;
  for (const m of text.matchAll(/\.([\w-]+)/g)) if (!el.classes().includes(m[1])) return false;
  for (const m of text.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)) {
    if (!(m[1] in el.attrs)) return false;
    if (m[2] !== undefined && el.attrs[m[1]] !== m[2]) return false;
  }
  return true;
}

function matches(el, sel) {
  const parts = sel.match(/(?:[^\s\[]|\[[^\]]*\])+/g) || [];
  if (!parts.length || !compound(el, parts[parts.length - 1])) return false;
  let node = el.parent;
  for (let i = parts.length - 2; i >= 0; i -= 1) {
    while (node && !compound(node, parts[i])) node = node.parent;
    if (!node) return false;
    node = node.parent;
  }
  return true;
}

function parse(html) {
  const source = html.replace(/<!doctype[^>]*>/gi, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/gi, '');
  const top = new El('#root');
  const stack = [top];
  const token = /<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)/g;
  for (const m of source.matchAll(token)) {
    const here = stack[stack.length - 1];
    if (m[4] !== undefined) {
      if (m[4].trim()) here._text += m[4].replace(/\s+/g, ' ').trim();
      continue;
    }
    const [, closing, rawTag, rawAttrs] = m;
    const tag = rawTag.toLowerCase();
    if (closing) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const attrs = {};
    for (const a of rawAttrs.matchAll(/([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1]] = a[2] ?? a[3] ?? a[4] ?? '';
    const el = new El(tag, attrs);
    here.append(el);
    if (!VOID.has(tag) && !/\/\s*$/.test(rawAttrs)) stack.push(el);
  }
  return top.children.map((c) => { c.parent = null; return c; });
}

El.prototype.scrollTo = function scrollTo() {};
El.prototype.getBoundingClientRect = function getBoundingClientRect() { return this.rect || { top: 0, bottom: 0, height: 0 }; };
El.prototype.scrollIntoView = function scrollIntoView() {};

// One page, running: the scripts of `files` loaded against the real markup of `page`, for a student who has chosen
// `saved` (a script and a set of names). Nothing else of the page is faked.
function run(page, files, saved) {
  const raw = fs.readFileSync(path.join(dir, page), 'utf8');
  const htmlEl = parse(raw).find((n) => n.tag === 'html');
  const there = {
    documentElement: htmlEl,
    activeElement: null,
    title: htmlEl.querySelector('title').textContent,
    body: htmlEl.querySelector('body'),
    querySelector: (sel) => htmlEl.querySelector(sel),
    querySelectorAll: (sel) => htmlEl.querySelectorAll(sel),
    createElement: (tag) => new El(tag),
    createTextNode: (text) => String(text),
    addEventListener() {},
  };
  doc = there;
  const store = new Map([['qaida', JSON.stringify({ v: 1, chosen: true, grouping: 'families', ...saved })]]);
  const location = { pathname: `/site/qaida/${page}`, href: '' };
  const opened = [];
  const ctx = vm.createContext({
    document: there,
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
    matchMedia: (query) => ({ matches: /reduced-motion/.test(query), addEventListener() {} }),
    IntersectionObserver: class { observe() {} },
    fetch: async () => ({ ok: false }),
    Audio: class { play() { return Promise.resolve(); } pause() {} },
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    navigator: {},
    location,
    getComputedStyle: () => ({ getPropertyValue: () => '', fontSize: '16px', paddingBottom: '24px', marginTop: '12px' }),
    setTimeout,
    clearTimeout,
    console,
  });
  ctx.window = ctx;
  ctx.qaidaTrace = { open: (glyph, name) => opened.push([glyph, name]) };
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file });
  const world = {
    raw, htmlEl, doc: there, ctx, location, opened, shell: ctx.qaidaShell, marks: ctx.qaidaMarks, rules: ctx.qaidaRules,
    $: (sel) => htmlEl.querySelector(sel),
    all: (sel) => htmlEl.querySelectorAll(sel),
  };
  world.click = (el, detail = 1) => {
    const event = { type: 'click', target: el, detail, preventDefault() { this.defaultPrevented = true; } };
    for (let n = el; n; n = n.parent) for (const fn of n.listeners.click || []) fn.call(n, event);
  };
  world.setScript = async (script) => { world.shell.state.script = script; world.shell.renderSetup(); await sleep(10); };
  world.setNames = async (names) => { world.shell.state.names = names; world.shell.renderSetup(); await sleep(10); };
  return world;
}


const nodeLoad = ['shell.js', 'audio.js', 'practice.js', 'marks.js', 'rules.js', 'ends.js', 'rule-lesson.js', 'spell.js'];
const NOMARK = new RegExp('[\\u064B-\\u0652\\u0670\\u0657\\u06D6-\\u06ED]'); // a literal combining mark or small Quranic letter

async function pageHalf() {
  let w;
  try {
    w = run('lesson-17.html', nodeLoad, { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against lesson-17.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  check(true, 'shell.js, audio.js, practice.js, marks.js, rules.js, ends.js, rule-lesson.js and spell.js load against lesson-17.html without an error');
  await sleep(20);
  const { $, all, click, shell, marks, rules, htmlEl } = w;
  const kit = rules.KITS.ends;
  const qaida = w.ctx.qaida;
  qaida.setPause(1);
  const forms = kit.formsOf();
  const tiles = () => all('.rule-cell');
  const gridTiles = () => $('.rule-grid').querySelectorAll('.rule-cell');
  const rail = () => all('.band');
  const choices = () => $('.choices').children;
  const itemShown = () => kit.itemsFor(shell).find((it) => it.glyph === ($('.prompt-glyph') ? $('.prompt-glyph').textContent : ''));
  const answerFor = () => choices().find((c) => c.attrs['data-id'] === itemShown().id);
  const wrongFor = () => choices().find((c) => c !== answerFor());
  const gridRows = () => $('.rule-grid').querySelectorAll('.rule-row').filter((r) => !r.classes().includes('rule-head'));

  console.log('\nThe page');
  check(qaida.kind === 'drill' && qaida.rule === 'ends' && qaida.hasOther === false && qaida.otherCount === 0 && qaida.hasTail === false && qaida.markCount === 1 && qaida.review === 0,
    'publishes window.qaida with kind "drill" and rule "ends", and nothing to be told apart from, no tails, no review');
  check(htmlEl.attrs['data-rule'] === 'ends' && htmlEl.attrs['data-point'] === 'none' && htmlEl.attrs['data-mark'] === undefined, 'the page teaches the ends rule, with no halo and no mark');
  check(JSON.stringify(qaida.groupCosts().map((p) => p.items)) === '[6,8,14]', 'groupCosts() is 6, 8 then 14', JSON.stringify(qaida.groupCosts().map((p) => p.items)));
  check(rail().length === 3 && rail().every((b) => b.attrs.disabled === undefined), 'three parts, all enabled: nothing is locked');
  check(qaida.parts.map((p) => p.name).join('|') === 'The round taa|The end yaa|Both', 'the three parts are named by shape', qaida.parts.map((p) => p.name).join('|'));

  // The members the options panel reads: a missing one throws in the panel and takes the page down.
  const panel = fs.readFileSync(path.join(dir, 'qaida-options.js'), 'utf8');
  const drillBranch = panel.slice(panel.indexOf("lesson.kind === 'drill'"), panel.indexOf("lesson.kind === 'exercise'"));
  const read = [...new Set([...drillBranch.matchAll(/\blesson\.(\w+)/g)].map((m) => m[1]))];
  const lesson3Only = ['setBand', 'bandTotals', 'setDrilled'];
  const assigned = ['onCosts'];
  const missing = read.filter((name) => !lesson3Only.includes(name) && !assigned.includes(name) && !(name in qaida));
  check(read.length > 20 && missing.length === 0, `every window.qaida member the panel reads exists (${read.length} read)`, missing.join(', '));

  console.log('\nThe head');
  check($('h1').textContent === 'The round taa and the end yaa' && w.doc.title.startsWith('Lesson 17: The round taa and the end yaa'), 'the title is in both name sets', $('h1').textContent + ' / ' + w.doc.title);
  check($('.title-mark').textContent === TAA, 'the big glyph is the round taa', $('.title-mark').textContent);
  const glyphs = all('.band-glyph').map((g) => g.textContent);
  check(glyphs.join() === [LEAD + TAA + DAMMATAIN, LAAM + FATHA + YAA + SMALL_ALIF, FAA + KASRA + YAA].join(), 'the rail shows a round taa with two paish, an end yaa read "aa", then one read "ee"', glyphs.join(' | '));
  check($('.eyebrow').textContent === 'Lesson 17 of 29' && all('.track li').length === 29 && all('.track li').findIndex((li) => li.classes().includes('now')) === 16,
    'Lesson 17 of 29, the seventeenth of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '14', 'the bar\'s total is the fourteen forms', $('.bar').attrs['aria-valuemax']);
  check(!$('.pairs') && !$('.pair-feature') && !$('.halo') && !$('.jazam-note') && !$('.mark-alone') && !$('.joined'), 'none of a mark lesson\'s board is on this page');

  console.log('\nThe board: the shapes and the two grids');
  const strip = $('.seat-strip').querySelectorAll('.rule-cell');
  check(strip.length === 2 && strip.map((t) => t.querySelector('.glyph').textContent).join('') === TAA + YAA && strip.every((t) => t.attrs['data-audio'] === undefined), 'the strip has two tiles, the bare ة and ى, and they say nothing when tapped (they are shapes, not forms)');
  check($('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|') === 'a round taa|an end yaa', 'captioned "a round taa" and "an end yaa"');
  check(/taa marbuta and alif maqsura/.test($('.seat-note').textContent) && !/\b29\b/.test($('.seat-note').textContent), 'and the line under them gives the class\'s words once, with no "29"', $('.seat-note').textContent);
  check($('.rule-grid').querySelectorAll('.rule-grid-title').map((t) => t.textContent).join('|') === 'The round taa|The end yaa', 'each grid has a heading');
  const rows = gridRows();
  check(rows.length === 4 && rows.map((r) => r.attrs['data-mark']).join() === 'single,double,ee,aa', 'four rows: one mark, two marks, read "ee", read "aa"');
  check(gridTiles().length === 14 && $('.rule-grid').querySelectorAll('.rule-dash').length === 0, 'fourteen cells and no dashes: every cell holds a form');
  check(rows.map((r) => r.style.props['--cols']).join() === '3,3,4,4', 'the round taa\'s rows are three across and the yaa\'s four');
  check($('.rule-grid').querySelectorAll('.rule-head .rule-col').map((c) => c.textContent).join('|') === 'fatha|kasra|damma', 'the round taa grid has heads: the three marks, in the student\'s own words', $('.rule-grid').querySelectorAll('.rule-head .rule-col').map((c) => c.textContent).join('|'));
  check(all('.rule-head').length === 1, 'and the end yaa grid has none');
  check(rows.map((r) => r.querySelector('.rule-name').textContent).join('|') === 'with one mark|with two marks|read “ee”|read “aa”', 'the row names', rows.map((r) => r.querySelector('.rule-name').textContent).join('|'));
  check(rows.map((r) => r.querySelector('.rule-sound').textContent).join('|') === '“ta”, “ti”, “tu”|“tan”, “tin”, “tun”|the yaa is read|the yaa is not read', 'and each row says its sound, the yaa rows whether the yaa is read', rows.map((r) => r.querySelector('.rule-sound').textContent).join('|'));
  const later = () => gridTiles().filter((t) => t.attrs['data-state'] === 'later').length;
  check(later() === 8, 'part 1: the eight yaa cells are dim, "comes later"; the map is all there', String(later()));
  qaida.setGroup(2);
  check(later() === 0 && gridTiles().length === 14, 'part 2: none dim (the round taa is part 1\'s, already met), and the grid has not changed shape', String(later()));
  qaida.setGroup(3);
  check(later() === 0, 'part 3: none dim', String(later()));
  qaida.setGroup(1);
  check(gridTiles().every((t) => t.tag === 'button'), 'a dim cell is a button all the same: nothing is locked');
  check(gridTiles().every((t) => t.attrs['aria-label'] && /^(Round taa with .+|End yaa, read “(ee|aa)”)$/.test(t.attrs['aria-label'])), 'every cell is named for a screen reader', gridTiles()[0].attrs['aria-label']);

  console.log('\nThe board: the same-sound line, the script lines and the lead line');
  check(/read “t”.*ta, ti, tu.*read “h”/.test($('.same-line').textContent), 'part 1 starts on the first round taa row, and says "t" and, at a stop, "h"', $('.same-line').textContent);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'double'));
  check(/tan, tin or tun.*no alif after it/.test($('.same-line').textContent), 'tapping a two-mark cell says tan, tin, tun and that two zabar take no alif after it', $('.same-line').textContent);
  check($('.rule-row[data-current]').attrs['data-mark'] === 'double' && all('.rule-row').filter((r) => 'data-current' in r.attrs).length === 1, 'and the row it is about is the one lit');
  check(/after a baa with fatha/.test($('.lead-line').textContent) && !$('.lead-line').hidden && !/two dots/.test($('.lead-line').textContent), 'part 1\'s lead line is about the baa, in the student\'s own word for zabar', $('.lead-line').textContent);
  qaida.setGroup(2);
  check($('.same-line').textContent === 'After a zair, this yaa is a long “ee”, and the yaa is read.', 'part 2 moves the line to the first yaa row, since the round taa rows are not its own', $('.same-line').textContent);
  check(/two dots under it/.test($('.lead-line').textContent) && !/baa with/.test($('.lead-line').textContent), 'and its lead line is about the dots', $('.lead-line').textContent);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'aa'));
  check($('.same-line').textContent === 'After a zabar, this yaa says a long “aa”, and the yaa is not read.', 'tapping a long "aa" cell says the yaa is not read', $('.same-line').textContent);
  qaida.setGroup(3);
  check(/baa with fatha/.test($('.lead-line').textContent) && /two dots/.test($('.lead-line').textContent), 'part 3 says both', $('.lead-line').textContent);
  check($('.same-line').textContent === 'After a zabar, this yaa says a long “aa”, and the yaa is not read.', 'and keeps the row the student tapped, which is in part 3');
  qaida.setGroup(1);
  check(/read “t”/.test($('.same-line').textContent), 'back to part 1, the line is about a round taa again, not a yaa that is not on the half', $('.same-line').textContent);
  check(/small alif written on the yaa/.test($('.script-line').textContent) && !/khari zabar/.test($('.script-line').textContent), 'the Madani student sees the Madani line, and only that', $('.script-line').textContent);
  await w.setScript('indopak');
  check(/standing fatha on the letter before/.test($('.script-line').textContent) && /carries a sukoon/.test($('.script-line').textContent) && !/small alif/.test($('.script-line').textContent),
    'the Indo-Pak student sees the Indo-Pak line: a standing mark on the letter before, and a jazam on the "ee" yaa, in the student\'s own words (fatha names here)', $('.script-line').textContent);
  await w.setScript('madani');

  console.log('\nThe two scripts');
  const cellOf = (kind, read, lead) => {
    const form = forms.find((f) => f.kind === kind && f.read === read && (lead === undefined || String.fromCharCode(f.lead) === lead));
    return gridTiles().find((t) => t.attrs['data-id'] === kit.idOf(form)).querySelector('.glyph').textContent;
  };
  await w.setScript('indopak');
  check(cellOf('yaa', 'aa', LAAM) === LAAM + SMALL_ALIF + YAA && cellOf('yaa', 'ee', BAA) === BAA + KASRA + YAA + JAZAM, 'Indo-Pak: the "aa" is a khari zabar on the letter before and a bare yaa; the "ee" yaa has a jazam', cellOf('yaa', 'aa', LAAM));
  check($('.title-mark').textContent === TAA && all('.band-glyph')[1].textContent === LAAM + SMALL_ALIF + YAA, 'the rail follows the script');
  await w.setScript('madani');
  check(cellOf('yaa', 'aa', LAAM) === LAAM + FATHA + YAA + SMALL_ALIF && cellOf('yaa', 'ee', BAA) === BAA + KASRA + YAA, 'Madani: the "aa" has its small alif on the yaa; the "ee" yaa is bare', cellOf('yaa', 'aa', LAAM));

  console.log('\nThe drill');
  check($('.ask').textContent === 'What is this one?', 'the question is "What is this one?"', $('.ask').textContent);
  let q = itemShown();
  check(Boolean(q) && choices().length === 4 && choices().every((c) => c.attrs['data-face'] === 'name') && new Set(choices().map((c) => c.textContent)).size === 4,
    'part 1: four choices, all names, none twice', choices().map((c) => c.textContent).join(' | '));
  check(choices().every((c) => /^Round taa with /.test(c.textContent)), 'all "Round taa with …"', choices().map((c) => c.textContent).join(' | '));
  click(answerFor());
  check(/^Yes — Round taa with .+\.$/.test($('.verdict').textContent), 'right: "Yes — Round taa with …." (the form\'s own name)', $('.verdict').textContent);
  check($('.seat-echo').hidden === true, 'and no line under a right answer');
  await sleep(20);
  q = itemShown();
  const wrong = wrongFor();
  const wrongName = wrong.textContent;
  click(wrong);
  check($('.verdict').textContent === `That one is ${wrongName}. This is ${q.name}.`, 'wrong: says what it is, once, with no scolding', $('.verdict').textContent);
  check($('.seat-echo').hidden === false && $('.seat-echo').querySelectorAll('.seat-echo-form').length === 6 && $('.seat-echo').textContent.startsWith('A round taa, with each mark:'),
    'under a wrong answer about a round taa: all six, with their line', String($('.seat-echo').querySelectorAll('.seat-echo-form').length));
  check(gridTiles().filter((t) => 'data-missed' in t.attrs).map((t) => t.attrs['data-id']).join() === q.id, 'and the form just missed keeps its gold edge on the board, that one cell');
  check($('.rule-row[data-current]').attrs['data-mark'] === q.mark, 'the board\'s row follows the miss');
  check($('.after').hidden === false && $('.after').attrs['data-kind'] === 'wrong' && $('.after-name').textContent === q.name && $('.after-glyph').textContent === q.glyph, 'the strip under a miss names the form and offers Hear it, Say it, Write it and Next');
  click($('.after .trace'));
  check(w.opened.length === 1 && w.opened[0][0] === q.glyph && w.opened[0][1] === q.name && q.glyph.startsWith(LEAD), '"Write it" opens the writing board on the whole form, with its lead', w.opened.map((o) => o.join(' / ')).join());
  click($('.next-question'));
  await sleep(20);
  check($('.seat-echo').hidden === true && !gridTiles().some((t) => 'data-missed' in t.attrs), 'the next question clears the line and the gold edge');

  // Part 2 is the question "which way is it read?": two readings, two choices.
  qaida.setGroup(2);
  await sleep(10);
  q = itemShown();
  check(Boolean(q) && q.kind === 'yaa' && choices().length === 2 && choices().map((c) => c.textContent).sort().join('|') === 'End yaa, read “aa”|End yaa, read “ee”', 'part 2: a yaa, and two choices, "End yaa, read “ee”" and "End yaa, read “aa”"', choices().map((c) => c.textContent).join(' | '));
  const wrongYaa = wrongFor();
  click(wrongYaa);
  check($('.seat-echo').hidden === false && $('.seat-echo').querySelectorAll('.seat-echo-form').length === 2 && $('.seat-echo').textContent.startsWith('The same letters, read two ways:'),
    'a wrong answer about a yaa shows the same letters read two ways', $('.seat-echo').textContent);
  const echoed = $('.seat-echo').querySelectorAll('.seat-echo-form').map((f) => f.textContent);
  check(echoed[0] === q.lead + KASRA + YAA && echoed[1] === q.lead + FATHA + YAA + SMALL_ALIF, 'in Madani: the "ee" one, then the "aa" one, after the letter just asked', echoed.join(' '));
  click($('.next-question'));
  await sleep(20);

  // Every part: the names are right and the question is never the reverse.
  const seen = new Set();
  for (const n of [1, 2, 3]) {
    qaida.setGroup(n);
    await sleep(10);
    for (let i = 0; i < 14; i += 1) {
      const shown = itemShown();
      if (!shown) break;
      seen.add(shown.id);
      click(answerFor());
      click($('.next-question'));
      await sleep(5);
    }
  }
  check(seen.size > 6, 'the drill walks through the forms of every part', String(seen.size));
  qaida.setGroup(1);

  console.log('\nThe names follow the student');
  await w.setNames('zabar');
  check(/^Round taa with (zabar|zair|paish|two zabar|two zair|two paish)$/.test(choices()[0].textContent), 'in the zabar set the choices say zabar, zair, paish', choices().map((c) => c.textContent).join(' | '));
  check($('.rule-grid').querySelectorAll('.rule-head .rule-col').map((c) => c.textContent).join('|') === 'zabar|zair|paish', 'and the grid\'s heads do too', $('.rule-grid').querySelectorAll('.rule-head .rule-col').map((c) => c.textContent).join('|'));
  check($('.prev span').textContent === 'Previous: Hamza', 'and Previous still says Hamza (it has no zabar form)', $('.prev span').textContent);
  await w.setNames('fatha');

  console.log('\nFinishing');
  qaida.clear();
  await sleep(20);
  check(shell.isDone(17) === false, 'nothing is done to begin with');
  qaida.setGroup(1);
  const master = (n) => {
    for (const f of forms.filter((x) => x.parts.includes(n))) for (let i = 0; i < 3; i += 1) shell.recordAnswer(17, kit.idOf(f), true);
  };
  master(1);
  qaida.render();
  await sleep(20);
  check(shell.isDone(17) === false && $('.ready-note').hidden === false, 'part 1 known: the part says you seem ready, and the lesson is not done (part 3 gates it)');
  master(3);
  qaida.setGroup(3);
  await sleep(20);
  check(shell.isDone(17) === true && $('.end-line').textContent.startsWith('You can read a round taa and an end yaa'), 'every form known: the lesson is done, and says so', $('.end-line').textContent);
  check(shell.masteredCount(17) === 14, 'and the home\'s count is the fourteen', String(shell.masteredCount(17)));
  check(shell.drillOf(17).total === 14, 'the home reads the whole lesson\'s total, 14, and not the open part\'s', String(shell.drillOf(17).total));
  qaida.clear();
  await sleep(20);
  check(shell.isDone(17) === false && shell.masteredCount(17) === 0, 'Start again clears it');

  console.log('\nThe walkthrough');
  const units = () => $('.spell-glyph').children.map((u) => u.textContent);
  const stepsOf = () => {
    const captions = [$('.spell-caption').textContent];
    while (!$('.spell-next').hidden && captions.length < 12) { click($('.spell-next')); captions.push($('.spell-caption').textContent); }
    return captions;
  };
  check(all('.word-step').length === 3, 'three walkthrough words');
  check(units().length === 4 && units()[3] === TAA + DAMMATAIN && units()[0] === 'ر' + FATHA, 'word 1: rahmatun, the round taa with two paish last', units().join(' '));
  const c1 = stepsOf();
  const raa = shell.lettersOf().find(([g]) => g === 'ر')[1];
  check(c1.length === 7 && c1[0] === `${raa} with fatha: ra.` && c1[6] === 'The whole word: rahmatun.', 'word 1 takes seven steps and ends on the whole word', c1.join(' / '));
  check(c1[5] === 'Round taa with two damma: tun.', 'the round taa is named for itself, with the mark it carries: "Round taa with two damma: tun." (fatha names)', c1[5]);
  check(/^Haa with sukoon: no vowel|with sukoon/.test(c1[1]) || c1[1].length > 0, 'and the haa with a jazam keeps its own step, as Lesson 14\'s', c1[1]);
  click($('.spell-nextword'));
  check(units().length === 3 && units()[2] === YAA + SMALL_ALIF && units()[1] === 'ل' + FATHA, 'word 2: \'alaa in Madani: the small alif is on the yaa, and the laam keeps its zabar', units().join(' '));
  const c2 = stepsOf();
  check(c2.length === 5 && c2[3] === 'End yaa, read “aa”: a.' && c2[4] === 'The whole word: alaa.', 'word 2: five steps, the yaa says how it is read: "End yaa, read “aa”: a."', c2.join(' / '));
  click($('.spell-nextword'));
  check(units().length === 2 && units()[1] === YAA, 'word 3: fii in Madani, a bare yaa after a zair', units().join(' '));
  const c3 = stepsOf();
  check(c3.length === 3 && c3[1] === 'End yaa, read “ee”: i.' && c3[2] === 'The whole word: fii.', 'word 3: three steps, "End yaa, read “ee”: i."', c3.join(' / '));
  await w.setScript('indopak');
  click(all('.word-step')[1]);
  check(units()[1] === 'ل' + SMALL_ALIF && units()[2] === YAA, 'in Indo-Pak, word 2 has a khari zabar on the laam and a bare yaa (the small alif moves to the letter before)', units().join(' '));
  click(all('.word-step')[2]);
  check(units()[1] === YAA + JAZAM, 'and word 3 has the jazam on the yaa', units().join(' '));
  click(all('.word-step')[0]);
  check(units()[3] === TAA + DAMMATAIN && units()[1] === 'ح' + JAZAM, 'and word 1 is the same but for the jazam on the haa (U+0652 in Indo-Pak)', units().join(' '));
  await w.setScript('madani');

  console.log('\nThe ways out: Previous goes to Lesson 16, Next to Lesson 18');
  check($('.prev').attrs.href === 'lesson-16.html' && $('.prev span').textContent === 'Previous: Hamza', 'Previous goes to Lesson 16', $('.prev span').textContent);
  check($('.spell-more a').attrs.href === 'exercise-17.html' && fs.existsSync(path.join(dir, 'exercise-17.html')), 'Practice reading goes to exercise-17.html, which exists');
  check($('.next span').textContent === 'Next: Al-' && !$('.next').attrs['data-last'], 'Next reads "Next: Al-"', $('.next span').textContent);
  w.location.href = '';
  click($('.next'), 1);
  check(w.location.href === 'lesson-18.html' && fs.existsSync(path.join(dir, 'lesson-18.html')), 'and it goes to lesson-18.html, which is built now (it said "isn\'t built yet" until Lesson 18 existed)', w.location.href);

  console.log('\nThe markup');
  check(!NOMARK.test(w.raw), 'lesson-17.html holds no literal combining mark');
  check(!/[ء-ي]/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<dialog class="chooser"[\s\S]*?<\/dialog>/, '')), 'and no Arabic on the lesson itself: every form is composed by ends.js');
  check(/&#x629;/.test(w.raw), 'the title glyph is the round taa, as a numeric reference');
  check(!NOMARK.test(fs.readFileSync(path.join(dir, 'rule-lesson.js'), 'utf8')) && !NOMARK.test(fs.readFileSync(path.join(dir, 'ends.js'), 'utf8')), 'rule-lesson.js and ends.js hold no literal combining mark');
  const visible = w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|leen|madd|qalqalah|idgham|ikhfa|izhar|ghunna)\b/i.test(visible), 'no scolding and no tajweed word on the page (the plain-names rule; docs/pass-2/03 §4)');
  check(!/\b29\b/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace('Lesson 17 of 29', '')), 'no "29" on the page but the lesson count');
  check((w.raw.match(/data-words(-attr)?=/g) || []).length > 60, 'every line of wording is a text field (data-words / data-words-attr)');
  const wordsAttrOK = [...w.raw.matchAll(/data-words-attr="([^"]*)"/g)].every((m) => m[1].split(';').every((pair) => pair.includes('|')));
  check(wordsAttrOK, 'and every data-words-attr entry is "attribute|label"');
  // Every data- attribute the board reads has a text field (data-words-attr) beside it, so the teacher can edit it.
  const boardTag = w.raw.match(/<section class="marks-board[\s\S]*?>\s*<div class="section-head">/)[0];
  const boardAttrs = [...boardTag.matchAll(/\s(data-[\w-]+)="/g)].map((m) => m[1]).filter((a) => a !== 'data-words-attr');
  const boardFields = boardTag.match(/data-words-attr="([^"]*)"/)[1].split(';').map((p) => p.split('|')[0]);
  check(boardAttrs.every((a) => boardFields.includes(a)), 'every line of the board\'s wording has its own text field', boardAttrs.filter((a) => !boardFields.includes(a)).join(', '));

  console.log('\nThe reading page');
  let ex;
  try {
    ex = run('exercise-17.html', ['shell.js', 'marks.js', 'rules.js', 'ends.js', 'exercise.js'], { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against exercise-17.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  await sleep(20);
  const cells = () => ex.all('.mashq-word');
  check(cells().length === 12 && ex.ctx.qaida.kind === 'exercise' && ex.ctx.qaida.count === 12, 'exercise-17.html has twelve words');
  check(/data-rule="ends"/.test(ex.raw) && !/data-mark=/.test(ex.raw) && /href="lesson-17\.html"/.test(ex.raw) && /data-next-fatha="Next: Al-"/.test(ex.raw) && !/data-last/.test(ex.raw),
    'it teaches the ends rule, goes back to Lesson 17 and on to Lesson 18');
  check(ex.$('.exercise-lede').textContent === 'Twelve words ending in a round taa or an end yaa — read them yourself, no translations.', 'its line says so', ex.$('.exercise-lede').textContent);
  const wordText = () => cells().map((c) => c.children.find((k) => k.attrs.lang === 'ar').textContent);
  check(wordText().slice(0, 6).every((t) => t.includes(TAA)) && wordText().slice(6).every((t) => t.includes(YAA)), 'in Madani six words have a round taa and six an end yaa');
  check(wordText().slice(6, 10).every((t) => t.endsWith(YAA + SMALL_ALIF)) && wordText().slice(10).every((t) => t.endsWith(YAA)) && !wordText().slice(10).some((t) => t.includes(SMALL_ALIF)), 'four end in ى and a small alif, two in a bare ى');
  await ex.setScript('indopak');
  const inIndo = wordText();
  check(inIndo.slice(6, 10).every((t) => t.endsWith(YAA) && t.split(SMALL_ALIF).length === 2 && !t.includes(FATHA + 'ى')),
    'in Indo-Pak the four "aa" words have a khari zabar on the letter before the yaa, and a bare yaa', inIndo.slice(6, 10).join(' '));
  check(inIndo.slice(10).every((t) => t.endsWith(YAA + JAZAM)), 'and the two "ee" words end in a yaa with a jazam');
  check(inIndo.every((t) => !t.includes(cc(0x0623)) && !t.includes(cc(0x0625))), 'and no word holds a Madani alif seat (word 7 starts with a bare alif)');
  check(!NOMARK.test(ex.raw), 'and exercise-17.html holds no literal combining mark');
}

pageHalf().then(() => {
  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
});
