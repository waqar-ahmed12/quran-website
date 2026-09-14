// Reads an MP4's structure without decoding any pictures: tracks, codec, colour settings, exact frame timing,
// keyframes, and every frame's size in bytes. In a locked-off shot a frame's size follows how much changed since
// the frame before, so the sizes show where the motion starts and stops and any held (repeated) frames.
// Read-only, no dependencies. Safe on this PC (only node runs).
//
//   node videos/inspect-video.js "C:\Users\Waqar Ahmed\Downloads\clip.mp4" [--json out.json]

const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.log('Usage: node videos/inspect-video.js <video.mp4> [--json out.json]');
  process.exit(1);
}
const jsonAt = process.argv.indexOf('--json');
const buf = fs.readFileSync(file);

// Boxes ---------------------------------------------------------------------------------------------------------

const CONTAINERS = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'udta', 'dinf', 'mvex', 'moof', 'traf', 'ilst']);

function boxes(start, end) {
  const out = [];
  let p = start;
  while (p + 8 <= end) {
    let size = buf.readUInt32BE(p);
    const type = buf.toString('latin1', p + 4, p + 8);
    let header = 8;
    if (size === 1) {
      size = Number(buf.readBigUInt64BE(p + 8));
      header = 16;
    } else if (size === 0) size = end - p;
    if (size < header || p + size > end) {
      out.push({ type, start: p, size, bad: true });
      break;
    }
    const box = { type, start: p, size, body: p + header, end: p + size, children: [] };
    if (CONTAINERS.has(type)) box.children = boxes(box.body, box.end);
    if (type === 'meta') box.children = boxes(box.body + 4, box.end); // a full box: 4 bytes of version and flags first
    out.push(box);
    p += size;
  }
  return out;
}

const find = (list, type) => list.find((b) => b.type === type);
const findPath = (box, ...types) => types.reduce((b, t) => b && find(b.children, t), box);
const u8 = (p) => buf[p];
const u16 = (p) => buf.readUInt16BE(p);
const u32 = (p) => buf.readUInt32BE(p);
const i32 = (p) => buf.readInt32BE(p);
const u64 = (p) => Number(buf.readBigUInt64BE(p));
const i64 = (p) => Number(buf.readBigInt64BE(p));

const top = boxes(0, buf.length);

function tree(list, depth = 0, lines = []) {
  for (const b of list) {
    lines.push(`${'  '.repeat(depth)}${b.type} ${b.size.toLocaleString()} bytes${b.bad ? ' (damaged)' : ''}`);
    if (b.type !== 'stsd' && depth < 6) tree(b.children || [], depth + 1, lines);
  }
  return lines;
}

// Bits (H.264 headers) --------------------------------------------------------------------------------------------

function rbsp(bytes) {
  const out = [];
  let zeros = 0;
  for (const b of bytes) {
    if (zeros >= 2 && b === 3) {
      zeros = 0;
      continue;
    }
    out.push(b);
    zeros = b === 0 ? zeros + 1 : 0;
  }
  return Buffer.from(out);
}

class Bits {
  constructor(b) {
    this.b = b;
    this.p = 0;
  }
  u(n) {
    let v = 0;
    for (let i = 0; i < n; i++) {
      const byte = this.b[this.p >> 3];
      if (byte === undefined) throw new Error('ran out of bits');
      v = v * 2 + ((byte >> (7 - (this.p & 7))) & 1);
      this.p++;
    }
    return v;
  }
  ue() {
    let z = 0;
    while (this.u(1) === 0) if (++z > 31) throw new Error('bad exp-golomb');
    return 2 ** z - 1 + (z ? this.u(z) : 0);
  }
  se() {
    const k = this.ue();
    return k & 1 ? (k + 1) / 2 : -k / 2;
  }
}

const PRIMARIES = { 1: 'BT.709', 2: 'unspecified', 5: 'BT.601 PAL', 6: 'BT.601 NTSC', 9: 'BT.2020', 12: 'Display P3' };
const TRANSFER = { 1: 'BT.709', 2: 'unspecified', 6: 'BT.601', 13: 'sRGB', 16: 'PQ (HDR)', 18: 'HLG (HDR)' };
const MATRIX = { 0: 'RGB', 1: 'BT.709', 2: 'unspecified', 5: 'BT.601 PAL', 6: 'BT.601 NTSC', 9: 'BT.2020' };
const name = (table, v) => `${v} ${table[v] || ''}`.trim();

function parseSps(nal) {
  const r = new Bits(rbsp(nal.subarray(1)));
  const sps = { profile: r.u(8) };
  r.u(8); // constraint flags
  sps.level = r.u(8) / 10;
  r.ue();
  sps.chroma = 1;
  sps.bitDepth = 8;
  if ([100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134, 135].includes(sps.profile)) {
    sps.chroma = r.ue();
    if (sps.chroma === 3) r.u(1);
    sps.bitDepth = r.ue() + 8;
    r.ue();
    r.u(1);
    if (r.u(1)) {
      for (let i = 0; i < (sps.chroma !== 3 ? 8 : 12); i++) {
        if (!r.u(1)) continue;
        let last = 8;
        let next = 8;
        for (let j = 0; j < (i < 6 ? 16 : 64); j++) {
          if (next !== 0) next = (last + r.se() + 256) % 256;
          last = next === 0 ? last : next;
        }
      }
    }
  }
  r.ue(); // log2_max_frame_num
  const pocType = r.ue();
  if (pocType === 0) r.ue();
  else if (pocType === 1) {
    r.u(1);
    r.se();
    r.se();
    const n = r.ue();
    for (let i = 0; i < n; i++) r.se();
  }
  sps.refFrames = r.ue();
  r.u(1);
  const mbW = r.ue() + 1;
  const mbH = r.ue() + 1;
  const frameOnly = r.u(1);
  if (!frameOnly) r.u(1);
  r.u(1);
  sps.coded = `${mbW * 16}x${mbH * 16 * (2 - frameOnly)}`;
  sps.crop = r.u(1) ? [r.ue(), r.ue(), r.ue(), r.ue()] : null; // left right top bottom, in chroma units
  sps.interlaced = !frameOnly;
  if (r.u(1)) {
    const vui = {};
    if (r.u(1)) {
      const idc = r.u(8);
      vui.sar = idc === 255 ? `${r.u(16)}:${r.u(16)}` : `idc ${idc}`;
    }
    if (r.u(1)) r.u(1);
    if (r.u(1)) {
      r.u(3);
      vui.fullRange = !!r.u(1);
      if (r.u(1)) {
        vui.primaries = r.u(8);
        vui.transfer = r.u(8);
        vui.matrix = r.u(8);
      }
    }
    if (r.u(1)) {
      r.ue();
      r.ue();
    }
    if (r.u(1)) {
      const tick = r.u(32);
      const scale = r.u(32);
      vui.timing = `${scale}/${tick * 2} fps, fixed rate: ${!!r.u(1)}`;
    }
    sps.vui = vui;
  }
  return sps;
}

const SLICE = ['P', 'B', 'I', 'SP', 'SI'];

// Tracks --------------------------------------------------------------------------------------------------------

const moov = find(top, 'moov');
if (!moov) {
  console.log('No moov box: not a playable MP4, or the file is cut short.');
  process.exit(1);
}
const mvhd = find(moov.children, 'mvhd');
const mv = { v: u8(mvhd.body) };
mv.timescale = u32(mvhd.body + (mv.v ? 20 : 12));
mv.duration = mv.v ? u64(mvhd.body + 24) : u32(mvhd.body + 16);
const created = mv.v ? u64(mvhd.body + 4) : u32(mvhd.body + 4);

const report = { file: path.basename(file), bytes: buf.length, tracks: [] };
const out = [];
const say = (s = '') => out.push(s);

say(`File        ${path.basename(file)}  ${buf.length.toLocaleString()} bytes (${(buf.length / 1048576).toFixed(2)} MB)`);
const ftyp = find(top, 'ftyp');
if (ftyp) {
  const brands = [];
  for (let p = ftyp.body + 8; p + 4 <= ftyp.end; p += 4) brands.push(buf.toString('latin1', p, p + 4));
  say(`Brand       ${buf.toString('latin1', ftyp.body, ftyp.body + 4)} (compatible: ${brands.join(', ')})`);
}
say(`Layout      ${top.map((b) => `${b.type} ${b.size.toLocaleString()}`).join(' | ')}`);
const moovFirst = top.indexOf(moov) < top.findIndex((b) => b.type === 'mdat');
say(`moov        ${moovFirst ? 'before' : 'after'} the picture data (${moovFirst ? 'starts playing before fully downloaded' : 'a browser must fetch the end first'})`);
say(`Duration    ${(mv.duration / mv.timescale).toFixed(4)} s (movie timescale ${mv.timescale})`);
if (created) say(`Created     ${new Date(Date.UTC(1904, 0, 1) + created * 1000).toISOString()} (as written in the file)`);
if (find(moov.children, 'mvex')) say('NOTE        fragmented MP4: the frame table below may be incomplete');

for (const trak of moov.children.filter((b) => b.type === 'trak')) {
  const tkhd = find(trak.children, 'tkhd');
  const tv = u8(tkhd.body);
  const m = tv ? tkhd.body + 52 : tkhd.body + 40;
  const matrix = [i32(m), i32(m + 4), i32(m + 12), i32(m + 16)].map((x) => x / 65536);
  const tw = u32(tkhd.body + (tv ? 88 : 76)) / 65536;
  const th = u32(tkhd.body + (tv ? 92 : 80)) / 65536;

  const mdia = find(trak.children, 'mdia');
  const mdhd = find(mdia.children, 'mdhd');
  const mdv = u8(mdhd.body);
  const timescale = u32(mdhd.body + (mdv ? 20 : 12));
  const duration = mdv ? u64(mdhd.body + 24) : u32(mdhd.body + 16);
  const hdlr = find(mdia.children, 'hdlr');
  const handler = buf.toString('latin1', hdlr.body + 8, hdlr.body + 12);
  const handlerName = buf.toString('latin1', hdlr.body + 24, hdlr.end).replace(/\0.*$/s, '');

  const stbl = findPath(mdia, 'minf', 'stbl');
  const stsd = find(stbl.children, 'stsd');
  const entry = stsd.body + 8;
  const fourcc = buf.toString('latin1', entry + 4, entry + 8);
  const track = { handler, fourcc, timescale, duration: duration / timescale };
  report.tracks.push(track);

  say();
  say(`TRACK ${report.tracks.length}     ${handler === 'vide' ? 'video' : handler === 'soun' ? 'audio' : handler} "${handlerName}", codec ${fourcc}, ${(duration / timescale).toFixed(4)} s, timescale ${timescale}`);

  const elst = findPath(trak, 'edts', 'elst');
  let mediaStart = 0;
  if (elst) {
    const ev = u8(elst.body);
    const n = u32(elst.body + 4);
    const parts = [];
    for (let i = 0, p = elst.body + 8; i < n; i++, p += ev ? 20 : 12) {
      const segment = ev ? u64(p) : u32(p);
      const media = ev ? i64(p + 8) : i32(p + 4);
      if (i === 0 && media > 0) mediaStart = media;
      parts.push(media < 0 ? `empty ${(segment / mv.timescale).toFixed(3)} s` : `from ${(media / timescale).toFixed(4)} s for ${(segment / mv.timescale).toFixed(3)} s`);
    }
    say(`  edit list ${parts.join('; ')}`);
  }

  let avc = null;
  if (handler === 'vide') {
    const w = u16(entry + 32);
    const h = u16(entry + 34);
    const cn = buf.toString('latin1', entry + 51, entry + 51 + Math.min(31, u8(entry + 50)));
    say(`  picture   ${w}x${h}${tw && (tw !== w || th !== h) ? ` (shown at ${tw}x${th})` : ''}${cn ? `, compressor "${cn}"` : ''}, rotation matrix [${matrix.join(', ')}]`);
    Object.assign(track, { width: w, height: h });
    for (const child of boxes(entry + 86, entry + u32(entry))) {
      const b = child.body;
      if (child.type === 'avcC') {
        avc = { lengthSize: (u8(b + 4) & 3) + 1, sps: [] };
        let p = b + 6;
        for (let i = 0, n = u8(b + 5) & 31; i < n; i++) {
          const len = u16(p);
          avc.sps.push(buf.subarray(p + 2, p + 2 + len));
          p += 2 + len;
        }
        for (const nal of avc.sps) {
          try {
            const s = parseSps(nal);
            const v = s.vui || {};
            say(`  H.264     profile ${s.profile} (${{ 66: 'Baseline', 77: 'Main', 100: 'High', 110: 'High 10', 122: 'High 4:2:2', 244: 'High 4:4:4' }[s.profile] || '?'}), level ${s.level}, chroma ${['mono', '4:2:0', '4:2:2', '4:4:4'][s.chroma]}, ${s.bitDepth}-bit, ${s.interlaced ? 'INTERLACED' : 'progressive'}, ref frames ${s.refFrames}`);
            say(`  coded     ${s.coded}${s.crop ? `, cropped l${s.crop[0] * 2} r${s.crop[1] * 2} t${s.crop[2] * 2} b${s.crop[3] * 2} px` : ''}${v.sar ? `, pixel aspect ${v.sar}` : ''}`);
            say(`  colour    range ${v.fullRange === undefined ? 'not stated (limited assumed)' : v.fullRange ? 'FULL' : 'limited (16-235)'}, primaries ${v.primaries === undefined ? 'not stated' : name(PRIMARIES, v.primaries)}, transfer ${v.transfer === undefined ? 'not stated' : name(TRANSFER, v.transfer)}, matrix ${v.matrix === undefined ? 'not stated' : name(MATRIX, v.matrix)}`);
            if (v.timing) say(`  timing    ${v.timing} (from the stream header)`);
            Object.assign(track, { profile: s.profile, level: s.level, bitDepth: s.bitDepth, chroma: s.chroma, vui: v });
          } catch (e) {
            say(`  H.264     sequence header unreadable: ${e.message}`);
          }
        }
      } else if (child.type === 'hvcC') {
        say(`  HEVC      profile ${u8(b + 1) & 31}, level ${u8(b + 12) / 30}, chroma ${['mono', '4:2:0', '4:2:2', '4:4:4'][u8(b + 16) & 3]}, ${(u8(b + 17) & 7) + 8}-bit (HEVC does not play in every browser)`);
      } else if (child.type === 'colr') {
        const kind = buf.toString('latin1', b, b + 4);
        if (kind === 'nclx') say(`  colr box  primaries ${name(PRIMARIES, u16(b + 4))}, transfer ${name(TRANSFER, u16(b + 6))}, matrix ${name(MATRIX, u16(b + 8))}, range ${u8(b + 10) >> 7 ? 'FULL' : 'limited'}`);
        else say(`  colr box  ${kind} (embedded ICC profile)`);
      } else if (child.type === 'pasp') {
        say(`  pasp      pixel aspect ${u32(b)}:${u32(b + 4)}`);
      } else if (child.type === 'btrt') {
        say(`  btrt      max ${Math.round(u32(b + 4) / 1000)} kbps, average ${Math.round(u32(b + 8) / 1000)} kbps`);
      } else {
        say(`  box       ${child.type} ${child.size} bytes`);
      }
    }
  } else if (handler === 'soun') {
    say(`  sound     ${u16(entry + 24)} channel(s), ${u32(entry + 32) / 65536} Hz`);
  }

  // Sample table
  const stsz = find(stbl.children, 'stsz');
  const count = u32(stsz.body + 8);
  const fixed = u32(stsz.body + 4);
  const sizes = Array.from({ length: count }, (_, i) => fixed || u32(stsz.body + 12 + i * 4));

  const dts = [];
  const deltas = new Map();
  const stts = find(stbl.children, 'stts');
  let t = 0;
  for (let i = 0, n = u32(stts.body + 4); i < n; i++) {
    const c = u32(stts.body + 8 + i * 8);
    const d = u32(stts.body + 12 + i * 8);
    deltas.set(d, (deltas.get(d) || 0) + c);
    for (let k = 0; k < c; k++, t += d) dts.push(t);
  }
  const cto = new Array(count).fill(0);
  const ctts = find(stbl.children, 'ctts');
  if (ctts) {
    const cv = u8(ctts.body);
    let s = 0;
    for (let i = 0, n = u32(ctts.body + 4); i < n; i++) {
      const c = u32(ctts.body + 8 + i * 8);
      const o = cv ? i32(ctts.body + 12 + i * 8) : u32(ctts.body + 12 + i * 8);
      for (let k = 0; k < c; k++) cto[s++] = o;
    }
  }
  const stss = find(stbl.children, 'stss');
  const sync = new Set();
  if (stss) for (let i = 0, n = u32(stss.body + 4); i < n; i++) sync.add(u32(stss.body + 8 + i * 4) - 1);
  else for (let i = 0; i < count; i++) sync.add(i);

  const offsets = [];
  const stco = find(stbl.children, 'stco') || find(stbl.children, 'co64');
  const wide = stco.type === 'co64';
  const chunks = Array.from({ length: u32(stco.body + 4) }, (_, i) => (wide ? u64(stco.body + 8 + i * 8) : u32(stco.body + 8 + i * 4)));
  const stsc = find(stbl.children, 'stsc');
  const runs = Array.from({ length: u32(stsc.body + 4) }, (_, i) => ({ first: u32(stsc.body + 8 + i * 12), per: u32(stsc.body + 12 + i * 12) }));
  for (let c = 0, s = 0; c < chunks.length && s < count; c++) {
    let per = 0;
    for (const r of runs) if (r.first <= c + 1) per = r.per;
    for (let k = 0, p = chunks[c]; k < per && s < count; k++, s++) {
      offsets.push(p);
      p += sizes[s];
    }
  }

  const total = sizes.reduce((a, b) => a + b, 0);
  const common = [...deltas.entries()].sort((a, b) => b[1] - a[1]);
  say(`  samples   ${count}, ${deltas.size === 1 ? 'every one' : 'most'} ${common[0][0]}/${timescale} s long = ${(timescale / common[0][0]).toFixed(3)} per second${deltas.size > 1 ? `, OTHER LENGTHS: ${common.slice(1).map(([d, c]) => `${c}x ${d}`).join(', ')}` : ''}`);
  say(`  bitrate   ${Math.round((total * 8) / (duration / timescale) / 1000)} kbps average, ${(total / 1048576).toFixed(2)} MB of ${handler === 'vide' ? 'picture' : 'sound'} data`);
  Object.assign(track, { samples: count, fps: timescale / common[0][0], constantRate: deltas.size === 1 });

  if (handler !== 'vide') continue;

  say(`  keyframes ${sync.size} of ${count}${ctts ? ', with reordered frames (B-frames)' : ', no reordered frames'}`);

  // Each frame: its slice types, and any text the encoder left in the stream
  const frames = [];
  const notes = new Set();
  const nalCounts = {};
  for (let i = 0; i < count; i++) {
    const types = new Set();
    let p = offsets[i];
    const end = p + sizes[i];
    const L = avc ? avc.lengthSize : 4;
    while (p + L <= end) {
      const len = L === 4 ? u32(p) : L === 2 ? u16(p) : u8(p);
      const nal = buf.subarray(p + L, p + L + len);
      p += L + len;
      if (!nal.length) continue;
      if (fourcc.startsWith('avc')) {
        const kind = nal[0] & 31;
        nalCounts[kind] = (nalCounts[kind] || 0) + 1;
        if (kind === 1 || kind === 5) {
          try {
            const r = new Bits(rbsp(nal.subarray(1, 40)));
            r.ue();
            types.add(SLICE[r.ue() % 5]);
          } catch {
            types.add('?');
          }
        } else if (kind === 6) {
          const text = rbsp(nal).toString('latin1').replace(/[^\x20-\x7e]+/g, ' ').trim();
          for (const part of text.split('  ')) if (part.length >= 12) notes.add(part.slice(0, 400));
        }
      } else {
        types.add(`nal${(nal[0] >> 1) & 63}`);
      }
    }
    frames.push({
      decode: i,
      pts: (dts[i] + cto[i] - mediaStart) / timescale,
      size: sizes[i],
      key: sync.has(i),
      type: [...types].join('') || '-',
    });
  }
  frames.sort((a, b) => a.pts - b.pts);
  frames.forEach((f, k) => (f.index = k));
  track.frames = frames;
  say(`  NAL types ${Object.entries(nalCounts).map(([k, v]) => `${{ 1: 'slice', 5: 'IDR', 6: 'SEI', 7: 'SPS', 8: 'PPS', 9: 'AUD', 12: 'filler' }[k] || `type${k}`} ${v}`).join(', ')}`);
  for (const n of notes) say(`  encoder   "${n}"`);

  // Frame table, in the order they are shown
  const byType = {};
  for (const f of frames) if (!f.key) (byType[f.type] ||= []).push(f.size);
  const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const medians = Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, median(v)]));
  say(`  median    ${Object.entries(medians).map(([k, v]) => `${k} ${v.toLocaleString()} bytes`).join(', ')}`);
  const biggest = Math.max(...frames.filter((f) => !f.key).map((f) => f.size));
  say();
  say('  frame  time s  type   bytes  (bar = bytes; # keyframe, bar scaled to the largest non-key frame)');
  for (const f of frames) {
    const bar = f.key ? '#' : '='.repeat(Math.max(f.size > 0 ? 1 : 0, Math.round((f.size / biggest) * 50)));
    say(`  ${String(f.index).padStart(5)}  ${f.pts.toFixed(3).padStart(6)}  ${f.type.padEnd(4)} ${String(f.size).padStart(7)}  ${bar}`);
  }
}

// Text outside the picture data: encoder tags, content credentials, etc.
const strings = new Set();
for (const b of top.filter((x) => x.type !== 'mdat')) {
  const text = buf.toString('latin1', b.start, b.end);
  for (const m of text.matchAll(/[\x20-\x7e]{6,}/g)) strings.add(m[0].trim().slice(0, 160));
}
say();
say(`Text in the file's headers (${strings.size}):`);
for (const s of [...strings].slice(0, 80)) say(`  ${s}`);
say();
say('Box tree:');
for (const line of tree(top)) say(`  ${line}`);

console.log(out.join('\n'));
if (jsonAt > 0) {
  fs.writeFileSync(process.argv[jsonAt + 1], JSON.stringify(report, null, 1));
  console.log(`\nSaved ${process.argv[jsonAt + 1]}`);
}
