// Checks how site/main.js handles the wheel and the automatic finish, in a simulated page (world.js).
//
//   node tools/scroll-sim/checks.js
//
// It compares "smooth" (the page takes the wheel over) with "native" (the browser's own wheel scrolling): both must
// end at the same resting place after any simple gesture, in every finish mode, and smooth must never lurch, stop
// dead or leave anything running. Exits with 1 if anything fails. Positions assume a window 995 px tall.
const fs = require('fs');
const path = require('path');
const { createWorld, profile } = require('./world');

const MAIN = path.join(__dirname, '..', '..', 'site', 'main.js');

// Read and set main.js's settings from outside, without a panel.
const HOOKS = `
window.__t = {
  get auto() { return autoScroll ? 1 : 0; },
  get wheel() { return typeof wheelRaf === 'undefined' ? 0 : (wheelRaf ? 1 : 0); },
  set(name, v) {
    if (name === 'finish') finish = v;
    else if (name === 'finishWait') finishWait = v;
    else if (name === 'glideStart') glideStart = v;
    else if (name === 'lockEnding') lockEnding = v;
    else if (name === 'glide') glide = v;
    else if (name === 'finishSpeed') finishSpeed = v;
    else if (name === 'wheelSmooth') wheelSmooth = v;
    else if (name === 'wheelTau') wheelTau = v;
  },
};`;

function make(mode, options = {}, world = {}) {
  const w = createWorld(fs.readFileSync(MAIN, 'utf8'), { hooks: HOOKS, ...world });
  w.ctx.__t.set('wheelSmooth', mode === 'smooth');
  for (const [k, v] of Object.entries(options)) w.ctx.__t.set(k, v);
  w.run(200);
  return w;
}

let failures = 0;
let checks = 0;
const check = (ok, text) => {
  checks++;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${text}`);
};
const running = (w) => w.rafs.length > 0 || w.ctx.__t.wheel === 1 || w.ctx.__t.auto === 1;

const N = 102; // one wheel notch, as Firefox reports it
const REST_Y = 448; // the closed book's resting scroll
const OPEN_Y = 2687; // the open book's
const OPEN_END = 3035; // where the opening's timeline ends: the open book's whole screen
const ENDING = 4030; // the ending filling the screen
const FOOTER = 5025; // the footer's top at the top of the window
const BOTTOM = 5522;
const notches = (w, count, gap = 0, dy = N) => {
  for (let i = 0; i < count; i++) w.at(i * gap, () => w.wheel(dy));
};

// 1. Gestures with known resting places ---------------------------------------------------------------------------

const scenarios = [
  { name: 'nudge in the closed zone (1 notch)', from: 0, expect: N, go: (w) => notches(w, 1) },
  { name: 'flick from the top (10 notches fast)', from: 0, expect: OPEN_Y, go: (w) => notches(w, 10, 50) },
  { name: 'flick into the opening, then 1 notch up', from: 0, expect: REST_Y, go: (w) => { notches(w, 10, 50); w.at(900, () => w.wheel(-N)); } },
  { name: 'flick, then 3 more the same way while it glides', from: 0, expect: OPEN_Y, go: (w) => { notches(w, 10, 50); for (const t of [700, 760, 820]) w.at(t, () => w.wheel(N)); } },
  { name: 'open book, 4 notches down', from: OPEN_END, expect: ENDING, go: (w) => notches(w, 4) },
  { name: 'ending, 1 notch up', from: ENDING, expect: OPEN_END, go: (w) => notches(w, 1, 0, -N) },
  { name: 'ending, 1 notch down', from: ENDING, expect: FOOTER, go: (w) => notches(w, 1) },
  { name: 'footer, 5 notches down', from: FOOTER, expect: BOTTOM, go: (w) => notches(w, 5, 40) },
  { name: 'bottom, 3 more notches down', from: BOTTOM, expect: BOTTOM, go: (w) => notches(w, 3, 40) },
  { name: 'top, 3 notches up', from: 0, expect: 0, go: (w) => notches(w, 3, 40, -N) },
  { name: 'nearest end: 12 notches from the top', from: 0, options: { finish: 'nearest' }, expect: REST_Y, go: (w) => notches(w, 12, 50) },
  { name: 'nearest end: 25 notches from the top', from: 0, options: { finish: 'nearest' }, expect: OPEN_Y, go: (w) => notches(w, 25, 50) },
  { name: 'half-open book stays (finish off)', from: 0, options: { finish: 'off' }, expect: 10 * N, go: (w) => notches(w, 10, 50) },
  { name: 'no ending lock-in, 4 notches past the book', from: OPEN_END, options: { lockEnding: false }, expect: OPEN_END + 4 * N, go: (w) => notches(w, 4) },
  { name: 'reverse: 6 down then 6 up quickly', from: 0, expect: 0, go: (w) => { notches(w, 6, 40); for (let i = 0; i < 6; i++) w.at(400 + i * 40, () => w.wheel(-N)); } },
  { name: 'long continuous scroll: 60 notches from the top', from: 0, expect: BOTTOM, go: (w) => notches(w, 60, 33) },
  { name: 'slow wheel: 8 notches, 300 ms apart', from: 0, expect: OPEN_Y, go: (w) => notches(w, 8, 300) },
  { name: 'key pressed while the page glides', from: 0, expect: OPEN_Y, deadStopOk: true, go: (w) => { notches(w, 10, 50); w.at(650, () => w.dispatch('keydown', { key: 'ArrowDown' })); } },
];

for (const sc of scenarios) {
  const result = {};
  for (const mode of ['native', 'smooth']) {
    const w = make(mode, sc.options);
    w.jump(sc.from);
    w.settle(9000);
    w.run(400);
    const start = w.trace.length;
    sc.go(w);
    w.settle(9000);
    result[mode] = { ...profile(w.trace, start - 1), left: running(w) };
  }
  const { native, smooth } = result;
  const jump = sc.deadStopOk ? 0 : smooth.maxJump;
  check(
    native.endY === sc.expect && smooth.endY === sc.expect && !native.left && !smooth.left && jump <= 900 && smooth.peak <= native.peak + 1,
    `${sc.name}: rests at ${sc.expect} (native ${native.endY}, smooth ${smooth.endY}); peak ${native.peak.toFixed(0)} -> ${smooth.peak.toFixed(0)} px/s, biggest one-frame change ${native.maxJump.toFixed(0)} -> ${smooth.maxJump.toFixed(0)}`,
  );
}

// 2. The recording from the user's Scroll check (2026-09-18) ---------------------------------------------------------
{
  const result = {};
  for (const mode of ['native', 'smooth']) {
    const w = make(mode);
    w.jump(OPEN_END);
    w.run(300);
    const start = w.trace.length;
    for (let i = 0; i < 4; i++) w.wheel(N);
    w.settle(6000);
    result[mode] = profile(w.trace, start - 1);
  }
  check(result.native.stops >= 1, `the browser's own wheel still shows the problem: burst, stop, restart (${result.native.stops} stop, peak ${result.native.peak.toFixed(0)} px/s)`);
  check(result.smooth.endY === ENDING && result.smooth.stops === 0 && result.smooth.peak <= 1600 && result.smooth.maxJump <= 500, `smooth wheel: no stop, peak ${result.smooth.peak.toFixed(0)} px/s, biggest one-frame change ${result.smooth.maxJump.toFixed(0)}`);
}

// 3. Awkward cases ---------------------------------------------------------------------------------------------------

{
  const w = make('smooth', { finishWait: 400, glideStart: 'gentle', glide: 0.5, finishSpeed: 1.2 });
  w.jump(OPEN_END);
  w.run(300);
  const s = w.trace.length;
  for (let i = 0; i < 4; i++) w.wheel(N);
  w.settle(6000);
  const p = profile(w.trace, s - 1);
  check(p.endY === ENDING && p.maxJump < 700, `the user's own settings (400 ms wait, gentle start, 120% speed): rests at ${p.endY}, biggest one-frame change ${p.maxJump.toFixed(0)}`);
}
for (const tau of [0.05, 0.2, 0.5]) {
  const w = make('smooth', { wheelTau: tau });
  w.jump(0);
  w.run(300);
  const s = w.trace.length;
  notches(w, 10, 50);
  w.settle(8000);
  const p = profile(w.trace, s - 1);
  check(p.endY === OPEN_Y && p.maxJump < 1000, `wheel smoothness ${tau} s: rests open, biggest one-frame change ${p.maxJump.toFixed(0)}`);
}
for (const innerHeight of [600, 768, 1080, 1440]) {
  const w = make('smooth', {}, { innerHeight });
  const open = Math.round((2.7 / 3.05) * (3.05 * innerHeight));
  w.jump(0);
  w.run(300);
  notches(w, 12, 50);
  w.settle(8000);
  check(w.y === open, `window ${innerHeight} px tall: rests open at ${open} (${w.y})`);
}
{
  const w = make('smooth');
  w.jump(0);
  w.run(300);
  for (let i = 0; i < 90; i++) w.at(i * 16.7, () => w.wheel(11.3 + (i % 5)));
  w.settle(9000);
  check(w.y === OPEN_Y, `trackpad (90 small fractional deltas) rests open (${w.y})`);
}
{
  const w = make('smooth');
  w.jump(OPEN_END);
  w.run(300);
  const e = w.dispatch('wheel', { deltaY: 3, deltaX: 0, deltaMode: 1, ctrlKey: false, shiftKey: false });
  w.settle(6000);
  check(e.defaultPrevented && w.y === ENDING, `a wheel that counts lines (3 lines = one notch) is taken over and rests at ${w.y}`);
}
{
  const w = make('smooth');
  const a = w.dispatch('wheel', { deltaY: 10, deltaX: 100, deltaMode: 0, ctrlKey: false, shiftKey: false });
  const b = w.dispatch('wheel', { deltaY: 100, deltaX: 0, deltaMode: 0, ctrlKey: false, shiftKey: true });
  const c = w.dispatch('wheel', { deltaY: 100, deltaX: 0, deltaMode: 0, ctrlKey: true, shiftKey: false });
  check(!a.defaultPrevented && !b.defaultPrevented && !c.defaultPrevented, 'sideways, shift and ctrl (zoom) wheels are left to the browser');
}
{
  const w = make('smooth');
  w.computedStyle = () => ({ scrollSnapType: 'y mandatory', overflowY: 'visible' });
  check(!w.wheel(N).defaultPrevented, 'a screen that snaps to sections: wheel left to the browser');
}
{
  const w = make('smooth');
  w.mq['(prefers-reduced-motion: reduce)'].matches = true;
  check(!w.wheel(N).defaultPrevented, 'reduced motion: wheel left to the browser');
}
{
  const w = make('smooth');
  const box = new w.ctx.Element();
  Object.assign(box, { scrollHeight: 900, clientHeight: 300, scrollTop: 100, parentElement: null });
  w.computedStyle = (el) => ({ scrollSnapType: 'none', overflowY: el === box ? 'auto' : 'visible' });
  const wheelOver = () => w.dispatch('wheel', { deltaY: 100, deltaX: 0, deltaMode: 0, ctrlKey: false, shiftKey: false, target: box });
  const inside = wheelOver();
  box.scrollTop = 600; // scrolled to its end: the wheel chains on to the page, as it does in the browser
  const atEnd = wheelOver();
  check(!inside.defaultPrevented && atEnd.defaultPrevented, 'a scrollable box under the pointer keeps the wheel until it reaches its end');
}
{
  const w = make('smooth');
  w.jump(0);
  w.run(300);
  for (let i = 0; i < 6; i++) w.wheel(N);
  w.run(50);
  const before = w.ctx.__t.wheel;
  w.ctx.__t.set('wheelSmooth', false);
  const e = w.wheel(N);
  w.settle(6000);
  check(before === 1 && !e.defaultPrevented && !running(w), "switching to the browser's own wheel mid-glide leaves nothing running");
}
{
  const w = make('smooth');
  w.jump(1500);
  w.settle(9000);
  for (let i = 0; i < 40; i++) w.at(i * 25, () => w.wheel(i % 2 ? -N : N));
  w.settle(9000);
  check(!running(w), `alternating notches settle (at ${w.y}) and leave nothing running`);
}
{
  const w = make('smooth');
  w.jump(0);
  w.run(300);
  let autoDuring = 0;
  notches(w, 80, 40);
  for (let f = 0; f < (80 * 40) / 16.7; f++) {
    w.frame();
    if (w.ctx.__t.auto) autoDuring++;
  }
  w.settle(9000);
  check(autoDuring === 0 && w.y === BOTTOM, `steady scrolling for 3.2 s: the automatic finish never starts mid-scroll, and it ends at the bottom (${w.y})`);
}
for (const speed of [0.25, 1, 3]) {
  const w = make('smooth', { finishSpeed: speed });
  w.jump(OPEN_END);
  w.run(300);
  const s = w.trace.length;
  for (let i = 0; i < 4; i++) w.wheel(N);
  w.settle(9000);
  const p = profile(w.trace, s - 1);
  // At 300% the finish is far faster than the wheel was, so it must speed up and brake hard; the jolt to look for is
  // the page dropping in speed in one frame.
  const drop = Math.max(...p.speed.map((v, i) => (i ? p.speed[i - 1] - v : 0)));
  check(p.endY === ENDING && (speed >= 3 || drop < 400), `automatic speed ${speed * 100}%: rests at the ending; biggest drop in speed in one frame ${drop.toFixed(0)} px/s`);
}

// 4. Many simple gestures: a burst one way, then silence, from real resting places -----------------------------------
{
  let seed = 7;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const starts = [0, 150, 448, 2687, 2900, 3035, 4030, 5025, 5300, 5522];
  const startsFree = [700, 1200, 1500, 2100]; // with the half-open finish off, the book rests anywhere
  const RUNS = 600;
  let different = 0;
  let stuck = 0;
  let worst = 0;
  const examples = [];
  for (let run = 0; run < RUNS; run++) {
    const options = { finish: pick(['direction', 'nearest', 'off']), finishWait: pick([100, 100, 400]) };
    if (rand() < 0.2) options.lockEnding = false;
    const from = options.finish === 'off' && rand() < 0.5 ? pick(startsFree) : pick(starts);
    const dir = pick([1, -1]);
    const count = 1 + Math.floor(rand() * 14);
    const gap = pick([0, 16, 33, 50, 80, 100]);
    const size = pick([102, 102, 40, 11.3, 204]);
    const ends = {};
    for (const mode of ['native', 'smooth']) {
      const w = make(mode, options);
      w.jump(from);
      w.settle(9000);
      w.run(400);
      const start = w.trace.length;
      for (let i = 0; i < count; i++) w.at(i * gap, () => w.wheel(dir * size));
      w.settle(20000);
      ends[mode] = w.y;
      if (running(w)) stuck++;
      if (mode === 'smooth') worst = Math.max(worst, profile(w.trace, start - 1).maxJump);
    }
    if (Math.abs(ends.native - ends.smooth) > 4) {
      different++;
      if (examples.length < 5) examples.push(`from ${from}, ${dir > 0 ? 'down' : 'up'} ${count} x ${size} every ${gap} ms, finish ${options.finish}, wait ${options.finishWait}: native ${ends.native}, smooth ${ends.smooth}`);
    }
  }
  check(different === 0, `${RUNS} random simple gestures: smooth rests where the browser's own wheel does${different ? ` (${different} differ)` : ''}`);
  for (const line of examples) console.log('       ', line);
  check(stuck === 0, 'none of them left anything running');
  check(worst <= 900, `the biggest one-frame change in speed in any of them is ${worst.toFixed(0)} px/s (the browser's own reaches over 7,000)`);
}

console.log(`\n${checks - failures} of ${checks} checks pass`);
process.exitCode = failures ? 1 : 0;
