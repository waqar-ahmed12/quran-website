// Cuts the letters out of the teacher's recording (their names, or their sounds with a mark), cleans each one, and writes it
// as a file of its own.
// QAIDA-BUILD.md step 10 (the recordings); how the recording is made: docs/recordings/how-to-record.md.
//
//   node tools/cut-letters.js <recording.wav> <cuts.json> --compare <folder>
//       every version of every letter, for a before-and-after page: before, off, gentle, medium, strong, verystrong
//   node tools/cut-letters.js <recording.wav> <cuts.json> --site <version> [--use ya=ya-take1]
//       one version into site/qaida/audio/<group>/, and the <group> list of site/qaida/audio/manifest.json
//
// <recording.wav> is 16-bit PCM: tools/m4a-to-wav.ps1 makes one from a phone's .m4a. <cuts.json> says where each letter
// is, in seconds (it lives beside the recording in recordings-inbox/, which git ignores), and which manifest group they
// belong to: "letters" (the names, Lessons 1-3) unless it says "group": "fatha", "kasra"... An entry with "hold" is cut for
// the compare page but kept off the site (and taken off, if an earlier run put it there) until it has been listened to;
// "missing" lists sounds with no usable take, for the compare page to say so. The cleaning is the one the
// first compare page used (recordings-inbox/compare.html, 2026-10-14): a rumble filter, the hiss turned down only in the
// moments it is louder than a typical letter's, then every letter at one volume. Files are mono 16-bit WAV at 22.05 kHz:
// nothing on this PC can safely make mp3 (no ffmpeg), every browser plays WAV, and half the rate halves the size.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE_AUDIO = path.join(ROOT, 'site', 'qaida', 'audio');
const OUT_RATE = 22050;
const TARGET_DB = -20; // the loud part of every letter, as mean power (dBFS)
const PEAK = 10 ** (-1 / 20); // never above -1 dBFS

// Softening the hiss: how far above a typical letter's hiss it may go before it is turned down, and how hard.
const VERSIONS = {
  before: { filter: false, deEss: null }, // as recorded: only cut, faded and set to the common volume
  off: { filter: true, deEss: null }, // the rumble filter alone
  gentle: { filter: true, deEss: { over: 8, ratio: 2 } },
  medium: { filter: true, deEss: { over: 5, ratio: 3 } },
  strong: { filter: true, deEss: { over: 2, ratio: 4 } },
  verystrong: { filter: true, deEss: { over: -2, ratio: 8 } },
};

const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : null; };
const [wavPath, cutsPath] = args;
if (!wavPath || !cutsPath || !(option('--compare') || option('--site'))) {
  console.error('usage: node tools/cut-letters.js <recording.wav> <cuts.json> (--compare <folder> | --site <version> [--use ya=ya-take1])');
  process.exit(1);
}

// ---------------------------------------------------------------------------------------------------------------- the WAV
function readWav(file) {
  const b = fs.readFileSync(file);
  if (b.toString('latin1', 0, 4) !== 'RIFF' || b.toString('latin1', 8, 12) !== 'WAVE') throw new Error(`${file} is not a WAV file`);
  let p = 12;
  let fmt = null;
  while (p + 8 <= b.length) {
    const id = b.toString('latin1', p, p + 4), size = b.readUInt32LE(p + 4), body = p + 8;
    if (id === 'fmt ') fmt = { format: b.readUInt16LE(body), channels: b.readUInt16LE(body + 2), rate: b.readUInt32LE(body + 4), bits: b.readUInt16LE(body + 14) };
    if (id === 'data') {
      if (!fmt || fmt.bits !== 16 || ![1, 0xfffe].includes(fmt.format)) throw new Error('expected 16-bit PCM (tools/m4a-to-wav.ps1 makes one)');
      const frames = Math.floor(Math.min(size, b.length - body) / (2 * fmt.channels));
      const mono = new Float32Array(frames);
      for (let i = 0; i < frames; i++) {
        let s = 0;
        for (let c = 0; c < fmt.channels; c++) s += b.readInt16LE(body + 2 * (i * fmt.channels + c));
        mono[i] = s / fmt.channels / 32768;
      }
      return { rate: fmt.rate, mono };
    }
    p = body + size + (size & 1);
  }
  throw new Error(`${file} has no audio in it`);
}

// A tiny repeatable noise for dither, so the same input always makes the same bytes (and git sees no change).
function random(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

function writeWav(file, samples, rate, seed) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write('RIFF', 0, 'latin1'); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVE', 8, 'latin1');
  b.write('fmt ', 12, 'latin1'); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36, 'latin1'); b.writeUInt32LE(samples.length * 2, 40);
  const rnd = random(seed);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.round(samples[i] * 32767 + (rnd() - rnd())); // triangular dither of one step
    b.writeInt16LE(Math.max(-32768, Math.min(32767, v)), 44 + i * 2);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, b);
}

// ---------------------------------------------------------------------------------------------------------------- filters
// Low rumble: a 75 Hz high-pass, run twice (4th order), under any adult voice.
function highpass(input, rate, f0) {
  const out = Float32Array.from(input);
  const w0 = (2 * Math.PI * f0) / rate, c = Math.cos(w0), alpha = Math.sin(w0) / (2 * Math.SQRT1_2), a0 = 1 + alpha;
  const b0 = (1 + c) / 2 / a0, b1 = -(1 + c) / a0, b2 = (1 + c) / 2 / a0, a1 = (-2 * c) / a0, a2 = (1 - alpha) / a0;
  for (let pass = 0; pass < 2; pass++) {
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < out.length; i++) {
      const x = out[i], y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y; out[i] = y;
    }
  }
  return out;
}

const fftTables = new Map();
function fft(re, im) {
  const n = re.length;
  if (!fftTables.has(n)) {
    const bits = Math.log2(n), rev = new Uint32Array(n);
    for (let i = 0; i < n; i++) { let r = 0; for (let k = 0; k < bits; k++) r |= ((i >> k) & 1) << (bits - 1 - k); rev[i] = r; }
    fftTables.set(n, { rev, cos: Float64Array.from({ length: n / 2 }, (_, i) => Math.cos((-2 * Math.PI * i) / n)), sin: Float64Array.from({ length: n / 2 }, (_, i) => Math.sin((-2 * Math.PI * i) / n)) });
  }
  const { rev, cos, sin } = fftTables.get(n);
  for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1, step = n / size;
    for (let i = 0; i < n; i += size) {
      for (let j = 0, k = 0; j < half; j++, k += step) {
        const a = i + j, b = a + half, tr = re[b] * cos[k] - im[b] * sin[k], ti = re[b] * sin[k] + im[b] * cos[k];
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
      }
    }
  }
}

// The hiss: frames of 1024 with half overlap and a sine window in and out (they add back to the signal exactly). Frame f
// is centred on sample f*512. Its hiss is the energy above 3 kHz; softening turns down 2.5 kHz and up, fully from 3.5 kHz.
const N = 1024, H = 512;
const WIN = Float64Array.from({ length: N }, (_, i) => Math.sin((Math.PI * (i + 0.5)) / N));

function hissLevels(sig, rate) {
  const count = Math.ceil(sig.length / H) + 1, out = new Float64Array(count), detect = Math.floor((3000 * N) / rate);
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let f = 0; f < count; f++) {
    const s0 = f * H - H;
    for (let i = 0; i < N; i++) { re[i] = (sig[s0 + i] || 0) * WIN[i]; im[i] = 0; }
    fft(re, im);
    let e = 0;
    for (let k = detect; k < N / 2; k++) e += re[k] * re[k] + im[k] * im[k];
    out[f] = 10 * Math.log10(e + 1e-12);
  }
  return out;
}

function deEss(sig, rate, hiss, threshold, { ratio }) {
  const count = hiss.length, lo = Math.floor((2500 * N) / rate), full = Math.ceil((3500 * N) / rate);
  const want = Float64Array.from(hiss, (l) => Math.min(18, Math.max(0, (l - threshold) * (1 - 1 / ratio))));
  // Look one frame ahead and behind, so nothing slips through at a hiss's start; then let go by 2 dB a frame (~60 ms).
  const reduction = new Float64Array(count);
  let held = 0;
  for (let f = 0; f < count; f++) {
    held = Math.max(want[f], want[f - 1] || 0, want[f + 1] || 0, held - 2);
    reduction[f] = held;
  }
  const out = new Float32Array(sig.length);
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let f = 0; f < count; f++) {
    const s0 = f * H - H, r = reduction[f];
    if (r < 0.01) { // untouched: window in and out, nothing else
      for (let i = 0; i < N; i++) { const at = s0 + i; if (at >= 0 && at < out.length) out[at] += sig[at] * WIN[i] * WIN[i]; }
      continue;
    }
    for (let i = 0; i < N; i++) { re[i] = (sig[s0 + i] || 0) * WIN[i]; im[i] = 0; }
    fft(re, im);
    for (let k = lo; k <= N / 2; k++) {
      const g = 10 ** (-(k >= full ? r : (r * (k - lo)) / (full - lo)) / 20);
      re[k] *= g; im[k] *= g;
      if (k > 0 && k < N / 2) { re[N - k] *= g; im[N - k] *= g; }
    }
    for (let i = 0; i < N; i++) im[i] = -im[i];
    fft(re, im);
    for (let i = 0; i < N; i++) { const at = s0 + i; if (at >= 0 && at < out.length) out[at] += (re[i] / N) * WIN[i]; }
  }
  return { out, reduction };
}

// 44.1 kHz to 22.05 kHz: a linear-phase low-pass (127 taps, Blackman) at 10.3 kHz, then every other sample.
function halve(clip, rate) {
  const taps = 127, fc = 10300 / rate, mid = (taps - 1) / 2, h = new Float64Array(taps);
  let sum = 0;
  for (let i = 0; i < taps; i++) {
    const m = i - mid, s = m === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * m) / (Math.PI * m);
    h[i] = s * (0.42 - 0.5 * Math.cos((2 * Math.PI * i) / (taps - 1)) + 0.08 * Math.cos((4 * Math.PI * i) / (taps - 1)));
    sum += h[i];
  }
  const out = new Float32Array(Math.floor(clip.length / 2));
  for (let k = 0; k < out.length; k++) {
    let acc = 0;
    const c = 2 * k;
    for (let i = 0; i < taps; i++) { const j = c + i - mid; if (j >= 0 && j < clip.length) acc += h[i] * clip[j]; }
    out[k] = acc / sum;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------- letters
const cuts = JSON.parse(fs.readFileSync(cutsPath, 'utf8'));
const group = cuts.group || 'letters';
if (!/^[a-z-]+$/.test(group)) throw new Error(`a manifest group is lower-case letters and dashes, not "${group}"`);
const letters = cuts.letters.map((l) => ({ ...l, main: true }));
const all = [...letters, ...(cuts.alternates || []).map((l) => ({ ...l, main: false }))];

// An entry can name its own recording ("source", in the same folder as <recording.wav>), so one list can gather the
// marks' names from three files; the rest come from <recording.wav>. Each recording is read, filtered and measured once.
const sources = new Map();
function sourceOf(l) {
  const file = l.source ? path.join(path.dirname(path.resolve(wavPath)), l.source) : path.resolve(wavPath);
  if (!sources.has(file)) {
    const { rate, mono } = readWav(file);
    if (rate !== 44100 && rate !== 48000) throw new Error(`expected 44.1 or 48 kHz, got ${rate} in ${file}`);
    const filtered = highpass(mono, rate, 75);
    sources.set(file, { rate, mono, filtered, hiss: hissLevels(filtered, rate), softened: new Map() });
  }
  return sources.get(file);
}

const range = (l) => { const { rate } = sourceOf(l); return [Math.round(l.from * rate), Math.round(l.to * rate)]; };
function cut(sig, l) {
  const { rate } = sourceOf(l);
  const [a, b] = range(l);
  const clip = Float32Array.from(sig.subarray(a, b));
  const fadeIn = Math.round((l.fadeIn || 0.015) * rate), fadeOut = Math.round((l.fadeOut || 0.08) * rate);
  for (let i = 0; i < fadeIn; i++) clip[i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / fadeIn);
  for (let i = 0; i < fadeOut; i++) clip[clip.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / fadeOut);
  return clip;
}
function loudness(clip, rate) { // mean power of the 10 ms steps within 20 dB of the loudest
  const hop = Math.round(rate / 100), steps = [];
  for (let i = 0; i + hop <= clip.length; i += hop) { let s = 0; for (let j = i; j < i + hop; j++) s += clip[j] * clip[j]; steps.push(s / hop); }
  const top = Math.max(...steps);
  const loud = steps.filter((p) => p > top / 100);
  return 10 * Math.log10(loud.reduce((x, y) => x + y, 0) / loud.length);
}
const peakOf = (clip) => clip.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
const db = (v) => 20 * Math.log10(v);

// One volume per letter, measured on the untouched recording and used for every version alike (measuring a softened
// version on its own would turn its hiss back up).
const raw = all.map((l) => cut(sourceOf(l).mono, l));
const loudOf = (i) => loudness(raw[i], sourceOf(all[i]).rate);
const gains = raw.map((clip, i) => 10 ** ((TARGET_DB - loudOf(i)) / 20));

const framesOf = (l) => { const [a, b] = range(l); return [Math.ceil(a / H), Math.floor(b / H)]; };
const peakHiss = (l) => { const { hiss } = sourceOf(l); const [f0, f1] = framesOf(l); let m = -200; for (let f = f0; f <= f1; f++) m = Math.max(m, hiss[f]); return m; };
// A typical letter's hiss: the middle of the 29 letters' loudest moments.
const typical = letters.map(peakHiss).sort((x, y) => x - y)[Math.floor(letters.length / 2)];

function render(version) {
  const v = VERSIONS[version];
  if (!v) throw new Error(`no version "${version}": ${Object.keys(VERSIONS).join(', ')}`);
  return all.map((l, i) => {
    const s = sourceOf(l);
    let sig = v.filter ? s.filtered : s.mono, reduction = null;
    if (v.deEss) {
      if (!s.softened.has(version)) s.softened.set(version, deEss(s.filtered, s.rate, s.hiss, typical + v.deEss.over, v.deEss));
      ({ out: sig, reduction } = s.softened.get(version));
    }
    const clip = cut(sig, l);
    const g = Math.min(gains[i], PEAK / (peakOf(clip) || 1));
    let out = clip.map((x) => x * g);
    if (s.rate === 44100) out = halve(out, s.rate);
    const p = peakOf(out);
    if (p > PEAK) out = out.map((x) => (x * PEAK) / p);
    let softened = 0;
    if (reduction) { const [f0, f1] = framesOf(l); for (let f = f0; f <= f1; f++) softened = Math.max(softened, reduction[f]); }
    return { letter: l, samples: out, gainDb: db(g), peakDb: db(peakOf(out)), softened };
  });
}
const outRates = new Set([...sources.values()].map((s) => (s.rate === 44100 ? OUT_RATE : s.rate)));
if (outRates.size > 1) throw new Error('the recordings in one cut list must share a sample rate');
const [outRate] = outRates;
const seedOf = (slug) => [...slug].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

if (option('--compare')) {
  const dir = path.resolve(option('--compare'));
  const report = all.map((l, i) => ({ key: l.key, glyph: l.glyph, name: l.name, slug: l.slug, main: l.main, note: l.note || '', hold: l.hold || '',
    seconds: Math.round((l.to - l.from) * 100) / 100, loudness: Math.round(loudOf(i) * 10) / 10,
    hiss: Math.round((peakHiss(l) - typical) * 10) / 10, softened: {} })); // hiss: dB above a typical letter's
  for (const version of Object.keys(VERSIONS)) {
    render(version).forEach((r, i) => {
      writeWav(path.join(dir, version, `${r.letter.slug}.wav`), r.samples, outRate, seedOf(r.letter.slug));
      report[i].softened[version] = Math.round(r.softened * 10) / 10;
      if (version === 'before') report[i].peakDb = Math.round(r.peakDb * 10) / 10;
    });
  }
  fs.writeFileSync(path.join(dir, 'clips.json'), JSON.stringify({ made: new Date().toISOString(), group, rate: outRate, target: TARGET_DB, clips: report, missing: cuts.missing || [] }, null, 2));
  console.log(`wrote ${Object.keys(VERSIONS).length} versions of ${all.length} clips to ${dir}`);
  console.log('letter               loud  gain  peak  hiss  softened by (gentle/medium/strong/verystrong)');
  report.forEach((r, i) => console.log(`${r.name.padEnd(18)} ${String(r.loudness).padStart(6)} ${db(gains[i]).toFixed(1).padStart(5)} ${String(r.peakDb).padStart(5)} ${String(r.hiss).padStart(5)}  ${['gentle', 'medium', 'strong', 'verystrong'].map((v) => String(r.softened[v]).padStart(4)).join(' ')}`));
}

if (option('--site')) {
  const version = option('--site');
  const swaps = Object.fromEntries((option('--use') || '').split(',').filter(Boolean).map((pair) => pair.split('=')));
  const rendered = render(version);
  const bySlug = new Map(rendered.map((r) => [r.letter.slug, r]));
  const manifestPath = path.join(SITE_AUDIO, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest[group] = manifest[group] || {};
  const shipped = [], held = [];
  for (const l of letters) {
    const file = `${group}/${l.slug}.wav`;
    if (l.hold) { // to be listened to first: off the site, and off it again if an earlier run put it there
      held.push(l.name);
      delete manifest[group][l.key];
      fs.rmSync(path.join(SITE_AUDIO, file), { force: true });
      continue;
    }
    const r = bySlug.get(swaps[l.slug] || l.slug);
    if (!r) throw new Error(`no clip "${swaps[l.slug]}" to use for ${l.slug}`);
    writeWav(path.join(SITE_AUDIO, file), r.samples, outRate, seedOf(l.slug));
    manifest[group][l.key] = file;
    shipped.push(file);
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const bytes = shipped.reduce((n, file) => n + fs.statSync(path.join(SITE_AUDIO, file)).size, 0);
  console.log(`wrote ${shipped.length} ${group} clips (${version}) to site/qaida/audio/${group}/, ${(bytes / 1024).toFixed(0)} KB in all, and the ${group} list in manifest.json`);
  if (held.length) console.log(`kept off the site until they have been listened to: ${held.join(', ')}`);
}
