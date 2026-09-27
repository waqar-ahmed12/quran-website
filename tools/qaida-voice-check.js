// Runs voice-store.js and voice.js with no browser at all (step 7), the house pattern: a hand-made DOM, a fake
// IndexedDB, a fake MediaRecorder and getUserMedia. docs/your-voice/08 §3 lists what this covers.
//
//   node tools/qaida-voice-check.js
//
// Prints PASS or FAIL per check; the exit code is the number that failed. Two things only a browser can say and
// this script cannot: whether the recording indicator really goes dark (docs/your-voice/08 §4, item 1 — the user's
// own preview checklist), and whether the waveform reads as a picture or a score (item 7).

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
// Polls instead of guessing a fixed delay: voice.js chains several fake-async hops (a fake IndexedDB transaction,
// a decode, a store write) whose exact tick count isn't worth hard-coding.
async function waitUntil(fn, timeout = 1000) {
  const start = Date.now();
  // eslint-disable-next-line no-await-in-loop -- a poll loop is the point; fn may itself be async
  while (!(await fn())) {
    if (Date.now() - start > timeout) return false;
    // eslint-disable-next-line no-await-in-loop
    await sleep(5);
  }
  return true;
}

// A small DOM (the same shape as qaida-marks-check.js / qaida-lesson3-check.js), plus a `close()` that actually
// fires its listeners: voice.js relies on the dialog's own 'close' event to tear down the microphone. -----------

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
    this.style = { props: {}, setProperty(k, v) { this.props[k] = v; }, removeProperty(k) { delete this.props[k]; } };
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
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this.children = []; this._text = String(v); }
  set innerHTML(html) { this.children = []; this._text = ''; for (const node of parse(html)) this.append(node); }
  insertAdjacentHTML(position, html) { for (const node of parse(html)) this.append(node); }
  get firstChild() { return this.children[0] || null; }
  get lastElementChild() { return this.children[this.children.length - 1] || null; }
  get isConnected() { return true; }
  append(...nodes) {
    for (const n of nodes) {
      if (typeof n === 'string') { this._text += n; continue; }
      n.parent = this;
      this.children.push(n);
    }
  }
  select() {}
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  toggleAttribute(k, force) { if (force) this.attrs[k] = ''; else delete this.attrs[k]; }
  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
  removeEventListener(type, fn) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((f) => f !== fn);
  }
  focus() { doc.activeElement = this; }
  remove() {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }
  showModal() { this.open = true; }
  // Unlike the read-only check scripts, voice.js listens for 'close' to tear the microphone down, so this fires it.
  close() {
    if (!this.open) return;
    this.open = false;
    for (const fn of (this.listeners.close || []).slice()) fn.call(this, { target: this });
  }
  getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  getContext() {
    return { setTransform() {}, clearRect() {}, fillRect() {}, fillStyle: '' };
  }
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

const click = (el) => {
  const event = { type: 'click', target: el, preventDefault() { this.defaultPrevented = true; } };
  for (let n = el; n; n = n.parent) for (const fn of (n.listeners.click || []).slice()) fn.call(n, event);
};

// A fake IndexedDB, in-memory, async via setTimeout so it behaves like the real thing. --------------------------

function makeFakeIndexedDB(behavior = {}) {
  const databases = new Map();
  const request = () => ({ onsuccess: null, onerror: null, result: undefined });
  const fire = (req, ok, result) => setTimeout(() => {
    req.result = result;
    if (ok) { if (req.onsuccess) req.onsuccess({ target: req }); } else if (req.onerror) req.onerror({ target: req });
  }, 0);
  const storeApi = (store) => ({
    get: (id) => { const r = request(); fire(r, true, store.get(id)); return r; },
    getKey: (id) => { const r = request(); fire(r, true, store.has(id) ? id : undefined); return r; },
    getAllKeys: () => { const r = request(); fire(r, true, [...store.keys()]); return r; },
    getAll: () => { const r = request(); fire(r, true, [...store.values()]); return r; },
    put: (record) => {
      const r = request();
      if (behavior.failWrites) { fire(r, false); return r; }
      store.set(record.id, record);
      fire(r, true, record.id);
      return r;
    },
    delete: (id) => { const r = request(); store.delete(id); fire(r, true); return r; },
    clear: () => { const r = request(); store.clear(); fire(r, true); return r; },
    createIndex() {},
  });
  return {
    open(name) {
      const req = { onupgradeneeded: null, onsuccess: null, onerror: null, onblocked: null, result: undefined };
      setTimeout(() => {
        if (behavior.refuse) { if (req.onerror) req.onerror({ target: req }); return; }
        let entry = databases.get(name);
        const isNew = !entry;
        if (!entry) { entry = { stores: new Map() }; databases.set(name, entry); }
        const db = {
          objectStoreNames: { contains: (n) => entry.stores.has(n) },
          createObjectStore: (n) => { const store = new Map(); entry.stores.set(n, store); return storeApi(store); },
          transaction: (names) => {
            const store = entry.stores.get(Array.isArray(names) ? names[0] : names);
            return { onerror: null, onabort: null, objectStore: () => storeApi(store) };
          },
        };
        req.result = db;
        if (isNew && req.onupgradeneeded) req.onupgradeneeded({ target: req });
        if (req.onsuccess) req.onsuccess({ target: req });
      }, 0);
      return req;
    },
  };
}

// A fake microphone: getUserMedia, MediaRecorder, and an AudioContext for the level ring and decodeAudioData. ----

const stoppedTracks = [];
let micBehavior = 'allow'; // 'allow' | 'deny' | 'nomic'

function makeStream() {
  const track = { stop() { stoppedTracks.push(track); } };
  return { getTracks: () => [track] };
}

const mediaDevices = {
  getUserMedia: () => {
    if (micBehavior === 'deny') { const e = new Error('denied'); e.name = 'NotAllowedError'; return Promise.reject(e); }
    if (micBehavior === 'nomic') { const e = new Error('none'); e.name = 'NotFoundError'; return Promise.reject(e); }
    return Promise.resolve(makeStream());
  },
};

class FakeMediaRecorder {
  constructor(stream, options = {}) {
    this.stream = stream;
    this.mimeType = options.mimeType || 'audio/webm;codecs=opus';
    this.state = 'inactive';
    this.ondataavailable = null;
    this.onstop = null;
  }
  static isTypeSupported(type) { return type === 'audio/webm;codecs=opus'; }
  start() { this.state = 'recording'; }
  stop() {
    this.state = 'inactive';
    setTimeout(() => {
      if (this.ondataavailable) this.ondataavailable({ data: new Blob(['x'], { type: this.mimeType }) });
      if (this.onstop) this.onstop();
    }, 0);
  }
}

const audioContexts = [];
class FakeAudioContext {
  constructor() { this.closed = false; audioContexts.push(this); }
  createMediaStreamSource() { return { connect() {} }; }
  createAnalyser() {
    return { fftSize: 1024, connect() {}, disconnect() {}, getByteTimeDomainData: (arr) => arr.fill(140) };
  }
  decodeAudioData() { return Promise.resolve({ getChannelData: () => new Float32Array(64).fill(0.2), duration: 1.2 }); }
  close() { this.closed = true; return Promise.resolve(); }
}

class FakeAudio {
  constructor() { this.src = ''; }
  play() { return Promise.resolve(); }
  pause() {}
}

// Part 1 — voice-store.js against a fake IndexedDB, no page at all -----------------------------------------------

function loadStore(behavior) {
  const ctx = vm.createContext({
    indexedDB: makeFakeIndexedDB(behavior),
    Blob,
    setTimeout,
    clearTimeout,
    console,
  });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(dir, 'voice-store.js'), 'utf8'), ctx, { filename: 'voice-store.js' });
  return ctx.qaidaVoiceStore;
}

async function checkStore() {
  const store = loadStore({});
  check(await store.ready, 'voice-store.js: ready resolves true against a working database');

  const blob = new Blob(['hello'], { type: 'audio/webm' });
  const kept = await store.put('letters:ب', blob, 'audio/webm', 1234);
  check(kept === true, 'voice-store.js: put() reports success');
  const back = await store.get('letters:ب');
  check(Boolean(back) && back.mime === 'audio/webm' && back.ms === 1234 && back.blob.size === blob.size,
    'voice-store.js: get() returns the clip with its mime and length intact');
  check(await store.has('letters:ب'), 'voice-store.js: has() finds it');
  check(!(await store.has('letters:نو')), 'voice-store.js: has() is false for an id never put');

  // Re-recording replaces rather than adds.
  await store.put('letters:ب', new Blob(['second']), 'audio/webm', 900);
  const ids1 = await store.ids();
  check(ids1.length === 1 && ids1[0] === 'letters:ب', 'voice-store.js: re-recording the same id replaces, not adds');

  // A damaged record (put directly, bypassing put()'s own guard) is ignored, not returned.
  const damagedCtx = vm.createContext({ indexedDB: makeFakeIndexedDB({}), Blob, setTimeout, clearTimeout, console });
  damagedCtx.window = damagedCtx;
  vm.runInContext(fs.readFileSync(path.join(dir, 'voice-store.js'), 'utf8'), damagedCtx, { filename: 'voice-store.js' });
  await damagedCtx.qaidaVoiceStore.ready;
  // Reach into the same fake database the module opened, and write a shape put() would never allow.
  const rawDb = await new Promise((resolve) => {
    const req = damagedCtx.indexedDB.open('qaida-voice', 1);
    req.onsuccess = () => resolve(req.result);
  });
  await new Promise((resolve) => {
    const req = rawDb.transaction('clips', 'readwrite').objectStore('clips').put({ id: 'letters:ط', blob: 'not a blob', mime: 3, ms: 'x', at: 'y' });
    req.onsuccess = resolve;
  });
  check((await damagedCtx.qaidaVoiceStore.get('letters:ط')) === null, 'voice-store.js: a damaged record is ignored, not returned');

  // The 200-clip cap drops the oldest first.
  const capStore = loadStore({});
  for (let i = 0; i < 205; i += 1) {
    // eslint-disable-next-line no-await-in-loop -- each put's timestamp must be later than the last for a real ordering
    await capStore.put(`letters:${i}`, new Blob(['x']), 'audio/webm', 100);
  }
  const capIds = await capStore.ids();
  check(capIds.length === 200, `voice-store.js: the 200-clip cap holds (found ${capIds.length})`, `${capIds.length}`);
  check(!capIds.includes('letters:0') && !capIds.includes('letters:4') && capIds.includes('letters:204'),
    'voice-store.js: the cap drops the oldest first, by "at"');

  // The 25MB cap does the same, with far fewer, larger clips.
  const bigStore = loadStore({});
  const big = Buffer.alloc(6 * 1024 * 1024, 1); // 6MB each; five of them is 30MB, over the 25MB cap
  for (let i = 0; i < 5; i += 1) {
    // eslint-disable-next-line no-await-in-loop -- ordering matters here too
    await bigStore.put(`letters:${i}`, new Blob([big]), 'audio/webm', 100);
  }
  const bigIds = await bigStore.ids();
  check(bigIds.length < 5 && !bigIds.includes('letters:0') && bigIds.includes('letters:4'),
    'voice-store.js: the 25MB byte cap drops the oldest first too', `kept ${bigIds.length}`);

  // clear() empties it.
  await store.clear();
  check((await store.ids()).length === 0, 'voice-store.js: clear() empties the store');

  // Every method resolves rather than throwing when the database refuses to open.
  const brokenStore = loadStore({ refuse: true });
  let threw = false;
  try {
    const results = await Promise.all([
      brokenStore.ready, brokenStore.get('x'), brokenStore.has('x'), brokenStore.ids(),
      brokenStore.put('x', new Blob(['x']), 'audio/webm', 1), brokenStore.remove('x'), brokenStore.clear(),
    ]);
    check(results[0] === false && results[1] === null && results[2] === false
      && Array.isArray(results[3]) && results[3].length === 0 && results[4] === false,
    'voice-store.js: every method resolves harmlessly when the database refuses to open (the nostore path)');
  } catch {
    threw = true;
  }
  check(!threw, 'voice-store.js: nothing throws when the database refuses to open');
}

// Part 2 — voice.js against the real lesson-1.html, with a fake microphone --------------------------------------

function loadVoicePage({ recorder = true } = {}) {
  const raw = fs.readFileSync(path.join(dir, 'lesson-1.html'), 'utf8');
  const nodes = parse(raw);
  const htmlEl = nodes.find((n) => n.tag === 'html');
  const doc = {
    documentElement: htmlEl,
    activeElement: null,
    hidden: false,
    body: htmlEl.querySelector('body'),
    querySelector: (sel) => htmlEl.querySelector(sel),
    querySelectorAll: (sel) => htmlEl.querySelectorAll(sel),
    createElement: (tag) => new El(tag),
    addEventListener() {},
    removeEventListener() {},
  };
  const store = new Map([['qaida', JSON.stringify({ v: 1, chosen: true, script: 'madani', names: 'fatha', grouping: 'families' })]]);
  const hasTeacher = { value: false };
  const ctx = vm.createContext({
    document: doc,
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    IntersectionObserver: class { observe() {} },
    indexedDB: makeFakeIndexedDB({}),
    navigator: { mediaDevices },
    isSecureContext: true,
    MediaRecorder: recorder ? FakeMediaRecorder : undefined,
    AudioContext: FakeAudioContext,
    Audio: FakeAudio,
    Blob,
    URL: { createObjectURL: () => `blob:fake${Math.random()}`, revokeObjectURL() {} },
    devicePixelRatio: 1,
    performance: { now: () => Date.now() },
    requestAnimationFrame: (fn) => setTimeout(() => fn(Date.now()), 4),
    cancelAnimationFrame: (id) => clearTimeout(id),
    location: { pathname: '/site/qaida/lesson-1.html' },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    console,
  });
  ctx.window = ctx;
  ctx.addEventListener = () => {};
  ctx.removeEventListener = () => {};
  ctx.qaidaAudio = {
    has: () => hasTeacher.value,
    urlFor: () => (hasTeacher.value ? 'audio/letters/alif.mp3' : null),
    play() {},
    stop() {},
    ready: Promise.resolve(),
  };
  ctx.qaida = { lastItem: null };
  const load = (file) => vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file });
  load('shell.js');
  load('voice-store.js');
  load('voice.js');
  return { ctx, doc, hasTeacher };
}

async function checkVoicePage() {
  const { ctx, doc } = loadVoicePage();
  check(Boolean(ctx.qaidaEcho), 'voice.js: window.qaidaEcho is exported when the browser can record');

  const dialog = doc.querySelector('.echo');
  const title = dialog.querySelector('.echo-title');
  const glyphEl = dialog.querySelector('.echo-glyph');
  const nameEl = dialog.querySelector('.echo-name');
  const asksEl = dialog.querySelector('.echo-asks');
  const stateEl = dialog.querySelector('.echo-state');
  const recordBtn = dialog.querySelector('.record');

  // 9. open('letters', 'ب', 'Baa') fills the title, the glyph, the name and the "say its name" line.
  await ctx.qaidaEcho.open('letters', 'ب', 'Baa');
  check(title.textContent === 'Say Baa' && glyphEl.textContent === 'ب' && nameEl.textContent === 'Baa',
    'voice.js: open(letters, ب, Baa) fills the title, the glyph and the name');
  check(asksEl.textContent === asksEl.dataset.name, 'voice.js: a "letters" item asks for the name, not the sound');

  // 10. open('fatha', 'ب', 'Baa with zabar') shows the sound line, not the name line.
  await ctx.qaidaEcho.open('fatha', 'ب', 'Baa with zabar');
  check(asksEl.textContent === asksEl.dataset.sound, 'voice.js: a "fatha" item asks for the sound, not the name');

  // The same letter in two scripts shares one recording (shell.keyOf folding, applied when the id is built).
  micBehavior = 'allow';
  await ctx.qaidaEcho.open('letters', 'ک', 'Kaaf');
  click(recordBtn);
  await waitUntil(() => dialog.dataset.state === 'recording');
  click(recordBtn); // stop
  await waitUntil(() => dialog.dataset.state === 'ready');
  await ctx.qaidaEcho.open('letters', 'ك', 'Kaaf');
  const mineLaneAfterFold = dialog.querySelector('.lane.mine');
  check(mineLaneAfterFold.hidden === false, 'voice.js: a clip recorded under ک is found again under ك (shell.keyOf)');

  // 11-12. States run ready -> recording -> saving -> ready; every track stopped and the AudioContext closed.
  await ctx.qaidaEcho.open('letters', 'ب', 'Baa');
  check(dialog.dataset.state === 'ready', 'voice.js: opening on an item with nothing recorded lands in "ready"');
  const beforeTracks = stoppedTracks.length;
  const beforeContexts = audioContexts.filter((c) => c.closed).length;
  click(recordBtn);
  check(await waitUntil(() => dialog.dataset.state === 'recording'), 'voice.js: tapping Record moves to "recording"');
  click(recordBtn); // stop
  check(dialog.dataset.state === 'saving', 'voice.js: tapping Stop moves to "saving" immediately');
  check(await waitUntil(() => dialog.dataset.state === 'ready'), 'voice.js: the clip finishes saving and returns to "ready"');
  check(stoppedTracks.length > beforeTracks, 'voice.js: every microphone track is stopped after recording');
  check(audioContexts.filter((c) => c.closed).length > beforeContexts, 'voice.js: the level ring\'s AudioContext is closed after recording');

  // 13. Closing while recording keeps the clip; closing while asking does not.
  await ctx.qaidaEcho.open('letters', 'ت', 'Taa');
  click(recordBtn);
  await waitUntil(() => dialog.dataset.state === 'recording');
  ctx.qaidaEcho.close();
  check(await waitUntil(async () => ctx.qaidaVoiceStore.has('letters:ت')), 'voice.js: closing mid-recording keeps the clip');

  micBehavior = 'allow';
  let resolveGate;
  const gate = new Promise((resolve) => { resolveGate = resolve; });
  const realGetUserMedia = ctx.navigator.mediaDevices.getUserMedia;
  ctx.navigator.mediaDevices.getUserMedia = async () => { await gate; return realGetUserMedia(); };
  await ctx.qaidaEcho.open('letters', 'ث', 'Thaa');
  click(recordBtn); // starts asking; the promise above is still pending
  check(await waitUntil(() => dialog.dataset.state === 'asking'),
    'voice.js: tapping Record while permission is pending shows "asking"');
  ctx.qaidaEcho.close(); // closed before the prompt resolves
  resolveGate();
  await sleep(30); // lets the now-stale getUserMedia promise resolve and be discarded
  check(!(await ctx.qaidaVoiceStore.has('letters:ث')), 'voice.js: closing while "asking" keeps nothing');
  ctx.navigator.mediaDevices.getUserMedia = realGetUserMedia;

  // 14. A rejected getUserMedia lands in "denied", with the Record button still present.
  micBehavior = 'deny';
  await ctx.qaidaEcho.open('letters', 'ج', 'Jeem');
  click(recordBtn);
  check(await waitUntil(() => dialog.dataset.state === 'denied'), 'voice.js: a refused microphone lands in "denied"');
  check(dialog.querySelectorAll('.record').length === 1, 'voice.js: the Record button stays after a refusal');
  micBehavior = 'allow';

  // 17. Muted: the sound-is-off line and its button; the button unmutes.
  ctx.qaidaShell.state.muted = true;
  await ctx.qaidaEcho.open('letters', 'ح', 'Ḥaa');
  const unmute = dialog.querySelector('.unmute-echo');
  check(stateEl.textContent === stateEl.dataset.muted && unmute.hidden === false,
    'voice.js: opening while muted shows the sound-is-off line and its button');
  click(unmute);
  check(ctx.qaidaShell.state.muted === false, 'voice.js: the "turn it on" button unmutes');

  // 16. shell.onChange closes an open panel (a script or name change can drop the letter it was showing).
  await ctx.qaidaEcho.open('letters', 'خ', 'Khaa');
  check(dialog.open === true, 'voice.js: the panel is open, ready for the onChange check');
  ctx.qaidaShell.renderSetup(); // fires every onChange listener, the same as switching script or names
  // The close plays a 300ms fall under motion (no animationend in this fake DOM, so the fallback timer finishes it).
  check(await waitUntil(() => dialog.open === false, 500), 'voice.js: shell.onChange closes an open panel');
}

async function checkNoMediaRecorder() {
  const { doc } = loadVoicePage({ recorder: false });
  const buttons = doc.querySelectorAll('.open-echo, .current-say, .say');
  check(buttons.length === 0, 'voice.js: with no MediaRecorder at all, every Say it button is removed, not disabled');
}

// Part 3 — the privacy claim: no network call of any kind in either file --------------------------------------

function checkNoNetwork() {
  for (const file of ['voice.js', 'voice-store.js']) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    const hasFetch = /\bfetch\s*\(/.test(text);
    const hasXhr = /XMLHttpRequest/.test(text);
    const hasHttp = /\bhttp/i.test(text);
    check(!hasFetch && !hasXhr && !hasHttp, `${file}: no fetch, no XMLHttpRequest and no string containing "http"`);
  }
}

// Part 4 — the Qaida home's Start again reaches voice-store.clear() ----------------------------------------------

async function checkHomeClearsVoice() {
  const raw = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const nodes = parse(raw);
  const htmlEl = nodes.find((n) => n.tag === 'html');
  const doc = {
    documentElement: htmlEl,
    activeElement: null,
    querySelector: (sel) => htmlEl.querySelector(sel),
    querySelectorAll: (sel) => htmlEl.querySelectorAll(sel),
    createElement: (tag) => new El(tag),
    addEventListener() {},
  };
  const store = new Map([['qaida', JSON.stringify({ v: 1, chosen: true, script: 'madani', names: 'fatha', grouping: 'families' })]]);
  const ctx = vm.createContext({
    document: doc,
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    IntersectionObserver: class { observe() {} },
    indexedDB: makeFakeIndexedDB({}),
    Blob,
    setTimeout,
    clearTimeout,
    console,
  });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(dir, 'shell.js'), 'utf8'), ctx, { filename: 'shell.js' });
  vm.runInContext(fs.readFileSync(path.join(dir, 'voice-store.js'), 'utf8'), ctx, { filename: 'voice-store.js' });
  await ctx.qaidaVoiceStore.put('letters:ب', new Blob(['x']), 'audio/webm', 100);
  vm.runInContext(fs.readFileSync(path.join(dir, 'home.js'), 'utf8'), ctx, { filename: 'home.js' });

  const resetAll = doc.querySelector('.reset-all');
  click(resetAll); // arms it
  click(resetAll); // confirms it
  await sleep(20);
  check((await ctx.qaidaVoiceStore.ids()).length === 0, 'home.js: "Start again" also reaches voice-store.clear()');
}

(async () => {
  await checkStore();
  await checkVoicePage();
  await checkNoMediaRecorder();
  checkNoNetwork();
  await checkHomeClearsVoice();
  console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`}`);
  process.exit(failed);
})();
