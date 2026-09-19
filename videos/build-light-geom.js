// Writes the light frames' measurements into site/main.js, from the edges.json that make-light-frames.ps1
// leaves behind.
//
//   powershell -File videos/make-light-frames.ps1   (picks, resizes and measures the frames)
//   node videos/build-light-geom.js                 (this)
//
// The only thing main.js needs per frame is the book's right edge, which it centres the book on as it opens,
// the same way it does for the dark footage. That can't be measured in the browser the way measureRight does
// for dark: the ivory book is about three levels darker than its backdrop and its drop shadow is darker still,
// so there's no brightness to threshold on. The PowerShell script finds it by its sharpness instead.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const EDGES = path.join(__dirname, 'light-frames', 'edges.json');
const MAIN = path.join(root, 'site', 'main.js');

// PowerShell 5.1 writes UTF-8 with a byte order mark.
const edges = JSON.parse(fs.readFileSync(EDGES, 'utf8').replace(/^﻿/, ''));
const right = edges.right;
if (!Array.isArray(right) || right.length !== edges.frames.length) throw new Error('edges.json is malformed');

const main = fs.readFileSync(MAIN, 'utf8');
const eol = main.includes('\r\n') ? '\r\n' : '\n';
const size = main.match(/const SRC_W = (\d+);[\s\S]*?const SRC_H = (\d+);/);
if (+size[1] !== edges.width || +size[2] !== edges.height) {
  throw new Error(`The frames are ${edges.width}x${edges.height} but main.js draws ${size[1]}x${size[2]}`);
}

// The edge finder can lose the right edge and fall back near the fold. As the book flattens, a light washes the top
// of the pages, the true edge stops being the sharpest step in the row, and the strongest step left is the fold
// itself. It shows as a frame or two collapsing hundreds of pixels left and straight back (995, 642, 642, 1013),
// which would snap the book narrow and wide again just before it settles. The edge does drift left by a few pixels
// early on while the cover swings, but once it is past OPENING the book only widens, so a reading well below the
// last trusted one is dropped and filled in from its neighbours.
const OPENING = 700; // past here the book is unmistakably opening
const SLACK = 20;    // a drop bigger than this is the finder losing the edge, not the book moving
const bad = [];
let lastGood = right[0];
for (let i = 1; i < right.length; i++) {
  if (lastGood > OPENING && right[i] < lastGood - SLACK) bad.push(i);
  else lastGood = right[i];
}
for (const i of bad) {
  let before = i - 1;
  while (bad.includes(before)) before--;
  let after = i + 1;
  while (after < right.length && bad.includes(after)) after++;
  right[i] =
    after < right.length
      ? Math.round(right[before] + ((right[after] - right[before]) * (i - before)) / (after - before))
      : right[before];
}
if (bad.length) console.log(`Repaired ${bad.length} lost edge measurement(s), at frame(s) ${bad.join(', ')}.`);

// How far right the book reaches once open, as OPEN_RIGHT is for the dark footage: main.js sizes the book so
// that this still fits across the window.
const open = Math.max(...right);

const lines = [];
let line = '    ';
for (const v of right) {
  if (line.length > 110) {
    lines.push(line.trimEnd());
    line = '    ';
  }
  line += `${v}, `;
}
lines.push(line.trimEnd());

const block = [
  `  const LIGHT_OPEN_RIGHT = ${open}; // right edge fully open`,
  '  // The book\'s right edge in each frame, measured by videos/make-light-frames.ps1. main.js smooths these the',
  '  // same way it smooths the dark frames\' own measurements.',
  '  const rightsLight = [',
  ...lines,
  '  ];',
].join('\n');

const target = /  const LIGHT_OPEN_RIGHT = .*\r?\n(?:  \/\/.*\r?\n)*  const rightsLight = \[[\s\S]*?\];/;
if (!target.test(main)) throw new Error('Could not find the light frames block in site/main.js');
fs.writeFileSync(MAIN, main.replace(target, block.split('\n').join(eol)));

console.log(`${right.length} frames. Right edge ${right[0]} closed to ${open} open, at ${edges.width}x${edges.height}.`);
console.log(`Wrote the light frames block in ${path.relative(root, MAIN)}.`);
