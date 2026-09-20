// Runs Lesson 3's page script against the real lesson-3.html in a small hand-made DOM, with no browser (step 5).
//
//   node tools/qaida-lesson3-check.js
//
// The same idea as qaida-page-check.js, and the same limits: nothing is drawn and no CSS runs, so it cannot tell whether a
// joined shape renders as a joined shape. That is the one thing only a browser can say. What it does prove is that the
// page's scripts load against its own markup, and that the rail, the board, both progress numbers, the six groups, the
// advice and the end of the lesson do what they say to the text, the classes and the attributes on the page.
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

// A small DOM (copied from qaida-page-check.js) --------------------------------------------------------------

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
    return this.children.length ? this.children.map((c) => c.textContent).join('') : this._text;
  }
  set textContent(v) { this.children = []; this._text = String(v); }
  set innerHTML(html) { this.children = []; this._text = ''; for (const node of parse(html)) this.append(node); }
  get firstChild() { return this.children[0] || null; }
  get lastElementChild() { return this.children[this.children.length - 1] || null; }
  get isConnected() { return true; }
  get offsetWidth() { return 0; }
  append(...nodes) { for (const n of nodes) { n.parent = this; this.children.push(n); } }
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

// The page, running ----------------------------------------------------------------------------------------

const page = fs.readFileSync(path.join(dir, 'lesson-3.html'), 'utf8');
const nodes = parse(page);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  body: htmlEl.querySelector('body'),
  querySelector: (sel) => htmlEl.querySelector(sel),
  querySelectorAll: (sel) => htmlEl.querySelectorAll(sel),
  createElement: (tag) => new El(tag),
  addEventListener() {},
};

const phone = { on: false, listeners: [] };
const store = new Map([['qaida', JSON.stringify({ v: 1, chosen: true, script: 'madani', names: 'fatha', grouping: 'families' })]]);
const ctx = vm.createContext({
  document: doc,
  localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
  matchMedia: (query) => ({
    // Reduced motion, so nothing waits on a fade; and a window that is a phone only when a test says so.
    get matches() { return /reduced-motion/.test(query) || (/max-width: 599px/.test(query) && phone.on); },
    addEventListener: (type, fn) => phone.listeners.push(fn),
  }),
  IntersectionObserver: class { observe() {} },
  fetch: async () => ({ ok: false }),
  Audio: class { play() { return Promise.resolve(); } pause() {} },
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  navigator: {},
  location: { pathname: '/site/qaida/lesson-3.html' },
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
  load('shapes.js');
  load('lesson-3.js');
} catch (error) {
  check(false, 'the scripts load against lesson-3.html', error.stack.split('\n').slice(0, 5).join(' | '));
  process.exit(1);
}
check(true, 'shell.js, audio.js, practice.js, shapes.js and lesson-3.js load against lesson-3.html without an error');

const $ = (sel) => doc.querySelector(sel);
const all = (sel) => doc.querySelectorAll(sel);
const shell = ctx.qaidaShell;
const shapes = ctx.qaidaShapes;
const qaida = ctx.qaida;
const click = (el, detail = 1) => {
  const event = { type: 'click', target: el, detail, preventDefault() { this.defaultPrevented = true; } };
  for (let n = el; n; n = n.parent) for (const fn of n.listeners.click || []) fn.call(n, event);
};
const J = String.fromCharCode(0x200D);
const choices = () => $('.choices').children;
const rail = () => all('.band');
const railButton = (n) => rail().find((b) => b.attrs['data-band'] === String(n));
const idOfPrompt = () => {
  // The answer is whichever item's glyph is the prompt; the items themselves are in the shell's record, so ask by name.
  const shown = $('.prompt-glyph') ? $('.prompt-glyph').textContent : '';
  return shown;
};
const all68 = () => shapes.allItems(shell, { drilled: 'new' });
const answerFor = () => {
  const shown = idOfPrompt();
  const item = all68().find((it) => it.glyph === shown);
  return choices().find((c) => c.attrs['aria-label'] === item.name || (c.firstChild && c.firstChild.textContent === item.name));
};
const wrongFor = () => choices().find((c) => c !== answerFor());

async function main() {
  await sleep(20);
  qaida.setPause(1);

  console.log('\nThe page');
  check(qaida.kind === 'drill' && typeof qaida.setBand === 'function' && typeof qaida.bandTotals === 'function', 'publishes window.qaida with kind "drill" and the four rows of its own');
  check(JSON.stringify(qaida.bandTotals()) === JSON.stringify([6, 2, 21, 15, 24, 0]), 'bandTotals() says what each group costs', String(qaida.bandTotals()));
  check(rail().length === 6, 'the rail has six groups', String(rail().length));
  check(rail().every((b) => b.attrs.disabled === undefined && b.attrs['aria-disabled'] === undefined), 'every group is enabled: nothing is locked');
  check(rail().filter((b) => b.attrs['aria-current'] === 'page').length === 1 && railButton(1).attrs['aria-current'] === 'page', 'exactly one group is "you are here", and it is the first');
  check(/^Group 1, They never join forward\. You’re here$/.test(railButton(1).attrs['aria-label']), 'its label says its state in words', railButton(1).attrs['aria-label']);
  check(/^Group 3, A tooth and a tail\. Comes later$/.test(railButton(3).attrs['aria-label']), 'a later group says so', railButton(3).attrs['aria-label']);
  check(railButton(1).querySelector('.band-glyph').textContent === 'د', 'the rail shows a sample letter in the chosen script');

  console.log('\nThe board, group 1');
  const table = $('.shapes-table');
  const rows = table.querySelectorAll('tbody tr');
  check(rows.length === 7, 'six letters that never join forward, and ء on a line of its own', String(rows.length));
  check(table.querySelectorAll('thead th').length === 4, 'letter, on its own, joined to the letter before, joined up', String(table.querySelectorAll('thead th').length));
  check(table.querySelectorAll('thead th').every((th) => th.scope === 'col') && table.querySelectorAll('tbody th').every((th) => th.scope === 'row'), 'real column and row headers');
  check(table.attrs.dir === 'rtl', 'the board runs right to left');
  const tiles = table.querySelectorAll('button.letter');
  check(tiles.length === 13, 'two shapes for each of six letters, and ء', String(tiles.length));
  check(tiles.every((t) => t.attrs['aria-label'] && t.querySelector('.glyph').attrs['aria-hidden'] === 'true'), 'every tile is named, and its shape hidden from a screen reader');
  check(rows[0].querySelector('.demo .glyph').textContent === 'باب', 'alif is flanked by baa in its joined-up example', rows[0].querySelector('.demo .glyph').textContent);
  check(rows[6].querySelector('.hamzah') && /Hamzah never joins/.test(rows[6].querySelector('.hamzah').textContent), 'hamzah has its one shape and a line saying so');
  check($('.shapes-note').textContent.includes('a gap follows each one') && $('.shapes-note').textContent.includes('Between two letters'), 'the note says why there is a gap, and what the last column shows');
  check(!$('.shapes-note').hidden, 'and it is shown');
  const firstTile = tiles[0];
  check(firstTile.attrs['aria-label'] === 'Alif, on its own' && rows[0].querySelectorAll('button.letter')[1].attrs['aria-label'] === 'Alif, joined', 'names built from the position words', firstTile.attrs['aria-label']);
  check(rows[0].querySelectorAll('button.letter')[1].querySelector('.glyph').textContent === `${J}ا`, 'the joined shape is a letter with a joiner in front');

  const heads = $('.shapes-heads-track').children.map((c) => c.textContent);
  check(heads.join('|') === 'Letter|On its own|Joined to the letter before|Between two letters', 'the sticky bar names every column, and the last one says what it is', heads.join('|'));
  check($('.shapes-heads').attrs['aria-hidden'] === 'true' && table.querySelectorAll('thead th').every((th) => th.querySelector('.sr-only').textContent.length > 0), 'the bar is for the eye; the table keeps its own headings for a screen reader');
  check($('.shapes-heads-track').children.every((c) => c.style.props.left !== undefined && c.style.props.width !== undefined), 'each heading is set over its column');

  console.log('\nThe first question');
  check($('.ask').textContent === 'Which letter is this, and where does it sit?', 'the question is asked', $('.ask').textContent);
  check($('.prompt-glyph') && $('.prompt-glyph').attrs['aria-hidden'] === 'true' && $('.prompt-glyph').textContent.includes(J), 'a joined shape is shown, hidden from a screen reader');
  check(choices().length === 4, 'four answers', String(choices().length));
  check(choices().every((c) => /, /.test(c.firstChild.textContent)), 'each answer names a letter AND where it sits', choices().map((c) => c.firstChild.textContent).join(' | '));
  check($('.progress-text').textContent === 'Just starting' && !/\d/.test($('.progress-text').textContent), 'the lesson line is words, not a count', $('.progress-text').textContent);
  check($('.band-line').hidden && !/\d/.test($('.band-line').textContent), 'and there is no group count: that line only appears once the group is done');
  check($('.bar').attrs['aria-valuemax'] === '68' && $('.bar').attrs['aria-valuetext'] === 'Just starting', 'the bar still drives from the numbers, and reads as the words');
  check(shell.drillOf(3).total === 68, 'the total the home reads is the whole lesson (68), not the group (6)', String(shell.drillOf(3).total));
  check($('.announce').textContent === 'Question 1.', 'a screen reader is told which question it is');

  console.log('\nAnswering');
  click(answerFor(), 1);
  check(/^Yes — /.test($('.verdict').textContent), 'a right answer says so warmly', $('.verdict').textContent);
  await sleep(40);
  const wrong = wrongFor();
  const item = all68().find((it) => it.glyph === idOfPrompt());
  click(wrong, 1);
  check(/^That one is .+\. This is .+\.$/.test($('.verdict').textContent) && !/wrong|incorrect|try again|!/i.test($('.verdict').textContent), 'a wrong answer names both shapes and never scolds', $('.verdict').textContent);
  check(!$('.after').hidden && doc.activeElement === $('.next-question'), 'the strip appears and the keyboard goes to Next');
  check($('.after').querySelector('.trace').textContent === 'Write it', 'the button says "Write it"');
  // A ride-along from another group is not on this group's board, so there is nothing to mark.
  check(item.band !== 1 || table.querySelectorAll('button.letter').some((t) => 'data-missed' in t.attrs && t.attrs['data-id'] === item.id), 'the shape just missed keeps a gold edge on the board (when the board shows it)');
  click($('.after .trace'), 1);
  check(opened.length === 1 && opened[0][0] === item.base && !opened[0][0].includes(J) && opened[0][1] === item.letterName, '"Write it" opens the board on the ISOLATED letter, titled with its name', JSON.stringify(opened));
  click($('.next-question'), 1);
  await sleep(10);
  check(!table.querySelectorAll('button.letter').some((t) => 'data-missed' in t.attrs), 'the edge goes when the next question comes');

  console.log('\nMoving between groups');
  click(railButton(3), 1);
  await sleep(20);
  check(railButton(3).attrs['aria-current'] === 'page' && railButton(1).attrs['aria-current'] === undefined, 'group 3 is now "you are here"');
  check(!$('.band-advice').hidden && /comes later/i.test($('.band-advice .struggle-text').textContent), 'a group opened out of turn is advised about', $('.band-advice .struggle-text').textContent);
  check(/^Group 3, A tooth and a tail\./.test($('.band-announce').textContent) && !/\d+ shapes/.test($('.band-announce').textContent), 'and announced to a screen reader, without a count', $('.band-announce').textContent);
  check(doc.activeElement === $('.shapes-title'), 'the keyboard lands on the board heading, not its first tile');
  check($('.band-line').hidden, 'the group line stays out of the way', $('.band-line').textContent);
  check($('.progress-text').textContent === 'Just starting' && shell.drillOf(3).total === 68, 'the lesson line and the home total stay whole-lesson');
  check(all('.shapes-table tbody tr').length === 7 && $('.shapes-table').querySelectorAll('thead th').length === 6, 'the board shows seven letters, four shapes each, and the example');
  check(all('.shapes-table button.letter').length === 28, 'four shapes each for seven letters', String(all('.shapes-table button.letter').length));
  check(all('.shapes-table tbody tr')[0].querySelectorAll('button.letter').map((t) => t.attrs['aria-label']).join('|') === 'Baa, on its own|Baa, start of a word|Baa, middle of a word|Baa, end of a word', 'tiles run isolated, start, middle, end', all('.shapes-table tbody tr')[0].querySelectorAll('button.letter').map((t) => t.attrs['aria-label']).join('|'));
  click(railButton(4), 1);
  check($('.band-advice').hidden, 'the advice is not repeated');
  click(railButton(2), 1);
  check(all('.shapes-table button.letter').length === 8 && $('.shapes-note').textContent.includes('barely change'), 'group 2: two letters, four shapes, and the note that they barely change');
  qaida.setBand(1);
  check(railButton(1).attrs['aria-current'] === 'page' && $('.band-line').hidden, 'the panel can move the drill without advice or focus');
  const questionsIn = (n) => {
    const need = new Set(shapes.poolFor(all68(), n).filter((it) => it.required).map((it) => it.id));
    return need;
  };
  click(railButton(6), 1);
  await sleep(10);
  check(!$('.drill').hidden && !$('.practise').hidden, 'group 6 has its exercise too: the whole table, mixed');
  check(all('.shapes-table tbody tr').length === 29 && $('.shapes-table').querySelectorAll('thead th').length === 5, 'and shows all 29 letters, four columns, no example');
  const ar = all('.shapes-table tbody tr')[0];
  check(ar.querySelectorAll('td.none').length === 2 && ar.querySelectorAll('button.letter').length === 2, 'a letter that never joins forward has two empty cells in the table, and says so');
  check(all('.shapes-table td.none').every((td) => td.querySelector('.sr-only').textContent === 'No such shape'), 'each empty cell says "No such shape" to a screen reader');
  check(/^Group 6, The whole table\.$/.test($('.band-announce').textContent), 'group 6 is announced', $('.band-announce').textContent);
  check($('.shapes-note').hidden === true, 'no example note on the table');
  qaida.setBand(3);

  console.log('\nThe rail follows the student, and the page follows the rail');
  const board = $('.shapes');
  const railNav = $('.bands');
  scrolled.length = 0;
  board.rect = { top: 200, bottom: 900, height: 700 };
  railNav.rect = { top: 60, bottom: 150, height: 90 };
  click(railButton(4), 1);
  check(scrolled.length === 0, 'at the top of the page, choosing a group does not move the page');
  board.rect = { top: -400, bottom: 300, height: 700 }; // scrolled down through the shapes
  click(railButton(5), 1);
  check(scrolled.length === 1 && scrolled[0][0] === 'shapes' && scrolled[0][1] === 'start', 'scrolled down through the shapes, choosing a group glides back up to the start of them');
  board.rect = null; railNav.rect = null;
  check($('.practise') && !$('.practise').hidden && /Practise this group/.test($('.practise').textContent), 'there is a "Practise this group" button under the board');
  scrolled.length = 0;
  click($('.practise'));
  check(scrolled.length === 1 && scrolled[0][0].includes('drill') && doc.activeElement === $('#drill-title'), 'it takes the student down to the exercise, and puts the keyboard on its heading');
  qaida.setBand(6);
  qaida.setBand(1);

  console.log('\nOnly this group\'s shapes');
  for (const n of [1, 2, 3, 4, 5]) {
    qaida.setBand(n);
    await sleep(3);
    const own = new Set(all68().filter((it) => it.band === n).map((it) => it.name));
    let foreign = 0;
    let asked = 0;
    for (let i = 0; i < 40; i += 1) {
      const names = choices().map((c) => c.firstChild.textContent);
      asked += 1;
      if (!names.every((name) => own.has(name))) foreign += 1;
      qaida.next();
      await sleep(2);
    }
    check(foreign === 0, `group ${n}: every answer offered is one of its own shapes`, `${foreign} of ${asked} questions had another group's shape`);
  }
  qaida.setBand(6);
  await sleep(3);
  const seenBands = new Set();
  for (let i = 0; i < 150; i += 1) {
    const item = all68().find((it) => it.glyph === idOfPrompt());
    if (item) seenBands.add(item.band);
    qaida.next();
    await sleep(1);
  }
  check([1, 2, 3, 4, 5].every((n) => seenBands.has(n)), 'the table asks about every group: it is the mixed practice', [...seenBands].sort().join(','));
  qaida.setBand(3);
  console.log('\nA phone');
  qaida.setBand(3);
  await sleep(3);
  phone.on = true;
  phone.listeners.forEach((fn) => fn());
  await sleep(3);
  const stackedTable = $('.shapes-table');
  check('data-stacked' in stackedTable.attrs, 'the board lays each letter out for a phone');
  check(stackedTable.querySelectorAll('thead th').length === 5, 'five columns of shapes, and no column for the name', String(stackedTable.querySelectorAll('thead th').length));
  check(stackedTable.querySelectorAll('tbody.letter-group').length === 7 && stackedTable.querySelectorAll('tr.name-row').length === 7, 'each of the seven letters has its name on a line of its own above its shapes');
  check(stackedTable.querySelectorAll('tr.name-row th').every((th) => th.scope === 'rowgroup' && th.colSpan === 5), 'the name is the header of its group, across every column');
  check(stackedTable.querySelectorAll('button.letter').length === 28 && stackedTable.querySelectorAll('td.demo').length === 7, 'and all 28 shapes and 7 examples are still there');
  check($('.shapes-heads-track').children.map((c) => c.textContent).join('|') === 'On its own|Start of a word|Middle of a word|End of a word|All three together', 'the sticky bar names the five columns', $('.shapes-heads-track').children.map((c) => c.textContent).join('|'));
  qaida.setBand(1);
  await sleep(3);
  check($('.shapes-table').querySelectorAll('tbody.letter-group').length === 7 && $('.shapes-table').querySelectorAll('td.hamzah').length === 1, 'group 1 on a phone: six letters and hamzah, each with its own name line');
  qaida.setBand(6);
  await sleep(3);
  check(!('data-stacked' in $('.shapes-table').attrs) && $('.shapes-table').querySelectorAll('thead th').length === 5, 'the table of every letter keeps its name column: four tiles fit beside it');
  phone.on = false;
  phone.listeners.forEach((fn) => fn());
  qaida.setBand(3);
  await sleep(3);
  check(!('data-stacked' in $('.shapes-table').attrs) && $('.shapes-table').querySelectorAll('thead th').length === 6, 'and turning back to a wide window puts the name column back');
  check(/move on to another group whenever you like, but do the exercise first/.test($('.shapes-hint').textContent), 'a line says you can move on but should do the exercise first');
  console.log('\nGetting a group ready');
  const readyOrder = [];
  const master = (n) => {
    for (const it of all68().filter((x) => x.band === n)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(3, it.id, true);
  };
  qaida.setBand(1);
  await sleep(10);
  // Answer group 1's questions for real until the page says it is known.
  let guard = 0;
  const wasDoneBefore = shell.isDone(3);
  while (guard < 400 && $('.ready-note').hidden) {
    guard += 1;
    const item1 = all68().find((it) => it.glyph === idOfPrompt());
    if (item1 && item1.band === 1) click(answerFor(), 1);
    else click(answerFor(), 1);
    if (!$('.after').hidden) click($('.next-question'), 1);
    await sleep(2);
  }
  check(!$('.ready-note').hidden && /You seem to know this group/.test($('.ready-note').textContent), 'the page says a group is known', `after ${guard} answers`);
  check(!wasDoneBefore && !shell.isDone(3), 'a single group is not the lesson: it is not marked finished');
  check(railButton(1).attrs['data-done'] !== undefined, 'with its data-done mark');
  await sleep(950);
  check(!railButton(1).classes().includes('just-ready'), 'the star does not go on turning', railButton(1).attrs.class);
  const stat1 = shapes.stats(shell, 3, all68(), 1);
  check(stat1.ready, 'the group is ready by the engine\'s own rule', JSON.stringify(stat1));

  click(railButton(2), 1);
  check($('.band-advice').hidden, 'the next group after a finished one is not "out of turn"');
  check($('.band-line').hidden, 'and its own line is quiet until it is done', $('.band-line').textContent);
  check(shell.masteredCount(3) >= 5 && /^(Getting going|Getting there)$/.test($('.progress-text').textContent), 'mastery from group 1 survives the move, in the lesson line', $('.progress-text').textContent);

  console.log('\nThe whole lesson');
  master(1); master(2); master(3); master(4); master(5);
  qaida.setBand(6); // repaints from what the shell now holds
  await sleep(10);
  check(shell.isDone(3), 'all five groups ready marks the lesson finished');
  check($('.lesson').classes().includes('complete'), 'the lesson page shows it');
  check(/^Every shape covered\./.test($('.end-line').textContent), 'the last line changes', $('.end-line').textContent);
  check(!$('.ready-note').hidden && /That’s all of the shapes/.test($('.ready-note').textContent), 'the whole-lesson advice replaces the group one', $('.ready-note').textContent);
  check($('.progress-text').textContent === 'All known', 'the bar is full', $('.progress-text').textContent);
  check($('.next').attrs['aria-disabled'] === undefined, 'Lesson 4 is never locked: the lesson only recommends');
  check(/^Lesson 4: Fatha$/.test($('.next span').textContent), 'the Next button follows the names choice', $('.next span').textContent);

  console.log('\nChanging things underneath it');
  shell.state.names = 'zabar';
  shell.renderSetup();
  await sleep(10);
  check(/^Lesson 4: Zabar$/.test($('.next span').textContent), 'switching the names changes the label for Lesson 4', $('.next span').textContent);
  const knownBefore = shell.masteredCount(3);
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  check($('.progress-text').textContent === 'All known', 'switching script keeps what is known', $('.progress-text').textContent);
  qaida.setBand(5);
  await sleep(5);
  const hehRow = all('.shapes-table tbody tr').find((tr) => tr.querySelector('th .row-name').textContent === 'Haa');
  check(hehRow && hehRow.querySelectorAll('button.letter')[2].querySelector('.glyph').textContent === `${J}ہ${J}`, 'and the board redraws in the other script (Indo-Pak ہ)');
  shell.state.script = 'madani';
  shell.renderSetup();
  await sleep(5);

  root().dataset.drilled = 'all';
  qaida.setDrilled('all');
  await sleep(5);
  check($('.bar').attrs['aria-valuemax'] === '101', 'All four positions drills 101 shapes', $('.bar').attrs['aria-valuemax']);
  root().dataset.drilled = 'new';
  qaida.setDrilled('new');
  await sleep(5);

  root().dataset.board = 'all';
  qaida.setBand(2);
  await sleep(5);
  check(all('.shapes-table tbody tr').length === 29, '"The board shows: every letter" gives the table at any group');
  root().dataset.board = 'band';
  qaida.render();

  root().dataset.distractors = 'same-letter';
  qaida.setDistractors('same-letter');
  qaida.setBand(3);
  let siblings = 0;
  for (let i = 0; i < 40; i += 1) {
    const q = choices().map((c) => c.firstChild.textContent);
    const letters = q.map((s) => s.split(',')[0]);
    if (new Set(letters).size < letters.length) siblings += 1;
    qaida.next();
    await sleep(2);
  }
  check(siblings > 20, '"Another shape of the same letter" puts a sibling among the answers', `${siblings} of 40`);
  root().dataset.distractors = 'position';
  qaida.setDistractors('position');


  console.log('\nThe options panel');
  try {
    load('qaida-options.js');
    check(true, 'qaida-options.js loads against lesson-3.html without an error');
  } catch (error) {
    check(false, 'qaida-options.js loads against lesson-3.html', error.stack.split('\n').slice(0, 4).join(' | '));
  }
  const panel = $('details.tryout');
  const sections = panel ? panel.querySelectorAll('details').map((d) => d.querySelector('summary').textContent) : [];
  check(sections[0] === 'Letter shapes' && sections[1] === 'The drill' && sections.includes('Words (lesson 3)'), '"Letter shapes" sits above "The drill", and the words have their own section', sections.join(' | '));
  const rowsOf = (title) => {
    const d = panel.querySelectorAll('details').find((x) => x.querySelector('summary').textContent === title);
    return d ? d.children.filter((c) => c.tag === 'div').map((c) => c.children[0] && c.children[0].textContent) : [];
  };
  const shapeRows = rowsOf('Letter shapes');
  check(['Group', 'What each group asks for', 'Shapes drilled', 'Wrong answers offered', 'The board shows'].every((r) => shapeRows.includes(r)), 'the four rows of its own, and the numbers', shapeRows.join(' | '));
  check(rowsOf('The drill').filter((r) => r === 'Wrong answers offered').length === 0, 'and the drill does not repeat the wrong-answers row');
  const costsRow = panel.querySelectorAll('output').map((o) => o.textContent).find((s) => /shapes in all/.test(s));
  check(/^1: 6 shapes, 15 right · 2: 2 shapes, 6 right · 3: 21 shapes, 51 right · 4: 15 shapes, 36 right · 5: 24 shapes, 60 right — 68 shapes in all$/.test(costsRow || ''), 'the panel shows what each group asks for', costsRow);
  const press = (row, label) => {
    const d = panel.querySelectorAll('details').find((x) => x.querySelector('summary').textContent === 'Letter shapes');
    const r = d.children.filter((c) => c.tag === 'div').find((c) => c.children[0].textContent === row);
    click(r.querySelectorAll('button').find((b) => b.textContent === label));
  };
  press('Shapes drilled', 'All four positions');
  await sleep(5);
  const allCost = panel.querySelectorAll('output').map((o) => o.textContent).find((s) => /shapes in all/.test(s));
  check(/101 shapes in all/.test(allCost) && $('.bar').attrs['aria-valuemax'] === '101', 'All four positions shows 101 in the panel and the bar', allCost);
  press('Shapes drilled', 'Only the new ones');
  press('Group', 'Four');
  await sleep(5);
  check(railButton(4).attrs['aria-current'] === 'page', 'the panel moves the drill to any group');
  press('Group', 'One');
  const ioBox = panel.querySelector('textarea');
  click(panel.querySelector('.tryout-io').children[0].children[0]);
  await sleep(10);
  let exported = {};
  try { exported = JSON.parse(ioBox.value); } catch { /* reported below */ }
  const keys = Object.keys(exported);
  check(keys.includes('Letter shapes :: Group') && keys.includes('Letter shapes :: Shapes drilled') && keys.includes('Letter shapes :: Wrong answers offered') && keys.includes('Letter shapes :: The board shows'),
    'every row of its own is in Export settings, so it reaches setting.txt', String(keys.length));
  check(keys.filter((k) => k.startsWith('Words (lesson 3) ::')).length > 80, 'and every line of wording has its own field', String(keys.filter((k) => k.startsWith('Words (lesson 3) ::')).length));
  console.log('\nStart again');
  click($('.reset'));
  check($('.reset').textContent === 'Tap again to clear', 'asks once more');
  click($('.reset'));
  await sleep(10);
  check(shell.masteredCount(3) === 0 && !shell.isDone(3), 'clears what was learnt');
  check(railButton(1).attrs['aria-current'] === 'page', 'and goes back to group 1');
  check($('.progress-text').textContent === 'Just starting', 'and the bar is empty', $('.progress-text').textContent);

  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) FAILED.`);
  process.exit(failed);
}

const root = () => doc.documentElement;
main().catch((error) => {
  console.log(`FAIL  the page threw: ${error.stack.split('\n').slice(0, 6).join(' | ')}`);
  process.exit(1);
});
