// A simulated page for site/main.js: a scroll model (whole-pixel scroll offset, one scroll event per frame), timers,
// animation frames and wheel input, so the real main.js can be run and its scroll behaviour measured. Used by
// checks.js and trace.js in this folder. The browser's own wheel scrolling is modelled as a 130 ms eased burst per
// notch, like Firefox's (the user's Scroll check recording, 2026-09-18: 408 px in about 117 ms).
const vm = require('vm');

const FRAME = 1000 / 60;

// Anything not modelled: swallows every call and property, and reads as 0.
function blackhole(overrides = {}) {
  const cache = new Map();
  return new Proxy(function () {}, {
    get(_, key) {
      if (key in overrides) return overrides[key];
      if (key === Symbol.toPrimitive) return () => 0;
      if (key === Symbol.iterator) return function* () {};
      if (key === 'then') return undefined;
      if (!cache.has(key)) cache.set(key, blackhole());
      return cache.get(key);
    },
    set(_, key, value) {
      overrides[key] = value;
      return true;
    },
    apply: () => blackhole(),
    construct: () => blackhole(),
  });
}

function createWorld(source, { innerHeight = 995, hooks = '', options = {} } = {}) {
  const w = {
    now: 0,
    y: 0,
    timers: [],
    rafs: [],
    nextId: 1,
    listeners: {},
    scrollPending: false,
    inputs: [],
    native: { target: 0, anim: null },
    trace: [],
    events: [],
    classes: new Set(),
    mq: {},
    computedStyle: () => ({ scrollSnapType: 'none', overflowY: 'visible', fontSize: '16px' }),
  };
  const heroH = innerHeight * 4.05;
  const closeH = innerHeight;
  const footerH = innerHeight * 1.5;
  const docH = () => heroH + closeH + footerH;
  const maxY = () => docH() - innerHeight;
  w.maxY = maxY;
  w.heroH = heroH;
  w.closeH = closeH;

  const setY = (value) => {
    const next = Math.round(Math.min(Math.max(0, value), maxY()));
    if (next !== w.y) {
      w.y = next;
      w.scrollPending = true;
    }
  };

  const rect = (top, height) => ({ top, bottom: top + height, left: 0, right: 1920, width: 1920, height });
  const classList = {
    toggle: (name, force) => {
      const on = force === undefined ? !w.classes.has(name) : force;
      on ? w.classes.add(name) : w.classes.delete(name);
      return on;
    },
    add: (name) => w.classes.add(name),
    remove: (name) => w.classes.delete(name),
    contains: (name) => w.classes.has(name),
  };

  const ctx2d = blackhole();
  const canvas = blackhole({ clientWidth: 1920, clientHeight: innerHeight, getContext: () => ctx2d, width: 1920, height: innerHeight });
  const subject = blackhole({ querySelector: () => canvas, append() {} });
  const wordmark = blackhole({ querySelector: () => ({ offsetHeight: 30 }) });
  const stage = blackhole({
    offsetHeight: innerHeight,
    clientHeight: innerHeight,
    querySelector: (sel) => (sel === '.subject' ? subject : wordmark),
    querySelectorAll: () => [blackhole(), blackhole()],
    getBoundingClientRect: () => rect(Math.min(0, heroH - innerHeight - w.y) * 1, innerHeight),
    style: { setProperty() {} },
    classList: { toggle() {}, add() {}, remove() {} },
  });
  const hero = blackhole({
    offsetHeight: heroH,
    getBoundingClientRect: () => rect(-w.y, heroH),
    querySelector: () => stage,
    classList: { toggle() {}, add() {}, remove() {} },
    style: { setProperty() {} },
    dispatchEvent: (event) => w.events.push({ t: w.now, type: event.type }),
  });
  const closeInner = blackhole({ offsetHeight: 300 });
  const close = blackhole({
    offsetHeight: closeH,
    getBoundingClientRect: () => rect(heroH - w.y, closeH),
    querySelector: () => closeInner,
    classList: { toggle() {}, add() {}, remove() {} },
    contains: () => false,
  });
  const themeButton = blackhole({ dataset: { toDark: 'Dark', toLight: 'Light' }, querySelector: () => ({ textContent: '' }), setAttribute() {}, addEventListener() {} });
  const topbar = blackhole({ querySelector: () => themeButton, classList: { toggle() {}, add() {}, remove() {} } });
  const html = { dataset: { theme: 'dark' }, classList, style: { setProperty() {} }, get scrollHeight() { return docH(); } };
  const document = {
    documentElement: html,
    body: blackhole(),
    fonts: { addEventListener() {} },
    visibilityState: 'visible',
    querySelector: (sel) =>
      ({ '.hero': hero, '.close': close, '.topbar': topbar, 'meta[name="theme-color"]': { content: '' } })[sel] || blackhole(),
    createElement: (tag) => (tag === 'canvas' ? blackhole({ width: 0, height: 0, getContext: () => ctx2d }) : blackhole()),
    addEventListener() {},
  };

  const runTimers = () => {
    for (;;) {
      const due = w.timers.filter((t) => t.at <= w.now).sort((a, b) => a.at - b.at || a.id - b.id)[0];
      if (!due) break;
      w.timers = w.timers.filter((t) => t !== due);
      due.fn();
    }
  };

  const context = {
    console,
    Math,
    Number,
    Object,
    Array,
    Map,
    Set,
    Promise,
    Event: class Event {
      constructor(type) {
        this.type = type;
      }
    },
    Element: class Element {},
    URLSearchParams,
    JSON,
    parseFloat,
    document,
    innerHeight,
    innerWidth: 1920,
    devicePixelRatio: 1,
    location: { search: '' },
    navigator: { userAgent: 'sim' },
    localStorage: { getItem: () => null, setItem() {} },
    matchMedia: (query) => (w.mq[query] = w.mq[query] || { matches: false, media: query, addEventListener() {} }),
    getComputedStyle: (el) => w.computedStyle(el),
    IntersectionObserver: class {
      observe() {}
      disconnect() {}
    },
    ResizeObserver: class {
      observe() {}
    },
    Image: class {
      decode() {
        return new Promise(() => {});
      }
    },
    fetch: () => new Promise(() => {}),
    performance: { now: () => w.now },
    setTimeout: (fn, ms = 0) => {
      const id = w.nextId++;
      w.timers.push({ id, at: w.now + ms, fn });
      return id;
    },
    clearTimeout: (id) => {
      w.timers = w.timers.filter((t) => t.id !== id);
    },
    requestAnimationFrame: (fn) => {
      const id = w.nextId++;
      w.rafs.push({ id, fn });
      return id;
    },
    cancelAnimationFrame: (id) => {
      w.rafs = w.rafs.filter((r) => r.id !== id);
    },
    addEventListener: (type, fn, opts) => {
      (w.listeners[type] = w.listeners[type] || []).push({ fn, passive: opts && opts.passive });
    },
    removeEventListener: (type, fn) => {
      w.listeners[type] = (w.listeners[type] || []).filter((l) => l.fn !== fn);
    },
    scrollTo: (x, y) => {
      setY(y);
      w.native.anim = null; // a script's scroll cancels the browser's own animation
      w.native.target = w.y;
    },
    requestIdleCallback: undefined,
  };
  Object.defineProperty(context, 'scrollY', { get: () => w.y });
  Object.defineProperty(context, 'pageYOffset', { get: () => w.y });
  context.window = context;
  vm.createContext(context);

  let code = source.replace(/^﻿/, '');
  const end = code.lastIndexOf('})();');
  code = `${code.slice(0, end)}\n${hooks}\n${code.slice(end)}`;
  vm.runInContext(code, context, { filename: 'main.js' });
  w.ctx = context;
  Object.assign(w.ctx.__t || {}, {});

  // Input --------------------------------------------------------------
  w.dispatch = (type, event = {}) => {
    const e = Object.assign({ type, defaultPrevented: false, target: { parentElement: null }, preventDefault() { this.defaultPrevented = true; } }, event);
    for (const { fn } of [...(w.listeners[type] || [])]) fn(e);
    return e;
  };
  w.wheel = (deltaY) => {
    const e = w.dispatch('wheel', { deltaY, deltaX: 0, deltaMode: 0, ctrlKey: false, shiftKey: false });
    if (!e.defaultPrevented) {
      // The browser's own smooth scroll (Firefox-like: a quick eased burst that restarts with each notch).
      w.native.target = Math.min(Math.max(0, w.native.target + deltaY), maxY());
      w.native.anim = { from: w.y, to: w.native.target, t0: w.now, dur: 130 };
    }
    return e;
  };
  w.at = (ms, fn) => w.inputs.push({ at: w.now + ms, fn });

  w.frame = () => {
    w.now += FRAME;
    runTimers();
    for (const input of w.inputs.filter((i) => i.at <= w.now)) input.fn();
    w.inputs = w.inputs.filter((i) => i.at > w.now);
    if (w.native.anim) {
      const a = w.native.anim;
      const p = Math.min(1, (w.now - a.t0) / a.dur);
      const eased = p * p * (3 - 2 * p);
      setY(a.from + (a.to - a.from) * eased);
      if (p >= 1) w.native.anim = null;
    }
    if (w.scrollPending) {
      w.scrollPending = false;
      w.dispatch('scroll');
    }
    const queue = w.rafs;
    w.rafs = [];
    for (const r of queue) r.fn(w.now);
    w.trace.push({ t: w.now, y: w.y, auto: w.ctx.__t ? w.ctx.__t.auto : 0, wheel: w.ctx.__t ? w.ctx.__t.wheel : 0 });
  };
  w.run = (ms) => {
    const n = Math.round(ms / FRAME);
    for (let i = 0; i < n; i++) w.frame();
  };
  // Runs until nothing is pending (no animation frames, no timers) or the limit is reached.
  w.settle = (limitMs = 8000) => {
    const n = Math.round(limitMs / FRAME);
    let quiet = 0;
    for (let i = 0; i < n; i++) {
      w.frame();
      const busy = w.rafs.length || w.timers.some((t) => t.at - w.now < 1000) || w.native.anim || w.inputs.length;
      quiet = busy ? 0 : quiet + 1;
      if (quiet > 3) break;
    }
  };
  w.jump = (y) => {
    setY(y);
    w.native.target = w.y;
    w.native.anim = null;
    w.scrollPending = false;
    w.dispatch('scroll');
  };
  return w;
}

// Measures a run of positions: speed in px/s per frame, and where it stops and starts.
function profile(trace, from = 0) {
  const rows = trace.slice(from);
  const speed = rows.map((r, i) => (i ? ((r.y - rows[i - 1].y) * 1000) / FRAME : 0));
  let peak = 0;
  let maxJump = 0;
  let stops = 0;
  let moving = false;
  let stillRun = 0;
  let firstMove = -1;
  let lastMove = -1;
  speed.forEach((v, i) => {
    peak = Math.max(peak, Math.abs(v));
    if (i) maxJump = Math.max(maxJump, Math.abs(v - speed[i - 1]));
    if (Math.abs(v) > 100) { // slower than about 1.7 px a frame is a tail creeping to rest, not motion
      if (firstMove < 0) firstMove = i;
      else if (!moving) stops++; // moving again after standing still for a few frames
      lastMove = i;
      moving = true;
      stillRun = 0;
    } else {
      stillRun++;
      if (stillRun >= 3) moving = false;
    }
  });
  return { peak, maxJump, stops, firstMove, lastMove, speed, endY: rows[rows.length - 1].y };
}

module.exports = { createWorld, profile, blackhole, FRAME };
