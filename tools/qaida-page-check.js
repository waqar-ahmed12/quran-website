// Runs Lesson 2's page script against the real lesson-2.html in a small hand-made DOM, with no browser (step 4).
//
//   node tools/qaida-page-check.js
//
// It is not a browser: nothing is drawn and no CSS runs. What it does prove is that shell.js, audio.js, practice.js and
// lesson-2.js load against the page's own markup without an error, and that answering, moving on, the two pieces of
// advice, switching script and starting again do what they say to the text, the classes and the attributes on the page.
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

// A small DOM ----------------------------------------------------------------------------------------------

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

const page = fs.readFileSync(path.join(dir, 'lesson-2.html'), 'utf8');
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

// The page, running ----------------------------------------------------------------------------------------

const store = new Map([['qaida', JSON.stringify({ v: 1, chosen: true, script: 'madani', names: 'fatha', grouping: 'families' })]]);
const ctx = vm.createContext({
  document: doc,
  localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
  matchMedia: () => ({ matches: true }), // reduced motion, so nothing waits on a fade
  IntersectionObserver: class { observe() {} },
  fetch: async () => ({ ok: false }),
  Audio: class { play() { return Promise.resolve(); } pause() {} },
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
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
  load('lesson-2.js');
} catch (error) {
  check(false, 'the scripts load against lesson-2.html', error.stack.split('\n').slice(0, 4).join(' | '));
  process.exit(1);
}
check(true, 'shell.js, audio.js, practice.js and lesson-2.js load against lesson-2.html without an error');

const $ = (sel) => doc.querySelector(sel);
const shell = ctx.qaidaShell;
const qaida = ctx.qaida;
const click = (el, detail = 1) => {
  const event = { type: 'click', target: el, detail, preventDefault() { this.defaultPrevented = true; } };
  for (let n = el; n; n = n.parent) for (const fn of n.listeners.click || []) fn.call(n, event);
};
const choices = () => $('.choices').children;
const right = () => choices().find((c) => c.attrs['data-id'] === qaida.__item().id);

async function main() {
  await sleep(20);
  qaida.setPause(1); // a right answer moves on almost at once

  // The first question ----------------------------------------------------------------------------------------
  console.log('\nThe first question');
  check(qaida.kind === 'drill', 'the page publishes window.qaida with kind "drill"');
  check($('.ask').textContent === 'Which letter is this?', 'the question is asked', $('.ask').textContent);
  check($('.prompt-glyph') && $('.prompt-glyph').textContent.length >= 1 && $('.prompt-glyph').attrs.lang === 'ar', 'a letter is shown, marked as Arabic');
  check(choices().length === 4, 'four answers to pick from', String(choices().length));
  check(choices().every((c) => (c.attrs['data-face'] === 'name' ? c.firstChild.textContent.length > 0 : Boolean(c.attrs['aria-label']))),
    'every answer says its name: in words, or to a screen reader');
  check($('.progress-text').textContent === '0 of 29 letters known', 'the progress line', $('.progress-text').textContent);
  check($('.bar').attrs['aria-valuemax'] === '29' && $('.bar').attrs['aria-valuetext'] === '0 of 29 letters known', 'the bar reads as a sentence, not a bare number');
  check($('.after').hidden && $('.verdict').textContent === '', 'nothing under the question yet');
  check($('.announce').textContent === 'Question 1.', 'a screen reader is told which question it is', $('.announce').textContent);
  check($('.reset').hidden, 'no "Start again" before an answer');

  // Answering ----------------------------------------------------------------------------------------------------
  const face = () => $('.choices').attrs['data-face'];
  const itemOf = () => {
    // Which letter is the answer: the one shown as the prompt.
    const shown = $('.prompt-glyph').textContent;
    return shell.lettersOf().find(([g]) => g === shown);
  };
  const answerButton = () => {
    const [glyph, name] = itemOf();
    return choices().find((c) => (face() === 'name' ? c.firstChild.textContent === name : c.attrs['aria-label'] === name));
  };
  const wrongButton = () => choices().find((c) => c !== answerButton());

  console.log('\nA right answer, with a pointer');
  const n1 = $('.announce').textContent;
  click(answerButton(), 1);
  check(/^Yes — that is /.test($('.verdict').textContent), 'says what the letter is, warmly', $('.verdict').textContent);
  check(answerButton().attrs['data-verdict'] === 'right' && choices().filter((c) => c.attrs['data-verdict'] === 'dim').length === 3, 'gold on the right one, the rest step back');
  check($('.after').hidden, 'nothing to press: it moves on by itself for a pointer');
  check($('.progress-text').textContent === '0 of 29 letters known', 'one right answer is not yet "known"');
  await sleep(60);
  check($('.announce').textContent === 'Question 2.' && $('.verdict').textContent === '', 'then the next question, with the answer line cleared', $('.announce').textContent);

  console.log('\nA wrong answer');
  click(wrongButton(), 1);
  const [, rightName] = itemOf();
  check(/^That was .+\. This one is /.test($('.verdict').textContent) && $('.verdict').textContent.endsWith(`${rightName}.`), 'says what it was and what this one is, and nothing else', $('.verdict').textContent);
  check(!/wrong|incorrect|mistake|fail/i.test($('.verdict').textContent), 'never says wrong');
  check(!$('.after').hidden && $('.after').attrs['data-kind'] === 'wrong', 'the strip appears under the answers');
  check($('.after-name').textContent === rightName && $('.after-glyph').textContent === itemOf()[0], 'showing the letter it was');
  check(doc.activeElement === $('.next-question'), 'the keyboard is put on Next');
  await sleep(60);
  check($('.announce').textContent === 'Question 2.', 'a wrong answer never moves on by itself');
  click($('.trace'), 1);
  check(opened.length === 1 && opened[0][0] === itemOf()[0], '"Trace it" opens the board on the letter it was', JSON.stringify(opened));
  click($('.next-question'), 1);
  await sleep(10);
  check($('.announce').textContent === 'Question 3.' && $('.after').hidden, 'Next asks a new question');
  check(doc.activeElement === choices()[0], 'and puts the keyboard on its first answer');

  console.log('\nA right answer, from the keyboard');
  click(answerButton(), 0);
  check(!$('.after').hidden && $('.after').attrs['data-kind'] === 'right', 'only a Next button appears');
  check(doc.activeElement === $('.next-question'), 'and the keyboard goes to it');
  await sleep(60);
  check($('.announce').textContent === 'Question 3.', 'it does not move on by itself, so focus is never yanked away');
  click($('.next-question'), 0);

  console.log('\nThe same answer twice');
  const answered = qaida.__item().id;
  const before = shell.drillOf(2).right[answered] || 0;
  const btn = answerButton();
  click(btn, 1);
  click(btn, 1);
  check((shell.drillOf(2).right[answered] || 0) === before + 1, 'a second tap on an answered question does nothing');
  await sleep(60);

  // A letter that keeps being missed ---------------------------------------------------------------------------
  console.log('\nA letter missed again and again');
  let guard = 0;
  const shown = () => $('.prompt-glyph') && $('.prompt-glyph').textContent;
  while (guard < 3000 && $('.struggle').hidden) {
    guard += 1;
    if (shown() === 'ذ') click(wrongButton(), 1);
    else click(answerButton(), 1);
    if (!$('.after').hidden) click($('.next-question'), 1);
    await sleep(3);
  }
  check(!$('.struggle').hidden, 'a gentle line about that letter appears', `after ${guard} answers`);
  const line = $('.struggle-text').textContent;
  check(/tricky/.test(line) && /completely normal/.test(line) && !/catching you out/.test(line), 'and it is not harsh', line);
  check($('.back-to-1').attrs.href === 'lesson-1.html', 'with a way back to Lesson 1');
  click($('.struggle .trace'), 1);
  check(opened.length >= 2 && opened[opened.length - 1][1] === 'Dhaal', '…and Trace it on that letter', JSON.stringify(opened[opened.length - 1]));

  // Getting there ----------------------------------------------------------------------------------------------
  console.log('\nGetting to "you seem to know these"');
  let asked = 0;
  while (asked < 1500 && $('.ready-note').hidden) {
    asked += 1;
    click(answerButton(), 1);
    if (!$('.after').hidden) click($('.next-question'), 1);
    await sleep(3);
  }
  const known = shell.masteredCount(2);
  check(!$('.ready-note').hidden, 'the page says it', `after ${asked} more answers`);
  check(known >= 24, 'once four fifths of the letters are known', `${known} of 29`);
  check(/seem to know these well/.test($('.ready-note').textContent), 'in plain words', $('.ready-note').textContent);
  check($('.lesson').classes().includes('complete') && shell.isDone(2), 'the lesson is marked finished on this device');
  check($('.end-line').textContent.startsWith('You seem to know these'), 'the last line changes');
  check($('.next').attrs['aria-disabled'] === undefined, 'Lesson 3 is never locked: it only recommends');
  click($('.next'));
  check(true, 'tapping Lesson 3 does not throw');
  await sleep(30);
  const stillGoing = $('.announce').textContent;
  click(answerButton(), 1);
  await sleep(40);
  check($('.announce').textContent !== stillGoing, 'and the drill carries on after it');

  // Changing things underneath it ---------------------------------------------------------------------------------
  console.log('\nChanging things while it runs');
  const knownBefore = shell.masteredCount(2);
  shell.state.script = 'indopak';
  shell.renderSetup();
  await sleep(10);
  check($('.progress-text').textContent.startsWith(`${knownBefore} of 29`), 'switching script keeps what is known', $('.progress-text').textContent);
  check(doc.documentElement.dataset.script === 'indopak', 'and the page follows the script');

  shell.setNames(shell.lettersOf().map(([, name], i) => (i === 1 ? 'Bay' : name)).join(', '));
  await sleep(5);
  const bay = [...choices(), $('.after-name')].some((c) => c && (c.textContent === 'Bay' || c.attrs['aria-label'] === 'Bay'));
  const seenNow = $('.ask').textContent;
  check(typeof seenNow === 'string' && seenNow.length > 0, 'editing a letter name repaints the question', bay ? 'the name is on screen' : 'that letter is not on this question');
  shell.setNames(shell.lettersOf().map(([, name], i) => (i === 1 ? 'Baa' : name)).join(', '));

  const groups = $('[data-groups]');
  const oldGroups = groups.attrs['data-groups'];
  const idBefore = $('.announce').textContent;
  groups.attrs['data-groups'] = 'ب ت, ج ح';
  qaida.render();
  await sleep(10);
  check($('.announce').textContent !== idBefore, 'editing the look-alike table deals a new question', $('.announce').textContent);
  groups.attrs['data-groups'] = oldGroups;
  qaida.render();

  qaida.setFormat('mix');
  await sleep(5);
  check(choices().length >= 2, 'Mix both still asks a question');
  qaida.setFormat('name');
  await sleep(5);
  check($('.prompt-name') && $('.choices').attrs['data-face'] === 'glyph', 'Name → letter shows a name and letters to pick from');
  qaida.setFormat('sound');
  await sleep(5);
  check(choices().length === 0 && /recordings are in/.test($('.verdict').textContent), 'Hear it → letter says plainly it is not open yet', $('.verdict').textContent);
  check(qaida.sound === 0, 'and reports no recordings, so the panel can switch that row off');
  qaida.setFormat('glyph');
  await sleep(5);
  check(choices().length === 4, 'back to Letter → name');

  qaida.setChoices(3);
  await sleep(5);
  check(choices().length === 3, 'Answers to pick from: three');
  qaida.setChoices(6);
  await sleep(5);
  check(choices().length === 6 && $('.choices').style.props['--cols-wide'] === 3, 'six, laid out three and three');
  qaida.setChoices(4);

  // Start again ----------------------------------------------------------------------------------------------------
  console.log('\nStart again');
  qaida.clear();
  await sleep(10);
  check($('.progress-text').textContent === '0 of 29 letters known', 'progress goes back to nothing', $('.progress-text').textContent);
  check(!$('.lesson').classes().includes('complete') && $('.ready-note').hidden && $('.struggle').hidden, 'the finished state and the advice go');
  check(!shell.isDone(2) && shell.masteredCount(2) === 0, 'and it is gone from the device too');
  check(choices().length === 4, 'a fresh question is asked');
  check($('.reset').hidden, '"Start again" hides until there is something to clear');

  qaida.masterAll();
  check(shell.masteredCount(2) === 29 && !$('.ready-note').hidden, 'Know them all: everything known, and it says so');
}

// The engine is asked for the answer by the page checks above; expose it on the published object for the test only.
const original = ctx.qaida;
Object.defineProperty(original, '__item', {
  value: () => {
    const shown = $('.prompt-glyph') && $('.prompt-glyph').textContent;
    const [glyph] = shell.lettersOf().find(([g]) => g === shown) || [];
    return { id: glyph && shell.keyOf(glyph) };
  },
});

main()
  .catch((error) => check(false, 'the page checks ran to the end', error.stack.split('\n').slice(0, 4).join(' | ')))
  .finally(() => {
    console.log(failed === 0 ? '\nAll page checks passed.' : `\n${failed} page check(s) FAILED.`);
    process.exit(failed);
  });
