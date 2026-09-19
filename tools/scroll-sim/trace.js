// Follows one wheel gesture through site/main.js in the simulated page, once with the browser's own wheel and once with
// the smooth one, logging when the finish decides, when the page glides itself, and the scroll position over time.
//
//   node tools/scroll-sim/trace.js <from> <dir> <count> <size> <gap ms> <wait ms> [finish] [lock]
//   e.g. node tools/scroll-sim/trace.js 3035 1 4 102 0 100      (the open book, four notches down)
const fs = require('fs');
const path = require('path');
const { createWorld } = require('./world');

const [from, dir, count, size, gap, wait, finish = 'direction', lock = 'true'] = process.argv.slice(2);
if (wait === undefined) {
  console.log('usage: node tools/scroll-sim/trace.js <from> <dir 1|-1> <count> <size px> <gap ms> <wait ms> [finish] [lock]');
  process.exit(1);
}

const HOOKS = `
window.__t = {
  get auto() { return autoScroll ? 1 : 0; },
  get wheel() { return typeof wheelRaf === 'undefined' ? 0 : (wheelRaf ? 1 : 0); },
  set(name, v) {
    if (name === 'finish') finish = v;
    else if (name === 'finishWait') finishWait = v;
    else if (name === 'lockEnding') lockEnding = v;
    else if (name === 'wheelSmooth') wheelSmooth = v;
  },
};`;

function run(mode) {
  let source = fs.readFileSync(path.join(__dirname, '..', '..', 'site', 'main.js'), 'utf8');
  source = source.replace('function finishOpening() {', 'function finishOpening() { (window.__log || (() => {}))("finish decides at", scrollY, "heading for", typeof wheelTarget === "undefined" ? null : wheelTarget, "wheel glide running:", typeof wheelRaf === "undefined" ? 0 : wheelRaf ? 1 : 0, "direction", direction);');
  source = source.replace("function scrollToY(y, speed = finishSpeed, gentle = glideStart === 'gentle') {", "function scrollToY(y, speed = finishSpeed, gentle = glideStart === 'gentle') { (window.__log || (() => {}))(\"page glides itself to\", y, \"from\", scrollY);");
  const w = createWorld(source, { hooks: HOOKS });
  const log = [];
  w.ctx.__log = (...a) => log.push(`${Math.round(w.now - t0)} ms: ${a.join(' ')}`);
  let t0 = 0;
  w.ctx.__t.set('wheelSmooth', mode === 'smooth');
  w.ctx.__t.set('finish', finish);
  w.ctx.__t.set('finishWait', Number(wait));
  w.ctx.__t.set('lockEnding', lock === 'true');
  w.run(200);
  w.jump(Number(from));
  w.settle(9000); // from a resting place: the page finishes anything half done before the gesture starts
  w.run(400);
  t0 = w.now;
  const start = w.trace.length;
  for (let i = 0; i < Number(count); i++) w.at(i * Number(gap), () => w.wheel(Number(dir) * Number(size)));
  w.settle(20000);
  console.log(`--- ${mode}: from ${from}, ${count} x ${dir * size} every ${gap} ms, wait ${wait}, finish ${finish}: rests at ${w.y}`);
  for (const line of log) console.log('   ', line);
  const rows = w.trace.slice(start - 1);
  const every = Math.max(1, Math.floor(rows.length / 40));
  console.log('    scroll position over time (ms:y, a = the page glides itself, w = the wheel glide):');
  console.log('    ' + rows.filter((_, i) => i % every === 0).map((r) => `${Math.round(r.t - t0)}:${r.y}${r.auto ? 'a' : ''}${r.wheel ? 'w' : ''}`).join('  '));
}

run('native');
run('smooth');
