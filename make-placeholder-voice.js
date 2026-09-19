// Makes the Qaida's stand-in sound: site/qaida/audio/placeholder.wav
//
//   node make-placeholder-voice.js
//
// It is a wordless hum in a human timbre — a voice clearing its throat, not a voice saying anything. That is
// deliberate. QAIDA-CONTENT.md's rule is "the user's own recordings or a vetted reciter, never AI voice", because a
// student who hears a letter pronounced will believe it. A hum can't teach a wrong pronunciation.
//
// How it works: a buzz at a human pitch (like vocal folds), pushed through two resonant filters tuned to the mouth
// shapes of "mm" opening into "ah" (formants). No libraries, no ffmpeg, no Python — a WAV written byte by byte.
// Change the numbers at the top and run it again if you want it warmer, shorter or quieter.

const fs = require('fs');
const path = require('path');

const RATE = 22050; // plenty for a hum, and keeps the file small
const SECONDS = 0.62;
const PITCH = 116; // Hz — a relaxed adult voice
const VIBRATO = { depth: 2.2, rate: 4.8 }; // a little wobble, so it doesn't sound like a machine
const VOLUME = 0.5; // 0 to 1

// Where the mouth starts and ends: "mm" (closed, low and dark) opening into "ah" (open). Each pair is a formant in
// Hz with the width of its resonance.
const FROM = [{ hz: 320, bw: 90 }, { hz: 1100, bw: 110 }];
const TO = [{ hz: 700, bw: 110 }, { hz: 1180, bw: 130 }];

const out = path.join(__dirname, 'site', 'qaida', 'audio', 'placeholder.wav');

// A two-pole resonator: the filter that gives the buzz a mouth to come out of.
const resonate = (hz, bw) => {
  const r = Math.exp((-Math.PI * bw) / RATE);
  const a1 = 2 * r * Math.cos((2 * Math.PI * hz) / RATE);
  const a2 = -(r * r);
  let y1 = 0;
  let y2 = 0;
  return (x) => {
    const y = x + a1 * y1 + a2 * y2;
    y2 = y1;
    y1 = y;
    return y * (1 - r); // keep the level steady whatever the width
  };
};

const lerp = (a, b, t) => a + (b - a) * t;

const total = Math.round(RATE * SECONDS);
const samples = new Float64Array(total);

// One resonator per formant, retuned as the mouth opens.
let phase = 0;
const filters = FROM.map((f) => ({ hz: f.hz, bw: f.bw, run: resonate(f.hz, f.bw) }));

for (let i = 0; i < total; i += 1) {
  const t = i / RATE;
  const through = i / total;

  // The mouth opens over the first two thirds, then holds.
  const open = Math.min(1, through / 0.66);
  for (let f = 0; f < filters.length; f += 1) {
    const hz = lerp(FROM[f].hz, TO[f].hz, open);
    const bw = lerp(FROM[f].bw, TO[f].bw, open);
    if (Math.abs(hz - filters[f].hz) > 1 || Math.abs(bw - filters[f].bw) > 1) {
      filters[f] = { hz, bw, run: resonate(hz, bw) };
    }
  }

  // The buzz: a falling ramp, the shape vocal folds actually make, with a little vibrato and a small drop in pitch
  // at the end — voices relax downward when they stop.
  const hz = PITCH * (1 - 0.06 * through * through) + VIBRATO.depth * Math.sin(2 * Math.PI * VIBRATO.rate * t);
  phase += hz / RATE;
  if (phase >= 1) phase -= 1;
  const buzz = 1 - 2 * phase;

  let voiced = 0;
  for (const f of filters) voiced += f.run(buzz);

  // Fade in and out, so it starts and stops like a breath rather than a click.
  const attack = Math.min(1, through / 0.12);
  const release = Math.min(1, (1 - through) / 0.34);
  samples[i] = voiced * attack * release;
}

// Bring it up to the volume asked for, without clipping.
let peak = 0;
for (const s of samples) peak = Math.max(peak, Math.abs(s));
const gain = peak > 0 ? (VOLUME * 32767) / peak : 0;

const body = Buffer.alloc(total * 2);
for (let i = 0; i < total; i += 1) body.writeInt16LE(Math.round(samples[i] * gain), i * 2);

// A WAV file: the RIFF wrapper, what kind of sound it is, then the sound.
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + body.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16); // the fmt chunk is 16 bytes
header.writeUInt16LE(1, 20); // uncompressed
header.writeUInt16LE(1, 22); // one channel
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 2, 28); // bytes per second
header.writeUInt16LE(2, 32); // bytes per sample
header.writeUInt16LE(16, 34); // bits per sample
header.write('data', 36);
header.writeUInt32LE(body.length, 40);

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.concat([header, body]));
console.log(`Wrote ${out} — ${SECONDS}s, ${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
