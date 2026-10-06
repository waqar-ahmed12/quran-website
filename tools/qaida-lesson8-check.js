// Runs the mark lesson's page script against the real lesson-8.html in a small hand-made DOM, with no browser
// (QAIDA-BUILD.md step 8). The harness of qaida-lesson6-check.js, pointed at lesson-8.html (docs/lesson-8/06 §3).
//
//   node tools/qaida-lesson8-check.js
//
// The same limits as every other lesson-N-check: nothing is drawn and no CSS runs, so it cannot tell whether a
// tailed tile actually reads wider without clipping, or whether the halo really rings the alif. Those are the
// user's (docs/lesson-8/06 §4). What it does prove is that the page's scripts load against its markup, and that
// the trio, the twins, the 27-letter table, the joined block's three examples, the wording, the two parts and the
// end of the lesson do what they say, to the text, the classes and the attributes on the page.
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

// A small DOM (copied from qaida-lesson6-check.js, which copied it from qaida-lesson3-check.js) ------------------

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
  get textContent() {
    return this._text + this.children.map((c) => c.textContent).join('');
  }
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
const scrolled = [];
El.prototype.scrollIntoView = function scrollIntoView(o) { scrolled.push([this.attrs.class, o && o.block]); };

// The page, running ---------------------------------------------------------------------------------------------

const PAGE = 'lesson-8.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 8: Zabar and alif · Free Qaida',
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
check(true, `shell.js, audio.js, practice.js, marks.js and mark-lesson.js load against ${PAGE} without an error`);

const $ = (sel) => doc.querySelector(sel);
const all = (sel) => doc.querySelectorAll(sel);
const shell = ctx.qaidaShell;
const marks = ctx.qaidaMarks;
const qaida = ctx.qaida;
const FATHA = String.fromCharCode(0x064E);
const ALIF = String.fromCharCode(0x0627);
const mark = marks.MARKS['fatha-alif'];
const fatha = marks.MARKS.fatha;
const click = (el, detail = 1) => {
  const event = { type: 'click', target: el, detail, preventDefault() { this.defaultPrevented = true; } };
  for (let n = el; n; n = n.parent) for (const fn of n.listeners.click || []) fn.call(n, event);
};
const choices = () => $('.choices').children;
const rail = () => all('.band');
const railButton = (n) => rail().find((b) => b.attrs['data-band'] === String(n));
const everyItem = () => marks.allItems(shell, mark);
const keysOf = () => everyItem().map((it) => it.key);
const promptItem = () => {
  const shown = $('.prompt-glyph') ? $('.prompt-glyph').textContent : '';
  return everyItem().find((it) => it.glyph === shown)
    || marks.twinItems(shell, mark, { keys: keysOf(), marks: [fatha] }).find((it) => it.glyph === shown)
    || marks.reviewItems(shell, mark, { count: 27 }).find((it) => it.glyph === shown);
};
const answerFor = () => choices().find((c) => c.attrs['data-id'] === promptItem().id);
const wrongFor = () => choices().find((c) => c !== answerFor());
const tilesOf = (pair) => pair.querySelectorAll('button.mark-tile');
const glyphOfTile = (tile) => tile.querySelector('.glyph').textContent;

function root_dataset(key, value) { htmlEl.attrs[`data-${kebab(key)}`] = value; }

async function main() {
  await sleep(20);
  qaida.setPause(1);

  console.log('\nThe page');
  check(qaida.kind === 'drill' && qaida.hasOther === true && qaida.otherCount === 1 && qaida.hasTail === true,
    'publishes window.qaida with kind "drill", one other mark to tell apart from, and a tail');
  check(htmlEl.attrs['data-mark'] === 'fatha-alif' && htmlEl.attrs['data-sits'] === 'above', 'the page teaches fatha-alif, and tells the stylesheet the mark sits above');
  check(htmlEl.attrs['data-board'] === 'trio' && htmlEl.attrs['data-arrows'] === 'all' && htmlEl.attrs['data-tailfit'] === 'wide',
    'shows a trio, an arrow before each tile, and the wide two-letter tiles by default');
  check(JSON.stringify(qaida.groupCosts().map((p) => [p.items])) === '[[6],[27]]', 'groupCosts() is 6 then 27, not 29', JSON.stringify(qaida.groupCosts()));
  check(rail().length === 2 && rail().every((b) => b.attrs.disabled === undefined), 'two parts, both enabled: nothing is locked');

  console.log('\nThe head');
  check($('h1').textContent === 'Fatha and alif' && doc.title.startsWith('Lesson 8: Fatha and alif'), 'the title is Fatha and alif in the fatha set', `${$('h1').textContent} / ${doc.title}`);
  check($('.title-mark').textContent === 'ب' + FATHA + ALIF, 'the big glyph is baa with fatha and alif, composed');
  check($('.eyebrow').textContent === 'Lesson 8 of 29' && all('.track li').findIndex((li) => li.classes().includes('now')) === 7, 'it says which lesson it is, and lights the eighth of the track');
  check($('.bar').attrs['aria-valuemax'] === '27', 'the bar\'s total is 27, not 29');

  console.log('\nThe board: a trio, wider tiles, the joined block');
  const featured = tilesOf($('.pair-feature'));
  check(featured.length === 3 && featured[2].attrs['data-tail'] === '', 'one letter three times: bare, with zabar, with zabar and alif — the last one tailed', String(featured.length));
  const pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6, 'part 1 has six letters', String(pairs.length));
  const row = tilesOf(pairs[0]);
  const key = pairs[0].attrs['data-key'];
  check(row.map(glyphOfTile).join() === [key, key + FATHA, key + FATHA + ALIF].join(), 'bare, then with zabar, then with zabar and alif');
  check(row[0].attrs['data-tail'] === undefined && row[1].attrs['data-tail'] === undefined && row[2].attrs['data-tail'] === '', 'only the tailed tile carries data-tail', row.map((t) => t.attrs['data-tail']).join(','));
  check(row.map((t) => t.attrs['data-id']).join() === [key, key + FATHA, key + FATHA + ALIF].join(), 'each has the three-lesson id the engine gives that item');
  check($('.lam-alif-note').hidden && $('.skip-note').hidden, 'in part 1, neither new note is shown yet');
  const joined1 = $('.joined-glyph').textContent;
  check(joined1.includes('  '), 'the joined block shows more than one example in part 1', joined1);

  console.log('\nPart 2: 27 letters, laam and its ligature, the two new notes');
  qaida.setGroup(2);
  await sleep(10);
  const pairs2 = $('.pairs').querySelectorAll('.pair');
  check(pairs2.length === 27, 'part 2 is 27 letters, not 29', String(pairs2.length));
  check(!pairs2.some((p) => p.attrs['data-key'] === 'ا' || p.attrs['data-key'] === 'ء'), 'neither alif nor hamza has a row');
  check(pairs2.some((p) => p.attrs['data-key'] === 'ل'), 'laam is in part 2');
  check(!$('.lam-alif-note').hidden && !$('.skip-note').hidden, 'in part 2, both new notes show');
  check($('.lam-alif-note').textContent.length > 0 && $('.skip-note').textContent.length > 0, 'and both have real text in them');
  const joined2 = $('.joined-glyph').textContent;
  check(joined2.split('  ').filter(Boolean).length === 3, 'the joined block shows three examples in part 2 (the third is laam and alif together)', joined2);
  qaida.setGroup(1);
  await sleep(10);

  console.log('\nThe wrong answer that makes the lesson: the same letter, zabar and no alif');
  qaida.next();
  let own = 0;
  let ownWithTwin = 0;
  for (let i = 0; i < 250; i += 1) {
    const it = promptItem();
    if (it && it.mark === 'fatha-alif') {
      own += 1;
      if (choices().some((c) => c.attrs['data-id'] === it.key + FATHA)) ownWithTwin += 1;
    }
    qaida.next();
  }
  check(own > 0 && ownWithTwin === own, 'a question about the long aa always has the same letter with zabar alone among the answers', `${ownWithTwin} of ${own}`);

  console.log('\nAnswering: names both, never scolds');
  qaida.next();
  let it = promptItem();
  click(wrongFor(), 1);
  const verdict = $('.verdict').textContent;
  check(/^That one is .+\. This is .+\.$/.test(verdict) && !/wrong|incorrect|try again|!/i.test(verdict), 'a wrong answer names both and never scolds', verdict);
  click($('.next-question'), 1);
  await sleep(10);
  it = null;
  for (let i = 0; i < 100 && !(it && it.mark === 'fatha-alif'); i += 1) { qaida.next(); it = promptItem(); }
  check(it && it.mark === 'fatha-alif', 'a Lesson 8 item comes up');
  click(answerFor(), 1);
  check(new RegExp(`^Yes — ${it.letterName} with fatha and alif\\.$`).test($('.verdict').textContent), 'a right answer says "with fatha and alif"', $('.verdict').textContent);

  console.log('\nFinishing: part 2 alone is the gate, at seven tenths of 27');
  shell.clearLesson(8);
  qaida.setGroup(1);
  for (const item of marks.poolFor(everyItem(), 1)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(8, item.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(8), 'part 1 known alone does not finish the lesson: it is a warm-up, not the gate');
  shell.clearLesson(8);
  qaida.setGroup(2);
  for (const item of marks.poolFor(everyItem(), 2)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(8, item.id, true);
  qaida.setGroup(2);
  await sleep(10);
  check(shell.isDone(8), 'all 27 of part 2 known finishes the lesson');
  check(shell.masteredCount(8) === 27 && $('.bar').attrs['aria-valuenow'] === '27', 'the home\'s card equals the page\'s bar: 27, not 29', `${shell.masteredCount(8)} / ${$('.bar').attrs['aria-valuenow']}`);

  console.log('\nThe name set changes the title, the board and every item name, with no reload');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check($('h1').textContent === 'Zabar and alif' && doc.title.startsWith('Lesson 8: Zabar and alif'), 'the title becomes Zabar and alif', `${$('h1').textContent} / ${doc.title}`);
  check($('.alone-label').textContent === 'This is zabar and alif.', 'the board says zabar and alif', $('.alone-label').textContent);
  check(choices().length === 4 && !/fatha/.test(choices().map((c) => (c.attrs['aria-label'] || (c.firstChild && c.firstChild.textContent))).join('|')), 'no choice still says fatha');
  shell.state.names = 'fatha';
  shell.renderSetup();

  console.log('\nThe other script');
  shell.state.script = 'indopak';
  shell.renderSetup();
  qaida.setGroup(2);
  await sleep(10);
  const kaaf = $('.pairs').querySelectorAll('.pair').find((p) => p.attrs['data-key'] === 'ك');
  check(kaaf && tilesOf(kaaf).map(glyphOfTile).join() === ['ک', 'ک' + FATHA, 'ک' + FATHA + ALIF].join(), 'the Indo-Pak kaaf is written in its own form, with the tail too', kaaf && tilesOf(kaaf).map(glyphOfTile).join(' '));
  shell.state.script = 'madani';
  shell.renderSetup();
  qaida.setGroup(1);
  await sleep(10);

  console.log('\nThe Spell block: qaala in three steps, Previous to Lesson 7');
  const spellGlyph = $('.spell-glyph');
  check(Boolean(spellGlyph), 'the spell block exists on this page (unlike Lesson 7)');
  const units = spellGlyph.querySelectorAll('.unit');
  check(units.length === 2, 'the first word, qaala, is two root letters: qaaf-with-fatha-and-alif, laam-with-fatha', String(units.length));
  check(units[0].textContent === 'ق' + FATHA + ALIF, 'step 1 shows qaaf with fatha and alif, qaa', units[0].textContent);
  check($('.spell-caption').textContent === 'Qaaf with fatha and alif: qaa.', 'and says so', $('.spell-caption').textContent);
  check($('.prev').attrs.href === 'lesson-7.html', 'Previous goes to Lesson 7');
  check(/Practice reading/.test($('.spell-more a').textContent) && $('.spell-more a').attrs.href === 'exercise-8.html', 'and Practice reading goes to exercise-8.html');

  console.log('\nThe two-letter tiles option');
  root_dataset('tailfit', 'shrink');
  qaida.setGroup(1);
  await sleep(10);
  check(htmlEl.attrs['data-tailfit'] === 'shrink', 'the row is wired: the attribute follows the option');
  root_dataset('tailfit', 'wide');

  console.log('\nThe markup');
  const html = raw;
  check(!/[ً-ْ]/.test(html), 'lesson-8.html holds no literal combining mark: the title glyph is a numeric reference');
  check(/&#x628;&#x64E;&#x627;/.test(html), 'the title glyph is baa, U+064E and U+0627');
  check(!/\b29\b/.test(html.replace(/Lesson \d+ of 29/g, '').replace(/<!--[\s\S]*?-->/g, '')), 'no "29" anywhere on the page: this lesson has 27');
  const visible = html.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|madd)\b/i.test(visible), 'no scolding anywhere, and no "madd" (the user\'s plain-names rule)');
  check(!fs.existsSync(path.join(dir, 'lesson-8.js')) && all('.title-mark').length === 1, 'there is no lesson-8.js: mark-lesson.js is the page');
  const css = fs.readFileSync(path.join(dir, 'qaida.css'), 'utf8');
  check(/\.mark-tile\[data-tail\]/.test(css) && /data-tailfit=['"]shrink['"]/.test(css), 'the stylesheet has the wide tile and the shrink option');

  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
