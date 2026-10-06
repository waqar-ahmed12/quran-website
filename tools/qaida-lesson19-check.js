// Checks for Lesson 19's word layer (wasl.js, on rules.js, with the Qur'an's own words and pairs in rule-words.js) and, below it, the rule
// page (rule-lesson.js against the real lesson-19.html in a small hand-made DOM). QAIDA-BUILD.md step P2; docs/lesson-19/02 §3.
//
//   node tools/qaida-lesson19-check.js
//
// The data half loads the real shell.js, practice.js, marks.js, rules.js, rule-words.js and wasl.js into a scratch context with an in-memory
// stand-in for localStorage, as tools/qaida-lesson18-check.js does. The page half is at the foot of this file.
//
// The same limits as every other page check: nothing is drawn and no CSS runs, so it cannot tell whether a pair fits its tile, whether
// the lit band sits on the right letters, or how a face draws a word. Those were measured in the browser pane at the build
// (docs/lesson-19/02 §3; §4 is the user's list). What it proves is what only a script can: that every reference the lesson names is in the
// copied file, in both scripts, and that the copy is exact; that every word holds only what the student has met; that the alif, the letter
// before it and the long vowel are where the lesson says, by the marks on them; that the Indo-Pak start vowel on every word is the one the
// lesson declares (Quran.com's own text says so); that the lit parts, put back together, are the whole word or pair; and that the ids, the two
// scripts, the engine's questions (each drawn only from its own question's answers), the board, the lines and the ways out do what they say.
// Prints PASS or FAIL per check; the exit code is the number that failed.
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

function boot(saved, files = ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'wasl.js']) {
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
  return { shell: ctx.qaidaShell, practice: ctx.qaidaPractice, marks: ctx.qaidaMarks, rules: ctx.qaidaRules, kit: ctx.qaidaRules.KITS.wasl, words: ctx.qaidaRuleWords, store };
}

const cc = (...codes) => String.fromCharCode(...codes);
const cps = (text) => [...text].map((c) => c.codePointAt(0));
const ALIF_WASLA = 0x0671;
const ALIF = 0x0627;
const LAAM = 0x0644;
const SPACE = 0x20;
const FATHA = 0x064E;
const KASRA = 0x0650;
const DAMMA = 0x064F;
const JAZAM_M = 0x0652; // Madani's jazam, as the text carries it
const JAZAM_I = 0x06E1; // Indo-Pak's
const SMALL_ALIF = 0x0670;
const YAA_END = 0x0649;
const YAA = 0x064A;
const VOWEL_CODE = { fatha: FATHA, kasra: KASRA, damma: DAMMA };
// What a word may hold: a letter of the 29 (or the alif wasla), tatweel, and the marks the student has met by Lesson 19 (the harakat, the
// tanween, the shadda, the jazam in both drawings, and the small alif). No madd, no stop sign, no silent-letter circle, no direction mark.
const isLetter = (c) => (c >= 0x0621 && c <= 0x064A) || c === ALIF_WASLA;
const ALLOWED_MARK = new Set([0x064B, 0x064C, 0x064D, 0x064E, 0x064F, 0x0650, 0x0651, 0x0652, 0x0670, 0x06E1]);
const okChar = (c) => isLetter(c) || c === 0x0640 || c === SPACE || ALLOWED_MARK.has(c);

const FORM_TO_NAME = { id: 'form-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0 };
const waslSource = fs.readFileSync(path.join(dir, 'wasl.js'), 'utf8');
const REF_RE = /['"](\d{1,3}:\d{1,3}:\d{1,3}(?:-\d{1,3})?)['"]/g;

console.log('The data layer: rule-words.js and wasl.js');
{
  const { shell, marks, rules, kit, words } = boot();
  const forms = kit.formsOf();
  const data = words.words;

  // The copy: every reference the lesson names is in the copied file, in both scripts, and the file holds nothing else.
  const named = new Set([...waslSource.matchAll(REF_RE)].map((m) => m[1]));
  check(named.size === 39 && [...named].every((ref) => data[ref] && data[ref].madani && data[ref].indopak), `every reference wasl.js names (${named.size}) is in rule-words.js, in both scripts`, String(named.size));
  const alNamed = new Set([...fs.readFileSync(path.join(dir, 'al.js'), 'utf8').matchAll(REF_RE)].map((m) => m[1]));
  const maddNamed = new Set([...fs.readFileSync(path.join(dir, 'madd.js'), 'utf8').matchAll(REF_RE)].map((m) => m[1]));
  const silentNamed = new Set([...fs.readFileSync(path.join(dir, 'silent.js'), 'utf8').matchAll(REF_RE)].map((m) => m[1]));
  const stopNamed = new Set([...fs.readFileSync(path.join(dir, 'stop.js'), 'utf8').matchAll(REF_RE)].map((m) => m[1]));
  check(Object.keys(data).every((ref) => named.has(ref) || alNamed.has(ref) || maddNamed.has(ref) || silentNamed.has(ref) || stopNamed.has(ref)), 'and rule-words.js holds no word that none of al.js, wasl.js, madd.js, silent.js and stop.js names (the fetch tool reads the references out of the kit files)');
  check([...named].every((ref) => !alNamed.has(ref)), 'no reference is named by both Lesson 18 and Lesson 19: each lesson\'s words are its own');
  const fileText = fs.readFileSync(path.join(dir, 'rule-words.js'), 'utf8');
  check(!/[^\x00-\x7f]/.test(fileText.replace(/^\/\/.*$/gm, '')), 'the copied data is ASCII with \\u escapes: a combining mark is never a character you cannot see in a diff');
  check(!/[؀-ۿ]/.test(waslSource) && !/[ً-ْٰۡ]/.test(waslSource), 'wasl.js holds no Arabic and no combining mark: every word is a reference (docs/pass-2/02 §3)');
  check(/KIT_FILES = \[[^\]]*'wasl\.js'/.test(fs.readFileSync(path.join(dir, '..', '..', 'tools', 'fetch-qaida-words.js'), 'utf8')), 'the fetch tool reads its references from wasl.js');

  // A pair is its two words and ONE space, exactly as Quran.com sends them; a single word has none.
  const spaced = (ref) => ref.includes('-');
  check([...named].every((ref) => ['madani', 'indopak'].every((s) => (data[ref][s].split(' ').length === (spaced(ref) ? 2 : 1)) && !data[ref][s].startsWith(' ') && !data[ref][s].endsWith(' '))),
    'a reference with a range is two words and one space between them; every other is one word, in both scripts');

  // What is in each word: only what the student has met, in both scripts.
  let badChars = 0;
  let notLetters = 0;
  for (const ref of named) {
    for (const script of ['madani', 'indopak']) {
      const text = data[ref][script];
      if (!cps(text).every(okChar)) badChars += 1;
      if (kit.lettersOf(text).some((u) => !cps(u).some((c) => isLetter(c) || c === 0x0640 || c === SPACE))) notLetters += 1;
    }
  }
  check(badChars === 0, 'every word and pair, in both scripts, holds only letters, tatweel, a space and the marks Lessons 4-17 taught (no madd, no stop sign, no silent-letter circle, no direction mark)', String(badChars));
  check(notLetters === 0, 'and splitting one into letters with their marks leaves no lone mark');

  // The marks say what the lesson says (docs/lesson-19/01 §4), in both scripts, for every form.
  const baseOf = (u) => cps(u).find((c) => isLetter(c) || c === 0x0640 || c === SPACE);
  const marksOf = (u) => cps(u).filter((c) => !(isLetter(c) || c === 0x0640 || c === SPACE));
  const alifFor = (script) => (script === 'madani' ? ALIF_WASLA : ALIF);
  const problems = [];
  for (const f of forms) {
    for (const script of ['madani', 'indopak']) {
      const units = kit.lettersOf(data[f.ref][script]);
      const space = units.findIndex((u) => u === ' ');
      const alifAt = space >= 0 ? space + 1 : f.alifAt || 0;
      const before = space >= 0 ? space - 1 : alifAt - 1;
      const why = (message) => problems.push(`${f.ref} ${script}: ${message}`);
      if (f.kind === 'start' || f.kind === 'read') {
        if (baseOf(units[0]) !== alifFor(script)) why('a word you start on begins with the alif');
      } else if (f.kind === 'joined' || f.kind === 'short') {
        if (baseOf(units[alifAt]) !== alifFor(script)) why('the second word begins with a joining alif');
      }
      if (f.kind === 'start') {
        // Indo-Pak prints the vowel on the alif at a verse's start, and the lesson's declared vowel must be that one.
        if (script === 'indopak' && !marksOf(units[0]).includes(VOWEL_CODE[f.vowel])) why('the declared start vowel is not the one on the Indo-Pak alif');
        if (script === 'madani' && marksOf(units[0]).length) why('a Madani wasla carries no vowel');
        if (f.vowel === 'fatha' && !(baseOf(units[1]) === LAAM)) why('a zabar word is an Al- word');
        if (f.vowel !== 'fatha') {
          // A verb: the third letter decides. Paish if it carries paish, zair otherwise.
          const third = marksOf(units[f.decide]);
          if (f.decide !== 2 || third.includes(DAMMA) !== (f.vowel === 'damma')) why('the third letter does not decide the vowel as the lesson says');
        }
      }
      if (f.kind === 'joined') {
        // The sound runs on from a SHORT vowel: the letter before the alif carries a zabar, zair or paish.
        const carried = marksOf(units[before]);
        if (!carried.some((c) => [FATHA, KASRA, DAMMA].includes(c))) why('the letter before the alif carries a short vowel');
        if (carried.includes(JAZAM_M) || carried.includes(JAZAM_I)) why('and no jazam');
        if (space < 0 && baseOf(units[before]) === undefined) why('a prefixed word has a letter before its alif');
        if (space < 0 && baseOf(units[alifAt + 1]) !== LAAM) why('the prefixed word\'s alif is the alif of Al-');
      }
      if (f.kind === 'short') {
        const last = units[before];
        if (![YAA_END, YAA].includes(baseOf(last))) why('the long vowel is a yaa, written with the end yaa');
        if (marksOf(last).some((c) => [JAZAM_M, JAZAM_I, SMALL_ALIF].includes(c))) why('a long vowel read short has no jazam and no small alif on it, in either script');
      }
      if (f.kind === 'keep') {
        const last = units[before];
        if (![YAA_END, YAA].includes(baseOf(last))) why('the long vowel is a yaa');
        if (baseOf(units[alifAt]) === ALIF_WASLA || baseOf(units[alifAt]) === ALIF) why('an ordinary word follows: it does not begin with an alif');
      }
    }
    if (f.kind === 'keep') {
      // The long vowel is MARKED long in at least one script: a small alif on the Madani yaa, or a jazam on the Indo-Pak yaa.
      const m = kit.lettersOf(data[f.ref].madani); const i = kit.lettersOf(data[f.ref].indopak);
      const sm = m.findIndex((u) => u === ' ') - 1; const si = i.findIndex((u) => u === ' ') - 1;
      if (!(marksOf(m[sm]).includes(SMALL_ALIF) || marksOf(i[si]).includes(JAZAM_I))) problems.push(`${f.ref}: a long vowel read long is marked long in one script`);
    }
  }
  check(problems.length === 0, 'the marks say what the lesson says, in both scripts: the alif, the letter before it, the Indo-Pak start vowel, the third letter of a verb, a long vowel with no mark when it is read short and a mark when it is read long', problems.slice(0, 4).join(' | '));
  // Madani drops the small alif of a long "aa" before the joining alif: the same word is printed two ways, and the data says which is which.
  const aaShort = forms.filter((f) => f.kind === 'short' && baseOf(kit.lettersOf(data[f.ref].madani)[kit.lettersOf(data[f.ref].madani).findIndex((u) => u === ' ') - 1]) === YAA_END
    && marksOf(kit.lettersOf(data[f.ref].madani)[kit.lettersOf(data[f.ref].madani).findIndex((u) => u === ' ') - 2]).includes(FATHA));
  check(aaShort.length >= 2, 'at least two of the shortened vowels are an "aa" (a zabar then the end yaa), and Madani carries no small alif on any of them', String(aaShort.length));
  check(forms.filter((f) => f.kind === 'start' && f.vowel === 'fatha').length === 2 && forms.filter((f) => f.vowel === 'kasra').length === 2 && forms.filter((f) => f.vowel === 'damma').length === 2, 'two words start with each of the three vowels');

  // The lists: numbers and no overlap.
  check(rules.RULES.wasl.id === 'wasl' && rules.RULES.wasl.lesson === 19 && rules.RULES.wasl.parts === 4, 'a fourth rule, "wasl", lesson 19, four parts');
  check(forms.length === 24 && kit.START.length === 6 && kit.READ.length === 4 && kit.JOINED.length === 6 && kit.SHORT.length === 4 && kit.KEEP.length === 4, 'twenty-four forms: six to start on, four read on their own, six joined, four shortened, four kept long');
  const refs = forms.map((f) => f.ref);
  check(new Set(refs).size === 24, 'no word or pair is in two lists');
  check(kit.READING.length === 12 && new Set(kit.READING).size === 12 && kit.READING.every((ref) => !refs.includes(ref) && data[ref]), 'the reading page\'s twelve are twelve other pairs than the drill\'s');
  check(kit.WALK.length === 3 && kit.WALK.map((w) => w.kind).join() === 'joined,short,start' && kit.WALK.every((w) => w.sounds.length === 2 && w.whole && w.meaning && data[w.ref] && !refs.includes(w.ref) && !kit.READING.includes(w.ref)),
    'the walkthrough is three others: a joined pair, a pair with a long vowel shortened and a word to start on, each with two sounds, a whole and a meaning');

  // Parts.
  const items = kit.itemsFor(shell);
  check(JSON.stringify(marks.sizes(items, [1, 2, 3, 4])) === '[6,10,8,24]', 'the four parts hold 6, 10, 8 and 24', JSON.stringify(marks.sizes(items, [1, 2, 3, 4])));
  check(forms.filter((f) => f.kind === 'start').every((f) => f.parts.join() === '1,4') && forms.filter((f) => f.kind === 'read' || f.kind === 'joined').every((f) => f.parts.join() === '2,4') && forms.filter((f) => f.kind === 'short' || f.kind === 'keep').every((f) => f.parts.join() === '3,4'),
    'starts are met in parts 1 and 4, joined words and words read on their own in 2 and 4, the long vowels in 3 and 4');

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
  check(glyphsM.filter((g, i) => g !== glyphsI[i]).length >= 20, 'and the two scripts differ in nearly every one (the jazam, at least)', String(glyphsM.filter((g, i) => g !== glyphsI[i]).length));

  // The lit parts, put back together, are the whole word or pair: nothing lost, nothing added, in both scripts.
  const whole = [...forms, ...kit.WALK].every((f) => ['madani', 'indopak'].every((script) => kit.unitsOf(f.ref, script, f.kind).map((u) => u.text).join('') === data[f.ref][script]));
  check(whole, 'the units of every word and pair, joined, are the copied text exactly, in both scripts');
  const roleAt = (f, script = 'madani') => kit.unitsOf(f.ref, script, f.kind).map((u) => u.role);
  const spaceAt = (f) => kit.lettersOf(data[f.ref].madani).findIndex((u) => u === ' ');
  const only = (list, at) => list.every((r, i) => (at[i] ? r === at[i] : r === ''));
  check(forms.filter((f) => f.kind === 'start' && f.vowel === 'fatha').every((f) => only(roleAt(f), { 0: 'read' })), 'an Al- word you start on lights one place: its alif ("read")');
  check(forms.filter((f) => f.kind === 'start' && f.vowel !== 'fatha').every((f) => only(roleAt(f), { 0: 'read', 2: 'carry' })), 'a verb you start on lights two: its alif ("read") and the third letter, which decides the vowel ("carry")');
  check(forms.filter((f) => f.kind === 'read').every((f) => only(roleAt(f), { 0: 'read' })), 'a word read on its own lights its alif ("read")');
  check(forms.filter((f) => f.kind === 'joined' && !f.alifAt).every((f) => only(roleAt(f), { [spaceAt(f) - 1]: 'carry', [spaceAt(f) + 1]: 'silent' })), 'a joined pair lights two: the letter the sound runs on from ("carry") and the alif that is not read ("silent")');
  check(forms.filter((f) => f.alifAt).length === 1 && forms.find((f) => f.alifAt).kind === 'joined' && only(roleAt(forms.find((f) => f.alifAt)), { 0: 'carry', 1: 'silent' }), 'and one printed word with a letter in front of its alif lights the same two, by position');
  check(forms.filter((f) => f.kind === 'short').every((f) => only(roleAt(f), { [spaceAt(f) - 1]: 'short', [spaceAt(f) + 1]: 'silent' })), 'a long vowel read short lights it ("short") and the dimmed alif after it ("silent")');
  check(forms.filter((f) => f.kind === 'keep').every((f) => only(roleAt(f), { [spaceAt(f) - 1]: 'long' })), 'a long vowel read long lights it alone ("long")');
  check(kit.unitsOf(forms[0].ref, 'madani', 'start').every((u) => u.step === (u.text === kit.lettersOf(data[forms[0].ref].madani)[0] ? 0 : 1)) && kit.unitsOf(kit.WALK[0].ref, 'madani', 'joined').filter((u) => u.step === 0).map((u) => u.text).join('') === `${data[kit.WALK[0].ref].madani.split(' ')[0]} `,
    'each unit says which piece of the walkthrough it belongs to: a word\'s alif and the rest, or a pair\'s first word and its second');

  // Names: one template each, the vowel a start takes is the student's own word for it.
  const names = items.map((i) => i.name);
  check(JSON.stringify(names.slice(0, 6)) === JSON.stringify(['Start with fatha', 'Start with fatha', 'Start with kasra', 'Start with kasra', 'Start with damma', 'Start with damma'])
    && names.slice(6, 10).every((n) => n === 'The alif is read') && names.slice(10, 16).every((n) => n === 'The alif is not read') && names.slice(16, 20).every((n) => n === 'The long vowel is read short') && names.slice(20).every((n) => n === 'The long vowel is read long'),
    'seven names across the twenty-four, in the fatha set', [...new Set(names)].join(' | '));
  const zn = boot({ v: 1, chosen: true, script: 'madani', names: 'zabar', grouping: 'families' });
  const zabarNames = zn.kit.itemsFor(zn.shell).map((i) => i.name);
  check(zabarNames.slice(0, 6).join() === 'Start with zabar,Start with zabar,Start with zair,Start with zair,Start with paish,Start with paish' && zabarNames.slice(6).join() === names.slice(6).join(),
    'in the zabar set a start is "Start with zabar", "zair", "paish", and every other name is the same', zabarNames.slice(0, 6).join());
  const custom = kit.itemsFor(shell, { templates: { start: 'Begin {mark}', read: 'R', joined: 'J', short: 'S', keep: 'K' } });
  check(custom[0].name === 'Begin fatha' && custom[6].name === 'R' && custom[10].name === 'J' && custom[16].name === 'S' && custom[23].name === 'K', 'the templates are the only source of a name (a teacher\'s edit reaches every word)');
  kit.rename(items, shell, { start: 'A {mark}', read: 'B', joined: 'C', short: 'D', keep: 'E' });
  check(items[0].name === 'A fatha' && items[6].name === 'B' && items[10].name === 'C' && items[16].name === 'D' && items[23].name === 'E' && items[2].markName === 'kasra', 'rename() rewrites every name in place');
  const fresh = kit.itemsFor(shell);
  check(fresh.every((i) => i.askGroup === { start: 'start', read: 'alif', joined: 'alif', short: 'long', keep: 'long' }[i.kind]) && fresh.every((i) => i.marked === true && i.required === false && i.traceable === true && Array.isArray(i.family) && i.family.length === 0),
    'every item names the question it answers (start, alif or long), is marked, not required until a part makes it so, and has no look-alike');

  // Audio: none recorded, and none asked for by the recordings page.
  check(items.every((i) => i.audio.kind === 'words' && i.audio.glyph === i.id), 'a word\'s sound would be kept under the group "words", by its reference');

  // The board and the echo.
  const boards = kit.boards();
  check(boards.map((b) => b.id).join() === 'start,joined,short,keep' && boards.map((b) => b.cells.length).join() === '10,6,4,4', 'the board is four lists: on its own (6 and the 4 read on their own), joined (6), shortened (4), kept long (4)');
  check(forms.filter((f) => f.pair).length === 14 && forms.filter((f) => !f.pair).length === 10 && forms.filter((f) => f.pair).every((f) => ['joined', 'short', 'keep'].includes(f.kind)), 'fourteen tiles are wide (a pair, or a word with a letter before its alif) and ten are one word');
  check(JSON.stringify(kit.samples().map((s) => s.caption)) === '["startFatha","startKasra","startDamma"]' && kit.samples().every((s) => data[s.ref] && s.kind === 'start'), 'the strip shows three words on their own, one for each vowel, each with its own caption');
  const lineOf = (i) => kit.echoOf(i).line;
  check(lineOf(fresh[0]) === 'lineStartFatha' && lineOf(fresh[2]) === 'lineStartKasra' && lineOf(fresh[4]) === 'lineStartDamma' && lineOf(fresh[6]) === 'lineRead' && lineOf(fresh[10]) === 'lineJoined' && lineOf(fresh[16]) === 'lineShort' && lineOf(fresh[20]) === 'lineKeep'
    && fresh.every((i) => kit.echoOf(i).units.length === kit.lettersOf(data[i.id].madani).length), 'under a wrong answer: the same word again, lit, with the line for its kind (and for a start, its vowel)');
  check(kit.firstRow(1) === 'start' && kit.firstRow(2) === 'joined' && kit.firstRow(3) === 'short' && kit.firstRow(4) === 'start'
    && kit.rowInPart('start', 1) && !kit.rowInPart('joined', 1) && kit.rowInPart('start', 2) && kit.rowInPart('joined', 2) && !kit.rowInPart('short', 2) && kit.rowInPart('short', 3) && kit.rowInPart('keep', 3) && !kit.rowInPart('start', 3),
    'the same-line row starts on the first row of each part, and a row is only in the parts its words are');
  check(kit.sampleOf(1, 'madani') === cc(ALIF_WASLA, LAAM, JAZAM_M) && kit.sampleOf(1, 'indopak').startsWith(cc(ALIF, FATHA)) && kit.sampleOf(2, 'madani').includes(' ') && kit.sampleOf(3, 'madani').includes(cc(YAA_END)) && kit.sampleOf(4, 'madani') === cc(ALIF_WASLA) && kit.sampleOf(4, 'indopak') === cc(ALIF, KASRA),
    'the rail\'s samples are the front of a real word: Al- with its jazam, a vowel then the alif, a long vowel then the alif, and the alif alone', [1, 2, 3, 4].map((n) => kit.sampleOf(n, 'madani').length).join());
  check(kit.titleGlyph() === cc(ALIF_WASLA) && (() => { indopak.shell.state.script = 'indopak'; return indopak.kit.titleGlyph() === cc(ALIF); })(), 'the big glyph is an alif: the wasla in Madani, a plain alif in Indo-Pak');

  // No literal combining mark in any file of the lesson.
  const MARK_RE = new RegExp('[\\u064B-\\u0652\\u0670\\u0657\\u0660-\\u0669\\u06E1\\u06E5\\u06E6]');
  check(MARK_RE.test(cc(0x064E)) && MARK_RE.test(cc(0x0670)) && MARK_RE.test(cc(0x06E1)) && !MARK_RE.test(cc(LAAM)), 'the literal-mark pattern can fail (it catches a zabar, a small alif and U+06E1, and not a letter)');
  for (const file of ['wasl.js', 'rules.js', 'rule-lesson.js', 'practice.js', 'spell.js', 'exercise.js', 'lesson-19.html', 'exercise-19.html', 'rule-words.js']) {
    check(!MARK_RE.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')), `${file} holds no literal combining mark or small letter`);
  }
}

console.log('\nThe other rules still stand');
{
  const w = boot(undefined, ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'ends.js', 'rule-words.js', 'wasl.js']);
  check(Object.keys(w.rules.RULES).join() === 'hamza,ends,wasl' && Object.keys(w.rules.KITS).join() === 'hamza,ends,wasl', 'the registry holds the hamza\'s kit, the ends\' and this one, each with its own board');
  check(w.rules.KITS.hamza.board === 'grid' && w.rules.KITS.ends.board === 'ends' && w.kit.board === 'words', 'three boards: a grid, two shape grids and a list of words');
  check(w.rules.KITS.hamza.formsOf().length === 15 && w.rules.KITS.ends.formsOf().length === 14, 'Lesson 16\'s fifteen forms and Lesson 17\'s fourteen are untouched');
  const both = boot(undefined, ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'al.js', 'wasl.js']);
  check(both.rules.KITS.al.formsOf().length === 12 && both.rules.KITS.wasl.formsOf().length === 24 && both.rules.KITS.al.itemsFor(both.shell).every((i) => i.askGroup === undefined),
    'Lesson 18\'s twelve words are untouched, and carry no `askGroup`: its drill is dealt exactly as before');
}

console.log('\nMastery');
{
  const w = boot();
  const items = w.kit.itemsFor(w.shell);
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(19, items[0].id, true);
  check(w.shell.masteredCount(19) === 1, 'masteredCount(19) counts one mastered word', String(w.shell.masteredCount(19)));
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(19, items[23].id, true);
  check(w.shell.masteredCount(19) === 2, 'and two, when two are mastered', String(w.shell.masteredCount(19)));
  check([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].every((n) => w.shell.masteredCount(n) === 0), 'none of it counts toward another lesson');
  const switched = boot();
  const inMadani = switched.kit.itemsFor(switched.shell)[12];
  for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(19, inMadani.id, true);
  switched.shell.state.script = 'indopak';
  const inIndoPak = switched.kit.itemsFor(switched.shell)[12];
  check(inIndoPak.id === inMadani.id && inIndoPak.glyph !== inMadani.glyph && switched.rules.stats(switched.shell, 19, [inIndoPak], 2, { target: 3 }).known === 1,
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
  for (const file of ['shell.js', 'marks.js', 'rules.js', 'rule-words.js', 'wasl.js', 'audio.js']) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  const rows = audioCtx.qaidaAudio.wanted();
  check(rows.length === 447, 'the recordings page still lists 447 rows: Lesson 19 adds none (its words are recorded one at a time, under their references, in a later step)', String(rows.length));
  const items = audioCtx.qaidaRules.KITS.wasl.itemsFor(audioCtx.qaidaShell);
  check(items.every((i) => audioCtx.qaidaAudio.has(i.audio.kind, i.audio.glyph) === false), 'and no word has a recording yet, so hearing practice stays shut for them');
}

console.log('\nThe engine: questions on every part');
{
  const w = boot();
  const items = w.kit.itemsFor(w.shell);
  const group = (item) => item.askGroup;
  const expect = { 1: { total: 6, names: 3, groups: ['start'], count: [3] }, 2: { total: 10, names: 2, groups: ['alif'], count: [2] }, 3: { total: 8, names: 2, groups: ['long'], count: [2] }, 4: { total: 24, names: 7, groups: ['start', 'alif', 'long'], count: [3, 2, 2] } };
  let asked = 0;
  let strayAnswer = 0;
  let sameAnswer = 0;
  let sameName = 0;
  let notOwn = 0;
  let starved = 0;
  let wrongCount = 0;
  let reversed = 0;
  let rightMissing = 0;
  for (const n of [1, 2, 3, 4]) {
    // What the page hands the drill: the part's own forms, all required. Nothing rides along: each part holds both answers of its question.
    const pool = w.rules.poolFor(items, n);
    const e = expect[n];
    check(pool.length === e.total && pool.every((i) => i.required) && new Set(pool.map((i) => i.name)).size === e.names && new Set(pool.map(group)).size === e.groups.length,
      `part ${n}: ${pool.length} forms, all required, ${e.names} distinct names across ${e.groups.length} question${e.groups.length > 1 ? 's' : ''}`, `${pool.length} / ${new Set(pool.map((i) => i.name)).size}`);
    check(e.groups.every((g) => new Set(pool.filter((i) => group(i) === g).map((i) => i.name)).size >= 2), `part ${n}: every question in it has at least two answers to offer, so each can be asked`);
    const drill = w.practice.create({
      lesson: 19, items: pool, formats: [FORM_TO_NAME], random: seeded(53 + n), familyFirst: false,
      noRepeatWithin: Math.max(1, Math.min(8, pool.length - 2)),
    });
    drill.start();
    check(drill.progress().total === e.total, `part ${n}: the drill counts ${e.total} toward ready`, String(drill.progress().total));
    const seenGroups = new Set();
    for (let i = 0; i < 120; i += 1) {
      const q = drill.question;
      if (!q) { starved += 1; break; }
      asked += 1;
      seenGroups.add(group(q.item));
      const ids = q.choices.map((c) => c.id);
      const names = q.choices.map((c) => c.name);
      if (new Set(ids).size !== ids.length) sameAnswer += 1;
      if (new Set(names).size !== names.length) sameName += 1;
      // THE POINT of askGroup: an answer to one question is never offered to another.
      if (q.choices.some((c) => group(c) !== group(q.item))) strayAnswer += 1;
      if (q.choices.length !== e.count[e.groups.indexOf(group(q.item))]) wrongCount += 1;
      if (q.format.ask !== 'glyph' || q.format.answerWith !== 'name') reversed += 1;
      if (!ids.includes(q.item.id)) rightMissing += 1;
      if (!pool.some((p) => p.id === q.item.id)) notOwn += 1;
      drill.answer(q.item.id);
      drill.next();
    }
    check(e.groups.every((g) => seenGroups.has(g)), `part ${n}: ${e.groups.join(', ')} ${e.groups.length > 1 ? 'all come up' : 'comes up'} over a run of 120`, [...seenGroups].join());
  }
  check(asked === 480 && starved === 0, '480 questions through the real engine, on all four parts', `${asked} asked, ${starved} starved`);
  check(strayAnswer === 0, 'no answer to one question is ever offered to another: "how do you start it?" never offers "the alif is read"', String(strayAnswer));
  check(sameAnswer === 0 && sameName === 0, 'never the same answer twice, and never two choices with one name', `${sameAnswer} / ${sameName}`);
  check(wrongCount === 0, 'three choices for how a word is started (zabar, zair, paish), two for every other question', String(wrongCount));
  check(reversed === 0, 'no question is NAME_TO_FORM or SOUND_TO_FORM: a name is not a picture');
  check(rightMissing === 0 && notOwn === 0, 'the right answer is always among the choices, and always one of the part\'s own forms');
  // Without the tag, part 4 mixes questions: the reason it exists.
  const untagged = w.rules.poolFor(items, 4).map((i) => ({ ...i, askGroup: undefined }));
  const mixed = w.practice.create({ lesson: 19, items: untagged, formats: [FORM_TO_NAME], random: seeded(7), familyFirst: false, noRepeatWithin: 8 });
  mixed.start();
  let strays = 0;
  for (let i = 0; i < 60; i += 1) {
    const q = mixed.question;
    if (q.choices.some((c) => items.find((it) => it.id === c.id).askGroup !== items.find((it) => it.id === q.item.id).askGroup)) strays += 1;
    mixed.answer(q.item.id);
    mixed.next();
  }
  check(strays > 20, 'and without the tag the same part does mix them (the bug the tag fixes)', String(strays));
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

const nodeLoad = ['shell.js', 'audio.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'wasl.js', 'rule-lesson.js', 'spell.js'];
const NOMARK = new RegExp('[\\u064B-\\u0652\\u0670\\u0657\\u06D6-\\u06ED]'); // a literal combining mark or small Quranic letter

async function pageHalf() {
  let w;
  try {
    w = run('lesson-19.html', nodeLoad, { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against lesson-19.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  check(true, 'shell.js, audio.js, practice.js, marks.js, rules.js, rule-words.js, wasl.js, rule-lesson.js and spell.js load against lesson-19.html without an error');
  await sleep(20);
  const { $, all, click, shell, marks, rules, htmlEl } = w;
  const kit = rules.KITS.wasl;
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
  const litCount = (kind, vowel) => (kind === 'start' ? (vowel === 'fatha' ? 1 : 2) : kind === 'read' ? 1 : kind === 'keep' ? 1 : 2);
  const vowelOf = (item) => (kit.formsOf().find((f) => f.ref === item.id) || {}).vowel;
  const ECHO = {
    fatha: 'A word with Al- starts with fatha:', kasra: 'The third letter has no damma, so it starts with kasra:', damma: 'The third letter has a damma, so it starts with damma:',
    read: 'On its own you start on the alif, so it is read:', joined: 'Joined to the word before it, the alif is not read:',
    short: 'The alif after it is skipped, so the long vowel is read short:', keep: 'The next word does not start with a joining alif, so the long vowel stays long:',
  };
  const ASK = { start: 'How do you start this word?', alif: 'Is the alif read here?', long: 'Is the long vowel read long here?' };

  console.log('\nThe page');
  check(qaida.kind === 'drill' && qaida.rule === 'wasl' && qaida.hasOther === false && qaida.otherCount === 0 && qaida.hasTail === false && qaida.markCount === 1 && qaida.review === 0,
    'publishes window.qaida with kind "drill" and rule "wasl", and nothing to be told apart from, no tails, no review');
  check(htmlEl.attrs['data-rule'] === 'wasl' && htmlEl.attrs['data-point'] === 'none' && htmlEl.attrs['data-mark'] === undefined, 'the page teaches the wasl rule, with no halo and no mark');
  check(JSON.stringify(qaida.groupCosts().map((p) => p.items)) === '[6,10,8,24]', 'groupCosts() is 6, 10, 8 then 24', JSON.stringify(qaida.groupCosts().map((p) => p.items)));
  check(rail().length === 4 && rail().every((b) => b.attrs.disabled === undefined), 'four parts, all enabled: nothing is locked');
  check(qaida.parts.map((p) => p.name).join('|') === 'Starting a word|Joining|A long vowel before it|All together', 'the four parts are named by question', qaida.parts.map((p) => p.name).join('|'));

  // The members the options panel reads: a missing one throws in the panel and takes the page down.
  const panel = fs.readFileSync(path.join(dir, 'qaida-options.js'), 'utf8');
  const drillBranch = panel.slice(panel.indexOf("lesson.kind === 'drill'"), panel.indexOf("lesson.kind === 'exercise'"));
  const read = [...new Set([...drillBranch.matchAll(/\blesson\.(\w+)/g)].map((m) => m[1]))];
  const lesson3Only = ['setBand', 'bandTotals', 'setDrilled'];
  const assigned = ['onCosts'];
  const missing = read.filter((name) => !lesson3Only.includes(name) && !assigned.includes(name) && !(name in qaida));
  check(read.length > 20 && missing.length === 0, `every window.qaida member the panel reads exists (${read.length} read)`, missing.join(', '));

  console.log('\nThe head');
  check($('h1').textContent === 'The joining alif' && w.doc.title.startsWith('Lesson 19: The joining alif'), 'the title is in both name sets', $('h1').textContent + ' / ' + w.doc.title);
  check($('.title-mark').textContent === cc(ALIF_WASLA), 'the big glyph is an alif (the wasla, in Madani)', cps($('.title-mark').textContent).join());
  const glyphs = all('.band-glyph').map((g) => g.textContent);
  check(glyphs.join() === [1, 2, 3, 4].map((n) => kit.sampleOf(n)).join(), 'the rail shows the front of a word to start on, a joined pair, a shortened pair and the alif', glyphs.length);
  check($('.eyebrow').textContent === 'Lesson 19 of 29' && all('.track li').length === 29 && all('.track li').findIndex((li) => li.classes().includes('now')) === 18,
    'Lesson 19 of 29, the nineteenth of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '24', 'the bar\'s total is the twenty-four', $('.bar').attrs['aria-valuemax']);
  check(!$('.pairs') && !$('.pair-feature') && !$('.halo') && !$('.jazam-note') && !$('.mark-alone') && !$('.joined') && !$('.sun-letters'), 'none of a mark lesson\'s board is on this page, and none of Lesson 18\'s sun letters');

  console.log('\nThe board: three words and four lists');
  const strip = $('.seat-strip').querySelectorAll('.word-cell');
  check(strip.length === 3 && strip.every((t) => t.tag === 'button' && t.attrs['data-audio'] === undefined), 'the strip has three word tiles, and they say nothing when tapped: no recording exists yet');
  check($('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|') === 'Al-: starts with fatha|starts with kasra|third letter has damma: starts with damma', 'each is captioned with the vowel it starts with', $('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|'));
  const stripUnits = strip.map(unitsOfTile);
  check(stripUnits.map((u) => u.filter((x) => x.role).length).join() === '1,2,2', 'the Al- word lights its alif; each verb lights its alif and the third letter');
  check(/alif that is read only when you start on the word/.test($('.seat-note').textContent) && /hamzat al-wasl/.test($('.seat-note').textContent) && /Al- starts with fatha/.test($('.seat-note').textContent) && !/\b29\b/.test($('.seat-note').textContent) && !/[{}]/.test($('.seat-note').textContent),
    'the line under them says what the joining alif is, with the class\'s word once, in the student\'s own words for the vowels, with no "29" and no token left in it', $('.seat-note').textContent);
  check($('.rule-grid').querySelectorAll('.rule-grid-title').map((t) => t.textContent).join('|') === 'On its own|Joined to the word before|A long vowel before the alif|A long vowel before another word', 'each list has a heading');
  check(wordRows().length === 4 && wordRows().map((r) => r.attrs['data-mark']).join() === 'start,joined,short,keep' && wordRows().map((r) => r.querySelectorAll('.word-cell').length).join() === '10,6,4,4', 'four lists of 10, 6, 4 and 4');
  check(gridTiles().length === 24 && tiles().length === 27, 'twenty-four on the board, and the three on their own above them');
  check(gridTiles().filter((t) => t.classes().includes('word-pair')).length === 14 && gridTiles().every((t, i) => t.classes().includes('word-pair') === Boolean(forms[i].pair)), 'the pairs have the wide tile, the single words the narrow one');
  check(wordRows().map((r) => r.querySelector('.rule-name').textContent).join('|') === 'a word you start on|the alif is not read|the long vowel is read short|the long vowel is read long', 'the row names', wordRows().map((r) => r.querySelector('.rule-name').textContent).join('|'));
  check(wordRows().map((r) => r.querySelector('.rule-sound').textContent).join('|') === 'the alif is read|the sound runs on from the vowel before|the alif after it is skipped|no joining alif follows' && !/[{}]/.test($('.rule-grid').textContent), 'each row says what it shows, with no token left in it');
  const later = () => gridTiles().filter((t) => t.attrs['data-state'] === 'later').length;
  check(later() === 18, 'part 1: the words read on their own, and every pair, are dim, "comes later"; the map is all there', String(later()));
  qaida.setGroup(2);
  check(later() === 8 && gridTiles().length === 24, 'part 2: only the long-vowel pairs are dim, and the board has not changed shape', String(later()));
  qaida.setGroup(3);
  check(later() === 0, 'part 3: none dim', String(later()));
  qaida.setGroup(1);
  check(gridTiles().every((t) => t.tag === 'button'), 'a dim word is a button all the same: nothing is locked');
  check(gridTiles().every((t) => /^(Start with (fatha|kasra|damma)|The alif is (not )?read|The long vowel is read (short|long))\. Verse \d+:\d+\.$/.test(t.attrs['aria-label'])), 'every word is named for a screen reader: what it says, and its verse', gridTiles()[0].attrs['aria-label']);
  check(gridTiles().every((t) => t.querySelector('.glyph').attrs['aria-hidden'] === 'true' && t.querySelector('.word-ref').attrs['aria-hidden'] === 'true'), 'and the word and its verse mark are hidden from a screen reader: the button carries the name');
  check(gridTiles().map((t) => t.querySelector('.word-ref').textContent).every((r, i) => r === forms[i].ref.split(':').slice(0, 2).join(':')), 'each one shows where in the Qur\'an it was copied from (surah:verse), a pair by its first word\'s verse');
  check(gridTiles().every((t, i) => unitsOfTile(t).map((u) => u.text).join('') === data[forms[i].ref].madani), 'every one on the board is the copied text, character for character (in Madani)');

  console.log('\nThe board: the same-sound line and the script lines');
  check(/^On its own, you start on the alif, so it is read\. Al- starts with fatha; a verb whose third letter has damma starts with damma; any other starts with kasra\.$/.test($('.same-line').textContent), 'part 1 starts on the first row, and names the three vowels in the student\'s own words', $('.same-line').textContent);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'joined'));
  check(/^Joined to the word before it, the alif is not read\./.test($('.same-line').textContent), 'tapping a joined pair says its alif is not read, and the sound runs on', $('.same-line').textContent);
  check($('.word-row[data-current]').attrs['data-mark'] === 'joined' && all('.word-row').filter((r) => 'data-current' in r.attrs).length === 1, 'and the row it is about is the one lit');
  qaida.setGroup(3);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'short'));
  check(/^A long vowel just before a joining alif is read short/.test($('.same-line').textContent), 'tapping a shortened vowel says it is read short', $('.same-line').textContent);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'keep'));
  check(/^Before an ordinary word the long vowel stays long/.test($('.same-line').textContent), 'and a kept one says it stays long', $('.same-line').textContent);
  qaida.setGroup(1);
  check(/^On its own, you start on the alif/.test($('.same-line').textContent), 'back to part 1, the line is about the first row again: the row it was on (kept long) is not in part 1', $('.same-line').textContent);
  check(/small mark on it, everywhere/.test($('.script-line').textContent) && !/bare alif/.test($('.script-line').textContent), 'the Madani student sees the Madani line, and only that', $('.script-line').textContent);
  check($('.lead-line').hidden === true, 'and no line about a font');
  await w.setScript('indopak');
  check(/bare alif in the middle of a verse/.test($('.script-line').textContent) && /lost its (sukoon|jazam)/.test($('.script-line').textContent) && !/small mark/.test($('.script-line').textContent), 'the Indo-Pak student sees the Indo-Pak line, in the student\'s own word for the jazam (fatha names here)', $('.script-line').textContent);
  check($('.lead-line').hidden === false && /Indo-Pak print/.test($('.lead-line').textContent) && /stand-in/.test($('.lead-line').textContent), 'and is told once that the Qur\'an\'s own Indo-Pak print is drawn in a stand-in until its font is added', $('.lead-line').textContent);
  await w.setScript('madani');

  console.log('\nThe two scripts');
  const glyphOfWord = (ref) => gridTiles().find((t) => t.attrs['data-id'] === ref).querySelector('.glyph').textContent;
  await w.setScript('indopak');
  check(forms.every((f) => glyphOfWord(f.ref) === data[f.ref].indopak), 'Indo-Pak: every one on the board is the copied Indo-Pak text, character for character');
  check($('.title-mark').textContent === cc(ALIF) && all('.band-glyph')[0].textContent.startsWith(cc(ALIF)), 'the title glyph and the rail follow the script (a plain alif, not the wasla)');
  check(kit.samples().every((s, i) => unitsOfTile($('.seat-strip').querySelectorAll('.word-cell')[i]).map((u) => u.text).join('') === data[s.ref].indopak), 'and so do the three on their own');
  await w.setScript('madani');
  check(forms.every((f) => glyphOfWord(f.ref) === data[f.ref].madani), 'Madani: every one is the copied Madani text, character for character');

  console.log('\nThe drill');
  check($('.ask').textContent === ASK.start, 'part 1 asks "How do you start this word?"', $('.ask').textContent);
  let q = itemShown();
  check(Boolean(q) && choices().length === 3 && choices().every((c) => c.attrs['data-face'] === 'name') && choices().map((c) => c.textContent).sort().join('|') === 'Start with damma|Start with fatha|Start with kasra',
    'part 1: three choices, one for each vowel, in the student\'s own words', choices().map((c) => c.textContent).join(' | '));
  check($('.prompt-glyph').textContent === data[q.id].madani && $('.prompt-glyph').attrs['aria-hidden'] === 'true', 'the question shows the copied word, hidden from a screen reader');
  // Part 1 asks only how a word is started: every question has the same three choices.
  const kindsIn1 = new Set();
  for (let i = 0; i < 18; i += 1) {
    const shown = itemShown();
    kindsIn1.add(shown.kind);
    if (choices().length !== 3 || $('.ask').textContent !== ASK.start) check(false, `part 1 question ${i + 1}: three choices and the start question`, `${choices().length} / ${$('.ask').textContent}`);
    click(answerFor());
    click($('.next-question'));
    await sleep(5);
  }
  check([...kindsIn1].join() === 'start', 'all through a run of 18 questions in part 1, every question is about a word to start on, with three choices', [...kindsIn1].join());
  qaida.clear();
  await sleep(20);
  q = itemShown();
  click(answerFor());
  check(/^Yes — Start with (fatha|kasra|damma)\.$/.test($('.verdict').textContent), 'right: "Yes — Start with fatha." (the word\'s own name)', $('.verdict').textContent);
  check($('.seat-echo').hidden === true, 'and no line under a right answer');
  await sleep(20);
  q = itemShown();
  const wrong = wrongFor();
  const wrongName = wrong.textContent;
  click(wrong);
  check($('.verdict').textContent === `You chose “${wrongName}”. This one is “${q.name}”.`, 'wrong: says what it chose and what it is, once, with no scolding', $('.verdict').textContent);
  const echoUnits = $('.seat-echo').querySelectorAll('.seat-echo-word .unit');
  check($('.seat-echo').hidden === false && echoUnits.map((u) => u.textContent).join('') === data[q.id].madani && echoUnits.filter((u) => u.attrs['data-role']).length === litCount(q.kind, vowelOf(q)),
    'under a wrong answer: the same word again, whole, with its lit places', String(echoUnits.length));
  check($('.seat-echo').textContent.startsWith(ECHO[q.kind === 'start' ? vowelOf(q) : q.kind]), 'and the line for its vowel says why', $('.seat-echo').textContent);
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

  // Every part asks its own question, with its own answers.
  const seenIds = new Set();
  const namesOf = { start: 'Start with damma|Start with fatha|Start with kasra', alif: 'The alif is not read|The alif is read', long: 'The long vowel is read long|The long vowel is read short' };
  for (const [n, group, kinds] of [[2, 'alif', ['read', 'joined']], [3, 'long', ['short', 'keep']]]) {
    qaida.setGroup(n);
    await sleep(10);
    const asked = new Set();
    for (let i = 0; i < 24; i += 1) {
      const shown = itemShown();
      if (!shown) break;
      seenIds.add(shown.id);
      asked.add(shown.kind);
      if ($('.ask').textContent !== ASK[group] || choices().map((c) => c.textContent).sort().join('|') !== namesOf[group]) check(false, `part ${n}: the ${group} question with its two answers`, `${$('.ask').textContent} / ${choices().map((c) => c.textContent).join(' | ')}`);
      click(answerFor());
      click($('.next-question'));
      await sleep(5);
    }
    check(kinds.every((k) => asked.has(k)), `part ${n} asks "${ASK[group]}", with its two answers, about ${kinds.join(' and ')} words`, [...asked].join());
  }
  check(seenIds.size >= 14, 'the drill walks through the forms of parts 2 and 3', String(seenIds.size));
  qaida.setGroup(4);
  await sleep(10);
  const askedIn4 = new Set();
  let mixedWrong = 0;
  for (let i = 0; i < 60; i += 1) {
    const shown = itemShown();
    askedIn4.add(shown.askGroup);
    if ($('.ask').textContent !== ASK[shown.askGroup] || choices().map((c) => c.textContent).sort().join('|') !== namesOf[shown.askGroup]) mixedWrong += 1;
    click(answerFor());
    click($('.next-question'));
    await sleep(5);
  }
  check(askedIn4.size === 3 && mixedWrong === 0, 'part 4 asks all three questions, each with the line and the answers of its own, over a run of 60', `${[...askedIn4].join()} / ${mixedWrong}`);
  qaida.setGroup(1);

  console.log('\nThe names follow the student');
  await w.setNames('zabar');
  check(/^On its own, you start on the alif, so it is read\. Al- starts with zabar; a verb whose third letter has paish starts with paish; any other starts with zair\.$/.test($('.same-line').textContent), 'in the zabar set the lines say zabar, zair and paish, in the fatha set fatha, kasra and damma', $('.same-line').textContent);
  check(choices().map((c) => c.textContent).sort().join('|') === 'Start with paish|Start with zabar|Start with zair' && $('.prev span').textContent === 'Previous: Al-', 'and the choices follow, while Previous does not change (it has no zabar form)', choices().map((c) => c.textContent).join(' | '));
  check($('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|') === 'Al-: starts with zabar|starts with zair|third letter has paish: starts with paish', 'and so do the captions under the three on their own');
  await w.setNames('fatha');

  console.log('\nFinishing');
  qaida.clear();
  await sleep(20);
  check(shell.isDone(19) === false, 'nothing is done to begin with');
  qaida.setGroup(1);
  const master = (n) => {
    for (const f of forms.filter((x) => x.parts.includes(n))) for (let i = 0; i < 3; i += 1) shell.recordAnswer(19, kit.idOf(f), true);
  };
  master(1);
  qaida.render();
  await sleep(20);
  check(shell.isDone(19) === false && $('.ready-note').hidden === false, 'part 1 known: the part says you seem ready, and the lesson is not done (part 4 gates it)');
  master(4);
  qaida.setGroup(4);
  await sleep(20);
  check(shell.isDone(19) === true && $('.end-line').textContent.startsWith('You can tell when the joining alif is read'), 'every form known: the lesson is done, and says so', $('.end-line').textContent);
  check(shell.masteredCount(19) === 24, 'and the home\'s count is the twenty-four', String(shell.masteredCount(19)));
  check(shell.drillOf(19).total === 24, 'the home reads the whole lesson\'s total, 24, and not the open part\'s', String(shell.drillOf(19).total));
  qaida.clear();
  await sleep(20);
  check(shell.isDone(19) === false && shell.masteredCount(19) === 0, 'Start again clears it');

  console.log('\nThe walkthrough');
  const units = () => $('.spell-glyph').children.map((u) => u.textContent);
  const states = () => $('.spell-glyph').children.map((u) => u.classes().filter((c) => c !== 'unit')[0]);
  const stepsOf = () => {
    const captions = [$('.spell-caption').textContent];
    while (!$('.spell-next').hidden && captions.length < 12) { click($('.spell-next')); captions.push($('.spell-caption').textContent); }
    return captions;
  };
  check(all('.word-step').length === 3, 'three walkthrough items');
  const w0 = kit.WALK[0];
  check(units().join('') === data[w0.ref].madani && units().length === kit.lettersOf(data[w0.ref].madani).length, 'item 1 is the copied pair, one unit a letter and one for the space', units().length);
  const firstWord = kit.unitsOf(w0.ref, 'madani', 'joined').filter((u) => u.step === 0).length;
  check(states().join() === [...Array(firstWord).fill('active'), ...Array(units().length - firstWord).fill('unread')].join(), 'step 1 lights the first word, and nothing else', states().join());
  const c1 = stepsOf();
  check(c1.length === 3 && c1[0] === 'The first word: “fadlu”. It ends on a vowel.' && c1[1] === 'The second word: “l-laahi”. Its alif is not read: the sound runs on from the vowel before it.' && c1[2] === 'The whole thing: fadlul-laahi.', 'item 1: three steps, the first word, the second, the whole', c1.join(' / '));
  check(states().every((s) => s === 'read'), 'the last step settles every letter to plain');
  check($('.spell-meaning').textContent === 'It means “the favour of Allah.”', 'and the meaning shows on the last step', $('.spell-meaning').textContent);
  click($('.spell-nextword'));
  check(units().join('') === data[kit.WALK[1].ref].madani, 'item 2 is the copied pair with a long vowel');
  const c2 = stepsOf();
  check(c2.length === 3 && c2[0] === 'The first word: “fi”. It ends on a long vowel.' && /^The second word: “l-bahri”\. Its alif is not read, so the long vowel before it is read short\.$/.test(c2[1]) && c2[2] === 'The whole thing: fil-bahri.', 'item 2: the second step says the alif is not read and the long vowel is short', c2.join(' / '));
  click($('.spell-nextword'));
  check(units().join('') === data[kit.WALK[2].ref].madani && states().join() === `active,${Array(units().length - 1).fill('unread').join()}`, 'item 3 is the copied word to start on, and step 1 lights its alif alone', states().join());
  const c3 = stepsOf();
  check(c3.length === 3 && c3[0] === 'The alif: “i”. You start on it, so it is read.' && c3[1] === 'The rest of the word: “sbir”.' && c3[2] === 'The whole thing: isbir.', 'item 3: the alif, the rest, the whole', c3.join(' / '));
  check($('.spell-meaning').textContent === 'It means “be patient.”', 'and the meaning shows on the last step', $('.spell-meaning').textContent);
  await w.setScript('indopak');
  click(all('.word-step')[0]);
  check(units().join('') === data[kit.WALK[0].ref].indopak, 'in Indo-Pak the walkthrough shows the copied Indo-Pak text', units().join('') === data[kit.WALK[0].ref].madani ? 'same' : 'different');
  await w.setScript('madani');

  console.log('\nThe ways out: Previous goes to Lesson 18, Next to Lesson 20 (built since: a real link)');
  check($('.prev').attrs.href === 'lesson-18.html' && $('.prev span').textContent === 'Previous: Al-', 'Previous goes to Lesson 18', $('.prev span').textContent);
  check($('.spell-more a').attrs.href === 'exercise-19.html' && fs.existsSync(path.join(dir, 'exercise-19.html')), 'Practice reading goes to exercise-19.html, which exists');
  check($('.next span').textContent === 'Next: The wavy line' && !$('.next').attrs['data-last'], 'Next reads "Next: The wavy line"', $('.next span').textContent);
  w.location.href = '';
  click($('.next'), 1);
  check(w.location.href === 'lesson-20.html', 'and it goes to lesson-20.html, which is built now (it said "not built yet" until Lesson 20 was)', String(w.location.href));

  console.log('\nThe home');
  const home = boot();
  const row = home.shell.LESSONS.find((l) => l.n === 19);
  check(row.built === true && row.href === 'lesson-19.html' && row.progress === 'drill' && row.part === 2 && row.cp === undefined && !row.tail, 'the home\'s row 19 is built, a drill, in the second part, with no `cp`, and leads to lesson-19.html');
  check(home.shell.LESSONS.find((l) => l.n === 18).built && home.shell.LESSONS.find((l) => l.n === 20).built && home.shell.LESSONS.find((l) => l.n === 21).built && home.shell.LESSONS.find((l) => l.n === 22).built && !home.shell.LESSONS.find((l) => l.n === 23).built, 'and 18, 20, 21 and 22 are built and 23 is not');

  console.log('\nThe markup');
  check(!NOMARK.test(w.raw), 'lesson-19.html holds no literal combining mark');
  check(!/[ء-ي]/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<dialog class="chooser"[\s\S]*?<\/dialog>/, '')), 'and no Arabic on the lesson itself: every word is copied into rule-words.js and drawn by rule-lesson.js');
  check(/&#x671;</.test(w.raw) && !/&#x671;&#x644;/.test(w.raw), 'the title glyph is an alif, as a numeric reference');
  const at = (file) => w.raw.indexOf(`<script src="${file}" defer></script>`);
  check(at('rules.js') > 0 && at('rules.js') < at('rule-words.js') && at('rule-words.js') < at('wasl.js') && at('wasl.js') < at('rule-lesson.js') && at('spell.js') > at('rule-lesson.js') && at('ends.js') === -1 && at('al.js') === -1,
    'the scripts load in order: rules.js, rule-words.js, wasl.js, then the page\'s code and spell.js (neither ends.js nor al.js is needed here)');
  const visible = w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|leen|madd|qalqalah|idgham|ikhfa|izhar|ghunna|tajweed)\b/i.test(visible), 'no scolding and no tajweed word on the page (the plain-names rule; docs/pass-2/03 §4)');
  check(!/\b29\b/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace('Lesson 19 of 29', '')), 'no "29" on the page but the lesson count');
  check((w.raw.match(/data-words(-attr)?=/g) || []).length > 60, 'every line of wording is a text field (data-words / data-words-attr)');
  const wordsAttrOK = [...w.raw.matchAll(/data-words-attr="([^"]*)"/g)].every((m) => m[1].split(';').every((pair) => pair.includes('|')));
  check(wordsAttrOK, 'and every data-words-attr entry is "attribute|label"');
  // Every data- attribute the board reads has a text field (data-words-attr) beside it, so the teacher can edit it.
  const boardTag = w.raw.match(/<section class="marks-board[\s\S]*?>\s*<div class="section-head">/)[0];
  const boardAttrs = [...boardTag.matchAll(/\s(data-[\w-]+)="/g)].map((m) => m[1]).filter((a) => a !== 'data-words-attr');
  const boardFields = boardTag.match(/data-words-attr="([^"]*)"/)[1].split(';').map((p) => p.split('|')[0]);
  check(boardAttrs.every((a) => boardFields.includes(a)), 'every line of the board\'s wording has its own text field', boardAttrs.filter((a) => !boardFields.includes(a)).join(', '));
  // The same for the other sections that carry wording.
  for (const [name, re] of [['the spell block', /<section class="spell"[\s\S]*?>\s*<div class="section-head">/], ['the question', /<p class="ask"[\s\S]*?><\/p>/], ['the echo line', /<p class="seat-echo"[\s\S]*?><\/p>/], ['the verdict', /<p class="verdict"[\s\S]*?><\/p>/], ['the advice', /<div class="advice"[\s\S]*?>\s*<div class="struggle"/], ['the names', /<span hidden\s[\s\S]*?><\/span>/]]) {
    const tag = w.raw.match(re)[0];
    const attrs = [...tag.matchAll(/\s(data-[\w-]+)="/g)].map((m) => m[1]).filter((a) => a !== 'data-words-attr');
    const fields = (tag.match(/data-words-attr="([^"]*)"/) || ['', ''])[1].split(';').map((p) => p.split('|')[0]);
    check(attrs.every((a) => fields.includes(a)), `every line of ${name} has its own text field`, attrs.filter((a) => !fields.includes(a)).join(', '));
  }

  console.log('\nThe reading page');
  let ex;
  try {
    ex = run('exercise-19.html', ['shell.js', 'marks.js', 'rules.js', 'rule-words.js', 'wasl.js', 'exercise.js'], { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against exercise-19.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  await sleep(20);
  const cells = () => ex.all('.mashq-word');
  check(cells().length === 12 && ex.ctx.qaida.kind === 'exercise' && ex.ctx.qaida.count === 12, 'exercise-19.html has twelve pairs');
  check(/data-rule="wasl"/.test(ex.raw) && !/data-mark=/.test(ex.raw) && /href="lesson-19\.html"/.test(ex.raw) && /data-next-fatha="Next: The wavy line"/.test(ex.raw) && !/data-last/.test(ex.raw),
    'it teaches the wasl rule, goes back to Lesson 19 and on to Lesson 20');
  check(/^Twelve pairs of the Qur’an’s own words/.test(ex.$('.exercise-lede').textContent), 'its line says so', ex.$('.exercise-lede').textContent);
  const wordText = () => cells().map((c) => c.children.find((k) => k.attrs.lang === 'ar').textContent);
  check(wordText().join('|') === kit.READING.map((ref) => data[ref].madani).join('|'), 'in Madani the twelve are the copied Madani text, in the order wasl.js lists them, character for character');
  await ex.setScript('indopak');
  check(wordText().join('|') === kit.READING.map((ref) => data[ref].indopak).join('|'), 'in Indo-Pak, the copied Indo-Pak text');
  check(!NOMARK.test(ex.raw), 'and exercise-19.html holds no literal combining mark');
}

pageHalf().then(() => {
  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
});
