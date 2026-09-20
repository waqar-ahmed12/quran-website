// Runs the mark lesson's page script against the real lesson-5.html in a small hand-made DOM, with no browser (step 6).
//
//   node tools/qaida-lesson5-check.js
//
// The same harness as qaida-marks-check.js (which does this for lesson-4.html, and must keep passing unchanged), and the same
// limits: nothing is drawn and no CSS runs, so it cannot tell whether a mark renders attached to its letter, or clipped, or
// whether a zabar and zair pair is actually hard to tell apart. Those are the user's (docs/lesson-5/05 §4). What it does prove
// is that the page's scripts load against its markup, and that the trio, the twins, the wording, the two parts and the end of the
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

const PAGE = 'lesson-5.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 5: Zair · Free Qaida',
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
const KASRA = String.fromCharCode(0x0650);
const mark = marks.MARKS.kasra;
const click = (el, detail = 1) => {
  const event = { type: 'click', target: el, detail, preventDefault() { this.defaultPrevented = true; } };
  for (let n = el; n; n = n.parent) for (const fn of n.listeners.click || []) fn.call(n, event);
};
const choices = () => $('.choices').children;
const rail = () => all('.band');
const railButton = (n) => rail().find((b) => b.attrs['data-band'] === String(n));
const everyItem = () => marks.allItems(shell, mark);
// The item the prompt is about: the lesson's own, then a twin (the same letter with the other mark), then a bare letter.
const keysOf = () => everyItem().map((it) => it.key);
const promptItem = () => {
  const shown = $('.prompt-glyph') ? $('.prompt-glyph').textContent : '';
  return everyItem().find((it) => it.glyph === shown)
    || marks.twinItems(shell, mark, { keys: keysOf() }).find((it) => it.glyph === shown)
    || marks.reviewItems(shell, mark, { count: 29 }).find((it) => it.glyph === shown);
};
const labelOf = (c) => c.attrs['aria-label'] || (c.firstChild && c.firstChild.textContent);
const answerFor = () => choices().find((c) => c.attrs['data-id'] === promptItem().id);
const wrongFor = () => choices().find((c) => c !== answerFor());

async function main() {
  await sleep(20);
  qaida.setPause(1);
  const tilesOf = (pair) => pair.querySelectorAll('button.mark-tile');
  const glyphOfTile = (tile) => tile.querySelector('.glyph').textContent;

  console.log('\nThe page');
  check(qaida.kind === 'drill' && typeof qaida.setGroup === 'function' && typeof qaida.setTwins === 'function' && qaida.hasOther === true,
    'publishes window.qaida with kind "drill", the rows of its own, and the rows for the other mark');
  check(htmlEl.attrs['data-mark'] === 'kasra' && htmlEl.attrs['data-sits'] === 'below', 'the page teaches kasra, and tells the stylesheet the mark sits below');
  check(htmlEl.attrs['data-distractors'] === 'which-mark' && htmlEl.attrs['data-board'] === 'trio' && htmlEl.attrs['data-twins'] === 'on', 'and asks which mark, shows the trio, and has the other mark riding along');
  check(JSON.stringify(qaida.groupCosts().map((p) => [p.items, p.answers])) === '[[6,15],[29,72]]', 'groupCosts() is unchanged: 15 and 72 right answers', JSON.stringify(qaida.groupCosts()));
  check(qaida.review === 0 && qaida.group === 1 && qaida.twins === true, 'it starts on part 1, with no plain letters (the user, 2026-09-20) and the twins on');
  check(rail().length === 2 && rail().every((b) => b.attrs.disabled === undefined), 'two parts, both enabled: nothing is locked');
  check(railButton(1).querySelector('.band-glyph').textContent === 'د' + KASRA, 'the rail shows daal with the mark under it, not baa (baa has a dot where the mark goes)', railButton(1).querySelector('.band-glyph').textContent);
  check(railButton(2).querySelector('.band-glyph').textContent === 'ع' + KASRA, 'and a hanging letter for part 2');

  console.log('\nThe head');
  check($('h1').textContent === 'Kasra' && doc.title.startsWith('Lesson 5: Kasra'), 'the title is Kasra in the fatha set', `${$('h1').textContent} / ${doc.title}`);
  check($('.title-mark').textContent === 'د' + KASRA && $('.title-mark').attrs['aria-hidden'] === 'true', 'the big glyph is daal with the mark, composed, and hidden from a screen reader');
  check($('.next').querySelector('span').textContent === 'Next: Damma', 'the way on says Damma', $('.next').querySelector('span').textContent);
  check($('.eyebrow').textContent === 'Lesson 5 of 14' && all('.track li').findIndex((li) => li.classes().includes('now')) === 4, 'it says which lesson it is, and lights the fifth of the track');

  console.log('\nThe board: a trio');
  check($('.alone-glyph').textContent === String.fromCharCode(0x25CC) + KASRA, 'the mark on its own sits on the dotted circle, and it is U+0650');
  check($('.alone-sits').textContent === 'Kasra sits under the letter.', 'and says it sits under the letter', $('.alone-sits').textContent);
  check($('.mark-does').textContent === 'Kasra is the same stroke as fatha, written under the letter instead of over it.', 'and what it is: the same stroke as the other one, with {other} filled in', $('.mark-does').textContent);
  const featured = tilesOf($('.pair-feature'));
  check(featured.length === 3, 'one letter three times: bare, with the other mark, with this one', String(featured.length));
  const featureLabels = $('.pair-feature').querySelectorAll('.pair-caption').map((c) => c.textContent);
  check(featureLabels.join('|') === 'The letter on its own|The same letter with fatha|The letter with kasra', 'with what each is under it', featureLabels.join('|'));
  const pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6 && pairs.every((p) => tilesOf(p).length === 3 && p.classes().includes('trio')), 'the six letters of part 1, each a row of three', String(pairs.length));
  check($('.pairs').attrs['data-board'] === 'trio', 'and the board says so, for the stylesheet');
  check(pairs.map((p) => p.attrs['data-key']).sort().join('') === marks.MARKS.kasra.first.slice().sort().join(''), "part 1 is kasra's own six, not fatha's");
  const row = tilesOf(pairs[0]);
  check(glyphOfTile(row[0]) === pairs[0].attrs['data-key'] && glyphOfTile(row[1]) === pairs[0].attrs['data-key'] + FATHA && glyphOfTile(row[2]) === pairs[0].attrs['data-key'] + KASRA,
    'the middle one carries U+064E (zabar) and the last U+0650 (zair), in that order');
  check(row.map((t) => t.attrs['data-kind']).join() === 'bare,other,marked' && row.map((t) => t.attrs['data-audio']).join() === 'letters,fatha,kasra',
    'each tile plays its own recording: the name, the other mark\'s sound, this mark\'s sound');
  check(row[1].attrs['aria-label'] === 'Alif with fatha' && row[2].attrs['aria-label'] === 'Alif with kasra' && row[0].attrs['aria-label'] === 'Alif', 'each is named from the same template the sighted student reads', row.map((t) => t.attrs['aria-label']).join(' | '));
  check(tilesOf($('.pairs')).every((t) => t.attrs['aria-label'] && t.querySelector('.glyph').attrs['aria-hidden'] === 'true'), 'every tile is named, and its letter hidden from a screen reader');
  check(tilesOf($('.pairs')).filter((t) => t.querySelector('.halo')).every((t) => t.classes().includes('marked')) && all('.mark-tile.other .halo').length === 0,
    'only this lesson\'s own tile is pointed at: the other mark\'s has no halo');
  check($('.joined-glyph').textContent === 'ا' + KASRA + 'ا' + KASRA || $('.joined-glyph').textContent.endsWith(KASRA), 'the joined example carries this lesson\'s mark');
  click(row[1], 1);
  click(row[2], 1);
  check(true, 'tapping the middle and the last tile does not throw');
  root_dataset('board', 'pairs');
  qaida.next();
  qaida.setGroup(1);
  await sleep(10);
  check($('.pairs').querySelectorAll('.pair').every((p) => tilesOf(p).length === 2), 'the options row can bring back the pairs: two tiles a row');
  root_dataset('board', 'trio');
  qaida.setGroup(1);
  await sleep(10);

  console.log('\nThe first question');
  check($('.ask').textContent.length > 0 && !/\{/.test($('.ask').textContent), 'a question is asked, with no unfilled brace', $('.ask').textContent);
  check(choices().length === 4 && $('.progress-text').textContent === 'Just starting', 'four answers, and a line in words');
  check(shell.drillOf(5).total === 29 && $('.bar').attrs['aria-valuemax'] === '29', 'the total the home reads is the whole lesson (29)', String(shell.drillOf(5).total));

  console.log('\nThe wrong answer that makes the lesson: the same letter, the other mark');
  qaida.next();
  let own = 0;
  let ownWithTwin = 0;
  let twinAsked = 0;
  let bare = 0;
  for (let i = 0; i < 150; i += 1) {
    const it = promptItem();
    if (it && it.mark === 'kasra') {
      own += 1;
      if (choices().some((c) => c.attrs['data-id'] === it.key + FATHA)) ownWithTwin += 1;
    } else if (it && it.mark === 'fatha') twinAsked += 1;
    else if (it) bare += 1;
    qaida.next();
  }
  check(own > 0 && ownWithTwin === own, 'a question about zair always has the same letter with zabar among the answers', `${ownWithTwin} of ${own}`);
  // A third to a half: the engine weighs a review item at half, but in a six-letter part the rule that a letter is not asked again
  // until the others have had a turn flattens that (about 45% in part 1, about 35% in part 2 — measured, not assumed).
  check(twinAsked > 0 && twinAsked / (own + twinAsked) > 0.2 && twinAsked / (own + twinAsked) < 0.6, 'and between a fifth and a half of the questions are about the zabar letters themselves', `${Math.round((100 * twinAsked) / (own + twinAsked))}%`);
  check(bare === 0, 'no plain letter is asked: the twins are review, and the plain letters are the slider, at 0', String(bare));

  console.log('\nAnswering: each says what the letter really carries');
  // A twin, right. It is a zabar letter on a zair page: the verdict must say zabar, not zair.
  let it = null;
  for (let i = 0; i < 80 && !(it && it.mark === 'fatha'); i += 1) { qaida.next(); it = promptItem(); }
  check(it && it.mark === 'fatha', 'a twin comes up');
  click(answerFor(), 1);
  check(/^Yes — .+ with fatha\.$/.test($('.verdict').textContent) && !/kasra/.test($('.verdict').textContent), 'a right zabar letter says "with fatha", on a page about kasra', $('.verdict').textContent);
  qaida.next();
  // A twin, wrong: it names both.
  for (let i = 0; i < 80 && !(it && it.mark === 'fatha'); i += 1) { qaida.next(); it = promptItem(); }
  qaida.next();
  it = null;
  for (let i = 0; i < 80 && !(it && it.mark === 'fatha'); i += 1) { qaida.next(); it = promptItem(); }
  click(wrongFor(), 1);
  const twinWrong = $('.verdict').textContent;
  check(/^That one is .+\. This is .+ with fatha\.$/.test(twinWrong) && !/wrong|incorrect|try again|!/i.test(twinWrong), 'a missed zabar letter names both and never scolds', twinWrong);
  check(all('.mark-tile.other').some((t) => t.attrs['data-missed'] !== undefined && t.attrs['data-id'] === it.id), 'and the board lights that letter\'s zabar tile, in the middle column, so the eye goes to where the stroke was');
  check(all('.mark-tile.marked').every((t) => t.attrs['data-missed'] === undefined), 'and none of zair\'s');
  check($('.advice .struggle').hidden, 'a missed twin is not advice: no "keeps slipping" line, the lesson is not about it');
  click($('.after .trace'), 1);
  check(opened.length >= 1 && opened[opened.length - 1][0] === it.glyph, '"Write it" opens the board on the twin with its own mark', JSON.stringify(opened[opened.length - 1]));
  click($('.next-question'), 1);
  await sleep(10);
  // Own, wrong, by picking the twin.
  it = null;
  for (let i = 0; i < 80 && !(it && it.mark === 'kasra'); i += 1) { qaida.next(); it = promptItem(); }
  click(choices().find((c) => c.attrs['data-id'] === it.key + FATHA), 1);
  const ownWrong = $('.verdict').textContent;
  check(new RegExp(`^That one is ${it.letterName} with fatha\\. This is ${it.letterName} with kasra\\.$`).test(ownWrong), 'picking the zabar letter for a zair one says exactly that, and nothing more', ownWrong);
  check(all('.mark-tile.marked').some((t) => t.attrs['data-missed'] !== undefined && t.attrs['data-id'] === it.id), 'and lights zair\'s own tile');
  click($('.next-question'), 1);
  await sleep(10);

  console.log('\nThe question line');
  qaida.setFormat('name');
  await sleep(10);
  qaida.next();
  const lines = new Set();
  let asked = 0;
  for (let i = 0; i < 60; i += 1) {
    const q = promptItem();
    const shownName = $('.prompt-name') ? $('.prompt-name').textContent : '';
    const ownName = everyItem().some((x) => x.name === shownName);
    if (shownName) { asked += 1; lines.add(`${ownName ? 'own' : 'twin'}: ${$('.ask').textContent}`); }
    void q;
    qaida.next();
  }
  check(asked > 0 && lines.has('own: Which one has kasra under it?'), 'asked by name, a zair letter asks "Which one has kasra under it?"', [...lines].join(' | '));
  check(!lines.has('twin: Which one has kasra under it?') && lines.has('twin: Which one is this?'), 'and a twin asks "Which one is this?": it does not have kasra under it', [...lines].join(' | '));
  qaida.setFormat('mark');

  console.log('\nMoving between parts');
  click(railButton(2), 1);
  await sleep(20);
  check($('.pairs').querySelectorAll('.pair').length === 29 && $('.pairs').querySelectorAll('.pair').every((p) => tilesOf(p).length === 3), 'part 2: all 29 letters, each a row of three');
  check(!$('.band-advice').hidden && /comes later/i.test($('.band-advice .struggle-text').textContent), 'a part opened out of turn is advised about, once');
  check(shell.drillOf(5).total === 29, 'the total the home reads stays the whole lesson');
  qaida.setGroup(1);

  console.log('\nKnowing a part: the twins never count');
  // The drilling above answered some questions wrong at random, and one miss left standing in part 1 would (rightly) stop it
  // being ready. Start from a clean record so what follows is about counting, not about which letter happened to be missed.
  shell.clearLesson(5);
  qaida.setGroup(1);
  const groupOne = marks.poolFor(everyItem(), 1);
  const twinsAll = marks.twinItems(shell, mark, { keys: keysOf() });
  for (const twin of twinsAll) for (let k = 0; k < 3; k += 1) shell.recordAnswer(5, twin.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(5) && $('.ready-note').hidden, 'every zabar letter known is not a lesson known: nothing finished, no "you seem ready"');
  check(shell.masteredCount(5) === 0 && $('.bar').attrs['aria-valuenow'] === '0', 'the home\'s card and the page\'s bar both read nothing', `${shell.masteredCount(5)} / ${$('.bar').attrs['aria-valuenow']}`);
  for (const item of groupOne.slice(0, 5)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(5, item.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(5), 'part 1 known is not the lesson');
  check(!$('.ready-note').hidden && /seem to know this part/.test($('.ready-note').textContent), 'part 1 says you seem to know it', $('.ready-note').textContent);
  check(shell.masteredCount(5) === 5 && $('.bar').attrs['aria-valuenow'] === '5', 'and the home\'s card equals the page\'s bar: 5 of 29, though 29 twins are known too', `${shell.masteredCount(5)} / ${$('.bar').attrs['aria-valuenow']}`);
  for (const item of everyItem().slice(0, 23)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(5, item.id, true);
  qaida.setGroup(2);
  await sleep(10);
  check(!shell.isDone(5), '23 of 29 is under four fifths of the lesson\'s own: not finished, however many twins are known', `${shell.masteredCount(5)} known`);
  for (const item of everyItem()) for (let k = 0; k < 3; k += 1) shell.recordAnswer(5, item.id, true);
  qaida.setGroup(2);
  await sleep(10);
  check(shell.isDone(5), 'all 29 of its own known marks the lesson finished');
  check(/^You can tell fatha from kasra\. This lesson is marked as done/.test($('.end-line').textContent), 'and the last line names what was earned: telling the two apart', $('.end-line').textContent);
  check(/You seem to know kasra on every letter/.test($('.ready-note').textContent), 'and the advice names the mark', $('.ready-note').textContent);
  check($('.bar').attrs['aria-valuenow'] === '29' && shell.masteredCount(5) === 29 && $('.progress-text').textContent === 'All known', 'the bar is full, the home agrees, and it says so in words');

  console.log('\nThe name set changes the words with no reload');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check($('h1').textContent === 'Zair' && doc.title.startsWith('Lesson 5: Zair'), 'the title becomes Zair', `${$('h1').textContent} / ${doc.title}`);
  check($('.next').querySelector('span').textContent === 'Next: Paish', 'the way on becomes Paish');
  check($('.alone-label').textContent === 'This is zair.' && $('.alone-sits').textContent === 'Zair sits under the letter.', 'the board says zair');
  check($('.mark-does').textContent === 'Zair is the same stroke as zabar, written under the letter instead of over it.', 'and the sentence follows the name set on BOTH marks', $('.mark-does').textContent);
  const zPairs = $('.pairs').querySelectorAll('.pair');
  const zRow = tilesOf(zPairs[0]);
  check(zRow[1].attrs['aria-label'] === 'Alif with zabar' && zRow[2].attrs['aria-label'] === 'Alif with zair', 'the trio is named "with zabar" and "with zair", the letters still Alif', zRow.map((t) => t.attrs['aria-label']).join(' | '));
  check($('.pair-feature').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|') === 'The letter on its own|The same letter with zabar|The letter with zair', 'and the featured captions follow');
  check($('.end-line').textContent.startsWith('You can tell zabar from zair.'), 'the last line follows it too', $('.end-line').textContent);
  check($('.ready-note').textContent === 'You seem to know zair on every letter.', 'and the advice');
  check(choices().length === 4 && !/fatha|kasra/.test(choices().map(labelOf).join('|')), 'no choice still says fatha or kasra', choices().map(labelOf).join(' | '));
  shell.state.names = 'fatha';
  shell.renderSetup();

  console.log('\nThe other script');
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  qaida.setGroup(2);
  const kaaf = $('.pairs').querySelectorAll('.pair').find((p) => p.attrs['data-key'] === 'ك');
  check(kaaf && glyphOfTile(tilesOf(kaaf)[1]) === 'ک' + FATHA && glyphOfTile(tilesOf(kaaf)[2]) === 'ک' + KASRA, 'the Indo-Pak kaaf is written in its own form, with each mark', kaaf && tilesOf(kaaf).map(glyphOfTile).join(' '));
  check(shell.drillOf(5).streak['ك' + KASRA] >= 3, 'and what was learnt is kept across the change');
  shell.state.script = 'madani';
  shell.renderSetup();

  console.log('\nThe options');
  root_dataset('twins', 'off');
  qaida.setTwins();
  await sleep(10);
  qaida.setGroup(1);
  qaida.next();
  let twinsSeen = 0;
  let plain = 0;
  let checkedQ = 0;
  let sharing = 0;
  for (let i = 0; i < 80; i += 1) {
    const q = promptItem();
    if (q && q.mark === 'fatha') twinsSeen += 1;
    if (q && !q.marked) plain += 1;
    if (q && q.mark === 'kasra') {
      checkedQ += 1;
      if (choices().some((c) => c.attrs['data-id'] === q.key + FATHA)) sharing += 1;
    }
    qaida.next();
  }
  check(qaida.twins === false && twinsSeen === 0 && plain === 0, 'with the other mark switched off no zabar letter is asked, and no plain one', `${twinsSeen} twins, ${plain} plain`);
  check(sharing === 0 || sharing < checkedQ, 'and the zabar letter is no longer always among the wrong answers: it is Lesson 4 with a different stroke', `${sharing} of ${checkedQ}`);
  root_dataset('twins', 'on');
  qaida.setTwins();
  await sleep(10);
  root_dataset('distractors', 'look-alike');
  qaida.setDistractors('look-alike');
  await sleep(10);
  qaida.next();
  let stillTwins = 0;
  for (let i = 0; i < 80; i += 1) {
    const q = promptItem();
    if (q && q.mark === 'fatha') stillTwins += 1;
    qaida.next();
  }
  check(stillTwins > 0, "'a letter that looks like it' is still there, and the twins still ride along");
  root_dataset('distractors', 'which-mark');
  qaida.setDistractors('which-mark');
  root_dataset('review', '8');
  qaida.setReview(8);
  await sleep(10);
  qaida.setGroup(1);
  qaida.next();
  let plain8 = 0;
  let twin8 = 0;
  let own8 = 0;
  for (let i = 0; i < 200; i += 1) {
    const q = promptItem();
    if (q) { if (!q.marked) plain8 += 1; else if (q.mark === 'fatha') twin8 += 1; else own8 += 1; }
    qaida.next();
  }
  check(plain8 > 0 && twin8 > 0 && own8 > 0, 'with the plain letters turned up, all three kinds are asked', `${own8} own, ${twin8} twins, ${plain8} plain`);
  root_dataset('review', '0');
  qaida.setReview(0);
  await sleep(10);

  console.log('\nHearing, and the boundary');
  check(qaida.sound === 0, 'no letter has a recording of the sound "bi" yet, so hearing is off');
  qaida.setFormat('sound');
  await sleep(10);
  check($('.verdict').textContent.length > 0 || $('.prompt').children.length === 0, 'asked to hear with nothing recorded, the page says so and asks nothing it cannot');
  qaida.setFormat('mark');
  check(!/localStorage|sessionStorage|\bdocument\b/.test(fs.readFileSync(path.join(dir, 'marks.js'), 'utf8').replace(/\/\/.*$/gm, '')), 'marks.js touches neither the DOM nor storage');

  console.log('\nStart again');
  click($('.reset'), 1);
  click($('.reset'), 1);
  await sleep(10);
  check(shell.masteredCount(5) === 0 && !shell.isDone(5) && railButton(1).attrs['aria-current'] === 'page', 'clears what was learnt, and goes back to part 1');

  console.log('\nThe markup');
  const html = raw;
  check(!/[ً-ْ]/.test(html), 'lesson-5.html holds no literal combining mark: the title glyph is a numeric reference');
  check(/&#x62F;&#x650;/.test(html), 'the title glyph is daal and U+0650');
  const visible = html.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again)\b/i.test(visible), 'no scolding anywhere on the page: no "incorrect", no "wrong", no "try again"');
  check(all('[data-words], [data-words-attr]').length > 30, 'every line of wording is tagged for a text field of its own');
  const wordsAttr = html.match(/data-words-attr="[^"]*"/g).join(' ');
  check(['data-pair-other|', 'data-mark-does|', 'data-mark-sits|', 'data-spot|', 'data-finished|'].every((f) => wordsAttr.includes(f)), 'the new and changed strings each have a text field: the other-mark caption, what the mark does, where it sits, the spot line, the end line');
  check(!fs.existsSync(path.join(dir, 'lesson-5.js')) && all('.title-mark').length === 1, 'there is no lesson-5.js: mark-lesson.js is the page');
  check(html.replace(/<!--[\s\S]*?-->/g, '').includes('data-titlemark="bi"'), 'the layout slug is "bi"');

  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
}

function root_dataset(key, value) { htmlEl.attrs[`data-${kebab(key)}`] = value; }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
