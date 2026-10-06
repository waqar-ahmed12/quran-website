// Runs the mark lesson's page script against the real lesson-12.html in a small hand-made DOM, with no browser
// (QAIDA-BUILD.md step 9). The harness of qaida-lesson11-check.js, pointed at lesson-12.html (docs/lesson-12/06 §3).
//
//   node tools/qaida-lesson12-check.js
//
// The same limits as every other lesson-N-check: nothing is drawn and no CSS runs, so it cannot tell whether the
// yaa's bowl clips at the bottom of a tile, whether a laam and a yaa fuse into one shape, whether the halo rings the
// yaa or the zabar, or how the dotless Indo-Pak end looks. Those are the user's (docs/lesson-12/06 §4). What it does
// prove: the scripts load against the markup, and the quartet (with no same-sound tile), the per-script jazam line
// and its dotless-yaa sentence, the id that is neither script's drawing, the twins, the 27-letter table, the joined
// block, the parts, the words and the end of the lesson do what they say. Prints PASS or FAIL per check; the exit
// code is the number that failed.

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

const PAGE = 'lesson-12.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 12: Zabar and yaa · Free Qaida',
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
const KASRA = String.fromCharCode(0x0650);
const ALIF = String.fromCharCode(0x0627);
const YAA = String.fromCharCode(0x064A); // the letter as the id spells it (Madani's, the fold every key uses)
const YAA_IP = String.fromCharCode(0x06CC); // the Indo-Pak yaa
const JAZAM = String.fromCharCode(0x0652); // the mark as the id spells it (the Indo-Pak code point)
const JAZAM_M = String.fromCharCode(0x06E1); // the mark as Madani draws it (Lesson 10's measurement)
const WAW = String.fromCharCode(0x0648);
const WOW = WAW + JAZAM; // Lesson 10's tail, as its id spells it
const TAIL = YAA + JAZAM; // this lesson's tail, as the id spells it
const DRAWN_WOW = WAW + JAZAM_M; // Lesson 10's wow as Madani draws it
const mark = marks.MARKS['fatha-yaa'];
const wowMark = marks.MARKS['fatha-waw'];
const fatha = marks.MARKS.fatha;
const click = (el, detail = 1) => {
  const event = { type: 'click', target: el, detail, preventDefault() { this.defaultPrevented = true; } };
  for (let n = el; n; n = n.parent) for (const fn of n.listeners.click || []) fn.call(n, event);
};
const choices = () => $('.choices').children;
const rail = () => all('.band');
const everyItem = () => marks.allItems(shell, mark);
const keysOf = () => everyItem().map((it) => it.key);
const promptItem = () => {
  const shown = $('.prompt-glyph') ? $('.prompt-glyph').textContent : '';
  return everyItem().find((it) => it.glyph === shown)
    || marks.twinItems(shell, mark, { keys: keysOf(), marks: [fatha, wowMark] }).find((it) => it.glyph === shown)
    || marks.reviewItems(shell, mark, { count: 27 }).find((it) => it.glyph === shown);
};
const answerFor = () => choices().find((c) => c.attrs['data-id'] === promptItem().id);
const wrongFor = () => choices().find((c) => c !== answerFor());
const tilesOf = (pair) => pair.querySelectorAll('button.mark-tile');
const glyphOfTile = (tile) => tile.querySelector('.glyph').textContent;
const jazamNote = () => $('.jazam-note').textContent;

async function main() {
  await sleep(20);
  qaida.setPause(1);

  console.log('\nThe page');
  check(qaida.kind === 'drill' && qaida.hasOther === true && qaida.otherCount === 2 && qaida.hasTail === true,
    'publishes window.qaida with kind "drill", two other marks to tell apart from, and a tail');
  check(htmlEl.attrs['data-mark'] === 'fatha-yaa' && htmlEl.attrs['data-sits'] === 'above', 'the page teaches fatha-yaa, above the letter');
  check(htmlEl.attrs['data-board'] === 'quad' && htmlEl.attrs['data-arrows'] === 'last' && htmlEl.attrs['data-twins'] === 'alternate',
    'a quartet, one arrow before the last tile, and the twins alternating');
  check(JSON.stringify(qaida.groupCosts().map((p) => [p.items])) === '[[6],[27]]', 'groupCosts() is 6 then 27', JSON.stringify(qaida.groupCosts()));
  check(rail().length === 2 && rail().every((b) => b.attrs.disabled === undefined), 'two parts, both enabled: nothing is locked');

  console.log('\nThe head');
  check($('h1').textContent === 'Fatha and yaa' && doc.title.startsWith('Lesson 12: Fatha and yaa'), 'the title is Fatha and yaa in the fatha set', `${$('h1').textContent} / ${doc.title}`);
  check($('.title-mark').textContent === 'ب' + FATHA + YAA + JAZAM_M, 'the big glyph, Madani: baa, fatha, yaa and the open jazam, composed', $('.title-mark').textContent);
  check($('.eyebrow').textContent === 'Lesson 12 of 29' && all('.track li').findIndex((li) => li.classes().includes('now')) === 11, 'Lesson 12 of 29, the twelfth of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '27', 'the bar\'s total is 27');

  console.log('\nThe board: the quartet, no same-sound tile, the jazam line, the joined block');
  const feature = $('.pair-feature');
  const featured = tilesOf(feature);
  check(featured.length === 4, 'the feature row has four tiles: the quartet, and no same-sound tile', String(featured.length));
  check(!feature.querySelector('.pair-cell.same') && !/data-same/.test(raw.replace(/<!--[\s\S]*?-->/g, '')), 'no same-sound tile, and no data-same on the page');
  const pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6 && pairs.some((p) => p.attrs['data-key'] === 'ل'), 'part 1 has six letters, laam among them', String(pairs.length));
  const row = tilesOf(pairs[0]);
  const key = pairs[0].attrs['data-key'];
  check(row.map(glyphOfTile).join() === [key, key + FATHA, key + FATHA + DRAWN_WOW, key + FATHA + YAA + JAZAM_M].join(),
    'the road, Madani: bare, ba, bau (the wow of Lesson 10, open jazam), bai (the yaa and the open jazam)', row.map(glyphOfTile).join());
  const id = row[3].attrs['data-id'];
  check(id === key + FATHA + TAIL && id.length === 4, 'the marked tile\'s id is four characters: the letter, zabar, yaa, jazam', id);
  check(!id.includes(YAA_IP) && !id.includes(JAZAM_M), 'and it holds neither the Indo-Pak yaa nor the Madani jazam: it is not a drawing');
  check(row[3].attrs['data-tail'] === '' && row[0].attrs['data-tail'] === undefined && row[1].attrs['data-tail'] === undefined,
    'the marked tile carries data-tail, the bare and short ones do not');
  check(pairs.every((p) => !p.querySelector('.pair-cell.same')), 'no same-sound tile on the letter rows either');

  check(!$('.jazam-note').hidden && /^The small mark on the yaa is sukoon, as on the wow: the yaa has no sound of its own, so it runs into the fatha\.$/.test(jazamNote()),
    'Madani: the jazam line names the yaa, sukoon and fatha, and says nothing about dots', jazamNote());
  check(!/\{/.test(jazamNote()), 'with every token filled');
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  check(jazamNote().startsWith('The small mark on the yaa is sukoon, as on the wow:') && jazamNote().endsWith(`At the end of a word, the Indo-Pak yaa has no dots: ${YAA_IP}.`),
    'Indo-Pak: the same line, then the sentence about the dotless yaa at the end', jazamNote());
  const rowIP = tilesOf($('.pairs').querySelectorAll('.pair')[0]);
  check(glyphOfTile(rowIP[3]) === key + FATHA + YAA_IP + JAZAM && rowIP[3].attrs['data-id'] === key + FATHA + TAIL,
    'and the Indo-Pak tile draws the Indo-Pak yaa (U+06CC) and U+0652 while keeping the same id', glyphOfTile(rowIP[3]));
  check(glyphOfTile(rowIP[2]) === key + FATHA + WOW, 'Lesson 10\'s wow in the same row is drawn with U+0652, as before');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check(/is jazam, as on the wow/.test(jazamNote()) && /into the zabar\./.test(jazamNote()) && !/\{|fatha|sukoon/.test(jazamNote()),
    'the zabar set fills {other} as zabar and the mark as jazam, in Indo-Pak', jazamNote());
  shell.state.script = 'madani';
  shell.renderSetup();
  await sleep(10);
  check(/into the zabar\.$/.test(jazamNote()) && !/no dots/.test(jazamNote()), 'and in Madani, without the dotless sentence', jazamNote());
  shell.state.names = 'fatha';
  shell.renderSetup();
  await sleep(10);

  const joined1 = $('.joined-glyph').textContent.split('  ').filter(Boolean);
  check(joined1.length === 2 && joined1.every((g) => g.endsWith(FATHA + YAA + JAZAM_M)), 'the joined block: two examples, each ending in the yaa', joined1.join(' | '));
  check(marks.NEVER_JOIN.includes(joined1[1][0]) && !marks.NEVER_JOIN.includes(joined1[0][0]), 'one joins the yaa on and one never joins forward');
  check(!$('.lam-alif-note'), 'no lam-alif line on the page at all');

  console.log('\nPart 2: 27 letters, the skip note, still no lam-alif');
  qaida.setGroup(2);
  await sleep(10);
  const pairs2 = $('.pairs').querySelectorAll('.pair');
  check(pairs2.length === 27 && !pairs2.some((p) => ['ا', 'ء'].includes(p.attrs['data-key'])), 'part 2 is 27 letters, no alif, no hamza', String(pairs2.length));
  check(pairs2.some((p) => p.attrs['data-key'] === 'ي'), 'yaa with zabar and yaa stays: it is in a printed table');
  check(!$('.skip-note').hidden && $('.skip-note').textContent.length > 0, 'the skip note shows');
  check(!$('.pair-feature').querySelector('.pair-cell.same'), 'no same-sound tile in part 2');
  const joined2 = $('.joined-glyph').textContent.split('  ').filter(Boolean);
  check(joined2.length === 2, 'the joined block still has two examples: no laam third', joined2.join(' | '));
  qaida.setGroup(1);
  await sleep(10);

  console.log('\nThe wrong answers: its twin, never "baa", never a later lesson');
  for (const n of [1, 2]) {
    qaida.setGroup(n);
    await sleep(5);
    qaida.next();
    let own = 0;
    let withTwin = 0;
    let longAlif = 0;
    let later = 0;
    for (let i = 0; i < 250; i += 1) {
      const it = promptItem();
      const ids = choices().map((c) => c.attrs['data-id']);
      if (it && it.mark === 'fatha-yaa') {
        own += 1;
        if (ids.some((x) => x === it.key + FATHA || x === it.key + FATHA + WOW)) withTwin += 1;
      }
      if (ids.some((x) => x.endsWith(FATHA + ALIF))) longAlif += 1;
      if (ids.some((x) => x.endsWith(KASRA + TAIL))) later += 1;
      qaida.next();
    }
    check(own > 0 && withTwin === own, `part ${n}: every "ai" question offers its twin (ba or au)`, `${withTwin} of ${own}`);
    check(longAlif === 0, `part ${n}: never a zabar-and-alif item among the answers (not a twin)`, String(longAlif));
    check(later === 0, `part ${n}: never a Lesson 13 item`, String(later));
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
  for (let i = 0; i < 100 && !(it && it.mark === 'fatha-yaa'); i += 1) { qaida.next(); it = promptItem(); }
  check(it && it.mark === 'fatha-yaa', 'a Lesson 12 item comes up');
  click(answerFor(), 1);
  check(new RegExp(`^Yes — ${it.letterName} with fatha and yaa\\.$`).test($('.verdict').textContent), 'a right answer says "with fatha and yaa"', $('.verdict').textContent);

  console.log('\nFinishing: part 2 is the gate, at seven tenths of 27');
  shell.clearLesson(12);
  for (const item of marks.poolFor(everyItem(), 1)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(12, item.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(12), 'part 1 known alone does not finish the lesson');
  shell.clearLesson(12);
  const part2 = marks.poolFor(everyItem(), 2);
  for (const item of part2.slice(0, Math.ceil(27 * 0.7))) for (let k = 0; k < 3; k += 1) shell.recordAnswer(12, item.id, true);
  qaida.setGroup(2);
  await sleep(10);
  check(shell.isDone(12), 'seven tenths of part 2 known finishes the lesson');
  check(shell.masteredCount(12) === Math.ceil(27 * 0.7), 'and the home counts exactly those', String(shell.masteredCount(12)));
  check([4, 6, 8, 10, 11].every((n) => shell.masteredCount(n) === 0), 'none of it counts toward Lesson 4, 6, 8, 10 or 11');

  console.log('\nThe zabar set');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check($('h1').textContent === 'Zabar and yaa', 'the title becomes Zabar and yaa', $('h1').textContent);
  check(!/damma|fatha|sukoon/.test(choices().map((c) => (c.attrs['aria-label'] || (c.firstChild && c.firstChild.textContent))).join('|')), 'no choice still says fatha');
  shell.state.names = 'fatha';
  shell.renderSetup();

  console.log('\nThe Spell block: baytun in two steps, bay never split');
  qaida.setGroup(1);
  await sleep(10);
  const units = $('.spell-glyph').querySelectorAll('.unit');
  check(units.length === 2 && units[0].textContent === 'ب' + FATHA + YAA + JAZAM_M, 'baytun is two steps; the first is baa with zabar and yaa, whole', units.map((u) => u.textContent).join(' | '));
  console.log(`      caption: ${$('.spell-caption').textContent}`);
  check($('.prev').attrs.href === 'lesson-11.html', 'Previous goes to Lesson 11');
  check($('.spell-more a').attrs.href === 'exercise-12.html' && fs.existsSync(path.join(dir, 'exercise-12.html')), 'Practice reading goes to exercise-12.html, which exists');

  console.log('\nThe yaa: drawn by script, never spelt by it');
  check(marks.drawnOf(mark, 'madani') === FATHA + YAA + JAZAM_M && marks.drawnOf(mark, 'indopak') === FATHA + YAA_IP + JAZAM,
    'Madani draws U+064A and U+06E1, Indo-Pak U+06CC and U+0652');
  check(marks.suffixOf(mark) === FATHA + TAIL, 'and the id spells U+064A and U+0652 in both');
  shell.clearLesson(12);
  for (let k = 0; k < 3; k += 1) shell.recordAnswer(12, 'ب' + FATHA + TAIL, true);
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(5);
  check(shell.masteredCount(12) === 1, 'a letter known in Madani is still known after switching to Indo-Pak');
  shell.state.script = 'madani';
  shell.renderSetup();
  await sleep(5);
  check(shell.masteredCount(12) === 1, 'and back again');

  console.log('\nThe markup');
  check(!/[ً-ٗۡ]/.test(raw), 'lesson-12.html holds no literal combining mark');
  check(/&#x628;&#x64E;&#x64A;&#x652;/.test(raw), 'the title glyph is baa, U+064E, U+064A, U+0652');
  check(!/\b29\b/.test(raw.replace(/Lesson \d+ of 29/g, '').replace(/<!--[\s\S]*?-->/g, '')), 'no "29" anywhere on the page');
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
