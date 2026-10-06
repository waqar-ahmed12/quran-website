// Checks for Lesson 20's word layer (madd.js, on rules.js, with the Qur'an's own words and pairs in rule-words.js) and, below it, the rule
// page (rule-lesson.js against the real lesson-20.html in a small hand-made DOM). QAIDA-BUILD.md step P2; docs/lesson-20/02 §3.
//
//   node tools/qaida-lesson20-check.js
//
// The data half loads the real shell.js, practice.js, marks.js, rules.js, rule-words.js and madd.js into a scratch context with an in-memory
// stand-in for localStorage, as tools/qaida-lesson19-check.js does. The page half is at the foot of this file.
//
// The same limits as every other page check: nothing is drawn and no CSS runs, so it cannot tell whether a pair fits its tile, whether
// the lit band sits on the right letters, or how a face draws the wavy line. Those were measured in the browser pane at the build
// (docs/lesson-20/02 §3; §4 is the user's list). What it proves is what only a script can: that every reference the lesson names is in the
// copied file, in both scripts, and that the copy is exact; that every word holds only what the student has met, and the wavy line in the
// three kinds that have one and in no other; that the long vowel, the line, and what follows it are where the lesson says, by the marks on
// them, in both scripts; that the lit parts, put back together, are the whole word or pair; and that the ids, the two scripts, the engine's
// questions, the board, the lines and the ways out do what they say. Prints PASS or FAIL per check; the exit code is the number that failed.
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

function boot(saved, files = ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'madd.js']) {
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
  return { shell: ctx.qaidaShell, practice: ctx.qaidaPractice, marks: ctx.qaidaMarks, rules: ctx.qaidaRules, kit: ctx.qaidaRules.KITS.madd, words: ctx.qaidaRuleWords, store };
}

const cc = (...codes) => String.fromCharCode(...codes);
const cps = (text) => [...text].map((c) => c.codePointAt(0));
const ALIF_WASLA = 0x0671;
const ALIF = 0x0627;
const WAW = 0x0648;
const YAA = 0x064A;
const SPACE = 0x20;
const FATHA = 0x064E;
const KASRA = 0x0650;
const DAMMA = 0x064F;
const SHADDA = 0x0651;
const JAZAM_I = 0x06E1; // Indo-Pak's jazam; Madani's is U+0652
const MADDAH = 0x0653;
const MADDAH_SMALL = 0x06E4; // Indo-Pak's other wavy line: no word in this lesson holds it
const HAMZAS = [0x0621, 0x0623, 0x0624, 0x0625, 0x0626];
// What a word may hold: a letter of the 29 (or the alif wasla), tatweel, a space, the marks the student has met by Lesson 19 (the harakat, the
// tanween, the shadda, the jazam in both drawings, the small alif) and now the wavy line. No stop sign, no silent-letter circle, no direction mark.
const isLetter = (c) => (c >= 0x0621 && c <= 0x064A) || c === ALIF_WASLA;
const ALLOWED_MARK = new Set([0x064B, 0x064C, 0x064D, 0x064E, 0x064F, 0x0650, 0x0651, 0x0652, 0x0670, JAZAM_I, MADDAH]);
const okChar = (c) => isLetter(c) || c === 0x0640 || c === SPACE || ALLOWED_MARK.has(c);

const FORM_TO_NAME = { id: 'form-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0 };
const ROWS_ALL = ['plain', 'word', 'plain-next', 'next', 'heavy'];
const kitSource = fs.readFileSync(path.join(dir, 'madd.js'), 'utf8');
const REF_RE = /['"](\d{1,3}:\d{1,3}:\d{1,3}(?:-\d{1,3})?)['"]/g;
const namedIn = (file) => new Set([...fs.readFileSync(path.join(dir, file), 'utf8').matchAll(REF_RE)].map((m) => m[1]));

console.log('The data layer: rule-words.js and madd.js');
{
  const { shell, marks, rules, kit, words } = boot();
  const forms = kit.formsOf();
  const data = words.words;

  // The copy: every reference the lesson names is in the copied file, in both scripts, and the file holds nothing else.
  const named = namedIn('madd.js');
  check(named.size === 39 && [...named].every((ref) => data[ref] && data[ref].madani && data[ref].indopak), `every reference madd.js names (${named.size}) is in rule-words.js, in both scripts`, String(named.size));
  const alNamed = namedIn('al.js');
  const waslNamed = namedIn('wasl.js');
  const silentNamed = namedIn('silent.js');
  const stopNamed = namedIn('stop.js');
  check(Object.keys(data).every((ref) => named.has(ref) || alNamed.has(ref) || waslNamed.has(ref) || silentNamed.has(ref) || stopNamed.has(ref)) && Object.keys(data).length === named.size + alNamed.size + waslNamed.size + silentNamed.size + stopNamed.size,
    'and rule-words.js holds no word that no kit file names (the fetch tool reads the references out of the kit files), and each is named once');
  check([...named].every((ref) => !alNamed.has(ref) && !waslNamed.has(ref)), 'no reference is named by two lessons: each lesson\'s words are its own');
  const fileText = fs.readFileSync(path.join(dir, 'rule-words.js'), 'utf8');
  check(!/[^\x00-\x7f]/.test(fileText.replace(/^\/\/.*$/gm, '')), 'the copied data is ASCII with \\u escapes: a combining mark is never a character you cannot see in a diff');
  check(!/[؀-ۿ]/.test(kitSource) && !/[ً-ْٰۡ]/.test(kitSource), 'madd.js holds no Arabic and no combining mark: every word is a reference (docs/pass-2/02 §3)');
  check(/KIT_FILES = \[[^\]]*'madd\.js'/.test(fs.readFileSync(path.join(dir, '..', '..', 'tools', 'fetch-qaida-words.js'), 'utf8')), 'the fetch tool reads its references from madd.js');

  // A pair is its two words and ONE space, exactly as Quran.com sends them; a single word has none.
  const spaced = (ref) => ref.includes('-');
  check([...named].every((ref) => ['madani', 'indopak'].every((s) => (data[ref][s].split(' ').length === (spaced(ref) ? 2 : 1)) && !data[ref][s].startsWith(' ') && !data[ref][s].endsWith(' '))),
    'a reference with a range is two words and one space between them; every other is one word, in both scripts');

  // What is in each word: only what the student has met, and the wavy line only where the lesson says.
  let badChars = 0;
  let notLetters = 0;
  let smallMadd = 0;
  for (const ref of named) {
    for (const script of ['madani', 'indopak']) {
      const text = data[ref][script];
      if (!cps(text).every(okChar)) badChars += 1;
      if (cps(text).includes(MADDAH_SMALL)) smallMadd += 1;
      if (kit.lettersOf(text).some((u) => !cps(u).some((c) => isLetter(c) || c === 0x0640 || c === SPACE))) notLetters += 1;
    }
  }
  check(badChars === 0, 'every word and pair, in both scripts, holds only letters, tatweel, a space, the marks Lessons 4-19 taught and the wavy line (no stop sign, no silent-letter circle, no direction mark)', String(badChars));
  check(smallMadd === 0, 'and the wavy line is U+0653 everywhere: the small high madda U+06E4 is in no word here, so the student meets one sign', String(smallMadd));
  check(notLetters === 0, 'and splitting one into letters with their marks leaves no lone mark');

  // The marks say what the lesson says (docs/lesson-20/01 §4), in both scripts, for every form.
  const baseOf = (u) => cps(u).find((c) => isLetter(c) || c === 0x0640 || c === SPACE);
  const marksOf = (u) => cps(u).filter((c) => !(isLetter(c) || c === 0x0640 || c === SPACE));
  const lineOf = (units) => units.findIndex((u) => marksOf(u).includes(MADDAH));
  const problems = [];
  const prefix = (kind) => forms.filter((f) => f.kind === kind);
  for (const f of forms) {
    for (const script of ['madani', 'indopak']) {
      const units = kit.lettersOf(data[f.ref][script]);
      const space = units.findIndex((u) => u === ' ');
      const why = (message) => problems.push(`${f.ref} ${script}: ${message}`);
      const lines = units.filter((u) => marksOf(u).includes(MADDAH)).length;
      if (['plain', 'plain-next'].includes(f.kind)) {
        if (lines !== 0) why('a word with no wavy line holds none');
        const at = kit.longVowelAt(units, space >= 0 ? space : units.length);
        if (at < 0) why('has a long vowel');
        if (f.kind === 'plain-next') {
          if (at !== space - 1) why('the long vowel is the last letter of the first word');
          const first = baseOf(units[space + 1]);
          if (first === ALIF || first === ALIF_WASLA || HAMZAS.includes(first)) why('the next word is an ordinary word: no hamza, no alif');
          if (kit.hasMadd(units[space + 1])) why('and no line on it');
        }
      } else {
        if (lines !== 1) why('exactly one wavy line');
        const at = lineOf(units);
        if (baseOf(units[at]) !== ALIF || !marksOf(units[at - 1]).includes(FATHA) || marksOf(units[at]).filter((c) => c !== MADDAH).length) why('the line is on a bare alif after a zabar');
        if (f.kind === 'word') {
          if (!HAMZAS.includes(baseOf(units[at + 1]))) why('a hamza follows the line, in the word');
        } else if (f.kind === 'next') {
          if (at !== space - 1) why('the line is on the last letter of the first word');
          const first = units[space + 1];
          if (script === 'madani' && !HAMZAS.includes(baseOf(first))) why('the next word starts with a hamza (an alif seat)');
          if (script === 'indopak' && !(baseOf(first) === ALIF && marksOf(first).some((c) => [FATHA, KASRA, DAMMA].includes(c)))) why('the next word starts with an alif that carries a vowel (the hamza, in Indo-Pak)');
        } else if (f.kind === 'heavy') {
          if (!marksOf(units[at + 1]).includes(SHADDA)) why('a shadda is on the letter after the line');
        }
      }
    }
  }
  check(problems.length === 0, 'the marks say what the lesson says, in both scripts: a long vowel with no line, a line on a bare alif after a zabar, a hamza or a shadda right after it, the next word\'s hamza', problems.slice(0, 4).join(' | '));
  check(forms.filter((f) => f.kind === 'next').every((f) => kit.lettersOf(data[f.ref].madani).findIndex((u) => u === ' ') > 0), 'every pair of the next-word kind is a pair');

  // The lists: numbers and no overlap.
  check(rules.RULES.madd.id === 'madd' && rules.RULES.madd.lesson === 20 && rules.RULES.madd.parts === 4, 'a fifth rule, "madd", lesson 20, four parts');
  check(forms.length === 24 && kit.PLAIN.length === 5 && kit.WORD.length === 5 && kit.PLAIN_NEXT.length === 4 && kit.NEXT.length === 5 && kit.HEAVY.length === 5,
    'twenty-four forms: five with no line, five with a line before a hamza in the word, four pairs with no line, five with a line before the next word\'s hamza, five before a shadda');
  const refs = forms.map((f) => f.ref);
  check(new Set(refs).size === 24, 'no word or pair is in two lists');
  check(kit.READING.length === 12 && new Set(kit.READING).size === 12 && kit.READING.every((ref) => !refs.includes(ref) && data[ref]), 'the reading page\'s twelve are twelve other words and pairs than the drill\'s');
  check(kit.READING.filter((ref) => ref.includes('-')).length === 4 && kit.READING.filter((ref) => !ref.includes('-')).length === 8, 'eight single words and four pairs, so the reading page has both');
  check(kit.WALK.length === 3 && kit.WALK.map((w) => w.kind).join() === 'word,next,heavy' && kit.WALK.every((w) => w.sounds.length === 2 && w.whole && w.meaning && data[w.ref] && !refs.includes(w.ref) && !kit.READING.includes(w.ref)),
    'the walkthrough is three others: a word with a hamza, a pair and a word with a shadda, each with two sounds, a whole and a meaning');
  // The reading page's words are of the same three families, and the lesson's rules hold for them too.
  const readingBad = kit.READING.filter((ref) => ['madani', 'indopak'].some((s) => !cps(data[ref][s]).every(okChar)));
  check(readingBad.length === 0, 'the reading page\'s twelve hold only what the student has met, in both scripts', readingBad.join());

  // Parts.
  const items = kit.itemsFor(shell);
  check(JSON.stringify(marks.sizes(items, [1, 2, 3, 4])) === '[10,9,10,24]', 'the four parts hold 10, 9, 10 and 24', JSON.stringify(marks.sizes(items, [1, 2, 3, 4])));
  check(prefix('plain').every((f) => f.parts.join() === '1,4') && prefix('word').every((f) => f.parts.join() === '1,3,4') && prefix('plain-next').every((f) => f.parts.join() === '2,4')
    && prefix('next').every((f) => f.parts.join() === '2,4') && prefix('heavy').every((f) => f.parts.join() === '3,4'),
    'a hamza in the word is met in parts 1, 3 and 4 (and again in the last), a hamza in the next word in 2 and 4, a shadda in 3 and 4, and the plain ones beside them in 1 or 2 and 4');
  check([1, 2, 3, 4].every((n) => new Set(rules.poolFor(items, n).map((i) => i.name)).size >= 2), 'every part holds at least two answers, so every question can be asked');

  // Ids: distinct, the same in both scripts, and never the Arabic.
  const ids = forms.map((f) => kit.idOf(f));
  check(new Set(ids).size === 24 && ids.every((id) => /^\d+:\d+:\d+(-\d+)?$/.test(id)), 'twenty-four distinct ids, each a reference and never a word\'s Arabic');
  const madani = boot();
  const indopak = boot();
  indopak.shell.state.script = 'indopak';
  const idsIn = (w) => w.kit.itemsFor(w.shell).map((item) => item.id);
  check(JSON.stringify(idsIn(madani)) === JSON.stringify(idsIn(indopak)), 'the same ids in both scripts: the glyphs differ, the ids do not');
  const glyphsM = madani.kit.itemsFor(madani.shell).map((i) => i.glyph);
  const glyphsI = indopak.kit.itemsFor(indopak.shell).map((i) => i.glyph);
  check(glyphsM.every((g, i) => g === data[ids[i]].madani) && glyphsI.every((g, i) => g === data[ids[i]].indopak), 'each item\'s glyph IS the copied text for the script in use, character for character');
  check(glyphsM.filter((g, i) => g !== glyphsI[i]).length >= 10, 'and the two scripts differ in many of them (the jazam, the hamza seat, at least)', String(glyphsM.filter((g, i) => g !== glyphsI[i]).length));

  // The lit parts, put back together, are the whole word or pair: nothing lost, nothing added, in both scripts.
  const whole = [...forms, ...kit.WALK].every((f) => ['madani', 'indopak'].every((script) => kit.unitsOf(f.ref, script, f.kind).map((u) => u.text).join('') === data[f.ref][script]));
  check(whole, 'the units of every word and pair, joined, are the copied text exactly, in both scripts');
  const roleAt = (f, script = 'madani') => kit.unitsOf(f.ref, script, f.kind).map((u) => u.role);
  const only = (list, at) => list.length > 0 && list.every((r, i) => (at[i] ? r === at[i] : r === ''));
  const spaceAt = (f, script = 'madani') => kit.lettersOf(data[f.ref][script]).findIndex((u) => u === ' ');
  const lit = (f, script) => {
    const units = kit.lettersOf(data[f.ref][script]);
    if (f.kind === 'plain') return { [kit.longVowelAt(units)]: 'long' };
    if (f.kind === 'plain-next') return { [spaceAt(f, script) - 1]: 'long' };
    const at = lineOf(units);
    return { [at]: 'long', [f.kind === 'next' ? spaceAt(f, script) + 1 : at + 1]: 'carry' };
  };
  for (const script of ['madani', 'indopak']) {
    check(forms.every((f) => only(roleAt(f, script), lit(f, script))), `${script}: every word lights exactly its places: the long vowel alone with no line; the long vowel with the line ("long") and what follows it ("carry"), a hamza or a shadda`);
  }
  check(forms.filter((f) => f.kind === 'plain').every((f) => roleAt(f).filter(Boolean).join() === 'long') && forms.filter((f) => ['word', 'next', 'heavy'].includes(f.kind)).every((f) => roleAt(f).filter(Boolean).join() === 'long,carry'), 'a plain word lights one place and a word with a line lights two');
  check(forms.filter((f) => ['word', 'next', 'heavy'].includes(f.kind)).every((f) => kit.unitsOf(f.ref, 'madani', f.kind).find((u) => u.role === 'long').text.includes(cc(MADDAH))), 'the place lit "long" in a word with a line is the letter that carries the line');
  const w0 = kit.WALK[0];
  const pieces = (ref, kind) => kit.unitsOf(ref, 'madani', kind).reduce((acc, u) => { acc[u.step] += u.text; return acc; }, ['', '']);
  check(pieces(kit.WALK[0].ref, 'word')[0].endsWith(cc(ALIF, MADDAH)) && pieces(kit.WALK[0].ref, 'word').join('') === data[w0.ref].madani
    && pieces(kit.WALK[1].ref, 'next')[0] === `${data[kit.WALK[1].ref].madani.split(' ')[0]} ` && pieces(kit.WALK[1].ref, 'next')[1] === data[kit.WALK[1].ref].madani.split(' ')[1]
    && pieces(kit.WALK[2].ref, 'heavy')[0].endsWith(cc(ALIF, MADDAH)) && pieces(kit.WALK[2].ref, 'heavy')[1].length > 0,
    'each unit says which piece of the walkthrough it belongs to: a word up to its long vowel and the rest, or a pair\'s first word and its second');

  // Names: how long the vowel is held, the same in both name sets.
  const names = items.map((i) => i.name);
  check(names.slice(0, 5).every((n) => n === 'Held normally') && names.slice(5, 10).every((n) => n === 'Held longer') && names.slice(10, 14).every((n) => n === 'Held normally')
    && names.slice(14, 19).every((n) => n === 'Held longer') && names.slice(19).every((n) => n === 'Held longest'), 'three names across the twenty-four: held normally, longer and longest', [...new Set(names)].join(' | '));
  check(names.filter((n) => n === 'Held normally').length === 9 && names.filter((n) => n === 'Held longer').length === 10 && names.filter((n) => n === 'Held longest').length === 5, '9, 10 and 5');
  const zn = boot({ v: 1, chosen: true, script: 'madani', names: 'zabar', grouping: 'families' });
  check(zn.kit.itemsFor(zn.shell).map((i) => i.name).join() === names.join(), 'in the zabar set every name is the same: no name here is a mark\'s');
  const custom = kit.itemsFor(shell, { templates: { plain: 'P', word: 'W', 'plain-next': 'Q', next: 'N', heavy: 'H' } });
  check(custom[0].name === 'P' && custom[5].name === 'W' && custom[10].name === 'Q' && custom[14].name === 'N' && custom[19].name === 'H', 'the templates are the only source of a name (a teacher\'s edit reaches every word)');
  kit.rename(items, shell, { plain: 'A', word: 'B', 'plain-next': 'C', next: 'D', heavy: 'E' });
  check(items[0].name === 'A' && items[5].name === 'B' && items[10].name === 'C' && items[14].name === 'D' && items[23].name === 'E', 'rename() rewrites every name in place');
  const fresh = kit.itemsFor(shell);
  check(fresh.every((i) => i.askGroup === undefined && i.marked === true && i.required === false && i.traceable === true && Array.isArray(i.family) && i.family.length === 0),
    'every item is marked, not required until a part makes it so, has no look-alike, and names no question: one question is asked all the way through');
  check(fresh.every((i) => i.kind === forms.find((f) => f.ref === i.id).kind && i.mark === forms.find((f) => f.ref === i.id).row), 'every item knows its kind and its row on the board');

  // Audio: none recorded, and none asked for by the recordings page.
  check(items.every((i) => i.audio.kind === 'words' && i.audio.glyph === i.id), 'a word\'s sound would be kept under the group "words", by its reference');

  // The board and the echo.
  const boards = kit.boards();
  check(boards.map((b) => b.id).join() === 'plain,word,plain-next,next,heavy' && boards.map((b) => b.cells.length).join() === '5,5,4,5,5', 'the board is five lists: no line (5), a hamza in the word (5), no line before the next word (4), a hamza in the next word (5), a shadda (5)');
  check(forms.filter((f) => f.pair).length === 9 && forms.filter((f) => !f.pair).length === 15 && forms.filter((f) => f.pair).every((f) => ['plain-next', 'next'].includes(f.kind)) && forms.every((f) => Boolean(f.pair) === f.ref.includes('-')), 'nine tiles are wide (a pair) and fifteen are one word');
  check(JSON.stringify(kit.samples().map((s) => s.kind)) === '["plain","word","heavy"]' && kit.samples().every((s) => data[s.ref] && refs.includes(s.ref)), 'the strip shows three words on their own, one for each length: no line, a line and a hamza, a line and a shadda, each a word of the drill');
  const lineFor = (i) => kit.echoOf(i).line;
  check(lineFor(fresh[0]) === 'linePlain' && lineFor(fresh[5]) === 'lineWord' && lineFor(fresh[10]) === 'linePlainNext' && lineFor(fresh[14]) === 'lineNext' && lineFor(fresh[19]) === 'lineHeavy'
    && fresh.every((i) => kit.echoOf(i).units.length === kit.lettersOf(data[i.id].madani).length), 'under a wrong answer: the same word again, lit, with the line for its kind');
  check(kit.firstRow(1) === 'word' && kit.firstRow(2) === 'next' && kit.firstRow(3) === 'heavy' && kit.firstRow(4) === 'plain'
    && kit.rowInPart('plain', 1) && kit.rowInPart('word', 1) && !kit.rowInPart('next', 1) && kit.rowInPart('next', 2) && kit.rowInPart('plain-next', 2) && !kit.rowInPart('heavy', 2)
    && kit.rowInPart('heavy', 3) && kit.rowInPart('word', 3) && !kit.rowInPart('plain', 3) && [...ROWS_ALL].every((r) => kit.rowInPart(r, 4)),
    'the same-line row starts on the row a part is about, and a row is only in the parts its words are');
  for (const script of ['madani', 'indopak']) {
    const w = script === 'madani' ? madani : indopak;
    const s1 = w.kit.sampleOf(1, script); const s2 = w.kit.sampleOf(2, script); const s3 = w.kit.sampleOf(3, script); const s4 = w.kit.sampleOf(4, script);
    check(s1.includes(cc(MADDAH)) && data[kit.WORD[0]][script].startsWith(s1) && !s1.includes(' ')
      && s2.includes(' ') && s2.includes(cc(MADDAH)) && data[kit.NEXT[0]][script].includes(s2)
      && s3.includes(cc(MADDAH)) && s3.includes(cc(SHADDA)) && data[kit.HEAVY[1]][script].includes(s3)
      && !s4.includes(cc(MADDAH)) && data[kit.PLAIN[0]][script].startsWith(s4),
    `${script}: the rail's samples are the front of a real word: up to the line; the line, the space and the hamza; the line and the shadda; a plain long vowel`, [s1, s2, s3, s4].map((s) => s.length).join());
  }
  check(kit.titleGlyph() === cc(ALIF, MADDAH), 'the big glyph is an alif with the wavy line, composed from its code points');

  // No literal combining mark in any file of the lesson.
  const MARK_RE = new RegExp('[\\u064B-\\u0653\\u0670\\u0657\\u0660-\\u0669\\u06E1\\u06E4\\u06E5\\u06E6]');
  check(MARK_RE.test(cc(0x064E)) && MARK_RE.test(cc(0x0670)) && MARK_RE.test(cc(0x06E1)) && MARK_RE.test(cc(MADDAH)) && !MARK_RE.test(cc(0x0644)), 'the literal-mark pattern can fail (it catches a zabar, a small alif, U+06E1 and the wavy line, and not a letter)');
  for (const file of ['madd.js', 'rules.js', 'rule-lesson.js', 'practice.js', 'spell.js', 'exercise.js', 'lesson-20.html', 'exercise-20.html', 'rule-words.js']) {
    check(!MARK_RE.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')), `${file} holds no literal combining mark or small letter`);
  }
}

console.log('\nThe other rules still stand');
{
  const w = boot(undefined, ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'ends.js', 'rule-words.js', 'madd.js']);
  check(Object.keys(w.rules.RULES).join() === 'hamza,ends,madd' && Object.keys(w.rules.KITS).join() === 'hamza,ends,madd', 'the registry holds the hamza\'s kit, the ends\' and this one, each with its own board');
  check(w.rules.KITS.hamza.board === 'grid' && w.rules.KITS.ends.board === 'ends' && w.kit.board === 'words', 'three boards: a grid, two shape grids and a list of words');
  check(w.rules.KITS.hamza.formsOf().length === 15 && w.rules.KITS.ends.formsOf().length === 14, 'Lesson 16\'s fifteen forms and Lesson 17\'s fourteen are untouched');
  const all = boot(undefined, ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'al.js', 'wasl.js', 'madd.js']);
  check(all.rules.KITS.al.formsOf().length === 12 && all.rules.KITS.wasl.formsOf().length === 24 && all.rules.KITS.madd.formsOf().length === 24
    && all.rules.KITS.al.itemsFor(all.shell).every((i) => i.askGroup === undefined) && all.rules.KITS.wasl.itemsFor(all.shell).every((i) => i.askGroup !== undefined),
    'Lesson 18\'s twelve and Lesson 19\'s twenty-four words are untouched: 18 carries no `askGroup`, 19 carries its own');
}

console.log('\nMastery');
{
  const w = boot();
  const items = w.kit.itemsFor(w.shell);
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(20, items[0].id, true);
  check(w.shell.masteredCount(20) === 1, 'masteredCount(20) counts one mastered word', String(w.shell.masteredCount(20)));
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(20, items[23].id, true);
  check(w.shell.masteredCount(20) === 2, 'and two, when two are mastered', String(w.shell.masteredCount(20)));
  check([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].every((n) => w.shell.masteredCount(n) === 0), 'none of it counts toward another lesson');
  const switched = boot();
  const inMadani = switched.kit.itemsFor(switched.shell)[14];
  for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(20, inMadani.id, true);
  switched.shell.state.script = 'indopak';
  const inIndoPak = switched.kit.itemsFor(switched.shell)[14];
  check(inIndoPak.id === inMadani.id && inIndoPak.glyph !== inMadani.glyph && switched.rules.stats(switched.shell, 20, [inIndoPak], 2, { target: 3 }).known === 1,
    'a pair keeps its credit after a switch to Indo-Pak, though its Arabic is another text');
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
  for (const file of ['shell.js', 'marks.js', 'rules.js', 'rule-words.js', 'madd.js', 'audio.js']) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  const rows = audioCtx.qaidaAudio.wanted();
  check(rows.length === 447, 'the recordings page still lists 447 rows: Lesson 20 adds none (its words are recorded one at a time, under their references, in a later step)', String(rows.length));
  const items = audioCtx.qaidaRules.KITS.madd.itemsFor(audioCtx.qaidaShell);
  check(items.every((i) => audioCtx.qaidaAudio.has(i.audio.kind, i.audio.glyph) === false), 'and no word has a recording yet, so hearing practice stays shut for them');
}

console.log('\nThe engine: questions on every part');
{
  const w = boot();
  const items = w.kit.itemsFor(w.shell);
  const expect = { 1: { total: 10, names: ['Held longer', 'Held normally'] }, 2: { total: 9, names: ['Held longer', 'Held normally'] }, 3: { total: 10, names: ['Held longer', 'Held longest'] }, 4: { total: 24, names: ['Held longer', 'Held longest', 'Held normally'] } };
  let asked = 0;
  let sameAnswer = 0;
  let sameName = 0;
  let notOwn = 0;
  let starved = 0;
  let wrongSet = 0;
  let reversed = 0;
  let rightMissing = 0;
  for (const n of [1, 2, 3, 4]) {
    // What the page hands the drill: the part's own forms, all required. Nothing rides along: each part holds all the answers of its question.
    const pool = w.rules.poolFor(items, n);
    const e = expect[n];
    check(pool.length === e.total && pool.every((i) => i.required) && [...new Set(pool.map((i) => i.name))].sort().join() === e.names.join(),
      `part ${n}: ${pool.length} forms, all required, answers ${e.names.join(' / ')}`, `${pool.length} / ${[...new Set(pool.map((i) => i.name))].join(' / ')}`);
    const drill = w.practice.create({
      lesson: 20, items: pool, formats: [FORM_TO_NAME], random: seeded(71 + n), familyFirst: false,
      noRepeatWithin: Math.max(1, Math.min(8, pool.length - 2)),
    });
    drill.start();
    check(drill.progress().total === e.total, `part ${n}: the drill counts ${e.total} toward ready`, String(drill.progress().total));
    const rightNames = new Set();
    for (let i = 0; i < 120; i += 1) {
      const q = drill.question;
      if (!q) { starved += 1; break; }
      asked += 1;
      rightNames.add(q.item.name);
      const ids = q.choices.map((c) => c.id);
      const names = q.choices.map((c) => c.name);
      if (new Set(ids).size !== ids.length) sameAnswer += 1;
      if (new Set(names).size !== names.length) sameName += 1;
      if (names.slice().sort().join() !== e.names.join()) wrongSet += 1;
      if (q.format.ask !== 'glyph' || q.format.answerWith !== 'name') reversed += 1;
      if (!ids.includes(q.item.id)) rightMissing += 1;
      if (!pool.some((p) => p.id === q.item.id)) notOwn += 1;
      drill.answer(q.item.id);
      drill.next();
    }
    check([...rightNames].sort().join() === e.names.join(), `part ${n}: every one of its answers is the right one for some question over a run of 120`, [...rightNames].join());
  }
  check(asked === 480 && starved === 0, '480 questions through the real engine, on all four parts', `${asked} asked, ${starved} starved`);
  check(sameAnswer === 0 && sameName === 0, 'never the same answer twice, and never two choices with one name', `${sameAnswer} / ${sameName}`);
  check(wrongSet === 0, 'every question offers exactly the part\'s answers: two in parts 1 to 3, all three in part 4, never an answer the part does not have', String(wrongSet));
  check(reversed === 0, 'no question is NAME_TO_FORM or SOUND_TO_FORM: a name is not a picture');
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

const nodeLoad = ['shell.js', 'audio.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'madd.js', 'rule-lesson.js', 'spell.js'];
const NOMARK = new RegExp('[\\u064B-\\u0653\\u0670\\u0657\\u06D6-\\u06ED]'); // a literal combining mark or small Quranic letter

async function pageHalf() {
  let w;
  try {
    w = run('lesson-20.html', nodeLoad, { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against lesson-20.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  check(true, 'shell.js, audio.js, practice.js, marks.js, rules.js, rule-words.js, madd.js, rule-lesson.js and spell.js load against lesson-20.html without an error');
  await sleep(20);
  const { $, all, click, shell, rules, htmlEl } = w;
  const kit = rules.KITS.madd;
  const data = w.ctx.qaidaRuleWords.words;
  const qaida = w.ctx.qaida;
  qaida.setPause(1);
  const forms = kit.formsOf();
  const tiles = () => all('.word-cell');
  const gridTiles = () => $('.rule-grid').querySelectorAll('.word-cell');
  const rail = () => all('.band');
  const choices = () => $('.choices').children;
  const itemShown = () => kit.itemsFor(shell).find((it) => it.glyph === ($('.prompt-glyph') ? $('.prompt-glyph').textContent : ''));
  const answerFor = () => choices().find((c) => c.attrs['data-id'] === itemShown().id);
  const wrongFor = () => choices().find((c) => c !== answerFor());
  const wordRows = () => $('.rule-grid').querySelectorAll('.word-row');
  const unitsOfTile = (t) => t.querySelector('.glyph').children.map((u) => ({ text: u.textContent, role: u.attrs['data-role'] || '' }));
  const litCount = (kind) => (['plain', 'plain-next'].includes(kind) ? 1 : 2);
  const ECHO = {
    plain: 'There is no wavy line, so the long vowel is held for its usual length:',
    word: 'There is a wavy line, and a hamza after it in the same word, so it is held longer:',
    'plain-next': 'There is no wavy line, so the long vowel is held for its usual length, even before another word:',
    next: 'There is a wavy line, and the next word starts with a hamza, so it is held longer:',
    heavy: 'There is a wavy line, and a shadda after it, so it is held longest:',
  };
  const ASK = 'How long is the long vowel held here?';
  const NAMES = { 12: 'Held longer|Held normally', 3: 'Held longer|Held longest', all: 'Held longer|Held longest|Held normally' };

  console.log('\nThe page');
  check(qaida.kind === 'drill' && qaida.rule === 'madd' && qaida.hasOther === false && qaida.otherCount === 0 && qaida.hasTail === false && qaida.markCount === 1 && qaida.review === 0,
    'publishes window.qaida with kind "drill" and rule "madd", and nothing to be told apart from, no tails, no review');
  check(htmlEl.attrs['data-rule'] === 'madd' && htmlEl.attrs['data-point'] === 'none' && htmlEl.attrs['data-mark'] === undefined, 'the page teaches the madd rule, with no halo and no mark');
  check(JSON.stringify(qaida.groupCosts().map((p) => p.items)) === '[10,9,10,24]', 'groupCosts() is 10, 9, 10 then 24', JSON.stringify(qaida.groupCosts().map((p) => p.items)));
  check(rail().length === 4 && rail().every((b) => b.attrs.disabled === undefined), 'four parts, all enabled: nothing is locked');
  check(qaida.parts.map((p) => p.name).join('|') === 'A hamza in the word|A hamza in the next word|A shadda after it|All together', 'the four parts are named by what follows the long vowel', qaida.parts.map((p) => p.name).join('|'));

  // The members the options panel reads: a missing one throws in the panel and takes the page down.
  const panel = fs.readFileSync(path.join(dir, 'qaida-options.js'), 'utf8');
  const drillBranch = panel.slice(panel.indexOf("lesson.kind === 'drill'"), panel.indexOf("lesson.kind === 'exercise'"));
  const read = [...new Set([...drillBranch.matchAll(/\blesson\.(\w+)/g)].map((m) => m[1]))];
  const lesson3Only = ['setBand', 'bandTotals', 'setDrilled'];
  const assigned = ['onCosts'];
  const missing = read.filter((name) => !lesson3Only.includes(name) && !assigned.includes(name) && !(name in qaida));
  check(read.length > 20 && missing.length === 0, `every window.qaida member the panel reads exists (${read.length} read)`, missing.join(', '));

  console.log('\nThe head');
  check($('h1').textContent === 'The wavy line' && w.doc.title.startsWith('Lesson 20: The wavy line'), 'the title is in both name sets', $('h1').textContent + ' / ' + w.doc.title);
  check($('.title-mark').textContent === cc(ALIF, MADDAH), 'the big glyph is an alif with the wavy line', cps($('.title-mark').textContent).join());
  const glyphs = all('.band-glyph').map((g) => g.textContent);
  check(glyphs.join() === [1, 2, 3, 4].map((n) => kit.sampleOf(n)).join(), 'the rail shows the front of a word with a hamza, a pair, a word with a shadda and a plain long vowel', glyphs.length);
  check($('.eyebrow').textContent === 'Lesson 20 of 29' && all('.track li').length === 29 && all('.track li').findIndex((li) => li.classes().includes('now')) === 19,
    'Lesson 20 of 29, the twentieth of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '24', 'the bar\'s total is the twenty-four', $('.bar').attrs['aria-valuemax']);
  check(!$('.pairs') && !$('.pair-feature') && !$('.halo') && !$('.jazam-note') && !$('.mark-alone') && !$('.joined') && !$('.sun-letters'), 'none of a mark lesson\'s board is on this page, and none of Lesson 18\'s sun letters');

  console.log('\nThe board: three words and five lists');
  const strip = $('.seat-strip').querySelectorAll('.word-cell');
  check(strip.length === 3 && strip.every((t) => t.tag === 'button' && t.attrs['data-audio'] === undefined), 'the strip has three word tiles, and they say nothing when tapped: no recording exists yet');
  check($('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|') === 'No line: held normally|A line, then a hamza: held longer|A line, then a shadda: held longest', 'each is captioned with how long it is held', $('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|'));
  check(strip.map(unitsOfTile).map((u) => u.filter((x) => x.role).length).join() === '1,2,2', 'the plain word lights its long vowel; the others light the line and what follows it');
  const note = $('.seat-note').textContent;
  check(/hold it longer/.test(note) && /longest/.test(note) && (note.match(/\bmadd\b/g) || []).length === 1 && !/\d/.test(note) && !/[{}]/.test(note),
    'the line under them says what the wavy line is, with the class\'s word once, no number of beats and no token left in it', note);
  check($('.rule-grid').querySelectorAll('.rule-grid-title').map((t) => t.textContent).join('|') === 'No wavy line|A wavy line, then a hamza in the word|No wavy line, before the next word|A wavy line, then a hamza in the next word|A wavy line, then a shadda', 'each list has a heading');
  check(wordRows().length === 5 && wordRows().map((r) => r.attrs['data-mark']).join() === 'plain,word,plain-next,next,heavy' && wordRows().map((r) => r.querySelectorAll('.word-cell').length).join() === '5,5,4,5,5', 'five lists of 5, 5, 4, 5 and 5');
  check(gridTiles().length === 24 && tiles().length === 27, 'twenty-four on the board, and the three on their own above them');
  check(gridTiles().filter((t) => t.classes().includes('word-pair')).length === 9 && gridTiles().every((t, i) => t.classes().includes('word-pair') === Boolean(forms[i].pair)), 'the pairs have the wide tile, the single words the narrow one');
  check(wordRows().map((r) => r.querySelector('.rule-name').textContent).join('|') === 'a long vowel, no line|a line before a hamza|a long vowel, no line|a line before the next word’s hamza|a line before a shadda', 'the row names', wordRows().map((r) => r.querySelector('.rule-name').textContent).join('|'));
  check(wordRows().map((r) => r.querySelector('.rule-sound').textContent).join('|') === 'held normally|held longer|held normally|held longer|held longest' && !/[{}]/.test($('.rule-grid').textContent), 'each row says how long, with no token left in it');
  const later = () => gridTiles().filter((t) => t.attrs['data-state'] === 'later').length;
  check(later() === 14, 'part 1: the pairs and the shadda words are dim, "comes later"; the map is all there', String(later()));
  qaida.setGroup(2);
  check(later() === 5 && gridTiles().length === 24, 'part 2: only the shadda words are dim, and the board has not changed shape', String(later()));
  qaida.setGroup(3);
  check(later() === 0, 'part 3: none dim', String(later()));
  qaida.setGroup(1);
  check(gridTiles().every((t) => t.tag === 'button'), 'a dim word is a button all the same: nothing is locked');
  check(gridTiles().every((t) => /^Held (normally|longer|longest)\. Verse \d+:\d+\.$/.test(t.attrs['aria-label'])), 'every word is named for a screen reader: how long it is held, and its verse', gridTiles()[0].attrs['aria-label']);
  check(gridTiles().every((t) => t.querySelector('.glyph').attrs['aria-hidden'] === 'true' && t.querySelector('.word-ref').attrs['aria-hidden'] === 'true'), 'and the word and its verse mark are hidden from a screen reader: the button carries the name');
  check(gridTiles().map((t) => t.querySelector('.word-ref').textContent).every((r, i) => r === forms[i].ref.split(':').slice(0, 2).join(':')), 'each one shows where in the Qur\'an it was copied from (surah:verse), a pair by its first word\'s verse');
  check(gridTiles().every((t, i) => unitsOfTile(t).map((u) => u.text).join('') === data[forms[i].ref].madani), 'every one on the board is the copied text, character for character (in Madani)');

  console.log('\nThe board: the same-sound line and the script lines');
  check(/^A wavy line over a long vowel, and a hamza after it in the same word: held longer\./.test($('.same-line').textContent), 'part 1 starts on the row of a hamza in the word', $('.same-line').textContent);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'plain'));
  check(/^With no wavy line, a long vowel is held for its usual length\./.test($('.same-line').textContent), 'tapping a plain word says it is held for its usual length', $('.same-line').textContent);
  check($('.word-row[data-current]').attrs['data-mark'] === 'plain' && all('.word-row').filter((r) => 'data-current' in r.attrs).length === 1, 'and the row it is about is the one lit');
  qaida.setGroup(2);
  check(/^A wavy line over the last letter, and the next word starts with a hamza: held longer\./.test($('.same-line').textContent), 'part 2: the line is about the next-word row (the row it was on is not in part 2)', $('.same-line').textContent);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'plain-next'));
  check(/^With no wavy line, a long vowel at the end of a word is held for its usual length, even before another word\./.test($('.same-line').textContent), 'tapping a plain pair says the same of a vowel at the end of a word', $('.same-line').textContent);
  qaida.setGroup(3);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'heavy'));
  check(/^A wavy line over a long vowel, and a shadda on the letter after it: held longest\./.test($('.same-line').textContent), 'tapping a shadda word says it is held longest', $('.same-line').textContent);
  qaida.setGroup(1);
  check(/^A wavy line over a long vowel, and a hamza after it in the same word/.test($('.same-line').textContent), 'back to part 1, the line is about the first row again: the row it was on (a shadda) is not in part 1', $('.same-line').textContent);
  check(/written above the long vowel/.test($('.script-line').textContent) && !/may draw it a little differently/.test($('.script-line').textContent), 'the Madani student sees the Madani line, and only that', $('.script-line').textContent);
  check($('.lead-line').hidden === true, 'and no line about a font');
  await w.setScript('indopak');
  check(/may draw it a little differently/.test($('.script-line').textContent) && /Indo-Pak/.test($('.script-line').textContent), 'the Indo-Pak student sees the Indo-Pak line, and only that', $('.script-line').textContent);
  check($('.lead-line').hidden === false && /Indo-Pak print/.test($('.lead-line').textContent) && /stand-in/.test($('.lead-line').textContent), 'and is told once that the Qur\'an\'s own Indo-Pak print is drawn in a stand-in until its font is added', $('.lead-line').textContent);
  await w.setScript('madani');

  console.log('\nThe two scripts');
  const glyphOfWord = (ref) => gridTiles().find((t) => t.attrs['data-id'] === ref).querySelector('.glyph').textContent;
  await w.setScript('indopak');
  check(forms.every((f) => glyphOfWord(f.ref) === data[f.ref].indopak), 'Indo-Pak: every one on the board is the copied Indo-Pak text, character for character');
  check($('.title-mark').textContent === cc(ALIF, MADDAH) && all('.band-glyph')[0].textContent === kit.sampleOf(1, 'indopak'), 'the title glyph is the same alif with its line, and the rail follows the script');
  check(kit.samples().every((s, i) => unitsOfTile($('.seat-strip').querySelectorAll('.word-cell')[i]).map((u) => u.text).join('') === data[s.ref].indopak), 'and so do the three on their own');
  await w.setScript('madani');
  check(forms.every((f) => glyphOfWord(f.ref) === data[f.ref].madani), 'Madani: every one is the copied Madani text, character for character');

  console.log('\nThe drill');
  check($('.ask').textContent === ASK, 'asks "How long is the long vowel held here?"', $('.ask').textContent);
  let q = itemShown();
  check(Boolean(q) && choices().length === 2 && choices().every((c) => c.attrs['data-face'] === 'name') && choices().map((c) => c.textContent).sort().join('|') === NAMES[12],
    'part 1: two choices, held normally and held longer', choices().map((c) => c.textContent).join(' | '));
  check($('.prompt-glyph').textContent === data[q.id].madani && $('.prompt-glyph').attrs['aria-hidden'] === 'true', 'the question shows the copied word, hidden from a screen reader');
  const partRun = async (n, count, kindsWanted, names) => {
    qaida.setGroup(n);
    await sleep(10);
    const asked = new Set();
    let off = 0;
    for (let i = 0; i < count; i += 1) {
      const shown = itemShown();
      if (!shown) break;
      asked.add(shown.kind);
      if ($('.ask').textContent !== ASK || choices().map((c) => c.textContent).sort().join('|') !== names) off += 1;
      click(answerFor());
      click($('.next-question'));
      await sleep(5);
    }
    check(kindsWanted.every((k) => asked.has(k)) && [...asked].every((k) => kindsWanted.includes(k)) && off === 0,
      `part ${n} asks the one question, with ${names.split('|').length} answers (${names.replace(/\|/g, ', ')}), about ${kindsWanted.join(', ')}`, `${[...asked].join()} / ${off} off`);
  };
  qaida.clear();
  await sleep(20);
  await partRun(1, 24, ['plain', 'word'], NAMES[12]);
  await partRun(2, 24, ['plain-next', 'next'], NAMES[12]);
  await partRun(3, 24, ['word', 'heavy'], NAMES[3]);
  await partRun(4, 80, ['plain', 'word', 'plain-next', 'next', 'heavy'], NAMES.all);
  qaida.clear();
  await sleep(20);
  qaida.setGroup(1);
  await sleep(10);
  q = itemShown();
  click(answerFor());
  check(/^Yes — Held (normally|longer)\.$/.test($('.verdict').textContent), 'right: "Yes — Held longer." (the word\'s own name)', $('.verdict').textContent);
  check($('.seat-echo').hidden === true, 'and no line under a right answer');
  await sleep(20);
  q = itemShown();
  const wrong = wrongFor();
  const wrongName = wrong.textContent;
  click(wrong);
  check($('.verdict').textContent === `You chose “${wrongName}”. This one is “${q.name}”.`, 'wrong: says what it chose and what it is, once, with no scolding', $('.verdict').textContent);
  const echoUnits = $('.seat-echo').querySelectorAll('.seat-echo-word .unit');
  check($('.seat-echo').hidden === false && echoUnits.map((u) => u.textContent).join('') === data[q.id].madani && echoUnits.filter((u) => u.attrs['data-role']).length === litCount(q.kind),
    'under a wrong answer: the same word again, whole, with its lit places', String(echoUnits.length));
  check($('.seat-echo').textContent.startsWith(ECHO[q.kind]), 'and the line for its kind says why', $('.seat-echo').textContent);
  check(gridTiles().filter((t) => 'data-missed' in t.attrs).map((t) => t.attrs['data-id']).join() === q.id, 'and the word just missed keeps its gold edge on the board, that one tile');
  check($('.word-row[data-current]').attrs['data-mark'] === q.mark, 'the board\'s row follows the miss');
  check($('.after').hidden === false && $('.after').attrs['data-kind'] === 'wrong' && $('.after-name').textContent === q.name && $('.after-glyph').textContent === q.glyph, 'the strip under a miss names the word and offers Hear it, Say it, Write it and Next');
  click($('.after .trace'));
  check(w.opened.length === 1 && w.opened[0][0] === q.glyph && w.opened[0][1] === 'this one', '"Write it" opens the writing board on the whole word, titled "Trace this one" (a text field), not with the name of the answer', w.opened.map((o) => o.join(' / ')).join());
  const last = qaida.lastItem;
  check(Boolean(last) && last[0] === 'words' && last[1] === q.id && last[2] === 'this one' && last[3] === q.glyph, 'the top bar\'s Say it opens on the word: kept under its reference, shown as its text, titled "this one"', last ? last.join(' / ') : 'none');
  click($('.next-question'));
  await sleep(20);
  check($('.seat-echo').hidden === true && !gridTiles().some((t) => 'data-missed' in t.attrs), 'the next question clears the line and the gold edge');
  // Every kind's own line, under a wrong answer: ask each kind once on the last part and read what it says.
  qaida.setGroup(4);
  await sleep(10);
  const seenLines = new Set();
  for (let i = 0; i < 120 && seenLines.size < 5; i += 1) {
    const shown = itemShown();
    click(wrongFor());
    if (!$('.seat-echo').textContent.startsWith(ECHO[shown.kind])) check(false, `the line for ${shown.kind}`, $('.seat-echo').textContent);
    seenLines.add(shown.kind);
    click($('.next-question'));
    await sleep(5);
  }
  check(seenLines.size === 5, 'all five kinds were missed once on purpose, and each said its own line', [...seenLines].join());
  qaida.setGroup(1);

  console.log('\nHearing: once the words are recorded, the question is asked by ear');
  check(kit.byEar === true && rules.KITS.hamza.byEar === undefined, 'madd.js says its rule is heard (`byEar`), and no other kit does');
  let heard = 0;
  let pictured = 0;
  const realHas = w.ctx.qaidaAudio.has;
  // With nothing recorded, no question is a sound question, even though this page starts in the mixed way.
  qaida.setGroup(4);
  await sleep(10);
  for (let i = 0; i < 30; i += 1) { if ($('.prompt').attrs['data-mode'] === 'sound') heard += 1; qaida.next(); await sleep(3); }
  check(heard === 0, 'nothing recorded: not one of 30 questions is a hearing question, so nothing waits on a recording', String(heard));
  // The teacher records every word: now a word is asked by ear from its first question, and by its picture as well.
  w.ctx.qaidaAudio.has = (kind) => kind === 'words';
  qaida.clear();
  await sleep(20);
  qaida.setGroup(4);
  await sleep(10);
  let wrongChoices = 0;
  let noPlay = 0;
  for (let i = 0; i < 60; i += 1) {
    const sound = $('.prompt').attrs['data-mode'] === 'sound';
    if (sound) {
      heard += 1;
      const item = kit.itemsFor(shell).find((it) => it.id === qaida.lastItem[1]);
      if ($('.ask').textContent !== 'How long is the long vowel held in this one?' || choices().map((c) => c.textContent).sort().join('|') !== NAMES.all) wrongChoices += 1;
      if (!$('.prompt').querySelector('.play') || $('.prompt').querySelector('.prompt-glyph')) noPlay += 1;
      click(choices().find((c) => c.textContent === item.name));
      if (!/^Yes — /.test($('.verdict').textContent)) wrongChoices += 1;
    } else {
      pictured += 1;
    }
    qaida.next();
    await sleep(3);
  }
  check(heard >= 15 && pictured >= 15, 'everything recorded: both kinds are asked, the hearing question and the picture one, in a run of 60', `${heard} heard, ${pictured} pictured`);
  check(wrongChoices === 0 && noPlay === 0, 'a hearing question has a play button and no picture, asks how long the vowel is held, offers the three lengths, and the right length is right', `${wrongChoices} / ${noPlay}`);
  w.ctx.qaidaAudio.has = realHas;
  qaida.clear();
  await sleep(20);
  qaida.setGroup(1);

  console.log('\nThe names follow the student');
  await w.setNames('zabar');
  check(choices().map((c) => c.textContent).sort().join('|') === NAMES[12] && $('.prev span').textContent === 'Previous: The joining alif' && $('.eyebrow').textContent === 'Lesson 20 of 29',
    'in the zabar set the choices and the Previous label are the same: nothing on this page is a mark\'s name', choices().map((c) => c.textContent).join(' | '));
  await w.setNames('fatha');

  console.log('\nFinishing');
  qaida.clear();
  await sleep(20);
  check(shell.isDone(20) === false, 'nothing is done to begin with');
  qaida.setGroup(1);
  const master = (n) => {
    for (const f of forms.filter((x) => x.parts.includes(n))) for (let i = 0; i < 3; i += 1) shell.recordAnswer(20, kit.idOf(f), true);
  };
  master(1);
  qaida.render();
  await sleep(20);
  check(shell.isDone(20) === false && $('.ready-note').hidden === false, 'part 1 known: the part says you seem ready, and the lesson is not done (part 4 gates it)');
  master(4);
  qaida.setGroup(4);
  await sleep(20);
  check(shell.isDone(20) === true && $('.end-line').textContent.startsWith('You can tell how long a long vowel is held'), 'every form known: the lesson is done, and says so', $('.end-line').textContent);
  check(shell.masteredCount(20) === 24, 'and the home\'s count is the twenty-four', String(shell.masteredCount(20)));
  check(shell.drillOf(20).total === 24, 'the home reads the whole lesson\'s total, 24, and not the open part\'s', String(shell.drillOf(20).total));
  qaida.clear();
  await sleep(20);
  check(shell.isDone(20) === false && shell.masteredCount(20) === 0, 'Start again clears it');

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
  check(units().join('') === data[a.ref].madani && units().length === kit.lettersOf(data[a.ref].madani).length, 'item 1 is the copied word, one unit a letter', units().length);
  const firstPiece = kit.unitsOf(a.ref, 'madani', 'word').filter((u) => u.step === 0).length;
  check(states().join() === [...Array(firstPiece).fill('active'), ...Array(units().length - firstPiece).fill('unread')].join() && firstPiece === kit.lettersOf(data[a.ref].madani).findIndex((u) => u.includes(cc(MADDAH))) + 1,
    'step 1 lights the letters up to the long vowel with its line, and nothing else', states().join());
  const c1 = stepsOf();
  check(c1.length === 3 && c1[0] === `The long vowel, with its wavy line: “${a.sounds[0]}”. Hold it longer.` && c1[1] === `The hamza after it: “${a.sounds[1]}”.` && c1[2] === `The whole thing: ${a.whole}.`, 'item 1: three steps, the long vowel, the hamza, the whole', c1.join(' / '));
  check(states().every((s) => s === 'read'), 'the last step settles every letter to plain');
  check($('.spell-meaning').textContent === `It means “${a.meaning}.”`, 'and the meaning shows on the last step', $('.spell-meaning').textContent);
  click($('.spell-nextword'));
  check(units().join('') === data[b.ref].madani, 'item 2 is the copied pair');
  const c2 = stepsOf();
  check(c2.length === 3 && c2[0] === `The first word: “${b.sounds[0]}”. Its last letter has the wavy line, so hold it longer.` && c2[1] === `The second word: “${b.sounds[1]}”. It starts with a hamza.` && c2[2] === `The whole thing: ${b.whole}.`, 'item 2: the first word, the second, the whole', c2.join(' / '));
  click($('.spell-nextword'));
  check(units().join('') === data[c.ref].madani, 'item 3 is the copied word with a shadda');
  const c3 = stepsOf();
  check(c3.length === 3 && c3[0] === `The long vowel, with its wavy line: “${c.sounds[0]}”. Hold it longest.` && c3[1] === `The letter with the shadda, and the rest: “${c.sounds[1]}”.` && c3[2] === `The whole thing: ${c.whole}.`, 'item 3: the long vowel (longest), the shadda and the rest, the whole', c3.join(' / '));
  check($('.spell-meaning').textContent === `It means “${c.meaning}.”`, 'and the meaning shows on the last step', $('.spell-meaning').textContent);
  await w.setScript('indopak');
  click(all('.word-step')[0]);
  check(units().join('') === data[a.ref].indopak, 'in Indo-Pak the walkthrough shows the copied Indo-Pak text', units().join('') === data[a.ref].madani ? 'same' : 'different');
  await w.setScript('madani');

  console.log('\nThe ways out: Previous goes to Lesson 19, Next to Lesson 21 (built since: a real link)');
  check($('.prev').attrs.href === 'lesson-19.html' && $('.prev span').textContent === 'Previous: The joining alif', 'Previous goes to Lesson 19', $('.prev span').textContent);
  check($('.spell-more a').attrs.href === 'exercise-20.html' && fs.existsSync(path.join(dir, 'exercise-20.html')), 'Practice reading goes to exercise-20.html, which exists');
  check($('.next span').textContent === 'Next: Letters that are not read' && !$('.next').attrs['data-last'], 'Next reads "Next: Letters that are not read"', $('.next span').textContent);
  w.location.href = '';
  click($('.next'), 1);
  check(w.location.href === 'lesson-21.html', 'and it goes to lesson-21.html, which is built now (it said "not built yet" until Lesson 21 was)', String(w.location.href));

  console.log('\nThe home');
  const home = boot();
  const row = home.shell.LESSONS.find((l) => l.n === 20);
  check(row.built === true && row.href === 'lesson-20.html' && row.progress === 'drill' && row.part === 2 && row.cp === undefined && !row.tail, 'the home\'s row 20 is built, a drill, in the second part, with no `cp`, and leads to lesson-20.html');
  check(home.shell.LESSONS.find((l) => l.n === 19).built && home.shell.LESSONS.find((l) => l.n === 21).built && home.shell.LESSONS.find((l) => l.n === 22).built && !home.shell.LESSONS.find((l) => l.n === 23).built, 'and 19, 21 and 22 are built and 23 is not');

  console.log('\nThe markup');
  check(!NOMARK.test(w.raw), 'lesson-20.html holds no literal combining mark');
  check(!/[ء-ي]/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<dialog class="chooser"[\s\S]*?<\/dialog>/, '')), 'and no Arabic on the lesson itself: every word is copied into rule-words.js and drawn by rule-lesson.js');
  check(/&#x627;&#x653;</.test(w.raw), 'the title glyph is an alif with the wavy line, as numeric references');
  const at = (file) => w.raw.indexOf(`<script src="${file}" defer></script>`);
  check(at('rules.js') > 0 && at('rules.js') < at('rule-words.js') && at('rule-words.js') < at('madd.js') && at('madd.js') < at('rule-lesson.js') && at('spell.js') > at('rule-lesson.js') && at('ends.js') === -1 && at('al.js') === -1 && at('wasl.js') === -1,
    'the scripts load in order: rules.js, rule-words.js, madd.js, then the page\'s code and spell.js (no other kit is needed here)');
  const visible = w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/data-rule="[^"]*"/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|leen|qalqalah|idgham|ikhfa|izhar|ghunna|tajweed)\b/i.test(visible) && (visible.match(/\bmadd\b/gi) || []).length === 1, 'no scolding and no tajweed word on the page but the class\'s own word, once (the plain-names rule; docs/pass-2/03 §4)');
  check(!/\b29\b/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace('Lesson 20 of 29', '')), 'no "29" on the page but the lesson count');
  check((w.raw.match(/data-words(-attr)?=/g) || []).length > 60, 'every line of wording is a text field (data-words / data-words-attr)');
  const wordsAttrOK = [...w.raw.matchAll(/data-words-attr="([^"]*)"/g)].every((m) => m[1].split(';').every((pair) => pair.includes('|')));
  check(wordsAttrOK, 'and every data-words-attr entry is "attribute|label"');
  // Every data- attribute the board reads has a text field (data-words-attr) beside it, so the teacher can edit it.
  const boardTag = w.raw.match(/<section class="marks-board[\s\S]*?>\s*<div class="section-head">/)[0];
  const boardAttrs = [...boardTag.matchAll(/\s(data-[\w-]+)="/g)].map((m) => m[1]).filter((x) => x !== 'data-words-attr');
  const boardFields = boardTag.match(/data-words-attr="([^"]*)"/)[1].split(';').map((p) => p.split('|')[0]);
  check(boardAttrs.every((x) => boardFields.includes(x)) && boardFields.every((x) => boardAttrs.includes(x)), 'every line of the board\'s wording has its own text field, and no field is for a line that is not there', boardAttrs.filter((x) => !boardFields.includes(x)).concat(boardFields.filter((x) => !boardAttrs.includes(x))).join(', '));
  const numbered = [...boardTag.matchAll(/\s(data-(?:same|seat|script|title|row|sound|sample)[\w-]*)="([^"]*)"/g)].filter((m) => /\d/.test(m[2])).map((m) => m[1]);
  check(numbered.length === 0, 'no number is on the board: no count of beats, in any line of it', numbered.join(', '));
  // The same for the other sections that carry wording.
  for (const [name, re] of [['the spell block', /<section class="spell"[\s\S]*?>\s*<div class="section-head">/], ['the question', /<p class="ask"[\s\S]*?><\/p>/], ['the echo line', /<p class="seat-echo"[\s\S]*?><\/p>/], ['the verdict', /<p class="verdict"[\s\S]*?><\/p>/], ['the advice', /<div class="advice"[\s\S]*?>\s*<div class="struggle"/], ['the names', /<span hidden\s[\s\S]*?><\/span>/]]) {
    const tag = w.raw.match(re)[0];
    const attrs = [...tag.matchAll(/\s(data-[\w-]+)="/g)].map((m) => m[1]).filter((x) => x !== 'data-words-attr');
    const fields = (tag.match(/data-words-attr="([^"]*)"/) || ['', ''])[1].split(';').map((p) => p.split('|')[0]);
    check(attrs.every((x) => fields.includes(x)), `every line of ${name} has its own text field`, attrs.filter((x) => !fields.includes(x)).join(', '));
  }

  console.log('\nThe reading page');
  let ex;
  try {
    ex = run('exercise-20.html', ['shell.js', 'marks.js', 'rules.js', 'rule-words.js', 'madd.js', 'exercise.js'], { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against exercise-20.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  await sleep(20);
  const cells = () => ex.all('.mashq-word');
  check(cells().length === 12 && ex.ctx.qaida.kind === 'exercise' && ex.ctx.qaida.count === 12, 'exercise-20.html has twelve words and pairs');
  check(/data-rule="madd"/.test(ex.raw) && !/data-mark=/.test(ex.raw) && /href="lesson-20\.html"/.test(ex.raw) && /data-next-fatha="Next: Letters that are not read"/.test(ex.raw) && !/data-last/.test(ex.raw),
    'it teaches the madd rule, goes back to Lesson 20 and on to Lesson 21');
  check(/^Twelve words and pairs of the Qur’an’s own words/.test(ex.$('.exercise-lede').textContent), 'its line says so', ex.$('.exercise-lede').textContent);
  const wordText = () => cells().map((cell) => cell.children.find((k) => k.attrs.lang === 'ar').textContent);
  check(wordText().join('|') === kit.READING.map((ref) => data[ref].madani).join('|'), 'in Madani the twelve are the copied Madani text, in the order madd.js lists them, character for character');
  await ex.setScript('indopak');
  check(wordText().join('|') === kit.READING.map((ref) => data[ref].indopak).join('|'), 'in Indo-Pak, the copied Indo-Pak text');
  check(!NOMARK.test(ex.raw), 'and exercise-20.html holds no literal combining mark');
}

pageHalf().then(() => {
  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
});

