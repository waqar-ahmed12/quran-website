// Checks for Lesson 21's word layer (silent.js, on rules.js, with the Qur'an's own words in rule-words.js), the one change to the engine (a format may bring
// its own answers) and, below them, the rule page (rule-lesson.js against the real lesson-21.html in a small hand-made DOM). QAIDA-BUILD.md step P2;
// docs/lesson-21/02 §3.
//
//   node tools/qaida-lesson21-check.js
//
// The data half loads the real shell.js, practice.js, marks.js, rules.js, rule-words.js and silent.js into a scratch context with an in-memory stand-in for
// localStorage, as tools/qaida-lesson20-check.js does. The page half is at the foot of this file.
//
// The same limits as every other page check: nothing is drawn and no CSS runs, so it cannot tell whether a letter is big enough to tap on a phone, whether
// the lit band sits on the right letters, or how a face draws the small circle. Those were measured in the browser pane at the build (docs/lesson-21/02 §3;
// §4 is the user's list). What it proves is what only a script can: that every reference the lesson names is in the copied file, in both scripts, and that the
// copy is exact; that every word holds only what the student has met (and, in Madani, the small circle); that the letter that is not read is where the lesson
// says, by each script's own rule, in every word, and that a word with none has none; that the engine deals a tap question's answers as the word's letters and
// judges the right one; and that the ids, the two scripts, the board, the lines and the ways out do what they say. Prints PASS or FAIL per check; the exit code
// is the number that failed.
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

function boot(saved, files = ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'silent.js']) {
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
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file });
  return { shell: ctx.qaidaShell, practice: ctx.qaidaPractice, marks: ctx.qaidaMarks, rules: ctx.qaidaRules, kit: ctx.qaidaRules.KITS.silent, words: ctx.qaidaRuleWords, store };
}

const cc = (...codes) => String.fromCharCode(...codes);
const cps = (text) => [...text].map((c) => c.codePointAt(0));
const ALIF_WASLA = 0x0671;
const ALIF = 0x0627;
const WAW = 0x0648;
const YAA = 0x064A;
const SPACE = 0x20;
const TATWEEL = 0x0640;
const FATHA = 0x064E;
const DAMMA = 0x064F;
const SMALL_ALIF = 0x0670; // Madani's small alif; Indo-Pak's khari zabar
const CIRCLE = 0x06DF; // Madani's small circle: a letter that is not read
const JAZAM_I = 0x06E1; // Indo-Pak's jazam; Madani's is U+0652
// What a word may hold: a letter of the 29 (or the alif wasla), tatweel, the marks the student has met by Lesson 20 (the harakat, the tanween, the shadda, the jazam
// in both drawings, the small alif, the wavy line), and, in Madani, the small circle that is this lesson. No stop sign, no other small letter, no direction mark.
const isLetter = (c) => (c >= 0x0621 && c <= 0x064A) || c === ALIF_WASLA;
const ALLOWED_MARK = new Set([0x064B, 0x064C, 0x064D, 0x064E, 0x064F, 0x0650, 0x0651, 0x0652, SMALL_ALIF, JAZAM_I, 0x0653]);
const okChar = (script) => (c) => isLetter(c) || c === TATWEEL || c === SPACE || ALLOWED_MARK.has(c) || (script === 'madani' && c === CIRCLE);

const TAP = {
  id: 'tap-the-letter', ask: 'glyph', answerWith: 'letter', tap: true, minStreak: 0,
};
const LIT = { id: 'lit-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0, available: (item) => !item.tap };
const kitSource = fs.readFileSync(path.join(dir, 'silent.js'), 'utf8');
const REF_RE = /['"](\d{1,3}:\d{1,3}:\d{1,3}(?:-\d{1,3})?)['"]/g;
const namedIn = (file) => new Set([...fs.readFileSync(path.join(dir, file), 'utf8').matchAll(REF_RE)].map((m) => m[1]));

console.log('The data layer: rule-words.js and silent.js');
{
  const { shell, marks, rules, kit, words } = boot();
  const forms = kit.formsOf();
  const taps = forms.filter((f) => f.ask === 'tap');
  const lits = forms.filter((f) => f.ask === 'lit');
  const data = words.words;
  const baseOf = (u) => cps(u).find((c) => isLetter(c) || c === TATWEEL || c === SPACE);
  const marksOf = (u) => cps(u).slice(1).filter((c) => c !== TATWEEL);

  // The copy: every reference the lesson names is in the copied file, in both scripts, and the file holds nothing else.
  const named = namedIn('silent.js');
  check(named.size === 33 && [...named].every((ref) => data[ref] && data[ref].madani && data[ref].indopak), `every reference silent.js names (${named.size}) is in rule-words.js, in both scripts`, String(named.size));
  const others = ['al.js', 'wasl.js', 'madd.js', 'stop.js'].map(namedIn);
  check(Object.keys(data).every((ref) => named.has(ref) || others.some((s) => s.has(ref))) && Object.keys(data).length === named.size + others.reduce((n, s) => n + s.size, 0),
    'and rule-words.js holds no word that no kit file names (the fetch tool reads the references out of the kit files), and each is named once');
  check([...named].every((ref) => others.every((s) => !s.has(ref))), 'no reference is named by two lessons: each lesson\'s words are its own');
  const fileText = fs.readFileSync(path.join(dir, 'rule-words.js'), 'utf8');
  check(!/[^\x00-\x7f]/.test(fileText.replace(/^\/\/.*$/gm, '')), 'the copied data is ASCII with \\u escapes: a combining mark is never a character you cannot see in a diff');
  check(!/[؀-ۿ]/.test(kitSource) && !/[ً-ْٰۡ]/.test(kitSource), 'silent.js holds no Arabic and no combining mark: every word is a reference (docs/pass-2/02 §3)');
  check(/KIT_FILES = \[[^\]]*'silent\.js'/.test(fs.readFileSync(path.join(dir, '..', '..', 'tools', 'fetch-qaida-words.js'), 'utf8')), 'the fetch tool reads its references from silent.js');
  check([...named].every((ref) => !ref.includes('-') && ['madani', 'indopak'].every((s) => !data[ref][s].includes(' '))), 'every reference is one word, in both scripts: no pairs in this lesson');

  // What is in each word: only what the student has met; the small circle in Madani and nowhere else.
  let badChars = 0;
  let notLetters = 0;
  let stray = 0;
  for (const ref of named) {
    for (const script of ['madani', 'indopak']) {
      const text = data[ref][script];
      if (!cps(text).every(okChar(script))) badChars += 1;
      if (script === 'indopak' && cps(text).includes(CIRCLE)) stray += 1;
      if (kit.lettersOf(text).some((u) => !cps(u).some((c) => isLetter(c) || c === TATWEEL))) notLetters += 1;
    }
  }
  check(badChars === 0, 'every word, in both scripts, holds only letters, tatweel and the marks Lessons 4-20 taught, and in Madani the small circle (no stop sign, no other small letter, no direction mark)', String(badChars));
  check(stray === 0, 'the small circle is in no Indo-Pak word: Indo-Pak marks the letters that are read, and leaves the others bare');
  check(notLetters === 0, 'splitting one into letters with their marks leaves no lone mark, and a tatweel stays with the letter before it');
  check([...named].every((ref) => kit.lettersOf(data[ref].madani).join('') === data[ref].madani && kit.lettersOf(data[ref].indopak).join('') === data[ref].indopak), 'and the letters of every word, joined, are its text exactly');

  // THE RULE (docs/lesson-21/01 §2), in both scripts, for every word of the lesson, its reading page and its walkthrough.
  const problems = [];
  const why = (ref, script, message) => problems.push(`${ref} ${script}: ${message}`);
  const circles = (units) => units.filter((u) => marksOf(u).includes(CIRCLE)).length;
  for (const f of taps) {
    for (const script of ['madani', 'indopak']) {
      const units = kit.lettersOf(data[f.ref][script]);
      const at = kit.notReadAt(units, script, f.kind);
      if (f.kind === 'none') {
        // The rule itself, asked under both kinds it can be asked as: it finds nothing in a word where every letter is read.
        if (kit.notReadAt(units, script, 'plural') !== -1 || kit.notReadAt(units, script, 'aawow') !== -1) why(f.ref, script, 'a word where every letter is read has no letter that is not');
        if (circles(units) !== 0) why(f.ref, script, 'and no circle in Madani');
        const longVowel = units.some((u, i) => i > 0 && ((baseOf(u) === ALIF && marksOf(u).length === 0 && marksOf(units[i - 1]).includes(FATHA))
          || ([WAW, YAA].includes(baseOf(u)) && (script === 'madani' ? marksOf(u).length === 0 : marksOf(u).join() === String(JAZAM_I)))));
        if (!longVowel) why(f.ref, script, 'it holds a long vowel that is read, so a student has to tell it from one that is not');
        continue;
      }
      if (at < 0) { why(f.ref, script, 'exactly one letter is not read'); continue; }
      const u = units[at];
      if (f.kind === 'plural') {
        if (baseOf(u) !== ALIF || at !== units.length - 1) why(f.ref, script, 'the alif is the last letter');
        const before = units[at - 1];
        if (baseOf(before) !== WAW || !(script === 'madani' ? marksOf(before).length === 0 : marksOf(before).join() === String(JAZAM_I))) why(f.ref, script, 'after a plural wow (bare in Madani, with a jazam in Indo-Pak)');
        if (!marksOf(units[at - 2]).includes(DAMMA)) why(f.ref, script, 'the wow follows a paish');
        if (script === 'madani' && marksOf(u).join() !== String(CIRCLE)) why(f.ref, script, 'carries the small circle and nothing else');
        if (script === 'indopak' && marksOf(u).length !== 0) why(f.ref, script, 'is bare');
      } else if (f.kind === 'ulee') {
        if (baseOf(u) !== WAW) why(f.ref, script, 'a wow');
        if (![0x0623, ALIF].includes(baseOf(units[at - 1])) || !marksOf(units[at - 1]).includes(DAMMA)) why(f.ref, script, 'right after the hamza, with a paish (an alif seat; a bare alif carrying the paish in Indo-Pak)');
        if (script === 'madani' && marksOf(u).join() !== String(CIRCLE)) why(f.ref, script, 'carries the small circle and nothing else');
        if (script === 'indopak' && marksOf(u).length !== 0) why(f.ref, script, 'is bare');
      } else if (f.kind === 'aawow') {
        if (baseOf(u) !== WAW) why(f.ref, script, 'a wow');
        if (script === 'madani' && marksOf(u).join() !== String(SMALL_ALIF)) why(f.ref, script, 'carries only the small alif, and no vowel');
        if (script === 'indopak' && (marksOf(u).length !== 0 || !marksOf(units[at - 1]).includes(SMALL_ALIF))) why(f.ref, script, 'is bare, with the khari zabar on the letter before it');
        if (circles(units) !== 0) why(f.ref, script, 'and no circle in this word');
      }
    }
    // The same letter in the two scripts, by its base.
    const am = kit.lettersOf(data[f.ref].madani);
    const ai = kit.lettersOf(data[f.ref].indopak);
    const bm = kit.notReadAt(am, 'madani', f.kind);
    const bi = kit.notReadAt(ai, 'indopak', f.kind);
    if (f.kind !== 'none' && baseOf(am[bm]) !== baseOf(ai[bi])) why(f.ref, 'both', 'the same letter is not read in both scripts');
  }
  check(problems.length === 0, 'the rule holds for every word, in both scripts: Madani\'s circle (or the small alif alone on a wow) and Indo-Pak\'s bare letter find the same one letter; a word of "none" has none and a long vowel that is read', problems.slice(0, 4).join(' | '));
  // The reading page's twelve and the walkthrough's three: the same rule, by kind.
  const READING_KINDS = ['plural', 'plural', 'plural', 'plural', 'ulee', 'ulee', 'aawow', 'aawow', 'none', 'none', 'none', 'none'];
  const readingBad = [];
  kit.READING.forEach((ref, i) => {
    for (const script of ['madani', 'indopak']) {
      const units = kit.lettersOf(data[ref][script]);
      const asKind = READING_KINDS[i] === 'none' ? (script === 'madani' ? 'plural' : 'aawow') : READING_KINDS[i];
      const at = kit.notReadAt(units, script, asKind);
      if ((READING_KINDS[i] === 'none') !== (at === -1)) readingBad.push(`${ref} ${script}`);
      if (READING_KINDS[i] === 'none' && kit.notReadAt(units, script, 'aawow') !== -1) readingBad.push(`${ref} ${script} aawow`);
      if (!cps(data[ref][script]).every(okChar(script))) readingBad.push(`${ref} ${script} chars`);
    }
  });
  kit.WALK.forEach((w) => {
    for (const script of ['madani', 'indopak']) if (kit.notReadAt(kit.lettersOf(data[w.ref][script]), script, w.kind) < 0) readingBad.push(`${w.ref} ${script} walk`);
  });
  check(readingBad.length === 0, 'the reading page\'s twelve (four with an alif after a plural wow, two with the wow after a hamza, two with a wow that carries "aa", four with none) and the walkthrough\'s three follow the rule, in both scripts', readingBad.join());

  // The lists: numbers and no overlap.
  check(rules.RULES.silent.id === 'silent' && rules.RULES.silent.lesson === 21 && rules.RULES.silent.parts === 3, 'a sixth rule, "silent", lesson 21, three parts');
  check(kit.PLURAL.length === 6 && kit.ULEE.length === 4 && kit.AAWOW.length === 4 && kit.NONE.length === 4 && taps.length === 18 && lits.length === 12 && forms.length === 30,
    'eighteen words (six after a plural wow, four after a hamza, four that carry "aa", four with none) and twelve questions about one letter: thirty items');
  const wordRefs = taps.map((f) => f.ref);
  check(new Set(wordRefs).size === 18, 'no word is in two lists');
  check(kit.READING.length === 12 && new Set(kit.READING).size === 12 && kit.READING.every((ref) => !wordRefs.includes(ref) && data[ref]), 'the reading page\'s twelve are twelve other words than the drill\'s');
  check(kit.WALK.length === 3 && kit.WALK.map((w) => w.kind).join() === 'plural,ulee,aawow' && kit.WALK.every((w) => w.sounds.length === 2 && w.whole && w.meaning && data[w.ref] && !wordRefs.includes(w.ref) && !kit.READING.includes(w.ref)),
    'the walkthrough is three others: one of each kind, each with two sounds, a whole and a meaning');
  check(lits.every((f) => wordRefs.includes(f.ref) && f.kind && ['not', 'read'].includes(f.kind)) && lits.filter((f) => f.kind === 'not').length === 6 && lits.filter((f) => f.kind === 'read').length === 6
    && lits.filter((f) => f.wordKind === 'plural').length === 6 && lits.filter((f) => f.wordKind === 'ulee').length === 4 && lits.filter((f) => f.wordKind === 'aawow').length === 2,
    'a question about one letter comes as a pair for six words (the letter not read, and a letter beside it that is read): three after a plural wow, two after a hamza, one that carries "aa"');

  // Parts.
  const items = kit.itemsFor(shell);
  check(JSON.stringify(marks.sizes(items, [1, 2, 3])) === '[14,12,30]', 'the three parts hold 14, 12 and 30', JSON.stringify(marks.sizes(items, [1, 2, 3])));
  check(taps.filter((f) => f.kind !== 'none').every((f) => f.parts.join() === '1,3') && taps.filter((f) => f.kind === 'none').every((f) => f.parts.join() === '3') && lits.every((f) => f.parts.join() === '2,3'),
    'a word with a letter not read is tapped in parts 1 and 3, a word with none only in part 3 (where "none" is an answer), and a question about one letter in parts 2 and 3');
  check(rules.poolFor(items, 1).every((i) => i.tap) && rules.poolFor(items, 2).every((i) => !i.tap) && rules.poolFor(items, 3).some((i) => i.tap) && rules.poolFor(items, 3).some((i) => !i.tap),
    'part 1 is all taps, part 2 all lit letters, part 3 both');
  check([2, 3].every((n) => new Set(rules.poolFor(items, n).filter((i) => !i.tap).map((i) => i.name)).size === 2), 'a part with lit questions holds both answers, "Read" and "Not read", so every one can be asked');

  // Ids: distinct, the same in both scripts, and never the Arabic.
  const ids = forms.map((f) => kit.idOf(f));
  check(new Set(ids).size === 30 && ids.every((id) => /^\d+:\d+:\d+(#(not|read))?$/.test(id)), 'thirty distinct ids, each a reference (and #not or #read for a question about one letter), never a word\'s Arabic');
  check(ids.filter((id) => id.includes('#')).length === 12 && taps.every((f) => kit.idOf(f) === f.ref), 'a tapped word\'s id is its reference');
  const madani = boot();
  const indopak = boot();
  indopak.shell.state.script = 'indopak';
  const idsIn = (w) => w.kit.itemsFor(w.shell).map((item) => item.id);
  check(JSON.stringify(idsIn(madani)) === JSON.stringify(idsIn(indopak)), 'the same ids in both scripts: the glyphs differ, the ids do not');
  const itemsM = madani.kit.itemsFor(madani.shell);
  const itemsI = indopak.kit.itemsFor(indopak.shell);
  check(itemsM.every((it) => it.glyph === data[it.ref].madani) && itemsI.every((it) => it.glyph === data[it.ref].indopak), 'each item\'s glyph IS the copied text for the script in use, character for character');
  check(itemsM.filter((it, i) => it.glyph !== itemsI[i].glyph).length >= 15, 'and the two scripts differ in most of them (the circle, the jazam, the hamza seat)', String(itemsM.filter((it, i) => it.glyph !== itemsI[i].glyph).length));
  check(itemsM.every((it) => it.boardId === it.ref && it.parts.length > 0 && it.marked === true && it.required === false && it.traceable === true && it.family.length === 0), 'every item is marked, not required until a part makes it so, has no look-alike, and knows which tile on the board is its word');

  // The letters of every item: tapped words in full and unlit; questions about one letter with exactly one lit.
  for (const [script, w] of [['madani', madani], ['indopak', indopak]]) {
    const its = w.kit.itemsFor(w.shell);
    check(its.every((it) => it.units.map((u) => u.text).join('') === data[it.ref][script]), `${script}: the letters of every item, joined, are the copied word exactly`);
    check(its.filter((it) => it.tap).every((it) => it.units.every((u) => u.role === '')), `${script}: a tap question lights nothing: a lit letter would be the answer`);
    check(its.filter((it) => !it.tap).every((it) => it.units.filter((u) => u.role === 'ask').length === 1 && it.units.filter((u) => u.role).length === 1), `${script}: a question about one letter lights exactly one`);
    const wrongLit = [];
    for (const it of its.filter((x) => !x.tap)) {
      const units = it.units.map((u) => u.text);
      const at = it.units.findIndex((u) => u.role === 'ask');
      const silent = w.kit.notReadAt(units, script, it.wordKind);
      if (it.kind === 'not' && at !== silent) wrongLit.push(it.id);
      if (it.kind === 'read') {
        if (at === silent || at < 0) wrongLit.push(`${it.id} same`);
        // A letter that IS read: no circle in Madani, and a mark on it in Indo-Pak.
        if (script === 'madani' && marksOf(units[at]).includes(CIRCLE)) wrongLit.push(`${it.id} circle`);
        if (script === 'indopak' && marksOf(units[at]).length === 0) wrongLit.push(`${it.id} bare`);
      }
    }
    check(wrongLit.length === 0, `${script}: "not read" lights the letter not read; "read" lights another, which has no circle (Madani) and a mark on it (Indo-Pak)`, wrongLit.join());
    const tapped = its.filter((it) => it.tap);
    check(tapped.every((it) => (it.kind === 'none' ? it.answerId === 'none' : it.answerId === String(w.kit.notReadAt(it.units.map((u) => u.text), script, it.wordKind)))), `${script}: every tapped word knows its answer: the place of the letter not read, or "none"`);
  }

  // The answers a tap question deals.
  const t0 = itemsM.find((it) => it.tap && it.kind === 'plural');
  const noneItem = itemsM.find((it) => it.tap && it.kind === 'none');
  const dealt = kit.tapChoices(t0, false);
  check(dealt.length === t0.units.length && dealt.every((c, i) => c.id === String(i) && c.text === t0.units[i].text && c.tap === true && !c.none), 'a tap question deals the word\'s own letters, in the order they are read, each with its place as its id');
  const withNone = kit.tapChoices(noneItem, true);
  check(withNone.length === noneItem.units.length + 1 && withNone[withNone.length - 1].id === 'none' && withNone[withNone.length - 1].none === true, 'and, where the part allows it, "none" as a last answer');
  check(kit.askOf(t0, 1) === 'tap' && kit.askOf(t0, 2) === 'tap' && kit.askOf(t0, 3) === 'tapnone' && kit.askOf(itemsM.find((it) => !it.tap), 2) === 'lit', 'the question line is one of three: tap, tap-or-none, or the lit letter');

  // Names.
  const names = items.map((i) => i.name);
  check(names.slice(0, 6).every((n) => n === 'the alif after the wow') && names.slice(6, 10).every((n) => n === 'the wow after the hamza') && names.slice(10, 14).every((n) => n === 'the wow that carries the long “aa”')
    && names.slice(14, 18).every((n) => n === 'every letter') && names.slice(18).every((n, i) => n === (i % 2 === 0 ? 'Not read' : 'Read')), 'the names: what is not read in a word, and Not read / Read for a lit letter', [...new Set(names)].join(' | '));
  const zn = boot({ v: 1, chosen: true, script: 'madani', names: 'zabar', grouping: 'families' });
  check(zn.kit.itemsFor(zn.shell).map((i) => i.name).join() === names.join(), 'in the zabar set every name is the same: no name here is a mark\'s');
  const custom = kit.itemsFor(shell, { templates: { plural: 'P', ulee: 'U', aawow: 'W', none: 'N', not: 'X', read: 'R' } });
  check(custom[0].name === 'P' && custom[6].name === 'U' && custom[10].name === 'W' && custom[14].name === 'N' && custom[18].name === 'X' && custom[19].name === 'R', 'the templates are the only source of a name (a teacher\'s edit reaches every item)');
  kit.rename(items, shell, { plural: 'A', ulee: 'B', aawow: 'C', none: 'D', not: 'E', read: 'F' });
  check(items[0].name === 'A' && items[6].name === 'B' && items[10].name === 'C' && items[14].name === 'D' && items[18].name === 'E' && items[19].name === 'F', 'rename() rewrites every name in place');

  // Audio: none recorded, and none asked for by the recordings page.
  check(itemsM.every((i) => i.audio.kind === 'words' && i.audio.glyph === i.ref), 'a word\'s sound would be kept under the group "words", by its reference (both questions about a word share it)');

  // The board and the echo.
  const boards = kit.boards();
  check(boards.map((b) => b.id).join() === 'plural,ulee,aawow,none' && boards.map((b) => b.cells.length).join() === '6,4,4,4' && boards.every((b) => b.cells.every((f) => f.ask === 'tap')), 'the board is four lists of words: after a plural wow (6), after a hamza (4), carrying "aa" (4), none (4)');
  check(JSON.stringify(kit.samples().map((s) => s.kind)) === '["plural","ulee","aawow"]' && kit.samples().every((s) => wordRefs.includes(s.ref)), 'the strip shows three words on their own, one of each kind of letter not read, each a word of the drill');
  const line = (it) => kit.echoOf(it).line;
  const unitsIn = (it) => kit.echoOf(it).units;
  check(line(itemsM[0]) === 'linePluralMadani' && line(itemsM[6]) === 'lineUleeMadani' && line(itemsM[10]) === 'lineAawowMadani' && line(itemsM[14]) === 'lineNone'
    && line(itemsM.find((i) => i.kind === 'not' && i.wordKind === 'aawow')) === 'lineAawowMadani' && line(itemsM.find((i) => i.kind === 'read')) === 'lineReadMadani'
    && indopak.kit.echoOf(itemsI[0]).line === 'linePluralIndopak' && indopak.kit.echoOf(itemsI.find((i) => i.kind === 'read')).line === 'lineReadIndopak', 'under a wrong answer the line says what shows it, for the word\'s kind and the student\'s script; a lit letter that is read has its own');
  check(itemsM.every((i) => unitsIn(i).map((u) => u.text).join('') === data[i.ref].madani) && unitsIn(itemsM[0]).filter((u) => u.role === 'silent').length === 1 && unitsIn(itemsM[14]).every((u) => u.role === '')
    && unitsIn(itemsM.find((i) => i.kind === 'read')).filter((u) => u.role === 'read').length === 1, 'and shows the same word again, whole, with the letter not read lit (the lit letter that is read, for that question), and nothing lit in a word of none');
  check(kit.firstRow(1) === 'plural' && kit.firstRow(2) === 'ulee' && kit.firstRow(3) === 'none' && kit.rowInPart('plural', 1) && kit.rowInPart('aawow', 2) && !kit.rowInPart('none', 1) && !kit.rowInPart('none', 2) && ['plural', 'ulee', 'aawow', 'none'].every((r) => kit.rowInPart(r, 3)),
    'the same-line row starts on the row a part is about, and a row is only in the parts its words are');
  for (const script of ['madani', 'indopak']) {
    const w = script === 'madani' ? madani : indopak;
    const s = [1, 2, 3].map((n) => w.kit.sampleOf(n, script));
    check(data[kit.PLURAL[0]][script].endsWith(s[0]) && data[kit.ULEE[0]][script].startsWith(s[1]) && data[kit.NONE[0]][script].startsWith(s[2]) && s.every((x) => x.length > 0), `${script}: the rail's samples are the end of a plural word, the front of the word for "those with", the front of a word with none`, s.map((x) => x.length).join());
  }
  check(madani.kit.sampleOf(1, 'madani').includes(cc(CIRCLE)) && !indopak.kit.sampleOf(1, 'indopak').includes(cc(CIRCLE)), 'and the first one shows the small circle in Madani and a bare alif in Indo-Pak');
  check(kit.titleGlyph() === cc(ALIF, CIRCLE), 'the big glyph is an alif with the small circle, composed from its code points');
  const unitsStep = kit.unitsOf(kit.WALK[0].ref, 'madani', 'plural');
  check(unitsStep.map((u) => u.text).join('') === data[kit.WALK[0].ref].madani && unitsStep.filter((u) => u.step === 1).length === 1 && unitsStep.filter((u) => u.role === 'silent').length === 1
    && kit.unitsOf(kit.WALK[1].ref, 'madani', 'ulee').findIndex((u) => u.step === 1) === 2 && kit.unitsOf(kit.WALK[2].ref, 'indopak', 'aawow').filter((u) => u.step === 1).length >= 2,
    'a walkthrough word\'s units say which piece they are: the letters before the one not read, and it and what follows (a plural word\'s second piece is the alif alone)');

  // No literal combining mark in any file of the lesson.
  const MARK_RE = new RegExp('[\\u064B-\\u0653\\u0670\\u0657\\u0660-\\u0669\\u06D6-\\u06ED]');
  check(MARK_RE.test(cc(0x064E)) && MARK_RE.test(cc(0x0670)) && MARK_RE.test(cc(0x06E1)) && MARK_RE.test(cc(CIRCLE)) && !MARK_RE.test(cc(0x0644)), 'the literal-mark pattern can fail (it catches a zabar, a small alif, U+06E1 and the small circle, and not a letter)');
  for (const file of ['silent.js', 'rules.js', 'rule-lesson.js', 'practice.js', 'spell.js', 'exercise.js', 'lesson-21.html', 'exercise-21.html', 'rule-words.js']) {
    check(!MARK_RE.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')), `${file} holds no literal combining mark or small letter`);
  }
}

console.log('\nThe other rules still stand');
{
  const w = boot(undefined, ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'ends.js', 'rule-words.js', 'silent.js']);
  check(Object.keys(w.rules.RULES).join() === 'hamza,ends,silent' && Object.keys(w.rules.KITS).join() === 'hamza,ends,silent', 'the registry holds the hamza\'s kit, the ends\' and this one, each with its own board');
  check(w.kit.board === 'words' && w.kit.tapFormat === true && w.rules.KITS.hamza.tapFormat === undefined && w.rules.KITS.ends.tapFormat === undefined, 'this kit says its rule is tapped (`tapFormat`), and no other does');
  const all = boot(undefined, ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'al.js', 'wasl.js', 'madd.js', 'silent.js']);
  check(all.rules.KITS.al.formsOf().length === 12 && all.rules.KITS.wasl.formsOf().length === 24 && all.rules.KITS.madd.formsOf().length === 24 && all.rules.KITS.silent.formsOf().length === 30
    && all.rules.KITS.al.itemsFor(all.shell).every((i) => i.askGroup === undefined) && all.rules.KITS.madd.itemsFor(all.shell).every((i) => i.askGroup === undefined),
    'Lessons 18, 19 and 20 are untouched: twelve, twenty-four and twenty-four words');
}

console.log('\nMastery');
{
  const w = boot();
  const items = w.kit.itemsFor(w.shell);
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(21, items[0].id, true);
  check(w.shell.masteredCount(21) === 1, 'masteredCount(21) counts one mastered item', String(w.shell.masteredCount(21)));
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(21, items[29].id, true);
  check(w.shell.masteredCount(21) === 2, 'and two, when two are mastered', String(w.shell.masteredCount(21)));
  check([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].every((n) => w.shell.masteredCount(n) === 0), 'none of it counts toward another lesson');
  const switched = boot();
  const inMadani = switched.kit.itemsFor(switched.shell)[0];
  for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(21, inMadani.id, true);
  switched.shell.state.script = 'indopak';
  const inIndoPak = switched.kit.itemsFor(switched.shell)[0];
  check(inIndoPak.id === inMadani.id && inIndoPak.glyph !== inMadani.glyph && switched.rules.stats(switched.shell, 21, [inIndoPak], 1, { target: 3 }).known === 1,
    'a word keeps its credit after a switch to Indo-Pak, though its Arabic is another text');
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
  for (const file of ['shell.js', 'marks.js', 'rules.js', 'rule-words.js', 'silent.js', 'audio.js']) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  const rows = audioCtx.qaidaAudio.wanted();
  check(rows.length === 447, 'the recordings page still lists 447 rows: Lesson 21 adds none (its words are recorded one at a time, under their references, in a later step)', String(rows.length));
  const items = audioCtx.qaidaRules.KITS.silent.itemsFor(audioCtx.qaidaShell);
  check(items.every((i) => audioCtx.qaidaAudio.has(i.audio.kind, i.audio.glyph) === false), 'and no word has a recording yet');
}

console.log('\nThe engine: a format may bring its own answers');
{
  const w = boot();
  // 1. Every other format is dealt exactly as before: `correct` is the item's own id.
  const plain = w.practice.create({
    lesson: 90, items: w.kit.itemsFor(w.shell).filter((i) => !i.tap).map((i) => ({ ...i, required: true })), formats: [LIT], random: seeded(5), familyFirst: false,
  });
  plain.start();
  const q0 = plain.question;
  check(q0.correct === q0.item.id && q0.choices.some((c) => c.id === q0.item.id), 'an ordinary question\'s right answer is still its item\'s id (`correct`), among its choices');
  // 2. A format with `choicesFor`: the answers are its own, in its order, and `correctFor` says which is right.
  let group = 1;
  const tapFormat = { ...TAP, available: (item) => item.tap, choicesFor: (item) => w.kit.tapChoices(item, group >= 3), correctFor: (item) => item.answerId };
  const items = w.kit.itemsFor(w.shell);
  const expect = { 1: { total: 14, tap: true, lit: false }, 2: { total: 12, tap: false, lit: true }, 3: { total: 30, tap: true, lit: true } };
  let asked = 0;
  let bad = 0;
  let orderOff = 0;
  let noneSeen = 0;
  let noneRight = 0;
  let missing = 0;
  let wrongAnswers = 0;
  let rightJudged = 0;
  for (const n of [1, 2, 3]) {
    group = n;
    const pool = w.rules.poolFor(items, n);
    const e = expect[n];
    check(pool.length === e.total && pool.every((i) => i.required), `part ${n}: ${pool.length} items, all required`, String(pool.length));
    const drill = w.practice.create({
      lesson: 21, items: pool, formats: [tapFormat, LIT], random: seeded(31 + n), familyFirst: false, noRepeatWithin: Math.max(1, Math.min(8, pool.length - 2)),
    });
    drill.start();
    check(drill.progress().total === e.total, `part ${n}: the drill counts ${e.total} toward ready`, String(drill.progress().total));
    const kinds = new Set();
    for (let i = 0; i < 150; i += 1) {
      const q = drill.question;
      if (!q) { bad += 1; break; }
      asked += 1;
      const isTap = q.format.id === 'tap-the-letter';
      kinds.add(isTap ? 'tap' : 'lit');
      if (isTap !== q.item.tap) bad += 1;
      const ids = q.choices.map((c) => c.id);
      if (isTap) {
        const letters = q.item.units.length + (n >= 3 ? 1 : 0);
        if (ids.length !== letters) bad += 1;
        if (ids.slice(0, q.item.units.length).join() !== q.item.units.map((_, k) => String(k)).join()) orderOff += 1;
        if (n >= 3 !== ids.includes('none')) bad += 1;
        if (!ids.includes(q.correct) || q.correct !== q.item.answerId) missing += 1;
        if (q.item.kind === 'none') { noneSeen += 1; if (q.correct === 'none') noneRight += 1; }
        // Answer wrongly now and then: the engine must judge by `correct`, not by the item's id.
        const wrongId = ids.find((id) => id !== q.correct);
        const verdict = i % 3 === 0 ? drill.answer(wrongId) : drill.answer(q.correct);
        if (i % 3 === 0 ? verdict.right !== false : verdict.right !== true) wrongAnswers += 1;
        else rightJudged += 1;
      } else {
        if (new Set(ids).size !== ids.length || ids.length !== 2 || q.choices.map((c) => c.name).sort().join('|') !== 'Not read|Read' || q.correct !== q.item.id) bad += 1;
        const verdict = drill.answer(q.item.id);
        if (!verdict.right) wrongAnswers += 1;
      }
      drill.next();
    }
    check((n === 1 && [...kinds].join() === 'tap') || (n === 2 && [...kinds].join() === 'lit') || (n === 3 && kinds.size === 2), `part ${n} asks ${e.tap && e.lit ? 'both questions' : e.tap ? 'only tap questions' : 'only lit-letter questions'}`, [...kinds].join());
  }
  check(asked === 450 && bad === 0, '450 questions through the real engine, on all three parts, each dealt as its part says: letters for a tap (with "none" only in part 3), Read and Not read for a lit letter', `${asked} asked, ${bad} off`);
  check(orderOff === 0, 'a tap question\'s letters keep the order they are read in (they are not shuffled)', String(orderOff));
  check(missing === 0, 'the right answer is always among the choices, and is the item\'s `answerId`');
  check(noneSeen > 0 && noneRight === noneSeen, 'a word with none is asked in part 3, and its right answer is "none" every time', `${noneSeen} asked`);
  check(wrongAnswers === 0 && rightJudged > 50, 'the engine judges a tap by `correct`: the right letter is right, any other is wrong, and a lit-letter answer is judged as it always was', `${wrongAnswers} off, ${rightJudged} judged`);
  // 3. Progress is the engine's own: two right answers in a row master an item.
  group = 1;
  const pool1 = w.rules.poolFor(items, 1);
  const d1 = w.practice.create({ lesson: 91, items: pool1, formats: [tapFormat, LIT], random: seeded(9), familyFirst: false, noRepeatWithin: 5 });
  d1.start();
  const first = d1.question;
  d1.answer(first.correct);
  d1.next();
  check(w.shell.drillOf(91).streak[first.item.id] === 1 && w.shell.drillOf(91).right[first.item.id] === 1, 'a right tap is recorded under the word\'s id, as any answer is');
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


const nodeLoad = ['shell.js', 'audio.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'silent.js', 'rule-lesson.js', 'spell.js'];
const NOMARK = new RegExp('[\\u064B-\\u0653\\u0670\\u0657\\u06D6-\\u06ED]'); // a literal combining mark or small Quranic letter

async function pageHalf() {
  let w;
  try {
    w = run('lesson-21.html', nodeLoad, { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against lesson-21.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  check(true, 'shell.js, audio.js, practice.js, marks.js, rules.js, rule-words.js, silent.js, rule-lesson.js and spell.js load against lesson-21.html without an error');
  await sleep(20);
  const { $, all, click, shell, rules, htmlEl } = w;
  const kit = rules.KITS.silent;
  const data = w.ctx.qaidaRuleWords.words;
  const qaida = w.ctx.qaida;
  qaida.setPause(1);
  const forms = kit.formsOf();
  const taps = forms.filter((f) => f.ask === 'tap');
  const gridTiles = () => $('.rule-grid').querySelectorAll('.word-cell');
  const rail = () => all('.band');
  const choices = () => $('.choices').children;
  const wordRows = () => $('.rule-grid').querySelectorAll('.word-row');
  const unitsOfTile = (t) => t.querySelector('.glyph').children.map((u) => ({ text: u.textContent, role: u.attrs['data-role'] || '' }));
  const wordUnits = () => ($('.prompt-word') ? $('.prompt-word').querySelectorAll('.unit') : []);
  const tapping = () => wordUnits().some((u) => u.classes().includes('tap'));
  const shown = () => {
    const ref = qaida.lastItem[1];
    const its = kit.itemsFor(shell);
    if (tapping()) return its.find((i) => i.ref === ref && i.tap);
    const at = wordUnits().findIndex((u) => u.attrs['data-role'] === 'ask');
    return its.find((i) => i.ref === ref && !i.tap && kit.litAt(ref, shell.state.script, i.kind) === at);
  };
  const press = (el, key) => {
    const event = { type: 'keydown', key, target: el, preventDefault() { this.defaultPrevented = true; } };
    for (let n = el; n; n = n.parent) for (const fn of n.listeners.keydown || []) fn.call(n, event);
  };
  const answerRight = () => {
    const it = shown();
    if (it.tap) click(it.answerId === 'none' ? choices()[0] : wordUnits()[Number(it.answerId)]);
    else click(choices().find((c) => c.textContent === it.name));
  };
  const answerWrong = () => {
    const it = shown();
    if (it.tap) {
      if (it.answerId === 'none') click(wordUnits()[0]);
      else click(wordUnits().find((u, i) => String(i) !== it.answerId));
    } else {
      click(choices().find((c) => c.textContent !== it.name));
    }
  };
  const ASK = { tap: 'Which letter is not read? Tap it.', tapnone: 'Which letter is not read? Tap it, or say that none is.', lit: 'Is the lit letter read?' };
  const html = w.raw;
  const echoOf = (key) => html.match(new RegExp(`data-line-${key}="([^"]*)"`))[1];

  console.log('\nThe page');
  check(qaida.kind === 'drill' && qaida.rule === 'silent' && qaida.hasOther === false && qaida.otherCount === 0 && qaida.hasTail === false && qaida.markCount === 1 && qaida.review === 0,
    'publishes window.qaida with kind "drill" and rule "silent", and nothing to be told apart from, no tails, no review');
  check(htmlEl.attrs['data-rule'] === 'silent' && htmlEl.attrs['data-point'] === 'none' && htmlEl.attrs['data-mark'] === undefined, 'the page teaches the silent rule, with no halo and no mark');
  check(JSON.stringify(qaida.groupCosts().map((p) => p.items)) === '[14,12,30]', 'groupCosts() is 14, 12 then 30', JSON.stringify(qaida.groupCosts().map((p) => p.items)));
  check(rail().length === 3 && rail().every((b) => b.attrs.disabled === undefined), 'three parts, all enabled: nothing is locked');
  check(qaida.parts.map((p) => p.name).join('|') === 'Tap the letter|Read, or not read?|All together', 'the three parts are named by what is asked', qaida.parts.map((p) => p.name).join('|'));

  // The members the options panel reads: a missing one throws in the panel and takes the page down.
  const panel = fs.readFileSync(path.join(dir, 'qaida-options.js'), 'utf8');
  const drillBranch = panel.slice(panel.indexOf("lesson.kind === 'drill'"), panel.indexOf("lesson.kind === 'exercise'"));
  const read = [...new Set([...drillBranch.matchAll(/\blesson\.(\w+)/g)].map((m) => m[1]))];
  const lesson3Only = ['setBand', 'bandTotals', 'setDrilled'];
  const assigned = ['onCosts'];
  const missing = read.filter((name) => !lesson3Only.includes(name) && !assigned.includes(name) && !(name in qaida));
  check(read.length > 20 && missing.length === 0, `every window.qaida member the panel reads exists (${read.length} read)`, missing.join(', '));

  console.log('\nThe head');
  check($('h1').textContent === 'Letters that are not read' && w.doc.title.startsWith('Lesson 21: Letters that are not read'), 'the title is in both name sets', $('h1').textContent + ' / ' + w.doc.title);
  check($('.title-mark').textContent === cc(ALIF, CIRCLE), 'the big glyph is an alif with the small circle', cps($('.title-mark').textContent).join());
  check(all('.band-glyph').map((g) => g.textContent).join() === [1, 2, 3].map((n) => kit.sampleOf(n)).join(), 'the rail shows the end of a plural word, the front of "those with" and the front of a word with none');
  check($('.eyebrow').textContent === 'Lesson 21 of 29' && all('.track li').length === 29 && all('.track li').findIndex((li) => li.classes().includes('now')) === 20, 'Lesson 21 of 29, the twenty-first of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '30', 'the bar\'s total is the thirty', $('.bar').attrs['aria-valuemax']);
  check(!$('.pairs') && !$('.pair-feature') && !$('.halo') && !$('.jazam-note') && !$('.mark-alone') && !$('.joined') && !$('.sun-letters'), 'none of a mark lesson\'s board is on this page');

  console.log('\nThe board: three words and four lists');
  const strip = $('.seat-strip').querySelectorAll('.word-cell');
  check(strip.length === 3 && strip.every((t) => t.tag === 'button' && t.attrs['data-audio'] === undefined), 'the strip has three word tiles, and they say nothing when tapped: no recording exists yet');
  check($('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|') === 'After a plural wow|After a hamza|Carrying “aa”', 'each is captioned with where the letter that is not read is', $('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|'));
  check(strip.map(unitsOfTile).every((u) => u.filter((x) => x.role).length === 1 && u.filter((x) => x.role === 'silent').length === 1), 'each lights its one letter that is not read');
  const note = $('.seat-note').textContent;
  check(/written and not read/.test(note) && !/\d/.test(note) && !/[{}]/.test(note), 'the line under them says what a letter that is not read is, with no number and no token left in it', note);
  check($('.rule-grid').querySelectorAll('.rule-grid-title').map((t) => t.textContent).join('|') === 'The alif after a plural wow|The wow after the hamza|A wow that carries “aa”|Every letter is read', 'each list has a heading');
  check(wordRows().length === 4 && wordRows().map((r) => r.attrs['data-mark']).join() === 'plural,ulee,aawow,none' && wordRows().map((r) => r.querySelectorAll('.word-cell').length).join() === '6,4,4,4', 'four lists of 6, 4, 4 and 4');
  check(gridTiles().length === 18 && all('.word-cell').length === 21 && gridTiles().every((t) => !t.classes().includes('word-pair')), 'eighteen on the board, and the three on their own above them; no wide tile, as no pair is here');
  check(wordRows().map((r) => r.querySelector('.rule-name').textContent).join('|') === 'the alif that is not read|the wow that is not read|the wow that is not read as a wow|no letter left out', 'the row names', wordRows().map((r) => r.querySelector('.rule-name').textContent).join('|'));
  check(wordRows().map((r) => r.querySelector('.rule-sound').textContent).join('|') === 'written, not read|written, not read|carries the “aa”|all read' && !/[{}]/.test($('.rule-grid').textContent), 'each row says what it shows, with no token left in it');
  const later = () => gridTiles().filter((t) => t.attrs['data-state'] === 'later').length;
  check(later() === 4, 'part 1: the four words with none are dim, "comes later"; the map is all there', String(later()));
  qaida.setGroup(2);
  check(later() === 4 && gridTiles().length === 18, 'part 2: the same four are dim, and the board has not changed shape', String(later()));
  qaida.setGroup(3);
  check(later() === 0, 'part 3: none dim', String(later()));
  qaida.setGroup(1);
  check(gridTiles().every((t) => t.tag === 'button'), 'a dim word is a button all the same: nothing is locked');
  check(gridTiles().every((t) => /^(the alif after the wow|the wow after the hamza|the wow that carries the long “aa”|every letter)\. Verse \d+:\d+\.$/.test(t.attrs['aria-label'])), 'every word is named for a screen reader: what is not read in it, and its verse', gridTiles()[0].attrs['aria-label']);
  check(gridTiles().every((t) => t.querySelector('.glyph').attrs['aria-hidden'] === 'true' && t.querySelector('.word-ref').attrs['aria-hidden'] === 'true'), 'and the word and its verse mark are hidden from a screen reader: the button carries the name');
  check(gridTiles().map((t) => t.querySelector('.word-ref').textContent).every((r, i) => r === taps[i].ref.split(':').slice(0, 2).join(':')), 'each one shows where in the Qur\'an it was copied from (surah:verse)');
  check(gridTiles().every((t, i) => unitsOfTile(t).map((u) => u.text).join('') === data[taps[i].ref].madani), 'every one on the board is the copied text, character for character (in Madani)');
  check(gridTiles().every((t, i) => unitsOfTile(t).filter((u) => u.role === 'silent').length === (taps[i].kind === 'none' ? 0 : 1)), 'a word with a letter not read lights that one; a word with none lights nothing');

  console.log('\nThe board: the same-sound line and the script lines');
  check(/^The alif at the end of a verb with a plural wow is written and not read/.test($('.same-line').textContent), 'part 1 starts on the row of the alif after a plural wow', $('.same-line').textContent);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'aawow'));
  check(/^A wow that only carries a long “aa” is not read as a wow\./.test($('.same-line').textContent) && /Madani writes a small alif/.test($('.same-line').textContent) && /khari zabar/.test($('.same-line').textContent), 'tapping a wow that carries "aa" says what each script does', $('.same-line').textContent);
  check($('.word-row[data-current]').attrs['data-mark'] === 'aawow' && all('.word-row').filter((r) => 'data-current' in r.attrs).length === 1, 'and the row it is about is the one lit');
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'none'));
  check(/^Every letter in these words is read\./.test($('.same-line').textContent), 'tapping a word with none says every letter is read', $('.same-line').textContent);
  qaida.setGroup(2);
  check(/^The wow after the hamza in these words/.test($('.same-line').textContent), 'part 2: the line is about the second row (the row it was on is not in part 2)', $('.same-line').textContent);
  qaida.setGroup(3);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'none'));
  qaida.setGroup(1);
  check(/^The alif at the end of a verb with a plural wow/.test($('.same-line').textContent), 'back to part 1, the line is about the first row again', $('.same-line').textContent);
  check(/small circle/.test($('.script-line').textContent) && !/nothing on it/.test($('.script-line').textContent), 'the Madani student sees the Madani line, and only that', $('.script-line').textContent);
  check($('.lead-line').hidden === true, 'and no line about a font');
  await w.setScript('indopak');
  check(/nothing on it/.test($('.script-line').textContent) && /Indo-Pak/.test($('.script-line').textContent) && !/small circle/.test($('.script-line').textContent), 'the Indo-Pak student sees the Indo-Pak line, and only that', $('.script-line').textContent);
  check($('.lead-line').hidden === false && /Indo-Pak print/.test($('.lead-line').textContent) && /stand-in/.test($('.lead-line').textContent), 'and is told once that the Qur\'an\'s own Indo-Pak print is drawn in a stand-in until its font is added', $('.lead-line').textContent);
  await w.setScript('madani');

  console.log('\nThe two scripts');
  const glyphOfWord = (ref) => gridTiles().find((t) => t.attrs['data-id'] === ref).querySelector('.glyph').textContent;
  await w.setScript('indopak');
  check(taps.every((f) => glyphOfWord(f.ref) === data[f.ref].indopak), 'Indo-Pak: every one on the board is the copied Indo-Pak text, character for character');
  check(gridTiles().every((t, i) => unitsOfTile(t).filter((u) => u.role === 'silent').length === (taps[i].kind === 'none' ? 0 : 1)), 'and the letter lit is still the one letter not read: found by the bare letter, not by a circle');
  check($('.title-mark').textContent === cc(ALIF, CIRCLE) && all('.band-glyph')[0].textContent === kit.sampleOf(1, 'indopak'), 'the title glyph is the same, and the rail follows the script');
  await w.setScript('madani');
  check(taps.every((f) => glyphOfWord(f.ref) === data[f.ref].madani), 'Madani: every one is the copied Madani text, character for character');

  console.log('\nThe drill: tap the letter');
  qaida.clear();
  await sleep(20);
  check($('.ask').textContent === ASK.tap, 'part 1 asks "Which letter is not read? Tap it."', $('.ask').textContent);
  let item = shown();
  check(Boolean(item) && item.tap && choices().length === 0, 'part 1: the answers are the letters in the word, so there is nothing under it', String(choices().length));
  check(wordUnits().length === item.units.length && wordUnits().every((u, i) => u.classes().includes('tap') && u.attrs.role === 'button' && u.attrs.tabindex === '0' && u.attrs['data-id'] === String(i) && u.attrs['data-role'] === undefined),
    'every letter of the word is a button with its place, and none is lit', String(wordUnits().length));
  check(wordUnits().map((u) => u.textContent).join('') === data[item.ref].madani && $('.prompt-word').attrs.role === 'group' && $('.prompt-word').attrs['aria-hidden'] === undefined && $('.prompt-word').attrs['aria-labelledby'] === 'ask',
    'the word is the copied text, joined; the group is not hidden from a screen reader and is named by the question');
  check(wordUnits().every((u, i) => u.attrs['aria-label'] === `Letter ${i + 1} of ${wordUnits().length}`), 'each letter says its place for a screen reader ("Letter 1 of 5")', wordUnits()[0].attrs['aria-label']);
  answerRight();
  check($('.verdict').textContent === `Yes — ${item.name} is not read.`, 'right: "Yes — the alif after the wow is not read."', $('.verdict').textContent);
  check(wordUnits().filter((u) => u.attrs['data-verdict'] === 'right').length === 1 && wordUnits().indexOf(wordUnits().find((u) => u.attrs['data-verdict'] === 'right')) === Number(item.answerId)
    && wordUnits().filter((u) => u.attrs['data-verdict'] === 'dim').length === wordUnits().length - 1 && wordUnits().every((u) => u.attrs['aria-disabled'] === 'true'),
  'the right letter is marked right, the others dim, and none can be tapped again');
  check($('.seat-echo').hidden === true, 'and no line under a right answer');
  await sleep(20);
  item = shown();
  answerWrong();
  const wrongAt = wordUnits().findIndex((u) => u.attrs['data-verdict'] === 'wrong');
  check($('.verdict').textContent === `Not that one. In this word, ${item.name} is not read.` && wrongAt >= 0 && wrongAt !== Number(item.answerId) && wordUnits()[Number(item.answerId)].attrs['data-verdict'] === 'right',
    'wrong: says it is not that one and what is not read in this word, with no scolding; the letter chosen is marked, and the right one is shown', $('.verdict').textContent);
  const echoUnits = $('.seat-echo').querySelectorAll('.seat-echo-word .unit');
  check($('.seat-echo').hidden === false && echoUnits.map((u) => u.textContent).join('') === data[item.ref].madani && echoUnits.filter((u) => u.attrs['data-role'] === 'silent').length === 1 && echoUnits.findIndex((u) => u.attrs['data-role'] === 'silent') === Number(item.answerId),
    'under a wrong answer: the same word again, whole, with the letter not read lit', String(echoUnits.length));
  check($('.seat-echo').textContent.startsWith(echoOf(`${item.kind}-madani`)), 'and the line for its kind says what shows it, in Madani', $('.seat-echo').textContent);
  check(gridTiles().filter((t) => 'data-missed' in t.attrs).map((t) => t.attrs['data-id']).join() === item.ref, 'and the word just missed keeps its gold edge on the board, that one tile');
  check($('.word-row[data-current]').attrs['data-mark'] === item.mark, 'the board\'s row follows the miss');
  check($('.after').hidden === false && $('.after').attrs['data-kind'] === 'wrong' && $('.after-name').textContent === item.name && $('.after-glyph').textContent === item.glyph, 'the strip under a miss names what is not read and offers Hear it, Say it, Write it and Next');
  click($('.after .trace'));
  check(w.opened.length === 1 && w.opened[0][0] === item.glyph && w.opened[0][1] === 'this one', '"Write it" opens the writing board on the whole word, titled "Trace this one" (a text field)', w.opened.map((o) => o.join(' / ')).join());
  const last = qaida.lastItem;
  check(Boolean(last) && last[0] === 'words' && last[1] === item.ref && last[2] === 'this one' && last[3] === item.glyph, 'the top bar\'s Say it opens on the word: kept under its reference, shown as its text', last ? last.join(' / ') : 'none');
  click($('.next-question'));
  await sleep(20);
  check($('.seat-echo').hidden === true && !gridTiles().some((t) => 'data-missed' in t.attrs) && wordUnits().every((u) => u.attrs['data-verdict'] === undefined), 'the next question clears the line, the gold edge and the marks on the letters');
  // From the keyboard: Enter on a letter answers it, and a right answer then waits for Next (it never moves focus out from under a keyboard).
  item = shown();
  press(wordUnits()[Number(item.answerId)], 'Enter');
  check(/^Yes — /.test($('.verdict').textContent) && $('.after').hidden === false, 'Enter on a letter answers it, and a right answer from the keyboard waits for Next');
  click($('.next-question'));
  await sleep(20);
  item = shown();
  press(wordUnits()[0], 'x');
  check($('.verdict').textContent === '', 'another key does nothing');
  press(wordUnits()[0], ' ');
  check($('.verdict').textContent !== '', 'Space answers too');
  click($('.next-question'));
  await sleep(20);

  console.log('\nThe drill: is the lit letter read?');
  qaida.setGroup(2);
  await sleep(10);
  check($('.ask').textContent === ASK.lit, 'part 2 asks "Is the lit letter read?"', $('.ask').textContent);
  item = shown();
  check(Boolean(item) && !item.tap && wordUnits().length === item.units.length && wordUnits().filter((u) => u.attrs['data-role'] === 'ask').length === 1 && wordUnits().every((u) => !u.classes().includes('tap'))
    && $('.prompt-word').attrs['aria-hidden'] === 'true', 'one letter of the word is lit, none is a button, and the word is hidden from a screen reader (the question and answers carry it)');
  check(choices().length === 2 && choices().map((c) => c.textContent).sort().join('|') === 'Not read|Read' && choices().every((c) => c.attrs['data-face'] === 'name'), 'two answers: Not read and Read', choices().map((c) => c.textContent).join(' | '));
  answerRight();
  check($('.verdict').textContent === `Yes — ${item.name}.`, 'right: "Yes — Read." or "Yes — Not read."', $('.verdict').textContent);
  await sleep(20);
  item = shown();
  answerWrong();
  const other = item.kind === 'not' ? 'Read' : 'Not read';
  check($('.verdict').textContent === `You chose “${other}”. This one is “${item.name}”.`, 'wrong: says what it chose and what it is, once', $('.verdict').textContent);
  const eu = $('.seat-echo').querySelectorAll('.seat-echo-word .unit');
  check(eu.map((u) => u.textContent).join('') === data[item.ref].madani && eu.filter((u) => u.attrs['data-role']).length === 1 && eu.find((u) => u.attrs['data-role']).attrs['data-role'] === (item.kind === 'not' ? 'silent' : 'read'),
    'under it: the same word, with that letter lit', eu.map((u) => u.attrs['data-role'] || '-').join());
  check($('.seat-echo').textContent.startsWith(item.kind === 'not' ? echoOf(`${item.wordKind}-madani`) : echoOf('read-madani')), 'and the line says why, in Madani', $('.seat-echo').textContent);
  check(gridTiles().filter((t) => 'data-missed' in t.attrs).map((t) => t.attrs['data-id']).join() === item.ref, 'the board\'s gold edge is on the word\'s own tile, though the item\'s id has "#not" in it');
  click($('.next-question'));
  await sleep(20);

  console.log('\nThe drill: all together, with "none"');
  qaida.setGroup(3);
  await sleep(10);
  const seen = { tap: 0, lit: 0, none: 0, noneButton: 0 };
  const lines = new Set();
  let askOff = 0;
  let verdictOff = 0;
  for (let i = 0; i < 90; i += 1) {
    item = shown();
    if (!item) { verdictOff += 1; break; }
    const t = tapping();
    seen[t ? 'tap' : 'lit'] += 1;
    if ($('.ask').textContent !== (t ? ASK.tapnone : ASK.lit)) askOff += 1;
    if (t) {
      if (choices().length === 1 && choices()[0].textContent === 'No letter is left out') seen.noneButton += 1;
      else askOff += 1;
      if (item.kind === 'none') seen.none += 1;
    }
    // Rotate the four things that can be done to a tap question, so every verdict line is read once.
    const how = i % 4;
    if (t && how === 2) {
      // "none" on a word that has a letter not read, and a letter on a word that has none: the two crossed answers.
      if (item.kind === 'none') { click(wordUnits()[0]); if ($('.verdict').textContent !== 'Every letter in this word is read.') verdictOff += 1; lines.add('none-tapped'); }
      else { click(choices()[0]); if ($('.verdict').textContent !== `This word has a letter that is not read: ${item.name}.`) verdictOff += 1; lines.add('said-none'); }
    } else if (t && how === 1 && item.kind === 'none') {
      click(choices()[0]);
      if ($('.verdict').textContent !== 'Yes — every letter in this word is read.') verdictOff += 1;
      lines.add('none-right');
    } else {
      answerRight();
      if (t && item.kind !== 'none' && $('.verdict').textContent !== `Yes — ${item.name} is not read.`) verdictOff += 1;
    }
    if ($('.after').hidden === false) click($('.next-question'));
    else qaida.next();
    await sleep(3);
  }
  check(seen.tap >= 20 && seen.lit >= 20 && seen.none >= 4 && seen.noneButton === seen.tap, 'part 3 mixes both questions, asks the words with none, and every tap question has "No letter is left out" under it', JSON.stringify(seen));
  check(askOff === 0, 'and its question line is the tap-or-none one for a tap and the lit-letter one for a lit letter', String(askOff));
  check(verdictOff === 0 && lines.size === 3, 'and the verdict says its own line for each outcome: the right letter, a letter in a word of none, "none" in a word that has a letter not read, and "none" right', `${[...lines].join()} / ${verdictOff} off`);

  console.log('\nEvery part, answered right all the way through');
  qaida.clear();
  await sleep(20);
  const partRun = async (n, count, kindsWanted) => {
    qaida.setGroup(n);
    await sleep(10);
    const asked = new Set();
    let off = 0;
    for (let i = 0; i < count; i += 1) {
      const shownNow = shown();
      if (!shownNow) { off += 1; break; }
      asked.add(shownNow.kind === 'not' || shownNow.kind === 'read' ? 'lit' : 'tap');
      const wanted = shownNow.tap ? (n >= 3 ? ASK.tapnone : ASK.tap) : ASK.lit;
      if ($('.ask').textContent !== wanted) off += 1;
      answerRight();
      if ($('.after').hidden === false) click($('.next-question'));
      else qaida.next();
      await sleep(3);
    }
    check(kindsWanted.every((k) => asked.has(k)) && [...asked].every((k) => kindsWanted.includes(k)) && off === 0, `part ${n} asks ${kindsWanted.join(' and ')} questions, each with its own line`, `${[...asked].join()} / ${off} off`);
  };
  await partRun(1, 30, ['tap']);
  await partRun(2, 30, ['lit']);
  await partRun(3, 80, ['tap', 'lit']);
  qaida.clear();
  await sleep(20);

  console.log('\nThe other script: Indo-Pak says its own lines');
  await w.setScript('indopak');
  qaida.setGroup(1);
  await sleep(10);
  item = shown();
  check(wordUnits().map((u) => u.textContent).join('') === data[item.ref].indopak && wordUnits().length === item.units.length, 'the question shows the copied Indo-Pak word, one button a letter');
  check(Number(item.answerId) === kit.notReadAt(wordUnits().map((u) => u.textContent), 'indopak', item.wordKind), 'and the letter that is not read is found by the bare letter: no circle is there to look for');
  answerWrong();
  check($('.seat-echo').textContent.startsWith(echoOf(`${item.kind}-indopak`)), 'a wrong answer says the Indo-Pak line for the word\'s kind', $('.seat-echo').textContent);
  click($('.next-question'));
  await sleep(20);
  qaida.setGroup(2);
  await sleep(10);
  for (let i = 0; i < 30 && !(shown() && shown().kind === 'read'); i += 1) { qaida.next(); await sleep(3); }
  item = shown();
  answerWrong();
  check(item.kind === 'read' && $('.seat-echo').textContent.startsWith(echoOf('read-indopak')), 'and for a lit letter that is read, the line about the mark on it', $('.seat-echo').textContent);
  await w.setScript('madani');
  qaida.setGroup(1);

  console.log('\nThe names follow the student');
  await w.setNames('zabar');
  check($('.prev span').textContent === 'Previous: The wavy line' && $('.eyebrow').textContent === 'Lesson 21 of 29' && $('h1').textContent === 'Letters that are not read',
    'in the zabar set the title and the Previous label are the same: nothing on this page is a mark\'s name');
  await w.setNames('fatha');

  console.log('\nFinishing');
  qaida.clear();
  await sleep(20);
  check(shell.isDone(21) === false, 'nothing is done to begin with');
  qaida.setGroup(1);
  const master = (n) => {
    for (const f of forms.filter((x) => x.parts.includes(n))) for (let i = 0; i < 3; i += 1) shell.recordAnswer(21, kit.idOf(f), true);
  };
  master(1);
  qaida.render();
  await sleep(20);
  check(shell.isDone(21) === false && $('.ready-note').hidden === false, 'part 1 known: the part says you seem ready, and the lesson is not done (part 3 gates it)');
  master(3);
  qaida.setGroup(3);
  await sleep(20);
  check(shell.isDone(21) === true && $('.end-line').textContent.startsWith('You can tell which letter in a word is written and not read'), 'every item known: the lesson is done, and says so', $('.end-line').textContent);
  check(shell.masteredCount(21) === 30, 'and the home\'s count is the thirty', String(shell.masteredCount(21)));
  check(shell.drillOf(21).total === 30, 'the home reads the whole lesson\'s total, 30, and not the open part\'s', String(shell.drillOf(21).total));
  qaida.clear();
  await sleep(20);
  check(shell.isDone(21) === false && shell.masteredCount(21) === 0, 'Start again clears it');

  console.log('\nThe walkthrough');
  const units = () => $('.spell-glyph').children.map((u) => u.textContent);
  const states = () => $('.spell-glyph').children.map((u) => u.classes().filter((c) => c !== 'unit')[0]);
  const stepsOf = () => {
    const captions = [$('.spell-caption').textContent];
    while (!$('.spell-next').hidden && captions.length < 12) { click($('.spell-next')); captions.push($('.spell-caption').textContent); }
    return captions;
  };
  const [a, b, c] = kit.WALK;
  check(all('.word-step').length === 3, 'three walkthrough items');
  check(units().join('') === data[a.ref].madani && units().length === kit.lettersOf(data[a.ref].madani).length, 'item 1 is the copied word, one unit a letter', String(units().length));
  const firstPiece = kit.unitsOf(a.ref, 'madani', 'plural').filter((u) => u.step === 0).length;
  check(states().join() === [...Array(firstPiece).fill('active'), ...Array(units().length - firstPiece).fill('unread')].join() && firstPiece === units().length - 1, 'step 1 lights every letter up to the alif that is not read, and nothing else', states().join());
  const c1 = stepsOf();
  check(c1.length === 3 && c1[0] === `The letters up to the wow: “${a.sounds[0]}”. The alif after the wow is next.` && c1[1] === 'The alif is written and not read: say nothing for it.' && c1[2] === `The whole word: ${a.whole}.`, 'item 1: three steps, the letters, the alif that is not read, the whole', c1.join(' / '));
  check(states().every((s) => s === 'read'), 'the last step settles every letter to plain');
  check($('.spell-meaning').textContent === `It means “${a.meaning}.”`, 'and the meaning shows on the last step', $('.spell-meaning').textContent);
  click($('.spell-nextword'));
  check(units().join('') === data[b.ref].madani, 'item 2 is the copied word with a wow after a hamza');
  const c2 = stepsOf();
  check(c2.length === 3 && c2[0] === `The letters before the wow: “${b.sounds[0]}”.` && c2[1] === `The wow is written and not read. The rest: “${b.sounds[1]}”.` && c2[2] === `The whole word: ${b.whole}.`, 'item 2: the letters before the wow, the wow and the rest, the whole', c2.join(' / '));
  click($('.spell-nextword'));
  check(units().join('') === data[c.ref].madani, 'item 3 is the copied word with a wow that carries "aa"');
  const c3 = stepsOf();
  check(c3.length === 3 && c3[0] === `The letters before the wow: “${c.sounds[0]}”.` && c3[1] === `The wow is not read as a wow. It carries the long “aa”: “${c.sounds[1]}”.` && c3[2] === `The whole word: ${c.whole}.`, 'item 3: the letters before the wow, the wow that carries the "aa", the whole', c3.join(' / '));
  check($('.spell-meaning').textContent === `It means “${c.meaning}.”`, 'and the meaning shows on the last step', $('.spell-meaning').textContent);
  await w.setScript('indopak');
  click(all('.word-step')[0]);
  check(units().join('') === data[a.ref].indopak, 'in Indo-Pak the walkthrough shows the copied Indo-Pak text', units().join('') === data[a.ref].madani ? 'same' : 'different');
  await w.setScript('madani');

  console.log('\nThe ways out: Previous goes to Lesson 20, Next to Lesson 22 (built since: a real link)');
  check($('.prev').attrs.href === 'lesson-20.html' && $('.prev span').textContent === 'Previous: The wavy line', 'Previous goes to Lesson 20', $('.prev span').textContent);
  check($('.spell-more a').attrs.href === 'exercise-21.html' && fs.existsSync(path.join(dir, 'exercise-21.html')), 'Practice reading goes to exercise-21.html, which exists');
  check($('.next span').textContent === 'Next: Stopping' && !$('.next').attrs['data-last'], 'Next reads "Next: Stopping"', $('.next span').textContent);
  w.location.href = '';
  click($('.next'), 1);
  check(w.location.href === 'lesson-22.html', 'and it goes to lesson-22.html, which is built now (it said "not built yet" until Lesson 22 was)', String(w.location.href));

  console.log('\nThe home');
  const home = boot();
  const row = home.shell.LESSONS.find((l) => l.n === 21);
  check(row.built === true && row.href === 'lesson-21.html' && row.progress === 'drill' && row.part === 2 && row.cp === undefined && !row.tail, 'the home\'s row 21 is built, a drill, in the second part, with no `cp`, and leads to lesson-21.html');
  check(home.shell.LESSONS.find((l) => l.n === 20).built && home.shell.LESSONS.find((l) => l.n === 22).built && !home.shell.LESSONS.find((l) => l.n === 23).built, 'and 20 and 22 are built and 23 is not');

  console.log('\nThe markup');
  check(!NOMARK.test(w.raw), 'lesson-21.html holds no literal combining mark');
  check(!/[ء-ي]/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<dialog class="chooser"[\s\S]*?<\/dialog>/, '')), 'and no Arabic on the lesson itself: every word is copied into rule-words.js and drawn by rule-lesson.js');
  check(/&#x627;&#x6DF;</.test(w.raw), 'the title glyph is an alif with the small circle, as numeric references');
  const at = (file) => w.raw.indexOf(`<script src="${file}" defer></script>`);
  check(at('rules.js') > 0 && at('rules.js') < at('rule-words.js') && at('rule-words.js') < at('silent.js') && at('silent.js') < at('rule-lesson.js') && at('spell.js') > at('rule-lesson.js') && at('ends.js') === -1 && at('al.js') === -1 && at('wasl.js') === -1 && at('madd.js') === -1,
    'the scripts load in order: rules.js, rule-words.js, silent.js, then the page\'s code and spell.js (no other kit is needed here)');
  const visible = w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/data-rule="[^"]*"/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|leen|qalqalah|idgham|ikhfa|izhar|ghunna|tajweed|madd)\b/i.test(visible), 'no scolding and no tajweed word on the page (the plain-names rule; docs/pass-2/03 §4)');
  check(!/\b29\b/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace('Lesson 21 of 29', '')), 'no "29" on the page but the lesson count');
  check((w.raw.match(/data-words(-attr)?=/g) || []).length > 60, 'every line of wording is a text field (data-words / data-words-attr)');
  const wordsAttrOK = [...w.raw.matchAll(/data-words-attr="([^"]*)"/g)].every((m) => m[1].split(';').every((pair) => pair.includes('|')));
  check(wordsAttrOK, 'and every data-words-attr entry is "attribute|label"');
  const boardTag = w.raw.match(/<section class="marks-board[\s\S]*?>\s*<div class="section-head">/)[0];
  const boardAttrs = [...boardTag.matchAll(/\s(data-[\w-]+)="/g)].map((m) => m[1]).filter((x) => x !== 'data-words-attr');
  const boardFields = boardTag.match(/data-words-attr="([^"]*)"/)[1].split(';').map((p) => p.split('|')[0]);
  check(boardAttrs.every((x) => boardFields.includes(x)) && boardFields.every((x) => boardAttrs.includes(x)), 'every line of the board\'s wording has its own text field, and no field is for a line that is not there', boardAttrs.filter((x) => !boardFields.includes(x)).concat(boardFields.filter((x) => !boardAttrs.includes(x))).join(', '));
  const numbered = [...boardTag.matchAll(/\s(data-(?:same|seat|script|title|row|sound|sample)[\w-]*)="([^"]*)"/g)].filter((m) => /\d/.test(m[2])).map((m) => m[1]);
  check(numbered.length === 0, 'no number is on the board, in any line of it', numbered.join(', '));
  for (const [name, re] of [['the spell block', /<section class="spell"[\s\S]*?>\s*<div class="section-head">/], ['the question', /<p class="ask"[\s\S]*?><\/p>/], ['the question\'s word', /<div class="prompt"[\s\S]*?>\s*<\/div>/], ['the answers', /<div class="choices"[\s\S]*?>\s*<\/div>/],
    ['the echo line', /<p class="seat-echo"[\s\S]*?><\/p>/], ['the verdict', /<p class="verdict"[\s\S]*?><\/p>/], ['the advice', /<div class="advice"[\s\S]*?>\s*<div class="struggle"/], ['the names', /<span hidden\s[\s\S]*?><\/span>/]]) {
    const tag = w.raw.match(re)[0];
    const attrs = [...tag.matchAll(/\s(data-[\w-]+)="/g)].map((m) => m[1]).filter((x) => x !== 'data-words-attr');
    const fields = (tag.match(/data-words-attr="([^"]*)"/) || ['', ''])[1].split(';').map((p) => p.split('|')[0]);
    check(attrs.every((x) => fields.includes(x)), `every line of ${name} has its own text field`, attrs.filter((x) => !fields.includes(x)).join(', '));
  }
  check(['plural', 'ulee', 'aawow'].every((k) => ['madani', 'indopak'].every((s) => new RegExp(`data-line-${k}-${s}="[^"]+"`).test(w.raw))) && /data-line-none="[^"]+"/.test(w.raw) && /data-line-read-madani="[^"]+"/.test(w.raw) && /data-line-read-indopak="[^"]+"/.test(w.raw),
    'the echo has a line for each kind and each script, one for none, and one for each script for a letter that is read');

  console.log('\nThe reading page');
  let ex;
  try {
    ex = run('exercise-21.html', ['shell.js', 'marks.js', 'rules.js', 'rule-words.js', 'silent.js', 'exercise.js'], { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against exercise-21.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  await sleep(20);
  const cells = () => ex.all('.mashq-word');
  check(cells().length === 12 && ex.ctx.qaida.kind === 'exercise' && ex.ctx.qaida.count === 12, 'exercise-21.html has twelve words');
  check(/data-rule="silent"/.test(ex.raw) && !/data-mark=/.test(ex.raw) && /href="lesson-21\.html"/.test(ex.raw) && /data-next-fatha="Next: Stopping"/.test(ex.raw) && !/data-last/.test(ex.raw), 'it teaches the silent rule, goes back to Lesson 21 and on to Lesson 22');
  check(/^Twelve of the Qur’an’s own words/.test(ex.$('.exercise-lede').textContent), 'its line says so', ex.$('.exercise-lede').textContent);
  const wordText = () => cells().map((cell) => cell.children.find((k) => k.attrs.lang === 'ar').textContent);
  check(wordText().join('|') === kit.READING.map((ref) => data[ref].madani).join('|'), 'in Madani the twelve are the copied Madani text, in the order silent.js lists them, character for character');
  await ex.setScript('indopak');
  check(wordText().join('|') === kit.READING.map((ref) => data[ref].indopak).join('|'), 'in Indo-Pak, the copied Indo-Pak text');
  check(!NOMARK.test(ex.raw), 'and exercise-21.html holds no literal combining mark');
}

pageHalf().then(() => {
  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
});
