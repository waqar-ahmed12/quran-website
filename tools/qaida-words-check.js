// Checks every word spell.js and exercise.js hold, for every lesson, without a browser (docs/lesson-8/06 §3,
// recommended). The rule "built only from marks the student has met" is written in both files' comments and was
// checked nowhere until now: this loads the real WORDS tables (window.qaidaSpellWords / window.qaidaExerciseWords,
// exposed for exactly this) and proves every letter is one of the 29, every mark used has a lesson number at most
// the page's own, and the walkthrough has three words and the exercise twelve, on every lesson that has either.
//
//   node tools/qaida-words-check.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.join(__dirname, '..', 'site', 'qaida');
let failed = 0;
const check = (ok, what, extra = '') => {
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${extra ? `  (${extra})` : ''}`);
};

// A DOM with none of the elements spell.js or exercise.js draw into, so both set their exports and return before
// touching anything: the data is checked on its own, with no page.
const ctx = vm.createContext({
  document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem: () => {} },
  setTimeout,
  clearTimeout,
  console,
});
ctx.window = ctx;

const load = (file) => vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file });
try {
  load('shell.js');
  load('marks.js');
  load('rules.js');
  load('ends.js');
  load('spell.js');
  load('exercise.js');
} catch (error) {
  check(false, 'shell.js, marks.js, rules.js, ends.js, spell.js and exercise.js load without a page, without an error', error.stack.split('\n').slice(0, 5).join(' | '));
  process.exit(1);
}
check(true, 'shell.js, marks.js, rules.js, ends.js, spell.js and exercise.js load without a page, without an error');

const shell = ctx.qaidaShell;
const marks = ctx.qaidaMarks;
const rules = ctx.qaidaRules;
const spellWords = ctx.qaidaSpellWords;
const exerciseWords = ctx.qaidaExerciseWords;
check(Boolean(spellWords), 'spell.js exposes window.qaidaSpellWords');
check(Boolean(exerciseWords), 'exercise.js exposes window.qaidaExerciseWords');

// The 29 valid keys, in the Madani form every root pair is written in (docs/lesson-4/02 §2: an id folds to Madani).
const VALID_KEYS = new Set(shell.lettersOf('madani').map(([glyph]) => shell.keyOf(glyph)));

// A word is [[key, markId], ...], right to left. One check for its keys and one for its marks, not one per letter
// (the point is the word, not each character in it): every key is one of the 29, every mark is real, and every
// mark's own lesson is at most `maxLesson` — a word must never lean on a mark the student has not met yet.
// Lesson 14's three structural rules for a jazam (docs/lesson-14/03 §7), on every word of every lesson: never on a word's
// first letter (a word cannot begin with a closed syllable), never right after another jazam (two closed letters in a row
// are a tajweed matter, not this pass's), and never on alif (always long or silent, never a closed consonant). Returns
// the reason a word breaks one, or '' when it keeps all three.
function badSukun(root) {
  for (let i = 0; i < root.length; i += 1) {
    if (root[i][1] !== 'sukun') continue;
    if (i === 0) return 'a jazam on the first letter';
    if (root[i - 1][1] === 'sukun') return 'a jazam right after another jazam';
    if (root[i][0] === 'ا') return 'a jazam on alif';
  }
  return '';
}

// Lesson 15's two rules for a shadda (docs/lesson-15/03 §6), on every word of every lesson: never on a word's first letter
// (that is the article's shadda, Lesson 18, in copied Qur'an words) and never on alif (an alif is never doubled).
function badShadda(root) {
  for (let i = 0; i < root.length; i += 1) {
    if (!root[i][1].startsWith('shadda')) continue;
    if (i === 0) return 'a shadda on the first letter';
    if (root[i][0] === 'ا') return 'a shadda on alif';
  }
  return '';
}

// Lesson 16's rules for a hamza (docs/lesson-16/05 §3), on every word of every lesson. A seat key (the four seats that are
// not letters of the 29: an alif seat, the alif seat with zair, a wow seat, a yaa seat) is only ever written with one of the
// fifteen forms of its seat; the Madani alif seat with zair goes with a zair and no other mark, and the other alif seat never
// takes one. (A hamza with a jazam after nothing at all is the jazam rule above: badSukun.) Returns the reason a word breaks
// one, or '' when it keeps them. The hamza on the line is the ordinary letter, so any mark row of an earlier lesson may go on it.
const SEAT_OF = { 0x0623: 'alif', 0x0625: 'alif', 0x0624: 'wow', 0x0626: 'yaa' };
const isSeatKey = (key) => key.length === 1 && key.charCodeAt(0) in SEAT_OF;
function badHamza(root) {
  const forms = rules.formsOf();
  for (const [key, id] of root) {
    if (!isSeatKey(key)) continue;
    const seat = SEAT_OF[key.charCodeAt(0)];
    if (!forms.some((form) => form.seat === seat && form.mark === id)) return `${seat} with ${id} is not one of the fifteen forms`;
    if (key.charCodeAt(0) === 0x0625 && id !== 'kasra') return 'the alif seat with zair goes with a zair only';
    if (key.charCodeAt(0) === 0x0623 && id === 'kasra') return 'the alif seat with a zair is the one that sits below the alif';
  }
  return '';
}

// Lesson 17's rules for a round taa and an end yaa (docs/lesson-17/01 §6), on every word of every lesson. Neither is one of the 29, so
// a word writes them as their own keys (ة, ى). A round taa is only ever the LAST letter and only ever after a zabar (or the alif a
// zabar takes), and carries one of the six marks a word ends in; an end yaa is only ever the LAST letter, read "ee" after a zair or
// "aa" after a zabar and never after a long vowel or a doubled one (a zabar with shadda is fine: حَتَّى). Returns the reason a word
// breaks one, or '' when it keeps them.
const TAA_KEY = String.fromCharCode(0x0629);
const YAA_KEY = String.fromCharCode(0x0649);
const isEndKey = (key) => key === TAA_KEY || key === YAA_KEY;
const TAA_MARKS = ['fatha', 'kasra', 'damma', 'fathatain', 'kasratain', 'dammatain'];
function badEnds(root) {
  for (let i = 0; i < root.length; i += 1) {
    const [key, id] = root[i];
    if (!isEndKey(key)) continue;
    const before = i > 0 ? root[i - 1][1] : '';
    if (i !== root.length - 1) return 'an end shape that is not the last letter';
    if (i === 0) return 'an end shape on its own';
    if (key === TAA_KEY) {
      if (!TAA_MARKS.includes(id)) return `a round taa with ${id}, which is not one of its six marks`;
      if (!['fatha', 'fatha-alif', 'shadda-fatha'].includes(before)) return `a round taa after ${before}, not a zabar`;
    } else {
      if (id !== 'ee' && id !== 'aa') return `an end yaa with ${id}`;
      if (id === 'ee' && !['kasra', 'shadda-kasra'].includes(before)) return `a long "ee" yaa after ${before}, not a zair`;
      if (id === 'aa' && !['fatha', 'shadda-fatha'].includes(before)) return `a long "aa" yaa after ${before}, not a zabar`;
    }
  }
  return '';
}

// A word as a script draws it, from the same pieces the page uses (a seat through rules.seatOf, a letter through the
// script's own list, then the mark's drawn code points). Used to prove that no Indo-Pak word holds a Madani alif seat.
function drawn(root, script) {
  const names = new Map(shell.lettersOf(script).map(([glyph]) => [shell.keyOf(glyph), glyph]));
  if (rules.hasEnd(root)) return rules.wordUnits(root, (key) => names.get(key) || key, script).join('');
  return root.map(([key, id]) => {
    const seat = rules.seatOf(key, script);
    if (seat) return seat + marks.drawnOf(marks.markOf(id), script);
    return marks.glyphOf(names.get(key) || key, marks.markOf(id), script);
  }).join('');
}

function checkWord(root, maxLesson, label) {
  const broken = badSukun(root);
  check(!broken, `${label}: keeps the three jazam rules`, broken);
  const doubled = badShadda(root);
  check(!doubled, `${label}: keeps the two shadda rules`, doubled);
  const seated = badHamza(root);
  check(!seated, `${label}: keeps the hamza rules`, seated);
  const ended = badEnds(root);
  check(!ended, `${label}: keeps the round taa and end yaa rules`, ended);
  if (root.some(([key]) => isSeatKey(key))) {
    const indopak = drawn(root, 'indopak');
    check(!indopak.includes(String.fromCharCode(0x0623)) && !indopak.includes(String.fromCharCode(0x0625)), `${label}: its Indo-Pak drawing holds no Madani alif seat`);
    check(drawn(root, 'madani').split('').some((c) => [0x0623, 0x0625, 0x0624, 0x0626].includes(c.charCodeAt(0))), `${label}: and its Madani drawing does hold a seat`);
  }
  const badKey = root.find(([key]) => !VALID_KEYS.has(key) && !isSeatKey(key) && !isEndKey(key));
  check(!badKey, `${label}: every letter is one of the 29, a hamza seat, a round taa or an end yaa`, badKey ? badKey[0] : '');
  const badMark = root.find(([key, markId]) => !marks.markOf(markId) && !(key === YAA_KEY && (markId === 'ee' || markId === 'aa')));
  check(!badMark, `${label}: every mark used is a real one`, badMark ? badMark[1] : '');
  const tooLate = root.filter(([, markId]) => marks.markOf(markId)).find(([, markId]) => marks.markOf(markId).lesson > maxLesson);
  check(!tooLate, `${label}: every mark's own lesson is at most ${maxLesson}`, tooLate ? `${tooLate[1]} is lesson ${marks.markOf(tooLate[1]).lesson}` : '');
}

console.log('\nspell.js: the walkthrough, three words a lesson');
for (const [markId, entries] of Object.entries(spellWords)) {
  // A single mark's own id (lessons 4-6, 8), a SET's (Lesson 9's "standing" — marks.markOf is null for a set) or a RULE's (Lesson 16's "hamza").
  const mark = marks.markOf(markId) || marks.setOf(markId) || rules.RULES[markId];
  if (!mark) { check(false, `spell.js's "${markId}" key is a real mark or set`); continue; }
  check(entries.length === 3, `Lesson ${mark.lesson} (${markId}) has three words`, String(entries.length));
  entries.forEach((entry, i) => {
    const label = `Lesson ${mark.lesson} (${markId}), word ${i + 1}`;
    check(Array.isArray(entry.root) && entry.root.length >= 2, `${label}: at least two letters`, String(entry.root && entry.root.length));
    check(Array.isArray(entry.syll) && entry.syll.length === entry.root.length, `${label}: one syllable per root letter`);
    check(typeof entry.meaning === 'string' && entry.meaning.length > 0, `${label}: has a meaning`);
    checkWord(entry.root, mark.lesson, label);
  });
}

console.log('\nexercise.js: the reading page, twelve words a lesson');
for (const [markId, words] of Object.entries(exerciseWords)) {
  const mark = marks.markOf(markId) || marks.setOf(markId) || rules.RULES[markId];
  if (!mark) { check(false, `exercise.js's "${markId}" key is a real mark or set`); continue; }
  check(words.length === 12, `Lesson ${mark.lesson} (${markId}) has twelve words`, String(words.length));
  words.forEach((root, i) => {
    const label = `Lesson ${mark.lesson} (${markId}), word ${i + 1}`;
    check(Array.isArray(root) && root.length >= 2, `${label}: at least two letters`, String(root && root.length));
    checkWord(root, mark.lesson, label);
  });
}

// The rules have to be able to fail: a deliberately bad word for each of the three (docs/lesson-14/06 §3).
console.log('\nThe jazam rules catch what they are for');
check(badSukun([['ب', 'sukun'], ['ت', 'fatha']]) !== '', 'a jazam on the first letter is caught');
check(badSukun([['ك', 'fatha'], ['ت', 'sukun'], ['ب', 'sukun']]) !== '', 'a jazam right after another jazam is caught');
check(badSukun([['ب', 'fatha'], ['ا', 'sukun'], ['ت', 'fatha']]) !== '', 'a jazam on alif is caught');
check(badSukun([['ق', 'fatha'], ['ل', 'sukun'], ['ب', 'dammatain']]) === '', 'and a good word (qalbun) passes');

console.log('\nThe shadda rules catch what they are for');
check(badShadda([['ب', 'shadda-fatha'], ['ت', 'fatha']]) !== '', 'a shadda on the first letter is caught');
check(badShadda([['ب', 'fatha'], ['ا', 'shadda-fatha'], ['ت', 'fatha']]) !== '', 'a shadda on alif is caught');
check(badShadda([['م', 'fatha'], ['ر', 'shadda-fatha']]) === '', 'and a good word (marra) passes');

console.log('\nThe hamza rules catch what they are for');
check(badHamza([['ب', 'fatha'], ['ؤ', 'kasra']]) !== '', 'a wow seat with zair (not one of the fifteen) is caught');
check(badHamza([['ب', 'fatha'], ['ئ', 'damma']]) !== '', 'a yaa seat with paish (not one of the fifteen) is caught');
check(badHamza([['أ', 'kasra'], ['ب', 'fatha']]) !== '', 'the alif seat with a zair written above the alif is caught');
check(badHamza([['إ', 'fatha'], ['ب', 'fatha']]) !== '', 'and the below-form alif seat with a zabar');
check(badHamza([['س', 'fatha'], ['أ', 'fatha'], ['ل', 'fatha']]) === '' && badHamza([['ب', 'kasra'], ['ئ', 'sukun'], ['ر', 'dammatain']]) === '', 'and good words (sa\'ala, bi\'run) pass');
check(badHamza([['ش', 'fatha-yaa'], ['ء', 'dammatain']]) === '', 'the line takes any mark row: shay\'un has two paish on it');
check(badSukun([['أ', 'sukun'], ['ب', 'fatha']]) !== '', 'a hamza with a jazam on the first letter is caught, by the jazam rule');

console.log('\nThe round taa and end yaa rules catch what they are for');
check(badEnds([[TAA_KEY, 'dammatain'], ['ب', 'fatha']]) !== '', 'a round taa that is not the last letter is caught');
check(badEnds([['ب', 'kasra'], [TAA_KEY, 'dammatain']]) !== '', 'a round taa after a zair is caught');
check(badEnds([['ب', 'fatha'], [TAA_KEY, 'sukun']]) !== '', 'a round taa with a jazam is caught (not one of its six marks)');
check(badEnds([['ب', 'fatha'], [YAA_KEY, 'ee']]) !== '', 'a long "ee" yaa after a zabar is caught');
check(badEnds([['ب', 'kasra'], [YAA_KEY, 'aa']]) !== '', 'a long "aa" yaa after a zair is caught');
check(badEnds([['ب', 'fatha'], [YAA_KEY, 'fatha']]) !== '', 'an end yaa with a real mark in place of ee or aa is caught');
check(badEnds([['ر', 'fatha'], ['ح', 'sukun'], ['م', 'fatha'], [TAA_KEY, 'dammatain']]) === ''
  && badEnds([['ع', 'fatha'], ['ل', 'fatha'], [YAA_KEY, 'aa']]) === '' && badEnds([['ف', 'kasra'], [YAA_KEY, 'ee']]) === '', 'and good words (rahmatun, \'alaa, fii) pass');
check(badEnds([['ح', 'fatha'], ['ي', 'fatha-alif'], [TAA_KEY, 'dammatain']]) === '', 'a round taa after the alif a zabar takes is fine (hayaatun)');

console.log('\nBoth files agree on which lessons have words');
check(Object.keys(spellWords).sort().join() === Object.keys(exerciseWords).sort().join(),
  'spell.js and exercise.js cover exactly the same lessons', `${Object.keys(spellWords).sort().join()} / ${Object.keys(exerciseWords).sort().join()}`);

console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
process.exitCode = failed;
