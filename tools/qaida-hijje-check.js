// Checks the marks' spoken names and the teacher's spelling (hijje, "Baa, zabar, ba") in site/qaida/audio.js: what plays,
// in what order, that anything tapped meanwhile stops it, and that a missing piece leaves the old behaviour alone.
// Runs audio.js in a sandbox with a fake player: node tools/qaida-hijje-check.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'site', 'qaida', 'audio.js'), 'utf8');
let failed = 0;
const check = (ok, what) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}`);
  if (!ok) failed += 1;
};

const MANIFEST = {
  placeholder: 'placeholder.wav',
  letters: { 'ب': 'letters/ba.wav', 'ت': 'letters/ta.wav', 'ذ': 'letters/dhal.wav', 'ك': 'letters/kaf.wav' },
  fatha: { 'ب': 'fatha/ba.wav', 'ك': 'fatha/kaf.wav' }, // no ذ: a sound held back
  'mark-names': { zabar: 'mark-names/zabar.wav', fatha: 'mark-names/fatha.wav' },
};

async function sandbox({ muted = false } = {}) {
  const played = [];
  const timers = [];
  let last = null;
  class FakeAudio {
    constructor() { this.src = ''; this.onended = null; last = this; }
    play() { played.push(this.src); return Promise.resolve(); }
    pause() {}
    set currentTime(v) { this.time = v; }
  }
  const ctx = vm.createContext({
    window: {},
    Audio: FakeAudio,
    setTimeout: (fn) => { timers.push(fn); return timers.length; },
    fetch: async () => ({ ok: true, json: async () => JSON.parse(JSON.stringify(MANIFEST)) }),
    console,
  });
  ctx.window.qaidaShell = { state: { muted }, keyOf: (g) => ({ 'ک': 'ك', 'ہ': 'ه', 'ی': 'ي' }[g] || g), lettersOf: () => [], LESSONS: [] };
  vm.runInContext(src, ctx, { filename: 'audio.js' });
  const audio = ctx.window.qaidaAudio;
  await audio.ready;
  // The current recording comes to its end; the gap after it passes.
  const finish = () => {
    if (last && last.onended) last.onended();
    while (timers.length) timers.shift()();
  };
  return { audio, played, finish };
}

(async () => {
  {
    const { audio } = await sandbox();
    check(audio.hasName('zabar') && audio.hasName('fatha'), 'a recorded mark name is found');
    check(!audio.hasName('two zabar') && !audio.hasName(''), 'an unrecorded one is not');
  }
  {
    const { audio, played, finish } = await sandbox();
    check(audio.playName('zabar') === 'recording', 'playName says it played the recording');
    check(played.join() === 'audio/mark-names/zabar.wav', 'and plays only the name');
    check(audio.playName('kasra') === 'none' && played.length === 1, 'an unrecorded name plays nothing');
    finish();
  }
  {
    const { audio, played, finish } = await sandbox();
    check(audio.spell('fatha', 'ب', 'zabar') === 'spelled', 'spell says it spelled');
    check(played.join() === 'audio/letters/ba.wav', 'the letter\'s name comes first');
    finish();
    check(played[1] === 'audio/mark-names/zabar.wav', 'then the mark\'s name');
    finish();
    check(played[2] === 'audio/fatha/ba.wav', 'then the sound');
    finish();
    check(played.length === 3, 'and nothing after it');
  }
  {
    const { audio, played, finish } = await sandbox();
    check(audio.spell('fatha', 'ک', 'fatha') === 'spelled', 'an Indo-Pak letter finds the same files');
    finish(); finish();
    check(played.join() === 'audio/letters/kaf.wav,audio/mark-names/fatha.wav,audio/fatha/kaf.wav', 'Kaaf, fatha, ka');
  }
  {
    const { audio, played } = await sandbox();
    check(audio.spell('fatha', 'ذ', 'zabar') === null && played.length === 0, 'a missing sound: no spelling, nothing played');
    check(audio.spell('fatha', 'ب', 'two zabar') === null && played.length === 0, 'a missing mark name: no spelling either');
    check(audio.play('fatha', 'ذ') === 'standin', 'and the tap still plays the stand-in, as before');
  }
  {
    const { audio, played, finish } = await sandbox();
    audio.spell('fatha', 'ب', 'zabar');
    audio.play('letters', 'ت'); // tapped meanwhile
    finish(); finish(); finish();
    check(played.join() === 'audio/letters/ba.wav,audio/letters/ta.wav', 'a tap during a spelling stops the rest of it');
  }
  {
    const { audio, played } = await sandbox({ muted: true });
    check(audio.spell('fatha', 'ب', 'zabar') === 'muted' && audio.playName('zabar') === 'muted' && played.length === 0, 'muted: nothing plays');
  }
  console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
  process.exit(failed ? 1 : 0);
})();
