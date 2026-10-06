// Copies the Qur'an words a rule lesson uses, exactly, from the Quran.com API into site/qaida/rule-words.js, in BOTH scripts, so no
// Qur'an word is ever typed by hand (docs/pass-2/02 §3). A lesson names its words by reference only, as "surah:verse:position" (Lesson
// 18's are in site/qaida/al.js); this script reads every such reference out of the kit files below and saves what Quran.com sends,
// unmodified. Nothing is normalised, trimmed or "fixed": a word is what the mushaf prints.
//
//   node tools/fetch-qaida-words.js
//
// text_uthmani is the Madani script and text_indopak the Indo-Pak one (docs/pass-2/01). The output is a small JS file, not JSON, so a
// lesson page can read it synchronously from a <script> and the node checks can load it the way they load every other file: the one
// change from docs/pass-2/02 §3, which said rule-words.json. tools/qaida-lesson18-check.js proves every reference a kit names is in it.
//
// This window cannot show Arabic properly, so the script prints references and code-point counts, never the words themselves.

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'site', 'qaida');
const KIT_FILES = ['al.js', 'wasl.js', 'madd.js', 'silent.js', 'stop.js']; // each later rule lesson that copies Qur'an words adds its kit file here
const OUT = path.join(dir, 'rule-words.js');
const API = 'https://api.quran.com/api/v4/verses/by_key';

// A reference is "surah:verse:position", or "surah:verse:first-last" for a PAIR of words (Lesson 19, docs/lesson-19/01 §2): the pair is
// saved under that reference, its two words joined by a single space, each exactly as Quran.com sends it.
const REF = /['"](\d{1,3}:\d{1,3}:\d{1,3}(?:-\d{1,3})?)['"]/g;

async function verse(key) {
  const res = await fetch(`${API}/${key}?words=true&word_fields=text_uthmani,text_indopak`);
  if (!res.ok) throw new Error(`Quran.com answered ${res.status} for ${key}`);
  const body = await res.json();
  if (!body.verse || !Array.isArray(body.verse.words)) throw new Error(`No words came back for ${key}`);
  return body.verse.words;
}

(async () => {
  const refs = new Set();
  for (const file of KIT_FILES) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    for (const m of text.matchAll(REF)) refs.add(m[1]);
  }
  if (!refs.size) throw new Error(`No references like "1:2:1" found in ${KIT_FILES.join(', ')}`);

  const byVerse = new Map();
  for (const ref of refs) {
    const [surah, ayah, place] = ref.split(':');
    const key = `${surah}:${ayah}`;
    if (!byVerse.has(key)) byVerse.set(key, []);
    byVerse.get(key).push(place);
  }

  const words = {};
  for (const [key, places] of byVerse) {
    const list = await verse(key);
    for (const place of places) {
      const [first, last = first] = place.split('-').map(Number);
      const picked = [];
      for (let position = first; position <= last; position += 1) {
        const w = list.find((item) => item.position === position && item.char_type_name === 'word');
        if (!w || !w.text_uthmani || !w.text_indopak) throw new Error(`No word at ${key}:${position}`);
        picked.push(w);
      }
      const joined = (field) => picked.map((w) => w[field]).join(' ');
      words[`${key}:${place}`] = { madani: joined('text_uthmani'), indopak: joined('text_indopak') };
      console.log(`${key}:${place} ok  (${[...joined('text_uthmani')].length} and ${[...joined('text_indopak')].length} code points)`);
    }
  }

  const sorted = Object.fromEntries(Object.entries(words).sort(([a], [b]) => {
    const [as, av, ap] = a.split(':').map(parseFloat);
    const [bs, bv, bp] = b.split(':').map(parseFloat);
    return as - bs || av - bv || ap - bp;
  }));
  const data = {
    source: 'Quran.com API v4: text_uthmani (Madani) and text_indopak (Indo-Pak), word by word, unmodified',
    fetched: new Date().toISOString().slice(0, 10),
    words: sorted,
  };
  const header = [
    '// The Qur\'an words the rule lessons use, copied by tools/fetch-qaida-words.js from Quran.com. DO NOT EDIT BY HAND: run the script.',
    '// A word is named by "surah:verse:position" and is saved exactly as Quran.com sends it, in both scripts (docs/pass-2/02 §3).',
    '',
  ].join('\n');
  // Every non-ASCII character is written as a \uXXXX escape: the same string when the file loads, but a combining mark is never a
  // character you cannot see in an editor or a diff (docs/lesson-4/02 §1). Exact, not edited.
  const ascii = JSON.stringify(data, null, 2).replace(/[\u0080-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
  fs.writeFileSync(OUT, `${header}window.qaidaRuleWords = ${ascii};\n`, 'utf8');
  console.log(`Saved ${Object.keys(sorted).length} words to ${OUT}`);
})().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
