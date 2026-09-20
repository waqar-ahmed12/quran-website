// Runs the mark lesson's page script against the real lesson-4.html in a small hand-made DOM, with no browser (step 6).
//
//   node tools/qaida-marks-check.js
//
// The same idea as qaida-lesson3-check.js, and the same limits: nothing is drawn and no CSS runs, so it cannot tell whether a
// combining mark renders attached to its letter, or clipped. That is the one thing only a browser can say (docs/lesson-4/08
// §5, the blocking checklist, which the user drives). What it does prove is that the page's scripts load against their own
// markup, and that the rail, the board, both progress numbers, the two parts, the review, the wording and the end of the
// lesson do what they say, to the text, the classes and the attributes on the page.
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

// A small DOM (copied from qaida-lesson3-check.js) ------------------------------------------------------------

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
    // A glyph holds its text and an empty marker span, so the element's own text is kept beside its children's.
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
      // A bare string is a text node, as in a real DOM.
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

// A compound like  button.choice[data-face="glyph"]  against one element.
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

// Descendant selectors: the last part matches the element, the earlier ones some ancestors in order.
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

const PAGE = 'lesson-4.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 4: Zabar · Free Qaida',
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
  ctx.qaidaTrace = { open: (glyph, name) => opened.push([glyph, name]) }; // trace.js draws on a canvas; not needed here
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
const mark = marks.MARKS.fatha;
const click = (el, detail = 1) => {
  const event = { type: 'click', target: el, detail, preventDefault() { this.defaultPrevented = true; } };
  for (let n = el; n; n = n.parent) for (const fn of n.listeners.click || []) fn.call(n, event);
};
const choices = () => $('.choices').children;
const rail = () => all('.band');
const railButton = (n) => rail().find((b) => b.attrs['data-band'] === String(n));
const everyItem = () => marks.allItems(shell, mark);
// The item the prompt is about: a marked letter's prompt is its glyph; a bare one is the letter alone.
const promptItem = () => {
  const shown = $('.prompt-glyph') ? $('.prompt-glyph').textContent : '';
  return everyItem().find((it) => it.glyph === shown) || marks.reviewItems(shell, mark, { count: 29 }).find((it) => it.glyph === shown);
};
const labelOf = (c) => c.attrs['aria-label'] || (c.firstChild && c.firstChild.textContent);
const answerFor = () => choices().find((c) => c.attrs['data-id'] === promptItem().id);
const wrongFor = () => choices().find((c) => c !== answerFor());

async function main() {
  await sleep(20);
  qaida.setPause(1);

  console.log('\nThe page');
  check(qaida.kind === 'drill' && typeof qaida.setGroup === 'function' && typeof qaida.groupCosts === 'function' && typeof qaida.setReview === 'function'
    && typeof qaida.setDistractors === 'function', 'publishes window.qaida with kind "drill" and the rows of its own');
  check(JSON.stringify(qaida.groupCosts().map((p) => [p.items, p.answers])) === '[[6,15],[29,72]]', 'groupCosts() says what each part asks for: 15 and 72 right answers', JSON.stringify(qaida.groupCosts()));
  check(qaida.review === 0 && qaida.group === 1, 'it starts on part 1, with no plain letters riding along (the user, 2026-09-20)');
  check(rail().length === 2, 'the rail has two parts', String(rail().length));
  check(rail().every((b) => b.attrs.disabled === undefined && b.attrs['aria-disabled'] === undefined), 'both are enabled: nothing is locked');
  check(rail().filter((b) => b.attrs['aria-current'] === 'page').length === 1 && railButton(1).attrs['aria-current'] === 'page', 'exactly one part is "you are here", and it is the first');
  check(/^Part 1, Meet the mark\. You’re here$/.test(railButton(1).attrs['aria-label']), 'its label says its state in words', railButton(1).attrs['aria-label']);
  check(/^Part 2, All the letters\. Comes later$/.test(railButton(2).attrs['aria-label']), 'a later part says so', railButton(2).attrs['aria-label']);
  check(railButton(1).querySelector('.band-glyph').textContent === 'ب' + FATHA, 'the rail shows a marked sample letter');

  console.log('\nThe head, in both sets of names');
  check($('h1').textContent === 'Fatha' && doc.title.startsWith('Lesson 4: Fatha'), 'the title is Fatha in the fatha set', `${$('h1').textContent} / ${doc.title}`);
  check($('.title-mark').textContent === 'ب' + FATHA, 'the big glyph is a baa with its mark, composed');
  check($('.title-mark').attrs['aria-hidden'] === 'true', 'and hidden from a screen reader');
  check($('.next').querySelector('span').textContent === 'Next: Kasra', 'the way on says Kasra', $('.next').querySelector('span').textContent);

  console.log('\nThe board, part 1');
  check($('.alone-glyph').textContent === String.fromCharCode(0x25CC) + FATHA, 'the mark on its own sits on the dotted circle');
  check($('.alone-label').textContent === 'This is fatha.' && $('.alone-sits').textContent === 'Fatha sits above the letter.', 'and is named, and says where it sits, with {mark} and {Mark} filled in',
    `${$('.alone-label').textContent} | ${$('.alone-sits').textContent}`);
  check($('.pair-feature').querySelectorAll('button.mark-tile').length === 2, 'one letter twice: bare and marked');
  const featureLabels = $('.pair-feature').querySelectorAll('.pair-caption').map((c) => c.textContent);
  check(featureLabels.join('|') === 'The letter on its own|The letter with fatha', 'with what each is under it', featureLabels.join('|'));
  check($('.mark-does').textContent === 'A letter on its own has a name. With fatha it has a sound.', 'and what the mark does', $('.mark-does').textContent);
  const pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6, 'the six letters of part 1, as pairs', String(pairs.length));
  check(pairs.every((p) => p.querySelectorAll('button.mark-tile').length === 2), 'each with a bare tile and a marked tile');
  const tiles = $('.pairs').querySelectorAll('button.mark-tile');
  check(tiles.every((t) => t.attrs['aria-label'] && t.querySelector('.glyph').attrs['aria-hidden'] === 'true'), 'every tile is named, and its letter hidden from a screen reader');
  check(pairs[0].querySelectorAll('button.mark-tile')[1].attrs['aria-label'] === 'Baa with fatha' && pairs[0].querySelectorAll('button.mark-tile')[0].attrs['aria-label'] === 'Baa', 'names built from the same template the sighted student reads');
  check(pairs[0].querySelectorAll('button.mark-tile')[1].querySelector('.glyph').textContent === 'ب' + FATHA, 'the marked tile is the letter and the mark');
  const markedTiles = $('.pairs').querySelectorAll('button.mark-tile.marked');
  check(markedTiles.every((t) => t.querySelector('.halo') && t.querySelector('.halo').attrs['aria-hidden'] === 'true' && t.querySelector('.glyph .baseline')),
    'every marked tile has a halo of its own, hidden from a screen reader, and a marker for where its text sits');
  check($('.pairs').querySelectorAll('button.mark-tile.bare').every((t) => !t.querySelector('.halo')), 'and a bare tile has none');
  check($('.joined').hidden === false && $('.joined-glyph').textContent === 'ب' + FATHA + 'ب' + FATHA, 'the mark travels with the letter: the same letter twice, beside itself');
  check($('.joined-note').textContent === 'The same letter twice, not a word.', 'and it says it is not a word');
  click(pairs[0].querySelectorAll('button.mark-tile')[1], 1);
  check(true, 'tapping a marked tile does not throw', String(played.length));

  console.log('\nThe first question');
  check($('.ask').textContent.length > 0 && !/\{/.test($('.ask').textContent), 'a question is asked, with no unfilled brace', $('.ask').textContent);
  check($('.prompt-glyph') && $('.prompt-glyph').attrs['aria-hidden'] === 'true', 'a marked letter is shown, hidden from a screen reader');
  check(choices().length === 4, 'four answers', String(choices().length));
  check($('.progress-text').textContent === 'Just starting' && !/\d/.test($('.progress-text').textContent), 'the lesson line is words, not a count', $('.progress-text').textContent);
  check($('.band-line').hidden, 'and there is no group count: that line only appears once the part is done');
  check($('.bar').attrs['aria-valuemax'] === '29' && $('.bar').attrs['aria-valuetext'] === 'Just starting', 'the bar still drives from the numbers (29), and reads as the words');
  check(shell.drillOf(4).total === 29, 'the total the home reads is the whole lesson (29), not the part (6)', String(shell.drillOf(4).total));
  check($('.announce').textContent === 'Question 1.', 'a screen reader is told which question it is');

  console.log('\nAnswering');
  // Whatever the drill happens to ask first, answer it right: the wording depends on whether it is a marked letter.
  let item = promptItem();
  click(answerFor(), 1);
  check(/^Yes — /.test($('.verdict').textContent), 'a right answer says so warmly', $('.verdict').textContent);
  check(item.marked ? /^Yes — .+ with fatha\.$/.test($('.verdict').textContent) : /^Yes — .+, with no mark\.$/.test($('.verdict').textContent), 'and says what it is', $('.verdict').textContent);
  await sleep(40);
  item = promptItem();
  click(wrongFor(), 1);
  const wrongText = $('.verdict').textContent;
  check(/^That one is .+\. This is .+\.$/.test(wrongText) && !/wrong|incorrect|try again|!/i.test(wrongText), 'a wrong answer names both and never scolds', wrongText);
  check(item.marked ? / with fatha\.$/.test(wrongText) : /, with no mark\.$/.test(wrongText), 'and a bare letter is told to have no mark, not "with fatha"', wrongText);
  check(!$('.after').hidden && doc.activeElement === $('.next-question'), 'the strip appears and the keyboard goes to Next');
  click($('.after .trace'), 1);
  check(opened.length === 1 && opened[0][0] === (item.marked ? item.glyph : item.base) && opened[0][1] === item.name,
    '"Write it" opens the board on the letter WITH its mark, titled with its name', JSON.stringify(opened));
  click($('.next-question'), 1);
  await sleep(10);

  console.log('\nNo plain letters, and no repetition');
  qaida.next();
  const order = [];
  let plain = 0;
  for (let i = 0; i < 120; i += 1) {
    const it = promptItem();
    if (it) { order.push(it.id); if (!it.marked) plain += 1; }
    qaida.next();
  }
  check(plain === 0 && order.length > 100, 'by default every question is about a letter with its mark: never a plain one', `${plain} plain of ${order.length}`);
  let closest = Infinity;
  order.forEach((id, i) => { const back = order.slice(0, i).lastIndexOf(id); if (back >= 0) closest = Math.min(closest, i - back); });
  check(closest >= 4, 'in part 1 a letter is not asked again until the others have had a turn', `nearest repeat is ${closest} questions apart`);

  console.log('\nThe review, when the teacher asks for it');
  root_dataset('review', '8');
  qaida.setReview(8);
  await sleep(10);
  qaida.next();
  const asked = new Set();
  let bare = 0;
  let marked = 0;
  for (let i = 0; i < 80; i += 1) {
    const it = promptItem();
    if (it) { asked.add(it.id); if (it.marked) marked += 1; else bare += 1; }
    qaida.next();
  }
  check(bare > 0 && marked > 0, 'both marked letters and bare review letters are asked', `${marked} marked, ${bare} bare`);
  check(bare < marked, 'and review is the smaller share', `${bare} of ${bare + marked}`);
  check([...asked].every((id) => id.length === 2 || id.length === 1), 'every id is a letter, with or without the mark');
  check(bare / (bare + marked) < 0.3, 'in part 1 review stays a minority: a small part is not swamped by eight bare letters', `${Math.round((100 * bare) / (bare + marked))}%`);
  qaida.setGroup(2);
  qaida.next();
  let bare2 = 0;
  let marked2 = 0;
  for (let i = 0; i < 300; i += 1) {
    const it = promptItem();
    if (it) { if (it.marked) marked2 += 1; else bare2 += 1; }
    qaida.next();
  }
  const share = bare2 / (bare2 + marked2);
  check(share > 0.03 && share < 0.25, 'in part 2 review is roughly one question in eight', `${Math.round(100 * share)}%`);
  qaida.setGroup(1);

  console.log('\nMoving between parts');
  click(railButton(2), 1);
  await sleep(20);
  check(railButton(2).attrs['aria-current'] === 'page' && railButton(1).attrs['aria-current'] === undefined, 'part 2 is now "you are here"');
  check(!$('.band-advice').hidden && /comes later/i.test($('.band-advice .struggle-text').textContent), 'a part opened out of turn is advised about', $('.band-advice .struggle-text').textContent);
  check(/^Part 2, All the letters\./.test($('.band-announce').textContent), 'and announced to a screen reader', $('.band-announce').textContent);
  check(doc.activeElement === $('.board-title'), 'the keyboard lands on the board heading, not its first tile');
  check($('.pairs').querySelectorAll('.pair').length === 29, 'the board shows all 29 letters', String($('.pairs').querySelectorAll('.pair').length));
  check($('.progress-text').textContent === 'Just starting' && shell.drillOf(4).total === 29, 'the lesson line and the home total stay whole-lesson');
  click(railButton(1), 1);
  click(railButton(2), 1);
  check($('.band-advice').hidden, 'the advice is not repeated');
  qaida.setGroup(1);
  check(railButton(1).attrs['aria-current'] === 'page' && $('.band-line').hidden, 'the panel can move the drill without advice or focus');

  console.log('\nKnowing a part');
  // The drilling above answered some questions wrong at random, and a miss left standing on the sixth letter of part 1 would
  // (rightly) stop the part being ready when only the first five are marked known. A clean record makes this about counting.
  shell.clearLesson(4);
  qaida.setGroup(1);
  const rule = shell.drillOf(4);
  const groupOne = marks.poolFor(everyItem(), 1);
  const wasDone = shell.isDone(4);
  for (const it of groupOne.slice(0, 5)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(4, it.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!wasDone && !shell.isDone(4), 'part 1 known is not the lesson: it is not marked finished');
  check(!$('.ready-note').hidden && /seem to know this part/.test($('.ready-note').textContent), 'part 1 says you seem to know it', $('.ready-note').textContent);
  check(railButton(1).attrs['data-done'] === '' && railButton(2).attrs['data-done'] === undefined, 'the rail shows part 1 done and part 2 not');
  check(rule.streak !== undefined, 'the shell holds the record');
  for (const it of everyItem()) for (let k = 0; k < 3; k += 1) shell.recordAnswer(4, it.id, true);
  qaida.setGroup(2);
  await sleep(10);
  check(shell.isDone(4), 'all 29 known marks the lesson finished');
  check(/^This lesson is marked as done/.test($('.end-line').textContent), 'and the last line says so', $('.end-line').textContent);
  check(/You seem to know fatha on every letter/.test($('.ready-note').textContent), 'and the advice names the mark', $('.ready-note').textContent);
  check($('.bar').attrs['aria-valuenow'] === '29' && $('.progress-text').textContent === 'All known', 'the bar is full, and says so in words', $('.progress-text').textContent);

  console.log('\nThe name set changes the words with no reload');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check($('h1').textContent === 'Zabar' && doc.title.startsWith('Lesson 4: Zabar'), 'the title becomes Zabar', `${$('h1').textContent} / ${doc.title}`);
  check($('.next').querySelector('span').textContent === 'Next: Zair', 'the way on becomes Zair', $('.next').querySelector('span').textContent);
  check($('.alone-label').textContent === 'This is zabar.' && $('.alone-sits').textContent === 'Zabar sits above the letter.', 'the board says zabar', $('.alone-label').textContent);
  const zabarTiles = $('.pairs').querySelectorAll('button.mark-tile.marked');
  check(zabarTiles[1].attrs['aria-label'] === 'Baa with zabar', 'the letters are still called Baa, not Be', zabarTiles[1].attrs['aria-label']);
  check(/zabar/.test(labelOf(choices()[0])) || $('.choices').attrs['data-face'] === 'glyph' || !/fatha/.test(choices().map(labelOf).join('|')), 'the choices no longer say fatha', choices().map(labelOf).join(' | '));
  check(/^Part 1, Meet the mark/.test(railButton(1).attrs['aria-label']), 'the rail keeps its words');
  check($('.ready-note').textContent === 'You seem to know zabar on every letter.', 'the advice follows it too', $('.ready-note').textContent);
  shell.state.names = 'fatha';
  shell.renderSetup();

  console.log('\nThe other script');
  const before = shell.drillOf(4).streak['ك' + FATHA];
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  qaida.setGroup(2);
  const kaaf = $('.pairs').querySelectorAll('.pair').find((p) => p.attrs['data-key'] === 'ك');
  check(kaaf && kaaf.querySelectorAll('button.mark-tile')[1].querySelector('.glyph').textContent === 'ک' + FATHA, 'the board shows the Indo-Pak kaaf with its mark', kaaf && kaaf.querySelectorAll('button.mark-tile')[1].querySelector('.glyph').textContent);
  check(shell.drillOf(4).streak['ك' + FATHA] === before && before >= 3, 'and mastery is kept across the change', String(before));
  shell.state.script = 'madani';
  shell.renderSetup();

  console.log('\nThe options');
  root_dataset('review', '0');
  qaida.setReview(0);
  await sleep(10);
  check(qaida.review === 0, 'the review can be turned to 0');
  qaida.setGroup(1);
  qaida.next();
  let bareSeen = 0;
  for (let i = 0; i < 40; i += 1) {
    const it = promptItem();
    if (it && !it.marked) bareSeen += 1;
    qaida.next();
  }
  check(bareSeen === 0, 'at 0 no bare letter is ever asked', String(bareSeen));
  root_dataset('review', '8');
  root_dataset('distractors', 'mark-or-not');
  qaida.setReview(8);
  qaida.setDistractors('mark-or-not');
  qaida.setGroup(1);
  await sleep(10);
  let pairsOffered = 0;
  let checked = 0;
  for (let i = 0; i < 60; i += 1) {
    const it = promptItem();
    if (it && it.marked && $('.prompt-glyph')) {
      checked += 1;
      if (choices().some((c) => c.attrs['data-id'] === it.key)) pairsOffered += 1;
    }
    qaida.next();
  }
  check(checked > 0 && pairsOffered === checked, '"the same letter, with and without the mark" offers the bare twin every time, in part 1', `${pairsOffered} of ${checked}`);
  qaida.setFormat('name');
  await sleep(10);
  qaida.next();
  let spot = 0;
  for (let i = 0; i < 30; i += 1) {
    if (/carries fatha/.test($('.ask').textContent)) spot += 1;
    qaida.next();
  }
  check(spot > 0, 'and, asked by name, the question becomes "Which one carries fatha?"', String(spot));
  qaida.setFormat('mark');

  console.log('\nHearing, and the boundary');
  check(qaida.sound === 0, 'no letter has a recording of its sound yet, so hearing is off');
  qaida.setFormat('sound');
  await sleep(10);
  check($('.verdict').textContent.length > 0 || $('.prompt').children.length === 0, 'asked to hear with nothing recorded, the page says so and does not ask a question it cannot ask', $('.verdict').textContent);
  qaida.setFormat('mark');
  check(!/localStorage|sessionStorage|\bdocument\b/.test(fs.readFileSync(path.join(dir, 'marks.js'), 'utf8').replace(/\/\/.*$/gm, '')), 'marks.js touches neither the DOM nor storage');

  console.log('\nStart again');
  click($('.reset'), 1);
  click($('.reset'), 1);
  await sleep(10);
  check(shell.masteredCount(4) === 0 && !shell.isDone(4), 'clears what was learnt');
  check(railButton(1).attrs['aria-current'] === 'page', 'and goes back to part 1');

  console.log('\nThe markup');
  const html = raw;
  check(!/[ً-ْ]/.test(html), 'lesson-4.html holds no literal combining mark: the title glyph is a numeric reference');
  // The tracing board's "hide it and try again from memory" is an instruction for writing, not a verdict on an answer.
  const visible = html.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '')
    .replace(/\bdata-[\w-]+=/g, ''); // an attribute's name (data-wrong) is not wording; its value is
  check(!/\b(incorrect|wrong|try again)\b/i.test(visible), 'no scolding anywhere on the page: no "incorrect", no "wrong", no "try again"');
  const wordsTags = all('[data-words], [data-words-attr]').length;
  check(wordsTags > 30, 'every line of wording is tagged for a text field of its own', String(wordsTags));
  check(all('.title-mark').length === 1 && htmlEl.attrs['data-mark'] === 'fatha', 'one page file serves three lessons: data-mark says which');
  check(!fs.existsSync(path.join(dir, 'lesson-4.js')), 'there is no lesson-4.js');

  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
}

function root_dataset(key, value) { htmlEl.attrs[`data-${kebab(key)}`] = value; }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
