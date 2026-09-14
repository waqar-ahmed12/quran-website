// Measures the exported light-mode frames (export-light-frames.ps1) and makes contact sheets, so the footage can be
// checked frame by frame: how much each frame changes, whether the background or light shifts, where the book is,
// and anything in the corners. Only reads the frames; writes sheets and report.json. No dependencies.
//
//   node videos/analyze-light-frames.js                                        report + overview sheets
//   node videos/analyze-light-frames.js --sheet <name> x,y,w,h first-last[:step] [scale]   zoomed sheet of one area

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// FRAMES and FRAMES_OUT point it at other folders, e.g. to test it on a few frames.
const DIR = process.env.FRAMES || path.join(__dirname, 'light-frames', 'raw');
const OUT = process.env.FRAMES_OUT || path.join(__dirname, 'light-frames');

// PNG ---------------------------------------------------------------------------------------------------------------

function readPng(file) {
  const b = fs.readFileSync(file);
  const idat = [];
  let w, h, bpp;
  for (let p = 8; p < b.length; ) {
    const len = b.readUInt32BE(p);
    const type = b.toString('latin1', p + 4, p + 8);
    const d = b.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      [w, h, bpp] = [d.readUInt32BE(0), d.readUInt32BE(4), { 0: 1, 2: 3, 4: 2, 6: 4 }[d[9]]];
      if (d[8] !== 8 || d[12]) throw new Error(`${file}: only 8-bit, non-interlaced PNG is supported`);
    } else if (type === 'IDAT') idat.push(d);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(w * h * 3);
  const stride = w * bpp;
  let prev = Buffer.alloc(stride);
  let cur = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const start = y * (stride + 1);
    const filter = raw[start];
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const up = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v = raw[start + 1 + x];
      if (filter === 1) v += a;
      else if (filter === 2) v += up;
      else if (filter === 3) v += (a + up) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(up - c);
        const pb = Math.abs(a - c);
        const pc = Math.abs(a + up - 2 * c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c;
      }
      cur[x] = v;
    }
    for (let x = 0, o = y * w * 3; x < w; x++, o += 3) {
      const s = x * bpp;
      if (bpp >= 3) [px[o], px[o + 1], px[o + 2]] = [cur[s], cur[s + 1], cur[s + 2]];
      else px[o] = px[o + 1] = px[o + 2] = cur[s];
    }
    [prev, cur] = [cur, prev];
  }
  return { w, h, px };
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'latin1');
  data.copy(out, 8);
  let c = 0xffffffff;
  for (let i = 4; i < 8 + data.length; i++) c = CRC[(c ^ out[i]) & 255] ^ (c >>> 8);
  out.writeUInt32BE((c ^ 0xffffffff) >>> 0, 8 + data.length);
  return out;
}
function writePng(file, w, h, px) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) px.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  fs.writeFileSync(file, Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}

// Sheets ------------------------------------------------------------------------------------------------------------

// 3x5 digits for tile labels.
const DIGITS = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001',
  '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111'];

function label(sheet, sw, x0, y0, text, size = 3) {
  const boxW = (text.length * 4 + 1) * size;
  for (let y = 0; y < 7 * size; y++) for (let x = 0; x < boxW; x++) sheet.fill(0, ((y0 + y) * sw + x0 + x) * 3, ((y0 + y) * sw + x0 + x) * 3 + 3);
  [...text].forEach((ch, k) => {
    for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) {
      if (DIGITS[+ch][r * 3 + q] !== '1') continue;
      for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) {
        const o = ((y0 + (r + 1) * size + dy) * sw + x0 + (k * 4 + 1 + q) * size + dx) * 3;
        [sheet[o], sheet[o + 1], sheet[o + 2]] = [255, 60, 60];
      }
    }
  });
}

// Tiles an area of the chosen frames into one image, frame numbers in the corner.
function makeSheet(name, indices, crop, scale, most) {
  const cols = Math.min(most, indices.length);
  const tw = Math.round(crop.w * scale);
  const th = Math.round(crop.h * scale);
  const rows = Math.ceil(indices.length / cols);
  const gap = 4;
  const sw = cols * (tw + gap) - gap;
  const sh = rows * (th + gap) - gap;
  const sheet = Buffer.alloc(sw * sh * 3, 40);
  const k = scale < 1 ? Math.max(1, Math.round(1 / scale)) : 1; // box-average when shrinking
  indices.forEach((i, n) => {
    const { w, px } = readPng(path.join(DIR, file(i)));
    const ox = (n % cols) * (tw + gap);
    const oy = Math.floor(n / cols) * (th + gap);
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
      const sx = crop.x + Math.floor(x / scale);
      const sy = crop.y + Math.floor(y / scale);
      let r = 0, g = 0, b = 0;
      for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) {
        const o = ((sy + dy) * w + sx + dx) * 3;
        r += px[o]; g += px[o + 1]; b += px[o + 2];
      }
      const o = ((oy + y) * sw + ox + x) * 3;
      [sheet[o], sheet[o + 1], sheet[o + 2]] = [r / (k * k), g / (k * k), b / (k * k)];
    }
    label(sheet, sw, ox, oy, String(i), tw < 200 ? 2 : 3);
  });
  const dest = path.join(OUT, `sheet-${name}.png`);
  writePng(dest, sw, sh, sheet);
  console.log(`Saved ${dest} (${sw}x${sh}, ${indices.length} frames, ${cols} across)`);
}

const file = (i) => `f${String(i).padStart(3, '0')}.png`;
const frameCount = fs.readdirSync(DIR).filter((f) => /^f\d{3}\.png$/.test(f)).length;

if (process.argv[2] === '--sheet') {
  const [, , , name, area, range, scaleArg] = process.argv;
  const [x, y, w, h] = area.split(',').map(Number);
  const [span, step = '1'] = range.split(':');
  const [a, b] = span.split('-').map(Number);
  const indices = [];
  for (let i = a; i <= Math.min(b, frameCount - 1); i += +step) indices.push(i);
  const scale = Number(scaleArg) || 1;
  makeSheet(name, indices, { x, y, w, h }, scale, Math.max(1, Math.floor(2400 / (w * scale + 4))));
  process.exit(0);
}

// Measurements ------------------------------------------------------------------------------------------------------

const STEP = 4;       // sample every 4th pixel each way
const STRIP = 96;     // background strips at the left and right edges of the frame
const THRESHOLD = 18; // |r|+|g|+|b| difference from the background that counts as "not background"

const frames = [];
let last = null;
for (let i = 0; i < frameCount; i++) {
  const { w, h, px } = readPng(path.join(DIR, file(i)));
  const at = (x, y) => (y * w + x) * 3;

  // Background colour, from both edge strips
  let n = 0, R = 0, G = 0, B = 0, lum2 = 0;
  for (let y = 0; y < h; y += STEP) for (const x0 of [0, w - STRIP]) for (let x = x0; x < x0 + STRIP; x += STEP) {
    const o = at(x, y);
    R += px[o]; G += px[o + 1]; B += px[o + 2]; n++;
    lum2 += (px[o] + px[o + 1] + px[o + 2]) ** 2;
  }
  const bg = [R / n, G / n, B / n];
  const noise = Math.sqrt(lum2 / n - ((R + G + B) / n) ** 2);
  const corner = (cx, cy) => {
    let s = 0, m = 0;
    for (let y = cy; y < cy + 64; y += STEP) for (let x = cx; x < cx + 64; x += STEP) { const o = at(x, y); s += px[o] + px[o + 1] + px[o + 2]; m++; }
    return s / m / 3;
  };
  const corners = [corner(0, 0), corner(w - 64, 0), corner(0, h - 64), corner(w - 64, h - 64)];
  const off = (o) => Math.abs(px[o] - bg[0]) + Math.abs(px[o + 1] - bg[1]) + Math.abs(px[o + 2] - bg[2]);

  // Change since the previous frame, over the whole frame and over the background strips only
  let diff = 0, bgDiff = 0, dn = 0, bn = 0;
  if (last) {
    for (let y = 0; y < h; y += STEP) for (let x = 0; x < w; x += STEP) {
      const o = at(x, y);
      const d = Math.abs(px[o] - last[o]) + Math.abs(px[o + 1] - last[o + 1]) + Math.abs(px[o + 2] - last[o + 2]);
      diff += d; dn++;
      if (x < STRIP || x >= w - STRIP) { bgDiff += d; bn++; }
    }
  }

  // The book: columns, then rows, where enough samples stand out from the background
  const colHit = (x) => { let k = 0, m = 0; for (let y = Math.round(h * 0.2); y < h * 0.8; y += STEP) { if (off(at(x, y)) > THRESHOLD) k++; m++; } return k / m; };
  let left = -1, right = -1;
  for (let x = 0; x < w; x += 2) if (colHit(x) > 0.3) { if (left < 0) left = x; right = x; }
  let top = -1, bottom = -1;
  if (left >= 0) {
    for (let y = 0; y < h; y += 2) {
      let k = 0, m = 0;
      for (let x = left; x <= right; x += STEP) { if (off(at(x, y)) > THRESHOLD) k++; m++; }
      if (k / m > 0.3) { if (top < 0) top = y; bottom = y; }
    }
  }

  // Anything in the bottom-right corner, where a watermark would sit, away from the book
  let marks = 0;
  for (let y = h - 140; y < h; y += 2) for (let x = w - 260; x < w; x += 2) {
    if (x <= right + 24 && y <= bottom + 24) continue;
    if (off(at(x, y)) > 30) marks++;
  }

  frames.push({ i, bg: bg.map((v) => +v.toFixed(1)), noise: +noise.toFixed(2), corners: corners.map((v) => +v.toFixed(1)),
    diff: last ? +(diff / dn).toFixed(2) : null, bgDiff: last ? +(bgDiff / bn).toFixed(2) : null, left, right, top, bottom, marks });
  last = px;
  if (i % 48 === 0) process.stderr.write(`  measured ${i}/${frameCount}\n`);
}

// Report ------------------------------------------------------------------------------------------------------------

const say = console.log;
const diffs = frames.slice(1).map((f) => f.diff);
const maxDiff = Math.max(...diffs);
say(`${frameCount} frames. Change = mean |r|+|g|+|b| difference from the previous frame (0-765); bg = edge strips only.`);
say('frame  change  bg-chg  background rgb        noise  book left-right  top-bottom  width height  mark');
for (const f of frames) {
  const bar = f.diff === null ? '' : '='.repeat(Math.round((f.diff / maxDiff) * 30));
  say(`${String(f.i).padStart(5)}  ${String(f.diff ?? '-').padStart(6)}  ${String(f.bgDiff ?? '-').padStart(6)}  ${f.bg.map((v) => v.toFixed(1).padStart(5)).join(' ')}  ${f.noise.toFixed(2).padStart(5)}  ${String(f.left).padStart(5)}-${String(f.right).padEnd(5)}  ${String(f.top).padStart(4)}-${String(f.bottom).padEnd(4)}  ${String(f.right - f.left).padStart(5)} ${String(f.bottom - f.top).padStart(6)}  ${String(f.marks).padStart(4)}  ${bar}`);
}

say('');
const range = (key, k) => { const v = frames.map((f) => (k === undefined ? f[key] : f[key][k])); return `${Math.min(...v)}..${Math.max(...v)}`; };
say(`Background r ${range('bg', 0)}, g ${range('bg', 1)}, b ${range('bg', 2)}; corners (grey level) TL ${range('corners', 0)} TR ${range('corners', 1)} BL ${range('corners', 2)} BR ${range('corners', 3)}`);
say(`Book left ${range('left')}, right ${range('right')}, top ${range('top')}, bottom ${range('bottom')}`);
const flags = [];
for (let k = 2; k < frames.length - 1; k++) {
  const d = frames[k].diff;
  const around = (frames[k - 1].diff + frames[k + 1].diff) / 2;
  if (d < around * 0.2) flags.push(`${k}: almost no change from ${k - 1} (${d} vs ~${around.toFixed(2)} around it), a repeated frame?`);
  if (d > around * 2.2 && d > 1) flags.push(`${k}: jump from ${k - 1} (${d} vs ~${around.toFixed(2)} around it)`);
  if (frames[k].bgDiff > 3) flags.push(`${k}: the background itself changed (${frames[k].bgDiff})`);
}
say(flags.length ? `Flags:\n  ${flags.join('\n  ')}` : 'Flags: none (no repeated frames, jumps or background shifts found)');

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(frames));
const { w, h } = readPng(path.join(DIR, file(0)));
const every = [];
for (let i = 0; i < frameCount; i += 8) every.push(i);
if (every.at(-1) !== frameCount - 1) every.push(frameCount - 1);
makeSheet('every-8th', every, { x: 0, y: 0, w, h }, 1 / 6, 5);
makeSheet('all', [...Array(frameCount).keys()], { x: 0, y: 0, w, h }, 1 / 12, 12);
