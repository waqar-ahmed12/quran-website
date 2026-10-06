// Checks for Lesson 16's rule layer (rules.js) and, below it, the rule page (rule-lesson.js against the real
// lesson-16.html in a small hand-made DOM). QAIDA-BUILD.md step P2; docs/lesson-16/06 §3.
//
//   node tools/qaida-rules-check.js
//
// The data half loads the real shell.js, practice.js, marks.js and rules.js into a scratch context with an in-memory
// stand-in for localStorage, as tools/qaida-marks-check.js loads marks.js. The page half is at the foot of this file.
//
// The same limits as every other page check: nothing is drawn and no CSS runs, so it cannot tell whether the hamza and its
// vowel are clear of each other at the tile's size, whether the grid overflows at 375px, or how any face draws a form.
// Those were measured in the browser pane at the build (docs/lesson-16/06 §4 is the user's list). What it proves: the
// scripts load against the markup, and that the forms, the ids, the two scripts, the engine's questions, the grid, the
// lines and the ways out do what they say. Prints PASS or FAIL per check; the exit code is the number that failed.
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
  for (const file of ['shell.js', 'practice.js', 'marks.js', 'rules.js']) {
    vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file });
  }
  return { shell: ctx.qaidaShell, practice: ctx.qaidaPractice, marks: ctx.qaidaMarks, rules: ctx.qaidaRules, store };
}

const cc = (...codes) => String.fromCharCode(...codes);
const FATHA = cc(0x064E);
const KASRA = cc(0x0650);
const DAMMA = cc(0x064F);
const FATHATAIN = cc(0x064B);
const JAZAM = cc(0x0652); // as the id spells it and as Indo-Pak draws it
const JAZAM_M = cc(0x06E1); // as Madani draws it
const BAA = cc(0x0628);
const LEAD = BAA + FATHA;
const ALIF_HAMZA = cc(0x0623);
const ALIF_HAMZA_BELOW = cc(0x0625);
const ALIF = cc(0x0627);
const HAMZA = cc(0x0621);
const WOW_HAMZA = cc(0x0624);
const YAA_HAMZA = cc(0x0626);

const FORM_TO_NAME = { id: 'form-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0 };

console.log('The data layer: rules.js');
{
  const { shell, marks, rules } = boot();
  const forms = rules.formsOf();

  // The fifteen forms, the seats, the parts.
  check(rules.RULES.hamza.id === 'hamza' && rules.RULES.hamza.lesson === 16 && rules.RULES.hamza.parts === 4, 'one rule, "hamza", lesson 16, four parts');
  check(forms.length === 15, 'fifteen forms', String(forms.length));
  const bySeat = (seat) => forms.filter((f) => f.seat === seat).map((f) => f.mark).join();
  check(bySeat('alif') === 'fatha,kasra,damma,sukun' && bySeat('line') === 'fatha,kasra,damma,fathatain,sukun'
    && bySeat('wow') === 'fatha,damma,sukun' && bySeat('yaa') === 'fatha,kasra,sukun', 'the seats and their marks, as docs/lesson-16/01 §2 has them');
  check(forms.every((f) => marks.markOf(f.mark)), 'every form\'s mark is a real MARKS id');
  check(forms.every((f) => ['fatha', 'zabar'].every((set) => marks.markOf(f.mark).names[set])), 'and has a name in both name sets');
  check(forms.every((f) => f.parts.includes(4)), 'every form is in part 4');
  const items = rules.itemsFor(shell);
  check(JSON.stringify(marks.sizes(items, [1, 2, 3, 4])) === '[3,4,6,15]', 'the four parts hold 3, 4, 6 and 15', JSON.stringify(marks.sizes(items, [1, 2, 3, 4])));
  check(forms.filter((f) => f.parts.includes(1)).every((f) => f.seat === 'alif') && forms.filter((f) => f.parts.includes(2)).every((f) => f.seat === 'line')
    && forms.filter((f) => f.parts.includes(3)).every((f) => f.seat === 'wow' || f.seat === 'yaa'), 'part 1 is the alif seat, part 2 the line, part 3 the wow and the yaa');
  const onlyLast = forms.filter((f) => f.parts.length === 1);
  check(forms.filter((f) => f.parts.length === 2).every((f) => f.parts[1] === 4) && onlyLast.length === 2 && onlyLast.every((f) => f.mark === 'sukun' && (f.seat === 'alif' || f.seat === 'line')),
    'a form is met in one part and again in part 4; only the jazam on the alif and on the line are met in part 4 alone');

  // Ids: fifteen, distinct, two characters, the same in both scripts, and never the lead or a drawn jazam.
  const ids = forms.map((f) => rules.idOf(f));
  check(new Set(ids).size === 15 && ids.every((id) => id.length === 2), 'fifteen distinct ids, all two characters (a seat and one mark)');
  const madani = boot();
  const indopak = boot();
  indopak.shell.state.script = 'indopak';
  const idsIn = (w) => w.rules.itemsFor(w.shell).map((item) => item.id);
  check(JSON.stringify(idsIn(madani)) === JSON.stringify(idsIn(indopak)), 'the same ids in both scripts: the glyphs differ, the ids do not');
  check(ids.every((id) => !id.includes(BAA) && !id.includes(JAZAM_M)) && ids.filter((id) => id.endsWith(JAZAM)).length === 4, 'no id holds the lead or the Madani jazam; four end in U+0652');
  check(ids.every((id) => !id.includes(cc(0x0627))), 'and none is built from the Indo-Pak bare alif (the id is the Madani seat)');
  check(ids.includes(ALIF_HAMZA_BELOW + KASRA) && ids.includes(ALIF_HAMZA + FATHA), 'the alif seat\'s zair id is the below-form seat (U+0625), as docs/lesson-16/03 §2 says');

  // The drawing, per script.
  const drawn = (w, seat, mark) => w.rules.glyphOf(w.rules.formsOf().find((f) => f.seat === seat && f.mark === mark), w.shell.state.script);
  check(drawn(madani, 'alif', 'fatha') === ALIF_HAMZA + FATHA && drawn(madani, 'alif', 'kasra') === ALIF_HAMZA_BELOW + KASRA && drawn(madani, 'alif', 'damma') === ALIF_HAMZA + DAMMA,
    'Madani draws the alif seat as the hamza on alif, and the zair one as the hamza below it');
  check(['fatha', 'kasra', 'damma'].every((m) => drawn(indopak, 'alif', m) === ALIF + cc(marks.MARKS[m].cp)), 'Indo-Pak draws the alif seat as a bare alif carrying the vowel', ['fatha', 'kasra', 'damma'].map((m) => drawn(indopak, 'alif', m)).join(' '));
  check(drawn(madani, 'line', 'fatha') === HAMZA + FATHA && drawn(indopak, 'line', 'fatha') === HAMZA + FATHA && drawn(madani, 'line', 'fathatain') === HAMZA + FATHATAIN, 'the line: the same in both');
  check(drawn(madani, 'wow', 'damma') === WOW_HAMZA + DAMMA && drawn(indopak, 'wow', 'damma') === WOW_HAMZA + DAMMA && drawn(madani, 'yaa', 'kasra') === YAA_HAMZA + KASRA && drawn(indopak, 'yaa', 'kasra') === YAA_HAMZA + KASRA,
    'the wow and yaa seats are the ordinary letters in both scripts');
  check(drawn(madani, 'wow', 'sukun') === WOW_HAMZA + JAZAM_M && drawn(indopak, 'wow', 'sukun') === WOW_HAMZA + JAZAM
    && drawn(madani, 'alif', 'sukun') === ALIF_HAMZA + JAZAM_M && drawn(indopak, 'alif', 'sukun') === ALIF + JAZAM, 'the Madani jazam is U+06E1 and the Indo-Pak one U+0652, and an Indo-Pak alif with a jazam is a hamza with a jazam');
  const indopakGlyphs = indopak.rules.itemsFor(indopak.shell).map((item) => item.glyph);
  check(indopakGlyphs.every((g) => !g.includes(ALIF_HAMZA) && !g.includes(ALIF_HAMZA_BELOW)), 'no Madani alif seat (U+0623, U+0625) in any Indo-Pak drawing');
  const madaniGlyphs = madani.rules.itemsFor(madani.shell).map((item) => item.glyph);
  check(madaniGlyphs.every((g) => !g.includes(JAZAM)), 'and no U+0652 in any Madani drawing: Madani draws the jazam as U+06E1');

  // The lead: in front of every jazam form and only those.
  const leadForms = forms.filter((f) => rules.leadOf(f));
  check(leadForms.length === 4 && leadForms.every((f) => f.mark === 'sukun' && rules.leadOf(f) === LEAD), 'the lead (baa with zabar) is on the four jazam forms and only those');
  check(items.every((item) => item.glyph.startsWith(LEAD) === (item.mark === 'sukun')), 'and every jazam item is drawn after it, every other one is not');
  check(forms.every((f) => rules.drawnOf(f, 'madani') === rules.leadOf(f) + rules.glyphOf(f, 'madani')), 'drawnOf is the lead then the form');

  // Names: one template, five distinct.
  const names = items.map((item) => item.name);
  check(new Set(names).size === 5, 'five distinct names across the fifteen: zabar, zair, paish, two zabar, jazam', [...new Set(names)].join(' | '));
  check(names.every((name) => /^Hamza with /.test(name) && !/alif|line|wow|yaa|seat/i.test(name)), 'the short names, and the seat is never in a name');
  const zabarNames = boot({ v: 1, chosen: true, script: 'madani', names: 'zabar', grouping: 'families' });
  const zn = zabarNames.rules.itemsFor(zabarNames.shell).map((i) => i.name);
  check(zn.includes('Hamza with zabar') && zn.includes('Hamza with two zabar') && zn.includes('Hamza with paish') && zn.includes('Hamza with a jazam'), 'in the zabar set: zabar, two zabar, paish, a jazam');
  const fathaNames = boot({ v: 1, chosen: true, script: 'madani', names: 'fatha', grouping: 'families' });
  const fn = fathaNames.rules.itemsFor(fathaNames.shell).map((i) => i.name);
  check(fn.includes('Hamza with fatha') && fn.includes('Hamza with two fatha') && fn.includes('Hamza with damma') && fn.includes('Hamza with a sukoon'), 'in the fatha set: fatha, two fatha, damma, a sukoon');
  fathaNames.shell.state.names = 'zabar';
  fathaNames.rules.rename(items, fathaNames.shell);
  check(new Set(items.map((i) => i.name)).size === 5 && items.every((i) => /^Hamza with /.test(i.name)), 'rename() rewrites every name in place');

  // Audio: the seat is never read, so every seat of a mark shares one recording.
  const audioKinds = (mark) => [...new Set(rules.itemsFor(shell).filter((i) => i.mark === mark).map((i) => i.audio.kind + i.audio.glyph))];
  check(['fatha', 'kasra', 'damma', 'fathatain'].every((m) => audioKinds(m).length === 1 && audioKinds(m)[0] === m + ALIF), 'zabar, zair, paish and two zabar reuse the sound of Lessons 4-7 on alif, on every seat');
  check(audioKinds('sukun').length === 1 && audioKinds('sukun')[0] === 'hamza-jazam' + HAMZA, 'and every jazam form shares one new recording, hamza-jazam, on hamza');

  // The grid: 5 rows by 4 seats, fifteen forms, five dashes.
  const grid = rules.gridOf();
  check(grid.length === 5 && grid.every((row) => row.cells.length === 4) && grid.map((r) => r.mark).join() === 'fatha,kasra,damma,fathatain,sukun', 'the grid is five rows (the marks) by four seats');
  check(grid.flatMap((r) => r.cells).filter(Boolean).length === 15 && grid.flatMap((r) => r.cells).filter((c) => !c).length === 5, 'fifteen forms and five dashes');
  const dashes = grid.map((r) => r.cells.map((c) => (c ? 'x' : '-')).join(''));
  check(dashes.join() === 'xxxx,xx-x,xxx-,-x--,xxxx', 'the dashes are where the plan has them: kasra on no wow, paish on no yaa, two zabar only on the line', dashes.join(','));

  // seatOf: the words' hook. A script-correct glyph for the four seat keys, null for everything else.
  check(rules.seatOf(ALIF_HAMZA, 'madani') === ALIF_HAMZA && rules.seatOf(ALIF_HAMZA, 'indopak') === ALIF && rules.seatOf(ALIF_HAMZA_BELOW, 'madani') === ALIF_HAMZA_BELOW && rules.seatOf(ALIF_HAMZA_BELOW, 'indopak') === ALIF,
    'seatOf gives the Madani alif seats, and the bare alif in Indo-Pak');
  check(rules.seatOf(WOW_HAMZA, 'indopak') === WOW_HAMZA && rules.seatOf(YAA_HAMZA, 'madani') === YAA_HAMZA, 'and the wow and yaa seats in both');
  const letters = shell.lettersOf('madani').map(([g]) => g).concat(shell.lettersOf('indopak').map(([g]) => g));
  check(letters.every((g) => rules.seatOf(g, 'madani') === null && rules.seatOf(g, 'indopak') === null), 'and null for every one of the 29 letters, in both scripts (so no earlier word can change)');
  check(rules.seatOf('') === null && rules.seatOf('ab') === null, 'and for what is not a key');

  // No literal combining mark in any file of the lesson.
  for (const file of ['rules.js']) {
    check(!/[ً-ْٗ٠-٩ۡۥۦ]/.test(fs.readFileSync(path.join(dir, file), 'utf8')), `${file} holds no literal combining mark or small letter`);
  }
}

console.log('\nMastery');
{
  // masteredCount(16): one mastered form counts one, and switching script keeps the credit.
  const w = boot();
  const first = w.rules.itemsFor(w.shell)[0];
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(16, first.id, true);
  check(w.shell.masteredCount(16) === 1, 'masteredCount(16) counts one mastered form', String(w.shell.masteredCount(16)));
  const two = w.rules.itemsFor(w.shell)[3];
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(16, two.id, true);
  check(w.shell.masteredCount(16) === 2, 'and two, when two are mastered', String(w.shell.masteredCount(16)));
  check([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].every((n) => w.shell.masteredCount(n) === 0), 'none of it counts toward another lesson');
  const switched = boot();
  const inMadani = switched.rules.itemsFor(switched.shell).find((item) => item.mark === 'sukun' && item.seat === 'wow');
  for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(16, inMadani.id, true);
  switched.shell.state.script = 'indopak';
  const inIndoPak = switched.rules.itemsFor(switched.shell).find((item) => item.mark === 'sukun' && item.seat === 'wow');
  check(inIndoPak.id === inMadani.id && inIndoPak.glyph !== inMadani.glyph && switched.rules.stats(switched.shell, 16, [inIndoPak], 4, { target: 3 }).known === 1,
    'the wow with a jazam keeps its credit after a switch to Indo-Pak, though it is drawn with another jazam');
  const back = boot();
  back.shell.state.script = 'indopak';
  const fromIndo = back.rules.itemsFor(back.shell).find((item) => item.mark === 'kasra' && item.seat === 'alif');
  for (let k = 0; k < 3; k += 1) back.shell.recordAnswer(16, fromIndo.id, true);
  back.shell.state.script = 'madani';
  const toMadani = back.rules.itemsFor(back.shell).find((item) => item.mark === 'kasra' && item.seat === 'alif');
  check(toMadani.id === fromIndo.id && back.rules.stats(back.shell, 16, [toMadani], 4, { target: 3 }).known === 1, 'and the alif with zair going the other way, Indo-Pak to Madani');
}

console.log('\nThe recordings: one new row');
{
  const audioCtx = vm.createContext({
    document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: async () => ({ ok: false }),
    setTimeout, clearTimeout,
  });
  audioCtx.window = audioCtx;
  for (const file of ['shell.js', 'marks.js', 'rules.js', 'audio.js']) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  const rows = audioCtx.qaidaAudio.wanted();
  const mine = rows.filter((row) => row.kind === 'hamza-jazam');
  check(mine.length === 1 && mine[0].glyph === HAMZA && mine[0].key === HAMZA, 'the recordings page lists ONE hamza-jazam row, on hamza alone (not one per seat)', String(mine.length));
  check(mine.length === 1 && mine[0].display === LEAD + HAMZA + JAZAM_M && /a'.*baa with zabar, then a hamza with a jazam/.test(mine[0].say), 'shown as baa with zabar then a hamza with a jazam, and the teacher told what to say', mine[0] && `${mine[0].display} | ${mine[0].say}`);
  check(rows.length === 365 + 81 + 1, 'so the page lists 447 rows in all', String(rows.length));
  check(rows.filter((row) => row.kind !== 'hamza-jazam').length === 446, 'and nothing else moved: the other 446 are Lesson 15\'s', String(rows.length - 1));
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'audio', 'manifest.json'), 'utf8'));
  check(manifest['hamza-jazam'] !== undefined, 'manifest.json has the hamza-jazam group');
  const html = fs.readFileSync(path.join(dir, 'recordings.html'), 'utf8');
  check(/rules\.js/.test(html) && html.indexOf('rules.js') < html.indexOf('audio.js'), 'recordings.html loads rules.js before audio.js, so the row is listed');
}

console.log('\nThe engine: questions on every part');
{
  const w = boot();
  const items = w.rules.itemsFor(w.shell);
  const expectNames = { 1: 3, 2: 4, 3: 4, 4: 5 };
  let asked = 0;
  let sameAnswer = 0;
  let sameName = 0;
  let notOwn = 0;
  let starved = 0;
  let shortOfChoices = 0;
  let reversed = 0;
  let rightMissing = 0;
  for (const n of [1, 2, 3, 4]) {
    const pool = w.rules.poolFor(items, n);
    check(new Set(pool.map((i) => i.name)).size === expectNames[n], `part ${n}: ${pool.length} forms and ${expectNames[n]} distinct names`, `${pool.length} / ${new Set(pool.map((i) => i.name)).size}`);
    const drill = w.practice.create({
      lesson: 16, items: pool, formats: [FORM_TO_NAME], random: seeded(31 + n), familyFirst: false,
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
      if (q.choices.length !== Math.min(4, expectNames[n])) shortOfChoices += 1;
      if (q.format.ask !== 'glyph' || q.format.answerWith !== 'name') reversed += 1;
      if (!ids.includes(q.item.id)) rightMissing += 1;
      if (!pool.some((p) => p.id === q.item.id)) notOwn += 1;
      drill.answer(q.item.id);
      drill.next();
    }
  }
  check(asked === 400 && starved === 0, '400 questions through the real engine, on all four parts, and no part starves', `${asked} asked, ${starved} starved`);
  check(sameAnswer === 0, 'never the same answer twice in one question', String(sameAnswer));
  check(sameName === 0, 'and never two choices with the same name, so the right answer\'s name is unique in its choices', String(sameName));
  check(shortOfChoices === 0, 'every question offers four choices (three on part 1, which has three names)', String(shortOfChoices));
  check(reversed === 0, 'no question is NAME_TO_FORM or SOUND_TO_FORM: two pictures honestly have one name', String(reversed));
  check(rightMissing === 0 && notOwn === 0, 'the right answer is always among the choices, and always one of the part\'s own forms');

  // The engine's own answer: naming a form by its name is right for any seat that shares it.
  const drill = w.practice.create({ lesson: 16, items: w.rules.poolFor(items, 4), formats: [FORM_TO_NAME], random: seeded(3), familyFirst: false });
  drill.start();
  const q = drill.question;
  const verdict = drill.answer(q.choices.find((c) => c.id === q.item.id).id);
  check(verdict.right === true && verdict.item.id === q.item.id, 'and answering with the right choice is right');
}

console.log('\nThe words');
{
  const w = boot();
  for (const file of ['spell.js', 'exercise.js']) {
    check(/qaidaRules/.test(fs.readFileSync(path.join(dir, file), 'utf8')), `${file} reaches rules.js through the seat hook`);
  }
  check(w.rules.seatOf(ALIF_HAMZA, 'indopak') !== ALIF_HAMZA, 'the Indo-Pak seat is never a Madani one, so the words cannot leave one on the Indo-Pak page');
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

const nodeLoad = ['shell.js', 'audio.js', 'practice.js', 'marks.js', 'rules.js', 'rule-lesson.js', 'spell.js'];
const NOMARK = /[ً-ْٰٗۖ-ۭ]/; // a literal combining mark or small Quranic letter

async function pageHalf() {
  let w;
  try {
    w = run('lesson-16.html', nodeLoad, { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against lesson-16.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  check(true, 'shell.js, audio.js, practice.js, marks.js, rules.js, rule-lesson.js and spell.js load against lesson-16.html without an error');
  await sleep(20);
  const { $, all, click, shell, marks, rules, htmlEl } = w;
  const qaida = w.ctx.qaida;
  qaida.setPause(1);
  const forms = rules.formsOf();
  const formOf = (seat, mark) => forms.find((f) => f.seat === seat && f.mark === mark);
  const drawnIn = (form, script) => rules.drawnOf(form, script);
  const tiles = () => all('.rule-cell');
  const gridTiles = () => $('.rule-grid').querySelectorAll('.rule-cell');
  const rail = () => all('.band');
  const choices = () => $('.choices').children;
  const itemShown = () => rules.itemsFor(shell).find((it) => it.glyph === ($('.prompt-glyph') ? $('.prompt-glyph').textContent : ''));
  const answerFor = () => choices().find((c) => c.attrs['data-id'] === itemShown().id);
  const wrongFor = () => choices().find((c) => c !== answerFor());

  console.log('\nThe page');
  check(qaida.kind === 'drill' && qaida.rule === 'hamza' && qaida.hasOther === false && qaida.otherCount === 0 && qaida.hasTail === false && qaida.markCount === 1 && qaida.review === 0,
    'publishes window.qaida with kind "drill" and rule "hamza", and nothing to be told apart from, no tails, no review');
  check(htmlEl.attrs['data-rule'] === 'hamza' && htmlEl.attrs['data-point'] === 'none' && htmlEl.attrs['data-mark'] === undefined, 'the page teaches the hamza rule, with no halo and no mark');
  check(JSON.stringify(qaida.groupCosts().map((p) => p.items)) === '[3,4,6,15]', 'groupCosts() is 3, 4, 6 then 15', JSON.stringify(qaida.groupCosts().map((p) => p.items)));
  check(rail().length === 4 && rail().every((b) => b.attrs.disabled === undefined), 'four parts, all enabled: nothing is locked');
  check(qaida.parts.map((p) => p.name).join('|') === 'On an alif|On the line|On a wow and a yaa|All the forms', 'the four parts are named by seat', qaida.parts.map((p) => p.name).join('|'));

  // The members the options panel reads (docs/lesson-16/06 §2, step 5): a missing one throws in the panel and takes the page down.
  const panel = fs.readFileSync(path.join(dir, 'qaida-options.js'), 'utf8');
  const drillBranch = panel.slice(panel.indexOf("lesson.kind === 'drill'"), panel.indexOf("lesson.kind === 'exercise'"));
  const read = [...new Set([...drillBranch.matchAll(/\blesson\.(\w+)/g)].map((m) => m[1]))];
  const lesson3Only = ['setBand', 'bandTotals', 'setDrilled']; // read only under `shapes`, which a rule page is not
  const assigned = ['onCosts']; // the panel writes it, it does not read it
  const missing = read.filter((name) => !lesson3Only.includes(name) && !assigned.includes(name) && !(name in qaida));
  check(read.length > 20 && missing.length === 0, `every window.qaida member the panel reads exists (${read.length} read)`, missing.join(', '));

  console.log('\nThe head');
  check($('h1').textContent === 'Hamza' && w.doc.title.startsWith('Lesson 16: Hamza'), 'the title is Hamza in both name sets', $('h1').textContent + ' / ' + w.doc.title);
  check($('.title-mark').textContent === drawnIn(formOf('alif', 'fatha'), 'madani'), 'the big glyph is the alif seat with zabar', $('.title-mark').textContent);
  const glyphs = all('.band-glyph').map((g) => g.textContent);
  check(glyphs.join() === [['alif', 'fatha'], ['line', 'fatha'], ['wow', 'fatha'], ['yaa', 'kasra']].map(([s, m]) => rules.glyphOf(formOf(s, m), 'madani')).join(),
    'the rail shows a hamza on an alif, on the line, on a wow, then on a yaa with zair', glyphs.join(' | '));
  check($('.eyebrow').textContent === 'Lesson 16 of 29' && all('.track li').length === 29 && all('.track li').findIndex((li) => li.classes().includes('now')) === 15,
    'Lesson 16 of 29, the sixteenth of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '15', 'the bar\'s total is the fifteen forms', $('.bar').attrs['aria-valuemax']);
  check(!$('.pairs') && !$('.pair-feature') && !$('.halo') && !$('.jazam-note') && !$('.mark-alone') && !$('.joined'), 'none of a mark lesson\'s board is on this page');

  console.log('\nThe board: the seats and the grid');
  const strip = $('.seat-strip').querySelectorAll('.rule-cell');
  check(strip.length === 4 && strip.every((t) => t.attrs['data-mark'] === 'fatha') && strip.map((t) => t.attrs['data-seat']).join() === 'alif,line,wow,yaa', 'the seat strip has four tiles, one per seat, each with zabar');
  check($('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|') === 'an alif|the line|a wow|a yaa', 'captioned "an alif", "the line", "a wow", "a yaa"');
  check($('.seat-note').textContent === 'The seat only holds the hamza up. It is never read.', 'and the line under them says what a seat is', $('.seat-note').textContent);
  const rows = $('.rule-grid').querySelectorAll('.rule-row').filter((r) => !r.classes().includes('rule-head'));
  check(rows.length === 5 && rows.map((r) => r.attrs['data-mark']).join() === 'fatha,kasra,damma,fathatain,sukun', 'the grid has five rows, one per mark');
  check(gridTiles().length === 15 && $('.rule-grid').querySelectorAll('.rule-dash').length === 5, 'fifteen cells and five dashes');
  check($('.rule-grid').querySelectorAll('.rule-head .rule-col').map((c) => c.textContent).join('|') === 'alif|the line|wow|yaa', 'the column heads are the four seats');
  check(rows.map((r) => r.querySelector('.rule-name').textContent).join('|') === 'with fatha|with kasra|with damma|with two fatha|with a sukoon', 'the row names are the student\'s own words', rows.map((r) => r.querySelector('.rule-name').textContent).join('|'));
  check(rows.map((r) => r.querySelector('.rule-sound').textContent).join(' ') === '“a” “i” “u” “an” “a\'”', 'and each row says its sound', rows.map((r) => r.querySelector('.rule-sound').textContent).join(' '));
  const later = () => gridTiles().filter((t) => t.attrs['data-state'] === 'later').length;
  check(later() === 12, 'part 1: twelve cells are dim, "comes later"; the map is all there', String(later()));
  qaida.setGroup(2);
  check(later() === 8 && gridTiles().length === 15, 'part 2: eight dim, and the grid has not changed shape', String(later()));
  qaida.setGroup(3);
  check(later() === 2, 'part 3: two dim (the jazam on the alif and on the line)', String(later()));
  qaida.setGroup(4);
  check(later() === 0, 'part 4: none dim', String(later()));
  qaida.setGroup(1);
  check($('.rule-grid').querySelectorAll('.rule-cell').every((t) => t.tag === 'button'), 'a dim cell is a button all the same: nothing is locked');
  check(gridTiles().every((t) => /^Hamza with .+, on (alif|the line|wow|yaa)$/.test(t.attrs['aria-label'])), 'every cell is named for a screen reader, with its mark and its seat', gridTiles()[0].attrs['aria-label']);

  console.log('\nThe board: the same-sound line, the script lines and the lead line');
  check($('.same-line').textContent === 'All of these say “a”. Only the hamza is read.', 'the line under the grid starts on the first row', $('.same-line').textContent);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'kasra' && t.attrs['data-seat'] === 'yaa'));
  check($('.same-line').textContent === 'All of these say “i”. Only the hamza is read.', 'tapping a cell of another row changes it', $('.same-line').textContent);
  check($('.rule-row[data-current]').attrs['data-mark'] === 'kasra' && all('.rule-row').filter((r) => 'data-current' in r.attrs).length === 1, 'and the row it is about is the one lit');
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'sukun' && t.attrs['data-seat'] === 'wow'));
  check(/a catch in the throat, after a vowel/.test($('.same-line').textContent) && /“a'”/.test($('.same-line').textContent), 'a jazam row says it is a catch in the throat, after a vowel', $('.same-line').textContent);
  check(/small hamza sign/.test($('.script-line').textContent) && !/reading it since the start/.test($('.script-line').textContent), 'the Madani student sees the Madani line, and only that');
  check($('.lead-line').hidden === true, 'the lead line is not shown in part 1');
  qaida.setGroup(2);
  check($('.lead-line').hidden === true, 'nor in part 2');
  qaida.setGroup(3);
  check($('.lead-line').hidden === false && /baa with fatha/.test($('.lead-line').textContent), 'it is shown in part 3, in the student\'s own word for zabar', $('.lead-line').textContent);
  qaida.setGroup(4);
  check($('.lead-line').hidden === false, 'and in part 4');
  qaida.setGroup(1);
  await w.setScript('indopak');
  check(/You have been reading it since the start/.test($('.script-line').textContent) && !/small hamza sign/.test($('.script-line').textContent), 'the Indo-Pak student sees the Indo-Pak line, and only that', $('.script-line').textContent);
  check(/^An alif with a vowel on it is a hamza/.test($('.script-line').textContent), 'it says an alif with a vowel is a hamza');

  console.log('\nThe two scripts');
  const cellOf = (seat, mark) => gridTiles().find((t) => t.attrs['data-seat'] === seat && t.attrs['data-mark'] === mark).querySelector('.glyph').textContent;
  check(cellOf('alif', 'fatha') === ALIF + FATHA && cellOf('alif', 'kasra') === ALIF + KASRA, 'Indo-Pak: the alif seat is a bare alif carrying the vowel', cellOf('alif', 'fatha'));
  check(cellOf('wow', 'sukun') === LEAD + WOW_HAMZA + JAZAM && cellOf('alif', 'sukun') === LEAD + ALIF + JAZAM, 'Indo-Pak: a jazam form is the baa, then the seat with U+0652 (an alif with a jazam is a hamza)');
  check(!w.all('.glyph').some((g) => g.textContent.includes(ALIF_HAMZA) || g.textContent.includes(ALIF_HAMZA_BELOW)) && !$('.title-mark').textContent.includes(ALIF_HAMZA), 'and no Madani alif seat anywhere on the page');
  check($('.title-mark').textContent === ALIF + FATHA && all('.band-glyph')[0].textContent === ALIF + FATHA, 'the title glyph and the rail follow the script');
  await w.setScript('madani');
  check(cellOf('alif', 'fatha') === ALIF_HAMZA + FATHA && cellOf('alif', 'kasra') === ALIF_HAMZA_BELOW + KASRA && cellOf('wow', 'sukun') === LEAD + WOW_HAMZA + JAZAM_M,
    'Madani: the hamza on alif, the zair one below it, and the jazam drawn as U+06E1', cellOf('alif', 'fatha'));

  console.log('\nThe drill');
  check($('.ask').textContent === 'What is on this one?', 'the question is "What is on this one?"', $('.ask').textContent);
  let q = itemShown();
  check(Boolean(q) && choices().length === 3 && choices().every((c) => c.attrs['data-face'] === 'name' && !$('.choices').querySelector('.choice-glyph')), 'part 1: three choices, all names, never a picture', String(choices().length));
  check(new Set(choices().map((c) => c.textContent)).size === choices().length && choices().every((c) => /^Hamza with /.test(c.textContent)), 'no name twice, all "Hamza with …"', choices().map((c) => c.textContent).join(' | '));
  const rightChoice = answerFor();
  click(rightChoice);
  check(/^Yes — Hamza with (fatha|kasra|damma)\.$/.test($('.verdict').textContent), 'right: "Yes — Hamza with fatha." (the form\'s own name)', $('.verdict').textContent);
  check($('.seat-echo').hidden === true, 'and no seat line under a right answer');
  await sleep(20);
  q = itemShown();
  const wrong = wrongFor();
  const wrongName = wrong.textContent;
  click(wrong);
  const said = $('.verdict').textContent;
  check(said === `That one is ${wrongName}. This is ${q.name}. The seat is not read.`, 'wrong: says what it is, and "The seat is not read." once, with no scolding', said);
  check($('.seat-echo').hidden === false && $('.seat-echo').querySelectorAll('.seat-echo-form').length === rules.gridOf().find((r) => r.mark === q.mark).cells.filter(Boolean).length,
    'under a wrong answer, the same sound on every seat that has it', String($('.seat-echo').querySelectorAll('.seat-echo-form').length));
  check($('.seat-echo').textContent.startsWith('The same sound on every seat:'), 'with its line');
  check(gridTiles().filter((t) => 'data-missed' in t.attrs).map((t) => t.attrs['data-id']).join() === q.id, 'and the form just missed keeps its gold edge on the board, that one cell', gridTiles().filter((t) => 'data-missed' in t.attrs).length + ' marked');
  check($('.rule-row[data-current]').attrs['data-mark'] === q.mark, 'the board\'s row follows the miss');
  check($('.after').hidden === false && $('.after').attrs['data-kind'] === 'wrong' && $('.after-name').textContent === q.name && $('.after-glyph').textContent === q.glyph, 'the strip under a miss names the form and offers Hear it, Say it, Write it and Next');
  click($('.after .trace'));
  check(w.opened.length === 1 && w.opened[0][0] === q.glyph && w.opened[0][1] === q.name, '"Write it" opens the writing board on the whole form', w.opened.map((o) => o.join(' / ')).join());
  click($('.next-question'));
  await sleep(20);
  check($('.seat-echo').hidden === true && !gridTiles().some((t) => 'data-missed' in t.attrs), 'the next question clears the seat line and the gold edge');

  // Every part: right names, a jazam form says "a jazam", the question is never NAME_TO_FORM.
  const seen = new Set();
  const nameByForm = (f) => rules.itemsFor(shell).find((it) => it.id === rules.idOf(f)).name;
  for (const n of [1, 2, 3, 4]) {
    qaida.setGroup(n);
    await sleep(10);
    for (let i = 0; i < 12; i += 1) {
      const shown = itemShown();
      if (!shown) break;
      seen.add(shown.id);
      if (shown.mark === 'sukun') {
        click(answerFor());
        check(/^Yes — Hamza with a sukoon\.$/.test($('.verdict').textContent), `part ${n}: a jazam form is "Hamza with a sukoon"`, $('.verdict').textContent);
        break;
      }
      click(answerFor());
      click($('.next-question')); // not shown after a right answer with a pointer: harmless if hidden
      await sleep(5);
    }
  }
  check(seen.size > 3, 'the drill walks through the forms of every part', String(seen.size));
  qaida.setGroup(1);

  console.log('\nThe names follow the student');
  await w.setNames('zabar');
  check(/^Hamza with (zabar|zair|paish)$/.test(choices()[0].textContent) && rows.length === 5, 'in the zabar set the choices say zabar, zair, paish', choices().map((c) => c.textContent).join(' | '));
  check($('.rule-grid').querySelectorAll('.rule-name').map((n) => n.textContent).join('|') === 'with zabar|with zair|with paish|with two zabar|with a jazam', 'and the grid\'s rows do too', $('.rule-grid').querySelectorAll('.rule-name').map((n) => n.textContent).join('|'));
  check($('.prev span').textContent === 'Previous: Tashdeed', 'and Previous follows the names', $('.prev span').textContent);
  await w.setNames('fatha');
  check($('.prev span').textContent === 'Previous: Shadda', 'and back again', $('.prev span').textContent);

  console.log('\nFinishing');
  qaida.clear();
  await sleep(20);
  check(shell.isDone(16) === false, 'nothing is done to begin with');
  qaida.setGroup(1);
  const known = (id) => shell.drillOf(16).streak[id] || 0;
  const master = (n) => {
    for (const f of forms.filter((x) => x.parts.includes(n))) for (let i = 0; i < 3; i += 1) shell.recordAnswer(16, rules.idOf(f), true);
  };
  master(1);
  qaida.render();
  await sleep(20);
  check(shell.isDone(16) === false && $('.ready-note').hidden === false, 'part 1 known: the part says you seem ready, and the lesson is not done (part 4 gates it)');
  master(4);
  qaida.setGroup(4);
  await sleep(20);
  check(shell.isDone(16) === true && $('.end-line').textContent.startsWith('You can read a hamza on any seat'), 'every form known: the lesson is done, and says so', $('.end-line').textContent);
  check(shell.masteredCount(16) === 15 && known(rules.idOf(forms[0])) >= 2, 'and the home\'s count is the fifteen', String(shell.masteredCount(16)));
  const cardTotal = shell.drillOf(16).total;
  check(cardTotal === 15, 'the home reads the whole lesson\'s total, 15, and not the open part\'s', String(cardTotal));
  qaida.clear();
  await sleep(20);
  check(shell.isDone(16) === false && shell.masteredCount(16) === 0, 'Start again clears it');

  console.log('\nThe walkthrough');
  const units = () => $('.spell-glyph').children.map((u) => u.textContent);
  check(all('.word-step').length === 3, 'three walkthrough words');
  check(units()[1] === ALIF_HAMZA + FATHA && units().length === 3, 'word 1: sa\'ala, the hamza on an alif in Madani', units().join(' '));
  let steps = 1;
  const seenCaptions = [$('.spell-caption').textContent];
  while (!$('.spell-next').hidden && steps < 12) { click($('.spell-next')); steps += 1; seenCaptions.push($('.spell-caption').textContent); }
  check(steps === 5, 'word 1 takes five steps', String(steps));
  const seenName = shell.lettersOf().find(([g]) => g === cc(0x0633))[1];
  check(seenCaptions[1] === "Hamza with fatha: 'a." && seenCaptions[0] === `${seenName} with fatha: sa.`, 'the hamza has a line of its own: "Hamza with fatha: \'a." (the seat is never named)', seenCaptions.join(' / '));
  check(seenCaptions[2] === "Put together: sa'a." && seenCaptions[4] === 'The whole word: sa\'ala.', 'and the blends join it: "sa\'a", then the whole word', seenCaptions.join(' / '));
  click($('.spell-nextword'));
  const ws = [];
  ws.push($('.spell-caption').textContent);
  let s2 = 1;
  while (!$('.spell-next').hidden && s2 < 12) { click($('.spell-next')); s2 += 1; ws.push($('.spell-caption').textContent); }
  check(units()[1] === WOW_HAMZA + JAZAM_M && s2 === 7, 'word 2: mu\'minun, seven steps, the wow seat with a jazam (U+06E1 in Madani)', `${units()[1] === WOW_HAMZA + JAZAM_M} ${s2}`);
  check(ws[1] === "Hamza with sukoon: '." && ws[2] === "Put together: mu'.", 'its hamza is its own step, and the blend reads "mu\'"', ws.join(' / '));
  click($('.spell-nextword'));
  check(units().length === 3 && units()[2] === HAMZA + cc(0x064C), 'word 3: sama\'un, the hamza on the line with two damma', units().join(' '));
  await w.setScript('indopak');
  click($('.word-step'));
  check(units()[1] === ALIF + FATHA && !units().join('').includes(ALIF_HAMZA), 'in Indo-Pak, word 1 has a bare alif carrying the zabar and no Madani alif seat', units().join(' '));
  click(all('.word-step')[1]);
  check(units()[1] === WOW_HAMZA + JAZAM, 'and word 2 has U+0652', units().join(' '));
  await w.setScript('madani');

  console.log('\nThe ways out: Previous goes to Lesson 15, Next to Lesson 17');
  check($('.prev').attrs.href === 'lesson-15.html' && $('.prev span').textContent === 'Previous: Shadda', 'Previous goes to Lesson 15', $('.prev span').textContent);
  check($('.spell-more a').attrs.href === 'exercise-16.html' && fs.existsSync(path.join(dir, 'exercise-16.html')), 'Practice reading goes to exercise-16.html, which exists');
  check($('.next span').textContent === 'Next: The round taa and the end yaa' && !$('.next').attrs['data-last'], 'Next reads "Next: The round taa and the end yaa"', $('.next span').textContent);
  w.location.href = '';
  click($('.next'), 1);
  // Lesson 17 is built (2026-09-30), so this is a real link now, as Lesson 15's was the day Lesson 16 was built.
  check(w.location.href === 'lesson-17.html', 'and it goes to lesson-17.html, which is built', w.location.href);

  console.log('\nThe markup');
  check(!NOMARK.test(w.raw), 'lesson-16.html holds no literal combining mark');
  // (The first-visit chooser's own samples of the two scripts are Arabic letters, and are not a lesson's forms.)
  check(!/[ء-ي]/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<dialog class="chooser"[\s\S]*?<\/dialog>/, '')), 'and no Arabic on the lesson itself: every form is composed by rules.js');
  check(/&#x623;&#x64E;/.test(w.raw), 'the title glyph is a hamza on an alif and U+064E, as numeric references');
  check(!NOMARK.test(fs.readFileSync(path.join(dir, 'rule-lesson.js'), 'utf8')), 'rule-lesson.js holds no literal combining mark');
  const visible = w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|leen|madd|qalqalah|idgham|ikhfa|izhar|ghunna)\b/i.test(visible), 'no scolding and no tajweed word on the page (the plain-names rule; docs/pass-2/03 §4)');
  check(!/\b29\b/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace('Lesson 16 of 29', '')), 'no "29" on the page but the lesson count');
  check(/data-words/.test(w.raw) && (w.raw.match(/data-words(-attr)?=/g) || []).length > 60, 'every line of wording is a text field (data-words / data-words-attr)');
  const wordsAttrOK = [...w.raw.matchAll(/data-words-attr="([^"]*)"/g)].every((m) => m[1].split(';').every((pair) => pair.includes('|')));
  check(wordsAttrOK, 'and every data-words-attr entry is "attribute|label"');

  console.log('\nThe reading page');
  let ex;
  try {
    ex = run('exercise-16.html', ['shell.js', 'marks.js', 'rules.js', 'exercise.js'], { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against exercise-16.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  await sleep(20);
  const cells = () => ex.all('.mashq-word');
  check(cells().length === 12 && ex.ctx.qaida.kind === 'exercise' && ex.ctx.qaida.count === 12, 'exercise-16.html has twelve words');
  check(/data-rule="hamza"/.test(ex.raw) && !/data-mark=/.test(ex.raw) && /href="lesson-16\.html"/.test(ex.raw) && /data-next-fatha="Next: The round taa and the end yaa"/.test(ex.raw) && !/data-last/.test(ex.raw),
    'it teaches the hamza rule, goes back to Lesson 16 and on to Lesson 17');
  check(ex.$('.exercise-lede').textContent === 'Twelve words with a hamza — read them yourself, no translations.', 'its line says hamza', ex.$('.exercise-lede').textContent);
  const wordText = (script) => cells().map((c) => c.children.find((k) => k.attrs.lang === 'ar').textContent);
  const seatChars = [0x0623, 0x0625, 0x0624, 0x0626, 0x0621];
  check(wordText().every((t) => [...t].some((c) => seatChars.includes(c.charCodeAt(0)))), 'in Madani every word has a hamza on a seat or on the line');
  check(wordText()[0].startsWith(ALIF_HAMZA + FATHA) && wordText()[3].startsWith(ALIF_HAMZA_BELOW + KASRA), 'the first is a hamza on an alif with zabar, and the fourth one under it with zair');
  await ex.setScript('indopak');
  const inIndo = wordText();
  check(inIndo.every((t) => !t.includes(ALIF_HAMZA) && !t.includes(ALIF_HAMZA_BELOW)), 'in Indo-Pak no word holds a Madani alif seat', inIndo.filter((t) => t.includes(ALIF_HAMZA) || t.includes(ALIF_HAMZA_BELOW)).join(' '));
  check(inIndo[0].startsWith(ALIF + FATHA) && inIndo[5].includes(ALIF + JAZAM), 'word 1 starts with a bare alif and zabar, and word 6 has an alif with a jazam');
  check(!NOMARK.test(ex.raw), 'and exercise-16.html holds no literal combining mark');
}

pageHalf().then(() => {
  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
});
