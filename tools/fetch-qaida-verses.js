// Copies whole surahs, verse by verse and word by word, exactly, from the Quran.com API into site/qaida/verse-words.js, in BOTH scripts, so no verse
// is ever typed by hand (docs/pass-2/02 §3; docs/lesson-23/01 §2). The verse page (verses.js, Lesson 23 and later Lesson 29) names a word by
// reference only, "surah:verse:position", and draws every verse from this file.
//
//   node tools/fetch-qaida-verses.js            the surahs in SURAHS below (today: Al-Fatiha)
//   node tools/fetch-qaida-verses.js 1 105-114  or name them: a surah, or a range of surahs
//
// text_uthmani is the Madani script and text_indopak the Indo-Pak one (docs/pass-2/01). Only the WORDS of a verse are saved: Quran.com sends each
// verse's end sign as one more "word" (char_type_name "end"), which in its Indo-Pak text is a private-use character that only its own font draws
// (docs/pass-2/01 §9). The page draws the verse-end sign itself, as the title glyphs of Lessons 22 and 23 do, so the saved words hold nothing that
// would show as a box. Nothing is normalised, trimmed or "fixed": a word is what the mushaf prints.
//
// The output is a small JS file, not JSON, for the reason rule-words.js is (a page reads it synchronously from a <script>, and the checks load it as
// they load every other file). Its `hash` is the SHA-256 of the saved surahs: tools/qaida-lesson23-check.js recomputes it, so a hand edit is found.
//
// This window cannot show Arabic properly, so the script prints references and CODE POINTS (hex), never the words themselves.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUT = path.join(__dirname, '..', 'site', 'qaida', 'verse-words.js');
const API = 'https://api.quran.com/api/v4';
const SURAHS = [1]; // each later verse lesson adds its surahs here (Lesson 29: 105 to 114)

async function get(url, what) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Quran.com answered ${res.status} for ${what}`);
  return res.json();
}

const hex = (text) => [...text].map((c) => c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
const isPrivate = (text) => [...text].some((c) => c.codePointAt(0) >= 0xE000 && c.codePointAt(0) <= 0xF8FF);

// "1" or "105-114" -> [1] or [105 ... 114]
function surahsFrom(args) {
  if (!args.length) return SURAHS;
  const out = [];
  for (const arg of args) {
    const m = /^(\d{1,3})(?:-(\d{1,3}))?$/.exec(arg);
    if (!m) throw new Error(`Not a surah or a range of surahs like 1 or 105-114: ${arg}`);
    const from = Number(m[1]);
    const to = Number(m[2] ?? from);
    if (from < 1 || to > 114 || to < from) throw new Error(`Surahs run from 1 to 114: ${arg}`);
    for (let n = from; n <= to; n += 1) out.push(n);
  }
  return out;
}

(async () => {
  const surahs = {};
  for (const n of surahsFrom(process.argv.slice(2))) {
    const chapter = (await get(`${API}/chapters/${n}`, `surah ${n}`)).chapter;
    if (!chapter || !chapter.name_simple || !Number.isInteger(chapter.verses_count)) throw new Error(`No surah ${n} came back`);
    const verses = [];
    for (let v = 1; v <= chapter.verses_count; v += 1) {
      const key = `${n}:${v}`;
      const body = await get(`${API}/verses/by_key/${key}?words=true&word_fields=text_uthmani,text_indopak`, key);
      if (!body.verse || !Array.isArray(body.verse.words)) throw new Error(`No words came back for ${key}`);
      const all = body.verse.words;
      const words = all.filter((w) => w.char_type_name === 'word');
      const end = all.find((w) => w.char_type_name === 'end');
      words.forEach((w, i) => {
        if (w.position !== i + 1 || !w.text_uthmani || !w.text_indopak) throw new Error(`Word ${i + 1} of ${key} is not in place`);
      });
      verses.push({ key, words: words.map((w) => ({ position: w.position, madani: w.text_uthmani, indopak: w.text_indopak })) });
      for (const w of words) {
        const flag = isPrivate(w.text_indopak) || isPrivate(w.text_uthmani) ? '  PRIVATE-USE CHARACTER IN A WORD' : '';
        console.log(`${key}:${w.position}  madani ${hex(w.text_uthmani)}  |  indopak ${hex(w.text_indopak)}${flag}`);
      }
      // What Quran.com sends as the verse's end, shown and not saved: the page draws its own.
      if (end) console.log(`${key} end (not saved)  madani ${hex(end.text_uthmani || '')}  |  indopak ${hex(end.text_indopak || '')}`);
    }
    surahs[String(n)] = { name: chapter.name_simple, count: chapter.verses_count, verses };
  }

  const hash = crypto.createHash('sha256').update(JSON.stringify(surahs)).digest('hex');
  const data = {
    source: 'Quran.com API v4: text_uthmani (Madani) and text_indopak (Indo-Pak), verse by verse and word by word, unmodified; the verse-end signs are not saved',
    fetched: new Date().toISOString().slice(0, 10),
    hash,
    surahs,
  };
  const header = [
    '// The Qur\'an verses the verse page uses, copied by tools/fetch-qaida-verses.js from Quran.com. DO NOT EDIT BY HAND: run the script.',
    '// A word is named by "surah:verse:position" and is saved exactly as Quran.com sends it, in both scripts (docs/lesson-23/01 §2).',
    '',
  ].join('\n');
  // Every non-ASCII character is written as a \uXXXX escape: the same string when the file loads, but a combining mark is never a character you
  // cannot see in an editor or a diff (docs/lesson-4/02 §1). Exact, not edited. The hash is of the surahs as plain JSON, before this step.
  const ascii = JSON.stringify(data, null, 2).replace(/[\u0080-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
  fs.writeFileSync(OUT, `${header}window.qaidaVerseWords = ${ascii};\n`, 'utf8');
  const total = Object.values(surahs).reduce((sum, s) => sum + s.verses.reduce((n, v) => n + v.words.length, 0), 0);
  console.log(`Saved ${total} words of ${Object.keys(surahs).length} surah(s) to ${OUT}`);
  console.log(`hash ${hash}`);
})().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
