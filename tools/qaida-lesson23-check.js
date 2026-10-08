// Checks for Lesson 23, the first VERSE page: its data layer (verse-words.js, copied by tools/fetch-qaida-verses.js), its kit (fatiha.js: which notes a word
// carries, and the three words spelled through) and, below them, the page (verses.js against the real lesson-23.html in a small hand-made DOM).
// QAIDA-BUILD.md step P3; docs/lesson-23/02 §3.
//
//   node tools/qaida-lesson23-check.js
//
// The data half loads the real shell.js, marks.js, verse-words.js and fatiha.js into a scratch context with an in-memory stand-in for localStorage, as
// tools/qaida-lesson22-check.js does. The page half is at the foot of this file.
//
// The same limits as every other page check: nothing is drawn and no CSS runs, so it cannot tell how a face draws a verse, whether the verse-end sign
// encloses its number, or whether a mark touches the line above. Those were measured in the browser pane at the build (docs/lesson-23/02 §3; §4 is the
// user's list). What it proves is what only a script can: that the copy is exact and untouched (its hash), that it holds nothing a student could see as a
// box, that every note is TRUE of the word it is on in both scripts and no mark in a word goes unexplained, that every lesson a note points to is the
// one that taught it, that the words spelled through are cut without losing a letter, and that the page does what it says. Prints PASS or FAIL per
// check; the exit code is the number that failed.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const dir = path.join(__dirname, '..', 'site', 'qaida');
let failed = 0;
const check = (ok, what, extra = '') => {
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${extra ? `  (${extra})` : ''}`);
};

function boot(saved, files = ['shell.js', 'marks.js', 'verse-words.js', 'fatiha.js']) {
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
  return { shell: ctx.qaidaShell, marks: ctx.qaidaMarks, data: ctx.qaidaVerseWords, surahs: ctx.qaidaSurahs, store, ctx };
}

const cps = (text) => [...text].map((c) => c.codePointAt(0));
const SCRIPTS = ['madani', 'indopak'];
const COUNTS = [4, 4, 2, 3, 4, 3, 9]; // the words of each of the seven verses, Quran.com's count (the basmala is verse 1)
const REF_RE = /['"](\d{1,3}:\d{1,3}:\d{1,3})['"]/g;
const isPrivate = (c) => c >= 0xE000 && c <= 0xF8FF;
// What a word may hold: a letter of the Arabic block, the alif wasla, a tatweel, the marks of the Qur'an (U+0610-061A, U+064B-065F, U+0670, U+06D6-06ED), and the
// spaces and invisible marks Indo-Pak may put after a verse's last word, and the private-use signs Quran.com's Indo-Pak text carries (the page leaves those out when it draws). Nothing that is not Arabic.
const okChar = (c) => (c >= 0x0621 && c <= 0x064A) || c === 0x0671 || c === 0x0640 || (c >= 0x0610 && c <= 0x061A) || (c >= 0x064B && c <= 0x065F)
  || c === 0x0670 || (c >= 0x06D6 && c <= 0x06ED) || [0x20, 0x200B, 0x2002, 0x200F].includes(c) || c === 0x06CC || c === 0x06AA || isPrivate(c);

console.log('The data layer: verse-words.js');
{
  const { data } = boot();
  const surah = data.surahs['1'];
  const text = fs.readFileSync(path.join(dir, 'verse-words.js'), 'utf8');
  check(Boolean(surah) && surah.count === 7 && surah.verses.length === 7, 'Al-Fatiha is in it, with seven verses', surah ? String(surah.verses.length) : 'missing');
  check(surah.verses.every((v, i) => v.key === `1:${i + 1}`) && surah.verses.map((v) => v.words.length).join() === COUNTS.join(), 'the verses are 1:1 to 1:7 in order, of 4, 4, 2, 3, 4, 3 and 9 words (29)', surah.verses.map((v) => v.words.length).join());
  check(surah.verses.every((v) => v.words.every((w, i) => w.position === i + 1 && w.madani && w.indopak)), 'every word has its position and both scripts, in place');
  const hash = crypto.createHash('sha256').update(JSON.stringify(data.surahs)).digest('hex');
  check(hash === data.hash, 'the saved surahs match the hash the fetch tool wrote: nothing has been edited by hand', hash.slice(0, 12));
  check(!/[^\x00-\x7f]/.test(text.replace(/^\/\/.*$/gm, '')), 'the copied data is ASCII with \\u escapes: a combining mark is never a character you cannot see in a diff');
  check(/DO NOT EDIT BY HAND/.test(text.split('\n')[0]) && /unmodified/.test(data.source), 'the file says it is copied and unmodified');
  const privateAt = [];
  let badChars = 0;
  let empty = 0;
  for (const v of surah.verses) {
    for (const w of v.words) {
      for (const script of SCRIPTS) {
        const c = cps(w[script]);
        if (c.some(isPrivate)) privateAt.push(`${v.key}:${w.position} ${script}`);
        if (!c.every(okChar)) badChars += 1;
        if (w[script].trim() !== w[script] && !/[​ ‏]$/.test(w[script])) empty += 1;
      }
    }
  }
  check(privateAt.join() === '1:7:4 indopak,1:7:9 indopak', 'the only private-use characters in the copy are the two Quran.com puts inside Indo-Pak words (1:7:4 and 1:7:9); the page draws them without (see the page half), and the verse-end signs are not saved', privateAt.join(' | '));
  check(badChars === 0, 'every word holds only Arabic letters, tatweel, the marks of the Qur\'an, the invisible marks Indo-Pak puts after a verse\'s last word, and those private-use signs', String(badChars));
  const fetchTool = fs.readFileSync(path.join(__dirname, 'fetch-qaida-verses.js'), 'utf8');
  check(/const SURAHS = \[1\]/.test(fetchTool) && /char_type_name === 'word'/.test(fetchTool) && /createHash\('sha256'\)/.test(fetchTool), 'the fetch tool reads Al-Fatiha, keeps only the words (not the verse-end sign) and writes the hash');
  check(surah.name === 'Al-Fatihah', 'the surah\'s name is the one Quran.com sends', surah.name);
}

console.log('\nThe kit: fatiha.js, the notes and the words spelled through');
{
  const { data, surahs, shell, marks } = boot();
  const kit = surahs['1'];
  const surah = data.surahs['1'];
  const unitsOf = surahs.unitsOf;
  const kitSource = fs.readFileSync(path.join(dir, 'fatiha.js'), 'utf8');
  const html = fs.readFileSync(path.join(dir, 'lesson-23.html'), 'utf8');
  const words = new Map();
  for (const v of surah.verses) for (const w of v.words) words.set(`${v.key}:${w.position}`, { ...w, verse: v });

  check(!/[؀-ۿ]/.test(kitSource) && !/[ً-ْٰۡ]/.test(kitSource), 'fatiha.js holds no Arabic and no combining mark: every word is a reference (docs/pass-2/02 §3)');
  const named = new Set([...kitSource.matchAll(REF_RE)].map((m) => m[1]));
  check([...named].every((ref) => words.has(ref)), `every reference fatiha.js names (${named.size}) is a word of verse-words.js`, String(named.size));
  check(Object.keys(kit.notes).length === 29 && [...words.keys()].every((ref) => kit.notes[ref] && kit.notes[ref].length > 0), 'every one of the 29 words has at least one note');
  check(kit.lesson === 23, 'the kit says it is Lesson 23');

  // Unit splitting: a letter with every mark on it, never a mark alone, and the units joined are the word exactly.
  let lone = 0;
  let lost = 0;
  for (const w of words.values()) {
    for (const script of SCRIPTS) {
      const u = unitsOf(w[script]);
      if (u.join('') !== w[script]) lost += 1;
      if (u.some((unit) => !/^\p{Lo}/u.test(unit))) lone += 1;
    }
  }
  check(lost === 0 && lone === 0, 'the units of every word, joined, are its text exactly, and every unit starts with a letter (no mark alone), in both scripts', `${lost} lost, ${lone} lone`);

  // A note is listed once for a word and SHOWN only where it is true of the word in the student's script ([kind, vowel] for the kinds that name a vowel).
  // So: every note listed is true in at least one script (none is idle), and what a script shows is true of its own text by construction of the page, which
  // the page half runs. Here, the other half: nothing a script's text carries goes without its note.
  const problems = [];
  const why = (ref, script, message) => problems.push(`${ref} ${script}: ${message}`);
  const entries = (ref) => kit.notes[ref].map((e) => [].concat(e));
  const shownIn = (ref, script) => entries(ref).filter(([kind, arg]) => kit.kinds[kind].has(words.get(ref)[script], script, arg));
  for (const [ref, w] of words) {
    for (const [kind, arg] of entries(ref)) {
      const info = kit.kinds[kind];
      if (!info) { why(ref, '-', `no such kind ${kind}`); continue; }
      if (!SCRIPTS.some((script) => info.has(w[script], script, arg))) why(ref, 'both', `${kind}${arg ? ` ${arg}` : ''} is true of the word in neither script`);
    }
  }
  check(problems.length === 0, 'every note listed for a word is true of it in at least one script (none is idle)', problems.slice(0, 8).join(' | '));
  const noKind = Object.values(kit.notes).flat().map((e) => [].concat(e)[0]).filter((k) => !kit.kinds[k]);
  check(noKind.length === 0, 'every note is a kind the kit knows');
  check(SCRIPTS.every((script) => [...words.keys()].every((ref) => shownIn(ref, script).length > 0)), 'and every word shows at least one note, in both scripts');

  // No mark goes unexplained: a word that has a feature, in a script, shows the note for it there. (Position and later lessons are handled apart.)
  const FEATURE = ['standing', 'zabarWaw', 'longOo', 'zabarYaa', 'longEe', 'longAa', 'jazam', 'shadda', 'madd', 'heavy', 'sign'];
  const unexplained = [];
  for (const [ref, w] of words) {
    for (const script of SCRIPTS) {
      const kinds = shownIn(ref, script).map((e) => e[0]);
      for (const kind of FEATURE) {
        const has = kit.kinds[kind].has(w[script], script);
        // a shadda is also explained by Al- before a sun letter and by the name of Allah, which say it in their own lines
        const said = kinds.includes(kind) || (kind === 'shadda' && (kinds.includes('sun') || kinds.includes('allah')));
        if (has && !said) unexplained.push(`${ref} ${script} ${kind}`);
      }
    }
  }
  check(unexplained.length === 0, 'no mark goes unexplained: a shadda, a jazam, a standing mark, a wavy line, a long vowel, a stop sign, a heavy letter, each shows its note in the script that prints it', unexplained.slice(0, 8).join(' | '));

  // The article, the joining alif, the hamza and the stop: by position and by the word's own beginning.
  const bad = [];
  for (const [ref, w] of words) {
    const kinds = entries(ref).map((e) => e[0]);
    const [s, v, p] = ref.split(':').map(Number);
    const last = p === w.verse.words.length;
    if (last !== kinds.includes('stop')) bad.push(`${ref} stop`);
    for (const script of SCRIPTS) {
      const first = unitsOf(w[script])[0];
      const startsAlif = script === 'madani' ? cps(first)[0] === 0x0671 : false;
      if (script === 'madani') {
        if (startsAlif !== (kinds.includes('joined') || kinds.includes('start'))) bad.push(`${ref} joined/start`);
        if (startsAlif && (p === 1) !== kinds.includes('start')) bad.push(`${ref} start by position`);
        if (startsAlif && (p !== 1) !== kinds.includes('joined')) bad.push(`${ref} joined by position`);
        // a hamza sits on any unit (a word that opens with "wa" has it second)
        const hamza = unitsOf(w[script]).some((u) => [0x0621, 0x0623, 0x0624, 0x0625, 0x0626].includes(cps(u)[0]));
        if (hamza !== kinds.includes('hamza')) bad.push(`${ref} hamza`);
      }
      // Al- is sun or moon, never both and never neither, except in the name of Allah, which has its own note (the laam of Al- is its first laam)
      const allah = kinds.includes('allah');
      const article = kit.kinds.sun.has(w[script], script) || kit.kinds.moon.has(w[script], script);
      if (!allah && article !== (kinds.includes('sun') || kinds.includes('moon'))) bad.push(`${ref} ${script} article`);
      if (allah && (kinds.includes('sun') || kinds.includes('moon'))) bad.push(`${ref} ${script} allah and an article note`);
      if (kinds.includes('sun') && kinds.includes('moon')) bad.push(`${ref} both sun and moon`);
    }
  }
  check(bad.length === 0, 'the stop is on the last word of every verse and only there; a word that begins with the joining alif has joined (inside a verse) or start (opening it); a hamza has its note; Al- is sun or moon, never both', bad.slice(0, 6).join(' | '));

  // The lessons the notes point to: the one that taught it, built or honestly "later".
  const LESSON_OF = { standing: 9, zabarWaw: 10, longOo: 11, zabarYaa: 12, longEe: 13, longAa: 8, jazam: 14, shadda: 15, hamza: 16, allah: 18, sun: 18, moon: 18, joined: 19, start: 19, madd: 20, stop: 22, sign: 22, noonClear: 24, meemClear: 25, heavy: 27 };
  check(Object.keys(kit.kinds).length === Object.keys(LESSON_OF).length && Object.entries(LESSON_OF).every(([k, n]) => kit.kinds[k] && kit.kinds[k].lesson === n), 'every kind points to the lesson that taught it (the table is the one in docs/lesson-23/01 §4)');
  const built = (n) => shell.LESSONS.find((l) => l.n === n).built === true;
  const used = new Set(Object.values(kit.notes).flat().map((e) => kit.kinds[[].concat(e)[0]].lesson));
  check([...used].every((n) => n <= 22 ? built(n) : [24, 25, 27].includes(n) && !built(n)), 'a note points to a built lesson, or to one of the three that come later (24, 25, 27), which the page says comes later', [...used].sort((a, b) => a - b).join());

  // The wording: every kind has a text field in the page, a label, and no number or tajweed word.
  const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  const wordingOf = (kind) => (html.match(new RegExp(`data-note-${kebab(kind)}="([^"]*)"`)) || [])[1];
  const missing = Object.keys(kit.kinds).filter((k) => !wordingOf(k) && k !== 'stop' ? true : !wordingOf(k));
  check(missing.length === 0, 'every kind has its own line in lesson-23.html, a text field each', missing.join());
  const labelled = Object.keys(kit.kinds).filter((k) => !new RegExp(`data-note-${kebab(k)}\\|`).test(html));
  check(labelled.length === 0, 'and each of those lines is listed in data-words-attr, so the options panel gets its text field', labelled.join());
  const lines = Object.keys(kit.kinds).map(wordingOf).join(' ');
  check(!/\d/.test(lines) && !/\b(izhar|idgham|ikhfa|iqlab|ghunna|qalqalah|tafkheem|tarqeeq|waqf|hamzat)\b/i.test(lines), 'no note holds a number or a tajweed word: the Qaida\'s own plain words');
  check(!/\b(meaning|translat)/i.test(lines), 'no note gives the meaning of a word: no meanings and no translation on a reading page');
  const tokens = [...lines.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  check(tokens.every((t) => ['jazam', 'vowel', 'fatha', 'kasra', 'damma'].includes(t)), 'the only tokens in the notes are the student\'s own words for a mark', [...new Set(tokens)].join());

  // The three words spelled through: cut without losing a letter, in both scripts.
  const walkBad = [];
  for (const entry of kit.walk) {
    const w = words.get(entry.ref);
    if (!w) { walkBad.push(`${entry.ref} missing`); continue; }
    for (const script of SCRIPTS) {
      const u = unitsOf(w[script]);
      const cuts = entry.cuts[script];
      const ok = Array.isArray(cuts) && cuts.every((c, i) => Number.isInteger(c) && c > 0 && c < u.length && (i === 0 || c > cuts[i - 1]));
      if (!ok) { walkBad.push(`${entry.ref} ${script} cuts`); continue; }
      const edges = [0, ...cuts, u.length];
      const pieces = edges.slice(0, -1).map((from, i) => u.slice(from, edges[i + 1]).join(''));
      if (pieces.join('') !== w[script] || pieces.some((p) => !p)) walkBad.push(`${entry.ref} ${script} pieces`);
      if (entry.sounds.length !== pieces.length) walkBad.push(`${entry.ref} ${script} sounds`);
    }
    if (!entry.whole || entry.sounds.some((s) => !s || /\d/.test(s))) walkBad.push(`${entry.ref} wording`);
  }
  check(kit.walk.length === 3 && walkBad.length === 0, 'the three words spelled through are cut where the kit says, the pieces joined are the word exactly, and there is one sound a piece, in both scripts', walkBad.join(' | '));
  check(marks && shell.LESSONS.length === 29, 'the shell still lists 29 lessons');
}

//// The page half: a small DOM (copied from qaida-lesson22-check.js, which copied it from qaida-lesson15-check.js) -------------


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
  set href(v) { this.attrs.href = String(v); }
  get href() { return this.attrs.href; }
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

const pageLoad = ['shell.js', 'audio.js', 'marks.js', 'verse-words.js', 'fatiha.js', 'verses.js'];
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

async function pageHalf() {
  let w;
  try {
    w = run('lesson-23.html', pageLoad, { script: 'madani', names: 'fatha' });
  } catch (error) {
    check(false, 'the scripts load against lesson-23.html', error.stack.split('\n').slice(0, 5).join(' | '));
    return;
  }
  check(true, 'shell.js, audio.js, marks.js, verse-words.js, fatiha.js and verses.js load against lesson-23.html without an error');
  await sleep(20);
  const { $, all, click, shell, htmlEl } = w;
  const data = w.ctx.qaidaVerseWords.surahs['1'];
  const kit = w.ctx.qaidaSurahs['1'];
  const qaida = w.ctx.qaida;
  const echoes = [];
  w.ctx.qaidaEcho = { open: (...a) => echoes.push(a) };
  const lineWords = () => $('.verse-line').querySelectorAll('.verse-word');
  const wordText = (b) => b.children[0].textContent;
  const textOf = (verse, script) => verse.words.map((x) => x[script]).join(' ');
  const noteLines = () => $('.word-notes').children;
  const endOf = (n) => String.fromCharCode(0x06DD) + [...String(n)].map((d) => String.fromCharCode(0x0660 + Number(d))).join('');

  // The page, as it opens ---------------------------------------------------------------------------------
  const raw = w.raw;
  const markup = raw.replace(/<!--[\s\S]*?-->/g, ''); // the comments name the scripts too
  const at = (name) => markup.indexOf(`src="${name}"`);
  check(at('marks.js') > 0 && at('marks.js') < at('verse-words.js') && at('verse-words.js') < at('fatiha.js') && at('fatiha.js') < at('verses.js'), 'the page loads its scripts in order: marks, the copied verses, the kit, then the page');
  check(!/practice\.js|rules\.js|rule-lesson\.js|spell\.js|rule-words\.js/.test(markup), 'it loads no drill and no rule page: this lesson is read, not asked');
  check(htmlEl.attrs['data-surah'] === '1', 'the page says which surah it reads');
  // The first-visit chooser (on every page) shows sample letters of each script; nothing else in the page, and nothing in verses.js, holds Arabic.
  const outsideChooser = markup.replace(/<dialog class="chooser"[\s\S]*?<\/dialog>/, '');
  check(!ARABIC.test(outsideChooser) && !ARABIC.test(fs.readFileSync(path.join(dir, 'verses.js'), 'utf8')), 'no Arabic is typed in lesson-23.html (but the chooser\'s sample letters) or verses.js: the Qur\'an text is only ever drawn from the copied file');
  check(/&#x6DD;&#x667;/.test(raw), 'the title glyph is the verse-end sign around a seven, as numeric references');
  check($('h1').textContent === 'Al-Fatiha' && w.doc.title.includes('Lesson 23'), 'the title is Al-Fatiha, Lesson 23');
  check(lineWords().length === 4 && lineWords().every((b, i) => wordText(b) === data.verses[0].words[i].madani), 'verse 1 opens with its four words, each exactly the copied word (Madani)');
  check($('.verse-line').querySelector('.verse-end').textContent === endOf(1), 'and the verse-end sign after them is drawn here: the sign and the number');
  check(lineWords().every((b) => b.attrs['aria-label'] && /Word \d, verse 1/.test(b.attrs['aria-label']) && b.children[0].attrs['aria-hidden'] === 'true'), 'each word is a button that carries its own name, with the Arabic hidden from a screen reader');
  check($('.word-card').hidden && !$('.verse-hint').hidden && $('.verse-hint').textContent.length > 10, 'no word is picked: the card is hidden and a line says to tap one');
  check($('.verse-label').textContent === 'Verse 1 of 7' && all('.verse-steps .word-step').length === 7, 'which verse is said in words, with seven buttons');
  check($('.progress-text').textContent === 'Just starting' && shell.seenCount(23) === 0, 'nothing is read yet: the bar says so in words');
  check($('.verse-prev').disabled === true, 'there is no verse before the first');
  check($('.hear-verse').hidden && $('.hear-word').hidden, 'Hear is not offered while there is no recording of a verse: a hum would not be a verse');
  check($('.sound-note').textContent === $('.sound-note').dataset.none && !$('.sound-note').hidden, 'and a line says hearing opens when the verses are recorded');
  check($('.lead-line').hidden, 'a Madani student is not told about a stand-in font');

  // A word, and why ---------------------------------------------------------------------------------------
  click(lineWords()[2]);
  await sleep(5);
  // The notes a script shows for a word: the kit's list, in its order, those true of the word's text in that script.
  const showing = (ref, script) => kit.notes[ref].map((e) => [].concat(e)).filter(([kind, arg]) => kit.kinds[kind].has(kitWord(ref)[script], script, arg)).map(([kind]) => kind);
  const kitWord = (ref) => { const [, v, p] = ref.split(':').map(Number); return data.verses[v - 1].words[p - 1]; };
  check(!$('.word-card').hidden && $('.word-card-word').textContent === data.verses[0].words[2].madani && $('.verse-hint').hidden, 'tapping the third word opens its card, with the word large');
  check(noteLines().map((n) => n.dataset.kind).join() === showing('1:1:3', 'madani').join() && noteLines().length === 4, 'and the card lists its notes, in the kit\'s order, the four true of it in Madani', noteLines().map((n) => n.dataset.kind).join());
  check(noteLines().every((n) => n.children[0].textContent.length > 20 && !/[{}]/.test(n.children[0].textContent)), 'every note is a sentence with no token left in it');
  const lessonLinks = noteLines().map((n) => n.children[1]);
  check(lessonLinks.every((a) => a.tag === 'a' && /^lesson-\d+\.html$/.test(a.attrs.href) && /^Lesson \d+$/.test(a.textContent)), 'each of these points to the lesson that taught it, as a link');
  check(shell.lessonState(23).seen.join() === '1:1', 'tapping a word counts the verse as read');
  check($('.progress-text').textContent === 'Getting going', 'and the bar moves, in words');
  click(lineWords()[2]);
  check($('.word-card').hidden && !$('.verse-hint').hidden, 'tapping the same word again puts the card away');
  qaida.show(6);
  await sleep(5);
  click(lineWords()[2]); // 1:7:3, noon said clearly: a later lesson
  const later = noteLines().filter((n) => n.children[1].tag === 'span');
  check(later.length === 1 && later[0].dataset.kind === 'noonClear' && later[0].children[1].textContent === 'Comes in Lesson 24' && !later[0].children[1].attrs.href, 'a note about a later lesson says so and leads nowhere (the noon: Lesson 24)', later.map((n) => n.children[1].textContent).join(' | '));
  qaida.show(5);
  click(lineWords()[1]); // 1:6:2, the heavy saad: Lesson 27
  const heavyLater = noteLines().filter((n) => n.children[1].tag === 'span');
  check(heavyLater.length === 1 && heavyLater[0].dataset.kind === 'heavy' && heavyLater[0].children[1].textContent === 'Comes in Lesson 27', 'and the heavy letters say Lesson 27', heavyLater.map((n) => n.children[1].textContent).join(' | '));

  // The names and the script ------------------------------------------------------------------------------
  qaida.show(0);
  click(lineWords()[2]);
  await sleep(5);
  const before = noteLines().map((n) => n.children[0].textContent).join(' ');
  await w.setNames('zabar');
  const after = noteLines().map((n) => n.children[0].textContent).join(' ');
  check(/standing zabar/.test(after) && /standing fatha/.test(before) && /jazam/.test(after) && /sukoon|jazam/.test(after), 'the notes name the marks in the student\'s own words, and change with them', after.slice(0, 80));
  check(!$('.word-card').hidden, 'a change of names keeps the picked word');
  await w.setNames('fatha');
  await w.setScript('indopak');
  check(lineWords().every((b, i) => wordText(b) === data.verses[0].words[i].indopak) && !$('.lead-line').hidden && /stand-in/.test($('.lead-line').textContent), 'in Indo-Pak every word is the copied Indo-Pak word, and the student is told once the print is a stand-in');
  check($('.word-card-word').textContent === data.verses[0].words[2].indopak, 'and the open card follows the script');
  check(htmlEl.attrs['data-script'] === 'indopak', 'the page is in the Indo-Pak script');
  // Nothing the stand-in font cannot draw: the private-use signs are left out of what is drawn (the copy keeps them), and nothing else is.
  const PRIVATE = /[-]/g;
  for (const script of SCRIPTS) {
    await w.setScript(script);
    const drawnVerses = [];
    for (let i = 0; i < 7; i += 1) {
      qaida.show(i);
      drawnVerses.push(lineWords().map(wordText).join(' '));
    }
    const wanted = data.verses.map((v) => textOf(v, script).replace(PRIVATE, ''));
    check(drawnVerses.join('|') === wanted.join('|') && !PRIVATE.test(drawnVerses.join('')), `${script}: every verse is drawn as the copy exactly, minus its private-use signs, and none is left to show as a box`);
    const surahText = $('.surah-text').textContent.replace(/\s+/g, ' ');
    check(!/[-]/.test(surahText), `${script}: the whole surah holds no private-use sign either`);
  }
  // Each script shows only the notes true in its own print: the saad of "the straight way" is a standing zabar in Madani and an alif in Indo-Pak.
  const kindsFor = async (script, verseIndex, wordIndex) => {
    await w.setScript(script);
    qaida.show(verseIndex);
    click(lineWords()[wordIndex]);
    return noteLines().map((n) => n.dataset.kind);
  };
  const m = await kindsFor('madani', 5, 1);
  const ip = await kindsFor('indopak', 5, 1);
  check(m.includes('standing') && !m.includes('longAa') && ip.includes('longAa') && !ip.includes('standing'), 'the straight way (1:6:2): a standing zabar in Madani, a zabar and an alif in Indo-Pak, never both', `${m.join()} | ${ip.join()}`);
  const mStop = await kindsFor('madani', 1, 3);
  const ipStop = await kindsFor('indopak', 1, 3);
  check(!mStop.includes('sign') && ipStop.includes('sign') && mStop.includes('stop') && ipStop.includes('stop'), 'the stop sign after a verse\'s last word is explained where it is printed (Indo-Pak), and only there; the stop itself in both', `${mStop.join()} | ${ipStop.join()}`);
  await w.setScript('madani');

  // Reading all seven ---------------------------------------------------------------------------------------
  qaida.show(0);
  shell.clearLesson(23);
  qaida.clear();
  await sleep(5);
  check(shell.seenCount(23) === 0 && !shell.isDone(23) && qaida.verse === 0, 'Start again clears the lesson');
  const seenLabels = [];
  for (let i = 0; i < 7; i += 1) {
    check(lineWords().length === COUNTS[i] && lineWords().every((b, k) => wordText(b) === data.verses[i].words[k].madani), `verse ${i + 1}: ${COUNTS[i]} words, every one the copied word`);
    seenLabels.push($('.verse-label').textContent);
    click($('.verse-next'));
    await sleep(5);
  }
  check(seenLabels.join() === Array.from({ length: 7 }, (_, i) => `Verse ${i + 1} of 7`).join(), 'the label follows the verse all the way');
  check($('.verse-next').querySelector('span').textContent === 'The whole surah', 'the last verse\'s button goes on to the whole surah');
  check(shell.lessonState(23).seen.length === 7 && shell.isDone(23) && $('.progress-text').textContent === 'Every verse read', 'all seven read: the lesson is done and the bar says so');
  check(/marked as done/.test($('.end-line').textContent) && $('.lesson').classes().includes('complete'), 'and the last line says so, and the star draws');
  check(shell.LESSONS.find((l) => l.n === 23).built && shell.doneCount() === 1, 'the home counts it as finished');
  click($('.reset'));
  check($('.reset').textContent === 'Tap again to clear' && shell.isDone(23), 'Start again asks once more, and clears nothing yet');
  click($('.reset'));
  await sleep(5);
  check(shell.lessonState(23).seen.length === 0 && !shell.isDone(23), 'and clears on the second tap');

  // The whole surah -----------------------------------------------------------------------------------------
  const ends = all('.surah-end');
  check(ends.length === 7 && ends.map((b) => b.children[0].textContent).join() === Array.from({ length: 7 }, (_, i) => endOf(i + 1)).join(), 'the whole surah has seven verse-end signs, in order');
  const run1 = $('.surah-text').textContent.replace(/\s+/g, ' ');
  check(data.verses.every((v) => run1.includes(textOf(v, 'madani'))), 'and every verse in it is the copied text exactly, word for word');
  check(ends.every((b) => /Go back to verse \d/.test(b.attrs['aria-label'])), 'each sign is a way back to its verse, named for a screen reader');
  click(ends[4]);
  await sleep(5);
  check(qaida.verse === 4 && $('.verse-label').textContent === 'Verse 5 of 7', 'tapping the fifth sign goes to the fifth verse');

  // Say it, hear it, write it ---------------------------------------------------------------------------------
  qaida.show(1);
  click($('.say-verse'));
  check(echoes.length === 1 && echoes[0][0] === 'verses' && echoes[0][1] === '1:2' && echoes[0][3] === textOf(data.verses[1], 'madani'), 'Say the verse opens the panel on the verse, under its number, with its text');
  click(lineWords()[1]);
  click($('.say-word'));
  check(echoes.length === 2 && echoes[1][0] === 'words' && echoes[1][1] === '1:2:2' && echoes[1][3] === data.verses[1].words[1].madani, 'Say it on a word opens the panel on the word, under its reference, as every earlier lesson keeps its words');
  check(JSON.stringify(qaida.lastItem.slice(0, 2)) === JSON.stringify(['words', '1:2:2']), 'the top-bar Say it opens on what was last looked at');
  click($('.write-word'));
  check(w.opened.length === 1 && w.opened[0][0] === data.verses[1].words[1].madani, 'Write it opens the board on the whole word');
  w.ctx.qaidaAudio.manifest.verses = { '1:2': 'verses/1-2.mp3' };
  w.ctx.qaidaAudio.manifest.words = { '1:2:2': 'words/1-2-2.mp3' };
  qaida.render();
  check(!$('.hear-verse').hidden && !$('.hear-word').hidden, 'once a verse and a word are recorded, Hear appears for them');
  qaida.show(2);
  check($('.hear-verse').hidden, 'and not for a verse with no recording');
  check(w.ctx.qaidaAudio.has('verses', '1:2') && !w.ctx.qaidaAudio.has('verses', '1:3'), 'the recordings are kept under the verse\'s number');

  // Three words, a piece at a time --------------------------------------------------------------------------
  const nav = all('.spell-words-nav .word-step');
  check(nav.length === 3 && $('.spell-words-label').textContent === 'Word 1 of 3', 'three words are spelled through');
  for (let n = 0; n < 3; n += 1) {
    click(nav[n]);
    const entry = kit.walk[n];
    const word = data.verses[Number(entry.ref.split(':')[1]) - 1].words[Number(entry.ref.split(':')[2]) - 1].madani;
    const pieces = () => $('.spell-glyph').children;
    check(pieces().map((p) => p.textContent).join('') === word && pieces().length === entry.sounds.length, `word ${n + 1}: its pieces are the word exactly, ${entry.sounds.length} of them`);
    check(pieces()[0].classes().includes('active') && pieces().slice(1).every((p) => p.classes().includes('unread')), `word ${n + 1}: the first piece is lit and the rest wait`);
    for (let s = 0; s < entry.sounds.length; s += 1) {
      if (!$('.spell-caption').textContent.includes(entry.sounds[s])) check(false, `word ${n + 1}: piece ${s + 1} says its sound`, $('.spell-caption').textContent);
      click($('.spell-next'));
    }
    check($('.spell-caption').textContent.includes(entry.whole) && pieces().every((p) => p.classes().includes('read')) && $('.spell-next').hidden && !$('.spell-restart').hidden, `word ${n + 1}: the last step is the whole word, read`);
  }
  click($('.spell-restart'));
  check($('.spell-glyph').children[0].classes().includes('active'), 'Start over lights the first piece again');
  click($('.spell-back'));
  check($('.spell-back').disabled === true, 'there is no step before the first');
  w.shell.state.script = 'indopak';
  w.shell.renderSetup();
  await sleep(5);
  check($('.spell-glyph').children.map((p) => p.textContent).join('') === data.verses[6].words[8].indopak.replace(PRIVATE, ''), 'and a change of script redraws the word being spelled, in that script and without its private-use sign');
  w.shell.state.script = 'madani';
  w.shell.renderSetup();

  // The way on and the way back ----------------------------------------------------------------------------
  check($('.prev').attrs.href === 'lesson-22.html' && $('.prev').querySelector('span').textContent === 'Previous: Stopping', 'Previous goes to Lesson 22');
  check($('.next').querySelector('span').textContent === 'Next: Noon and tanween', 'Next names Lesson 24');
  click($('.next'));
  check(/isn.t built yet/.test($('.note').textContent) && w.location.href === '', 'Next says Lesson 24 is not built yet and does not leave the page: nothing is locked, nothing leads nowhere');

  // The home ---------------------------------------------------------------------------------------------------
  try {
    const home = run('index.html', ['shell.js', 'home.js'], { script: 'madani', names: 'fatha', lessons: { 23: { seen: ['1:1', '1:2', '1:5'], done: false } } });
    await sleep(10);
    const cards = home.all('.lesson-card');
    const card = cards.find((c) => c.querySelector('.card-n') && c.querySelector('.card-n').textContent === '23');
    check(card && card.querySelector('.card').tag === 'a' && card.querySelector('.card').attrs.href === 'lesson-23.html', 'the home\'s card for Lesson 23 is a link to the page');
    check(card && card.querySelector('.card-meta').textContent === '3 of 7 verses read', 'and says how many verses have been read, in its own words', card && card.querySelector('.card-meta').textContent);
  } catch (error) {
    check(false, 'the home draws Lesson 23\'s card', error.stack.split('\n').slice(0, 4).join(' | '));
  }
}

pageHalf().then(() => {
  console.log(failed ? `\n${failed} FAILED` : '\nAll Lesson 23 checks pass.');
  process.exitCode = failed;
});
