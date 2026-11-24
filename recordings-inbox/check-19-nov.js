// Checks the 19 Nov recordings (Audios/19 Nov audios 4 files/): finds each item, measures it, and lists what to listen to.
// Everything runs in this browser; nothing is uploaded. Open http://localhost:8777/recordings-inbox/check-19-nov.html
// (node serve.js). The numbers are also left on window.__analysis for Claude to read.
(() => {
  'use strict';

  const BASE = '/recordings-inbox/19%20Nov%20audios%204%20files/';
  const RECORDINGS = [
    { id: 'names', file: 'Arabic alphabet.m4a', title: 'Letter names', kind: 'names' },
    { id: 'zabar', file: 'zabar.m4a', title: 'Zabar', kind: 'a' },
    { id: 'zair', file: 'zair.m4a', title: 'Zair', kind: 'i' },
    { id: 'paish', file: 'paish.m4a', title: 'Paish', kind: 'u' },
  ];
  for (const r of RECORDINGS) r.url = BASE + encodeURIComponent(r.file);
  const OLD = { id: 'old', file: 'WhatsApp clip, 14 Oct', title: 'The WhatsApp clip (14 Oct), for comparison', kind: 'names',
    url: '/recordings-inbox/' + encodeURIComponent('WhatsApp Audio 2026-10-14 at 3.46.52 AM - Copy.mp4') };

  // Indo-Pak order, as on docs/recordings/recording-script.html.
  // [glyph, name, consonant, onset, vowel in the name]  onset: s = s/sh/z hiss, f = other fricative, t = stop, n = voiced, v = vowel
  const LETTERS = [
    ['ا', 'Alif', '', 'v', 'a·i'], ['ب', 'Baa', 'b', 't', 'aa'], ['ت', 'Taa', 't', 't', 'aa'], ['ث', 'Thaa', 'th', 'f', 'aa'],
    ['ج', 'Jeem', 'j', 't', 'ee'], ['ح', 'Ḥaa', 'ḥ', 'f', 'aa'], ['خ', 'Khaa', 'kh', 'f', 'aa'], ['د', 'Daal', 'd', 't', 'aa'],
    ['ذ', 'Dhaal', 'dh', 'f', 'aa'], ['ر', 'Raa', 'r', 'n', 'aa'], ['ز', 'Zaa', 'z', 's', 'aa'], ['س', 'Seen', 's', 's', 'ee'],
    ['ش', 'Sheen', 'sh', 's', 'ee'], ['ص', 'Ṣaad', 'ṣ', 's', 'aa'], ['ض', 'Ḍaad', 'ḍ', 't', 'aa'], ['ط', 'Ṭaa', 'ṭ', 't', 'aa'],
    ['ظ', 'Ẓaa', 'ẓ', 'f', 'aa'], ['ع', 'ʿAyn', 'ʿ', 'v', 'ay'], ['غ', 'Ghayn', 'gh', 'f', 'ay'], ['ف', 'Faa', 'f', 'f', 'aa'],
    ['ق', 'Qaaf', 'q', 't', 'aa'], ['ک', 'Kaaf', 'k', 't', 'aa'], ['ل', 'Laam', 'l', 'n', 'aa'], ['م', 'Meem', 'm', 'n', 'ee'],
    ['ن', 'Noon', 'n', 'n', 'oo'], ['و', 'Waaw', 'w', 'n', 'aa'], ['ہ', 'Haa', 'h', 'f', 'aa'], ['ء', 'Hamzah', 'ʾ', 'v', 'a·a'],
    ['ی', 'Yaa', 'y', 'n', 'aa'],
  ];
  const MARK = { a: 'َ', i: 'ِ', u: 'ُ' };
  function labelOf(kind, i) {
    const L = LETTERS[i];
    if (!L) return { ar: '+', en: `extra ${i - LETTERS.length + 1}` };
    if (kind === 'names') return { ar: L[0], en: L[1] };
    return { ar: L[0] + MARK[kind], en: L[2] + kind };
  }

  // ---------------------------------------------------------------- small DSP
  const db = (p) => 10 * Math.log10(p + 1e-12);
  const sorted = (a) => Float64Array.from(a).sort();
  const median = (a) => { if (!a.length) return NaN; const s = sorted(a); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const pct = (a, q) => { if (!a.length) return NaN; const s = sorted(a); return s[Math.min(s.length - 1, Math.max(0, Math.round(q * (s.length - 1))))]; };
  const nthLargest = (a, k) => { if (!a.length) return -Infinity; const s = sorted(a); return s[Math.max(0, s.length - k)]; };
  const range = (a, b) => { const r = []; for (let i = a; i < b; i++) r.push(i); return r; };
  const r1 = (v) => (Number.isFinite(v) ? Math.round(v * 10) / 10 : null);
  const r0 = (v) => (Number.isFinite(v) ? Math.round(v) : null);

  const fftCache = new Map();
  function fftTables(n) {
    if (fftCache.has(n)) return fftCache.get(n);
    const bits = Math.log2(n), rev = new Uint32Array(n);
    for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
    const cos = new Float64Array(n / 2), sin = new Float64Array(n / 2);
    for (let i = 0; i < n / 2; i++) { cos[i] = Math.cos((-2 * Math.PI * i) / n); sin[i] = Math.sin((-2 * Math.PI * i) / n); }
    const hann = new Float64Array(n);
    for (let i = 0; i < n; i++) hann[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    const t = { rev, cos, sin, hann, re: new Float64Array(n), im: new Float64Array(n) };
    fftCache.set(n, t);
    return t;
  }
  // Power spectrum (bins 0..n/2) of a Hann-windowed frame of x starting at `start`, written into out.
  function power(x, start, n, out) {
    const { rev, cos, sin, hann, re, im } = fftTables(n);
    for (let i = 0; i < n; i++) { const j = start + i; re[rev[i]] = (j >= 0 && j < x.length ? x[j] : 0) * hann[i]; im[rev[i]] = 0; }
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >> 1, step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = 0, k = 0; j < half; j++, k += step) {
          const a = i + j, b = a + half;
          const tr = re[b] * cos[k] - im[b] * sin[k], ti = re[b] * sin[k] + im[b] * cos[k];
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        }
      }
    }
    for (let k = 0; k <= n / 2; k++) out[k] = re[k] * re[k] + im[k] * im[k];
  }

  function highpass(x, sr, fc) {
    const w0 = (2 * Math.PI * fc) / sr, c = Math.cos(w0), al = Math.sin(w0) / (2 * Math.SQRT1_2);
    const b0 = (1 + c) / 2, b1 = -(1 + c), b2 = (1 + c) / 2, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
    const y = new Float32Array(x.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) {
      const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
    }
    return y;
  }

  function frameDb(x, hop) {
    const n = Math.floor(x.length / hop), out = new Float32Array(n);
    for (let f = 0; f < n; f++) { let s = 0; for (let i = f * hop, e = i + hop; i < e; i++) s += x[i] * x[i]; out[f] = db(s / hop); }
    return out;
  }

  // To about 11 kHz, for pitch and formants.
  function decimate(x, sr) {
    const factor = Math.max(1, Math.round(sr / 11025));
    if (factor === 1) return { x, sr };
    const sr2 = sr / factor, fc = (0.45 * sr2) / sr, taps = 16 * factor + 1, h = new Float64Array(taps);
    let sum = 0;
    for (let i = 0; i < taps; i++) {
      const m = i - (taps - 1) / 2;
      h[i] = (m === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * m) / (Math.PI * m)) * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (taps - 1)));
      sum += h[i];
    }
    for (let i = 0; i < taps; i++) h[i] /= sum;
    const n = Math.floor(x.length / factor), y = new Float32Array(n), half = (taps - 1) / 2;
    for (let k = 0; k < n; k++) {
      let acc = 0;
      const c = k * factor;
      for (let i = 0; i < taps; i++) { const j = c + i - half; if (j >= 0 && j < x.length) acc += h[i] * x[j]; }
      y[k] = acc;
    }
    return { x: y, sr: sr2 };
  }

  // YIN pitch at one point: { f0, ap } (ap = aperiodicity, low = clearly voiced).
  function yin(x, sr, center) {
    const W = Math.round(0.03 * sr), tmin = Math.floor(sr / 420), tmax = Math.ceil(sr / 65);
    const s = center - Math.floor((W + tmax) / 2);
    if (s < 0 || s + W + tmax >= x.length) return null;
    const d = new Float64Array(tmax + 2);
    for (let tau = 1; tau <= tmax + 1; tau++) { let acc = 0; for (let j = 0; j < W; j++) { const v = x[s + j] - x[s + j + tau]; acc += v * v; } d[tau] = acc; }
    const c = new Float64Array(tmax + 2); c[0] = 1;
    let run = 0;
    for (let tau = 1; tau <= tmax + 1; tau++) { run += d[tau]; c[tau] = run > 0 ? (d[tau] * tau) / run : 1; }
    let best = -1;
    for (let tau = tmin; tau <= tmax; tau++) {
      if (c[tau] < 0.2) { while (tau + 1 <= tmax && c[tau + 1] < c[tau]) tau++; best = tau; break; }
    }
    if (best < 0) { let m = Infinity; for (let tau = tmin; tau <= tmax; tau++) if (c[tau] < m) { m = c[tau]; best = tau; } }
    let t = best;
    const A = c[best - 1], B = c[best], G = c[best + 1], den = A - 2 * B + G;
    if (den > 0) t = best + (0.5 * (A - G)) / den;
    return { f0: sr / t, ap: B };
  }

  function polyRoots(a) { // a[0] = 1: z^n + a1 z^(n-1) + ... + an
    const n = a.length - 1, zr = new Float64Array(n), zi = new Float64Array(n);
    for (let k = 0; k < n; k++) { const ang = (2 * Math.PI * k) / n + 0.4; zr[k] = 0.9 * Math.cos(ang); zi[k] = 0.9 * Math.sin(ang); }
    for (let it = 0; it < 400; it++) {
      let moved = 0;
      for (let k = 0; k < n; k++) {
        let pr = 1, pi = 0;
        for (let j = 1; j <= n; j++) { const nr = pr * zr[k] - pi * zi[k] + a[j]; pi = pr * zi[k] + pi * zr[k]; pr = nr; }
        let dr = 1, di = 0;
        for (let j = 0; j < n; j++) { if (j === k) continue; const ur = zr[k] - zr[j], ui = zi[k] - zi[j]; const nr = dr * ur - di * ui; di = dr * ui + di * ur; dr = nr; }
        const den = dr * dr + di * di;
        if (!den) continue;
        const qr = (pr * dr + pi * di) / den, qi = (pi * dr - pr * di) / den;
        zr[k] -= qr; zi[k] -= qi;
        moved = Math.max(moved, Math.abs(qr) + Math.abs(qi));
      }
      if (moved < 1e-9) break;
    }
    return range(0, n).map((k) => [zr[k], zi[k]]);
  }

  // LPC formant candidates (Hz, ascending) for a 25 ms frame centred at `center`.
  function formants(x, sr, center) {
    const N = Math.round(0.025 * sr), p = 12, s = center - (N >> 1);
    if (s < 1 || s + N >= x.length) return null;
    const w = new Float64Array(N);
    for (let i = 0; i < N; i++) w[i] = (x[s + i] - 0.95 * x[s + i - 1]) * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1)));
    const r = new Float64Array(p + 1);
    for (let k = 0; k <= p; k++) { let acc = 0; for (let i = k; i < N; i++) acc += w[i] * w[i - k]; r[k] = acc; }
    if (r[0] <= 0) return null;
    r[0] *= 1.0001;
    const a = new Float64Array(p + 1); a[0] = 1;
    let e = r[0];
    for (let i = 1; i <= p; i++) {
      let acc = r[i];
      for (let j = 1; j < i; j++) acc += a[j] * r[i - j];
      const k = -acc / e, prev = a.slice();
      for (let j = 1; j < i; j++) a[j] = prev[j] + k * prev[i - j];
      a[i] = k; e *= 1 - k * k;
      if (e <= 0) return null;
    }
    const out = [];
    for (const [re, im] of polyRoots(a)) {
      if (im <= 0) continue;
      const f = (Math.atan2(im, re) * sr) / (2 * Math.PI), bw = (-Math.log(Math.hypot(re, im)) * sr) / Math.PI;
      if (f > 180 && f < sr / 2 - 250 && bw < 500) out.push(f);
    }
    return out.sort((u, v) => u - v);
  }
  function f12(c) {
    if (!c) return null;
    const F1 = c.find((f) => f >= 200 && f <= 1100);
    if (!F1) return null;
    const F2 = c.find((f) => f > F1 + 200 && f >= 550 && f <= 3200);
    return F2 ? [F1, F2] : null;
  }

  function melBank(n, sr, bands, lo, hi) {
    const mel = (f) => 2595 * Math.log10(1 + f / 700), inv = (m) => 700 * (10 ** (m / 2595) - 1);
    const pts = range(0, bands + 2).map((i) => inv(mel(lo) + ((mel(hi) - mel(lo)) * i) / (bands + 1)));
    const bin = (f) => (f * n) / sr;
    return range(0, bands).map((b) => {
      const [f0, f1, f2] = [bin(pts[b]), bin(pts[b + 1]), bin(pts[b + 2])], w = [];
      for (let k = Math.floor(f0); k <= Math.ceil(f2); k++) { const v = k < f1 ? (k - f0) / (f1 - f0) : (f2 - k) / (f2 - f1); if (v > 0) w.push([k, v]); }
      return w;
    });
  }

  // 10 ms frames: total and band levels (dB, relative scale) and 12 MFCCs.
  function stft(x, sr, frames) {
    const N = 1024, hop = Math.round(sr / 100), ps = new Float64Array(N / 2 + 1), bin = (f) => Math.round((f * N) / sr);
    const B = { sub: [1, bin(80)], low: [bin(80) + 1, bin(300)], mid: [bin(300) + 1, bin(3500)], hf: [bin(3500) + 1, bin(10000)],
      air: [bin(10000) + 1, N / 2], sib: [bin(4500), bin(10000)], sh: [bin(2500), bin(4500)] };
    const bank = melBank(N, sr, 26, 100, 8000);
    const dctT = range(0, 13).map((k) => range(0, 26).map((i) => Math.cos((Math.PI * k * (i + 0.5)) / 26)));
    const out = { N, total: new Float32Array(frames), band: {}, mfcc: new Array(frames) };
    for (const k in B) out.band[k] = new Float32Array(frames);
    const lm = new Float64Array(26);
    for (let f = 0; f < frames; f++) {
      power(x, f * hop + (hop >> 1) - N / 2, N, ps);
      let tot = 0;
      for (let k = 1; k <= N / 2; k++) tot += ps[k];
      out.total[f] = db(tot);
      for (const k in B) { let s = 0; for (let i = B[k][0]; i <= B[k][1]; i++) s += ps[i]; out.band[k][f] = db(s); }
      for (let b = 0; b < 26; b++) { let s = 0; for (const [k, w] of bank[b]) s += ps[k] * w; lm[b] = Math.log(s + 1e-10); }
      const c = new Float32Array(12);
      for (let k = 1; k < 13; k++) { let s = 0; for (let i = 0; i < 26; i++) s += lm[i] * dctT[k][i]; c[k - 1] = s; }
      out.mfcc[f] = c;
    }
    return out;
  }

  function dtw(A, B) {
    const n = A.length, m = B.length;
    if (!n || !m) return NaN;
    let prev = new Float64Array(m + 1).fill(Infinity), cur = new Float64Array(m + 1);
    prev[0] = 0;
    for (let i = 1; i <= n; i++) {
      cur.fill(Infinity);
      for (let j = 1; j <= m; j++) {
        const a = A[i - 1], b = B[j - 1];
        let d = 0;
        for (let k = 0; k < a.length; k++) { const v = a[k] - b[k]; d += v * v; }
        cur[j] = Math.sqrt(d) + Math.min(prev[j], cur[j - 1], prev[j - 1]);
      }
      [prev, cur] = [cur, prev];
    }
    return prev[m] / (n + m);
  }

  // Items: loud stretches (with hysteresis), joined across dips under 250 ms, widened to catch soft h/f/th edges.
  function segment(d) {
    const floor = pct(d, 0.1), top = pct(d, 0.99), span = top - floor;
    const on = floor + Math.max(10, 0.35 * span), off = floor + Math.max(6, 0.2 * span), edge = floor + 4;
    const segs = [];
    for (let i = 0; i < d.length; i++) {
      if (d[i] <= on) continue;
      let a = i; while (a > 0 && d[a - 1] > off) a--;
      let b = i; while (b < d.length - 1 && d[b + 1] > off) b++;
      segs.push([a, b + 1]);
      i = b + 1;
    }
    const joined = [];
    for (const s of segs) { const last = joined[joined.length - 1]; if (last && s[0] - last[1] < 25) last[1] = s[1]; else joined.push([...s]); }
    for (const s of joined) {
      for (let k = 0; k < 20 && s[0] > 0 && d[s[0] - 1] > edge; k++) s[0]--;
      for (let k = 0; k < 20 && s[1] < d.length && d[s[1]] > edge; k++) s[1]++;
    }
    const merged = [];
    for (const s of joined) { const last = merged[merged.length - 1]; if (last && s[0] <= last[1]) last[1] = Math.max(last[1], s[1]); else merged.push(s); }
    return { floor, top, on, off, edge, segs: merged };
  }

  // ---------------------------------------------------------------- one recording
  function analyse(buffer, kind) {
    const sr = buffer.sampleRate;
    const L = buffer.getChannelData(0), R = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : L;
    const n = L.length, hop = Math.round(sr / 100);
    const mono = new Float32Array(n);
    for (let i = 0; i < n; i++) mono[i] = 0.5 * (L[i] + R[i]);
    const dHp = frameDb(highpass(mono, sr, 80), hop), dRaw = frameDb(mono, hop), F = dHp.length;
    const seg = segment(dHp);
    const st = stft(mono, sr, F);
    const dec = decimate(mono, sr);
    const pitch = new Array(F).fill(null);
    for (const [a, b] of seg.segs) for (let f = Math.max(0, a - 3); f < Math.min(F, b + 3); f++) pitch[f] = yin(dec.x, dec.sr, Math.round(((f + 0.5) * dec.sr) / 100));
    const voiced = (f) => !!pitch[f] && pitch[f].ap < 0.3 && pitch[f].f0 > 65 && pitch[f].f0 < 420;
    const atDec = (f) => Math.round(((f + 0.5) * dec.sr) / 100);

    const utts = [], events = [];
    for (const [a, b] of seg.segs) {
      let v = 0, mx = -Infinity;
      for (let f = a; f < b; f++) { if (voiced(f)) v++; if (dHp[f] > mx) mx = dHp[f]; }
      const item = { a, b, voicedFrames: v, maxDb: mx };
      if (v >= 6 && b - a >= 12 && mx >= seg.top - 22) utts.push(item); else events.push(item);
    }

    const items = utts.map((u, idx) => {
      const { a, b } = u;
      let maxT = -Infinity;
      for (let f = a; f < b; f++) maxT = Math.max(maxT, st.total[f]);
      // The vowel: the longest voiced run within 10 dB of the loudest frame.
      const runs = [];
      let s = -1, last = -1;
      for (let f = a; f < b; f++) {
        if (voiced(f) && st.total[f] >= maxT - 10) {
          if (s < 0) s = f; else if (f - last > 3) { runs.push([s, last + 1]); s = f; }
          last = f;
        }
      }
      if (s >= 0) runs.push([s, last + 1]);
      const nuc = runs.reduce((p, r) => (!p || r[1] - r[0] > p[1] - p[0] ? r : p), null) || [a, b];
      const nucF = range(nuc[0], nuc[1]);
      const nucT = median(nucF.map((f) => st.total[f]));
      let pw = 0;
      for (let i = nuc[0] * hop; i < nuc[1] * hop; i++) pw += mono[i] * mono[i];
      const level = db(pw / Math.max(1, (nuc[1] - nuc[0]) * hop));
      let peak = 0, clips = 0;
      for (let i = Math.max(0, (a - 5) * hop); i < Math.min(n, (b + 5) * hop); i++) {
        const v = Math.max(Math.abs(L[i]), Math.abs(R[i]));
        if (v > peak) peak = v;
        if (v >= 0.985) clips++;
      }
      // Pitch: whole item, and how it ends.
      const vf = range(a, b).filter(voiced), f0s = vf.map((f) => pitch[f].f0), k = f0s.length;
      const f0 = median(f0s);
      const f0mid = median(f0s.slice(Math.floor(k * 0.3), Math.max(Math.floor(k * 0.3) + 1, Math.ceil(k * 0.6))));
      const f0end = median(f0s.slice(Math.floor(k * 0.8)));
      const f0start = median(f0s.slice(0, Math.max(1, Math.ceil(k * 0.2))));
      const hnr = median(nucF.filter(voiced).map((f) => { const ap = Math.min(0.999, Math.max(0.001, pitch[f].ap)); return db((1 - ap) / ap); }));
      // Formants in the middle of the vowel, and at its two ends (a glide such as ʿAyn's "ay" moves F2).
      const len = nuc[1] - nuc[0];
      const fmAt = (f) => f12(formants(dec.x, dec.sr, atDec(f)));
      const midF = range(nuc[0] + Math.floor(len * 0.2), nuc[1] - Math.floor(len * 0.2)).map(fmAt).filter(Boolean);
      const earlyF = range(nuc[0], nuc[0] + Math.max(2, Math.floor(len * 0.25))).map(fmAt).filter(Boolean);
      const lateF = range(nuc[1] - Math.max(2, Math.floor(len * 0.25)), nuc[1]).map(fmAt).filter(Boolean);
      // The start: hiss (s, sh, z) and other friction before the vowel; a thump below 80 Hz.
      const o0 = Math.max(0, a - 5), o1 = Math.max(o0 + 3, nuc[0]);
      const onHf = range(o0, Math.min(o1, F)).map((f) => st.band.hf[f]);
      const onSib = range(o0, Math.min(o1, F)).map((f) => st.band.sib[f]);
      const onSh = range(o0, Math.min(o1, F)).map((f) => st.band.sh[f]);
      const fricFrames = range(o0, Math.min(o1, F)).filter((f) => st.band.hf[f] > nucT - 25).length;
      let pop = -Infinity;
      for (let f = Math.max(0, a - 3); f < Math.min(F, a + 12); f++) pop = Math.max(pop, st.band.sub[f]);
      let sibPeak = -Infinity, sibAt = a;
      for (let f = a; f < b; f++) if (st.band.sib[f] > sibPeak) { sibPeak = st.band.sib[f]; sibAt = f; }
      // Syllable-like peaks: rises and falls of 5 dB or more.
      const sm = range(a, b).map((f) => { let t = 0, c = 0; for (let g = f - 2; g <= f + 2; g++) if (g >= a && g < b) { t += dHp[g]; c++; } return t / c; });
      let peaks = 0, mx = -Infinity, mn = Infinity, rising = true;
      const uMax = Math.max(...sm);
      sm.forEach((v) => {
        if (rising) { if (v > mx) mx = v; if (mx - v >= 5) { if (mx > uMax - 15) peaks++; rising = false; mn = v; } }
        else { if (v < mn) mn = v; if (v - mn >= 5) { rising = true; mx = v; } }
      });
      if (rising && mx > uMax - 15 && mx - mn >= 5) peaks++;
      const mf = range(a, b).filter((f) => dHp[f] > seg.off).map((f) => st.mfcc[f]);
      const meanC = new Float32Array(12);
      mf.forEach((c) => c.forEach((v, j) => { meanC[j] += v / mf.length; }));
      const cmn = mf.map((c) => c.map((v, j) => v - meanC[j]));
      return {
        n: idx + 1, t0: a / 100, t1: b / 100, dur: (b - a) * 10, gap: idx ? (a - utts[idx - 1].b) * 10 : a * 10,
        vowelMs: len * 10, vowelAt: nuc[0] / 100,
        level: r1(level), peak: r1(db(peak * peak)), clips,
        f0: r0(f0), f0start: r0(f0start), f0end: r0(f0end), rise: r1(12 * Math.log2(f0end / f0mid)), hnr: r1(hnr),
        F1: r0(median(midF.map((v) => v[0]))), F2: r0(median(midF.map((v) => v[1]))),
        F1early: r0(median(earlyF.map((v) => v[0]))), F2early: r0(median(earlyF.map((v) => v[1]))),
        F1late: r0(median(lateF.map((v) => v[0]))), F2late: r0(median(lateF.map((v) => v[1]))),
        onsetHf: r1(nthLargest(onHf, 3) - nucT), onsetSib: r1(nthLargest(onSib, 3) - nucT), onsetSh: r1(nthLargest(onSh, 3) - nucT),
        fricMs: fricFrames * 10, pop: r1(pop - nucT), sibPeak: r1(sibPeak - nucT), sibPeakAt: sibAt / 100,
        peaks, _mfcc: cmn,
      };
    });
    for (let i = 0; i < items.length; i++) {
      items[i].dtwNext = i + 1 < items.length ? r1(dtw(items[i]._mfcc, items[i + 1]._mfcc)) : null;
      items[i].dtwNext2 = i + 2 < items.length ? r1(dtw(items[i]._mfcc, items[i + 2]._mfcc)) : null;
    }
    // Every pair, so a re-take shows up as the item most like the one before it.
    const dtwAll = items.map((x, i) => items.map((y, j) => (i === j ? 0 : j < i ? null : r1(dtw(x._mfcc, y._mfcc)))));
    for (let i = 0; i < items.length; i++) for (let j = 0; j < i; j++) dtwAll[i][j] = dtwAll[j][i];
    items.forEach((it, i) => {
      let best = -1;
      dtwAll[i].forEach((v, j) => { if (j !== i && (best < 0 || v < dtwAll[i][best])) best = j; });
      it.nearest = best + 1;
      it.nearestDtw = dtwAll[i][best];
    });

    // ---- the quiet between items
    const busy = new Uint8Array(F);
    for (const s of [...utts, ...events]) for (let f = Math.max(0, s.a - 15); f < Math.min(F, s.b + 15); f++) busy[f] = 1;
    const quiet = range(0, F).filter((f) => !busy[f]);
    const nucAll = [];
    items.forEach((it) => { for (let f = Math.round(it.vowelAt * 100); f < Math.round(it.vowelAt * 100) + it.vowelMs / 10; f++) nucAll.push(f); });
    const bands = {};
    for (const k of ['sub', 'low', 'mid', 'sh', 'hf', 'sib', 'air']) {
      bands[k] = { speech: r1(median(nucAll.map((f) => st.band[k][f]))), noise: r1(median(quiet.map((f) => st.band[k][f]))) };
      bands[k].snr = r1(bands[k].speech - bands[k].noise);
    }
    bands.total = { speech: r1(median(nucAll.map((f) => st.total[f]))), noise: r1(median(quiet.map((f) => st.total[f]))) };
    bands.total.snr = r1(bands.total.speech - bands.total.noise);

    // Average spectra (1024-point) of speech and of quiet, in coarse bands, and where the speech stops (the codec's ceiling).
    const ps = new Float64Array(513), spS = new Float64Array(513), spN = new Float64Array(513);
    nucAll.forEach((f) => { power(mono, f * hop + (hop >> 1) - 512, 1024, ps); for (let k = 0; k <= 512; k++) spS[k] += ps[k] / nucAll.length; });
    quiet.forEach((f) => { power(mono, f * hop + (hop >> 1) - 512, 1024, ps); for (let k = 0; k <= 512; k++) spN[k] += ps[k] / quiet.length; });
    const edges = [20, 60, 120, 250, 500, 1000, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000, 22050];
    const coarse = edges.slice(0, -1).map((lo, i) => {
      const hi = edges[i + 1], k0 = Math.max(1, Math.round((lo * 1024) / sr)), k1 = Math.min(512, Math.round((hi * 1024) / sr));
      let s1 = 0, s2 = 0;
      for (let k = k0; k <= k1; k++) { s1 += spS[k]; s2 += spN[k]; }
      return { band: `${lo}-${hi}`, speech: r1(db(s1)), noise: r1(db(s2)), snr: r1(db(s1) - db(s2)) };
    });
    let ref = 0;
    for (let k = Math.round((1000 * 1024) / sr); k <= Math.round((4000 * 1024) / sr); k++) ref = Math.max(ref, spS[k]);
    let ceiling = 0;
    for (let k = 512; k > 0; k--) if (db(spS[k]) > db(ref) - 75) { ceiling = Math.round((k * sr) / 1024); break; }

    // Hum: 16384-point average over long quiet stretches.
    const N2 = 16384, acc = new Float64Array(N2 / 2 + 1), p2 = new Float64Array(N2 / 2 + 1);
    let wins = 0, run = -1;
    for (let f = 0; f <= F; f++) {
      if (f < F && !busy[f]) { if (run < 0) run = f; continue; }
      if (run >= 0) {
        for (let s0 = run * hop; s0 + N2 <= f * hop; s0 += N2 / 2) { power(mono, s0, N2, p2); for (let k = 0; k <= N2 / 2; k++) acc[k] += p2[k]; wins++; }
        run = -1;
      }
    }
    const hz = sr / N2, binHz = (f) => Math.round(f / hz);
    const prominence = (f) => {
      const c = binHz(f);
      let pk = 0;
      for (let k = c - 2; k <= c + 2; k++) pk = Math.max(pk, acc[k]);
      const side = [];
      for (let k = binHz(f - 25); k <= binHz(f - 8); k++) side.push(acc[k]);
      for (let k = binHz(f + 8); k <= binHz(f + 25); k++) side.push(acc[k]);
      return r1(db(pk) - db(median(side)));
    };
    const hum = wins ? Object.fromEntries([50, 100, 150, 200, 250, 300, 60, 120, 180].map((f) => [f, prominence(f)])) : null;
    let tonal = [];
    if (wins) {
      for (let k = binHz(40); k <= binHz(4000); k++) {
        if (!(acc[k] >= acc[k - 1] && acc[k] >= acc[k + 1])) continue;
        const side = [];
        for (let j = k - Math.round(40 / hz); j <= k + Math.round(40 / hz); j++) if (Math.abs(j - k) > Math.round(6 / hz)) side.push(acc[j]);
        tonal.push({ hz: r0(k * hz), prom: r1(db(acc[k]) - db(median(side))), level: r1(db(acc[k])) });
      }
      tonal = tonal.sort((x, y) => y.prom - x.prom).slice(0, 8);
    }

    // Does the quiet creep up between items (automatic gain) or sink after each one (noise reduction)?
    const drift = [];
    for (let i = 0; i + 1 < utts.length; i++) {
      const g0 = utts[i].b + 15, g1 = utts[i + 1].a - 15;
      if (g1 - g0 < 90) continue;
      drift.push(median(range(g1 - 30, g1).map((f) => dRaw[f])) - median(range(g0, g0 + 30).map((f) => dRaw[f])));
    }
    // Right after each item: how fast the level falls away (a room's echo keeps it up).
    const tails = utts.map((u) => {
      const lvl = median(range(u.a, u.b).map((f) => dHp[f]).sort((x, y) => y - x).slice(0, 10));
      let f = u.b;
      while (f < Math.min(F, u.b + 60) && dHp[f] > seg.floor + 6) f++;
      return { from: r1(lvl - seg.floor), ms: (f - u.b) * 10 };
    });

    // Bumps: low thumps the speech filter ignores (the table, the phone, a door).
    const floorRaw = median(quiet.map((f) => dRaw[f]));
    const bumps = [];
    for (let f = 0; f < F; f++) {
      if (busy[f] || dRaw[f] < floorRaw + 12) continue;
      let g = f; while (g < F && !busy[g] && dRaw[g] >= floorRaw + 6) g++;
      let mx = -Infinity; for (let h = f; h < g; h++) mx = Math.max(mx, dRaw[h]);
      bumps.push({ t: f / 100, ms: (g - f) * 10, above: r1(mx - floorRaw) });
      f = g;
    }

    let sLL = 0, sRR = 0, sLR = 0, same = true;
    for (const u of utts) for (let i = u.a * hop; i < u.b * hop; i++) { sLL += L[i] * L[i]; sRR += R[i] * R[i]; sLR += L[i] * R[i]; if (same && L[i] !== R[i]) same = false; }
    let qL = 0, qR = 0;
    for (const f of quiet) for (let i = f * hop; i < (f + 1) * hop; i++) { qL += L[i] * L[i]; qR += R[i] * R[i]; }
    let filePeak = 0, fileClips = 0, dc = 0;
    for (let i = 0; i < n; i++) { const v = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (v > filePeak) filePeak = v; if (v >= 0.985) fileClips++; dc += mono[i]; }

    const gaps = items.slice(1).map((it) => it.gap);
    return {
      kind, duration: r1(n / sr), sampleRate: sr, channels: buffer.numberOfChannels,
      found: items.length, expected: LETTERS.length,
      firstStarts: items.length ? items[0].t0 : null, lastEnds: items.length ? r1(items[items.length - 1].t1) : null,
      gaps: { median: r0(median(gaps)), min: r0(Math.min(...gaps)), max: r0(Math.max(...gaps)) },
      vad: { floor: r1(seg.floor), top: r1(seg.top), on: r1(seg.on), off: r1(seg.off) },
      noiseFloorDbfs: r1(floorRaw), noiseFloorHpDbfs: r1(median(quiet.map((f) => dHp[f]))), quietSeconds: r1(quiet.length / 100),
      speechLevelDbfs: r1(median(items.map((i) => i.level))), filePeakDbfs: r1(db(filePeak * filePeak)), fileClips, dcOffset: dc / n,
      stereo: { identical: same, corr: Math.round((sLR / Math.sqrt(sLL * sRR)) * 1000) / 1000, leftMinusRightDb: r1(db(sLL) - db(sRR)), quietLeftMinusRightDb: r1(db(qL) - db(qR)) },
      bands, coarse, ceilingHz: ceiling, hum, tonal, humWindows: wins,
      drift: { gaps: drift.length, median: r1(median(drift)), min: r1(Math.min(...drift)), max: r1(Math.max(...drift)) },
      tails: { medianMs: r0(median(tails.map((t) => t.ms))), maxMs: Math.max(...tails.map((t) => t.ms)) },
      events: events.map((e) => ({ t: e.a / 100, ms: (e.b - e.a) * 10, above: r1(e.maxDb - seg.floor), voicedFrames: e.voicedFrames })),
      bumps,
      items: items.map((it, i) => { const { _mfcc, ...rest } = it; return { ...rest, label: labelOf(kind, i) }; }),
      _buffer: buffer,
      _dtw: dtwAll,
      // Syllables inside a stretch (seconds): each loud voiced run, what comes before it (hiss S, other voicing), its vowel.
      syllables: (from, to) => {
        const g0 = Math.max(0, Math.round(from * 100)), g1 = Math.min(F, Math.round(to * 100));
        let mx = -Infinity;
        for (let f = g0; f < g1; f++) mx = Math.max(mx, dHp[f]);
        const isV = (f) => voiced(f) && dHp[f] > mx - 14;
        const runs = [];
        let s = -1, last = -1;
        for (let f = g0; f < g1; f++) {
          if (!isV(f)) continue;
          if (s < 0) s = f; else if (f - last > 4) { runs.push([s, last + 1]); s = f; }
          last = f;
        }
        if (s >= 0) runs.push([s, last + 1]);
        let prev = g0;
        return runs.filter(([a, b]) => b - a >= 5).map(([a, b]) => {
          const on = range(prev, a), lvl = median(range(a, b).map((f) => st.total[f]));
          const fm = (lo, hi) => range(lo, hi).map((f) => f12(formants(dec.x, dec.sr, atDec(f)))).filter(Boolean);
          const mid = fm(a + Math.floor((b - a) * 0.25), b - Math.floor((b - a) * 0.25)), early = fm(a, Math.min(b, a + 4)), late = fm(Math.max(a, b - 4), b);
          const f0s = range(a, b).filter(voiced).map((f) => pitch[f].f0);
          const out = {
            t: (a / 100).toFixed(2), ms: (b - a) * 10, before: (a - prev) * 10,
            hiss: on.filter((f) => dHp[f] > seg.floor + 12 && !voiced(f) && st.band.hf[f] - st.total[f] > -10).length * 10,
            buzz: on.filter((f) => voiced(f) && dHp[f] > seg.floor + 12).length * 10,
            onHf: on.length ? r0(Math.max(...on.map((f) => st.band.hf[f])) - lvl) : null,
            F: `${r0(median(mid.map((v) => v[0])))}/${r0(median(mid.map((v) => v[1])))}`,
            F2: `${r0(median(early.map((v) => v[1])))}>${r0(median(late.map((v) => v[1])))}`,
            f0: `${r0(median(f0s.slice(0, 3)))}>${r0(median(f0s.slice(-3)))}`, lvl: r0(median(range(a, b).map((f) => dHp[f]))),
          };
          prev = b;
          return out;
        });
      },
      // Frame by frame (10 ms), for a closer look at one stretch: frames(from, to) in seconds.
      frames: (from, to) => range(Math.max(0, Math.round(from * 100)), Math.min(F, Math.round(to * 100))).map((f) => [
        (f / 100).toFixed(2), r0(dHp[f]), r0(st.total[f]), r0(st.band.hf[f] - st.total[f]), r0(st.band.sub[f] - st.total[f]),
        voiced(f) ? r0(pitch[f].f0) : '-', pitch[f] ? Math.round(pitch[f].ap * 100) / 100 : '-'].join(' ')).join('\n'),
    };
  }

  // ---------------------------------------------------------------- the page
  const status = document.getElementById('status');
  const host = document.getElementById('files');
  const NOTES = window.CHECK_NOTES || {};
  let ctx = null, current = null;

  function play(buffer, t0, t1, row) {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    if (current) { current.onended = null; try { current.stop(); } catch {} document.querySelectorAll('.playing').forEach((el) => el.classList.remove('playing')); }
    const from = Math.max(0, t0 - 0.12), to = Math.min(buffer.duration, t1 + 0.2);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start(0, from, to - from);
    current = src;
    if (row) row.classList.add('playing');
    src.onended = () => { if (row) row.classList.remove('playing'); current = null; };
  }

  function render(rec, res) {
    const sec = document.createElement('section');
    sec.className = 'file';
    sec.id = rec.id;
    const notes = NOTES[rec.id] || {};
    const fileNote = notes.file ? `<p class="file-note">${notes.file}</p>` : '';
    sec.innerHTML = `<h2>${rec.title} <span class="fname">${rec.file}</span></h2>
      <p class="sum">${res.duration} s · found <strong>${res.found}</strong> items (the script has ${res.expected}) · gaps ${res.gaps.median} ms typical
      (${res.gaps.min}–${res.gaps.max}) · speech ${res.speechLevelDbfs} dBFS, peak ${res.filePeakDbfs} dBFS · background ${res.noiseFloorDbfs} dBFS</p>${fileNote}`;
    const ol = document.createElement('ol');
    const TAGS = { redo: 'redo?', listen: 'listen', mark: 'mark name', skip: 'cut' };
    res.items.forEach((it) => {
      const li = document.createElement('li');
      const note = (notes.items || {})[it.n];
      const label = note ? { ar: note.ar, en: note.en } : it.label;
      if (note && note.level) li.classList.add(note.level);
      const btn = document.createElement('button');
      btn.className = 'play';
      btn.textContent = '▶';
      btn.setAttribute('aria-label', `Play item ${it.n}`);
      btn.addEventListener('click', () => play(res._buffer, it.t0, it.t1, li));
      li.innerHTML = `<span class="n">${it.n}</span>`;
      li.append(btn);
      const lab = document.createElement('span');
      lab.className = 'lab';
      lab.innerHTML = `${label.ar ? `<span class="ar" lang="ar" dir="rtl">${label.ar}</span> ` : ''}<span class="en">${label.en}</span>`;
      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.innerHTML = `${note && note.level ? `<span class="tag">${TAGS[note.level]}</span> ` : ''}${it.t0.toFixed(1)} s · ${(it.dur / 1000).toFixed(1)} s long`;
      li.append(lab, meta);
      if (note && note.note) { const p = document.createElement('p'); p.className = 'note'; p.textContent = note.note; li.append(p); }
      ol.append(li);
    });
    sec.append(ol);
    host.append(sec);
  }

  window.__analysis = { files: {}, ready: false };
  window.__done = (async () => {
    for (const rec of [...RECORDINGS, OLD]) {
      status.textContent = `Measuring ${rec.file}…`;
      const data = await fetch(rec.url).then((r) => { if (!r.ok) throw new Error(`${r.status} for ${rec.url}`); return r.arrayBuffer(); });
      const buffer = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(data);
      const t = performance.now();
      const res = analyse(buffer, rec.kind);
      res.ms = Math.round(performance.now() - t);
      window.__analysis.files[rec.id] = res;
      if (rec.id !== 'old' || NOTES.showOld) render(rec, res);
    }
    status.textContent = '';
    window.__analysis.ready = true;
    return true;
  })().catch((e) => { status.textContent = `Could not measure: ${e.message}`; window.__analysis.error = e.message; throw e; });
})();
