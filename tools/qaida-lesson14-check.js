// Runs the mark lesson's page script against the real lesson-14.html in a small hand-made DOM, with no browser
// (QAIDA-BUILD.md step 9). Lesson 14's page checks (docs/lesson-14/06 §3): the jazam, and the LEAD — a vowelled alif
// drawn in front of every item and never part of an id.
//
//   node tools/qaida-lesson14-check.js
//
// The same limits as every other lesson-N-check: nothing is drawn and no CSS runs, so it cannot tell whether the jazam
// and zabar are told apart at the tile's size, whether the halo rings the jazam and not the alif, whether the tiles
// are wide enough for two letters, or how the leads line wraps on a phone. Those are the user's (docs/lesson-14/06 §4)
// and were looked at in the browser pane at the build. What it does prove: the scripts load against the markup, and
// that every Arabic glyph the page draws for an item starts with the lead and the bare tile does not, that the
// trio, the leads line, the per-script "you have met it" line, the wow-and-yaa note, the 27-letter table, the
// walkthrough with its jazam step and the last lesson's Next do what they say. Prints PASS or FAIL per check; the
// exit code is the number that failed.

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

//// A small DOM (copied from qaida-lesson6-check.js, which copied it from qaida-lesson3-check.js) ------------------

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

const PAGE = 'lesson-14.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 14: Jazam · Free Qaida',
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
check(true, `shell.js, audio.js, practice.js, marks.js, mark-lesson.js and spell.js load against ${PAGE} without an error`);

const $ = (sel) => doc.querySelector(sel);
const all = (sel) => doc.querySelectorAll(sel);
const shell = ctx.qaidaShell;
const marks = ctx.qaidaMarks;
const qaida = ctx.qaida;
const FATHA = String.fromCharCode(0x064E);
const KASRA = String.fromCharCode(0x0650);
const DAMMA = String.fromCharCode(0x064F);
const ALIF = String.fromCharCode(0x0627);
const JAZAM = String.fromCharCode(0x0652); // the mark as the id spells it, and as Indo-Pak draws it
const JAZAM_M = String.fromCharCode(0x06E1); // the mark as Madani draws it
const LEAD = ALIF + FATHA;
const mark = marks.MARKS.sukun;
const click = (el, detail = 1) => {
  const event = { type: 'click', target: el, detail, preventDefault() { this.defaultPrevented = true; } };
  for (let n = el; n; n = n.parent) for (const fn of n.listeners.click || []) fn.call(n, event);
};
const choices = () => $('.choices').children;
const rail = () => all('.band');
const everyItem = () => marks.allItems(shell, mark);
const keysOf = () => everyItem().map((it) => it.key);
const twinsAll = () => marks.twinItems(shell, mark, { keys: keysOf(), marks: [marks.MARKS.fatha, marks.MARKS.kasra, marks.MARKS.damma] });
const promptItem = () => {
  const shown = $('.prompt-glyph') ? $('.prompt-glyph').textContent : '';
  return everyItem().find((it) => it.glyph === shown) || twinsAll().find((it) => it.glyph === shown);
};
const answerFor = () => choices().find((c) => c.attrs['data-id'] === promptItem().id);
const wrongFor = () => choices().find((c) => c !== answerFor());
const tilesOf = (pair) => pair.querySelectorAll('button.mark-tile');
const glyphOfTile = (tile) => tile.querySelector('.glyph').textContent;
const jazamNote = () => $('.jazam-note').textContent;
const setScript = async (script) => { shell.state.script = script; shell.renderSetup(); await sleep(10); };
const setNames = async (names) => { shell.state.names = names; shell.renderSetup(); await sleep(10); };

async function main() {
  await sleep(20);
  qaida.setPause(1);

  console.log('\nThe page');
  check(qaida.kind === 'drill' && qaida.hasOther === true && qaida.otherCount === 3 && qaida.hasTail === true,
    'publishes window.qaida with kind "drill", three vowels to tell apart from, and wide tiles (the options panel\'s "two-letter tiles" row)');
  check(htmlEl.attrs['data-mark'] === 'sukun' && htmlEl.attrs['data-sits'] === 'above', 'the page teaches sukun, above the letter');
  check(htmlEl.attrs['data-board'] === 'trio' && htmlEl.attrs['data-arrows'] === 'all' && htmlEl.attrs['data-twins'] === 'alternate',
    'a trio, an arrow before every tile after the first, and the twins alternating');
  check(JSON.stringify(qaida.groupCosts().map((p) => [p.items])) === '[[6],[27]]', 'groupCosts() is 6 then 27', JSON.stringify(qaida.groupCosts()));
  check(rail().length === 2 && rail().every((b) => b.attrs.disabled === undefined), 'two parts, both enabled: nothing is locked');

  console.log('\nThe head: the lead on the title and both rail glyphs');
  check($('h1').textContent === 'Sukoon' && doc.title.startsWith('Lesson 14: Sukoon'), 'the title is Sukoon in the fatha set', $('h1').textContent + ' / ' + doc.title);
  check($('.title-mark').textContent === LEAD + 'ب' + JAZAM_M, 'the big glyph, Madani: the lead, baa, then U+06E1', $('.title-mark').textContent);
  const glyphs = all('.band-glyph').map((g) => g.textContent);
  check(glyphs.length === 2 && glyphs.every((g) => g.startsWith(LEAD)) && glyphs[0].endsWith(JAZAM_M), 'both rail glyphs start with the lead', glyphs.join(' | '));
  check($('.eyebrow').textContent === 'Lesson 14 of 14' && all('.track li').findIndex((li) => li.classes().includes('now')) === 13 && all('.track li').length === 14,
    'Lesson 14 of 14, the fourteenth of the track lit');
  check($('.bar').attrs['aria-valuemax'] === '27', 'the bar\'s total is 27');

  console.log('\nThe board: a trio after the lead, and the lines that explain it');
  const feature = $('.pair-feature');
  const featured = tilesOf(feature);
  check(featured.length === 3, 'the feature row has three tiles: bare, with zabar, with the jazam', String(featured.length));
  const pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6 && pairs.every((p) => p.classes().includes('trio')), 'part 1 has six letters, each a trio', String(pairs.length));
  check(pairs.every((p) => p.attrs['data-key'] !== 'ا'), 'and no alif');
  const key = pairs[0].attrs['data-key'];
  const row = tilesOf(pairs[0]);
  check(row.length === 3 && pairs[0].querySelectorAll('.pair-arrow').length === 2, 'a row is three tiles with an arrow before each of the last two');
  check(glyphOfTile(row[0]) === key && !glyphOfTile(row[0]).startsWith(ALIF), 'the bare tile is the letter alone: no lead', glyphOfTile(row[0]));
  check(glyphOfTile(row[1]) === LEAD + key + FATHA, 'the middle tile is the lead, the letter and zabar: "a-ba"', glyphOfTile(row[1]));
  check(glyphOfTile(row[2]) === LEAD + key + JAZAM_M, 'the marked tile is the lead, the letter and the Madani jazam: "ab"', glyphOfTile(row[2]));
  check(row[0].attrs['data-tail'] === undefined && row[1].attrs['data-tail'] === '' && row[2].attrs['data-tail'] === '',
    'data-tail is on every tile but the bare one: two letters, a wide tile');
  check(row[2].attrs['data-id'] === key + JAZAM && row[2].attrs['data-id'].length === 2 && row[1].attrs['data-id'] === key + FATHA,
    'the marked tile\'s id is the letter and the jazam, the middle tile\'s the letter and zabar: no lead in either', row[2].attrs['data-id']);
  check(all('.pairs .pair').every((p) => tilesOf(p).every((t, i) => (i === 0) === !glyphOfTile(t).startsWith(ALIF))),
    'in every row of part 1, only the bare tile has no lead');
  const captions = feature.querySelectorAll('.pair-caption').map((c) => c.textContent);
  check(captions.join('|') === 'The letter on its own|With fatha: two sounds|With sukoon: one sound', 'the feature row\'s three captions', captions.join('|'));
  check(/^A letter with sukoon has no vowel of its own\. It closes the sound before it: a, then ab\.$/.test($('.mark-does').textContent), 'and the "what it does" line', $('.mark-does').textContent);
  check($('.alone-glyph').textContent === String.fromCharCode(0x25CC) + JAZAM_M && /^Sukoon sits above the letter\.$/.test($('.alone-sits').textContent),
    'the mark alone is the dotted circle and the jazam, and "Sukoon sits above the letter."', $('.alone-glyph').textContent + ' / ' + $('.alone-sits').textContent);

  check(!$('.lead-line').hidden && $('.lead-line').textContent === 'Sukoon can’t be said on its own, so every letter here comes after an alif with fatha.',
    'the lead line says why the alif is there', $('.lead-line').textContent);
  check($('.joined').hidden, 'the joined block is hidden: "the same letter twice" would be a jazam on a jazam');
  const leads = () => $('.leads-example').textContent.split('  ');
  check(!$('.leads-note').hidden && leads().length === 3, 'the leads line shows three examples, in part 1', leads().join(' | '));
  check(leads().every((g) => g.endsWith('ب' + JAZAM_M)) && leads()[0] === ALIF + FATHA + 'ب' + JAZAM_M && leads()[1] === ALIF + KASRA + 'ب' + JAZAM_M && leads()[2] === ALIF + DAMMA + 'ب' + JAZAM_M,
    'composed in code: the alif with zabar, zair and paish before baa and the jazam');
  check(!/\{/.test($('.leads-note').textContent) && !$('.leads-example').textContent.includes('{'), 'with every token filled');
  check($('.wy-note').hidden && $('.skip-note').hidden, 'the wow-and-yaa note and the skip note are part 2 only');
  check(!$('.lam-alif-note') && !$('.met-note') && !$('.madani-note'), 'none of the other lessons\' notes are on this page');

  console.log('\nThe "you have met it" line, per script');
  check(!$('.jazam-note').hidden && /^You have met sukoon already, on the wow and the yaa: au and ai\. It does the same on every letter\.$/.test(jazamNote()),
    'Madani: it has only ever closed a syllable, au and ai', jazamNote());
  check(!/\{/.test(jazamNote()), 'with every token filled');
  await setScript('indopak');
  check(/^You have met sukoon already, on the wow and the yaa\. After zabar they said au and ai; after paish and zair they made the sound long\. Either way the letter had no vowel of its own, and that is what sukoon means on every letter\.$/.test(jazamNote()),
    'Indo-Pak: it has also sat on a long vowel, and the rule is the same one', jazamNote());
  const rowIP = tilesOf($('.pairs').querySelectorAll('.pair')[0]);
  check(glyphOfTile(rowIP[2]) === LEAD + key + JAZAM && rowIP[2].attrs['data-id'] === key + JAZAM, 'and the Indo-Pak tile draws U+0652 after the same lead, with the same id', glyphOfTile(rowIP[2]));
  check(glyphOfTile(rowIP[1]) === LEAD + key + FATHA && glyphOfTile(rowIP[0]) === key, 'and the other two tiles are unchanged');
  check($('.title-mark').textContent === LEAD + 'ب' + JAZAM, 'the title glyph follows the script', $('.title-mark').textContent);
  await setNames('zabar');
  check($('h1').textContent === 'Jazam' && /^You have met jazam already/.test(jazamNote()) && !/sukoon/.test(jazamNote()), 'the zabar set names it jazam', jazamNote());
  check($('.lead-line').textContent === 'Jazam can’t be said on its own, so every letter here comes after an alif with zabar.', 'and the lead line follows: "an alif with zabar"', $('.lead-line').textContent);
  check($('.pair-feature').querySelectorAll('.pair-caption').map((c) => c.textContent).join('|') === 'The letter on its own|With zabar: two sounds|With jazam: one sound', 'and the captions');
  await setScript('madani');
  await setNames('fatha');

  console.log('\nPart 2: 27 letters, the notes that belong to it');
  qaida.setGroup(2);
  await sleep(10);
  const pairs2 = $('.pairs').querySelectorAll('.pair');
  check(pairs2.length === 27 && !pairs2.some((p) => ['ا', 'ء'].includes(p.attrs['data-key'])), 'part 2 is 27 letters, no alif, no hamza', String(pairs2.length));
  check(pairs2.some((p) => p.attrs['data-key'] === 'و') && pairs2.some((p) => p.attrs['data-key'] === 'ي'), 'wow and yaa are in: they are the au and ai already read');
  check(pairs2.every((p) => tilesOf(p).slice(1).every((t) => glyphOfTile(t).startsWith(LEAD)) && !glyphOfTile(tilesOf(p)[0]).startsWith(ALIF)),
    'every row of part 2: the lead on both marked tiles, none on the bare one');
  check(!$('.wy-note').hidden && $('.wy-note').textContent === 'With wow and yaa, this is the au and ai you have already read.', 'the wow-and-yaa note shows', $('.wy-note').textContent);
  check(!$('.skip-note').hidden && $('.skip-note').textContent === 'Alif never carries sukoon, and hamza is not in this table.', 'and the skip note', $('.skip-note').textContent);
  check(!$('.lead-line').hidden && !$('.leads-note').hidden && leads().length === 3, 'the lead line and the leads line stay, in both parts');
  check($('.joined').hidden, 'and the joined block stays hidden');
  check(all('.band-glyph').map((g) => g.textContent).every((g) => g.startsWith(LEAD)) && all('.band-glyph')[1].textContent === LEAD + 'ع' + JAZAM_M,
    'part 2\'s rail glyph is ain after the lead');
  qaida.setGroup(1);
  await sleep(10);
  check($('.wy-note').hidden && $('.skip-note').hidden, 'back in part 1 both are hidden again');

  console.log('\nThe questions: the lead in every glyph, a vowel for every twin');
  for (const n of [1, 2]) {
    qaida.setGroup(n);
    await sleep(5);
    qaida.setFormat('glyph');
    qaida.next();
    let own = 0;
    let withTwin = 0;
    let promptsLed = 0;
    const vowels = new Set();
    for (let i = 0; i < 200; i += 1) {
      const it = promptItem();
      const shown = $('.prompt-glyph') ? $('.prompt-glyph').textContent : '';
      if (shown.startsWith(LEAD)) promptsLed += 1;
      const ids = choices().map((c) => c.attrs['data-id']);
      if (it && it.mark === 'sukun') {
        own += 1;
        const v = [FATHA, KASRA, DAMMA].find((x) => ids.includes(it.key + x));
        if (v) { withTwin += 1; vowels.add(v); }
      }
      qaida.next();
    }
    check(promptsLed === 200, 'part ' + n + ': the glyph prompt starts with the lead every time', promptsLed + ' of 200');
    check(own > 0 && withTwin === own, 'part ' + n + ': every jazam question offers its twin with a vowel', withTwin + ' of ' + own);
    check(vowels.size >= 2, 'part ' + n + ': more than one vowel comes up as the twin', [...vowels].length + ' of 3');
  }
  // The other way round: the name asked, the glyphs answered. Every answer is drawn after the lead.
  qaida.setGroup(1);
  await sleep(5);
  qaida.setFormat('name');
  let glyphChoices = 0;
  let ledChoices = 0;
  for (let i = 0; i < 60; i += 1) {
    qaida.next();
    for (const c of choices()) {
      const g = c.querySelector('.choice-glyph');
      if (!g) continue;
      glyphChoices += 1;
      if (g.textContent.startsWith(LEAD)) ledChoices += 1;
    }
  }
  check(glyphChoices > 0 && ledChoices === glyphChoices, 'asked by name, every choice glyph starts with the lead', ledChoices + ' of ' + glyphChoices);
  qaida.setFormat('glyph');

  console.log('\nAnswering: the verdict\'s glyph and "Write it" carry the lead');
  qaida.next();
  click(wrongFor(), 1);
  const verdict = $('.verdict').textContent;
  // A twin says what the letter really carries ("This is Seen with kasra"): the verdict names the stroke that is on it.
  check(/^That one is .+\. This is .+ with (sukoon|fatha|kasra|damma)\.$/.test(verdict) && !/wrong|incorrect|try again|!/i.test(verdict), 'a wrong answer names both and never scolds', verdict);
  const shownAfter = $('.after-glyph').textContent;
  check(shownAfter.startsWith(LEAD), 'the verdict\'s glyph starts with the lead', shownAfter);
  click($('.after .trace'), 1);
  check(opened.length > 0 && opened[opened.length - 1][0].startsWith(LEAD), '"Write it" opens the writing board on the lead and the letter, not the letter alone', opened.length ? opened[opened.length - 1][0] : 'none');
  click($('.next-question'), 1);
  await sleep(10);
  let it = null;
  for (let i = 0; i < 100 && !(it && it.mark === 'sukun'); i += 1) { qaida.next(); it = promptItem(); }
  check(it && it.mark === 'sukun', 'a Lesson 14 item comes up');
  click(answerFor(), 1);
  check(new RegExp('^Yes — ' + it.letterName + ' with sukoon\\.$').test($('.verdict').textContent), 'a right answer says "with sukoon" and does not name the alif', $('.verdict').textContent);

  console.log('\nFinishing: part 2 is the gate, at seven tenths of 27');
  shell.clearLesson(14);
  for (const item of marks.poolFor(everyItem(), 1)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(14, item.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(14), 'part 1 known alone does not finish the lesson');
  shell.clearLesson(14);
  const part2 = marks.poolFor(everyItem(), 2);
  for (const item of part2.slice(0, Math.ceil(27 * 0.7))) for (let k = 0; k < 3; k += 1) shell.recordAnswer(14, item.id, true);
  qaida.setGroup(2);
  await sleep(10);
  check(shell.isDone(14), 'seven tenths of part 2 known finishes the lesson');
  check(shell.masteredCount(14) === Math.ceil(27 * 0.7), 'and the home counts exactly those', String(shell.masteredCount(14)));
  check([4, 5, 6, 8, 10, 11, 12, 13].every((n) => shell.masteredCount(n) === 0), 'none of it counts toward another lesson');
  check(/^You can tell a letter that closes a sound from one that carries a vowel\./.test($('.end-line').textContent), 'the end line says so', $('.end-line').textContent);

  console.log('\nThe Spell block: qalbun in five steps, the jazam its own step');
  qaida.setGroup(1);
  await sleep(10);
  const wordButtons = all('.word-step');
  check(wordButtons.length === 3, 'three words to walk through', String(wordButtons.length));
  const captionsOf = [];
  click(wordButtons[1], 1);
  captionsOf.push($('.spell-caption').textContent);
  let guard = 0;
  while (!$('.spell-next').hidden && guard < 10) { click($('.spell-next'), 1); captionsOf.push($('.spell-caption').textContent); guard += 1; }
  console.log('      ' + captionsOf.join('\n      '));
  check(captionsOf.length === 5, 'qalbun is five steps', String(captionsOf.length));
  check(/with fatha: qa\.$/.test(captionsOf[0]), 'step 1 names the qaaf with zabar: qa', captionsOf[0]);
  check(/^\S+ with sukoon: no vowel of its own — it closes the sound before it\.$/.test(captionsOf[1]) && !/: l\./.test(captionsOf[1]), 'step 2 is the jazam\'s own line, with no sound of its own', captionsOf[1]);
  check(/^Put together: qal\.$/.test(captionsOf[2]), 'step 3 reads the closed syllable: qal', captionsOf[2]);
  check(/with two damma: bun\.$/.test(captionsOf[3]), 'step 4 is the baa with two damma', captionsOf[3]);
  check(/^The whole word: qalbun\.$/.test(captionsOf[4]), 'step 5 is the whole word', captionsOf[4]);
  const units = $('.spell-glyph').querySelectorAll('.unit');
  check(units.length === 3 && units.every((u) => !u.textContent.startsWith(ALIF + FATHA)), 'the word itself carries no lead: three letters, quaf, laam, baa', units.map((u) => u.textContent).join(' | '));
  check(units[1].textContent === 'ل' + JAZAM_M, 'and its laam is drawn with the Madani jazam', units[1].textContent);
  await setNames('zabar');
  for (let i = 0; i < 3; i += 1) click($('.spell-back'), 1); // from the whole word back to the jazam's own step
  check(/^\S+ with jazam: no vowel of its own/.test($('.spell-caption').textContent) && !/sukoon/.test($('.spell-caption').textContent),
    'the zabar set names it jazam in the walkthrough too, on the jazam\'s own step', $('.spell-caption').textContent);
  await setNames('fatha');

  console.log('\nThe ways out: Previous goes to Lesson 13, Next goes on to Lesson 15 (written when Lesson 14 was the last; docs/lesson-15/03 §7)');
  check($('.prev').attrs.href === 'lesson-13.html' && $('.prev span').textContent === 'Previous: Kasra and yaa', 'Previous goes to Lesson 13', $('.prev span').textContent);
  check($('.spell-more a').attrs.href === 'exercise-14.html' && fs.existsSync(path.join(dir, 'exercise-14.html')), 'Practice reading goes to exercise-14.html, which exists');
  check($('.next span').textContent === 'Next: Shadda' && !$('.next').attrs['data-last'], 'Next reads "Next: Shadda", an ordinary Next now that Lesson 15 exists', $('.next span').textContent);
  check($('.last-line').textContent === 'That is the last lesson in this part of the Qaida.', 'with a line above it saying this is the last lesson of the part', $('.last-line').textContent);
  click($('.next'), 1);
  check(location.href === 'lesson-15.html', 'and it goes to Lesson 15', location.href);
  await setNames('zabar');
  check($('.prev span').textContent === 'Previous: Zair and yaa' && $('.next span').textContent === 'Next: Tashdeed', 'in the zabar set, Previous and Next both follow the names');
  await setNames('fatha');

  console.log('\nThe markup');
  check(!/[ً-ٗۡۥۦ]/.test(raw), 'lesson-14.html holds no literal combining mark');
  check(/&#x627;&#x64E;&#x628;&#x652;/.test(raw), 'the title glyph is alif, U+064E, baa, U+0652');
  check(!/\b29\b/.test(raw.replace(/<!--[\s\S]*?-->/g, '')), 'no "29" anywhere on the page');
  const visible = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '').replace(/Next: (Shadda|Tashdeed)/g, '');
  check(!/\b(incorrect|wrong|try again|leen|madd|shadda|tajweed|qalqalah)\b/i.test(visible), 'no scolding, and no "leen", "madd" or tajweed word (the plain-names rule; docs/lesson-14/01 §6)');
  check(!/data-same|pair-equals|data-lam-alif/.test(raw.replace(/<!--[\s\S]*?-->/g, '')), 'no same-sound tile or lam-alif wording carried over from lessons 9-13');
  check(!/\b(yaa|ee)\b/i.test(visible.replace(/wow and the yaa|wow and yaa|and yaa|Kasra and yaa|Zair and yaa/g, '')), 'no leftover "yaa" or "ee" from Lesson 13\'s copy, outside the au/ai lines');

  console.log('\nThe reading page');
  const ex = fs.readFileSync(path.join(dir, 'exercise-14.html'), 'utf8');
  check(/data-mark="sukun"/.test(ex) && /href="lesson-14\.html"/.test(ex), 'exercise-14.html teaches sukun and goes back to Lesson 14');
  check(/data-next-fatha="Next: Shadda"/.test(ex) && /data-next-zabar="Next: Tashdeed"/.test(ex) && !/data-last/.test(ex), 'its Next goes on to Lesson 15');
  check(!/[ً-ٗۡۥۦ]/.test(ex), 'and holds no literal combining mark');

  console.log(failed === 0 ? '\nAll checks passed.' : '\n' + failed + ' check(s) FAILED.');
  process.exitCode = failed;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
