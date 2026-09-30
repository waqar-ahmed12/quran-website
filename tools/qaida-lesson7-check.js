// Runs the mark lesson's page script against the real lesson-7.html in a small hand-made DOM, with no browser (step 8).
//
//   node tools/qaida-lesson7-check.js
//
// The same harness as qaida-lesson6-check.js (which must keep passing unchanged), and the same limits: nothing is
// drawn and no CSS runs, so it cannot tell whether بَ and بً are actually hard to tell apart, or whether the quartet
// reads as a family or a wall. Those are the user's (docs/lesson-7/05 §4). What it does prove: the page's scripts
// load against its markup, four parts exist and gate correctly, the board draws a trio in a warm-up and a quartet
// in the last part, and — the one invariant that matters most — a question about a doubled mark always offers
// another DOUBLED mark among the wrong answers, never the single one (docs/lesson-7/03 §5's "which two?", not
// "one or two?" again). Prints PASS or FAIL per check; the exit code is the number that failed.

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

// A small DOM (copied from qaida-lesson6-check.js) ------------------------------------------------------------

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

const PAGE = 'lesson-7.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 7: Tanween · Free Qaida',
  body: htmlEl.querySelector('body'),
  querySelector: (sel) => htmlEl.querySelector(sel),
  querySelectorAll: (sel) => htmlEl.querySelectorAll(sel),
  createElement: (tag) => new El(tag),
  createTextNode: (text) => String(text),
  addEventListener() {},
};

const store = new Map([['qaida', JSON.stringify({ v: 1, chosen: true, script: 'madani', names: 'fatha', grouping: 'families' })]]);
const played = [];
const opened = [];
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

const load = (file) => vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file });
try {
  load('shell.js');
  load('audio.js');
  ctx.qaidaTrace = { open: (glyph, name) => opened.push([glyph, name]) };
  load('practice.js');
  load('marks.js');
  load('mark-lesson.js');
} catch (error) {
  check(false, `the scripts load against ${PAGE}`, error.stack.split('\n').slice(0, 5).join(' | '));
  process.exit(1);
}
check(true, `shell.js, audio.js, practice.js, marks.js and mark-lesson.js load against ${PAGE} without an error`);

const $ = (sel) => doc.querySelector(sel);
const all = (sel) => doc.querySelectorAll(sel);
const shell = ctx.qaidaShell;
const marks = ctx.qaidaMarks;
const qaida = ctx.qaida;
const FATHA = String.fromCharCode(0x064E);
const KASRA = String.fromCharCode(0x0650);
const DAMMA = String.fromCharCode(0x064F);
const FATHATAIN = String.fromCharCode(0x064B);
const KASRATAIN = String.fromCharCode(0x064D);
const DAMMATAIN = String.fromCharCode(0x064C);
const own = marks.marksOf('tanween');
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
    || marks.reviewItems(shell, own[0], { count: 29 }).find((it) => it.glyph === shown);
};
const answerFor = () => choices().find((c) => c.attrs['data-id'] === promptItem().id);
const tilesOf = (pair) => pair.querySelectorAll('button.mark-tile');
const glyphOfTile = (tile) => tile.querySelector('.glyph').textContent;

async function main() {
  await sleep(20);
  qaida.setPause(1);

  console.log('\nThe page');
  check(qaida.kind === 'drill', 'publishes window.qaida with kind "drill"');
  check(htmlEl.attrs['data-mark'] === 'tanween', 'data-mark names the tanween SET, not a single mark');
  check(JSON.stringify(qaida.groupCosts().map((p) => [p.n, p.items])) === '[[1,6],[2,6],[3,6],[4,29]]', 'groupCosts() is four parts: 6, 6, 6 and 29', JSON.stringify(qaida.groupCosts()));
  check(rail().length === 4 && rail().every((b) => b.attrs.disabled === undefined), 'four parts, all enabled: nothing is locked');
  check(railButton(1).querySelector('.band-name').textContent === 'Meet two fatha'
    && railButton(2).querySelector('.band-name').textContent === 'Meet two kasra'
    && railButton(3).querySelector('.band-name').textContent === 'Meet two damma'
    && railButton(4).querySelector('.band-name').textContent === 'All the letters',
  'the rail names all four parts, each with its own mark filled in',
  rail().map((b) => b.querySelector('.band-name').textContent).join(' | '));

  console.log('\nThe head');
  check($('h1').textContent === 'Tanween' && doc.title.startsWith('Lesson 7: Tanween'), 'the title is Tanween');
  check($('.title-mark').textContent === 'ب' + FATHATAIN, 'the big glyph is baa with fathatain, composed');
  check($('.eyebrow').textContent === 'Lesson 7 of 14' && all('.track li').findIndex((li) => li.classes().includes('now')) === 6, 'it says which lesson it is, and lights the seventh of the track');

  console.log('\nThe board: a trio in a warm-up part');
  check($('.pairs').attrs['data-board'] === 'trio', 'part 1 draws a trio (auto picks it for a warm-up)', $('.pairs').attrs['data-board']);
  let pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6 && pairs.every((p) => tilesOf(p).length === 3), 'six letters, each a row of three', String(pairs.length));
  let row = tilesOf(pairs[0]);
  const key1 = pairs[0].attrs['data-key'];
  check(row.map(glyphOfTile).join() === [key1, key1 + FATHA, key1 + FATHATAIN].join(), 'bare, then with fatha, then with fathatain — the stroke shown doubling');
  check(row.every((t) => t.attrs['data-sits'] === 'above'), 'every tile in a fathatain row sits above');

  console.log('\nPart 2: kasratain sits below');
  qaida.setGroup(2);
  await sleep(10);
  check($('.pairs').attrs['data-board'] === 'trio', 'still a trio (still a warm-up)');
  row = tilesOf($('.pairs').querySelectorAll('.pair')[0]);
  check(row[row.length - 1].attrs['data-sits'] === 'below' && row[0].attrs['data-sits'] === 'above', 'the kasratain tile carries data-sits="below"; the bare tile (no stroke) does not', row.map((t) => t.attrs['data-sits']).join(','));

  console.log('\nPart 4: the quartet');
  qaida.setGroup(4);
  await sleep(10);
  check($('.pairs').attrs['data-board'] === 'quad', 'the last part draws a quartet', $('.pairs').attrs['data-board']);
  pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 29 && pairs.every((p) => tilesOf(p).length === 4), 'all 29 letters, each a row of four');
  const alifRow = tilesOf(pairs.find((p) => p.attrs['data-key'] === 'ا'));
  check(new Set(alifRow.map((t) => t.attrs['data-id'])).size === 4, 'the four cells of one row are four distinct ids');
  check(alifRow.some((t) => t.attrs['data-id'] === 'ا' + FATHATAIN) && alifRow.some((t) => t.attrs['data-id'] === 'ا' + KASRATAIN) && alifRow.some((t) => t.attrs['data-id'] === 'ا' + DAMMATAIN),
    'the quartet holds all three doubled marks (U+064B, U+064D and U+064C), in some order');
  check(alifRow.find((t) => t.attrs['data-id'] === 'ا' + KASRATAIN).attrs['data-sits'] === 'below', 'the kasratain cell sits below even inside the mixed quartet row');

  console.log('\nThe wrong answer that makes the lesson: another DOUBLED mark, never the single one');
  qaida.next();
  let asked = 0;
  let wrongIsTanween = 0;
  let wrongIsSingle = 0;
  for (let i = 0; i < 300; i += 1) {
    const it = promptItem();
    if (it && [FATHATAIN, KASRATAIN, DAMMATAIN].includes(it.id[1])) {
      asked += 1;
      const otherIds = choices().map((c) => c.attrs['data-id']).filter((id) => id !== it.id);
      if (otherIds.some((id) => id.length === 2 && [FATHATAIN, KASRATAIN, DAMMATAIN].includes(id[1]))) wrongIsTanween += 1;
      if (otherIds.some((id) => id.length === 2 && [FATHA, KASRA, DAMMA].includes(id[1]))) wrongIsSingle += 1;
    }
    qaida.next();
  }
  check(asked > 0 && wrongIsTanween === asked, 'a doubled-mark question always has another DOUBLED mark among the wrong answers', `${wrongIsTanween} of ${asked}`);
  check(wrongIsSingle === 0, 'and never the single mark — part 4 asking "one or two?" again would be Lesson 4 in disguise', String(wrongIsSingle));

  console.log('\nAnswering: names both, never scolds');
  qaida.next();
  let it = promptItem();
  const wrongButton = choices().find((c) => c.attrs['data-id'] !== it.id);
  click(wrongButton, 1);
  const verdict = $('.verdict').textContent;
  check(/^That one is .+\. This is .+\.$/.test(verdict) && !/wrong|incorrect|try again|!/i.test(verdict), 'a wrong answer names both and never scolds', verdict);
  click($('.next-question'), 1);
  await sleep(10);

  console.log('\nFinishing: the last part alone is the gate');
  shell.clearLesson(7);
  qaida.setGroup(1);
  for (const item of marks.poolFor(everyItem(), 1)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(7, item.id, true);
  for (const item of marks.poolFor(everyItem(), 2)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(7, item.id, true);
  for (const item of marks.poolFor(everyItem(), 3)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(7, item.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(7), 'all three warm-ups known does not finish the lesson: they are not the gate');
  // A clean slate for the last part alone: some of the warm-ups' own ids are also the last part's (docs/lesson-7/03
  // §4's "not a bug"), so knowing all of parts 1-3 too would legitimately push the card past 29 — that is not what
  // this checks. What it checks is that 29 known, all in part 4, both gates the lesson and is what the card reads.
  shell.clearLesson(7);
  qaida.setGroup(4);
  for (const item of marks.poolFor(everyItem(), 4)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(7, item.id, true);
  qaida.setGroup(4);
  await sleep(10);
  check(shell.isDone(7), 'the last part\'s 29, at seven tenths known, finishes the lesson');
  check(shell.masteredCount(7) === 29 && $('.bar').attrs['aria-valuenow'] === '29', 'the home\'s card equals the page\'s bar: 29', `${shell.masteredCount(7)} / ${$('.bar').attrs['aria-valuenow']}`);

  console.log('\nOpening a later part first is advised, not blocked');
  shell.clearLesson(7);
  qaida.setGroup(1);
  click(railButton(3), 1);
  await sleep(10);
  check(!$('.band-advice').hidden && /comes later/i.test($('.band-advice .struggle-text').textContent), 'a part opened out of turn is advised about, once');
  qaida.setGroup(1);

  console.log('\nThe name set changes all four part names, with no reload');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check(rail().map((b) => b.querySelector('.band-name').textContent).join('|') === 'Meet two zabar|Meet two zair|Meet two paish|All the letters',
    'two zabar, two zair, two paish, then the plain last name', rail().map((b) => b.querySelector('.band-name').textContent).join(' | '));
  check($('h1').textContent === 'Tanween', 'the lesson\'s own name, tanween, does not change');
  shell.state.names = 'fatha';
  shell.renderSetup();

  console.log('\nThe other script');
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  qaida.setGroup(4);
  await sleep(10);
  const kaafRow = tilesOf($('.pairs').querySelectorAll('.pair').find((p) => p.attrs['data-key'] === 'ك'));
  check(kaafRow && kaafRow.some((t) => t.querySelector('.glyph').textContent.startsWith('ک')), 'the Indo-Pak kaaf is written in its own form');
  check(shell.drillOf(7).total > 0, 'mastery still records under Lesson 7');
  shell.state.script = 'madani';
  shell.renderSetup();

  console.log('\nThe markup');
  check(!/[ً-ْ]/.test(raw), 'lesson-7.html holds no literal combining mark: the title glyph is a numeric reference');
  check(/&#x628;&#x64B;/.test(raw), 'the title glyph is baa and U+064B');
  const visible = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again)\b/i.test(visible), 'no scolding anywhere on the page');
  check(all('[data-words], [data-words-attr]').length > 30, 'every line of wording is tagged for a text field of its own');
  check(!fs.existsSync(path.join(dir, 'lesson-7.js')), 'there is no lesson-7.js: mark-lesson.js is the page');
  // 2026-09-28 (fixes/lesson 7/fixes.txt: "there is no walkthrough words for all tanween"): it does now.
  check(/section class="spell"/.test(raw) && raw.includes('src="spell.js"'), 'a Spell-a-word section, and spell.js to draw it');
  check(raw.includes('href="exercise-7.html"') && fs.existsSync(path.join(dir, 'exercise-7.html')), 'and a link to its reading page, which exists');
  check(/come after the next lesson/.test(raw), 'with the line saying why there are no two-zabar words yet');
  check(raw.includes('data-titlemark="ban"'), 'the layout slug is "ban"');

  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
