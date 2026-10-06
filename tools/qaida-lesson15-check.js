// Runs the mark lesson's page script against the real lesson-15.html in a small hand-made DOM, with no browser
// (QAIDA-BUILD.md step P1). Lesson 15's page checks (docs/lesson-15/06 §3): the shadda, a letter said twice, with Lesson
// 14's LEAD - a vowelled alif drawn in front of every item and never part of an id - and the hum line on noon and meem.
//
//   node tools/qaida-lesson15-check.js
//
// The same limits as every other lesson-N-check: nothing is drawn and no CSS runs, so it cannot tell whether the shadda
// is told apart from the vowel at the tile's size, whether the halo rings the shadda and not the vowel or the alif, or
// how the kasra sits under the shadda in each face. Those are the user's (docs/lesson-15/06 §4) and were measured in the
// browser pane at the build. What it does prove: the scripts load against the markup, and that the quartet, its captions
// (two of them per column), the hum line in the parts with noon and meem only, the kasra's own line, the 27-letter last
// part, the ids, the questions, the finish gate, the walkthrough and the ways out do what they say. Prints PASS or FAIL
// per check; the exit code is the number that failed.
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

const PAGE = 'lesson-15.html';
const raw = fs.readFileSync(path.join(dir, PAGE), 'utf8');
const nodes = parse(raw);
const htmlEl = nodes.find((n) => n.tag === 'html');
const doc = {
  documentElement: htmlEl,
  activeElement: null,
  title: 'Lesson 15: Tashdeed · Free Qaida',
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
const SHADDA = String.fromCharCode(0x0651);
const ALIF = String.fromCharCode(0x0627);
const JAZAM = String.fromCharCode(0x0652); // as the id spells it and as Indo-Pak draws it
const JAZAM_M = String.fromCharCode(0x06E1); // as Madani draws it
const LEAD = ALIF + FATHA;
const own = marks.marksOf('shadda');
const [mFatha, mKasra, mDamma] = own;
const VOWELS = [FATHA, KASRA, DAMMA];
const click = (el, detail = 1) => {
  const event = { type: 'click', target: el, detail, preventDefault() { this.defaultPrevented = true; } };
  for (let n = el; n; n = n.parent) for (const fn of n.listeners.click || []) fn.call(n, event);
};
const choices = () => $('.choices').children;
const rail = () => all('.band');
const everyItem = () => marks.allItems(shell, own);
const keysOf = () => [...new Set(everyItem().map((it) => it.key))];
// Every twin the page can build: the plain vowels and the jazam (the warm-ups), and the other two shaddas (the last part).
const twinsAll = () => marks.twinItems(shell, own[0], {
  keys: keysOf(), marks: [marks.MARKS.fatha, marks.MARKS.kasra, marks.MARKS.damma, marks.MARKS.sukun, ...own],
});
const promptItem = () => {
  const shown = $('.prompt-glyph') ? $('.prompt-glyph').textContent : '';
  return everyItem().find((it) => it.glyph === shown) || twinsAll().find((it) => it.glyph === shown);
};
const answerFor = () => choices().find((c) => c.attrs['data-id'] === promptItem().id);
const wrongFor = () => choices().find((c) => c !== answerFor());
const tilesOf = (pair) => pair.querySelectorAll('button.mark-tile');
const glyphOfTile = (tile) => tile.querySelector('.glyph').textContent;
const setScript = async (script) => { shell.state.script = script; shell.renderSetup(); await sleep(10); };
const setNames = async (names) => { shell.state.names = names; shell.renderSetup(); await sleep(10); };
const captionsOf = (box) => box.querySelectorAll('.pair-caption').map((c) => c.textContent);

async function main() {
  await sleep(20);
  qaida.setPause(1);

  console.log('\nThe page');
  check(qaida.kind === 'drill' && qaida.hasOther === true && qaida.otherCount === 2 && qaida.hasTail === true && qaida.markCount === 3,
    'publishes window.qaida with kind "drill", two marks to tell apart from in a warm-up, wide tiles, and three marks');
  check(htmlEl.attrs['data-mark'] === 'shadda' && htmlEl.attrs['data-sits'] === 'above', 'the page teaches the shadda set, above the letter');
  check(htmlEl.attrs['data-board'] === 'auto' && htmlEl.attrs['data-arrows'] === 'last' && htmlEl.attrs['data-twins'] === 'alternate',
    'a quartet by "auto", an arrow only before the last tile, and the twins alternating');
  check(JSON.stringify(qaida.groupCosts().map((p) => p.items)) === '[6,6,6,27]', 'groupCosts() is 6, 6, 6 then 27', JSON.stringify(qaida.groupCosts().map((p) => p.items)));
  check(rail().length === 4 && rail().every((b) => b.attrs.disabled === undefined), 'four parts, all enabled: nothing is locked');

  console.log('\nThe head: the lead on the title and every rail glyph');
  check($('h1').textContent === 'Shadda' && doc.title.startsWith('Lesson 15: Shadda'), 'the title is Shadda in the fatha set', $('h1').textContent + ' / ' + doc.title);
  check($('.title-mark').textContent === LEAD + 'ب' + FATHA + SHADDA, 'the big glyph: the lead, baa, zabar, then the shadda', $('.title-mark').textContent);
  const glyphs = all('.band-glyph').map((g) => g.textContent);
  check(glyphs.length === 4 && glyphs.every((g) => g.startsWith(LEAD) && g.endsWith(SHADDA)), 'all four rail glyphs start with the lead and end with the shadda', glyphs.join(' | '));
  check(glyphs[0] === LEAD + 'ب' + FATHA + SHADDA && glyphs[1] === LEAD + 'د' + KASRA + SHADDA && glyphs[2] === LEAD + 'ب' + DAMMA + SHADDA && glyphs[3] === LEAD + 'ع' + FATHA + SHADDA,
    'and they are baa with zabar, daal with zair, baa with paish, then ain', glyphs.join(' | '));
  check($('.eyebrow').textContent === 'Lesson 15 of 29' && all('.track li').length === 29 && all('.track li').findIndex((li) => li.classes().includes('now')) === 14,
    'Lesson 15 of 29, the fifteenth of the track lit');
  check($('.bar').attrs['aria-valuemax'] === String(everyItem().length), 'the bar\'s total is every item of the lesson (the whole set, warm-ups included)', $('.bar').attrs['aria-valuemax']);
  check(!$('.jazam-note') && !$('.leads-note') && !$('.wy-note') && !$('.lam-alif-note') && !$('.met-note') && !$('.madani-note'), 'none of the other lessons\' notes is on this page');

  console.log('\nPart 1: the quartet after the lead, and the lines that explain it');
  const feature = $('.pair-feature');
  const featured = tilesOf(feature);
  check(featured.length === 4, 'the feature row has four tiles: bare, once with zabar, once closed, twice', String(featured.length));
  const pairs = $('.pairs').querySelectorAll('.pair');
  check(pairs.length === 6 && pairs.every((p) => p.classes().includes('quad')), 'part 1 has six letters, each a quartet', String(pairs.length));
  check(pairs.every((p) => p.attrs['data-key'] !== 'ا'), 'and no alif');
  const key = pairs[0].attrs['data-key'];
  const row = tilesOf(pairs[0]);
  check(row.length === 4 && pairs[0].querySelectorAll('.pair-arrow').length === 1, 'a row is four tiles with ONE arrow, before the last');
  check(glyphOfTile(row[0]) === key && !glyphOfTile(row[0]).startsWith(ALIF), 'the bare tile is the letter alone: no lead', glyphOfTile(row[0]));
  check(glyphOfTile(row[1]) === LEAD + key + FATHA, 'the second is the lead, the letter and zabar: "a-ba"', glyphOfTile(row[1]));
  check(glyphOfTile(row[2]) === LEAD + key + JAZAM_M, 'the third is the lead, the letter and the Madani jazam: "ab"', glyphOfTile(row[2]));
  check(glyphOfTile(row[3]) === LEAD + key + FATHA + SHADDA, 'the fourth is the lead, the letter, zabar and the shadda: "ab-ba"', glyphOfTile(row[3]));
  check(row[0].attrs['data-tail'] === undefined && row.slice(1).every((t) => t.attrs['data-tail'] === ''), 'data-tail is on every tile but the bare one');
  check(row[3].attrs['data-id'] === key + FATHA + SHADDA && row[3].attrs['data-id'].length === 3 && row[1].attrs['data-id'] === key + FATHA && row[2].attrs['data-id'] === key + JAZAM,
    'the shadda tile\'s id is the letter, the vowel and the shadda; the other two are two characters: no lead in any', row[3].attrs['data-id']);
  check(row.every((t) => t.attrs['data-sits'] === 'above'), 'every tile sits above');
  check(all('.pairs .pair').every((p) => tilesOf(p).every((t, i) => (i === 0) === !glyphOfTile(t).startsWith(ALIF))), 'in every row of part 1, only the bare tile has no lead');
  const c1 = captionsOf(feature);
  check(c1.join('|') === 'The letter|Once, with fatha: a-ba|Once, closed: ab|Twice: ab-ba', 'the feature row\'s four captions, two of them per column', c1.join('|'));
  check($('.mark-does').textContent === 'Tashdeed is a jazam and a vowel on one letter: the letter closes the sound before it, then opens its own.'.replace('Tashdeed', 'Shadda').replace('a jazam', 'a sukoon'),
    'and the "what it does" line', $('.mark-does').textContent);
  check($('.alone-glyph').textContent === String.fromCharCode(0x25CC) + FATHA + SHADDA && $('.alone-sits').textContent === 'Shadda sits above the letter, with its vowel.',
    'the mark alone is the dotted circle, zabar and the shadda, and "Shadda sits above the letter, with its vowel."', $('.alone-glyph').textContent + ' / ' + $('.alone-sits').textContent);
  check(!$('.lead-line').hidden && $('.lead-line').textContent === 'Shadda starts by closing a sound, so every letter here comes after an alif with fatha.',
    'the lead line says why the alif is there', $('.lead-line').textContent);
  check($('.joined').hidden, 'the joined block is hidden');
  check(!$('.hum-note').hidden && $('.hum-note').textContent === 'On noon and meem, shadda is held for a moment with a hum through the nose. This is called ghunna.',
    'the hum line shows: part 1 holds meem', $('.hum-note').textContent);
  check($('.skip-note').hidden, 'the skip note is part 4 only');
  check(!/\{/.test(all('.marks-board p').map((p) => p.textContent).join(' ')), 'and no token is left unfilled on the board');

  console.log('\nThe script and the names');
  await setScript('indopak');
  const rowIP = tilesOf($('.pairs').querySelectorAll('.pair')[0]);
  check(glyphOfTile(rowIP[2]) === LEAD + key + JAZAM && glyphOfTile(rowIP[3]) === LEAD + key + FATHA + SHADDA && rowIP[3].attrs['data-id'] === key + FATHA + SHADDA,
    'Indo-Pak: U+0652 for the jazam, the same shadda tile, and the same id', glyphOfTile(rowIP[2]) + ' / ' + glyphOfTile(rowIP[3]));
  check($('.title-mark').textContent === LEAD + 'ب' + FATHA + SHADDA, 'the title glyph is the same in both', $('.title-mark').textContent);
  await setNames('zabar');
  check($('h1').textContent === 'Tashdeed' && $('.alone-label').textContent === 'This is tashdeed and zabar.', 'the zabar set names it tashdeed', $('.alone-label').textContent);
  check($('.lead-line').textContent === 'Tashdeed starts by closing a sound, so every letter here comes after an alif with zabar.', 'and the lead line follows: "an alif with zabar"', $('.lead-line').textContent);
  check(captionsOf($('.pair-feature')).join('|') === 'The letter|Once, with zabar: a-ba|Once, closed: ab|Twice: ab-ba', 'and the captions', captionsOf($('.pair-feature')).join('|'));
  check(rail().map((b) => b.attrs['aria-label']).join(' / ').includes('Meet tashdeed and zair'), 'and the rail: "Meet tashdeed and zair"', rail()[1].attrs['aria-label']);
  await setScript('madani');
  await setNames('fatha');

  console.log('\nPart 2: shadda and kasra, the line for the kasra\'s place, and no hum');
  qaida.setGroup(2);
  await sleep(10);
  const pairs2 = $('.pairs').querySelectorAll('.pair');
  check(pairs2.length === 6, 'part 2 has six letters', String(pairs2.length));
  const key2 = pairs2[0].attrs['data-key'];
  const row2 = tilesOf(pairs2[0]);
  check(glyphOfTile(row2[1]) === LEAD + key2 + KASRA && glyphOfTile(row2[2]) === LEAD + key2 + JAZAM_M && glyphOfTile(row2[3]) === LEAD + key2 + KASRA + SHADDA,
    'the row is the letter, once with zair, once closed, twice with zair', row2.map(glyphOfTile).join(' | '));
  check(row2[3].attrs['data-sits'] === 'above' && row2[1].attrs['data-sits'] === 'below', 'the shadda tile sits above; the plain kasra tile beside it sits below');
  check(captionsOf($('.pair-feature')).join('|') === 'The letter|Once, with kasra: a-' + 't' + 'i|Once, closed: at|Twice: at-ti', 'the captions say the part\'s own vowel, and the letter\'s own consonant (taa)', captionsOf($('.pair-feature')).join('|'));
  check($('.alone-sits').textContent === 'Shadda sits above the letter, and the kasra sits just under the shadda — still a kasra. Some printed Qaidas write it under the letter instead.',
    'the kasra\'s place has its own line, and says printed Qaidas differ', $('.alone-sits').textContent);
  check($('.hum-note').hidden, 'no hum line: there is no noon or meem in part 2');
  check($('.skip-note').hidden, 'and no skip note');
  qaida.setGroup(3);
  await sleep(10);
  const row3 = tilesOf($('.pairs').querySelectorAll('.pair')[0]);
  check(glyphOfTile(row3[3]) === LEAD + 'ب' + DAMMA + SHADDA && captionsOf($('.pair-feature')).join('|') === 'The letter|Once, with damma: a-bu|Once, closed: ab|Twice: ab-bu',
    'part 3 is the paish one, "ab-bu"', captionsOf($('.pair-feature')).join('|'));
  check(!$('.hum-note').hidden && $('.alone-sits').textContent === 'Shadda sits above the letter, with its vowel.', 'the hum line is back, and so is the ordinary sits line');

  console.log('\nPart 4: 27 letters, the other two shaddas in the middle');
  qaida.setGroup(4);
  await sleep(10);
  const pairs4 = $('.pairs').querySelectorAll('.pair');
  check(pairs4.length === 27 && !pairs4.some((p) => ['ا', 'ء'].includes(p.attrs['data-key'])), 'part 4 is 27 letters, no alif, no hamza', String(pairs4.length));
  check(pairs4.some((p) => p.attrs['data-key'] === 'و') && pairs4.some((p) => p.attrs['data-key'] === 'ي'), 'wow and yaa are in: اَوَّ and اَيَّ are common');
  const row4 = tilesOf(pairs4[0]);
  check(row4.length === 4 && glyphOfTile(row4[1]) === LEAD + pairs4[0].attrs['data-key'] + KASRA + SHADDA && glyphOfTile(row4[2]) === LEAD + pairs4[0].attrs['data-key'] + DAMMA + SHADDA
    && glyphOfTile(row4[3]) === LEAD + pairs4[0].attrs['data-key'] + FATHA + SHADDA, 'each row is the letter, then the other two shaddas, then zabar\'s', row4.map(glyphOfTile).join(' | '));
  check(pairs4.every((p) => tilesOf(p).slice(1).every((t) => glyphOfTile(t).startsWith(LEAD) && glyphOfTile(t).endsWith(SHADDA))), 'every marked tile of part 4 has the lead and ends in the shadda');
  check(captionsOf($('.pair-feature')).join('|') === 'The letter|Twice: ab-bi|Twice: ab-bu|Twice: ab-ba', 'the last part\'s captions', captionsOf($('.pair-feature')).join('|'));
  check(!$('.skip-note').hidden && $('.skip-note').textContent === 'Alif is never doubled, and hamza is not in this table.', 'the skip note shows', $('.skip-note').textContent);
  check(!$('.hum-note').hidden, 'and so does the hum line: noon and meem are in');
  const spread = own.map((m) => everyItem().filter((it) => marks.inPart(it, 4) && it.mark === m.id).length);
  check(spread.reduce((a, b) => a + b, 0) === 27 && spread.every((n) => n >= 8 && n <= 10), 'the 27 spread over the three shaddas roughly evenly', spread.join('/'));
  check(everyItem().every((it) => it.id.length === 3 && it.id.endsWith(SHADDA) && it.glyph.startsWith(LEAD)), 'every item\'s id is three characters ending in the shadda, and every glyph starts with the lead');

  console.log('\nBoth scripts, one set of ids');
  const idsMadani = everyItem().map((it) => it.id).sort().join(',');
  await setScript('indopak');
  const idsIndoPak = everyItem().map((it) => it.id).sort().join(',');
  check(idsMadani === idsIndoPak && everyItem().length > 0, 'the same ids in Madani and Indo-Pak, so mastery survives a switch');
  await setScript('madani');

  console.log('\nThe questions: the lead in every glyph, and a same-letter twin for every own item');
  for (const n of [1, 2, 3, 4]) {
    qaida.setGroup(n);
    await sleep(5);
    qaida.setFormat('glyph');
    qaida.next();
    let ownAsked = 0;
    let withTwin = 0;
    let promptsLed = 0;
    for (let i = 0; i < 100; i += 1) {
      const it = promptItem();
      const shown = $('.prompt-glyph') ? $('.prompt-glyph').textContent : '';
      if (shown.startsWith(LEAD)) promptsLed += 1;
      const ids = choices().map((c) => c.attrs['data-id']);
      if (it && it.marked && marks.inPart(it, n)) {
        ownAsked += 1;
        // A warm-up: the same letter once with the vowel or once closed. The last part: another shadda on the same letter.
        const twinIds = n < 4
          ? [it.key + [FATHA, KASRA, DAMMA][n - 1], it.key + JAZAM]
          : own.filter((m) => m.id !== it.mark).map((m) => it.key + marks.suffixOf(m));
        if (twinIds.some((id) => ids.includes(id))) withTwin += 1;
      }
      qaida.next();
    }
    check(promptsLed === 100, 'part ' + n + ': the glyph prompt starts with the lead every time', promptsLed + ' of 100');
    check(ownAsked > 0 && withTwin === ownAsked, 'part ' + n + ': every question about a Lesson 15 item offers its twin', withTwin + ' of ' + ownAsked);
  }
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

  console.log('\nAnswering');
  qaida.next();
  click(wrongFor(), 1);
  const verdict = $('.verdict').textContent;
  check(/^That one is .+\. This is .+ with (shadda and fatha|sukoon|fatha)\.$/.test(verdict) && !/wrong|incorrect|try again|!/i.test(verdict), 'a wrong answer names both and never scolds', verdict);
  check($('.after-glyph').textContent.startsWith(LEAD), 'the verdict\'s glyph starts with the lead', $('.after-glyph').textContent);
  click($('.after .trace'), 1);
  check(opened.length > 0 && opened[opened.length - 1][0].startsWith(LEAD),
    '"Write it" opens the writing board on the lead and the whole item, not the letter alone', opened.length ? opened[opened.length - 1][0] : 'none');
  click($('.next-question'), 1);
  await sleep(10);
  let it = null;
  for (let i = 0; i < 100 && !(it && it.mark === 'shadda-fatha' && marks.inPart(it, 1)); i += 1) { qaida.next(); it = promptItem(); }
  check(it && it.mark === 'shadda-fatha', 'a Lesson 15 item comes up');
  click(answerFor(), 1);
  check(new RegExp('^Yes — ' + it.letterName + ' with shadda and fatha\\.$').test($('.verdict').textContent), 'a right answer says "with shadda and fatha" and does not name the alif', $('.verdict').textContent);

  console.log('\nFinishing: part 4 is the gate, at seven tenths of 27');
  shell.clearLesson(15);
  for (const item of marks.poolFor(everyItem(), 1)) for (let k = 0; k < 3; k += 1) shell.recordAnswer(15, item.id, true);
  qaida.setGroup(1);
  await sleep(10);
  check(!shell.isDone(15), 'part 1 known alone does not finish the lesson');
  shell.clearLesson(15);
  const part4 = marks.poolFor(everyItem(), 4);
  for (const item of part4.slice(0, Math.ceil(27 * 0.7))) for (let k = 0; k < 3; k += 1) shell.recordAnswer(15, item.id, true);
  qaida.setGroup(4);
  await sleep(10);
  check(shell.isDone(15), 'seven tenths of part 4 known finishes the lesson');
  check(shell.masteredCount(15) === Math.ceil(27 * 0.7), 'and the home counts exactly those', String(shell.masteredCount(15)));
  for (const twin of marks.twinItems(shell, mFatha, { keys: ['د'], marks: [marks.MARKS.fatha, marks.MARKS.sukun] })) for (let k = 0; k < 3; k += 1) shell.recordAnswer(15, twin.id, true);
  check(shell.masteredCount(15) === Math.ceil(27 * 0.7), 'a mastered twin (baa with zabar, baa with jazam) does not add to it', String(shell.masteredCount(15)));
  check([4, 5, 6, 8, 10, 11, 12, 13, 14].every((n) => shell.masteredCount(n) === 0), 'none of it counts toward another lesson');
  check(/^You can tell a letter said twice from one said once\./.test($('.end-line').textContent), 'the end line says so', $('.end-line').textContent);

  console.log('\nThe Spell block: muhammadun in seven steps, the shadda its own line');
  qaida.setGroup(1);
  await sleep(10);
  const wordButtons = all('.word-step');
  check(wordButtons.length === 3, 'three words to walk through', String(wordButtons.length));
  const steps = [];
  click(wordButtons[2], 1);
  steps.push($('.spell-caption').textContent);
  let guard = 0;
  while (!$('.spell-next').hidden && guard < 12) { click($('.spell-next'), 1); steps.push($('.spell-caption').textContent); guard += 1; }
  console.log('      ' + steps.join('\n      '));
  check(steps.length === 7, 'muhammadun is seven steps', String(steps.length));
  check(/with damma: mu\.$/.test(steps[0]) && /with fatha: ha\.$/.test(steps[1]) && /^Put together: muha\.$/.test(steps[2]), 'steps 1-3: mu, ha, muha', steps.slice(0, 3).join(' / '));
  check(/^Meem with shadda and fatha: said twice — it closes the sound before it and starts its own: mma\.$/.test(steps[3]), 'step 4 is the shadda\'s own line', steps[3]);
  check(/^Put together: muhamma\.$/.test(steps[4]) && /with two damma: dun\.$/.test(steps[5]) && /^The whole word: muhammadun\.$/.test(steps[6]), 'steps 5-7: muhamma, dun, muhammadun', steps.slice(4).join(' / '));
  const units = $('.spell-glyph').querySelectorAll('.unit');
  check(units.length === 4 && units.every((u) => !u.textContent.startsWith(ALIF + FATHA)), 'the word carries no lead: four letters', units.map((u) => u.textContent).join(' | '));
  check(units[2].textContent === 'م' + FATHA + SHADDA, 'and its second meem is drawn with zabar then the shadda', units[2].textContent);
  await setNames('zabar');
  for (let i = 0; i < 3; i += 1) click($('.spell-back'), 1);
  check(/^\S+ with tashdeed and zabar: said twice/.test($('.spell-caption').textContent), 'the zabar set names it tashdeed in the walkthrough', $('.spell-caption').textContent);
  await setNames('fatha');

  console.log('\nThe ways out: Previous goes to Lesson 14, Next to Lesson 16 (built 2026-09-30: a real link now)');
  check($('.prev').attrs.href === 'lesson-14.html' && $('.prev span').textContent === 'Previous: Sukoon', 'Previous goes to Lesson 14', $('.prev span').textContent);
  check($('.spell-more a').attrs.href === 'exercise-15.html' && fs.existsSync(path.join(dir, 'exercise-15.html')), 'Practice reading goes to exercise-15.html, which exists');
  check($('.next span').textContent === 'Next: Hamza' && !$('.next').attrs['data-last'], 'Next reads "Next: Hamza"', $('.next span').textContent);
  location.href = '';
  click($('.next'), 1);
  check(location.href === 'lesson-16.html', 'and it goes to Lesson 16, which is built (it said "not built yet" until Lesson 16 existed)', location.href);
  await setNames('zabar');
  check($('.prev span').textContent === 'Previous: Jazam' && $('.next span').textContent === 'Next: Hamza', 'in the zabar set, Previous follows the names', $('.prev span').textContent);
  await setNames('fatha');
  check(!$('.last-line'), 'and there is no "last lesson" line');

  console.log('\nThe markup');
  check(!/[ً-ْٰۖ-ۭ]/.test(raw), 'lesson-15.html holds no literal combining mark');
  check(/&#x627;&#x64E;&#x628;&#x64E;&#x651;/.test(raw), 'the title glyph is alif, U+064E, baa, U+064E, U+0651');
  check(!/\b29\b/.test(raw.replace(/<!--[\s\S]*?-->/g, '').replace('Lesson 15 of 29', '')), 'no "29" on the page but the lesson count (the letters here are 27)');
  const visible = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/data-words-attr="[^"]*"/g, '').replace(/data-trace="[^"]*"/g, '').replace(/\bdata-[\w-]+=/g, '');
  check(!/\b(incorrect|wrong|try again|leen|madd|qalqalah|idgham|ikhfa|izhar)\b/i.test(visible), 'no scolding and no tajweed word but "ghunna" (the plain-names rule; docs/pass-2/03 §4)');
  check((visible.match(/ghunna/g) || []).length === 1, '"ghunna" is named exactly once');
  check(!/\b(jazam-note|leads-note|wy-note)\b/.test(raw.replace(/<!--[\s\S]*?-->/g, '')), 'and no element of Lesson 14\'s that this page does not use');

  console.log('\nThe reading page');
  const ex = fs.readFileSync(path.join(dir, 'exercise-15.html'), 'utf8');
  check(/data-mark="shadda"/.test(ex) && /href="lesson-15\.html"/.test(ex), 'exercise-15.html teaches the shadda set and goes back to Lesson 15');
  check(/data-next-fatha="Next: Hamza"/.test(ex) && !/data-last/.test(ex), 'its Next goes on to Lesson 16');
  check(!/[ً-ْٰۖ-ۭ]/.test(ex), 'and holds no literal combining mark');

  console.log(failed === 0 ? '\nAll checks passed.' : '\n' + failed + ' check(s) FAILED.');
  process.exitCode = failed;
}

main();
