// The recording script: everything the teacher reads aloud for the Qaida, lesson by lesson, in Arabic. Built from the lessons' own
// files (marks.js, rules.js, the kits, rule-words.js, verse-words.js), so nothing is retyped and it changes when a lesson does.
//
//   node tools/recording-script.js                       writes docs/recordings/recording-script.html (open it, or print it)
//   node tools/recording-script.js --fragment <file>     the same page without <!doctype>/<head>, for publishing as an Artifact
//
// Lessons 1-16 are the 447 rows of recordings.html, in lesson order instead of marks.js order. Lessons 18-23 are the Qur'an's words,
// by reference; a reference is read once, however many lessons use it. Lesson 17 needs nothing new (docs/lesson-17/01 §7).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'site', 'qaida');

const store = new Map();
const ctx = vm.createContext({
  document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
  matchMedia: () => ({ matches: false }),
  setTimeout,
  clearTimeout,
});
ctx.window = ctx;
const FILES = ['shell.js', 'practice.js', 'marks.js', 'rules.js', 'rule-words.js', 'al.js', 'wasl.js', 'madd.js', 'silent.js', 'stop.js',
  'verse-words.js'];
for (const file of FILES) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file });
const { qaidaShell: shell, qaidaMarks: marks, qaidaRules: rules } = ctx;

const SCRIPTS = ['indopak', 'madani'];
// Quran.com's private-use signs in two Indo-Pak words: the verse page leaves them out when it draws, and so does this (docs/lesson-23/02).
const clean = (text) => text.replace(/[-]/g, '');
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const markOf = (id) => Object.values(marks.MARKS).find((m) => m.id === id);

// ---- Lessons 1-16: the sounds -------------------------------------------------------------------------------------------------------

function soundItems(kind) {
  const out = {};
  for (const script of SCRIPTS) {
    const items = [];
    if (kind === 'hamza-jazam') {
      const form = rules.formsOf().find((f) => f.seat === 'line' && f.mark === 'sukun');
      items.push({ ar: rules.drawnOf(form, script) });
    } else {
      const mark = kind === 'letters' ? null : markOf(kind);
      const skip = (mark && mark.skip) || [];
      for (const [glyph, name] of shell.lettersOf(script)) {
        if (skip.includes(shell.keyOf(glyph))) continue;
        items.push(mark ? { ar: marks.leadOf(mark, script) + marks.glyphOf(glyph, mark, script) } : { ar: glyph, sub: name });
      }
    }
    out[script] = items;
  }
  return out;
}

const SOUNDS = [
  { id: 'names', lesson: 'Lessons 1–3', kind: 'letters', title: 'Letter names', say: 'Say each letter’s name.', eg: 'Alif, Baa, Taa, Thaa …' },
  { id: 'l4', lesson: 'Lesson 4', kind: 'fatha', eg: 'a, ba, ta, tha …' },
  { id: 'l5', lesson: 'Lesson 5', kind: 'kasra', eg: 'i, bi, ti, thi …' },
  { id: 'l6', lesson: 'Lesson 6', kind: 'damma', eg: 'u, bu, tu, thu …' },
  { id: 'l7a', lesson: 'Lesson 7', kind: 'fathatain', eg: 'an, ban, tan …' },
  { id: 'l7b', lesson: 'Lesson 7', kind: 'kasratain', eg: 'in, bin, tin …' },
  { id: 'l7c', lesson: 'Lesson 7', kind: 'dammatain', eg: 'un, bun, tun …' },
  { id: 'l8', lesson: 'Lesson 8', kind: 'fatha-alif', eg: 'baa, taa, thaa …', note: 'Lesson 9’s khari zabar plays these too.' },
  { id: 'l10', lesson: 'Lesson 10', kind: 'fatha-waw', eg: 'baw, taw, thaw …' },
  { id: 'l11', lesson: 'Lesson 11', kind: 'damma-waw', eg: 'boo, too, thoo …', note: 'Lesson 9’s ulta paish plays these too.' },
  { id: 'l12', lesson: 'Lesson 12', kind: 'fatha-yaa', eg: 'bay, tay, thay …' },
  { id: 'l13', lesson: 'Lesson 13', kind: 'kasra-yaa', eg: 'bee, tee, thee …', note: 'Lesson 9’s khari zair plays these too.' },
  { id: 'l14', lesson: 'Lesson 14', kind: 'sukun', eg: 'ab, at, ath …', say: 'One closed sound each: the alif’s “a” and the letter shut. Do not spell it out.' },
  { id: 'l15a', lesson: 'Lesson 15', kind: 'shadda-fatha', eg: 'abba, atta, aththa …' },
  { id: 'l15b', lesson: 'Lesson 15', kind: 'shadda-kasra', eg: 'abbi, atti, aththi …' },
  { id: 'l15c', lesson: 'Lesson 15', kind: 'shadda-damma', eg: 'abbu, attu, aththu …' },
  { id: 'l16', lesson: 'Lesson 16', kind: 'hamza-jazam', title: 'Hamza with jazam', eg: 'ba’', say: 'One clip only.' },
];

const SOUND_SAY = 'The sound only. Do not spell it out, and do not name the mark.';

const sections = SOUNDS.map((s) => ({
  id: s.id,
  lesson: s.lesson,
  title: s.title || cap(markOf(s.kind).names.zabar),
  say: s.say || SOUND_SAY,
  eg: s.eg,
  note: s.note,
  shape: s.kind === 'letters' ? 'letter' : 'sound',
  groups: [{ items: soundItems(s.kind) }],
}));

// ---- Lessons 18-22: the Qur'an's words ------------------------------------------------------------------------------------------------

const seen = new Map(); // reference -> the section that reads it first

function wordSection({ id, lesson, title, kit: kitName, say, heads }) {
  const kit = rules.KITS[kitName];
  const groups = [];
  for (const form of kit.formsOf()) {
    if (seen.has(form.ref)) {
      if (seen.get(form.ref) !== id) console.warn(`  ${form.ref} is in ${seen.get(form.ref)} and ${id}: read once, in ${seen.get(form.ref)}`);
      continue;
    }
    seen.set(form.ref, id);
    const head = heads[form.kind] || '';
    let group = groups.find((g) => g.head === head);
    if (!group) groups.push((group = { head, items: { indopak: [], madani: [] } }));
    for (const script of SCRIPTS) group.items[script].push({ ar: clean(kit.textOf(form.ref, script)), ref: form.ref });
  }
  return { id, lesson, title, say, shape: 'word', groups };
}

sections.push(
  wordSection({
    id: 'l18', lesson: 'Lesson 18', title: 'Al-', kit: 'al',
    say: 'Read each word as printed, with its last vowel: al-ḥamdu, ash-shamsu.',
    heads: { moon: 'The laam is read', sun: 'The laam is not read', allah: 'Allah' },
  }),
  wordSection({
    id: 'l19', lesson: 'Lesson 19', title: 'The joining alif', kit: 'wasl',
    say: 'A word alone: start it as you would at the start of a verse. Two words: read them joined, as one.',
    heads: { start: 'Single words', read: 'Single words', joined: 'Two words, read joined', short: 'Two words, read joined',
      keep: 'Two words, read joined' },
  }),
  wordSection({
    id: 'l20', lesson: 'Lesson 20', title: 'The wavy line', kit: 'madd',
    say: 'Hold every long vowel for its full length, and the same length each time. The student is tested on the length by ear.',
    heads: { plain: 'No wavy line: normal length', word: 'Wavy line in the word: longer', 'plain-next': 'No wavy line: normal length',
      next: 'Wavy line before the next word: longer', heavy: 'Wavy line before a shadda: longest' },
  }),
  wordSection({
    id: 'l21', lesson: 'Lesson 21', title: 'Letters that are not read', kit: 'silent',
    say: 'Read each word as printed. Do not say the letters that are not read.',
    heads: { plural: '', ulee: '', aawow: '', none: '', not: '', read: '' },
  }),
  wordSection({
    id: 'l22', lesson: 'Lesson 22', title: 'Stopping', kit: 'stop',
    say: 'Read each word the way you say it when you stop on it: raḥmah, ʿajabaa, ar-raḥeem.',
    heads: { vowel: '', tanween: '', fathatain: '', taa: '', long: '', must: '', better: '', either: '', no: '' },
  }),
);

// ---- Lesson 23: Al-Fatiha ---------------------------------------------------------------------------------------------------------

const fatiha = ctx.qaidaVerseWords.surahs['1'].verses;
const verses = { indopak: [], madani: [] };
for (const verse of fatiha) {
  for (const script of SCRIPTS) {
    verses[script].push({ ar: clean(verse.words.map((w) => w[script]).join(' ')).replace(/\s+/g, ' ').trim(), ref: verse.key });
  }
}
sections.push({
  id: 'l23v', lesson: 'Lesson 23', title: 'Al-Fatiha, verse by verse', shape: 'verse',
  say: 'Recite each verse slowly, at teaching pace, every rule clear. Pause between verses.', groups: [{ items: verses }],
});

const words = { indopak: [], madani: [] };
const already = [];
for (const verse of fatiha) {
  for (const w of verse.words) {
    const ref = `${verse.key}:${w.position}`;
    if (seen.has(ref)) {
      already.push(`${ref} (${seen.get(ref).replace('l', 'Lesson ')})`);
      continue;
    }
    seen.set(ref, 'l23w');
    for (const script of SCRIPTS) words[script].push({ ar: clean(w[script]), ref });
  }
}
sections.push({
  id: 'l23w', lesson: 'Lesson 23', title: 'Al-Fatiha, word by word', shape: 'word',
  say: 'Each word alone, as printed, with its last vowel.',
  note: `${already.length} words are left out because an earlier lesson already reads them: ${already.join(', ')}.`,
  groups: [{ items: words }],
});

// ---- Counts, and the page ---------------------------------------------------------------------------------------------------------

const countOf = (section) => section.groups.reduce((n, g) => n + g.items.indopak.length, 0);
for (const section of sections) {
  const other = section.groups.reduce((n, g) => n + g.items.madani.length, 0);
  if (other !== countOf(section)) throw new Error(`${section.id}: ${countOf(section)} Indo-Pak items but ${other} Madani`);
}
const total = sections.reduce((n, s) => n + countOf(s), 0);
const sounds = sections.filter((s) => s.shape === 'letter' || s.shape === 'sound').reduce((n, s) => n + countOf(s), 0);
if (sounds !== 447) console.warn(`  sounds: ${sounds}, but recordings.html lists 447`);

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function grid(section, script) {
  let n = 0; // one run of numbers per sitting, across its headings: the order he reads in
  return section.groups.map((group) => {
    const cells = group.items[script].map((item) => {
      n += 1;
      const sub = item.sub ? `<span class="sub">${esc(item.sub)}</span>` : item.ref ? `<span class="ref">${esc(item.ref)}</span>` : '';
      return `<li><span class="n">${n}</span><span class="ar" lang="ar" dir="rtl">${esc(item.ar)}</span>${sub}</li>`;
    }).join('');
    const head = group.head ? `<h3>${esc(group.head)}</h3>` : '';
    return `${head}<ol class="cells ${section.shape}" dir="rtl">${cells}</ol>`;
  }).join('');
}

const sectionHtml = sections.map((s) => `
<section class="sitting" id="${s.id}">
  <header class="sitting-head">
    <div class="sitting-title">
      <p class="eyebrow">${esc(s.lesson)}</p>
      <h2>${esc(s.title)}</h2>
    </div>
    <label class="done"><input type="checkbox" id="done-${s.id}" data-id="${s.id}"> Recorded</label>
  </header>
  <p class="say"><strong>${esc(s.say)}</strong>${s.eg ? ` <span class="eg">${esc(s.eg)}</span>` : ''}</p>
  ${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}
  <p class="count">${countOf(s)} ${countOf(s) === 1 ? 'clip' : 'clips'}</p>
  <div class="grid" data-script="indopak">${grid(s, 'indopak')}</div>
  <div class="grid" data-script="madani">${grid(s, 'madani')}</div>
</section>`).join('\n');

const nav = sections.map((s) => `<a href="#${s.id}">${esc(s.lesson.replace('Lessons ', '').replace('Lesson ', ''))} · ${esc(s.title)}</a>`).join('');

const page = `<title>Qaida Recording Script</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600&family=Jost:wght@400;500;600&family=Noto+Naskh+Arabic:wght@400;500&display=swap">
<style>
/* A teacher's reading sheet: one column of sittings, each a header and an RTL grid of what to say, read right to left like a Qaida page. */
:root {
  --bg: #FAFAF9; --paper: #FFFFFF; --ink: #1C1917; --muted: #57534E; --line: #D6D3D1; --gold: #A16207; --gold-wash: #FBF3E2;
  --display: "Bodoni Moda", Georgia, "Times New Roman", serif;
  --body: "Jost", "Segoe UI", system-ui, sans-serif;
  --indopak: "Noto Naskh Arabic", "Traditional Arabic", "Arabic Typesetting", serif;
  --madani: "Amiri Quran", "Noto Naskh Arabic", "Traditional Arabic", serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #1C1917; --paper: #262220; --ink: #FAFAF9; --muted: #A8A29E; --line: #3F3A37; --gold: #D4AF37; --gold-wash: #2E2716; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #1C1917; --paper: #262220; --ink: #FAFAF9; --muted: #A8A29E; --line: #3F3A37; --gold: #D4AF37; --gold-wash: #2E2716; color-scheme: dark }
* { box-sizing: border-box; }
body { background: var(--bg); color: var(--ink); font: 16px/1.55 var(--body); margin: 0; }
.wrap { max-width: 1040px; margin: 0 auto; padding-inline: 16px; padding-block: 32px 64px; display: grid; gap: 28px; }
h1, h2 { font-family: var(--display); font-weight: 600; text-wrap: balance; margin: 0; letter-spacing: -0.01em; }
h1 { font-size: clamp(2rem, 5vw, 2.8rem); line-height: 1.1; }
h2 { font-size: 1.6rem; line-height: 1.2; }
h3 { font: 600 0.8rem/1.4 var(--body); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin: 18px 0 8px; }
p { margin: 0; }
.intro { display: grid; gap: 14px; }
.lede { color: var(--muted); max-width: 62ch; }
.rules { margin: 0; padding: 18px 20px 18px 38px; background: var(--gold-wash); border-radius: 10px; display: grid; gap: 6px; max-width: 70ch; }
.rules li::marker { color: var(--gold); font-weight: 600; }
.bar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; }
.toggle { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; padding: 3px; background: var(--paper); }
.toggle button { font: 500 0.95rem var(--body); color: var(--muted); background: none; border: 0; border-radius: 999px; padding: 6px 16px; cursor: pointer; }
.toggle button[aria-pressed="true"] { background: var(--ink); color: var(--bg); }
.toggle button:focus-visible, .done input:focus-visible, nav a:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
.totals { color: var(--muted); font-variant-numeric: tabular-nums; }
nav { display: flex; flex-wrap: wrap; gap: 6px; }
nav a { font-size: 0.85rem; color: var(--ink); text-decoration: none; border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; background: var(--paper); }
nav a.is-done { color: var(--muted); text-decoration: line-through; }
.sitting { background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 20px; display: grid; gap: 8px; min-width: 0; }
.sitting-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.eyebrow { font: 600 0.75rem/1.4 var(--body); text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold); }
.done { display: inline-flex; align-items: center; gap: 6px; font-size: 0.9rem; color: var(--muted); white-space: nowrap; cursor: pointer; }
.done input { width: 18px; height: 18px; accent-color: var(--gold); }
.sitting.is-done { opacity: 0.6; }
.say { max-width: 75ch; }
.eg { color: var(--muted); font-style: italic; }
.note { color: var(--muted); font-size: 0.9rem; max-width: 75ch; }
.count { color: var(--muted); font-size: 0.85rem; font-variant-numeric: tabular-nums; }
.grid { min-width: 0; }
.grid[hidden] { display: none; }
.cells { list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 8px; }
.cells.letter, .cells.sound { grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); }
.cells.word { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
.cells.verse { grid-template-columns: 1fr; }
.cells li { position: relative; border: 1px solid var(--line); border-radius: 8px; padding: 14px 8px 8px; display: grid; justify-items: center; gap: 2px; min-width: 0; }
.n { position: absolute; top: 4px; right: 7px; font-size: 0.7rem; color: var(--muted); font-variant-numeric: tabular-nums; direction: ltr; }
.ar { font-family: var(--indopak); font-size: 2rem; line-height: 2; text-align: center; overflow-wrap: anywhere; }
[data-script="madani"] .ar { font-family: var(--madani); }
.cells.word .ar { font-size: 1.75rem; }
.cells.verse li { justify-items: stretch; padding: 18px 16px 10px; }
.cells.verse .ar { font-size: 1.9rem; line-height: 2.3; text-align: right; }
.sub, .ref { font-size: 0.75rem; color: var(--muted); direction: ltr; font-variant-numeric: tabular-nums; }
@media (max-width: 480px) { .sitting { padding: 16px 14px; } .cells.word { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); } }
@media print {
  :root { --bg: #fff; --paper: #fff; --ink: #000; --muted: #444; --line: #bbb; --gold: #000; --gold-wash: #f3f3f3; }
  .toggle, nav, .done { display: none; }
  .wrap { padding-block: 0; gap: 16px; }
  .sitting { break-inside: avoid-page; border: 0; padding: 0; }
  .sitting.is-done { opacity: 1; }
  .cells li { break-inside: avoid; }
}
@media (prefers-reduced-motion: no-preference) { .sitting { transition: opacity 0.2s; } }
</style>

<div class="wrap">
  <header class="intro">
    <p class="eyebrow">Free Qaida · for the teacher</p>
    <h1>Qaida recording script</h1>
    <p class="lede">Everything the Qaida needs read aloud, lesson by lesson. Each box is one clip. Read each sitting right to left, top to bottom, in the order of the numbers.</p>
    <ol class="rules">
      <li>Say each box once, then pause for two seconds before the next.</li>
      <li>If you make a mistake, say it again. The last one is kept.</li>
      <li>From Lesson 4 on, say the sound only: “ba”, not “baa zabar ba”. Do not name the marks.</li>
      <li>A quiet room, the phone a hand’s length away, the same place every time.</li>
    </ol>
    <div class="bar">
      <div class="toggle" role="group" aria-label="Script">
        <button type="button" id="script-indopak" data-script="indopak" aria-pressed="true">Indo-Pak</button>
        <button type="button" id="script-madani" data-script="madani" aria-pressed="false">Madani</button>
      </div>
      <p class="totals"><span id="done-count">0</span> of ${sections.length} sittings recorded · ${total} clips in all</p>
    </div>
    <nav aria-label="Sittings">${nav}</nav>
  </header>
${sectionHtml}
</div>

<script>
(() => {
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };

  function setScript(script) {
    document.querySelectorAll('.grid').forEach((g) => { g.hidden = g.dataset.script !== script; });
    document.querySelectorAll('.toggle button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.script === script)));
    write('qaida-script-view', script);
  }
  document.querySelectorAll('.toggle button').forEach((b) => b.addEventListener('click', () => setScript(b.dataset.script)));
  setScript(read('qaida-script-view') === 'madani' ? 'madani' : 'indopak');

  let done = {};
  try { done = JSON.parse(read('qaida-script-done') || '{}') || {}; } catch { done = {}; }
  const boxes = [...document.querySelectorAll('.done input')];
  function paint() {
    boxes.forEach((box) => {
      box.checked = Boolean(done[box.dataset.id]);
      box.closest('.sitting').classList.toggle('is-done', box.checked);
      const link = document.querySelector('nav a[href="#' + box.dataset.id + '"]');
      if (link) link.classList.toggle('is-done', box.checked);
    });
    document.getElementById('done-count').textContent = boxes.filter((b) => b.checked).length;
  }
  boxes.forEach((box) => box.addEventListener('change', () => {
    done[box.dataset.id] = box.checked;
    write('qaida-script-done', JSON.stringify(done));
    paint();
  }));
  paint();
})();
</script>
`;

const fragmentAt = process.argv.indexOf('--fragment');
if (fragmentAt > -1) {
  const out = path.resolve(process.argv[fragmentAt + 1]);
  fs.writeFileSync(out, page);
  console.log(`wrote ${out}`);
}
const full = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${page.replace('</style>', '</style>\n</head>\n<body>')}\n</body>\n</html>\n`;
const outFile = path.join(root, 'docs', 'recordings', 'recording-script.html');
fs.writeFileSync(outFile, full);
console.log(`wrote ${outFile}`);
console.log(sections.map((s) => `  ${s.lesson.padEnd(12)} ${s.title.padEnd(28)} ${countOf(s)}`).join('\n'));
console.log(`  ${'total'.padEnd(41)} ${total} (sounds ${sounds}, words and verses ${total - sounds})`);
