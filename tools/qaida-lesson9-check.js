// Runs the mark lesson's page script against the real lesson-9.html in a small hand-made DOM, with no browser
// (QAIDA-BUILD.md step 8). The harness of qaida-lesson7-check.js, pointed at lesson-9.html and with spell.js added
// (docs/lesson-9/06 §3).
//
//   node tools/qaida-lesson9-check.js
//
// The same limits as every other lesson-N-check: nothing is drawn and no CSS runs, so it cannot tell whether خارج
// زبر against زبر is actually hard to tell apart at the tile's size, or whether the Madani khari zabar clips at the
// top of a tile. Those are the user's (docs/lesson-9/06 §4). What it does prove: the page's scripts load against its
// markup, four parts exist and gate correctly, the board draws a trio in a warm-up and a quartet in the last part,
// the same-sound tile appears only where it should, switching script redraws the marks without losing progress, and
// — the invariant that matters most — a switch of script never changes which letters are known.
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
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A small DOM (copied from qaida-lesson7-check.js, which copied it from qaida-lesson6-check.js) -------------------

const VOID = new Set(['meta', 'link', 'input', 'br', 'img', 'hr', 'path', 'rect', 'circle', 'line']);
const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

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
  querySelectorAll(sel) {
    return this.descendants().filter((el) => sel.split(',').some((one) => matches(el, one.trim())));
  }
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
  const source = html
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
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
    for (const a of rawAttrs.matchAll(/([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attrs[a[1]] = a[2] ?? a[3] ?? a[4] ?? '';
    }
    const el = new El(tag, attrs);
    here.append(el);
    if (!VOID.has(tag) && !/\/\s*$/.test(rawAttrs)) stack.push(el);
  }
  return top.children.map((c) => { c.parent = null; return c; });
}

El.prototype.scrollTo = function scrollTo() {};
El.prototype.getBoundingClientRect = function getBoundingClientRect() { return this.rect || { top: 0, bottom: 0, height: 0 }; };
El.prototype.scrollIntoView = function scrollIntoView() {};

// The page, running ---------------------------------------------------------------------------------------------

const PAGE = 'lesson-9.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 9: Standing harakaat · Free Qaida',
  body: htmlEl.querySelector('body'),
  querySelector: (sel) => htmlEl.querySelector(sel),
  querySelectorAll: (sel) => htmlEl.querySelectorAll(sel),
  createElement: (tag) => new El(tag),
  createTextNode: (text) => String(text),
  addEventListener() {},
};

const store = new Map([['qaida', JSON.stringify({ v: 1, chosen: true, script: 'madani', names: 'fatha', grouping: 'families' })]]);
const played = [];
const location = { pathname: `/site/qaida/${PAGE}`, href: '' };
const ctx = vm.createContext({
  document: doc,
  localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
  matchMedia: (query) => ({ matches: /reduced-motion/.test(query), addEventListener() {} }),
  IntersectionObserver: class { observe() {} },
  fetch: async () => ({ ok: false }),
  Audio: class { play() { played.push(this.src); return Promise.resolve(); } pause() {} },
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  navigator: {},
  location,
  getComputedStyle: () => ({ getPropertyValue: () => '', fontSize: '16px', paddingBottom: '24px', marginTop: '12px' }),
  setTimeout,
  clearTimeout,
  console,
});
ctx.window = ctx;

const opened = [];
const load = (file) => vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file });
try {
  load('shell.js');
  load('audio.js');
  ctx.qaidaTrace = { open: (glyph, name) => opened.push([glyph, name]) };
  load('practice.js');
  load('marks.js');
  load('mark-lesson.js');
  load('spell.js');
} catch (error) {
  check(false, `the scripts load against ${PAGE}`, error.stack.split('\n').slice(0, 5).join(' | '));
  process.exit(1);
}
check(true, `shell.js, audio.js, practice.js, marks.js, mark-lesson.js and spell.js load against ${PAGE} without an error`);

const $ = (sel) => doc.querySelector(sel);
const all = (sel) => doc.querySelectorAll(sel);
const shell = ctx.qaidaShell;
const marks = ctx.qaidaMarks;
const qaida = ctx.qaida;
const FATHA = String.fromCharCode(0x064E);
const KASRA = String.fromCharCode(0x0650);
const DAMMA = String.fromCharCode(0x064F);
const ALIF = String.fromCharCode(0x0627);
const STANDING_FATHA = String.fromCharCode(0x0670);
const STANDING_KASRA = String.fromCharCode(0x0656);
const INVERTED_DAMMA = String.fromCharCode(0x0657);
const SMALL_YEH = String.fromCharCode(0x06E6);
const SMALL_WAW = String.fromCharCode(0x06E5);
const own = marks.marksOf('standing');
const click = (el, detail = 1) => {
  const event = { type: 'click', target: el, detail, preventDefault() { this.defaultPrevented = true; } };
  for (let n = el; n; n = n.parent) for (const fn of n.listeners.click || []) fn.call(n, event);
};
const choices = () => $('.choices').children;
const rail = () => all('.band');
const railButton = (n) => rail().find((b) => b.attrs['data-band'] === String(n));
const everyItem = () => marks.allItems(shell, own);
const promptItem = () => {
  const shown = $('.prompt-glyph') ? $('.prompt-glyph').textContent : '';
  return everyItem().find((it) => it.glyph === shown)
    || own.flatMap((m) => marks.twinItems(shell, m, { keys: everyItem().map((it) => it.key), marks: own })).find((it) => it.glyph === shown)
    || own.flatMap((m) => marks.twinItems(shell, m, { keys: everyItem().map((it) => it.key), marks: marks.othersOf(m) })).find((it) => it.glyph === shown)
    || marks.reviewItems(shell, own[0], { count: 27 }).find((it) => it.glyph === shown);
};
const tilesOf = (pair) => pair.querySelectorAll('button.mark-tile');
const glyphOfTile = (tile) => tile.querySelector('.glyph').textContent;

async function main() {
  await sleep(20);
  qaida.setPause(1);

  console.log('\nThe page');
  check(qaida.kind === 'drill', 'publishes window.qaida with kind "drill"');
  check(htmlEl.attrs['data-mark'] === 'standing', 'data-mark names the standing SET, not a single mark');
  check(JSON.stringify(qaida.groupCosts().map((p) => [p.n, p.items])) === '[[1,6],[2,6],[3,6],[4,27]]', 'groupCosts() is four parts: 6, 6, 6 and 27, not 29', JSON.stringify(qaida.groupCosts()));
  check(rail().length === 4 && rail().every((b) => b.attrs.disabled === undefined), 'four parts, all enabled: nothing is locked');
  // The store's default is the fatha name set (as every other lesson-N-check's does); the zabar names are checked
  // later, after switching them.
  check(railButton(1).querySelector('.band-name').textContent === 'Meet standing fatha'
    && railButton(2).querySelector('.band-name').textContent === 'Meet standing kasra'
    && railButton(3).querySelector('.band-name').textContent === 'Meet inverted damma'
    && railButton(4).querySelector('.band-name').textContent === 'All the letters',
  'the rail names all four parts, each with its own mark filled in',
  rail().map((b) => b.querySelector('.band-name').textContent).join(' | '));

  console.log('\nThe head');
  check($('h1').textContent === 'Standing marks' && doc.title.startsWith('Lesson 9: Standing marks'), 'the title is Standing marks in the fatha set', `${$('h1').textContent} / ${doc.title}`);
  check($('.title-mark').textContent === 'ب' + FATHA + STANDING_FATHA, 'the big glyph is baa with khari zabar, drawn in the Madani form by default (zabar + the standing mark)', $('.title-mark').textContent);
  check($('.eyebrow').textContent === 'Lesson 9 of 29' && all('.track li').findIndex((li) => li.classes().includes('now')) === 8, 'it says which lesson it is, and lights the ninth of the track');

  console.log('\nThe board: a trio in a warm-up part, the same-sound tile');
  check($('.pairs').attrs['data-board'] === 'trio', 'part 1 draws a trio (auto picks it for a warm-up)', $('.pairs').attrs['data-board']);
  let pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6 && pairs.every((p) => tilesOf(p).length === 3), 'six letters, each a row of three', String(pairs.length));
  let row = tilesOf(pairs[0]);
  const key1 = pairs[0].attrs['data-key'];
  check(row.map(glyphOfTile).join() === [key1, key1 + FATHA, key1 + FATHA + STANDING_FATHA].join(), 'bare, then with zabar, then with khari zabar (Madani: zabar and the standing mark)', row.map(glyphOfTile).join(' '));
  check(row.every((t) => t.attrs['data-sits'] === 'above'), 'every tile in a khari zabar row sits above');

  const sameCell = $('.pair-feature').querySelector('.pair-cell.same');
  check(Boolean(sameCell), 'the same-sound tile is on the feature row in part 1');
  check(sameCell && tilesOf(sameCell.parent)[tilesOf(sameCell.parent).length - 1].attrs['data-base'] !== undefined, 'and it holds a real tile');
  const sameGlyph = sameCell && sameCell.querySelector('.glyph').textContent;
  check(sameCell && sameGlyph.endsWith(FATHA + ALIF), 'the same-sound tile draws Lesson 8\'s spelling: the feature letter with zabar and alif', sameGlyph);
  check(!sameCell.querySelector('.halo'), 'the same-sound tile has no halo: it is never pointed at as this lesson\'s own stroke');

  console.log('\nPart 2: khari zair sits below, and is a wide (tailed) tile in Madani');
  qaida.setGroup(2);
  await sleep(10);
  check($('.pairs').attrs['data-board'] === 'trio', 'still a trio (still a warm-up)');
  row = tilesOf($('.pairs').querySelectorAll('.pair')[0]);
  check(row[row.length - 1].attrs['data-sits'] === 'below' && row[0].attrs['data-sits'] === 'above', 'the khari zair tile carries data-sits="below"; the bare tile does not', row.map((t) => t.attrs['data-sits']).join(','));
  check(row[row.length - 1].attrs['data-tail'] === '', 'in Madani, the khari zair tile is tailed: the small yaa takes room after the letter', row[row.length - 1].attrs['data-tail']);
  check(!$('.pair-feature').querySelector('.pair-cell.same'), 'no same-sound tile in part 2: only khari zabar has one');

  console.log('\nPart 4: the quartet, the same-sound tile gone');
  qaida.setGroup(4);
  await sleep(10);
  check($('.pairs').attrs['data-board'] === 'quad', 'the last part draws a quartet', $('.pairs').attrs['data-board']);
  pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 27 && pairs.every((p) => tilesOf(p).length === 4), 'all 27 letters (not 29), each a row of four', String(pairs.length));
  check(!pairs.some((p) => p.attrs['data-key'] === 'ا' || p.attrs['data-key'] === 'ء'), 'neither alif nor hamza has a row');
  const haaRow = tilesOf(pairs.find((p) => p.attrs['data-key'] === 'ه'));
  check(new Set(haaRow.map((t) => t.attrs['data-id'])).size === 4, 'the four cells of one row are four distinct ids');
  check(haaRow.some((t) => t.attrs['data-id'] === 'ه' + STANDING_FATHA) && haaRow.some((t) => t.attrs['data-id'] === 'ه' + STANDING_KASRA) && haaRow.some((t) => t.attrs['data-id'] === 'ه' + INVERTED_DAMMA),
    'the quartet holds all three standing marks (U+0670, U+0656 and U+0657), in some order');
  check(haaRow.find((t) => t.attrs['data-id'] === 'ه' + STANDING_KASRA).attrs['data-sits'] === 'below', 'the khari zair cell sits below even inside the mixed quartet row');
  check(!$('.pair-feature').querySelector('.pair-cell.same'), 'no same-sound tile on the last part either: once is the lesson');

  console.log('\nThe joined block is off; the "where you will meet it" line takes its place');
  qaida.setGroup(1);
  await sleep(10);
  check($('.joined').hidden, 'the joined block stays hidden throughout this lesson');
  const metNote = $('.met-note');
  check(Boolean(metNote) && !metNote.hidden && metNote.textContent.length > 0, 'the met-note shows in khari zabar\'s own warm-up part', metNote && metNote.textContent);
  const madaniNote = $('.madani-note');
  check(Boolean(madaniNote) && !madaniNote.hidden && madaniNote.textContent.length > 0, 'and, in Madani, the Madani note shows too', madaniNote && madaniNote.textContent);
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  check(madaniNote.hidden, 'switching to Indo-Pak hides the Madani note');
  check(!metNote.hidden, 'but not the met-note: every script meets khari zabar the same way');
  shell.state.script = 'madani';
  shell.renderSetup();
  qaida.setGroup(4);
  await sleep(10);
  check(metNote.hidden && madaniNote.hidden, 'neither note shows on the last part: they are per-mark, warm-up only');
  qaida.setGroup(1);
  await sleep(10);

  console.log('\nThe wrong answer that makes the lesson: the short twin in a warm-up, another standing mark in the last part');
  qaida.next();
  let asked = 0;
  let hasShortTwin = 0;
  let hasLesson8 = 0;
  for (let i = 0; i < 300; i += 1) {
    const it = promptItem();
    if (it && it.mark === 'standing-fatha' && it.parts && it.parts.includes(1)) {
      asked += 1;
      const otherIds = choices().map((c) => c.attrs['data-id']).filter((id) => id !== it.id);
      if (otherIds.includes(it.key + FATHA)) hasShortTwin += 1;
      if (otherIds.some((id) => id.length === 3 && id.endsWith(FATHA + ALIF))) hasLesson8 += 1;
    }
    qaida.next();
  }
  check(asked > 0 && hasShortTwin === asked, 'a khari zabar question always has the same letter with zabar alone among the answers', `${hasShortTwin} of ${asked}`);
  check(hasLesson8 === 0, 'and never the Lesson 8 spelling (zabar and alif): that is the same-sound tile\'s job, never an answer', String(hasLesson8));

  console.log('\nAnswering: names both, never scolds');
  qaida.next();
  const it = promptItem();
  const wrongButton = choices().find((c) => c.attrs['data-id'] !== it.id);
  click(wrongButton, 1);
  const verdict = $('.verdict').textContent;
  check(/^That one is .+\. This is .+\.$/.test(verdict) && !/wrong|incorrect|try again|!/i.test(verdict), 'a wrong answer names both and never scolds', verdict);
  click($('.next-question'), 1);
  await sleep(10);

  console.log('\nFinishing: the last part alone is the gate, at seven tenths of 27');
  shell.clearLesson(9);
  qaida.setGroup(1);
  for (const item of marks.poolFor(everyItem(), 1)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(9, item.id, true);
  for (const item of marks.poolFor(everyItem(), 2)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(9, item.id, true);
  for (const item of marks.poolFor(everyItem(), 3)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(9, item.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(9), 'all three warm-ups known does not finish the lesson: they are not the gate');
  shell.clearLesson(9);
  qaida.setGroup(4);
  for (const item of marks.poolFor(everyItem(), 4)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(9, item.id, true);
  qaida.setGroup(4);
  await sleep(10);
  check(shell.isDone(9), "the last part's 27, at seven tenths known, finishes the lesson");
  check(shell.masteredCount(9) === 27 && $('.bar').attrs['aria-valuenow'] === '27', "the home's card equals the page's bar: 27, not 29", `${shell.masteredCount(9)} / ${$('.bar').attrs['aria-valuenow']}`);

  console.log('\nThe name set changes all four part names, with no reload');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check(rail().map((b) => b.querySelector('.band-name').textContent).join('|') === 'Meet khari zabar|Meet khari zair|Meet ulta paish|All the letters',
    'khari zabar, khari zair, ulta paish, then the plain last name', rail().map((b) => b.querySelector('.band-name').textContent).join(' | '));
  check($('h1').textContent === 'Standing harakaat', 'the zabar-set title, standing harakaat');
  shell.state.names = 'fatha';
  shell.renderSetup();
  await sleep(10);
  check($('h1').textContent === 'Standing marks', 'and the fatha-set title, standing marks');
  shell.state.names = 'fatha';
  shell.renderSetup();

  console.log('\nSwitch script with the page open: the tiles redraw, progress does not move');
  qaida.setGroup(1);
  await sleep(10);
  const beforeKnown = shell.masteredCount(9);
  const madaniTile = $('.pairs').querySelectorAll('.pair')[0];
  const madaniText = tilesOf(madaniTile)[tilesOf(madaniTile).length - 1].querySelector('.glyph').textContent;
  check(madaniText.includes(FATHA) && madaniText.includes(STANDING_FATHA), 'a Madani tile\'s text contains zabar before the standing mark', madaniText);
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  const indopakTile = $('.pairs').querySelectorAll('.pair')[0];
  const indopakText = tilesOf(indopakTile)[tilesOf(indopakTile).length - 1].querySelector('.glyph').textContent;
  check(!indopakText.includes(FATHA), 'an Indo-Pak tile\'s text does not contain zabar: the standing mark alone', indopakText);
  check(shell.masteredCount(9) === beforeKnown, 'switching script does not move the count');
  check($('.bar').attrs['aria-valuenow'] === String(beforeKnown), 'nor the bar', $('.bar').attrs['aria-valuenow']);
  shell.state.script = 'madani';
  shell.renderSetup();
  await sleep(10);

  console.log('\nThe Spell block: haadhaa in the right number of steps, Previous to Lesson 8');
  const spellGlyph = $('.spell-glyph');
  check(Boolean(spellGlyph), 'the spell block exists on this page (unlike Lesson 7)');
  const units = spellGlyph.querySelectorAll('.unit');
  check(units.length === 2, 'the first word, haadhaa, is two root letters: haa-with-khari-zabar, dhaa-with-zabar-and-alif', String(units.length));
  check(units[0].textContent === 'ه' + FATHA + STANDING_FATHA, 'step 1 shows haa with khari zabar (Madani form)', units[0].textContent);
  check($('.prev').attrs.href === 'lesson-8.html', 'Previous goes to Lesson 8');
  check(/Practice reading/.test($('.spell-more a').textContent) && $('.spell-more a').attrs.href === 'exercise-9.html', 'and Practice reading goes to exercise-9.html');

  console.log('\nThe two-letter tiles option: Madani only');
  check(qaida.hasTail === true, 'hasTail is true in Madani: khari zair and ulta paish both have a tail there');
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  check(qaida.hasTail === false, 'and false in Indo-Pak: none of the three forms there has a tail');
  shell.state.script = 'madani';
  shell.renderSetup();

  console.log('\nThe markup');
  check(!/[ً-ْ]/.test(raw), 'lesson-9.html holds no literal combining mark: the title glyph is a numeric reference');
  check(/&#x628;&#x670;/.test(raw), 'the title glyph is baa and U+0670');
  const visible = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|madd)\b/i.test(visible), 'no scolding anywhere on the page, and no "madd"');
  check(all('[data-words], [data-words-attr]').length > 30, 'every line of wording is tagged for a text field of its own');
  check(!fs.existsSync(path.join(dir, 'lesson-9.js')), 'there is no lesson-9.js: mark-lesson.js is the page');
  check(!/\b29\b/.test(raw.replace(/Lesson \d+ of 29/g, '').replace(/<!--[\s\S]*?-->/g, '')), 'no "29" anywhere on the page: this lesson has 27');

  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
