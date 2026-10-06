// Checks for Lesson 18's word layer (al.js, on rules.js, with the Qur'an's own words in rule-words.js) and, below it, the rule page
// (rule-lesson.js against the real lesson-18.html in a small hand-made DOM). QAIDA-BUILD.md step P2; docs/lesson-18/02 §3.
//
//   node tools/qaida-lesson18-check.js
//
// The data half loads the real shell.js, practice.js, marks.js, rules.js, rule-words.js and al.js into a scratch context with an in-memory
// stand-in for localStorage, as tools/qaida-lesson17-check.js does. The page half is at the foot of this file.
//
// The same limits as every other page check: nothing is drawn and no CSS runs, so it cannot tell whether a word fits its tile, whether
// the lit band sits on the right letters, or how a face draws a word. Those were measured in the browser pane at the build
// (docs/lesson-18/02 §3; §4 is the user's list). What it proves is what only a script can: that every reference the lesson names is in the
// copied file, in both scripts, and that the copy is exact; that every word holds only what the student has met; that the laam and the letter
// after it are where the lesson says, by the marks on them; that the lit parts, put back together, are the whole word; and that the ids,
// the two scripts, the engine's questions, the board, the lines and the ways out do what they say. Prints PASS or FAIL per check; the
// exit code is the number that failed.
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

function boot(saved, files = ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'al.js']) {
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
  return { shell: ctx.qaidaShell, practice: ctx.qaidaPractice, marks: ctx.qaidaMarks, rules: ctx.qaidaRules, kit: ctx.qaidaRules.KITS.al, words: ctx.qaidaRuleWords, store };
}

const cc = (...codes) => String.fromCharCode(...codes);
const cps = (text) => [...text].map((c) => c.codePointAt(0));
const ALIF_WASLA = 0x0671;
const ALIF = 0x0627;
const LAAM = 0x0644;
const SHADDA = 0x0651;
const JAZAM_M = 0x0652; // Madani's jazam, as the text carries it
const JAZAM_I = 0x06E1; // Indo-Pak's
const MOON_LETTERS = new Set([0x0627, 0x0628, 0x062C, 0x062D, 0x062E, 0x0639, 0x063A, 0x0641, 0x0642, 0x0643, 0x0645, 0x0647, 0x0648, 0x064A, 0x0621, 0x0623, 0x0625, 0x0649]);
const SUN_LETTERS = new Set([0x062A, 0x062B, 0x062F, 0x0630, 0x0631, 0x0632, 0x0633, 0x0634, 0x0635, 0x0636, 0x0637, 0x0638, 0x0644, 0x0646]);
// What a word may hold: a letter of the 29 (or the alif wasla), tatweel, and the marks the student has met by Lesson 18 (the harakat, the
// tanween, the shadda, the jazam in both drawings, and the small alif). No madd, no stop sign, no silent-letter circle, no direction mark.
const isLetter = (c) => (c >= 0x0621 && c <= 0x064A) || c === ALIF_WASLA;
const ALLOWED_MARK = new Set([0x064B, 0x064C, 0x064D, 0x064E, 0x064F, 0x0650, 0x0651, 0x0652, 0x0670, 0x06E1]);
const okChar = (c) => isLetter(c) || c === 0x0640 || ALLOWED_MARK.has(c);

const FORM_TO_NAME = { id: 'form-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0 };
const alSource = fs.readFileSync(path.join(dir, 'al.js'), 'utf8');
const REF_RE = /['"](\d{1,3}:\d{1,3}:\d{1,3})['"]/g;

console.log('The data layer: rule-words.js and al.js');
{
  const { shell, marks, rules, kit, words } = boot();
  const forms = kit.formsOf();
  const data = words.words;

  // The copy: every reference the lesson names is in the copied file, in both scripts, and the file holds nothing else.
  // rule-words.js is shared by every rule lesson with words (Lesson 19's wasl.js names its own, "surah:verse:first-last" for a pair), so
  // "nothing else" is read against every kit file the fetch tool reads, and this lesson's own words are the ones al.js names.
  const named = new Set([...alSource.matchAll(REF_RE)].map((m) => m[1]));
  const everyNamed = new Set([...named, ...['wasl.js', 'madd.js', 'silent.js', 'stop.js'].flatMap((file) => [...fs.readFileSync(path.join(dir, file), 'utf8').matchAll(/['"](\d{1,3}:\d{1,3}:\d{1,3}(?:-\d{1,3})?)['"]/g)].map((m) => m[1]))]);
  check(named.size >= 24 && [...named].every((ref) => data[ref] && data[ref].madani && data[ref].indopak), `every reference al.js names (${named.size}) is in rule-words.js, in both scripts`, String(named.size));
  check(Object.keys(data).every((ref) => everyNamed.has(ref)), 'and rule-words.js holds no word that no kit names (the fetch tool reads the references out of the kit files, so they cannot drift)');
  check(Object.keys(data).join() === Object.keys(data).sort((a, b) => {
    const [as, av, ap] = a.split(':').map(parseFloat);
    const [bs, bv, bp] = b.split(':').map(parseFloat);
    return as - bs || av - bv || ap - bp;
  }).join(), 'the copied words are in Qur\'an order (surah, verse, position)');
  check(words.source.includes('Quran.com') && /^\d{4}-\d\d-\d\d$/.test(words.fetched), 'and the file says where it is from and when', `${words.fetched}`);
  const fileText = fs.readFileSync(path.join(dir, 'rule-words.js'), 'utf8');
  check(!/[^\x00-\x7f]/.test(fileText.replace(/^\/\/.*$/gm, '')), 'the copied data is ASCII with \\u escapes: a combining mark is never a character you cannot see in a diff');
  check(!/[؀-ۿ]/.test(alSource) && !/[ً-ْٰۡ]/.test(alSource), 'al.js holds no Arabic and no combining mark: every word is a reference (docs/pass-2/02 §3)');

  // What is in each word: only what the student has met, in both scripts, and the article where the lesson says.
  const kindOf = (ref) => forms.find((f) => f.ref === ref).kind;
  let badChars = 0;
  let notArticle = 0;
  let notMarked = 0;
  let notLetters = 0;
  for (const ref of named) {
    for (const script of ['madani', 'indopak']) {
      const text = data[ref][script];
      if (!cps(text).every(okChar)) badChars += 1;
      const units = kit.lettersOf(text);
      const base = (u) => cps(u).find((c) => isLetter(c) || c === 0x0640);
      const has = (u, c) => cps(u).includes(c);
      const alif = script === 'madani' ? ALIF_WASLA : ALIF;
      if (units.length < 3 || base(units[0]) !== alif || base(units[1]) !== LAAM) notArticle += 1;
      // moon (the ref is one of the drill's or the reading list's): decided by the letter after the laam, by the lesson's own definition.
      const after = base(units[2]);
      const kind = forms.some((f) => f.ref === ref) ? kindOf(ref) : (SUN_LETTERS.has(after) ? 'sun' : 'moon');
      if (kind === 'moon') {
        if (!(has(units[1], JAZAM_M) || has(units[1], JAZAM_I)) || has(units[2], SHADDA) || !MOON_LETTERS.has(after)) notMarked += 1;
      } else if (has(units[1], JAZAM_M) || has(units[1], JAZAM_I) || !has(units[2], SHADDA) || !SUN_LETTERS.has(after)) notMarked += 1;
      if (units.some((u) => !cps(u).some(isLetter) && base(u) !== 0x0640)) notLetters += 1;
    }
  }
  check(badChars === 0, 'every word, in both scripts, holds only letters, tatweel and the marks Lessons 4-17 taught (no madd, no stop sign, no silent-letter circle, no direction mark)', String(badChars));
  check(notArticle === 0, 'every word begins with an alif and a laam, in both scripts (Madani\'s alif is the wasla, Indo-Pak\'s a plain alif)', String(notArticle));
  check(notMarked === 0, 'and the marks say what the lesson says: a jazam on the laam and a moon letter after it, or a bare laam and a shadda on a sun letter, in both scripts', String(notMarked));
  check(notLetters === 0, 'and splitting a word into letters with their marks leaves no lone mark');

  // The words a student meets are one of each of the plan's two kinds, five and five, and Allah twice.
  check(rules.RULES.al.id === 'al' && rules.RULES.al.lesson === 18 && rules.RULES.al.parts === 3, 'a third rule, "al", lesson 18, three parts');
  check(forms.length === 12 && kit.MOON.length === 5 && kit.SUN.length === 5 && kit.ALLAH.length === 2, 'twelve words: five moon, five sun, and the name Allah twice');
  check(kit.MOON.every((ref) => SUN_LETTERS.has(0) === false) && kit.MOON.every((ref) => !kit.SUN.includes(ref) && !kit.ALLAH.includes(ref)), 'no word is in two kinds');
  const sunLettersSeen = new Set(kit.SUN.map((ref) => cps(kit.lettersOf(data[ref].madani)[2])[0]));
  const moonLettersSeen = new Set(kit.MOON.map((ref) => cps(kit.lettersOf(data[ref].madani)[2])[0]));
  check(sunLettersSeen.size === 5 && moonLettersSeen.size === 5, 'the five sun words and the five moon words each begin with a different letter (no letter is taught twice)', `${sunLettersSeen.size}, ${moonLettersSeen.size}`);
  check(kit.ALLAH.every((ref) => cps(kit.lettersOf(data[ref].madani)[2])[0] === LAAM), 'and both Allah words have a laam after the article\'s laam: a sun letter, so the laam doubles');
  const allah = kit.ALLAH.map((ref) => data[ref].indopak);
  check(allah[0][0].codePointAt(0) === ALIF && !cps(allah[0]).includes(0x064E, 1) && cps(allah[1]).slice(0, 2).join() === `${ALIF},${0x064E}`,
    'the name Allah is once in the middle of a verse (Indo-Pak: a bare alif) and once at a verse\'s start (Indo-Pak: an alif with a zabar)');
  check(kit.READING.length === 12 && new Set(kit.READING).size === 12 && kit.READING.every((ref) => !forms.some((f) => f.ref === ref)), 'the reading page\'s twelve are twelve other words than the drill\'s');
  check(kit.WALK.length === 3 && kit.WALK.map((w) => w.kind).join() === 'moon,sun,allah' && kit.WALK.every((w) => w.sounds.length === 2 && w.whole && w.meaning && data[w.ref]), 'the walkthrough is three words, a moon, a sun and Allah, each with two sounds, a whole and a meaning');
  check(kit.READING.filter((ref) => SUN_LETTERS.has(cps(kit.lettersOf(data[ref].madani)[2])[0])).length === 6, 'the reading page has six sun words (four sun and two Allah) and six moon words');

  // Parts.
  const items = kit.itemsFor(shell);
  check(JSON.stringify(marks.sizes(items, [1, 2, 3])) === '[5,5,12]', 'the three parts hold 5, 5 and 12', JSON.stringify(marks.sizes(items, [1, 2, 3])));
  check(forms.filter((f) => f.kind === 'moon').every((f) => f.parts.join() === '1,3') && forms.filter((f) => f.kind === 'sun').every((f) => f.parts.join() === '2,3') && forms.filter((f) => f.kind === 'allah').every((f) => f.parts.join() === '3'),
    'moon words are met in parts 1 and 3, sun words in 2 and 3, Allah in 3 alone');

  // Ids: twelve, distinct, the same in both scripts, and never the Arabic.
  const ids = forms.map((f) => kit.idOf(f));
  check(new Set(ids).size === 12 && ids.every((id) => /^\d+:\d+:\d+$/.test(id)), 'twelve distinct ids, each a reference and never a word\'s Arabic');
  const madani = boot();
  const indopak = boot();
  indopak.shell.state.script = 'indopak';
  const idsIn = (w) => w.kit.itemsFor(w.shell).map((item) => item.id);
  check(JSON.stringify(idsIn(madani)) === JSON.stringify(idsIn(indopak)), 'the same ids in both scripts: the glyphs differ, the ids do not');
  const glyphsM = madani.kit.itemsFor(madani.shell).map((i) => i.glyph);
  const glyphsI = indopak.kit.itemsFor(indopak.shell).map((i) => i.glyph);
  check(glyphsM.every((g, i) => g === data[ids[i]].madani) && glyphsI.every((g, i) => g === data[ids[i]].indopak), 'each item\'s glyph IS the copied text for the script in use, character for character');
  check(glyphsM.filter((g, i) => g !== glyphsI[i]).length >= 10, 'and the two scripts differ in nearly every word (the jazam, at least)', String(glyphsM.filter((g, i) => g !== glyphsI[i]).length));

  // The lit parts, put back together, are the whole word: nothing lost, nothing added, in both scripts.
  const whole = forms.every((f) => ['madani', 'indopak'].every((script) => kit.unitsOf(f.ref, script, f.kind).map((u) => u.text).join('') === data[f.ref][script]));
  check(whole, 'the units of every word, joined, are the copied word exactly, in both scripts');
  const roles = (f) => kit.unitsOf(f.ref, 'madani', f.kind).map((u) => u.role);
  check(forms.filter((f) => f.kind === 'moon').every((f) => roles(f)[0] === '' && roles(f)[1] === 'read' && roles(f).slice(2).every((r) => r === '')), 'a moon word lights one place: the laam ("read")');
  check(forms.filter((f) => f.kind !== 'moon').every((f) => roles(f)[0] === '' && roles(f)[1] === 'silent' && roles(f)[2] === 'twice' && roles(f).slice(3).every((r) => r === '')), 'a sun word and Allah light two: the laam ("silent") and the letter after it ("twice")');

  // Names: two, one template each, the same in both name sets.
  const names = items.map((i) => i.name);
  check(new Set(names).size === 2 && names.slice(0, 5).every((n) => n === 'The laam is read') && names.slice(5).every((n) => n === 'The laam is not read'), 'two names across the twelve: "The laam is read" (moon) and "The laam is not read" (sun, and Allah)', [...new Set(names)].join(' | '));
  const zn = boot({ v: 1, chosen: true, script: 'madani', names: 'zabar', grouping: 'families' });
  check(zn.kit.itemsFor(zn.shell).map((i) => i.name).join() === names.join(), 'the names have no zabar / fatha form: the same in both sets');
  const custom = kit.itemsFor(shell, { templates: { moon: 'Read', sun: 'Silent' } });
  check(custom[0].name === 'Read' && custom[5].name === 'Silent' && custom[11].name === 'Silent', 'the templates are the only source of a name (a teacher\'s edit reaches every word)');
  kit.rename(items, shell, { moon: 'A', sun: 'B' });
  check(items[0].name === 'A' && items[5].name === 'B', 'rename() rewrites every name in place');

  // Audio: none recorded, and none asked for by the recordings page.
  check(items.every((i) => i.audio.kind === 'words' && i.audio.glyph === i.id), 'a word\'s sound would be kept under the group "words", by its reference');

  // The board and the echo.
  const boards = kit.boards();
  check(boards.map((b) => b.id).join() === 'moon,sun,allah' && boards.map((b) => b.cells.length).join() === '5,5,2', 'the board is three lists: moon (5), sun (5), Allah (2)');
  check(JSON.stringify(kit.samples().map((s) => s.kind)) === '["moon","sun"]' && kit.samples().every((s) => data[s.ref]), 'the strip shows a moon word and a sun word on their own');
  check(kit.echoOf(items[0]).line === 'lineMoon' && kit.echoOf(items[5]).line === 'lineSun' && kit.echoOf(items[11]).line === 'lineSun' && kit.echoOf(items[0]).units.length === kit.lettersOf(data[items[0].id].madani).length,
    'under a wrong answer: the word again, lit, with the line for its kind (Allah gets the sun line)');
  check(kit.firstRow(1) === 'moon' && kit.firstRow(2) === 'sun' && kit.rowInPart('moon', 1) && !kit.rowInPart('sun', 1) && kit.rowInPart('sun', 2) && !kit.rowInPart('allah', 2) && kit.rowInPart('allah', 3), 'the same-line row starts on moon in part 1 and sun in part 2, and a row is only in the parts its words are');
  check(kit.sunLetters().length === 14 && kit.sunLetters().every((l) => SUN_LETTERS.has(l.codePointAt(0))) && kit.sunLetters().join('') === [...SUN_LETTERS].map((c) => cc(c)).join(''), 'the fourteen sun letters are composed by code point, and each one is a sun letter');
  check(kit.sampleOf(1, 'madani') === cc(ALIF_WASLA, LAAM, JAZAM_M) && kit.sampleOf(1, 'indopak').startsWith(cc(ALIF)) && kit.sampleOf(2, 'madani').length > 3 && kit.sampleOf(3, 'madani').includes(cc(SHADDA)),
    'the rail\'s samples are the front of a real word: Al- with its jazam, then the shadda letter', kit.sampleOf(2, 'madani').length);
  check(kit.titleGlyph() === cc(ALIF_WASLA, LAAM), 'the big glyph is the article, alif and laam');

  // No literal combining mark in any file of the lesson.
  const MARK_RE = new RegExp('[\\u064B-\\u0652\\u0670\\u0657\\u0660-\\u0669\\u06E1\\u06E5\\u06E6]');
  check(MARK_RE.test(cc(0x064E)) && MARK_RE.test(cc(0x0670)) && MARK_RE.test(cc(0x06E1)) && !MARK_RE.test(cc(LAAM)), 'the literal-mark pattern can fail (it catches a zabar, a small alif and U+06E1, and not a letter)');
  for (const file of ['al.js', 'rules.js', 'rule-lesson.js', 'lesson-18.html', 'exercise-18.html', 'rule-words.js']) {
    check(!MARK_RE.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')), `${file} holds no literal combining mark or small letter`);
  }
  check(/KIT_FILES = \[[^\]]*'al\.js'/.test(fs.readFileSync(path.join(dir, '..', '..', 'tools', 'fetch-qaida-words.js'), 'utf8')), 'the fetch tool reads its references from al.js');
}

console.log('\nThe other rules still stand');
{
  const w = boot(undefined, ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'ends.js', 'rule-words.js', 'al.js']);
  check(Object.keys(w.rules.RULES).join() === 'hamza,ends,al' && Object.keys(w.rules.KITS).join() === 'hamza,ends,al', 'the registry holds the hamza\'s kit, the ends\' and this one, each with its own board');
  check(w.rules.KITS.hamza.board === 'grid' && w.rules.KITS.ends.board === 'ends' && w.kit.board === 'words', 'three boards: a grid, two shape grids and a list of words');
  check(w.rules.KITS.hamza.formsOf().length === 15 && w.rules.KITS.ends.formsOf().length === 14, 'Lesson 16\'s fifteen forms and Lesson 17\'s fourteen are untouched');
}

console.log('\nMastery');
{
  const w = boot();
  const items = w.kit.itemsFor(w.shell);
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(18, items[0].id, true);
  check(w.shell.masteredCount(18) === 1, 'masteredCount(18) counts one mastered word', String(w.shell.masteredCount(18)));
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(18, items[11].id, true);
  check(w.shell.masteredCount(18) === 2, 'and two, when two are mastered', String(w.shell.masteredCount(18)));
  check([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].every((n) => w.shell.masteredCount(n) === 0), 'none of it counts toward another lesson');
  const switched = boot();
  const inMadani = switched.kit.itemsFor(switched.shell)[3];
  for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(18, inMadani.id, true);
  switched.shell.state.script = 'indopak';
  const inIndoPak = switched.kit.itemsFor(switched.shell)[3];
  check(inIndoPak.id === inMadani.id && inIndoPak.glyph !== inMadani.glyph && switched.rules.stats(switched.shell, 18, [inIndoPak], 1, { target: 3 }).known === 1,
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
  for (const file of ['shell.js', 'marks.js', 'rules.js', 'rule-words.js', 'al.js', 'audio.js']) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  const rows = audioCtx.qaidaAudio.wanted();
  check(rows.length === 447, 'the recordings page still lists 447 rows: Lesson 18 adds none (its words are recorded one at a time, under their references, in a later step)', String(rows.length));
  const items = audioCtx.qaidaRules.KITS.al.itemsFor(audioCtx.qaidaShell);
  check(items.every((i) => audioCtx.qaidaAudio.has(i.audio.kind, i.audio.glyph) === false), 'and no word has a recording yet, so hearing practice stays shut for them');
}

console.log('\nThe engine: questions on every part');
{
  const w = boot();
  const items = w.kit.itemsFor(w.shell);
  const expectNames = { 1: 2, 2: 2, 3: 2 };
  const expectTotal = { 1: 5, 2: 5, 3: 12 };
  let asked = 0;
  let sameAnswer = 0;
  let sameName = 0;
  let notOwn = 0;
  let starved = 0;
  let wrongCount = 0;
  let reversed = 0;
  let rightMissing = 0;
  for (const n of [1, 2, 3]) {
    // What the page hands the drill: the part's own words (required) and the words that ride along (not required), as rule-lesson.js's usePool.
    const own = w.rules.poolFor(items, n);
    const riders = w.kit.ridersOf(items, n).map((item) => ({ ...item, required: false }));
    const pool = own.concat(riders);
    check(own.length === expectTotal[n] && own.every((i) => i.required) && riders.every((i) => !i.required && !own.some((o) => o.id === i.id)), `part ${n}: ${own.length} words of its own, required, and ${riders.length} riding along, not required`, `${own.length} / ${riders.length}`);
    check(new Set(pool.map((i) => i.name)).size === expectNames[n], `part ${n}: ${pool.length} words and ${expectNames[n]} distinct names, so a question always has a second answer to offer`, `${pool.length} / ${new Set(pool.map((i) => i.name)).size}`);
    const drill = w.practice.create({
      lesson: 18, items: pool, formats: [FORM_TO_NAME], random: seeded(41 + n), familyFirst: false,
      noRepeatWithin: Math.max(1, Math.min(8, pool.length - 2)),
    });
    drill.start();
    check(drill.progress().total === expectTotal[n], `part ${n}: the drill counts ${expectTotal[n]} words toward ready: the riders count for nothing`, String(drill.progress().total));
    for (let i = 0; i < 100; i += 1) {
      const q = drill.question;
      if (!q) { starved += 1; break; }
      asked += 1;
      const ids = q.choices.map((c) => c.id);
      const names = q.choices.map((c) => c.name);
      if (new Set(ids).size !== ids.length) sameAnswer += 1;
      if (new Set(names).size !== names.length) sameName += 1;
      if (q.choices.length !== 2) wrongCount += 1;
      if (q.format.ask !== 'glyph' || q.format.answerWith !== 'name') reversed += 1;
      if (!ids.includes(q.item.id)) rightMissing += 1;
      if (!pool.some((p) => p.id === q.item.id)) notOwn += 1;
      drill.answer(q.item.id);
      drill.next();
    }
  }
  check(asked === 300 && starved === 0, '300 questions through the real engine, on all three parts', `${asked} asked, ${starved} starved`);
  check(sameAnswer === 0 && sameName === 0, 'never the same answer twice, and never two choices with one name', `${sameAnswer} / ${sameName}`);
  check(wrongCount === 0, 'always two choices: two answers, so the question is "is the laam read?" and a wrong answer must teach (the echo shows the word lit)', String(wrongCount));
  check(reversed === 0, 'no question is NAME_TO_FORM or SOUND_TO_FORM: a name is not a picture');
  check(rightMissing === 0 && notOwn === 0, 'the right answer is always among the choices, and always one of the part\'s own words');
  check(w.kit.ridersOf(items, 1).every((i) => i.kind === 'sun') && w.kit.ridersOf(items, 2).every((i) => i.kind === 'moon') && w.kit.ridersOf(items, 3).length === 0 && w.kit.ridersOf(items, 1).length === 5 && w.kit.ridersOf(items, 2).length === 5,
    'the riders are the other kind: sun words in part 1, moon words in part 2, none in part 3 (which has every word), and never Allah');
  // Without them a part of one kind has one answer, and the engine cannot ask (it never offers one name twice): the reason they exist.
  const alone = w.practice.create({ lesson: 18, items: w.rules.poolFor(items, 1), formats: [FORM_TO_NAME], random: seeded(9), familyFirst: false });
  alone.start();
  check(alone.question === null, 'part 1 with no riders cannot ask a question at all: one kind is one answer (the bug the riders fix)');
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



const nodeLoad = ['shell.js', 'audio.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'al.js', 'rule-lesson.js', 'spell.js'];
const NOMARK = new RegExp('[\\u064B-\\u0652\\u0670\\u0657\\u06D6-\\u06ED]'); // a literal combining mark or small Quranic letter

async function pageHalf() {
  let w;
  try {
    w = run('lesson-18.html', nodeLoad, { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against lesson-18.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  check(true, 'shell.js, audio.js, practice.js, marks.js, rules.js, rule-words.js, al.js, rule-lesson.js and spell.js load against lesson-18.html without an error');
  await sleep(20);
  const { $, all, click, shell, marks, rules, htmlEl } = w;
  const kit = rules.KITS.al;
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

  console.log('\nThe page');
  check(qaida.kind === 'drill' && qaida.rule === 'al' && qaida.hasOther === false && qaida.otherCount === 0 && qaida.hasTail === false && qaida.markCount === 1 && qaida.review === 0,
    'publishes window.qaida with kind "drill" and rule "al", and nothing to be told apart from, no tails, no review');
  check(htmlEl.attrs['data-rule'] === 'al' && htmlEl.attrs['data-point'] === 'none' && htmlEl.attrs['data-mark'] === undefined, 'the page teaches the al rule, with no halo and no mark');
  check(JSON.stringify(qaida.groupCosts().map((p) => p.items)) === '[5,5,12]', 'groupCosts() is 5, 5 then 12', JSON.stringify(qaida.groupCosts().map((p) => p.items)));
  check(rail().length === 3 && rail().every((b) => b.attrs.disabled === undefined), 'three parts, all enabled: nothing is locked');
  check(qaida.parts.map((p) => p.name).join('|') === 'Moon letters|Sun letters|Both, and Allah', 'the three parts are named by kind', qaida.parts.map((p) => p.name).join('|'));

  // The members the options panel reads: a missing one throws in the panel and takes the page down.
  const panel = fs.readFileSync(path.join(dir, 'qaida-options.js'), 'utf8');
  const drillBranch = panel.slice(panel.indexOf("lesson.kind === 'drill'"), panel.indexOf("lesson.kind === 'exercise'"));
  const read = [...new Set([...drillBranch.matchAll(/\blesson\.(\w+)/g)].map((m) => m[1]))];
  const lesson3Only = ['setBand', 'bandTotals', 'setDrilled'];
  const assigned = ['onCosts'];
  const missing = read.filter((name) => !lesson3Only.includes(name) && !assigned.includes(name) && !(name in qaida));
  check(read.length > 20 && missing.length === 0, `every window.qaida member the panel reads exists (${read.length} read)`, missing.join(', '));

  console.log('\nThe head');
  check($('h1').textContent === 'Al-' && w.doc.title.startsWith('Lesson 18: Al-'), 'the title is in both name sets', $('h1').textContent + ' / ' + w.doc.title);
  check($('.title-mark').textContent === cc(ALIF_WASLA, LAAM), 'the big glyph is the article, alif and laam', cps($('.title-mark').textContent).join());
  const glyphs = all('.band-glyph').map((g) => g.textContent);
  check(glyphs.join() === [kit.sampleOf(1), kit.sampleOf(2), kit.sampleOf(3)].join(), 'the rail shows the front of a moon word, a sun word and Allah', glyphs.length);
  check($('.eyebrow').textContent === 'Lesson 18 of 29' && all('.track li').length === 29 && all('.track li').findIndex((li) => li.classes().includes('now')) === 17,
    'Lesson 18 of 29, the eighteenth of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '12', 'the bar\'s total is the twelve words', $('.bar').attrs['aria-valuemax']);
  check(!$('.pairs') && !$('.pair-feature') && !$('.halo') && !$('.jazam-note') && !$('.mark-alone') && !$('.joined'), 'none of a mark lesson\'s board is on this page');

  console.log('\nThe board: the two words and the three lists');
  const strip = $('.seat-strip').querySelectorAll('.word-cell');
  check(strip.length === 2 && strip.every((t) => t.tag === 'button' && t.attrs['data-audio'] === undefined), 'the strip has two word tiles, and they say nothing when tapped: no recording exists yet');
  check($('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|') === 'a moon letter|a sun letter', 'captioned "a moon letter" and "a sun letter"');
  const stripUnits = strip.map(unitsOfTile);
  check(stripUnits[0].filter((u) => u.role).length === 1 && stripUnits[1].filter((u) => u.role).length === 2, 'the moon word lights one place and the sun word two');
  check(/Arabic for “the”/.test($('.seat-note').textContent) && /moon letters and sun letters/.test($('.seat-note').textContent) && !/\b29\b/.test($('.seat-note').textContent), 'the line under them says what Al- is, with no "29"', $('.seat-note').textContent);
  check($('.rule-grid').querySelectorAll('.rule-grid-title').map((t) => t.textContent).join('|') === 'Moon letters|Sun letters|The name Allah', 'each list has a heading');
  check(wordRows().length === 3 && wordRows().map((r) => r.attrs['data-mark']).join() === 'moon,sun,allah' && wordRows().map((r) => r.querySelectorAll('.word-cell').length).join() === '5,5,2', 'three lists of 5, 5 and 2 words');
  check(gridTiles().length === 12 && tiles().length === 14, 'twelve words on the board, and the two on their own above them');
  check(wordRows().map((r) => r.querySelector('.rule-name').textContent).join('|') === 'the laam is read|the laam is not read|the laam is not read', 'the row names', wordRows().map((r) => r.querySelector('.rule-name').textContent).join('|'));
  check(/^a (sukoon|jazam) on the laam$/.test(wordRows()[0].querySelector('.rule-sound').textContent) && !/[{}]/.test($('.rule-grid').textContent), 'each row says what its words look like, in the student\'s own word for the jazam, with no token left in it', wordRows()[0].querySelector('.rule-sound').textContent);
  const later = () => gridTiles().filter((t) => t.attrs['data-state'] === 'later').length;
  check(later() === 7, 'part 1: the seven sun and Allah words are dim, "comes later"; the map is all there', String(later()));
  qaida.setGroup(2);
  check(later() === 2 && gridTiles().length === 12, 'part 2: only the two Allah words are dim, and the board has not changed shape', String(later()));
  qaida.setGroup(3);
  check(later() === 0, 'part 3: none dim', String(later()));
  qaida.setGroup(1);
  check(gridTiles().every((t) => t.tag === 'button'), 'a dim word is a button all the same: nothing is locked');
  check(gridTiles().every((t) => /^The laam is (not )?read\. Verse \d+:\d+\.$/.test(t.attrs['aria-label'])), 'every word is named for a screen reader: what it says, and its verse', gridTiles()[0].attrs['aria-label']);
  check(gridTiles().every((t) => t.querySelector('.glyph').attrs['aria-hidden'] === 'true' && t.querySelector('.word-ref').attrs['aria-hidden'] === 'true'), 'and the word and its verse mark are hidden from a screen reader: the button carries the name');
  check(gridTiles().map((t) => t.querySelector('.word-ref').textContent).every((r, i) => r === forms[i].ref.split(':').slice(0, 2).join(':')), 'each word shows where in the Qur\'an it was copied from (surah:verse)');
  check(gridTiles().every((t, i) => unitsOfTile(t).map((u) => u.text).join('') === data[forms[i].ref].madani), 'every word on the board is the copied text, character for character (in Madani)');

  console.log('\nThe board: the same-sound line, the script lines and the sun letters');
  check(/^A (sukoon|jazam) on the laam: the laam is read\./.test($('.same-line').textContent), 'part 1 starts on the moon row: a jazam on the laam is read', $('.same-line').textContent);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'sun'));
  check(/bare laam.*shadda.*said twice/.test($('.same-line').textContent), 'tapping a sun word says a bare laam and a shadda: the laam is not read and the letter is said twice', $('.same-line').textContent);
  check($('.word-row[data-current]').attrs['data-mark'] === 'sun' && all('.word-row').filter((r) => 'data-current' in r.attrs).length === 1, 'and the row it is about is the one lit');
  check($('.sun-letters').hidden === true, 'part 1: the sun letters are not shown');
  qaida.setGroup(2);
  check(/^A bare laam/.test($('.same-line').textContent) && $('.sun-letters').hidden === false, 'part 2 keeps the sun row, and shows the sun letters', $('.same-line').textContent);
  const sunLine = $('.sun-letters');
  check(/^The fourteen sun letters/.test(sunLine.textContent) && sunLine.querySelector('.sun-letters-glyphs').textContent === kit.sunLetters().join(' ') && sunLine.querySelector('.sun-letters-glyphs').attrs['aria-hidden'] === 'true',
    'the sun letters are the fourteen, composed, hidden from a screen reader', sunLine.textContent);
  qaida.setGroup(3);
  check($('.sun-letters').hidden === false, 'part 3 shows them too');
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'allah'));
  check(/Allah is Al- and lah/.test($('.same-line').textContent), 'tapping Allah says it is Al- and lah, and the second laam is said twice', $('.same-line').textContent);
  qaida.setGroup(1);
  check(/^A (sukoon|jazam)/.test($('.same-line').textContent), 'back to part 1, the line is about a moon word again: the row it was on (Allah) is not in part 1', $('.same-line').textContent);
  check(/small mark on it/.test($('.script-line').textContent) && !/no mark/.test($('.script-line').textContent), 'the Madani student sees the Madani line, and only that', $('.script-line').textContent);
  check($('.lead-line').hidden === true, 'and no line about a font');
  await w.setScript('indopak');
  check(/has no mark, except at the start of a verse, where it has a fatha/.test($('.script-line').textContent) && !/small mark/.test($('.script-line').textContent), 'the Indo-Pak student sees the Indo-Pak line, in the student\'s own word for zabar (fatha names here)', $('.script-line').textContent);
  check($('.lead-line').hidden === false && /Indo-Pak print/.test($('.lead-line').textContent) && /stand-in/.test($('.lead-line').textContent), 'and is told once that the Qur\'an\'s own Indo-Pak print is drawn in a stand-in until its font is added', $('.lead-line').textContent);
  await w.setScript('madani');

  console.log('\nThe two scripts');
  const glyphOfWord = (ref) => gridTiles().find((t) => t.attrs['data-id'] === ref).querySelector('.glyph').textContent;
  await w.setScript('indopak');
  check(forms.every((f) => glyphOfWord(f.ref) === data[f.ref].indopak), 'Indo-Pak: every word on the board is the copied Indo-Pak text, character for character');
  check($('.title-mark').textContent === cc(ALIF, LAAM) && all('.band-glyph')[0].textContent.startsWith(cc(ALIF)), 'the title glyph and the rail follow the script (a plain alif, not the wasla)');
  check(kit.samples().every((s, i) => unitsOfTile($('.seat-strip').querySelectorAll('.word-cell')[i]).map((u) => u.text).join('') === data[s.ref].indopak), 'and so do the two on their own');
  await w.setScript('madani');
  check(forms.every((f) => glyphOfWord(f.ref) === data[f.ref].madani), 'Madani: every word is the copied Madani text, character for character');

  console.log('\nThe drill');
  check($('.ask').textContent === 'Is the laam read in this word?', 'the question is "Is the laam read in this word?"', $('.ask').textContent);
  let q = itemShown();
  check(Boolean(q) && choices().length === 2 && choices().every((c) => c.attrs['data-face'] === 'name') && new Set(choices().map((c) => c.textContent)).size === 2 && choices().map((c) => c.textContent).sort().join('|') === 'The laam is not read|The laam is read',
    'part 1: two choices, "The laam is read" and "The laam is not read"', choices().map((c) => c.textContent).join(' | '));
  check($('.prompt-glyph').textContent === data[q.id].madani && $('.prompt-glyph').attrs['aria-hidden'] === 'true', 'the question shows the copied word, hidden from a screen reader');
  // Part 1 asks moon words and, riding along, sun words: both come up over a run, and every one has two choices.
  const kinds = new Set();
  for (let i = 0; i < 24; i += 1) {
    const shown = itemShown();
    kinds.add(shown.kind);
    check(choices().length === 2, i === 0 ? 'and all through a run of 24 questions in part 1, every question has two choices' : `part 1 question ${i + 1} has two choices`, String(choices().length));
    click(answerFor());
    click($('.next-question'));
    await sleep(5);
  }
  check(kinds.has('moon') && kinds.has('sun') && !kinds.has('allah'), 'in part 1 the moon words are asked and the sun words ride along, and Allah never comes up', [...kinds].join());
  qaida.clear();
  await sleep(20);
  q = itemShown();
  click(answerFor());
  check(/^Yes — The laam is (not )?read\.$/.test($('.verdict').textContent), 'right: "Yes — The laam is read." (the word\'s own name)', $('.verdict').textContent);
  check($('.seat-echo').hidden === true, 'and no line under a right answer');
  await sleep(20);
  q = itemShown();
  const wrong = wrongFor();
  const wrongName = wrong.textContent;
  click(wrong);
  check($('.verdict').textContent === `You chose “${wrongName}”. This one is “${q.name}”.`, 'wrong: says what it chose and what it is, once, with no scolding', $('.verdict').textContent);
  const echoUnits = $('.seat-echo').querySelectorAll('.seat-echo-word .unit');
  check($('.seat-echo').hidden === false && echoUnits.map((u) => u.textContent).join('') === data[q.id].madani && echoUnits.filter((u) => u.attrs['data-role']).length === (q.kind === 'moon' ? 1 : 2),
    'under a wrong answer: the same word again, whole, with its lit places', String(echoUnits.length));
  check($('.seat-echo').textContent.startsWith(q.kind === 'moon' ? 'The laam has a jazam, so it is read:' : 'The laam is bare and the next letter has a shadda'), 'and the line for its kind says why', $('.seat-echo').textContent);
  check(gridTiles().filter((t) => 'data-missed' in t.attrs).map((t) => t.attrs['data-id']).join() === q.id, 'and the word just missed keeps its gold edge on the board, that one tile');
  check($('.word-row[data-current]').attrs['data-mark'] === (q.kind === 'allah' ? 'allah' : q.kind), 'the board\'s row follows the miss');
  check($('.after').hidden === false && $('.after').attrs['data-kind'] === 'wrong' && $('.after-name').textContent === q.name && $('.after-glyph').textContent === q.glyph, 'the strip under a miss names the word and offers Hear it, Say it, Write it and Next');
  click($('.after .trace'));
  check(w.opened.length === 1 && w.opened[0][0] === q.glyph && w.opened[0][1] === 'this word', '"Write it" opens the writing board on the whole word, titled "Trace this word" (a text field), not with the name of the answer', w.opened.map((o) => o.join(' / ')).join());
  const last = qaida.lastItem;
  check(Boolean(last) && last[0] === 'words' && last[1] === q.id && last[2] === 'this word' && last[3] === q.glyph, 'the top bar\'s Say it opens on the word: kept under its reference, shown as its text, titled "this word"', last ? last.join(' / ') : 'none');
  click($('.next-question'));
  await sleep(20);
  check($('.seat-echo').hidden === true && !gridTiles().some((t) => 'data-missed' in t.attrs), 'the next question clears the line and the gold edge');

  // Every part: two choices, the right names, never the reverse.
  const seen = new Set();
  for (const n of [1, 2, 3]) {
    qaida.setGroup(n);
    await sleep(10);
    for (let i = 0; i < 16; i += 1) {
      const shown = itemShown();
      if (!shown) break;
      seen.add(shown.id);
      if (choices().length !== 2) check(false, `part ${n}: two choices`, String(choices().length));
      click(answerFor());
      click($('.next-question'));
      await sleep(5);
    }
  }
  check(seen.size >= 8, 'the drill walks through the words of every part', String(seen.size));
  qaida.setGroup(3);
  await sleep(10);
  const kindsIn3 = new Set();
  for (let i = 0; i < 30; i += 1) {
    kindsIn3.add(itemShown().kind);
    click(answerFor());
    click($('.next-question'));
    await sleep(5);
  }
  check(kindsIn3.has('moon') && kindsIn3.has('sun') && kindsIn3.has('allah'), 'part 3 asks moon words, sun words and Allah', [...kindsIn3].join());
  qaida.setGroup(1);

  console.log('\nThe names follow the student');
  await w.setNames('zabar');
  check(/^a jazam on the laam$/.test(wordRows()[0].querySelector('.rule-sound').textContent) && /^A jazam on the laam: the laam is read\./.test($('.same-line').textContent), 'in the zabar set the lines say jazam, in the fatha set sukoon', $('.same-line').textContent);
  check(choices().every((c) => /^The laam is (not )?read$/.test(c.textContent)) && $('.prev span').textContent === 'Previous: The round taa and the end yaa', 'and the answers and Previous do not change (they have no zabar form)', $('.prev span').textContent);
  await w.setNames('fatha');

  console.log('\nFinishing');
  qaida.clear();
  await sleep(20);
  check(shell.isDone(18) === false, 'nothing is done to begin with');
  qaida.setGroup(1);
  const master = (n) => {
    for (const f of forms.filter((x) => x.parts.includes(n))) for (let i = 0; i < 3; i += 1) shell.recordAnswer(18, kit.idOf(f), true);
  };
  master(1);
  qaida.render();
  await sleep(20);
  check(shell.isDone(18) === false && $('.ready-note').hidden === false, 'part 1 known: the part says you seem ready, and the lesson is not done (part 3 gates it)');
  master(3);
  qaida.setGroup(3);
  await sleep(20);
  check(shell.isDone(18) === true && $('.end-line').textContent.startsWith('You can tell when the laam of Al- is read'), 'every word known: the lesson is done, and says so', $('.end-line').textContent);
  check(shell.masteredCount(18) === 12, 'and the home\'s count is the twelve', String(shell.masteredCount(18)));
  check(shell.drillOf(18).total === 12, 'the home reads the whole lesson\'s total, 12, and not the open part\'s', String(shell.drillOf(18).total));
  qaida.clear();
  await sleep(20);
  check(shell.isDone(18) === false && shell.masteredCount(18) === 0, 'Start again clears it');
  // The riders alone never make a part ready.
  qaida.setGroup(1);
  for (const f of forms.filter((x) => x.kind === 'sun')) for (let i = 0; i < 3; i += 1) shell.recordAnswer(18, kit.idOf(f), true);
  qaida.render();
  await sleep(20);
  check($('.ready-note').hidden === true, 'a part is not ready because the words riding along are known: only its own count', $('.ready-note').textContent);
  qaida.clear();
  await sleep(20);

  console.log('\nThe walkthrough');
  const units = () => $('.spell-glyph').children.map((u) => u.textContent);
  const states = () => $('.spell-glyph').children.map((u) => u.classes().filter((c) => c !== 'unit')[0]);
  const stepsOf = () => {
    const captions = [$('.spell-caption').textContent];
    while (!$('.spell-next').hidden && captions.length < 12) { click($('.spell-next')); captions.push($('.spell-caption').textContent); }
    return captions;
  };
  check(all('.word-step').length === 3, 'three walkthrough words');
  check(units().join('') === data[kit.WALK[0].ref].madani && units().length === kit.lettersOf(data[kit.WALK[0].ref].madani).length, 'word 1 is the copied moon word, one unit a letter', units().length);
  check(states().join() === 'active,active,unread,unread,unread', 'step 1 lights the alif and the laam, and nothing else', states().join());
  const c1 = stepsOf();
  check(c1.length === 3 && c1[0] === 'Alif and laam: “al”. The laam has a jazam, so it is read.' && c1[1] === 'The rest of the word: “hamdu”.' && c1[2] === 'The whole word: al-hamdu.', 'word 1: three steps, the article, the rest, the whole', c1.join(' / '));
  check(states().every((s) => s === 'read'), 'the last step settles every letter to plain');
  click($('.spell-nextword'));
  check(units().join('') === data[kit.WALK[1].ref].madani, 'word 2 is the copied sun word');
  const c2 = stepsOf();
  check(c2.length === 3 && c2[0] === 'Alif and laam: “a”. The laam has no mark, so it is not read.' && /^The rest of the word: “sh-shamsu”\. Its first letter has a shadda, so it is said twice\.$/.test(c2[1]) && c2[2] === 'The whole word: ash-shamsu.', 'word 2: the sun word says its laam is not read, and its first letter is said twice', c2.join(' / '));
  click($('.spell-nextword'));
  const c3 = stepsOf();
  check(units().join('') === data[kit.WALK[2].ref].madani && c3.length === 3 && c3[2] === 'The whole word: Allaahu.' && /not read/.test(c3[0]), 'word 3 is Allah, read with the sun lines', c3.join(' / '));
  check($('.spell-meaning').textContent === 'It means “Allah.”', 'and the meaning shows on the last step', $('.spell-meaning').textContent);
  await w.setScript('indopak');
  click(all('.word-step')[0]);
  check(units().join('') === data[kit.WALK[0].ref].indopak, 'in Indo-Pak the walkthrough shows the copied Indo-Pak text', units().join('') === data[kit.WALK[0].ref].madani ? 'same' : 'different');
  await w.setScript('madani');

  console.log('\nThe ways out: Previous goes to Lesson 17, Next to Lesson 19 (built since: a real link)');
  check($('.prev').attrs.href === 'lesson-17.html' && $('.prev span').textContent === 'Previous: The round taa and the end yaa', 'Previous goes to Lesson 17', $('.prev span').textContent);
  check($('.spell-more a').attrs.href === 'exercise-18.html' && fs.existsSync(path.join(dir, 'exercise-18.html')), 'Practice reading goes to exercise-18.html, which exists');
  check($('.next span').textContent === 'Next: The joining alif' && !$('.next').attrs['data-last'], 'Next reads "Next: The joining alif"', $('.next span').textContent);
  w.location.href = '';
  click($('.next'), 1);
  check(w.location.href === 'lesson-19.html', 'and it goes to lesson-19.html, which is built now (it said "not built yet" until Lesson 19 was)', String(w.location.href));

  console.log('\nThe home');
  const home = boot();
  check(home.shell.LESSONS.find((l) => l.n === 18).built === true && home.shell.LESSONS.find((l) => l.n === 18).href === 'lesson-18.html' && home.shell.LESSONS.find((l) => l.n === 18).progress === 'drill' && home.shell.LESSONS.find((l) => l.n === 18).part === 2,
    'the home\'s row 18 is built, a drill, in the second part, and leads to lesson-18.html');
  check(home.shell.LESSONS.find((l) => l.n === 17).built && home.shell.LESSONS.find((l) => l.n === 19).built && home.shell.LESSONS.find((l) => l.n === 20).built && home.shell.LESSONS.find((l) => l.n === 21).built && home.shell.LESSONS.find((l) => l.n === 22).built && !home.shell.LESSONS.find((l) => l.n === 23).built, 'and 17, 19, 20, 21 and 22 are built and 23 is not');

  console.log('\nThe markup');
  check(!NOMARK.test(w.raw), 'lesson-18.html holds no literal combining mark');
  check(!/[ء-ي]/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<dialog class="chooser"[\s\S]*?<\/dialog>/, '')), 'and no Arabic on the lesson itself: every word is copied into rule-words.js and drawn by rule-lesson.js');
  check(/&#x671;&#x644;/.test(w.raw), 'the title glyph is the article, as numeric references');
  const at = (file) => w.raw.indexOf(`<script src="${file}" defer></script>`);
  check(at('rules.js') > 0 && at('rules.js') < at('rule-words.js') && at('rule-words.js') < at('al.js') && at('al.js') < at('rule-lesson.js') && at('spell.js') > at('rule-lesson.js') && at('ends.js') === -1,
    'the scripts load in order: rules.js, rule-words.js, al.js, then the page\'s code and spell.js (ends.js is not needed here)');
  check(!NOMARK.test(fs.readFileSync(path.join(dir, 'rule-lesson.js'), 'utf8')) && !NOMARK.test(fs.readFileSync(path.join(dir, 'al.js'), 'utf8')), 'rule-lesson.js and al.js hold no literal combining mark');
  const visible = w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|leen|madd|qalqalah|idgham|ikhfa|izhar|ghunna|tajweed)\b/i.test(visible), 'no scolding and no tajweed word on the page (the plain-names rule; docs/pass-2/03 §4)');
  check(!/\b29\b/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace('Lesson 18 of 29', '')), 'no "29" on the page but the lesson count');
  check((w.raw.match(/data-words(-attr)?=/g) || []).length > 60, 'every line of wording is a text field (data-words / data-words-attr)');
  const wordsAttrOK = [...w.raw.matchAll(/data-words-attr="([^"]*)"/g)].every((m) => m[1].split(';').every((pair) => pair.includes('|')));
  check(wordsAttrOK, 'and every data-words-attr entry is "attribute|label"');
  // Every data- attribute the board reads has a text field (data-words-attr) beside it, so the teacher can edit it.
  const boardTag = w.raw.match(/<section class="marks-board[\s\S]*?>\s*<div class="section-head">/)[0];
  const boardAttrs = [...boardTag.matchAll(/\s(data-[\w-]+)="/g)].map((m) => m[1]).filter((a) => a !== 'data-words-attr');
  const boardFields = boardTag.match(/data-words-attr="([^"]*)"/)[1].split(';').map((p) => p.split('|')[0]);
  check(boardAttrs.every((a) => boardFields.includes(a)), 'every line of the board\'s wording has its own text field', boardAttrs.filter((a) => !boardFields.includes(a)).join(', '));
  // The same for the other sections that carry wording.
  for (const [name, re] of [['the spell block', /<section class="spell"[\s\S]*?>\s*<div class="section-head">/], ['the echo line', /<p class="seat-echo"[\s\S]*?><\/p>/], ['the verdict', /<p class="verdict"[\s\S]*?><\/p>/], ['the advice', /<div class="advice"[\s\S]*?>\s*<div class="struggle"/], ['the names', /<span hidden\s[\s\S]*?><\/span>/]]) {
    const tag = w.raw.match(re)[0];
    const attrs = [...tag.matchAll(/\s(data-[\w-]+)="/g)].map((m) => m[1]).filter((a) => a !== 'data-words-attr');
    const fields = (tag.match(/data-words-attr="([^"]*)"/) || ['', ''])[1].split(';').map((p) => p.split('|')[0]);
    check(attrs.every((a) => fields.includes(a)), `every line of ${name} has its own text field`, attrs.filter((a) => !fields.includes(a)).join(', '));
  }

  console.log('\nThe reading page');
  let ex;
  try {
    ex = run('exercise-18.html', ['shell.js', 'marks.js', 'rules.js', 'rule-words.js', 'al.js', 'exercise.js'], { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against exercise-18.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  await sleep(20);
  const cells = () => ex.all('.mashq-word');
  check(cells().length === 12 && ex.ctx.qaida.kind === 'exercise' && ex.ctx.qaida.count === 12, 'exercise-18.html has twelve words');
  check(/data-rule="al"/.test(ex.raw) && !/data-mark=/.test(ex.raw) && /href="lesson-18\.html"/.test(ex.raw) && /data-next-fatha="Next: The joining alif"/.test(ex.raw) && !/data-last/.test(ex.raw),
    'it teaches the al rule, goes back to Lesson 18 and on to Lesson 19');
  check(ex.$('.exercise-lede').textContent === 'Twelve of the Qur’an’s own words, each beginning with Al- — read them yourself, no translations.', 'its line says so', ex.$('.exercise-lede').textContent);
  const wordText = () => cells().map((c) => c.children.find((k) => k.attrs.lang === 'ar').textContent);
  check(wordText().join('|') === kit.READING.map((ref) => data[ref].madani).join('|'), 'in Madani the twelve are the copied Madani words, in the order al.js lists them, character for character');
  await ex.setScript('indopak');
  check(wordText().join('|') === kit.READING.map((ref) => data[ref].indopak).join('|'), 'in Indo-Pak, the copied Indo-Pak words');
  check(!NOMARK.test(ex.raw), 'and exercise-18.html holds no literal combining mark');
}

pageHalf().then(() => {
  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
});
