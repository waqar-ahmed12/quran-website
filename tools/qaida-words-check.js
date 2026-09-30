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
  load('spell.js');
  load('exercise.js');
} catch (error) {
  check(false, 'shell.js, marks.js, spell.js and exercise.js load without a page, without an error', error.stack.split('\n').slice(0, 5).join(' | '));
  process.exit(1);
}
check(true, 'shell.js, marks.js, spell.js and exercise.js load without a page, without an error');

const shell = ctx.qaidaShell;
const marks = ctx.qaidaMarks;
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

function checkWord(root, maxLesson, label) {
  const broken = badSukun(root);
  check(!broken, `${label}: keeps the three jazam rules`, broken);
  const doubled = badShadda(root);
  check(!doubled, `${label}: keeps the two shadda rules`, doubled);
  const badKey = root.find(([key]) => !VALID_KEYS.has(key));
  check(!badKey, `${label}: every letter is one of the 29`, badKey ? badKey[0] : '');
  const badMark = root.find(([, markId]) => !marks.markOf(markId));
  check(!badMark, `${label}: every mark used is a real one`, badMark ? badMark[1] : '');
  const tooLate = root.filter(([, markId]) => marks.markOf(markId)).find(([, markId]) => marks.markOf(markId).lesson > maxLesson);
  check(!tooLate, `${label}: every mark's own lesson is at most ${maxLesson}`, tooLate ? `${tooLate[1]} is lesson ${marks.markOf(tooLate[1]).lesson}` : '');
}

console.log('\nspell.js: the walkthrough, three words a lesson');
for (const [markId, entries] of Object.entries(spellWords)) {
  // A single mark's own id (lessons 4-6, 8) or a SET's (Lesson 9's "standing" — marks.markOf is null for a set).
  const mark = marks.markOf(markId) || marks.setOf(markId);
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
  const mark = marks.markOf(markId) || marks.setOf(markId);
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

console.log('\nBoth files agree on which lessons have words');
check(Object.keys(spellWords).sort().join() === Object.keys(exerciseWords).sort().join(),
  'spell.js and exercise.js cover exactly the same lessons', `${Object.keys(spellWords).sort().join()} / ${Object.keys(exerciseWords).sort().join()}`);

console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
process.exitCode = failed;
