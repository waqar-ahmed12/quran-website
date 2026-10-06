// Checks for Lesson 22's word layer (stop.js, on rules.js, with the Qur'an's own words in rule-words.js) and, below it, the rule page (rule-lesson.js
// against the real lesson-22.html in a small hand-made DOM). QAIDA-BUILD.md step P2; docs/lesson-22/02 §3.
//
//   node tools/qaida-lesson22-check.js
//
// The data half loads the real shell.js, practice.js, marks.js, rules.js, rule-words.js and stop.js into a scratch context with an in-memory stand-in for
// localStorage, as tools/qaida-lesson21-check.js does. The page half is at the foot of this file.
//
// The same limits as every other page check: nothing is drawn and no CSS runs, so it cannot tell how a face draws a stop sign on a space, whether the
// stopped form under a word is legible, or whether the lit band sits on the sign. Those were measured in the browser pane at the build
// (docs/lesson-22/02 §3; §4 is the user's list). What it proves is what only a script can: that every reference the lesson names is in the copied file,
// in both scripts, and that the copy is exact; that every word holds only what the student has met and the stop signs; that every word ends the way its
// kind says, BY THE LESSON'S RULE, in both scripts, and carries the sign its kind says, the same meaning in both; that the stopped form is the printed
// word with only its end changed, by that rule; that the engine asks each question with its own answers; and that the ids, the two scripts, the board,
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

function boot(saved, files = ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'stop.js']) {
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
  return { shell: ctx.qaidaShell, practice: ctx.qaidaPractice, marks: ctx.qaidaMarks, rules: ctx.qaidaRules, kit: ctx.qaidaRules.KITS.stop, words: ctx.qaidaRuleWords, store };
}

const cc = (...codes) => String.fromCharCode(...codes);
const cps = (text) => [...text].map((c) => c.codePointAt(0));
const ALIF_WASLA = 0x0671;
const TATWEEL = 0x0640;
const SPACE = 0x20;
const FATHA = 0x064E;
const FATHATAIN = 0x064B;
const HAA = 0x0647;
const TAA_MARBUTA = 0x0629;
const SMALL_ALIF = 0x0670;
const CIRCLE = 0x06DF;
const JAZAM_M = 0x0652; // Quran.com's Madani text writes the jazam as U+0652
const JAZAM_I = 0x06E1; // and its Indo-Pak text as U+06E1
const SIGN_CODES = [0x06D6, 0x06D7, 0x06D8, 0x06D9, 0x06DA, 0x06DB, 0x0615];
// The meaning each script gives a sign, read off Quran.com's code points (docs/lesson-22/01 §2): the four this lesson teaches.
const SIGN_OF = { must: [0x06D8, 0x06D8], better: [0x06D7, 0x0615], either: [0x06DA, 0x06DA], no: [0x06D9, 0x06D9] };
// What a word may hold: a letter of the 29 (or the alif wasla), tatweel, the marks the student has met by Lesson 21 (the harakat, the tanween, the
// shadda, the jazam in both drawings, the small alif, the wavy line, and in Madani the small circle), a stop sign, and the spaces and invisible marks
// both scripts put before a sign or after a verse's last word (U+0020; in Indo-Pak U+200B, U+2002 and U+200F). No private-use sign, no other small letter.
const isLetter = (c) => (c >= 0x0621 && c <= 0x064A) || c === ALIF_WASLA;
const ALLOWED_MARK = new Set([0x064B, 0x064C, 0x064D, 0x064E, 0x064F, 0x0650, 0x0651, JAZAM_M, SMALL_ALIF, JAZAM_I, 0x0653]);
const okChar = (script) => (c) => isLetter(c) || c === TATWEEL || c === SPACE || ALLOWED_MARK.has(c) || SIGN_CODES.includes(c)
  || (script === 'madani' && c === CIRCLE) || (script === 'indopak' && [0x200B, 0x2002, 0x200F].includes(c));

const NAME = { id: 'form-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0, available: () => true };
const kitSource = fs.readFileSync(path.join(dir, 'stop.js'), 'utf8');
const REF_RE = /['"](\d{1,3}:\d{1,3}:\d{1,3}(?:-\d{1,3})?)['"]/g;
const namedIn = (file) => new Set([...fs.readFileSync(path.join(dir, file), 'utf8').matchAll(REF_RE)].map((m) => m[1]));
const STOP_KINDS = ['vowel', 'tanween', 'fathatain', 'taa', 'long'];
const SIGN_KINDS = ['must', 'better', 'either', 'no'];

console.log('The data layer: rule-words.js and stop.js');
{
  const { shell, marks, rules, kit, words } = boot();
  const forms = kit.formsOf();
  const stops = forms.filter((f) => f.ask === 'stop');
  const signs = forms.filter((f) => f.ask === 'sign');
  const data = words.words;
  const marksOf = (u) => cps(u).slice(1).filter((c) => c !== TATWEEL);

  // The copy: every reference the lesson names is in the copied file, in both scripts, and the file holds nothing else.
  const named = namedIn('stop.js');
  check(named.size === 42 && [...named].every((ref) => data[ref] && data[ref].madani && data[ref].indopak), `every reference stop.js names (${named.size}) is in rule-words.js, in both scripts`, String(named.size));
  const others = ['al.js', 'wasl.js', 'madd.js', 'silent.js'].map(namedIn);
  check(Object.keys(data).every((ref) => named.has(ref) || others.some((s) => s.has(ref))) && Object.keys(data).length === named.size + others.reduce((n, s) => n + s.size, 0),
    'and rule-words.js holds no word that no kit file names (the fetch tool reads the references out of the kit files), and each is named once');
  check([...named].every((ref) => others.every((s) => !s.has(ref))), 'no reference is named by two lessons: each lesson\'s words are its own');
  const fileText = fs.readFileSync(path.join(dir, 'rule-words.js'), 'utf8');
  check(!/[^\x00-\x7f]/.test(fileText.replace(/^\/\/.*$/gm, '')), 'the copied data is ASCII with \\u escapes: a combining mark is never a character you cannot see in a diff');
  check(!/[؀-ۿ]/.test(kitSource) && !/[ً-ْٰۡ]/.test(kitSource), 'stop.js holds no Arabic and no combining mark: every word is a reference (docs/pass-2/02 §3)');
  check(/KIT_FILES = \[[^\]]*'stop\.js'/.test(fs.readFileSync(path.join(dir, '..', '..', 'tools', 'fetch-qaida-words.js'), 'utf8')), 'the fetch tool reads its references from stop.js');
  check([...named].every((ref) => !ref.includes('-')), 'every reference is one word: no pairs in this lesson');

  // What is in each word: only what the student has met, the stop signs, and the spaces and invisible marks a sign or a verse end brings.
  let badChars = 0;
  let loneMarks = 0;
  for (const ref of named) {
    for (const script of ['madani', 'indopak']) {
      const text = data[ref][script];
      if (!cps(text).every(okChar(script))) badChars += 1;
      if (kit.lettersOf(text).join('') !== text) loneMarks += 1;
    }
  }
  check(badChars === 0, 'every word, in both scripts, holds only letters, tatweel, the marks Lessons 4-21 taught, a stop sign, and a space or invisible mark (no private-use sign, no other small letter)', String(badChars));
  check(loneMarks === 0, 'and the units of every word, joined, are its text exactly');

  // THE RULE (docs/lesson-22/01 §1): every stop word ends the way its kind says, read off its own text by the lesson's rule, in both scripts; and its sign,
  // where it has one, allows a stop. Every sign word carries one sign, the one its kind says, in each script's own code point.
  const problems = [];
  const why = (ref, script, message) => problems.push(`${ref} ${script}: ${message}`);
  for (const f of stops) {
    for (const script of ['madani', 'indopak']) {
      const units = kit.lettersOf(data[f.ref][script]);
      if (kit.stopKindOf(units, script) !== f.kind) why(f.ref, script, `ends as a ${f.kind} word`);
      const sign = kit.signKindOf(units, script);
      const anySign = cps(data[f.ref][script]).some((c) => SIGN_CODES.includes(c));
      if (anySign && !['must', 'better', 'either'].includes(sign)) why(f.ref, script, 'a sign on a stop word is one that allows a stop');
    }
    // A stop word is a verse's last word, or carries a sign that allows a stop, in both scripts the same way.
    const signed = ['madani', 'indopak'].map((s) => kit.signKindOf(kit.lettersOf(data[f.ref][s]), s));
    if (signed[0] !== signed[1]) why(f.ref, 'both', 'the same sign in both scripts, or none');
  }
  for (const f of signs) {
    for (const script of ['madani', 'indopak']) {
      const units = kit.lettersOf(data[f.ref][script]);
      if (kit.signKindOf(units, script) !== f.kind) why(f.ref, script, `carries the ${f.kind} sign`);
      const found = cps(data[f.ref][script]).filter((c) => SIGN_CODES.includes(c));
      if (found.length !== 1 || found[0] !== SIGN_OF[f.kind][script === 'madani' ? 0 : 1]) why(f.ref, script, 'one sign, in the script\'s own code point');
      const at = kit.signAt(units);
      if (at < kit.lastLetterAt(units)) why(f.ref, script, 'the sign comes after the last letter');
    }
  }
  check(problems.length === 0, 'the rule holds for every word, in both scripts: each stop word ends as its kind says and any sign on it allows a stop; each sign word carries one sign, its kind\'s, in the script\'s own code point', problems.slice(0, 4).join(' | '));
  // The signs really are another code point in each script for "better to stop", and the same for the other three.
  check(SIGN_KINDS.every((k) => kit.SIGNS[k].madani === SIGN_OF[k][0] && kit.SIGNS[k].indopak === SIGN_OF[k][1]) && kit.SIGNS.better.madani !== kit.SIGNS.better.indopak,
    'the four signs: a small meem, the small "qalaa" (Madani) and small taa (Indo-Pak), a small jeem, a small laam-alif');
  // The reading page's twelve and the walkthrough's three: places to stop, by the same rule.
  const readingBad = [];
  kit.READING.forEach((ref) => {
    for (const script of ['madani', 'indopak']) {
      const units = kit.lettersOf(data[ref][script]);
      if (!kit.stopKindOf(units, script)) readingBad.push(`${ref} ${script} end`);
      const sign = kit.signKindOf(units, script);
      if (cps(data[ref][script]).some((c) => SIGN_CODES.includes(c)) && !sign) readingBad.push(`${ref} ${script} sign`);
      if (!cps(data[ref][script]).every(okChar(script))) readingBad.push(`${ref} ${script} chars`);
    }
  });
  kit.WALK.forEach((w) => {
    for (const script of ['madani', 'indopak']) if (kit.stopKindOf(kit.lettersOf(data[w.ref][script]), script) !== w.kind) readingBad.push(`${w.ref} ${script} walk`);
  });
  check(readingBad.length === 0, 'the reading page\'s twelve each end in a way the lesson teaches, in both scripts, and the walkthrough\'s three end as their kinds say', readingBad.join());
  check(STOP_KINDS.every((k) => kit.READING.some((ref) => kit.stopKindOf(kit.lettersOf(data[ref].madani), 'madani') === k)), 'and between them the twelve hold every kind of end');

  // The lists: numbers and no overlap.
  check(rules.RULES.stop.id === 'stop' && rules.RULES.stop.lesson === 22 && rules.RULES.stop.parts === 3, 'a seventh rule, "stop", lesson 22, three parts');
  check(kit.VOWEL.length === 3 && kit.TANWEEN.length === 3 && kit.FATHATAIN.length === 3 && kit.TAA.length === 3 && kit.LONG.length === 3 && stops.length === 15
    && kit.MUST.length === 3 && kit.BETTER.length === 3 && kit.EITHER.length === 3 && kit.NO.length === 3 && signs.length === 12 && forms.length === 27,
  'fifteen stop words (three of each: a vowel at the end, two zair or two paish, two zabar, a round taa, a long vowel) and twelve sign words (three a sign): twenty-seven');
  const refs = forms.map((f) => f.ref);
  check(new Set(refs).size === 27, 'no word is in two lists');
  check(kit.READING.length === 12 && new Set(kit.READING).size === 12 && kit.READING.every((ref) => !refs.includes(ref) && data[ref]), 'the reading page\'s twelve are twelve other words than the drill\'s');
  check(kit.WALK.length === 3 && kit.WALK.map((w) => w.kind).join() === 'vowel,fathatain,taa' && kit.WALK.every((w) => w.sounds.length === 2 && w.whole && w.meaning && data[w.ref] && !refs.includes(w.ref) && !kit.READING.includes(w.ref)),
    'the walkthrough is three others: a vowel, two zabar and a round taa at the end, each with two sounds, a whole and a meaning');
  const verseEnds = stops.filter((f) => ['madani', 'indopak'].every((s) => !kit.signKindOf(kit.lettersOf(data[f.ref][s]), s)));
  check(verseEnds.length >= 6 && stops.length - verseEnds.length >= 6, 'the stop words are both kinds of place to stop: verse ends, and words with a sign that allows a stop', `${verseEnds.length} verse ends`);

  // Parts.
  const items = kit.itemsFor(shell);
  check(JSON.stringify(marks.sizes(items, [1, 2, 3])) === '[15,12,27]', 'the three parts hold 15, 12 and 27', JSON.stringify(marks.sizes(items, [1, 2, 3])));
  check(stops.every((f) => f.parts.join() === '1,3') && signs.every((f) => f.parts.join() === '2,3'), 'a stop word is asked in parts 1 and 3, a sign word in parts 2 and 3');
  check(rules.poolFor(items, 1).every((i) => i.askGroup === 'stop') && rules.poolFor(items, 2).every((i) => i.askGroup === 'sign') && new Set(rules.poolFor(items, 3).map((i) => i.askGroup)).size === 2,
    'part 1 asks only how to stop, part 2 only what a sign says, part 3 both');
  check(new Set(rules.poolFor(items, 1).map((i) => i.name)).size === 4 && new Set(rules.poolFor(items, 2).map((i) => i.name)).size === 4, 'each question has four answers in its part, so four choices can always be dealt');

  // Ids: distinct, the same in both scripts, and never the Arabic.
  const ids = forms.map((f) => kit.idOf(f));
  check(new Set(ids).size === 27 && ids.every((id) => /^\d+:\d+:\d+$/.test(id)), 'twenty-seven distinct ids, each a reference, never a word\'s Arabic');
  const madani = boot();
  const indopak = boot();
  indopak.shell.state.script = 'indopak';
  const idsIn = (w) => w.kit.itemsFor(w.shell).map((item) => item.id);
  check(JSON.stringify(idsIn(madani)) === JSON.stringify(idsIn(indopak)), 'the same ids in both scripts: the glyphs differ, the ids do not');
  const itemsM = madani.kit.itemsFor(madani.shell);
  const itemsI = indopak.kit.itemsFor(indopak.shell);
  check(itemsM.every((it) => it.glyph === data[it.ref].madani) && itemsI.every((it) => it.glyph === data[it.ref].indopak), 'each item\'s glyph IS the copied text for the script in use, character for character');
  check(itemsM.filter((it, i) => it.glyph !== itemsI[i].glyph).length >= 25, 'and the two scripts differ in nearly all of them (the jazam, the signs, the marks after a verse end)', String(itemsM.filter((it, i) => it.glyph !== itemsI[i].glyph).length));
  check(itemsM.every((it) => it.boardId === it.ref && it.parts.length > 0 && it.marked === true && it.required === false && it.traceable === true && it.family.length === 0 && ['stop', 'sign'].includes(it.askGroup)),
    'every item is marked, not required until a part makes it so, has no look-alike, says which question it answers, and knows its word\'s tile');

  // What a question lights: one place, the last LETTER of a stop word (whatever its kind) or the sign of a sign word.
  for (const [script, w] of [['madani', madani], ['indopak', indopak]]) {
    const its = w.kit.itemsFor(w.shell);
    check(its.every((it) => it.units.map((u) => u.text).join('') === data[it.ref][script]), `${script}: the units of every item, joined, are the copied word exactly`);
    const off = its.filter((it) => {
      const lit = it.units.filter((u) => u.role === 'ask');
      const at = it.units.findIndex((u) => u.role === 'ask');
      const texts = it.units.map((u) => u.text);
      return lit.length !== 1 || at !== (it.askGroup === 'sign' ? w.kit.signAt(texts) : w.kit.lastLetterAt(texts));
    });
    check(off.length === 0, `${script}: a question lights exactly one place: the last letter of a stop word (so the light never tells one kind from another) or the sign`, off.map((it) => it.id).join());
    check(its.filter((it) => it.askGroup === 'sign').every((it) => cps(it.units.find((u) => u.role === 'ask').text).some((c) => SIGN_CODES.includes(c))), `${script}: and a sign word's lit place holds the sign`);
  }

  // HOW IT IS SAID AT A STOP: the printed word with only its end changed, by the rule.
  const saidBad = [];
  for (const [script, w] of [['madani', madani], ['indopak', indopak]]) {
    // The open-head jazam in both scripts: Indo-Pak's own, and in Madani the shape the lessons taught, never the copied text's U+0652, which the Madani
    // face draws as a circle like Lesson 21's "not read" (docs/lesson-22/01 §4).
    const jazam = JAZAM_I;
    for (const f of [...stops, ...kit.WALK]) {
      const printed = kit.lettersOf(data[f.ref][script]);
      const last = w.kit.lastLetterAt(printed);
      const said = w.kit.saidUnitsOf(f.ref, script, f.kind).map((u) => u.text);
      const strip = (u) => cps(u).filter((c) => !SIGN_CODES.includes(c));
      if (said.length !== last + 1) { saidBad.push(`${f.ref} ${script} length`); continue; }
      if (said.some((u) => cps(u).some((c) => SIGN_CODES.includes(c)))) saidBad.push(`${f.ref} ${script} sign kept`);
      const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const changedAt = said.map((u, i) => (same(cps(u), strip(printed[i])) ? -1 : i)).filter((i) => i >= 0);
      const end = said[last];
      if (f.kind === 'vowel' || f.kind === 'tanween') {
        if (changedAt.join() !== String(last) || cps(end)[cps(end).length - 1] !== jazam || cps(end)[0] !== cps(printed[last])[0] || marksOf(end).length !== 1) saidBad.push(`${f.ref} ${script} jazam`);
      } else if (f.kind === 'taa') {
        if (changedAt.join() !== String(last) || cps(end).join() !== [HAA, jazam].join() || cps(printed[last])[0] !== TAA_MARBUTA) saidBad.push(`${f.ref} ${script} haa`);
      } else if (f.kind === 'fathatain') {
        const before = said[last - 1];
        if (changedAt.join() !== String(last - 1) || !marksOf(before).includes(FATHA) || marksOf(before).includes(FATHATAIN) || cps(end).join() !== String(0x0627)) saidBad.push(`${f.ref} ${script} aa`);
      } else if (f.kind === 'long' && changedAt.length !== 0) {
        saidBad.push(`${f.ref} ${script} long`);
      }
    }
    check(signs.every((f) => w.kit.saidUnitsOf(f.ref, script, f.kind).length === 0), `${script}: a sign word has no stopped form (its question is the sign)`);
  }
  check(marks.drawnOf(marks.markOf('sukun'), 'madani') === cc(JAZAM_I) && kit.JAZAM.madani === JAZAM_I && kit.JAZAM.indopak === JAZAM_I,
    'the stopped form\'s jazam is the open head in both scripts: in Madani the shape marks.js draws for the jazam, in Indo-Pak the copied text\'s own');
  check(saidBad.length === 0, 'how a word is said at a stop is the printed word with only its end changed, in both scripts: a vowel or a tanween becomes the open-head jazam, a round taa an "h" with one, two zabar a zabar before the alif; a long vowel is unchanged; no sign is kept', saidBad.slice(0, 4).join());
  check(kit.saidOf(kit.TAA[0], 'madani') !== data[kit.TAA[0]].madani && data[kit.TAA[0]].madani === words.words[kit.TAA[0]].madani, 'and the printed word is never altered: the stopped form is another string');

  // Names.
  const names = items.map((i) => i.name);
  check(names.slice(0, 6).every((n) => n === 'Ends with a sukoon') && names.slice(6, 9).every((n) => n === 'Ends with a long ‘aa’') && names.slice(9, 12).every((n) => n === 'Ends with an ‘h’')
    && names.slice(12, 15).every((n) => n === 'Stays as it is') && names.slice(15, 18).every((n) => n === 'Always stop here') && names.slice(18, 21).every((n) => n === 'Better to stop')
    && names.slice(21, 24).every((n) => n === 'Stop or go on') && names.slice(24).every((n) => n === 'Do not stop here'), 'the names: how each word ends at a stop (a vowel and a tanween share one), and what each sign says', [...new Set(names)].join(' | '));
  const zn = boot({ v: 1, chosen: true, script: 'madani', names: 'zabar', grouping: 'families' });
  check(zn.kit.itemsFor(zn.shell)[0].name === 'Ends with a jazam', 'in the zabar set the jazam is the student\'s own word for it', zn.kit.itemsFor(zn.shell)[0].name);
  const custom = kit.itemsFor(shell, { templates: { vowel: 'V', tanween: 'T', fathatain: 'F', taa: 'H', long: 'L', must: 'M', better: 'B', either: 'E', no: 'N' } });
  check(custom[0].name === 'V' && custom[3].name === 'T' && custom[6].name === 'F' && custom[9].name === 'H' && custom[12].name === 'L' && custom[15].name === 'M' && custom[18].name === 'B' && custom[21].name === 'E' && custom[24].name === 'N',
    'the templates are the only source of a name (a teacher\'s edit reaches every item)');
  kit.rename(items, shell, { vowel: 'a', tanween: 'b', fathatain: 'c', taa: 'd', long: 'e', must: 'f', better: 'g', either: 'h', no: 'i' });
  check(items[0].name === 'a' && items[24].name === 'i', 'rename() rewrites every name in place');

  // Audio: none recorded.
  check(itemsM.every((i) => i.audio.kind === 'words' && i.audio.glyph === i.ref), 'a word\'s sound would be kept under the group "words", by its reference');

  // The board and the echo.
  const boards = kit.boards();
  check(boards.map((b) => b.id).join() === 'vowel,tanween,fathatain,taa,long,must,better,either,no' && boards.map((b) => b.cells.length).join() === '3,3,3,3,3,3,3,3,3',
    'the board is nine lists: five ways a word ends, then four signs');
  check(boards.slice(0, 5).every((b) => b.glyph === null) && boards.slice(5).every((b) => typeof b.glyph === 'function'), 'a sign\'s list brings its sign; a way of ending does not');
  check(madani.kit.boards()[6].glyph() === cc(TATWEEL, 0x06D7) && indopak.kit.boards()[6].glyph() === cc(TATWEEL, 0x0615) && madani.kit.boards()[5].glyph() === indopak.kit.boards()[5].glyph(),
    'the sign is drawn as the student\'s own script prints it: "better to stop" is a small "qalaa" in Madani and a small taa in Indo-Pak; a small meem is a small meem in both');
  check(JSON.stringify(kit.samples().map((s) => s.kind)) === '["vowel","fathatain","taa"]' && kit.samples().every((s) => s.said === true && refs.includes(s.ref)), 'the strip shows three words on their own, a vowel, two zabar, a round taa at the end, each with its stopped form');
  const line = (w, it) => w.kit.echoOf(it).line;
  check(STOP_KINDS.every((k) => line(madani, itemsM.find((i) => i.kind === k)) === `line${k[0].toUpperCase()}${k.slice(1)}`)
    && line(madani, itemsM.find((i) => i.kind === 'must')) === 'lineMust' && line(madani, itemsM.find((i) => i.kind === 'better')) === 'lineBetterMadani'
    && line(indopak, itemsI.find((i) => i.kind === 'better')) === 'lineBetterIndopak' && line(indopak, itemsI.find((i) => i.kind === 'no')) === 'lineNo',
  'under a wrong answer the line is the word\'s kind\'s; the better-to-stop sign has one a script');
  const stopEcho = madani.kit.echoOf(itemsM[0]);
  const signEcho = madani.kit.echoOf(itemsM.find((i) => i.kind === 'must'));
  check(stopEcho.units.map((u) => u.text).join('') === data[itemsM[0].ref].madani && stopEcho.units.filter((u) => u.role === 'end').length === 1 && stopEcho.said.map((u) => u.text).join('') === madani.kit.saidOf(itemsM[0].ref, 'madani')
    && signEcho.units.filter((u) => u.role === 'sign').length === 1 && !signEcho.said, 'and shows the same word again with its end lit and, for a stop word, how it is said at a stop; a sign word with its sign lit');
  check(madani.kit.unitsOf(kit.FATHATAIN[0], 'madani').filter((u) => u.role === 'end').length === 2 && madani.kit.unitsOf(kit.LONG[0], 'madani').filter((u) => u.role === 'end').length === 2
    && madani.kit.unitsOf(kit.TAA[0], 'madani').filter((u) => u.role === 'end').length === 1, 'on the board, two zabar and a long vowel light the two letters the end spans; the others light the last letter');
  check(kit.firstRow(1) === 'vowel' && kit.firstRow(2) === 'must' && kit.firstRow(3) === 'vowel' && kit.rowInPart('vowel', 1) && !kit.rowInPart('vowel', 2) && kit.rowInPart('no', 2) && !kit.rowInPart('no', 1),
    'the same-line row starts on the row a part is about, and a row is only in the parts its words are');
  for (const script of ['madani', 'indopak']) {
    const w = script === 'madani' ? madani : indopak;
    const s = [1, 2, 3].map((n) => w.kit.sampleOf(n, script));
    check(s.every((x) => x.length > 0) && data[kit.VOWEL[0]][script].includes(s[0]) && data[kit.EITHER[0]][script].includes(s[1]) && cps(s[1]).some((c) => SIGN_CODES.includes(c)) && data[kit.FATHATAIN[0]][script].includes(s[2]),
      `${script}: the rail's samples are the end of a word, the end of a word with its sign, and the end of a word with two zabar, cut from the copied words`);
  }
  check(kit.titleGlyph() === cc(0x06DD, 0x0661), 'the big glyph is the end of a verse (the verse-end sign around a one), composed from its code points');
  const walkUnits = kit.unitsOf(kit.WALK[0].ref, 'madani', 'vowel');
  check(walkUnits.map((u) => u.text).join('') === data[kit.WALK[0].ref].madani && walkUnits.filter((u) => u.step === 1).length === 1 && kit.unitsOf(kit.WALK[1].ref, 'madani', 'fathatain').filter((u) => u.step === 1).length === 2,
    'a walkthrough word\'s units say which piece they are: the word up to its end, and the end (two letters for two zabar)');

  // No literal combining mark in any file of the lesson.
  const MARK_RE = new RegExp('[\\u064B-\\u0653\\u0670\\u0657\\u0660-\\u0669\\u06D6-\\u06ED\\u0615]');
  check(MARK_RE.test(cc(0x064E)) && MARK_RE.test(cc(0x06DA)) && MARK_RE.test(cc(0x0615)) && !MARK_RE.test(cc(0x0644)), 'the literal-mark pattern can fail (it catches a zabar, a small jeem and a small taa, and not a letter)');
  for (const file of ['stop.js', 'rules.js', 'rule-lesson.js', 'practice.js', 'spell.js', 'exercise.js', 'lesson-22.html', 'exercise-22.html', 'rule-words.js']) {
    check(!MARK_RE.test(fs.readFileSync(path.join(dir, file), 'utf8').replace(/&#x[0-9a-fA-F]+;/g, '')), `${file} holds no literal combining mark or small letter`);
  }
}

console.log('\nThe other rules still stand');
{
  const all = boot(undefined, ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'ends.js', 'rule-words.js', 'al.js', 'wasl.js', 'madd.js', 'silent.js', 'stop.js']);
  check(Object.keys(all.rules.KITS).join() === 'hamza,ends,al,wasl,madd,silent,stop', 'the registry holds every rule\'s kit, this one last', Object.keys(all.rules.KITS).join());
  check(all.rules.KITS.al.formsOf().length === 12 && all.rules.KITS.wasl.formsOf().length === 24 && all.rules.KITS.madd.formsOf().length === 24 && all.rules.KITS.silent.formsOf().length === 30,
    'Lessons 18 to 21 are untouched: twelve, twenty-four, twenty-four and thirty');
  check(all.kit.tapFormat === undefined && all.kit.byEar === undefined && all.kit.board === 'words', 'this kit taps nothing and asks nothing by ear first: two name questions on the words board');
}

console.log('\nMastery');
{
  const w = boot();
  const items = w.kit.itemsFor(w.shell);
  for (let k = 0; k < 3; k += 1) w.shell.recordAnswer(22, items[0].id, true);
  check(w.shell.masteredCount(22) === 1, 'masteredCount(22) counts one mastered item', String(w.shell.masteredCount(22)));
  check([16, 17, 18, 19, 20, 21].every((n) => w.shell.masteredCount(n) === 0), 'none of it counts toward another lesson');
  const switched = boot();
  const inMadani = switched.kit.itemsFor(switched.shell)[0];
  for (let k = 0; k < 3; k += 1) switched.shell.recordAnswer(22, inMadani.id, true);
  switched.shell.state.script = 'indopak';
  const inIndoPak = switched.kit.itemsFor(switched.shell)[0];
  check(inIndoPak.id === inMadani.id && inIndoPak.glyph !== inMadani.glyph && switched.rules.stats(switched.shell, 22, [inIndoPak], 1, { target: 3 }).known === 1,
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
  for (const file of ['shell.js', 'marks.js', 'rules.js', 'rule-words.js', 'stop.js', 'audio.js']) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), audioCtx, { filename: file });
  check(audioCtx.qaidaAudio.wanted().length === 447, 'the recordings page still lists 447 rows: Lesson 22 adds none (its words are recorded one at a time, under their references, in a later step)', String(audioCtx.qaidaAudio.wanted().length));
}

console.log('\nThe engine: unchanged, two questions kept apart');
{
  const w = boot();
  const items = w.kit.itemsFor(w.shell);
  let asked = 0;
  let bad = 0;
  const groups = { 1: ['stop'], 2: ['sign'], 3: ['stop', 'sign'] };
  for (const n of [1, 2, 3]) {
    const pool = w.rules.poolFor(items, n);
    const drill = w.practice.create({ lesson: 22, items: pool, formats: [NAME], random: seeded(70 + n), familyFirst: false, noRepeatWithin: Math.max(1, Math.min(8, pool.length - 2)) });
    drill.start();
    check(drill.progress().total === pool.length && pool.every((i) => i.required), `part ${n}: ${pool.length} items, all required, and the drill counts them`, String(drill.progress().total));
    const seen = new Set();
    for (let i = 0; i < 150; i += 1) {
      const q = drill.question;
      if (!q) { bad += 1; break; }
      asked += 1;
      seen.add(q.item.askGroup);
      const answers = q.choices.map((c) => c.name);
      const own = new Set(pool.filter((it) => it.askGroup === q.item.askGroup).map((it) => it.name));
      if (q.choices.length !== 4 || new Set(answers).size !== 4 || !answers.every((a) => own.has(a)) || !answers.includes(q.item.name) || q.correct !== q.item.id) bad += 1;
      drill.answer(i % 4 === 0 ? q.choices.find((c) => c.name !== q.item.name).id : q.item.id);
      drill.next();
    }
    check(groups[n].every((g) => seen.has(g)) && seen.size === groups[n].length, `part ${n} asks ${groups[n].join(' and ')}`, [...seen].join());
  }
  check(asked === 450 && bad === 0, '450 questions through the real engine: four answers each, all four names of the question\'s own kind (an answer to one question is never offered to the other), the right one among them', `${asked} asked, ${bad} off`);
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

const nodeLoad = ['shell.js', 'audio.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'stop.js', 'rule-lesson.js', 'spell.js'];
const NOMARK = new RegExp('[\\u064B-\\u0653\\u0670\\u0657\\u06D6-\\u06ED\\u0615]'); // a literal combining mark or small Quranic letter

async function pageHalf() {
  let w;
  try {
    w = run('lesson-22.html', nodeLoad, { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against lesson-22.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  check(true, 'shell.js, audio.js, practice.js, marks.js, rules.js, rule-words.js, stop.js, rule-lesson.js and spell.js load against lesson-22.html without an error');
  await sleep(20);
  const { $, all, click, shell, rules, htmlEl } = w;
  const kit = rules.KITS.stop;
  const data = w.ctx.qaidaRuleWords.words;
  const qaida = w.ctx.qaida;
  qaida.setPause(1);
  const forms = kit.formsOf();
  const gridTiles = () => $('.rule-grid').querySelectorAll('.word-cell');
  const rail = () => all('.band');
  const choices = () => $('.choices').children;
  const wordRows = () => $('.rule-grid').querySelectorAll('.word-row');
  const unitsOfTile = (t) => t.querySelector('.glyph').children.map((u) => ({ text: u.textContent, role: u.attrs['data-role'] || '' }));
  const wordUnits = () => ($('.prompt-word') ? $('.prompt-word').querySelectorAll('.unit') : []);
  const shown = () => {
    const ref = qaida.lastItem[1];
    return kit.itemsFor(shell).find((i) => i.ref === ref);
  };
  const answerRight = () => click(choices().find((c) => c.textContent === shown().name));
  const answerWrong = () => click(choices().find((c) => c.textContent !== shown().name));
  const ASK = { stop: 'How do you stop on this word?', sign: 'What does the lit sign say?' };
  const html = w.raw;
  const echoOf = (key) => html.match(new RegExp(`data-line-${key}="([^"]*)"`))[1];
  const sayJazam = (text) => text.replace('{jazam}', shell.state.names === 'zabar' ? 'jazam' : 'sukoon');

  console.log('\nThe page');
  check(qaida.kind === 'drill' && qaida.rule === 'stop' && qaida.hasOther === false && qaida.otherCount === 0 && qaida.hasTail === false && qaida.markCount === 1 && qaida.review === 0,
    'publishes window.qaida with kind "drill" and rule "stop", and nothing to be told apart from, no tails, no review');
  check(htmlEl.attrs['data-rule'] === 'stop' && htmlEl.attrs['data-point'] === 'none' && htmlEl.attrs['data-mark'] === undefined, 'the page teaches the stop rule, with no halo and no mark');
  check(JSON.stringify(qaida.groupCosts().map((p) => p.items)) === '[15,12,27]', 'groupCosts() is 15, 12 then 27', JSON.stringify(qaida.groupCosts().map((p) => p.items)));
  check(rail().length === 3 && rail().every((b) => b.attrs.disabled === undefined), 'three parts, all enabled: nothing is locked');
  check(qaida.parts.map((p) => p.name).join('|') === 'How to stop|The signs|All together', 'the three parts are named by what is asked', qaida.parts.map((p) => p.name).join('|'));
  const panel = fs.readFileSync(path.join(dir, 'qaida-options.js'), 'utf8');
  const drillBranch = panel.slice(panel.indexOf("lesson.kind === 'drill'"), panel.indexOf("lesson.kind === 'exercise'"));
  const read = [...new Set([...drillBranch.matchAll(/\blesson\.(\w+)/g)].map((m) => m[1]))];
  const missing = read.filter((name) => !['setBand', 'bandTotals', 'setDrilled', 'onCosts'].includes(name) && !(name in qaida));
  check(read.length > 20 && missing.length === 0, `every window.qaida member the panel reads exists (${read.length} read)`, missing.join(', '));

  console.log('\nThe head');
  check($('h1').textContent === 'Stopping' && w.doc.title.startsWith('Lesson 22: Stopping'), 'the title', $('h1').textContent + ' / ' + w.doc.title);
  check($('.title-mark').textContent === cc(0x06DD, 0x0661), 'the big glyph is the end of a verse', cps($('.title-mark').textContent).join());
  check(all('.band-glyph').map((g) => g.textContent).join() === [1, 2, 3].map((n) => kit.sampleOf(n)).join(), 'the rail shows the end of a word, a sign, and two zabar at the end');
  check($('.eyebrow').textContent === 'Lesson 22 of 29' && all('.track li').length === 29 && all('.track li').findIndex((li) => li.classes().includes('now')) === 21, 'Lesson 22 of 29, the twenty-second of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '27', 'the bar\'s total is the twenty-seven', $('.bar').attrs['aria-valuemax']);

  console.log('\nThe board: three words, with how each is said at a stop, and nine lists');
  const strip = $('.seat-strip').querySelectorAll('.word-cell');
  check(strip.length === 3 && strip.every((t) => t.tag === 'button' && t.attrs['data-audio'] === undefined), 'the strip has three word tiles, and they say nothing when tapped: no recording exists yet');
  check($('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|') === 'A vowel at the end|Two fatha at the end|A round taa at the end', 'each is captioned with how it ends, in the student\'s own names', $('.seat-strip').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|'));
  const saids = $('.seat-strip').querySelectorAll('.word-said');
  check(saids.length === 3 && saids.every((s) => s.attrs['aria-hidden'] === 'true' && s.querySelector('.word-said-label').textContent === 'Said at a stop:'), 'and under each, labelled "Said at a stop:", how it is said', String(saids.length));
  check(saids.every((s, i) => s.querySelector('.word-said-glyph').children.map((u) => u.textContent).join('') === kit.saidOf(kit.samples()[i].ref, 'madani')) && saids.every((s, i) => s.querySelector('.word-said-glyph').textContent !== data[kit.samples()[i].ref].madani),
    'which is the composed stopped form, not the printed word');
  check(strip.map(unitsOfTile).every((u) => u.filter((x) => x.role === 'end').length >= 1 && u.filter((x) => x.role && x.role !== 'end').length === 0), 'each tile lights its end');
  const note = $('.seat-note').textContent;
  check(/verse ends with a round mark/.test(note) && !/\d/.test(note) && !/[{}]/.test(note), 'the line under them says where you may stop, with no number and no token left in it', note);
  check(wordRows().length === 9 && wordRows().map((r) => r.attrs['data-mark']).join() === 'vowel,tanween,fathatain,taa,long,must,better,either,no' && wordRows().map((r) => r.querySelectorAll('.word-cell').length).join() === '3,3,3,3,3,3,3,3,3', 'nine lists: five ways a word ends, four signs');
  const titles = $('.rule-grid').querySelectorAll('.rule-grid-title');
  check(titles.length === 9 && titles[0].textContent === 'A fatha, kasra or damma at the end' && titles[2].textContent === 'Two fatha at the end' && !/[{}]/.test($('.rule-grid').textContent), 'each list has a heading, in the student\'s own names, with no token left in it', titles[0].textContent);
  check(titles.slice(0, 5).every((t) => !t.querySelector('.rule-sign')) && titles.slice(5).every((t) => t.querySelector('.rule-sign') && t.querySelector('.rule-sign').attrs['aria-hidden'] === 'true')
    && titles[6].querySelector('.rule-sign').textContent === cc(TATWEEL, 0x06D7), 'a sign\'s list shows its sign, large and hidden from a screen reader; in Madani "better to stop" is the small "qalaa"');
  check(wordRows().map((r) => r.querySelector('.rule-name').textContent)[6] === 'a small “qalaa”' && wordRows().map((r) => r.querySelector('.rule-sound').textContent)[0] === 'said with a sukoon', 'the row names and what each shows, the script\'s own and the student\'s own word for the jazam');
  const later = () => gridTiles().filter((t) => t.attrs['data-state'] === 'later').length;
  check(later() === 12, 'part 1: the twelve sign words are dim, "comes later"; the map is all there', String(later()));
  qaida.setGroup(2);
  check(later() === 0 && gridTiles().length === 27, 'part 2: none dim (the stop words were met in part 1: dim is "comes later"), and the board has not changed shape', String(later()));
  qaida.setGroup(3);
  check(later() === 0, 'part 3: none dim', String(later()));
  qaida.setGroup(1);
  check(gridTiles().every((t) => /^[^.]+\. Verse \d+:\d+\.$/.test(t.attrs['aria-label'])), 'every word is named for a screen reader: its answer, and its verse', gridTiles()[0].attrs['aria-label']);
  check(gridTiles().every((t, i) => unitsOfTile(t).map((u) => u.text).join('') === data[forms[i].ref].madani), 'every one on the board is the copied text, character for character (in Madani)');
  check(gridTiles().every((t, i) => (forms[i].ask === 'sign' ? unitsOfTile(t).filter((u) => u.role === 'sign').length === 1 : unitsOfTile(t).some((u) => u.role === 'end'))), 'a stop word lights its end, a sign word its sign');

  console.log('\nThe board: the same-line and the script lines');
  check(/^At a stop the vowel on the last letter goes/.test($('.same-line').textContent) && /sukoon/.test($('.same-line').textContent), 'part 1 starts on the vowel row, in the student\'s own word for the jazam', $('.same-line').textContent);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'taa'));
  check(/^A round taa is said “h”/.test($('.same-line').textContent) && $('.word-row[data-current]').attrs['data-mark'] === 'taa', 'tapping a round taa word says how it ends, and its row is the one lit', $('.same-line').textContent);
  qaida.setGroup(2);
  check(/^A small meem/.test($('.same-line').textContent), 'part 2: the line moves to the first sign (the round taa row is not in part 2)', $('.same-line').textContent);
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'better'));
  check(/small “qalaa”/.test($('.same-line').textContent), 'tapping a better-to-stop word says the Madani sign in Madani', $('.same-line').textContent);
  qaida.setGroup(1);
  check(/^Madani prints its signs/.test($('.script-line').textContent) && !/Indo-Pak/.test($('.script-line').textContent) && $('.lead-line').hidden === true, 'the Madani student sees the Madani line, and no line about a font', $('.script-line').textContent);
  await w.setScript('indopak');
  check(/^Indo-Pak prints more signs/.test($('.script-line').textContent) && $('.lead-line').hidden === false && /stand-in/.test($('.lead-line').textContent), 'the Indo-Pak student sees the Indo-Pak line and the line about the stand-in font', $('.script-line').textContent);
  check($('.rule-grid').querySelectorAll('.rule-sign')[1].textContent === cc(TATWEEL, 0x0615) && wordRows()[6].querySelector('.rule-name').textContent === 'a small taa', 'and the better-to-stop list shows the small taa, by its own name');
  click(gridTiles().find((t) => t.attrs['data-mark'] === 'better'));
  check(/small taa/.test($('.same-line').textContent) && !/qalaa/.test($('.same-line').textContent), 'and its line names the small taa', $('.same-line').textContent);
  check(forms.every((f) => gridTiles().find((t) => t.attrs['data-id'] === f.ref).querySelector('.glyph').textContent === data[f.ref].indopak), 'Indo-Pak: every one on the board is the copied Indo-Pak text');
  check($('.seat-strip').querySelectorAll('.word-said-glyph').every((s, i) => s.textContent === kit.saidOf(kit.samples()[i].ref, 'indopak')), 'and the stopped forms under the three are the Indo-Pak ones');
  await w.setScript('madani');

  console.log('\nThe drill: how do you stop on this word?');
  qaida.clear();
  await sleep(20);
  check($('.ask').textContent === ASK.stop, 'part 1 asks "How do you stop on this word?"', $('.ask').textContent);
  let item = shown();
  check(Boolean(item) && item.askGroup === 'stop' && wordUnits().map((u) => u.textContent).join('') === data[item.ref].madani && $('.prompt-word').attrs['aria-hidden'] === 'true', 'the word is the copied text, hidden from a screen reader (the question and the answers carry it)');
  check(wordUnits().filter((u) => u.attrs['data-role'] === 'ask').length === 1 && wordUnits().findIndex((u) => u.attrs['data-role'] === 'ask') === kit.lastLetterAt(wordUnits().map((u) => u.textContent)) && wordUnits().every((u) => !u.classes().includes('tap')),
    'its last letter is lit, and nothing is a button');
  check(choices().length === 4 && choices().map((c) => c.textContent).sort().join('|') === 'Ends with a long ‘aa’|Ends with a sukoon|Ends with an ‘h’|Stays as it is', 'four answers: the four ways a word ends at a stop', choices().map((c) => c.textContent).join(' | '));
  answerRight();
  check($('.verdict').textContent === `Yes — ${item.name}.` && $('.seat-echo').hidden === true, 'right: "Yes — …", and no line under it', $('.verdict').textContent);
  await sleep(20);
  item = shown();
  answerWrong();
  check($('.verdict').textContent.startsWith('You chose “') && $('.verdict').textContent.endsWith(`This one is “${item.name}”.`) && !/“[^”]*“/.test($('.verdict').textContent),
    'wrong: says what was chosen and what it is, with no scolding (a name\'s own quotes are single, so they nest)', $('.verdict').textContent);
  const echoWords = $('.seat-echo').querySelectorAll('.seat-echo-word');
  check($('.seat-echo').hidden === false && echoWords.length === 2 && echoWords[0].children.map((u) => u.textContent).join('') === data[item.ref].madani && echoWords[1].children.map((u) => u.textContent).join('') === kit.saidOf(item.ref, 'madani')
    && $('.seat-echo').querySelector('.seat-echo-said').textContent === 'said', 'under it: the printed word, "said", and how it is said at a stop', String(echoWords.length));
  check($('.seat-echo').textContent.startsWith(sayJazam(echoOf(item.kind)).replace('{fatha}', 'fatha')), 'and the line for how it ends', $('.seat-echo').textContent);
  check(gridTiles().filter((t) => 'data-missed' in t.attrs).map((t) => t.attrs['data-id']).join() === item.ref && $('.word-row[data-current]').attrs['data-mark'] === item.mark, 'the word just missed keeps its gold edge on the board, and its row is lit');
  check($('.after').hidden === false && $('.after-name').textContent === item.name && $('.after-glyph').textContent === item.glyph, 'the strip under a miss names it and offers Hear it, Say it, Write it and Next');
  click($('.after .trace'));
  check(w.opened.length === 1 && w.opened[0][0] === item.glyph && w.opened[0][1] === 'this one', '"Write it" opens the writing board on the printed word');
  click($('.next-question'));
  await sleep(20);
  check($('.seat-echo').hidden === true && !gridTiles().some((t) => 'data-missed' in t.attrs), 'the next question clears the line and the gold edge');

  console.log('\nThe drill: what does the lit sign say?');
  qaida.setGroup(2);
  await sleep(10);
  check($('.ask').textContent === ASK.sign, 'part 2 asks "What does the lit sign say?"', $('.ask').textContent);
  item = shown();
  const lit = wordUnits().find((u) => u.attrs['data-role'] === 'ask');
  check(item.askGroup === 'sign' && wordUnits().filter((u) => u.attrs['data-role'] === 'ask').length === 1 && cps(lit.textContent).includes(kit.SIGNS[item.kind].madani), 'the word\'s sign is lit, and only it');
  check(choices().length === 4 && choices().map((c) => c.textContent).sort().join('|') === 'Always stop here|Better to stop|Do not stop here|Stop or go on', 'four answers: what each of the four signs says', choices().map((c) => c.textContent).join(' | '));
  answerWrong();
  check($('.seat-echo').querySelectorAll('.seat-echo-word').length === 1 && $('.seat-echo').querySelector('.seat-echo-word').children.filter((u) => u.attrs['data-role'] === 'sign').length === 1 && !$('.seat-echo').querySelector('.seat-echo-said'),
    'under a wrong answer: the word with its sign lit, and no stopped form');
  check($('.seat-echo').textContent.startsWith(item.kind === 'better' ? echoOf('better-madani') : echoOf(item.kind)), 'and the line says what the sign is and what it says', $('.seat-echo').textContent);
  click($('.next-question'));
  await sleep(20);

  console.log('\nThe drill: all together');
  qaida.setGroup(3);
  await sleep(10);
  const seen = { stop: 0, sign: 0 };
  let off = 0;
  for (let i = 0; i < 80; i += 1) {
    item = shown();
    if (!item) { off += 1; break; }
    seen[item.askGroup] += 1;
    if ($('.ask').textContent !== ASK[item.askGroup]) off += 1;
    const names = choices().map((c) => c.textContent);
    const own = new Set(kit.itemsFor(shell).filter((it) => it.askGroup === item.askGroup).map((it) => it.name));
    if (!names.every((n) => own.has(n))) off += 1;
    answerRight();
    if ($('.after').hidden === false) click($('.next-question'));
    else qaida.next();
    await sleep(3);
  }
  check(seen.stop >= 20 && seen.sign >= 20 && off === 0, 'part 3 mixes both questions, each with its own line and only its own answers', `${JSON.stringify(seen)} / ${off} off`);

  console.log('\nThe other script and the other names');
  await w.setScript('indopak');
  qaida.setGroup(2);
  await sleep(10);
  for (let i = 0; i < 40 && !(shown() && shown().kind === 'better'); i += 1) { qaida.next(); await sleep(3); }
  item = shown();
  check(item.kind === 'better' && cps(wordUnits().find((u) => u.attrs['data-role'] === 'ask').textContent).includes(0x0615), 'in Indo-Pak the better-to-stop word lights its small taa');
  answerWrong();
  check($('.seat-echo').textContent.startsWith(echoOf('better-indopak')), 'and a wrong answer names the small taa', $('.seat-echo').textContent);
  click($('.next-question'));
  await sleep(10);
  await w.setNames('zabar');
  qaida.setGroup(1);
  await sleep(10);
  check(choices().some((c) => c.textContent === 'Ends with a jazam') && $('.rule-grid').querySelectorAll('.rule-grid-title')[0].textContent === 'A zabar, zair or paish at the end', 'in the zabar set the answer says "jazam" and the headings say zabar, zair and paish');
  await w.setNames('fatha');
  await w.setScript('madani');

  console.log('\nFinishing');
  qaida.clear();
  await sleep(20);
  check(shell.isDone(22) === false, 'nothing is done to begin with');
  const master = (n) => {
    for (const f of forms.filter((x) => x.parts.includes(n))) for (let i = 0; i < 3; i += 1) shell.recordAnswer(22, kit.idOf(f), true);
  };
  master(1);
  qaida.render();
  await sleep(20);
  check(shell.isDone(22) === false && $('.ready-note').hidden === false, 'part 1 known: the part says you seem ready, and the lesson is not done (part 3 gates it)');
  master(3);
  qaida.setGroup(3);
  await sleep(20);
  check(shell.isDone(22) === true && $('.end-line').textContent.startsWith('You can stop on a word the way it is said'), 'every item known: the lesson is done, and says so', $('.end-line').textContent);
  check(shell.masteredCount(22) === 27 && shell.drillOf(22).total === 27, 'and the home\'s count and total are the twenty-seven', `${shell.masteredCount(22)} / ${shell.drillOf(22).total}`);
  qaida.clear();
  await sleep(20);
  check(shell.isDone(22) === false && shell.masteredCount(22) === 0, 'Start again clears it');

  console.log('\nThe walkthrough');
  const units = () => $('.spell-glyph').children.map((u) => u.textContent);
  const stepsOf = () => {
    const captions = [$('.spell-caption').textContent];
    while (!$('.spell-next').hidden && captions.length < 12) { click($('.spell-next')); captions.push($('.spell-caption').textContent); }
    return captions;
  };
  const [a, b, c] = kit.WALK;
  check(all('.word-step').length === 3 && units().join('') === data[a.ref].madani, 'three walkthrough words; the first is the copied word');
  const c1 = stepsOf();
  check(c1.length === 3 && c1[0] === `The word up to its last letter: “${a.sounds[0]}”.` && c1[1] === `At a stop the vowel on the last letter goes: “${a.sounds[1]}”.` && c1[2] === `Stopping on it, the whole word: ${a.whole}.`, 'word 1: the word up to its last letter, the last letter at a stop, the whole', c1.join(' / '));
  check($('.spell-meaning').textContent === `It means “${a.meaning}.”`, 'and the meaning shows on the last step');
  click($('.spell-nextword'));
  const c2 = stepsOf();
  check(units().join('') === data[b.ref].madani && c2[1] === `At a stop the tanween at the end is said as a long “aa”: “${b.sounds[1]}”.`, 'word 2: two zabar said as a long "aa"', c2.join(' / '));
  click($('.spell-nextword'));
  const c3 = stepsOf();
  check(units().join('') === data[c.ref].madani && c3[1] === `At a stop the round taa is said “h”: “${c.sounds[1]}”.`, 'word 3: the round taa said "h"', c3.join(' / '));

  console.log('\nThe ways out: Previous goes to Lesson 21, Next to Lesson 23 (not built yet)');
  check($('.prev').attrs.href === 'lesson-21.html' && $('.prev span').textContent === 'Previous: Letters that are not read', 'Previous goes to Lesson 21', $('.prev span').textContent);
  check($('.spell-more a').attrs.href === 'exercise-22.html' && fs.existsSync(path.join(dir, 'exercise-22.html')), 'Practice reading goes to exercise-22.html, which exists');
  check($('.next span').textContent === 'Next: Al-Fatiha' && !$('.next').attrs['data-last'], 'Next reads "Next: Al-Fatiha"', $('.next span').textContent);
  w.location.href = '';
  click($('.next'), 1);
  check(w.location.href === '' && /isn.t built yet/.test($('.note').textContent || ''), 'and it says so instead of going anywhere, until Lesson 23 exists', $('.note').textContent);

  console.log('\nThe home');
  const home = boot();
  const row = home.shell.LESSONS.find((l) => l.n === 22);
  check(row.built === true && row.href === 'lesson-22.html' && row.progress === 'drill' && row.part === 2 && row.cp === undefined && !row.tail, 'the home\'s row 22 is built, a drill, in the second part, with no `cp`, and leads to lesson-22.html');
  check(home.shell.LESSONS.find((l) => l.n === 21).built && !home.shell.LESSONS.find((l) => l.n === 23).built, 'and 21 is built and 23 is not');

  console.log('\nThe markup');
  check(!NOMARK.test(w.raw), 'lesson-22.html holds no literal combining mark');
  check(!/[ء-ي]/.test(w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<dialog class="chooser"[\s\S]*?<\/dialog>/, '')), 'and no Arabic on the lesson itself: every word is copied into rule-words.js and drawn by rule-lesson.js');
  check(/&#x6DD;&#x661;</.test(w.raw), 'the title glyph is the end of a verse, as numeric references');
  const at = (file) => w.raw.indexOf(`<script src="${file}" defer></script>`);
  check(at('rules.js') > 0 && at('rules.js') < at('rule-words.js') && at('rule-words.js') < at('stop.js') && at('stop.js') < at('rule-lesson.js') && at('spell.js') > at('rule-lesson.js') && ['ends.js', 'al.js', 'wasl.js', 'madd.js', 'silent.js'].every((f) => at(f) === -1),
    'the scripts load in order: rules.js, rule-words.js, stop.js, then the page\'s code and spell.js (no other kit is needed here)');
  const visible = w.raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/data-rule="[^"]*"/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|leen|qalqalah|idgham|ikhfa|izhar|ghunna|tajweed|madd|waqf)\b/i.test(visible), 'no scolding and no tajweed word on the page (the plain-names rule; docs/pass-2/03 §4)');
  check(!/\b(ar-raheem|rahmah|'aleem)\b/.test(visible), 'and no transliteration outside the walkthrough (it stays off, docs/pass-2/02 §2)');
  check((w.raw.match(/data-words(-attr)?=/g) || []).length > 60, 'every line of wording is a text field (data-words / data-words-attr)');
  check([...w.raw.matchAll(/data-words-attr="([^"]*)"/g)].every((m) => m[1].split(';').every((pair) => pair.includes('|'))), 'and every data-words-attr entry is "attribute|label"');
  const boardTag = w.raw.match(/<section class="marks-board[\s\S]*?>\s*<div class="section-head">/)[0];
  const boardAttrs = [...boardTag.matchAll(/\s(data-[\w-]+)="/g)].map((m) => m[1]).filter((x) => x !== 'data-words-attr');
  const boardFields = boardTag.match(/data-words-attr="([^"]*)"/)[1].split(';').map((p) => p.split('|')[0]);
  check(boardAttrs.every((x) => boardFields.includes(x)) && boardFields.every((x) => boardAttrs.includes(x)), 'every line of the board\'s wording has its own text field, and no field is for a line that is not there', boardAttrs.filter((x) => !boardFields.includes(x)).concat(boardFields.filter((x) => !boardAttrs.includes(x))).join(', '));
  const numbered = [...boardTag.matchAll(/\s(data-(?:same|seat|script|title|row|sound|sample|said)[\w-]*)="([^"]*)"/g)].filter((m) => /\d/.test(m[2])).map((m) => m[1]);
  check(numbered.length === 0, 'no number is on the board, in any line of it', numbered.join(', '));
  for (const [name, re] of [['the spell block', /<section class="spell"[\s\S]*?>\s*<div class="section-head">/], ['the question', /<p class="ask"[\s\S]*?><\/p>/], ['the question\'s word', /<div class="prompt"[\s\S]*?>\s*<\/div>/],
    ['the echo line', /<p class="seat-echo"[\s\S]*?><\/p>/], ['the verdict', /<p class="verdict"[\s\S]*?><\/p>/], ['the advice', /<div class="advice"[\s\S]*?>\s*<div class="struggle"/], ['the names', /<span hidden\s[\s\S]*?><\/span>/]]) {
    const tag = w.raw.match(re)[0];
    const attrs = [...tag.matchAll(/\s(data-[\w-]+)="/g)].map((m) => m[1]).filter((x) => x !== 'data-words-attr');
    const fields = (tag.match(/data-words-attr="([^"]*)"/) || ['', ''])[1].split(';').map((p) => p.split('|')[0]);
    check(attrs.every((x) => fields.includes(x)), `every line of ${name} has its own text field`, attrs.filter((x) => !fields.includes(x)).join(', '));
  }
  check(STOP_KINDS.every((k) => new RegExp(`data-line-${k}="[^"]+"`).test(w.raw)) && ['must', 'either', 'no', 'better-madani', 'better-indopak'].every((k) => new RegExp(`data-line-${k}="[^"]+"`).test(w.raw)),
    'the echo has a line for each way a word ends, for each sign, and one a script for the sign that differs');

  console.log('\nThe reading page');
  let ex;
  try {
    ex = run('exercise-22.html', ['shell.js', 'marks.js', 'rules.js', 'rule-words.js', 'stop.js', 'exercise.js'], { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against exercise-22.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  await sleep(20);
  const cells = () => ex.all('.mashq-word');
  check(cells().length === 12 && ex.ctx.qaida.kind === 'exercise' && ex.ctx.qaida.count === 12, 'exercise-22.html has twelve words');
  check(/data-rule="stop"/.test(ex.raw) && !/data-mark=/.test(ex.raw) && /href="lesson-22\.html"/.test(ex.raw) && /data-next-fatha="Next: Al-Fatiha"/.test(ex.raw) && !/data-last/.test(ex.raw), 'it teaches the stop rule, goes back to Lesson 22 and on to Lesson 23');
  check(/^Twelve of the Qur’an’s own words, each a place to stop/.test(ex.$('.exercise-lede').textContent), 'its line says so', ex.$('.exercise-lede').textContent);
  const wordText = () => cells().map((cell) => cell.children.find((k) => k.attrs.lang === 'ar').textContent);
  check(wordText().join('|') === kit.READING.map((ref) => data[ref].madani).join('|'), 'in Madani the twelve are the copied Madani text, in the order stop.js lists them, character for character');
  await ex.setScript('indopak');
  check(wordText().join('|') === kit.READING.map((ref) => data[ref].indopak).join('|'), 'in Indo-Pak, the copied Indo-Pak text');
  check(!NOMARK.test(ex.raw), 'and exercise-22.html holds no literal combining mark');
}

pageHalf().then(() => {
  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
});
