// Runs the mark lesson's page script against the real lesson-13.html in a small hand-made DOM, with no browser
// (QAIDA-BUILD.md step 9). Lesson 11's page checks (the same-sound tile) with Lesson 12's yaa (docs/lesson-13/03 §5).
//
//   node tools/qaida-lesson13-check.js
//
// The same limits as every other lesson-N-check: nothing is drawn and no CSS runs, so it cannot tell whether the zair
// and the yaa's bowl collide under the line, whether the tile clips them, whether the row drops the way Lesson 7's
// did, whether the halo rings the yaa or the zair, or how the same-sound tile wraps on a phone. Those are the user's
// (docs/lesson-13/03 §6) and were looked at in the browser pane at the build. What it does prove: the scripts load
// against the markup, and the quartet with its same-sound tile (khari zair, below the line), the per-script jazam
// line, the id that is neither script's drawing, the twins, the 27-letter table, the joined block, the parts, the
// words and the end of the lesson do what they say. Prints PASS or FAIL per check; the exit code is the number that
// failed.

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

const PAGE = 'lesson-13.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 13: Zair and yaa · Free Qaida',
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
const STANDING = String.fromCharCode(0x0656); // khari zair, the id of the same-sound tile
const YAA = String.fromCharCode(0x064A); // the letter as the id spells it (Madani's, the fold every key uses)
const YAA_IP = String.fromCharCode(0x06CC); // the Indo-Pak yaa
const JAZAM = String.fromCharCode(0x0652); // the mark as the id spells it (the Indo-Pak code point)
const JAZAM_M = String.fromCharCode(0x06E1); // the mark as Madani draws it (Lesson 10's measurement)
const SMALL_YAA = String.fromCharCode(0x06E6); // what Madani draws for khari zair's tail
const TAIL = YAA + JAZAM; // this lesson's tail, as the id spells it
const DRAWN_AI = YAA + JAZAM_M; // Lesson 12's yaa as Madani draws it
const mark = marks.MARKS['kasra-yaa'];
const yaaMark = marks.MARKS['fatha-yaa'];
const kasra = marks.MARKS.kasra;
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
    || marks.twinItems(shell, mark, { keys: keysOf(), marks: [kasra, yaaMark] }).find((it) => it.glyph === shown)
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
  check(htmlEl.attrs['data-mark'] === 'kasra-yaa' && htmlEl.attrs['data-sits'] === 'below', 'the page teaches kasra-yaa, below the letter');
  check(htmlEl.attrs['data-board'] === 'quad' && htmlEl.attrs['data-arrows'] === 'last' && htmlEl.attrs['data-twins'] === 'alternate',
    'a quartet, one arrow before the last tile, and the twins alternating');
  check(JSON.stringify(qaida.groupCosts().map((p) => [p.items])) === '[[6],[27]]', 'groupCosts() is 6 then 27', JSON.stringify(qaida.groupCosts()));
  check(rail().length === 2 && rail().every((b) => b.attrs.disabled === undefined), 'two parts, both enabled: nothing is locked');

  console.log('\nThe head');
  check($('h1').textContent === 'Kasra and yaa' && doc.title.startsWith('Lesson 13: Kasra and yaa'), 'the title is Kasra and yaa in the fatha set', $('h1').textContent + ' / ' + doc.title);
  check($('.title-mark').textContent === 'ف' + KASRA + YAA, 'the big glyph, Madani: faa, kasra and a bare yaa, composed: the word "in"', $('.title-mark').textContent);
  check($('.eyebrow').textContent === 'Lesson 13 of 29' && all('.track li').findIndex((li) => li.classes().includes('now')) === 12, 'Lesson 13 of 29, the thirteenth of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '27', 'the bar\'s total is 27');

  console.log('\nThe board: the quartet, the same-sound tile, the jazam line, the joined block');
  const feature = $('.pair-feature');
  const featured = tilesOf(feature);
  check(featured.length === 5, 'the feature row has five tiles: the quartet and the same-sound tile', String(featured.length));
  const pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6 && pairs.some((p) => p.attrs['data-key'] === 'ك'), 'part 1 has six letters, kaaf among them', String(pairs.length));
  check(pairs.every((p) => p.attrs['data-key'] !== 'ا'), 'and no alif: khari zair\'s six, not zair\'s own');
  const row = tilesOf(pairs[0]);
  const key = pairs[0].attrs['data-key'];
  check(row.map(glyphOfTile).join() === [key, key + KASRA, key + FATHA + DRAWN_AI, key + KASRA + YAA].join(),
    'the road, Madani: bare, bi, bai (the yaa of the last lesson, with U+06E1), bii (zair and a bare yaa, no jazam)', row.map(glyphOfTile).join());
  const id = row[3].attrs['data-id'];
  check(id === key + KASRA + TAIL && id.length === 4, 'the marked tile\'s id is four characters: the letter, kasra, yaa, jazam', id);
  check(!id.includes(YAA_IP) && !id.includes(JAZAM_M), 'and it holds neither the Indo-Pak yaa nor the Madani jazam: it is not a drawing');
  check(row[3].attrs['data-tail'] === '' && row[2].attrs['data-tail'] === '' && row[0].attrs['data-tail'] === undefined && row[1].attrs['data-tail'] === undefined,
    'the two yaa tiles carry data-tail, the bare and the short ones do not');
  check(row[1].attrs['data-sits'] === 'below' && row[2].attrs['data-sits'] === 'above' && row[3].attrs['data-sits'] === 'below',
    'zair and zair-and-yaa sit below, zabar-and-yaa above: the row holds both', [1, 2, 3].map((i) => row[i].attrs['data-sits']).join());
  const sameCell = feature.querySelector('.pair-cell.same');
  const sameTile = sameCell && sameCell.querySelector('button.mark-tile');
  check(Boolean(sameCell), 'the same-sound tile is on part 1\'s feature row');
  check(sameTile && sameTile.attrs['data-id'].endsWith(STANDING), 'and it is the khari zair letter: its id ends U+0656', sameTile && sameTile.attrs['data-id']);
  check(sameTile && sameTile.attrs['data-sits'] === 'below', 'and it sits below, like the marked tile');
  check(sameTile && glyphOfTile(sameTile) === key + KASRA + SMALL_YAA, 'Madani draws it as zair and a small yaa (U+06E6)', sameTile && glyphOfTile(sameTile));
  check(sameCell && !sameCell.querySelector('.halo'), 'with no halo: it is never pointed at as this lesson\'s own stroke');
  check(/^The same sound: .+ with khari zair$|^The same sound: .+ with standing kasra$/.test(sameCell ? sameCell.attrs['aria-label'] || (sameTile && sameTile.attrs['aria-label']) || '' : ''),
    'and it is named "The same sound: ... with standing kasra"', sameTile && sameTile.attrs['aria-label']);
  check(pairs.every((p) => !p.querySelector('.pair-cell.same')), 'no same-sound tile on the letter rows: the feature row only');

  check(!$('.jazam-note').hidden && /^Here the yaa has no mark on it\. After kasra, a bare yaa makes the sound long\. In the last lesson the yaa had a sukoon, and said ai\.$/.test(jazamNote()),
    'Madani: the jazam line says the yaa is bare, names kasra and sukoon', jazamNote());
  check(!/\{/.test(jazamNote()), 'with every token filled');
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  check(/^The yaa carries a sukoon here too, as in the last lesson\. What changed is the mark before it: after kasra, the yaa makes the sound long\.$/.test(jazamNote()),
    'Indo-Pak: the line swaps to the yaa that carries a jazam, and says nothing about the dotless end', jazamNote());
  const rowIP = tilesOf($('.pairs').querySelectorAll('.pair')[0]);
  check(glyphOfTile(rowIP[3]) === key + KASRA + YAA_IP + JAZAM && rowIP[3].attrs['data-id'] === key + KASRA + TAIL,
    'and the Indo-Pak tile draws U+06CC and the jazam while keeping the same id', glyphOfTile(rowIP[3]));
  check(glyphOfTile(rowIP[2]) === key + FATHA + YAA_IP + JAZAM, 'Lesson 12\'s yaa in the same row is drawn with U+06CC and U+0652, as before');
  const sameIP = $('.pair-feature').querySelector('.pair-cell.same button.mark-tile');
  check(sameIP && glyphOfTile(sameIP) === key + STANDING, 'and the same-sound tile is the single mark U+0656 in Indo-Pak', sameIP && glyphOfTile(sameIP));
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check(/after zair, the yaa/.test(jazamNote()) && !/\{|kasra/.test(jazamNote()), 'the zabar set fills {other} as zair, in Indo-Pak too', jazamNote());
  shell.state.script = 'madani';
  shell.renderSetup();
  await sleep(10);
  check(/After zair, a bare yaa/.test(jazamNote()) && /the yaa had a jazam, and said ai/.test(jazamNote()), 'and in Madani, with jazam for the small mark', jazamNote());
  shell.state.names = 'fatha';
  shell.renderSetup();
  await sleep(10);

  const joined1 = $('.joined-glyph').textContent.split('  ').filter(Boolean);
  check(joined1.length === 2 && joined1.every((g) => g.endsWith(KASRA + YAA)), 'the joined block: two examples, each ending in zair and the yaa', joined1.join(' | '));
  check(marks.NEVER_JOIN.includes(joined1[1][0]) && !marks.NEVER_JOIN.includes(joined1[0][0]), 'one joins the yaa on and one never joins forward');
  check(!$('.lam-alif-note'), 'no lam-alif line on the page at all');

  console.log('\nPart 2: 27 letters, the skip note, still no lam-alif');
  qaida.setGroup(2);
  await sleep(10);
  const pairs2 = $('.pairs').querySelectorAll('.pair');
  check(pairs2.length === 27 && !pairs2.some((p) => ['ا', 'ء'].includes(p.attrs['data-key'])), 'part 2 is 27 letters, no alif, no hamza', String(pairs2.length));
  check(pairs2.some((p) => p.attrs['data-key'] === 'ي'), 'yaa with zair and yaa stays: it is in a printed table');
  check(!$('.skip-note').hidden && $('.skip-note').textContent.length > 0, 'the skip note shows');
  check(!$('.pair-feature').querySelector('.pair-cell.same'), 'no same-sound tile in part 2');
  const joined2 = $('.joined-glyph').textContent.split('  ').filter(Boolean);
  check(joined2.length === 2, 'the joined block still has two examples: no laam third', joined2.join(' | '));
  qaida.setGroup(1);
  await sleep(10);

  console.log('\nThe wrong answers: its twin, never khari zair, never zabar-and-alif');
  for (const n of [1, 2]) {
    qaida.setGroup(n);
    await sleep(5);
    qaida.next();
    let own = 0;
    let withTwin = 0;
    let khari = 0;
    let longAlif = 0;
    for (let i = 0; i < 250; i += 1) {
      const it = promptItem();
      const ids = choices().map((c) => c.attrs['data-id']);
      if (it && it.mark === 'kasra-yaa') {
        own += 1;
        if (ids.some((x) => x === it.key + KASRA || x === it.key + FATHA + TAIL)) withTwin += 1;
      }
      if (ids.some((x) => x.endsWith(STANDING))) khari += 1;
      if (ids.some((x) => x.endsWith(FATHA + ALIF))) longAlif += 1;
      qaida.next();
    }
    check(own > 0 && withTwin === own, 'part ' + n + ': every "ee" question offers its twin (bi or ai)', withTwin + ' of ' + own);
    check(khari === 0, 'part ' + n + ': never a khari zair item among the answers: it is the same-sound tile\'s job', String(khari));
    check(longAlif === 0, 'part ' + n + ': never a zabar-and-alif item among the answers (not a twin)', String(longAlif));
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
  for (let i = 0; i < 100 && !(it && it.mark === 'kasra-yaa'); i += 1) { qaida.next(); it = promptItem(); }
  check(it && it.mark === 'kasra-yaa', 'a Lesson 13 item comes up');
  click(answerFor(), 1);
  check(new RegExp('^Yes \u2014 ' + it.letterName + ' with kasra and yaa\\.$').test($('.verdict').textContent), 'a right answer says "with kasra and yaa"', $('.verdict').textContent);

  console.log('\nFinishing: part 2 is the gate, at seven tenths of 27');
  shell.clearLesson(13);
  for (const item of marks.poolFor(everyItem(), 1)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(13, item.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(13), 'part 1 known alone does not finish the lesson');
  shell.clearLesson(13);
  const part2 = marks.poolFor(everyItem(), 2);
  for (const item of part2.slice(0, Math.ceil(27 * 0.7))) for (let k = 0; k < 3; k += 1) shell.recordAnswer(13, item.id, true);
  qaida.setGroup(2);
  await sleep(10);
  check(shell.isDone(13), 'seven tenths of part 2 known finishes the lesson');
  check(shell.masteredCount(13) === Math.ceil(27 * 0.7), 'and the home counts exactly those', String(shell.masteredCount(13)));
  check([4, 5, 6, 8, 10, 11, 12].every((n) => shell.masteredCount(n) === 0), 'none of it counts toward Lesson 4, 5, 6, 8, 10, 11 or 12');

  console.log('\nThe zabar set');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check($('h1').textContent === 'Zair and yaa', 'the title becomes Zair and yaa', $('h1').textContent);
  check(!/kasra|fatha|sukoon/.test(choices().map((c) => (c.attrs['aria-label'] || (c.firstChild && c.firstChild.textContent))).join('|')), 'no choice still says kasra or fatha');
  shell.state.names = 'fatha';
  shell.renderSetup();

  console.log('\nThe Spell block: fiilun in two steps, fii never split');
  qaida.setGroup(1);
  await sleep(10);
  const units = $('.spell-glyph').querySelectorAll('.unit');
  check(units.length === 2 && units[0].textContent === 'ف' + KASRA + YAA, 'fiilun is two steps; the first is faa with zair and yaa, whole', units.map((u) => u.textContent).join(' | '));
  console.log('      caption: ' + $('.spell-caption').textContent);
  check($('.prev').attrs.href === 'lesson-12.html', 'Previous goes to Lesson 12');
  check($('.spell-more a').attrs.href === 'exercise-13.html' && fs.existsSync(path.join(dir, 'exercise-13.html')), 'Practice reading goes to exercise-13.html, which exists');
  check($('.next').attrs['data-next-zabar'] === 'Next: Jazam' && $('.next').attrs['data-next-fatha'] === 'Next: Sukoon' && $('.next').attrs['data-soon'] !== undefined,
    'Next is Jazam / Sukoon, with the "not built yet" note until Lesson 14 is');

  console.log('\nThe yaa: drawn by script, never spelt by it');
  check(marks.drawnOf(mark, 'madani') === KASRA + YAA && marks.drawnOf(mark, 'indopak') === KASRA + YAA_IP + JAZAM,
    'Madani draws U+0650 U+064A, Indo-Pak U+0650 U+06CC U+0652');
  check(marks.suffixOf(mark) === KASRA + TAIL, 'and the id spells U+064A and U+0652 in both');
  shell.clearLesson(13);
  for (let k = 0; k < 3; k += 1) shell.recordAnswer(13, 'ب' + KASRA + TAIL, true);
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(5);
  check(shell.masteredCount(13) === 1, 'a letter known in Madani is still known after switching to Indo-Pak');
  shell.state.script = 'madani';
  shell.renderSetup();
  await sleep(5);
  check(shell.masteredCount(13) === 1, 'and back again');

  console.log('\nThe markup');
  check(!/[\u064B-\u0657\u06E1\u06E5\u06E6]/.test(raw), 'lesson-13.html holds no literal combining mark');
  check(/&#x641;&#x650;&#x64A;&#x652;/.test(raw), 'the title glyph is faa, U+0650, U+064A, U+0652');
  check(!/\b29\b/.test(raw.replace(/Lesson \d+ of 29/g, '').replace(/<!--[\s\S]*?-->/g, '')), 'no "29" anywhere on the page');
  const visible = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|leen|madd)\b/i.test(visible), 'no scolding, and no "leen" or "madd" (the plain-names rule)');
  check(!/\blam-alif\b|data-lam-alif/.test(raw.replace(/<!--[\s\S]*?-->/g, '')), 'no lam-alif wording at all');
  check(!/\b(wow|waw|paish|damma)\b/i.test(visible.replace(/Fatha, kasra, damma|Zabar, zair, paish/g, '')), 'no leftover wow, waw, paish or damma from Lesson 11\'s copy');

  console.log(failed === 0 ? '\nAll checks passed.' : '\n' + failed + ' check(s) FAILED.');
  process.exitCode = failed;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
