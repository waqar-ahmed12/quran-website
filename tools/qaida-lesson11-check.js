// Runs the mark lesson's page script against the real lesson-11.html in a small hand-made DOM, with no browser
// (QAIDA-BUILD.md step 9). The harness of qaida-lesson10-check.js, pointed at lesson-11.html (docs/lesson-11/06 §3).
//
//   node tools/qaida-lesson11-check.js
//
// The same limits as every other lesson-N-check: nothing is drawn and no CSS runs, so it cannot tell whether five
// tiles fit the feature row, whether paish and zabar can be told apart at the tile's size in Indo-Pak, or where the
// halo lands. Those are the user's (docs/lesson-11/06 §4). What it does prove: the scripts load against the markup,
// and the quartet, the same-sound tile, the per-script jazam line, the twins, the 27-letter table, the joined block,
// the parts, the words and the end of the lesson do what they say. Prints PASS or FAIL per check; the exit code is
// the number that failed.

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

const PAGE = 'lesson-11.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 11: Paish and wow · Free Qaida',
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
const DAMMA = String.fromCharCode(0x064F);
const ULTA = String.fromCharCode(0x0657);
const YAA = String.fromCharCode(0x064A);
const JAZAM = String.fromCharCode(0x0652);
const WAW = String.fromCharCode(0x0648);
const WOW = WAW + JAZAM; // the tail, as the id spells it
const DRAWN = WAW + String.fromCharCode(0x06E1); // Lesson 10's wow as Madani draws it
const mark = marks.MARKS['damma-waw'];
const wowMark = marks.MARKS['fatha-waw'];
const damma = marks.MARKS.damma;
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
    || marks.twinItems(shell, mark, { keys: keysOf(), marks: [damma, wowMark] }).find((it) => it.glyph === shown)
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
  check(htmlEl.attrs['data-mark'] === 'damma-waw' && htmlEl.attrs['data-sits'] === 'above', 'the page teaches damma-waw, above the letter');
  check(htmlEl.attrs['data-board'] === 'quad' && htmlEl.attrs['data-arrows'] === 'last' && htmlEl.attrs['data-twins'] === 'alternate',
    'a quartet, one arrow before the last tile, and the twins alternating');
  check(JSON.stringify(qaida.groupCosts().map((p) => [p.items])) === '[[6],[27]]', 'groupCosts() is 6 then 27', JSON.stringify(qaida.groupCosts()));
  check(rail().length === 2 && rail().every((b) => b.attrs.disabled === undefined), 'two parts, both enabled: nothing is locked');

  console.log('\nThe head');
  check($('h1').textContent === 'Damma and waw' && doc.title.startsWith('Lesson 11: Damma and waw'), 'the title is Damma and waw in the fatha set (not "waw" alone)', `${$('h1').textContent} / ${doc.title}`);
  check($('.title-mark').textContent === 'ب' + DAMMA + WAW, 'the big glyph, Madani: baa with damma and a bare wow, composed');
  check($('.eyebrow').textContent === 'Lesson 11 of 14' && all('.track li').findIndex((li) => li.classes().includes('now')) === 10, 'Lesson 11 of 14, the eleventh of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '27', 'the bar\'s total is 27');

  console.log('\nThe board: the quartet, the same-sound tile, the jazam line, the joined block');
  const feature = $('.pair-feature');
  const featured = tilesOf(feature);
  check(featured.length === 5, 'the feature row has five tiles: the quartet and the same-sound tile', String(featured.length));
  const pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6 && pairs.some((p) => p.attrs['data-key'] === 'ل'), 'part 1 has six letters, laam among them', String(pairs.length));
  const row = tilesOf(pairs[0]);
  const key = pairs[0].attrs['data-key'];
  check(row.map(glyphOfTile).join() === [key, key + DAMMA, key + FATHA + DRAWN, key + DAMMA + WAW].join(),
    'the road, Madani: bare, bu, bau (the wow of the last lesson, U+06E1), buu (paish and wow bare, no jazam)', row.map(glyphOfTile).join());
  check(row[3].attrs['data-id'] === key + DAMMA + WOW && row[3].attrs['data-id'].length === 4, 'the marked tile\'s id is four characters: the letter, damma, wow, jazam');
  check(row[3].attrs['data-tail'] === '' && row[0].attrs['data-tail'] === undefined && row[1].attrs['data-tail'] === undefined,
    'the marked tile carries data-tail, the bare and short ones do not');
  const sameCell = feature.querySelector('.pair-cell.same');
  check(Boolean(sameCell), 'the same-sound tile is on part 1\'s feature row');
  check(sameCell && sameCell.querySelector('button.mark-tile') && sameCell.querySelector('button.mark-tile').attrs['data-id'].endsWith(ULTA),
    'and it is the ulta paish letter: its id ends U+0657', sameCell && sameCell.querySelector('button.mark-tile').attrs['data-id']);
  check(sameCell && !sameCell.querySelector('.halo'), 'with no halo: it is never pointed at as this lesson\'s own stroke');
  check(pairs.every((p) => !p.querySelector('.pair-cell.same')), 'no same-sound tile on the letter rows: the feature row only');

  check(!$('.jazam-note').hidden && /^Here the wow has no mark on it\. After damma, a bare wow makes the sound long\. In the last lesson the wow had a sukoon, and said au\.$/.test(jazamNote()),
    'Madani: the jazam line says the wow is bare, names damma and sukoon', jazamNote());
  check(!/\{/.test(jazamNote()), 'with every token filled');
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  check(/^The wow carries a sukoon here too, as in the last lesson\. What changed is the mark before it: after damma, the wow makes the sound long\.$/.test(jazamNote()),
    'Indo-Pak: the line swaps to the wow that carries a jazam', jazamNote());
  const rowIP = tilesOf($('.pairs').querySelectorAll('.pair')[0]);
  check(glyphOfTile(rowIP[3]) === key + DAMMA + WOW && rowIP[3].attrs['data-id'] === key + DAMMA + WOW,
    'and the Indo-Pak tile draws the jazam while keeping the same id', glyphOfTile(rowIP[3]));
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check(/after paish, the wow/.test(jazamNote()) && !/\{|damma/.test(jazamNote()), 'the zabar set fills {other} as paish, in Indo-Pak too', jazamNote());
  shell.state.script = 'madani';
  shell.renderSetup();
  await sleep(10);
  check(/After paish, a bare wow/.test(jazamNote()) && /the wow had a jazam, and said au/.test(jazamNote()), 'and in Madani, with jazam for the small mark', jazamNote());
  shell.state.names = 'fatha';
  shell.renderSetup();
  await sleep(10);

  const joined1 = $('.joined-glyph').textContent.split('  ').filter(Boolean);
  check(joined1.length === 2 && joined1.every((g) => g.endsWith(DAMMA + WAW)), 'the joined block: two examples, one joining and one apart', joined1.join(' | '));
  check(!$('.lam-alif-note'), 'no lam-alif line on the page at all');

  console.log('\nPart 2: 27 letters, the skip note, still no lam-alif');
  qaida.setGroup(2);
  await sleep(10);
  const pairs2 = $('.pairs').querySelectorAll('.pair');
  check(pairs2.length === 27 && !pairs2.some((p) => ['ا', 'ء'].includes(p.attrs['data-key'])), 'part 2 is 27 letters, no alif, no hamza', String(pairs2.length));
  check(pairs2.some((p) => p.attrs['data-key'] === 'و'), 'wow with damma and wow stays');
  check(!$('.skip-note').hidden && $('.skip-note').textContent.length > 0, 'the skip note shows');
  check(!$('.pair-feature').querySelector('.pair-cell.same'), 'no same-sound tile in part 2');
  const joined2 = $('.joined-glyph').textContent.split('  ').filter(Boolean);
  check(joined2.length === 2, 'the joined block still has two examples: no laam third', joined2.join(' | '));
  qaida.setGroup(1);
  await sleep(10);

  console.log('\nThe wrong answers: its twin, never ulta paish, never a later lesson');
  for (const n of [1, 2]) {
    qaida.setGroup(n);
    await sleep(5);
    qaida.next();
    let own = 0;
    let withTwin = 0;
    let ulta = 0;
    let later = 0;
    for (let i = 0; i < 250; i += 1) {
      const it = promptItem();
      const ids = choices().map((c) => c.attrs['data-id']);
      if (it && it.mark === 'damma-waw') {
        own += 1;
        if (ids.some((id) => id === it.key + DAMMA || id === it.key + FATHA + WOW)) withTwin += 1;
      }
      if (ids.some((id) => id.endsWith(ULTA))) ulta += 1;
      if (ids.some((id) => id.endsWith(FATHA + YAA + JAZAM) || id.endsWith(String.fromCharCode(0x0650, 0x064A, 0x0652)))) later += 1;
      qaida.next();
    }
    check(own > 0 && withTwin === own, `part ${n}: every "oo" question offers its twin (bu or au)`, `${withTwin} of ${own}`);
    check(ulta === 0, `part ${n}: never an ulta paish item among the answers`, String(ulta));
    check(later === 0, `part ${n}: never a Lesson 12 item`, String(later));
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
  for (let i = 0; i < 100 && !(it && it.mark === 'damma-waw'); i += 1) { qaida.next(); it = promptItem(); }
  check(it && it.mark === 'damma-waw', 'a Lesson 11 item comes up');
  click(answerFor(), 1);
  check(new RegExp(`^Yes — ${it.letterName} with damma and waw\\.$`).test($('.verdict').textContent), 'a right answer says "with damma and waw"', $('.verdict').textContent);

  console.log('\nFinishing: part 2 is the gate, at seven tenths of 27');
  shell.clearLesson(11);
  for (const item of marks.poolFor(everyItem(), 1)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(11, item.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(11), 'part 1 known alone does not finish the lesson');
  shell.clearLesson(11);
  const part2 = marks.poolFor(everyItem(), 2);
  for (const item of part2.slice(0, Math.ceil(27 * 0.7))) for (let k = 0; k < 3; k += 1) shell.recordAnswer(11, item.id, true);
  qaida.setGroup(2);
  await sleep(10);
  check(shell.isDone(11), 'seven tenths of part 2 known finishes the lesson');
  check(shell.masteredCount(11) === Math.ceil(27 * 0.7), 'and the home counts exactly those', String(shell.masteredCount(11)));
  check(shell.masteredCount(10) === 0 && shell.masteredCount(6) === 0 && shell.masteredCount(4) === 0, 'none of it counts toward Lesson 4, 6 or 10');

  console.log('\nThe zabar set');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check($('h1').textContent === 'Paish and wow', 'the title becomes Paish and wow', $('h1').textContent);
  check(!/damma|fatha|sukoon/.test(choices().map((c) => (c.attrs['aria-label'] || (c.firstChild && c.firstChild.textContent))).join('|')), 'no choice still says damma or fatha');
  shell.state.names = 'fatha';
  shell.renderSetup();

  console.log('\nThe Spell block: nuurun in two steps, nuu never split');
  qaida.setGroup(1);
  await sleep(10);
  const units = $('.spell-glyph').querySelectorAll('.unit');
  check(units.length === 2 && units[0].textContent === 'ن' + DAMMA + WAW, 'nuurun is two steps; the first is noon with damma and wow, whole', units.map((u) => u.textContent).join(' | '));
  console.log(`      caption: ${$('.spell-caption').textContent}`);
  check($('.prev').attrs.href === 'lesson-10.html', 'Previous goes to Lesson 10');
  check($('.spell-more a').attrs.href === 'exercise-11.html' && fs.existsSync(path.join(dir, 'exercise-11.html')), 'Practice reading goes to exercise-11.html, which exists');

  console.log('\nThe wow: drawn by script, never spelt by it');
  check(marks.drawnOf(mark, 'madani') === DAMMA + WAW && marks.drawnOf(mark, 'indopak') === DAMMA + WOW, 'Madani draws it bare, Indo-Pak with U+0652');
  check(marks.suffixOf(mark) === DAMMA + WOW, 'and the id spells U+0652 in both');
  shell.clearLesson(11);
  shell.recordAnswer(11, 'ب' + DAMMA + WOW, true);
  shell.recordAnswer(11, 'ب' + DAMMA + WOW, true);
  shell.recordAnswer(11, 'ب' + DAMMA + WOW, true);
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(5);
  check(shell.masteredCount(11) === 1, 'a letter known in Madani is still known after switching to Indo-Pak');
  shell.state.script = 'madani';
  shell.renderSetup();
  await sleep(5);

  console.log('\nThe markup');
  check(!/[ً-ٗۡ]/.test(raw), 'lesson-11.html holds no literal combining mark');
  check(/&#x628;&#x64F;&#x648;&#x652;/.test(raw), 'the title glyph is baa, U+064F, U+0648, U+0652');
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
