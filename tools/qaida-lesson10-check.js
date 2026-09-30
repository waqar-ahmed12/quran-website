// Runs the mark lesson's page script against the real lesson-10.html in a small hand-made DOM, with no browser
// (QAIDA-BUILD.md step 9). The harness of qaida-lesson8-check.js, pointed at lesson-10.html (docs/lesson-10/06 §3).
//
//   node tools/qaida-lesson10-check.js
//
// The same limits as every other lesson-N-check: nothing is drawn and no CSS runs, so it cannot tell whether the
// wow's tail clips at the bottom of a tile, or what the jazam looks like. Those are the user's (docs/lesson-10/06
// §4). What it does prove: the scripts load against the markup, and the quartet, the twins, the 27-letter table,
// the joined block (and no lam-alif), the jazam line, the parts, the words and the end of the lesson do what they
// say. Prints PASS or FAIL per check; the exit code is the number that failed.

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

const PAGE = 'lesson-10.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 10: Zabar and wow · Free Qaida',
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
const WOW = String.fromCharCode(0x0648) + String.fromCharCode(0x0652); // wow and jazam: the tail, as the id spells it
const DRAWN = String.fromCharCode(0x0648) + String.fromCharCode(0x06E1); // ...and as Madani draws it (docs/lesson-10/02 §3)
const mark = marks.MARKS['fatha-waw'];
const alif = marks.MARKS['fatha-alif'];
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
    || marks.twinItems(shell, mark, { keys: keysOf(), marks: [fatha, alif] }).find((it) => it.glyph === shown)
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
  check(qaida.kind === 'drill' && qaida.hasOther === true && qaida.otherCount === 2 && qaida.hasTail === true,
    'publishes window.qaida with kind "drill", two other marks to tell apart from, and a tail');
  check(htmlEl.attrs['data-mark'] === 'fatha-waw' && htmlEl.attrs['data-sits'] === 'above', 'the page teaches fatha-waw, above the letter');
  check(htmlEl.attrs['data-board'] === 'quad' && htmlEl.attrs['data-arrows'] === 'last' && htmlEl.attrs['data-twins'] === 'alternate',
    'a quartet, one arrow before the last tile, and the twins alternating');
  check(JSON.stringify(qaida.groupCosts().map((p) => [p.items])) === '[[6],[27]]', 'groupCosts() is 6 then 27', JSON.stringify(qaida.groupCosts()));
  check(rail().length === 2 && rail().every((b) => b.attrs.disabled === undefined), 'two parts, both enabled: nothing is locked');

  console.log('\nThe head');
  check($('h1').textContent === 'Fatha and waw' && doc.title.startsWith('Lesson 10: Fatha and waw'), 'the title is Fatha and waw in the fatha set', `${$('h1').textContent} / ${doc.title}`);
  check($('.title-mark').textContent === 'ب' + FATHA + DRAWN, 'the big glyph is baa with zabar, wow and jazam, composed');
  check($('.eyebrow').textContent === 'Lesson 10 of 14' && all('.track li').findIndex((li) => li.classes().includes('now')) === 9, 'Lesson 10 of 14, the tenth of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '27', 'the bar\'s total is 27');

  console.log('\nThe board: the quartet, the jazam line, the joined block');
  const featured = tilesOf($('.pair-feature'));
  check(featured.length === 4, 'one letter four times: bare, zabar, zabar and alif, zabar and wow', String(featured.length));
  const pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6 && pairs.some((p) => p.attrs['data-key'] === 'ل'), 'part 1 has six letters, laam among them', String(pairs.length));
  const row = tilesOf(pairs[0]);
  const key = pairs[0].attrs['data-key'];
  check(row.map(glyphOfTile).join() === [key, key + FATHA, key + FATHA + ALIF, key + FATHA + DRAWN].join(), 'the road: bare, ba, baa, bau (the Madani jazam drawn U+06E1)');
  check(row[3].attrs['data-tail'] === '' && row[0].attrs['data-tail'] === undefined && row[1].attrs['data-tail'] === undefined,
    'the marked tile carries data-tail, the bare and short ones do not');
  check(row[3].attrs['data-id'] === key + FATHA + WOW && row[3].attrs['data-id'].length === 4, 'and its id is four characters: the letter, zabar, wow, jazam');
  check(!$('.jazam-note').hidden && /small mark on the wow is sukoon\./.test($('.jazam-note').textContent), 'the jazam line, named in the fatha set as sukoon', $('.jazam-note').textContent);
  check(!/\{/.test($('.jazam-note').textContent), 'with every token filled');
  const joined1 = $('.joined-glyph').textContent.split('  ').filter(Boolean);
  check(joined1.length === 2 && joined1.every((g) => g.endsWith(FATHA + DRAWN)), 'the joined block: two examples, one joining and one apart', joined1.join(' | '));
  check(!$('.lam-alif-note'), 'no lam-alif line on the page at all');

  console.log('\nPart 2: 27 letters, the skip note, still no lam-alif');
  qaida.setGroup(2);
  await sleep(10);
  const pairs2 = $('.pairs').querySelectorAll('.pair');
  check(pairs2.length === 27 && !pairs2.some((p) => ['ا', 'ء'].includes(p.attrs['data-key'])), 'part 2 is 27 letters, no alif, no hamza', String(pairs2.length));
  check(pairs2.some((p) => p.attrs['data-key'] === 'و'), 'wow on wow stays (docs/lesson-10/02 §2)');
  check(!$('.skip-note').hidden && $('.skip-note').textContent.length > 0, 'the skip note shows');
  const joined2 = $('.joined-glyph').textContent.split('  ').filter(Boolean);
  check(joined2.length === 2, 'the joined block still has two examples: no laam third', joined2.join(' | '));
  qaida.setGroup(1);
  await sleep(10);

  console.log('\nThe wrong answers: its twin, and never a later lesson');
  for (const n of [1, 2]) {
    qaida.setGroup(n);
    await sleep(5);
    qaida.next();
    let own = 0;
    let withTwin = 0;
    let later = 0;
    for (let i = 0; i < 250; i += 1) {
      const it = promptItem();
      const ids = choices().map((c) => c.attrs['data-id']);
      if (it && it.mark === 'fatha-waw') {
        own += 1;
        if (ids.some((id) => id === it.key + FATHA || id === it.key + FATHA + ALIF)) withTwin += 1;
      }
      // A later lesson's item would end in something no mark taught so far ends in (Lesson 11's damma and wow).
      if (ids.some((id) => id.endsWith(String.fromCharCode(0x064F, 0x0648)))) later += 1;
      qaida.next();
    }
    check(own > 0 && withTwin === own, `part ${n}: every "au" question offers its twin (ba or baa)`, `${withTwin} of ${own}`);
    check(later === 0, `part ${n}: never a Lesson 11 item`);
  }
  qaida.setGroup(1);
  await sleep(5);

  console.log('\nAnswering');
  qaida.next();
  click(wrongFor(), 1);
  const verdict = $('.verdict').textContent;
  check(/^That one is .+\. This is .+\.$/.test(verdict) && !/wrong|incorrect|try again|!/i.test(verdict), 'a wrong answer names both and never scolds', verdict);
  click($('.next-question'), 1);
  await sleep(10);
  let it = null;
  for (let i = 0; i < 100 && !(it && it.mark === 'fatha-waw'); i += 1) { qaida.next(); it = promptItem(); }
  check(it && it.mark === 'fatha-waw', 'a Lesson 10 item comes up');
  click(answerFor(), 1);
  check(new RegExp(`^Yes — ${it.letterName} with fatha and waw\\.$`).test($('.verdict').textContent), 'a right answer says "with fatha and waw"', $('.verdict').textContent);

  console.log('\nFinishing: part 2 is the gate, at seven tenths of 27');
  shell.clearLesson(10);
  for (const item of marks.poolFor(everyItem(), 1)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(10, item.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(10), 'part 1 known alone does not finish the lesson');
  shell.clearLesson(10);
  const part2 = marks.poolFor(everyItem(), 2);
  for (const item of part2.slice(0, Math.ceil(27 * 0.7))) for (let k = 0; k < 3; k += 1) shell.recordAnswer(10, item.id, true);
  qaida.setGroup(2);
  await sleep(10);
  check(shell.isDone(10), 'seven tenths of part 2 known finishes the lesson');
  check(shell.masteredCount(10) === Math.ceil(27 * 0.7), 'and the home counts exactly those', String(shell.masteredCount(10)));
  check(shell.masteredCount(8) === 0 && shell.masteredCount(4) === 0, 'none of it counts toward Lesson 4 or Lesson 8');

  console.log('\nThe zabar set');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check($('h1').textContent === 'Zabar and wow', 'the title becomes Zabar and wow', $('h1').textContent);
  check(/small mark on the wow is jazam\./.test($('.jazam-note').textContent), 'and the jazam line says jazam', $('.jazam-note').textContent);
  check(!/fatha|sukoon/.test(choices().map((c) => (c.attrs['aria-label'] || (c.firstChild && c.firstChild.textContent))).join('|')), 'no choice still says fatha');
  shell.state.names = 'fatha';
  shell.renderSetup();

  console.log('\nIndo-Pak');
  shell.state.script = 'indopak';
  shell.renderSetup();
  qaida.setGroup(2);
  await sleep(10);
  const kaaf = $('.pairs').querySelectorAll('.pair').find((p) => p.attrs['data-key'] === 'ك');
  check(kaaf && glyphOfTile(tilesOf(kaaf)[3]) === 'ک' + FATHA + WOW, 'the Indo-Pak kaaf carries the same tail', kaaf && glyphOfTile(tilesOf(kaaf)[3]));
  check(kaaf && tilesOf(kaaf)[3].attrs['data-id'] === 'ك' + FATHA + WOW, 'and keeps the Madani id, so a switch keeps the credit');
  shell.state.script = 'madani';
  shell.renderSetup();
  qaida.setGroup(1);
  await sleep(10);

  console.log('\nThe Spell block: qawmun in two steps, qaw never split');
  const units = $('.spell-glyph').querySelectorAll('.unit');
  check(units.length === 2 && units[0].textContent === 'ق' + FATHA + DRAWN, 'qawmun is two steps; the first is qaaf with zabar, wow and jazam, whole', units.map((u) => u.textContent).join(' | '));
  check($('.spell-caption').textContent === 'Qaaf with fatha and waw: qaw.', 'and says so', $('.spell-caption').textContent);
  check($('.prev').attrs.href === 'lesson-9.html', 'Previous goes to Lesson 9');
  check($('.spell-more a').attrs.href === 'exercise-10.html' && fs.existsSync(path.join(dir, 'exercise-10.html')), 'Practice reading goes to exercise-10.html, which exists');

  console.log('\nThe jazam: drawn by script, never spelt by it');
  check(marks.drawnOf(mark, 'madani') === FATHA + DRAWN && marks.drawnOf(mark, 'indopak') === FATHA + WOW, 'Madani draws U+06E1, Indo-Pak U+0652');
  check(marks.suffixOf(mark) === FATHA + WOW, 'and the id is U+0652 in both');
  shell.clearLesson(10);
  shell.recordAnswer(10, 'ب' + FATHA + WOW, true);
  shell.recordAnswer(10, 'ب' + FATHA + WOW, true);
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(5);
  check(shell.masteredCount(10) === 1, 'a letter known in Madani is still known after switching to Indo-Pak');
  shell.state.script = 'madani';
  shell.renderSetup();
  await sleep(5);

  console.log('\nThe markup');
  check(!/[\u064B-\u0652\u06E1]/.test(raw), 'lesson-10.html holds no literal combining mark');
  check(/&#x628;&#x64E;&#x648;&#x652;/.test(raw), 'the title glyph is baa, U+064E, U+0648, U+0652');
  check(!/\b29\b/.test(raw.replace(/<!--[\s\S]*?-->/g, '')), 'no "29" anywhere on the page');
  const visible = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|leen|madd)\b/i.test(visible), 'no scolding, and no "leen" (the plain-names rule)');
  check(!/\blam-alif\b|data-lam-alif/.test(raw.replace(/<!--[\s\S]*?-->/g, '')), 'no lam-alif wording at all');

  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
