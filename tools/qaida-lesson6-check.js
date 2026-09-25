// Runs the mark lesson's page script against the real lesson-6.html in a small hand-made DOM, with no browser (step 6).
//
//   node tools/qaida-lesson6-check.js
//
// The same harness as qaida-lesson5-check.js (which must keep passing unchanged), and the same
// limits: nothing is drawn and no CSS runs, so it cannot tell whether a mark renders attached to its letter, or clipped, or
// whether a zabar and zair pair is actually hard to tell apart. Those are the user's (docs/lesson-6/05 §4). What it does prove
// is that the page's scripts load against its markup, and that the quartet, the twins, the wording, the two parts and the end of the
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

const PAGE = 'lesson-6.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 6: Paish · Free Qaida',
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
const DAMMA = String.fromCharCode(0x064F);
const mark = marks.MARKS.damma;
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


// Which twin marks a letter meets in the open part, seen from the choices: for each letter, the ids beside it that are neither
// the lesson's own nor the bare letter. Read over many questions, so every pool item has been on the board.
function twinsSeen(qaidaApi, questions) {
  const seen = new Map();
  qaidaApi.next();
  for (let i = 0; i < questions; i += 1) {
    for (const c of choices()) {
      const id = c.attrs['data-id'];
      if (id.length === 2 && !id.endsWith(DAMMA)) seen.set(id[0], new Set([...(seen.get(id[0]) || []), id[1]]));
    }
    qaidaApi.next();
  }
  return seen;
}

async function main() {
  await sleep(20);
  qaida.setPause(1);
  const tilesOf = (pair) => pair.querySelectorAll('button.mark-tile');
  const glyphOfTile = (tile) => tile.querySelector('.glyph').textContent;
  const arrowsIn = (pair) => pair.querySelectorAll('.pair-arrow').length;

  console.log('\nThe page');
  check(qaida.kind === 'drill' && typeof qaida.setGroup === 'function' && typeof qaida.setTwins === 'function' && qaida.hasOther === true && qaida.otherCount === 2,
    'publishes window.qaida with kind "drill", and says two other marks are told apart from');
  check(htmlEl.attrs['data-mark'] === 'damma' && htmlEl.attrs['data-sits'] === 'above', 'the page teaches damma, and tells the stylesheet the mark sits above: Lesson 4\'s tile rules apply, and none of Lesson 5\'s');
  check(htmlEl.attrs['data-distractors'] === 'which-mark' && htmlEl.attrs['data-board'] === 'quad' && htmlEl.attrs['data-twins'] === 'alternate' && htmlEl.attrs['data-arrows'] === 'last',
    'and asks which mark, shows the quartet, alternates the other marks, and draws one arrow');
  check(JSON.stringify(qaida.groupCosts().map((p) => [p.items, p.answers])) === '[[6,15],[29,72]]', 'groupCosts() is unchanged: 15 and 72 right answers', JSON.stringify(qaida.groupCosts()));
  check(qaida.review === 0 && qaida.group === 1 && qaida.twins === true && qaida.twinMode === 'alternate', 'it starts on part 1, with no plain letters and the twins alternating');
  check(rail().length === 2 && rail().every((b) => b.attrs.disabled === undefined), 'two parts, both enabled: nothing is locked');
  check(railButton(1).querySelector('.band-glyph').textContent === 'ب' + DAMMA && railButton(2).querySelector('.band-glyph').textContent === 'ع' + DAMMA, 'the rail shows baa with paish, and ain with paish');

  console.log('\nThe head');
  check($('h1').textContent === 'Damma' && doc.title.startsWith('Lesson 6: Damma'), 'the title is Damma in the fatha set', `${$('h1').textContent} / ${doc.title}`);
  check($('.title-mark').textContent === 'ب' + DAMMA && $('.title-mark').attrs['aria-hidden'] === 'true', 'the big glyph is baa with paish, composed, and hidden from a screen reader');
  check($('.next').querySelector('span').textContent === 'Next: Tanween', 'the way on says Tanween', $('.next').querySelector('span').textContent);
  check($('.eyebrow').textContent === 'Lesson 6 of 14' && all('.track li').findIndex((li) => li.classes().includes('now')) === 5, 'it says which lesson it is, and lights the sixth of the track');

  console.log('\nThe board: a quartet');
  check($('.alone-glyph').textContent === String.fromCharCode(0x25CC) + DAMMA, 'the mark on its own sits on the dotted circle, and it is U+064F');
  check($('.alone-sits').textContent === 'Damma sits above the letter, in the same place as fatha.', 'and says it sits in the same place as the nearest contrast', $('.alone-sits').textContent);
  check($('.mark-does').textContent === 'Damma is a different shape from fatha and kasra, in the same place as fatha. It is a small curl, not a wow.', 'and what it is: a different shape from BOTH, with {others} filled in', $('.mark-does').textContent);
  const featured = tilesOf($('.pair-feature'));
  check(featured.length === 4, 'one letter four times: bare, with each earlier mark, with this one', String(featured.length));
  const featureLabels = $('.pair-feature').querySelectorAll('.pair-caption').map((c) => c.textContent);
  check(featureLabels.join('|') === 'The letter on its own|The same letter with fatha|The same letter with kasra|The letter with damma', 'one caption field, {other} filled once per column', featureLabels.join('|'));
  const pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6 && pairs.every((p) => tilesOf(p).length === 4 && p.classes().includes('quad')), 'the six letters of part 1, each a row of four', String(pairs.length));
  check($('.pairs').attrs['data-board'] === 'quad', 'and the board says so, for the stylesheet');
  check(pairs.map((p) => p.attrs['data-key']).sort().join('') === mark.first.slice().sort().join(''), "part 1 is damma's six, which are fatha's");
  const row = tilesOf(pairs[0]);
  const key = pairs[0].attrs['data-key'];
  check(row.map(glyphOfTile).join() === [key, key + FATHA, key + KASRA, key + DAMMA].join(), 'the two middle tiles carry U+064E and U+0650, in that order, and the last U+064F');
  check(row.map((t) => t.attrs['data-kind']).join() === 'bare,other,other,marked' && row.map((t) => t.attrs['data-audio']).join() === 'letters,fatha,kasra,damma',
    'each tile plays its own recording: the name, then each mark\'s sound');
  check(row.map((t) => t.attrs['data-id']).join() === [key, key + FATHA, key + KASRA, key + DAMMA].join(), 'and each has the id the engine gives that item, so a missed one can be found on the board');
  check(row[1].attrs['aria-label'] === `${row[0].attrs['aria-label']} with fatha` && row[2].attrs['aria-label'] === `${row[0].attrs['aria-label']} with kasra` && row[3].attrs['aria-label'] === `${row[0].attrs['aria-label']} with damma`,
    'each is named from the same template the sighted student reads', row.map((t) => t.attrs['aria-label']).join(' | '));
  check(tilesOf($('.pairs')).every((t) => t.attrs['aria-label'] && t.querySelector('.glyph').attrs['aria-hidden'] === 'true'), 'every tile is named, and its letter hidden from a screen reader');
  check(tilesOf($('.pairs')).filter((t) => t.querySelector('.halo')).every((t) => t.classes().includes('marked')) && all('.mark-tile.other .halo').length === 0, 'only this lesson\'s own tile is pointed at');
  check(pairs.every((p) => arrowsIn(p) === 1) && arrowsIn($('.pair-feature').querySelector('.pair')) === 1, 'one arrow a row: before the mark the lesson is about');
  click(row[1], 1);
  click(row[3], 1);
  check(true, 'tapping a middle and the last tile does not throw');

  root_dataset('arrows', 'all');
  qaida.setGroup(1);
  await sleep(10);
  check($('.pairs').querySelectorAll('.pair').every((p) => arrowsIn(p) === 3), 'arrows "all": one before each of the three marks');
  root_dataset('arrows', 'none');
  qaida.setGroup(1);
  await sleep(10);
  check($('.pairs').querySelectorAll('.pair').every((p) => arrowsIn(p) === 0), 'arrows "none": no arrows');
  root_dataset('arrows', 'last');
  root_dataset('board', 'trio');
  qaida.setGroup(1);
  await sleep(10);
  const trioRow = tilesOf($('.pairs').querySelectorAll('.pair')[0]);
  check($('.pairs').attrs['data-board'] === 'trio' && trioRow.length === 3 && trioRow.map((t) => t.attrs['data-audio']).join() === 'letters,fatha,damma', 'the trio keeps the letter, the NEAREST mark (zabar) and this one');
  root_dataset('board', 'pairs');
  qaida.setGroup(1);
  await sleep(10);
  check($('.pairs').querySelectorAll('.pair').every((p) => tilesOf(p).length === 2), 'the pairs are still there: two tiles a row');
  root_dataset('board', 'marked');
  qaida.setGroup(1);
  await sleep(10);
  check($('.pairs').querySelectorAll('.pair').every((p) => tilesOf(p).length === 1), 'and just the marked letters');
  root_dataset('board', 'quad');
  qaida.setGroup(1);
  await sleep(10);

  console.log('\nThe first question');
  check($('.ask').textContent.length > 0 && !/\{/.test($('.ask').textContent), 'a question is asked, with no unfilled brace', $('.ask').textContent);
  check(choices().length === 4 && $('.progress-text').textContent === 'Just starting', 'four answers, and a line in words');
  check(shell.drillOf(6).total === 29 && $('.bar').attrs['aria-valuemax'] === '29', 'the total the home reads is the whole lesson (29)', String(shell.drillOf(6).total));

  console.log('\nAlternating: one twin a letter, and the other one in the other part');
  const oneSeen = twinsSeen(qaida, 500);
  check([...oneSeen.values()].every((marksSeen) => marksSeen.size === 1), 'in part 1 no letter is set against both marks at once', [...oneSeen].map(([k, v]) => k + [...v].map((c) => c.charCodeAt(0).toString(16))).join(' '));
  check(mark.first.every((k) => oneSeen.has(k)), 'and each of the six has its twin on the board');
  const kinds = new Set([...oneSeen.values()].flatMap((marksSeen) => [...marksSeen]));
  check(kinds.has(FATHA) && kinds.has(KASRA), 'part 1 meets both marks, across its six letters');
  qaida.setGroup(2);
  await sleep(10);
  const twoSeen = twinsSeen(qaida, 1500);
  check([...twoSeen.values()].every((marksSeen) => marksSeen.size === 1), 'in part 2 neither', String(twoSeen.size));
  const flipped = mark.first.filter((k) => oneSeen.has(k) && twoSeen.has(k) && [...oneSeen.get(k)][0] !== [...twoSeen.get(k)][0]);
  check(flipped.length === mark.first.filter((k) => twoSeen.has(k)).length && flipped.length > 0, 'and a letter drilled against one mark in part 1 is drilled against the other in part 2', flipped.join(''));
  qaida.setGroup(1);
  await sleep(10);

  console.log('\nThe wrong answer that makes the lesson: the same letter, another mark');
  qaida.next();
  let own = 0;
  let ownWithTwin = 0;
  let twinAsked = 0;
  let bare = 0;
  for (let i = 0; i < 200; i += 1) {
    const it = promptItem();
    if (it && it.mark === 'damma') {
      own += 1;
      if (choices().some((c) => c.attrs['data-id'] === it.key + FATHA || c.attrs['data-id'] === it.key + KASRA)) ownWithTwin += 1;
    } else if (it && (it.mark === 'fatha' || it.mark === 'kasra')) twinAsked += 1;
    else if (it) bare += 1;
    qaida.next();
  }
  check(own > 0 && ownWithTwin === own, 'a question about paish always has the same letter with zabar or zair among the answers', `${ownWithTwin} of ${own}`);
  check(twinAsked > 0 && twinAsked / (own + twinAsked) > 0.2 && twinAsked / (own + twinAsked) < 0.6, 'and between a fifth and a half of the questions are about the twins themselves: Lesson 5\'s measured shape', `${Math.round((100 * twinAsked) / (own + twinAsked))}%`);
  check(bare === 0, 'no plain letter is asked', String(bare));

  console.log('\nAnswering: each says what the letter really carries');
  let it = null;
  for (let i = 0; i < 100 && !(it && it.mark === 'kasra'); i += 1) { qaida.next(); it = promptItem(); }
  check(it && it.mark === 'kasra', 'a zair twin comes up');
  click(answerFor(), 1);
  check(/^Yes — .+ with kasra\.$/.test($('.verdict').textContent) && !/damma/.test($('.verdict').textContent), 'a right zair letter says "with kasra", on a page about damma', $('.verdict').textContent);
  qaida.next();
  it = null;
  for (let i = 0; i < 100 && !(it && it.mark === 'kasra'); i += 1) { qaida.next(); it = promptItem(); }
  click(wrongFor(), 1);
  const twinWrong = $('.verdict').textContent;
  check(/^That one is .+\. This is .+ with kasra\.$/.test(twinWrong) && !/wrong|incorrect|try again|!/i.test(twinWrong), 'a missed zair letter names both and never scolds', twinWrong);
  check(all('.mark-tile.other').some((t) => t.attrs['data-missed'] !== undefined && t.attrs['data-id'] === it.id), 'and the board lights that letter\'s zair tile, in its own column');
  check(all('.mark-tile.other').filter((t) => t.attrs['data-missed'] !== undefined).every((t) => t.attrs['data-id'] === it.id) && all('.mark-tile.marked').every((t) => t.attrs['data-missed'] === undefined), 'and only that one');
  check($('.advice .struggle').hidden, 'a missed twin is not advice');
  click($('.after .trace'), 1);
  check(opened.length >= 1 && opened[opened.length - 1][0] === it.glyph, '"Write it" opens the board on the twin with its own mark', JSON.stringify(opened[opened.length - 1]));
  click($('.next-question'), 1);
  await sleep(10);
  it = null;
  for (let i = 0; i < 100 && !(it && it.mark === 'damma'); i += 1) { qaida.next(); it = promptItem(); }
  const twinId = choices().map((c) => c.attrs['data-id']).find((id) => id === it.key + FATHA || id === it.key + KASRA);
  const twinName = twinId.endsWith(FATHA) ? 'fatha' : 'kasra';
  click(choices().find((c) => c.attrs['data-id'] === twinId), 1);
  check(new RegExp(`^That one is ${it.letterName} with ${twinName}\\. This is ${it.letterName} with damma\\.$`).test($('.verdict').textContent), 'picking an earlier mark for a paish letter says exactly that, and nothing more', $('.verdict').textContent);
  check(all('.mark-tile.marked').some((t) => t.attrs['data-missed'] !== undefined && t.attrs['data-id'] === it.id), 'and lights paish\'s own tile');
  click($('.next-question'), 1);
  await sleep(10);

  console.log('\nThe question line');
  qaida.setFormat('name');
  await sleep(10);
  qaida.next();
  const lines = new Set();
  for (let i = 0; i < 80; i += 1) {
    const shownName = $('.prompt-name') ? $('.prompt-name').textContent : '';
    const ownName = everyItem().some((x) => x.name === shownName);
    if (shownName) lines.add(`${ownName ? 'own' : 'twin'}: ${$('.ask').textContent}`);
    qaida.next();
  }
  check(lines.has('own: Which one has damma on it?'), 'asked by name, a paish letter asks "Which one has damma on it?"', [...lines].join(' | '));
  check(!lines.has('twin: Which one has damma on it?') && lines.has('twin: Which one is this?'), 'and a twin asks "Which one is this?"', [...lines].join(' | '));
  qaida.setFormat('mark');

  console.log('\nMoving between parts');
  click(railButton(2), 1);
  await sleep(20);
  check($('.pairs').querySelectorAll('.pair').length === 29 && $('.pairs').querySelectorAll('.pair').every((p) => tilesOf(p).length === 4), 'part 2: all 29 letters, each a row of four');
  check(!$('.band-advice').hidden && /comes later/i.test($('.band-advice .struggle-text').textContent), 'a part opened out of turn is advised about, once');
  check(shell.drillOf(6).total === 29, 'the total the home reads stays the whole lesson');
  qaida.setGroup(1);

  console.log('\nKnowing a part: the twins never count');
  shell.clearLesson(6);
  qaida.setGroup(1);
  const groupOne = marks.poolFor(everyItem(), 1);
  const twinsAll = marks.twinItems(shell, mark, { keys: keysOf() });
  check(twinsAll.length === 58, 'there are 58 twins in the record when both are known', String(twinsAll.length));
  for (const twin of twinsAll) for (let k = 0; k < 3; k += 1) shell.recordAnswer(6, twin.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(6) && $('.ready-note').hidden, 'every twin known is not a lesson known: nothing finished, no "you seem ready"');
  check(shell.masteredCount(6) === 0 && $('.bar').attrs['aria-valuenow'] === '0', 'the home\'s card and the page\'s bar both read nothing', `${shell.masteredCount(6)} / ${$('.bar').attrs['aria-valuenow']}`);
  for (const item of groupOne.slice(0, 5)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(6, item.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(6) && !$('.ready-note').hidden && /seem to know this part/.test($('.ready-note').textContent), 'part 1 says you seem to know it, and the lesson is not done', $('.ready-note').textContent);
  check(shell.masteredCount(6) === 5 && $('.bar').attrs['aria-valuenow'] === '5', 'and the home\'s card equals the page\'s bar: 5 of 29, though 58 twins are known too', `${shell.masteredCount(6)} / ${$('.bar').attrs['aria-valuenow']}`);
  for (const item of everyItem().slice(0, 23)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(6, item.id, true);
  qaida.setGroup(2);
  await sleep(10);
  check(!shell.isDone(6), '23 of 29 is under four fifths of the lesson\'s own: not finished', `${shell.masteredCount(6)} known`);
  for (const item of everyItem()) for (let k = 0; k < 3; k += 1) shell.recordAnswer(6, item.id, true);
  qaida.setGroup(2);
  await sleep(10);
  check(shell.isDone(6), 'all 29 of its own known marks the lesson finished, at four fifths of the 29 and not of the pool');
  check(/^You can tell all three marks apart\. This lesson is marked as done/.test($('.end-line').textContent), 'and the last line names what was earned', $('.end-line').textContent);
  check(/You seem to know damma on every letter/.test($('.ready-note').textContent), 'and the advice names the mark', $('.ready-note').textContent);
  check($('.bar').attrs['aria-valuenow'] === '29' && shell.masteredCount(6) === 29 && $('.progress-text').textContent === 'All known', 'the bar is full, the home agrees, and it says so in words');

  console.log('\nThe name set changes the words with no reload');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check($('h1').textContent === 'Paish' && doc.title.startsWith('Lesson 6: Paish'), 'the title becomes Paish', `${$('h1').textContent} / ${doc.title}`);
  check($('.next').querySelector('span').textContent === 'Next: Tanween', 'and the way on is Tanween in both sets of names');
  check($('.alone-label').textContent === 'This is paish.' && $('.alone-sits').textContent === 'Paish sits above the letter, in the same place as zabar.', 'the board says paish, and zabar');
  check($('.mark-does').textContent === 'Paish is a different shape from zabar and zair, in the same place as zabar. It is a small curl, not a wow.', 'and the sentence follows the name set on ALL THREE marks', $('.mark-does').textContent);
  const zRow = tilesOf($('.pairs').querySelectorAll('.pair')[0]);
  check(zRow.slice(1).map((t) => t.attrs['aria-label'].replace(/^\S+ /, '')).join('|') === 'with zabar|with zair|with paish', 'the quartet is named "with zabar", "with zair" and "with paish": the third AND the fourth column follow', zRow.map((t) => t.attrs['aria-label']).join(' | '));
  check($('.pair-feature').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|') === 'The letter on its own|The same letter with zabar|The same letter with zair|The letter with paish', 'and the featured captions follow');
  check($('.ready-note').textContent === 'You seem to know paish on every letter.', 'and the advice');
  check(choices().length === 4 && !/fatha|kasra|damma/.test(choices().map(labelOf).join('|')), 'no choice still says fatha, kasra or damma', choices().map(labelOf).join(' | '));
  shell.state.names = 'fatha';
  shell.renderSetup();

  console.log('\nThe other script');
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  qaida.setGroup(2);
  const kaaf = $('.pairs').querySelectorAll('.pair').find((p) => p.attrs['data-key'] === 'ك');
  check(kaaf && tilesOf(kaaf).map(glyphOfTile).join() === ['ک', 'ک' + FATHA, 'ک' + KASRA, 'ک' + DAMMA].join(), 'the Indo-Pak kaaf is written in its own form, with each mark', kaaf && tilesOf(kaaf).map(glyphOfTile).join(' '));
  check(shell.drillOf(6).streak['ك' + DAMMA] >= 3, 'and what was learnt is kept across the change');
  shell.state.script = 'madani';
  shell.renderSetup();

  console.log('\nThe options: both, off, and the old word');
  shell.clearLesson(6);
  qaida.setGroup(1);
  root_dataset('twins', 'both');
  qaida.setTwins();
  await sleep(10);
  const bothSeen = twinsSeen(qaida, 500);
  check(qaida.twinMode === 'both' && mark.first.every((k) => bothSeen.has(k) && bothSeen.get(k).size === 2), 'both at once: every letter is set against both marks', qaida.twinMode);
  root_dataset('twins', 'on');
  qaida.setTwins();
  await sleep(10);
  check(qaida.twinMode === 'both' && qaida.twins === true, '"on", the word Lesson 5 used and a teacher may have exported, still works: it means both');
  root_dataset('twins', 'off');
  qaida.setTwins();
  await sleep(10);
  qaida.setGroup(1);
  qaida.next();
  let twinsOff = 0;
  let plain = 0;
  let sharing = 0;
  let checkedQ = 0;
  for (let i = 0; i < 80; i += 1) {
    const q = promptItem();
    if (q && (q.mark === 'fatha' || q.mark === 'kasra')) twinsOff += 1;
    if (q && !q.marked) plain += 1;
    if (q && q.mark === 'damma') {
      checkedQ += 1;
      if (choices().some((c) => c.attrs['data-id'] === q.key + FATHA || c.attrs['data-id'] === q.key + KASRA)) sharing += 1;
    }
    qaida.next();
  }
  check(qaida.twins === false && twinsOff === 0 && plain === 0, 'off: no earlier mark is asked, and lesson still runs', `${twinsOff} twins, ${plain} plain`);
  check(checkedQ > 0 && sharing < checkedQ, 'and the earlier marks are no longer always among the wrong answers', `${sharing} of ${checkedQ}`);
  root_dataset('twins', 'alternate');
  qaida.setTwins();
  await sleep(10);
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
    if (q) { if (!q.marked) plain8 += 1; else if (q.mark !== 'damma') twin8 += 1; else own8 += 1; }
    qaida.next();
  }
  check(plain8 > 0 && twin8 > 0 && own8 > 0, 'with the plain letters turned up, all three kinds are asked', `${own8} own, ${twin8} twins, ${plain8} plain`);
  root_dataset('review', '0');
  qaida.setReview(0);
  await sleep(10);

  console.log('\nHearing, and the boundary');
  check(qaida.sound === 0, 'no letter has a recording of the sound "bu" yet, so hearing is off');
  qaida.setFormat('sound');
  await sleep(10);
  check($('.verdict').textContent.length > 0 || $('.prompt').children.length === 0, 'asked to hear with nothing recorded, the page says so and asks nothing it cannot');
  qaida.setFormat('mark');

  console.log('\nStart again');
  click($('.reset'), 1);
  click($('.reset'), 1);
  await sleep(10);
  check(shell.masteredCount(6) === 0 && !shell.isDone(6) && railButton(1).attrs['aria-current'] === 'page', 'clears what was learnt, and goes back to part 1');

  console.log('\nThe markup');
  const html = raw;
  check(!/[ً-ْ]/.test(html), 'lesson-6.html holds no literal combining mark: the title glyph is a numeric reference');
  check(/&#x628;&#x64F;/.test(html), 'the title glyph is baa and U+064F');
  const visible = html.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again)\b/i.test(visible), 'no scolding anywhere on the page');
  check(all('[data-words], [data-words-attr]').length > 30, 'every line of wording is tagged for a text field of its own');
  const wordsAttr = html.match(/data-words-attr="[^"]*"/g).join(' ');
  check(['data-pair-other|', 'data-mark-does|', 'data-mark-sits|', 'data-spot|', 'data-finished|'].every((f) => wordsAttr.includes(f)), 'the changed strings each have a text field: the column caption, what the mark does, where it sits, the spot line, the end line');
  check(!fs.existsSync(path.join(dir, 'lesson-6.js')) && all('.title-mark').length === 1, 'there is no lesson-6.js: mark-lesson.js is the page');
  check(html.replace(/<!--[\s\S]*?-->/g, '').includes('data-titlemark="bu"'), 'the layout slug is "bu"');
  const css = fs.readFileSync(path.join(dir, 'qaida.css'), 'utf8');
  check(!/data-sits=['"]above['"]/.test(css), 'and the stylesheet has no [data-sits="above"] rule: the tile is Lesson 4\'s, untouched');
  check(/\.pair\.quad/.test(css) && /data-board='quad'/.test(css), 'but it has the quartet\'s rows');

  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exitCode = failed;
}

function root_dataset(key, value) { htmlEl.attrs[`data-${kebab(key)}`] = value; }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
